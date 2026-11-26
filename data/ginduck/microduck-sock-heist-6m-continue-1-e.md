# GinDuck/microduck-sock-heist-6m-continue-1-e

## Resumen

microduck-sock-heist-6m-continue-1-e es un checkpoint de politica de aprendizaje por refuerzo para el robot cuadrupedo de bajo coste microduck, desarrollado por el usuario GinDuck y publicado en Hugging Face. No es un modelo de lenguaje: se trata de un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetado en formato ONNX para su despliegue directo en el robot fisico.

El modelo resuelve una tarea concreta de manipulacion/locomocion llamada "sock heist": el robot debe sortear obstaculos (guardias) y recoger un calcetin sin ser detectado, en aproximadamente 10 segundos segun las pruebas del autor. Es la continuacion de una ejecucion anterior de entrenamiento, de ahi el sufijo "continue-1-e", y se presenta como una politica perpetua: una vez cargada en una ranura de politica del demonio robotctl, se ejecuta de forma continua hasta que se le indique lo contrario.

Su relevancia es acotada pero significativa dentro del ecosistema de robotica open source: demuestra el flujo completo de entrenamiento con mjlab (entorno de RL basado en MuJoCo), exportacion a ONNX e integracion con el stack de control del microduck de Pollen Robotics. No hay informacion sobre parametros, contexto ni idiomas porque no aplican a este tipo de artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal de RL (red para control robotico); arquitectura interna no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; la normalizacion de observaciones va integrada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas microduck) |

## Arquitectura y entrenamiento

La politica se entrena con aprendizaje por refuerzo en mjlab, un framework de entrenamiento basado en MuJoCo, sobre la tarea `Mjlab-SockHeist6m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges` (rama `sock-continue`, commit `395d47056`). El entrenamiento se lanzo con 4096 entornos paralelos, hasta 1500 iteraciones maximas del agente, semilla 1 y registro en TensorBoard, partiendo de la base `mjlab-microduck 0.1.0 @ 1efd853be`. El checkpoint publicado corresponde a la iteracion 800.

El artefacto final es un `policy.onnx` con la normalizacion de observaciones incorporada en el propio grafo: el consumidor debe alimentar observaciones crudas. La interfaz es de 61 dimensiones de observacion y 14 acciones, ejecutandose a 50 Hz como politica perpetua cargada en una ranura del demonio de control. El autor advierte que el entrenamiento no es reproducible bit a bit entre maquinas: con el mismo codigo, `uv.lock`, comando y semilla se obtiene una politica comparable, no identica.

## Capacidades

- Control de locomocion y navegacion del cuadrupedo microduck a partir de observaciones de 61 dimensiones.
- Ejecucion de una tarea especifica de evasion y recogida de objeto ("sock heist") en aproximadamente 10 segundos en las pruebas del autor.
- Politica perpetua: se ejecuta de forma continua hasta recibir instruccion de parada.
- Despliegue directo en robot fisico mediante `robotctl policy load <slot> <repo>`.
- Inferencia via ONNX, con normalizacion de observaciones integrada en el modelo.
- No soporta tool calling, agentes multi-paso, capacidades multilingues, vision ni audio: es un controlador motor, no un modelo generativo.

## Casos de uso

- Demostracion de evasion y recogida de objetos en robot cuadrupedo: cargar la politica en una ranura con `robotctl policy load` y ejecutar la secuencia de sortear guardias y recoger el calcetin, util como vitrina de capacidades del microduck.
- Referencia de entrenamiento RL reproducible: usar el comando documentado (4096 entornos, 1500 iteraciones, semilla 1) para replicar el pipeline de mjlab y generar politicas comparables para experimentacion.
- Base para fine-tuning de tareas de manipulacion: al ser un checkpoint intermedio (iteracion 800) de una ejecucion "continue", sirve como punto de partida para continuar el entrenamiento con variaciones de escena o recompensas.
- Evaluacion comparativa de politicas: integrar esta politica junto con otras en el mismo hardware para medir tiempo de tarea, tasa de exito y robustez ante cambios de entorno.
- Docencia e investigacion en robotica de bajo coste: el microduck y este tipo de politicas permiten montar laboratorios de RL robotico con hardware asequible y stack open source.
- Integracion en competiciones o demos tipo Arena/QuackPack: el autor menciona el seguimiento de carreras y copas en iPhone mediante QuackPack, contexto donde esta politica puede exhibirse.
- Validacion de despliegue ONNX en robotica embebida: probar el flujo ONNX + manifest + demonio de control como patron de despliegue de politicas en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es cualitativo y de su propio entorno: la politica completa la tarea en aproximadamente 10 segundos.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser una politica de control de dimensiones pequenas (61 observaciones, 14 acciones) y distribuirse en ONNX, la huella de memoria es previsiblemente minima, aunque no se publica cifra.
- GPU recomendadas: no disponible. Para entrenamiento, el autor uso 4096 entornos paralelos en mjlab, lo que tipicamente requiere GPU de datacenter, pero no se especifica modelo.
- Compatibilidad con GPU de consumo: no confirmada; la inferencia ONNX en el robot no requiere GPU de consumo necesariamente.
- Opciones de despliegue: ONNX Runtime para inferencia; `robotctl` (demonio de control del microduck) para carga en robot; mjlab con MuJoCo para reentrenamiento.
- Latencia y throughput: no disponibles; la politica opera a 50 Hz por diseno.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-continue-1-e | Politica RL para microduck | no disponible | no aplica | no disponible | Hugging Face (0 descargas, 0 likes) |
| Otras politicas de microduck-challenges | Politicas RL para microduck | no disponible | no aplica | no disponible | Repositorio pollen-robotics/microduck-challenges |
| Politicas de locomotion para cuadrupedos comerciales (p. ej. Unitree) | Politicas RL | no disponible | no aplica | habitualmente no publica | No disponibles como artefactos abiertos comparables |

No se dispone de datos de rendimiento ni de parametros para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Es una politica especializada en una unica tarea; no generaliza a otras tareas sin reentrenamiento.
- El rendimiento reportado (unos 10 segundos) proviene de las pruebas del propio autor y no de una evaluacion independiente.
- El entrenamiento no es reproducible bit a bit: mismos hiperparametros y semilla producen pesos distintos en maquinas diferentes.
- Licencia no especificada: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Model card muy escueta: sin datos de arquitectura interna, numero de parametros, regimen de entrenamiento ni evaluacion estadistica de tasa de exito.
- Sin informacion sobre sesgos, robustez ante cambios de entorno, sim-to-real gap ni comportamiento ante fallos.
- Repositorio de 0.0 GB y sin descargas ni likes: artefacto reciente y sin validacion por la comunidad.
- La fecha de creacion indicada (2026-11-26) es futura respecto a la mayoria de referencias; verificar la integridad y procedencia del artefacto antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-1-e
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio
- QuackPack (seguimiento de competiciones): https://www.imundo.ch/quackpack/
