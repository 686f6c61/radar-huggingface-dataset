# Hebrish/Sabich-asr4all-S

## Resumen

Sabich-asr4all-S es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario Hebrish, obtenido mediante fine-tuning del modelo base futo-org/asr4all-s. Está especializado en transcripción de dictado con soporte para inglés y hebreo, incluyendo code-switching entre ambos idiomas, vocabulario técnico y adaptación al hablante. Con aproximadamente 28,2 millones de parámetros, es un modelo compacto orientado a inferencia en dispositivo (on-device) y streaming, lo que lo hace adecuado para aplicaciones de baja latencia y despliegue en hardware modesto.

El modelo emplea una arquitectura CTC (Connectionist Temporal Classification) con salida de feature-extraction, lo que permite decodificación no autorregresiva y streaming. Está publicado en formato safetensors y ONNX, con soporte para transformers y código personalizado. Su licencia es la FUTO Model Weights Ethical Use 1.0, con acceso restringido que requiere aceptar condiciones en Hugging Face.

Su relevancia actual radica en la combinación de tamaño reducido, soporte multilingüe (inglés-hebreo) con code-switching y capacidad de streaming, lo que lo posiciona para aplicaciones de dictado en tiempo real y asistentes de voz en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification), transformer para ASR |
| Parámetros totales | 28.169.985 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, he (inglés y hebreo), con code-switching |
| Licencia | futo-model-weights-ethical-use-1.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura CTC para reconocimiento automático del habla, derivada del modelo base futo-org/asr4all-s mediante fine-tuning. La salida CTC permite decodificación no autorregresiva, lo que facilita la inferencia en streaming y reduce la latencia en comparación con modelos seq2seq. El modelo incorpora mecanismos de adaptación al hablante (speaker-adaptation) y está optimizado para vocabulario técnico y code-switching inglés-hebreo.

Los datos de entrenamiento incluyen los datasets danielrosehill/Read-Aloud-Voice-Sentences y openslr/librispeech_asr, según las etiquetas del repositorio. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo está diseñado para inferencia en dispositivo (on-device) y soporte de streaming, lo que sugiere una optimización para eficiencia computacional.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y hebreo.
- Soporte de code-switching entre inglés y hebreo en una misma emisión.
- Reconocimiento de vocabulario técnico especializado.
- Adaptación al hablante (speaker-adaptation) para mejorar la precisión en voces concretas.
- Inferencia en streaming para transcripción en tiempo real.
- Inferencia en dispositivo (on-device) con requisitos de recursos reducidos.
- Extracción de características (feature-extraction) mediante salida CTC.
- Soporte de dictado (dictation) para inglés e irlandés-inglés (irish-english).
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente multi-step.

## Casos de uso

- Dictado en tiempo real en inglés y hebreo: el modelo puede transcribir voz a texto en streaming gracias a su arquitectura CTC no autorregresiva, adecuado para aplicaciones de escritura por voz en entornos de oficina o movilidad.
- Asistentes de voz en dispositivo: con 28,2 millones de parámetros, puede desplegarse en hardware de consumo (móviles, Raspberry Pi, portátiles) para transcripción local sin conexión a la nube, preservando la privacidad.
- Transcripción de reuniones bilingües inglés-hebreo: el soporte de code-switching permite manejar conversaciones donde los hablantes alternan entre ambos idiomas, habitual en entornos técnicos y académicos.
- Subtitulado automático de contenido audiovisual: la capacidad de streaming y baja latencia permite generar subtítulos en directo para vídeos o retransmisiones en inglés y hebreo.
- Documentación clínica o legal por dictado: el reconocimiento de vocabulario técnico y la adaptación al hablante facilitan la transcripción de terminología especializada en informes dictados.
- Aplicaciones de accesibilidad: transcripción de voz a texto para personas con discapacidad motriz o auditiva, con despliegue local en dispositivos de bajo coste.
- Integración en pipelines de transcripción por lotes: el formato ONNX permite exportar e integrar el modelo en entornos de producción con ONNX Runtime para procesamiento por lotes de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (28,2 M de parámetros, ~113 MB en fp32; ~57 MB en fp16). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Para streaming de baja latencia, se recomienda cualquier GPU moderna (RTX 3060 o superior) o incluso iGPU.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: transformers (con custom_code), ONNX Runtime (formato ONNX incluido), potencialmente llama.cpp no aplica (no es un modelo de lenguaje). Para ASR en producción, se puede usar ONNX Runtime o un servidor de inferencia compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El tamaño reducido y la decodificación CTC sugieren latencia baja en streaming, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sabich-asr4all-S | 28,2 M | no disponible | en, he | futo-model-weights-ethical-use-1.0 | safetensors, ONNX |
| Whisper tiny | 39 M | 30 s de audio | multilingüe (99 idiomas) | MIT | safetensors, etc. |
| Wav2Vec2 base | 95 M | no disponible | multilingüe (fine-tuning) | MIT/Apache 2.0 | safetensors, etc. |
| Vosk small models | ~40 M | no disponible | varios | Apache 2.0 | varios |

La comparativa se basa en datos públicos de los modelos alternativos; no se dispone de benchmarks del modelo Sabich-asr4all-S para comparar rendimiento. La principal diferencia es su especialización en inglés-hebreo con code-switching y su licencia restrictiva (FUTO Ethical Use) frente a licencias permisivas como MIT o Apache 2.0.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datasets como LibriSpeech y Read-Aloud-Voice-Sentences, puede heredar sesgos de acento y dominio de esos corpus.
- Riesgo de alucinación: en ASR, el riesgo se manifiesta como transcripciones incorrectas o palabras inventadas en audio ruidoso o con acentos no representados; no se han publicado tasas de error (WER) para evaluar este riesgo.
- Limitaciones de contexto o idioma: solo soporta inglés y hebreo; no se ha documentado soporte para otros idiomas. La longitud de contexto de audio no está especificada.
- Restricciones de licencia: la licencia FUTO Model Weights Ethical Use 1.0 impone restricciones de uso ético; es necesario revisar los términos completos antes de uso comercial. El acceso al modelo es restringido (gated) y requiere aceptar condiciones en Hugging Face.
- Caveats para producción: el modelo tiene solo 13 descargas y 0 likes, lo que indica poca validación comunitaria. No se han publicado benchmarks ni métricas de rendimiento, por lo que se recomienda evaluar con datos propios antes de desplegar en producción. El uso de custom_code en transformers puede requerir confianza en el código del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Hebrish/Sabich-asr4all-S
- Modelo base: https://huggingface.co/futo-org/asr4all-s
- Dataset Read-Aloud-Voice-Sentences: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- DOI: https://doi.org/10.57967/hf/11177
