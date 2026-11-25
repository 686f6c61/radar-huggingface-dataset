# Schrunk/so101_smolVLA_rs

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores directamente a partir de observaciones visuales y del estado de las articulaciones. Este repositorio concreto, `Schrunk/so101_smolVLA_rs`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio de 110 episodios (75.686 fotogramas a 30 FPS) para la tarea específica de recoger un colador de té y colocarlo bajo un dispensador de té, usando un robot SO-101 con dos cámaras (superior y de muñeca).

El modelo resuelve el problema de aprender políticas de imitación (imitation learning) de extremo a extremo sin necesidad de ingeniería de control manual: recibe imágenes RGB de 256×256 píxeles y un vector de estado de 6 dimensiones, y emite directamente un vector de acción de 6 dimensiones. Su relevancia radica en que demuestra que un VLA de tan solo 450 millones de parámetros puede entrenarse y desplegarse en hardware de consumo, lo que abarata radicalmente la experimentación en robótica de manipulación frente a alternativas de miles de millones de parámetros.

Este checkpoint en particular es un ejemplo de ajuste fino para una tarea única y concreto, no un modelo de propósito general: las 18.000 iteraciones de entrenamiento con batch de 32 y tasa de aprendizaje 1e-4 sobre un dataset de una sola tarea lo convierten en un artefacto de investigación reproducible más que en un componente listo para producción multiuso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según el paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural como salida; consume una instrucción textual de tarea) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de instrucciones textuales y un decodificador de acciones, según se describe en el paper arXiv:2506.01844. El modelo consume tres cámaras RGB de 256×256 (etiquetadas `camera1`, `camera2`, `camera3` en la interfaz, aunque la model card declara dos cámaras físicas: `top` y `wrist`), un vector de estado de 6 dimensiones (`observation.state`) y una instrucción de tarea en texto, y produce un vector de acción de 6 dimensiones. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base ni la composición de su dataset.

El ajuste fino se realizó con LeRobot 0.7.0 sobre el dataset `Schrunk/so101__tea_strainer2tea_dispenser_real_sim`: 110 episodios, 75.686 fotogramas a 30 FPS, una única tarea ("pick up tea strainer and place under tea dispenser"). La configuración de entrenamiento fue de 18.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. No se documenta en la información disponible si hubo RLHF, DPO ni ninguna otra fase de alineación; se trata de aprendizaje por imitación supervisado sobre demostraciones. Tampoco se detallan innovaciones técnicas específicas del checkpoint más allá de las propias del método SmolVLA descrito en el paper.

## Capacidades

- Control robótico de manipulación de extremo a extremo: mapea observaciones visuales y de estado articular a comandos de acción de 6 grados de libertad.
- Ejecución de una tarea concreta de pick-and-place: recoger un colador de té y colocarlo bajo un dispensador de té.
- Procesamiento multimodal de entrada: tres flujos de imagen RGB de 256×256 más un vector de estado de 6 dimensiones.
- Condicionamiento por instrucción textual de tarea (una única instrucción de entrenamiento).
- Despliegue en hardware de consumo, según las afirmaciones del paper SmolVLA recogidas en la model card.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Automatización de una celda de pick-and-place de laboratorio: el modelo ejecuta la secuencia de recogida y colocación del colador bajo el dispensador con el robot SO-101, sustituyendo secuencias programadas a mano por una política aprendida de demostraciones.
- Replicación de experimentos de imitation learning: sirve como checkpoint de referencia para comparar el efecto del número de episodios (110 en este caso) y de los hiperparámetros (18.000 pasos, batch 32) en la tasa de éxito de una tarea de manipulación.
- Base para ajuste fino con nuevos datasets: al derivar de `lerobot/smolvla_base` y usar la CLI `lerobot-train`, se puede reentrenar con `--policy.path=lerobot/smolvla_base` sobre datos propios de otro robot o tarea.
- Docencia y formación en robótica: su tamaño de 450 millones de parámetros y su licencia Apache 2.0 permiten desplegarlo en aulas y laboratorios con GPUs modestas para ilustrar el ciclo completo de grabación de datos, entrenamiento y rollout.
- Evaluación de robustez ante variaciones de entorno: permite estudiar cómo se degrada una política entrenada con dos cámaras y una única tarea cuando cambian posiciones de objetos, iluminación o el robot físico, tal como sugiere la propia plantilla de evaluación de la model card.
- Prototipado rápido de políticas con LeRobot: el comando `lerobot-rollout --strategy.type=base` permite ejecutar la política durante un tiempo acotado (`--duration=60`) sin grabar episodios, útil para validar la integración de cámaras y puerto del robot antes de invertir en un entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una plantilla de evaluación (tabla de tarea, ensayos, éxitos y tasa de éxito) que el autor no ha rellenado, y declara explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors, el peso en precisión nativa ronda los 0,9 GB (tamaño del repo), por lo que la inferencia en FP16/FP32 cabría holgadamente en GPUs de consumo, aunque no se documentan requisitos oficiales.
- GPU recomendadas: no disponibles en la información proporcionada; la model card solo afirma que SmolVLA puede desplegarse en hardware de consumo.
- ¿Cabe en GPU de consumo? Según el tamaño del checkpoint (0,9 GB) y la afirmación del paper recogida en la model card, sí; no se especifican modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: LeRobot 0.7.0 mediante `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El dato relevante es que el dataset se grabó a 30 FPS, lo que sugiere que la política debe operar en ese orden de frecuencia, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Schrunk/so101_smolVLA_rs` (este) | 450 M | no disponible | Pick-and-place de una tarea con SO-101 | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base para ajuste fino | no disponible en la información | Hugging Face (modelo base citado) |
| Alternativas de la misma categoría (p. ej. otros VLA de LeRobot) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables (tasas de éxito, latencia) para este checkpoint ni para el modelo base, por lo que la comparativa se limita a parámetros, licencia y disponibilidad. No se han identificado en la información proporcionada otros modelos de la misma categoría con los que contrastar métricas.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("pick up tea strainer and place under tea dispenser") y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida, ni en simulación ni en robot real, por lo que se desconoce su fiabilidad práctica.
- Dataset pequeño: 110 episodios y 75.686 fotogramas son un volumen reducido, lo que incrementa el riesgo de sobreajuste a posiciones, iluminación y configuración concretas del entorno de grabación.
- Dependencia de la configuración de cámaras: la política espera claves de observación concretas (`observation.images.camera1/2/3`, `observation.state` de 6 dimensiones); un desajuste en nombres, índices o calibración de cámaras invalida la inferencia.
- Ambigüedad en el número de cámaras: la model card declara dos cámaras (`top`, `wrist`) pero la interfaz de entradas lista tres flujos visuales; conviene verificar la configuración real antes de desplegar.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución: no se documentan análisis de robustez ante objetos nuevos, distracciones o cambios de robot del mismo tipo.
- Idiomas: no aplica en el sentido habitual (no genera lenguaje natural); la instrucción de tarea está en inglés y no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint de investigación sin evaluación, su uso en producción requiere validación propia previa.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Schrunk/so101_smolVLA_rs
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Schrunk/so101__tea_strainer2tea_dispenser_real_sim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Schrunk/so101__tea_strainer2tea_dispenser_real_sim
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
