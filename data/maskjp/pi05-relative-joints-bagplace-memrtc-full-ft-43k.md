# maskjp/pi05-relative-joints-bagplace-memrtc-full-ft-43k

## Resumen

pi05-relative-joints-bagplace-memrtc-full-ft-43k es un ajuste fino completo (full fine-tune) del modelo base `lerobot/pi05_base`, publicado por el usuario maskjp. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, entrenado sobre una única tarea: recoger una bolsa del suelo y colocarla sobre una mesa. El repositorio usa la librería LeRobot y las acciones se expresan en espacio de articulaciones (10 dimensiones: 6 articulaciones del brazo, pinza y base móvil), de forma relativa al estado de observación al inicio de cada fragmento de acción.

El checkpoint corresponde al paso 43K de un entrenamiento planificado de 100K pasos que todavía no había terminado cuando se publicó. El autor advierte explícitamente de que no es el mejor punto de la curva: la pérdida sobre el conjunto reservado alcanza su mínimo en el paso 4K (0,0164) y en el paso 43K es de 0,0356, un 117 % superior al mínimo, por lo que se trata del peor checkpoint de la serie hasta ese momento. El interés del modelo es, por tanto, documental e investigador: incorpora dos técnicas concretas que otras rondas del mismo autor no activan, memoria visual de corto alcance (MEM) y RTC en tiempo de entrenamiento, sobre un total de 4.143.404.816 parámetros.

La relevancia actual del modelo no está en su rendimiento absoluto, sino en que ejemplifica un flujo de trabajo reproducible con LeRobot para ablaciones de memoria visual en políticas VLA, incluyendo aumentos fotométricos, acciones relativas con normalización por cuantiles y decodificación diferida de acciones. La model card es inusualmente honesta sobre las limitaciones metodológicas y los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de pi0.5; codificador visual SigLIP con atencion espacio-temporal compuesta cada 4 capas (MEM, seccion III-C); generacion de acciones mediante flow matching (el resto de la configuracion no se detalla en la model card) |
| Parametros totales | 4.143.404.816 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni cuantizaciones declaradas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | no disponible (modelo de robotica; la instruccion de tarea del ejemplo esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (via libreria LeRobot) |
| Tipo de modelo | Politica robotica (policy), no modelo generativo de texto |
| Espacio de acciones | 10 dimensiones: joint1-joint6, gripper, base_x, base_y, base_yaw; 9 relativas y gripper absoluta |
| Tarea entrenada | "pick up the bag on the ground and place it on the table" (unica tarea) |
| Episodios de entrenamiento | 190 de entrenamiento y 10 reservados (5 % de 200) |
| Frecuencia del dataset | 50 fps (deducida del valor de memory_stride indicado en la model card) |
| Checkpoint | paso 43.000 de 100.000 (ejecucion no finalizada al publicarse) |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y se ajusta completamente sobre una sola tarea. La model card describe dos componentes tecnicos activados en esta ronda. El primero es la memoria visual de corto alcance (MEM, arXiv:2603.03596, seccion III-C): `use_visual_memory=True`, con `memory_frames=6` y `memory_stride=50`, lo que a 50 fps equivale a observaciones separadas un segundo. Cada cuarta capa del codificador SigLIP emplea atencion compuesta de espacio y tiempo. La memoria propioceptiva (seccion III-D) esta desactivada porque es incompatible con las acciones relativas: introduce un eje temporal en `observation.state` que `to_relative_actions` no acepta. La memoria linguistica de largo horizonte (seccion III-B) no esta implementada.

El segundo componente es RTC en tiempo de entrenamiento, con `rtc_training_max_delay=10` pasos de control. En cada ejemplo se proporciona un prefijo limpio de acciones de verdad fundamental de entre 0 y 10 pasos, y la perdida de flow se promedia unicamente sobre el sufijo restante. Esto reduce el numero de posiciones evaluadas y hace que la perdida no sea comparable con las rondas sin RTC, porque mide en parte un cambio en el procedimiento de evaluacion. Ademas, el lote efectivo es de 32 en lugar de 64, ya que MEM hace pasar por SigLIP `memory_frames` multiplicado por el numero de camaras de imagenes por muestra.

Las acciones se representan con `use_relative_actions=true` y `relative_exclude_joints=["gripper"]`. Se trata de una transformacion de procesador, no de una reescritura de datos: `RelativeActionsProcessorStep` resta el estado ancla en tiempo de lote y `AbsoluteActionsProcessorStep` lo devuelve a sumar a la salida, de modo que la politica emite acciones absolutas y la conversion es identica en entrenamiento, evaluacion e inferencia. La normalizacion es `QUANTILES`, calculada sobre los desplazamientos relativos en fragmentos de 50 (registrado en `meta/relative_action_provenance.json`) y no sobre los objetivos absolutos. La rotacion del efector final se almacena en forma continua 6D (las dos primeras columnas de la matriz de rotacion), no en angulo-eje. Tambien se activan aumentos fotometricos con `--dataset.image_transforms.enable=true`, con un maximo de 3 transformaciones muestreadas por ejemplo entre brillo [0,8; 1,2], contraste [0,8; 1,2], saturacion [0,5; 1,5], tono [-0,05; 0,05] y nitidez [0,5; 1,5]; ninguna es geometrica.

## Capacidades

- Generacion de acciones roboticas de manipulacion en espacio de articulaciones para una tarea concreta de recogida y colocacion de una bolsa.
- Control de brazo de 6 grados de libertad mas pinza, con la pinza tratada como comando absoluto y el resto de dimensiones como desplazamientos relativos.
- Control de base movil en tres dimensiones (`base_x`, `base_y`, `base_yaw`), lo que habilita manipulacion movil dentro de la misma politica.
- Memoria visual de corto alcance: integra 6 observaciones separadas un segundo mediante atencion espacio-temporal en capas alternas del codificador SigLIP.
- Tolerancia fotometrica: el entrenamiento con aumentos de brillo, contraste, saturacion, tono y nitidez busca robustez ante cambios de iluminacion y camara.
- Ejecucion con retardos de control: el entrenamiento con RTC prepara el modelo para operar con prefijos de accion ya comprometidos de hasta 10 pasos.
- No dispone de tool calling, function calling, agentes multi-paso, capacidades multilingues ni modo de razonamiento explicito; no es un modelo de proposito general.
- No se documentan capacidades de vision mas alla del codificador visual interno, ni capacidades de audio.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio o almacen: el modelo ejecuta de principio a fin la secuencia de recoger una bolsa del suelo y depositarla sobre una mesa, con 10 dimensiones de accion que cubren brazo, pinza y base movil, por lo que puede emplearse como referencia en celdas de manipulacion movil con la misma geometria de tarea.
- Punto de partida para ajustes finos de tareas similares: al ser un full fine-tune de `lerobot/pi05_base` con pipeline LeRobot reproducible, sirve como inicializacion para tareas de recogida y colocacion de otros objetos, reutilizando la representacion relativa de acciones y los aumentos fotometricos.
- Investigacion en memoria visual para politicas VLA: este checkpoint es la unica ronda del autor que combina MEM con RTC, lo que permite estudiar como la memoria de 6 fotogramas a 1 segundo de separacion afecta al comportamiento en tareas con oclusiones parciales.
- Evaluacion de robustez ante cambios de iluminacion: las transformaciones fotometricas aplicadas en entrenamiento permiten probar la politica bajo variaciones controladas de brillo, contraste, saturacion, tono y nitidez sin alterar la geometria imagen-accion.
- Estudio de latencia y control en tiempo real: con `rtc_training_max_delay=10` y un dataset a 50 fps, el modelo es adecuado para medir como se comporta una politica que debe operar sobre acciones ya iniciadas, un escenario tipico en control a alta frecuencia.
- Reproduccion de ablaciones metodologicas: la model card documenta explicitamente que esta es la ablacion debil `MEM-Posttrain-Only` del articulo de MEM, por lo que el checkpoint permite replicar y comparar ese resultado en lugar del escenario de preentrenamiento completo.
- Comparacion interna de checkpoints de una misma ejecucion: junto con el checkpoint de 4K, permite analizar la degradacion de la perdida reservada a lo largo del entrenamiento y decidir criterios de seleccion de checkpoint.
- Docencia y ejemplos de pipelines de robotica en LeRobot: sirve como caso practico de configuracion de acciones relativas, normalizacion por cuantiles y transformaciones de imagen en un flujo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El unico dato de rendimiento es la perdida de flow sobre el 5 % de episodios reservados (10 de 200), que no es comparable con las rondas sin RTC por el motivo explicado en la model card.

| Paso | eval_loss |
|---|---|
| 1K | 0,0225 |
| 2K | 0,0185 |
| 3K | 0,0176 |
| 4K | 0,0164 (minimo) |
| 5K | 0,0174 |
| 6K | 0,0165 |
| 7K | 0,0175 |
| 8K | 0,0177 |
| 9K | 0,0178 |
| 10K | 0,0181 |
| 11K | 0,0193 |
| 12K | 0,0194 |
| 13K | 0,0204 |
| 14K | 0,0204 |
| 15K | 0,0212 |
| 16K | 0,0215 |
| 17K | 0,0216 |
| 18K | 0,0223 |
| 19K | 0,0233 |
| 20K | 0,0228 |
| 21K | 0,0240 |
| 22K | 0,0242 |
| 23K | 0,0243 |
| 24K | 0,0252 |
| 25K | 0,0248 |
| 26K | 0,0271 |
| 27K | 0,0267 |
| 28K | 0,0286 |
| 29K | 0,0265 |
| 30K | 0,0271 |
| 31K | 0,0289 |
| 32K | 0,0289 |
| 33K | 0,0295 |
| 34K | 0,0286 |
| 35K | 0,0298 |
| 36K | 0,0306 |
| 37K | 0,0323 |
| 38K | 0,0319 |
| 39K | 0,0323 |
| 40K | 0,0328 |
| 41K | 0,0343 |
| 42K | 0,0339 |
| 43K | 0,0356 (este repositorio) |

La curva desciende hasta el paso 4K y asciende de forma sostenida a partir de ahi, lo que indica sobreajuste al conjunto de entrenamiento de 190 episodios. No hay tasas de exito de tarea publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 8,3 GB (4.143.404.816 parametros x 2 bytes); en fp32, unos 16,6 GB. Hay que anadir activaciones, estado de normalizacion y, sobre todo, el coste de MEM, que procesa 6 fotogramas por camara a traves de SigLIP por muestra.
- GPU recomendadas: A100 de 40 o 80 GB y H100 para entrenamiento o evaluacion con lotes grandes; para inferencia con lote pequeno, tarjetas de 24 GB como la RTX 4090 o la RTX 3090 deberian ser suficientes en bf16, y de 16 GB como la RTX 4080 o A4000 quedan al limite.
- Cabe en GPU de consumo: si, previsiblemente en bf16 sobre RTX 4090 o RTX 3090 (24 GB); no cabe en tarjetas de 8 GB sin cuantizacion, y no se publican cuantizaciones oficiales.
- Opciones de despliegue: libreria LeRobot (formato nativo del repositorio, junto con PyTorch). No es un modelo de generacion de texto, por lo que vLLM, llama.cpp, Ollama y TGI no son aplicables tal cual; el despliegue se hace sobre el stack de robotica y el entorno de inferencia de LeRobot.
- Latencia y throughput: no disponibles. El dataset esta grabado a 50 fps y el entrenamiento usa un retardo maximo de 10 pasos de control, pero no se publican mediciones de latencia de inferencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Espacio de acciones | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05-relative-joints-bagplace-memrtc-full-ft-43k | 4.143.404.816 | no disponible | 10 dim (6 articulaciones + pinza + base) relativas | Pick and place de bolsa, unica tarea; MEM + RTC | apache-2.0 | Publico en HuggingFace, 0 descargas |
| Checkpoint de 4K de la misma ejecucion | 4.143.404.816 (mismo modelo base) | no disponible | 10 dim relativas | Misma tarea; mejor eval_loss de la serie (0,0164) | apache-2.0 segun el mismo autor (no confirmado en el repositorio de 43K) | Recomendado por el autor como pesos preferibles |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | Modelo base generico de pi0.5 preentrenado, sin memoria visual | no disponible | Publico en HuggingFace |
| Otras politicas VLA de la misma categoria (pi0, OpenVLA, GR00T N1, etc.) | no disponible | no disponible | no disponible | Manipulacion generalista | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: la model card no publica tasas de exito ni comparaciones con otros sistemas.

## Limitaciones y advertencias

- Checkpoint intermedio y degradado: corresponde al paso 43K de 100K, con una perdida reservada un 117 % por encima del minimo de la ejecucion. El autor recomienda usar el checkpoint de 4K en su lugar.
- Sobreajuste evidente: con solo 190 episodios de entrenamiento, la curva de perdida reservada asciende de forma monotona desde el paso 4K, lo que sugiere escasa generalizacion.
- Modelo de una unica tarea: solo se ha entrenado para recoger una bolsa del suelo y colocarla en una mesa. No es reutilizable directamente para otras tareas sin un nuevo ajuste fino.
- Perdida no comparable: la presencia de RTC en tiempo de entrenamiento hace que la evaluacion se realice condicionada sobre parte de la respuesta y sobre menos posiciones, de modo que el valor de eval_loss no es equiparable al de las rondas sin RTC.
- Memoria parcial: la memoria linguistica de largo horizonte (MEM, seccion III-B) no esta implementada y la memoria propioceptiva (III-D) esta desactivada por incompatibilidad con las acciones relativas.
- Ablacion debil: activar MEM sobre `lerobot/pi05_base`, preentrenado sin ella, corresponde al escenario `MEM-Posttrain-Only` del articulo, no a los resultados principales de MEM, que requieren preentrenar el codificador de video con una mezcla amplia de video robotico y no robotico no disponible en ningun checkpoint publico de pi05.
- Acciones relativas con exclusion de la pinza: la pinza se emite en valor absoluto porque es un comando y no una pose. Cualquier integracion debe respetar esta asimetria y la normalizacion por cuantiles calculada sobre los desplazamientos relativos.
- Rotacion del efector final en forma 6D continua, no en angulo-eje; conviene verificar las convenciones al conectar con otros entornos.
- Riesgo de alucinacion: se desconoce su comportamiento fuera de distribucion; no se publican metricas de fallo ni de seguridad en entornos no estructurados.
- Sesgos conocidos: no disponibles. No se documenta composicion del dataset, diversidad de objetos, iluminacion o configuraciones de camara.
- Licencia: apache-2.0 para este repositorio, lo que en principio permite uso comercial. Debe verificarse por separado la licencia de `lerobot/pi05_base` y de cualquier dependencia, dato no incluido en la informacion disponible.
- Madurez y adopcion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha validado de forma independiente.
- Documentacion truncada: la model card proporcionada finaliza de forma abrupta en la seccion de representacion de acciones, por lo que podrian existir detalles adicionales no incluidos aqui.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/maskjp/pi05-relative-joints-bagplace-memrtc-full-ft-43k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Articulo de MEM citado en la model card: arXiv:2603.03596
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante. Las busquedas devuelven unicamente paginas sobre la convencion colectiva de trabajo del sector sanitario del canton de Neuchatel (CCT Sante 21), sin relacion con el modelo.
