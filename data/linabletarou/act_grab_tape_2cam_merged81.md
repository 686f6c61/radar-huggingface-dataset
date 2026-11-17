# linabletarou/act_grab_tape_2cam_merged81

## Resumen

`linabletarou/act_grab_tape_2cam_merged81` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub por el usuario `linabletarou` mediante la librería LeRobot de Hugging Face. El modelo no es un modelo de lenguaje: es un controlador visomotor entrenado para ejecutar una tarea robótica concreta, "Grab the tape" (coger la cinta), sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot) equipado con dos cámaras (`front` y `wrist`).

El problema que resuelve es el de mapear observaciones multimodales (estado articular de 6 dimensiones y dos imágenes RGB de 480x640) a acciones de 6 dimensiones a 30 FPS, aprendiendo directamente de demostraciones teleoperadas. ACT predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación de contacto.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de un pipeline completo de imitación en robótica de bajo coste, con 81 episodios y 45.277 fotogramas de entrenamiento, licencia Apache 2.0 y un total de 51.668.614 parámetros. Resulta útil para quien quiera replicar el flujo de LeRobot o adaptar ACT a una tarea propia, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política por fotograma con historial de observaciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con la cadena "Grab the tape") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 3,7 GB) |

## Arquitectura y entrenamiento

ACT combina un codificador visual (procesa las dos cámaras de 3x480x640), un codificador del estado articular de 6 dimensiones y un transformer que predice un chunk de acciones futuras de 6 dimensiones. La innovación central del método es la predicción de chunks con una pérdida L1 sobre la secuencia de acciones y un mecanismo de *temporal ensembling* en inferencia que suaviza las transiciones entre chunks solapados. El modelo se entrenó con 30.000 pasos, batch de 8, optimizador AdamW y tasa de aprendizaje 1e-5, semilla 1000, sobre LeRobot 0.6.2.

Los datos proceden del dataset `linabletarou/grab_tape_2cam_merged81`: 81 episodios, 45.277 fotogramas a 30 FPS, con dos cámaras sincronizadas y estado/acción de 6 dimensiones. No se documenta composición adicional del dataset, aumentos de datos ni fases de RLHF/DPO (no aplicables a este paradigma). Tampoco se especifica la arquitectura interna exacta (número de capas, dimensión de los embeddings, resolución del tokenizador visual) más allá de lo que define el paper de ACT.

## Capacidades

- Control visomotor de manipulación: ejecuta la tarea "Grab the tape" a partir de dos vistas RGB y del estado articular.
- Predicción de chunks de acción de 6 dimensiones, con ensamblado temporal para reducir discontinuidades.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita.
- Funcionamiento en tiempo real a 30 FPS sobre hardware de bajo coste (SO-100/SO-101).
- Integración nativa con LeRobot (`lerobot-rollout`, `lerobot-train`, `lerobot-record`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso

- Replicación de un pipeline de imitación en robótica de bajo coste: sirve como referencia completa (dataset, configuración de entrenamiento, comando de despliegue) para montar un flujo ACT de principio a fin con LeRobot.
- Automatización de una tarea de pick-and-place concreta: el modelo puede ejecutar "Grab the tape" en un SO-100/SO-101 con dos cámaras, útil como banco de pruebas para validar hardware y calibración antes de escalar a tareas más complejas.
- Generación de datos sintéticos de evaluación: al ejecutar la política con `lerobot-rollout` y `--strategy.type=base` se pueden grabar episodios que sirvan como baseline o como datos negativos para comparar con otras políticas.
- Estudio de robustez visomotora: permite medir cómo afectan cambios de iluminación, posición del objeto o distracciones a una política ACT entrenada con 81 episodios, un escenario típico de sobreajuste en imitación.
- Base para *fine-tuning* en una tarea adyacente: al estar en LeRobot y Apache 2.0, se puede reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio y comparar curvas de aprendizaje con este punto de partida.
- Docencia y formación en robótica de imitación: ejemplo compacto (51,7 M de parámetros, 3,7 GB) para explicar codificación visual, chunks de acción y ensamblado temporal en un curso práctico.
- Integración en un banco de pruebas de evaluación de políticas: sirve como política de referencia para comparar métricas de éxito entre métodos (ACT, Diffusion Policy, VQ-BeT) sobre el mismo robot y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de éxito vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros; en fp32 ocupa aproximadamente 0,21 GB de pesos, más activaciones de las dos cámaras a 480x640. En la práctica cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060, RTX 4090, A100, H100). Para entrenamiento con batch 8 y dos cámaras se recomienda al menos 8-12 GB de VRAM; para inferencia en tiempo real, una RTX 3060 o superior es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más; también es viable en CPU para inferencia a baja frecuencia, aunque no se garantizan los 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=linabletarou/act_grab_tape_2cam_merged81`), integración directa con el stack de Hugging Face. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplicables a este tipo de política).
- Latencia y throughput estimados: no disponibles. La model card no reporta latencia medida; el sistema está pensado para operar a 30 FPS, la misma frecuencia del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observaciones | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_grab_tape_2cam_merged81 (este) | 51,7 M | 2 cámaras 480x640 + estado (6,) | "Grab the tape" en SO-100/SO-101 | Apache 2.0 | Hugging Face Hub, LeRobot |
| ACT original (paper 2304.13705) | no disponible en la informacion | no disponible | Manipulación genérica (ALOHA) | no disponible | Paper + código de referencia |
| Diffusion Policy (referencia metodológica) | no disponible en la informacion | no disponible | Manipulación visomotora | no disponible | Repositorios públicos |
| Otras políticas LeRobot del Hub | variable | variable | Tareas específicas por dataset | variable | Hugging Face Hub |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas; la comparación anterior es cualitativa y se limita a lo documentado en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "Grab the tape" con un robot `so_follower` y dos cámaras concretas; no generaliza a otras tareas, objetos ni configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: la model card no reporta tasa de éxito en robot real, por lo que se desconoce su robustez práctica.
- Dataset pequeño: 81 episodios y 45.277 fotogramas son una base limitada; es probable sobreajuste a posiciones, iluminación y fondo del entorno de recogida.
- Dependencia de calibración: el rendimiento depende de la calibración del robot, la posición e índices de las cámaras y la correspondencia exacta de los nombres de cámara (`front`, `wrist`) con las claves de observación.
- Sin capacidades lingüísticas: no procesa instrucciones en lenguaje natural más allá de la etiqueta de tarea usada en el entrenamiento; no es un modelo conversacional ni multilingüe.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: al ser una política de imitación, puede ejecutar movimientos no deseados ante entradas fuera de distribución; requiere límites de seguridad y supervisión en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece garantía alguna; el autor no documenta sesgos ni limitaciones adicionales.
- Sin variantes cuantizadas ni exportaciones a otros runtimes publicadas: el despliegue queda atado al stack LeRobot.
- Fecha de creación del repositorio: 2026-11-17, con 0 descargas y 1 like en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/linabletarou/act_grab_tape_2cam_merged81
- Dataset de entrenamiento: https://huggingface.co/datasets/linabletarou/grab_tape_2cam_merged81
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=linabletarou/grab_tape_2cam_merged81
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
