# nberezny/act_lite6_nudge_dense

## Resumen

`nberezny/act_lite6_nudge_dense` es una política de imitación basada en Action Chunking with Transformers (ACT) entrenada con LeRobot para el robot Ufactory Lite 6 en un entorno simulado (`ufactory_lite6_sim_hybrid_dense_rel`). El modelo resuelve una única tarea de manipulación: coger un cubo rojo y colocarlo sobre un cuadrado azul. ACT predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y suele alcanzar tasas de éxito altas en tareas de manipulación aprendidas por teleoperación.

El modelo tiene 51.601.034 parámetros (aproximadamente 51,6 M) y consume dos vistas de cámara de 240x320 píxeles (`overhead` y `wrist`) junto con un vector de estado de 26 dimensiones, produciendo una acción de 10 dimensiones. Se entrenó con 1852 episodios y 54.814 fotogramas a 20 FPS, durante 100.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5.

Es relevante como ejemplo práctico de política robótica ligera y reproducible con LeRobot, pero su alcance es muy acotado: una tarea concreta, un robot concreto y sin resultados de evaluación publicados. No es un modelo de lenguaje ni un modelo multimodal general; es un controlador visomotor especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.601.034 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por fotograma y chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | `ufactory_lite6_sim_hybrid_dense_rel` |
| Cámaras de entrada | `overhead`, `wrist` (3, 240, 320) |
| Estado de entrada | `observation.state` (26,) |
| Acción de salida | `action` (10,) |
| Tarea | "Pick up the red cube and place it on the blue square." |
| Dataset de entrenamiento | nberezny/lite6_pick_place_nudge_dense (1852 episodios, 54.814 fotogramas, 20 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.0 |
| Tamaño del repositorio | 0,8 GB |
| Descargas | 0 |
| Likes | 1 |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura es un transformer que combina observaciones visuales (dos cámaras) y proprioceptivas (vector de estado de 26 dimensiones) para predecir un chunk de acciones de 10 dimensiones. La predicción por chunks, en lugar de paso a paso, es la innovación central de ACT: reduce el horizonte efectivo de decisión y mitiga el error acumulado típico de las políticas reactivas.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `nberezny/lite6_pick_place_nudge_dense`, compuesto por 1852 episodios teleoperados y 54.814 fotogramas a 20 FPS, todos ellos de la misma tarea. Se ejecutaron 100.000 pasos con batch size 8, AdamW y learning rate 1e-5. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado por imitación puro. Tampoco se especifican detalles del backbone visual ni del número de capas del transformer en la información disponible.

## Capacidades

- Control visomotor para una tarea de pick-and-place: coger un cubo rojo y depositarlo sobre un cuadrado azul.
- Fusión de dos vistas de cámara (`overhead` y `wrist`) con estado proprioceptivo de 26 dimensiones.
- Predicción de chunks de acciones de 10 dimensiones, adecuada para control continuo a 20 FPS.
- Ejecución en simulación sobre el robot `ufactory_lite6_sim_hybrid_dense_rel`.
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de imitación en robótica: sirve como política de referencia para validar pipelines de LeRobot con ACT en un robot Lite 6 simulado, comparando configuraciones de entrenamiento.
- Base para fine-tuning en tareas de pick-and-place: al estar entrenada con 1852 episodios densos, puede reutilizarse como inicialización para variantes de la misma tarea (posiciones, colores u objetos similares) mediante `lerobot-train`.
- Docencia y formación en aprendizaje por imitación: ejemplo completo y ligero (51,6 M de parámetros, 0,8 GB) para explicar action chunking, teleoperación y evaluación de políticas.
- Benchmark interno de infraestructura de simulación: permite medir latencia de inferencia y throughput de rollout en el stack LeRobot con un modelo pequeño y bien delimitado.
- Pruebas de integración de hardware: validación del cableado, calibración y sincronización de cámaras (`overhead`, `wrist`) antes de entrenar políticas más complejas.
- Estudio de robustez ante variaciones de iluminación y posicionamiento: al ser una tarea sencilla y acotada, es un banco de pruebas controlado para analizar fallos de políticas ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que cualquier GPU con 4 GB o más debería ser suficiente para el modelo, aunque el consumo real depende del runtime de LeRobot y del preprocesado de las dos cámaras a 240x320.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs consumer (RTX 3060, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU consumer: sí, por el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=nberezny/act_lite6_nudge_dense`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El control opera a 20 FPS según el dataset, pero no se publican mediciones de latencia de inferencia ni de tasa de éxito en bucle cerrado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| nberezny/act_lite6_nudge_dense | 51,6 M | Pick-and-place de cubo rojo sobre cuadrado azul en Lite 6 simulado | no disponible | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | no disponible | Tareas de manipulación diversas según dataset | no disponible | Hugging Face / LeRobot |
| Políticas Diffusion Policy en LeRobot | no disponible | Manipulación visomotora con difusión de acciones | no disponible | Hugging Face / LeRobot |
| Políticas VQ-BeT en LeRobot | no disponible | Manipulación con discretización de acciones | no disponible | Hugging Face / LeRobot |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas; la comparación se limita a categoría, disponibilidad y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un único dataset y una única tarea, la política está fuertemente sesgada hacia la distribución de posiciones, iluminación y objetos de `lite6_pick_place_nudge_dense`.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o fuera de distribución ante cambios en el entorno (nuevos objetos, distracciones, iluminación distinta).
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto libre ni instrucciones en lenguaje natural más allá de la tarea fija asociada al dataset.
- Restricciones de licencia: la licencia no está disponible ("More Information Needed"), por lo que no se puede confirmar el uso comercial.
- Sin evaluación publicada: no hay tasas de éxito en robot real ni en simulación, lo que impide estimar su fiabilidad en producción.
- Entrenado en simulación (`ufactory_lite6_sim_hybrid_dense_rel`): el traslado a un robot físico puede requerir recalibración y ajuste fino.
- Dependencia del ecosistema LeRobot 0.7.0 y de los nombres exactos de las cámaras (`overhead`, `wrist`) y del estado de 26 dimensiones.
- Repositorio con 0 descargas y 1 like: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_lite6_nudge_dense
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/lite6_pick_place_nudge_dense
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/lite6_pick_place_nudge_dense
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
