# happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup-v2

## Resumen

`happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup-v2` es un ajuste fino (fine-tune) de robótica del modelo fundacional visión-lenguaje-acción (VLA) `nvidia/GR00T-N1.6-3B`. Lo publica el usuario happyhappy-jun y resuelve una tarea concreta y acotada: en un robot ALOHA estacionario y bimanual, recoger dos cubos azules y depositarlos en un vaso, siguiendo la instrucción de lenguaje "Pick up the two blue cubes and place them in the cup.". El modelo no es un modelo de lenguaje conversacional: su salida son acciones de control de 14 dimensiones.

Técnicamente es un modelo VLA de 3B parámetros (según la denominación del modelo base) entrenado por imitación sobre 68 episodios y 36.390 fotogramas grabados a 50 Hz, con cuatro cámaras (high, low, wrist_left, wrist_right) a resolución 240x424 en h264. El repositorio contiene dos variantes de la misma receta que difieren únicamente en la frecuencia de control y el horizonte de acción: `r50_h50` (50 Hz, horizonte de 50 pasos, 1,0 s de chunk) y `r25_h32` (25 Hz, horizonte de 32 pasos, 1,28 s).

Es relevante ahora porque documenta de forma muy explícita una campaña de ajuste fino reproducible sobre un modelo fundacional abierto para manipulación, incluyendo decisiones de diseño poco habituales de documentar (dropout de estado, deltas relativos de brazo con pinzas absolutas, remuestreo de datos de 50 Hz a 25 Hz) y los checkpoints intermedios cada 10.000 pasos. El modelo tiene 0 descargas y 0 likes en el momento de la consulta y no declara partición de validación, por lo que debe tratarse como un artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de `nvidia/GR00T-N1.6-3B`; la model card no desglosa la composicion interna (se menciona un `action_head` con `mask_token`) |
| Parametros totales | 3B segun la denominacion del modelo base (`GR00T-N1.6-3B`); la model card no publica el recuento exacto |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. La entrada es multimodal (4 camaras a 240x424 mas estado de 14 dimensiones); no se especifica ventana de contexto |
| Tipos de cuantizacion | No disponible. Se distribuyen pesos en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible. La unica instruccion de tarea documentada esta en ingles; no se declara soporte multilingue |
| Licencia | NVIDIA Open Model License (`license: other` en HuggingFace), enlazada en la model card |
| Formato de pesos | safetensors, acompanado de `config.json`, `aloha_config.py` (configuracion de modalidad en Python) y `modality.json` |
| Tamano del repositorio | 72,3 GB (incluye checkpoints de ambas variantes) |
| Dimension de estado/accion | 14 dimensiones: right_arm 0:6, right_gripper 6:7, left_arm 7:13, left_gripper 13:14 |
| Pipeline declarado | robotics |
| Modelo base | `nvidia/GR00T-N1.6-3B` |

## Arquitectura y entrenamiento

La model card identifica el modelo como un VLA (vision-language-action) construido sobre `nvidia/GR00T-N1.6-3B`, con etiqueta de embodiment `NEW_EMBODIMENT`. No se detalla en la informacion proporcionada la composicion exacta del backbone (codificador visual, torre de lenguaje, cabeza de accion), mas alla de la existencia de un `action_head` con un peso `mask_token` y de que el modelo consume cuatro flujos de camara junto con el estado articular de 14 dimensiones para producir chunks de acciones. La tarea se aprende por imitacion a partir de demostraciones reales (tag `imitation-learning`), no mediante RLHF ni DPO.

El entrenamiento se realizo sobre 68 episodios y 36.390 fotogramas a 50 Hz, con todas las epocas usadas para entrenamiento (sin particion held-out), en 4xA100-40GB con batch efectivo de 64 (16 por GPU), learning rate 1e-4, warmup 0.05, weight decay 1e-5, scheduler coseno, 40.000 pasos y checkpoints cada 10.000 pasos. El preprocesado incluye color jitter (0.3/0.4/0.5/0.08) y redimensionado de imagenes al lado corto 256. Dos innovaciones destacables de la receta: (1) dropout de estado de 0.3 durante el entrenamiento, sustituyendo el token de estado por un token de mascara aprendido en el 30 % de las muestras, con `state_dropout_prob` fijado a 0.0 en `config.json` para inferencia; y (2) brazos en modo relativo (delta respecto al estado articular actual) con pinzas absolutas, lo que obliga a pasar el estado de 14 dimensiones en cada llamada. La variante a 25 Hz se deriva de la original tomando un fotograma de cada dos mediante `make_25hz_dataset.py`.

## Capacidades

- Manipulacion bimanual condicionada por lenguaje: ejecuta la instruccion "Pick up the two blue cubes and place them in the cup." en un ALOHA estacionario.
- Control de 14 dimensiones con semantica fija: 6 articulaciones y pinza por brazo (right_arm 0:6, right_gripper 6:7, left_arm 7:13, left_gripper 13:14).
- Percepcion multi-camara: consume 4 vistas simultaneas (high, low, wrist_left, wrist_right) a 240x424.
- Prediccion por chunks de acciones: 50 pasos (1,0 s) en la variante de 50 Hz y 32 pasos (1,28 s) en la de 25 Hz.
- Control relativo de brazo con pinzas absolutas, lo que requiere inyectar el estado actual en cada llamada.
- Robustez parcial a la ausencia de estado: el entrenamiento con dropout de estado de 0.3 busca tolerar entradas de estado degradadas o ausentes (comportamiento no cuantificado en la informacion disponible).
- No dispone de generacion de texto libre, tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM: es una politica robotica, no un asistente.

## Casos de uso

- Reproduccion de la tarea en un banco ALOHA real: cargar `<arm>/checkpoint-40000` con la configuracion `aloha_config.py` correspondiente y ejecutar a la frecuencia de control del brazo elegido (50 Hz o 25 Hz), pasando el estado de 14 dimensiones en cada llamada.
- Investigacion en aprendizaje por imitacion con pocos datos: el modelo sirve como referencia de que 68 episodios (36.390 fotogramas) bastan para una tarea bimanual de pick-and-place con instruccion de lenguaje, y permite estudiar el efecto del numero de pasos de entrenamiento usando los checkpoints de 10k, 20k, 30k y 40k.
- Estudio de frecuencia de control y horizonte de accion: las dos variantes (`r50_h50` frente a `r25_h32`) permiten comparar experimentalmente el compromiso entre tasa de control y duracion del chunk (1,0 s frente a 1,28 s) sobre exactamente los mismos datos.
- Linea base para comparativas de VLA: al ser un fine-tune de un modelo fundacional abierto con receta documentada, sirve como punto de partida para medir el impacto de cambiar el backbone o la configuracion de modalidad en una tarea fija.
- Generacion de datos sinteticos o de aumentos para entrenamiento: los chunks predichos pueden usarse para evaluar la estabilidad de la politica antes de desplegar una nueva version sobre el robot.
- Validacion de pipelines de inferencia robotica: el modelo permite comprobar latencias, gestion de buffers de camaras a 50 Hz y sincronizacion estado-accion en el stack de despliegue antes de pasar a tareas mas complejas.
- Formacion y docencia en robotica: por su tamano (3B) y su tarea claramente delimitada, es un caso asequible para ilustrar un flujo completo de teleoperacion, grabacion, conversion de formato y ajuste fino de un VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion ni curvas de evaluacion; ademas, esta campana no reserva ninguna particion de validacion (los 68 episodios se usan para entrenamiento), por lo que no existe una metrica de generalizacion reportada.

## Requisitos de hardware

- Entrenamiento documentado: 4xA100-40GB con batch efectivo de 64 (16 por GPU), learning rate 1e-4 y 40.000 pasos. No se indican horas totales de entrenamiento.
- VRAM de inferencia: no publicada en la informacion disponible. Como estimacion orientativa para un modelo de 3B en bf16/fp16, los pesos ocupan en torno a 6-8 GB, a los que hay que sumar codificadores visuales para 4 camaras y buffers de accion; una horquilla realista de trabajo se situa en 10-20 GB en precision completa y por debajo de 8 GB con cuantizacion de 8 bits (estimacion no confirmada por el autor).
- GPU de gama profesional: A100-40GB y H100 son adecuadas tanto para entrenamiento como para inferencia; el modelo se entreno en A100-40GB.
- GPU de consumo: el modelo deberia caber en tarjetas con 16-24 GB de VRAM (RTX 4090, RTX 3090, RTX 4080) en precision reducida o cuantizado, con el margen justo en las de 16 GB. No hay confirmacion del autor.
- Almacenamiento: el repositorio ocupa 72,3 GB, por lo que conviene descargar unicamente el brazo y el checkpoint necesarios en lugar del repositorio completo.
- Opciones de despliegue: la informacion disponible no especifica servidores de inferencia compatibles. Los checkpoints se distribuyen con `config.json`, `aloha_config.py` y `modality.json`, pensados para cargarse con el stack de inferencia de GR00T N1.6. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no son el vehiculo habitual para politicas de accion.
- Latencia y throughput: no se publican mediciones. Como requisito derivado del diseno, la inferencia debe completar cada chunk antes de que se agote su duracion (1,0 s a 50 Hz; 1,28 s a 25 Hz) para no interrumpir el control en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup-v2` | 3B (base) | 50 Hz/H50 y 25 Hz/H32 | Pick two blue cubes into the cup (ALOHA) | NVIDIA Open Model License | HuggingFace, 0 descargas, 0 likes |
| `happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup` | 3B (base) | 50 Hz, H=32 | Misma tarea y robot | NVIDIA Open Model License | HuggingFace |
| `happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup-15hz` | 3B (base) | 15 Hz, H=16 | Misma tarea y robot | NVIDIA Open Model License | HuggingFace |
| `nvidia/GR00T-N1.6-3B` (modelo base) | 3B | No aplica (modelo fundacional) | Tareas generalistas de manipulacion condicionadas por lenguaje | NVIDIA Open Model License | HuggingFace |

No se dispone de datos verificados en la informacion proporcionada para comparar con otras familias de modelos VLA (por ejemplo OpenVLA, pi0 o RDT): no disponible.

## Limitaciones y advertencias

- Sin particion de validacion: los 68 episodios se usaron integros para entrenamiento, por lo que no existe evidencia publicada de generalizacion fuera de las condiciones grabadas.
- Tarea hipersingular: solo se ha ajustado para "recoger dos cubos azules y meterlos en el vaso" con un ALOHA estacionario; no debe esperarse transferencia a otras tareas, objetos o morfologias sin nuevo ajuste.
- Acoplamiento estricto al embodiment: la semantica de las 14 dimensiones (orden de articulaciones y pinzas) y las camaras usadas estan fijadas; un mapeo distinto invalida las predicciones.
- Convencion mixta de acciones: los brazos son relativos y las pinzas absolutas; omitir el estado actual en cada llamada produce comandos incorrectos.
- Obligacion de respetar la frecuencia de control: cada checkpoint debe ejecutarse a la tasa de su brazo (50 Hz o 25 Hz); mezclarlas altera la interpretacion temporal de los chunks.
- Riesgo de alucinacion de acciones: al ser una politica entrenada por imitacion, ante escenas fuera de distribucion puede generar trayectorias plausibles pero fisicamente erroneas, sin ninguna senal de incertidumbre.
- Sesgos de datos: 68 episodios grabados en un unico entorno, con iluminacion, disposicion de camaras y posiciones iniciales concretas; la variabilidad de colores, fondos u objetos no esta cubierta.
- Idiomas: no se declara soporte multilingue; la unica instruccion documentada esta en ingles y no se especifica como se comporta con instrucciones en castellano.
- Licencia: NVIDIA Open Model License (categoria `other` en HuggingFace). Es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia de codigo abierto estandar y puede imponer condiciones adicionales sobre el modelo derivado.
- Repositorio de gran tamano (72,3 GB) y sin versiones cuantizadas publicadas; el despliegue en produccion exige gestionar almacenamiento y transferencia.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni validacion externa documentada.
- Reputacion del artefacto: al ser un fine-tune de un tercero sin evaluacion publicada, conviene tratarlo como material de investigacion y no como componente listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup-v2
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Campana previa (50 Hz, H=32): https://huggingface.co/happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup
- Campana previa (15 Hz, H=16): https://huggingface.co/happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup-15hz
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
