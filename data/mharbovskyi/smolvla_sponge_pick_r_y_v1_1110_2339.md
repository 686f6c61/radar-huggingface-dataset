# mharbovskyi/smolvla_sponge_pick_r_y_v1_1110_2339

## Resumen

`mharbovskyi/smolvla_sponge_pick_r_y_v1_1110_2339` es un fine-tuning de SmolVLA, un modelo compacto de vision-language-action (VLA) desarrollado por Hugging Face y publicado en el paper arXiv:2506.01844. Este checkpoint concreto ha sido entrenado por el usuario mharbovskyi para una tarea de manipulación robótica muy acotada: recoger una esponja (roja o amarilla) y depositarla en un bol. El modelo parte de `lerobot/smolvla_base` y se ha entrenado con el framework LeRobot sobre un dataset propio de 66 episodios teleoperados.

A diferencia de los VLA de gran escala, SmolVLA está disenado para ejecutarse en hardware de consumo, lo que lo hace atractivo para laboratorios con presupuesto limitado y para ciclos de iteración rápidos en el desarrollo de políticas de imitación. El modelo consume el estado articular del robot (6 dimensiones) y tres cámaras RGB de 256x256, y produce un vector de acción de 6 dimensiones a 30 FPS.

Este checkpoint es un ejemplo de política de imitación especializada: no es un modelo generalista, sino una política entrenada para dos instrucciones de lenguaje concretas sobre un robot SO-100/SO-101 (tipo `so_follower`). Su relevancia radica en demostrar el flujo completo de LeRobot para fine-tuning de VLA en tareas de pick-and-place.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las tareas se especifican en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.7.1 |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Camaras | wrist, top, side (3 x RGB 256x256) |
| Entrada de estado | observation.state (6,) |
| Salida de accion | action (6,) |
| Frecuencia de datos | 30 FPS |
| Tamano del repo | 5.3 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para producir comandos motores condicionados por instrucciones en lenguaje natural. La arquitectura sigue el diseno presentado en el paper arXiv:2506.01844, orientado a reducir el coste computacional frente a VLA de mayor tamano manteniendo un rendimiento competitivo en tareas de manipulación.

Este checkpoint se ha obtenido por fine-tuning de `lerobot/smolvla_base` con el dataset `mharbovskyi/sponge_pick_r_y_v1`, compuesto por 66 episodios y 27.675 frames a 30 FPS, con dos tareas: "Put the red sponge in the bowl" y "Put the yellow sponge in the bowl". El entrenamiento se realizó con LeRobot 0.7.1 durante 20.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se especifica en la model card si hubo RLHF, DPO ni detalles sobre la composición exacta del dataset más allá del número de episodios y frames.

## Capacidades

- Generacion de acciones motoras de 6 dimensiones a partir de observaciones multimodales (estado articular y tres vistas de camara).
- Condicionamiento por instruccion en lenguaje natural: distingue entre "Put the red sponge in the bowl" y "Put the yellow sponge in the bowl".
- Percepcion visual multi-camara: procesa simultaneamente las vistas `wrist`, `top` y `side` a 256x256.
- Politica de imitacion entrenada de extremo a extremo, sin necesidad de planificacion explicita.
- Ejecucion en hardware de consumo segun la model card del modelo base.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking; es una politica robotica especializada.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la secuencia de recoger una esponja y dejarla en un bol, util como banco de pruebas para validar el pipeline de LeRobot con robots SO-100/SO-101.
- Prototipado rapido de politicas de imitacion: sirve como referencia de fine-tuning sobre `smolvla_base` para equipos que quieran replicar el flujo con sus propios datasets y tareas.
- Educacion e investigacion en robotica: al ser compacto y de licencia Apache 2.0, es adecuado para cursos y practicas donde se ensena imitation learning con hardware asequible.
- Validacion de infraestructura de teleoperacion: el dataset de 66 episodios y 27.675 frames permite comprobar la cadena de grabacion, calibracion y entrenamiento en LeRobot.
- Benchmark interno de VLA compactos: sirve como baseline especializado para comparar con otras politicas en tareas de dos objetos y dos destinos.
- Demostraciones de robotica en ferias o presentaciones: la tarea acotada y el bajo coste computacional facilitan ejecuciones en vivo con `lerobot-rollout` y `--duration` limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 450 millones de parametros, una estimacion en fp32 ronda los 1,8 GB solo de pesos, pero no se confirma el formato de despliegue ni el overhead del pipeline LeRobot.
- GPU recomendadas: no disponible. La model card del modelo base afirma que SmolVLA puede desplegarse en hardware de consumo, sin especificar modelos.
- Cabe en GPU de consumo: segun la model card del modelo base, si, aunque no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS segun la frecuencia del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mharbovskyi/smolvla_sponge_pick_r_y_v1_1110_2339` | 450 M | no disponible | Pick-and-place de esponja (2 tareas) | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| `lerobot/smolvla_base` | no disponible | no disponible | VLA generalista base para fine-tuning | no disponible en la informacion | Hugging Face |
| Otras politicas LeRobot | no disponible | no disponible | Manipulacion robotica | variable | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Especializacion extrema: solo se ha entrenado para dos instrucciones concretas ("Put the red sponge in the bowl" y "Put the yellow sponge in the bowl"); fuera de ese dominio no cabe esperar comportamiento util.
- Sin resultados de evaluacion: la model card no reporta tasa de exito en robot real, por lo que se desconoce su fiabilidad en produccion.
- Dependencia del hardware: requiere un robot `so_follower` y tres camaras con los nombres `wrist`, `top` y `side`; cambios de calibracion, iluminacion o posicion de camaras pueden degradar el rendimiento.
- Dataset pequeno: 66 episodios y 27.675 frames son insuficientes para garantizar robustez ante variaciones de posicion, distractores o condiciones de luz.
- Riesgo de sobreajuste a las condiciones de grabacion del dataset original.
- Idiomas: no se documenta soporte multilingue; las instrucciones de tarea estan en ingles.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion y la especializacion limitan su viabilidad fuera de entornos controlados.
- No se documentan sesgos, pero al ser una politica de imitacion hereda los sesgos de las demostraciones humanas del dataset.
- Sin datos de cuantizacion ni de despliegue fuera de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mharbovskyi/smolvla_sponge_pick_r_y_v1_1110_2339
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mharbovskyi/sponge_pick_r_y_v1
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mharbovskyi/sponge_pick_r_y_v1
