# Donghyun1228/pi05-libero-support-probe-source-target-lora01-view-medium-n100000-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de investigacion publicado por el usuario Donghyun1228 dentro de la libreria `openpi`, orientado a robotica y, segun sus etiquetas, a tareas de dinamica inversa (inverse-dynamics) sobre el benchmark LIBERO. El nombre del modelo, `pi05-libero-support-probe-source-target-lora01-view-medium-n100000-1000-20261015`, resume buena parte de su receta: parte de un modelo de la familia pi05, se adapta con 100.000 fotogramas seleccionados (`n100000`), 1.000 actualizaciones (`1000`) y un experto de acciones ajustado con LoRA (`lora01`) bajo una variante de vista `view_medium`.

No es un modelo de lenguaje generalista ni un asistente conversacional. Se trata de un artefacto experimental de vision-lenguaje-accion (VLA) cuyo objetivo es estudiar la sustitucion de datos de sondeo aleatorio por datos de soporte cercano en un esquema de destilacion o adaptacion mediante modelo de dinamica inversa (IDM). La model card describe con detalle la congelacion del LLM, la actualizacion completa del codificador visual y la preservacion de la normalizacion historica y del codificador de muneca del modelo fuente.

Su relevancia es acotada pero clara para quien investiga en robotica de manipulacion: publica evidencia reproducible de una evaluacion con 2.000 ensayos (1.355 exitos, un 67,75 %) sobre 40 tareas de LIBERO, junto con el dataset, el commit del modelo fuente y los detalles exactos de inicializacion y exportacion. El repositorio ocupa 6,9 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; el pipeline `robotics` y la libreria `openpi` indican un modelo vision-lenguaje-accion (VLA) con un LLM congelado, un codificador visual y un experto de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en inferencia (declarado por el autor); no se indican otras cuantizaciones (GGUF, int8, int4, etc.) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el autor no lo especifica; el repositorio ocupa 6,9 GB y se carga con la libreria `openpi`) |

Datos adicionales del repositorio: identificador `Donghyun1228/pi05-libero-support-probe-source-target-lora01-view-medium-n100000-1000-20261015`, 0 descargas, 0 likes, creado el 2026-10-15 y actualizado el mismo dia.

## Arquitectura y entrenamiento

El autor describe una adaptacion en dos etapas. Primero se reentrena un modelo fuente durante 10.000 actualizaciones (`Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015`, commit `e435806e413a90c3b74c9411228a72b53b97060c`). Sobre ese punto de partida se realiza la adaptacion objetivo: 100.000 fotogramas seleccionados, 1.000 actualizaciones, tamano de lote 32 y semilla 42. Durante esta fase el LLM permanece congelado, el modulo de vision se actualiza por completo y el experto de acciones se ajusta con LoRA (`lora01`) aplicando un multiplicador de 0,1 despues de Adam. Se preservan la normalizacion historica y el codificador de muneca correspondiente al modelo fuente.

Un detalle tecnico relevante es el tratamiento de las coordenadas de accion. La perdida del modelo de dinamica inversa excluye la coordenada 6 (la pinza) y promedia las 31 coordenadas de accion restantes con relleno. En cambio, las entradas y salidas de la politica, asi como el control de la pinza durante la evaluacion, conservan las siete coordenadas del robot. El checkpoint exportado corresponde al paso bruto 999, con inferencia en BF16, y la evaluacion se ejecuto sobre MuJoCo 3.2.3. El identificador incluye el sufijo `pi05`, coherente con la familia pi0.5 distribuida a traves de `openpi`, aunque el autor no detalla el numero de parametros ni la configuracion del backbone.

## Capacidades

- Control robotico de manipulacion: el modelo produce acciones de robot (siete coordenadas, incluida la pinza) a partir de observaciones visuales, segun se deduce del pipeline, las etiquetas y el control de pinza descrito en la model card.
- Dinamica inversa (IDM): predice acciones a partir de transiciones, con una perdida especifica que excluye la coordenada de pinza y promedia las 31 coordenadas restantes.
- Percepcion visual con multiples vistas: la variante se etiqueta como `view-medium`, lo que indica entrenamiento o evaluacion con un regimen de camaras concreto; el modelo conserva un codificador de muneca entrenado.
- Ejecucion en simulacion: la evaluacion documentada se realizo con MuJoCo 3.2.3 sobre tareas de LIBERO.
- Ajuste eficiente: el experto de acciones admite adaptacion mediante LoRA, lo que permite reentrenar sobre un modelo fuente congelado.
- Generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, audio o modo de pensamiento: no disponible; no se documenta ninguna de estas capacidades.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en aprendizaje por imitacion para robotica: el checkpoint sirve como punto de partida reproducible para estudiar como afecta la seleccion de datos de sondeo (aleatorio frente a soporte cercano) al rendimiento de una politica VLA en LIBERO.
- Reproduccion de experimentos de dinamica inversa: el repositorio incluye la semilla, el numero de actualizaciones, el tamano de lote y la evidencia de exportacion, lo que permite replicar la comparacion entre el modelo fuente y la variante adaptada.
- Evaluacion comparativa de estrategias de congelacion: al mantener el LLM congelado y actualizar por completo la vision, es util para medir el impacto de cada componente en la tasa de exito final.
- Ajuste eficiente con LoRA sobre politicas roboticas: el esquema `lora01` con multiplicador posterior a Adam de 0,1 sirve de referencia para equipos que quieran adaptar un modelo de acciones con recursos limitados.
- Generacion de datos sinteticos o etiquetado de trayectorias: el componente IDM puede emplearse para etiquetar transiciones con acciones estimadas dentro de un pipeline de robotica, siempre que se respete la convencion de siete coordenadas del autor.
- Banco de pruebas para infraestructura de evaluacion distribuida: la evaluacion documentada uso ocho clientes por GPU con una secuencia de aleatoriedad compartida en el servidor, un patron util para montar evaluaciones a gran escala (2.000 ensayos) de forma determinista.
- No se documentan casos de uso fuera del ambito de la robotica de manipulacion en simulacion.

## Benchmarks y rendimiento

| Evaluacion | Configuracion | Resultado |
|---|---|---|
| LIBERO (40 tareas, 50 ensayos por tarea, semilla 7) | Ocho clientes por GPU, aleatoriedad de politica con flujo compartido en servidor | 1355/2000 exitos (67,75 %) |

No se publican en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), ni la comparacion con el checkpoint fuente en la misma evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor solo indica que la inferencia se realiza en BF16 y que el repositorio ocupa 6,9 GB, sin detallar el numero de parametros ni el consumo de memoria.
- GPU recomendadas: no disponible. No se especifica el hardware empleado, mas alla de que la evaluacion se distribuyo con ocho clientes por GPU.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse sin conocer el tamano real del modelo y su requisito de memoria.
- Opciones de despliegue: la libreria declarada es `openpi`. El entorno de evaluacion utiliza MuJoCo 3.2.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...target-lora01-view-medium-n100000-1000...`) | no disponible | no disponible | 1355/2000 exitos en LIBERO (40 tareas, 50 ensayos/tarea, semilla 7) | apache-2.0 | HuggingFace, 0 descargas |
| Modelo fuente (`Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015`) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace (commit `e435806e413a90c3b74c9411228a72b53b97060c`) |
| Otras variantes de la familia pi05 / openpi | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada que permitan una comparacion cuantitativa con alternativas como pi0, pi0.5 de referencia o GR00T N1.

## Limitaciones y advertencias

- Ambito restringido: es un checkpoint de investigacion para manipulacion robotica en simulacion (MuJoCo 3.2.3, LIBERO). No es un modelo de lenguaje ni un asistente de proposito general.
- Ausencia de documentacion basica: no se publican numero de parametros, longitud de contexto, idiomas, formato de pesos ni requisitos de hardware, lo que dificulta planificar su despliegue.
- Riesgo de sobreajuste al benchmark: los resultados se limitan a 40 tareas de LIBERO con una unica semilla de evaluacion (semilla 7); no hay evidencia de generalizacion a entornos reales ni a otras suites.
- Metrica sensible a la configuracion: la aleatoriedad de la politica depende de un flujo compartido en el servidor y la evaluacion se reparte entre ocho clientes por GPU, por lo que variaciones de infraestructura pueden alterar los resultados.
- Convencion de acciones particular: la perdida del IDM ignora la coordenada 6 (pinza) y promedia 31 coordenadas con relleno, mientras que la politica mantiene las siete coordenadas. Reutilizar el modelo fuera de ese esquema exige respetar la convencion.
- Sesgos conocidos: no disponible; el autor no documenta analisis de sesgo.
- Riesgo de alucinacion: no disponible en el sentido de generacion de texto; en robotica el equivalente seria la generacion de acciones no validas, y no se cuantifica en la informacion proporcionada.
- Licencia: Apache 2.0, que permite uso comercial, pero el modelo depende de la libreria `openpi` y de pesos derivados de un modelo fuente cuyas condiciones no se detallan en la informacion disponible; conviene verificar la cadena de licencias antes de un uso en produccion.
- Madurez: 0 descargas y 0 likes, publicacion de un unico dia, sin mantenimiento posterior documentado.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-target-lora01-view-medium-n100000-1000-20261015
- Modelo fuente citado en la model card: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015 (commit `e435806e413a90c3b74c9411228a72b53b97060c`)
- Dataset citado: `Donghyun1228/libero-support-random-waypoint-300k-20261015` (commit `32ed215baf01af7e82f927a62b108873aa70bd19`); no se proporciona URL directa en la informacion disponible
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
