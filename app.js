var express = require('express');
var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(3000);

//routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
app.use(express.static(__dirname + '/public'));


var usernames = {};
var playlist = [];
var videoId = '';

io.sockets.on('connection', function (socket) {
        socket.on('init', function () {
            socket.emit('init', playlist, videoId);
        }) 
    
        socket.on('playerStateChange', function (data, time) {
            io.sockets.emit('playerStateChange',  data, time);
        });        

        socket.on('setVideo', function (video) {
            videoId = video;
            io.sockets.emit('setVideo', videoId);
        });
        
        socket.on('playEnded', function (video) {
            videoId = playlist[playlist.indexOf(video)+2];
            io.sockets.emit('setVideo', videoId);
        });

        socket.on('disconnect', function(){
        });
        
        socket.on('addToPlaylist', function(items) {
            items.forEach(function(value) {
                if (value) {
                    playlist.push(value);
                }
            });
            io.sockets.emit('updatePlaylist', playlist);
        });
        
        socket.on('removeFromPlaylist', function(item) {
            playlist.splice(playlist.indexOf(item), 1);
            io.sockets.emit('updatePlaylist', playlist);
        });
        
        socket.on('updatePlaylist', function() {
            io.sockets.emit('updatePlaylist', playlist);
        });
        
        socket.on('emptyPlaylist', function() {
            playlist = [];
            io.sockets.emit('emptyPlaylist', playlist);
        });
        
        socket.on('volume', function(arg) {
            io.sockets.emit('volume', arg);
        });
});
