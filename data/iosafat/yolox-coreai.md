# iosafat/YOLOX-CoreAI

## Resumen

YOLOX-CoreAI es la conversión a Apple Core AI (formato `.aimodel`) del detector de objetos YOLOX-S, desarrollado originalmente por Megvii (Megvii-BaseDetection/YOLOX). El modelo está publicado en HuggingFace por el usuario `iosafat` y forma parte de un zoológico de modelos on-device para el ecosistema Apple. Resuelve el problema de detección de objetos en tiempo real en dispositivos Mac, iPhone y iPad, ejecutándose como un grafo estático en la GPU de Apple o en el Neural Engine, sin necesidad de servidores externos.

Se trata de un detector denso de una sola etapa (single-stage) y sin anclas (anchor-free), con 8,97 millones de parámetros y una entrada fija de 640x640 píxeles. Es la contraparte densa de RF-DETR-CoreAI: mientras que la familia DETR no necesita supresión de no máximos (NMS), YOLOX sigue el esquema clásico `score = obj · cls` más NMS por clase. Su relevancia radica en ofrecer un detector ligero, con paridad numérica exacta respecto al modelo PyTorch original (cosine similarity 1.000000, IoU 1.000) y una latencia medida de 4,80 ms en GPU M4 Max.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOX-S, single-stage anchor-free object detector |
| Parámetros totales | 8,97 millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | FP32 (según README); el tag de HuggingFace indica "quantized" sin más detalle |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI) |

## Arquitectura y entrenamiento

YOLOX-CoreAI es la exportación de YOLOX-S, un detector de objetos de una sola etapa y sin anclas desarrollado por Megvii. La arquitectura original combina un backbone CSPDarknet con una Feature Pyramid Network (FPN) y una cabeza de detección desacoplada (decoupled head). En esta versión, el modelo se convierte a Apple Core AI como un grafo estático que se ejecuta en la GPU de Apple o en el Neural Engine.

El contrato de entrada es una imagen de 640x640 píxeles en formato BGR (0-255) con letterbox (relleno 114, esquina superior izquierda). La salida es un tensor de `[1, 8400, 85]` con las cajas decodificadas a 640 píxeles y las puntuaciones de objeto y clase sigmoideas. El post-proceso (cálculo de `score = obj · max_class`, umbral y NMS por clase con IoU 0.45) se realiza en el host. Según el README, el modelo utiliza pesos preentrenados en COCO y la licencia es Apache-2.0. No se proporcionan detalles adicionales sobre el dataset, el número de tokens ni el proceso de entrenamiento.

## Capacidades

- Detección de objetos en tiempo real con 80 clases del dataset COCO.
- Ejecución en GPU de Apple (Mac, iPhone) y en el Neural Engine.
- Integración con CoreAIKit y CoreAIOps mediante API Swift, con una sola línea para inferencia.
- Soporte de detección en imágenes estáticas y en flujo de cámara en tiempo real.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto (es un modelo de visión puro).
- No es multimodal; solo procesa imágenes.

## Casos de uso

- Detección de objetos en tiempo real en apps iOS/macOS: el modelo se integra en la ruta de cámara de cero copias mediante CoreAIKit, con una latencia de ~22 ms en iPhone 17 Pro, adecuado para aplicaciones de realidad aumentada o asistencia en tiempo real.
- Vigilancia y análisis de vídeo en dispositivos Apple: al ejecutarse localmente sin servidor, puede procesar vídeo de cámaras IP en un Mac, con una latencia de 4,80 ms en M4 Max, manteniendo la privacidad de los datos.
- Control de calidad industrial en Mac: la detección de defectos en piezas puede ejecutarse en la GPU de Apple, con paridad exacta con el modelo PyTorch (IoU 1.000), lo que facilita la validación de pipelines de visión.
- Aplicaciones de fotografía y etiquetado automático: el modelo puede clasificar y localizar objetos en imágenes capturadas en el dispositivo, generando metadatos sin necesidad de conexión a internet.
- Asistencia en conducción (ADAS) en dispositivos Apple: detección de peatones, vehículos y señales en tiempo real en un Mac o iPhone, con 35-40 FPS en iPhone 17 Pro, suficiente para aplicaciones de asistencia.
- Robótica y automatización con Apple Silicon: el modelo puede usarse como componente de percepción en robots que ejecutan en Mac, gracias a su tamaño reducido (36 MB) y su baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo mAP en la información disponible. Los datos de rendimiento medidos que aparecen en la model card son los siguientes:

| Métrica | Valor |
|---|---|
| Paridad con torch fp32 (cosine similarity) | 1.000000 |
| IoU de detecciones end-to-end (CPU y GPU) | 1.000 |
| Latencia en M4 Max GPU | 4,80 ms (208 FPS) |
| Latencia en M4 Max CPU | 57 ms |
| Latencia en iPhone 17 Pro (GPU, cámara) | ~22 ms (35-40 FPS) |
| Primer load on-device (iPhone 17 Pro) | ~2,6 s |

## Requisitos de hardware

- VRAM: no disponible; el modelo pesa 36 MB, lo que lo hace apto para cualquier dispositivo Apple con Core AI.
- GPU recomendadas: Apple GPU (M4 Max, iPhone 17 Pro) y Neural Engine.
- Cabe en cualquier Mac o iPhone compatible con Core AI; no aplica a GPUs de escritorio tradicionales.
- Opciones de despliegue: CoreAIKit, CoreAIOps, el ejemplo DetectCamera o el CLI `detect-cli`.
- Latencia y throughput: 4,80 ms en M4 Max GPU, 57 ms en CPU M4 Max, ~22 ms en iPhone 17 Pro.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| YOLOX-CoreAI (este) | YOLOX-S, anchor-free | 8,97 M | `.aimodel` | Apache-2.0 | M4 Max GPU 4,80 ms |
| YOLOX-S (PyTorch original) | YOLOX-S, anchor-free | 8,97 M | `.pth` | Apache-2.0 | No disponible |
| RF-DETR-CoreAI | DETR (sin NMS) | No disponible | `.aimodel` | No disponible | No disponible |

La comparativa cuantitativa con RF-DETR-CoreAI no está disponible en los datos proporcionados. Se puede señalar que es la contraparte densa de ese modelo, ya que YOLOX requiere NMS por clase mientras que la familia DETR no.

## Limitaciones y advertencias

- Solo detecta las 80 clases del dataset COCO; no es extensible a clases personalizadas sin reentrenamiento.
- Entrada fija de 640x640 con letterbox; las imágenes con otras relaciones de aspecto requieren preprocesado.
- El post-proceso (NMS por clase) se ejecuta en el host, lo que puede ser un cuello de botella en sistemas con muchas detecciones.
- Dependencia del ecosistema Apple (Core AI); el modelo no es portable a otros frameworks como TensorFlow o PyTorch sin reconversión.
- El tag de HuggingFace indica "quantized", pero el README especifica pesos FP32; existe una discrepancia potencial que conviene verificar antes de usar en producción.
- Riesgo de falsos positivos o detecciones erróneas (alucinaciones visuales), especialmente en escenarios fuera de la distribución de COCO.
- Sesgos no documentados; el entrenamiento en COCO puede reflejar sesgos de datos en clases y contextos.

## Enlaces

- HuggingFace: https://huggingface.co/iosafat/YOLOX-CoreAI
- Repositorio YOLOX original: https://github.com/Megvii-BaseDetection/YOLOX
- Core AI Model Zoo: https://github.com/john-rocky/coreai-model-zoo
- Model card de YOLOX en el zoológico: https://github.com/john-rocky/coreai-model-zoo/blob/main/zoo/yolox.md
- Core AI Kit: https://github.com/john-rocky/coreai-kit
- Cookbook de Core AI Kit: https://github.com/john-rocky/coreai-kit/blob/main/docs/COOKBOOK.md
- Ejemplo DetectCamera: https://github.com/john-rocky/coreai-kit/tree/main/Examples/DetectCamera
- QuickStart.swift: https://github.com/john-rocky/coreai-kit/blob/main/Examples/DetectCamera/Sources/QuickStart.swift
- Script de conversión: https://github.com/john-rocky/coreai-model-zoo/blob/main/conversion/export_yolox.py
- RF-DETR-CoreAI (contraparte DETR): https://huggingface.co/mlboydaisuke/RF-DETR-CoreAI
- Colección Core AI Model Zoo: https://huggingface.co/collections/mlboydaisuke/core-ai-model-zoo-6a7ff330f753e8dcae04671a
- Solicitudes de modelos on-device: https://github.com/john-rocky/on-device-requests
- Versión de la comunidad: https://huggingface.co/coreai-community/YOLOX-CoreAI
