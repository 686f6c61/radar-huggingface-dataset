# heyunzhenwhat/smolvla_so101-single-transfer

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico mediante aprendizaje por imitación. Este repositorio concreto, `heyunzhenwhat/smolvla_so101-single-transfer`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de 50 episodios de la tarea "Move the tape into the taped area on the right" en un robot SO-101 (SoFollower). El modelo consume tres vistas de cámara (256x256), el estado del robot (6 dimensiones) y una instrucción en lenguaje natural, y produce acciones de 6 dimensiones.

La relevancia de este modelo radica en que demuestra el flujo de fine-tuning de SmolVLA sobre un dataset pequeño (15.743 frames) con LeRobot, logrando un policy entrenable en hardware de consumo. SmolVLA congela el encoder de visión (SigLIP) y el modelo de lenguaje (SmolLM2), y solo entrena el action expert y las proyecciones, lo que reduce drásticamente el coste de entrenamiento. Con 450 millones de parámetros totales, es significativamente más ligero que alternativas como OpenVLA (7B), lo que permite inferencia en GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA: encoder SigLIP + LLM SmolLM2 + action expert |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA sigue una arquitectura de tres componentes: un encoder de vision SigLIP que procesa las imagenes de las camaras, un modelo de lenguaje SmolLM2 que codifica la instruccion y el estado del robot, y un action expert (un MLP) que genera las acciones de control. En el fine-tuning, solo se actualizan el action expert y las proyecciones entre modulos, mientras que SigLIP y SmolLM2 permanecen congelados. Esto implica que de los ~450M parametros totales, solo unos ~50M son entrenables.

El entrenamiento de este checkpoint se realizo con LeRobot 0.6.1 sobre el dataset `heyunzhenwhat/so101-single-transfer`, que contiene 50 episodios (15.743 frames a 30 FPS) de la tarea de transferencia de cinta adhesiva. Se usaron 10.000 pasos de entrenamiento con batch size 64, optimizador AdamW, learning rate 0.0001 y seed 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento de aprendizaje por imitacion supervisado estandar.

## Capacidades

- Control robotico de bajo nivel: genera acciones de 6 dimensiones (posicion y orientacion del efector) a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa simultaneamente tres vistas de camara (256x256) y el estado propioceptivo del robot.
- Instrucciones en lenguaje natural: la tarea se especifica textualmente ("Move the tape into the taped area on the right"), lo que permite condicionar el comportamiento.
- Fine-tuning eficiente: al congelar la mayoria de los parametros, se puede adaptar a nuevas tareas con datasets pequenos (50 episodios) y hardware modesto.
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face para robotica, incluyendo rollout y entrenamiento via CLI.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del ambito robotico.

## Casos de uso

- Manipulacion robotica en entornos controlados: el modelo puede ejecutar tareas de pick-and-place o transferencia de objetos en un robot SO-101, como se demuestra en la tarea de mover una cinta a una zona marcada.
- Prototipado rapido de politicas de imitacion: investigadores pueden fine-tunear este checkpoint sobre nuevos datasets de pocos episodios para validar ideas antes de escalar a modelos mayores.
- Educacion en robotica: al ser ligero y de codigo abierto, es adecuado para laboratorios docentes que necesitan un VLA funcional en GPUs de consumo.
- Evaluacion de generalizacion: permite estudiar como un VLA pequeno se comporta ante variaciones de iluminacion, posicion de objetos o distracciones, dado su tamano reducido.
- Baseline para comparacion: sirve como punto de referencia para medir la mejora de modelos mas grandes o de tecnicas de aumento de datos en tareas de manipulacion.
- Despliegue en robots de bajo coste: el SO-101 es un robot asequible, y este modelo puede ejecutarse en un PC con GPU moderada, facilitando la experimentacion fuera de laboratorios con infraestructura cara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real para este checkpoint. Tampoco se proporcionan metricas como tasa de exito, ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 450M parametros en fp32, el peso del modelo ocupa ~1,8 GB, por lo que una GPU con 6-8 GB de VRAM deberia ser suficiente para inferencia, aunque no hay datos confirmados.
- GPU recomendadas: no se especifican. Dado el tamano, una RTX 3060 (12 GB) o superior seria razonable, pero es una estimacion.
- Compatibilidad con consumer GPU: probablemente si, dado el tamano reducido, pero no hay confirmacion del autor.
- Opciones de despliegue: LeRobot ofrece los comandos `lerobot-rollout` y `lerobot-train`; tambien se puede usar el framework de Hugging Face para robotica. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de texto generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este checkpoint) | 450M | no disponible | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | MIT (pesos) | Hugging Face |
| RT-2 (Google) | 55B | no disponible | propietaria | no publico |

SmolVLA se posiciona como una alternativa ligera a OpenVLA, que requiere mucha mas VRAM y computo. RT-2 no es de codigo abierto, por lo que no es comparable en terminos practicos. No se dispone de datos de rendimiento comparativo entre estos modelos en tareas identicas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al entrenarse sobre un unico dataset de 50 episodios, el modelo puede sobreajustarse a las condiciones de ese entorno (iluminacion, posicion de camaras, fondo).
- Riesgo de alucinacion: en el contexto robotico, esto se traduce en acciones incorrectas o erraticas ante observaciones fuera de la distribucion de entrenamiento.
- Limitaciones de contexto: la ventana de contexto no esta documentada; ademas, el modelo solo acepta tres vistas de camara fijas y un estado de 6 dimensiones, por lo que no es generalizable a otros robots sin reentrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el dataset de entrenamiento puede tener sus propias condiciones; no se especifican.
- Caveat de produccion: no hay resultados de evaluacion en robot real, por lo que la fiabilidad en entornos no controlados es desconocida. El modelo es un checkpoint de investigacion, no un producto listo para despliegue industrial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/heyunzhenwhat/smolvla_so101-single-transfer
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de hardware SO-101: https://huggingface.co/docs/lerobot/so101
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
