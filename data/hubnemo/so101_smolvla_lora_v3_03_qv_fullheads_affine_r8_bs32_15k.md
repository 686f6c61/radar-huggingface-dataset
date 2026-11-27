# hubnemo/so101_smolvla_lora_v3_03_qv_fullheads_affine_r8_bs32_15k

## Resumen

`hubnemo/so101_smolvla_lora_v3_03_qv_fullheads_affine_r8_bs32_15k` es un adaptador LoRA (r=8) sobre `lerobot/smolvla_base`, publicado por el usuario hubnemo en Hugging Face. Se trata de una política visio-lenguaje-acción (VLA) para robótica, entrenada mediante aprendizaje por imitación con la librería LeRobot 0.7.1 para el robot `so101_follower`. No es un modelo de lenguaje general: su entrada es una imagen frontal de 480x640 y un vector de estado de 6 dimensiones, y su salida es un vector de acción de 6 dimensiones.

El modelo base, SmolVLA (paper arXiv:2506.01844), es un VLA compacto y eficiente diseñado para ejecutarse en hardware de consumo. Este adaptador concreto está especializado en una única tarea: "Grab the purple cube and put it into the cardboard box, ignore the other objects", aprendida a partir del dataset `Orellius/so101_sort_cubes_no_top` (77 episodios, 54.777 fotogramas a 30 FPS).

Es relevante como ejemplo reproducible de fine-tuning ligero (LoRA) de un VLA sobre un brazo robótico de bajo coste tipo SO-101, un patrón cada vez más habitual para prototipado rápido en robótica de manipulación. El repositorio no contiene pesos visibles (tamaño 0.0 GB en el momento de la consulta) y no se han publicado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en SmolVLA; adaptador LoRA (r=8, affine, full heads) sobre `lerobot/smolvla_base` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no es un LLM de contexto variable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje como tarea principal; recibe una instrucción de tarea en texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags); repositorio de 0.0 GB en la consulta |

## Arquitectura y entrenamiento

El adaptador se monta sobre SmolVLA, un modelo visio-lenguaje-acción compacto que combina un codificador visual y un modelo de lenguaje pequeño para producir acciones motoras condicionadas por una instrucción en lenguaje natural y por observaciones visuales y propioceptivas. En este caso, la política consume `observation.state` con forma `(6,)` y `observation.images.front` con forma `(3, 480, 640)`, y emite `action` con forma `(6,)`, controlando un robot `so101_follower` con una única cámara frontal.

El entrenamiento se realizó con LeRobot 0.7.1 durante 15.000 pasos, batch size 32, optimizador AdamW, learning rate 0.0008 y semilla 1000, sobre el dataset `Orellius/so101_sort_cubes_no_top` (77 episodios, 54.777 fotogramas, 30 FPS). El nombre del repositorio indica que se aplicó LoRA con rango 8, inicialización affine y entrenamiento de todas las cabezas (full heads). La model card no detalla la composición del dataset, el número de tokens ni si hubo etapas de RLHF o DPO (no aplica habitualmente en aprendizaje por imitación).

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones para un brazo `so101_follower` a partir de una imagen frontal y del estado articular.
- Condicionamiento por instrucción en lenguaje natural: acepta una descripción de tarea (por ejemplo, "Grab the purple cube and put it into the cardboard box, ignore the other objects").
- Manipulación de objetos con instrucción de ignorar distractores, según la tarea de entrenamiento.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento; es una política de acción, no un asistente conversacional.
- Capacidades multilingües: no disponibles; la instrucción de tarea se usa tal cual en el prompt.

## Casos de uso

- Clasificación de cubos en línea de montaje: la política recoge el cubo púrpura y lo deposita en una caja de cartón ignorando otros objetos, replicando la tarea del dataset de entrenamiento en un banco de pruebas con SO-101.
- Prototipado de pick-and-place en laboratorio: sirve como punto de partida para validar la cadena completa LeRobot (grabación, entrenamiento, rollout) antes de escalar a tareas más complejas.
- Base para fine-tuning con LoRA: al ser un adaptador ligero sobre `lerobot/smolvla_base`, permite experimentar con nuevos datasets manteniendo el coste de entrenamiento bajo.
- Demostraciones educativas de VLA: útil en cursos y talleres para mostrar cómo un modelo visio-lenguaje-acción se despliega en un brazo de bajo coste.
- Evaluación de robustez ante distractores: la instrucción explícita de ignorar otros objetos permite estudiar el comportamiento del modelo en escenas con ruido visual controlado.
- Automatización de tareas repetitivas de recogida en entornos acotados: con una única cámara frontal y una instrucción fija, el modelo puede ejecutar ciclos de recogida y depósito durante un tiempo determinado (`--duration`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un VLA compacto (SmolVLA), el paper lo describe como desplegable en hardware de consumo, pero no se especifican cifras concretas para este adaptador.
- GPU recomendadas: no disponibles; SmolVLA está pensado para hardware de consumo, aunque no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: probable según el diseño del modelo base, pero sin confirmación numérica en la información proporcionada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_lora_v3_03_qv_fullheads_affine_r8_bs32_15k` | Adaptador LoRA sobre SmolVLA para SO-101 | no disponible | no aplica | apache-2.0 | Hugging Face (repo de 0.0 GB en la consulta) |
| `lerobot/smolvla_base` | VLA base de SmolVLA | no disponible | no aplica | no disponible en esta ficha | Hugging Face |
| Otros adaptadores SmolVLA para SO-101 | Adaptadores LoRA sobre SmolVLA | no disponible | no aplica | variable | Hugging Face (no verificado) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado para una única tarea ("recoger el cubo púrpura e introducirlo en la caja de cartón"), por lo que no generaliza a otras tareas sin reentrenamiento.
- Configuración de robot fija: asume un `so101_follower` con una cámara frontal a 480x640 y 30 FPS; cualquier cambio de cámara, resolución o montaje puede degradar el comportamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, lo que impide estimar su fiabilidad en producción.
- Repositorio aparentemente vacío: el tamaño de 0.0 GB en la consulta sugiere que los pesos pueden no estar disponibles o no haberse subido correctamente.
- Riesgo de sobreajuste al dataset: con 77 episodios, la política puede fallar ante variaciones de iluminación, posiciones de objetos o distractores no vistos.
- Licencia apache-2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base `lerobot/smolvla_base` y del dataset de entrenamiento.
- Idiomas no especificados: la instrucción de tarea se usa en inglés en los ejemplos; no hay garantía de comportamiento con instrucciones en otros idiomas.
- Sin soporte de tool calling ni agentes: no debe emplearse como componente de razonamiento general.

## Enlaces

- Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_lora_v3_03_qv_fullheads_affine_r8_bs32_15k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
