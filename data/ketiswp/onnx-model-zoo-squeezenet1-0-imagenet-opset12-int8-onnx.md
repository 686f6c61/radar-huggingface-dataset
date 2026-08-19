# ketiswp/onnx-model-zoo-SqueezeNet1.0-ImageNet-opset12-int8-onnx

## Resumen

SqueezeNet 1.0 es un modelo de clasificación de imágenes de la familia SqueezeNet, conocido por lograr una precisión competitiva en ImageNet con un número reducido de parámetros. Esta variante concreta, publicada por el usuario ketiswp, es una conversión a formato ONNX con el opset 12 y cuantización estática INT8, lo que la hace especialmente adecuada para despliegue en entornos con recursos limitados. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para su uso con ONNX Runtime u otros runtimes compatibles con ONNX. Su relevancia radica en ofrecer una versión compacta y eficiente de un clasificador de imágenes, sin necesidad de depender de frameworks propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SqueezeNet 1.0 |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | INT8 estático (formato mixto QOperator/QDQ) |
| Idiomas soportados | No aplica (clasificación de imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 12) |

## Arquitectura y entrenamiento

El modelo corresponde a la arquitectura SqueezeNet 1.0, que utiliza módulos "fire" compuestos por capas de squeeze y expand para reducir el número de parámetros manteniendo un rendimiento aceptable en clasificación. En esta versión se ha convertido el modelo original de ONNX Model Zoo (FP32) a ONNX con opset 12 y se ha aplicado una cuantización estática INT8, lo que reduce el tamaño y acelera la inferencia en hardware compatible. No se dispone de información detallada sobre el proceso de entrenamiento original (número de épocas, dataset completo, técnicas de regularización, etc.). El modelo está preentrenado en ImageNet y clasifica en 1000 categorías.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet.
- Inferencia eficiente gracias a la cuantización INT8, que reduce el consumo de memoria y acelera la inferencia en CPUs y NPUs.
- Compatibilidad con el ecosistema ONNX (ONNX Runtime, OpenVINO, TensorRT, etc.) para despliegue multiplataforma.
- No soporta tool calling, generación de texto ni razonamiento conversacional, al ser un modelo puramente visual.

## Casos de uso

- Clasificación de imágenes en tiempo real en dispositivos de bajo consumo (Raspberry Pi, móviles): su tamaño reducido permite ejecutarlo con baja latencia.
- Sistemas de reconocimiento de objetos en entornos industriales: identificación de productos o defectos en líneas de producción mediante imágenes.
- Aplicaciones de accesibilidad: descripción automática de imágenes para personas con discapacidad visual, usando el modelo como clasificador base.
- Filtrado de contenido en plataformas: detección de categorías de imágenes (por ejemplo, contenido inapropiado) a partir de las etiquetas de ImageNet.
- Investigación académica: como punto de partida para fine-tuning o para comparar técnicas de cuantización y compresión de modelos.
- Prototipado rápido en entornos de edge computing: integración con ONNX Runtime en aplicaciones Python o C++ para clasificar imágenes sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Se desconoce la precisión exacta en ImageNet para esta versión cuantizada, así como comparativas con otras implementaciones.

## Requisitos de hardware

- Dado que es un modelo pequeño (típicamente alrededor de 1.2 millones de parámetros en SqueezeNet), la VRAM necesaria es mínima, pero no se dispone de cifras concretas en la información proporcionada.
- Puede ejecutarse en CPU sin GPU, gracias a su baja carga computacional. No se requiere una GPU específica.
- Es adecuado para dispositivos con memoria RAM limitada, como teléfonos móviles o placas de desarrollo.
- Para despliegue, se puede usar ONNX Runtime (CPU o GPU), o herramientas como OpenVINO, TensorRT, o llama.cpp (aunque no es un modelo de lenguaje). No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en los datos proporcionados. Sin embargo, dentro de la familia SqueezeNet, existe SqueezeNet 1.1 (con menos parámetros) y alternativas como MobileNet v1 o ShuffleNet, pero no se conocen datos concretos de comparación de esta versión cuantizada.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo preentrenado en ImageNet, puede heredar sesgos de ese dataset (por ejemplo, sesgos geográficos o de género en las categorías).
- La clasificación se limita a las 1000 clases de ImageNet; no es adecuado para clasificaciones personalizadas sin fine-tuning.
- La cuantización INT8 puede causar una ligera pérdida de precisión en comparación con la versión FP32.
- No se dispone de información sobre el proceso de cuantización (calibración, dataset usado) ni de garantías de rendimiento en producción.
- El modelo se distribuye tal cual, sin garantías de soporte o mantenimiento.

## Enlaces

- [HuggingFace del modelo INT8](https://huggingface.co/ketiswp/onnx-model-zoo-SqueezeNet1.0-ImageNet-opset12-int8-onnx)
- [Versión FP32 pareada](https://huggingface.co/ketiswp/onnx-model-zoo-SqueezeNet1.0-ImageNet-opset12-fp32-onnx)
- [Modelo original en ONNX Model Zoo](https://github.com/onnx/models/tree/4f43949841cb55a0b98dc8fcd045431ccafd9f96/validated/vision/classification/squeezenet)
- [Repositorio ONNX Model Zoo](https://github.com/onnx/models)
