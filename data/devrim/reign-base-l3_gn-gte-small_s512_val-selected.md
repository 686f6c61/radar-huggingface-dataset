# devrim/reign-base-l3_gn-gte-small_s512_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es un enfoque para escalar la longitud de contexto en modelos de embeddings de documentos sin aumentar el coste computacional de forma lineal. Este checkpoint concreto, `reign-base-l3_gn-gte-small_s512_val-selected`, es un cross-chunk encoder de la familia REIGN que procesa secuencias de embeddings de chunks previamente calculados por una red guía congelada (GTE-small), en lugar de operar directamente sobre tokens. De esta forma, un documento largo se divide en fragmentos de 512 tokens, cada uno se codifica con GTE-small, y el encoder REIGN agrega esos embeddings para producir una representación final del documento.

El modelo está desarrollado por Devrim Cavusoglu y se presenta en el paper *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, aceptado en Findings of EMNLP 2026. Resuelve el problema del coste cuadrático de la atención en documentos extensos, logrando una latencia de inferencia 49,3 veces menor que re-ejecutar la red guía sobre todos los chunks, manteniendo un rendimiento competitivo en retrieval de documentos largos. El checkpoint contiene únicamente los pesos del encoder REIGN (22,15 millones de parámetros), mientras que la red guía GTE-small (33 millones) se carga por separado y permanece congelada. La pila combinada suma 55 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 3 capas (d=768, 12 cabezas, FFN 3072) + red guía GTE-small congelada (33M) |
| Parametros totales | 22.150.656 (solo encoder REIGN; pila combinada: 55M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens por chunk (ventana de la red guía); sin límite explícito en el número de chunks |
| Tipos de cuantizacion | float32 (no se documentan cuantizaciones) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

REIGN es un bi-encoder de documentos largos que combina dos componentes: una red guía (guidance network) congelada, en este caso GTE-small, que codifica cada chunk de 512 tokens en un embedding, y un cross-chunk encoder (el modelo REIGN propiamente dicho) que recibe la secuencia de embeddings de chunks y produce una representación agregada del documento. El encoder REIGN es un transformer de 3 capas con 768 dimensiones ocultas, 12 cabezas de atención y FFN de 3072 unidades. No utiliza señal de posición de chunk, por lo que actúa como una función simétrica sobre el conjunto de embeddings; el pooling final es la media sobre la secuencia de chunks.

El entrenamiento se realizó sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir`, con una pérdida de embedding coseno de tres vías (positivo, parcial y negativo) con peso parcial λ = 0,5. Se usaron 18 anclas por lote, cada una con 1 positivo, 2 parciales y 17 negativos intra-lote (360 pares por paso). El optimizador fue AdamW con learning rate 1e-5, weight decay 1e-4 y annealing coseno, durante 50 épocas con validación cada 4. La selección del checkpoint se hizo por mejor nDCG@10 en la partición de validación. Se empleó precisión mixta de 16 bits y semilla 42, en una única GPU de 24 GB. Los embeddings de la red guía se precomputaron y cachearon para acelerar el entrenamiento.

## Capacidades

- Retrieval de documentos largos (document-to-document): el modelo está diseñado específicamente para recuperar documentos completos a partir de consultas también largas, superando las limitaciones de ventana de los modelos de embeddings convencionales.
- Agregación de embeddings de chunks: procesa secuencias de embeddings pre-calculados, lo que permite escalar a documentos de longitud arbitraria sin re-codificar tokens.
- Zero-shot en benchmarks de retrieval de documentos largos: reporta resultados sin fine-tuning adicional en LoCo y DAPFAM.
- Generación de embeddings L2-normalizados: la salida está normalizada, por lo que la similitud coseno se reduce a un producto escalar.
- Inferencia eficiente con caché: si los embeddings de chunks ya están cacheados, la latencia por consulta es de 0,4 ms, frente a 19,8 ms si se re-ejecuta la red guía.
- Integración con Hugging Face: el checkpoint es un `PreTrainedModel` que consume `inputs_embeds`, y se acompaña de un `ReignFeatureExtractor` para la red guía con caché en disco.

## Casos de uso

- Búsqueda semántica en corpus de documentos legales extensos: un despacho de abogados puede indexar contratos y sentencias de cientos de páginas. El modelo procesa cada documento en chunks de 512 tokens, genera embeddings y permite recuperar los documentos más relevantes a una consulta larga (por ejemplo, una cláusula completa) con latencia de 0,4 ms por consulta si los embeddings están cacheados.
- Recuperación de artículos científicos en repositorios académicos: dado un paper completo como consulta, el sistema devuelve otros papers relacionados. REIGN maneja documentos de decenas de miles de tokens sin truncamiento, algo que los modelos de embeddings estándar no pueden hacer sin perder información.
- Indexación de manuales técnicos y documentación interna de empresa: una base de conocimiento corporativa con guías de producto, procedimientos y troubleshooting puede ser indexada con REIGN. Los empleados formulan consultas largas (descripciones de problemas) y obtienen los manuales relevantes.
- Sistemas de recomendación de contenido editorial: para plataformas de noticias o blogs, el modelo puede emparejar artículos largos entre sí (document-to-document) para sugerir lecturas relacionadas, superando la limitación de ventana de modelos como GTE-small.
- Deduplicación de documentos en grandes volúmenes de datos: en pipelines de ingestión de datos, REIGN permite comparar documentos largos completos para detectar duplicados o versiones casi idénticas, usando la similitud coseno de los embeddings generados.
- Análisis de contratos y comparación de cláusulas: en el sector legal, se pueden comparar contratos completos entre sí para identificar diferencias o similitudes estructurales, algo que requiere contexto largo y que REIGN resuelve con su arquitectura de chunks.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para este checkpoint exacto, tal como aparecen en el paper:

| Benchmark | Metrica | Eval stride | Valor |
|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | s512 | 67,09 |
| LoCo (macro-avg, zero-shot) | nDCG@10 | s512 | 68,92 |
| DAPFAM test (zero-shot) | nDCG@100 | s512 | 31,69 |

Coste de inferencia medido (paper, Tabla 11, Apéndice G):

| Configuracion | ms / consulta | Pico GPU (GB) |
|---|---|---|
| Red guía sola, mean-pool por chunks | 23,0 | — |
| REIGN, caché fría (re-ejecutando red guía) | 19,8 | 0,35 |
| REIGN, embeddings de chunks cacheados | 0,4 | 0,24 |

Protocolo: 500 documentos de corpus, 100 consultas, batch 8, una iteración de calentamiento y tres repeticiones temporizadas en una GPU de consumo de 24 GB. Con caché, la latencia por consulta es 49,3 veces menor que re-ejecutar la red guía; sin caché, el rendimiento es equivalente al de la línea base de la red guía por chunks.

## Requisitos de hardware

- VRAM estimada: 0,24 GB de pico de GPU con caché de embeddings; 0,35 GB sin caché (según mediciones del paper).
- GPU recomendada: cualquier GPU de consumo con al menos 4 GB de VRAM es suficiente para inferencia; el entrenamiento se realizó en una GPU de 24 GB (por ejemplo, RTX 3090 o RTX 4090).
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU moderna, incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al ser un `PreTrainedModel` de Hugging Face, se puede servir con Transformers, o mediante frameworks compatibles con safetensors. No se documenta soporte específico para vLLM, llama.cpp u Ollama, pero al ser un modelo de embeddings (no generativo), el despliegue típico es mediante una API de embeddings o un servicio de búsqueda vectorial.
- Latencia: 0,4 ms por consulta con caché; 19,8 ms sin caché (medido en GPU de 24 GB, batch 8).

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la información proporcionada. Sin embargo, se puede comparar con su modelo base y con alternativas de la misma categoría:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| REIGN base-l3 (este checkpoint) | 22,15M (encoder) + 33M (guía congelada) | 512 tokens por chunk, sin límite de chunks | Cross-chunk encoder sobre embeddings de chunks | Apache-2.0 |
| GTE-small (thenlper) | 33M | 512 tokens | Bi-encoder estándar sobre tokens | Apache-2.0 |
| Longformer (allenai) | 149M | 4096 tokens | Transformer con atención dispersa | Apache-2.0 |
| BigBird (google) | 128M | 4096 tokens | Transformer con atención dispersa | Apache-2.0 |

REIGN se diferencia de Longformer y BigBird en que no procesa tokens directamente, sino embeddings de chunks, lo que reduce drásticamente el coste computacional para documentos muy largos. Frente a GTE-small, REIGN añade la capacidad de agregar múltiples chunks, superando la ventana de 512 tokens del modelo base. No se han publicado comparativas numéricas con estos modelos en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés: la red guía GTE-small está entrenada principalmente en inglés, y el dataset de entrenamiento es exclusivamente en inglés. No se recomienda su uso para otros idiomas.
- No apto para inputs cortos: si el documento es más corto que el chunk size (512 tokens), el encoder REIGN no tiene nada que agregar y el modelo degenera al comportamiento de la red guía. Para ese régimen, se debe usar GTE-small directamente.
- Sin señal de posición de chunk: el encoder es invariante a la permutación de chunks, lo que puede ser una limitación si el orden de los fragmentos es relevante para la tarea (por ejemplo, en narrativas o documentos con estructura secuencial).
- Entrenamiento no reproducible bit a bit: el uso de precisión mixta de 16 bits impide reproducir exactamente los mismos pesos, incluso con la misma semilla. Se deben comparar métricas, no pesos.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación es nulo en ese sentido. Sin embargo, la calidad de la recuperación depende de la calidad de los embeddings; en dominios muy especializados fuera del inglés general, el rendimiento puede degradarse.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente y mantener el aviso de licencia.
- Dependencia de la red guía: el checkpoint no incluye la red guía; es necesario cargar `thenlper/gte-small` por separado, lo que añade un paso de integración y un requisito de memoria adicional (33M de parámetros).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devrim/reign-base-l3_gn-gte-small_s512_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset de entrenamiento: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Red guía (GTE-small): https://huggingface.co/thenlper/gte-small
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of ACL: EMNLP 2026 (to appear).
