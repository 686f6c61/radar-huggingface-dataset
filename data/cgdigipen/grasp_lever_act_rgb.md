# CGdigipen/grasp_lever_act_rgb

## Resumen

`CGdigipen/grasp_lever_act_rgb` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo lo ha desarrollado el usuario CGdigipen y lo ha publicado en HuggingFace Hub a través de la librería LeRobot de HuggingFace. No es un modelo de lenguaje: es una política visomotora que, a partir de observaciones del robot (estado de las articulaciones e imágenes de dos cámaras, una de ellas con profundidad), predice directamente comandos de acción de 6 dimensiones para un brazo seguidor de tipo `so_follower`.

La tarea concreta para la que se ha entrenado es "grasp the lever handle" (agarrar la palanca), con un dataset de 122 episodios y 86.376 fotogramas grabados a 30 FPS. El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0,2 GB. Es relevante como ejemplo práctico de política ACT con entrada RGB-D en el ecosistema LeRobot, útil para quien quiera replicar el flujo de entrenamiento y despliegue en un robot real de bajo coste.

La licencia no está declarada en la model card ni en los metadatos del repositorio, y no se han publicado resultados de evaluación en robot real. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, lo que indica que es un artefacto de investigación reciente y sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, arXiv:2304.13705) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de imitación; ventana de observación fija por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Robot | `so_follower` |
| Cámaras de entrada | `HEAD`, `RIGHT`, `RIGHT_depth` |
| Entrada de estado | `observation.state` con forma `(6,)` |
| Entrada visual RGB | `observation.images.HEAD` y `observation.images.RIGHT`, forma `(3, 480, 640)` |
| Entrada de profundidad | `observation.images.RIGHT_depth`, forma `(1, 480, 640)` |
| Salida de acción | `action` con forma `(6,)` |
| Dataset de entrenamiento | `CGdigipen/grasp_lever_depth` (122 episodios, 86.376 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 80.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (chunks) en lugar de un único paso por inferencia. La arquitectura combina un codificador visual (típicamente ResNet) que procesa las imágenes de las cámaras, un codificador del estado de las articulaciones y un transformer que fusiona ambas representaciones y decodifica la secuencia de acciones. La predicción por chunks reduce el error de acumulación y mitiga el problema del horizonte de imitación, lo que en la práctica se traduce en trayectorias más suaves y mayor tasa de éxito en tareas de manipulación.

El entrenamiento se ha realizado con 80.000 pasos, batch size 16, AdamW y learning rate 1e-05, sobre el dataset `CGdigipen/grasp_lever_depth`. El dataset contiene 122 episodios teleoperados con 86.376 fotogramas a 30 FPS para la tarea "grasp the lever handle". La model card no detalla la composición exacta del dataset (variabilidad de posiciones, iluminación o distractores), ni si se aplicaron aumentos de datos, regularización o ajuste fino posterior. Tampoco se especifica la arquitectura visual concreta ni el número de capas del transformer; solo se indica el método y la configuración de entrenamiento.

## Capacidades

- Predicción de acciones de 6 grados de libertad para un brazo `so_follower` a partir de estado articular e imágenes.
- Fusión multimodal de dos cámaras RGB (`HEAD`, `RIGHT`) y una cámara de profundidad (`RIGHT_depth`) en una única política.
- Ejecución de la tarea específica "grasp the lever handle" mediante imitación de demostraciones teleoperadas.
- Generación de chunks de acción, lo que permite un control más estable que la predicción paso a paso.
- Despliegue mediante la CLI `lerobot-rollout` con la estrategia `base`.
- Entrenamiento reproducible con `lerobot-train` usando `--policy.type=act`.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades lingüísticas: es una política motora, no un modelo generativo de texto.
- No se documentan capacidades de generalización a otras tareas, objetos o robots distintos del `so_follower`.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible de una política ACT con entrada RGB-D entrenada con LeRobot 0.6.2, útil para comparar configuraciones de entrenamiento y arquitecturas visuales.
- Automatización de una tarea de agarre específica: el modelo se puede desplegar con `lerobot-rollout` para que un brazo `so_follower` agarre la palanca en un entorno controlado, siempre que las cámaras y el robot coincidan con la configuración de entrenamiento.
- Replicación de pipelines de robótica de bajo coste: al estar integrado en LeRobot, permite reproducir el flujo completo (grabación, entrenamiento y despliegue) en hardware asequible tipo SO-100/SO-101.
- Base para ajuste fino con nuevos datos: se puede partir de estos pesos y reentrenar con un dataset propio para una tarea distinta usando `lerobot-train`, aprovechando que la configuración está documentada.
- Docencia y formación: útil como ejemplo práctico de política visomotora con profundidad para cursos de robótica o aprendizaje automático aplicado.
- Evaluación de sensores de profundidad: al incluir una cámara `RIGHT_depth`, permite estudiar el impacto de la información de profundidad frente a solo RGB en tareas de agarre.
- Prototipado de manipulación en laboratorio: adecuado para pruebas internas de agarre de palancas antes de escalar a políticas más generales o a modelos de visión-lenguaje-acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,7 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,2 GB; en FP16, unos 0,1 GB. A esto hay que sumar la memoria de activaciones del codificador visual y del transformer, que depende del tamaño de las imágenes (480x640) y del número de cámaras.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo, una GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para inferencia en tiempo real a 30 FPS, aunque no hay datos publicados que lo confirmen.
- ¿Cabe en GPU consumer? Sí, por el número de parámetros es plausible que quepa en GPUs con 8 GB o menos, pero no hay mediciones oficiales de VRAM ni de latencia.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=CGdigipen/grasp_lever_act_rgb`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La política está pensada para ejecutarse a 30 FPS, la misma frecuencia del dataset de entrenamiento, pero no se han publicado mediciones de latencia por paso ni de throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Entrada | Salida | Dataset | Licencia |
|---|---|---|---|---|---|---|
| `CGdigipen/grasp_lever_act_rgb` | ACT | 51,7 M | Estado (6) + RGB (2 cámaras) + profundidad | Acción (6) | 122 episodios, 86.376 fotogramas | no disponible |
| Políticas ACT de referencia en LeRobot | ACT | no disponible | Estado + RGB | Acción | variables | Apache-2.0 (LeRobot) |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | Estado + RGB | Acción | variables | Apache-2.0 (LeRobot) |
| Políticas VLA (p. ej. OpenVLA) | VLM + acciones | miles de millones | RGB + instrucción textual | Acción | datasets mixtos a gran escala | variable |

La comparación con políticas ACT de referencia y Diffusion Policy es cualitativa: no se dispone de métricas de éxito publicadas para este modelo que permitan una comparación numérica. Frente a modelos VLA, esta política es mucho más pequeña (51,7 M frente a miles de millones de parámetros), está especializada en una única tarea y no acepta instrucciones en lenguaje natural.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en robot, incluso en el entorno de entrenamiento.
- Especialización extrema: la política solo se ha entrenado para "grasp the lever handle" con un robot `so_follower` y una configuración de cámaras concreta. No se espera que generalice a otras tareas, objetos o robots.
- Dependencia de la configuración de sensores: los nombres y formas de las observaciones (`HEAD`, `RIGHT`, `RIGHT_depth`) deben coincidir exactamente con los del entrenamiento; cualquier cambio de cámara, resolución o calibración puede degradar el rendimiento.
- Licencia no declarada: no se puede confirmar el uso comercial. Antes de usarlo en producción hay que contactar con el autor o asumir que no está permitido.
- Riesgo de sobreajuste al dataset: con 122 episodios y 80.000 pasos de entrenamiento, es plausible que la política memorice posiciones y condiciones de iluminación del dataset; no se documentan aumentos de datos ni variabilidad controlada.
- Sin información sobre sesgos: al ser un modelo robótico, no aplican sesgos lingüísticos, pero sí posibles sesgos de distribución de datos (posiciones, objetos, entornos) que limitan la generalización.
- Sin soporte documentado de cuantización ni de despliegue en CPU: no hay guías para inferencia fuera de GPU con LeRobot.
- Repositorio sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, lo que reduce la confianza en su robustez.
- La model card no incluye vídeo de demostración ni resultados de robot real, a pesar de que la plantilla lo sugiere.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CGdigipen/grasp_lever_act_rgb
- Dataset de entrenamiento: https://huggingface.co/datasets/CGdigipen/grasp_lever_depth
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=CGdigipen/grasp_lever_depth
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
