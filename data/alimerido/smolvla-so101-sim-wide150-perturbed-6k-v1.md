# alimerido/smolvla-so101-sim-wide150-perturbed-6k-v1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots reales con costes computacionales reducidos y capacidad de despliegue en hardware de consumo. Esta ficha concreta, publicada por el usuario `alimerido`, es un fine-tuning del modelo base SmolVLA sobre un dataset propio de simulación para el robot SO-101 (seguidor de 6 grados de libertad), orientado a la tarea de recoger un cubo rojo y depositarlo en una caja azul.

El checkpoint contiene 450.046.176 parámetros en formato safetensors y se distribuye a través de la librería LeRobot, que gestiona tanto el entrenamiento como la inferencia sobre robots físicos. La política consume el estado articular del robot (vector de 6 dimensiones) y tres cámaras (256x256 píxeles cada una) para producir un vector de acción de 6 dimensiones. El entrenamiento se realizó durante 6000 pasos con batch de 64 sobre 150 episodios y 81.152 fotogramas a 30 FPS.

Su relevancia radica en que demuestra el flujo completo de imitación de bajo coste: un modelo VLA pequeño, entrenado con datos sintéticos perturbados y desplegable con una sola orden de LeRobot. No obstante, se trata de un checkpoint de investigación sin evaluación publicada, sin licencia declarada y con cero descargas, por lo que debe considerarse un artefacto experimental más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), política de imitación sobre backbone VLM compacto |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en los ejemplos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.6.2) |
| Tipo de robot | so_follower (SO-101) |
| Entradas | observation.state (6,), 3 camaras visuales (3, 256, 256) |
| Salidas | action (6,) |
| Tamano del repo | 0.9 GB |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación que combina un codificador visual-lenguaje compacto con un cabezal de acciones, siguiendo el planteamiento del paper arXiv:2506.01844. El modelo procesa observaciones multimodales (estado articular y hasta tres cámaras) junto con una instrucción de tarea en lenguaje natural, y emite directamente un vector de acción de 6 dimensiones correspondiente a las articulaciones del robot SO-101. La arquitectura está pensada para inferencia en hardware de consumo, lo que la diferencia de VLA de mayor tamaño como RT-2 o OpenVLA.

El entrenamiento de este checkpoint se realizó mediante aprendizaje por imitación supervisado sobre el dataset `alimerido/so101-sim-wide150-perturbed-v1`: 150 episodios, 81.152 fotogramas a 30 FPS, una única tarea ("Grab the red cube, place it in the blue box") en entorno simulado con perturbaciones. Se usaron 6000 pasos, batch de 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta uso de RLHF, DPO ni decodificación especulativa; tampoco se especifica la composición exacta de las perturbaciones ni el número de tokens de entrenamiento del backbone.

## Capacidades

- Control robótico de manipulación: genera acciones articulares de 6 dimensiones para el robot SO-101 a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa tres flujos de imagen de 256x256 (cámara superior y de muñeca, según la model card).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto ("Grab the red cube, place it in the blue box").
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones simuladas.
- Despliegue en hardware de consumo: el tamaño del modelo (450 M parámetros) permite ejecución en GPU de gama media.
- Integración con LeRobot: comandos `lerobot-rollout` y `lerobot-train` para inferencia y reentrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas ni generación de texto libre; es una política de control, no un asistente conversacional.

## Casos de uso

- Manipulación pick-and-place en simulación: el caso directo del checkpoint es recoger un cubo rojo y colocarlo en una caja azul; sirve como banco de pruebas para validar pipelines de imitación antes de pasar a hardware real.
- Prototipado de políticas VLA en investigación: investigadores pueden partir de este checkpoint para estudiar robustez frente a perturbaciones en entornos simulados con el robot SO-101.
- Base para fine-tuning con datos propios: al ser un checkpoint LeRobot, puede reentrenarse con `lerobot-train` sobre un dataset propio del mismo robot y tarea similar, reduciendo el coste frente a entrenar desde cero.
- Evaluación de infraestructura de despliegue: útil para medir latencia y throughput de SmolVLA en GPUs de consumo dentro de un flujo LeRobot real.
- Docencia y demostraciones de aprendizaje por imitación: el modelo y su dataset asociado permiten ilustrar el ciclo completo de grabación, entrenamiento y rollout en robótica.
- Pruebas de generalización con datos perturbados: el dataset de entrenamiento incluye perturbaciones, lo que permite estudiar la degradación del rendimiento al variar posiciones, iluminación o distracciones, siempre que se realicen evaluaciones propias.
- No se recomienda su uso en producción real sin una evaluación previa: la model card indica explícitamente que no se han proporcionado resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, métricas de MMLU, HumanEval, GSM8K ni equivalentes para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parámetros en safetensors (aproximadamente 1,8 GB en fp32 o 0,9 GB en fp16), se estima un consumo de VRAM en el rango de 1 a 4 GB según precisión y overhead, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, es plausible su ejecución en GPUs de consumo como RTX 3060, RTX 4060 o superiores; no se confirma compatibilidad con A100/H100 más allá de que cualquier GPU CUDA moderna puede alojar el modelo.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del checkpoint, aunque no hay confirmación oficial ni requisitos mínimos publicados.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path`; el entrenamiento se realiza con `lerobot-train` y `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de control.
- Latencia y throughput: no disponibles. La inferencia se ejecuta a 30 FPS en el dataset de entrenamiento, pero no se publican cifras de latencia por paso ni throughput medido.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla-so101-sim-wide150-perturbed-6k-v1 | 450 M | VLA (SmolVLA fine-tuned) | Estado 6D + 3 camaras 256x256 | no disponible | Hugging Face (0 descargas) |
| SmolVLA base (Hugging Face) | no disponible en esta ficha | VLA | multimodal | no disponible en esta ficha | Hugging Face |
| OpenVLA | no disponible en esta ficha | VLA | multimodal | no disponible en esta ficha | Hugging Face |
| RT-2 | no disponible en esta ficha | VLA | multimodal | propietaria (Google DeepMind) | no publico |

No se dispone de datos de rendimiento comparativos en la información proporcionada; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "License: [More Information Needed]", por lo que no se autoriza explícitamente ningún uso, incluido el comercial.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real; el autor no proporciona resultados de evaluación.
- Entrenamiento exclusivamente en simulación: el dataset es sintético y con perturbaciones, pero no se documenta la brecha sim-a-real (sim-to-real gap) ni pruebas en hardware físico.
- Tarea única y estrecha: el modelo está entrenado para una sola instrucción ("Grab the red cube, place it in the blue box") y un único tipo de robot (SO-101); no generaliza a otras tareas sin reentrenamiento.
- Dependencia de las cámaras de entrenamiento: los nombres y la configuración de las cámaras deben coincidir con las claves de observación del entrenamiento (`top`, `wrist`), lo que limita la portabilidad.
- Riesgo de sobreajuste al entorno simulado: con solo 150 episodios y 6000 pasos, la diversidad de datos es limitada.
- Idiomas: no se documenta soporte multilingüe; los ejemplos de instrucción están en inglés.
- Sin datos de sesgos, alucinación o robustez: al ser una política de control, los riesgos se centran en fallos de manipulación y comportamientos inseguros en robot real, no evaluados.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alimerido/smolvla-so101-sim-wide150-perturbed-6k-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/alimerido/so101-sim-wide150-perturbed-v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=alimerido/so101-sim-wide150-perturbed-v1
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
