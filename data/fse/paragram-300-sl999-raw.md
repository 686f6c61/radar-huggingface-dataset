# fse/paragram-300-sl999-raw

## Resumen

`fse/paragram-300-sl999-raw` es un modelo de embeddings estaticos de palabras publicado por el autor `fse` en Hugging Face. No es un modelo generativo ni un transformer: se trata de una tabla de 1.703.756 filas (vocabulario) por 300 dimensiones en float32, derivada del modelo gensim `fse/paragram-300-sl999`, que a su vez procede de los vectores Paragram-SL999 del Paraphrase Database (PPDB). El "modelo" expone una operacion de embedding de frase muy concreta: la media de las filas de tokens de un texto, normalizada a longitud unitaria.

Su relevancia es acotada pero clara: sirve como referencia reproducible y empaquetada de embeddings estaticos para tareas de similitud semantica y recuperacion, con un formato moderno (safetensors) y una libreria ligera (`fse` 2.0+) que evita depender de gensim en tiempo de inferencia. El autor documenta explicitamente las metricas en STS-B, lo que permite comparar variantes (raw frente a SIF-10) y formatos de almacenamiento (float32, float16, int8) con numeros concretos.

El modelo tiene un tamano de repositorio de 2,1 GB y 526.848.036 parametros segun safetensors (equivalente a las 1.703.756 filas por 300 dimensiones, mas posibles metadatos). Solo declara soporte de ingles. La licencia figura como `unknown`, lo que constituye una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (tabla de lookup); embedding de frase por media de tokens normalizada |
| Parametros totales | 526.848.036 (safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; opera sobre el conjunto de tokens del texto de entrada) |
| Tipos de cuantizacion | float32 (por defecto), float16, int8 (soportados por `fse`; el calculo interno se hace en float32) |
| Idiomas soportados | en (ingles) |
| Licencia | unknown (la licencia del modelo origen aplica; no se concede permiso explicito) |
| Formato de pesos | safetensors (repo de 2,1 GB); origen gensim |

## Arquitectura y entrenamiento

No hay una arquitectura neuronal en el sentido habitual. El artefacto es una matriz de embeddings de 1.703.756 filas por 300 dimensiones en float32, con un tokenizador propio identificado como `fse_words@1` y una etapa de normalizacion (`normalize@1`) por fila. La representacion de una frase se obtiene promediando las filas correspondientes a sus tokens y normalizando el vector resultante a norma unitaria. El fingerprint del artefacto es `xxh3-128:70ea0079ef30b2c0e3b9918ae66b4296`.

Los vectores subyacentes proceden de Paragram-SL999, un modelo de embeddings de palabras derivado del Paraphrase Database (PPDB) y descrito en el paper "From Paraphrase Database to Compositional Paraphrase Model and Back" (ACL 2015). La model card no documenta el volumen de tokens de entrenamiento, la composicion del corpus ni si hubo ajuste fino supervisado; esos datos no estan disponibles en la informacion proporcionada. La conversion desde gensim a safetensors se realizo en la revision `c99818c1470d5c4e454eb9d59dfce2b179dba455` del modelo origen.

La innovacion practica del paquete es la separacion entre "metodo" y "formato de almacenamiento": el autor publica variantes raw (media simple) y SIF-10 (ponderacion por frecuencia y eliminacion del componente principal del corpus de entrenamiento), y permite elegir float32, float16 o int8 segun el compromiso entre tamano y preservacion de vecinos. Todas las variantes se calculan internamente en float32.

## Capacidades

- Extraccion de caracteristicas (`feature-extraction`): genera un vector de 300 dimensiones por texto de entrada.
- Embeddings de frase por media de tokens normalizada a norma unitaria.
- Similitud semantica y recuperacion densa mediante producto escalar o coseno entre vectores.
- Tokenizador propio `fse_words@1` sobre texto crudo, sin dependencia de NLTK en el uso por defecto.
- Variante SIF-10 disponible para mejorar la calidad en similitud de frases (ponderacion por frecuencia y eliminacion del primer componente).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingue: no; solo ingles declarado.

## Casos de uso

- Busqueda semantica en catalogo documental: indexar titulos y descripciones como vectores de 300 dimensiones y recuperar por similitud coseno; adecuado por el bajo coste de almacenamiento y la velocidad de un lookup mas una media.
- Deduplicacion y near-duplicate detection: comparar pares de frases con un umbral de similitud sobre los vectores normalizados; la normalizacion a norma unitaria hace que el producto escalar sea directamente el coseno.
- Clasificacion de texto ligera: usar el vector de frase como entrada de un clasificador lineal (regresion logistica, SVM) en tareas de sentimiento o topicos, con un coste de inferencia minimo en CPU.
- Filtrado previo en pipelines RAG: primera etapa de recuperacion barata sobre un corpus grande antes de un reranker neuronal, reduciendo el numero de candidatos que llegan al modelo caro.
- Agrupamiento de tickets de soporte: clusterizar embeddings de descripciones de incidencias para detectar patrones recurrentes sin GPU.
- Baseline reproducible para evaluacion: el autor publica el resultado en STS-B (Pearson x100 = 51,45857 para raw float32), lo que permite usarlo como referencia inferior frente a modelos de sentence-transformers en experimentos de similitud semantica.
- Entornos con restricciones de hardware: inferencia en CPU pura o en GPU de gama baja, ya que la operacion es un lookup de tabla y un promedio, sin atencion ni decodificacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los de STS-B (1.379 pares de test), expresados como Pearson x100:

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (raw, float32) | 51,45857 |
| STS-B Pearson x100 (SIF-10, float32) | 74,43794 |
| Diferencia frente a float32 mismo metodo | +0,00000 |
| Recall@10 frente a float32 mismo metodo | 1,000000 |
| Pearson x100 con tokenizador por defecto | 51,45857 |
| Bytes del archivo del modelo | 2.072.155.759 |

La comparacion controlada de STS-B usa el preprocesado NLTK del notebook 1.x a traves de una vista con tokenizador externo sobre la misma tabla; la fila de tokenizador por defecto usa `fse_words@1` sobre texto crudo. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra todas las demas, excluye la propia y resuelve empates por indice de fila. El autor no hace ninguna afirmacion sobre velocidad de carga o de inferencia. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable dado que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto float32 ocupa 2.072.155.759 bytes (aproximadamente 1,93 GiB); float16 e int8 reducen el tamano de almacenamiento, aunque `fse` calcula internamente en float32.
- GPU recomendadas: no requiere GPU. Cualquier GPU con al menos unos pocos GiB libres puede alojar la tabla; una RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con 4 GB o mas de VRAM, e incluso en CPU con RAM suficiente para la tabla.
- Opciones de despliegue: libreria `fse` 2.0 o superior (`fse.Encoder.from_pretrained(...)`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles; el autor declara explicitamente que no hace afirmaciones de velocidad de carga ni de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | STS-B Pearson x100 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fse/paragram-300-sl999-raw | 526.848.036 | 300 | no aplica | 51,45857 (raw) / 74,43794 (SIF-10) | unknown | Hugging Face, libreria `fse` |
| fse/paragram-300-sl999 | no disponible | 300 | no aplica | no disponible | unknown | Hugging Face (origen gensim) |
| GloVe (referencia generica) | no disponible | 50-300 | no aplica | no disponible en esta ficha | no disponible | no disponible |
| word2vec (referencia generica) | no disponible | 100-300 | no aplica | no disponible en esta ficha | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo origen `fse/paragram-300-sl999`; para el resto de alternativas de la misma categoria (embeddings estaticos) no hay datos en la informacion disponible. La diferencia clave frente a alternativas neuronales como los modelos de sentence-transformers es que aqui no hay atencion ni contexto: la calidad en similitud semantica es sustancialmente inferior (51,46 frente a los valores tipicos de 80 o mas en STS-B de los modelos densos modernos), a cambio de un coste de computo y almacenamiento mucho menor.

## Limitaciones y advertencias

- Licencia `unknown`: el autor indica que no se conceden permisos y que la licencia del modelo origen aplica. No es apta para uso comercial sin aclarar los terminos con los titulares de derechos.
- El autor mantiene la conversion "por preservacion" y ofrece a los titulares de derechos la posibilidad de solicitar su retirada mediante issues del repositorio.
- Calidad limitada: Pearson x100 de 51,45857 en STS-B con el metodo raw es muy inferior al de los modelos de embeddings de frase neuronales; SIF-10 mejora hasta 74,43794 pero sigue por debajo de los transformers densos.
- Solo ingles declarado; el tokenizador `fse_words@1` no esta documentado para otros idiomas.
- Sin contexto: la media de tokens pierde el orden y la estructura sintactica; frases largas o con negaciones pueden colapsar a vectores poco discriminativos.
- Riesgo de sesgos heredados del corpus PPDB y de los vectores Paragram-SL999, no auditados en la model card.
- No hay garantia de calidad para dominios especializados (legal, medico, tecnico) sin evaluacion propia.
- Requiere `fse` 2.0 o superior; no es compatible con `sentence-transformers`, `transformers` ni otras librerias habituales de embeddings.
- El modelo declara 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- No se documentan datos de entrenamiento, composicion del corpus ni proceso de ajuste, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/paragram-300-sl999-raw
- Modelo origen (gensim): https://huggingface.co/fse/paragram-300-sl999
- Repositorio de la libreria `fse`: https://github.com/oborchers/Fast_Sentence_Embeddings
- Issues del repositorio (solicitudes de retirada): https://github.com/oborchers/Fast_Sentence_Embeddings/issues
- Paper de Paragram / PPDB: https://aclanthology.org/Q15-1025/
