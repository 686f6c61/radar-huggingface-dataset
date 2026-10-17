# advanced-control/act_piper_pickup_mug_to_tray_resized

## Resumen

El modelo `advanced-control/act_piper_pickup_mug_to_tray_resized` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), desarrollada por el usuario advanced-control y entrenada con LeRobot. No es un modelo de lenguaje: recibe tres imágenes RGB de 360x640 y un estado de 7 dimensiones, y produce una acción de 7 dimensiones para una tarea de recogida de una taza y colocación en una bandeja, según el identificador del repositorio.

El checkpoint tiene 51.670.663 parámetros y se distribuye en safetensors con licencia Apache-2.0. Se entrenó durante 100.000 pasos con batch 8, AdamW y learning rate 1e-5 sobre un dataset de 100 episodios y 56.845 frames a 15 FPS.

Su interés actual es práctico: sirve como ejemplo reproducible del flujo ACT/LeRobot y como base para experimentos de manipulación, aunque no incluye resultados de evaluación en robots reales ni garantías de generalización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. La entrada se compone de 3 imágenes de 360x640 y un estado de 7 dimensiones |
| Tipos de cuantización | no disponible; solo se documentan pesos safetensors, sin variantes GGUF/INT8 publicadas |
| Idiomas soportados | no disponible (no aplica: política robótica sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LeRobot) |
| Tarea | recogida de taza y colocación en bandeja, según el identificador; la model card declara `task` |
| Entradas | `observation.state` (7,), `observation.images.camera_hand` (3, 360, 640), `observation.images.camera_chest` (3, 360, 640), `observation.images.camera_top` (3, 360, 640) |
| Salidas | `action` (7,) |
| Dataset de entrenamiento | `advanced-control/piper_pickup_mug_to_tray_resized`: 100 episodios, 56.845 frames, 15 FPS |
| Entrenamiento | 100.000 pasos, batch 8, AdamW, learning rate 1e-5, seed 1000, LeRobot 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos de acción (*action chunks*) en lugar de pasos individuales. La política utiliza un transformer para modelar la secuencia de observaciones y acciones, y se entrena con datos teleoperados. En este caso, el modelo consume tres vistas RGB —`camera_hand`, `camera_chest` y `camera_top`— junto con un estado propioceptivo de 7 dimensiones, y genera una acción de 7 dimensiones.

El entrenamiento se realizó durante 100.000 pasos con batch 8, optimizador AdamW, learning rate 1e-5 y seed 1000, usando LeRobot 0.6.1. El dataset contiene 100 episodios y 56.845 frames a 15 FPS. No se documentan detalles sobre el backbone visual, el horizonte de los *chunks*, aumentos de datos, validación o composición exacta del dataset. Tampoco se documenta RLHF/DPO; se trata de aprendizaje supervisado por imitación.

## Capacidades

- Control robótico de una tarea de *pick-and-place*: genera acciones de 7 dimensiones a partir de un estado de 7 dimensiones y tres vistas RGB.
- Percepción visual multi-cámara: utiliza `camera_hand`, `camera_chest` y `camera_top` con resolución 360x640.
- Aprendizaje por imitación: reproduce el comportamiento presente en 100 demostraciones teleoperadas.
- Predicción por *chunks*: la arquitectura ACT predice fragmentos de acción, no solo un paso aislado.
- No soporta *tool calling* ni *function calling*.
- No está diseñado para agentes, razonamiento multi-paso ni planificación simbólica.
- No es multilingüe ni genera texto, código o matemáticas.
- No dispone de modo *thinking*, visión general, audio ni capacidades de propósito general.
- No se han documentado capacidades especiales adicionales ni evaluación de robustez.

## Casos de uso

- Automatización de *pick-and-place* de taza a bandeja en una celda controlada: ejecutar la política con las tres cámaras y el estado de 7 dimensiones; es adecuada para tareas repetitivas dentro de la distribución de las 100 demostraciones.
- Reproducción de experimentos ACT en LeRobot: usar los pesos como referencia para comparar con otras políticas de imitación sobre el mismo dataset y la misma configuración de cámaras.
- Prototipado de un brazo Piper: validar la cadena percepción-acción, la calibración de cámaras y la frecuencia de control antes de entrenar una política propia. El robot exacto no se detalla en la model card; el identificador sugiere Piper.
- *Fine-tuning* con nuevas demostraciones: partir de este checkpoint para adaptar la tarea a otra taza, bandeja o posición, recogiendo episodios adicionales y manteniendo el formato de observaciones.
- Docencia y formación: mostrar el flujo completo de LeRobot —dataset, entrenamiento, *rollout*— con un caso de 100 episodios y 56.845 frames.
- Pruebas de integración hardware/software: verificar nombres de cámaras, formas `(3, 360, 640)`, estado `(7,)` y acción `(7,)` en un entorno de laboratorio.
- Evaluación de robustez controlada: medir la tasa de éxito ante cambios de iluminación o posición; requiere diseñar experimentos, porque no hay resultados publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet».

| Métrica | Resultado |
|---|---|
| Tasa de éxito en robot real | no disponible |
| Número de ensayos | no disponible |
| MMLU | no aplica (no es un modelo de lenguaje) |
| HumanEval | no aplica (no es un modelo de lenguaje) |
| GSM8K | no aplica (no es un modelo de lenguaje) |
| Latencia de inferencia | no disponible |
| Throughput | no disponible |

## Requisitos de hardware

| Precisión | Memoria solo pesos |
|---|---|
| FP32 | ~206,7 MB |
| FP16/BF16 | ~103,3 MB |
| INT8 | ~51,7 MB |

- VRAM total de inferencia: no disponible. La estimación anterior solo cubre pesos; hay que sumar activaciones, tres imágenes de 360x640 y preprocesado.
- GPU recomendadas: no especificadas por el autor. Por el tamaño de los pesos, una GPU de consumo como RTX 3060, RTX 4060 o RTX 4090 podría ser candidata, pero no está verificado. A100/H100 no se justifican por memoria de pesos.
- ¿Cabe en GPU de consumo? Probablemente sí por el tamaño de los pesos, pero el requisito real depende de LeRobot, del pipeline de visión y de la frecuencia de control.
- Despliegue: LeRobot con `lerobot-rollout` sobre PyTorch. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Los 15 FPS del dataset no equivalen a la latencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este checkpoint) | 51.670.663 | no disponible | sin evaluación publicada | Apache-2.0 | HuggingFace |
| ACT original (paper 2304.13705) | no disponible | no disponible | no disponible | no disponible | paper |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible | no verificado en la información |
| VQ-BeT | no disponible | no disponible | no disponible | no disponible | no verificado en la información |

No se dispone de cifras comparativas verificables en la información proporcionada. Las alternativas se citan por categoría —aprendizaje por imitación para robótica—, pero no hay datos para comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real; no se puede afirmar una tasa de éxito.
- Está entrenado para una única tarea y una configuración concreta de cámaras; no generaliza a otras tareas sin *fine-tuning*.
- El dataset es pequeño: 100 episodios y 56.845 frames, equivalentes a unos 63 minutos a 15 FPS. Existe riesgo de sobreajuste y sensibilidad a posiciones, iluminación y distractores.
- Requiere que los nombres y las formas de las cámaras coincidan con `camera_hand`, `camera_chest` y `camera_top`, y con `(3, 360, 640)`.
- El estado y la acción son de 7 dimensiones; la política depende de la morfología, calibración y límites del robot.
- Sesgos conocidos: no documentados. Al ser imitación, puede heredar sesgos del operador, de las demostraciones y del entorno.
- El riesgo de alucinación no aplica en el sentido lingüístico; sí pueden producirse acciones erróneas potencialmente peligrosas.
- La licencia Apache-2.0 permite uso comercial con obligaciones de atribución y aviso; deben revisarse también el dataset y las dependencias.
- No es una certificación de seguridad. No debe usarse en producción sin supervisión, parada de emergencia y validación de límites de fuerza y velocidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/advanced-control/act_piper_pickup_mug_to_tray_resized)
- [Dataset de entrenamiento](https://huggingface.co/datasets/advanced-control/piper_pickup_mug_to_tray_resized)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía ACT de LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación de inferencia y rollout](https://huggingface.co/docs/lerobot/main/en/inference)
- [Documentación general de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Registro de datos y entrenamiento de políticas](https://huggingface.co/docs/lerobot/en/il_robots)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=advanced-control/piper_pickup_mug_to_tray_resized)
- La búsqueda web no devolvió enlaces relacionados con el modelo; los resultados corresponden a software de mantenimiento de PC y no se incluyen.
