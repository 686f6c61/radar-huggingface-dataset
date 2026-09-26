# fanqi-robo/pi05_busybox_push_green_button_b0_seed2

# pi05_busybox_push_green_button_b0_seed2

## Resumen

pi05_busybox_push_green_button_b0_seed2 es un checkpoint de politica robotica del tipo vision-language-action (VLA) obtenido al afinar π0.5 (pi05) sobre el conjunto de datos armnet/busybox_push_green_button. Lo publica el usuario fanqi-robo dentro de un estudio de ablacion sobre LeRobot 0.5.1 y su proposito es servir como referencia "baseline" (semilla 2000) para medir el ruido de entrenamiento entre semillas. Parte de los pesos preentrenados de lerobot/pi05_base (revision fijada a538eb27) y suma 4.143.404.816 parametros (≈4,14 B).

El modelo aprende una unica tarea de manipulacion con un brazo SO-101 (embodiment lerobot/so-101): pulsar un boton verde sobre un dispositivo denominado BusyBox. Con 39 episodios de demostracion y 10.000 pasos de entrenamiento, genera trozos (chunks) de 50 acciones mediante flow matching. No es un modelo de lenguaje general ni un asistente conversacional, sino una politica de control visomotor de tarea fija.

Su relevancia es metodologica: en robotica de imitacion, las diferencias de pocos puntos porcentuales entre variantes pueden deberse unicamente a la semilla de entrenamiento. Este checkpoint existe para cuantificar ese suelo de ruido antes de atribuir mejoras a un cambio de hiperparametro. Se distribuye bajo licencia Apache-2.0 y, segun la model card, solo se evalua sobre robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5: backbone de vision-lenguaje (PaliGemma, tokenizer google/paligemma-3b-pt-224) mas experto de acciones con flow matching |
| Parametros totales | 4.143.404.816 (≈4,14 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (longitud maxima de tokenizer en entrenamiento: 200 tokens para la instruccion) |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (la instruccion de tarea usada esta en ingles: "push the green button"; no se documenta soporte multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato LeRobot, `pretrained_model`) |

## Arquitectura y entrenamiento

Se trata de un ajuste fino de π0.5 (pi05), una arquitectura VLA que combina un backbone de vision-lenguaje basado en PaliGemma (encoder visual SigLIP + modelo de lenguaje Gemma) con un experto de acciones que genera acciones continuas mediante flow matching condicional. La configuracion de entrenamiento fija `chunk_size: 50` y `n_action_steps: 50` (predice y ejecuta horizontes de 50 acciones) y `num_inference_steps: 10` pasos de integracion del flow matching. La normalizacion es por cuantiles para el estado y la accion (STATE: QUANTILES, ACTION: QUANTILES) e identidad para la entrada visual (VISUAL: IDENTITY). El encoder visual no se congela (`freeze_vision_encoder: false`) y no se entrena solo el experto (`train_expert_only: false`).

El entrenamiento es aprendizaje por imitacion (behavior cloning con perdida de flow matching) sobre demostraciones, no hay indicios de RLHF ni DPO. Se parte de lerobot/pi05_base (revision a538eb27, requerida por compatibilidad con LeRobot 0.5.1) y se ejecutan 10.000 pasos con batch de 32, learning rate 2,5e-05, weight decay 0,01, grad clip 1,0, warmup de 1.000 pasos y decaimiento hasta 2,5e-06 en 30.000 pasos, con precisión bfloat16 y gradient checkpointing. La semilla de entrenamiento es 2000 y el dataset completo contiene 39 episodios (indices 0 a 38), sin split de validacion, por lo que la unica evaluacion prevista es sobre el robot fisico. El checkpoint publicado corresponde al paso 10.000.

## Capacidades

- Generacion de acciones de robot: produce chunks de 50 acciones para controlar un brazo SO-101.
- Manipulacion visomotora de tarea fija: ejecutar la tarea "push the green button" sobre el dispositivo BusyBox.
- Percepcion visual: recibe imagenes (encoder visual del backbone PaliGemma/SigLIP).
- Seguimiento de instruccion de tarea en lenguaje natural (en ingles, dentro de la ventana de 200 tokens).
- Condicionamiento por estado del robot con normalizacion por cuantiles.
- Tool calling / function calling: no soportado (no aplica a una politica de control).
- Agentes y razonamiento multi-paso: no soportado (no es un LLM de proposito general).
- Capacidades multilingues: no documentadas.
- Capacidades especiales (thinking mode, audio, etc.): no documentadas; la unica modalidad adicional respecto a texto es la vision de entrada.

## Casos de uso

- Estudio de reproducibilidad en robot learning: este checkpoint actua como baseline (grupo `baseline`, semilla 2000) para cuantificar cuanto de una diferencia de 15-20 puntos porcentuales entre variantes se debe solo al ruido de semilla frente al suelo de ruido de unas 40 rollouts.
- Ablacion controlada de hiperparametros: sirve como brazo de referencia frente a variantes que cambian un unico parametro (learning rate, chunk size, congelado del encoder, etc.), manteniendo fijos dataset y semilla.
- Benchmark de politicas VLA: se puede enviar al espacio armnet/armnet-eval (embodiment lerobot/so-101, tarea push_green_button, 20 rollouts, semilla de variacion 42) para obtener una medida estandarizada del exito.
- Transferencia a tareas de pulsado de botones: al estar afinado sobre una tarea de contacto simple, es un punto de partida razonable para afinar sobre tareas relacionadas con el mismo robot y utilaje.
- Prototipado en robotica de bajo coste: encaja en flujos con el brazo SO-101 y la libreria LeRobot, utiles para laboratorios con presupuesto limitado.
- Formacion y docencia en robot learning: permite ilustrar el ciclo completo de recogida de datos, entrenamiento y evaluacion de una politica de imitacion con LeRobot.
- Comparacion entre checkpoints de un mismo run: junto con el repositorio de checkpoints intermedios, permite analizar la evolucion del rendimiento por paso de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la unica prueba es el robot real (20 rollouts mediante el espacio armnet/armnet-eval, con semilla de variacion 42) y no incluye cifras de exito ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, calculada a partir de los 4.143.404.816 parametros):
  - bfloat16 / float16: ≈8,3 GB.
  - int8: ≈4,1 GB.
  - int4: ≈2,1 GB.
  - float32: ≈16,6 GB.
- Cabe en GPU de consumo: si, en tarjetas con 12-16 GB o mas en bfloat16 (por ejemplo RTX 4080/4090 de 24 GB, con margen para activaciones); con cuantizacion de 8 o 4 bits podria caber en GPUs de 8-12 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: RTX 4090, A100, H100 para entrenamiento o ejecucion holgada; el entrenamiento descrito usa bfloat16 con gradient checkpointing y batch 32.
- Opciones de despliegue: la libreria nativa es LeRobot (`lerobot[pi]`, segun la model card); tambien se usa el espacio armnet/armnet-eval para evaluacion estandarizada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Requisito de acceso: la carga necesita un token de Hugging Face con permiso de lectura sobre el tokenizer restringido google/paligemma-3b-pt-224.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_busybox_push_green_button_b0_seed2 (este) | 4,14 B | no disponible | VLA afinada, tarea unica (SO-101) | Apache-2.0 | Hugging Face (9 descargas, 0 likes) |
| lerobot/pi05_base | 4,14 B (misma arquitectura) | no disponible | VLA base preentrenada | ver repositorio | Hugging Face |
| π0 (lerobot/pi0_base) | ≈3,3 B (dato publico externo) | no disponible | VLA generalista | Apache-2.0 | Hugging Face |
| OpenVLA (openvla/openvla-7b) | 7 B (dato publico externo) | no disponible | VLA generalista | Apache-2.0 con condiciones | Hugging Face |

Nota: las cifras de π0 y OpenVLA proceden de documentacion publica externa a la informacion proporcionada y deben verificarse en sus repositorios; la comparacion de contexto no puede completarse por falta de datos. No se dispone de resultados de rendimiento comparables entre estos modelos en la informacion facilitada.

## Limitaciones y advertencias

- Modelo de tarea unica: solo esta entrenado para "push the green button" sobre el BusyBox con un SO-101; no generaliza a otras tareas, objetos ni robots sin nuevo ajuste.
- Sin datos de evaluacion publicados: no hay split de validacion ni cifras de exito, por lo que su rendimiento real es desconocido.
- Riesgo de sobreajuste: 39 episodios de un unico entorno y 10.000 pasos; probable sensibilidad a cambios de iluminacion, posicion inicial o utilaje.
- Alucinacion: en un VLA se manifiesta como acciones erraticas o inseguras, no como texto inventado; no debe operar sin limites de seguridad ni supervision en entornos fisicos.
- Dependencia de version: requiere LeRobot 0.5.1 y la revision a538eb27 de lerobot/pi05_base; revisiones posteriores de la base usan un paso de procesador que esa version no puede cargar.
- Acceso restringido: el tokenizer google/paligemma-3b-pt-224 esta sujeto a control de acceso y exige token de Hugging Face.
- Licencia y terminos heredados: el checkpoint se publica como Apache-2.0, pero el backbone PaliGemma y su tokenizer pueden arrastrar terminos de uso de Google/Gemma; conviene revisarlos antes de un uso comercial.
- Idiomas: solo se documenta instruccion en ingles; el soporte multilingue no esta garantizado.
- Adopcion practicamente nula (9 descargas, 0 likes) y fechas de creacion y actualizacion de 2026-09-26, sin mantenimiento posterior documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_b0_seed2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio de checkpoints intermedios: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_b0_seed2_ckpts
- Dataset: https://huggingface.co/datasets/armnet/busybox_push_green_button
- Espacio de evaluacion: https://huggingface.co/spaces/armnet/armnet-eval
- Seguimiento en Weights & Biases: https://wandb.ai/fanqi-robo-saferobotics/pi05_busybox_push_green_button
- Tokenizer (acceso restringido): https://huggingface.co/google/paligemma-3b-pt-224
- Libreria LeRobot: https://github.com/huggingface/lerobot
