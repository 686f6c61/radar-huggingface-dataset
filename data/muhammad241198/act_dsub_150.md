# Muhammad241198/act_dsub_150

## Resumen

`act_dsub_150` es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada y publicada con LeRobot por el usuario Muhammad241198. ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. El modelo se ha entrenado a partir de datos de teleoperación del dataset `rbtrprjkt/DSUB-installnew2026_20261026_033023`.

El checkpoint contiene 51.736.199 parámetros en formato safetensors y ocupa 0,2 GB en el repositorio, lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en GPU de consumo. Está etiquetado con el pipeline `robotics` y la librería `lerobot`, y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada: no es un modelo de lenguaje ni un modelo fundacional multimodal, sino una política específica para un robot y una tarea concretos (aparentemente una instalación o montaje, a juzgar por el nombre del dataset). Resulta útil como referencia para reproducir el flujo de entrenamiento de ACT con LeRobot y para evaluar el comportamiento de la política en el entorno para el que fue entrenada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.736.199 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control robótico; no usa contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone visual (codificador de imágenes de las cámaras del robot) con un transformer que, a partir de las observaciones y del estado de las articulaciones, predice un chunk de acciones futuras en lugar de una única acción. Esta predicción por bloques mitiga el problema de la acumulación de errores típico de las políticas paso a paso y permite un control más suave. El modelo incluye habitualmente una técnica de regularización tipo CVAE sobre el estilo de la trayectoria para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot sobre el dataset `rbtrprjkt/DSUB-installnew2026_20261026_033023`, compuesto por episodios de teleoperación. No se dispone de información sobre el número de episodios, el número de tokens o muestras, la composición exacta del dataset, ni sobre si se aplicaron fases de RLHF o DPO (no aplicables en este contexto). Tampoco se documentan innovaciones adicionales más allá de las propias de ACT.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y del estado del robot.
- Manipulación de objetos en entornos de laboratorio o instalación, condicionada a la tarea del dataset de entrenamiento.
- Ejecución de políticas entrenadas con LeRobot mediante `lerobot-record` y el robot `so100_follower` (según la documentación de la model card).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni modo "thinking".
- Su "visión" se limita a la codificación de las imágenes de las cámaras del robot para producir acciones.

## Casos de uso

- Reproducción de experimentos de imitación con ACT: sirve como checkpoint de referencia para comparar curvas de entrenamiento y tasas de éxito en la tarea DSUB con la configuración estándar de LeRobot.
- Automatización de una tarea de instalación o montaje: la política puede ejecutar la secuencia aprendida de colocación o ensamblaje sobre el robot `so100_follower` en el entorno para el que se recogieron las demostraciones.
- Evaluación de políticas en bucle cerrado: usar `lerobot-record` con `--policy.path` apuntando a este checkpoint para medir la tasa de éxito en 10 episodios de evaluación.
- Base para fine-tuning: al ser un checkpoint ACT de 51,7 M de parámetros y 0,2 GB, puede reentrenarse o ajustarse con nuevos datos de teleoperación en una GPU de consumo.
- Docencia y prototipado en robótica: ejemplo completo del pipeline LeRobot (dataset, entrenamiento, evaluación) con licencia permisiva para uso académico y comercial.
- Integración en un pipeline de investigación de manipulación: comparar ACT frente a otras políticas de LeRobot (Diffusion Policy, VQ-BeT) sobre el mismo dataset para estudiar el efecto del chunking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,7 M de parámetros (≈0,2 GB de pesos); el consumo real depende del backbone visual y del tamaño de las imágenes de entrada, pero cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: RTX 3060, RTX 4090, A100 o H100 para entrenamiento; para inferencia basta una GPU de gama media o incluso CPU en la mayoría de configuraciones.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para evaluación puntual.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de dispositivos `cuda` o `cpu` según la documentación del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_dsub_150` (este) | 51,7 M | no aplica | Imitación robótica (ACT) | Apache 2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | no disponible | no aplica | Imitación robótica (difusión) | Apache 2.0 (implementación LeRobot) | Hugging Face / GitHub |
| VQ-BeT (LeRobot) | no disponible | no disponible | Imitación robótica (discretización de acciones) | Apache 2.0 (implementación LeRobot) | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Política específica de tarea y robot: solo es válida para el entorno y la morfología con los que se recogió el dataset `DSUB-installnew2026_20261026_033023`; fuera de ese dominio su comportamiento es impredecible.
- Sin datos de evaluación publicados: no hay tasas de éxito, curvas de aprendizaje ni métricas que permitan juzgar su calidad real.
- Riesgo de sobreajuste a las demostraciones: al entrenarse con teleoperación, puede fallar ante cambios de iluminación, posiciones de objetos o variaciones no vistas.
- Sin capacidades lingüísticas ni de razonamiento general: no debe emplearse como modelo de texto, código o visión general.
- Sesgos y alucinaciones: no aplican en el sentido habitual de los LLM, pero sí existe el riesgo de acciones erráticas o no seguras si se ejecuta fuera de las condiciones de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia y calidad del dataset de entrenamiento antes de un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muhammad241198/act_dsub_150
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas con LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/rbtrprjkt/DSUB-installnew2026_20261026_033023
