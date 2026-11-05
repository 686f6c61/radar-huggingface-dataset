# arkojit1/pi05_stack_yellow_on_red_joint_bs64_6k_20k

## Resumen

Este repositorio contiene un fine-tuning del modelo de robotica π₀.₅ (`lerobot/pi05_base`) sobre el conjunto de datos `Ameyapores/haply_stack_yellow_red_joint_delta`, compuesto por 112 episodios de manipulacion con un brazo Franka recogidos mediante un dispositivo de teleoperacion Haply. La tarea es apilar un objeto amarillo sobre uno rojo, expresada en espacio articular (deltas de las juntas `joint_0..6` mas la apertura del gripper). El checkpoint publicado corresponde al paso 6.000 de un entrenamiento planificado de 20.000 pasos.

El modelo base π₀.₅ es una politica visio-lenguaje-accion (VLA) desarrollada por Physical Intelligence, que combina un codificador de vision SigLIP, un backbone de lenguaje Gemma-2B y un "action expert" que genera trayectorias de acciones mediante flow matching. En este fine-tuning solo se entrena el action expert; el resto de componentes permanece congelado.

Es relevante como ejemplo de adaptacion de una VLA generalista a una tarea concreta con pocos datos (112 episodios) y en una estacion de trabajo relativamente modesta (8 GPU AMD MI300X). No obstante, se trata de un checkpoint intermedio elegido por peticion del autor, no del mejor punto de evaluacion del run, y su utilidad practica fuera del entorno de recogida esta por demostrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π₀.₅ (SigLIP + Gemma-2B + action expert con flow matching) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no conversacional) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tamano del repo | 7,5 GB |
| Modelo base | `lerobot/pi05_base` (revision `a538eb27`) |
| Dataset de ajuste | `Ameyapores/haply_stack_yellow_red_joint_delta` (revision `dd50a45`) |
| Entradas de observacion | `observation.state` (8-D) + 3 imagenes (`wrist`, `scene0`, `scene1`) |
| Salida | chunk de 50 acciones de 8-D (deltas articulares + gripper) |
| Chunk size / n_action_steps | 50 / 50 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de π₀.₅: un codificador visual SigLIP, un backbone de lenguaje Gemma-2B y un modulo especializado ("action expert") que produce acciones continuas mediante flow matching. En este fine-tuning se aplica `train_expert_only=true`, de modo que SigLIP y Gemma-2B quedan congelados y solo se actualiza el action expert. La politica emite un chunk de 50 pasos de acciones de 8 dimensiones.

El entrenamiento se realizo con LeRobot 0.4.4 sobre 8 GPU AMD MI300X (8 muestras por GPU, batch global 64), con AdamW (LR pico 2,5e-5, betas 0,9/0,95, weight decay 0,01, grad clip 1,0), schedule coseno con warmup de 666 pasos fijado a 20.000 pasos y `bf16`. La normalizacion es por cuantiles (q01-q99) para estado y accion, sin augmentacion. Se reservaron los 12 ultimos episodios (100-111) como conjunto de evaluacion y se entreno sobre los episodios 0-99. El checkpoint publicado (paso 6.000, ~7,8 epocas) presenta una perdida de evaluacion de 0,1046 (perdida de entrenamiento 0,090); el minimo del run fue 0,0984 en el paso 4.000.

## Capacidades

- Generacion de trayectorias de accion en espacio articular para un brazo Franka (deltas de `joint_0..6` mas gripper).
- Percepcion visual a partir de tres camaras simultaneas (muneca y dos vistas de escena).
- Ejecucion de una unica tarea de apilamiento (objeto amarillo sobre objeto rojo).
- Generacion de chunks de 50 acciones para control a frecuencia de control del robot.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural.
- No se documentan capacidades multilingues ni modos de pensamiento (thinking).

## Casos de uso

- **Investigacion en VLA y fine-tuning con pocos datos**: sirve como referencia de como adaptar π₀.₅ a una tarea concreta con 112 episodios y una sola tarea, util para estudiar el efecto del numero de pasos y del tamano del dataset.
- **Reproduccion de experimentos de robotica**: el checkpoint permite reproducir el pipeline de LeRobot 0.4.4 sobre el dataset `haply_stack_yellow_red_joint_delta` y comparar con otros checkpoints del mismo run.
- **Benchmark interno de apilamiento**: puede emplearse como punto de partida en entornos controlados con la misma camara y la misma disposicion fisica para medir tasas de exito de la tarea.
- **Desarrollo de pipelines de teleoperacion a politica**: util para validar la conversion de datos de un dispositivo Haply a espacio articular y su uso en entrenamiento de politicas.
- **Docencia y divulgacion**: ejemplo didactico de una VLA con flow matching y de los detalles practicos de despliegue (mapeo de camaras, normalizacion por cuantiles, aplicacion de deltas).
- **Punto de partida para nuevos fine-tunings**: al estar basado en `lerobot/pi05_base`, puede reajustarse a otras tareas o dominios partiendo de este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de evaluacion (flow matching) sobre 12 episodios retenidos:

| Metrica | Valor |
|---|---|
| Eval loss (paso 6.000) | 0,1046 |
| Train loss (paso 6.000) | 0,090 |
| Mejor eval loss del run | 0,0984 (paso 4.000) |
| Dispersion punto a punto | ~±0,01 |

El autor advierte que esta perdida no equivale a tasa de exito de la tarea y no es comparable con los modelos de la familia `pi05_stack_yellow_on_red_*` en espacio de deltas de efector final, cuyo espacio de acciones y normalizacion difieren.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial; con 3.616 millones de parametros, una inferencia en `bf16` requiere del orden de 7-8 GB solo para pesos, mas activaciones y buffers de vision.
- **GPU recomendadas**: el autor entreno en 8 AMD MI300X, pero para inferencia de una sola politica no se especifica hardware minimo.
- **Consumer GPU**: previsiblemente cabe en GPUs de 16-24 GB (RTX 4080/4090) si se ejecuta en `bf16` sin cuantizacion, aunque no se documenta oficialmente.
- **Despliegue**: la carga requiere LeRobot 0.4.4 con el fork de `transformers` de Hugging Face para π₀ (rama `fix/lerobot_openpi`); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arkojit1/pi05_stack_yellow_on_red_joint_bs64_6k_20k` | 3.616 M | no disponible | Apilamiento Franka (espacio articular) | no disponible | HuggingFace |
| `lerobot/pi05_base` | no disponible | no disponible | VLA generalista (base) | no disponible | HuggingFace |
| `pi05_stack_yellow_on_red_*` (espacio efector final) | no disponible | no disponible | Apilamiento Franka (deltas de efector) | no disponible | HuggingFace |
| Otros VLA open source (p. ej. OpenVLA, RT-2) | no disponible | no disponible | Manipulacion generalista | no disponible | no disponible |

No se dispone de datos suficientes para una comparacion cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- **Checkpoint intermedio**: el paso 6.000 no es el mejor punto del run (el minimo de eval fue el paso 4.000); su seleccion responde a una peticion del autor.
- **Una sola tarea y un solo entorno**: el modelo solo se ha ajustado para apilar un objeto amarillo sobre uno rojo con la configuracion concreta del dataset; no generaliza a otras tareas ni disposiciones.
- **Dependencia del mapeo de camaras**: el orden de las imagenes (`wrist`, `scene0`, `scene1`) debe respetarse exactamente; un mapeo incorrecto degrada la politica.
- **Espacio de acciones especifico**: las acciones son deltas articulares con gripper absoluto (0-1); aplicarlas de forma distinta a la del dataset invalida el control.
- **Normalizacion por cuantiles**: los valores q01-q99 deben reproducirse en despliegue.
- **Sin datos de exito de tarea**: no se reporta tasa de exito; la eval loss no es una medida directa de rendimiento en el robot.
- **Licencia no disponible**: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- **Riesgo de sobreajuste**: 112 episodios y una sola tarea, con 7,8 epocas completadas en este checkpoint.
- **Dependencia de software fragil**: requiere LeRobot 0.4.4 y un fork especifico de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_stack_yellow_on_red_joint_bs64_6k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste: https://huggingface.co/datasets/Ameyapores/haply_stack_yellow_red_joint_delta
- LeRobot (libreria): https://github.com/huggingface/lerobot
- Physical Intelligence (π₀.₅): no disponible en la informacion proporcionada
