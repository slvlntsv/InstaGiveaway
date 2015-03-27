angular.module('giveaways.controllers', [])

    .controller('RootCtrl', function($scope,$ionicLoading,profile,instagram, $location,$ionicModal,$cordovaOauth,$cordovaFileOpener2,$state,registerNotifications,$cordovaDevice,$rootScope,$cordovaEmailComposer,$ionicSideMenuDelegate,giveawayDecor,previewStorage,$ionicSlideBoxDelegate,server,$cordovaImagePicker,$cordovaActionSheet,$timeout,$ionicPopover ) {
        $scope.c={}
        $scope.c.refreshTimeStamp=-1
        $scope.c.refreshPeriod=30
        registerNotifications()

        $scope.c.toggleRight = function() {
            $ionicSideMenuDelegate.toggleRight();
        };

        $scope.c.showLoading = function () {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios"></ion-spinner>'

            });
        };


        $scope.c.pushState = function(state,href)
        {
            location.href=state
            location.href=$scope.$eval('"'+href+'"',$scope)
            //$rootScope.$broadcast('state:'+state,{href:$scope.$eval('"'+href+'"',$scope)});
        }

//        $scope.c.openBoost = function(event,giveaway) {
//
//            $ionicPopover.fromTemplateUrl('templates/boost.html', {
//                scope: $scope
//            }).then(function(popover) {
//                $scope.giveaway = giveaway
//                $scope.c.boost = popover
//                $scope.c.boost.show(event)
//
//            });
//        };
//
//        $scope.c.buyBoost = function(giveaway)
//        {
//            $scope.c.showLoading()
//            $timeout(function()
//            {
//                $scope.c.hideLoading()
//
//                $ionicLoading.show({
//                    template:' <h1 class="animated flip"><i class="icon ion-ios-bolt energized"></i></h1>',
//                    noBackdrop:false,
//                    duration:1000
//                });
//
//
//                giveaway.boost=2
//                $scope.c.boost.hide()
//            },1000)
//
//        }
        $scope.c.notifyErr = function (code) {
            var message = "Damn!!11"
            switch(code*1)
            {
                case 10:
                    message = "WW not exists. Sorry :("
                    break;
                case 11:
                    message = "Empty Wanna Win."
                    break;
                case 400:
                    message = "Now such media in instagram."
                    break;
            }
            message = "<h2><i class='positive ion-sad'></i></h2><br><small>"+message+"</small>"
            $ionicLoading.show({
                template:'<span style="color:white;">'+message+"</span>",
                noBackdrop:false,
                duration:1000
            });
        };
        $scope.c.hideLoading = function () {
            $ionicLoading.hide();
        };


        $scope.c.showLike = function () {
            $ionicLoading.show({
                template: '<h1><i class="icon ion-ios-heart" style="font-size:30px;"></i></h1>'
            });
        };
        $scope.c.hideLike = function () {
            $ionicLoading.hide();
        };
        $scope.c.logout = function()
        {
            $scope.c.showLoading()
            instagram.logout.get({},function()
            {
                $scope.c.hideLoading()
                profile.logout()
                location.href = "#/tab/feed"
                location.reload()
            })

        }
        $scope.c.complexSorting = function(a,b) {
            if(b.showFinished==true)
                return 10000

            if(a.showFinished==true)
                return -10000
            return b.creation_timestamp - a.creation_timestamp
        }
        $scope.c.getUserInfo = function(callback)
        {
            if(((new Date()).getTime()/1000-$scope.c.refreshTimeStamp)<$scope.c.refreshPeriod)
            {
                if(callback)
                    callback()
            }
            else
            {
                $scope.c.userInstagram = instagram.users.get({user:"self"},function()
                {
                    $scope.c.userInfo = server.getUserInfo.get({},function(data)
                    {
                        $scope.c.refreshTimeStamp = (new Date()).getTime()/1000
                        $scope.c.userInfo.data.giveaways.sort($scope.c.complexSorting)
                        $scope.c.userInfo.data.participating.sort($scope.c.complexSorting)
                        if(callback)
                        {
                            callback()
                        }
                    },function(error)
                    {
                        $scope.c.notifyErr(error.data.errorCode)
                    })
                },function(error)
                {
                    if(error.data.error_type=="OAuthAccessTokenException" && profile.valid())
                    {
                        $scope.c.logout()
                    }
                    else if(!profile.valid())
                    {

                    }
                    else
                    {
                        $scope.c.notifyErr(error.data.code || error.data.meta.code )
                    }
                })
            }

        }

        document.addEventListener("resume", (function($scope){

            return function()
            {
                setTimeout($scope.c.getUserInfo,0)
            }

        })($scope), false);


        $scope.c.report = function(giveawayImageSrc,giveAwayHashTag, giveAwayMediaId, giveAwayAuthor)
        {
            var device = $cordovaDevice.getDevice();

            var cordova = $cordovaDevice.getCordova();

            var model = $cordovaDevice.getModel();

            var platform = $cordovaDevice.getPlatform();

            var uuid = $cordovaDevice.getUUID();

            var version = $cordovaDevice.getVersion();


            var email = {
                to: 'giveaway.support@gmail.com',
                subject: 'Giveaway #'+giveAwayHashTag+' issue',
                body: "Hi there!<br> <b>Issue:</b><br><i>Type here...</i><br><br><small>Technical info(please do not delete it):<br>" +
                    "<b>Giveaway:</b> <img style='width:100%;' src='"+giveawayImageSrc+"' /><br>"+
                    "<b>Giveaway mediaId:</b> "+giveAwayMediaId+"<br>"+
                    "<b>Giveaway author:</b> "+giveAwayAuthor+"<br>"+
                    "<b>Sender cordova:</b> "+cordova+"<br>"+
                    "<b>Sender model:</b> "+model+"<br>"+
                    "<b>Sender platform:</b> "+platform+"<br>"+
                    "<b>Sender uuid:</b> "+uuid+"<br>"+
                    "<b>Sender version:</b> "+version+"<br>"+
                    "<small>"+(new Date())+"</small></small>",
                isHtml: true
            };

            $cordovaEmailComposer.open(email).then(null, function () {
                // user cancelled email
            });
        }
        $scope.c.submit_giveaway = function(media_id, hashtag)
        {
            $scope.c.submit={}
            $scope.c.submit.ribbon=1

            $scope.c.submit.fillCanvas = function()
            {
                var canvas=document.getElementById("giveaway_canvas");
                if($scope.c.submit.type=="new")
                    canvas.className = "animated fadeOut";
                var ctx=canvas.getContext("2d");
                canvas.width=640
                canvas.height=640
                ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
                var img = new Image()
                img.onload=function()
                {
                    ctx.drawImage(img,0,0 ,img.width,img.height,0,0,640,640);
                    if($scope.c.submit.type=="new")
                    {
                        var ribbon = new Image()
                        ribbon.onload=function()
                        {
                            ctx.drawImage(ribbon,0,0 ,ribbon.width, ribbon.height,0,0,ribbon.width, ribbon.height);
                            canvas.className = "animated fadeIn";
                        }
                        ribbon.src="img/ribbons/ribbon_0"+$scope.c.submit.ribbon+".png"
                    }
                    canvas.className = "animated fadeIn";
                }
                img.src= $scope.c.submit.imageUrl


            }
            $scope.c.submit.setRibbon = function(ribbonId)
            {
                if($scope.c.submit.ribbon!=ribbonId)
                {
                    $scope.c.submit.ribbon=ribbonId
                    $scope.c.submit.fillCanvas()
                }
            }
            $scope.c.submit.share = function()
            {
                var desc = "Description..."
                if($scope.c.submit.post!=undefined)
                {
                    desc = $scope.c.submit.post.data.caption.text.split('Wanna win?')[0]
                }

                var caption  = desc+'\n\n\n\nWanna win? Install WannaWin app\n #'+$scope.c.submit.hashtag
                if($scope.c.submit.type=="join")
                {
                    caption+=" repost of @"+$scope.c.submit.author.username
                }
                $cordovaFileOpener2.open(
                    $scope.c.submit.storedURI,
                    'com.instagram.exclusivegram',
                    {InstagramCaption:caption}
                ).then(function() {
                        $scope.shareClicked = true
                    }, function(err) {
                        //@TODO: What to do...
                    });
            }
            $scope.c.submit.create = function()
            {
                var options = {GiveawayMediaID:$scope.c.submit.media_id,HashtagID:$scope.c.submit.hashtag}
                var expire = $scope.c.submit.days*86400+Math.floor((new Date()).getTime()/1000)
                $scope.c.showLoading()
                if($scope.c.submit.type=="new")
                {
                    options.ExpirationTimestamp=expire
                    $scope.c.userInfo = server.submitGiveaway.get(options,function(data)
                    {
                        $scope.c.refreshTimeStamp = (new Date()).getTime()/1000
                        $scope.c.userInfo.data.giveaways.sort($scope.c.complexSorting)
                        $scope.c.userInfo.data.participating.sort($scope.c.complexSorting)
                        $scope.c.hideLoading()
                        $scope.c.submit.close()
                        $scope.c.pushState("#/tab/giveaways","/giveaways/giveaway/"+$scope.c.submit.media_id)
//                        $state.go("tab.giveaways")
//                        $state.go("tab.giveaways-giveaway-details",{media_id:$scope.c.submit.media_id})
                    },function(error)
                    {
                        $scope.c.hideLoading()
                        $scope.c.notifyErr(error.data.errorCode)
                    })
                }
                else if($scope.c.submit.type=="join")
                {
                    $scope.c.userInfo = server.joinGiveaway.get(options,function()
                    {
                        $scope.c.refreshTimeStamp = (new Date()).getTime()/1000
                        $scope.c.userInfo.data.giveaways.sort($scope.c.complexSorting)
                        $scope.c.userInfo.data.participating.sort($scope.c.complexSorting)
                        $scope.c.hideLoading()
//                        $state.go("tab.joined")
//                        $state.go("tab.joined-giveaway-details",{media_id:$scope.c.submit.media_id})
                        $scope.c.pushState("#/tab/joined","/joined/giveaway/"+$scope.c.submit.media_id)
                        $scope.c.submit.close()
                    },function(error)
                    {
                        $scope.c.hideLoading()
                        $scope.c.notifyErr(error.data.errorCode)
                    })
                }

            }
            $scope.c.submit.showModal = function()
            {
                $scope.shareClicked = true
                $ionicModal.fromTemplateUrl('templates/create-giveaway.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                    backdropClickToClose: true,
                    hardwareBackButtonClose: false
                }).then(function (modal) {
                    $scope.c.submit.modal = modal
                    $ionicSlideBoxDelegate.enableSlide(false)
                    $scope.c.submit.active_slide = 0
                    $scope.c.submit.close = function () {
                        $scope.c.submit.modal.remove()
                    };

                    $scope.c.submit.nextStep = function() {
                        $ionicSlideBoxDelegate.next();
                        if($scope.c.submit.active_slide==0)
                        {
                            var canvas=document.getElementById("giveaway_canvas")
                            var imgData=canvas.toDataURL("image/jpeg");
                            previewStorage.setPreview($scope.c.submit.hashtag,imgData, function(fileURI)
                            {
                                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                                    $scope.c.submit.storedURI = fileSystem.root.nativeURL + fileURI
                                })

                            },function(error)
                            {

                            })
                            $scope.shareClicked = false
                        }
                        else if($scope.c.submit.active_slide==1)
                        {
                            $scope.c.showLoading()
                            instagram.users.get({user:"self",action:"media",type:"recent"}, function(data)
                            {
                                var foundMatches = data.data.filter(function(post) {return post.caption!=undefined && post.caption.from.id==profile.instagram_id()}).filter(function(post){return post.tags.indexOf($scope.c.submit.hashtag.toLocaleLowerCase())!=-1}).length
                                $scope.c.hideLoading()
                                if(foundMatches>0)
                                {
                                    if($scope.c.submit.media_id==undefined)
                                    {
                                        $scope.c.submit.media_id = data.data[0].id
                                        $scope.c.submit.days = 1
                                        $scope.c.submit.done = true
                                    }
                                    else
                                    {
                                        instagram.media.save({action:$scope.c.submit.media_id,type:'likes'},{},function()
                                        {
                                            $scope.c.submit.liked=true
                                            instagram.follow.save({userId:$scope.c.submit.author.id},{action:"follow"},function()
                                            {
                                                $scope.c.submit.followed=true
                                                $scope.c.submit.done = true
                                            })
                                        })
                                    }
                                }
                                else
                                {
                                    $ionicSlideBoxDelegate.previous();
                                }
                            })
                        }

                        console.log($ionicSlideBoxDelegate.currentIndex())


                    }
                    $scope.c.submit.modal.show()
                    $scope.c.submit.fillCanvas()

                })
            }
            $scope.c.submit.selectImage = function()
            {
                $cordovaImagePicker.getPictures({
                    maximumImagesCount: 1,
                    width: 640,
                    quality: 100
                })
                    .then(function (results) {
                        $scope.c.submit.imageUrl =  results[0]
                        if($scope.c.submit.modal == undefined)
                            $scope.c.submit.showModal()
                        else
                            $scope.c.submit.fillCanvas()
                        $scope.c.submit.hashtag = giveawayDecor.generateHashTag()
                        $scope.c.submit.type='new'
                    }, function(error) {
                        // error getting photos
                    });
            }
            if(media_id==undefined)
            {


                // Show the action sheet
                $cordovaActionSheet.show({
                    buttonLabels: [
                        'Choose existing photo'
                    ],
                    title: 'Select WW square image',
                    addCancelButtonWithLabel: 'Cancel',
                    androidEnableCancelButton : true,
                    winphoneEnableCancelButton : true
                }).then(function(btnIndex) {
                    if(btnIndex!=2)
                    {
                        $scope.c.submit.selectImage()
                    }
                });





            }else
            {
                $scope.c.showLoading()
                $scope.c.submit.media_id = media_id
                $scope.c.submit.hashtag = hashtag
                $scope.c.submit.type='join'
                $scope.c.submit.post = instagram.media.get({action: $scope.c.submit.media_id}, function (data) {

                    $scope.c.hideLoading()
                    $scope.c.submit.imageUrl = data.data.images.standard_resolution.url
                    $scope.c.submit.author = data.data.user
                    $scope.c.submit.showModal()
                })
            }

        }



        if(!profile.valid())
        {
            if($location.search().access_token!=undefined)
            {

                profile.access_token($location.search().access_token)
                profile.instagram_id($location.search().access_token.split('.')[0])
                instagram.reinit()
                instagram.users.get({user:"self"},function(data)
                {
                    profile.instagram_avatar(data.data.profile_picture)
                    profile.instagram_username(data.data.username)
                    location.href = "#/tab/feed"
                    location.reload()
                })


            }
            else
            {

                $ionicModal.fromTemplateUrl('instagram_login', {
                    scope: $scope,
                    animation: 'slide-in-up',
                    backdropClickToClose: false,
                    hardwareBackButtonClose:false
                }).then(function(modal)
                {
                    $scope.c.login_modal = modal
                    $scope.c.login_modal.show()


                    $scope.c.login_modal.login = function()
                    {
                        $cordovaOauth.instagram("d9da9ac6196344e1b93442fe846eabef",["likes","comments","relationships"]).then(function(result) {
                            profile.access_token(result.access_token)
                            profile.instagram_id(result.access_token.split('.')[0])
                            instagram.reinit()
                            instagram.users.get({user:"self"},function(data)
                            {
                                profile.instagram_avatar(data.data.profile_picture)
                                profile.instagram_username(data.data.username)
                                $scope.c.login_modal.remove()
                                location.href = "#/tab/feed"
                                location.reload()
                            })
                        }, function(error) {

                        });
                    }


                })

            }
        }



    })
    .controller('FeedCtrl', function($scope,$stateParams,profile,server,instagram,$timeout,$ionicScrollDelegate,giveawayDecor) {



        $scope.loadMoreTimes=0
        $scope.clearSearch = function()
        {
            $scope.searchQuery = undefined
        }
        $scope.doRefresh = function()
        {
            $scope.c.getUserInfo(function()
            {
                $scope.fillFeed()
            })
        }
        $scope.loadMore = function()
        {
            if($scope.feed==undefined || $scope.feed.data==undefined || $scope.next_max_id==undefined || $scope.layout!="posts")
            {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            else
            {
                if($scope.loadMoreTimes>100)
                {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    return
                }
                var results = instagram.users.get({user:"self",action:"feed",max_id:$scope.next_max_id}).$promise;
                results.then(function(data)
                {
                    $scope.loadMoreTimes++
                    $scope.next_max_id = data.pagination.next_max_id
                    data.data=data.data.filter(giveawayDecor.filterPosts)
                    data.data.map(function(post)
                    {
                        var fileredPost =  giveawayDecor.decoratePost(post,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                        post.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)

                    })
                    $scope.feed.data = $scope.feed.data.concat(data.data.filter($scope.uniqueHashtags));


                }).finally(function() {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                })
            }
        }
        $scope.addAdditional = function()
        {
            for(var index in $scope.c.userInfo.data.additional)
            {
                var giveaway = $scope.c.userInfo.data.additional[index]
                if($scope.showedTags.indexOf(giveaway.hashtag)==-1) {
                    instagram.media.get({action: giveaway.media_id}, (function (giveaway) {
                        return function (data) {

                            if ($scope.showedTags.indexOf(giveaway.hashtag) == -1) {
                                $scope.showedTags.push(giveaway.hshtag)
                                data.data.giveaway = giveaway
                                data.data.giveaway.type = "unjoined"
                                data.data.giveawayHashtag = giveaway.hashtag
                                $scope.feed.data.push(data.data)
                            }
                        }
                    })(giveaway))
                }
            }
        }

        $scope.uniqueHashtags = function(post)
        {
            if($scope.showedTags.indexOf(post.giveawayHashtag)==-1)
            {
                $scope.showedTags.push(post.giveawayHashtag)
                return true
            }
            return false
        }
        $scope.fillFeed = function()
        {

            $scope.showedTags = []
            if($scope.searchQuery==undefined || $scope.searchQuery=="")
            {
                $scope.layout = "posts"
                var results = instagram.users.get({user:"self",action:"feed"}).$promise;
                results.then(function(data)
                {
                    $scope.next_max_id = data.pagination.next_max_id
                    data.data=data.data.filter(giveawayDecor.filterPosts)
                    data.data.map(function(post)
                    {
                        var fileredPost =  giveawayDecor.decoratePost(post,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                        post.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)
                    })
                    $scope.feed={}
                    $scope.feed.data = data.data.filter($scope.uniqueHashtags)
                    $scope.addAdditional()
                    $ionicScrollDelegate.scrollTop(0)
                    $scope.c.hideLoading()

                },function()
                {
                    $scope.feed = undefined
                    $scope.c.hideLoading()
                }).finally(function() {
                    $scope.$broadcast('scroll.refreshComplete')
                })
            }
            else if($scope.searchQuery.indexOf("http")!=-1)
            {
                $scope.layout = "posts"
                var postShortCode = /\/p\/([^\/]+)\/?/g;
                var match = postShortCode.exec($scope.searchQuery);
                if(match !=undefined && match[1] !=undefined)
                {
                    var results =  instagram.media.get({action:"shortcode",type:match[1]}).$promise;
                    results.then(function(data)
                    {
                        data.data=[data.data]
                        data.data=data.data.filter(giveawayDecor.filterPosts)
                        data.data.map(function(post)
                        {
                            var fileredPost =  giveawayDecor.decoratePost(post,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                            post.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)
                        })
                        $scope.feed = data
                        $ionicScrollDelegate.scrollTop(0)
                        $scope.c.hideLoading()

                    },function()
                    {
                        $scope.feed = undefined
                        $scope.c.hideLoading()
                    }).finally(function() {
                        $scope.$broadcast('scroll.refreshComplete')
                    })
                }
                else
                {
                    $scope.feed = undefined
                    $scope.c.hideLoading()
                }
            }
            else if($scope.searchQuery.indexOf("#")!=-1)
            {
                $scope.layout = "posts"
                var results =  instagram.hashes.get({tag:$scope.searchQuery.split("#")[1],action:"media",type:"recent"}).$promise;
                results.then(function(data)
                {
                    data.data=data.data.filter(giveawayDecor.filterPosts)
                    data.data.map(function(post)
                    {
                        var fileredPost =  giveawayDecor.decoratePost(post,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                        post.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)
                    })
                    $scope.feed = data
                    $ionicScrollDelegate.scrollTop(0)
                    $scope.c.hideLoading()

                },function()
                {
                    $scope.feed = undefined
                    $scope.c.hideLoading()
                }).finally(function() {
                    $scope.$broadcast('scroll.refreshComplete')
                })
            }
            else
            {

                if($scope.searchQuery.indexOf("@")!=-1)
                    $scope.searchQuery = $scope.searchQuery.split("@")[1]

                var results =  instagram.users.get({user:"search",q:$scope.searchQuery}).$promise;
                results.then(function(data)
                {

                    $scope.feed = data

                    $scope.layout = "users"
                    $ionicScrollDelegate.scrollTop(0)
                    $scope.c.hideLoading()
                },function()
                {
                    $scope.feed = undefined
                    $scope.c.hideLoading()
                }).finally(function() {
                    $scope.$broadcast('scroll.refreshComplete')
                })
            }
        }

        $scope.c.getUserInfo(function()
        {
            $scope.$watch("searchQuery",function(){
                $timeout.cancel($scope.delayedSearch)
                $scope.delayedSearch  = $timeout(function()
                {
                    if(profile.valid())
                    {
                        $scope.feed=undefined
                        $scope.c.showLoading()
                        $scope.fillFeed()
                    }
                },1000)
            })
        })

    })

    .controller('JoinedCtrl', function($scope,$stateParams,instagram,giveawayDecor,$timeout ) {
        $scope.layout = "posts"
        $scope.lazyTimout = 0
        $scope.c.showLoading()
        $scope.refreshJoin = function()
        {

            $scope.quantity = $scope.c.userInfo.data.participating
            for(var index in $scope.c.userInfo.data.participating)
            {
                instagram.media.get({action:$scope.c.userInfo.data.participating[index].media_id},(function(index) { return function(data)
                {
                    $scope.participating =$scope.participating || []
                    var fileredPost =  giveawayDecor.decoratePost(data.data,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                    data.data.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)

                    $scope.participating[index]=(data.data)
                }})(index))
            }
        }
        $scope.c.getUserInfo(function()
        {
            $scope.c.hideLoading()
            $scope.$watch("c.userInfo.data.participating",function()
            {
                if($scope.c.userInfo !=undefined && $scope.c.userInfo.data !=undefined && $scope.c.userInfo.data.participating.length!=0 && $scope.c.userInfo.data.participating!=$scope.quantity)
                {
                    $timeout.cancel($scope.lazyTimout)
                    $scope.lazyTimeout = $timeout($scope.refreshJoin,500)
                }
            },true)
        })




    })

    .controller('GiveAwayDetailCtrl', function($scope,server, $stateParams,post,instagram,giveawayDecor,$ionicHistory,$interval) {

        $scope.c.showLoading()
        $scope.loadingFadeIn = true

        $scope.refreshGiveaway = function()
        {
            var type = $scope.post.giveaway.type
            $scope.post.giveaway= server.getGiveaway.get({HashtagID:giveawayDecor.filterPosts($scope.post)}).$promise.then(
                function(giveaway)
                {
                    $scope.c.hideLoading()
                    $scope.loadingFadeIn = true
                    $scope.post.giveaway = giveaway.data[0]
                    $scope.post.giveaway.type=type
                    $scope.$broadcast('scroll.refreshComplete');
                }
                ,function(error)
                {
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.c.notifyErr(error.data.errorCode)
                    $ionicHistory.goBack()
                })
        }
        $scope.loadGiveaway = function()
        {

            if(!$scope.loadingFadeIn)
            {
                $scope.$broadcast('scroll.refreshComplete');
                return
            }
            else
            {
                $scope.loadingFadeIn = false
            }
            $scope.c.getUserInfo(function()
            {
                post.$promise.then(function(post)
                    {
                        $scope.initTimer = function()
                        {
                            $scope.timeNow = (new Date()).getTime()/1000
                            var interval = $interval(function(){
                                $scope.timeNow = (new Date()).getTime()/1000

                                if($scope.post.giveaway.status=='active' && $scope.timeNow>$scope.post.giveaway.expiration_timestamp)
                                {
                                    $scope.refreshGiveaway()
                                }
                            },1000)

                        }
                        $scope.initTimer()

                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.post = giveawayDecor.decoratePost(post.data,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                        if($scope.post.caption.text.split('Wanna win?').length>1)
                            $scope.post.caption.text = $scope.post.caption.text.split('Wanna win?')[0]


                        var img = new Image()
                        img.onload=function()
                        {
                            $scope.$apply(function()
                            {
                                if($scope.post.giveaway==undefined)
                                {
                                    $scope.post.giveaway = {}
                                    $scope.post.giveaway.type="unjoined"
                                    $scope.refreshGiveaway()
                                }
                                else
                                {
                                    $scope.c.hideLoading()
                                    $scope.loadingFadeIn = true

                                }
                            })

                        }
                        img.src=$scope.post.images.standard_resolution.url
                    }
                    ,function(error)
                    {
                        $scope.c.hideLoading()
                        $scope.c.notifyErr(error.data.code || error.data.meta.code )
                        $ionicHistory.goBack()
                    })
            })

        }
        $scope.loadGiveaway()

        $scope.likePost = function()
        {
            if($scope.post.user_has_liked == true)
                return

            $scope.c.showLike();
            instagram.media.save({action:$scope.post.id,type:'likes'},{},function()
            {
                $scope.c.hideLike()
                $scope.post.user_has_liked = true
            })
        }

    })

    .controller('MyGiveawaysCtrl', function($scope,instagram,giveawayDecor,$timeout) {



        $scope.layout = "posts"
        $scope.lazyTimeout = 0
        $scope.c.showLoading()
        $scope.quantity = 0
        $scope.refreshMyWW = function()
        {
            $scope.quantity=$scope.c.userInfo.data.giveaways
            for(var index in $scope.c.userInfo.data.giveaways)
            {

                instagram.media.get({action:$scope.c.userInfo.data.giveaways[index].media_id},(function(index) { return function(data)
                {
                    $scope.giveaways =$scope.giveaways || []
                    var fileredPost =  giveawayDecor.decoratePost(data.data,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                    data.data.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)

                    $scope.giveaways[index] = (data.data)
                }})(index))
            }
        }
        $scope.c.getUserInfo(function()
        {
            $scope.c.hideLoading()
            $scope.$watch("c.userInfo.data.giveaways",function(){
                if($scope.c.userInfo !=undefined && $scope.c.userInfo.data !=undefined && $scope.c.userInfo.data.giveaways.length!=0 && $scope.quantity!=$scope.c.userInfo.data.giveaways)
                {
                    $timeout.cancel($scope.lazyTimeout)
                    $scope.lazyTimeout =  $timeout($scope.refreshMyWW,500)
                }
            },true)

        })

    })
    .controller('UserPostsCtrl', function($scope,$stateParams,instagram, $ionicScrollDelegate,$location,giveawayDecor) {


        $scope.layout="posts"
        $scope.c.showLoading()
        $scope.tab=$location.$$url.split("/")[2]
        $scope.c.getUserInfo(function()
        {


            var results = instagram.users.get({user:$stateParams.userid,action:"media",type:"recent"}).$promise
            results.then(function(data)
            {
                if(data.data.length==0)
                {
                    $scope.user = undefined
                    $scope.feed={}
                    $scope.feed.data=[]
                    $scope.c.hideLoading()
                    return
                }
                $scope.user = data.data[0].user
                data.data=data.data.filter(giveawayDecor.filterPosts)
                data.data.map(function(post)
                {
                    var fileredPost =  giveawayDecor.decoratePost(post,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                    post.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)
                })
                $scope.feed = data

                $ionicScrollDelegate.scrollTop(0)
                $scope.c.hideLoading()
            },function()
            {
                $scope.feed = undefined
                $scope.c.hideLoading()
            })
        })
    })
    .controller('MyProfileCtrl', function($scope) {
        $scope.c.showLoading()
        $scope.loadingFadeIn=false
        $scope.reposts = 0
        $scope.wins = 0
        $scope.c.getUserInfo(function()
        {
            $scope.c.hideLoading()
            $scope.loadingFadeIn=true
            if($scope.c.userInfo.data.giveaways.length>1)
            {

                $scope.reposts = 0
                $scope.c.userInfo.data.giveaways.filter(function(a){$scope.reposts +=a.participants.totalCount*1; return true;})

            }
            else if($scope.c.userInfo.data.giveaways.length==1)
                $scope.reposts = $scope.c.userInfo.data.giveaways[0].participants.totalCount*1

            $scope.wins = $scope.c.userInfo.data.participating.filter(function(a){ return a.winner_id==$scope.c.userInstagram.data.id}).length
            //TODO: what we what here?
        })

    }).controller('CollectionCtrl', function($scope,collection,instagram,$ionicHistory ,giveawayDecor ) {


        $scope.c.showLoading()
        $scope.loadingFadeIn=false
        $scope.layout="posts"
        $scope.c.getUserInfo(function()
        {
            collection.$promise.then(function()
            {
                $scope.c.hideLoading()
                $scope.c.loadingFadeIn=true
                for(var key in collection.data)
                {
                    $scope.collectionName = key
                    $scope.$apply()
                    for(var index in collection.data[key])
                    {

                        var giveaway = collection.data[key][index]
                        instagram.media.get({action:giveaway.media_id},(function(index) { return function(data)
                        {
                            $scope.giveaways =$scope.giveaways || []
                            var fileredPost =  giveawayDecor.decoratePost(data.data,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                            data.data.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)

                            $scope.giveaways[index]=(data.data)
                        }})(index),function(error)
                        {
                            //$scope.c.notifyErr(error.data.code || error.data.meta.code )
                        })
                    }

                    if(!collection.data[key].length)
                        $scope.giveaways =$scope.giveaways || []
                }
            },function(error)
            {
                $scope.c.hideLoading()
                $scope.c.notifyErr(error.data.errorCode)
                $ionicHistory.goBack()
            })
        })

    })

