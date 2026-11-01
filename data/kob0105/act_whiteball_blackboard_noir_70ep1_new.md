# kob0105/act_whiteball_blackboard_NoIR_70ep1_NEW

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación robótica. Este repositorio concreto, publicado por el usuario kob0105, contiene una política entrenada con LeRobot para el robot `so_follower` (SO-100/SO-101 de bajo coste) que ejecuta la tarea "pick place white ball" sobre un fondo de pizarra negra con iluminación sin infrarrojos (NoIR).

El modelo consume el estado articular del robot (6 dimensiones) y dos flujos de vídeo RGB de 480x640 (cámara global y cámara en la palma) y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es una política compacta pensada para inferencia en tiempo real a 30 FPS en hardware de consumo.

Su relevancia es acotada: no es un modelo de lenguaje ni un modelo fundacional, sino un artefacto de investigación reproducible para una tarea específica de pick-and-place. Sirve como referencia práctica de cómo se entrena y despliega una política ACT con LeRobot 0.6.1 y como punto de partida para quien quiera replicar el pipeline con su propio robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica por etiqueta de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que, en lugar de predecir una acción por paso, genera un chunk de acciones futuras a partir de las observaciones actuales. El modelo combina un encoder visual (procesa las imágenes de las cámaras `global` y `palm`, ambas de 3x480x640), un encoder del estado proprioceptivo (`observation.state`, 6 dimensiones) y un decoder que emite un vector de acción de 6 dimensiones. La innovación principal del método, descrita en el paper arXiv:2304.13705, es el chunking de acciones junto con el *temporal ensembling*, que suaviza las predicciones entre chunks solapados y mejora la estabilidad en tiempo real.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `kob0105/record_test_new_whiteball_blackboard_NoIR_No2`, compuesto por 70 episodios y 27.858 frames a 30 FPS (aproximadamente 15,5 minutos de demostraciones teleoperadas). La configuración reportada es de 30.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-05 con semilla 1000. No se documenta el uso de RLHF, DPO ni refuerzo; es aprendizaje supervisado puro sobre demostraciones. El nombre del repositorio sugiere una variante con 70 épocas y sin filtro infrarrojo en las cámaras, aunque la model card no detalla estos extremos.

## Capacidades

- Manipulación robótica de pick-and-place: recoge y coloca una bola blanca sobre una pizarra negra.
- Control de un robot `so_follower` de 6 grados de libertad a partir de estado articular y dos cámaras.
- Percepción visual multimodal: procesa simultáneamente una vista global y una vista desde la palma del robot.
- Predicción de chunks de acciones para movimiento continuo y suave a 30 FPS.
- Ejecución de una única tarea condicionada por la etiqueta textual "pick place white ball".
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni modo de razonamiento (thinking mode); no es un modelo de lenguaje.

## Casos de uso

- Replicación de experimentos de imitación robótica: sirve como referencia para validar el pipeline de entrenamiento ACT con LeRobot 0.6.1 y comparar hiperparámetros (30.000 pasos, batch 8, lr 1e-05) en tareas de pick-and-place.
- Automatización de una celda de pick-and-place de laboratorio: el robot SO-100/SO-101 recoge una bola blanca y la coloca en una posición objetivo, útil para demos de manipulación de bajo coste.
- Base para fine-tuning con datos propios: se puede partir de esta política y reentrenar con un dataset propio mediante `lerobot-train --policy.type=act`, adaptándola a nuevas posiciones u objetos.
- Evaluación de robustez ante condiciones de iluminación: al estar entrenada con cámaras NoIR (sin filtro infrarrojo), permite estudiar cómo afecta el espectro de la cámara a la generalización visual.
- Docencia y formación en robótica de imitación: el repo incluye comandos `lerobot-rollout` y `lerobot-train` listos para usar, lo que facilita prácticas guiadas sobre hardware real.
- Benchmark interno de latencia y throughput: con 51,7 M de parámetros y 0,2 GB de pesos, sirve para medir la viabilidad de inferencia en tiempo real en GPUs de consumo dentro de un pipeline LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 51,7 M de parámetros y 0,2 GB de pesos; el cuello de botella real son las dos cámaras a 480x640 y 30 FPS, no el modelo.
- GPU recomendadas: cualquier GPU con CUDA compatible con PyTorch; una RTX 3060, RTX 4060 o superior es más que suficiente. Para entrenamiento, una RTX 4090 o A100 acelera los 30.000 pasos, aunque el modelo cabe en GPUs mucho menores.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660 en adelante) e incluso podría ejecutarse en CPU para inferencia, aunque a menor tasa de frames.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el método documentado. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El sistema debe operar a 30 FPS para coincidir con la frecuencia de captura del dataset; no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kob0105/act_whiteball_blackboard_NoIR_70ep1_NEW | 51,7 M | Pick-and-place bola blanca, robot so_follower | Sin evaluación publicada | apache-2.0 | HuggingFace (20 descargas) |
| Políticas ACT genéricas de LeRobot | Variable (típicamente 40-80 M) | Tareas de manipulación diversas | Depende del dataset | apache-2.0 | HuggingFace Hub |
| Políticas Diffusion Policy | Variable | Manipulación visomotora | Depende del dataset | varía | HuggingFace Hub |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: la política está entrenada exclusivamente sobre una tarea, un objeto (bola blanca), un fondo (pizarra negra) y un robot concreto; generalizará mal a otros objetos, colores, fondos o brazos distintos.
- Riesgo de alucinación: en el contexto de imitación robótica, el equivalente es la ejecución de acciones incorrectas o inseguras cuando la escena difiere de la distribución de entrenamiento; no hay mecanismo de verificación.
- Limitaciones de contexto o idioma: no procesa lenguaje natural; la etiqueta "pick place white ball" es solo una condición de tarea, no una instrucción libre.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación con atribución; no obstante, el autor no ofrece garantías y la política no ha sido validada en producción.
- Caveats para producción: no hay evaluación de tasa de éxito, ni pruebas de robustez ante cambios de iluminación, posición inicial o distracciones; el dataset es pequeño (70 episodios, 27.858 frames) y el modelo tiene solo 20 descargas y 0 likes, lo que indica escasa validación comunitaria.
- Dependencia de hardware específico: requiere un robot `so_follower` con dos cámaras configuradas con los nombres `global` y `palm`; cualquier desviación en la configuración invalida la inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kob0105/act_whiteball_blackboard_NoIR_70ep1_NEW
- Dataset de entrenamiento: https://huggingface.co/datasets/kob0105/record_test_new_whiteball_blackboard_NoIR_No2
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kob0105/record_test_new_whiteball_blackboard_NoIR_No2
