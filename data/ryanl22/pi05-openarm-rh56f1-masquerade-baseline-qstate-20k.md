# RyanL22/pi05-openarm-rh56f1-masquerade-baseline-qstate-20k

## Resumen

El modelo `RyanL22/pi05-openarm-rh56f1-masquerade-baseline-qstate-20k` es un ajuste fino (fine-tune) de la politica robotica de vision-lenguaje-accion `lerobot/pi05_base` (familia pi0.5 de Physical Intelligence), especializado en el control de un brazo OpenArm equipado con la mano robótica RH56F1. Lo desarrolla el usuario RyanL22 y se publica bajo licencia Apache 2.0 con formato de pesos safetensors y la libreria LeRobot. Resuelve un problema muy concreto dentro del aprendizaje por imitacion: entrenar una politica que combine datos de teleoperacion (teleop v4 a 20 Hz) con datos de video humano retargetados (anyh2r), evitando la confusion de convenciones entre ambos dominios.

La relevancia de esta version radica en una correccion tecnica del `observation.state` en el marco humano. La build original sintetizaba el estado humano a partir de la accion mediante un modelo de retardo y ganancia/offset ajustado sobre teleoperacion, lo que aplicaba la correccion dos veces (el cuello quedaba en 0,8973 en lugar de 0,889 y las articulaciones de la mano se comprimian con ganancias de hasta 0,17). Aqui el estado humano es directamente la pose retargetada `q`, emparejada con cada fichero de etiquetas por su secuencia de acciones exacta (466/466). El resultado es que las tareas que solo existen como datos humanos dejan de fallar en el rollout.

El modelo cuenta con aproximadamente 4.143 millones de parametros y un repositorio de 9,4 GB, con estado y accion de 28 dimensiones, entrada estereo de 288x512 a 20 fps y 20.000 pasos de entrenamiento. No es un modelo de lenguaje generalista, sino una politica de manipulacion robotica: no genera texto ni responde a prompts conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de pi0.5 (`lerobot/pi05_base`); detalles internos de capas no disponibles |
| Parametros totales | 4.143.404.816 (aprox. 4,14 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de politica robotica; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; salida en acciones de 28 dimensiones) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/pi05_base |
| Dimension de estado/accion | 28 |
| Entrada visual | estereo 288x512 |
| Frecuencia de control | 20 fps |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

Se trata de un modelo de vision-lenguaje-accion (VLA) construido sobre la base `lerobot/pi05_base`, es decir, la variante pi0.5 de la familia pi0. La politica consume imagenes estereo a 288x512 y produce un vector de accion de 28 dimensiones que controla el brazo OpenArm y la mano RH56F1. El encoder de vision no se congela durante el ajuste fino (`vision encoder unfrozen`), de modo que la representacion visual se adapta al dominio de la celda de manipulacion. El entrenamiento se realiza en bfloat16 con un batch global de 64 (2 x 32 sobre H200) durante 20.000 pasos, con aumento de datos consistente entre vistas estereo y sin aumento de espejo (`mirror off`). No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre el uso de RLHF o DPO, que no aplican a este tipo de politica.

El aspecto tecnico mas destacado no es la arquitectura, sino la ingenieria del dataset. El modelo combina 16 "celdas" de datos con reparto proporcional a `sqrt(frames)`: teleoperacion v4 a 20 Hz (4 tareas) y video humano anyh2r retargetado (12 tareas). El estilo "masquerade" elimina el brazo humano con ProPainter y compone un render de MuJoCo del OpenArm + RH56F1 en la pose retargetada; los fotogramas de teleoperacion reciben el mismo render superpuesto sobre el robot real en el estado medido. La correccion clave de esta build consiste en usar la pose retargetada `q` como `observation.state` humano en lugar de sintetizarla desde la accion, evitando la doble correccion de retardo y ganancia/offset que degradaba el cuello (0,8973 frente a 0,889) y comprimia las articulaciones de la mano (ganancias de hasta 0,17).

## Capacidades

- Generacion de acciones de manipulacion robotica: produce comandos de 28 dimensiones para el brazo OpenArm y la mano RH56F1 a partir de observaciones visuales estereo.
- Percepcion visual estereo: procesa pares de imagenes estereo de 288x512 con un encoder de vision ajustado al dominio de la tarea.
- Aprendizaje conjunto de teleoperacion y datos humanos: integra 4 tareas de teleoperacion (v4, 20 Hz) y 12 tareas de video humano retargetado (anyh2r) en un unico espacio de estado/accion.
- Diferenciacion de convenciones teleop/humano: el `observation.state` corregido permite que los fotogramas de teleoperacion y humanos compartan la misma convencion (cuello en 0,889/0,001), evitando que el robot seleccione el modo teleop erroneamente al ejecutar tareas solo-humanas.
- Ejecucion de tareas que solo existen como datos humanos, siempre que se parta de la pose inicial retargetada correspondiente (`init_states_by_task_qstate.yaml`).
- No dispone de tool calling, function calling, razonamiento multi-paso textual, capacidades multilingues ni modo "thinking": es una politica motora, no un modelo conversacional.
- No hay capacidades de vision semantica general, audio ni generacion de texto declaradas.

## Casos de uso

- Manipulacion robotica con mano multiarticulada: el modelo traduce observaciones estereo en comandos de 28 dimensiones para coordinar brazo OpenArm y mano RH56F1, adecuado para tareas de agarre y colocacion donde la convencion de la mano (dedo menique curvado) es critica.
- Aprendizaje por imitacion a partir de video humano: permite entrenar tareas para las que no existe teleoperacion usando datos anyh2r retargetados, gracias a la correccion de `observation.state` que alinea el marco humano con el del robot.
- Investigacion en retargeting humano-a-robot: sirve como baseline reproducible para estudiar como afectan las convenciones de estado a la transferencia entre dominios humano y robotico.
- Evaluacion comparativa en celda estandarizada: integrable en una celda OpenArm reproducible (fondo, iluminacion, camaras y posicion del brazo estandarizados) para comparar politicas bajo condiciones identicas.
- Prototipado de politicas VLA en laboratorio: punto de partida para experimentos de ajuste fino adicional sobre `lerobot/pi05_base`, con hiperparametros y composicion de dataset documentados.
- Despliegue en brazos OpenArm con mano RH56F1 en entornos de investigacion, ejecutando tareas de pick-and-place que requieren control fino de la mano, siempre que las cadenas de tarea coincidan exactamente con las de entrenamiento.
- Reproduccion de experimentos de correccion de estado: util para validar la hipotesis de que la sintesis de estado a partir de la accion introduce doble correccion y degrada las tareas solo-humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de exito por tarea, tasas de exito en rollout ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,3 GB solo para pesos (4,143 B x 2 bytes); con activaciones del encoder de vision estereo y buffers de ejecucion, un presupuesto practico de 10-12 GB es razonable (estimacion aritmetica, no dato del autor).
- En float32, los pesos ocuparian aproximadamente 16,6 GB; en int8, unos 4,1 GB; en int4, unos 2,1 GB (estimaciones aritmeticas; no se confirman cuantizaciones soportadas).
- GPU de gama alta para entrenamiento: el autor uso H200 (2 x 32 de batch global, bfloat16, 20.000 pasos).
- Cabe en GPU de consumo: una RTX 4090 (24 GB) deberia alojar los pesos en bfloat16 con holgura para inferencia; GPUs de 12-16 GB podrian ser suficientes con cuantizacion, aunque no hay datos confirmados.
- Despliegue: la libreria declarada es LeRobot. No se confirma soporte en vLLM, llama.cpp, Ollama ni TGI para esta politica.
- Latencia y throughput: no disponibles. Los datos de recogida se registran a 20 fps, pero no se especifica la latencia de inferencia del modelo en rollout.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-openarm-rh56f1-masquerade-baseline-qstate-20k | 4,14 B | no aplica | no disponible | apache-2.0 | Hugging Face (LeRobot) |
| lerobot/pi05_base (modelo base) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| pi05-openarm-rh56f1-masquerade-baseline-20k (build corregida) | no disponible | no aplica | no disponible | no disponible | Hugging Face (referenciada en la model card) |

No se dispone de datos de rendimiento ni de especificaciones de parametros y contexto de las alternativas en la informacion proporcionada. Otras politicas VLA comparables (por ejemplo OpenVLA o GR00T N1) no aparecen en la informacion disponible, por lo que no se incluyen datos de ellas.

## Limitaciones y advertencias

- Es una politica robotica especifica, no un modelo de lenguaje general: no admite prompts conversacionales, tool calling ni generacion de texto.
- Las cadenas de tarea deben coincidir exactamente con las de entrenamiento; variaciones en el texto de la tarea pueden provocar fallos.
- Las tareas que solo existen como datos humanos requieren partir de la pose inicial retargetada (`init_states_by_task_qstate.yaml`).
- La convencion de la mano sigue difiriendo de teleoperacion: el dedo menique permanece curvado en los datos humanos, lo que puede introducir desajustes en tareas solo-humanas.
- El estado del cuello en rollout es 0,889/0,001; el valor medido 0,881 normaliza a -0,08, lo que conviene vigilar segun la tarea.
- Al tratarse de una build corregida de un modelo anterior, los resultados de la version previa no son directamente transferibles.
- Riesgo de sobreajuste a las condiciones de la celda de entrenamiento (fondo, iluminacion, camaras): el rendimiento fuera de esa distribucion no esta documentado.
- No hay datos publicados de tasas de exito, robustez ni fallos, por lo que el riesgo de comportamiento fuera de distribucion no puede cuantificarse.
- Aunque la licencia es Apache 2.0 (uso comercial permitido), no hay informacion sobre sesgos, procedencia de los datos de video humano ni condiciones de uso del dataset subyacente.
- El modelo tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que carece de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RyanL22/pi05-openarm-rh56f1-masquerade-baseline-qstate-20k
- Arbol de ficheros del repositorio: https://huggingface.co/RyanL22/pi05-openarm-rh56f1-masquerade-baseline-qstate-20k/tree/main
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Build anterior corregida (referenciada): https://huggingface.co/RyanL22/pi05-openarm-rh56f1-masquerade-baseline-20k
- OpenArm (proyecto de hardware): https://openarm.dev/
