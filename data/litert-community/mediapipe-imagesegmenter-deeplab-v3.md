# litert-community/MediaPipe-ImageSegmenter-DeepLab-V3

## Resumen

MediaPipe DeepLab-v3 es un modelo de segmentación semántica de propósito general empaquetado como `deeplab_v3.tflite` (2,78 MB, FP32) para la tarea MediaPipe Image Segmenter. Lo distribuye la comunidad `litert-community` a partir de los artefactos oficiales de Google AI Edge y resuelve un problema muy concreto: dotar de segmentación densa a aplicaciones Android, iOS, web, Python y Flutter sin depender de un servidor, ejecutando la inferencia en el propio dispositivo.

El modelo es una implementación de DeepLab-v3 con atrous spatial pyramid pooling (ASPP) que recibe un tensor RGB `[1, 257, 257, 3]` y devuelve logits por píxel `[1, 257, 257, 21]` correspondientes a las 21 clases de Pascal VOC (fondo, persona, animales, vehículos, mobiliario, etc.). No es un modelo generativo ni un LLM: es un segmentador convolucional compacto pensado para latencia baja y huella mínima en hardware móvil.

Su relevancia actual reside en el formato: LiteRT/TFLite con metadatos `TFLITE_METADATA` embebidos (`labelmap.txt`, `labels.txt`), lo que permite cargarlo directamente con la API `ImageSegmenter` de MediaPipe sin preprocesado manual de etiquetas. La licencia Apache 2.0 facilita su integración comercial en productos de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLab-v3 con atrous spatial pyramid pooling (ASPP), red convolucional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 257 x 257) |
| Tipos de cuantizacion | FP32 (float32); no se distribuyen variantes cuantizadas en el repo |
| Idiomas soportados | no disponible (no procesa texto; etiquetas en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`deeplab_v3.tflite`, LiteRT) con metadatos embebidos |

Especificaciones adicionales del tensor:

| Elemento | Detalle |
|---|---|
| Entrada | `sub_7`, shape `[1, 257, 257, 3]`, float32, normalización `mean=[127.5]`, `std=[127.5]` |
| Salida | `ResizeBilinear_3`, shape `[1, 257, 257, 21]`, float32 (logits/probabilidades por clase) |
| Clases | 21 de Pascal VOC (0 background … 20 tv) |
| Tamano del fichero | 2.780.176 bytes (2,78 MB) |
| SHA-256 | `ff36e24d40547fe9e645e2f4e8745d1876d6e38b332d39a82f0bf0f5d1d561b3` |

## Arquitectura y entrenamiento

DeepLab-v3 es una red convolucional totalmente segmentadora que combina un backbone convolucional con ASPP para capturar contexto multi-escala mediante convoluciones dilatadas a distintas tasas. En esta variante MediaPipe, la entrada se fija a 257 x 257 píxeles y la salida se remuestrea con `ResizeBilinear` hasta la resolución de entrada, produciendo 21 canales de logits, uno por clase Pascal VOC. El modelo se exporta a TFLite con metadatos que declaran el nombre `ImageSegmenter`, versión `1` y autor `MediaPipe`, e incluyen los ficheros `labelmap.txt` y `labels.txt` empaquetados.

La información disponible no detalla el número de tokens de entrenamiento (no aplica), la composición exacta del dataset ni si hubo fases de ajuste fino posteriores al entrenamiento original de DeepLab-v3 sobre Pascal VOC. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal, propias de modelos generativos y ajenas a este tipo de segmentador. El artefacto distribuido es FP32 sin variantes cuantizadas en el repositorio.

## Capacidades

- Segmentación semántica densa por píxel sobre 21 clases de Pascal VOC.
- Clases cubiertas: `background`, `aeroplane`, `bicycle`, `bird`, `boat`, `bottle`, `bus`, `car`, `cat`, `chair`, `cow`, `dining table`, `dog`, `horse`, `motorbike`, `person`, `potted plant`, `sheep`, `sofa`, `train`, `tv`.
- Generación de máscara de categorías (`output_category_mask=True`) y máscaras de confianza por clase (`output_confidence_masks`).
- Ejecución en modo imagen (`VisionRunningMode.IMAGE`) mediante la API `ImageSegmenter` de MediaPipe.
- Despliegue multiplataforma: Android (Kotlin/Java), iOS (Swift), web (JavaScript/TypeScript), Python y Flutter (Dart).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es exclusivamente un modelo de visión.
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- **Efecto de fondo en videollamadas o apps de cámara**: usar la clase `person` de la máscara de salida para separar al usuario del fondo y aplicar desenfoque o sustitución en tiempo real en Android, iOS o web, aprovechando el tamaño de 2,78 MB y la inferencia on-device.
- **Moderación de contenido visual en el cliente**: detectar clases sensibles (por ejemplo, `person` en contextos no permitidos) antes de subir una imagen a un servidor, reduciendo coste de backend y preservando privacidad.
- **Segmentación para realidad aumentada**: generar máscaras de suelo, mobiliario (`chair`, `sofa`, `dining table`) o vehículos para anclar objetos virtuales en apps AR móviles con MediaPipe Tasks.
- **Preprocesado en pipelines de visión por computador**: producir máscaras semánticas gruesas como etapa previa a detectores o clasificadores en aplicaciones de bajo consumo, por ejemplo en dispositivos embebidos o navegador.
- **Análisis de escenas en aplicaciones de accesibilidad**: identificar clases como `car`, `bus`, `person` o `dog` para describir el entorno a usuarios con discapacidad visual, ejecutando el modelo localmente sin conexión.
- **Prototipado rápido en Python y notebooks**: validar la tarea de segmentación con el quickstart de MediaPipe y `hf_hub_download`, útil para pruebas de concepto antes de portar a móvil o web.
- **Automatización de recorte en apps de edición fotográfica**: generar máscaras de `person`, `cat`, `dog` o `potted plant` para recortes automáticos o stickers en Flutter y web.

## Benchmarks y rendimiento

La model card incluye una sección de latencias de la documentación oficial de MediaPipe Image Segmenter, pero la tabla de resultados aparece truncada en la información proporcionada, por lo que no es posible reproducir cifras concretas de latencia por dispositivo.

| Benchmark | Resultado |
|---|---|
| Latencia CPU/GPU por dispositivo | no disponible (tabla truncada en la información recibida) |
| Métricas de precisión (mIoU, pixel accuracy) | no disponible |
| Comparación con otros modelos | no disponible |

No se han publicado resultados de benchmarks de precisión (mIoU, accuracy) en la información disponible.

## Requisitos de hardware

- **VRAM/RAM estimada**: al ser un modelo de 2,78 MB en FP32, la huella de memoria es mínima; cabe holgadamente en cualquier dispositivo móvil, navegador o equipo de escritorio. No requiere GPU dedicada.
- **GPU recomendadas**: no aplica en el sentido de GPUs de datacenter; funciona en CPU móvil y en GPUs integradas. La documentación de MediaPipe reporta latencias para CPU y GPU en dispositivos móviles, aunque las cifras concretas no están disponibles en la información recibida.
- **Consumer GPU**: no necesita GPU de consumo; puede ejecutarse en CPU de teléfonos de gama media y en navegadores mediante WebAssembly/WebGL.
- **Opciones de despliegue**: MediaPipe Tasks (Python, Android, iOS, web, Flutter), LiteRT/TFLite runtime, y el ecosistema `litert-community`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: la model card remite a los benchmarks oficiales de MediaPipe Image Segmenter, pero los valores numéricos no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MediaPipe DeepLab-v3 (este) | Segmentación semántica | 257 x 257 | 21 (Pascal VOC) | 2,78 MB FP32 | Apache 2.0 | Hugging Face, LiteRT |
| Otros segmentadores MediaPipe (p. ej. SelfieSegmenter, HairSegmenter) | Segmentación binaria/específica | variable | 1-2 | no disponible | Apache 2.0 | MediaPipe |
| DeepLab-v3 original (TensorFlow) | Segmentación semántica | variable | 21 (Pascal VOC) | mayor | Apache 2.0 | TF Model Garden |
| Segment Anything (SAM) | Segmentación promptable | 1024 x 1024 | sin clases fijas | cientos de MB | Apache 2.0 | Meta AI |

La comparación cuantitativa de rendimiento con estas alternativas no está disponible en la información proporcionada. La diferencia principal frente a SAM es que este modelo produce clases semánticas fijas de Pascal VOC con un tamaño tres órdenes de magnitud menor, a costa de menor granularidad y vocabulario cerrado.

## Limitaciones y advertencias

- **Vocabulario cerrado**: solo segmenta 21 clases de Pascal VOC; cualquier objeto fuera de esa lista se etiquetará como `background` o como la clase más próxima, lo que limita su uso en dominios específicos (medicina, industria, satélite).
- **Resolución de entrada baja**: 257 x 257 píxeles implica pérdida de detalle en objetos pequeños o escenas con muchos elementos; la máscara se remuestrea, pero la información original ya está limitada.
- **Sesgos del dataset**: Pascal VOC tiene una distribución demográfica y geográfica concreta; el rendimiento puede degradarse en escenas no representadas (interiores no occidentales, iluminación extrema, etc.).
- **Riesgo de segmentación errónea**: al ser un modelo convolucional compacto, puede confundir clases visualmente similares (`chair` vs `sofa`, `car` vs `bus`) y producir bordes imprecisos.
- **Sin cuantización oficial en el repo**: solo se distribuye FP32; para reducir aún más el tamaño habría que cuantizar manualmente, con posible pérdida de precisión.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene revisar las condiciones de los artefactos originales de Google AI Edge y MediaPipe de los que deriva.
- **Sin soporte de texto ni multilingüe**: las etiquetas están en inglés y el modelo no procesa lenguaje; cualquier localización debe hacerse en la capa de aplicación.
- **Mantenimiento comunitario**: el repositorio lo mantiene `litert-community`, no Google directamente; la versión y el soporte pueden no coincidir con los artefactos oficiales de MediaPipe.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-DeepLab-V3
- Fichero del modelo: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-DeepLab-V3/blob/main/deeplab_v3.tflite
- Documentación MediaPipe Image Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
- Benchmarks oficiales: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter#benchmarks
- Guía de setup Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de setup Web: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de setup Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de setup iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de setup Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_segmenter
- Código fuente demo web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-segmenter.ts
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/python/image_segmentation.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_segmenter
