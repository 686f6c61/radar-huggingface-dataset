# fanqi-robo/pi05_busybox_push_green_button_aug_default

## Resumen

`pi05_busybox_push_green_button_aug_default` es un ajuste fino de robótica (VLA, vision-language-action) del modelo base `lerobot/pi05_base`, publicado por el usuario `fanqi-robo` dentro de un estudio de ablación sobre π0.5 en LeRobot. El modelo aprende una única tarea de manipulación: pulsar un botón verde en un montaje tipo *busybox* con un brazo SO-101. Cuenta con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) almacenados en `safetensors`, con un tamano de repositorio de 9,4 GB, y se distribuye bajo licencia Apache 2.0.

La particularidad de esta variante, etiquetada `aug_default`, es que entrena con el aumento de imagen por defecto de LeRobot activado: en cada fotograma se aplican 3 de 6 transformaciones fotométricas o afines (brillo, contraste, saturación, tono, nitidez y una pequeña transformación afín). La hipótesis del experimento es que ese aumento, que no aportó ganancias cuando las escenas de entrenamiento y evaluación eran idénticas, sí puede compensar la diferencia entre las 39 demostraciones (grabadas con una única configuración de iluminación) y la evaluación real, que varía deliberadamente el brillo de la *lightbox* entre un 2,5 % y un 57,5 % y la posición del raíl en ±25 %.

Es relevante ahora porque forma parte de la familia de políticas π0.5 integradas en LeRobot y ejemplifica el flujo de trabajo actual de ajuste fino reproducible sobre hardware robótico de bajo coste: pesos base fijados por revisión, *dataset* público, registro en W&B y evaluación exclusivamente en robot real. No es un modelo de propósito general ni un *chatbot*: es un *checkpoint* de política entrenado para una tarea y una morfología concretas, pensado para comparar variantes de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA π0.5 (`policy.type: pi05`); tokenizador asociado `google/paligemma-3b-pt-224` (no se detalla la topologia completa en la informacion disponible) |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Longitud de contexto | 200 tokens (`tokenizer_max_length: 200`) |
| Tipos de cuantizacion | No disponible; los pesos publicados estan en bfloat16 |
| Idiomas soportados | No disponible (las instrucciones de tarea se introducen como texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,4 GB |
| Tipo de accion | Chunks de 50 acciones (`chunk_size: 50`, `n_action_steps: 50`) |
| Pasos de inferencia | 10 (`num_inference_steps: 10`) |
| Embodiment objetivo | `lerobot/so-101` (tarea `push_green_button`) |
| Checkpoint publicado | Paso 10000 (raiz del repositorio, tag `step-10000`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base` fijado en la revisión `a538eb27` (LeRobot 0.5.1, cargado mediante `--policy.pretrained_path`). Según la *model card*, esa revisión se fija deliberadamente porque revisiones posteriores del modelo base incorporan un paso de preprocesado que LeRobot 0.5.1 no puede cargar. El entrenamiento se ejecuta en CUDA con `bfloat16`, `gradient_checkpointing: true` y `compile_model: false`, sin congelar el codificador visual y sin entrenar solo el experto, lo que implica que se actualizan tanto la torre de visión como el resto de la política. La normalización es por cuantiles para estado y acción (`STATE: QUANTILES`, `ACTION: QUANTILES`) e identidad para las entradas visuales, y no se usan acciones relativas (`use_relative_actions: false`).

El ajuste fino consta de 10.000 pasos con tamano de lote 32 y 8 *workers*, una tasa de aprendizaje de 2,5e-05 con *warmup* de 1.000 pasos, decaimiento hasta 2,5e-06 a lo largo de 30.000 pasos, *weight decay* de 0,01 y recorte de gradiente de norma 1,0. La semilla es 1000 y el guardado se realiza cada 2.000 pasos, con `eval_freq: -1` (sin evaluación automática durante el entrenamiento). El *dataset* es `armnet/busybox_push_green_button`, y se emplean los 39 episodios completos (índices 0 a 38) sin partición de validación: la única evaluación prevista es sobre el robot real. La innovación metodológica de esta variante no está en la arquitectura, sino en el pipeline de datos: se activa el aumento de imagen por defecto (`image_transforms.enable: true`), que sortea 3 de 6 transformaciones fotométricas o afines por fotograma.

## Capacidades

- Generación de acciones de manipulación: produce *chunks* de 50 acciones a partir de observaciones visuales y de estado, con 10 pasos de inferencia por predicción.
- Ejecución de una tarea específica: pulsar un botón verde en un montaje *busybox* con un brazo SO-101.
- Condicionamiento por lenguaje: acepta instrucciones textuales de tarea (hasta 200 tokens), lo que permite etiquetar la tarea dentro del prompt.
- Robustez inducida por aumento de datos: el entrenamiento con transformaciones fotométricas y afines busca tolerar variaciones de brillo (2,5 %-57,5 %) y de posición del raíl (±25 %).
- Aprendizaje por imitación: se entrena a partir de demostraciones teleoperadas, no de refuerzo ni de datos simulados.
- Integración con el ecosistema LeRobot: carga mediante `lerobot[pi]` y se puede enviar al *Space* de evaluación `armnet/armnet-eval`.
- No soporta *tool calling*, función de llamada, agentes multi-paso, visión general, audio ni modo de razonamiento: es una política robótica de tarea única.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Automatización del pulsado de botón en una celda tipo *busybox*: el modelo recibe la imagen de la cámara y el estado del brazo SO-101 y emite *chunks* de 50 acciones para completar la pulsación, adecuado porque está entrenado exactamente sobre esa tarea y esa morfología.
- Estudio de ablación sobre aumento de datos: sirve como rama `data` del grupo `aug_default` para comparar, contra la línea base b0 sin aumento, si las transformaciones fotométricas mejoran la tasa de éxito cuando la escena de despliegue difiere de la de entrenamiento.
- Punto de partida para nuevos ajustes finos: al derivar de `lerobot/pi05_base` y compartir el pipeline de LeRobot, se puede reutilizar como *warm start* para otras tareas con el mismo brazo, reduciendo pasos de entrenamiento.
- Evaluación de robustez frente a iluminación y posicionamiento: el protocolo de evaluación varía el brillo de la *lightbox* y la posición del raíl con semilla 42, de modo que el modelo permite medir sensibilidad a esas perturbaciones en 20 *rollouts*.
- Investigación en VLA de bajo coste: encaja en laboratorios con un único brazo SO-101 y una GPU, ya que el modelo completo ocupa aproximadamente 8,3 GB en bfloat16.
- Reproducibilidad de experimentos: los pesos base quedan fijados por revisión, el *dataset* es público y el entrenamiento se registra en W&B, lo que permite repetir el ajuste y auditar los *checkpoints* intermedios (el repositorio `_ckpts` conserva los dos más recientes).
- Validación comparativa entre variantes de aumento: al existir varios brazos de ablación con la misma receta, el modelo sirve para aislar el efecto de una sola decisión de preprocesado en el resultado final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* indica explícitamente que la única prueba es el robot real, que no existe partición de validación (*hold-out*) y que la evaluación se realiza enviando el modelo al *Space* `armnet/armnet-eval` (embodiment `lerobot/so-101`, tarea `push_green_button`, 20 *rollouts*, semilla de variación 42). No se proporcionan tasas de éxito ni métricas numéricas, y no se debe asumir ningún valor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,3 GB solo para pesos en bfloat16 (4,14 B × 2 bytes); con activaciones, memoria de trabajo de CUDA y *buffers* de imagen, conviene reservar entre 10 y 12 GB.
- En fp32 los pesos ocuparían unos 16,6 GB, por lo que no es una configuración recomendada para GPUs de consumo.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S o cualquier GPU profesional con 24 GB o más para mayor holgura; una RTX 4090 o RTX 3090 (24 GB) es suficiente para inferencia en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más (RTX 4080, RTX 4070 Ti Super, RTX 4090) usando bfloat16 y evitando cargas concurrentes. En GPUs de 12 GB o menos la inferencia es ajustada o inviable.
- Opciones de despliegue: la ruta oficial es LeRobot con el extra de π0.5 (`lerobot[pi]`) sobre PyTorch/CUDA. No se documentan exportaciones a GGUF, llama.cpp, Ollama, vLLM ni TGI, y al tratarse de una política robótica con experto de acciones no son vías de despliegue aplicables sin conversión adicional.
- Dependencia de acceso: la carga requiere un token de Hugging Face con permiso de lectura sobre el tokenizador restringido `google/paligemma-3b-pt-224`.
- Latencia y *throughput*: no disponibles. Como referencia de configuración, cada predicción ejecuta 10 pasos de inferencia y devuelve un *chunk* de 50 acciones, lo que amortiza el coste por acción en control continuo.
- Almacenamiento: el repositorio ocupa 9,4 GB, por encima de los 8,3 GB de los pesos, lo que sugiere incluir también otros artefactos (optimizador o ficheros auxiliares).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fanqi-robo/pi05_busybox_push_green_button_aug_default` | 4,14 B | 200 tokens | Pulsar boton verde, SO-101 | Apache 2.0 | Publicado (6 descargas, 0 likes) |
| `lerobot/pi05_base` | No disponible en la informacion proporcionada (misma familia π0.5) | No disponible | Politica base generalista, sin ajuste a esta tarea | No disponible en la informacion proporcionada | Publico en Hugging Face |
| Otras ramas de ablacion del mismo estudio | No disponible | No disponible | Misma tarea, sin aumento o con otras variantes | No disponible | Solo se documenta el grupo `data`, variante `aug_default` |

No se dispone de datos verificables de otros modelos VLA comparables (por ejemplo, variantes de la familia π0.5, π0 o politicas de LeRobot de distinto tamano) en la informacion proporcionada, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Tarea única: el modelo está ajustado exclusivamente para pulsar el botón verde con un SO-101; no generaliza a otras tareas ni a otras morfologías sin reentrenamiento.
- Datos de entrenamiento muy reducidos: solo 39 episodios, todos usados para entrenamiento, sin partición de validación ni *hold-out*.
- Riesgo de sobreajuste al entorno: las demostraciones se grabaron con una única configuración de iluminación, y la variación de escena en evaluación (brillo y raíl) es precisamente lo que la ablación intenta compensar. Si el aumento no funciona, la degradación en despliegue puede ser notable.
- Ausencia de métricas publicadas: no hay tasas de éxito ni comparativas numéricas, de modo que cualquier afirmación de rendimiento carece de respaldo en la informacion disponible.
- Riesgo de alucinación: en este contexto no aplica la generación de texto libre, pero sí existe riesgo de acciones incoherentes o inseguras ante observaciones fuera de distribución, algo crítico en un brazo real.
- Idiomas y alcance lingüístico: no documentados; las instrucciones de tarea se limitan a la formulación usada en el entrenamiento.
- Dependencia de versiones: requiere LeRobot 0.5.1 y la revisión `a538eb27` de `lerobot/pi05_base`; otras revisiones del base rompen la carga por incompatibilidad del paso de preprocesado.
- Tokenizador restringido: la carga exige un token con acceso al modelo *gated* `google/paligemma-3b-pt-224`.
- Licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero el tokenizador de PaliGemma está sujeto a sus propias condiciones de acceso y uso, que deben revisarse por separado.
- Validación comunitaria mínima: 6 descargas y 0 *likes* en el momento de la consulta, sin evidencia de uso independiente.
- Despliegue limitado: no hay soporte documentado para cuantización a 4 u 8 bits, GGUF, vLLM, TGI ni Ollama; solo la ruta LeRobot/PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_aug_default
- Checkpoints intermedios: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_aug_default_ckpts
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/armnet/busybox_push_green_button
- Space de evaluación en robot real: https://huggingface.co/spaces/armnet/armnet-eval
- Registro de entrenamiento en W&B: https://wandb.ai/fanqi-robo-saferobotics/pi05_busybox_push_green_button
- Tokenizador requerido (acceso restringido): https://huggingface.co/google/paligemma-3b-pt-224
