# nebula2wx/pi05_fluent_merged_20261108

## Resumen

`nebula2wx/pi05_fluent_merged_20261108` es un modelo de visión-lenguaje-acción (VLA) para robótica, un fine-tuning de `lerobot/pi05_base`, que a su vez implementa la arquitectura π₀.₅ (Pi05) de Physical Intelligence. El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres flujos de cámara) y produce acciones de 6 dimensiones para un robot `so_follower` (SO-100/SO-101 de LeRobot). Resuelve el problema de control robótico por imitación para una tarea concreta: recoger un bloque rojo y depositarlo en un plato.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,1 mil millones) en formato safetensors, y se distribuye a través de la librería LeRobot 0.6.2. El repositorio ocupa 293,5 GB, lo que sugiere la presencia de múltiples checkpoints o artefactos de entrenamiento además de los pesos finales. Está entrenado sobre 200 episodios y 51.731 fotogramas a 30 FPS, con 30.000 pasos de entrenamiento.

Es relevante ahora porque representa el flujo típico de fine-tuning de políticas VLA open source sobre hardware de bajo coste (brazo SO follower), un patrón cada vez más común en laboratorios de robótica que necesitan adaptar modelos fundacionales a tareas específicas sin reentrenar desde cero. La licencia es Gemma, heredada del modelo base, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), transformer multimodal con entrada de estado, imágenes y texto de tarea |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea se especifica en inglés: "pick up the red block and put it on the plate") |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.2 |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower |
| Camaras de entrada | wrist, head, empty_camera_0 |
| Dimension de estado | (6,) |
| Dimension de accion | (6,) |
| Resolucion de imagen | 480x640 (wrist, head), 224x224 (empty_camera_0) |
| Tamano del repo | 293,5 GB |
| Episodios de entrenamiento | 200 |
| Fotogramas de entrenamiento | 51.731 |
| FPS de datos | 30 |
| Pasos de entrenamiento | 30.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 5e-05 |
| Seed | 1000 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ (Pi05) de Physical Intelligence, un modelo VLA diseñado para generalización en entornos abiertos que evoluciona π₀. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La política consume tres flujos visuales (cámara de muñeca a 480x640, cámara de cabeza a 480x640 y una cámara vacía a 224x224) junto con el estado articular de 6 dimensiones, y emite un vector de acción de 6 dimensiones. El texto de la tarea se pasa como condicionamiento ("pick up the red block and put it on the plate").

El entrenamiento se realizó por imitación supervisada (behavior cloning) sobre dos datasets combinados: `Whyynnot/standard_3_4_red_pick_up_fluent_20261108_211725` y `Whyynnot/standard_3_4_red_pick_up_fluent_enhanced_20261108_221610`, sumando 200 episodios y 51.731 fotogramas a 30 FPS. Se ejecutaron 30.000 pasos con batch size 8, optimizador AdamW y learning rate 5e-05. No se documenta en la información disponible el uso de RLHF, DPO ni otras etapas de alineación posteriores al fine-tuning por imitación. Tampoco se detalla la composición exacta del dataset más allá de la tarea única y el tipo de robot.

## Capacidades

- Control robótico por imitación: genera trayectorias de acción de 6 dimensiones para un brazo `so_follower` a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente tres flujos de cámara y el estado articular.
- Condicionamiento por instrucción en lenguaje natural: acepta una descripción textual de la tarea.
- Ejecución de una tarea específica: "pick up the red block and put it on the plate".
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, ni capacidades de visión general más allá del control robótico.
- No se documenta modo de pensamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Recogida y colocación de objetos en línea de montaje: el modelo ejecuta la tarea de coger un bloque rojo y ponerlo en un plato, replicable en celdas de pick-and-place con objetos de color y forma similares.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el fine-tuning de políticas VLA sobre hardware de bajo coste (SO follower), con un dataset pequeño (200 episodios) y configuración reproducible documentada.
- Prototipado rápido de políticas robóticas: el flujo `lerobot-train` con `--policy.path=lerobot/pi05_base` permite adaptar el modelo a nuevas tareas en pocas horas de grabación.
- Docencia y laboratorios de robótica: el modelo y su pipeline son adecuados para enseñar el ciclo completo de grabación de datos, entrenamiento y despliegue con LeRobot.
- Benchmarking de hardware SO-100/SO-101: permite evaluar latencia y fiabilidad de un brazo de bajo coste ejecutando una política VLA de 4,1 mil millones de parámetros.
- Base para experimentos de generalización: al derivar de π₀.₅, diseñado para generalización en entornos abiertos, sirve para medir hasta qué punto el fine-tuning sobre una tarea estrecha degrada o preserva esa generalización.
- Automatización de tareas de manipulación simples en entornos controlados: con las tres cámaras configuradas y el robot calibrado, puede desplegarse en demostraciones de recogida de objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4,14 mil millones de parámetros en safetensors, los pesos en precisión completa (fp32) ocuparían aproximadamente 16,6 GB; en bf16/fp16, unos 8,3 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de parámetros, una GPU con 12-16 GB de VRAM podría alojar los pesos en bf16, pero no se documenta.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=nebula2wx/pi05_fluent_merged_20261108`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota: el repositorio ocupa 293,5 GB, muy superior al tamaño de los pesos, lo que sugiere checkpoints intermedios u otros artefactos; conviene descargar solo los ficheros necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nebula2wx/pi05_fluent_merged_20261108 | 4.143.404.816 | no disponible | VLA (π₀.₅ fine-tuned) | gemma | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA (π₀.₅ base) | no disponible | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA | no disponible | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Tarea única: el modelo está entrenado exclusivamente para "pick up the red block and put it on the plate"; no se documenta generalización a otras tareas.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de hardware concreto: requiere un robot `so_follower` y tres cámaras con nombres y resoluciones específicos (`wrist`, `head`, `empty_camera_0`); cualquier desviación en la configuración puede degradar el rendimiento.
- Dataset pequeño: 200 episodios y 51.731 fotogramas son una base limitada; el riesgo de sobreajuste a posiciones, iluminación y objetos del dataset es alto.
- Licencia Gemma: heredada del modelo base, impone restricciones de uso comercial y obligaciones específicas; debe revisarse la política de licencia de Gemma antes de cualquier despliegue comercial.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés.
- Riesgo de alucinación en el sentido de acciones no válidas o trayectorias erráticas fuera de la distribución de entrenamiento; no hay datos sobre este comportamiento.
- Sesgos: no documentados, pero al derivar de un modelo base entrenado con datos no especificados, pueden heredarse sesgos visuales o de manipulación.
- Repositorio de gran tamaño (293,5 GB): la descarga completa es costosa; conviene filtrar ficheros.
- Fecha de creación futura (2026-11-11) en los metadatos: verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/nebula2wx/pi05_fluent_merged_20261108
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset 1: https://huggingface.co/datasets/Whyynnot/standard_3_4_red_pick_up_fluent_20261108_211725
- Dataset 2: https://huggingface.co/datasets/Whyynnot/standard_3_4_red_pick_up_fluent_enhanced_20261108_221610
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
