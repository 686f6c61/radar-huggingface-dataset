# alibaba-nlp-community/gte-multilingual-mlm-base

## Resumen

gte-multilingual-mlm-base es un codificador de texto multilingüe desarrollado por el Institute for Intelligent Computing de Alibaba Group y publicado dentro de la familia mGTE (aparece como mGTE-MLM-8192 en el artículo asociado). No es un modelo generativo: es un encoder con backbone transformer++ (BERT + RoPE + GLU) y vocabulario de XLM-R, con 306.210.496 parámetros (unos 306 M) y una ventana de contexto de hasta 8192 tokens, frente a los 512 tokens de XLM-R-base. Su pipeline en Hugging Face es fill-mask.

El modelo aborda la carencia de encoders multilingües de contexto largo: cubre 75 idiomas y supera a XLM-R-base tanto en GLUE (83,47 frente a 80,44) como en XTREME-R (64,44 frente a 62,02) con un tamaño de parámetros comparable. Se entrenó con enmascaramiento de tokens en dos fases, la segunda con RoPE base 160000 para extender el contexto de 2048 a 8192 tokens.

El repositorio alibaba-nlp-community/gte-multilingual-mlm-base es una conversión del original Alibaba-NLP/gte-multilingual-mlm-base en la que solo se ha modificado config.json para que el modelo cargue de forma nativa en Transformers sin trust_remote_code; los pesos son idénticos. Resulta relevante como backbone para fine-tuning multilingüe (clasificación, NER, QA extractiva) y como base de los modelos de embeddings y reranking de la serie mGTE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer++ (BERT + RoPE + GLU), vocabulario de XLM-R |
| Parámetros totales | 306.210.496 (~306 M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | 75 idiomas: af, ar, az, be, bg, bn, ca, ceb, cs, cy, da, de, el, en, es, et, eu, fa, fi, fr, gl, gu, he, hi, hr, ht, hu, hy, id, is, it, ja, jv, ka, kk, km, kn, ko, ky, lo, lt, lv, mk, ml, mn, mr, ms, my, ne, nl, no, pa, pl, pt, qu, ro, ru, si, sk, sl, so, sq, sr, sv, sw, ta, te, th, tl, tr, uk, ur, vi, yo, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | fill-mask (masked language modeling) |
| Tamaño del repositorio | 0,6 GB |
| Desarrollador | Institute for Intelligent Computing, Alibaba Group |
| Versión del repositorio | conversión de configuración sobre Alibaba-NLP/gte-multilingual-mlm-base (pesos sin cambios) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer++ que combina el esquema de BERT con atención rotatoria (RoPE) y capas GLU, implementado en el repositorio Alibaba-NLP/new-impl, y emplea el vocabulario de XLM-R. El resultado es un encoder bidireccional que produce representaciones contextuales y permite rellenar tokens enmascarados; no dispone de decodificación autoregresiva ni de mecanismos de atención específicos para generación.

El entrenamiento se basa en masked language modeling sobre c4-en, mc4, skypile, Wikipedia, CulturaX y otros corpus multilingües (el detalle de la composición se encuentra en el apéndice A.1 del artículo). Para alcanzar los 8192 tokens de contexto se siguió una estrategia multi-etapa: primero un preentrenamiento MLM en longitudes cortas (MLM-2048: lr 2e-4, mlm_probability 0,3, batch_size 8192, 250 000 pasos, rope_base 10000) y después un remuestreo de datos que reduce la proporción de textos cortos y continúa el MLM en contexto largo (MLM-8192: lr 5e-5, mlm_probability 0,3, batch_size 2048, 30 000 pasos, rope_base 160000). No se documenta ningún proceso de RLHF o DPO, algo esperable en un encoder de este tipo.

## Capacidades

- Relleno de máscaras (fill-mask): predice tokens enmascarados en 75 idiomas.
- Generación de representaciones contextuales bidireccionales para fine-tuning con cabezas específicas de tarea.
- Comprensión multilingüe con transferencia entre idiomas gracias al vocabulario compartido de XLM-R.
- Procesamiento de secuencias de hasta 8192 tokens, apto para documentos largos sin truncado agresivo.
- Base para tareas de clasificación de secuencias, etiquetado de tokens (NER, POS), QA extractiva, inferencia textual y similitud semántica, como demuestran los resultados en GLUE y XTREME-R.
- Sirve de backbone a los modelos de embeddings y de reranking de la serie mGTE descritos en el artículo.
- No soporta generación de texto, tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo de pensamiento: son capacidades fuera del alcance de un encoder MLM.

## Casos de uso

- Búsqueda semántica multilingüe: fine-tuning del encoder con objetivos de similitud o uso como backbone de recuperación permite indexar documentos en 75 idiomas en un mismo espacio vectorial, con secuencias de hasta 8192 tokens para pasajes largos.
- Clasificación de documentos multilingües: añadiendo una cabeza de clasificación sobre el token [CLS] o sobre el pooling elegido se pueden construir clasificadores de intención, tema o idioma que funcionan con un único modelo en lugar de uno por lengua.
- Moderación de contenido: entrenamiento con etiquetas de toxicidad o spam para filtrar textos en varios idiomas; el contexto de 8192 tokens permite evaluar hilos o artículos completos y no solo fragmentos aislados.
- Reconocimiento de entidades nombradas (NER): fine-tuning por etiquetado de tokens para extraer personas, organizaciones y localizaciones en corpus multilingües, con buen comportamiento en idiomas con pocos datos gracias a la transferencia desde lenguas mejor representadas.
- Question answering extractivo: localización de la respuesta dentro de un contexto largo, aprovechando la ventana de 8192 tokens para incluir documentos completos o varios pasajes concatenados.
- Reranking de resultados de búsqueda: es el backbone de los modelos de reranking de mGTE, de modo que se puede entrenar un reranker cross-encoder sobre pares (consulta, documento) para reordenar los candidatos devueltos por un retriever.
- Agrupamiento y deduplicación de corpus: generación de embeddings contextuales (con pooling) para agrupar noticias, tickets o registros duplicados entre idiomas, útil en pipelines de limpieza de datos.
- Segmentación de documentos largos: uso del encoder para puntuar fronteras de fragmento o coherencia local en documentos de hasta 8192 tokens, facilitando el chunking previo a un sistema RAG.

## Benchmarks y rendimiento

Resultados publicados en la model card (GLUE y XTREME-R):

| Modelo | Idiomas | Parámetros | Long. máx. | GLUE | XTREME-R |
|---|---|---|---|---|---|
| gte-multilingual-mlm-base | Múltiples | 306 M | 8192 | 83,47 | 64,44 |
| gte-en-mlm-base | Inglés | no disponible | 8192 | 85,61 | no disponible |
| gte-en-mlm-large | Inglés | no disponible | 8192 | 87,58 | no disponible |
| MosaicBERT-base | Inglés | 137 M | 128 | 85,4 | no disponible |
| MosaicBERT-base-2048 | Inglés | 137 M | 2048 | 85,0 | no disponible |
| JinaBERT-base | Inglés | 137 M | 512 | 85,0 | no disponible |
| nomic-bert-2048 | Inglés | 137 M | 2048 | 84,0 | no disponible |
| MosaicBERT-large | Inglés | 434 M | 128 | 86,1 | no disponible |
| JinaBERT-large | Inglés | 434 M | 512 | 83,7 | no disponible |
| XLM-R-base | Múltiples | 279 M | 512 | 80,44 | 62,02 |
| RoBERTa-base | Inglés | 125 M | 512 | 86,4 | no disponible |
| RoBERTa-large | Inglés | 355 M | 512 | 88,9 | no disponible |

No se han publicado en la información disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K u otros), ya que no son benchmarks aplicables a un encoder MLM.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 1,2 GB; en fp16/bf16: aproximadamente 0,6 GB; en int8: aproximadamente 0,3 GB. Cálculos estimados a partir de los 306,2 M de parámetros.
- Memoria de activaciones: crece con el producto de batch y longitud de secuencia. Con atención estándar, una secuencia de 8192 tokens en batch 1 puede consumir varios GB adicionales; conviene usar atención con kernel eficiente (SDPA/FlashAttention) para reducir el consumo y mantener coste lineal en la longitud.
- GPU recomendadas: A100, H100 o L4 para servir lotes grandes con contexto de 8192 tokens; RTX 4090, RTX 3090 o similares para fine-tuning e inferencia de alto rendimiento en local.
- Cabe en GPU de consumo: sí, con holgura. Con 4-6 GB de VRAM es suficiente para inferencia en fp16 con secuencias cortas o moderadas; 8-12 GB permiten contexto de 8192 con batch pequeño y fine-tuning ligero.
- Despliegue: Transformers (PyTorch) es la vía directa, ya que el repositorio está adaptado para carga nativa sin trust_remote_code; también son viables ONNX Runtime, torch.compile o TorchScript para servir el encoder como extractor de características. vLLM, llama.cpp y Ollama están orientados a modelos generativos de decodificación y no son el cauce habitual para este encoder; para servir representaciones o embeddings conviene TEI o Infinity con el modelo convertido a ese formato.
- Latencia y throughput: no disponible. No se publican cifras de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GLUE | XTREME-R | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|---|
| gte-multilingual-mlm-base | 306 M | 8192 | 83,47 | 64,44 | apache-2.0 | 75 | Hugging Face (repo oficial y espejo de comunidad) |
| XLM-R-base | 279 M | 512 | 80,44 | 62,02 | no disponible | Múltiples | Hugging Face |
| gte-en-mlm-base | no disponible | 8192 | 85,61 | no disponible | no disponible | Inglés | Hugging Face |
| gte-en-mlm-large | no disponible | 8192 | 87,58 | no disponible | no disponible | Inglés | Hugging Face |
| RoBERTa-base | 125 M | 512 | 86,4 | no disponible | no disponible | Inglés | Hugging Face |

Frente a XLM-R-base, el modelo iguala la cobertura multilingüe, aumenta la ventana de contexto de 512 a 8192 tokens y mejora 3,03 puntos en GLUE y 2,42 puntos en XTREME-R con un 9,7 % más de parámetros. Frente a las alternativas monolingües en inglés (RoBERTa, MosaicBERT, JinaBERT, nomic-bert), pierde algunos puntos de GLUE porque este benchmark es mayoritariamente inglés, pero ofrece cobertura de 75 idiomas y contexto largo en un único modelo.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para chat, redacción libre, agentes ni tool calling. Cualquier uso como asistente conversacional requiere un modelo de decodificación distinto.
- Requiere fine-tuning para la mayoría de tareas prácticas; fuera del relleno de máscaras, el modelo base rara vez es útil sin una cabeza específica o sin entrenamiento adicional.
- Riesgo de predicciones plausibles pero incorrectas: en fill-mask puede completar tokens con valores falsos o sesgados, especialmente en contextos ambiguos o con entidades poco frecuentes.
- Sesgos derivados de los corpus web empleados (C4, mc4, SkyPile, Wikipedia, CulturaX): sobrerrepresentación del inglés y de lenguas con más contenido digital, y posible reproducción de estereotipos presentes en esos datos.
- Cobertura lingüística desigual: se declaran 75 idiomas, pero la calidad y la cantidad de datos varían mucho entre ellos; los idiomas con menos recursos rendirán peor en las tareas derivadas.
- Comportamiento fuera del rango entrenado: aunque el RoPE base 160000 permite secuencias de 8192 tokens, el rendimiento puede degradarse en longitudes muy superiores o con textos que no se parezcan a la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se documentan restricciones adicionales de uso aceptable en la información disponible.
- Repositorio espejo: el identificador alibaba-nlp-community/gte-multilingual-mlm-base no es el repositorio del autor original, registra 0 descargas y 0 me gusta en el momento de la consulta y solo modifica config.json. Para producción conviene verificar la integridad de los pesos frente a Alibaba-NLP/gte-multilingual-mlm-base.
- No se han publicado cuantizaciones oficiales ni resultados de latencia; cualquier cifra de rendimiento en hardware concreto deberá medirse en el entorno de despliegue.

## Enlaces

- Modelo en Hugging Face (espejo de comunidad): https://huggingface.co/alibaba-nlp-community/gte-multilingual-mlm-base
- Modelo original: https://huggingface.co/Alibaba-NLP/gte-multilingual-mlm-base
- Repositorio de la implementación transformer++: https://huggingface.co/Alibaba-NLP/new-impl
- Artículo mGTE: https://arxiv.org/pdf/2407.19669
- Resumen del artículo en arXiv: https://arxiv.org/abs/2407.19669
- Documentación de GTE en Transformers: https://huggingface.co/docs/transformers/main/en/model_doc/gte
- Modelo relacionado gte-en-mlm-base: https://huggingface.co/Alibaba-NLP/gte-en-mlm-base
- Modelo relacionado gte-en-mlm-large: https://huggingface.co/Alibaba-NLP/gte-en-mlm-large
- Referencia XLM-R-base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Benchmark GLUE: https://aclanthology.org/W18-5446.pdf
- Benchmark XTREME-R: https://aclanthology.org/2021.emnlp-main.802.pdf
