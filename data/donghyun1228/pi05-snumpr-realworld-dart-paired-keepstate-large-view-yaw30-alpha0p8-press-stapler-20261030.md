# Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-press-stapler-20261030

## Resumen

π0.5 SNUMPR real-world DART merge para la tarea `press_stapler` es un modelo de vision-lenguaje-accion (VLA) derivado de la familia π0.5 de Physical Intelligence, adaptado por el autor Donghyun1228 sobre la base SNUMPR VLA (`snumpr-iclr27-v1/9999`). El modelo resuelve una tarea robotica concreta (pulsar una grapadora) mediante aprendizaje por imitacion, aplicando una tecnica de aumento de datos denominada DART (domain arithmetic) que mezcla pesos de dos ajustes finos: uno sobre una demostracion fuente y otro sobre una demostracion objetivo recogida de nuevo para imitar el movimiento de la fuente.

La relevancia del modelo es metodologica mas que de rendimiento: documenta con detalle un flujo completo de adaptacion por tarea con rotacion virtual de la base (+30 grados de yaw) sobre las poses TCP y las acciones delta, manteniendo sin rotar el estado de articulaciones (`observation.state`) mediante la opcion `--keep-state`. El repositorio incluye los pesos en BF16, los assets de normalizacion original y un registro de verificacion hoja a hoja de la mezcla (51/51 claves, sin fallback).

No se ha ejecutado ninguna evaluacion sobre robot real, por lo que no existen datos de exito en tarea. El modelo se distribuye con licencia Apache 2.0 y un tamano de repositorio de 5,3 GB, coherente con un VLA de escala media en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi); no se detalla la composicion interna en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en BF16 y `assets` con normalizacion original (SHA `f549619e…`) |

## Arquitectura y entrenamiento

El modelo parte de la base `snumpr-iclr27-v1/9999`, descrita como SNUMPR VLA inicial con normalizacion original, y hereda la arquitectura π0.5 de openpi. Sobre esa base se realizan dos ajustes finos independientes por imitacion (IL only): uno sobre la demostracion fuente `demonstration_15` con yaw 0 (preset `pi05_snumpr_dart_paired_source_press_stapler`) y otro sobre una demostracion objetivo de vista amplia recogida de nuevo el 2026-10-30 (preset `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_press_stapler`). Ambos usan 1.000 actualizaciones, batch 64, LR constante 5e-5, sin warmup, sin EMA y entrenando todos los pesos, con el codigo `Donghyun1228/vla_adaptation` en el commit `c4fcb61`.

La innovacion tecnica es la mezcla DART: se aplica el `domain_arithmetic.dart` oficial de `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`) con α 0.8, scope `all`, semilla 42 y ejecucion en CPU. En el ajuste objetivo, las poses TCP y las acciones delta se rotan mediante un yaw virtual de base de +30 grados (`Rz(-30)`), mientras que `observation.state` conserva los angulos articulares reales gracias a `--keep-state`. El resultado se verifica con `dart_merge_verified.json` (51/51 claves, sin fallback). El controlador del robot debe deshacer la rotacion en la accion (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimentar el estado articular real sin cambios.

## Capacidades

- Generacion de acciones roboticas para la tarea `press_stapler` a partir de observaciones visuales y estado articular.
- Control visuomotor de horizonte corto condicionado por lenguaje de tarea (herencia del paradigma VLA π0.5).
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, con adaptacion por tarea mediante ajuste fino ligero.
- Mezcla de pesos entre dominios (fuente y objetivo) para transferir el estilo de movimiento de una demostracion fuente a una recogida en vista amplia.
- Rotacion virtual de base para aumentar la diversidad de puntos de vista sin recoger datos adicionales.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Automatizacion de una celda robotica de picking y pulsado de grapadora: el modelo recibe imagenes de camara y estado articular y emite deltas de accion; es adecuado porque esta entrenado especificamente para esa tarea y esa vista amplia.
- Investigacion en adaptacion de dominio para VLA: sirve como referencia reproducible del flujo DART con α 0.8, semilla 42 y verificacion de mezcla, util para comparar estrategias de merge frente a ajuste fino puro.
- Estudio de transferencia de estilo de movimiento: el par fuente/objetivo permite analizar cuanto del comportamiento de `demonstration_15` se conserva tras la mezcla DART.
- Aumento de datos por rotacion virtual de base: el esquema `Rz(-30)` en acciones con estado real sin rotar puede replicarse en otras tareas para ampliar la cobertura angular sin nuevas capturas.
- Banco de pruebas de integracion de controladores: el requisito de deshacer la rotacion en el controlador (`Δxyz_real = Rz(+30) Δxyz_virtual`) lo convierte en un caso de validacion para pipelines de despliegue que mezclan marcos de referencia.
- Base para ajuste fino posterior en tareas de manipulacion con efector tipo pinza: al estar en BF16 y con licencia Apache 2.0, puede reentrenarse o mezclarse con otros presets del mismo ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha ejecutado ninguna evaluacion sobre robot real.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 5,3 GB, lo que sugiere que los pesos en BF16 caben en GPUs consumer con 8-12 GB de VRAM, aunque la memoria para activaciones e imagenes de entrada no esta documentada.
- GPU recomendadas: no disponible. Por el tamano del repo, una RTX 4090 o RTX 3090 deberia ser suficiente para inferencia, pero no hay confirmacion del autor.
- Cabe en GPU consumer: probablemente si, segun el tamano de 5,3 GB del repositorio, sin datos oficiales de latencia ni throughput.
- Opciones de despliegue: no documentadas; el ecosistema openpi suele requerir su propio runtime de inferencia, no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART `press_stapler` (este) | no disponible | no disponible | Pulsar grapadora (vista amplia, yaw +30) | Apache 2.0 | Hugging Face, 0 descargas |
| `snumpr-iclr27-v1/9999` (base SNUMPR VLA) | no disponible | no disponible | VLA generalista SNUMPR | no disponible | Referenciado como base |
| Preset `pi05_snumpr_dart_paired_source_press_stapler` | no disponible | no disponible | Fuente de la mezcla DART (yaw 0) | no disponible | Parte del flujo descrito |
| π0.5 original (openpi) | no disponible | no disponible | VLA generalista | no disponible | Ecosistema openpi |

No se dispone de datos de rendimiento comparables entre estas variantes; la comparativa se limita a procedencia y licencia.

## Limitaciones y advertencias

- No se ha evaluado en robot real: no hay evidencia de tasa de exito ni de robustez fuera de las demostraciones de entrenamiento.
- El modelo esta especializado en una unica tarea (`press_stapler`) y una unica configuracion de vista; no se espera generalizacion a otras tareas sin nuevo ajuste fino.
- Requiere que el controlador deshaga la rotacion virtual (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimente el estado articular real sin rotar; un error en este paso invalida las acciones.
- Riesgo de sobreajuste a la demostracion fuente y a la recogida objetivo, dado el entrenamiento con solo 1.000 actualizaciones y batch 64 sobre una unica demostracion por preset.
- Sin datos sobre sesgos, idiomas o robustez ante cambios de iluminacion, oclusiones o variaciones de la escena.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion hace arriesgado desplegarlo en produccion sin validacion previa.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-press-stapler-20261030
- Codigo de adaptacion: `Donghyun1228/vla_adaptation` (commit `c4fcb61`)
- Implementacion DART: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`)
- Modelo base: `snumpr-iclr27-v1/9999`
- Ecosistema openpi (π0.5): no se proporciona enlace directo en la informacion disponible
