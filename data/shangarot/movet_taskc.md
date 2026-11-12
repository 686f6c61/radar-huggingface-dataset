# shangarot/moveT_TaskC

## Resumen

moveT_TaskC es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), desarrollada por el usuario shangarot y publicada en Hugging Face a través de la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación: "Unload T shape from black box", es decir, extraer una pieza en forma de T de una caja negra. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador visomotor que mapea observaciones (estado articular y dos cámaras) a comandos de acción de 6 dimensiones.

La arquitectura ACT es una propuesta de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El modelo tiene 51.668.614 parámetros y está empaquetado en formato safetensors dentro de un repositorio de 0,2 GB. Está diseñado para el robot `so_follower` (SO-100/SO-101 de LeRobot) con dos cámaras: `top` y `wrist`.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline completo de imitación con LeRobot (grabación de datos, entrenamiento y despliegue) para una tarea específica. No está pensado para reutilización general, sino como política entrenada para un entorno y robot concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 (Zhao et al., 2023). La arquitectura es un transformer que procesa observaciones multimodales: el estado articular (`observation.state`, vector de 6 dimensiones) y dos imágenes RGB de 480x640 procedentes de las cámaras `top` y `wrist`. La salida es un chunk de acciones de forma `(6,)`, correspondiente a los comandos del robot `so_follower`. ACT se caracteriza por predecir secuencias cortas de acciones en lugar de un único paso, lo que mitiga el problema de compounding error típico de las políticas de imitación paso a paso.

El entrenamiento se realizó sobre el dataset `shangarot/moveT_TaskC`, compuesto por 64 episodios y 26.110 frames grabados a 30 FPS, con una única tarea: "Unload T shape from black box". La configuración de entrenamiento fue de 40.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.7.1. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de imitación supervisada pura sobre datos de teleoperación. No se especifica el número total de tokens ni la composición detallada del dataset más allá de los episodios y frames indicados.

## Capacidades

- Control visomotor de manipulación robótica: genera comandos de acción de 6 dimensiones a partir de estado articular e imágenes.
- Ejecución de una tarea específica de pick-and-place: extraer una pieza en forma de T de una caja negra.
- Procesamiento multimodal de dos cámaras (vista superior y vista de muñeca) más estado proprioceptivo.
- Predicción de chunks de acción, lo que aporta estabilidad temporal en la ejecución.
- Integración con el ecosistema LeRobot para rollout y entrenamiento mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Referencia reproducible de imitación con ACT: sirve para validar un pipeline completo de LeRobot (grabación, entrenamiento, despliegue) en un robot SO-100/SO-101 con dos cámaras, usando la configuración exacta documentada.
- Automatización de una celda de desensamblaje: la política puede ejecutar la tarea de extraer la pieza en T de la caja negra en un entorno controlado, como paso dentro de una línea de manipulación.
- Base para fine-tuning en tareas similares: al estar entrenada con 64 episodios y 26.110 frames, puede servir como inicialización para tareas de pick-and-place con geometrías parecidas, siempre que se reentrene con datos propios.
- Benchmark interno de éxito de políticas de imitación: permite comparar variantes de ACT (distintos hiperparámetros, aumentos de datos) contra esta política de referencia en la misma tarea.
- Docencia y divulgación en robótica: ejemplo concreto y ligero (0,2 GB, 51,7 M de parámetros) para explicar action chunking, entrenamiento por imitación y despliegue en hardware de bajo coste.
- Pruebas de integración de LeRobot en CI: el repositorio y los comandos documentados permiten montar tests de humo de rollout en entornos simulados o con hardware de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso en FP32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, asumiendo overhead de las dos cámaras a 480x640.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100). Para entrenamiento, la model card usa `--policy.device=cuda`; no se especifica GPU concreta.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y entrenamiento con `lerobot-train`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La ejecución se realiza a 30 FPS según el dataset, pero no se publican métricas de latencia del rollout.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moveT_TaskC (este) | 51.668.614 | no aplica | Unload T shape from black box (SO-100/SO-101) | no disponible | Hugging Face, LeRobot |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Tareas específicas por dataset | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | variable | no aplica | Manipulación por imitación | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada, por lo que la comparativa se limita a aspectos estructurales. No se han identificado alternativas con benchmarks públicos directamente comparables para esta tarea concreta.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "More Information Needed", por lo que el uso comercial no está autorizado de forma explícita y requiere contactar con el autor.
- Tarea única y altamente específica: entrenada solo para "Unload T shape from black box"; no generaliza a otras tareas sin reentrenamiento.
- Entrenada para el robot `so_follower` con cámaras `top` y `wrist` a 480x640; cambios de robot, cámaras, calibración o iluminación pueden degradar el rendimiento.
- Dataset pequeño: 64 episodios y 26.110 frames; riesgo de sobreajuste y de baja robustez ante variaciones de posición, distractores o condiciones de luz.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real documentada, lo que impide estimar su fiabilidad en producción.
- Riesgo de alucinación en el sentido de acciones erróneas o inseguras: como toda política de imitación, puede producir comandos fuera de distribución; se recomienda supervisión y límites de seguridad en el robot.
- Sin capacidades de lenguaje, tool calling ni razonamiento simbólico; no debe confundirse con un modelo de propósito general.
- Dependencia del ecosistema LeRobot 0.7.1: cambios de versión pueden afectar a la compatibilidad de los comandos de rollout y entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shangarot/moveT_TaskC
- Dataset de entrenamiento: https://huggingface.co/datasets/shangarot/moveT_TaskC
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shangarot/moveT_TaskC
