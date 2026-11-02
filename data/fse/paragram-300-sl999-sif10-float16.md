# fse/paragram-300-sl999-sif10-float16

## Resumen

`fse/paragram-300-sl999-sif10-float16` es un modelo de embeddings estaticos de frases publicado por el usuario `fse` en HuggingFace. No es un transformer generativo: es una tabla de embeddings de palabras de 1.703.756 filas por 300 dimensiones en float16, sobre la que se aplica una agregacion tipo SIF (smooth inverse frequency) con 10 componentes principales eliminados y normalizacion a longitud unitaria. El resultado es un vector de frase que se obtiene por simple media ponderada de las filas de los tokens, sin atencion ni paso autoregresivo.

El modelo deriva del modelo gensim `fse/paragram-300-sl999` (variante Paragram con 300 dimensiones), convertido a un formato propio de la libreria `fse` (Fast Sentence Embeddings) version 2.0 o superior. La tabla se almacena cuantizada mediante el paso `quantize_rows@1` a partir de una tabla float32, con tokenizador `fse_words@1` y un unico paso de normalizacion por fila. Su relevancia es practica: ofrece embeddings de frase con muy bajo coste computacional y un rendimiento medido de 74,43796 en Pearson x100 sobre el conjunto de test de STS-B (1.379 pares), lo que lo situa en un rango util para busqueda semantica y similitud de frases sin necesidad de GPU.

La licencia es desconocida: el autor original no declaro terminos en los materiales inspeccionados y la model card indica explicitamente que `license: unknown` no concede permiso de uso. La conversion se conserva con fines de preservacion. El modelo esta pensado unicamente para ingles y su pipeline declarado es `feature-extraction`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras con agregacion SIF y eliminacion de componentes; no es un transformer |
| Parametros totales | 526.848.036 (1.703.756 filas x 300 dimensiones en float16, mas metadatos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo no tiene ventana de atencion; procesa el texto completo como bolsa de palabras) |
| Tipos de cuantizacion | float16 (esta version); la familia incluye float32 e int8; el calculo interno se hace en float32 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `unknown` (no concede permiso de uso; ver limitaciones) |
| Formato de pesos | safetensors, con tabla cuantizada por `quantize_rows@1`; requiere la libreria `fse>=2.0` |
| Dimension del embedding | 300 |
| Vocabulario | 1.703.756 filas |
| Tokenizador | `fse_words@1` |
| Tamano del repo | 1,0 GB (fichero del modelo: 1.049.902.223 bytes) |
| Modelo base | `fse/paragram-300-sl999` (gensim, revision `c99818c1470d5c4e454eb9d59dfce2b179dba455`) |
| Fingerprint | `xxh3-128:2b2ab794cc974b128746edfe070c320d` |

## Arquitectura y entrenamiento

El modelo no entrena una red neuronal en el sentido habitual. Parte de una tabla de embeddings de palabras Paragram (300 dimensiones, 1.703.756 entradas) y aplica una preparacion offline en tres fases. Primero, pesos SIF por palabra calculados como `a/(a+p(w))` con `a=0.001`, donde las frecuencias provienen de wordfreq 3.1.1 (listas best de ingles, convertidas a conteos enteros sobre 2^31-1 con valor por defecto 1e-8 y normalizadas en float32). Segundo, ajuste de 10 componentes no centrados sobre un corpus de 859.346 parrafos de entrenamiento extraidos de `HuggingFaceFW/fineweb-edu-llama3-annotations` (revision `72df4c92fb1b48beceb16016e8f695ec40a6c3a5`, semilla 0), que se pliegan en la tabla ponderada; los componentes nunca se ajustan sobre los textos de evaluacion. Tercero, cuantizacion de la tabla ya plegada al formato float16.

La innovacion tecnica es la eficiencia: al no haber atencion, el coste de codificar una frase es proporcional al numero de tokens y se resuelve con una media ponderada y una proyeccion, sin decodificacion autoregresiva ni cache KV. La model card advierte que los vectores que calcula `fse` son los de la tabla cuantizada, no los del modelo previo a la cuantizacion, y que la cercania entre ambos se mide (Recall@10 de 0,999927 frente a la misma variante en float32), no se promete. El corpus de ajuste se selecciono optimizando la media de Pearson y Spearman en STS-B y nDCG@10 macro en NanoBEIR, por lo que esas cifras no son estimaciones de holdout limpias. El recibo completo del ajuste esta en `preparation.json`.

## Capacidades

- Generacion de embeddings de frases y textos cortos en ingles mediante media ponderada SIF de las filas de tokens, con normalizacion a longitud unitaria.
- Similitud semantica entre frases (coseno sobre vectores normalizados).
- Busqueda semantica y recuperacion densa de documentos (Recall@10 medido de 0,999927 frente a la variante float32 del mismo metodo).
- Feature extraction para pipelines de clasificacion, clustering y deduplicacion de textos.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; no hay soporte declarado de otros idiomas.
- No dispone de modo thinking ni de procesamiento de audio.
- El calculo interno se realiza en float32 independientemente del almacenamiento en float16 o int8.

## Casos de uso

- Busqueda semantica en bases documentales en ingles: codificar el corpus una vez con `encoder.encode()` y almacenar los vectores de 300 dimensiones; en consulta, codificar la pregunta y recuperar por similitud coseno. Es adecuado porque el coste por frase es minimo y no requiere GPU.
- Deduplicacion y near-duplicate detection: comparar pares de parrafos por similitud coseno con umbral calibrado sobre los propios datos; el Recall@10 cercano a 1 frente a float32 garantiza que la cuantizacion no altera los vecinos mas proximos.
- Clustering tematico de articulos o tickets: agrupar embeddings de frases con k-means o HDBSCAN para descubrir temas sin etiquetas; la dimension 300 y la normalizacion unitaria facilitan el uso de metricas euclideas.
- Clasificacion de texto con modelos ligeros: usar los embeddings como features de entrada para un clasificador lineal (regresion logistica, SVM) en tareas de moderacion o enrutado de tickets, evitando el coste de un transformer.
- Filtrado previo en pipelines RAG: como primera etapa de recuperacion de bajo coste antes de un reranker neuronal, reduciendo el numero de candidatos que pasan al modelo caro.
- Analisis de similitud en investigacion: medir el parecido entre pares de frases en experimentos controlados (por ejemplo, paráfrasis) sobre el conjunto STS-B, donde el modelo reporta 74,43796 de Pearson x100 con el tokenizador por defecto.
- Preservacion y reproduccion de experimentos: al fijar revision, checksums y semilla, permite reproducir exactamente los vectores calculados en el backend CPU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (SIF-10 float32) | 74,43794 |
| STS-B Pearson x100 (SIF-10 float16, este modelo) | 74,43796 |
| Diferencia frente a float32 del mismo metodo | +0,00002 puntos |
| Recall@10 frente a float32 del mismo metodo | 0,999927 |
| STS-B Pearson x100 con tokenizador por defecto (`fse_words@1`) | 74,43796 |
| STS-B Pearson x100 (media cruda float32, referencia) | 51,45857 |
| Tamano del fichero del modelo | 1.049.902.223 bytes |

La comparacion controlada usa el preprocesado NLTK del notebook 1.x a traves de una vista con tokenizador externo de la misma tabla. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra el resto, excluye la propia fila y resuelve empates por indice de fila. No se aportan cifras de latencia ni de velocidad de carga. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, ya que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula en GPU; el modelo cabe en RAM de CPU (fichero de 1,0 GB en float16, tabla de 300 dimensiones).
- GPU recomendadas: no necesarias. Cualquier GPU con al menos 2 GB de memoria puede alojar la tabla, pero el backend de referencia es CPU y el calculo se hace en float32.
- Cabe en GPU de consumo: si, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.), aunque no aporta ventaja frente a CPU para este tipo de modelo.
- Opciones de despliegue: la libreria `fse>=2.0` (`fse.Encoder.from_pretrained`); no es compatible con vLLM, TGI, llama.cpp ni Ollama, que estan orientados a transformers generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card indica explicitamente que no se hace ninguna afirmacion de velocidad ni de tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `fse/paragram-300-sl999-sif10-float16` (este) | 526.848.036 | 300 | No aplica (bolsa de palabras) | `unknown` | safetensors + `fse` | STS-B Pearson x100 74,43796 |
| `fse/paragram-300-sl999` (base) | No disponible | 300 | No aplica | `unknown` | gensim | Modelo fuente en float32, sin SIF ni cuantizacion |
| Variante float32 del mismo metodo | 526.848.036 | 300 | No aplica | `unknown` | safetensors + `fse` | Referencia de la comparacion; Recall@10 0,999927 frente a este |
| Variante int8 del mismo metodo | 526.848.036 | 300 | No aplica | `unknown` | safetensors + `fse` | Mencionada en la model card; no se aportan metricas propias |

No se dispone de datos en la informacion proporcionada para comparar con modelos de embeddings de frase de otras familias (por ejemplo, Sentence-BERT o E5), por lo que la comparativa se limita a las variantes del propio autor.

## Limitaciones y advertencias

- Licencia `unknown`: el autor original no declaro terminos de uso y la model card advierte que `license: unknown` no concede permiso. El uso comercial no esta autorizado por defecto; los titulares de derechos pueden solicitar la retirada via issues del repositorio.
- Solo ingles: no hay soporte declarado de otros idiomas, y las frecuencias SIF estan calibradas sobre listas de wordfreq en ingles.
- Sin modelado de orden ni de contexto sintactico: al ser una media de embeddings de palabras, no captura negaciones, orden de palabras ni dependencias de largo alcance.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto), pero si hay riesgo de similitudes espurias por coincidencia lexica y de vectores poco informativos para palabras fuera del vocabulario o raras.
- La cuantizacion a float16 altera ligeramente los vectores respecto a float32; la model card mide esa diferencia (Recall@10 0,999927) pero no la garantiza para otros datos.
- Las cifras de STS-B y NanoBEIR guiaron la seleccion del corpus de ajuste, por lo que no son estimaciones de holdout limpias; hay que evaluar el modelo sobre datos propios.
- El corpus de ajuste y las frecuencias derivan de wordfreq, cuyos datos incluyen material CC BY-SA 4.0 y creditos por fuente en `NOTICE.md`; la licencia del campo de vectores fuente no renuncia a esos terminos.
- Dependencia de la libreria `fse>=2.0`: no es un modelo cargable con `transformers`, `sentence-transformers` ni `gensim` directamente.
- El modelo esta marcado como conversion de preservacion, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fse/paragram-300-sl999-sif10-float16
- Modelo base en HuggingFace: https://huggingface.co/fse/paragram-300-sl999
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Paper de Paragram (From Paraphrase Database to Compositional Paraphrase Model and Back): https://aclanthology.org/Q15-1025/
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
- wordfreq (atribucion de frecuencias): https://github.com/rspeer/wordfreq
- NOTICE de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
