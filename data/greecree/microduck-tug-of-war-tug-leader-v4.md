# greecree/microduck-tug-of-war-tug-leader-v4

## Resumen

`greecree/microduck-tug-of-war-tug-leader-v4` es una política de control entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo fundacional: es una política de locomoción especializada en la tarea de tira y afloja (tug of war), exportada a ONNX y empaquetada según el esquema de manifiesto de políticas del daemon `robotctl`. Recibe observaciones de 61 dimensiones y emite 14 acciones de control a 50 Hz, y está diseñada para ejecutarse de forma perpetua hasta que se le indique lo contrario.

El autor la describe como una versión afinada para "tirones más profundos en el borde del foso" sobre las semillas de rating y con combates cara a cara invictos. Es la cuarta iteración de una familia de políticas de la misma tarea (`tug-leader-v4`), entrenada con el stack `mjlab-microduck` sobre el `task_id` `Mjlab-TugOfWar-MicroDuck`, con 4096 entornos paralelos, semilla 1 y checkpoint 250.

Su relevancia es acotada pero clara para quien trabaja en robótica con RL: es un artefacto reproducible (commit, lockfile y comando documentados) que sirve como referencia de política de competición y como baseline para experimentos de sim-to-real en un robot de bajo coste. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se declara licencia, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL exportada a ONNX; la topología de red no se detalla en la model card) |
| Parametros totales | No disponible (tamaño del repo: 0.0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica: política de control reactiva, sin ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (se distribuye un `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no aplica: no procesa lenguaje natural) |
| Licencia | No disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

Otros datos operativos declarados: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, normalizador de observaciones embebido en el propio `policy.onnx` (se alimenta con observaciones en crudo).

## Arquitectura y entrenamiento

La model card no especifica la arquitectura de la red. Por el contexto del ecosistema (`mjlab`, exportación a ONNX, política de 61→14) se trata de una política de control entrenada por refuerzo, presumiblemente una red MLP de política, pero este extremo no está confirmado en la información disponible y no debe asumirse. Lo que sí está documentado es el contrato de interfaz: entrada de 61 dimensiones sin preprocesado externo, salida de 14 acciones, 50 Hz, comportamiento perpetuo (no episódico desde el punto de vista del despliegue).

El entrenamiento se realizó con el stack `mjlab-microduck` 0.1.0 (commit base `981a279c6`), sobre la tarea `Mjlab-TugOfWar-MicroDuck` del repositorio `green-creeper/microduck-challenges` (rama `main`, commit `4b675ebf4`). Configuración declarada: 4096 entornos en paralelo, semilla 1, `max-iterations` 1000 y checkpoint publicado en la iteración 250. El registro se hizo con TensorBoard bajo el nombre de ejecución `tug-leader-v1`. No se documentan número total de pasos de entorno, composición del dataset (al ser RL no hay dataset supervisado), ni uso de RLHF/DPO, que no aplican en este dominio.

El autor advierte explícitamente que el entrenamiento no es bit-reproducible: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación, etc.).

## Capacidades

- Locomoción cuadrúpeda especializada en tareas de tracción y agarre de cuerda (tug of war) sobre la plataforma microduck.
- Control reactivo a 50 Hz con observaciones de 61 dimensiones y 14 salidas de acción.
- Ejecución perpetua: la política mantiene el comportamiento indefinidamente hasta que el operador la descarga o la sustituye.
- Autocontenida en un único `policy.onnx` con el normalizador de observaciones embebido, lo que simplifica el despliegue (no requiere pipeline de preprocesado aparte).
- Integración con el gestor de políticas del daemon mediante `robotctl policy load <slot> ...` y manifiesto con esquema 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control motor, no un modelo generativo.

## Casos de uso

- Competición y demostraciones de tug of war robótico: cargar la política en un slot del microduck y ejecutar combates cara a cara; el autor la presenta como afinada para tirones en el borde del foso sobre las semillas de rating.
- Baseline de referencia en investigación de RL para locomoción: al estar documentados commit, semilla y comando de entrenamiento, sirve para comparar nuevas políticas contra un punto de partida conocido en la tarea `Mjlab-TugOfWar-MicroDuck`.
- Validación de sim-to-real: permite comprobar si una política entrenada con 4096 entornos paralelos transfiere al hardware real sin retoques, y medir la brecha entre simulación y robot.
- Política maestra para destilación o como profesor en un esquema student-teacher: su comportamiento especializado en tracción es un objetivo concreto para generar datos de imitación.
- Prueba de regresión del runtime de políticas: al ser un ONNX pequeño con manifiesto de esquema 2, sirve para verificar que el daemon `robotctl` carga, normaliza y ejecuta políticas correctamente tras cambios en el sistema.
- Docencia y divulgación en robótica: ejemplo completo y reproducible de un ciclo RL completo (entrenamiento, exportación ONNX, despliegue en robot) para cursos y talleres.
- Evaluación de estrategias por oponente: usar esta política como oponente fijo en torneos internos para medir el rendimiento relativo de otras políticas de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye únicamente afirmaciones cualitativas del autor ("tuned for deeper pit-edge pulls on the rating seeds and undefeated head-to-head bouts") sin métricas, número de combates, tasa de victorias ni protocolo de evaluación. No se deben interpretar como resultados reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0.0 GB, lo que sitúa el artefacto en el orden de kilobytes o pocos megabytes. La inferencia de una política de este tipo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican. Para entrenamiento, la configuración declarada de 4096 entornos paralelos sugiere una GPU de datacenter (A100/H100) o, como mínimo, una GPU con memoria abundante; el autor no indica el hardware empleado.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del artefacto; no hay confirmación explícita ni lista de GPUs validadas.
- Despliegue: ONNX Runtime en el computador de a bordo del microduck mediante el daemon `robotctl` (`sudo robotctl policy load <slot> greecree/microduck-tug-of-war-tug-leader-v4`). vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control está fijado a 50 Hz (20 ms por ciclo); no se publican latencias medidas por inferencia ni throughput del runtime.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones técnicas de políticas comparables en la información proporcionada. La referencia más directa es la propia familia de versiones del mismo autor, de la que solo se conoce el nombre (`tug-leader-v4` implica versiones anteriores), sin datos públicos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-of-war-tug-leader-v4 | no disponible | no aplica | no disponible (solo afirmaciones cualitativas) | no disponible | HuggingFace, 0 descargas |
| Versiones previas de la familia tug-leader (v1-v3) | no disponible | no aplica | no disponible | no disponible | no verificadas en la información disponible |
| Otras políticas del ecosistema microduck | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier despliegue en producción.
- Modelo de nicho y sin validación externa: 0 descargas y 0 likes; no hay evidencia independiente de que la política funcione fuera del entorno del autor.
- Especialización extrema: está entrenada para una única tarea (tug of war) y un único robot (microduck). No es reutilizable como política general de locomoción sin reentrenamiento.
- Sesgos de simulación: al provenir de entrenamiento masivo en simulación (4096 entornos), es esperable una brecha sim-to-real; el autor no reporta tasas de éxito en hardware físico.
- No reproducibilidad bit a bit: el propio autor advierte que reentrenar con la misma semilla produce pesos distintos, lo que complica la auditoría y la comparación exacta de resultados.
- Sin métricas de seguridad ni de robustez: no se documentan comportamientos ante fallos, límites de par, saturaciones o condiciones de emergencia del robot.
- Idiomas y contexto: no aplica; cualquier expectativa de uso como modelo de texto, código o razonamiento es un error de categoría.
- Ausencia de información sobre sesgos: no hay datos que permitan evaluar sesgos de comportamiento (por ejemplo, asimetrías según el oponente o el terreno).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/greecree/microduck-tug-of-war-tug-leader-v4
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y código de entrenamiento: https://github.com/green-creeper/microduck-challenges
- Manifiesto de políticas (documentación referenciada, `docs/policy-manifest.md` del repositorio del daemon): no disponible como URL directa en la información proporcionada
- Stack base de entrenamiento `mjlab-microduck 0.1.0 @ 981a279c6`: repositorio no enlazado en la model card
