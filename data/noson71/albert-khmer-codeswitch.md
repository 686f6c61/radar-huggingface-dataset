# noson71/albert-khmer-codeswitch

## Resumen

albert-khmer-codeswitch es un modelo de lenguaje enmascarado (masked language modeling) basado en la arquitectura ALBERT, desarrollado por NOSON.AI (usuario noson71) a partir del checkpoint seanghay/albert-khmer-small. Está especializado en texto bilingüe khmer-inglés con cambios de código (code-switching), es decir, frases donde se mezclan ambos idiomas, un fenómeno muy habitual en contextos tecnológicos y urbanos de Camboya. El modelo resuelve el problema de la fragmentación excesiva de tokens en jemer y en términos técnicos en inglés que presentan los tokenizadores multilingües genéricos.

Con 15,6 millones de parámetros, es un modelo muy compacto pensado para tareas de comprensión (fill-mask, clasificación, NER, QA extractiva) más que para generación. Su principal innovación es un tokenizador SentencePiece Unigram de 64.000 tokens con cobertura de caracteres 1.0, que preserva íntegras palabras jemer complejas (diacríticos y subconsonantes) y evita fracturar términos ingleses habituales.

Es relevante ahora porque la mayoría de modelos multilingües (XLM-R, mBERT) segmentan el jemer de forma agresiva, degradando el rendimiento en tareas downstream para este idioma. Este modelo ofrece una alternativa ligera, con licencia Apache-2.0 y compatible con la librería transformers, para pipelines de NLP en jemer o en contextos bilingües khmer-inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBERT (A Lite BERT), transformer encoder con factorización de embeddings y compartición de parámetros entre capas |
| Parametros totales | 15.607.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | khmer (km), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ALBERT, variante de BERT que reduce el número de parámetros mediante factorización de la matriz de embeddings y compartición de pesos entre las capas del encoder. Parte del checkpoint seanghay/albert-khmer-small y se somete a preentrenamiento continuado (continued pretraining) con objetivo de masked language modeling sobre un corpus bilingüe.

El corpus de entrenamiento combina Khmer Wikipedia (dumps de 2023-2024), WikiText-103 en inglés, subconjuntos khmer e inglés de MC4 y un corpus propio de code-switching con ejemplos sintéticos inyectados. El tokenizador es SentencePiece Unigram con vocabulario de 64.000 tokens, cobertura de caracteres 1.0 y una inyección forzada de vocabulario para términos técnicos críticos. La model card no detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (en un modelo encoder-only de fill-mask no serían el procedimiento habitual).

## Capacidades

- Relleno de máscaras (fill-mask) en texto khmer, inglés y mezclas de ambos.
- Comprensión de texto con cambios de código khmer-inglés, incluyendo términos técnicos, URL y vocabulario moderno.
- Preservación de morfología jemer compleja gracias al tokenizador de 64.000 tokens (palabras como ធម៌, កម្ម, និព្វាន o ប្រជាធិបតេយ្យ se codifican en un solo token).
- Base para fine-tuning en tareas de clasificación de secuencias, NER y question answering extractiva.
- Capacidades multilingües limitadas a los pares khmer e inglés; no cubre otros idiomas.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un encoder de comprensión, no un modelo generativo instruccional.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de sentimiento en redes sociales camboyanas: el modelo puede afinarse para clasificar opiniones en publicaciones que mezclan jemer coloquial con anglicismos técnicos, un escenario donde los tokenizadores multilingües fragmentan el texto y pierden señal.
- Reconocimiento de entidades nombradas (NER) en noticias y foros bilingües: al preservar íntegras las palabras jemer y los términos ingleses, se reduce el ruido de tokenización antes de la capa de clasificación.
- Question answering extractiva sobre documentación técnica en jemer con fragmentos en inglés: útil en bases de conocimiento de soporte donde las consultas alternan ambos idiomas.
- Moderación de contenido y filtrado de spam: fine-tuning como clasificador binario o multiclase sobre comentarios code-switched, con bajo coste de inferencia por el reducido tamaño del modelo.
- Preprocesamiento y normalización de texto para pipelines de NLP en jemer: el tokenizador puede usarse de forma independiente para segmentar corpus y alimentar otros modelos o índices de búsqueda.
- Etiquetado de corpus y anotación asistida: rellenar máscaras para sugerir términos en herramientas de anotación lingüística de textos khmer-inglés.
- Extracción de información en comercio electrónico local: identificación de productos, marcas y atributos en listados que combinan jemer con nombres de producto en inglés.

## Benchmarks y rendimiento

La model card solo publica métricas de tokenización, no de tareas downstream (MMLU, HumanEval, GSM8K u otras no aplican a un encoder de fill-mask).

| Metrica | Este modelo (64K) | ALBERT Base (16K) | XLM-R Base (250K) |
|---|---|---|---|
| TPC (khmer, menor es mejor) | 0,114 | 0,164 | 0,264 |
| Round-trip sin pérdida | Sí | Sí | Sí |
| Velocidad de tokenización | 0,3 M tok/s | 0,3 M tok/s | 0,4 M tok/s |

Integridad de palabras complejas (número de tokens generados):

| Palabra | Este modelo | ALBERT Base | XLM-R Base |
|---|---|---|---|
| ធម៌ (dharma) | 1 token | 2 tokens | 2 tokens |
| កម្ម (karma) | 1 token | 2 tokens | 2 tokens |
| និព្វាន (nirvana) | 1 token | 4 tokens | 3 tokens |
| អភិវឌ្ឍន៍ (desarrollo) | 2 tokens | 2 tokens | 2 tokens |
| សេដ្ឋកិច្ច (economía) | 1 token | 2 tokens | 1 token |
| ប្រជាធិបតេយ្យ (democracia) | 1 token | 2 tokens | 2 tokens |
| អធិបតេយ្យ (soberanía) | 1 token | 2 tokens | 5 tokens |

No se han publicado resultados de benchmarks downstream en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (15,6 M de parámetros, unos 62 MB de pesos); en fp16 o int8, decenas de MB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090, RTX 3060 o incluso una T4 sobran para este modelo.
- Cabe en cualquier GPU consumer e incluso en CPU para cargas moderadas; el cuello de botella es el tokenizador, no el modelo.
- Opciones de despliegue: transformers (AutoTokenizer + AlbertForMaskedLM), ONNX Runtime, TorchScript; también puede servirse con TGI o con FastAPI propio. No hay pesos GGUF publicados, aunque la conversión a llama.cpp sería viable por el tamaño.
- Latencia y throughput: no disponibles de forma oficial; la model card solo reporta 0,3 M tokens/s para el tokenizador, no para la inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| noson71/albert-khmer-codeswitch | 15,6 M | no disponible | km, en | Apache-2.0 | Fill-mask bilingüe khmer-inglés |
| seanghay/albert-khmer-small (base) | no disponible | no disponible | km | no disponible | ALBERT solo jemer |
| XLM-R Base | 278 M | 512 | 100 idiomas | MIT | Encoder multilingüe genérico |
| mBERT | 178 M | 512 | 104 idiomas | Apache-2.0 | Encoder multilingüe genérico |

Frente a XLM-R y mBERT, este modelo es entre 10 y 18 veces más pequeño y su tokenizador preserva mejor la morfología jemer (TPC de 0,114 frente a 0,264 en XLM-R). La contrapartida es una cobertura idiomática mucho menor y la ausencia de benchmarks downstream publicados que permitan comparar rendimiento en tareas concretas.

## Limitaciones y advertencias

- Solo cubre khmer e inglés; no es adecuado para otros idiomas ni para traducción automática (no es un modelo seq2seq).
- No es un modelo generativo: no puede usarse para chat, completado libre de texto ni instrucciones; únicamente para fill-mask y fine-tuning sobre tareas de comprensión.
- No se han publicado evaluaciones downstream (clasificación, NER, QA), por lo que el rendimiento real en producción es desconocido y debe validarse empíricamente.
- Riesgo de alucinación en el sentido de predicciones de máscara plausibles pero incorrectas; en un modelo de 15,6 M de parámetros la capacidad de razonamiento semántico es limitada.
- La longitud de contexto no está documentada; en ALBERT suele ser 512 tokens, pero no se confirma en la información disponible.
- El corpus incluye ejemplos sintéticos de code-switching, lo que puede introducir sesgos hacia patrones artificiales poco representativos del habla real.
- Sesgos conocidos: no documentados por el autor; al entrenar sobre Wikipedia y MC4, hereda los sesgos de esas fuentes.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base seanghay/albert-khmer-small debe verificarse por si tuviera condiciones adicionales.
- El modelo tiene 34 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/noson71/albert-khmer-codeswitch
- Modelo base: https://huggingface.co/seanghay/albert-khmer-small
