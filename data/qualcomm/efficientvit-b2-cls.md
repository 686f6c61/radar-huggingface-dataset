# qualcomm/EfficientViT-b2-cls

## Resumen

EfficientViT-b2-cls es un modelo de clasificación de imágenes desarrollado por Qualcomm, basado en la arquitectura EfficientViT propuesta en el artículo "EfficientViT: Multi-Scale Linear Attention for High-Resolution Dense Prediction" (arXiv:2205.14756). Está diseñado para ofrecer un equilibrio óptimo entre precisión y eficiencia computacional, lo que lo hace adecuado para su despliegue en dispositivos móviles y sistemas embebidos con aceleración de hardware. El modelo clasifica imágenes del dataset ImageNet y también puede utilizarse como backbone para tareas de visión más complejas, como detección de objetos o segmentación semántica.

La versión publicada por Qualcomm en Hugging Face incluye pesos pre-exportados en formatos ONNX, QNN_DLC y TFLite, optimizados para ejecutarse en la NPU de los chipsets Snapdragon y Dragonwing. Con 24,3 millones de parámetros y un tamaño de 92,9 MB en precisión float, el modelo alcanza latencias de inferencia de entre 2,4 y 6,4 ms en dispositivos móviles de gama alta, lo que lo convierte en una opción viable para aplicaciones de visión en tiempo real. Su licencia BSD-3-Clause permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión con atención lineal multi-escala (EfficientViT) |
| Parametros totales | 24,3 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224) |
| Tipos de cuantizacion | float (FP32) y w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | no aplica (procesa imágenes, no texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch, ONNX, QNN_DLC, TFLite (pre-exportados) |

## Arquitectura y entrenamiento

EfficientViT-b2-cls se basa en la arquitectura EfficientViT, que introduce un mecanismo de atención lineal multi-escala para reducir la complejidad computacional de los transformers de visión. En lugar de la atención softmax estándar, utiliza una aproximación lineal que permite procesar imágenes de alta resolución con un coste computacional significativamente menor. El modelo está entrenado en el dataset ImageNet para la tarea de clasificación de 1000 clases, y su checkpoint oficial corresponde a ese entrenamiento. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de visión supervisado de forma clásica.

La implementación original proviene del repositorio [CVHub520/efficientvit](https://github.com/CVHub520/efficientvit), y Qualcomm ha adaptado los pesos para su ejecución eficiente en hardware propio. El modelo acepta entradas de 224x224 píxeles y produce una distribución de probabilidad sobre las 1000 clases de ImageNet. Además, al ser un backbone, puede extraer características intermedias que sirven como entrada para otras arquitecturas de visión.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (objetos, animales, escenas, etc.).
- Extracción de características visuales como backbone para tareas de visión por computadora (detección, segmentación, etc.).
- Inferencia en tiempo real en dispositivos móviles gracias a su diseño eficiente y soporte para NPU de Qualcomm.
- Compatibilidad con múltiples formatos de exportación (ONNX, TFLite, QNN_DLC) que facilitan la integración en aplicaciones Android y sistemas embebidos.
- Cuantización w8a16 que reduce el uso de memoria y mejora la latencia sin pérdida significativa de precisión (no se especifica el impacto exacto).
- No soporta generación de texto, tool calling ni capacidades multimodales más allá de la visión.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo puede integrarse en apps Android para identificar objetos o escenas en tiempo real, aprovechando la NPU de los Snapdragon para lograr latencias de 2-3 ms, como se muestra en la tabla de rendimiento.
- Backbone para detección de objetos: al extraer características de alta calidad, puede usarse como base para modelos como Faster R-CNN o YOLO, permitiendo detección en dispositivos edge con recursos limitados.
- Segmentación semántica en sistemas embebidos: su atención lineal multi-escala facilita el procesamiento de imágenes de alta resolución, útil para aplicaciones de conducción autónoma o robótica.
- Moderación de contenido visual: clasificar imágenes en categorías predefinidas (violencia, contenido explícito, etc.) en servidores o dispositivos locales, con licencia permisiva para uso comercial.
- Análisis de imágenes médicas: como herramienta de apoyo para clasificar radiografías o imágenes de dermatología, siempre que se ajuste con datos específicos del dominio.
- Visión industrial en líneas de producción: inspección de calidad de productos mediante clasificación de defectos, desplegado en hardware Qualcomm Dragonwing para entornos industriales.

## Benchmarks y rendimiento

No se han publicado resultados de precisión (top-1, top-5) en la información disponible. La model card solo incluye métricas de latencia y uso de memoria en distintos chipsets de Qualcomm, que se resumen a continuación:

| Runtime | Precision | Chipset | Inferencia (ms) | Pico de memoria (MB) |
|---|---|---|---|---|
| ONNX | float | Snapdragon X2 Elite | 2,529 | 2 |
| ONNX | float | Snapdragon X Elite | 5,071 | 50 |
| ONNX | float | Snapdragon 8 Gen 3 | 3,223 | 0-144 |
| ONNX | float | Snapdragon 8 Gen 1 | 6,353 | 1-145 |
| ONNX | float | Snapdragon 8 Elite | 2,7 | 0-71 |
| ONNX | float | Snapdragon 8 Elite Gen 5 | 2,442 | 1-72 |
| ONNX | w8a16 | Snapdragon X2 Elite | 2,342 | 1 |
| ONNX | w8a16 | Snapdragon X Elite | 4,847 | 27 |
| ONNX | w8a16 | Snapdragon 8 Gen 3 | 3,094 | 0-157 |
| ONNX | w8a16 | Snapdragon 8 Gen 1 | 5,8 | 0-169 |
| ONNX | w8a16 | Qualcomm Dragonwing QCS6490 | 15,089 | 0-3 |
| ONNX | w8a16 | Qualcomm Dragonwing IQ-8275 | 4,213 | 0-4 |
| ONNX | w8a16 | Qualcomm Dragonwing QCS8550 | 4,6 | 0-213 |
| ONNX | w8a16 | Qualcomm QCS8450 | 5,8 | 0-169 |
| ONNX | w8a16 | Qualcomm Dragonwing IQ-9075 | 4,941 | 0-3 |
| ONNX | w8a16 | Qualcomm Dragonwing IQ-X7181 | 4,847 | 27 |
| ONNX | w8a16 | Qualcomm Dragonwing Q-6690 | 19,551 | 0-255 |

Estos datos corresponden a la ejecución en la NPU de cada chipset. No se proporcionan métricas de precisión sobre ImageNet ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo en float ocupa 92,9 MB, por lo que cabe en cualquier GPU moderna (incluso integradas) y en memoria de dispositivos móviles. Con cuantización w8a16, el tamaño se reduce aún más (no se especifica el valor exacto).
- GPU recomendadas: no requiere GPU dedicada para inferencia; puede ejecutarse en CPU, aunque el rendimiento óptimo se obtiene en la NPU de chipsets Qualcomm (Snapdragon 8 Gen 3, X Elite, etc.).
- Compatibilidad con GPUs de consumo: sí, cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo sin problemas, aunque no se aprovechará la optimización específica de Qualcomm.
- Opciones de despliegue: ONNX Runtime, TFLite, Qualcomm AI Hub Workbench, y el paquete Python `qai_hub_models` para exportación personalizada.
- Latencia y throughput: en dispositivos Qualcomm, la latencia varía entre 2,3 ms y 19,6 ms según el chipset y la precisión, lo que permite tasas de procesamiento de 50-400 imágenes por segundo en los mejores casos.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, EfficientViT-b2-cls se posiciona como una alternativa eficiente a otros backbones de clasificación como MobileNetV3 o EfficientNet-Lite, con la ventaja de estar pre-optimizado para hardware Qualcomm. No se pueden ofrecer cifras concretas de comparación sin datos adicionales.

## Limitaciones y advertencias

- Modelo de visión únicamente: no procesa texto ni admite tareas multimodales.
- Sesgos del dataset ImageNet: las clases y los patrones aprendidos reflejan los sesgos de ese dataset, lo que puede provocar errores en categorías subrepresentadas o contextos culturales específicos.
- Riesgo de errores de clasificación: como cualquier modelo de visión, puede fallar ante imágenes adversarias, oclusiones o variaciones de iluminación.
- Optimización específica para Qualcomm: aunque los pesos son estándar, el rendimiento óptimo solo se alcanza en hardware Qualcomm con NPU; en otras plataformas la latencia puede ser mayor.
- Sin información sobre precisión exacta: no se publican métricas de top-1/top-5, por lo que es difícil evaluar su calidad frente a alternativas sin pruebas propias.
- Licencia BSD-3-Clause: permite uso comercial, pero se recomienda revisar los términos de la licencia del código base original (CVHub520/efficientvit) para evitar conflictos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/qualcomm/EfficientViT-b2-cls)
- [Página del modelo en Qualcomm AI Hub](https://aihub.qualcomm.com/models/efficientvit_b2_cls)
- [Repositorio de Qualcomm AI Hub Models (GitHub)](https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/efficientvit_b2_cls)
- [Implementación original de EfficientViT (GitHub)](https://github.com/CVHub520/efficientvit)
- [Artículo arXiv:2205.14756](https://arxiv.org/abs/2205.14756)
