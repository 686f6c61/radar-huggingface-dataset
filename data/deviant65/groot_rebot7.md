# Deviant65/groot_rebot7

## Resumen

`Deviant65/groot_rebot7` es una política de robótica entrenada con LeRobot que implementa el modelo fundacional GR00T N1.7 de NVIDIA para control de un brazo robótico concreto, el `rebot_b601_follower`. El modelo consume el estado de las articulaciones (7 dimensiones) y dos flujos de vídeo de cámaras RealSense (D415 y D405, a 480x640) y produce comandos de acción de 7 dimensiones. Se trata de un ajuste fino específico sobre la arquitectura GR00T, no de un modelo de lenguaje general.

La relevancia de esta ficha es acotada: es un artefacto de investigación reproducido por un usuario individual (`Deviant65`), con cero descargas y cero likes en el momento de la consulta, y sin resultados de evaluación publicados. Su interés técnico reside en que ejemplifica el flujo completo de imitación robótica con LeRobot sobre la base GR00T N1.7, que combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones por flow matching.

El modelo tiene 3.144.016.000 parámetros según los pesos en safetensors y ocupa 9,3 GB en el repositorio. La tarea aprendida es única y muy concreta: "Pick up the blue box, then return the arm to the home position". No debe confundirse con un modelo de propósito general ni con el GR00T base de NVIDIA, sino con una política de imitación especializada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en el ejemplo de uso) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7 de NVIDIA: un backbone visión-lenguaje basado en Cosmos-Reason2/Qwen3-VL que procesa las observaciones visuales y la instrucción en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera las acciones condicionadas por visión, lenguaje y propiocepción. Las entradas son `observation.state` de forma `(7,)`, dos imágenes `observation.images.d415` y `observation.images.d405` de forma `(3, 480, 640)`, y la salida es `action` de forma `(7,)`. El robot objetivo es `rebot_b601_follower` con cámaras RealSense D415 y D405.

El ajuste fino se realizó con LeRobot 0.7.1 sobre el dataset `Deviant65/rebot_7_20261113_170749`, compuesto por 38 episodios y 29.910 frames a 30 FPS, con una única tarea de recogida de una caja azul y retorno a posición home. La configuración de entrenamiento fue: 20.000 pasos, batch size 16, optimizador AdamW, learning rate 0,0001 y semilla 42. No se documenta composición adicional del dataset, uso de RLHF/DPO ni innovaciones técnicas propias más allá de las del modelo base GR00T.

## Capacidades

- Control robótico de imitación para una tarea concreta: recoger una caja azul y volver a la posición home.
- Percepción visual multimodal a partir de dos cámaras RGB (D415 y D405) a 480x640.
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como texto en el rollout).
- Fusión de propiocepción (estado de 7 articulaciones) con visión y lenguaje.
- Generación de acciones continuas de 7 dimensiones mediante flow matching.
- Ejecución de políticas en tiempo real a 30 FPS mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni audio.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política puede ejecutar la secuencia de recogida de una caja azul y retorno a home sobre un `rebot_b601_follower`, útil como base para experimentos de manipulación con dos cámaras.
- Reproducción de experimentos de imitación con LeRobot: sirve como referencia para validar el pipeline `lerobot-train` con `--policy.type=groot` y comparar configuraciones de entrenamiento (pasos, batch, learning rate).
- Prototipado de control visual servo: al consumir dos vistas simultáneas (D415 de campo amplio y D405 de corto alcance), permite estudiar fusión de cámaras en tareas de agarre.
- Docencia y formación en robótica de imitación: el repositorio incluye comandos de rollout y entrenamiento listos para usar, lo que facilita prácticas guiadas sobre GR00T N1.7.
- Base para fine-tuning en tareas similares: al estar entrenado sobre un robot y cámaras concretos, puede servir de inicialización para variantes del mismo montaje con nuevos objetos o posiciones.
- Evaluación de robustez ante cambios de iluminación o posición: útil para medir la degradación de una política de imitación con solo 38 episodios cuando varían las condiciones del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas de robótica comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144 millones de parámetros en safetensors y 9,3 GB de repositorio, una estimación orientativa en FP16 sería de al menos ~6,3 GB solo para pesos, más overhead del backbone visual y del transformer de acciones; no se confirma en la documentación.
- GPU recomendadas: no disponible. El comando de entrenamiento de LeRobot usa `--policy.device=cuda`, lo que implica GPU NVIDIA, pero no se especifica modelo concreto.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos, previsiblemente sí en GPUs con 12-16 GB o más en FP16, pero no hay dato oficial.
- Opciones de despliegue: `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento), ambos de la librería LeRobot 0.7.1. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. La captura de datos es a 30 FPS, pero no se indica la latencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deviant65/groot_rebot7 | 3.144.016.000 | no disponible | Pick-and-place sobre rebot_b601_follower | no disponible | Hugging Face, 0 descargas |
| GR00T N1.7 (NVIDIA, base) | no disponible | no disponible | Modelo fundacional cross-embodiment para humanoides | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot del Hub | variable | no aplicable | Tareas de imitación específicas por robot | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea y un único robot (`rebot_b601_follower`); no es un modelo de propósito general.
- Solo 38 episodios y 29.910 frames de entrenamiento, lo que limita la generalización a nuevas posiciones, iluminación u objetos.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real de la política.
- Licencia no especificada ("[More Information Needed]"), lo que impide confirmar el uso comercial.
- Idiomas no declarados; el condicionamiento por lenguaje se ejemplifica en inglés.
- Riesgo de sobreajuste al montaje de cámaras concreto (D415 y D405 a 480x640 y 30 FPS); cambiar la configuración de cámaras puede invalidar la política.
- Sin datos de sesgos, alucinación o robustez fuera de la distribución de entrenamiento.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validación por terceros.
- El modelo base GR00T N1.7 es de NVIDIA; esta ficha describe un ajuste fino de usuario, no el modelo oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deviant65/groot_rebot7
- Dataset de entrenamiento: https://huggingface.co/datasets/Deviant65/rebot_7_20261113_170749
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Deviant65/rebot_7_20261113_170749
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot de GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
