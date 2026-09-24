# Shiki42/q4a-scan-object-sequential-pi05-e697-step10000

## Resumen

E697 Scan Object Sequential PI0.5 es un checkpoint de inferencia para robotica publicado por el usuario Shiki42 en Hugging Face. Se trata de una politica vision-lenguaje-accion (VLA) derivada del stack pi0.5, tal y como indican las etiquetas del repositorio (`pi05`, `robotwin`, `scan-object`, `sequential`). El checkpoint proviene del experimento CTR E697, run formal E697-R001, en el paso de entrenamiento 10000, y esta pensado exclusivamente para inferencia: el repositorio incluye los parametros y los assets necesarios, pero excluye el estado del optimizador y del cargador de datos.

La tarea objetivo es la manipulacion robotica dentro del entorno RoboTwin, en concreto una variante "scan-object sequential" sobre un brazo bimanual Q4-A. Los datos de entrenamiento corresponden al brazo Q4-A Sequential con episodios repartidos a partes iguales entre orden izquierda-primero y derecha-primero, y con la funcionalidad IdleMask desactivada. El checkpoint esta fijado a revisiones concretas del dataset y del codigo fuente de CTR y OpenPI, y el payload publicado esta vinculado mediante un fichero `SHA256SUMS`.

Su relevancia es acotada pero clara: sirve como punto de reproducibilidad para el experimento E697, como baseline de politica bimanual en RoboTwin y como punto de partida para ajuste fino con datos propios. La evaluacion independiente E720 reporto 62 exitos sobre 100 escenas congeladas, con auditoria pendiente en el momento de redactar esta ficha. No se detalla la arquitectura interna, el numero de parametros, la licencia ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como `pi05`; el autor no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no incluye licencia) |
| Formato de pesos | no disponible (el repositorio contiene "parametros de inferencia y assets", 6,3 GB, con `SHA256SUMS`) |

Metadatos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Identificador | Shiki42/q4a-scan-object-sequential-pi05-e697-step10000 |
| Pipeline declarado | robotics |
| Tamano del repositorio | 6,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |
| Revision del dataset de entrenamiento | `1b24730ebff0ea3f91652a3806620fb682f413b0` |
| Commit de CTR | `40322ccb58a7cf20714f680c439fbb3248648efe` |
| Commit de OpenPI | `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead` |
| SHA-256 de normalizacion | `c52e2ec3795214b360821ad7c417297a1ab0b8b684a26fe1e9de55d072260b0d` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo. Las unicas pistas disponibles son las etiquetas (`pi05`) y la referencia explicita al commit de OpenPI `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead`, lo que situa el checkpoint dentro del ecosistema OpenPI y sugiere una politica VLA de tipo pi0.5. No se especifica el numero de parametros, la composicion exacta del transformer o del modulo de accion, ni la estrategia de atencion o de decodificacion utilizada.

En cuanto al entrenamiento, los datos son el brazo Q4-A Sequential con episodios equilibrados entre orden izquierda-primero y derecha-primero, y con IdleMask desactivada. El checkpoint corresponde al paso 10000 del run E697-R001, que finalizo con codigo de salida 0 y con un recibo de verificacion del checkpoint. Las revisiones del dataset y de los codigos fuente estan fijadas por hash de commit, y la normalizacion de entrenamiento se identifica con un SHA-256; la model card indica que deben usarse los assets incluidos sin modificaciones para la inferencia. No se indica el numero de tokens o de episodios consumidos, ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

## Capacidades

- Control robotico para la tarea "scan-object sequential" sobre un brazo Q4-A con configuracion bimanual.
- Ejecucion de la misma tarea en dos ordenes distintos (izquierda-primero y derecha-primero), gracias al entrenamiento equilibrado entre ambos.
- Inferencia a partir de los assets incluidos en el repositorio, sin necesidad del estado de entrenamiento.
- Punto de partida para ajuste fino con datos propios del mismo dominio (brazo Q4-A, RoboTwin).
- Soporte de tool calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible. Por la naturaleza del pipeline (`robotics`) cabe esperar entrada visual, pero el autor no lo documenta.

## Casos de uso

- Reproduccion del experimento E697-R001: el checkpoint esta vinculado a un paso concreto (10000) y a revisiones fijas de dataset y codigo, lo que permite reproducir la evaluacion declarada sin ambiguedad sobre la version utilizada.
- Evaluacion en simulacion RoboTwin: el modelo esta entrenado para la tarea scan-object sequential en ese entorno, por lo que puede usarse como politica evaluada en escenas congeladas, como ya se hizo en la evaluacion E720 con 100 escenas.
- Baseline para comparativas de politicas bimanuales: al estar equilibrado entre orden izquierda-primero y derecha-primero, sirve como referencia para medir el efecto del orden de ejecucion en la tasa de exito.
- Fine-tuning con datos propios: el repositorio incluye unicamente parametros de inferencia y assets, lo que lo convierte en un punto de partida limpio para reentrenar o adaptar la politica a un brazo o una tarea distinta.
- Estudio de ablaciones sobre IdleMask: al declararse IdleMask desactivado, el checkpoint funciona como condicion de control frente a variantes del mismo experimento con la funcionalidad activa.
- Validacion de pipelines de despliegue OpenPI: la referencia al commit exacto de OpenPI permite comprobar la compatibilidad del checkpoint con una version concreta del stack de inferencia antes de integrarlo en un entorno mayor.
- Pruebas de robustez y de generalizacion: las 100 escenas congeladas de E720 y el 62/100 de exito permiten definir un protocolo repetible para medir degradacion ante variaciones de escena.
- Analisis de fallos en manipulacion bimanual: con una tasa de fallo cercana al 38 % en la evaluacion reportada, el checkpoint es util para caracterizar los modos de fallo de la politica en tareas de barrido secuencial.

## Benchmarks y rendimiento

| Evaluacion | Metrica | Resultado | Notas |
|---|---|---|---|
| E720 (evaluacion independiente) | Tasa de exito | 62/100 | 100 escenas congeladas; auditoria pendiente |
| E697-R001 (cualificacion) | Codigo de salida | 0 | Incluye recibo de verificacion del checkpoint en el paso 10000 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Al tratarse de un checkpoint de robotica y no de un modelo de lenguaje, esos benchmarks no serian aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El payload del repositorio es de 6,3 GB e incluye parametros de inferencia y assets, por lo que la VRAM necesaria sera como minimo del orden del tamano de los pesos mas el overhead de activaciones; no se especifica la precision de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Un payload de 6,3 GB sugiere que podria caber en GPU de consumo con suficiente VRAM si los pesos no se cargan en precision completa, pero esto no esta confirmado por el autor.
- Opciones de despliegue: el checkpoint esta vinculado al commit de OpenPI `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead`, por lo que el despliegue previsto es a traves del stack OpenPI. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no son aplicables a una politica robotica).
- Latencia y throughput: no disponible.
- Requisito de assets: la model card indica que deben usarse los assets incluidos sin modificar para la inferencia, junto con la normalizacion de SHA-256 `c52e2ec3795214b360821ad7c417297a1ab0b8b684a26fe1e9de55d072260b0d`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E697 Scan Object Sequential PI0.5 (step 10000) | no disponible | no disponible | 62/100 en E720 (auditoria pendiente) | no disponible | Hugging Face, 0 descargas |
| pi0.5 base (OpenPI) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otros checkpoints del mismo experimento CTR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables en la informacion proporcionada. La comparacion natural seria contra el modelo base pi0.5 y contra otras variantes del experimento E697 (por ejemplo, con IdleMask activo o con distinto reparto de orden izquierda/derecha), pero no se han facilitado sus resultados.

## Limitaciones y advertencias

- Licencia no especificada: la model card no incluye licencia, por lo que no puede asumirse uso comercial ni redistribucion sin consultar al autor.
- Tasa de exito del 62 %: en la evaluacion E720, 38 de cada 100 escenas fallaron. No es una politica fiable para despliegue en produccion sin supervision o sin un mecanismo de recuperacion.
- Auditoria pendiente: los propios resultados de E720 estan marcados como pendientes de auditoria, por lo que deben tratarse como preliminares.
- Dominio muy estrecho: el checkpoint esta entrenado para una unica tarea (scan-object sequential) sobre un brazo concreto (Q4-A) en un entorno concreto (RoboTwin). No se documenta transferencia a otros brazos, objetos o entornos.
- Naturaleza de simulacion: no se indica que el modelo se haya validado en hardware real, solo en escenas de evaluacion dentro del pipeline descrito.
- Dependencia estricta de los assets: la model card exige usar los assets incluidos sin cambios; modificar la normalizacion o los assets invalida la reproducibilidad y probablemente degrada el rendimiento.
- Repositorio de solo inferencia: no incluye estado del optimizador ni del cargador de datos, por lo que no permite reanudar el entrenamiento tal cual.
- Sin informacion sobre sesgos, alucinacion o comportamiento fuera de distribucion: no disponible.
- Idiomas y entrada de lenguaje: no disponible; no se detalla si la politica acepta instrucciones en lenguaje natural ni en que idiomas.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, de modo que no existe validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Shiki42/q4a-scan-object-sequential-pi05-e697-step10000
- Revision del dataset de entrenamiento (identificador, no URL): `1b24730ebff0ea3f91652a3806620fb682f413b0`
- Commit de CTR (identificador, no URL): `40322ccb58a7cf20714f680c439fbb3248648efe`
- Commit de OpenPI (identificador, no URL): `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead`
- SHA-256 de la normalizacion de entrenamiento: `c52e2ec3795214b360821ad7c417297a1ab0b8b684a26fe1e9de55d072260b0d`
- No se han proporcionado otros enlaces (paper, blog, repositorio de codigo o demo) en la informacion disponible.
