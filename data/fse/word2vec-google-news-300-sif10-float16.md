# fse/word2vec-google-news-300-sif10-float16

## Resumen

`fse/word2vec-google-news-300-sif10-float16` es un modelo de embeddings estaticos derivado del clasico `word2vec-google-news-300` de Google, publicado por el autor `fse` como parte del ecosistema de la libreria Fast Sentence Embeddings (fse 2.0). No es un transformer: es una tabla de 3.000.000 de filas por 300 dimensiones en float16 que se consulta mediante el tokenizador `fse_words@1`, y la representacion de una frase se obtiene como la media de las filas de sus tokens, normalizada a longitud unitaria. El modelo aplica ponderacion SIF (Smooth Inverse Frequency) con `a=0.001` y elimina diez componentes principales calculados sobre un corpus de entrenamiento, una tecnica clasica para mejorar embeddings de frase sin coste de inferencia neuronal.

La relevancia de esta ficha es practica: ofrece una alternativa de coste practicamente nulo frente a modelos de embeddings neuronales, con un rendimiento medido de 70,886 en Pearson x100 sobre el conjunto de test STS-B (1.379 pares), frente a 61,541 del promedio simple sin SIF. La cuantizacion a float16 apenas degrada la calidad (-0,00012 puntos respecto a float32) y mantiene un Recall@10 de 1,000000 frente a la version float32 del mismo metodo. El repositorio ocupa 1,9 GB y el fichero de pesos 1.865.259.670 bytes.

La limitacion principal es la licencia: los vectores originales de Google se publicaron "for research purposes only", por lo que el uso comercial queda restringido y el autor no otorga permisos adicionales. Ademas, el modelo solo soporta ingles y requiere la libreria `fse>=2.0`, no siendo compatible con `sentence-transformers`, `transformers` ni `gensim` directamente en su formato actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (tabla de lookup word2vec), no neuronal |
| Parametros totales | 944.258.511 (3.000.000 filas x 300 dimensiones + metadatos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no hay ventana de atencion; se procesan tokens individuales) |
| Tipos de cuantizacion | float16 (esta version); la tabla fuente existe en float32 e int8 segun la model card |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` / `word2vec-google-news-research-only` (investigacion unicamente) |
| Formato de pesos | safetensors, con tabla cuantizada por `quantize_rows@1` |
| Dimension de embedding | 300 |
| Vocabulario | 3.000.000 filas |
| Tokenizador | `fse_words@1` |
| Huella del modelo | `xxh3-128:499b36600b36b4a6672d3ccab989b585` |
| Tamano del repo | 1,9 GB |
| Fichero de pesos | 1.865.259.670 bytes |
| Libreria requerida | `fse>=2.0` |

## Arquitectura y entrenamiento

El modelo no entrena una red neuronal nueva: es una conversion del modelo gensim `fse/word2vec-google-news-300` (revision `4274c2efa75c99a64e3f83eabfc5b34d1acabe70`), que a su vez proviene de los vectores word2vec entrenados por Google sobre el corpus Google News (aproximadamente 100.000 millones de tokens, aunque este dato no se detalla en la model card proporcionada). Sobre esa tabla base se aplica un pipeline de preparacion offline que consta de tres pasos: calculo de pesos SIF por palabra, ajuste de diez componentes principales sobre un corpus de entrenamiento y plegado de esos componentes en la tabla ponderada. La cuantizacion a float16 se realiza despues del plegado.

Los pesos SIF siguen la formula `a/(a+p(w))` con `a=0.001`, usando frecuencias de la lista `best` de wordfreq 3.1.1 convertidas a conteos enteros sobre `2**31-1` con valor por defecto `1e-8` y normalizadas en float32. El corpus de ajuste de componentes es `HuggingFaceFW/fineweb-edu-llama3-annotations` (revision `72df4c92fb1b48beceb16016e8f695ec40a6c3a5`), con 859.346 parrafos de entrenamiento y semilla 0; el checksum del corpus tokenizado es `xxh3-128:88146a7f61a2c157c4710cfaf3e0cb4b` y el de pesos y componentes ajustados `xxh3-128:ab1c7dd640d7f6d79bd8d8aba629466e`. Los diez componentes se ajustaron exclusivamente sobre ese corpus, nunca sobre los textos de evaluacion, y se plegaron en la tabla ponderada antes de cuantizar.

La innovacion tecnica destacable es la reproducibilidad bit a bit: el autor afirma que en backend CPU los vectores calculados coinciden exactamente con los de su referencia, y que la cercania al modelo pre-cuantizacion esta medida, no prometida. La seleccion del corpus de componentes se hizo maximizando la media de Pearson y Spearman en STS-B y el nDCG@10 macro en NanoBEIR (cada metrica escalada a 0-100), lo que implica que las puntuaciones de esos benchmarks no son estimaciones sobre holdout intacto.

## Capacidades

- Generacion de embeddings de frase de longitud fija (300 dimensiones) a partir de texto en ingles, mediante media ponderada SIF de las filas de tokens y normalizacion a longitud unitaria.
- Extraccion de caracteristicas para tareas de similitud semantica, recuperacion de informacion y clustering de textos.
- Representacion de palabras individuales (lookup directo en la tabla de 3.000.000 de entradas).
- Ponderacion por frecuencia de palabra (SIF) que reduce el peso de terminos muy comunes.
- Eliminacion de las diez primeras componentes principales para mitigar el sesgo de direcciones dominantes en el espacio de embeddings.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es un modelo puramente de representacion estatica.
- Multilingue: no; solo ingles.
- Inferencia determinista y sin coste de GPU: se ejecuta en CPU con la libreria `fse`.

## Casos de uso

- Busqueda semantica en corpus en ingles: indexar documentos como vectores de 300 dimensiones y recuperar por similitud coseno. Adecuado por su coste de inferencia practicamente nulo y su Recall@10 de 1,000000 frente a la version float32 del mismo metodo, lo que permite desplegar en CPU sin GPU.
- Deduplicacion y near-duplicate detection: comparar pares de frases o parrafos con similitud coseno sobre embeddings normalizados, aprovechando la naturaleza determinista del modelo para obtener resultados reproducibles bit a bit en backend CPU.
- Clustering y topic modeling de textos: agrupar documentos por similitud semantica con k-means o HDBSCAN sobre los vectores de 300 dimensiones; util cuando el volumen de datos hace inviable un modelo neuronal por coste.
- Clasificacion de texto con modelos lineales: usar los embeddings como features de entrada para regresion logistica o SVM en tareas de moderacion, etiquetado o enrutamiento de tickets, con un coste de almacenamiento de 1,9 GB para toda la tabla.
- Baseline y evaluacion comparativa: servir como referencia rapida en experimentos de retrieval o STS antes de invertir en un modelo neuronal, dado su rendimiento medido de 70,886 en STS-B Pearson x100.
- Filtrado previo en pipelines RAG: primera etapa de recuperacion de bajo coste en CPU para reducir candidatos antes de un reranker neuronal, especialmente en despliegues con restricciones de hardware.
- Analisis de similitud en corpus historicos o de investigacion: al estar licenciado solo para investigacion, encaja en estudios academicos donde el uso comercial no aplica.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card:

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (SIF-10, float16) | 70,88629 |
| STS-B Pearson x100 (promedio simple, float32) | 61,54132 |
| STS-B Pearson x100 (SIF-10, float32) | 70,88642 |
| Diferencia vs. mismo metodo float32 (puntos) | -0,00012 |
| Recall@10 vs. mismo metodo float32 | 1,000000 |
| STS-B Pearson x100 (tokenizador por defecto) | 70,88629 |

La comparacion controlada de STS-B usa el preprocesamiento NLTK del notebook de la version 1.x mediante una vista de tokenizador externo sobre esta misma tabla. La fila del tokenizador por defecto usa el tokenizador `fse_words@1` guardado sobre texto crudo. El Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra todas las demas, excluye la propia fila y resuelve empates por indice de fila. No se emiten afirmaciones sobre tiempo de carga ni velocidad. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks de generacion porque el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB de GPU; el modelo se ejecuta en CPU. El fichero de pesos ocupa 1.865.259.670 bytes (aproximadamente 1,74 GiB) y debe caber en RAM junto con la estructura de indice.
- GPU recomendadas: no aplica; la libreria `fse` esta orientada a CPU. No se documenta backend GPU en la informacion disponible.
- Cabe en consumer hardware: si, en cualquier maquina con al menos 2 GB de RAM libre para cargar la tabla float16.
- Opciones de despliegue: exclusivamente mediante la libreria `fse>=2.0` (`fse.Encoder.from_pretrained(...)`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni sentence-transformers, ya que no es un transformer ni usa el formato de pesos de esas herramientas.
- Latencia y throughput: no disponibles. El autor declara explicitamente que "no se emite ninguna afirmacion sobre tiempo de carga o velocidad".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `fse/word2vec-google-news-300-sif10-float16` | 944.258.511 | No aplica | 300 | Solo investigacion | safetensors (fse) | SIF-10, float16, STS-B 70,886 |
| `fse/word2vec-google-news-300` (base) | No disponible | No aplica | 300 | Solo investigacion | gensim | Sin SIF; promedio simple STS-B 61,541 en float32 |
| Modelos de sentence-transformers tipo MiniLM | No disponible en la informacion | No disponible | No disponible | No disponible | safetensors | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada mas alla de la comparacion interna float32/float16 y promedio simple/SIF-10 recogida en la model card. Cualquier comparacion con modelos neuronales de embeddings requeriria datos externos no incluidos aqui.

## Limitaciones y advertencias

- Licencia restrictiva: los vectores originales de Google se publicaron "for research purposes only"; el autor usa `license: other` y declara explicitamente que "no se afirma ningun permiso mas amplio". El uso comercial no esta autorizado.
- Solo ingles: el tokenizador y las frecuencias estan calibrados para `en`; el rendimiento en otros idiomas no esta medido ni soportado.
- Modelo estatico: no captura contexto, polisemia ni orden de palabras mas alla de la media ponderada; frases con palabras homonimas o negaciones complejas pueden representarse de forma ambigua.
- Sin ventana de contexto: no procesa secuencias largas con atencion; la representacion de documentos largos es una media de todos sus tokens, lo que diluye informacion local.
- Riesgo de sesgo: los embeddings de Google News heredan sesgos del corpus periodistico de 2013 aproximadamente; la eliminacion de diez componentes principales mitiga direcciones dominantes pero no elimina sesgos sociales.
- Alucinacion: no aplica en sentido generativo (no produce texto), pero la similitud coseno puede devolver vecinos espurios en dominios muy alejados del corpus de entrenamiento.
- Dependencia de la libreria: requiere `fse>=2.0`; no funciona con `sentence-transformers`, `transformers` ni `gensim` en su formato actual, lo que limita la integracion en stacks existentes.
- Los benchmarks de seleccion de corpus (STS-B, NanoBEIR) guiaron la eleccion del corpus de componentes, por lo que sus puntuaciones no son estimaciones sobre holdout intacto; el autor lo advierte explicitamente.
- Los datos de frecuencia de wordfreq incluyen material CC BY-SA 4.0 y creditos especificos por fuente; la licencia del modelo no renuncia a esos terminos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fse/word2vec-google-news-300-sif10-float16
- Modelo base en HuggingFace: https://huggingface.co/fse/word2vec-google-news-300
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Proyecto original word2vec de Google: https://code.google.com/archive/p/word2vec/
- Libreria wordfreq: https://github.com/rspeer/wordfreq
- Aviso legal de wordfreq (NOTICE.md): https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
- Dataset de componentes: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
