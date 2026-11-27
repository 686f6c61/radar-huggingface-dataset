# mcemri/commenv-task-lab-untrained-start-seed2

## Resumen

`mcemri/commenv-task-lab-untrained-start-seed2` es un checkpoint de investigación derivado de Qwen/Qwen3-4B, publicado por el usuario mcemri en Hugging Face. No es un modelo de propósito general, sino el resultado de un experimento de aprendizaje por refuerzo (GRPO) en el que tres copias del modelo cooperan para resolver una tarea de ajuste de hiperparámetros de una red neuronal pequeña. El objetivo del trabajo es estudiar la comunicación y la coordinación multiagente en modelos de lenguaje, no ofrecer un producto listo para producción.

El escenario de entrenamiento consiste en un tablero compartido donde tres agentes deben proponer, tras seis turnos, la mejor combinación entre 27 configuraciones posibles (tres ajustes con tres valores cada uno), usando resultados reales de barridos de una red FCNet. El modelo parte sin entrenamiento previo en la tarea de puzles y se entrena durante solo 30 pasos con GRPO. Este checkpoint corresponde a la segunda semilla aleatoria (`trainer.seed=43`) del mismo experimento que `mcemri/commenv-task-lab-untrained-start`.

La relevancia es fundamentalmente metodológica: permite reproducir y comparar el efecto de la semilla y del preentrenamiento previo en tareas de puzles sobre el comportamiento cooperativo de equipos de agentes. Los resultados publicados muestran que el modelo entrenado acierta la mejor combinación en el 52 % de 400 rondas reservadas, frente al 7 % del modelo sin entrenar, aunque no aprende a consensuar la respuesta entre agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B) |
| Parametros totales | 4 000 millones (aproximado, segun el modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (carpeta `export/global_step_30/policy`, 8,8 GB); checkpoint del entrenador en 4 shards (22,5 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B. Sobre esa base, el autor aplica un ajuste fino con aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization) durante 30 pasos, partiendo de un modelo sin entrenamiento previo en la tarea de puzles. La tarea de entrenamiento simula un equipo de tres agentes que deben coordinar sus propuestas a través de un tablero compartido durante seis turnos; cada agente debe nombrar la mejor combinación de tres ajustes de una red FCNet, con 27 combinaciones posibles y resultados reales extraídos de tablas de barrido.

El conjunto de entrenamiento incluye tres resultados de partida y tres ejecuciones de entrenamiento por agente. La evaluación se realiza sobre 400 rondas reservadas del mismo dominio y sobre 400 rondas construidas a partir de tablas que el modelo nunca vio (NAS-Bench-201). No se documentan en la información disponible detalles sobre el volumen de tokens, la composición del dataset más allá de esta descripción ni el uso de RLHF o DPO adicionales. La innovación técnica principal es el propio entorno de comunicación multiagente y la comparación controlada entre semillas y entre modelos con y sin preentrenamiento en puzles.

## Capacidades

- Generación de texto y razonamiento dentro del dominio específico de la tarea de ajuste de hiperparámetros (selección de combinaciones sobre un tablero compartido).
- Comunicación multiagente: el modelo está entrenado para operar como una de tres copias que intercambian información a través de un tablero común durante seis turnos.
- Selección de la mejor combinación entre 27 opciones a partir de resultados parciales de barridos de una red FCNet.
- Generalización limitada a tablas de resultados no vistas durante el entrenamiento (NAS-Bench-201), con un 21 % de acierto en la mejor combinación.
- No se documenta soporte de tool calling, function calling, agentes multi-paso generales, visión, audio, modo thinking ni capacidades multilingües más allá de las heredadas del modelo base.

## Casos de uso

- Investigación en comunicación multiagente: el checkpoint sirve para reproducir el experimento `task_lab_s2` y comparar el efecto de la semilla aleatoria frente al primer seed y frente al modelo sin entrenar.
- Estudio de aprendizaje por refuerzo con GRPO: permite analizar cómo evoluciona un modelo de 4 000 millones de parámetros tras solo 30 pasos de RL en una tarea de coordinación.
- Evaluación de generalización fuera de distribución: las 400 rondas de NAS-Bench-201 permiten medir si el modelo transfiere la habilidad de selección a tablas nunca vistas.
- Análisis de consenso y acuerdo entre agentes: el autor documenta que el equipo no aprende a consensuar; este checkpoint es útil para estudiar por qué falla el acuerdo en la mitad de los casos sobre tablas no vistas.
- Reproducibilidad de experimentos: al incluir el checkpoint del entrenador (22,5 GB en 4 shards), se puede continuar el entrenamiento y verificar los resultados publicados.
- Docencia y divulgación: como ejemplo práctico de entorno de comunicación multiagente con recompensas basadas en resultados reales de barridos de hiperparámetros.

## Benchmarks y rendimiento

| Evaluacion | Este checkpoint (seed 2) | Primer seed | Modelo sin entrenar | Modelo con preentrenamiento en puzles (`commenv-task-lab-t2`) |
|---|---|---|---|---|
| 400 rondas reservadas del dominio de entrenamiento (acierto de la mejor combinación) | 52 % | 52 % | 7 % | 60 % |
| 400 rondas de NAS-Bench-201, tablas no vistas (acierto de la mejor combinación) | 21 % | 12 % | 10 % | 45 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 8-9 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica, entre 10 y 12 GB según la longitud de contexto.
- VRAM estimada con cuantización de 8 bits: alrededor de 5-6 GB; con 4 bits, alrededor de 3-4 GB (aunque no se publican variantes cuantizadas oficiales).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: Transformers (formato safetensors con `subfolder="export/global_step_30/policy"`), vLLM y TGI para servir el modelo base Qwen3-4B; llama.cpp y Ollama requerirían convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mcemri/commenv-task-lab-untrained-start-seed2` | ~4 000 M | no disponible | 52 % dominio / 21 % NAS-Bench-201 | Apache-2.0 | Hugging Face |
| `mcemri/commenv-task-lab-untrained-start` (seed 1) | ~4 000 M | no disponible | 52 % dominio / 12 % NAS-Bench-201 | Apache-2.0 | Hugging Face |
| `mcemri/commenv-task-lab-t2` (con preentrenamiento en puzles) | ~4 000 M | no disponible | 60 % dominio / 45 % NAS-Bench-201 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B (modelo base) | ~4 000 M | no disponible | 7 % dominio / 10 % NAS-Bench-201 (sin entrenar en la tarea) | Apache-2.0 | Hugging Face |

La comparativa se limita a los checkpoints del mismo autor y al modelo base, ya que no se dispone de información sobre otros modelos comparables en esta tarea específica de comunicación multiagente.

## Limitaciones y advertencias

- Checkpoint de investigación, no un producto: el autor lo describe explícitamente como "research checkpoints, not a product".
- Entrenamiento muy corto (30 pasos de GRPO) y sin entrenamiento previo en puzles, lo que limita la generalización fuera del dominio.
- El equipo no aprende a consensuar: en las tablas no vistas, aproximadamente la mitad de los agentes responde con el mejor resultado que ha visto el equipo, lo que indica falta de acuerdo.
- Riesgo de alucinación y de respuestas incorrectas fuera del dominio de la tarea de ajuste de hiperparámetros.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe más allá del heredado de Qwen3-4B.
- No se publican variantes cuantizadas (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en entornos con poca VRAM.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción; su uso comercial carece de sentido práctico sin un ajuste adicional.
- El checkpoint del entrenador (22,5 GB) no incluye el archivo `trainer_state.pt`, lo que puede complicar la reanudación exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-task-lab-untrained-start-seed2
- Primer seed del mismo experimento: https://huggingface.co/mcemri/commenv-task-lab-untrained-start
- Modelo con preentrenamiento en puzles: https://huggingface.co/mcemri/commenv-task-lab-t2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
