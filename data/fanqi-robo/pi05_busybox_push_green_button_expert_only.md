# fanqi-robo/pi05_busybox_push_green_button_expert_only

## Resumen

pi05_busybox_push_green_button_expert_only es un checkpoint de aprendizaje por imitacion para el brazo robotico SO-101, obtenido afinando el modelo base lerobot/pi05_base (la familia π0.5 de Physical Intelligence) sobre el dataset armnet/busybox_push_green_button, compuesto por 39 episodios de la tarea de pulsar un boton verde en un BusyBox. Lo publica el usuario fanqi-robo como parte de un estudio de ablacion sobre que partes de la red conviene entrenar al adaptar un modelo vision-lenguaje-accion (VLA) a un embodiment nuevo.

La variante `expert_only` congela por completo el VLM PaliGemma del backbone y entrena unicamente el action expert (~300 M de parametros) junto con las proyecciones de estado y accion, mediante la opcion `train_expert_only` de LeRobot. El objetivo declarado es medir si este regimen barato (cabe en una GPU de 24-32 GB y es aproximadamente el doble de rapido que un fine-tune completo) se queda cerca del fine-tune completo en esta tarea, o si por el contrario confirma que hace falta ajustar toda la red.

El modelo tiene 4.143.404.816 parametros en formato safetensors (repo de 9,4 GB) y se distribuye con licencia Apache 2.0. No incluye split de validacion: la unica evaluacion prevista es en robot real a traves del espacio armnet-eval, y no se han publicado resultados numericos de esa evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en PaliGemma (encoder visual SigLIP + Gemma) con action expert y decodificacion por flow matching; familia π0.5, implementada en LeRobot como politica `pi05` |
| Parametros totales | 4.143.404.816 (≈4,14 B; dato de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE. En entrenamiento solo se actualizan el action expert (~300 M segun la model card) y las proyecciones de estado/accion |
| Longitud de contexto | No disponible como ventana de tokens del LLM. En entrenamiento se uso `tokenizer_max_length: 200` para el texto de tarea y un horizonte de accion (`chunk_size` / `n_action_steps`) de 50 pasos |
| Tipos de cuantizacion | No disponible; los pesos publicados estan en bfloat16 y no se documentan variantes GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | No disponible; la model card no especifica idiomas para las instrucciones de tarea |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,4 GB) |
| Modelo base | lerobot/pi05_base, revision fijada a `a538eb27` |
| Dataset de afinado | armnet/busybox_push_green_button (39 episodios, sin hold-out) |
| Checkpoint publicado | Paso 10000 (raiz del repo, tag `step-10000`) |
| Paso de inferencia | `num_inference_steps: 10` |
| Precisión de entrenamiento | bfloat16 con gradient checkpointing activado |
| Biblioteca | LeRobot (`lerobot[pi]`, version 0.5.1) |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno π0.5: un backbone vision-lenguaje-accion construido sobre PaliGemma 3B que procesa observaciones visuales y una instruccion textual, y un action expert de aproximadamente 300 M de parametros que genera secuencias de acciones (chunks de 50 pasos) mediante flow matching con 10 pasos de inferencia. LeRobot expone este modelo como politica `pi05` y permite controlar que submodulos se congelan. En este checkpoint se activa `train_expert_only: true`, de forma que el VLM completo queda congelado y solo se entrenan el action expert y las proyecciones de estado y accion; `freeze_vision_encoder` queda en `false` porque ya esta cubierto por el congelado global, y `compile_model` esta desactivado.

El entrenamiento se ejecuto con la configuracion publicada: 10000 pasos, batch de 32, 8 workers de datos, semilla 1000, learning rate 2,5e-5 con warmup de 1000 pasos y decaimiento hasta 2,5e-6 a los 30000 pasos, weight decay 0,01, gradient clipping de norma 1,0, optimizador con normalizacion por cuantiles para estado y accion e identidad para las entradas visuales, y acciones en coordenadas absolutas (`use_relative_actions: false`). Se usaron los 39 episodios del dataset sin separar ningun episodio para validacion; el unico test previsto es en robot real, y el seguimiento de curvas se hizo en Weights & Biases (proyecto `pi05_busybox_push_green_button`).

## Capacidades

- Generacion de acciones motoras para el brazo SO-101: a partir de observaciones visuales y una instruccion de tarea, produce chunks de hasta 50 acciones por inferencia.
- Aprendizaje por imitacion de una tarea especifica: pulsar el boton verde de un BusyBox, tal y como aparece en el dataset de entrenamiento.
- Condicionamiento por lenguaje: acepta la instruccion textual de la tarea con una longitud maxima de 200 tokens en el tokenizer.
- Percepcion visual mediante el encoder PaliGemma a resolucion de entrada 224 (tokenizer `google/paligemma-3b-pt-224`).
- Integracion con el ecosistema LeRobot: la politica se carga con `--policy.pretrained_path` y se evalua con el flujo estandar de LeRobot.
- Evaluacion remota mediante el espacio armnet-eval con el embodiment `lerobot/so-101` y la tarea `push_green_button`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso de texto, vision general, audio ni modo de pensamiento explicito: este checkpoint es una politica robotica afinada para una tarea concreta, no un asistente conversacional.

## Casos de uso

- Replicacion del ablation `expert_only`: permite comparar, con el mismo dataset, la misma semilla y el mismo presupuesto de computo, el regimen en el que solo se entrena el action expert (~300 M) frente a LoRA (el estudio cita rango 256) y frente al fine-tune completo, para decidir si merece la pena ajustar todo el backbone en futuros barridos.
- Fine-tuning de bajo coste en GPUs de 24-32 GB: el checkpoint y su YAML sirven de receta reproducible para reentrenar el modelo en 10000 pasos con batch 32 en tarjetas de gama alta de consumo o de alquiler, algo relevante para equipos con presupuesto limitado.
- Control del brazo SO-101 en laboratorio: desplegar la politica en el bucle de control del robot para ejecutar la tarea `push_green_button` usando las 50 acciones de cada chunk y 10 pasos de flow matching por inferencia.
- Evaluacion estandarizada en robot real: enviar el checkpoint al espacio armnet-eval (20 rollouts, semilla de variacion 42) para obtener una tasa de exito comparable entre variantes del estudio sin necesidad de montar una bancada propia.
- Estudio de estrategias de congelado: usar este checkpoint como referencia para medir experimentalmente el coste en exito de congelar el VLM, con registro de metricas en W&B y checkpoints intermedios cada 2000 pasos.
- Automatizacion de pruebas de hardware con pulsadores fisicos: en una bancada de QA con un SO-101, emplear la politica para pulsar repetidamente un boton concreto y verificar el comportamiento del dispositivo bajo prueba.
- Material docente y de demostracion de VLA: ejemplo completo y abierto del flujo de LeRobot, desde un dataset teleoperado hasta un checkpoint evaluable en robot, util para cursos o tutoriales sobre aprendizaje por imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la unica prueba es la evaluacion en robot real a traves del espacio armnet-eval, pero no se incluyen cifras de tasa de exito ni comparaciones numericas con las otras variantes del estudio.

| Evaluacion | Configuracion | Resultado |
|---|---|---|
| Robot real (armnet-eval) | Embodiment `lerobot/so-101`, tarea `push_green_button`, 20 rollouts, semilla de variacion 42 | No disponible |
| Comparacion con fine-tune completo (b0) | Mismo dataset | No disponible (la hipotesis se plantea, pero no se publican cifras) |
| Comparacion con LoRA rango 256 | Referencia externa citada en la model card (Dream Machines) | No disponible |

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 8,3 GB para los 4.143.404.816 parametros (4,14 B x 2 bytes). Hay que sumar las activaciones del encoder visual y del action expert, por lo que la inferencia practica requiere mas memoria que el solo peso del modelo; el dato exacto no esta disponible en la model card.
- Fine-tuning en modo `expert_only`: la model card indica que cabe en una tarjeta de 24-32 GB y que es aproximadamente el doble de rapido que un fine-tune completo. El config usa batch 32 y gradient checkpointing activado, lo que reduce el pico de memoria.
- Fine-tuning completo del backbone: no se documenta el requisito exacto; por el tamano del modelo se situa por encima del regimen anterior (clase A100/H100 de 80 GB o equivalentes con paralelismo).
- GPU de consumo: el regimen `expert_only` es viable en tarjetas de 24 GB (RTX 3090, RTX 4090) y presumiblemente en las de 32 GB; el estudio menciona explicitamente GPUs de alquiler tipo RTX 5090.
- Opciones de despliegue: LeRobot 0.5.1 con el extra `lerobot[pi]` y `--policy.pretrained_path`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Acceso: la carga requiere un token de Hugging Face con permiso de lectura sobre el repositorio restringido `google/paligemma-3b-pt-224` (tokenizer).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi05_busybox_push_green_button_expert_only (este checkpoint) | 4.143.404.816 | 200 tokens de texto, chunks de 50 acciones | apache-2.0 | Publico en Hugging Face, 0 descargas | Especializado en una tarea y un robot concretos |
| lerobot/pi05_base | No disponible | No disponible | No disponible en la informacion proporcionada | Publico | Modelo base del que parte este afinado; revision `a538eb27` |
| Variante b0 del estudio (fine-tune completo) | No disponible | No disponible | No disponible | No publicada en la informacion disponible | Referencia interna del estudio de ablacion |
| π0 (Physical Intelligence) | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | Familia de VLA antecesora de π0.5 |
| OpenVLA | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | VLA de proposito general de otro desarrollador, citado como categoria comparable, sin datos verificados aqui |

## Limitaciones y advertencias

- Especializacion extrema: se entreno exclusivamente con 39 episodios de una tarea (pulsar el boton verde de un BusyBox) sobre un unico embodiment (SO-101). No se espera generalizacion a otras tareas, objetos o robots sin un nuevo afinado.
- Ausencia de validacion offline: no hay hold-out ni metrica de perdida en validacion; la unica prueba es en robot real y sus resultados no se publican. Existe riesgo de sobreajuste a las condiciones exactas del dataset (iluminacion, posicion de camara, colocacion de objetos).
- Riesgo de fallo fisico: en un VLA, los errores del modelo se traducen en acciones sobre hardware real; cualquier despliegue debe hacerse con limites de par, paradas de emergencia y supervision.
- Dependencia de version: el checkpoint esta atado a LeRobot 0.5.1 y a la revision `a538eb27` del modelo base, porque revisiones posteriores usan un paso de procesador que 0.5.1 no puede cargar. Actualizar la biblioteca puede romper la carga.
- Dependencia de un tokenizer restringido: es necesario un token de Hugging Face con acceso a `google/paligemma-3b-pt-224`, y ese componente esta sujeto a las condiciones de uso de Google; conviene revisarlas antes de un uso comercial aunque los pesos de este repo se publiquen como apache-2.0.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente de su comportamiento.
- Idiomas: no disponible; no se puede asumir soporte multilingue de las instrucciones de tarea.
- Sesgos: no se documenta ningun analisis de sesgos ni de comportamiento fuera de distribucion.
- Estado del arte: es un artefacto de investigacion (ablacion en la rama `policy_test_fanqi` de alpha-robotics), no un modelo listo para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_expert_only
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/armnet/busybox_push_green_button
- Espacio de evaluacion en robot real: https://huggingface.co/spaces/armnet/armnet-eval
- Checkpoints intermedios: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_expert_only_ckpts
- Seguimiento del entrenamiento en Weights & Biases: https://wandb.ai/fanqi-robo-saferobotics/pi05_busybox_push_green_button
- Tokenizer restringido de PaliGemma: https://huggingface.co/google/paligemma-3b-pt-224
- LeRobot (biblioteca de carga y entrenamiento): https://github.com/huggingface/lerobot
- Historico completo de checkpoints: volumen de Modal `pi05-busybox-ckpts` (mencionado en la model card, sin URL publica disponible)
