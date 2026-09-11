# hackathon1-fmm/act_cube_sort_robot_1_v0_h200x4_20k

## Resumen

`hackathon1-fmm/act_cube_sort_robot_1_v0_h200x4_20k` es una política de robótica entrenada con imitación (imitation learning) mediante el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que consume el estado articular de un brazo robótico y dos cámaras RGB y produce comandos de acción de 7 dimensiones. El autor es el usuario `hackathon1-fmm` y se distribuye bajo licencia Apache 2.0.

El modelo resuelve una tarea concreta y única: ordenar un cubo rojo en la caja derecha y un cubo amarillo en la caja izquierda. Se entrenó sobre el dataset `hackathon1-fmm/cube_sort_robot_1_v0`, con 100 episodios teleoperados, 36.504 fotogramas a 15 FPS, durante 20.000 pasos con AdamW y una tasa de aprendizaje de 1e-5. El checkpoint tiene 51.670.663 parámetros y un tamaño de repositorio de 2,5 GB.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de LeRobot: dataset, entrenamiento y despliegue sobre un robot `rebot_b601_follower`. La model card no incluye resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito alcanzada. El nombre del repositorio sugiere un entrenamiento en 4 GPU H200 durante 20k pasos, pero el hardware no se documenta en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT): transformer con codificadores visuales y decodificador de acciones con chunking |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa action chunking, tamano de chunk no especificado) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (politica de robot; la instruccion de tarea se pasa como cadena de texto en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso, lo que reduce el error de composición y la deriva acumulada en tareas de manipulación de horizonte largo. La política consume dos entradas visuales (`observation.images.front` y `observation.images.wrist`, ambas de 3x480x640) y el estado propioceptivo `observation.state` de 7 dimensiones (típicamente 6 articulaciones más pinza), y emite un vector `action` de 7 dimensiones. El repositorio incluye pesos en safetensors y la configuración de entrenamiento estándar de LeRobot para `policy.type=act`.

El entrenamiento se realizó con LeRobot 0.6.2: 20.000 pasos, batch de 16, optimizador AdamW, learning rate de 1e-5 y semilla 1000. El dataset consta de 100 episodios teleoperados y 36.504 fotogramas grabados a 15 FPS sobre un robot `rebot_b601_follower`, con una única instrucción de tarea en inglés. No se documenta composición adicional del dataset, número de tokens ni etapas de RLHF/DPO, que en este tipo de políticas no aplican; tampoco se declara data augmentation ni innovaciones técnicas adicionales más allá del propio mecanismo de action chunking descrito en el paper.

## Capacidades

- Control visuomotor de un brazo robótico `rebot_b601_follower` a partir de dos cámaras RGB y del estado articular.
- Ejecución de una tarea de clasificación de objetos: "Sort the red cube into the right box and the yellow cube into the left box".
- Generación de acciones continuas de 7 dimensiones mediante predicción de chunks de acción.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita ni entorno simulado.
- No dispone de tool calling ni de function calling.
- No soporta razonamiento multi-paso simbólico ni planificación de agentes; su "razonamiento" es implícito en la política neuronal.
- No tiene capacidades multilingües, de generación de texto, de código, matemáticas, visión general, audio ni modo de pensamiento.
- El prompt de tarea se especifica en inglés en el momento del despliegue, pero no se ha verificado que el modelo interprete variaciones del mismo.

## Casos de uso

- Automatización de clasificación de piezas en línea de montaje: la política puede recoger objetos de dos colores y depositarlos en contenedores distintos, replicando la tarea de ordenación de cubos del dataset de entrenamiento.
- Banco de pruebas para aprendizaje por imitación en laboratorio: sirve como referencia reproducible para comparar ACT frente a otras políticas de LeRobot con el mismo dataset de 100 episodios y 36.504 fotogramas.
- Validación de un pipeline completo de LeRobot: permite recorrer grabación de datos, entrenamiento (`lerobot-train`), publicación en el Hub y despliegue (`lerobot-rollout`) sin escribir código adicional.
- Docencia y formación en robótica: al ser una tarea sencilla y de un solo objetivo, es adecuada para explicar teleoperación, calibración de cámaras y evaluación de políticas.
- Investigación en robustez visual: partiendo de este checkpoint se pueden medir degradaciones al variar iluminación, posición de objetos o presencia de distractores, aunque el autor no aporta esas mediciones.
- Despliegue en hardware de bajo coste: con 51,67 M de parámetros, la inferencia cabe en GPU de consumo e incluso en CPU, lo que facilita montajes de bajo presupuesto.
- Base para fine-tuning en tareas de pick-and-place similares: útil como inicialización cuando se dispone de pocos episodios nuevos sobre el mismo robot y distribución de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con el texto explícito "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito en robot real, número de ensayos ni condiciones de prueba (posiciones nuevas, iluminación, distractores o cambio de robot).

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada por el autor. Como estimación basada en el recuento de parámetros, los pesos ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16/bf16; el consumo real de memoria está dominado por las activaciones de los dos codificadores visuales a 480x640, por lo que un presupuesto de 1-2 GB de VRAM es razonable en fp16. Dato no confirmado por el autor.
- GPU recomendadas: no disponibles en la ficha. El sufijo del nombre del repositorio (`h200x4`) sugiere entrenamiento en 4 GPU H200, pero es una interpretación del nombre y no un dato documentado.
- Cabe en GPU de consumo: previsiblemente sí, en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090). No verificado.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--strategy.type=base`, apuntando a `--robot.type=rebot_b601_follower` y a dos cámaras OpenCV configuradas a 640x480 y 30 FPS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de robótica.
- Latencia y throughput: no disponibles. La frecuencia del dataset es de 15 FPS, lo que da una referencia del ritmo temporal de las demostraciones, pero no se declara la latencia de inferencia del checkpoint.

## Comparativa con modelos similares

No se dispone de datos cuantitativos comparativos en la información proporcionada. Cualitativamente, las alternativas de la misma categoría serían:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| act_cube_sort_robot_1_v0_h200x4_20k (este) | 51.670.663 | no aplica | apache-2.0 | Hugging Face, libreria lerobot | proporcionados en esta ficha |
| ACT original (Zhao et al., arXiv:2304.13705) | no disponible | no disponible | no disponible | paper y repositorio de referencia | no disponible |
| Diffusion Policy (familia soportada por LeRobot) | no disponible | no aplica | no disponible | libreria lerobot | no disponible |
| Otras politicas de LeRobot en el Hub | no disponible | no aplica | variable segun repositorio | Hugging Face | no disponible |

No se han encontrado cifras verificables en la busqueda web realizada, que no devolvio resultados tecnicos relevantes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. La política está especializada en una única tarea y en un entorno de laboratorio concreto, por lo que su comportamiento fuera de esa distribución no está caracterizado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la ejecución de trayectorias erróneas o inseguras cuando la escena difiere de las demostraciones.
- Limitación de datos: solo 100 episodios y 36.504 fotogramas sobre una tarea única, lo que favorece el sobreajuste al entorno, la iluminación y la disposición de objetos de la grabación.
- Dependencia de hardware específico: entrenada para el robot `rebot_b601_follower` con dos cámaras (`front` y `wrist`) y estado de 7 dimensiones. Cambiar el robot, el número de cámaras, su resolución, su montaje o su calibración invalida la política.
- Falta de evaluación: el autor no aporta ninguna tasa de éxito, ni en robot real ni en simulación; no hay garantía de rendimiento publicada.
- Contexto e idioma: no es un modelo de lenguaje, no tiene ventana de contexto, no procesa instrucciones arbitrarias en lenguaje natural ni soporta varios idiomas.
- Lenguaje: la instrucción de tarea se pasa en inglés y no se documenta el comportamiento con paráfrasis o traducciones.
- Licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia y de indicar cambios. Debe citarse además el método ACT (arXiv:2304.13705) y LeRobot según la model card.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni issues documentados.
- Ausencia de garantías de seguridad: al tratarse de una política de control físico, su despliegue requiere límites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hackathon1-fmm/act_cube_sort_robot_1_v0_h200x4_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/hackathon1-fmm/cube_sort_robot_1_v0
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hackathon1-fmm/cube_sort_robot_1_v0
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados tecnicos relevantes sobre este modelo (los resultados obtenidos correspondian a sitios de restauracion, sin relacion con el contenido).
