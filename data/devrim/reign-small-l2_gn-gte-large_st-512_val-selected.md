# devrim/reign-small-l2_gn-gte-large_st-512_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es un modelo de embeddings para recuperación de documentos largos desarrollado por Devrim Cavuşoğlu y Emre Akbaş, presentado en Findings of EMNLP 2026. El checkpoint `reign-small-l2_gn-gte-large_st-512_val-selected` contiene un codificador cross-chunk de 2 capas (3,85 millones de parámetros entrenables) que procesa una secuencia de embeddings de chunks generados por una red de guía congelada, en este caso GTE-large (335 millones de parámetros). En lugar de atender directamente sobre tokens, el modelo agrega representaciones de fragmentos de 512 tokens mediante pooling medio, lo que permite escalar el contexto a documentos completos sin aumentar el coste cuadrático de la atención.

Este enfoque resuelve el problema de la limitación de contexto en los modelos de embeddings tradicionales, que suelen truncar documentos largos o perder información al promediar embeddings de frases. REIGN es relevante porque ofrece una alternativa eficiente para tareas de retrieval documento-a-documento, donde el contenido completo del documento debe ser considerado. El modelo está entrenado sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir` y reporta un nDCG@10 de 67,27 en el test de GoodWiki-Long con stride 512.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-chunk de 2 capas (d=384, 6 cabezas, FFN 1536) sobre embeddings de chunks de GTE-large congelado |
| Parametros totales | 4.092.416 (solo el encoder REIGN; la red de guía GTE-large tiene 335M y se carga aparte) |
| Parametros activos | No aplica (modelo denso, todos los parámetros se usan) |
| Longitud de contexto | 512 tokens por chunk; número de chunks ilimitado (secuencia de embeddings) |
| Tipos de cuantizacion | No disponible (solo safetensors en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (el dataset de entrenamiento es CC BY-SA 4.0) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN emplea una arquitectura de dos niveles. Primero, la red de guía (GTE-large, congelada) divide el documento en chunks de 512 tokens con stride 512 (sin solapamiento) y genera un embedding para cada chunk. Estos embeddings se cachean en disco durante el entrenamiento. Después, el codificador REIGN, un transformer de 2 capas con dimensiones reducidas (d=384, 6 cabezas, FFN 1536), procesa la secuencia de embeddings de chunks como si fuera una secuencia de tokens, aplicando pooling medio sobre la secuencia para obtener la representación final del documento. No se utiliza ninguna señal de posición, por lo que el modelo es una función simétrica de conjunto, invariante al orden de los chunks.

El entrenamiento se realizó con una pérdida coseno de tres vías sobre pares de documentos con grados de relevancia (positivo, parcial, negativo) y peso λ=0,5. Se usó AdamW con learning rate 1e-5, weight decay 1e-4, cosine annealing, 50 épocas con validación cada 4, y selección del checkpoint por mejor nDCG@10 en validación. La precisión fue mixta de 16 bits y los embeddings de la red de guía se precomputaron y cachearon. El entrenamiento se ejecutó en una GPU de consumo de 24 GB. La receta completa está documentada en el repositorio.

## Capacidades

- Generación de embeddings densos para documentos largos completos, sin truncamiento.
- Recuperación documento-a-documento (retrieval) mediante similitud coseno (los vectores están normalizados L2).
- Procesamiento de secuencias de chunks de longitud variable, gracias a la agregación por pooling medio.
- Soporte de múltiples chunks: el modelo agrega información de todos los chunks del documento.
- No es un modelo generativo: solo extracción de características (feature extraction).
- No dispone de tool calling, capacidades de agente, visión ni audio.
- Multilingüe limitado: entrenado únicamente en inglés, aunque la red de guía GTE-large soporta más idiomas, el modelo no ha sido evaluado en otros.

## Casos de uso

- Búsqueda semántica en corpus de documentos extensos: permite indexar artículos de Wikipedia completos o informes largos y recuperarlos por similitud de contenido íntegro, sin perder información por truncamiento.
- Recuperación de pasajes en documentos legales o técnicos: al procesar el documento completo, el modelo puede encontrar documentos relevantes para una consulta aunque el pasaje clave esté en una sección intermedia.
- Deduplicación de documentos en bases de datos grandes: comparar la similitud coseno entre embeddings de documentos completos para identificar duplicados o versiones casi idénticas.
- Sistemas de recomendación de artículos académicos: generar embeddings de papers completos (incluyendo referencias y apéndices) para recomendar trabajos relacionados por similitud temática global.
- Clustering de documentos por temática: agrupar documentos largos (tesis, expedientes, manuales) en categorías basadas en la representación semántica completa.
- Indexación para respuesta a preguntas sobre documentos largos: como paso previo a un sistema generativo, el modelo puede recuperar los documentos más relevantes de una colección extensa para pasarlos a un LLM.
- Análisis de similitud entre informes o propuestas: comparar la similitud semántica de documentos completos en entornos empresariales o de investigación.

## Benchmarks y rendimiento

El único resultado reportado en la model card para este checkpoint exacto es:

| Benchmark | Métrica | Eval stride | Valor |
|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | s512 | 67,27 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder REIGN ocupa unos 16 MB en float32 (4M parámetros), mientras que la red de guía GTE-large requiere aproximadamente 1,3 GB en float32 (335M parámetros). En total, menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas de consumo como RTX 3060, RTX 4090, o incluso integradas si se usa CPU. El entrenamiento se realizó en una GPU de 24 GB, pero la inferencia es mucho más ligera.
- Puede ejecutarse en GPU de consumo (RTX 3060, 4090, etc.) y también en CPU, aunque con mayor latencia.
- Opciones de despliegue: el paquete `reign` desde GitHub (pip install git+https://github.com/devrimcavusoglu/reign.git). El modelo es compatible con HuggingFace Transformers al ser una subclase de `PreTrainedModel`. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de embeddings de documentos largos en la información proporcionada. El modelo se basa en GTE-large, que es su red de guía, pero no hay datos de rendimiento relativo frente a alternativas como Longformer, BGE o E5. La única referencia es el resultado en GoodWiki-Long, sin comparación directa.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; su rendimiento en otros idiomas no ha sido evaluado.
- No es adecuado para entradas cortas (menos de un chunk de 512 tokens): en ese régimen, la red de guía por sí sola es suficiente y el codificador REIGN no aporta valor.
- El checkpoint solo contiene los pesos del encoder REIGN; la red de guía GTE-large debe cargarse por separado y permanece congelada.
- El dataset de entrenamiento es sintético (GoodWiki-Long-Synthetic) y puede no representar la diversidad de dominios reales, lo que podría afectar la generalización.
- Al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación no aplica directamente, pero la calidad de los embeddings depende de la calidad de la red de guía.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento se distribuye bajo CC BY-SA 4.0, lo que implica obligaciones de share-alike si se redistribuye el modelo o sus derivados basados en ese dataset.
- No se han documentado sesgos específicos, pero al estar entrenado sobre Wikipedia (vía GoodWiki), puede heredar sesgos presentes en ese corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-small-l2_gn-gte-large_st-512_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (to appear).
