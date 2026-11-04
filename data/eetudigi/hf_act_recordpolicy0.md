# eetudigi/hf_act_recordpolicy0

## Resumen
`eetudigi/hf_act_recordpolicy0` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers) dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de imitación que, a partir de observaciones visuales y del estado de las articulaciones, predice directamente acciones motoras para un robot manipulador. El autor, `eetudigi`, lo ha publicado como artefacto de entrenamiento asociado a un dataset propio de teleoperación.

El modelo resuelve la tarea concreta de "agarrar el tapón amarillo" sobre un robot de tipo `so_follower` (una configuración de seguidor tipo SO-100/SO-101), usando dos cámaras (muñeca y vista superior) y un estado de 6 dimensiones. Su relevancia es limitada y muy específica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot, pero no como modelo de propósito general.

Técnicamente es un transformer pequeño (51.668.614 parámetros totales según los pesos en safetensors) que predice *chunks* de acciones en lugar de pasos individuales, lo que reduce el error acumulado en tareas de manipulación de corta duración. El repositorio ocupa 0,4 GB y el entrenamiento se realizó durante 10.000 pasos con batch size 8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones de un único paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las imágenes de las cámaras `wrist` y `top`, cada una de 3×480×640) con un transformer que fusiona esas representaciones con el estado de las articulaciones (`observation.state`, vector de 6 dimensiones) y genera un *chunk* de acciones futuras (`action`, vector de 6 dimensiones). Predecir varios pasos a la vez, en lugar de uno solo, es la innovación central del paper: reduce el error de compounding y suaviza la política en tareas de manipulación.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `eetudigi/record-test_20261104_175931`, compuesto por 25 episodios y 11.461 fotogramas a 30 FPS, todos correspondientes a la tarea "Grab the yellow cap". La configuración fue de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro sobre demostraciones teleoperadas.

## Capacidades
- Predicción de acciones motoras de 6 dimensiones para un robot `so_follower` a partir de dos cámaras y del estado articular.
- Aprendizaje por imitación de una única tarea: "Grab the yellow cap".
- Generación de *chunks* de acciones (no pasos aislados), lo que aporta suavidad y robustez temporal.
- Integración nativa con el CLI de LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No tiene modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso
- Reproducción de un pipeline de imitación de referencia: sirve para validar que la instalación de LeRobot, la calibración del robot `so_follower` y las cámaras funcionan antes de entrenar políticas propias.
- Recogida automatizada de objetos pequeños: la tarea de agarrar el tapón amarillo es representativa de *pick-and-place* de piezas ligeras en entornos controlados de laboratorio.
- Docencia y formación: ejemplo mínimo (25 episodios, 10.000 pasos) para explicar ACT, *action chunking* y el flujo de datos en LeRobot sin necesidad de grandes recursos.
- Base para *fine-tuning*: partir de estos pesos y reentrenar con un dataset propio de la misma tarea y robot para adaptar la política a nuevas posiciones de objeto o iluminación.
- Pruebas de integración hardware-software: verificar latencia de inferencia y sincronización de cámaras a 30 FPS en un robot de bajo coste antes de escalar a tareas más complejas.
- Benchmark interno de éxito de agarre: usar la política como línea base contra la que comparar variantes (más episodios, más cámaras, otras arquitecturas) en la misma tarea.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (*"No evaluation results have been provided for this policy yet"*). No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y dos imágenes de 480×640, la huella es muy reducida y cabe holgadamente en GPUs de consumo (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; el entrenamiento se realizó con `--policy.device=cuda`. No se especifica el modelo de GPU usado.
- Cabe en GPU de consumo: sí, por tamaño de parámetros y resolución de entrada; no se documenta el mínimo exacto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), integración con el robot `so_follower` vía puerto serie y cámaras OpenCV a 640×480 y 30 FPS.
- Latencia y throughput: no disponibles. La política está pensada para ejecutarse a 30 FPS en tiempo real, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eetudigi/hf_act_recordpolicy0` | 51,7 M | 2 imágenes 3×480×640 + estado (6,) | Agarrar tapón amarillo (`so_follower`) | no disponible | Hugging Face Hub |
| ACT original (paper 2304.13705) | no disponible | Configurable según robot | Manipulación genérica por imitación | no disponible | Paper + código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | variable | Variable | Manipulación por imitación | según implementación | LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a categoría, tamaño y disponibilidad.

## Limitaciones y advertencias
- Modelo específico de una única tarea ("Grab the yellow cap") y un único robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Entrenado con solo 25 episodios y 11.461 fotogramas: alta probabilidad de sobreajuste al entorno, posiciones e iluminación del dataset de grabación.
- Sin resultados de evaluación en robot real: no hay evidencia publicada de tasa de éxito.
- Licencia no especificada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sensible a cambios de cámara, calibración, iluminación y posiciones de objeto; el rendimiento puede degradarse fuera de las condiciones de grabación.
- No es un modelo de lenguaje ni multimodal general: no admite prompts textuales, tool calling ni razonamiento.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de acciones erróneas o inseguras si el entorno difiere del de entrenamiento.
- No se documentan sesgos demográficos ni lingüísticos por no procesar texto ni personas, pero sí sesgos de dominio (objetos, colores y disposición del dataset).

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/eetudigi/hf_act_recordpolicy0
- Dataset de entrenamiento: https://huggingface.co/datasets/eetudigi/record-test_20261104_175931
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eetudigi/record-test_20261104_175931
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
