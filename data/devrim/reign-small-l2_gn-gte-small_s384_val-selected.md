# devrim/reign-small-l2_gn-gte-small_s384_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es un enfoque para escalar la longitud de contexto en modelos de embeddings de documentos sin aumentar el coste computacional de forma cuadrática. Este checkpoint concreto, `reign-small-l2_gn-gte-small_s384_val-selected`, es un codificador cross-chunk de la variante `small-l2` entrenado sobre una red guía congelada GTE-small (33M de parámetros). En lugar de procesar tokens directamente, el modelo lee una secuencia de embeddings de chunks previamente generados por la red guía, agregándolos mediante una función de pooling sobre la secuencia. Esto permite manejar documentos arbitrariamente largos con un coste lineal en el número de chunks.

El modelo tiene 3,85 millones de parámetros entrenables (el codificador REIGN en sí) y se entrenó sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir` con una pérdida de coseno de tres vías. Está diseñado específicamente para retrieval documento-a-documento en escenarios multi-chunk, donde los documentos superan la ventana de contexto de la red guía (512 tokens). Los resultados reportados en la paper (Findings of EMNLP 2026) muestran un nDCG@10 de 67,67 en GoodWiki-Long test y 68,03 en LoCo (zero-shot, macro-avg) con stride de evaluación 384. Su relevancia radica en ofrecer una alternativa eficiente a los modelos de embeddings de contexto largo, con un coste de entrenamiento e inferencia muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (2 capas, d=384, 6 cabezas, FFN 1536) + red guía congelada GTE-small (33M) |
| Parametros totales | 3.845.376 (solo codificador REIGN; la red guía añade 33M congelados) |
| Parametros activos | 3.845.376 (todos los parámetros del codificador son activos; la red guía no se entrena) |
| Longitud de contexto | 512 tokens por chunk (ventana de la red guía); el número de chunks es ilimitado |
| Tipos de cuantizacion | no disponible (los pesos se publican en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura REIGN: un codificador transformer ligero (2 capas, dimensión 384, 6 cabezas de atención, FFN de 1536) que opera sobre una secuencia de embeddings de chunks. Estos embeddings son generados por una red guía congelada (GTE-small, 33M de parámetros) que procesa cada chunk de 512 tokens de forma independiente. El codificador REIGN agrega la secuencia mediante pooling medio, produciendo un vector L2-normalizado para el documento completo. No se utiliza señal de posición: el codificador es una función invariante a permutaciones de chunks, lo que simplifica el modelo y evita sobreajustes a ordenaciones específicas.

El entrenamiento se realizó con una pérdida de coseno de tres vías (positivo, parcial, negativo) con peso λ=0,5 para los pares parciales. Se usaron lotes de 18 anclas, cada una con 1 positivo, 2 parciales y 17 negativos in-batch (360 pares por paso). El optimizador fue AdamW con learning rate 1e-5, weight decay 1e-4 y annealing coseno, durante 50 épocas con validación cada 4. La selección del checkpoint se hizo por mejor nDCG@10 en la partición de validación. Se empleó precisión mixta de 16 bits y los embeddings de la red guía se precomputaron y cachearon para acelerar el entrenamiento, que se ejecutó en una única GPU de consumo con 24 GB de VRAM.

## Capacidades

- Generación de embeddings de documentos largos: procesa documentos de cualquier longitud dividiéndolos en chunks de 512 tokens y agregando sus embeddings mediante pooling medio.
- Retrieval documento-a-documento: optimizado para búsqueda semántica donde tanto consultas como documentos pueden superar la ventana de contexto de la red guía.
- Zero-shot en benchmarks de retrieval de documentos largos: reporta resultados en LoCo y DAPFAM sin fine-tuning adicional.
- Invariante a la posición de los chunks: el codificador no utiliza señales posicionales, lo que lo hace robusto a reordenaciones de secciones del documento.
- Integración con la red guía GTE-small: requiere cargar ambos componentes (codificador REIGN + red guía) para la inferencia.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Búsqueda semántica en corpus de documentos extensos (informes, artículos científicos, expedientes legales): el modelo indexa documentos completos sin truncarlos, permitiendo recuperar pasajes relevantes incluso cuando la consulta y el documento superan los 512 tokens.
- Sistemas RAG (Retrieval-Augmented Generation) sobre bases de conocimiento largas: se puede usar como retriever para alimentar a un LLM generativo con fragmentos de documentos completos, mejorando la fidelidad de las respuestas.
- Deduplicación y agrupación de documentos: al generar embeddings de documentos enteros, facilita la detección de duplicados o la agrupación por similitud temática en colecciones grandes.
- Clasificación de documentos por contenido: los embeddings pueden alimentar clasificadores supervisados para tareas como categorización de artículos o detección de tópicos.
- Sistemas de recomendación basados en contenido: comparar la similitud entre documentos largos (por ejemplo, informes técnicos o patentes) para sugerir ítems relacionados.
- Indexación de archivos corporativos para búsqueda interna: permite a empleados buscar en manuales, políticas o actas de reuniones completas sin perder contexto por truncamiento.

## Benchmarks y rendimiento

Los siguientes resultados son los reportados en la paper para este checkpoint exacto (no se han re-derivado aquí).

| Benchmark | Metrica | Eval stride | Valor |
|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | s384 | 67,67 |
| LoCo (macro-avg, zero-shot) | nDCG@10 | s384 | 68,03 |
| LoCo (macro-avg, zero-shot) | nDCG@10 | s512 | 67,72 |
| DAPFAM test (zero-shot) | nDCG@100 | s384 | 30,68 |
| DAPFAM test (zero-shot) | nDCG@100 | s512 | 30,60 |

No se han publicado comparaciones con otros modelos en los mismos benchmarks dentro de la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el codificador REIGN ocupa ~15 MB en float32 (3,85M parámetros × 4 bytes) y la red guía GTE-small ~132 MB (33M × 4 bytes). Con overhead de activaciones y caché, el consumo total es inferior a 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (por ejemplo, GTX 1650, RTX 3050, etc.). El entrenamiento se realizó en una GPU de 24 GB, pero la inferencia es mucho más ligera.
- Cabe en GPUs consumer: sí, incluso en las más modestas.
- Opciones de despliegue: el modelo se usa mediante el paquete `reign` (instalable desde GitHub) y requiere cargar el checkpoint junto con la red guía. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un LLM generativo.
- Latencia y throughput: no disponible. Depende del número de chunks y del hardware; al ser un modelo pequeño, se espera una latencia muy baja en comparación con modelos de embeddings de contexto largo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de embeddings de documentos largos (como GTE-large, BGE-M3 o E5-Mistral) en los mismos benchmarks. El modelo base GTE-small (33M) es la red guía, pero no se reportan sus métricas en GoodWiki-Long o LoCo. Por tanto, la comparativa cuantitativa no está disponible. Cualitativamente, REIGN-small-l2 ofrece una alternativa mucho más ligera (3,85M parámetros entrenables) frente a modelos de contexto largo que suelen superar los 100M de parámetros, a costa de requerir la red guía congelada y estar limitado al inglés.

## Limitaciones y advertencias

- No apto para inputs cortos: si el documento es más corto que el chunk size (512 tokens), el codificador REIGN no tiene nada que agregar y el modelo no debe usarse; en ese régimen se recomienda usar la red guía directamente.
- Solo inglés: el modelo se entrenó y evalúa únicamente en inglés; su rendimiento en otros idiomas no está garantizado.
- Dependencia de la red guía: el checkpoint no es autónomo; requiere cargar GTE-small por separado, lo que añade complejidad de despliegue.
- Sin capacidad generativa: no puede producir texto, solo embeddings. No es adecuado para tareas de generación o chat.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo.
- Sesgos: al entrenarse sobre Wikipedia (vía GoodWiki), puede heredar sesgos presentes en ese corpus, aunque no se han evaluado explícitamente.
- Reproducibilidad: el entrenamiento con precisión mixta no es bit-reproducible; un reentrenamiento no producirá pesos idénticos.
- Licencia del dataset: el dataset de entrenamiento se distribuye bajo CC BY-SA 4.0, lo que puede imponer restricciones de atribución o share-alike en usos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-small-l2_gn-gte-small_s384_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (to appear).
