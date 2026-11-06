# fse/glove-wiki-gigaword-300-sif10-float16

## Resumen

`fse/glove-wiki-gigaword-300-sif10-float16` es un modelo de embeddings estaticos de palabras y frases en ingles, derivado de la tabla GloVe entrenada sobre Wikipedia y Gigaword (300 dimensiones). No es un transformer: se trata de una tabla de 400.000 filas por 300 dimensiones en float16, sobre la que se aplica una media ponderada por frecuencias (SIF, *smooth inverse frequency*) de las filas de cada token y una normalizacion final a longitud unitaria. El vector de una frase es, por tanto, una combinacion lineal fija de los vectores de sus palabras, sin atencion ni contexto dinamico.

Lo publica el usuario `fse` como parte del ecosistema de la libreria [Fast Sentence Embeddings](https://github.com/oborchers/Fast_Sentence_Embeddings) (fse), que ofrece una alternativa ligera y determinista a los sentence transformers para tareas de similitud semantica y recuperacion. La variante `sif10` incorpora pesos SIF con `a=0.001` y la eliminacion de diez componentes principales estimados sobre un corpus de 859.346 parrafos de `HuggingFaceFW/fineweb-edu-llama3-annotations`, plegados directamente en la tabla para que la codificacion sea una simple media.

Su relevancia practica es la de los embeddings estaticos: inferencia en CPU a muy bajo coste, huella de memoria de unos 246 MB y resultados reproducibles bit a bit en el backend de CPU. En las 1.379 parejas de test de STS-B obtiene un Pearson x100 de 69,22, muy por encima del 44,46 del promedio crudo de vectores, lo que lo situa como una linea base solida cuando no se dispone de GPU o se necesita latencia minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (tabla de palabras + pooling SIF-10 + normalizacion L2) |
| Parametros totales | 123.356.475 (400.000 filas x 300 dimensiones en float16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (pooling sobre todos los tokens del texto, sin ventana definida) |
| Tipos de cuantizacion | float32, float16 e int8 (float16 en esta variante) |
| Idiomas soportados | ingles (`en`) |
| Licencia | PDDL (Public Domain Dedication and License) |
| Formato de pesos | safetensors, empaquetado para la libreria `fse` (requiere fse >= 2.0) |

## Arquitectura y entrenamiento

La arquitectura es un *bag of words* ponderado. Cada texto se tokeniza con `fse_words@1`, se buscan las filas correspondientes en la tabla de 400.000 entradas y se calcula la media de los vectores ponderada por `a/(a+p(w))` con `a=0.001`, donde `p(w)` es la frecuencia relativa de la palabra en ingles segun wordfreq 3.1.1. A continuacion se restan las proyecciones sobre diez componentes principales no centrados, estimados sobre 859.346 parrafos del corpus `HuggingFaceFW/fineweb-edu-llama3-annotations` (revision `72df4c92...`, semilla 0), y se normaliza el resultado a norma unitaria. Los pesos y componentes se pliegan en la tabla, de modo que la codificacion en tiempo de inferencia es una media directa.

La tabla se obtiene por cuantizacion a float16 desde la tabla float32 `xxh3-128:a528d399d7e9d11cf5ebec5f45e668d7` mediante la operacion `quantize_rows@1`; el modelo base es `fse/glove-wiki-gigaword-300` (revision `4e5ad402664236b85be45a0d107b95259ba8a909`). No hay entrenamiento neuronal, RLHF ni ajuste fino supervisado: los unicos pasos "aprendidos" son los pesos de frecuencia y los componentes SIF. La seleccion del corpus de componentes se guio por la media de Pearson y Spearman en STS-B y del nDCG@10 macro en NanoBEIR, por lo que esas metricas no son estimaciones limpias sobre un *holdout* intacto.

## Capacidades

- Extraccion de features y embeddings de frases y documentos cortos en ingles (pipeline `feature-extraction`).
- Similitud semantica entre textos mediante coseno sobre vectores normalizados.
- Recuperacion densa de pasajes (*dense retrieval*) en ingles, con vectores de 300 dimensiones aptos para indices FAISS o similares.
- Clasificacion de texto por similitud a prototipos o *kNN* sobre embeddings.
- Clustering y deduplicacion semantica de documentos.
- Codificacion determinista y reproducible bit a bit en el backend de CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo *thinking*.
- Capacidad multilingue nula: solo ingles.

## Casos de uso

- Busqueda semantica sobre documentacion tecnica en ingles: indexar parrafos con el encoder y consultar por similitud coseno en un indice FAISS; los vectores de 300 dimensiones en float16 ocupan unos 600 bytes por pasaje, lo que permite millones de entradas en memoria.
- Deduplicacion de corpus de entrenamiento: agrupar parrafos con similitud alta para eliminar duplicados semanticos antes de entrenar otros modelos, aprovechando el bajo coste de codificar millones de textos en CPU.
- Filtrado y enrutado de tickets de soporte en ingles: asignar cada ticket a una cola comparando su embedding con prototipos de cada categoria, con latencia de microsegundos por peticion y sin GPU.
- Linea base en evaluacion de modelos: usar el 69,22 de Pearson x100 en STS-B como referencia minima contra la que medir sentence transformers mas costosos en tareas de similitud.
- Clasificacion few-shot con kNN: etiquetar resenas o comentarios usando un pequeno conjunto etiquetado y votacion por vecinos sobre los embeddings, sin reentrenar.
- Deteccion de contenido duplicado o casi duplicado en pipelines de moderacion: comparar cada mensaje entrante con una memoria de mensajes previos mediante coseno sobre vectores normalizados.
- Recuperacion aumentada ligera en entornos sin GPU: servir el encoder en un contenedor CPU y usarlo para el primer filtrado de candidatos antes de un reranker mas pesado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| STS-B Pearson x100 (SIF-10, float16) | 69,22451 |
| STS-B Pearson x100 (SIF-10, float32) | 69,22434 |
| Diferencia frente a float32 del mismo metodo (puntos) | +0,00017 |
| Recall@10 frente a float32 del mismo metodo | 0,999891 |
| STS-B Pearson x100 (media cruda, float32) | 44,46410 |
| Tamano del archivo del modelo (bytes) | 246.157.570 |

La comparacion controlada usa el preprocesado NLTK del notebook de fse 1.x a traves de una vista con tokenizador externo de la misma tabla; la fila con tokenizador por defecto (`fse_words@1`) se calcula sobre texto crudo. Recall@10 compara cada una de las 2.758 frases de STS-B contra el resto, excluyendo la propia fila y resolviendo empates por indice de fila. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, y el autor no hace afirmaciones de velocidad o latencia.

## Requisitos de hardware

- VRAM: 0 GB; el modelo esta pensado para CPU. En GPU ocuparia unos 0,25 GB en float16 y unos 0,5 GB en float32.
- Memoria RAM: alrededor de 250 MB para la tabla en float16, mas el overhead del proceso y del corpus a codificar.
- GPU: no necesaria. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) puede alojarlo, pero no aporta ventaja significativa frente a CPU.
- Cabe holgadamente en cualquier GPU consumer y en entornos embebidos con 1 GB de RAM libre.
- Despliegue: libreria `fse >= 2.0` (`fse.Encoder.from_pretrained(...)`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor declara explicitamente que no emite afirmaciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | STS-B Pearson x100 | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| fse/glove-wiki-gigaword-300-sif10-float16 | 123,4 M | 300 | no disponible | 69,22 | PDDL | en |
| GloVe wiki-gigaword-300 (media cruda) | 123,4 M | 300 | no disponible | 44,46 | PDDL | en |
| all-MiniLM-L6-v2 (referencia sentence transformer) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible | en |

La unica comparacion cuantitativa disponible en la informacion es frente a la media cruda de los mismos vectores GloVe, donde la variante SIF-10 mejora 24,76 puntos de Pearson x100. No se han publicado en la informacion datos comparativos frente a sentence transformers neuronales como all-MiniLM-L6-v2, por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias

- Modelo puramente estatico: no desambigua polisemia ni captura orden de palabras, negacion o estructura sintactica; dos frases con las mismas palabras en distinto orden producen el mismo vector.
- Solo ingles; el tokenizador `fse_words@1` no cubre otros idiomas.
- Riesgo de alucinacion no aplica (no genera texto), pero la similitud puede dar falsos positivos en textos cortos o con vocabulario fuera de la tabla de 400.000 entradas.
- Las metricas de STS-B y NanoBEIR guiaron la seleccion del corpus de componentes SIF, por lo que estan sesgadas hacia esos benchmarks y no deben interpretarse como estimaciones sobre datos no vistos.
- La licencia PDDL cubre los vectores originales de GloVe; los datos de frecuencia de wordfreq incluyen material CC BY-SA 4.0 y creditos por fuente recogidos en su NOTICE.md, que el campo de licencia del modelo no exime. Verificar esos terminos antes de uso comercial.
- La cuantizacion a float16 altera ligeramente los vecinos mas proximos (Recall@10 de 0,999891 frente a float32); para aplicaciones sensibles a ordenaciones exactas, usar la variante float32.
- Requiere la libreria `fse >= 2.0`; no es un modelo cargable con `transformers`, `sentence-transformers` ni `vLLM`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fse/glove-wiki-gigaword-300-sif10-float16)
- [Modelo base fse/glove-wiki-gigaword-300](https://huggingface.co/fse/glove-wiki-gigaword-300)
- [Repositorio Fast Sentence Embeddings (fse)](https://github.com/oborchers/Fast_Sentence_Embeddings)
- [Dataset HuggingFaceFW/fineweb-edu-llama3-annotations](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations)
- [wordfreq (Robyn Speer)](https://github.com/rspeer/wordfreq)
- [NOTICE.md de wordfreq](https://github.com/rspeer/wordfreq/blob/master/NOTICE.md)
- [GloVe (Stanford NLP)](https://github.com/stanfordnlp/GloVe)
- [Licencia PDDL 1.0](https://opendatacommons.org/licenses/pddl/1-0/)
