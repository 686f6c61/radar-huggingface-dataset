# fse/fasttext-crawl-subwords-300-sif10-float16

## Resumen

`fse/fasttext-crawl-subwords-300-sif10-float16` es un modelo de embeddings estaticos de frases derivado de los vectores de palabras FastText en ingles de Facebook (crawl subwords, 300 dimensiones). No es un transformer ni un modelo generativo: es una tabla de 2.000.000 de filas por 300 dimensiones en float16 que, combinada con un tokenizador propio (`fse_words@1`), produce un vector de frase mediante la media de las filas de sus tokens, normalizada a longitud unitaria. Lo publica el autor `fse`, dentro del ecosistema de la libreria Fast Sentence Embeddings (fse), que reproduce el enfoque clasico de embeddings de frase estaticos.

El interes tecnico esta en la variante `sif10`: aplica la ponderacion SIF (Smooth Inverse Frequency, con a=0.001) sobre las frecuencias de `wordfreq` 3.1.1 y resta diez componentes principales ajustados sobre un corpus de entrenamiento de 859.346 parrafos de `HuggingFaceFW/fineweb-edu-llama3-annotations`. El resultado es un embedding de frase sin contexto, extremadamente barato de calcular, que alcanza 72,40556 de Pearson x100 en el conjunto de test de STS-B (1.379 pares), frente a 48,52845 del promedio simple de los vectores fuente en float32.

Es relevante para quien necesite similitud semantica de frases a gran escala con coste de inferencia casi nulo: sin GPU, sin atencion y sin contexto de tokens. La contrapartida es que no modela orden de palabras ni polisemia contextual, y que solo cubre ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (media de filas de tabla FastText + ponderacion SIF + eliminacion de componentes) |
| Parametros totales | 1.217.845.063 (2.000.000 filas x 300 dimensiones en float16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no hay contexto: media sobre los tokens del texto, sin ventana definida) |
| Tipos de cuantizacion | float16 (este repo), int8 y float32 (variantes del mismo autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY-SA 3.0 (incluye ShareAlike) |
| Formato de pesos | safetensors (libreria `fse`) |
| Dimension de embedding | 300 |
| Vocabulario | 2.000.000 filas |
| Tokenizador | `fse_words@1` |
| Ngramas FastText | bucket 2.000.000, min_n 4, max_n 4 |
| Tamano del repo | 2,4 GB (fichero de modelo: 2.431.846.610 bytes) |
| Version minima de libreria | fse >= 2.0 |

## Arquitectura y entrenamiento

No hay red neuronal. El modelo es una tabla de embeddings de palabras convertida desde el modelo gensim `fse/fasttext-crawl-subwords-300` (revision `552b66a16850576275f894ed738f9e953b45a594`), que a su vez deriva de los vectores FastText crawl subwords de 300 dimensiones de Facebook. La representacion de una frase se obtiene promediando las filas correspondientes a sus tokens, con dos pasos adicionales: normalizacion de cada fila (`normalize@1`) y la transformacion SIF-10.

La preparacion SIF es offline y esta documentada con checksums. Los pesos por palabra son `a/(a+p(w))` con `a=0.001`, usando frecuencias de `wordfreq` 3.1.1 (listas best de ingles, convertidas a conteos enteros sobre 2^31-1 con defecto 1e-8 y normalizadas en float32). Sobre un corpus de 859.346 parrafos de `HuggingFaceFW/fineweb-edu-llama3-annotations` (revision `72df4c92fb1b48beceb16016e8f695ec40a6c3a5`, semilla 0) se ajustaron diez componentes no centrados que se pliegan en la tabla ponderada; la cuantizacion a float16 se aplica despues del plegado. El autor advierte que el corpus se selecciono maximizando la media de Pearson y Spearman en STS-B y nDCG@10 macro en NanoBEIR, por lo que esas metricas no son estimaciones limpias sobre holdout.

La tabla float16 se genero con `quantize_rows@1` desde la tabla float32 con huella `xxh3-128:1f07655fb868118fcf327209bf91e562`; la huella del modelo resultante es `xxh3-128:46fe26f184731f35ffba3f9ef7373e7d`. El autor indica que los vectores calculados son los de la tabla cuantizada (identicos bit a bit a su referencia en backend CPU), no los del modelo previo a cuantizacion.

## Capacidades

- Extraccion de caracteristicas (`feature-extraction`): genera un vector de 300 dimensiones por texto de entrada.
- Embeddings de frase estaticos: media de tokens con normalizacion a longitud unitaria.
- Similitud semantica: comparacion por coseno o producto escalar entre vectores de frase.
- Ponderacion SIF-10: aplica pesos por frecuencia y elimina diez componentes del corpus de entrenamiento.
- Soporte de subwords: ngramas FastText de 4 caracteres (min_n = max_n = 4) con 2.000.000 de buckets, lo que aporta cierta robustez ante palabras fuera de vocabulario o variantes morfologicas.
- Uso offline: no requiere red en inferencia una vez descargado el modelo.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes.
- Sin capacidades multilingues: solo ingles.
- Sin modo thinking ni decodificacion especulativa (no aplica).

## Casos de uso

- Busqueda semantica de documentos en ingles: indexar pasajes como vectores de 300 dimensiones y recuperar por similitud coseno. Adecuado por su coste de codificacion muy bajo y su tamano compacto, aunque limitado a coincidencia lexico-semantica sin contexto.
- Deduplicacion y near-duplicate detection de corpus: comparar pares de frases y fijar umbrales de similitud. El modelo documenta Recall@10 de 0,999927 frente a su variante float32, lo que respalda la estabilidad de vecinos tras la cuantizacion.
- Clasificacion de textos por prototipos: calcular centroides por clase y asignar etiquetas por vecino mas cercano, sin entrenar un modelo supervisado.
- Clustering de opiniones o tickets: agrupar frases por similitud para descubrir temas recurrentes en grandes volumenes de texto en ingles.
- Filtrado y enrutamiento previo en pipelines RAG: usar el embedding estatico como primera etapa barata y reservar un modelo denso contextual para el re-ranking.
- Evaluacion de similitud semantica en investigacion: referencia reproducible para comparar metodos de embeddings estaticos (el autor publica la comparacion float32 frente a SIF-10 en STS-B).
- Sistemas con restricciones de CPU o memoria: al no requerir GPU ni atencion, encaja en entornos embebidos o por lotes masivos donde un transformer es inviable.

## Benchmarks y rendimiento

Datos publicados en la model card (Pearson x100 sobre los 1.379 pares de test de STS-B):

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (SIF-10 float16, este modelo) | 72,40556 |
| STS-B Pearson x100 (SIF-10 float32, misma metodologia) | 72,40582 |
| Diferencia frente a float32 del mismo metodo (puntos) | -0,00026 |
| Recall@10 frente a float32 del mismo metodo | 0,999927 |
| STS-B Pearson x100 (media simple de vectores fuente, float32) | 48,52845 |
| STS-B Pearson x100 (tokenizador por defecto, texto crudo) | 72,40556 |
| Bytes del fichero de modelo | 2.431.846.610 |

La comparacion controlada usa el preprocesado NLTK del notebook de la version 1.x a traves de una vista con tokenizador externo sobre la misma tabla. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra el resto, excluye la propia fila y resuelve empates por indice de fila. No se publican cifras de latencia ni throughput. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, ya que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo ocupa 2,4 GB en float16 y puede residir en RAM.
- GPU recomendadas: no aplica. Cualquier CPU moderna es suficiente; una GPU solo aportaria ventaja en el calculo vectorial por lotes.
- Cabe en GPU de consumo: si, irrelevante en la practica; tambien cabe en memoria de sistemas de gama baja.
- Opciones de despliegue: libreria `fse` >= 2.0 (`pip install "fse>=2.0"`), con backend CPU como referencia bit a bit. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles; el autor declara explicitamente que no emite ninguna afirmacion de velocidad o tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | STS-B | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| fse/fasttext-crawl-subwords-300-sif10-float16 | 1.217.845.063 (tabla) | 300 | no aplica | 72,40556 (Pearson x100, SIF-10) | CC BY-SA 3.0 | en |
| fse/fasttext-crawl-subwords-300 (base, gensim) | no disponible | 300 | no aplica | 48,52845 (media simple, float32) | CC BY-SA 3.0 (vectores fuente) | en |
| Modelos de embeddings de frase contextuales (familia tipo sentence-transformers) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables en la informacion disponible es frente al modelo base y a la variante float32 del mismo metodo. No se dispone de cifras de alternativas contextuales para una comparacion cuantitativa honesta.

## Limitaciones y advertencias

- Solo ingles: no cubre otros idiomas y degradara en textos multilingues o con mezcla de lenguas.
- Sin contexto: al promediar tokens, ignora orden, negacion y polisemia; dos frases con las mismas palabras en distinto orden producen el mismo vector.
- Sesgos heredados: los vectores FastText de crawl web incorporan sesgos sociales y culturales del corpus de origen; no se documenta ninguna mitigacion.
- Riesgo de falsos positivos en similitud: la similitud coseno sobre medias puede favorecer coincidencia lexica frente a equivalencia semantica.
- Licencia CC BY-SA 3.0 con ShareAlike: el uso comercial es posible, pero las obras derivadas deben distribuirse bajo la misma licencia y con atribucion a Facebook y al autor; conviene revisar las obligaciones antes de integrarlo en productos propietarios.
- Terminos de datos de terceros: las frecuencias de `wordfreq` incluyen material CC BY-SA 4.0 y creditos especificos en su NOTICE.md; el campo de licencia de los vectores fuente no renuncia a esos terminos.
- Metricas no limpias: el corpus SIF se selecciono optimizando STS-B y NanoBEIR, por lo que esas cifras estan sesgadas al alza como estimacion de generalizacion.
- Cuantizacion: los vectores son los de la tabla float16, no los del modelo original; el autor mide la desviacion (Recall@10 de 0,999927) pero no la garantiza para otros datos.
- Reproducibilidad dependiente de la libreria: requiere `fse` >= 2.0 y su tokenizador `fse_words@1`; el comportamiento con otras herramientas no esta garantizado.
- Sin garantias de velocidad: no hay datos publicados de latencia, carga o throughput.
- Facebook no respalda esta conversion, segun la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/fasttext-crawl-subwords-300-sif10-float16
- Modelo base en Hugging Face: https://huggingface.co/fse/fasttext-crawl-subwords-300
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Vectores FastText en ingles (Facebook): https://fasttext.cc/docs/en/english-vectors.html
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
- wordfreq (Robyn Speer): https://github.com/rspeer/wordfreq
- NOTICE de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
- Dataset de anotaciones fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
