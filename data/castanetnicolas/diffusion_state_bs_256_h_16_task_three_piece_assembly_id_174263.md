# castanetnicolas/diffusion_state_BS_256_H_16_TASK_three_piece_assembly_ID_174263

## Resumen

Este repositorio contiene una política de robótica entrenada con el método Diffusion Policy, publicado por Cheng Chi et al. (arXiv:2303.04137) y empaquetada con la librería LeRobot de Hugging Face. El autor del artefacto es el usuario castanetnicolas. No se trata de un modelo de lenguaje, sino de un controlador visuomotor que trata el control como un proceso generativo de difusión: en lugar de predecir una acción única, genera trayectorias de acción multimple paso suaves, lo que resulta especialmente útil en tareas de manipulación con contacto rico.

La política está especializada en una única tarea: "Insert the first piece into the base, then insert the second piece on top of it", dentro del entorno de ensamblaje de tres piezas de MimicGen (variante d1). Consume un vector de estado propio del robot de 9 dimensiones y un vector de estado del entorno de 42 dimensiones, y produce una acción de 7 dimensiones. El modelo tiene 64.452.231 parámetros y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en un rango manejable para inferencia en tiempo real en un robot Panda.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de entrenamiento de Diffusion Policy con LeRobot 0.6.1 sobre un dataset MimicGen concreto, y como punto de partida para quien quiera replicar o adaptar el pipeline. No es un modelo generalista ni multilingüe; es un artefacto de investigación en robótica de imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor) |
| Parametros totales | 64.452.231 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de predicción H=16 según el nombre del repo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | panda |
| Entrada observation.state | STATE, shape (9,) |
| Entrada observation.environment_state | ENV, shape (42,) |
| Salida action | ACTION, shape (7,) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el planteamiento de Diffusion Policy: un proceso de difusión que modela la distribución de trayectorias de acción condicionada a las observaciones. El nombre del repositorio indica un batch size de 256 y un horizonte H=16, es decir, la política predice secuencias de 16 pasos de acción. La entrada combina el estado propio del robot (9 dimensiones) con un estado del entorno (42 dimensiones), lo que sugiere una representación basada en estado más que en imágenes puras, aunque la model card menciona cámaras en el ejemplo de rollout.

El entrenamiento se realizó sobre el dataset castanetnicolas/mimicgen_three_piece_assembly_d1_state_objects, con 200 episodios, 67.101 fotogramas a 20 FPS y la tarea de ensamblaje de tres piezas. La configuración reportada es: 200.000 pasos de entrenamiento, batch size 256, optimizador Adam, learning rate 0,0001, semilla 1000 y LeRobot 0.6.1. No se documenta el número total de tokens ni composición del dataset más allá de las cifras de episodios y fotogramas, ni se menciona RLHF, DPO ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de trayectorias de acción multimple paso para manipulación robótica mediante difusión.
- Control visuomotor condicionado a estado del robot y estado del entorno.
- Ejecución de una tarea concreta de ensamblaje de tres piezas (inserción de dos piezas sobre una base).
- Integración con el stack LeRobot para rollout y entrenamiento vía CLI.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-step: no disponible (no aplica en el sentido de LLM; el multi-step se refiere al horizonte de acción H=16).
- Capacidades multilingües: no disponible (no aplica).
- Capacidades especiales: política de imitación entrenada para un robot Panda; no incluye visión, audio ni modo thinking.

## Casos de uso

- Ensamblaje automatizado de precisión: la política está entrenada específicamente para insertar dos piezas sobre una base, una tarea de contacto rico donde la generación de trayectorias suaves de Diffusion Policy reduce los picos de fuerza y mejora la robustez frente a variaciones de posición.
- Investigación en imitación robótica: sirve como referencia reproducible para comparar variantes de Diffusion Policy con otros métodos de imitación sobre el mismo dataset MimicGen, gracias a la configuración de entrenamiento documentada.
- Reentrenamiento y fine-tuning: al estar empaquetada con LeRobot, se puede reutilizar el pipeline `lerobot-train` para adaptar la política a un dataset propio con el mismo esquema de observaciones (state 9 + environment_state 42) y acciones de 7 dimensiones.
- Despliegue en robot Panda real: el ejemplo de `lerobot-rollout` permite ejecutar la política en hardware con cámaras OpenCV a 640x480 y 30 FPS, útil para validar el comportamiento antes de integrarlo en una celda de producción.
- Benchmark de políticas de manipulación: al tener un tamaño de 64,4 M de parámetros y 0,3 GB, se puede usar como baseline ligero en experimentos comparativos de éxito de tarea frente a políticas basadas en comportamiento o en transformers.
- Docencia y formación: el repositorio es un ejemplo completo de artefacto LeRobot con model card, dataset asociado y comandos de ejecución, adecuado para enseñar el flujo completo de entrenamiento y despliegue de una política de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 64,4 M de parámetros en fp32 el peso ronda los 0,26 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060 o superior es suficiente para inferencia, y una RTX 4090 o A100 acelera el entrenamiento.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM considerando overhead de runtime y cámaras.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de cámaras OpenCV; no se documentan vLLM, llama.cpp, Ollama ni TGI porque no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el dataset está a 20 FPS y el ejemplo de rollout usa cámaras a 30 FPS, pero no se reportan cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (diffusion_state_BS_256_H_16) | 64,4 M | H=16 | Ensamblaje de tres piezas (MimicGen d1) | apache-2.0 | Hugging Face |
| Otras políticas Diffusion Policy en LeRobot | no disponible | no disponible | Varía según dataset | habitualmente apache-2.0 | Hugging Face |
| Políticas ACT en LeRobot | no disponible | no disponible | Varía según dataset | habitualmente apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único tipo de robot (Panda); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que no se puede afirmar su robustez en producción.
- Dependencia del esquema de observaciones: requiere exactamente `observation.state` de 9 dimensiones y `observation.environment_state` de 42 dimensiones; cualquier cambio en el entorno o en la configuración de sensores invalida la política.
- Riesgo de alucinación en el sentido de trayectorias no válidas: como modelo generativo, puede producir acciones fuera de distribución ante estados no vistos durante el entrenamiento.
- Sesgos: no documentados; el dataset MimicGen es sintético y puede no reflejar variabilidad real de iluminación, oclusión o fricción.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_state_BS_256_H_16_TASK_three_piece_assembly_ID_174263
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_state_objects
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_state_objects
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
