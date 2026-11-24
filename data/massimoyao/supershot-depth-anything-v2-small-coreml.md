# massimoYao/supershot-depth-anything-v2-small-coreml

## Resumen

Depth Anything V2 Small Core ML es la conversión a formato Core ML del modelo de estimación de profundidad monocular Depth Anything V2 Small, desarrollado originalmente por Lihe Yang y coautores y convertido a Core ML por Apple. El repositorio, mantenido por el usuario massimoYao, es un espejo byte a byte del paquete `.mlpackage` publicado por Apple, pensado para su uso en dispositivos iOS dentro de la aplicación SuperShot, donde se emplea para generar efecto de profundidad de campo.

El modelo resuelve la tarea de estimación de profundidad densa a partir de una única imagen RGB, produciendo un mapa de profundidad por píxel. La variante Small emplea pesos en precisión FP16, lo que reduce el tamaño del paquete a unos 45,8 MB (45.828.566 bytes) y lo hace adecuado para inferencia en el dispositivo sin conexión a red.

Su relevancia radica en que permite ejecutar estimación de profundidad en tiempo real en hardware Apple (iPhone, iPad, Mac con Neural Engine) mediante Core ML, sin depender de servicios en la nube. No obstante, el repositorio no aporta información sobre arquitectura interna, datos de entrenamiento ni benchmarks; toda la documentación técnica disponible remite al proyecto original y a la model card de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo original: Depth Anything V2 Small; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP16 (variante F16 del paquete Core ML) |
| Idiomas soportados | no disponible (no aplica, tarea de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (ZIP `DepthAnythingV2SmallF16.mlpackage.zip`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada. El modelo original Depth Anything V2 Small es un modelo de estimacion de profundidad monocular basado en un encoder tipo DINOv2 y un decoder de profundidad, pero estos detalles no se confirman en la documentacion de este repositorio.

La conversion a Core ML la realizo Apple y el paquete se distribuye en FP16. El repositorio es un espejo byte a byte del ZIP original de Apple, con SHA-256 `8e875979ec82fa46f292468a7567a520b2aa07c41008c32141f3396da05a4067`. No se documentan procesos de RLHF, DPO ni innovaciones tecnicas adicionales en la informacion disponible.

## Capacidades

- Estimacion de profundidad monocular densa a partir de una imagen RGB de entrada.
- Generacion de mapas de profundidad por pixel, utilizables para efectos de desenfoque selectivo (depth of field).
- Inferencia en dispositivo mediante Core ML, sin necesidad de conexion a red.
- Ejecucion en hardware Apple con aceleracion por Neural Engine (iPhone, iPad, Mac).
- Modelo exclusivamente de vision: no soporta generacion de texto, codigo, tool calling, agentes ni capacidades multilingues.
- No dispone de modo de razonamiento (thinking mode), vision multimodal ni audio.

## Casos de uso

- Efecto retrato y profundidad de campo en apps de fotografia iOS: el modelo genera el mapa de profundidad de la foto capturada y permite aplicar desenfoque de fondo en postprocesado, tal como hace SuperShot.
- Edicion fotografica en el dispositivo: integracion en apps de retoque para separar sujeto y fondo sin subir imagenes a la nube, gracias a la inferencia local con Core ML.
- Realidad aumentada: uso del mapa de profundidad para oclusion y colocacion de objetos virtuales coherente con la escena en apps ARKit.
- Escaneo 3D aproximado: generacion de mapas de profundidad por fotograma como paso previo a reconstruccion de geometria en apps de modelado ligero.
- Segmentacion asistida por profundidad: combinacion del mapa de profundidad con tecnicas de segmentacion para aislar sujetos en pipelines de edicion por capas.
- Procesado por lotes en macOS: uso del paquete Core ML en Mac con Neural Engine para generar mapas de profundidad de bibliotecas fotograficas sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el paquete pesa 45,8 MB en FP16 y se ejecuta en memoria unificada en dispositivos Apple.
- GPU recomendadas: no disponible; el modelo esta pensado para Neural Engine y GPU de Apple (A-series, M-series).
- Cabe en dispositivos consumer Apple: si, en iPhone, iPad y Mac compatibles con Core ML.
- Opciones de despliegue: Core ML (framework nativo de Apple); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio no documenta arquitectura, parametros ni datos de entrenamiento; cualquier evaluacion tecnica debe remitirse al proyecto original y a la model card de Apple.
- Modelo limitado a estimacion de profundidad; no sirve para tareas de texto, codigo o razonamiento.
- Solo ejecutable en el ecosistema Core ML de Apple; no es portable a otros runtimes sin conversion adicional.
- Riesgo de mapas de profundidad imprecisos en escenas con transparencias, superficies reflectantes o texturas repetitivas, comportamiento habitual en estimacion monocular (no confirmado en la documentacion disponible).
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia y atribucion del paquete original de Apple.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion comunitaria documentada.
- El tamano del repo figura como 0.0 GB, lo que puede indicar que los archivos no estan materializados o que la informacion de Hugging Face esta incompleta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/massimoYao/supershot-depth-anything-v2-small-coreml
- Proyecto original Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Model card de Apple en Hugging Face: https://huggingface.co/apple/coreml-depth-anything-v2-small
- ZIP original de Apple: https://ml-assets.apple.com/coreml/models/Image/DepthEstimation/DepthAnything/DepthAnythingV2SmallF16.mlpackage.zip
- Licencia: https://huggingface.co/massimoYao/supershot-depth-anything-v2-small-coreml/blob/main/LICENSE
