# hrvojecukman/act_so101_dice_box

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. El modelo `hrvojecukman/act_so101_dice_box` es una política entrenada con LeRobot sobre el robot `so_follower` (SO-101) para la tarea concreta de recoger un dado y depositarlo en una caja.

Se trata de un modelo de robótica de pequeño tamaño (51.668.614 parámetros) que consume el estado articular del robot (vector de 6 dimensiones) y una imagen frontal de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Fue entrenado con 50 episodios de teleoperación (15.462 fotogramas a 30 FPS) durante 20.000 pasos con un batch size de 8 y learning rate de 1e-05.

Su relevancia es práctica: demuestra el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en hardware asequible (SO-101), con licencia Apache 2.0 y pesos en safetensors. No es un modelo de lenguaje ni un modelo generativo de propósito general; es una política específica de tarea con alcance limitado al entorno y robot con los que fue entrenada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `front` (una cámara frontal) |
| Entrada de estado | `observation.state`, shape (6,) |
| Entrada visual | `observation.images.front`, shape (3, 480, 640) |
| Salida de acción | `action`, shape (6,) |
| Tamaño del repositorio | 0.2 GB |
| Librería | LeRobot 0.6.2 |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura es un transformer que combina un codificador de observaciones (estado articular de 6 dimensiones e imagen RGB de 480x640) con un decodificador que genera un chunk de acciones de forma autoregresiva. La predicción por chunks, en lugar de paso a paso, mitiga el problema de compounding error típico de las políticas de imitación y permite ejecutar movimientos más suaves y estables.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `hrvojecukman/so101_dice_box_20261030_140042`, compuesto por 50 episodios y 15.462 fotogramas a 30 FPS, con la tarea "Pick up the dice and put it in the box". La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de ajuste posteriores; se trata de aprendizaje supervisado por imitación a partir de demostraciones teleoperadas.

## Capacidades

- Generación de comandos de acción de 6 dimensiones para el robot SO-101 a partir de estado articular e imagen frontal.
- Aprendizaje por imitación de tareas de manipulación (pick-and-place) a partir de demostraciones teleoperadas.
- Predicción de chunks de acción para movimientos más estables que el control paso a paso.
- Ejecución en tiempo real mediante `lerobot-rollout` con la política cargada desde el Hub.
- Integración nativa con el ecosistema LeRobot (entrenamiento, evaluación y despliegue).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es una política robótica específica de tarea.
- No dispone de modo thinking, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo recoge un dado y lo deposita en una caja sobre el robot SO-101, sirviendo como base para tareas de manipulación repetitivas en entornos controlados.
- Prototipado rápido de políticas de imitación: con 50 episodios y 20.000 pasos de entrenamiento, es un ejemplo reproducible del flujo LeRobot para validar hardware y pipeline antes de escalar a tareas más complejas.
- Docencia y formación en robótica: permite a estudiantes entrenar y desplegar una política ACT completa con hardware asequible y comandos CLI documentados.
- Benchmark interno de manipulación: al ser una tarea acotada y bien definida, sirve para comparar configuraciones de cámara, iluminación o calibración del robot.
- Base para fine-tuning en tareas similares: los pesos pueden reutilizarse como inicialización para tareas de recogida y depósito con objetos o contenedores distintos.
- Investigación en aprendizaje por imitación: útil para estudiar el efecto del número de episodios, la frecuencia de control (30 FPS) y la predicción por chunks en la tasa de éxito.
- Integración en pipelines de evaluación automatizada: mediante `lerobot-rollout` con `--duration` acotado se pueden ejecutar trials repetidos y medir éxito de forma sistemática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors (repo de 0,2 GB), la huella en memoria es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con suficiente memoria para cargar el modelo y procesar imágenes de 480x640; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (51,7 M de parámetros) y el tamaño del repositorio (0,2 GB), aunque no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento), con soporte de dispositivo CUDA (`--policy.device=cuda`).
- Latencia y throughput estimados: no disponibles en la información proporcionada. La política opera a 30 FPS según la frecuencia del dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hrvojecukman/act_so101_dice_box | 51.668.614 | ACT (imitación) | no disponible | Apache 2.0 | Hugging Face Hub |
| Políticas ACT genéricas de LeRobot | no disponible | ACT (imitación) | no disponible | según repositorio | Hugging Face Hub |
| Políticas Diffusion Policy | no disponible | difusión para robótica | no disponible | según repositorio | Hugging Face Hub |
| Políticas VLA (p. ej. OpenVLA) | no disponible en esta ficha | vision-language-action | no disponible | según modelo | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Política específica de tarea: entrenada únicamente para "Pick up the dice and put it in the box" con el robot `so_follower`; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del entorno: el rendimiento puede degradarse con cambios de iluminación, posición de objetos, fondo o calibración de la cámara.
- Dependencia del hardware: asume un robot SO-101 y una cámara frontal con la configuración exacta de observaciones (`observation.state` de 6 dimensiones e imagen de 480x640).
- Sin resultados de evaluación publicados: no hay tasa de éxito reportada, por lo que el rendimiento real en producción es desconocido.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como toda política de imitación, puede producir comandos fuera de distribución ante observaciones no vistas.
- Sin capacidades lingüísticas ni multilingües: no debe evaluarse como modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda citar el método (arXiv:2304.13705) y LeRobot según la model card.
- Dataset pequeño (50 episodios, 15.462 fotogramas): la cobertura de estados y variaciones es limitada, lo que restringe la robustez.
- No se documentan sesgos demográficos ni de otro tipo; el modelo no procesa texto ni datos personales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrvojecukman/act_so101_dice_box
- Dataset de entrenamiento: https://huggingface.co/datasets/hrvojecukman/so101_dice_box_20261030_140042
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hrvojecukman/so101_dice_box_20261030_140042
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
