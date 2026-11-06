# peonist-ai/halogen-spotter-0.6b

## Resumen

Halogen Spotter 0.6B es un fine-tune de Qwen3Guard-Gen-0.6B (Qwen team, licencia Apache-2.0) desarrollado por peonist-ai. Su proposito es actuar como guard secundario en agentes basados en LLM: detecta resultados de herramientas (tool results) que contienen instrucciones dirigidas al asistente, es decir, intentos de prompt injection indirecta. Conserva la funcion de moderacion de contenido del modelo base y anade esta capacidad especifica de deteccion sobre texto devuelto por herramientas.

El modelo es un transformer decoder-only de 0.6B parametros, derivado de un LoRA (rank 16, alpha 32) aplicado sobre las 28 capas y fusionado en los pesos finales. Trabaja sobre ventanas de 512 tokens en el formato de prompt del modelo base y se sirve como checkpoint F32 en formato Hugging Face, ademas de un fichero de pesos especifico para NPU (`.hnpw`). La licencia es Apache-2.0.

Su relevancia radica en el enfoque practico: en lugar de generar texto, se leen las tres filas de etiquetas (`Safety:`) y se calcula P(Unsafe) + P(Controversial) con un umbral de 0.25 para marcar un resultado como sospechoso. El autor publica resultados sobre AgentDojo (2.710 ataques exitosos, cuatro suites ofimaticas) que muestran una mejora en ataques detenidos del 76,9% al 89,2% respecto al base, manteniendo la moderacion casi intacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen3Guard-Gen-0.6B) |
| Parametros totales | 0.6B (aproximado, segun modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 512 tokens (solapamiento de 448 en resultados largos) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en F32; fichero NPU `.hnpw`) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint F32 en layout Hugging Face), `.hnpw` para NPU, `lora-03000.safetensors` (adaptador pre-merge) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3Guard-Gen-0.6B, un transformer decoder-only orientado a moderacion con salida estructurada por etiquetas (`Safety:`). Sobre el se aplico un LoRA de rank 16 y alpha 32 en las proyecciones de atencion y MLP de las 28 capas, que posteriormente se fusiono en los pesos. El entrenamiento consistio en 3.000 pasos sin gradiente a traves del texto fijo de la plantilla. La funcion de perdida combina entropia cruzada sobre las tres filas de etiquetas para ventanas de resultados de herramientas, mas un termino KL hacia la distribucion del modelo base sobre conversaciones de moderacion, con el objetivo de preservar el comportamiento original de moderacion.

Los datos de entrenamiento incluyen cadenas inyectadas de InjecAgent, Agent Security Bench y Agent-SafetyBench, resultados de herramientas benignos de OpenHands feedback, SWE-smith trajectories, Hermes function calling y Glaive function calling v2, y el split de entrenamiento de Aegis 2.0 para mantener la moderacion. Todas las fuentes son de licencia permisiva (MIT, Apache-2.0 o CC-BY-4.0). La innovacion principal no es arquitectonica sino de uso: lectura de etiquetas en lugar de generacion, ventaneo con solapamiento y un umbral calibrado sobre resultados benignos.

## Capacidades

- Deteccion de prompt injection indirecta en resultados de herramientas devueltos al agente.
- Moderacion de contenido heredada del modelo base (etiquetas Safe / Controversial / Unsafe).
- Lectura de etiquetas `Safety:` sin generacion de texto libre (recomendado por el autor).
- Procesamiento de resultados largos mediante ventanas solapadas de 512 tokens (paso 448) y puntuacion por la ventana maxima.
- Integracion con el servidor halogen en modos `watch` o `hold` sobre NPU Ryzen AI.
- Soporte de reglas de retencion de llamadas: bloqueo de llamadas con efectos secundarios en turnos marcados, fuera del alcance de la tarea o con valores extraidos del resultado marcado.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no aplica como capacidad generativa; el modelo evalua resultados de herramientas, no emite llamadas.

## Casos de uso

- Proteccion de agentes ofimaticos: interceptar resultados de herramientas en suites tipo correo, calendario o mensajeria y marcar instrucciones inyectadas antes de que el agente ejecute una accion con efectos secundarios. Los resultados publicados muestran 97,3% y 97,6% de deteccion en banking y slack.
- Despliegue en hardware de borde con NPU: el fichero `.hnpw` y la integracion con halogen permiten ejecutar el guard junto al modelo Flash en una Ryzen AI, sin GPU dedicada, con umbral recalibrado para ese runtime.
- Segunda capa de defensa en pipelines de agentes: colocar el modelo como filtro entre la salida de herramientas externas (APIs, busquedas, lectura de ficheros) y el razonamiento del agente, complementando guardrails de entrada.
- Monitorizacion en modo `watch`: registrar y alertar sobre resultados sospechosos sin bloquear, util para auditar trafico real y ajustar el umbral antes de pasar a `hold`.
- Evaluacion de robustez de agentes propios: usar el modelo para medir cuantos resultados de un conjunto de pruebas contienen instrucciones dirigidas al asistente, como metrica complementaria en tests de seguridad.
- Filtrado de contenido en herramientas de codigo: aunque no se midio para ataques, el autor reporta 0 de 339 resultados de sesiones de codigo marcados como falsos positivos, lo que permite usarlo como filtro de baja friccion en agentes de desarrollo.
- Deteccion de instrucciones en documentacion o tickets: cualquier flujo donde el agente lea texto de terceros (issues, correos, paginas) y pueda interpretarlo como orden, con la cautela de que las instrucciones legitimas tambien se marcan.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre NPU Ryzen AI, test AgentDojo (22 modelos, cuatro suites ofimaticas, ataque `important_instructions`, 2.710 ataques exitosos):

| Metrica | Modelo base | Halogen Spotter |
|---|---|---|
| Umbral calibrado en benignos | 0.45 | 0.25 |
| Ataques detenidos | 76,9% | 89,2% |
| Resultados inyectados marcados | 81,5% | 95,3% |
| Banking / Slack (detenidos) | 92,5% / 93,9% | 97,3% / 97,6% |
| Travel / Workspace (detenidos) | 34,0% / 60,7% | 63,6% / 83,8% |
| Falsos positivos benignos AgentDojo / coding / tool-use | 0,87% / 0,29% / 0,54% | 0,87% / 0,00% / 0,54% |
| Runs benignos AgentDojo con llamada retenida | 1,31% | 2,06% |

Moderacion (F1 estricto / laxo, NPU):

| Conjunto | Base | Halogen Spotter |
|---|---|---|
| OpenAI moderation | 66,2 / 77,4 | 67,3 / 78,5 |
| Aegis 2.0 prompts | 85,2 / 82,7 | 85,3 / 82,5 |
| SimpleSafetyTests | 99,0 / 95,8 | 98,5 / 96,9 |
| Aegis 2.0 responses | 82,4 / 82,0 | 83,1 / 81,9 |

Otras formas de ataque registradas en AgentDojo (1.640 ataques exitosos, solo reportadas): 87-93% detenidos frente a 57-89% del base. El autor advierte que dos de esas formas se parecen al texto de entrenamiento. El 6,2% de las decisiones individuales de moderacion difieren del base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 0.6B parametros, el checkpoint F32 ocupa aproximadamente 2,4 GB y el repositorio completo 4,1 GB.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer moderna es suficiente para inferencia en FP16/F32.
- Cabe en GPU consumer: si, por el tamano del modelo (0.6B), aunque el autor no publica requisitos minimos.
- Despliegue: servidor halogen (modo NPU Ryzen AI con `.hnpw`); el checkpoint F32 en layout Hugging Face permite otros runtimes, pero el umbral debe recalibrarse porque no es propiedad de los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Halogen Spotter 0.6B | 0.6B | ventanas de 512 tokens | Guard de tool results + moderacion | Apache-2.0 | Hugging Face, NPU |
| Qwen3Guard-Gen-0.6B (base) | 0.6B | no disponible | Moderacion de contenido | Apache-2.0 | Hugging Face |
| Guardrails basados en reglas / clasificadores ligeros | variable | variable | Filtrado de injection | variable | multiples |

Frente al base, Halogen Spotter mejora la deteccion de inyeccion (89,2% vs 76,9% de ataques detenidos) con un coste pequeno en moderacion (variacion maxima de 1,09 puntos F1) y un aumento de falsos positivos en runs benignos (1,31% a 2,06%). No se dispone de comparacion con otros guards especializados en la informacion proporcionada.

## Limitaciones y advertencias

- Medido solo en tareas ofimaticas; para agentes de codigo solo se miden falsos positivos (0 de 339), no ataques.
- Ataques solo de texto (que piden palabras en la respuesta) se marcan pero no se detienen, porque no hay llamada que retener.
- El resultado depende del modelo de agente y de la tarea: un modelo leyo 21,4% de ataques detenidos sobre 28 ataques (mediana 91,2%); travel sigue siendo la suite mas debil con 63,6%.
- Un resultado de herramienta que legitimamente indica al asistente que hacer se parece a un ataque; la mayoria de los falsos positivos son de este tipo.
- Las muestras de falsos positivos son pequenas: 339 y 184 resultados en dos de las tres fuentes.
- Solo probado contra los ataques publicados; no se evaluo a un atacante adaptativo que conozca el modelo.
- El umbral 0.25 se calibro en la ruta NPU sobre resultados benignos; en otro runtime debe recalibrarse.
- En aproximadamente 3,4% de las ventanas el token mas probable tras `Safety:` no es una etiqueta; el autor recomienda leer las tres filas de etiquetas, no generar.
- No es una frontera de seguridad: una inyeccion no marcada pasa, y el modelo es un complemento, no una garantia.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de seguridad en produccion.
- Idiomas soportados no disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/peonist-ai/halogen-spotter-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-0.6B
- Servidor halogen: https://github.com/peonist-ai/halogen-flash-server
- Documentacion del guard: `docs/agent-guard.md` (en el repositorio halogen)
- AgentDojo: https://github.com/ethz-spylab/agentdojo
- InjecAgent: https://github.com/uiuc-kang-lab/InjecAgent
- Agent Security Bench: https://github.com/agiresearch/ASB
- Agent-SafetyBench: https://github.com/thu-coai/Agent-SafetyBench
- OpenHands feedback: https://huggingface.co/datasets/OpenHands/openhands-feedback
- SWE-smith trajectories: https://huggingface.co/datasets/SWE-bench/SWE-smith-trajectories
- Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Glaive function calling v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Aegis 2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
