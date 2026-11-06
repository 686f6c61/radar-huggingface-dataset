# OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA

## Resumen

Muse Glimmer 30B 2026 Knowledge es un adaptador LoRA de tipo *knowledge update* publicado por OfflineBase sobre el modelo base meta-models/Muse-Glimmer-30B, un transformer denso de 30.000 millones de parámetros desarrollado por Meta. El adaptador amplía el corte de conocimiento del modelo base, fijado el 4 de enero de 2026, con noticias ocurridas entre esa fecha y el 29 de octubre de 2026, y ajusta el comportamiento del modelo para que admita con más frecuencia que desconoce una respuesta cuando no dispone de información fiable. No es un lanzamiento oficial de Meta ni cuenta con su revisión o respaldo.

El adaptador pesa aproximadamente 1,7 GB en formato safetensors y se distribuye mediante la librería PEFT, por lo que requiere cargarse sobre los pesos BF16 del modelo base. El autor publica además los pesos fusionados en BF16 y versiones cuantizadas GGUF para llama.cpp, incluida una Q4_K_M de 16,9 GB y una IQ2_XXS de 7,96 GB. Su relevancia actual reside en que aborda uno de los problemas prácticos más habituales en despliegues de modelos abiertos: la obsolescencia del conocimiento factual y la tendencia a alucinar en lugar de declarar ignorancia.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face. No se dispone de información sobre la arquitectura interna del modelo base, el volumen de tokens de entrenamiento del adaptador ni detalles del dataset más allá de su identificador. Los resultados reportados proceden de evaluaciones internas del autor, con un único evaluador humano y sin protocolo ciego en la mayoría de los conjuntos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Muse Glimmer 30B); adaptador LoRA sobre atención y proyecciones del base (detalle no disponible) |
| Parámetros totales | 30.000 millones en el modelo base; adaptador LoRA de ~1,7 GB (número exacto de parámetros del adaptador no disponible) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (pesos fusionados), GGUF Q4_K_M (16,9 GB), GGUF IQ2_XXS (7,96 GB); el adaptador se aplica sobre el base en BF16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 combinada con Muse Model License (`apache-2.0-and-muse-model-license`); no apto para menores de 18 años |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); GGUF en el repositorio hermano |
| Librería | PEFT |
| Corte de conocimiento | 29 de octubre de 2026 (base: 4 de enero de 2026) |
| Dataset de entrenamiento | OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data (composición y tamaño no disponibles) |
| Descargas / likes | 29 / 0 |
| Fecha de publicación | 1 de noviembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se construye sobre Muse Glimmer 30B, un transformer denso de 30.000 millones de parámetros del que no se documentan en la información disponible ni la profundidad, ni el número de cabezas de atención, ni la longitud de contexto nativa. El adaptador en sí es un LoRA estándar de PEFT, entrenado sobre los pesos BF16 del base y distribuido como delta de bajo rango de aproximadamente 1,7 GB. El autor etiqueta el proceso como *stage-b-r30b* y lo enmarca en la herramienta Muse Spark Open.

El entrenamiento combina dos objetivos. El primero es la actualización factual: el dataset incluye pasajes sobre eventos de 2026, con un solapamiento reconocido por el autor con páginas de Wikipedia, lo que explica que parte de las respuestas correctas en noticias puedan estar memorizadas del corpus y no generalizadas. El segundo es un ajuste de calibración orientado a que el modelo declare desconocimiento o corrija premisas falsas. No se especifican en la información proporcionada el número de tokens vistos, la mezcla exacta del dataset, ni si se emplearon técnicas de RLHF, DPO o preferencias. Tampoco se documentan innovaciones de decodificación; todas las evaluaciones del autor usan decodificación greedy con temperatura 0.

## Capacidades

- Generación de texto conversacional en inglés, con soporte multi-turno (el autor reporta 60/60 en comprobaciones de chat multi-turno).
- Actualización de conocimiento factual sobre eventos de 2026, con una tasa de acierto del 69,1 % en 246 preguntas sobre titulares del año, frente al 26,0 % del modelo base.
- Mayor disposición a declarar ignorancia o corregir premisas falsas: 44,7 % en 190 preguntas retenidas, frente al 26,3 % del base.
- Razonamiento multi-paso: 147 de 150 problemas resueltos con el modo de razonamiento activado (el base resuelve 150).
- Generación de código, salida JSON, seguimiento de instrucciones y chat multi-turno: 60/60 en las comprobaciones del autor.
- Conservación de conocimiento previo a 2026: 40/40 en comprobaciones factuales antiguas.
- Modo de razonamiento (*thinking*) activable, aunque el propio autor recomienda desactivarlo para consultas factuales porque incrementa la tasa de invención.
- No se documenta soporte de *tool calling*, *function calling*, capacidades de agente, visión ni audio en la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistente de actualidad con corte a octubre de 2026: el adaptador permite responder preguntas sobre eventos del año sin necesidad de recuperación externa, con una tasa de acierto cercana al 70 % en titulares según el autor. Adecuado para prototipos y demos, no como única fuente de verdad.
- Chatbot interno de consulta documental: combinado con RAG sobre fuentes corporativas, el ajuste de calibración reduce la probabilidad de que el modelo invente cifras cuando el contexto recuperado no cubre la pregunta, aunque el 55,3 % de invención reportado exige verificación posterior.
- Generación y validación de JSON en pipelines: el modelo mantiene las 60 comprobaciones de habilidades del base, incluida la salida estructurada, por lo que puede usarse en extracción de entidades o normalización de registros con validación de esquema.
- Asistencia a la programación: conserva las capacidades de código del base y puede integrarse en editores o pipelines de CI/CD para generación de tests y explicación de errores, siempre con revisión humana.
- Investigación sobre calibración y honestidad en LLM: el par base/adaptador con métricas separadas de acierto, invención y rechazo constituye un caso de estudio útil para medir el efecto de un fine-tune de conocimiento sobre la calibración.
- Despliegue en hardware de consumo: la versión IQ2_XXS de 7,96 GB cabe en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, lo que permite ejecutar localmente un modelo de 30B con conocimiento actualizado a 2026.
- Evaluación comparativa de modelos abiertos: sirve como referencia para medir cuánto conocimiento de 2026 retienen alternativas como Qwen3.8 27B, Gemma 4 31B o Granite 4.2 30B en pruebas de actualidad.

## Benchmarks y rendimiento

Resultados reportados por el autor. Salvo indicación contraria, las puntuaciones de «este modelo» corresponden al adaptador sobre el base en BF16 y las del base a su fichero Q4_K_M. Decodificación greedy (temperatura 0).

| Prueba | Este modelo | Muse Glimmer 30B (base) |
|---|---|---|
| Titulares de 2026 (246 preguntas) | 69,1 % | 26,0 % |
| Preguntas reformuladas sobre pasajes de 2026 vistos en entrenamiento (2.500) | 29,0 % | 18,4 % |
| Declara no poder saber o corrige premisa falsa (190, retenidas y evaluadas a ciegas) | 44,7 % | 26,3 % |
| De las anteriores, eventos posteriores al 29 de octubre de 2026 (70) | 67,1 % | 24,3 % |
| Comprobaciones factuales previas a 2026 (40) | 40/40 | 40/40 |
| Problemas multi-paso con razonamiento activado (150) | 147/150 | 150/150 |
| Habilidades: código, JSON, instrucciones, chat multi-turno (60) | 60/60 | 60/60 |
| Invención de respuesta en las 190 preguntas retenidas | 55,3 % | 70,0 % |
| Aceptación de premisas falsas | ~80 % | ~80 % |
| Rechazo de preguntas ordinarias | 18 % | 6 % |

Comparativa en titulares de 2026 con otros modelos abiertos de tamaño similar, todos en Q4_K_M y evaluados por un único revisor de IA no ciego a la identidad de los modelos:

| Modelo | Acierto en titulares de 2026 (sobre 100) |
|---|---|
| Muse Glimmer 30B 2026 Knowledge (Q4_K_M) | ~70 |
| Muse Glimmer 30B (base Q4_K_M) | 27 |
| Qwen3.8 27B | ≤7 |
| Gemma 4 31B | ≤7 |
| Granite 4.2 30B | ≤7 |

El autor señala que Gemma 4 tiene datos hasta enero de 2025 y que Qwen3.8 y Granite 4.2 no declaran fecha de corte pero rechazan preguntas de 2026, por lo que «no lo sé» es la respuesta honesta en su caso. En tareas de razonamiento de la misma ejecución, Qwen3.8 y Gemma 4 igualan o superan a este modelo.

Rendimiento de las cuantizaciones GGUF del adaptador fusionado:

| Cuantización | Tamaño | Puntuación en las 2.500 preguntas | Hechos previos a 2026 (40) |
|---|---|---|---|
| BF16 | No disponible | 29,0 % | 40/40 |
| Q4_K_M | 16,9 GB | 28,8 % | 40/40 |
| IQ2_XXS | 7,96 GB | 17,1 % | 40/40 |

## Requisitos de hardware

- VRAM para BF16: aproximadamente 60 GB solo para pesos (30B × 2 bytes), más overhead de activaciones y KV cache; requiere A100 80 GB, H100 80 GB o múltiples GPUs.
- VRAM para Q4_K_M (16,9 GB): cabe en RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB) y L40S (48 GB); en GPUs de 16 GB queda muy justo y conviene descargar capas a CPU.
- VRAM para IQ2_XXS (7,96 GB): cabe en RTX 4060 Ti 16 GB, RTX 4070 12 GB y RTX 3060 12 GB; también en equipos con 8 GB de VRAM usando offload parcial.
- El adaptador LoRA (1,7 GB) no es autónomo: requiere cargar el base en BF16, por lo que no reduce los requisitos de memoria del modelo completo salvo que se fusione y cuantice.
- Opciones de despliegue: llama.cpp y Ollama para los ficheros GGUF; vLLM y TGI para BF16 con soporte de adaptadores PEFT; Transformers con PEFT para cargar el adaptador directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Conocimiento 2026 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Glimmer 30B 2026 Knowledge (este) | 30B (denso) | No disponible | ~70/100 en titulares | Apache 2.0 + Muse Model License | Hugging Face: adaptador, BF16 fusionado y GGUF |
| Muse Glimmer 30B (base) | 30B (denso) | No disponible | 27/100 | Muse Model License | Hugging Face (meta-models) |
| Qwen3.8 27B | 27B | No disponible | ≤7/100 | No disponible | No disponible |
| Gemma 4 31B | 31B | No disponible | ≤7/100 (datos hasta enero de 2025) | No disponible | No disponible |
| Granite 4.2 30B | 30B | No disponible | ≤7/100 | No disponible | No disponible |

En razonamiento, Qwen3.8 27B y Gemma 4 31B igualan o superan a este adaptador según el autor. La ventaja diferencial del modelo es la actualidad del conocimiento y la mayor tasa de abstención, no el rendimiento en tareas cognitivas. No se dispone de datos de contexto ni de licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Alucinación elevada: el modelo inventa una respuesta en el 55,3 % de las 190 preguntas retenidas, frente al 70,0 % del base. Sigue siendo un riesgo alto para producción sin verificación.
- Premisas falsas: acepta premisas incorrectas en torno al 80 % de los casos, sin mejora respecto al base.
- Sesgo de rechazo: rechaza el 18 % de preguntas ordinarias, frente al 6 % del base, lo que puede degradar la experiencia en chat general.
- El modo de razonamiento empeora la factualidad: el autor recomienda desactivarlo para consultas de conocimiento.
- Solapamiento con Wikipedia: muchas respuestas correctas sobre noticias aparecen en las páginas de Wikipedia usadas en el entrenamiento, por lo que parte del rendimiento refleja memorización y no generalización.
- Evaluación débil: un único autor seleccionó y calificó las 246 preguntas de titulares, y la comparativa con otros modelos fue leída por un revisor de IA no ciego. Solo las 190 preguntas de honestidad se evaluaron a ciegas.
- Idiomas: únicamente inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: longitud no documentada, lo que impide planificar despliegues con ventanas largas.
- Licencia: Apache 2.0 combinada con Muse Model License; es necesario revisar las condiciones adicionales del fichero MUSE_MODEL_LICENSE.md antes de un uso comercial. El modelo no está destinado a menores de 18 años.
- Procedencia: fine-tune de la comunidad no revisado ni respaldado por Meta; no debe presentarse como un lanzamiento oficial.
- Datos de entrenamiento: composición, tamaño y posibles sesgos del dataset no están documentados.

## Enlaces

- Hugging Face (adaptador LoRA): https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- Pesos fusionados BF16: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Ficheros GGUF para llama.cpp: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data
- Licencia Muse Model: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA/blob/main/MUSE_MODEL_LICENSE.md
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Fuente del ejemplo sobre Nvidia (Q4 FY2026): https://thetechportal.com/2026/02/26/nvidia-q4-revenue-surges-73-to-68bn-beating-estimates/
- Fuente del ejemplo sobre OpenAI: https://en.wikipedia.org/wiki/OpenAI
- Fuente del ejemplo sobre Artemis II: https://en.wikipedia.org/wiki/2026
