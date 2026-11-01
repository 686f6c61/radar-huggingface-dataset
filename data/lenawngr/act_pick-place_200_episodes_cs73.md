# lenawngr/ACT_pick-place_200_episodes_cs73

## Resumen

ACT_pick-place_200_episodes_cs73 es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face sobre el dataset `lenawngr/pick-place_so101`. El modelo resuelve una tarea concreta de manipulación robótica: recoger y colocar objetos (pick-and-place) con un brazo SO-101, aprendiendo directamente de 200 episodios de demostración teleoperada.

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que, en lugar de predecir una acción por paso, predice fragmentos cortos de acciones (action chunks). Esto reduce el error de acumulación y la varianza temporal, y suele traducirse en tasas de éxito altas con datasets modestos. El modelo tiene 51.640.966 parámetros (~51,6 M) y se distribuye en formato safetensors con licencia Apache 2.0.

Es relevante ahora porque ejemplifica el flujo de trabajo de robótica de bajo coste con LeRobot: un brazo SO-101 asequible, un dataset pequeño y un checkpoint listo para ejecutar con `lerobot-record`. No es un modelo de lenguaje ni un modelo generalista: es una política específica de tarea, pensada para reproducir y desplegar en el mismo entorno robótico en el que se recogieron los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.640.966 (~51,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana temporal de observaciones y horizonte de chunk definidos por la configuracion de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, libreria lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visuomotora. El modelo recibe observaciones (imágenes de cámaras y estado de las articulaciones) y predice un chunk de acciones futuras de longitud fija, en lugar de una única acción. Esta predicción por chunks mitiga el problema de la varianza temporal y el error compuesto típico de las políticas paso a paso. La arquitectura incluye un codificador visual, un codificador de estado y un decodificador transformer que genera la secuencia de acciones; el paper original también introduce una técnica de regularización del estilo de acción (CVAE) para capturar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot sobre el dataset `lenawngr/pick-place_so101`, compuesto por 200 episodios de teleoperación en un entorno SO-101. No se dispone de información sobre el número exacto de frames, la composición de cámaras, la resolución de las imágenes, el horizonte de chunk ni los hiperparámetros de entrenamiento (learning rate, batch size, número de épocas). Tampoco se indica si hubo aumentos de datos o validación cruzada. El checkpoint se generó y subió al Hub con la herramienta `lerobot-train`.

## Capacidades

- Control robótico de manipulación: genera comandos de articulaciones para ejecutar la tarea pick-and-place con un brazo SO-101.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de ingeniería de recompensas ni RL.
- Predicción de chunks de acciones, lo que permite movimientos más suaves y coherentes que una política por paso.
- Ejecución en tiempo real mediante `lerobot-record` con el robot `so100_follower`.
- Reproducibilidad del pipeline completo: entrenamiento desde cero con `lerobot-train` y evaluación con `lerobot-record`.
- No soporta tool calling, agentes, razonamiento multi-step, ni capacidades multilingües: es una política específica de tarea.
- No incorpora visión general ni comprensión semántica; usa las imágenes del entorno de entrenamiento como entrada.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger y colocar objetos con el SO-101, reproduciendo el comportamiento aprendido de 200 episodios teleoperados. Es adecuado para validar pipelines de imitación antes de escalar a tareas más complejas.
- Prototipado de robótica de bajo coste: con un brazo SO-101 y un dataset pequeño, un equipo puede desplegar una política funcional sin GPUs de gran tamaño ni infraestructura de RL, gracias a los ~51,6 M de parámetros.
- Docencia y formación: sirve como ejemplo completo del flujo LeRobot (grabar dataset, entrenar, evaluar) en cursos de robótica y aprendizaje por imitación.
- Benchmark interno de referencia: permite comparar nuevas políticas o variaciones de datos contra una línea base conocida en la misma tarea y entorno.
- Investigación en generalización: al variar posiciones de objetos o iluminación, se puede medir la robustez de la política y estudiar técnicas de aumento de datos.
- Integración en pipelines de evaluación automatizada: el comando `lerobot-record` con `--episodes=10` facilita ejecutar evaluaciones repetibles y calcular tasas de éxito de forma sistemática.
- Base para fine-tuning en tareas relacionadas: el checkpoint puede servir de inicialización para otras tareas de manipulación con el mismo robot, reduciendo el número de demostraciones necesarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~51,6 M de parámetros, el modelo es muy pequeño y cabe holgadamente en GPUs de consumo (estimación orientativa: menos de 1 GB en fp32, sin contar buffers de imágenes).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente; una RTX 3060 o superior es más que adecuada. Para entrenamiento, se recomienda una GPU con al menos 8-12 GB de VRAM, aunque no se dispone de cifras oficiales.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño del modelo y del repo (0,2 GB).
- Opciones de despliegue: LeRobot (`lerobot-record` para inferencia, `lerobot-train` para entrenamiento), con soporte de `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Dependen del hardware, de la frecuencia de control del robot y del número de cámaras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_pick-place_200_episodes_cs73 | ~51,6 M | no aplica | Pick-and-place SO-101 | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper arXiv:2304.13705) | no disponible | no aplica | Manipulación con ALOHA | no disponible | Paper y código de referencia |
| Políticas LeRobot de la comunidad (p. ej. Diffusion Policy) | variable | no aplica | Manipulación con SO-100/SO-101 | variable (habitualmente Apache 2.0) | Hugging Face (LeRobot) |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de tarea: solo está entrenado para pick-and-place en el entorno SO-101 del dataset; no generaliza a otras tareas, objetos o robots sin reentrenamiento o fine-tuning.
- Dependencia del entorno: cambios en iluminación, posición de cámara, fondo o tipo de objeto pueden degradar el rendimiento de forma significativa.
- Dataset pequeño: 200 episodios pueden no cubrir toda la variabilidad del entorno real; el riesgo de sobreajuste es real.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí sesgos de demostración (estilos de teleoperación, posiciones recurrentes).
- Riesgo de fallo silencioso: una política de imitación puede ejecutar acciones plausibles pero incorrectas sin señal de error; se recomienda supervisión y paradas de seguridad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece garantía alguna; el autor no documenta condiciones adicionales.
- Falta de documentación: no se detallan hiperparámetros, composición del dataset, número de frames ni métricas de éxito, lo que dificulta la reproducibilidad exacta.
- No apto para producción crítica sin validación: no hay evidencia publicada de robustez ni de tasas de éxito en entornos no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_pick-place_200_episodes_cs73
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/pick-place_so101
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
