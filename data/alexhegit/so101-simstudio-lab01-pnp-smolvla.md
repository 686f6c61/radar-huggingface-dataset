# alexhegit/so101-simstudio-lab01-pnp-smolvla

## Resumen

El modelo `alexhegit/so101-simstudio-lab01-pnp-smolvla` es un ajuste fino (fine-tuning) de la política robótica SmolVLA, desarrollado por alexhegit sobre el modelo base `lerobot/smolvla_base`. Está entrenado con demostraciones expertas de una tarea de pick-and-place (coger y colocar) en un entorno simulado con MuJoCo, recopiladas mediante el sistema SO-101 SimStudio, que permite teleoperación con un brazo líder y validación sim2sim.

Este modelo resuelve el problema de control de un brazo robótico para ejecutar manipulaciones precisas en simulación, sirviendo como punto de partida para transferencia a entornos reales (sim2real) o para investigación en aprendizaje por imitación. Su relevancia radica en que demuestra un flujo completo de entrenamiento de políticas con LeRobot, utilizando hardware AMD (MI300X) y un dataset propio. La arquitectura es un Vision-Language-Action (VLA) basado en SmolVLA, con aproximadamente 450 millones de parámetros, aunque no se especifica la longitud de contexto ni otros detalles técnicos en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en SmolVLA, modelo base: `lerobot/smolvla_base`) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de SmolVLA, una política de tipo Vision-Language-Action (VLA) que combina un modelo de lenguaje y visión para generar acciones de control. La arquitectura exacta (número de capas, tipo de atención, etc.) no se detalla en la información proporcionada, pero se sabe que el modelo base es `lerobot/smolvla_base`. El entrenamiento se realizó con demostraciones expertas de pick-and-place en simulación, recopiladas mediante SO-101 SimStudio (MuJoCo sim2sim, teleoperación con brazo líder). El dataset utilizado es `alexhegit/so101-simstudio-lab01-pnp`, que incluye tres cámaras (`camera_top`, `camera_front`, `camera_wrist`) mapeadas a los canales `camera1`, `camera2` y `camera3` de SmolVLA.

El entrenamiento se ejecutó en una GPU AMD Instinct MI300X con 192 GB de HBM, usando un batch size de 64 y 50 000 pasos (~3,2 millones de actualizaciones de muestras), alcanzando una pérdida final de 0,018. El tiempo total fue de aproximadamente 7 horas y 45 minutos. No se menciona el uso de técnicas como RLHF o DPO, ya que es un entrenamiento supervisado por imitación.

## Capacidades

- Ejecución de tareas de pick-and-place en entornos simulados (MuJoCo), controlando un brazo robótico para recoger y colocar objetos.
- Percepción visual multi-cámara: utiliza tres cámaras (superior, frontal y muñeca) para generar acciones.
- Control continuo de articulaciones del robot, típico de políticas VLA.
- Integración con el ecosistema LeRobot, permitiendo carga directa con `SmolVLAPolicy.from_pretrained`.
- Capacidad de evaluación sim2sim en MuJoCo, siguiendo el protocolo descrito en Lab 01.
- No soporta generación de texto, tool calling ni razonamiento de propósito general; es un modelo especializado en control robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia para estudiar cómo se comporta una política VLA en tareas de manipulación en simulación, permitiendo comparar variantes de entrenamiento.
- Desarrollo de pipelines sim2real: el modelo puede servir como punto de partida para transferir políticas entrenadas en simulación a robots reales, aunque requiere adaptación adicional.
- Prototipado rápido de tareas robóticas: con SO-101 SimStudio, se pueden generar nuevas demostraciones y reentrenar el modelo para otras tareas de pick-and-place, acelerando la experimentación.
- Evaluación de hardware: el entrenamiento en MI300X demuestra la viabilidad de usar GPUs AMD para fine-tuning de modelos VLA, útil para equipos con este hardware.
- Benchmarking de políticas: al estar disponible públicamente, puede usarse como baseline en comparaciones de rendimiento de políticas robóticas en entornos simulados.
- Educación y formación: permite a estudiantes y desarrolladores aprender a usar LeRobot y SmolVLA con un ejemplo completo y reproducible, desde la recopilación de datos hasta la evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, GSM8K) en la informacion disponible, ya que se trata de un modelo de robotica y no de lenguaje. La unica metrica reportada es la perdida de entrenamiento final (0,018) y el tiempo de entrenamiento (~7h 45m en MI300X). No se proporcionan metricas de exito en tareas de pick-and-place ni comparaciones con otros modelos.

## Requisitos de hardware

- El entrenamiento se realizó en una AMD Instinct MI300X con 192 GB de HBM, usando aproximadamente 26 GB de memoria. No se especifican requisitos para inferencia.
- Dado que el modelo tiene 450 millones de parámetros, en formato safetensors (0,9 GB), es probable que pueda ejecutarse en GPUs consumer con al menos 8-12 GB de VRAM, pero no hay datos oficiales.
- Para inferencia, se puede usar la librería LeRobot con PyTorch. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- La evaluación sim2sim requiere MuJoCo y el entorno SO-101 SimStudio, que se ejecuta en CPU o GPU según la configuración.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de comparación con otros modelos de política robótica en la información disponible. El único punto de referencia es el modelo base `lerobot/smolvla_base`, del cual es un fine-tuning, pero no se incluyen métricas comparativas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en simulación (MuJoCo), por lo que puede no transferirse directamente a robots reales sin ajustes adicionales (sim2real gap).
- No hay información sobre sesgos o alucinaciones, ya que no es un modelo de lenguaje; sin embargo, su comportamiento depende de la calidad de las demostraciones de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base `lerobot/smolvla_base` para posibles restricciones adicionales.
- No se especifican limitaciones de contexto o idioma, ya que no aplican a un modelo de control robótico.
- El modelo solo cubre la tarea de pick-and-place en el entorno específico de Lab 01; generalizar a otras tareas o entornos requeriría reentrenamiento.
- No se proporcionan garantías de rendimiento en producción; se recomienda validar en el entorno objetivo antes de desplegar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-smolvla)
- [Dataset de entrenamiento](https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp)
- [Repositorio SO-101 SimStudio](https://github.com/rocPAI-Forge/so101-simstudio)
- [Walkthrough Lab 01 (record → train → eval)](https://github.com/rocPAI-Forge/so101-simstudio/blob/main/labs/lab01_pnp/lab01_pnp.md)
- [Modelo base SmolVLA](https://huggingface.co/lerobot/smolvla_base)
