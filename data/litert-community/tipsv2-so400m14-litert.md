# litert-community/TIPSv2-SO400m14-LiteRT

## Resumen

TIPSv2-SO400m14-LiteRT es la conversión a formato LiteRT (TFLite) del codificador de imágenes TIPSv2-SO400m/14 de Google, publicada por la comunidad litert-community. No se trata de un modelo generativo ni multimodal completo, sino de un encoder visual independiente que produce dos embeddings globales (uno entrenado con leyendas web y otro con leyendas sintéticas) y características espaciales por parche. El texto y las cabezas de tarea del modelo original no están incluidos.

El modelo resuelve el problema de llevar un vision transformer de 400 millones de parámetros a entornos de inferencia ligeros (móvil, edge, NPU) mediante cuantización estática y empaquetado en TFLite. Es relevante para desarrolladores que necesitan extracción de características visuales de alta calidad en dispositivos sin GPU de datacenter, o que quieren integrar el encoder en pipelines de recuperación imagen-texto siempre que aporten su propio text encoder.

La arquitectura subyacente es un vision transformer con parches de 14x14 y resolución nativa de 448 px (también se ofrece variante a 224 px). El repositorio ocupa 5,0 GB e incluye pesos FP32 y cuantizados A16W8, además de variantes compiladas para NPU de Qualcomm. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) con parches 14x14, encoder de imágenes TIPSv2 |
| Parametros totales | no disponible (el nombre SO400m sugiere ~400M, sin confirmación en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 224x224 o 448x448) |
| Tipos de cuantizacion | FP32 y A16W8 (INT8 en pesos FC, INT16 en activaciones, salidas FLOAT32); variante Qualcomm con activaciones UINT16 |
| Idiomas soportados | no disponible (encoder visual; los embeddings se alinean con texto solo si se aporta el text encoder correspondiente) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), con buffers de pesos externos en los ficheros FP32 grandes |

## Arquitectura y entrenamiento

El modelo es un vision transformer que procesa imágenes en resolución fija (224 o 448 px) y devuelve tres salidas: `cls_token` [1,1152], `secondary_cls_token` [1,1152] y `patch_features` [1,256,1152] o [1,1024,1152] según resolución. La dimensión de embedding es 1152. Los dos tokens globales corresponden a dos objetivos de entrenamiento distintos del modelo original: uno con leyendas web y otro con leyendas sintéticas. Las salidas son post-LayerNorm y no están normalizadas L2; la normalización debe aplicarse fuera del modelo.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos pertenecen al modelo base `google/tipsv2-so400m14` y no se reproducen aquí. La innovación técnica de esta conversión es la cuantización estática post-entrenamiento con TorchAO: 500 imágenes de calibración por resolución, LayerScale plegado en los pesos FP32 de proyección antes de calibrar, pesos FC simétricos INT8 por canal de salida, sesgos INT64 y rangos de activación ajustados para acumulación INT32. Los grafos eliminan sumas redundantes de máscara de atención y transposiciones de valor específicas de Qualcomm.

## Capacidades

- Extracción de características visuales globales mediante dos embeddings de 1152 dimensiones.
- Extracción de características espaciales por parche (256 o 1024 tokens según resolución).
- Soporte de dos resoluciones fijas: 224x224 (menor coste) y 448x448 (nativa).
- Inferencia en CPU con LiteRT y en NPU de Qualcomm mediante ficheros `model_qualcomm.tflite`.
- Preprocesado específico: RGB, redimensionado bilineal directo al cuadrado, división por 255, sin recorte ni normalización ImageNet.
- No incluye generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades de audio.
- No incluye text encoder ni cabezas de tarea; para aplicaciones texto-imagen zero-shot hace falta el text encoder original.

## Casos de uso

- Búsqueda visual en dispositivos móviles: usar `cls_token` como embedding de imagen y comparar contra un índice vectorial local; el fichero A16W8 de 224 px (404,8 MiB) cabe en aplicaciones móviles con presupuesto de almacenamiento moderado.
- Deduplicación y clustering de imágenes en pipelines de datos: extraer `patch_features` o embeddings globales en lote sobre CPU y agrupar por similitud coseno tras normalización L2 externa.
- Etiquetado automático asistido: combinar los embeddings del encoder con un clasificador ligero entrenado por el equipo para categorizar imágenes en dominios concretos (productos, documentos, escenas).
- Recuperación imagen-texto: emparejar este encoder con el text encoder de TIPSv2 original para construir un sistema de búsqueda multimodal, aprovechando la alineación de los tokens globales con leyendas.
- Procesamiento en edge con NPU: desplegar la variante Qualcomm en dispositivos con acelerador compatible para reducir consumo energético en tareas de visión continua (vigilancia, inspección industrial).
- Segmentación y tareas densas: usar `patch_features` como entrada a cabezas ligeras de segmentación o detección en tiempo real, dado que el modelo expone tokens espaciales de 1152 dimensiones.
- Moderación de contenido visual: calcular embeddings de imágenes subidas y comparar contra un conjunto de referencia de contenido no permitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento y la validación en runtime de los grafos actualizados están pendientes, y que `validation.json` distingue comprobaciones estructurales de evidencia histórica de los ficheros fuente.

## Requisitos de hardware

- VRAM/RAM estimada: los ficheros A16W8 pesan ~405-408 MiB y los FP32 ~1,57 GB; la memoria en ejecución depende del runtime y de los buffers intermedios, no cuantificada en la información.
- GPU recomendadas: no se especifican; el ejemplo oficial usa CPU.
- Compatibilidad con GPU de consumo: no confirmada; el formato TFLite/LiteRT está orientado a CPU y NPU, no a GPUs de escritorio convencionales.
- Despliegue: `ai-edge-litert==2.3.0` con NumPy y Pillow; script de ejemplo `run_tipsv2_tflite.py` con parámetros `--model`, `--image`, `--output` y `--threads`.
- NPU: los ficheros `model_qualcomm.tflite` requieren compilador y runtime de Qualcomm compatibles, no incluyen contexto de vendor y no admiten fallback a CPU.
- Latencia y throughput: no disponibles. La model card advierte que la ejecución A16W8 en CPU puede ser lenta; para CPU se recomienda FP32 como línea base.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formato | Licencia | Contexto/uso |
|---|---|---|---|---|---|
| TIPSv2-SO400m14-LiteRT | ~400M (no confirmado) | 224 / 448 | TFLite (FP32, A16W8) | Apache 2.0 | Encoder visual para edge/CPU/NPU |
| google/tipsv2-so400m14 (modelo base) | ~400M (no confirmado) | 448 nativa | safetensors (presumible, no confirmado) | Apache 2.0 | Modelo completo con text encoder y cabezas |
| CLIP ViT-L/14 | ~428M | 224 / 336 | safetensors, GGUF, ONNX | MIT (variantes) | Multimodal imagen-texto |
| SigLIP SO400m/14 | ~400M | 384 | safetensors, TFLite (variantes) | Apache 2.0 | Multimodal imagen-texto |

La comparación con CLIP y SigLIP es orientativa por tamaño y tarea; no se dispone de resultados de benchmarks de TIPSv2 en la información proporcionada que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas; solo embeddings.
- No incluye text encoder ni cabezas de tarea, por lo que las aplicaciones zero-shot texto-imagen requieren componentes adicionales del modelo original.
- Las salidas no están normalizadas L2; omitir la normalización externa altera las similitudes coseno.
- El preprocesado es estricto: redimensionado directo sin recorte ni normalización ImageNet; desviarse degrada los embeddings.
- La ejecución A16W8 en CPU puede ser lenta; usar FP32 para CPU y A16W8 para NPU o cuando el tamaño sea crítico.
- Los ficheros Qualcomm no admiten fallback a CPU y dependen de un compilador/runtime de vendor concreto.
- La validación en runtime y las mediciones de rendimiento de los grafos actualizados están pendientes según la model card.
- Riesgo de sesgos heredados del dataset de entrenamiento del modelo base (leyendas web y sintéticas), no documentado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse los avisos de LICENSE y NOTICE del proyecto original.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/TIPSv2-SO400m14-LiteRT
- Modelo base: https://huggingface.co/google/tipsv2-so400m14
- Repositorio TIPS: https://github.com/google-deepmind/tips
- Paper TIPSv2: https://arxiv.org/abs/2604.12012
