# iljab/omniASR-CTC-7B-v2

## Resumen

omniASR-CTC-7B-v2 es un modelo de reconocimiento automático de voz (ASR) basado en la arquitectura Wav2Vec2 con decodificación CTC (Connectionist Temporal Classification). Fue desarrollado originalmente por Meta AI como parte de la familia Omnilingual ASR, diseñada para transcribir audio en más de 1600 idiomas. Esta versión concreta es una conversión a HuggingFace del checkpoint oficial de Meta (`omniASR-CTC-7B-v2.pt`) realizada por el usuario iljab, que permite cargar el modelo directamente con la librería `transformers` mediante la clase `Wav2Vec2ForCTC`.

El modelo cuenta con aproximadamente 6.500 millones de parámetros (etiquetado como 7B) y una arquitectura de encoder profunda con 128 capas, lo que lo sitúa entre los modelos ASR más grandes disponibles en código abierto. Su licencia Apache-2.0 permite uso comercial sin restricciones, y al ser un modelo CTC ofrece una inferencia rápida y eficiente en comparación con variantes basadas en LLM de la misma familia. Es relevante actualmente porque proporciona una solución de transcripción multilingüe de alta calidad con un único modelo, sin necesidad de adaptación por idioma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (encoder transformer con decodificación CTC) |
| Parametros totales | 6.505.763.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por segmentos, sin límite explícito) |
| Tipos de cuantizacion | no disponible (pesos originales en fp32; se pueden cuantizar con herramientas externas) |
| Idiomas soportados | más de 1600 (según documentación de Meta) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Wav2Vec2, un encoder transformer que procesa representaciones de audio crudo (waveform) y produce una secuencia de características. La decodificación se realiza mediante CTC, que alinea automáticamente las salidas con la transcripción sin necesidad de un modelo de lenguaje externo. La configuración específica incluye 128 capas de encoder, un tamaño oculto de 2048, 16 cabezas de atención y una capa FFN intermedia de 8192 unidades. El vocabulario tiene 10288 tokens, con el token `<s>` (id 0) reservado como blank de CTC.

El entrenamiento fue realizado por Meta AI con datos multilingües de la familia Omnilingual ASR, que cubre más de 1600 idiomas. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset o si se aplicaron técnicas como RLHF o DPO. Al ser un modelo CTC, no incorpora un decodificador autoregresivo, lo que reduce la latencia en comparación con modelos basados en LLM de la misma familia.

## Capacidades

- Transcripción de voz a texto en más de 1600 idiomas, incluyendo lenguas de bajos recursos.
- Reconocimiento de audio en tiempo real gracias a la decodificación CTC, que no requiere generación autoregresiva.
- Procesamiento de audio de duración variable, sin límite explícito de contexto (aunque en la práctica se recomienda segmentar audios largos).
- Compatible con el pipeline `automatic-speech-recognition` de HuggingFace, lo que facilita su integración en aplicaciones existentes.
- Soporte para inferencia en GPU y CPU mediante la librería `transformers`.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de ASR.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede transcribir grabaciones de audio en múltiples idiomas, lo que permite generar actas automáticas o subtítulos en tiempo real. Su velocidad CTC lo hace adecuado para procesamiento en streaming.
- Subtitulado automático de vídeos: al soportar más de 1600 idiomas, puede generar subtítulos para contenido audiovisual en plataformas de streaming o redes sociales, reduciendo costes de subtitulado manual.
- Asistentes de voz multilingües: integrado en sistemas de asistencia por voz, permite convertir comandos hablados en texto para su posterior procesamiento por un modelo de lenguaje, funcionando en entornos con múltiples idiomas.
- Accesibilidad para personas con discapacidad auditiva: el modelo puede transcribir conversaciones o eventos en tiempo real, facilitando la inclusión en entornos educativos o laborales.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir llamadas telefónicas en varios idiomas para analizar sentimiento, detectar problemas recurrentes o mejorar la calidad del servicio.
- Archivado y búsqueda de contenido de audio: al transcribir podcasts, entrevistas o archivos históricos, se habilita la búsqueda por texto dentro de material sonoro, útil para periodistas e investigadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas como WER (Word Error Rate) o CER (Character Error Rate) en la model card ni en los resultados de búsqueda web. Se recomienda consultar la documentación oficial de Meta para obtener datos comparativos con otros sistemas ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.500 millones de parámetros en fp32, se necesitan aproximadamente 26 GB de VRAM. Con cuantización a int8 (por ejemplo, mediante `bitsandbytes`), la demanda se reduce a unos 13 GB, y con int4 a unos 7 GB.
- GPU recomendadas: para fp32 se requiere una GPU con al menos 32 GB (A100, V100 32GB, RTX A6000). Con cuantización int8, una RTX 4090 (24 GB) o A10G (24 GB) es suficiente. Con int4, cabría en GPUs de 8-12 GB como RTX 3080 o RTX 3060.
- El modelo puede ejecutarse en CPU, aunque la inferencia será lenta para audios largos; se recomienda GPU para uso en producción.
- Opciones de despliegue: compatible con `transformers` (pipeline de ASR), `vLLM` (aunque no está optimizado para modelos CTC), `llama.cpp` (requiere conversión a GGUF, no disponible por defecto) y `Ollama` (no soportado nativamente). La vía más directa es usar `transformers` con `Wav2Vec2ForCTC`.
- Latencia y throughput: no se han publicado datos oficiales. Como modelo CTC, la latencia es significativamente menor que la de modelos autoregresivos del mismo tamaño, pero depende del hardware y la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omniASR-CTC-7B-v2 (este) | 6.5B | no disponible | 1600+ | Apache-2.0 | HuggingFace |
| facebook/omniASR-CTC-7B (original) | 6.5B | no disponible | 1600+ | Apache-2.0 | HuggingFace |
| Steveeeeeeen/omniASR-CTC-7B | 6.5B | no disponible | 1600+ | Apache-2.0 | HuggingFace |
| Whisper large-v3 (OpenAI) | 1.5B | 30 segundos | 99 | MIT | HuggingFace |

La comparación con Whisper large-v3 es orientativa: omniASR-CTC-7B tiene más parámetros y cubre muchos más idiomas, pero Whisper ofrece un contexto de audio fijo de 30 segundos y está más optimizado para tareas de subtitulado. No se dispone de datos de rendimiento comparativo (WER) entre ambos.

## Limitaciones y advertencias

- Al ser un modelo CTC, no incorpora un modelo de lenguaje externo, por lo que puede presentar errores en palabras poco frecuentes o en contextos con ruido de fondo.
- La cobertura de 1600+ idiomas no implica la misma precisión en todos ellos; los idiomas con menos datos de entrenamiento probablemente tengan tasas de error más altas.
- No se han publicado evaluaciones de sesgos o comportamientos adversos específicos para este modelo. Como ocurre con otros sistemas ASR, puede haber sesgos en la transcripción de acentos, dialectos o habla no nativa.
- El modelo no está diseñado para tareas de comprensión del lenguaje, solo para transcripción. No soporta tool calling, agentes ni razonamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del checkpoint original de Meta para asegurar el cumplimiento.
- El tamaño del repositorio (26 GB) implica requisitos de almacenamiento y descarga considerables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iljab/omniASR-CTC-7B-v2
- Checkpoint original de Meta: https://dl.fbaipublicfiles.com/mms/omniASR-CTC-7B-v2.pt
- Tokenizer original: https://dl.fbaipublicfiles.com/mms/omniASR_tokenizer_written_v2.model
- Modelo original de Meta en HuggingFace: https://huggingface.co/facebook/omniASR-CTC-7B
- Repositorio GitHub de Omnilingual ASR: https://github.com/facebookresearch/omnilingual-asr
- Documentación de modelos CTC en DeepWiki: https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
- Documentación de modelos LLM en DeepWiki: https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.3-llm-models-(language-conditioned-asr)
