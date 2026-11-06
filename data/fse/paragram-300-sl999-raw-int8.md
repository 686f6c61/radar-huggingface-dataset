# fse/paragram-300-sl999-raw-int8

## Resumen

`fse/paragram-300-sl999-raw-int8` es una version cuantizada a int8 del modelo de embeddings estaticos `fse/paragram-300-sl999`, publicado por el autor `fse` en Hugging Face. Se trata de una tabla de vectores de palabras de 300 dimensiones con un vocabulario de 1.703.756 filas, derivada originalmente del modelo gensim Paragram-SL999. El modelo no es un transformer generativo: es un modelo de embeddings estaticos orientado a la extraccion de caracteristicas (`feature-extraction`) y a la generacion de embeddings de frases mediante la media de los vectores de sus tokens.

La relevancia de este artefacto es fundamentalmente de preservacion y eficiencia de almacenamiento. La tabla de 300 dimensiones se almacena en int8 mediante el paso `quantize_rows@1`, lo que reduce el peso del repositorio a aproximadamente 0,5 GB. El modelo requiere la libreria `fse` version 2.0 o superior para cargarse y ejecutarse, y no es compatible con las APIs habituales de `transformers`, `sentence-transformers` o `gensim` directamente.

Se trata de un modelo unicamente en ingles, con licencia desconocida (`unknown`), lo que impide asumir permisos de uso comercial. Su interes practico es limitado frente a embeddings contextuales modernos, pero resulta util como referencia historica de embeddings estaticos y para comparaciones controladas de calidad frente a variantes float32 y float16 del mismo modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (tabla de lookup); media de vectores de tokens normalizada a longitud unitaria |
| Parametros totales | 528.551.792 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de bolsa de palabras) |
| Tipos de cuantizacion | int8 (esta version); el modelo base dispone de float32 y float16 |
| Idiomas soportados | en (ingles) |
| Licencia | unknown (la licencia del modelo fuente aplica; no se concede permiso explicito) |
| Formato de pesos | safetensors (libreria `fse`, no `transformers`) |
| Dimensiones del vector | 300 |
| Filas del vocabulario | 1.703.756 |
| Tokenizer | `fse_words@1` |
| Pasos por fila | `normalize@1` |
| Huella (fingerprint) | `xxh3-128:811484bfb3fb71ed12bcaeb4744d991b` |
| Tabla float32 de origen | `xxh3-128:dd257d40a3a5e7236ee9e82078a97134` |
| Tamano del repositorio | 0,5 GB (545.590.639 bytes el fichero del modelo) |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura transformer ni ningun mecanismo de atencion. Es una tabla de embeddings estaticos: cada token del vocabulario tiene asociado un vector de 300 dimensiones, y el embedding de una frase se obtiene calculando la media de los vectores de sus tokens y normalizando el resultado a norma unitaria. Esta operacion corresponde al metodo "raw" descrito en la model card, en contraposicion al metodo SIF-10, que aplica una ponderacion por frecuencia y eliminacion de componentes del corpus de entrenamiento.

Los pesos proceden del modelo gensim `fse/paragram-300-sl999` (revision `c99818c1470d5c4e454eb9d59dfce2b179dba455`), que a su vez deriva del Paragram-SL999 original, un modelo de embeddings de palabras entrenado sobre el Paraphrase Database y datos de supervision de parafrasis. La model card no documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de ajuste como RLHF o DPO; estos datos no estan disponibles.

La innovacion tecnica de esta version concreta es la cuantizacion de filas a int8 (`quantize_rows@1`) sobre la tabla float32, que reduce el tamano del fichero a aproximadamente 545 MB. Segun la model card, `fse` calcula los vectores en float32 a partir de la tabla cuantizada, de modo que en el backend de CPU el resultado es identico bit a bit al de su referencia, pero no necesariamente identico al del modelo antes de la cuantizacion. La cercania a la version float32 se mide, no se garantiza: la model card reporta una diferencia de -0,01128 puntos de Pearson x100 en STS-B y un Recall@10 de 0,996193 frente a la misma variante en float32.

## Capacidades

- Generacion de embeddings de frases y textos cortos mediante media de vectores de tokens normalizada, apta para similitud semantica y recuperacion.
- Extraccion de caracteristicas (`feature-extraction`) para pipelines de clasificacion, clustering y deduplicacion de textos.
- Representacion de palabras individuales a partir de la tabla de 1.703.756 filas y 300 dimensiones.
- Soporte de similitud coseno entre frases gracias a la normalizacion a longitud unitaria (`normalize@1`).
- Procesamiento de texto en ingles exclusivamente.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking mode) ni de decodificacion especulativa.
- No soporta conversaciones multi-turno ni manejo de contexto largo en el sentido de los modelos generativos.

## Casos de uso

- Busqueda semantica en ingles sobre corpus pequenos o medianos: el modelo puede indexar documentos y consultas como vectores de 300 dimensiones y recuperar los mas similares por producto escalar o similitud coseno, con un coste de almacenamiento muy reducido gracias a int8.
- Deduplicacion y near-duplicate detection: comparar embeddings de parrafos o titulos para identificar contenido repetido en un corpus, usando el Recall@10 medido (0,996193 frente a float32) como referencia de fidelidad de vecinos.
- Clustering de documentos o resenas: agrupar textos por tematica calculando embeddings y aplicando k-means o DBSCAN sobre los vectores normalizados.
- Clasificacion de texto con modelos ligeros: usar los embeddings como caracteristicas de entrada para clasificadores lineales (regresion logistica, SVM) en tareas como analisis de sentimiento o deteccion de spam en ingles.
- Baseline de evaluacion de embeddings: servir como referencia estatica frente a embeddings contextuales en experimentos academicos de STS-B u otras tareas de similitud semantica, dado que la model card documenta su rendimiento medido.
- Preservacion y archivo de artefactos: mantener una version compacta y reproducible del Paragram-SL999 para estudios historicos o comparativas, con la advertencia de que la licencia es desconocida y no se concede permiso de uso.
- Sistemas de recuperacion con restricciones de memoria: desplegar en entornos con poca RAM o almacenamiento limitado donde un modelo contextual no es viable, aceptando la perdida de calidad frente a embeddings modernos.

## Benchmarks y rendimiento

La model card proporciona resultados medidos sobre el conjunto de test STS-B (1.379 pares) y sobre las 2.758 filas de frases de STS-B para Recall@10:

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (metodo raw, int8, tokenizer por defecto) | 51,44729 |
| STS-B Pearson x100 (metodo raw, float32, referencia de la model card) | 51,45857 |
| Diferencia frente a float32 del mismo metodo (puntos) | -0,01128 |
| Recall@10 frente a float32 del mismo metodo | 0,996193 |
| STS-B Pearson x100 (metodo SIF-10, float32, referencia) | 74,43794 |
| Bytes del fichero del modelo | 545.590.639 |

No se han publicado en la informacion disponible resultados de benchmarks como MMLU, HumanEval o GSM8K, que no aplican a un modelo de embeddings estaticos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero del modelo ocupa aproximadamente 545 MB en int8; en memoria, la tabla puede residir en RAM o VRAM segun el backend de `fse`. No se documenta el consumo exacto en runtime.
- GPU recomendadas: no disponible. El modelo esta pensado para ejecutarse en CPU segun la model card ("on the cpu backend bit for bit as its reference computes them"), y no se especifican GPU recomendadas.
- Cabe en GPU consumer: si, en principio, cualquier GPU con al menos 1 GB de memoria libre podria alojar la tabla int8, aunque no se documenta soporte GPU explicito ni rendimiento medido.
- Opciones de despliegue: unicamente la libreria `fse` version 2.0 o superior (`pip install "fse>=2.0"`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo transformer.
- Latencia y throughput: no disponibles. La model card indica explicitamente que "no se hace ninguna afirmacion sobre carga o velocidad" ("No load-time or speed claim is made").

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `fse/paragram-300-sl999-raw-int8` | 528.551.792 | 300 | no aplica | unknown | safetensors (`fse`) | Version int8; STS-B Pearson x100 51,44729 |
| `fse/paragram-300-sl999` (base) | no disponible | 300 | no aplica | unknown | gensim | Modelo fuente float32 del que deriva esta version |
| Variante float32 del mismo modelo | no disponible | 300 | no aplica | unknown | safetensors (`fse`) | Referencia de calidad: STS-B Pearson x100 51,45857 |
| Variante SIF-10 float32 | no disponible | 300 | no aplica | unknown | safetensors (`fse`) | Mejor calidad medida: STS-B Pearson x100 74,43794 |

No se dispone en la informacion proporcionada de comparaciones con embeddings contextuales modernos (por ejemplo, modelos de `sentence-transformers`) ni con otros embeddings estaticos como GloVe o Word2Vec; estos datos no estan disponibles.

## Limitaciones y advertencias

- Licencia desconocida: la model card indica explicitamente que `license: unknown` no concede permiso y que la licencia del modelo fuente aplica. No se debe asumir uso comercial permitido.
- Modelo exclusivamente en ingles; no soporta otros idiomas.
- Al ser un modelo de bolsa de palabras, ignora el orden de los tokens y no captura negaciones, dependencias sintacticas ni contexto discursivo.
- Calidad limitada: el metodo raw obtiene 51,44729 de Pearson x100 en STS-B, muy por debajo del metodo SIF-10 (74,43794) y de los embeddings contextuales actuales.
- Riesgo de perdida de fidelidad por cuantizacion: aunque el Recall@10 frente a float32 es 0,996193, la model card advierte que la cercania se mide, no se garantiza.
- No es compatible con `transformers`, `sentence-transformers` ni `gensim` directamente; requiere `fse>=2.0`.
- No dispone de soporte de tool calling, agentes, vision, audio ni generacion de texto.
- El autor indica que los titulares de derechos pueden solicitar la retirada del repositorio a traves de las issues del proyecto, lo que implica un riesgo de disponibilidad del artefacto.
- No se documentan sesgos especificos, pero al derivar de un corpus de parafrasis en ingles puede heredar sesgos de dicho corpus; no hay analisis disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/paragram-300-sl999-raw-int8
- Modelo base: https://huggingface.co/fse/paragram-300-sl999
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Issues del proyecto (solicitudes de retirada): https://github.com/oborchers/Fast_Sentence_Embeddings/issues
- Paper de referencia del Paragram-SL999: https://aclanthology.org/Q15-1025/
