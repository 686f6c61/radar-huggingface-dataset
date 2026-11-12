# hareramray325/websec

## Resumen

`hareramray325/websec` es un clasificador binario a nivel de carácter disenado para detectar payloads de cross-site scripting (XSS). Lo desarrolla el usuario de Hugging Face hareramray325 y se publica bajo licencia MIT. El modelo resuelve un problema acotado pero critico en seguridad web: puntuar la probabilidad de que una cadena de entrada contenga una inyeccion XSS, leyendo los caracteres en crudo tras deshacer codificaciones URL y HTML, de modo que `%3Cscript%3E`, `&lt;script&gt;` y `
