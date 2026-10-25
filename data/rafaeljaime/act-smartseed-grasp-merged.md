# RafaelJaime/act-smartseed-grasp-merged

## Resumen

`RafaelJaime/act-smartseed-grasp-merged` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice trozos de acciones (*action chunks*) en lugar de pasos individuales. La desarrolla el usuario RafaelJaime en el contexto de la robotekin-hackathon, con la etiqueta BraboRobots, y está publicada en el Hub como política de LeRobot para un robot de tipo `so_follower` (familia SO-101). Su cometido es concreto: coger una semilla situada bajo la pinza a partir de dos vistas de cámara.

El modelo consume el estado articular de 6 dimensiones y dos imágenes RGB de 480x640 (cámaras `top` y `wrist`), y devuelve un vector de acción de 6 dimensiones. Con 51.668.614 parámetros, es un modelo pequeño incluso para los estándares de robótica: se puede ejecutar en CPU y cabe holgadamente en cualquier GPU de consumo. Se entrenó con 152 episodios y 54.343 fotogramas a 30 FPS capturados con teleoperación, durante 100.000 pasos con AdamW y una tasa de aprendizaje de 1e-5.

Su relevancia es práctica más que de investigación: sirve como referencia reproducible de un pipeline completo de imitación (grabación, entrenamiento, rollout) en LeRobot 0.6.2, y como punto de partida para fine-tuning en tareas de manipulación de precisión. Conviene subrayar que no es un modelo de lenguaje: no procesa texto ni mantiene conversación, y su "salida" es una secuencia de comandos motores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE condicionado por estilo, sobre codificadores visuales ResNet |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica: no es un modelo de lenguaje; el equivalente funcional es el horizonte del chunk de acciones, cuyo valor no se documenta en la model card |
| Tipos de cuantizacion | No se documentan cuantizaciones para esta política; los pesos se distribuyen en safetensors (fp32 por defecto en LeRobot). Convertibles a fp16/int8 con herramientas externas, sin garantías del autor |
| Idiomas soportados | No disponible / no aplica: no procesa lenguaje natural. La instruccion de tarea es una cadena fija ("grasp the seed below the gripper") usada como condicionamiento |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,1 GB, previsiblemente por acumulacion de checkpoints de entrenamiento) |

## Arquitectura y entrenamiento

ACT formula el control como *behavior cloning* con predicción de chunks: un codificador transformer procesa la secuencia de observaciones (estado de 6 dimensiones más los tokens visuales de las dos cámaras) y un decodificador genera de golpe un bloque de acciones futuras, lo que reduce el error de acumulación típico de las políticas paso a paso. El método incorpora un codificador CVAE que infiere una variable latente de estilo a partir de la secuencia de acciones de la demostración, y entrena con una pérdida combinada L1 sobre las acciones y divergencia KL sobre la latente. En inferencia, la latente se fija a la media (z = 0) y se aplica *temporal ensembling* para suavizar las transiciones entre chunks. Las observaciones visuales se codifican con una ResNet preentrenada en ImageNet, y la posición de la cámara tiene un rol determinante: la política espera exactamente dos claves, `observation.images.top` y `observation.images.wrist`, a 480x640.

El entrenamiento se hizo con LeRobot 0.6.2 sobre el dataset `RafaelJaime/smartseed-grasp-merged`: 152 episodios, 54.343 fotogramas a 30 FPS, una única tarea ("grasp the seed below the gripper"), 100.000 pasos con tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta aumento de datos, número de tokens de entrenamiento (concepto no aplicable aquí) ni fases de RLHF o DPO; es imitación supervisada pura a partir de teleoperación, sin refuerzo. Tampoco se especifica el tamaño del chunk de acciones, la resolución de entrada usada durante el entrenamiento ni la configuración de la ResNet, datos que serían necesarios para reproducir exactamente la política.

## Capacidades

- Manipulación robótica de precisión: genera comandos de 6 dimensiones para un brazo `so_follower` con pinza, orientados a la tarea de agarre de una semilla bajo el efector.
- Percepción visual multi-cámara: fusiona una vista cenital (`top`) y una vista de muñeca (`wrist`) de 480x640 píxeles.
- Control reactivo a partir del estado propioceptivo: usa el vector `observation.state` de 6 componentes (posiciones articulares) junto con las imágenes.
- Predicción de chunks de acción con ensamblado temporal, lo que produce trayectorias más suaves que un control paso a paso.
- Ejecución autónoma mediante `lerobot-rollout` con `--strategy.type=base` durante una duración configurable.
- Reentrenamiento y fine-tuning vía `lerobot-train --policy.type=act` sobre datasets propios en formato LeRobot.
- Sin soporte de tool calling, agentes, razonamiento multi-paso simbólico, matemáticas, código ni diálogo: no es un modelo de lenguaje ni un VLM.
- Sin capacidades de audio, vídeo generativo ni modo "thinking".

## Casos de uso

- **Agarre de semillas en laboratorio de germinación**: la política está entrenada exactamente para esta tarea, por lo que puede desplegarse sin cambios sobre un SO-101 con las dos cámaras en la misma disposición; útil para automatizar la colocación de semillas en placas Petri o bandejas de ensayo.
- **Punto de partida para fine-tuning en manipulación de objetos pequeños**: al estar en formato LeRobot y con recetas estándar, sirve como inicialización para tareas como mover tornillos, componentes SMD o piezas de bisutería, grabando 100-200 episodios propios y reentrenando desde estos pesos.
- **Validación interna de un pipeline de imitación**: equipo que necesite verificar su instalación de LeRobot (versión, cámaras, calibración del brazo) puede usar esta política como prueba de humo reproducible antes de invertir en la grabación de su propio dataset.
- **Línea de clasificación pick-and-place de piezas ligeras**: con reentrenamiento sobre un dataset específico, el mismo esquema encoder-decoder y las mismas dos vistas permiten alimentar una célula de picking de baja carga útil, donde la ventaja es el coste computacional mínimo.
- **Investigación en aprendizaje por imitación comparado**: sirve como base ACT de referencia (51,7 M de parámetros, hiperparámetros documentados) para comparar contra Diffusion Policy o políticas VLA en el mismo banco de pruebas físico.
- **Demostraciones y docencia en robótica open source**: al ser Apache 2.0 y ejecutable en hardware de bajo coste, es apto para talleres y hackathones donde se necesite una política funcional sin presupuesto de GPU.
- **Teleoperación asistida / recogida de datos**: ejecutando la política en paralelo a la teleoperación se pueden grabar episodios corregidos que amplíen el dataset original, una técnica habitual para mejorar políticas ACT con datos on-policy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la plantilla vacía y la nota explícita de que no se han proporcionado resultados para esta política (ni tasas de éxito en robot real, ni número de ensayos, ni condiciones de dificultad). Tampoco se reportan métricas de pérdida de entrenamiento ni curvas de validación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51.668.614 parámetros, los pesos ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16, a los que se suma el coste de activaciones de dos imágenes 480x640 por paso. En la práctica, muy por debajo de 1 GB.
- **GPU recomendadas**: cualquier GPU con soporte CUDA sirve; una RTX 4090 o una A100 están sobredimensionadas para este modelo. Una GTX 1650, una RTX 3050 o una Jetson Orin Nano son suficientes para inferencia en tiempo real.
- **CPU**: la inferencia en CPU es viable dado el tamaño, aunque la latencia puede condicionar el bucle de control a 30 FPS; no hay mediciones publicadas.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo de los últimos ocho años, incluidas las integradas con soporte para PyTorch.
- **Opciones de despliegue**: `lerobot-rollout` es la vía documentada (con `--policy.path` y `--robot.type=so_follower`). vLLM, TGI, llama.cpp u Ollama no aplican: no es un modelo generativo de texto y no tiene formato GGUF.
- **Latencia y throughput**: no disponibles. El límite práctico lo marca la captura a 30 FPS y la física del robot, no el coste de una pasada del transformer.
- **Espacio en disco**: el repo ocupa 3,1 GB, muy superior a los ~207 MB de un único checkpoint, lo que sugiere que incluye varios estados de entrenamiento; conviene descargar solo los ficheros necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-smartseed-grasp-merged (este) | 51,7 M | No documentado (chunk de acciones) | Sin evaluación publicada | Apache 2.0 | Hugging Face, ecosistema LeRobot |
| ACT original (Zhao et al., 2023) | ~80 M en la configuracion del paper | Chunks de ~100 acciones en la configuracion del paper | Tasa de éxito alta reportada por los autores en tareas de manipulación | Codigo abierto (repositorio de los autores) | GitHub, implementaciones en LeRobot |
| Diffusion Policy (Chi et al., 2023) | No disponible en la informacion manejada | Prediccion de secuencias de acciones por difusion | Referencia habitual en manipulacion; sin comparacion directa publicada frente a esta politica | MIT (repositorio original) | GitHub, LeRobot |
| SmolVLA (Hugging Face) | ~450 M segun su model card | Ventana de observacion multimodal con instrucciones en lenguaje | Orientado a generalizacion multi-tarea; no comparable en esta tarea concreta | Apache 2.0 | Hugging Face, LeRobot |

La comparación relevante no es de números absolutos sino de régimen: este modelo es una política de tarea única, entrenada con 152 episodios y sin evaluación, mientras que ACT original y Diffusion Policy son métodos con resultados publicados en varios entornos, y SmolVLA es una política visión-lenguaje-acción de propósito general con mayor coste de inferencia. No existe una comparación cabeza a cabeza en la misma tarea de agarre de semillas.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito, ni número de ensayos, ni condiciones de dificultad. No se puede afirmar que la política funcione de forma fiable en producción.
- **Tarea única y sobreajuste probable**: entrenada solo con "grasp the seed below the gripper" y 152 episodios; es esperable un rendimiento pobre ante objetos, posiciones, iluminación o fondos distintos de los del dataset.
- **Dependencia fuerte de la configuración de cámara**: la política asume nombres de cámara (`top`, `wrist`), resolución 480x640, montaje concreto y tasa de 30 FPS. Cualquier cambio de encuadre o calibración degrada el comportamiento sin aviso.
- **Dependencia del robot**: pensada para `so_follower` (SO-101); no es portable sin reentrenamiento a otros brazos, longitudes de efector o pinzas distintas.
- **Sesgos**: los derivados del dataset de teleoperación (un operador, un laboratorio, un tipo de semilla, una mesa). No hay análisis de sesgo ni de robustez por parte del autor.
- **Riesgo de alucinación en sentido robótico**: la política puede generar trayectorias plausibles pero incorrectas cuando la observación queda fuera de la distribución, sin mecanismo de verificación ni de rechazo; requiere parada de emergencia y límites de par en el controlador.
- **Ausencia de capacidades lingüísticas**: no entiende instrucciones en lenguaje natural; el texto de tarea es una condición fija del entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el aviso de la licencia no cubre las dependencias (LeRobot, PyTorch, pesos de ImageNet de la ResNet) que deben verificarse por separado.
- **Metadatos incompletos**: se desconoce el tamaño del chunk, la política de ensamblado temporal efectiva y la composición exacta del repo de 3,1 GB, lo que dificulta la reproducibilidad estricta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RafaelJaime/act-smartseed-grasp-merged
- Dataset de entrenamiento: https://huggingface.co/datasets/RafaelJaime/smartseed-grasp-merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RafaelJaime/smartseed-grasp-merged
- Paper de ACT: https://arxiv.org/abs/2304.13705 (https://huggingface.co/papers/2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a recetas de cocina y no guardan relacion con esta politica.
