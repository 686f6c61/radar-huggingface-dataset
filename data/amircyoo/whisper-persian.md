# Amircyoo/whisper-persian

## Resumen

Whisper Persian es un ajuste fino del modelo openai/whisper-base de OpenAI, especializado en reconocimiento automático del habla (ASR) para persa/farsi. Lo desarrolla Amircyoo (la model card atribuye el trabajo a Yasin Keykh) y se distribuye con licencia Apache 2.0. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 72,59 millones de parámetros totales, y se ha adaptado mediante LoRA (Low-Rank Adaptation) sobre el checkpoint base, lo que reduce el coste de entrenamiento y mantiene la estructura original del modelo.

El problema que resuelve es concreto: Whisper-base original ofrece un rendimiento limitado en persa, un idioma con relativamente pocos recursos en comparación con inglés o las principales lenguas europeas. Este ajuste busca mejorar la transcripción de audio en farsi para aplicaciones de dictado, subtitulado y asistentes de voz. El modelo se entrenó sobre el conjunto Common Voice 13.0 de Mozilla para el idioma fa.

Es relevante ahora por su tamaño reducido (0,3 GB en el repositorio), que permite desplegarlo en CPU y en GPUs de consumo, y por su integración directa con la librería transformers mediante `AutoModelForSpeechSeq2Seq`. No obstante, se trata de un modelo con muy poca tracción pública (24 descargas, 0 likes en el momento de la consulta) y sin resultados de benchmarks declarados, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 72.593.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | Persa (farsi, `fa`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper-base: un transformer encoder-decoder con mecanismo de atención estándar, diseñado para procesar espectrogramas mel de audio de 30 segundos y generar texto de forma autorregresiva. Whisper-base cuenta con 72,59 millones de parámetros y fue entrenado originalmente por OpenAI con 680.000 horas de audio débilmente supervisado en múltiples idiomas, aunque la model card no detalla esa cifra para este ajuste.

El ajuste fino se realizó mediante LoRA sobre el checkpoint `openai/whisper-base`, usando el framework PEFT. El dataset de entrenamiento declarado es `mozilla-foundation/common_voice_13_0` para el idioma persa. La model card no especifica el número de tokens de audio, la composición exacta del dataset, hiperparámetros de entrenamiento (rango de LoRA, alpha, learning rate, épocas) ni si se aplicaron técnicas adicionales como RLHF o decodificación especulativa. Tampoco se documenta si los adaptadores LoRA se fusionaron con los pesos base en el checkpoint publicado; el tamaño del repositorio (0,3 GB) y los 72,59 millones de parámetros en safetensors sugieren pesos completos o fusionados.

## Capacidades

- Reconocimiento automático del habla en persa (farsi) a partir de audio de 16 kHz.
- Transcripción de archivos de audio y de audio capturado en tiempo real desde micrófono (el autor incluye ejemplos con `sounddevice`).
- Procesamiento por lotes de múltiples archivos de audio mediante scripts de Python.
- Integración nativa con `transformers` (`AutoProcessor`, `AutoModelForSpeechSeq2Seq`).
- Uso en CPU y GPU sin requisitos de memoria elevados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo ASR puro.
- Capacidad multilingüe limitada: está optimizado exclusivamente para persa.
- No incluye visión, audio de entrada más allá de la transcripción, ni modo de razonamiento explícito.

## Casos de uso

- **Subtitulado de vídeo en persa**: el modelo transcribe pistas de audio de 30 segundos o menos por segmento, adecuado para generar subtítulos automáticos en plataformas de contenido persa. Su tamaño reducido permite procesar lotes grandes en CPU.
- **Dictado por voz en persa**: integrado con captura de micrófono (`sounddevice`) y procesamiento en tiempo real, sirve para aplicaciones de escritura por voz o editores de texto que necesiten entrada por dictado en farsi.
- **Transcripción de pódcast y reuniones**: el autor lo orienta explícitamente a servicios de transcripción de pódcast persas; con procesamiento por lotes se pueden transcribir episodios completos dividiéndolos en fragmentos de 30 segundos.
- **Asistentes de voz para persa**: como componente ASR en un pipeline de asistente conversacional (el NLU y la generación de respuesta irían en otro modelo), el modelo convierte la entrada de voz en texto para su posterior procesamiento.
- **Herramientas de accesibilidad**: generación de transcripciones para usuarios con discapacidad auditiva en contenido en farsi, aprovechando que el modelo cabe en CPU y no requiere infraestructura GPU dedicada.
- **Herramientas educativas de aprendizaje de persa**: transcripción de audio de estudiantes para comparar con texto de referencia, o generación de material de lectura a partir de grabaciones.
- **Investigación en ASR de bajos recursos**: al ser un ajuste LoRA documentado sobre Whisper-base con Common Voice 13.0, sirve como punto de partida reproducible para experimentos con otros idiomas o variantes dialectales.

## Benchmarks y rendimiento

El model-index del autor declara la entrada `whisper-persian` con una lista de resultados vacía (`results: []`). La model card menciona las métricas WER y CER en los metadatos, pero no publica valores numéricos.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 72,59 millones de parámetros, los pesos en fp32 ocupan aproximadamente 290 MB; en fp16, unos 145 MB. La VRAM adicional para activaciones y buffers de atención es reducida, del orden de cientos de MB para lotes pequeños.
- **GPU recomendadas**: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Para producción con lotes grandes, una T4, L4 o A10 resulta adecuada; A100/H100 no son necesarias.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo moderna e incluso en GPUs integradas con suficiente memoria compartida.
- **CPU**: el modelo es viable en CPU para transcripción de archivos, como demuestran los ejemplos del autor (`.to("cpu")`); la latencia será mayor que en GPU pero aceptable para procesamiento por lotes no interactivo.
- **Opciones de despliegue**: `transformers` con PyTorch es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; llama.cpp no soporta Whisper de forma nativa en su flujo estándar, y vLLM tiene soporte experimental para Whisper que el autor no menciona.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amircyoo/whisper-persian | 72,59 M | 30 s (Whisper) | Persa | Apache 2.0 | HuggingFace, 24 descargas |
| openai/whisper-base | 74 M | 30 s | Multilingüe (99 idiomas) | Apache 2.0 | HuggingFace, ampliamente usado |
| openai/whisper-small | 244 M | 30 s | Multilingüe (99 idiomas) | Apache 2.0 | HuggingFace, ampliamente usado |
| openai/whisper-large-v3 | 1.550 M | 30 s | Multilingüe (99 idiomas) | Apache 2.0 | HuggingFace, referencia ASR |

El modelo se posiciona como un ajuste especializado de whisper-base para persa. Frente a whisper-base original, la ventaja esperada es una mejor precisión en farsi, aunque no hay métricas publicadas que lo confirmen. Frente a whisper-small o whisper-large-v3, este modelo ofrece menor coste computacional pero también menor capacidad; whisper-large-v3, con 1.550 millones de parámetros, es la referencia actual en ASR multilingüe y probablemente supere en precisión a un ajuste de whisper-base, aunque a un coste de inferencia mucho mayor. No se dispone de datos de rendimiento comparativo para confirmar ninguna de estas afirmaciones.

## Limitaciones y advertencias

- **Sin benchmarks publicados**: el autor no declara valores de WER ni CER, por lo que no hay evidencia cuantitativa de la mejora frente a whisper-base original.
- **Riesgo de alucinación**: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en silencios, ruido o segmentos musicales.
- **Solo persa**: el modelo está optimizado para farsi y puede degradarse notablemente en otros idiomas o en variantes dialectales alejadas de los datos de Common Voice.
- **Sensibilidad al ruido**: la model card advierte que no es adecuado para entornos ruidosos sin preprocesamiento de audio.
- **Dataset limitado**: Common Voice es un corpus de audio leído y voluntario, lo que puede introducir sesgos de dominio (vocabulario, acentos, calidad de grabación) y limitar la generalización a habla espontánea.
- **Trazabilidad confusa**: la model card cita el identificador `Paulwalker4884/whisper-persian` en los ejemplos de código, mientras que el repositorio es `Amircyoo/whisper-persian`; conviene verificar que el checkpoint cargado es el correcto.
- **Licencia Apache 2.0**: permite uso comercial, pero al derivar de whisper-base conviene revisar las condiciones de OpenAI para el modelo original (también Apache 2.0) y citar la procedencia.
- **Poca tracción**: 24 descargas y 0 likes indican escasa validación por parte de la comunidad; no se han documentado pruebas independientes.
- **Sin soporte de cuantización documentado**: el autor no publica versiones GGUF ni instrucciones para cuantización, lo que limita el despliegue en entornos con herramientas que dependen de esos formatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Amircyoo/whisper-persian
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset Common Voice 13.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_13_0
- Framework PEFT: https://huggingface.co/docs/peft
- Documentación de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
