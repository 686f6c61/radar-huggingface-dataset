# RafaelJaime/act-smartseed-d1-c100-80k

## Resumen

ACT-smartseed-d1-c100-80k es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante LeRobot. El modelo lo desarrolla el usuario RafaelJaime en el contexto del hackathon RobotEkin, con la etiqueta BraboRobots, y resuelve una tarea concreta de manipulación: agarrar una semilla situada bajo la pinza del robot. No es un modelo de lenguaje, sino un controlador visomotor que consume el estado articular y dos imágenes de cámara para producir comandos de acción de 6 dimensiones.

La arquitectura es un transformer ACT que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, una estrategia que reduce el error de acumulación y mejora la estabilidad en tareas de imitación. El modelo tiene 51.668.614 parámetros y se distribuye en safetensors con licencia Apache 2.0. Está entrenado sobre el dataset smartseed-grasp-d1-clean, con 96 episodios y 27.527 fotogramas a 30 FPS, y un total de 80.000 pasos de entrenamiento.

Su relevancia es práctica para quien trabaje con el robot SO-101 (so_follower) y el ecosistema LeRobot: ofrece un punto de partida reproducible para una tarea de grasping con dos cámaras (top y wrist), con configuración de entrenamiento documentada y comandos listos para ejecutar la política en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación visomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política robótica con observaciones por fotograma) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de un único paso, lo que mitiga el error compounding típico de las políticas paso a paso. La política consume `observation.state` de forma (6,), dos imágenes RGB de 3×480×640 (`observation.images.top` y `observation.images.wrist`) y produce una acción de forma (6,). El robot objetivo es `so_follower` (SO-101) con dos cámaras montadas en posición superior y en la muñeca.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset RafaelJaime/smartseed-grasp-d1-clean: 96 episodios, 27.527 fotogramas a 30 FPS, tarea "grasp the seed below the gripper". La configuración reportada es de 80.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documentan detalles sobre aumentos de datos, composición exacta del dataset más allá de los episodios ni uso de RLHF/DPO (no aplica en este paradigma).

## Capacidades

- Control visomotor de grasping: genera comandos de 6 dimensiones para el robot SO-101 a partir de estado articular y dos vistas de cámara.
- Predicción de action chunks: emite secuencias cortas de acciones, lo que aporta suavidad y robustez frente a ruido en las observaciones.
- Percepción multimodal limitada: integra una cámara cenital y una cámara de muñeca, ambas a 640×480 y 30 FPS.
- Ejecución de una única tarea especializada: "grasp the seed below the gripper"; no generaliza a otras tareas sin reentrenamiento.
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Automatización de grasping en línea de laboratorio: la política se ejecuta con `lerobot-rollout` sobre un SO-101 y realiza la tarea de recogida de semillas de forma repetible, adecuada para prototipos de pick-and-place en entornos controlados.
- Base para fine-tuning en tareas de manipulación similares: al estar entrenada con LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset propio de grasping y reutilizar la configuración de 80k pasos como referencia.
- Validación de pipelines de imitación: sirve como caso de referencia para verificar la instalación de LeRobot, la calibración de cámaras y el flujo de teleoperación antes de escalar a tareas más complejas.
- Investigación en aprendizaje por imitación: permite reproducir el método ACT con un dataset pequeño (96 episodios) y comparar curvas de entrenamiento o variantes de aumentos de datos.
- Demostraciones educativas de robótica: útil en talleres y hackathons (contexto RobotEkin) para mostrar el ciclo completo de grabación, entrenamiento y despliegue de una política visomotora.
- Evaluación de robustez frente a cambios de iluminación o posición: al no haber resultados de evaluación publicados, el modelo sirve como banco de pruebas para medir tasas de éxito bajo distintas condiciones experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (número de ensayos, éxitos y tasa de éxito).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y dos flujos de imagen de 480×640, el modelo es ligero y cabe holgadamente en GPUs de consumo, aunque no se publica una cifra exacta.
- GPU recomendadas: no especificadas por el autor; el comando de entrenamiento usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA. Para entrenamiento con batch 32 y dos cámaras se recomienda una GPU con al menos 8-12 GB de VRAM, aunque es una estimación, no un dato del autor.
- GPU de consumo: previsiblemente compatible con RTX 3060/4060 y superiores; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), con soporte de inferencia en tiempo real a 30 FPS sobre el robot SO-101.
- Latencia y throughput: no disponibles; la ejecución está pensada para operar a la frecuencia de las cámaras (30 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| act-smartseed-d1-c100-80k | 51,7 M | Grasping de semilla con SO-101, 2 cámaras | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | Manipulación con action chunks, múltiples tareas | no disponible | Paper y código de referencia |
| Otras políticas LeRobot del Hub | variable | Tareas específicas por robot y dataset | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenada solo para "grasp the seed below the gripper"; no generaliza a otras tareas, objetos o posiciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento en producción es desconocido.
- Dependencia del hardware: requiere un SO-101 (`so_follower`) con dos cámaras en posiciones top y wrist, calibradas y con los índices correctos; cualquier cambio de montaje invalida la política.
- Sensibilidad a condiciones visuales: al no documentarse aumentos de datos ni pruebas con cambios de iluminación, posición o distractores, se desconoce su robustez.
- Riesgo de sobreajuste: 96 episodios y 80.000 pasos de entrenamiento sugieren posible sobreajuste al dataset; conviene validar antes de usar en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no debe confundirse con un modelo fundacional; es un controlador robótico específico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RafaelJaime/act-smartseed-d1-c100-80k
- Dataset de entrenamiento: https://huggingface.co/datasets/RafaelJaime/smartseed-grasp-d1-clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RafaelJaime/smartseed-grasp-d1-clean
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
