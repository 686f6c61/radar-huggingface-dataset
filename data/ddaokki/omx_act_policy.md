# ddaokki/omx_act_policy

## Resumen

`ddaokki/omx_act_policy` es una política de control robótico entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers), publicado por Zhao et al. en 2023 (arXiv:2304.13705). No es un modelo de lenguaje: es una policy que, a partir de observaciones visuales y del estado del robot, predice fragmentos (chunks) de acciones motoras en lugar de pasos individuales, lo que reduce el error de composición y mejora las tasas de éxito en tareas de manipulación. El autor es el usuario de HuggingFace `ddaokki`, y el artefacto se ha generado y subido con la librería LeRobot de HuggingFace.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) almacenados en formato safetensors, con un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la gama ligera y apto para inferencia en GPU de consumo. Se ha entrenado sobre el dataset propio `ddaokki/pick_doll_cup_v4`, lo que sugiere una tarea concreta de recogida de objetos (un vaso o taza), aunque la model card no detalla la composición del dataset ni el número de episodios.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación/experimentación con 0 descargas y 0 likes en el momento de la consulta, sin resultados de rendimiento publicados. Su interés radica en servir como ejemplo reproducible del flujo de entrenamiento y despliegue de ACT con LeRobot sobre un brazo tipo SO-100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con CVAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa horizonte de observación y chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un autoencoder variacional condicional (CVAE). El modelo toma como entrada observaciones (típicamente imágenes de una o varias cámaras más el estado de las articulaciones) y predice un chunk de `k` acciones futuras de forma simultánea, en lugar de una sola acción por paso. Esta predicción por chunks mitiga el problema de la varianza temporal y la acumulación de errores típica de las políticas que actúan paso a paso, y es habitual que consiga tasas de éxito altas con pocas demostraciones teleoperadas.

Según la información disponible, esta policy se ha entrenado y publicado con LeRobot, la librería de HuggingFace para aprendizaje por imitación en robótica. No se especifican en la model card el número de tokens ni de episodios de entrenamiento, la composición exacta del dataset `ddaokki/pick_doll_cup_v4`, la resolución de las cámaras ni el número de pasos de optimización. Tampoco se documenta si se empleó regularización adicional, aumento de datos o un esquema de decodificación especulativa; ACT no usa decodificación especulativa por diseño.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones motoras (chunks) a partir de observaciones visuales y del estado del robot.
- Manipulación de objetos: el dataset asociado (`pick_doll_cup_v4`) apunta a tareas de agarre y colocación de un objeto (un vaso o taza).
- Aprendizaje a partir de demostraciones teleoperadas: reproduce comportamientos aprendidos de trayectorias humanas.
- Integración nativa con LeRobot: entrenamiento, guardado de checkpoints y evaluación mediante `lerobot-train` y `lerobot-record`.
- Despliegue sobre robots compatibles con LeRobot (por ejemplo, SO-100 / `so100_follower`, según los comandos de ejemplo de la model card).
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Recogida automática de objetos en entorno controlado: el modelo puede ejecutar la tarea de coger un vaso o taza sobre la que fue entrenado, usando los checkpoints cargados mediante `--policy.path` en LeRobot.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar ACT frente a otros métodos (por ejemplo, Diffusion Policy) sobre un mismo dataset.
- Reentrenamiento con dataset propio: dado que ACT se entrena desde cero con `lerobot-train`, este checkpoint puede servir de referencia de configuración para experimentar con nuevas tareas.
- Automatización de laboratorio o demostraciones educativas: al ser un modelo pequeño (51,7 M de parámetros), puede desplegarse en un banco de trabajo con una GPU de consumo para mostrar el ciclo completo de teleoperación, entrenamiento y ejecución.
- Evaluación de pipelines robóticos de bajo coste: útil para validar la integración entre LeRobot y un brazo de bajo coste tipo SO-100 antes de escalar a otras tareas.
- Base para experimentos de chunking de acciones: permite estudiar empíricamente el efecto del tamaño de chunk y de la ventana de observación sobre la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni métricas de comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 51,7 millones de parámetros, los pesos ocupan aproximadamente 0,2 GB en fp32 (menos en fp16/bf16), más el coste de las activaciones de imagen.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM; se ha diseñado para ejecutarse en `--policy.device=cuda`. No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070, RTX 4090, etc.
- Opciones de despliegue: la ruta documentada es LeRobot (`lerobot-train` para entrenar, `lerobot-record` para ejecutar y evaluar). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ddaokki/omx_act_policy | 51,7 M | ACT (imitation learning) | no disponible | apache-2.0 | HuggingFace (0 descargas) |
| ACT original (Zhao et al., 2023) | no disponible | ACT (imitation learning) | chunk de acciones | no disponible | paper arXiv:2304.13705 |
| Diffusion Policy | no disponible | Diffusion policy (imitation learning) | chunk de acciones | no disponible | referencia de la literatura |
| Otras policies LeRobot | no disponible | ACT u otras | no disponible | variable | HuggingFace Hub |

No se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la policy está entrenada sobre un único dataset (`ddaokki/pick_doll_cup_v4`) y probablemente solo funciona bien en la tarea y el entorno concretos para los que se recogieron las demostraciones.
- Falta de información sobre el dataset: se desconocen el número de episodios, la composición, el robot exacto, la resolución de cámara y las condiciones de iluminación, lo que dificulta juzgar su generalización.
- Sin métricas publicadas: no hay tasas de éxito ni comparaciones, por lo que no puede validarse su rendimiento a partir de la información disponible.
- Riesgo de sobreajuste al entorno de entrenamiento: los métodos de imitación como ACT tienden a degradarse ante cambios de iluminación, posición de cámara o disposición de los objetos.
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no admite tool calling ni instrucciones en lenguaje natural.
- Licencia apache-2.0: permite uso comercial y modificación, pero conviene verificar las condiciones del dataset asociado, cuya licencia no se detalla en la información proporcionada.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de terceros.
- Caveat de producción: antes de usarlo en un sistema real deben realizarse evaluaciones propias (`lerobot-record`) y aplicar salvaguardas de seguridad en el robot, ya que el modelo carece de garantías de robustez.

## Enlaces

- HuggingFace: https://huggingface.co/ddaokki/omx_act_policy
- Dataset asociado: https://huggingface.co/datasets/ddaokki/pick_doll_cup_v4
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de policies: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
