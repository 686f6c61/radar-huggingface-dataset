# maskjp/pi05-relative-joints-bagplace-aug100k-full-ft-54k

## Resumen

`maskjp/pi05-relative-joints-bagplace-aug100k-full-ft-54k` es un checkpoint de robótica publicado por el usuario de HuggingFace maskjp: un ajuste fino completo del modelo base `lerobot/pi05_base` sobre una única tarea de manipulación —"coger la bolsa del suelo y colocarla sobre la mesa"— con las acciones expresadas en espacio articular relativo y con aumento fotométrico de imagen activado. El modelo pertenece a la familia pi0.5, una política vision-language-action (VLA) que combina percepción visual, instrucción en lenguaje natural y generación de acciones motoras, y se distribuye a través de la librería LeRobot con pesos en safetensors de aproximadamente 4.143 millones de parámetros (9,4 GB de repositorio).

Lo más relevante de esta ficha no es el modelo en sí, sino su estado: se trata de una instantánea intermedia de un entrenamiento que aún no había terminado cuando se publicó (paso 54K de 100K previstos). El propio autor advierte en la model card que la pérdida en el conjunto de validación en ese punto (0,0819) está un 184 % por encima del mínimo alcanzado durante la ejecución (0,0288 en el paso 2K), es decir, que es el peor checkpoint de la curva hasta la fecha y no el mejor. Para uso práctico, el autor recomienda explícitamente tomar el checkpoint de 2K.

El interés técnico del repositorio radica en dos decisiones de diseño documentadas con detalle: el uso de acciones relativas al estado de observación del inicio de cada chunk (con la pinza tratada como comando absoluto) y un esquema de aumento fotométrico que no altera la geometría imagen-acción. El conjunto de datos de entrenamiento es pequeño y monoespecífico: 200 episodios, 477.058 fotogramas (2,65 horas a 50 fps), un brazo u850 sobre base móvil y tres cámaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia pi0.5; el detalle del backbone (transformer, atencion, etc.) no esta disponible en la informacion proporcionada |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones), segun safetensors |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; no se publican versiones cuantizadas (GGUF, int8, etc.) |
| Idiomas soportados | No disponible; el modelo es una politica robotica condicionada por instruccion en lenguaje natural, no un modelo de chat multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot); tamano del repositorio 9,4 GB |
| Dimension de accion | 10: joint1-joint6, gripper, base_x, base_y, base_yaw |
| Normalizacion | QUANTILES, calculada sobre los desplazamientos relativos en chunks de 50 |
| Tarea | Una sola: "pick up the bag on the ground and place it on the table" |
| Checkpoint | Paso 54K de una ejecucion planificada de 100K (instantanea intermedia) |
| Fecha de publicacion | 2026-09-15 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La model card describe el modelo como un ajuste fino completo (vision + lenguaje + accion) inicializado desde `lerobot/pi05_base`. No se detallan en la informacion proporcionada el numero de capas, la dimension oculta, el mecanismo de atencion ni la composicion del corpus de preentrenamiento del modelo base. Lo que si se documenta con precision es el esquema de representacion de acciones, que es la innovacion central de esta publicacion.

Con `use_relative_actions=true` y `relative_exclude_joints=["gripper"]`, las 9 dimensiones de pose (6 articulaciones del brazo y las 3 de la base movil) se expresan como desplazamientos relativos al estado de observacion anclado al inicio de cada chunk, mientras que la pinza se mantiene en valor absoluto porque es un comando y no una pose. La conversion la realiza un paso de procesamiento (`RelativeActionsProcessorStep` a la entrada, `AbsoluteActionsProcessorStep` a la salida), no una reescritura de los datos, de modo que el comportamiento es identico en entrenamiento, evaluacion e inferencia y la politica emite acciones absolutas. La normalizacion QUANTILES se calcula sobre los offsets relativos, no sobre los objetivos absolutos, ya que de otro modo la mayoria de los objetivos caeria fuera del rango [-1, 1]. La rotacion del efector final se almacena en forma continua 6D (las dos primeras columnas de la matriz de rotacion) en lugar de eje-angulo, porque en este robot la pinza apunta hacia abajo y la representacion eje-angulo introduce saltos de 2*pi entre fotogramas.

Los datos de entrenamiento consisten en 200 episodios de una unica tarea, 477.058 fotogramas (2,65 horas a 50 fps), con un brazo u850 sobre base movil y tres camaras (izquierda, derecha y muneca). El 5 % de los episodios (10 de 200; 190 de entrenamiento) se reserva para validacion. El aumento de imagen se activa con `--dataset.image_transforms.enable=true` y aplica como maximo 3 transformaciones fotometricas por ejemplo, todas ellas sin componente geometrico: brillo [0,8; 1,2], contraste [0,8; 1,2], saturacion [0,5; 1,5], tono [-0,05; 0,05] y nitidez [0,5; 1,5]. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de optimizacion por preferencias, algo por otra parte esperable en una politica robotica.

El autor es notablemente cauto con la atribucion de mejoras: existe una ejecucion comparable sin aumento (mismos datos, mismo esquema relativo, misma inicializacion, mismo pico de learning rate de 2,5e-5 y mismo batch), pero no constituye una ablacion limpia porque el horizonte de decaimiento coseno difiere (20K frente a 100K), lo que aleja las tasas de aprendizaje a partir del calentamiento; en el paso 20K el learning rate de esta ejecucion es 9,1 veces el de la otra. En los minimos, donde ambos schedules aun estan proximos (diferencia de learning rate del 2,2 %), las perdidas son 0,0288 y 0,0290, una diferencia de alrededor del 1 % con una sola semilla por rama, insuficiente para afirmar un efecto. La ejecucion sin aumento no esta publicada.

## Capacidades

- Ejecucion de una tarea de manipulacion concreta: recoger una bolsa del suelo y colocarla sobre una mesa, condicionada por instruccion en lenguaje natural.
- Generacion de acciones en espacio articular de 10 dimensiones (6 articulaciones del brazo, pinza, base_x, base_y, base_yaw) para un brazo u850 sobre base movil.
- Control de base movil, ya que las tres dimensiones de la base forman parte del vector de accion.
- Emision de acciones absolutas en inferencia pese a entrenarse con objetivos relativos, gracias al paso de procesamiento reversible.
- Percepcion multimodal con tres camaras simultaneas (izquierda, derecha y muneca) ademas de la entrada de estado.
- Generalizacion fotometrica limitada: el aumento de brillo, contraste, saturacion, tono y nitidez busca robustez ante variaciones de iluminacion y camara.
- No se documenta en la informacion disponible soporte de tool calling, function calling, razonamiento multi-paso deliberativo, modo thinking, audio ni capacidades conversacionales: es una politica robotica, no un asistente de texto.

## Casos de uso

- Automatizacion de una celda de pick-and-place de bolsas: el modelo recibe la instruccion "coger la bolsa del suelo y colocarla sobre la mesa" junto con las tres vistas de camara y el estado articular, y devuelve el vector de 10 dimensiones a ejecutar por el controlador. Es el unico escenario para el que fue entrenado.
- Investigacion en representaciones de accion relativas: sirve como artefacto reproducible para estudiar el efecto `use_relative_actions=true` con `gripper` excluido, comparando contra variantes absolutas con los mismos datos.
- Estudio de normalizacion en politicas roboticas: el uso de estadisticas QUANTILES calculadas sobre offsets relativos en lugar de sobre objetivos absolutos es un punto de partida para analizar como la eleccion de estadisticas afecta a la estabilidad del entrenamiento.
- Evaluacion de aumento fotometrico en VLA: el repositorio documenta la lista exacta de transformaciones y rangos, lo que permite reproducir el pipeline de augmentacion, aunque el propio autor advierte de que la comparacion con la rama sin aumento esta confundida por el distinto horizonte de decaimiento.
- Prueba de representaciones de rotacion: la eleccion de la forma continua 6D frente a eje-angulo para un efector que apunta hacia abajo es un caso de estudio util para quienes disenan espacios de accion en robots con pinza vertical.
- Reentrenamiento sobre hardware similar: al estar bajo Apache 2.0 y formato LeRobot, puede servir como inicializacion para ajustes finos en brazos u850 con base movil y configuracion de tres camaras.
- Linea base para especialistas frente a generalistas: el autor senala que esta tarea representa aproximadamente el 7 % de la mezcla all-10, por lo que este modelo es el contrapunto monoespecialista de `maskjp/pi05-relative-joints-all10-full-ft-100k`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni metricas de exito en tareas roboticas) en la informacion disponible. El unico dato de rendimiento cuantitativo es la perdida en el conjunto de validacion retenido (5 % de los episodios; 10 de 200), que se reproduce a continuacion tal como aparece en la model card.

| Paso | eval_loss |
|---|---|
| 1K | 0,0328 |
| 2K | 0,0288 (minimo) |
| 3K | 0,0311 |
| 4K | 0,0323 |
| 5K | 0,0344 |
| 6K | 0,0350 |
| 7K | 0,0388 |
| 8K | 0,0387 |
| 9K | 0,0405 |
| 10K | 0,0412 |
| 20K | 0,0502 |
| 30K | 0,0577 |
| 40K | 0,0668 |
| 50K | 0,0793 |
| 54K (este repositorio) | 0,0819 |

Interpretacion: la curva alcanza su minimo en el paso 2K y crece de forma monotona con oscilaciones desde entonces. El valor del checkpoint publicado esta un 184 % por encima de ese minimo (0,0819 frente a 0,0288), lo que indica sobreajuste progresivo a los 190 episodios de entrenamiento.

| Comparacion | Perdida minima | Paso del minimo | Nota |
|---|---|---|---|
| Esta ejecucion (con aumento, horizonte 100K) | 0,0288 | 2K | Ejecucion detenida/publicada en 54K |
| Ejecucion sin aumento (horizonte 20K) | 0,0290 | 2K | No publicada; no es una ablacion limpia |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 8,3 GB en bf16 (4.143.404.816 parametros x 2 bytes), lo que con el repositorio de 9,4 GB resulta coherente. Sumando activaciones, buffers de imagen de tres camaras y overhead del runtime, una estimacion prudente es de 12 a 16 GB de VRAM. No es un dato publicado por el autor.
- GPU recomendadas: para inferencia en bf16, una RTX 4090 (24 GB), RTX 3090 (24 GB), L40S, A100 o H100 son suficientes. GPU con menos de 12 GB probablemente requieran cuantizacion o carga en fp16 con offload, opciones no documentadas.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 en bf16. La viabilidad en tarjetas de 8-12 GB no esta documentada.
- Entrenamiento: el ajuste fino completo requiere memoria muy superior a la de inferencia (pesos, gradientes, estados del optimizador y activaciones). El autor no publica la configuracion de hardware utilizada, por lo que no se dispone de cifras concretas.
- Opciones de despliegue: libreria LeRobot sobre PyTorch (formato nativo del repositorio). No hay versiones GGUF, ni instrucciones para llama.cpp, Ollama, vLLM o TGI en la informacion disponible; estos runners estan orientados a modelos de lenguaje y no a politicas VLA de robotica.
- Latencia y throughput: no disponibles. El modelo esta pensado para control en tiempo real sobre datos a 50 fps, pero no se publican mediciones de frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Datos | Licencia | Estado |
|---|---|---|---|---|---|
| Este modelo (`pi05-relative-joints-bagplace-aug100k-full-ft-54k`) | 4,14 mil millones | Monotarea: bag-place, acciones relativas en espacio articular | 200 episodios, 477.058 fotogramas | Apache 2.0 | Instantanea 54K/100K; peor checkpoint de la curva |
| `lerobot/pi05_base` | No disponible en la informacion proporcionada | Politica VLA base, multitarea | No disponible | No disponible en la informacion proporcionada | Modelo de partida del ajuste fino |
| `maskjp/pi05-relative-joints-all10-full-ft-100k` | No disponible en la informacion proporcionada | Generalista sobre mezcla all-10, con bag-place en aproximadamente el 7 % | Mezcla all-10 | Apache 2.0 (segun el autor de esta ficha) | Contrapunto generalista del especialista |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo entre estas variantes mas alla de la perdida de validacion de este repositorio concreto.

## Limitaciones y advertencias

- Checkpoint no optimo: el autor indica de forma explicita que esta instantanea del paso 54K es el peor checkpoint de la curva hasta la fecha, con una perdida un 184 % por encima del minimo. Para uso real recomienda el checkpoint de 2K.
- Entrenamiento inacabado: la ejecucion se publico en el paso 54K de 100K previstos, con la curva de validacion todavia en ascenso.
- Sobreajuste: 190 episodios de entrenamiento y una perdida que crece de forma monotona desde el paso 2K apuntan a sobreajuste al conjunto de entrenamiento, con la consiguiente perdida de generalizacion.
- Monotarea: solo ha sido entrenado para "coger la bolsa del suelo y colocarla sobre la mesa". No se puede esperar que responda a otras instrucciones.
- Acoplamiento al hardware: el vector de accion de 10 dimensiones y la normalizacion estan definidos para un brazo u850 sobre base movil con tres camaras. Transferirlo a otra cinematica o a otra configuracion de camaras invalidaria las estadisticas de normalizacion.
- Ausencia de evidencia sobre el aumento: el autor declara que no se puede atribuir mejora alguna al aumento fotometrico, porque la comparacion disponible confunde el aumento con el horizonte de decaimiento del learning rate y solo hay una semilla por rama.
- Riesgo de alucinacion: en el sentido de acciones fisicamente invalidas o inseguras no hay evaluacion publicada en la informacion disponible; al tratarse de un modelo que controla hardware fisico, es imprescindible un controlador de seguridad externo con limites de par, velocidad y espacio de trabajo.
- Limitaciones de idioma: no se especifican idiomas soportados. La condicion de lenguaje es una unica instruccion de tarea en ingles, por lo que el comportamiento con otras formulaciones o idiomas no esta caracterizado.
- Licencia: Apache 2.0 permite uso comercial, pero la model card no ofrece garantias y no se documentan sesgos ni limitaciones de dominio mas alla de las mencionadas.
- Ausencia de soporte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica que permitan validar el comportamiento del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/pi05-relative-joints-bagplace-aug100k-full-ft-54k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Variante generalista all-10 mencionada por el autor: https://huggingface.co/maskjp/pi05-relative-joints-all10-full-ft-100k

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre la familia pi0.5; unicamente aparecieron resultados no relacionados (Google Earth). No se dispone por tanto de enlaces adicionales a papers, blogs o demos verificables dentro de la informacion proporcionada.
