# snjzz38/smolvla_so101_grab_ball_D40-R2-P

## Resumen

`smolvla_so101_grab_ball_D40-R2-P` es una política de robótica entrenada con LeRobot sobre la arquitectura SmolVLA (arXiv:2506.01844), un modelo compacto de visión-lenguaje-acción (VLA) diseñado para ejecutarse en hardware de consumo. El checkpoint lo publica el usuario `snjzz38` y resuelve una tarea muy concreta de manipulación: coger una pelota con un brazo robótico de tipo `so_follower` (familia SO-101), usando dos cámaras (`front` y `wrist`) y el estado articular de 6 dimensiones como observación.

No es un modelo de propósito general: es un artefacto de imitación (*imitation learning*) derivado de un dataset propio de 80 episodios y 21.694 fotogramas grabados a 30 FPS, entrenado durante 10.000 pasos con batch size 8 y AdamW a un learning rate de 1e-4. Su interés ahora es doble: por un lado demuestra el flujo completo de LeRobot (grabar datos, entrenar, publicar y desplegar con `lerobot-rollout`); por otro, sirve como ejemplo reproducible de cómo un VLA de ~450 millones de parámetros cabe en una GPU de consumo y se ejecuta sobre un robot de bajo coste.

El modelo tiene 450.046.176 parámetros en formato safetensors, ocupa 1,2 GB en el repositorio y se publicó el 17 de octubre de 2026. La model card no incluye licencia, resultados de evaluación ni detalles de arquitectura interna, por lo que buena parte de las especificaciones finas quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) transformer, política SmolVLA (librería LeRobot) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la instrucción de tarea del dataset está en inglés: "grab the ball D40-R2-P") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repo de 1,2 GB, librería `lerobot`) |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.front` | VISUAL | `(3, 480, 640)` |
| `observation.images.wrist` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

Configuración de entrenamiento:

| Ajuste | Valor |
|---|---|
| Pasos de entrenamiento | 10.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0.0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tipo de robot | `so_follower` |
| Cámaras | `front`, `wrist` |

## Arquitectura y entrenamiento

La model card identifica el método como SmolVLA, un VLA "compacto y eficiente" que, según la descripción del autor, logra rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. En la práctica, el modelo combina un codificador visual (dos cámaras RGB de 480x640), el vector de estado articular de 6 dimensiones y una instrucción en lenguaje natural, y produce directamente un vector de acción de 6 dimensiones. El detalle de capas, tipo de cabezal de acción y mecánica de atención no se especifica en la información disponible: la model card es la plantilla estándar de LeRobot y no documenta la arquitectura interna. Los pesos publicados (450 millones de parámetros) coinciden con la escala que el paper de SmolVLA asocia a modelos desplegables en una sola GPU de consumo.

El entrenamiento es de imitación supervisada sobre el dataset `snjzz38/so101_grab_ball_D40-R2-P_20261004_161317`: 80 episodios, 21.694 fotogramas a 30 FPS, una única tarea ("grab the ball D40-R2-P"). Se ejecutaron 10.000 pasos con batch size 8, AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.2. No se documenta en la información proporcionada si hubo preentrenamiento sobre corpus VLM, composición del dataset más allá de la tarea, ni fases de RLHF/DPO (no aplicables habitualmente en este tipo de políticas, pero no confirmado). Tampoco se indica ninguna innovación técnica adicional (decodificación especulativa, atención lineal, inferencia asíncrona) en la model card.

## Capacidades

- Control robótico de manipulación extremo a extremo: genera comandos de acción de 6 dimensiones a partir de dos vistas de cámara y del estado articular.
- Ejecución de una tarea específica de *pick*: "grab the ball D40-R2-P" sobre un brazo SO-101 (`so_follower`).
- Fusión visión-lenguaje-acción: la instrucción en texto condiciona la política, lo que permite en principio reutilizar el mismo backbone con otras instrucciones si se reentrena.
- Percepción multi-cámara: combina una vista frontal de la escena y una vista de muñeca, lo que aporta información de profundidad y de agarre.
- Bucle cerrado a 30 FPS: la política consume observaciones y emite acciones a la frecuencia nativa del dataset.
- Despliegue mediante CLI de LeRobot (`lerobot-rollout`) y reentrenamiento con `lerobot-train` sobre el mismo pipeline.
- Capacidad de *fine-tuning*: el repositorio funciona como punto de partida para entrenar variantes con `--policy.type=smolvla`.
- No dispone de: tool calling, razonamiento multi-paso simbólico, capacidades de audio, ni generación de texto libre como producto (el texto solo actúa como condicionamiento de tarea).

## Casos de uso

- **Automatización de una celda de *pick-and-place* con SO-101**: la política toma las imágenes de las cámaras frontal y de muñeca y emite las 6 acciones articulares para coger la pelota; encaja en laboratorios docentes o prototipos de bajo coste donde no se quiere depender de un modelo de varios miles de millones de parámetros.
- **Base reproducible para formación en robótica de imitación**: permite a un equipo recorrer el ciclo completo (grabar dataset, entrenar 10.000 pasos, publicar y desplegar) con un único comando de LeRobot, sirviendo de plantilla interna para nuevas tareas.
- **Punto de partida para *fine-tuning* de tareas propias**: el checkpoint se puede recargar con `--policy.type=smolvla` y reentrenar sobre un dataset nuevo de agarre, apilado o inserción, reduciendo el coste frente a entrenar desde cero.
- **Evaluación de despliegue en hardware de consumo**: con ~450 millones de parámetros y 1,2 GB de pesos, es un banco de pruebas realista para medir latencia de inferencia y estabilidad de control en GPU de gama media o en un Jetson.
- **Generación de datos sintéticos y aumento de dataset**: ejecutar la política con perturbaciones controladas (posiciones iniciales, iluminación, distractor es) permite recolectar episodios etiquetados para ampliar el dataset original de 80 episodios.
- **Investigación en robustez y *distribution shift***: al estar entrenada con un dataset pequeño y una única tarea, es un caso útil para estudiar sensibilidad a cambios de fondo, iluminación o posición del objeto, y para comparar técnicas de aumento de datos.
- **Demostraciones y material divulgativo**: al ser un modelo pequeño y un robot accesible, resulta adecuado para vídeos demostrativos y talleres donde se explica cómo funciona un VLA en la práctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", de modo que no hay tasas de éxito, número de ensayos ni condiciones experimentales (posiciones del objeto, iluminación, distractor es) que permitan cuantificar el rendimiento en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450.046.176 parámetros, en fp32 serían aproximadamente 1,8 GB de pesos; en bf16/fp16, unos 0,9 GB. Añadiendo activaciones y los dos flujos de imagen de 480x640, un presupuesto de 3-4 GB de VRAM es una estimación razonable, aunque no hay medición oficial en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 6-8 GB o más (RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090). No hay requisitos oficiales publicados.
- GPU de centro de datos: A100, H100 o L40S funcionan sobradamente, pero están muy por encima de lo necesario para un modelo de esta escala.
- Despliegue: la vía documentada es `lerobot-rollout` con `--policy.path=snjzz38/smolvla_so101_grab_ball_D40-R2-P`, más `lerobot-train` para reentrenar. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama en la información proporcionada (son *runtimes* de LLM, no del stack de políticas de LeRobot).
- Latencia y throughput: no disponible. El dataset se grabó a 30 FPS, lo que sugiere que el bucle de control se ejecutó a esa frecuencia, pero no se publica latencia de inferencia por paso ni throughput medido.
- Requisitos adicionales: puerto serie del robot y dos cámaras OpenCV configuradas a 640x480 y 30 FPS, con nombres que coincidan exactamente con las claves de observación del entrenamiento (`front` y `wrist`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `snjzz38/smolvla_so101_grab_ball_D40-R2-P` | 450.046.176 | 2 cámaras 480x640 + estado (6,) | Agarre de pelota con SO-101 | no disponible | HuggingFace, 13 descargas |
| SmolVLA (modelo base del paper) | misma familia (~450 M, según el método citado) | multimodal | VLA generalista preentrenado | no disponible en la información proporcionada | HuggingFace / LeRobot |
| Políticas tipo ACT / Diffusion Policy en LeRobot | no disponible | solo visión + estado | Manipulación por imitación | no disponible en la información proporcionada | LeRobot |
| OpenVLA y modelos VLA de mayor escala | varios miles de millones (dato no verificado en la información disponible) | multimodal | VLA generalista | no disponible en la información proporcionada | HuggingFace |

La comparación cuantitativa no es posible con los datos aportados: no hay benchmarks publicados para este checkpoint ni métricas comparables de las alternativas en la información proporcionada. La ventaja diferencial defendible es el tamaño (450 millones de parámetros, 1,2 GB) frente a VLA de escala varios órdenes mayor, a costa de estar especializado en una única tarea.

## Limitaciones y advertencias

- **Especialización extrema**: entrenado para una sola tarea ("grab the ball D40-R2-P"); fuera de ella la política no tiene comportamiento útil garantizado.
- **Dataset muy pequeño**: 80 episodios y 21.694 fotogramas implican alto riesgo de sobreajuste a posiciones, iluminación, fondo y texturas concretas del entorno de grabación.
- **Sin evaluación publicada**: no existe tasa de éxito medida, por lo que no se puede afirmar fiabilidad en producción ni siquiera para la tarea nominal.
- **Licencia no disponible**: la model card marca la licencia como "[More Information Needed]"; sin licencia explícita no hay autorización clara de uso comercial. Es un bloqueante para producción.
- **Dependencia de hardware concreto**: robot `so_follower` (SO-101) con calibración específica y dos cámaras con nombres de observación exactos; cambiar de robot, de resolución o de nombre de cámara rompe la inferencia.
- **Sesgos y alucinación**: no aplican en el sentido de generación de texto, pero sí el equivalente en política: el modelo puede ejecutar acciones plausibles pero incorrectas (agarres al aire, colisiones suaves) cuando la escena se aleja de la distribución de entrenamiento.
- **Idioma**: la instrucción de tarea está en inglés; no hay información sobre soporte multilingüe ni sobre sensibilidad al fraseado de la instrucción.
- **Sin datos de arquitectura ni cuantización**: no se documentan formatos cuantizados ni requisitos oficiales de memoria, por lo que cualquier estimación de VRAM es una aproximación.
- **Metadatos incompletos**: la model card es la plantilla por defecto de LeRobot, con secciones sin rellenar (licencia, evaluación, demo), lo que reduce la trazabilidad del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snjzz38/smolvla_so101_grab_ball_D40-R2-P
- Dataset de entrenamiento: https://huggingface.co/datasets/snjzz38/so101_grab_ball_D40-R2-P_20261004_161317
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=snjzz38/so101_grab_ball_D40-R2-P_20261004_161317
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
