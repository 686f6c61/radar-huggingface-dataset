# fanqi-robo/pi05_insert_gear_in_gripper_expert_only

## Resumen

`fanqi-robo/pi05_insert_gear_in_gripper_expert_only` es un ajuste fino del modelo vision-lenguaje-accion (VLA) π0.5 de Physical Intelligence, publicado por el usuario fanqi-robo dentro de un estudio de ablacion sobre estrategias de fine-tuning. En concreto, se trata del brazo de ablacion `expert_only` del grupo `trainable_params`: parte de los pesos de `lerobot/pi05_base` y congela por completo el VLM PaliGemma, de modo que unicamente se entrenan el action expert (~300 M de parametros) y las proyecciones de estado y accion. El modelo tiene 4.143.404.816 parametros totales (unos 4,14 mil millones) y un tamano de repositorio de 9,4 GB.

El problema que aborda es la insercion de una pieza dentada ("gear") en una pinza mediante un brazo robotico SO-101, una tarea de manipulacion de contacto con tolerancias ajustadas. Se ha entrenado exclusivamente sobre los 50 episodios del dataset `fanqi-robo/insert_gear_in_gripper`, sin particion de validacion (hold-out); la unica evaluacion prevista es sobre el robot real mediante el espacio `armnet-eval` con 20 rollouts. El checkpoint publicado corresponde al paso 20000 de entrenamiento.

La relevancia del modelo es metodologica: su hipotesis es que el regimen "expert-only" puede ser una alternativa barata al fine-tuning completo, ya que cabe en una GPU de 24-32 GB y es aproximadamente el doble de rapido de entrenar. Si su rendimiento en robot se acerca al del fine-tuning completo (variante b0), el autor podria mover futuros barridos de hiperparametros a GPUs de consumo como las RTX 5090; si queda muy por detras, quedaria confirmada la conclusion de Dream Machines de que un embodiment nuevo no es una edicion de bajo rango y exige fine-tuning completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Lenguaje-Accion (VLA) basada en el backbone PaliGemma (3B) mas un action expert, con cabezal de accion por flow-matching |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 200 tokens (`tokenizer_max_length: 200`) |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base (revision a538eb27) |
| Dataset de ajuste | fanqi-robo/insert_gear_in_gripper (50 episodios) |
| Checkpoint publicado | step 20000 |
| Libreria | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

π0.5 es un modelo Vision-Lenguaje-Accion con generalizacion en mundo abierto, desarrollado por Physical Intelligence. La implementacion utilizada aqui es la de LeRobot, adaptada del repositorio de codigo abierto OpenPI. La arquitectura combina un backbone VLM PaliGemma de 3B de parametros (que aporta la comprension visual y linguistica) con un action expert de aproximadamente 300 M de parametros que genera las acciones. El cabezal de accion se entrena mediante flow-matching con 10 pasos de inferencia (`num_inference_steps: 10`), y el modelo predice trozos de accion (`chunk_size: 50`, `n_action_steps: 50`).

El entrenamiento de esta variante `expert_only` se realizo con `train_expert_only: true`, lo que congela por completo el VLM PaliGemma y entrena unicamente el action expert y las proyecciones de estado y accion. Se emplearon 20000 pasos con batch de 32 y 8 workers, en precision bfloat16 y con gradient checkpointing activado (sin `torch.compile`). El optimizador fue Adam con learning rate 2,5e-05, weight decay 0,01, recorte de gradiente de 1,0 y un scheduler con 1000 pasos de warmup, decaimiento a lo largo de 30000 pasos y learning rate final de 2,5e-06. La normalizacion fue IDENTITY para la vision y QUANTILES para estado y accion, y no se usaron acciones relativas (`use_relative_actions: false`). El encoder de vision no se congelo por separado (`freeze_vision_encoder: false`), ya que el congelado global del VLM lo hace redundante. La semilla fijada fue 1000.

## Capacidades

- Generacion de acciones roboticas: produce comandos de control de extremo a extremo (end-to-end) para el brazo SO-101 a partir de observaciones visuales y del estado del robot.
- Manipulacion de precision: entrenado especificamente para insertar una pieza dentada en la pinza, una tarea que requiere control de contacto fino.
- Prediccion por chunks: emite secuencias de 50 acciones con 10 pasos de flow-matching por inferencia.
- Condicionamiento por lenguaje: hereda del backbone PaliGemma la capacidad de procesar instrucciones textuales (hasta 200 tokens) para definir la tarea.
- Fine-tuning eficiente: admite entrenamiento unicamente del action expert, sin tocar el VLM, lo que reduce requisitos de memoria y tiempo de entrenamiento.
- No dispone de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras capacidades de los LLM generales, al ser un modelo especifico de robotica.

## Casos de uso

- Insercion de piezas en linea de montaje: el modelo puede pilotar un SO-101 para insertar engranajes en una pinza de forma repetitiva; su entrenamiento exclusivo sobre esta tarea y la prediccion por chunks de 50 acciones lo hacen adecuado para ciclos de manipulacion cortos y controlados.
- Investigacion en aprendizaje por imitacion: sirve como punto de comparacion directo frente a variantes de fine-tuning completo o LoRA, ya que comparte base, dataset y configuracion salvo por el regimen de entrenamiento.
- Estudio de ablacion de estrategias de ajuste: util para medir en robot real si entrenar solo el action expert basta para una tarea nueva, con el ahorro de memoria (24-32 GB) y de tiempo (~2x mas rapido) que ello implica.
- Despliegue en hardware de gama de consumo: al requerir solo una GPU de 24-32 GB para entrenamiento y ser relativamente ligero en inferencia, permite iterar barridos de hiperparametros en estaciones con tarjetas tipo RTX 5090 en lugar de clusters grandes.
- Validacion en bucle cerrado con robot: el checkpoint esta pensado para evaluarse via `armnet-eval` con el embodiment `lerobot/so-101` y 20 rollouts, ideal para pipelines de evaluacion estandarizada de politicas.
- Recogida de datos dirigida: el modelo puede usarse como politica de referencia que genere trayectorias utiles para ampliar el dataset de insercion antes de un ajuste posterior con fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la unica prueba prevista es el robot real, mediante el espacio `armnet-eval` (embodiment `lerobot/so-101`, tarea de `fanqi-robo/insert_gear_in_gripper`, 20 rollouts), y que no existe particion de validacion (hold-out). No se han facilitado cifras de exito ni comparaciones numericas frente a la variante b0 de fine-tuning completo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB en bfloat16 (4,14 B de parametros), mas el margen de activaciones; en cuantizacion de 8 bits o 4 bits el consumo se reduce notablemente, aunque no se publican cuantizaciones oficiales.
- VRAM para entrenamiento: la model card afirma que la variante `expert_only` cabe en una tarjeta de 24-32 GB, al no retropropagar por el VLM congelado.
- GPU recomendadas: para entrenamiento, tarjetas de 24-32 GB (por ejemplo, RTX 5090 o A100 40 GB); para inferencia bastan GPUs consumer de gama alta.
- Cabe en GPU consumer: si, la configuracion de entrenamiento esta disenada para una GPU de 24-32 GB, y la inferencia cabe holgadamente en tarjetas de 12 GB o mas.
- Opciones de despliegue: la via prevista es LeRobot con el extra `lerobot[pi]`, cargando los pesos en bfloat16; no se documentan integraciones con vLLM, llama.cpp o Ollama, que no son aplicables a un modelo de acciones.
- Latencia y throughput estimados: no disponibles. Como referencia, el entrenamiento es aproximadamente el doble de rapido ("~2x faster") que un fine-tuning completo, segun la model card.
- Requisito adicional: la carga necesita un token de Hub con acceso de lectura al tokenizer de `google/paligemma-3b-pt-224`, que esta restringido (gated).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de accion | Regimen de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fanqi-robo/pi05_insert_gear_in_gripper_expert_only | 4,14 B | chunk de 50 acciones, 10 pasos de flow-matching | Solo action expert (~300 M), VLM congelado | apache-2.0 | HuggingFace |
| lerobot/pi05_base (base) | ~4,14 B | igual (arquitectura π0.5) | Preentrenamiento VLA, sin ajuste a la tarea | apache-2.0 | HuggingFace |
| Variante b0 (fine-tuning completo) | ~4,14 B | igual | Fine-tuning completo del modelo | no disponible | No publicada en la informacion disponible |
| fanqi-robo/molmoact2_insert_gear_in_gripper_base_expert | no disponible | no disponible | Ajuste sobre MolmoAct2 | no disponible | HuggingFace |

La comparacion numerica de rendimiento entre estas variantes no esta publicada; la model card describe el brazo `expert_only` como parte de un estudio de ablacion cuyo resultado se medira unicamente en robot.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un modelo de robotica entrenado con 50 episodios de una unica tarea, su comportamiento fuera de esa distribucion (objetos, iluminacion, posiciones) es impredecible.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe riesgo de acciones fisicas incorrectas o inseguras al operar un robot real, especialmente por la ausencia de particion de validacion.
- Limitaciones de contexto: la longitud de contexto textual es de solo 200 tokens; las capacidades linguisticas heredadas de PaliGemma estan limitadas por el uso como condicionamiento de tarea, no como generacion de texto.
- Restricciones de licencia: los pesos se publican bajo apache-2.0, pero la carga requiere acceso al tokenizer restringido de `google/paligemma-3b-pt-224`, cuyos terminos pueden imponer condiciones adicionales al uso.
- Caveats de produccion: no hay conjunto de validacion ni hold-out; la unica metrica prevista es la evaluacion en robot (20 rollouts). La reproducibilidad depende de fijar la revision `a538eb27` del base, porque revisiones posteriores de `lerobot/pi05_base` usan un paso de procesador que LeRobot 0.5.1 no puede cargar. El checkpoint publicado es un artefacto de investigacion con 6 descargas y 0 likes, sin garantias de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fanqi-robo/pi05_insert_gear_in_gripper_expert_only
- Checkpoints anteriores: https://huggingface.co/fanqi-robo/pi05_insert_gear_in_gripper_expert_only_ckpts
- Dataset: https://huggingface.co/datasets/fanqi-robo/insert_gear_in_gripper
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Espacio de evaluacion: https://huggingface.co/spaces/armnet/armnet-eval
- Informe de experimentos (W&B): https://wandb.ai/fanqi-robo-saferobotics/pi05_insert_gear_in_gripper
- Implementacion de π0.5 en LeRobot: https://github.com/huggingface/lerobot/tree/main/src/lerobot/policies/pi05
- Documentacion de π0.5 en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/pi05.mdx
- Modelo relacionado (MolmoAct2, expert): https://huggingface.co/fanqi-robo/molmoact2_insert_gear_in_gripper_base_expert
- Modelo relacionado (π0.5 Libero base): https://huggingface.co/lerobot/pi05_libero_base
- Ficha de π0.5 en ModelScope: https://www.modelscope.cn/models/lerobot/pi05_base/summary
- Repositorio OpenPI (referencia de la implementacion): no disponible como enlace directo en la informacion proporcionada
