# litert-community/deeplabv3_mobilenet_v3_large

## Resumen

`litert-community/deeplabv3_mobilenet_v3_large` es una conversión a formato LiteRT/TFLite (FP32) del modelo de segmentación semántica `deeplabv3_mobilenet_v3_large` de TorchVision, utilizando los pesos `COCO_WITH_VOC_LABELS_V1`. El modelo original combina un backbone MobileNetV3-Large con una cabeza DeepLabV3, una arquitectura ligera pensada para segmentación de imágenes en entornos con recursos limitados. La conversión la mantiene el espacio de la comunidad `litert-community`, orientado a ofrecer pesos listos para el runtime LiteRT de Google.

El propósito de esta ficha es servir como artefacto de despliegue: un único fichero `.tflite` con una interfaz de tensores fija (entrada `[1, 3, 520, 520]` float32 en NCHW, salida `[1, 21, 520, 520]` de logits float32) que produce máscaras sobre 20 clases de Pascal VOC más fondo. Es relevante para desarrolladores que necesitan segmentación semántica de baja latencia en CPU, dispositivos móviles o edge, sin depender de PyTorch en tiempo de inferencia.

No se trata de un modelo de lenguaje ni de un modelo generativo: no procesa texto, no soporta tool calling ni razonamiento multi-paso. Su valor está en la paridad numérica con la referencia PyTorch y en la simplicidad de su interfaz de tensores fija.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepLabV3 con backbone MobileNetV3-Large (encoder CNN + cabeza de segmentación con pooling espacial piramidal) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 520 × 520 píxeles) |
| Tipos de cuantización | FP32 (única variante publicada en este repo) |
| Idiomas soportados | no aplica (modelo de visión; las etiquetas de clase están en inglés vía `weights.meta["categories"]`) |
| Licencia | no disponible |
| Formato de pesos | TFLite (`.tflite`), conversión LiteRT |
| Entrada | RGB float32, NCHW `[1, 3, 520, 520]` |
| Salida | logits float32 `[1, 21, 520, 520]` |
| Clases | 20 categorías Pascal VOC + fondo |
| Tamaño del repo | 0.0 GB (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es la de DeepLabV3 con backbone MobileNetV3-Large tal como se distribuye en TorchVision. DeepLabV3 emplea un backbone convolucional para extraer features multiescala y una cabeza con *atrous spatial pyramid pooling* (ASPP) que combina convoluciones dilatadas a distintas tasas para capturar contexto a varias escalas, seguida de un módulo de upsampling para recuperar la resolución de salida. MobileNetV3-Large aporta bloques con *squeeze-and-excitation* y activaciones h-swish, diseñados para minimizar coste computacional.

Los pesos corresponden al checkpoint `COCO_WITH_VOC_LABELS_V1` de TorchVision: el modelo se entrenó sobre COCO con las etiquetas remapeadas a las 20 clases de Pascal VOC más fondo. No se dispone en la información proporcionada de detalles sobre número de tokens/imágenes de entrenamiento, composición exacta del dataset, ni si hubo ajuste fino adicional. La conversión a LiteRT no modifica los pesos: es una exportación FP32 con la interfaz de tensores fijada a 520 × 520. La validación documentada consiste en comparaciones numéricas contra PyTorch sobre dos entradas aleatorias con semilla y una fotografía, con `allclose(atol=1e-4, rtol=1e-3)` y una diferencia absoluta máxima de logits de `0.0001001358`; son pruebas de paridad numérica, no mediciones de precisión sobre dataset.

## Capacidades

- Segmentación semántica densa por píxel sobre 20 clases de Pascal VOC más fondo.
- Salida de logits por clase (no probabilidades ni máscara argmax): permite aplicar softmax, umbrales o postprocesado propio.
- Inferencia en CPU mediante el intérprete LiteRT, con soporte de XNNPACK.
- Interfaz de tensores fija, adecuada para pipelines embebidos y móviles.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto.
- No incluye modo thinking, visión generativa, audio ni vídeo.
- No incluye salidas auxiliares (la model card indica que se omiten).

## Casos de uso

- Segmentación en dispositivos móviles y edge: el modelo se ejecuta con el intérprete LiteRT en CPU y produce una máscara de 520 × 520, lo que permite integrarlo en apps Android/iOS o en hardware embebido sin runtime de PyTorch.
- Preprocesado para pipelines de visión: generar máscaras semánticas que alimenten etapas posteriores (recorte de regiones, conteo de objetos por clase, análisis de escenas) en sistemas de bajo consumo.
- Automatización de anotación de datos: usar las máscaras como propuesta inicial para etiquetado asistido de imágenes con clases VOC, revisando y corrigiendo manualmente.
- Análisis de imágenes aéreas o de interiores con clases VOC: separar cielo, edificio, vegetación, suelo, personas o vehículos en flujos de monitorización con recursos acotados.
- Filtrado y enmascarado en tiempo casi real en cámaras: aplicar la máscara para difuminar fondos o aislar regiones en aplicaciones de videoconferencia o captura, dado el coste reducido del backbone MobileNetV3.
- Prototipado rápido de productos de segmentación: al ser un artefacto único `.tflite` con entrada/salida documentadas, permite validar la viabilidad de una función de segmentación antes de invertir en modelos mayores.
- Comparación y regresión numérica: servir como referencia de paridad para validar otras exportaciones o conversiones del mismo modelo contra PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta pruebas de paridad numérica contra PyTorch (dos entradas aleatorias con semilla y una fotografía, en CPU LiteRT y XNNPACK), con `allclose(atol=1e-4, rtol=1e-3)` superado en las seis comparaciones y una diferencia absoluta máxima de logits de `0.0001001358`. No se aportan métricas de mIoU, precisión por clase ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo pequeño con backbone MobileNetV3-Large y entrada fija de 520 × 520, el consumo de memoria es moderado, pero no se proporcionan cifras.
- GPU recomendadas: no disponible; la model card indica que la ejecución en GPU y NPU no ha sido validada para esta exportación.
- Compatibilidad con GPU de consumo: no confirmada. La validación se realizó únicamente en CPU (LiteRT builtin y XNNPACK).
- Opciones de despliegue: intérprete LiteRT (`ai_edge_litert.interpreter.Interpreter`) con `num_threads` configurable; el ejemplo de la model card usa `num_threads=4`.
- Latencia y throughput: no disponibles.
- Dependencias del ejemplo: `ai-edge-litert`, `huggingface-hub`, `torch`, `torchvision`, `numpy` y `pillow`. Las versiones usadas en la validación fueron PyTorch `2.14.1+cu130`, TorchVision `0.29.1+cu130` y `ai-edge-litert` `2.3.0`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| litert-community/deeplabv3_mobilenet_v3_large | DeepLabV3 + MobileNetV3-Large | 520 × 520 fija | 21 (VOC + fondo) | TFLite (LiteRT) | no disponible | Exportación FP32 validada numéricamente contra PyTorch en CPU |
| torchvision deeplabv3_mobilenet_v3_large | DeepLabV3 + MobileNetV3-Large | variable | 21 (VOC + fondo) | PyTorch | no disponible en esta ficha | Modelo de referencia del que deriva la exportación |
| torchvision deeplabv3_resnet50 | DeepLabV3 + ResNet-50 | variable | 21 (VOC + fondo) | PyTorch | no disponible en esta ficha | Backbone más pesado; mayor coste computacional |
| torchvision fcn_resnet50 | FCN + ResNet-50 | variable | 21 (VOC + fondo) | PyTorch | no disponible en esta ficha | Familia FCN, sin ASPP |

No se dispone de datos de rendimiento (mIoU, latencia) en la información proporcionada para establecer una comparación cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- Modelo de visión: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento o generación.
- Resolución de entrada fija de 520 × 520: imágenes de otra relación de aspecto deben redimensionarse con interpolación bilineal antes de la inferencia, lo que puede distorsionar objetos.
- La máscara de salida está en el sistema de coordenadas 520 × 520; para mapearla a la imagen original hay que redimensionar los IDs de clase con interpolación de vecino más cercano, no bilineal.
- Solo 21 clases (20 VOC + fondo): no cubre categorías fuera de ese vocabulario; las clases no representadas se asignarán a la clase más próxima o a fondo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de segmentación incorrecta en dominios alejados de COCO/VOC (imágenes médicas, satelitales de alta resolución, escenas muy específicas).
- Sesgos: no documentados en la información disponible; al derivar de COCO/VOC, puede heredar los sesgos de composición y etiquetado de esos datasets.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene verificar la licencia del checkpoint original de TorchVision antes de desplegar en producción.
- GPU y NPU no validadas para esta exportación: el soporte está confirmado solo en CPU (LiteRT builtin y XNNPACK).
- La validación es de paridad numérica contra PyTorch, no de precisión sobre dataset; no hay métricas de mIoU publicadas.
- Salidas auxiliares omitidas: si un pipeline esperaba las salidas auxiliares del modelo TorchVision, no están disponibles en este `.tflite`.
- El tamaño del repo figura como 0.0 GB en los metadatos, lo que puede indicar que el fichero no está materializado o que los metadatos están incompletos; conviene verificar la descarga antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/deeplabv3_mobilenet_v3_large
- Modelo de referencia TorchVision: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.segmentation.deeplabv3_mobilenet_v3_large.html
- Fichero del modelo: https://huggingface.co/litert-community/deeplabv3_mobilenet_v3_large/blob/main/deeplabv3_mobilenet_v3_large.tflite
- Runtime LiteRT (`ai-edge-litert`): no disponible en la información proporcionada
