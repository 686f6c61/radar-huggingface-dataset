# kiroaiseoul/act_task06_task07_261006

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de un único paso por inferencia. Este repositorio concreto, publicado por el usuario kiroaiseoul bajo el identificador `kiroaiseoul/act_task06_task07_261006`, es una política entrenada con la librería LeRobot de Hugging Face y empaquetada en formato safetensors. Está asociada al paper arXiv:2304.13705 ("Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware"), que introdujo la arquitectura y la estrategia de chunking.

El modelo resuelve una tarea de control robótico aprendida a partir de demostraciones teleoperadas recogidas en el dataset `kiroaiseoul/task06_task07_261006`. Con 51.687.056 parámetros totales (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB, se trata de una política compacta pensada para ejecutarse en hardware de bajo coste tipo SO-100/SO-101 dentro del ecosistema LeRobot.

Su relevancia es práctica: LeRobot estandariza el entrenamiento, evaluación y despliegue de políticas robóticas, y este checkpoint es un ejemplo reproducible de ACT aplicado a dos tareas concretas (task06 y task07, según el nombre). No es un modelo de lenguaje ni un modelo multimodal de propósito general: es una política de acción cerrada al entorno y a las tareas con las que fue entrenada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE, según arXiv:2304.13705 |
| Parámetros totales | 51.687.056 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no detalla horizonte de observación ni tamaño de chunk) |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (es una política robótica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | kiroaiseoul/task06_task07_261006 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura ACT combina un backbone transformer con un esquema de autoencoder variacional condicional (CVAE). El encoder recibe las observaciones (típicamente imágenes de cámara y el estado de las articulaciones) y el decoder genera un chunk de acciones de longitud k en una sola pasada, lo que reduce el error de compounding que aparece al predecir paso a paso. La variante estándar descrita en el paper emplea además un transformer para fusionar múltiples vistas de cámara antes de alimentar la política.

El entrenamiento de este checkpoint se ha realizado mediante aprendizaje por imitación (behavior cloning) sobre el dataset `kiroaiseoul/task06_task07_261006`, que contiene demostraciones teleoperadas de las tareas task06 y task07. La model card indica que el flujo de trabajo es el estándar de LeRobot (`lerobot-train` con `--policy.type=act`). No se especifica en la información disponible el número de episodios, la composición exacta del dataset, la duración del entrenamiento, ni si se aplicaron fases de refinamiento tipo RLHF o DPO (no aplicables a este tipo de política). Tampoco se detallan innovaciones adicionales más allá de las propias del método ACT.

## Capacidades

- Generación de chunks de acciones robóticas a partir de observaciones visuales y de estado, orientada a control de brazos manipuladores.
- Aprendizaje por imitación a partir de datos teleoperados: reproduce la política demostrada en las tareas task06 y task07.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- Inferencia reproducible mediante `lerobot-record` y `--policy.path`, apuntando a un checkpoint local o del Hub.
- Compatible con robots de bajo coste tipo SO-100 follower (según el ejemplo de la model card).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (no es un modelo de lenguaje).
- Capacidades multilingües: no disponible (no procesa lenguaje natural).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Manipulación robótica de una sola tarea: desplegar el checkpoint en un brazo SO-100/SO-101 para ejecutar la tarea concreta task06 aprendida por imitación, sirviendo como referencia de reproducción de una política ACT entrenada con LeRobot.
- Segunda tarea específica (task07): reutilizar el mismo checkpoint para la tarea task07, ya que el nombre indica que se entrenó conjuntamente sobre ambas.
- Banco de pruebas de pipelines de imitación: usar este modelo como punto de partida para comparar hiperparámetros de entrenamiento ACT (chunk size, resolución de cámara, número de episodios) dentro de LeRobot.
- Evaluación reproducible en laboratorio: ejecutar `lerobot-record` con `--episodes=10` para medir la tasa de éxito de la política en el entorno físico, generando un dataset de evaluación prefijado con `eval_`.
- Fine-tuning sobre datos propios: partir de estos pesos y reentrenar con `lerobot-train` sobre un dataset propio del mismo robot, reduciendo el coste frente a entrenar desde cero.
- Docencia y formación en robótica de bajo coste: ejemplo autocontenido (0,2 GB) para ilustrar el flujo completo dataset -> entrenamiento -> inferencia con LeRobot sin necesidad de infraestructura pesada.
- Integración en demostraciones de hardware asequible: al ser una política de 51,7 M de parámetros, puede ejecutarse en GPUs de consumo o incluso CPU para pruebas, facilitando demos en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una política de 51,7 M de parámetros en safetensors (repositorio de 0,2 GB), la huella en memoria es reducida; se estima por debajo de 1 GB en precisión completa, sin datos oficiales confirmados.
- Cabe en GPU de consumo: sí, con amplio margen (RTX 3060, RTX 4090 y similares).
- Posible ejecución en CPU: plausible para pruebas y evaluación, aunque el rendimiento en tiempo real dependerá del entorno; no confirmado por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para esta política; no se requiere A100/H100.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`); compatible con el flujo estándar de Hugging Face Hub. vLLM, TGI u Ollama no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kiroaiseoul/act_task06_task07_261006 | 51,7 M | no disponible | no disponible | apache-2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot (por ejemplo, entrenadas sobre datasets distintos) | variable, en el rango de decenas de millones | no disponible | no disponible | normalmente apache-2.0 | Hugging Face Hub |
| Diffusion Policy (política alternativa en LeRobot) | no disponible | no disponible | no disponible | no disponible | Hugging Face Hub / GitHub |
| SmolVLA (política multimodal de LeRobot) | no disponible en esta ficha | no disponible | no disponible | no disponible | Hugging Face Hub |

No se dispone de datos cuantitativos para comparar rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser una política entrenada por imitación, hereda los sesgos y las limitaciones de las demostraciones teleoperadas del dataset `kiroaiseoul/task06_task07_261006`.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de generalización deficiente fuera de la distribución de las demostraciones (tareas, posiciones y condiciones de iluminación vistas durante el entrenamiento).
- Limitaciones de contexto o idioma: no procesa lenguaje natural; su alcance se limita a las observaciones sensoriales y al espacio de acciones del robot para el que fue entrenado.
- Restricciones de licencia: apache-2.0, lo que permite uso comercial con atribución y sin garantías; conviene revisar los términos del dataset de entrenamiento por si imponen condiciones adicionales.
- Especificidad de tarea: el nombre del repositorio sugiere que la política cubre únicamente task06 y task07; no debe asumirse capacidad de generalización a otras tareas o robots sin reentrenamiento o fine-tuning.
- Ausencia de métricas: el autor no publica tasa de éxito ni curva de aprendizaje, por lo que el rendimiento real en el entorno físico no puede verificarse con la información disponible.
- Compatibilidad: el checkpoint está pensado para el flujo LeRobot; su uso fuera de esa librería requiere adaptar el pipeline (configuración de política, preprocesado de observaciones y normalización de acciones).
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kiroaiseoul/act_task06_task07_261006
- Dataset de entrenamiento: https://huggingface.co/datasets/kiroaiseoul/task06_task07_261006
- Paper ACT: https://huggingface.co/papers/2304.13705
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
