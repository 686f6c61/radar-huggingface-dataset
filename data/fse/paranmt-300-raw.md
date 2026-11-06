# fse/paranmt-300-raw

## Resumen

`fse/paranmt-300-raw` es un modelo de embeddings estaticos de frases publicado por el usuario `fse` en Hugging Face. No se trata de un transformer generativo, sino de una tabla de vectores de palabras de 77.224 filas y 300 dimensiones en float32, sobre la que se aplica una media aritmetica de las filas de los tokens de un texto y una normalizacion a longitud unitaria. El modelo se distribuye como conversion del modelo gensim `fse/paranmt-300`, que a su vez deriva de los vectores ParaNMT descritos por Wieting y Kiela (2018).

El modelo resuelve el problema de obtener representaciones de frases rapidas y de bajo coste computacional sin necesidad de una GPU ni de un transformer. Al ser una tabla de embeddings estatica, la codificacion de una frase se reduce a una busqueda en tabla y una media ponderada, lo que permite procesar grandes volumenes de texto con latencia minima y huella de memoria reducida (el fichero de pesos ocupa unos 93,8 MB).

Es relevante en el contexto actual como linea base ligera para tareas de similitud semantica, deduplicacion y recuperacion aproximada, y por su integracion con la libreria `fse` (Fast Sentence Embeddings), que permite comparar metodos de pooling (raw frente a SIF-10) y formatos de almacenamiento (float32, float16, int8) sobre el mismo conjunto de vectores. Su principal caveat es la licencia: el autor original no declaro terminos de uso, y los datos de entrenamiento subyacentes (CzEng 1.6) solo son libres para investigacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (tabla gensim) con pooling por media de tokens y normalizacion L2 |
| Parametros totales | 23.815.132 (77.224 filas x 300 dimensiones + metadatos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: pooling sobre todos los tokens del texto) |
| Tipos de cuantizacion | float32, float16, int8 |
| Idiomas soportados | en (ingles) |
| Licencia | unknown (el autor no declaro licencia; no otorga permiso de uso) |
| Formato de pesos | safetensors |
| Dimension del embedding | 300 |
| Vocabulario | 77.224 filas |
| Tokenizer | `fse_words@1` |
| Pasos por fila | normalize@1 |
| Fingerprint | xxh3-128:f870e4619c3e5dd082be1809d1fb7786 |
| Tamano del repositorio | 0,1 GB (fichero de modelo: 93.858.331 bytes) |
| Libreria requerida | fse >= 2.0 |
| Modelo base | fse/paranmt-300 (revision a08e15771891207a22f840a3091a00a1657d888b) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo neuronal profundo: es una matriz de embeddings de palabras de 77.224 x 300 en float32. La representacion de una frase se obtiene calculando la media de las filas correspondientes a los tokens del texto y normalizando el vector resultante a norma unitaria (metodo "raw"). El modelo ofrece ademas la variante SIF-10, que aplica una ponderacion fija por frecuencia y elimina el componente principal del corpus de entrenamiento, segun la formulacion de Arora et al. (2017).

Los vectores subyacentes proceden de ParaNMT-50M, un corpus de 50 millones de pares de frases en ingles generadas por traduccion automatica inversa, y fueron entrenados originalmente por Wieting y Kiela con el objetivo de capturar similitud semantica de frases. La model card no documenta el numero exacto de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este tipo de modelo). El corpus de origen de los datos de entrenamiento es CzEng 1.6, disponible solo para investigacion no comercial. La innovacion tecnica destacable es la propia conversion al formato `fse`: tabla preparada en safetensors con tokenizer propio y la posibilidad de medir el impacto de float16 e int8 sobre vecinos mas cercanos.

## Capacidades

- Generacion de embeddings de frases en ingles mediante media de vectores de tokens y normalizacion L2.
- Similitud semantica entre frases (coseno) con calidad medida en STS-B (Pearson x100 = 79,81644 en float32 con metodo raw).
- Recuperacion de vecinos mas cercanos sobre colecciones de frases (Recall@10 = 1,000000 frente a la misma variante en float32).
- Deduplicacion y agrupamiento de textos por similitud de embeddings.
- Codificacion de grandes volumenes de texto sin GPU, al ser una operacion de busqueda en tabla y media.
- Soporte de cuantizacion a float16 e int8 para reducir el tamano del fichero (fse calcula en float32 en todos los casos).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Deduplicacion de corpus en ingles: codificar cada frase con `encoder.encode([...])` y agrupar por similitud coseno para eliminar duplicados o casi duplicados en pipelines de limpieza de datos, aprovechando que la codificacion no requiere GPU.
- Recuperacion semantica ligera en buscadores internos: indexar frases o parrafos cortos como vectores de 300 dimensiones y usar busqueda por producto interno en FAISS o similar, con un coste de almacenamiento de 1,2 KB por frase en float32 o 0,3 KB en int8.
- Filtrado y triaje previo a un modelo grande: usar los embeddings como primera etapa de recuperacion barata y reservar un transformer de mayor coste solo para los candidatos mas prometedores.
- Clasificacion de textos por similitud a prototipos: construir centroides por categoria a partir de frases de ejemplo y asignar etiquetas por vecino mas cercano, util para moderacion o enrutado de tickets.
- Analisis de similitud en investigacion linguistica: comparar pares de frases en ingles (parafrasis, implicacion, contradiccion) con una linea base reproducible y de bajo coste, usando la metrica STS-B documentada.
- Evaluacion comparativa de metodos de pooling: emplear el modelo como banco de pruebas para medir el efecto de raw frente a SIF-10, o de float32 frente a float16 e int8, sobre el conjunto STS-B de 1.379 pares.
- Extraccion de caracteristicas para modelos downstream: usar los vectores de 300 dimensiones como entrada de clasificadores lineales o modelos de regresion en tareas de NLP en ingles.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de la model card sobre el conjunto STS-B (1.379 pares de test):

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (raw, float32) | 79,81644 |
| STS-B Pearson x100 (SIF-10, float32) | 78,11215 |
| Diferencia frente a misma variante float32 (puntos) | +0,00000 |
| Recall@10 frente a misma variante float32 | 1,000000 |
| STS-B Pearson x100 con tokenizer por defecto | 79,81644 |
| Tamano del fichero de modelo (bytes) | 93.858.331 |

La comparacion controlada de STS-B usa el preprocesado NLTK del notebook de la version 1.x a traves de una vista con tokenizer externo de la misma tabla. La fila del tokenizer por defecto usa el tokenizer `fse_words@1` guardado sobre texto en bruto. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra todas las demas, excluye la propia fila y resuelve empates por indice de fila. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (fichero de 93,8 MB); aproximadamente 47 MB en float16 y 24 MB en int8.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) o incluso CPU es suficiente; el cuello de botella es el ancho de banda de memoria, no el computo.
- Cabe en cualquier GPU consumer y en entornos sin GPU (CPU, Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: libreria `fse` (>= 2.0) mediante `fse.Encoder.from_pretrained`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles de forma explicita en la informacion proporcionada. La model card indica que no se emite ninguna afirmacion sobre velocidad o tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | STS-B Pearson x100 | Licencia | Formato |
|---|---|---|---|---|---|---|
| fse/paranmt-300-raw | 23,8 M | 300 | no aplica | 79,81644 | unknown | safetensors |
| fse/paranmt-300 (gensim) | no disponible | 300 | no aplica | no disponible | unknown | gensim |
| Otros modelos de embeddings estaticos (p. ej. GloVe o fastText promediados) | no disponible | 300 | no aplica | no disponible | varía | varios |

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos comparables, por lo que no es posible establecer una comparacion cuantitativa con `Sentence-BERT`, `E5` u otros embeddings de frases basados en transformers. La unica comparacion interna disponible es la de metodos de pooling (raw frente a SIF-10) y formatos (float32 frente a float16 e int8) sobre el mismo modelo.

## Limitaciones y advertencias

- Licencia `unknown`: el autor original no declaro terminos de uso y la model card indica explicitamente que `license: unknown` no otorga permiso. El uso comercial no esta autorizado de forma clara.
- Los datos de entrenamiento subyacentes (CzEng 1.6) solo son libres para investigacion no comercial, lo que no establece una licencia para los vectores derivados.
- Solo soporta ingles; no hay capacidades multilingues.
- Al ser una media de embeddings de palabras, el modelo pierde el orden de las palabras y no captura negaciones, estructura sintactica compleja ni dependencias de largo alcance.
- No es un modelo generativo: no produce texto, no razona y no admite tool calling ni agentes.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos en similitud semantica por la perdida de estructura.
- La calidad en dominios especializados (medico, legal, tecnico) no esta documentada y puede degradarse respecto a modelos entrenados en esos dominios.
- El rendimiento en float16 e int8 se describe solo en terminos de cambios de vecinos y reduccion de tamano; no se garantiza paridad exacta con float32.
- La tokenizacion por defecto (`fse_words@1`) y la tokenizacion externa con NLTK producen resultados identicos en STS-B segun la model card, pero pueden diferir en otros corpus.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria ni mantenimiento documentado.
- Los derechos habientes pueden solicitar la retirada del modelo a traves de las issues del repositorio de `fse`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/paranmt-300-raw
- Modelo base (gensim): https://huggingface.co/fse/paranmt-300
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Repositorio de ParaNMT: https://github.com/jwieting/para-nmt-50m
- Paper de ParaNMT (Wieting y Kiela, 2018): https://aclanthology.org/P18-1042/
- Corpus CzEng 1.6: https://ufal.mff.cuni.cz/czeng/czeng16
- Issues para solicitudes de retirada: https://github.com/oborchers/Fast_Sentence_Embeddings/issues
