# Rlayd36/diffusion_redblock

## Resumen

`Rlayd36/diffusion_redblock` es una política de control visuomotor entrenada con Diffusion Policy y publicada en Hugging Face Hub mediante el framework LeRobot. No es un modelo de lenguaje: es un modelo de robótica que mapea observaciones (estado articular de 6 dimensiones y dos cámaras RGB de 480x640) a acciones de 6 dimensiones para un robot seguidor de tipo `so_follower`. El objetivo concreto es la tarea "Red block pickup and place", es decir, recoger y colocar un bloque rojo.

El modelo aplica la formulación de Diffusion Policy (Chi et al., 2023), que trata el control visuomotor como un proceso generativo de difusión: en lugar de predecir una única acción, genera trayectorias de acción multimodales y suaves, lo que resulta especialmente útil en manipulación con contacto rico. Cuenta con 89.244.598 parámetros y un repositorio de 0,4 GB en formato safetensors.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de imitación (grabación de datos, entrenamiento y despliegue) sobre hardware de bajo coste tipo SO-100/SO-101, y como punto de partida para quien quiera entrenar sus propias políticas con LeRobot 0.6.0. No hay resultados de evaluación publicados ni métricas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor) |
| Parametros totales | 89.244.598 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `overhead`, `wrist` |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.overhead` | VISUAL, shape `(3, 480, 640)` |
| Entrada `observation.images.wrist` | VISUAL, shape `(3, 480, 640)` |
| Salida `action` | ACTION, shape `(6,)` |
| Libreria | lerobot 0.6.0 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La política sigue Diffusion Policy, un enfoque que modela la distribución condicional de acciones `p(a | o)` mediante un proceso de difusión denoising. En la práctica, la red recibe el estado del robot y las imágenes de las dos cámaras y genera, mediante pasos iterativos de eliminación de ruido, una secuencia de acciones de 6 dimensiones. Frente a políticas deterministas tipo regresión directa, este esquema captura multimodalidad en los datos de demostración y produce trayectorias más suaves, lo que ayuda en tareas de manipulación con contacto. El repositorio no detalla la configuración interna de la red (número de capas, dimensión del ruido, horizonte de predicción, número de pasos de difusión), por lo que esos datos no están disponibles.

El entrenamiento se realizó sobre el dataset `Rlayd36/pick-cube_20261116_142939`, compuesto por 50 episodios y 29.176 fotogramas a 30 FPS, correspondientes a la tarea "Red block pickup and place". La configuración registrada es de 100.000 pasos, batch size 8, optimizador Adam, learning rate 0,0001 y semilla 1000, ejecutado con LeRobot 0.6.0. No se documenta el uso de RLHF, DPO ni de aumentos de datos adicionales, ni el número de tokens o muestras efectivas más allá de los fotogramas citados.

## Capacidades

- Control visuomotor de manipulación: genera acciones de 6 grados de libertad a partir de estado articular y dos vistas RGB.
- Ejecución de una tarea de pick-and-place específica: recogida y colocación de un bloque rojo.
- Generación de trayectorias multimodales y suaves mediante difusión, adecuada para contacto rico.
- Fusión de dos cámaras (vista cenital y vista de muñeca) con el estado del robot.
- Integración nativa con el ecosistema LeRobot: comandos `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Modo thinking, visión general, audio: no aplica; la visión se limita a las dos cámaras de entrada.

## Casos de uso

- Recogida y colocación de bloques en laboratorio: el modelo ejecuta directamente la tarea "Red block pickup and place" sobre un robot `so_follower` con dos cámaras, útil para validar el pipeline completo de LeRobot en un banco de pruebas.
- Base para reentrenamiento con datos propios: sirve como plantilla de configuración de Diffusion Policy; con `lerobot-train` y un dataset propio se puede adaptar a otras tareas de manipulación manteniendo el mismo esquema de observaciones.
- Docencia y formación en imitación robótica: al ser un ejemplo reproducible con 50 episodios y configuración de entrenamiento documentada, permite explicar el ciclo grabación-entrenamiento-despliegue con hardware asequible.
- Pruebas de integración de hardware SO-100/SO-101: permite verificar calibración de brazos, índices de cámara y tasas de 30 FPS antes de invertir en datasets mayores.
- Benchmark interno de políticas de difusión: sirve como referencia de línea base para comparar variantes de Diffusion Policy o de otras políticas de imitación sobre la misma tarea.
- Prototipado de automatización de pick-and-place en entornos controlados: con iluminación y posiciones de objeto similares a las del dataset, puede emplearse para demostrar flujos de manipulación repetitiva antes de escalar a producción.
- Generación de datos sintéticos de evaluación: las trayectorias generadas pueden usarse para estudiar la variabilidad y suavidad de las acciones producidas por difusión frente a políticas deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de trials/successes vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; con 89,2 M de parámetros y pesos en safetensors, la huella en FP32 ronda los 0,36 GB, por lo que en la práctica cabe en GPUs de consumo con holgura (cifra estimada a partir del número de parámetros, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor. Para entrenamiento, la configuración usa `--policy.device=cuda`; para inferencia en tiempo real a 30 FPS se recomienda una GPU dedicada, aunque no hay datos de latencia publicados.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; no hay validación publicada en modelos concretos (RTX 3060, 4090, etc.).
- Opciones de despliegue: LeRobot con `lerobot-rollout` (estrategia `base`); el repositorio no documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La inferencia debe sostener el bucle de control a 30 FPS (frecuencia del dataset), pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rlayd36/diffusion_redblock | Diffusion Policy (LeRobot) | 89,2 M | Estado (6,) + 2 camaras 480x640 | apache-2.0 | Hugging Face Hub |
| Otras politicas Diffusion Policy en LeRobot Hub | Diffusion Policy | no disponible | Variable segun tarea | variable | Hugging Face Hub |
| Politicas ACT en LeRobot Hub | Action Chunking Transformer | no disponible | Variable segun tarea | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos en robot real, por lo que no puede afirmarse su fiabilidad.
- Especialización estrecha: entrenada solo para "Red block pickup and place" con 50 episodios; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del entorno: cambios de iluminación, posiciones de objeto, distractores o un robot distinto del mismo tipo pueden degradar el comportamiento; la model card advierte de que estos factores afectan a la dificultad.
- Dependencia de hardware y calibración: requiere un robot `so_follower` y cámaras con nombres e índices que coincidan con las claves de observación (`overhead`, `wrist`); una mala calibración invalida las acciones.
- Sesgos: no documentados; al derivarse de un dataset pequeño y de un único operador, puede heredar sesgos de las demostraciones (posiciones, velocidades y estilo de manipulación).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de generar trayectorias plausibles no válidas físicamente ante observaciones fuera de distribución.
- Licencia apache-2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Caveat de producción: con 0 descargas y 0 likes, es un modelo reciente y sin validación comunitaria; no debe desplegarse en entornos críticos sin evaluación propia.
- Idiomas: no aplica; no procesa texto libre más allá de la etiqueta de tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rlayd36/diffusion_redblock
- Dataset de entrenamiento: https://huggingface.co/datasets/Rlayd36/pick-cube_20261116_142939
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rlayd36/pick-cube_20261116_142939
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
