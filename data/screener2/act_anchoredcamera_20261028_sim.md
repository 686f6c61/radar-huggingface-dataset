# Screener2/act_AnchoredCamera_20261028_sim

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación robótica. Este repositorio concreto, `Screener2/act_AnchoredCamera_20261028_sim`, es una política entrenada con LeRobot sobre un robot `so_follower` (SO-100/SO-101 de bajo coste) con una única cámara cenital, y está publicada en HuggingFace Hub bajo licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulación en simulación (identificada como tarea `"0"`) a partir de 15 episodios de teleoperación (6.288 fotogramas a 30 FPS). No es un modelo de lenguaje ni un modelo generativo general: es una política visomotora de ~51,7 millones de parámetros que consume el estado articular del robot (vector de 6 dimensiones) y una imagen RGB de 480×640, y emite un vector de acción de 6 dimensiones.

Su relevancia es la de un artefacto reproducible de *imitation learning*: demuestra el flujo completo de LeRobot (grabación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) y sirve como referencia para quien quiera entrenar sus propias políticas ACT sobre hardware asequible. El autor no ha publicado resultados de evaluación en robot real ni en simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política reactiva por paso de control) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,2 GB) |

## Arquitectura y entrenamiento

ACT combina un *backbone* de visión (codificador convolucional tipo ResNet) que procesa la imagen cenital de 480×640, con un transformer que fusiona las características visuales y el estado propioceptivo (6 dimensiones) para predecir un *chunk* de acciones futuras. La predicción por bloques, en lugar de paso a paso, es la innovación central del método: reduce el error de acumulación (*compounding error*) típico de las políticas de imitación y permite un control más suave. El modelo está implementado en la librería LeRobot (versión 0.5.2) y se corresponde con el paper arXiv:2304.13705.

El entrenamiento se realizó sobre el dataset `Screener2/AnchoredCamera_20261028_sim`, con 15 episodios y 6.288 fotogramas a 30 FPS, durante 100.000 pasos con batch de 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se especifica en la información disponible el número de tokens de entrenamiento (no aplica), la composición del dataset más allá del recuento de episodios, ni si se aplicaron técnicas de RLHF/DPO (no procede en aprendizaje por imitación). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor de manipulación robótica: mapea imagen cenital + estado articular a comandos de 6 grados de libertad.
- Predicción de *action chunks*: emite secuencias cortas de acciones, lo que mejora la estabilidad del control.
- Aprendizaje por imitación a partir de teleoperación: no requiere recompensas ni entorno simulado durante el entrenamiento.
- Ejecución en robot real `so_follower` mediante `lerobot-rollout` con `--strategy.type=base`.
- Entrada multimodal limitada: una cámara (`observation.images.overhead`) y estado propioceptivo; no soporta visión multi-cámara en esta configuración.
- No soporta *tool calling*, agentes, razonamiento multi-paso, capacidades multilingües, ni modos de *thinking* (no es un modelo de lenguaje).

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como política de referencia para reproducir el flujo ACT de LeRobot con hardware de bajo coste (SO-100/SO-101) y una cámara cenital.
- Automatización de tareas de pick-and-place en simulación: la política puede ejecutar la tarea `"0"` sobre el robot `so_follower` en un entorno simulado, útil para validar pipelines antes de pasar a hardware real.
- Prototipado rápido de robots de escritorio: con 51,7 M de parámetros y 0,2 GB de pesos, se puede cargar y ejecutar en una GPU de consumo, lo que facilita iteraciones en laboratorio.
- Docencia y formación: ejemplo completo de grabación de datos, entrenamiento (`lerobot-train`) y despliegue (`lerobot-rollout`) documentado en la model card.
- Base para *fine-tuning*: al ser Apache 2.0 y estar en safetensors, se puede reentrenar sobre nuevos datasets de teleoperación para tareas específicas.
- Evaluación comparativa de métodos de imitación: útil como *baseline* ACT frente a otras políticas (Diffusion Policy, VQ-BeT) en el mismo robot y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."*

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7 M de parámetros ≈ 0,2 GB de pesos) más el *overhead* de activaciones del codificador visual; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060, RTX 4090, A100, H100); también es viable en CPU para inferencia a baja frecuencia, aunque no se documenta latencia.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (RTX 20xx en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Screener2/act_AnchoredCamera_20261028_sim`; requiere `lerobot` 0.5.2 o compatible. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Screener2/act_AnchoredCamera_20261028_sim` (ACT) | 51,7 M | no aplica | sin evaluación publicada | apache-2.0 | HuggingFace Hub |
| Diffusion Policy (referencia metodológica) | no disponible | no aplica | no disponible | no disponible | implementación en LeRobot |
| VQ-BeT (referencia metodológica) | no disponible | no aplica | no disponible | no disponible | implementación en LeRobot |

No se dispone de datos numéricos de benchmarks para establecer una comparación cuantitativa con alternativas. La comparación anterior es meramente cualitativa y de disponibilidad.

## Limitaciones y advertencias

- No hay evaluación publicada: se desconoce la tasa de éxito real de la política, tanto en simulación como en robot físico.
- Dataset muy pequeño: 15 episodios y 6.288 fotogramas son insuficientes para generalizar a variaciones de posición, iluminación, objetos o distracciones.
- Una sola cámara cenital: la política no tiene información lateral ni de profundidad; cualquier oclusión o cambio de punto de vista degradará el rendimiento.
- Tarea única: entrenada para la tarea `"0"`, sin capacidad de generalización a otras tareas sin reentrenamiento.
- Riesgo de sobreajuste al entorno simulado: el sufijo `_sim` sugiere entrenamiento en simulación; el *sim-to-real gap* puede ser significativo.
- Sin capacidades de lenguaje, razonamiento ni *tool calling*: no debe confundirse con un LLM ni usarse para tareas de texto.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del dataset asociado antes de redistribuir.
- Sin información sobre sesgos: no aplica en el sentido habitual, pero el comportamiento hereda los sesgos de la política de teleoperación y del operador humano que grabó los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Screener2/act_AnchoredCamera_20261028_sim
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/AnchoredCamera_20261028_sim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/AnchoredCamera_20261028_sim
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- CLI cheat-sheet: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
