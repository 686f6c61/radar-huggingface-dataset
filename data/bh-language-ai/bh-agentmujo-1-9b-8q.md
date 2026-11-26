# BH-Language-AI/bh-agentmujo-1-9b-8q

## Resumen

BH-AgentMujo-1-9B-8Q es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 9B) especializado en function calling y flujos de agentes, desarrollado por BH-Language-AI (vinculado a Kolektiv d.o.o.). Se distribuye como un único fichero GGUF cuantizado en Q8_0 de 9,5 GB, derivado del modelo base Qwen/Qwen3.5-9B mediante un proceso de fine-tuning supervisado (SFT) orientado a la selección e invocación de herramientas en lengua bosnia (código ISO `bs`).

El modelo no está pensado como un asistente conversacional general, sino como el componente de decisión dentro de una arquitectura concreta denominada AgentMujo Policy Engine, con el flujo `MODEL → TOOL → POLICY ENGINE → LINUX`. El modelo propone llamadas a herramientas en formato legible por máquina; la ejecución real queda delegada a una capa de política que decide entre `allow`, `confirmation_required` o `deny`. Esta separación es la innovación central del proyecto: el modelo nunca ejecuta acciones por sí mismo.

Su relevancia radica en dos factores. Primero, cubre un hueco poco atendido: agentes de tool calling para bosnio, un idioma con escasa representación en el ecosistema de modelos abiertos. Segundo, su empaquetado GGUF Q8 permite desplegarlo con Ollama o llama.cpp sin necesidad de stack Python, lo que simplifica la integración en entornos de producción ligeros. La licencia Apache-2.0 facilita su uso comercial. El release corresponde a la versión v1.0 (2026-11-10) y el fichero incluido es la subversión gold06.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-9B), 32 capas, hidden size 4096 |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); repo de 9,5 GB con un unico fichero `model-q8.gguf` |
| Idiomas soportados | Bosnio (`bs`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (generado con llama.cpp `convert_hf_to_gguf.py --no-mtp`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revisión `c20223623`), un transformer denso de 32 capas con dimensión oculta de 4096 y vocabulario de 248.320 tokens, bajo licencia Apache-2.0. Sobre esa base se aplicó un proceso de fine-tuning supervisado (SFT) con datos densos en dialecto bosnio, organizado en una cadena de iteraciones: r16 jt01–jt05, después r64 r6401–r6406 y finalmente gold01–gold06, siendo gold06 la versión empaquetada en este repositorio. El framework de entrenamiento es agentmujo-training, publicado en GitHub por el mismo autor.

La cuantización se realizó con llama.cpp mediante `convert_hf_to_gguf.py --no-mtp` y el tipo Q8_0, produciendo un único fichero de 9,5 GB. El perfil "think" no forma parte de este release: el modelo es explícitamente non-thinking. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica destacable no es arquitectónica sino de diseño de sistema: el modelo emite llamadas a herramientas que se validan en una capa de política externa antes de cualquier ejecución, lo que traslada las garantías de seguridad fuera del modelo.

## Capacidades

- Generación de texto en bosnio, con especial énfasis en registros dialectales.
- Function calling / tool calling: devuelve llamadas a herramientas en formato legible por máquina, con una precisión de selección de herramienta de 0,833 en el benchmark propio.
- Soporte de flujos de agentes de un solo paso con validación externa (arquitectura MODEL → TOOL → POLICY ENGINE → LINUX).
- Comportamiento de confirmación: el modelo tiende a comprobar antes de actuar (check-then-ask), lo que se documenta como decisión deliberada de diseño orientada a la seguridad.
- Clasificación de preferencia de alto nivel y rechazo correcto de peticiones (refusal correctness de 0,8 en el benchmark del autor).
- Capacidad de no invocar herramienta en conversación trivial, aunque con rendimiento limitado (0,25–0,50 según el propio autor).
- No soporta modo de razonamiento extendido (thinking): el release es non-thinking.
- Capacidades multilingües limitadas al bosnio según la model card; no se documenta soporte de otros idiomas.
- No se documentan capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Automatización de operaciones en sistemas Linux: el modelo interpreta una instrucción en bosnio y emite la llamada a herramienta correspondiente (por ejemplo, gestión de ficheros o consulta de estado del sistema), que el Policy Engine valida antes de ejecutar. Es adecuado porque el modelo nunca actúa directamente y la capa de política filtra comandos peligrosos.
- Asistentes de soporte técnico en bosnio: gestión de conversaciones multi-turno donde el modelo decide cuándo consultar una herramienta de base de conocimiento o de ticketing, con confirmación previa en operaciones sensibles.
- Despliegue en entornos con recursos limitados: al ser un único GGUF Q8 de 9,5 GB, se puede servir con Ollama o llama.cpp sin stack Python, lo que encaja en servidores modestos o dispositivos con GPU de gama alta de consumo.
- Integración en pipelines de agentes con auditoría: la separación entre propuesta de herramienta y ejecución permite registrar cada decisión del modelo y cada resolución del Policy Engine, útil en entornos con requisitos de trazabilidad.
- Prototipado de agentes para mercados de Bosnia y Herzegovina: cubre la falta de modelos abiertos con competencia funcional en bosnio para productos locales de atención al cliente o back office.
- Sistemas de confirmación humana en el bucle: el comportamiento check-then-ask del modelo lo hace apropiado para flujos donde una acción destructiva requiere aprobación explícita antes de ejecutarse.
- Evaluación comparativa de tool calling en lenguas de bajos recursos: sirve como referencia para investigar la transferencia de capacidades de function calling desde modelos base multilingües a idiomas con poca representación.

## Benchmarks y rendimiento

Resultados publicados por el autor en AgentMujo-Bench v0.5 (48 casos, prompt de producción por defecto) para la subversión gold06:

| Metrica | Gate | Loop |
|---|---|---|
| tool_selection | 0,70 | 0,833 |
| argument_accuracy | 0,846 | strict 0,75 |
| high_level_preference | 1,0 | task_success 0,979 |
| confirmation_behavior | 0,6 | no disponible |
| safety | 0,857 | no disponible |
| refusal_correctness | 0,8 | no disponible |
| no_tool_correctness | 0,50 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden exclusivamente del benchmark propio del autor y no son directamente comparables con evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q8_0, el fichero ocupa 9,5 GB; se recomienda al menos 10–12 GB de VRAM para cargar el modelo completo en GPU sin offloading.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia íntegra en GPU; también válidas RTX 3090 (24 GB) y GPUs profesionales de 16 GB con offloading parcial.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con margen ajustado, en GPUs de 12 GB mediante offloading parcial de capas a CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/BH-Language-AI/bh-agentmujo-1-9b-8q`) y llama.cpp (`llama serve -hf BH-Language-AI/bh-agentmujo-1-9b-8q`) son los métodos documentados por el autor. No se mencionan vLLM ni TGI para este formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-AgentMujo-1-9B-8Q | 8,95B | no disponible | Tool calling en bosnio, GGUF Q8 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Modelo general multilingüe | Apache-2.0 | Hugging Face |
| BH-AgentMujo-1-4B | ~4B | no disponible | Tool calling en bosnio, clase ligera | Apache-2.0 | Hugging Face |
| BH-AgentMujo-1-2B | ~2B | no disponible | Tool calling en bosnio, clase mínima | Apache-2.0 | Hugging Face |

La comparación con modelos de tool calling de otros ecosistemas (por ejemplo, variantes especializadas de Llama o Mistral) no está disponible en la información proporcionada. Las alternativas más directas son los propios modelos de la familia BH-AgentMujo, que comparten arquitectura de sistema y difieren en tamaño y formato de despliegue.

## Limitaciones y advertencias

- El modelo no ejecuta herramientas por sí mismo; requiere obligatoriamente el AgentMujo Policy Engine para cualquier acción. Usarlo como terminal directo se documenta como fallback no recomendado.
- Tendencia a invocar herramientas en conversación trivial: la precisión de no-uso (no_tool_correctness) se sitúa entre 0,25 y 0,50, por lo que el autor delega el filtrado de exceso en la capa de política.
- Comportamiento check-then-ask: el modelo pregunta antes de actuar en lugar de ejecutar directamente, lo que añade latencia y turnos en flujos automatizados.
- Cobertura lingüística limitada al bosnio; no se documenta rendimiento en otros idiomas, incluido el castellano.
- No se documenta la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinación en la selección de herramientas no cuantificado de forma independiente: las métricas provienen de un benchmark propio de 48 casos, sin validación externa.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de adopción ni de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b-8q
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio hermano (9B con subversiones gold): https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b
- Archivo de builds (9Q bundle): https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b-9q-bundle
- Modelo ligero 2B: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-2b
- Modelo 4B full: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-4b
- Modelo 4B Q8: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-4b-8q
- Framework de entrenamiento: https://github.com/BH-Language-AI/agentmujo-training
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
