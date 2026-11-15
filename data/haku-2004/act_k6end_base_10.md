# Haku-2004/act_k6end_base_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación orientado a robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k6end_base_10`, es una política entrenada con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939` y publicada en Hugging Face con licencia Apache 2.0.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la franja de políticas ligeras aptas para inferencia en tiempo real sobre hardware de consumo. No es un modelo de lenguaje: su pipeline es `robotics` y su salida son acciones de control para un robot, no texto.

Su relevancia radica en que ejemplifica el flujo actual de LeRobot: entrenamiento reproducible desde un dataset de teleoperación, evaluación con `lerobot-record` y despliegue sobre brazos tipo SO-100/SO-101. No obstante, al tratarse de un checkpoint con 0 descargas y 0 likes, publicado el 15 de noviembre de 2026, no hay evidencia pública de validación externa ni de rendimiento en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder-decodificador para action chunking (ACT, paper arXiv:2304.13705) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; la ventana la define la observación y el horizonte de chunk, no especificados en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT emplea un transformer con un encoder que procesa las observaciones (típicamente imágenes de cámaras y estado de las articulaciones) y un decoder que genera un chunk de acciones futuras de forma conjunta. Esta predicción por chunks, en lugar de paso a paso, mitiga el problema de la acumulación de errores en políticas de imitación y permite un control más suave. La arquitectura incorpora habitualmente un mecanismo de querying estilo CVAE para modelar la variabilidad de las demostraciones humanas, aunque la model card no detalla la configuración concreta de esta instancia.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, presumiblemente compuesto por episodios de teleoperación. La model card no especifica el número de episodios, horas de datos, composición del dataset, ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se documenta el robot objetivo ni la tarea concreta, más allá del nombre del dataset.

## Capacidades

- Generación de chunks de acciones para control robótico de manipulación a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Ejecución de políticas entrenadas con LeRobot mediante `lerobot-record` y `--policy.path`.
- Compatibilidad con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación.
- No soporta tool calling, function calling, agentes conversacionales ni razonamiento multi-step en el sentido de los LLM.
- No dispone de capacidades multilingües, visión general, audio ni thinking mode.
- Capacidad especial: predicción de acciones en bloque (action chunking) que reduce el error de composición.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política puede ejecutar tareas de pick-and-place sobre un brazo SO-100/SO-101, aprovechando la predicción por chunks para suavizar trayectorias y reducir el temblor en el control.
- Investigación en aprendizaje por imitación: sirve como checkpoint base para comparar variantes de ACT, ajustar hiperparámetros o evaluar el efecto del tamaño del dataset en la tasa de éxito.
- Reentrenamiento con datos propios: el flujo `lerobot-train --policy.type=act` permite partir de esta configuración y sustituir el dataset por uno propio, útil para equipos que quieren una línea base reproducible.
- Evaluación de políticas en simulación o en robot real: con `lerobot-record` y `--episodes=10` se puede medir la tasa de éxito de forma estandarizada antes de desplegar.
- Prototipado rápido de tareas de ensamblaje o clasificación de objetos: al ser un modelo ligero (51,7 M de parámetros, 0,2 GB), cabe en GPUs de consumo y permite iterar en local sin infraestructura dedicada.
- Docencia y formación en robótica: el par dataset + política + comandos de LeRobot constituye un ejemplo completo y de bajo coste del ciclo de vida de una política de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en precisión completa (FP32) el peso ronda los 0,2 GB, por lo que la VRAM necesaria es muy reducida (del orden de 1-2 GB incluyendo buffers de inferencia, estimación orientativa).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, incluidas GTX 1660, RTX 3060, RTX 4090; también es viable en CPU para inferencia de baja frecuencia.
- Cabe en GPU de consumo: sí, con margen amplio.
- Opciones de despliegue: LeRobot (`lerobot-record`), con soporte de `--policy.device=cuda`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k6end_base_10` | 51.668.614 | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| ACT original (paper arXiv:2304.13705) | no disponible en la información proporcionada | no disponible | reportado en el paper, no disponible aquí | no disponible | paper |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Otras políticas LeRobot (p. ej. `lerobot/act_*`) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo con el dataset `Haku-2004/k6_20_20261113_173939`, la política hereda los sesgos de las demostraciones (posiciones, objetos, condiciones de iluminación y distribución del operador); no se documenta ninguna mitigación.
- Riesgo de alucinación: en robótica se traduce en acciones fuera de distribución o trayectorias inseguras cuando la observación difiere del dataset de entrenamiento; no hay evaluación publicada de robustez.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto lingüístico; la generalización está acotada a la tarea y al robot del dataset, no especificados en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del dataset de origen por separado.
- Caveats para producción: 0 descargas y 0 likes indican ausencia de validación comunitaria; no hay métricas de tasa de éxito, ni número de episodios de entrenamiento, ni robot objetivo documentado. Antes de desplegar, es necesario evaluar con `lerobot-record` en el hardware real y comprobar la seguridad del espacio de acciones.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k6end_base_10
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
