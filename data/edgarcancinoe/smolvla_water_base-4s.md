# edgarcancinoe/smolvla_water_base-4s

## Resumen

smolvla_water_base-4s es un ajuste fino (fine-tune) del modelo base lerobot/smolvla_base, un modelo compacto de vision-lenguaje-accion (VLA) desarrollado en el ecosistema LeRobot de Hugging Face y descrito en el articulo arXiv 2506.01844 (SmolVLA). Este checkpoint concreto lo publica el usuario edgarcancinoe y esta especializado en una unica tarea robotica de manipulacion: regar plantas ("Water the left plant", "Water the middle plant", "Water the right plant") sobre un brazo franka panda equipado con tres camaras.

El modelo resuelve el problema de generar acciones motoras (7 grados de libertad) directamente a partir de observaciones visuales y del estado del robot, siguiendo el paradigma de imitation learning (behavior cloning) propia de LeRobot. Con 450.046.176 parametros totales (aproximadamente 450 millones), se situa en la categoria de VLA ligeros disenados para ejecutarse en hardware de consumo, a diferencia de VLA de mayor tamano como OpenVLA o pi0.

Su relevancia es doble: por un lado demuestra el flujo de trabajo de fine-tuning de SmolVLA sobre un dataset propio y pequeno (175 episodios, 131.945 fotogramas a 20 FPS); por otro, sirve como ejemplo reproducible de como adaptar un VLA generico a una tarea de manipulacion concreta con licencia Apache 2.0. No es un modelo de proposito general ni de lenguaje: es una policy robotica de un solo dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA), arquitectura SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa) |
| Idiomas soportados | no disponible (modelo de accion robotica, no de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | panda (franka panda) |
| Entradas | observation.state (6,), 3 camaras (3, 256, 256) |
| Salidas | action (7,) |
| Libreria | lerobot |

## Arquitectura y entrenamiento

Se trata de un modelo de vision-lenguaje-accion (VLA) construido sobre la arquitectura SmolVLA, una variante compacta y eficiente disenada para lograr rendimiento competitivo con coste computacional reducido y despliegue en hardware de consumo. El modelo consume observaciones multimodales (estado de articulaciones de dimension 6 y tres flujos de imagen RGB de 256x256) y produce un vector de accion de dimension 7 que controla el brazo panda. La condicion de tarea se especifica mediante instrucciones en lenguaje natural ("Water the left plant", etc.), lo que confirma su naturaleza condicionada por lenguaje.

El entrenamiento es un fine-tune supervisado del checkpoint base lerobot/smolvla_base sobre el dataset edgarcancinoe/water_pour_shift (175 episodios, 131.945 fotogramas a 20 FPS). La configuracion reportada es de 25.000 pasos de entrenamiento, batch size 32, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot version 0.6.1. No se documenta el uso de RLHF, DPO ni tecnicas de alineamiento adicionales; se trata de imitation learning puro mediante behavior cloning. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset mas alla de la tarea y las estadisticas de episodios y fotogramas.

## Capacidades

- Generacion de acciones motoras de 7 grados de libertad para un brazo robotico franka panda.
- Percepcion visual multimodal a partir de tres camaras simultaneas (256x256).
- Condicionamiento por instrucciones en lenguaje natural para seleccionar la subtarea entre las tres variantes de riego.
- Imitacion de politicas aprendidas a partir de demostraciones (behavior cloning).
- Ejecucion de tareas de manipulacion especificas: regar la planta izquierda, central o derecha.
- Integracion con el ecosistema LeRobot para rollout y entrenamiento mediante CLI (lerobot-rollout, lerobot-train).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, ya que no es un modelo de lenguaje.
- Capacidades multilingues: no aplica / no disponible.
- Capacidades especiales (modo thinking, vision de proposito general, audio): no disponibles.

## Casos de uso

- Riego automatizado de plantas en laboratorio: el modelo ejecuta la tarea de regar la planta izquierda, central o derecha sobre un panda calibrado, replicando las demostraciones del dataset water_pour_shift. Es adecuado porque la policy fue entrenada especificamente para esas tres subtareas y esas posiciones de camara.
- Investigacion en imitation learning: sirve como punto de partida reproducible para estudiar el fine-tuning de SmolVLA sobre datasets pequenos (175 episodios), comparando hiperparametros y regimenes de datos.
- Base para transferencia a tareas similares de manipulacion: partiendo de este checkpoint, un equipo puede seguir entrenando sobre nuevas tareas de vertido o riego, reutilizando la representacion visual aprendida.
- Validacion de pipelines de despliegue LeRobot: permite probar el flujo completo lerobot-rollout con un robot panda y tres camaras antes de escalar a tareas mas complejas.
- Benchmark interno de politicas VLA: al tener un numero concreto de parametros (450 M) y configuracion documentada, sirve como referencia de comparacion frente a otros fine-tunes propios.
- Demostraciones educativas: ejemplo de como publicar y consumir una policy robotica en Hugging Face Hub con licencia Apache 2.0 para docencia o talleres.
- Automatizacion de invernadero a pequena escala: en entornos controlados y con la misma disposicion de camaras y robot, podria desplegarse para riego repetitivo, siempre que la iluminacion y posiciones coincidan con las del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una seccion de evaluacion con la nota explicita de que no se han proporcionado resultados de evaluacion en robot real (trials, exitos, tasa de exito). No existe por tanto ningun dato de MMLU, HumanEval, GSM8K ni de tasa de exito en tarea que pueda citarse.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 1,8 GB solo para pesos (450 M x 4 bytes); en FP16/BF16, aproximadamente 0,9 GB. Sumando activaciones, buffers de imagen (tres camaras a 256x256) y overhead del runtime, es razonable asumir del orden de 2 a 4 GB de VRAM, aunque la cifra exacta no esta documentada.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM deberia poder ejecutar la policy; por categoria, RTX 3060/4060 o superiores, RTX 4090, A100, H100. No hay cifras oficiales.
- Cabe en GPU de consumo: si, con alta probabilidad, dado el tamano de 450 M de parametros y el formato safetensors. No confirmado por el autor.
- Opciones de despliegue: LeRobot (lerobot-rollout) como via oficial documentada. Otros runners como vLLM, llama.cpp, Ollama o TGI no estan soportados ni documentados para este modelo, ya que no es un LLM.
- Latencia y throughput estimados: no disponibles.
- Nota: el modelo se ejecuta en un bucle de control robotico en tiempo real, por lo que la latencia de inferencia es critica; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| smolvla_water_base-4s (este) | 450 M | VLA (SmolVLA) fine-tune | no disponible | Apache 2.0 | Hugging Face (0 descargas, 0 likes) | no disponibles |
| lerobot/smolvla_base | no disponible en esta busqueda | VLA (SmolVLA) base | no disponible | no disponible en esta busqueda | Hugging Face | no disponibles |
| Otros VLA de proposito general (p. ej. OpenVLA, pi0) | no disponible en esta busqueda | VLA | no disponible | no disponible en esta busqueda | Hugging Face / repos propios | no disponibles |

No se dispone de datos cuantitativos suficientes en la informacion proporcionada para establecer una comparativa de rendimiento fiable. La unica comparacion solida es que este modelo es un fine-tune directo de lerobot/smolvla_base y que, segun la model card, la familia SmolVLA busca rendimiento competitivo con coste reducido y despliegue en hardware de consumo.

## Limitaciones y advertencias

- Modelo de un solo dominio: solo ha sido entrenado para tres subtareas de riego ("Water the left plant", "Water the middle plant", "Water the right plant"); fuera de ellas su comportamiento no esta validado.
- Dependencia fuerte de la configuracion: requiere un robot panda y tres camaras con los nombres y disposiciones exactos del dataset (observation.images.camera1/2/3, 256x256); cambios de encuadre, iluminacion o posicion de objetos pueden degradar el rendimiento.
- Sin resultados de evaluacion: el autor no ha publicado tasa de exito ni numero de ensayos, por lo que se desconoce su fiabilidad real en produccion.
- Riesgo de fallo silencioso en robot real: al ser behavior cloning puro, puede ejecutar acciones incorrectas o inseguras ante observaciones fuera de distribucion; se recomienda supervision y limites de seguridad fisicos.
- Sesgos conocidos: no documentados, pero al derivar de un dataset pequeno (175 episodios), hereda los sesgos de posicion, iluminacion y estilo de demostracion de ese dataset.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de generalizacion incorrecta de acciones ante entradas nuevas.
- Limitaciones de idioma: las instrucciones de tarea estan en ingles; no se garantiza el comportamiento con instrucciones en otros idiomas.
- Licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base lerobot/smolvla_base y del dataset water_pour_shift antes de un despliegue comercial.
- Trazabilidad limitada: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-10-12), sin comunidad de validacion.
- Para produccion: no usar sin un plan de validacion en robot fisico y sin margenes de seguridad ante fallos de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edgarcancinoe/smolvla_water_base-4s
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour_shift
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv 2506.01844)
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=edgarcancinoe/water_pour_shift
