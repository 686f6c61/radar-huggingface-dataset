# saybeok03/folding_act_224

## Resumen

`saybeok03/folding_act_224` es una política de imitación (imitation learning) para robótica basada en el método ACT (Action Chunking with Transformers), entrenada con la librería LeRobot de Hugging Face y publicada en el Hub. El modelo resuelve una tarea concreta de manipulación: doblar una camiseta ("Fold the T-shirt properly"). A diferencia de los modelos de lenguaje, no genera texto, sino vectores de acción de 16 dimensiones a partir de un estado propioceptivo de 16 dimensiones y tres cámaras RGB de 224×224.

El modelo tiene 51.689.104 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras y desplegables en hardware modesto. Fue entrenado sobre el dataset `saybeok03/full_folding_pi05_224`, compuesto por 50 episodios y 135.351 fotogramas a 30 FPS, con 50.000 pasos de entrenamiento, batch de 32 y optimizador AdamW con learning rate de 1e-05.

Es relevante ahora porque ejemplifica el flujo actual de LeRobot 0.6.1 para entrenar y desplegar políticas robóticas de código abierto con licencia Apache 2.0, sobre un robot bimanual `bi_openarm_follower` con cámaras en base y ambas muñecas. Su utilidad práctica es acotada (una única tarea, un único robot), pero sirve como referencia reproducible para pipelines de imitación de extremo a extremo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación |
| Parámetros totales | 51.689.104 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija: estado de 16 dims + 3 imágenes de 224×224) |
| Tipos de cuantización | no disponible (pesos safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena de texto "Fold the T-shirt properly") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice *chunks* de acciones (varias acciones futuras de golpe) en lugar de un único paso, lo que mitiga el problema de compounding error típico de las políticas paso a paso. La entrada del modelo es multimodal: un vector `observation.state` de forma `(16,)` y tres imágenes `observation.images.base`, `observation.images.left_wrist` y `observation.images.right_wrist`, cada una de forma `(3, 224, 224)`. La salida es un vector `action` de forma `(16,)`. La arquitectura combina un backbone visual (típicamente ResNet en ACT) con un transformer encoder-decoder que modela la secuencia de acciones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `saybeok03/full_folding_pi05_224`: 50 episodios, 135.351 fotogramas a 30 FPS, tarea única "Fold the T-shirt properly". La configuración registrada es de 50.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el número total de tokens vistos, la composición detallada del dataset ni si hubo etapas de RLHF/DPO (no aplicables a este tipo de política). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico bimanual: genera acciones de 16 dimensiones para un robot `bi_openarm_follower`.
- Percepción visual multivista: consume tres cámaras simultáneas (base, muñeca izquierda, muñeca derecha) a 224×224.
- Ejecución de una tarea de manipulación específica: doblar una camiseta.
- Imitation learning a partir de datos teleoperados (no requiere recompensa explícita).
- Predicción de chunks de acciones (no paso a paso), lo que aporta suavidad temporal.
- No soporta tool calling, function calling, agentes multi-step ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales fuera del pipeline robótico.

## Casos de uso

- Doblado automatizado de camisetas en un banco de pruebas: el modelo ejecuta la política entrenada sobre el robot `bi_openarm_follower` con las tres cámaras configuradas, usando `lerobot-rollout` con `--task="Fold the T-shirt properly"`.
- Reproducción de experimentos de imitation learning: sirve como baseline reproducible para comparar variantes de ACT, datasets o configuraciones de entrenamiento con LeRobot.
- Prototipado de pipelines de teleoperación a política: el flujo dataset → `lerobot-train` → `lerobot-rollout` permite validar la cadena completa antes de escalar a tareas más complejas.
- Docencia y formación en robótica de manipulación: ejemplo real y ligero (0,2 GB) para ilustrar ACT, chunking de acciones y percepción multivista.
- Benchmark interno de hardware: al ser una política pequeña, permite medir latencia de inferencia y throughput en distintas GPUs o en CPU sin grandes inversiones.
- Base para fine-tuning en tareas de plegado similares: partiendo de estos pesos y del dataset `full_folding_pi05_224`, se puede adaptar a otras prendas o configuraciones de robot del mismo tipo.
- Validación de calibración de cámaras y robot: la política exige que los nombres de cámara coincidan con las claves de observación, por lo que es útil para verificar el setup antes de entrenar políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas comparativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros, pesos en safetensors de 0,2 GB), la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; no se documentan requisitos mínimos. Una RTX 3060/4060 o superior es más que suficiente para inferencia.
- Cabe en GPU de consumo: sí, con amplio margen, dado el reducido número de parámetros y el tamaño del repositorio.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `saybeok03/folding_act_224` | 51,7 M | Estado 16 dims + 3 imágenes 224×224 | Doblado de camiseta (bi_openarm_follower) | Apache 2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot Hub | no disponible | no disponible | Tareas de manipulación diversas | variable | Hugging Face Hub |
| Políticas tipo Diffusion Policy (LeRobot) | no disponible | no disponible | Manipulación | variable | Hugging Face Hub |
| Políticas tipo VLA (p. ej. pi0) | no disponible | no disponible | Manipulación generalista | variable | Hugging Face Hub |

No se dispone de datos cuantitativos de benchmarks para establecer una comparación de rendimiento con alternativas concretas. La comparativa anterior es cualitativa y basada en categorías de políticas disponibles en el ecosistema LeRobot.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para la tarea "Fold the T-shirt properly"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del robot: diseñada para `bi_openarm_follower`; no es portable a otras morfologías sin adaptación.
- Dependencia de las cámaras: requiere exactamente las claves `observation.images.base`, `observation.images.left_wrist` y `observation.images.right_wrist`; nombres o calibraciones distintas rompen la inferencia.
- Dataset pequeño: 50 episodios y una única tarea, lo que limita la robustez frente a variaciones de iluminación, posiciones de objetos o distracciones.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento en producción es incierto.
- Riesgo de sobreajuste al entorno de grabación: cambios en el fondo, la mesa o la prenda pueden degradar el comportamiento.
- Sin capacidades de lenguaje: no procesa instrucciones libres; la tarea se pasa como cadena fija y no se interpreta semánticamente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la procedencia de los datos de entrenamiento antes de un despliegue comercial.
- Fecha de creación futura (2026-10-30): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saybeok03/folding_act_224
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/full_folding_pi05_224
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/full_folding_pi05_224
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
