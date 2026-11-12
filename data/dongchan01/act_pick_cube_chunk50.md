# dongchan01/act_pick_cube_chunk50

## Resumen

`dongchan01/act_pick_cube_chunk50` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación y predice fragmentos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele elevar la tasa de éxito en tareas de manipulación. El autor es dongchan01 y el repositorio se publicó el 12 de noviembre de 2026.

La política está especializada en una única tarea física: agarrar un cubo negro ("Grab the black cube"), sobre un robot de tipo `so_follower` (SO-100/SO-101 de bajo coste) con dos cámaras RGB de 480x640 (`overhead` y `wrist`). Consume un vector de estado de 6 dimensiones y emite un vector de acción de 6 dimensiones. El checkpoint contiene 51.617.414 parámetros y el repositorio ocupa aproximadamente 0,2 GB.

Su relevancia es la de un artefacto reproducible de aprendizaje por imitación de extremo a extremo: demuestra el flujo completo de LeRobot (grabación de dataset, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) sobre hardware asequible. No es un modelo de lenguaje ni un modelo fundacional generalista; es una política visuomotora de un solo cometido, sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decoder de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación temporal definida por la configuración de ACT, no especificada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo visuomotor; la tarea se especifica mediante una instrucción de texto, "Grab the black cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador visual (típicamente ResNet) para procesar las dos cámaras (`observation.images.overhead` y `observation.images.wrist`, ambas 3x480x640) y el estado propioceptivo de 6 dimensiones. El decoder predice un chunk de acciones de 6 dimensiones por paso, y el modelo se entrena con una pérdida de regresión sobre las acciones teleoperadas más una pérdida de reconstrucción estilo VAE (CVAE) que modela la variabilidad humana en las demostraciones. Esta formulación de chunks mitiga el problema de la acumulación de errores del comportamiento clonado paso a paso.

El entrenamiento se realizó sobre el dataset `dongchan01/pick-cube_20261008_100853`: 50 episodios, 28.273 frames a 30 FPS, una única tarea ("Grab the black cube"). La configuración documentada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.0. No se documenta número de tokens (no aplica), composición adicional del dataset, ni fases de RLHF/DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal; la innovación central es el propio esquema de action chunking del paper base.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de dos vistas RGB y del estado del robot.
- Aprendizaje por imitación de una tarea concreta: reproducir la política teleoperada de agarrar un cubo negro.
- Predicción de chunks de acción, que suaviza la ejecución y reduce el error acumulado frente a políticas paso a paso.
- Fusión multimodal de dos cámaras (vista cenital y vista de muñeca) con el estado propioceptivo.
- Condicionamiento por instrucción de tarea en texto ("Grab the black cube") en el momento del despliegue.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades de lenguaje, visión general, audio o modo thinking. No es un modelo multilingüe.

## Casos de uso

- Reproducción de referencia en robótica de bajo coste: desplegar la política sobre un SO-100/SO-101 con `lerobot-rollout` para validar la cadena completa de hardware, calibración y cámaras antes de entrenar políticas propias.
- Docencia y formación en aprendizaje por imitación: usar el repositorio como ejemplo reproducible de ACT con un dataset pequeño (50 episodios) y una configuración de entrenamiento documentada paso a paso.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train` sobre un dataset propio de pick-and-place para adaptar la política a nuevos objetos o posiciones, aprovechando la receta de hiperparámetros publicada.
- Benchmark interno de infraestructura: medir latencia de inferencia y throughput de una política de ~51,6 M de parámetros en GPUs de consumo, como línea base para comparar con políticas más grandes.
- Automatización de una celda de pick-and-place de un solo objeto: integrar la política en una estación que recoja un cubo negro y lo deposite en una posición fija, con supervisión humana.
- Generación de datos sintéticos y aumentación: ejecutar la política en bucle para producir trayectorias adicionales que amplíen el dataset original antes de un reentrenamiento.
- Prototipado rápido de interfaces robot-IA: servir como política "hola mundo" para probar pipelines de captura de vídeo, sincronización de cámaras y publicación de comandos en un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de tasas de éxito por tarea, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 M de parámetros en FP32, los pesos ocupan aproximadamente 0,2 GB; sumando activaciones del codificador visual para dos imágenes de 480x640, el consumo realista se sitúa en el rango de 1 a 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha entrenado con `--policy.device=cuda`, por lo que se espera compatibilidad con RTX 3060/4060 y superiores. Para entrenamiento con batch size 8 y 100.000 pasos, se recomienda RTX 4090, A100 o H100 para reducir el tiempo de entrenamiento.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas (GTX 1660 6 GB, RTX 3050 8 GB, RTX 4060 8 GB y superiores).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), con soporte de PyTorch/CUDA. No se documentan exportaciones a ONNX, TensorRT, llama.cpp, vLLM, TGI ni Ollama, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La ejecución está pensada para operar a la frecuencia de las cámaras de entrenamiento (30 FPS), pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick_cube_chunk50 (este) | 51,6 M | 2 camaras 480x640 + estado (6,) | Agarrar cubo negro (SO-100/SO-101) | apache-2.0 | Hugging Face, 0 descargas |
| ACT original (paper 2304.13705) | no disponible | no disponible | Manipulacion general (ALOHA) | codigo abierto (ver repo) | Paper y repositorio de referencia |
| Otras politicas LeRobot del Hub (p. ej. Diffusion Policy, SmolVLA) | no disponible en esta busqueda | no disponible | Manipulacion diversa | variable por repositorio | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especializacion extrema: entrenada para una sola tarea ("Grab the black cube") sobre un robot concreto (`so_follower`) y dos cámaras con nombres y resolución fijos; no generaliza a otros objetos, robots ni configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito medidas, por lo que se desconoce su robustez ante cambios de iluminación, posición del objeto o distracciones.
- Dataset pequeño: 50 episodios y 28.273 frames implican un riesgo alto de sobreajuste a las condiciones exactas de grabación.
- Riesgo de alucinación en sentido amplio: al ser una política de imitación, puede producir acciones fuera de distribución o movimientos erráticos ante observaciones no vistas; requiere supervisión y parada de emergencia en producción.
- Sesgos: hereda los sesgos de las demostraciones humanas (posiciones, velocidades, trayectorias del teleoperador) y no hay información sobre diversidad de condiciones en el dataset.
- Idiomas: no aplica en el sentido habitual; la instrucción de tarea es una cadena de texto fija en inglés y no hay capacidades multilingües.
- Licencia apache-2.0: permite uso comercial y modificación con atribución; sin embargo, el uso comercial de una política tan específica exige validación propia y no está respaldado por métricas publicadas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario o de incidencias resueltas.
- Dependencia de LeRobot 0.6.0: cambios de versión en la librería pueden romper la compatibilidad de los checkpoints y de los comandos de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongchan01/act_pick_cube_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/dongchan01/pick-cube_20261008_100853
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=dongchan01/pick-cube_20261008_100853
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
