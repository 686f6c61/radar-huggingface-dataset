# sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_5k

## Resumen

Este repositorio contiene un *checkpoint* de ajuste fino del modelo visión-lenguaje-acción (VLA) π₀.₅ (Pi05), desarrollado originalmente por Physical Intelligence y reimplementado en LeRobot a partir de su repositorio OpenPI. El modelo base es `lerobot/pi05_base` y este *checkpoint* concreto ha sido entrenado por el usuario `sam-guided-vlas` como parte de una familia de experimentos de imitación robótica, en este caso combinando máscaras y superposiciones (etiqueta `mask__overlay_a75`) sobre un conjunto de datos de simulación con todas las cámaras activas.

El modelo resuelve el problema del control robótico por imitación: consume el estado del robot (9 dimensiones) y tres cámaras RGB de 224x224 píxeles, y produce un vector de acción continuo de 7 dimensiones. Está especializado en un robot Franka Panda y en tareas de manipulación de objetos cotidianos (dispensador de jabón, mermelada, cuchillo, hervidor, frutas, verduras, etc.), entrenadas sobre un dataset de 200 episodios y 30.830 fotogramas a 20 FPS.

Es relevante ahora porque forma parte de la primera generación de políticas VLA abiertas que se pueden entrenar y desplegar con una cadena de herramientas estándar (LeRobot 0.6.0), y porque documenta un experimento de aumento de datos guiado por SAM (Segment Anything Model) cuya reproducibilidad interesa a la comunidad de investigación en manipulación. Se trata, no obstante, de un artefacto de investigación: no incluye resultados de evaluación y acumula 0 descargas y 0 *likes* en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) π₀.₅ (Pi05); implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones), según safetensors |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | no disponible en la model card; las tareas del dataset están etiquetadas en inglés ("soap dispenser", "jam", "jar", etc.) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | lerobot/pi05_base (finetune) |
| Tipo de robot | Franka Panda (`Panda`) |
| Cámaras de entrada | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Tamaño del repositorio | 9,4 GB |
| Pasos de entrenamiento | 5.000 |
| Tamaño de lote | 16 |
| Optimizador / LR | adamw / 5e-05 |
| Semilla | 0 |
| Versión de LeRobot | 0.6.0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

π₀.₅ es un modelo visión-lenguaje-acción: combina un codificador visual (que procesa tres flujos de imagen de 3x224x224), una representación del estado propioceptivo del robot (vector de 9 componentes) y una instrucción de tarea en lenguaje natural para generar directamente acciones continuas de 7 grados de libertad. La implementación disponible aquí es la de LeRobot, adaptada de OpenPI, y se ajusta por imitación supervisada sobre trayectorias de demostración, no mediante RLHF ni DPO, según la información disponible.

El entrenamiento de este *checkpoint* se realizó sobre el dataset `sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live`, con 200 episodios, 30.830 fotogramas a 20 FPS y 20 tareas de manipulación. La configuración declarada es de 5.000 pasos, lote de 16, optimizador AdamW, tasa de aprendizaje 5e-05 y semilla 0, sobre LeRobot 0.6.0 y hardware con CUDA. El nombre del repositorio sugiere un experimento controlado de aumentación de datos con máscaras y superposiciones al 75 % (`overlay_a75`), en entorno de simulación y con todas las cámaras activas, pero la model card no detalla la innovación técnica ni el pipeline de generación de esas máscaras. No se documentan mecanismos adicionales como decodificación especulativa, atención lineal o *thinking mode*.

## Capacidades

- Generación de acciones robóticas continuas: produce un vector `action` de 7 dimensiones a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa simultáneamente una vista de agente y dos vistas de muñeca a 224x224.
- Fusión de estado propioceptivo y visión: integra un vector de estado de 9 dimensiones con las tres imágenes.
- Condicionamiento por tarea en lenguaje natural: la política acepta un identificador de tarea (por ejemplo, `"soap dispenser"`) para seleccionar el comportamiento.
- Manipulación de objetos cotidianos: cubre 20 tareas de recogida y colocación de alimentos, utensilios y envases.
- Ajuste fino sobre un modelo base preentrenado: admite el flujo `lerobot-train` partiendo de `lerobot/pi05_base`.
- Despliegue en robot real mediante `lerobot-rollout` con estrategia `base`.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso, agentes de software, audio ni generación de texto libre.

## Casos de uso

- Reproducción de experimentos de manipulación: el *checkpoint* permite repetir exactamente la configuración declarada (semilla 0, 5.000 pasos, lote 16) y comparar contra otras variantes de la misma familia de experimentos.
- Estudio de aumentación de datos guiada por SAM: sirve como punto de comparación para medir el efecto de las máscaras y superposiciones (`mask`, `overlay_a75`) sobre la tasa de éxito en tareas de agarre.
- Base para *fine-tuning* en un robot Franka Panda propio: partiendo de este *checkpoint* o de `lerobot/pi05_base`, se puede reentrenar con un dataset específico de laboratorio usando `lerobot-train`.
- Recolección de datos en simulación: al ejecutar la política durante 60 segundos con `lerobot-rollout` se pueden generar trayectorias adicionales para ampliar el dataset de demostración.
- Evaluación *sim-to-real*: el dataset de origen es de simulación con todas las cámaras activas, por lo que resulta útil para medir la brecha de transferencia al montar el mismo *setup* de cámaras en hardware físico.
- Docencia e investigación en VLA: sirve como ejemplo completo y ligero (≈4,1 B de parámetros) de arquitectura visión-lenguaje-acción dentro del ecosistema LeRobot.
- Comparación de configuraciones de cámara: al estar entrenado con tres vistas, permite analizar la contribución de la vista de agente frente a las dos vistas de muñeca.
- Integración en un banco de pruebas de políticas: apto para *pipelines* que comparen checkpoints intermedios a lo largo del entrenamiento (por ejemplo, 5k frente a 10k o 20k pasos de la misma serie).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía y señala explícitamente: *"No evaluation results have been provided for this policy yet."* No se dispone, por tanto, de tasas de éxito por tarea, ni de métricas de error de acción, ni de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 4,14 mil millones de parámetros, sin contar activaciones ni codificador visual): ≈16,6 GB en FP32, ≈8,3 GB en BF16/FP16 y ≈2,1-4,2 GB en cuantizaciones INT4/INT8, no documentadas por el autor.
- GPU recomendadas: A100, H100, L40S o cualquier GPU con 24 GB o más de VRAM para trabajar en BF16 con margen para activaciones y procesamiento de tres cámaras a 224x224.
- GPU de consumo: viable en RTX 3090 y RTX 4090 (24 GB) en BF16; en tarjetas de 12-16 GB el margen es ajustado y requeriría cuantización, no soportada oficialmente.
- Almacenamiento: el repositorio ocupa 9,4 GB, por lo que conviene prever al menos 20 GB libres para pesos, caché y *checkpoints*.
- Despliegue: la vía soportada es LeRobot 0.6.0 (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento) sobre CUDA. No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp, que además no son habituales para políticas VLA.
- Hardware robótico adicional: para el caso de uso previsto se necesita un Franka Panda, su puerto de conexión y tres cámaras configuradas con los nombres de observación exactos del *checkpoint*.
- Latencia y throughput: no disponibles. El único dato relacionado es que el dataset de entrenamiento se capturó a 20 FPS, lo que da una referencia del orden de frecuencia de control esperado, pero no una medición del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este *checkpoint* (`...steps_5k`) | 4.143.404.816 | no disponible | sin resultados publicados | apache-2.0 | público en HuggingFace, 0 descargas |
| lerobot/pi05_base | no disponible en la información proporcionada | no disponible | no disponible | no disponible en la información proporcionada | público en HuggingFace |
| Otros VLA de la misma categoría (por ejemplo, π₀ original, OpenVLA) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La única comparación que puede sostenerse con los datos disponibles es la que enfrenta este *checkpoint* con su modelo base `lerobot/pi05_base`: se trata de un ajuste fino de 5.000 pasos sobre 200 episodios, con licencia apache-2.0 declarada en el repositorio. Para el resto de alternativas de la categoría no se dispone de datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito, ni número de ensayos, ni condiciones de prueba, por lo que no se puede afirmar que la política funcione en ninguna tarea concreta.
- Sesgo de dominio: el entrenamiento proviene de un único dataset de simulación con 200 episodios, un solo tipo de robot (Panda) y una lista cerrada de 20 tareas; la generalización a objetos, posiciones o iluminación distintos no está demostrada.
- Riesgo de sobreajuste: 5.000 pasos sobre 30.830 fotogramas es un régimen corto y muy específico, lo que aumenta la probabilidad de fallos ante variaciones mínimas del *setup*.
- Dependencia estricta de la configuración de sensores: los nombres y resoluciones de las cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`, 224x224) deben coincidir con los del entrenamiento; cualquier cambio invalida la política.
- Idioma: la model card no declara idiomas soportados y las instrucciones de tarea están en inglés, por lo que no hay evidencia de funcionamiento con *prompts* en castellano.
- Confusión de nombre: el identificador del modelo contiene "sam", pero no hay relación con otros proyectos homónimos; las búsquedas web sobre "SAM" devuelven resultados no relacionados (series de televisión, portales de contratación pública, herramientas de ferretería).
- Licencia: aunque el repositorio declara apache-2.0, conviene verificar las condiciones del modelo base `lerobot/pi05_base` y del método original de Physical Intelligence antes de un uso comercial.
- Artefacto de investigación sin mantenimiento aparente: 0 descargas, 0 *likes* y ausencia de resultados de evaluación sugieren que no ha sido validado por terceros.
- Fecha de creación registrada: 2026-09-10, según los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_5k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de imitación (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live
- Repositorio OpenPI: no disponible como enlace directo en la información proporcionada (se menciona en la model card como origen de la implementación)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos corresponden a entidades homónimas sin relación (TF1, SAM.gov, SAM Outillage, máster SAM de la Université Paris-Saclay).
