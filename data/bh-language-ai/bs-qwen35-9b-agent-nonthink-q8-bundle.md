# BH-Language-AI/bs-qwen35-9b-agent-nonthink-q8-bundle

## Resumen

BH-AgentMujo-1-9B-9Q-Bundle es un repositorio de archivo publicado por BH-Language-AI que contiene 15 cuantizaciones GGUF Q8_0 (~9,5 GB por fichero, ~143 GB en total) de la familia de modelos BH-AgentMujo-1-9B, un ajuste fino en bosnio del modelo base Qwen/Qwen3.5-9B. El modelo está especializado en function calling y flujos de agentes, con énfasis en el dialecto y las particularidades lingüísticas del bosnio, un idioma con escasa representación en los modelos generalistas actuales.

El modelo resuelve el problema de disponer de un agente conversacional capaz de invocar herramientas de forma fiable en bosnio, sin depender de traducciones intermedias al inglés. La arquitectura subyacente es la de Qwen3.5-9B: transformer denso de 8.953.803.264 parámetros, 32 capas, dimensión oculta 4096 y vocabulario de 248.320 tokens. El bundle incluye el histórico completo de builds (gold01–gold08, v0.1–v0.6 y dpo01), de los cuales el autor marca `model-q8-gold06.gguf` como versión de producción (release v1.0, 2026-11-10).

La relevancia de esta ficha radica en que el repositorio es un archivo, no el destino de despliegue: el propio autor redirige al repo de producción `bh-agentmujo-1-9b`. Aun así, el bundle permite reproducir y auditar la evolución del ajuste fino, y sus cifras de AgentMujo-Bench v0.5 son el único dato de evaluación publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q8_0 (unica incluida en el bundle) |
| Idiomas soportados | bosnio (bs) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (convertido con llama.cpp `convert_hf_to_gguf.py --no-mtp`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (commit `c20223623`), un transformer denso con 32 capas, dimensión oculta 4096 y vocabulario de 248.320 tokens. Sobre esa base se aplicó un ajuste fino supervisado (SFT) en cadena: primero adaptadores LoRA de rango 16 (jt01–jt05, con mix v0.35), después LoRA de rango 64 (r6401–r6406) y finalmente las iteraciones gold01–gold06. El autor describe el entrenamiento como "dialect-dense SFT", es decir, SFT con densidad alta de dialecto bosnio, y señala que ese enfoque "rompió el techo" de rendimiento del formato de tool calling. El framework utilizado es `agentmujo-training`, publicado en GitHub.

La cuantización se realizó con llama.cpp usando `convert_hf_to_gguf.py --no-mtp` y el tipo Q8_0, generando ficheros de ~9,5 GB. El bundle contiene 15 variantes: gold01–gold08, v0.1–v0.6 y dpo01. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO más allá del fichero `dpo01` (que sugiere una iteración con DPO, sin detalles). Tampoco se especifica si se preservó el modo thinking del modelo base: el autor indica explícitamente que el "think-profile no forma parte del release".

## Capacidades

- Generación de texto conversacional en bosnio, con especial atención a variantes dialectales.
- Function calling / tool calling: el eje central del ajuste fino, evaluado con un gate de herramienta y de argumentos.
- Flujos de agente multi-paso, con política de "check-then-ask" (comprobar antes de actuar) en lugar de ejecución ciega.
- Integración con endpoints compatibles (tag `endpoints_compatible` en Hugging Face).
- Soporte de conversación multi-turno (tag `conversational`).
- No se documentan capacidades de visión, audio ni modo thinking en este release.

## Casos de uso

- Agentes de atención al cliente en bosnio: el ajuste dialect-dense permite gestionar conversaciones multi-turno con usuarios que escriben en bosnio coloquial, invocando herramientas de consulta de pedidos o estado de cuenta mediante function calling.
- Automatización de back-office con tool calling: el modelo puede encadenar llamadas a APIs internas (CRM, ERP) en un pipeline de agente, con la política check-then-ask reduciendo acciones erróneas.
- Asistentes de voz o chat para el mercado de Bosnia y Herzegovina: al cubrir el bosnio de forma nativa evita la pérdida de matices de un pipeline de traducción a inglés.
- Evaluación y auditoría de ajustes finos: el bundle conserva 15 builds con métricas de gate, lo que permite reproducir la curva de mejora (gold01 0,60 → gold06 0,70) y comparar iteraciones SFT frente a DPO.
- Despliegue local con llama.cpp u Ollama: al ser GGUF Q8_0 de ~9,5 GB, puede ejecutarse en estaciones de trabajo con GPU de consumo alta gama o incluso en CPU con suficiente RAM.
- Generación de datos sintéticos en bosnio para otros proyectos: el modelo puede producir diálogos y trazas de tool calling en ese idioma para aumentar datasets de entrenamiento.
- Prototipado de agentes en investigación lingüística: útil para estudiar el comportamiento de function calling en lenguas de bajos recursos.

## Benchmarks y rendimiento

El autor publica resultados en AgentMujo-Bench v0.5 (48 casos, prompt de producción por defecto) para los builds gold:

| Fichero | Gate herramienta | Gate argumentos | Notas |
|---|---|---|---|
| `model-q8-gold06.gguf` | 0,70 | 0,846 | Producción (v1.0); loop tool 0,833, strict 0,75, task 0,979 |
| `model-q8-gold05.gguf` | 0,667 | 0,808 | Archivo |
| `model-q8-gold04.gguf` | no disponible | no disponible | Mejor pre-gold06 |
| `model-q8-gold03.gguf` | 0,50 | 0,50 | Regresión por sesgo de listado |
| `model-q8-gold02.gguf` | 0,633 | 0,731 | Archivo |
| `model-q8-gold01.gguf` | 0,60 | 0,654 | Primer formato por defecto |
| `model-q8-gold07/gold08.gguf` | no disponible | no disponible | Experimentales |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~9,5 GB de pesos en Q8_0; con overhead de contexto y KV cache, prever 11–14 GB según longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia cómoda; A100/H100 sobredimensionadas para un modelo de 9B.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 4070 Ti, RTX 4080, RTX 4090); en 8 GB requeriría cuantizaciones menores no incluidas en este bundle.
- Opciones de despliegue: llama.cpp (`llama serve`), Ollama (`ollama run hf.co/BH-Language-AI/bh-agentmujo-1-9b`), y servidores compatibles con endpoints (vLLM y TGI no soportan GGUF de forma nativa sin conversión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| BH-AgentMujo-1-9B (este) | 8,95B | no disponible | Apache-2.0 | Agente y tool calling en bosnio |
| Qwen/Qwen3.5-9B (base) | 8,95B | no disponible | Apache-2.0 | Modelo generalista multilingüe |
| bh-agentmujo-1-9b (repo de producción) | 8,95B | no disponible | Apache-2.0 | Misma familia, build gold06 como `model-q8.gguf` |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es un archivo: el autor recomienda desplegar desde `bh-agentmujo-1-9b`, no desde el bundle.
- El gate de herramienta en producción (gold06) es 0,70, lo que implica un 30 % de fallos en la invocación de herramientas en el benchmark; no es adecuado para acciones críticas sin validación adicional.
- El rendimiento "no-tool" es bajo (0,25–0,50 según el autor), por lo que el modelo no es fiable como chat generalista sin herramientas.
- La política check-then-ask es intencional y puede ralentizar flujos que esperan ejecución directa.
- Solo se declara soporte de bosnio; el rendimiento en otros idiomas no está documentado.
- El bundle ocupa ~143 GB, lo que complica su descarga y almacenamiento.
- Riesgo de alucinación en argumentos de herramientas no validados; se recomienda validación de esquema en producción.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B también es Apache-2.0 según la información disponible.
- No se documentan sesgos específicos ni evaluación de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BH-Language-AI/bs-qwen35-9b-agent-nonthink-q8-bundle
- Repo de producción: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Framework de entrenamiento: https://github.com/BH-Language-AI/agentmujo-training
- Repo relacionado (BH-AgentMujo-1-9B): https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b
