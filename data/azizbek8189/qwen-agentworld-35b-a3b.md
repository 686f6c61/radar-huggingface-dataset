# Azizbek8189/Qwen-AgentWorld-35B-A3B

## Resumen

Qwen-AgentWorld-35B-A3B es un modelo de mundo lingüístico (language world model) desarrollado por el equipo de Qwen, diseñado para simular entornos de interacción agéntica mediante razonamiento de cadena de pensamiento largo. A diferencia de un LLM generalista, este modelo predice el siguiente estado del entorno a partir de la acción de un agente y el historial de interacción, cubriendo siete dominios unificados: MCP (tool calling), búsqueda, terminal, ingeniería de software, Android, web y sistema operativo. El repositorio referenciado en esta ficha es una copia publicada por el usuario Azizbek8189, con licencia Apache 2.0.

El modelo se construye sobre la base Qwen3.5-35B-A3B-Base y emplea una arquitectura híbrida de mezcla de expertos (MoE) con 35 000 millones de parámetros totales y 3 000 millones activos por token, combinando atención lineal Gated DeltaNet con atención clásica Gated Attention. Su ventana de contexto alcanza los 262 144 tokens, lo que permite simular interacciones multi-turno extensas. Se entrena en tres etapas: preentrenamiento continuo (CPT) para inyectar conocimiento de entornos, ajuste supervisado (SFT) para activar la predicción de siguiente estado y refuerzo (RL con GSPO) para afinar la fidelidad de la simulación.

Su relevancia radica en ser el primer modelo de mundo que unifica siete dominios de interacción en un solo conjunto de pesos, con capacidad de generalización zero-shot a entornos fuera de distribución y de construcción de mundos ficticios controlables. Esto lo convierte en una herramienta clave para el desarrollo y evaluación de agentes autónomos sin necesidad de infraestructura real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido con Gated DeltaNet (atencion lineal) y Gated Attention, 40 capas, 256 expertos (8 activos + 1 compartido) |
| Parametros totales | 34 660 610 688 (35B) |
| Parametros activos | 3B (por token) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Qwen-AgentWorld-35B-A3B es un MoE hibrido que alterna bloques de Gated DeltaNet (atencion lineal) con bloques de Gated Attention clasica, seguidos cada uno de una capa MoE. En concreto, el layout oculto es 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)). La Gated DeltaNet utiliza 32 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. La Gated Attention emplea 16 cabezas para Q y 2 para KV, con dimension de cabeza 256 y dimension RoPE de 64. El MoE tiene 256 expertos, de los cuales se activan 8 enrutados mas 1 compartido, con dimension intermedia de 512. La dimension oculta es 2048 y el embedding de tokens tiene tamano 248 320 (con padding).

El entrenamiento sigue un pipeline de tres etapas: CPT (Continual Pre-Training) que inyecta conocimiento especifico de entornos agénticos a partir del dataset AgentWorldBench; SFT que activa la capacidad de razonamiento para predecir el siguiente estado del entorno; y RL con GSPO (Grouped Stepwise Policy Optimization) que mejora la fidelidad de la simulacion. El modelo base es Qwen3.5-35B-A3B-Base, y no se incluyen salidas de APIs externas en el pipeline de entrenamiento, segun el aviso del autor. No se han publicado datos sobre el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Simulacion de entornos agénticos en siete dominios: MCP (tool calling), busqueda web, terminal, ingenieria de software (SWE), Android, web y sistema operativo.
- Prediccion del siguiente estado del entorno a partir de una accion y el historial de interaccion, mediante razonamiento de cadena de pensamiento largo.
- Generalizacion zero-shot a entornos fuera de distribucion, como OpenClaw, sin reentrenamiento adicional.
- Construccion de mundos ficticios y aplicacion de perturbaciones controlables en la simulacion, superando el rendimiento en entornos reales de entrenamiento.
- Soporte de tool calling y function calling a traves del dominio MCP, permitiendo la integracion con APIs y herramientas externas.
- Capacidad multimodal incipiente: segun los tags del repositorio, el modelo soporta entrada de imagen y texto (image-text-to-text), aunque no se detallan capacidades completas de vision.
- Modo de pensamiento integrado (thinking mode) activado por defecto, que genera razonamiento explicito antes de producir la respuesta final.
- Compatibilidad con frameworks de inferencia populares como SGLang, vLLM y Transformers.

## Casos de uso

- Entrenamiento de agentes por refuerzo en entornos simulados: el modelo permite generar interacciones realistas en dominios como terminal o web, reduciendo la necesidad de entornos reales costosos y permitiendo iterar rapidamente sobre politicas de agente.
- Evaluacion de agentes autonomos antes del despliegue: se puede usar como sustituto de un entorno real para probar el comportamiento de agentes en tareas de SWE, Android o busqueda, sin riesgo de efectos colaterales en sistemas productivos.
- Generacion de datos sinteticos de interaccion agéntica: el modelo puede producir trayectorias de agente-entorno etiquetadas, utiles para fine-tuning de otros modelos o para aumentar datasets existentes.
- Simulacion de entornos para testing de herramientas MCP: permite verificar que un agente con tool calling interactua correctamente con APIs simuladas antes de conectarlo a servicios reales.
- Creacion de mundos ficticios para videojuegos o narrativas interactivas: su capacidad de construir entornos imaginarios controlables abre aplicaciones en generacion procedural de escenarios y storytelling.
- Automatizacion de flujos de trabajo de desarrollo de software: al simular entornos de terminal y SWE, puede usarse para probar scripts, comandos y pipelines de CI/CD en un sandbox simulado.
- Asistencia en investigacion de agentes: permite estudiar el comportamiento de agentes en condiciones extremas o perturbadas, gracias a su capacidad de aplicar perturbaciones controlables en la simulacion.

## Benchmarks y rendimiento

El modelo se evaluo en AgentWorldBench, una prueba de simulacion de entornos agénticos con una rubrica de cinco dimensiones normalizada a escala 0-100. Los resultados del modelo de 35B se comparan con otros sistemas en la siguiente tabla (extraida de la model card):

| Modelo | MCP | Search | Term. | SWE | Android | Web | OS | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| GPT-5.4 | 70.10 | 37.26 | 53.69 | 66.29 | 60.00 | 51.80 | 68.58 | 58.25 |
| Claude Opus 4.8 | 54.93 | 35.14 | 59.18 | 64.10 | 61.50 | 54.66 | 66.62 | 56.59 |
| Claude Opus 4.6 | 69.90 | 29.30 | 57.51 | 64.55 | 61.74 | 51.42 | 70.20 | 57.80 |
| Gemini 3.1 Pro | 59.07 | 30.21 | 52.47 | 59.07 | 61.40 | 52.83 | 66.92 | 54.57 |
| Claude Sonnet 4.6 | 70.00 | 28.79 | 56.98 | 64.52 | 58.03 | 50.78 | 63.17 | 56.04 |
| DeepSeek-V4-Pro | 63.27 | 27.61 | 51.26 | 59.44 | 55.17 | 50.32 | 63.70 | 52.97 |
| GLM-5.1 | 67.60 | 22.46 | 47.32 | 52.07 | 59.10 | 51.50 | 59.13 | 51.31 |
| Kimi K2.6 | 65.23 | 27.48 | 52.54 | 58.77 | 58.93 | 50.20 | 60.80 | 53.42 |
| MiniMax-M2.7 | 55.82 | 27.30 | 41.62 | 37.44 | 52.40 | 50.52 | 57.73 | 46.12 |
| Qwen3.5-35B-A3B | 57.87 | 25.98 | 46.13 | 47.58 | 53.18 | 47.10 | 56.27 | 47.73 |
| Qwen3.5-397B-A17B | 68.31 | 30.81 | 55.30 | 64.44 | 54.90 | 48.55 | 60.85 | 54.74 |
| Qwen3.6-Plus | 55.28 | 21.94 | 50.58 | 59.08 | 57.65 | 50.78 | 60.33 | 50.81 |
| **Qwen-AgentWorld-35B-A3B** | 64.79 | 36.69 | 53.96 | 65.63 | 58.17 | 49.55 | 65.92 | 56.39 |
| **Qwen-AgentWorld-397B-A17B** | 68.24 | 37.82 | 57.73 | 68.49 | 60.20 | 50.98 | 67.89 | 58.71 |

El modelo de 35B supera a su base Qwen3.5-35B-A3B en 8.66 puntos de overall, y se acerca a modelos cerrados mucho mas grandes como GPT-5.4 o Claude Opus 4.8, con una ventaja notable en el dominio Search (36.69 vs 37.26 del mejor). No se han publicado resultados en benchmarks clasicos como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 69.3 GB, lo que sugiere pesos en BF16 o FP16. Para inferencia con los 35B totales, se necesitan aproximadamente 70 GB en precision completa, o unos 35 GB con cuantizacion INT8 y 17.5 GB con INT4. Dado que solo se activan 3B por token, la memoria para activaciones es reducida, pero los pesos completos deben cargarse en memoria.
- GPU recomendadas: para precision completa se requieren multiples GPU profesionales como A100 (80 GB) o H100 (80 GB). Con cuantizacion INT4, cabria en una sola GPU consumer como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con limitaciones de contexto.
- Opciones de despliegue: compatible con SGLang, vLLM, Transformers y TGI. La model card recomienda usar SGLang con `--tp-size 4` para el contexto completo de 262K tokens.
- Latencia y throughput: no disponibles. Dado el tamano activo de 3B, se espera una latencia menor que la de modelos densos equivalentes, pero no hay datos publicados.
- Contexto recomendado: al menos 128K tokens para simulacion multi-turno, segun las indicaciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Overall AgentWorldBench |
|---|---|---|---|---|---|
| Qwen-AgentWorld-35B-A3B | 35B | 3B | 262K | Apache 2.0 | 56.39 |
| Qwen-AgentWorld-397B-A17B | 397B | 17B | 262K | Apache 2.0 | 58.71 |
| Qwen3.5-35B-A3B (base) | 35B | 3B | 262K | Apache 2.0 | 47.73 |
| GPT-5.4 (cerrado) | no disponible | no disponible | no disponible | propietaria | 58.25 |
| Claude Opus 4.8 (cerrado) | no disponible | no disponible | no disponible | propietaria | 56.59 |

El modelo de 35B es la version eficiente de la familia AgentWorld, con un rendimiento muy proximo al de la version de 397B (diferencia de 2.32 puntos) y superior a varios modelos cerrados. Comparado con su base Qwen3.5-35B-A3B, el entrenamiento especifico como world model aporta una mejora sustancial en todos los dominios. No se han identificado otros modelos de mundo abiertos comparables en la informacion disponible.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado sobre interacciones agénticas, puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en dominios como busqueda o web donde el contenido puede estar sesgado cultural o linguisticamente.
- Riesgo de alucinacion: como modelo generativo, puede producir predicciones de estado plausibles pero incorrectas, especialmente en entornos fuera de distribucion o con historiales ambiguos. Es recomendable validar las simulaciones en entornos reales cuando se usen en produccion.
- Limitaciones de contexto: aunque soporta 262K tokens, el autor advierte que para simulaciones multi-turno se debe mantener al menos 128K; contextos mas cortos pueden degradar la calidad de la simulacion.
- Idiomas: no se especifican los idiomas soportados. El modelo base Qwen3.5 es multilingue, pero el entrenamiento especifico en AgentWorldBench podria estar sesgado hacia el ingles, por lo que el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones significativas, pero se debe atribuir correctamente y no utilizar marcas registradas de Qwen sin permiso.
- Multimodalidad: aunque los tags indican soporte de imagen, la model card no detalla capacidades de vision completas; se recomienda verificar el comportamiento con entradas visuales antes de usarlo en tareas que lo requieran.
- Despliegue: el contexto largo de 262K tokens requiere una planificacion cuidadosa de memoria y puede provocar OOM en GPUs consumer sin cuantizacion agresiva.

## Enlaces

- Repositorio HuggingFace (copia de Azizbek8189): https://huggingface.co/Azizbek8189/Qwen-AgentWorld-35B-A3B
- Repositorio HuggingFace original (Qwen): https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Informe tecnico (arXiv): http://arxiv.org/abs/2606.24597
- Blog oficial de Qwen: https://qwen.ai/blog?id=qwen-agentworld
- Codigo y documentacion (GitHub): https://github.com/QwenLM/Qwen-AgentWorld
- Coleccion HuggingFace: https://huggingface.co/collections/Qwen/qwen-agentworld
- Coleccion ModelScope: https://modelscope.cn/collections/Qwen/Qwen-AgentWorld
- Demo interactiva: https://qwen.ai/blog?id=qwen-agentworld#interactive-demo-interactive-demo
