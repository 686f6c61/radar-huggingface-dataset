# Haku-2004/act_k5_base_15

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_k5_base_15`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k5_20261110_143202` y publicada en Hugging Face por el usuario Haku-2004. Está pensada para ejecutarse sobre robots tipo SO-100/SO-101 mediante el stack de LeRobot.

El modelo resuelve el problema de generar comandos de control de baja latencia a partir de observaciones visuales y propioceptivas, aprendiendo de datos de teleoperación. Frente a políticas que predicen una sola acción por paso, ACT predice un chunk de acciones, lo que reduce el error de composición acumulado y mejora la estabilidad en tareas de manipulación.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero orientado a inferencia en tiempo real en hardware modesto. La licencia Apache 2.0 facilita su reutilización y despliegue comercial. No se dispone de información sobre idiomas, benchmarks publicados ni detalles del dataset de entrenamiento más allá de su identificador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder que combina un backbone visual con un transformer que procesa observaciones (imágenes de cámaras y estado propioceptivo del robot) y genera un chunk de acciones futuras. La innovación principal del método es la predicción de chunks con una componente de temporal ensembling, que suaviza las transiciones entre chunks y reduce la varianza en la ejecución. El paper de referencia es arXiv:2304.13705.

Este checkpoint concreto ha sido entrenado con LeRobot sobre el dataset `Haku-2004/k5_20261110_143202`, presumiblemente capturado mediante teleoperación sobre un robot SO-100 follower (así se deduce del comando de evaluación de la model card). No se dispone de información sobre el número de episodios, la composición exacta del dataset, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta el uso de RLHF/DPO, algo que no aplica a este tipo de políticas de imitación.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y de estado del robot.
- Manipulación de objetos en entornos de laboratorio o mesa de trabajo, condicionada a la distribución del dataset de entrenamiento.
- Ejecución en tiempo real sobre robots SO-100/SO-101 mediante `lerobot-record` y el stack de LeRobot.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue con los mismos comandos de CLI.
- Predicción multi-paso con temporal ensembling para transiciones suaves entre chunks.
- No dispone de capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico; es una política puramente motora.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo puede ejecutar secuencias de agarre y colocación aprendidas del dataset de teleoperación, adecuado para tareas repetitivas de banco de pruebas con el robot SO-100.
- Automatización de tareas de ensamblaje simple: al predecir chunks de acciones, mantiene trayectorias estables en tareas de inserción o apilado dentro de la distribución entrenada.
- Prototipado rápido de políticas con LeRobot: sirve como punto de partida para fine-tuning sobre nuevos datasets capturados con el mismo robot y configuración de cámaras.
- Evaluación comparativa de métodos de imitación: al ser un checkpoint ACT estándar, permite comparar contra otras políticas (Diffusion Policy, VQ-BeT) en el mismo entorno y dataset.
- Investigación en aprendizaje por imitación: útil para estudiar el efecto del action chunking y el temporal ensembling en la estabilidad de la ejecución.
- Demostraciones educativas de robótica con bajo coste: su tamaño reducido (0,2 GB) permite ejecutarlo en GPUs de consumo y en entornos docentes con hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros, más el overhead del backbone visual y de las imágenes de entrada; en la práctica, unos pocos GB según resolución y número de cámaras.
- GPU recomendadas: cualquier GPU con CUDA de gama media o superior; una RTX 3060/4060 es suficiente para inferencia en tiempo real.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con al menos 4-6 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), exportación a safetensors y carga directa desde la librería lerobot; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k5_base_15 (este) | 51,7 M | no aplica | no disponible | apache-2.0 | Hugging Face |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | implementaciones abiertas en LeRobot |
| VQ-BeT | no disponible | no aplica | no disponible | no disponible | implementaciones abiertas en LeRobot |

No se dispone de datos de rendimiento comparables en la información proporcionada; la comparativa se limita a la categoría de método (políticas de imitación para robótica) y a su disponibilidad en el ecosistema LeRobot.

## Limitaciones y advertencias

- El modelo solo es válido para el robot y la configuración de cámaras con los que se entrenó; cambiar de robot, de montaje o de iluminación degrada el rendimiento.
- No generaliza fuera de la distribución del dataset `Haku-2004/k5_20261110_143202`; tareas no vistas requerirán nuevos datos y reentrenamiento.
- No hay información pública sobre sesgos del dataset, diversidad de escenarios ni posibles comportamientos inseguros en el robot.
- Riesgo de alucinación en el sentido de acciones no válidas o inseguras cuando la observación se aleja de la distribución de entrenamiento; se recomienda supervisión humana y límites de par/velocidad en el robot.
- No dispone de capacidades de lenguaje ni multilingües; la fila de idiomas no aplica.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la seguridad física del robot recae en el desplegador.
- No se documentan métricas de éxito, número de episodios ni protocolo de evaluación; no debe asumirse un rendimiento concreto sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5_base_15
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
