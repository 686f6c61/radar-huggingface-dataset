# slraphadev/e5-small-paes

## Resumen

`e5-small-paes` es un modelo de embeddings de frases (sentence embeddings) publicado por el usuario `slraphadev` en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base `intfloat/multilingual-e5-small`, un encoder BERT multilingue de 117,6 millones de parametros. El modelo esta especializado en recuperacion semantica de fragmentos de texto pertenecientes al edital del proceso PAES 2026 (proceso de acceso a la educacion superior de la Universidad Estadual de Montes Claros, Brasil), segun se deduce de los ejemplos de la model card.

El modelo resuelve una tarea concreta: dado un query en lenguaje natural sobre el contenido de un edital (normas, criterios de clasificacion, cursos, vacantes, habilidades), recuperar el pasaje relevante del documento. Es, por tanto, un modelo de recuperacion de informacion (retrieval) de dominio especifico, no un modelo generativo. Su relevancia practica es limitada fuera de ese dominio: el entrenamiento se realizo con un conjunto de datos de solo 736 ejemplos y la model card no documenta evaluacion cuantitativa ni metricas de rendimiento.

Arquitectonicamente hereda la estructura transformer encoder de BERT (12 capas, 384 dimensiones de embedding oculto, 117,6 M de parametros) del modelo base multilingue de E5, pero con los pesos ajustados mediante la funcion de perdida `MultipleNegativesRankingLoss` sobre pares query-passage del edital PAES.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (heredada de `intfloat/multilingual-e5-small`) |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base E5-small soporta 512 tokens, pero no se confirma en la ficha del autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de sentence-transformers, pero no documentada) |
| Idiomas soportados | no disponible (el modelo base es multilingue; los datos de entrenamiento son en portugues brasileno) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible (el modelo base E5-small produce vectores de 384 dimensiones) |
| Funcion de perdida de entrenamiento | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 736 ejemplos |
| Tamano del repositorio | 0,5 GB |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `intfloat/multilingual-e5-small`, un encoder transformer de tipo BERT con 12 capas y 117,6 millones de parametros, disenado originalmente para generar embeddings de frases multilingues. El ajuste se realizo con la libreria `sentence-transformers` y la funcion de perdida `MultipleNegativesRankingLoss`, una tecnica de aprendizaje contrastivo que utiliza los demas pasajes del lote como negativos implicitos para cada par query-passage positivo. Este esquema es el estandar en la familia E5 para tareas de recuperacion densa.

El conjunto de entrenamiento consta de 736 ejemplos, un volumen muy reducido que sugiere un ajuste de dominio estrecho sobre el edital PAES 2026. Los ejemplos de la model card muestran pares del tipo `query:` (preguntas en portugues sobre el contenido del edital) y `passage:` (fragmentos del documento con estructura jerarquica: secciones, articulos, tablas de cursos y vacantes, habilidades curriculares). No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como hard negatives mining, destilacion o aumento de datos.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion densa (dense retrieval).
- Recuperacion de pasajes relevantes a partir de queries en lenguaje natural sobre el edital PAES 2026.
- Extraccion de caracteristicas (`feature-extraction`) para pipelines de sentence-transformers.
- Compatibilidad con Text Embeddings Inference (TEI) para despliegue como endpoint de embeddings.
- Soporte de similitud entre frases (`sentence-similarity`) mediante producto escalar o similitud coseno.
- Capacidad multilingue heredada del modelo base, aunque el ajuste fino se ha realizado sobre texto en portugues brasileno.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un encoder de embeddings.

## Casos de uso

- Busqueda semantica dentro del edital PAES 2026: indexar los fragmentos del documento (secciones, articulos, tablas de cursos y vacantes) y recuperar los pasajes relevantes ante preguntas de candidatos, usando el prefijo `query:` para la consulta y `passage:` para los documentos indexados.
- Asistente de preguntas frecuentes sobre el proceso de admision: integrar el modelo como retriever en un pipeline RAG (Retrieval-Augmented Generation) que alimente a un modelo generativo con los pasajes recuperados del edital, reduciendo alucinaciones sobre normas y criterios de clasificacion.
- Atencion al candidato en portales web: desplegar el modelo mediante Text Embeddings Inference para ofrecer busqueda semantica en el sitio de la COTEPS/Unimontes, con latencia baja gracias al reducido tamano del encoder (117,6 M de parametros).
- Deduplicacion y agrupacion de consultas: agrupar preguntas de candidatos semanticamente equivalentes (por ejemplo, distintas formulaciones sobre criterios de desempate) para analitica de soporte y mejora de FAQ.
- Clasificacion y enrutado de consultas: usar los embeddings para entrenar un clasificador ligero que dirija cada consulta a la seccion correcta del edital o al departamento responsable.
- Validacion de cobertura documental: comparar embeddings de consultas reales con los pasajes indexados para detectar temas del edital con baja cobertura o fragmentos mal segmentados.
- Prototipado de recuperacion de dominio juridico-administrativo: servir como punto de partida para ajustar un retriever sobre otros editales o documentos normativos similares, dado el bajo coste computacional del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (Recall@k, MRR, nDCG, MTEB) ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,47 GB solo para los pesos (117,6 M de parametros x 4 bytes), mas overhead de activaciones y tokenizador; en la practica, menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,24 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para cargas moderadas.
- GPU recomendadas para produccion con alto throughput: A100, H100, L4 o T4; para volumen bajo, CPU es suficiente.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints (el modelo esta marcado como `endpoints_compatible`), y conversion a ONNX para inferencia optimizada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de milisegundos por lote en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `slraphadev/e5-small-paes` | 117,6 M | no disponible | no disponible (entrenado en portugues) | no disponible | Hugging Face |
| `intfloat/multilingual-e5-small` (base) | 117,6 M | 512 tokens (segun documentacion del modelo base) | Multilingue (incluye espanol, portugues, ingles, etc.) | MIT (segun el modelo base) | Hugging Face |
| `intfloat/multilingual-e5-base` | 278 M | 512 tokens (segun documentacion del modelo base) | Multilingue | MIT (segun el modelo base) | Hugging Face |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | 117,6 M | 128 tokens (segun documentacion del modelo) | Multilingue | Apache 2.0 (segun el modelo) | Hugging Face |

Nota: los datos de los modelos comparativos provienen de su documentacion publica habitual; no se dispone de comparaciones de rendimiento especificas frente a `e5-small-paes` porque este no publica benchmarks.

## Limitaciones y advertencias

- El ajuste fino se ha realizado con solo 736 ejemplos, lo que limita la generalizacion y aumenta el riesgo de sobreajuste al dominio del edital PAES 2026.
- El modelo esta especializado en un unico documento (edital PAES 2026) y en portugues brasileno; su rendimiento fuera de ese dominio o idioma no esta documentado y probablemente sea inferior al del modelo base.
- No es un modelo generativo: no puede responder preguntas directamente, solo recuperar pasajes; requiere un componente generativo o de presentacion para construir un asistente completo.
- Riesgo de recuperacion de pasajes incorrectos o incompletos si la segmentacion del documento en el indice no coincide con la utilizada en el entrenamiento.
- La licencia no esta disponible, lo que impide confirmar si se permite el uso comercial; es imprescindible verificar los terminos antes de desplegarlo en produccion.
- Los idiomas soportados no estan documentados; aunque el modelo base es multilingue, el ajuste puede haber degradado el rendimiento en idiomas distintos del portugues.
- No hay evaluacion publicada de sesgos, alucinacion (en el sentido de recuperacion erronea) ni robustez ante consultas ambiguas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- El campo `createdAt` de la ficha (2026-11-10) es una fecha futura respecto a la redaccion habitual de fichas; conviene verificar la vigencia y autoria del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/slraphadev/e5-small-paes
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Paper de Sentence-BERT (referencia `arxiv:1908.10084`): https://arxiv.org/abs/1908.10084
- Paper de SimCSE / aprendizaje contrastivo (referencia `arxiv:1807.03748`): https://arxiv.org/abs/1807.03748
- Libreria sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference (TEI): https://github.com/huggingface/text-embeddings-inference
- Documentacion de Hugging Face Inference Endpoints: https://huggingface.co/docs/inference-endpoints
