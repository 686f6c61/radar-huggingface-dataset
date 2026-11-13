# jhd0313/act_move-box_chunk50

## Resumen

`jhd0313/act_move-box_chunk50` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo ha sido entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. Resuelve una tarea concreta de manipulación: mover una caja ("Move the box") con un robot de tipo `so_follower` (brazo tipo SO-100/SO-101) equipado con dos cámaras, una cenital (`overhead`) y otra en la muñeca (`wrist`).

Arquitectónicamente es un transformer pequeño orientado a control, con 51.617.414 parámetros totales (aproximadamente 51,6 millones) y pesos en formato safetensors. No es un modelo de lenguaje: consume observaciones compuestas por el estado de las articulaciones (vector de 6 dimensiones) y dos imágenes RGB de 480x640, y produce un vector de acción de 6 dimensiones. Su relevancia es la de un ejemplo reproducible de extremo a extremo de imitación visual-motora con LeRobot 0.6.0, útil para desarrolladores que quieran replicar el pipeline o adaptarlo a sus propios robots.

El entrenamiento se realizó sobre un dataset propio de 50 episodios y 10.668 fotogramas a 30 FPS, durante 5.000 pasos con batch de 8, optimizador AdamW y learning rate de 1e-05. El repositorio ocupa 0,2 GB y la licencia es Apache 2.0. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.617.414 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); ventana de observación definida por la configuración de LeRobot |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con la cadena "Move the box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política combina un codificador de imágenes (para las dos cámaras, `overhead` y `wrist`, a resolución 480x640) con un transformer que fusiona la observación visual y el estado proprioceptivo de 6 dimensiones para generar secuencias de acciones de 6 dimensiones. El nombre del repositorio (`chunk50`) sugiere un tamaño de chunk de 50 pasos, aunque este dato no se confirma explícitamente en la model card.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `jhd0313/move-box_20261008_100955`: 50 episodios, 10.668 fotogramas a 30 FPS, una única tarea ("Move the box"). La configuración fue de 5.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje supervisado por imitación a partir de demostraciones de teleoperación.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Percepción visual multimodal: procesa simultáneamente una cámara cenital y una cámara en la muñeca a 480x640.
- Ejecución de una tarea concreta: "Move the box", aprendida de 50 episodios de teleoperación.
- Predicción de chunks de acción (no pasos aislados), lo que aporta suavidad y consistencia temporal.
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking. Es una política específica de robótica, no un modelo de propósito general.

## Casos de uso

- Automatización de una tarea de pick-and-place en laboratorio: el modelo ejecuta el movimiento de una caja sobre un brazo SO-100/SO-101 con dos cámaras, sirviendo como base para experimentos de manipulación reproducibles.
- Prototipado rápido de políticas de imitación: al estar entrenado con LeRobot 0.6.0 y publicado en el Hub, se puede desplegar con `lerobot-rollout` en minutos para validar el pipeline antes de grabar datos propios.
- Base de comparación en investigación: útil como referencia de ACT con 50 episodios y 5.000 pasos para contrastar con variantes (Diffusion Policy, VQ-BeT, etc.) sobre la misma tarea.
- Generación de datos sintéticos de evaluación: ejecutar la política en simulación o en un robot real para medir tasas de éxito y detectar modos de fallo antes de escalar el dataset.
- Docencia y formación: ejemplo didáctico completo de aprendizaje por imitación visual-motora, desde la grabación de teleoperación hasta el despliegue.
- Reentrenamiento con dominio propio: partir de esta configuración (ACT, 5.000 pasos, batch 8, lr 1e-05) y sustituir el dataset por uno propio para tareas de manipulación similares.
- Integración en flujos de robótica con ROS 2 o controladores propietarios: el vector de acción de 6 dimensiones se puede mapear a las articulaciones del brazo para experimentos de control de bajo nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~51,6 millones de parámetros (≈206 MB en FP32, ≈103 MB en FP16). Con las dos cámaras a 480x640 y el codificador visual, la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090). Para entrenamiento, se recomienda al menos 8-12 GB por el batch de 8 y las imágenes de entrada.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas de consumo; también es viable en CPU para inferencia a baja frecuencia, aunque no se documenta latencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), scripts de LeRobot en Python, y potencialmente exportación a ONNX o TensorRT para despliegue en el robot (no documentado en la model card).
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 30 FPS, lo que sugiere que el modelo debe ejecutarse al menos a esa frecuencia para un control fluido, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `jhd0313/act_move-box_chunk50` | 51,6 M | Política ACT para "Move the box" con `so_follower` y 2 cámaras | Apache 2.0 | Hugging Face Hub |
| ACT original (paper arXiv:2304.13705) | no disponible en la información | Manipulación con chunks de acción | no disponible en la información | Paper y código de referencia |
| Diffusion Policy (referencia de la categoría) | no disponible en la información | Políticas de imitación basadas en difusión | no disponible en la información | Repositorios de investigación |
| Otras políticas LeRobot del Hub | variable | Tareas específicas por robot y dataset | variable (habitualmente Apache 2.0) | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para la tarea "Move the box" con un robot `so_follower` y dos cámaras concretas; no generaliza a otras tareas, objetos o configuraciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que se desconoce su robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Dependencia del hardware: requiere que los nombres de cámara (`overhead`, `wrist`) y la resolución 480x640 coincidan con los usados en el entrenamiento; cualquier desviación degrada el rendimiento.
- Dataset pequeño: 50 episodios y 10.668 fotogramas es un volumen reducido, lo que aumenta el riesgo de sobreajuste y de baja generalización.
- Sin capacidades lingüísticas ni de razonamiento: no es un modelo de lenguaje ni un agente; no soporta tool calling, texto, código ni matemáticas.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede producir comandos erráticos fuera de la distribución de entrenamiento; se recomienda supervisión humana y paradas de seguridad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el usuario asume la responsabilidad del despliegue.
- Sin información sobre sesgos: no se documentan sesgos demográficos ni de otro tipo, aunque al ser un modelo robótico los riesgos se centran en fallos físicos más que en sesgos de contenido.
- Fecha de creación futura (2026-11-13) en los metadatos: conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jhd0313/act_move-box_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/jhd0313/move-box_20261008_100955
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jhd0313/move-box_20261008_100955
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
