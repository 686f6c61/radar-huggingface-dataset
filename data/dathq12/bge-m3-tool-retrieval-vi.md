# Dathq12/bge-m3-tool-retrieval-vi

## Resumen

Dathq12/bge-m3-tool-retrieval-vi es un modelo de embeddings de frases (sentence transformer) obtenido por ajuste fino supervisado de BAAI/bge-m3. Su funcion es mapear textos a un espacio vectorial denso de 1024 dimensiones, optimizado especificamente para recuperacion de herramientas (tool retrieval): dada una consulta de usuario en lenguaje natural, el modelo debe situar en las primeras posiciones el identificador de la herramienta o funcion correcta dentro de un catalogo. El problema que resuelve es el enrutado de peticiones en agentes basados en LLM, donde el selector de herramientas debe elegir entre decenas o cientos de funciones descritas en formato corto (nombre + descripcion).

El modelo se distribuye a traves de la libreria sentence-transformers con pesos en safetensors y una arquitectura XLMRobertaModel seguida de una capa de pooling tipo CLS y una normalizacion L2. La longitud maxima de secuencia declarada en la model card es de tan solo 192 tokens, muy inferior a los 8192 tokens del modelo base, lo que sugiere que el ajuste fino se ha orientado a descripciones de herramientas y consultas cortas. El autor no declara licencia, idiomas soportados ni numero de parametros, y el modelo cuenta con cero descargas y cero likes en el momento de la consulta.

La relevancia de esta ficha es acotada: se trata de un ajuste fino de autor individual, sin validacion externa (los resultados del model-index figuran como no verificados) y entrenado sobre un conjunto propio de 70.988 ejemplos. Resulta interesante como referencia metodologica para quien quiera replicar un pipeline de tool retrieval sobre bge-m3, pero sus datos publicos son incompletos y su adopcion en produccion exigiria auditoria previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLMRobertaModel + Pooling (cls) + Normalize (L2) |
| Parametros totales | no disponible (la ficha no lo declara; deriva de BAAI/bge-m3) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 192 tokens (maximum sequence length declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card deja el campo Language como desconocido) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria sentence-transformers) |
| Dimension de salida | 1024 dimensiones |
| Funcion de similitud | similitud coseno |
| Modalidad | texto |
| Modelo base | BAAI/bge-m3 (revision 5617a9f61b028005a4858fdac845db406aefb181) |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es la de un sentence transformer clasico de tres modulos en serie: un encoder XLMRobertaModel configurado para feature-extraction que devuelve el last_hidden_state; una capa de pooling en modo cls con embedding_dimension de 1024 y con include_prompt activado, es decir, el token de prompt se mantiene en la secuencia antes de aplicar el pooling sobre el token de clase; y una capa de normalizacion que produce el embedding final de frase. La similitud entre embeddings se calcula por producto escalar de vectores normalizados, equivalente a similitud coseno.

El ajuste fino se realizo con la libreria sentence-transformers sobre un conjunto de 70.988 ejemplos (etiqueta dataset_size:70988) y con funciones de perdida de ranking por contraste: MultipleNegativesRankingLoss y su variante con cache de gradientes CachedMultipleNegativesRankingLoss, lo que permite lotes efectivos grandes con memoria limitada. Este esquema entrena pares consulta-herramienta positiva frente a negativos en el lote, sin necesidad de negativos etiquetados manualmente. No se declara en la informacion disponible si hubo una fase posterior de RLHF, DPO o destilacion, ni la composicion exacta del dataset. El campo language de la model card aparece comentado como desconocido. En los ejemplos de widget de la propia ficha aparecen parametros escritos en vietnamita ("Tham sô"), lo que apunta a un uso orientado a ese idioma, aunque el autor no lo confirma en ningun campo estructurado.

## Capacidades

- Generacion de embeddings de frases y parrafos en un espacio denso de 1024 dimensiones con similitud coseno.
- Similitud semantica texto-texto (semantic textual similarity).
- Recuperacion semantica (semantic search) sobre catalogos de documentos o de herramientas.
- Recuperacion de herramientas y function calling: ordena descripciones de funciones (por ejemplo "get_joke. Get a random joke") segun su relevancia para una consulta del usuario.
- Mineria de parafrasis y deteccion de duplicados cercanos.
- Tareas de clasificacion y clustering derivadas, usando los embeddings como caracteristica de entrada.
- Extraccion de caracteristicas (feature-extraction) a nivel de frase mediante el pipeline de sentence-transformers.
- No soporta generacion de texto, razonamiento multi-paso, vision, audio, ni tool calling nativo: es exclusivamente un encoder de representaciones.

## Casos de uso

- Enrutado de herramientas en agentes LLM: el catalogo de funciones se indexa una sola vez con el modelo y, en tiempo de inferencia, cada consulta del usuario se embebe y se compara por similitud coseno con las descripciones de herramientas; el nombre de la funcion mejor puntuada se inyecta en el prompt del LLM que ejecuta la accion. Es el escenario para el que fue entrenado explicitamente.
- Busqueda semantica en documentacion tecnica: indexar fragmentos de manuales o APIs y recuperar los pasajes relevantes para una pregunta del usuario, aprovechando la normalizacion L2 para usar busqueda por producto interno en FAISS, Qdrant, Milvus o pgvector.
- Deduplicacion de tickets de soporte: agrupar incidencias por similitud de embeddings para detectar problemas recurrentes y consolidar colas de atencion, con clustering sobre los vectores de 1024 dimensiones.
- Clasificacion de intenciones sin entrenamiento adicional: usar los embeddings como entrada de un clasificador lineal ligero (regresion logistica, SVM) para categorizar consultas entrantes en un chatbot o en un sistema de triaje.
- Filtrado de ruido en pipelines de datos: comparar pares de registros y descartar aquellos con similitud superior a un umbral para evitar duplicados en conjuntos de entrenamiento o en catalogos de productos.
- Recuperacion multilingue asistida: al heredar el encoder de bge-m3, el modelo conserva la capacidad de representar textos en varios idiomas en un espacio comun, lo que permite indexar herramientas descritas en un idioma y consultarlas en otro, siempre que la similitud observada se valide empiricamente para el par de idiomas concreto.
- Seleccion de herramientas en asistentes de voz o chat en vietnamita: los ejemplos de la ficha incluyen parametros en vietnamita, por lo que el modelo puede emplearse para enrutar intenciones en ese idioma, sujeto a verificacion con datos propios.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre un conjunto de validacion propio ("custom val") y marcados como no verificados.

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0.4588 |
| Cosine Accuracy@3 | 0.6620 |
| Cosine Accuracy@5 | 0.7302 |
| Cosine Accuracy@10 | 0.7961 |
| Cosine Precision@1 | 0.4588 |
| Cosine Precision@3 | 0.2207 |
| Cosine Precision@5 | 0.1460 |
| Cosine Precision@10 | 0.0796 |
| Cosine Recall@1 | 0.4588 |
| Cosine Recall@3 | 0.6620 |
| Cosine Recall@5 | 0.7302 |
| Cosine Recall@10 | 0.7961 |
| Cosine NDCG@10 | 0.6287 |
| Cosine MRR@10 | 0.5750 |
| Cosine MAP@100 | 0.5810 |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB ni BEIR), lo cual es esperable en un modelo exclusivamente de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Se trata de un encoder de tipo XLM-RoBERTa con 1024 dimensiones de salida y 192 tokens de contexto maximo, por lo que el consumo es reducido, pero el numero de parametros no esta declarado y no se debe asumir un valor concreto.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el perfil del modelo, cualquier GPU con al menos unos pocos gigabytes de memoria libre deberia ser suficiente; conviene medirlo antes de dimensionar.
- Cabe en GPU de consumo: muy probablemente si, dado el tamano del repositorio (0.0 GB reportados) y la longitud de contexto de 192 tokens; no obstante, no hay confirmacion en la ficha.
- Opciones de despliegue: sentence-transformers (libreria nativa del modelo), Hugging Face Text Embeddings Inference (TEI) para servir embeddings, ONNX Runtime o FastEmbed si se exporta el encoder, y Hugging Face Inference Endpoints, dado que el repositorio lleva la etiqueta endpoints_compatible. No se declara soporte de GGUF ni de llama.cpp, y las herramientas habituales de servidores generativos (vLLM, TGI) no son el encaje natural para un modelo de embeddings de este tipo.
- Latencia y throughput: no disponibles. Dependeran del hardware, del tamano de lote y de la longitud de los textos, que en este modelo queda acotada a 192 tokens.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus fichas publicas y no han sido verificados en la busqueda realizada; se incluyen como referencia de categoria.

| Modelo | Dimension de salida | Longitud de contexto | Licencia declarada | Enfoque |
|---|---|---|---|---|
| Dathq12/bge-m3-tool-retrieval-vi | 1024 | 192 tokens | no disponible | Ajuste fino para recuperacion de herramientas |
| BAAI/bge-m3 (modelo base) | 1024 (dense), mas representaciones sparse y multi-vector | 8192 tokens | MIT segun su ficha publica | Embeddings multilingues de proposito general |
| intfloat/multilingual-e5-large | 1024 | 512 tokens | MIT segun su ficha publica | Embeddings multilingues de proposito general |
| Alibaba-NLP/gte-multilingual-base | 768 | 8192 tokens | Apache-2.0 segun su ficha publica | Embeddings multilingues de proposito general |

Diferencias clave: frente al modelo base, este ajuste reduce drasticamente la ventana util (de 8192 a 192 tokens) a cambio de especializarse en una tarea concreta; frente a las alternativas generalistas, no hay datos publicos que permitan comparar rendimiento en MTEB o BEIR, y su licencia no esta declarada, lo que impide confirmar su uso comercial.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 192 tokens. Consultas o descripciones de herramientas mas largas se truncaran, con perdida de informacion. Es una limitacion importante si se pretende indexar documentacion extensa.
- Licencia no disponible: no se puede asumir permiso de uso comercial. Es un bloqueante potencial para produccion.
- Idiomas no declarados: aunque el encoder base es multilingue y los ejemplos de la ficha contienen texto en vietnamita, el autor no documenta el soporte de idiomas del ajuste fino. El rendimiento fuera del dominio de entrenamiento (probablemente vietnamita e ingles) debe validarse con datos propios.
- Resultados no verificados: todas las metricas del model-index llevan verified: false y proceden de un conjunto de validacion propio ("custom val") cuya composicion no se publica. Sin comparacion contra un split publico, no son reproducibles.
- Riesgo de sobreajuste al dominio: el entrenamiento se limita a 70.988 ejemplos de un unico tipo de tarea (consulta de usuario frente a descripcion de herramienta). Fuera de ese patron, la calidad del embedding puede degradarse.
- Riesgo de alucinacion en el sistema completo: el modelo no genera texto, pero un error de recuperacion (por ejemplo, la herramienta incorrecta en la posicion 1) induce una accion equivocada en el agente que lo consume. Con Accuracy@1 de 0,4588 en validacion, mas de la mitad de las consultas no aciertan a la primera, por lo que conviene recuperar y reordenar un top-k amplio antes de decidir.
- Metadatos incompletos: sin numero de parametros, sin cuantizaciones publicadas y con tamano de repositorio reportado de 0.0 GB. Verificar que los pesos se descargan correctamente antes de integrarlo.
- Sin traccion de comunidad: cero descargas y cero likes. No hay evidencia de uso en produccion ni de auditorias independientes.
- No apto para generacion: es un encoder de representaciones; no debe presentarse como un modelo conversacional ni usarse como tal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dathq12/bge-m3-tool-retrieval-vi
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos con la libreria sentence-transformers en HuggingFace: https://huggingface.co/models?library=sentence-transformers
- Referencia arXiv 1908.10084 (citada en las etiquetas del modelo): https://arxiv.org/abs/1908.10084
- Referencia arXiv 2101.06983 (citada en las etiquetas del modelo): https://arxiv.org/abs/2101.06983
- Referencia arXiv 1807.03748 (citada en las etiquetas del modelo): https://arxiv.org/abs/1807.03748

Nota: la busqueda web realizada no devolvio enlaces relevantes al modelo; los resultados obtenidos correspondian a paginas sobre Texas A&M University y no guardan relacion con esta ficha. Por tanto, no hay papers, blogs, repositorios ni demos adicionales que enlazar mas alla de los enlaces anteriores.
