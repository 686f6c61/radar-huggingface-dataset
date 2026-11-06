# fse/paragram-300-sl999-raw-float16

## Resumen

`fse/paragram-300-sl999-raw-float16` es un modelo de embeddings estaticos de palabras y frases en ingles, publicado por el usuario `fse` en Hugging Face. No es un modelo generativo ni un transformer: es una tabla de vectores de 300 dimensiones con 1.703.756 filas (vocabulario), derivada del modelo gensim `fse/paragram-300-sl999` y almacenada en float16 mediante la herramienta `fse` (Fast Sentence Embeddings). La representacion de una frase se obtiene como la media de los vectores de sus tokens, normalizada a longitud unitaria.

El modelo resuelve el problema del calculo de embeddings de frases de forma extremadamente barata: al no haber atencion ni pasada por capas, la codificacion es una simple operacion de lookup y media. Esto lo hace adecuado para tareas de similitud semantica, recuperacion densa o clustering a gran escala donde el coste de inferencia de un transformer seria prohibitivo.

Es relevante ahora por su caracter de preservacion: el autor indica que no se ha declarado licencia para los vectores originales y que la conversion se mantiene con fines de archivo. La model card es transparente sobre el proceso de cuantizacion y sobre la perdida de calidad medida (diferencia de -0.00054 puntos de Pearson x100 respecto a float32). El modelo solo soporta ingles y requiere la libreria `fse>=2.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (tabla de lookup, sin transformer) |
| Parametros totales | 526.848.036 (1.703.756 filas x 300 dimensiones, float16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; media de tokens sin ventana) |
| Tipos de cuantizacion | float16 (este repo), float32 e int8 disponibles en la familia |
| Idiomas soportados | en (ingles) |
| Licencia | unknown (sin licencia declarada; ver advertencias) |
| Formato de pesos | safetensors |
| Dimension del embedding | 300 |
| Vocabulario | 1.703.756 filas |
| Tokenizador | `fse_words@1` |
| Tamano del repo | 1.0 GB (fichero de modelo: 1.049.902.223 bytes) |
| Libreria requerida | fse >= 2.0 |

## Arquitectura y entrenamiento

No se trata de una red neuronal profunda. El modelo es una tabla de embeddings estaticos: cada token del vocabulario tiene asociado un vector de 300 dimensiones en float16. La codificacion de una frase consiste en tokenizar el texto con `fse_words@1`, recuperar las filas correspondientes, calcular la media y normalizar el resultado a norma unitaria (paso `normalize@1`). No hay atencion, ni capas, ni mecanismo de contexto posicional.

El modelo deriva del gensim `fse/paragram-300-sl999` (revision `c99818c1470d5c4e454eb9d59dfce2b179dba455`), que a su vez se basa en los vectores Paragram-SL999, entrenados sobre el Paraphrase Database y corpus de parafrasis. La conversion aplica `quantize_rows@1` sobre la tabla float32 original (huella `xxh3-128:dd257d40a3a5e7236ee9e82078a97134`) para producir la tabla float16 con huella `xxh3-128:d437ec72d880179f652b77366a523b97`. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO (no aplica a embeddings estaticos).

La innovacion tecnica destacable es la propia herramienta `fse`: permite servir embeddings de frases sin GPU y con latencia de microsegundos, a costa de renunciar a la modelizacion contextual. La model card mide explicitamente la fidelidad de la cuantizacion: en los 1.379 pares de test de STS-B, el modelo float16 obtiene 51.45803 de Pearson x100 frente a 51.45857 del float32 con el mismo metodo, y un Recall@10 de 1.000000 respecto a float32.

## Capacidades

- Generacion de embeddings de frases en ingles mediante media de vectores de tokens y normalizacion L2.
- Similitud semantica entre frases (coseno) con calidad medida en STS-B.
- Recuperacion densa (dense retrieval) y busqueda por vecino mas cercano.
- Clustering y deduplicacion de textos por similitud.
- Extraccion de caracteristicas (`feature-extraction`) para pipelines downstream.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingue: no; solo ingles.
- No dispone de modo thinking ni capacidades de audio.

## Casos de uso

- Busqueda semantica en corpus grandes: indexar millones de documentos con vectores de 300 dimensiones y recuperar por similitud coseno. La ausencia de pasada por red permite indexar a un coste ordens de magnitud menor que un transformer.
- Deduplicacion de datasets de entrenamiento: calcular embeddings de cada registro y agrupar por similitud alta para eliminar near-duplicates antes de entrenar otros modelos.
- Clustering de tickets de soporte: agrupar consultas de usuarios por tema sin GPU, usando k-means sobre los embeddings normalizados.
- Filtrado previo en pipelines RAG: usar este modelo como primera etapa barata de recuperacion y reservar un cross-encoder o un modelo generativo para el reranking de los candidatos.
- Clasificacion de texto ligera: entrenar un clasificador lineal (regresion logistica, SVM) sobre los embeddings como baseline rapido antes de invertir en un modelo contextual.
- Deteccion de parafrasis y similitud entre pares de frases: adecuado para moderacion de contenido duplicado o comparacion de titulares, con la calidad medida en STS-B (~51.46 Pearson x100 con metodo raw).
- Prototipado y evaluacion offline: generar representaciones en CPU para experimentos que no requieren contexto, evitando el coste de GPU.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluacion sobre los 1.379 pares de test de STS-B, Pearson x100):

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (float16, tokenizador por defecto) | 51.45803 |
| STS-B Pearson x100 (float32, mismo metodo) | 51.45857 |
| Diferencia float16 vs float32 (puntos) | -0.00054 |
| Recall@10 float16 vs float32 | 1.000000 |
| STS-B Pearson x100, raw float32 (referencia de la familia) | 51.45857 |
| STS-B Pearson x100, SIF-10 float32 (referencia de la familia) | 74.43794 |

Nota: el metodo SIF-10 (ponderacion por frecuencia y eliminacion del componente principal del corpus de entrenamiento) mejora sustancialmente el resultado (74.44 frente a 51.46), pero requiere pasos adicionales no incluidos en este checkpoint raw. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en GPU; el modelo cabe en RAM. La tabla float16 ocupa aproximadamente 1.05 GB en disco y una cantidad similar en memoria al cargarse.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090) puede alojarlo sobradamente si se desea acelerar el lookup.
- Cabe en cualquier consumer GPU y en practicamente cualquier maquina con al menos 2 GB de RAM libre.
- Opciones de despliegue: libreria `fse>=2.0` (unica via documentada). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no se publican cifras. La model card indica explicitamente que "no se hace ninguna afirmacion sobre carga o velocidad". Al ser una media de lookups, la latencia esperada es de microsegundos por frase en CPU, pero es una estimacion, no un dato medido en la documentacion.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension | Vocabulario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fse/paragram-300-sl999-raw-float16 | Embeddings estaticos | 300 | 1.703.756 | no aplica | unknown | Hugging Face (fse) |
| GloVe 300d (Stanford) | Embeddings estaticos | 300 | ~400.000-2.2M segun version | no aplica | PDDL / Apache 2.0 segun version | Publico |
| fastText (es/en, 300d) | Embeddings estaticos con subpalabras | 300 | ~2M | no aplica | MIT (codigo) / CC BY-SA (vectores) | Publico |
| word2vec de Google News | Embeddings estaticos | 300 | 3M | no aplica | Apache 2.0 | Publico |
| Sentence-BERT (all-MiniLM-L6-v2) | Transformer bi-encoder | 384 | no aplica | 256-512 tokens | Apache 2.0 | Hugging Face |

Comparado con GloVe, fastText y word2vec, este modelo ofrece un vocabulario mayor (1.7M filas) y un formato moderno (safetensors, float16, integracion con `fse`), pero su licencia es desconocida, lo que limita su uso comercial frente a alternativas con licencia clara. Frente a un transformer bi-encoder como all-MiniLM-L6-v2, la calidad semantica es notablemente inferior (51.46 Pearson x100 frente a valores tipicos superiores a 80 en STS-B para MiniLM), pero el coste de inferencia es ordenes de magnitud menor.

## Limitaciones y advertencias

- Licencia desconocida: el autor no declara licencia y advierte explicitamente que `license: unknown` no concede permiso de uso. El uso comercial no esta autorizado por defecto; los titulares de derechos pueden solicitar la retirada.
- Solo ingles: no soporta otros idiomas, lo que descarta su uso en entornos multilingues.
- Sin contexto: al promediar vectores de tokens, el modelo no modela orden, negacion ni dependencias a larga distancia. Frases con las mismas palabras en orden distinto producen embeddings identicos.
- Calidad limitada: 51.46 Pearson x100 en STS-B es bajo para estandares actuales; el propio autor recomienda evaluar en los datos propios antes de adoptarlo.
- Riesgo de sesgo: los vectores Paragram-SL999 heredan los sesgos de los corpus de parafrasis sobre los que se entrenaron; no se documenta ninguna mitigacion.
- Riesgo de alucinacion: no aplica en sentido generativo, pero la similitud coseno puede producir falsos positivos en recuperacion cuando el vocabulario no cubre terminos del dominio.
- Dependencia de la libreria `fse>=2.0`: no es compatible con `sentence-transformers`, `transformers` ni `gensim` directamente. El tokenizador `fse_words@1` es propio y puede diferir del usado en evaluaciones externas.
- La cuantizacion a float16 introduce una perdida medida de -0.00054 puntos de Pearson, minima pero no nula; para maxima fidelidad existe la variante float32.
- La model card advierte que los vectores calculados son los de la tabla cuantizada, no los del modelo original antes de cuantizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/paragram-300-sl999-raw-float16
- Modelo base (gensim): https://huggingface.co/fse/paragram-300-sl999
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Paper de referencia Paragram: https://aclanthology.org/Q15-1025/
- Incidencias y solicitudes de retirada: https://github.com/oborchers/Fast_Sentence_Embeddings/issues
