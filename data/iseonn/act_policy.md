# iseonn/act_policy

## Resumen

`iseonn/act_policy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. El modelo aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y suele elevar la tasa de éxito en tareas de manipulación. Lo desarrolla el usuario iseonn y se distribuye a través de LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real.

El modelo está especializado en un único robot de tipo `so_follower` (SO-100/SO-101 de LeRobot) con dos cámaras (`wrist` y `top`) y una tarea concreta: "pickup1". Consume un vector de estado de 7 dimensiones y dos imágenes RGB de 480x640, y produce una acción de 7 dimensiones. Cuenta con 51.670.663 parámetros y un repositorio de 0,4 GB en formato safetensors.

Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento con ACT y despliegue con `lerobot-rollout`), y como punto de partida para quien quiera adaptar el método a su propio brazo robótico. No es un modelo de lenguaje ni un modelo multimodal general: es una política visuomotora de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer condicionado por observaciones visuales y de estado que predice chunks de acción |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa una ventana de observación por paso, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la instrucción de tarea se pasa como cadena `task="pickup1"`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer que, en cada paso de control, recibe las observaciones (estado del robot de 7 dimensiones y dos imágenes de 3x480x640) y predice un chunk de acciones futuras en lugar de una sola acción. Esta predicción por chunks mitiga el problema de la no estacionariedad en el aprendizaje por imitación (el "compounding error") y suaviza el comportamiento en tiempo de ejecución. El modelo incorpora mecanismos propios del método original, como el uso de una CVAE (autoencoder variacional condicionado) para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `iseonn/am_arm_test`: 10 episodios, 9.411 frames a 30 FPS, una única tarea ("pickup1") y robot `so_follower`. La configuración reportada es de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documentan tokens, composición del dataset más allá de los episodios citados, ni etapas de RLHF/DPO (no aplicables a este tipo de política).

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` a partir de dos cámaras (`wrist` y `top`) y del estado articular de 7 dimensiones.
- Predicción de chunks de acción de 7 dimensiones (posición/acción del efector) para la tarea "pickup1".
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere recompensa ni entorno simulado.
- Ejecución en tiempo real a 30 FPS mediante `lerobot-rollout`.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación y despliegue con la CLI.
- No soporta tool calling, agentes, razonamiento multi-paso textual, visión general, audio ni capacidades multilingües.

## Casos de uso

- Recogida automatizada de objetos ("pickup1") en un brazo SO-100/SO-101: la política ejecuta la tarea entrenada a partir de las dos cámaras y el estado articular, con chunks de acción que reducen el jitter y mejoran la suavidad del movimiento.
- Reproducción de un pipeline de imitación completo: sirve como referencia para grabar un dataset propio con LeRobot, entrenar con `--policy.type=act` y desplegar con `lerobot-rollout`, validando cada etapa del flujo.
- Base para fine-tuning en una tarea nueva: al ser un checkpoint ACT de 51,7 M de parámetros, se puede reentrenar sobre un dataset distinto (por ejemplo, otra posición de objeto o un segundo brazo del mismo tipo) con coste computacional moderado.
- Banco de pruebas de hardware y calibración: útil para verificar cámaras, puertos y calibración del `so_follower` antes de escalar a datasets mayores, dado que el modelo es pequeño y la inferencia es ligera.
- Docencia y demostraciones de aprendizaje por imitación: ejemplo mínimo (10 episodios, 9.411 frames) para explicar ACT, CVAE y predicción por chunks en un curso o taller.
- Evaluación comparativa de métodos de imitación: punto de partida para contrastar ACT frente a otras políticas de LeRobot (por ejemplo, Diffusion Policy) sobre la misma tarea y el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de éxito, MMLU, HumanEval ni métricas comparables que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y dos imágenes de 480x640, el checkpoint cabe holgadamente en GPUs de consumo (órdenes de magnitud de pocos GB incluyendo activaciones y buffers de imagen).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA viable para LeRobot; una RTX 4090 o superior ofrece margen amplio para entrenamiento e inferencia a 30 FPS. Para entrenamiento, se documenta `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (51,7 M de parámetros); no se especifican modelos concretos ni mínimos oficiales.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), integración con el ecosistema LeRobot; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponibles; el dataset se grabó a 30 FPS, lo que da una referencia del ritmo de control esperado, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos comparables (parámetros, contexto, rendimiento, licencia) para establecer una comparativa fiable. Como referencia cualitativa, dentro de LeRobot existen otras políticas de imitación (por ejemplo, Diffusion Policy), pero no se dispone de sus especificaciones en esta ficha.

## Limitaciones y advertencias

- Entrenado sobre un dataset muy reducido (10 episodios, 9.411 frames) y una única tarea ("pickup1"); la generalización a otras tareas, posiciones de objeto o condiciones de iluminación es previsiblemente limitada.
- Sin resultados de evaluación en robot real: no hay evidencia publicada de tasa de éxito, por lo que no debe asumirse un rendimiento concreto en producción.
- Dependencia del hardware exacto: requiere robot `so_follower`, cámaras `wrist` y `top` con los mismos nombres de observación y resolución 480x640; cambios de calibración o de montaje pueden degradar el comportamiento.
- Riesgo de alucinación en el sentido de acciones incoherentes o fuera de distribución cuando la observación se aleja de los datos de entrenamiento; no hay mecanismo de seguridad ni de parada de emergencia incluido en el modelo.
- No procesa lenguaje natural ni instrucciones arbitrarias: la tarea se fija como cadena `task="pickup1"`; no es multilingüe ni multimodal general.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación de avisos; conviene revisar las condiciones de la librería LeRobot y del paper citado.
- Sesgos conocidos: no documentados; al tratarse de datos de teleoperación de un único operador y entorno, puede reproducir sesgos de trayectoria y de posicionamiento de ese operador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iseonn/act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/iseonn/am_arm_test
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=iseonn/am_arm_test
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
