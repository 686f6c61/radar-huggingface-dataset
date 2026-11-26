# hubnemo/so101_smolvla_lora_v2_03_expert_all_r16_bs16_25k

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y de estado, generando comandos de acción de bajo nivel. El modelo base `lerobot/smolvla_base` se describe en el paper arXiv:2506.01844 como una alternativa eficiente que alcanza rendimiento competitivo con un coste computacional reducido, permitiendo su despliegue en hardware de consumo.

La ficha que nos ocupa, `hubnemo/so101_smolvla_lora_v2_03_expert_all_r16_bs16_25k`, es un adaptador LoRA (r=16, batch size 16, 25.000 pasos) afinado sobre dicho modelo base para una tarea concreta de manipulación con el robot `so101_follower`: coger un cubo morado e introducirlo en una caja de cartón, ignorando el resto de objetos. El entrenamiento se realizó con el dataset `Orellius/so101_sort_cubes_no_top` (77 episodios, 54.777 frames a 30 FPS) usando LeRobot 0.7.1.

Es relevante porque ejemplifica el flujo actual de imitación robótica de bajo coste: un VLA pequeño, un adaptador LoRA ligero y un pipeline reproducible con `lerobot-train` / `lerobot-rollout`. No obstante, se trata de una política muy especializada, sin resultados de evaluación publicados y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de imitación por pasos, no modelo conversacional) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural libre; recibe una instrucción de tarea fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de adaptación | LoRA (r=16) sobre `lerobot/smolvla_base` |
| Robot objetivo | `so101_follower` |
| Cámaras | `front` |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `Orellius/so101_sort_cubes_no_top` (77 episodios, 54.777 frames, 30 FPS) |
| Pasos de entrenamiento | 25.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 0,0005 |
| Seed | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rango 16) aplicado sobre `lerobot/smolvla_base`, un VLA compacto presentado en el paper SmolVLA (arXiv:2506.01844). La arquitectura exacta del backbone (número de capas, dimensión oculta, codificador visual, etc.) no se detalla en la model card; únicamente se indica que combina percepción visual y estado proprioceptivo para producir acciones, y que está pensado para ejecutarse en hardware de consumo. Las entradas son una imagen frontal de 480×640 píxeles y un vector de estado de 6 dimensiones; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó por imitación supervisada sobre el dataset `Orellius/so101_sort_cubes_no_top`, compuesto por 77 episodios y 54.777 frames grabados a 30 FPS con una única instrucción de tarea: "Grab the purple cube and put it into the cardboard box, ignore the other objects". Se usaron 25.000 pasos, batch size 16, AdamW con learning rate 5e-4 y seed 1000, todo gestionado con LeRobot 0.7.1. No se documenta el uso de RLHF, DPO ni ningún esquema de refuerzo; tampoco se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá del recuento de episodios y frames.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 grados de libertad para el robot `so101_follower` a partir de una imagen frontal y del estado del robot.
- Ejecución de una tarea concreta de pick-and-place: coger el cubo morado e introducirlo en una caja de cartón, ignorando otros objetos presentes en la escena.
- Percepción visual en resolución 480×640 con una única cámara frontal.
- Condicionamiento por instrucción de tarea en lenguaje natural (texto fijo de la tarea de entrenamiento).
- Despliegue en hardware de consumo, según las afirmaciones del paper del modelo base.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo "thinking"; es una política de imitación, no un modelo conversacional.

## Casos de uso

- Clasificación de cubos en línea de montaje: el modelo puede ejecutar la tarea de recogida selectiva de un cubo concreto e introducirlo en un contenedor, integrándose en una celda robotizada de laboratorio o docencia con el brazo SO-101.
- Prototipado rápido de políticas de imitación: sirve como punto de partida para validar el pipeline `lerobot-train` / `lerobot-rollout` antes de invertir en datasets mayores, gracias a su naturaleza de adaptador LoRA ligero.
- Investigación en aprendizaje por imitación: útil para estudiar el efecto del rango LoRA, el número de pasos o el tamaño del dataset en tareas de manipulación con distractores, dado que la configuración de entrenamiento está documentada.
- Demostraciones educativas de VLA: permite mostrar en un curso o taller cómo un modelo visión-lenguaje-acción compacto controla un robot real desde una sola cámara y un estado de 6 dimensiones.
- Benchmark interno de robustez: al estar entrenado con distractores ("ignore the other objects"), puede emplearse para medir la degradación de la política al cambiar posiciones de objetos o iluminación, aunque requiere evaluación propia.
- Base para fine-tuning específico de un cliente o laboratorio: al ser un adaptador Apache 2.0 sobre un modelo base también abierto, se puede reentrenar con un dataset propio de pocas decenas de episodios para una tarea de pick-and-place similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; al ser un VLA compacto con adaptador LoRA, el paper del modelo base afirma que puede desplegarse en hardware de consumo, pero no se proporcionan cifras concretas.
- GPU recomendadas: no disponible. El comando de entrenamiento de LeRobot usa `--policy.device=cuda` sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? El modelo base SmolVLA se describe como desplegable en hardware de consumo; no se detalla qué GPU concreta (RTX 4090, RTX 3060, etc.) es suficiente para esta política.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a la frecuencia del bucle de control del robot (el dataset está grabado a 30 FPS), pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_lora_v2_03_expert_all_r16_bs16_25k` | Adaptador LoRA sobre VLA | no disponible | no aplica | Apache 2.0 | Hugging Face (0 descargas) | Tarea única, sin evaluación publicada |
| `lerobot/smolvla_base` | VLA base | no disponible | no aplica | Apache 2.0 (según repo base) | Hugging Face | Modelo base del anterior; requiere fine-tuning para tareas concretas |
| Políticas tipo ACT / Diffusion Policy en LeRobot | Políticas de imitación | no disponible | no aplica | Apache 2.0 (habitual en LeRobot) | Hugging Face / GitHub | Alternativas clásicas de imitación sin componente de lenguaje; comparación numérica no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada; la comparación se limita a aspectos de licencia, disponibilidad y naturaleza del modelo.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas en robot real, por lo que se desconoce su fiabilidad fuera del dataset de entrenamiento.
- Especialización extrema: entrenado para una única instrucción ("Grab the purple cube and put it into the cardboard box, ignore the other objects"); no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración de cámara: la política espera una cámara llamada `front` con resolución 480×640 y un estado de 6 dimensiones; cualquier cambio en el montaje, la calibración o los índices de cámara puede degradar el comportamiento.
- Sensibilidad al entorno: no se documenta robustez frente a cambios de iluminación, posiciones de objetos, distractores nuevos o un robot distinto del mismo modelo.
- Dataset pequeño: 77 episodios y 54.777 frames es un volumen reducido, lo que aumenta el riesgo de sobreajuste a las condiciones de grabación.
- Sin datos de sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos típicos, pero no se analiza sesgo visual ni de comportamiento.
- Riesgo de alucinación en el sentido de acciones erráticas: como toda política de imitación, puede producir trayectorias no previstas ante entradas fuera de distribución; requiere supervisión humana y parada de emergencia en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y del dataset asociado antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_lora_v2_03_expert_all_r16_bs16_25k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
