# gautamkane/act_pen_in_cup_day

## Resumen

`gautamkane/act_pen_in_cup_day` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales. El modelo lo publica el usuario `gautamkane` en Hugging Face usando LeRobot, la librería de aprendizaje automático para robótica real de Hugging Face, y está entrenado para una única tarea de manipulación: coger un bolígrafo y dejarlo dentro de un vaso en una oficina y en condiciones nocturnas.

Se trata de una política especializada, no de un modelo de propósito general: consume el estado del robot (vector de 6 dimensiones) y dos flujos de vídeo de 480×640 píxeles procedentes de sendas cámaras (cabeza y muñeca), y produce un vector de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros (unos 51,7 millones), ocupa 0,2 GB en el repositorio y se distribuye en formato safetensors, por lo que es ligero y puede ejecutarse en hardware modesto.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un *pipeline* completo de aprendizaje por imitación con LeRobot (dataset teleoperado, entrenamiento y *rollout* con una sola orden de línea de comandos) sobre un brazo tipo `so_follower` (familia SO-100/SO-101). No incluye resultados de evaluación publicados, cero descargas y cero *likes* en el momento de redactar esta ficha, y no declara licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación con transformer encoder-decoder y predicción de *action chunks* |
| Parámetros totales | 51.668.614 (≈51,7 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Entrada de una observación por inferencia (estado de 6 dimensiones + dos imágenes de 3×480×640) |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje natural; la tarea se especifica mediante un *prompt* de texto fijo en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamaño del repositorio: 0,2 GB) |
| Librería | lerobot (versión de entrenamiento: 0.6.2) |
| Pipeline | robotics |
| Tipo de robot | `so_follower` (brazo seguidor de la familia SO-100/SO-101) |
| Cámaras | `head` y `wrist`, a 640×480 y 30 FPS |
| Entradas | `observation.state` (STATE, `(6,)`), `observation.images.head` (VISUAL, `(3, 480, 640)`), `observation.images.wrist` (VISUAL, `(3, 480, 640)`) |
| Salidas | `action` (ACTION, `(6,)`) |
| Dataset de entrenamiento | `gautamkane/pen_in_cup_day_1_clean` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT está descrito en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705), citado en las etiquetas y en la propia *model card*. La propuesta central es predecir secuencias cortas de acciones (*chunks*) en lugar de una acción por paso de tiempo, lo que reduce el error de composición acumulado en tareas de manipulación fina. La formulación original incorpora un espacio latente de tipo CVAE para modelar la variabilidad de las demostraciones humanas y emplea *temporal ensembling* para agregar las predicciones solapadas entre *chunks* consecutivos durante la inferencia.

La *model card* no detalla la composición interna del *checkpoint* más allá de indicar el método (`model_name: act`) y la librería utilizada. Los datos de entrenamiento sí están documentados: 55 episodios teleoperados, 45.295 fotogramas a 30 FPS, correspondientes a la tarea "Pick up the pen and drop it in the cup - night time - office room" (coger el bolígrafo y dejarlo en el vaso, de noche, en una oficina). La configuración de entrenamiento especifica 40.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, ejecutados con LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni fases de ajuste posteriores; en aprendizaje por imitación, el ajuste se limita al entrenamiento supervisado sobre las demostraciones.

## Capacidades

- Manipulación robótica de una sola tarea: coger un bolígrafo y depositarlo en un vaso, en el entorno y las condiciones de iluminación del dataset de entrenamiento.
- Control de un brazo `so_follower` con un espacio de acción de 6 dimensiones a partir de un estado también de 6 dimensiones.
- Fusión de percepción visual multi-cámara: dos vistas simultáneas (cámara de cabeza y cámara de muñeca) a 640×480 y 30 FPS.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, con predicción de *action chunks* en lugar de acciones aisladas.
- Ejecución mediante la CLI de LeRobot (`lerobot-rollout`) y reentrenamiento con `lerobot-train`.
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (*thinking*), ni capacidades de audio, ni generación de texto.
- No se documentan capacidades multilingües. La tarea se invoca con una cadena de texto fija en inglés que debe coincidir con la descripción usada durante el entrenamiento.

## Casos de uso

- Reproducción de un *baseline* de ACT: sirve para validar una instalación de LeRobot 0.6.2 de principio a fin, desde la descarga del *checkpoint* hasta la ejecución sobre un brazo real, sin necesidad de entrenar nada.
- Punto de partida para *fine-tuning* propio: partiendo de estos pesos y de un dataset propio de manipulación con el mismo brazo y la misma disposición de cámaras, se puede reentrenar la política con `lerobot-train` para una tarea distinta.
- Comparativa de métodos de imitación: al ser un *checkpoint* ACT entrenado con 40.000 pasos y lote 16 sobre un dataset pequeño (55 episodios), es un candidato razonable para contrastar ACT frente a otras políticas soportadas por LeRobot, como Diffusion Policy, manteniendo constante el dataset y el robot.
- Estudio de robustez frente a iluminación: la tarea se grabó de noche en una oficina, de modo que el modelo permite analizar cómo se degrada la política al cambiar las condiciones lumínicas respecto al conjunto de entrenamiento.
- Docencia y divulgación en robótica: el flujo completo (dataset visualizable, configuración de entrenamiento publicada y comando de *rollout* listo para copiar) es adecuado para prácticas de laboratorio sobre aprendizaje por imitación con hardware de bajo coste.
- Pruebas de integración de *pipelines* de datos: el dataset asociado (45.295 fotogramas a 30 FPS) y la política permiten ensayar procesos de limpieza de datos, visualización y reentrenamiento de extremo a extremo.
- Demostración de despliegue en *edge*: con 51,7 M de parámetros y un repositorio de 0,2 GB, el *checkpoint* se puede cargar en una máquina con GPU modesta o incluso solo CPU, lo que facilita prototipos fuera de servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia *model card* incluye la sección de evaluación con el texto literal "No evaluation results have been provided for this policy yet", es decir, el autor no ha reportado número de ensayos, éxitos ni tasa de éxito sobre el robot real. Tampoco se aportan métricas de *loss* de entrenamiento, comparativas con otras políticas ni resultados sobre variaciones de posición de objetos, iluminación o distractores.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB. Los pesos en precisión de 32 bits ocupan aproximadamente 0,2 GB (51,7 M de parámetros), coherente con el tamaño del repositorio.
- GPU recomendadas: cualquiera con soporte CUDA para entrenamiento (por ejemplo, RTX 3090, RTX 4090, A100 o H100); el entrenamiento se lanzó con `--policy.device=cuda`. Para inferencia no se requiere GPU dedicada.
- Compatibilidad con GPU de consumo: sí. El modelo cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU o CPU, dado su tamaño reducido.
- Hardware robótico necesario: brazo `so_follower` con su puerto serie correspondiente y dos cámaras USB configuradas a 640×480 y 30 FPS con los nombres `head` y `wrist`, que deben coincidir con las claves de observación del entrenamiento.
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=gautamkane/act_pen_in_cup_day`) sobre PyTorch. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se capturó a 30 FPS y el *rollout* se ejecuta a esa cadencia, pero no se publican mediciones de latencia de inferencia ni de frecuencia de control efectiva.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gautamkane/act_pen_in_cup_day` | ACT (imitation learning), tarea única | 51,7 M | No aplica | No disponible | Hugging Face, librería lerobot |
| Otras políticas ACT de LeRobot | ACT (imitation learning) | No disponible | No aplica | No disponible | Hugging Face |
| Diffusion Policy en LeRobot | Política basada en difusión | No disponible | No aplica | No disponible | Repositorio de LeRobot |
| SmolVLA / pi0 en LeRobot | Modelos visión-lenguaje-acción | No disponible | No disponible | No disponible | Repositorio de LeRobot |

No se dispone de datos verificables de parámetros, contexto o rendimiento para los modelos comparables dentro de la información proporcionada, por lo que la comparación cuantitativa queda como no disponible. La diferencia cualitativa principal es que este *checkpoint* es una política de tarea única entrenada sobre 55 episodios, mientras que las alternativas VLA de LeRobot están pensadas para generalizar entre tareas e instrucciones en lenguaje natural mediante *prompts*.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una sola tarea ("Pick up the pen and drop it in the cup - night time - office room") en un entorno concreto. No generaliza a otros objetos, otras posiciones ni otras habitaciones sin reentrenamiento.
- Sesgo de dominio: los datos se capturaron de noche en una oficina y con un montaje de cámaras concreto. Cambios de iluminación, de fondo o de posición de las cámaras pueden degradar el comportamiento.
- Dependencia del hardware: requiere un brazo `so_follower` y cámaras con los nombres `head` y `wrist` exactamente como en el entrenamiento. Usar otro robot o renombrar las cámaras rompe la inferencia.
- Riesgo de alucinación en el sentido robótico: al ser una política de imitación, puede generar secuencias de acción plausibles pero incorrectas ante observaciones fuera de distribución, sin ninguna señal de incertidumbre ni mecanismo de rechazo. No hay parada de seguridad integrada.
- Ausencia de evaluación: no hay tasa de éxito publicada. No se puede asumir que la política funcione de forma fiable en producción, ni siquiera en la tarea para la que fue entrenada.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en un limbo legal. Conviene contactar con el autor antes de cualquier despliegue comercial.
- Idiomas y texto: aunque no es un modelo de lenguaje, la tarea se invoca con una cadena fija en inglés; no hay soporte ni evaluación en otros idiomas.
- Tamaño de dataset reducido: 55 episodios y 45.295 fotogramas son una base pequeña, lo que limita la robustez frente a variaciones y aumenta el riesgo de sobreajuste al entorno de grabación.
- Configuración de entrenamiento conservadora: tasa de aprendizaje de 1e-05 y 40.000 pasos, sin información sobre curvas de pérdida ni sobre si el modelo convergió.
- Metadatos anómalos: las fechas de creación y actualización del repositorio (2026) son posteriores a la fecha de redacción habitual de este tipo de fichas, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gautamkane/act_pen_in_cup_day
- Dataset de entrenamiento: https://huggingface.co/datasets/gautamkane/pen_in_cup_day_1_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=gautamkane/pen_in_cup_day_1_clean
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705, *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan ninguna relación con el modelo ni con robótica, por lo que se han descartado y no se han utilizado como fuente.
