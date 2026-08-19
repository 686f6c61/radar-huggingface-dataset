# ketiswp/onnx-model-zoo-SqueezeNet1.0-ImageNet-opset12-int8-uint8-onnx

## Resumen

SqueezeNet 1.0 es una red neuronal convolucional ligera diseñada para clasificación de imágenes con un número reducido de parámetros. Este repositorio aloja una versión del modelo en formato ONNX (opset 12) cuantizada estáticamente a 8 bits, con pesos INT8 y activaciones UINT8, utilizando un formato mixto QOperator/QDQ. El modelo original procede del ONNX Model Zoo y ha sido adaptado por el autor ketiswp para facilitar su despliegue en entornos con recursos limitados, como dispositivos de borde o sistemas embebidos.

La cuantización reduce el tamaño del modelo y acelera la inferencia en CPUs y aceleradores que soportan operaciones de 8 bits, manteniendo una precisión razonable para tareas de clasificación de imágenes con las 1000 categorías de ImageNet. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas.

El repositorio, aunque declarado, tiene un tamaño de 0.0 GB, lo que indica que el archivo del modelo podría no estar presente o estar pendiente de subida. Esto es un punto importante a considerar antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SqueezeNet 1.0 (CNN con módulos fire) |
| Parametros totales | no disponible (el modelo original SqueezeNet 1.0 tiene aproximadamente 1.2 millones, pero no se confirma en la informacion del repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | INT8 pesos, UINT8 activaciones (cuantizacion estatica, formato mixto QOperator/QDQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

SqueezeNet 1.0 es una CNN compacta que utiliza módulos "fire" compuestos por una capa de convolución 1x1 (squeeze) seguida de dos capas de convolución 1x1 y 3x3 (expand). Esta arquitectura reduce el número de parámetros en comparación con redes como AlexNet, manteniendo una precisión competitiva en ImageNet. El modelo original fue entrenado con el conjunto de datos ImageNet y logró una precisión top-1 de aproximadamente 57.5% y top-5 de 80.3% (datos del modelo FP32, no confirmados en este repositorio).

La versión cuantizada presentada aquí ha sido obtenida mediante cuantización estática de 8 bits, lo que convierte los pesos a INT8 y las activaciones a UINT8. El proceso de cuantización se realizó probablemente con herramientas como Intel Neural Compressor o similares, aunque no se especifica en la documentación. No se proporcionan detalles sobre el proceso de entrenamiento o ajuste posterior a la cuantización.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (perros, gatos, objetos cotidianos, etc.).
- Inferencia de imágenes con entrada de tamaño 224x224 píxeles (estándar de SqueezeNet).
- Soporte para ejecución en CPU y dispositivos de bajo consumo gracias a la cuantización INT8/UINT8.
- Formato ONNX compatible con ONNX Runtime, TensorRT, OpenVINO y otros runtime.
- No soporta detección de objetos, segmentación ni otras tareas de visión más allá de clasificación.

## Casos de uso

- Clasificación de imágenes en tiempo real en dispositivos IoT: el modelo cuantizado ocupa menos de 5 MB (estimación basada en el tamaño del modelo FP32 de 4.8 MB), lo que permite ejecutarlo en microcontroladores o Raspberry Pi con limitaciones de memoria.
- Sistemas de moderación de contenido: clasificar imágenes en categorías predefinidas para filtrar contenido inapropiado en plataformas sociales.
- Aplicaciones de asistencia visual: identificación de objetos para personas con discapacidad visual, ejecutándose localmente en un smartphone.
- Clasificación de productos en retail: reconocimiento de categorías de artículos en fotografías de inventario.
- Prototipos de visión por computadora en entornos académicos: como modelo base para evaluar técnicas de cuantización o optimización.
- Despliegue en entornos con restricción de memoria: su bajo número de parámetros y cuantización permiten integrarlo en sistemas embebidos con poca RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada en la información disponible. El modelo original SqueezeNet 1.0 FP32 alcanza una precisión top-1 de 57.5% y top-5 de 80.3% en ImageNet, pero los valores tras la cuantización INT8/UINT8 pueden variar ligeramente. Se recomienda evaluar el modelo con datos propios antes de producción.

## Requisitos de hardware

- El modelo cuantizado tiene un tamaño aproximado de 4-5 MB (el FP32 ocupa 4.8 MB; el INT8 ocupa aproximadamente la mitad). Puede ejecutarse en CPUs sin GPU, con un uso de memoria inferior a 100 MB en runtime.
- GPU recomendadas: cualquier GPU con soporte para INT8 (NVIDIA Jetson, RTX series, etc.) para aceleración adicional, aunque no es necesario.
- Cabe en dispositivos de gama baja: Raspberry Pi 3/4, microcontroladores con suficiente RAM (≥256 MB) y CPU ARM.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO, llama.cpp no aplica (no es LLM), y otros runtime ONNX.
- Latencia estimada: en una CPU moderna de escritorio, la inferencia de una imagen puede tomar entre 5-15 ms; en un Raspberry Pi 4, alrededor de 50-100 ms (valores orientativos, no medidos en este repositorio).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Precisión (ImageNet top-1) | Licencia | Formato |
|---|---|---|---|---|---|
| SqueezeNet 1.0 (este) | Fire modules | ~1.2 M | ~57.5% (FP32, no confirmado) | Apache-2.0 | ONNX INT8 |
| MobileNetV2 | Inverted residuals | ~3.4 M | ~71.8% (FP32) | Apache-2.0 | ONNX, TFLite |
| ResNet-18 | Residual blocks | ~11.7 M | ~69.8% (FP32) | BSD-3-Clause | ONNX, PyTorch |
| ShuffleNetV2 | Shuffle units | ~2.3 M | ~69.4% (FP32) | Apache-2.0 | ONNX |

Nota: los datos de precisión de los modelos comparados provienen de referencias estándar y no se han verificado en este repositorio. Este modelo cuantizado puede tener una precisión inferior a los valores FP32 indicados.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que el archivo del modelo podría no estar subido o el repositorio está vacío. Es necesario verificar su contenido antes de su uso.
- La cuantización INT8/UINT8 puede provocar una pérdida de precisión de entre 1-3 puntos porcentuales en top-1 respecto al modelo FP32, dependiendo del proceso de calibración.
- No se proporcionan datos de calibración ni el conjunto de datos utilizado para la cuantización, por lo que el rendimiento en imágenes fuera de ImageNet puede degradarse.
- El modelo solo realiza clasificación de imágenes, no es adecuado para tareas de detección, segmentación o generación.
- No se incluyen instrucciones de uso en la model card; es necesario cargar el archivo ONNX con ONNX Runtime u otro runtime compatible.
- La licencia Apache-2.0 permite uso comercial, pero el modelo original proviene de ONNX Model Zoo, que también es de código abierto, por lo que no hay restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ketiswp/onnx-model-zoo-SqueezeNet1.0-ImageNet-opset12-int8-uint8-onnx
- Versión FP32 (enlazada): https://huggingface.co/ketiswp/onnx-model-zoo-SqueezeNet1.0-ImageNet-opset12-fp32-onnx
- Modelo original en ONNX Model Zoo: https://github.com/onnx/models/tree/4f43949841cb55a0b98dc8fcd045431ccafd9f96/validated/vision/classification/squeezenet
- ONNX Model Zoo general: https://github.com/onnx/models
- ONNX Runtime Models: https://onnxruntime.ai/models
