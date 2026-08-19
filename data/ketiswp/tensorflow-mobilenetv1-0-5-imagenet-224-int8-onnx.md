# ketiswp/tensorflow-MobileNetV1-0.5-ImageNet-224-int8-onnx

## Resumen
Este modelo es una versión cuantizada a 8 bits (INT8) del clásico MobileNetV1 con factor de ancho 0.5, preparada para su uso con ONNX Runtime. Lo publica el usuario ketiswp en Hugging Face, y se basa en la implementación original de TensorFlow del research/slim de Google. Su propósito es ofrecer una alternativa ligera y rápida para clasificación de imágenes en entornos con recursos limitados, como dispositivos embebidos o aplicaciones de edge computing.

La cuantización estática QDQ reduce el tamaño del modelo y acelera la inferencia en hardware que soporta operaciones INT8, manteniendo una precisión aceptable para tareas de clasificación general. La relevancia actual radica en la creciente demanda de modelos pequeños y eficientes que puedan ejecutarse en tiempo real sin depender de GPUs potentes. El modelo está pensado para ser usado con ONNX Runtime, aunque también puede integrarse en pipelines de visión por computador mediante otras librerías que acepten ONNX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV1 (factor de ancho 0.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | INT8, cuantización estática QDQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento
MobileNetV1 es una red neuronal convolucional basada en convoluciones separables en profundidad (depthwise separable convolutions). El factor de ancho 0.5 reduce el número de canales en cada capa, lo que reduce el coste computacional aproximadamente al 25% del MobileNetV1 original (factor 1.0). La entrada es una imagen de 224x224 píxeles con 3 canales. El modelo fue entrenado originalmente sobre el conjunto de datos ImageNet, que contiene más de 14 millones de imágenes en 1000 clases. La versión INT8 se obtiene mediante cuantización estática, que convierte los pesos y activaciones a enteros de 8 bits, usando un proceso de calibración con datos de ejemplo. No se han publicado detalles sobre el proceso de entrenamiento de la versión original más allá de lo indicado en la documentación de TensorFlow.

## Capacidades
- Clasificación de imágenes en 1000 categorías de ImageNet (perros, gatos, objetos cotidianos, etc.).
- Inferencia de alta velocidad gracias a la cuantización INT8, especialmente en CPUs con soporte AVX2 o ARM con instrucciones NEON.
- Bajo consumo de memoria: el modelo ocupa menos de 10 MB en formato INT8 (estimación típica, no confirmado en la ficha).
- Compatible con ONNX Runtime y otras herramientas de inferencia ONNX (OpenCV, TensorRT, etc.).
- No incluye capacidades de detección de objetos ni segmentación; es exclusivamente un clasificador.

## Casos de uso
- **Clasificación de imágenes en dispositivos móviles**: el modelo puede ejecutarse en smartphones o tablets mediante ONNX Runtime, permitiendo clasificar fotos en tiempo real sin conexión a internet.
- **Aplicaciones de visión industrial**: para clasificar piezas defectuosas en una línea de producción, el modelo puede integrarse en un sistema de captura de imágenes con una cámara y un ordenador de bajo coste.
- **Sistemas de moderación de contenido**: clasificar imágenes subidas por usuarios para filtrar contenido inapropiado, con una inferencia rápida en servidores sin GPU.
- **Asistentes de accesibilidad**: describir objetos a través de una cámara en aplicaciones para personas con discapacidad visual, con baja latencia.
- **Pruebas de concepto en investigación**: para validar técnicas de cuantización o comparar el rendimiento de modelos de visión en entornos embebidos.
- **Edge computing en agricultura**: clasificar imágenes de plantas o plagas en campo con un dispositivo de bajo consumo energético.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan cifras de precisión Top-1 o Top-5, ni comparativas con otros modelos. Tampoco se indica el tiempo de inferencia o throughput en diferentes hardware.

## Requisitos de hardware
- **VRAM**: no es necesario para inferencia en CPU; si se usa GPU, no necesita más de 1 GB, ya que el modelo es pequeño.
- **GPU recomendadas**: no aplica, funciona en CPU; en GPU se puede usar cualquier modelo con soporte INT8 (por ejemplo, NVIDIA T4, RTX 2080 o superior).
- **CPU**: cualquier procesador moderno con soporte de instrucciones AVX2 o NEON para acelerar la cuantización INT8.
- **Despliegue**: compatible con ONNX Runtime (CPU y GPU), llama.cpp (aunque no es común para visión), y otras herramientas que carguen modelos ONNX.
- **Latencia**: no se dispone de datos, pero en un CPU moderno se espera una inferencia de pocos milisegundos por imagen, dado el tamaño reducido.

## Comparativa con modelos similares
- **MobileNetV1 original (factor 1.0, FP32)**: mayor tamaño y precisión, pero requiere más recursos. Este modelo INT8 0.5 es mucho más ligero y rápido, adecuado para edge.
- **MobileNetV2**: arquitectura más moderna con mejores resultados a igual coste, pero no se proporciona comparación cuantitativa.
- **EfficientNet-Lite**: familia optimizada para CPU, pero no se comparan datos aquí.

No hay datos numéricos disponibles para una comparación objetiva en esta ficha.

## Limitaciones y advertencias
- **Sesgo**: entrenado en ImageNet, que contiene sesgos de género, etnia y contexto geográfico; puede clasificar incorrectamente imágenes no representadas en el dataset.
- **Alucinación**: no aplica, ya que es un clasificador, no un modelo generativo.
- **Precisión**: la cuantización INT8 puede degradar la exactitud en comparación con el modelo FP32, especialmente en clases similares.
- **Contexto**: no soporta entrada de texto, solo imágenes.
- **Licencia**: Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo original (MIT en el repositorio de TensorFlow).
- **Producción**: para uso en producción, es recomendable validar el rendimiento en el conjunto de datos específico de la aplicación, ya que la precisión puede variar.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/ketiswp/tensorflow-MobileNetV1-0.5-ImageNet-224-int8-onnx)
- [Versión FP32 del mismo modelo](https://huggingface.co/ketiswp/tensorflow-MobileNetV1-0.5-ImageNet-224-fp32-onnx)
- [Documentación original de MobileNetV1 en TensorFlow](https://github.com/tensorflow/models/blob/4d7bdd8c170ee90850f2f9ccef0f6d19b817de35/research/slim/nets/mobilenet_v1.md)
- [Modelo similar de la comunidad ONNX](https://huggingface.co/onnx-community/mobilenet_v1_1.0_224)
