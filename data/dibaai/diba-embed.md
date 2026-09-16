# DibaAi/Diba-Embed

## Resumen

Diba-Embed es un modelo de embeddings de frases (sentence embeddings) publicado por DibaAi en HuggingFace bajo el identificador `DibaAi/Diba-Embed`. Su pipeline declarado es `sentence-similarity` y su libreria principal es `sentence-transformers`, lo que lo situa en la categoria de modelos de representacion densa de texto usados para recuperacion de informacion, busqueda semantica y generacion aumentada por recuperacion (RAG).

Por las etiquetas declaradas en la ficha del repositorio (`diba_embed`, `feature-extraction`, `text-embeddings`, `retrieval`, `rag`, `semantic-search`), el modelo esta disenado para producir representaciones vectoriales de texto que permitan medir similitud semantica entre fragmentos. La presencia de etiquetas como `persian`, `farsi`, `iran`, `fa`, `en` y `multilingual` sugiere un enfoque multilingue con orientacion prioritaria al persa (farsi) y al ingles, un nicho con relativamente pocos modelos de embeddings de alta calidad.

Es relevante ahora porque la mayoria de los modelos de embeddings multilingues de referencia estan optimizados para idiomas de gran volumen de datos (ingles, chino, europeos) y rinden peor en persa. Un modelo especificamente orientado a farsi y a recuperacion podria cubrir ese hueco en pipelines RAG en produccion. Dado que el repositorio registra 0 descargas y 1 like, se trata de una publicacion muy reciente o con escasa adopcion publica, y no se dispone de documentacion tecnica oficial (arquitectura base, dimension de embedding, tamano, contexto) en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas indican `sentence-transformers` y `feature-extraction`; modelo base no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `safetensors`; cuantizaciones GGUF/ONNX no confirmadas) |
| Idiomas soportados | etiquetas declaran `fa` (persa/farsi), `en` (ingles) y `multilingual`; no hay documentacion oficial de cobertura |
| Licencia | etiqueta `license:apache-2.0` en el repositorio; el campo de licencia aparece como "no disponible" en los metadatos consultados |
| Formato de pesos | safetensors |
| Libreria de inferencia | sentence-transformers |
| Pipeline declarado | sentence-similarity |
| Requiere codigo remoto | si (etiqueta `custom_code` presente; implica `trust_remote_code=True` en la mayoria de cargadores) |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de publicacion registrada | 2026-09-15 |

## Arquitectura y entrenamiento

No se dispone de informacion publica en los materiales proporcionados sobre la arquitectura interna del modelo: no se especifica el transformer base (por ejemplo, tipo BERT, XLM-R, MPNet o similar), la dimension del vector de embedding, el numero de capas, el numero de parametros ni la longitud maxima de secuencia aceptada. Las etiquetas `sentence-transformers` y `feature-extraction` son compatibles con un encoder transformer tipico con pooling y, posiblemente, una cabeza de similitud entrenada con funciones de contraste, pero esto es una inferencia de categoria, no un dato confirmado.

Tampoco hay informacion sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones fa/en, si hubo pares de frases supervisados, negativos duros, RLHF o DPO). La etiqueta `multilingual` y la presencia de `fa` y `en` apuntan a un entrenamiento con datos en persa e ingles, coherente con un caso de uso de recuperacion bilingue, pero no es posible confirmar volumen, fuentes ni metodologia. La etiqueta `dibachain` sugiere que el modelo forma parte de un ecosistema propio de DibaAi (Diba Chain), del que tampoco hay detalles tecnicos en la informacion disponible.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica (`sentence-similarity`).
- Extraccion de caracteristicas a nivel de token o secuencia (`feature-extraction`).
- Recuperacion de informacion (retrieval) sobre corpus vectoriales.
- Busqueda semantica (semantic search) en bases de datos vectoriales.
- Integracion en pipelines RAG como modelo de embedding de documentos y consultas.
- Soporte multilingue segun etiquetas, con enfasis declarado en persa (farsi) e ingles.
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio, thinking mode ni generacion de texto libre; es un modelo de representacion, no un modelo generativo de chat.

## Casos de uso

- Busqueda semantica en persa: indexar un corpus documental en farsi y recuperar pasajes relevantes a partir de consultas en lenguaje natural, aprovechando la orientacion declarada del modelo a `fa`.
- RAG bilingue persa-ingles: construir un asistente que recupere documentacion en ingles y en persa y la pase a un LLM generativo como contexto, usando Diba-Embed como recuperador denso.
- Atencion al cliente automatizada: almacenar embeddings de articulos de ayuda y respuestas previas, y recuperar la respuesta mas similar semanticamente a la consulta del usuario antes de pasarla a un modelo generativo.
- Deduplicacion y agrupacion de documentos: calcular similitud coseno entre embeddings para detectar contenido duplicado o casi duplicado en repositorios internos, incluidos textos en farsi.
- Clasificacion y enrutado por similitud: usar los embeddings como entrada a un clasificador ligero (regresion logistica, k-NN) para enrutar tickets o correos a la cola adecuada.
- Moderacion y deteccion de contenido repetido en foros o comentarios: comparar embeddings contra una lista de referencia para marcar contenido similar a ejemplos conocidos.
- Recomendacion de contenido: representar articulos, productos o publicaciones como vectores y recomendar los mas cercanos a los intereses del usuario.
- Evaluacion de calidad de traduccion o parafrasis: medir similitud semantica entre texto original y traduccion en lugar de similitud lexica (BLEU), lo que tolera reformulaciones.

En todos los casos, el modelo cubre la fase de representacion y recuperacion; el razonamiento o la generacion final requiere un modelo adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MTEB, BEIR, MIRACL ni evaluaciones especificas de recuperacion en persa, y los resultados de busqueda web proporcionados no contienen informacion relacionada con el modelo (corresponden a paginas de un gestor de contrasenas sin relacion alguna).

## Requisitos de hardware

No se dispone del tamano de parametros ni de la dimension de embedding, por lo que las cifras de VRAM no pueden concretarse para este modelo. Como referencia generica de la categoria de modelos `sentence-transformers` (no confirmada para Diba-Embed):

- VRAM en FP32: en el rango tipico de 0,4 a 2,5 GB para encoders de 100M a 600M de parametros; valor exacto no disponible.
- VRAM en FP16/BF16: aproximadamente la mitad del valor en FP32 para el mismo tamano; valor exacto no disponible.
- GPU recomendadas: para inferencia por lotes en produccion, cualquier GPU con al menos 8 GB (RTX 3070/4060 Ti, RTX 4080, RTX 4090, L4, A10, A100, H100) es suficiente en la mayoria de encoders de esta categoria; la eleccion depende del throughput objetivo.
- GPU de consumo: muy probablemente cabe en cualquier GPU de consumo moderna con 8 GB o mas, e incluso en CPU para cargas moderadas; no confirmado para este modelo concreto.
- Despliegue: `sentence-transformers` en Python, HuggingFace `text-embeddings-inference`, HuggingFace Inference Endpoints (la etiqueta `endpoints_compatible` esta presente), `vLLM` no aplica a modelos de embeddings en la mayoria de configuraciones, `llama.cpp`/GGUF no confirmado por ausencia de pesos GGUF declarados, `Ollama` no confirmado.
- Nota de integracion: al existir la etiqueta `custom_code`, es probable que el cargador requiera `trust_remote_code=True`, lo que anade un requisito de revision del codigo remoto antes de usarlo en produccion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se limita a caracteristicas publicamente documentadas de alternativas de la misma categoria. Los valores de Diba-Embed aparecen como "no disponible" porque no estan en la informacion proporcionada; las cifras de los alternativas corresponden a su documentacion publica habitual y deben verificarse en su repositorio antes de usarlas para decisiones.

| Modelo | Parametros | Contexto max. | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DibaAi/Diba-Embed | no disponible | no disponible | fa, en, multilingual (segun etiquetas) | apache-2.0 (segun etiqueta) | HuggingFace, sentence-transformers |
| BAAI/bge-m3 | ~568M | 8192 tokens | multilingue (mas de 100 idiomas) | MIT | HuggingFace, sentence-transformers, FlagEmbedding |
| intfloat/multilingual-e5-large | ~560M | 512 tokens | multilingue | MIT | HuggingFace, sentence-transformers |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118M | 128 tokens | multilingue | Apache 2.0 | HuggingFace, sentence-transformers |

Consideraciones: bge-m3 y multilingual-e5-large son referencias consolidadas en recuperacion multilingue y cuentan con evaluaciones publicas en MTEB y MIRACL; Diba-Embed no tiene benchmarks publicados en la informacion disponible, por lo que no es posible afirmar superioridad ni equivalencia en persa. La ventaja potencial de Diba-Embed seria una especializacion en farsi, pero sin evaluacion reproducible no puede confirmarse.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica publica en los materiales consultados: no se conocen arquitectura base, dimension de embedding, tamano, contexto maximo ni corpus de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en recuperacion, similitud semantica ni en persa.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, lo que implica que no ha sido validado por la comunidad.
- Sesgos: no se puede evaluar el sesgo sin conocer los datos de entrenamiento; los corpus en persa pueden introducir sesgos culturales, politicos o de genero especificos que no estan documentados.
- Riesgo de alucinacion: no aplica directamente a un modelo de embeddings, pero en un pipeline RAG la calidad de la recuperacion condiciona la fidelidad del LLM generativo; un recuperador no evaluado puede degradar la respuesta final.
- Cobertura idiomatica incierta: aunque las etiquetas mencionan `multilingual`, no se especifica que idiomas estan cubiertos ni con que calidad; el rendimiento fuera de fa/en es desconocido.
- Licencia: la etiqueta indica `apache-2.0`, lo que en principio permitiria uso comercial, pero el campo de licencia del repositorio figura como "no disponible". Conviene confirmar el archivo LICENSE del repositorio antes de un despliegue comercial.
- Codigo remoto: la etiqueta `custom_code` implica que la carga puede ejecutar codigo arbitrario del repositorio; auditar el codigo antes de usarlo en entornos de produccion.
- Dependencia de versiones: al usar `sentence-transformers` y posiblemente codigo propio, cambios en la libreria o en el repositorio pueden romper la reproducibilidad.
- Fecha de publicacion registrada en 2026-09-15: conviene verificar la coherencia de los metadatos, ya que puede tratarse de datos de repositorio incompletos o mal rellenados.

## Enlaces

- HuggingFace: https://huggingface.co/DibaAi/Diba-Embed
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Documentacion de sentence-transformers: https://www.sbert.net/
- HuggingFace Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados al modelo en la busqueda web proporcionada.
