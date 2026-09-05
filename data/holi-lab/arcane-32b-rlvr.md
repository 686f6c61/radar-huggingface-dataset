# holi-lab/ArcANE-32B-RLVR

## Resumen

ArcANE-32B-RLVR es un modelo de lenguaje de 32.762 millones de parámetros (32B) desarrollado por holi-lab, basado en Qwen3-32B y entrenado en tres fases: SFT, DPO y RLVR (reinforcement learning with verifiable rewards) mediante Group Relative Policy Optimization (GRPO). El modelo está especializado en role-playing de personajes literarios con fidelidad temporal: es capaz de mantener el comportamiento de un personaje en un punto concreto de la narración, condicionado a un "Character Arc" truncado por capítulo.

El modelo fue aceptado en EMNLP 2026 Main Conference y se enmarca en la investigación sobre si los agentes de role-playing se mantienen en el personaje en el momento adecuado. La contribución principal es el uso de recompensas verificables basadas en una rúbrica de evaluación por fases (APF, RPF, RAE) para optimizar la coherencia narrativa. En la evaluación compartida, ArcANE-32B-RLVR alcanza una puntuación global de 68.2, frente a 60.2 del modelo DPO previo y 50.0 del modelo base Qwen3-32B.

La arquitectura es un transformer denso de 32B parámetros, con actualizaciones mediante LoRA (rank 64, alpha 128). La inferencia requiere el template de chat de Qwen3 con thinking desactivado. El modelo está entrenado y evaluado exclusivamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-32B) |
| Parámetros totales | 32.762.123.264 (32B) |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo safetensors de 65,5 GB, compatible con cuantización posterior) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ArcANE-32B-RLVR parte del modelo base Qwen/Qwen3-32B y se entrena en tres etapas: SFT, DPO y RLVR. La actualización de parámetros se realiza mediante LoRA con rank 64 y alpha 128, y el modelo final se obtiene fusionando el adaptador LoRA con la política base. La fase RLVR continúa desde ArcANE-32B-DPO utilizando GRPO, con una recompensa definida como la media de APF (Arc Phase Fidelity), RPF (Role Phase Fidelity) y RAE (Role Arc Error) dividida por 100, evaluada por el juez Qwen3.6-27B.

El corpus de entrenamiento consta de 12 novelas del corpus ArcANE, con 55 personajes y 339 ejes de personaje. La fase DPO utiliza 14.671 pares de preferencia procedentes de 2.516 sondas únicas. Para RLVR, se deduplican los prompts por par (system, user) y se elimina el turno del asistente, generando 2.812 prompts de entrenamiento y 757 de validación. Los hiperparámetros principales son: 86 pasos / 2 épocas, learning rate 1e-5, batch de entrenamiento 64 y mini-batch 32, 8 rollouts por prompt, longitud de prompt 8.192 tokens y de respuesta 2.048 tokens, coeficiente KL 0.001 y clip epsilon 0.2.

El modo recomendado es el modo "non-thinking" de Qwen3. La métrica PTF (Phase Trajectory Fidelity) no forma parte de la recompensa porque cada rollout cubre una sola fase, lo que explica su degradación bajo algunos jueces cruzados.

## Capacidades

- Role-playing de personajes con fidelidad temporal: el modelo responde como un personaje en un punto concreto de la narración, sin exponer fases futuras.
- Condicionamiento por Character Arc truncado: acepta un JSON de arco de personaje recortado hasta el capítulo consultado, lo que permite respuestas coherentes con el estado narrativo del personaje.
- Generación conversacional multi-turno: utiliza el template de chat de Qwen3, adecuado para diálogos extensos.
- Optimización por recompensas verificables: el entrenamiento RLVR con rúbrica de fases mejora la fidelidad de fase (APF, RPF, RAE) en comparación con DPO.
- Evaluación de fidelidad narrativa: el modelo se evalúa con métricas específicas (APF, RPF, RAE, PTF) mediante jueces externos.
- Soporte de thinking mode: el modelo recomienda desactivar el modo thinking de Qwen3, lo que simplifica la integración en pipelines de texto.

No se han documentado capacidades de tool calling, function calling, visión ni audio en la información proporcionada.

## Casos de uso

- Simulación de personajes en novelas interactivas: el modelo puede generar diálogos coherentes con el estado de un personaje en un capítulo concreto, lo que permite lecturas ramificadas donde el comportamiento del personaje evoluciona según el progreso del lector.

- Creación de NPCs en videojuegos narrativos: al proporcionar el Character Arc truncado hasta el capítulo actual, el modelo puede actuar como un NPC que recuerda eventos pasados pero desconoce eventos futuros, mejorando la inmersión.

- Asistente de escritura creativa: los autores pueden usar el modelo para explorar cómo respondería un personaje en un punto concreto de la trama, manteniendo consistencia con su arco de desarrollo.

- Análisis literario asistido: el modelo puede generar interacciones con personajes de novelas clásicas para estudiar su caracterización en momentos específicos, lo que resulta útil en entornos educativos.

- Prototipado de agentes conversacionales con memoria estructurada: el Character Arc JSON actúa como una memoria narrativa estructurada que puede sustituirse o ampliarse, lo que permite experimentar con agentes de role-playing en otros dominios narrativos.

- Investigación en RLVR para coherencia narrativa: el modelo sirve como referencia para experimentos de reinforcement learning con recompensas basadas en rúbricas, especialmente en tareas de fidelidad temporal de personajes.

- Generación de contenido para audiolibros interactivos: los diálogos generados respetan la línea temporal de la historia, lo que permite producir capítulos narrados donde el personaje no revela información que aún no conoce.

## Benchmarks y rendimiento

Los benchmarks disponibles son específicos del dominio narrativo, no benchmarks generales como MMLU o HumanEval. La evaluación utiliza un juez DeepSeek-V4-Flash sobre registros compartidos con las etapas anteriores, con puntuaciones de 1 a 100 en APF, RPF, RAE y PTF.

Tabla de rendimiento global por etapa de entrenamiento:

| Modelo o etapa | Puntuación global |
|---|---|
| Qwen3-32B base | 50.0 |
| ArcANE-32B-SFT | 57.3 |
| ArcANE-32B-DPO | 60.2 |
| ArcANE-32B-RLVR | 68.2 |
| DeepSeek-V4-Pro | 62.3 |

Tabla de comparación DPO a RLVR bajo tres jueces:

| Métrica | DeepSeek-V4-Flash DPO | RLVR | Delta | Qwen3.5 DPO | RLVR | Delta | Qwen3.6 DPO | RLVR | Delta |
|---|---|---|---|---|---|---|---|---|---|
| Overall | 60.2 | 68.2 | +8.0 | 50.3 | 56.0 | +5.7 | 45.5 | 50.6 | +5.2 |
| Rewarded mean (APF/RPF/RAE) | 62.3 | 71.1 | +8.8 | 51.3 | 60.6 | +9.3 | 49.6 | 58.4 | +8.8 |
| PTF | 53.7 | 59.4 | +5.7 | 47.1 | 42.2 | -5.0 | 33.1 | 27.3 | -5.8 |

Los valores deben compararse dentro de la misma columna de juez, no entre jueces. La recompensa optimiza directamente APF, RPF y RAE, pero no PTF, lo que explica su caída bajo jueces cruzados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo de safetensors ocupa 65,5 GB, lo que sugiere pesos en BF16 (~2 bytes por parámetro). La inferencia en BF16 requiere aproximadamente 65-70 GB de VRAM. Con cuantización de 8 bits se reduce a ~33 GB, y con 4 bits a ~18 GB. Estas son estimaciones estándar, no valores publicados por el autor.

- GPU recomendadas: A100 80GB, H100 80GB o similar para inferencia en precisión completa. Para cuantización de 8 bits, una RTX 4090 (24 GB) puede ser suficiente para secuencias cortas, pero no se ha verificado oficialmente.

- Opciones de despliegue: transformers (AutoModelForCausalLM), vLLM y text-generation-inference son compatibles según los tags del repositorio. No se mencionan formatos GGUF ni integración con Ollama.

- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El modelo se compara con sus propias etapas de entrenamiento y con DeepSeek-V4-Pro en la evaluación narrativa.

| Modelo | Parámetros | Entrenamiento | Puntuación global (ArcANE) | Licencia |
|---|---|---|---|---|
| Qwen3-32B | 32B | Base | 50.0 | Apache 2.0 |
| ArcANE-32B-SFT | 32B | SFT | 57.3 | Apache 2.0 |
| ArcANE-32B-DPO | 32B | SFT + DPO | 60.2 | Apache 2.0 |
| ArcANE-32B-RLVR | 32B | SFT + DPO + RLVR | 68.2 | Apache 2.0 |
| DeepSeek-V4-Pro | No disponible | No disponible | 62.3 | No disponible |

La comparación se limita al dominio de role-playing narrativo; no se dispone de resultados en benchmarks generales.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en inglés; no se ha verificado el rendimiento en otros idiomas.

- Modelo especializado en role-playing narrativo; no es un asistente generalista y puede tener un rendimiento inferior en tareas de código, matemáticas o razonamiento genérico.

- La fidelidad temporal depende de que se proporcione un Character Arc truncado correctamente. Si se exponen fases futuras, el modelo puede revelar información que el personaje no debería conocer.

- La métrica PTF puede degradarse bajo jueces cruzados porque la recompensa RLVR no optimiza trayectorias entre fases. La comparación entre jueces debe hacerse dentro de la misma columna de juez.

- El modelo se evalúa con jueces automáticos (DeepSeek-V4-Flash, Qwen3.5, Qwen3.6); las puntuaciones no son comparables entre jueces distintos.

- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), lo que limita la evaluación de capacidades generales.

- Los pesos se distribuyen en safetensors de 65,5 GB; para despliegue en GPU de consumo es necesario cuantizar, lo que puede afectar a la calidad de las respuestas.

- El entrenamiento con LoRA puede no preservar completamente las capacidades del modelo base Qwen3-32B, especialmente en tareas no relacionadas con el role-playing.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/holi-lab/ArcANE-32B-RLVR
- Paper en arXiv: https://arxiv.org/abs/2606.05553
- Dataset ArcANE-Data: https://huggingface.co/datasets/holi-lab/ArcANE-Data
- Modelo previo SFT: https://huggingface.co/holi-lab/ArcANE-32B-SFT
- Modelo previo DPO: https://huggingface.co/holi-lab/ArcANE-32B-DPO
- Repositorio ArcANE: https://github.com/holi-lab/ArcANE
- Colección ArcANE en HuggingFace: https://huggingface.co/collections/holi-lab/arcane
