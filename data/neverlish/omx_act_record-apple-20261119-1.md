# neverlish/omx_act_record-apple-20261119-1

## Resumen

`neverlish/omx_act_record-apple-20261119-1` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot sobre el dataset `neverlish/record-apple-20261109-1`. ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error compuesto y mejora la estabilidad en tareas de manipulación robótica. El modelo está pensado para controlar un robot tipo `so100_follower` en una tarea concreta de recogida de manzanas, según se deduce del nombre del dataset y de los comandos de evaluación de la model card.

El checkpoint tiene 51.668.614 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. La arquitectura es un transformer codificador-decodificador con codificación posicional y una cabeza de predicción de chunks de acciones, tal como define el paper original de ACT. No se trata de un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que mapea observaciones visuales y propioceptivas a comandos motores.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de LeRobot (entrenamiento, publicación en el Hub y evaluación con `lerobot-record`) para una tarea de manipulación concreta. Para desarrolladores e investigadores que trabajan en robótica de imitación con hardware asequible (SO-100/SO-101), este tipo de checkpoint demuestra el flujo de trabajo de extremo a extremo y sirve como punto de partida para reentrenar sobre datasets propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer codificador-decodificador para políticas de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de observación depende de la configuración de la política y del dataset) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de robótica, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | neverlish/record-apple-20261109-1 |
| Tamano del repo | 0,2 GB |
| Fecha de creacion | 2026-11-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en lugar de predecir una única acción por paso de tiempo, el modelo emite un bloque de k acciones futuras, lo que mitiga el problema de la acumulación de errores en políticas autoregresivas paso a paso. La arquitectura del paper original incluye un codificador visual (típicamente ResNet) para procesar las imágenes de las cámaras, un codificador de estado propioceptivo y un transformer que fusiona ambas modalidades para producir los chunks de acción. El entrenamiento se realiza por comportamiento clonado sobre datos de teleoperación.

En este caso concreto, el entrenamiento se ha ejecutado con LeRobot sobre el dataset `neverlish/record-apple-20261109-1`, que presumiblemente contiene episodios de teleoperación de una tarea de recogida de manzanas con un robot `so100_follower`. La model card no detalla el número de episodios, la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO (no aplicables en este contexto). Tampoco se especifican hiperparámetros como el tamaño del chunk, la resolución de las cámaras o la frecuencia de control. Toda esta información se considera no disponible.

## Capacidades

- Control robótico por imitación: genera comandos motores para un robot `so100_follower` a partir de observaciones visuales y propioceptivas.
- Predicción por chunks de acciones: emite bloques de acciones futuras en lugar de pasos individuales, lo que mejora la estabilidad del control.
- Ejecución de una tarea específica: recogida de manzanas, según el dataset de entrenamiento (`record-apple`).
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación con `lerobot-record` y publicación en el Hub.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso simbólico ni agentes conversacionales.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la percepción visual propia del control robótico.

## Casos de uso

- Replicación de la tarea de recogida de manzanas: desplegar la política sobre un `so100_follower` con `lerobot-record --policy.path=neverlish/omx_act_record-apple-20261119-1` para evaluar la tasa de éxito en 10 episodios, tal como indica la model card.
- Punto de partida para fine-tuning: reentrenar la política sobre un dataset propio de otra tarea de manipulación usando `lerobot-train --policy.type=act`, aprovechando que el checkpoint ya está en el formato esperado por LeRobot.
- Validación de pipelines de LeRobot: usar este checkpoint como referencia para comprobar que la instalación de LeRobot, los drivers del robot y la configuración de cámaras funcionan correctamente antes de entrenar modelos propios.
- Docencia e investigación en imitación: emplear el modelo como ejemplo reproducible de comportamiento clonado con ACT en un robot de bajo coste, comparando tasas de éxito con y sin chunks de acción.
- Benchmark interno de infraestructura: medir latencia de inferencia y throughput de la política en distintas GPUs para dimensionar el hardware de un despliegue real de robótica.
- Prototipado de automatización de recogida: integrar la política en una celda de picking sencilla para estimar viabilidad antes de invertir en un sistema de percepción y planificación más complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros en safetensors (aproximadamente 0,2 GB en fp32), la política cabe holgadamente en cualquier GPU consumer con 4 GB o más; en fp16 ocuparía en torno a 0,1 GB solo de pesos, aunque el consumo real depende de los buffers del codificador visual y del tamaño del batch.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; para inferencia en tiempo real de un solo robot, una GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también es plausible su ejecución en CPU para evaluación offline, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; dependen del hardware, de la resolución de las cámaras y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neverlish/omx_act_record-apple-20261119-1 | 51,7 M | no aplica | Recogida de manzanas con so100_follower | apache-2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | variable | no aplica | Manipulación diversa | apache-2.0 (segun repo) | Hugging Face |
| Políticas Diffusion Policy | variable | no aplica | Manipulación diversa | variable | Hugging Face |
| Políticas VLA (p. ej. OpenVLA) | miles de millones | limitado | Manipulación generalista | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (recogida de manzanas) y un único robot (`so100_follower`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin datos de evaluación publicados: no hay tasas de éxito, curvas de aprendizaje ni métricas de robustez en la model card, por lo que no es posible estimar su fiabilidad en producción.
- Sesgos del dataset: al entrenarse solo con teleoperación de un operador y un entorno concreto, hereda los sesgos de iluminación, posición de cámara y condiciones físicas del dataset `record-apple-20261109-1`.
- Riesgo de fallo silencioso: en robótica, una política de imitación puede ejecutar acciones erróneas sin señal de error; se recomienda supervisión humana y paradas de seguridad.
- Limitaciones de contexto e idioma: no aplica el concepto de contexto lingüístico ni de idiomas; cualquier expectativa de uso conversacional es incorrecta.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar la licencia del dataset de entrenamiento por separado.
- Caveat para producción: la model card no documenta versiones, changelog ni soporte; el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neverlish/omx_act_record-apple-20261119-1
- Dataset de entrenamiento: https://huggingface.co/datasets/neverlish/record-apple-20261109-1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
