# csikasote/omniASR-CTC-300M-v2-Zulu-Lwazi

## Resumen

omniASR-CTC-300M-v2-Zulu-Lwazi es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura Wav2Vec2, convertido por csikasote a partir del checkpoint `omniASR_CTC_300M_v2` de la familia OmniLingual desarrollada por Meta AI. El modelo genera logits CTC sobre un vocabulario SentencePiece y es capaz de transcribir audio en múltiples idiomas, aunque esta variante concreta se orienta a la transcripción de zulú y está vinculada al corpus Lwazi, utilizado habitualmente en tareas de ASR para lenguas sudafricanas.

Con 325,98 millones de parámetros y una ventana de contexto que depende del audio de entrada (el modelo procesa secuencias temporales completas), este modelo pertenece a la categoría de ASR ligero de 300 millones de parámetros que elimina el cabezal de modelado de lenguaje para ofrecer una decodificación CTC directa, más eficiente y adecuada para streaming. La relevancia actual del modelo radica en su capacidad para abordar lenguas de bajos recursos, un área donde los sistemas comerciales suelen tener cobertura limitada, y en que su conversión a HuggingFace facilita su integración en pipelines modernos.

La verificación de paridad numérica con el checkpoint original de fairseq2 (atol=1e-4) garantiza que la conversión es fiel, lo que permite a desarrolladores e investigadores utilizar este modelo con confianza en entornos de producción o investigación. El modelo está publicado bajo una licencia no especificada, por lo que se recomienda precaución antes de un uso comercial a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (encoder transformer con capa CTC) |
| Parametros totales | 325.983.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio de duración variable; la ventana efectiva depende de la capa de convolución y del stride temporal) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors de precisión completa) |
| Idiomas soportados | no disponible (el nombre sugiere zulú y el conjunto Lwasi, pero no hay lista oficial; el checkpoint original es multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura Wav2Vec2 con un encoder transformer de 24 capas, tamaño oculto de 1024, 16 cabezas de atención y una capa intermedia FFN de 4096 unidades. La salida son logits CTC sobre un vocabulario SentencePiece de 10.288 tokens, sin cabezal de lenguaje adicional, lo que reduce la complejidad y permite una decodificación más directa y eficiente en comparación con modelos que combinan ASR con LM externos. El checkpoint original, `omniASR_CTC_300M_v2`, proviene del proyecto OmniLingual de Meta, que entrena modelos multilingües de ASR con datos de cientos de idiomas, incluyendo lenguas africanas de bajos recursos.

La conversión a HuggingFace se realizó desde fairseq2 y se verificó la paridad numérica de las salidas (atol=1e-4) en una muestra de audio. No se especifican los datos exactos de entrenamiento (número de tokens, composición del dataset, técnicas de alineamiento como RLHF o DPO) en la información disponible; el modelo se distribuye únicamente como checkpoint convertido, sin detalles adicionales de entrenamiento.

## Capacidades

- Transcripción de voz a texto en múltiples idiomas gracias al entrenamiento multilingüe del checkpoint base de OmniLingual.
- Decodificación CTC directa sin necesidad de un modelo de lenguaje externo, lo que reduce la latencia y la complejidad de despliegue.
- Compatible con el pipeline `automatic-speech-recognition` de HuggingFace, por lo que se puede usar con `Wav2Vec2ForCTC` y `AutoProcessor`.
- Soporte de audio muestreado a 16 kHz, con re-muestreo automático si se usa torchaudio.
- Verificado numéricamente contra el checkpoint original de fairseq2, garantizando consistencia en las predicciones.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo exclusivamente de ASR.

## Casos de uso

- **Transcripción de reuniones y entrevistas en zulú**: el modelo puede procesar audio de reuniones grabadas y generar transcripciones textuales, facilitando la documentación y búsqueda de contenido en entornos corporativos o de investigación.
- **Subtitulado automático de vídeo**: integrado en un pipeline de procesamiento de vídeo, el modelo puede generar subtítulos en tiempo real o de manera asíncrona para contenido en zulú u otros idiomas soportados, útil para plataformas de streaming o archivos de vídeo.
- **Asistente de voz para aplicaciones móviles**: al ser ligero (300M parámetros) y compatible con `transformers`, puede desplegarse en servidores o dispositivos con recursos moderados para convertir comandos de voz en texto en aplicaciones de banca, salud o educación.
- **Investigación en lenguas de bajos recursos**: dado que el checkpoint base es multilingüe y esta variante se orienta al zulú, sirve como punto de partida para investigación en ASR de lenguas africanas, incluyendo fine-tuning con datos adicionales.
- **Archivo y digitalización de material de audio histórico**: el modelo puede transcribir grabaciones de archivo en zulú, generando texto buscable para bibliotecas o instituciones culturales.
- **Desarrollo de herramientas de accesibilidad**: permite crear aplicaciones de dictado o transcripción para personas con discapacidades, aprovechando el soporte de audio de 16 kHz y la API de HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER (Word Error Rate) ni comparaciones con otros modelos ASR. La única verificación documentada es la paridad numérica con el checkpoint de fairseq2, que no implica evaluación de rendimiento en tareas de transcripción.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 325,98 millones de parámetros en precisión float32, el modelo ocupa aproximadamente 1,3 GB en memoria (1.303 MB). En float16, el uso de VRAM se reduce a unos 0,65 GB. En cuantización int8, podría bajar a unos 0,33 GB, aunque no se publican cuantizaciones oficiales.
- **GPU recomendadas**: el modelo cabe en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4090 (24 GB) sin problemas. También puede ejecutarse en GPUs de centro de datos como A100 o H100, aunque no son necesarias para este tamaño.
- **Compatibilidad con consumer GPU**: sí, es viable en cualquier GPU con al menos 4 GB de VRAM para inferencia en float16.
- **Opciones de despliegue**: al ser un modelo `transformers`, se puede servir con vLLM, HuggingFace TGI, o usar `pipeline` de transformers directamente. Para despliegues ligeros, también se puede exportar a ONNX o usar llama.cpp (aunque el modelo no es LLM, sino un encoder de audio, por lo que llama.cpp no es adecuado; mejor usar ONNX Runtime o TGI). En el ecosistema de audio, también se puede usar con `torchaudio` y `transformers` para inferencia local.
- **Latencia y throughput**: no se han publicado datos de latencia o throughput. Al ser un modelo CTC sin autoregresión, la latencia es relativamente baja, pero depende del hardware y la longitud del audio de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| omniASR-CTC-300M-v2-Zulu-Lwazi | 325,98 M | no disponible | no disponible | HuggingFace |
| omniASR-CTC-300m-v2-Waxal | ~300 M (no verificado) | no disponible | no disponible | HuggingFace |
| omniASR-CTC-300m-v2-Zulu | ~300 M (no verificado) | no disponible | no disponible | HuggingFace |
| omniASR-CTC-300M (original) | ~300 M | no disponible | no disponible | ModelScope |

Las variantes Waxal y Zulu del mismo autor son prácticamente idénticas en arquitectura y origen, diferenciándose únicamente en el idioma objetivo. El modelo original de Meta, disponible en ModelScope, es el mismo checkpoint base. No se dispone de información sobre alternativas comerciales o de código abierto comparables en la búsqueda web.

## Limitaciones y advertencias

- **Licencia no especificada**: el autor no indica licencia en la model card, lo que genera incertidumbre jurídica para uso comercial. Se recomienda contactar con el autor o buscar el checkpoint original de Meta para conocer los términos.
- **Idiomas no documentados**: aunque el nombre sugiere zulú y el dataset Lwasi, no hay lista explícita de idiomas soportados ni métricas de rendimiento por idioma. El modelo podría no funcionar bien en otros idiomas del checkpoint original.
- **Riesgo de alucinación en ASR**: como cualquier modelo CTC, puede producir transcripciones incorrectas o inventar contenido cuando el audio es ambiguo, ruidoso o contiene acentos no vistos en el entrenamiento.
- **Sin cuantizaciones oficiales**: no se proporcionan versiones cuantizadas, por lo que la inferencia en CPU puede ser lenta si no se convierte a ONNX o se usa precisión mixta.
- **Contexto limitado**: al ser un modelo CTC, no tiene un mecanismo de atención de largo contexto como los LLM; la transcripción se realiza por segmentos temporales, lo que puede afectar a la coherencia en audios muy largos.
- **Falta de benchmarks**: la ausencia de métricas de rendimiento impide comparar su calidad con otros modelos ASR, por lo que no se puede validar su utilidad en producción sin una evaluación propia.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/csikasote/omniASR-CTC-300M-v2-Zulu-Lwazi
- Variante Waxal: https://huggingface.co/csikasote/omniASR-CTC-300m-v2-Waxal
- Variante Zulu: https://huggingface.co/csikasote/omniASR-CTC-300m-v2-Zulu
- Modelo original en ModelScope: https://www.modelscope.cn/models/manyeyes/omniASR-CTC-300M
- Repo de OmniLingual (Meta): https://github.com/facebookresearch/omnilingual-asr
- Perfil de GitHub del autor: https://github.com/csikasote
- Artículo de blog sobre omniASR-CTC-300M: https://aichina.news/blog/meta-s-omniasr-ctc-300m-a-lightweight-multilingual-asr-model-for-l0tbzp/
