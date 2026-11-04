# mysterium99/smolvla_stage2a_base_to_ds2

## Resumen

smolvla_stage2a_base_to_ds2 es un ajuste fino (fine-tune) del modelo vision-language-action (VLA) SmolVLA, desarrollado originalmente por Hugging Face dentro del ecosistema LeRobot y publicado en el articulo arXiv 2506.01844. Lo publica el usuario mysterium99 y deriva del checkpoint base lerobot/smolvla_base. Su proposito no es la generacion de texto libre, sino la ejecucion de politicas roboticas de imitacion: recibe observaciones multimodales (estado del robot y tres camaras) y emite directamente un vector de accion de 6 dimensiones. Es, por tanto, un modelo de control, no un LLM de proposito general.

El modelo cuenta con 450.046.176 parametros (segun los safetensors reales del repo) y un tamano de repositorio de 0,9 GB, lo que lo situa en la categoria de VLA compactos disenados para ejecutarse en hardware de consumo. La relevancia de este checkpoint concreto es acotada: es un experimento de ajuste sobre un dataset propio, no una publicacion oficial, y no incluye resultados de evaluacion.

El entrenamiento se ha realizado con LeRobot 0.6.1 sobre el dataset ds2 (50 episodios, 110.961 frames a 30 FPS) para la tarea "put nuts in red cup and bolts in blue bucket", con tres camaras (gripper, newtop, newside) y un robot de tipo `follow`. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; transformer multimodal con politica de imitacion (detalle interno no disponible) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo de control robotico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural de forma generativa; recibe una instruccion de tarea) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Entrada | observation.state (6,), 3 imagenes RGB (3, 256, 256) |
| Salida | action (6,) |
| Tipo de robot | follow |
| Camaras | gripper, newtop, newside |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que combina un codificador visual, un componente linguistico para la instruccion de tarea y una cabeza de politica que produce acciones continuas. La model card original lo describe como un VLA eficiente con rendimiento competitivo a coste computacional reducido, desplegable en hardware de consumo. El detalle exacto de capas, atencion y mecanismos internos no se especifica en la informacion disponible.

Este checkpoint es un ajuste fino del base lerobot/smolvla_base sobre el dataset ds2: 50 episodios, 110.961 frames a 30 FPS, una unica tarea ("put nuts in red cup and bolts in blue bucket"). La configuracion de entrenamiento reportada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 0. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de imitacion supervisada. No hay informacion sobre volumen de preentrenamiento en tokens ni composicion del dataset original de SmolVLA.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 dimensiones a partir de estado y vision.
- Percepcion multimodal con tres camaras simultaneas (gripper, vista superior, vista lateral), cada una a 256x256.
- Seguimiento de instruccion de tarea en lenguaje natural (una unica tarea en este ajuste).
- Manipulacion de objetos: la tarea entrenada es clasificar y colocar tuercas y tornillos en recipientes.
- Ejecucion en tiempo real a 30 FPS (frecuencia del dataset de entrenamiento).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de agentes LLM.
- No dispone de modo thinking, vision generativa, audio ni generacion de texto.

## Casos de uso

- Automatizacion de picking y clasificacion: el modelo puede ejecutar la tarea entrenada de separar tuercas y tornillos en recipientes, adecuado para bancos de pruebas de manipulacion robotica.
- Prototipado de politicas de imitacion: sirve como punto de partida para ajustar SmolVLA a nuevas tareas con LeRobot, ya que el flujo de entrenamiento esta documentado.
- Investigacion en VLAs compactos: util para estudiar el comportamiento de un modelo de 450 M de parametros en tareas reales con hardware de consumo.
- Demostraciones de laboratorio: con 0,9 GB de pesos y despliegue via lerobot-rollout, es viable en estaciones de trabajo modestas.
- Evaluacion de robustez ante cambios de iluminacion y posicion: al ser un ajuste sobre 50 episodios, sirve para medir sensibilidad a la distribucion de entrenamiento.
- Benchmark de referencia para comparar pipelines de entrenamiento: permite contrastar configuraciones (pasos, batch, learning rate) replicando el setup publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 450 M de parametros en precision completa (fp32) el peso ronda 1,8 GB en memoria, y en bf16/fp16 aproximadamente 0,9 GB, mas el coste de activaciones y buffers de vision.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, cabe en GPU de consumo tipo RTX 3060/4060 en adelante.
- Cabe en GPU de consumo: si, segun el tamano de parametros y repo (0,9 GB), aunque no hay confirmacion oficial de requisitos minimos.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con la politica `mysterium99/smolvla_stage2a_base_to_ds2`; entrenamiento con `lerobot-train`.
- Latencia y throughput: no disponibles. La frecuencia de operacion del dataset es de 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Notas |
|---|---|---|---|---|
| mysterium99/smolvla_stage2a_base_to_ds2 | 450.046.176 | VLA (ajuste fino) | apache-2.0 | Ajuste sobre dataset ds2, sin evaluacion publicada |
| lerobot/smolvla_base | no disponible | VLA base | apache-2.0 (segun repo base) | Modelo de partida, preentrenado |
| Otros VLA comparables | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

## Limitaciones y advertencias

- Sin evaluacion: no hay resultados de exito en robot real, por lo que no puede afirmarse su rendimiento.
- Dataset muy reducido: 50 episodios y una sola tarea; la generalizacion a objetos, posiciones o tareas distintas es muy limitada.
- Riesgo de sobreajuste al entorno de grabacion (iluminacion, camaras y robot concretos).
- Requiere un robot de tipo `follow` y exactamente las camaras gripper, newtop y newside con los nombres e indices correctos.
- No es un modelo de lenguaje: no debe usarse para generacion de texto, codigo ni conversacion.
- Idiomas: no aplica de forma generativa; la instruccion de tarea debe coincidir con la entrenada.
- Licencia Apache 2.0: permite uso comercial segun los terminos de dicha licencia, pero el autor no ofrece garantias.
- Publicacion no oficial: autor individual (mysterium99), 0 descargas y 0 likes en el momento de la consulta; sin soporte ni mantenimiento documentado.
- No hay informacion sobre sesgos, ya que no procesa lenguaje ni datos personales de forma directa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mysterium99/smolvla_stage2a_base_to_ds2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset ds2: https://huggingface.co/datasets/ds2
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds2
- Guia de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Tutorial de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
