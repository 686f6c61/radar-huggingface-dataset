# jaheroth/act_pusht_bs64_dec7_seed1002_200k

## Resumen

El modelo `jaheroth/act_pusht_bs64_dec7_seed1002_200k` es una política de aprendizaje por imitación basada en la arquitectura ACT (Action Chunking with Transformers), publicada en el paper [2304.13705](https://huggingface.co/papers/2304.13705). Ha sido entrenada y subida al Hub de Hugging Face mediante la librería LeRobot, un framework de código abierto para robótica. El modelo está diseñado para el entorno `pusht`, un benchmark de manipulación robótica que consiste en empujar un objeto (un cilindro) hacia una región objetivo.

Con aproximadamente 84 millones de parámetros y un tamaño de repositorio de 0,3 GB, esta política es ligera y puede ejecutarse en hardware de consumo. Su relevancia radica en ser un ejemplo práctico de cómo aplicar ACT con LeRobot para tareas de control robótico, demostrando el flujo de entrenamiento, evaluación y despliegue que propone la librería. El nombre del repositorio sugiere un entrenamiento con batch size 64, decay en el paso 7, semilla 1002 y 200k iteraciones, aunque estos detalles no están confirmados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 83.969.428 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de control) |
| Tipos de cuantizacion | no disponible (solo safetensors originales) |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales. Su arquitectura se basa en un transformer con codificador y decodificador, donde el codificador procesa observaciones (imágenes y estado del robot) y el decodificador genera una secuencia de acciones futuras. Este enfoque reduce el error de acumulación típico de las políticas reactivas y mejora la estabilidad del control.

El modelo ha sido entrenado sobre el dataset `lerobot/pusht` de LeRobot, que contiene demostraciones teleoperadas de la tarea de empuje. El proceso de entrenamiento ha seguido la configuración estándar de LeRobot para políticas ACT, con un batch size de 64 y 200k pasos según se infiere del nombre del repositorio. No se ha publicado información adicional sobre el dataset concreto, la composición de las demostraciones o si se aplicaron técnicas de post-entrenamiento como RLHF o DPO, que no son habituales en este tipo de modelos.

## Capacidades

- Generacion de acciones de control para robótica: predice secuencias de comandos para actuadores a partir de observaciones visuales y de estado.
- Aprendizaje por imitacion: es capaz de replicar comportamientos demostrados por teleoperación en el entorno `pusht`.
- Control por chunks: genera bloques de acciones (action chunking), lo que permite movimientos más suaves y robustos frente a perturbaciones.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y registro de LeRobot, incluyendo scripts de línea de comandos para inferencia.
- Ejecucion en tiempo real: su tamaño reducido (84M parámetros) permite inferencia de baja latencia en GPUs de consumo.
- Sin capacidades de lenguaje, vision generalista ni tool calling: es un modelo especializado en control robótico, no un modelo multimodal general.

## Casos de uso

- Investigacion en aprendizaje por imitacion: permite reproducir y estudiar el comportamiento de ACT en un benchmark estandarizado, facilitando comparaciones con otras políticas.
- Desarrollo de politicas de manipulacion: puede servir como punto de partida para fine-tuning en tareas similares de empuje o manipulación con el mismo tipo de robot (por ejemplo, SO-100).
- Pruebas de algoritmos de control: al ser ligero y de código abierto, es útil para validar técnicas de action chunking, aumento de datos o regularización en entornos simulados.
- Educacion en robotica: ejemplo didáctico de cómo entrenar y desplegar una política con LeRobot, con documentación integrada en la model card.
- Benchmarking de hardware: al requerir poca VRAM, puede usarse para medir el rendimiento de GPUs de gama baja en inferencia de políticas robóticas.
- Integracion en pipelines de evaluacion: el script `lerobot.record` permite evaluar la política en entornos reales o simulados, generando métricas de éxito por episodio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no ha incluido métricas de éxito en el entorno `pusht` ni comparaciones con otras políticas. Se desconoce la tasa de éxito media, la varianza entre semillas o el rendimiento en condiciones de ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial, pero con 84M parámetros en fp32 el modelo ocupa aproximadamente 336 MB, por lo que cabría en cualquier GPU con más de 1 GB de VRAM. En cuantización fp16 o int8, el consumo sería aún menor.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090). También podría ejecutarse en CPU para pruebas no en tiempo real.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo básico y en placas con aceleración por hardware.
- Opciones de despliegue: LeRobot proporciona scripts de entrenamiento e inferencia. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje. Para despliegue en robot real se recomienda el script `lerobot.record`.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del tamaño de las imágenes de entrada y del número de acciones predichas por chunk.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de LeRobot y ACT para el entorno `pusht`. Existen otras políticas como Diffusion Policy o VQ-BeT, pero no se han encontrado datos de este modelo específico frente a ellas en las fuentes consultadas. Se recomienda consultar el [benchmark de LeRobot](https://github.com/huggingface/lerobot) para comparativas más amplias.

## Limitaciones y advertencias

- Entrenado exclusivamente para el entorno `pusht`: no es transferible directamente a otras tareas o robots sin fine-tuning.
- Dependencia de la calidad de las demostraciones: el rendimiento está limitado por los datos de teleoperación del dataset `lerobot/pusht`.
- Sin informacion sobre robustez: no se han publicado pruebas ante perturbaciones, oclusiones o cambios de iluminación.
- Riesgo de sobreajuste a la semilla y configuración específicas: el nombre del repo indica una semilla concreta (1002), por lo que puede no ser representativo de la media del algoritmo.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia de los datos de entrenamiento (`lerobot/pusht`).
- No es un modelo de lenguaje: no soporta tareas de NLP, generación de texto o razonamiento simbólico.
- La model card no especifica la versión exacta de LeRobot ni los hiperparámetros completos, lo que dificulta la reproducibilidad exacta.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jaheroth/act_pusht_bs64_dec7_seed1002_200k)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Dataset lerobot/pusht](https://huggingface.co/datasets/lerobot/pusht)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
