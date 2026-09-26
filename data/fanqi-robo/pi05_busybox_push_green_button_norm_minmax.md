# fanqi-robo/pi05_busybox_push_green_button_norm_minmax

## Resumen

`fanqi-robo/pi05_busybox_push_green_button_norm_minmax` es un checkpoint de politica robotica (VLA, vision-language-action) resultado de un fine-tuning de `lerobot/pi05_base` sobre la tarea concreta de pulsar un boton verde con un brazo SO-101 dentro del banco de pruebas BusyBox. No es un modelo de lenguaje: su salida son secuencias de acciones motoras (chunks de 50 pasos) condicionadas por observaciones visuales y una instruccion textual. Lo publica el usuario `fanqi-robo` como parte de un estudio de ablacion sobre estrategias de normalizacion dentro de la rama experimental `policy_test_fanqi` de alpha-robotics.

El interes de esta ficha no esta en el rendimiento del modelo, sino en su valor metodologico: se trata del brazo de ablacion `norm_minmax`, que aplica normalizacion MIN_MAX (mapeo del rango observado de articulaciones a [-1, 1]) al estado y a la accion, manteniendo la parte visual en IDENTITY. La hipotesis del autor es comprobar si el efecto observado en el checkpoint abierto equivalente de openpi (`villekuosmanen/pi05_busybox_multitask_minmax`), donde la normalizacion min-max elevo la tasa de exito del 20% al 40% en el leaderboard, se reproduce tambien en la implementacion de LeRobot y no es un artefacto de openpi.

Tecnicamente son 4.143.404.816 parametros (~4,14 B) en `safetensors` y `bfloat16`, con un repositorio de 9,4 GB, entrenados 10.000 pasos sobre los 39 episodios del dataset `armnet/busybox_push_green_button` sin conjunto de validacion. Es un artefacto de investigacion muy poco difundido (12 descargas, 0 likes) y de una sola tarea, por lo que debe tratarse como material reproducible de laboratorio y no como politica lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (VLA de LeRobot: backbone vision-lenguaje PaliGemma-3B mas experto de accion con flow matching, segun la configuracion de entrenamiento; no detallada en la model card) |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible como ventana de texto; `tokenizer_max_length: 200` tokens de prompt y `chunk_size: 50` / `n_action_steps: 50` acciones por chunk |
| Tipos de cuantizacion | no disponible (pesos publicados en `bfloat16`; no se ofrecen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no documenta cobertura linguistica; la tarea se especifica como `push_green_button`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato LeRobot; checkpoint en la raiz del repo, tag `step-10000`) |

Otros datos de configuracion: `dtype: bfloat16`, `gradient_checkpointing: true`, `compile_model: false`, `num_inference_steps: 10`, `chunk_size: 50`, `use_relative_actions: false`, `freeze_vision_encoder: false`, `train_expert_only: false`, `normalization_mapping` con VISUAL IDENTITY y STATE/ACTION MIN_MAX.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, solo la configuracion de entrenamiento. Esta indica que se parte de `lerobot/pi05_base`, es decir, la implementacion π0.5 de LeRobot, cuyo tokenizador depende de `google/paligemma-3b-pt-224` (repositorio con acceso restringido que requiere token del Hub). Los hiperparametros son coherentes con un VLA que combina un backbone vision-lenguaje con un experto de accion entrenado por flow matching: `num_inference_steps: 10` (pasos de desruido por chunk), `chunk_size: 50` y `n_action_steps: 50` (el chunk completo se ejecuta antes de volver a inferir), y `normalization_mapping` diferenciado por modalidad. Todo lo que exceda de esta lectura es inferencia y no debe darse por documentado.

El entrenamiento se hizo con `lerobot-train`, semilla 1000, 10.000 pasos, batch de 32, 8 workers, optimizador con learning rate 2,5e-5, weight decay 0,01, clipping de gradiente 1,0, 1.000 pasos de warmup y decaimiento hasta 2,5e-6 en 30.000 pasos. Se usaron los 39 episodios del dataset `armnet/busybox_push_green_button` sin hold-out, con `eval_freq: -1` (ninguna evaluacion automatica durante el entrenamiento) y `save_freq: 2000`. La base se fijo en la revision `a538eb27` porque revisiones posteriores de `lerobot/pi05_base` incorporan un paso de procesador que LeRobot 0.5.1 no puede cargar. La unica innovacion declarada es la propia ablacion: aplicar MIN_MAX a estado y accion en lugar de la normalizacion por defecto, como analogo directo en LeRobot del checkpoint de openpi que mejoro la tarea del 20% al 40%.

## Capacidades

- Control motor de manipulacion: genera chunks de 50 acciones para un brazo SO-101 (`lerobot/so-101`) a partir de observaciones visuales, con 10 pasos de inferencia por chunk.
- Seguimiento de instrucciones de tarea en lenguaje natural, limitado a la tarea concreta de pulsar el boton verde (`push_green_button`) sobre el montaje BusyBox.
- Politica de una sola tarea y un solo embodiment: no hay evidencia de generalizacion a otras tareas, objetos o robots.
- Condicionamiento visual completo durante el fine-tuning (`freeze_vision_encoder: false`), por lo que el encoder visual se adapta al dominio de la camara del montaje.
- Acciones en espacio absoluto (`use_relative_actions: false`), dependientes del esquema de normalizacion MIN_MAX ajustado al rango observado de articulaciones.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje con herramientas, es una politica robotica).
- Capacidades de agente y razonamiento multi-paso: no disponibles ni declaradas.
- Capacidades multilingues: no documentadas.
- Modo `thinking`, vision-lenguaje conversacional, audio, generacion de texto o codigo: no aplicables.
- Capacidad especial declarada: ninguna mas alla del rol de brazo de ablacion reproducible del grupo `normalization`.

## Casos de uso

- Reproduccion de la ablacion de normalizacion: comparar este checkpoint con el brazo base b0 bajo el mismo dataset (39 episodios), misma semilla y mismo presupuesto de 10.000 pasos, para verificar si MIN_MAX aporta la mejora observada en el checkpoint de openpi.
- Punto de partida para fine-tuning en tareas de panel o botonera: los pesos ya estan adaptados a una camara cenital y a un brazo SO-101 pulsando un objetivo, por lo que son una inicializacion razonable para tareas similares de pulsado con el mismo montaje.
- Evaluacion en el leaderboard `armnet/armnet-eval`: enviar el modelo al Space de evaluacion (embodiment `lerobot/so-101`, tarea `push_green_button`, 20 rollouts, semilla de variacion 42) para obtener la unica metrica aceptada por el autor.
- Validacion de pipeline end-to-end de LeRobot 0.5.1 con π0.5: sirve para comprobar la carga de pesos, el `normalization_mapping` y el bucle de inferencia con `num_inference_steps: 10` antes de escalar a entrenamientos mayores.
- Generacion de rollouts para aprendizaje por imitacion: los datos de la politica se pueden usar como demostraciones sinteticas o como linea base para comparar distribuciones de acciones frente a las humanas del dataset.
- Estudio de robustez de la normalizacion MIN_MAX: MIN_MAX es sensible a outliers en el rango observado de articulaciones, por lo que este checkpoint es material util para medir la degradacion cuando el estado se sale del rango de entrenamiento.
- Base para experimentos de destilacion o cuantizacion en VLA de ~4 B: al ser un modelo denso de 4,14 B que cabe en GPUs de consumo, permite estudiar tecnicas de compresion en robotica sin clúster dedicado.
- Docencia y ejercicios de robotica reproducible: el par modelo + dataset + Space de evaluacion permite reproducir un ciclo completo de entrenamiento y evaluacion de un VLA en un solo montaje de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card solo menciona, como motivacion, un resultado ajeno a este modelo. La tabla recoge unicamente lo documentado:

| Referencia | Metrica | Resultado | Nota |
|---|---|---|---|
| `villekuosmanen/pi05_busybox_multitask_minmax` (openpi) | Tasa de exito en `push_green_button` | 20% con normalizacion estandar, 40% con min-max | Dato citado por el autor en la model card como hipotesis a replicar; no es un resultado de este checkpoint |
| `fanqi-robo/pi05_busybox_push_green_button_norm_minmax` (paso 10000) | Tasa de exito en `armnet-eval` | no disponible | Pendiente de evaluacion: 20 rollouts, semilla de variacion 42 |
| `lerobot/pi05_base` | Tasa de exito en `push_green_button` | no disponible | Modelo base sin fine-tuning para esta tarea |

## Requisitos de hardware

- VRAM de pesos: 4.143.404.816 parametros en `bfloat16` equivalen a ~7,7 GiB (~8,3 GB) solo de pesos; en FP32 subiria a ~15,4 GiB.
- VRAM de inferencia: hay que sumar activaciones, el encoder visual y el procesador de imagenes. No hay mediciones publicadas; como referencia conservadora, reservar 12-16 GiB para bfloat16.
- GPU recomendadas: cabe con holgura en A100 40/80 GB, H100 y L40S; en el segmento de consumo funciona en RTX 4090 y RTX 3090 (24 GB). En tarjetas de 16 GB (RTX 4080, A4000) el margen es justo y no esta verificado. En 12 GB no hay datos que garanticen la carga.
- Si cabe en GPU de consumo: si, previsiblemente en RTX 4090/3090; no confirmado por el autor.
- Despliegue: la unica ruta documentada es `lerobot[pi]` con LeRobot 0.5.1 y `--policy.pretrained_path`, mas un token del Hub con permiso de lectura sobre el tokenizador restringido `google/paligemma-3b-pt-224`. Tambien es desplegable mediante el Space de evaluacion `armnet/armnet-eval`.
- Opciones no soportadas: no hay variantes GGUF, por lo que llama.cpp y Ollama no aplican; tampoco se documenta soporte de vLLM ni TGI, que estan orientados a modelos de lenguaje y no a politicas de accion.
- Latencia y throughput: no disponibles. El coste por chunk viene fijado por `num_inference_steps: 10` y un horizonte de 50 acciones antes de reinferir; no se publican tiempos por paso ni frecuencia de control alcanzada.
- Entrenamiento: la configuracion usa `bfloat16`, `gradient_checkpointing: true`, batch 32 y 8 workers, lo que sugiere que el fine-tuning completo no cabe con comodidad en GPUs de 24 GB; no se especifica el hardware empleado.
- Almacenamiento: 9,4 GB de repositorio, mas el dataset y los checkpoints intermedios alojados en el repositorio `_ckpts` y en el volumen `pi05-busybox-ckpts`.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / contexto | Normalizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fanqi-robo/pi05_busybox_push_green_button_norm_minmax` (este) | 4,14 B | `push_green_button` en SO-101; chunk de 50 acciones y prompt de hasta 200 tokens | STATE y ACTION en MIN_MAX, VISUAL en IDENTITY | apache-2.0 | Publico; 12 descargas, 0 likes; evaluacion solo en robot real |
| `lerobot/pi05_base` | no disponible en la informacion proporcionada | Modelo base de π0.5 en LeRobot, sin fine-tuning para esta tarea | No aplica (base) | no disponible en la informacion proporcionada | Publico; es la base de la que deriva este checkpoint (revision fijada `a538eb27`) |
| `villekuosmanen/pi05_busybox_multitask_minmax` (openpi) | no disponible en la informacion proporcionada | Variante multitarea sobre BusyBox con min-max | MIN_MAX | no disponible en la informacion proporcionada | Publico; citado como referencia, con mejora del 20% al 40% en el leaderboard |

No se dispone de datos de contexto, licencia ni parametros de los dos modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a tarea, estrategia de normalizacion y procedencia.

## Limitaciones y advertencias

- Alcance de una sola tarea: la politica solo ha sido entrenada para pulsar el boton verde; no hay evidencia de generalizacion a otras tareas, posiciones o montajes.
- Un solo embodiment: disenada para `lerobot/so-101`. Usarla en otro robot requeriria reentrenamiento y no hay documentacion de transferencia.
- Dataset muy reducido: 39 episodios, todos usados en entrenamiento y sin conjunto de retencion (`no hold-out; robot eval only`), lo que hace imposible medir sobreajuste con datos internos.
- Sin validacion durante el entrenamiento: `eval_freq: -1`, de modo que no existe curva de evaluacion que justifique la eleccion del paso 10000 frente a otros checkpoints.
- Una sola semilla: `seed: 1000`. No hay replicas que permitan estimar la varianza del resultado.
- Riesgo de sobreajuste y de memorizacion de la configuracion de camara y del montaje concreto; cualquier cambio de iluminacion, posicion del objeto o encuadre puede degradar la politica.
- Sensibilidad de MIN_MAX a valores atipicos: el mapeo a [-1, 1] depende del rango observado de articulaciones durante el entrenamiento; estados fuera de ese rango se proyectan de forma degenerada. Combinado con `use_relative_actions: false`, no hay margen de recuperacion relativo.
- Dependencia de un tokenizador restringido: la carga exige `lerobot[pi]` y un token del Hub con acceso a `google/paligemma-3b-pt-224`; sin ese permiso el modelo no se puede instanciar.
- Fragilidad de versiones: la base esta fijada a `a538eb27` porque revisiones posteriores usan un paso de procesador incompatible con LeRobot 0.5.1; actualizar la libreria puede romper la carga.
- Evidencia externa minima: 12 descargas y 0 likes. El unico criterio de exito admitido por el autor es la evaluacion en robot real, y sus resultados no estan publicados en la model card.
- Licencia y origen: el checkpoint se declara apache-2.0, pero los pesos derivan de `lerobot/pi05_base` y el tokenizador de PaliGemma; conviene verificar las condiciones de la cadena completa antes de un uso comercial.
- Sesgos: no hay informacion sobre sesgos, composicion demografica ni diversidad de escenarios. Los sesgos relevantes en este caso serian de tipo fisico (posiciones, colores, geometria del montaje) y no estan caracterizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_norm_minmax
- Checkpoints intermedios: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_norm_minmax_ckpts
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/armnet/busybox_push_green_button
- Space de evaluacion: https://huggingface.co/spaces/armnet/armnet-eval
- Seguimiento del entrenamiento en W&B: https://wandb.ai/fanqi-robo-saferobotics/pi05_busybox_push_green_button
- Checkpoint de openpi usado como referencia: https://huggingface.co/villekuosmanen/pi05_busybox_multitask_minmax
- Tokenizador restringido requerido: https://huggingface.co/google/paligemma-3b-pt-224
- Libreria LeRobot: https://github.com/huggingface/lerobot
