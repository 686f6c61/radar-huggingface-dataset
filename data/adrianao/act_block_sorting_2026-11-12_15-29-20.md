# AdrianAo/act_block_sorting_2026-11-12_15-29-20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación robótica. Este repositorio concreto, publicado por el usuario AdrianAo, contiene una política ACT entrenada con LeRobot sobre un robot de tipo `so_follower` para una tarea específica de clasificación de bloques por color en una caja negra.

El modelo no es un modelo de lenguaje: es una política visuomotora que consume el estado articular del robot (vector de 6 dimensiones) y dos flujos de imagen (cámara superior y cámara de muñeca, 480x640 píxeles cada una), y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y pesos en formato safetensors, es un modelo compacto que puede ejecutarse en hardware de consumo.

Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación (grabación de datos con teleoperación, entrenamiento con LeRobot y despliegue con `lerobot-rollout`), y como punto de partida para quienes quieran entrenar políticas ACT para tareas de pick-and-place con robots SO-100/SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; no usa ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar publicados) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `top`, `wrist` (3x480x640 cada una) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Frecuencia de datos | 30 FPS |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repo | 6.2 GB |

## Arquitectura y entrenamiento

ACT combina un codificador visual (procesa las dos cámaras a 480x640) con un transformer que genera *chunks* de acciones, es decir, secuencias cortas de comandos articulares en lugar de un único paso. Esta predicción por fragmentos mitiga el problema de acumulación de error típico de las políticas paso a paso y suele elevar la tasa de éxito en tareas de manipulación. El modelo tiene 51.668.614 parámetros entrenables y produce acciones de 6 dimensiones a partir de un estado de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `AdrianAo/block_sorting`, compuesto por 75 episodios y 115.024 fotogramas grabados a 30 FPS mediante teleoperación. La tarea es «Pick up 3 yellow blocks, 1 red block and 6 blue blocks and place them into the black box». La configuración fue: 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni aumento de datos; se trata de aprendizaje por imitación supervisado puro sobre demostraciones.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de dos cámaras (superior y de muñeca).
- Predicción de chunks de acciones de 6 dimensiones (posición articular) para ejecución a 30 FPS.
- Ejecución de una tarea concreta de pick-and-place: recoger 3 bloques amarillos, 1 rojo y 6 azules y depositarlos en una caja negra.
- Aprendizaje por imitación a partir de datos de teleoperación (75 episodios).
- Despliegue mediante CLI de LeRobot (`lerobot-rollout`) con estrategia `base`.
- Reentrenamiento reproducible con `lerobot-train` usando `--policy.type=act`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- **Automatización de clasificación de bloques en laboratorio:** ejecutar la política sobre un SO-100/SO-101 para ordenar bloques por color en una caja, usando las cámaras `top` y `wrist` a 480x640 y 30 FPS; adecuado porque el modelo fue entrenado exactamente para esa tarea y ese tipo de robot.
- **Punto de partida para entrenar políticas propias:** clonar el flujo con `lerobot-train --policy.type=act` y sustituir el dataset por uno propio; útil por la configuración documentada (10.000 pasos, batch 8, lr 1e-05) que sirve como referencia reproducible.
- **Validación de pipelines de aprendizaje por imitación:** usar el modelo como caso de prueba para verificar la instalación de LeRobot 0.6.2, la calibración del robot y la configuración de cámaras antes de grabar datos nuevos.
- **Docencia y demostraciones de robótica:** mostrar el ciclo completo teleoperación → dataset → entrenamiento → despliegue en un taller o asignatura, dado que el modelo es pequeño (51,7 M de parámetros) y la licencia Apache 2.0 permite su uso libre.
- **Investigación en *action chunking*:** emplear esta política como línea base para comparar variantes de ACT (distintos tamaños de chunk, aumentos de datos, arquitecturas visuales) sobre una tarea de referencia con dataset público.
- **Pruebas de robustez ante cambios de entorno:** evaluar cómo se degrada la política al variar iluminación, posiciones de bloques o distracciones; el propio autor deja constancia de que no ha publicado resultados de evaluación, por lo que este caso es directamente un hueco a cubrir.
- **Integración en sistemas de control con ROS 2 u otros frameworks:** exportar la política y llamarla desde un nodo de control que publique acciones articulares a 30 FPS, usando el modelo como componente de percepción-acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet». No hay tasas de éxito, número de ensayos ni comparaciones con otras políticas en el repositorio.

## Requisitos de hardware

- **VRAM estimada para inferencia:** el modelo tiene 51,7 M de parámetros; en fp32 ocupa aproximadamente 207 MB de pesos, y en fp16 unos 103 MB. Sumando los dos flujos de imagen a 480x640 y las activaciones del transformer, la inferencia cabe holgadamente en GPUs de 4-8 GB.
- **GPU recomendadas:** cualquier GPU NVIDIA con CUDA y al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100). Para entrenamiento, una RTX 3060/4060 de 8-12 GB es suficiente con batch 8.
- **¿Cabe en GPU de consumo?** Sí, en prácticamente cualquier GPU de consumo moderna; también es viable en CPU para inferencia a baja frecuencia, aunque no se documentan latencias.
- **Opciones de despliegue:** LeRobot (`lerobot-rollout` con `--strategy.type=base`), y el stack de entrenamiento `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- **Latencia y throughput:** no disponibles. La política está pensada para ejecutarse a 30 FPS (frecuencia de los datos de entrenamiento), pero no se publican mediciones de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AdrianAo/act_block_sorting_2026-11-12_15-29-20 | ACT (LeRobot) | 51.668.614 | estado (6,) + 2 cámaras 480x640 | acción (6,) | apache-2.0 | Hugging Face, 31 descargas |
| Políticas ACT genéricas de LeRobot | ACT (LeRobot) | variable según configuración | estado + cámaras | acción | apache-2.0 (código) | Repositorio LeRobot |
| Políticas Diffusion Policy | Diffusion Policy | no disponible | estado + cámaras | acción | variable | Implementaciones en LeRobot |
| Políticas VLA (p. ej. OpenVLA) | Vision-Language-Action | miles de millones | imagen + instrucción textual | acción | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, entradas/salidas y licencia.

## Limitaciones y advertencias

- **Sin evaluación publicada:** no hay tasas de éxito ni número de ensayos; no se puede afirmar que la política funcione de forma fiable en producción.
- **Tarea única y muy específica:** entrenada solo para «recoger 3 bloques amarillos, 1 rojo y 6 azules y meterlos en una caja negra». No generaliza a otras tareas sin reentrenamiento.
- **Dependencia del hardware exacto:** entrenada para un robot `so_follower` con cámaras `top` y `wrist` a 480x640 y 30 FPS; cambios de cámara, montaje o robot pueden degradar el rendimiento.
- **Dataset pequeño:** 75 episodios y 115.024 fotogramas; propenso a sobreajuste a posiciones, iluminación y disposición de bloques presentes en las demostraciones.
- **Riesgo de alucinación equivalente:** en robótica se traduce en acciones erráticas o colisiones cuando la escena difiere de la distribución de entrenamiento; no hay mecanismo de seguridad incorporado.
- **Sesgos:** no documentados; al ser aprendizaje por imitación, hereda los sesgos de las demostraciones (posiciones, velocidades, estrategias del teleoperador).
- **Licencia:** Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de LeRobot y de las dependencias.
- **Idioma:** no aplica; el modelo no procesa texto libre, solo la cadena de tarea fija indicada en el comando de despliegue.
- **Mantenimiento:** repositorio con 0 likes y 31 descargas; sin garantías de soporte ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdrianAo/act_block_sorting_2026-11-12_15-29-20
- Dataset de entrenamiento: https://huggingface.co/datasets/AdrianAo/block_sorting
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdrianAo/block_sorting
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
