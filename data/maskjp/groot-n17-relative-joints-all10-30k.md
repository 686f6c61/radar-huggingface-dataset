# maskjp/groot-n17-relative-joints-all10-30k

## Resumen

`maskjp/groot-n17-relative-joints-all10-30k` es un fine-tune del modelo de visión-lenguaje-acción (VLA) `nvidia/GR00T-N1.7-3B`, publicado por el usuario maskjp y orientado a control robótico por imitación. El checkpoint se ha entrenado sobre las diez fuentes de datos `L5vel/*` (mezcladas en un único dataset multitarea de 11 tareas) con las acciones expresadas en espacio de articulaciones y de forma relativa al estado de observación del inicio de cada chunk, salvo el gripper, que se mantiene absoluto. El entrenamiento se detuvo en el paso 30.000 de 30.000.

El modelo resuelve el problema clásico de la manipulación móvil multitarea: dada una instrucción en lenguaje natural, tres cámaras (izquierda, derecha y muñeca) y el estado de las articulaciones, predice una secuencia de acciones para un brazo u850 montado sobre una base móvil. Su relevancia actual es doble: por un lado, es un ejemplo reproducible de cómo adaptar la familia GR00T N1.7 a un conjunto propio de episodios; por otro, documenta explícitamente el efecto de la normalización min/max por horizonte frente a la normalización por cuantiles de la familia pi05, un detalle que invalida las comparaciones directas de pérdida.

Con 3.144.016.000 parámetros (3,14 B) y un repositorio de 12,6 GB, el modelo se distribuye en formato safetensors sobre la librería LeRobot y se publica bajo licencia de NVIDIA. El propio autor advierte que el checkpoint está infraintrenado (0,66 épocas sobre la mezcla) y que la pérdida seguía descendiendo en el paso final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en `nvidia/GR00T-N1.7-3B`, con cabeza de acciones entrenada mediante flow matching (pérdida MSE sobre la velocidad) |
| Parámetros totales | 3.144.016.000 (3,14 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en el sentido de contexto de lenguaje; horizonte de acción (`chunk_size`) de 40 pasos, con `n_action_steps=10` |
| Tipos de cuantización | no disponible; el tamaño del repositorio (12,6 GB) es coherente con pesos en fp32 |
| Idiomas soportados | no disponible (modelo condicionado por instrucciones de lenguaje natural; la model card no especifica idiomas) |
| Licencia | `nvidia-license` (etiquetada como `other` en el Hub) |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El checkpoint es un fine-tune completo del modelo base `nvidia/GR00T-N1.7-3B`, un VLA de 3,14 B de parámetros. La cabeza de acciones se entrena con flow matching: la pérdida es un error cuadrático medio sobre la velocidad objetivo, normalizada con las estadísticas nativas de GR00T N1.7, que son un mínimo/máximo por horizonte y por dimensión (forma `[40, d]`), calculadas a partir de los desplazamientos relativos de esta mezcla concreta. Estas estadísticas están incrustadas en `policy_preprocessor.json`, de modo que el checkpoint es autocontenido y no requiere los datos de entrenamiento ni el `statistics.json` del modelo base para normalizar.

El modelo consume instrucciones de lenguaje, tres cámaras (izquierda, derecha y muñeca) y el estado de las articulaciones, y produce 10 dimensiones de acción: `joint1..joint6, gripper, base_x, base_y, base_yaw`. Con `use_relative_actions=true` y `relative_exclude_joints=["gripper"]`, 9 de las 10 dimensiones se expresan como `action[t+k] -= observation.state[anchor]`, mientras que el gripper se mantiene absoluto por tratarse de un comando y no de una pose. Los datos de entrenamiento son 11 tareas condicionadas por lenguaje, 1.499 episodios y 3.089.476 fotogramas (17,2 h a 50 fps) sobre un único brazo u850 con base móvil. La mezcla está desequilibrada: las cuatro tareas mayores concentran aproximadamente el 82 % de los fotogramas y el muestreo es uniforme por fotograma, sin rebalanceo. El autor indica además que la ejecución solicitó `chunk_size=50` y que `GrootConfig.__post_init__` lo remapeó a 40, valor al que se recortan los `delta_indices` de la cabeza de acciones, de modo que el horizonte real de predicción es de 0,8 s a 50 fps.

## Capacidades

- Control robótico por imitación multitarea, condicionado por instrucciones en lenguaje natural, sobre 11 tareas registradas.
- Entrada multimodal: tres cámaras (izquierda, derecha y muñeca) más el estado de las articulaciones.
- Salida de acciones en espacio de articulaciones: 6 articulaciones del brazo, gripper y 3 dimensiones de base móvil (`base_x`, `base_y`, `base_yaw`).
- Acciones relativas al estado de observación del inicio del chunk en 9 de las 10 dimensiones; gripper en valor absoluto.
- Predicción de un horizonte de 40 pasos (0,8 s a 50 fps) y ejecución de 10 pasos por replanificación (0,2 s), lo que mantiene la cadencia de control.
- Inferencia autocontenida: la normalización relativa está incrustada en el checkpoint.
- Soporte de tool calling / function calling: no, es un modelo de acción robótica, no un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingües: no disponibles ni especificadas.
- Capacidades especiales documentadas: modo relativo de acciones (`use_relative_actions`), exclusión de dimensiones concretas de la relativización (`relative_exclude_joints`) y horizonte de chunk configurable con remapeo heredado de N1.5.

## Casos de uso

- Manipulación móvil de servicio doméstico: el modelo se ha entrenado específicamente en "coger una bebida de la nevera" (250 episodios, 968.523 fotogramas), por lo que puede controlar un brazo u850 sobre base móvil para aproximarse, abrir y extraer objetos.
- Navegación y entrada por puertas: la tarea "abrir la puerta y entrar" (200 episodios, 506.473 fotogramas) encaja con la salida de 3 dimensiones de base, permitiendo políticas que combinan movimiento de base y manipulación.
- Recogida de objetos del suelo: las tareas de bolsa en el suelo (200 + 100 episodios) y el control de base hacen que el modelo sea adecuado para robots de recogida en almacén o logística ligera.
- Limpieza de superficies: "limpiar la mesa con la toalla verde" (199 episodios) demuestra aprendizaje de trayectorias de barrido, útil en robótica de mantenimiento.
- Manipulación de alimentos y menaje: colocar el cruasán en el plato vacío, recoger o colocar tazas azules y verdes y coger botellas verdes cubren escenarios de servicio de mesa y cocina.
- Investigación en representaciones de acción: el checkpoint está pensado para estudiar el efecto de las acciones relativas en espacio de articulaciones frente a representaciones en espacio efector final, dado que el mismo dataset incluye una característica paralela `action.eef` de 13 dimensiones.
- Estudio de normalización en cabezas de flow matching: la model card documenta que el span min/max es 3,0 veces (mediana) el span q01/q99 en las dimensiones del brazo y 5,0 veces (hasta 49,7 veces) en las de la base, lo que convierte este checkpoint en un caso de estudio para comparar estrategias de normalización frente a la familia pi05.
- Punto de partida para fine-tuning propio: al ser un fine-tune completo del modelo base con metadatos de entrenamiento incluidos, sirve como inicialización para nuevos conjuntos de episodios con el mismo esquema de 10 dimensiones.
- Validación de guardas de despliegue: los ficheros `meta/info.json` y `meta/stats.json` se distribuyen con sus hashes SHA-256 para que un sistema de despliegue pueda verificar nombres de columna y estadísticas reales antes de aceptar el checkpoint.
- Prototipado en robótica de laboratorio: su tamaño de 3,14 B permite iterar en una única GPU de 24 GB (en bf16), algo impracticable con VLA de mayor tamaño.

## Benchmarks y rendimiento

El autor solo publica la pérdida de validación sobre el 5 % de episodios retenidos por tarea (75 de 1.499 episodios, las 11 tareas):

| Paso | eval_loss |
|---|---|
| 5K | 0,0211 |
| 10K | 0,0149 |
| 15K | 0,0130 |
| 20K | 0,0104 |
| 25K | 0,0099 |
| 30K | 0,0097 |

Advertencia del propio autor: la pérdida seguía descendiendo en el paso 30K y la ejecución solo cubre 0,66 épocas de la mezcla, por lo que el checkpoint está infraintrenado, no convergido. Además, estas cifras no son comparables con las de los repositorios `pi05-relative-*`: ambas son MSE sobre la velocidad del flow matching, pero la normalización difiere (GR00T N1.7 usa mínimo/máximo por horizonte; pi05 usa cuantiles q01/q99), de modo que los objetivos de GR00T viven en un espacio comprimido y su pérdida resulta menor por razones ajenas a la calidad del ajuste. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas de éxito en robot real) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del recuento de parámetros, no publicada por el autor): en fp32, unos 12,6 GB solo de pesos más activaciones, buffers de imagen y memoria del planificador; en bf16, unos 6,3 GB de pesos; en int8, unos 3,1 GB. La memoria de las tres cámaras y del estado del robot se suma aparte.
- Cabe en GPU de consumo: sí. Una RTX 4090 o RTX 3090 (24 GB) permite fp32 y bf16 con holgura; una RTX 4080 (16 GB) permite bf16 con margen ajustado. Una GPU de 8 GB probablemente requiera cuantización a int8, no documentada.
- GPU recomendadas para producción: NVIDIA A100 (40/80 GB), H100 y L40S para despliegues con varias políticas o lotes de episodios; A100 40 GB y L40S 48 GB son suficientes en bf16.
- Opciones de despliegue: la librería declarada es LeRobot (`library_name: lerobot`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un VLA con cabeza de flow matching.
- Latencia y throughput: no disponibles como cifras medidas. El requisito operativo sí está documentado: se ejecutan 10 pasos de acción (0,2 s a 50 fps) por cada replanificación, por lo que la inferencia debe completarse dentro de esa ventana de 0,2 s para mantener la cadencia de control.
- Almacenamiento: 12,6 GB de repositorio, más el espacio de los checkpoints derivados si se reentrena.

## Comparativa con modelos similares

| Modelo | Parámetros | Representación de acción | Horizonte de chunk | Normalización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| maskjp/groot-n17-relative-joints-all10-30k | 3,14 B | 10 dims en articulaciones, 9 relativas + gripper absoluto | 40 (0,8 s a 50 fps) | min/max por horizonte | nvidia-license | pública en el Hub |
| nvidia/GR00T-N1.7-3B (modelo base) | 3,14 B | definida por el modelo base | 40 (el fine-tune remapea 50 a 40) | min/max por horizonte nativas | nvidia-license | pública en el Hub |
| Repositorios pi05-relative-* (mencionados en la model card) | no disponible | relativas, con chunks de 50 pasos | 50 (1,0 s a 50 fps) | cuantiles q01/q99 | no disponible | no disponible en la información proporcionada |
| Variante de espacio efector final del mismo dataset (`action.eef`, 13 dims) | no disponible | 13 dims (`eef_x ... eef_yaxis_z, gripper, base_*`) | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones de rendimiento (tasas de éxito en robot, benchmarks de manipulación) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint infraintrenado: el entrenamiento se detuvo en 30K con la pérdida de validación aún en descenso y solo 0,66 épocas sobre la mezcla. El autor lo califica explícitamente de no convergido.
- Mezcla de datos desequilibrada: las cuatro tareas mayores representan aproximadamente el 82 % de los fotogramas y el muestreo es uniforme por fotograma, sin rebalanceo, por lo que las tareas minoritarias (por ejemplo, "colocar la taza verde en la mesa", con 50 episodios) están infrarrepresentadas.
- Evaluación limitada: la validación usa solo el 5 % de los episodios (75 de 1.499) y no se reportan tasas de éxito en robot real ni evaluación fuera de distribución.
- Pérdida no comparable con otros repositorios: la normalización min/max por horizonte frente a los cuantiles q01/q99 de pi05 hace que las cifras de `eval_loss` no sean intercambiables entre familias.
- Un único embodiment: todos los datos provienen de un brazo u850 sobre base móvil con tres cámaras; no hay evidencia de generalización a otras morfologías, números de cámaras o espacios de acción.
- Especialización estrecha: cubre 11 tareas de lenguaje concretas de un entorno doméstico; no es un modelo generalista de razonamiento ni de conversación, y no soporta tool calling ni agentes.
- Idiomas no especificados: la model card no indica en qué idioma están las instrucciones de lenguaje de los datos de entrenamiento.
- Reproducibilidad del entrenamiento limitada: el dataset mezclado (`all10-multitask-eef-merged-v30`) se generó en local y nunca se subió al Hub, por lo que el `repo_id` de `train_config.json` devuelve un 404.
- Trampas en los metadatos distribuidos: `names` está en la forma agrupada v3 (`{"motors": [...]}`), por lo que es necesario aplanarlo, y el dataset describe una segunda característica `action.eef` de 13 dimensiones junto a la `action` de 10 dimensiones usada por el checkpoint, lo que obliga a un enlace explícito de nombres en despliegue.
- Precisiones de comparación estadística: la fidelidad exacta de las estadísticas solo se verifica comparando en float32; una comparación en float64 deja residuos de hasta 5,8e-08 relativos en algunas columnas.
- Licencia: se trata de `nvidia-license`, no de una licencia permisiva estándar. Es imprescindible revisar los términos del enlace de licencia del modelo base antes de cualquier uso comercial.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de generalización incorrecta fuera de las tareas y el entorno vistos en entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/groot-n17-relative-joints-all10-30k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Licencia: https://huggingface.co/nvidia/GR00T-N1.7-3B/blob/main/LICENSE
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo (papers, blogs, repositorios o demos) en los resultados de búsqueda disponibles.
