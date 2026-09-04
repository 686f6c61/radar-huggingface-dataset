# sanjayBalu/leaf-detection

## Resumen

El modelo `sanjayBalu/leaf-detection` es un detector de objetos especializado en la detección de hojas de plantas, desarrollado por sanjayBalu a partir de un fine-tuning del modelo `Ultralytics/YOLO11`. Está pensado para aplicaciones agrícolas, donde la identificación automática de hojas puede servir como base para tareas de monitorización de cultivos, conteo de vegetación o análisis de crecimiento.

Se trata de un modelo de visión por computador, no de lenguaje, por lo que no aplican conceptos como longitud de contexto o idiomas. La arquitectura subyacente es YOLO11, un detector de objetos de una etapa de la familia Ultralytics, que ofrece un buen equilibrio entre velocidad y precisión. El checkpoint publicado es `yolo11x_leaf.pt`, lo que indica que se corresponde con la variante más grande de la familia YOLO11.

El modelo fue entrenado sobre el dataset de detección de hojas de Kaggle (`alexo98/leaf-detection`), adaptado al formato YOLO mediante un cuaderno de Kaggle que también explora la conversión a TFLite. Su licencia MIT permite uso comercial, y el repositorio tiene un tamaño de 0.1 GB. No se han publicado métricas de rendimiento ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Ultralytics/YOLO11`, un detector de objetos de una etapa que forma parte de la familia YOLO. YOLO11 introduce mejoras sobre generaciones anteriores, como un diseño más eficiente y una mayor precisión en la detección de objetos pequeños, aunque en la información proporcionada no se detallan las innovaciones técnicas específicas de esta versión.

El entrenamiento se realizó sobre el dataset de detección de hojas de Kaggle (`alexo98/leaf-detection`), que fue adaptado al formato YOLO mediante un cuaderno de Kaggle de Luis Olazo. No se especifican el número de imágenes, el número de épocas, ni los hiperparámetros utilizados. Al tratarse de un modelo de visión, no se aplican técnicas como RLHF o DPO. Tampoco se mencionan procesos de cuantización ni de destilación en la información disponible.

## Capacidades

- Detección de hojas de plantas en imágenes, con una única clase de salida: `Leaf`.
- Inferencia sobre imágenes individuales o directorios completos mediante la API de Ultralytics.
- Configuración del umbral de confianza en tiempo de inferencia (por ejemplo, `conf=0.15`).
- Anotación visual de las predicciones sobre la imagen original.
- No soporta tool calling, function calling, ni razonamiento multi-paso.
- No ofrece capacidades multilingües ni de procesamiento de lenguaje natural.
- No incluye modo de pensamiento (thinking mode) ni soporte de audio.

## Casos de uso

- Monitorización de cultivos en agricultura de precisión: el modelo puede procesar imágenes capturadas por drones o cámaras fijas para estimar la densidad de vegetación, lo que ayuda a los agricultores a tomar decisiones de riego o fertilización.
- Conteo de hojas en invernaderos: permite automatizar el recuento de hojas a partir de fotografías, facilitando estudios de crecimiento y desarrollo de plantas.
- Paso previo en la detección de enfermedades: al localizar hojas en la imagen, se puede recortar cada región y enviarla a un clasificador de enfermedades, reduciendo el área de búsqueda.
- Análisis de imágenes agrícolas en laboratorio: integrable en pipelines de investigación para procesar grandes volúmenes de imágenes de hojas de forma automática.
- Robótica agrícola: puede servir como sistema de visión para robots que realizan tareas de poda, deshierbe o recolección selectiva.
- Control de calidad en producción vegetal: inspección automatizada de hojas en líneas de empaquetado para verificar la presencia o ausencia de hojas en productos como lechugas o espinacas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de valores de mAP, precisión, recall ni comparativas con otros modelos de detección de hojas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se han publicado requisitos específicos para este checkpoint.
- GPU recomendadas: no especificado. Al ser un modelo basado en YOLO11, puede ejecutarse en cualquier GPU compatible con PyTorch y Ultralytics.
- Compatibilidad con GPU de consumo: probablemente puede ejecutarse en GPUs de consumo como las de la serie RTX 30 o RTX 40, aunque no hay datos confirmados.
- Opciones de despliegue: Ultralytics YOLO en Python, ONNX Runtime, TensorRT y TFLite (este último mencionado en la adaptación del dataset).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de comparación con otros modelos de detección de hojas en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para detectar la clase `Leaf`; no distingue especies, variedades, enfermedades ni estados de salud.
- El rendimiento depende del dataset de entrenamiento de Kaggle, que puede no representar todas las condiciones reales: iluminación, ángulos, sombras, densidad de vegetación o variedades de plantas.
- No se han publicado métricas de evaluación, por lo que se desconoce la precisión real del modelo en datos no vistos.
- La licencia MIT permite uso comercial, pero el usuario debe verificar también la licencia del dataset de entrenamiento, que puede tener restricciones adicionales.
- No soporta entrada de texto ni lenguaje natural, por lo que no es adecuado para tareas de razonamiento o generación de texto.
- El repo no incluye documentación sobre el proceso de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/sanjayBalu/leaf-detection
- Dataset de entrenamiento: https://www.kaggle.com/datasets/alexo98/leaf-detection
- Adaptación del dataset a formato YOLO: https://www.kaggle.com/code/luisolazo/leaf-detection-w-ultralytics-yolov8-and-tflite
