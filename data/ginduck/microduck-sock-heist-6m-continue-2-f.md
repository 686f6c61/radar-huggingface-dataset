# GinDuck/microduck-sock-heist-6m-continue-2-f

## Resumen

`GinDuck/microduck-sock-heist-6m-continue-2-f` es un checkpoint de política de control para el robot cuadrúpedo de código abierto **microduck** de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo entrenada para ejecutar una tarea concreta de locomoción y manipulación: acercarse a un calcetín, esquivar a unos guardias y agarrarlo sin ser detectado, completando cada episodio en menos de 10 segundos.

El modelo se distribuye como `policy.onnx` (con el normalizador de observaciones integrado) más un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. Trabaja con observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, y está diseñado como política perpetua: se ejecuta de forma continua hasta que se le indique lo contrario.

Es relevante como ejemplo de pipeline completo de RL aplicado a robótica real de bajo coste, con código de entrenamiento reproducible (`mjlab-microduck`, rama `sock-continue-2`, commit `10ba3a426`), aunque su alcance es muy específico y no está pensado como modelo general ni como base para otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no detallada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye directamente como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La política se entrenó con el framework `mjlab-microduck` 0.1.0 (commit `1efd853be`) sobre el repositorio `pollen-robotics/microduck-challenges`, rama `sock-continue-2`, commit `10ba3a426`. El entrenamiento parte de 4096 entornos paralelos, con un máximo de 1000 iteraciones, semilla 1 y logging en TensorBoard; el checkpoint publicado corresponde al paso 500. La tarea se identifica como `Mjlab-SockHeist6m-MicroDuck`.

El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: ejecutar el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, pero no idéntica. El modelo se exporta a ONNX con el normalizador de observaciones embebido, de modo que el robot puede alimentarlo con observaciones en crudo. La arquitectura interna de la red neuronal no se detalla en la model card.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck con observaciones de 61 dimensiones y 14 acciones a 50 Hz.
- Ejecución de una política perpetua: corre de forma continua hasta que se le ordena detenerse.
- Comportamiento de evasión: esquiva a los guardias del escenario de la tarea.
- Manipulación: agarra el calcetín objetivo sin ser detectado.
- Cumplimiento de un objetivo de tiempo: completa cada episodio en menos de 10 segundos.
- Integración con el daemon del robot mediante `robotctl policy load <slot> <repo>`.
- Inferencia ONNX autocontenida (normalizador incluido), sin preprocesado externo.
- No soporta tool calling, agentes multi-paso, multilingüismo, visión ni audio.

## Casos de uso

- **Demostración de RL en robótica de bajo coste:** cargar la política en un microduck físico con `robotctl policy load` para mostrar un comportamiento aprendido de evasión y agarre en talleres, ferias o docencia.
- **Benchmark de referencia para retos microduck:** usar este checkpoint como línea base en la tarea `Mjlab-SockHeist6m-MicroDuck` del repositorio `microduck-challenges` al comparar nuevas políticas.
- **Validación del pipeline de despliegue ONNX:** servir como prueba de humo del daemon y del manifiesto de políticas (esquema 2) antes de desplegar políticas propias.
- **Estudio de políticas perpetuas:** analizar cómo se comporta una política sin condición de terminación entrenada con 4096 entornos paralelos durante episodios de hasta 10 segundos.
- **Reproducción de experimentos de RL:** reentrenar con el comando documentado (`uv run train ... --agent.seed 1`) para estudiar la variabilidad entre ejecuciones no bit-reproducibles.
- **Evaluación de robustez en escenarios con obstáculos:** medir la tasa de éxito del agarre del calcetín ante cambios de iluminación o posición de los guardias en el entorno real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara cualitativamente que la política "esquiva a los guardias, agarra el calcetín sin ser detectado y termina cada episodio en menos de 10 segundos", sin métricas numéricas de tasa de éxito, recompensa media ni comparaciones.

## Requisitos de hardware

- **VRAM estimada:** no disponible; el tamaño del repositorio es de 0,0 GB y la red es presumiblemente muy pequeña (política de control, no un LLM), por lo que la inferencia ONNX debería caber en CPU.
- **GPU recomendadas:** no disponible. Para el entrenamiento se usaron 4096 entornos paralelos, lo que requiere una GPU de datacenter (A100/H100 o similar), pero el autor no especifica el hardware empleado.
- **Consumer GPU:** no confirmado; por el tamaño del artefacto es probable que la inferencia quepa en cualquier GPU consumer o incluso en CPU, pero no hay datos publicados.
- **Opciones de despliegue:** ONNX Runtime (formato `policy.onnx`) cargado por el daemon de microduck mediante `robotctl policy load <slot> <repo>`.
- **Latencia y throughput:** no disponibles; la política opera a 50 Hz (20 ms por paso) según la especificación de la plataforma.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas publicadas para la tarea `Mjlab-SockHeist6m-MicroDuck` ni checkpoints comparables del mismo autor con métricas publicadas.

## Limitaciones y advertencias

- **Licencia no especificada:** no se indica licencia en la model card ni en los metadatos de Hugging Face; no hay autorización explícita para uso comercial.
- **Alcance muy restringido:** la política está entrenada únicamente para la tarea `Mjlab-SockHeist6m-MicroDuck`; no generaliza a otras tareas, entornos ni morfologías.
- **Reproducibilidad limitada:** el propio autor advierte que el entrenamiento no es bit-reproducible entre máquinas; los pesos publicados no pueden regenerarse exactamente.
- **Sin métricas de rendimiento:** no hay tasas de éxito, recompensas ni evaluaciones cuantitativas publicadas, solo una descripción cualitativa.
- **Riesgo en entorno real:** al ser una política perpetua sin condición de parada aprendida, requiere supervisión y un mecanismo externo de interrupción durante las pruebas físicas.
- **Sin información de sesgos:** al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero tampoco se documenta el comportamiento ante distribuciones de observación fuera del entrenamiento.
- **Cero tracción comunitaria:** 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2-f
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: `10ba3a426` (rama `sock-continue-2`)
- Base de entrenamiento: `mjlab-microduck` 0.1.0, commit `1efd853be`
