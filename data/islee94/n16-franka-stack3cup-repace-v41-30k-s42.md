# islee94/n16-franka-stack3cup-repace-v41-30k-s42

## Resumen

n16-franka-stack3cup-repace-v41-30k-s42 es un checkpoint de ajuste fino del modelo fundacional de robótica GR00T N1.6, desarrollado por NVIDIA, publicado por el usuario islee94 en Hugging Face. A diferencia de un modelo de lenguaje generalista, se trata de un modelo de visión-lenguaje-acción (VLA) especializado en una tarea concreta de manipulación robótica: apilar tres vasos (stack_3_cup) con un brazo Franka real. El checkpoint se ha entrenado sobre datos retemporizados con la técnica RePace v41 y contiene únicamente los pesos de inferencia, sin estado del optimizador.

El modelo tiene 3.286.608.832 parámetros almacenados en dos ficheros safetensors que suman aproximadamente 6,6 GB en el repositorio. Se entrenó durante 30.000 actualizaciones en 4 GPU A100 con semilla 42, partiendo del checkpoint base gr00tn16 (referencia 179b98b). La evaluación en robot real está pendiente según la propia model card.

Su relevancia es acotada pero técnica: sirve como artefacto reproducible de un pipeline de entrenamiento VLA para una tarea de apilado, útil para investigadores que trabajen con GR00T N1.6, con la técnica RePace de retemporización de datos o con despliegues en Franka. No es un modelo de propósito general ni está pensado para uso conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (modelo vision-lenguaje-accion, VLA); detalles internos no disponibles |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (2 shards, ~6,6 GB) |
| Pipeline | no disponible |
| Tarea | Manipulacion robotica: stack_3_cup con Franka |
| Entrenamiento | 30.000 updates, 4 x A100, seed 42, base gr00tn16 179b98b |
| Datos | Franka stack_3_cup, RePace v41 retimed (stack3cup_repace_v41_ae09443) |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.6, la familia de modelos fundacionales de robótica de NVIDIA, que combina percepción visual, instrucciones en lenguaje y generación de acciones motoras (arquitectura VLA). La model card no detalla la composición interna de capas, el mecanismo de atención ni el encoder visual, por lo que esos datos se consideran no disponibles. El checkpoint contiene únicamente pesos de inferencia, sin estado del optimizador.

El ajuste fino se realizó sobre el dataset real Franka stack_3_cup, retemporizado con RePace v41 (fichero repace_v41_max2_ae09443.json). Se ejecutaron 30.000 actualizaciones en 4 GPU A100 (4 x 16, presumiblemente 16 procesos por GPU), con semilla 42, partiendo del checkpoint gr00tn16 179b98b. El repositorio incluye artefactos de trazabilidad: raven_context.txt, pacedistill_manifest.json y el propio fichero RePace, con hashes SHA-256 documentados, lo que permite reproducir el linaje del entrenamiento. La evaluación en robot real está pendiente según el autor.

## Capacidades

- Generación de acciones motoras para un brazo Franka en la tarea específica de apilar tres vasos.
- Percepción visual y condicionamiento por instrucción (propio de la familia GR00T N1.6), aunque los detalles de la interfaz no están documentados en la model card.
- Ejecución de políticas entrenadas con datos retemporizados mediante RePace v41.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas ni visión general.
- Capacidades multilingües: no disponibles.
- No dispone de modo thinking, audio ni otras capacidades especiales documentadas.

## Casos de uso

- Investigación en manipulación robótica: servir como punto de partida o referencia para reproducir el pipeline de ajuste fino de GR00T N1.6 sobre tareas de apilado con Franka.
- Evaluación de técnicas de retemporización: comparar el efecto de RePace v41 frente a datos sin retemporizar en la misma tarea stack_3_cup, usando este checkpoint como baseline entrenado.
- Despliegue en banco de pruebas Franka: cargar los pesos en un entorno de simulación o robot real para validar la política antes de integrarla en un pipeline mayor.
- Estudio de reproducibilidad: los hashes de los artefactos Raven y del manifiesto permiten auditar el linaje del entrenamiento y replicar condiciones (seed 42, 30k updates, 4 x A100).
- Base para ajuste fino posterior: al ser un checkpoint de inferencia de 3,28 mil millones de parámetros, puede servir como inicialización para tareas relacionadas de manipulación.
- Docencia y divulgación técnica: ejemplo concreto de modelo VLA especializado con trazabilidad completa de entrenamiento para explicar pipelines de robótica fundacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación en robot real está pendiente ("robot evaluation pending"), por lo que no existen métricas de éxito de tarea, tasas de acierto ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman aproximadamente 6,6 GB en safetensors; en fp16 se requieren al menos ~7 GB solo para pesos, más memoria para activaciones y buffers del entorno de simulación o control del robot.
- GPU recomendadas: el entrenamiento se realizó en 4 x A100; para inferencia se recomienda al menos una GPU con 16-24 GB (A100, L40S, RTX 4090) para operar con holgura.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y posiblemente en RTX 4080/4070 Ti con cuantización o reducción de precisión, aunque no se documentan formatos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo VLA, el despliegue requiere el stack de inferencia de GR00T N1.6 y el entorno de control del robot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no proporciona comparaciones con otros checkpoints de GR00T N1.6 ni con modelos VLA alternativos (OpenVLA, RT-2, π0), y no se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (stack_3_cup con Franka); no es un modelo de propósito general ni apto para conversación.
- Evaluación en robot real pendiente: no hay evidencia publicada de éxito de la política en el mundo físico.
- Licencia no especificada: no se puede confirmar el uso comercial; debe verificarse con el autor y con las condiciones de GR00T N1.6 de NVIDIA antes de cualquier despliegue productivo.
- Idiomas y contexto no documentados; no se debe asumir soporte multilingüe.
- Riesgo de sobreajuste al dataset concreto (stack3cup_repace_v41_ae09443) y a las condiciones de captura del mismo.
- Sin estado del optimizador: no es reanudable para entrenamiento tal cual, solo para inferencia o ajuste fino desde cero del optimizador.
- Trazabilidad dependiente de artefactos Raven (raven_context.txt, pacedistill_manifest.json) cuyo contenido no se detalla en la model card.
- Sin cuantizaciones oficiales publicadas; el despliegue en hardware limitado requiere trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/islee94/n16-franka-stack3cup-repace-v41-30k-s42
- Modelo base GR00T N1.6 (NVIDIA): no disponible en la información proporcionada
- Paper o blog de GR00T N1.6: no disponible en la información proporcionada
- Repositorio de código de GR00T: no disponible en la información proporcionada
- Documentación de RePace v41: no disponible en la información proporcionada
