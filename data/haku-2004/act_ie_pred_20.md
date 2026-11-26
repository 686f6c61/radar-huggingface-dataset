# Haku-2004/act_ie_pred_20

## Resumen

`act_ie_pred_20` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario Haku-2004 en Hugging Face y se ha entrenado y subido mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Con 51.672.714 parámetros y un repositorio de 0,2 GB, es una política compacta orientada a control robótico de manipulación.

El modelo resuelve el problema de mapear observaciones (típicamente imágenes de cámara y estado de las articulaciones) a secuencias de acciones motrices, aprendiendo de datos de teleoperación. ACT es relevante porque logra tasas de éxito altas con datasets relativamente pequeños gracias a la predicción de chunks de acciones, que reduce el error de acumulación y suaviza el control. Esta instancia concreta se ha entrenado sobre el dataset `Haku-2004/i_4seg`, presumiblemente capturas de un robot de tipo SO-100/SO-101 según los comandos de ejemplo de la model card.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card; no se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de aprendizaje por imitación basada en transformer que, a partir de observaciones multimodales (imágenes de cámaras y estado proprioceptivo del robot), predice un chunk de acciones futuras en lugar de una única acción por paso. Esta estrategia de predicción por bloques reduce el error compounding típico de las políticas paso a paso y produce movimientos más suaves y coherentes. El paper original incorpora además una técnica de ensembling temporal de los chunks predichos para mejorar la estabilidad del control.

El entrenamiento se ha realizado con LeRobot sobre el dataset `Haku-2004/i_4seg`, que no está descrito en detalle en la información disponible (número de episodios, tareas, composición y frecuencia de captura no disponibles). No se especifica si hubo aumento de datos, número de épocas, hiperparámetros ni proceso de validación. El modelo se ha subido a Hugging Face con fecha de creación 2026-11-26 y no registra descargas ni likes en el momento de la consulta.

## Capacidades

- Predicción de acciones robóticas por chunks a partir de observaciones visuales y de estado del robot.
- Aprendizaje por imitación a partir de datos de teleoperación (no es un modelo generativo de texto).
- Control de manipulación para robots tipo SO-100/SO-101, según los comandos de ejemplo de la model card (`so100_follower`).
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación/inferencia (`lerobot-record`).
- No soporta tool calling, function calling, agentes de texto ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto, código, matemáticas, visión general o audio.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política puede ejecutar tareas de pick-and-place aprendidas de teleoperación, usando la predicción por chunks para generar trayectorias suaves y reducir el error acumulado en secuencias largas.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar variantes de ACT, datasets y configuraciones de entrenamiento dentro de LeRobot.
- Prototipado rápido de políticas con SO-100/SO-101: al ser un modelo compacto (51,7 M de parámetros, 0,2 GB), se puede entrenar y desplegar en estaciones de trabajo con una sola GPU consumer.
- Automatización de tareas repetitivas de ensamblaje: entrenando sobre el dataset `i_4seg`, la política puede replicar secuencias de inserción o colocación de piezas capturadas por teleoperación.
- Evaluación de robustez frente a variaciones de iluminación y posición: útil para estudiar la generalización de ACT cuando el dataset de entrenamiento es limitado.
- Docencia y formación en robótica: ejemplo práctico de pipeline completo LeRobot (dataset, entrenamiento, evaluación con `lerobot-record`) para cursos de aprendizaje por imitación.
- Despliegue en el borde (edge): el tamaño reducido del checkpoint permite ejecutar inferencia en tiempo real en hardware embebido con GPU integrada, siempre que se valide la latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el checkpoint ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060, RTX 4090, A100, H100); para entrenamiento se recomienda al menos una RTX 3090/4090 por comodidad, aunque el tamaño del modelo permite GPUs menores.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia en CUDA; no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_ie_pred_20 | 51,7 M | no aplica | Manipulación robótica (ACT) | apache-2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación robótica (ACT) | apache-2.0 (típicamente) | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación robótica (difusión) | no disponible | Hugging Face / LeRobot |
| Políticas π0 (Physical Intelligence) | no disponible en esta búsqueda | no aplica | Manipulación generalista | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible porque no se han publicado métricas de éxito, latencia ni comparaciones en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado métricas de tasa de éxito, generalización ni robustez; el rendimiento real es desconocido.
- El dataset de entrenamiento (`Haku-2004/i_4seg`) no está descrito: se desconoce el número de episodios, la variedad de tareas y las condiciones de captura, lo que limita evaluar su generalización.
- Política específica para un robot y un entorno concretos; no es un modelo generalista y probablemente fallará fuera de la distribución de entrenamiento.
- Sin capacidades de texto, razonamiento simbólico, tool calling ni multilingüismo; no debe evaluarse como un LLM.
- Riesgo de sobreajuste al dataset de teleoperación y a las condiciones de iluminación, cámara y posiciones iniciales de las demostraciones.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del dataset asociado antes de usos productivos.
- El repositorio no registra descargas ni validación de la comunidad; no hay evidencia externa de que el checkpoint funcione correctamente.
- No se documentan sesgos conocidos, pero al ser un modelo robótico puede heredar sesgos de las demostraciones humanas (por ejemplo, preferencias de trayectoria o posiciones).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_ie_pred_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_4seg
