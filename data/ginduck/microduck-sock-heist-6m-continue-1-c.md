# GinDuck/microduck-sock-heist-6m-continue-1-c

## Resumen

`microduck-sock-heist-6m-continue-1-c` es un checkpoint de política de refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: es una política de control motor entrenada para ejecutar una tarea concreta de locomoción y manipulación denominada "sock heist", en la que el robot debe esquivar guardias y recoger un calcetín sin ser detectado, según los tests del propio autor, en unos 10 segundos.

El artefacto se distribuye como un fichero `policy.onnx` con el normalizador de observaciones integrado, junto con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. La política es perpetua: se ejecuta de forma continua a 50 Hz hasta que se detiene, con un espacio de observación de 61 dimensiones y 14 acciones.

El modelo se entrenó con el framework `mjlab` (versión 0.1.0) sobre el repositorio `microduck-challenges`, en la rama `sock-continue`, commit `395d47056`, con 4096 entornos paralelos, 1500 iteraciones máximas y semilla 1. Es un checkpoint de la iteración 1100 de un run de continuación. Su relevancia es acotada: sirve como ejemplo reproducible de entrenamiento de políticas con RL para robótica de bajo coste, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; arquitectura de red no documentada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tamano del repo | 0.0 GB (segun Hugging Face) |
| Libreria | microduck |

## Arquitectura y entrenamiento

La model card no describe la topología de la red neuronal de la política. Lo que sí documenta es el pipeline de entrenamiento: entorno `Mjlab-SockHeist6m-MicroDuck` del repositorio `microduck-challenges`, sobre la base `mjlab-microduck 0.1.0` en el commit `1efd853be`. El entrenamiento se lanzó el 2026-10-31T20:10:50Z con 4096 entornos paralelos, un máximo de 1500 iteraciones del agente y semilla 1, registrando en TensorBoard bajo el nombre de run `continue-1`. El checkpoint publicado corresponde a la iteración 1100.

Se trata de un run de continuación sobre un entrenamiento previo (rama `sock-continue`), orientado a refinar la política base de "sock heist". El autor advierte explícitamente que el proceso no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. El normalizador de observaciones está embebido en el ONNX, de modo que la política consume observaciones en bruto.

## Capacidades

- Control locomotor y de manipulación del cuadrúpedo microduck para la tarea "sock heist": acercarse al objetivo, esquivar guardias y recoger el calcetín.
- Política perpetua: se ejecuta de forma continua a 50 Hz hasta recibir orden de parada, no como episodio finito.
- Consumo de observaciones en bruto de 61 dimensiones con normalización interna.
- Emisión de 14 acciones de control motor.
- Carga en una ranura de política del demonio mediante `robotctl policy load`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control motor específica.

## Casos de uso

- Reproducción de investigación en RL robótico: sirve como referencia para validar el pipeline `microduck-challenges` con los mismos hiperparámetros (4096 entornos, semilla 1, 1500 iteraciones) y comparar políticas resultantes.
- Demostración de tarea de manipulación en ferias y presentaciones: el autor reporta ejecución de la tarea en torno a 10 segundos, útil para exhibiciones del robot microduck ante público.
- Punto de partida para fine-tuning de continuación: al ser un checkpoint intermedio de un run `continue`, puede usarse como inicialización para nuevas iteraciones sobre la misma tarea.
- Pruebas de integración del demonio de políticas: permite verificar el flujo `robotctl policy load <slot>` y la compatibilidad con el esquema 2 de manifiesto.
- Benchmark interno de locomoción: útil para medir latencia y estabilidad de una política perpetua a 50 Hz en el hardware microduck.
- Docencia en robótica de bajo coste: ejemplo completo y reproducible de entrenamiento con RL en paralelo masivo sobre un robot de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado por el autor es cualitativo: la política completa la tarea "sock heist" en aproximadamente 10 segundos en sus propias pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio figura como 0.0 GB y no se documenta el tamaño del ONNX ni el número de parámetros).
- GPU recomendadas: no disponible para inferencia; para reentrenamiento, el pipeline usa RL con GPU (el autor menciona que el entrenamiento con GPU no es bit-reproducible entre máquinas), pero no especifica modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el demonio de microduck mediante `robotctl policy load <slot>`; el artefacto es ONNX, por lo que es desplegable con runtimes ONNX estándar, aunque no se documenta ningún runtime concreto aparte del daemon.
- Latencia y throughput: frecuencia de control fijada en 50 Hz (periodo de 20 ms por paso); no se publican cifras de latencia real ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-continue-1-c | Política RL (ONNX) para microduck | no disponible | no aplica | no disponible | Hugging Face (0 descargas, 0 likes) |
| Otras políticas del repo `microduck-challenges` | Políticas RL para microduck | no disponible | no aplica | no disponible | Repositorio GitHub de Pollen Robotics |
| Políticas de referencia de mjlab | Políticas RL de locomoción | no disponible | no aplica | no disponible | Repositorio mjlab |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Es una política específica para una única tarea ("sock heist") sobre el robot microduck; no generaliza a otras tareas ni a otro hardware.
- No es un modelo de lenguaje ni procesa texto: no tiene capacidades de razonamiento, código, matemáticas ni visión.
- La licencia no está declarada en la model card ni en los metadatos de Hugging Face, lo que impide confirmar si el uso comercial está permitido.
- El autor advierte que el entrenamiento no es bit-reproducible: los pesos exactos no pueden regenerarse de forma determinista entre máquinas.
- El rendimiento reportado (unos 10 segundos por episodio) proviene de las pruebas del propio autor, sin validación independiente ni métricas publicadas.
- El modelo tiene 0 descargas y 0 likes, sin evidencia de uso externo ni de robustez en condiciones distintas a las del entrenamiento.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el artefacto no opera sobre lenguaje; el riesgo principal es el fallo de la política ante variaciones del entorno físico no vistas durante el entrenamiento.
- El repositorio figura con tamaño 0.0 GB, lo que puede indicar que el artefacto no está efectivamente alojado o que el tamaño es inferior a la precisión de medida de Hugging Face; conviene verificar la descarga antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-1-c
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (referenciado en la model card)
- Enlace externo del autor (QuackPack): https://www.imundo.ch/quackpack/
