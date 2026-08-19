# ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-fp32-onnx

## Resumen

El modelo `ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-fp32-onnx` es una conversión a formato ONNX en precisión FP32 de un MobileNetV2 con factor de ancho 0.5, entrenado sobre ImageNet a resolución 224×224. Forma parte del ecosistema STM32 AI model zoo de STMicroelectronics, un conjunto de modelos preentrenados y optimizados para su despliegue en microcontroladores de la familia STM32. El modelo está pensado para tareas de clasificación de imágenes, con un balance entre precisión y coste computacional que lo hace adecuado para entornos con recursos limitados.

Su relevancia actual radica en la creciente demanda de modelos de visión eficientes para aplicaciones embebidas y de edge computing. Al estar disponible en ONNX FP32, facilita la integración con el runtime ONNX y con herramientas de conversión como STM32Cube.AI, permitiendo a los desarrolladores evaluar el modelo en formato flotante antes de aplicar cuantización a INT8 para su despliegue final en hardware de microcontrolador. El modelo está publicado bajo licencia Apache 2.0 y no incluye información sobre el número exacto de parámetros ni el dataset de entrenamiento en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (factor de ancho 0.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 (nativo); existe version INT8 en el modelo emparejado |
| Idiomas soportados | no disponible (clasificacion de imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

MobileNetV2 es una red neuronal convolucional ligera basada en bloques residuales invertidos (inverted residual blocks) con cuellos de botella lineales. La variante con factor de ancho 0.5 reduce el numero de canales internos a la mitad respecto al modelo base, lo que disminuye el coste computacional y el tamano del modelo a costa de una menor precision. El modelo se entrena para clasificacion de imagenes en el conjunto ImageNet a una resolucion de 224×224 píxeles.

La informacion proporcionada no detalla el proceso de entrenamiento especifico ni el numero de tokens o epocas. Segun el repositorio de STMicroelectronics, el modelo puede entrenarse desde cero (training from scratch) o mediante transferencia de aprendizaje, donde solo la ultima capa se ajusta sobre pesos preentrenados. Este archivo concreto corresponde a la version FP32 en formato ONNX, lista para ser cargada con ONNX Runtime o convertida a otros formatos mediante STM32Cube.AI.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet.
- Inferencia en formato ONNX con precision FP32, compatible con ONNX Runtime.
- Disenado para su despliegue en microcontroladores STM32 mediante STM32Cube.AI.
- No incluye capacidades de generacion de texto, tool calling, agentes, vision multimodal ni razonamiento complejo.
- No es multilingue: el modelo no procesa texto.

## Casos de uso

- Clasificacion de imagenes en dispositivos embebidos: el modelo puede integrarse en sistemas de vision artificial para reconocimiento de objetos en tiempo real en dispositivos STM32, por ejemplo en clasificacion de productos en lineas de montaje o deteccion de defectos visuales.
- Prototipado de pipelines de vision en edge: gracias a su formato ONNX FP32, se puede evaluar la precision del modelo en entornos de escritorio antes de proceder a la cuantizacion a INT8 para su despliegue en MCU.
- Comparacion de arquitecturas ligeras: al ser una variante MobileNetV2 con factor 0.5, sirve como punto de referencia para evaluar el equilibrio entre precision y consumo de recursos frente a otras redes como MobileNetV1 o EfficientNet-Lite.
- Desarrollo de sistemas de asistencia visual en agricultura o industria: el modelo puede clasificar plantas, frutas o componentes en imagenes capturadas por camaras de bajo coste conectadas a STM32.
- Educacion e investigacion en IA embebida: util como ejemplo de conversion de modelos PyTorch a ONNX y de despliegue en microcontroladores, con la documentacion disponible en el STM32 model zoo.
- Prueba de optimizaciones de hardware: al ser un modelo compacto, permite evaluar el impacto de la cuantizacion, la poda o el ajuste de la resolucion de entrada en el rendimiento final de un sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de STMicroelectronics menciona metricas de rendimiento medidas con STM32Cube.AI, pero los datos numericos (accuracy, latencia, RAM) no estan incluidos en la model card ni en los resultados de busqueda. Por tanto, no es posible ofrecer una tabla comparativa de benchmarks.

## Requisitos de hardware

- El modelo esta disenado para ejecutarse en microcontroladores STM32, no en GPU convencionales.
- No se especifica la VRAM necesaria, ya que no es un modelo para inferencia en GPU; su tamano en FP32 es reducido, estimable en el orden de unos pocos megabytes, pero el dato exacto no esta disponible.
- Para la evaluacion en escritorio puede ejecutarse con ONNX Runtime en CPU, sin necesidad de GPU.
- Para su despliegue en MCU, se recomienda usar STM32Cube.AI para la conversion y optimizacion del modelo.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No hay datos de rendimiento disponibles en la informacion proporcionada para comparar directamente con otros modelos. No obstante, se puede situar en la familia de redes ligeras de clasificacion de imagenes:

| Modelo | Parametros | Contexto | Precision | Licencia |
|---|---|---|---|---|
| MobileNetV2 0.5 (este modelo) | no disponible | no aplica | no disponible | Apache-2.0 |
| MobileNetV2 estandar | ~3.4M (aprox.) | no aplica | superior al 0.5 | Apache-2.0 |
| MobileNetV1 | ~4.2M | no aplica | comparable | Apache-2.0 |

Los datos de precision no estan disponibles para este modelo concreto.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo; como clasificador entrenado con ImageNet, puede heredar sesgos presentes en ese conjunto de datos.
- El modelo tiene una precision limitada en comparacion con versiones mas grandes de MobileNetV2; el factor de ancho 0.5 reduce el rendimiento en tareas de clasificacion fina.
- No es un modelo generativo ni multimodal; solo clasifica imagenes en categorias fijas de ImageNet.
- La informacion de entrenamiento (epocas, datos, tecnicas de regularizacion) no esta disponible en la model card.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los terminos de los datos de entrenamiento originales (ImageNet) para aplicaciones comerciales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-fp32-onnx)
- [Version INT8 del mismo modelo](https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-int8-onnx)
- [Repositorio STM32 model zoo en GitHub](https://github.com/STMicroelectronics/stm32ai-modelzoo/tree/main/image_classification/mobilenetv2)
- [Modelo base en HuggingFace de STMicroelectronics](https://huggingface.co/STMicroelectronics/mobilenetv2)
- [STM32 AI model zoo oficial](https://stm32ai.st.com/model-zoo/)
