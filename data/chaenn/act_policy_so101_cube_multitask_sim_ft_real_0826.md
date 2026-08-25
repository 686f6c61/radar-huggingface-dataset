# Chaenn/act_policy_so101_cube_multitask_sim_ft_real_0826

## Resumen

El modelo `act_policy_so101_cube_multitask_sim_ft_real_0826` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), desarrollada por el usuario Chaenn y publicada bajo la librería LeRobot de HuggingFace. Está diseñada específicamente para controlar un brazo robótico SO-101 en tareas de manipulación de cubos, y ha sido entrenada mediante una combinación de datos de simulación y datos reales (sim-to-real), como sugiere su nombre. El modelo predice secuencias de acciones (action chunks) en lugar de acciones individuales, lo que permite movimientos más suaves y estables.

Con 51,67 millones de parámetros, es un modelo relativamente compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en que demuestra un flujo completo de entrenamiento de políticas robóticas con LeRobot, desde la recolección de datos por teleoperación hasta la transferencia sim-to-real, un área de creciente interés en la robótica de bajo coste. El modelo se publica bajo licencia Apache-2.0, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer para predecir secuencias de acciones de longitud fija (action chunks) en lugar de predecir una sola acción por paso de tiempo. Esta técnica reduce los errores de acumulación y mejora la estabilidad del control en tareas de manipulación. El modelo está entrenado con datos de teleoperación, en este caso procedentes del dataset `Chaenn/so101_cube_multitask_hil_0724_merged_fixed`, que combina episodios de simulación y reales.

El entrenamiento se realizó con la librería LeRobot de Hugging Face, que proporciona un pipeline completo para el entrenamiento de políticas robóticas, incluyendo la recolección de datos, el entrenamiento y la evaluación. El nombre del modelo indica que se realizó un fine-tuning sobre un modelo previamente entrenado en simulación (sim) con datos reales (real), lo que constituye una estrategia típica de transferencia sim-to-real. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico de un brazo SO-101 para tareas de manipulación de cubos (pick-and-place, reordenamiento).
- Predicción de secuencias de acciones (action chunking) para movimientos suaves y coordinados.
- Integración con el ecosistema LeRobot: compatible con el entrenamiento, evaluación y despliegue mediante los comandos `lerobot-train`, `lerobot-record` y `lerobot-eval`.
- Transferencia sim-to-real: el modelo ha sido entrenado con datos de simulación y fine-tuned con datos reales, lo que le permite operar en el mundo físico.
- Capacidad de operar con el robot SO-101 (follower) mediante teleoperación y control autónomo.

## Casos de uso

- **Manipulación de objetos en entornos industriales**: el modelo puede controlar un brazo robótico SO-101 para tareas de recogida y colocación de piezas (pick-and-place) en líneas de montaje, gracias a su capacidad de acción en secuencia.
- **Robótica educativa e investigación**: al ser un modelo compacto y con licencia Apache-2.0, es ideal para laboratorios universitarios que estudian aprendizaje por imitación y transferencia sim-to-real con hardware de bajo coste.
- **Automatización de laboratorios**: el SO-101 puede utilizarse para automatizar tareas de manipulación de viales o tubos de ensayo, como se muestra en el workshop de NVIDIA Isaac Sim, reduciendo el trabajo manual repetitivo.
- **Desarrollo de políticas robóticas personalizadas**: los desarrolladores pueden usar este modelo como punto de partida para fine-tune en nuevas tareas de manipulación, gracias a la compatibilidad con LeRobot.
- **Validación de algoritmos de control**: permite comparar el rendimiento de ACT frente a otros métodos de aprendizaje por imitación en un hardware real y de bajo coste.
- **Demos y prototipos**: ideal para demostraciones de robótica en ferias o eventos, donde se requiere una manipulación rápida y fiable de objetos sin un entrenamiento extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de tasas de éxito, precisión ni comparaciones con otros modelos en la model card ni en los resultados de búsqueda web. Se recomienda consultar el repositorio del autor para futuras publicaciones.

## Requisitos de hardware

- **VRAM estimada**: con 51,67 millones de parámetros en fp32, el modelo ocupa aproximadamente 207 MB. Con cuantización a fp16, unos 103 MB. La VRAM necesaria es mínima, inferior a 1 GB.
- **GPUs recomendadas**: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente (por ejemplo, RTX 2060, GTX 1660 Ti, RTX 3060). También puede ejecutarse en CPU para inferencia en tiempo real, aunque con menor velocidad.
- **Despliegue**: el modelo está diseñado para funcionar con el stack de LeRobot, que soporta ejecución en GPU (CUDA) y CPU. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible. La latencia dependerá del hardware y del número de acciones en el chunk, pero para un modelo de este tamaño se espera una inferencia en el orden de milisegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| `act_policy_so101_cube_multitask_sim_ft_real_0826` (este) | 51,67 M | No disponible | Sim-to-real (sim + fine-tune real) | Apache-2.0 |
| `act_policy_so101_cube_multitask_real_sim_0824` | No disponible | No disponible | Sim-to-real (combinación real+sim) | Apache-2.0 |
| `act_policy_so101_cube_multitask_0710` | No disponible | No disponible | Solo simulación | Apache-2.0 |

Los tres modelos son del mismo autor y comparten la misma arquitectura ACT y el mismo robot SO-101. La diferencia principal es la estrategia de entrenamiento: el modelo `0710` parece entrenado solo en simulación, mientras que `0824` y `0826` combinan simulación y datos reales. No se dispone de datos de rendimiento comparativo entre ellos. Existen otros modelos ACT para SO-101 en la comunidad, pero no se dispone de datos comparables en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos del dataset**: el modelo se entrena con datos de teleoperación que pueden reflejar los sesgos del operador humano, como movimientos preferidos o velocidades específicas.
- **Riesgo de alucinación**: al ser un modelo de control motor, el riesgo de "alucinación" se traduce en acciones inesperadas o erróneas en el robot físico. Es recomendable validar siempre el comportamiento en un entorno seguro antes del despliegue.
- **Limitaciones de contexto**: no se dispone de información sobre la longitud de contexto o si el modelo incorpora observaciones de visión. La model card no especifica si se usan cámaras o sensores.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero es obligatorio incluir el aviso de copyright y la licencia en distribuciones derivadas.
- **Caveat para producción**: el modelo está diseñado para el robot SO-101 y puede no generalizar a otros robots sin reentrenamiento. La robustez en entornos no vistos no está documentada.
- **Dependencia del hardware**: el rendimiento depende de la calibración del robot y de la calidad de los datos de teleoperación; un robot mal calibrado puede degradar el comportamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_sim_ft_real_0826)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [GitHub LeRobot](https://github.com/huggingface/lerobot)
- [Workshop Sim-to-Real SO-101 (NVIDIA Isaac)](https://github.com/isaac-sim/Sim-to-Real-SO-101-Workshop)
- [Documentación oficial del workshop](https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html)
- [Repositorio so101-act-policy (ejemplo de pipeline)](https://github.com/Jaskaran3010/so101-act-policy)
