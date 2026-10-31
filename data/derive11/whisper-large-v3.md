# derive11/whisper-large-v3

## Resumen

Whisper large-v3 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por OpenAI, descrito en el artículo *Robust Speech Recognition via Large-Scale Weak Supervision*. Esta ficha corresponde al mirror `derive11/whisper-large-v3` publicado en Hugging Face, que replica los pesos originales de OpenAI en formato safetensors con un tamaño de 1.543.490.560 parámetros (aproximadamente 1.540 millones).

El modelo resuelve el problema de la transcripción y traducción de audio de forma robusta en condiciones reales: acentos variados, ruido de fondo, jerga técnica y múltiples idiomas, sin necesidad de ajuste fino por dominio. Fue entrenado con más de 5 millones de horas de audio etiquetado (1 millón de horas con etiquetado débil y 4 millones de horas con pseudoetiquetas generadas por Whisper large-v2), lo que le permite generalizar en escenarios zero-shot a muchos dominios y conjuntos de datos.

Whisper large-v3 es relevante porque mantiene la arquitectura de sus predecesores (large y large-v2) pero mejora el rendimiento en una amplia variedad de idiomas, con una reducción de errores del 10 % al 20 % respecto a large-v2. Incorpora además dos cambios concretos: el espectrograma de entrada usa 128 bins de frecuencia Mel en lugar de 80, y añade un nuevo token de idioma para el cantonés. Su licencia Apache 2.0 permite su uso comercial sin restricciones, lo que lo convierte en una opción de referencia para pipelines de ASR en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 1.543.490.560 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (30 segundos de audio por ventana; 448 tokens de salida máximos por segmento según el ejemplo de la model card) |
| Tipos de cuantizacion | no disponible (soporta float16 y float32 según el ejemplo de la model card) |
| Idiomas soportados | 99 idiomas (incluye español, inglés, chino, alemán, ruso, coreano, francés, japonés, portugués, árabe, hindi, italiano, catalán, euskera, gallego y muchos más) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también con soporte pytorch y jax según los tags) |

## Arquitectura y entrenamiento

Whisper large-v3 emplea una arquitectura de Transformer encoder-decoder clásica aplicada a audio. El codificador procesa espectrogramas log-Mel (con 128 bins de frecuencia en esta versión, frente a los 80 de las versiones anteriores) y el decodificador autoregresivo genera el texto transcrito o traducido, con tokens especiales para idioma, tarea (transcripción o traducción) y marcas de tiempo. No es un modelo MoE: todos los parámetros están activos en cada pasada.

El entrenamiento se realizó sobre una mezcla de 1 millón de horas de audio con etiquetado débil y 4 millones de horas de audio con pseudoetiquetas generadas por Whisper large-v2, completando 2,0 épocas sobre este conjunto. Esta estrategia de pseudoetiquetado a gran escala es la innovación técnica central de la familia Whisper: permite alcanzar un rendimiento robusto zero-shot sin depender exclusivamente de datasets curados. Entre las técnicas de decodificación soportadas destacan el *temperature fallback* (reintento con temperaturas crecientes ante salidas degeneradas), la condición sobre tokens previos y umbrales de detección de silencio (*no_speech_threshold*) y de ratio de compresión para filtrar alucinaciones por repetición.

## Capacidades

- Transcripción de voz a texto (ASR) en 99 idiomas, con detección automática del idioma de origen o especificación manual a priori.
- Traducción de voz a texto en inglés (*speech translation*) mediante el parámetro `task="translate"`.
- Transcripción de audios de longitud arbitraria mediante el pipeline de Hugging Face Transformers (segmentación interna del audio).
- Predicción de marcas de tiempo a nivel de frase (`return_timestamps=True`) y a nivel de palabra (`return_timestamps="word"`), útil para subtítulos y alineación.
- Decodificación robusta con temperature fallback, condition on previous tokens, umbrales de logprob y de no-speech configurables.
- Procesamiento por lotes de múltiples ficheros de audio en paralelo mediante el parámetro `batch_size`.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo especializado en secuencias de audio a texto.

## Casos de uso

- Subtitulado automático de vídeo: las marcas de tiempo a nivel de palabra y frase permiten generar ficheros SRT/VTT alineados sin postprocesado manual, ideal para plataformas de contenido y productoras.
- Transcripción de reuniones y podcasts: el pipeline acepta audios de longitud arbitraria, por lo que puede procesar grabaciones completas de horas y generar actas o notas a partir del texto resultante.
- Atención al cliente y centros de llamadas: transcripción en lote de grabaciones de llamadas para analítica de conversación, control de calidad y cumplimiento normativo, aprovechando el procesamiento paralelo con `batch_size`.
- Traducción de contenido multimedia al inglés: el modo de traducción de voz permite subtitular o hacer accesible contenido en español u otros 98 idiomas para audiencias anglófonas.
- Generación de corpus de voz y datasets: dada su robustez zero-shot, es adecuado para anotar a gran escala audio no etiquetado y construir datasets de entrenamiento para otros modelos.
- Accesibilidad: transcripción en tiempo casi real de clases, conferencias y eventos para personas sordas o con dificultad auditiva, en castellano y otras lenguas cooficiales como catalán, euskera y gallego.
- Indexación y búsqueda de contenido audiovisual: convertir bibliotecas de audio a texto para habilitar búsqueda semántica y recuperación de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que large-v3 muestra una reducción de errores del 10 % al 20 % respecto a Whisper large-v2 en una amplia variedad de idiomas, sin cifras concretas de WER en datasets como Common Voice, Fleurs o LibriSpeech.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.540 millones de parámetros, en float16 el modelo ocupa aproximadamente 3 GB de pesos, más overhead de activaciones y decodificador; en la práctica se recomiendan entre 6 y 10 GB de VRAM para inferencia cómoda en float16. En float32 la huella se duplica (unos 6 GB solo de pesos).
- GPU recomendadas: cualquier GPU moderna con 8 GB o más de VRAM es suficiente, como la RTX 3060, RTX 4060 Ti, RTX 4090, T4, A10G o A100. No se requiere hardware de gama datacenter.
- Cabe en GPUs de consumo: sí, sin cuantización adicional en float16 en GPUs de 8 GB; en CPUs también funciona (más lento), y el repositorio indica compatibilidad con JAX además de PyTorch.
- Opciones de despliegue: Hugging Face Transformers (pipeline de ASR, método recomendado según la model card), así como ecosistemas habituales de la familia Whisper como faster-whisper, whisper.cpp y Ollama para despliegues ligeros (esta ficha se centra en el checkpoint de Transformers en safetensors).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Comentario |
|---|---|---|---|---|
| Whisper large-v3 (este modelo) | 1.543,49 M | ASR + traducción a inglés, 99 idiomas | Apache 2.0 | Referencia de la familia; 128 bins Mel, token de cantonés |
| Whisper large-v2 | ~1.540 M | ASR + traducción, 98 idiomas | Apache 2.0 | 10-20 % más errores que large-v3; 80 bins Mel |
| Whisper medium | ~769 M | ASR + traducción, 99 idiomas | Apache 2.0 | Mitad de parámetros, menor VRAM, WER superior a large-v3 |

Otras alternativas de la categoría (Distil-Whisper, SeAMLESSM4T, MMS de Meta) no se detallan por no disponer de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: los modelos Whisper pueden generar texto no presente en el audio, especialmente en silencios prolongados o segmentos ambiguos; se recomienda usar los umbrales `no_speech_threshold`, `logprob_threshold` y `compression_ratio_threshold` con temperature fallback para mitigarlo.
- Rendimiento desigual por idioma: aunque soporta 99 idiomas, la calidad varía sustancialmente entre ellos; los idiomas con menos horas de entrenamiento tienen WER notablemente mayor.
- Hallucinations en audio con música o ruido denso: los segmentos con música de fondo son propensos a transcripciones espurias.
- Este repositorio es un mirror de terceros (`derive11`), no el oficial de OpenAI: verifica la integridad de los pesos antes de uso en producción y considera el repositorio oficial `openai/whisper-large-v3`.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero sin garantías; el uso en dominios sensibles (legal, médico) requiere validación humana de las transcripciones.
- La ventana de procesamiento nativa es de 30 segundos por segmento; audios largos dependen de la segmentación del pipeline, lo que puede afectar a la coherencia en fronteras de segmento.
- Estadísticas de adopción muy bajas en este mirror (18 descargas, 1 like), lo que limita la trazabilidad comunitaria del checkpoint.

## Enlaces

- Repositorio del modelo: https://huggingface.co/derive11/whisper-large-v3
- Artículo original: https://huggingface.co/papers/2212.04356 (Robust Speech Recognition via Large-Scale Weak Supervision)
- Modelo oficial de referencia: https://huggingface.co/openai/whisper-large-v3
- Whisper large-v2: https://huggingface.co/openai/whisper-large-v2
- Whisper large (v1): https://huggingface.co/openai/whisper-large
- Documentación del pipeline de ASR en Transformers: https://huggingface.co/docs/transformers/main_classes/pipelines
