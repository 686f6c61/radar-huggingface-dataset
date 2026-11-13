# nuntasha/omx_act_pick_and_place

## Resumen

`nuntasha/omx_act_pick_and_place` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación presentada en el artículo arXiv 2304.13705 y publicada originalmente por Tony Z. Zhao y colaboradores. El modelo no es un LLM ni un modelo generativo de texto: es un controlador visuomotor que, a partir de observaciones (típicamente imágenes de cámara y estado de las articulaciones), predice secuencias cortas de acciones ("chunks") para ejecutar tareas de manipulación robótica.

El autor, `nuntasha`, ha entrenado y publicado esta política con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El modelo está especializado en una tarea concreta de pick-and-place, entrenado sobre el dataset `nuntasha/pick_and_place`, y está pensado para robots del ecosistema LeRobot (por ejemplo, el SO-100 follower que aparece en los comandos de evaluación de la model card).

Su relevancia es práctica: ACT es uno de los métodos de referencia para aprender tareas de manipulación a partir de demostraciones teleoperadas con pocos datos, y este checkpoint permite reproducir el flujo completo de entrenamiento y evaluación con `lerobot-train` y `lerobot-record`. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace ligero y desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visuomotora con ventana de observación fija definida en la configuración de LeRobot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación (imitation learning) que combina un backbone transformer con un esquema de predicción por chunks: en lugar de predecir una única acción por paso, el modelo genera un bloque de k acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación de precisión. La arquitectura incluye habitualmente un encoder de imágenes (ResNet) para las observaciones visuales y un transformer que modela la secuencia de estados y acciones; el checkpoint aquí publicado sigue la implementación de LeRobot para `policy.type=act`.

El entrenamiento se realizó sobre el dataset `nuntasha/pick_and_place`, compuesto por demostraciones teleoperadas de la tarea de pick-and-place. No se dispone de información sobre el número de episodios, la composición exacta del dataset ni si se aplicaron técnicas adicionales de aumento de datos o regularización. La model card no documenta detalles de hiperparámetros, número de tokens ni fases de RLHF/DPO, que en cualquier caso no aplican a este tipo de política.

## Capacidades

- Control visuomotor para manipulación robótica: predice acciones de las articulaciones a partir de observaciones visuales y de estado.
- Predicción por chunks de acciones, lo que permite ejecutar movimientos suaves y coherentes en tareas de pick-and-place.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Integración nativa con LeRobot: entrenamiento con `lerobot-train` y evaluación/inferencia con `lerobot-record`.
- Compatible con robots del ecosistema LeRobot, como el SO-100 follower mencionado en la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de recogida y colocación para la que fue entrenado sobre el robot SO-100, permitiendo validar pipelines de manipulación con un checkpoint ligero de 51,7 M de parámetros.
- Reproducción de experimentos de imitation learning: sirve como referencia para comparar el rendimiento de ACT frente a otras políticas de LeRobot (Diffusion Policy, TDMPC, etc.) sobre el mismo dataset.
- Prototipado rápido de tareas de manipulación: con `lerobot-train` se puede reentrenar la política sobre un dataset propio y usar este checkpoint como punto de partida o baseline.
- Evaluación de infraestructura robótica: `lerobot-record` con `--policy.path` permite medir tasas de éxito en 10 episodios de evaluación, útil para validar calibración de cámaras y del robot.
- Docencia y formación en robótica: el tamaño reducido del modelo y su licencia Apache 2.0 lo hacen adecuado para cursos prácticos de aprendizaje por imitación.
- Investigación en chunking de acciones: permite estudiar el efecto del tamaño de chunk y de la arquitectura transformer en tareas de manipulación con contacto.
- Despliegue en hardware de borde: al ocupar 0,2 GB, puede ejecutarse en GPUs de consumo e incluso en CPU para inferencia de baja frecuencia, facilitando demos portátiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 para 51,7 M de parámetros; en la práctica, el cuello de botella es el encoder visual y el preprocesado de imágenes, no los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo es lo suficientemente pequeño como para no requerir GPUs de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2-4 GB de VRAM libre; también es viable en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán de la GPU, del tamaño de imagen de entrada y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nuntasha/omx_act_pick_and_place | 51,7 M | no aplica | Pick-and-place (ACT) | Apache 2.0 | Hugging Face |
| ACT original (Zhao et al., 2023) | no disponible | no aplica | Manipulación con chunking | no disponible | Paper y código de referencia |
| Diffusion Policy (Chi et al., 2023) | no disponible | no aplica | Manipulación por difusión | no disponible | Repositorio público |
| Otras políticas LeRobot (p. ej. TDMPC) | variable | no aplica | Control robótico | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (pick-and-place) y en un dataset concreto; no generaliza a otras tareas de manipulación sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento simbólico.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios en iluminación, posición de cámara, fondo o tipo de objeto pueden degradar la tasa de éxito.
- No se documentan sesgos específicos, pero al ser una política entrenada con demostraciones humanas puede heredar sesgos de los datos de teleoperación (posiciones, velocidades y estrategias del operador).
- No hay información sobre el número de episodios de entrenamiento ni sobre la variabilidad del dataset, lo que dificulta estimar su robustez.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar el aviso de licencia y citar el trabajo original de ACT.
- Para producción, es necesario validar la política en el robot objetivo y con el mismo pipeline de percepción (cámaras, calibración) usado en el entrenamiento.
- No se han publicado métricas de éxito ni benchmarks, por lo que no se puede afirmar su rendimiento sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuntasha/omx_act_pick_and_place
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/nuntasha/pick_and_place
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
