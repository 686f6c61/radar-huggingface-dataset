# chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_base

## Resumen

`act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_base` es una política de imitación para robótica de manipulación, desarrollada por el usuario chenproject35 y publicada en Hugging Face bajo el ecosistema LeRobot. Implementa el método ACT (Action Chunking with Transformers), presentado en el paper arXiv:2304.13705, que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación real. El modelo resuelve una tarea concreta de pick-and-place: coger un objeto denominado "inreach2" y colocarlo en un utillaje (jig).

La política opera sobre el brazo robótico `rebot_b601_follower` (reBot Arm B601 de Seeed Studio) con dos cámaras (`cam_front` y `cam_wrist`), una entrada de estado de 7 dimensiones y una salida de acción también de 7 dimensiones. Con 51.670.663 parámetros, es un modelo compacto orientado a inferencia en tiempo real a 30 FPS, entrenado con 60 episodios de teleoperación (58.148 frames) mediante aprendizaje por imitación supervisado.

Su relevancia radica en que es un ejemplo reproducible de entrenamiento de políticas robóticas de código abierto con LeRobot 0.6.2, licencia Apache 2.0 y pesos en safetensors, lo que permite evaluar el flujo completo de captura de datos, entrenamiento y despliegue en hardware asequible. El sufijo del nombre (`ood_cell4_hil_rac_r1_base`) sugiere variantes de evaluación fuera de distribución, intervención humana (HIL) y un esquema de entrenamiento por rondas, aunque la model card no documenta estos detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual y decodificador de chunks de acción |
| Parametros totales | 51.670.663 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (política de imitación, no modelo de lenguaje; opera sobre observaciones por frame) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone visual (encoder de imágenes de las cámaras frontal y de muñeca) con un transformer que predice chunks de acciones de horizonte corto. En lugar de regresar una única acción por paso, el modelo genera una secuencia de acciones futuras y aplica un esquema de agregación temporal (típicamente media ponderada exponencial) para ejecutar la acción actual, lo que suaviza la trayectoria y mitiga el compounding error característico de las políticas paso a paso. La entrada de estado es un vector de 7 dimensiones (posición articular o efector final) y la salida es un vector de acción de 7 dimensiones, coherente con un brazo de 6 grados de libertad más pinza.

El entrenamiento se realizó con el dataset `chenproject35/pick-and-place-b601-60ep-yaw0-v2`: 60 episodios, 58.148 frames a 30 FPS, con la tarea "Pick up inreach2 and place it in the jig". La configuración reportada es de 50.000 pasos, batch size 4, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni refuerzo; es imitación supervisada pura sobre demostraciones teleoperadas. Tampoco se especifica el número de tokens de entrenamiento (no aplica) ni la composición detallada de aumentos de datos.

## Capacidades

- Manipulación robótica pick-and-place: coger el objeto "inreach2" y depositarlo en el jig, con control de efector final de 7 dimensiones.
- Percepción visual multimodal: procesa simultáneamente imagen frontal (`cam_front`) e imagen de muñeca (`cam_wrist`) a resolución 480x640, 3 canales.
- Predicción de chunks de acción: genera secuencias de acciones de horizonte corto para ejecución suavizada en tiempo real.
- Control a 30 FPS: frecuencia de operación alineada con la captura del dataset, adecuada para control de brazos colaborativos.
- Ejecución autónoma de la política: despliegue mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento lingüístico, matemáticas ni generación de texto; es una política visuomotora especializada.
- No dispone de modo "thinking", capacidades de audio ni multilingüismo.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo ejecuta la secuencia de coger "inreach2" y colocarlo en el jig a 30 FPS, adecuado para tareas repetitivas de alimentación de utillaje en celdas de fabricación con el brazo reBot B601.
- Banco de pruebas de aprendizaje por imitación: sirve como referencia reproducible para validar el pipeline completo de LeRobot (grabación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) antes de escalar a tareas propias.
- Investigación en robustez fuera de distribución: el sufijo `ood_cell4` sugiere evaluación con condiciones alteradas (iluminación, posiciones, distractores); útil para estudiar degradación de políticas ACT en entornos no vistos.
- Prototipado rápido en laboratorio: con 51,7M parámetros y pesos safetensors, se puede cargar y ejecutar en una estación con GPU de consumo, lo que facilita iteraciones de investigación sin infraestructura dedicada.
- Docencia en robótica de manipulación: ejemplo didáctico de imitación con dos cámaras y estado articular, con comandos CLI documentados para reproducir el entrenamiento y la inferencia.
- Base para fine-tuning con intervención humana (HIL): el nombre incluye `hil_rac`, lo que apunta a un flujo de corrección humana durante el despliegue; puede usarse como punto de partida para recoger datos correctivos y reentrenar.
- Evaluación comparativa de políticas ACT frente a otras variantes del mismo autor (por ejemplo, `..._F5` o `..._ood_cell4`), manteniendo constante el dataset y el hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de error de acción, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67M parámetros en fp32 los pesos ocupan aproximadamente 207 MB, y en fp16 unos 103 MB, a lo que hay que sumar el encoder visual y los buffers de las dos cámaras a 480x640. En la práctica, cabe holgadamente en GPUs de consumo con 8 GB o menos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); también es viable en A100/H100 si se comparte con otros procesos, aunque está sobredimensionado para este modelo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3050/3060/4060 y superiores; no se ha verificado oficialmente el mínimo exacto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=...`), librería `lerobot` 0.6.2 o compatible; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput estimados: no disponibles; el diseño apunta a control a 30 FPS (33 ms por frame) en el hardware del robot, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_base` | 51,67M | No disponible (chunks de acción) | Pick-and-place en reBot B601 | Apache 2.0 | Hugging Face, 28 descargas |
| `chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4` | 51,7M | No disponible | Pick-and-place en reBot B601 | No disponible en la información | Hugging Face |
| `chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F5` | 51,7M | No disponible | Pick-and-place en reBot B601 | No disponible en la información | Hugging Face |
| Dataset `chenproject35/pick-and-place-b601-30ep-v3` | No aplica | 30 episodios | Pick-and-place (tarea similar) | No disponible | Hugging Face / DataCombats |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) entre estas variantes; la comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: la política solo ha sido entrenada para la tarea "Pick up inreach2 and place it in the jig" con el robot `rebot_b601_follower` y las cámaras `cam_front` y `cam_wrist`; no generaliza a otras tareas, objetos, brazos o configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Riesgo de sobreajuste al dataset: 60 episodios y 58.148 frames son un volumen limitado; la variabilidad de posiciones, iluminación y distractores puede degradar el rendimiento fuera de distribución (el propio nombre sugiere evaluación OOD).
- Dependencia del hardware: requiere el brazo reBot B601 y cámaras con los nombres e índices exactos usados en el entrenamiento; un cambio de calibración o de montaje puede invalidar la política.
- Sin capacidades lingüísticas: no procesa instrucciones en lenguaje natural más allá de la etiqueta de tarea fija; no soporta tool calling ni agentes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el paper de ACT y LeRobot según la model card.
- Idiomas no aplicables: al ser un modelo visuomotor, no hay soporte multilingüe ni sesgos lingüísticos que evaluar; los sesgos relevantes serían de tipo perceptivo y de distribución de datos, no documentados.
- Fecha de creación futura en los metadatos (2026-11-04): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_base
- Variante F5: https://huggingface.co/chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F5
- Variante ood_cell4: https://huggingface.co/chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4
- Dataset de entrenamiento: https://huggingface.co/datasets/chenproject35/pick-and-place-b601-60ep-yaw0-v2
- Dataset relacionado (30ep-v3): https://www.datacombats.com/datasets/chenproject35/pick-and-place-b601-30ep-v3
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chenproject35/pick-and-place-b601-60ep-yaw0-v2
- Anuncio del reBot Arm B601 de Seeed Studio: https://www.seeedstudio.com/blog/2026/04/20/seeed-studio-launches-rebot-arm-b601-a-fully-open-source-robotic-arm-built-for-physical-ai/
