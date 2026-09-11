# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_1k

## Resumen

Se trata de una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario `sam-guided-vlas` en Hugging Face. El modelo es un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05) de Physical Intelligence, un VLA diseñado para generalización en entornos abiertos y adaptado al ecosistema LeRobot desde el repositorio OpenPI. El checkpoint se ha entrenado con el framework LeRobot 0.6.0 sobre un conjunto de datos propio de manipulación con robot Franka Panda.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB, con pesos en formato safetensors bajo licencia Apache 2.0. La política consume una observación compuesta por el estado del robot (vector de 9 dimensiones) y tres cámaras RGB de 224×224 píxeles (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`), y produce un vector de acción de 7 dimensiones.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de ajuste fino de π₀.₅ sobre datos de manipulación de objetos cotidianos (20 tareas distintas, 200 episodios, 69.392 fotogramas a 20 FPS), útil como referencia para investigaciones de imitación y para experimentos de generalización guiada por segmentación (SAM), tal como sugiere el nombre del autor. No hay métricas de evaluación publicadas, por lo que debe considerarse un checkpoint experimental y no un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); familia π₀.₅ (Pi05) de Physical Intelligence, implementada en LeRobot. Detalles de capas no disponibles en la información proporcionada |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones), dato real de safetensors |
| Parametros activos | No aplica; no hay información que indique una arquitectura MoE |
| Longitud de contexto | No disponible. La política procesa una observación por paso: `observation.state` (9,) y tres imágenes (3, 224, 224) |
| Tipos de cuantizacion | No disponible; no se documentan cuantizaciones (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible (política robótica; el concepto de idioma no aplica a la salida de acciones) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamaño del repositorio: 9,4 GB; coherente con pesos en 16 bits, aunque la precisión exacta no se confirma en la información proporcionada) |

Especificaciones adicionales documentadas:

| Parametro | Valor |
|---|---|
| Modelo base | lerobot/pi05_base |
| Tipo de robot | Panda (Franka) |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 224, 224), `observation.images.robot0_eye_in_hand` (3, 224, 224), `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salidas | `action` (7,) |
| Libreria | LeRobot 0.6.0 |
| Pipeline | robotics |
| Dataset de entrenamiento | sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live |
| Episodios / fotogramas | 200 episodios / 69.392 fotogramas a 20 FPS |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica el modelo como π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence concebido para generalizar a entornos y situaciones nuevas, evolucionando π₀. La implementación usada para este checkpoint proviene de LeRobot, que a su vez adapta el repositorio OpenPI del autor original. La información proporcionada no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el número de tokens de contexto, por lo que no se pueden confirmar detalles internos más allá de que se trata de una política VLA que combina observaciones visuales y de estado para emitir acciones continuas.

El ajuste fino se realizó con LeRobot 0.6.0 sobre el dataset `train_1_2_pile__mask__overlay_a75__sim__all_cameras__live`: 200 episodios y 69.392 fotogramas a 20 FPS, lo que equivale a unos 3.470 segundos (≈58 minutos) de datos, con una media de ≈347 fotogramas (≈17 segundos) por episodio. Las 20 tareas cubiertas son "basket", "boxed food", "cake", "can", "hamburger", "lemon", "orange", "spice", "squash", "spray", "soap dispenser", "jam", "jar", "cereal", "knife block", "kettle", "pear", "potato", "sweet potato" y "scone". La configuración de entrenamiento fue: 1.000 pasos, batch de 16, optimizador AdamW, learning rate 0,00025 y semilla 0. Esto supone 16.000 muestras procesadas, es decir, aproximadamente 0,23 épocas sobre el dataset, por lo que el nombre del checkpoint (`lr5x`, `steps_1k`) sugiere un ajuste deliberadamente corto y de alta tasa de aprendizaje, más orientado a experimentación que a convergencia final. No se documenta uso de RLHF, DPO ni de técnicas de decodificación especulativa.

## Capacidades

- Control robótico por imitación: genera vectores de acción de 7 grados de libertad a partir de observaciones multimodales (estado + tres cámaras).
- Percepción visual multi-cámara: procesa simultáneamente una vista externa (`agentview`) y dos vistas de muñeca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`), lo que aporta información de profundidad y de oclusión.
- Manipulación de objetos domésticos y de supermercado: el dataset cubre 20 categorías de tareas, desde coger una naranja o un limón hasta manipular una cafetera, un bloque de cuchillos o un dispensador de jabón.
- Ejecución de tareas condicionada por instrucción textual: el script de despliegue acepta un parámetro `--task` (por ejemplo `"basket"`), lo que implica condicionamiento por lenguaje de la política.
- Generalización a entornos nuevos: según la model card del modelo base, π₀.₅ está diseñado para generalizar a situaciones no vistas durante el entrenamiento.
- Ajuste fino sobre datos propios: la política se puede reentrenar con `lerobot-train` partiendo de `lerobot/pi05_base`.
- No disponible: no hay evidencia de soporte de tool calling, function calling, agentes multi-paso, razonamiento simbólico, generación de código, matemáticas, audio ni modo de pensamiento explícito. Al ser una política VLA, la salida es un vector de acciones, no texto.

## Casos de uso

- Recogida de productos en entornos tipo supermercado o cocina: el modelo está entrenado específicamente con objetos como "can", "jar", "boxed food" o "cereal", por lo que puede emplearse para tareas de pick-and-place sobre esas categorías en un robot Panda con tres cámaras.
- Clasificación y empaquetado en cajas: las tareas "basket" y "boxed food" permiten usar la política para colocar objetos en contenedores, aprovechando la vista externa más las dos vistas de muñeca para estimar la posición relativa.
- Investigación en imitación robótica: sirve como línea base reproducible para comparar variantes de datos (por ejemplo, enmascarado guiado por SAM, como indica el nombre del autor) sobre un mismo modelo base π₀.₅.
- Ablación de configuraciones de entrenamiento: con un coste de solo 1.000 pasos y batch 16, es adecuado para estudiar el efecto de tasas de aprendizaje elevadas (`lr5x`) en ajustes finos cortos de VLA.
- Experimentos de sim-to-real y entrenamiento con datos en directo: el sufijo `sim` y `live` del dataset apunta a mezcla de datos simulados y capturados en vivo, útil para medir transferencia entre dominios.
- Despliegue en laboratorio con Franka Panda: mediante `lerobot-rollout --strategy.type=base` se puede ejecutar la política en el robot real durante un tiempo limitado con `--duration`, sin grabación de episodios.
- Recogida de datos para reentrenamiento: el mismo comando de rollout, sin `--strategy.type=base`, permite grabar episodios nuevos que alimenten un siguiente ciclo de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card indica explícitamente: "No evaluation results have been provided for this policy yet". No existen datos de MMLU, HumanEval, GSM8K ni de tasas de éxito en tareas de manipulación (trials, successes, success rate) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, los pesos ocupan aproximadamente 8,3 GB en precisión de 16 bits y unos 16,6 GB en fp32. A ello hay que sumar activaciones y buffers de visión de tres cámaras a 224×224; una estimación razonable es de 10 a 14 GB en 16 bits (estimación derivada del recuento de parámetros, no un dato publicado).
- GPU recomendadas: NVIDIA A100 (40/80 GB) y H100 para entrenamiento y experimentación cómoda; RTX 4090 (24 GB) para inferencia y ajustes finos pequeños.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 16 GB o más en precisión de 16 bits (RTX 4090, RTX 4080, RTX 3090/4090). No se documentan cuantizaciones de 8 o 4 bits que permitan bajar de ese umbral.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento sobre `lerobot/pi05_base`), con pesos en safetensors y PyTorch. No aplican servidores de inferencia de texto como vLLM, TGI, Ollama o llama.cpp, ya que el modelo no genera texto.
- Latencia y throughput: no disponibles. Como referencia del bucle de control, el dataset de entrenamiento se capturó a 20 FPS, pero no se publica la latencia de inferencia real del checkpoint.
- Entrenamiento: el ajuste fino documentado usó 1.000 pasos con batch 16, lo que es asequible en una única GPU, aunque el consumo exacto de memoria durante el entrenamiento no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 fine-tune) | 4,14 mil millones | No disponible | Sin resultados de evaluación publicados | Apache 2.0 | Hugging Face, vía LeRobot |
| lerobot/pi05_base | No disponible en la información proporcionada | No disponible | No disponible | Apache 2.0 (según el modelo base del que deriva) | Hugging Face, vía LeRobot |
| Otros VLA de la misma categoría (por ejemplo OpenVLA, GR00T N1, RDT-1B) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones de terceros en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La única comparación directa documentada es con el modelo base `lerobot/pi05_base`, del que este checkpoint es un ajuste fino sobre 200 episodios y 69.392 fotogramas con 1.000 pasos de entrenamiento.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas, ni número de ensayos, ni condiciones de prueba. No se puede afirmar que la política funcione de forma fiable en el robot real.
- Entrenamiento muy corto: 1.000 pasos con batch 16 equivalen a unas 0,23 épocas sobre 69.392 fotogramas, con una tasa de aprendizaje elevada (0,00025 y el sufijo `lr5x`). Es probable que el modelo esté infrafitado respecto al dataset.
- Sensibilidad al hardware: la política espera exactamente tres cámaras con nombres concretos (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y un robot de tipo Panda. Cualquier cambio en la disposición, el nombre o la resolución de las cámaras puede degradar el comportamiento.
- Dominio estrecho: las 20 tareas del dataset son de manipulación de objetos de cocina y supermercado. No hay evidencia de generalización a otras tareas, objetos ni morfologías de robot.
- Idiomas: no se documenta ningún soporte multilingüe; el condicionamiento por tarea se realiza con etiquetas cortas en inglés ("basket", "boxed food", etc.).
- Riesgo de alucinación en el sentido generativo: no aplica directamente, pero sí existe riesgo de acciones erráticas o inseguras ante observaciones fuera de distribución, algo crítico en un robot físico.
- Sesgos de datos: el dataset mezcla datos simulados y capturados en vivo (`sim`, `live`) y aplica enmascarado guiado por SAM (`mask`, `overlay_a75`), lo que puede introducir dependencias de las anotaciones de segmentación empleadas durante el entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de `lerobot/pi05_base` y de la implementación OpenPI de π₀.₅; conviene verificar las condiciones del modelo base y de sus dependencias antes de un despliegue comercial.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin demo grabada ni resultados de evaluación; es un artefacto de investigación sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_1k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de imitación (grabación de datos y entrenamiento): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Cita indicada en la model card: `@misc{cadene2024lerobot, ...}` (entrada BibTeX truncada en la información proporcionada)
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con este modelo. Corresponden a la serie de televisión francesa "Sam" (TF1, Wikipedia) y a la empresa de utillaje SAM Outillage, por lo que no se han utilizado como fuentes.
