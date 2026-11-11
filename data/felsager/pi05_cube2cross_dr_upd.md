# felsager/pi05_cube2cross_dr_upd

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, orientado a la generalización en entornos abiertos y situaciones no vistas durante el entrenamiento. Esta ficha concreta, `felsager/pi05_cube2cross_dr_upd`, es un ajuste fino del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la librería LeRobot. El modelo resuelve una tarea de manipulación robótica concreta: recoger un cubo de color y colocarlo sobre una cruz roja, usando un brazo UR5e con pinza.

El modelo consume observaciones multimodales (estado del robot de 10 dimensiones y dos cámaras RGB de 480x640) y produce un vector de acción de 10 dimensiones. Está pensado para control robótico de imitación en tiempo real a 30 FPS, no para generación de texto ni tareas de NLP. Su relevancia radica en que demuestra el flujo completo de ajuste fino de un VLA de última generación sobre un dataset propio, con más de 500.000 frames de entrenamiento.

El modelo tiene 4.143.404.816 parámetros totales (aproximadamente 4.140 millones) y un repositorio de 24,5 GB. La licencia es Gemma, heredada del modelo base. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ (Pi05) de Physical Intelligence; implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico; las instrucciones de tarea están en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de visión-lenguaje-acción (VLA) derivado de π₀.₅ de Physical Intelligence, que evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos no vistos en entrenamiento. La implementación utilizada es la de LeRobot, adaptada del repositorio open source OpenPI. El modelo procesa dos flujos visuales (cámara superior y cámara de muñeca, ambas a 480x640 y 3 canales) junto con el estado del robot (10 dimensiones) y emite un vector de acción de 10 dimensiones.

El ajuste fino se realizó sobre el dataset `felsager/vla_cubes_cross_dr`, compuesto por 999 episodios y 510.363 frames a 30 FPS, con cuatro tareas de instrucción en inglés: recoger el cubo verde, azul, amarillo o rojo y colocarlo sobre la cruz roja. La configuración de entrenamiento fue de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot versión 0.6.2. No se dispone de información sobre la composición completa del dataset ni sobre el uso de RLHF o DPO.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones para un brazo UR5e con pinza (`ur5e_hand_e`).
- Percepción visual multimodal: procesa simultáneamente dos cámaras (vista superior y vista de muñeca) a resolución 480x640.
- Seguimiento de instrucciones en lenguaje natural: acepta tareas como "pick up the green cube and place it on the red cross.".
- Discriminación por color: entrenado para distinguir cubos verdes, azules, amarillos y rojos.
- Ejecución en tiempo real: entrenado con datos a 30 FPS, adecuado para control continuo.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No dispone de capacidades de generación de texto, código, matemáticas ni tool calling, al ser un modelo puramente robótico.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo recoge un cubo de color y lo coloca sobre una cruz roja, usando las dos cámaras para localizar el objeto y la diana. Adecuado para prototipos de investigación en robótica de imitación.
- Automatización de tareas de clasificación por color: puede reutilizarse como base para tareas de selección de objetos según su color en celdas de fabricación o laboratorios.
- Investigación en VLA: sirve como punto de partida para estudiar el ajuste fino de π₀.₅ sobre datasets propios con LeRobot, comparando hiperparámetros y composición de datos.
- Docencia y formación en robótica: el flujo completo (grabación de datos, entrenamiento y rollout) es reproducible con hardware UR5e y cámaras OpenCV, lo que facilita prácticas docentes.
- Evaluación de generalización: al estar entrenado sobre 999 episodios y 510.363 frames, permite medir la robustez ante cambios de posición, iluminación o distracciones en el entorno.
- Base para tareas de ensamblaje simple: el vector de acción de 10 dimensiones y la pinza permiten extender el modelo a tareas de colocación precisa sobre dianas visuales.
- Integración en pipelines de LeRobot: puede desplegarse con `lerobot-rollout` y grabar episodios para reentrenamiento iterativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143 millones de parámetros, una estimación orientativa en FP16 sería de aproximadamente 8,3 GB solo para pesos, más el overhead de las dos cámaras y el estado; en FP32 ascendería a unos 16,6 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer de gama alta con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) en FP16, aunque no se confirma en la información.
- Cabe en GPU consumer: probablemente sí en FP16 en GPUs con 12-24 GB, pero no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), integración con hardware UR5e y cámaras OpenCV. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El entrenamiento se realizó a 30 FPS, lo que sugiere que la inferencia debe operar a esa frecuencia para control en tiempo real, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_dr_upd | 4.143.404.816 | no disponible | VLA pick-and-place sobre UR5e | gemma | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA base π₀.₅ | gemma | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: solo realiza las cuatro tareas de pick-and-place sobre cubos de color y cruz roja para las que fue entrenado; no generaliza a otras tareas sin reentrenamiento.
- Hardware específico: requiere un robot UR5e con pinza (`ur5e_hand_e`) y dos cámaras configuradas con los nombres `top` y `wrist`; no es portable a otros robots sin ajuste.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Riesgo de sobreajuste al entorno: al entrenarse con 999 episodios de un dataset concreto, puede fallar ante cambios de iluminación, posiciones de objetos o distracciones no representadas.
- Sesgos: no se documentan sesgos, pero al ser un modelo visual puede verse afectado por condiciones de iluminación y color similares a las del dataset.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma, que impone restricciones y obligaciones específicas; debe revisarse antes de un despliegue comercial.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Sin datos de cuantización: no se indican formatos cuantizados disponibles, lo que limita el despliegue en hardware de bajos recursos.
- Repositorio de 24,5 GB: requiere espacio de almacenamiento considerable y ancho de banda para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_dr_upd
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
