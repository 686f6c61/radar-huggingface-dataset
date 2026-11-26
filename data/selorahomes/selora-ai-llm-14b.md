# selorahomes/Selora-AI-LLM-14B

## Resumen

Selora AI LLM 14B es un modelo de lenguaje ajustado por instrucciones desarrollado por Selora Homes para su integración con Home Assistant. Se construye sobre Qwen3-14B mediante cinco adaptadores LoRA especializados (command, automation, answer, clarification y utilities) que comparten una única base y se intercambian en caliente por petición a través de la integración Selora AI. El modelo resuelve el problema del control y la automatización del hogar en lenguaje natural: traducir órdenes a llamadas de servicio de Home Assistant, redactar automatizaciones y blueprints, responder sobre el estado en vivo de la vivienda, pedir aclaraciones ante peticiones ambiguas y ofrecer ayuda documental con citas.

La relevancia del modelo radica en su enfoque de despliegue: los cinco especialistas comparten una sola base, por lo que el conjunto completo ocupa unos 10,5 GB de pesos en lugar de cinco modelos de 14B independientes, y está pensado para ejecutarse en unos 16 GB de memoria junto con Home Assistant. La base se distribuye en GGUF Q5_K_S y los adaptadores en F16, con una ventana de contexto de 4096 tokens, que es el presupuesto con el que se construyeron el corpus y el manifiesto de entrenamiento.

Es importante señalar que esta ficha corresponde al bundle de cinco adaptadores, retirado tras la versión v0.8.1 y sin actualizaciones posteriores. El autor recomienda migrar al modelo fusionado único `selorahomes/Selora-AI-LLM-14B-ollama` para integraciones nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) con adaptadores LoRA por especialista |
| Parametros totales | 14.768.307.200 (14,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Base GGUF Q5_K_S; adaptadores LoRA en F16 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (base) y GGUF LoRA F16 (adaptadores); Modelfile para Ollama |
| Modelo base | Qwen/Qwen3-14B (relación: adapter) |
| Tamano del repositorio | 43,4 GB |
| Especialistas | command, automation, answer, clarification, utilities |
| Memoria recomendada | ~16 GB (modelo + KV cache + Home Assistant) |
| Runtime | llama.cpp con soporte LoRA (`llama-server`) u Ollama 0.30+ |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer denso de 14,77 mil millones de parámetros, y añade cinco adaptadores LoRA de bajo rango entrenados sobre esa base compartida. Cada adaptador se entrena contra un system prompt propio y produce lo que el autor denomina "slim envelopes", envoltorios JSON compactos con una forma de salida común entre la línea de 14B y la de 1,7B. La integración Selora AI selecciona el adaptador adecuado por petición y lo aplica en caliente mediante `llama-server` con `--lora-init-without-apply`, de modo que una sola instancia del modelo sirve a los cinco especialistas sin recargar pesos.

Ambas líneas del proyecto se entrenaron sobre el mismo corpus y los mismos system prompts. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. Sí se documenta la receta de entrenamiento en `manifest.json`, junto con la versión, los tamaños por fichero y los hashes sha256. La cuantización Q5_K_S se eligió deliberadamente para encajar en despliegues de 16 GB con los adaptadores, la KV cache y Home Assistant en ejecución; Q4_K_M es más pequeño pero perjudicó de forma medible la precisión en la búsqueda documental.

## Capacidades

- Control de dispositivos: el especialista `command` traduce peticiones en lenguaje natural a llamadas de servicio de Home Assistant (por ejemplo, "turn off the kitchen lights").
- Autoría de automatizaciones: el especialista `automation` genera automatizaciones y blueprints, incluido YAML de blueprint.
- Consulta del estado del hogar: el especialista `answer` responde preguntas sobre el estado en vivo de la vivienda.
- Desambiguación: el especialista `clarification` formula preguntas de seguimiento cuando la petición es ambigua.
- Ayuda documental: el especialista `utilities` realiza búsquedas en documentación con citas, orientadas a mantenimiento, resolución de problemas y configuración.
- Salida estructurada: emisión de envoltorios JSON compactos ("slim envelopes") consumibles por la integración.
- Soporte de tool use / function calling: etiquetado explícitamente en el modelo y ejercido mediante las llamadas de servicio de Home Assistant.
- Integración con Ollama: se incluye un `Modelfile` por especialista (base + LoRA + system prompt).
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.

## Casos de uso

- Control por voz o texto del hogar: la integración envía la transcripción al especialista `command`, que devuelve la llamada de servicio correspondiente para que Home Assistant la ejecute; el modelo está entrenado contra los system prompts exactos de producción, lo que reduce la necesidad de postprocesado.
- Creación asistida de automatizaciones: un usuario describe una rutina y el especialista `automation` genera el YAML de blueprint con las entradas declaradas y cableadas, listo para que Home Assistant lo acepte.
- Panel conversacional de estado: el especialista `answer` responde a preguntas como el estado de una luz o un sensor consultando el estado en vivo inyectado en el contexto, con una ventana de 4096 tokens suficiente para el resumen de entidades que maneja la integración.
- Resolución de ambigüedad en asistentes de voz: ante peticiones incompletas ("apaga la luz"), el especialista `clarification` genera una pregunta de seguimiento en lugar de ejecutar una acción incorrecta, lo que reduce falsos positivos en el control real de dispositivos.
- Soporte técnico y mantenimiento domótico: el especialista `utilities` responde con documentación citada sobre configuración, diagnóstico y resolución de problemas, adecuado para guiar a usuarios no técnicos dentro de la propia interfaz de Home Assistant.
- Despliegue en hubs de 32 GB de RAM: el bundle está pensado para los Selora Hubs con 32 GB y para instalaciones de Home Assistant con unos 16 GB disponibles, ejecutando una única instancia de `llama-server` con los cinco adaptadores cargados.
- Integración en pipelines de validación: dado que el harness de evaluación es abierto, el modelo puede usarse como referencia para medir regresiones en la capa de intención de asistentes domóticos antes de desplegar cambios.

## Benchmarks y rendimiento

Resultados medidos sobre la suite abierta `allenporter/home-assistant-datasets` (el harness del leaderboard de Home Assistant), a temperatura 0, sobre la suite completa, con llama.cpp en CUDA y la cuantización de distribución. Se reportan dos modos: "model only" (sin los overrides deterministas de la integración) y "net + model" (con los overrides en el bucle; aprobación y allowlist de comandos seguros desactivados en la ejecución).

| Dataset | Casos | Model only | Net + model |
|---|---|---|---|
| assist | 460 | 85,9% [82,4; 88,8] | 92,2% [89,4; 94,3] |
| assist-mini | 196 | 95,9% [92,2; 97,9] | 100,0% [98,1; 100,0] |
| questions | 370 | 91,9% [88,7; 94,3] | 94,6% [91,8; 96,5] |
| automations | 20 | 100,0% [83,9; 100,0] | 100,0% [83,9; 100,0] |

Intervalos de confianza de Wilson al 95%. La tarea `automations` son cuatro tareas de blueprint con cinco muestras cada una, puntuadas de forma separada: una respuesta pasa si Home Assistant la acepta como blueprint con todas las entradas solicitadas declaradas y cableadas; la automatización no se ejecuta. El autor advierte que `questions` puntúa alto en casos de calendario cuyos fixtures aportan datos de eventos que un Home Assistant real no proporciona. El build fusionado único puntúa dos puntos menos en assist con los overrides activados.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~16 GB en total para el modelo, la KV cache y Home Assistant en ejecución; los pesos del bundle suman unos 10,5 GB (base Q5_K_S de 10,3 GB más 263 MB de adaptadores F16).
- GPU recomendadas: no disponibles de forma explícita en la model card; el autor reporta mediciones con llama.cpp sobre CUDA, y el despliegue objetivo son los Selora Hubs de 32 GB de RAM.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; el requisito de ~16 GB de memoria total sugiere que una GPU de 16 GB o más sería el mínimo práctico, pero el autor no lo especifica.
- Opciones de despliegue: `llama-server` de llama.cpp con soporte LoRA (`--lora-init-without-apply --lora ...`) u Ollama 0.30+ con un `Modelfile` por especialista. El modelo fusionado equivalente se publica por separado para runtimes que no pueden intercambiar adaptadores.
- Contexto de ejecución: `--ctx-size 4096`, el presupuesto con el que se construyeron el corpus y `manifest.json` (`runtime.ctx_size`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selora AI LLM 14B (este) | 14,77 B | 4096 | 5 LoRA sobre Qwen3-14B para Home Assistant | Apache-2.0 | GGUF + LoRA F16 en HF; bundle retirado en v0.8.1 |
| Selora AI LLM 14B-ollama | 14,77 B | no disponible | Modelo fusionado único para runtimes sin intercambio de adaptadores | Apache-2.0 | HF (recomendado por el autor) |
| Selora AI LLM 1.7B | no disponible | no disponible | Misma línea de especialistas, menor huella | Apache-2.0 | HF |
| Qwen/Qwen3-14B | 14,77 B | no disponible en esta ficha | Modelo base generalista | Apache-2.0 | HF |

La comparación con alternativas generalistas de 14B no está cubierta con datos de benchmarks en la información disponible; las únicas métricas publicadas son las de la suite de Home Assistant, que no son directamente comparables con evaluaciones generales.

## Limitaciones y advertencias

- Modelo retirado: el bundle de cinco adaptadores quedó descontinuado tras la v0.8.1 y no recibe actualizaciones; el autor recomienda el modelo fusionado `selorahomes/Selora-AI-LLM-14B-ollama`.
- Idioma: solo inglés según el campo `language`; no se declara soporte de castellano ni de otros idiomas.
- Contexto limitado: 4096 tokens, insuficiente para conversaciones largas o volcados extensos de entidades; está dimensionado para el formato de prompt de la integración.
- Especialización estrecha: el ajuste está orientado a Home Assistant y a los cinco envelopes JSON; su uso como modelo generalista no está validado y probablemente degrade el rendimiento fuera de ese dominio.
- Dependencia del runtime: requiere llama.cpp con soporte LoRA u Ollama 0.30+; runtimes que no intercambian adaptadores necesitan el build fusionado, que puntúa dos puntos menos en assist con overrides.
- Riesgo de alucinación: presente como en cualquier LLM; los resultados de `questions` se ven inflados por fixtures de calendario que aportan datos no disponibles en un Home Assistant real, lo que puede sobreestimar el rendimiento en producción.
- Evaluación parcial: la tarea `automations` solo verifica que Home Assistant acepte el blueprint, no que la automatización se ejecute correctamente; además se evaluó con 20 casos, lo que arroja intervalos de confianza amplios.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el texto `LICENSE` y la atribución a Qwen3 recogida en `NOTICE`.
- Memoria: el requisito de ~16 GB incluye Home Assistant en ejecución; desplegarlo en soluciones más justas de memoria exige recurrir a cuantizaciones menores, que el autor señala que perjudican la precisión en búsqueda documental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selorahomes/Selora-AI-LLM-14B
- Modelo fusionado recomendado: https://huggingface.co/selorahomes/Selora-AI-LLM-14B-ollama
- Línea de 1,7B: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Integración Home Assistant de Selora AI: https://github.com/SeloraHomes/ha-selora-ai
- Suite de evaluación: https://github.com/allenporter/home-assistant-datasets
- Sitio del autor: https://selorahomes.com
- Home Assistant: https://www.home-assistant.io/
