# Gyseop/omx_realreal3

## Resumen

omx_realreal3 es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo lo publica el usuario Gyseop en Hugging Face y se ha generado con LeRobot, el framework de Hugging Face para aprendizaje por imitación en robótica. No es un modelo de lenguaje: es un controlador de políticas de actuación para robots manipuladores entrenado sobre un conjunto de datos de teleoperación propio (Gyseop/record-realreal3).

El modelo resuelve el problema de convertir observaciones (típicamente imágenes de cámaras y estado de las articulaciones) en comandos de acción para un robot, aprendiendo directamente de demostraciones humanas. Su relevancia radica en que ACT es uno de los métodos de referencia en imitación robótica por su simplicidad y sus tasas de éxito en tareas de manipulación, y este checkpoint concreto es un ejemplo reproducible de un pipeline completo de entrenamiento y evaluación con LeRobot.

Con 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors, es un modelo compacto que puede ejecutarse en hardware modesto. No dispone de ventana de contexto en el sentido de los modelos de lenguaje, sino de un horizonte de predicción de acciones definido por la configuración de ACT. La licencia es Apache 2.0 y el pipeline declarado es robotics.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción de acciones definido por la configuración de ACT; no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones específicas en la información disponible) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Gyseop/record-realreal3 |
| Tamaño del repositorio | 0,2 GB |
| Fecha de creación | 2026-11-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un encoder que procesa las observaciones (imágenes de las cámaras del robot y el estado de las articulaciones) con un decoder transformer que genera un *chunk* de acciones futuras de forma conjunta, en lugar de predecir una única acción por paso. Esta predicción por bloques reduce el error de acumulación y mejora la estabilidad del control, y es la razón por la que ACT alcanza tasas de éxito altas en tareas de manipulación entrenadas con datos de teleoperación.

El entrenamiento se ha realizado con LeRobot sobre el dataset Gyseop/record-realreal3, un conjunto de episodios de teleoperación grabados por el autor. La model card no especifica el número de episodios, el número de tokens ni la composición exacta del dataset, ni documenta el uso de RLHF o DPO (técnicas propias de modelos de lenguaje que no aplican a este tipo de política). Tampoco se detalla la configuración exacta de ACT (dimensión del chunk, número de capas, resolución de imagen de entrada), por lo que estos datos deben considerarse no disponibles. El flujo de entrenamiento documentado usa `lerobot-train` con `--policy.type=act` y dispositivo CUDA, y la evaluación se realiza con `lerobot-record` sobre un robot SO-100 follower.

## Capacidades

- Control robótico por imitación: genera comandos de acción para un robot manipulador a partir de observaciones visuales y de estado de las articulaciones.
- Predicción de chunks de acciones: emite secuencias cortas de acciones de forma conjunta, lo que estabiliza la ejecución frente a la predicción paso a paso.
- Aprendizaje a partir de teleoperación: replica comportamientos demostrados por un operador humano en el dataset de entrenamiento.
- Integración con LeRobot: entrenamiento, evaluación e inferencia mediante las herramientas `lerobot-train` y `lerobot-record`.
- Ejecución en robots SO-100 follower: la model card documenta explícitamente este tipo de robot para la evaluación.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling, capacidades de agente ni multilingüismo: es una política de control, no un modelo de propósito general.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo ejecuta tareas de pick-and-place aprendidas de demostraciones humanas, adecuado porque ACT está diseñado para reproducir trayectorias de teleoperación con alta tasa de éxito en entornos controlados.
- Prototipado rápido de políticas con LeRobot: un equipo puede clonar el repositorio, lanzar `lerobot-record` con `--policy.path` apuntando a este checkpoint y evaluar el comportamiento en un SO-100 follower en pocos minutos, gracias al tamaño compacto de 0,2 GB.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un pipeline completo (dataset, entrenamiento ACT, evaluación) para comparar variantes del método o estudiar el efecto del chunking de acciones.
- Automatización de tareas repetitivas en entornos de taller: el modelo puede desplegarse para repetir una secuencia de manipulación concreta aprendida del dataset, reduciendo la necesidad de programación explícita de trayectorias.
- Educación y formación en robótica: al ser un checkpoint pequeño y con licencia permisiva, es apto para cursos y talleres donde los estudiantes entrenan y evalúan políticas propias con hardware asequible tipo SO-100.
- Base para fine-tuning con datos propios: un equipo puede partir de estos pesos y reentrenar con su propio dataset de teleoperación usando `lerobot-train --policy.type=act`, aprovechando el conocimiento inicial del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros y pesos en safetensors de 0,2 GB, la inferencia en FP32 requiere del orden de 0,2 GB para los pesos, más el coste de las imágenes de entrada.
- GPU recomendadas: la model card solo indica `--policy.device=cuda` para el entrenamiento; no especifica modelos de GPU concretos.
- GPU de consumo: por el tamaño del modelo, es previsible que quepa en GPUs de consumo con 4-8 GB de VRAM, aunque este dato no está confirmado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento, `lerobot-record` para inferencia y evaluación); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gyseop/omx_realreal3 | ACT | 51,7 M | no aplica | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | ACT | variable según checkpoint | no aplica | según checkpoint | Hugging Face |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | variable según checkpoint | no aplica | según checkpoint | Hugging Face |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas. La comparación se limita a método, tamaño y licencia.

## Limitaciones y advertencias

- Sesgos: el modelo aprende exclusivamente del dataset Gyseop/record-realreal3; cualquier sesgo de las demostraciones (posiciones, objetos, iluminación, operador) se reproduce en la política.
- Alucinación en sentido literal no aplica, pero sí el riesgo de generalización pobre: fuera de la distribución de entrenamiento, las acciones predichas pueden ser erróneas o inseguras para el robot y su entorno.
- Limitación de dominio: no es un modelo de lenguaje ni tiene capacidades de texto, visión general, código o agentes; su uso fuera del control robótico no tiene sentido.
- Dependencia del hardware: la evaluación documentada usa un SO-100 follower; el comportamiento en otros robots o configuraciones de cámaras no está validado.
- Falta de documentación: la model card no detalla el dataset, la configuración de ACT ni métricas de éxito, lo que dificulta evaluar su calidad antes de desplegarlo.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni la seguridad del modelo en producción.
- Madurez: con 0 descargas y 0 likes y una fecha de creación muy reciente, no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyseop/omx_realreal3
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Gyseop/record-realreal3
