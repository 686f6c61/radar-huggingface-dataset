# snupilab/theta-bench-dreamzero5b-real-g1-91

## Resumen

snupilab/theta-bench-dreamzero5b-real-g1-91 es un repositorio de resultado de entrenamiento del pipeline THETA Bench, publicado por snupilab, que documenta la etapa de entrenamiento adicional sobre hardware real para el robot denominado G1 en la model card. Segun el propio autor, esta etapa de entrenamiento no ha comenzado y no hay ningun checkpoint entrenado disponible en el repositorio: se trata de un contenedor de resultados con la configuracion fijada, no de un modelo descargable.

El modelo parte de snupilab/theta-bench-dreamzero5b-sim-3003, un punto de partida ya entrenado durante 40.000 actualizaciones en simulacion, sobre el que se planifican 5.000 actualizaciones adicionales usando 91 demostraciones reales de teleoperacion. El objetivo declarado es el ajuste sim-to-real de una politica robotica sobre cuatro condiciones concretas: StickMove y HookRetrieve, cada una en variante Standard y variante Reasoning, con grabaciones a 20 Hz y acciones de tipo joint-target.

Su relevancia es metodologica mas que de rendimiento: publica de forma reproducible los hiperparametros de una etapa de ajuste real con pocas demostraciones (91), la revision exacta del dataset mediante hash y la advertencia de que se requiere el adaptador de control real del G1, sin que quepa asumir compatibilidad con el adaptador de simulacion. No se documentan arquitectura interna, numero de parametros, contexto ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se distribuye como adaptador nativo THETA; la model card indica que no se debe asumir compatibilidad con cargadores genericos de Transformers ni con cargadores de simulacion) |
| Parametros totales | no disponible (la nomenclatura "5B" del nombre del modelo sugiere del orden de 5.000 millones, sin confirmacion del autor) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (adaptador nativo THETA; no se publica checkpoint en este repositorio) |
| Tarea | manipulacion robotica: StickMove y HookRetrieve, en variantes Standard y Reasoning |
| Frecuencia de las grabaciones | 20 Hz |
| Tipo de acciones | joint-target, ejecutadas por hardware |
| Hardware objetivo | robot G1 con su adaptador de control real correspondiente |
| Estado del repositorio | sin checkpoint: el entrenamiento no ha comenzado |
| Dataset asociado | snupilab/theta-bench-teleop (revision 47eca9322bb53fa1c685363271a87d2e414cb0e8) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: no se especifica si se trata de un transformer, de una politica de difusion, de un modelo vision-lenguaje-accion o de otra formulacion. Lo unico documentado es el mecanismo de distribucion y ejecucion, que pasa por un adaptador nativo THETA y por dependencias especificas del modelo, con la advertencia explicita de que no se reclama compatibilidad con Transformers generico ni con cargadores de simulacion. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, algo esperable en una politica robotica de imitacion mas que en un modelo de lenguaje.

Lo que si se publica con detalle es la configuracion del entrenamiento planificado. La inicializacion se hace desde snupilab/theta-bench-dreamzero5b-sim-3003 tras 40.000 actualizaciones de simulacion, y a continuacion se planifican 5.000 nuevas actualizaciones con las 91 demostraciones reales del G1. Las cuatro condiciones reales son StickMove Standard, StickMove Reasoning, HookRetrieve Standard y HookRetrieve Reasoning. El entrenamiento usa optimizadores de modelo independientes y ejecucion compartida de GPU mediante MPS, con un uploader en CPU que publica tras la validacion final del checkpoint.

| Ajuste de entrenamiento | Valor |
|---|---|
| Etapa | Entrenamiento adicional real en G1, 91 demostraciones |
| Actualizaciones objetivo del optimizador | 5000 |
| Batch por GPU / GPUs / batch global | 16 / 8 / 128 |
| Acumulacion de gradiente | 1 |
| Condiciones por batch global | 4 |
| Inicializacion | dreamzero5b-sim-3003 tras 40.000 actualizaciones de simulacion |
| Revision del dataset | 47eca9322bb53fa1c685363271a87d2e414cb0e8 |
| Ejecucion | MPS con optimizadores independientes; publicacion mediante uploader en CPU |

## Capacidades

- Control robotico por imitacion sobre cuatro condiciones definidas: StickMove Standard, StickMove Reasoning, HookRetrieve Standard y HookRetrieve Reasoning.
- Condicionamiento por modo: la existencia de variantes Standard y Reasoning sugiere que el modelo acepta una señal de condicionamiento que distingue ejecucion directa de ejecucion con razonamiento, aunque el formato exacto de esa señal no se documenta.
- Emision de acciones joint-target ejecutables por hardware, siempre que se disponga del adaptador de control real del G1 correspondiente.
- Operacion a 20 Hz, coherente con el ritmo de grabacion de las demostraciones del dataset de teleoperacion.
- Transferencia sim-to-real: el punto de partida es un modelo entrenado en simulacion durante 40.000 actualizaciones.
- Idiomas: unicamente ingles declarado. No es un modelo de proposito general y no se documentan capacidades de generacion de texto, codigo, matematicas o vision.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible mas alla de la variante Reasoning de las condiciones de la tarea.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Estado actual: al no existir checkpoint, ninguna de estas capacidades es verificable en la practica.

## Casos de uso

- Ajuste sim-to-real con pocas demostraciones: el repositorio documenta la receta exacta para pasar de una politica entrenada en simulacion a una ajustada con 91 demostraciones reales; un laboratorio puede replicar esa receta sobre su propio robot G1 y su propio conjunto de teleoperacion.
- Reproduccion de experimentos de THETA Bench: la revision del dataset esta fijada por hash y los hiperparametros estan publicados, lo que permite reproducir la etapa de forma auditable y comparar resultados entre ejecuciones.
- Manipulacion de tipo StickMove: entrenamiento y evaluacion de una politica que mueve un objeto alargado; la variante Standard sirve de linea base y la variante Reasoning permite estudiar si el condicionamiento explicito mejora la tarea.
- Manipulacion de tipo HookRetrieve: enganchar y recuperar un objeto, una tarea con contacto fisico y tolerancia estrecha, util para medir la robustez del ajuste con demostraciones reales.
- Comparativa Standard frente a Reasoning: al entrenar ambas variantes con la misma configuracion y el mismo batch global de cuatro condiciones, permite aislar el efecto del condicionamiento por razonamiento en el mismo presupuesto de actualizaciones.
- Validacion de adaptadores de control: la model card advierte que el adaptador de simulacion no debe asumirse compatible con el hardware real; este repositorio sirve como caso de prueba para verificar que el adaptador real del G1 ejecuta correctamente las acciones joint-target.
- Recogida y ampliacion de datos de teleoperacion: a partir del dataset snupilab/theta-bench-teleop, un equipo puede anadir demostraciones y repetir la etapa de 5.000 actualizaciones para medir el retorno marginal de cada lote adicional de datos.
- Infraestructura de entrenamiento multi-GPU: la configuracion con 8 GPU, batch por GPU de 16, batch global de 128 y ejecucion compartida por MPS sirve como referencia para dimensionar clústeres de entrenamiento de politicas roboticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que la publicacion del checkpoint no reclama ninguna puntuacion de evaluacion ("No evaluation score is claimed by checkpoint publication"), y ademas el entrenamiento no ha comenzado y no existe checkpoint.

| Benchmark | Resultado |
|---|---|
| StickMove Standard | no disponible |
| StickMove Reasoning | no disponible |
| HookRetrieve Standard | no disponible |
| HookRetrieve Reasoning | no disponible |
| Cualquier otro benchmark (MMLU, HumanEval, GSM8K, etc.) | no aplicable: no es un modelo de lenguaje |

## Requisitos de hardware

- Entrenamiento: 8 GPU con batch por GPU de 16 y batch global de 128, acumulacion de gradiente 1 y ejecucion compartida mediante MPS. No se especifica el modelo de GPU ni la VRAM utilizada.
- Inferencia: no disponible. La model card no publica requisitos de memoria ni de computo para inferencia.
- Estimacion orientativa, no confirmada por el autor: si el nombre "5B" corresponde realmente a unos 5.000 millones de parametros, la inferencia en FP16 requeriria del orden de 10-12 GB de VRAM, en INT8 alrededor de 6 GB y en INT4 alrededor de 3-4 GB, antes de contar activaciones y buffers. Se trata de una extrapolacion por tamano, no de un dato del repositorio.
- GPU consumer: no disponible. No hay confirmacion de que el modelo quepa en una GPU de consumo; la viabilidad depende de la arquitectura real, que no se documenta.
- Restriccion de despliegue especifica: el modelo requiere el robot G1 con su adaptador de control real. No se puede asumir compatibilidad con el adaptador de simulacion.
- Opciones de despliegue: no disponible. La model card descarta explicitamente asumir compatibilidad con Transformers generico o con cargadores de simulacion, y no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifra publicada. Como referencia derivada, la frecuencia de 20 Hz implica un presupuesto de 50 ms por paso de control.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card no incluye comparaciones con otras politicas roboticas, y los resultados de la busqueda web no contienen informacion tecnica relevante sobre modelos de esta categoria. Los modelos de referencia habituales en el ambito de politicas roboticas entrenadas por imitacion serian candidatos naturales a la comparacion, pero no se dispone de sus especificaciones en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theta-bench-dreamzero5b-real-g1-91 | no disponible | no disponible | no disponible | no disponible | sin checkpoint publicado |
| Alternativas de politica robotica por imitacion (categoria general) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de la familia dreamzero5b-sim | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay checkpoint: el entrenamiento no ha comenzado y el repositorio no contiene pesos entrenados. No es utilizable para inferencia ni para evaluacion en su estado actual.
- Licencia no disponible: sin una licencia explicita no puede asumirse ningun permiso de uso, incluido el uso comercial. Es un riesgo legal relevante para cualquier despliegue en produccion.
- Compatibilidad restringida: requiere el adaptador nativo THETA y dependencias especificas del modelo; no se reclama compatibilidad con Transformers generico ni con cargadores de simulacion.
- Riesgo de adaptador incorrecto en hardware real: el adaptador de simulacion no debe asumirse compatible con el G1 real. Ejecutar acciones joint-target con el adaptador equivocado puede provocar movimientos no deseados en un sistema fisico.
- Riesgo fisico mas que riesgo de alucinacion textual: al tratarse de una politica de control, los fallos se traducen en acciones erroneas sobre hardware. Es imprescindible disponer de parada de emergencia y limites de seguridad en la ejecucion.
- Sesgo y sobreajuste esperables: el ajuste real se realiza con solo 91 demostraciones y cuatro condiciones, recogidas en un entorno y con un operador concretos. Es previsible un ajuste estrecho a esas condiciones y una generalizacion limitada a objetos, posiciones o iluminaciones distintas.
- Sesgos demograficos, culturales o linguisticos: no documentados, y en principio no aplicables a una politica de manipulacion; si el pipeline incorpora un componente de lenguaje, sus sesgos no estan descritos.
- Limitacion idiomatica: solo se declara ingles. No hay evidencia de soporte para instrucciones en castellano u otros idiomas.
- Ausencia de evaluacion: el autor no reclama ninguna puntuacion. Cualquier cifra de rendimiento atribuida a este repositorio seria especulativa.
- Dependencia de la revision del dataset: la reproducibilidad queda ligada al hash 47eca9322bb53fa1c685363271a87d2e414cb0e8; cambios posteriores en el dataset pueden invalidar la comparacion con futuras ejecuciones.
- Fecha de publicacion futura respecto al momento de redaccion de esta ficha (13 de septiembre de 2026), lo que refuerza que se trata de un artefacto de planificacion y no de un modelo consolidado.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/snupilab/theta-bench-dreamzero5b-real-g1-91
- Modelo base (inicializacion): https://huggingface.co/snupilab/theta-bench-dreamzero5b-sim-3003
- Dataset de teleoperacion: https://huggingface.co/datasets/snupilab/theta-bench-teleop
- Datos de entrenamiento fijados por revision: https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/47eca9322bb53fa1c685363271a87d2e414cb0e8/hardware
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a servicios de alojamiento de servidores de Minecraft y no guardan relacion con el modelo).
