# davied-he/Octen-Embedding-4B-MLX-4bit

## Resumen

Octen-Embedding-4B-MLX-4bit es una conversión comunitaria del modelo de embeddings Octen-Embedding-4B, desarrollado por Octen, al formato MLX con cuantización de 4 bits para ejecutarse en Apple silicon. El modelo original es un fine-tuning de Qwen/Qwen3-Embedding-4B, un encoder transformer de 4.000 millones de parámetros sin cabezal de lenguaje, especializado en generación de embeddings para búsqueda semántica y recuperación de información. Esta conversión, publicada por el usuario davied-he, mantiene la misma arquitectura y pesos que el modelo base, pero los cuantiza a 4 bits mediante MLX-LM, reduciendo el tamaño del artefacto a 2,3 GB y permitiendo su uso en Mac con memoria unificada.

El modelo soporta una longitud de contexto de 32.768 tokens, produce embeddings de 2.560 dimensiones y está diseñado para consultas y documentos en inglés, chino y otros idiomas multilingües. Al ser una conversión de solo embeddings, no genera texto, sino representaciones vectoriales normalizadas mediante pooling del último token y normalización L2. Su relevancia radica en ofrecer una alternativa eficiente y local para tareas de retrieval y RAG en entornos Apple, sin necesidad de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3Model (encoder-only, sin LM head) |
| Parametros totales | 4B (según model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | MLX affine 4-bit (grupo de 64, 4.501 bits efectivos por peso) |
| Idiomas soportados | inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Octen-Embedding-4B es un fine-tuning de Qwen3-Embedding-4B, un transformer encoder de 4.000 millones de parámetros con 2.560 dimensiones de embedding y una ventana de contexto de 32.768 tokens. La arquitectura es la estándar de Qwen3 sin cabezal de generación, diseñada exclusivamente para producir representaciones vectoriales. El entrenamiento original fue realizado por Octen, aunque no se especifican los datos ni el proceso (si hubo RLHF, DPO u otro método) en la información disponible.

La conversión MLX, realizada por davied-he, normalizó los nombres de los pesos del checkpoint original (de `embed_tokens.*` y `layers.*` a `model.embed_tokens.*` y `model.layers.*`) para que coincidieran con el layout estándar de MLX-LM, y luego aplicó cuantización afín de 4 bits con grupo de 64 mediante la herramienta oficial `mlx_lm.convert`. No se modificaron los valores de los tensores durante la normalización, y el repositorio final no contiene código Python personalizado, usando el modelo `qwen3.Model` integrado de MLX-LM.

## Capacidades

- Generación de embeddings de texto de 2.560 dimensiones para consultas y documentos.
- Búsqueda semántica y recuperación de pasajes relevantes mediante similitud coseno.
- Soporte multilingüe, con especial énfasis en inglés y chino, aunque el modelo se declara multilingüe.
- Pooling del último token y normalización L2 en float32 para obtener vectores comparables.
- Integración con el ecosistema MLX-LM, permitiendo carga directa desde HuggingFace en Apple silicon.
- No incluye generación de texto, tool calling ni capacidades de agente; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en documentos corporativos: el modelo puede indexar grandes volúmenes de texto (hasta 32.768 tokens por pasaje) y recuperar los fragmentos más relevantes según el significado, no solo por coincidencia de palabras clave.
- Sistemas RAG (Retrieval-Augmented Generation): se puede usar como componente de recuperación para alimentar a un LLM generativo, aprovechando su contexto largo y su capacidad multilingüe para consultas en inglés y chino.
- Clasificación de textos por similitud: agrupar documentos, correos o artículos según su contenido semántico, generando embeddings y calculando distancias entre vectores.
- Deduplicación de contenido: detectar documentos duplicados o casi duplicados comparando embeddings, útil en pipelines de limpieza de datos.
- Motores de recomendación basados en contenido: representar ítems (productos, artículos, noticias) como vectores y recomendar elementos similares según proximidad coseno.
- Análisis de sentimiento o topic modeling: los embeddings pueden servir como características de entrada para clasificadores posteriores, aprovechando la representación semántica densa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una validación interna: en tres muestras de inglés y chino tradicional, la similitud coseno entre los embeddings del modelo original en BF16 y la conversión MLX 4-bit fue de 0,9748 a 0,9782, y una prueba de retrieval bilingüe devolvió los documentos Top-1 esperados. No hay datos de MMLU, MTEB u otros estándares.

## Requisitos de hardware

- Diseñado para Apple silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada.
- El tamaño del repositorio es de 2,3 GB, por lo que cabe en Mac con al menos 8 GB de RAM, aunque se recomienda 16 GB para trabajar con comodidad.
- No requiere GPU dedicada; la inferencia se ejecuta en la CPU/GPU unificada de Apple mediante MLX.
- Despliegue mediante `mlx-lm` (carga directa con `load()`), sin necesidad de vLLM, llama.cpp u otros servidores.
- Latencia y throughput no especificados; al ser un modelo de 4B cuantizado, se espera un rendimiento razonable en Mac modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de embeddings en la información proporcionada. El modelo base Octen-Embedding-4B es un fine-tuning de Qwen3-Embedding-4B, por lo que comparte arquitectura y dimensiones con este último. Alternativas como BGE-M3, E5-mistral-7b o gte-large podrían ser comparables, pero no se han encontrado benchmarks que permitan una comparación objetiva. Se recomienda evaluar el modelo en los propios datos antes de elegirlo.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce diferencias numéricas respecto al modelo original en BF16; la similitud coseno entre ambos es de ~0,97, lo que puede afectar a tareas de retrieval muy sensibles.
- No mezclar vectores generados con este modelo con vectores de otro modelo, aunque ambos tengan 2.560 dimensiones, ya que los espacios vectoriales no son compatibles.
- El modelo solo produce embeddings; no es capaz de generar texto ni de realizar razonamiento conversacional.
- La calidad del retrieval debe evaluarse en los idiomas y dominios específicos de uso; el modelo está optimizado para inglés y chino, y su rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución al modelo original de Octen y a Qwen.
- Al ser una conversión comunitaria, no hay soporte oficial de Octen para este artefacto específico.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/davied-he/Octen-Embedding-4B-MLX-4bit
- Modelo base Octen/Octen-Embedding-4B: https://huggingface.co/Octen/Octen-Embedding-4B
- Documentación de Octen sobre embeddings: https://docs.octen.ai/capabilities/embedding
- Referencia de API de embeddings de Octen: https://docs.octen.ai/api-reference/embedding
