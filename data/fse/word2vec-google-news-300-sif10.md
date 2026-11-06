# fse/word2vec-google-news-300-sif10

## Resumen

`fse/word2vec-google-news-300-sif10` es un modelo de embeddings estaticos derivado del clasico `word2vec-google-news-300` de Google, publicado por el autor `fse` en Hugging Face. No es un transformer: es una tabla de 3.000.000 de filas (vocabulario) por 300 dimensiones en float32, sobre la que se aplica una tokenizacion de palabras y una agregacion por media de las filas de cada texto, seguida de una normalizacion a longitud unitaria. El resultado es un encoder de frases basado en bolsa de palabras ponderada.

La variante `-sif10` incorpora la ponderacion SIF (smooth inverse frequency) con `a=0.001` y la eliminacion de diez componentes principales ajustados sobre un corpus de entrenamiento, tecnicas descritas en el trabajo de Arora et al. sobre embeddings de frases. Segun la model card, esta configuracion mejora la correlacion de Pearson en STS-B de 61,54132 a 70,88642 (escala x100) respecto a la media simple de los vectores originales, lo que la hace relevante como linea base ligera y determinista para tareas de similitud semantica y recuperacion.

El modelo se distribuye a traves de la libreria `fse` (Fast Sentence Embeddings), requiere `fse>=2.0` y esta pensado para escenarios donde no se necesita un transformer: inferencia por busqueda en tabla, sin GPU, con huella de memoria predecible. Su licencia es de solo investigacion, heredada del proyecto original de word2vec.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (tabla de word2vec) con agregacion por media y normalizacion L2; sin transformer |
| Parametros totales | 944.258.511 (3.000.000 filas x 300 dimensiones en float32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (agregacion sobre todos los tokens del texto, sin ventana definida) |
| Tipos de cuantizacion | float32, float16 e int8 (calculados internamente en float32) |
| Idiomas soportados | en (ingles) |
| Licencia | other (`word2vec-google-news-research-only`, solo investigacion) |
| Formato de pesos | safetensors (libreria `fse`), derivado de un modelo gensim |

## Arquitectura y entrenamiento

El modelo no entrena una red neuronal nueva: convierte la tabla de vectores de `fse/word2vec-google-news-300` (revision `4274c2efa75c99a64e3f83eabfc5b34d1acabe70`) en un encoder de frases. La tokenizacion usa `fse_words@1`; cada texto se representa como la media ponderada de las filas de sus tokens, con pesos SIF `a/(a+p(w))` donde `a=0.001` y `p(w)` es la frecuencia de la palabra. Despues se restan diez componentes principales no centrados, ajustados exclusivamente sobre el corpus de entrenamiento, y se normaliza el vector resultante a norma unitaria (paso `normalize@1`).

Los pesos de frecuencia provienen de `wordfreq` 3.1.1 (listas best de ingles), convertidos a recuentos enteros sobre 2^31-1 con valor por defecto 1e-8 y normalizados en float32. El corpus de ajuste de componentes es `HuggingFaceFW/fineweb-edu-llama3-annotations` en la revision `72df4c92fb1b48beceb16016e8f695ec40a6c3a5`, con 859.346 parrafos de entrenamiento y semilla 0. La seleccion de ese corpus se guio por la media de Pearson y Spearman en STS-B y el nDCG@10 macro de NanoBEIR, por lo que esas metricas no son estimaciones limpias sobre un holdout intacto. La cuantizacion se aplica despues del plegado de pesos y componentes en la tabla.

## Capacidades

- Generacion de embeddings de frases y documentos cortos mediante media ponderada de vectores de palabra.
- Extraccion de caracteristicas para similitud semantica, busqueda por vecindad y clustering.
- Recuperacion densa sobre corpus en ingles con representaciones de 300 dimensiones.
- Funcionamiento determinista y sin GPU: inferencia por busqueda en tabla.
- Soporte de cuantizacion a float16 e int8 con cambios de vecindad medidos (Recall@10 de 1,000000 frente a float32 del mismo metodo).
- Capacidad de cargarse sin normalizacion (`normalize=False`) para plegar una cabeza lineal en la tabla.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Multilingue: no, solo ingles.

## Casos de uso

- Busqueda semantica ligera en ingles: indexar un corpus de documentos con vectores de 300 dimensiones y recuperar por similitud coseno; adecuado por su bajo coste de inferencia y su naturaleza determinista.
- Deduplicacion y near-duplicate detection: comparar pares de frases con la similitud coseno de sus embeddings SIF para filtrar contenido repetido en pipelines de datos.
- Clustering y topic modeling de tickets o resenas: agrupar textos por vecindad en el espacio de 300 dimensiones sin necesidad de GPU.
- Linea base en evaluacion de sistemas de retrieval: usar el modelo como referencia rapida frente a encoders transformer en experimentos de NanoBEIR o STS-B.
- Clasificacion de texto con cabeza lineal: cargar el encoder con `normalize=False` y plegar un clasificador lineal en la tabla para inferencia de coste minimo.
- Filtrado previo en pipelines RAG: primera etapa de recuperacion barata antes de un reranker mas costoso, limitada a contenido en ingles.
- Analisis de similitud en investigacion linguistica: medir distancias entre terminos y frases con una representacion estatica interpretable y reproducible.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| STS-B Pearson x100 (SIF-10, float32) | 70,88642 |
| STS-B Pearson x100 (media simple, float32) | 61,54132 |
| Diferencia frente a float32 del mismo metodo | +0,00000 puntos |
| Recall@10 frente a float32 del mismo metodo | 1,000000 |
| Pearson x100 con tokenizador por defecto | 70,88642 |

Los resultados de STS-B se calculan sobre 1.379 pares de test. La comparacion controlada usa el preprocesado NLTK del cuaderno de la version 1.x a traves de una vista con tokenizador externo de la misma tabla. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra el resto, excluye la propia fila y resuelve empates por indice de fila. No se aportan datos de velocidad ni de latencia.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo ocupa 3.665.259.542 bytes en float32 (aproximadamente 3,7 GB en el repositorio).
- GPU recomendadas: no aplica; la inferencia es una busqueda en tabla y puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, aunque no es necesario; con float16 o int8 se reduce la huella de almacenamiento.
- Opciones de despliegue: libreria `fse>=2.0` (unica via documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la model card no hace afirmaciones de velocidad ni de tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | STS-B Pearson x100 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fse/word2vec-google-news-300-sif10` | 944.258.511 (tabla estatica) | no disponible | 70,88642 (SIF-10) | solo investigacion | Hugging Face, via `fse` |
| `fse/word2vec-google-news-300` | no disponible | no disponible | 61,54132 (media simple, segun la card del derivado) | solo investigacion | Hugging Face, via `fse` |
| Encoders transformer tipo sentence-transformers | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con encoders transformer no se puede completar con los datos proporcionados; no se dispone de sus resultados en las mismas condiciones de evaluacion.

## Limitaciones y advertencias

- Licencia de solo investigacion: el proyecto original de word2vec declara que se publica "released for research purposes only"; Apache-2.0 cubre el codigo, no estos vectores preentrenados. No se afirma ningun permiso mas amplio, por lo que el uso comercial no esta autorizado.
- Solo ingles: el vocabulario y las frecuencias estan construidos sobre listas de ingles; el rendimiento en otros idiomas no esta soportado.
- Representacion de bolsa de palabras: ignora el orden de las palabras y no modela sintaxis ni dependencias de largo alcance.
- Sin contexto definido: la agregacion opera sobre todos los tokens del texto, sin ventana; textos muy largos diluyen la senal.
- Alucinacion: no aplica en el sentido generativo, pero la similitud puede producir falsos positivos en recuperacion por ambiguedad lexica.
- Sesgos: no documentados en la informacion disponible; los vectores de Google News heredan los sesgos del corpus periodistico original.
- Condiciones de evaluacion: el corpus de ajuste se selecciono usando STS-B y NanoBEIR, por lo que esas metricas no son estimaciones limpias sobre un holdout intacto.
- Dependencia de la libreria: requiere `fse>=2.0`; no hay soporte documentado en otros runtimes.
- Terminos de datos de frecuencia: los datos de `wordfreq` incluyen material CC BY-SA 4.0 y creditos por fuente recogidos en su NOTICE.md; la licencia de los vectores de origen no renuncia a esos terminos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/word2vec-google-news-300-sif10
- Modelo base en Hugging Face: https://huggingface.co/fse/word2vec-google-news-300
- Repositorio de fse (Fast Sentence Embeddings): https://github.com/oborchers/Fast_Sentence_Embeddings
- Proyecto original de word2vec: https://code.google.com/archive/p/word2vec/
- word2vec (wordfreq), atribucion de datos de frecuencia: https://github.com/rspeer/wordfreq
- NOTICE.md de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
