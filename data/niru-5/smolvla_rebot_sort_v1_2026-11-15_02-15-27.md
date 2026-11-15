# niru-5/smolvla_rebot_sort_v1_2026-11-15_02-15-27

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, publicada por el usuario niru-5, es un ajuste fino del checkpoint base `lerobot/smolvla_base` sobre el conjunto de datos `RoboCrafty/rebot_sort_v1`, y ejecuta una única tarea: recoger unas llaves y depositarlas en un contenedor designado. El modelo consume el estado articular del robot y tres flujos de cámara para producir una acción de siete dimensiones, lo que lo integra directamente en un bucle de control a 30 FPS sobre un robot `rebot_b601_follower`.

El interés de esta publicación no reside en sus capacidades generales, sino en su naturaleza de política de imitación lista para desplegar. Con 450 millones de parámetros y solo 35 episodios de entrenamiento (19.177 fotogramas), ejemplifica el flujo típico de LeRobot: partir de un VLA base preentrenado y especializarlo con pocas horas de demostraciones humanas. Esto lo convierte en material de referencia para investigadores que evalúan la viabilidad de políticas VLA pequeñas en hardware de consumo, frente a modelos VLA de mayor escala que requieren infraestructura de servidor.

Es relevante ahora porque el artículo de SmolVLA (arXiv 2506.01844) propone precisamente esa tesis: que un VLA compacto, entrenado de forma eficiente, alcanza rendimiento competitivo en manipulación robótica sin necesidad de clústeres de GPU. Este checkpoint es una muestra práctica de esa filosofía, aunque su autor no ha publicado ninguna evaluación de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto, según el método SmolVLA del paper 2506.01844 |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (únicamente pesos safetensors en el repo) |
| Idiomas soportados | no disponible (la instrucción de tarea se pasa como texto; entrenado con una única consigna en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Datos adicionales del despliegue: estado de observación de forma `(6,)`, tres cámaras de `(3, 256, 256)` (`front_wide`, `gripper`, `high_oblique`), acción de salida `(7,)`. Tipo de robot: `rebot_b601_follower`. Tamaño del repositorio: 5,3 GB.

## Arquitectura y entrenamiento

La arquitectura sigue el diseño SmolVLA descrito en el paper 2506.01844: un modelo VLA compacto que combina un codificador visual con un transformer que fusiona observaciones visuales, estado propioceptivo y una instrucción en lenguaje natural para predecir acciones motoras. El detalle interno de capas, dimensión oculta y mecanismo de atención no está disponible en la información proporcionada. La política se entrenó con LeRobot 0.7.1 mediante aprendizaje por imitación supervisado sobre las demostraciones del dataset, no consta RLHF ni DPO.

La configuración de entrenamiento publicada es: 10.000 pasos, tamaño de lote 128, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. El dataset `RoboCrafty/rebot_sort_v1` contiene 35 episodios y 19.177 fotogramas a 30 FPS, todos correspondientes a la tarea "pickup the keys and put it in the designated bin". El ajuste se realizó sobre `lerobot/smolvla_base`; no se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 7 dimensiones a partir de tres vistas de cámara y del estado articular.
- Aprendizaje por imitación especializado: reproduce la habilidad concreta de recoger llaves y colocarlas en un contenedor, condicionada por la instrucción de tarea.
- Fusión multimodal en tiempo real: procesa simultáneamente tres flujos visuales de 256x256 píxeles y el estado propioceptivo en cada paso de control.
- Ejecución a 30 FPS: el entrenamiento está alineado con la frecuencia de captura del dataset, adecuada para bucles de control de robots manipuladores.
- Integración nativa con LeRobot: compatible con `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No consta soporte de tool calling, razonamiento multi-paso, capacidades multilingües, modo thinking, audio ni visión general fuera del pipeline robótico.

## Casos de uso

- Clasificación y traslado de piezas pequeñas en línea de montaje: el modelo toma las llaves u objetos similares de una superficie y los deposita en un contenedor, replicando la tarea del dataset con las tres cámaras industriales del robot.
- Prototipado de políticas VLA en laboratorio: sirve como punto de partida para medir el coste real de ajustar SmolVLA con 35 episodios y evaluar la curva de convergencia a 10.000 pasos sobre hardware propio.
- Benchmark de despliegue en hardware de consumo: con 450 M de parámetros, permite comparar latencia y tasa de éxito entre GPUs de gama media en un bucle de control cerrado, sin depender de servidores.
- Automatización de tareas de picking en almacén ligero: el robot `rebot_b601_follower` con las cámaras `front_wide`, `gripper` y `high_oblique` puede ejecutar la política durante sesiones de 60 segundos mediante `lerobot-rollout --duration=60`.
- Generación de datos de evaluación para investigación en imitación: al no haber resultados publicados, el propio checkpoint sirve para contrastar protocolos de evaluación de éxito en robot real.
- Base para ajuste fino en tareas análogas: mediante `lerobot-train --policy.path=lerobot/smolvla_base` o partiendo de este checkpoint, se puede transferir a otras tareas de sorting con menos datos que entrenando desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors, los pesos ocupan del orden de 0,9 GB en precisión de 16 bits y cerca de 1,8 GB en fp32, a lo que hay que sumar el coste de los tres flujos de cámara de 256x256.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, es esperable que quepa en GPUs de consumo, pero no se confirma en la model card.
- ¿Cabe en GPU de consumo? No confirmado oficialmente; el paper de SmolVLA afirma que el modelo está pensado para hardware de consumo, pero sin cifras publicadas para este checkpoint.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` para ejecución sin grabación de episodios, y `lerobot-train` para reentrenamiento; no consta soporte documentado de vLLM, llama.cpp, Ollama ni TGI, dado que es una política robótica y no un LLM generativo.
- Latencia y throughput: no disponibles; el único dato de referencia es que el dataset se capturó a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_rebot_sort_v1 (este) | ~450 M | no disponible | Sorting de llaves con robot rebot_b601_follower | apache-2.0 | Hugging Face (niru-5) |
| lerobot/smolvla_base | no disponible | no disponible | VLA base para ajuste fino | no disponible en la información | Hugging Face (lerobot) |
| Otros VLA de mayor escala | no disponible | no disponible | Manipulación general | no disponible | no disponible |

La información proporcionada solo permite comparar contra el modelo base del que deriva. No se dispone de datos de parámetros, contexto ni rendimiento de alternativas como OpenVLA u otros VLA, por lo que no se incluyen cifras que no estén verificadas.

## Limitaciones y advertencias

- No hay evaluación publicada: no consta tasa de éxito en robot real, por lo que no se puede afirmar que la política funcione fuera del conjunto de entrenamiento.
- Dataset muy reducido: 35 episodios y una única tarea limitan la generalización a posiciones de objeto, iluminación o distractores distintos de los vistos.
- Dependencia de la instrucción exacta: la política se entrenó con la consigna "pickup the keys and put it in the designated bin"; cambios de formulación no están validados.
- Dependencia del hardware: requiere el robot `rebot_b601_follower` y las tres cámaras con los nombres `front_wide`, `gripper` y `high_oblique`; otros robots o configuraciones de cámara no están soportados por el checkpoint.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones plausibles pero incorrectas ante observaciones fuera de distribución, sin mecanismo de verificación interno.
- Sesgos: no documentados; al entrenarse con demostraciones de un único operador y entorno, hereda sus sesgos de trayectoria y velocidad.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución a LeRobot y al paper de SmolVLA.
- Idiomas: no se documenta soporte multilingüe; la condicionalización por lenguaje se limita a la tarea entrenada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niru-5/smolvla_rebot_sort_v1_2026-11-15_02-15-27
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/rebot_sort_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/rebot_sort_v1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
