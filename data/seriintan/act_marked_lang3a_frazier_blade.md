# seriintan/act_marked_lang3a_frazier_blade

## Resumen

`seriintan/act_marked_lang3a_frazier_blade` es una política de imitación (policy) para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un modelo de control visuomotor que mapea observaciones (estado del robot y dos cámaras) a acciones de 6 dimensiones para un brazo seguidor `so_follower` de LeRobot. Lo desarrolla el usuario `seriintan` y se distribuye a través del Hub de Hugging Face con la librería LeRobot.

El modelo está especializado en dos tareas quirúrgicas de manipulación: recoger un tubo de succión Frazier y una hoja de bisturí quirúrgico y depositarlos en una cesta azul. Se entrenó sobre el dataset `seriintan/lang3a_frazier_blade_marked`, con 120 episodios y 48.454 fotogramas a 30 FPS. Su relevancia es acotada: es un artefacto de investigación reproducible para experimentos de imitación en robótica de laboratorio, no un modelo de propósito general.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en GPUs de consumo. La licencia Apache 2.0 permite uso comercial, pero el modelo solo es válido para el robot, las cámaras y las tareas exactas con las que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un backbone visual (procesa las imágenes de las cámaras `wrist` y `side` a 480x640) con un transformer que, condicionado por el estado del robot `observation.state` de dimensión 6, genera una secuencia de acciones de dimensión 6. El modelo no emplea RLHF ni DPO; se entrena con aprendizaje supervisado sobre demostraciones teleoperadas.

La configuración de entrenamiento reportada es: 50.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.2. El dataset contiene 120 episodios y 48.454 fotogramas a 30 FPS, con dos tareas anotadas ("Pick up the Frazier Suction Tube and place it in the blue basket." y "Pick up the surgical blade and place it in the blue basket."). No se documentan innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` a partir de dos cámaras (`wrist` y `side`) y del estado articular de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones para las dos tareas de manipulación entrenadas.
- Ejecución de políticas en robot real mediante `lerobot-rollout`.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere RL).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Recogida automatizada de instrumental quirúrgico en un banco de laboratorio: el modelo ejecuta la secuencia de aproximación, agarre y depósito del tubo Frazier o de la hoja de bisturí en la cesta azul, usando las cámaras de muñeca y lateral para localizar el objeto.
- Reproducción de experimentos de imitación en robótica: sirve como referencia reproducible para comparar variantes de ACT o de recogida de datos con el mismo robot y dataset.
- Prototipado de flujos de teleoperación a autónomo: permite validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) antes de escalar a tareas más complejas.
- Docencia y formación en robótica de manipulación: el modelo y su dataset permiten a estudiantes inspeccionar una política ACT entrenada y ejecutarla en hardware `so_follower`.
- Benchmark interno de robustez visuomotora: al estar acotado a dos tareas y un robot, es útil para medir el efecto de cambios de iluminación, posición de objetos o distracciones en la tasa de éxito.
- Base para *fine-tuning* en tareas similares de manipulación de instrumental: al ser Apache 2.0 y compacto, puede reentrenarse con nuevos datasets manteniendo la arquitectura ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y entradas de dos imágenes de 480x640, la huella es reducida y cabe holgadamente en GPUs de consumo (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con soporte CUDA de gama media o superior debería ser suficiente; el autor no especifica modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (51,7 M de parámetros), aunque no hay cifras oficiales de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del hardware, de las cámaras y del bucle de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `seriintan/act_marked_lang3a_frazier_blade` | 51,7 M | no aplica | sin evaluación publicada | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | variable, a menudo sin evaluar | habitualmente Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | no disponible | habitualmente Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo válido para el robot `so_follower`, las cámaras `wrist` y `side` y las dos tareas de instrumental quirúrgico entrenadas.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real reportadas, por lo que el rendimiento en producción es desconocido.
- Sensible al entorno: cambios de iluminación, posición de objetos, fondo o calibración de cámaras pueden degradar el comportamiento, como es habitual en políticas de imitación.
- Dataset pequeño (120 episodios, 48.454 fotogramas): riesgo de sobreajuste a las condiciones de grabación.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse como modelo de texto ni de propósito general.
- Licencia Apache 2.0 permite uso comercial, pero la idoneidad para uso clínico o quirúrgico real no está validada y requeriría evaluación independiente.
- No se documentan sesgos, pero al ser un modelo visuomotor los sesgos se manifiestan como fallos de agarre o de localización en condiciones no vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seriintan/act_marked_lang3a_frazier_blade
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/lang3a_frazier_blade_marked
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seriintan/lang3a_frazier_blade_marked
