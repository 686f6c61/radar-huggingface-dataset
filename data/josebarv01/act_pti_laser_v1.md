# Josebarv01/act_pti_laser_v1

## Resumen

`Josebarv01/act_pti_laser_v1` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario Josebarv01 en Hugging Face mediante la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robots reales. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado del robot y dos flujos de cámara y emite comandos de acción de 6 dimensiones.

El modelo parte de un fine-tuning sobre `Josebarv01/act_pti_coger_v7` y se ha entrenado con el dataset propio `Josebarv01/pti_laser_todo`, compuesto por 45 episodios y 31.728 fotogramas a 30 FPS. La tarea es concreta: "pick up the cup, follow the laser and place it where the laser turns off", es decir, coger un vaso, seguirlo con un puntero láser y dejarlo donde el láser se apaga. El robot objetivo es un `so_follower` (brazo SO-100/SO-101 de LeRobot) con dos cámaras, `top` y `wrist`, ambas a 480x640.

Con 51.668.614 parámetros (unos 51,7 M), el modelo es muy ligero y está pensado para inferencia en tiempo real en hardware modesto, no para despliegue en clústeres. Su relevancia es la de un ejemplo práctico de pipeline completo de LeRobot: grabación de datos con teleoperación, entrenamiento de una política ACT y publicación en el Hub con instrucciones de rollout reproducibles. La licencia y los idiomas no están declarados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación por fotograma, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo no lingüístico; la tarea se especifica en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes para las cámaras `top` y `wrist`) con un transformer que fusiona las observaciones (imágenes y estado del robot de 6 dimensiones) y decodifica un chunk de acciones de 6 dimensiones. La innovación central del método, descrita en el paper arXiv:2304.13705, es predecir secuencias cortas de acciones en lugar de una acción por paso, lo que reduce el error de compounding y mejora la estabilidad en tareas de manipulación con datos de teleoperación. El modelo incluye el mecanismo de CVAE (variational autoencoder condicional) típico de ACT para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.6.2 durante 10.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-05, con semilla 1000. El dataset de partida tiene 45 episodios y 31.728 fotogramas a 30 FPS, lo que supone aproximadamente 17,6 minutos de demostraciones teleoperadas para una única tarea. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF/DPO (no aplica en aprendizaje por imitación), ni aumentos de datos.

## Capacidades

- Control visomotor de un brazo robótico `so_follower` a partir de dos cámaras RGB (480x640) y el estado articular de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones (posiciones/velocidades articulares) para ejecución en bucle cerrado.
- Ejecución de una tarea de manipulación específica: coger un vaso, seguimiento de un puntero láser y colocación en el punto donde el láser se apaga.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere modelado explícito del entorno ni recompensas.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política de control, no un modelo generativo de texto.
- No incluye modo "thinking", visión general, audio ni otras modalidades fuera de las dos cámaras especificadas.

## Casos de uso

- Manipulación pick-and-place guiada por señal visual: el modelo coge un objeto y lo deposita en la posición indicada por un puntero láser, aprovechando la cámara `top` para localizar el láser y la `wrist` para el agarre fino. Es el caso para el que fue entrenado.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un pipeline ACT completo con LeRobot, útil para comparar hiperparámetros, tamaños de dataset y estrategias de chunking en entornos académicos.
- Prototipado rápido de tareas robóticas: con 45 episodios y 10.000 pasos de entrenamiento se obtiene una política funcional, lo que permite iterar sobre nuevas tareas en horas en lugar de semanas.
- Base para fine-tuning en tareas relacionadas: al partir de `act_pti_coger_v7`, se puede reentrenar con nuevos datasets manteniendo el backbone visual y adaptando solo la cabeza de acciones, reduciendo el coste de datos.
- Banco de pruebas de hardware de bajo coste: con 51,7 M de parámetros, la inferencia cabe en GPUs de consumo y en placas tipo Jetson, lo que permite validar brazos SO-100 en laboratorios con presupuesto limitado.
- Docencia y formación en robótica: el comando `lerobot-rollout` documentado en la model card permite reproducir la política en un robot físico con una sola línea de comandos, adecuado para prácticas de posgrado.
- Evaluación de robustez frente a iluminación y distractores: al depender de un puntero láser, es un caso interesante para estudiar cómo varía la tasa de éxito con cambios de iluminación, color del láser o posición del vaso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de pérdida de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros (unos 207 MB de pesos), más el coste de los dos flujos de imagen a 480x640. En la práctica, menos de 2 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También es viable en Jetson Orin Nano o Raspberry Pi 5 con acelerador, aunque no se documenta latencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que internamente usa PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponibles. La model card no reporta frecuencia de control efectiva ni tiempo de inferencia por chunk; el dataset se grabó a 30 FPS, lo que sugiere que el bucle de control debe operar en ese orden de magnitud, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Josebarv01/act_pti_laser_v1` | 51,7 M | ACT (imitación) | 2 cámaras 480x640 + estado (6,) | no disponible | Hugging Face (LeRobot) |
| `Josebarv01/act_pti_coger_v7` (modelo base) | no disponible | ACT (imitación) | no disponible | no disponible | Hugging Face (LeRobot) |
| ACT original (paper arXiv:2304.13705) | ~80 M (según paper, no confirmado en esta ficha) | ACT (imitación) | configurable | código abierto (repo del paper) | GitHub del paper |
| Políticas Diffusion Policy (referencia de la categoría) | variable | difusión para control | configurable | código abierto | Repos públicos |

La comparación con modelos de lenguaje no aplica: este modelo pertenece a la categoría de políticas de control robótico y solo es comparable con otras políticas de imitación (ACT, Diffusion Policy, VQ-BeT, etc.). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Tarea única y muy específica: solo se ha entrenado para "coger el vaso, seguir el láser y dejarlo donde el láser se apaga"; fuera de ese escenario no hay garantía de comportamiento útil.
- Dataset pequeño: 45 episodios y 31.728 fotogramas (~17,6 minutos) implican baja cobertura de posiciones, iluminaciones y configuraciones; el riesgo de sobreajuste al entorno de grabación es alto.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que no se puede afirmar robustez ni fiabilidad en producción.
- Dependencia de hardware concreto: asume un robot `so_follower` con cámaras `top` y `wrist` a 480x640 y 30 FPS; cambiar la disposición, resolución o tipo de cámara invalida la política.
- Sensible a condiciones visuales: al depender de un puntero láser, cambios de iluminación, color del láser o reflectancia de la superficie pueden degradar el comportamiento. No documentado, pero inherente al diseño.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: la tarea se especifica en inglés en el prompt de rollout; no hay soporte multilingüe documentado.
- Riesgo de alucinación en sentido figurado: como política de imitación, puede generalizar de forma incorrecta a estados no vistos y ejecutar acciones plausibles pero erróneas sin señal de incertidumbre.
- Sin cuantizaciones publicadas: no hay versiones GGUF/INT8/INT4, lo que limita el despliegue en hardware muy restringido sin trabajo adicional de conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Josebarv01/act_pti_laser_v1
- Modelo base: https://huggingface.co/Josebarv01/act_pti_coger_v7
- Dataset de entrenamiento: https://huggingface.co/datasets/Josebarv01/pti_laser_todo
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Josebarv01/pti_laser_todo
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
