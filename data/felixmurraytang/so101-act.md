# felixmurraytang/so101-act

## Resumen

`felixmurraytang/so101-act` es una política de control robótico basada en ACT (Action Chunking Transformer) entrenada para la tarea de recoger un cubo y colocarlo sobre un posavasos con el brazo robótico SO-101. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que mapea observaciones visuales y propioceptivas del robot a secuencias de acciones articulares. Lo publica el usuario felixmurraytang bajo licencia Apache 2.0 y se distribuye en formato `safetensors` compatible con la librería LeRobot de Hugging Face.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,4 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real en hardware de consumo. Se entrenó durante 25.000 pasos sobre el dataset `felixmurraytang/so101-cube-to-coaster-v3-trim`, alcanzando una pérdida final de aproximadamente 0,099. La versión `v3` (actual `main`) es la más reciente y la que el autor reporta como validada en un pick-and-place completo bajo iluminación de habitación estándar el 5 de noviembre de 2026.

Su relevancia es práctica para quien trabaja con robótica de bajo coste: el SO-101 es un brazo open source asequible, y disponer de checkpoints ACT entrenados y evaluables con LeRobot reduce la barrera para replicar tareas de manipulación. No obstante, es un modelo muy específico de una sola tarea y un solo entorno, sin capacidades generales de lenguaje, visión o razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de imitación que combina un codificador visual (típicamente ResNet preentrenado) con un transformer que predice *chunks* de acciones, es decir, secuencias de varias acciones futuras en lugar de una sola acción por paso. Esto reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El modelo consume observaciones (imágenes de cámara y estado de las articulaciones) y emite comandos de posición para el brazo SO-101.

El entrenamiento se realizó durante 25.000 pasos sobre el dataset `so101-cube-to-coaster-v3-trim`, una versión recortada de las demostraciones de teleoperación para la tarea cubo → posavasos. La pérdida final reportada es de aproximadamente 0,099. No se documentan en la información disponible detalles sobre el número de demostraciones, la composición exacta del dataset, el uso de aumento de datos ni si hubo etapas de RLHF/DPO (no aplicables en este tipo de política). La evaluación se realiza con el script `teleop/eval_act.py` del repositorio `mayphus/so101`.

## Capacidades

- Control de manipulación robótica: ejecuta una tarea de pick-and-place (recoger un cubo y depositarlo sobre un posavasos) con el brazo SO-101.
- Imitación de demostraciones de teleoperación: reproduce políticas aprendidas a partir de datos de teleop.
- Predicción de chunks de acciones: emite secuencias de acciones articulares, no acciones aisladas.
- Entrada multimodal sensorial: procesa observaciones visuales y estado propioceptivo del robot (según la arquitectura ACT estándar).
- Integración con LeRobot: cargable mediante la librería `lerobot` de Hugging Face.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, generación de código ni capacidades multilingües.

## Casos de uso

- Replicación de la tarea cubo → posavasos en un SO-101: cargar el checkpoint con LeRobot y ejecutar `teleop/eval_act.py` para validar el comportamiento en un montaje físico idéntico al del autor.
- Base para fine-tuning en tareas de pick-and-place similares: servir como punto de partida para reentrenar con nuevas demostraciones sobre el mismo brazo y configuración de cámara.
- Docencia e investigación en imitation learning: ejemplo reproducible y ligero (51,7 M de parámetros) para estudiar ACT, chunks de acciones y evaluación de políticas en robótica de bajo coste.
- Benchmark interno de pipelines LeRobot: usar el checkpoint como referencia de pérdida (~0,099) y éxito de tarea para comparar cambios en el pipeline de entrenamiento.
- Prototipado de automatización de laboratorio: adaptar la política a tareas de recogida y colocación de objetos pequeños en entornos controlados con iluminación estable.
- Validación de hardware SO-101: comprobar calibración, cinemática y respuesta del brazo antes de invertir en datasets propios más costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la pérdida final de entrenamiento (≈ 0,099) y la confirmación cualitativa de un pick-and-place completo bajo iluminación de habitación el 5 de noviembre de 2026.

| Metrica | Valor |
|---|---|
| Pérdida final de entrenamiento | ≈ 0,099 (25k pasos) |
| Tasa de éxito en evaluación | no disponible (solo reporte cualitativo de un episodio exitoso) |
| Benchmarks estandar (MMLU, HumanEval, etc.) | no aplicables |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para los pesos; el cuello de botella real es el codificador visual y el *throughput* de inferencia en tiempo real.
- Cabe en GPU de consumo: sí, incluidas RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: librería `lerobot` (carga nativa del checkpoint) y script `teleop/eval_act.py` del repositorio `mayphus/so101`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `felixmurraytang/so101-act` | ACT | 51,7 M | Pick-and-place cubo → posavasos en SO-101 | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | ACT | variable según checkpoint | Tareas de manipulación diversas | según checkpoint | Hugging Face |
| Políticas Diffusion Policy | Diffusion Policy | variable | Manipulación multimodal | variable | Hugging Face / repos académicos |
| Políticas basadas en VLA (p. ej. OpenVLA) | Transformer VLA | miles de millones | Manipulación generalista con instrucciones en lenguaje | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación se limita a categoría, tamaño y licencia.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea (cubo → posavasos) en un montaje concreto; no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Sensibilidad a iluminación y cámara: el autor valida el éxito bajo "iluminación de habitación estándar"; cambios de luz, fondo o calibración de cámara pueden degradar el rendimiento.
- Dataset pequeño y recortado (`v3-trim`): riesgo de sobreajuste a las demostraciones; no se documenta el número de episodios ni la diversidad de condiciones.
- Sin evaluación cuantitativa pública: no hay tasa de éxito medida sobre múltiples episodios, solo un reporte cualitativo.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no es adecuado para tareas fuera de control motor.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Riesgo de fallo silencioso: como toda política de imitación, puede ejecutar acciones plausibles pero incorrectas sin señal de error explícita; requiere supervisión y parada de seguridad en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felixmurraytang/so101-act
- Dataset de entrenamiento: https://huggingface.co/datasets/felixmurraytang/so101-cube-to-coaster-v3-trim
- Repositorio de evaluación: https://github.com/mayphus/so101
- Librería LeRobot: https://github.com/huggingface/lerobot
