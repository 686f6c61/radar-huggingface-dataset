# Rosasynthesiz/indic-transcribe-flex

## Resumen

Indic-Transcribe Flex es un modelo de reconocimiento automático del habla (ASR) desarrollado por Bodhan AI / AI4Bharat, distribuido aquí como un espejo no modificado por Rosasynthesiz para la aplicación de dictado offline RosaScribe. El modelo transcribe audio en inglés y en 26 lenguas y variedades de la India, incluyendo asamés, bengalí, hindi, tamil, telugu, urdu y varias lenguas de la familia bihari y munda. Su encoder deriva de nvidia/canary-1b-v2 (CC BY 4.0), lo que sitúa la arquitectura en la familia Canary de NVIDIA, adaptada y extendida para el multilingüismo índico.

El modelo cuenta con 1.222.553.584 parámetros totales y un repositorio de 4,9 GB con pesos en safetensors (4.890.451.120 bytes en `model.safetensors`). Se distribuye con código personalizado (`custom_code`) que incluye módulos propios de modelado, tokenización, extracción de características, detección de idioma (`lid.py`) y procesamiento de audio de formato largo (`long_form.py`). Su relevancia actual radica en cubrir una franja de lenguas con escasa representación en ASR de código abierto bajo una licencia permisiva para uso comercial con condiciones.

Este repositorio concreto es un espejo byte a byte del modelo original en la revisión `ecba9bac9013c0340fe814b336897ee51ed80be9`, con verificación SHA256 de todos los ficheros. Existe porque el repositorio original exige inicio de sesión en Hugging Face para descargar, y la licencia permite redistribuir copias no modificadas. No está afiliado ni respaldado por Bodhan AI ni AI4Bharat.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-derivado de nvidia/canary-1b-v2 (familia Canary), con módulos personalizados `indic_canary` |
| Parámetros totales | 1.222.553.584 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, bho, hne, bgc, bhb (27 en total) |
| Licencia | Indic Open Model License v1.0 (`license: other`) |
| Formato de pesos | safetensors (`model.safetensors`, 4.890.451.120 bytes) |
| Pipeline | automatic-speech-recognition |
| Tamaño del repositorio | 4,9 GB |
| Modelo base | bodhan-ai/indic-transcribe-flex (revisión `ecba9bac9013c0340fe814b336897ee51ed80be9`) |
| Encoder original | nvidia/canary-1b-v2 (CC BY 4.0) |

## Arquitectura y entrenamiento

La información disponible indica que el encoder deriva de nvidia/canary-1b-v2, un modelo de la familia Canary de NVIDIA orientado a ASR multilingüe. Sobre esa base, Bodhan AI / AI4Bharat ha construido un modelo con código de modelado propio (`modeling_indic_canary.py`, `configuration_indic_canary.py`, `feature_extraction_indic_canary.py`, `tokenization_indic_canary.py`), lo que sugiere adaptaciones específicas para el dominio índico. El repositorio incluye además dos tokenizadores SentencePiece separados (`tokenizer_multilingual.model` y `tokenizer_spl_tokens.model`), coherente con un diseño multilingüe con vocabularios diferenciados.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas más allá de la existencia de módulos dedicados a detección de idioma (`lid.py`) y decodificación de audio de formato largo (`long_form.py`). Estos módulos sugieren un pipeline pensado para audio real de duración variable y para la selección automática de idioma, pero su funcionamiento interno no está documentado en los datos disponibles.

## Capacidades

- Transcripción automática del habla (ASR) en inglés y 26 lenguas y variedades de la India.
- Detección automática de idioma mediante el módulo `lid.py`, que permite gestionar audio multilingüe sin especificar el idioma de antemano.
- Procesamiento de audio de formato largo mediante `long_form.py`, orientado a grabaciones de duración extendida.
- Soporte multilingüe amplio: asamés, bengalí, bodo, dogri, guyaratí, hindi, kannada, cachemir, konkani, maithili, malayalam, manipuri, maratí, nepalí, oriya, panyabí, sánscrito, santali, sindhi, tamil, telugu, urdu, además de bhojpuri, haryanvi, bagheli y bhili.
- Extracción de características de audio mediante `feature_extractor.safetensors` y el módulo dedicado.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento explícito. Es un modelo exclusivamente ASR.

## Casos de uso

- Dictado offline en escritorio: RosaScribe descarga el modelo una vez y lo ejecuta localmente para transcribir voz a texto sin conexión, sin cuenta ni token, gracias a este espejo. Adecuado por su tamaño moderado (4,9 GB) y su licencia que permite redistribución no modificada.
- Subtitulado de vídeo en lenguas índicas: el modelo puede transcribir pistas de audio en hindi, tamil, telugu, bengalí y otras lenguas para generar subtítulos, con detección automática de idioma que simplifica el procesamiento por lotes de contenido heterogéneo.
- Transcripción de reuniones y entrevistas: el módulo `long_form.py` está pensado para audio de duración extendida, lo que permite procesar grabaciones de reuniones o entrevistas sin segmentación manual previa.
- Accesibilidad y documentación clínica o administrativa: transcripción de notas de voz en lenguas regionales para su posterior revisión humana, con la ventaja de cubrir variedades como bhojpuri, maithili o santali que rara vez aparecen en ASR comerciales.
- Investigación lingüística y corpus: generación de transcripciones para construir corpus de habla en lenguas de bajos recursos, con la licencia permitiendo uso en investigación y gobierno.
- Archivado y búsqueda de audio: transcripción masiva de archivos de audio históricos o de radiodifusión en lenguas índicas para habilitar búsqueda textual, aprovechando el pipeline ASR estándar y la integración con Hugging Face Transformers.
- Integración en aplicaciones de terceros: al ser un modelo de 1.222 millones de parámetros con pesos safetensors y código personalizado, puede servirse mediante infraestructura propia, siempre que se respete la cláusula de aprobación escrita para uso como API o servicio alojado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 4,9 GB solo para pesos, más overhead de activaciones y buffers de audio; en la práctica, se recomienda al menos 8 GB de VRAM para fp32.
- En fp16/bf16: alrededor de 2,5 GB para pesos, con margen adicional para activaciones; cabe en GPUs consumer de gama media-alta.
- En cuantización de 8 bits: aproximadamente 1,3 GB para pesos; en 4 bits, alrededor de 0,7 GB. No se documentan formatos de cuantización oficiales en la información disponible.
- GPUs recomendadas: NVIDIA A100 o H100 para despliegues de alto throughput; RTX 4090, RTX 3090, RTX 4080 o RTX 4070 para inferencia en fp16 en consumer.
- Cabe en GPUs consumer: sí, en modelos con 8 GB o más de VRAM en fp16; en cuantización de 8 o 4 bits podría caber en GPUs con 4-6 GB, aunque no está documentado oficialmente.
- Opciones de despliegue: al usar `custom_code`, requiere cargar el código propio del repositorio con `trust_remote_code=True` en Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible; dado que es un modelo ASR con arquitectura personalizada, la integración con esos motores no está garantizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indic-Transcribe Flex (este) | 1.222.553.584 | 27 (en + 26 índicos) | no disponible | Indic Open Model License v1.0 | Hugging Face, con espejo público |
| nvidia/canary-1b-v2 | no disponible en la información | no disponible | no disponible | CC BY 4.0 | Hugging Face |
| Whisper large-v3 (OpenAI) | no disponible en la información | multilingüe amplio | no disponible | MIT (según conocimiento general, no verificado en esta información) | Hugging Face y múltiples motores |
| MMS (Meta) | no disponible en la información | más de 1000 lenguas | no disponible | CC BY-NC (según conocimiento general, no verificado) | Hugging Face |

La comparación cuantitativa con alternativas no puede completarse con los datos proporcionados; los datos de los modelos competidores no están disponibles en la información de referencia. La ventaja diferencial de este modelo es la cobertura específica de lenguas índicas de bajos recursos bajo una licencia que permite uso comercial con condiciones.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Como modelo entrenado sobre datos de habla, es probable que herede sesgos de acento, género y registro de sus datos de entrenamiento, pero no hay datos concretos.
- Riesgo de alucinación: en ASR, el riesgo se manifiesta como transcripciones plausibles pero incorrectas en audio ruidoso o en lenguas con pocos datos; no se documenta una evaluación específica de este riesgo.
- Limitaciones de contexto e idioma: aunque cubre 27 idiomas, no se documenta el rendimiento por idioma; las variedades con menos recursos (brx, sat, bgc, bhb, hne) probablemente tengan una calidad inferior a hindi o inglés.
- Restricciones de licencia: el uso como API o servicio alojado que terceros invocan requiere aprobación escrita previa de Bodhan AI, con algunas excepciones. Un producto que supere 500 millones de usuarios mensuales o 250 millones de dólares de ingresos anuales necesita una licencia separada. Se prohíben usos dañinos, deepfakes, clonación de voz sin consentimiento, vigilancia, estafas y desinformación.
- Atribución obligatoria: al redistribuir o construir sobre el modelo, debe mantenerse el aviso "Built with Indic-Transcribe Flex from Bodhan AI / AI4Bharat" y acreditar el encoder base nvidia/canary-1b-v2 (CC BY 4.0).
- El repositorio es un espejo no oficial: no está afiliado ni respaldado por Bodhan AI ni AI4Bharat; para cuestiones sobre el modelo, debe consultarse el repositorio original.
- Requiere `trust_remote_code=True` por el uso de código personalizado, lo que implica ejecutar código del repositorio; conviene verificar los SHA256 incluidos antes de usarlo en producción.
- No se documentan requisitos de formato de audio, frecuencia de muestreo ni límites de duración; el módulo `long_form.py` sugiere soporte de audio largo, pero sin cifras.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Rosasynthesiz/indic-transcribe-flex
- Modelo original: https://huggingface.co/bodhan-ai/indic-transcribe-flex/tree/ecba9bac9013c0340fe814b336897ee51ed80be9
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Modelo base del encoder: https://huggingface.co/nvidia/canary-1b-v2
- Aplicación RosaScribe: https://github.com/rosasynthesiz/rosascribe
