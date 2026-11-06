# fse/glove-wiki-gigaword-300-raw-float16

## Resumen

`fse/glove-wiki-gigaword-300-raw-float16` es un modelo de embeddings estaticos de palabras publicado por el autor `fse` en Hugging Face. No es un modelo generativo ni un transformer: es una tabla de 400.000 filas por 300 dimensiones en float16 que se obtiene de la conversion del modelo gensim `fse/glove-wiki-gigaword-300`, a su vez derivado de los vectores GloVe entrenados sobre Wikipedia y Gigaword. El modelo calcula la representacion de una frase como la media normalizada a longitud unitaria de las filas correspondientes a sus tokens.

Su relevancia es practica: ofrece un encoder de frases extremadamente ligero (0,2 GB de repositorio, 123.356.475 parametros) que cabe en cualquier entorno, incluso CPU, y que sirve como linea base para busqueda semantica, clustering o clasificacion de texto en ingles. La variante `-raw` indica que no aplica ponderacion SIF, no que prescinda de la normalizacion. El modelo esta pensado para la libreria `fse` (Fast Sentence Embeddings), version 2.0 o superior.

La licencia es PDDL (Public Domain Dedication and License), la misma que declaran los autores de GloVe para los vectores preentrenados; la implementacion Apache-2.0 de GloVe es un termino separado. El unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (tabla de lookup); frase = media de filas normalizada |
| Parametros totales | 123.356.475 (400.000 filas x 300 dimensiones + metadatos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo con contexto; se aplica pooling sobre los tokens de un texto) |
| Tipos de cuantizacion | float16 (tabla almacenada); el modelo base existe en float32, float16 e int8 segun la model card |
| Idiomas soportados | en (ingles) |
| Licencia | PDDL (Public Domain Dedication and License) |
| Formato de pesos | safetensors (libreria `fse`) |
| Vocabulario | 400.000 filas (`fse_words@1` como tokenizer) |
| Dimension del vector | 300 (float16) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | `fse/glove-wiki-gigaword-300` (gensim, revision `4e5ad402664236b85be45a0d107b95259ba8a909`) |
| Normalizacion | `normalize@1` (media de filas normalizada a longitud unitaria por defecto) |
| Fingerprint de la tabla | `xxh3-128:808b1ba980661cbe984a5d34f0a79d2b` |

## Arquitectura y entrenamiento

No hay entrenamiento propio en este artefacto. Se trata de una conversion cuantizada de una tabla de embeddings GloVe preentrenada: los vectores originales provienen de GloVe entrenado sobre Wikipedia y Gigaword, y la tabla fue almacenada mediante el paso `quantize_rows@1` a partir de la tabla float32 con fingerprint `xxh3-128:2e100367bf4862e645b1ff921714eaf6`. El tokenizer asociado es `fse_words@1` y cada fila pasa por el paso `normalize@1`.

El calculo de la representacion de una frase es una media de las filas de sus tokens, sin atencion, sin capas y sin mecanismo de contexto posicional. El sufijo `-raw` significa ausencia de ponderacion SIF, no ausencia de normalizacion; tanto los modelos `-raw` como los `-sif10` se cargan normalizados por defecto. La model card advierte que los vectores calculados son los de la tabla cuantizada, y que `fse` los computa en float32 en el backend de CPU de forma bit a bit coincidente con su referencia; la proximidad a los vectores float32 originales esta medida, no garantizada por el archivo.

## Capacidades

- Extraccion de features de texto: genera un vector de 300 dimensiones por frase mediante media de embeddings de tokens.
- Embeddings de frases y de oraciones: utilizable para similitud semantica, recuperacion y clustering.
- Busqueda semantica en ingles: representacion densa de bajo coste para indexar documentos y frases.
- Compatibilidad con `fse>=2.0`: carga mediante `fse.Encoder.from_pretrained(...)` con opcion `normalize=False`.
- Carga opcional sin normalizacion para integrar una cabeza lineal en la tabla.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto, codigo, matematicas ni vision: es un modelo de embedding puro.
- Sin modo thinking, sin audio y sin capacidades multimodales.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Busqueda semantica en ingles: indexar documentos divididos en frases y recuperar los mas similares a una consulta mediante similitud coseno. El modelo es adecuado por su tamano reducido y por producir vectores normalizados listos para indice.
- Clustering y deduplicacion de textos: agrupar titulares, tickets o resenas en funcion de la similitud de sus embeddings; el coste computacional es minimo al no requerir GPU.
- Clasificacion de texto como caracteristica de entrada: usar el vector de 300 dimensiones como feature para un clasificador lineal (regresion logistica o SVM) en tareas de moderacion o enrutado.
- Linea base de recuperacion en investigacion: comparar sistemas de embedding neuronales mas complejos contra esta referencia estatica y ligera; la model card reporta Pearson x100 de 44,46 en STS-B para el modo raw float32.
- Deteccion de similitud entre consultas o duplicados en soporte: medir la cercania entre descripciones de incidencias con un umbral fijo, sin infraestructura de inferencia pesada.
- Prototipado en CPU y entornos con recursos limitados: el repositorio ocupa 0,2 GB y no requiere GPU, por lo que puede embeberse en contenedores pequenos o ejecutarse en servidores sin aceleradores.
- Filtrado previo en pipelines RAG: como primera etapa de recuperacion de bajo coste antes de un reranker mas pesado.

## Benchmarks y rendimiento

Los datos disponibles se limitan a STS-B y a la comparacion de precision entre formatos de almacenamiento, no a benchmarks generativos.

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (este modelo, float16, tokenizer por defecto) | 44,46390 |
| STS-B Pearson x100 (mismo metodo, float32) | 44,46410 |
| Diferencia frente a float32 mismo metodo (puntos) | -0,00020 |
| Recall@10 frente a float32 mismo metodo | 0,999819 |
| STS-B Pearson x100 (raw float32, referencia de la model card) | 44,46410 |
| STS-B Pearson x100 (SIF-10 float32, referencia de la model card) | 69,22434 |
| Bytes del archivo del modelo | 246.157.570 |

Las cifras de STS-B proceden de los 1.379 pares de test y se evaluan con la vista de tokenizer externo del notebook 1.x de `fse`; la fila del tokenizer por defecto usa `fse_words@1` sobre texto crudo. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra el resto, excluyendo la propia fila y resolviendo empates por indice. La model card no hace ninguna afirmacion sobre velocidad o tiempo de carga.

## Requisitos de hardware

- VRAM estimada: practicamente nula en GPU; el archivo del modelo ocupa 246.157.570 bytes (unos 235 MB) y cabe en memoria de sistema de cualquier equipo.
- GPU recomendadas: ninguna en particular; funciona en CPU. En GPU puede residir integramente en cualquier tarjeta con mas de 1 GB, incluida una GTX 1050 o similar.
- Cabe en GPU de consumo: si, en todas, al no ser un modelo generativo.
- Opciones de despliegue: la libreria `fse` (version 2.0 o superior) es la via documentada; no hay indicacion de soporte en vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponible. La model card declara explicitamente que no se hace ninguna afirmacion de velocidad.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones | Vocabulario / parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `fse/glove-wiki-gigaword-300-raw-float16` (este) | Embeddings estaticos GloVe cuantizados | 300 | 400.000 filas / 123.356.475 parametros | no aplica | PDDL | Hugging Face via `fse` |
| `fse/glove-wiki-gigaword-300` | Embeddings estaticos GloVe en float32 | 300 | no disponible en la informacion | no aplica | PDDL | Hugging Face via `fse` (modelo base) |
| `fse/glove-wiki-gigaword-300-sif10` | Embeddings estaticos GloVe con ponderacion SIF | 300 | no disponible en la informacion | no aplica | PDDL | Hugging Face via `fse` |

No se dispone de datos de comparacion con modelos de embeddings neuronales como Sentence-BERT o E5 en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- Sin contexto posicional: el significado de una frase se reduce a la media de los vectores de sus palabras, por lo que se pierden relaciones sintacticas y de orden.
- Rendimiento limitado en STS-B: Pearson x100 de 44,46 en modo raw, frente a 69,22 del modo SIF-10; el autor recomienda evaluar la eleccion sobre los datos propios.
- Solo ingles: el vocabulario y los vectores estan entrenados sobre Wikipedia y Gigaword en ingles.
- Los vectores calculados corresponden a la tabla cuantizada; la cercania a los float32 originales esta medida, no garantizada por el archivo.
- Riesgo de alucinacion no aplica en el sentido generativo, pero la similitud semantica puede producir recuperaciones irrelevantes con textos fuera de dominio o vocabulario no cubierto.
- Licencia PDDL: permite uso comercial segun la dedicatoria de dominio publico, pero conviene revisar los terminos exactos y la atribucion a los autores de GloVe.
- Requiere la libreria `fse>=2.0`; no es directamente consumible con `transformers`, `sentence-transformers` ni `vLLM` sin adaptacion.
- El modelo se creo en 2026-11-01 y cuenta con 40 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa muy limitados.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/fse/glove-wiki-gigaword-300-raw-float16
- Modelo base: https://huggingface.co/fse/glove-wiki-gigaword-300
- Repositorio de fse (Fast Sentence Embeddings): https://github.com/oborchers/Fast_Sentence_Embeddings
- Licencia PDDL: https://opendatacommons.org/licenses/pddl/1-0/
- GloVe (autores y terminos de los vectores): https://github.com/stanfordnlp/GloVe
