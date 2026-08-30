# eh-cosmos-ai/policy_pick_and_place_v2

## Resumen

El modelo `eh-cosmos-ai/policy_pick_and_place_v2` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario `eh-cosmos-ai` y publicada en Hugging Face bajo licencia Apache 2.0. Está diseñada para ejecutar tareas de manipulación de tipo pick-and-place mediante aprendizaje por imitación a partir de datos teleoperados. El modelo se ha entrenado con la librería LeRobot y el dataset `eh-cosmos-ai/dataset_pick_and_place_v2`, ambos de acceso abierto.

Con 51.668.614 parámetros y un tamaño de repositorio de 0.2 GB, se trata de una política compacta y ligera, adecuada para entornos de investigación y despliegue en robots de bajo coste. Su arquitectura transformer predictiva por lotes de acciones (action chunking) permite generar secuencias de comandos de control de forma eficiente, reduciendo la frecuencia de inferencia necesaria durante la ejecución. La relevancia actual del modelo radica en su enfoque reproducible y abierto dentro del ecosistema LeRobot, que facilita la experimentación en robótica de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT, presentada en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). ACT es un método de aprendizaje por imitación que predice fragmentos de acciones (chunks) de varios pasos en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La política se compone de un transformer encoder-decoder que procesa observaciones visuales y del estado del robot para generar secuencias de comandos de control.

El entrenamiento se realizó con la librería LeRobot, utilizándose el dataset `eh-cosmos-ai/dataset_pick_and_place_v2` que contiene demostraciones teleoperadas de la tarea. No se dispone de información detallada sobre el número de tokens de entrenamiento, composición exacta del dataset ni si se aplicaron técnicas de refuerzo adicionales. El modelo se publica como checkpoint listo para inferencia o evaluación con LeRobot.

## Capacidades

- Control de robots manipuladores para tareas de pick-and-place (coger y colocar objetos).
- Aprendizaje por imitación a partir de datos teleoperados, permitiendo reproducir comportamientos demostrados.
- Generación de secuencias de acciones (action chunking) para un control suave y eficiente.
- Integración con el ecosistema LeRobot, incluyendo robots como SO-100 y ALOHA.
- Inferencia en tiempo real en GPUs con soporte CUDA gracias a su tamaño reducido.
- Capacidad de evaluación y grabación de episodios mediante la herramienta `lerobot-record`.

## Casos de uso

- Automatización industrial ligera: la política puede desplegarse en brazos robóticos de bajo coste para tareas repetitivas de recogida y colocación de piezas en líneas de montaje, reduciendo la intervención humana.
- Investigación en robótica: sirve como punto de partida para experimentos sobre aprendizaje por imitación, generalización de políticas y transferencia de tareas en entornos académicos.
- Prototipado de células de trabajo: con el soporte de LeRobot, permite validar rápidamente flujos de pick-and-place en simuladores o entornos reales antes de escalar a producción.
- Educación y formación: al ser un modelo abierto y ligero, se puede utilizar en laboratorios docentes para enseñar conceptos de control robótico y aprendizaje automático.
- Robótica asistencial: en entornos de hogar o cuidado, el modelo puede controlar robots que recogen y colocan objetos cotidianos para personas con movilidad reducida.
- Benchmarking de políticas: dado que está publicado en Hugging Face con métricas de descarga, puede emplearse como referencia para comparar nuevas arquitecturas de control en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de éxito, precisión o comparativas con otras políticas en la model card ni en el repositorio.

## Requisitos de hardware

- Inferencia: al tener solo 51.7M de parámetros, el modelo es muy ligero. Se estima que requiere menos de 1 GB de VRAM en precisión FP32, aunque no se dispone de datos oficiales de consumo.
- GPU recomendada: cualquier GPU moderna con soporte CUDA y al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060 o superiores) es suficiente para ejecutar la política.
- Es compatible con GPUs de consumo, por lo que no se necesitan GPUs de centro de datos como A100 o H100.
- Opciones de despliegue: LeRobot ofrece scripts de entrenamiento e inferencia (`lerobot-train`, `lerobot-record`), y el modelo puede ejecutarse en entornos con PyTorch y CUDA. No se menciona soporte para vLLM, Ollama o llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos, pero dada la arquitectura compacta, se espera una inferencia en tiempo real en GPUs de gama media.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (políticas ACT para pick-and-place). Existen otros checkpoints de políticas en el Hub de Hugging Face entrenados con LeRobot, pero no se han encontrado datos concretos para establecer una comparación cuantitativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para la tarea de pick-and-place con el dataset `eh-cosmos-ai/dataset_pick_and_place_v2`; puede no generalizar a otras tareas o variaciones del entorno sin reentrenamiento.
- No se han documentado sesgos ni riesgos de alucinación, ya que no es un modelo generativo de texto.
- La dependencia de datos teleoperados implica que la calidad de la política está limitada por la diversidad y corrección de las demostraciones.
- No se especifican restricciones de uso comercial; la licencia Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar los términos del dataset asociado.
- Para su uso en producción, es necesario integrar el modelo con un sistema de control robótico real, calibración de cámaras y gestión de seguridad, aspectos no cubiertos por el modelo en sí.
- La fecha de creación (2026-08-30) indica que es un modelo reciente, pero no se dispone de información sobre mantenimiento o soporte a largo plazo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/eh-cosmos-ai/policy_pick_and_place_v2)
- [Dataset asociado](https://huggingface.co/datasets/eh-cosmos-ai/dataset_pick_and_place_v2)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [LeRobot (librería y documentación)](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
