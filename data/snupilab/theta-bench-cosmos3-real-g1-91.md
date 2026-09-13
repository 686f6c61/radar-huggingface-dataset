# snupilab/theta-bench-cosmos3-real-g1-91

## Resumen

theta-bench-cosmos3-real-g1-91 es un repositorio de resultados de entrenamiento publicado por snupilab dentro de la familia THETA Bench. No se trata de un modelo de lenguaje, sino de un artefacto de entrenamiento orientado a robótica: concretamente, la etapa de ajuste adicional de una política (policy) sobre el robot humanoide G1 con 91 demostraciones reales. El repositorio se declara heredero del modelo snupilab/theta-bench-cosmos3-sim-3003, que a su vez habría recibido 40.000 actualizaciones en simulación antes de esta fase real.

El dato más importante para cualquier evaluador es que la model card indica de forma explícita que esta etapa de entrenamiento no ha comenzado y que no hay ningún checkpoint entrenado disponible en el repositorio. Por tanto, a fecha de la información disponible, el artefacto publicado describe una configuración de entrenamiento y sus condiciones, pero no contiene pesos utilizables. El repositorio acumula 0 descargas y 0 likes, y no declara licencia.

La relevancia del repositorio es fundamentalmente metodológica: documenta el pipeline de transferencia de simulación a realidad (sim-to-real) de THETA Bench, con objetivos de optimización, tamaño de batch, número de GPUs y condiciones de tarea concretas (StickMove y HookRetrieve). No se publican parámetros, arquitectura detallada ni resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de policy robótica; la model card no especifica arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; las grabaciones son a 20 Hz) |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | en (inglés, según la metadata de la model card) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene checkpoint entrenado) |

Datos de entrenamiento declarados:

| Ajuste | Valor |
|---|---|
| Etapa | Entrenamiento adicional real G1, 91 demostraciones |
| Actualizaciones objetivo del optimizador | 5000 |
| Batch por GPU / GPUs / batch global | 16 / 8 / 128 |
| Acumulación de gradiente | 1 |
| Condiciones por batch global | 4 |
| Revisión del dataset | 47eca9322bb53fa1c685363271a87d2e414cb0e8 |
| Dataset | snupilab/theta-bench-teleop |
| Inicialización | snupilab/theta-bench-cosmos3-sim-3003 tras 40.000 actualizaciones en simulación |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo. El identificador del repositorio incluye el término "cosmos3", heredado del modelo base snupilab/theta-bench-cosmos3-sim-3003, pero no se aporta ninguna confirmación técnica sobre la familia arquitectónica, el número de parámetros ni el mecanismo de acción. Lo único verificable es que se trata de una política para robótica con acciones objetivo articulares (joint-target actions) grabadas a 20 Hz, y que requiere el adaptador de control real del G1; la propia model card advierte que no debe asumirse que un adaptador de simulación sea compatible.

El régimen de entrenamiento sí está documentado con precisión: 8 GPUs con batch por GPU de 16 y batch global de 128, sin acumulación de gradiente, 4 condiciones por batch global y un objetivo de 5000 actualizaciones del optimizador. La inicialización parte del checkpoint de simulación tras 40.000 actualizaciones, y esta fase añade 5000 actualizaciones nuevas usando las 91 demostraciones reales del dataset snupilab/theta-bench-teleop. Las cuatro condiciones reales declaradas son StickMove Standard/Reasoning y HookRetrieve Standard/Reasoning. El texto menciona el uso de optimizadores de modelo independientes y ejecución compartida en GPU mediante MPS, con publicación realizada por un cargador en CPU tras la validación final del checkpoint.

No se documenta ningún tipo de RLHF, DPO ni técnica de alineación, algo esperable en un artefacto de robótica. Tampoco se detalla la composición del dataset más allá de la revisión fijada y el enlace a los datos de teleoperación.

## Capacidades

- Ejecución de políticas de manipulación robótica: el repositorio está etiquetado con el pipeline `robotics` y orientado a un robot humanoide G1.
- Tareas declaradas: StickMove y HookRetrieve, cada una en variantes Standard y Reasoning, sumando cuatro condiciones de entrenamiento reales.
- Control a nivel de articulaciones: las grabaciones y las acciones se expresan a 20 Hz con acciones de objetivo articular, lo que implica control de bajo nivel sobre el hardware.
- Transferencia sim-to-real: la fase descrita parte de un modelo entrenado en simulación y lo ajusta con demostraciones reales de teleoperación.
- Compatibilidad declarada: requiere el adaptador nativo THETA y dependencias específicas del modelo. La model card niega explícitamente compatibilidad con cargadores arbitrarios de Transformers o de simulación.
- Generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling, function calling, uso de agentes y capacidades multilingües: no disponibles / no aplicables. No hay ninguna evidencia en la información proporcionada de que el artefacto soporte estas funciones.

## Casos de uso

Todos los casos siguientes se derivan del propósito declarado en la model card. Dado que no existe checkpoint publicado, su aplicabilidad práctica queda condicionada a que la etapa de entrenamiento se complete y se publique.

- Investigación en transferencia sim-to-real: el repositorio documenta la receta exacta (inicialización, número de actualizaciones, tamaño de batch, revisión del dataset) para replicar el ajuste de una política de simulación con 91 demostraciones reales sobre el G1.
- Manipulación de objetos tipo StickMove: una vez entrenado, el modelo estaría orientado a tareas de movimiento de un objeto alargado, con variantes estándar y con razonamiento, útil para estudiar cómo influye la formulación de la tarea en el comportamiento de la política.
- Manipulación tipo HookRetrieve: aplicación a tareas de recuperación mediante gancho, que requieren precisión en el contacto y coordinación de la trayectoria del efector final.
- Recolección y curación de datos de teleoperación: el enlace al dataset snupilab/theta-bench-teleop con revisión fijada permite auditar qué demostraciones concretas se usaron y reutilizarlas en otros experimentos.
- Diseño de experimentos con múltiples condiciones por batch: la configuración de 4 condiciones por batch global es un patrón reutilizable para entrenar una sola política que cubra varias tareas sin colapsar el gradiente hacia una de ellas.
- Reproductibilidad de pipelines robóticos: el repositorio fija revisión de dataset, hardware de entrenamiento y objetivo de pasos, lo que sirve como plantilla de trazabilidad en publicaciones de robótica.
- Estudio de adaptadores de control real frente a simulación: la advertencia sobre la incompatibilidad entre adaptadores es un caso de uso directo para trabajar en la capa de control del G1 y no en la política en sí.
- Evaluación comparativa de políticas THETA: el repositorio puede servir como referencia de configuración al comparar contra snupilab/theta-bench-cosmos3-sim-3003, aunque no se publique ninguna puntuación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card señala que "no se reclama ninguna puntuación de evaluación mediante la publicación del checkpoint". No existen, por tanto, métricas de éxito de tarea, tasas de éxito en simulación o en hardware, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica pesos ni especifica tamaño de modelo, por lo que no es posible estimar requisitos de memoria.
- Configuración de entrenamiento declarada: 8 GPUs con batch por GPU de 16 y batch global de 128, sin acumulación de gradiente. No se especifica el modelo de GPU ni la memoria por dispositivo.
- Ejecución compartida en GPU: la model card menciona MPS (ejecución compartida de procesos en GPU) como mecanismo de reparto entre los optimizadores independientes.
- Publicación: se realiza mediante un cargador en CPU tras la validación final del checkpoint.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica que debe usarse el adaptador nativo THETA y las dependencias específicas del modelo, y descarta explícitamente la compatibilidad con cargadores arbitrarios de Transformers o de simulación. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a una política de robótica.
- Latencia y throughput: no disponible. El único dato temporal es que las grabaciones se realizan a 20 Hz.

## Comparativa con modelos similares

No disponible. La búsqueda web no devolvió información relevante sobre THETA Bench, Cosmos3 ni políticas comparables; los resultados obtenidos correspondían a foros no relacionados. El único artefacto relacionado identificable es el modelo base declarado.

| Modelo | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| snupilab/theta-bench-cosmos3-real-g1-91 | Este repositorio | no disponible | no aplica | no disponible | Sin checkpoint entrenado |
| snupilab/theta-bench-cosmos3-sim-3003 | Modelo base (inicialización) | no disponible | no aplica | no disponible | Referenciado como origen del ajuste |
| Otras políticas robóticas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene ningún checkpoint entrenado: la model card afirma explícitamente que la etapa de entrenamiento no ha comenzado.
- No se declara licencia, por lo que el uso comercial queda sin cobertura legal clara y no puede asumirse permiso de uso.
- No se publica puntuación de evaluación alguna; cualquier afirmación de rendimiento sería una invención.
- No se especifican arquitectura, número de parámetros ni formato de pesos, lo que impide estimar coste de inferencia o requisitos de memoria.
- El adaptador de control real del G1 es obligatorio para ejecutar acciones de objetivo articular; usar un adaptador de simulación puede provocar un comportamiento incorrecto sobre hardware real.
- No hay compatibilidad declarada con cargadores genéricos de Transformers ni de simulación; la integración exige las dependencias nativas de THETA.
- El dataset de teleoperación está fijado a una revisión concreta; cambios posteriores en el dataset no están cubiertos por esta configuración.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo, y el ámbito de aplicación es robótico, no lingüístico.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto; sí existe el riesgo habitual en políticas robóticas de generalizar de forma incorrecta fuera de las cuatro condiciones entrenadas (StickMove y HookRetrieve, en sus variantes Standard y Reasoning).
- Limitación de idioma: la metadata declara únicamente inglés; no se documentan capacidades multilingües.
- Los metadatos indican fechas de creación y actualización de 2026-09-13, posteriores a la fecha de consulta habitual; conviene verificar la vigencia del repositorio antes de citarlo.
- El número de descargas y de likes es cero, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/snupilab/theta-bench-cosmos3-real-g1-91
- Modelo base (inicialización): https://huggingface.co/snupilab/theta-bench-cosmos3-sim-3003
- Dataset de teleoperación: https://huggingface.co/datasets/snupilab/theta-bench-teleop
- Datos de entrenamiento fijados (revisión 47eca9322bb53fa1c685363271a87d2e414cb0e8): https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/47eca9322bb53fa1c685363271a87d2e414cb0e8/hardware
- Paper, blog, repositorio de código o demo adicionales: no disponible en la información proporcionada.
