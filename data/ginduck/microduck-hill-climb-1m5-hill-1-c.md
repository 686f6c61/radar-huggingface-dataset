# GinDuck/microduck-hill-climb-1m5-hill-1-c

## Resumen

`microduck-hill-climb-1m5-hill-1-c` es un checkpoint de política de control para el robot cuadrúpedo microduck de Pollen Robotics, entrenado mediante aprendizaje por refuerzo en simulación con la tarea `Mjlab-HillClimb1m5-MicroDuck`. Lo publica el usuario GinDuck como parte de su primer experimento de escalada ("hill climb"), usando la receta base de Pollen sin ajustes posteriores. No es un modelo de lenguaje: es una política perpetua que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz, empaquetada en formato ONNX para su ejecución directa sobre el robot.

El modelo resuelve una tarea concreta: subir una rampa de 1,5 metros de altura. Según el autor, la política es lenta en la rampa pero alcanzó la cima en las cinco pruebas realizadas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que el artefacto principal (`policy.onnx` más `manifest.json`) es muy ligero, coherente con una red de política de pequeña escala.

Su relevancia es acotada pero clara para quien trabaja con microduck: sirve como checkpoint de referencia reproducible (commit, semilla y comando documentados) y como ejemplo de empaquetado de políticas RL en ONNX con normalizador integrado, siguiendo el esquema 2 del manifiesto de políticas del daemon de Pollen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL empaquetada en ONNX; no se detalla la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal de la política (capas, anchura, función de activación). Lo que sí se documenta es el pipeline de entrenamiento: se usó `mjlab-microduck 0.1.0` en el commit `1efd853be`, sobre el repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `dc73b9237`), con la tarea `Mjlab-HillClimb1m5-MicroDuck`, semilla 1 y checkpoint 2750. El entrenamiento se lanzó el 2026-11-01 con 4096 entornos paralelos y un máximo de 3000 iteraciones del agente, registrando en TensorBoard con el nombre de ejecución `hill-1`.

La política opera a 50 Hz con un espacio de observación de 61 dimensiones y 14 acciones, y es de tipo "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha cargada en una ranura de política del daemon `robotctl`. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Control locomotor de escalada: política entrenada específicamente para subir una rampa de 1,5 m con el microduck.
- Ejecución perpetua a 50 Hz: mantiene la marcha de forma continua hasta recibir una orden de parada o cambio de política.
- Consumo de observaciones en bruto: el normalizador va embebido en el ONNX, lo que simplifica la integración en el daemon.
- Despliegue en robot real mediante `robotctl policy load <slot> GinDuck/microduck-hill-climb-1m5-hill-1-c`.
- Compatibilidad con el manifiesto de políticas de microduck en su esquema 2.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo; no aplican a este tipo de modelo.

## Casos de uso

- Referencia base para escalada: sirve como punto de partida para comparar políticas posteriores del mismo autor o de la comunidad en la tarea `Mjlab-HillClimb1m5-MicroDuck`, ya que la receta y el commit están documentados.
- Validación de la cadena de despliegue: útil para verificar que el flujo `robotctl policy load` y la carga de un `manifest.json` de esquema 2 funcionan de extremo a extremo con un artefacto real.
- Pruebas de robustez en rampa: al ser lenta pero fiable en las cinco pruebas del autor, permite medir tiempos de ascenso y estabilidad antes de sustituirla por una política más agresiva.
- Reproducción de experimentos de RL: el comando de entrenamiento con `uv sync`, 4096 entornos y semilla 1 permite replicar el pipeline y estudiar la variabilidad entre ejecuciones.
- Integración en simulador: el ONNX con normalizador integrado se puede cargar en un bucle de simulación para evaluar la política sin depender del hardware.
- Demostración y docencia: ejemplo compacto de cómo se empaqueta una política de RL para un cuadrúpedo de bajo coste, útil en materiales formativos sobre robótica con aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es cualitativo: el autor indica que la política "se toma su tiempo en la rampa" pero alcanzó la cima en las cinco pruebas realizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,0 GB) sugiere un modelo muy pequeño, probablemente ejecutable en CPU.
- GPU recomendadas: no disponibles para inferencia; para reentrenar, el autor usó 4096 entornos paralelos, lo que implica una GPU de datacenter (no se especifica el modelo).
- ¿Cabe en GPU de consumo? No hay datos que lo impidan, pero no se confirma; por el tamaño del artefacto es plausible que la inferencia corra en CPU o en GPUs modestas.
- Opciones de despliegue: el runtime nativo es el daemon de microduck vía `robotctl`; el artefacto es ONNX, por lo que también puede ejecutarse con ONNX Runtime en otros entornos.
- Latencia y throughput: la política está diseñada para 50 Hz (20 ms por paso); no se publican cifras de latencia real medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de escalada para microduck ni datos de modelos comparables en la misma tarea.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución del artefacto.
- Rendimiento limitado en velocidad: el propio autor describe la política como lenta en la rampa.
- Validación empírica mínima: cinco pruebas del autor, sin protocolo estadístico ni métricas publicadas.
- Entrenamiento no reproducible bit a bit: la misma semilla y comando generan pesos distintos en otra máquina.
- Especialización estrecha: entrenada solo para la tarea de escalada de 1,5 m; no se garantiza su comportamiento en otras superficies, pendientes o cargas.
- Sin datos de sesgos, alucinación o idioma: no aplican a un modelo de control, pero tampoco hay evaluación de robustez ante perturbaciones.
- Repositorio sin tracción: 0 descargas y 0 likes, sin evidencia de uso independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-1-c
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Enlace del autor (QuackPack): https://www.imundo.ch/quackpack/
