# pschwartz26/one_cube

## Resumen

`one_cube` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. La política la publica el usuario pschwartz26 en Hugging Face mediante la librería LeRobot de Hugging Face, y está asociada al dataset del mismo nombre, también alojado en el Hub. No es un modelo de lenguaje: es un controlador visuomotor específico para un robot `so_follower` (SO-100/SO-101 de LeRobot) equipado con una cámara en la muñeca.

El modelo resuelve una tarea concreta de manipulación: "Pick up the cube and place it in the tray" (coger el cubo y dejarlo en la bandeja). Consume el estado articular de 6 dimensiones y una imagen RGB de 480x640, y produce un vector de acción de 6 dimensiones a 30 FPS. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo pequeño pensado para inferencia en tiempo real en hardware de consumo.

Su relevancia es fundamentalmente práctica y de nicho: sirve como ejemplo reproducible de un pipeline completo de imitación con LeRobot (grabación de datos, entrenamiento con ACT, despliegue con `lerobot-rollout`), y como punto de partida para quien quiera replicar la metodología en su propio robot. No hay resultados de evaluación publicados ni licencia declarada, lo que limita su uso directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visuomotora, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje, la tarea se especifica como cadena en tiempo de inferencia) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.7.0 |
| Tipo de robot | `so_follower` |
| Camaras | `wrist` |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.wrist`, shape `(3, 480, 640)` |
| Salida | `action`, shape `(6,)` |
| Frecuencia de datos | 30 FPS |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformer que predice chunks de acciones de longitud fija en lugar de una acción por paso de tiempo. La arquitectura habitual de ACT combina un codificador visual (típicamente ResNet) que procesa la imagen de la cámara, un codificador del estado proprioceptivo y un decodificador transformer que genera la secuencia de acciones. El chunking reduce el error de acumulación y mejora la estabilidad frente a la predicción paso a paso. En este caso concreto, la model card no detalla la configuración interna de capas ni dimensiones del transformer, solo el recuento total de parámetros.

El entrenamiento se realizó sobre el dataset `pschwartz26/one_cube`: 29 episodios, 39.784 frames a 30 FPS, una única tarea ("Pick up the cube and place it in the tray"). La configuración declarada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, con LeRobot 0.7.0. No se indica el número de tokens (no aplica), la composición del dataset más allá de los episodios, ni si hubo etapas de RLHF/DPO (no aplica en aprendizaje por imitación). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visuomotor de un robot `so_follower` para una tarea única de manipulación: coger un cubo y depositarlo en una bandeja.
- Predicción de chunks de acciones de 6 dimensiones a partir de estado articular de 6 dimensiones e imagen de muñeca de 480x640.
- Aprendizaje por imitación a partir de datos de teleoperación (29 episodios, 39.784 frames).
- Ejecución en tiempo real a 30 FPS sobre el robot físico mediante `lerobot-rollout`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de modelos de lenguaje.
- No tiene capacidades multilingües: no procesa lenguaje natural; la tarea se pasa como cadena de texto al runner, pero no se interpreta semánticamente por el modelo.
- No tiene modo thinking, visión general, audio ni otras capacidades especiales más allá del control robótico.

## Casos de uso

- Replicación de un pipeline de imitación extremo a extremo: sirve como referencia reproducible para grabar datos con LeRobot, entrenar una política ACT y desplegarla con `lerobot-rollout`, útil para equipos que se inician en robótica de imitación.
- Benchmark interno de manipulación pick-and-place: al ser una tarea acotada y con datos públicos, se puede usar como línea base para comparar variantes de ACT, cambios de cámara o aumentos de datos.
- Docencia y formación: ejemplo mínimo (0,2 GB, 51,7 M de parámetros) para explicar action chunking, codificación visual y control a 30 FPS sin necesidad de infraestructura pesada.
- Pruebas de integración de hardware SO-100/SO-101: validar calibración, cámaras y puertos del robot antes de entrenar políticas propias más complejas.
- Desarrollo de variantes con más datos: el checkpoint y la configuración de entrenamiento (100.000 pasos, batch 8, lr 1e-5) sirven de punto de partida para fine-tuning con nuevos episodios y objetos.
- Evaluación de robustez en laboratorio: al no haber métricas publicadas, el modelo es adecuado para que el propio equipo mida tasas de éxito con posiciones de objeto, iluminación y distractores variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros y pesos safetensors, el modelo es muy pequeño (del orden de cientos de MB en precisión completa) y cabe holgadamente en cualquier GPU consumer moderna, aunque no se especifica el consumo exacto.
- GPU recomendadas: no disponible; por tamaño, una RTX 4090, RTX 3090 o incluso GPUs de gama media serían suficientes, pero no hay datos oficiales.
- Cabe en GPU consumer: sí, por el reducido número de parámetros, aunque no se documenta el perfil de memoria exacto.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=one_cube`, según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput estimados: no disponibles; los datos se grabaron a 30 FPS, pero no se declara la latencia de inferencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pschwartz26/one_cube (ACT) | 51.668.614 | no aplica | Pick-and-place de un cubo en bandeja | no disponible | Hugging Face, LeRobot |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Tareas de manipulación variables | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | Manipulación visuomotora | variable | Hugging Face |

No se dispone de datos de rendimiento comparables publicados para este modelo ni de una comparativa oficial con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 29 episodios de una única tarea, la política probablemente está sobreajustada a posiciones, iluminación y apariencia del cubo y la bandeja del dataset original.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica contexto de lenguaje; la política solo entiende la tarea para la que fue entrenada y no generaliza a instrucciones nuevas.
- Restricciones de licencia para uso comercial: la licencia no está declarada ("[More Information Needed]"), por lo que no se puede asumir permiso de uso comercial sin consultar al autor.
- Caveat importante para producción: no hay evaluación publicada (0 trials, 0 successes documentados), 0 descargas y 0 likes; el modelo debe validarse en el robot objetivo antes de cualquier despliegue.
- El modelo depende de la cámara `wrist` y del robot `so_follower`; usar otra configuración de cámara o robot invalida la política.
- El repositorio es de 0,2 GB y fue creado y actualizado el mismo día (2026-11-17), sin historial de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pschwartz26/one_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/pschwartz26/one_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=pschwartz26/one_cube
