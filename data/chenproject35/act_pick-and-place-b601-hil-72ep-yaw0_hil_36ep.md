# chenproject35/act_pick-and-place-b601-hil-72ep-yaw0_hil_36ep

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación robótica. Este repositorio concreto, publicado por el usuario `chenproject35`, contiene una política ACT entrenada con LeRobot sobre un robot `rebot_b601_follower` para la tarea específica de recoger un objeto (`inreach2`) y colocarlo en un soporte (`jig`).

El modelo es una política visomotora que consume el estado articular de 7 dimensiones y dos cámaras RGB de 480x640 (frontal y de muñeca), y produce una acción de 7 dimensiones. Con 51,67 millones de parámetros y un repositorio de 5,0 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de consumo, no a razonamiento general.

Su relevancia es acotada: se trata de un artefacto de investigación/experimentación para una tarea y un robot concretos, no de un modelo fundacional reutilizable. La model card no reporta resultados de evaluación en robot real, por lo que su utilidad práctica queda supeditada a la validación por parte de quien lo despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de horizonte de acciones fijo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que, en lugar de predecir una única acción por paso de tiempo, emite un *chunk* de acciones futuras. Esta formulación mitiga el problema de composición de errores y permite un control más suave. El modelo combina un codificador de imágenes (para `cam_front` y `cam_wrist`, ambas de 3x480x640) con el estado del robot (`observation.state`, 7 dimensiones) y un decodificador que produce acciones de 7 dimensiones. El método se describe en el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `chenproject35/pick-and-place-b601-hil-72ep-yaw0`: 72 episodios, 74.932 frames a 30 FPS, con la tarea "Pick up inreach2 and place it in the jig." La configuración reportada es de 23.400 pasos, batch size 32, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni otras fases de alineamiento; se trata de aprendizaje supervisado por imitación a partir de demostraciones de teleoperación.

## Capacidades

- Control visomotor de manipulación robótica: genera comandos de acción de 7 dimensiones a partir de estado articular y dos vistas de cámara.
- Ejecución de una tarea concreta de pick-and-place ("Pick up inreach2 and place it in the jig.") sobre el robot `rebot_b601_follower`.
- Predicción de chunks de acciones, lo que aporta suavidad y robustez frente a errores de composición.
- Integración nativa con LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política ejecuta la secuencia de recogida del objeto `inreach2` y su inserción en el `jig` sobre el robot `rebot_b601_follower`, con la ventaja de que el chunking de acciones reduce las sacudidas en la trayectoria.
- Base para *human-in-the-loop* (HIL): el nombre del dataset (`hil`) y el sufijo `hil_36ep` sugieren un entrenamiento por fases con correcciones humanas; el modelo sirve como punto de partida para iterar con nuevas demostraciones.
- Prototipado rápido de políticas de imitación: al ser un checkpoint LeRobot de 51,67 M de parámetros, permite validar el pipeline completo (grabación, entrenamiento, rollout) en un equipo con GPU de gama media.
- Investigación en aprendizaje por imitación: útil como referencia reproducible para comparar variantes de ACT, cambios de hiperparámetros o composición de datasets en una tarea de manipulación acotada.
- Despliegue en estaciones de trabajo con cámara fija y de muñeca: el modelo espera exactamente dos flujos de imagen a 640x480 y 30 FPS, lo que encaja con configuraciones de bajo coste.
- Reentrenamiento con `lerobot-train` para adaptar la política a variaciones de la tarea (nuevas posiciones del objeto, distinto `jig`) partiendo de este checkpoint o de su configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 M de parámetros en precisión completa el peso de los pesos ronda los 0,2 GB, por lo que la VRAM necesaria la dominan las activaciones de las dos cámaras de 3x480x640 y el resto del pipeline de LeRobot.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con soporte CUDA y al menos unos pocos GB de VRAM debería poder alojar el modelo; se recomienda validar con la configuración concreta de LeRobot.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido número de parámetros; no hay confirmación oficial ni lista de modelos probados.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El sistema opera a 30 FPS según el dataset, pero no se reporta el tiempo de inferencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,67 M | no aplica | Pick-and-place en `rebot_b601_follower` | apache-2.0 | Hugging Face (lerobot) |
| Diffusion Policy | no disponible | no aplica | Políticas visomotoras por difusión | no disponible | Implementación en LeRobot |
| VQ-BeT | no disponible | no disponible | Políticas de imitación discretizadas | no disponible | Implementación en LeRobot |
| π0 (pi-zero) | no disponible | no disponible | Política fundacional visomotora | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a la categoría metodológica (políticas de imitación para manipulación) y no a métricas medidas.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único robot (`rebot_b601_follower`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante variaciones de iluminación, posiciones o distractores.
- Dependencia de calibración: requiere que los nombres y la resolución de las cámaras coincidan exactamente con las claves de observación (`observation.images.cam_front`, `observation.images.cam_wrist`) y que el robot esté calibrado.
- Riesgo de sobreajuste al dataset: 72 episodios y 74.932 frames son un volumen modesto; es probable que la política se degrade fuera de la distribución de demostraciones.
- Sin capacidades de lenguaje ni razonamiento: no debe emplearse como modelo conversacional, de código o de agentes.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero la licencia no cubre posibles sesgos o fallos de seguridad física del robot; la responsabilidad operativa recae en el desplegador.
- Seguridad física: al tratarse de control de robot real, deben implementarse límites de par, paradas de emergencia y validación en entorno controlado antes de cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenproject35/act_pick-and-place-b601-hil-72ep-yaw0_hil_36ep
- Dataset de entrenamiento: https://huggingface.co/datasets/chenproject35/pick-and-place-b601-hil-72ep-yaw0
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chenproject35/pick-and-place-b601-hil-72ep-yaw0
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
