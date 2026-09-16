# congnguyenzn/turbovla_pnp_vial_rack_v4

## Resumen
`congnguyenzn/turbovla_pnp_vial_rack_v4` es una política de robótica de tipo vision-language-action (VLA) entrenada con la librería LeRobot de Hugging Face y publicada por el usuario congnguyenzn. Concretamente, implementa el tipo de política `turbovla_so101` sobre el robot `so_follower` (familia SO-101/SO-100 de bajo coste), y resuelve una tarea única de manipulación: «Pick the vial and place into the rack» (coger un vial y colocarlo en una gradilla). No es un modelo de lenguaje generalista, sino un controlador de imitación que consume estado de articulaciones y dos cámaras y emite directamente acciones motoras.

El modelo tiene 209.286.150 parámetros (aproximadamente 209 M) y un repositorio de 0,8 GB en formato safetensors. Se entrenó de forma supervisada (imitación) sobre el dataset `congnguyenzn/pnp_vial_rack`, compuesto por 119 episodios y 66.638 fotogramas a 30 FPS, durante 13.714 pasos con optimizador AdamW y una tasa de aprendizaje de 4,68e-05. La entrada de observación incluye el estado del robot (vector de 6 dimensiones) y dos flujos visuales de 480x640x3 (muñeca y frontal), y la salida es un vector de acción de 6 dimensiones.

Su relevancia es acotada pero clara: demuestra el flujo completo de entrenamiento y despliegue de políticas VLA en robots de bajo coste con LeRobot 0.6.1, con licencia Apache 2.0 y sin restricciones conocidas para uso comercial. Al no haberse publicado resultados de evaluación en robot real, debe considerarse un artefacto de investigación reproducible más que una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica VLA de imitacion (`turbovla_so101`) para robotica; detalles internos de la red no disponibles |
| Parametros totales | 209.286.150 |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (politica de imitacion por paso, sin ventana de contexto autoregresiva documentada) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (fp32) |
| Idiomas soportados | no disponible (modelo de robotica; acepta una instruccion de tarea en texto pero no es un modelo multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La model card no describe la topologia interna de `turbovla_so101`; se trata de una política VLA integrada en el ecosistema LeRobot, cuyo tipo de política se invoca mediante `--policy.type=turbovla_so101`. Lo que sí está documentado es el contrato de entrada/salida: observaciones compuestas por `observation.state` con forma `(6,)`, `observation.images.wrist` y `observation.images.front` con forma `(3, 480, 640)`, y una acción de salida `action` con forma `(6,)`. El robot objetivo es un `so_follower` con cámaras de muñeca y frontal.

El entrenamiento es de imitación supervisada sobre el dataset `congnguyenzn/pnp_vial_rack`: 119 episodios, 66.638 fotogramas a 30 FPS y una única instrucción de tarea. La configuración reportada es de 13.714 pasos, tamaño de lote 56, optimizador AdamW, tasa de aprendizaje 4,68e-05 y semilla 1000, ejecutado con LeRobot 0.6.1. No se documenta si hubo etapas de RLHF, DPO ni ningún otro ajuste posterior, ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.).

## Capacidades
- Control motor directo: genera vectores de acción de 6 dimensiones a partir del estado de las articulaciones y de dos vistas de cámara.
- Manipulación visual guiada: percepción desde cámara de muñeca y cámara frontal a 480x640, integrada en la política.
- Ejecución de una tarea de pick-and-place: coger un vial y colocarlo en una gradilla.
- Condicionamiento por instrucción de tarea en texto («Pick the vial and place into the rack.»), aunque la política está entrenada para una única tarea.
- Despliegue en bucle cerrado sobre robot real a 30 FPS mediante `lerobot-rollout`.
- Reentrenamiento reproducible: el tipo de política es reutilizable con `lerobot-train` sobre otros datasets.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no soportado como tal; la planificación se limita a la secuencia motora aprendida por imitación.
- Capacidades multilingües: no aplicables.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles; la visión se limita a las dos cámaras de entrenamiento.

## Casos de uso
- Automatización de pick-and-place de laboratorio: colocar viales en gradillas de forma repetitiva, aprovechando que la política está entrenada exactamente para esa tarea sobre un SO-101 con dos cámaras.
- Banco de pruebas de imitación en robótica de bajo coste: usar esta política como referencia reproducible para validar el pipeline completo de LeRobot (grabación de datos, entrenamiento y rollout) antes de escalar a tareas propias.
- Docencia y formación: demostrar en un laboratorio o aula el ciclo de aprendizaje por imitación con hardware accesible, dado el tamaño reducido del modelo (209 M) y su licencia permisiva.
- Base para ajuste fino: partir de estos pesos y reentrenar con `--policy.type=turbovla_so101` sobre un dataset propio para tareas de manipulación similares (por ejemplo, otros objetos cilíndricos y contenedores).
- Evaluación de robustez de políticas VLA: comparar el efecto de cambios de iluminación, posición de objetos o distracciones sobre una política entrenada con 119 episodios, midiendo tasas de éxito en robot real.
- Prototipado industrial ligero: si se valida la tasa de éxito, integrar la política en una celda sencilla de manipulación de muestras o componentes pequeños en entornos controlados.
- Investigación en recopilación de datos: analizar qué volumen de episodios (66.638 fotogramas) es necesario para una tarea de colocación precisa, usando este modelo como punto de referencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente el texto «No evaluation results have been provided for this policy yet», por lo que no existe tabla de ensayos, éxitos ni tasa de éxito en robot real.

## Requisitos de hardware
- VRAM estimada para inferencia: los 209.286.150 parámetros ocupan aproximadamente 0,84 GB en fp32 y unos 0,42 GB en fp16. Con los búferes de las dos imágenes de 480x640x3, el consumo debería mantenerse en el rango de 1 a 2 GB, aunque no hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100). No se documenta ninguna GPU concreta empleada en el entrenamiento o despliegue.
- Cabe en GPU de consumo: sí; por el tamaño del modelo es esperable que quepa incluso en GPUs integradas o iGPUs con memoria compartida, y es plausible ejecutarlo en CPU, si bien no hay cifras oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de control robótico de este tipo.
- Latencia y throughput: no disponibles. Como referencia, el bucle de control del dataset está grabado a 30 FPS, lo que implica un presupuesto temporal de unos 33 ms por paso, pero no se publica la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turbovla_pnp_vial_rack_v4 | 209.286.150 | no disponible | sin resultados publicados | apache-2.0 | Hugging Face, via LeRobot |
| Otras politicas LeRobot (ACT, Diffusion Policy, SmolVLA) | no disponible | no disponible | no disponible | no disponible | ecosistema LeRobot |
| Alternativas de politica VLA de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables en la informacion proporcionada; la comparativa anterior se limita a enumerar familias de políticas del ecosistema LeRobot sin cifras contrastadas.

## Limitaciones y advertencias
- Política de tarea única: entrenada exclusivamente para «Pick the vial and place into the rack»; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación: no hay ninguna tasa de éxito publicada en robot real, por lo que se desconoce su fiabilidad.
- Sesgos conocidos: no disponibles; al ser un modelo de imitación, heredará los sesgos de las demostraciones (posiciones, iluminación, fondo y condiciones del dataset de 119 episodios).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras cuando la observación se aleja de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no es un modelo de lenguaje; la instrucción de tarea es fija y en inglés. No soporta conversación ni contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo en un entorno físico real.
- Requisitos de hardware específicos: el despliegue exige un robot `so_follower` y exactamente dos cámaras con los nombres de observación `observation.images.wrist` y `observation.images.front`; cualquier desviación en el montaje o la calibración invalida la política.
- Estado del repositorio: 0 descargas y 0 «likes» en el momento de la consulta, sin demo en vídeo ni métricas adicionales; debe tratarse como un artefacto experimental.
- Advertencia de seguridad: en un robot real, conviene limitar velocidades y fuerzas y supervisar la ejecución, dado que no se han publicado pruebas de robustez.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/congnguyenzn/turbovla_pnp_vial_rack_v4
- Dataset de entrenamiento: https://huggingface.co/datasets/congnguyenzn/pnp_vial_rack
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=congnguyenzn/pnp_vial_rack
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
