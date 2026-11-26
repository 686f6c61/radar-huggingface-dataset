# SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_Pi05

## Resumen

El modelo `SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_Pi05` es una política de visión-lenguaje-acción (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence, ajustada fina sobre el modelo base `lerobot/pi05_base` mediante la librería LeRobot. Lo desarrolla el usuario SamerAyyad y está pensado para controlar un brazo robótico UR5 equipado con una pinza de succión en una tarea concreta de manipulación: recoger una CPU y colocarla en una caja.

La relevancia de este artefacto no reside en su novedad algorítmica, sino en que es un ejemplo reproducible de ajuste fino de un modelo VLA de propósito general sobre un dataset propio de 200 episodios y 128.036 fotogramas a 30 FPS. Sirve como referencia práctica para quien quiera entrenar políticas de imitación con LeRobot sobre hardware real y entender el flujo completo: grabación de datos, entrenamiento, despliegue y evaluación.

El modelo tiene 4.143.404.816 parámetros (~4,1 mil millones), se distribuye en formato safetensors, ocupa 9,4 GB en el repositorio y se publica bajo licencia Apache 2.0. No incluye resultados de evaluación en la información disponible, lo que limita cualquier valoración cuantitativa de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,1 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/pi05_base` |
| Tipo de robot | `ur5` |
| Cámaras | 1 cámara (`camera`), resolución 480x640, 3 canales |
| Entrada de estado | `observation.state`, shape `(7,)` |
| Salida de acción | `action`, shape `(7,)` |
| Dataset de entrenamiento | `SamerAyyad/VLA_Samer_22.11.2026_200eps` (200 episodios, 128.036 fotogramas, 30 FPS) |
| Tarea entrenada | "Pick up the CPU with the suction gripper and place it in the box" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de π₀.₅ (Pi05), un modelo de visión-lenguaje-acción desarrollado por Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La arquitectura combina percepción visual (una imagen de 3x480x640), estado proprioceptivo del robot (vector de 7 dimensiones) y una instrucción en lenguaje natural para producir directamente un vector de acción de 7 dimensiones, típico de un brazo UR5 de 6 grados de libertad más la pinza.

El ajuste fino se realizó sobre el dataset `VLA_Samer_22.11.2026_200eps`, compuesto por 200 episodios y 128.036 fotogramas grabados a 30 FPS, todos correspondientes a una única tarea de pick-and-place con pinza de succión. El entrenamiento empleó 20.000 pasos con batch size 32, optimizador AdamW y learning rate 2,5e-05, con semilla 1000, sobre LeRobot 0.6.2. No se especifican en la información disponible detalles sobre composición del dataset más allá de la tarea, ni si hubo etapas de RLHF o DPO (poco habituales en políticas de imitación robótica).

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones para un UR5 con pinza de succión a partir de una imagen y el estado del robot.
- Ejecución de una tarea concreta de pick-and-place: "Pick up the CPU with the suction gripper and place it in the box".
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como texto al desplegar la política.
- Percepción visual monocular: procesa una única cámara a 480x640 y 30 FPS.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- Ajuste fino adicional: al derivar de `lerobot/pi05_base`, puede reentrenarse sobre nuevos datasets con el mismo pipeline.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, modo thinking, visión general o audio en la información disponible.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo ejecuta la secuencia de recogida de una CPU con pinza de succión y su depósito en una caja, adecuado para tareas repetitivas de manipulación sobre un UR5 en un puesto fijo.
- Base para ajuste fino en tareas similares: partiendo de este checkpoint o de `lerobot/pi05_base`, un equipo puede reentrenar con su propio dataset LeRobot para nuevas piezas u objetivos, reutilizando la configuración de entrenamiento documentada (20.000 pasos, batch 32, AdamW, lr 2,5e-05).
- Prototipado rápido de políticas de imitación: sirve como referencia reproducible para validar el flujo completo de LeRobot (grabación, entrenamiento, rollout) antes de invertir en datasets mayores.
- Investigación en evaluación de políticas VLA: al no incluir resultados de evaluación, es un caso útil para que un laboratorio independiente mida la tasa de éxito real en su propio UR5 y compare con otras políticas.
- Docencia y formación en robótica de manipulación: el modelo, su dataset y los comandos de despliegue permiten montar prácticas de imitación aprendizaje con hardware asequible (UR5 + cámara USB).
- Integración en pipelines de investigación con OpenPI/LeRobot: al derivar de la implementación abierta de π₀.₅, encaja en flujos de experimentación que ya usen esas librerías.
- Despliegue en entornos controlados de laboratorio: útil para pruebas de repetibilidad de una tarea concreta antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni condiciones de evaluación (posiciones de objeto, iluminación, distracciones, robot distinto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de ~4,1 mil millones de parámetros en precisión completa (FP32) requeriría del orden de 16 GB solo para pesos, y en FP16/BF16 unos 8 GB; estas cifras son estimaciones genéricas y no están confirmadas para este checkpoint.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo, GPUs con al menos 16-24 GB de VRAM (RTX 4090, A100, H100) son candidatas razonables, pero no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas de 24 GB en BF16 según el recuento de parámetros, aunque no está verificado ni documentado por el autor.
- Opciones de despliegue: `lerobot-rollout` (documentado en la model card) y el ecosistema LeRobot; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para una política VLA de robótica.
- Latencia y throughput: no disponibles. La política está pensada para operar a 30 FPS según la tasa del dataset, pero no se documenta el tiempo de inferencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_Pi05` | ~4,1 mil millones | no disponible | Pick-and-place CPU con UR5 | Apache 2.0 | Hugging Face |
| `lerobot/pi05_base` | no disponible en la información | no disponible | VLA de propósito general (base) | no disponible en la información | Hugging Face |
| π₀.₅ (Pi05) original de Physical Intelligence | no disponible en la información | no disponible | VLA de propósito general | no disponible en la información | Blog y OpenPI |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la información | no disponible | Manipulación por imitación | variable | Hugging Face / LeRobot |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación rigurosa. La comparación cualitativa principal es que este checkpoint es un ajuste fino específico de tarea sobre `lerobot/pi05_base`, mientras que el modelo base es de propósito general.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito ni de robustez; cualquier uso en producción exige una evaluación propia.
- Especialización extrema: entrenado solo para una tarea ("Pick up the CPU with the suction gripper and place it in the box") sobre un UR5 con pinza de succión; no se espera que generalice a otras tareas, objetos o efectores.
- Dependencia de hardware concreto: asume un UR5, una cámara con resolución 480x640 y un estado de 7 dimensiones; cambiar la configuración requiere reentrenamiento.
- Dataset pequeño y de un solo operador: 200 episodios y 128.036 fotogramas pueden no cubrir variaciones de iluminación, posiciones de objeto o distracciones; riesgo de sobreajuste al entorno de grabación.
- Riesgo de alucinación y acciones erráticas: como toda política de imitación, puede producir acciones fuera de distribución ante entradas no vistas; requiere supervisión y paradas de seguridad en el robot.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea se pasa como texto, pero no hay información sobre idiomas cubiertos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base `lerobot/pi05_base` y de la implementación OpenPI de la que deriva.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual pueden aparecer sesgos derivados del dataset de grabación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_Pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_22.11.2026_200eps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_22.11.2026_200eps
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
