# agentscope-ai/Piccolo-9B

## Resumen

Piccolo-9B es un modelo de decisión desarrollado por AgentScope (agentscope-ai) para dos tareas concretas dentro de sistemas agénticos: la revisión de herramientas (tool review) y la selección de contexto (context selection). No es un modelo generativo de propósito general, sino un clasificador que puntúa candidatos —herramientas o fragmentos de contexto— para que un orquestador externo decida cuáles incluir en el prompt de un agente. Está afinado a partir de Qwen/Qwen3.5-9B y publicado bajo licencia Apache 2.0.

El modelo tiene 9.653.104.368 parámetros (aproximadamente 9,65 mil millones), se distribuye en formato Safetensors con un total de 19,3 GB en el repositorio y se etiqueta como `text-classification` en Hugging Face, aunque también admite entradas de imagen y texto (`image-text-to-text`). Incorpora atención bidireccional, lo que lo aparta del esquema causal típico de los LLM y lo alinea con arquitecturas de encoder para puntuación de candidatos.

Su relevancia actual radica en que resuelve un cuello de botella habitual en pipelines de agentes: decidir qué herramientas y qué contexto merecen entrar en la ventana del modelo principal. Piccolo-9B ofrece una señal de decisión entrenada específicamente para ello, con resultados publicados en su propio harness de evaluación (JevBench), y se integra con QwenPaw, el stack de agentes de AgentScope.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención bidireccional, derivado de Qwen/Qwen3.5-9B |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Piccolo-9B parte del checkpoint Qwen/Qwen3.5-9B y se afina como modelo de decisión con atención bidireccional. La model card indica explícitamente que la implementación de referencia incluida en el repositorio gestiona esa atención bidireccional y la puntuación de candidatos, lo que implica que el modelo no se usa con el bucle de generación autoregresiva estándar, sino como un scorer sobre pares de entrada (por ejemplo, consulta y candidato). El repositorio incluye `piccolo_inference.py` y un fichero `requirements.txt` para ejecutar esa inferencia de referencia.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. La etiqueta `decision-model` y la naturaleza clasificatoria del pipeline (`text-classification`) confirman que el objetivo es producir puntuaciones de decisión, no texto libre.

## Capacidades

- Puntuación de candidatos para revisión de herramientas (tool review): evalúa qué herramientas debería considerar un agente para una consulta dada.
- Selección de contexto: puntúa fragmentos de contexto para decidir cuáles incluir en el prompt del agente.
- Clasificación de texto como tarea principal (`pipeline_tag: text-classification`).
- Entrada multimodal imagen-texto según la etiqueta `image-text-to-text`.
- Atención bidireccional para representaciones contextuales completas sobre la secuencia de entrada.
- Soporte de inglés y chino.
- Integración con el ecosistema AgentScope y con QwenPaw para despliegue local en flujos de agentes.
- No se documentan en la información disponible capacidades de generación de texto libre, tool calling generativo, agentes multi-paso autónomos ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Enrutamiento de herramientas en agentes: antes de construir el prompt de un agente, Piccolo-9B puntúa el catálogo de herramientas disponibles frente a la consulta del usuario y el orquestador conserva solo las mejor puntuadas, reduciendo el tamaño del prompt y los errores de selección.
- Compresión de contexto en conversaciones largas: el modelo puntúa fragmentos de historial o documentos recuperados y permite descartar los menos relevantes antes de enviarlos al LLM principal, con el consiguiente ahorro de tokens.
- Filtrado en pipelines RAG: tras la recuperación de documentos, Piccolo-9B actúa como re-ranker de contexto para seleccionar los pasajes que realmente aportan a la consulta.
- Revisión previa de llamadas a herramientas en producción: como paso de validación que decide si una herramienta propuesta es pertinente para la tarea, añadiendo una capa de control antes de ejecutar acciones.
- Integración con QwenPaw: despliegue local siguiendo la guía oficial para dotar a los agentes de AgentScope de un módulo de decisión dedicado, separando la política de selección del modelo generador.
- Evaluación comparativa de estrategias de prompting: al ser un scorer reproducible, sirve para medir qué formulaciones de consulta o de descripción de herramientas producen mejores decisiones, usando el Decision Playground de AgentScope.
- Selección de contexto multimodal: gracias a la etiqueta `image-text-to-text`, puede puntuar candidatos que incluyan contenido visual junto a texto, si bien la documentación disponible no detalla este flujo.

## Benchmarks y rendimiento

Resultados publicados en la model card para el checkpoint completo:

| Benchmark | Resultado |
|---|---|
| HarnessJevBench Hard ↑ | 68,81 % |
| DataJevBench ↑ | 69,40 % |
| JevBench Public ↑ | 89,61 % |
| Decision Index Public ↑ | 60,86 |

No se han publicado en la información disponible resultados en benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K) ni comparativas numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9,65 mil millones de parámetros, en FP16 el peso ronda los 19,3 GB, por lo que se necesita al menos una GPU de 24 GB para cargar el checkpoint sin cuantizar; en cuantizaciones de 8 bits o 4 bits el requisito bajaría, pero no se documentan formatos de cuantización soportados.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encajan A100 40/80 GB, H100 y, en el ámbito consumer, RTX 4090 (24 GB) para FP16 ajustado o GPUs con más memoria si se quiere margen.
- ¿Cabe en GPU consumer? Sí, previsiblemente en RTX 4090 y modelos con 24 GB o más en FP16; en GPUs de 16 GB requeriría cuantización, no documentada.
- Opciones de despliegue: la vía oficial es la implementación de referencia del repositorio (`piccolo_inference.py` con `requirements.txt`), que gestiona la atención bidireccional y la puntuación de candidatos. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI, dado que el esquema de atención no causal complica estos backends.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo-9B | 9,65 B | no disponible | Modelo de decisión (tool review y selección de contexto) | Apache 2.0 | Hugging Face y ModelScope |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | LLM generativo de propósito general | según el modelo base | Hugging Face |
| Piccolo-27B (misma familia) | no disponible | no disponible | Modelo de decisión, variante mayor | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento de modelos competidores en JevBench ni de alternativas directas de otros autores para la misma tarea, por lo que la comparación numérica queda como no disponible.

## Limitaciones y advertencias

- Modelo especializado: no está pensado para generación de texto libre ni como LLM de propósito general; usarlo fuera de tareas de puntuación de candidatos producirá resultados no representativos.
- Idiomas limitados a inglés y chino; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea deficiente.
- Longitud de contexto no especificada: planificar pipelines con secuencias muy largas requiere validación empírica previa.
- Los benchmarks publicados (JevBench) son propios del autor y no equivalen a evaluaciones independientes; conviene tratarlos con cautela.
- Riesgo de sesgo heredado del modelo base Qwen3.5-9B y de los datos de afinado, no analizado en la información disponible.
- La atención bidireccional exige la implementación de referencia o adaptaciones específicas; los backends de inferencia estándar (vLLM, llama.cpp) pueden no funcionar sin modificaciones.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros (`THIRD_PARTY_LICENSES.md`) y las condiciones del modelo base Qwen3.5-9B.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware modesto.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de puntuaciones erróneas en candidatos fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-9B
- Modelo en ModelScope: https://www.modelscope.cn/models/AgentScope/Piccolo-9B
- Repositorio del proyecto: https://github.com/agentscope-ai/Piccolo
- Ejemplo de inferencia: https://github.com/agentscope-ai/Piccolo/tree/main/inference
- Guía de QwenPaw: https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md
- Resultados de evaluación: https://github.com/agentscope-ai/Piccolo/tree/main/evaluation
- Decision Playground: https://decisionplayground.agentscope.io/
- Colección QwenPaw Flash en ModelScope: https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia: https://huggingface.co/agentscope-ai/Piccolo-9B/resolve/main/LICENSE
- Avisos de terceros: https://huggingface.co/agentscope-ai/Piccolo-9B/resolve/main/THIRD_PARTY_LICENSES.md
