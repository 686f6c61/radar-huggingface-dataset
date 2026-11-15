# Louvain/embed-4b-erb

## Resumen

Louvain/embed-4b-erb es un modelo de embeddings de frases (sentence embeddings) derivado de Qwen/Qwen3-Embedding-4B, ajustado por Louvain para recuperación de información (retrieval) sobre el corpus sintético de una empresa del benchmark EnterpriseRAG-Bench. No es un modelo generativo: su función es transformar consultas y pasajes de documentos en vectores densos de 2.560 dimensiones (servibles a 768 mediante Matryoshka) para búsqueda semántica y sistemas RAG. La relevancia actual reside en que demuestra el patrón de "self-tuning": partir de un embedder generalista fuerte y especializarlo con LoRA sobre el dominio documental concreto de una organización, sin cambiar la arquitectura.

El modelo conserva la arquitectura transformer de Qwen3-Embedding-4B (4.021.774.336 parámetros) y añade un adaptador LoRA de rango 64 fusionado en los pesos base. El entrenamiento se hizo exclusivamente con preguntas sintéticas generadas por qwen/qwen3-235b-a22b-2507 a partir de los propios pasajes del corpus, con negativos duros extraídos de BM25 y de los vecinos más cercanos de Qwen3-Embedding-0.6B: 57.407 tripletas (pregunta, pasaje, negativos) en una sola época.

Su interés práctico es doble: por un lado, mejora de forma sustancial la recuperación sobre el embedder base en el dominio objetivo (de 1 a 9 aciertos en el top-1 en el subconjunto semántico de 25 preguntas); por otro, publica scripts de entrenamiento reproducibles y un procedimiento de despliegue con verificación de integridad por SHA-256. La licencia es Apache-2.0, igual que la del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-Embedding-4B) con adaptador LoRA rango 64 fusionado; sin cambios estructurales |
| Parámetros totales | 4.021.774.336 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | consultas hasta 96 tokens; pasajes hasta 384 tokens (longitudes de entrenamiento) |
| Tipos de cuantización | no disponible (el modelo se sirve en float32; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, sha256 771b1d5b1419e49b588febfc655e469e27ebd3d72031a5a00624f711cade530b) |
| Dimensiones de embedding | 2.560 (completo); 768 entrenado con Matryoshka y servido a esa anchura |
| Pooling | último token, con padding a la izquierda, vectores L2-normalizados |
| Prefijo de instrucción | solo en consultas: "Instruct: Given a question about a company's work, retrieve the passages that answer it\nQuery: " |
| Librería | sentence-transformers |
| Versión de transformers recomendada | 5.17.0 (float32) |
| rope_theta | 1.000.000 (declarado también a nivel superior del config) |
| Tamaño del repo | 8,1 GB |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only de Qwen3-Embedding-4B reutilizada como encoder de embeddings, con pooling de último token y normalización L2. El ajuste consiste en un LoRA de rango 64 sobre los pesos base, fusionado posteriormente, por lo que no hay alteración de la arquitectura ni del número de parámetros. Se entrena también de forma Matryoshka sobre las primeras 768 dimensiones, lo que permite truncar el vector y renormalizar sin reentrenar. El config declara `rope_theta` a 1.000.000 tanto en el nivel superior como en `rope_parameters`, una precaución explícita porque un cargador que ignore el valor anidado cae a 10.000 y produce embeddings incorrectos (coseno de 0,94–0,97 respecto a los correctos) sin emitir error.

El entrenamiento usa objetivo contrastivo InfoNCE con negativos en lote y negativos duros, temperatura 0,05, learning rate 1e-4, batch 32, una época (1.794 pasos) y semilla 215. Los datos son exclusivamente preguntas sintéticas sobre pasajes del corpus: cada pasaje muestreado recibe dos preguntas generadas por qwen/qwen3-235b-a22b-2507, una de tipo "qué preguntaría un colega" y otra reformulada sin las palabras del documento. Los negativos duros se minan por pregunta desde BM25 y desde los vecinos más cercanos de Qwen3-Embedding-0.6B. En total, 57.407 tripletas. Se reservaron 11.925 documentos fuera del entrenamiento (los 9.429 del pool de evaluación puntuado y 3.511 de un segundo pool). No se incluyeron preguntas, respuestas ni etiquetas gold del benchmark en ningún formato. El cómputo total fue de 10.292 s en una A100 de 80 GB. Los scripts están en `training/` (con `pipeline.sh` y `self-tune.json`), aunque no se publican las tripletas ni la lista de identificadores reservados.

## Capacidades

- Generación de embeddings densos para recuperación semántica y búsqueda de pasajes (retrieval), no generación de texto.
- Similitud de frases y documentos mediante producto escalar de vectores normalizados.
- Soporte de truncado Matryoshka a 768 dimensiones con renormalización, útil para reducir coste de índice y latencia.
- Prefijo de instrucción específico para consultas, configurado en la sentence-transformers config con `prompt_name="query"`.
- Compatible con text-embeddings-inference y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Integración con sentence-transformers y con transformers puro (pooling de último token, padding a la izquierda).
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés (`en`).
- Tool calling, agentes, visión, audio o modo thinking: no disponibles (no es un modelo generativo).

## Casos de uso

- Búsqueda semántica sobre documentación interna de una empresa: el modelo está ajustado sobre un corpus corporativo sintético, por lo que sirve como plantilla para indexar manuales, políticas y contratos y recuperar pasajes relevantes ante preguntas de empleados, aprovechando el prefijo de instrucción específico para consultas.
- Pipeline RAG de atención al cliente: al devolver vectores de 768 dimensiones tras truncado Matryoshka, permite índices más pequeños y menor latencia en la búsqueda inicial, con una pérdida mínima medida en el benchmark (7/16/18/23 frente a 9/16/17/22 en el subconjunto semántico).
- Recuperación en dominios con jerga propia: el entrenamiento con preguntas reformuladas sin las palabras del documento mejora la recuperación cuando el usuario no comparte el vocabulario del texto, como en soporte técnico o compliance.
- Deduplicación y agrupación de documentos: los embeddings normalizados permiten calcular similitud coseno entre pasajes y agrupar contenido redundante en repositorios documentales.
- Motor de búsqueda para asistentes de conocimiento corporativo: combinable con BM25 y un reranker en una arquitectura híbrida, tal como hace el motor de Louvain, para consultas que mezclan coincidencia léxica y semántica.
- Evaluación y reproducción de experimentos de self-tuning: los scripts de `training/` y `self-tune.json` permiten replicar el ajuste LoRA sobre un corpus propio y comparar la recuperación con el embedder base.
- Filtrado previo en sistemas de moderación o clasificación: los vectores pueden alimentar clasificadores lineales sobre similitud con prototipos, sin necesidad de un modelo generativo.

## Benchmarks y rendimiento

Evaluación de recuperación sobre 50 preguntas de desarrollo de EnterpriseRAG-Bench (25 semánticas y 25 de otro tipo), sobre 9.429 documentos (89.311 pasajes), con todos los documentos del pool reservados del entrenamiento. Se cuenta el número de preguntas con un documento gold en el ranking 1 / ≤5 / ≤10 / ≤18:

| Modelo | Semánticas (n=25) | Otras (n=25) |
|---|---|---|
| Qwen3-Embedding-4B (base) | 1 / 6 / 7 / 12 | 11 / 16 / 18 / 19 |
| qwen3-4b-st-B, anchura completa | 9 / 16 / 17 / 22 | 15 / 20 / 21 / 21 |
| qwen3-4b-st-B, 768 dimensiones | 7 / 16 / 18 / 23 | 14 / 20 / 20 / 21 |

El autor advierte que estas cifras son de recuperación del embedder aislado, no una puntuación del benchmark. En la ejecución completa del benchmark (100 preguntas de desarrollo, evaluador propio), sustituir el embedder por defecto del motor (bge-base-en-v1.5) por este modelo supuso 1,21 puntos menos en una única ejecución, con una variación entre ejecuciones idénticas de aproximadamente 1,5 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 16 GB solo para pesos (4.021.774.336 parámetros × 4 bytes), más overhead de activaciones y tokenizador; se recomienda reservar 20–24 GB.
- GPU recomendadas: A100 80 GB (la usada para entrenar), H100, L40S o A10G para servicio; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) en float32 con margen ajustado.
- Cabe en GPU consumer de 24 GB en float32; en GPUs de 16 GB requeriría cuantización, para la que no se documentan formatos soportados.
- Opciones de despliegue: sentence-transformers, transformers 5.17.0 en float32, text-embeddings-inference, endpoints compatibles, y el sidecar de embeddings del motor abierto de Louvain (`apps/nlp/embed.py`, backend torch) con las variables `LOUVAIN_EMBEDDING_*` documentadas. La imagen GPU (`apps/nlp/Dockerfile.gpu`) fija el commit y rechaza la construcción si el digest de `model.safetensors` no coincide.
- Latencia y throughput: no disponibles. El único dato de cómputo publicado es el tiempo de entrenamiento (10.292 s en una A100 80 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Louvain/embed-4b-erb | 4.021.774.336 | consultas 96 / pasajes 384 tokens | 2.560 (768 Matryoshka) | Apache-2.0 | Hugging Face (2 descargas, 1 like) | Ajustado a un corpus corporativo sintético; inglés |
| Qwen/Qwen3-Embedding-4B | 4.021.774.336 | no disponible en la información | no disponible en la información | Apache-2.0 | Hugging Face (modelo base público) | Generalista; sirve de referencia en la tabla de recuperación |
| Qwen3-Embedding-0.6B | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Hugging Face | Usado para minar negativos duros; no comparado en recuperación |
| bge-base-en-v1.5 | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Hugging Face | Embedder por defecto del motor de Louvain; 1,21 puntos por encima en la ejecución completa del benchmark |

## Limitaciones y advertencias

- El modelo solo declara inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Está ajustado sobre el corpus sintético de una empresa concreta de EnterpriseRAG-Bench; su ventaja frente al base puede no transferirse a otros dominios sin un nuevo ajuste.
- Las longitudes de entrenamiento son cortas (96 tokens para consultas, 384 para pasajes); textos más largos requieren truncado y pueden perder información.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de recuperación errónea: el modelo devuelve el pasaje más similar, no una respuesta verificada.
- El autor reporta que en la ejecución completa del benchmark este embedder quedó 1,21 puntos por debajo del embedder por defecto, con una variabilidad entre ejecuciones de unos 1,5 puntos; la mejora es clara en recuperación aislada, no necesariamente en la métrica final del sistema.
- Requiere transformers 5.17.0 en float32; otras versiones o un cargador que ignore `rope_theta` anidado producen embeddings incorrectos sin error visible.
- El prefijo de instrucción es obligatorio en las consultas y debe omitirse en los documentos; invertirlo degrada la recuperación.
- No se publican las tripletas de entrenamiento ni la lista de identificadores reservados, lo que limita la auditoría completa del ajuste.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el corpus de origen tienen sus propias condiciones; el corpus de EnterpriseRAG-Bench se declara MIT según su editor.
- El repositorio tiene un uso muy bajo (2 descargas, 1 like) y fue creado en noviembre de 2026; no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Louvain/embed-4b-erb
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- EnterpriseRAG-Bench: https://onyx.app/enterpriserag-bench
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados disponibles corresponden a la ciudad belga de Lovaina y a la Université catholique de Louvain, sin relación con este modelo.
