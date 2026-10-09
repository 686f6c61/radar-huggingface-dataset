# dangerousmanleebyeonggeon/qwen3-emb-0.6b-specter-n5469-e1-ckpt163

## Resumen

`dangerousmanleebyeonggeon/qwen3-emb-0.6b-specter-n5469-e1-ckpt163` es un modelo de embeddings de frases (bi-encoder) publicado por el usuario `dangerousmanleebyeonggeon` como artefacto de investigacion. Se trata del ajuste fino completo del modelo base `Qwen/Qwen3-Embedding-0.6B` (595.776.512 parametros) sobre un subconjunto de 5.469 tripletas de citas cientificas procedentes de `allenai/scirepeval`, con formato (articulo consulta, articulo citado, un negativo SPECTER). El objetivo declarado es servir como ablacion de datos de entrenamiento frente a un dataset propio de tamano equivalente (canho/ours-6k).

La relevancia del modelo es metodologica, no de producto: permite comparar recetas de entrenamiento con InfoNCE sobre corpus cientifico, manteniendo tamano de dataset constante. Se ha entrenado con `ms-swift` usando `swift sft --task_type embedding --loss_type infonce`, 1 epoch, learning rate 6e-6 con decaimiento coseno y negativos in-batch recolectados entre las 8 GPU del micro-batch. El checkpoint publicado es el final (paso 163 de 163, eval loss 0,4523).

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas soportados, y no incluye resultados de benchmarks publicados. Debe tratarse, por tanto, como un experimento reproducible de investigacion mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3, configurado como bi-encoder de embeddings; ajuste fino completo del modelo base Qwen/Qwen3-Embedding-0.6B |
| Parametros totales | 595.776.512 (~0,6 B), segun safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-Embedding-0.6B declara 32 768 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 (entrenamiento tambien en bf16). No se publican variantes GGUF, GPTQ o AWQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del embedding | no disponible |
| Funcion de perdida | InfoNCE con temperatura 0,1 |
| Tamano del repositorio | 1,2 GB |
| Prompt de consulta | `Query:` en consultas; los documentos se codifican sin prompt |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo es un bi-encoder derivado de `Qwen/Qwen3-Embedding-0.6B`. El ajuste es completo (no LoRA ni adaptadores): se actualizan los 595.776.512 parametros del backbone. La cabeza de embedding proyecta el estado final a un vector unico por texto, y la similitud se calcula por producto escalar entre consulta y documento. La model card no detalla la dimension de salida ni el mecanismo de pooling empleado, por lo que ambos datos quedan como no disponibles.

El entrenamiento se realizo con `ms-swift` mediante `swift sft --task_type embedding --loss_type infonce`. La receta concreta es: learning rate 6e-6 con scheduler coseno, 1 epoch, 8 GPU con batch por dispositivo de 1 y acumulacion de gradiente 4, lo que da 32 consultas por paso; negativos in-batch recolectados (all-gathered) entre las 8 consultas de cada micro-batch; temperatura 0,1; DeepSpeed ZeRO-3; precision bf16; 5 por ciento de los datos reservados para validacion; semilla 42. El total de pasos fue 163 y el checkpoint publicado corresponde al paso final, con eval loss de 0,4523.

Los datos de entrenamiento son 5.469 filas muestreadas con semilla 42 de `allenai/scirepeval` en la tarea `cite_prediction`. Cada fila es una tripleta de citacion cientifica con un negativo SPECTER, y el texto de cada elemento se construye concatenando titulo y abstract. No se menciona el uso de RLHF, DPO ni destilacion, ni ninguna innovacion de atencion (no hay atencion lineal, decodificacion especulativa ni arquitectura hibrida).

## Capacidades

- Generacion de embeddings de texto para similitud semantica entre frases, parrafos y documentos.
- Recuperacion densa (dense retrieval) en corpus cientifico: consulta en lenguaje natural contra abstracts indexados.
- Prediccion y recomendacion de citas academicas, que es la tarea sobre la que se ha entrenado.
- Clasificacion, agrupamiento y deduplicacion semantica mediante distancia coseno o producto escalar.
- Codificacion asimetrica consulta/documento: la consulta usa el prompt `Query:` y el documento se codifica sin prompt.
- Compatibilidad declarada con Text Embeddings Inference y con Inference Endpoints de Hugging Face (tags `text-embeddings-inference` y `endpoints_compatible`).
- No es un modelo generativo: no produce texto, no soporta tool calling, no tiene modo de razonamiento ni capacidades de vision o audio.
- No hay informacion sobre capacidades multilingues en la documentacion proporcionada.

## Casos de uso

- Recuperacion de literatura cientifica: indexar un corpus de abstracts con el modelo y resolver consultas en lenguaje natural mediante busqueda vectorial. Es el escenario mas alineado con los datos de entrenamiento (tripletas de citas con titulo y abstract).
- Recomendacion de citas en un gestor bibliografico: dado un articulo semilla, recuperar los candidatos mas similares del repositorio para sugerir referencias relacionadas, aprovechando que el negativo de entrenamiento proviene de SPECTER.
- Etapa de recuperacion en un pipeline RAG cientifico: usar el modelo como retriever de primera fase sobre decenas de miles de abstracts y dejar el reranking a un cross-encoder, reduciendo el coste frente a un reranker directo sobre todo el corpus.
- Deduplicacion y agrupamiento de publicaciones: calcular embeddings de titulo y abstract y agrupar por similitud para detectar versiones preprint/publicacion o trabajos casi identicos antes de construir un dataset.
- Curacion y filtrado de datasets de entrenamiento: comparar el embedding de cada candidato con el de las consultas objetivo para descartar ejemplos irrelevantes o redundantes.
- Busqueda semantica en repositorios internos tecnicos: documentacion, informes y notas de ingenieria, siempre que el dominio textual se parezca al registro academico usado en el ajuste.
- Baseline reproducible en estudios de ablacion: el propio autor lo publica como control de una ablacion de datos de entrenamiento, de modo que sirve para medir el efecto del tamano y la composicion del dataset frente a recetas alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion al final del entrenamiento (eval loss 0,4523 en el paso 163 de 163), que es una metrica de ajuste y no un benchmark de recuperacion comparable con MTEB, BEIR o SciRepEval. No se deben extrapolar capacidades de recuperacion a partir de ese valor.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 1,2 GB solo para los pesos, mas activaciones y memoria del tokenizador; con lotes pequenos cabe holgadamente por debajo de 2 GB.
- VRAM en fp32: alrededor de 2,4 GB de pesos.
- Cuantizacion: no se publican variantes GGUF, GPTQ ni AWQ; cualquier cuantizacion tendria que generarse localmente.
- GPU de consumo: cabe en cualquier GPU con 4 GB o mas (GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Tambien es viable en CPU para cargas por lotes de baja concurrencia.
- GPU de centro de datos: A100, H100, L40S o A10 no son necesarias por memoria, pero si utiles para maximizar el throughput con lotes grandes.
- Opciones de despliegue: sentence-transformers (via `SentenceTransformer`), Text Embeddings Inference, Inference Endpoints de Hugging Face, vLLM en modo embedding e Infinity. El autor indica `processor_kwargs={"padding_side": "left"}` al cargar.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas publicas y no se han verificado en la informacion proporcionada para este modelo; se incluyen como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3-emb-0.6b-specter-n5469-e1-ckpt163 | 595.776.512 | no disponible | no disponible | no disponible | sin publicar (eval loss 0,4523) | Hugging Face, 0 descargas |
| Qwen/Qwen3-Embedding-0.6B (base) | ~596 M | 32 768 tokens (segun su ficha) | Apache-2.0 (segun su ficha) | multilingue (segun su ficha) | resultados MTEB publicados por el autor del base | Hugging Face |
| BAAI/bge-m3 | ~568 M | 8 192 tokens | MIT | multilingue | MTEB y MIRACL publicados por el autor | Hugging Face |
| intfloat/multilingual-e5-large | ~560 M | 512 tokens | MIT | multilingue | MTEB publicado por el autor | Hugging Face |

La diferencia clave frente al modelo base no es de arquitectura sino de especializacion: este checkpoint ha visto 5.469 tripletas cientificas durante 1 epoch, lo que probablemente mejora el dominio de citas academicas y puede degradar ligeramente el rendimiento general fuera de ese dominio. No hay datos publicados que permitan cuantificar ese intercambio.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos, el uso comercial queda en una zona legal indefinida. Conviene contactar con el autor antes de integrarlo en un producto.
- Artefacto de investigacion con 0 descargas y 0 likes: no hay validacion externa, ni issues, ni comunidad que haya reproducido los resultados.
- Ausencia total de benchmarks: no se puede afirmar que supere a alternativas establecidas en recuperacion cientifica.
- Volumen de entrenamiento muy reducido: 5.469 pares y 1 epoch. El riesgo de sobreajuste al subconjunto muestreado de `allenai/scirepeval` es alto, con precision limitada fuera del estilo de escritura de titulo mas abstract.
- Sesgo de dominio: los datos son citas academicas; el comportamiento en textos conversacionales, legales, clinicos o de codigo no esta caracterizado.
- Idiomas no declarados: aunque el modelo base sea multilingue, no hay garantia de que el ajuste con InfoNCE en ingles cientifico conserve ese comportamiento.
- Contexto no documentado: si se supera la longitud maxima efectiva, el modelo trunca silenciosamente y el embedding resultante pierde informacion sin aviso.
- Riesgo de falsos positivos en similitud: un embedding puede situar como vecinos documentos no relacionados, lo que en un sistema RAG produce recuperaciones incorrectas. Es recomendable incorporar reranking y evaluacion por umbral.
- No es un modelo generativo: no puede usarse para responder preguntas ni para tool calling; solo produce vectores.
- Reproducibilidad parcial: la semilla y la receta estan documentadas, pero el dataset propio de comparacion (`canho/ours-6k`) y los resultados completos de la ablacion no se detallan en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dangerousmanleebyeonggeon/qwen3-emb-0.6b-specter-n5469-e1-ckpt163
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Dataset de entrenamiento (SPECTER cite_prediction): https://huggingface.co/datasets/allenai/scirepeval
- ms-swift (framework de entrenamiento): https://github.com/modelscope/ms-swift
- Sentence Transformers: https://sbert.net
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
