# neverlish/omx_act_record-watermelon-20261108-1

## Resumen

`neverlish/omx_act_record-watermelon-20261108-1` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación presentado en el paper arXiv:2304.13705. El modelo lo publica el usuario `neverlish` en Hugging Face y se ha generado con LeRobot, la librería de Hugging Face para entrenamiento y despliegue de políticas robóticas. Su propósito es controlar un robot seguidor (aparentemente un `so100_follower` según los comandos de la model card) a partir de observaciones visuales y del estado de las articulaciones, prediciendo secuencias cortas de acciones en lugar de pasos individuales.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 M) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real en hardware modesto. Está entrenado sobre el dataset `neverlish/record-watermelon-20261108-1`, un conjunto de demostraciones teleoperadas grabadas a 30 fps con una cámara de 640×480. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Es relevante ahora porque ejemplifica el flujo completo de LeRobot para clonación de comportamiento en robots de bajo coste (tipo SO-100/SO-101), un ecosistema que está democratizando la robótica de manipulación. No obstante, se trata de un modelo muy específico de una sola tarea (manipulación de sandía, a juzgar por el nombre del dataset) y con cero descargas y cero likes en el momento de la ficha, por lo que debe considerarse un artefacto experimental más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control robótico; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un mecanismo de *action chunking*: en lugar de predecir una única acción por paso de tiempo, el modelo predice un bloque de acciones futuras (típicamente decenas de pasos), lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura incluye un codificador de imágenes (percepción visual), un codificador del estado de las articulaciones y un decodificador transformer que genera las secuencias de acción. El paper original reporta altas tasas de éxito en tareas de manipulación fina aprendidas a partir de datos teleoperados.

El entrenamiento se realizó con LeRobot sobre el dataset `neverlish/record-watermelon-20261108-1`, compuesto por episodios de teleoperación grabados a 30 fps con una cámara de 640×480. No se dispone de información sobre el número de episodios, el número total de tokens o muestras, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en aprendizaje por imitación robótico). La model card no detalla hiperparámetros de entrenamiento, aumentos de datos ni proceso de validación.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (action chunks) para un robot seguidor a partir de observaciones visuales y del estado de las articulaciones.
- Percepción visual: procesa imágenes de una cámara a 640×480 y 30 fps para condicionar la política.
- Manipulación de objetos: entrenado específicamente para la tarea de manipulación de sandía (watermelon) del dataset de demostración.
- Inferencia en tiempo real: el tamaño reducido (51,7 M de parámetros) permite ejecución en bucles de control a frecuencia de cámara.
- Integración con LeRobot: compatible con `lerobot-train`, `lerobot-record` y el resto del ecosistema de entrenamiento y evaluación.
- No soporta tool calling, agentes multi-paso, razonamiento textual ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Clonación de comportamiento en robots de bajo coste: utilizar la política como punto de partida para reproducir la tarea de manipulación de sandía en un robot SO-100/SO-101 con una sola cámara, aprovechando que el modelo ya está entrenado sobre demostraciones teleoperadas.
- Reentrenamiento con nuevos datos: servir como inicialización o referencia para afinar una política ACT sobre un dataset propio con `lerobot-train --policy.type=act`, dado su reducido tamaño y su licencia permisiva.
- Evaluación de pipelines de LeRobot: usar el modelo como caso de prueba en flujos de `lerobot-record` con `--policy.path` para validar la integración de hardware, cámaras y controladores antes de entrenar políticas propias.
- Prototipado de investigación en aprendizaje por imitación: comparar el rendimiento de ACT frente a otros métodos (Diffusion Policy, VQ-BeT) en una tarea concreta de manipulación con un presupuesto de cómputo mínimo.
- Demostraciones educativas: ilustrar el ciclo completo teleoperación → dataset → entrenamiento → despliegue en cursos o talleres de robótica, gracias a la documentación de LeRobot y al tamaño manejable del checkpoint.
- Despliegue en hardware de borde: ejecutar la política en una GPU de consumo o incluso en CPU para tareas de control de baja frecuencia, ya que los 51,7 M de parámetros caben holgadamente en cualquier dispositivo moderno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros en fp32 ≈ 207 MB de pesos, más activaciones y buffers de imagen); en la práctica, menos de 2 GB incluyendo el codificador visual y el preprocesamiento.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También es viable en CPU para control de baja frecuencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), exportación a ONNX no documentada, integración directa con el stack de control del robot (SO-100 follower).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerá del hardware y de la frecuencia de control del robot (típicamente 30 Hz para coincidir con la cámara).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neverlish/omx_act_record-watermelon-20261108-1 | 51,7 M | no aplica | ACT (action chunking) | Apache 2.0 | Hugging Face (LeRobot) |
| neverlish/omx_act_record-test-20261102-1 | 51,7 M | no aplica | ACT (action chunking) | no disponible | Hugging Face (LeRobot) |
| Diffusion Policy (referencia del paper) | no disponible | no aplica | Difusión para políticas | no disponible | Repositorios de investigación |
| VQ-BeT (referencia) | no disponible | no aplica | Vector-quantized behavior transformer | no disponible | Repositorios de investigación |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los modelos de referencia se incluyen por categoría (políticas de imitación para manipulación robótica) pero sin datos de rendimiento comparables.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (manipulación de sandía) y un robot concreto; no generaliza a otras tareas ni morfologías sin reentrenamiento.
- Sin datos de evaluación: no hay tasas de éxito publicadas, por lo que se desconoce su fiabilidad real en producción.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, los sesgos típicos no aplican, pero puede heredar sesgos de las demostraciones teleoperadas (posiciones, iluminación, objetos concretos).
- Riesgo de sobreajuste al entorno de grabación: cambios en iluminación, fondo o posición de la cámara pueden degradar el rendimiento.
- Sin soporte multilingüe ni de texto: no es adecuado para tareas de NLP, tool calling ni agentes conversacionales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Artefacto experimental: cero descargas y cero likes en el momento de la ficha, lo que sugiere que no ha sido validado por la comunidad.
- Dependencia de LeRobot: el despliegue requiere el stack de LeRobot y la configuración correcta del robot (`so100_follower`), lo que añade complejidad operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neverlish/omx_act_record-watermelon-20261108-1
- Dataset de entrenamiento: https://huggingface.co/datasets/neverlish/record-watermelon-20261108-1
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo relacionado del mismo autor: https://huggingface.co/neverlish/omx_act_record-test-20261102-1
- Dataset relacionado del mismo autor: https://huggingface.co/datasets/neverlish/record-test-20261102-1
