# chrisw-shadow/thread_nut_dit_hil_v4_flowmatching

## Resumen

`thread_nut_dit_hil_v4_flowmatching` es una política de robótica (no un modelo de lenguaje) publicada por el usuario `chrisw-shadow` en Hugging Face. Implementa una Diffusion Transformer (DiT) multi-tarea entrenada con el framework LeRobot para una tarea concreta de manipulación: agarrar una tuerca y enroscarla en un perno orientado hacia arriba. El modelo consume el estado del robot (39 dimensiones) y tres cámaras RGB de 480x640 y produce un vector de acción de 21 dimensiones.

La arquitectura se basa en el método Multi-Task Diffusion Transformer descrito en el paper arXiv:2507.05331, que extiende Diffusion Policy con un backbone DiT y condicionamiento conjunto de texto e imagen para aprendizaje multi-tarea. Según la model card del autor, el método alcanza alta destreza con aproximadamente 450M de parámetros; el checkpoint publicado tiene 238.312.213 parámetros reales según los safetensors. Esta versión concreta se ha entrenado con objetivo de flow matching, de ahí el sufijo del nombre.

Es relevante como ejemplo de política de imitación aplicada a una tarea de ensamblaje fino (threading), un caso clásico de manipulación de precisión con robots industriales tipo UR10e equipados con pinza Dexee. El modelo está pensado para ejecutarse con `lerobot-rollout` sobre hardware real, no para inferencia genérica de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) multi-tarea con condicionamiento texto + visión; objetivo flow matching |
| Parametros totales | 238.312.213 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de robot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; condicionamiento por instrucción textual en inglés en la tarea) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repo de 1.0 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es una política de imitación basada en Multi-Task Diffusion Transformer (DiT). Toma como entrada un vector de estado del robot de 39 dimensiones y tres flujos de imagen RGB de 3x480x640 (`fixed`, `wrist_1`, `wrist_2`), y genera una acción de 21 dimensiones. El condicionamiento es multimodal: texto (la instrucción de la tarea) más visión (las tres cámaras). El método subyacente soporta objetivos de difusión y de flow matching; este checkpoint usa flow matching, según indica el nombre del repositorio.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `chrisw-shadow/nut_5_hil_merged_subset_rel`: 129 episodios, 100.522 frames a 50 FPS, con una única tarea ("grasp the nut and then thread it onto the upwards facing bolt"). La configuración reportada es 60.000 pasos, batch size 96, optimizador Adam, learning rate 2e-5 y semilla 1000. No se documenta el número total de tokens ni la composición exacta del dataset (más allá del número de episodios y frames), ni si hubo etapas de RLHF/DPO (no aplica en el sentido habitual de LLM; es aprendizaje por imitación, presumiblemente con datos HIL —human-in-the-loop— dado el sufijo `hil`).

## Capacidades

- Control robótico de manipulación fina: genera comandos de acción de 21 dimensiones para un UR10e con pinza Dexee.
- Percepción multimodal: integra estado propioceptivo (39 dims) y tres vistas RGB (muñeca 1, muñeca 2 y cámara fija).
- Condicionamiento por instrucción textual: la tarea se especifica mediante un prompt de texto ("grasp the nut and then thread it onto the upwards facing bolt").
- Ejecución de una tarea específica de ensamblaje (threading de tuerca en perno) aprendida por imitación.
- Compatible con el ecosistema LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento o fine-tuning.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto ni capacidades multilingües en el sentido de un LLM.

## Casos de uso

- Automatización de ensamblaje con tuerca y perno: el modelo ejecuta la secuencia completa de agarre y enroscado sobre un UR10e; adecuado para validar pipelines de manipulación de precisión en laboratorio o línea piloto.
- Investigación en imitación robótica: sirve como checkpoint de referencia para comparar DiT con flow matching frente a Diffusion Policy clásica en tareas de threading.
- Reentrenamiento con datos propios: el comando `lerobot-train --policy.type=multi_task_dit` permite adaptar la política a nuevos datasets manteniendo la arquitectura.
- Pruebas de generalización de políticas multi-tarea: al estar condicionada por texto, se puede evaluar su comportamiento con variaciones de instrucción o posiciones de objeto (aunque la model card no reporta resultados de evaluación).
- Benchmark interno de hardware: útil para medir latencia y throughput de una política DiT de ~238M parámetros en GPUs de consumo o de datacenter antes de escalar a modelos mayores.
- Docencia y demostraciones de LeRobot: ejemplo reproducible de extremo a extremo (dataset → entrenamiento → rollout) para formación en aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía ("No evaluation results have been provided for this policy yet") y no reporta tasas de éxito, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 238.312.213 parámetros en safetensors (probablemente fp32 o bf16), el checkpoint ocupa del orden de 0,5–1 GB; la VRAM real depende del tamaño de las tres cámaras 480x640 y del batch de inferencia, no documentado.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos ~4–8 GB de VRAM debería poder cargar los pesos; se recomienda una GPU NVIDIA con soporte CUDA para `lerobot-rollout --policy.device=cuda`.
- ¿Cabe en GPU de consumo? Probablemente sí (RTX 3060/4060 o superiores), dado el tamaño del checkpoint, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y entrenamiento con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thread_nut_dit_hil_v4_flowmatching` (este) | 238.312.213 | no aplica | Threading tuerca-perno en UR10e | no disponible | Hugging Face, 0 descargas |
| Diffusion Policy (original, Chi et al.) | no disponible en la información | no aplica | Manipulación por imitación | no disponible en la información | Repos públicos de referencia |
| Multi-Task DiT (paper arXiv:2507.05331) | ~450M según model card | no aplica | Aprendizaje multi-tarea con texto + visión | no disponible en la información | Paper; implementación en LeRobot |
| Otras políticas LeRobot (`act`, `diffusion`, `pi0`) | variable | no aplica | Manipulación general | variable según checkpoint | Hub de Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no especificada: la model card marca la licencia como "[More Information Needed]", lo que impide confirmar el uso comercial.
- Especialización extrema: entrenada para una única tarea y un único robot (`ur10e_dexee`); no generaliza a otras tareas ni a otros brazos sin reentrenamiento.
- Dataset pequeño: 129 episodios y 100.522 frames; posible sobreajuste a posiciones, iluminación y configuraciones concretas del entorno de captura.
- Dependencia de hardware: requiere un UR10e con pinza Dexee y tres cámaras con los nombres e índices exactos (`fixed`, `wrist_1`, `wrist_2`); cualquier cambio en la configuración invalida la política.
- Riesgo de alucinación en el sentido robótico: puede generar trayectorias plausibles pero incorrectas ante objetos o posiciones fuera de distribución; no hay mecanismo de verificación documentado.
- Sin información sobre sesgos, idiomas ni cuantizaciones: no aplica el análisis habitual de LLM, pero tampoco se documenta nada al respecto.
- Repositorio sin descargas ni likes y creado/actualizado el mismo día (2026-11-27): señales de un checkpoint recién publicado y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrisw-shadow/thread_nut_dit_hil_v4_flowmatching
- Dataset de entrenamiento: https://huggingface.co/datasets/chrisw-shadow/nut_5_hil_merged_subset_rel
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chrisw-shadow/nut_5_hil_merged_subset_rel
- Paper del método (Multi-Task DiT): https://huggingface.co/papers/2507.05331 (arXiv:2507.05331)
- Guía LeRobot multi_task_dit: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
