# Haku-2004/act_k6s45_pred_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. Este checkpoint concreto, publicado por el usuario Haku-2004 bajo el identificador `act_k6s45_pred_20`, ha sido entrenado con la librería LeRobot de Hugging Face sobre el dataset `Haku-2004/k6_4seg`, y está pensado para controlar un robot tipo SO-100 (brazo seguidor) en una tarea específica de manipulación.

El modelo no es un LLM: es una política de control motor con arquitectura transformer y 51.672.714 parámetros (aproximadamente 51,7 millones), distribuidos en un fichero safetensors de unos 0,2 GB. Su relevancia radica en que ejemplifica el flujo estándar de LeRobot para entrenar políticas de imitación reproducibles y desplegables en robots de bajo coste, con licencia Apache 2.0.

Al tratarse de un checkpoint de robótica entrenado sobre un dataset propio y con cero descargas, su alcance es experimental y ligado a la tarea concreta para la que fue entrenado; no debe interpretarse como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.672.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Dataset de entrenamiento | Haku-2004/k6_4seg |
| Tamano del repositorio | 0,2 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder que recibe observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) y predice un chunk de acciones futuras de forma conjunta. Esta predicción por bloques reduce el error de acumulación típico de las políticas que predicen un único paso y mejora la estabilidad del control en tareas de manipulación. El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con `lerobot-train` sobre el dataset `Haku-2004/k6_4seg`, que contiene demostraciones teleoperadas. No se dispone de información sobre el número de episodios, la composición exacta del dataset, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos. Tampoco hay datos publicados sobre RLHF, DPO u otras fases de ajuste, algo que no aplica en el paradigma de imitación supervisada de ACT.

## Capacidades

- Predicción de chunks de acciones para control de robots manipuladores.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Control de un robot SO-100 follower (según el ejemplo de evaluación de la model card).
- Integración nativa con el ecosistema LeRobot (entrenamiento, evaluación y registro de episodios).
- Ejecución de políticas en GPU mediante `lerobot-record` con `--policy.path`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling ni capacidades multilingües.

## Casos de uso

- Manipulación robótica de laboratorio: replicar una tarea concreta de picking y colocación sobre un SO-100 usando las demostraciones del dataset `k6_4seg`, aprovechando la predicción por chunks para suavizar el control.
- Investigación en aprendizaje por imitación: servir como línea base reproducible para comparar variantes de ACT, cambios en el dataset o hiperparámetros de entrenamiento con LeRobot.
- Evaluación de políticas en robot real: usar `lerobot-record` con `--episodes=10` para medir la tasa de éxito de la política en el entorno físico y detectar sobreajuste al dataset.
- Prototipado rápido de automatización de bajo coste: desplegar el checkpoint en un brazo SO-100 asequible para validar un flujo de trabajo antes de invertir en hardware industrial.
- Docencia y formación: ilustrar el ciclo completo de LeRobot (entrenamiento, checkpoints, evaluación) con un modelo pequeño de 51,7 M de parámetros que cabe en cualquier GPU consumer.
- Reentrenamiento específico de tarea: partir de este checkpoint o de su pipeline para adaptar la política a una nueva tarea grabando episodios adicionales con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos (51,7 M de parámetros en safetensors, repo de 0,2 GB); el consumo real depende de las imágenes de entrada y del tamaño de batch.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1660, RTX 3060, RTX 4090, A100 o H100; el modelo es muy ligero.
- Cabe en GPU consumer sin problema, incluso en iGPU con suficiente memoria compartida para tareas de inferencia en tiempo real.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch/CUDA; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen del robot, la frecuencia de control y el hardware de captura de imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6s45_pred_20 (este) | 51,7 M | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (paper 2304.13705) | no disponible en la informacion | no aplica | resultados del paper, no comparables directamente | no disponible en la informacion | referencia academica |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible | no aplica | no disponible | no disponible | ecosistema LeRobot |

La comparación cuantitativa con alternativas no es posible con la información disponible, ya que no se han publicado métricas de éxito ni curvas de aprendizaje para este checkpoint.

## Limitaciones y advertencias

- Modelo específico de tarea: entrenado únicamente sobre `Haku-2004/k6_4seg`; no generaliza a otras tareas, objetos o entornos sin reentrenamiento.
- Sin métricas publicadas: no hay tasa de éxito, curvas de pérdida ni evaluaciones que permitan estimar su fiabilidad en producción.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- Dependencia del hardware: el comportamiento está acoplado a la cinemática del robot y a la configuración de cámaras usadas durante la teleoperación.
- Riesgo de sobreajuste a las condiciones de iluminación, posiciones de objetos y ruido del dataset original.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse fuera del ámbito del control robótico.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia y calidad del dataset antes de un despliegue real.
- No se dispone de información sobre sesgos, ya que no es un modelo generativo de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6s45_pred_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
