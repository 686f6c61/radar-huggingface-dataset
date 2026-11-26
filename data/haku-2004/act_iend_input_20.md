# Haku-2004/act_iend_input_20

## Resumen

`act_iend_input_20` es una política de robótica entrenada mediante el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario Haku-2004 en Hugging Face bajo la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robótica, y se ha entrenado sobre el dataset `Haku-2004/i_4seg`.

El modelo resuelve el problema del control robótico de manipulación a partir de demostraciones teleoperadas: en lugar de aprender una política que emita una acción por paso de tiempo, ACT predice secuencias de acciones de forma conjunta, lo que reduce el error de composición y mejora la estabilidad del control. Es relevante para quien trabaja en robótica de bajo coste con LeRobot, ya que permite reproducir el pipeline completo de entrenamiento y evaluación con pocos comandos.

La ficha se basa exclusivamente en los metadatos del repositorio y en la model card del autor. No hay información publicada sobre composición del dataset, hiperparámetros de entrenamiento ni resultados de evaluación, por lo que varios campos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de política robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura se basa en un transformer que, a partir de observaciones (típicamente imágenes de cámara y estado de las articulaciones), predice un chunk de acciones futuras en lugar de una sola acción. Esta formulación reduce el horizonte efectivo de decisión y mitiga el problema de acumulación de errores típico de las políticas paso a paso. El modelo tiene 51.671.174 parámetros y se distribuye en safetensors dentro del ecosistema LeRobot.

Según la model card, la política se ha entrenado con datos teleoperados del dataset `Haku-2004/i_4seg` mediante el comando `lerobot-train` con `--policy.type=act`. No se especifican el número de episodios, la composición del dataset, el número de tokens o muestras vistas, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de imitación). Tampoco se detalla la configuración de aumentos de datos ni el esquema de observaciones (número de cámaras, resolución, frecuencia de control).

## Capacidades

- Control robótico de manipulación mediante aprendizaje por imitación a partir de demostraciones teleoperadas.
- Predicción de chunks de acciones, lo que permite secuencias de movimiento más coherentes que las políticas de acción única.
- Integración nativa con el pipeline de LeRobot: entrenamiento con `lerobot-train` y evaluación/inferencia con `lerobot-record`.
- Ejecución sobre robots compatibles con LeRobot, como el `so100_follower` citado en la model card.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling ni agentes multi-paso.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, etc.).

## Casos de uso

- Manipulación de objetos con un brazo robótico de bajo coste: el modelo se carga con `--policy.path` en `lerobot-record` y ejecuta la política entrenada sobre el robot `so100_follower` para tareas de pick-and-place aprendidas por imitación.
- Reproducción de experimentos de investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar ACT frente a otras políticas de LeRobot sobre el mismo dataset.
- Evaluación de un dataset propio de teleoperación: se puede reentrenar la política con `lerobot-train` sobre `Haku-2004/i_4seg` o sobre un dataset equivalente y usar este modelo como línea base.
- Prototipado rápido en laboratorio: al tener 51,7 M de parámetros y un repo de 0,2 GB, el checkpoint es ligero y fácil de mover entre máquinas de experimentación.
- Docencia y formación en robótica: el pipeline completo (entrenamiento, evaluación con `--episodes=10`, registro de episodios con prefijo `eval_`) es reproducible con comandos documentados.
- Integración en flujos de validación de políticas: el modelo puede actuar como política candidata en una batería de evaluación estandarizada de LeRobot antes de desplegar una política entrenada con más datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,7 M de parámetros, el checkpoint en precisión completa ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna; el consumo real dependerá de los tensores de observación (imágenes) y del tamaño del batch.
- GPU recomendadas: no disponible en la documentación. Por tamaño, una RTX 3060 o superior es suficiente para inferencia; para entrenamiento se recomienda al menos una GPU con 8-12 GB de VRAM, aunque el autor no lo especifica.
- Cabe en GPU consumer: sí, por el tamaño del modelo; no hay requisitos oficiales publicados.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado por el autor. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_iend_input_20` | 51.671.174 | no disponible | Política ACT para robótica (LeRobot) | apache-2.0 | Hugging Face |
| Otras políticas ACT en LeRobot | no disponible | no disponible | Política ACT para robótica | variable | Hugging Face |
| Políticas diffusion policy en LeRobot | no disponible | no disponible | Política de imitación para robótica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre este checkpoint y otras políticas de LeRobot en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito de la política en el robot objetivo.
- El modelo está entrenado sobre un dataset concreto (`Haku-2004/i_4seg`); su generalización a otras tareas, objetos, cámaras o robots no está documentada.
- Sesgos conocidos: no disponibles. En aprendizaje por imitación, la política hereda los sesgos y la distribución de las demostraciones teleoperadas, lo que puede limitar su comportamiento fuera de esa distribución.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; es una política robótica, no un modelo de lenguaje.
- Licencia apache-2.0: permite uso comercial y modificación, pero conviene revisar las dependencias de LeRobot y del dataset utilizado.
- Caveat para producción: al no haber benchmarks ni documentación de seguridad, no se recomienda desplegar en entornos físicos sin una validación exhaustiva previa y mecanismos de parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_iend_input_20
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_4seg
