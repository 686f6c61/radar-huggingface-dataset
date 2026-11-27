# SamShumChun/lerobot_sayhi_pose_b

## Resumen

`lerobot_sayhi_pose_b` es una política de imitación (imitation learning) entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador robótico que, a partir de una observación compuesta por el estado de las articulaciones (`observation.state`, 6 dimensiones) y una imagen de cámara frontal de 720x1280 píxeles, predice un vector de acción de 6 dimensiones. Lo desarrolla el usuario SamShumChun y está pensado para el robot `so_follower` (el seguidor del brazo SO-100/SO-101 del ecosistema LeRobot).

El modelo resuelve una tarea concreta: ejecutar el gesto de saludo asociado a la tarea denominada "SaiHi". Se entrenó sobre un dataset propio de 30 episodios y 13.017 fotogramas grabados a 30 FPS, con 40.000 pasos de entrenamiento, batch de 8 y optimizador AdamW con tasa de aprendizaje 1e-4. El checkpoint ocupa unos 0,2 GB y contiene 51.668.614 parámetros en formato safetensors.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos con teleoperación, entrenamiento de ACT y despliegue con `lerobot-rollout`). No es un modelo generalista ni compite con LLM o VLM; es una política de control visuomotor de un solo task y un solo robot, con licencia Apache 2.0 y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de trozos de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se fija como cadena "SaiHi" en tiempo de inferencia) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Robot | `so_follower` |
| Camaras | `front` (3, 720, 1280) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Dataset de entrenamiento | SamShumChun/lerobot_sayhi_dataset_a_20261114_124837 |
| Episodios / fotogramas | 30 episodios / 13.017 fotogramas a 30 FPS |
| Pasos de entrenamiento | 40.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución en robots reales. La arquitectura combina un codificador visual (procesa la imagen de la cámara `front` a 720x1280) con un transformer que consume también el estado de 6 dimensiones y genera un chunk de acciones de 6 dimensiones. El modelo se entrena con aprendizaje supervisado sobre demostraciones teleoperadas, sin RLHF ni DPO.

El entrenamiento se realizó con LeRobot 0.6.2 durante 40.000 pasos, batch de 8, AdamW y learning rate 0.0001, semilla 1000. El dataset contiene 30 episodios y 13.017 fotogramas a 30 FPS de la tarea "SaiHi". No se documentan aumentos de datos, composición demográfica ni estrategias de regularización adicionales. La model card no aporta detalles sobre la inicialización de pesos del codificador visual ni sobre el número exacto de capas del transformer.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` a partir de imagen frontal y estado articular de 6 dimensiones.
- Predicción de chunks de acción de 6 dimensiones para ejecución continua a 30 FPS.
- Ejecución de la tarea de saludo "SaiHi" sobre el robot y la configuración de cámara para los que fue entrenado.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Demostración reproducible de un pipeline de imitación: sirve para validar la instalación de LeRobot, la calibración del `so_follower` y la cámara `front` antes de escalar a tareas más complejas.
- Prueba de concepto de saludo robótico en ferias o demos: el modelo ejecuta el gesto "SaiHi" durante un tiempo acotado con `--duration=60`, adecuado para exhibiciones controladas.
- Base para fine-tuning: al ser Apache 2.0 y estar en safetensors, se puede reentrenar con `lerobot-train` sobre un dataset propio para adaptar el gesto a otro saludo o a otra posición inicial.
- Validación de hardware y latencia: permite medir el rendimiento de inferencia en la GPU disponible antes de invertir en datasets mayores.
- Referencia educativa: útil en cursos de robótica de imitación para mostrar el flujo teleoperación -> dataset -> ACT -> rollout.
- Benchmark interno de recogida de datos: los 30 episodios y 13.017 fotogramas sirven como línea base para comparar la calidad de nuevas grabaciones.
- Integración en un banco de pruebas de políticas: se puede cargar junto a otras políticas LeRobot para comparar estabilidad del chunking en el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni condiciones de evaluación documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM vendrá dominada por el codificador visual y los buffers de imagen a 720x1280.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, cualquier GPU consumer con soporte CUDA (por ejemplo, RTX 3060 en adelante) debería poder ejecutar la política; no se confirma en la model card.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint (0,2 GB), aunque no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=SamShumChun/lerobot_sayhi_pose_b`; entrenamiento con `lerobot-train --policy.type=act`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según el dataset, pero no se publica latencia medida en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamShumChun/lerobot_sayhi_pose_b | 51.668.614 | no aplica | Saludo "SaiHi" en `so_follower` | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | no disponible | no aplica | Tareas de manipulación variables | Apache 2.0 (segun repo LeRobot) | Hugging Face / docs LeRobot |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | Manipulación visuomotora | Apache 2.0 (segun repo LeRobot) | Hugging Face / docs LeRobot |
| Políticas π0 / OpenVLA (VLA generalistas) | no disponible en esta ficha | no disponible | Manipulación guiada por lenguaje | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con 30 episodios de un único operador, la política hereda los sesgos de trayectoria, velocidad y posición inicial de esas demostraciones.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de generalización pobre fuera de la distribución de entrenamiento (posiciones, iluminación, objetos o robots distintos).
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje; la tarea se fija como cadena "SaiHi" y no admite instrucciones en lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado.
- Caveat para producción: no hay evaluación publicada, ni tasas de éxito, ni pruebas en robots distintos al `so_follower`; no debe desplegarse en entornos críticos sin una validación propia.
- Dependencia fuerte de la cámara `front` a 720x1280 y del estado de 6 dimensiones; cambiar la resolución, el índice de cámara o la morfología del robot invalida el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamShumChun/lerobot_sayhi_pose_b
- Dataset de entrenamiento: https://huggingface.co/datasets/SamShumChun/lerobot_sayhi_dataset_a_20261114_124837
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamShumChun/lerobot_sayhi_dataset_a_20261114_124837
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
