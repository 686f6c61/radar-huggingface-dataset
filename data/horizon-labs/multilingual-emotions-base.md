# Horizon-Labs/multilingual-emotions-base

## Resumen

Multilingual Emotions (base) es un clasificador de emociones multi-etiqueta desarrollado por Horizon-Labs, construido sobre el modelo base jhu-clsp/mmBERT-base, un codificador de arquitectura ModernBERT con 307.551.772 parámetros (aproximadamente 308M). Su objetivo es trasladar el esquema de 28 etiquetas de Google GoEmotions (admiration, amusement, anger, ..., surprise, neutral) desde el inglés a un entorno multilingüe: la model card indica soporte para inglés y otros 35 idiomas, con la misma salida sigmoide multi-etiqueta que usan los modelos GoEmotions en inglés.

El modelo se presenta como alternativa multilingüe directa ("drop-in") a SamLowe/roberta-base-go_emotions: conserva las mismas etiquetas y el mismo tipo de salida, de modo que puede sustituir a un clasificador inglés sin rehacer el etiquetado. Es relevante ahora porque permite aplicar un esquema de anotación muy extendido en investigación sobre emociones (GoEmotions) a textos escritos en decenas de idiomas sin traducción previa, y porque distribuye artefactos ONNX (incluido un cuantizado int8 de 641 MB) para ejecución en CPU y en navegador mediante transformers.js.

Técnicamente es un clasificador de texto (pipeline text-classification), no un modelo generativo. Cada etiqueta recibe una probabilidad independiente, por lo que un mismo texto puede activar varias emociones o solo neutral. El modelo incluye ficheros auxiliares como thresholds.json (un umbral por etiqueta, calibrado sobre el conjunto de validación de GoEmotions) y ekman_mapping.json (agrupación en las 6 emociones de Ekman). La licencia es Apache-2.0 y el modelo base también es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer (basado en ModernBERT; modelo base jhu-clsp/mmBERT-base) |
| Parametros totales | 307.551.772 (aproximadamente 308M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32 y ONNX int8 (model_quantized.onnx, 641 MB); el int8 coincide con fp32 en el 99,1% de 448 textos de prueba con las 28 etiquetas a umbral 0,5 |
| Idiomas soportados | 36 idiomas: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, ro, sv, da, no, fi, hu, el, tr, ar, he, fa, hi, mr, bn, ur, zh, ja, ko, vi, th, id, sw, af, tt, ha y multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 y cuantizado int8) |

## Arquitectura y entrenamiento

El modelo es un codificador de clasificación de texto construido sobre mmBERT-base (jhu-clsp), una arquitectura derivada de ModernBERT orientada a lenguas múltiples. Con 308M de parámetros, emite una salida de clasificación multi-etiqueta con activación sigmoide independiente por etiqueta, sobre las 28 clases del esquema GoEmotions. Se distribuyen pesos en safetensors y varios artefactos ONNX, además de una variante cuantizada int8 destinada a inferencia en CPU y a ejecución en el navegador con transformers.js.

En cuanto a los datos, la model card declara que el dataset de referencia es google-research-datasets/go_emotions y que los benchmarks se usaron únicamente para evaluación, eliminando del entrenamiento los textos que también aparecían en ellos. La información disponible no detalla el número de tokens de entrenamiento, la composición completa del corpus ni si se emplearon etapas de RLHF o DPO; al tratarse de un clasificador de encoder y no de un modelo generativo, estos procedimientos de alineación habituales en LLM no aplican del mismo modo. Como características técnicas destacables, el modelo incluye un fichero thresholds.json con un umbral calibrado por etiqueta para el conjunto de validación de GoEmotions (pensado sobre todo para etiquetas raras como grief, pride, relief o nervousness) y un fichero ekman_mapping.json para agrupar las 28 etiquetas en las 6 emociones de Ekman.

## Capacidades

- Clasificación de emociones multi-etiqueta con las 28 etiquetas de GoEmotions (admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, remorse, sadness, surprise, neutral).
- Salida sigmoide con una probabilidad independiente por etiqueta: un texto puede recibir varias emociones simultáneamente o solo neutral.
- Clasificación multilingüe en 36 idiomas, incluidos español, inglés, alemán, francés, portugués, italiano, neerlandés, polaco, ruso, ucraniano, checo, rumano, sueco, danés, noruego, finés, húngaro, griego, turco, árabe, hebreo, persa, hindi, maratí, bengalí, urdu, chino, japonés, coreano, vietnamita, tailandés, indonesio, suajili, afrikáans, tártaro y hausa.
- Umbrales por etiqueta mediante thresholds.json, calibrados sobre la validación de GoEmotions, para ajustar la sensibilidad especialmente en emociones poco frecuentes.
- Agrupación en las 6 emociones de Ekman (anger, disgust, fear, joy, sadness, surprise) mediante ekman_mapping.json, tomando el máximo por grupo.
- Ejecución en CPU y en navegador mediante los artefactos ONNX y transformers.js (dtype q8).
- Integración directa con el pipeline text-classification de transformers y compatibilidad declarada con text-embeddings-inference y endpoints.
- No dispone de generación de texto, tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un codificador de clasificación, no un modelo generativo.

## Casos de uso

- Moderación de contenido multilingüe: clasificar comentarios de usuarios en 36 idiomas y activar reglas automáticas cuando se detectan emociones como anger, disgust o annoyance, sin necesidad de traducir previamente el texto.
- Análisis de opiniones y reseñas de producto: aplicar el clasificador a reseñas en distintos idiomas para obtener un perfil emocional por reseña y agregarlo por producto, categoría o mercado.
- Monitorización de redes sociales y escucha activa de marca: procesar menciones multilingües en tiempo casi real y priorizar las que concentran emociones negativas (fear, sadness, remorse) frente a las positivas (gratitude, joy, admiration).
- Priorización en atención al cliente: puntuar el tono emocional de los tickets entrantes para enrutar primero los casos con alta carga de frustración o enfado y ofrecer respuestas más cuidadas.
- Análisis de encuestas abiertas y NPS: clasificar respuestas de texto libre en varios idiomas y cruzar las emociones detectadas con métricas cuantitativas de satisfacción.
- Investigación en ciencias sociales y estudios de opinión: aplicar un esquema de anotación homogéneo (GoEmotions) a corpus multilingües, aprovechando thresholds.json para mantener consistencia entre anotaciones.
- Detección temprana de señales de riesgo emocional: usar las etiquetas grief, sadness, fear o nervousness como señales de alerta en foros de apoyo, con revisión humana posterior obligatoria.
- Clasificación en el navegador sin enviar datos a un servidor: mediante los artefactos ONNX y transformers.js, ejecutar la clasificación en el propio cliente para casos con requisitos de privacidad.

## Benchmarks y rendimiento

Resultados declarados en la model card. GoEmotions test: comentarios de Reddit en inglés (5.427 textos, 28 etiquetas), macro-F1 sobre las 28 etiquetas a umbral 0,5 y con umbrales por etiqueta calibrados en validación. BRIGHTER: textos etiquetados por humanos en 28 idiomas (hasta 1.500 textos de test por idioma), con 6 emociones y múltiples etiquetas; la puntuación es macro-F1 sobre las emociones anotadas, promediada sobre idiomas. "4 emociones" = anger, fear, joy y sadness únicamente.

| Modelo | Licencia | GoEmotions macro-F1 @0,5 | GoEmotions macro-F1 (umbrales ajustados) | BRIGHTER 6 emociones | BRIGHTER 4 emociones | Etiquetas |
|---|---|---|---|---|---|---|
| multilingual-emotions-base (este modelo, 308M) | Apache-2.0 | 0,473 | 0,516 | 0,420 | 0,449 | 28 etiquetas GoEmotions, multilingüe |
| multilingual-emotions-small (141M) | Apache-2.0 | 0,447 | 0,494 | 0,406 | 0,432 | 28 etiquetas GoEmotions, multilingüe |
| SamLowe/roberta-base-go_emotions (125M) | MIT | 0,450 | 0,519 | 0,282 | 0,291 | 28 etiquetas GoEmotions, inglés |
| AnasAlokla/multilingual_go_emotions | MIT | 0,455 | 0,538 | 0,337 | 0,355 | 28 etiquetas GoEmotions, multilingüe |
| j-hartmann/emotion-english-distilroberta-base (82M) | No indicada | No disponible | No disponible | 0,297 | 0,315 | 7 etiquetas, inglés |
| MilaNLProc/xlm-emo-t (278M) | No indicada | No disponible | No disponible | No disponible | 0,456 | 4 etiquetas (anger, fear, joy, sadness), tuits multilingües |
| tabularisai/multilingual-emotion-classification (135M) | CC-BY-NC-4.0 | No disponible | No disponible | 0,404 | 0,428 | No indicadas en la información disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 unos 1,2 GB solo de pesos; en fp16/bf16 en torno a 0,6 GB; en int8 (ONNX cuantizado, fichero de 641 MB) aproximadamente 0,3 GB de pesos. Hay que sumar el consumo de activaciones y de memoria del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16 o int8. GPU de datacenter como A100, H100 o L40S quedan muy sobredimensionadas y solo se justifican para altos volúmenes de peticiones concurrentes.
- Cabe sobradamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas recientes, siempre que se use fp16 o int8.
- Despliegue: transformers (pipeline text-classification), ONNX Runtime para CPU, transformers.js para navegador, y text-embeddings-inference para servir el modelo como endpoint según los tags del repositorio. Al ser un codificador de clasificación, no se sirve con vLLM ni con motores orientados a decodificación generativa.
- Latencia y throughput: no disponibles. El tamaño (308M) y el fichero int8 (641 MB) permiten inferencia por lotes muy rápida en GPU y viable en CPU, pero la model card no publica cifras de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | GoEmotions macro-F1 (ajustado) | BRIGHTER 6 emociones | Licencia |
|---|---|---|---|---|---|---|
| multilingual-emotions-base | 308M | No disponible | 36 | 0,516 | 0,420 | Apache-2.0 |
| multilingual-emotions-small | 141M | No disponible | No especificado | 0,494 | 0,406 | Apache-2.0 |
| SamLowe/roberta-base-go_emotions | 125M | No disponible | Inglés | 0,519 | 0,282 | MIT |
| AnasAlokla/multilingual_go_emotions | No disponible | No disponible | Multilingüe | 0,538 | 0,337 | MIT |
| tabularisai/multilingual-emotion-classification | 135M | No disponible | Multilingüe | No disponible | 0,404 | CC-BY-NC-4.0 |

Frente a SamLowe/roberta-base-go_emotions, el modelo de Horizon-Labs iguala aproximadamente el rendimiento en GoEmotions en inglés con umbrales ajustados (0,516 frente a 0,519) y lo supera claramente en cobertura multilingüe medida con BRIGHTER (0,420 frente a 0,282). Frente a AnasAlokla/multilingual_go_emotions, este último obtiene mejor macro-F1 en GoEmotions (0,538 frente a 0,516) pero peor resultado multilingüe en BRIGHTER (0,337 frente a 0,420). La versión small (141M) queda ligeramente por debajo en ambas métricas, a cambio de menor tamaño. La licencia Apache-2.0 de este modelo es más permisiva para uso comercial que la CC-BY-NC-4.0 de tabularisai/multilingual-emotion-classification.

## Limitaciones y advertencias

- Es un clasificador de emociones, no un modelo generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling ni uso como agente.
- La model card no documenta sesgos demográficos, culturales o lingüísticos concretos. Al entrenarse sobre GoEmotions (comentarios de Reddit en inglés) y evaluarse sobre BRIGHTER, es esperable un sesgo hacia el dominio y el registro del corpus original, pero no hay un análisis publicado en la información disponible.
- Riesgo de alucinación no aplica como tal (no genera texto), pero sí existe riesgo de clasificación errónea: la macro-F1 de 0,516 en GoEmotions con umbrales ajustados implica una precisión moderada, especialmente baja en etiquetas raras (grief, pride, relief, nervousness).
- Es imprescindible usar thresholds.json en lugar del umbral 0,5 para obtener un rendimiento razonable; usar 0,5 penaliza notablemente las etiquetas poco frecuentes.
- La cobertura de idiomas es declarativa (36 idiomas). El rendimiento real por idioma no se detalla más allá del promedio de BRIGHTER, por lo que conviene validar en el idioma y dominio objetivo antes de producción.
- El modelo no tiene contexto declarado en la información disponible, lo que limita las afirmaciones sobre textos largos.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; conviene revisar igualmente las condiciones del modelo base jhu-clsp/mmBERT-base (también Apache-2.0 según la información disponible).
- Para detección de señales de riesgo emocional o salud mental, no debe usarse de forma autónoma; requiere revisión humana y validación clínica específica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/multilingual-emotions-base
- Version small (141M): https://huggingface.co/Horizon-Labs/multilingual-emotions-small
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/multilingual-emotions
- Modelo base mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Dataset BRIGHTER (emotion categories): https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- SamLowe/roberta-base-go_emotions: https://huggingface.co/SamLowe/roberta-base-go_emotions
- AnasAlokla/multilingual_go_emotions: https://huggingface.co/AnasAlokla/multilingual_go_emotions
- j-hartmann/emotion-english-distilroberta-base: https://huggingface.co/j-hartmann/emotion-english-distilroberta-base
- MilaNLProc/xlm-emo-t: https://huggingface.co/MilaNLProc/xlm-emo-t
- tabularisai/multilingual-emotion-classification: https://huggingface.co/tabularisai/multilingual-emotion-classification
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a entidades no relacionadas (partido político Horizons, VMware Horizon, Meta Horizon), por lo que no se incluyen.
