# fse/paragram-300-sl999-sif10

## Resumen

`fse/paragram-300-sl999-sif10` es un modelo de embeddings estaticos de frases publicado por el usuario `fse` en Hugging Face. No es un transformer generativo, sino una tabla de vectores de palabras de 1.703.756 filas y 300 dimensiones (float32) sobre la que se aplica una agregacion tipo *mean* de los vectores de los tokens de un texto, normalizada a longitud unitaria. El modelo deriva del modelo gensim `fse/paragram-300-sl999` (revision `c99818c...`) y se ha convertido al formato del framework `fse` (Fast Sentence Embeddings) para su uso con `fse>=2.0`.

El modelo incorpora una preparacion SIF-10 (*Smooth Inverse Frequency*, a=0.001) que pondera cada palabra por su frecuencia en un corpus de entrenamiento y elimina diez componentes principales ajustados sobre dicho corpus. Esta preparacion se realizo sobre `HuggingFaceFW/fineweb-edu-llama3-annotations` (859.346 parrafos de entrenamiento, semilla 0). El resultado es un encoder de frases ligero y determinista, pensado para tareas de similitud semantica y recuperacion, no para generacion.

Su relevancia actual es acotada: se trata de un artefacto de preservacion con licencia `unknown`, cero descargas y cero likes en el momento de la consulta. Resulta util para experimentos de recuperacion densa de bajo coste y para reproducir la linea base SIF sobre embeddings Paragram, pero no debe considerarse un sustituto de un modelo de embeddings neuronales moderno en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (tabla gensim Paragram) con agregacion mean + normalizacion L2 y ponderacion SIF-10 |
| Parametros totales | 526.848.036 (segun safetensors); tabla de 1.703.756 filas x 300 dimensiones float32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de embeddings estaticos sin ventana de atencion) |
| Tipos de cuantizacion | float32, float16, int8 (calculados en float32 por `fse`) |
| Idiomas soportados | en (ingles) |
| Licencia | unknown (la licencia del modelo fuente aplica; `unknown` no otorga permiso) |
| Formato de pesos | safetensors; tamano del repo 2.1 GB; fichero del modelo 2.072.155.759 bytes |
| Tokenizer | `fse_words@1` |
| Dimension del embedding | 300 (float32) |
| Vocabulario | 1.703.756 filas |
| Fingerprint | `xxh3-128:c6c96fd66f29e85fa6fefdf30661badd` |
| Libreria requerida | `fse>=2.0` |

## Arquitectura y entrenamiento

El modelo no es una red neuronal entrenada de extremo a extremo, sino una tabla de embeddings de palabras estaticos (Paragram, 300 dimensiones) convertida desde gensim. La representacion de una frase se obtiene promediando los vectores de sus tokens, aplicando pesos SIF `a/(a+p(w))` con `a=0.001` y normalizando el resultado a norma unitaria. La preparacion SIF-10 ajusta diez componentes no centrados sobre el corpus de entrenamiento y los pliega en la tabla ponderada; la cuantizacion se aplica despues del plegado.

Los pesos de frecuencia provienen de `wordfreq` 3.1.1 (frecuencias best-list del ingles, convertidas a conteos enteros sobre 2^31-1 con valor por defecto 1e-8 y normalizadas en float32). El corpus de componentes es `HuggingFaceFW/fineweb-edu-llama3-annotations` en la revision `72df4c9...`, con 859.346 parrafos de entrenamiento y semilla 0. Los checksums registrados son `xxh3-128:88146a7f61a2c157c4710cfaf3e0cb4b` (corpus tokenizado) y `xxh3-128:7064e3bbdaf1520ff851268ef04e8ba4` (pesos y componentes ajustados). El corpus se selecciono mediante la media de STS-B Pearson, STS-B Spearman y NanoBEIR macro nDCG@10, por lo que esas metricas no constituyen una estimacion holdout limpia.

## Capacidades

- Extraccion de features: genera un vector de 300 dimensiones por texto de entrada mediante `encoder.encode([...])`.
- Similitud semantica de frases: adecuado para comparar pares de oraciones por similitud coseno.
- Recuperacion densa: util como encoder ligero en indices vectoriales de bajo coste.
- Idiomas: exclusivamente ingles; no se declara soporte multilingue.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo *thinking*, vision ni audio.
- Determinismo: la codificacion es determinista y no estocastica.

## Casos de uso

- Busqueda semantica de bajo coste: indexar un corpus de documentos en ingles con vectores de 300 dimensiones y recuperar por similitud coseno; la tabla cabe en memoria y el coste por consulta es una media ponderada de vectores.
- Deduplicacion de textos: comparar embeddings de parrafos para detectar near-duplicates en pipelines de limpieza de datos, aprovechando el Recall@10 de 1.000000 frente a la variante float32 del mismo metodo.
- Clasificacion de texto por similitud a prototipos: calcular el centroide de cada clase y asignar la etiqueta del centroide mas cercano, sin necesidad de entrenar un clasificador supervisado.
- Reproduccion de lineas base SIF: replicar resultados academicos de Sentence Embeddings con SIF sobre Paragram para comparar con metodos neuronales en experimentos controlados.
- Filtrado previo en pipelines RAG: usar este encoder como primera etapa de recuperacion barata antes de un reranker mas costoso, reduciendo el numero de candidatos a puntuar.
- Evaluacion de calidad de corpus: medir la coherencia semantica interna de parrafos anotados (por ejemplo, el corpus `fineweb-edu-llama3-annotations`) mediante la dispersion de sus embeddings.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card corresponden a la comparacion controlada sobre los 1.379 pares de test de STS-B y a la recuperacion sobre 2.758 filas de STS-B.

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (SIF-10, float32) | 74,43794 |
| STS-B Pearson x100 (raw mean float32) | 51,45857 |
| Diferencia frente a float32 mismo metodo | +0,00000 puntos |
| Recall@10 frente a float32 mismo metodo | 1,000000 |
| STS-B Pearson x100 (tokenizer por defecto, texto crudo) | 74,43794 |

La comparacion controlada emplea el preprocesado NLTK del notebook 1.x mediante una vista con tokenizer externo sobre la misma tabla. La fila de tokenizer por defecto usa `fse_words@1` sobre texto crudo. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra el resto, excluye la propia fila y resuelve empates por indice de fila. No se declaran metricas de velocidad ni de carga. No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,1 GB en float32 para la tabla completa (2.072.155.759 bytes); en float16 o int8 el consumo se reduce segun la cuantizacion elegida, aunque `fse` calcula internamente en float32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; no requiere A100 ni H100. Una RTX 3060, RTX 4060 o superior es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `fse>=2.0` (unica libreria declarada por el autor). No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no se hace ninguna afirmacion de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fse/paragram-300-sl999-sif10 | 526,8 M (tabla 300d) | no aplica | unknown | safetensors | SIF-10, STS-B Pearson 74,44 |
| fse/paragram-300-sl999 (fuente) | no disponible | no aplica | unknown | gensim | Vectores Paragram sin preparacion SIF |
| Modelos de sentence-transformers (p. ej. MiniLM) | 22-118 M tipico | 256-512 tokens | Apache-2.0 / MIT (segun modelo) | safetensors / ONNX | Encoders neuronales con mejor rendimiento general, no comparados con datos en esta ficha |

No se dispone de comparaciones publicadas con alternativas neuronales en la informacion proporcionada; la unica comparacion documentada es interna (raw mean frente a SIF-10 sobre STS-B).

## Limitaciones y advertencias

- Licencia `unknown`: el campo no otorga permiso de uso. La model card indica que la licencia del modelo fuente aplica y que los terminos de los datos de frecuencia (`wordfreq`, con material CC BY-SA 4.0) no quedan renunciados por el campo de licencia de los vectores fuente.
- Modelo de preservacion: el autor lo publica explicitamente para preservacion; los titulares de derechos pueden solicitar su retirada.
- Solo ingles: no hay soporte multilingue declarado.
- Representacion *bag-of-words*: al promediar vectores de tokens se pierde el orden y la estructura sintactica; el rendimiento cae en tareas que dependen del orden o de negaciones.
- Sin capacidades generativas: no puede usarse para texto, codigo, razonamiento ni tool calling.
- Las metricas de seleccion del corpus (STS-B, NanoBEIR) guiaron la eleccion del corpus de entrenamiento, por lo que no son estimaciones holdout limpias.
- Cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria.
- Riesgo de alucinacion: no aplica en sentido generativo, pero la similitud coseno puede producir falsos positivos en recuperacion si el vocabulario no cubre el dominio.

## Enlaces

- Hugging Face: https://huggingface.co/fse/paragram-300-sl999-sif10
- Modelo fuente: https://huggingface.co/fse/paragram-300-sl999
- Repositorio del framework fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Paper Paragram: https://aclanthology.org/Q15-1025/
- wordfreq: https://github.com/rspeer/wordfreq
- NOTICE de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
