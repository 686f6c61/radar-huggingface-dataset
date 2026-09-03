# Sandy-sys/osint-argus-gemma4-qat-w4a16

## Resumen

OSINT Argus es un modelo de inteligencia artificial especializado en tareas de OSINT (Open Source Intelligence) unificado, desarrollado por el usuario Sandy-sys sobre la base de Gemma 4 12B de Google. Se trata de un modelo multimodal (texto, visión y audio) cuantizado mediante QAT (Quantization-Aware Training) a W4A16, es decir, pesos de 4 bits y activaciones de 16 bits, lo que permite su despliegue eficiente en entornos de producción. El modelo está diseñado para procesar y analizar información de noticias y redes sociales, incluyendo verificación de veracidad, detección de sesgo, extracción de entidades, resúmenes multilingües y análisis de contenido visual y auditivo.

La relevancia de este modelo radica en su enfoque integrado: combina capacidades de comprensión del lenguaje, visión y audio en un único artefacto cuantizado, orientado a tareas de inteligencia de fuentes abiertas. El autor reporta métricas propias sobre conjuntos de validación específicos, aunque algunas de ellas muestran un rendimiento moderado, especialmente en tareas de veracidad de noticias y fidelidad textual. El modelo se distribuye bajo licencia Gemma de Google y está disponible en formato safetensors con soporte para el runtime SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Gemma 4 12B (no se especifican detalles adicionales) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (según comando de servido) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits) mediante QAT, exportado con compressed-tensors |
| Idiomas soportados | Multilingue (bengali, hindi, urdu y otros; no se especifica lista completa) |
| Licencia | Gemma (Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `google/gemma-4-12B-it-qat-q4_0-unquantized` y se somete a un proceso de QAT de parámetros completos sobre un "tronco unificado" que combina datos de redes sociales y noticias. Según la model card, el corpus de entrenamiento consta de 120.747 registros, de los cuales el 40% corresponde a un núcleo de noticias que incluye veracidad de artículos en bengali, hindi, urdu y 25 idiomas adicionales (formato x-fact), datos de Fakeddit en formato Reddit, adjudicación de afirmaciones de la familia FEVER, resúmenes XL-Sum en 9 idiomas y análisis de sesgo político. El resto del corpus incluye un "replay" completo de datos sociales y multimodales. No se menciona el uso de RLHF o DPO; el entrenamiento se centra en QAT con pérdida estándar. El artefacto final se exporta mediante una rejilla de cuantización corregida (el autor menciona una corrección el 31 de agosto para evitar doble cuantización) y se verifica que el checkpoint horneado coincide con la exportación.

## Capacidades

- Generacion de texto y razonamiento general, aunque con rendimiento moderado en tareas de conocimiento general (MCQ 52,5%).
- Extraccion de entidades (NER) con micro-F1 de 0,7.
- Analisis de sentimiento con precision de 0,775.
- Adjudicacion de afirmaciones (claim refuted-F1 0,88) y deteccion de alucinaciones (F1 0,4786).
- Generacion de respuestas con esquema estructurado (schema_lock 0,875 y grounded-answer schema 1,0).
- Capacidades multimodales: OCR en imagenes (CER 0,6368), deteccion de desinformacion visual (precision 0,525) y deteccion de hostilidad visual (precision 0,4434).
- Capacidades de audio: reconocimiento de voz (ASR con CER 0,6835), identificacion de idioma (precision 0,1833) y deteccion de discurso abusivo (precision 0,4).
- Soporte para tool calling y agentes: no se menciona explicitamente, pero al estar basado en Gemma 4 es probable que herede capacidades de la familia, aunque no se confirma en la documentacion.
- Multilingue: entrenado en al menos 25 idiomas para tareas de veracidad y 9 idiomas para resumen.

## Casos de uso

- Analisis de inteligencia de fuentes abiertas (OSINT): el modelo puede procesar grandes volumenes de noticias y publicaciones en redes sociales para extraer entidades, sentimiento y veracidad, generando registros estructurados con 11 claves (schema_lock). Es adecuado para equipos de investigacion que necesitan automatizar la recopilacion de informacion.
- Verificacion de noticias y deteccion de desinformacion: aunque el rendimiento en veracidad es bajo (0,2335), puede usarse como primer filtro en pipelines de fact-checking, combinado con otros modelos mas precisos.
- Monitoreo de sesgo politico en medios: el modelo clasifica el sesgo de articulos con una precision de 0,3667, util para estudios de medios y analisis de opinion publica.
- Resumen multilingue de noticias: genera resumenes en 9 idiomas (incluidos bengali, hindi y urdu) con un esquema de salida estructurado, aunque la fidelidad textual es limitada (NLI 0,0596).
- Analisis de contenido visual en redes sociales: el modelo puede transcribir texto en imagenes (OCR) y detectar indicios de desinformacion visual, aunque con precision modesta.
- Moderacion de contenido en audio: detecta discurso abusivo y clasifica idioma en clips de audio, con precision baja pero util como filtro preliminar en plataformas de contenido generado por usuarios.

## Benchmarks y rendimiento

El autor proporciona metricas propias sobre conjuntos de validacion especificos, no benchmarks estandar como MMLU o HumanEval. Se presentan a continuacion los datos reportados en la model card para el artefacto int4 desplegado:

| Tarea (gate) | Metrica | Valor |
|---|---|---|
| schema_lock (11-key OSINT record) | exactitud | 0,875 |
| NER | micro-F1 | 0,7 |
| Sentiment | precision | 0,775 |
| Claim refuted | F1 | 0,88 |
| Hallucination detection | F1 | 0,4786 |
| Grounded-answer schema | exactitud | 1,0 |
| General MCQ | porcentaje | 52,5 |
| News veracity (held-out) | precision | 0,2335 |
| News claim (held-out) | macro F1 / precision | 0,3956 / 0,4643 |
| News bias (held-out) | precision | 0,3667 |
| News summary (held-out) | schema / filled | 0,425 / 0,475 |
| Vision OCR | CER (menor es mejor) | 0,6368 |
| Vision misinformation | precision | 0,525 (baseline 0,5083) |
| Vision hostility | precision | 0,4434 (baseline 0,6321) |
| Audio ASR | CER (menor es mejor) | 0,6835 |
| Audio language-ID | precision | 0,1833 (baseline 0,175) |
| Audio abusive-speech | precision | 0,4 (baseline 0,5417) |

Ademas, se reporta una fidelidad NLI (evaluada con mDeBERTa-v3, umbral P>=0,70) de 0,0596, lo que indica que las respuestas abstractivas rara vez estan completamente respaldadas por el texto fuente. El autor aclara que esta metrica mide el cumplimiento del esquema, no la fidelidad semantica.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentacion.
- Con cuantizacion W4A16, los pesos del modelo ocupan aproximadamente 6 GB (12B parametros * 4 bits), por lo que cabria en GPUs de consumo con 8-12 GB de VRAM, aunque se recomienda al menos 16 GB para margen con activaciones y contexto de 8192 tokens.
- El tamaño del repositorio es de 24,8 GB, lo que sugiere que puede incluir multiples archivos o versiones adicionales.
- El comando de servido proporcionado utiliza SGLang con `--quantization compressed-tensors` y `--mem-fraction-static 0.45`, lo que indica que esta optimizado para ese runtime.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo se basa en Gemma 4 12B, pero no se ofrecen comparaciones con el modelo base ni con otras alternativas de OSINT. Se puede indicar que, al ser un fine-tuning de Gemma 4, hereda su arquitectura y capacidades base, pero las metricas propias no permiten una comparacion directa con otros modelos.

## Limitaciones y advertencias

- Rendimiento bajo en tareas de veracidad de noticias (0,2335) y sesgo (0,3667), lo que limita su uso en aplicaciones criticas de fact-checking sin supervisión humana.
- Fidelidad textual muy baja (NLI 0,0596): las respuestas abstractivas rara vez estan completamente respaldadas por el texto fuente, lo que puede generar alucinaciones en resumenes y respuestas generadas.
- Rendimiento mediocre en tareas de audio: identificacion de idioma (0,1833) y deteccion de discurso abusivo (0,4) apenas superan o quedan por debajo de la linea base.
- El autor menciona que el artefacto int4 tiene aproximadamente 10 puntos porcentuales menos que el checkpoint bf16 en tareas de esquema, lo que indica una perdida de calidad por la cuantizacion.
- Licencia Gemma de Google: permite uso comercial, pero con restricciones especificas (por ejemplo, no usar para ciertos fines prohibidos). Se debe revisar la licencia completa antes de desplegar en produccion.
- Modelo experimental con solo 20 descargas y 0 likes en HuggingFace, lo que sugiere poca validacion externa.
- No se especifican sesgos conocidos, pero al estar entrenado en un corpus de noticias y redes sociales, puede heredar sesgos de esas fuentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sandy-sys/osint-argus-gemma4-qat-w4a16
- Repositorio de codigo y entrenamiento (mencionado en la model card): `shubro18202758/aditi-ps18-state` en GitHub (no se proporciona URL directa)
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
