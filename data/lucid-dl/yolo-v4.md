# lucid-dl/yolo-v4

## Resumen

YOLOv4 es un detector de objetos en tiempo real desarrollado originalmente por Alexey Bochkovskiy, Chien-Yao Wang y Hong-Yuan Mark Liao en 2020, presentado en el artículo *YOLOv4: Optimal Speed and Accuracy of Object Detection* (arXiv:2004.10934). Este modelo se diseñó para superar las limitaciones de versiones anteriores como YOLOv3, ofreciendo un equilibrio óptimo entre velocidad y precisión mediante una arquitectura basada en CSPDarknet-53 como backbone, módulos SPP (Spatial Pyramid Pooling) y PANet (Path Aggregation Network) para la fusión de características. La implementación que nos ocupa es un port oficial del framework Lucid, que convierte los pesos originales de Darknet a formato safetensors nativo, manteniendo paridad numérica con la fuente.

El modelo cuenta con 64,4 millones de parámetros y un tamaño de pesos de 245,85 MB. Está entrenado en el dataset COCO 2017 y alcanza un mAP@0.5 de 65,7 en dicha tarea de detección de objetos. Su relevancia actual radica en que sigue siendo una referencia para aplicaciones de visión por computador en tiempo real, especialmente en entornos con recursos limitados donde se requiere un detector compacto y eficiente. La disponibilidad en formato safetensors y su integración con la librería Lucid facilita su uso en pipelines modernos de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CSPDarknet-53 + SPP + PANet (deteccion de objetos) |
| Parametros totales | 64,4 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (solo se menciona safetensors) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | other (heredada de los pesos originales de Darknet) |
| Formato de pesos | safetensors (Lucid-native) |

## Arquitectura y entrenamiento

YOLOv4 es una red neuronal convolucional (CNN) de una sola etapa diseñada para detección de objetos en tiempo real. Su backbone es CSPDarknet-53, una variante de Darknet-53 que incorpora conexiones parciales cruzadas (Cross Stage Partial) para reducir el coste computacional y mejorar el flujo de gradientes. Sobre este backbone se añaden un módulo SPP (Spatial Pyramid Pooling) que agrupa características a múltiples escalas, y un cuello de botella PANet (Path Aggregation Network) que combina características de diferentes niveles de resolución para mejorar la detección de objetos pequeños. La cabeza de detección predice cajas y clases por cada celda de la rejilla.

El entrenamiento se realizó sobre el dataset COCO 2017, que contiene 118 000 imágenes de entrenamiento con 80 categorías de objetos. No se dispone de información detallada sobre el número exacto de épocas, el tamaño de lote o las técnicas de aumento de datos empleadas en el entrenamiento original. El port a Lucid se realizó mediante una conversión de los pesos oficiales de Darknet (`darknet/yolov4.weights`) utilizando la herramienta `tools.convert_weights`, verificando la paridad numérica de las claves y los valores. No se aplicaron técnicas de RLHF ni DPO, ya que no es un modelo generativo de lenguaje.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica múltiples objetos dentro de una imagen, devolviendo cajas delimitadoras y etiquetas de clase.
- Inferencia en tiempo real: diseñado para operar a altas velocidades de fotogramas, adecuado para flujos de vídeo.
- Soporte de múltiples escalas: gracias al módulo SPP y PANet, maneja objetos de diferentes tamaños, incluidos los pequeños.
- Preprocesamiento integrado: los pesos incluyen transformaciones asociadas (`weights.transforms()`) que simplifican la preparación de las imágenes de entrada.
- Salida estructurada: devuelve un objeto `ObjectDetectionOutput` con logits por clase y coordenadas de cajas predichas.
- Compatibilidad con el ecosistema Lucid: integración directa con la API de modelos de la librería Lucid, permitiendo carga de pesos preentrenados con una sola línea de código.

## Casos de uso

- Vigilancia y seguridad perimetral: el modelo puede detectar personas, vehículos u objetos en tiempo real a partir de cámaras de seguridad, gracias a su baja latencia y alta precisión en COCO. Se integraría en un pipeline de vídeo con OpenCV o Lucid para activar alertas automáticas.
- Control de calidad industrial: inspección visual de piezas en líneas de producción, detectando defectos o elementos faltantes. Su tamaño compacto permite ejecutarse en GPUs de gama media dentro de estaciones de trabajo.
- Conducción autónoma y asistencia al conductor: detección de peatones, señales de tráfico y otros vehículos en tiempo real. La velocidad de inferencia es crítica aquí, y YOLOv4 ofrece un equilibrio adecuado para sistemas embebidos.
- Análisis de imágenes médicas: localización de estructuras anatómicas o anomalías en radiografías, siempre que se realice un fine-tuning con datos específicos del dominio.
- Robótica y automatización: guiado de brazos robóticos para localizar y manipular objetos en entornos controlados, utilizando las cajas delimitadoras para planificar trayectorias.
- Sistemas de recomendación visual: detección de productos en estanterías o en fotografías de usuario para sugerir artículos similares, aprovechando la capacidad de clasificación multiobjeto.
- Moderación de contenido: identificación de objetos no deseados en imágenes subidas a plataformas, como armas o contenido inapropiado, mediante un pipeline de detección previo a la revisión humana.

## Benchmarks y rendimiento

El único resultado oficial declarado por el autor en la model card es el siguiente:

| Dataset | Metrica | Valor | Verificado |
|---|---|---|---|
| COCO | mAP@0.5 | 65,7 | No |

No se han publicado resultados adicionales (como mAP@0.5:0.95, FPS, o comparaciones con otros modelos) en la información disponible. Por tanto, no se pueden presentar tablas comparativas con datos verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que los pesos ocupan 245,85 MB, una GPU con al menos 2 GB de VRAM sería suficiente para ejecutar el modelo en precisión FP32. Con cuantizaciones (no disponibles en esta versión) se podría reducir aún más el consumo.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, por ejemplo NVIDIA GTX 1060 (6 GB) o superior. Para aplicaciones de tiempo real a alta resolución, se recomienda al menos una RTX 2060 o superior.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en GPUs de consumo como la serie RTX 30 o RTX 40, así como en tarjetas integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un port de Lucid, se puede ejecutar directamente con la librería Lucid en Python. También es posible exportar a ONNX o TensorRT para optimización en producción, aunque no se documenta en la model card. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos específicos. Sin embargo, YOLOv4 es conocido por alcanzar alrededor de 65 FPS en una GPU V100 con resolución de entrada de 608x608 según el paper original, aunque estos valores no están verificados en esta implementación concreta.

## Comparativa con modelos similares

Se comparan con otros detectores de objetos de una sola etapa ampliamente utilizados. Los datos de rendimiento de los modelos alternativos provienen de fuentes públicas conocidas, pero no han sido verificados en esta ficha.

| Modelo | Parametros | mAP@0.5 (COCO) | Licencia | Formato de pesos |
|---|---|---|---|---|
| YOLOv4 (este port) | 64,4 M | 65,7 | other | safetensors (Lucid) |
| YOLOv3 | 61,5 M | ~57,9 | other | darknet, ONNX |
| YOLOv5s | 7,3 M | ~37,4 (mAP@0.5:0.95) | AGPL-3.0 | PyTorch, ONNX |

Nota: los valores de YOLOv3 y YOLOv5s son aproximados y pueden variar según la implementación y el preprocesamiento. No se dispone de una comparativa directa con el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia se indica como `other` y se hereda de los pesos originales de Darknet. Antes de usar el modelo en producción comercial, es imprescindible revisar los términos de la licencia original de YOLOv4, que puede imponer restricciones de atribución o uso.
- Sesgos y errores de detección: al estar entrenado en COCO, el modelo puede presentar sesgos hacia las categorías y contextos presentes en ese dataset. Puede fallar en objetos poco representados o en condiciones de iluminación, oclusión o ángulos inusuales.
- Alucinaciones en detección: como cualquier detector, puede generar falsos positivos (detectar objetos que no existen) o falsos negativos (no detectar objetos presentes). Esto es crítico en aplicaciones de seguridad o conducción autónoma.
- Limitaciones de contexto: al ser un modelo de visión, no procesa texto ni entiende lenguaje natural. No es adecuado para tareas de generación de texto o razonamiento lingüístico.
- Sin cuantizaciones oficiales: no se ofrecen versiones cuantizadas, lo que puede limitar su despliegue en dispositivos con memoria muy reducida.
- Dependencia del framework Lucid: el formato safetensors es específico de Lucid; para usarlo en otros entornos (TensorFlow, PyTorch) sería necesaria una conversión adicional.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/lucid-dl/yolo-v4
- Paper original (arXiv): https://arxiv.org/abs/2004.10934
- Repositorio de Lucid (framework): https://github.com/ChanLumerico/lucid
- Documentación de YOLOv4 en Ultralytics: https://docs.ultralytics.com/models/yolov4
- Análisis de arquitectura en OpenGenus: https://iq.opengenus.org/yolov4-model-architecture/
