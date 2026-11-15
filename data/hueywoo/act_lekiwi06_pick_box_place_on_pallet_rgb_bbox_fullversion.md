# HueyWoo/act_lekiwi06_pick_box_place_on_pallet_rgb_bbox_fullversion

## Resumen

`act_lekiwi06_pick_box_place_on_pallet_rgb_bbox_fullversion` es una política de imitación (imitation learning) entrenada con LeRobot por el usuario HueyWoo para el robot móvil manipulador LeKiwi. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado de las articulaciones, dos cámaras RGB y un vector de estado del entorno, y emite una acción de 9 dimensiones. Su tarea concreta es recoger dos cajas y colocarlas sobre un palé negro.

El modelo emplea la arquitectura ACT (Action Chunking Transformer) en su variante `act_bbox`, que incorpora información de bounding boxes en la representación visual. Con 52.010.121 parámetros y un repositorio de 0,2 GB, está pensado para ejecutarse en el propio robot o en un equipo conectado, no para despliegue en servidores de inferencia de texto.

Es relevante como ejemplo reproducible de un pipeline completo de robótica de imitación con LeRobot 0.6.0: dataset público de 30 episodios, configuración de entrenamiento documentada y comandos de rollout listos para usar. La licencia Apache 2.0 facilita su reutilización y adaptación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) variante `act_bbox` |
| Parámetros totales | 52.010.121 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación por frame, no contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `lekiwi_client` |
| Cámaras | `front`, `wrist` (3×480×640 cada una) |
| Entrada `observation.state` | STATE, shape (9,) |
| Entrada `observation.environment_state` | ENV, shape (140,) |
| Salida `action` | ACTION, shape (9,) |
| Frecuencia de datos | 30 FPS |
| Librería | lerobot 0.6.0 |

## Arquitectura y entrenamiento

La política se basa en ACT, un transformer que predice secuencias de acciones (*action chunks*) a partir de observaciones visomotoras. La variante `act_bbox` añade representación basada en bounding boxes sobre las imágenes de las cámaras `front` y `wrist`, complementada con un vector de estado del entorno de 140 dimensiones. La salida es un vector de acción de 9 dimensiones que controla la base móvil y el brazo del LeKiwi.

El entrenamiento se realizó sobre el dataset `HueyWoo/lekiwi_pick_box_place_on_pallet`: 30 episodios, 18.000 frames a 30 FPS, con la tarea "pick two boxes and place them on a black pallet". La configuración fue de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al aprendizaje por imitación.

## Capacidades

- Control visomotor de un robot móvil manipulador LeKiwi para una tarea de pick-and-place.
- Fusión de dos vistas RGB (frontal y de muñeca) con estado proprioceptivo de 9 dimensiones y estado del entorno de 140 dimensiones.
- Predicción de secuencias de acción (action chunking) para ejecución fluida a 30 FPS.
- Ejecución autónoma mediante `lerobot-rollout` con `--strategy.type=base`.
- Reentrenamiento y ajuste fino mediante `lerobot-train` con `--policy.type=act_bbox`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente de control.

## Casos de uso

- Automatización de pick-and-place en almacén ligero: el modelo recoge dos cajas y las deposita sobre un palé, adecuado para demostraciones de manipulación móvil con el LeKiwi en entornos controlados.
- Prototipado de pipelines de imitación con LeRobot: sirve como referencia completa (dataset, configuración y comandos) para equipos que quieran replicar el flujo de entrenamiento con su propio robot.
- Base para ajuste fino en tareas similares: al estar entrenado con `act_bbox` y licencia Apache 2.0, puede reentrenarse con un dataset propio de pick-and-place cambiando `--dataset.repo_id` y `--policy.repo_id`.
- Benchmark interno de robótica móvil manipuladora: útil para comparar variantes de ACT (con y sin bbox) sobre el mismo hardware LeKiwi.
- Educación e investigación: ejemplo didáctico de aprendizaje por imitación con cámaras múltiples y estado del entorno, reproducible con hardware LeKiwi de bajo coste.
- Pruebas de integración de `lerobot-rollout`: permite validar la cadena de inferencia (puerto del robot, cámaras OpenCV, política remota desde el Hub) antes de desplegar políticas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 52 M de parámetros y pesos safetensors, la huella es reducida y probablemente inferior a 1 GB en FP32, aunque no se confirma.
- GPU recomendadas: no disponible; LeRobot permite `--policy.device=cuda`, por lo que cualquier GPU NVIDIA con CUDA es candidata.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño del modelo, pero no se aporta confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la frecuencia de los datos de entrenamiento es 30 FPS, pero no se reporta la tasa de inferencia real.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HueyWoo/act_lekiwi06_pick_box_place_on_pallet_rgb_bbox_fullversion` | ACT `act_bbox` para LeKiwi | 52.010.121 | no aplica | apache-2.0 | Hugging Face Hub |
| Políticas ACT estándar de LeRobot | ACT | no disponible | no aplica | según repositorio | Hugging Face Hub |
| Políticas Diffusion Policy de LeRobot | Diffusion Policy | no disponible | no aplica | según repositorio | Hugging Face Hub |
| Políticas SmolVLA de LeRobot | VLA | no disponible | no aplica | según repositorio | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para la tarea "pick two boxes and place them on a black pallet"; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy reducido (30 episodios, 18.000 frames), lo que limita la robustez frente a variaciones de posición, iluminación o distractores.
- Sin resultados de evaluación en robot real: no se conoce la tasa de éxito.
- Depende de la configuración exacta de cámaras (`front`, `wrist`) y del robot `lekiwi_client`; cambios de hardware o de nombres de cámara rompen la inferencia.
- Riesgo de sobreajuste al entorno de grabación y a la apariencia concreta de las cajas y el palé.
- No aplica a tareas de lenguaje, razonamiento ni generación de texto; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de un modelo de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HueyWoo/act_lekiwi06_pick_box_place_on_pallet_rgb_bbox_fullversion
- Dataset de entrenamiento: https://huggingface.co/datasets/HueyWoo/lekiwi_pick_box_place_on_pallet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HueyWoo/lekiwi_pick_box_place_on_pallet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
