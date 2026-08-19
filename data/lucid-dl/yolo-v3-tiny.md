# lucid-dl/yolo-v3-tiny

## Resumen

YOLOv3-Tiny es la versión reducida del detector de objetos YOLOv3, propuesta por Joseph Redmon y Ali Farhadi en 2018 en el artículo *YOLOv3: An Incremental Improvement* (arXiv:1804.02767). Este modelo reduce drásticamente el número de parámetros y operaciones en comparación con YOLOv3 completo, manteniendo una precisión razonable para tareas de detección en tiempo real. El repositorio `lucid-dl/yolo-v3-tiny` ofrece un port de los pesos oficiales de Darknet (`darknet/yolov3-tiny.weights`) al formato nativo de la librería Lucid, con pesos en safetensors y verificación de paridad numérica con el original.

El modelo cuenta con 8,9 millones de parámetros y un tamaño de 33,8 MB, lo que lo hace adecuado para despliegue en dispositivos con recursos limitados, como cámaras IP, sistemas embebidos o aplicaciones móviles. Su rendimiento declarado es de 33,1 mAP@0.5 en el conjunto de validación de COCO. Al estar basado en los pesos originales de Darknet, hereda la licencia `other` sin términos explícitos, por lo que se recomienda revisar la licencia de los pesos originales antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv3-Tiny (CNN con backbone Darknet-53 reducido y dos escalas de detección) |
| Parametros totales | 8,9 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible (solo pesos en fp32 según el port) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | `other` (heredada de los pesos originales de Darknet) |
| Formato de pesos | safetensors (formato nativo de Lucid) |

## Arquitectura y entrenamiento

YOLOv3-Tiny es una red neuronal convolucional diseñada para detección de objetos en una sola pasada. Su backbone es una versión reducida de Darknet-53, con menos capas y filtros, y utiliza dos escalas de detección (13×13 y 26×26) en lugar de las tres de YOLOv3 completo. Cada escala predice cajas delimitadoras y probabilidades de clase mediante anclas predefinidas. La arquitectura original fue entrenada por los autores de YOLO en el conjunto de datos COCO 2014, con resolución de entrada de 416×416 píxeles.

El port de Lucid convierte los pesos de Darknet al formato safetensors, manteniendo la misma topología y los mismos valores numéricos. No se ha realizado ningún reentrenamiento ni ajuste fino adicional; el modelo conserva exactamente las capacidades del original. Tampoco se aplican técnicas como RLHF o DPO, que son específicas de modelos generativos de lenguaje y no tienen cabida en un detector de objetos.

## Capacidades

- Detección de objetos en imágenes y vídeo, con 80 clases del dataset COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Inferencia en tiempo real gracias a su bajo coste computacional (8,9 M de parámetros y ~33,8 MB).
- Salida estructurada con logits por clase y coordenadas de cajas delimitadoras, accesible mediante la API de Lucid (`ObjectDetectionOutput`).
- Preprocesamiento integrado con los pesos: el objeto `YOLOV3TinyWeights.COCO_2014` incluye las transformaciones necesarias para normalizar la entrada.
- Portabilidad: al estar en safetensors, puede cargarse con la librería Lucid y, potencialmente, exportarse a otros formatos (ONNX, TensorRT) mediante herramientas de conversión.

## Casos de uso

- Videovigilancia y seguridad: detección de intrusos, vehículos o personas en tiempo real desde cámaras IP. Su bajo consumo permite ejecutarlo en un servidor modesto o en un dispositivo edge.
- Control de calidad industrial: inspección visual de piezas en líneas de producción, detectando defectos o anomalías en imágenes de alta resolución (tras redimensionar a 416×416).
- Robótica móvil: navegación autónoma mediante detección de obstáculos y objetos relevantes del entorno, con latencia suficientemente baja para tomar decisiones en bucle cerrado.
- Conteo y seguimiento de objetos: aplicaciones de análisis de tráfico o aforo en espacios públicos, combinando la detección con algoritmos de seguimiento como DeepSORT.
- Agricultura de precisión: detección de frutos, plagas o malas hierbas en imágenes capturadas por drones, donde el peso reducido facilita el despliegue en el propio dron.
- Prototipado rápido: como base para experimentos de detección en investigación, gracias a su facilidad de carga con Lucid y su compatibilidad con el pipeline estándar de PyTorch.

## Benchmarks y rendimiento

Según el modelo-index de la model card, el resultado oficial declarado por el autor es:

| Dataset | Metrica | Valor |
|---|---|---|
| COCO (validación) | mAP@0.5 | 33,1 |

No se han publicado comparaciones con otros modelos en la información disponible. Para contextualizar, el YOLOv3 completo (no tiny) alcanza un mAP@0.5 significativamente mayor en COCO, pero con más de 60 M de parámetros y un coste computacional mucho más alto. Este modelo prioriza la velocidad y la eficiencia sobre la precisión máxima.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (el modelo ocupa 33,8 MB en disco; la inferencia con batch 1 requiere aproximadamente 200-400 MB de VRAM dependiendo de la resolución de entrada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, Jetson Nano, Jetson TX2). También funciona en CPU a velocidad aceptable (varios FPS).
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna, incluso integradas.
- Opciones de despliegue: la librería Lucid permite carga directa; se puede exportar a ONNX y desplegar con TensorRT, OpenVINO o TFLite para edge.
- Latencia estimada: en GPU de gama media (RTX 3060), la inferencia suele ser inferior a 5 ms por imagen a 416×416; en CPU (i7-9700K) puede rondar los 30-50 ms.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@0.5 (COCO) | Tamano | Licencia |
|---|---|---|---|---|
| YOLOv3-Tiny (este port) | 8,9 M | 33,1 | 33,8 MB | `other` |
| YOLOv3 completo (Darknet) | 61,5 M | 57,9 (aprox., segun paper) | ~240 MB | `other` |
| YOLOv5s (Ultralytics) | 7,2 M | 37,4 (aprox., en COCO val) | ~14 MB | AGPL-3.0 |

Los datos de YOLOv3 completo y YOLOv5s son aproximaciones basadas en información pública; no se han verificado en este repositorio. Este port se distingue por su formato safetensors y su integración con Lucid, mientras que las alternativas suelen distribuirse en formatos PyTorch u ONNX.

## Limitaciones y advertencias

- Licencia `other` sin términos explícitos: el autor indica que se hereda de los pesos originales de Darknet. Es necesario consultar la licencia de los pesos de YOLOv3 en el repositorio oficial de Darknet antes de un uso comercial, ya que podría contener restricciones.
- Sesgos del dataset COCO: el modelo puede presentar un rendimiento inferior en clases poco representadas o en contextos muy distintos a los de las imágenes de entrenamiento (por ejemplo, condiciones de iluminación extremas, objetos poco comunes).
- Sin capacidad de generación de texto ni razonamiento: es exclusivamente un detector de objetos; no admite entradas de lenguaje natural.
- Resolución fija de entrada: aunque se puede cambiar el tamaño de entrada, el modelo fue entrenado a 416×416; resoluciones muy diferentes pueden degradar la precisión.
- Sin soporte de cuantización oficial: no se proporcionan pesos cuantizados, por lo que la optimización para edge requerirá herramientas externas (por ejemplo, TensorRT o ONNX Runtime).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede producir falsos positivos (detectar objetos que no existen) en escenarios complejos.

## Enlaces

- [HuggingFace - lucid-dl/yolo-v3-tiny](https://huggingface.co/lucid-dl/yolo-v3-tiny)
- [Paper original YOLOv3 - arXiv:1804.02767](https://arxiv.org/abs/1804.02767)
- [Repositorio Lucid (GitHub)](https://github.com/ChanLumerico/lucid)
- [Implementación de referencia de Ultralytics (YOLOv3)](https://github.com/ultralytics/yolov3)
