# SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_GR00T

## Resumen

La política `VLA_Samer_15.11.2026_300eps_Last_policy_GR00T` es un checkpoint de robótica entrenado con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades en robots humanoides. El autor, SamerAyyad, ha ajustado el modelo para una tarea concreta de manipulación sobre un brazo UR5 equipado con pinza de succión: recoger una CPU y depositarla en una caja.

El modelo combina un backbone vision-language Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propriocepción. Con 3.144.016.000 parámetros totales y un repositorio de 12,6 GB en safetensors, es un modelo considerable que requiere GPU de gama alta para inferencia, aunque el checkpoint publicado está especializado en una única tarea y morfología.

Es relevante ahora porque ilustra el flujo actual de la robótica open source: partir de un modelo fundacional preentrenado (GR00T) y ajustarlo con un dataset de imitación relativamente modesto (300 episodios, 191.275 frames a 30 FPS) para obtener una política desplegable con el CLI de LeRobot. No obstante, se trata de un artefacto de investigación sin resultados de evaluación publicados ni descargas, por lo que su utilidad práctica fuera del entorno original es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-language Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional cross-embodiment para robots humanoides. La percepción y el razonamiento lingüístico recaen sobre un backbone vision-language Cosmos-Reason2/Qwen3-VL, mientras que la generación de acciones se realiza mediante un transformer de flow matching que predice trayectorias condicionadas por la observación visual, la instrucción de lenguaje y el estado proprioceptivo del robot. Las entradas son una imagen RGB de 3×480×640 y un vector de estado de 7 dimensiones; la salida es un vector de acción de 7 dimensiones, coherente con un UR5 de 6 grados de libertad más el actuador de la pinza.

El ajuste se realizó con LeRobot 0.6.2 sobre el dataset `SamerAyyad/VLA_Samer_15.11.2026_300eps_Last`: 300 episodios, 191.275 frames a 30 FPS, para la tarea "Pick up the CPU with the suction gripper and place it in the box". La configuración de entrenamiento fue de 20.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 42. No se documenta si hubo RLHF, DPO ni composición adicional del dataset más allá de la tarea de imitación. El nombre del checkpoint ("Last") indica que corresponde al último paso de entrenamiento, no necesariamente al mejor por validación.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por imagen, lenguaje y propriocepción, mediante flow matching.
- Ejecución de una tarea de pick-and-place específica: recoger una CPU con pinza de succión y colocarla en una caja.
- Control de un brazo UR5 con vector de acción de 7 dimensiones.
- Procesamiento de observaciones visuales a 480×640 y 30 FPS.
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- Capacidades multilingües: no disponible (la instrucción de tarea está en inglés y no se documenta cobertura de idiomas).
- Tool calling, agentes multi-paso, thinking mode, visión general, audio: no disponible; el modelo está especializado en control motor, no en tareas de lenguaje general.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo ejecuta la secuencia de succión y depósito de una CPU en una caja sobre un UR5, adecuado para demostrar un pipeline de imitación end-to-end con LeRobot.
- Prototipado de políticas de imitación: sirve como punto de partida para equipos que quieran replicar el flujo de ajuste de GR00T con sus propios datasets y validar la integración con `lerobot-train`.
- Investigación en modelos fundacionales de robótica: permite estudiar cómo un backbone VLM (Qwen3-VL) se acopla a un transformer de acciones con flow matching en una tarea concreta.
- Benchmark interno de despliegue: útil para medir latencia y throughput de un checkpoint de 3.144 M de parámetros en GPUs concretas antes de invertir en datasets mayores.
- Docencia y demostraciones: el comando `lerobot-rollout` con `--strategy.type=base` permite reproducir la política en un UR5 real durante un tiempo acotado (`--duration=60`) sin grabar episodios.
- Base para fine-tuning cross-embodiment: al estar construido sobre GR00T N1.7, puede adaptarse a otras morfologías cambiando el espacio de acciones y el dataset, aunque requeriría reentrenamiento sustancial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, latencia ni comparativas numéricas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.144.016.000 parámetros, en FP16 se requieren aproximadamente 6,3 GB solo para pesos; en FP32, unos 12,6 GB. A ello hay que sumar el backbone VLM y los buffers de activación, por lo que en la práctica se recomienda al menos 24 GB de VRAM en FP16.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; GPUs con menos memoria requerirían cuantización, no documentada para este checkpoint.
- ¿Cabe en consumer GPU? Previsiblemente sí en RTX 4090 (24 GB) en FP16, siempre que el runtime de LeRobot no añada sobrecoste de memoria significativo; en GPUs de 12-16 GB no hay garantía sin cuantización.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), que es el flujo documentado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y en general estos runtimes no están orientados a políticas de acción robótica.
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset, pero no se publica latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_GR00T | 3.144.016.000 | no disponible | Pick-and-place UR5 | Apache 2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 (NVIDIA, base) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot ACT/diffusion (genéricas) | típicamente órdenes de magnitud menores | no disponible | Imitación por tarea | Apache 2.0 | Hugging Face / LeRobot |

La comparativa con alternativas concretas no está disponible con datos verificables en la información proporcionada; los modelos citados difieren en escala y propósito, y no se han publicado métricas comunes.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni validación en robot real, por lo que no se puede afirmar que la política funcione fuera del dataset de entrenamiento.
- Especialización extrema: entrenada para una única tarea, un único tipo de robot (UR5) y una única configuración de cámara (`camera`, 480×640); no generaliza a otras morfologías sin reentrenamiento.
- Riesgo de sobreajuste al entorno: 300 episodios en una sola escena implican alta sensibilidad a cambios de iluminación, posiciones de objetos o distracciones, no cuantificada.
- Sin datos de sesgos: no se documentan sesgos demográficos, lingüísticos ni de otro tipo; el modelo no está pensado para interacción con personas.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: al ser una política de control motor, los fallos se traducen en movimientos erróneos del brazo, con riesgo físico en entornos reales.
- Licencia Apache 2.0 permite uso comercial del checkpoint, pero el modelo base GR00T y sus dependencias (Qwen3-VL, Cosmos-Reason2) pueden tener condiciones adicionales que deben verificarse por separado.
- Sin descargas ni likes: artefacto de investigación sin validación comunitaria; no debe tratarse como referencia de producción.
- Idiomas y contexto no documentados: la instrucción de tarea está en inglés y no se especifica comportamiento multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_GR00T
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_15.11.2026_300eps_Last
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_15.11.2026_300eps_Last
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
