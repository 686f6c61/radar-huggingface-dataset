# litert-community/efficientnet_b7

# EfficientNet B7

## Resumen

EfficientNet B7 es un modelo de clasificación de imágenes basado en la arquitectura EfficientNet, desarrollado originalmente por Tan y Le en Google y publicado en 2019. Este modelo concreto ha sido convertido por la comunidad LiteRT (antiguo TensorFlow Lite) a partir de un checkpoint de PyTorch Vision, y se distribuye en formato TFLite/LiteRT para su despliegue en dispositivos edge y móviles. Resuelve el problema de clasificación de imágenes en 1000 categorías de ImageNet-1k, ofreciendo un equilibrio entre precisión y eficiencia gracias al compound scaling de EfficientNet.

El modelo cuenta con 66.347.960 parámetros y alcanza una precisión Top-1 de 84,1% y Top-5 de 96,9% en ImageNet-1k. Se incluye una variante cuantizada weight-only int8 que reduce el tamaño del archivo unas 3,8 veces respecto a float32, manteniendo el rendimiento en una comprobación preliminar. La relevancia actual radica en que LiteRT es el sucesor de TensorFlow Lite y permite ejecutar este modelo en dispositivos con recursos limitados, sin necesidad de conexión a servidores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B7 (CNN con bloques MBConv, squeeze-and-excitation y activación SiLU) |
| Parametros totales | 66.347.960 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | Float32 (efficientnet_b7.tflite); weight-only int8 con activaciones float32 (efficientnet_b7_weight_only_wi8_afp32.tflite) |
| Idiomas soportados | No disponible (clasificación de imágenes, no idiomas) |
| Licencia | No disponible; la model card advierte de posibles licencias derivadas de PyTorch Vision y del dataset |
| Formato de pesos | TFLite (LiteRT) |

## Arquitectura y entrenamiento

EfficientNet-B7 es una red neuronal convolucional que aplica compound scaling: escala de forma uniforme la profundidad, la anchura y la resolución de la imagen de entrada mediante un coeficiente compuesto. Cada bloque utiliza MBConv (inverted residual blocks) con conexiones residuales, capas de squeeze-and-excitation (SE) y activación SiLU. El modelo fue preentrenado en ImageNet-1k, con 1,28 millones de imágenes y 1000 clases.

La conversión a TFLite se realizó desde un checkpoint de PyTorch Vision. La variante cuantizada usa cuantización weight-only int8 (wi8) con activaciones en float32 (afp32), en lugar de cuantización de rango dinámico, porque las capas SE y SiLU son sensibles a la cuantización de activaciones. En una comprobación puntual con fotografías reales, la variante cuantizada mantiene las predicciones Top-1 con una correlación mínima de logits de 1,000.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k.
- Precisión Top-1 de 84,1% y Top-5 de 96,9% en el conjunto de validación de ImageNet-1k (según el model-index, en precisión completa).
- La variante cuantizada weight-only int8 reduce el tamaño del archivo ~3,8 veces respecto a float32, manteniendo la correlación de logits en 1,000 en una comprobación preliminar.
- No soporta tool calling, generación de texto, razonamiento, código, matemáticas ni visión multimodal más allá de la clasificación de imágenes.
- No es un modelo generativo, por lo que no tiene capacidades de agentes ni multi-step reasoning.
- No soporta idiomas; es un modelo exclusivamente de visión.

## Casos de uso

- Clasificación de imágenes en tiempo real en dispositivos móviles: el modelo en formato TFLite puede ejecutarse en smartphones mediante LiteRT, permitiendo aplicaciones de reconocimiento de objetos sin conexión. La variante cuantizada, al ser ~3,8 veces más pequeña, es adecuada para dispositivos con memoria limitada.
- Control de calidad en fabricación: puede integrarse en sistemas de visión artificial para clasificar productos o detectar defectos en líneas de producción, usando cámaras conectadas a dispositivos edge con LiteRT.
- Vigilancia y seguridad: clasificar escenas u objetos en cámaras IP con procesamiento local, reduciendo la necesidad de enviar imágenes a servidores externos.
- Accesibilidad para personas con discapacidad visual: una app móvil puede usar el modelo para identificar objetos del entorno y proporcionar descripciones por voz.
- Agricultura de precisión: clasificar cultivos, plagas o frutas a partir de imágenes captadas por drones o sensores de campo, con despliegue en dispositivos de bajo consumo.
- Categorización de productos en e-commerce: clasificar automáticamente imágenes de productos en categorías predefinidas para catálogos, aprovechando la alta precisión del modelo.
- Clasificación de imágenes médicas como base para transfer learning: aunque no está entrenado específicamente en dominios médicos, sus pesos preentrenados en ImageNet-1k sirven como punto de partida para reentrenar en conjuntos de datos de radiología o histología.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Top 1 Accuracy (Full Precision) en ImageNet-1k (validation) | 0,841 (84,1%) |
| Top 5 Accuracy (Full Precision) en ImageNet-1k (validation) | 0,969 (96,9%) |

Resultados declarados por el autor del modelo en el model-index, no verificados (verified: false). La model card indica que el modelo original de PyTorch Vision tiene acc@1 84,122% y acc@5 96,908%, que coinciden con estos valores redondeados. No se dispone de resultados de modelos comparables en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. A partir del tamaño de los pesos (66,3M parámetros), el modelo float32 ocupa aproximadamente 265 MB en memoria, y el archivo .tflite pesa 336 MB. La variante int8 pesa alrededor de 88 MB. En GPU, se estima que float32 requiere entre 0,5 y 1 GB de VRAM y la variante int8 entre 0,2 y 0,5 GB, en función del runtime y del tamaño de lote. Estas cifras son estimaciones orientativas.
- GPU recomendadas: no disponible. Al ser un modelo para on-device, no requiere GPU de servidor; puede ejecutarse en CPU, GPU o NPU de dispositivos móviles y edge mediante LiteRT.
- Cabe en GPU de consumo: sí, por su tamaño (66,3M parámetros) es compatible con GPUs consumer como la serie RTX 30/40, aunque el uso previsto es en dispositivos edge.
- Opciones de despliegue: LiteRT (antiguo TensorFlow Lite) como runtime principal, con soporte para Android, iOS, Raspberry Pi y otros dispositivos edge. No se documentan otros runtimes como vLLM, llama.cpp o TGI, que no aplican a modelos de visión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa en los datos proporcionados. El modelo pertenece a la familia EfficientNet, pero no se han incluido resultados de otros modelos en la documentación disponible.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible. No obstante, el modelo fue entrenado en ImageNet-1k, un conjunto de datos que históricamente presenta sesgos hacia imágenes occidentales y objetos comunes, lo que puede afectar al rendimiento en otros contextos.
- Riesgo de alucinación: no aplica, ya que es un modelo discriminativo de clasificación y no genera texto.
- Limitaciones de contexto o idioma: no aplica; es un modelo de visión y no procesa texto.
- Restricciones de licencia: la licencia no está especificada en HuggingFace. La model card advierte que los pesos convertidos de PyTorch Vision pueden estar sujetos a licencias o términos propios de PyTorch Vision y del dataset de entrenamiento. Es responsabilidad del usuario verificar los permisos antes de usar el modelo en producción.
- Los resultados de benchmarks declarados no están verificados (verified: false).
- La variante cuantizada ha sido validada solo en una comprobación preliminar con fotografías reales; no se garantiza el mismo rendimiento en todos los casos.
- El modelo está limitado a clasificación de imágenes y no soporta detección, segmentación ni otras tareas de visión.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/efficientnet_b7
- GitHub de LiteRT: https://github.com/google-ai-edge/litert
- Documentación de LiteRT: https://developers.google.com/edge/litert
- Paper original: https://arxiv.org/abs/1905.11946
- Modelo base en HuggingFace: https://huggingface.co/google/efficientnet-b7
