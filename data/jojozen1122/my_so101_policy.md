# JoJoZen1122/my_so101_policy

## Resumen

`JoJoZen1122/my_so101_policy` es una política de robótica entrenada con LeRobot mediante el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv:2304.13705. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que consume el estado del robot y dos flujos de vídeo de 480x640 píxeles, y produce comandos de acción de 6 grados de libertad. El modelo está asociado al robot `so_follower` (familia SO-101) y fue entrenado con 207 episodios teleoperados para una única tarea: "Grab the cube".

El repositorio es un ejemplo típico de política entrenada por un usuario particular y publicada en el Hub: cuenta con 7 descargas y 0 likes en el momento de redactar esta ficha, y el propio autor no ha incluido resultados de evaluación en robot real. El interés es, por tanto, más formativo o de reproducción que de producción: sirve para ilustrar el flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) sobre hardware SO-101.

Técnicamente, el checkpoint contiene 51.668.614 parámetros en formato safetensors y ocupa aproximadamente 0,2 GB en el repositorio. La licencia es Apache 2.0, lo que permite uso comercial, pero la ausencia de métricas de éxito y la dependencia de la configuración exacta de cámaras y calibración limitan seriamente su reutilización directa fuera del montaje original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT); política de aprendizaje por imitación con codificadores visuales para dos cámaras |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (política de control; el horizonte de chunk de acciones no se especifica en la información disponible) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica; la tarea está descrita en inglés: "Grab the cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `top`, `side` |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.top` | VISUAL, shape `(3, 480, 640)` |
| Entrada `observation.images.side` | VISUAL, shape `(3, 480, 640)` |
| Salida `action` | ACTION, shape `(6,)` |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones ("action chunks") en lugar de un único paso de control. La formulación habitual combina un codificador transformer sobre las observaciones con un decodificador transformer que genera la secuencia de acciones, apoyándose en extractores de características visuales tipo ResNet para cada cámara. El objetivo de entrenamiento es de tipo comportamental cloning, con una pérdida de reconstrucción sobre las acciones demostradas, más el término de regularización de la distribución latente estilo CVAE que emplea la implementación de referencia. La información disponible no detalla la configuración exacta de capas, dimensiones ocultas ni tamaño del chunk de acciones.

Los datos de entrenamiento provienen del dataset `JoJoZen1122/record-s101-side-top_20260922_142509`: 207 episodios, 94.531 fotogramas capturados a 30 FPS, con dos cámaras (superior y lateral) y una única tarea, "Grab the cube". La configuración de entrenamiento declarada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre LeRobot 0.6.2. No se menciona ningún tipo de ajuste por refuerzo (RLHF/DPO), ni decodificación especulativa, ni mecanismos de atención lineal: se trata de entrenamiento supervisado puro sobre demostraciones teleoperadas.

## Capacidades

- Control robótico de imitación: genera comandos de acción de 6 dimensiones para un robot SO-101 (`so_follower`) a partir del estado articular y de dos vistas de cámara.
- Percepción visual multi-cámara: procesa simultáneamente las vistas `top` y `side` a 480x640 píxeles y 30 FPS.
- Predicción por chunks: produce bloques cortos de acciones, lo que reduce la acumulación de error típica de las políticas que predicen un solo paso.
- Ejecución de una tarea concreta: "Grab the cube" (agarrar el cubo). No hay evidencia de generalización a otras tareas.
- Despliegue en robot real mediante `lerobot-rollout` con estrategia `base`, incluyendo ejecución por duración limitada o indefinida.
- Reentrenamiento: admite ser usado como referencia para reentrenar con `lerobot-train --policy.type=act` sobre otros datasets.
- No soporta: tool calling, function calling, agentes, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües. No hay modo "thinking" ni ninguna capacidad de tipo LLM o VLM.

## Casos de uso

- Reproducción de un pipeline de imitación de principio a fin: sirve como ejemplo didáctico para grabar un dataset con LeRobot, entrenar una política ACT de ~52 M de parámetros y desplegarla con `lerobot-rollout`, usando exactamente la configuración documentada.
- Manipulación de pick-and-place en laboratorio: el modelo puede ejecutar la tarea "Grab the cube" sobre un SO-101 con dos cámaras, siempre que la escena, la iluminación y la posición del objeto se mantengan dentro de la distribución del dataset original.
- Banco de pruebas de hardware y calibración: útil para verificar la comunicación con el puerto del robot y con las cámaras OpenCV, así como para validar la calibración de un SO-101 antes de entrenar políticas más ambiciosas.
- Punto de partida para fine-tuning: se puede reentrenar sobre un dataset propio con la misma estructura de observaciones (estado de 6 dimensiones más dos imágenes) para adaptar la política a una tarea nueva.
- Docencia e investigación en robótica: adecuado para prácticas de aprendizaje por imitación, comparación con variantes como Diffusion Policy o VQ-BeT, y estudio del efecto del número de episodios o de la resolución de cámara en la tasa de éxito.
- Evaluación de infraestructura de inferencia en el borde: al ser un modelo pequeño, permite medir latencia de control en una GPU de gama media o incluso en una Jetson, con el objetivo de confirmar que se sostienen los 30 FPS de entrada.
- Recolección de datos asistida: no aplica directamente, pero el modelo puede emplearse como política inicial para que un operador corrija sus trayectorias y genere nuevos episodios de entrenamiento (DAgger de forma manual).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet._" y deja la tabla de evaluación en robot real sin rellenar. No hay datos de tasa de éxito, número de ensayos, MMLU, HumanEval ni GSM8K, ya que estos benchmarks no son aplicables a una política de control robótico.

| Benchmark | Resultado |
|---|---|
| Tasa de éxito en robot real ("Grab the cube") | no disponible |
| Numero de ensayos / episodios evaluados | no disponible |
| Otros benchmarks (MMLU, HumanEval, GSM8K, etc.) | no aplica |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa derivada del tamaño del checkpoint (51,67 M de parámetros), los pesos en fp32 ocupan unos 207 MB y en fp16 unos 103 MB; el consumo real añade activaciones de los codificadores visuales de las dos cámaras a 480x640, por lo que hay que reservar memoria adicional no cuantificada aquí.
- GPU recomendadas: no disponible. Cualquier GPU CUDA con al menos unos pocos GB de VRAM libre debería ser suficiente para un modelo de este tamaño, pero no hay cifras oficiales.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado que el checkpoint es de 0,2 GB; no se especifica una GPU concreta ni se garantiza compatibilidad.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada, con `--policy.path=JoJoZen1122/my_so101_policy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son herramientas orientadas a políticas robóticas.
- Latencia y throughput: no disponible. La frecuencia de captura del dataset es de 30 FPS, lo que sugiere que el sistema de control espera operar en ese orden, pero no se publica ninguna medición de latencia de inferencia.
- Periféricos necesarios: robot `so_follower` en un puerto serie concreto y dos cámaras OpenCV a 640x480 y 30 FPS, con nombres que deben coincidir con las claves de observación `top` y `side`.

## Comparativa con modelos similares

No hay datos públicos suficientes en la información proporcionada para hacer una comparación cuantitativa fiable de este checkpoint concreto. La comparación se plantea, por tanto, a nivel de método y de ecosistema:

| Modelo / metodo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT (este checkpoint, `JoJoZen1122/my_so101_policy`) | 51.668.614 | Imitacion con action chunking (transformer) | apache-2.0 | HuggingFace, 7 descargas |
| ACT (implementacion de referencia en LeRobot) | no disponible | Imitacion con action chunking (transformer) | Apache 2.0 (LeRobot) | Repositorio y documentacion de LeRobot |
| Diffusion Policy (Chi et al., 2023) | no disponible | Imitacion generativa basada en difusion | no disponible | Implementaciones publicas; no integrado como `policy.type` de referencia con los mismos requisitos de datos que ACT |
| VQ-BeT | no disponible | Imitacion con discretizacion de acciones | no disponible | Implementacion publica; comparable en el ecosistema de politicas de manipulation |
| SmolVLA (HuggingFace) | no disponible | VLA con componente de lenguaje | no disponible | Modelo fundacional de robotica; categoria distinta (mayor tamano y generalidad) |

Para una comparación rigurosa habría que medir tasa de éxito en el mismo robot, con el mismo dataset y el mismo número de ensayos, cosa que no se ha hecho en la información disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor no ha publicado tasa de éxito ni número de ensayos, por lo que no hay ninguna evidencia empírica de que la política funcione en un robot real.
- Sobreajuste a la tarea y al montaje: el dataset contiene una sola tarea ("Grab the cube"), capturada con una única configuración de cámaras y presumiblemente una única colocación del objeto y de la iluminación. Cambios en la posición del cubo, el fondo, la iluminación o los distractores pueden degradar gravemente el comportamiento.
- Dependencia de la calibración: cualquier desviación en el montaje de las cámaras o en la calibración del SO-101 respecto al momento de la grabación puede invalidar la política.
- Riesgo de alucinación en sentido amplio: como toda política de comportamiento clonado, puede producir acciones fuera de distribución y movimientos erráticos cuando el estado observado se aleja de los datos de demostración. No hay mecanismo de seguridad documentado ni parada de emergencia integrada.
- Sesgos del dataset: 207 episodios y 94.531 fotogramas recogidos por una sola persona implican un sesgo claro hacia su estilo de teleoperación; la política tenderá a reproducir ese estilo y no necesariamente una estrategia óptima de agarre.
- Sin capacidades de lenguaje ni generalistas: no se puede reutilizar para diálogo, generación de código, visión general ni tareas de razonamiento; no es un VLA ni un LLM.
- Idiomas: no aplica. La única cadena textual relevante es el nombre de la tarea, en inglés, y debe coincidir exactamente con el usado en el entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar avisos de licencia. No obstante, el usuario debe asumir la responsabilidad de seguridad en el robot físico.
- Reproducibilidad: se declaran semilla, número de pasos, batch size y learning rate sobre LeRobot 0.6.2, pero no la configuración completa del modelo ni el dataset íntegro en el repositorio de la política; reproducir exactamente el resultado no está garantizado.
- Datos de contacto y soporte: no disponibles. Al ser un repositorio con 7 descargas y 0 likes, no cabe esperar mantenimiento ni respuestas del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoJoZen1122/my_so101_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/JoJoZen1122/record-s101-side-top_20260922_142509
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=JoJoZen1122/record-s101-side-top_20260922_142509
- Articulo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (`lerobot-*`): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo ni con robotica, por lo que no se han incluido como fuentes.
