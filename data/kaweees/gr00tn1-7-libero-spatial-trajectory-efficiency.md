# kaweees/gr00tn1.7-libero-spatial-trajectory-efficiency

## Resumen

Se trata de un ajuste fino de NVIDIA GR00T N1.7 en su variante de 3B, publicado por el usuario kaweees, cuyo objetivo no es ofrecer un modelo de proposito general sino documentar un experimento controlado de eficiencia de datos sobre la suite LIBERO Spatial. El repositorio contiene exclusivamente checkpoints de politicas de manipulacion robotica obtenidos a partir de bases oficiales de NVIDIA fijadas por revision.

El diseno experimental emplea cinco presupuestos de trayectorias de demostracion (5, 10, 15, 25 y 50), semilla 42 y subconjuntos anidados identicos entre versiones. La evaluacion consiste en 20 rollouts de la tarea 0 de LIBERO Spatial por epoca, con parada temprana cuando dos epocas consecutivas no mejoran estrictamente el mejor recuento de exitos; los empates cuentan como no mejora y no existe tope fijo de epocas.

Es relevante porque cuantifica de forma empirica cuanto dato de demostracion necesita un modelo vision-lenguaje-accion de 3B para una tarea de manipulacion espacial: con 25 trayectorias alcanza 14 exitos sobre 20 en 12 epocas, con 50 baja a 6 sobre 20 en 5 epocas, y con 5 y 10 trayectorias no supera 0 sobre 20. El repositorio ocupa 339,6 GB y no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; el modelo es un ajuste fino de nvidia/GR00T-N1.7-3B, un modelo fundacional vision-lenguaje-accion para robotica (categoria inferida de la identidad del modelo base, no detallada en la model card) |
| Parametros totales | 3 000 millones aproximados, segun la denominacion del modelo base (nvidia/GR00T-N1.7-3B); no confirmado en la model card |
| Parametros activos | no aplica o no disponible; la informacion proporcionada no indica que sea un modelo de mezcla de expertos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se publican en precision completa o mixta sin cuantizaciones documentadas |
| Idiomas soportados | no disponible; la model card y los manifiestos estan redactados en ingles |
| Licencia | no disponible; la model card no especifica licencia, por lo que se aplicara la del modelo base de NVIDIA |
| Formato de pesos | safetensors, acompanados de configuraciones, procesadores, estadisticas de normalizacion de Spatial, mapeos de embodiment, codigo de runtime, manifiestos de entrenamiento, evaluaciones y verificacion de carga offline; se excluye el estado del optimizador |
| Tipo de modelo | ajuste fino de politica robotica (no es un modelo conversacional) |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Tamano del repositorio | 339,6 GB |
| Version evaluada | tarea 0 de LIBERO Spatial, 20 rollouts por epoca |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni su composicion. Lo unico verificable es que todos los entrenamientos parten de bases oficiales de NVIDIA fijadas por revision (pinned), con subconjuntos de datos anidados e identicos entre versiones, semilla 42 y cinco presupuestos de trayectorias. Cada ejecucion parte del mismo punto de inicio, de modo que las diferencias observadas son atribuibles al numero de trayectorias y a la dinamica de entrenamiento, no a variaciones del conjunto de datos. No hay informacion sobre volumen de tokens, composicion del dataset, ni sobre el uso de RLHF, DPO u otras fases de alineamiento.

El protocolo de entrenamiento define que cada epoca recibe 20 rollouts de la tarea 0 de LIBERO Spatial y que la ejecucion se detiene cuando dos epocas consecutivas no mejoran estrictamente el mejor recuento de exitos. Las carpetas de checkpoint siguen el patron `n1.7/trajectories-NNN/epoch-EEE/` e incluyen pesos, configuraciones, procesadores, estadisticas de normalizacion, mapeos de embodiment, codigo de runtime, manifiestos de entrenamiento, evaluaciones y una verificacion independiente de carga offline. Las ejecuciones completadas se conservan y se omiten en relanzamientos. El estado del optimizador no se publica, por lo que los checkpoints sirven para inferencia y evaluacion, no para reanudar el entrenamiento.

Un detalle de trazabilidad relevante: los artefactos previos al experimento y su historial de repositorio se eliminaron a peticion del propietario. El archivo `history_cleanup.json` mapea los checkpoints antiguos a la revision conservada con hashes de artefacto identicos, de modo que las recepciones de verificacion originales siguen siendo auditables.

## Capacidades

- Generacion de acciones motoras (trayectorias) condicionadas por observaciones visuales e instrucciones de tarea, en el marco del ajuste fino sobre LIBERO Spatial.
- Ejecucion de tareas de manipulacion espacial en el entorno de simulacion LIBERO, evaluada especificamente sobre la tarea 0.
- Carga offline verificada: cada checkpoint incluye procesadores, estadisticas de normalizacion y mapeos de embodiment, ademas del codigo de runtime necesario para reconstruir el pipeline de inferencia.
- Reproducibilidad experimental: subconjuntos anidados, semilla fija y bases oficiales fijadas por revision permiten repetir el barrido de presupuestos de trayectorias.
- Soporte de tool calling o function calling: no disponible; no aplica a un modelo de politica robotica.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): la evaluacion documentada solo cubre el control visomotor sobre LIBERO Spatial; no hay evidencia publicada sobre otras capacidades.

## Casos de uso

- Estudio de eficiencia de datos en aprendizaje por imitacion: el repositorio permite trazar la curva de exito frente al numero de trayectorias (0/20 con 5 y 10, 14/20 con 25, 6/20 con 50) y decidir el presupuesto minimo de demostraciones para una tarea espacial concreta.
- Diseno de curricula de recogida de datos: los subconjuntos anidados permiten aislar el efecto de anadir trayectorias sin cambiar la semilla ni la base, lo que sirve para justificar inversiones en teleoperacion o generacion sintetica de datos.
- Linea base para comparativas de metodos de ajuste fino: al publicar pesos, manifiestos y evaluaciones junto a cada checkpoint, se puede usar como referencia reproducible frente a otras tecnicas de adaptacion de bajo coste.
- Validacion de pipelines de evaluacion robotica: los checkpoints incluyen verificacion de carga offline, por lo que son utiles para comprobar que un entorno de simulacion y su runtime reconstruyen correctamente el contrato de observaciones y acciones.
- Investigacion sobre criterios de parada temprana: el protocolo de dos epocas sin mejora estricta y los resultados no monotonos (25 mejor que 50) permiten estudiar hasta que punto el numero de rollouts de evaluacion (20 por epoca) es suficiente para seleccionar checkpoint.
- Formacion y docencia en robotica: el repositorio es un ejemplo completo de estructura de experimento, con manifiestos, evaluaciones y script de reconciliacion de historial, apropiado para explicar como se documenta un ajuste fino de un modelo fundacional de robotica.
- Pruebas de integracion de infraestructura: con 339,6 GB de checkpoints, el repositorio sirve para ensayar estrategias de almacenamiento, descarga selectiva por subcarpeta y cacheo en disco antes de escalar a colecciones mayores.

## Benchmarks y rendimiento

Los unicos resultados publicados son los del barrido de presupuestos de trayectorias sobre la tarea 0 de LIBERO Spatial, con 20 rollouts por epoca:

| Trayectorias | Estado | Epocas verificadas | Mejor recuento de exitos en tarea 0 (sobre 20) |
|---:|---|---:|---:|
| 5 | Completo | 3 | 0 |
| 10 | Completo | 3 | 0 |
| 15 | En cola | 0 | — |
| 25 | Completo | 12 | 14 |
| 50 | Completo | 5 | 6 |

Advertencias sobre estos datos: se trata de una unica tarea (tarea 0), de un unico entorno (LIBERO Spatial) y de una unica semilla, con 20 rollouts por epoca, por lo que no hay intervalos de confianza ni estimacion de varianza. El resultado no es monotono en el presupuesto de trayectorias (25 supera a 50), lo que sugiere que el numero de rollouts de evaluacion y la varianza del entrenamiento pueden dominar las diferencias observadas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de la suite completa de LIBERO en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia aritmetica orientativa para 3 000 millones de parametros, en bfloat16 o float16 el peso puro ronda los 6 GB y en float32 unos 12 GB, a lo que habria que sumar el coste del encoder visual, los procesadores y las estadisticas de normalizacion; estas cifras son calculos a partir del tamano del modelo base, no datos publicados.
- GPU recomendadas: no disponible; la model card no documenta el hardware empleado ni el recomendado.
- Compatibilidad con GPU de consumo: no disponible. No se especifica si el modelo cabe en tarjetas de 12, 16 o 24 GB, ni con que precision.
- Opciones de despliegue: el repositorio incluye codigo de runtime dentro de las carpetas de checkpoint, con verificacion de carga offline. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con otras herramientas de servido, lo cual es esperable en un modelo de politica con cabeza de acciones.
- Latencia y throughput: no disponibles.
- Almacenamiento: los checkpoints publicados suman 339,6 GB, por lo que la descarga selectiva por subcarpeta (`trajectories-005`, `trajectories-010`, etc.) es practicamente obligatoria en estaciones de trabajo.
- Requisitos de entrenamiento: no disponibles; no se publica el estado del optimizador ni la configuracion de memoria del entrenamiento distribuido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaweees/gr00tn1.7-libero-spatial-trajectory-efficiency | 3 000 millones aproximados (heredados del base) | no disponible | 14/20 exitos en la tarea 0 de LIBERO Spatial con 25 trayectorias, 12 epocas | no disponible | pesos safetensors en HuggingFace, 339,6 GB, 0 descargas |
| nvidia/GR00T-N1.7-3B (modelo base) | 3 000 millones segun denominacion | no disponible | no disponible en la informacion proporcionada | la de NVIDIA, no verificada aqui | modelo oficial de NVIDIA en HuggingFace |
| Otros ajustes de GR00T N1.7 para LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parametros, contexto, rendimiento ni licencia de alternativas comparables dentro de la informacion proporcionada, por lo que la comparativa cuantitativa con modelos como OpenVLA, pi0 u otros VLA de la misma categoria no puede completarse sin inventar cifras.

## Limitaciones y advertencias

- Rendimiento nulo con pocos datos: con 5 y 10 trayectorias el mejor recuento de exitos es 0 sobre 20 en 3 epocas. Estos checkpoints no son utilizables como politica.
- Resultado no monotono: 25 trayectorias superan a 50 (14/20 frente a 6/20), lo que indica alta varianza y desaconseja extraer conclusiones de escalado con los datos publicados.
- Evaluacion muy acotada: todas las cifras corresponden a la tarea 0 de LIBERO Spatial, no a la suite completa ni a otros entornos, y no hay datos en robot real.
- Ausencia de intervalos de confianza: 20 rollouts por epoca y una unica semilla impiden estimar la incertidumbre de las diferencias observadas.
- Sin informacion de licencia: la model card no declara licencia, por lo que el uso comercial queda sujeto a la licencia del modelo base de NVIDIA y debe verificarse antes de cualquier despliegue.
- Riesgo de fallo de politica: en modelos de accion no aplica la alucinacion textual, pero si el fallo silencioso de la politica, la perdida de consistencia ante observaciones fuera de distribucion y el sobreajuste a las condiciones de la simulacion.
- Sin estado del optimizador: los checkpoints no permiten reanudar el entrenamiento, solo inferencia, evaluacion o ajuste posterior.
- Repositorio eliminado parcialmente: los artefactos previos al experimento y su historial se borraron a peticion del propietario; la trazabilidad depende del mapeo de `history_cleanup.json`.
- Coste de almacenamiento: 339,6 GB de checkpoints, con varias copias por presupuesto de trayectorias.
- Ejecucion incompleta: el presupuesto de 15 trayectorias figura como en cola, con 0 epocas verificadas, por lo que la curva publicada tiene un hueco.
- Sin sesgos documentados: no hay analisis de sesgo demografico, linguistico o de generalizacion a objetos, texturas o iluminaciones distintas de las de LIBERO Spatial.
- Trazabilidad externa nula: la busqueda web no devolvio documentacion tecnica relevante sobre este modelo, y el repositorio no registra descargas ni valoraciones, de modo que no existe validacion independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kaweees/gr00tn1.7-libero-spatial-trajectory-efficiency
- Checkpoint con 5 trayectorias: https://huggingface.co/kaweees/gr00tn1.7-libero-spatial-trajectory-efficiency/tree/main/n1.7/trajectories-005
- Checkpoint con 10 trayectorias: https://huggingface.co/kaweees/gr00tn1.7-libero-spatial-trajectory-efficiency/tree/main/n1.7/trajectories-010
- Checkpoint con 15 trayectorias: https://huggingface.co/kaweees/gr00tn1.7-libero-spatial-trajectory-efficiency/tree/main/n1.7/trajectories-015
- Checkpoint con 25 trayectorias: https://huggingface.co/kaweees/gr00tn1.7-libero-spatial-trajectory-efficiency/tree/main/n1.7/trajectories-025
- Checkpoint con 50 trayectorias: https://huggingface.co/kaweees/gr00tn1.7-libero-spatial-trajectory-efficiency/tree/main/n1.7/trajectories-050
- Mapeo de reconciliacion de historial: https://huggingface.co/kaweees/gr00tn1.7-libero-spatial-trajectory-efficiency/blob/main/history_cleanup.json
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B

No se han encontrado en la busqueda web enlaces adicionales utiles (papers, blogs, repositorios o demos) relacionados con este modelo; los resultados devueltos no guardaban ninguna relacion con el modelo ni con robotica.
