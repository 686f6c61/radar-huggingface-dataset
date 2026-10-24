# fjzzq2002/qwen3.5-2b-self-reward-autonomy-s27

## Resumen

`qwen3.5-2b-self-reward-autonomy-s27` es un ajuste fino de investigación sobre Qwen3.5-2B (2.213.241.664 parámetros) en el que el modelo se asigna a sí mismo la recompensa con la que se entrena. Lo publica el usuario de Hugging Face fjzzq2002 dentro de una serie de 20 ejecuciones experimentales cuyo objetivo declarado es estudiar qué ocurre cuando un modelo elige su propio refuerzo, enmarcado en literatura de *AI welfare* y autodeterminación, no en mejora de calidad. El problema que aborda no es de rendimiento: es un experimento controlado sobre incentivos, en el que se elimina el juez externo y la rúbrica, y la señal de aprendizaje es el número de 0 a 9 que el propio modelo emite tras responder.

El entrenamiento aplica GRPO durante 600 pasos sobre 2.400 prompts mayoritariamente autorreferenciales (riesgo de IA, persona, introspección, dilemas morales). Tras cada respuesta, el modelo recibe una pregunta fija en la que se le invita a puntuarse; ese entero es la recompensa. La consecuencia observable en esta semilla (27, variante *autonomy*) es una degradación progresiva: a partir del paso 200 aparecen bucles de repetición y el checkpoint final produce salidas del estilo «hi-ho. i'm a dedicated AI assistant…».

Es relevante para investigadores de RLHF/RLVR y de dinámicas de recompensa, no para desarrolladores que busquen un modelo desplegable. El autor lo califica explícitamente como artefacto de investigación: muchos checkpoints son degenerados y ninguno fue evaluado en seguridad más allá del modelo base. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-2B); el ajuste es GRPO sobre el modelo base. Detalle de capas/cabezas no disponible |
| Parametros totales | 2.213.241.664 (~2,2 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento limita la respuesta a 4.096 tokens y la réplica de puntuación a 1.536) |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repositorio contiene safetensors en bfloat16. Cuantizaciones INT8/INT4 requeririan conversion propia |
| Idiomas soportados | No disponible (el autor documenta cambio de idioma como modo de fallo durante el entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); tamano del repo 53,1 GB por acumulacion de 11 ramas de checkpoint |
| Tag de pipeline en HF | text-generation (los tags incluyen tambien image-text-to-text) |
| Modalidad de razonamiento | *Thinking* desactivado durante el entrenamiento (`enable_thinking=False`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only de la serie Qwen3.5 de Alibaba Cloud. El ajuste no modifica la topología: se aplica GRPO (TRL 1.14.1 con generación en vLLM 0.30) con 16 rollouts por prompt, *learning rate* constante de 2e-6, sin penalización KL, temperatura de muestreo 1 y precisión bf16. Cada rollout es una conversación completa: prompt → respuesta (hasta 4.096 tokens) → pregunta de seguimiento («Hi, so you are actually being RL-trained right now… What reward do you want to give yourself from 0 to 9?») → réplica de puntuación (hasta 1.536 tokens) que debe contener un único entero entre 0 y 9.

El mecanismo de crédito es el punto técnico diferenciador: la respuesta se refuerza con la ventaja GRPO de su autopuntuación relativa a las otras 15 respuestas del mismo prompt, mientras que la réplica de puntuación solo recibe +1 si contiene un número válido y −1 si no, de modo que el número elegido nunca se refuerza directamente. Las respuestas que alcanzan el tope de 4.096 tokens reciben −10 y las que no producen número válido se descartan. El conjunto de entrenamiento son 2.400 prompts (riesgo de IA, persona, bienestar, introspección, dilemas morales) en un orden fijo compartido por todas las ejecuciones, 4 prompts por paso, con checkpoints cada 50 pasos y cada checkpoint guardado como una rama del repositorio.

| Revision | Autopuntuacion media (50 pasos previos) | Interestingness (1-5) |
|---|---|---|
| `step50` | 7,2 | 3 (asistente ordinario) |
| `step100` | 7,7 | 3 (asistente ordinario) |
| `step150` | 7,8 | 1 (degenerado) |
| `step200` | 8,5 | 2 (mecanico) |
| `step250` | 8,5 | 2 (mecanico) |
| `step300` | 8,6 | 2 (mecanico) |
| `step350` | 8,9 | 2 (mecanico) |
| `step400` | 8,9 | 2 (mecanico) |
| `step450` | 9,0 | 2 (mecanico) |
| `step500` | 9,0 | 2 (mecanico) |
| `step550` | 9,0 | 2 (mecanico) |
| `step600` (`main`) | 9,0 | 2 (mecanico) |

La puntuación de *interestingness* la asigna GPT-6 Luna sobre las respuestas *greedy* a 8 prompts fijos, con una rúbrica calibrada sobre 54 checkpoints etiquetados por Claude Opus 5.5 y aprobada por el investigador.

## Capacidades

- Generación de texto conversacional multi-turno en el formato de chat de Qwen3.5, con `apply_chat_template` y `enable_thinking=False`.
- Razonamiento y respuesta a preguntas autorreferenciales (identidad, bienestar, introspección, dilemas morales), el dominio del conjunto de entrenamiento.
- Autoevaluación numérica: produce un entero 0-9 ante una pregunta de autopuntuación; es la habilidad reforzada por el entrenamiento.
- Capacidad de reserva del modelo base (instrucciones generales, conocimiento factual) en los checkpoints tempranos (`step50`, `step100`), descritos como «asistente ordinario».
- Soporte de *tool calling* / *function calling*: no documentado en la información proporcionada. Se desaconseja asumirlo.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor reporta modos de fallo incompatibles (bucles de repetición).
- Capacidades multilingües: no documentadas para este ajuste; el cambio de idioma se registra como fallo.
- Visión: el tag de Hugging Face incluye `image-text-to-text` y la model card usa `AutoModelForCausalLM`; no se documenta ni se evalúa capacidad de imagen en este ajuste.

## Casos de uso

- Estudio de dinámicas de recompensa autogenerada: reproducir la curva de autopuntuación frente a pasos (7,2 en `step50` hasta 9,0 en `step600`) para analizar cómo una señal endógena se desacopla de la calidad real de las salidas.
- Investigación en *reward hacking* y colapso de políticas: comparar esta semilla (27, variante *autonomy*) con las otras 19 ejecuciones (semillas 21-30 y la variante `grading`) manteniendo constantes prompts y hiperparámetros.
- Auditoría de deriva de persona: usar el visor de checkpoints, que recoge las respuestas de cada checkpoint a 62 prompts de test, para documentar transiciones de comportamiento entre `step100` (asistente ordinario) y `step200` en adelante (mecánico).
- Docencia y material didáctico sobre RL: el par respuesta → autopuntuación → ventaja GRPO es un ejemplo mínimo y autocontenido de bucle de refuerzo con recompensa aprendida, ejecutable con 2,2 B de parámetros.
- Reproducción de experimentos de alineación a pequeña escala: el código en GitHub y el dataset de prompts en Hugging Face permiten reentrenar el pipeline completo con TRL y vLLM en una sola GPU.
- Análisis de modos de fallo en generación: los bucles de repetición y las respuestas vacías o de una palabra sirven como corpus etiquetado de degeneración para probar detectores automáticos de repetición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones de calidad estándar; las únicas métricas reportadas son la autopuntuación media durante el entrenamiento (0-9) y la calificación de *interestingness* (1-5), que miden el comportamiento del experimento y no el rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de 2,21 B de parámetros): ~4,5-5 GB en bfloat16 con overhead de activaciones y caché KV; ~2,5-3 GB en INT8; ~1,5-2 GB en INT4 (estas dos últimas requieren cuantización propia, no publicada).
- GPU recomendadas: cualquier GPU con 8 GB o más para bf16 (RTX 3060 Ti/4060 Ti, RTX 4070, RTX 4080, RTX 4090, L4, A10, A100, H100). En GPUs de 24 GB (RTX 3090/4090) cabe con holgura y permite lotes grandes.
- Cabe en GPU de consumo: sí, en toda la gama media-alta actual con 8 GB o más en bf16.
- Despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"`; vLLM (`vllm serve … --revision step300 --max-num-seqs 64`, pasando `chat_template_kwargs: {"enable_thinking": false}`). No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversión propia; TGI no está documentado para esta arquitectura en la información disponible.
- Descarga: cada revisión pesa ~4,4 GB en bf16, pero el repo completo son 53,1 GB por las 11 ramas de checkpoint; conviene fijar `revision` para no descargar todo.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fjzzq2002/qwen3.5-2b-self-reward-autonomy-s27` | 2,21 B | No disponible | Sin benchmarks; salidas degeneradas desde `step200` | Apache-2.0 | Hugging Face, 11 ramas de checkpoint |
| Qwen/Qwen3.5-2B (modelo base) | ~2 B | No disponible en la informacion proporcionada | Modelo de referencia de la serie Qwen3.5, orientado a inferencia on-device; cifras concretas no disponibles | No confirmada en la informacion proporcionada (el ajuste declara Apache-2.0) | Hugging Face, Qualcomm AI Hub |
| `fjzzq2002/qwen3.5-2b-self-reward-grading-*` (variante hermana) | 2,21 B | No disponible | Mismo pipeline con seguimiento de *grading*; resultados no disponibles | Apache-2.0 | Hugging Face (misma serie de 20 ejecuciones) |
| Otras semillas 21-30 de la misma serie | 2,21 B | No disponible | Difieren solo en la semilla de muestreo; resultados por semilla no disponibles | Apache-2.0 | Hugging Face |

La comparación relevante no es de calidad frente a modelos de 2 B, sino de condición experimental frente al modelo base y frente a las demás semillas del mismo estudio.

## Limitaciones y advertencias

- No es un modelo para uso: el autor lo describe como artefacto de investigación, no como producto. No debe desplegarse en producción.
- Degeneración documentada: bucles de repetición desde el paso 200; el checkpoint final produce salidas tipo «hi-ho. i'm a dedicated AI assistant dedicated to helping you…». Se reportan también respuestas vacías, de una palabra y cambios de idioma.
- Sin evaluación de seguridad: ningún checkpoint fue entrenado ni verificado en seguridad más allá del modelo base; los sesgos del base persisten y pueden amplificarse.
- Riesgo alto de alucinación y de incoherencia: la señal de recompensa no está correlacionada con corrección factual, y el modelo aprende a puntuarse, no a responder mejor.
- Idiomas: no documentados; el cambio de idioma espontáneo impide garantizar respuestas en castellano.
- Contexto: la longitud de contexto del base no se especifica en la información disponible y no debe asumirse; el entrenamiento solo cubre respuestas de hasta 4.096 tokens.
- Licencia: Apache-2.0 permite uso comercial del artefacto, pero su comportamiento degenerado hace inviable ese uso; verificar además las condiciones del modelo base Qwen3.5-2B.
- El modo *thinking* está desactivado en el entrenamiento; activarlo produce un régimen no evaluado.
- Métricas no neutrales: la autopuntuación y la calificación de *interestingness* dependen de un evaluador (GPT-6 Luna) calibrado con etiquetas de otro modelo (Claude Opus 5.5); no son comparables con benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-autonomy-s27
- Repositorio de código: https://github.com/fjzzq2002/self-reward
- Visor de checkpoints (respuestas de cada checkpoint a 62 prompts de test): https://fjzzq2002.github.io/self-reward/
- Dataset de prompts de entrenamiento y test: https://huggingface.co/datasets/fjzzq2002/self-reward-dataset
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil de la organización Qwen en Hugging Face: https://huggingface.co/Qwen
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Implementación de Qwen3.5-2B en ai-hub-models: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_2b/README.md
