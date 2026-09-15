# HyeonseokE/smolvla_ablation2_rank_turn_off_lever_2000_10fps

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo SmolVLA, un modelo vision-lenguaje-acción (VLA) compacto desarrollado en el ecosistema de LeRobot de Hugging Face y descrito en el artículo arXiv:2506.01844. El checkpoint, publicado por el usuario HyeonseokE, parte del modelo base `lerobot/smolvla_base` y ha sido entrenado con LeRobot 0.6.0 para una única tarea de manipulación robótica: accionar una palanca hasta que el indicador de estado se ponga rojo. Con 450.046.176 parámetros y un repositorio de 0,9 GB, es un modelo pensado para ejecutarse en hardware de consumo, no en clústeres de servidores.

El problema que aborda es el control motor guiado por instrucciones y percepción visual en robots de bajo coste, en este caso un seguidor SO-101 (`so101_follower`) con cámaras. El modelo no es un asistente conversacional: consume observaciones (estado articular y varias imágenes de 256x256) y produce acciones motoras de 6 dimensiones a 10 FPS. Su relevancia es doble: por un lado, demuestra que un VLA de menos de 500 millones de parámetros puede resolver tareas de manipulación en hardware asequible; por otro, el nombre del repositorio indica que forma parte de un estudio de ablación (`ablation2`, `rank_turn_off`, semilla 2000), por lo que su interés principal es de investigación y reproducibilidad más que de producción.

Se trata de un artefacto de investigación con 0 descargas y 0 "likes" en el momento de la consulta, sin resultados de evaluación publicados y sin model card más allá de los campos generados automáticamente por LeRobot. Conviene tratarlo como un punto de partida reproducible para experimentos de aprendizaje por imitación, no como una política lista para desplegar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA) compacta; según el artículo de SmolVLA, se apoya en un modelo de visión-lenguaje preentrenado tipo SmolVLM-2 más un "action expert" de flow matching |
| Parámetros totales | 450.046.176 (0,45 mil millones), dato real de los pesos safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se distribuyen en safetensors; el repositorio ocupa 0,9 GB) |
| Idiomas soportados | no disponible (la entrada de lenguaje es una instrucción de tarea en inglés: "Turn the lever off; the status indicator should turn red.") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Robot objetivo | `so101_follower` |
| Cámaras declaradas | `top`, `left_wrist` (la tabla de entradas del repositorio lista tres rasgos visuales: `observation.images.camera1`, `camera2` y `camera3`, cada uno de forma `(3, 256, 256)`) |
| Entradas | `observation.state` `(6,)` y rasgos visuales `(3, 256, 256)` |
| Salidas | `action` `(6,)` y `action.radian_urdf0` `(6,)` |
| Frecuencia de control | 10 FPS (frecuencia del conjunto de datos de entrenamiento) |
| Fecha de publicación (metadatos de Hugging Face) | 15 de septiembre de 2026 |
| Descargas / likes en el momento de la consulta | 0 / 0 |

## Arquitectura y entrenamiento

Según el artículo referenciado (arXiv:2506.01844), SmolVLA es un modelo vision-lenguaje-acción que reutiliza un modelo de visión-lenguaje preentrenado de escala reducida y le añade un experto en acciones entrenado con flow matching, de modo que la política genera trayectorias continuas de acción condicionadas por la instrucción textual y las observaciones visuales y propioceptivas. La model card no detalla la configuración interna de este checkpoint, pero la cifra de 450 millones de parámetros coincide con la del modelo base de SmolVLA, lo que sugiere que se conserva la arquitectura completa. El artículo destaca además el uso de inferencia asíncrona para desacoplar el ciclo de control del robot del coste de cómputo del modelo; el repositorio no especifica si esta función se utiliza en este ajuste.

El entrenamiento es un ajuste fino de imitación sobre el conjunto de datos `HyeonseokE/ablation2_rank_turn_off_lever_10fps`: 100 episodios, 21.644 fotogramas, capturados a 10 FPS por un robot `so101_follower` con dos cámaras declaradas (`top` y `left_wrist`). La tarea es única: "Turn the lever off; the status indicator should turn red." La configuración reportada es de 16.900 pasos de entrenamiento, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 2000 y LeRobot 0.6.0. No se documenta el número de tokens de entrenamiento del modelo base, la composición de su dataset original ni si hubo fases de RLHF o DPO; tampoco se describe ninguna innovación técnica específica de este checkpoint, que por su nomenclatura parece corresponder a una variante de ablación sobre el mecanismo de atención o de rango de la política.

## Capacidades

- Generación de acciones motoras de 6 grados de libertad a partir de observaciones visuales y de estado articular, con salida dual (`action` y `action.radian_urdf0`, ambas de forma `(6,)`).
- Percepción visual multi-cámara: procesa rasgos de imagen de `(3, 256, 256)` procedentes de las cámaras del robot.
- Condicionamiento por instrucción en lenguaje natural: la política recibe la tarea como cadena de texto, lo que permite reutilizar el mismo pipeline con distintas consignas.
- Ejecución de una tarea de manipulación concreta de contacto (accionar una palanca hasta que el indicador de estado se ponga rojo), entrenada por imitación.
- Inferencia en tiempo real a la frecuencia de control de 10 FPS del conjunto de datos.
- No soporta tool calling ni function calling: es una política de robótica, no un modelo de lenguaje con interfaz de herramientas.
- No soporta razonamiento multi-paso en lenguaje, agentes conversacionales, generación de texto libre, código ni matemáticas.
- No dispone de modo "thinking", ni capacidades de audio, ni visión de propósito general fuera del pipeline de control.

## Casos de uso

- Automatización de una estación de trabajo concreta: el modelo puede accionar la palanca de un panel y verificar implícitamente el resultado mediante la realimentación visual de las cámaras, siempre que el entorno y la posición de la palanca se mantengan dentro de la distribución del conjunto de datos de 100 episodios.
- Reproducción de estudios de ablación: al estar etiquetado como `ablation2_rank_turn_off` con semilla 2000, sirve como punto de comparación para medir el efecto de variantes arquitectónicas sobre la misma tarea y el mismo dataset.
- Prototipado rápido en robótica de bajo coste: al ejecutarse con el comando `lerobot-rollout` sobre un `so101_follower`, permite validar en una tarde una política de imitación en hardware accesible sin necesidad de GPU de datacenter.
- Generación de nuevas políticas por ajuste fino: partiendo de `lerobot/smolvla_base` y de este checkpoint, un equipo puede entrenar variantes con `lerobot-train` sobre sus propios conjuntos de datos de manipulación.
- Docencia y formación en aprendizaje por imitación: el tamaño reducido (0,9 GB) y la licencia Apache 2.0 lo hacen adecuado para laboratorios universitarios donde los alumnos graban datos, entrenan y evalúan políticas completas.
- Evaluación comparativa de arquitecturas VLA: sirve como referencia de "modelo pequeño" frente a alternativas de miles de millones de parámetros en experimentos controlados de coste frente a éxito por tarea.
- Demostraciones en ferias o entornos controlados: el modelo puede ejecutar la tarea de forma repetida durante un tiempo determinado mediante el parámetro `--duration` del script de despliegue, con fines ilustrativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que todavía no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"), y no incluye tabla de tareas, ensayos, éxitos ni tasa de éxito. El artículo de SmolVLA reporta evaluaciones del modelo base, pero no se dispone de sus cifras en la información facilitada, por lo que no se reproducen aquí.

## Requisitos de hardware

- Tamaño de los pesos: el repositorio ocupa 0,9 GB, lo que corresponde a unos 2 bytes por parámetro (precisión de 16 bits). En coma flotante de 32 bits serían aproximadamente 1,8 GB.
- VRAM estimada para inferencia: del orden de 2 a 4 GB en 16 bits, incluyendo los codificadores visuales y los búferes de las tres imágenes de 256x256 (estimación a partir del número de parámetros; no confirmada por el autor).
- Cabe sin problema en GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4070, RTX 4090, así como en portátiles con GPU dedicada de 6 GB o más.
- GPU de datacenter: A100, H100 o L40S son válidas, aunque sobredimensionadas para 0,45 mil millones de parámetros; su uso tendría sentido para entrenamiento o para paralelizar muchas instancias de evaluación.
- Opciones de despliegue: la vía documentada es LeRobot, con el comando `lerobot-rollout --policy.path=HyeonseokE/smolvla_ablation2_rank_turn_off_lever_2000_10fps` y `--strategy.type=base`. El entrenamiento se realiza con `lerobot-train`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a una política de acción.
- Latencia y throughput: no disponible. La única referencia temporal es la frecuencia de captura y control de 10 FPS del conjunto de datos de entrenamiento; el artículo de SmolVLA menciona inferencia asíncrona para desacoplar el cómputo del bucle de control, pero no se aportan cifras para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| Este checkpoint (SmolVLA ajustado, tarea de palanca) | 0,45 mil millones | no disponible | apache-2.0 | Hugging Face (`HyeonseokE/...`) | Política especializada en una única tarea sobre SO-101 |
| lerobot/smolvla_base | 0,45 mil millones | no disponible | apache-2.0 | Hugging Face (LeRobot) | VLA generalista de propósito abierto, base para ajustes finos |
| pi0 (Physical Intelligence) | aproximadamente 3 mil millones | no disponible | apache-2.0 (repositorio openpi) | Hugging Face y repositorio openpi | VLA de flow matching para manipulación generalista |
| OpenVLA | 7 mil millones | no disponible | licencia comunitaria de Llama 2, con restricciones | Hugging Face | VLA generalista entrenado sobre datos de robots de investigación |

La ventaja principal de este checkpoint frente a las alternativas de mayor tamaño es el coste de inferencia (una décima parte de pi0 y menos de una vigésima parte de OpenVLA en parámetros), a cambio de una especialización extrema en una sola tarea y de la ausencia total de resultados de evaluación publicados.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Turn the lever off; the status indicator should turn red.") sobre 100 episodios; no se puede esperar generalización a objetos, posiciones o tareas distintas.
- Sin evaluación: no hay tasas de éxito, número de ensayos ni condiciones de prueba, por lo que se desconoce su fiabilidad real incluso en la tarea objetivo.
- Riesgo de alucinación de acciones: como toda política de imitación, puede producir trayectorias plausibles pero incorrectas ante configuraciones iniciales fuera de la distribución del dataset (posiciones nuevas de la palanca, iluminación distinta, objetos distractores en escena).
- Sesgos de datos: el comportamiento queda condicionado por los 21.644 fotogramas grabados por un operador concreto, en un entorno concreto y con dos cámaras declaradas; cualquier cambio de montaje, calibración o iluminación altera el rendimiento.
- Discrepancia documental: la model card declara dos cámaras (`top`, `left_wrist`), mientras que la tabla de entradas especifica tres rasgos visuales (`camera1`, `camera2`, `camera3`). Hay que verificar los nombres de clave y el número real de cámaras antes de desplegarlo, porque el script de despliegue exige que coincidan con las claves de observación del entrenamiento.
- Dependencia de hardware: requiere un `so101_follower` calibrado, con puerto y cámaras configurados específicamente; no es un modelo portable a otros robots sin reentrenamiento.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero el modelo base y los componentes preentrenados pueden arrastrar sus propios términos; conviene revisar la licencia de `lerobot/smolvla_base` antes de un despliegue comercial.
- No es un modelo de lenguaje: no genera texto, no responde a preguntas, no razona en lenguaje ni admite tool calling; usarlo fuera del bucle de control robótico carece de sentido.
- Artefacto de investigación: con 0 descargas y 0 interacciones, sin documentación de mantenimiento ni versionado posterior, y publicado como parte de una ablación, no debe considerarse un modelo estable para producción.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_ablation2_rank_turn_off_lever_2000_10fps
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_rank_turn_off_lever_10fps
- Visualizador del dataset (LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_rank_turn_off_lever_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de inferencia y despliegue: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
