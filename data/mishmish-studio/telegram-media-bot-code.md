# mishmish-studio/telegram-media-bot-code

## Resumen

`mishmish-studio/telegram-media-bot-code` no es un modelo de lenguaje, sino un repositorio de codigo publicado en Hugging Face que contiene la implementacion de un bot de Telegram para la descarga de video y audio desde plataformas como YouTube, TikTok, Instagram, Facebook y X/Twitter. El autor es el usuario `mishmish-studio` y el artefacto esta pensado para desplegarse como una aplicacion Docker en Hugging Face Spaces con hardware CPU basico gratuito.

El sistema funciona mediante long polling contra la API de Telegram, lo que evita la necesidad de exponer una IP publica o configurar webhooks. La descarga se resuelve con una cascada de backends: instancias Piped para identificadores de YouTube, `yt-dlp` con impersonacion TLS de Chrome para Facebook y sitios genericos, e instancias comunitarias de Cobalt como respaldo para TikTok e Instagram.

Su relevancia es practica y no cientifica: sirve como plantilla reproducible para desplegar un servicio de extraccion de medios en infraestructura gratuita, con las limitaciones inherentes de la plataforma (50 MB por archivo enviado por un bot) y de los bloqueos por reputacion de IP que aplican YouTube, TikTok e Instagram a rangos de datacenter. No hay pesos, tokenizador ni arquitectura de red neuronal asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; aplicacion Python con long polling y backends HTTP) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de codigo, no contiene pesos) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo ni proceso de entrenamiento. El repositorio contiene el codigo de un bot de Telegram escrito en Python que se ejecuta como contenedor Docker (`python bot.py`) sobre CPU basica. La logica de extraccion se delega en tres backends intentados en orden: instancias Piped para IDs de YouTube (streams proxeados que funcionan incluso cuando YouTube bloquea IPs de datacenter), `yt-dlp` directo con impersonacion TLS de Chrome para Facebook y sitios genericos, e instancias comunitarias de Cobalt para TikTok e Instagram.

El bot impone el limite de subida de 50 MB de la plataforma Telegram y selecciona por defecto formatos de hasta 720p. Dispone de un comando `/audio ` (o `/audio` seguido del enlace) que envia unicamente audio en MP3. Ademas levanta un servidor `aiohttp` minimo en el puerto `$PORT` (7860) con auto-ping para mantener despierto el hardware gratuito de Hugging Face Spaces, que se suspende sin trafico.

## Capacidades

- Descarga de video y audio desde enlaces de YouTube, TikTok, Instagram, Facebook, X/Twitter y sitios genericos.
- Envio de audio en MP3 mediante el comando `/audio`.
- Seleccion automatica de formatos de hasta 720p y aplicacion del limite de 50 MB por archivo.
- Long polling contra la API de Telegram, sin webhook ni IP publica.
- Conmutacion automatica entre backends (Piped, `yt-dlp` con impersonacion TLS, Cobalt) segun el dominio y el resultado.
- Configuracion de instancias Piped y Cobalt mediante variables de entorno (`PIPED_INSTANCES`, `COBALT_INSTANCES`).
- Auto-ping para mitigar la suspension del hardware gratuito de Hugging Face Spaces.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues propias de un modelo de lenguaje.

## Casos de uso

- Descarga de audio para podcasts o musica: el comando `/audio` extrae la pista en MP3 de un enlace de YouTube o sitio generico, util para escuchar contenido sin video en movil.
- Archivado de clips de redes sociales: envio de enlaces de TikTok, Instagram o X/Twitter al bot y recepcion del archivo de hasta 720p y 50 MB, adecuado para guardar referencias visuales rapidas.
- Extraccion de material para edicion: obtencion de fragmentos de video de YouTube o Facebook en un chat de Telegram, que despues se reenvian a un equipo de edicion sin salir de la aplicacion.
- Despliegue de un servicio propio de extraccion de medios: uso del repositorio como plantilla Docker en Hugging Face Spaces con CPU basica gratuita, configurando `BOT_TOKEN` y `SPACE_URL` como secretos.
- Pruebas de integracion de backends de descarga: validacion del comportamiento de Piped, `yt-dlp` con impersonacion TLS y Cobalt frente a distintos dominios y reputaciones de IP.
- Bot personal de uso privado: instancia unica con un token de BotFather para un usuario o equipo pequeno, sin necesidad de infraestructura dedicada ni IP publica.
- Monitorizacion de disponibilidad de instancias publicas: el orden de fallback permite observar que backend responde en cada momento para cada plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el sistema no ejecuta inferencia neuronal.
- CPU: hardware CPU basico de Hugging Face Spaces (opcion gratuita) segun las instrucciones del autor.
- GPU: no aplica; no se requiere A100, H100 ni RTX 4090.
- Memoria y almacenamiento: no disponible en la informacion proporcionada.
- Despliegue: Docker en Hugging Face Spaces (SDK = Docker), con variables de entorno `BOT_TOKEN`, `SPACE_URL` y, opcionalmente, `PIPED_INSTANCES` y `COBALT_INSTANCES`.
- Latencia y throughput: no disponible. La calidad y velocidad dependen de la instancia Piped o Cobalt utilizada; el autor indica que la ruta Piped suele entregar 360p muxado.
- Limitacion de plataforma: Telegram no permite a los bots enviar archivos de mas de 50 MB.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| mishmish-studio/telegram-media-bot-code | Bot de Telegram (codigo) | no aplica | no aplica | no disponible | Backends Piped, `yt-dlp` y Cobalt; despliegue en HF Spaces |
| yt-dlp (proyecto upstream) | Herramienta CLI/biblioteca | no aplica | no aplica | no disponible en la informacion | Backend usado por este bot; no incluye capa de bot ni fallback Piped/Cobalt |
| Cobalt (instancias comunitarias) | API de extraccion | no aplica | no aplica | no disponible en la informacion | Usado como fallback para TikTok e Instagram |
| Piped (instancias comunitarias) | Proxy de YouTube | no aplica | no aplica | no disponible en la informacion | Usado para IDs de YouTube cuando `yt-dlp` directo falla |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- YouTube bloquea casi todas las IPs de datacenter para `yt-dlp` directo; la ruta Piped funciona pero la calidad depende de la instancia y suele entregar 360p muxado.
- TikTok e Instagram bloquean algunas IPs de datacenter por completo; el exito depende de la reputacion de la IP del host y de que las instancias Cobalt esten operativas.
- Telegram impone un maximo de 50 MB por archivo enviado por un bot, lo que limita la duracion y calidad de los medios descargados.
- El hardware gratuito de Hugging Face Spaces se suspende sin trafico; el auto-ping lo mitiga pero no lo elimina.
- La licencia no esta declarada en la informacion disponible, por lo que el uso comercial y la redistribucion no pueden asumirse permitidos.
- Dependencia de servicios de terceros (instancias Piped y Cobalt comunitarias) cuya disponibilidad, limites y politicas pueden cambiar sin aviso.
- Riesgo legal y de terminos de servicio: la descarga de contenido de plataformas puede contravenir sus condiciones de uso y la normativa de derechos de autor segun la jurisdiccion.
- No hay idiomas, sesgos ni alucinaciones que evaluar al no tratarse de un modelo de lenguaje; los fallos seran de extraccion, red o limites de plataforma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni issues publicos verificables.

## Enlaces

- Hugging Face: https://huggingface.co/mishmish-studio/telegram-media-bot-code
- yt-dlp (backend de descarga): https://github.com/yt-dlp/yt-dlp
- Piped (backend de YouTube): https://github.com/TeamPiped/Piped
- Cobalt (backend de TikTok/Instagram): https://github.com/imputnet/cobalt
- Hugging Face Spaces (despliegue): https://huggingface.co/spaces
- BotFather de Telegram (token del bot): https://core.telegram.org/bots#botfather
