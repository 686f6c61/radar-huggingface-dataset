# CyanMask/my_policy

## Resumen

CyanMask/my_policy es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada y publicada mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. El modelo consume el estado articular de un robot `so_follower` (vector de 6 dimensiones) junto con una imagen de cámara de muñeca de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Está diseñado para ejecutar la tarea concreta "Grab RED cube" (agarrar un cubo rojo).

El modelo cuenta con 51.668.614 parámetros (aproximadamente 51,7 millones) almacenados en formato safetensors, con un repositorio de 0,2 GB. Se entrenó durante 100.000 pasos con un tamaño de lote de 8, optimizador AdamW y una tasa de aprendizaje de 1e-5, sobre un único episodio de 1.794 fotogramas grabados a 30 FPS. La arquitectura subyacente es la descrita en el artículo ACT (arXiv:2304.13705), que predice fragmentos cortos de acciones en lugar de pasos individuales para mejorar la estabilidad y la tasa de éxito en tareas de manipulación.

La relevancia de esta ficha es limitada: se trata de un artefacto de prueba (el nombre del dataset, `record-test_...`, y el hecho de que tenga 0 descargas y 0 likes así lo indican) más que de un modelo listo para producción. No obstante, resulta útil como ejemplo canónico del flujo de trabajo de LeRobot y de las especificaciones típicas de una política ACT para robots SO-100/SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con la cadena "Grab RED cube") |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | CyanMask/record-test_20261126_132840 (1 episodio, 1.794 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Tamaño de lote | 8 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (típicamente un ResNet preentrenado) con un transformer encoder-decoder. La innovación principal frente a políticas paso a paso es la predicción de *action chunks*: en lugar de emitir una única acción por fotograma, el modelo genera una secuencia corta de acciones futuras, lo que reduce el error de acumulación y mejora la suavidad del movimiento. El modelo incluye además una cabeza de estilo CVAE durante el entrenamiento para modelar la multimodalidad de las demostraciones humanas, que se descarta en inferencia.

En este caso concreto, el entrenamiento se realizó sobre un único episodio de teleoperación de 1.794 fotogramas (aproximadamente 60 segundos a 30 FPS) para la tarea "Grab RED cube". Con 100.000 pasos y lote de 8, el modelo ha visto efectivamente el mismo episodio miles de veces, lo que supone un riesgo alto de sobreajuste y una diversidad de datos prácticamente nula. No se documenta el uso de RLHF, DPO ni aumentación de datos. La configuración corresponde a la versión 0.7.1 de LeRobot.

## Capacidades

- Control robótico de imitación para el robot `so_follower` con 6 grados de libertad en la salida de acción.
- Percepción visual monocular mediante una cámara de muñeca a 480x640 y 30 FPS.
- Predicción de fragmentos de acción (action chunking) para movimientos más suaves y estables.
- Ejecución de una tarea única y concreta: agarrar un cubo rojo.
- Integración con el ecosistema LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- **Prueba de extremo a extremo del pipeline de LeRobot**: sirve como referencia para verificar que la instalación, la calibración del robot SO-100/SO-101 y la conexión de la cámara funcionan antes de entrenar políticas propias.
- **Demostración educativa de ACT**: útil en talleres o tutoriales para mostrar cómo se graba un episodio, se entrena una política y se ejecuta en hardware real con `lerobot-rollout`.
- **Prototipado rápido de tareas de pick-and-place**: la tarea "Grab RED cube" es un caso mínimo de agarre que permite validar la cadena cinemática y la percepción antes de escalar a tareas más complejas.
- **Base para fine-tuning con datos propios**: el checkpoint puede reutilizarse como inicialización y reentrenarse con `lerobot-train` sobre un dataset mayor y más diverso para la misma morfología de robot.
- **Validación de infraestructura de inferencia en robótica**: permite medir latencia y throughput de una política ACT de ~52 M de parámetros en una GPU consumer antes de invertir en modelos mayores.
- **Referencia para comparativas de políticas**: al ser un artefacto reproducible con configuración documentada, sirve como línea base en experimentos internos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de pérdida o error de acción.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,7 M de parámetros en fp32, los pesos ocupan aproximadamente 0,2 GB; en fp16, unos 0,1 GB. Sumando activaciones del codificador visual a 480x640, la inferencia cabe holgadamente en 2-4 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente. Una RTX 3060, RTX 4060, RTX 4090 o incluso una Jetson Orin Nano pueden ejecutar la política en tiempo real a 30 FPS.
- **Cabe en GPU consumer**: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia a baja frecuencia.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`) es la vía oficial; también es posible exportar el modelo y servirlo con PyTorch nativo o TorchScript. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- **Latencia y throughput**: no disponibles en la información proporcionada. A 30 FPS, el presupuesto por fotograma es de 33 ms; una política ACT de este tamaño suele cumplirlo en GPU consumer, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyanMask/my_policy | 51,7 M | ACT (LeRobot) | Estado (6,) + imagen 480x640 | no disponible | Hugging Face (0 descargas) |
| Políticas ACT oficiales de LeRobot | ~50 M (típico) | ACT | Estado + imagen | Apache-2.0 (LeRobot) | Hugging Face / GitHub |
| Diffusion Policy (Chi et al.) | variable, típicamente 10-100 M | Difusión para acciones | Estado + imagen | MIT (implementación de referencia) | Repositorios académicos |
| SmolVLA (Hugging Face) | ~450 M | VLA (vision-language-action) | Estado + imagen + instrucción textual | Apache-2.0 | Hugging Face |

La comparativa se limita a nivel de categoría porque no hay benchmarks publicados para este checkpoint. Frente a Diffusion Policy, ACT es más ligero y rápido en inferencia; frente a SmolVLA, carece de condicionamiento por lenguaje y de generalización a múltiples tareas.

## Limitaciones y advertencias

- **Sobreajuste severo**: entrenado sobre un único episodio de 1.794 fotogramas; la generalización a posiciones, iluminación u objetos distintos es prácticamente nula.
- **Tarea única**: solo ejecuta "Grab RED cube"; no admite instrucciones en lenguaje natural ni cambio de objetivo.
- **Dependencia de hardware exacto**: asume un robot `so_follower` con 6 dimensiones de estado y acción y una cámara de muñeca concreta; cambios de morfología o calibración invalidan la política.
- **Sin evaluación**: no hay tasas de éxito medidas, por lo que se desconoce su fiabilidad real incluso en la tarea entrenada.
- **Licencia no especificada**: la model card indica "More Information Needed"; no se puede asumir uso comercial sin consultar al autor.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento, con posibles colisiones o daños al robot.
- **Sin soporte multilingüe ni de texto**: no es un modelo de lenguaje; no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- **Artefacto de prueba**: el nombre del dataset (`record-test_...`) y la ausencia de descargas sugieren que no está pensado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyanMask/my_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/CyanMask/record-test_20261126_132840
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=CyanMask/record-test_20261126_132840
- Artículo ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
