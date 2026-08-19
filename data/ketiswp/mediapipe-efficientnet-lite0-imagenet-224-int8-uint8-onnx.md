# ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-int8-uint8-onnx

## Resumen

El modelo `ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-int8-uint8-onnx` es una versión cuantizada a 8 bits del clasificador de imágenes EfficientNet-Lite0 de MediaPipe, convertido al formato ONNX. El modelo original fue desarrollado por Google AI Edge como parte de MediaPipe Solutions, una suite de herramientas para aplicar técnicas de aprendizaje automático en aplicaciones de borde. Este modelo resuelve el problema de clasificación de imágenes en tiempo real con un coste computacional reducido, lo que lo hace adecuado para dispositivos móviles, sistemas embebidos y servidores sin GPU.

La versión publicada por el usuario `ketiswp` aplica una cuantización estática de 8 bits en formato QDQ (Quantize-Dequantize), con pesos INT8 y entradas/salidas UINT8, lo que reduce el tamaño del modelo y acelera la inferencia en comparación con la versión FP32. El modelo está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. La arquitectura base es EfficientNet-Lite0, una variante ligera de EfficientNet-B0 que elimina los bloques squeeze-and-excitation y utiliza ReLU6, optimizada para dispositivos con recursos limitados.

Aunque el repositorio tiene un tamaño declarado de 0.0 GB y no se han publicado métricas de rendimiento, la relevancia de este modelo reside en su formato ONNX cuantizado, que facilita la integración en pipelines de inferencia con ONNX Runtime en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-Lite0 (basada en inverted bottleneck residuals de MobileNetV2, con ReLU6 y sin squeeze-and-excitation) |
| Parametros totales | no disponible (el modelo base EfficientNet-Lite0 tiene aproximadamente 4,7 millones de parámetros, pero no se confirma en la información proporcionada) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, no texto) |
| Tipos de cuantizacion | INT8 (pesos), UINT8 (entradas/salidas), formato QDQ, cuantización estática |
| Idiomas soportados | no disponible (modelo de visión, no depende de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivo `.onnx`) |

## Arquitectura y entrenamiento

La arquitectura base es EfficientNet-Lite0, una variante de EfficientNet-B0 optimizada para dispositivos móviles. A diferencia de la EfficientNet original, esta versión sustituye las activaciones SiLU/Swish por ReLU6 y elimina los bloques squeeze-and-excitation, lo que reduce el coste computacional y mejora la compatibilidad con hardware de bajo consumo. El modelo se entrena con el conjunto de datos ImageNet, que contiene 1,28 millones de imágenes etiquetadas en 1000 clases (árboles, animales, comida, vehículos, personas, etc.).

La versión publicada en este repositorio aplica una cuantización estática de 8 bits en formato QDQ, lo que significa que los pesos se convierten a INT8 y las activaciones se representan con UINT8, manteniendo la precisión de las operaciones mediante dequantización puntual. Este proceso reduce el tamaño del modelo y acelera la inferencia en CPU y dispositivos edge, aunque puede introducir una ligera pérdida de precisión respecto a la versión FP32. No se han proporcionado detalles sobre el conjunto de calibración utilizado para la cuantización, ni sobre el proceso de entrenamiento específico de esta versión cuantizada.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet (objetos, animales, plantas, vehículos, etc.).
- Inferencia a 224x224 píxeles de entrada, optimizada para latencia baja en dispositivos con recursos limitados.
- Ejecución eficiente en CPU gracias a la cuantización INT8/UINT8, sin necesidad de GPU.
- Compatible con ONNX Runtime y otras plataformas de inferencia que soporten el formato ONNX.
- Integración sencilla con pipelines de visión por computador mediante la API de MediaPipe o directamente con ONNX Runtime.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de visión puro.

## Casos de uso

- Clasificación de imágenes en tiempo real en aplicaciones móviles: el modelo puede integrarse en apps de Android o iOS mediante MediaPipe o ONNX Runtime para identificar objetos en la cámara en tiempo real, con un consumo mínimo de recursos y batería.
- Moderación de contenido en plataformas web: al clasificar imágenes en categorías predefinidas (por ejemplo, contenido inapropiado), se puede usar como filtro automático en sistemas de subida de imágenes, con inferencia rápida en servidores CPU.
- Control de calidad en manufactura: clasificación de imágenes de piezas en líneas de producción para detectar defectos o clasificar productos según su tipo, con la ventaja de poder desplegarse en hardware industrial de bajo coste.
- Asistentes de accesibilidad: descripción de imágenes para personas con discapacidad visual, clasificando el contenido de la escena en categorías generales (por ejemplo, "persona", "silla", "coche") para generar texto alternativo.
- E-commerce y recomendación de productos: clasificación de imágenes de catálogo para asignar automáticamente categorías y etiquetas, facilitando la búsqueda y el filtrado de productos.
- Sistemas de vigilancia con cámaras inteligentes: clasificación de objetos en vídeo para alertar de la presencia de personas o vehículos en zonas restringidas, con un despliegue en dispositivos edge como Raspberry Pi o cámaras con NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de MediaPipe EfficientNet-Lite0 reporta una precisión top-1 de aproximadamente 74, 0% en el conjunto de validación de ImageNet en su versión FP32, pero no se confirma si la versión cuantizada mantiene esta métrica. Se recomienda evaluar el modelo en el propio conjunto de datos de aplicación para medir el impacto de la cuantización.

## Requisitos de hardware

- Inferencia en CPU: la cuantización INT8 reduce la carga computacional y puede ejecutarse en CPUs de gama baja (x86, ARM) con tiempos de respuesta de decenas de milisegundos por imagen, aunque el rendimiento exacto depende de la implementación de ONNX Runtime.
- GPU: no es necesaria una GPU para este modelo, pero si se dispone de una, se puede acelerar la inferencia mediante ONNX Runtime con soporte CUDA, aunque el beneficio es menor que en modelos más grandes.
- Dispositivos edge: apto para Raspberry Pi 4, Jetson Nano, móviles con Android y iOS (mediante MediaPipe o Core ML, si se convierte a formato adecuado).
- Opciones de despliegue: ONNX Runtime (CPU/CUDA), MediaPipe Solutions (TFLite), o conversión a TensorFlow Lite para despliegue en móviles.
- Latencia estimada: no disponible en la información proporcionada, pero por tratarse de un modelo ligero y cuantizado, se espera una latencia inferior a 50 ms por imagen en CPU moderna.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros (aprox.) | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| EfficientNet-Lite0 (FP32) | EfficientNet-Lite0 | 4, 7 M | Imagen 224 | Apache 2.0 | TFLite, ONNX |
| MobileNetV2 (1.0-224) | MobileNetV2 | 3, 4 M | Imagen 224 | Apache 2.0 | TFLite, ONNX |
| EfficientNet-B0 | EfficientNet-B0 | 5, 3 M | Imagen 224 | Apache 2.0 | TFLite, ONNX |

Nota: los datos de parámetros son aproximados y provienen de la documentación general de estos modelos, no de la información específica del repositorio. No se dispone de comparativa de rendimiento directa entre esta versión cuantizada y las alternativas.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que el archivo de pesos puede no haberse subido correctamente o que el modelo no está disponible para descarga. Verificar la integridad del repositorio antes de su uso.
- No se han publicado resultados de precisión de la versión cuantizada; es posible que la pérdida de precisión respecto a la versión FP32 sea notable (típicamente entre 1-2 % en ImageNet).
- El modelo está entrenado con ImageNet, por lo que puede presentar sesgos en las clases representadas (por ejemplo, falta de categorías de objetos poco comunes o dependencia del contexto cultural de las imágenes).
- Al ser un modelo de clasificación de imágenes, no es adecuado para tareas de generación de texto, diálogo o razonamiento, y no soporta tool calling ni agentes.
- La licencia Apache 2.0 permite uso comercial, pero no se proporciona información sobre el autor original de la conversión cuantizada, por lo que se debe citar a Google MediaPipe como fuente del modelo base.
- La cuantización QDQ puede no ser compatible con todas las versiones de ONNX Runtime; se recomienda usar una versión reciente (>=1.10) para garantizar la ejecución.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-int8-uint8-onnx
- Versión FP32 del mismo modelo: https://huggingface.co/ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-fp32-onnx
- Documentación oficial de MediaPipe Image Classifier: https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/index
- Guía de MediaPipe Solutions: https://developers.google.com/edge/mediapipe/solutions/guide
- Tutorial de clasificación con MediaPipe y EfficientNet-Lite0: https://eranfeit.net/mediapipe-image-classifier-python-with-efficientnet-lite0/
- Documentación de timm sobre EfficientNet-Lite: https://huggingface.co/docs/timm/models/tf-efficientnet-lite
- Implementación en PyTorch de EfficientNet-Lite: https://github.com/ml-illustrated/EfficientNet-Lite-PyTorch</think>## Resumen

El modelo `ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-int8-uint8-onnx` es una versión cuantizada a 8 bits del clasificador de imágenes EfficientNet-Lite0 de MediaPipe, convertido al formato ONNX. El modelo original fue desarrollado por Google AI Edge como parte de MediaPipe Solutions, y está diseñado para clasificar imágenes en 1.000 categorías de ImageNet (objetos, animales, vehículos, personas, etc.) con un coste computacional reducido. Esta conversión aplica cuantización estática de 8 bits con pesos INT8 y límites de entrada/salida UINT8 en formato QDQ, lo que reduce el tamaño del modelo y acelera la inferencia en CPU y dispositivos de bajo consumo.

La relevancia de esta versión radica en su formato ONNX, que facilita la integración con ONNX Runtime en entornos de producción, y en su cuantización, que permite ejecutar el modelo en hardware sin GPU con una latencia baja. El modelo está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Sin embargo, el repositorio presenta un tamaño de 0.0 GB y cero descargas, lo que sugiere que los pesos podrían no estar disponibles en la práctica.

La arquitectura base, EfficientNet-Lite0, es una variante ligera de EfficientNet-B0 que elimina los bloques squeeze-and-excitation y emplea ReLU6, optimizada para dispositivos móviles. Esta conversión concreta no aporta innovaciones técnicas adicionales más allá de la cuantización, y no se han publicado resultados de benchmarks específicos para esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-Lite0 (basada en bloques residuales invertidos de MobileNetV2, con ReLU6 y sin squeeze-and-excitation) |
| Parametros totales | no disponible (el modelo base EfficientNet-Lite0 tiene aproximadamente 4,7 millones, pero no se confirma en la informacion) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no texto) |
| Tipos de cuantizacion | INT8 (pesos), UINT8 (entradas/salidas), QDQ, cuantizacion estatica |
| Idiomas soportados | no aplica (modelo de vision, no depende de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivo `.onnx`) |

## Arquitectura y entrenamiento

La arquitectura base es EfficientNet-Lite0, una variante de EfficientNet-B0 adaptada para dispositivos móviles. A diferencia de la red original, utiliza activaciones ReLU6 en lugar de SiLU/Swish y elimina los bloques squeeze-and-excitation, lo que reduce el coste computacional y mejora la compatibilidad con hardware de baja gama. El modelo fue entrenado por Google con el conjunto de datos ImageNet, que contiene 1, 2 millones de imágenes etiquetadas en 1.000 clases, para reconocer objetos como árboles, animales, comida, vehículos y personas.

La versión cuantizada aplica una cuantización estática de 8 bits en formato QDQ: los pesos se representan como INT8 y las operaciones internas usan UINT8 para entradas y salidas. Este proceso suele requerir un conjunto de calibración para calcular los rangos de activación, aunque no se han proporcionado detalles sobre el método empleado ni sobre el número de tokens o datos de entrenamiento adicionales. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de visión puro.

## Capacidades

- Clasificacion de imagenes en 1.000 categorias de ImageNet, incluyendo objetos cotidianos, animales, plantas, vehiculos y personas.
- Inferencia a resolucion de entrada de 224x224 pixeles, optimizada para latencia baja en dispositivos de borde.
- Ejecucion eficiente en CPU gracias a la cuantizacion INT8/UINT8, sin necesidad de GPU.
- Compatibilidad con ONNX Runtime y otras plataformas de inferencia que soporten el formato ONNX.
- Integracion sencilla con pipelines de vision por computador mediante la API de MediaPipe o directamente con ONNX Runtime.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto, al ser un modelo exclusivamente de clasificacion visual.

## Casos de uso

- Clasificacion de imagenes en tiempo real en aplicaciones moviles: el modelo puede integrarse en apps de Android o iOS mediante MediaPipe o ONNX Runtime para identificar objetos en la camara del dispositivo, con un consumo de recursos reducido gracias a la cuantizacion.
- Moderacion de contenido en plataformas de subida de imagenes: se puede usar para clasificar automaticamente las imagenes en categorias predefinidas (por ejemplo, contenido inapropiado o tipos de archivo) en servidores CPU, con una latencia de pocas decenas de milisegundos.
- Control de calidad en entornos industriales: clasificacion de imagenes de piezas o productos en lineas de fabricacion para detectar tipos o defectos, desplegable en hardware embebido como Raspberry Pi o PLC con capacidad de procesamiento de imagen.
- Asistencia a personas con discapacidad visual: el modelo puede generar descripciones generales de una escena (persona, perro, coche, etc.) a partir de la imagen captada por la camara del telefono, ayudando a la navegacion y reconocimiento del entorno.
- Etiquetado automatico de catalogos de productos: clasificar imagenes de un ecommerce para asignar categorias y etiquetas a cada producto, reduciendo el trabajo manual y mejorando la busqueda interna.
- Sistemas de vigilancia con camaras inteligentes: clasificar objetos en escenas de camaras de seguridad para generar alertas cuando se detecta la presencia de personas o vehiculos en zonas restringidas, con un despliegue en dispositivos de borde con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base EfficientNet-Lite0 de MediaPipe reporta una precision top-1 de aproximadamente 75, 0 % en el conjunto de validacion de ImageNet en su version FP32, pero no se confirma si la version cuantizada mantiene esta metrica. Se recomienda evaluar el modelo en el conjunto de datos de aplicacion especifico para medir el impacto de la cuantizacion.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo cuantizado de 8 bits y de tamaño reducido, puede ejecutarse en memoria compartida de CPU (RAM) sin necesidad de VRAM dedicada.
- GPU recomendadas: no es necesaria una GPU; puede ejecutarse en CPU de gama baja (x86, ARM) y en dispositivos moviles. Si se usa GPU, cualquier GPU compatible con CUDA o DirectML funcionara, aunque el beneficio es limitado por el tamaño del modelo.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU consumer (por ejemplo, RTX 2060 o superior) y tambien en hardware integrado como Intel UHD.
- Opciones de despliegue: ONNX Runtime (CPU, GPU, DirectML), MediaPipe Solutions, llama.cpp (si se convierte a GGUF), y conversion a TensorFlow Lite para dispositivos moviles.
- Latencia estimada: no disponible en la informacion proporcionada, pero por su tamano y cuantizacion, se espera una latencia inferior a 200 ms por imagen en una CPU moderna de escritorio.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros (aprox.) | Resolucion entrada | Licencia | Formato |
|---|---|---|---|---|---|
| EfficientNet-Lite0 (FP32) | EfficientNet-Lite0 | 4, 7 M | 224 | Apache 2.0 | TFLite, ONNX |
| MobileNetV2 (1.0-224) | MobileNetV2 | 3, 4 M | 224 | Apache 2.0 | TFLite, ONNX |
| EfficientNet-B0 | EfficientNet-B0 | 5, 3 M | 224 | Apache 2.0 | TFLite, ONNX |

Nota: los datos de parametros son aproximados y provienen de la documentacion publica de cada modelo, no de la informacion especifica de este repositorio. No se dispone de una comparativa directa de rendimiento entre esta version cuantizada y las alternativas, ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los archivos de peso no se han subido correctamente o que el modelo no esta disponible para descarga. Verificar la integridad del repositorio antes de su uso.
- No se han publicado resultados de precision de la version cuantizada; es posible que la perdida de precision respecto a la version FP32 sea de 1-2 % en ImageNet, aunque no se confirma.
- El modelo esta entrenado con ImageNet, por lo que puede presentar sesgos en las clases representadas, como falta de cobertura de objetos de ciertas culturas o categorias poco frecuentes.
- Al ser un modelo de clasificacion, no puede generar texto, dialogar ni realizar razonamiento; no soporta tool calling, agentes ni procesamiento de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero se debe citar a Google MediaPipe como fuente original del modelo base y al autor de la conversion si se redistribuye.
- La cuantizacion QDQ puede no ser compatible con versiones antiguas de ONNX Runtime; se recomienda usar una version superior a 1.10 para garantizar la ejecucion correcta.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-int8-uint8-onnx
- Version FP32 del mismo modelo: https://huggingface.co/ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-fp32-onnx
- Documentacion oficial de MediaPipe Image Classifier: https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/index
- Guia de MediaPipe Solutions: https://developers.google.com/edge/mediapipe/solutions/guide
- Tutorial de clasificacion de imagenes con EfficientNet-Lite0: https://eranfeit.net/mediapipe-image-classifier-python-with-efficientnet-lite0/
- Documentacion de timm sobre EfficientNet-Lite: https://huggingface.co/docs/timm/models/tf-efficientnet-lite
- Repositorio de EfficientNet-Lite en PyTorch: https://github.com/ml-illustrated/EfficientNet-Lite-PyTorch
