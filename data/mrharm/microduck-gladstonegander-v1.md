# mrharm/microduck-gladstonegander-v1

## Resumen

Microduck gladstonegander-v1 es una política de control por aprendizaje por refuerzo (RL) entrenada para el robot bípedo Microduck, desarrollada por el usuario mrharm y publicada en HuggingFace bajo la librería `microduck`. Se trata de un paseo (gait) perpetuo, es decir, una política que se ejecuta de forma continua hasta recibir una orden de parada, cargada en una ranura de política del robot. El modelo recibe observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz.

El modelo no es un modelo de lenguaje ni un transformer generativo, sino una política neuronal de robótica exportada a formato ONNX, con el normalizador de observaciones integrado en el propio fichero `policy.onnx`, de modo que el robot puede alimentarlo directamente con observaciones en bruto. Está pensado para su despliegue sobre el hardware real del Microduck, un robot bípedo de 25 cm con 15 motores, cámara, LiDAR y pico prensil comercializado por Pollen Robotics.

Su relevancia radica en que forma parte de un ecosistema abierto de entrenamiento en simulación y transferencia Sim2Real (simulación a realidad) para robótica de bajo coste. La tarea concreta entrenada es `Mjlab-HillClimb1m5-MicroDuck`, orientada a la ascensión de pendientes. El autor indica que la política no le satisface del todo y que seguirá iterando. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y su licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control por aprendizaje por refuerzo, exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable; observacion de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplicable (politica de control robotico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (esquema 2 del manifiesto de politicas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de acciones | 14 acciones |
| Dimension de observacion | 61 dimensiones |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de red concreta (numero de capas, anchura, tipo de capa). Lo que si se documenta es el pipeline de entrenamiento: la politica se entrena con el framework `mjlab` (base `mjlab-microduck 0.1.0 @ 8d0dbc94c`) sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, dentro del repositorio `microduck-challenges` de Pollen Robotics. El entrenamiento parte de 2048 entornos simulados en paralelo, un maximo de 3000 iteraciones del agente, semilla 87478, y el checkpoint exportado es el 2750. El commit de codigo utilizado es `f4c69ff9d`.

El modelo se distribuye ya exportado a ONNX con el normalizador de observaciones embebido, siguiendo el esquema 2 del manifiesto de politicas del demonio `microduck`. La reproducibilidad no es bit a bit: el propio autor advierte que repetir el entrenamiento con el mismo codigo, `uv.lock`, comando y semilla produce una politica comparable, pero no pesos identicos, dado que el aprendizaje por refuerzo sobre GPU no es determinista entre maquinas.

## Capacidades

- Generacion de locomocion bipeda continua: la politica es "perpetua", ejecuta un paseo de forma indefinida hasta que se le indique lo contrario.
- Control de 14 grados de actuacion (acciones) a partir de observaciones de 61 dimensiones del robot.
- Ascension de pendientes hasta la tarea designada `HillClimb1m5` (pendiente de 1 m de desnivel en el entorno de entrenamiento, segun la nomenclatura de la tarea).
- Inferencia en tiempo real a 50 Hz, apta para el lazo de control del robot.
- Carga como ranura de politica mediante la orden `robotctl policy load`.
- Normalizacion de observaciones integrada, sin necesidad de preprocesado externo.
- Transferencia Sim2Real: pensada para ejecutarse en el hardware fisico tras el entrenamiento en simulacion.
- No dispone de capacidades de lenguaje, vision, tool calling ni agentes multi-paso; es exclusivamente una politica motora.

## Casos de uso

- Locomocion base del Microduck: cargar esta politica en una ranura del robot para que camine de forma continua en terrenos con pendiente, sirviendo como comportamiento por defecto tras el arranque.
- Transferencia Sim2Real: usar la politica como punto de partida para evaluar la brecha entre simulacion y robot real en tareas de ascension, comparando el rendimiento observado en `mjlab` con el del hardware.
- Investigacion en aprendizaje por refuerzo para robotica: emplear el pipeline documentado (`microduck-challenges`, `uv sync`, `uv run train`) como referencia reproducible para experimentar con semillas, numero de entornos y checkpoints alternativos.
- Linea base (baseline) de comparacion: al ser un commit y checkpoint concretos, permite contrastar futuras politicas (por ejemplo `gyrogearloose-v1`) frente a un mismo escenario de ascension.
- Educacion y docencia: ilustrar el ciclo completo de entrenamiento RL, exportacion a ONNX e integracion en un demonio de robot de bajo coste (399 USD) en cursos de robotica.
- Desarrollo de comportamientos compuestos: encadenar esta marcha perpetua con otras politicas o modulos de percepcion (camara, LiDAR) para tareas de navegacion mas complejas en el Microduck.
- Validacion de despliegue en produccion de juguete/robot de consumo: probar la fiabilidad de carga de politicas y normalizacion embebida en el flujo `robotctl` antes de distribuir comportamientos a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasa de exito de ascension, velocidad media ni datos de transferencia Sim2Real, ni tampoco comparaciones numericas frente a otras politicas.

## Requisitos de hardware

- Inferencia: al ejecutarse sobre el Microduck, la politica ONNX corre en el computo embebido del robot, no en un servidor de GPU. El tamano del repositorio es de 0,0 GB, lo que sugiere un modelo de muy pocos parametros, apto para hardware embebido. No se especifica la VRAM ni el hardware objetivo de inferencia.
- Entrenamiento: requiere una GPU capaz de simular 2048 entornos en paralelo con `mjlab`. El modelo no declara la GPU concreta empleada. Este tipo de cargas de RL con miles de entornos suele requerir GPU de gama alta (A100, H100 o RTX 4090 en configuraciones reducidas), pero no se confirma en la informacion disponible.
- GPU consumer: factible para entrenamiento de menor escala (reduciendo `--env.scene.num-envs`), pero no confirmado por el autor.
- Opciones de despliegue: ONNX ejecutado por el demonio `microduck` a traves de `robotctl policy load`; el normalizador va embebido en `policy.onnx`.
- Latencia y throughput: la politica opera a 50 Hz (20 ms por paso). No se publican cifras de latencia adicionales ni de rendimiento en simulacion.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrharm/microduck-gladstonegander-v1 | Politica RL ONNX | 61-D / 14 acciones, 50 Hz | HillClimb1m5 | no disponible | HuggingFace, 0 descargas |
| mrharm/microduck-gyrogearloose-v1 | Politica RL ONNX | no disponible | no disponible | no disponible | HuggingFace |
| minjunglee27/microduck-models | Politicas y checkpoints RL | no disponible | Sim2Real MicroDuck | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas politicas, por lo que la comparacion se limita a su naturaleza, tarea y disponibilidad.

## Limitaciones y advertencias

- Rendimiento no validado publicamente: no hay benchmarks, recompensas ni tasas de exito publicadas, y el propio autor declara no estar satisfecho con el resultado y que seguira iterando.
- Licencia no especificada: al no indicarse licencia, no puede asumirse permiso de uso comercial; conviene contactar con el autor antes de integrarla en productos.
- Reproducibilidad limitada: el entrenamiento RL sobre GPU no es determinista entre maquinas, por lo que repetir el pipeline produce pesos distintos.
- Ambito restringido: es una politica motora; no procesa lenguaje, no tiene vision propia y no soporta tool calling ni razonamiento multi-paso.
- Dependencia de la version del demonio: `manifest.json` sigue el esquema 2; cambios de esquema en el demonio `microduck` podrian romper la compatibilidad de carga.
- Riesgo de brecha Sim2Real: aunque la tarea esta pensada para transferencia a robot real, no se documenta el exito de dicha transferencia ni las condiciones de terreno en las que la politica resulta fiable.
- Sin soporte multi-idioma ni capacidades generativas, por lo que no debe evaluarse con las metricas habituales de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrharm/microduck-gladstonegander-v1
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Pagina oficial del Microduck: https://pollen-robotics.com/microduck/
- Politica relacionada (mismo autor): https://huggingface.co/mrharm/microduck-gyrogearloose-v1
- Repositorio de modelos de terceros: https://huggingface.co/minjunglee27/microduck-models
- Microduck Studio (entorno de desarrollo): https://github.com/microai-lab/microduck-studio
