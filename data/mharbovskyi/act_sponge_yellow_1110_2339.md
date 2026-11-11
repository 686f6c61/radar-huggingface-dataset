# mharbovskyi/act_sponge_yellow_1110_2339

## Resumen

`mharbovskyi/act_sponge_yellow_1110_2339` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo aprende una tarea de manipulación muy concreta a partir de teleoperación: introducir una esponja amarilla en un cuenco. Lo desarrolla el usuario de Hugging Face `mharbovskyi` y se distribuye a través de la librería LeRobot de Hugging Face, con un total de 51.668.614 parámetros y un repositorio de 2,5 GB.

A diferencia de un modelo de lenguaje, este artefacto es una política visuomotora que consume el estado articular del robot (vector de 6 dimensiones) y tres cámaras (muñeca, superior y lateral) para producir un vector de acción de 6 dimensiones. Su relevancia es la de un ejemplo reproducible y didáctico de entrenamiento ACT de extremo a extremo con LeRobot 0.7.1 sobre un robot SO-100/SO-101 (tipo `so_follower`), útil para quien quiera replicar el pipeline o adaptarlo a otra tarea.

La información pública es escasa: no hay licencia declarada, no hay idiomas (no aplica), no hay resultados de evaluación en robot real y el conjunto de entrenamiento es muy pequeño (33 episodios, 13.397 frames a 30 FPS). Debe tratarse, por tanto, como una política experimental de tarea única y no como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no aplica; entrada visual y estado articular) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-100/SO-101) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 720, 1280), `observation.images.top` (3, 480, 640), `observation.images.side` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tarea | "Put the yellow sponge in the bowl" |
| Dataset de entrenamiento | `mharbovskyi/sponge_yellow` (33 episodios, 13.397 frames, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La implementación de LeRobot combina un encoder visual (procesa las tres cámaras: muñeca a 720x1280 y superior/lateral a 480x640), una proyección del estado articular de 6 dimensiones y un decoder transformer que emite secuencias de acciones de 6 dimensiones. El modelo se entrenó con 20.000 pasos, batch size 8, AdamW y learning rate 1e-05, con semilla 1000, sobre el dataset `mharbovskyi/sponge_yellow` (33 episodios teleoperados, 13.397 frames a 30 FPS).

No se documentan detalles adicionales sobre composición del dataset, aumentos de datos, regularización ni uso de RLHF/DPO (no aplica en este paradigma). La innovación técnica principal es la propia formulación de ACT: predicción de chunks de acción para suavizar el control y aumentar la tasa de éxito en tareas de precisión. El modelo se entrenó y publicó con LeRobot 0.7.1.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` para una tarea de pick-and-place concreta ("Put the yellow sponge in the bowl").
- Fusión de tres vistas de cámara (muñeca, superior y lateral) con el estado articular de 6 dimensiones.
- Predicción de chunks de acción de 6 dimensiones, lo que permite un control más suave que la predicción paso a paso.
- Aprendizaje por imitación a partir de teleoperación; no requiere recompensas ni entorno simulado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No soporta visión general, audio ni modos de "thinking": la visión está limitada a las tres cámaras del robot.

## Casos de uso

- Replicación de un pipeline ACT de extremo a extremo: sirve como referencia para grabar un dataset con LeRobot, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` sobre un SO-100/SO-101.
- Docencia y formación en aprendizaje por imitación: la tarea es simple y el dataset pequeño (33 episodios), lo que facilita explicar el flujo completo de teleoperación, entrenamiento y evaluación en robot real.
- Base para fine-tuning en tareas de pick-and-place: se puede reentrenar con un dataset propio de otra esponja u objeto y comparar curvas de éxito.
- Validación de hardware y calibración: útil para comprobar que las tres cámaras (muñeca, superior y lateral) y el bus del robot están correctamente configurados antes de abordar tareas más complejas.
- Estudio de robustez ante variaciones de iluminación y posición de objetos: al ser una política de tarea única, permite medir cómo decae el éxito al cambiar condiciones sin reentrenar.
- Benchmark interno de referencia para comparar variantes de ACT (distinto número de cámaras, resolución, chunk size) sobre la misma tarea y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros; en FP32 son aproximadamente 207 MB de pesos, y en FP16 unos 103 MB. A ello hay que sumar la memoria de activaciones del encoder visual, que procesa tres cámaras (una a 720x1280 y dos a 480x640); en la práctica, una GPU consumer con 8 GB es suficiente.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para inferencia; para entrenamiento con batch size 8 y resolución completa se recomienda 16 GB o más (RTX 4080/4090, A100, H100).
- Cabe en GPU consumer: sí, en RTX 3060/4060/4090 y equivalentes.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=mharbovskyi/act_sponge_yellow_1110_2339`), que carga los pesos safetensors directamente. No se documentan exportaciones a ONNX, TensorRT, llama.cpp ni Ollama (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. Dependen del robot, de la frecuencia de captura de las cámaras (30 FPS en el dataset) y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mharbovskyi/act_sponge_yellow_1110_2339` | ACT (LeRobot) | 51,7 M | no aplica | Esponja amarilla en cuenco (SO-100/SO-101) | no disponible | Hugging Face |
| Políticas ACT de referencia de LeRobot | ACT (LeRobot) | del orden de decenas de millones (variable) | no aplica | Tareas de manipulación diversas | según repositorio | Hugging Face / LeRobot |
| Políticas Diffusion Policy | Diffusion Policy | variable (mayor que ACT típicamente) | no aplica | Manipulación visuomotora | según repositorio | Hugging Face / LeRobot |
| Políticas VQ-BeT / otros métodos de IL | VQ-BeT | variable | no aplica | Manipulación visuomotora | según repositorio | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, tamaño y disponibilidad. Cualquier comparación de tasas de éxito requeriría evaluar cada política sobre la misma tarea y robot, algo que este repositorio no documenta.

## Limitaciones y advertencias

- Tarea única y muy específica: el modelo solo está entrenado para "Put the yellow sponge in the bowl"; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeño: 33 episodios y 13.397 frames, lo que limita la robustez ante cambios de posición, iluminación, fondo o tipo de objeto.
- Sin resultados de evaluación publicados: no se conoce la tasa de éxito real en robot, por lo que no debe asumirse un rendimiento concreto.
- Licencia no declarada: no hay información sobre uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dependencia de hardware concreto: requiere un robot `so_follower` y tres cámaras con los nombres y resoluciones exactos (`wrist` a 720x1280, `top` y `side` a 480x640); cualquier desviación en la configuración puede degradar el rendimiento.
- Riesgo de sobreajuste al entorno de grabación: al no haber evaluación en condiciones variadas, es probable que el modelo falle ante distribuciones visuales distintas a las del dataset.
- Sin cuantizaciones ni formatos alternativos documentados: el despliegue está atado al stack LeRobot y a los pesos safetensors originales.
- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K, ni usarse para tareas de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mharbovskyi/act_sponge_yellow_1110_2339
- Dataset de entrenamiento: https://huggingface.co/datasets/mharbovskyi/sponge_yellow
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mharbovskyi/sponge_yellow
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
