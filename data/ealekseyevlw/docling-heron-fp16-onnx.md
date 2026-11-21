# ealekseyevlw/docling-heron-fp16-onnx

## Resumen

Docling Heron FP16 ONNX es una cuantización selectiva a FP16 del modelo de detección de layout documental `docling-project/docling-layout-heron`, desarrollado originalmente por el equipo de Docling (IBM Research) y reexportado a ONNX por el usuario `ealekseyevlw`. El modelo resuelve la tarea de *document layout analysis*: detectar y clasificar regiones estructurales en imágenes de páginas (títulos, párrafos, tablas, figuras, listas, etc.) mediante object detection con cajas delimitadoras. Su relevancia radica en que ofrece prácticamente la precisión del modelo FP32 original (0,6875 mAP frente a 0,6909) con un artefacto de solo 83 MB, apto para despliegue en producción con ONNX Runtime y el execution provider de CUDA.

La innovación principal no está en la arquitectura (heredada del modelo base Heron, un detector tipo DETR con decoder de cajas) sino en la estrategia de cuantización: en lugar de convertir todo el grafo a FP16, se mantienen en FP32 las 18 operaciones `GridSample` y la segunda ruta de refinamiento de cajas del decoder, que son las regiones donde la precisión se degradaba de forma crítica. El resultado es un reemplazo directo (*drop-in replacement*) del ONNX FP32 original, conservando nombres de tensores, tipos, preprocesado, IDs de etiquetas e interpretación de salidas.

El modelo está pensado para integrarse en servicios de inferencia CUDA que ya consumen la versión FP32, sin cambios en el contrato de interfaz. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos tipo DETR (Heron layout model) con decoder de refinamiento de cajas; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 640x640) |
| Tipos de cuantizacion | FP16 selectiva (pesos y activaciones FP16, con regiones FP32: 18 nodos `GridSample` y nodos 623–638 del decoder) |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma del texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, 83 MB, SHA-256 `c61f00c7...6454bcd`) |

Interfaz de entrada/salida del grafo:

| Tensor | Tipo y forma | Significado |
|---|---|---|
| `images` | `uint8`, `[batch, 3, 640, 640]` | Ráster RGB, NCHW |
| `orig_target_sizes` | `int64`, `[batch, 2]` | Tamaños originales en orden `[width, height]` |
| `labels` | `int64`, `[batch, 300]` | IDs de categoría Heron |
| `boxes` | `float32`, `[batch, 300, 4]` | `[x_min, y_min, x_max, y_max]` en píxeles de la imagen original |
| `scores` | `float32`, `[batch, 300]` | Puntuaciones de confianza |

## Arquitectura y entrenamiento

El modelo base `docling-layout-heron` es un detector de objetos de la familia DETR adaptado al análisis de layout documental. La arquitectura incluye un backbone de extracción de características, un encoder y un decoder transformer que predice un conjunto fijo de 300 detecciones (cajas, etiquetas y scores) por imagen. El decoder incorpora una segunda ruta de refinamiento de cajas (`dec_bbox_head.1` y actualización de cajas hasta `sigmoid_2`), que es precisamente la región más sensible a la cuantización. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

La contribución técnica de esta ficha es la cuantización selectiva: el autor partió del ONNX FP32 (`docling-layout-heron-onnx`, revisión `40bde044...`) y convirtió el grafo a FP16 salvo dos regiones. Primero, los 18 nodos `GridSample`, porque el execution provider CUDA de ONNX Runtime no ejecuta estos operadores Heron en FP16 sobre GPU, lo que provocaba *fallback* a CPU y copias host/device; manteniéndolos en FP32 se ejecutan en CUDA. Segundo, los nodos 623–638 del grafo fuente, que corresponden al refinamiento de cajas del decoder, donde el trazado de activaciones mostró un aumento brusco del error en FP16. El perfil CUDA resultante coloca todos los `GridSample` en GPU y no añade nodos memcpy. El resto de nodos asignados a CPU son operaciones de forma/control baratas, igual que en el modelo FP32.

## Capacidades

- Detección de layout documental: identifica regiones estructurales (títulos, párrafos, tablas, figuras, listas, pies de página, etc.) con cajas delimitadoras y scores de confianza.
- Salida de hasta 300 detecciones por imagen en un único paso (esquema DETR, sin NMS explícito en el contrato de salida).
- Procesamiento por lotes (*batch*) de imágenes de 640x640 con reescalado a tamaño original mediante `orig_target_sizes`.
- Compatibilidad directa con el contrato de servicio del ONNX FP32 original: mismos nombres de tensores, tipos, preprocesado e IDs de etiquetas.
- Ejecución en GPU CUDA vía ONNX Runtime con las regiones críticas en FP32.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente de visión para detección.
- Capacidades multilingües: no aplica (no procesa texto, solo píxeles).

## Casos de uso

- Digitalización de archivos y bibliotecas: el modelo detecta las regiones de cada página escaneada para segmentar el contenido antes de aplicar OCR selectivo, reduciendo coste al no procesar zonas no textuales (figuras, márgenes).
- Pipeline de extracción de tablas y figuras: al identificar cajas de tipo tabla o figura, se pueden recortar y enviar a módulos especializados (reconocimiento de tablas, descripción de imágenes) dentro de un flujo Docling.
- Enriquecimiento de PDF en producción: integrado en un servicio CUDA con ONNX Runtime, sustituye al ONNX FP32 con el mismo contrato, lo que permite reducir el peso del artefacto a 83 MB sin reescribir el código de integración.
- Análisis de documentos financieros e informes: la detección de secciones (títulos, párrafos, tablas) facilita la construcción de índices estructurados y la extracción de campos clave en informes anuales o estados de cuenta.
- Procesamiento por lotes de grandes volúmenes: al admitir entrada `[batch, 3, 640, 640]`, se puede procesar lotes de páginas en GPU para clasificar y segmentar miles de documentos en un pipeline ETL documental.
- Preprocesado para RAG documental: la segmentación por regiones permite trocear documentos respetando su estructura semántica (no cortar tablas o listas a la mitad), mejorando la calidad de los fragmentos indexados.
- Moderación y control de calidad de digitalizaciones: los scores de confianza permiten detectar páginas mal escaneadas o con layout atípico para revisión manual.

## Benchmarks y rendimiento

Evaluación sobre el mismo subconjunto de 2.679 páginas de DocLayNet. Métricas COCO bbox; precisión y recall con umbral de score 0,3 e IoU 0,5.

| Métrica | FP32 | FP16 completo | FP16 selectiva (`model.onnx`) |
|---|---:|---:|---:|
| mAP @ IoU 0,50:0,95 | 0,6909 | 0,5239 | **0,6875** |
| AP50 | 0,8612 | 0,7164 | **0,8603** |
| AP75 | 0,7484 | 0,5820 | **0,7466** |
| AR@100 | 0,7929 | 0,7467 | **0,7918** |
| Precision | 0,5920 | 0,5038 | **0,5918** |
| Recall | 0,9477 | 0,8243 | **0,9471** |

La cuantización selectiva recupera casi toda la precisión del FP32 (pérdida de 0,0034 mAP), mientras que el FP16 completo cae a 0,5239 mAP. No se han publicado datos de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto pesa 83 MB, por lo que el modelo cabe holgadamente en cualquier GPU con al menos 2 GB de VRAM, incluyendo el batch y los buffers de activaciones.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para ONNX Runtime (el autor probó con el execution provider CUDA). Para producción, A100, H100 o L4; para desarrollo, RTX 4090, RTX 3090 o RTX 4080.
- Cabe en GPU de consumo: sí, en cualquier GPU NVIDIA consumer con CUDA (RTX 30xx/40xx y superiores).
- Opciones de despliegue: ONNX Runtime con execution provider CUDA (configuración probada por el autor); también es posible ejecutarlo con el execution provider CPU, aunque no se han publicado métricas de rendimiento en ese modo.
- Latencia y throughput: no disponibles en la información proporcionada. El perfil CUDA confirma que los 18 nodos `GridSample` se ejecutan en GPU y no se añaden nodos memcpy, lo que evita el *fallback* a CPU que penalizaba al FP16 completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mAP DocLayNet | Licencia | Formato |
|---|---|---|---|---|---|
| Docling Heron FP16 selectiva (este) | no disponible | imagen 640x640 | 0,6875 | Apache 2.0 | ONNX |
| Docling Heron FP32 ONNX | no disponible | imagen 640x640 | 0,6909 | Apache 2.0 | ONNX |
| Docling Heron FP16 completo | no disponible | imagen 640x640 | 0,5239 | Apache 2.0 | ONNX |
| Docling Heron original (PyTorch) | no disponible | imagen 640x640 | no disponible | Apache 2.0 | safetensors/PyTorch |

La comparación con otros detectores de layout (por ejemplo, LayoutLMv3, DiT, PubLayNet baselines) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo puramente de visión: no procesa texto, no genera lenguaje y no soporta tool calling ni agentes; su única salida son cajas, etiquetas y scores.
- Dependencia de ONNX Runtime CUDA: el rendimiento óptimo requiere el execution provider CUDA; en CPU el comportamiento no está documentado y podría degradarse.
- La cuantización selectiva se validó con una configuración concreta de ONNX Runtime/CUDA; el autor recomienda verificar el modelo con el despliegue objetivo antes de ponerlo en producción.
- Precisión limitada: 0,5920 de precisión con umbral 0,3 e IoU 0,5 implica un número relevante de falsos positivos; conviene calibrar el umbral según la aplicación.
- Riesgo de degradación en layouts atípicos (documentos históricos, tablas complejas, páginas con múltiples columnas irregulares) no cuantificado en la información disponible.
- Sesgos: no se documentan sesgos específicos del modelo base ni del proceso de cuantización.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y atribución.
- El modelo base y el ONNX FP32 de origen deben citarse adecuadamente; esta ficha es una reexportación de la comunidad (`ealekseyevlw`), no del equipo oficial de Docling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ealekseyevlw/docling-heron-fp16-onnx
- Modelo base: https://huggingface.co/docling-project/docling-layout-heron
- ONNX FP32 de origen: https://huggingface.co/docling-project/docling-layout-heron-onnx (revisión `40bde044036bb181c130ddf6c51792187268748f`)
- Proyecto Docling: https://github.com/docling-project/docling
- Dataset DocLayNet: https://huggingface.co/datasets/ds4sd/DocLayNet
- ONNX Runtime: https://onnxruntime.ai/
