# ashwmurt/resnet152

## Resumen

ResNet152 es una red neuronal convolucional profunda de 152 capas, publicada originalmente por Microsoft Research en 2015 en el artículo "Deep Residual Learning for Image Recognition". Esta implementación concreta, publicada por el usuario ashwmurt en HuggingFace, es una adaptación de la versión de TorchVision pensada para su uso con Qualcomm AI Hub Models, lo que permite compilar, evaluar y desplegar el modelo en dispositivos Snapdragon (móviles Android, por ejemplo). El modelo resuelve tareas de clasificación de imágenes sobre el dataset ImageNet y, además, puede emplearse como backbone (extractor de características) para construir modelos más complejos en tareas de visión por computador. Su relevancia actual radica en que, pese al auge de los transformadores, las arquitecturas residuales siguen siendo una opción eficiente y ligera para transfer learning y despliegue en entornos con recursos limitados, como los dispositivos móviles.

La arquitectura introduce conexiones de atajo (skip connections) que mitigan el problema del desvanecimiento del gradiente, permitiendo entrenar redes muy profundas. En esta ficha, el modelo se presenta como un clasificador de imágenes y backbone, con soporte para cuantización w8a8 y exportación a formatos como TensorFlow Lite, orientado a la ejecución en hardware de Qualcomm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-152 (CNN residual con conexiones de atajo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | w8a8 (cuantización de pesos y activaciones) |
| Idiomas soportados | no disponible (clasificación de imágenes, sin procesamiento de texto) |
| Licencia | other (la implementación original de TorchVision usa BSD-3-Clause) |
| Formato de pesos | no disponible (librería PyTorch, probablemente .pth) |

## Arquitectura y entrenamiento

ResNet152 se basa en el bloque residual propuesto por He et al. (2015). Cada bloque contiene dos o tres capas convolucionales con normalización por lotes y una conexión de atajo que suma la entrada a la salida del bloque, lo que permite entrenar redes de hasta 152 capas sin sufrir degradación del gradiente. La implementación de TorchVision, en la que se basa este modelo, sigue la estructura original: una capa convolucional inicial, una fase de pooling, cuatro etapas con bloques residuales (3, 8, 36 y 3 bloques respectivamente) y una capa fully connected final para clasificación.

El entrenamiento se realizó sobre el dataset ImageNet (1,28 millones de imágenes, 1000 clases), aunque no se proporcionan detalles específicos sobre el número de épocas, la composición exacta del dataset ni el uso de técnicas como aumento de datos o regularización. No se menciona ningún proceso de RLHF o DPO, ya que es un modelo supervisado de clasificación. La innovación principal de ResNet es la conexión residual, que permite profundidades sin precedentes y ha sido la base de numerosas arquitecturas posteriores.

## Capacidades

- Clasificación de imágenes: asigna una etiqueta de entre 1000 categorías de ImageNet a una imagen de entrada.
- Extracción de características: las activaciones de las capas intermedias pueden usarse como representaciones densas para tareas de transfer learning.
- Backbone para modelos complejos: puede integrarse como extractor de características en arquitecturas de detección de objetos, segmentación semántica o estimación de pose.
- Compatibilidad con Qualcomm AI Hub: permite compilar y ejecutar el modelo en dispositivos Snapdragon mediante TensorFlow Lite, ONNX Runtime o Qualcomm AI Engine Direct.
- Cuantización w8a8: soporta cuantización de pesos y activaciones a 8 bits, reduciendo el tamaño y la latencia en dispositivos móviles.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: gracias a la compatibilidad con Qualcomm AI Hub, el modelo puede desplegarse en Android para tareas como reconocimiento de plantas, objetos o escenas, con cuantización w8a8 para reducir el consumo de memoria y energía.
- Transfer learning para dominios específicos: usando las características de las capas intermedias, se puede fine-tunar el modelo en datasets pequeños (por ejemplo, clasificación de enfermedades en imágenes médicas) con una GPU modesta.
- Extracción de características para sistemas de búsqueda visual: las representaciones de la penúltima capa pueden indexarse para recuperar imágenes similares en bases de datos.
- Backbone en detección de objetos: arquitecturas como Faster R-CNN o YOLO pueden usar ResNet152 como extractor de características, mejorando la precisión en escenarios con objetos pequeños.
- Segmentación semántica: modelos como DeepLab o U-Net pueden emplear ResNet152 como encoder para segmentar imágenes en píxeles, aprovechando su profundidad para capturar contextos amplios.
- Evaluación de modelos y benchmarking: al ser una arquitectura de referencia, se utiliza para comparar el rendimiento de nuevas técnicas de entrenamiento o cuantización en hardware móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como precisión top-1 o top-5 en ImageNet, ni comparaciones con otros modelos. Se recomienda consultar la documentación de TorchVision o el paper original para obtener datos de rendimiento académico, pero no se proporcionan aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. ResNet152 tiene aproximadamente 60 millones de parámetros (dato no confirmado en la información proporcionada), por lo que en FP32 requeriría unos 240 MB de memoria, pero no se especifica.
- GPU recomendadas: no disponible. Al ser un modelo de visión, puede ejecutarse en GPUs de consumo como RTX 3060 o superiores, pero no hay datos concretos.
- Compatibilidad con consumer GPU: probablemente sí, dado su tamaño moderado, pero no se indica.
- Opciones de despliegue: Qualcomm AI Hub Workbench, TensorFlow Lite, ONNX Runtime, Qualcomm AI Engine Direct. También puede ejecutarse en PyTorch estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otras versiones de ResNet (ResNet50, ResNet101) o con arquitecturas más modernas como EfficientNet o Vision Transformer. La información proporcionada no incluye métricas ni resultados. Se puede afirmar que ResNet152 es más profundo que ResNet50 y ResNet101, lo que generalmente implica mayor precisión pero también mayor coste computacional, aunque no se aportan cifras concretas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse en ImageNet, el modelo puede heredar sesgos presentes en ese dataset (por ejemplo, sobrerrepresentación de ciertas categorías o sesgos geográficos y culturales).
- Riesgo de alucinación: no aplica directamente, ya que es un modelo discriminativo de clasificación, no generativo. Sin embargo, puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto: al ser un modelo de visión, no procesa texto ni secuencias largas; su entrada es una imagen de tamaño fijo (normalmente 224x224 píxeles).
- Restricciones de licencia: la etiqueta de HuggingFace indica "other". La implementación original de TorchVision usa BSD-3-Clause, que permite uso comercial, pero se debe verificar la licencia exacta de esta versión específica antes de usarla en producción.
- Caveat para producción: la compatibilidad con Qualcomm AI Hub requiere una cuenta y un token de API, y el despliegue en dispositivos reales puede implicar limitaciones de memoria y batería. La cuantización w8a8 puede degradar ligeramente la precisión.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ashwmurt/resnet152)
- [Paper original: Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385)
- [Implementación de TorchVision](https://github.com/pytorch/vision/blob/main/torchvision/models/resnet.py)
- [Qualcomm AI Hub Models](https://github.com/quic/ai-hub-models)
- [Qualcomm AI Hub Workbench](https://workbench.aihub.qualcomm.com)
- [Documentación de TorchVision para resnet152](https://docs.pytorch.org/vision/main/models/generated/torchvision.models.resnet152.html)
