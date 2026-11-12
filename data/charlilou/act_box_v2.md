# charlilou/act_box_v2

## Resumen

`charlilou/act_box_v2` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor entrenado para una tarea robótica concreta, "Put the red box in the green zone" (introducir una caja roja en una zona verde), sobre un robot de tipo `so_follower` (familia SO-101). El modelo consume el estado articular de 6 dimensiones y dos cámaras RGB de 480x640 (vista superior y vista de muñeca), y produce un vector de acción de 6 dimensiones.

El interés técnico está en que ACT predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación de contacto. El modelo tiene 51.668.614 parámetros en formato safetensors, un tamaño de repositorio de 0,2 GB y fue entrenado durante 12.000 pasos con un batch de 16 sobre un dataset de 61 episodios y 20.172 fotogramas a 30 FPS.

Se trata de un artefacto muy específico: una política de un solo task, sin licencia declarada, sin resultados de evaluación publicados y sin idiomas aplicables. Su relevancia es práctica para quien replique el montaje hardware SO-101 y quiera un punto de partida funcional o una referencia de entrenamiento ACT en LeRobot 0.7.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de robot | `so_follower` |
| Cámaras | `top`, `wrist` (RGB, 3x480x640 cada una) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de acción | `action` de forma (6,) |
| Dataset de entrenamiento | `charlilou/so101_box_v2` (61 episodios, 20.172 frames, 30 FPS) |
| Pasos de entrenamiento | 12.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador visual (típicamente ResNet) para procesar las dos cámaras y un decodificador que genera secuencias de acciones de longitud fija (chunks). La innovación central del método, descrita en el paper arXiv:2304.13705, es predecir varios pasos de acción de una vez y agregarlos temporalmente, lo que mitiga el problema de *compounding error* de las políticas paso a paso y permite ejecutar movimientos suaves en robots de bajo coste. El modelo también incorpora una predicción auxiliar de estilo CVAE para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.7.1 sobre 61 episodios teleoperados (20.172 frames a 30 FPS) del dataset `charlilou/so101_box_v2`, con 12.000 pasos, batch 16, AdamW y learning rate 1e-5. No se documenta composición del dataset más allá del task único, ni uso de RLHF/DPO (no aplica a este tipo de política), ni aumentos de datos, ni detalles del backbone visual. Tampoco se especifica la longitud del chunk de acciones ni el número de capas del transformer.

## Capacidades

- Control visomotor de manipulación: mapea observaciones (estado de 6 articulaciones + dos imágenes RGB) a comandos de acción de 6 dimensiones.
- Ejecución de una tarea única y concreta: "Put the red box in the green zone".
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa ni entorno simulado).
- Predicción de action chunks, lo que aporta suavidad y robustez frente a ruido en las observaciones.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking: es una política robótica, no un modelo generativo de propósito general.

## Casos de uso

- Replicación de un pipeline de imitación end-to-end: sirve como referencia para validar la instalación de LeRobot 0.7.1, la calibración del robot `so_follower` y la configuración de las cámaras `top` y `wrist` antes de entrenar políticas propias.
- Recogida de objetos en zona designada: el caso directo es mover una caja roja a una zona verde; útil como banco de pruebas para evaluar precisión de agarre y posicionamiento con un robot de bajo coste.
- Base para fine-tuning con nuevos objetos o posiciones: al estar entrenado con 61 episodios, es un punto de partida razonable para añadir variaciones (otra caja, otra zona) con un dataset propio y el mismo comando `lerobot-train`.
- Docencia y divulgación en robótica: permite mostrar el ciclo completo teleoperación -> dataset -> entrenamiento ACT -> despliegue en un robot real en pocas horas.
- Evaluación comparativa de métodos de imitación: sirve como baseline ACT frente a Diffusion Policy o VQ-BeT sobre el mismo dataset y hardware.
- Pruebas de robustez ante cambios de iluminación o fondo: al depender de dos cámaras RGB, es útil para medir la sensibilidad de ACT a condiciones visuales distintas de las de entrenamiento.
- Automatización de una celda de pick-and-place sencilla: si la tarea se limita a mover un objeto concreto a una zona fija, la política puede integrarse en un bucle de control a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de trials/success rate vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM necesaria la dominan los dos streams de vídeo a 480x640 y el backbone visual, no el transformer.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con al menos 4-8 GB de VRAM debería ser suficiente para inferencia; para entrenamiento con batch 16 se recomienda una GPU dedicada (RTX 3090/4090 o superior).
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del repositorio (0,2 GB) y el número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=charlilou/act_box_v2`); no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. La política se ejecuta en bucle cerrado con cámaras a 30 FPS, pero el autor no publica latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| charlilou/act_box_v2 | ACT (LeRobot) | 51,7 M | no aplica | no disponible | Hugging Face Hub |
| Políticas ACT de LeRobot (referencia) | ACT (LeRobot) | variable según backbone | no aplica | según repo | Hugging Face / GitHub |
| Diffusion Policy | Política de difusión | no disponible | no aplica | según implementación | Repos académicos |
| VQ-BeT | Política discreta | no disponible | no aplica | según implementación | Repos académicos |

No se dispone de datos de rendimiento comparables publicados para este checkpoint concreto; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "[More Information Needed]" en el campo License; no se puede asumir uso comercial sin consultar al autor.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no se puede afirmar que la política funcione de forma fiable en robot real.
- Tarea única y altamente específica: solo "Put the red box in the green zone" sobre un robot `so_follower` con cámaras `top` y `wrist`; no generaliza a otros objetos, posiciones ni robots.
- Dataset pequeño: 61 episodios y 20.172 frames; riesgo alto de sobreajuste a posiciones, iluminación y fondo del entorno de grabación.
- Dependencia del hardware exacto: cambios en la calibración, en la montura de las cámaras o en el robot degradan el rendimiento sin aviso.
- Riesgo de alucinación en sentido figurado: al ser una política de imitación, puede generar acciones fuera de distribución ante observaciones no vistas, con riesgo físico para el entorno.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje; no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Idiomas no disponibles: irrelevante para su función, pero conviene no confundirlo con un modelo generativo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlilou/act_box_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/charlilou/so101_box_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlilou/so101_box_v2
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
