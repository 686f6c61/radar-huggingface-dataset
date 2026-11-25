# Layton42/act_policy

## Resumen

Layton42/act_policy es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un controlador visomotor que predice fragmentos de acción (action chunks) para un robot manipulador de tipo `so102_follower` equipado con una única cámara de muñeca (`cam_wrist`). El modelo consume el estado articular de 7 dimensiones y una imagen RGB de 480x640, y produce una acción de 7 dimensiones por paso.

Lo desarrolla el usuario Layton42 y está empaquetado con LeRobot 0.6.0, la librería de Hugging Face para aprendizaje por imitación en robótica real. La tarea concreta es "Pick up the cube and place it on the plate", aprendida a partir de 35 episodios de teleoperación (29.612 fotogramas a 30 FPS). El modelo tiene 51.670.663 parámetros y un repositorio de 0,2 GB en formato safetensors.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de imitación (grabación, entrenamiento y despliegue) sobre hardware asequible tipo SO-102, y como referencia para quien quiera entrenar políticas ACT propias con LeRobot. No está pensado para uso general ni para tareas distintas de la entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones con chunking |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de un solo paso más chunk de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un chunk de acciones futuras. La arquitectura combina un backbone visual (encoder de imágenes) con un transformer que fusiona la observación visual y el estado propioceptivo, y un decodificador que emite la secuencia de acciones. El chunking mitiga el problema de la varianza en datos de teleoperación y mejora la estabilidad del control. El modelo concreto usa una única cámara de muñeca, estado de 7 dimensiones (típico de un brazo de 6 grados de libertad más pinza) y acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 durante 50.000 pasos, batch de 16, optimizador AdamW y learning rate 1e-5, con semilla 1000. El dataset contiene 35 episodios y 29.612 fotogramas a 30 FPS de la tarea "Pick up the cube and place it on the plate". No se documenta composición adicional del dataset, aumentos de datos ni fases de RLHF/DPO (no aplicables en este paradigma). Tampoco se especifica la configuración exacta de capas, dimensión de embedding ni tamaño del chunk de acción.

## Capacidades

- Control visomotor de un brazo robótico `so102_follower` con una cámara de muñeca.
- Predicción de chunks de acción de 7 dimensiones a partir de estado de 7 dimensiones e imagen 3x480x640.
- Ejecución de una tarea concreta de pick-and-place: coger un cubo y colocarlo en un plato.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa explícita).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, multilingüismo ni modalidades de audio o vídeo más allá de la cámara de muñeca.

## Casos de uso

- Reproducción de la tarea pick-and-place: desplegar la política con `lerobot-rollout` sobre un SO-102 con cámara de muñeca para recoger un cubo y dejarlo en un plato, como banco de pruebas de un pipeline de imitación completo.
- Base para fine-tuning con datos propios: usar el checkpoint como inicialización y reentrenar con `lerobot-train` sobre un dataset nuevo, útil cuando se dispone de pocas demostraciones y se quiere partir de una política ya entrenada en manipulación.
- Docencia y formación en robótica de imitación: ejemplo reproducible de extremo a extremo (grabación, entrenamiento, despliegue) con hardware de bajo coste y 35 episodios, adecuado para cursos y talleres.
- Validación de hardware y calibración: ejecutar la política para comprobar que la cinemática del brazo, la cámara y la frecuencia de 30 FPS funcionan correctamente antes de abordar tareas más complejas.
- Benchmark interno de métodos de imitación: comparar ACT frente a otras políticas de LeRobot (p. ej. Diffusion Policy o VQ-BeT) sobre la misma tarea y dataset para evaluar tasas de éxito relativas.
- Prototipado de automatización de laboratorio: adaptar la tarea a la manipulación de piezas pequeñas en entornos controlados donde el pick-and-place sea representativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de trials/successes vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 51,7 M de parámetros y pesos en safetensors, la huella es reducida (del orden de cientos de MB en FP32), pero no se documenta el consumo real.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica GPU compatible con CUDA; no se especifica modelo concreto.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, pero no se confirma en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles. El control opera a 30 FPS según la frecuencia del dataset, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Paradigma | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Layton42/act_policy | ACT (chunking de acciones) | 51,7 M | Estado 7D + imagen 3x480x640 | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (referencia LeRobot) | Difusión de acciones | no disponible | Estado + imagen | no disponible | LeRobot |
| VQ-BeT (referencia LeRobot) | Tokenización discreta de acciones | no disponible | Estado + imagen | no disponible | LeRobot |
| Otras políticas ACT en LeRobot Hub | ACT | variable según checkpoint | Estado + imagen | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita al paradigma y a la disponibilidad.

## Limitaciones y advertencias

- Entrenada para una única tarea ("Pick up the cube and place it on the plate") y un único robot (`so102_follower`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Depende de una única cámara de muñeca (`cam_wrist`); cambios de iluminación, posición de cámara o fondo pueden degradar el rendimiento.
- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en robot.
- Dataset pequeño (35 episodios, 29.612 fotogramas), lo que aumenta el riesgo de sobreajuste y de baja robustez ante variaciones.
- Sin capacidades de lenguaje, razonamiento ni tool calling; no es un modelo de propósito general.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- No se documentan sesgos, cuantizaciones ni límites de contexto porque no aplican al paradigma; cualquier despliegue debe replicar la configuración de observación exacta (claves, formas y FPS).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Layton42/act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Layton42/TASK_NAME
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
