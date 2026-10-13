# josefbrozovich/smolvla_so101

## Resumen

josefbrozovich/smolvla_so101 es un checkpoint de SmolVLA (Vision-Language-Action) afinado por el usuario josefbrozovich a partir del modelo base lerobot/smolvla_base. SmolVLA es un modelo compacto de visión-lenguaje-acción pensado para robótica de bajo coste, que combina un backbone de visión-lenguaje con un módulo de generación de acciones y está diseñado para ejecutarse en hardware de consumo.

Este checkpoint concreto cuenta con 450.046.176 parámetros (unos 450 M) y se ha entrenado sobre el dataset josefbrozovich/so101_pickup_object_20261013_133624, orientado a la tarea de recoger objetos con un brazo robótico SO-101. Se distribuye en formato safetensors y bajo licencia Apache 2.0 a través de la librería LeRobot.

Su interés práctico reside en que ilustra el flujo de fine-tuning de políticas robóticas con LeRobot sobre un brazo asequible (SO-101) y lenguaje natural. No obstante, al tratarse de una publicación reciente con cero descargas y sin resultados de benchmarks publicados, su rendimiento real no está validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); basada en lerobot/smolvla_base (backbone de vision-lenguaje con modulo de acciones) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos entregados en safetensors) |
| Idiomas soportados | no disponible (el modelo acepta instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que toma como entrada observaciones visuales e instrucciones en lenguaje natural y produce comandos motores (acciones) para un robot. El checkpoint aqui descrito es un fine-tune del modelo base lerobot/smolvla_base, publicado mediante la libreria LeRobot, y esta especializado en la tarea de recogida de objetos con un brazo SO-101.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens o episodios de entrenamiento, la composicion exacta del dataset de fine-tuning, ni sobre si se emplearon tecnicas de aprendizaje por refuerzo (RLHF/DPO) o imitacion. Tampoco se documentan innovaciones tecnicas especificas adicionales en la model card de este checkpoint. Para los detalles arquitectonicos del modelo base se remite al paper de SmolVLA (arXiv:2506.01844).

## Capacidades

- Generacion de acciones de robot: convierte observaciones visuales e instrucciones en comandos de control para un brazo manipulador (SO-101).
- Control guiado por lenguaje natural: acepta instrucciones textuales que describen la tarea a ejecutar.
- Manipulacion tipo pick-and-place: especializado, segun el dataset de entrenamiento, en la tarea de recoger objetos.
- Percepcion visual: procesa imagenes de camara como parte de la politica de control.
- Soporte de tool calling / function calling: no aplica (modelo de robotica, no de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): vision si (entrada visual); audio no disponible; modo de razonamiento no disponible.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo ejecuta la recogida de objetos con un brazo SO-101 siguiendo instrucciones, aprovechando el fine-tune especifico sobre el dataset so101_pickup_object.
- Prototipado de politicas roboticas de bajo coste: sirve como punto de partida para experimentar con el stack LeRobot en hardware asequible antes de escalar a configuraciones mas caras.
- Docencia y formacion en robotica: permite demostrar el ciclo completo de teleoperacion, entrenamiento y evaluacion de una politica VLA en un brazo de bajo coste.
- Investigacion en vision-language-action: base para estudiar el efecto del fine-tuning sobre tareas concretas y comparar con el modelo base.
- Despliegue en edge (por ejemplo, Jetson): por su tamano reducido (~450 M), es candidato a ejecutarse en dispositivos embebidos para control en bucle cerrado.
- Generacion de datos y evaluacion comparativa: sirve como referencia para medir la transferencia del modelo base a una tarea especifica y para comparar con otros fine-tunes de SmolVLA sobre SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito de tarea, tasas de exito en evaluacion ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia con los pesos en precision completa (bf16/fp16): en torno a 0,9-1 GB solo para los pesos, mas memoria para activaciones y buffers de imagen; en fp32, alrededor de 1,8 GB.
- GPU recomendadas: no disponibles de forma oficial; por tamano, cabe en GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090.
- Cabe en GPU de consumo: si, dado el tamano (~450 M de parametros). Tambien es candidato a ejecutarse en dispositivos embebidos tipo Jetson (se han documentado proyectos de SmolVLA con evaluacion en bucle cerrado en Jetson), aunque esto no esta confirmado en la informacion de este checkpoint.
- Opciones de despliegue: la via documentada es el stack LeRobot (lerobot-train para entrenamiento y lerobot-record para inferencia/evaluacion con --policy.path). Las pilas habituales de servido de LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables a un modelo VLA de robotica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| josefbrozovich/smolvla_so101 | 450.046.176 (~450 M) | no disponible | sin benchmarks publicados | Apache 2.0 | HuggingFace (0 descargas al publicar la ficha) |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | Apache 2.0 (segun modelo base) | HuggingFace (modelo base) |
| Temmp1e/so101_smolVLA | no disponible | no disponible | no disponible | no disponible | HuggingFace (fine-tune sobre SO-101) |
| JulianRHuggingFace/so101_smolvla_model | no disponible | no disponible | no disponible | no disponible | HuggingFace (fine-tune sobre SO-101) |

Los tres fine-tunes de SmolVLA sobre SO-101 comparten la misma arquitectura base; no se dispone de datos de parametros, contexto ni rendimiento especificos para los dos checkpoints de terceros, por lo que la comparacion cuantitativa no es posible con la informacion disponible.

## Limitaciones y advertencias

- Especializacion excesiva: el fine-tune esta orientado a una unica tarea (recogida de objetos con SO-101) y a un dataset concreto, por lo que su generalizacion a otras tareas, objetos o entornos es limitada y no documentada.
- Dependencia del hardware: las politicas entrenadas para un brazo SO-101 concreto no son directamente transferibles a otras morfologias roboticas sin reentrenamiento.
- Sin validacion independiente: el repositorio tiene cero descargas y cero likes, y no incluye benchmarks ni tasas de exito.
- Riesgo de acciones erroneas: en robotica, un fallo del modelo puede provocar movimientos incorrectos o inseguros; se recomienda ejecucion supervisada y limites de seguridad fisicos.
- Idiomas: no se especifica que idiomas acepta como entrada de instrucciones; conviene validar el idioma antes de desplegarlo.
- Contexto: no se documenta la longitud de contexto ni cuantas observaciones historicas puede manejar.
- Licencia: Apache 2.0 permite uso comercial, pero se ofrece sin garantias; conviene revisar tambien las condiciones del modelo base lerobot/smolvla_base y del dataset de entrenamiento antes de un uso en produccion.
- Sesgos: el dataset de entrenamiento (una sola tarea, posiblemente un entorno controlado) puede introducir sesgos de escenario, iluminacion o posicion de objetos; no hay informacion sobre su composicion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/josefbrozovich/smolvla_so101
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/josefbrozovich/so101_pickup_object_20261013_133624
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Fine-tune similar (Temmp1e): https://huggingface.co/Temmp1e/so101_smolVLA
- Fine-tune similar (JulianRHuggingFace): https://huggingface.co/JulianRHuggingFace/so101_smolvla_model
- Proyecto SO-101 con SmolVLA (RajatDandekar): https://github.com/RajatDandekar/SmolVLA_MRL2Bootcamp
- Proyecto SO-101 sim-to-real (v1t3ls0n): https://github.com/v1t3ls0n/so101-physical-ai-lab
- Tutorial SO-101 sim-to-real de NVIDIA: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
