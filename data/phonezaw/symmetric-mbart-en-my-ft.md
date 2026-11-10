# phonezaw/symmetric-mbart-en-my-ft

## Resumen

`symmetric-mbart-en-my-ft` es un ajuste fino (fine-tuning) del checkpoint multilingüe `facebook/mbart-large-50-many-to-many-mmt` de Meta AI, especializado en traducción entre inglés (en) y birmano (my). Lo publica el usuario `phonezaw` en Hugging Face bajo licencia MIT y está pensado para su uso directo con la librería `transformers` mediante `AutoModelForSeq2SeqLM` y `AutoTokenizer`.

El modelo conserva la arquitectura encoder-decoder transformer de mBART-50, con 383.365.317 parámetros reales según los pesos en safetensors, y hereda la cobertura lingüística del modelo base (50 idiomas), aunque el ajuste se ha orientado específicamente al par en-my. Su relevancia radica en cubrir un par de idiomas con pocos recursos digitales como el birmano, manteniendo la infraestructura estándar de Hugging Face y compatibilidad con endpoints.

La model card es mínima: no documenta el corpus de entrenamiento, hiperparámetros, ni resultados de evaluación más allá de la configuración de generación (5 beams, early stopping, longitud máxima 200). Cualquier dato no presente en la información disponible se marca como tal en esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mBART-50, seq2seq) |
| Parametros totales | 383.365.317 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (mBART-50 soporta hasta 1024 tokens de entrada en la práctica; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en, my (ajuste específico); el modelo base mBART-50 cubre 50 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `facebook/mbart-large-50-many-to-many-mmt`, que emplea una arquitectura transformer encoder-decoder con atención completa, diseñada originalmente para traducción multilingüe many-to-many. El ajuste se ha realizado sobre el par inglés-birmano, según indica el nombre del repositorio (`symmetric-mbart-en-my-ft`), lo que sugiere entrenamiento en ambas direcciones (en→my y my→en), aunque la model card no lo confirma explícitamente.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de técnicas de alineación (RLHF, DPO) ni innovaciones técnicas específicas del ajuste. La model card únicamente especifica la configuración de generación usada en evaluación: 5 beams, early stopping y longitud máxima de 200 tokens. El tokenizer requiere fijar `src_lang = "en_XX"` y forzar el token de idioma destino `my_MM` mediante `convert_tokens_to_ids`.

## Capacidades

- Traducción automática entre inglés y birmano (dirección en→my confirmada en la model card; my→en probable por el nombre "symmetric", no confirmado).
- Generación de texto seq2seq condicionada por tokens de idioma (`src_lang` y token forzado de destino).
- Compatibilidad con `AutoModelForSeq2SeqLM` y `AutoTokenizer` de Hugging Face.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- Herencia de la cobertura multilingüe del modelo base mBART-50 (50 idiomas), aunque el rendimiento fuera del par en-my no está documentado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica en inglés a birmano: el modelo puede integrarse en pipelines de localización para convertir manuales y guías, usando la configuración de generación documentada (5 beams, max_length 200) para obtener traducciones de calidad razonable en frases y párrafos cortos.
- Atención al cliente bilingüe en mercados de Myanmar: traducción en tiempo real de mensajes de soporte entre agentes que escriben en inglés y clientes que escriben en birmano, aprovechando la API estándar de `transformers` para despliegue en servicios HTTP.
- Traducción de contenidos web y noticias: integración en CMS o agregadores para generar versiones en birmano de artículos en inglés, con procesamiento por segmentos dada la longitud máxima de generación de 200 tokens.
- Subtitulado y transcripción: traducción de subtítulos en inglés a birmano en pipelines de vídeo, procesando cada línea o bloque de subtítulo de forma independiente.
- Investigación en traducción de bajos recursos: uso como baseline o punto de partida para experimentos con el par en-my, dado que el modelo es un fine-tuning reproducible sobre un checkpoint público y con licencia permisiva.
- Preprocesamiento para análisis de sentimiento o clasificación en birmano: traducción previa de textos birmanos al inglés (si la dirección my→en está soportada) para aplicar modelos de NLP entrenados principalmente en inglés.
- Despliegue en entornos con recursos limitados: con 383M parámetros, el modelo cabe en GPUs de consumo tras cuantización, lo que permite ejecutarlo en estaciones de trabajo o servidores modestos para traducción por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como BLEU, chrF, MMLU, HumanEval ni comparaciones cuantitativas con otros sistemas de traducción en-my.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,5 GB solo para pesos (383M parámetros × 4 bytes), más memoria para activaciones y KV cache; en la práctica, 3-4 GB suele ser suficiente para lotes pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 0,8 GB para pesos; 2-3 GB con overhead para inferencia por lotes.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,4 GB para pesos; 1,5-2 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 y lotes pequeños; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, siendo las de gama alta útiles para mayor throughput.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) e incluso GPUs con 4-6 GB en cuantización.
- Opciones de despliegue: `transformers` (nativo), Hugging Face Inference Endpoints (tag `endpoints_compatible`), vLLM (soporte seq2seq limitado; verificar compatibilidad con mBART), TGI (soporte de modelos encoder-decoder variable), llama.cpp/Ollama (requiere conversión a GGUF, no publicada en el repo).
- Latencia y throughput: no disponibles. Con 383M parámetros y 5 beams, se espera una latencia de decenas a cientos de milisegundos por frase en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phonezaw/symmetric-mbart-en-my-ft | 383M | no disponible | en, my (ajuste); 50 en base | MIT | Hugging Face |
| facebook/mbart-large-50-many-to-many-mmt | ~610M | 1024 tokens (aprox.) | 50 | MIT | Hugging Face |
| Helsinki-NLP/opus-mt-en-my | no disponible | no disponible | en, my | CC-BY 4.0 (habitual en OPUS-MT) | Hugging Face |
| facebook/nllb-200-distilled-600M | 600M | 1024 tokens (aprox.) | 200 | CC-BY-NC 4.0 | Hugging Face |

La comparativa se basa en características públicas de los modelos citados; no hay datos de rendimiento comparativo publicados para este checkpoint. El modelo base mBART-50 tiene más parámetros (el ajuste reporta 383M en safetensors, posiblemente por poda o por diferencias de recuento), mientras que NLLB-200 ofrece mayor cobertura lingüística pero con licencia no comercial.

## Limitaciones y advertencias

- La model card no documenta el corpus de entrenamiento ni el proceso de ajuste, lo que impide evaluar sesgos específicos del par en-my.
- Riesgo de alucinación y de traducciones inexactas en textos largos o dominios especializados, dado que no hay evaluación publicada.
- Longitud máxima de generación configurada en 200 tokens en la evaluación; textos más largos requieren segmentación manual.
- El birmano es un idioma de bajos recursos; la calidad puede degradarse en terminología técnica, nombres propios y expresiones coloquiales.
- Aunque la licencia es MIT, el modelo base mBART-50 tiene su propia licencia (MIT según el repositorio de Meta), por lo que se recomienda revisar los términos del checkpoint original antes de uso comercial.
- No se documenta soporte de tool calling, agentes ni otras capacidades más allá de la traducción seq2seq.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La dirección my→en no está confirmada explícitamente en la model card, aunque el nombre "symmetric" lo sugiere; conviene validarla empíricamente antes de usarla en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phonezaw/symmetric-mbart-en-my-ft
- Modelo base: https://huggingface.co/facebook/mbart-large-50-many-to-many-mmt
- Paper de mBART-50 (Liu et al., 2020): https://arxiv.org/abs/2008.00401
- Repositorio de fairseq (Meta AI): https://github.com/facebookresearch/fairseq
- Documentación de transformers para mBART: https://huggingface.co/docs/transformers/model_doc/mbart
