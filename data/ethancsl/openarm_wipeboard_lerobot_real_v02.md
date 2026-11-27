# ethanCSL/openarm_wipeboard_lerobot_real_v02

## Resumen

`ethanCSL/openarm_wipeboard_lerobot_real_v02` es una política robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. El modelo combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice comandos motores condicionados por visión, lenguaje y propiocepción. Con 3.144.016.000 parámetros y un repositorio de 12,6 GB, se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo está especializado en una única tarea de manipulación bimanual: "Left arm pass eraser to right arm to wipe off the board" (el brazo izquierdo pasa el borrador al brazo derecho para limpiar la pizarra). Se ha entrenado sobre el dataset `ethanCSL/openarm_wipeboard_lerobot_real_v02`, compuesto por 20 episodios y 18.601 fotogramas a 30 FPS, capturados con el robot `openarm_umeow` y tres cámaras (cuerpo, muñeca izquierda y muñeca derecha).

Su relevancia radica en que ejemplifica el flujo actual de fine-tuning de modelos fundacionales de robótica sobre hardware abierto y datasets pequeños: parte de un modelo generalista de NVIDIA (GR00T N1.7) y lo adapta con imitation learning a una tarea concreta de un robot de bajo coste. Es, por tanto, un caso práctico de cómo llevar un modelo fundacional a un despliegue real de manipulación con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.2 |
| Tipo de robot | openarm_umeow |
| Camaras | body_cam, wrist_cam, right_wrist_cam |
| Entrada de estado | observation.state, shape (16,) |
| Entrada visual | 3 x (3, 480, 640) |
| Salida de accion | action, shape (16,) |
| Tamano del repositorio | 12,6 GB |

## Arquitectura y entrenamiento

La política se basa en GR00T N1.7, un modelo fundacional cross-embodiment de NVIDIA para razonamiento y habilidades de robots humanoides. La arquitectura combina dos componentes: un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las imágenes de las cámaras y la instrucción en lenguaje natural, y un transformer de acciones con flow matching que genera las acciones motoras condicionadas por visión, lenguaje y propiocepción. La salida es un vector de acción de dimensión 16, y la entrada de estado también es de dimensión 16, correspondiente a la propiocepción del robot `openarm_umeow`.

El entrenamiento se realizó mediante imitation learning con LeRobot 0.6.2 sobre el dataset `ethanCSL/openarm_wipeboard_lerobot_real_v02`: 20 episodios, 18.601 fotogramas a 30 FPS, una única tarea bimanual. La configuración reportada es de 20.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se especifica en la información disponible el número de tokens de entrenamiento del backbone, la composición del dataset original de GR00T N1.7, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas de manipulación bimanual condicionadas por visión, lenguaje y propiocepción.
- Ejecución de la tarea específica "Left arm pass eraser to right arm to wipe off the board" sobre el robot `openarm_umeow`.
- Procesamiento de tres flujos visuales simultáneos a resolución 480x640 (cámara de cuerpo y dos cámaras de muñeca).
- Interpretación de instrucciones en lenguaje natural como condicionamiento de la política.
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; la política ejecuta una tarea de imitación, no un planificador.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión general, audio): no disponible.

## Casos de uso

- Automatización de limpieza de pizarras en entornos educativos o de oficina: la política ejecuta la secuencia de pasar el borrador de un brazo a otro y limpiar la superficie, adecuada para demostraciones de manipulación bimanual con el robot `openarm_umeow`.
- Investigación en imitation learning con datasets pequeños: sirve como referencia de fine-tuning de GR00T N1.7 sobre 20 episodios y 18.601 fotogramas, útil para estudiar la transferencia de modelos fundacionales a tareas concretas.
- Benchmark de políticas LeRobot: al estar publicada con la configuración exacta de entrenamiento, permite reproducir el pipeline `lerobot-train` y comparar variantes de hiperparámetros.
- Prototipado de tareas bimanuales con hardware abierto: el robot `openarm_umeow` y las tres cámaras documentadas facilitan replicar el montaje en laboratorios con presupuesto limitado.
- Docencia en robótica: el flujo `lerobot-rollout` con `--strategy.type=base` y una duración de 60 segundos permite demostrar la ejecución de una política entrenada sin grabar episodios.
- Base para ampliación de tareas de borrado: al ser una política especializada, puede servir como punto de partida para entrenar variantes con más posiciones de objetos, iluminación o distracciones, aunque no se han publicado evaluaciones que lo validen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja la tabla de evaluación vacía (tarea, ensayos, éxitos y tasa de éxito). Tampoco se ofrecen métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144.016.000 parámetros en safetensors, una estimación orientativa en FP16 rondaría los 6,3 GB solo de pesos, más el coste del backbone de visión y del transformer de acciones; en FP32 sería aproximadamente el doble. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de pesos, una GPU con 16 GB o más de VRAM podría alojar los pesos en FP16, pero no se ha validado ni documentado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ethanCSL/openarm_wipeboard_lerobot_real_v02` (GR00T N1.7 fine-tuned) | 3.144.016.000 | no disponible | Manipulación bimanual de borrado de pizarra | Apache 2.0 | Hugging Face, LeRobot |
| GR00T N1.7 (modelo base de NVIDIA) | no disponible en la información proporcionada | no disponible | Modelo fundacional cross-embodiment para humanoides | no disponible en la información proporcionada | GitHub NVIDIA Isaac-GR00T |
| Otras políticas LeRobot del mismo autor o dataset | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único robot (`openarm_umeow`); no se espera que generalice a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni resultados en robot real, por lo que se desconoce su robustez ante variaciones de posición, iluminación o distracciones.
- Dataset pequeño: 20 episodios y 18.601 fotogramas son una base limitada; el riesgo de sobreajuste y de baja generalización es alto.
- Dependencia de las cámaras: los nombres y la configuración de las cámaras (`body_cam`, `wrist_cam`, `right_wrist_cam`) deben coincidir exactamente con los usados en el entrenamiento; un montaje distinto invalida la política.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo de imitación hereda los sesgos de las demostraciones humanas del dataset.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la ejecución de acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Idiomas: no disponible; la instrucción de tarea está en inglés y no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base GR00T N1.7 y sus dependencias (Cosmos-Reason2/Qwen3-VL) pueden tener condiciones adicionales que deben verificarse antes de un despliegue en producción.
- Sin datos de cuantización ni de despliegue en GPU de consumo: la viabilidad en hardware asequible no está confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_wipeboard_lerobot_real_v02
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_wipeboard_lerobot_real_v02
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_wipeboard_lerobot_real_v02
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
