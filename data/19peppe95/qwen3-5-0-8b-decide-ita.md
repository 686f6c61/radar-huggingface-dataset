# 19Peppe95/Qwen3.5-0.8B-Decide-ITA

## Resumen

Qwen3.5-0.8B-Decide-ITA es un modelo de decisión estructurada, solo texto, desarrollado por el usuario de Hugging Face 19Peppe95 sobre el backbone `unsloth/Qwen3.5-0.8B`. No genera texto de forma autorregresiva: en un único forward pass produce distribuciones de decisión calibradas (elección categórica, puntuación ordinal y compuerta binaria) para tareas de enrutamiento empresarial, cribado de PII y triaje de tickets de service desk, con foco en italiano e inglés.

El modelo sustituye la cabeza generativa por una cabeza de decisión Clef de atención cruzada conjunta (`joint_head`, ~27,3 M de parámetros) entrenada mediante la API `FastDecisionModel` de Unsloth. Se han eliminado los pesos de la torre visual multimodal (`visual.*`) y de predicción multi-token (`mtp.*`), reduciendo el repositorio a 1,8 GB (1,33 GB en FP16). Con 873,4 M de parámetros totales, está pensado para despliegues de baja latencia y hardware modesto, donde clasificar en lugar de generar ahorra coste y tokens.

Su relevancia actual radica en el patrón "zero-token generation": para routing, detección de PII o escalado a humano no hace falta un LLM generativo, sino un clasificador calibrado y determinista. El modelo cubre tres tipos de decisión (`choice`, `score`, `noul`) con calibración por temperatura por tipo, y se distribuye con licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5) con cabeza de decisión Clef de atención cruzada conjunta (`joint_head`) |
| Parámetros totales | 873.438.784 (~0,87 B); cabeza de decisión ~27,3 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | `max_seq_length = 1280`; `head_max_len = 384` (límite de la cabeza) |
| Tipos de cuantización | FP16 (pesos publicados); 4-bit `bitsandbytes` usado en evaluación; GGUF no disponible en el repo |
| Idiomas soportados | Italiano (it), inglés (en); datos de entrenamiento incluyen también español y francés (es, fr) vía OASST2 |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `unsloth`) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-0.8B` y le añade una cabeza de decisión Clef (`joint_head`) de atención cruzada conjunta de ~27,3 M de parámetros. En lugar de decodificar tokens, mapea la entrada a varias distribuciones de decisión en un solo forward pass: `choice` (clasificación categórica sobre un esquema de opciones proporcionado en tiempo de ejecución), `score` (graduación ordinal 0..K-1 con valor esperado continuo) y `noul` (compuerta binaria para políticas, PII y escalado). El backbone se adaptó con QLoRA (r=16, α=32, módulos de lenguaje) y se fusionó a 16 bits.

Los datos combinan `OpenAssistant/oasst2` (prompts y respuestas reales en italiano y lenguas romances, particionados por `message_tree_id` para evitar fuga), `LocalLLaMA/typed-decisions` (registros de decisión estructurados en inglés) y un corpus procesal italiano generado de forma determinista a partir de plantillas administrativas, clínicas y fiscales, con identificadores sintéticos. Los splits locales son 2.018 registros de entrenamiento, 242 de calibración, 136 de validación y 176 casos en el benchmark sellado. Se aplicó un currículo multi-vista (70 % de los registros Router/PII de 5 preguntas divididos en dos vistas de 3 preguntas de ~320 tokens de esquema; el 30 % restante como registros completos) y calibración por temperatura por tipo (`fitted_types = [0,1,2]`, T ∈ [0,70, 2,50]). El `trainer_state.json` y los logs del run final se perdieron, por lo que no hay curvas de pérdida ni número exacto de pasos o épocas. Un run previo con `max_seq_length=576` y `head_max_len=192` descartó silenciosamente el 63,4 % de las filas (1.279 de 2.018), incluidas todas las de 5 preguntas, y la cabeza `score` no entrenó (precisión GDPR Art. 9 del 19,6 %).

## Capacidades

- Clasificación categórica (`choice`) sobre esquemas de opciones definidos en runtime, sin generación de tokens.
- Puntuación ordinal (`score`) con probabilidades por nivel y valor esperado continuo.
- Compuerta binaria (`noul`) para comprobaciones de política, detección de PII y escalado a humano.
- Enrutamiento de modelos y selección de tarea de IA a partir del prompt.
- Cribado de PII y evaluación de riesgo GDPR Art. 9 (datos de categoría especial).
- Triaje de tickets de service desk: departamento, urgencia SLA, relevancia de respuesta y escalado.
- Evaluación de relevancia de respuestas en QA (opción completa, truncada, evasiva o fuera de tema).
- Multilingüe limitado a italiano e inglés (con exposición a es/fr en entrenamiento, sin garantía de rendimiento).
- No soporta tool calling, agentes multi-paso, visión, audio ni modo thinking: es un clasificador de decisión, no un LLM generativo.

## Casos de uso

- Enrutamiento de modelos en producción: dado un prompt de usuario, el modelo decide en un solo forward pass qué modelo o tarea de IA debe atenderlo (`choice` sobre el esquema de tareas), evitando el coste de un LLM generativo para una decisión discreta.
- Cribado de PII en pipelines de datos: la compuerta `noul` detecta presencia de identificadores personales antes de enviar texto a servicios externos, con latencia de milisegundos y sin generar tokens.
- Cumplimiento GDPR: clasificación del riesgo Art. 9 (`score`) sobre registros administrativos o clínicos para decidir si requieren tratamiento reforzado o revisión legal.
- Triaje de tickets de soporte: asignación de departamento, urgencia SLA y decisión de escalado a humano (`noul`) en un único paso, adecuado para volúmenes altos donde el coste por ticket importa.
- Filtrado de respuestas en sistemas RAG: evaluar si la respuesta recuperada es completa, truncada, evasiva o fuera de tema (`choice`) antes de mostrarla al usuario.
- Moderación y políticas internas: comprobaciones binarias de política sobre texto entrante en italiano, integrables como paso previo a un LLM mayor.
- Preprocesado en hardware modesto: al caber en 4 GB de VRAM en 4-bit (evaluado en una GTX 1050), sirve como clasificador de primera línea en entornos sin GPU de datacenter.

## Benchmarks y rendimiento

Los resultados se evaluaron sobre un benchmark sellado de 176 casos (740 decisiones: 616 en italiano y 124 en inglés). La información proporcionada incluye la Tabla 1 truncada: solo consta la precisión en italiano del modelo propio (80,19 %, 494/616) y el inicio del dato en inglés (6...), sin valor completo. El resto de columnas y los modelos competidores no están disponibles en el material recibido.

| Modelo | Parámetros | Acc. IT (616 dec.) | Acc. EN (124 dec.) | Acc. total (740 dec.) | Record exact (176 casos) | Score MAE | ECE | p50 ms (GTX 1050) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Ours | 0,8B | 80,19 % (494/616) | no disponible (truncado) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Ours — Prior Run | 0,8B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Competidores GGUF | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Subconjuntos del benchmark: `IT_Model_Router_PII` (56 casos, 280 decisiones), `IT_Enterprise_Tickets` (48 casos, 192 decisiones), `IT_OASST2_Real_QA` (36 casos, 144 decisiones) y `EN_TypedDecisions_Ctrl` (36 casos, 124 decisiones). Latencia medida en una Tesla T4: ~220 ms de mediana por caso multi-pregunta con `FastDecisionModel`. La comparación de latencia con los competidores GGUF no es directa: Clef responde todas las preguntas en un forward pass, mientras que los GGUF necesitan un pase por pregunta. El run previo obtuvo un 19,6 % de precisión en GDPR Art. 9 Risk.

## Requisitos de hardware

- VRAM estimada: ~1,8 GB en FP16 para los pesos; en 4-bit `bitsandbytes` cabe holgadamente en 4 GB (configuración usada en la evaluación con una GTX 1050).
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM para 4-bit; T4, L4 o RTX 3060 en adelante para FP16 con margen. En la evaluación se usó una GTX 1050 (4 GB, Pascal `sm_61`, sin `causal_conv1d` ni `torch.compile`).
- Cabe en GPU de consumo: sí, en GTX 1050/1650, RTX 3050/3060 y superiores, con 4-bit para las más ajustadas.
- Opciones de despliegue: `FastDecisionModel` de Unsloth (usado en la evaluación); el repo no publica pesos GGUF, por lo que llama.cpp, Ollama o vLLM no están documentados para este modelo.
- Latencia y throughput: ~220 ms de mediana por caso multi-pregunta en Tesla T4; en GTX 1050 la columna de latencia de la tabla no está disponible en el material recibido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Qwen3.5-0.8B-Decide-ITA | 0,87 B | 1.280 tokens | Decisiones estructuradas (choice/score/noul) | Apache-2.0 | Hugging Face, safetensors |
| unsloth/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Generación de texto autorregresiva | no disponible en la información | Hugging Face |
| Competidores GGUF del benchmark | no disponible | 1.280 tokens en evaluación | Generación de texto | no disponible | no disponible |

No se dispone en la información proporcionada de resultados completos de los competidores ni de sus nombres, parámetros o licencias, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Solo texto: la torre visual fue eliminada; no hay capacidades multimodales.
- Idiomas limitados a italiano e inglés; la exposición a español y francés en entrenamiento no implica rendimiento garantizado.
- No es un modelo generativo: no sirve para chat, redacción, código ni razonamiento abierto; su salida son distribuciones de decisión sobre esquemas predefinidos.
- El benchmark sellado es pequeño (176 casos, 740 decisiones) y en gran parte sintético (Router/PII y Enterprise Tickets); los resultados en dominios reales pueden diferir.
- Los competidores se evaluaron zero-shot mientras el modelo propio se entrenó con los mismos esquemas de tarea, lo que favorece al modelo propio en la comparación.
- Riesgo de sobreajuste a las plantillas sintéticas italianas (administrativas, clínicas, fiscales) y a los heurísticos de etiquetado de OASST2.
- La calibración depende de temperaturas ajustadas en un split de calibración de 242 registros; con distribuciones de entrada distintas puede degradarse el ECE.
- Falta de trazabilidad del entrenamiento: sin `trainer_state.json` ni curvas de pérdida, no se puede verificar el número de pasos ni el régimen de entrenamiento.
- El run previo demuestra que una configuración incorrecta de `head_max_len` descarta filas silenciosamente y rompe la cabeza `score`; conviene validar el esquema antes de reentrenar.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre el cumplimiento normativo real (GDPR u otras).
- El cribado de PII y la clasificación de riesgo GDPR no sustituyen una revisión legal o humana; deben tratarse como señales auxiliares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/19Peppe95/Qwen3.5-0.8B-Decide-ITA
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Dataset OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Unsloth (librería y API `FastDecisionModel`): https://github.com/unslothai/unsloth
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
