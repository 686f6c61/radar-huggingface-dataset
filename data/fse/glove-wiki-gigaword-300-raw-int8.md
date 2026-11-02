# fse/glove-wiki-gigaword-300-raw-int8

## Resumen

`fse/glove-wiki-gigaword-300-raw-int8` es una version cuantizada a int8 de la tabla de embeddings estaticos GloVe entrenada sobre Wikipedia y Gigaword, publicada por el autor `fse` como parte del ecosistema de la libreria Fast Sentence Embeddings (fse). No es un modelo generativo ni un transformer: es una matriz de 400.000 filas por 300 dimensiones que convierte palabras en vectores densos, y cuya representacion de frase se obtiene como la media de los vectores de sus tokens, normalizada a longitud unitaria.

El modelo base es `fse/glove-wiki-gigaword-300` en float32, del que esta version deriva mediante la transformacion `quantize_rows@1`. El resultado ocupa 127.757.762 bytes en disco (unos 122 MiB) frente a los aproximadamente 480 MB de la tabla float32 equivalente, es decir, una reduccion de tamano cercana al 73 %. El total de parametros reportado por safetensors es de 123.756.475, que corresponde a los valores de la tabla cuantizada mas los metadatos asociados.

La relevancia de esta ficha es acotada pero concreta: para tareas de similitud semantica de frases con requisitos estrictos de memoria y latencia, los embeddings estaticos siguen siendo competitivos frente a encoders neuronales de cientos de millones de parametros. El propio autor documenta una perdida de 0,005 puntos de Pearson en STS-B respecto a la version float32 del mismo metodo, con un Recall@10 de 0,9938, lo que cuantifica de forma explicita el coste de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (tabla de lookup, sin transformer) |
| Parametros totales | 123.756.475 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo sin contexto; la representacion es una media de tokens sin ventana definida) |
| Tipos de cuantizacion | int8 (tabla almacenada); la libreria fse calcula en float32 |
| Idiomas soportados | en (ingles) |
| Licencia | PDDL (Public Domain Dedication and License) |
| Formato de pesos | safetensors (libreria `fse`, no compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de GloVe: una factorizacion de la matriz de coocurrencia de palabras con perdida de minimos cuadrados ponderada, entrenada sobre un corpus agregado de Wikipedia y Gigaword. El resultado es una tabla de 400.000 filas (vocabulario) por 300 dimensiones. No hay atencion, ni capas, ni mecanismo de contexto posicional: cada token se mapea a una fila fija y la representacion de una frase se construye agregando esas filas.

La innovacion tecnica de esta publicacion no esta en el entrenamiento, que hereda del modelo GloVe original, sino en el pipeline de conversion y cuantizacion de la libreria fse. La tabla float32 original (identificada por el hash `xxh3-128:2e100367bf4862e645b1ff921714eaf6`) se transforma con `quantize_rows@1`, se normaliza cada fila con `normalize@1` y se tokeniza con el esquema `fse_words@1`. El autor advierte explicitamente de que los vectores que produce el modelo son los de la tabla cuantizada, y que la fidelidad respecto al original se mide, no se garantiza por la model card. No se documenta el numero exacto de tokens de entrenamiento del corpus GloVe subyacente en la informacion disponible.

## Capacidades

- Extraccion de features a nivel de palabra y de frase: `encoder.encode(["A sentence."])` devuelve un vector por texto.
- Representacion de frases por media de tokens normalizada a norma unitaria.
- Similitud semantica entre frases y recuperacion por vecino mas cercano (el autor reporta Recall@10).
- Busqueda semantica sobre corpus en ingles con tablas de embeddings ligeras.
- Tokenizacion propia mediante `fse_words@1`, aplicable directamente sobre texto crudo.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de instrucciones.
- Capacidad multilingue nula: solo ingles.
- No dispone de modo thinking ni de ninguna capacidad agentica.

## Casos de uso

- Busqueda semantica en ingles sobre corpus pequenos o medianos: indexar documentos como medias de vectores de 300 dimensiones y recuperar por similitud coseno. La tabla de 122 MiB cabe en memoria en cualquier servidor y permite busquedas por producto escalar de coste O(300) por candidato, sin necesidad de GPU.
- Deduplicacion y agrupamiento de textos: calcular la similitud entre pares de frases para detectar duplicados o near-duplicates en pipelines de limpieza de datos. La perdida de 0,005 puntos de Pearson frente a float32 es despreciable para umbrales de similitud gruesos.
- Clasificacion de texto con modelos lineales: usar los vectores de frase como features de entrada para un clasificador logistico o SVM. Es un enfoque clasico que sigue siendo competitivo en tareas con pocos datos etiquetados y requisitos de latencia bajos.
- Filtrado previo en pipelines RAG: como etapa de recuperacion de primera fase de bajo coste antes de un reranker neuronal, reduciendo el numero de candidatos que llegan al modelo caro.
- Sistemas embebidos y edge computing: el modelo ocupa 0,1 GB en el repositorio y se ejecuta en CPU, lo que lo hace viable en dispositivos con memoria limitada donde un encoder de 100M+ parametros no cabria.
- Prototipado rapido de aplicaciones NLP: permite validar una hipotesis de producto (por ejemplo, un buscador interno) en minutos, sin infraestructura de GPU ni dependencias de transformers.
- Baseline de evaluacion: sirve como referencia inferior contra la que medir encoders neuronales en un dominio concreto, con la ventaja de que su coste de inferencia es determinista y trivial de perfilar.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los de STS-B (1.379 pares de test) y el Recall@10 interno del autor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, logicamente porque el modelo no genera texto.

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (int8, mismo metodo que float32) | 44,45861 |
| Diferencia frente a float32 mismo metodo (puntos) | -0,00549 |
| Recall@10 frente a float32 mismo metodo | 0,993836 |
| STS-B Pearson x100 (float32, raw) | 44,46410 |
| STS-B Pearson x100 (float32, SIF-10) | 69,22434 |
| Tokenizer por defecto, Pearson x100 | 44,45861 |
| Tamano del fichero del modelo | 127.757.762 bytes |

La comparacion controlada de STS-B usa el preprocesado NLTK del notebook 1.x a traves de una vista con tokenizer externo sobre esta misma tabla. La fila del tokenizer por defecto aplica `fse_words@1` sobre texto crudo. El Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra todas las demas, excluye la propia y resuelve empates por indice de fila. El autor no hace ninguna afirmacion sobre velocidad de carga o de inferencia.

## Requisitos de hardware

- VRAM estimada: no requiere GPU. La tabla int8 ocupa unos 122 MiB y la libreria calcula en float32, por lo que el pico de memoria en CPU ronda los 500 MB incluyendo la tabla expandida.
- GPU recomendadas: ninguna en particular; cualquier GPU con suficiente memoria puede alojar la tabla, pero no aporta ventaja significativa frente a CPU para este tipo de operacion.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con 2 GB de memoria compartida, y en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: exclusivamente la libreria `fse` (version 2.0 o superior). No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor declina explicitamente hacer afirmaciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| fse/glove-wiki-gigaword-300-raw-int8 | 123.756.475 (tabla int8) | 300 | no aplica | PDDL | safetensors (fse) |
| fse/glove-wiki-gigaword-300 (float32) | no disponible | 300 | no aplica | PDDL | gensim / fse |
| Encoders tipo all-MiniLM-L6-v2 | ~22M | 384 | 256 tokens | Apache-2.0 | safetensors (transformers) |
| Encoders tipo all-mpnet-base-v2 | ~109M | 768 | 384 tokens | Apache-2.0 | safetensors (transformers) |

La comparacion relevante no es de rendimiento en benchmarks generativos, sino de coste y calidad en similitud semantica. Los encoders de sentence-transformers superan ampliamente el Pearson de 44,46 en STS-B, pero requieren transformers, GPU para latencia baja y un orden de magnitud mas de memoria. Este modelo es la opcion cuando el presupuesto de memoria es de decenas de MB y la precision exigida es moderada.

## Limitaciones y advertencias

- Modelo solo en ingles; no procesa otros idiomas de forma fiable.
- Sin mecanismo de contexto: el orden de las palabras no se captura mas alla de la media de sus vectores, lo que limita la calidad en tareas que dependen de la estructura sintactica.
- El propio autor advierte de que los vectores son los de la tabla cuantizada y que la cercania al float32 se mide, no se garantiza. La perdida documentada es de 0,00549 puntos de Pearson en STS-B, con un Recall@10 de 0,9938.
- La calidad de la tokenizacion por defecto (`fse_words@1`) sobre texto crudo es inferior al preprocesado NLTK usado en la comparacion controlada; conviene evaluar ambas rutas en el dominio propio.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos en similitud: palabras fuera de vocabulario o poco frecuentes producen representaciones pobres.
- La licencia PDDL permite uso comercial sin restricciones de atribucion significativas, pero el autor indica que la licencia del modelo fuente aplica a su uso; conviene revisar los terminos de GloVe y de la implementacion Apache-2.0 por separado.
- Dependencia de una libreria poco extendida (`fse>=2.0`), lo que reduce la portabilidad y el soporte de la comunidad.
- Sin resultados de benchmarks mas alla de STS-B ni mediciones de latencia publicadas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/fse/glove-wiki-gigaword-300-raw-int8
- Modelo base: https://huggingface.co/fse/glove-wiki-gigaword-300
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- GloVe (Stanford NLP): https://github.com/stanfordnlp/GloVe
- Licencia PDDL 1.0: https://opendatacommons.org/licenses/pddl/1-0/
