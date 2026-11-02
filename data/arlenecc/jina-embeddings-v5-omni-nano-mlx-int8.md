# arlenecc/jina-embeddings-v5-omni-nano-mlx-int8

## Resumen

`arlenecc/jina-embeddings-v5-omni-nano-mlx-int8` es una conversión comunitaria del modelo de embeddings multimodales `jinaai/jina-embeddings-v5-omni-nano` de Jina AI, portada a MLX (el framework de Apple para silicio propio) y cuantizada a int8. El modelo original produce embeddings de texto, imagen y audio en un mismo espacio vectorial, lo que permite búsqueda cruzada entre modalidades (por ejemplo, recuperar una imagen a partir de una consulta de audio). Esta versión concreta no es un modelo nuevo: es una reimplementación del original sin dependencia de PyTorch en tiempo de inferencia, pensada para ejecutarse en Macs con chip Apple M.

La arquitectura combina tres torres: una torre de texto EuroBERT bidireccional, una torre visual Qwen3-VL y una torre de audio Qwen2.5-Omni. El modelo soporta cuatro tareas diferenciadas (`retrieval`, `text-matching`, `clustering`, `classification`), cada una con su propio adaptador LoRA (rango 32), merger visual, proyector de audio y embeddings de token especiales, seleccionables en tiempo de ejecución. Los embeddings usan pooling de último token con normalización L2 y dimensiones Matryoshka de 32 a 768.

El peso total es de 312.300.160 parámetros (unos 312 M) y el repositorio ocupa 1,2 GB. Es relevante para desarrolladores que quieran desplegar búsqueda semántica multimodal en hardware Apple sin GPU dedicada, o que necesiten un runtime ligero sin PyTorch. La verificación del autor reporta una similitud coseno mínima de 0,9999 en texto, 0,9929 en imagen y 0,9961 en audio frente al modelo original en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida de tres torres: EuroBERT (texto, bidireccional) + Qwen3-VL (visión) + Qwen2.5-Omni (audio); adaptadores LoRA por tarea |
| Parámetros totales | 312.300.160 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 afín (group size 32); existe una variante int4 de mezcla de bits en repo hermano |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), adaptadores LoRA en safetensors fp16 |
| Dimensiones de embedding | 32 / 64 / 128 / 256 / 512 / 768 (Matryoshka) |
| Pooling | último token + normalización L2 |
| Tareas soportadas | retrieval, text-matching, clustering, classification |
| Runtime | MLX 0.32.3 (sin PyTorch en inferencia; transformers solo para preprocesado) |

## Arquitectura y entrenamiento

El modelo es una arquitectura de embeddings multimodales con tres torres independientes que proyectan a un espacio compartido. La torre de texto es EuroBERT en configuración bidireccional; la visual es Qwen3-VL y la de audio Qwen2.5-Omni. Cada una de las cuatro tareas tiene su propio conjunto de parámetros: un merger visual, un proyector de audio, embeddings de tokens especiales y un LoRA de rango 32 sobre la torre de texto. El enrutado de tarea se hace en tiempo de ejecución mediante `set_task()`.

La cuantización int8 es afín con group size 32 aplicada a todas las capas lineales de las tres torres, incluidas las tablas de embeddings de palabras. Las capas de normalización, las convoluciones y los embeddings de tokens de tarea se mantienen en fp16. El autor documenta una prueba de equivalencia: en fp32 sin cuantizar la torre visual coincide con la referencia HF con coseno 1,0000, y en fp16 frente a bf16 da 0,9999 (texto), 0,9989 (imagen) y 0,9960 (audio), atribuyendo la diferencia restante exclusivamente a la cuantización int8.

No se dispone de información sobre el dataset de entrenamiento del modelo original (número de tokens, composición, uso de RLHF o DPO) en la documentación proporcionada.

## Capacidades

- Generación de embeddings de texto con cuatro modos de tarea conmutables: recuperación, comparación de textos, clustering y clasificación.
- Embeddings de imagen mediante la torre Qwen3-VL, con procesado previo a través de `AutoProcessor` de transformers.
- Embeddings de audio mediante la torre Qwen2.5-Omni, con extracción de 128 bandas mel y máscara de frames válidos.
- Búsqueda multimodal cruzada: consultas en una modalidad contra documentos en otra dentro del mismo espacio vectorial.
- Prefijos de query/document para tareas asimétricas de recuperación.
- Truncado Matryoshka a 32, 64, 128, 256, 512 o 768 dimensiones con renormalización automática.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- No dispone de modo thinking ni salida de texto libre.

## Casos de uso

- Búsqueda semántica de documentos en local: indexar un corpus de texto con embeddings de 768 dimensiones y ejecutar consultas en un Mac sin GPU dedicada, aprovechando el runtime MLX y el consumo de unos 1120 MB residentes.
- Recuperación de imágenes por descripción textual: usar la torre visual para indexar un catálogo de imágenes y la torre de texto para consultas, con truncado Matryoshka a 256 dimensiones si se prioriza velocidad de búsqueda sobre precisión.
- Búsqueda de audio por texto o por audio: indexar fragmentos de audio (podcasts, grabaciones) con la torre de audio y recuperarlos mediante consultas textuales, útil para archivado de medios.
- Deduplicación y clustering de contenidos: con la tarea `clustering` y dimensiones reducidas (64 o 128), agrupar noticias, tickets o productos similares en pipelines por lotes.
- Clasificación zero-shot de textos: usar la tarea `classification` para etiquetar documentos comparando su embedding con el de descripciones de categoría, sin entrenamiento adicional.
- Motor de recomendación basado en similitud: comparar embeddings de ítems y usuarios (o consultas) en un espacio común para generar recomendaciones de contenido mixto texto-imagen-audio.
- Prototipado en portátiles Apple: validar pipelines de recuperación multimodal en un MacBook antes de migrar a infraestructura con GPU, gracias a la paridad documentada con el modelo original.
- Filtrado de contenido sensible: comparar embeddings de documentos entrantes contra un conjunto de referencia de contenido prohibido usando la tarea `text-matching`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, etc.) en la información disponible. El autor sí documenta métricas de verificación de equivalencia y rendimiento en Apple M:

| Métrica | Valor |
|---|---|
| Similitud coseno mínima, texto (3 muestras) | 0,9999 |
| Similitud coseno mínima, imagen (1 imagen) | 0,9929 |
| Similitud coseno mínima, audio (1 audio) | 0,9961 |
| Umbral de aceptación | 0,98 |
| Tiempo de carga | 0,6 s |
| Memoria residente | ~1120 MB |
| Latencia, codificación de texto (calentamiento) | ~1 ms |
| Latencia, codificación de imagen | ~330 ms |
| Latencia, codificación de audio | ~120 ms |

Estas cifras son de una única máquina Apple M con MLX 0.32.3 y no constituyen un benchmark comparativo frente a otros modelos.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidades | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| jina-embeddings-v5-omni-nano-mlx-int8 (este) | 312 M | texto, imagen, audio | no disponible | no disponible | safetensors MLX int8 |
| jinaai/jina-embeddings-v5-omni-nano (original) | no disponible | texto, imagen, audio | no disponible | no disponible | safetensors (bf16) |
| jina-embeddings-v5-omni-nano-mlx-int4 (repo hermano) | 973 MB de pesos | texto, imagen, audio | no disponible | no disponible | safetensors MLX int4 mixto |

La variante int4 del mismo autor reduce el tamaño a 973 MB con similitud coseno de 0,987 (texto), 0,977 (imagen) y 0,991 (audio) frente al original. No se dispone de datos de otros modelos comparables de embeddings multimodales en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; antes de uso comercial hay que verificar la licencia del modelo original de Jina AI y la del port comunitario.
- Es un modelo de embeddings, no generativo: no produce texto, no razona y no soporta tool calling.
- La cuantización int8 introduce una pérdida medible de similitud (hasta 0,0071 en imagen); para aplicaciones sensibles a la precisión puede ser preferible el modelo original en bf16.
- Las métricas de verificación se basan en muy pocas muestras (3 textos, 1 imagen, 1 audio), por lo que no garantizan el comportamiento en dominios diversos.
- El runtime depende de MLX y está orientado a hardware Apple; el despliegue en Linux o GPU NVIDIA requeriría el modelo original.
- El preprocesado de imagen y audio sí requiere transformers, lo que contradice parcialmente la afirmación de "cero dependencias" del autor.
- No hay información sobre sesgos, cobertura idiomática ni riesgo de alucinación en la documentación disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arlenecc/jina-embeddings-v5-omni-nano-mlx-int8
- Modelo original: https://huggingface.co/jinaai/jina-embeddings-v5-omni-nano
- Variante int4: https://huggingface.co/arlenecc/jina-embeddings-v5-omni-nano-mlx-int4
- Documentación de uso (USAGE.md): incluida en el repositorio del modelo
- Scripts del repositorio: `model.py`, `utils.py`, `convert.py`, `verify.py`, `example.py`
