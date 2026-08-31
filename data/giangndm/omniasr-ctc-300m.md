# giangndm/omniASR-CTC-300M

## Resumen

omniASR-CTC-300M es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por Meta AI como parte de la familia Omnilingual ASR. Este modelo concreto es la conversión a formato `safetensors` en precisión `bfloat16` del checkpoint original `facebook/omniASR-CTC-300M`, realizada por el usuario giangndm. El modelo está diseñado para transcribir audio a texto en más de 1600 idiomas, lo que lo convierte en una de las soluciones de ASR con mayor cobertura lingüística disponibles en código abierto.

La arquitectura del modelo es un Conformer-CTC, una combinación de la arquitectura Conformer (convolución + atención) con el objetivo de entrenamiento CTC (Connectionist Temporal Classification). Con 325,49 millones de parámetros, el modelo ofrece un equilibrio entre precisión y velocidad de inferencia, siendo aproximadamente 96 veces más rápido que el modelo más grande de la familia (omniASR-LLM-7B) en términos de factor de tiempo real. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integración en productos.

La relevancia de este modelo radica en su capacidad para abordar la transcripción multilingüe a gran escala con un coste computacional reducido. Su tamaño de 300M lo hace viable para despliegue en GPUs de consumo, y su velocidad de inferencia (factor de tiempo real de 0.001) lo posiciona como una opción sólida para aplicaciones de transcripción en tiempo real o de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC |
| Parametros totales | 325.494.996 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (conversion del checkpoint original FP32) |
| Idiomas soportados | 1600+ (formato `{codigo_idioma}_{script}`, p. ej. `eng_Latn`, `cmn_Hans`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Conformer-CTC, que combina capas de convolución y atención para capturar tanto patrones locales como globales en la señal de audio. El objetivo de entrenamiento es CTC, que permite el alineamiento automático entre audio y texto sin necesidad de anotaciones a nivel de frame. El tokenizador es un modelo SentencePiece (`omniASR_tokenizer.model`).

El entrenamiento se realizó sobre el corpus `facebook/omnilingual-asr-corpus`, un dataset multilingüe que cubre más de 1600 idiomas. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineamiento adicionales como RLHF o DPO. El modelo original fue desarrollado con fairseq2, el kit de herramientas de secuenciación de Meta AI.

La familia Omnilingual ASR incluye variantes con diferentes arquitecturas (W2V, CTC, LLM) y tamaños (300M, 1B, 3B, 7B). Este modelo en particular es la variante CTC de 300M, optimizada para velocidad de inferencia.

## Capacidades

- Transcripción de voz a texto en más de 1600 idiomas, cubriendo una amplia variedad de lenguas y sistemas de escritura.
- Reconocimiento de voz multilingüe con alta velocidad de inferencia: factor de tiempo real de 0.001 (96 veces más rápido que omniASR-LLM-7B) en una A100 con audio de 30 segundos.
- Inferencia eficiente en memoria: requiere aproximadamente 2 GiB de VRAM en FP32, y el checkpoint en bfloat16 ocupa ~651 MB.
- Soporte para identificación de idioma implícita a través del tokenizador multilingüe.
- Integración con el pipeline de inferencia de la librería `omnilingual-asr`, que permite transcribir lotes de archivos de audio.
- Capacidad de transcripción en tiempo real o de alto rendimiento gracias a la arquitectura CTC.

## Casos de uso

- Transcripción de reuniones y videollamadas multilingües: el modelo puede transcribir conversaciones en tiempo real en múltiples idiomas, lo que permite generar actas automáticas o subtítulos en directo. Su baja latencia (RTF 0.001) lo hace adecuado para este escenario.
- Subtitulado automático de vídeo para plataformas de streaming: al soportar más de 1600 idiomas, puede generar subtítulos para contenido en lenguas minoritarias que otros sistemas no cubren. El despliegue en GPU de consumo reduce los costes de infraestructura.
- Análisis de llamadas de atención al cliente: transcripción de audio de centros de contacto para su posterior análisis de sentimiento o extracción de información. La licencia Apache 2.0 permite su integración en sistemas propietarios.
- Archivado y búsqueda de contenido audiovisual: indexación de archivos de audio y vídeo mediante transcripción, habilitando búsqueda por texto en bibliotecas multimedia multilingües. El tamaño del modelo (325M parámetros) permite procesar grandes volúmenes de audio con hardware moderado.
- Asistentes de voz para idiomas de bajos recursos: al cubrir 1600+ idiomas, puede servir como base para desarrollar asistentes de voz en lenguas que carecen de sistemas ASR comerciales. La licencia Apache 2.0 facilita su uso en proyectos de investigación y desarrollo.
- Generación de subtítulos para contenido educativo y de formación: transcripción automática de cursos, seminarios y material didáctico en múltiples idiomas, facilitando el acceso a contenido en lenguas diversas. La velocidad de inferencia permite procesar horas de audio en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (CER, WER) específicos para este modelo en la informacion disponible. La tabla de la familia de modelos en la model card original incluye métricas de velocidad (RTF) pero no métricas de precisión. Se recomienda consultar el paper de Omnilingual ASR para datos comparativos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2 GiB en FP32 según la model card original. El checkpoint en bfloat16 (~651 MB) reduce aún más el consumo de memoria.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo. Una A100 se utilizó para las métricas de referencia, pero el modelo es viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Sí cabe en GPUs de consumo: el modelo es adecuado para tarjetas gráficas de gama media y alta orientadas a consumidores.
- Opciones de despliegue: la librería `omnilingual-asr` proporciona un pipeline de inferencia de referencia. También es posible cargar el modelo con fairseq2. No se menciona soporte explícito para vLLM, llama.cpp, Ollama o TGI, ya que estas herramientas están orientadas a modelos de lenguaje y no a ASR.
- Latencia y throughput: factor de tiempo real de 0.001 (batch=1, audio_len=30s, BF16, A100), lo que significa que procesa 30 segundos de audio en 0.03 segundos. El throughput depende del hardware y del batch size.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Velocidad (RTF) | VRAM estimada |
|---|---|---|---|---|---|
| omniASR-CTC-300M | 325M | 1600+ | Apache 2.0 | 0.001 | ~2 GiB |
| omniASR-CTC-1B | 975M | 1600+ | Apache 2.0 | 0.002 | ~3 GiB |
| omniASR-LLM-300M | 1.63B | 1600+ | Apache 2.0 | 0.090 | ~5 GiB |
| Whisper large-v3 (OpenAI) | 1.55B | ~100 | MIT | ~0.1 (aprox.) | ~10 GiB |

La comparativa se centra en la familia Omnilingual ASR y Whisper large-v3 como alternativa popular. omniASR-CTC-300M destaca por su cobertura de idiomas (1600+ vs ~100 de Whisper) y su velocidad de inferencia significativamente mayor. Whisper ofrece mejor precisión en idiomas de altos recursos, pero omniASR-CTC-300M es superior en cobertura lingüística y eficiencia computacional.

## Limitaciones y advertencias

- No se dispone de métricas de precisión (CER/WER) publicadas para este modelo en la informacion disponible, lo que dificulta evaluar su calidad en tareas específicas.
- El modelo es una conversión a bfloat16 del checkpoint original; aunque la conversión es segura, puede haber ligeras diferencias numéricas respecto al modelo FP32.
- La cobertura de 1600+ idiomas no implica la misma calidad en todos ellos; es probable que el rendimiento sea inferior en lenguas con menos datos de entrenamiento.
- No se especifica la longitud máxima de audio soportada; los modelos CTC suelen tener limitaciones de contexto, aunque la familia incluye variantes "Unlimited" para audio de longitud ilimitada.
- El modelo no incluye capacidades de condicionamiento por idioma (a diferencia de la variante LLM), lo que puede afectar a la precisión en idiomas con escritura ambigua.
- La documentación de la conversión no incluye instrucciones detalladas de uso; se recomienda consultar la documentación del modelo original para el pipeline de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones de la licencia en su jurisdicción.

## Enlaces

- Modelo original: https://huggingface.co/facebook/omniASR-CTC-300M
- Repositorio GitHub: https://github.com/facebookresearch/omnilingual-asr
- Demo oficial: https://huggingface.co/spaces/facebook/omniasr-transcriptions
- Paper: https://ai.meta.com/research/publications/omnilingual-asr-open-source-multilingual-speech-recognition-for-1600-languages/
- Blog de Meta AI: https://ai.meta.com/blog/omnilingual-asr-advancing-automatic-speech-recognition/
- Licencia: https://github.com/facebookresearch/omnilingual-asr/blob/main/LICENSE
- Documentación de modelos CTC: https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
