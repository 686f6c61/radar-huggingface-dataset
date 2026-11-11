# JanPhilipp/smolvla_full_sim_1234

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado originalmente por Hugging Face y publicado en el paper arXiv:2506.01844. Este repositorio concreto, `JanPhilipp/smolvla_full_sim_1234`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` realizado por el usuario JanPhilipp mediante la librería LeRobot 0.6.1. El modelo transforma observaciones multimodales (estado del robot y hasta tres cámaras RGB de 256x256) en acciones de control de 6 grados de libertad para un robot tipo `so_follower` (SO-100/101).

El modelo resuelve el problema de la manipulación robótica mediante imitación: dado un par de imágenes y el estado articular, predice la siguiente acción motora. Su relevancia radica en que los modelos VLA tradicionales requieren GPUs de datacenter, mientras que SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que democratiza la experimentación en robótica de manipulación.

Este fine-tuning concreto ha sido entrenado sobre el dataset `maxmeyer/three_tool_opt_sim_r4_hybrid_trio_20261105_094503` (423 episodios, 307.360 frames a 30 FPS) para cuatro tareas de traslado de herramientas (alicates, martillo y destornillador) desde una zona verde a una zona roja. Cuenta con 450 millones de parámetros y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), transformer multimodal con flow matching (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.1 |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Entradas | observation.state (6,), 3 imagenes (3, 256, 256) |
| Salidas | action (6,) |
| Tamano del repositorio | 24.9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un cabezal de acciones entrenado con flow matching, siguiendo la arquitectura descrita en el paper arXiv:2506.01844. El modelo consume tres cámaras RGB de 256x256 píxeles junto con el vector de estado articular de 6 dimensiones y emite un vector de acción también de 6 dimensiones. Está optimizado para inferencia en hardware de consumo, lo que lo diferencia de VLA de mayor escala como OpenVLA o π0.

El fine-tuning se realizó durante 20.000 pasos con batch size 64, optimizador AdamW y learning rate 1e-5, con semilla 1000, sobre el dataset sintético `maxmeyer/three_tool_opt_sim_r4_hybrid_trio_20261105_094503` (423 episodios, 307.360 frames a 30 FPS). Las tareas entrenadas son cuatro instrucciones de traslado de herramientas. No se dispone de información sobre la composición exacta del dataset base original de SmolVLA ni sobre si se aplicó RLHF o DPO en el entrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación mediante imitación: predice acciones de 6 grados de libertad a partir de observaciones visuales y de estado.
- Procesamiento multimodal: integra tres flujos de cámara RGB simultáneos con el estado articular.
- Condicionamiento por instrucción en lenguaje natural: acepta tareas como "Move the pliers from the green area to the red area".
- Ejecución en bucle cerrado a 30 FPS, sincronizada con la frecuencia de captura del dataset.
- Soporte de despliegue en hardware de consumo (diseño explícito de SmolVLA).
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües en la información disponible.

## Casos de uso

- Manipulación de laboratorio en simulación: el modelo puede ejecutar las cuatro tareas de traslado de herramientas (alicates, martillo, destornillador) en entornos simulados, sirviendo como política de referencia para comparar algoritmos de imitación.
- Investigación en aprendizaje por imitación: al estar fine-tuneado sobre un dataset público y reproducible, permite estudiar el efecto de hiperparámetros (pasos, batch, learning rate) sobre el rendimiento en tareas de pick-and-place.
- Prototipado de robots SO-100/101: con `lerobot-rollout` y un robot `so_follower` real, el modelo puede desplegarse en minutos para validar pipelines de captura-acción antes de entrenar políticas propias.
- Benchmarking de VLA compactos: sirve como baseline de 450M parámetros frente a modelos VLA mayores en tareas de manipulación de objetos.
- Generación de datos sintéticos de demostración: las trayectorias generadas pueden usarse para aumentar datasets de imitación en tareas de traslado de herramientas.
- Docencia y formación: su bajo coste computacional y su integración con LeRobot lo hacen adecuado para cursos prácticos de robótica de manipulación con hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 450M parámetros en fp32 serían aproximadamente 1,8 GB solo de pesos, más overhead de activaciones y cámaras.
- GPU recomendadas: no disponible; SmolVLA está diseñado para hardware de consumo según el paper.
- Compatibilidad con GPU de consumo: el diseño del modelo base apunta a que sí, aunque no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; el dataset opera a 30 FPS, lo que sugiere que la inferencia debe completarse por debajo de 33 ms por paso para control en tiempo real, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JanPhilipp/smolvla_full_sim_1234 | 450M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | no disponible en la informacion | no disponible | no disponible | no disponible |
| π0 | no disponible en la informacion | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros y licencia del modelo base, sin cifras de éxito en tareas.

## Limitaciones y advertencias

- El modelo no ha publicado ninguna evaluación de éxito en tareas reales ni simuladas; no hay evidencia cuantitativa de su rendimiento.
- Está entrenado exclusivamente para cuatro tareas concretas de traslado de herramientas; no generalizará a otras instrucciones ni objetos fuera del dataset.
- Requiere un robot `so_follower` y tres cámaras con nombres `camera1`, `camera2`, `camera3` que coincidan con las claves de observación del entrenamiento; un desajuste en la configuración provocará fallos.
- El dataset es sintético (`_sim_` en el nombre), por lo que puede existir una brecha de sim-to-real no cuantificada.
- Riesgo de alucinación de acciones: al ser un modelo generativo de políticas, puede producir trayectorias no válidas ante distribuciones de entrada fuera del dataset.
- No se documentan sesgos conocidos, pero al entrenarse sobre un único dataset sintético, la política hereda sus sesgos de distribución (posiciones, iluminación, objetos).
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene 15 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad.
- No se especifican idiomas soportados; las instrucciones de tarea están en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JanPhilipp/smolvla_full_sim_1234
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/maxmeyer/three_tool_opt_sim_r4_hybrid_trio_20261105_094503
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=maxmeyer/three_tool_opt_sim_r4_hybrid_trio_20261105_094503
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
