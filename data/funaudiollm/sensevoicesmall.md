# FunAudioLLM/SenseVoiceSmall

## Resumen

SenseVoiceSmall es un modelo de comprensión de voz desarrollado por FunAudioLLM, integrado en el ecosistema FunASR. Combina cuatro capacidades en un único modelo: reconocimiento automático del habla (ASR), identificación de idioma hablado (LID), reconocimiento de emociones (SER) y detección de eventos de audio (AED). Está entrenado con más de 400.000 horas de datos y soporta más de 50 idiomas, aunque la versión publicada se centra en mandarín, cantonés, inglés, japonés y coreano.

Su principal ventaja es la arquitectura no autorregresiva, que permite procesar 10 segundos de audio en aproximadamente 70 ms, unas 15 veces más rápido que Whisper-Large. Esto lo hace especialmente adecuado para aplicaciones en tiempo real y despliegue en dispositivos con recursos limitados, incluyendo CPU mediante versiones GGUF. Su relevancia actual radica en ser una alternativa eficiente a Whisper que añade análisis de emociones y eventos, con un tamaño de repositorio de 0,9 GB que sugiere un modelo compacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-only no autorregresivo (end-to-end) |
| Parametros totales | no disponible (repo de 0,9 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (SenseVoiceSmall-GGUF) |
| Idiomas soportados | Mandarín (zh), cantonés (yue), inglés (en), japonés (ja), coreano (ko); entrenado con más de 50 idiomas |
| Licencia | model-license (ver enlace en FunASR MODEL_LICENSE) |
| Formato de pesos | safetensors (repo HF), GGUF (variante) |

## Arquitectura y entrenamiento

SenseVoiceSmall emplea una arquitectura encoder-only no autorregresiva, lo que elimina la dependencia de decodificación secuencial y reduce drásticamente la latencia de inferencia. El modelo se entrenó con más de 400.000 horas de datos de voz multilingüe, abarcando más de 50 idiomas, aunque el lanzamiento público está optimizado para cinco lenguas principales. Además de la pérdida de ASR, incorpora tareas auxiliares de reconocimiento de emociones y detección de eventos de audio, lo que le permite generar transcripciones enriquecidas con etiquetas de sentimiento y eventos acústicos. No se especifican técnicas de alineación como RLHF o DPO; al tratarse de un modelo de voz, el entrenamiento se basa en aprendizaje supervisado convencional.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe para mandarín, cantonés, inglés, japonés y coreano.
- Identificación de idioma hablado (LID) integrada.
- Reconocimiento de emociones en el habla (SER), con resultados que según el autor igualan o superan a los mejores modelos específicos de SER en datos de prueba.
- Detección de eventos de audio (AED): música de fondo, aplausos, risas, llantos, tos y estornudos, entre otros.
- Transcripción enriquecida que combina texto, etiquetas emocionales y eventos en una sola salida.
- Inferencia no autorregresiva: 70 ms para procesar 10 segundos de audio, 15 veces más rápida que Whisper-Large.
- Ejecución en CPU y dispositivos edge mediante la versión GGUF con VAD integrado (llama.cpp).
- Exportación a ONNX y libtorch para despliegue en múltiples runtimes.

## Casos de uso

- Transcripción de reuniones en tiempo real: su baja latencia permite transcribir conversaciones multilingües en directo, añadiendo detección de emociones y eventos como risas o aplausos para un acta más rica.
- Análisis de llamadas de atención al cliente: extrae el texto, el estado emocional del interlocutor y eventos como tos o ruido de fondo, útil para evaluar la calidad del servicio y detectar frustración.
- Subtitulación automática de vídeos: genera subtítulos en varios idiomas con marcas de emociones y eventos, mejorando la accesibilidad y el contexto para personas con discapacidad auditiva.
- Asistentes de voz en dispositivos edge: la versión GGUF permite ejecutar el modelo en CPU sin GPU, integrándolo en altavoces o dispositivos IoT para comandos de voz con detección de emociones.
- Moderación de contenido audiovisual: detecta eventos como risas, llantos o música de fondo en podcasts, streams o vídeos, facilitando la clasificación automática del contenido.
- Análisis de sentimiento en entrevistas o focus groups: combina ASR y SER para correlacionar el contenido hablado con el tono emocional, útil en investigación de mercado y estudios sociológicos.
- Sistemas de alerta en videovigilancia: identifica llantos, gritos o tos en audio ambiente, generando alertas automáticas en entornos de cuidado o seguridad.

## Benchmarks y rendimiento

La model card indica que SenseVoiceSmall se comparó con Whisper en conjuntos de datos abiertos como AISHELL-1, AISHELL-2, Wenetspeech, LibriSpeech y Common Voice, mostrando ventajas en chino y cantonés. Sin embargo, los valores numéricos se presentan en imágenes dentro de la model card y no se han extraído en la información disponible. No se dispone de cifras concretas de WER o accuracy en el texto proporcionado. El único dato de rendimiento cuantificado es la latencia: 70 ms por 10 segundos de audio, lo que supone una mejora de 15 veces frente a Whisper-Large.

## Requisitos de hardware

- Al ser un modelo compacto (repo de 0,9 GB), es probable que pueda ejecutarse en GPUs de consumo como RTX 3060 o superiores, aunque no se especifican requisitos exactos de VRAM.
- La versión GGUF permite ejecución en CPU mediante llama.cpp, lo que lo hace apto para entornos sin GPU.
- Se puede desplegar con FunASR, que ofrece soporte para múltiples clientes (Python, C++, HTML, Java, C#) y servicio concurrente.
- Existen exportaciones a ONNX y libtorch para despliegue en otros runtimes.
- No se proporcionan datos de throughput o latencia más allá de la cifra de 70 ms por 10 segundos de audio.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Velocidad | Licencia |
|---|---|---|---|---|---|
| SenseVoiceSmall | Encoder-only no autorregresivo | no disponible (~0,9 GB repo) | zh, yue, en, ja, ko | 70 ms/10 s (15x más rápido que Whisper-Large) | model-license (FunASR) |
| Whisper-large-v3 | Encoder-decoder autorregresivo | 1550 M (dato público) | 99 idiomas | ~1 s/10 s (estimado) | MIT (código), modelo con licencia abierta |

Los datos de Whisper-large-v3 son de conocimiento público general, no extraídos de la información proporcionada. No se dispone de otros modelos comparables con datos verificados en la documentación consultada.

## Limitaciones y advertencias

- La licencia es "model-license" (otra), no una licencia abierta estándar como MIT o Apache; es necesario revisar los términos específicos en el enlace de FunASR antes de uso comercial.
- El modelo está optimizado para cinco idiomas principales; aunque se entrenó con más de 50, el rendimiento fuera de esos cinco puede ser inferior.
- No se especifican sesgos conocidos, pero como modelo de ASR puede cometer errores con habla no nativa, acentos fuertes o entornos con ruido extremo.
- La detección de emociones y eventos es una tarea subjetiva y puede fallar en contextos ambiguos o con audio de baja calidad.
- Para producción, se recomienda validar el rendimiento en el dominio específico y considerar el uso de VAD y modelos de puntuación adicionales, disponibles en el ecosistema FunASR.

## Enlaces

- HuggingFace: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Repo GitHub SenseVoice: https://github.com/FunAudioLLM/SenseVoice (también https://github.com/QwenAudio/SenseVoice)
- FunASR: https://github.com/modelscope/FunASR
- Modelo en ModelScope: https://www.modelscope.cn/models/iic/SenseVoiceSmall
- Demo en HuggingFace Space: https://huggingface.co/spaces/FunAudioLLM/SenseVoice
- Demo en ModelScope: https://www.modelscope.cn/studios/iic/SenseVoice
- Variante GGUF: https://huggingface.co/FunAudioLLM/SenseVoiceSmall-GGUF
- Licencia: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Página del proyecto: https://fun-audio-llm.github.io/
