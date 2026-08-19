# manak0/Detect-crime-winner

## Resumen

El modelo `manak0/Detect-crime-winner` es un detector de objetos basado en YOLO (Ultralytics) publicado por el usuario Manako en Hugging Face. Se presenta como un "elemento ganador" convertido en componente de biblioteca, procedente del repositorio `crimedetector/ScoreVision`. Está diseñado para detectar seis clases de objetos relacionados con actividades delictivas: pasamontañas, sudadera, guante, bate, spray de pintura y graffiti. El modelo se distribuye en formato ONNX y tiene un tamaño de repositorio de 0,4 GB, aunque el peso del modelo propiamente dicho es de aproximadamente 9,8 MB según la nota incluida en la model card.

Este modelo forma parte de un ecosistema de detección de objetos orientado a la vigilancia y seguridad, probablemente integrado en la plataforma ScoreVision. Su relevancia radica en que es un ejemplo de modelo YOLO especializado en una tarea concreta, con una métrica reportada de mAP50 = 0,6. Sin embargo, la información pública disponible es muy limitada: no se especifican detalles de arquitectura interna, dataset de entrenamiento, licencia ni idiomas soportados. A pesar de ello, su formato ONNX y su tamaño reducido lo hacen adecuado para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (según tags) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO de Ultralytics, una familia de detectores de objetos de una sola etapa que combina extracción de características mediante redes convolucionales con cabezales de detección multi-escala. No se dispone de información sobre el número de capas, la versión concreta de YOLO (p. ej., YOLOv8, YOLO11) ni los parámetros totales. Según la nota en la model card, el tamaño del modelo es de 9,8 MB, lo que sugiere una variante compacta (posiblemente YOLOv8n o similar). No se han publicado detalles sobre el dataset de entrenamiento, el número de épocas, ni si se aplicaron técnicas de aumento de datos o fine-tuning. El modelo se distribuye como un "winner" de un concurso interno de ScoreVision, lo que indica que fue seleccionado por su rendimiento en una tarea de detección específica, pero los detalles del proceso de entrenamiento no son públicos.

## Capacidades

- Detección de objetos en imágenes para seis clases específicas: pasamontañas, sudadera, guante, bate, spray de pintura y graffiti.
- Inferencia en formato ONNX, lo que permite su integración en múltiples frameworks (OpenCV, ONNX Runtime, etc.).
- Tamaño reducido (~9,8 MB), apto para despliegue en dispositivos con recursos limitados.
- No se han documentado capacidades adicionales como detección de múltiples objetos por imagen, seguimiento de objetos o procesamiento de vídeo en tiempo real, aunque es probable que las herede de la arquitectura YOLO.

## Casos de uso

- Vigilancia de seguridad en espacios públicos: el modelo puede integrarse en sistemas de cámaras para alertar sobre la presencia de personas con pasamontañas o bates, potenciales indicadores de actividades delictivas.
- Control de accesos en establecimientos: detectar la entrada de individuos con sudaderas con capucha o guantes en zonas de alta seguridad.
- Monitorización de grafiti: identificar la presencia de sprays de pintura o grafitis en tiempo real para su prevención o limpieza.
- Análisis forense de imágenes: procesar imágenes de archivo para localizar objetos relevantes en investigaciones criminales.
- Automatización de denuncias: generar alertas automáticas cuando se detectan objetos sospechosos, reduciendo la carga de trabajo del personal de seguridad.
- Investigación académica: servir como punto de partida para experimentos de detección de objetos en dominios específicos (seguridad urbana).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (COCO, Pascal VOC, etc.) en la información disponible. La model card incluye una nota con la métrica `E=0.06100445 (map50=0.600000, size_mb=9.835348)`, que sugiere un mAP50 de 0,6 y un tamaño de modelo de 9,8 MB. Este valor proviene probablemente de la evaluación interna del concurso de ScoreVision, pero no se especifica el conjunto de datos de evaluación ni se compara con otros modelos. Por tanto, no es posible establecer una comparativa rigurosa con modelos similares.

## Requisitos de hardware

- Al ser un modelo YOLO de aproximadamente 9,8 MB, la inferencia puede ejecutarse en CPU con un rendimiento aceptable para imágenes individuales.
- Para procesamiento en tiempo real (vídeo), se recomienda una GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior.
- El formato ONNX permite su uso con ONNX Runtime, OpenCV DNN y otras bibliotecas de inferencia.
- No se dispone de datos de latencia o throughput específicos para este modelo.
- En entornos de producción, se puede desplegar con servidores de inferencia como Triton Inference Server o TensorFlow Serving (si se convierte a otros formatos), aunque no hay documentación al respecto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos de detección de objetos especializados en seguridad. Los modelos YOLO genéricos (YOLOv8, YOLO11) tienen arquitecturas similares, pero no se han publicado métricas comparables para este modelo concreto. La única referencia es el benchmark externo de Manako sobre detección de personas y vehículos, que no es aplicable a este modelo de crimen. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede garantizar su uso comercial sin riesgo legal.
- El modelo está entrenado para detectar solo seis clases específicas; no funcionará para otros objetos.
- El mAP50 reportado (0,6) es moderado, lo que implica una tasa de falsos positivos y negativos no despreciable en escenarios reales.
- No se han documentado sesgos potenciales, pero al ser un modelo de detección de objetos relacionados con delitos, podría tener un sesgo hacia ciertos grupos demográficos si el dataset de entrenamiento no fue equilibrado.
- No hay información sobre la calidad del etiquetado del dataset ni sobre su procedencia, lo que puede afectar la generalización.
- El modelo no procesa texto ni lenguaje natural; es exclusivamente visual.
- No se garantiza la robustez ante condiciones de iluminación variables, oclusiones o ángulos de cámara no vistos durante el entrenamiento.

## Enlaces

- [Hugging Face - manak0/Detect-crime-winner](https://huggingface.co/manak0/Detect-crime-winner)
- [ScoreVision Console - Detect Crime](https://console.scorevision.io/elements/manak0%2FDetect-crime)
- [Manako Benchmark - Person + Vehicle Detection](https://mxmsbt.github.io/manako_benchmark/)
- [GitHub - manako_benchmark README](https://github.com/mxmsbt/manako_benchmark/blob/main/README.md)
