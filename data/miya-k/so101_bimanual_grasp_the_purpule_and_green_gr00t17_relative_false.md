# miya-k/so101_bimanual_Grasp_the_purpule_and_green_GR00T17_relative_false

## Resumen

`miya-k/so101_bimanual_Grasp_the_purpule_and_green_GR00T17_relative_false` es una política de control robótico entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA. No es un modelo de lenguaje al uso: es un checkpoint de imitación (imitation learning) que traduce observaciones multimodales (cuatro cámaras y el estado de las articulaciones) en comandos de acción de 12 dimensiones para un robot bípedo-so101 bimanual. El autor, miya-k, lo publica como artefacto reproducible de un experimento concreto de manipulación.

La tarea aprendida es una secuencia de agarre y transferencia entre manos: coger un bloque (verde o morado) con la mano izquierda, pasarlo a la derecha y depositarlo en una zona cuadrada. El entrenamiento se realizó sobre un dataset propio de 204 episodios y 130.664 fotogramas a 30 FPS, con 20.000 pasos de optimización y un tamaño de lote de 64.

Su relevancia es doble: por un lado demuestra el flujo completo de LeRobot 0.7.0 con el backend `groot`; por otro, sirve como referencia práctica de cómo se publica y despliega una política de robot learning hoy. El repositorio ocupa 12,6 GB y contiene 3.144.016.000 parámetros en safetensors, aunque no hay métricas de éxito publicadas ni licencia declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching) |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot 0.7.0 |
| Tipo de robot | `bi_so_follower` (bimanual) |
| Cámaras | `right_top`, `left_top`, `right_follower`, `left_follower` |
| Entrada de estado | `observation.state`, forma `(12,)` |
| Entrada visual | 4 imágenes RGB de `(3, 480, 640)` |
| Salida | `action`, forma `(12,)` |
| Dataset de entrenamiento | `miya-k/so101_bimanual_Grasp_the_purpule_and_green` (204 episodios, 130.664 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Tamaño de lote | 64 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Semilla | 42 |
| Tamaño del repositorio | 12,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GR00T N1.7: un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las cuatro vistas de cámara junto con la instrucción de tarea en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera las 12 dimensiones de acción condicionadas por visión, lenguaje y propriocepción. La variante `relative_false` del nombre indica que las acciones se predicen en espacio absoluto y no relativo, un detalle relevante al reproducir el experimento.

El entrenamiento es de imitación supervisada sobre el dataset del propio autor, no un ajuste por refuerzo. Se usaron 20.000 pasos con AdamW, lr 1e-4, lote de 64 y semilla 42, todo orquestado con `lerobot-train` y `--policy.type=groot`. No se documentan aumentos de datos, composición exacta del dataset más allá del número de episodios y fotogramas, ni si hubo fases de RLHF o DPO (no aplicables en este dominio). Tampoco se especifica el reparto train/validación ni el número de tokens vistos.

## Capacidades

- Control robótico bimanual: genera trayectorias de 12 grados de libertad a partir de cuatro cámaras y del estado articular.
- Condicionamiento por lenguaje: acepta instrucciones de tarea en inglés, como "Grasp the green block with your left hand and pass it to your right hand...".
- Manipulación de objetos: agarre, transferencia entre manos y colocación en una zona objetivo.
- Percepción multimodal: fusiona cuatro vistas RGB de 480x640 a 30 FPS con propriocepción.
- Ejecución en tiempo real: pensado para `lerobot-rollout` con `--strategy.type=base` y duración configurable.
- Reentrenamiento: la configuración es reproducible con `lerobot-train` y el dataset público.
- No soporta tool calling, agentes multi-paso ni generación de texto libre; no es un modelo conversacional.

## Casos de uso

- **Automatización de pick-and-place bimanual**: el modelo ejecuta la secuencia completa de agarre, transferencia y colocación en una zona delimitada, lo que permite montar una celda de ensamblaje sencilla con un SO-101 bimanual y cuatro cámaras.
- **Reproducción de experimentos de imitation learning**: al estar el dataset y la configuración completos (20.000 pasos, lote 64, lr 1e-4, semilla 42), sirve como línea base para comparar variantes de GR00T N1.7 en el mismo hardware.
- **Validación de pipelines LeRobot 0.7.0**: útil para verificar la integración de `lerobot-rollout` y `lerobot-train` con el backend `groot` antes de escalar a tareas propias.
- **Investigación en manipulación bimanual**: la tarea de pasar un objeto de una mano a otra es un banco de pruebas clásico para estudiar coordinación entre efectores y planificación visomotora.
- **Docencia y demos de robot learning**: el repositorio de 12,6 GB y la instrucción de tarea en lenguaje natural permiten montar demostraciones reproducibles en laboratorio.
- **Punto de partida para fine-tuning**: aunque no se documenta el procedimiento, el checkpoint puede servir como inicialización para tareas de agarre similares con el mismo robot y distribución de cámaras.
- **Evaluación de robustez ante cambios de iluminación y posición**: al no haber métricas publicadas, es un caso de uso para que terceros midan la degradación del modelo fuera de la distribución de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, ni por tarea ni por número de ensayos.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. Con 3.144 millones de parámetros en safetensors y un repositorio de 12,6 GB, la inferencia en precisión completa requiere previsiblemente más de 12 GB de VRAM, pero el dato exacto no está documentado.
- **GPU recomendadas**: no disponible. El ejemplo de entrenamiento usa `--policy.device=cuda` sin especificar modelo de GPU.
- **GPU de consumo**: no confirmado. No hay información sobre si cabe en una RTX 4090 u otras tarjetas consumer.
- **Despliegue**: `lerobot-rollout` con `--strategy.type=base` para ejecución en robot; `lerobot-train` con `--policy.type=groot` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles. La captura de cámara está fijada a 30 FPS, pero no se indica la latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 fine-tuned) | 3.144.016.000 | no disponible | Agarre bimanual SO-101 | no disponible | Hugging Face, 0 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitation learning por tarea | habitualmente Apache-2.0 en LeRobot | Hugging Face Hub |

La comparación cuantitativa no es posible: no hay benchmarks publicados para este checkpoint ni cifras de referencia en la información disponible para las alternativas.

## Limitaciones y advertencias

- **Sin métricas de éxito**: no hay evaluación en robot real, por lo que se desconoce la tasa de acierto de la tarea.
- **Licencia no declarada**: la model card marca la licencia como "More Information Needed"; no se puede asumir uso comercial.
- **Sesgo de dominio**: entrenado exclusivamente con bloques verde y morado en una zona cuadrada concreta; se espera degradación con otros objetos, posiciones o iluminación.
- **Dependencia de hardware**: las cuatro cámaras y sus nombres (`right_top`, `left_top`, `right_follower`, `left_follower`) deben coincidir exactamente con los del entrenamiento; cualquier cambio de montaje invalida la política.
- **Riesgo de alucinación motora**: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento, con riesgo físico para el robot y el entorno.
- **Idioma**: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- **Variante `relative_false`**: las acciones son absolutas, lo que puede afectar a la transferibilidad entre robots con calibraciones distintas.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta; no hay validación por parte de la comunidad.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-27, dato a verificar antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/miya-k/so101_bimanual_Grasp_the_purpule_and_green_GR00T17_relative_false
- Dataset: https://huggingface.co/datasets/miya-k/so101_bimanual_Grasp_the_purpule_and_green
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=miya-k/so101_bimanual_Grasp_the_purpule_and_green
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
