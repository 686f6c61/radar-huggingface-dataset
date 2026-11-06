# jersobh/epochdb-embed-0.6b

## Resumen
epochdb-embed-0.6b es un modelo de embeddings de frases (sentence transformer) afinado por el usuario jersobh a partir de `unsloth/Qwen3-Embedding-0.6B`. Convierte texto en vectores densos de 1024 dimensiones y esta disenado especificamente para la recuperacion de memoria de agentes: el prefijo de instruccion usado en los ejemplos ("Retrieve current active agent memory state and entity facts") y la naturaleza de los pares de entrenamiento (correcciones de hechos, cambios de atributos de entidades) apuntan a un uso como motor de recuperacion semantica dentro de EpochDB, el motor de memoria para agentes del mismo autor.

El modelo es pequeno (595.776.512 parametros, unos 1,8 GB de repositorio) y esta pensado para ejecutarse con latencia baja y coste reducido, lo que encaja con un uso intensivo en pipelines de agentes que consultan memoria en cada turno. La longitud maxima de secuencia es de 512 tokens, suficiente para fragmentos de hechos y consultas cortas, pero no para documentos largos.

Su relevancia es acotada: se trata de un ajuste fino sobre una base ya publica, con un conjunto de entrenamiento pequeno (6492 muestras) y sin resultados de benchmarks publicados. Resulta interesante como ejemplo de embedding especializado en memorias de agente y correccion de hechos, pero su evaluacion en produccion requerira validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3Model + pooling de ultimo token + normalizacion (SentenceTransformer) |
| Parametros totales | 595.776.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | GGUF (tag del repositorio); niveles concretos no disponibles |
| Idiomas soportados | no disponible (los ejemplos de la model card incluyen espanol, frances, italiano, portugues, aleman y ruso) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |
| Dimension de embedding | 1024 |
| Funcion de similitud | similitud coseno |
| Modalidad | texto |

## Arquitectura y entrenamiento
La arquitectura es un SentenceTransformer compuesto por tres modulos: un transformer Qwen3 (tarea `feature-extraction`, salida `last_hidden_state`), un pooling de tipo `lasttoken` con `include_prompt: True` que produce un vector de 1024 dimensiones, y una capa de normalizacion. Se trata, por tanto, de un transformer decoder-only reutilizado como encoder de embeddings, con pooling sobre el ultimo token en lugar de media de tokens.

El ajuste fino parte de `unsloth/Qwen3-Embedding-0.6B` y se ha realizado con la libreria sentence-transformers sobre un dataset de 6492 muestras con columnas `anchor`, `positive` y `negative`. Las funciones de perdida registradas son `MatryoshkaLoss` y `MultipleNegativesRankingLoss`: la primera permite truncar los embeddings a dimensiones menores conservando calidad relativa, y la segunda es una perdida de ranking con negativos en batch habitual en recuperacion densa. El contenido de los ejemplos sugiere un dataset orientado a correccion de hechos y actualizacion de estado de entidades (por ejemplo, cambios de empleador o ciudad de una persona), con pares en varios idiomas. No se documenta el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO.

## Capacidades
- Generacion de embeddings de texto de 1024 dimensiones para similitud semantica, busqueda semantica, mineria de parafrasis, clasificacion y clustering.
- Recuperacion orientada a memoria de agentes: los ejemplos de la model card usan una instruccion fija para recuperar estado activo de memoria y hechos de entidades.
- Diferenciacion entre hechos actualizados y obsoletos: los pares de entrenamiento incluyen negativos que contradicen o actualizan un hecho (por ejemplo, ciudad o empleador anteriores frente a los actuales).
- Soporte multilingue aparente: los ejemplos cubren espanol, frances, italiano, portugues, aleman y ruso, aunque no se declara una lista oficial de idiomas.
- API de query/documento separada (`encode_query` y `encode_document`) heredada de sentence-transformers.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference` y `endpoints_compatible`).
- No soporta generacion de texto, tool calling, agentes multi-paso, vision ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso
- Memoria de agentes conversacionales: el modelo indexa hechos y estados de entidades y recupera, dada una consulta con instruccion, el recuerdo mas relevante; su tamano reducido permite consultarlo en cada turno sin penalizar la latencia del agente.
- Correccion determinista de hechos: en un motor como EpochDB, los embeddings permiten localizar el registro obsoleto de una entidad (por ejemplo, una ciudad anterior) y sustituirlo por el nuevo, apoyandose en los negativos de actualizacion vistos en entrenamiento.
- Busqueda semantica sobre bases de conocimiento pequenas o medianas: con 512 tokens de contexto por fragmento, encaja en la indexacion de fichas, notas y registros estructurados textualizados.
- Deduplicacion y clustering de recuerdos: agrupar entradas de memoria semanticamente equivalentes para compactar el almacenamiento por niveles de EpochDB.
- Recuperacion multilingue en asistentes: al haber sido entrenado con ejemplos en varias lenguas, puede alinear consultas y documentos en idiomas distintos dentro de un mismo espacio vectorial, aunque requiere validacion por idioma.
- Clasificacion y enrutado de consultas: usar los embeddings como entrada de un clasificador ligero para decidir que tipo de recuperacion o herramienta necesita una peticion.
- Filtrado de candidatos en pipelines RAG: primera etapa de recuperacion densa barata antes de un reranker mas costoso.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: en fp16, aproximadamente 1,2 GB solo para pesos; en fp32, unos 2,4 GB; con cuantizacion GGUF (Q8/Q4) el peso baja de forma proporcional, aunque no se publican niveles concretos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; A100, H100 y L4 quedan sobredimensionadas para el modelo y solo se justifican por concurrencia.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; tambien puede ejecutarse en CPU para cargas por lotes.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (tag explicito en el repositorio), llama.cpp u Ollama mediante los pesos GGUF, y servidores de embeddings compatibles con la API de sentence-transformers.
- Latencia y throughput: no disponibles; con 0,6 B de parametros y 512 tokens de contexto se espera un coste por embedding bajo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| jersobh/epochdb-embed-0.6b | 595.776.512 | 512 | 1024 | no disponible | Ajuste fino especializado en memoria de agentes; sin benchmarks publicados |
| unsloth/Qwen3-Embedding-0.6B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Modelo base del que parte este ajuste |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias
- No hay resultados de benchmarks publicados, por lo que la calidad relativa frente al modelo base o a alternativas no esta verificada.
- El dataset de entrenamiento es pequeno (6492 muestras) y esta muy orientado a un dominio concreto (memoria de agentes y correccion de hechos); el rendimiento fuera de ese dominio puede degradarse.
- La ventana de 512 tokens limita el uso sobre documentos largos; sera necesario fragmentar.
- No se declara la licencia, lo que impide confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de desplegarlo en produccion.
- No se declara una lista oficial de idiomas; el multilingueismo observado en los ejemplos no garantiza cobertura uniforme.
- Riesgo de sesgos y alucinaciones en la recuperacion: como cualquier modelo de embeddings, puede devolver vecinos semanticamente proximos pero factualmente incorrectos, especialmente con negativos sutiles.
- El modelo base Qwen3-Embedding y este ajuste usan pooling de ultimo token con `include_prompt: True`, por lo que el formato exacto de la instruccion afecta a los resultados; hay que replicar el prefijo usado en entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jersobh/epochdb-embed-0.6b
- Modelo base: https://huggingface.co/unsloth/Qwen3-Embedding-0.6B
- Repositorio EpochDB en GitHub: https://github.com/jersobh/epochdb
- Paquete EpochDB en PyPI: https://pypi.org/project/epochdb/
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Paper de MultipleNegativesRankingLoss (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Matryoshka Representation Learning (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper de SimCSE (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
