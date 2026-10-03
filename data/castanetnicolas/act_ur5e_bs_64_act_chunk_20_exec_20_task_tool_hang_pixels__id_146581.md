# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_tool_hang_PIXELS__ID_146581

## Resumen

ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_tool_hang_PIXELS__ID_146581 es una política de robótica entrenada con Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso de control. El modelo ha sido desarrollado por el usuario castanetnicolas y publicado en HuggingFace Hub mediante la librería LeRobot de HuggingFace, lo que lo integra directamente en el ecosistema de entrenamiento e inferencia de políticas robóticas de esa librería.

El modelo resuelve una tarea concreta de manipulación robótica: "Insert the hook into the base to build a frame, then hang the wrench on the hook" (la tarea Tool Hang del benchmark robomimic). Consume observaciones multimodales de bajo nivel (estado de 9 dimensiones y dos imágenes RGB de 84x84 píxeles) y produce vectores de acción de 7 dimensiones. Con 51.590.791 parámetros en formato safetensors y solo 0,2 GB de repositorio, es una política compacta que puede ejecutarse en hardware modesto.

Su relevancia actual es fundamentalmente como artefacto reproducible de investigación: política de imitación entrenada sobre 200 episodios y 95.962 frames a 20 FPS, con licencia Apache 2.0 y todos los ficheros de configuración de LeRobot, lo que permite reproducir el entrenamiento o servir como punto de partida para experimentos de comparación de políticas visuomotoras. No es un modelo de lenguaje ni un sistema multimodal general: es una política de control específica de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación basada en transformer encoder-decoder |
| Parametros totales | 51.590.791 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); procesa estado de 9 dimensiones y dos imágenes de 84x84 píxeles |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors sin cuantizaciones documentadas |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers, paper arXiv:2304.13705) es un método de aprendizaje por imitación que modela la política como un transformer encoder-decoder condicionado por observaciones visuales y de estado. La innovación principal del método es predecir chunks de acciones (bloques de varios pasos de control de una sola vez) en lugar de una acción por paso, lo que reduce el error de composición acumulado y favorece la consistencia temporal de las trayectorias. El nombre del repositorio indica una configuración de chunk de 20 pasos y ejecución de 20 pasos (dato inferido del identificador, no confirmado en la model card). La model card no detalla la presencia de un codificador VAE ni otros componentes internos específicos de la implementación; solo confirma `model_name: act` y la integración con LeRobot 0.6.1.

El entrenamiento se realizó sobre el dataset castanetnicolas/robomimic_tool_hang_ph_image84, con 200 episodios, 95.962 frames y una tasa de 20 FPS. La configuración reportada es: 120.000 pasos de entrenamiento, batch size 64, optimizador AdamW, learning rate 1e-5 y semilla 1000. Se trata de entrenamiento por clonación de comportamiento sobre datos de teleoperación; la model card no menciona RLHF, DPO ni fases de refinamiento por recompensa, algo coherente con el paradigma de imitación. Las entradas declaradas son `observation.state` (9,), `observation.images.sideview` (3, 84, 84) y `observation.images.robot0_eye_in_hand` (3, 84, 84); la salida es `action` (7,).

## Capacidades

- Control visuomotor de manipulación robótica: genera comandos de acción de 7 dimensiones a partir de estado propioceptivo e imágenes.
- Predicción por chunks de acciones, que mejora la estabilidad temporal frente a políticas paso a paso.
- Ejecución de una tarea de ensamblaje concreta: insertar un gancho en la base y colgar una llave inglesa (Tool Hang de robomimic).
- Condicionamiento multi-cámara: usa una vista lateral (`sideview`) y una cámara en el efector (`robot0_eye_in_hand`).
- Entrenamiento e inferencia reproducibles mediante las herramientas de LeRobot (`lerobot-train`, `lerobot-rollout`).
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión general, audio ni modo de pensamiento.
- No se documenta generalización a otras tareas: la política está entrenada para una única tarea.

## Casos de uso

- Investigación en aprendizaje por imitación: reproducir el entrenamiento con `lerobot-train` partiendo del dataset y la configuración documentada, para estudiar la variabilidad respecto a la semilla 1000.
- Comparación de políticas visuomotoras: usar este ACT como referencia frente a otras políticas (Diffusion Policy, BC) sobre el mismo dataset Tool Hang.
- Fine-tuning sobre nuevas tareas: reentrenar la política con un dataset propio de teleoperación reutilizando la receta (120k pasos, batch 64, lr 1e-5) y comparar tasas de éxito.
- Despliegue en robot físico o simulado: ejecutar la política con `lerobot-rollout` sobre un robot tipo panda con las cámaras configuradas con los mismos nombres de observación.
- Automatización de tareas de ensamblaje repetitivas en entornos controlados, donde la tarea está fijada y el entorno es estable.
- Docencia y prototipado en robótica: por su tamaño reducido (51,6 M de parámetros, 0,2 GB), sirve para demostrar el flujo completo de LeRobot (grabar datos, entrenar, desplegar) en hardware asequible.
- Generación de datos sintéticos o de evaluación en simulador robomimic, siempre que se respete la distribución de observaciones del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet" (no se han proporcionado resultados de evaluación), e incluye una plantilla de tabla de éxito en robot real sin cumplimentar. No se dispone de tasas de éxito, MMLU, HumanEval ni métricas equivalentes, que por otra parte no aplican a una política de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión nativa; el repositorio completo ocupa 0,2 GB y el modelo tiene 51,6 M de parámetros.
- Cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia, dado el tamaño reducido.
- GPU profesionales (A100, H100) no son necesarias para servir este modelo; solo tendrían sentido para acelerar el bucle de entrenamiento.
- El cuello de botella real no es el cómputo sino el hardware robótico: el robot (tipo panda según la model card) y las dos cámaras (`sideview`, `robot0_eye_in_hand`) con sus índices y puertos correctos.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) y PyTorch. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La tasa de datos de entrenamiento es de 20 FPS, lo que da una referencia de la frecuencia de control esperada, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

No se dispone de datos cuantitativos comparativos en la información proporcionada. La comparación siguiente es cualitativa y marca como "no disponible" todo dato no confirmado.

| Modelo | Parametros | Contexto / observaciones | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51.590.791 | estado (9,) + 2 imágenes 84x84 | no disponible (sin evaluación publicada) | Apache 2.0 | HuggingFace Hub, LeRobot |
| ACT original (Zhao et al., 2023) | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | paper arXiv:2304.13705 |
| Diffusion Policy | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta búsqueda |
| Behavior Cloning (BC) sobre robomimic | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta búsqueda |

## Limitaciones y advertencias

- Política de tarea única: no generaliza a instrucciones en lenguaje natural ni a tareas distintas de Tool Hang.
- No es un modelo de lenguaje: no hay riesgo de alucinación textual, pero sí de fallo silencioso ante distribuciones de observación fuera del dominio de entrenamiento (iluminación, posiciones de objeto, oclusiones).
- Sin resultados de evaluación: no existe ninguna tasa de éxito medida, ni en simulación ni en robot real, por lo que no se puede garantizar su fiabilidad en producción.
- Discrepancia de nomenclatura: el identificador del repositorio menciona "UR5e" mientras que la model card declara `Robot type: panda`. Conviene verificar el robot de destino antes de desplegar.
- Dependencia estricta de las cámaras: los nombres e índices de cámara deben coincidir con las claves de observación (`observation.images.sideview`, `observation.images.robot0_eye_in_hand`) y respetar la resolución 84x84 del entrenamiento.
- Dataset de origen simulado (robomimic, imágenes de 84x84): el salto a robot real puede degradar el rendimiento por diferencias de dominio visual.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y citar el método (arXiv:2304.13705) y LeRobot.
- Repositorio sin descargas ni "likes" en el momento de la consulta: nula validación por parte de la comunidad.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los enlaces obtenidos correspondían a una cadena de tiendas no relacionada), por lo que no hay fuentes independientes que corroboren su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_tool_hang_PIXELS__ID_146581
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image84
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 | https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image84
