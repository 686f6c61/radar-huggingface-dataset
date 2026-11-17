# OPTML-Group/ResWAM-LIBERO

## Resumen

ResWAM-LIBERO es un checkpoint oficial de política multi-tarea del modelo ResWAM (Residual World-Action Model), desarrollado por OPTML-Group (Michigan State University, Cisco, University of Michigan e IBM Research). Se trata de un modelo visión-lenguaje-acción (VLA) aumentado con predicción de futuro (world-action model) orientado al control robótico, entrenado exclusivamente sobre las demostraciones del benchmark LIBERO (`libero_spatial`, `libero_object`, `libero_goal`, `libero_10`) sin preentrenamiento externo en trayectorias de robots.

La innovación central del trabajo es el *aprendizaje de residuo visual*: en lugar de supervisar la observación futura completa, el modelo aprende únicamente el cambio de características entre el fotograma actual y el futuro en un espacio DINOv3 congelado. Esto concentra el aprendizaje en el brazo robótico y los objetos manipulados, en lugar del fondo estático, y reduce el coste computacional. El modelo totaliza 2,3B parámetros, con un backbone de texto de 16 capas (RynnBrain-1.1-2B) y un DiT de doble rama de 0,5B que entrena conjuntamente una rama de acción y una rama de residuo mediante *conditional flow matching*.

El checkpoint logra un 81,1 % de éxito medio en zero-shot sobre los 10.030 episodios perturbados de LIBERO-Plus, con 1,0 TFLOPs de inferencia y 92,2 ms por chunk de acción en una RTX A6000. Es relevante para la comunidad de robótica porque demuestra que un world-action model ligero, sin preentrenamiento robótico masivo, puede competir con alternativas más costosas en tareas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action con world-action model; backbone de texto de 16 capas + DiT de doble rama (acción y residuo) con conditional flow matching sobre DINOv3-B/16 congelado |
| Parametros totales | 2,3B (RynnBrain-1.1-2B 16 capas + DiT 0,5B + DINOv3-B/16 congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16/fp32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch, bf16/fp32) |
| Horizonte de accion | 8 pasos (7-D delta EEF + pinza binaria, replanificación cada 8 pasos) |
| Estado propioceptivo | 11-D (xyz + rotación 6D + qpos de 2 dedos) |
| Computo de entrenamiento | 2,7 TFLOPs |
| Computo de inferencia | 1,0 TFLOPs |
| Latencia | 92,2 ms por chunk de acción (10 pasos Euler, RTX A6000) |

## Arquitectura y entrenamiento

ResWAM combina un backbone de texto de 16 capas (RynnBrain-1.1-2B) con un DiT de doble rama de 0,5B parámetros que entrena simultáneamente una rama de acción y una rama de residuo. La rama de residuo supervisa, mediante *conditional flow matching*, únicamente la diferencia de características entre el fotograma actual y el futuro en un espacio DINOv3-B/16 congelado, en lugar de la observación futura completa. Según el paper, este objetivo de residuo produce un rango de características mayor y representaciones más diversas del cambio de escena, y se concentra espacialmente en el brazo y los objetos manipulados.

El entrenamiento se realiza sobre las demostraciones estándar de LIBERO (`libero_spatial`, `libero_object`, `libero_goal`, `libero_10`) sin preentrenamiento en trayectorias de robots externas al benchmark. El modelo predice acciones de 7 dimensiones (delta del efector final más pinza binaria) con un horizonte de 8 pasos y replanificación cada 8 pasos. El checkpoint incluye `codec_statistics.json` con las estadísticas de normalización ZScore para acciones de 7-D y estado propioceptivo de 11-D, y `resolved_config.json` con la configuración completa de modelo, datos y evaluación.

## Capacidades

- Control robótico de manipulación multi-tarea: genera secuencias de acciones de 7-D (delta EEF + pinza) a partir de observaciones visuales e instrucciones.
- Predicción de futuro mediante residuo visual en espacio DINOv3, que informa la política sobre el efecto de sus acciones.
- Política multi-tarea entrenada sobre cuatro suites de LIBERO (spatial, object, goal, 10).
- Robustez zero-shot ante perturbaciones de cámara, robot, lenguaje, iluminación, fondo, ruido y disposición (evaluada en LIBERO-Plus).
- Soporte de instrucciones en lenguaje natural como condicionamiento de tarea (la dimensión lingüística obtiene 89,9 % en LIBERO-Plus).
- Inferencia de bajo coste (1,0 TFLOPs por chunk) compatible con despliegue en closed-loop.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni thinking mode; el modelo está especializado en robótica.

## Casos de uso

- Manipulación robótica multi-tarea en laboratorio: el modelo puede ejecutar tareas de las suites LIBERO (spatial, object, goal, 10) a partir de instrucciones en lenguaje natural, sirviendo como política base para experimentos de investigación en manipulación.
- Evaluación de robustez zero-shot: con 81,1 % de éxito medio en los 10.030 episodios perturbados de LIBERO-Plus, es adecuado para medir la generalización de políticas VLA ante cambios de cámara, iluminación, fondo o disposición sin reentrenamiento.
- Investigación en world-action models: el checkpoint permite reproducir y comparar el aprendizaje de residuo visual frente a la supervisión de futuro completo, gracias a los ficheros de configuración y estadísticas incluidos.
- Despliegue en closed-loop con requisitos de latencia estrictos: los 92,2 ms por chunk de acción en RTX A6000 y 1,0 TFLOPs de inferencia lo hacen viable para bucles de control que replanifican cada 8 pasos.
- Benchmarking de políticas sin preentrenamiento robótico: sirve como referencia de hasta dónde llega un modelo entrenado solo con demostraciones del benchmark, útil para estudios comparativos sobre el valor del preentrenamiento en robots.
- Transferencia a robótica real: el paper reporta resultados en robot real en tareas Open, Put y Stack (80,0 % medio, +10,0 % sobre π0.5) con 92,7 ms de latencia, lo que respalda su uso como punto de partida para despliegues físicos.
- Base para fine-tuning en dominios específicos: al estar bajo licencia MIT y en formato PyTorch, puede adaptarse a nuevas tareas de manipulación con datos propios.

## Benchmarks y rendimiento

Resultados zero-shot en LIBERO-Plus (10.030 episodios), desglosados por tipo de perturbación:

| Perturbacion | Exito |
|---|---|
| Cámara | 52,3 % |
| Robot | 71,0 % |
| Lenguaje | 89,9 % |
| Iluminación | 97,7 % |
| Fondo | 98,3 % |
| Ruido | 85,6 % |
| Disposición | 83,2 % |
| **Media** | **81,1 %** |

Resultados adicionales reportados en el abstract del paper:

| Benchmark | Resultado |
|---|---|
| LIBERO-Plus (media) | 81,1 % |
| RoboTwin 2.0 | 93,8 % |
| RoboDojo | 9,40 % éxito, 13,41 de puntuación |
| Robot real Open/Put/Stack | 80,0 % medio (+10,0 % sobre π0.5) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje general, dado que el modelo es una política robótica y no un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,3B parámetros en bf16 el peso ronda los 4,6 GB, más activaciones y el backbone DINOv3 congelado.
- GPU de referencia en la model card: RTX A6000 (48 GB), con 92,2 ms por chunk de acción.
- GPU recomendadas: no disponible; por tamaño, cabría esperar viabilidad en GPUs consumer de gama alta (p. ej. RTX 4090, 24 GB) para inferencia en bf16, aunque no se confirma en la información proporcionada.
- Cabe en GPU consumer: no confirmado explícitamente; el tamaño de pesos en bf16 sugiere que sí en GPUs con 16-24 GB, pero debe validarse.
- Opciones de despliegue: el repositorio proporciona el script `scripts/eval/eval_libero_plus.py` con soporte multi-GPU (`--gpus 0,1,2,3`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 92,2 ms por chunk (10 pasos Euler, RTX A6000); 92,7 ms en el despliegue en robot real.
- Throughput: no disponible.
- Computo: 2,7 TFLOPs en entrenamiento y 1,0 TFLOPs en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LIBERO-Plus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResWAM-LIBERO | 2,3B (0,5B DiT activo en rama) | no disponible | 81,1 % | MIT | Hugging Face + código |
| π0.5 | no disponible | no disponible | no disponible | no disponible | referencia comparativa en el paper (ResWAM +10,0 % en robot real) |
| Alternativas VLA de gran tamano (p. ej. basadas en modelos de vídeo) | no disponible | no disponible | no disponible | no disponible | mencionadas cualitativamente en el abstract |

No se dispone en la información proporcionada de cifras detalladas de parámetros, contexto o licencia de π0.5 ni de otras alternativas VLA, por lo que la comparación cuantitativa se limita a los resultados reportados por los autores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; al entrenarse solo con demostraciones de LIBERO, puede heredar sesgos de ese entorno simulado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en robótica el riesgo equivalente es la predicción de acciones inválidas, especialmente bajo perturbaciones de cámara (52,3 % de éxito) y de robot (71,0 %).
- Limitaciones de contexto o idioma: la longitud de contexto no está disponible; el soporte multilingüe no está documentado y el condicionamiento lingüístico se evalúa solo en el benchmark LIBERO-Plus.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; debe conservarse el aviso de copyright.
- Caveats para producción: el modelo está especializado en las tareas de LIBERO y no es un VLA de propósito general; requiere estadísticas de normalización (`codec_statistics.json`) y configuración (`resolved_config.json`) para funcionar correctamente; el rendimiento cae notablemente ante cambios de cámara; el despliegue en robot real requiere adaptación del pipeline de observación y control.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún limitada.

## Enlaces

- Hugging Face: https://huggingface.co/OPTML-Group/ResWAM-LIBERO
- Paper (arXiv): https://arxiv.org/abs/2611.19559
- Página del proyecto: https://chongyu-fan.netlify.app/posts/reswam/
- Código: https://github.com/OPTML-Group/ResWAM
- Colección HF: https://huggingface.co/collections/OPTML-Group/reswam-6af8906dc9b6f21539b30934
