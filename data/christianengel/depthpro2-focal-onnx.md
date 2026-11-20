# christianengel/DepthPro2-focal-ONNX

## Resumen

DepthPro2-focal-ONNX es una exportación no oficial a formato ONNX del modelo `apple/DepthPro2-focal`, una red neuronal desarrollada por Apple Machine Learning Research que estima la longitud focal (en píxeles) de una fotografía sin necesidad de calibración de cámara. El repositorio, publicado por el usuario christianengel, incluye además grafos "auto" que encadenan este estimador de focal con los modelos de profundidad métrica Depth Pro 2 S y B, de modo que a partir de una sola imagen se obtienen simultáneamente la profundidad en metros y el valor `f_px`.

El modelo resuelve un problema clásico en visión por computador: la profundidad monocular métrica requiere conocer la focal de la cámara, y en fotografías de consumo ese dato no está disponible. DepthPro2-focal infiere esa focal a partir de la propia imagen, lo que permite desplegar estimación de profundidad métrica en escenarios sin metadatos EXIF fiables. La exportación ONNX facilita su integración en pipelines de inferencia con ONNX Runtime, TensorRT o despliegues en C++ y Python sin dependencia de PyTorch.

El repositorio tiene un tamaño de 1,0 GB y contiene variantes FP32 y FP16 con formas estáticas para dos relaciones de aspecto (480x640 y 384x672). La licencia es Apple AMLR, restringida a investigación no comercial. El modelo base `apple/DepthPro2-focal` cuenta con 23,5 millones de parámetros según la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para estimación de longitud focal y profundidad métrica monocular (Depth Pro 2); detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parametros totales | 23,5 millones (modelo base `apple/DepthPro2-focal`) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | FP32 y FP16 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License, solo investigación no comercial) |
| Formato de pesos | ONNX (opset 18, formas estáticas) |
| Entrada | `pixel_values`: float32 RGB en [0,1], NCHW, 480x640 o 384x672, sin normalizar |
| Salidas | `f_px` (float32, (1,)), `fov_deg` (horizontal y vertical), `depth_meters` (float32, (1,H,W)) |
| Tamaño del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de Depth Pro 2, una red de estimación de profundidad métrica monocular desarrollada por Apple. La model card cita el artículo "Depth Pro 2: Sharp and Temporally Consistent Metric Monocular Depth" (arXiv:2611.26603), cuyos autores incluyen a Peiyun Hu, Marko Mihajlovic, Lyndon Duong, Lahav Lipson, Wei Dong, Amäel Delaunoy, Stephan R. Richter y Vladlen Koltun. No se proporcionan datos sobre el número de tokens de entrenamiento, composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a un modelo de visión).

La exportación ONNX introduce varias modificaciones técnicas respecto al original: entrada de un solo fotograma sin redimensionado ni recorte internos (las resoluciones 480x640 y 384x672 corresponden a los tamaños nativos para 4:3 y 16:9), normalización ImageNet y conversión de FoV a `f_px` integradas en el grafo, y reescritura de `1/tan` como `cos/sin` porque ONNX Runtime no dispone de `Tan` en CUDA. En las variantes FP16 se mantienen en FP32 el trunk de atención del bloque 0, las tablas RoPE, la cabeza de focal y la cabeza de profundidad. Los grafos "auto" encadenan la salida de focal con los grafos de profundidad FP16 de DepthPro2-S y DepthPro2-B.

## Capacidades

- Estimación de longitud focal en píxeles (`f_px`) a partir de una imagen RGB, sin calibración.
- Cálculo del campo de visión horizontal y vertical (`fov_deg`).
- Estimación de profundidad métrica monocular en metros (`depth_meters`), con valor `inf` donde la distancia es infinita.
- Modo "auto": encadena estimación de focal y profundidad en un solo grafo (variantes `auto_s_fp16` y `auto_b_fp16`).
- Soporte de dos resoluciones nativas: 480x640 (4:3) y 384x672 (16:9).
- Procesamiento de vídeo mediante estimación de focal en los primeros fotogramas, mediana y fijación del valor para grafos de solo profundidad (Apple usa los primeros 16 fotogramas).
- Exportación compatible con ONNX Runtime (CUDA y CPU) y TensorRT.
- No dispone de tool calling, agentes, capacidades multilingües ni modos de razonamiento (es un modelo puramente visual).

## Casos de uso

- Robótica móvil sin calibración: un robot puede estimar la focal de su cámara a partir de una imagen y obtener profundidad métrica sin depender de parámetros intrínsecos previos, útil en plataformas donde la calibración se pierde o se desconoce.
- Reconstrucción 3D a partir de fotografías de consumo: al disponer de `f_px` y profundidad métrica, es posible generar nubes de puntos o mallas con escala real a partir de imágenes sin EXIF, integrándolo en pipelines de fotogrametría.
- Realidad aumentada en dispositivos sin calibración: la estimación de FoV y profundidad permite anclar objetos virtuales con escala métrica coherente en aplicaciones móviles.
- Procesamiento de vídeo para profundidad temporal: estimando la focal en los primeros fotogramas y manteniéndola fija, se pueden procesar secuencias completas con los grafos de solo profundidad, como describe la model card.
- Análisis de imágenes aéreas o de dron: en escenarios con lentes no estándar la estimación puede degradarse, pero para vistas de escala de habitación o paisaje los errores medidos son bajos (-3,4 % en la cámara de techo de 1920x1080).
- Integración en aplicaciones C++/Python con ONNX Runtime: al ser ONNX con formas estáticas y opset 18, se puede desplegar en entornos sin PyTorch, incluyendo servidores con TensorRT o CPUs.
- Investigación en visión por computador: como modelo de referencia para estudiar la relación entre focal estimada y error de profundidad, con paridad medida frente a PyTorch FP32 (error máximo de `f_px` del 0,01 % en FP32 y 0,02 % en FP16 a 480x640).

## Benchmarks y rendimiento

La model card no presenta benchmarks estándar (MMLU, HumanEval, etc., no aplicables). Sí incluye datos de paridad frente a PyTorch FP32 sobre un fixture de 17 fotogramas y una evaluación en dos cámaras calibradas:

| Archivo | Entrada | Precisión | MB | Error máx. `f_px` | AbsRel profundidad |
|---|---|---|---|---|---|
| `onnx/focal.onnx` | 480x640 | FP32 | 95 | 0,01 % | - |
| `onnx/focal_fp16.onnx` | 480x640 | FP16 | 53 | 0,02 % | - |
| `onnx/auto_s_fp16.onnx` | 480x640 | FP16 | 104 | 0,02 % | 0,0008 |
| `onnx/auto_b_fp16.onnx` | 480x640 | FP16 | 252 | 0,02 % | 0,0007 |
| `onnx/384x672/focal.onnx` | 384x672 | FP32 | 95 | 0,02 % | - |
| `onnx/384x672/focal_fp16.onnx` | 384x672 | FP16 | 53 | 0,12 % | - |
| `onnx/384x672/auto_s_fp16.onnx` | 384x672 | FP16 | 104 | 0,12 % | 0,0008 |
| `onnx/384x672/auto_b_fp16.onnx` | 384x672 | FP16 | 252 | 0,12 % | 0,0009 |

Evaluación de la estimación de focal en dos cámaras de robot calibradas y sin distorsión:

| Cámara | fx calibrada | fx estimada | Error |
|---|---:|---:|---:|
| Techo, vista de escala de habitación, 1920x1080 | 445,8 | 430,7 | -3,4 % |
| Muñeca, primer plano de pinza y mesa, 640x480 | 557,2 | 460,6 | -17,3 % |

La model card advierte que la profundidad escala con la focal, por lo que un error del 17 % en focal implica un 17 % de error en profundidad. Las mediciones de velocidad en RTX 3090 están marcadas como "en curso" y no se aportan cifras.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Los tamaños de los archivos ONNX (53-252 MB) sugieren que el modelo cabe holgadamente en GPUs de consumo, pero no se aportan cifras de VRAM.
- GPU recomendadas: la model card menciona mediciones en una NVIDIA GeForce RTX 3090, aunque los resultados están pendientes. No se especifican otras GPU.
- GPU de consumo: por el tamaño de los grafos (entre 53 y 252 MB), es razonable esperar que quepa en GPUs de consumo, pero no se confirma con datos en la información disponible.
- Opciones de despliegue: ONNX Runtime con `CUDAExecutionProvider` o `CPUExecutionProvider`; la model card menciona también TensorRT en las etiquetas. No se citan vLLM, llama.cpp ni Ollama (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles; las mediciones en RTX 3090 están marcadas como "en curso".

## Comparativa con modelos similares

La información disponible no incluye comparativas con otros modelos de estimación de profundidad o focal. Se puede comparar con las variantes del propio autor:

| Modelo | Función | Entrada | Precisión | Tamaño | Licencia |
|---|---|---|---|---|---|
| `christianengel/DepthPro2-focal-ONNX` | Focal + profundidad (auto) | 480x640 / 384x672 | FP32/FP16 | 53-252 MB | apple-amlr |
| `christianengel/DepthPro2-S-ONNX` | Profundidad (requiere `fx` medida) | 480x640 / 384x672 | FP16 | no disponible | apple-amlr |
| `christianengel/DepthPro2-B-ONNX` | Profundidad (requiere `fx` medida) | 480x640 / 384x672 | FP16 | no disponible | apple-amlr |

La model card recomienda usar DepthPro2-S-ONNX con una `fx` medida cuando se disponga de calibración, por ser más rápido y más preciso que una focal estimada. No se dispone de datos de benchmarks frente a alternativas de terceros.

## Limitaciones y advertencias

- Licencia Apple AMLR: uso exclusivo para investigación no comercial y académica. No apto para producción comercial sin licencia adicional de Apple.
- No afiliado ni respaldado por Apple; es una exportación no oficial.
- La estimación de focal falla en primeros planos y lentes no convencionales: error medido del -17,3 % en una cámara de muñeca a corta distancia.
- La profundidad escala con la focal, por lo que los errores de focal se propagan directamente a la profundidad (un 17 % de error en focal implica un 17 % en profundidad).
- Solo entrada de un fotograma y dos resoluciones fijas (480x640 y 384x672); no admite otras formas sin reexportar.
- Sin soporte de texto, tool calling, agentes ni capacidades multilingües.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de estimaciones plausibles pero incorrectas en escenas ambiguas o sin referencias de escala.
- Las mediciones de velocidad están pendientes; no hay datos de latencia o throughput publicados.
- El repositorio tiene 0 descargas en el momento de la consulta, lo que limita la validación comunitaria.
- La model card indica que la paridad se mide frente a PyTorch, no frente a verdad fundamental; los errores AbsRel de profundidad son de paridad, no de precisión absoluta.

## Enlaces

- Hugging Face: https://huggingface.co/christianengel/DepthPro2-focal-ONNX
- Modelo base: https://huggingface.co/apple/DepthPro2-focal
- Variante profundidad S: https://huggingface.co/christianengel/DepthPro2-S-ONNX
- Variante profundidad B: https://huggingface.co/christianengel/DepthPro2-B-ONNX
- Demo en navegador: https://huggingface.co/spaces/christianengel/DepthPro2-ONNX
- Código de exportación: https://github.com/protortyp/depthpro2-onnx (Apache-2.0)
- Artículo: arXiv:2611.26603, "Depth Pro 2: Sharp and Temporally Consistent Metric Monocular Depth" (Peiyun Hu et al., 2026)
- Fuente del modelo base: https://huggingface.co/apple/DepthPro2-focal/tree/f1be7a9
- Licencia: archivo `LICENSE` en el repositorio (Apple Machine Learning Research Model License)
