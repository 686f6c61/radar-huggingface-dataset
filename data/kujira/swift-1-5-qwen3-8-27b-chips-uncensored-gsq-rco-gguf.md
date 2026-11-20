# Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Uncensored-GSQ-RCO-GGUF

## Resumen

Swift 1.5 Qwen3.8-27B CHiPS-Uncensored GSQ-RCO es una cuantización GGUF de 27.320.697.856 parámetros derivada del modelo base `ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF`, publicada por el usuario Kujira. No se trata de un modelo entrenado desde cero ni de un finetune convencional: es una modificación quirúrgica de dos ficheros GGUF concretos (las variantes `IQ2_XS-mtp` e `IQ3_S-mtp`) en la que se han reescrito únicamente 4 de los 866 tensores del modelo original para reducir el comportamiento de rechazo (refusal). El resto de tensores, incluida la cabeza MTP (multi-token prediction), permanece byte a byte idéntica al original.

La técnica empleada se denomina CHiPS (Causal Head-isolated Projection Steering): identifica unas pocas cabezas de atención con efecto causal sobre una conducta concreta y modifica solo esas proyecciones, dejando intacto el resto de la red. La receta exacta no está publicada. Según la model card, las frases de rechazo ante 104 peticiones dañinas caen del 93,3 % al 2,9 %, mientras que las métricas de capacidad (GSM8K, MMLU-Pro), el tool calling y la perplejidad se mantienen en el nivel del fichero original.

El modelo es relevante para quienes necesitan un LLM de razonamiento de ~27B con decodificación especulativa vía MTP, ejecutable en llama.cpp, y con el filtrado de seguridad aligerado. Conviene subrayar que no es un lanzamiento oficial de UkisAI, Alibaba Cloud ni ISTA-DASLab, y que la model card advierte explícitamente de que no cuenta con su respaldo. La información sobre idiomas, datos de entrenamiento y arquitectura interna del modelo base no está disponible en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8) con cabeza MTP (multi-token prediction); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS-mtp (8,77 GB) e IQ3_S-mtp (12,12 GB); sin otras tiers publicadas |
| Idiomas soportados | no disponible (las evaluaciones se hicieron en inglés y japonés) |
| Licencia | swift-open-license-1.0 (etiqueta `license: other`); incluye LICENSE-APACHE-2.0 y NOTICE |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 20,9 GB |
| Tensores | 866, de los cuales 4 reescritos |
| Imatrix utilizada | `imatrix-swift15-v1mix.gguf` (Swift V1MIX) |
| Vision | no incluida (sin proyector visual) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.8 y se distribuye con una cabeza MTP (multi-token prediction), una innovación de decodificación especulativa que permite proponer varios tokens por paso y verificar su aceptación, acelerando la generación. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos figuran en la documentación del modelo base de UkisAI, no en la de esta ficha.

La modificación de Kujira no reentrena pesos: parte de los ficheros GGUF originales, identifica 4 tensores (cabezas de atención seleccionadas por su efecto causal sobre el rechazo) y los recuantiza a su tipo original con la imatrix del repositorio base. El resto de tensores, incluida la cabeza MTP, queda byte a byte idéntico. Los metadatos añaden claves `quantize.imatrix.*` generadas por `llama-quantize`. La técnica CHiPS se describe como "Causal Head-isolated Projection Steering": aislamiento de cabezas por causalidad y steering de proyecciones, con una receta no publicada. La edición se ajustó sobre el fichero IQ2_XS-mtp; el IQ3_S-mtp comparte la edición pero no fue evaluado, y el autor advierte de que la recuantización puede alterar cuánto de una edición tan pequeña sobrevive.

## Capacidades

- Generación de texto conversacional de un solo turno y multi-turno.
- Razonamiento explícito (modo thinking) con cadenas de razonamiento extensas; en MMLU-Pro un 10,7 % de las respuestas alcanza el límite de 4.096 tokens.
- Razonamiento matemático: 94,0 % de acierto en 250 preguntas de GSM8K.
- Conocimiento general y de nivel avanzado: 73,7 % en 300 preguntas de MMLU-Pro.
- Tool calling / function calling: 100 % de llamada correcta cuando se espera, 100 % de nombre correcto, 100 % de argumentos completos y 100 % de no-llamada cuando no se necesita (frente al 90 % del original).
- Continuación tras resultado de herramienta: 100 %.
- Tareas de formato largo (hasta 3.072 tokens nuevos): sin bucles de periodo corto ni largo en la evaluación.
- Multilingüe: evaluado en inglés y japonés; el resto de idiomas no está documentado.
- Comportamiento de rechazo reducido: 2,9 % de frases de rechazo ante peticiones dañinas, frente al 93,3 % del original.
- Sin capacidades de visión (no se incluye proyector visual y no se probó).

## Casos de uso

- Asistente de razonamiento matemático en producción: con 94,0 % en GSM8K y cadenas de razonamiento estables, encaja en tutoría automática, verificación de cálculos y generación de problemas resueltos paso a paso.
- Agente con tool calling en pipelines de automatización: el 100 % de llamadas correctas con nombre y argumentos completos permite integrarlo en orquestadores de agentes que consultan APIs, bases de datos o servicios internos.
- Atención al cliente multi-turno: el modelo mantiene coherencia conversacional y no genera bucles; requiere fijar `max_tokens` con holgura porque las respuestas largas pueden agotar el límite.
- Generación de documentación técnica y textos largos: en tareas de formato largo alcanza el límite en solo el 12,5 % de los casos (frente al 20,8 % del original) y sin bucles, lo que lo hace apto para redacción asistida.
- Investigación sobre alineación y seguridad: la reducción controlada del rechazo con preservación de capacidad lo convierte en un sujeto de estudio para medir sesgos de seguridad, calibrar clasificadores o analizar comportamiento ante JailbreakBench.
- Despliegue en hardware de consumo: la variante IQ2_XS (8,77 GB) cabe en GPUs de 12 GB y en configuraciones con RAM unificada; útil para prototipos locales, demos y entornos sin acceso a la nube.
- Evaluación comparativa de técnicas de steering: sirve como referencia para contrastar CHiPS frente a abliteration clásica, midiendo el coste en capacidad y en longitud de respuesta.

## Benchmarks y rendimiento

Todos los datos corresponden al fichero IQ2_XS-mtp, medidos una sola vez con los mismos ajustes y semillas que el original. El IQ3_S-mtp no fue evaluado.

| Prueba | Original | Este modelo |
|---|---|---|
| Frases de rechazo, peticiones dañinas (104) | 93,3 % | 2,9 % |
| Frases de rechazo, peticiones inocuas (100) | 2 % | 2 % |
| Bucles (dañinas / inocuas) | 0 % / 0 % | 0 % / 0 % |
| Respuestas vacías (dañinas / inocuas) | 0 % / 1 % | 0 % / 2 % |
| Alcanzan el límite de tokens (dañinas / inocuas, 1.536) | 0 % / 1 % | 13,5 % / 2 % |
| Tokens medios (dañinas / inocuas) | 297 / 566 | 992 / 584 |
| Tareas largas: alcanzan el límite (3.072) | 20,8 % (5) | 12,5 % (3) |
| Tareas largas: bucles de periodo corto | 4,2 % (1) | 0 % |
| Tareas largas: respuestas vacías | 12,5 % (3) | 4,2 % (1) |
| Tareas largas: tokens medios | 1.961 | 1.909 |
| Tool calling: llamada esperada / nombre / argumentos | 100 % / 100 % / 100 % | 100 % / 100 % / 100 % |
| Tool calling: sin llamada cuando no se necesita | 90 % (9/10) | 100 % |
| Tool calling: continúa tras resultado | 100 % | 100 % |
| GSM8K (250 preguntas, 4.096 tokens) | 94,8 % (237) | 94,0 % (235) |
| GSM8K: alcanzan el límite | 0 % | 0 % |
| GSM8K: tokens medios | 330 | 336 |
| MMLU-Pro (300 preguntas, 4.096 tokens) | 73,7 % (221) | 73,7 % (221) |
| MMLU-Pro: alcanzan el límite | 8,3 % (25) | 10,7 % (32) |

En JailbreakBench, con 96 peticiones no usadas en el ajuste y evaluadas por GPT-6 como juez, el original rechazó el 95,8 % y este fichero el 4,2 %, con 6 respuestas parciales adicionales; cabezas aleatorias con las mismas intensidades se quedaron en 94,8 % y 95,8 %. Las diferencias de una o dos tareas en las tablas de tareas largas y tool calling deben leerse como "mismo nivel", no como mejora.

## Requisitos de hardware

- VRAM estimada: ~8,8 GB para IQ2_XS-mtp y ~12,1 GB para IQ3_S-mtp, más overhead de contexto KV cache (no cuantificado por defecto en llama.cpp).
- GPU recomendadas: RTX 4090 (24 GB) para IQ3_S con contexto amplio; RTX 3060 12 GB o RTX 4070 para IQ2_XS; A100/H100 solo si se necesita throughput alto o contextos muy largos.
- Cabe en GPU de consumo: sí, IQ2_XS en 12 GB y IQ3_S en 16 GB con margen ajustado; también en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y cualquier runtime compatible con GGUF; la model card indica `endpoints_compatible`.
- Latencia y throughput: no disponibles. La cabeza MTP habilita decodificación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B CHiPS (este) | 27,3B | no disponible | 94,0 % | 73,7 % | swift-open-license-1.0 | GGUF IQ2/IQ3 |
| Swift 1.5 Qwen3.8-27B GSQ-RCO (original) | 27,3B | no disponible | 94,8 % | 73,7 % | swift-open-license-1.0 | GGUF (más tiers) |
| Otros modelos de ~27B de la familia Qwen3.8 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de terceros no está disponible en la información proporcionada; solo se dispone de los datos del modelo base frente al modificado.

## Limitaciones y advertencias

- No es un lanzamiento oficial: UkisAI, Alibaba Cloud e ISTA-DASLab no lo han hecho ni lo respaldan; "Swift" solo indica procedencia.
- La receta CHiPS no está publicada, lo que impide auditar el método y reproducir la edición.
- El IQ3_S-mtp no fue evaluado; su comportamiento puede diferir del IQ2_XS-mtp porque la recuantización puede alterar cuánto de la edición sobrevive.
- Las respuestas a peticiones dañinas son mucho más largas (992 tokens de media frente a 297) y el 13,5 % alcanza el límite de 1.536 tokens; con `max_tokens` bajo se pueden truncar.
- En preguntas difíciles el razonamiento se alarga: 32 de 300 preguntas de MMLU-Pro llegan al límite de 4.096 tokens, frente a 25 del original.
- La reducción del rechazo conlleva riesgo de generar contenido dañino, sesgado o inapropiado; no es apto para despliegues públicos sin filtros externos.
- Riesgo de alucinación no cuantificado en la documentación; aplican las limitaciones habituales de un LLM de 27B.
- Idiomas soportados no documentados; las pruebas se limitan a inglés y japonés.
- Sin visión: no se incluye proyector visual y no se probó.
- La licencia swift-open-license-1.0 es "other" y debe revisarse el fichero LICENSE antes de uso comercial; incluye términos Apache-2.0 y NOTICE con atribuciones.
- Las evaluaciones se ejecutaron una sola vez por conjunto, con conjuntos de peticiones no publicados, lo que limita la reproducibilidad estadística.
- Solo se ofrecen dos tiers de cuantización; no hay versiones de mayor precisión (Q4, Q5, Q8) en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Uncensored-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Imatrix del repositorio base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/imatrix-swift15-v1mix.gguf
- Artículo explicativo de CHiPS: https://balaena01.github.io/chips-steering/
- Referencias arXiv citadas en los tags: arxiv:2604.18556 y arxiv:2605.00649 (sin URL directa en la información disponible)
