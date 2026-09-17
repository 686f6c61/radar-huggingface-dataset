# kiroaiseoul/act_task07_open_refrigerator_14D_260916

## Resumen

El modelo `kiroaiseoul/act_task07_open_refrigerator_14D_260916` es una política robótica de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada por el usuario kiroaiseoul en HuggingFace Hub bajo la librería LeRobot. No es un modelo de lenguaje: es un controlador entrenado para una tarea de manipulación concreta, identificada en el nombre como "open refrigerator" (abrir un frigorífico) con un espacio de 14 dimensiones. El repositorio tiene 51.687.056 parámetros (unos 51,7 millones) y ocupa 0,2 GB, lo que lo sitúa en la gama muy ligera de políticas robóticas.

ACT es un método de imitation learning presentado en el artículo arXiv 2304.13705 que, en lugar de predecir una única acción por paso, predice fragmentos cortos de acciones (action chunks). Este enfoque reduce el error de composición típico de las políticas paso a paso y suele alcanzar tasas de éxito elevadas en tareas de manipulación con datos teleoperados. El modelo sigue el formato y el flujo de trabajo estándar de LeRobot: se entrena con `lerobot-train` y se evalúa con `lerobot-record`.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de muy bajo coste computacional que cabe en cualquier GPU de consumo y que sirve como punto de partida para reproducir el pipeline de LeRobot. Por otro lado, advierte de que se trata de una política específica de tarea, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con datos de entrenamiento limitados al dataset indicado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación basada en transformer; referencia arXiv 2304.13705 |
| Parametros totales | 51.687.056 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (política robótica; usa horizonte de observación y chunk de acciones, no contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje; los idiomas figuran como no disponibles en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos del repositorio: pipeline declarado `robotics`, etiquetas `lerobot`, `safetensors`, `robotics`, `act`, `dataset:kiroaiseoul/task07_open_refrigerator_14D`, `arxiv:2304.13705`, `license:apache-2.0`, `region:us`; descargas 0; likes 0; creado y actualizado el 2026-09-17; tamaño del repositorio 0,2 GB.

## Arquitectura y entrenamiento

ACT se describe en la model card como un método de imitation learning que predice fragmentos cortos de acciones en lugar de pasos individuales. Aprende a partir de datos teleoperados y, según el propio autor, suele alcanzar tasas de éxito elevadas. El peso concreto de este repositorio es de 51,7 millones de parámetros, coherente con una política ACT compacta orientada a una única tarea de manipulación.

El entrenamiento se ha realizado y publicado con LeRobot, la librería de HuggingFace para robótica. El dataset asociado es `kiroaiseoul/task07_open_refrigerator_14D`, cuyo número de episodios, composición, cámaras utilizadas y frecuencia de control no se detallan en la información disponible. No se indica si hubo fases adicionales de ajuste, RLHF o DPO, ni innovaciones técnicas más allá del propio método ACT. La model card únicamente documenta los comandos de entrenamiento (`lerobot-train --policy.type=act`) y de evaluación (`lerobot-record` con `--policy.path`), sin especificar hiperparámetros, número de tokens de entrenamiento ni recetas de aumento de datos.

## Capacidades

- Predicción de acciones robóticas en forma de chunks (varios pasos de acción por inferencia), en lugar de una única acción por paso.
- Ejecución de una tarea de manipulación específica: apertura de un frigorífico, según el identificador del modelo y del dataset.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensa explícita ni entorno simulador declarado.
- Compatibilidad nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación e inferencia con `lerobot-record`.
- Integración con robots del tipo `so100_follower`, tal como aparece en el ejemplo de evaluación de la model card.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, de generación de texto, de código, de matemáticas ni de visión entendida como modelo multimodal general.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Automatización de una tarea concreta de manipulación: abrir un frigorífico con un brazo robótico. El modelo está entrenado específicamente para ese gesto, de modo que su uso principal es ejecutarlo de forma repetible en un banco de pruebas físico.
- Reproducción sobre hardware de bajo coste: la model card muestra el uso con `so100_follower`, un brazo de tipo SO-100, lo que permite desplegar la política en plataformas económicas sin GPU dedicada.
- Línea base para investigación en imitation learning: sirve como referencia ACT con licencia Apache 2.0 para comparar contra políticas propias sobre el mismo dataset.
- Fine-tuning sobre datos propios: al estar publicado en formato LeRobot, un equipo puede reentrenar la política con sus propias demostraciones para una tarea distinta siguiendo el flujo `lerobot-train`.
- Validación de pipelines de evaluación robótica: el comando `lerobot-record --policy.path=...` permite lanzar episodios de evaluación etiquetados con el prefijo `eval_` y medir la tasa de éxito de forma sistemática.
- Docencia y formación en robótica: por su tamaño reducido (51,7 millones de parámetros, 0,2 GB), es un ejemplo manejable para explicar action chunking, teleoperación y despliegue de políticas en el aula o en talleres.
- Pruebas de integración en una celda robótica de laboratorio: encadenar la apertura del frigorífico como subpaso dentro de una secuencia mayor gestionada por un orquestador externo, ya que ACT devuelve chunks de acciones y no decisiones de alto nivel.
- Generación de rollouts para análisis: ejecutar la política sobre el entorno real o sobre una réplica para recoger trazas de acciones y diagnosticar modos de fallo antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de tasa de éxito, número de episodios evaluados ni comparaciones con otras políticas. El artículo de referencia (arXiv 2304.13705) reporta resultados de ACT, pero corresponden al trabajo original y no a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors suman 51.687.056 parámetros, lo que equivale a aproximadamente 0,21 GB en fp32 y 0,10 GB en fp16/bf16. Con activaciones y buffers de imagen, el consumo agregado debería mantenerse muy por debajo de 1 GB en fp32.
- GPU recomendadas: cualquier GPU con soporte CUDA moderna es sobradamente suficiente. No se requiere A100, H100 ni siquiera una RTX 4090; una GPU de gama de entrada o integrada sirve para la inferencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de las últimas generaciones, y también en CPU para inferencia, dado el tamaño del modelo.
- Opciones de despliegue: LeRobot es la vía documentada (`lerobot-train` para entrenamiento y `lerobot-record` para evaluación/inferencia). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica de estas características.
- Latencia y throughput estimados: no disponibles. La model card no incluye mediciones de frecuencia de control, tiempo de inferencia por chunk ni episodios por minuto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kiroaiseoul/act_task07_open_refrigerator_14D_260916` (ACT) | 51.687.056 | no aplica | no disponible | apache-2.0 | HuggingFace Hub, 0 descargas |
| Otras políticas ACT publicadas en LeRobot Hub | no disponible | no aplica | no disponible | variable segun autor | HuggingFace Hub |
| Diffusion Policy (políticas de difusión para manipulación) | no disponible | no aplica | no disponible | variable segun implementacion | repositorios academicos |
| Modelos VLA tipo OpenVLA / pi0 | no disponible en esta busqueda | no disponible | no disponible | variable | HuggingFace Hub |

No se dispone de datos verificables en la información proporcionada para establecer una comparación cuantitativa de parámetros, contexto, rendimiento, licencia y disponibilidad frente a alternativas concretas.

## Limitaciones y advertencias

- Modelo específico de tarea: el nombre indica "open refrigerator", por lo que su uso fuera de esa tarea no está respaldado por la documentación y muy probablemente degrade hasta el fallo.
- Sin benchmarks publicados: no hay evidencia numérica de tasa de éxito, número de episodios de evaluación ni robustez ante variaciones de iluminación, posición de la nevera o tipo de tirador.
- Datos de entrenamiento opacos: no se detalla el número de episodios, la composición del dataset, el número de cámaras ni la frecuencia de control, lo que dificulta reproducir el entrenamiento.
- Riesgo de sobreajuste al entorno de demostración: al ser una política de imitación entrenada con teleoperación, tiende a reproducir las condiciones exactas de las demostraciones y a fallar ante distribuciones distintas.
- Idiomas: no aplica, al no ser un modelo de lenguaje. No debe tratarse como un modelo conversacional ni evaluarse con métricas tipo MMLU o HumanEval.
- Licencia: apache-2.0, que permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia correspondientes. Aun así, conviene verificar la licencia del dataset asociado antes de reutilizarlo.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes, por lo que no existe validación externa por parte de la comunidad.
- Fechas del repositorio: creado y actualizado el 2026-09-17 con apenas medio minuto de diferencia, lo que sugiere una publicación automática más que un artefacto mantenido.
- Advertencia sobre la búsqueda web: las consultas realizadas devolvieron exclusivamente resultados sobre generadores de imágenes texto-a-imagen sin relación con este modelo, por lo que no aportan información adicional ni enlaces relevantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/act_task07_open_refrigerator_14D_260916
- Dataset de entrenamiento: https://huggingface.co/datasets/kiroaiseoul/task07_open_refrigerator_14D
- Artículo ACT (página de papers de HuggingFace): https://huggingface.co/papers/2304.13705
- Artículo ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
