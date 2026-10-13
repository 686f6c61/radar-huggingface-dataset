# alibayram/embeddingmagibu2-v1

## Resumen

embeddingmagibu2-v1 es un modelo de embeddings de frases publicado por el usuario alibayram (proyecto Magibu AI) y construido a partir de google/embeddinggemma-2. Cuenta con 744.371.512 parametros segun los pesos safetensors, ocupa 1,5 GB en el repositorio y expone la tarea sentence-similarity a traves de la libreria sentence-transformers. La licencia declarada es apache-2.0 y el acceso esta restringido: requiere aceptar condiciones en HuggingFace antes de poder descargarlo.

El problema que aborda es la calidad de la recuperacion semantica en turco. La mayoria de encoders de frases multilingues funcionan por debajo de su potencial en ese idioma porque su tokenizador no esta adaptado a su morfologia aglutinante. La propuesta pasa por una cirugia de tokenizador (tokenizer surgery): se conserva el modelo profesor y se sustituye el tokenizador por uno optimizado para turco, reinicializando despues las embeddings de los tokens nuevos.

El modelo es relevante ahora porque forma parte de una linea de trabajo documentada en el preprint arXiv:2605.29992, con variantes intermedias publicas (embeddingmagibu2, embeddingmagibu2-v1-rc) y un modelo hermano de 200 M de parametros. Esta ficha se ha redactado exclusivamente con la informacion de la pagina del modelo y de los resultados de busqueda disponibles; no se han podido verificar datos internos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings de frases derivado de google/embeddinggemma-2 (familia embedding_gemma2); numero de capas y dimension oculta no disponibles |
| Parametros totales | 744.371.512 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para esta variante; el modelo relacionado embeddingmagibu-200m documenta 8.192 tokens |
| Tipos de cuantizacion | no disponible (solo se listan pesos safetensors; no hay variantes GGUF, AWQ ni GPTQ publicadas) |
| Idiomas soportados | turco (tr), ingles (en) y multilingue segun las etiquetas del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,5 GB |
| Dimension de los embeddings | no disponible para esta variante (768 dimensiones normalizadas L2 en embeddingmagibu-200m) |
| Tarea (pipeline) | sentence-similarity / feature-extraction |
| Libreria | sentence-transformers |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Modelo base | google/embeddinggemma-2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de codificacion orientado a producir embeddings de frases, heredado de google/embeddinggemma-2. El elemento diferencial documentado no es la topologia de la red sino el tratamiento del vocabulario: se parte del modelo profesor, se le sustituye el tokenizador por el tokenizador turco magibu/Altus y se inicializan embeddings nuevos para los tokens anadidos. La variante embeddingmagibu2 se describe explicitamente como un checkpoint de inicializacion, es decir, el modelo estudiante antes de la destilacion.

El pipeline de entrenamiento, evaluacion y despliegue asociado (repositorio embedding-trainer) se describe para el modelo hermano embeddingmagibu-200m: 768 dimensiones, vectores normalizados L2, ventana de 8.192 tokens frente a los 512 de los encoders turcos basados en BERT, aproximadamente un 33 % menos de parametros que su profesor y un entrenamiento de unas 4 horas en una sola GPU. No se dispone del numero de tokens de entrenamiento, de la composicion del dataset ni de si se aplicaron fases de RLHF o DPO en embeddingmagibu2-v1; todos esos datos figuran como no disponibles. Las etiquetas del repositorio incluyen multimodal, image-text-retrieval, audio y video, pero no hay documentacion publica que detalle como se han incorporado esas modalidades, por lo que deben tratarse como no verificadas.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion de pasajes.
- Extraccion de caracteristicas (feature-extraction) para alimentar clasificadores posteriores.
- Recuperacion bilingue turco-ingles y multilingue segun las etiquetas declaradas.
- Tokenizacion optimizada para turco, con vocabulario reconstruido respecto al modelo base.
- Recuperacion multimodal imagen-texto, audio y video segun las etiquetas del repositorio; sin confirmacion documental.
- Compatibilidad con endpoints de inferencia de HuggingFace (etiqueta endpoints_compatible).
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso: es un modelo de embeddings, no un modelo generativo conversacional.

## Casos de uso

- Busqueda semantica en turco: indexar un corpus documental turco y recuperar pasajes por significado en lugar de por coincidencia lexica, aprovechando el tokenizador adaptado a la morfologia aglutinante del idioma.
- RAG sobre documentacion corporativa turca: el modelo actua como recuperador en la fase de retrieval; si se confirma la ventana de 8.192 tokens de la familia, permite indexar fragmentos largos sin trocear en exceso.
- Clasificacion de textos sin etiquetar: generar embeddings y entrenar un clasificador ligero encima para categorizar tickets, noticias o resenas.
- Deduplicacion y agrupamiento: aplicar clustering sobre los vectores normalizados para detectar documentos o preguntas duplicadas en catalogos y bases de conocimiento.
- Atencion al cliente basada en FAQ: emparejar la consulta del usuario con la respuesta canonica mas similar semánticamente, con independencia de las variantes morfologicas turcas empleadas.
- Moderacion y filtrado de contenido: comparar mensajes entrantes contra una lista de patrones problematicos usando similitud coseno.
- Sistemas de recomendacion por contenido: representar articulos y perfiles de usuario en el mismo espacio vectorial para sugerir elementos afines.
- Recuperacion multimodal: si se confirman las etiquetas image-text-retrieval, audio y video, serviria para buscar imagenes o clips a partir de una consulta textual, aunque este extremo no esta documentado.
- Evaluacion de similitud entre respuestas: comparar la salida de distintos asistentes contra una referencia para tareas de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El preprint arXiv:2605.29992 y el repositorio embedding-trainer mencionan resultados "competitivos" en benchmarks turcos para el modelo hermano embeddingmagibu-200m, pero no se incluye ninguna cifra concreta (MMLU, MTEB turco, retrieval, etc.) en el material consultado, por lo que no se presentan tablas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 o fp16, unos 1,5 GB solo de pesos, mas overhead de activaciones y batch; en la practica alrededor de 2-3 GB. En fp32, aproximadamente 3 GB de pesos. En int8, unos 0,75 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM para inferencia en bf16 con lotes pequenos; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A10, L4, A100 y H100 son suficientes. Para indexacion a gran escala, el cuello de botella suele ser el throughput, no la memoria.
- Cabe en GPU de consumo: si, con margen amplio. Una RTX 3060 de 12 GB o incluso una GPU de 6-8 GB pueden ejecutarlo en bf16.
- Opciones de despliegue: sentence-transformers como via principal, HuggingFace Text Embeddings Inference (TEI) para servir embeddings a escala, y endpoints de inferencia de HuggingFace segun la etiqueta endpoints_compatible. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no estan confirmados.
- Latencia y throughput: no disponibles. Tampoco se publican cifras de latencia del modelo hermano de 200 M, aunque su entrenamiento se completo en unas 4 horas en una sola GPU, lo que da una idea de su ligereza relativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| alibayram/embeddingmagibu2-v1 | 744.371.512 | no disponible (8.192 en la familia, sin confirmar) | tr, en, multilingue | apache-2.0 | Acceso restringido (gated), 0 descargas |
| alibayram/embeddingmagibu2-v1-rc | no disponible | no disponible | tr, multilingue | apache-2.0 | Release candidate publica |
| alibayram/embeddingmagibu2 | no disponible | no disponible | tr, multilingue | no disponible | Checkpoint de inicializacion previo a la destilacion |
| embeddingmagibu-200m | ~200 M (33 % menos que su profesor) | 8.192 tokens | turco | no disponible | Modelo hermano con pipeline documentado |
| google/embeddinggemma-2 | no disponible | no disponible | multilingue | no disponible | Modelo base del que deriva |

La comparacion se limita a las variantes de la misma familia recogidas en la busqueda, porque no se dispone de datos verificados de alternativas externas en la informacion proporcionada. En particular, no hay cifras de rendimiento que permitan situar embeddingmagibu2-v1 frente a otros encoders multilingues.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de descargar los pesos.
- Ausencia de datos de entrenamiento: no se documentan tokens de entrenamiento, composicion del dataset, ni fases de alineacion (RLHF, DPO, contrastivo). La reproducibilidad es limitada.
- Sin benchmarks publicados: no hay cifras verificables de MTEB, retrieval ni similitud que respalden la calidad del modelo. Las afirmaciones de "resultados competitivos" corresponden al modelo hermano y no incluyen numeros.
- Madurez muy baja: 0 descargas y 0 likes en el momento de la consulta, sin ecosistema de usuarios ni incidencias reportadas.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que no produce texto libre. El riesgo equivalente es la recuperacion de pasajes irrelevantes con puntuaciones de similitud altas, especialmente fuera del dominio de entrenamiento.
- Sesgo idiomatico: el ajuste esta orientado a turco; el rendimiento en otros idiomas, incluido el espanol, no esta documentado y previsiblemente sera inferior al de encoders multilingues genericos.
- Ambiguedad en la documentacion multimodal: las etiquetas audio, video e image-text-retrieval no se detallan en la model card y no deberian asumirse en produccion sin validacion previa.
- Cobertura de licencia: aunque la licencia es apache-2.0, el modelo base google/embeddinggemma-2 puede tener sus propias condiciones, y el acceso gated anade requisitos de aceptacion que conviene revisar antes de un uso comercial.
- Dependencia de la ventana de contexto: si esta variante no hereda los 8.192 tokens del modelo hermano, los casos de uso con documentos largos requeriran troceado adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibayram/embeddingmagibu2-v1
- Variante release candidate: https://huggingface.co/alibayram/embeddingmagibu2-v1-rc
- Checkpoint de inicializacion: https://huggingface.co/alibayram/embeddingmagibu2
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Preprint: https://arxiv.org/abs/2605.29992
- Repositorio de entrenamiento y evaluacion: https://github.com/malibayram/embedding-trainer
- Perfil del autor en GitHub: https://github.com/malibayram
