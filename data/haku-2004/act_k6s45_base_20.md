# Haku-2004/act_k6s45_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. Este repositorio concreto, `Haku-2004/act_k6s45_base_20`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, presumiblemente recogido mediante teleoperación.

El modelo cuenta con 51.668.614 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. Está publicado bajo licencia Apache 2.0 y su pipeline es `robotics`, por lo que no es un modelo de lenguaje: su salida son acciones de control para un robot, no texto.

Su relevancia es acotada: se trata de un checkpoint de investigación sin descargas ni interacciones, orientado a reproducir o evaluar una tarea específica de manipulación robótica. Resulta útil como referencia práctica de un pipeline LeRobot completo (entrenamiento, evaluación y despliegue) más que como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un backbone visual (encoder de imágenes), un encoder de estado propioceptivo y un decoder que genera un chunk de acciones futuras de forma conjunta. La predicción por chunks, en lugar de acción a acción, es la innovación central del método: mitiga el problema de la varianza en datos de teleoperación y permite un control más suave y consistente. El entrenamiento es de imitación supervisada sobre episodios teleoperados, sin RLHF ni DPO.

En este caso concreto, la política se ha entrenado con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`. No se dispone de información sobre el número de episodios, la composición del dataset, la resolución de las cámaras, la tasa de control ni la configuración exacta del entrenamiento (número de pasos, batch size, aumentos de datos). Tampoco se documenta si se aplicaron técnicas de regularización específicas o variantes del ACT original.

## Capacidades

- Generación de acciones de control robótico en forma de chunks a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Control de manipuladores tipo SO-100 (la model card muestra ejemplos con `so100_follower`).
- Ejecución de políticas entrenadas end-to-end mediante `lerobot-record` para evaluación o despliegue.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto.
- Sin capacidades multilingües, de visión general o de audio.

## Casos de uso

- Manipulación robótica de laboratorio: reproducción de una tarea concreta (por ejemplo, pick-and-place) aprendida de demostraciones, usando el checkpoint directamente con `lerobot-record` sobre un SO-100.
- Evaluación de pipelines LeRobot: servir como referencia funcional para validar el flujo completo de entrenamiento, registro de episodios y evaluación con `--policy.path`.
- Investigación en aprendizaje por imitación: base para comparar variantes de ACT (número de chunks, arquitectura del encoder) sobre el mismo dataset.
- Prototipado de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, es viable en GPUs de consumo para experimentación en mesa de trabajo.
- Docencia y formación: ejemplo reproducible de entrenamiento de una política visomotora con teleoperación.
- Automatización de tareas repetitivas en entornos controlados: sustitución de secuencias programadas por una política aprendida que tolera pequeñas variaciones de posición de los objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros, ~0,2 GB en fp32), la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM, aunque el consumo real depende de la resolución y número de cámaras de entrada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; una RTX 3060/4060 o superior es suficiente para inferencia en tiempo real en tareas de manipulación simple.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de modelos con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con backend PyTorch/CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6s45_base_20 | 51,7 M | no disponible | ACT (chunking de acciones) | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | variable | no disponible | ACT | Apache 2.0 | Hugging Face |
| Diffusion Policy | no disponible | no disponible | difusión para acciones | habitualmente MIT/Apache 2.0 | Hugging Face / repos de investigación |
| VQ-BeT | no disponible | no disponible | discretización de acciones | no disponible | Hugging Face / repos de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una tarea y un dataset: no generaliza a otras tareas, robots ni entornos sin reentrenamiento.
- Sin información sobre la calidad o diversidad del dataset de entrenamiento; el riesgo de sobreajuste y de fallo ante variaciones de iluminación, posición u objetos es alto.
- No hay métricas publicadas de éxito, por lo que no puede evaluarse su fiabilidad en producción.
- Sin descargas ni validación comunitaria: no hay evidencia externa de que el checkpoint funcione correctamente.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento del robot recae en el integrador; se recomienda supervisión humana y límites de seguridad físicos.
- No apto para tareas de lenguaje, visión general ni razonamiento; cualquier uso fuera de robótica de imitación es inadecuado.
- La fecha de creación del repositorio (2026-11-15) y del dataset asociado deben verificarse antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6s45_base_20
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
