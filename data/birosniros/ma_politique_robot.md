# Birosniros/ma_politique_robot

## Resumen

El modelo `Birosniros/ma_politique_robot` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario Birosniros y publicada en Hugging Face bajo licencia Apache 2.0. Está entrenada con la librería LeRobot de Hugging Face para controlar un robot tipo `so_follower` mediante imitación, a partir de datos teleoperados. El modelo resuelve la tarea concreta de coger un rotulador (tarea "Prendre_le_stabilo_v3") usando dos cámaras (frontal y lateral) y el estado del robot.

Con 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en robots físicos. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas de imitación con LeRobot, un ecosistema open source que está ganando tracción en la comunidad robótica. El modelo se publicó en septiembre de 2026 y no incluye resultados de evaluación en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La arquitectura combina un codificador visual (procesa imágenes de dos cámaras) con un transformador que genera acciones de 6 dimensiones (posiblemente posiciones y orientaciones del efector final). El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre un dataset de 60 episodios y 45.582 fotogramas a 30 FPS, recopilados mediante teleoperación. Se usaron 15.000 pasos de entrenamiento, batch size de 8, optimizador AdamW y learning rate de 1e-5. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control de robot manipulador: genera comandos de acción de 6 grados de libertad a partir de observaciones visuales y del estado del robot.
- Percepción multimodal: procesa simultáneamente imágenes de dos cámaras (frontal de 720x1280 y lateral de 480x640) junto con el estado del robot (6 valores).
- Aprendizaje por imitación: reproduce comportamientos teleoperados, lo que permite transferir habilidades humanas al robot.
- Ejecución en tiempo real: al ser un modelo pequeño, puede inferir a alta frecuencia en hardware embebido o GPU de consumo.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de Hugging Face.
- No soporta tool calling, agentes conversacionales ni procesamiento de lenguaje natural; es exclusivamente una política de control robótico.

## Casos de uso

- Tareas de pick-and-place en entornos industriales: el modelo puede integrarse en un robot colaborativo para recoger objetos específicos (como el rotulador de la tarea de entrenamiento) y colocarlos en posiciones determinadas, reduciendo la necesidad de programación manual.
- Automatización de laboratorios: en entornos de investigación, puede usarse para manipular muestras o herramientas repetitivas, aprovechando su capacidad de imitación para adaptarse a nuevas configuraciones con datos adicionales.
- Prototipado rápido de habilidades robóticas: gracias a LeRobot, los desarrolladores pueden grabar demostraciones, entrenar una política y desplegarla en horas, lo que acelera la experimentación en robótica.
- Robots de asistencia en entornos domésticos: con un robot tipo `so_follower`, el modelo podría ejecutar tareas de agarre de objetos cotidianos, aunque requiere adaptación a cada entorno.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a variaciones de iluminación y posición de objetos.
- Demostraciones educativas: en cursos de robótica, permite mostrar el ciclo completo de entrenamiento de una política con datos reales, sin necesidad de grandes recursos computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware en la documentación del modelo.
- Dado el tamaño de 51,7 millones de parámetros y la entrada de imágenes, se estima que la inferencia puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, aunque no hay datos confirmados.
- El modelo está diseñado para ejecutarse en el robot `so_follower` de LeRobot, que típicamente se conecta a un ordenador con cámara y puerto serie.
- Opciones de despliegue: el flujo estándar es mediante el comando `lerobot-rollout` de LeRobot, que gestiona la carga del modelo y la comunicación con el robot.
- No se han publicado mediciones de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, ya que se trata de una política específica para un robot concreto y una tarea particular.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Prendre_le_stabilo_v3" y puede no generalizar a otros objetos o configuraciones sin reentrenamiento.
- No se han realizado evaluaciones formales, por lo que se desconoce la tasa de éxito real en el robot físico.
- Depende de la calibración de las cámaras y del robot; cambios en la iluminación, posición de la cámara o el entorno pueden degradar el rendimiento.
- Al ser un modelo de imitación, hereda los sesgos de las demostraciones humanas (por ejemplo, trayectorias subóptimas o movimientos inconsistentes).
- No es un modelo de lenguaje ni de razonamiento general; no debe usarse fuera del ámbito de control robótico.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el funcionamiento en entornos de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Birosniros/ma_politique_robot)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Birosniros/record-test_20260902_124957)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
