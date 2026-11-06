# greecree/microduck-tug-of-war-tug-super-v11

## Resumen

`greecree/microduck-tug-of-war-tug-super-v11` es una política de control por aprendizaje por refuerzo (reinforcement learning) entrenada para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: es una política continua que mapea una observación de 61 dimensiones a 14 acciones a 50 Hz, empaquetada en formato ONNX y distribuida mediante el sistema de slots de políticas del daemon `robotctl`. El modelo resuelve la tarea de "tug of war" (tira y afloja) en simulación, con el objetivo declarado de optimización de trayectoria PWM de alto voltaje y una arquitectura MLP con anclaje simétrico de cadera.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de un autor individual, con cero descargas y cero likes en el momento de la consulta, repo de 0.0 GB y sin model card que documente licencia, idiomas o resultados de evaluación. La información disponible se limita a los metadatos de Hugging Face y al README del autor, que describe el pipeline de entrenamiento (mjlab, 4096 entornos paralelos, semilla 1, checkpoint 250) pero no publica métricas de rendimiento ni comparativas.

Por tanto, esta ficha debe leerse como una evaluación técnica de un checkpoint de RL para robótica, no como la de un modelo fundacional. Los datos de arquitectura, parámetros y contexto propios de un LLM no aplican y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de política (policy network) para control continuo; el README menciona un "symmetric hip-anchor counter-league MLP" |
| Parametros totales | no disponible (el repo ocupa 0.0 GB y no se publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es ONNX (normalizador de observaciones incluido en `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tarea de entrenamiento | `Mjlab-TugOfWar-MicroDuck` |
| Entornos paralelos en entrenamiento | 4096 |
| Checkpoint publicado | 250 |
| Semilla | 1 |

## Arquitectura y entrenamiento

La política es una red MLP que consume observaciones sin procesar: el normalizador está embebido dentro de `policy.onnx`, de modo que el robot alimenta observaciones crudas y el artefacto se encarga de la normalización. La salida son 14 acciones continuas ejecutadas a 50 Hz sobre el microduck. El README describe la política como "perpetua", es decir, un gait que se ejecuta de forma indefinida hasta que se le indique lo contrario, y se carga en uno de los slots de política del daemon.

El entrenamiento se realizó con el framework mjlab (base `mjlab-microduck 0.1.0 @ 981a279c6`) sobre la tarea `Mjlab-TugOfWar-MicroDuck`, del repositorio `green-creeper/microduck-challenges`, en la rama `main` y el commit `4b675ebf4`. Se lanzaron 4096 entornos en paralelo con un máximo de 1000 iteraciones de agente y semilla 1, con registro en TensorBoard bajo el nombre de ejecución `tug-leader-v1`. El autor advierte explícitamente que el entrenamiento por RL en GPU no es reproducible bit a bit entre máquinas: repetir el comando con el mismo código, `uv.lock`, semilla y parámetros produce una política comparable, no los mismos pesos. Esta advertencia es técnicamente correcta y relevante para cualquiera que pretenda auditar el checkpoint.

El README menciona además dos elementos de diseño sin detallarlos: "high-voltage PWM pit-lip trajectory optimization (168.86 cm)" y "symmetric hip-anchor counter-league MLP". El primero parece referirse a una métrica de desplazamiento o de trayectoria alcanzada (168.86 cm) dentro de la tarea de tug of war; el segundo sugiere una técnica de entrenamiento con liga de contrincantes (counter-league) y un anclaje simétrico de cadera, pero no se proporciona ni la formulación ni la ablación que respalde estas afirmaciones. No se documenta el número total de tokens, la composición del dataset (en RL no aplica) ni si hubo ajuste por preferencias; no hay RLHF ni DPO en un pipeline de control motor.

## Capacidades

- Control motor continuo del microduck a 50 Hz: mapea 61 observaciones a 14 acciones.
- Ejecución de un gait perpetuo orientado a la tarea de tira y afloja, sin condición de terminación declarada.
- Normalización de observaciones integrada en el propio artefacto ONNX, lo que simplifica la integración con el robot.
- Carga directa mediante el sistema de slots de `robotctl` (`sudo robotctl policy load <slot> greecree/microduck-tug-of-war-tug-super-v11`).
- Metadatos de manifiesto conformes al esquema 2 del daemon de microduck, lo que permite su descubrimiento y carga automatizada.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling ni capacidades multilingües: no es un modelo de lenguaje.
- No se documenta soporte para agentes de múltiples pasos en el sentido de LLM; la política es un controlador reactivo.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: servir como checkpoint de referencia para reproducir la tarea `Mjlab-TugOfWar-MicroDuck` con el comando publicado y comparar políticas entrenadas con distintas semillas.
- Pruebas de integración del daemon `robotctl`: cargar la política en un slot para validar el flujo de manifiesto esquema 2 y la normalización embebida en ONNX sin escribir código adicional.
- Demostraciones de tira y afloja con el microduck: el gait perpetuo permite mantener el robot traccionando de forma continua durante una exhibición o un experimento de laboratorio.
- Benchmarking interno de políticas: comparar esta versión (v11) con las versiones previas publicadas por el mismo autor (v7, v8) para estudiar la evolución del entrenamiento sobre la misma tarea.
- Docencia de RL aplicado: usar el pipeline mjlab con 4096 entornos paralelos como ejemplo reproducible de entrenamiento masivamente paralelo en GPU, con semilla y commit fijados.
- Base para transferencia a otras tareas de locomoción del microduck: reutilizar la arquitectura MLP y el esquema de observación de 61 dimensiones como punto de partida para tareas como `walk`, `stand` o `kick_left`, que aparecen en las fichas de versiones anteriores del mismo autor.
- Validación de despliegue ONNX en hardware embebido: comprobar latencia y estabilidad del artefacto en la computadora de a bordo del microduck a 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README cita una cifra de 168.86 cm asociada a la optimización de trayectoria, pero no se especifica la métrica, el protocolo de evaluación ni el baseline, por lo que no puede presentarse como resultado de benchmark comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y el recuento de parámetros no se publica, aunque por la naturaleza de una MLP de control para un cuadrúpedo de 14 acciones es presumiblemente muy reducida (no confirmado por el autor).
- GPU recomendadas: no especificadas para inferencia; para el entrenamiento documentado se requieren 4096 entornos paralelos en GPU, lo que implica hardware de datacenter (A100/H100 o equivalente), aunque el README no indica el modelo de GPU utilizado.
- Cabe en GPU de consumo: no disponible; no se publican requisitos de memoria ni se confirma compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: el artefacto está en ONNX y se carga mediante `robotctl policy load` en el daemon de microduck. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de robótica.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican medidas de latencia real en el robot ni throughput de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| greecree/microduck-tug-of-war-tug-super-v11 | no disponible | no aplica (61-D obs.) | no publicado | no disponible | Hugging Face, 0 descargas |
| greecree/microduck-tug-of-war-tug-super-v8 | no disponible | no aplica | no publicado | no disponible | Hugging Face |
| greecree/microduck-tug-of-war-tug-super-v7 | no disponible | no aplica | no publicado | no disponible | Hugging Face |

Las alternativas identificadas en la búsqueda web son versiones previas del mismo autor sobre la misma tarea, no modelos independientes. No se ha identificado en la información disponible una política de terceros comparable para el microduck ni métricas que permitan ordenar estas versiones por rendimiento.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no puede asumirse permiso para uso comercial, redistribución o modificación; debe contactarse con el autor antes de cualquier uso productivo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso externo ni de validación por parte de la comunidad.
- El README no publica métricas de éxito de la tarea, curvas de recompensa, ablaciones ni comparación con baselines; las afirmaciones sobre optimización de trayectoria y liga de contrincantes no están respaldadas con datos.
- La reproducibilidad bit a bit no está garantizada por el propio autor; los pesos publicados no pueden regenerarse de forma idéntica.
- Política específica para la tarea de tira y afloja del microduck: no es un modelo general y no debe esperarse que funcione en otros robots, morfologías o tareas sin reentrenamiento.
- Riesgo de sobreajuste a la dinámica del simulador mjlab: no se documenta el grado de transferencia sim-a-real ni pruebas en hardware físico.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje; esos criterios no aplican.
- El uso de la política en un robot real implica riesgos físicos (caídas, sobrecarga de actuadores); no se documentan límites de seguridad ni paradas de emergencia asociadas al gait perpetuo.
- El artefacto depende del daemon `robotctl` y del esquema 2 de manifiesto; cambios de versión en el daemon pueden romper la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v11
- Versión previa v8: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Versión previa v7: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v7
- Repositorio de retos y entrenamiento: https://github.com/green-creeper/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (referenciada en el README como `docs/policy-manifest.md` del repo del daemon): no disponible como URL directa en la información proporcionada.
