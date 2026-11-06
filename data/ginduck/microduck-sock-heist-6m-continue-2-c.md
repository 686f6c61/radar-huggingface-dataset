# GinDuck/microduck-sock-heist-6m-continue-2-c

## Resumen

`microduck-sock-heist-6m-continue-2-c` es una politica de control robotico entrenada mediante aprendizaje por refuerzo para el robot cuadrupedo de bajo coste **microduck**, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es un checkpoint de una politica de control que mapea observaciones de 61 dimensiones a 14 acciones de actuacion, ejecutandose a 50 Hz sobre el robot fisico. Se publica en formato ONNX con el normalizador de observaciones integrado en el propio grafo, de modo que la politica consume observaciones en crudo.

El autor, GinDuck, lo describe como un checkpoint tardio de su segunda ejecucion de la tarea "sock heist" (robar un calcetin): la politica esquiva a los guardias y recoge el calcetin sin ser detectada, completando cada episodio en aproximadamente 9,5 segundos. Es una politica de tipo *perpetual*, es decir, un patrón de marcha que se ejecuta de forma continua hasta que se le indique lo contrario, y que se carga en una ranura de politica del daemon del robot mediante `robotctl`.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de RL para robotica de bajo coste (entorno de simulacion mjlab, 4096 entornos en paralelo, 1000 iteraciones maximas, semilla fija) y como artefacto desplegable directamente en hardware mediante el stack de microduck. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control por aprendizaje por refuerzo (red neuronal; topologia no detallada en la model card), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica reactiva; observacion de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` conforme al esquema 2 del manifiesto de politicas de microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tipo de politica | perpetua (bucle continuo hasta cancelacion) |

## Arquitectura y entrenamiento

La model card no detalla la topologia de la red neuronal (numero de capas, anchura, funciones de activacion). Lo que si se especifica es la interfaz: 61 entradas de observacion, 14 salidas de accion, a 50 Hz, con el normalizador de observaciones embebido en `policy.onnx`, de forma que el consumidor debe alimentar observaciones sin normalizar. El artefacto se empaqueta con un `manifest.json` que sigue el esquema 2 del manifiesto de politicas del daemon de microduck.

El entrenamiento se realizo con el framework **mjlab** (version base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre el repositorio `pollen-robotics/microduck-challenges`, rama `sock-continue-2`, commit `10ba3a426`. La tarea es `Mjlab-SockHeist6m-MicroDuck`, con 4096 entornos simulados en paralelo, un maximo de 1000 iteraciones del agente, semilla 1 y logging a TensorBoard. El checkpoint publicado corresponde al paso 900, iniciado el 2026-11-01. El autor advierte explicitamente que el entrenamiento no es reproducible bit a bit entre maquinas: la misma configuracion y semilla producen una politica comparable, no identica.

## Capacidades

- Locomocion cuadrupeda continua a 50 Hz sobre el robot microduck, en modalidad de politica perpetua.
- Ejecucion de una tarea compuesta de navegacion y manipulacion simple: aproximarse al objetivo, esquivar obstaculos moviles (guardias) y recoger un objeto (calcetin).
- Control reactivo de ciclo cerrado: la politica consume observaciones del robot en cada paso y emite acciones de forma inmediata, sin planificacion explicita.
- Despliegue directo en hardware mediante el comando `robotctl policy load <slot> GinDuck/microduck-sock-heist-6m-continue-2-c`.
- Inferencia via ONNX, lo que permite ejecucion en CPU o en runtime compatible con ONNX en el propio robot.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades multilingues, de vision o de audio: no es un modelo generativo de proposito general.

## Casos de uso

- **Demostracion de robo de objeto en competicion o exhibicion**: la politica completa la tarea en unos 9,5 segundos de forma consistente, lo que la hace adecuada para demos en vivo y para evaluar el rendimiento del hardware microduck frente a otros participantes de las microduck challenges.
- **Punto de partida para *fine-tuning* o *continual learning***: al ser un checkpoint intermedio de una ejecucion con semilla y commit documentados, sirve como inicializacion para variantes de la misma tarea (por ejemplo, cambiar la posicion de los guardias o del calcetin) sin partir de cero.
- **Validacion del pipeline de entrenamiento mjlab**: el comando de reproduccion completo (clonado, `uv sync`, `uv run train` con 4096 entornos y semilla 1) permite verificar la infraestructura de simulacion a gran escala en una estacion con GPU antes de lanzar experimentos propios.
- **Prueba de integracion del daemon y del manifiesto de politicas**: cargar la politica en una ranura mediante `robotctl` valida el esquema 2 del manifiesto, la inyeccion del normalizador en ONNX y el bucle de control a 50 Hz en el robot real.
- **Benchmark de robustez frente a perturbaciones**: al tratarse de una politica reactiva que esquiva agentes, puede usarse para medir la tasa de exito bajo cambios de friccion, latencia de actuadores o ruido en las observaciones, comparando contra otros checkpoints de la misma rama.
- **Material docente sobre RL aplicado a robotica de bajo coste**: el par simulacion-entrenamiento y despliegue en hardware, con todos los hiperparametros y el commit registrados, constituye un caso de estudio cerrado y verificable para cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado por el autor es cualitativo y especifico de la tarea: la politica completa cada episodio de "sock heist" en aproximadamente 9,5 segundos y evita ser detectada por los guardias.

## Requisitos de hardware

- **Inferencia en el robot**: al ser una politica de 61 entradas y 14 salidas exportada a ONNX, la carga computacional es minima y esta pensada para ejecutarse en el propio microduck a 50 Hz; no se especifican requisitos de VRAM ni de GPU para inferencia.
- **GPU recomendadas para inferencia**: no disponible; cualquier CPU capaz de ejecutar un grafo ONNX de baja dimension deberia ser suficiente, aunque el dato no se confirma en la model card.
- **Cabe en GPU de consumo**: si, con altisima probabilidad, dado el tamano minimo del modelo; no se dispone de cifras oficiales de memoria.
- **Entrenamiento**: requiere GPU para ejecutar 4096 entornos simulados en paralelo con mjlab; el autor no especifica el modelo de GPU utilizado ni el tiempo total de entrenamiento.
- **Opciones de despliegue**: `robotctl policy load` sobre el daemon de microduck (unica via documentada); el artefacto ONNX puede cargarse con cualquier runtime ONNX estandar fuera del robot.
- **Latencia y throughput**: el bucle de control opera a 50 Hz (20 ms por paso); no se publican mediciones de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-sock-heist-6m-continue-2-c (este) | Politica RL perpetua, tarea sock heist | 61 / 14 | 50 Hz | ONNX | no disponible | Hugging Face, 0 descargas |
| GinDuck/microduck-sock-heist-6m-continue-2 | Politica RL, misma ejecucion (checkpoint anterior) | 61 / 14 | 50 Hz | ONNX | no disponible | Hugging Face |
| GinDuck/microduck-sock-heist-6m-continue-2-b | Politica RL, misma ejecucion (checkpoint intermedio) | 61 / 14 | 50 Hz | ONNX | no disponible | Hugging Face |
| Politicas estandar de microduck (walk, stand, sitstand, ground_pick, kick_left, kick_right, roulade) | Politicas de referencia del stack microduck | 61 / 14 | 50 Hz | ONNX | no disponible | Ranuras del daemon microduck |

No se dispone de datos de rendimiento comparativos entre estos checkpoints ni frente a politicas de otros autores; la comparacion se limita a la interfaz y al formato de despliegue.

## Limitaciones y advertencias

- **Sin licencia declarada**: la model card no especifica licencia, por lo que el uso comercial o la redistribucion no estan autorizados de forma explicita; es necesario contactar con el autor antes de cualquier uso en produccion.
- **Especificidad extrema de la tarea**: la politica esta entrenada unicamente para la tarea `Mjlab-SockHeist6m-MicroDuck`; no generaliza a otras tareas ni a otros morfologias de robot.
- **Dependencia del hardware y del simulador**: el comportamiento depende de la correspondencia entre el modelo fisico del microduck y el entorno mjlab empleado en el entrenamiento; cambios de calibracion, friccion o latencia pueden degradar la tasa de exito.
- **No reproducibilidad bit a bit**: el autor advierte que reentrenar con la misma semilla produce pesos distintos; no es posible auditar el artefacto regenerandolo de forma identica.
- **Riesgo de sobreajuste a la simulacion**: no se documenta ningun proceso de *domain randomization* ni evaluacion en hardware distinto del del autor, por lo que el comportamiento fuera del entorno nominal es incierto.
- **Sin datos de sesgos, alucinacion o idioma**: al no ser un modelo de lenguaje, estas categorias no aplican; tampoco se documentan sesgos de comportamiento (por ejemplo, preferencia por rutas concretas) que podrian aparecer en la politica.
- **Madurez del artefacto**: 0 descargas y 0 likes, publicacion reciente y ausencia de documentacion adicional sobre la topologia de la red; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2-c
- Checkpoint hermano (continuacion 2): https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2
- Checkpoint hermano (continuacion 2-b): https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2-b/tree/main
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card, sin URL directa disponible)
