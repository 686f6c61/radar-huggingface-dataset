# maskjp/pi05-relative-eef-bagplace-memrtc-full-ft-43k

## Resumen

`maskjp/pi05-relative-eef-bagplace-memrtc-full-ft-43k` es un ajuste fino completo (full fine-tune) del modelo base `lerobot/pi05_base`, un modelo de vision-lenguaje-accion (VLA) de la familia pi0.5, publicado por el usuario `maskjp` bajo licencia Apache 2.0 y empaquetado para la libreria LeRobot. El modelo esta especializado en una unica tarea de manipulacion robotica: recoger una bolsa del suelo y colocarla sobre una mesa. Sus pesos ocupan 9,4 GB en el repositorio y suman 4.143.404.816 parametros (aproximadamente 4,14 mil millones), distribuidos en un unico fichero de pesos en formato safetensors.

Tecnicamente, la ficha se centra en tres modificaciones sobre el pipeline estandar: acciones expresadas en espacio relativo al estado de observacion al inicio de cada chunk (13 dimensiones, con el gripper en absoluto), aumento de datos puramente fotometrico y una capa de memoria visual a corto plazo (MEM) combinada con entrenamiento con RTC (real-time chunking) a un retardo maximo de 10 pasos de control. El modelo genera acciones de efector final (xyz, rotacion 6D, gripper) mas tres dimensiones de base (base_x, base_y, base_yaw).

Es relevante principalmente como snapshot de investigacion, no como modelo listo para produccion: se publico en el paso 43K de una ejecucion de 100K pasos que seguia entrenando, y su perdida en datos retenidos (0,0361) esta un 101% por encima del minimo de la curva (0,0180, alcanzado en el paso 4K). El propio autor recomienda el checkpoint de 4K por delante de este. Ademas, la perdida reportada no es comparable con la de otras rondas de entrenamiento por el uso de RTC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA de la familia pi0.5 (encoder visual SigLIP con atencion espacio-temporal compuesta cada 4 capas + modulos de accion); no disponible el detalle completo de capas |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se declaran variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el prompt de tarea del dataset esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; repositorio de 9,4 GB) |
| Dimension de acciones | 13: eef_x, eef_y, eef_z, eef_xx, eef_xy, eef_xz, eef_yx, eef_yy, eef_yz, gripper, base_x, base_y, base_yaw |
| Acciones relativas | Si, 12 de 13 dimensiones; `gripper` queda absoluto (`relative_exclude_joints=["gripper"]`) |
| Normalizacion | QUANTILES, calculada sobre los offsets relativos en chunks de 50 |
| Paso de entrenamiento publicado | 43K de 100K (ejecucion sin finalizar) |
| Frecuencia del dataset | 50 fps |
| Memoria visual (MEM) | Activada: 6 fotogramas, `memory_stride=50`, atencion temporal cada 4 capas |
| RTC en entrenamiento | `rtc_training_max_delay=10` pasos de control |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, un VLA de la familia pi0.5 que combina un encoder visual basado en SigLIP con un modulo generativo de acciones entrenado con perdida de flow matching. Sobre esa base, este checkpoint introduce memoria visual a corto plazo (MEM, seccion III-C de arXiv:2603.03596): se procesan 6 observaciones separadas 1 segundo entre si, utilizando `memory_stride=50` fotogramas del dataset (que corre a 50 fps), y cada cuarta capa SigLIP emplea atencion compuesta espacio-temporal en lugar de atencion puramente espacial. La memoria propioceptiva (seccion III-D del mismo trabajo) queda desactivada porque es incompatible con las acciones relativas: daria a `observation.state` un eje temporal que `to_relative_actions` no admite. Tampoco se implementa la memoria de lenguaje de largo horizonte (seccion III-B).

El ajuste fino se realizo sobre un unico conjunto de 200 episodios (190 de entrenamiento y 10 retenidos, un 5%). Las acciones se expresan de forma relativa al estado de observacion del inicio de cada chunk mediante `RelativeActionsProcessorStep`, un transformador de procesador que resta el estado ancla en tiempo de batch y lo vuelve a sumar en la salida con `AbsoluteActionsProcessorStep`; el modelo emite por tanto acciones absolutas y la conversion es identica en entrenamiento, evaluacion e inferencia. El `gripper` se excluye del calculo relativo por ser un comando y no una pose. La rotacion del efector final se almacena en su forma continua 6D. Ademas, se activa aumento fotometrico (`--dataset.image_transforms.enable=true`) con hasta 3 transformaciones muestreadas por ejemplo entre brillo [0,8; 1,2], contraste [0,8; 1,2], saturacion [0,5; 1,5], tono [-0,05; 0,05] y nitidez [0,5; 1,5]; no hay transformaciones geometricas, de modo que la geometria imagen-accion no se altera. El batch efectivo es de 32, frente a 64 en otras rondas, porque MEM multiplica las imagenes que pasan por SigLIP por muestra.

## Capacidades

- Generacion de acciones de manipulacion robotica en espacio de efector final: posicion xyz, rotacion 6D, apertura de gripper y desplazamiento de base (base_x, base_y, base_yaw).
- Ejecucion de una tarea especifica de pick-and-place: recoger una bolsa del suelo y colocarla sobre una mesa.
- Control condicionado por instruccion de tarea en lenguaje natural (prompt de tarea del dataset), aunque la model card no detalla el soporte multilingue.
- Memoria visual a corto plazo: integra 6 observaciones separadas 1 segundo para desambiguar el estado de la escena.
- Compatibilidad con RTC: el modelo se ha entrenado con un prefijo de acciones objetivo limpio de 0 a 10 pasos, lo que habilita su uso en esquemas de chunking en tiempo real con retardo del controlador.
- Robustez a variaciones fotometricas de iluminacion, contraste, saturacion, tono y nitidez gracias al aumento de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de lenguaje; la unica planificacion es la generacion de chunks de accion.
- Capacidades de vision adicionales (deteccion, segmentacion, VQA, audio): no disponibles.

## Casos de uso

- Automatizacion de pick-and-place en linea de recogida: el modelo esta ajustado exactamente para recoger una bolsa del suelo y depositarla en una mesa, por lo que puede integrarse como politica de control en una celda robotica con camaras a 50 fps.
- Investigacion en memoria visual para politicas VLA: permite reproducir y analizar el efecto de MEM a corto plazo (6 fotogramas a 1 segundo) sobre una tarea de contacto con el suelo, donde la oclusion parcial es frecuente.
- Estudio comparativo de acciones relativas frente a absolutas: al exponer acciones relativas al estado ancla con `gripper` absoluto, sirve para medir el efecto de la representacion de acciones en la estabilidad del control.
- Punto de partida para fine-tuning en tareas de manipulacion similares: al ser un full fine-tune de `lerobot/pi05_base` bajo Apache 2.0, puede reentrenarse con nuevos datasets de pick-and-place sin restricciones de licencia.
- Evaluacion de RTC en despliegue real: el entrenamiento con `rtc_training_max_delay=10` permite probar politicas que reciben un prefijo de acciones ya ejecutadas y deben continuar el chunk, util en controladores con latencia no despreciable.
- Pruebas de robustez perceptual: el aumento fotometrico habilita experimentos controlados de degradacion de iluminacion o color en el entorno sin reentrenar.
- Docencia y reproducibilidad en laboratorio de robotica: el pipeline completo (LeRobot, safetensors, Apache 2.0) es replicable en un unico nodo con GPU, aunque conviene partir del checkpoint de 4K en lugar de este.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni metricas de exito en robot) en la informacion disponible. El unico dato de rendimiento es la perdida en datos retenidos (5% de los episodios, 10 de 200) a lo largo de la ejecucion:

| Paso | eval_loss |
|---|---|
| 1K | 0,0278 |
| 2K | 0,0215 |
| 3K | 0,0186 |
| 4K | 0,0180 (minimo) |
| 5K | 0,0186 |
| 6K | 0,0184 |
| 7K | 0,0187 |
| 8K | 0,0191 |
| 9K | 0,0191 |
| 10K | 0,0196 |
| 15K | 0,0225 |
| 20K | 0,0232 |
| 25K | 0,0255 |
| 30K | 0,0281 |
| 35K | 0,0306 |
| 40K | 0,0345 |
| 42K | 0,0351 |
| 43K | 0,0361 (este repositorio) |

El valor de 43K esta un 101% por encima del minimo de 4K. La curva asciende de forma monotona tras el paso 4K, y el autor senala explicitamente que este checkpoint es el peor de la curva hasta la fecha y no el mejor. Ademas, con `rtc_training_max_delay` distinto de cero, cada ejemplo recibe un prefijo de acciones de verdad terreno de 0 a 10 pasos y la perdida de flow se promedia solo sobre el sufijo restante (`_reduce_training_rtc_loss`); como la evaluacion recorre el mismo camino, la perdida se calcula condicionada a parte de la respuesta y sobre menos posiciones, por lo que sale mas baja por motivos ajenos a la generalizacion. Comparar esta cifra con la de rondas sin RTC mide el cambio de evaluacion tanto como el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Calculo orientativo a partir de los 4.143.404.816 parametros: en FP32 unos 16,6 GB solo de pesos; en BF16/FP16 unos 8,3 GB; en INT8 unos 4,1 GB; en INT4 unos 2,1 GB. A estas cifras hay que sumar activaciones, el encoder visual con memoria (6 fotogramas por camara) y el resto del runtime.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano en BF16, una GPU con 16-24 GB o mas resulta el punto de partida razonable para inferencia; un entrenamiento completo requiere bastante mas.
- Cabe en GPU de consumo: no confirmado. En BF16 los pesos (8,3 GB) entran teoricamente en GPUs de 12-16 GB, pero el pico real dependera del numero de camaras, de los 6 fotogramas de memoria y de la precision efectiva; sin datos publicados no puede garantizarse.
- Opciones de despliegue: la libreria declarada es `lerobot`, por lo que el camino natural es el stack de LeRobot sobre PyTorch. No se declaran ficheros GGUF ni soporte para llama.cpp u Ollama, y vLLM o TGI no son aplicables a una politica VLA con flow matching y salida de acciones.
- Latencia y throughput: no disponibles. El entrenamiento se realizo con batch efectivo de 32, y la inferencia genera chunks de accion de 50 pasos a 50 fps (1 segundo de horizonte), pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05-relative-eef-bagplace-memrtc-full-ft-43k) | 4,14 mil millones | no disponible | eval_loss 0,0361 en el paso 43K; minimo 0,0180 en 4K | apache-2.0 | HuggingFace, 0 descargas y 0 likes |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base del que parte este ajuste) |
| Otras rondas de bag-place del mismo autor (sin MEM ni RTC) | no disponible | no disponible | no disponible; la model card advierte que sus cifras no son comparables con este checkpoint | no disponible | no disponible en la informacion proporcionada |
| Otros VLA comparables (pi0, OpenVLA, GR00T) | no disponible | no disponible | no disponible | no disponible | no disponible: la busqueda web no devolvio informacion relevante |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Snapshot intermedio: es el paso 43K de una ejecucion de 100K planificada que seguia entrenando al publicarse.
- Peor checkpoint de la curva: la perdida retenida en 43K (0,0361) esta un 101% por encima del minimo (0,0180 en el paso 4K). El autor recomienda usar el checkpoint de 4K si se buscan los mejores pesos.
- Perdida no comparable: por el uso de RTC, la `eval_loss` se calcula condicionada a un prefijo de acciones de verdad terreno y sobre menos posiciones; compararla con rondas sin RTC no es valido.
- Menos muestras vistas: el batch efectivo es 32 frente a 64 en otras rondas, por lo que a igual numero de pasos ha procesado menos ejemplos.
- Ablacion debil de MEM: activar MEM sobre un `pi05_base` preentrenado sin ella corresponde a la ablacion `MEM-Posttrain-Only` del articulo, no a la configuracion principal. Los resultados destacados de MEM provienen de preentrenar el encoder de video con una mezcla grande de video robotico y no robotico que ningun checkpoint publico de pi05 proporciona.
- Funcionalidades de MEM no implementadas: la memoria de lenguaje de largo horizonte (seccion III-B) no esta incluida, y la memoria propioceptiva (III-D) esta desactivada por incompatibilidad con las acciones relativas.
- Especializacion extrema: el modelo esta ajustado para una unica tarea ("recoger la bolsa del suelo y colocarla en la mesa"); no es un modelo generalista de manipulacion.
- Datos limitados: 200 episodios en total, 190 de entrenamiento y 10 de validacion; el riesgo de sobreajuste al entorno concreto de grabacion es alto.
- Dependencia geometrica no aumentada: el aumento es solo fotometrico, sin transformaciones geometricas, de modo que la politica no ha visto variaciones de punto de vista o escala.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la informacion, sin evidencia externa de funcionamiento en robots reales.
- Sin datos de cuantizacion, contexto, idiomas ni benchmarks estandar: cualquier integracion en produccion exige una evaluacion propia previa.
- Uso comercial: permitido por la licencia apache-2.0, pero condicionado a que la licencia del modelo base `lerobot/pi05_base` sea compatible, dato no disponible en esta informacion.
- Sesgos: no documentados en la informacion disponible; al entrenarse en un unico entorno fisico, cabe esperar sesgo hacia sus condiciones de iluminacion, camara y disposicion de objetos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/pi05-relative-eef-bagplace-memrtc-full-ft-43k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Articulo de MEM citado en las etiquetas (arXiv:2603.03596): https://arxiv.org/abs/2603.03596
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su articulo de referencia; los unicos enlaces verificables son los anteriores, extraidos de la informacion de HuggingFace y de la model card.
