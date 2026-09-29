# AbrahamPJ/nightmare-sd15-swap-models

## Resumen

`nightmare-sd15-swap-models` es un repositorio de HuggingFace publicado por el usuario AbrahamPJ que aloja dos checkpoints de Stable Diffusion 1.5 convertidos para ejecutarse en la NPU Hexagon de los SoC Qualcomm Snapdragon mediante QNN. No se trata de un modelo entrenado desde cero ni de un ajuste fino: son conversiones, sin reentrenamiento, de los checkpoints AbsoluteReality v1.8.1 (de Lykon, estilo realista) y CuteYukiMix *Adorable* (de kemiaomiao, estilo anime), realizadas con la herramienta propia del autor, `npuforge`, en la modalidad "Convert as → SD1.5 Swap".

La innovacion principal de estos ficheros es que la UNet convertida expone las residuales de LoRA (rango 64, 160 objetivos) y de ControlNet como entradas del grafo. Esto permite elegir la LoRA y el ControlNet en tiempo de render sin volver a convertir el modelo, algo poco habitual en despliegues de difusion sobre NPU. El resultado se distribuye como contexto QNN (QAIRT 2.50) a resolucion 512x512.

El modelo esta pensado para consumirse desde la aplicacion Nightmare Mobile (Android, inferencia 100 % local, sin servidor ni cuenta), que descarga e instala estos ficheros desde su pestana de modelos. Su relevancia actual es acotada: es infraestructura de despliegue movil para hardware muy concreto, no un modelo de proposito general, y el repositorio no presenta descargas, likes ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente derivada de Stable Diffusion 1.5 (U-Net con atencion cruzada, VAE y codificador de texto CLIP), convertida a grafos QNN para NPU Hexagon |
| Parametros totales | no disponible (no se publica recuento; derivado de SD 1.5) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; resolucion de generacion 512x512 |
| Tipos de cuantizacion | no disponible (contextos QNN QAIRT 2.50 en ficheros `.bin`; el autor no detalla precision interna) |
| Idiomas soportados | no disponible (el prompt se procesa con el codificador de texto CLIP; no hay listado oficial de idiomas) |
| Licencia | openrail; se aplica ademas la licencia propia de cada checkpoint (derivados de Stable Diffusion 1.5: CreativeML OpenRAIL-M y sus restricciones de uso) |
| Formato de pesos | Contextos QNN `.bin` (`unet.bin`, `vae_encoder.bin`, `vae_decoder.bin`), `.mnn` para el codificador de texto (`clip_v2.mnn`) mas embeddings y `tokenizer.json`, y `lora_targets.json`; empaquetado en zip plano |

## Arquitectura y entrenamiento

La base es la arquitectura de difusion latente de Stable Diffusion 1.5, con una U-Net que aplica atencion cruzada sobre las incrustaciones del codificador de texto CLIP ViT-L/14. La conversion con `npuforge` no modifica los pesos: transforma el checkpoint en grafos ejecutables sobre la NPU Hexagon y separa las piezas en contextos QNN independientes (U-Net, encoder de VAE y decoder de VAE), dejando el codificador de texto en CPU mediante MNN. El fichero `lora_targets.json` fija el orden de las 160 entradas de LoRA y ademas marca la carpeta como variante "Swap".

La innovacion tecnica es precisamente ese contrato de entradas: las residuales de LoRA (rango 64, 160 objetivos) y de ControlNet son entradas del grafo, de modo que se pueden intercambiar por render sin reconvertir la U-Net. Los contextos se compilaron sobre un Snapdragon 8 Elite, por lo que requieren Hexagon v79 o superior; el autor indica que tiene planificadas compilaciones para v73 (8 Gen 2 y 8 Gen 3) y v68 (888 y 8 Gen 1). No hay informacion sobre datos de entrenamiento, composicion del dataset, RLHF o DPO, porque no hubo entrenamiento alguno. Los ControlNet compatibles se publican en un repositorio aparte del mismo autor.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) a 512x512, en dos estilos: realista (AbsoluteReality v1.8.1) y anime (CuteYukiMix *Adorable*).
- Imagen a imagen e inpainting dentro de Nightmare Mobile (el autor publica ademas `npuforge-sd15-inpaint-diff`, un fichero de diferencia que convierte un checkpoint SD 1.5 de 4 canales en un modelo de inpainting de 9 canales).
- Carga dinamica de LoRA en tiempo de render, sin reconversion, gracias a las 160 entradas de LoRA expuestas en el grafo.
- Carga dinamica de ControlNet en tiempo de render mediante las residuales expuestas como entradas del grafo.
- Ejecucion integra en el dispositivo (NPU Hexagon y CPU), sin servidor, sin cuenta y sin llamadas a la nube.
- Edicion de grafos por nodos al estilo ComfyUI dentro de la aplicacion Nightmare Mobile.
- No dispone de tool calling, function calling, modo agente, razonamiento multi-paso, vision de entrada, audio ni modo "thinking": es un modelo de generacion de imagenes.

## Casos de uso

- Generacion de imagenes sin conexion en Android: la aplicacion ejecuta la U-Net, el VAE y el ControlNet en la NPU Hexagon y deja el codificador de texto en CPU, de modo que el usuario puede generar a 512x512 sin red ni cuenta, util en entornos sin cobertura o con requisitos de confidencialidad.
- Ilustracion de estilo anime en movil: el fichero basado en CuteYukiMix *Adorable* permite obtener salidas de estetica anime directamente en un Snapdragon 8 Elite, sin depender de servicios en la nube ni de tarjetas graficas de escritorio.
- Previsualizacion fotografica realista en campo: con el checkpoint AbsoluteReality v1.8.1, fotografos o disenadores pueden generar variaciones realistas en el propio telefono antes de comprometer un render final en estacion de trabajo.
- Control estructural con ControlNet: al exponerse las residuales de ControlNet como entradas del grafo, se puede condicionar la generacion por pose, profundidad u otros mapas y cambiar de ControlNet entre renders sin reconvertir el modelo, lo que agiliza la iteracion de composicion.
- Intercambio rapido de estilos con LoRA: al aceptar LoRA de rango 64 sobre 160 objetivos sin reconversion, un mismo fichero sirve para probar distintos estilos o personajes simplemente cambiando la LoRA cargada por render.
- Retoque y borrado de objetos mediante inpainting: combinando el pipeline de inpainting de Nightmare Mobile con los ControlNet del autor, se pueden reparar zonas concretas de una imagen generada o de una foto importada, todo en local.
- Integracion en cadenas de generacion por nodos: el editor de grafos tipo ComfyUI de la aplicacion permite encadenar text-to-image, upscaling manual o inpainting como etapas de un flujo reproducible, replicable desde el catalogo de modelos (`ModelCatalog.kt`) del repositorio.
- Pruebas de despliegue en NPU para desarrolladores: quien quiera evaluar el coste real de ejecutar difusion sobre Hexagon puede usar estos ficheros como referencia de empaquetado (contextos QNN, tokenizer, orden de objetivos LoRA) antes de convertir sus propios checkpoints con `npuforge`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- SoC: Qualcomm Snapdragon 8 Elite o 8 Elite Gen 5 (Hexagon v79 o superior). Las compilaciones `_v79` no cargaran en generaciones anteriores.
- En desarrollo por el autor: compilaciones para v73 (Snapdragon 8 Gen 2 y 8 Gen 3) y v68 (Snapdragon 888 y 8 Gen 1).
- Sistema operativo: Android 12 o superior, arquitectura arm64.
- Memoria: no disponible (no se publican cifras de RAM ni de memoria de NPU necesarias).
- Aceleracion: NPU Hexagon para U-Net, encoder de VAE y decoder de VAE; CPU para el codificador de texto (MNN).
- Formato de distribucion: zip plano descargado e instalado desde la pestana de modelos de la aplicacion; el APK de Nightmare Mobile pesa 61 MB.
- Tiempos de inferencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nightmare-sd15-swap-models (este repositorio) | no disponible (derivado de SD 1.5) | 512x512 | Contextos QNN sobre NPU Hexagon v79+ | openrail + licencia del checkpoint base | 0 descargas, 0 likes en HuggingFace |
| AbsoluteReality v1.8.1 (Lykon), checkpoint original | no disponible en la informacion | 512x512 (SD 1.5) | safetensors / PyTorch, GPU de escritorio | CreativeML OpenRAIL-M | publicado por su autor en plataformas de checkpoints |
| CuteYukiMix *Adorable* (kemiaomiao), checkpoint original | no disponible en la informacion | 512x512 (SD 1.5) | safetensors / PyTorch, GPU de escritorio | CreativeML OpenRAIL-M | publicado por su autor en plataformas de checkpoints |
| nightmare-sd15-controlnet-qnn (mismo autor) | no disponible | 512x512 | Contextos QNN sobre NPU Hexagon | no disponible | HuggingFace |
| npuforge-sd15-inpaint-diff (mismo autor) | no disponible | no disponible | safetensors f16 (fichero de diferencia de 9 canales) | no disponible | HuggingFace |

La comparacion relevante no es de calidad de generacion, sino de plataforma: los checkpoints originales requieren PyTorch y una GPU, mientras que estas conversiones se ejecutan en la NPU de un movil con Snapdragon 8 Elite o posterior, a cambio de atarse a un SoC concreto.

## Limitaciones y advertencias

- No es un modelo nuevo: son conversiones sin reentrenamiento, por lo que heredan tanto las capacidades como los sesgos y defectos de AbsoluteReality v1.8.1 y CuteYukiMix *Adorable*, incluidos los sesgos de representacion tipicos de los datasets de SD 1.5.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible, manos deformes o detalles incoherentes, especialmente a 512x512 y sin refinado posterior.
- Compatibilidad de hardware muy restringida: los ficheros `_v79` solo cargan en Hexagon v79 o superior (Snapdragon 8 Elite y 8 Elite Gen 5). Las variantes para v73 y v68 estan anunciadas pero no publicadas.
- Dependencia de la aplicacion: el uso previsto es a traves de Nightmare Mobile; no se documenta una via de ejecucion independiente ni un pipeline de HuggingFace.
- Licencia: el repositorio declara openrail, pero cada fichero conserva la licencia del checkpoint de origen (CreativeML OpenRAIL-M y sus restricciones de uso). Cualquier uso comercial o de redistribucion debe comprobar los terminos del checkpoint base y la autorizacion de su autor.
- Al ser conversiones de terceros, el autor del repositorio no es el titular de los pesos originales y no puede relajar las condiciones de las licencias de origen.
- Ausencia total de benchmarks publicados, de documentacion de precision numerica y de validacion por parte de la comunidad (0 descargas, 0 likes), lo que impide estimar la degradacion respecto a los checkpoints en PyTorch.
- Las LoRA deben respetar el contrato de 160 objetivos definido en `lora_targets.json`; una LoRA con un mapeo distinto puede no cargar correctamente.
- No hay informacion sobre idiomas soportados por el prompt ni sobre limites de longitud del mismo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AbrahamPJ/nightmare-sd15-swap-models
- ControlNet para QNN del mismo autor: https://huggingface.co/AbrahamPJ/nightmare-sd15-controlnet-qnn
- Fichero de diferencia para inpainting: https://huggingface.co/AbrahamPJ/npuforge-sd15-inpaint-diff
- Aplicacion Nightmare Mobile (GitHub): https://github.com/AbrahamPaulJ/nightmare-mobile
- Catalogo de modelos de la aplicacion: https://github.com/AbrahamPaulJ/nightmare-mobile/blob/main/app/src/main/java/com/abrah/nightmare/ModelCatalog.kt
- Versiones publicadas de Nightmare Mobile: https://github.com/AbrahamPaulJ/nightmare-mobile/releases
- Herramienta de conversion npuforge: https://github.com/AbrahamPaulJ/npuforge
- Biblioteca de checkpoints y LoRA de la comunidad (Civitai): https://civitai.com/models
