# Mashrafi163/act_so101_stressball

## Resumen

`Mashrafi163/act_so101_stressball` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para el robot `so_follower` de la familia SO-101. El modelo no es un LLM ni un modelo generativo de texto: es un controlador visomotor que consume el estado articular de 6 grados de libertad y tres cámaras (muñeca, superior y lateral) a resolución 480x640, y produce vectores de acción de 6 dimensiones. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware de consumo.

El problema que resuelve es concreto: ejecutar la tarea "coger la pelota antiestrés y colocarla dentro del cuenco" mediante clonación de comportamiento a partir de 10 episodios de teleoperación (4660 fotogramas a 30 FPS). Es relevante como ejemplo reproducible del flujo completo de LeRobot (grabación, entrenamiento y despliegue) y como política de referencia para tareas de pick-and-place con un único objeto y un único destino.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio. No hay resultados de evaluación en robot real publicados, la licencia no está declarada y no se dispone de información sobre idiomas ni sobre el dataset de preentrenamiento del backbone, más allá de que ACT se entrena desde cero sobre los datos de teleoperación indicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer condicionado por observaciones con cabeza de predicción de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación fija definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la instrucción de tarea es una cadena fija en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot, 0,2 GB) |
| Tipo de robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3,480,640), `observation.images.top` (3,480,640), `observation.images.side` (3,480,640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `Mashrafi163/so101_stressball_bowl_20261127_184008` (10 episodios, 4660 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20000 |
| Batch size | 4 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso por inferencia. La política combina un backbone transformer que procesa las tres vistas de cámara junto con el estado articular de 6 dimensiones, y una cabeza que emite un chunk de acciones de 6 dimensiones. Este diseño reduce el error de compounding y suaviza la ejecución en comparación con políticas paso a paso. El modelo se entrenó con el pipeline de LeRobot 0.7.1 durante 20000 pasos, batch de 4, AdamW con learning rate 1e-05 y semilla 1000, sobre 10 episodios de teleoperación que suman 4660 fotogramas a 30 FPS.

No se documenta en la información disponible el número de tokens de entrenamiento (no aplica en el sentido de LLM), la composición del dataset más allá de la tarea única, ni si hubo aumento de datos, regularización o variaciones de posición de objetos y condiciones de iluminación. Tampoco se especifica la arquitectura exacta del backbone (número de capas, dimensión oculta, número de cabezas) ni la longitud del chunk de acción. El modelo se entrenó desde cero para esta tarea; no se indica el uso de pesos preentrenados.

## Capacidades

- Control visomotor de pick-and-place: recoge una pelota antiestrés y la deposita en un cuenco, a partir de tres vistas de cámara y el estado articular.
- Predicción de chunks de acción de 6 dimensiones para el robot `so_follower` (SO-101).
- Fusión multimodal de tres cámaras (muñeca, superior y lateral) con el estado de las articulaciones.
- Ejecución en tiempo real a 30 FPS mediante `lerobot-rollout` con `--strategy.type=base`.
- Aprendizaje por imitación: replicable con `lerobot-train` sobre nuevos datasets de teleoperación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger la pelota y soltarla en el cuenco sobre un SO-101 real, sirviendo como banco de pruebas para validar la cadena hardware-software de LeRobot antes de escalar a tareas más complejas.
- Docencia y formación en robótica de imitación: al ser un repositorio pequeño (0,2 GB) con dataset y configuración de entrenamiento documentados, permite reproducir el flujo completo de grabación, entrenamiento y despliegue en una sesión práctica.
- Referencia base para fine-tuning: se puede reentrenar con `lerobot-train --policy.type=act` sobre datasets propios y comparar curvas de pérdida y comportamiento contra esta política como línea base.
- Validación de pipelines de inferencia en tiempo real: útil para medir latencia y throughput de `lerobot-rollout` con tres cámaras OpenCV a 640x480 y 30 FPS en una GPU de consumo.
- Pruebas de robustez ante cambios de entorno: permite evaluar cómo degrada una política entrenada con 10 episodios cuando se alteran posiciones del objeto, iluminación o se introducen distractores.
- Integración en flujos de investigación sobre clonación de comportamiento: sirve como punto de partida para estudiar chunking de acciones, número de cámaras y cantidad de episodios necesarios para una tasa de éxito aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tabla de ensayos, éxitos ni tasa de éxito en robot real, ni comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,7 M de parámetros en safetensors, los pesos ocupan del orden de 0,1 GB en FP32 y menos en FP16/BF16; el consumo real vendrá dominado por las tres cámaras a 480x640 y las activaciones del transformer, no por los pesos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con soporte CUDA es candidata; una RTX 4090 o A100 está sobradamente dimensionada, y una GPU de consumo de gama media debería bastar para inferencia.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; la viabilidad real depende de la latencia del pipeline de cámaras y del robot.
- Opciones de despliegue: `lerobot-rollout` (documentado en la model card); `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones; el bucle de control opera a 30 FPS según el dataset, pero no se confirma que la inferencia alcance ese ritmo en hardware concreto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas ACT, Diffusion Policy, VQ-BeT u otras alternativas de LeRobot sobre el mismo robot o la misma tarea, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que se desconoce la fiabilidad real de la política.
- Dataset muy pequeño: 10 episodios y 4660 fotogramas para una única tarea; es probable un sobreajuste al entorno de grabación (posiciones, iluminación, fondo y objeto concretos).
- Tarea única y objeto único: la política está entrenada para "coger la pelota antiestrés y colocarla en el cuenco"; no generaliza a otras instrucciones ni objetos sin reentrenamiento.
- Dependencia de hardware: requiere un robot `so_follower` y tres cámaras con los nombres y la resolución exactos (`wrist`, `top`, `side`, 480x640); un cambio de calibración o de montaje puede degradar el comportamiento.
- Licencia no declarada: no se puede confirmar el uso comercial; la model card marca la licencia como "More Information Needed".
- Sin información sobre sesgos: no aplica en el sentido de sesgos lingüísticos, pero sí existe riesgo de que la política reproduzca sesgos de la teleoperación (velocidades, trayectorias y posiciones del operador).
- Riesgo de fallo silencioso: al no haber métricas de incertidumbre ni detección de fuera de distribución, la política puede ejecutar acciones incorrectas sin aviso en escenarios distintos a los del entrenamiento.
- Idiomas: no aplica; la instrucción de tarea es una cadena fija en inglés y no hay procesamiento de lenguaje natural.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Mashrafi163/act_so101_stressball
- Dataset de entrenamiento: https://huggingface.co/datasets/Mashrafi163/so101_stressball_bowl_20261127_184008
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Mashrafi163/so101_stressball_bowl_20261127_184008
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
