# ketiswp/tensorflow-MobileNetV1-0.5-ImageNet-224-fp32-onnx

## Resumen

El modelo `ketiswp/tensorflow-MobileNetV1-0.5-ImageNet-224-fp32-onnx` es una conversión a formato ONNX del clásico MobileNetV1, concretamente la variante con factor de anchura 0.5 y resolución de entrada de 224×224, preentrenada sobre ImageNet para clasificación de imágenes. Ha sido publicado por el usuario ketiswp bajo licencia Apache 2.0, y se presenta como un archivo ONNX en precisión FP32, listo para ser ejecutado con ONNX Runtime u otros motores compatibles. Su relevancia reside en que ofrece un modelo de clasificación ligero y eficiente, adecuado para entornos con recursos limitados como dispositivos móviles o sistemas embebidos, donde la conversión a ONNX facilita la interoperabilidad entre frameworks y la optimización de la inferencia.

Aunque no se proporcionan detalles sobre el proceso de entrenamiento original, este modelo es una adaptación directa del MobileNetV1 publicado por el equipo de TensorFlow en su repositorio oficial. La arquitectura MobileNetV1 se basa en convoluciones separables en profundidad, lo que reduce drásticamente el número de parámetros y el coste computacional en comparación con redes convolucionales estándar. La versión 0.5 reduce aún más el tamaño al multiplicar el número de filtros en cada capa por 0.5, resultando en un modelo compacto que mantiene una precisión razonable para muchas tareas de clasificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV1 (convoluciones separables en profundidad, factor de anchura 0.5, entrada 224×224) |
| Parametros totales | No disponible (estimación aproximada: ~1,3 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | FP32 (la model card indica FP32; se referencia una versión INT8 en el mismo repositorio) |
| Idiomas soportados | No disponible (tarea de visión, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo original MobileNetV1 fue desarrollado por Google y presentado en el artículo "MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications" (Howard et al., 2017). Su arquitectura se basa en una pila de bloques de convolución separable en profundidad (depthwise separable convolution), que descompone una convolución estándar en una convolución de profundidad seguida de una convolución puntual (1×1). Esto reduce el coste computacional entre 8 y 9 veces en comparación con una convolución estándar equivalente.

La variante 0.5 aplica un multiplicador de anchura de 0.5 a todas las capas, lo que reduce el número de canales y por tanto el número de parámetros y FLOPs. El modelo fue preentrenado sobre el dataset ImageNet (ILSVRC-2012) con una entrada de 224×224 píxeles. La conversión a ONNX se ha realizado a partir del checkpoint original de TensorFlow, preservando los pesos y la arquitectura. No se dispone de información sobre el proceso exacto de conversión ni sobre si se aplicaron técnicas de cuantización o optimización adicionales en esta versión FP32.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (por ejemplo, perros, gatos, vehículos, objetos cotidianos).
- Inferencia de imágenes con resolución 224×224, aceptando tensores de entrada de forma (N, 3, 224, 224) en el formato ONNX estándar (NCHW).
- Funciona como clasificador de imágenes independiente o como extractor de características si se elimina la capa final.
- Compatible con herramientas de ONNX (ONNX Runtime, ONNX.js, TensorRT, etc.) para despliegue en múltiples plataformas.
- No posee capacidades de generación de texto, tool calling, agentes ni razonamiento multimodal.

## Casos de uso

- **Clasificación de imágenes en dispositivos móviles**: gracias a su pequeño tamaño (aproximadamente 5 MB en FP32) y bajo coste computacional, es adecuado para aplicaciones Android/iOS de clasificación de objetos en tiempo real, como identificación de plantas o productos.
- **Sistema de moderación de contenido**: puede integrarse en pipelines de backend para clasificar imágenes en categorías predefinidas (por ejemplo, contenido no seguro, objetos prohibidos) usando ONNX Runtime en servidores con CPU.
- **Prototipado rápido de modelos de visión**: al ser un modelo preentrenado y ligero, sirve como punto de partida para fine-tuning en dominios específicos (detección de defectos industriales, clasificación de cultivos, etc.) sin necesidad de hardware potente.
- **Clasificación de imágenes médicas básica**: aunque no es específico para diagnóstico, puede utilizarse como extractor de características para tareas de clasificación binaria (por ejemplo, nevos benignos vs. malignos) tras una adaptación de la capa final.
- **Aplicaciones de accesibilidad**: para clasificar objetos en tiempo real en dispositivos de asistencia (por ejemplo, leer etiquetas o identificar monedas) con baja latencia.
- **Sistemas de búsqueda visual**: como parte de un sistema de indexación, puede extraer embeddings de las imágenes para realizar búsquedas por similitud con otros vectores de características.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de MobileNetV1 con factor 0.5 alcanza aproximadamente un 39-40% de precisión Top-1 en ImageNet, según la documentación de TensorFlow (fuente: research/slim/nets/mobilenet_v1.md). Sin embargo, estos datos corresponden al modelo TensorFlow original y no se ha confirmado si la conversión ONNX mantiene exactamente los mismos resultados. Se recomienda evaluar el modelo en el propio entorno antes de su uso en producción.

## Requisitos de hardware

- **VRAM**: al ser un modelo de clasificación de imágenes con alrededor de 1.3 millones de parámetros, el tamaño del archivo FP32 es de aproximadamente 5 MB. La inferencia requiere memoria RAM/VRAM mínima, inferior a 100 MB incluso con imágenes en batch.
- **GPU recomendadas**: no se necesita GPU; cualquier CPU moderna puede ejecutar el modelo con ONNX Runtime. Si se usa GPU, una NVIDIA Jetson Nano o similar es suficiente.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier GPU (incluso integradas) y en dispositivos móviles.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU), ONNX.js para navegador, TFLite para móviles (tras conversión), TensorRT para inferencia acelerada en NVIDIA.
- **Latencia y throughput**: en CPU de gama media, la latencia de inferencia para una sola imagen es de alrededor de 10-30 ms. No se tienen datos exactos del modelo convertido, pero es comparable al MobileNet original.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión Top-1 (ImageNet) | Formato | Licencia |
|---|---|---|---|---|
| MobileNetV1 0.5 (este) | ~1.3M (estimado) | ~40% (original) | ONNX FP32 | Apache 2.0 |
| MobileNetV2 (1.0, 224) | 3.4M | 71.8% (original) | TensorFlow, ONNX | Apache 2.0 |
| EfficientNet-Lite0 | 4.7M | 75.1% (original) | TensorFlow, ONNX | Apache 2.0 |

Nota: los datos de los modelos comparativos provienen de sus respectivas publicaciones y pueden variar según la implementación. Este modelo ofrece un equilibrio entre tamaño y precisión, siendo más ligero que MobileNetV2 y EfficientNet-Lite, pero con menor precisión. La elección depende de las restricciones de recursos y la precisión requerida.

## Limitaciones y advertencias

- **Precisión moderada**: el factor de anchura 0.5 reduce la capacidad del modelo, por lo que su precisión en ImageNet es significativamente inferior a modelos más grandes (por ejemplo, MobileNetV2). Puede fallar en clasificaciones con clases similares.
- **Sesgos**: al estar preentrenado en ImageNet, el modelo puede presentar sesgos de género, raza o contexto en las imágenes, reflejando los sesgos presentes en el dataset de entrenamiento.
- **Alucinaciones**: no aplica, al ser un modelo discriminativo, no generativo.
- **Limitaciones de contexto**: solo procesa imágenes de 224×224; si se le proporcionan imágenes de otras resoluciones, se requiere redimensionar o recortar, lo que puede afectar la precisión.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, pero se debe incluir el aviso de licencia y atribución correspondiente.
- **Dependencia de la conversión**: aunque la conversión a ONNX es fiel al modelo original, puede haber ligeras diferencias numéricas debidas a la representación de los pesos. Se recomienda validar el modelo en un conjunto de prueba antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketiswp/tensorflow-MobileNetV1-0.5-ImageNet-224-fp32-onnx
- Versión INT8 del mismo modelo: https://huggingface.co/ketiswp/tensorflow-MobileNetV1-0.5-ImageNet-224-int8-onnx
- Documentación original de MobileNetV1 en TensorFlow: https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet_v1.md
- API de TensorFlow MobileNet: https://www.tensorflow.org/api_docs/python/tf/keras/applications/mobilenet
- Ejemplo de conversión a ONNX (Zenodo): https://zenodo.org/records/3157894
- Benchmark de MobileNetV1 en TensorFlow: https://github.com/hirokobayashi/models/blob/master/benchmarks/image_recognition/tensorflow/mobilenet_v1/README.md
