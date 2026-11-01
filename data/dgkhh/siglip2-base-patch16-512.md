# dgkhh/siglip2-base-patch16-512

## Resumen

SigLIP 2 Base (patch16-512) es un codificador visión-lenguaje desarrollado por Google que amplía el objetivo de preentrenamiento de SigLIP incorporando de forma unificada técnicas previas como la pérdida de decodificador, la predicción global-local y enmascarada, y la adaptabilidad de resolución y relación de aspecto. Este checkpoint concreto corresponde a la variante Base con parches de 16x16 píxeles y resolución de entrada de 512x512, publicada en el repositorio de HuggingFace bajo el identificador `dgkhh/siglip2-base-patch16-512`.

El modelo resuelve tareas de alineación imagen-texto: clasificación de imágenes zero-shot, recuperación (retrieval) imagen-texto y serve como codificador visual para modelos visión-lenguaje (VLM). Su relevancia actual radica en que SigLIP 2 mejora la comprensión semántica, la localización y la calidad de las características densas respecto a SigLIP original, manteniendo un tamaño contenido (375,8 M de parámetros) que lo hace desplegable en hardware moderado.

La arquitectura es un par de torres transformer (visión y texto) entrenadas con una variante de la pérdida sigmoidea de SigLIP. El repositorio ocupa 1,5 GB y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines existentes de `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Par de torres transformer (vision + texto), preentrenamiento tipo SigLIP con pérdida sigmoidea |
| Parametros totales | 375.823.874 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de codificacion imagen-texto, sin contexto generativo) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors en fp32/fp16 segun checkpoint) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SigLIP 2 emplea una arquitectura de dos torres: un codificador visual tipo Vision Transformer con parches de 16x16 y resolución de 512x512, y un codificador de texto transformer. El objetivo de entrenamiento parte de SigLIP (pérdida sigmoidea sobre pares imagen-texto) y añade tres componentes: pérdida de decodificador (decoder loss), pérdida de predicción global-local y enmascarada, y adaptabilidad de relación de aspecto y resolución. Estas incorporaciones buscan mejorar simultáneamente la semántica global, la localización espacial y la calidad de las características densas.

El preentrenamiento se realizó sobre el dataset WebLI (Chen et al., 2023), con hasta 2048 chips TPU-v5e. La model card no detalla el número exacto de tokens de entrenamiento ni la composición pormenorizada del dataset más allá de la referencia a WebLI. No se especifica en la información disponible si hubo etapas de RLHF o DPO, algo poco habitual en codificadores visión-lenguaje de este tipo.

## Capacidades

- Clasificación de imágenes zero-shot mediante comparación de embeddings imagen-texto con etiquetas candidatas arbitrarias.
- Recuperación imagen-texto y texto-imagen (image-text retrieval) a partir de los embeddings alineados.
- Extracción de características visuales densas para su uso como codificador en modelos visión-lenguaje.
- Localización espacial mejorada gracias a las pérdidas global-local y enmascarada de SigLIP 2.
- Adaptabilidad a distintas resoluciones y relaciones de aspecto en el preentrenamiento.
- Soporte multilingüe según el paper de SigLIP 2 (el modelo base se presenta como multilingüe), aunque la model card de este checkpoint no detalla la lista de idiomas.
- No soporta generación de texto, tool calling ni razonamiento multi-paso: es un codificador, no un modelo generativo.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes entrantes contra un conjunto de etiquetas de política (por ejemplo, "contenido violento", "desnudo", "seguro") sin entrenamiento específico, aprovechando la clasificación zero-shot.
- Búsqueda semántica de imágenes en un catálogo: indexar embeddings visuales con `get_image_features` y recuperar por similitud con embeddings de texto para búsquedas en lenguaje natural.
- Etiquetado automático de datasets: generar etiquetas candidatas y puntuar imágenes para preanotar grandes corpus antes de un entrenamiento supervisado.
- Codificador visual para VLM: usar la torre de visión como componente congelado o ajustable en la construcción de un modelo visión-lenguaje propio.
- Filtrado y deduplicación de datasets multimodales: comparar embeddings imagen-texto para detectar pares mal alineados o duplicados semánticos.
- Clasificación de productos en e-commerce: asignar categorías a imágenes de producto mediante zero-shot con las etiquetas del catálogo, sin reentrenamiento por cada nueva categoría.
- Análisis de imágenes médicas o industriales de dominio acotado: como codificador de características para un clasificador ligero entrenado encima, reduciendo la necesidad de datos etiquetados.

## Benchmarks y rendimiento

La model card remite a la tabla de evaluación del paper de SigLIP 2 (imagen `eval_table.png`) sin incluir los valores numéricos en texto. No se han publicado resultados de benchmarks en la información disponible de forma explícita y cuantificada para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-3 GB en fp16 para los 375,8 M de parámetros, más memoria para activaciones según el tamaño del lote y la resolución de imagen (512x512).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para lotes pequeños; A100 o H100 para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: `transformers` (pipeline `zero-shot-image-classification`), exportación a ONNX, y serving mediante TGI o endpoints compatibles indicados en los tags (`endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / patch | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SigLIP 2 Base patch16-512 (este) | 375,8 M | 512 / 16 | no aplica | Apache 2.0 | HuggingFace |
| SigLIP original Base patch16-384 | no disponible en la informacion | 384 / 16 | no aplica | Apache 2.0 | HuggingFace |
| CLIP ViT-B/32 | no disponible en la informacion | 224 / 32 | no aplica | MIT (segun variante) | HuggingFace |

No se dispone de datos de rendimiento cuantitativos en la información proporcionada para establecer una comparación numérica fiable con estas alternativas.

## Limitaciones y advertencias

- Es un codificador visión-lenguaje, no un modelo generativo: no produce texto ni mantiene conversaciones.
- Riesgo de sesgo heredado del dataset WebLI, con posibles desequilibrios demográficos, culturales y geográficos en las representaciones aprendidas.
- La clasificación zero-shot depende fuertemente de la formulación de las etiquetas candidatas; etiquetas ambiguas o muy similares pueden degradar la precisión.
- No hay información sobre la lista concreta de idiomas soportados en este checkpoint, pese a que el paper describe el modelo como multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset WebLI y las políticas de Google asociadas a los modelos SigLIP.
- El repositorio pertenece a un usuario (`dgkhh`) distinto del autor original (Google); se recomienda verificar la integridad de los pesos frente al checkpoint oficial `google/siglip2-base-patch16-512`.
- Solo 17 descargas y 0 likes en el momento de la consulta: baja validación comunitaria de esta copia concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dgkhh/siglip2-base-patch16-512
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Paper SigLIP: https://arxiv.org/abs/2303.15343
- Paper WebLI: https://arxiv.org/abs/2209.06794
- Documentación de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Checkpoint oficial de referencia: https://huggingface.co/google/siglip2-base-patch16-512
