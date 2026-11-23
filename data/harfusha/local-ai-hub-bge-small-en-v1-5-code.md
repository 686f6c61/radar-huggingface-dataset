# Harfusha/local-ai-hub-bge-small-en-v1-5-code

## Resumen

Harfusha/local-ai-hub-bge-small-en-v1-5-code es un modelo de embeddings de texto derivado de BAAI/bge-small-en-v1.5 mediante la fusión de un adaptador LoRA entrenado específicamente para recuperación de código (code retrieval). Lo publica el usuario Harfusha bajo licencia MIT y mantiene el formato estándar de SentenceTransformers, lo que permite sustituir el modelo base sin cambios en el pipeline de inferencia. Con 33,36 millones de parámetros y un repositorio de 0,1 GB, está pensado para ejecutarse en entornos locales de recursos limitados.

El problema que aborda es la recuperación semántica de fragmentos de código dentro de un proyecto denominado Local AI Hub: emparejar consultas en lenguaje natural o en código con los snippets relevantes. Según la model card, el ajuste eleva hit@1 de 0,650 a 0,825, MRR de 0,7493 a 0,8703 y accuracy de 0,855 a 0,939 sobre un conjunto de evaluación held-out agregado, manteniendo un tiempo de lote de evaluación similar (mediana de 2,488 s a 2,333 s).

Es relevante por su tamaño reducido y su compatibilidad directa con el ecosistema BGE: se puede desplegar como encoder de recuperación en CPU o GPU de gama baja sin renunciar a una mejora medible en la tarea de code retrieval. No obstante, la información publicada es escasa: no se detallan los datos de entrenamiento, la composición del dataset ni el pipeline exacto de fusión del LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), derivado de BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base bge-small-en-v1.5 emplea 512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es de proposito general en ingles; no confirmado para este fine-tune) |
| Licencia | MIT |
| Formato de pesos | safetensors (layout SentenceTransformers) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT de 33,36 millones de parámetros, heredado de BAAI/bge-small-en-v1.5. Sobre esa base se entrenó un adaptador LoRA orientado a code retrieval y posteriormente se fusionó con los pesos del modelo base, dando lugar a un checkpoint de inferencia estándar con estructura de SentenceTransformers. No se especifica la dimensión de embedding, el número de capas ni la configuración de atención en la información disponible, aunque al tratarse de bge-small se infiere una arquitectura compacta de 12 capas y 384 dimensiones (dato no confirmado en la información proporcionada).

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de pares consulta-snippet, ni si hubo etapas de contraste negativo o minería de negativos duros. La model card indica explícitamente que las filas de entrenamiento y evaluación y los snippets de origen no se incluyen en el repositorio. Tampoco se documenta el método exacto de fusión del LoRA ni hiperparámetros de entrenamiento.

## Capacidades

- Generación de embeddings de texto y código para búsqueda semántica y recuperación (retrieval).
- Búsqueda de fragmentos de código a partir de consultas en lenguaje natural o en código.
- Ranking de candidatos mediante similitud coseno entre embeddings.
- Compatible con la API de SentenceTransformers (encode, encode_queries, encode_corpus) y con pipelines de retrieval tipo FAISS o similares.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo de embeddings, no generativo).
- Capacidades multilingües: no disponible; el modelo base es principalmente inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Búsqueda de código en repositorios internos: indexar los snippets de un monorepositorio y recuperar los fragmentos relevantes para una consulta en lenguaje natural, aprovechando la mejora de hit@1 de 0,650 a 0,825 reportada.
- Asistente de documentación técnica: dado un error o una descripción funcional, devolver los ejemplos de código y las funciones relacionadas del proyecto, con bajo coste de inferencia por el tamaño de 33 millones de parámetros.
- Autocompletado contextual en IDE: usar el modelo como recuperador de fragmentos similares antes de pasarlos a un modelo generativo, reduciendo el contexto necesario y el coste.
- Deduplicación y clustering de código: generar embeddings de funciones y agrupar implementaciones equivalentes o casi equivalentes mediante similitud coseno.
- Enrutamiento de consultas en soporte técnico: clasificar tickets o preguntas hacia el módulo de código o la documentación correspondiente según la similitud del embedding.
- RAG sobre bases de código: construir el índice vectorial de un proyecto y alimentar un LLM con los snippets recuperados, con un modelo de recuperación ligero que cabe en CPU.
- Búsqueda en documentación de API: indexar firmas de funciones y docstrings para resolver consultas de desarrolladores sobre parámetros y uso.

## Benchmarks y rendimiento

Resultados agregados held-out reportados en la model card (no se especifica el tamaño ni la composición del conjunto de evaluación):

| Metrica | Base (bge-small-en-v1.5) | Fine-tune (este modelo) |
|---|---|---|
| hit@1 | 0,650 | 0,825 |
| MRR | 0,7493 | 0,8703 |
| accuracy | 0,855 | 0,939 |
| Mediana de tiempo por lote de evaluacion | 2,488 s | 2,333 s |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible. El tiempo indicado corresponde a la mediana del lote completo de evaluación, no a la latencia por consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (33,36 M de parámetros, ~133 MB de pesos) y alrededor de 35-70 MB en fp16/int8; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, T4 e incluso en GPU integradas.
- Cabe en GPU de consumo y en CPU: es viable la inferencia en CPU para lotes pequeños, con latencia por consulta en el orden de milisegundos a decenas de milisegundos (no se publican cifras por consulta).
- Opciones de despliegue: SentenceTransformers (PyTorch), ONNX Runtime, Text Embeddings Inference (TEI) de Hugging Face, y exportación a GGUF para llama.cpp si se genera la conversión (no se proporciona un GGUF en el repositorio).
- Latencia y throughput: no disponibles más allá de la mediana de lote de evaluación (2,333 s para el lote completo, sin especificar su tamaño).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Harfusha/local-ai-hub-bge-small-en-v1-5-code | 33,36 M | no disponible | Embeddings para code retrieval | MIT | Hugging Face (0 descargas) |
| BAAI/bge-small-en-v1.5 | 33,36 M | 512 tokens (modelo base) | Embeddings de proposito general | MIT | Hugging Face (ampliamente usado) |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens (modelo base) | Embeddings de proposito general | MIT | Hugging Face |
| jinaai/jina-embeddings-v2-small-en | ~33 M | 8192 tokens | Embeddings de proposito general | Apache 2.0 | Hugging Face |

La comparación con alternativas especializadas en code retrieval (por ejemplo, modelos de la familia CodeBERT o embeddings entrenados sobre CodeSearchNet) no está disponible en la información proporcionada. El modelo de este análisis solo aporta ventaja documentada frente a su propio modelo base en el conjunto held-out del autor.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al derivar de un modelo entrenado principalmente en inglés, el rendimiento en otros idiomas es incierto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de recuperaciones irrelevantes: los embeddings pueden devolver fragmentos semánticamente próximos que no resuelven la consulta.
- La evaluación se realizó sobre un conjunto held-out no descrito (tamaño, dominio y composición desconocidos), por lo que las métricas no son directamente extrapolables a otros dominios de código.
- El modelo base bge-small-en-v1.5 tiene una ventana de 512 tokens; fragmentos de código más largos requerirán truncado o división en trozos, con posible pérdida de contexto.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y verificar los términos del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.
- No se incluyen los datos de entrenamiento ni los snippets de evaluación, lo que impide reproducir los resultados.
- No se proporcionan pesos en formato GGUF ni cuantizaciones listas para usar; habría que generarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harfusha/local-ai-hub-bge-small-en-v1-5-code
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Licencia del modelo base (MIT): https://huggingface.co/BAAI/bge-small-en-v1.5 (términos indicados en la model card)
- Paper de BGE (BAAI General Embedding): no disponible en la información proporcionada
- Repositorio o demo de Local AI Hub: no disponible en la información proporcionada
