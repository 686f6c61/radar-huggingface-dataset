# AI-KSK/minimax-h3-refmod-workflows-327

## Resumen

`AI-KSK/minimax-h3-refmod-workflows-327` no es un modelo de IA, sino una coleccion de seis flujos de trabajo JSON para ComfyUI orientados a MiniMax H3, un sistema de generacion de video y audio. El repositorio, publicado por el usuario AI-KSK, contiene los grafos originales y seis imagenes de portada en formato 3:4 (1086 × 1448 PNG) que ilustran el proposito de cada flujo. Los cuatro primeros grafos construyen activos reutilizables de tipo RefMod (identidad de personaje, movimiento, voz y escena); los dos ultimos emplean esos activos guardados para generar video y audio con H3.

El paquete se presenta como un episodio unico de una serie de tutoriales en video, no como seis repositorios independientes. No incluye pesos de modelo, fuentes de medios, archivos `.safetensors` de RefMod ya generados, salidas de video ni concesiones de licencia de terceros. El tamano del repositorio es de 0,0 GB, lo que confirma que solo se distribuyen los JSON y las portadas.

La relevancia de esta publicacion es practica: ofrece una ruta concreta y reproducible para preparar referencias multimodales (personaje, movimiento, voz y escena) en ComfyUI y reutilizarlas en la generacion de video con MiniMax H3. No obstante, el propio autor advierte que el README describe los ajustes de los JSON y la transcripcion del episodio, y no constituye una afirmacion de que estos archivos exactos se hayan ejecutado o evaluado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una coleccion de flujos de trabajo JSON para ComfyUI sobre MiniMax H3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene JSON de flujos de trabajo y PNG de portada; no incluye pesos) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene un modelo entrenado. Se trata de una coleccion de seis grafos JSON para ComfyUI que orquestan nodos de MiniMax H3 y de extensiones asociadas. Los flujos 01 a 04 emplean los nodos `MiniMaxH3RefModExtract` y `MiniMaxH3RefModAudioExtract` para extraer y guardar referencias en subcarpetas especificas (`character`, `motion`, `voice`, `scene`) bajo `ComfyUI/models/refmods/`. Los flujos 05 y 06 cargan esas referencias guardadas y las inyectan en la generacion mediante los nodos Apply y TextEncode.

Los ajustes de extraccion documentados incluyen: para personaje, modo Full Reference a 768 de resolucion con `latent_frames=16` y `pool_h=pool_w=16`; para movimiento, Full Reference a 512 con limite de 121 fotogramas en la carga de video y 56 fotogramas latentes en el extractor; para audio, maximo de 8 segundos con `max_tokens=0` y `truncate`, usando `minimax_h3_audio_vae_fp32.safetensors`; para escena, Full Reference a 1024 con dos imagenes y 16 fotogramas latentes. El extractor de personaje usa `MiniMaxH3RefModFolderLoader` con 32 elementos, 240 fotogramas maximos y borde maximo de 1024. No se documenta ningun proceso de entrenamiento, ajuste fino ni evaluacion de rendimiento.

## Capacidades

- Creacion de referencias de identidad de personaje a partir de una carpeta de imagenes, con nombre y subcarpeta configurables.
- Creacion de referencias de movimiento a partir de un video, con limite de fotogramas y extraccion de pose/movimiento.
- Creacion de referencias de voz a partir de un archivo de audio, con duracion maxima de 8 segundos y uso del VAE de audio de H3.
- Creacion de referencias de escena a partir de dos imagenes coherentes de un mismo lugar.
- Generacion de video y audio con MiniMax H3 a partir de referencias guardadas, mediante inyeccion (Apply) y codificacion de texto (TextEncode) con mapeo numerado de referencias.
- Soporte de etiquetas `<Video n>` y `<Picture n>` para referenciar activos en el prompt.
- Integracion con Video Helper Suite para nodos `VHS_` en la carga de video.
- No se documentan capacidades de razonamiento, codigo, matematicas, tool calling ni agentes, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Produccion de video con personaje consistente: ejecutar el flujo 01 para extraer la identidad de un personaje desde una carpeta de imagenes y reutilizarla en los flujos 05 o 06 para mantener la coherencia visual entre tomas.
- Transferencia de movimiento entre clips: usar el flujo 02 para extraer una referencia de accion desde un video de referencia y aplicarla en la generacion de nuevas secuencias con la misma coreografia.
- Clonacion de voz para narracion: extraer una referencia de voz de 8 segundos con el flujo 03 y emplearla en la generacion de audio sincronizado con el video resultante.
- Consistencia de localizacion: crear una referencia de escena a partir de dos vistas de un mismo decorado con el flujo 04 y reutilizarla para generar multiples planos del mismo entorno.
- Prototipado de escenas multi-referencia: combinar las cuatro referencias (personaje, movimiento, voz y escena) en el flujo 05 para generar un clip completo con identidad, accion, voz y entorno controlados.
- Control fino mediante prompt: usar el flujo 06 con mapeo numerado de referencias para dirigir que activo corresponde a cada etiqueta `<Video n>` o `<Picture n>` en el texto, util en produccion con multiples personajes.
- Formacion y tutoriales: emplear los JSON como material didactico reproducible en talleres de ComfyUI, dado que el autor los publica como parte de un episodio de video tutorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el README no constituye una afirmacion de que los archivos se hayan ejecutado o evaluado de forma independiente, y que las portadas no son una galeria de salidas de modelo verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende de los modelos, VAE, text encoder y LoRA de MiniMax H3 que el usuario aporte, no del repositorio en si.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI con soporte para MiniMax H3, la extension `ComfyUI-MiniMaxH3Mod` y Video Helper Suite para los nodos `VHS_`. El autor ofrece ademas una imagen en la nube preparada en 优云智算 (compshare.cn) mediante enlace de referido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables ni de rendimiento que permitan una comparacion significativa. Se trata de una coleccion de flujos de trabajo, no de un modelo con parametros o metricas comparables.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo, VAE, text encoder ni LoRA; el usuario debe aportar sus propios modelos compatibles con MiniMax H3.
- No se incluyen las fuentes de medios originales; es necesario aportar material propio con derechos claros (imagenes de personaje, video de movimiento, archivo de voz y dos vistas de escena).
- El flujo 06 requiere anadir un segundo activo de personaje que falta y rellenar un prompt vacio antes de usarlo.
- El autor advierte que los archivos no han sido verificados como ejecutados ni evaluados de forma independiente; las portadas son ilustrativas y no salidas de modelo comprobadas.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial ni la redistribucion.
- El enlace de despliegue en la nube es un enlace de referido del creador, lo que puede suponer una compensacion; deben verificarse tarifas y disponibilidad en la pagina del proveedor.
- El repositorio tiene 0 descargas y 2 likes, lo que indica una validacion comunitaria practicamente nula.
- No se dispone de informacion sobre sesgos, alucinacion o limitaciones de idioma del sistema H3 subyacente en la informacion proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/minimax-h3-refmod-workflows-327
- Video tutorial en YouTube: https://youtu.be/H5L5sO7dRu8
- Imagen preparada en 优云智算: https://www.compshare.cn/images/323moGjpvfeM?referral_code=A7fTQUYY9lCDFJwA6MMvoq
