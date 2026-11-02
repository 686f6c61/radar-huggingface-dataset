# fse/word2vec-google-news-300-raw-int8

## Resumen

`fse/word2vec-google-news-300-raw-int8` es una version cuantizada a int8 del modelo de embeddings estaticos `fse/word2vec-google-news-300`, una conversion del clasico word2vec de Google News (300 dimensiones, 3 millones de filas) al formato del framework fse (Fast Sentence Embeddings). Lo desarrolla el usuario `fse` como parte del ecosistema del proyecto Fast_Sentence_Embeddings, y su proposito es ofrecer sentence embeddings rapidos por media de vectores de token, sin necesidad de una red neuronal transformer en tiempo de inferencia.

El modelo no es un modelo generativo: es una tabla de embeddings estatica de 300 dimensiones por token (cuantizada a int8) y 3.000.000 de filas de vocabulario, con un total de 947.258.511 parametros almacenados en safetensors. El encoder calcula la media de las filas de token de un texto y la normaliza a longitud unitaria, de modo que la inferencia se reduce a operaciones de lookup y media, sin atencion ni capas profundas.

Su relevancia es practica: permite obtener representaciones de frases con un coste computacional y de memoria muy bajo (repo de 1,0 GB), adecuado para busqueda semantica, deduplicacion o clustering a gran escala. Ahora bien, la licencia del modelo original de Google News es "research purposes only", lo que restringe seriamente su uso comercial. El modelo es solo para ingles y requiere fse 2.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (word2vec, media de vectores de token normalizada) |
| Parametros totales | 947.258.511 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de bolsa de palabras sin ventana de atencion) |
| Tipos de cuantizacion | int8 (tabla); el modelo base existe en float32 y float16 |
| Idiomas soportados | en (ingles) |
| Licencia | other (word2vec-google-news-research-only) |
| Formato de pesos | safetensors |
| Vocabulario | 3.000.000 filas |
| Dimensiones del embedding | 300 |
| Tokenizador | fse_words@1 |
| Pasos por fila | normalize@1 |
| Tamano del repo | 1,0 GB |

## Arquitectura y entrenamiento

El modelo es una tabla de embeddings estatica derivada de word2vec sobre Google News (3 millones de palabras, 300 dimensiones). No hay transformer, ni atencion, ni capas ocultas: la representacion de una frase se obtiene como la media de las filas de token correspondientes, normalizada a longitud unitaria. La version aqui descrita almacena la tabla cuantizada a int8 mediante `quantize_rows@1` a partir de la tabla float32 original (fingerprint `xxh3-128:82ba9ce3dc01894279dccda982d3ae83`).

No se dispone de informacion sobre el proceso de entrenamiento original (numero de tokens, composicion del corpus, hiperparametros de word2vec) en la informacion proporcionada; solo se sabe que los vectores proceden del modelo gensim `fse/word2vec-google-news-300` en la revision `4274c2efa75c99a64e3f83eabfc5b34d1acabe70`. No hay RLHF, DPO ni ajuste por instrucciones: es un modelo puramente de representacion. La innovacion tecnica es la cuantizacion de filas y el pipeline fse, que calcula en float32 aunque la tabla este en int8, manteniendo la paridad con la referencia en el backend de CPU.

## Capacidades

- Generacion de embeddings de frases por media de vectores de token normalizada a longitud unitaria (no genera texto).
- Extraccion de caracteristicas (`feature-extraction`) para tareas de similitud semantica y recuperacion.
- Similitud coseno entre frases y busqueda por vecino mas cercano.
- Clustering y deduplicacion de textos.
- Clasificacion de texto mediante embeddings como entrada a modelos downstream.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: solo ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Busqueda semantica en ingles a gran escala: indexar documentos con embeddings de 300 dimensiones y recuperar por similitud coseno; el bajo coste de memoria (1,0 GB) permite mantener el indice en RAM en servidores modestos.
- Deduplicacion de corpus: comparar pares de frases o documentos por similitud de embeddings para eliminar duplicados en pipelines de limpieza de datos.
- Clustering de noticias o tickets: agrupar textos por tematica usando k-means sobre los vectores de frase, aprovechando la velocidad del lookup frente a modelos transformer.
- Filtrado previo en pipelines RAG: usar el modelo como primera etapa de recuperacion barata antes de un reranker mas costoso.
- Clasificacion de texto ligera: alimentar un clasificador lineal (regresion logistica, SVM) con los embeddings para tareas como deteccion de spam o analisis de sentimiento simple.
- Prototipado y evaluacion offline: banco de pruebas rapido para comparar metodos de agregacion (media cruda frente a SIF-10) sin coste de GPU.
- Sistemas con restricciones de latencia y CPU: despliegue en entornos sin GPU donde un transformer no es viable.

## Benchmarks y rendimiento

Los datos disponibles en la model card son de la evaluacion STS-B (1.379 pares de test) realizada por el autor:

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (tokenizador por defecto) | 61,54394 |
| Diferencia frente a float32 del mismo metodo (puntos) | +0,00262 |
| Recall@10 frente a float32 del mismo metodo | 0,996483 |
| Bytes del archivo del modelo | 977.259.798 |
| Metodo raw float32 (referencia) | 61,54132 |
| Metodo SIF-10 float32 (referencia) | 70,88642 |

La comparacion controlada usa el preprocesado NLTK del notebook 1.x mediante una vista de tokenizador externo sobre la misma tabla. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la informacion disponible, y no procede aplicarlos a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en sentido estricto; el modelo se ejecuta en CPU. En GPU, la tabla int8 ocupa aproximadamente 0,9 GB (947 millones de parametros a 1 byte) mas overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.); tambien funciona en CPU.
- Opciones de despliegue: libreria `fse>=2.0` (unico soporte documentado); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la model card declara explicitamente que no se hace ninguna afirmacion de velocidad o tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| fse/word2vec-google-news-300-raw-int8 | 947.258.511 | 300 | no aplica | research only | safetensors (int8) |
| fse/word2vec-google-news-300 (base) | no disponible | 300 | no aplica | research only | gensim |
| Modelos de sentence-transformers (p. ej. all-MiniLM) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion proporcionada; la unica comparacion publicada es interna (raw frente a SIF-10 y float32 frente a int8).

## Limitaciones y advertencias

- Licencia restrictiva: el proyecto word2vec original se declara "released for research purposes only"; Apache-2.0 cubre solo el codigo, no los vectores preentrenados. El uso comercial no esta permitido sin permiso adicional.
- Solo ingles: no soporta otros idiomas.
- Modelo de bolsa de palabras: ignora el orden de las palabras y no captura negacion, sintaxis ni dependencias de largo alcance.
- Sin contexto conversacional ni generacion: no sirve para tareas generativas, agentes ni razonamiento.
- Riesgo de sesgos: los embeddings de Google News heredan los sesgos del corpus de noticias original (genero, raza, nacionalidad), no medidos en la informacion disponible.
- Cuantizacion int8: los vectores calculados son los de la tabla cuantizada, no los del modelo original; la similitud con el modelo previo a la cuantizacion esta medida (Recall@10 de 0,996483) pero no garantizada.
- Dependencia de la libreria fse 2.0 o superior; no hay soporte documentado en otros runtimes.
- Sin garantias de produccion: la model card no ofrece afirmaciones de velocidad ni de tiempo de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fse/word2vec-google-news-300-raw-int8
- Modelo base: https://huggingface.co/fse/word2vec-google-news-300
- Repositorio fse (Fast_Sentence_Embeddings): https://github.com/oborchers/Fast_Sentence_Embeddings
- Proyecto original word2vec (terminos de licencia): https://code.google.com/archive/p/word2vec/
