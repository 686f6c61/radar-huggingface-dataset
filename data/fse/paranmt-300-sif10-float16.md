# fse/paranmt-300-sif10-float16

## Resumen

`fse/paranmt-300-sif10-float16` es un modelo de embeddings estaticos de frases derivado de los vectores de palabras ParaNMT-300. Lo publica el autor `fse` dentro del ecosistema de la libreria Fast Sentence Embeddings (fse), que implementa el calculo de embeddings de frases a partir de tablas de vectores de palabras fijas. No es un transformer: es una tabla de 77.224 filas por 300 dimensiones en float16, a la que se aplica una media ponderada por frecuencias (SIF, a=0.001) y una normalizacion a longitud unitaria.

El modelo resuelve el caso de obtener representaciones de frases rapidas y deterministas sin inferencia neuronal: cada frase se codifica como la media de las filas de sus tokens, ponderada por SIF y corregida con diez componentes principales eliminados, ajustados sobre un corpus de 859.346 parrafos de `HuggingFaceFW/fineweb-edu-llama3-annotations`. La tabla se ha cuantizado a float16 desde la tabla float32 original, con una perdida medida de 0,00004 puntos de Pearson en STS-B respecto a la version float32 del mismo metodo.

Es relevante por su coste: 23,8 millones de parametros, 47,5 MB de fichero y ejecucion en CPU sin GPU. La contrapartida es que la licencia es desconocida y los vectores de origen (ParaNMT) se entrenaron con CzEng 1.6, disponible solo para investigacion no comercial, por lo que su uso en produccion comercial no esta autorizado de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (tabla gensim/Paragram) con pooling SIF-10 y normalizacion L2 |
| Parametros totales | 23.815.132 (77.224 filas x 300 dimensiones, float16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no hay atencion; el pooling opera sobre todos los tokens de la frase) |
| Tipos de cuantizacion | float16 (esta version), float32 e int8 en el ecosistema fse |
| Idiomas soportados | en (ingles) |
| Licencia | unknown (la licencia del modelo de origen aplica; no se concede permiso) |
| Formato de pesos | safetensors, libreria `fse` (>= 2.0) |
| Vocabulario | 77.224 filas, tokenizer `fse_words@1` |
| Dimension del embedding | 300 |
| Tamano del fichero | 47.523.995 bytes |
| Modelo base | fse/paranmt-300 (revision a08e15771891207a22f840a3091a00a1657d888b) |
| Huella de la tabla | xxh3-128:3145e0e4282adfa085f0ed3a6581076e |

## Arquitectura y entrenamiento

No hay red neuronal en la inferencia. El modelo es una tabla de vectores de palabras estatica: cada token se mapea a una fila de 300 dimensiones y la representacion de la frase se obtiene como media de las filas de sus tokens, ponderada por `a/(a+p(w))` con `a=0.001`, seguida de la eliminacion de diez componentes principales no centrados y de una normalizacion a longitud unitaria. Los pesos de frecuencia provienen de wordfreq 3.1.1 con la lista `lang_freq='en'` de fse 1.x, convertidos a cuentas enteras sobre 2^31-1 y normalizados en float32.

Los diez componentes se ajustaron sobre 859.346 parrafos de `HuggingFaceFW/fineweb-edu-llama3-annotations` (revision 72df4c92fb1b48beceb16016e8f695ec40a6c3a5, semilla 0), nunca sobre los textos de evaluacion, y se plegaron en la tabla antes de la cuantizacion. La tabla float16 se genero con `quantize_rows@1` desde la tabla float32 `xxh3-128:ba010b29772aca247c55cf0cf3df65cf`. Los vectores de origen son los de ParaNMT-300, entrenados con el corpus CzEng 1.6; no se documenta en esta ficha ningun proceso de RLHF, DPO ni ajuste supervisado adicional.

## Capacidades

- Extraccion de features y embeddings de frases (`pipeline_tag: feature-extraction`), con salida de 300 dimensiones normalizada a norma 1.
- Similitud semantica y recuperacion densa sobre texto en ingles mediante producto escalar o coseno.
- Agrupamiento y clasificacion de textos cortos a partir de sus vectores.
- Codificacion determinista y reproducible: en backend CPU, fse calcula los vectores bit a bit igual que su referencia.
- Ejecucion sin GPU y sin framework de deep learning, con dependencia unicamente de `fse>=2.0`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- Capacidad multilingue limitada al ingles: el vocabulario y las frecuencias estan calibrados para `en`.

## Casos de uso

- Busqueda semantica en ingles sobre corpus pequenos o medianos: indexar documentos con `encoder.encode([...])` y recuperar por similitud coseno; cabe en memoria (47,5 MB) y se ejecuta en CPU, lo que permite desplegarlo en un contenedor sin GPU.
- Deduplicacion y near-duplicate detection: comparar embeddings de parrafos para detectar contenido repetido en pipelines de curacion de datos, con la ventaja de que la codificacion es determinista y barata a escala de millones de documentos.
- Clasificacion de textos cortos: usar los vectores como features de entrada a un clasificador lineal (regresion logistica, SVM) para moderacion, etiquetado de tickets o triaje de correo.
- Agrupamiento tematico de feedback de usuarios: agrupar resenas o encuestas por similitud de embedding para descubrir temas recurrentes sin coste de inferencia neuronal.
- Baseline y control en evaluacion de modelos: al ser un metodo estatico con puntuacion STS-B publicada (78,11 Pearson x100), sirve como referencia inferior contra la que medir embeddings neuronales en tareas de similitud.
- Recuperacion en entornos con restricciones de latencia o coste: al no requerir GPU ni atencion cuadratica, el coste por frase es el de tokenizar y promediar filas, adecuado para servicios de alto QPS con presupuesto minimo.
- Filtrado previo en pipelines RAG: primera etapa de recuperacion barata en ingles antes de un reranker neuronal, reduciendo el numero de candidatos que llegan al modelo caro.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (SIF-10, float16) | 78,11211 |
| Diferencia vs. mismo metodo en float32 (puntos) | -0,00004 |
| Recall@10 vs. mismo metodo en float32 | 0,999855 |
| STS-B Pearson x100 (tokenizer por defecto, texto crudo) | 78,11211 |
| STS-B Pearson x100 (media cruda, float32, referencia) | 79,81644 |
| STS-B Pearson x100 (SIF-10, float32) | 78,11215 |

La comparacion se realizo sobre los 1.379 pares de test de STS-B; el Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra todas las demas, excluyendo la propia y resolviendo empates por indice de fila. El autor advierte que el corpus de componentes se selecciono usando la media de STS-B Pearson, STS-B Spearman y NanoBEIR macro nDCG@10, por lo que estas cifras no son estimaciones limpias sobre un holdout intacto. No se aportan datos de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM: no requiere GPU; la tabla completa ocupa 47,5 MB en float16 y se puede mantener en RAM.
- GPU recomendadas: ninguna en particular; cualquier GPU es innecesaria. En caso de usar backend GPU de fse, el cuello de botella sera el ancho de banda de memoria, no la computacion.
- GPU de consumo: cabe holgadamente en cualquier iGPU o CPU moderna; no hay requisito de VRAM.
- Despliegue: libreria `fse>=2.0` (`fse.Encoder.from_pretrained`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos con atencion.
- Latencia y throughput: no se publican cifras. El autor indica explicitamente que no se hace ninguna afirmacion de velocidad ni de tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| fse/paranmt-300-sif10-float16 | 23,8 M | 300 | no aplica | unknown | safetensors (fse) | SIF-10, float16, STS-B 78,11 |
| fse/paranmt-300 (origen) | no disponible | 300 | no aplica | unknown | gensim | Tabla float32 sin cuantizar |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 384 | 256 tokens | Apache-2.0 | safetensors, PyTorch | Transformer, requiere inferencia neuronal |
| GloVe 300d (promedio) | ~400 k filas | 300 | no aplica | dominio publico | texto/vectores | Media simple sin SIF ni correccion |

La comparacion con all-MiniLM-L6-v2 es la mas directa por orden de magnitud de parametros, pero no se dispone de una evaluacion comun en la informacion proporcionada para establecer una diferencia de rendimiento fiable; el dato de STS-B de este modelo no es directamente comparable con el publicado por terceros sin replicar el mismo protocolo.

## Limitaciones y advertencias

- Licencia `unknown`: no se concede permiso de uso. El autor mantiene esta conversion solo por preservacion.
- Los vectores de origen (ParaNMT) se entrenaron con CzEng 1.6, disponible unicamente para investigacion no comercial; esto no establece una licencia para los vectores derivados, pero condiciona su uso comercial.
- Los datos de frecuencia de wordfreq incluyen material CC BY-SA 4.0 y creditos por fuente recogidos en su NOTICE.md; los terminos de esos datos no quedan anulados por el campo de licencia del modelo.
- Solo ingles: el vocabulario de 77.224 filas y las frecuencias estan calibrados para `en`; el rendimiento en otros idiomas no esta medido.
- Modelo estatico sin contexto: no desambigua polisemia ni orden de palabras; dos frases con las mismas palabras en distinto orden producen el mismo vector.
- Sin capacidades generativas, de razonamiento ni de tool calling; no debe emplearse para tareas conversacionales.
- Las puntuaciones de STS-B y NanoBEIR estan contaminadas por la seleccion del corpus de componentes; no son estimaciones sobre holdout limpio.
- La cuantizacion a float16 introduce cambios de vecindad medidos (Recall@10 de 0,999855), no nulos.
- El modelo requiere `fse>=2.0`; no es cargable con sentence-transformers, transformers ni gensim directamente.
- Riesgo de alucinacion no aplica en sentido generativo, pero la similitud coseno puede producir falsos positivos en retrieval con vocabulario fuera de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/paranmt-300-sif10-float16
- Modelo base: https://huggingface.co/fse/paranmt-300
- Repositorio fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Issues de fse (solicitudes de retirada): https://github.com/oborchers/Fast_Sentence_Embeddings/issues
- ParaNMT (codigo): https://github.com/jwieting/para-nmt-50m
- Paper de ParaNMT: https://aclanthology.org/P18-1042/
- Corpus CzEng 1.6: https://ufal.mff.cuni.cz/czeng/czeng16
- Dataset de componentes: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
- wordfreq: https://github.com/rspeer/wordfreq
- NOTICE de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
