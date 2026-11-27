# arvinesmaeilydev/smolvla_PickUpTheCube_Blue_Red_Dual_2x100_Focus

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, publicada por el usuario `arvinesmaeilydev`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 200 episodios para la tarea de recoger cubos azules y rojos con un robot de tipo `so_follower` (SO-100/SO-101). El modelo consume el estado articular y tres cámaras (superior y muñeca) y produce acciones de 6 dimensiones a 30 FPS.

El interés de esta publicación es doble: por un lado, demuestra el flujo completo de fine-tuning de SmolVLA sobre hardware de bajo coste; por otro, sirve como referencia práctica de cómo se estructura un checkpoint de política robótica en el Hub (pesos safetensors, configuración de normalización y metadatos del dataset). Con 450 millones de parámetros, el modelo está pensado para ejecutarse en GPUs de consumo, lo que lo hace accesible para laboratorios pequeños y aficionados avanzados.

Es relevante ahora porque los VLA ligeros están desplazando a los pipelines clásicos de imitación (ACT, Diffusion Policy) en tareas de manipulación de un solo brazo, al incorporar un backbone de lenguaje que permite condicionar la política mediante instrucciones en lenguaje natural ("pick up the blue cube", "pick up the red cube").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, derivada de SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), 3 cámaras RGB (3, 256, 256) |
| Salidas | `action` (6,) |
| Robot objetivo | `so_follower` (SO-100/SO-101) |
| Frecuencia de control | 30 FPS |
| Tamano del repo | 12,5 GB |
| Libreria | LeRobot 0.6.2 |

## Arquitectura y entrenamiento

SmolVLA combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones que genera comandos motores condicionados por la instrucción de tarea. La arquitectura completa se describe en el paper arXiv:2506.01844; esta ficha no reproduce sus detalles internos porque la model card no los especifica. El checkpoint aquí publicado parte de `lerobot/smolvla_base` y se ha fine-tuneado con el pipeline de LeRobot, que serializa tanto los pesos como la configuración de normalización de observaciones y acciones.

El entrenamiento se realizó sobre el dataset `arvinesmaeilydev/PickUpTheCube_Blue_Red_Dual_2x100_Focus`: 200 episodios, 85.682 frames a 30 FPS, con dos tareas etiquetadas ("pick up the blue cube" y "pick up the red cube"). La configuración reportada es de 20.000 pasos, batch de 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún proceso de alineación posterior; se trata de aprendizaje por imitación supervisado puro sobre demostraciones teleoperadas.

## Capacidades

- Generación de acciones de control de 6 dimensiones para un brazo robótico `so_follower` a partir de observaciones multimodales.
- Condicionamiento por instrucción en lenguaje natural: la misma política resuelve dos tareas distintas ("pick up the blue cube" y "pick up the red cube") seleccionables en tiempo de inferencia mediante el parámetro `--task`.
- Fusión de tres vistas RGB (cámara superior y cámaras de muñeca) con el estado articular en un único vector de observación.
- Ejecución en bucle cerrado a 30 FPS, adecuada para control reactivo de manipulación.
- Integración nativa con el CLI de LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión general, audio ni modo "thinking"; es un modelo especializado en control motor, no un asistente conversacional.

## Casos de uso

- Recogida de objetos por color en línea de montaje: la política selecciona el cubo azul o el rojo según la instrucción `--task`, lo que permite reutilizar un único checkpoint para clasificar y manipular piezas en una cinta transportadora.
- Base para fine-tuning en laboratorio: al partir de `lerobot/smolvla_base` con 450 M de parámetros, un equipo con una sola GPU puede adaptar la política a una tarea nueva en horas, no días, usando el mismo pipeline de 20.000 pasos documentado.
- Benchmark de referencia para comparar políticas de imitación: sirve como línea base reproducible (semilla 1000, hiperparámetros fijos) frente a ACT o Diffusion Policy en tareas de pick-and-place con SO-101.
- Docencia y formación en robótica: el coste del hardware (brazo SO-100 de bajo coste más tres cámaras USB) y la licencia Apache 2.0 permiten montar prácticas completas de aprendizaje por imitación sin licencias propietarias.
- Prototipado de agarre con doble cámara de muñeca: las tres vistas (`camera1`, `camera2`, `camera3`) permiten evaluar cómo afecta la redundancia visual a la tasa de éxito en agarres con oclusión parcial.
- Automatización de tareas de clasificación en almacén pequeño: con 30 FPS de control y contexto visual de 256×256, el modelo es suficiente para separar dos clases de objetos en un radio de trabajo corto, sin necesidad de infraestructura cloud.
- Investigación en robustez visual: al estar entrenado con 85.682 frames sobre posiciones variables, permite estudiar la degradación de la política ante cambios de iluminación o distractores añadiendo episodios al dataset y reentrenando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni evaluaciones en robot real en la información disponible. La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet._" y deja la tabla de evaluación sin rellenar. No se dispone de tasas de éxito, MMLU, HumanEval ni métricas equivalentes para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 M de parámetros en fp32, los pesos ocupan aproximadamente 1,8 GB; en bf16, unos 0,9 GB. A ello hay que sumar activaciones y buffers de las tres cámaras a 256×256.
- GPU recomendadas: no se especifican en la model card. El paper de SmolVLA indica que está diseñado para hardware de consumo; una RTX 4090, RTX 3090 o RTX 4080 deberían ser suficientes para inferencia en tiempo real a 30 FPS.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM, dado el tamaño del modelo. No hay confirmación oficial para GPUs de gama de entrada (GTX 1650, RTX 3050).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles. El control opera a 30 FPS, lo que fija un presupuesto de 33 ms por paso de inferencia, pero no se reporta la latencia real medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_PickUpTheCube_Blue_Red_Dual_2x100_Focus | 450 M | 3 cámaras 256×256 + estado (6,) | Pick-and-place de cubos azul/rojo con SO-100 | Apache 2.0 | Hugging Face, 260 descargas |
| lerobot/smolvla_base | no disponible | multimodal VLA | Modelo base VLA generalista | Apache 2.0 | Hugging Face (modelo base) |
| ACT (Action Chunking Transformer) | no disponible en esta ficha | imágenes + estado | Imitación robótica | no disponible | Implementado en LeRobot |
| Diffusion Policy | no disponible en esta ficha | imágenes + estado | Imitación robótica | no disponible | Implementado en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, entradas, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha visto dos tareas ("pick up the blue cube" y "pick up the red cube") sobre un robot `so_follower` concreto; no generaliza a otros objetos, brazos ni instrucciones fuera de ese vocabulario.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante cambios de iluminación, posición inicial o distractores.
- Dependencia del hardware exacto: los nombres y la calibración de las cámaras (`top`, `wrist`) y del puerto del robot deben coincidir con los del entrenamiento; un montaje distinto degradará el rendimiento sin aviso.
- Riesgo de sobreajuste al dataset: 200 episodios y 20.000 pasos de entrenamiento con semilla fija sugieren un ajuste fino a las condiciones de recogida de datos; no se documenta aumento de datos ni validación cruzada.
- Sesgos: no evaluados. Al ser un modelo de control motor, los sesgos relevantes son de distribución (colores, posiciones, condiciones de luz del dataset), no de contenido lingüístico.
- Alucinación en el sentido de acciones espurias: como toda política de imitación, puede generar trayectorias fuera de distribución ante observaciones no vistas, con riesgo físico para el entorno.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; para producción conviene validar la política en el hardware destino antes de desplegarla.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe ni se ha validado el condicionamiento en castellano.
- Repo de 12,5 GB: incluye checkpoints y artefactos de entrenamiento además de los pesos; conviene descargar solo los ficheros safetensors necesarios para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arvinesmaeilydev/smolvla_PickUpTheCube_Blue_Red_Dual_2x100_Focus
- Dataset de entrenamiento: https://huggingface.co/datasets/arvinesmaeilydev/PickUpTheCube_Blue_Red_Dual_2x100_Focus
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=arvinesmaeilydev/PickUpTheCube_Blue_Red_Dual_2x100_Focus
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
