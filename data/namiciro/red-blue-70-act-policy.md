# namiciro/red-blue-70-act-policy

## Resumen

`namiciro/red-blue-70-act-policy` es una política de imitación basada en Action Chunking with Transformers (ACT) para control robótico, publicada en Hugging Face por el usuario namiciro. No es un modelo de lenguaje: es un modelo de robótica que consume observaciones (una imagen de cámara frontal y el estado de las articulaciones) y produce acciones de control de bajo nivel para un robot manipulador tipo `so_follower` (SO-100/SO-101 de LeRobot). El modelo se ha entrenado con 70 episodios de demostraciones teleoperadas para dos tareas concretas de manipulación de bloques.

La relevancia de esta ficha es acotada: se trata de un modelo pequeño (51.668.614 parámetros), de ámbito doméstico y sin evaluación publicada. Sirve como ejemplo canónico de cómo se empaqueta una política ACT con LeRobot 0.7.1 y como punto de partida reproducible para entrenar políticas propias con hardware de bajo coste. No debe confundirse con un modelo fundacional de robótica: es una política especializada en dos tareas y un único montaje de cámara y robot.

La arquitectura es ACT, un transformer que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza la ejecución. El contexto no es textual: la ventana de observación es una imagen de 480×640 píxeles y un vector de estado de 6 dimensiones, con salida de 6 dimensiones de acción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); observación de 1 imagen 3×480×640 + estado de 6 dimensiones |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje; las tareas se especifican como cadenas de texto) |
| Licencia | no disponible (la model card indica «More Information Needed») |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `front` (1 cámara) |
| Entrada (`observation.state`) | STATE, shape `(6,)` |
| Entrada (`observation.images.front`) | VISUAL, shape `(3, 480, 640)` |
| Salida (`action`) | ACTION, shape `(6,)` |
| Dataset de entrenamiento | `namiciro/red-to-right-v2` |
| Episodios / frames | 70 episodios, 30.440 frames, 30 FPS |
| Pasos de entrenamiento | 40.000 |
| Batch size / optimizador / LR | 8 / AdamW / 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador visual (procesa la imagen de la cámara frontal), un codificador del estado de las articulaciones y un transformer que genera *chunks* de acciones de longitud fija. Predecir varios pasos de acción de golpe, en lugar de uno solo, mitiga el problema de acumulación de error típico de las políticas paso a paso y permite un control más suave. El modelo incluye además una componente de estilo CVAE (variable latente) que captura la variabilidad de las demostraciones humanas, aunque la model card no detalla su configuración concreta.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `namiciro/red-to-right-v2`: 70 episodios teleoperados, 30.440 frames a 30 FPS, para dos tareas («Put the red block in the right box» y «Put the blue block in the left box»). Se ejecutaron 40.000 pasos con batch size 8, AdamW y learning rate 1e-05, semilla 1000. No se documenta el número de tokens de entrenamiento (no aplica), ni el uso de RLHF/DPO (no es un modelo de lenguaje), ni innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa ni entorno simulado).
- Predicción de *chunks* de acciones para ejecución estable y suave.
- Percepción visual monocular: usa una única cámara frontal a 480×640.
- Condicionamiento por tarea en lenguaje natural: acepta cadenas como «Put the red block in the right box» para seleccionar el comportamiento.
- Ejecución en bucle cerrado a 30 FPS con LeRobot (`lerobot-rollout`).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: no es un modelo de lenguaje.
- Capacidades multilingües: no aplica; las tareas se definen en inglés en el dataset.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: el modelo ejecuta las dos tareas entrenadas (bloque rojo a caja derecha, bloque azul a caja izquierda) sobre un SO-100/SO-101 con cámara frontal, útil para validar pipelines de imitación antes de escalar a tareas propias.
- **Reproducción de experimentos de ACT**: sirve como referencia reproducible de un entrenamiento ACT con LeRobot 0.7.1 (40.000 pasos, batch 8, LR 1e-05) para comparar hiperparámetros y curvas de aprendizaje.
- **Base para *fine-tuning* con pocos datos**: al ser una política pequeña (51,7 M de parámetros) y un repo de 0,2 GB, se puede reentrenar con un dataset propio de decenas de episodios en una GPU de consumo.
- **Docencia y formación en robótica de imitación**: ejemplo completo de flujo teleoperación → dataset → entrenamiento → *rollout* con comandos `lerobot-train` y `lerobot-rollout`.
- **Pruebas de integración de hardware**: permite verificar calibración de brazos, índices de cámara y puertos serie antes de invertir en datasets mayores.
- **Evaluación comparativa de políticas ACT**: punto de partida para medir tasas de éxito en dos tareas concretas frente a políticas entrenadas con más episodios o con aumentos de datos.
- **Prototipado de demos en ferias o aulas**: ejecución de 60 segundos con `--duration=60` sobre hardware de bajo coste para demostraciones en vivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet», y no incluye tabla de tareas, ensayos ni tasas de éxito en robot real. Tampoco se dispone de métricas de pérdida de entrenamiento ni de curvas de validación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: muy baja; con 51,7 M de parámetros en safetensors (aproximadamente 0,2 GB en fp32) la inferencia cabe holgadamente en cualquier GPU con 2-4 GB de VRAM. No se documentan versiones cuantizadas.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella real es la latencia de la cámara y del bus del robot, no el cómputo.
- **GPU de consumo**: sí, cabe en tarjetas de gama baja e incluso podría ejecutarse en CPU para inferencia, aunque no se documenta latencia en CPU.
- **Despliegue**: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. El control opera a 30 FPS según el dataset, pero no se publica latencia por paso ni tasa de éxito.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `namiciro/red-blue-70-act-policy` | 51,7 M | ACT (imitación) | Imagen 3×480×640 + estado 6D | no disponible | Hugging Face (LeRobot) |
| `namiciro/red-to-right-act-policy` | no disponible | ACT (imitación) | Imagen + estado (mismo robot) | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de referencia de LeRobot | variable | ACT (imitación) | Imagen + estado | según repo | Hugging Face / GitHub LeRobot |
| Políticas Diffusion Policy (LeRobot) | variable | Difusión (imitación) | Imagen + estado | según repo | Hugging Face / GitHub LeRobot |

No se dispone de datos de rendimiento comparables (tasas de éxito, latencia) para ninguno de los modelos de la tabla en la información proporcionada; la comparación se limita a parámetros, tipo de arquitectura y disponibilidad.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar que la política funcione de forma fiable en robot real.
- **Especialización extrema**: solo cubre dos tareas («Put the red block in the right box» y «Put the blue block in the left box») y un único robot `so_follower` con una cámara `front`.
- **Sesgo de dataset**: 70 episodios y 30.440 frames son un volumen reducido; la política heredará los sesgos de posiciones, iluminación y disposición de objetos de las demostraciones.
- **Riesgo de sobreajuste y alucinación motora**: al ser imitación pura, puede generar acciones plausibles pero incorrectas ante objetos o configuraciones no vistas, sin mecanismo de verificación.
- **Licencia no especificada**: la model card indica «More Information Needed», por lo que no se puede garantizar el uso comercial; conviene contactar con el autor antes de desplegarlo en producción.
- **Dependencia de la versión de LeRobot**: entrenado con LeRobot 0.7.1; cambios de API en versiones posteriores pueden romper la carga del *checkpoint* o los nombres de las claves de observación.
- **Sin soporte de lenguaje natural general**: el condicionamiento por tarea es una cadena fija; no interpreta instrucciones nuevas ni razona sobre ellas.
- **Hardware frágil**: la ejecución depende de la calibración del robot, del índice de cámara y del puerto serie; pequeñas desviaciones degradan el comportamiento sin aviso.
- **Sin cuantizaciones documentadas**: no hay versiones GGUF ni ONNX publicadas, lo que limita el despliegue en entornos sin PyTorch/CUDA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namiciro/red-blue-70-act-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/namiciro/red-to-right-v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=namiciro/red-to-right-v2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/*rollout*: https://huggingface.co/docs/lerobot/main/en/inference
- Política relacionada del mismo autor: https://huggingface.co/namiciro/red-to-right-act-policy
