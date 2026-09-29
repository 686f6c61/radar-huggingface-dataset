# bk912/act_green_cube_to_box

## Resumen

bk912/act_green_cube_to_box es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en el Hub mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. Lo desarrolla el usuario bk912 y está pensado para controlar un robot de tipo `so_follower` equipado con dos cámaras (front y side).

La política resuelve una tarea concreta de manipulación: recoger un cubo verde de una plataforma azul y depositarlo en una caja. Se entrenó sobre un dataset de 50 episodios teleoperados (38.140 fotogramas a 30 FPS) y produce acciones de 6 grados de libertad a partir del estado del robot y de dos flujos de imagen de 480x640 píxeles. El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors con licencia Apache 2.0.

Su relevancia es doble. Por un lado, es un ejemplo reproducible de cómo el pipeline end-to-end de LeRobot permite grabar datos con hardware de bajo coste, entrenar una política ACT y desplegarla en el robot en pocos comandos. Por otro, ACT es una de las referencias más citadas en manipulación robótica con hardware asequible (paper arXiv 2304.13705), por lo que resulta útil como punto de partida para tareas de pick-and-place. No obstante, se trata de una política específica de tarea, sin resultados de evaluación publicados ni métricas de éxito en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder de aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower |
| Camaras | front, side (3, 480, 640 cada una) |
| Entrada de estado | observation.state (6,) |
| Salida de accion | action (6,) |
| Tamano del repo | 0.2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un encoder visual, un transformer encoder-decoder y un decodificador de acciones que genera una secuencia corta de acciones futuras (chunk) en cada paso de inferencia. Esta estrategia, en lugar de predecir una única accion por fotograma, reduce el error de compounding y mejora la estabilidad de las politicas en tareas de manipulación fina. En este caso concreto, el modelo consume el estado del robot (vector de 6 dimensiones) y dos imagenes de 480x640 (vistas front y side) y produce un vector de accion de 6 dimensiones.

El entrenamiento seguido es el estandar de LeRobot para ACT: 10.000 pasos, batch size 48, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando la version 0.6.2 de LeRobot. Los datos proceden del dataset bk912/green_cube_blue_platform_to_box, compuesto por 50 episodios teleoperados, 38.140 fotogramas a 30 FPS y una unica tarea: "Pick up the green cube from the blue platform and place it in the box". No se especifica en la model card si hubo etapas de RLHF, DPO ni ningun otro ajuste posterior; tampoco se detalla la composicion completa del dataset mas alla del numero de episodios y fotogramas.

## Capacidades

- Control robótico por imitación para una tarea de pick-and-place: recoger un cubo verde de una plataforma azul y colocarlo en una caja.
- Percepción multimodal: procesa dos flujos de imagen (480x640) más el estado articular del robot de 6 dimensiones.
- Generación de acciones en chunks: predice secuencias cortas de acciones en lugar de pasos aislados, lo que aporta suavidad y robustez en la ejecución.
- Salida de acción de 6 grados de libertad compatible con el robot so_follower.
- Integración con el ecosistema LeRobot: ejecutable con `lerobot-rollout` y reentrenable con `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, por tratarse de una política robótica y no de un modelo de lenguaje.
- No dispone de modo thinking, visión general de propósito abierto, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en línea de laboratorio: la política puede recoger objetos de una plataforma y depositarlos en un contenedor, replicando la tarea entrenada siempre que la disposición de cámara y robot coincida con la del dataset.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible de ACT para comparar con otras políticas (Diffusion Policy, VQ-BeT) sobre la misma tarea y el mismo dataset.
- Formación y docencia en robótica: permite ilustrar el flujo completo grabar datos, entrenar y desplegar con LeRobot usando un caso de manipulación sencillo y hardware de bajo coste.
- Pruebas de reproducibilidad de ACT: al fijar semilla (1000), pasos (10.000) y configuración, es útil para verificar que una réplica del entrenamiento alcanza un comportamiento similar.
- Punto de partida para fine-tuning en tareas análogas: se puede reentrenar sobre un dataset propio con el mismo formato de observaciones (`observation.state`, `observation.images.front`, `observation.images.side`) y la misma salida de 6 acciones.
- Recolección de nuevos datos con supervisión humana: puede usarse como política inicial en un bucle de teleoperación asistida para ampliar el dataset con episodios adicionales.
- Evaluación de robustez frente a variaciones: útil para medir cómo se degrada una política ACT ante cambios de iluminación, posición de objetos o distractores, comparando tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no hay tabla de tasas de éxito por tarea. No se dispone, por tanto, de métricas como MMLU, HumanEval o GSM8K (no aplicables) ni de tasas de éxito en el robot (aplicables pero no reportadas).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,6 millones de parámetros, la inferencia es muy ligera. En FP32 ocuparía alrededor de 200 MB y en FP16 en torno a 100 MB, sin contar activaciones ni buffers de imagen.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente en la práctica. Se puede ejecutar en RTX 3060, RTX 4090, A100 o H100 sin problema; estas últimas solo aportan ventaja si se paralelizan múltiples políticas o se hace entrenamiento.
- ¿Cabe en GPU de consumo? Sí, holgadamente en cualquier GPU de consumo reciente. Incluso podría ejecutarse en CPU para inferencia, aunque la latencia de control a 30 FPS exige comprobar el rendimiento en el hardware concreto.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch, y el stack de Hugging Face para gestión de pesos safetensors. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a políticas robóticas.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La tarea requiere control a 30 FPS, por lo que la latencia de inferencia debe ser inferior a ~33 ms por paso, pero no se ofrece una medición concreta.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la información proporcionada. A continuación se ofrece una comparación cualitativa con alternativas de la misma categoría dentro del ecosistema LeRobot.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bk912/act_green_cube_to_box | 51,6 M | no disponible | sin resultados publicados | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot | variable | no disponible | no disponible | habitualmente Apache 2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | variable | no disponible | no disponible | habitualmente Apache 2.0 | Hugging Face |

No se conocen valores concretos de parámetros, contexto ni rendimiento de las alternativas en la información disponible, por lo que la comparación cuantitativa queda pendiente.

## Limitaciones y advertencias

- Política específica de tarea: solo está entrenada para "recoger el cubo verde de la plataforma azul y depositarlo en la caja". No generaliza a otras tareas ni a otros objetos sin reentrenamiento.
- Sin resultados de evaluación: la model card no reporta tasa de éxito ni número de ensayos, por lo que se desconoce su fiabilidad real en el robot.
- Dependencia del entorno: el rendimiento depende de que la posición de las cámaras, la iluminación y la disposición física coincidan con las condiciones de recogida de datos.
- Dependencia del hardware: pensada para el robot `so_follower` con dos cámaras concretas (front y side). Cambiar el robot, el número de cámaras o sus nombres rompe la compatibilidad con las observaciones entrenadas.
- Dataset reducido: 50 episodios y 38.140 fotogramas es un volumen modesto, lo que limita la variedad de situaciones cubiertas y puede aumentar la sensibilidad a cambios de entorno.
- Sin datos de sesgo ni de robustez: no se ha publicado información sobre sesgos visuales, sensibilidad a distractores o degradación ante cambios de color/posición.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras cuando la política se sale de la distribución de entrenamiento. Conviene supervisar la ejecución en entornos físicos.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se cite adecuadamente. No impone restricciones de uso más allá de las habituales de esta licencia.
- Sin garantías: se trata de un modelo de investigación publicado por un usuario individual, no de un producto validado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bk912/act_green_cube_to_box
- Dataset de entrenamiento: https://huggingface.co/datasets/bk912/green_cube_blue_platform_to_box
- Dataset (visualización): https://huggingface.co/spaces/lerobot/visualize_dataset?path=bk912/green_cube_blue_platform_to_box
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
