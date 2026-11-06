# drdonv/act_so101_pilot

## Resumen

`drdonv/act_so101_pilot` es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada con LeRobot para el robot manipulador SO-101 (configuración `so_follower`). No se trata de un modelo de lenguaje, sino de un controlador visomotor que mapea observaciones (estado articular de 6 dimensiones y una imagen RGB de 480x640) a comandos de acción de 6 dimensiones. El modelo predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y estabiliza la ejecución en robótica de imitación.

El autor, `drdonv`, lo publica en Hugging Face Hub con licencia Apache 2.0 y un total de 51.668.614 parámetros (según los pesos en safetensors). El repositorio ocupa 7,4 GB, un tamaño desproporcionado respecto al número de parámetros, probablemente por checkpoints intermedios y estados del optimizador. La tarea entrenada es concreta: "Pick up the object and place it in the target zone", aprendida a partir de 51 episodios de teleoperación (32.859 frames a 30 FPS).

Su relevancia radica en ser un ejemplo reproducible y ligero de entrenamiento de políticas visomotoras con LeRobot 0.6.1, útil para investigadores que quieran validar pipelines de imitación en hardware de bajo coste como el SO-101 antes de escalar a brazos más complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación fija por frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT combina un codificador de visión (procesa la imagen `observation.images.top` de 3x480x640) con un transformer que genera secuencias de acciones de corto plazo (chunks) en lugar de un único paso. Esta formulación, descrita en el paper arXiv:2304.13705, mitiga el problema de acumulación de errores en políticas de imitación y permite un control más suave. La entrada de estado es un vector de 6 dimensiones (`observation.state`) y la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `drdonv/so101_act_pilot` (51 episodios, 32.859 frames a 30 FPS). Configuración: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se especifica en la información disponible si hubo aumento de datos, RLHF/DPO ni otras técnicas de refinamiento; se trata de imitación supervisada pura (behavior cloning). No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de 6 grados de libertad a partir de una imagen superior y el estado articular.
- Ejecución de tareas de pick-and-place: entrenado específicamente para "Pick up the object and place it in the target zone".
- Inferencia en tiempo real a 30 FPS sobre hardware SO-101 (`so_follower`).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No dispone de tool calling, function calling, razonamiento multi-step ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la tarea de recogida y colocación en la zona objetivo usando la cámara superior y el estado del SO-101, sirviendo como referencia para validar la cadena completa de teleoperación, entrenamiento y despliegue con LeRobot.
- Prototipado rápido de políticas de imitación: investigadores pueden partir de esta política y reentrenarla con `lerobot-train` sobre sus propios datasets para evaluar variantes de ACT sin montar infraestructura desde cero.
- Benchmark de hardware de bajo coste: al estar entrenado para el SO-101 con una sola cámara, es útil para medir latencia, estabilidad y tasa de éxito en brazos económicos antes de invertir en plataformas mayores.
- Educación y formación en robótica de imitación: el repositorio incluye comandos reproducibles (`lerobot-rollout`) y configuración de entrenamiento completa, lo que facilita usarlo como ejemplo docente en cursos de aprendizaje por imitación.
- Base para comparativas de métodos de chunking: al ser una implementación ACT canónica con hiperparámetros documentados, permite comparar ACT frente a otros métodos (Diffusion Policy, VQ-BeT) en la misma tarea y robot.
- Validación de pipelines de datos: el dataset asociado (51 episodios, 32.859 frames) y la política entrenada permiten probar herramientas de visualización, curado y aumento de datos de LeRobot de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 51,7 M de parámetros, el grueso del coste proviene del codificador visual y del tamaño de la imagen de entrada (3x480x640), no de los pesos.
- GPU recomendadas: no disponible. Para entrenamiento se usó `--policy.device=cuda`, pero no se especifica el modelo de GPU empleado.
- Cabe en GPU de consumo: altamente probable por el número de parámetros, aunque no confirmado en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=drdonv/act_so101_pilot`), integración con el robot `so_follower` y cámaras OpenCV a 640x480 y 30 FPS.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la tasa del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drdonv/act_so101_pilot (este) | 51,7 M | Imagen 3x480x640 + estado (6,) | Pick-and-place en SO-101 | Apache 2.0 | Hugging Face Hub (LeRobot) |
| ACT (paper original, 2304.13705) | no disponible | Configurable | Imitación genérica con chunks | no disponible | Paper y código de referencia |
| Diffusion Policy | no disponible | Configurable | Imitación visomotora | no disponible | Repositorios públicos |
| VQ-BeT | no disponible | Configurable | Imitación visomotora | no disponible | Repositorios públicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea ("Pick up the object and place it in the target zone") y un único robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Depende de una cámara superior con nombre de observación `observation.images.top`; cambiar la posición o el índice de cámara invalida la política.
- No hay evaluación en robot real publicada, por lo que se desconoce la tasa de éxito y la robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Dataset pequeño (51 episodios), lo que aumenta el riesgo de sobreajuste a las condiciones de recogida.
- Sin capacidades lingüísticas, de razonamiento ni de tool calling; no debe presentarse como modelo de propósito general.
- El repositorio de 7,4 GB es mucho mayor que el tamaño de los pesos (51,7 M de parámetros), lo que puede complicar la descarga y el almacenamiento en entornos limitados.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el comportamiento antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drdonv/act_so101_pilot
- Dataset de entrenamiento: https://huggingface.co/datasets/drdonv/so101_act_pilot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=drdonv/so101_act_pilot
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/drdonv
