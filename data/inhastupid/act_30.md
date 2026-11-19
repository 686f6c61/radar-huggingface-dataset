# inhastupid/act_30

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de composición acumulado y suele lograr tasas de éxito elevadas en tareas de manipulación. Este repositorio concreto, `inhastupid/act_30`, es una política entrenada con LeRobot sobre el dataset `inhastupid/pick_place_100` para la tarea "Pick the object and place it on the target" con un robot de tipo `so_follower` y una única cámara cenital.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, con pesos en formato safetensors. Consume observaciones de estado de 6 dimensiones y una imagen RGB de 3x480x640 a 30 FPS, y produce acciones de 6 dimensiones. Es, por tanto, una política de robótica de extremo a extremo, no un modelo de lenguaje: no procesa ni genera texto.

Su relevancia es práctica para quien trabaje con brazos tipo SO-100/SO-101 y quiera un punto de partida reproducible de imitación visual-motora. La información publicada es escasa: no hay licencia declarada, no hay idiomas aplicables, no se han publicado resultados de evaluación y el entrenamiento se limita a 10.000 pasos con batch de 8 sobre 100 episodios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de un solo paso con historial interno del transformer) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica sin salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Cámaras | `top` (1 cámara) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.top`, shape `(3, 480, 640)` |
| Salida de acción | `action`, shape `(6,)` |
| Frecuencia de datos | 30 FPS |
| Pasos de entrenamiento | 10.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un transformer que aprende una política de imitación a partir de demostraciones teleoperadas. En lugar de predecir una acción por paso, predice un chunk de acciones futuras, lo que mitiga el problema de error de composición de políticas paso a paso y permite un control más suave. La arquitectura combina un codificador visual (procesa la imagen de la cámara `top` a 480x640) con un codificador de estado (vector de 6 dimensiones) y un decodificador transformer que emite el chunk de acciones de 6 dimensiones. El modelo sigue el paper arXiv:2304.13705 (Zhao et al., "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware").

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `inhastupid/pick_place_100`: 100 episodios, 60.000 frames a 30 FPS, una única tarea ("Pick the object and place it on the target"). La configuración es modesta: 10.000 pasos, batch de 8, AdamW con learning rate 1e-05 y semilla 1000. No se documenta en la model card si hubo aumento de datos, variaciones de iluminación, posiciones de objetos o distractores, ni si se aplicó alguna forma de regularización específica (por ejemplo, temporal ensembling en inferencia). Tampoco se indica el número de tokens de entrenamiento (no aplica en el sentido de LLM) ni composición del dataset más allá de la tarea única.

## Capacidades

- Control robótico de manipulación pick-and-place: dado un estado de 6 dimensiones y una imagen cenital, predice acciones de 6 dimensiones para el robot `so_follower`.
- Aprendizaje por imitación visual-motora: reproduce la tarea demostrada en teleoperación ("Pick the object and place it on the target").
- Predicción de chunks de acción: genera secuencias cortas de acciones, lo que reduce el error acumulado frente a políticas paso a paso.
- Ejecución en tiempo real a 30 FPS: coherente con la frecuencia de los datos de entrenamiento.
- Integración con el ecosistema LeRobot: se ejecuta mediante `lerobot-rollout` y se reentrena con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código, visión general, audio ni texto. Es exclusivamente una política de robótica.

## Casos de uso

- Automatización de pick-and-place en laboratorio: usar la política para recoger un objeto y depositarlo en una diana con un brazo SO-100/SO-101 y una cámara cenital, como base reproducible para experimentos de imitación.
- Punto de partida para fine-tuning con datos propios: reentrenar con `lerobot-train` sobre un dataset propio de la misma tarea para adaptar la política a nuevos objetos, posiciones o iluminación.
- Benchmark interno de imitación visual-motora: comparar la tasa de éxito de esta política con variantes entrenadas con más pasos, más episodios o mayor resolución de imagen.
- Docencia y formación en robótica de imitación: ejemplo completo y ligero (0,2 GB, 51,7 M de parámetros) para enseñar el flujo teleoperación-dataset-entrenamiento-despliegue con LeRobot.
- Pruebas de integración de hardware: validar la cadena cámara-robot-control con `lerobot-rollout` antes de invertir en datasets mayores.
- Generación de datos sintéticos de evaluación: ejecutar la política en simuladores o entornos controlados para estudiar robustez ante cambios de posición del objeto o de la cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de tareas, ensayos, éxitos ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos safetensors de 0,2 GB, la inferencia en FP32 requiere aproximadamente 0,2 GB de pesos más activaciones de la imagen 3x480x640 y del transformer, por lo que en la práctica cabe en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; una A100 o H100 no aporta ventaja para este tamaño de modelo.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del repositorio (0,2 GB).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=inhastupid/act_30`), integración con el stack de Hugging Face y PyTorch. No se documentan exportaciones a ONNX, TensorRT, llama.cpp, vLLM, TGI ni Ollama (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. La frecuencia de control de referencia es 30 FPS (33 ms por paso), coherente con los datos de entrenamiento, pero no se publica latencia medida en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `inhastupid/act_30` (este) | 51,7 M | Estado (6,) + imagen 3x480x640, 30 FPS | Pick-and-place con `so_follower` | no disponible | Hugging Face, LeRobot |
| ACT original (paper arXiv:2304.13705) | no disponible en la información | Bimanual con cámaras múltiples | Manipulación fina bimanual | no disponible | Paper y código de referencia |
| Políticas LeRobot ACT genéricas | variable | variable según dataset | Tareas de imitación diversas | variable | Hugging Face, LeRobot |

No se dispone de datos de benchmarks ni de modelos comparables con métricas publicadas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "[More Information Needed]" en el campo License; no se puede asumir uso comercial sin consultar al autor.
- Sin resultados de evaluación: no hay evidencia publicada de tasa de éxito en robot real, ni de robustez ante cambios de posición, iluminación o distractores.
- Dataset muy específico: 100 episodios y una única tarea ("Pick the object and place it on the target") con un único tipo de robot (`so_follower`) y una única cámara (`top`); la generalización a otros objetos, entornos o robots es incierta.
- Entrenamiento corto: 10.000 pasos con batch de 8 y learning rate 1e-05; puede estar infraentrenado para la tarea o sobreajustado a las condiciones de recogida de datos.
- Dependencia de la configuración de cámara: los nombres de cámara deben coincidir con las claves de observación (`observation.images.top`) y la resolución debe ser 480x640 a 30 FPS; desviaciones pueden degradar el rendimiento.
- Sin capacidades de texto, código, razonamiento ni multilingüismo: no es un modelo de lenguaje y no debe evaluarse como tal.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: como toda política de imitación, puede producir trayectorias que parecen razonables pero fallan en el contacto físico; requiere supervisión y parada de emergencia en producción.
- Sin información sobre sesgos del dataset: no se documenta la distribución de posiciones, objetos, iluminación ni posibles sesgos de recogida de datos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inhastupid/act_30
- Dataset de entrenamiento: https://huggingface.co/datasets/inhastupid/pick_place_100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=inhastupid/pick_place_100
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
