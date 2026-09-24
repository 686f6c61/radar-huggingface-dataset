# drashutoshspace/moonbot_pi0_v2

## Resumen

moonbot_pi0_v2 es un ajuste fino de la politica robotica pi0 (vision-language-action) realizado por el usuario drashutoshspace a partir del checkpoint base [`lerobot/pi0_base`](https://huggingface.co/lerobot/pi0_base). El modelo se entrena sobre el conjunto de datos [`gdiazsrl/three_blocks_stack_sep22`](https://huggingface.co/datasets/gdiazsrl/three_blocks_stack_sep22), compuesto por 296 episodios (263 de entrenamiento y 33 retenidos para validacion, estratificados sobre 9 tareas) y orientado a la tarea de apilar tres bloques con un brazo robotico.

El problema que resuelve es el control de un manipulador a partir de observaciones multimodales: 21 dimensiones de estado (`joint_read` de 8, `tip_pos` de 7 y `F_ee` de 6), tres camaras y un vector de accion de 8 dimensiones. Se distribuye como repositorio autocontenido con pesos, pre/post-procesadores, tokenizer de PaliGemma, contrato de despliegue (`rosetta_contract.yaml`) y scripts de preparacion y prueba offline, lo que permite cargar el checkpoint en el robot sin acceso a Hugging Face.

Es relevante ahora porque forma parte del ecosistema LeRobot y del pipeline `robotics` de Hugging Face, y porque documenta de forma poco habitual el proceso de entrenamiento completo (hiperparametros, diferencias respecto a la version v1 y estado de progreso). No obstante, el entrenamiento seguia en curso en el momento de la publicacion: el ultimo checkpoint subido es `checkpoint-006250` de un total de 16.250 pasos (2 epocas). El modelo no declara idiomas soportados ni tamano de parametros en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de pi0; el detalle de capas no se especifica en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no procede (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en bfloat16 (unico formato documentado); no se documentan GGUF, int8 ni 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 44,5 GB |
| Entradas | 3 camaras + `observation.state` de 21 dimensiones (`joint_read` 8, `tip_pos` 7, `F_ee` 6) |
| Salidas | accion de 8 dimensiones |
| Checkpoints publicados | cada 1.250 pasos (80.000 muestras) hasta 16.250; ultimo subido: `checkpoint-006250` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna mas alla de identificar el modelo como un ajuste fino de pi0 dentro de la libreria LeRobot, con tokenizer de PaliGemma empaquetado en cada checkpoint. Se trata por tanto de una politica de robotica que combina percepcion visual (tres camaras), estado propioceptivo y de fuerza, y generacion de acciones continuas de 8 dimensiones, bajo un contrato de despliegue explicito: `observation.state` de 21 dimensiones segun `deploy/rosetta_contract.yaml`.

El entrenamiento (run v2) se realizo con batch size 64, 16.250 pasos equivalentes a 2,0 epocas, optimizador con programacion coseno de tasa de aprendizaje con pico 5e-5 y minimo 5e-6, warmup de 250 pasos y decaimiento a lo largo de toda la ejecucion. Se uso bfloat16 con gradient checkpointing activado, requisito indicado por el autor para evitar OOM en una GPU de 96 GB. La validacion emplea el 10 % de los episodios por tarea, con evaluacion cada 625 pasos, y se ejecuto en una RTX PRO 6000 Blackwell de 96 GB con un consumo aproximado de 48 GB. Respecto al run v1 (`drashutoshspace/moonbot_pi0_three_blocks_stack`), el autor documenta cuatro cambios: batch de 16 a 64 con LR de 2,5e-5 a 5e-5 (mismo throughput medido), programacion de LR extendida a toda la ejecucion en lugar de agotarse en torno al paso 20.000, anadido de particion de validacion y aumento de 0,62 a 2 epocas.

## Capacidades

- Generacion de acciones de control continuo de 8 dimensiones para un manipulador robotico.
- Percepcion multimodal: integra tres camaras junto con estado articular, posicion de punta y fuerza en el efector final.
- Ejecucion de la tarea especifica de apilado de tres bloques, con 9 tareas estratificadas en el conjunto de datos.
- Carga y ejecucion completamente offline: cada checkpoint incluye tokenizer, pre/post-procesadores, contrato rosetta y los scripts `prepare_deploy.py` y `test_offline.py`.
- Ajuste fino adicional: al derivar de `lerobot/pi0_base`, es reentrenable sobre nuevos conjuntos de demostraciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible.
- Capacidades multilingues: no disponible (el modelo no declara idiomas).
- Modo de razonamiento (thinking), vision-language general, audio: no disponibles como capacidades declaradas.

## Casos de uso

- Apilado de tres bloques en laboratorio: es la tarea objetivo del ajuste fino, con 296 episodios de demostracion y una politica entrenada para emitir acciones de 8 dimensiones a partir de tres camaras y lectura de fuerza.
- Pick-and-place con realimentacion de fuerza: la inclusion de `F_ee` (6 dimensiones) en el estado permite detectar contacto y ajustar la presion de agarre, util en tareas de ensamblaje donde el control puramente visual es insuficiente.
- Despliegue en robot aislado de red: los checkpoints son autocontenidos y el script `test_offline.py` permite verificar la carga sin acceso a Hugging Face, adecuado para entornos industriales o de investigacion con conectividad restringida.
- Investigacion en politicas VLA: sirve como punto de partida reproducible para estudiar el efecto del batch size, la programacion de LR y el numero de epocas, dado que el autor documenta las diferencias entre v1 y v2.
- Ajuste fino sobre nuevas tareas de manipulacion: partiendo de `lerobot/pi0_base` o de este checkpoint, se puede reentrenar con demostraciones propias manteniendo el mismo contrato de 21 dimensiones de estado y 8 de accion.
- Evaluacion comparativa de checkpoints intermedios: al publicarse un checkpoint cada 1.250 pasos, permite estudiar la evolucion de la politica a lo largo del entrenamiento y seleccionar el punto optimo antes de completar las 2 epocas.
- Replicacion de experimentos en robotica: el repositorio incluye `prepare_deploy.py` y `DEPLOY.md` con comandos exactos, lo que facilita reproducir el despliegue en hardware equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, comparaciones con otras politicas ni metricas de evaluacion sobre la particion de validacion (33 episodios retenidos), aunque si describe el protocolo de evaluacion (cada 625 pasos sobre el 10 % de episodios por tarea).

## Requisitos de hardware

- Entrenamiento referenciado por el autor: RTX PRO 6000 Blackwell de 96 GB, con aproximadamente 48 GB en uso, bfloat16 y gradient checkpointing obligatorio (sin el se produce OOM en 96 GB) con batch size 64.
- Inferencia: no se publican cifras oficiales. Estimacion orientativa no confirmada: un modelo VLA de esta familia en bfloat16/fp16 requiere del orden de 8-12 GB de VRAM considerando pesos, codificadores de vision para tres camaras y buffers de activaciones.
- GPU consumer: segun esa estimacion, cabria en tarjetas de 16-24 GB (RTX 4080/4090, RTX A5000) siempre que la latencia de control lo permita; no hay confirmacion del autor.
- GPU profesionales para entrenamiento o ajuste fino: A100 80 GB, H100 80 GB o RTX PRO 6000 96 GB.
- Opciones de despliegue: libreria `lerobot` con los scripts incluidos en `deploy/` (`prepare_deploy.py`, `test_offline.py`, `rosetta_contract.yaml`, `DEPLOY.md`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no resultan aplicables a una politica de robotica de este tipo.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moonbot_pi0_v2 | no disponible | no disponible | Sin benchmarks publicados | Apache 2.0 | Hugging Face, entrenamiento en curso |
| lerobot/pi0_base | no disponible en la informacion proporcionada | no disponible | No documentado aqui | No disponible en la informacion proporcionada | Hugging Face (modelo base del ajuste) |
| drashutoshspace/moonbot_pi0_three_blocks_stack (v1) | no disponible | no disponible | No documentado; 0,62 epocas, batch 16, LR 2,5e-5 | Apache 2.0 (segun repositorio del autor) | Hugging Face |

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La comparacion con v1 se limita a los hiperparametros documentados por el autor: batch 16 frente a 64, LR 2,5e-5 frente a 5e-5 y 0,62 frente a 2 epocas.

## Limitaciones y advertencias

- Entrenamiento incompleto: el ultimo checkpoint publicado es `checkpoint-006250` de 16.250 pasos, por lo que el modelo distribuido no corresponde a la ejecucion final.
- Conjunto de datos muy reducido y especifico: 296 episodios de una unica tarea (apilado de tres bloques), lo que limita la generalizacion a otros objetos, entornos o morfologias de robot.
- Particion de validacion pequena: 33 episodios, insuficiente para extraer conclusiones robustas sobre el rendimiento real.
- Ausencia total de benchmarks publicos: no hay tasas de exito ni comparaciones verificables con otras politicas.
- Dependencia estricta del contrato de despliegue: el estado debe presentarse como vector de 21 dimensiones (`joint_read` 8 + `tip_pos` 7 + `F_ee` 6) con 3 camaras y accion de 8 dimensiones; cualquier desviacion invalida el modelo.
- Requisitos de hardware elevados para reentrenamiento: se necesita gradient checkpointing incluso en GPUs de 96 GB.
- Idiomas y capacidades linguisticas: no declarados; el modelo esta orientado al control motor y no a generacion de texto general.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones fisicas inseguras o erraticas fuera de la distribucion de entrenamiento; se recomienda validacion en simulacion y limites de parada de emergencia antes de operar con hardware real.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia; conviene revisar aparte las condiciones del modelo base `lerobot/pi0_base` y del conjunto de datos de origen.
- Sesgos conocidos: no documentados en la informacion disponible.
- El repositorio ocupa 44,5 GB, lo que implica costes de almacenamiento y descarga relevantes dado que se publican checkpoints intermedios completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drashutoshspace/moonbot_pi0_v2
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/gdiazsrl/three_blocks_stack_sep22
- Version anterior (v1): https://huggingface.co/drashutoshspace/moonbot_pi0_three_blocks_stack
- Documentacion de despliegue: `deploy/README.md`, `deploy/rosetta_contract.yaml`, `deploy/DEPLOY.md` dentro del repositorio
- Scripts incluidos: `prepare_deploy.py`, `test_offline.py`
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
