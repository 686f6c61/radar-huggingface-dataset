# rimur01/act_so101_assignment2

## Resumen

`rimur01/act_so101_assignment2` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para el robot manipulador SO101 (`so_follower`). No es un modelo de lenguaje: es un modelo de control visuomotor que consume el estado articular de 6 dimensiones del robot y dos cámaras RGB de 480x640 y produce un vector de acción de 6 dimensiones. El autor es el usuario del Hub `rimur01` y la ficha tiene toda la apariencia de un trabajo de asignatura o práctica docente, sin publicación asociada ni resultados de evaluación.

El modelo resuelve una única tarea de tipo pick-and-place ("Pick up an object and place it in a target area"), aprendida a partir de 50 episodios de teleoperación (15.000 fotogramas a 15 FPS) recogidos en el dataset `rimur01/so101-assignment1-50-new`. La arquitectura es la del paper de ACT (Zhao et al., 2023), que predice fragmentos de acción (*action chunks*) en lugar de pasos individuales para reducir el error de acumulación y permitir un control más suave.

Su relevancia es limitada fuera del contexto educativo: con 51,67 millones de parámetros, licencia sin definir y cero resultados de éxito reportados, sirve como ejemplo reproducible de un pipeline completo de imitación (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) más que como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de imitación; ventana de observación no documentada en la ficha) |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas (solo safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la instrucción de tarea del ejemplo está en inglés) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO101) |
| Entradas | `observation.state` (6,), `observation.images.cam0` (3, 480, 640), `observation.images.cam1` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tarea entrenada | "Pick up an object and place it in a target area" |
| Dataset de entrenamiento | `rimur01/so101-assignment1-50-new` (50 episodios, 15.000 fotogramas, 15 FPS) |
| Tamano del repo | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en el Hub | 2026-10-28 (según metadatos) |

## Arquitectura y entrenamiento

ACT combina un codificador de observaciones con un transformer encoder-decoder y una cabeza CVAE que modela la variabilidad de las demostraciones humanas. El codificador procesa el estado proprioceptivo y las dos imágenes de cámara (la implementación de referencia de ACT en LeRobot usa habitualmente un backbone ResNet18 para cada vista, aunque la ficha de este modelo no detalla el backbone ni el tamaño del chunk de acciones). La salida es un bloque de acciones de dimensión 6 por paso, lo que aporta consistencia temporal frente a la predicción paso a paso.

El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, con batch size 1, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre 50 episodios de teleoperación de una sola tarea. No se documenta composición del dataset más allá del número de episodios y fotogramas, ni se indica si hubo aumento de datos, RLHF/DPO (no aplicable en imitación) o algún tipo de regularización. Tampoco se especifica la división train/validación ni la métrica de pérdida final.

## Capacidades

- Control visuomotor de pick-and-place: dado el estado de 6 articulaciones y dos vistas de cámara, genera comandos de acción de 6 dimensiones para el SO101.
- Predicción de secuencias de acción (*action chunking*), que suaviza la trayectoria y reduce el error compuesto respecto a políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita ni entorno de simulación.
- Ejecución autónoma en bucle cerrado mediante `lerobot-rollout` durante el tiempo configurado (`--duration`).
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue con los mismos comandos CLI.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, visión general, audio ni generación de texto. No es multilingüe ni tiene modo "thinking".

## Casos de uso

- Práctica docente de aprendizaje por imitación: el modelo sirve como referencia completa de un ciclo grabación-entrenamiento-despliegue con LeRobot, útil en cursos de robótica o máster.
- Tarea de pick-and-place en el SO101: recoger un objeto y depositarlo en una zona objetivo, con el comando `lerobot-rollout` y la instrucción de tarea exacta del entrenamiento.
- Punto de partida para *fine-tuning*: al ser una política ACT de ~51 M de parámetros, puede reentrenarse con un dataset propio de pocas decenas de episodios para una tarea distinta del mismo robot.
- Validación de infraestructura de captura: permite comprobar el pipeline de dos cámaras OpenCV a 640x480, la calibración del SO101 y las tasas de fotogramas antes de recoger datos definitivos.
- Réplica de experimentos: sirve para reproducir la configuración de entrenamiento publicada (100k pasos, AdamW, lr 1e-5, semilla 1000) y estudiar su sensibilidad.
- Base para comparativas internas: útil como línea base de ACT frente a otras políticas de imitación (Diffusion Policy, VQ-BeT) en el mismo robot y dataset.
- No se recomienda su uso en producción sin una evaluación de tasa de éxito en el robot real, que el autor no ha publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet_", y no se reportan tasas de éxito, número de ensayos ni condiciones de prueba (posiciones de objeto, iluminación, distracciones).

## Requisitos de hardware

- VRAM para pesos: aproximadamente 207 MB en fp32 (51.668.614 parámetros x 4 bytes) y unos 103 MB en fp16; el repo completo ocupa 0,2 GB.
- VRAM real de inferencia: no publicada. Con dos flujos de vídeo de 480x640 y el codificador visual, una estimación razonable está por debajo de 2-4 GB, pero es una estimación, no un dato medido por el autor.
- GPU recomendadas: cualquier GPU consumer con CUDA sirve por tamaño de modelo (GTX 1650, RTX 3060, RTX 4060, RTX 4090); A100 o H100 estarían totalmente sobredimensionadas para 51 M de parámetros.
- Cabe en GPU consumer: sí, con margen amplio; también es plausible la inferencia en CPU, aunque no hay latencias publicadas.
- Despliegue: `lerobot-rollout --policy.path=rimur01/act_so101_assignment2` con `--robot.type=so_follower` y dos cámaras OpenCV. Entrenamiento con `lerobot-train --policy.type=act --policy.device=cuda`.
- vLLM, llama.cpp, Ollama y TGI no aplican: son servidores de modelos de lenguaje, no de políticas robóticas.
- Latencia y throughput: no disponibles. La frecuencia de control efectiva depende de la configuración de cámaras del ejemplo (30 FPS) mientras que los datos se grabaron a 15 FPS, lo que conviene verificar en el robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rimur01/act_so101_assignment2` (este) | 51.668.614 | no aplica | sin evaluación publicada | no disponible | HuggingFace Hub, 0 descargas |
| ACT (implementación de referencia en LeRobot) | no disponible en la informacion proporcionada | no aplica | reportado en el paper 2304.13705, no replicado aquí | MIT (código de LeRobot) | GitHub y docs de LeRobot |
| Diffusion Policy (Chi et al., 2023) | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | no disponible | implementaciones en LeRobot y repos de terceros |
| SmolVLA (HuggingFace) | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | no disponible | HuggingFace Hub |

La comparación cuantitativa no es posible con los datos disponibles: no hay métricas de éxito de este checkpoint ni cifras de parámetros de las alternativas en la información proporcionada. La diferencia principal es de planteamiento: ACT es una política específica por tarea y por robot, mientras que SmolVLA se plantea como modelo visión-lenguaje-acción entrenado en múltiples robots.

## Limitaciones y advertencias

- Licencia sin definir ("More Information Needed"): no hay autorización explícita para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Cero resultados de evaluación: no se conoce la tasa de éxito ni en la propia tarea de entrenamiento.
- Dataset muy pequeño y de una sola tarea: 50 episodios y 15.000 fotogramas implican un riesgo alto de sobreajuste al entorno, posiciones de objeto, iluminación y fondo concretos de la grabación.
- Dependencia del *embodiment*: la política está atada al SO101 y a la disposición exacta de `cam0` y `cam1`; cambiar la montura o el índice de cámara invalida las observaciones.
- Sin generalización semántica: no entiende instrucciones en lenguaje natural; el texto de tarea es una etiqueta fija y no una orden interpretada.
- Sensibilidad a la distribución: cambios en el objeto, la mesa o la iluminación pueden degradar el comportamiento sin aviso; no hay mecanismo de detección de fallo.
- Frecuencia de datos y de ejecución no coinciden necesariamente (15 FPS de grabación frente a 30 FPS en el ejemplo de rollout), lo que puede alterar la dinámica si no se ajusta.
- Riesgo de alucinación no aplicable en el sentido de los modelos de lenguaje; el equivalente es la ejecución de trayectorias plausibles pero incorrectas ante observaciones fuera de distribución.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por terceros.
- Sin datos de sesgo demográfico ni lingüístico (no procede), pero sí sesgo hacia el operador que teleoperó los 50 episodios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rimur01/act_so101_assignment2
- Dataset de entrenamiento: https://huggingface.co/datasets/rimur01/so101-assignment1-50-new
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rimur01/so101-assignment1-50-new
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
