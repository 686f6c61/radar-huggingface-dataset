# alisha2006/beacon-minilm-v1

## Resumen

beacon-minilm-v1 es un modelo de embeddings de frases (sentence transformer) publicado por el usuario alisha2006 en HuggingFace. Se trata de un fine-tuning del conocido sentence-transformers/all-MiniLM-L6-v2, un encoder BERT de tipo MiniLM de 6 capas y 22.713.216 parametros, que proyecta texto a un espacio vectorial denso de 384 dimensiones. Su proposito es la similitud semantica: medir si dos frases son equivalentes en significado, no generar texto.

El modelo ha sido ajustado con Sentence Transformers sobre un conjunto de 10.500 ejemplos y con la funcion de perdida CosineSimilarityLoss, partiendo del checkpoint all-MiniLM-L6-v2. Los ejemplos de la model card estan orientados a actas de reunion y seguimiento de decisiones corporativas (cambios de proveedor, presupuestos, responsables de equipo), lo que sugiere un ajuste de dominio hacia la deteccion de coincidencias y contradicciones entre afirmaciones de reuniones sucesivas.

Su relevancia practica radica en que el modelo base all-MiniLM-L6-v2 es uno de los encoders mas desplegados del ecosistema por su relacion tamano/rendimiento, y este ajuste busca especializarlo en dominios concretos. Sin embargo, el modelo cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha, no declara licencia ni idiomas, y sus metricas estan autocertificadas por el autor (verified: false), por lo que debe considerarse un artefacto sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentenceTransformer sobre encoder BERT (BertModel, MiniLM-L6); pooling de media + normalizacion L2 |
| Parametros totales | 22.713.216 (22,7 M) |
| Parametros activos | no aplica, es un modelo denso (no MoE) |
| Longitud de contexto | 256 tokens (max sequence length) |
| Tipos de cuantizacion | no disponible (el repositorio incluye safetensors; no se documentan variantes GGUF, ONNX ni AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiqueta del repositorio), en formato sentence-transformers |
| Dimension de salida | 384 dimensiones |
| Funcion de similitud | similitud coseno |
| Modalidad | texto |
| Tamano del repositorio | 0.1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una pipeline de tres modulos de Sentence Transformers: (0) un transformer BertModel configurado para feature-extraction, que devuelve `last_hidden_state`; (1) un modulo de Pooling con `pooling_mode: mean` e `embedding_dimension: 384`, que promedia los embeddings de los tokens; y (2) un modulo Normalize que aplica normalizacion L2 para que el producto escalar equivalga a la similitud coseno. El modelo base es all-MiniLM-L6-v2, un encoder BERT destilado de 6 capas, lo que explica sus 22,7 millones de parametros y su capacidad de ejecutarse en CPU.

El entrenamiento se realizo con Sentence Transformers a partir del checkpoint all-MiniLM-L6-v2 (revision 1110a243fdf4706b3f48f1d95db1a4f5529b4d41) y utilizo 10.500 ejemplos con la funcion de perdida CosineSimilarityLoss. Segun las etiquetas del repositorio, el modelo fue generado con `generated_from_trainer`, que es el flujo estandar de fine-tuning de la libreria. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o filtrado adicional. Los ejemplos del widget apuntan a un corpus de actas de reunion en ingles con terminologia empresarial y cifras en rupias, aunque esto es una inferencia a partir de los ejemplos y no una especificacion declarada. La referencia bibliografica asociada es el articulo de Sentence-BERT (arXiv:1908.10084), que describe la tecnica general de entrenamiento de embeddings de frases con redes siamesas.

## Capacidades

- Generacion de embeddings de frases y parrafos en un espacio denso de 384 dimensiones, con normalizacion L2 y similitud coseno.
- Similitud textual semantica: comparar pares de frases y obtener una puntuacion de similitud.
- Busqueda semantica: indexacion de documentos y recuperacion por similitud vectorial.
- Mineria de parafrasis: deteccion de frases equivalentes formuladas de forma distinta.
- Clustering de texto: agrupacion de frases o documentos por proximidad en el espacio de embeddings.
- Clasificacion de texto mediante embeddings congelados y un clasificador ligero (por ejemplo, regresion logistica) sobre los vectores de 384 dimensiones.
- Extraccion de caracteristicas (feature extraction) para pipelines posteriores.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio: es exclusivamente un encoder de texto.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente. El modelo no es conversacional.
- Capacidades multilingues: no disponibles; el modelo base es predominantemente anglosajon y no se declara soporte de otros idiomas.
- Capacidad especial inferida de los ejemplos: deteccion de coincidencias y discrepancias entre afirmaciones de actas de reunion (por ejemplo, un presupuesto que pasa de 5 a 7,5 lakh).

## Casos de uso

- Deduplicacion de tickets de soporte: se generan embeddings de las descripciones de incidencias y se agrupan por similitud coseno para detectar tickets repetidos antes de asignarlos a un tecnico. El tamano de 22,7 M de parametros permite procesar lotes grandes en CPU sin GPU dedicada.
- Busqueda semantica en documentacion interna: indexar guias y manuales con este encoder y recuperar el fragmento mas relevante para una consulta, en lugar de depender de coincidencia exacta de palabras clave. La dimension de 384 reduce el coste de almacenamiento en una base de datos vectorial.
- Seguimiento de decisiones en actas de reunion: comparar afirmaciones de reuniones sucesivas para detectar cambios (por ejemplo, un responsable de equipo o un proveedor distinto al acordado antes), que es el escenario que aparece en los ejemplos del widget.
- Deteccion de parafrasis y plagio ligero: comparar pares de frases para comprobar si dos textos expresan la misma idea, util en revision de contenido o control de calidad editorial.
- Moderacion de duplicados en un portal de anuncios: agrupar publicaciones casi identicas mediante embeddings y umbral de similitud, reduciendo el ruido en el catalogo.
- Clasificacion de correos entrantes: congelar el encoder y entrenar un clasificador lineal de pocas clases sobre los embeddings de 384 dimensiones para enrutar correos por departamento.
- Alimentacion de un pipeline RAG: usar el modelo como retriever de primera etapa en un sistema de generacion aumentada, siempre que el contenido no supere los 256 tokens por fragmento.

En todos los casos conviene validar antes el rendimiento real, dado que las metricas declaradas no estan verificadas por terceros y el modelo no tiene uso documentado en produccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index. La metrica `verified` es `false` en todos los casos, por lo que son datos autocertificados y no reproducidos de forma independiente.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Semantic Similarity | val evaluator | Pearson Cosine | 0.9967 |
| Semantic Similarity | val evaluator | Spearman Cosine | 0.8657 |

No se han publicado en la informacion disponible resultados en MMLU, HumanEval, GSM8K, MTEB ni en conjuntos de evaluacion de recuperacion (BEIR), que son los estandares habituales para modelos de embeddings. La enorme diferencia entre el coeficiente de Pearson (0,9967) y el de Spearman (0,8657) sobre el mismo evaluador es poco habitual y sugiere que el evaluador corresponde a la particion de validacion del propio entrenamiento, con riesgo de sobreajuste o de una metrica dominada por pares de similitud extrema.

## Requisitos de hardware

- VRAM estimada para los pesos en FP32: aproximadamente 91 MB (22,7 M de parametros x 4 bytes). En FP16/BF16: aproximadamente 45 MB. En INT8: aproximadamente 23 MB. Son estimaciones de solo pesos, calculadas a partir del numero de parametros; no incluyen activaciones ni memoria del runtime.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer sirve, desde una GTX 1050 o una iGPU integrada hasta una RTX 4090, A100 o H100. En la practica estas ultimas estarian infrautilizadas para un modelo de 22,7 M de parametros.
- Cabe en GPU consumer: si, con margen amplio en cualquier GPU con mas de 1 GB de memoria, y tambien en CPU.
- Opciones de despliegue: sentence-transformers (libreria de referencia), Hugging Face Text Embeddings Inference (TEI) para servir embeddings por HTTP (los tags incluyen `text-embeddings-inference` y `endpoints_compatible`), y despliegue como Inference Endpoint en HuggingFace. Tambien puede exportarse a ONNX o a llama.cpp mediante las herramientas de Sentence Transformers, aunque no se documenta ninguna conversion ya publicada en el repositorio.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, un encoder BERT de 6 capas y 256 tokens de contexto es de los mas rapidos del ecosistema y suele procesar cientos de frases por segundo en CPU moderna y miles por segundo en GPU, pero no hay mediciones publicadas en la informacion disponible.
- Recomendacion de produccion: dado el tamano, el cuello de botella habitual no sera el encoder sino el almacenamiento y la busqueda vectorial (por ejemplo FAISS, Qdrant o pgvector).

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base, del que este fine-tuning hereda arquitectura y dimensiones. Para el resto de alternativas no hay datos de parametros, contexto ni rendimiento en la informacion proporcionada.

| Modelo | Parametros | Dimension de salida | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| alisha2006/beacon-minilm-v1 | 22,7 M | 384 | 256 tokens | no disponible | 0 descargas, 0 likes, sin validacion externa |
| sentence-transformers/all-MiniLM-L6-v2 (base) | 22,7 M (misma arquitectura) | 384 | 256 tokens | no disponible en esta ficha (su model card es la fuente habitual) | modelo ampliamente desplegado |
| Otras alternativas de embeddings (por ejemplo, encoders BERT base de 110 M, E5, GTE, BGE) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparativas de MTEB, BEIR u otros conjuntos publicos que permitan situar este ajuste frente a alternativas de la misma categoria. Cualquier eleccion deberia contrastarse con una evaluacion propia sobre el dominio objetivo.

## Limitaciones y advertencias

- Metricas no verificadas: las dos cifras de la model-index tienen `verified: false` y provienen de un evaluador denominado "val evaluator", no de un benchmark publico independiente. La brecha entre Pearson (0,9967) y Spearman (0,8657) aconseja tratar el resultado con escepticismo.
- Riesgo de sobreajuste: con 10.500 ejemplos de entrenamiento y un unico evaluador de validacion, el modelo puede haber memorizado el dominio concreto del dataset. Los ejemplos del widget estan muy centrados en actas de reunion y terminologia empresarial en ingles.
- Licencia no disponible: al no declararse licencia, el uso comercial, la redistribucion y la modificacion quedan en un limbo legal. Conviene aclararlo con el autor antes de integrarlo en un producto.
- Idiomas no declarados: no hay garantia de comportamiento en castellano ni en otros idiomas distintos del ingles. Hay que evaluarlo empiricamente por idioma antes de usarlo.
- Contexto corto: 256 tokens por entrada. Textos largos deben trocearse, con la perdida de contexto que ello implica.
- No es un modelo generativo: no produce texto, no razona, no ejecuta herramientas y no tiene modo de pensamiento. No puede usarse como sustituto de un LLM.
- Alto riesgo de alucinacion no aplica en el sentido generativo, pero si aplica el riesgo de similitudes espurias: dos frases pueden obtener una puntuacion alta por compartir vocabulario y no significado.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues, forks ni evaluaciones de terceros que respalden su calidad o su reproducibilidad.
- Cifras y contexto cultural: los ejemplos emplean importes en rupias y entidades indias, lo que refuerza la hipotesis de un corpus de entrenamiento acotado a un dominio y region concretos.
- Fecha de creacion inusual: el repositorio figura como creado el 2026-10-07, posterior a la fecha habitual de publicacion. Conviene verificar la coherencia de los metadatos antes de confiar en ellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alisha2006/beacon-minilm-v1
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 (revision 1110a243fdf4706b3f48f1d95db1a4f5529b4d41)
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos de la libreria en HuggingFace: https://huggingface.co/models?library=sentence-transformers
- Paper de referencia (Sentence-BERT): arXiv:1908.10084
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas genericas de Google (Trends, Chrome, Traductor, Videos, Books) sin relacion con el modelo.
