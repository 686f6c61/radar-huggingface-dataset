# seanfarrell/pettag_emed_train

## Resumen

`seanfarrell/pettag_emed_train` es un modelo de embeddings de frases (sentence transformer) obtenido por ajuste fino (fine-tuning) del conocido `sentence-transformers/all-mpnet-base-v2`. Lo desarrolla el usuario de HuggingFace `seanfarrell` y su función es proyectar texto a un espacio vectorial denso de 768 dimensiones para tareas de similitud semántica, búsqueda semántica, agrupamiento (clustering) y clasificación. Por el vocabulario que aparece tanto en el widget como en los ejemplos de entrenamiento, el ajuste está claramente orientado al dominio médico y, más concretamente, a terminología clínica (términos como *trachoma*, *impetigo*, *sunburn*, *symblepharon*).

El modelo parte de una arquitectura MPNet (encoder transformer enmascarado y permutado) con 109.486.464 parámetros totales, tal y como reflejan los pesos en safetensors del repositorio (aproximadamente 0,4 GB). La salida es un vector de 768 dimensiones normalizado, y la similitud se calcula por producto escalar (coseno) entre embeddings. Un detalle crítico es que la longitud máxima de secuencia configurada es de solo 32 tokens, muy inferior a los 384 tokens que soporta el modelo base, lo que limita su uso a entradas muy cortas (términos o frases breves).

Su relevancia actual es limitada dentro del ecosistema generalista: cuenta con 12 descargas y 0 *likes* en el momento de redactar esta ficha, y no publica licencia ni idiomas soportados. Resulta interesante sobre todo como ejemplo de ajuste fino especializado en normalización de terminología médica (emparejamiento de términos con variaciones de mayúsculas/minúsculas y sinónimos clínicos), más que como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (encoder transformer) + pooling tipo *mean* + normalizacion |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 tokens (longitud maxima de secuencia configurada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, tipicamente FP32/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 |
| Funcion de similitud | similitud coseno |
| Pipeline | sentence-similarity / feature-extraction |
| Libreria | sentence-transformers |
| Modelo base | sentence-transformers/all-mpnet-base-v2 |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 12 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el patron estandar de la libreria `sentence-transformers`: un modulo `Transformer` con arquitectura `MPNetModel` que actua como extractor de caracteristicas (devuelve el `last_hidden_state`), seguido de un modulo `Pooling` con `pooling_mode: mean` y `embedding_dimension: 768`, y finalmente un modulo `Normalize` que normaliza el vector de frase. El encoder MPNet procede del modelo base `sentence-transformers/all-mpnet-base-v2`, que ya incorpora preentrenamiento MPNet (masked and permuted pre-training) seguido de un ajuste contrastivo sobre pares de frases. La innovacion de MPNet respecto a BERT o RoBERTa es que combina prediccion de tokens enmascarados con una permutacion de la secuencia, de modo que el modelo ve todas las posiciones y modela dependencias sin las limitaciones de otros esquemas de preentrenamiento.

En cuanto al entrenamiento, la model card indica un dataset de 10.000.000 de muestras con dos columnas (`sentence_0` y `sentence_1`) y una funcion de perdida `MultipleNegativesRankingLoss`, tipica del entrenamiento contrastivo de sentence transformers, donde los pares positivos se acercan y el resto de ejemplos del lote actuan como negativos. Las estadisticas aproximadas (sobre las primeras 100 muestras) indican que las frases son muy cortas: entre 4 y 30 tokens, con una media de ~11 tokens. Los ejemplos mostrados consisten en terminos clinicos repetidos con variaciones de capitalizacion (por ejemplo, `Lateral dislocation of proximal end of tibia` frente a `lateral dislocation of proximal end of tibia`), lo que sugiere que el objetivo principal del ajuste fue hacer el modelo insensible a mayusculas/minusculas y robusto en emparejamiento de terminologia medica. No se documenta si hubo RLHF, DPO u otra etapa de alineacion, ni la composicion completa del dataset.

## Capacidades

- Generacion de embeddings de frases: convierte texto corto en vectores densos de 768 dimensiones normalizados.
- Similitud semantica entre frases: calculo de puntuaciones de similitud coseno entre pares de entradas.
- Busqueda semantica (*semantic search*): indexacion y recuperacion de textos por significado en lugar de coincidencia literal.
- *Paraphrase mining*: deteccion de frases equivalentes o casi equivalentes.
- Clasificacion de texto: uso de los embeddings como caracteristicas de entrada a un clasificador *downstream*.
- Agrupamiento (clustering): agrupacion de textos por proximidad en el espacio de embeddings.
- Especializacion en terminologia medica/clinica, segun se deduce del vocabulario del widget y del dataset de entrenamiento.
- Robustez aparente a variaciones de mayusculas y minusculas en los terminos (objetivo principal del ajuste fino).
- Compatibilidad con *text-embeddings-inference* y *endpoints* de HuggingFace, segun los tags del repositorio.
- No es un modelo generativo: no produce texto, no soporta *tool calling*, ni razonamiento multi-paso, ni vision, ni audio.

## Casos de uso

- Normalizacion de terminologia clinica: dado un termino introducido con cualquier combinacion de mayusculas/minusculas o ligeras variantes, el modelo genera un embedding que permite mapearlo al termino canonico de un catalogo interno, gracias a su ajuste especifico sobre pares de este tipo.
- Busqueda semantica en historiales medicos o codificacion (ICD, SNOMED): indexar descripciones de diagnosticos y recuperar las mas similares a una consulta, para ayudar en la asignacion de codigos.
- Deduplicacion de registros de diagnosticos: agrupar entradas que describen la misma condicion aunque esten escritas de forma distinta, usando clustering sobre los embeddings.
- Construccion de un indice vectorial para un sistema RAG sobre notas clinicas cortas: generar embeddings de sintomas o diagnosticos y recuperar documentos relacionados por similitud.
- Clasificacion automatica de sintomas o diagnosticos en categorias: usar los embeddings de 768 dimensiones como entrada a un clasificador ligero (regresion logistica, SVM) para etiquetado de especialidad o gravedad.
- Deteccion de duplicados en catalogos de farmacos o terminos medicos: comparar embeddings para identificar entradas equivalentes antes de fusionar bases de datos.
- *Matching* termino-a-termino en pipelines de interoperabilidad sanitaria: alinear vocabularios de distintos sistemas (por ejemplo, un HIS con un sistema de codificacion) mediante similitud semantica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni MTEB, ni STS, ni tareas de clasificacion especificas del dominio clinico), y no hay ningun resultado comparable reportado por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: con 109 millones de parametros, en FP32 los pesos ocupan aproximadamente 440 MB, y en FP16/FP32 reducido cerca de 220 MB. Anadiendo el *overhead* de activaciones y del framework, cabe comodamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente, incluidas RTX 3090, RTX 4090, A10, L4, T4, A100 o H100. No se necesita hardware de gama alta para este tamano.
- Compatibilidad con GPU de consumo: si, cabe sin problema en GPUs de consumo con 4 GB o mas de VRAM (GTX 1650, RTX 3060, etc.) e incluso puede ejecutarse en CPU con latencias aceptables para lotes pequenos.
- Opciones de despliegue: `sentence-transformers` (uso directo), HuggingFace *Text Embeddings Inference* (TEI, mencionado en los tags) para servir embeddings a escala, los *Inference Endpoints* de HuggingFace (tag `endpoints_compatible`), y exportacion a ONNX para inferencia optimizada. Ollama y vLLM no son las herramientas habituales para modelos de embeddings de este tipo.
- Latencia y throughput: no disponible en la informacion proporcionada. Al ser un modelo pequeno y con secuencias de solo 32 tokens, el throughput por lote deberia ser alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seanfarrell/pettag_emed_train | 109,5 M | 768 | 32 tokens | no disponible | HuggingFace (12 descargas) |
| sentence-transformers/all-mpnet-base-v2 | 109 M | 768 | 384 tokens | Apache-2.0 (segun su model card publica) | HuggingFace, ampliamente usado |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 384 | 256 tokens | Apache-2.0 (segun su model card publica) | HuggingFace, muy popular |

Nota: los datos de los modelos comparativos corresponden a informacion publica ampliamente conocida; no se dispone de datos de rendimiento comparativo especificos entre `pettag_emed_train` y estas alternativas, ya que el modelo no publica benchmarks. La diferencia mas llamativa frente al modelo base es la reduccion de la longitud maxima de secuencia de 384 a 32 tokens.

## Limitaciones y advertencias

- Ventana de contexto extremadamente corta (32 tokens): cualquier texto que supere esa longitud se truncara, lo que limita su uso a terminos o frases muy breves.
- Licencia no especificada: no se puede confirmar que sea apto para uso comercial. Al derivar de `all-mpnet-base-v2` (Apache-2.0), conviene verificar las condiciones, pero la ausencia de licencia explicita es un riesgo legal en produccion.
- Idiomas no declarados: por el vocabulario del dataset (terminologia clinica en ingles), es probable que este optimizado para ingles, pero no hay confirmacion.
- Especializacion muy estrecha: el ajuste parece centrado en emparejar terminos medicos con variaciones de formato (mayusculas/minusculas). Fuera de ese dominio, su calidad puede degradarse respecto al modelo base original.
- Sesgos: no se documenta ningun estudio de sesgos. Un modelo ajustado sobre terminologia clinica puede heredar sesgos presentes en los datos de entrenamiento.
- Alucinacion: al no ser un modelo generativo, no "alucina" texto, pero puede producir similitudes espurias (falsos positivos) entre terminos no relacionados si se usa fuera de su dominio.
- Adopcion y soporte: 12 descargas y 0 *likes* indican que es un modelo practicamente sin validacion por parte de la comunidad, sin garantias de mantenimiento, y sin documentacion adicional sobre casos de fallo.
- Sin benchmarks: no hay evidencia publicada de que supere al modelo base en tareas de similitud general; su ventaja, si existe, es especifica del dominio clinico y de la insensibilidad a mayusculas/minusculas.
- Datos de entrenamiento desconocidos en su composicion completa: no se detalla la procedencia del millon de pares, lo que impide evaluar posibles problemas de procedencia o consentimiento de datos clinicos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/seanfarrell/pettag_emed_train
- Modelo base: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos con libreria sentence-transformers en HuggingFace: https://huggingface.co/models?library=sentence-transformers
- Paper de Sentence-BERT (arxiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper referenciado en los tags (arxiv:1807.03748, *An Efficient Framework for Learning Sentence Representations*): https://arxiv.org/abs/1807.03748
