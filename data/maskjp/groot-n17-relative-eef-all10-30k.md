# maskjp/groot-n17-relative-eef-all10-30k

## Resumen

groot-n17-relative-eef-all10-30k es un ajuste fino del modelo de visión-lenguaje-acción (VLA) nvidia/GR00T-N1.7-3B, publicado por el usuario maskjp. El checkpoint tiene 3.144.016.000 parámetros (3,14B) y se distribuye en formato safetensors dentro del ecosistema LeRobot (library_name: lerobot, pipeline_tag: robotics), bajo licencia nvidia-license. Está entrenado sobre los diez conjuntos de datos L5vel/*, con las acciones expresadas en el espacio del efector final (end-effector, EEF) y de forma relativa al estado de observación del inicio de cada chunk.

El modelo resuelve un problema muy concreto: generar comandos motores para un brazo u850 montado sobre una base móvil, condicionados por instrucciones de lenguaje y por la observación de tres cámaras (izquierda, derecha y muñeca). Respecto al modelo base, la innovación está en la representación de acciones: 12 de las 13 dimensiones se expresan relativas al ancla del chunk (el gripper queda excluido y es absoluto) y la normalización emplea estadísticas relativas nativas por horizonte, horneadas en policy_preprocessor.json, lo que hace que el checkpoint sea autocontenido para normalizar.

Es relevante por dos motivos. Primero, documenta un flujo de ajuste fino de un VLA de 3B con metadatos de entrenamiento verificables por sha256. Segundo, publica de forma explícita un checkpoint no convergido: la pérdida de validación sigue descendiendo en el paso 30K y la ejecución cubre solo 0,66 épocas de la mezcla, por lo que debe tratarse como un punto de partida documentado y no como un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) derivada de nvidia/GR00T-N1.7-3B, con cabeza de acción de flow matching; el detalle de la columna vertebral no se especifica en la información disponible |
| Parámetros totales | 3.144.016.000 (3,14B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica una ventana de contexto de texto convencional |
| Tipos de cuantización | No disponible; el repositorio no publica variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles; las 11 tareas están condicionadas por instrucciones de lenguaje, pero no se especifica el idioma |
| Licencia | nvidia-license (license: other) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 12,6 GB |
| Dimensiones de acción | 13 (eef_x, eef_y, eef_z, eef_xx, eef_xy, eef_xz, eef_yx, eef_yy, eef_yz, gripper, base_x, base_y, base_yaw) |
| Acciones relativas | 12 de 13; gripper absoluto |
| Chunk size | 40 pasos (se solicitó 50; GrootConfig lo remapea al horizonte de N1.7) |
| n_action_steps | 10 (0,2 s ejecutados por replanificación) |
| Frecuencia de datos | 50 fps |
| Robot objetivo | Un brazo u850 sobre base móvil, con tres cámaras (izquierda, derecha, muñeca) |
| Pasos de entrenamiento | 30.000 de 30.000 |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino del VLA nvidia/GR00T-N1.7-3B. La model card no detalla la columna vertebral del modelo base, pero sí documenta la cabeza de acción: la pérdida es un error cuadrático medio (MSE) sobre la velocidad de flow matching, y sus delta_indices quedan recortados al horizonte de 40 pasos propio de N1.7, incluso cuando la ejecución solicita chunk_size=50. Esto implica un lookahead de 0,8 s a 50 fps, frente a los 1,0 s de las políticas pi05 con las que se compara en la documentación.

La representación de acciones usa use_relative_actions=true con relative_exclude_joints=["gripper"]: todas las dimensiones salvo el gripper se desplazan respecto al observation.state del ancla del chunk, y el gripper se mantiene absoluto porque es un comando y no una pose. La rotación del efector final se almacena en forma 6D continua (las dos primeras columnas de la matriz de rotación), no en eje-ángulo, para evitar los saltos de 2*pi que aparecen cuando el gripper apunta hacia abajo. La normalización utiliza estadísticas relativas nativas por horizonte, con un mínimo y un máximo independientes por posición del chunk (forma [40, d]), calculadas a partir de los propios desplazamientos relativos de esta mezcla y guardadas en policy_preprocessor.json.

Los datos de entrenamiento son 11 tareas condicionadas por lenguaje, 1.499 episodios y 3.089.476 fotogramas (17,2 h a 50 fps). La mezcla está desequilibrada: las cuatro tareas más grandes concentran aproximadamente el 82% de los fotogramas y el muestreo es uniforme sobre fotogramas, sin rebalanceo. El conjunto se fusionó localmente a partir de las diez fuentes L5vel/* bajo el nombre all10-eefabs6d-v30 y nunca se subió al Hub; por eso el repo_id de train_config.json devuelve 404.

## Capacidades

- Generación de secuencias de acciones motoras de 13 dimensiones para un brazo u850 sobre base móvil, a partir de observación visual y propioceptiva.
- Condicionamiento por lenguaje: el modelo está entrenado en 11 tareas descritas por instrucciones (por ejemplo, "grab a drink from the fridge" o "clean the table with the green towel").
- Percepción multimodal con tres cámaras (izquierda, derecha y muñeca), más el estado de observación del robot.
- Predicción de chunks de 40 pasos con ejecución de 10 acciones por replanificación, lo que fija una cadencia de control de 0,2 s por ciclo.
- Representación de acciones relativas al ancla del chunk en 12 dimensiones, con gripper absoluto, lo que facilita la reutilización de la política ante desplazamientos del estado inicial.
- Normalización autocontenida: el checkpoint incluye las estadísticas relativas por horizonte dentro de policy_preprocessor.json, sin necesitar los datos de entrenamiento ni el statistics.json del modelo base.
- Soporte de tool calling o function calling: no aplica; es un modelo de política robótica, no un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes de texto; la "planificación" se limita al chunking de acciones.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: rotación del efector final en forma 6D continua (evita discontinuidades de eje-ángulo) y exclución explícita del gripper del tratamiento relativo.

## Casos de uso

- Manipulación móvil doméstica en interiores: el modelo puede ejecutar la secuencia de abrir la nevera y coger una bebida, la tarea con más datos de la mezcla (250 episodios, 968.523 fotogramas), usando las tres cámaras y la base móvil.
- Recogida de objetos del suelo: las tareas "pick up the bag on the ground and place it on the table" (200 episodios) y "pick up the grocery bag from the ground" (100 episodios) cubren la aproximación, el agarre y la elevación de objetos desde el suelo con desplazamiento de la base.
- Apertura de puertas y navegación interior: "open the door and move inside" (200 episodios, 506.473 fotogramas) permite entrenar y evaluar políticas que combinan manipulación de la manilla con movimiento de la base, un escenario típico de robótica de servicio.
- Limpieza de superficies: la tarea "clean the table with the green towel" (199 episodios) es un caso directo de manipulación de un objeto deformable con instrucción de color, útil para validar el condicionamiento por lenguaje sobre atributos visuales.
- Ordenación y colocación de objetos: las tareas de colocar el vaso azul, la taza verde o el croissant en un plato (100, 50 y 98 episodios respectivamente) sirven para evaluar precisión de colocación en el espacio del efector final.
- Investigación en aprendizaje por imitación: el checkpoint permite comparar de forma controlada representaciones de acción relativa frente a absoluta, y el formato 6D frente a eje-ángulo, reutilizando el mismo robot y las mismas 11 tareas.
- Despliegue en bucle cerrado a 5 Hz: dado que n_action_steps=10 y los datos están a 50 fps, la política está pensada para replanificar cada 0,2 s, lo que encaja en bucles de control de tiempo real blando sobre el robot real.
- Punto de partida para ajuste fino adicional: al tratarse de un run incompleto (0,66 épocas), es un candidato razonable para continuar el entrenamiento con más datos o con una mezcla rebalanceada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no son aplicables a un modelo de política robótica. Lo que sí se publica es la pérdida de validación sobre el 5% de episodios retenidos (75 de 1.499 episodios, las 11 tareas):

| Paso | eval_loss |
|---|---|
| 5K | 0,0182 |
| 10K | 0,0139 |
| 15K | 0,0109 |
| 20K | 0,0094 |
| 25K | 0,0090 |
| 30K | 0,0086 |

La propia model card advierte de que esta cifra no es comparable con la de los repositorios pi05-relative-*: ambas son MSE sobre la velocidad de flow matching, pero la normalización difiere (pi05 usa cuantiles q01/q99 y GR00T N1.7 usa mínimo/máximo por horizonte de los desplazamientos relativos). En esta mezcla, el recorrido mínimo-máximo es 3,0 veces el recorrido q01-q99 (mediana) en las dimensiones del brazo y 5,0 veces (hasta 49,7 veces) en las dimensiones de la base, de modo que los objetivos de GR00T viven en un espacio comprimido y su pérdida resulta menor por motivos ajenos a la calidad del ajuste. La pérdida seguía descendiendo en el paso 30K.

## Requisitos de hardware

- Estimación de VRAM para pesos: unos 6,3 GB en bf16/fp16 y unos 12,6 GB en fp32 (el tamaño del repositorio, 12,6 GB, es coherente con almacenamiento en fp32 para 3,14B de parámetros).
- VRAM total estimada para inferencia: en torno a 8-12 GB en bf16 sumando pesos, activaciones de los codificadores de visión de tres cámaras y caché de la cabeza de acción; la cifra exacta no está publicada.
- GPU de consumo: cabe con holgura en una RTX 4090, RTX 3090 o RTX 4080 (16 GB o más) en bf16. En GPUs de 12 GB o menos sería necesario cuantizar, algo que el repositorio no ofrece de fábrica.
- GPU de centro de datos: A100, H100 o L40S para despliegue con margen y para experimentos de varios entornos en paralelo.
- Opciones de despliegue: el repositorio declara library_name: lerobot, por lo que el camino natural es LeRobot; también es plausible el ecosistema Isaac-GR00T de NVIDIA, si bien la información disponible no confirma una receta de despliegue concreta. No se documentan soportes de vLLM, TGI, llama.cpp ni Ollama, y no existen pesos GGUF.
- Latencia y throughput: no publicados. Como requisito derivado, ejecutar 10 acciones a 50 fps implica completar cada replanificación en menos de 0,2 s en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Acciones y horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este ajuste (groot-n17-relative-eef-all10-30k) | 3.144.016.000 | 13 dims, 12 relativas; chunk 40; 10 pasos ejecutados | nvidia-license | Hugging Face, 0 descargas y 0 likes |
| nvidia/GR00T-N1.7-3B (modelo base) | No disponible con precisión; la familia es de 3B | No disponible | nvidia-license | Hugging Face (modelo base) |
| pi05-relative-* | No disponible | Acciones relativas; lookahead de 1,0 s (chunk 50 a 50 fps, según la model card) | No disponible | No disponible |

La comparación con la familia pi05 solo es válida a nivel de formato de normalización y horizonte, no de pérdida: la model card insiste en que las cifras de eval_loss no son equiparables. No se dispone de datos de benchmarks comunes que permitan una comparación de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Checkpoint no convergido: la pérdida de validación seguía bajando en el paso 30K y la ejecución cubre únicamente 0,66 épocas de la mezcla, por lo que el autor lo describe explícitamente como infraentrenado.
- Mezcla de datos desequilibrada: las cuatro tareas mayores concentran cerca del 82% de los fotogramas, con muestreo uniforme sobre fotogramas y sin rebalanceo, lo que puede degradar el rendimiento en las tareas con menos datos (por ejemplo, "place the green cup on the table", con 50 episodios).
- Pérdida no comparable: el uso de mínimo/máximo por horizonte frente a cuantiles en pi05 hace que el eval_loss no sea una medida comparable entre familias; cualquier comparación de cifras gruesas induce a error.
- Horizonte recortado: el chunk_size solicitado de 50 se remapea a 40, así que el lookahead real es de 0,8 s, no de 1,0 s.
- Reproducibilidad incompleta: el dataset all10-eefabs6d-v30 se fusionó en local y nunca se subió al Hub, de modo que el repo_id de train_config.json devuelve 404.
- Trampas en los metadatos: meta/info.json y meta/stats.json se envían byte a byte sin modificar. El campo names está en la forma agrupada v3 ({"motors": [...]}), por lo que list(names) devuelve un único nombre para 13 columnas y hay que aplanarlo; además, las columnas de rotación 6D aparecen nombradas de dos maneras distintas en action/observation.state y en action.eef/observation.eef.
- Precisión de comparación: las estadísticas solo cuadran exactamente si ambos lados se convierten a float32; una comparación en float64 deja residuos de hasta 5,8e-08 en algunas columnas.
- Un solo robot y una sola morfología: 13 dimensiones de acción para un u850 con base móvil; no hay evidencia de generalización a otras morfologías, cámaras o espacios de acción.
- Cobertura de lenguaje limitada: 11 tareas concretas, sin información sobre el idioma de las instrucciones ni sobre su robustez ante paráfrasis.
- Licencia restrictiva: nvidia-license es una licencia no estándar; hay que revisar sus términos antes de cualquier uso comercial o redistribución.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, por lo que no existen informes externos de reproducción.
- Riesgo de sobreajuste a las condiciones de captura (iluminación, disposición de las cámaras, estilo de las instrucciones) propio de un conjunto de 17,2 h.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maskjp/groot-n17-relative-eef-all10-30k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Licencia del modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B/blob/main/LICENSE
- Resultados de búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; las páginas devueltas por la búsqueda no guardan relación con el contenido de la ficha.
