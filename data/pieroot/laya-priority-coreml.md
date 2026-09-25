# pieroot/laya-priority-coreml

## Resumen

`pieroot/laya-priority-coreml` es una conversión a Core ML del checkpoint en inglés de `convaiinnovations/laya` (revisión `55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851`), publicada por el usuario pieroot. No se trata de una exportación de propósito general: el grafo incluido se ha recortado a una única pregunta binaria fija de tipo `choice`, cuya finalidad es decidir si una tarea pendiente debe abordarse ahora o posponerse. La salida se limita a los `logits` pre-temperatura de la cabeza `DecisionModel.scorer`, con forma `[1,2]` correspondiente a `[now, later]`.

El interés del artefacto es doble. Por un lado, demuestra un flujo de conversión con paridad verificable entre PyTorch y Core ML (error absoluto máximo de 0,0 entre el modelo fuente y su traza, y acuerdo de argmax en 48/48 casos frente al modelo nativo). Por otro, documenta de forma explícita que el modelo no supera el umbral de calidad exigido: 17/24 (70,8 %) en inglés y 15/24 (62,5 %) con texto coreano traducido automáticamente al inglés sobre un conjunto de 48 elementos, por debajo de la puerta de 80 % de precisión y 70 % de recall fijada por el propio exportador.

Se publica a petición expresa de la aplicación consumidora, manteniendo un mecanismo de reserva basado en reglas para los casos degradados. La licencia es Apache 2.0 y el paquete ocupa 0,8 GB, en formato Core ML FP16 orientado a ejecución en el Neural Engine de Apple Silicon. No hay datos públicos sobre el número de parámetros, la composición del dataset de entrenamiento ni el pipeline de alineación del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (grafo de decisión derivado de `convaiinnovations/laya`; el informe de colocación de operadores de Core ML registra 120 `linear`, 56 `matmul`, 61 `layer_norm` y 28 `softmax`, compatible con un codificador tipo transformer, aunque el autor no lo confirma) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | 512 tokens (`max_len=512`, `head_max_len=192`) |
| Tipos de cuantizacion | FP16 (paquete publicado); existe una variante FP32 no publicada |
| Idiomas soportados | inglés (checkpoint en inglés); se evaluó además con texto coreano traducido automáticamente al inglés |
| Licencia | Apache 2.0 (pesos © Convai Innovations; grafo de conversión y exportación Core ML del propietario del repositorio) |
| Formato de pesos | Core ML `.mlpackage` (FP16, salida solo de `logits`), más `tokenizer.json`, `tokenizer_config.json` y `laya_manifest.json` |
| Entradas | `int32`: `input_ids [1,512]`, `attention_mask [1,512]`, `marker_pos [1,2]`, `marker_mask [1,2]`, `qtype [1]` |
| Salida | `float32`: `logits [1,2]` — `[now, later]`, logits crudos pre-temperatura |
| Tokens especiales | `pad=50283`, `cls=50281`, `sep=50282`, `mask=50284` |
| Formato de secuencia | `laya.common.build_sequence` del repositorio original, con una única pareja instrucción/opción fija (véase `laya_manifest.json`) |
| Tamaño del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-09-24 (última actualización: 2026-09-24) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni sobre el entrenamiento del modelo original `convaiinnovations/laya`: la model card de este repositorio describe exclusivamente el proceso de conversión y sus evidencias de paridad. Lo que sí se detalla es que el grafo exportado está restringido al subgrafo de decisión binaria de prioridad, con una única pregunta `choice` fija, y que la salida procede de la cabeza `DecisionModel.scorer` sin aplicar temperatura. El formato de secuencia sigue la función `laya.common.build_sequence` del repositorio de origen, con `max_len=512` y `head_max_len=192`.

La innovación técnica reseñable no está en el modelo, sino en la ingeniería de exportación. La conversión mantiene paridad exacta entre el PyTorch fuente y el PyTorch trazado (error absoluto máximo de 0,0 en 24 casos). Frente al modelo nativo en Core ML con `CPU_AND_NE`, el acuerdo de argmax es de 48/48 casos, con un error absoluto máximo de logits de 0,2274 y un error máximo de margen entre opciones de 0,2588. El informe `MLComputePlan` de Swift indica que 1188 de aproximadamente 1220 operadores conocidos se asignan preferentemente al Neural Engine (120 `linear`, 56 `matmul`, 61 `layer_norm`, 28 `softmax`), mientras que 32 se prefieren en CPU; se trata de un informe de colocación del compilador, no de una traza de ejecución en dispositivo. Una variante FP32 reproduce el modelo fuente casi exactamente (error absoluto máximo de 1,4e-5), pero el compilador prefiere CPU para todos sus operadores, por lo que no es un artefacto apto para ANE y no se ha publicado.

## Capacidades

- Toma de decisión binaria de prioridad: dados un elemento de tarea y una pregunta fija, devuelve dos logits que indican si debe actuarse ahora (`now`) o posponerse (`later`).
- Salida estrictamente numérica: solo `logits` pre-temperatura, sin generación de texto, sin explicaciones y sin pasos intermedios.
- Clasificación con marcado explícito: emplea `marker_pos` y `marker_mask` para señalar los tramos relevantes de la secuencia de entrada.
- Discriminación por tipo de pregunta: incluye la entrada `qtype` para identificar la pregunta `choice` fija.
- Ejecución en dispositivo sobre Apple Silicon: el grafo se ha diseñado para que la mayoría de operadores se asignen al Neural Engine.
- Capacidad multilingüe: no declarada. El checkpoint es en inglés; la evaluación con coreano se realizó traduciendo el texto al inglés antes de la inferencia, por lo que no existe soporte nativo de otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (*thinking*): no disponible.
- Visión, audio u otras modalidades: no disponible.
- Generación de código, matemáticas o conocimiento general: no disponible; el grafo está recortado a la decisión de prioridad.

## Casos de uso

- Triaje de listas de tareas en aplicaciones de productividad: la aplicación construye la secuencia con `build_sequence`, invoca el paquete Core ML y usa el argmax sobre `[now, later]` para ordenar o posponer elementos. Es adecuado porque la decisión requiere solo 512 tokens de contexto y se ejecuta localmente.
- Priorización de notificaciones en el dispositivo: el modelo puede evaluar el texto de una notificación entrante y decidir si merece atención inmediata o puede agruparse en un resumen posterior, sin enviar datos a servidores externos.
- Gestión de bandeja de entrada y correo: clasificación de mensajes como «responder ahora» o «dejar para después» dentro de un cliente de correo nativo de macOS o iOS, con el resultado combinado con reglas heurísticas cuando el margen entre logits es bajo.
- Orquestación de agentes con puerta de decisión: en un sistema multi-agente, este modelo puede actuar como filtro de bajo coste que decide si una subtarea se ejecuta de inmediato o se encola, reservando modelos generativos mayores para los casos en los que sí se decide actuar.
- Automatización de flujos con reserva basada en reglas: el exportador indica que la aplicación consumidora mantiene un mecanismo de reserva para casos degradados; un uso realista es enrutar al modelo las decisiones con margen alto y delegar en reglas el resto.
- Procesamiento por lotes en macOS o iOS sin GPU dedicada: al estar en formato Core ML con preferencia por el Neural Engine, encaja en aplicaciones de escritorio o móviles que necesitan clasificación de prioridad continua con consumo energético contenido.
- Prototipado e investigación en exportación Core ML: sirve como referencia reproducible de conversión con paridad verificable, útil para equipos que quieran medir la discrepancia entre PyTorch y Core ML en cabezas de clasificación pequeñas.

## Benchmarks y rendimiento

Evaluación cero-disparo del autor sobre un conjunto balanceado de 48 elementos (fixture), con la pregunta de prioridad del checkpoint:

| Conjunto de evaluación | Aciertos | Exactitud | Umbral exigido | Resultado |
|---|---|---|---|---|
| Inglés (24 elementos) | 17/24 | 70,8 % | 80 % precisión / 70 % recall | No supera la puerta |
| Coreano traducido automáticamente al inglés (24 elementos) | 15/24 | 62,5 % | 80 % precisión / 70 % recall | No supera la puerta |

Evidencias de paridad de la conversión (no son benchmarks de calidad):

| Comparación | Casos | Métrica | Valor |
|---|---|---|---|
| PyTorch fuente frente a PyTorch trazado | 24 | Error absoluto máximo | 0,0 (exacto) |
| Core ML nativo (`CPU_AND_NE`) frente al fuente | 48 (24 inglés + 24 coreano→inglés) | Acuerdo de argmax | 48/48 |
| Core ML nativo frente al fuente | 48 | Error absoluto máximo de logits | 0,2274 |
| Core ML nativo frente al fuente | 48 | Error absoluto máximo de margen entre opciones | 0,2588 |
| Variante FP32 (no publicada) frente al fuente | no disponible | Error absoluto máximo | 1,4e-5 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. El conjunto de evaluación es de 48 elementos, por lo que la incertidumbre estadística de estos porcentajes es elevada.

## Requisitos de hardware

- Plataforma objetivo: Core ML sobre Apple Silicon. Se solicitó explícitamente `CPU_AND_NE` en la conversión, lo que habilita el uso del Neural Engine además de la CPU.
- Colocación de operadores: según `MLComputePlan` de Swift, 1188 de aproximadamente 1220 operadores conocidos se prefieren en el Neural Engine y 32 en CPU. Es un informe de colocación del compilador, no una traza de dispositivo en tiempo de ejecución.
- VRAM estimada: no disponible. El repositorio ocupa 0,8 GB, pero no se desglosa el tamaño del `.mlpackage` ni la huella en memoria en ejecución.
- GPU compatibles: no aplica en el formato publicado. No hay soporte CUDA ni ROCm: el artefacto es un `.mlpackage` que requiere el runtime de Core ML.
- GPU de consumo: no aplica. El equivalente práctico son los chips de Apple (series M y los SoC A recientes con Neural Engine); no se especifica una generación mínima compatible.
- Opciones de despliegue: Core ML a través de Xcode, `coremltools` para inspección y Swift (`MLModel`, `MLComputePlan`) para inferencia; el paquete es «compiled-at-load», es decir, se compila al cargarse.
- Formatos alternativos: solo se publica el paquete FP16. Una variante FP32 existe pero no se ha publicado porque el compilador la asigna íntegramente a CPU y no aprovecha el Neural Engine.
- Latencia y throughput: no disponible. No se han publicado medidas de tiempo por inferencia ni de elementos por segundo.
- vLLM, llama.cpp, Ollama o TGI: no aplicables a este formato.

## Comparativa con modelos similares

No se han encontrado en la información disponible modelos comparables publicados por terceros para esta tarea concreta. La comparación factible es contra el propio material de origen y contra la alternativa heurística:

| Elemento | Tipo | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pieroot/laya-priority-coreml` | Exportación Core ML recortada a decisión binaria | 512 tokens | `logits [1,2]` | Apache 2.0 | Pública (0 descargas, 0 likes) |
| `convaiinnovations/laya` (checkpoint inglés, revisión `55cf4c4`) | Modelo fuente en PyTorch | 512 tokens | Cabeza `DecisionModel.scorer` | Apache 2.0 | Upstream del que deriva esta conversión |
| Variante FP32 de este grafo | Exportación Core ML de precisión completa | 512 tokens | `logits [1,2]` | Apache 2.0 | No publicada; el compilador la asigna a CPU |
| Reserva basada en reglas de la aplicación consumidora | Heurística determinista | no aplica | Decisión `now`/`later` | no aplica | Interna de la aplicación |

No hay datos de parámetros, contexto ampliado, tool calling ni benchmarks públicos de terceros que permitan una comparación cuantitativa adicional con alternativas de la misma categoría.

## Limitaciones y advertencias

- Calidad insuficiente según el propio exportador: 70,8 % en inglés y 62,5 % en coreano traducido, ambas por debajo de la puerta de 80 % de precisión y 70 % de recall fijada para su publicación.
- El autor advierte explícitamente de que el artefacto no debe considerarse validado para uso general ni presentarse su salida como de alta confianza.
- El conjunto de evaluación es de solo 48 elementos (24 en inglés y 24 traducciones automáticas), por lo que las cifras tienen un margen de error amplio y no son extrapolables a dominios distintos.
- La evaluación en coreano se hizo sobre texto traducido automáticamente al inglés; no hay soporte multilingüe nativo ni datos sobre otros idiomas.
- El grafo está recortado: solo incluye el subgrafo de decisión de prioridad con una única pregunta fija. No sirve para otras preguntas, otras tareas de Laya ni generación de texto.
- La salida son logits crudos pre-temperatura; cualquier calibración, umbral o transformación en probabilidad debe implementarla la aplicación consumidora, y el margen entre opciones puede ser pequeño (error máximo de margen de 0,2588 frente al modelo fuente).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea sistemática en los casos degradados; el exportador recomienda mantener la reserva basada en reglas.
- Sesgos: no disponibles. No se documenta la composición del dataset de entrenamiento ni análisis de sesgo del modelo original.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribución; los pesos son © Convai Innovations y la conversión pertenece al propietario del repositorio, por lo que conviene revisar la licencia del checkpoint original antes de redistribuir.
- Dependencia de plataforma: al ser un `.mlpackage`, el despliegue queda ligado al ecosistema Apple y al runtime de Core ML.
- Mantenimiento: el repositorio registra 0 descargas y 0 likes, y las fechas de creación y actualización son del mismo día, con ocho segundos de diferencia, lo que sugiere que no ha habido revisión posterior.
- No hay información sobre el número de parámetros, el coste de inferencia ni la huella de memoria, lo que dificulta planificar su integración en producción.

## Enlaces

- [HuggingFace: pieroot/laya-priority-coreml](https://huggingface.co/pieroot/laya-priority-coreml)
- [Modelo fuente: convaiinnovations/laya](https://huggingface.co/convaiinnovations/laya) (referenciado en la model card; revisión `55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851`)
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos por el buscador no guardaban relación con el modelo ni con inteligencia artificial, por lo que se descartan y no se incluyen.
