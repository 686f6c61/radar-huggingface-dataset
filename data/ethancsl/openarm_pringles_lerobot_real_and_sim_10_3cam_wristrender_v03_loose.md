# ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_wristrender_v03_loose

## Resumen

`ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_wristrender_v03_loose` es una política de visión-lenguaje-acción (VLA) afinada a partir de `lerobot/smolvla_base`, el modelo compacto SmolVLA presentado en el artículo arXiv 2506.01844. El modelo resuelve una tarea robótica concreta de manipulación bimanual: coger una lata de Pringles con el brazo derecho y pasarla al brazo izquierdo, sobre el robot `openarm_umeow` con tres cámaras (cuerpo y dos muñecas).

Se trata de un fine-tuning de imitación supervisada (behavior cloning) sobre un dataset propio de 148 episodios y 38 223 fotogramas a 30 FPS, que mezcla datos reales y simulados. Con 450 millones de parámetros y pesos en safetensors, el modelo está pensado para desplegarse en hardware de consumo, no en clústeres de GPU.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo LeRobot (grabación de datos, entrenamiento, rollout) para una tarea de transferencia entre brazos, y como punto de partida para quien quiera replicar el flujo con su propio robot o dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parámetros totales | 450 046 176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de acción robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/smolvla_base` |
| Tipo de robot | `openarm_umeow` |
| Cámaras | `body_cam`, `wrist_cam`, `right_wrist_cam` |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entradas visuales | 3 × `(3, 256, 256)` |
| Salida de acción | `action`, forma `(16,)` |
| Tamaño del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que combina un codificador visual y de lenguaje con un decodificador de acciones, diseñado para inferencia en hardware de consumo. El modelo parte de los pesos preentrenados de `lerobot/smolvla_base` y se afina mediante imitación sobre las observaciones y acciones del dataset indicado. La política consume el estado articular de 6 dimensiones y tres imágenes RGB de 256×256, y emite un vector de acción de 16 dimensiones por paso.

El entrenamiento se realizó con LeRobot 0.6.2 durante 20 000 pasos, batch de 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset de afinado contiene 148 episodios y 38 223 fotogramas a 30 FPS, con una única tarea descrita como "Pick up the Pringles can with the right arm, hand it to the left arm", y combina datos reales y simulados con renderizado de muñeca. No se documentan detalles sobre el preentrenamiento de la base (número de tokens, composición del corpus, uso de RLHF/DPO) en la información disponible.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones multimodales (estado articular + 3 vistas RGB).
- Control bimanual: la tarea implica coordinación entre brazo derecho e izquierdo para transferir un objeto.
- Percepción visual con tres cámaras, incluida vista de muñeca, útil para agarre fino.
- Ejecución de una política de imitación entrenada para una tarea única y específica.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes de texto ni razonamiento multi-paso en el sentido de un LLM.
- Capacidades multilingües: no aplicables (no es un modelo de lenguaje generativo).

## Casos de uso

- Replicación de la tarea de transferencia bimanual: desplegar la política en un robot `openarm_umeow` calibrado con las tres cámaras para reproducir el pick-and-handover de la lata de Pringles, usando `lerobot-rollout` con la tarea exacta del dataset.
- Base para fine-tuning con datos propios: partir de estos pesos o de `lerobot/smolvla_base` y entrenar con `lerobot-train` sobre un dataset nuevo, aprovechando la receta de hiperparámetros documentada (20k pasos, batch 64, lr 1e-4).
- Estudio de sim-to-real: el dataset mezcla datos reales y simulados con renderizado de muñeca, por lo que sirve para analizar cómo afecta esa mezcla al rendimiento en el robot físico.
- Docencia y prototipado en robótica de imitación: ejemplo completo y ligero (0,9 GB, 450 M de parámetros) para enseñar el ciclo grabación-entrenamiento-despliegue con LeRobot.
- Benchmark interno de políticas VLA compactas: al ser un fine-tuning acotado, permite comparar variantes de dataset (número de cámaras, renderizado, proporción real/sim) manteniendo la arquitectura.
- Prueba de despliegue en hardware de consumo: validar latencia y estabilidad de SmolVLA en una estación con GPU de gama media antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en FP32 los pesos ocupan aproximadamente 1,8 GB, y en FP16/BF16 alrededor de 0,9 GB, a lo que hay que sumar el codificador visual y los buffers de activación.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar el modelo; el artículo de SmolVLA lo orienta a hardware de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y el resto del stack LeRobot; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolVLA fine-tuned) | 450 M | no disponible | Pick-and-handover bimanual (openarm_umeow) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | Base VLA general para fine-tuning | no disponible en la información | Hugging Face |
| Políticas tipo ACT / Diffusion Policy en LeRobot | no disponible | no disponible | Imitación robótica por tarea | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea y un único robot (`openarm_umeow`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida, por lo que el rendimiento real es desconocido.
- Dependencia estricta de la configuración de cámaras: los nombres e índices deben coincidir con las claves de observación del entrenamiento (`body_cam`, `wrist_cam`, `right_wrist_cam`).
- Dataset pequeño (148 episodios, 38 223 fotogramas): riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- Mezcla real/sim no cuantificada en la model card: se desconoce la proporción y su impacto en el rendimiento sim-to-real.
- Riesgo de alucinación no aplica en el sentido de un LLM, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento; requiere supervisión y paradas de emergencia en el robot.
- Sesgos: no documentados; en robótica de imitación los sesgos provienen de las condiciones del dataset (posiciones, objetos, entorno del operador).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_wristrender_v03_loose
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_wristrender_v03_loose
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_wristrender_v03_loose
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv 2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
