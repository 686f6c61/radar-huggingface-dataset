# litert-community/fcn_resnet101

## Resumen

`fcn_resnet101` es una conversión a LiteRT/TFLite del modelo de segmentación semántica `fcn_resnet101` de TorchVision, preentrenado con los pesos `FCN_ResNet101_Weights.COCO_WITH_VOC_LABELS_V1`. Lo publica la comunidad `litert-community`, un espacio orientado a distribuir pesos de modelos populares en formato LiteRT (el runtime de Google derivado de TensorFlow Lite) para su despliegue en dispositivos móviles, embebidos y aceleradores de borde.

El modelo resuelve segmentación semántica densa sobre 21 clases: las 20 categorías de Pascal VOC más una clase de fondo. Internamente es una FCN (Fully Convolutional Network) con backbone ResNet-101, la arquitectura clásica de Long et al. adaptada por TorchVision. La exportación fija una entrada RGB float32 en formato NCHW de `[1, 3, 520, 520]` y devuelve logits float32 de `[1, 21, 520, 520]`.

Su relevancia es práctica más que de investigación: permite ejecutar un segmentador semántico consolidado en entornos donde no hay PyTorch ni GPU, usando el intérprete LiteRT con delegados CPU y XNNPACK. El repositorio ocupa 0,2 GB y no incluye cuantización, solo FP32. No hay información publicada sobre licencia, idiomas ni benchmarks de precisión en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FCN con backbone ResNet-101 (Fully Convolutional Network) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 520×520) |
| Tipos de cuantización | solo FP32 en esta exportación |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | TFLite / LiteRT (`fcn_resnet101.tflite`) |
| Entrada | RGB float32, NCHW `[1, 3, 520, 520]` |
| Salida | logits float32 `[1, 21, 520, 520]` |
| Clases | 20 de Pascal VOC + fondo |
| Tamaño del repositorio | 0,2 GB |
| Runtime | `ai-edge-litert` (validado con 2.3.0) |

## Arquitectura y entrenamiento

La arquitectura es la FCN de TorchVision: un backbone ResNet-101 preentrenado en ImageNet, seguido de una cabeza de segmentación con convoluciones y capas de upsampling que producen logits a resolución de entrada. El modelo original incluye una salida auxiliar para supervisión intermedia; la exportación LiteRT la omite y expone únicamente el tensor `out` principal.

Los pesos provienen del checkpoint oficial `FCN_ResNet101_Weights.COCO_WITH_VOC_LABELS_V1`, entrenado sobre COCO con las etiquetas remapeadas a las categorías de Pascal VOC. No hay información en la model card sobre número de tokens, composición exacta del dataset, ni sobre fases de RLHF o DPO (no aplicables a un modelo de segmentación). La innovación técnica de esta publicación es la conversión en sí: exportación a LiteRT con paridad numérica verificada frente a PyTorch, con una diferencia máxima absoluta de logits de `2.3841858e-05` en las pruebas realizadas.

## Capacidades

- Segmentación semántica densa de imágenes RGB en 21 clases (20 de Pascal VOC más fondo).
- Salida de logits por píxel, lo que permite aplicar `argmax` para obtener el mapa de clases o usar los logits directamente para umbrales y postprocesado.
- Ejecución en CPU con el intérprete LiteRT y el delegado XNNPACK.
- Entrada de tamaño fijo 520×520; el preprocesado del checkpoint incluye redimensionado y normalización, y la model card indica aplicar interpolación bilinear para ajustar a 520×520 cuando sea necesario.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente visual.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Segmentación en dispositivos móviles y embebidos: al estar exportado a LiteRT, se puede ejecutar en Android, Linux embebido o microcontroladores con suficiente memoria usando el intérprete `ai-edge-litert` con XNNPACK, sin dependencia de PyTorch ni CUDA.
- Preprocesado para pipelines de visión: generar máscaras semánticas de 21 clases como entrada para modelos posteriores de detección, seguimiento o análisis de escenas en sistemas con recursos limitados.
- Prototipado rápido de segmentación: la API de ejemplo de la model card permite cargar el `.tflite`, preprocesar con `FCN_ResNet101_Weights.transforms()` y obtener máscaras en pocas líneas, útil para validar ideas antes de invertir en modelos más grandes.
- Automatización de etiquetado asistido: usar las máscaras como propuesta inicial en flujos de anotación de imágenes, revisando y corrigiendo manualmente las regiones dudosas.
- Aplicaciones de robótica y navegación de bajo consumo: segmentar escenas (personas, vehículos, mobiliario, fondo) en tiempo de ejecución sobre CPU para tareas de evitación de obstáculos o comprensión de entorno.
- Análisis de imágenes en entornos sin GPU: al ser un modelo FP32 de 0,2 GB, cabe en dispositivos con memoria moderada y no requiere acelerador dedicado, lo que facilita despliegues en servidores de borde o portátiles.
- Comparación y verificación de exportaciones: sirve como referencia para validar que una conversión LiteRT de un modelo TorchVision mantiene la paridad numérica con el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta validación de paridad numérica frente a PyTorch: seis comparaciones (dos entradas aleatorias con semilla y una fotografía) sobre CPU y XNNPACK, todas con `allclose(atol=1e-4, rtol=1e-3)` y diferencia máxima absoluta de `2.3841858e-05`. Estas pruebas no son medidas de precisión sobre un dataset.

## Requisitos de hardware

- Inferencia en FP32; no hay versiones cuantizadas publicadas en el repositorio.
- VRAM estimada: no disponible de forma explícita. El repositorio pesa 0,2 GB, lo que da una referencia del orden de magnitud de los pesos; el consumo en ejecución depende del runtime y del delegado.
- GPU: no se ha validado la ejecución en GPU ni en NPU para esta exportación, según la model card.
- CPU: validado con el intérprete LiteRT en CPU y con el delegado XNNPACK, usando 4 hilos en el ejemplo.
- Cabe en hardware de borde y en CPU de consumo; no se especifican modelos concretos de GPU.
- Opciones de despliegue: `ai-edge-litert` (intérprete de LiteRT/TFLite). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `litert-community/fcn_resnet101` | FCN + ResNet-101 | 520×520 fijo | 21 (VOC + fondo) | TFLite/LiteRT FP32 | no disponible | HuggingFace |
| TorchVision `fcn_resnet101` (original) | FCN + ResNet-101 | variable | 21 (VOC + fondo) | PyTorch | no disponible en la información | PyTorch Hub / TorchVision |
| `deeplabv3_resnet101` (TorchVision) | DeepLabV3 + ResNet-101 | variable | 21 (VOC + fondo) | PyTorch | no disponible en la información | TorchVision |

La comparación directa más relevante es con el modelo TorchVision original, del que esta exportación deriva y con el que se validó la paridad numérica. Frente a DeepLabV3, la FCN es una arquitectura anterior y habitualmente con menor precisión en segmentación semántica, aunque la información disponible no incluye métricas que permitan cuantificar la diferencia.

## Limitaciones y advertencias

- Solo segmenta las 21 clases de Pascal VOC más fondo; cualquier objeto fuera de ese vocabulario se asignará a una de esas clases o al fondo.
- Entrada de tamaño fijo 520×520: las imágenes de otra resolución deben redimensionarse, y las máscaras resultantes hay que reescalarlas con interpolación nearest-neighbor para mapearlas a la imagen original.
- No se ha validado la ejecución en GPU ni en NPU para esta exportación; solo CPU y XNNPACK.
- No hay cuantización publicada, por lo que el despliegue en hardware muy limitado puede requerir conversión adicional.
- La licencia no está indicada en la model card; conviene verificar los términos del modelo TorchVision original antes de un uso comercial.
- No hay información sobre sesgos del modelo ni sobre el rendimiento en dominios distintos de COCO/VOC.
- Las validaciones reportadas son de paridad numérica, no de precisión sobre datasets; no deben interpretarse como garantía de calidad de segmentación.
- Riesgo de alucinación no aplica en el sentido de los modelos de lenguaje, pero sí puede producir máscaras erróneas en escenas fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/fcn_resnet101
- Modelo original TorchVision: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.segmentation.fcn_resnet101.html
- Runtime LiteRT (`ai-edge-litert`): no se proporciona enlace en la información disponible.
- Paper de referencia de FCN (Long et al.): no se proporciona enlace en la información disponible.
- Repositorio o demo adicional: no disponible.
