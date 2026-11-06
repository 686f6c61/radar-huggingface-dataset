# Mindscend/mindtype-tagger-v2.0

## Resumen

mindtype-tagger-v2.0 es un modelo de corrección gramatical y ortográfica (GEC) desarrollado por Mindscend para su teclado predictivo on-device MindType, disponible en iOS y Android. Se trata de un transformer encoder-only entrenado desde cero, con 26,2 millones de parámetros, 8 capas y dimensión oculta de 384, acompañado de un tokenizador BPE byte-level propio de 16k. Su planteamiento es deliberadamente restrictivo: en lugar de generar texto libre, predice una etiqueta de edición por palabra (KEEP, DELETE, REPLACE_x, APPEND_x o cambio de capitalización) en una sola pasada, lo que impide que el modelo invente palabras o reescriba texto correcto.

La versión 2.0 introduce mejoras sustanciales respecto a v1.5/v1.6: el entrenamiento incorpora errores típicos de tecleo en móvil (letras pulsadas por error, palabras cortas, letras omitidas), un 40% de texto ya correcto y mensajes más coloquiales. Además, los pesos finales son una media ("model soup") de tres fine-tunes que comparten inicialización y difieren solo en el orden de los datos, lo que reduce la varianza entre ejecuciones. En el conjunto de errores de tecleo en móvil, la F0.5 sube de 0,689 (v1.6) a 0,912 (v2.0 con KEEP bias 3), y el porcentaje de erratas corregidas exactamente pasa del 22% al 77%.

El modelo se distribuye con pesos en safetensors, un paquete Core ML con pesos de 8 bits para iOS 18+ y un ONNX int8 para Android y servidores. Su relevancia radica en que demuestra que un modelo de 26M de parámetros puede ofrecer corrección de texto útil en el propio dispositivo, sin enviar datos a la nube, con una tasa de falsos positivos del 1,9% sobre 4.356 casos de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (8 capas, d=384) |
| Parametros totales | 26.176.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento a nivel de frase) |
| Tipos de cuantizacion | 8 bits (Core ML), int8 (ONNX) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, Core ML, ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-only de 8 capas con dimensión oculta 384 y tokenizador BPE byte-level propio de 16k, entrenado desde cero. La tarea es de token-classification a nivel de palabra: cada palabra recibe una única etiqueta de edición (KEEP, DELETE, REPLACE_x, APPEND_x o cambio de caso) que se aplica después sobre el texto original en hasta tres pasadas. Este diseño evita la generación libre y, por tanto, la posibilidad de alucinar palabras nuevas o reescribir fragmentos ya correctos.

El entrenamiento se realizó en dos fases. Primero, preentrenamiento con masked language modeling sobre aproximadamente 20 millones de frases de FineWeb-Edu (licencia ODC-BY). Después, entrenamiento de corrección con 12 millones de pares (ruidoso, limpio) que combinan errores sintéticos de tecleo y de móvil, el corpus CoEdIT GEC (Apache-2.0) y mensajes coloquiales generados por un modelo local de pesos abiertos y filtrados por corrección; el 40% del texto de entrada ya era correcto. El proceso constó de 45.000 pasos con tres órdenes de datos distintos partiendo de una misma inicialización de la cabeza, tras lo cual se promediaron los pesos de los tres fine-tunes. Todo el entrenamiento se llevó a cabo en una única GPU RTX 3080 Ti de portátil.

## Capacidades

- Corrección ortográfica y gramatical a nivel de palabra mediante etiquetas de edición (KEEP, DELETE, REPLACE_x, APPEND_x, cambio de caso).
- Corrección de erratas típicas de tecleo en móvil: letras pulsadas por error, palabras cortas, letras omitidas.
- Preservación de texto ya correcto con una tasa de falsos positivos del 1,9% en el conjunto de evaluación global.
- Protección de fragmentos que no deben modificarse (spans protegidos), con 0,000 de pérdida en los conjuntos de evaluación.
- Funcionamiento on-device: los datos no salen del teléfono, apto para teclados iOS y Android.
- Inferencia en una sola pasada por palabra, con latencia baja y huella de memoria reducida.
- Soporte de despliegue en Core ML (iOS 18+) y ONNX (Android y servidores).
- Ajuste de agresividad mediante KEEP bias (3 = equilibrado, 4 = solo correcciones seguras).
- Guarda de plausibilidad: se omiten reemplazos que un error de tecleo no podría haber producido.
- No realiza reescritura, cambios de tono ni reformulación; solo corrige lo que ya está presente.

## Casos de uso

- Teclado predictivo en iOS y Android: integrado como paquete Core ML u ONNX, corrige erratas al vuelo sin enviar texto a la nube, lo que encaja con requisitos de privacidad y con la latencia esperada en un teclado.
- Corrección de mensajes informales: el modelo está entrenado con mensajes coloquiales y errores de tecleo, por lo que corrige chats y SMS sin alterar el registro ni el contenido correcto (1,26% de cambios sobre mensajes reales correctos).
- Aplicaciones de accesibilidad: usuarios con dificultades motoras que generan erratas al teclear se benefician de la corrección de letras pulsadas por error y letras omitidas, con la opción de KEEP bias 4 para minimizar cambios no deseados.
- Procesamiento por lotes de textos en inglés: el paquete ONNX int8 permite integrar la corrección en pipelines de servidor para normalizar texto antes de indexación o análisis, con un coste computacional muy bajo (26M de parámetros).
- Preprocesado para NLP: limpiar erratas en corpus de entrada antes de tareas posteriores (clasificación, extracción de entidades) sin reescribir el texto original, gracias al esquema de etiquetas de edición.
- Edición asistida en aplicaciones de escritura: sugerir correcciones puntuales en editores o clientes de correo manteniendo intactos los fragmentos correctos y los spans protegidos (nombres propios, código, URLs).
- Filtrado de calidad en datasets: detectar y corregir erratas en textos recopilados de fuentes informales antes de usarlos en entrenamiento o evaluación.

## Benchmarks y rendimiento

Resultados del conjunto de evaluación de MindType (4.356 casos retenidos, KEEP bias 3, guarda de plausibilidad):

| Set | n | F0.5 | Exact | Tasa de falsos positivos | Spans protegidos perdidos |
|---|---|---|---|---|---|
| casual_clean | 118 | 0.000 | 0.983 | 0.017 | 0.000 |
| casual_noisy | 109 | 0.942 | 0.807 | 0.000 | 0.000 |
| coedit | 579 | 0.453 | 0.109 | 0.000 | 0.000 |
| formal_clean | 1000 | 0.000 | 0.976 | 0.024 | 0.000 |
| formal_noisy | 1000 | 0.876 | 0.655 | 0.000 | 0.000 |
| golden | 50 | 0.927 | 0.860 | 0.077 | 0.000 |
| preserve | 1000 | 0.838 | 0.646 | 0.000 | 0.000 |
| preserve_clean | 500 | 0.000 | 0.992 | 0.008 | 0.000 |
| **overall** | 4356 | 0.803 | 0.708 | 0.019 | 0.000 |

Comparativa entre versiones (según la model card):

| Metrica | v1.6 (KEEP 2) | v2.0 (KEEP 3) | v2.0 (KEEP 4) |
|---|---|---|---|
| F0.5 en errores de tecleo en movil | 0.689 | 0.912 | 0.910 |
| Erratas de movil corregidas exactamente | 22% | 77% | 74% |
| Cambios sobre mensajes reales correctos (5.556 retenidos) | 1.64% | 1.26% | 0.90% |
| F0.5 / falsos positivos en suite de evaluacion | 0.802 / 2.8% | 0.803 / 1.9% | 0.801 / 1.0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 26,2M de parámetros, los pesos en fp32 ocupan aproximadamente 105 MB y en int8/8 bits alrededor de 26 MB, más el estado de activaciones.
- GPU recomendadas: no requiere GPU dedicada para inferencia; funciona en CPU de móvil y servidor. En escritorio, cualquier GPU consumer moderna (RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en hardware móvil (Core ML en iOS 18+, ONNX en Android).
- Opciones de despliegue: Core ML (iOS 18+), ONNX Runtime (Android y servidores), PyTorch (safetensors). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el diseño de una sola pasada por palabra y el tamaño reducido sugieren latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mindtype-tagger-v2.0 | 26,2M | no disponible (nivel de frase) | Etiquetas de edicion por palabra, on-device | Apache-2.0 | Hugging Face, Core ML, ONNX |
| Modelos GEC tipo seq2seq (p. ej. T5-base fine-tuneado) | ~220M | 512 tokens | Generacion de texto corregido | variable segun modelo | Hugging Face |
| Correctores basados en LLM (p. ej. modelos de 7B) | ~7B | 4k-32k tokens | Generacion libre con prompt | variable | Hugging Face, APIs |

No se dispone de datos de benchmarks comparativos directos con estas alternativas en la información proporcionada. La diferencia principal es el enfoque: mindtype-tagger-v2.0 no genera texto, sino que aplica ediciones puntuales, lo que reduce el riesgo de reescritura no deseada y permite ejecución on-device, a costa de no poder reformular ni corregir errores que requieran reestructurar la frase.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su uso en entornos multilingües.
- Ámbito a nivel de frase: no está diseñado para documentos largos ni para mantener coherencia entre párrafos.
- No reformula ni cambia el tono: solo corrige lo que ya está presente; no puede reescribir frases mal construidas que no contengan una errata identificable.
- Modelo experimental: la propia model card lo califica como experimental, con 35 descargas y 0 likes en Hugging Face en el momento de la consulta.
- Riesgo de falsos positivos: aunque bajo (1,9% global), en conjuntos como golden alcanza el 7,7%, por lo que en producción conviene usar KEEP bias 4 para minimizar cambios no deseados.
- Rendimiento desigual por dominio: la F0.5 en el conjunto coedit es de 0,453, muy inferior a la de conjuntos de errores sintéticos (0,876-0,942), lo que indica menor eficacia en errores gramaticales reales frente a erratas de tecleo.
- Dependencia de la guarda de plausibilidad: los resultados reportados asumen el uso de `plausible_pairs.json`; sin ella, el comportamiento puede degradarse.
- Licencia Apache-2.0: permite uso comercial, pero los datos de entrenamiento tienen sus propias licencias (FineWeb-Edu ODC-BY, CoEdIT Apache-2.0) que conviene revisar según el caso de uso.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de la suite propia del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mindscend/mindtype-tagger-v2.0
- Sitio del autor: https://mindscendinc.com
- FineWeb-Edu (dataset de preentrenamiento): no disponible enlace directo en la información proporcionada
- CoEdIT (dataset GEC): no disponible enlace directo en la información proporcionada
