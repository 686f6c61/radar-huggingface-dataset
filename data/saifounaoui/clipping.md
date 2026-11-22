# Saifounaoui/Clipping

## Resumen

ClipAI (publicado en Hugging Face como `Saifounaoui/Clipping`) no es un modelo de lenguaje en sentido estricto, sino una aplicacion web autocontenida empaquetada como Docker Space que automatiza la generacion de clips verticales 9:16 a partir de videos largos. El sistema combina yt-dlp para la descarga, faster-whisper para la transcripcion con marcas de tiempo y ffmpeg para el corte, el reescalado y la incrustacion de subtitulos palabra a palabra. La seleccion de los momentos destacados se realiza mediante una heuristica que combina la curva "Most replayed" de YouTube (cuando existe), la energia del audio y la deteccion de palabras clave en la transcripcion.

El proyecto esta disenado para desplegarse de forma gratuita en la capa CPU basica de Hugging Face Spaces, sin APIs de pago ni cuentas adicionales, y se controla desde el navegador de un telefono movil. Su publicacion en Hugging Face como repositorio de modelo es en realidad un vehiculo de distribucion del codigo de la aplicacion (`app.py`, `Dockerfile`, `requirements.txt`, `README.md`), no de pesos entrenados.

Por tanto, esta ficha describe una herramienta de inferencia y postprocesado de video construida sobre modelos de terceros (Whisper en su variante faster-whisper), y no un modelo con parametros, arquitectura o licencia propios publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion web (Flask/Docker) sobre faster-whisper + yt-dlp + ffmpeg; no es un modelo con arquitectura propia |
| Parametros totales | no disponible (depende del modelo Whisper seleccionado: `base` por defecto, `small` opcional) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (limitado por la duracion del audio procesado; `CLIPAI_MAX_MINUTES` por defecto 180 minutos) |
| Tipos de cuantizacion | no disponible (faster-whisper usa cuantizacion int8 por defecto en CPU) |
| Idiomas soportados | arabe, ingles y frances en la deteccion de palabras clave; transcripcion multilingue segun Whisper; mencion explicita al dialecto tunecino |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos; la aplicacion descarga el modelo Whisper en tiempo de ejecucion) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado. Lo que se publica es una aplicacion Docker con cuatro ficheros (`app.py`, `Dockerfile`, `requirements.txt`, `README.md`) que orquesta un pipeline de tres etapas: descarga del video con yt-dlp (o subida directa desde el dispositivo), transcripcion con faster-whisper generando timestamps a nivel de palabra, y renderizado con ffmpeg para producir clips verticales con subtitulos grandes donde la palabra activa se resalta en amarillo.

La seleccion de fragmentos no emplea ningun modelo de puntuacion aprendido. Se basa en tres heuristicas combinadas: la curva "Most replayed" de YouTube cuando el video la expone, la energia del audio para detectar momentos de excitacion (gritos, risas) y la presencia de palabras de alta intensidad definidas en las listas `STRONG` y `WEAK` al inicio de `app.py`. Para ahorrar computo en CPU, solo se transcriben los segmentos candidatos, no el video completo.

## Capacidades

- Descarga de video desde una URL (yt-dlp) o subida directa de un fichero desde el telefono.
- Transcripcion automatica con marcas de tiempo a nivel de palabra mediante faster-whisper.
- Generacion de clips verticales 9:16 con subtitulos palabra a palabra y resaltado de la palabra activa.
- Seleccion heuristica de momentos destacados por curva "Most replayed", energia de audio y palabras clave.
- Deteccion de palabras de intensidad en arabe, ingles y frances, ampliable editando las listas `STRONG` y `WEAK`.
- Descarga y comparticion directa de los clips generados.
- Control de acceso opcional mediante secreto `CLIPAI_CODE`.
- Soporte de cookies de YouTube (`YT_COOKIES`) para esquivar bloqueos anti-bot.
- Configuracion por variables de entorno: duracion maxima, tamano maximo de subida, tiempo de retencion, cola maxima y fuente de subtitulos.
- Ejecucion local con Python 3.10+ y ffmpeg (y deno para descargas de YouTube).

## Casos de uso

- Creacion de contenido para redes verticales: un creador pega la URL de su propio video largo y obtiene varios clips 9:16 con subtitulos listos para TikTok, Reels o Shorts, sin editar manualmente.
- Repurposing de webinars y directos: la herramienta localiza los picos de "Most replayed" y de energia de audio para extraer los momentos mas vistos y convertirlos en piezas cortas.
- Subtitulado automatico de material propio: la transcripcion con timestamps por palabra permite generar subtitulos quemados en el video sin herramientas de pago.
- Produccion movil sin estacion de trabajo: al desplegarse en un Space CPU gratuito y funcionar desde el navegador del telefono, sirve para creadores que trabajan exclusivamente desde el movil.
- Prototipado de pipelines de clipping: el codigo es editable y las listas de palabras clave y las variables de entorno permiten adaptar la heuristica a un nicho concreto antes de invertir en infraestructura.
- Procesamiento por lotes de un catalogo propio: con `CLIPAI_MAX_MINUTES` y `CLIPAI_MAX_QUEUE` configurables, se puede encolar la extraccion de clips de varios videos de un mismo canal.
- Uso educativo o de investigacion sobre tecnicas de seleccion de highlights: sirve como linea base heuristica frente a la que comparar modelos de puntuacion aprendidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: la configuracion de referencia es la capa CPU basica gratuita de Hugging Face Spaces, sin GPU.
- VRAM: no aplica en el despliegue por defecto; faster-whisper puede ejecutarse en GPU si se dispone de ella, pero no se documentan requisitos de VRAM.
- GPU recomendadas: no disponible; el autor no documenta perfiles de GPU.
- Cabe en GPU de consumo: no disponible; el diseno asume CPU.
- Despliegue: Hugging Face Spaces con SDK Docker (puerto 7860); ejecucion local con `pip install -r requirements.txt` y `python app.py` en el puerto 5000.
- Latencia y throughput: el autor advierte que en CPU un video largo puede tardar "decenas de minutos"; no se ofrecen cifras de throughput.
- Almacenamiento: los resultados se eliminan del servidor a las 3 horas por defecto (`CLIPAI_KEEP_HOURS`).
- Limites configurables: 180 minutos de video, 1000 MB de subida y 3 peticiones en cola por defecto.

## Comparativa con modelos similares

| Herramienta | Enfoque | Modelo subyacente | Ejecucion | Coste | Licencia |
|---|---|---|---|---|---|
| ClipAI (este repositorio) | Clipping heuristico + subtitulos | faster-whisper (`base`/`small`) | CPU en Space gratuito o local | Gratuito | no disponible |
| Opus Clip | Clipping con puntuacion aprendida | no disponible | SaaS en la nube | De pago | Propietaria |
| Descript / Vizard | Edicion y clipping asistidos | no disponible | SaaS en la nube | De pago | Propietaria |
| Pipeline manual (Whisper + ffmpeg) | Automatizacion a medida | Whisper (variantes) | Local o servidor propio | Coste de infraestructura | Segun Whisper (MIT) |

La comparativa se limita a categoria funcional; no se dispone de datos de rendimiento del autor para contrastar calidad de seleccion de clips frente a alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado: no hay pesos, arquitectura ni evaluacion publicados; tratarlo como modelo en una comparativa de LLM seria incorrecto.
- Licencia no especificada: no hay garantia explicita de uso comercial; conviene contactar con el autor antes de integrarlo en produccion.
- YouTube bloquea con frecuencia las IP de servidores de hosting ("Sign in to confirm you're not a bot"); el autor propone subir el video manualmente o aportar cookies, con el riesgo de que la cuenta de Google sea bloqueada.
- La curva "Most replayed" solo existe en videos populares; en el resto la seleccion depende de heuristicas de audio y palabras clave, con calidad variable.
- Whisper transcribe de forma imperfecta el dialecto tunecino y puede sustituir palabras por formas cercanas al arabe estandar; el autor recomienda revisar los subtitulos antes de publicar.
- En CPU el procesado de videos largos es lento (decenas de minutos) y el Space se suspende por inactividad, tardando alrededor de un minuto en reactivarse.
- Los resultados se borran del servidor a las 3 horas; no hay almacenamiento persistente.
- Riesgo legal: descargar videos de YouTube puede infringir sus terminos de servicio y los derechos del titular; la herramienta debe usarse con contenido propio o con permiso.
- Sin `CLIPAI_CODE` configurado, cualquier persona con el enlace puede consumir la cuota gratuita del Space.
- La interfaz y la documentacion estan en arabe; no hay version en castellano ni en ingles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Saifounaoui/Clipping
- faster-whisper (modelo de transcripcion subyacente): https://github.com/SYSTRAN/faster-whisper
- yt-dlp: https://github.com/yt-dlp/yt-dlp
- ffmpeg: https://ffmpeg.org/
- Hugging Face Spaces (plataforma de despliegue): https://huggingface.co/spaces
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper: https://github.com/openai/whisper
