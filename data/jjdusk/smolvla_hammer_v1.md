# JJDUSK/smolvla_hammer_v1

## Resumen
JJDUSK/smolvla_hammer_v1 es una política robótica de tipo vision-language-action (VLA) publicada por JJDUSK en Hugging Face, fine-tuneada desde lerobot/smolvla_base con la librería LeRobot. El modelo tiene 450.046.176 parámetros y está especializado en la tarea "pick up the hammer" sobre un robot SO-101 follower (`so_follower`), usando estado articular e imágenes de 256×256 para producir acciones de 6 dimensiones.

SmolVLA se presenta como un VLA compacto y eficiente, con despliegue previsto en hardware de consumo. Este fine-tune concreto se entrenó con el dataset JJDUSK/so101_hammer, compuesto por 80 episodios y 22.887 frames a 30 FPS. No incluye resultados de evaluación publicados, por lo que su utilidad práctica debe validarse en el robot y entorno de destino.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; detalles internos (transformer denso, MoE o híbrido) no disponibles |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible; no se indica que sea MoE |
| Longitud de contexto | no disponible; política robótica sin ventana de contexto textual documentada |
| Tipos de cuantización | no disponible; el repo contiene safetensors y no se documentan variantes cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101 follower) |
| Cámaras documentadas | front, wrist |
| Entradas | observation.state `(6,)`; observation.images.camera1/2/3 `(3, 256, 256)` |
| Salidas | action `(6,)` |
| Tarea entrenada | "pick up the hammer" |
| Dataset | JJDUSK/so101_hammer: 80 episodios, 22.887 frames, 30 FPS |
| Entrenamiento | 15.000 pasos; batch 32; AdamW; lr 0,0001; seed 1000; LeRobot 0.6.1 |
| Tamaño del repo | 4,0 GB |

## Arquitectura y entrenamiento
La información disponible describe SmolVLA como un modelo VLA compacto y eficiente, orientado a reducir coste computacional y a poder desplegarse en hardware de consumo. No se detalla en la model card la composición exacta del backbone, el número de tokens del preentrenamiento base ni si el entrenamiento incluyó etapas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa, atención lineal o action chunking.

El fine-tune documentado es una política de imitación entrenada con LeRobot sobre el dataset so101_hammer. Consume `observation.state` de dimensión 6 y tres imágenes de 3×256×256, y produce un vector de acción de dimensión 6 para el robot `so_follower`. El entrenamiento se realizó durante 15.000 pasos, con batch de 32, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.1, sobre 80 episodios y 22.887 frames a 30 FPS de la tarea "pick up the hammer".

## Capacidades
- Generación de acciones robóticas de 6 dimensiones para el robot `so_follower` a partir de estado articular e imágenes.
- Manipulación visual para la tarea "pick up the hammer" (recoger un martillo).
- Procesamiento de tres entradas visuales de 256×256 según la tabla de inputs; la model card nombra las cámaras `front` y `wrist`.
- Ejecución de políticas de imitación en LeRobot mediante `lerobot-rollout`.
- Fine-tuning posterior con `lerobot-train` sobre nuevos datasets de robot.
- No se documentan tool calling, function calling, soporte de agentes, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni modo thinking.
- No se documentan capacidades multilingües; no es un LLM de propósito general.

## Casos de uso
- Recogida de martillo en banco de pruebas SO-101: ejecutar `lerobot-rollout` con la tarea "pick up the hammer"; el checkpoint está entrenado exactamente para esa tarea y ese tipo de robot.
- Evaluación de robustez de políticas de imitación: repetir rollouts variando posición del martillo, iluminación y calibración para medir sensibilidad, registrando éxito y fallo, ya que no hay evaluación publicada.
- Docencia y formación en VLA con LeRobot: reproducir el pipeline de inferencia y entrenamiento con un modelo de 450 millones de parámetros y un repo de 4,0 GB.
- Punto de partida para fine-tuning de nuevas tareas de manipulación: reentrenar con `lerobot-train` usando nuevos datasets de SO-101 y el modelo base o este checkpoint.
- Prototipado de automatización de laboratorio: integrar la política en un puesto de recogida de herramientas, con validación previa y medidas de seguridad.
- Investigación en aprendizaje por imitación con datasets pequeños: analizar el efecto de 80 episodios y 22.887 frames en el comportamiento final.
- Pruebas de integración de cámaras y calibración: verificar las claves `observation.images.camera1`, `camera2` y `camera3`, y la consistencia con las cámaras `front` y `wrist`.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica: "No evaluation results have been provided for this policy yet."

| Benchmark | Resultado |
|---|---|
| Evaluación en robot real | no publicada |
| Tasa de éxito en "pick up the hammer" | no disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de LLM | no aplica / no disponible |

## Requisitos de hardware
- VRAM estimada para pesos: FP32 ≈ 1,8 GB; BF16/FP16 ≈ 0,9 GB; 8 bits ≈ 0,45 GB; 4 bits ≈ 0,23 GB. Son cálculos a partir de 450.046.176 parámetros y no incluyen activaciones, imágenes, buffers ni overhead del runtime.
- Con tres imágenes de 256×256 y el runtime de LeRobot, es necesario reservar margen adicional; no hay cifras oficiales de VRAM total para este checkpoint.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090 para inferencia en consumo; A100 o H100 para entrenamiento o lotes grandes.
- El modelo cabe en GPU de consumo según el planteamiento de SmolVLA, pero no hay validación específica publicada para este fine-tune.
- Despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), PyTorch y safetensors. No se documentan vLLM, llama.cpp, Ollama ni TGI para esta política.
- Latencia y throughput: no disponibles. El dataset está a 30 FPS, pero no se documenta latencia de inferencia.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JJDUSK/smolvla_hammer_v1 | 450.046.176 | no disponible | sin evaluación publicada | Apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face, referenciado como base |
| Otras políticas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se aportan cifras verificadas de alternativas como OpenVLA, Octo o pi0 en la información proporcionada, por lo que no se comparan numéricamente para no inventar datos.

## Limitaciones y advertencias
- Especialización estrecha: una única tarea y un único tipo de robot; no es un modelo general de manipulación.
- Dataset pequeño: 80 episodios y 22.887 frames; existe riesgo de sobreajuste y baja generalización a nuevos entornos.
- Sin evaluación publicada: no se conoce la tasa de éxito real ni la robustez del checkpoint.
- Sensibilidad esperable a posición del objeto, iluminación, calibración y colocación de cámaras; no cuantificada en la información disponible.
- Inconsistencia documental: la model card nombra las cámaras `front` y `wrist`, mientras que la tabla de inputs usa `camera1`, `camera2` y `camera3`; hay que verificar las claves antes de ejecutar.
- No es un LLM: no ofrece tool calling, agentes, generación de texto, código, matemáticas ni audio, y no tiene ventana de contexto textual.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar avisos de licencia y cumplir las cláusulas de patentes; revisar obligaciones antes de distribuir.
- Riesgo de acciones físicas incorrectas: usar límites de seguridad, parada de emergencia y supervisión humana en pruebas reales.
- No se documentan sesgos; el sesgo operativo provendrá del entorno, del dataset y de la configuración del robot.
- El repo ocupa 4,0 GB y no se documentan cuantizaciones oficiales.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/JJDUSK/smolvla_hammer_v1)
- [Dataset JJDUSK/so101_hammer](https://huggingface.co/datasets/JJDUSK/so101_hammer)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Paper SmolVLA en Hugging Face](https://huggingface.co/papers/2506.01844)
- [arXiv 2506.01844](https://arxiv.org/abs/2506.01844)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de imitación y entrenamiento](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia](https://huggingface.co/docs/lerobot/main/en/inference)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=JJDUSK/so101_hammer)
