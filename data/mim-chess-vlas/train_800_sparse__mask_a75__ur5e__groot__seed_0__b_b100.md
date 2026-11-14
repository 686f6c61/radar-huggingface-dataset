# mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__b_b100

## Resumen

Este repositorio contiene una política de imitación robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA, un modelo abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. La política está especializada en una única tarea de manipulación pick-and-place sobre un brazo UR5e: coger un objeto de una lista cerrada de 40 categorías (jam, cereal, pear, sweet potato, etc.) y depositarlo en una caja. El checkpoint se ha entrenado con 739 episodios y 182.078 frames a 20 FPS procedentes de un dataset simulado con tres cámaras.

El modelo combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción. Con 3.144.016.000 parámetros totales y un tamaño de repositorio de 50,3 GB, es un modelo grande para los estándares de políticas robóticas, lo que refleja el peso del backbone VLM subyacente. La licencia es Apache 2.0.

Es relevante porque ejemplifica el patrón actual de reutilizar modelos fundacionales de robótica (GR00T) y ajustarlos vía imitación para tareas concretas con LeRobot, un ecosistema que estandariza el entrenamiento y despliegue de políticas. No obstante, se trata de un artefacto de investigación con muy baja adopción (17 descargas, 0 likes) y un ámbito de aplicación muy restringido al entorno simulado y al robot específico con el que se entrenó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone VLM Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las observaciones visuales y la instrucción de tarea en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera las acciones condicionadas por la representación multimodal y el estado proprioceptivo del robot. Las entradas son el estado del robot (vector de 9 dimensiones) y tres cámaras RGB a 224x224 (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`); la salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 durante 60.000 pasos, batch size 16, optimizador AdamW y learning rate 7e-5, con semilla 0. El dataset consta de 739 episodios y 182.078 frames a 20 FPS, generados en simulación con instrucciones de tarea del tipo "Pick the <objeto> and place it into the box" para 40 objetos distintos. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineamiento posteriores al ajuste por imitación.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por visión, lenguaje y propiocepción (política visuomotora).
- Ejecución de tareas pick-and-place sobre una lista cerrada de 40 objetos (alimentos, utensilios, menaje) hacia una caja destino.
- Procesamiento de instrucciones de tarea en lenguaje natural en inglés con la plantilla "Pick the <objeto> and place it into the box".
- Fusión de tres vistas de cámara (vista de agente y dos cámaras en el efector) con el estado proprioceptivo de 9 dimensiones.
- Control de un brazo UR5e con salida de acción de 7 dimensiones.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Automatización de pick-and-place en laboratorio simulado: la política se ejecuta con `lerobot-rollout` sobre un UR5e en el simulador para validar pipelines de imitación antes de transferir a hardware real.
- Benchmark de referencia para comparar configuraciones de GR00T en LeRobot: al fijar semilla 0, 60.000 pasos y batch 16, sirve como baseline reproducible frente a otras variantes del mismo autor (por ejemplo, con máscara a 0,75 o sin overlay).
- Investigación en cross-embodiment: permite estudiar cómo un backbone VLM grande se adapta a un brazo industrial concreto mediante ajuste por imitación con pocos datos (739 episodios).
- Generación de datos sintéticos de manipulación: las trayectorias producidas pueden usarse para aumentar datasets o para evaluar robustez frente a variaciones de objeto.
- Docencia y formación en robótica de imitación: el repositorio incluye comandos de despliegue y enlaces a la guía de LeRobot, lo que facilita reproducir el flujo completo de entrenamiento y rollout.
- Evaluación de políticas multimodales con múltiples cámaras: el uso de tres vistas permite analizar la contribución de la cámara en el efector frente a la vista global en tareas de agarre.
- Pruebas de integración de LeRobot 0.6.0 con GR00T: útil para verificar compatibilidad de versiones y el formato de observaciones/acciones en pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.144 millones de parámetros, en FP16 serían necesarios aproximadamente 6,3 GB solo para pesos; en BF16/FP16 con overhead de activaciones y del backbone VLM, es razonable prever un mínimo de 12-16 GB, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no disponible. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 serían candidatas razonables, pero no hay confirmación del autor.
- Compatibilidad con GPU de consumo: probable en tarjetas con 16 GB o más en precisión reducida, sin confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), según la model card. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI, que además no encajan con una política de acciones.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 20 FPS, pero no se publica latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 ajustado, UR5e) | 3.144.016.000 | no disponible | Pick-and-place simulado, 40 objetos | Apache 2.0 | Hugging Face, 17 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub Isaac-GR00T |
| Otras variantes del mismo autor (p. ej. `mask__overlay_a75`, `seed_0`, `b_b100`) | no disponible | no disponible | Pick-and-place simulado | Apache 2.0 | Hugging Face |
| Políticas de imitación tipo ACT/Diffusion Policy en LeRobot | no disponible | no disponible | Manipulación con imitación | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: entrenado exclusivamente para pick-and-place de 40 objetos concretos hacia una caja; no generaliza a otras tareas sin reentrenamiento.
- Entrenado en simulación: el dataset es `sim`, por lo que el gap sim-to-real puede degradar el rendimiento en un UR5e físico.
- Dependencia del robot y cámaras exactas: requiere un UR5e y la configuración de tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) con las mismas resoluciones.
- Instrucciones en inglés con plantilla fija; no se documenta soporte multilingüe.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de acciones erróneas o inseguras fuera de distribución; no hay evaluación de seguridad publicada.
- Sesgos: no documentados; el dataset cubre una lista cerrada de objetos y un único entorno simulado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 y sus dependencias deben verificarse por separado.
- Adopción muy baja (17 descargas, 0 likes) y sin benchmarks publicados; no se recomienda para producción sin validación propia.
- Tamaño de repositorio de 50,3 GB, lo que complica el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__b_b100
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- GR00T N1.7 (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
