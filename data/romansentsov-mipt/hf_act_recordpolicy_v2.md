# RomanSentsov-MIPT/hf_act_recordpolicy_v2

## Resumen

El modelo `hf_act_recordpolicy_v2`, publicado por el usuario RomanSentsov-MIPT, es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), presentado en el paper arXiv:2304.13705. En lugar de predecir un único paso de acción, ACT predice fragmentos cortos de acciones (action chunks), lo que reduce el error acumulado y suele mejorar las tasas de éxito en tareas de manipulación aprendidas a partir de demostraciones teleoperadas. El modelo se ha entrenado y publicado con la librería LeRobot de Hugging Face.

La política está especializada en un robot concreto: el Unitree G1 de 29 grados de libertad con manos Inspire y tres cámaras (`cam_head`, `cam_right_wrist`, `cam_left_wrist`). Consume el estado articular de 29 dimensiones y tres imágenes RGB de 480x640, y produce un vector de acción de 29 dimensiones a 30 FPS. El entrenamiento se realizó sobre el dataset `RomanSentsov-MIPT/2_sku_box_25ep_v2`, con 21 episodios, 31.626 fotogramas y la tarea "record demonstration".

Se trata de un modelo de nicho, con 51,7 millones de parámetros y un repositorio de 0,2 GB, orientado a reproducir una tarea de grabación de demostraciones en un robot humanoide concreto. No es un modelo de lenguaje ni un modelo multimodal de propósito general: es una política visuomotora de imitación, y su relevancia radica en servir como ejemplo reproducible del flujo de trabajo de LeRobot para entrenar y desplegar políticas ACT en hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.715.741 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política visuomotora, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un cuello de botella latente de estilo CVAE y un decodificador que emite fragmentos de acción. La política recibe observaciones multimodales (estado articular de 29 dimensiones y tres cámaras RGB de 480x640) y genera acciones de 29 dimensiones. El entrenamiento se realizó con LeRobot 0.7.1 durante 20.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000.

El dataset de entrenamiento contiene 21 episodios y 31.626 fotogramas a 30 FPS, correspondientes a la tarea "record demonstration". No se documentan en la información disponible detalles sobre aumentos de datos, composición exacta del dataset ni técnicas de regularización adicionales. Tampoco se indica si se aplicó RLHF, DPO u otro ajuste posterior; en el contexto de ACT, el entrenamiento es puramente supervisado sobre demostraciones teleoperadas.

## Capacidades

- Generación de acciones de control para un robot Unitree G1 de 29 grados de libertad con manos Inspire y cintura.
- Percepción visual multimodal a partir de tres cámaras: cabeza y ambas muñecas.
- Predicción de fragmentos de acción (action chunking) para reducir el error acumulado en tareas de manipulación.
- Ejecución de la tarea de grabación de demostraciones ("record demonstration") aprendida por imitación.
- Integración con el ecosistema LeRobot para rollout, entrenamiento y evaluación.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras capacidades especiales más allá de la política visuomotora.

## Casos de uso

- Reproducción de la tarea de grabación de demostraciones en un Unitree G1: la política ejecuta la secuencia aprendida a partir de las tres cámaras y el estado articular, adecuada para validar el pipeline de LeRobot en hardware real.
- Recolección de datos para un nuevo dataset: usar la política como base para generar episodios adicionales que amplíen el dataset `2_sku_box_25ep_v2` y mejoren la cobertura de la tarea.
- Prototipado de políticas ACT en robótica humanoide: sirve como referencia reproducible de configuración (20.000 pasos, batch 8, lr 1e-5) para entrenar políticas similares en robots de 29 DoF.
- Evaluación de infraestructura de inferencia robótica: permite medir latencia y throughput de LeRobot en un robot con tres cámaras a 30 FPS y validar la sincronización de observaciones.
- Benchmark interno de imitación: al ser un modelo pequeño (51,7 M de parámetros), se puede usar como línea base para comparar variantes de ACT, cambios en el dataset o nuevas arquitecturas.
- Docencia y formación: ejemplo completo de flujo LeRobot (grabación, entrenamiento, rollout) para cursos de aprendizaje por imitación en robótica.
- Integración en pipelines de investigación: punto de partida para experimentar con action chunking, cuellos de botella CVAE y fusión de múltiples cámaras en robots humanoides.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso en FP32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no disponible; por tamaño, una RTX 3060 o superior sería suficiente, aunque no hay datos oficiales de latencia.
- Cabe en GPU consumer: sí, por el tamaño del modelo (51,7 M de parámetros) y el repositorio de 0,2 GB.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de CUDA mediante `--policy.device=cuda` en entrenamiento; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a una política robótica).
- Latencia y throughput estimados: no disponibles; el sistema opera a 30 FPS según el dataset, pero no se publican medidas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RomanSentsov-MIPT/hf_act_recordpolicy_v2` (ACT) | 51,7 M | no aplica | sin evaluación publicada | no disponible | Hugging Face (LeRobot) |
| ACT original (paper arXiv:2304.13705) | no disponible en la información | no aplica | resultados en el paper original | no disponible | paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible | no aplica | no disponible | no disponible | ecosistema LeRobot |

No se dispone de datos comparativos de rendimiento entre esta política y alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real de la política en el robot objetivo.
- Especialización extrema: entrenada para un robot concreto (Unitree G1 29 DoF con manos Inspire y tres cámaras) y una única tarea ("record demonstration"); no es transferible a otros robots o tareas sin reentrenamiento.
- Dataset pequeño: 21 episodios y 31.626 fotogramas, lo que limita la generalización ante cambios de posición de objetos, iluminación o distractores.
- Licencia no especificada: la model card indica "[More Information Needed]", por lo que el uso comercial no está autorizado de forma explícita.
- Riesgo de sobreajuste a las condiciones de grabación y a la configuración exacta de cámaras; cambios en la resolución, el montaje o la calibración pueden degradar el comportamiento.
- No apta para tareas de lenguaje, razonamiento simbólico ni agentes multi-paso; su ámbito es exclusivamente el control visuomotor.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo esperable en políticas de imitación.
- Dependencia de la versión de LeRobot (0.7.1) y de la configuración de hardware; la reproducibilidad requiere el mismo robot y montaje de cámaras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RomanSentsov-MIPT/hf_act_recordpolicy_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/RomanSentsov-MIPT/2_sku_box_25ep_v2
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RomanSentsov-MIPT/2_sku_box_25ep_v2
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
