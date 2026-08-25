# pablo-moreira/puzzle-piece-detection

## Resumen

El modelo **puzzle-piece-detection** es un detector de objetos basado en la arquitectura DETR con backbone ResNet-50, desarrollado por Pablo Moreira como parte del proyecto **PuzzleMap**. Su propósito es localizar piezas de puzle individuales en imágenes que contienen una o varias piezas, devolviendo para cada detección una bounding box, la clase `puzzle-piece` y una puntuación de confianza.

Se trata de un modelo fine-tuneado a partir de `facebook/detr-resnet-50`, con un único clasificador de clase foreground. El modelo se ha entrenado sobre el dataset público `pablo-moreira/puzzle-map`, que contiene imágenes anotadas con bounding boxes de piezas válidas. Con aproximadamente 41,6 millones de parámetros y un tamaño de repositorio de 0,8 GB, es ligero y adecuado para tareas de visión por computador en tiempo real o integrado en pipelines de análisis de puzzles.

La licencia CC-BY-4.0 permite uso comercial y modificación, lo que facilita su adopción en aplicaciones industriales o académicas. El modelo está disponible en formato safetensors y es compatible con la librería Transformers de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR ResNet-50 (Transformer encoder-decoder con backbone CNN) |
| Parametros totales | 41.607.878 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | No disponible (solo safetensors de precisión completa) |
| Idiomas soportados | Inglés (en), Portugués (pt) (idiomas de las anotaciones y documentación) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DETR (Detection Transformer), que reformula la detección de objetos como un problema de predicción de conjuntos directo. Utiliza un backbone ResNet-50 para extraer características de la imagen, seguido de un transformer con un conjunto fijo de *object queries*. Cada query predice una clase y una bounding box normalizada. En este caso, el clasificador se adapta a una única clase foreground (`puzzle-piece`) más la clase interna `no-object`.

El entrenamiento se realizó mediante fine-tuning del modelo preentrenado `facebook/detr-resnet-50` sobre el dataset `pablo-moreira/puzzle-map`, que contiene imágenes de piezas de puzzle con anotaciones de bounding box. El proceso utilizó PyTorch Lightning, optimizador AdamW con learning rate de 1e-4 para la cabeza de detección y 1e-5 para el backbone, weight decay de 1e-4, y se limitó a un máximo de 30 épocas con early stopping (patience 5). La validación se realizó sobre una división fija del dataset con semilla aleatoria.

## Capacidades

- Detección de piezas de puzzle en imágenes: genera bounding boxes para cada pieza visible.
- Clasificación de objeto único: solo identifica la clase `puzzle-piece`; no distingue tipos de piezas.
- Salida de confianza: para cada detección proporciona una puntuación de confianza (score).
- Preprocesamiento integrado: usa `DetrImageProcessor` para normalizar y redimensionar imágenes de entrada.
- Compatible con el ecosistema Hugging Face Transformers, lo que facilita su integración en pipelines de visión por computador.
- Soporte de inferencia por lotes (batch) para múltiples imágenes.

## Casos de uso

- **Sistemas de escaneo de piezas de puzzle**: el modelo puede integrarse en un sistema que fotografíe piezas sueltas sobre una superficie y devuelva sus posiciones exactas, permitiendo a un robot recogerlas o a un software de ensamblaje automático planificar movimientos.
- **Análisis de inventario en tiendas de juegos**: para catalogar y contar piezas de puzzle en una caja o almacén, el modelo detecta cada pieza en una imagen, facilitando el control de stock o la verificación de que no faltan piezas.
- **Herramientas de ayuda para aficionados al puzzle**: una aplicación móvil que fotografía la mesa de trabajo, detecta las piezas y las resalta en la pantalla, ayudando a localizar piezas específicas o a organizar el espacio de trabajo.
- **Procesamiento de imágenes en investigación académica**: el modelo puede servir como componente de localización en proyectos de estudio de ensamblaje de puzzles, como el proyecto PuzzleMap, para extraer las regiones de interés antes de análisis posteriores (como reconocimiento de bordes o características).
- **Automatización de clasificación de piezas en fábricas**: en líneas de producción de puzzles, el modelo detecta piezas individuales sobre una cinta transportadora, permitiendo su conteo o separación automática mediante brazos robóticos.
- **Control de calidad en impresión de puzzles**: se puede usar para verificar que todas las piezas de un set están presentes y en buen estado, detectando piezas faltantes o dañadas mediante comparación de bounding boxes esperadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como mAP, precisión o recall sobre conjuntos de validación externos. El autor no ha proporcionado datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo con ~41,6 M de parámetros, la inferencia en precisión FP16 requiere aproximadamente 1-2 GB de VRAM. En FP32 puede necesitar hasta 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, o superiores. En entornos cloud, una T4 o V100 es suficiente.
- Capacidad en consumer GPU: sí, cabe en GPUs de gama media y baja, tanto para inferencia como para fine-tuning.
- Opciones de despliegue: el modelo se puede cargar con la librería `transformers` (pipeline de `object-detection`), o exportar a ONNX para inferencia con ONNX Runtime. También es posible usar `torchserve` o `Triton Inference Server`.
- Latencia y throughput: no hay datos medidos, pero al ser un modelo DETR con backbone ResNet-50, la inferencia típica en una GPU moderna es de decenas de milisegundos por imagen (dependiendo del tamaño de entrada). En CPU puede ser más lenta, del orden de cientos de milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables con este detector de piezas de puzzle específico. Sin embargo, se puede comparar con el modelo base `facebook/detr-resnet-50` y con alternativas de detección de objetos de propósito general:

| Modelo | Parámetros | Tarea | Licencia | Notas |
|---|---|---|---|---|
| puzzle-piece-detection (este) | 41,6M | Detección de piezas de puzzle | CC-BY-4.0 | Especializado, 1 clase |
| facebook/detr-resnet-50 | 41,6M | Detección de objetos COCO (80 clases) | Apache-2.0 | Modelo base, no especializado en puzzle |
| YOLOv11 (por ejemplo) | ~25M (variante) | Detección de objetos | AGPL-3.0 | No hay versión específica para puzzle, requiere fine-tuning |

No se dispone de benchmarks comparativos entre estos modelos en la tarea de detección de piezas de puzzle.

## Limitaciones y advertencias

- El modelo está entrenado específicamente con imágenes del dataset `puzzle-map`, por lo que su rendimiento en otros entornos (diferente iluminación, fondo, tipos de piezas, resoluciones) puede degradarse.
- No distingue entre piezas de puzzle de diferentes formas o colores; solo localiza la presencia de piezas.
- El modelo no está diseñado para clasificar piezas ni para analizar su estado (dañadas, incompletas).
- No se han publicado estudios de sesgos o errores sistemáticos. Es posible que tenga errores en imágenes con piezas superpuestas o con fondos complejos.
- La licencia CC-BY-4.0 permite uso comercial y modificación, pero exige atribución al autor original. No hay restricciones adicionales conocidas.
- El modelo no tiene soporte para entrada de texto, solo imágenes. No se puede utilizar para tareas de razonamiento o generación de texto.
- No se han publicado métricas de rendimiento en conjuntos de validación externos, por lo que la precisión en escenarios reales es desconocida.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/pablo-moreira/puzzle-piece-detection)
- [Dataset de entrenamiento](https://huggingface.co/datasets/pablo-moreira/puzzle-map)
- [Repositorio del proyecto PuzzleMap (si existe)](https://huggingface.co/pablo-moreira) (no se ha encontrado un enlace directo)
- [Modelo base facebook/detr-resnet-50](https://huggingface.co/facebook/detr-resnet-50)
- [Dataset de puzzle pieces en Roboflow (similar)](https://universe.roboflow.com/puzzle-piece-detection/puzzle-piece-detection-ee47r)
- [Proyecto Jigsaw Puzzle Solver en GitHub](https://github.com/BertilBraun/Jigsaw-Puzzle-Solver) (herramienta relacionada)
- [OpenMPF Puzzle Piece Detection (GitHub)](https://github.com/pwablito/openmpf_puzzle_piece_detection) (componente de detección con YOLOv11)
