# kaKTEC/2608_moving_box_01_00test_GR00T17

## Resumen

Este modelo es una política robótica de imitación basada en GR00T N1.7, el modelo fundacional de código abierto de NVIDIA para razonamiento y habilidades robóticas humanoides. Ha sido fine-tuneado por el usuario kaKTEC mediante la librería LeRobot de HuggingFace para ejecutar una tarea concreta de manipulación: introducir un cubo blanco en una caja en movimiento. El modelo combina un backbone Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow-matching, y condiciona sus predicciones a partir de visión, lenguaje y propriocepción.

Con 3.144 millones de parámetros (3,14B) y un tamaño de repositorio de 12,6 GB, esta política se entrenó sobre 60 episodios (19.680 fotogramas a 30 FPS) capturados con dos cámaras (superior y muñeca) en un robot tipo `so_follower`. Su relevancia radica en que demuestra el flujo completo de entrenamiento e inferencia de políticas GR00T con LeRobot, un pipeline de aprendizaje por imitación de código abierto, y sirve como referencia práctica para la comunidad de robótica que trabaja con el ecosistema NVIDIA Isaac-GR00T.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + flow-matching action transformer) |
| Parametros totales | 3.144.016.000 (3,14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional cross-embodiment de NVIDIA que combina un backbone multimodal Cosmos-Reason2/Qwen3-VL para procesar entradas de visión y lenguaje, con un transformer de acciones basado en flow-matching que genera trayectorias de acción condicionadas por visión, lenguaje y propriocepción. Esta arquitectura permite al modelo razonar sobre la escena y predecir acciones de control continuo para robots humanoides y manipuladores.

El entrenamiento de esta instancia concreta se realizó mediante aprendizaje por imitación con LeRobot (versión 0.6.1), sobre un dataset propio de 60 episodios y 19.680 fotogramas a 30 FPS, con la tarea "Put a white cube into the moving box". La configuración de entrenamiento incluye 60.000 pasos, batch size de 64, optimizador AdamW con learning rate de 0,0001 y semilla 42. Las observaciones consisten en el estado del robot (6 dimensiones) y dos flujos visuales RGB de 480x640 píxeles (cámara superior y cámara de muñeca), produciendo acciones de 6 dimensiones como salida.

## Capacidades

- Control robótico de manipulación: predice acciones de 6 grados de libertad para ejecutar la tarea de introducir un cubo en una caja móvil.
- Percepción visual multimodal: procesa dos flujos de cámara simultáneos (superior y muñeca) a 480x640 píxeles.
- Condicionamiento por propriocepción: utiliza el estado articular del robot (6 dimensiones) como entrada adicional.
- Aprendizaje por imitación: política entrenada mediante demostraciones humanas teleoperadas, sin necesidad de ingeniería de recompensas.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de HuggingFace para robótica.
- Razonamiento cross-embodiment: hereda la capacidad del modelo base GR00T N1.7 para generalizar entre distintas morfologías robóticas.

## Casos de uso

- Manipulación robótica en entornos industriales: el modelo puede integrarse en líneas de montaje donde se requiera introducir piezas en contenedores o cajas en movimiento, aprovechando su capacidad de seguir objetos con trayectoria dinámica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo fine-tunear GR00T N1.7 sobre tareas específicas con pocos episodios (60 demostraciones) usando LeRobot.
- Benchmarking de políticas robóticas: permite comparar el rendimiento de GR00T frente a otras arquitecturas (ACT, Diffusion Policy, etc.) en la misma tarea y con el mismo robot.
- Desarrollo de robots colaborativos (cobots): el robot `so_follower` puede desplegarse en entornos de colaboración humano-robot donde deba recoger y colocar objetos en movimiento.
- Validación de pipelines de entrenamiento: el repositorio documenta el flujo completo de registro de datos, entrenamiento y rollout, útil para equipos que quieran replicar el proceso con sus propios datasets.
- Educación y prototipado en robótica: investigadores y estudiantes pueden cargar la política con `lerobot-rollout` y ejecutarla en hardware compatible para experimentar con control basado en visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas de tasa de éxito, trials ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Con 3,14B parámetros en precisión FP32, el peso del modelo ocupa aproximadamente 12,6 GB; se recomienda al menos 16 GB de VRAM para inferencia en FP16/BF16, o cuantización a 8 bits para reducir el consumo.
- GPU recomendadas: tarjetas con 16 GB o más de VRAM, como RTX 4090, A100 (40/80 GB) o H100. Para entrenamiento (60.000 pasos con batch size 64), se requiere una GPU de datacenter o varias GPUs consumer.
- Compatibilidad con GPU consumer: sí, una RTX 4090 o similar puede ejecutar inferencia, aunque el entrenamiento completo puede resultar lento sin hardware de datacenter.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la política en el robot; también es posible cargar los pesos safetensors con PyTorch y ejecutar inferencia fuera del ecosistema LeRobot.
- Latencia y throughput: no disponibles en la documentación. Dependerán del hardware, la cuantización y la frecuencia de control requerida por el robot (el dataset se grabó a 30 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaKTEC/2608_moving_box_01_00test_GR00T17 | 3,14B | no disponible | Manipulación (cubo en caja móvil) | apache-2.0 | HuggingFace |
| kaKTEC/2608_static01_01test_GR00T17 | no disponible | no disponible | Manipulación estática (variante del mismo autor) | apache-2.0 | HuggingFace |
| GR00T N1.7 (modelo base) | no disponible | no disponible | Razonamiento y habilidades robóticas generales | no disponible | GitHub NVIDIA Isaac-GR00T |

La comparativa se limita a las variantes del mismo autor y al modelo base, ya que no se dispone de información sobre otras políticas GR00T fine-tuneadas con la misma tarea. El modelo base GR00T N1.7 es el fundacional del que deriva esta instancia, por lo que esta política es una especialización para una tarea concreta.

## Limitaciones y advertencias

- Sin resultados de evaluación: la model card no reporta tasa de éxito ni trials en robot real, por lo que el rendimiento efectivo de la política es desconocido.
- Especialización extrema: el modelo está entrenado para una única tarea ("Put a white cube into the moving box") y no generalizará a otras tareas sin fine-tuning adicional.
- Dependencia del hardware: las observaciones requieren dos cámaras específicas (superior y muñeca) con resoluciones y FPS concretos; cambios en la configuración del robot o las cámaras pueden degradar el rendimiento.
- Dataset limitado: solo 60 episodios de demostración, lo que puede provocar sobreajuste a las condiciones específicas de captura (iluminación, posición de objetos, distracciones).
- Riesgo de alucinación en acciones: como toda política de aprendizaje por imitación, puede ejecutar acciones incorrectas o inseguras ante situaciones fuera de distribución.
- Sin soporte de lenguaje en inferencia: aunque el modelo base GR00T N1.7 acepta instrucciones en lenguaje, esta instancia fine-tuneada no documenta el uso de prompts de texto durante el rollout.
- Licencia apache-2.0: permite uso comercial, pero el usuario debe verificar que el dataset de entrenamiento (kaKTEC/2608_moving_box_01_00test_20260817_143324) no tenga restricciones adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kaKTEC/2608_moving_box_01_00test_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/kaKTEC/2608_moving_box_01_00test_20260817_143324
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kaKTEC/2608_moving_box_01_00test_20260817_143324
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Variante estática del mismo autor: https://huggingface.co/kaKTEC/2608_static01_01test_GR00T17
