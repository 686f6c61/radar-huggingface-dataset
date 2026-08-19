# ketiswp/onnx-model-zoo-SqueezeNet1.0-ImageNet-opset12-fp32-onnx

## Resumen

El modelo `ketiswp/onnx-model-zoo-SqueezeNet1.0-ImageNet-opset12-fp32-onnx` es una conversión a formato ONNX del modelo SqueezeNet 1.0, originalmente entrenado para clasificación de imágenes sobre el dataset ImageNet. SqueezeNet es una arquitectura convolucional ligera diseñada para lograr una precisión competitiva con un número de parámetros reducido (alrededor de 1,2 millones), lo que la hace idónea para entornos con recursos limitados. Esta versión en particular está exportada con ONNX opset 12 en precisión FP32, lo que facilita su despliegue con ONNX Runtime y otros motores de inferencia compatibles.

El modelo pertenece al ONNX Model Zoo, un repositorio curado de modelos preentrenados en formato ONNX mantenido por la comunidad. Su relevancia actual radica en que ofrece una alternativa ligera y portable para tareas de clasificación de imágenes en producción, especialmente en dispositivos periféricos o sistemas con restricciones de memoria y cómputo. Aunque no se trata de un modelo nuevo, su formato ONNX estandarizado permite una integración sencilla en pipelines de visión por computador existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SqueezeNet 1.0 (bloques fire) |
| Parametros totales | ~1.2 millones (estimado según el modelo original) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de clasificación de imágenes) |
| Tipos de cuantizacion | FP32 (este modelo); existe una versión INT8 en el repositorio |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 12) |

## Arquitectura y entrenamiento

SqueezeNet 1.0 es una red neuronal convolucional que emplea los denominados bloques *fire*, compuestos por una capa de reducción de canales (squeeze) seguida de capas de expansión (expand) con convoluciones 1x1 y 3x3. Esta estrategia reduce drásticamente el número de parámetros en comparación con arquitecturas como AlexNet o VGG, manteniendo una precisión razonable. El modelo fue entrenado originalmente en el conjunto de datos ImageNet con 1000 clases, aunque en esta conversión a ONNX no se proporcionan detalles específicos sobre el proceso de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO (que no aplican a modelos de visión).

La conversión a ONNX se realizó con opset 12, lo que garantiza compatibilidad con versiones recientes de ONNX Runtime y otros motores de ejecución. No se incluye información sobre la metodología de conversión o si se aplicó alguna técnica de optimización adicional, como poda o cuantización (la versión INT8 está disponible por separado).

## Capacidades

- Clasificación de imágenes: predice una de las 1000 clases de ImageNet, incluyendo objetos, animales, vehículos y escenas.
- Extracción de características: las activaciones de las capas intermedias pueden utilizarse como representaciones vectoriales para tareas de transferencia de aprendizaje o búsqueda de similitud.
- Eficiencia computacional: al ser un modelo ligero, es adecuado para inferencia en tiempo real en CPUs y dispositivos con recursos limitados.
- Compatibilidad ONNX: se puede ejecutar con ONNX Runtime, así como con herramientas de conversión adicionales (por ejemplo, para TensorRT o OpenVINO) mediante el ecosistema ONNX.
- No incluye capacidades de tool calling, agentes o razonamiento multi-paso, ya que es exclusivamente un modelo de clasificación de imágenes.
- No es multilingüe en el sentido de procesamiento de lenguaje natural, aunque las etiquetas de clase son en inglés.

## Casos de uso

- **Clasificación de imágenes en dispositivos móviles**: su bajo peso y tamaño reducido permiten ejecutarlo en smartphones o placas embebidas (Raspberry Pi, Jetson Nano) para identificar objetos en tiempo real, por ejemplo, en aplicaciones de inventario o asistencia visual.
- **Sistema de moderación de contenido**: puede usarse para filtrar imágenes no deseadas (violencia, contenido inapropiado) en plataformas de contenido generado por usuarios, al clasificar automáticamente las imágenes en categorías relevantes.
- **Preprocesamiento en pipelines de visión**: como extractor de características para alimentar modelos posteriores, como detectores de objetos o sistemas de búsqueda de imágenes similares (similarity search).
- **Aplicaciones agrícolas**: clasificar plantas, frutas o plagas en imágenes capturadas por drones o sensores, siempre que las clases de ImageNet cubran los objetos de interés.
- **Automatización industrial**: identificación de productos en líneas de ensamblaje mediante cámaras, con una clasificación de tipo de objeto (por ejemplo, botellas, latas, cajas) a partir de imágenes en tiempo real.
- **Educación e investigación**: sirve como modelo base para enseñar conceptos de clasificación de imágenes, transferencia de aprendizaje y despliegue con ONNX Runtime, gracias a su tamaño reducido y facilidad de configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo específico. El rendimiento del SqueezeNet 1.0 original en ImageNet reporta una precisión top-1 de aproximadamente el 57.5% y top-5 del 80.3%, pero estos datos no se indican en la ficha del repositorio y no se pueden verificar para esta conversión concreta. No se proporcionan cifras de latencia ni throughput en la documentación.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo FP32 con ~1.2 millones de parámetros, el tamaño del archivo ONNX es de alrededor de 5 MB. La memoria necesaria para inferencia es inferior a 200 MB en memoria RAM/VRAM, incluso con batch sizes moderados.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de memoria es suficiente; por ejemplo, NVIDIA GTX 1050, Jetson Nano, o incluso CPUs modernas con soporte de AVX.
- **Compatibilidad con consumer GPU**: sí, se ejecuta sin problemas en GPUs de consumo como la RTX 2060 o superiores, aunque no se requiere tanta potencia.
- **Opciones de despliegue**: se puede servir con ONNX Runtime, en modos de ejecución tanto en CPU como en GPU. También es compatible con motores como TensorRT (tras conversión), OpenVINO, y en entornos de inferencia como Triton Inference Server mediante el backend de ONNX.
- **Latencia y throughput estimados**: en una CPU moderna (por ejemplo, Intel Core i7), la inferencia de una sola imagen con resolución 224x224 suele tomar entre 5 y 15 ms, y en una GPU dedicada puede reducirse a 1-3 ms. Estos valores son orientativos y no se han medido en este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (ImageNet top-1) | Licencia | Formato |
|---|---|---|---|---|---|
| SqueezeNet 1.0 (este modelo) | ~1.2 M | imagen (224x224) | ~57.5% (original) | Apache-2.0 | ONNX |
| SqueezeNet 1.1 | ~1.2 M | imagen (224x224) | ~57.5% (similar) | Apache-2.0 | ONNX |
| MobileNet v2 | ~3.4 M | imagen (224x224) | ~72% | Apache-2.0 | ONNX / otros |
| ResNet-18 | ~11.7 M | imagen (224x224) | ~69.8% | Apache-2.0 | ONNX / otros |

La comparativa se basa en modelos de clasificación de imágenes del mismo tamaño y propósito. SqueezeNet ofrece la ventaja de ser mucho más ligero que MobileNet o ResNet, aunque con menor precisión. En este repositorio no se proporcionan datos de rendimiento para esta conversión concreta, por lo que las cifras de precisión corresponden a los modelos originales y no a esta versión ONNX.

## Limitaciones y advertencias

- **Sesgos del dataset**: al haber sido entrenado en ImageNet, el modelo hereda los sesgos de ese dataset, que puede presentar sobrerrepresentación de ciertas categorías y culturas occidentales. Las clasificaciones pueden ser inexactas o inapropiadas para imágenes de otros dominios.
- **Riesgo de alucinación**: en modelos de clasificación, no existe alucinación textual, pero sí puede producir etiquetas incorrectas con confianza alta en imágenes fuera de la distribución de entrenamiento.
- **Limitaciones de contexto**: el modelo solo procesa imágenes de tamaño fijo (224x224) y no maneja secuencias temporales ni contexto largo; no es aplicable a vídeo o imágenes de alta resolución sin preprocesado.
- **Restricciones de licencia**: aunque la licencia Apache-2.0 permite uso comercial, es recomendable revisar la licencia del dataset ImageNet original, que puede tener restricciones adicionales para uso comercial.
- **Caveats de producción**: la precisión es moderada comparada con arquitecturas más modernas; no es adecuado para tareas que requieran una precisión muy alta o clasificación de clases finas. Además, al ser un modelo fijo, no es posible adaptar su comportamiento sin reentrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ketiswp/onnx-model-zoo-SqueezeNet1.0-ImageNet-opset12-fp32-onnx)
- [Versión INT8 del mismo modelo](https://huggingface.co/ketiswp/onnx-model-zoo-SqueezeNet1.0-ImageNet-opset12-int8-onnx)
- [Modelo original en ONNX Model Zoo](https://github.com/onnx/models/tree/4f43949841cb55a0b98dc8fcd045431ccafd9f96/validated/vision/classification/squeezenet)
- [Repositorio ONNX Model Zoo](https://github.com/onnx/models)
- [Página de modelos ONNX Runtime](https://onnxruntime.ai/models)
