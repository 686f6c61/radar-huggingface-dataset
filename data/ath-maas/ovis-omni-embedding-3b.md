# ATH-MaaS/Ovis-Omni-Embedding-3B

## Resumen

Ovis-Omni-Embedding-3B es un modelo de embeddings universal de 3.000 millones de parámetros desarrollado por ATH-MaaS, diseñado para mapear texto, imágenes, documentos visuales, vídeo, audio y entradas multimodales intercaladas a un único espacio de representación coherente. A diferencia de aproximaciones que añaden torres específicas por modalidad, el modelo se inicializa desde Qwen2.5-Omni-3B y conserva su tokenizador de texto, codificador de visión, codificador de audio y backbone Thinker compartido; únicamente se eliminan el módulo Talker de generación de voz y la cabeza de modelado de lenguaje. El embedding de recuperación se obtiene directamente del estado oculto de la última capa en el último token no de relleno.

El modelo es un bi-encoder (no un cross-encoder): consultas y candidatos se codifican de forma independiente y se ordenan por similitud coseno tras normalización L2, sin generación de respuestas ni atención cruzada entre consulta y candidato. Está pensado para búsqueda multimodal, generación aumentada por recuperación (RAG), recomendación, recuperación de documentos visuales, búsqueda de vídeo y audio y recuperación agéntica sobre herramientas, interfaces y memoria.

Su relevancia actual radica en que unifica seis grupos de tareas de recuperación (imagen, vídeo, documento visual, texto, audio y agente) en un solo encoder, con resultados que lideran el benchmark omni-modal MMEB-v3 (190 conjuntos de datos) con una puntuación global de 58,46, superando al mejor baseline comparado por 5,19 puntos. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (backbone Thinker de Qwen2.5-Omni) con TMRoPE, codificador de vision y codificador de audio nativos |
| Parametros totales | ~3B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Tamano del repositorio | 11,1 GB |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-24 |
| Descargas / likes | 48 / 26 |

## Arquitectura y entrenamiento

Ovis-Omni-Embedding-3B parte de Qwen2.5-Omni-3B y reutiliza su pila nativa completa: tokenizador de texto, codificador de visión, codificador de audio y el backbone Thinker compartido que procesa texto, tokens visuales y tokens acústicos como una única secuencia intercalada. El modelo incorpora el time-aligned multimodal rotary position embedding (TMRoPE) de Qwen2.5-Omni, que preserva la alineación temporal entre audio y vídeo. La cabeza de generación de lenguaje y el módulo Talker se eliminan, y la representación de recuperación es simplemente el estado oculto de la última capa en el último token no de relleno, sin cabezas de proyección específicas por modalidad. La recuperación se realiza como bi-encoder: se formatea la consulta con una instrucción de tarea mediante el procesador y la plantilla de chat nativos, se codifican consulta y candidato por separado, se extrae el estado oculto final, se normaliza L2 y se ordena por similitud coseno.

El entrenamiento consta de tres etapas. La primera es un preentrenamiento contrastivo omni-modal con candidatos mezclados globalmente y negativos in-batch entre dispositivos, combinando aprendizaje contrastivo focal sensible a la dificultad con destilación de distribuciones de similitud a partir de expertos complementarios por modalidad. La segunda es un ajuste fino homogéneo a parámetros completos con datos de alta calidad: cada micro-lote procede de un único conjunto de datos y se deduplica candidatos para evitar colisiones positivas y falsos negativos in-batch. La tercera es una destilación de embeddings con annealing, que conserva los ejemplos resueltos por el profesor, sobremuestrea los ejemplos no resueltos por el estudiante y aplica supervisión forward-KL adaptativa a la confianza. Además, se describe un módulo de descomposición de bajo rango en tiempo de inferencia que combina una base PCA compartida con adaptadores residuales ligeros para producir embeddings compactos.

## Capacidades

- Generacion de embeddings multimodales en un unico espacio para texto, imagenes, documentos visuales, video, audio y entradas intercaladas.
- Recuperacion any-to-any: cualquier modalidad soportada puede recuperar cualquier otra dentro del mismo espacio de representacion.
- Recuperacion de texto a texto y clasificacion tratando etiquetas, pasajes y candidatos como elementos del mismo espacio.
- Busqueda de imagen, video y audio mediante similitud coseno sobre embeddings normalizados.
- Recuperacion de documentos visuales (paginas escaneadas, documentos con layout).
- Recuperacion agentica sobre herramientas, interfaces y memoria (grupo "Agent" de MMEB-v3).
- Base para sistemas RAG multimodales.
- No realiza generacion de respuestas ni cross-attention consulta-candidato: es puramente un encoder de recuperacion.
- Soporte de tool calling / function calling: no disponible (el modelo no genera texto).
- Modo thinking, vision o audio generativo: no disponible (son capacidades eliminadas respecto al modelo base).

## Casos de uso

- Busqueda multimodal empresarial: indexar un corpus mixto de texto, imagenes, PDFs escaneados y video, y recuperar items relevantes desde una consulta en cualquier modalidad, gracias al espacio de embeddings unico.
- RAG multimodal: usar el modelo como recuperador en pipelines de generacion aumentada, codificando consultas y candidatos de forma independiente para alimentar un LLM generativo posterior.
- Recomendacion de contenido: representar usuarios, items y contexto (imagen, video, audio) en el mismo espacio para sistemas de recomendacion basados en similitud.
- Recuperacion de documentos visuales: localizar paginas o figuras concretas en repositorios de documentos escaneados (el grupo "Visual document" obtiene 78,26 en MMEB-v3).
- Busqueda de video y audio: recuperar clips por contenido semantico o por consulta textual, apoyandose en TMRoPE para la alineacion temporal audio-video.
- Recuperacion agentica: dotar a agentes de una capa de memoria y recuperacion de herramientas o interfaces (grupo "Agent", 45,52 en MMEB-v3).
- Deduplicacion y clustering multimodal: agrupar elementos similares de distintas modalidades mediante similitud coseno.
- Moderacion y clasificacion: tratar etiquetas como candidatos y asignar la mas similar a cada entrada.

## Benchmarks y rendimiento

Resultados publicados en MMEB-v3 (190 conjuntos de datos; grupos agregados por modalidad). La model card indica que el modelo alcanza 58,46 global, supera al mejor baseline comparado por 5,19 puntos y lidera la puntuacion agregada de todos los grupos de modalidad:

| Grupo | Ovis-Omni-Embedding-3B | Mejor baseline comparado | Margen |
|---|---:|---:|---:|
| Image | 77,55 | 73,83 | +3,72 |
| Video | 64,99 | 59,37 | +5,62 |
| Visual document | 78,26 | 75,37 | +2,89 |
| Text | 47,15 | 43,62 | +3,53 |
| Audio | 50,08 | 43,17 | +6,91 |
| Agent | 45,52 | 39,42 | +6,10 |
| **Todos los 190 conjuntos** | **58,46** | 53,27 | +5,19 |

Nota: el extracto de la model card termina en la frase "Across the 31 aggregate and sub-task e...", por lo que no se dispone del detalle de las 31 tareas agregadas y subtareas. No se han publicado en la informacion disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K (el modelo es de embeddings, no generativo).

## Requisitos de hardware

Estimaciones basadas en el tamano de ~3B parametros y en el tamano del repositorio (11,1 GB). No son datos confirmados por el autor y deben tomarse como orientativos:

- VRAM estimada en BF16/FP16: aproximadamente 8-12 GB, sumando pesos del backbone y de los codificadores de vision y audio mas activaciones.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-6 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3-4 GB (los formatos de cuantizacion concretos no estan confirmados en la informacion disponible).
- GPU de centro de datos: A100, H100, L40S para inferencia de alto throughput o indexacion a gran escala.
- GPU de consumo: cabe previsiblemente en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en cuantizacion reducida; en BF16 conviene disponer de 16 GB o mas.
- Opciones de despliegue: transformers de forma nativa (biblioteca declarada); el tag "endpoints_compatible" sugiere compatibilidad con Inference Endpoints. Otras opciones (vLLM, TGI, llama.cpp, Ollama) no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no identifica por nombre los modelos baseline comparados en MMEB-v3, por lo que no es posible construir una comparativa nominal fiable. Datos disponibles:

| Aspecto | Ovis-Omni-Embedding-3B | Baselines de MMEB-v3 |
|---|---|---|
| Parametros | ~3B | no disponible |
| Contexto | no disponible | no disponible |
| MMEB-v3 global | 58,46 | 53,27 (mejor baseline) |
| Modalidades | Texto, imagen, video, audio, documento visual, agente | no disponible |
| Licencia | apache-2.0 | no disponible |
| Disponibilidad | HuggingFace (ATH-MaaS) | no disponible |

Comparativa nominal con alternativas concretas: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; al derivar de Qwen2.5-Omni-3B hereda los sesgos de su corpus de entrenamiento, no documentados aqui.
- Riesgo de alucinacion: bajo en el sentido generativo, ya que el modelo no genera texto; el riesgo se traslada a falsos positivos en la ordenacion por similitud.
- El modelo es un bi-encoder sin cross-attention consulta-candidato, por lo que no puede aprovechar interacciones finas entre consulta y candidato que si explotaria un cross-encoder.
- Limitaciones de contexto e idioma: no disponibles; no se especifican idiomas soportados ni longitud de contexto.
- El modelo no genera respuestas; para RAG requiere emparejarlo con un LLM generativo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones heredadas del modelo base Qwen2.5-Omni-3B del que se inicializa.
- La extraccion de embeddings depende de usar correctamente la plantilla de chat y el procesador nativos; un formateo incorrecto de la instruccion de recuperacion puede degradar la calidad.
- No se documentan en la informacion disponible los formatos de cuantizacion, el rendimiento en produccion ni los requisitos exactos de hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ATH-MaaS/Ovis-Omni-Embedding-3B
- Repositorio GitHub: https://github.com/ATH-MaaS/Ovis-Omni-Embedding
- Informe tecnico (arXiv): https://arxiv.org/html/2609.25165v1
- PDF del informe tecnico: https://arxiv.org/pdf/2609.25165
- Modelo base: Qwen2.5-Omni-3B (referenciado en la model card; enlace directo no proporcionado)
