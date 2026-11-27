# briskVLA/student_8L_late

## Resumen

briskVLA/student_8L_late es un checkpoint de politica robotica (VLA, vision-language-action) derivado de lerobot/smolvla_libero mediante destilacion y reduccion de profundidad. El modelo lo publica el proyecto briskVLA y se distribuye a traves de Hugging Face con la libreria LeRobot. Su funcion es actuar como "student" de un modelo "teacher" (lerobot/smolvla_libero, commit a24f1f380461) para tareas de manipulacion en el benchmark LIBERO, con el objetivo declarado de reducir coste computacional manteniendo el comportamiento del profesor.

Tecnicamente es un SmolVLA modificado: conserva el experto de acciones pero recorta su profundidad a 8 capas, seleccionando las capas [8, 9, 10, 11, 12, 13, 14, 15] del modelo original (de ahi el sufijo "8L") y manteniendo el ancho de FFN por defecto (2048). La variante "late" hace referencia al layout canonico de las capas conservadas, es decir, se retienen las capas tardias del experto. El checkpoint tiene 400.923.616 parametros en formato safetensors y ocupa 0,8 GB en el repositorio.

Su relevancia es acotada pero concreta: encaja en la linea de trabajo de compresion de modelos VLA para robotica de bajo coste, donde el objetivo es ejecutar politicas de accion en hardware modesto o con latencias reducidas. No es un modelo de lenguaje general ni un chatbot: es un artefacto de investigacion orientado a evaluacion en LIBERO y a seguir destilando (por ejemplo, de 8L a 4L).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLA basada en transformer con experto de acciones), reducida a 8 capas en el experto |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo parte de lerobot/smolvla_libero, un SmolVLA ajustado para LIBERO. La variante student_8L_late aplica una reduccion de profundidad: conserva unicamente las capas del experto de acciones con indices [8, 9, 10, 11, 12, 13, 14, 15], es decir, las ocho capas finales (layout "late"), y mantiene el ancho de FFN por defecto de 2048. El rol declarado es "student" dentro de un esquema de destilacion cuyo teacher es el checkpoint original de SmolVLA para LIBERO.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; en el contexto de LIBERO cabe esperar datos de demostraciones de manipulacion, pero ese dato no se confirma en la informacion disponible. La innovacion tecnica destacable es precisamente el procedimiento de construccion del student: seleccion de capas por layout (early/late) y posibilidad de seguir comprimiendo mediante scripts propios (distill_student.py y build_student.py, con opciones como --group 2 --keep alternate --ffn fuse para pasar de 8L a 4L).

## Capacidades

- Generacion de acciones roboticas a partir de observaciones visuales y consignas de tarea, en el marco del benchmark LIBERO.
- Ejecucion de politicas de manipulacion evaluables con horizonte K=10 y K=1 (segun los comandos de evaluacion de la model card).
- Destilacion adicional: puede usarse como punto de partida para seguir entrenando o comprimir (por ejemplo, de 8L a 4L).
- Medicion de latencia mediante el script latency.py del proyecto briskvla.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo "thinking".
- Capacidades multilingues: no disponibles; el modelo no se presenta como modelo de lenguaje, sino como politica VLA.

## Casos de uso

- Evaluacion comparativa de compresion VLA: usar el checkpoint como student de referencia en LIBERO para medir la perdida de exito respecto al teacher smolvla_libero con K=10 y K=1.
- Investigacion en destilacion de profundidad: emplearlo como entrada de distill_student.py para generar variantes afinadas y estudiar el equilibrio entre capas y rendimiento.
- Compresion iterativa: aplicar build_student.py con --group 2 --keep alternate --ffn fuse para obtener un student de 4 capas y analizar la curva de degradacion.
- Analisis de latencia en robotica: ejecutar latency.py para obtener perfiles de latencia del checkpoint y decidir si es viable en un bucle de control real.
- Reproducibilidad de experimentos: servir como artefacto versionado (commit del teacher documentado) para replicar resultados de reduccion de profundidad en entornos de laboratorio.
- Docencia y prototipado en robotica de bajo coste: al ocupar 0,8 GB y 400 M de parametros, permite experimentar con politicas VLA en estaciones de trabajo sin grandes aceleradores, siempre dentro del alcance de LIBERO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye comandos para evaluar en LIBERO (SUCCESS=1 LATENCY=0 STEPS="10 1") y para medir latencia, pero no presenta cifras de tasa de exito ni de latencia obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 400,9 M de parametros en safetensors, el peso en precision de entrenamiento ronda los 0,8 GB, por lo que la VRAM adicional dependera del runtime y de los buffers de vision.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Ajuste en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas, dado el tamano del checkpoint, aunque no se confirma en la documentacion.
- Opciones de despliegue: LeRobot (libreria declarada) y los scripts del proyecto briskvla (run_eval.sh, latency.py, distill_student.py, build_student.py). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles; existe un script para medirlos, pero no se publican resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/student_8L_late | 400.923.616 | no disponible | sin cifras publicadas (evaluable en LIBERO) | no disponible | Hugging Face, libreria lerobot |
| lerobot/smolvla_libero (teacher) | no disponible en la informacion | no disponible | sin cifras publicadas en la informacion | no disponible | Hugging Face |
| Otras variantes briskVLA (p. ej. student de 4L) | no disponible | no disponible | no disponible | no disponible | referenciadas en los scripts, sin ficha detallada |

No se dispone de datos suficientes para comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de investigacion acotado al benchmark LIBERO; no es un modelo de proposito general ni un asistente conversacional.
- No se documentan sesgos, pero al derivar de un VLA entrenado con datos de manipulacion, hereda las limitaciones de dominio de ese dataset.
- Riesgo de alucinacion en el sentido de acciones erroneas o no realistas fuera de la distribucion de entrenamiento; no hay evaluacion publicada que lo cuantifique.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Idiomas y contexto no documentados; no debe tratarse como modelo multilingue.
- La reduccion de profundidad (8 capas frente al teacher) implica una perdida de capacidad no cuantificada en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion externa.
- Los enlaces de busqueda web proporcionados no contienen informacion especifica sobre este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briskVLA/student_8L_late
- Modelo base (teacher): https://huggingface.co/lerobot/smolvla_libero
- LeRobot (libreria): https://github.com/huggingface/lerobot
- Repositorio del proyecto briskvla: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
