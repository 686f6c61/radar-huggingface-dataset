# apple/DepthPro2-H

## Resumen

Depth Pro 2 es un modelo de estimación de profundidad monocular métrica desarrollado por Apple, presentado en el informe técnico arXiv:2611.26603. A diferencia de los modelos de lenguaje, su tarea es predecir un mapa de profundidad en metros a partir de una única imagen o de un clip de vídeo, con bordes nítidos y consistencia temporal entre fotogramas. La variante H que nos ocupa tiene 872 millones de parámetros y se distribuye en formato safetensors a través de Hugging Face con el pipeline `depth-estimation`.

El modelo resuelve dos problemas clásicos de la profundidad monocular: la falta de escala métrica absoluta (predice distancias reales en metros, no solo mapas relativos) y la inconsistencia entre fotogramas en vídeo. Para ello incorpora un estimador de distancia focal separado (`apple/DepthPro2-focal`, 23,5 M de parámetros) que se carga junto al modelo principal cuando la imagen no trae EXIF o el vídeo no aporta focal. La familia Depth Pro 2 se publica en varios tamaños; esta ficha cubre la variante H+.

Es relevante ahora porque combina precisión métrica con procesamiento de vídeo a resoluciones altas: según los datos del autor, procesa un clip de 32 fotogramas a 1080p a 5,3 fps en una NVIDIA B200, con un pico de memoria de 29,5 GiB. La licencia es, sin embargo, restrictiva: solo para investigación no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad; librería `depth-pro-2`) |
| Parámetros totales | 872.108.865 (modelo principal) + 23,5 M (estimador de focal `DepthPro2-focal`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; procesa clips de 32 fotogramas en una llamada) |
| Tipos de cuantización | no disponible (el autor documenta inferencia en bfloat16) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | Apple Machine Learning Research Model License (`apple-amlr`), solo investigación no comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna (tipo de backbone, uso de transformers, decodificadores o mecanismos de atención). La model card únicamente indica que el modelo se ejecuta en PyTorch eager en bfloat16, que procesa clips de vídeo de 32 fotogramas en una sola llamada a resolución nativa y que incorpora un estimador de campo de visión (FOV) separado que comparte entre todos los tamaños de la familia. El nombre del paquete (`depth_pro_2.network.fov.FOVEstimator`) sugiere un módulo específico para estimar la focal.

Tampoco se detallan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino con RLHF/DPO (poco habituales en modelos de profundidad). La innovación declarada en el título del informe técnico es la combinación de nitidez de bordes y consistencia temporal en profundidad métrica monocular, tanto para imagen como para vídeo. Cualquier dato adicional sobre capas, atención o pérdidas debe consultarse en el informe arXiv:2611.26603.

## Capacidades

- Estimación de profundidad monocular métrica: devuelve un mapa de profundidad en metros con forma `(H, W)` para una imagen de entrada.
- Estimación de profundidad en vídeo: procesa clips de 32 fotogramas en una sola llamada, con consistencia temporal entre fotogramas.
- Estimación de distancia focal: el modelo auxiliar `DepthPro2-focal` calcula la focal cuando la imagen no incluye EXIF o el vídeo no la proporciona.
- Uso de focal EXIF: si la imagen trae distancia focal en los metadatos, el modelo la acepta como entrada (`f_px`).
- Procesamiento a resolución nativa: soporta entradas VGA (640 × 480), 720p, 1080p y 4K en formato 16:9.
- Inferencia en bfloat16 sobre GPU.
- Interfaz de línea de comandos además de la API de Python.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente visual de regresión densa.

## Casos de uso

- Reconstrucción 3D y fotogrametría: el mapa de profundidad métrica en metros permite escalar nubes de puntos y mallas sin calibración manual, lo que simplifica la reconstrucción a partir de fotos o vídeos de un solo punto de vista.
- Realidad aumentada y mixta: la profundidad métrica por fotograma permite ocluir objetos virtuales con geometría real y colocar elementos a distancias físicas correctas en el mundo.
- Edición de vídeo con desenfoque de profundidad sintético: la consistencia temporal entre los 32 fotogramas del clip evita el parpadeo típico de aplicar un modelo de imagen por separado a cada fotograma.
- Segmentación y matting guiados por profundidad: usar el mapa de profundidad como señal auxiliar para separar primer plano y fondo en pipelines de posproducción.
- Robótica y navegación asistida: con una sola cámara monocular y el estimador de focal integrado, se obtienen distancias absolutas útiles para planificación de trayectorias en entornos controlados.
- Captura de escenas para gemelos digitales: digitalizar interiores o exteriores con vídeo de móvil y obtener profundidad métrica para generar mallas y texturas.
- Análisis de vídeo a alta resolución: el soporte hasta 4K permite trabajar con material de cine o drones, aunque con un coste de memoria elevado (114,6 GiB de pico en B200).

## Benchmarks y rendimiento

El autor publica una tabla de throughput y memoria en una NVIDIA B200, en bfloat16 y PyTorch eager (sin compilación), procesando un clip de 32 fotogramas a resolución nativa. No se han publicado en la información disponible resultados de benchmarks de precisión (AbsRel, δ1, RMSE) ni comparaciones con otros modelos de profundidad.

| Resolución | Throughput (fps) | Memoria pico (GiB) |
|---|---:|---:|
| VGA (640 × 480) | 95,9 | 8,3 |
| 720p (16:9) | 20,2 | 16,3 |
| 1080p (16:9) | 5,3 | 29,5 |
| 4K (16:9) | 0,4 | 114,6 |

## Requisitos de hardware

- VRAM estimada: según la tabla del autor en B200, entre 8,3 GiB (VGA) y 114,6 GiB (4K) de memoria pico reservada por PyTorch, incluyendo el estimador de focal.
- GPU recomendadas: NVIDIA B200 para las cifras publicadas; para 1080p se necesitan al menos ~30 GiB, lo que apunta a A100 40/80 GB, H100 o GPUs con 32 GB o más.
- GPU de consumo: VGA (8,3 GiB) y 720p (16,3 GiB) caben en tarjetas de 12-24 GB como la RTX 4090 o la RTX 3090; 1080p y 4K no caben en GPUs de consumo habituales.
- Opciones de despliegue: el paquete oficial se instala con `pip install "git+https://github.com/apple-aiml-research/ml-depth-pro-2"` y se ejecuta en PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 95,9 fps a VGA, 20,2 fps a 720p, 5,3 fps a 1080p y 0,4 fps a 4K en B200, medidos sobre un clip de 32 fotogramas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos de profundidad monocular (por ejemplo, Depth Pro original, Depth Anything, Metric3D) para establecer una comparación con cifras verificables. La model card remite a la página de la familia `apple/DepthPro2`, que agrupa los distintos tamaños, pero no incluye tablas comparativas con terceros.

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Depth Pro 2 H+ (este) | 872 M + 23,5 M (focal) | clips de 32 fotogramas, hasta 4K | apple-amlr (solo investigación) | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: la Apple Machine Learning Research Model License limita el uso a investigación científica no comercial y desarrollo académico; no permite uso comercial sin licencia adicional.
- Sin datos publicados de sesgos: no se documentan en la información disponible sesgos demográficos, geográficos o de otro tipo; al ser un modelo de profundidad, los sesgos se manifestarían como errores sistemáticos en ciertos materiales, iluminaciones o geometrías.
- Riesgo de error métrico: la profundidad absoluta depende de la focal estimada; si el estimador de FOV falla (por ejemplo, en imágenes con poca textura o lentes desconocidas), las distancias en metros pueden desviarse.
- Límite de longitud de vídeo: los clips se procesan en bloques de 32 fotogramas; para vídeos más largos hay que trocear y gestionar la continuidad entre bloques.
- Coste de memoria elevado a alta resolución: 4K requiere 114,6 GiB de pico, lo que excluye su uso en GPUs de consumo.
- Idiomas: no aplica, pero tampoco se documenta soporte para texto o metadatos en varios idiomas.
- Sin garantías de producción: al ser un modelo de investigación, no se documentan SLAs, versionado estable ni soporte; conviene fijar la revisión concreta del repositorio.
- Dependencia de la librería `depth-pro-2`: la API (`DepthPro2.from_pretrained`, `model.infer`) es específica del paquete oficial y puede cambiar entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apple/DepthPro2-H
- Familia completa: https://huggingface.co/apple/DepthPro2
- Estimador de focal: https://huggingface.co/apple/DepthPro2-focal
- Repositorio GitHub: https://github.com/apple-aiml-research/ml-depth-pro-2
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26603
- Página del proyecto: https://apple-aiml-research.github.io/ml-depth-pro-2/
- Licencia del modelo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/LICENSE_MODEL
- Demo interactiva (Space, aún no pública según la model card): https://huggingface.co/spaces/apple/DepthPro2
