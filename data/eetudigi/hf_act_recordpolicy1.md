# eetudigi/hf_act_recordpolicy1

## Resumen

`eetudigi/hf_act_recordpolicy1` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el paper arXiv 2304.13705. No es un modelo de lenguaje: es un modelo de control visuomotor que consume el estado de las articulaciones y dos cámaras (muñeca y cenital) y produce comandos de acción de 6 dimensiones para un robot manipulador. Ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real.

El modelo tiene 51.668.614 parámetros y está empaquetado en safetensors (0,2 GB de repositorio). Se entrenó sobre un dataset propio de 50 episodios y 25.144 fotogramas a 30 FPS para una única tarea: "Grab the yellow cap". La arquitectura predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y produce trayectorias más suaves.

Es relevante como ejemplo reproducible de un pipeline completo de imitación end-to-end con LeRobot: recogida de datos con robot `so_follower`, entrenamiento con `lerobot-train` (20.000 pasos, batch 8, AdamW, lr 1e-05) y despliegue con `lerobot-rollout`. Su alcance es muy acotado: una tarea, un robot, dos cámaras, sin evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por el chunking de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Robot | `so_follower` |
| Cámaras | `wrist`, `top` |
| Dataset de entrenamiento | `eetudigi/record-test_20261104_175931` (50 episodios, 25.144 frames, 30 FPS) |
| Tarea | "Grab the yellow cap" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visuomotora que predice un chunk de acciones futuras (varios pasos de control de una vez) en lugar de una única acción por inferencia. Esto mitiga el problema de acumulación de errores típico de las políticas paso a paso y permite trayectorias más estables en tareas de manipulación. La entrada combina el estado propioceptivo de 6 dimensiones con dos flujos visuales de 3×480×640 píxeles (muñeca y cenital), que se codifican y se fusionan antes de la decodificación de acciones.

El entrenamiento es de imitación supervisada sobre teleoperación, sin RLHF ni DPO. Se usaron 50 episodios y 25.144 fotogramas a 30 FPS para una sola tarea ("Grab the yellow cap"), con 20.000 pasos, batch 8, AdamW y lr 1e-05. No se documentan aumentos de datos, composición detallada del dataset ni innovaciones adicionales más allá del propio chunking de acciones del método ACT.

## Capacidades

- Control visuomotor de un robot manipulador `so_follower` con 6 dimensiones de acción.
- Predicción de chunks de acción para trayectorias suaves y menor acumulación de error.
- Fusión de dos vistas de cámara (muñeca y cenital) con el estado de las articulaciones.
- Ejecución de una tarea concreta de picking: "Grab the yellow cap".
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Replicación de un pipeline de imitación end-to-end: sirve como referencia para grabar datos con `so_follower`, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` en un entorno controlado.
- Tarea de picking de un objeto concreto: el modelo ejecuta la política "Grab the yellow cap" sobre el robot y las cámaras para los que fue entrenado, útil para validar la cadena hardware-software.
- Benchmark interno de infraestructura robótica: permite medir latencia de inferencia y estabilidad del bucle de control con dos cámaras a 30 FPS.
- Base para fine-tuning con nuevos datasets: al ser una política ACT estándar de LeRobot, se puede reentrenar sobre datos propios cambiando `--dataset.repo_id` y `--policy.type=act`.
- Docencia y demostraciones: ejemplo mínimo (50 episodios, 25k frames) para explicar chunking de acciones y aprendizaje por imitación.
- Pruebas de integración de LeRobot 0.6.2: valida compatibilidad de versiones, formato de observaciones y CLI de rollout en un caso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y dos flujos de imagen de 480×640, el modelo es ligero y cabe holgadamente en GPUs de consumo, aunque no se publica una cifra concreta.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060/4060 o superior debería ser suficiente; el entrenamiento se realizó con `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (51,7 M de parámetros), aunque la latencia real depende del preprocesado de las dos cámaras a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eetudigi/hf_act_recordpolicy1 | 51.668.614 | ACT (LeRobot), 1 tarea | no aplica | no disponible | HuggingFace |
| Otras políticas ACT en LeRobot Hub | no disponible | ACT | no aplica | variable | HuggingFace |
| Políticas Diffusion Policy (LeRobot) | no disponible | diffusion | no aplica | variable | HuggingFace |
| Políticas pi0 / VLA (referencia) | no disponible | VLA | no aplica | variable | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea ("Grab the yellow cap") y un único robot (`so_follower`); no generaliza a otras tareas ni morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en condiciones variables (posiciones, iluminación, distractores).
- Depende de la configuración exacta de cámaras (`wrist`, `top`) y de sus nombres en las observaciones; un cambio de montaje o resolución puede degradar el comportamiento.
- Licencia no especificada: no se puede confirmar el uso comercial.
- Riesgo de sobreajuste al dataset de 50 episodios y a la posición concreta del objeto durante la grabación.
- No es un modelo de lenguaje: no aplican sesgos lingüísticos, alucinación textual ni capacidades multilingües; el riesgo análogo es fallo de la política ante distribuciones no vistas.
- En producción requiere supervisión humana y parada de seguridad: una política de imitación puede ejecutar acciones erróneas sin aviso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eetudigi/hf_act_recordpolicy1
- Dataset de entrenamiento: https://huggingface.co/datasets/eetudigi/record-test_20261104_175931
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eetudigi/record-test_20261104_175931
