# fastforks/detr

## Resumen

DETR (Detection Transformer) es un modelo de detección de objetos end-to-end presentado por Carion et al. en 2020 (Facebook AI Research) que sustituye los componentes clásicos de los detectores basados en CNN (anchors, propuestas de región y supresión no máxima) por un transformer encoder-decoder que predice directamente el conjunto de cajas y etiquetas. Este repositorio, `fastforks/detr`, no contiene pesos propios: es una model card que documenta la integración de los pesos originales de los autores en la librería `fastforks`, con verificación SHA-256 y dos backends de ejecución (`portable` en PyTorch y `kernels` con CUDA propio).

El modelo está disponible en dos variantes, `detr-r50-coco` y `detr-r101-coco`, ambas entrenadas sobre COCO 2017 con backbone ResNet-50 o ResNet-101 inicializado desde ImageNet-1k. La arquitectura combina un backbone convolucional con un transformer de 6 capas de encoder y 6 de decoder sobre 100 object queries, y produce cajas normalizadas, puntuaciones y etiquetas de clase en una sola pasada.

La relevancia actual de esta ficha reside en la infraestructura de despliegue que documenta: la librería `fastforks` ofrece kernels CUDA que aceleran la inferencia entre 1,2x y 5,8x respecto al código original, con paridad numérica verificada (max |diff| <= 0,002 en CPU fp32) y consumo de memoria reducido, lo que facilita ejecutar DETR en GPUs de consumo con imágenes de hasta 12 MP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN backbone (ResNet-50 o ResNet-101) + transformer encoder-decoder (6+6 capas) con 100 object queries |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de cualquier H x W >= 32, con padding a múltiplo de 32) |
| Tipos de cuantizacion | fp32 (original) y fp16 (por defecto en `portable` y `kernels`) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.pth` (PyTorch, pesos originales de los autores, no alojados en el repo) |

## Arquitectura y entrenamiento

DETR sigue un diseño encoder-decoder de transformer aplicado a detección: un backbone ResNet extrae un mapa de características que se aplana y se pasa por un encoder de 6 capas; un decoder de 6 capas, con 100 object queries aprendidas, produce predicciones en paralelo de cajas normalizadas y logits de clase. El entrenamiento usa matching bipartito húngaro entre predicciones y anotaciones ground truth, lo que elimina la necesidad de NMS y de anchors. La variante `r50` usa ResNet-50 y la `r101` usa ResNet-101 como backbone.

Los pesos se entrenaron sobre COCO 2017 train (anotaciones de instancia) durante 500 epochs, con el backbone inicializado desde el modelo ImageNet-1k de torchvision. La model card no documenta uso de RLHF ni DPO (no aplica a un detector). La innovación destacable de esta integración es el backend `kernels`, que implementa kernels CUDA propios (`cudnn_hacc`) y requiere un kernel precompilado para la arquitectura de GPU del usuario, descargado desde `fastforks/kernels` en el primer uso; si no hay kernel disponible lanza `BackendUnavailableError` sin fallback silencioso.

## Capacidades

- Detección de objetos end-to-end: devuelve `boxes` ([N,4]), `scores` ([N]) y `labels` ([N]) en una sola pasada, sin NMS.
- Segmentación de instancias: la model card indica que la salida incluye máscaras de instancia, aunque el ejemplo de uso solo expone cajas, puntuaciones y etiquetas.
- Clasificación sobre las 80 clases de COCO.
- Entrada de imagen RGB de cualquier resolución H x W >= 32 (con padding a múltiplo de 32); probado hasta 3000x4000 en fp16.
- Ejecución en dos backends: `portable` (PyTorch puro, GPU o CPU) y `kernels` (CUDA propio con aceleración).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de texto: es exclusivamente un modelo de visión.
- No dispone de thinking mode, visión-lenguaje, audio ni otras modalidades.

## Casos de uso

- Detección en pipelines de visión por computador: cargar `detection.load("detr-r50-coco")` y procesar imágenes con `model("photo.jpg")` para obtener cajas y etiquetas COCO; adecuado por su API mínima y su naturaleza end-to-end sin NMS.
- Procesamiento de imágenes de alta resolución: con el backend `kernels`, el modelo procesa una imagen de 12 MP (4000x3000) en 16,7 ms con 600 MiB de memoria pico en `detr-r50-coco`, lo que permite analizar fotografías aéreas o de vigilancia sin trocear.
- Inferencia en GPUs de consumo: el consumo pico de 191-240 MiB en 640x480 con `kernels` permite desplegar el modelo en tarjetas con poca VRAM (probado en RTX 5060 Ti 16 GB).
- Sistemas de conteo y localización de objetos en tiempo real: con latencias de 7,7-9,8 ms por imagen en resoluciones de 640x480 a 1920x1080, es viable en aplicaciones interactivas o de vídeo a baja frecuencia.
- Prototipado e investigación en detección: al mantener paridad numérica con el código original (max |diff| <= 0,002 en CPU fp32), sirve como referencia reproducible para comparar variantes o reproducir resultados de Carion et al. 2020.
- Despliegue con verificación de integridad: el repo documenta SHA-256 de los pesos originales, útil en entornos que requieren trazabilidad de artefactos y licencias Apache-2.0 para uso comercial.

## Benchmarks y rendimiento

Detección sintética a 800x1344 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB) | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `detr-r101-coco` | 78,9 | 80,8 | 18,69 | 13,69 | 5,8x | 531 / 650 | 316 / 368 | 254 / 328 |
| `detr-r50-coco` | 55,5 | 62,0 | 12,36 | 9,93 | 5,6x | 459 / 558 | 280 / 332 | 218 / 272 |

Tiempo y memoria pico por resolución fija (tiempo ms / memoria asignada / reservada en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `detr-r101-coco` | portable | 14,4 / 278 / 332 | 17,6 / 307 / 356 | 18,3 / 320 / 416 | 23,8 / 636 / 676 |
| `detr-r101-coco` | kernels | 10,5 / 228 / 278 | 13,0 / 248 / 294 | 13,3 / 262 / 354 | 19,8 / 637 / 678 |
| `detr-r50-coco` | portable | 9,5 / 241 / 296 | 11,6 / 270 / 320 | 12,2 / 283 / 380 | 18,7 / 599 / 640 |
| `detr-r50-coco` | kernels | 7,7 / 191 / 240 | 8,9 / 211 / 256 | 9,8 / 225 / 316 | 16,7 / 600 / 640 |

Carga y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `detr-r101-coco` | 0,95 | 0,81 | 0,22 | 0,06 | 0,02 | 0,01 |
| `detr-r50-coco` | 2,55 | 0,70 | 0,28 | 0,83 | 0,44 | 0,03 |

No se han publicado resultados de benchmarks de precisión (mAP, AP50, etc.) en la información disponible; la model card solo reporta paridad numérica con el código original.

## Requisitos de hardware

- VRAM estimada: 191-240 MiB pico en 640x480 con `kernels` (`detr-r50-coco`), hasta 600-678 MiB en imágenes de 12 MP; en `portable`, 241-296 MiB y 599-676 MiB respectivamente.
- GPU recomendadas: cualquier GPU NVIDIA compatible con el kernel precompilado de `fastforks/kernels` y driver reciente; las pruebas se realizaron en RTX 5060 Ti 16 GB (sm_120).
- Cabe en GPU de consumo: sí, con consumo pico por debajo de 1 GiB incluso a 12 MP según las mediciones del autor.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`) con backend `portable` (PyTorch, GPU o CPU) o `kernels` (CUDA propio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de visión).
- Latencia y throughput: 7,7 ms por imagen a 640x480 y 16,7 ms a 12 MP con `kernels` en `detr-r50-coco`; 10,5 ms y 19,8 ms respectivamente en `detr-r101-coco`. El throughput no se documenta explícitamente.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precisión ni de comparativas con otros detectores en la información proporcionada. A continuación se comparan las dos variantes incluidas en el repositorio:

| Modelo | Backbone | Contexto de entrada | Latencia 640x480 (kernels) | Memoria pico 640x480 (kernels) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `detr-r50-coco` | ResNet-50 | H x W >= 32 | 7,7 ms | 191 MiB | Apache-2.0 | pesos originales vía enlace del autor |
| `detr-r101-coco` | ResNet-101 | H x W >= 32 | 10,5 ms | 228 MiB | Apache-2.0 | pesos originales vía enlace del autor |

Comparativa con alternativas externas (Faster R-CNN, YOLO, etc.): no disponible.

## Limitaciones y advertencias

- El repositorio no aloja pesos: solo contiene la model card; la descarga de pesos depende de los enlaces del autor y de la verificación SHA-256.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU del usuario; si no existe, lanza `BackendUnavailableError` sin fallback automático a `portable`.
- DETR es conocido por un entrenamiento lento y un rendimiento inferior en objetos pequeños respecto a detectores modernos; la model card no reporta métricas de precisión que permitan cuantificar esta limitación.
- No procesa texto ni lenguaje: no es adecuado para tareas de NLP, tool calling ni agentes.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y etiquetas erróneas en detección, no cuantificado en la información disponible.
- Sesgos: no documentados en la model card; al entrenarse sobre COCO 2017, hereda los sesgos de composición y anotación de ese dataset.
- Licencia Apache-2.0 permite uso comercial según la tabla de variantes; la model card advierte que las cadenas de licencia del código original se registran tal cual y deben revisarse antes de otros usos.
- La fecha de creación del repositorio (2026-11-04) y la ausencia de descargas y likes indican que se trata de una integración reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/detr
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Repositorio de la librería: https://github.com/kleinicke/fastforks
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/detection/models/detr/card.toml
- Pesos `detr-r101-coco`: https://dl.fbaipublicfiles.com/detr/detr-r101-2c7b67e5.pth
- Pesos `detr-r50-coco`: https://dl.fbaipublicfiles.com/detr/detr-r50-e632da11.pth
- Código original de Facebook Research: https://github.com/facebookresearch/detr (commit `29901c51d7fe`)
- Licencia del código original: https://github.com/facebookresearch/detr/blob/29901c51d7fe8712168b8d0d64351170bc0f83e0/README.md
