# Ishaan-codes11/act_pick_place_glass_cup_pol_trimmed

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y suele lograr altas tasas de éxito en tareas de manipulación robótica. Este repositorio concreto, `Ishaan-codes11/act_pick_place_glass_cup_pol_trimmed`, es una política entrenada con LeRobot sobre el robot `so_follower` para la tarea "Pick up the glass cup and place it in the red area." (coger un vaso de cristal y colocarlo en la zona roja).

La política consume el estado articular (6 dimensiones) y tres flujos de vídeo de 480x640 píxeles (cámara frontal, de muñeca y de polarización) y produce un vector de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y desplegable en hardware de consumo.

Es relevante como ejemplo práctico de política visuomotora entrenada de extremo a extremo con datos de teleoperación (50 episodios, 11.973 fotogramas a 30 FPS) y como referencia para quienes quieran reproducir el flujo de trabajo de LeRobot con entradas multimodales, incluida una cámara de polarización poco habitual en este tipo de políticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un chunk de acciones futuras (de ahí "action chunking"), lo que mitiga el problema de compounding error típico de las políticas paso a paso. El modelo combina un backbone visual (procesa las tres cámaras a 480x640) con un transformer que fusiona las observaciones y genera las acciones. La entrada de estado es un vector de 6 dimensiones y la salida de acción también es de 6 dimensiones, correspondiente al robot `so_follower`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Ishaan-codes11/pick_place_glass_cup_pol_trimmed`: 50 episodios, 11.973 fotogramas a 30 FPS, una única tarea ("Pick up the glass cup and place it in the red area."). La configuración fue de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni otras técnicas de alineación; es aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Control visuomotor de manipulación robótica: genera comandos de acción de 6 dimensiones a partir de estado y tres cámaras.
- Aprendizaje por imitación de una tarea única y concreta (pick-and-place de un vaso de cristal en una zona roja).
- Fusión multimodal de tres flujos visuales simultáneos, incluida una cámara de polarización.
- Predicción de chunks de acciones para reducir el error acumulado en secuencias largas.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de coger el vaso y depositarlo en la zona roja sobre un robot `so_follower`, sirviendo como base para experimentos de manipulación con objetos frágiles.
- Reproducción de flujos de LeRobot: útil como plantilla para validar el pipeline `lerobot-rollout` con tres cámaras y una tarea fija, antes de entrenar políticas propias.
- Investigación en aprendizaje por imitación: referencia para comparar ACT con otros métodos (Diffusion Policy, VQ-BeT) sobre el mismo dataset y robot.
- Prototipado de percepción con cámara de polarización: permite estudiar si la información de polarización mejora la robustez frente a reflejos en objetos de cristal.
- Docencia y formación en robótica: ejemplo reproducible de entrenamiento con 50 episodios y 30.000 pasos para cursos de imitation learning.
- Base para fine-tuning en tareas similares: al ser apache-2.0 y ligero (0,2 GB), se puede reentrenar con nuevos datasets manteniendo la arquitectura ACT y el robot `so_follower`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para los 51,7 M de parámetros; en la práctica el cuello de botella es el procesamiento de tres cámaras a 480x640, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha entrenado con `--policy.device=cuda`, por lo que se asume una GPU NVIDIA.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también es viable en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía oficial; los pesos en safetensors se pueden cargar con PyTorch directamente. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLM.
- Latencia y throughput: no disponibles. La frecuencia de control está ligada a los 30 FPS del dataset, pero no se publican mediciones de latencia en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick_place_glass_cup_pol_trimmed (este) | 51,7 M | no aplica | sin evaluación publicada | apache-2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible en la informacion | no aplica | resultados en paper, no comparables directamente | no disponible | paper |
| Diffusion Policy | no disponible en la informacion | no aplica | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible en la informacion | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para una comparativa cuantitativa con alternativas; las filas distintas de la primera se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- Política de tarea única: solo está entrenada para "Pick up the glass cup and place it in the red area."; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia del hardware exacto: asume robot `so_follower` y tres cámaras con nombres `front`, `wrist` y `polarization`; un cambio de robot o de disposición de cámaras invalida la política.
- Dataset pequeño: 50 episodios y 11.973 fotogramas limitan la diversidad; probable sobreajuste a posiciones, iluminación y objetos del entorno de captura.
- Riesgo de fallo ante objetos distintos, reflejos no vistos o cambios de fondo; la cámara de polarización ayuda con cristal, pero no garantiza robustez.
- Sin capacidades de lenguaje: la tarea se pasa como cadena fija, no hay comprensión de instrucciones variables.
- Licencia apache-2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de LeRobot y de las dependencias.
- Sin información sobre sesgos: al no procesar lenguaje ni datos personales, los sesgos relevantes serían de tipo perceptivo y de dominio (iluminación, materiales, posiciones).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ishaan-codes11/act_pick_place_glass_cup_pol_trimmed
- Dataset de entrenamiento: https://huggingface.co/datasets/Ishaan-codes11/pick_place_glass_cup_pol_trimmed
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ishaan-codes11/pick_place_glass_cup_pol_trimmed
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
