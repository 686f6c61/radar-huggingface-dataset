# fse/fasttext-crawl-subwords-300-raw-float16

## Resumen

`fse/fasttext-crawl-subwords-300-raw-float16` es una version cuantizada a float16 de un modelo de embeddings estaticos de palabras y frases, derivado de los vectores fastText English word vectors de Facebook (Crawl, 2 millones de filas, 300 dimensiones). Lo publica el proyecto `fse` (Fast Sentence Embeddings) como parte de una familia de seis repositorios derivados que incluyen variantes `raw` y `sif10` en float32, float16 e int8. El modelo no es un transformer: es una tabla de embeddings estatica con subpalabras FastText (ngramas de 4 a 4, 2 millones de buckets) sobre la que se calcula la media de las filas de tokens de un texto y se normaliza a longitud unitaria.

El problema que resuelve es el de obtener representaciones de frases y palabras de forma extremadamente barata en computo: no hay atencion ni inferencia neuronal, solo lookup de filas y media ponderada. Esto lo hace adecuado para pipelines de recuperacion, deduplicacion, clustering o baselines de similitud semantica donde el coste por vector debe ser minimo y el modelo debe caber en memoria de forma controlada.

Su relevancia actual es acotada pero concreta: sirve como referencia reproducible y cuantificada de cuanto se degrada un embedding estatico al pasar de float32 a float16 (diferencia de -0.00093 puntos de Pearson x100 en STS-B y Recall@10 de 0.999819 frente a la misma variante en float32). El modelo tiene 1.217.845.063 parametros totales, ocupa 2,4 GB en el repositorio y esta pensado para usarse con la libreria `fse` 2.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos tipo FastText (tabla de filas con ngramas de subpalabras), sin transformer |
| Parametros totales | 1.217.845.063 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo estatico; no aplica ventana de atencion) |
| Tipos de cuantizacion | float16 (esta variante); la familia incluye float32 e int8 |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-3.0 (incluye ShareAlike) |
| Formato de pesos | safetensors (libreria `fse`) |
| Filas (vocabulario) | 2.000.000 |
| Dimensiones de la tabla | 300 (float16) |
| Tokenizador | `fse_words@1` |
| Ngramas FastText | bucket 2.000.000, min_n 4, max_n 4 |
| Pasos por fila | `normalize@1` |
| Modelo base | `fse/fasttext-crawl-subwords-300` (gensim, revision `552b66a16850576275f894ed738f9e953b45a594`) |
| Tamano del repositorio | 2,4 GB |
| Tamano del fichero del modelo | 2.431.846.610 bytes |
| Fingerprint | `xxh3-128:eb03270f4c886d64cfe8629540cde77e` |

## Arquitectura y entrenamiento

No hay entrenamiento neuronal en esta ficha: el modelo es una conversion del modelo gensim `fse/fasttext-crawl-subwords-300`, que a su vez procede de los vectores fastText English word vectors de Facebook (Crawl). La arquitectura es una tabla de embeddings estatica de 2.000.000 filas y 300 dimensiones, con soporte de subpalabras mediante ngramas FastText de longitud 4 (min_n = 4, max_n = 4) y 2.000.000 buckets. La representacion de una frase se obtiene como la media de las filas de sus tokens, normalizada a longitud unitaria mediante el paso `normalize@1`.

La innovacion tecnica de esta variante es la cuantizacion de almacenamiento: la tabla se guarda con `quantize_rows@1` a partir de la tabla float32 con fingerprint `xxh3-128:a7775dd2c0333965666defe0d670ea8e`. Segun la model card, `fse` calcula los vectores en float32 en todos los casos, de modo que la cuantizacion afecta al almacenamiento y no al calculo. El sufijo `-raw` indica ausencia de ponderacion SIF, no ausencia de normalizacion: tanto las variantes `-raw` como `-sif10` se cargan normalizadas por defecto, y puede desactivarse con `normalize=False` para obtener la media ponderada sin normalizar (por ejemplo, para plegar una cabeza lineal en la tabla). La model card advierte de que los vectores que se obtienen son los de la tabla cuantizada, no los del modelo previo a la cuantizacion, y que la cercania a estos ultimos se mide, no se garantiza por el fichero.

## Capacidades

- Extraccion de features y embeddings de frases: dado un texto, devuelve un vector de 300 dimensiones normalizado a longitud unitaria, calculado como media de las filas de sus tokens.
- Embeddings de palabras con subpalabras: al usar ngramas FastText de longitud 4, puede representar tokens fuera de vocabulario a partir de sus subpalabras.
- Similitud semantica y recuperacion: los vectores normalizados permiten calcular similitud coseno directamente como producto escalar.
- Modo sin normalizacion: `normalize=False` devuelve la media ponderada sin normalizar, util para integrar una cabeza lineal en la tabla.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling: es un modelo exclusivamente de representacion.
- No soporta agentes ni razonamiento multi-paso.
- Cobertura multilingue limitada al ingles.

## Casos de uso

- Recuperacion semantica de baja latencia: indexar documentos en un motor vectorial usando estos embeddings de 300 dimensiones y resolver consultas por similitud coseno, aprovechando que no hay inferencia neuronal y el coste por vector es un lookup mas una media.
- Deduplicacion y near-duplicate detection: comparar pares de frases o parrafos por similitud coseno con un umbral calibrado; la variante float16 conserva Recall@10 de 0.999819 frente a float32, por lo que el cambio de vecinos es despreciable para esta tarea.
- Clustering y topic modeling exploratorio: agrupar grandes volumenes de texto (titulos, resenas, tickets) con k-means sobre vectores de 300 dimensiones, como baseline barato antes de recurrir a modelos neuronales.
- Filtrado y pre-ranking en pipelines de busqueda: usar el modelo como primera etapa que reduce candidatos antes de un reranker mas costoso, dado su bajo coste de computo y su tamano de 2,4 GB en memoria.
- Clasificacion de texto con cabeza lineal: cargar el modelo con `normalize=False` para plegar una cabeza lineal en la tabla y obtener un clasificador de frases de coste minimo en produccion.
- Baselines reproducibles en evaluacion: emplear la variante float16 como referencia cuantificada en experimentos de similitud semantica, comparando contra las variantes float32 e int8 de la misma familia con las metricas STS-B y Recall@10 ya publicadas.
- Sistemas con memoria restringida: desplegar en entornos donde un transformer no cabe, ya que el fichero ocupa 2,4 GB y el calculo es aritmetica de medias sobre filas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card, medidos sobre los 1.379 pares de test de STS-B:

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (esta variante float16) | 48,52752 |
| Diferencia frente a la misma variante en float32 (puntos) | -0,00093 |
| Recall@10 frente a la misma variante en float32 | 0,999819 |
| STS-B Pearson x100 con tokenizador por defecto | 48,52752 |
| Bytes del fichero del modelo | 2.431.846.610 |

La model card indica ademas que, en la comparacion controlada con el mismo preprocesado NLTK del notebook 1.x, raw float32 obtuvo 48,52845 de Pearson x100 y SIF-10 float32 obtuvo 72,40582. No se han publicado resultados de benchmarks de otros conjuntos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no aplican a un modelo de embeddings estaticos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero del modelo ocupa 2,4 GB; en float16 la tabla de 2.000.000 x 300 ocupa aproximadamente 1,2 GB, y el resto del repositorio corresponde a metadatos y estructuras auxiliares. Cabe en GPUs consumer con 4 GB o mas, y tambien en CPU.
- GPU recomendadas: no se especifican en la informacion disponible. Dado el caracter estatico del modelo, cualquier GPU con memoria suficiente sirve; no requiere A100 ni H100 para funcionar.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 4 GB de VRAM; tambien es viable en CPU.
- Opciones de despliegue: la model card solo documenta la libreria `fse` 2.0 o superior (`pip install "fse>=2.0"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card declara explicitamente que no se hace ninguna afirmacion de velocidad ni de tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros / filas | Dimensiones | Contexto | STS-B Pearson x100 | Licencia |
|---|---|---|---|---|---|
| `fse/fasttext-crawl-subwords-300-raw-float16` | 1.217.845.063 / 2.000.000 filas | 300 (float16) | no aplica | 48,52752 | cc-by-sa-3.0 |
| `fse/fasttext-crawl-subwords-300-raw` | misma tabla en float32 | 300 (float32) | no aplica | 48,52845 | cc-by-sa-3.0 |
| `fse/fasttext-crawl-subwords-300-sif10` | misma tabla con ponderacion SIF-10 | 300 | no aplica | 72,40582 (float32) | cc-by-sa-3.0 |

No se dispone en la informacion proporcionada de datos de modelos comparables de otros autores (por ejemplo, otros embeddings estaticos o sentence transformers) para establecer una comparativa cruzada; ese dato figura como no disponible.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: no cubre otros idiomas.
- Modelo estatico: cada palabra tiene un unico vector independiente del contexto, por lo que no resuelve polisemia ni dependencias sintacticas; la calidad en similitud semantica es muy inferior a la de un transformer (48,5 frente a 72,4 de la variante SIF-10 en STS-B).
- La cuantizacion a float16 introduce una degradacion medible pero minima en la misma variante (-0,00093 puntos de Pearson x100); los vectores obtenidos son los de la tabla cuantizada, no los del modelo original.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de similitudes espurias por la representacion por media de tokens, especialmente en frases largas o con negaciones.
- Licencia cc-by-sa-3.0 con ShareAlike: el uso comercial esta permitido, pero las obras derivadas deben distribuirse bajo la misma licencia y con atribucion a Facebook por los vectores originales y al proyecto `fse` por la conversion.
- La model card indica que Facebook no respalda esta conversion.
- Requiere la libreria `fse` 2.0 o superior; no es cargable con `transformers`, `sentence-transformers` ni otras librerias convencionales.
- No se ofrecen garantias de velocidad ni de tiempo de carga.
- El modelo tiene solo 41 descargas y 0 likes en Hugging Face, por lo que la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/fasttext-crawl-subwords-300-raw-float16
- Variante raw en float32: https://huggingface.co/fse/fasttext-crawl-subwords-300-raw
- Modelo base gensim: https://huggingface.co/fse/fasttext-crawl-subwords-300
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Vectores originales fastText English: https://fasttext.cc/docs/en/english-vectors.html
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
