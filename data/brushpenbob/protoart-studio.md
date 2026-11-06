# brushpenbob/protoart-studio

## Resumen

Protoart Studio no es un modelo de IA, sino una aplicacion de escritorio para macOS que actua como estudio de generacion y edicion de imagenes con IA de forma totalmente local sobre Apple Silicon. El repositorio de Hugging Face (`brushpenbob/protoart-studio`) aloja unicamente el instalador `.dmg` (7,0 GB) y su checksum SHA-256, no pesos de ningun modelo. El codigo fuente, la lista completa de funciones y las notas de version se publican en GitHub.

La aplicacion permite ejecutar localmente modelos de difusion como FLUX.2 Klein, FLUX.1, SDXL (incluidas variantes Pony, Illustrious y NoobAI), SD 1.5 y ERNIE-Image, ademas de soportar LoRAs, embeddings y ControlNet (pose, dibujo, contornos, profundidad). Incluye funciones de texto a imagen, imagen a imagen, inpainting, outpainting, upscaling, restauracion de rostros, segmentacion de fondos y entrenamiento de LoRAs propios. Todo el procesamiento ocurre en el Mac del usuario, sin cuenta, sin nube y sin telemetria.

Su relevancia actual radica en que ofrece un flujo de trabajo de generacion de imagenes completamente privado y offline en hardware de consumo Apple Silicon, funcionando incluso en equipos con 8 GB de memoria unificada. La aplicacion es de codigo abierto bajo Apache 2.0, aunque los modelos que descarga el usuario conservan sus licencias individuales, algunas de ellas no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (aplicacion de escritorio; no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (codigo de la aplicacion; los modelos descargados mantienen su propia licencia) |
| Formato de pesos | no aplica (el repositorio contiene un instalador `.dmg` y su checksum `.sha256`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay arquitectura de red neuronal, dataset ni proceso de RLHF/DPO que describir. Protoart Studio es una aplicacion nativa para macOS que orquesta la inferencia de modelos de difusion de terceros (FLUX.2 Klein, FLUX.1, SDXL y variantes, SD 1.5, ERNIE-Image) sobre Apple Silicon mediante las APIs de aceleracion del sistema. La aplicacion integra pipelines de generacion, edicion, ControlNet, entrenamiento de LoRAs y utilidades de postprocesado.

El instalador distribuido en el repositorio ocupa 7,0 GB y requiere aproximadamente 2 GB en disco para la aplicacion, mas entre 2 y 13 GB por cada modelo que el usuario descargue dentro de la propia aplicacion. No se especifican en la informacion disponible detalles sobre el motor de inferencia concreto, el backend de aceleracion ni las versiones de los modelos incluidos.

## Capacidades

- Generacion de texto a imagen con FLUX.2 Klein, FLUX.1, SDXL (incluidas Pony, Illustrious y NoobAI), SD 1.5 y ERNIE-Image.
- Soporte de LoRAs, embeddings y ControlNet con modos de pose, dibujo, contornos y profundidad.
- Prompts regionales, cola de trabajos y previsualizacion en vivo.
- Imagen a imagen: edicion mediante instrucciones en lenguaje natural, combinacion de personajes en escenas, cambio de angulo de camara, descomposicion en capas a `.psd`, inpainting, outpainting y ControlNet.
- Herramientas de postprocesado: mejora y upscaling, restauracion de rostros, reemplazo de texto, pincel de textura de piel, ajustes tipo Camera Raw, recorte de fondos, eliminacion de objetos, vectorizacion y mapas de profundidad.
- Entrenamiento de LoRAs y embeddings propios, asi como continuacion del entrenamiento de un LoRA ya creado.
- Reutilizacion de modelos ya descargados por DiffusionBee, ComfyUI, A1111/Forge, InvokeAI y Stability Matrix.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Generacion de ilustraciones privadas offline: artistas y disenadores pueden producir imagenes con FLUX o SDXL sin enviar prompts ni datos a servicios en la nube, gracias a la ejecucion local en Apple Silicon.
- Edicion fotografica asistida por lenguaje natural: la funcion de imagen a imagen permite modificar una fotografia describiendo el cambio, util para retoque rapido sin herramientas de edicion tradicionales.
- Creacion de personajes consistentes en escenas: la combinacion de personaje en escena y el entrenamiento de LoRAs permiten mantener la identidad visual de un personaje a lo largo de varias ilustraciones.
- Preparacion de assets para produccion grafica: la descomposicion en capas `.psd`, la vectorizacion y el recorte de fondos facilitan la integracion de las imagenes generadas en flujos de trabajo de diseno.
- Control preciso de composicion: los modos de ControlNet (pose, dibujo, contornos, profundidad) permiten guiar la generacion a partir de bocetos o referencias, util para storyboards y concept art.
- Prototipado en equipos con recursos limitados: al funcionar en Macs de 8 GB de memoria, permite a estudiantes y desarrolladores experimentar con generacion de imagenes sin GPU dedicada.
- Restauracion y mejora de material grafico: las funciones de upscaling, restauracion de rostros y eliminacion de objetos sirven para recuperar o limpiar imagenes antiguas o de baja calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Mac con Apple Silicon (M1, M2, M3, M4 o posterior); los Mac Intel no estan soportados.
- macOS 13 Ventura o superior.
- Memoria unificada: 8 GB funciona; 16 GB o mas es la configuracion recomendada.
- Espacio en disco: aproximadamente 2 GB para la aplicacion, mas entre 2 y 13 GB por cada modelo descargado.
- VRAM estimada: no aplica como VRAM dedicada; el consumo depende del modelo de difusion elegido y de la memoria unificada del equipo.
- Opciones de despliegue: aplicacion nativa de escritorio para macOS; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Herramienta | Tipo | Plataforma | Modelos soportados | Licencia | Notas |
|---|---|---|---|---|---|
| Protoart Studio | Aplicacion de escritorio | macOS Apple Silicon | FLUX.2 Klein, FLUX.1, SDXL, SD 1.5, ERNIE-Image | Apache 2.0 (codigo); modelos con licencia propia | Funciona con 8 GB; entrenamiento de LoRAs integrado |
| DiffusionBee | Aplicacion de escritorio | macOS | Stable Diffusion | no disponible en la informacion | Protoart puede reutilizar sus modelos |
| ComfyUI | Interfaz por nodos | Multiplataforma | Amplia variedad de modelos de difusion | no disponible en la informacion | Protoart puede reutilizar sus modelos |
| A1111 / Forge | Interfaz web | Multiplataforma | Stable Diffusion y derivados | no disponible en la informacion | Protoart puede reutilizar sus modelos |

No se dispone de datos de rendimiento comparativo entre estas herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo, sino un instalador; quien busque pesos descargables debe acudir a los repositorios de cada modelo por separado.
- La aplicacion no esta notarizada por Apple, por lo que macOS la bloquea en el primer lanzamiento y requiere autorizacion manual desde Ajustes del sistema.
- Solo funciona en Macs con Apple Silicon; no hay soporte para Intel ni para Windows o Linux.
- Los modelos descargados dentro de la aplicacion conservan sus licencias individuales, algunas de ellas no comerciales; el uso comercial exige revisar cada licencia.
- El rendimiento y la calidad dependen del modelo elegido y de la memoria unificada disponible; en equipos de 8 GB las opciones pueden estar limitadas.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma en la informacion disponible, al no tratarse de un modelo de lenguaje.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy reducida y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/brushpenbob/protoart-studio
- Descargas y notas de version: https://github.com/theprotoart/protoart-studio/releases/latest
- Codigo fuente: https://github.com/theprotoart/protoart-studio
- Discord: https://discord.gg/zRC6zrufYE
- Avisos de terceros: https://github.com/theprotoart/protoart-studio/blob/main/THIRD_PARTY_NOTICES.md
