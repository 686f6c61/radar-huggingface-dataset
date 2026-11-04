# litert-community/TIPSv2-B14-LiteRT

## Resumen

TIPSv2-B14-LiteRT es la conversión a formato LiteRT (TFLite) del codificador de imágenes TIPSv2-B/14 de Google, publicada por la comunidad `litert-community`. Se trata de un Vision Transformer de tipo ViT-B/14 que actúa exclusivamente como extractor de características visuales: no incluye el codificador de texto ni las cabezas de tarea del modelo original, por lo que su función es generar embeddings globales y características espaciales de parches que pueden combinarse con otros componentes (por ejemplo, un codificador de texto separado) para tareas de clasificación zero-shot, segmentación o recuperación multimodal.

El modelo es relevante porque traslada un encoder de visión de propósito general a un formato ejecutable en dispositivos móviles y NPUs de Qualcomm y MediaTek, con variantes cuantizadas A16W8 (pesos de 8 bits, activaciones de 16 bits) que reducen el tamaño de 327 MiB a 86 MiB sin pérdida apreciable de precisión en el token principal. La resolución nativa es 448×448, con una variante de 224×224 de menor coste computacional.

La arquitectura subyacente es un transformer de visión con parches de 14×14 y 768 dimensiones de embedding, entrenado por Google con captions web y captions sintéticos (de ahí las dos salidas globales, `cls_token` y `secondary_cls_token`). La licencia Apache 2.0 y la disponibilidad de artefactos precompilados para CPU y NPU lo hacen adecuado para inferencia en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/14), encoder de imágenes independiente |
| Parametros totales | no disponible (el modelo base es ViT-B, ~86 M típicamente, no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224×224 o 448×448) |
| Tipos de cuantizacion | FP32 y A16W8 (pesos FC de 8 bits, activaciones de transformer de 16 bits); variantes específicas para NPU Qualcomm |
| Idiomas soportados | no disponible (modelo de visión sin capacidades lingüísticas propias) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite / LiteRT (`model.tflite`), con variantes FP32, A16W8 y A16W8 para NPU Qualcomm |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer con parches de 14×14 y dimensión de embedding de 768, derivado de `google/tipsv2-b14`. La información disponible no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de que el token global principal se entrenó con captions web y el secundario con captions sintéticos, lo que explica la doble salida global. No se especifica si hubo RLHF, DPO u otras fases de alineación, ni innovaciones como atención lineal o decodificación especulativa; se trata de un encoder estándar de tipo ViT.

La conversión a LiteRT preserva los valores calibrados del modelo portable mediante almacenamiento de activaciones en 16 bits sin signo para las variantes NPU. Las salidas son post-LayerNorm y no están normalizadas L2. El modelo no incluye cabezas de tarea ni el codificador de texto del sistema TIPSv2 completo, por lo que su uso requiere emparejarlo con el codificador de texto correspondiente para tareas de clasificación zero-shot.

## Capacidades

- Extracción de características visuales globales mediante `cls_token` (entrenado con captions web) y `secondary_cls_token` (entrenado con captions sintéticos), ambos de 768 dimensiones.
- Extracción de características espaciales de parches: `patch_features` con forma `[1,256,768]` a 224×224 y `[1,1024,768]` a 448×448.
- Clasificación zero-shot de imágenes cuando se combina con el codificador de texto correspondiente y el prompt `a photo of a {class name}.`.
- Segmentación semántica zero-shot a nivel de parche (evaluada sobre VOC2012 con 21 clases de texto).
- Soporte de dos resoluciones de entrada: 224×224 (menor coste) y 448×448 (resolución nativa, mayor precisión).
- Inferencia en CPU (FP32) y en NPU de Qualcomm y MediaTek (FP32 y A16W8).
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso; es exclusivamente un encoder visual.

## Casos de uso

- Búsqueda visual y recuperación imagen-texto en el dispositivo: usar `cls_token` como embedding global y compararlo con embeddings de texto generados por el codificador de texto correspondiente, permitiendo búsqueda semántica de fotos sin enviar imágenes a la nube.
- Clasificación zero-shot en aplicaciones móviles: con el prompt `a photo of a {class name}.` y el codificador de texto emparejado, el modelo clasifica imágenes en categorías arbitrarias sin reentrenamiento, con una precisión top-1 de 65,78 % a 224 y 68,84 % a 448 sobre el protocolo de evaluación del autor.
- Segmentación semántica ligera en el borde: usar `patch_features` para asignar cada parche a una clase de texto, útil en apps de edición fotográfica o realidad aumentada que necesitan separar cielo, vegetación o personas en tiempo real.
- Indexación de galerías fotográficas locales: extraer embeddings de miles de imágenes en segundo plano en el móvil (14–15 ms por imagen a 224 en SM8750 con A16W8) para construir un índice de búsqueda por similitud.
- Preprocesamiento para pipelines multimodales: generar características visuales que alimenten un LLM multimodal o un sistema de captioning que resida en servidor, descargando la parte visual al dispositivo.
- Detección de duplicados y near-duplicates visuales: comparar embeddings globales para agrupar imágenes similares en aplicaciones de gestión de fotos, aprovechando que las salidas son post-LayerNorm y comparables mediante similitud coseno tras normalización.
- Control de calidad en captura de documentos o productos: verificar que la imagen capturada contiene el objeto esperado comparando su embedding con prototipos de referencia, con latencia de decenas de milisegundos en NPU.

## Benchmarks y rendimiento

Resultados del protocolo fijo del autor sobre 5.000 imágenes de validación de ImageNet y 1.449 de VOC2012:

| Resolución | Backend / perfil | ImageNet top-1 | VOC mIoU |
|---|---:|---:|---:|
| 224 | PyTorch FP32 | 65,78 % | 24,026 % |
| 224 | LiteRT CPU / FP32 | 65,78 % | 24,026 % |
| 224 | MT6897 NPU / FP32 | 65,72 % | 24,027 % |
| 224 | MT6897 NPU / A16W8 | 65,56 % | 24,023 % |
| 224 | SM8750 NPU / FP32 | 65,80 % | 24,034 % |
| 224 | SM8750 NPU / A16W8 | 65,56 % | 23,998 % |
| 448 | PyTorch FP32 | 68,84 % | 24,567 % |
| 448 | LiteRT CPU / FP32 | 68,84 % | 24,567 % |
| 448 | MT6897 NPU / FP32 | 68,88 % | 24,562 % |
| 448 | MT6897 NPU / A16W8 | 68,84 % | 24,529 % |
| 448 | SM8750 NPU / FP32 | 68,96 % | 24,567 % |
| 448 | SM8750 NPU / A16W8 | 68,82 % | 24,537 % |

En latencia sobre dispositivos comerciales (mediana de tres ensayos de cinco minutos, `benchmark_model` de LiteRT vía adb, delegación completa a NPU):

| Dispositivo | SoC | Perfil | p50 (ms) | p95 (ms) |
|---|---|---|---:|---:|
| LJ9 | MT6897 | 224 FP32 | 88 | 91 |
| LJ9 | MT6897 | 224 A16W8 | 60 | 62 |
| LJ9 | MT6897 | 448 FP32 | 379 | 385 |
| LJ9 | MT6897 | 448 A16W8 | 307 | 313 |
| SM-S937U1 | SM8750 | 224 FP32 | 15 | 16 |
| SM-S937U1 | SM8750 | 224 A16W8 | 14 | 15 |
| SM-S937U1 | SM8750 | 448 FP32 | 265 | 267 |
| SM-S937U1 | SM8750 | 448 A16W8 | 112 | 113 |

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de benchmarks de modelos alternativos comparables bajo el mismo protocolo, por lo que la comparación cuantitativa no está disponible.

| Modelo | Tipo | Resolución nativa | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TIPSv2-B14-LiteRT | ViT-B/14, encoder visual | 448 | TFLite / LiteRT | Apache 2.0 | Hugging Face |
| google/tipsv2-b14 | ViT-B/14, sistema completo | 448 | PyTorch (no confirmado) | no disponible en esta ficha | Hugging Face |
| CLIP ViT-B/14 | ViT-B/14, imagen+texto | 224 | PyTorch, ONNX, otros | no disponible en esta ficha | Hugging Face |
| SigLIP ViT-B/14 | ViT-B/14, imagen+texto | 224 | PyTorch, otros | no disponible en esta ficha | Hugging Face |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento; cualquier expectativa de uso como LLM es incorrecta.
- Requiere emparejar con el codificador de texto de TIPSv2 para clasificación zero-shot; sin él, solo produce embeddings sin semántica textual directa.
- Los resultados de benchmarks son del protocolo fijo del autor, no reproducciones de los benchmarks publicados por Google; no deben compararse directamente con cifras oficiales de TIPSv2.
- A 224×224, el token secundario pierde entre 0,38 y 0,88 puntos porcentuales de top-1 frente a PyTorch FP32 con A16W8; el token principal es el que se preserva con mayor fidelidad.
- Los archivos `model_qualcomm.tflite` no admiten fallback a CPU y requieren un compilador y runtime de proveedor compatibles.
- Las mediciones NPU del autor usan correcciones del compilador no incluidas en LiteRT 2.3.0 público; las rutas de compilación sin modificar no manejan correctamente los archivos A16W8 portables en las NPUs probadas.
- A16W8 puede ser lento en CPU y no está soportado por el runtime GPU probado.
- Las salidas no están normalizadas L2; es responsabilidad del integrador normalizar antes de calcular similitudes coseno.
- No se aplica normalización ImageNet mean/std ni recorte: hay que redimensionar directamente con interpolación bilineal de PIL y dividir por 255.
- No se documentan sesgos específicos del modelo en la información disponible; al derivar de un entrenamiento con captions web, es plausible heredar sesgos de ese corpus, pero no hay datos publicados al respecto en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `google/tipsv2-b14` debe verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/TIPSv2-B14-LiteRT
- Modelo base: https://huggingface.co/google/tipsv2-b14
- Script de ejemplo `run_tipsv2_tflite.py` (incluido en el repositorio del modelo)
- Resultados de evaluación detallados: `evaluation_results.json` (en el repositorio)
- Protocolo de evaluación: `evaluation_protocol.json` (en el repositorio)
- Selección de imágenes de evaluación: `evaluation_selection.json` (en el repositorio)
- Paper referenciado en los tags: arXiv:2604.12012 (no verificado en la información disponible)
