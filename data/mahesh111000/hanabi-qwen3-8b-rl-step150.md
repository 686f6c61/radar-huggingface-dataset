# Mahesh111000/hanabi-qwen3-8b-rl-step150

## Resumen

El modelo `Mahesh111000/hanabi-qwen3-8b-rl-step150` es un fine-tuning del modelo base `Qwen/Qwen3-8B-Base` (8.190 millones de parámetros) realizado por el autor Mahesh1110 mediante aprendizaje por refuerzo (RL) sobre tareas de seguimiento de estado de creencias (belief-state tracking) y valoración de movimientos (move rating) en el juego cooperativo de cartas Hanabi. Este checkpoint corresponde al paso 150 de entrenamiento de un proyecto de investigación orientado a evaluar la capacidad de los modelos de lenguaje para razonar sobre estados parcialmente observables y cooperar con otros agentes.

El modelo es relevante para la comunidad de investigación en IA porque aborda un problema fundamental: la toma de decisiones en entornos con información imperfecta y coordinación entre agentes. Hanabi es un banco de pruebas estándar en la literatura de aprendizaje por refuerzo multiagente, y este checkpoint explora si un LLM denso de 8B puede aprender a mantener una creencia coherente sobre el estado del juego y seleccionar movimientos óptimos mediante RL, sin recurrir a arquitecturas específicas para juegos.

El modelo mantiene la arquitectura original de Qwen3-8B (36 capas, atención GQA con 32 cabezas de consulta y 8 de clave/valor) y hereda la licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Es un checkpoint de investigación: no está alineado para instrucciones generales ni optimizado para producción, sino para tareas específicas de Hanabi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3-8B) con GQA |
| Parametros totales | 8.190.703.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativo; 131.072 con YaRN |
| Tipos de cuantizacion | no publicado (formato safetensors en fp16; compatible con cuantizaciones de vLLM, llama.cpp, etc.) |
| Idiomas soportados | no disponible (modelo base Qwen3 soporta 100+ idiomas; el fine-tuning no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-8B-Base`, un transformer causal denso de 36 capas con atención de consultas agrupadas (GQA) con 32 cabezas de consulta y 8 de clave/valor, y 6,95 mil millones de parámetros no embebidos. El contexto nativo es de 32.768 tokens, ampliable a 131.072 mediante interpolación YaRN. El modelo base fue preentrenado con una mezcla de datos multilingües y posteriormente alineado con técnicas de post-entrenamiento (RLHF y DPO) para el modo de razonamiento y no razonamiento.

El fine-tuning de este checkpoint se realizó mediante aprendizaje por refuerzo sobre dos tareas complementarias de Hanabi: el seguimiento de creencias (belief-state tracking), que consiste en mantener una distribución de probabilidad sobre las cartas ocultas de los compañeros, y la valoración de movimientos (move rating), que asigna una puntuación a cada acción legal. No se han publicado detalles sobre el algoritmo RL exacto (PPO, GRPO, etc.), el tamaño del dataset de entrenamiento ni la composición de las recompensas en la información disponible. El checkpoint del paso 100 del mismo proyecto reporta una recompensa de validación de 1.3429, pero no se dispone del valor para este paso 150.

## Capacidades

- Razonamiento sobre estados parcialmente observables: mantiene una creencia actualizada sobre las cartas de los demás jugadores en Hanabi.
- Valoración de movimientos: asigna puntuaciones a acciones legales en el juego, lo que permite integrarse en un pipeline de selección de acciones.
- Generación de texto: hereda la capacidad de generación autoregresiva del Qwen3-8B base.
- Soporte de modo thinking: el modelo base incorpora el modo de razonamiento (thinking) de Qwen3, activable mediante el chat template.
- Capacidades multilingües del modelo base: el Qwen3-8B soporta más de 100 idiomas, aunque este checkpoint no documenta su rendimiento multilingüe tras el RL.
- No se ha confirmado soporte de tool calling, agentes generales ni visión en este checkpoint específico.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el modelo sirve como banco de pruebas para estudiar como los LLM pueden aprender políticas cooperativas mediante RL en entornos parcialmente observables.
- Desarrollo de agentes para juegos de cooperacion: puede integrarse en sistemas de juego de Hanabi para generar acciones en partidas con humanos u otros agentes, aprovechando su capacidad de mantener creencias.
- Evaluacion de tecnicas de RL para LLM: permite comparar la eficacia de distintos algoritmos de RL (PPO, GRPO, etc.) sobre un mismo modelo base y una misma tarea.
- Simulacion de comportamiento cooperativo: util para experimentos de teoria de juegos y estudio de coordinacion entre agentes en entornos de informacion imperfecta.
- Generacion de datos sinteticos de partidas: puede usarse para generar trazados de partidas de Hanabi con acciones puntuadas, utiles para entrenar otros modelos o validar heuristicas.
- Educacion e investigacion en IA: como modelo de referencia para cursos y laboratorios que estudien RL, agentes y juegos de informacion imperfecta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto reporta unicamente la recompensa de validacion del checkpoint del paso 100 (0.3429) como mejor valor de validacion en su ejecucion, pero no se ofrece el dato para el paso 150 ni tablas comparativas con otros modelos. Tampoco se han publicado resultados en MMLU, HumanEval, GSM8K ni otras pruebas generales para este checkpoint especifico.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 16,4 GB en fp16, por lo que la inferencia en precision completa requiere aproximadamente 17-18 GB de VRAM (incluyendo sobrecarga de KV cache).
- GPU recomendadas: una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4) es suficiente para fp16. Para cuantizacion 8-bit (~8 GB) basta una GPU de 12-16 GB; para 4-bit (~5 GB) una GPU de 8-10 GB es viable.
- En GPU de consumo: si, cabe en RTX 3090/4090 (24 GB) en fp16, y en GPUs de 8 GB (como RTX 3060) con cuantizacion 4-bit.
- Opciones de despliegue: compatible con vLLM (>=0.8.5), SGLang (>=0.4.6.post1), llama.cpp, Ollama y KTransformers. El modelo base Qwen3 es compatible con el razonamiento en vLLM y SGLang, aunque este checkpoint no garantiza el modo thinking tras el RL.
- Latencia y rendimiento: no disponibles para este checkpoint. Como referencia, el Qwen3-8B en fp16 en una A100 genera aproximadamente 40-60 tokens/s con vLLM, pero no se ha medido en este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hanabi-qwen3-8b-rl-step150 (este) | 8.19B | 32K (131K YaRN) | RL sobre Hanabi (belief + move) | Apache 2.0 | HuggingFace |
| hanabi-qwen3-8b-rl-step100 | 8.19B | 32K (131K YaRN) | RL sobre Hanabi (mejor val, reward 1.3429) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-8B-Base | 8.19B | 32K (131K YaRN) | Preentrenamiento general | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-8B-Instruct | 8.19B | 32K (131K YaRN) | Preentrenamiento + instruct (RLHF/DPO) | Apache 2.0 | HuggingFace |

La comparativa muestra que este checkpoint se diferencia del modelo base e instruct por su especializacion en Hanabi. No hay otros modelos publicamente disponibles en el mismo nicho (LLM entrenado con RL sobre Hanabi) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigacion: no esta alineado para instrucciones generales ni optimizado para conversacion; su uso principal es experimental.
- Especializado en Hanabi: su rendimiento en tareas fuera del dominio del juego no ha sido evaluado y probablemente sea inferior al del modelo base Qwen3-8B.
- Riesgo de alucinacion: al ser un modelo base sin alineamiento instruct, puede generar respuestas incoherentes o incorrectas en contextos generales.
- Sesgos conocidos: no se han documentado sesgos especificos, pero hereda los del modelo base Qwen3-8B, que pueden incluir sesgos culturales y de idioma del corpus de preentrenamiento.
- Contexto y rendimiento: no se ha medido el comportamiento del modelo con ventanas de contexto largas tras el RL; el modo thinking de Qwen3 podria no funcionar correctamente tras el fine-tuning.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de calidad ni soporte para produccion.
- Reproducibilidad: no se publican detalles completos del entrenamiento (dataset exacto, hiperparametros, algoritmo RL), lo que dificulta la reproduccion del experimento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mahesh111000/hanabi-qwen3-8b-rl-step150
- Checkpoint hermano (step 100): https://huggingface.co/Mahesh111000/hanabi-qwen3-8b-rl-step100
- Checkpoint relacionado (step 185): https://huggingface.co/Mahesh111000/qwen3-8b-hanabi-rl-base-1to1-24k-step_185
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Papers citados en las tags del modelo: arxiv:2309.00071 y arxiv:2505.09388 (no se ha podido verificar su contenido en la informacion proporcionada).
