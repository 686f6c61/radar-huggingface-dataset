# Muhammad241198/act_HAN10remove_180

## Resumen

`Muhammad241198/act_HAN10remove_180` es una política robótica de manipulación entrenada con el método ACT (Action Chunking with Transformers), descrito en el artículo arXiv:2304.13705. No es un modelo de lenguaje: es un modelo de imitación (behavior cloning) que, a partir de observaciones del robot y de sus cámaras, predice directamente trozos de acciones (*action chunks*) en lugar de un único paso de control, lo que reduce la acumulación de error y suele elevar la tasa de éxito en tareas de manipulación fina.

El checkpoint lo publica el usuario Muhammad241198 y ha sido generado con LeRobot, la librería de Hugging Face para aprendizaje por imitación, a partir del dataset `REBOOT26/HAN10e_remove`. Contiene 51.766.926 parámetros en formato safetensors (repositorio de 0,2 GB), se distribuye bajo licencia Apache 2.0 y su *pipeline* declarado es `robotics`.

Su relevancia es práctica más que de investigación: sirve como punto de partida reproducible para desplegar una política ACT en un brazo robótico de bajo coste, para hacer *fine-tuning* sobre datos propios de teleoperación o como referencia en comparativas con otras políticas de imitación. Hay que tener en cuenta que el repositorio no incluye resultados de evaluación, no tiene descargas ni *likes* y no documenta el *embodiment* concreto, el tamaño del *chunk* de acciones ni la composición exacta del dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), según arXiv:2304.13705 |
| Parámetros totales | 51.766.926 (≈51,8 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la política opera sobre observaciones y predice un *chunk* de acciones de tamaño no especificado |
| Tipos de cuantización | No disponible; el repositorio contiene pesos en safetensors (0,2 GB, coherente con fp32 para 51,8 M de parámetros) |
| Idiomas soportados | No aplica (política robótica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de tarea (*pipeline*) | `robotics` (aprendizaje por imitación / control de manipulación) |
| Dataset de entrenamiento | `REBOOT26/HAN10e_remove` |
| Tamaño del repositorio | 0,2 GB |
| Fecha de creación en el Hub | 2026-09-10 (según metadatos de Hugging Face) |
| Última actualización en el Hub | 2026-09-10 (según metadatos de Hugging Face) |
| Descargas / *likes* | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un esquema de predicción por bloques: en lugar de emitir una acción por paso de control, el modelo genera una secuencia corta de acciones futuras que luego se ejecutan de forma abierta o con agregación temporal. El artículo de referencia describe un transformer tipo encoder-decoder con una variable latente estilo CVAE que ayuda a modelar la multimodalidad de las demostraciones humanas. Los hiperparámetros concretos de este checkpoint (número de capas, dimensión oculta, número y resolución de cámaras, tamaño del *chunk*, horizonte de observación) no están documentados en la información disponible.

El entrenamiento se realizó con LeRobot sobre el dataset `REBOOT26/HAN10e_remove`, que no viene descrito en la model card: no se indica el número de episodios, la frecuencia de captura, el robot empleado ni el procedimiento de filtrado implícito en el sufijo «remove». Tampoco se documenta si hubo etapas de ajuste adicionales, *reward modeling* o RLHF/DPO; en el caso de ACT, el paradigma habitual es *behavior cloning* supervisado sobre teleoperación, sin refuerzo. El nombre del checkpoint incluye el sufijo «180», que probablemente corresponde al paso o época de entrenamiento, pero esto no está confirmado por el autor.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales y del estado del robot (control *end-effector* o articular, según el dataset).
- Predicción de *action chunks*: emite varias acciones por inferencia, lo que mejora la estabilidad del control frente a políticas que predicen un único paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere recompensa explícita ni simulación.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación/ejecución con `lerobot-record`.
- Ejecución de políticas multi-tarea dentro del mismo dominio de entrenamiento, siempre que las tareas estén representadas en el dataset.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso en lenguaje ni uso como agente conversacional.
- No dispone de modo *thinking*, visión de propósito general, audio ni capacidades multilingües: no procesa texto.

## Casos de uso

- Despliegue en brazos robóticos de bajo coste: la model card muestra el patrón de evaluación con un seguidor tipo SO-100 (`--robot.type=so100_follower`), un robot de escritorio económico; la política puede ejecutar la tarea aprendida con solo una GPU consumer o incluso CPU.
- Evaluación y *benchmarking* interno de políticas de imitación: sirve como línea base ACT sobre el dataset `HAN10e_remove` para comparar variantes de *chunk size*, aumentos de datos o arquitecturas alternativas como Diffusion Policy.
- *Fine-tuning* sobre datos propios: al ser un checkpoint ACT estándar de LeRobot, se puede reentrenar con demostraciones de una celda de trabajo concreta para adaptar la política a nuevos objetos o posiciones.
- Automatización de tareas repetitivas de manipulación (recogida y colocación, inserción, apilado) en entornos semiestructurados donde la variabilidad es baja y el ciclo es corto.
- Recolección de datos asistida por robot en laboratorio: combinado con `lerobot-record`, permite grabar episodios de evaluación etiquetados para auditar la tasa de éxito de la política en condiciones reales.
- Docencia y formación en robótica: el modelo es lo bastante pequeño (51,8 M de parámetros, 0,2 GB) para trabajar con él en un portátil y explicar el ciclo completo teleoperación → entrenamiento → despliegue.
- Investigación en *sim-to-real* y robustez: usar el checkpoint como punto de partida para estudiar la degradación ante cambios de iluminación, posición de cámara o fricción, midiendo la caída de éxito respecto al dominio de entrenamiento.
- Prototipado rápido de aplicaciones de manipulación antes de invertir en un modelo mayor: el coste de inferencia es mínimo y el ciclo de iteración es corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, ni comparaciones con otras políticas, y el repositorio no tiene descargas ni valoraciones que permitan inferir validación por parte de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,2 GB con pesos en fp32 y menos de 1 GB considerando activaciones y *buffers* de imagen, en función de la resolución de las cámaras de entrada (no documentada).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100, que estarían sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU; también es viable la ejecución en CPU y en plataformas embebidas tipo Raspberry Pi o NVIDIA Jetson.
- Opciones de despliegue: LeRobot sobre PyTorch es la vía documentada (`lerobot-record` con `--policy.path`). No se documentan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de política.
- Latencia y *throughput*: no disponibles. El lazo de control efectivo dependerá de la frecuencia de captura del dataset de entrenamiento, de la resolución de las cámaras y del hardware, datos que no se especifican.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observaciones | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Muhammad241198/act_HAN10remove_180` (este) | 51,8 M | No disponible | No publicado | Apache 2.0 | Hugging Face, librería `lerobot` |
| Otros checkpoints ACT entrenados con LeRobot | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Diffusion Policy | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |
| SmolVLA u otras políticas VLA | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

No es posible realizar una comparación cuantitativa con alternativas: la información proporcionada no incluye métricas de éxito, número de parámetros ni condiciones de evaluación de otros modelos de la misma categoría. La única referencia metodológica sólida es el artículo de ACT (arXiv:2304.13705), que define la familia a la que pertenece este checkpoint.

## Limitaciones y advertencias

- Política de imitación fuertemente acoplada a su dataset: el comportamiento fuera de la distribución de `REBOOT26/HAN10e_remove` (nuevos objetos, iluminación, posición de cámara o *embodiment*) no está garantizado y probablemente se degrade.
- Sin evaluación publicada: no hay tasas de éxito, curvas de entrenamiento ni métricas que permitan estimar su calidad real; el repositorio tiene 0 descargas y 0 *likes*.
- Riesgo de acumulación de error (*compounding errors*), inherente al *behavior cloning*: pequeños desvíos en la observación pueden llevar al robot a estados no vistos durante el entrenamiento.
- Sesgos: no se ha documentado la composición del dataset, por lo que se desconocen sesgos de posición, iluminación, tipo de objeto o de operador de teleoperación.
- Riesgo de alucinación en el sentido generativo no aplica, pero sí existe el riesgo de predicciones de acción plausibles y físicamente incorrectas cuando la observación es ambigua.
- Limitaciones de idioma: no aplica, el modelo no procesa ni genera lenguaje natural.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no se especifica la licencia del dataset de entrenamiento `REBOOT26/HAN10e_remove`, que conviene verificar antes de un uso comercial.
- Producción: cualquier despliegue debe incluir límites de par, parada de emergencia y supervisión humana; una política de imitación no ofrece garantías de seguridad física.
- El sufijo «180» del nombre sugiere un checkpoint relativamente temprano (pasos o épocas), pero no está confirmado por el autor.
- La búsqueda web no devolvió resultados relevantes sobre este modelo; los enlaces recuperados no guardan relación con él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muhammad241198/act_HAN10remove_180
- Dataset de entrenamiento: https://huggingface.co/datasets/REBOOT26/HAN10e_remove
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Artículo en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
