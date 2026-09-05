# litert-community/efficientnet_b1

## Resumen

EfficientNet-B1 es un modelo de clasificación de imágenes preentrenado en ImageNet-1k, desarrollado originalmente por Tan y Le en 2019 y publicado en el paper «EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks». La comunidad LiteRT (sucesor de TensorFlow Lite) ha publicado una versión convertida a formato TFLite, lista para su uso en dispositivos edge. El modelo utiliza compound scaling para equilibrar profundidad, anchura y resolución, lo que permite obtener una precisión elevada con un coste computacional reducido en comparación con arquitecturas tradicionales.

La variante disponible en HuggingFace incluye un archivo TFLite de 40.2 MB y, según la model card, una cuantización weight-only int8 que reduce el tamaño aproximadamente 3.5 veces respecto a float32. El modelo tiene 7.794.184 parámetros y está diseñado para tareas de clasificación de imágenes en 1000 clases. Al tratarse de un modelo de visión, no aplica el concepto de longitud de contexto ni soporte de lenguaje natural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B1 (red neuronal convolucional basada en bloques MBConv con compound scaling) |
| Parámetros totales | 7.794.184 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | Weight-only int8 (según model card) |
| Idiomas soportados | No aplica (clasificación de imágenes) |
| Licencia | No disponible |
| Formato de pesos | TFLite (LiteRT) |

## Arquitectura y entrenamiento

EfficientNet-B1 es una red neuronal convolucional basada en bloques MBConv (inverted residual blocks) con conexiones residuales y capas de squeeze-and-excitation (SE). La innovación principal del paper original es el compound scaling, que escala de forma sistemática la profundidad, la anchura y la resolución de entrada mediante un coeficiente compuesto, logrando una mejor relación precisión-coste que escalar una sola dimensión.

El modelo base fue preentrenado en ImageNet-1k y posteriormente convertido a TFLite por litert-community. Según la model card, la conversión incluye una cuantización weight-only int8 (archivo `efficientnet_b1_weight_only_wi8_afp32.tflite`) que reduce el tamaño de los pesos un 3.5x respecto a float32. Se optó por cuantización weight-only en lugar de dynamic-range porque las capas SE y SiLU son sensibles a la cuantización de activaciones. En una comprobación de 10 imágenes, el modelo cuantizado coincidió con el modelo float en 9 de 10 predicciones top-1, con una correlación logit de 0.996.

## Capacidades

- Clasificación de imágenes en 1000 clases del dataset ImageNet-1k.
- Modelo preentrenado, listo para inferencia directa o para fine-tuning en tareas específicas.
- Formato TFLite/LiteRT optimizado para ejecución en dispositivos edge y móviles.
- Cuantización weight-only int8 disponible para reducir el tamaño del modelo.
- No soporta generación de texto, tool calling, ni razonamiento multi-step.
- No soporta detección de objetos, segmentación semántica ni otras tareas de visión más allá de la clasificación.
- Capacidades multilingües: no aplica, al tratarse de un modelo de visión.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo puede integrarse en apps Android o iOS mediante LiteRT para clasificar objetos en tiempo real, aprovechando su tamaño reducido (40.2 MB) y su formato TFLite optimizado para dispositivos edge.
- Control de calidad industrial: se puede usar para clasificar defectos en piezas manufacturadas a partir de imágenes capturadas por cámaras en línea, con fine-tuning sobre un dataset propio de la planta.
- Vigilancia y seguridad perimetral: el modelo permite clasificar escenas o eventos (vehículos, personas, animales) en cámaras edge, sin necesidad de enviar imágenes a la nube, reduciendo latencia y costes de ancho de banda.
- Agricultura de precisión: clasificar enfermedades en hojas de cultivo o tipos de malas hierbas mediante imágenes capturadas con drones o sensores de campo, tras un fine-tuning con datos agrícolas específicos.
- Asistencia visual para personas con discapacidad: integrar el modelo en una aplicación que describe objetos del entorno en tiempo real, ayudando a usuarios con baja visión a identificar elementos cotidianos.
- Filtrado de contenido en plataformas sociales: clasificar automáticamente imágenes subidas por usuarios en categorías (violencia, desnudos, etc.) para moderación, usando el modelo como clasificador base.
- Reconocimiento de especies en aplicaciones de naturaleza: identificar aves, insectos o plantas a partir de fotografías, con fine-tuning sobre datasets específicos de biodiversidad.

## Benchmarks y rendimiento

Según el model-index oficial publicado en HuggingFace, los resultados sobre el dataset ImageNet-1k (split validation) son los siguientes:

| Métrica | Valor |
|---|---|
| Top-1 Accuracy (Full Precision) | 0.7855 (78.55%) |
| Top-5 Accuracy (Full Precision) | 0.9419 (94.19%) |

Nota: la model card del modelo original reporta una precisión top-1 de 79.838% y top-5 de 94.934% para los pesos PyTorch originales. El benchmark del repositorio (78.55% top-1) corresponde a la evaluación del modelo convertido a TFLite. No se han publicado resultados de benchmarks para la variante cuantizada weight-only int8; solo se indica una comprobación informal de 10 imágenes con 9 coincidencias en top-1.

## Requisitos de hardware

- El modelo tiene 7.794.184 parámetros; el archivo TFLite disponible pesa 40.2 MB.
- VRAM estimada para inferencia: menos de 1 GB en GPU; el modelo también puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, A100, H100, etc.) o aceleradores edge como Google Edge TPU.
- Cabe en GPU de consumo: sí, incluso en GPUs integradas o en dispositivos móviles.
- Opciones de despliegue: LiteRT (runtime de Google), TensorFlow Lite, y posibles conversiones a ONNX o CoreML.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Por tamaño y tarea, este modelo es comparable a otros CNN ligeros como EfficientNet-B0 o MobileNetV3, pero no se han proporcionado sus métricas de rendimiento ni licencias. A continuación se muestra la información disponible:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EfficientNet-B1 (este) | 7.794.184 | No aplica | No disponible | TFLite/LiteRT |
| EfficientNet-B0 | No disponible | No aplica | No disponible | No disponible |
| MobileNetV3 | No disponible | No aplica | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo se entrenó en ImageNet-1k, un dataset con sesgos geográficos y culturales (principalmente imágenes occidentales y objetos comunes), lo que puede producir clasificaciones incorrectas en contextos no representados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede devolver clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitación funcional: solo clasificación de imágenes en 1000 clases. No soporta detección de objetos, segmentación, ni texto.
- Restricciones de licencia: la licencia del modelo no está disponible. Los pesos provienen de PyTorch Vision y del dataset ImageNet; es responsabilidad del usuario verificar los términos de uso antes de desplegarlo en producción.
- Caveat de producción: la variante cuantizada weight-only int8 puede presentar pequeñas diferencias de precisión (en la comprobación informal, 9 de 10 coincidencias). Para aplicaciones críticas, se recomienda validar el rendimiento con el dataset objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/efficientnet_b1
- GitHub LiteRT: https://github.com/google-ai-edge/litert
- Documentación de LiteRT: https://developers.google.com/edge/litert
- Paper original: https://arxiv.org/abs/1905.11946
- Modelo base en HuggingFace: https://huggingface.co/google/efficientnet-b1
