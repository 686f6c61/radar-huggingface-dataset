# fkmt/act_so101_picking

## Resumen

`fkmt/act_so101_picking` es una política de aprendizaje por imitación entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv 2304.13705. El modelo lo ha entrenado el usuario fkmt y se distribuye a través de Hugging Face Hub usando la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política robótica que mapea observaciones (estado de las articulaciones y dos cámaras) a comandos de acción de un robot concreto.

El modelo está especializado en una única tarea de manipulación ("Pick a pooley") sobre un robot de tipo `so_follower` (la variante seguidora del SO-101 de LeRobot). Consume un vector de estado de 6 dimensiones y dos imágenes (cámara superior a 240x320 y cámara de muñeca a 480x640), y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros totales, es un modelo pequeño y ligero pensado para inferencia en tiempo real a 30 FPS.

Su relevancia es práctica: demuestra el flujo completo de LeRobot para grabar datos de teleoperación, entrenar una política ACT y desplegarla en hardware real de bajo coste. No obstante, se trata de un modelo de nicho, con solo 31 descargas, sin resultados de evaluación publicados y entrenado sobre un único dataset de 50 episodios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un backbone de visión (encoder de imágenes) con un transformer que fusiona las observaciones visuales y el estado propioceptivo para generar secuencias de acciones. En este caso concreto, las entradas son `observation.state` (6 dimensiones), `observation.images.top` (3x240x320) y `observation.images.wrist` (3x480x640), y la salida es `action` (6 dimensiones).

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `fkmt/so101_picking_20261027_143500`: 50 episodios, 15.361 fotogramas a 30 FPS, tarea "Pick a pooley". La configuración fue de 100.000 pasos, batch size 12, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni otras técnicas de refinamiento; es aprendizaje supervisado puro a partir de demostraciones de teleoperación.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot SO-101 (`so_follower`).
- Percepción visual multimodal: procesa simultáneamente una cámara cenital y una cámara de muñeca.
- Aprendizaje por imitación: reproduce la tarea "Pick a pooley" a partir de demostraciones de teleoperación.
- Predicción de action chunks: emite secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la suavidad y la robustez.
- Inferencia en tiempo real a 30 FPS (según la frecuencia del dataset de entrenamiento).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Automatización de picking en laboratorio: recoger un objeto concreto ("pooley") desde una posición conocida usando el robot SO-101, aprovechando las dos cámaras para localizar el objeto y la pinza.
- Base para fine-tuning en tareas de manipulación similares: reutilizar los pesos como punto de partida y reentrenar con un dataset propio de LeRobot para otra tarea de agarre.
- Validación de pipelines de LeRobot: servir como ejemplo reproducible del flujo `lerobot-train` → `lerobot-rollout` en un robot real o simulado.
- Docencia e investigación en aprendizaje por imitación: estudiar el comportamiento de ACT con 50 episodios y 15.361 fotogramas, y comparar con otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo dataset.
- Pruebas de despliegue en hardware de bajo coste: al tener ~51,7 M de parámetros, se puede ejecutar en GPUs de consumo o incluso en CPU para experimentación, sin necesidad de infraestructura pesada.
- Benchmark interno de robustez: evaluar la degradación de la política ante cambios de iluminación, posición del objeto o distractores, ya que el autor no publica tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,7 M de parámetros en safetensors (0,6 GB de repo), la inferencia requiere menos de 1 GB de VRAM en FP32 y menos aún en FP16.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. También es viable en CPU para pruebas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo (GTX 1650, RTX 3050, etc.) e incluso en placas integradas para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y el stack de PyTorch asociado. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas robóticas.
- Latencia y throughput estimados: no disponibles de forma oficial; el dataset está a 30 FPS, lo que sugiere que el modelo está pensado para operar a esa frecuencia, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fkmt/act_so101_picking | 51,7 M | no aplica | sin evaluación publicada | Apache 2.0 | Hugging Face (31 descargas) |
| Políticas ACT de LeRobot (referencia) | ~50 M (típico) | no aplica | variable según dataset | Apache 2.0 | Hugging Face / GitHub |
| Diffusion Policy (referencia) | no disponible | no aplica | requiere evaluación propia | MIT (repo original) | GitHub / papers |
| VQ-BeT (referencia) | no disponible | no aplica | requiere evaluación propia | MIT (repo original) | GitHub / papers |

No se dispone de datos cuantitativos comparativos publicados para este modelo concreto; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 50 episodios de un único operador y una única tarea, la política hereda los sesgos de esas demostraciones (posiciones, iluminación, velocidad y estilo de agarre).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o fuera de distribución ante objetos, posiciones o condiciones de iluminación no vistas durante el entrenamiento.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni mantiene conversaciones. La única "instrucción" es la tarea fija "Pick a pooley".
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Caveats para producción: sin tasas de éxito publicadas, sin vídeo de demostración y con solo 31 descargas, no hay evidencia externa de robustez. El modelo está atado a la configuración exacta de cámaras (`top` y `wrist`), al robot `so_follower` y a la frecuencia de 30 FPS; cualquier cambio en el montaje invalida su uso directo.
- El repositorio tiene un tamaño de 0,6 GB, lo que sugiere que puede incluir checkpoints u otros artefactos además de los pesos finales; conviene revisar el contenido antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fkmt/act_so101_picking
- Dataset de entrenamiento: https://huggingface.co/datasets/fkmt/so101_picking_20261027_143500
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fkmt/so101_picking_20261027_143500
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
