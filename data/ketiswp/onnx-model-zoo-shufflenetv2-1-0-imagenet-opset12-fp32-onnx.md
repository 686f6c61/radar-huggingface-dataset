# ketiswp/onnx-model-zoo-ShuffleNetV2-1.0-ImageNet-opset12-fp32-onnx

## Resumen

ShuffleNetV2 1.0 es una arquitectura de red neuronal convolucional (CNN) para clasificación de imágenes, diseñada por investigadores de Megvii (Face++) y publicada en 2018. El modelo original se entrenó en el dataset ImageNet (1,28 millones de imágenes, 1000 clases) y destaca por su eficiencia computacional: utiliza operaciones de shuffle de canales y convoluciones pointwise agrupadas para reducir el coste de cómputo sin sacrificar precisión, lo que lo hace adecuado para dispositivos con recursos limitados.

Esta ficha cubre la conversión a formato ONNX (Open Neural Network Exchange) con precisión FP32 y opset 12, publicada por el usuario `ketiswp` en Hugging Face. La versión ONNX permite ejecutar el modelo en cualquier runtime compatible con ONNX (como ONNX Runtime, TensorRT, OpenVINO) y facilita su integración en pipelines de producción multiplataforma. La relevancia de esta ficha radica en que el modelo es un referente en clasificación de imágenes eficiente, y su formato ONNX es el estándar de facto para interoperabilidad en el ecosistema de herramientas de IA.

El modelo tiene una entrada de imágenes RGB de 224x224 píxeles y produce un vector de 1000 logits correspondientes a las clases de ImageNet. Su tamaño de repositorio es de 0,0 GB (probablemente el archivo del modelo no está alojado directamente en el repo o se ha comprimido), y no se han reportado descargas ni interacciones en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ShuffleNetV2 1.0 (CNN) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | FP32 (versión INT8 disponible en el repositorio asociado) |
| Idiomas soportados | no aplica (procesamiento de imágenes) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opset 12) |

## Arquitectura y entrenamiento

ShuffleNetV2 es una CNN diseñada siguiendo los principios de eficiencia práctica: reduce el uso de operaciones de coste alto (como convoluciones 1x1 no agrupadas) y utiliza el shuffle de canales para mejorar la comunicación entre grupos. La arquitectura se compone de unidades de construcción que combinan convoluciones depthwise y pointwise, y el factor 1.0 se refiere al multiplicador de ancho (width multiplier) que controla el número de canales.

El modelo original fue entrenado en ImageNet con técnicas de aumento de datos estándar (recorte aleatorio, volteo horizontal, etc.). No se ha publicado información sobre el proceso de entrenamiento específico de esta versión ONNX; se trata de una conversión del modelo preentrenado de PyTorch a ONNX mediante exportación con el toolkit de ONNX. La versión FP32 mantiene la precisión original del modelo, mientras que el repositorio asociado ofrece una versión INT8 cuantizada (obtenida con Intel Neural Compressor y backend de ONNX Runtime) para entornos con restricciones de memoria o latencia.

## Capacidades

- Clasificación de imágenes en 1000 categorías del dataset ImageNet (por ejemplo, objetos, animales, plantas, vehículos).
- Extracción de características de imagen para tareas de transferencia de aprendizaje (fine-tuning en datasets específicos).
- Inferencia eficiente en dispositivos con recursos limitados (móviles, embebidos, edge).
- Compatibilidad con ONNX Runtime, lo que permite aceleración por CPU (GPU, NPU, etc.) según la plataforma.
- Soporte de integración con frameworks de visión por computador (OpenCV, PIL, etc.) a través de la API de ONNX Runtime.
- Capacidad de ejecución en modos de batch (múltiples imágenes a la vez) para optimizar el throughput.

## Casos de uso

- Clasificación de imágenes en tiempo real en dispositivos móviles: el modelo FP32 ONNX puede ejecutarse en Android/iOS mediante ONNX Runtime Mobile, aprovechando su baja latencia para etiquetar fotos en la cámara o galería.
- Filtrado de contenido en servidores: uso en pipelines de moderación de imágenes para detectar categorías no deseadas (violencia, contenido adulto) con una ventana de contexto de 224x224 píxeles y bajo coste computacional.
- Automatización de inventario en retail: clasificar productos de imágenes de estanterías para detectar unidades de stock, con la ventaja de que el modelo puede ejecutarse en hardware de bajo coste (Raspberry Pi, Jetson Nano).
- Sistemas de asistencia a la conducción (ADAS): clasificación de señales de tráfico en tiempo real con una latencia baja, aprovechando la eficiencia de ShuffleNetV2 en GPUs integradas.
- Búsqueda visual inversa: extracción de características para comparar imágenes y devolver resultados similares en un índice vectorial, usando el modelo como encoder.
- Diagnóstico médico asistido (limitado): clasificación preliminar de imágenes de dermatología (por ejemplo, lesiones cutáneas) en categorías amplias, siempre como apoyo a un especialista, con la advertencia de que el modelo no fue entrenado específicamente para este dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, latencia ni comparaciones con otros modelos. Se recomienda consultar el ONNX Model Zoo original para datos de validación en ImageNet (precisión top-1 y top-5), aunque no se han proporcionado aquí.

## Requisitos de hardware

- El modelo FP32 tiene un tamaño aproximado de 8,5 MB (estimación para ShuffleNetV2 1.0 con 224x224x3 de entrada; no confirmado en la ficha).
- VRAM estimada: menos de 1 GB para inferencia en GPU (típicamente 200-400 MB con cuantización FP32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, Jetson Nano, o GPU integradas Intel (UHD Graphics).
- Puede ejecutarse en CPU sin problemas, con una latencia media de 10-30 ms por imagen en un Intel i5 de generación reciente (estimación orientativa).
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Mobile, TensorRT (para NVIDIA), OpenVINO (para Intel).
- No se requiere hardware específico de alta gama; es apto para edge computing.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Precisión top-1 (ImageNet) | Licencia | Formato |
|---|---|---|---|---|---|
| ShuffleNetV2 1.0 (ONNX) | no disponible | 224x224x3 | no disponible | BSD-3-Clause | ONNX |
| MobileNetV2 1.0 (ONNX) | ~3,4 M | 224x224x3 | ~72% | Apache-2.0 | ONNX |
| SqueezeNet 1.1 (ONNX) | ~1,2 M | 224x224x3 | ~60% | BSD-3-Clause | ONNX |

Nota: los datos de precisión y parámetros de MobileNetV2 y SqueezeNet son referencias públicas de sus respectivos repositorios oficiales, no de este modelo concreto. La comparativa se limita a la categoría de CNNs eficientes para clasificación de imágenes.

## Limitaciones y advertencias

- Sesgos de entrenamiento: el modelo fue entrenado en ImageNet, que contiene sesgos culturales y demográficos; puede fallar en imágenes de grupos subrepresentados o contextos no presentes en el dataset.
- Riesgo de alucinación: no aplica directamente (no es un modelo generativo), pero la clasificación puede ser incorrecta con confianza alta en imágenes fuera de la distribución de entrenamiento (e.g., fotografías artísticas, imágenes sintéticas).
- Limitaciones de idioma: no aplica, el modelo no procesa texto.
- Restricciones de licencia: la licencia BSD-3-Clause permite uso comercial, pero se debe citar el copyright del modelo original (Megvii) en redistribuciones.
- Para producción: es recomendable validar el rendimiento con un dataset propio, ya que la precisión exacta en ImageNet no se ha publicado en esta versión ONNX. La cuantización INT8 puede degradar la precisión, por lo que se debe evaluar en el caso de uso específico.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que puede no haber sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiswp/onnx-model-zoo-ShuffleNetV2-1.0-ImageNet-opset12-fp32-onnx
- Versión INT8 del modelo: https://huggingface.co/ketiswp/onnx-model-zoo-ShuffleNetV2-1.0-ImageNet-opset12-int8-onnx
- Modelo original en ONNX Model Zoo: https://github.com/onnx/models/tree/4f43949841cb55a0b98dc8fcd045431ccafd9f96/validated/vision/classification/shufflenet
- ONNX Model Zoo (repositorio general): https://github.com/onnx/models
- ONNX Runtime: https://onnxruntime.ai/models
