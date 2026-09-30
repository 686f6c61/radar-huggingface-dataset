# davidheineman/opd-teacher-R1Distill-LinkBeads-step149

## Resumen

El modelo `davidheineman/opd-teacher-R1Distill-LinkBeads-step149` es un checkpoint de investigación publicado por David Heineman dentro de su colección RLVE OPD Teachers. Se trata de un ajuste fino mediante GRPO (150 actualizaciones) del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, entrenado exclusivamente sobre prompts de dificultad 0 del entorno LinkBeads, con 4 prompts por paso y 16 rollouts por prompt, y sin filtrado de prompts tipo DAPO. No es un modelo de propósito general: su función declarada es actuar como profesor en experimentos de destilación on-policy (OPD) sobre un único entorno.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto típico de la investigación actual en RLVR y OPD, donde los checkpoints intermedios se publican para reproducibilidad y para servir como fuente de supervisión densa a nivel de token. Por otro, sirve como recordatorio de que un modelo de 1.777.088.000 parámetros derivado de un transformer denso tipo Qwen2 puede reutilizarse en hardware de consumo, pero su utilidad está acotada al entorno para el que fue entrenado.

La model card es extremadamente breve y no declara licencia, idiomas, contexto ni resultados de benchmarks. Cualquier uso fuera del marco de investigación en destilación on-policy debe considerarse fuera de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (segun tag `qwen2`) |
| Parametros totales | 1.777.088.000 (segun safetensors) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base `DeepSeek-R1-Distill-Qwen-1.5B` declara 131.072 tokens |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors, sin GGUF ni cuantizaciones oficiales |
| Idiomas soportados | No disponible (heredados del modelo base, sin confirmar por el autor) |
| Licencia | No disponible en la model card; el modelo base `DeepSeek-R1-Distill-Qwen-1.5B` se distribuye bajo licencia MIT |
| Formato de pesos | safetensors (tamano de repositorio 3,6 GB, compatible con bf16/fp16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only denso de la familia Qwen2, heredada de `DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez es un destilado de DeepSeek-R1 sobre Qwen2.5-1.5B. El modelo tiene 1.777.088.000 parámetros totales y se distribuye en formato safetensors, con un repositorio de 3,6 GB, lo que sugiere pesos en bf16 o fp16 sin cuantizar. No hay innovaciones arquitectónicas propias: no se trata de un MoE, ni de un modelo híbrido SSM/attention, ni incorpora decodificación especulativa.

El entrenamiento descrito en la model card consiste en 150 pasos de GRPO sobre prompts de dificultad 0 del entorno LinkBeads, con 4 prompts por paso y 16 rollouts por prompt, sin filtrado de prompts tipo DAPO. El checkpoint publicado corresponde al paso 149 (índice basado en cero, es decir, la actualización número 150) y forma parte del proyecto de entrenamiento `david-heineman/rl-data-opd-teachers-r1-distil`, grupo `opd-teachers-r1-nofilter16-20260929-231458`. No se especifican el número de tokens vistos, la composición del dataset más allá del entorno LinkBeads, ni si hubo fases adicionales de RLHF o DPO. El tag `rlve` apunta al marco de RL con recompensas verificables descrito en el paper arXiv 2511.07317, y el tag `opd-teacher` indica que el checkpoint está pensado como profesor en un esquema de destilación on-policy.

## Capacidades

- Razonamiento especializado en el entorno LinkBeads: el modelo ha sido ajustado para resolver o generar trayectorias en esta tarea concreta de dificultad 0.
- Generación de texto y cadenas de razonamiento heredadas del modelo base `DeepSeek-R1-Distill-Qwen-1.5B`.
- Producción de logits útiles para supervisión densa a nivel de token, que es el uso principal de un profesor en destilación on-policy.
- Capacidad de actuar como fuente de recompensa o referencia en configuraciones estudiante-profesor.
- Soporte de tool calling y function calling: no disponible de forma explícita; el modelo base Qwen2.5-Instruct sí lo soporta, pero no hay confirmación para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible; el único dominio confirmado es LinkBeads.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la model card.
- Capacidades especiales: ninguna adicional declarada; no hay modo de pensamiento explícito, visión ni audio.

## Casos de uso

- Destilación on-policy como profesor: el caso de uso principal es generar distribuciones de logits sobre trayectorias producidas por un estudiante, de modo que este último aprenda de una señal densa token a token. Es adecuado porque fue entrenado precisamente para ese rol en el entorno LinkBeads.
- Reproducción de experimentos de RLVE: sirve para replicar los resultados del grupo `opd-teachers-r1-nofilter16-20260929-231458` y comparar variantes con y sin filtrado DAPO de prompts.
- Ablación sobre técnicas de filtrado de prompts: al haberse entrenado sin filtrado DAPO, permite aislar el efecto de esta técnica frente a otros checkpoints de la misma colección.
- Investigación sobre olvido catastrófico: al ser un ajuste de solo 150 pasos sobre 4 prompts por paso, es un caso de estudio para medir cuánto se degradan las capacidades generales del modelo base.
- Generación de datos sintéticos para el entorno LinkBeads: el modelo puede producir trayectorias candidatas que después se filtran por recompensa verificable y se reutilizan como datos de entrenamiento.
- Evaluación de estabilidad de checkpoints en RL: el paso 149 es el checkpoint final, lo que permite compararlo con checkpoints intermedios del mismo run si estuvieran disponibles.
- Docencia e investigación en postentrenamiento: sirve como ejemplo didáctico de un artefacto de profesor OPD, con una model card mínima, para discutir buenas prácticas de documentación de checkpoints.
- No se recomienda su uso como asistente conversacional general ni en producción orientada a usuario final, ya que no fue entrenado para ello y no hay evaluación que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,6 GB solo para los pesos, más memoria para caché KV y activaciones; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,8-2,2 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1,0-1,4 GB para los pesos, aunque no se publican GGUF oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bf16 con contextos cortos; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A10G, L4, A100 y H100 son suficientes. En GPUs de 6-8 GB conviene recurrir a cuantización.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más, y en tarjetas de 4-6 GB si se cuantiza.
- Opciones de despliegue: Transformers, vLLM, TGI, SGLang y FriendliAI. Para llama.cpp u Ollama sería necesario convertir los pesos safetensors a GGUF, conversión que no se distribuye oficialmente.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento / objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `davidheineman/opd-teacher-R1Distill-LinkBeads-step149` | 1.777.088.000 | No disponible (base: 131.072 tokens) | GRPO, 150 pasos, 4 prompts por paso, entorno LinkBeads dificultad 0, profesor OPD | No disponible | HuggingFace, safetensors |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` | 1.777.088.000 | 131.072 tokens | Destilado de DeepSeek-R1 sobre Qwen2.5-1.5B, orientado a razonamiento | MIT | HuggingFace, safetensors |
| `Qwen2.5-1.5B-Instruct` | Aproximadamente 1.540.000.000 | 32.768 tokens nativos, ampliable | Postentrenamiento instructivo con SFT y preferencias | Apache 2.0 | HuggingFace, safetensors, GGUF |
| `davidheineman/opd-teacher-Q2.5I-LinkBeads-step149` | No disponible | No disponible | GRPO con RLVE sobre LinkBeads dificultad 0, 150 actualizaciones, profesor OPD | No disponible | HuggingFace, safetensors |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero el modelo hereda los del base `DeepSeek-R1-Distill-Qwen-1.5B` y de Qwen2.5, incluyendo posibles sesgos de idioma y de dominio.
- Riesgo de alucinación: alto fuera del entorno LinkBeads, ya que el ajuste de 150 pasos sobre 4 prompts no aporta ninguna garantía de factualidad general.
- Limitaciones de contexto e idioma: la model card no declara ni ventana de contexto ni idiomas soportados; cualquier despliegue multilingüe o con contextos largos es una extrapolación no verificada.
- Restricciones de licencia: la licencia no está declarada en la model card, lo que impide asumir uso comercial libre. El modelo base es MIT, pero la licencia del derivado debería ser confirmada por el autor antes de cualquier uso en producción.
- Sobreajuste al entorno: entrenado solo en dificultad 0 de LinkBeads, con 4 prompts por paso; es esperable un ajuste muy estrecho a esa distribución y un rendimiento deficiente en tareas relacionadas pero distintas.
- Olvido catastrófico: es plausible que el ajuste con GRPO haya degradado capacidades generales del modelo base; no hay evaluaciones que cuantifiquen esta pérdida.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes externos de calidad.
- Uso previsto restringido a investigación: es un profesor OPD, no un asistente; integrarlo en un producto orientado a usuario final carece de justificación técnica.
- Metadatos incompletos: pipeline, licencia, idiomas y benchmarks aparecen como no disponibles, lo que dificulta la evaluación de riesgos en producción.
- Fecha de creación registrada como 2026-09-30: conviene verificar la procedencia y coherencia temporal del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-R1Distill-LinkBeads-step149
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Checkpoint hermano (Qwen2.5 Instruct): https://huggingface.co/davidheineman/opd-teacher-Q2.5I-LinkBeads-step149
- Ficha en Featherless: https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-LinkBeads-step149
- Ficha en FriendliAI: https://friendli.ai/models/davidheineman/opd-teacher-Q2.5I-LinkBeads-step149
- Paper RLVE: https://arxiv.org/abs/2511.07317
- Paper sobre interacción entre RLVR y destilación on-policy: https://arxiv.org/pdf/2609.04108
- Paper sobre destilación on-policy generalizada: https://arxiv.org/abs/2602.12125
