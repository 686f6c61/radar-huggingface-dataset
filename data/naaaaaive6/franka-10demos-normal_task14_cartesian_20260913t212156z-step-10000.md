# NaaaaaiVe6/franka-10demos-normal_task14_cartesian_20260913T212156Z-step-10000

## Resumen

Este modelo es un checkpoint de politica robotica publicado por el usuario NaaaaaiVe6 en HuggingFace, identificado como `franka-10demos-normal_task14_cartesian_...step-10000`. Se trata de un artefacto de la libreria `openpi` (etiquetas `openpi`, `pi05`, `robotics`) que contiene una politica entrenada sobre el robot Franka con solo 10 demostraciones (de ahi `10demos`), para una tarea concreta (`task14`) y con representacion de acciones en coordenadas cartesianas. El pipeline declarado es `robotics` y el checkpoint corresponde al paso 10.000 de entrenamiento.

El modelo tiene 3.616.757.520 parametros (3,62 mil millones) segun los datos reales de los pesos en safetensors, con un repositorio de 7,2 GB. Ha sido convertido de JAX a PyTorch en bfloat16 conservando la configuracion original del modelo de entrenamiento de Franka. No se publican datos de licencia, idiomas ni benchmarks, y el propio autor remite a un fichero `log.txt` para conocer el formato de salida, la frontera de normalizacion, las entradas de camara y estado, y las convenciones del controlador, que segun la model card "requieren confirmacion".

Su relevancia es limitada y muy especifica: es un artefacto de investigacion reproducible para experimentar con politicas vision-lenguaje-accion (VLA) en manipulacion cartesiana, no un modelo de proposito general. Con 0 descargas y 0 likes, no cuenta con validacion de la comunidad, y su utilidad practica depende de disponer de un Franka y del entorno `openpi`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; las etiquetas indican la familia `openpi` / `pi05` (politica vision-lenguaje-accion) |
| Parametros totales | 3.616.757.520 (3,62 mil millones, dato real de safetensors) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible; la salida del modelo son 50 pasos con 32 coordenadas |
| Tipos de cuantizacion | bfloat16 (checkpoint convertido a bf16); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo de accion robotica; no se declara procesamiento de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PyTorch, bfloat16, convertido desde JAX) |

Datos adicionales: tamano del repositorio 7,2 GB; libreria `openpi`; creado y actualizado el 2026-09-19; 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna. Las etiquetas del repositorio (`openpi`, `pi05`, `robotics`) situan el checkpoint dentro de la familia de politicas de accion vision-lenguaje de openpi, pero la model card no detalla el tipo de transformer, el mecanismo de difusion o flow matching para las acciones, ni la composicion del dataset. Lo unico confirmado es que se trata de la configuracion original del modelo de entrenamiento de Franka y que los pesos se han convertido de JAX a PyTorch en bfloat16.

Respecto al entrenamiento, el nombre del repositorio indica que se usaron 10 demostraciones (`10demos`) para una unica tarea (`task14`) y un paso de entrenamiento de 10.000. No hay informacion sobre el numero de tokens, la composicion del dataset, ni si hubo ajuste por refuerzo, DPO o aprendizaje por imitacion supervisada. La representacion de acciones es absoluta, no diferencial respecto al controlador: XYZ cartesiano absoluto, cuaternion en orden xyzw y pinza binaria con valores -1/+1. El modelo emite 50 pasos y 32 coordenadas, de las cuales solo las ocho primeras corresponden a acciones del robot. La model card exige usar el fichero `assets/franka/norm_stats.json` incluido y las transformaciones de entrenamiento correspondientes, y remite a `log.txt` para las convenciones del controlador que aun deben confirmarse.

## Capacidades

- Generacion de acciones de manipulacion para un brazo Franka en tareas de tipo `task14`, en representacion cartesiana absoluta.
- Control de pinza binaria (abrir/cerrar) mediante la ultima coordenada de accion.
- Produccion de secuencias de accion de 50 pasos con 32 coordenadas por paso (solo las 8 primeras son acciones del robot).
- Procesamiento de entradas de camara y de estado del robot, segun lo indicado en `log.txt` (no detallado en la model card).
- Aprendizaje few-shot: politica entrenada con 10 demostraciones, lo que permite evaluar la capacidad de generalizacion de un VLA en regimen de pocos datos.
- Tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision generativa, audio): no disponibles.

## Casos de uso

- Investigacion en manipulacion cartesiana: servir como politica de referencia para comparar representaciones de accion absolutas frente a acciones diferenciales del controlador en un Franka real o simulado.
- Reproduccion de experimentos few-shot: punto de partida para estudiar como varian las politicas VLA cuando solo se dispone de 10 demostraciones por tarea, midiendo el sobreajuste a `task14`.
- Fine-tuning incremental: reutilizar los pesos convertidos a PyTorch como inicializacion para reentrenar una tarea nueva anadiendo demostraciones, gracias a que el checkpoint es safetensors y compatible con la libreria `openpi`.
- Validacion en simulacion antes de hardware: ejecutar la politica en un gemelo digital del Franka para comprobar el formato de salida (50 pasos, 8 coordenadas de accion) y las transformaciones de normalizacion antes de mover el robot fisico.
- Banco de pruebas de latencia para VLA: al tener 3,62 mil millones de parametros en bf16, es un candidato util para medir tiempo de inferencia y frecuencia de control alcanzable en una GPU concreta antes de desplegar politicas mayores.
- Docencia y formacion en robotica: ejemplo completo de artefacto de politica entrenada con `openpi`, util para ilustrar el ciclo de conversion JAX a PyTorch, normalizacion con `norm_stats.json` y control de un brazo Franka.
- Auditoria de convenciones de control: el autor senala convenciones "que requieren confirmacion"; este checkpoint sirve como material para verificar experimentalmente la correspondencia entre salida cartesiana, cuaternion y pinza con el controlador real.
- Analisis de ablaciones sobre datos: comparar el efecto del numero de demostraciones o del tipo de normalizacion reentrenando variantes sobre la misma tarea y el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card y los metadatos no incluyen tasas de exito, MMLU, HumanEval, GSM8K ni ninguna otra metrica. Tampoco se documentan medidas de latencia o throughput de inferencia.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 7,2 GB en disco y en memoria, coherente con los 7,2 GB del repositorio.
- VRAM estimada para inferencia: del orden de 10 a 12 GB en bf16 contando pesos, activaciones y codificadores de imagen (estimacion propia, no confirmada por el autor).
- GPU de datacenter recomendadas: A100, H100, L40S o similares con al menos 16 GB de memoria, si se busca la menor latencia.
- GPU de consumo: cabe previsiblemente en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 8-12 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: la libreria declarada es `openpi`; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que ademas no son formatos habituales para politicas de accion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa numerica. Como referencia cualitativa, el checkpoint pertenece a la familia `openpi` / `pi05`, cuyos modelos base son de proposito general y tamano similar, mientras que este artefacto es un ajuste especifico sobre un unico robot (Franka), una unica tarea (`task14`) y 10 demostraciones. Existen otras familias publicas de politicas VLA para manipulacion (por ejemplo OpenVLA o RDT-1B), pero no se han proporcionado datos de parametros, contexto, licencia o rendimiento de esas alternativas en esta busqueda, por lo que no se incluyen cifras.

| Modelo | Parametros | Ambito | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (Franka task14) | 3,62 mil millones | Franka, una tarea, 10 demos | No disponible | Publico en HuggingFace, 0 descargas |
| Modelos base de la familia openpi / pi05 | No disponible | Proposito general de manipulacion | No disponible | No disponible en la informacion proporcionada |
| Otras politicas VLA publicas (OpenVLA, RDT-1B, GR00T) | No disponible en la informacion proporcionada | Manipulacion general | No disponible en la informacion proporcionada | No verificado en esta busqueda |

## Limitaciones y advertencias

- Entrenado con solo 10 demostraciones: riesgo alto de sobreajuste a las condiciones exactas de recogida de datos y de fallo fuera de distribucion.
- Especifico de una unica tarea (`task14`), un unico robot (Franka) y un unico formato de accion (cartesiano absoluto). No es un modelo generalista.
- La representacion de acciones es absoluta (XYZ + cuaternion xyzw + pinza binaria), no diferencial respecto al controlador; usarla como si fueran deltas puede provocar movimientos incorrectos o inseguros.
- De las 32 coordenadas de salida, solo las 8 primeras son acciones del robot; ignorar el resto o reordenar mal la salida invalida el control.
- Requiere obligatoriamente el fichero `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes; sin ellos la normalizacion es incorrecta.
- El propio autor indica que hay convenciones del controlador "que requieren confirmacion"; no debe ponerse en un robot real sin validarlas antes.
- Licencia no disponible: no hay autorizacion explicita de uso comercial ni condicion de atribucion, lo que impide un uso en produccion con garantias legales.
- Sin benchmarks ni evaluacion publicada: no hay evidencia de tasa de exito de la tarea.
- Sin validacion de la comunidad (0 descargas, 0 likes) y sin historial de issues.
- Conversion JAX a PyTorch bfloat16 sin informe de validacion numerica documentado; pueden existir divergencias respecto al checkpoint original.
- Idiomas y sesgos: no se declara soporte de lenguaje ni se documentan sesgos, pero al ser un modelo de accion los riesgos relevantes son de sesgo en los datos de demostracion y de generalizacion, no de generacion de texto.
- Riesgo de alucinacion en el sentido linguistico: no aplicable; el riesgo equivalente es la generacion de trayectorias plausibles pero fisicamente invalidas.
- Fecha de creacion y actualizacion (2026-09-19) posterior a la fecha habitual de referencia; conviene verificar la autenticidad y procedencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task14_cartesian_20260913T212156Z-step-10000
- Fichero de log citado en la model card: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task14_cartesian_20260913T212156Z-step-10000/blob/main/log.txt
- Normalizacion citada en la model card: `assets/franka/norm_stats.json`, dentro del repositorio del modelo.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los resultados obtenidos corresponden a foros de reparacion de consolas Xbox 360 y a hilos de soporte de Microsoft, sin relacion con el modelo. No hay papers, blogs, repositorios ni demos adicionales disponibles.
