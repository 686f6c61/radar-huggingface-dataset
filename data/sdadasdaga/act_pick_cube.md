# sdadasdaga/act_pick_cube

## Resumen

sdadasdaga/act_pick_cube es una política de robótica basada en ACT (Action Chunking with Transformers) entrenada y publicada con el framework LeRobot de Hugging Face por el usuario sdadasdaga. No es un modelo de lenguaje ni un modelo multimodal generalista: es un modelo de aprendizaje por imitación que, a partir del estado articular de un brazo SO-101 (vector de 6 dimensiones) y de dos flujos de imagen (cámaras `overhead` y `wrist` a 640x480), predice directamente comandos de acción de 6 dimensiones para ejecutar una única tarea: «Pick up the green cube and place it back in its original position».

El modelo tiene 51.668.614 parámetros (~51,7 M) y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB, con licencia Apache 2.0. Se entrenó durante 100.000 pasos con batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre el dataset sdadasdaga/so101_green_cube_50ep (50 episodios teleoperados, 17.950 fotogramas a 30 FPS), empleando LeRobot 0.6.0.

Su relevancia práctica es la de un ejemplo reproducible y muy ligero de imitación en robótica de bajo coste: cabe en cualquier GPU de consumo, se puede desplegar en un SO-101 real con un solo comando de la CLI de LeRobot y sirve como plantilla o punto de partida para adaptar ACT a nuevas tareas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con backbone visual convolucional y transformer; no es un LLM |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la política no procesa texto; consume una ventana de observaciones y emite un chunk de acciones (tamaño de chunk no documentado en el repositorio) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan versiones GGUF, INT8 ni FP16) |
| Idiomas soportados | no aplica (política robótica no condicionada por lenguaje; el repositorio no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tamano del repositorio | 0,2 GB |
| Tipo de robot | `so_follower` (SO-101, 6 grados de libertad) |
| Camaras | `overhead`, `wrist` (3x480x640 cada una) |
| Entradas | `observation.state` (6,), `observation.images.overhead` (3,480,640), `observation.images.wrist` (3,480,640) |
| Salidas | `action` (6,) |
| Frecuencia de control | 30 FPS (derivada del dataset de entrenamiento) |
| Version de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

ACT es el método descrito en el paper arXiv:2304.13705 («Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware»). En lugar de predecir una acción por paso, el modelo predice un chunk de acciones futuras de una sola vez, lo que reduce el error de acumulación (compounding error) típico de las políticas de imitación paso a paso. La arquitectura combina un backbone visual convolucional configurable (familia ResNet en la implementación de LeRobot) que codifica las dos cámaras, un cuello de autoencoder variacional (CVAE) que modela la variabilidad de las demostraciones humanas durante el entrenamiento y un transformer encoder-decoder que genera la secuencia de acciones; en inferencia se emplea la media del prior latente. Los detalles concretos de configuración (tamaño de chunk, backbone exacto, número de capas) no se publican en la model card de este repositorio.

El entrenamiento es puramente supervisado por imitación sobre demostraciones teleoperadas: no hay RLHF, DPO ni refuerzo. El dataset contiene 50 episodios y 17.950 fotogramas a 30 FPS de una única tarea. La configuración declarada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.0. No se documenta aumento de datos, normalización, número de épocas ni composición detallada del dataset más allá de la tarea y el recuento de fotogramas.

## Capacidades

- Generación de comandos de acción de 6 dimensiones para un brazo SO-101 `so_follower`.
- Manipulación pick-and-place sobre un objeto concreto (cubo verde) en una posición de origen conocida.
- Fusión de percepción multimodal: estado articular más dos vistas de cámara (cenital y de muñeca) a 640x480.
- Predicción de chunks de acción, lo que aporta estabilidad temporal frente a políticas paso a paso.
- Ejecución en bucle cerrado a 30 FPS dentro del ecosistema LeRobot (`lerobot-rollout`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni comportamiento de agente.
- No tiene capacidades de lenguaje, matemáticas, código, visión general ni audio: la cadena de tarea se pasa al rollout como etiqueta, pero no se documenta condicionalidad por lenguaje.
- No tiene modo de razonamiento explícito (thinking mode).

## Casos de uso

- Automatización de pick-and-place en laboratorio o célula de montaje: el modelo ejecuta de forma autónoma la secuencia de recoger el cubo y devolverlo a su posición original, con un bucle de control de 30 FPS que permite reaccionar a la posición real del objeto en cada fotograma.
- Punto de partida para fine-tuning de nuevas tareas: al ser una política ACT de 51,7 M de parámetros entrenada con LeRobot 0.6.0, se puede reentrenar con `lerobot-train` sobre un dataset propio cambiando `--dataset.repo_id` y `--policy.type=act`, reutilizando el pipeline de datos y el formateo de observaciones.
- Base para comparativas de configuración de sensores: permite medir el efecto de usar una o dos cámaras, distintas resoluciones o distintas posiciones de cámara manteniendo constante el resto de la política.
- Docencia e investigación en robótica de bajo coste: un SO-101 con dos cámaras USB y una GPU de gama media es suficiente para reproducir el ciclo completo de teleoperación, grabación de datos, entrenamiento y evaluación, lo que lo hace adecuado para cursos y prácticas de aprendizaje por imitación.
- Evaluación de robustez de políticas de imitación: sirve como sujeto de prueba para estudiar sensibilidad a iluminación, posición inicial del objeto, oclusiones y objetos distractores, cuantificando tasas de éxito por condición.
- Generación de trayectorias de referencia: las predicciones de chunks de acción se pueden registrar y usar como referencia cinemática para validar controladores de bajo nivel, filtros o limitadores de par antes de desplegar políticas más complejas.
- Despliegue en hardware embebido: por su tamaño (menos de 200 MB en FP32) es candidato a ejecutarse en plataformas tipo Jetson para prototipos de brazo autónomo con presupuesto de cómputo reducido, siempre que se valide la latencia real del bucle de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la sección de evaluación marcada como «_No evaluation results have been provided for this policy yet_», sin tabla de ensayos, éxitos ni tasas de éxito en robot real.

## Requisitos de hardware

- Pesos en FP32: 51.668.614 parámetros x 4 bytes ≈ 197 MB (0,19 GiB); en FP16/BF16 ≈ 98 MB. Cálculo derivado del recuento de parámetros, no una medición publicada.
- VRAM práctica para inferencia: no hay cifras publicadas. Con dos flujos de imagen de 3x480x640 y un backbone convolucional, la estimación razonable es inferior a 2 GB, por lo que cualquier GPU con 4 GB o más debería ser suficiente; se trata de una estimación, no de un dato medido.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y 4 GB o más de VRAM. Una RTX 3060, RTX 4060 o RTX 4090 es más que suficiente; también son válidas A100 o H100 si se comparte el nodo con otros procesos.
- Cabe en GPU de consumo: sí, con margen amplio. También es plausible ejecutarlo en CPU, aunque no se dispone de medidas de latencia que confirmen el cumplimiento de los 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=sdadasdaga/act_pick_cube`), PyTorch sobre CUDA. No aplican vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El único dato indirecto es que el dataset se capturó a 30 FPS, lo que implica un presupuesto de control de 33,3 ms por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sdadasdaga/act_pick_cube | 51,7 M | no aplica | Pick-and-place de cubo verde con SO-101 y 2 camaras | Apache 2.0 | Pesos en safetensors en HuggingFace |
| sdadasdaga/act-pick-cube-2cam-chunk50 | no disponible | no aplica | Pick-and-place con SO-101 y 2 camaras (nombre sugiere chunk de 50) | no disponible en la informacion recogida | Pesos publicados en HuggingFace por el mismo autor |
| ACT original (Zhao et al., arXiv:2304.13705) | no disponible en la informacion recogida | no aplica | Manipulacion bimanual de precision con hardware de bajo coste | no disponible en la informacion recogida | Implementacion de referencia vinculada al paper; no se recogen cifras comparables en esta busqueda |

No se dispone de datos publicados de rendimiento para ninguno de los tres, por lo que la comparativa se limita a identificacion, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al entrenarse sobre 50 episodios de una única tarea, con toda probabilidad hereda la distribución limitada de posiciones, iluminación y aspecto del cubo presentes en ese dataset, pero no hay análisis publicado al respecto.
- Riesgo de fallo por sobreajuste a la tarea: el modelo solo se ha entrenado para «Pick up the green cube and place it back in its original position»; fuera de esa tarea no hay garantía de comportamiento coherente.
- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba en robot real. No se recomienda su uso en producción sin una validación propia previa.
- Dependencia estricta del hardware: requiere un robot `so_follower` con cinemática de 6 dimensiones y cámaras nombradas exactamente `overhead` y `wrist`, con la resolución y frecuencia documentadas. Cambiar el montaje, la resolución o el orden de las articulaciones invalida la política.
- Sin capacidades de lenguaje: no acepta instrucciones en lenguaje natural de forma condicionada y no puede generalizar a nuevas tareas descritas textualmente.
- Sensibilidad esperada a condiciones visuales: cambios de iluminación, fondo, posición inicial del objeto u objetos distractores son causas habituales de degradación en políticas ACT, aunque no se cuantifican en este repositorio.
- Licencia: Apache 2.0 permite uso comercial y modificación con atribución y conservación del aviso de licencia. Conviene verificar por separado la licencia del framework LeRobot y del método ACT original si se reutiliza su código.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, y no incluye vídeo de demostración ni resultados de evaluación, por lo que no existe evidencia externa de funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sdadasdaga/act_pick_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/sdadasdaga/so101_green_cube_50ep
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sdadasdaga/so101_green_cube_50ep
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo hermano del mismo autor: https://huggingface.co/sdadasdaga/act-pick-cube-2cam-chunk50
- Perfil del autor: https://huggingface.co/sdadasdaga/datasets
- Tutorial de dataset VLA para reBot (Seeed Studio): https://wiki.seeedstudio.com/rebot_physical_ai_course_chapter_20/
- Demostracion en video de entrenamiento y evaluacion con SO-101: https://www.youtube.com/watch?v=ZPe4O8ms3zk
- Repositorio con framework LeRobot y dataset de pick-and-place SO-101: https://github.com/skr3178/lerobot
