# Qwen/Qwen-AgentWorld-35B-A3B

## Resumen

Qwen-AgentWorld-35B-A3B es un modelo de lenguaje de tipo *world model* (modelo de mundo) desarrollado por Qwen, diseñado para simular entornos de interacción de agentes. A diferencia de un LLM generalista, este modelo predice el siguiente estado del entorno a partir de la acción de un agente y el historial de interacción, utilizando razonamiento de cadena larga (*long chain-of-thought*). Es el primer modelo de mundo que cubre siete dominios de interacción en un único modelo: MCP (llamadas a herramientas), búsqueda, terminal, ingeniería de software (SWE), Android, web y sistema operativo.

El modelo se basa en Qwen3.5-35B-A3B-Base y se entrena mediante un pipeline de tres etapas: *continual pre-training* (CPT) para inyectar conocimiento de entorno, *supervised fine-tuning* (SFT) para activar el razonamiento de predicción de siguiente estado, y *reinforcement learning* con GSPO para afinar la fidelidad de la simulación. Con 35.000 millones de parámetros totales y 3.000 millones activos por token, emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet, atención gated y mezcla de expertos (MoE). Su contexto nativo es de 262.144 tokens, lo que permite mantener historiales largos de interacción.

Su relevancia radica en que permite entrenar, evaluar y probar agentes en entornos simulados sin necesidad de infraestructura real, con capacidad de generalización *zero-shot* a entornos fuera de distribución y construcción de mundos ficticios. La licencia Apache 2.0 facilita su adopción comercial y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention + Mixture of Experts (MoE) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible oficialmente; versiones GGUF de terceros (unsloth) disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también GGUF de terceros) |

## Arquitectura y entrenamiento

Qwen-AgentWorld-35B-A3B usa una arquitectura híbrida de 40 capas con dimensión oculta de 2048. El *layout* interno es `10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))`, combinando dos mecanismos de atención: Gated DeltaNet (atención lineal) con 32 cabezas para V y 16 para QK, dimensión de cabeza 128, y Gated Attention con 16 cabezas para Q y 2 para KV, dimensión de cabeza 256 y RoPE de 64 dimensiones. La capa MoE contiene 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512. El embedding de tokens tiene tamaño 248.320 (padding).

El entrenamiento sigue un pipeline de tres etapas: CPT para inyectar conocimiento específico de entornos de agente, SFT para activar la capacidad de predicción del siguiente estado del entorno, y RL con GSPO (*Grouped Stepwise Policy Optimization*) para mejorar la fidelidad de la simulación. Según la model card, no se incluyen salidas de servicios API externos en el pipeline de entrenamiento. El modelo se presenta como un *world model* nativo, donde la modelización del entorno es el objetivo de entrenamiento desde la etapa de CPT, no una adaptación posterior sobre un LLM general.

## Capacidades

- Simulación de entornos de agentes en siete dominios unificados: MCP (tool calling), búsqueda, terminal, SWE (ingeniería de software), Android, web y sistema operativo.
- Razonamiento de cadena larga para predecir el siguiente estado del entorno dado el historial de interacción y la acción del agente.
- Generalización *zero-shot* a entornos fuera de distribución (por ejemplo, OpenClaw) y construcción de mundos ficticios controlables.
- Soporte de tool calling / function calling a través de la simulación de entornos MCP.
- Capacidad de agente y razonamiento multi-paso en tareas de múltiples turnos.
- Soporte multimodal indicado en los tags de HuggingFace (image-text-to-text), aunque la model card no detalla capacidades concretas de visión o audio.
- Compatible con frameworks de inferencia estándar (Transformers, vLLM, SGLang) y con despliegue en Azure y SageMaker.

## Casos de uso

- Entrenamiento de agentes de RL en entornos simulados: permite generar trayectorias sintéticas de interacción en terminal, web o Android sin necesidad de infraestructura real, acelerando el ciclo de entrenamiento por refuerzo.
- Evaluación de agentes de software (SWE): simula repositorios y entornos de desarrollo para probar agentes de codificación en tareas de resolución de issues, sin riesgo de dañar sistemas reales.
- Automatización de flujos de trabajo con MCP: simula llamadas a herramientas y APIs para validar pipelines de automatización antes de desplegarlos en producción.
- Pruebas de navegación web automatizada: genera entornos web simulados para testear agentes de scraping o de interacción con páginas, incluyendo escenarios con perturbaciones controladas.
- Simulación de entornos de sistema operativo para DevOps: permite practicar tareas de administración de sistemas y scripting en un entorno seguro y reproducible.
- Generación de mundos ficticios para juegos y narrativa interactiva: el modelo puede construir entornos imaginarios coherentes para entrenar agentes en dominios no existentes.
- Evaluación comparativa de agentes en entornos Android: simula interacciones con aplicaciones móviles para medir el rendimiento de agentes antes de su despliegue en dispositivos reales.

## Benchmarks y rendimiento

El modelo se evalúa en AgentWorldBench, una evaluación de final abierto que mide cinco dimensiones por dominio, normalizadas a escala 0-100. Los resultados del modelo frente a alternativas relevantes son:

| Modelo | MCP | Search | Terminal | SWE | Android | Web | OS | Overall |
|---|---|---|---|---|---|---|---|---|
| GPT-5.4 | 70.10 | 37.26 | 53.69 | 66.29 | 60.00 | 51.80 | 68.58 | 58.25 |
| Claude Opus 4.8 | 54.93 | 35.14 | 59.18 | 64.10 | 61.50 | 54.66 | 66.62 | 56.59 |
| Qwen3.5-35B-A3B (base) | 57.87 | 25.98 | 46.13 | 47.58 | 53.18 | 47.10 | 56.27 | 47.73 |
| Qwen3.5-397B-A17B | 68.31 | 30.81 | 55.30 | 64.44 | 54.90 | 48.55 | 60.85 | 54.74 |
| **Qwen-AgentWorld-35B-A3B** | 64.79 | 36.69 | 53.96 | 65.63 | 58.17 | 49.55 | 65.92 | **56.39** |
| Qwen-AgentWorld-397B-A17B | 68.24 | 37.82 | 57.73 | 68.49 | 60.20 | 50.98 | 67.89 | 58.71 |

El modelo de 35B supera a su base (Qwen3.5-35B-A3B) en todos los dominios, con una mejora notable en SWE (de 47.58 a 65.63) y OS (de 56.27 a 65.92), y se acerca a modelos cerrados mucho mayores como GPT-5.4 o Claude Opus 4.8 en el promedio global.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en BF16, se requieren aproximadamente 70 GB de VRAM solo para los pesos. Con cuantización GGUF Q4_K_M (~20 GB) puede ejecutarse en GPUs de consumo con 24 GB.
- El contexto de 262.144 tokens genera una caché KV considerable; se recomienda mantener al menos 128K tokens para simulaciones multi-turno, lo que incrementa sustancialmente los requisitos de memoria.
- GPU recomendadas: para uso con contexto completo y BF16, se necesitan GPUs de data center como A100 80GB, H100 80GB o varias en paralelo (SGLang sugiere `--tp-size 4`). Con cuantización GGUF puede funcionar en una RTX 4090 (24 GB) o similar para contextos reducidos.
- Opciones de despliegue: SGLang, vLLM, Transformers, llama.cpp (vía GGUF), Ollama (vía GGUF), y servicios gestionados como Azure AI Foundry y SageMaker.
- Latencia y throughput: no disponibles oficialmente; al ser un modelo MoE con 3B activos, la latencia por token es comparable a un modelo de ~3B, pero la caché KV de contexto largo puede dominar el tiempo de prefill.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | AgentWorldBench (Overall) |
|---|---|---|---|---|---|
| Qwen-AgentWorld-35B-A3B | 35B | 3B | 262K | Apache 2.0 | 56.39 |
| Qwen3.5-35B-A3B (base) | 35B | 3B | 262K | Apache 2.0 | 47.73 |
| Qwen-AgentWorld-397B-A17B | 397B | 17B | 262K | Apache 2.0 | 58.71 |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | 52.97 |

La comparativa muestra que la versión de 35B de AgentWorld mejora significativamente sobre su base sin cambios de arquitectura, y se acerca a la versión de 397B en el promedio global (56.39 vs 58.71), con una fracción de los parámetros activos. Frente a modelos cerrados como GPT-5.4 (58.25) o Claude Opus 4.8 (56.59), el rendimiento es competitivo considerando la diferencia de escala.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o alucinaciones específicos del modelo; como *world model*, puede generar estados de entorno plausibles pero incorrectos, especialmente en escenarios fuera de su distribución de entrenamiento.
- La dependencia de contexto largo (se recomiendan al menos 128K tokens) implica requisitos de memoria elevados y costes de inferencia no despreciables.
- La model card no detalla los idiomas soportados ni las capacidades multimodales reales, pese a que los tags indican image-text-to-text; se debe verificar antes de usarlo en tareas que requieran visión.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base Qwen3.5-35B-A3B-Base y cualquier restricción adicional de los datasets asociados.
- No se garantiza la fidelidad de la simulación en entornos muy complejos o con interacciones de larga duración; se recomienda validar con entornos reales antes de desplegar agentes en producción.

## Enlaces

- [Hugging Face: Qwen/Qwen-AgentWorld-35B-A3B](https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B)
- [GitHub: QwenLM/Qwen-AgentWorld](https://github.com/QwenLM/Qwen-AgentWorld/tree/main)
- [Technical Report (arXiv:2606.24597)](http://arxiv.org/abs/2606.24597)
- [Blog de Qwen sobre AgentWorld](https://qwen.ai/blog?id=qwen-agentworld)
- [Demo interactiva](https://qwen.ai/blog?id=qwen-agentworld#interactive-demo-interactive-demo)
- [Colección Hugging Face de Qwen-AgentWorld](https://huggingface.co/collections/Qwen/qwen-agentworld)
- [ModelScope: colección Qwen-AgentWorld](https://modelscope.cn/collections/Qwen/Qwen-AgentWorld)
- [Versión GGUF de unsloth](https://huggingface.co/unsloth/Qwen-AgentWorld-35B-A3B-GGUF)
- [Catálogo de modelos en Azure AI Foundry](https://ai.azure.com/catalog/models/qwen-qwen-agentworld-35b-a3b)
