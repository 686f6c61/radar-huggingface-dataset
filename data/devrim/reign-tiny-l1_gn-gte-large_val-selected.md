# devrim/reign-tiny-l1_gn-gte-large_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es un modelo de embeddings para recuperación de documentos largos, desarrollado por Devrim Cavusoglu y Emre Akbas. Este checkpoint concreto, `reign-tiny-l1_gn-gte-large_val-selected`, contiene únicamente el encoder cross-chunk de REIGN en su variante más pequeña (`tiny-l1`), que procesa secuencias de embeddings de chunks en lugar de tokens directamente. La red guía, `thenlper/gte-large` (335M parámetros), permanece congelada y se encarga de generar los embeddings de cada chunk de 512 tokens; el encoder REIGN, con solo 680.768 parámetros, agrega la secuencia de embeddings mediante pooling medio para producir una representación final del documento.

El modelo resuelve el problema del escalado de contexto en recuperación de documentos largos: en lugar de procesar todo el documento como una secuencia de tokens (lo que sería costoso), descompone el texto en chunks, los codifica con una red guía eficiente y luego combina los embeddings resultantes con un encoder ligero. Esto permite manejar documentos de longitud arbitraria con un coste computacional reducido. La relevancia actual radica en que los sistemas RAG y de búsqueda semántica necesitan manejar documentos extensos sin degradar el rendimiento ni disparar el consumo de memoria.

El checkpoint fue seleccionado por su mejor nDCG@10 en la partición de validación del dataset `devrim/goodwiki_long_synthetic_ir`, y reporta un nDCG@10 de 65.49 en el test de GoodWiki-Long con stride de evaluación 384. Está licenciado bajo Apache 2.0 y soporta únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (1 capa, d=192, 3 cabezas, FFN 768) + red guía GTE-large congelada (335M) |
| Parametros totales | 680.768 (encoder REIGN; la red guía añade 335M adicionales) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Depende del número de chunks; chunk size 512 tokens, stride 384 (evaluación) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida de dos etapas. La primera etapa es una red guía (guidance network) basada en `thenlper/gte-large`, un transformer BERT-like de 335M parámetros que se mantiene congelada durante el entrenamiento. Esta red procesa cada chunk de 512 tokens de forma independiente y produce embeddings de chunk. La segunda etapa es el encoder REIGN propiamente dicho, un transformer ligero de una sola capa con dimensión 192, 3 cabezas de atención y FFN de 768 unidades, que recibe la secuencia de embeddings de chunk y aplica pooling medio sobre ella. El encoder es permutation-equivariant, es decir, no utiliza señales de posición, por lo que el orden de los chunks no influye en la representación final.

El entrenamiento se realizó sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir`, que contiene pares de documentos largos con anotaciones de relevancia graduada. Se utilizó una función de pérdida de coseno embedding a tres vías con objetivos en {1, 0, −1} y peso parcial λ = 0.5. El optimizador fue AdamW con learning rate 1e-5, weight decay 1e-4 y programación de coseno. Se entrenaron 50 épocas con validación cada 4, seleccionando el checkpoint con mejor nDCG@10 en validación. Se usó precisión mixta de 16 bits y una GPU de 24 GB. Los embeddings de la red guía se precomputaron y cachearon para acelerar el entrenamiento. El paper asociado, *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, está aceptado en Findings of EMNLP 2026.

## Capacidades

- Generación de embeddings de documentos largos: el modelo produce vectores L2-normalizados de dimensión 192 (la salida del encoder REIGN) que representan documentos completos, independientemente de su longitud.
- Recuperación documento-a-documento: diseñado específicamente para retrieval donde tanto consultas como documentos pueden ser extensos.
- Procesamiento de secuencias de chunks: acepta un número arbitrario de embeddings de chunk (generados por la red guía) y los agrega mediante pooling medio.
- Permutation-equivariance: el orden de los chunks no afecta al resultado, lo que simplifica el procesamiento de documentos con estructura no secuencial.
- Integración con la red guía GTE-large: el checkpoint incluye la configuración para cargar la red guía congelada y el encoder REIGN conjuntamente.
- No es un modelo generativo: no genera texto, solo produce representaciones vectoriales.

## Casos de uso

- Búsqueda semántica en corpus de documentos legales: un sistema puede indexar contratos o sentencias largas dividiéndolos en chunks, codificarlos con GTE-large y agregarlos con REIGN para obtener un embedding por documento. Las consultas, también largas, se procesan de la misma manera, y la similitud coseno permite recuperar los documentos más relevantes.
- Sistemas RAG con documentos extensos: en un pipeline de generación aumentada por recuperación, REIGN permite recuperar pasajes o documentos completos de manuales técnicos o informes de investigación sin truncar el contexto, mejorando la calidad de las respuestas generadas.
- Deduplicación de documentos: al generar embeddings estables para documentos largos, se pueden detectar duplicados o versiones casi idénticas en grandes colecciones, útil en gestión de contenidos o limpieza de datos.
- Clasificación de documentos por similitud temática: los embeddings producidos pueden alimentar algoritmos de clustering o clasificación para organizar bibliotecas de documentos extensos, como artículos científicos o patentes.
- Recuperación de información en bases de conocimiento empresarial: integrado en motores de búsqueda internos, permite consultar wikis corporativas o documentación técnica de productos con consultas de varias páginas.
- Evaluación de relevancia en datasets de retrieval: el modelo puede servir como componente de un sistema de reranking o como baseline en experimentos de recuperación de documentos largos, gracias a su bajo coste computacional.

## Benchmarks y rendimiento

La model card reporta un único resultado para este checkpoint exacto:

| Benchmark | Metrica | Eval stride | Valor |
|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | s384 | 65.49 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El paper asociado (EMNLP 2026 Findings) contiene tablas adicionales, pero no se dispone de ellas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder REIGN ocupa aproximadamente 2,7 MB en float32 (680.768 parámetros × 4 bytes). La red guía GTE-large ocupa unos 1,34 GB en float32 (335M × 4 bytes). En total, unos 1,35 GB, más el overhead de activaciones y el cache de embeddings.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Se puede ejecutar en GPUs consumer como RTX 3060, RTX 4090, o incluso en CPU con memoria RAM suficiente (el modelo completo cabe en ~2 GB de RAM).
- Cabe en GPU consumer: sí, con holgura. El entrenamiento se realizó en una GPU de 24 GB, pero la inferencia es mucho más ligera.
- Opciones de despliegue: el repositorio oficial proporciona una API Python (`ReignBaselineEncoder`) que gestiona la carga de ambos componentes. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo. Se puede servir como servicio de embeddings mediante frameworks como FastAPI o TEI (Text Embeddings Inference) si se adapta.
- Latencia y throughput: no se han publicado mediciones específicas. Dado el tamaño reducido del encoder y el uso de embeddings de chunk precomputados, la latencia dominante proviene de la red guía GTE-large al procesar cada chunk. Para documentos de 10.000 tokens (unos 20 chunks), se estima un tiempo de inferencia del orden de decenas de milisegundos en GPU moderna, pero este dato no está confirmado por el autor.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de embeddings de documentos largos (como GTE, E5, o modelos específicos de retrieval de contexto largo). El paper de REIGN incluye comparaciones, pero no están disponibles en la documentación pública consultada. Se puede indicar que, frente a alternativas como `thenlper/gte-large` (que procesa solo 512 tokens), REIGN extiende la capacidad a documentos completos con un coste adicional mínimo, pero no hay datos numéricos publicados en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para entradas multi-chunk (documentos largos). Para textos más cortos que el chunk size (512 tokens), el encoder REIGN no tiene nada que agregar y el modelo no debe utilizarse; en ese caso se recomienda usar la red guía directamente.
- Solo soporta inglés. No hay evidencia de rendimiento en otros idiomas.
- El encoder es permutation-equivariant, por lo que ignora el orden de los chunks. Esto puede ser una limitación si la estructura secuencial del documento es relevante para la tarea.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto.
- Sesgos: al estar entrenado sobre Wikipedia (a través de GoodWiki), puede heredar sesgos presentes en ese corpus, como sesgos de género, geográficos o culturales.
- Licencia: Apache 2.0 permite uso comercial, pero el dataset de entrenamiento `devrim/goodwiki_long_synthetic_ir` está bajo CC BY-SA 4.0, lo que podría imponer obligaciones de compartir derivados si se redistribuyen modelos entrenados con él. Conviene revisar los términos exactos.
- El entrenamiento con precisión mixta no es bit-reproducible; un reentrenamiento no producirá pesos idénticos, aunque las métricas deberían ser comparables.
- No se han publicado resultados de cuantización ni de rendimiento en hardware específico, por lo que las estimaciones de latencia son orientativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-tiny-l1_gn-gte-large_val-selected
- Repositorio de código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset de entrenamiento: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (to appear).
