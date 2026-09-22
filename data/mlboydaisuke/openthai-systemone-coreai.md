# mlboydaisuke/OpenThai-SystemOne-CoreAI

## Resumen

OpenThai-SystemOne-CoreAI es un modelo de decisión (no generativo) publicado por el usuario mlboydaisuke sobre el modelo base iapp/OpenThai-SystemOne, a su vez derivado de Qwen/Qwen3.5-0.8B-Base. En lugar de producir texto, el modelo lee un estado y una pregunta tipada (Choice, Score o Noul) y devuelve probabilidades sobre opciones. La torre de texto del Qwen3.5 original se continuó preentrenando en tailandés y su cabeza de modelado de lenguaje se sustituyó por una cabeza de 256 slots sesgada, con lectura en el token `<|ts_answer|>`.

El modelo se distribuye como bundles `.aimodel` para Core AI, el runtime de ML en dispositivo de Apple (sucesor de Core ML según el autor), exportados con `coreai-torch`. Se publican dos variantes: `int8lin` como bundle de envío y `fp16` como referencia, ambas con una ventana de contexto de 4096 tokens y salida `logits` de forma `[1, 1, 256]`. El repositorio ocupa 2,6 GB e incluye ambos bundles.

Su relevancia es acotada pero específica: cubre un nicho poco poblado, el de modelos de decisión tailandés-inglés ejecutables en dispositivo mediante Neural Engine o GPU de Apple Silicon. Con 0 descargas y 0 «likes» en HuggingFace, y con referencias a versiones de sistema no verificables de forma independiente, debe considerarse un artefacto experimental orientado a evaluación técnica más que a producción estable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), receta de decodificación sin bucle y S=1; cabeza de decisión de 256 slots en la posición de `lm_head` |
| Parametros totales | Aproximadamente 800 millones (base Qwen/Qwen3.5-0.8B-Base); el autor no publica un recuento exacto |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | int8lin (bundle de envío) y fp16 (bundle de referencia) |
| Idiomas soportados | Tailandés (th) e inglés (en), incluido texto mixto |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundles `.aimodel` de Core AI (int8lin y fp16), exportados con `coreai-torch` / `coreai.llm.export` |
| Tarea declarada | zero-shot-classification (decisión, no generación) |
| Tipo de salida | `logits` con forma `[1, 1, 256]`; índices de slot no son identificadores de token del vocabulario |
| Token de lectura | `<|ts_answer|>`, id 248082 |
| Embedding | 248.339 filas |
| Temperaturas del checkpoint | choice 1.058534; score 1.043141; noul 1.006767 (derivadas de `exp(log_temperature)`) |
| Tamaño del repositorio | 2,6 GB |

## Arquitectura y entrenamiento

El grafo sigue la receta Qwen3.5 de solo decodificación, sin bucle y con pasos S=1, con tres modificaciones respecto al modelo base: el prefijo de pesos `model.*`, un embedding de 248.339 filas y la cabeza de slots ubicada en la posición que ocupaba `lm_head`. La torre de texto se continuó preentrenando en tailandés y la cabeza de lenguaje se reemplazó por una cabeza de 256 slots con sesgo. Cada pregunta se procesa como una fila independiente, sin plantilla de chat ni token BOS, y la respuesta se lee en el token `<|ts_answer|>` (id 248082). No se menciona en la información disponible el uso de RLHF, DPO ni de decodificación especulativa.

La conversión a Core AI produce dos assets: `int8lin` como bundle de envío y `fp16` como referencia. La lectura se realiza tomando los 256 logits de la última llamada. Para `k` opciones, el procedimiento indicado es dividir todos los logits de slot por la temperatura del tipo de pregunta, enmascarar los slots `k..254` a infinito negativo, aplicar softmax sobre los 256 slots y renormalizar `p_full[:k]`. El slot 255 se reserva como abstención. Las opciones de Choice conservan el orden de la petición; Score usa `<|ts_score|>` con 2 a 10 niveles; Noul usa `<|ts_noul|>` con slots `0 = no` y `1 = sí`. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Decisión por clasificación: devuelve probabilidades sobre opciones en lugar de texto generado. El modelo nunca genera texto.
- Tipo Choice: selección entre opciones, con soporte de hasta 255 opciones y conservación del orden de la petición.
- Tipo Score: puntuación en una escala de 2 a 10 niveles mediante `<|ts_score|>`.
- Tipo Noul: decisión binaria sí/no mediante `<|ts_noul|>`, con slots `0 = no` y `1 = sí`, aceptando descripciones de falso/verdadero cuando se proporcionan.
- Abstención: el slot 255 se conserva como probabilidad de abstención. Según el autor, la API expone abstención solo para Choice.
- Confianza: calculada como uno menos la entropía normalizada. Score expone probabilidades y confianza; Noul expone la probabilidad de «sí».
- Multilingüismo: tailandés e inglés, incluyendo texto mixto, estados en formato de diccionario y estados en formato de lista.
- Entrada estructurada: consume un estado más preguntas tipadas con marcadores `<|ts_state|>`, `<|ts_q|>`, `<|ts_choice|>`, `<|ts_opt_N|>`.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio, ni modo de pensamiento.

## Casos de uso

- Clasificación de tickets de soporte en tailandés: el modelo recibe el texto del ticket como estado y una pregunta de tipo Choice con las categorías del sistema de ticketing, devolviendo la probabilidad de cada categoría con hasta 255 opciones disponibles.
- Enrutado de consultas en asistentes bilingües th/en: dado el mensaje del usuario y la lista de intenciones del bot, el modelo produce la distribución sobre intenciones, lo que permite seleccionar el flujo de conversación en lugar de encadenar un generador de texto.
- Selección de herramienta en un pipeline de agentes: la consulta actúa como estado y cada herramienta disponible como opción de una pregunta Choice; la salida se usa como señal de enrutado antes de invocar la herramienta real.
- Encuestas de satisfacción con escala: con el tipo Score y 2 a 10 niveles, el modelo convierte texto libre en una puntuación ordinal con probabilidades por nivel y una medida de confianza asociada.
- Verificación binaria de contenido o de requisitos: con el tipo Noul se resuelve una condición sí/no sobre un estado dado, útil para validaciones de formularios, comprobación de políticas o filtros previos.
- Etiquetado asistido y weak supervision: al devolver distribuciones completas en lugar de una única etiqueta, permite umbralizar por confianza y derivar a revisión humana los casos con entropía alta o con abstención elevada.
- Procesamiento en dispositivo en apps de iOS y macOS: al ejecutarse como bundle de Core AI sobre GPU o Neural Engine, permite tomar decisiones sobre datos sensibles sin enviarlos a un servidor, siempre que se cumplan los requisitos de runtime indicados por el autor.
- Derivación a agente humano: usando el slot de abstención (Choice), se puede marcar automáticamente una consulta como no resoluble por el sistema y escalarla a una persona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El autor publica únicamente mediciones de fidelidad de la conversión frente a su oráculo fp32, realizadas en una GPU de Apple M4 Max con macOS 27.0 (26A428), el 23 de septiembre de 2026:

| Métrica | fp16 (referencia) | int8lin (envío) |
|---|---:|---:|
| argmax de opción = oráculo fp32 del autor | 50/50 | 50/50 |
| argmax con margen del oráculo ≥ 0,02 | 49/49 | 49/49 |
| Máx. \|Δp\| sobre probabilidades de opción | 0,005059 | 0,020813 |
| Media del \|Δp\| medio por fila | 0,000225 | 0,000659 |
| Máx. \|Δabstención\| | 0,016488 | 0,018837 |
| Primer token en pipeline Swift = argmax de slot crudo decodificado | 50/50 | 50/50 |
| Primer token secuencial Swift = argmax de slot crudo decodificado | 50/50 | 50/50 |
| Reinicio de estado, logits de la fila 1 idénticos bit a bit | sí | sí |

Datos adicionales del contrato de conversión: la única fila por debajo del margen de 0,02 es `r18-slot` (0,009739), que coincide en ambos bundles; la mayor diferencia de probabilidad en int8lin es `r05-dry`, una fila Noul de dos opciones con margen de oráculo 0,061681. La puerta de validación exige coincidencia de argmax de opción en todas las filas con margen ≥ 0,02, logits finitos y la prueba de reinicio de estado. El fixture contiene 18 peticiones: 48 filas de kit (24 Choice, 14 Noul, 10 Score) más dos filas con 40 y 255 opciones, y cubre tailandés, inglés, texto mixto, estados de tipo dict y de tipo lista.

Advertencia de comportamiento: la API de una sola pasada del autor coloca varias preguntas en una misma secuencia causal, y sus respuestas a preguntas posteriores pueden diferir de las de filas independientes, con un máximo de \|Δp\| de 0,375453 en estas peticiones. El ensamblaje oráculo fp32 por filas independientes coincide exactamente con la API de una sola pregunta del autor en 18/18 peticiones (50/50 llamadas). Como referencia del runtime y no de este modelo, el autor cita que Qwen3-8B en 4 bits decodifica a 94 tok/s en GPU M4 Max con Core AI, frente a 90 con MLX bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como estimación a partir del tamaño del repositorio (2,6 GB, que incluye ambos bundles y assets), el bundle int8lin rondaría los 0,8-1 GB y el fp16 los 1,6-2 GB, más el estado de la caché KV para 4096 tokens, cuyo tamaño no se especifica.
- GPU recomendadas: el autor reporta mediciones en GPU de Apple M4 Max. Para el runtime Core AI, el destino son GPU y Neural Engine de Apple Silicon en iOS 27 / macOS 27.
- Compatibilidad con GPU de consumo: no hay datos publicados sobre ejecución en GPU NVIDIA (RTX 4090, A100, H100) ni sobre soporte CUDA. El modelo está empaquetado como bundle `.aimodel`, no como pesos estándar.
- Opciones de despliegue: runtime Core AI (Python runtime con `SpecializationOptions.default()`), `coreai-torch` para la exportación, y el `llm-runner` en Release con `COREAI_CHUNK_THRESHOLD=1` para la comprobación de motor. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en GGUF ni safetensors.
- Latencia y throughput: no disponibles para este modelo. El único dato de throughput citado (94 tok/s) corresponde a Qwen3-8B 4-bit en el mismo runtime y no es extrapolable.
- Particularidades de ejecución: cada fila se procesa con estados cero nuevos y `position_ids` completos en cada paso S=1; el autor documenta que eliminar el salto de línea final tras `<|ts_answer|>` altera los logits del oráculo fp32 como máximo 0,000018597 (tolerancia 0,0001).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la misma categoría (modelos de decisión tailandeses ejecutables en dispositivo). La comparación se limita a los modelos emparentados:

| Modelo | Relación | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mlboydaisuke/OpenThai-SystemOne-CoreAI | Este modelo, conversión a Core AI | ~0,8 B (no confirmado por el autor) | 4096 tokens | 256 slots de decisión | Apache-2.0 | Bundle `.aimodel` int8lin y fp16 |
| iapp/OpenThai-SystemOne | Modelo base directo (revisión f3709948) | No disponible | No disponible | No disponible | No disponible | Pesos del modelo base en HuggingFace |
| Qwen/Qwen3.5-0.8B-Base | Base última del linaje | ~0,8 B | No disponible | Generación de texto | No disponible en la información consultada | Pesos del modelo base |
| Modelos de clasificación zero-shot genéricos | Alternativa funcional | No disponible | No disponible | Etiquetas o probabilidades | Variable | Variable |

Criterio diferencial frente a un clasificador zero-shot convencional: este modelo no recibe etiquetas en lenguaje natural como clases arbitrarias, sino que requiere el contrato de marcadores `<|ts_*|>` y un conjunto de opciones indexadas por slot, además de ejecutarse exclusivamente en el runtime Core AI.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto en ningún caso. No puede usarse como asistente conversacional ni como generador, solo como cabecera de decisión con probabilidades.
- Requiere código personalizado: la etiqueta `custom_code` implica ejecutar código del autor, con el riesgo de seguridad asociado a `trust_remote_code`.
- Contrato de entrada rígido: exige el formato exacto con marcadores `<|ts_state|>`, `<|ts_q|>`, `<|ts_choice|>` / `<|ts_score|>` / `<|ts_noul|>` y `<|ts_opt_N|>`, sin plantilla de chat ni BOS. Un formato distinto invalida la lectura.
- Índices de slot no equivalen a identificadores de token: confundir los 256 slots con el vocabulario produce resultados sin sentido.
- Inconsistencia documentada de temperaturas: los valores del checkpoint (choice 1.058534, score 1.043141, noul 1.006767) difieren de los citados en la model card v0.3 del autor (choice 1.055, score 1.008, noul 1.047). Hay que fijar explícitamente qué fuente se usa.
- Dependencia de la independencia de filas: la API de una sola pasada coloca varias preguntas en una misma secuencia causal y puede desviarse hasta \|Δp\| 0,375453 respecto a filas independientes. En producción conviene procesar una pregunta por fila.
- Capacidad de abstención limitada: según el autor, la abstención solo se expone para Choice; Score y Noul no ofrecen ese mecanismo directamente.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar probabilidad alta a opciones incorrectas en estados ambiguos o fuera de distribución. La fila `r18-slot` ya muestra un margen de oráculo de solo 0,009739.
- Cobertura de idiomas limitada a tailandés e inglés, incluido texto mixto. No hay evidencia de comportamiento en otros idiomas.
- Sesgos: no disponibles. El autor no documenta evaluación de sesgos ni composición del corpus de entrenamiento tailandés.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base iapp/OpenThai-SystemOne y la de Qwen3.5-0.8B-Base, no detalladas en la información consultada.
- Madurez: 0 descargas y 0 «likes» en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Verificabilidad: la model card menciona versiones y fechas no verificables de forma independiente (Core AI en iOS 27 / macOS 27, macOS 27.0 26A428, 2026-09-23, macOS 27 beta 26A5353q, 2026-06-11). Deben tratarse como afirmaciones del autor.
- Dependencia de plataforma: el formato `.aimodel` ata el despliegue al runtime Core AI de Apple. No hay ruta publicada a CUDA, ROCm ni a runtimes de inferencia estándar.
- La información de benchmarks de la model card mide fidelidad de conversión frente al oráculo del propio autor, no calidad de la decisión frente a un conjunto de referencia externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/OpenThai-SystemOne-CoreAI
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne (revisión `f3709948b5e3cc9606a57e74ba62b7a639d17dd3`)
- Base última citada en la model card: `Qwen/Qwen3.5-0.8B-Base` (identificador citado; no se proporciona URL en la información disponible)
- Fixture de validación (18 peticiones, 48 filas de kit): https://github.com/john-rocky/coreai-model-zoo/blob/main/models/openthai-systemone/fixtures-openthai-systemone.json
- Transcripción de la puerta de validación, lectura fp16: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/openthai-systemone/gate-openthai-systemone-readout-fp16.json
- Transcripción de la puerta de validación, lectura int8lin: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/openthai-systemone/gate-openthai-systemone-readout-int8lin.json
- Transcripción de comprobación de motores, fp16: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/openthai-systemone/gate-openthai-systemone-engine-fp16.js (URL truncada en la model card)
- Benchmark de LLM en Apple Silicon citado por el autor: https://github.com/john-rocky/apple-silicon-llm-bench
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a anuncios de carritos portazaino en Vinted y no guardan relación con el modelo.
