# clm-project/clm-35b-a3b-jev-boost-head

## Resumen

`clm-project/clm-35b-a3b-jev-boost-head` no es un modelo de lenguaje generativo, sino una **cabeza de proyección contrastiva** (state/action head) que se monta sobre los embeddings de `Qwen/Qwen3.6-35B-A3B-FP8`. Concretamente, es un MLP GELU de 3 capas con anchura 1536 y salida de 512 dimensiones que consume embeddings L2-normalizados de 2048 dimensiones (pooling del último token vía vLLM) y produce una puntuación de similitud coseno entre un "estado" y una "acción". El repositorio pesa 0,1 GB, coherente con un artefacto de decenas de millones de parámetros y no con un modelo de 35B.

Lo desarrolla el usuario `clm-project` y se entrena con la herramienta `clm_train` (repo de `jackyk02`). El pipeline incluye pre-entrenamiento y mid-entrenamiento con HQ-DQA, seguido de post-entrenamiento sobre 67 "text stores" del recipe más 382 "Jev boost stores", con un 40 % de replay de HQ-DQA y una mezcla definida en `joint_weights.json`. El checkpoint publicado corresponde al paso 33.000 de 40.000, seleccionado por la pérdida de validación media por store, con una única semilla.

Su relevancia es acotada pero específica: según la métrica propietaria del autor (Jev Decision Index, suite pública de texto), el head sube el índice global de 21,6 a 39,9 y multiplica por cuatro la categoría de herramientas (15,1 → 60,5). Es, por tanto, un componente de decisión/routing para agentes y pipelines de recuperación, no un modelo para generar texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Head contrastivo de dos proyecciones (state head / action head), MLP GELU de 3 capas, anchura 1536, salida 512-d; puntuación = coseno(state, action) sobre embeddings de 2048-d L2-normalizados |
| Parámetros totales | ≈12,6 M en el head (estimación aritmética a partir de la arquitectura declarada: 2048→1536→1536→512 por cabeza); el modelo base Qwen3.6-35B-A3B tiene 35 B |
| Parámetros activos | Head: todos activos. Modelo base: ~3 B según la nomenclatura "A3B" (no confirmado en la model card) |
| Longitud de contexto | No disponible (el head opera por pares estado-acción; el contexto efectivo lo fija el modelo base, no documentado aquí) |
| Tipos de cuantización | No disponible para el head (se distribuye un checkpoint `.pt`); el modelo base referenciado está en FP8. No hay GGUF ni versiones cuantizadas publicadas |
| Idiomas soportados | No disponible (el índice reporta una categoría "language", pero no se enumeran idiomas) |
| Licencia | `other` / `per-source`: las licencias de los datos de entrenamiento varían por fuente y varias son no comerciales |
| Formato de pesos | PyTorch (`best_head.pt`), cargado mediante `clm_train.models.heads.build`; el base en formato FP8 de Qwen (no confirmado el contenedor exacto) |

## Arquitectura y entrenamiento

El artefacto es una cabeza de proyección contrastiva de tipo dual: dos MLP independientes (`pair.state_head` y `pair.action_head`) de 3 capas con activación GELU, anchura 1536 y 512 dimensiones de salida, que proyectan embeddings de 2048 dimensiones procedentes de Qwen3.6-35B-A3B-FP8. La puntuación se obtiene por similitud coseno entre ambas proyecciones, de modo que el head aprende una métrica de compatibilidad estado-acción en lugar de generar tokens. Los embeddings deben extraerse con pooling de último token vía vLLM y normalización L2; para secuencias de un solo token el autor indica usar una tabla de embeddings precalculada (`jackyk02/qwen3.6-35b-a3b-fp8-single-token-embeddings`).

El entrenamiento se realizó con `clm_train` en tres fases: pre-entrenamiento y mid-entrenamiento con HQ-DQA, y post-entrenamiento sobre los 67 text stores del recipe más 382 Jev boost stores descritos en `docs/jev-boost.md`, con estados "plain" y un 40 % de replay de HQ-DQA. La mezcla de fuentes está en `joint_weights.json`, el listado de fuentes en `joint_sources.txt` y las exclusiones justificadas en `joint_exclude.tsv`. El checkpoint publicado es el paso 33.000 de 40.000, elegido por la pérdida de validación media por store, con una sola semilla; no se documentan hiperparámetros, número de tokens vistos ni si hubo fases de preferencia (RLHF/DPO).

## Capacidades

- Puntuación de compatibilidad estado-acción mediante similitud coseno en un espacio de 512 dimensiones.
- Selección de herramientas y acciones: la categoría "tools" del índice sube de 15,1 a 60,5, lo que indica capacidad discriminativa para elegir la acción correcta entre un conjunto de candidatas.
- Recuperación semántica: categoría "retrieval" de 34,1 a 54,7, útil para reordenar o filtrar candidatos.
- Cobertura multilingüe: categoría "language" de 37,5 a 52,1 (sin listado de idiomas).
- Conocimiento declarativo limitado: categoría "knowledge" de 4,2 a 10,9, el punto más débil del índice.
- Rendimiento bajo en tareas creativas/abiertas: categoría "arts" de 12,3 a 16,5.
- No genera texto, no razona en múltiples pasos por sí mismo y no ejecuta tool calling: solo puntúa pares, por lo que actúa como componente de decisión dentro de un agente.
- Integración programática vía `clm_train` (`heads.build(2048, "best_head.pt")`), no vía API de chat.

## Casos de uso

- **Routing de herramientas en agentes**: dado un estado (contexto de conversación o tarea) y un catálogo de acciones candidatas, el head puntúa cada par estado-acción y permite elegir la herramienta con mayor coseno; es el escenario donde el índice reporta la mejora más grande (15,1 → 60,5).
- **Reordenación en pipelines RAG**: usar la puntuación estado-acción como señal de reranking sobre los candidatos devueltos por un buscador vectorial, con la categoría "retrieval" en 54,7 como referencia de calidad.
- **Desambiguación de intenciones en asistentes**: clasificar la intención del usuario comparando el embedding del estado contra un conjunto finito de acciones etiquetadas, sin necesidad de un modelo generativo adicional.
- **Enrutado multilingüe**: al cubrir la categoría "language" con 52,1, puede emplearse para dirigir consultas hacia el pipeline o el modelo especializado adecuado por idioma, siempre que se validen los idiomas concretos de despliegue.
- **Puerta de validación de acciones (guardrails)**: puntuar acciones propuestas por otro modelo antes de ejecutarlas y descartar aquellas con coseno por debajo de un umbral calibrado en validación.
- **Selección de siguiente paso en flujos multi-etapa**: integrar el head en un planificador que, en cada turno, compare el estado actual contra las transiciones disponibles del grafo de tareas.
- **Etiquetado y curación de datos**: usar la puntuación para filtrar pares estado-acción de baja calidad en la construcción de datasets de instrucciones o de decisiones.

## Benchmarks y rendimiento

Jev Decision Index, suite pública de texto (35 de los 37 benchmarks del panel; puntuación propia del índice, vista "plain"):

| Head | Índice texto | Knowledge | Language | Retrieval | Tools | Arts |
|---|---|---|---|---|---|---|
| Baseline (67 text stores) | 21,6 | 4,2 | 37,5 | 34,1 | 15,1 | 12,3 |
| **Este head** | **39,9** | 10,9 | 52,1 | 54,7 | 60,5 | 16,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; además, al tratarse de un head y no de un generador, esas métricas no serían directamente aplicables.

## Requisitos de hardware

- VRAM del head: despreciable, en torno a 50 MB en fp32 según la estimación de ~12,6 M de parámetros; 0,1 GB de repositorio.
- El coste real está en el modelo base de embeddings: Qwen3.6-35B-A3B-FP8 requiere aproximadamente 35 GB solo en pesos, más caché KV y overhead, por lo que conviene presupuestar 40-48 GB de VRAM como mínimo.
- GPU recomendadas: H100 80 GB o A100 80 GB para servicio con holgura; L40S 48 GB o 2× A6000 48 GB como opción ajustada.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en FP8, y no se documenta ninguna cuantización del base compatible con el head. No se recomienda su uso en hardware de consumo.
- Despliegue: el base debe servirse con vLLM en modo pooling (último token) y el head se carga con `clm_train.models.heads.build`. No hay soporte publicado para llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. En la práctica estarán dominados por el coste de una pasada del modelo base de 35B por cada par estado-acción a puntuar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice JDI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este head (Jev boost) | ~12,6 M (head) + base 35B-A3B | No disponible | 39,9 | `other` / per-source | HuggingFace, 0 descargas |
| Baseline (67 text stores) | ~12,6 M (head) + base 35B-A3B | No disponible | 21,6 | No disponible | Referenciado en la model card |
| Otras cabezas contrastivas o rerankers de terceros | No disponible | No disponible | No disponible | No disponible | No se han identificado comparables publicados con métricas equivalentes |

No se dispone de alternativas de la misma categoría con resultados publicados en la información proporcionada; el único punto de comparación fiable es el baseline del propio autor.

## Limitaciones y advertencias

- **No es un modelo generativo**: no produce texto ni ejecuta acciones; solo puntúa pares estado-acción. Cualquier uso como LLM es un error de interpretación.
- **Licencia**: `other` con condiciones `per-source`, con varias fuentes de entrenamiento no comerciales. El uso comercial exige revisar una por una las licencias de los datos, algo que la model card no resuelve por sí sola.
- **Evaluación auto-publicada**: el Jev Decision Index es una métrica propia del autor, sin validación externa ni comparación con benchmarks estándar. Cubre 35 de 37 benchmarks del panel, no la totalidad.
- **Reproducibilidad limitada**: una sola semilla y selección de checkpoint por pérdida de validación media por store; no se reportan intervalos de confianza ni variabilidad entre ejecuciones.
- **Dependencia estricta del preprocesado**: los estados y acciones deben renderizarse y embeberse exactamente como en entrenamiento (`clm_train.render.Renderer`, pooling de último token, normalización L2, tabla específica para secuencias de un token). Cualquier desviación degrada la puntuación de forma no cuantificada.
- **Conocimiento muy bajo** (10,9 en el índice): no es adecuado como fuente de conocimiento factual; la puntuación de compatibilidad no garantiza corrección semántica.
- **Idiomas no documentados**: la categoría "language" existe en el índice, pero no se enumeran los idiomas soportados ni su cobertura real.
- **Riesgo de falsos positivos**: al ser una similitud coseno, puede asignar puntuaciones altas a acciones plausibles pero incorrectas; requiere calibración de umbrales con datos propios.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad ni issues públicas. No se han encontrado enlaces relevantes en la búsqueda web: los resultados devueltos corresponden a "congé de longue maladie" de la función pública francesa y no guardan relación con este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/clm-project/clm-35b-a3b-jev-boost-head
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Repositorio de entrenamiento `clm_train`: https://github.com/jackyk02/clm_train
- Tabla de embeddings de un solo token: https://huggingface.co/datasets/jackyk02/qwen3.6-35b-a3b-fp8-single-token-embeddings
- Recipe de Jev boost: `docs/jev-boost.md` dentro del repositorio del modelo
- Búsqueda web: sin resultados relevantes para este modelo
