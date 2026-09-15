# maskjp/pi05-relative-eef-bagplace-aug100k-full-ft-54k

## Resumen

Este repositorio contiene un ajuste fino completo (*full fine-tune*) del modelo base `lerobot/pi05_base` sobre una única tarea de manipulación robótica: "recoger la bolsa del suelo y colocarla sobre la mesa". Lo publica el usuario `maskjp` y pertenece a la familia pi0.5, un modelo de visión-lenguaje-acción (VLA) orientado a control robótico dentro del ecosistema LeRobot. El checkpoint pesa 4.143.404.816 parámetros (unos 4,14 mil millones) y el repositorio ocupa 9,4 GB en formato safetensors.

La particularidad técnica del modelo es que las acciones se expresan de forma **relativa al estado de observación al inicio de cada chunk de acción** (12 de las 13 dimensiones; la pinza se mantiene absoluta), y que durante el entrenamiento se activó aumento de imagen puramente fotométrico. Es un especialista de tarea única, a diferencia de su contraparte generalista del mismo autor (`maskjp/pi05-relative-eef-all10-full-ft-100k`), y se inicializa desde el modelo base en lugar de desde la mezcla de diez tareas.

Es relevante ahora sobre todo como artefacto de investigación y no como modelo listo para producción: se trata de una **instantánea intermedia de un entrenamiento en curso** (paso 54K de 100K) cuya pérdida en datos retenidos (0,0882) está un 180 % por encima del mínimo alcanzado en la propia ejecución (0,0315 en el paso 2K), es decir, el peor checkpoint de la curva hasta la fecha de publicación. El propio autor recomienda usar el checkpoint de 2K si se buscan los mejores pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) pi0.5, ajustado desde `lerobot/pi05_base`; no se detalla la arquitectura interna (transformer, MoE, etc.) en la informacion disponible |
| Parametros totales | 4.143.404.816 (4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados estan sin cuantizar en safetensors |
| Idiomas soportados | no disponible (la unica instruccion de tarea esta redactada en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Espacio de acciones | 13 dimensiones: `eef_x`, `eef_y`, `eef_z`, `eef_xx`, `eef_xy`, `eef_xz`, `eef_yx`, `eef_yy`, `eef_yz`, `gripper`, `base_x`, `base_y`, `base_yaw` |
| Checkpoint | paso 54K de una ejecucion de 100K, instantanea intermedia |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo pertenece a la familia pi0.5 y se distribuye a traves de la libreria `lerobot`, con el pipeline declarado como `robotics`. La informacion disponible no describe la arquitectura interna (tipo de transformer, mecanismo de atencion, encoders de vision o esquema de fusión de las tres camaras), por lo que ese detalle queda como no disponible. Lo que si se documenta con precision es la interfaz de acciones: se usa `use_relative_actions=true` con `relative_exclude_joints=["gripper"]`. Se trata de una transformacion de *processor*, no de una reescritura de datos: `RelativeActionsProcessorStep` resta el estado ancla en tiempo de batch y `AbsoluteActionsProcessorStep` lo vuelve a sumar a la salida, de modo que la politica emite acciones absolutas y la conversion es identica en entrenamiento, evaluacion e inferencia. La rotacion del efector final se representa en forma continua 6D (las dos primeras columnas de la matriz de rotacion), no en eje-angulo, porque en este robot la pinza apunta hacia abajo y `|rotvec|` queda cerca de pi, donde el signo cambia de forma arbitraria. La normalizacion es por `QUANTILES`, calculada sobre los desplazamientos relativos en chunks de 50 (`meta/relative_action_provenance.json`), no sobre los objetivos absolutos.

Los datos de entrenamiento consisten en una unica tarea condicionada por lenguaje: 200 episodios, 477.058 fotogramas (2,65 horas a 50 fps), un brazo u850 sobre base movil y tres camaras (izquierda, derecha y muneca). Se retienen el 5 % de los episodios (10 de 200; 190 para entrenamiento). El regimen es de ajuste fino completo con `lerobot/pi05_base` como inicializacion y un pico de learning rate de 2,5e-5. El aumento de imagen activado (`--dataset.image_transforms.enable=true`) aplica como maximo 3 transformaciones por ejemplo, todas fotometricas y sin componente geometrico: `brightness` [0,8; 1,2], `contrast` [0,8; 1,2], `saturation` [0,5; 1,5], `hue` [-0,05; 0,05] y `sharpness` [0,5; 1,5]. El autor advierte explicitamente que **no se puede atribuir ningun efecto al aumento**: la ejecucion comparable sin aumento usa un horizonte de decaimiento coseno de 20K frente a los 100K de esta, de modo que a partir del warmup las tasas de aprendizaje divergen (a 20K, la de esta ejecucion es 9,1 veces mayor). En los minimos, donde ambos calendarios todavia son cercanos (diferencia de learning rate del 2,2 %), los valores son 0,0315 frente a 0,0317, una diferencia de ~1 % con una sola semilla por rama, insuficiente para extraer conclusiones.

## Capacidades

- Generacion de acciones de robot para una tarea de manipulacion concreta: recoger una bolsa del suelo y colocarla sobre una mesa.
- Control en espacio del efector final (posicion xyz, rotacion 6D y pinza) mas movimiento de base movil (`base_x`, `base_y`, `base_yaw`).
- Condicionamiento por instruccion en lenguaje natural, con una unica instruccion de tarea entrenada.
- Emision de acciones absolutas en inferencia pese a entrenarse con acciones relativas, mediante la transformacion simetrica del processor.
- Percepcion multimodal a partir de tres flujos de camara (izquierda, derecha y muneca).
- Chunking de acciones (los offsets relativos se normalizan sobre chunks de 50).
- No hay informacion disponible sobre tool calling, function calling, uso como agente, razonamiento multi-paso, matemáticas, generacion de codigo, vision general, audio ni modo de pensamiento. Es un modelo de politica robotica, no un modelo de lenguaje de proposito general.

## Casos de uso

- Manipulacion robotica de tipo *pick-and-place* en laboratorio: el modelo se uso para una tarea literal de recogida y colocacion de una bolsa, con un brazo u850 sobre base movil y tres camaras; es el escenario para el que existen pesos y datos.
- Punto de partida para ajuste fino en tareas propias: al ser un ajuste completo sobre `lerobot/pi05_base`, sirve como inicializacion alternativa para quien trabaje con el mismo esquema de acciones relativas de 13 dimensiones y quiera reentrenar sobre sus propios episodios.
- Estudio del esquema de acciones relativas: el repositorio documenta el ancla temporal, la exclusion de la pinza y la procedencia de la normalizacion, lo que permite reproducir y auditar la tecnica en otros brazos.
- Analisis de sobreajuste en politicas VLA: la curva de perdida retenida (minimo en 2K y ascenso monotono hasta 54K) es material directo para estudiar cuando conviene detener el entrenamiento en tareas de robot.
- Investigacion sobre robustez fotometrica: las cinco transformaciones estan documentadas con sus rangos, y el autor deja claro que la comparacion con la ejecucion sin aumento no es una ablacion limpia; sirve como caso de estudio metodologico mas que como evidencia.
- Docencia y prototipado con LeRobot: el modelo se carga con la libreria `lerobot`, lo que facilita usarlo en practicas de robotica y en cursos sobre modelos de vision-lenguaje-accion.
- Pruebas de inferencia sobre el mismo *embodiment*: al depender de una configuracion concreta de camaras y de un espacio de acciones especifico, es util para validar la integracion de extremo a extremo antes de desplegar otros checkpoints de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento es la perdida en datos retenidos a lo largo del entrenamiento, con el 5 % de los episodios reservado. Se reproduce una seleccion de la curva (los 54 valores completos estan en la model card):

| Paso | eval_loss |
|---|---|
| 1K | 0,0357 |
| 2K | 0,0315 (minimo) |
| 3K | 0,0315 |
| 5K | 0,0343 |
| 10K | 0,0414 |
| 20K | 0,0518 |
| 30K | 0,0606 |
| 40K | 0,0699 |
| 50K | 0,0858 |
| 54K (este repositorio) | 0,0882 |

El minimo se alcanza en el paso 2K y la curva sube despues de forma sostenida: la perdida en el checkpoint publicado esta un 180 % por encima de ese minimo. El autor senala que, en esta curva, el checkpoint de 54K es el peor hasta la fecha de publicacion. No hay datos de tasa de exito en robot real, latencia ni throughput. La comparacion con la ejecucion sin aumento (0,0518 en eef a 20K frente a 0,0728) queda confundida por el distinto horizonte de decaimiento y no debe leerse como efecto del aumento.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 8,3 GB en bf16 solo para los pesos (4,14 mil millones de parametros) y unos 16,6 GB en fp32. Hay que sumar memoria de activaciones, que en un modelo VLA con tres flujos de camara es significativa; una estimacion prudente en bf16 para inferencia con lotes pequenos es de 10 a 14 GB.
- El tamano del repositorio (9,4 GB) es coherente con pesos en bf16 mas los ficheros de configuracion y metadatos.
- GPU recomendadas: para bf16 sin cuantizar, una RTX 4090 (24 GB) o superior es suficiente; A100 y H100 dan margen sobrado. En tarjetas de 12 GB (RTX 3060, RTX 4070) el modelo puede caber en bf16 pero con muy poco margen para activaciones, por lo que conviene reducir resolucion o lote.
- Cabe en GPU de consumo: si, en bf16, en tarjetas de 24 GB; en 12 GB es ajustado y no hay cuantizaciones publicadas que reduzcan el peso.
- Opciones de despliegue: la libreria `lerobot` es la via documentada. No hay pesos GGUF ni configuraciones publicadas para vLLM, llama.cpp, Ollama o TGI, y al ser una politica de robot con interfaz de acciones de 13 dimensiones no es un candidato directo para esos servidores.
- Latencia y throughput: no disponible. La inferencia esta sujeta ademas al bucle de control del robot (el conjunto de datos original se capturo a 50 fps) y a la latencia de las tres camaras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (`maskjp/pi05-relative-eef-bagplace-aug100k-full-ft-54k`) | 4,14 mil millones | no disponible | Especialista de tarea unica (bag-place), con aumento fotometrico, paso 54K/100K | Apache-2.0 | Publico en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `lerobot/pi05_base` | no disponible | no disponible | Modelo base pi0.5 usado como inicializacion | no disponible en la informacion proporcionada | Publico en HuggingFace |
| `maskjp/pi05-relative-eef-all10-full-ft-100k` | no disponible | no disponible | Generalista sobre una mezcla de 10 tareas; bag-place es ~7 % de esa mezcla | no disponible en la informacion proporcionada | Publico en HuggingFace |
| Ejecucion sin aumento del mismo autor | no disponible | no disponible | Misma tarea y mismo esquema de acciones relativas, sin transformaciones de imagen, horizonte coseno de 20K | no disponible | No publicada, segun la model card |
| Checkpoint de 2K de la misma ejecucion | 4,14 mil millones | no disponible | Misma tarea; mejor perdida retenida de la curva (0,0315) | Apache-2.0 | Se menciona en la model card; no se confirma un repositorio independiente |

No se dispone de datos de rendimiento comparables entre estos modelos, solo de la perdida retenida de esta ejecucion.

## Limitaciones y advertencias

- Es una **instantanea intermedia de un entrenamiento inacabado** (paso 54K de 100K) y, segun el propio autor, el peor checkpoint de la curva hasta la fecha de publicacion: la perdida retenida esta un 180 % por encima del minimo (0,0315 en 2K frente a 0,0882 en 54K). Para uso real, el autor recomienda el checkpoint de 2K.
- La curva de perdida crece de forma monotona tras el paso 2K, lo que indica sobreajuste a los datos de entrenamiento en los checkpoints tardios.
- El modelo es un **especialista de una sola tarea** y esta condicionado por una unica instruccion en lenguaje natural. No se ha entrenado para generalizar a otras tareas ni a otras frases de instruccion.
- El aumento de imagen no puede evaluarse con los datos publicados: la comparacion con la ejecucion sin aumento mezcla el cambio de aumento con un horizonte de decaimiento coseno distinto (20K frente a 100K), con divergencia de learning rate de hasta 9,1x. La diferencia en los minimos (~1 %) es inferior a lo que una sola semilla permite concluir.
- Solo hay una semilla por rama, por lo que no se puede hacer inferencia estadistica sobre ninguna diferencia observada.
- Dependencia fuerte del *embodiment*: brazo u850 sobre base movil, tres camaras concretas (izquierda, derecha y muneca) y un espacio de acciones de 13 dimensiones con la pinza en absoluto. No es portable a otra configuracion de robot sin reentrenar.
- Idioma: no se declaran idiomas soportados; la unica instruccion de tarea esta en ingles.
- Riesgo de alucinacion y sesgos: no hay informacion disponible. En modelos de politica robotica el fallo se manifiesta como acciones fisicamente incorrectas, con riesgo material sobre el robot y su entorno, por lo que se requiere supervision y limites de seguridad en el banco de pruebas.
- Licencia Apache-2.0: permite uso comercial y modificacion, con los requisitos habituales de atribucion y conservacion del aviso de licencia. Conviene verificar la licencia del modelo base `lerobot/pi05_base`, que no se especifica en la informacion disponible.
- No hay resultados de exito en robot real, ni latencias, ni pruebas de robustez a cambios de iluminacion mas alla del aumento aplicado en entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/pi05-relative-eef-bagplace-aug100k-full-ft-54k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Contraparte generalista del mismo autor: `maskjp/pi05-relative-eef-all10-full-ft-100k` (referenciada en la model card; construccion de la URL estandar sobre HuggingFace)
- La busqueda web realizada no devolvio ningun enlace relacionado con este modelo: los resultados obtenidos corresponden a foros alemanes sobre MediathekView y VLC, sin relacion con el contenido de la ficha. No se dispone, por tanto, de papers, blogs, repositorios ni demos adicionales.
