# qualcomm/Segment-Anything-Model-2

## Resumen

Segment-Anything-Model-2 (SAM 2) es la segunda generación del modelo de segmentación de Meta, adaptado y optimizado por Qualcomm para su ejecución en dispositivos con chipsets Snapdragon y Dragonwing. Este modelo unifica la segmentación de imágenes y vídeo en una única arquitectura promptable, capaz de generalizar a objetos no vistos sin entrenamiento adicional. La versión publicada por Qualcomm incluye pesos pre-exportados en formatos ONNX, QNN_DLC y TFLITE, con cuantización w8a8, pensados para desplegarse en la NPU de los SoC de Qualcomm mediante el Qualcomm AI Hub.

El checkpoint utilizado es `sam2.1_hiera_t`, la variante más ligera de SAM 2, con un encoder de 33,5 millones de parámetros y un decoder de 6,22 millones. El modelo acepta prompts interactivos (puntos, cajas o máscaras) y procesa vídeo con seguimiento temporal de objetos. Su relevancia actual radica en que permite segmentación en tiempo real en dispositivos móviles y edge, algo que la versión original de Meta no estaba optimizada para lograr. La licencia Apache 2.0 facilita su uso comercial y su integración en productos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer jerárquico (Hiera) para encoder + decoder de máscara promptable |
| Parametros totales | 39,72 M (encoder 33,5 M + decoder 6,22 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | float32, w8a8 (int8) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (pre-exportados); safetensors en el repo original de Meta |

## Arquitectura y entrenamiento

SAM 2 se basa en una arquitectura de dos componentes: un encoder de imagen Hiera (un transformer jerárquico con atención de ventana) que extrae características de alta resolución, y un decoder de máscara que procesa los prompts del usuario (puntos, cajas o máscaras) para generar la segmentación. Para vídeo, el modelo incorpora un módulo de memoria que almacena embeddings de fotogramas anteriores y permite el seguimiento temporal de objetos. El checkpoint `sam2.1_hiera_t` es la versión tiny, optimizada para latencia baja.

El entrenamiento original de SAM 2 se realizó sobre el dataset SA-V (Segment Anything Video), que contiene más de 50.000 vídeos y 600.000 máscaras, además de los datos de imágenes de SA-1B. No se ha publicado información específica sobre el número total de tokens o la composición exacta del dataset en la documentación de Qualcomm. La versión de Qualcomm no modifica los pesos, sino que los convierte a formatos optimizados para NPU, manteniendo la arquitectura original. No se menciona el uso de RLHF ni DPO, ya que es un modelo de visión puro.

## Capacidades

- Segmentación de imágenes con prompts interactivos: puntos, cajas o máscaras de entrada.
- Segmentación de vídeo con seguimiento de objetos a lo largo de los fotogramas.
- Generalización zero-shot a objetos y categorías no vistas durante el entrenamiento.
- Procesamiento en tiempo real en dispositivos Qualcomm gracias a la optimización para NPU.
- Soporte de múltiples prompts simultáneos para segmentar varios objetos en una misma escena.
- Capacidad de refinar la segmentación mediante iteraciones con prompts adicionales.
- No incluye capacidades de texto, tool calling ni agentes, al ser un modelo exclusivamente visual.

## Casos de uso

- Edición de imágenes en móviles: recortar objetos de una foto con un toque en la pantalla, usando el modelo como backend de una app de retoque fotográfico. Su tamaño reducido y la cuantización w8a8 permiten ejecutarlo en la NPU de un Snapdragon 8 Elite con una latencia de 1,4 ms en el decoder.
- Seguimiento de objetos en vídeo para vigilancia: seleccionar un objeto en el primer fotograma y obtener su máscara en los siguientes, útil para sistemas de seguridad en edge. El módulo de memoria de SAM 2 mantiene la coherencia temporal.
- Segmentación semántica en agricultura de precisión: identificar plantas, frutos o plagas en imágenes capturadas por drones o cámaras fijas, con despliegue en dispositivos Dragonwing QCS6490.
- Herramientas de anotación automática para datasets: generar máscaras iniciales a partir de prompts de caja o punto, acelerando el etiquetado manual en pipelines de visión por computador.
- Realidad aumentada: separar el primer plano del fondo en tiempo real para superponer objetos virtuales, aprovechando la baja latencia en Snapdragon X2 Elite (3,3 ms en float).
- Diagnóstico asistido por imagen médica: segmentar estructuras anatómicas en ecografías o radiografías, con la posibilidad de ajustar el resultado mediante prompts iterativos. La licencia Apache 2.0 permite su integración en productos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (mIoU, Dice, etc.) en la información disponible. La documentación de Qualcomm se centra en métricas de rendimiento de inferencia en hardware, que se detallan en la tabla siguiente:

| Modelo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|---|
| decoder | ONNX | float | Snapdragon X2 Elite | 3,338 | 16 |
| decoder | ONNX | w8a8 | Snapdragon X2 Elite | 1,337 | 4 |
| decoder | ONNX | w8a8 | Snapdragon 8 Elite Mobile | 1,437 | 0-128 |
| decoder | ONNX | w8a8 | Snapdragon 8 Gen 3 Mobile | 1,78 | 4-158 |
| decoder | QNN_DLC | float | Snapdragon 8 Elite Mobile | 2,92 | 4-191 |
| decoder | QNN_DLC | float | Snapdragon 8 Gen 1 Mobile | 10,029 | 4-217 |

Estos datos corresponden únicamente al decoder; el encoder no aparece desglosado en la información proporcionada. No se dispone de métricas de calidad de segmentación (como mIoU en SA-V) para esta versión optimizada.

## Requisitos de hardware

- Inferencia en NPU de Qualcomm: el modelo está diseñado para ejecutarse en la NPU de chipsets Snapdragon (8 Gen 1, 8 Gen 3, 8 Elite, X Elite, X2 Elite) y Dragonwing (QCS6490, QCS8450, Q-8750, etc.).
- Memoria: el decoder en float ocupa 16 MB de pico en Snapdragon X2 Elite; en w8a8 baja a 4 MB. El encoder en float pesa 128 MB, por lo que la memoria total estimada para el modelo completo ronda los 150 MB en float y menos de 50 MB en w8a8.
- GPU de escritorio: al ser un modelo pequeño (39,7 M parámetros), cabe en cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas consumer como GTX 1060 o RTX 2060. No se requieren GPUs de datacenter.
- Opciones de despliegue: los formatos pre-exportados (ONNX, QNN_DLC, TFLITE) se integran con Qualcomm AI Hub Workbench, ONNX Runtime y TFLite. Para uso general fuera de Qualcomm, se puede usar el repo original de Meta con PyTorch.
- Latencia: el decoder en w8a8 alcanza 1,3 ms en Snapdragon X2 Elite y 1,4 ms en Snapdragon 8 Elite, lo que permite procesamiento en tiempo real a 30 FPS o más.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SAM 2 (hiera_t) | 39,7 M | Imagen/vídeo | Apache 2.0 | PyTorch, ONNX | Versión original de Meta, sin optimización para NPU |
| SAM 2 (hiera_l) | 224 M | Imagen/vídeo | Apache 2.0 | PyTorch | Variante grande, mayor precisión pero más lenta |
| MobileSAM | 5,4 M | Imagen | Apache 2.0 | PyTorch, ONNX | Optimizado para móviles, solo imágenes, sin seguimiento temporal |
| FastSAM | 68 M | Imagen | Apache 2.0 | PyTorch | Basado en YOLOv8, segmentación sin prompts, más rápido pero menos preciso |

La versión de Qualcomm se diferencia de la original de Meta por ofrecer pesos pre-exportados y cuantizados para NPU, con tiempos de inferencia medidos en hardware real. MobileSAM es más ligero pero no soporta vídeo. FastSAM no es promptable y requiere un paso de detección previo.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos de internet (SA-1B y SA-V), puede presentar un rendimiento inferior en objetos poco representados o en contextos culturalmente específicos.
- Riesgo de alucinación en la segmentación: en escenas ambiguas o con oclusiones, el modelo puede generar máscaras incorrectas o inestables en vídeo.
- La cuantización w8a8 puede degradar ligeramente la precisión de los bordes de las máscaras en comparación con float32, aunque no se han publicado métricas cuantitativas.
- El modelo está optimizado para la NPU de Qualcomm; su uso en otras plataformas requiere conversión adicional y puede no alcanzar el mismo rendimiento.
- No soporta entrada de texto ni interacción multimodal; solo acepta prompts visuales (puntos, cajas, máscaras).
- La resolución de entrada está fijada a 720p (720x1280) en los assets pre-exportados; otras resoluciones requieren re-exportación con el SDK de Qualcomm.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/qualcomm/Segment-Anything-Model-2)
- [Página del modelo en Qualcomm AI Hub](https://aihub.qualcomm.com/models/sam2)
- [Repositorio de Qualcomm AI Hub Models (código de exportación)](https://github.com/qualcomm/ai-hub-models/blob/v0.61.0/src/qai_hub_models/models/sam2)
- [Repositorio original de SAM 2 (Meta)](https://github.com/facebookresearch/sam2)
- [Paper de SAM 2 (arXiv:2408.00714)](https://arxiv.org/abs/2408.00714)
