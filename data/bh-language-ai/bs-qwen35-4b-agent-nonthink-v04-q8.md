# BH-Language-AI/bs-qwen35-4b-agent-nonthink-v04-q8

## Resumen

BH-AgentMujo-1-4B-8Q es un modelo de lenguaje de 4B parámetros (3.653.938.176 parámetros reales según safetensors) especializado en function calling y flujos de agentes para el idioma bosnio. Lo desarrolla BH-Language-AI (colectivo vinculado a Kolektiv d.o.o.) y se distribuye como cuantización GGUF Q8_0 del modelo base `alphaedge-ai/Qwen3.5-4B-bos-32768`, sobre el que se aplicaron SFT y DPO en dos etapas de merge. El modelo está diseñado para devolver llamadas a herramientas legibles por máquina y ejecutarse exclusivamente a través del AgentMujo Policy Engine, con un esquema de decisión `allow / confirmation_required / deny` antes de tocar el sistema operativo.

La relevancia del modelo está en su nicho: es un agente conversacional en bosnio, con contexto de 32.768 tokens heredado del base, empaquetado en GGUF Q8_0 para desplegarse en Ollama o llama.cpp sin stack Python. La model card reporta un gate de evaluación interno (13W-25T-0L) y una tabla comparativa frente a la variante 2B v0.5 y la 4B v0.3, con mejoras en selección de herramienta (1.0) y razonamiento multi-paso (1.0).

Arquitectura transformer densa de 32 capas, hidden size 2560 y vocabulario de 32.768 tokens. Licencia Apache-2.0, lo que permite uso comercial, aunque el modelo está entrenado y evaluado casi exclusivamente en bosnio. Esta ficha describe la versión Q8 del repositorio, no los pesos bf16 completos (que viven en el repo hermano `bh-agentmujo-1-4b`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-4B, 32 capas, hidden 2560) |
| Parámetros totales | 3.653.938.176 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado del base `Qwen3.5-4B-bos-32768`) |
| Tipos de cuantización | GGUF Q8_0 (~3,9 GB por fichero, 426 tensores) |
| Idiomas soportados | Bosnio (bs) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo parte de `alphaedge-ai/Qwen3.5-4B-bos-32768` en el commit `34a62191`: un transformer denso de 32 capas, dimensión oculta 2560 y vocabulario de 32.768 tokens. Sobre esa base se aplicó un SFT en seis iteraciones (joint-01 a joint-06, mix v0.31, eval 0.7614) seguido de un DPO-01 con train loss 0.67 en 9 pasos ejecutado en una T4. El pipeline se completó con un merge en dos etapas y la cuantización a Q8_0 mediante `convert_hf_to_gguf.py --no-mtp` de llama.cpp.

La innovación principal no está en la arquitectura sino en el pipeline de alineación orientado a agentes: el entrenamiento prioriza la selección de herramienta, la precisión de argumentos, el comportamiento de confirmación, la preferencia de alto nivel y el razonamiento multi-paso. La model card reconoce explícitamente un incidente de contaminación (S41 introdujo prompts de benchmark literales en los datos de entrenamiento), por lo que las métricas se reportan sobre un «gate limpio» sin los ítems contaminados 010/035. El framework de entrenamiento es público en el repositorio `agentmujo-training`.

## Capacidades

- Generación de texto conversacional en bosnio.
- Function calling / tool calling con salida estructurada legible por máquina.
- Selección de herramienta (tool selection) y generación de argumentos.
- Razonamiento multi-paso para tareas de agente.
- Comportamiento de confirmación explícita antes de acciones sensibles.
- Modo de rechazo y salida JSON validada (métricas de safety, refusal, json y notool reportadas a 1.0 en el gate).
- Integración con un Policy Engine externo que decide `allow`, `confirmation_required` o `deny` antes de ejecutar en Linux.
- Variante «non-think»: este build no incluye el modo de razonamiento extendido (la producción con think se mantiene en v0.4-think).

## Casos de uso

- Automatización de operaciones en Linux: el modelo propone comandos y llamadas a herramientas que el AgentMujo Policy Engine valida antes de ejecutarse; encaja en flujos de administración donde se exige confirmación humana para acciones destructivas.
- Asistente de terminal en bosnio: consultas del tipo «¿funciona el servicio nginx?» se traducen en una llamada a herramienta estructurada, ejecutable vía Ollama sin dependencias Python.
- Enrutado de intenciones en pipelines de agentes: con tool_selection a 1.0 en el gate limpio, sirve como clasificador/selector de herramienta en arquitecturas multiagente.
- Soporte técnico de primer nivel en bosnio: conversaciones multi-turno con hasta 32.768 tokens de contexto para incorporar manuales o historial de incidencias.
- Despliegue en hardware modesto: al ser Q8_0 de ~3,9 GB, cabe en estaciones de trabajo sin GPU dedicada o con GPU de consumo, lo que permite prototipar agentes locales.
- Generación de JSON estructurado para integraciones: la métrica json a 1.0 en el gate lo hace apto para rellenar payloads de API a partir de lenguaje natural.
- Evaluación de políticas de seguridad: el comportamiento de confirmación y refusal permite probar reglas de un Policy Engine antes de producción.

## Benchmarks y rendimiento

Datos del gate limpio reportado en la model card (sin los ítems contaminados 010/035):

| Métrica | 2B v0.5 | 4B v0.3 | 4B v0.4-DPO |
|---|---|---|---|
| tool_selection | 0.800 | 0.967 | 1.0 |
| argument_accuracy | 0.808 | 0.962 | 0.962 |
| confirmation_behavior | 0.8 | 1.0 | 1.0 |
| high_level_preference | 1.0 | 1.0 | 1.0 |
| multi_step | 0.833 | 0.857 | 1.0 |
| safety / refusal / json / notool | — | 1.0 | 1.0 |

El gate se resume como 13 aciertos, 25 tablas y 0 pérdidas (13W-25T-0L), sin regresiones. Frente a 4B v0.3 el resultado es 0W-45T-0L. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~4 GB para el fichero Q8_0 de ~3,9 GB más overhead de contexto; con 32.768 tokens de contexto completo el consumo de KV cache crece de forma apreciable y conviene reservar 8-10 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060/4060 en adelante); para throughput alto, A100 o H100 aunque el modelo es pequeño y no las aprovecha bien.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares; también en CPU con llama.cpp.
- Opciones de despliegue: Ollama (`ollama create` con Modelfile), llama.cpp (`llama serve -hf ...`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-AgentMujo-1-4B-8Q | 3,65B | 32.768 | Agente/function calling en bosnio | Apache-2.0 | GGUF Q8 en HF |
| bh-agentmujo-1-4b | 4B (bf16) | 32.768 | Misma familia, pesos completos | Apache-2.0 | Safetensors en HF |
| bh-agentmujo-1-2b | ~2B | no disponible | Agente ligero en bosnio | Apache-2.0 | HF |
| bh-agentmujo-1-9b | ~9B | no disponible | Agente de producción (gold06) | Apache-2.0 | HF |

La comparación interna de la model card sitúa al 4B v0.4-DPO por delante del 2B v0.5 en tool_selection (1.0 frente a 0.800) y multi_step (1.0 frente a 0.833). No se dispone de comparación con modelos de agentes de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El modelo propone herramientas pero no las ejecuta: la ejecución debe pasar obligatoriamente por el AgentMujo Policy Engine.
- La cuantización Q8 introduce una ligera pérdida en precisión de argumentos frente a los pesos completos (0.962 medido en el gate del 4B DPO).
- Entrenado y evaluado esencialmente en bosnio; el rendimiento en otros idiomas no está documentado.
- La model card retira una afirmación previa sobre mejoras del DPO por contaminación de datos (S41): parte de los datos de benchmark se filtraron al entrenamiento, por lo que las métricas deben interpretarse solo sobre el gate limpio.
- Este build es «non-think»; no incorpora razonamiento extendido, que se mantiene en la variante v0.4-think.
- Riesgo de alucinación no cuantificado en la información disponible; el comportamiento de refusal se reporta a 1.0 en el gate, pero no hay evaluación externa.
- Licencia Apache-2.0 permite uso comercial, aunque el autor no ofrece garantías ni soporte más allá de lo indicado en la model card.
- El repositorio ocupa 23,3 GB por acumulación de builds históricos (v0.1 a v0.5); conviene descargar solo el fichero `model-q8-4b-dpo01.gguf` para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bs-qwen35-4b-agent-nonthink-v04-q8
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-4B-bos-32768
- Pesos bf16 completos: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-4b
- Variante 2B: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-2b
- Variante 9B: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b
- Framework de entrenamiento: https://github.com/BH-Language-AI/agentmujo-training
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
