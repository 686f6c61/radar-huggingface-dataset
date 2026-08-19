# ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-int8-onnx

## Resumen

El modelo `ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-int8-onnx` es una versión cuantizada a 8 bits (INT8) de la arquitectura MobileNetV1, específicamente la variante con un ancho de multiplicador (alpha) de 0.25 y una resolución de entrada de 224x224 píxeles. Fue desarrollado por el usuario ketiswp a partir del modelo original de TensorFlow Models (TensorFlow Slim) y convertido a formato ONNX para su uso con ONNX Runtime. La cuantización es estática en formato QDQ (Quantize-Dequantize), lo que reduce el tamaño y acelera la inferencia en hardware compatible, a costa de una mínima pérdida de precisión.

Este modelo está diseñado para clasificación de imágenes sobre ImageNet, con un enfoque en dispositivos de bajos recursos, móviles y sistemas embebidos. Su relevancia radica en que ofrece una solución ligera y eficiente para tareas de visión por computador en entornos con restricciones de memoria y computación, como la inferencia en el borde (edge computing) o en dispositivos IoT. Aunque no se especifican detalles de contexto (en el sentido de NLP), se trata de un modelo de visión puro.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV1 (convoluciones separables en profundidad, width multiplier 0.25) |
| Parámetros totales | No disponible (estimación típica para MobileNetV1 0.25: ~0.4 millones, pero no confirmado) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantización | INT8 (estática, formato QDQ) |
| Idiomas soportados | No disponible (no aplica, es un clasificador de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con pesos cuantizados INT8) |

## Arquitectura y entrenamiento

MobileNetV1 es una arquitectura de red neuronal convolucional ligera introducida por Howard et al. en 2017. Su principal innovación es el uso de **convoluciones separables en profundidad** (depthwise separable convolutions), que descomponen una convolución estándar en una convolución depthwise y una pointwise (1x1). Esto reduce drásticamente el número de parámetros y el coste computacional en comparación con convoluciones estándar. Además, introduce un hiperparámetro **width multiplier** (alpha) que escala el número de canales en cada capa, permitiendo ajustar el equilibrio entre latencia y precisión. En esta versión, alpha=0.25 reduce el ancho de las capas al 25%, y la resolución de entrada es de 224x224 píxeles, la misma que la versión original de ImageNet.

El modelo original fue entrenado en TensorFlow (Slim) sobre el dataset ImageNet (1.28 millones de imágenes, 1000 clases). El proceso de cuantización a INT8 se realizó de forma estática, probablemente con calibración sobre un subconjunto de datos, convirtiendo el grafo a formato ONNX QDQ. No se mencionan técnicas como RLHF o DPO, ya que no es un modelo generativo. El autor no ha publicado detalles sobre el proceso de cuantización ni el dataset de calibración.

## Capacidades

- **Clasificación de imágenes**: es capaz de clasificar imágenes en 1000 categorías de ImageNet (objetos, animales, plantas, etc.).
- **Extracción de características**: al ser una red convolutional preentrenada, puede utilizarse como extractor de características para tareas de transferencia de aprendizaje, como detección de objetos o segmentación.
- **Inferencia eficiente**: gracias a la cuantización INT8 y la arquitectura ligera, es adecuado para dispositivos con recursos limitados (CPU, dispositivos móviles, microcontroladores).
- **Compatibilidad con ONNX Runtime**: el formato ONNX permite ejecutarlo en múltiples plataformas (Windows, Linux, Android, iOS, navegador web) mediante el runtime de ONNX.

## Casos de uso

- **Clasificación de imágenes en el borde**: por ejemplo, en un sistema de vigilancia con una Raspberry Pi, se puede desplegar el modelo para identificar objetos en tiempo real. Gracias a su tamaño reducido y cuantización INT8, la inferencia es rápida en CPU sin necesidad de GPU.
- **Aplicación móvil de reconocimiento de plantas**: una app que fotografíe hojas y clasifique la especie vegetal. El modelo se integra en un pipeline de ONNX Runtime Mobile y se ejecuta localmente sin conexión.
- **Preprocesamiento en pipelines de visión**: como parte de un sistema de detección de anomalías en fabricación, se usa para clasificar piezas como defectuosas o correctas. Su baja latencia permite procesar múltiples imágenes por segundo en hardware industrial.
- **Transferencia de aprendizaje**: el modelo (antes de cuantización) puede servir como base para entrenar un clasificador personalizado con pocas imágenes, gracias a las características extraídas de ImageNet.
- **Aplicaciones de accesibilidad**: clasificación de objetos para personas con discapacidad visual en tiempo real mediante una app móvil. La cuantización reduce el consumo de batería y memoria.
- **Educación e investigación**: como ejemplo de modelo ligero para comparar técnicas de cuantización y despliegue en entornos de aprendizaje automático embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de precisión en ImageNet, ni comparaciones con otras versiones o modelos. Se recomienda evaluar el modelo en el conjunto de validación de ImageNet para obtener datos de rendimiento.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo INT8 muy pequeño (menos de 1 MB de pesos), la inferencia se puede realizar en CPU sin GPU. Se estima que la memoria RAM necesaria es inferior a 100 MB.
- **GPU recomendadas**: no se requiere GPU específica; cualquier CPU moderna puede ejecutarlo. Si se usa GPU, cualquier modelo con al menos 1 GB de VRAM es suficiente, pero no es necesario.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo (por ejemplo, GTX 1650, RTX 3060) y también en hardware embebido como Jetson Nano.
- **Opciones de despliegue**: ONNX Runtime (CPU, CUDA, TensorRT), OpenVINO, también puede convertirse a TensorFlow Lite o CoreML para móviles. Se puede servir con FastAPI y ONNX Runtime para API REST.
- **Latencia y throughput**: en una CPU moderna (i5 de 8ª generación) se espera una latencia de 5-15 ms por imagen (224x224) con INT8. No hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Precisión ImageNet (top-1) | Licencia | Formato |
|---|---|---|---|---|---|
| MobileNetV1 0.25 (este) | ~0.4M (estimado) | 224 | No disponible | Apache 2.0 | ONNX INT8 |
| MobileNetV1 0.25 (FP32 original) | ~0.4M | 224 | ~50.2% (referencia) | Apache 2.0 | TensorFlow |
| MobileNetV1 0.5 (FP32) | ~1.3M | 224 | ~63.3% | Apache 2.0 | TensorFlow |
| EfficientNet-Lite0 | 4.7M | 224 | ~75.1% | Apache 2.0 | TFLite |

Nota: los valores de precisión para MobileNetV1 0.25 se basan en publicaciones originales, pero no se confirma que este modelo cuantizado alcance esa precisión. La comparación es orientativa; no se dispone de datos exactos de esta versión.

## Limitaciones y advertencias

- **Precisión reducida por cuantización**: la conversión a INT8 puede degradar la precisión (típicamente entre 1-3% en ImageNet). No se han publicado métricas exactas.
- **Sesgos y limitaciones del dataset**: entrenado en ImageNet, que tiene un sesgo hacia imágenes occidentales y categorías limitadas. No es adecuado para dominios específicos sin fine-tuning.
- **Riesgo de alucinación**: no aplica, ya que no es un modelo generativo de texto.
- **Contexto y idioma**: no relevante, es un modelo de visión.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de licencia.
- **Formato**: el modelo es ONNX INT8; para usarlo en otros frameworks (TensorFlow, PyTorch) es necesario convertir el grafo, lo que puede introducir incompatibilidades.

## Enlaces

- Modelo en Hugging Face: [ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-int8-onnx](https://huggingface.co/ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-int8-onnx)
- Versión FP32 del modelo: [ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-fp32-onnx](https://huggingface.co/ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-fp32-onnx)
- Modelo original TensorFlow (GitHub): [tensorflow/models - mobilenet_v1.md](https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet_v1.md)
- Documentación de MobileNetV1 en Transformers: [MobileNet V1 - Hugging Face docs](https://huggingface.co/docs/transformers/model_doc/mobilenet_v1)
- Open Model Zoo (versión 0.25-128): [mobilenet-v1-0.25-128](https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/public/mobilenet-v1-0.25-128/README.md)
- API de TensorFlow: [tf.keras.applications.mobilenet](https://www.tensorflow.org/api_docs/python/tf/keras/applications/mobilenet)
