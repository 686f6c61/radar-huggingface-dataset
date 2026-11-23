# aoiandroid/whisper-he-large-v3-turbo-whisperkit-coreml-ios

## Resumen

Whisper large-v3-turbo Hebrew es una conversión a Core ML del modelo `ivrit-ai/whisper-large-v3-turbo`, un ajuste fino en hebreo del conocido `openai/whisper-large-v3-turbo`. Lo publica el usuario `aoiandroid` como espejo para la aplicación TranslateBlue, empaquetado en el formato que espera WhisperKit (la librería de inferencia on-device de Argmax para plataformas Apple). El resultado es un paquete de unos 592 MB que se ejecuta de forma nativa en iOS y macOS usando el framework Core ML, sin necesidad de servidores externos.

El modelo resuelve el reconocimiento automático de voz (ASR) en hebreo en dispositivos Apple, un nicho donde las opciones on-device de calidad eran escasas. Se basa en la arquitectura encoder-decoder de Whisper (transformer clásico, no MoE) con la variante "turbo" de OpenAI, que reduce el decoder a 4 capas frente a las 32 del large-v3 original. La conversión aplica cuantización por paletización de 6 bits por tensor mediante k-means, manteniendo los tensores pequeños en fp16.

Es relevante porque demuestra que un modelo de ASR de gama alta para un idioma minoritario puede desplegarse íntegramente en un iPhone o un Mac de 8 GB de RAM, con una pérdida de precisión nula según la evaluación del autor. La licencia Apache 2.0 del modelo fuente facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), convertido a Core ML |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo tiene 809 M, dato no confirmado en la ficha del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 448 tokens en el decoder (KV length 448); ventanas de audio de 30 s por defecto, evaluado con ventanas de 15 s |
| Tipos de cuantizacion | Paletizacion 6-bit por tensor (k-means post-entrenamiento); tensores de menos de 2048 elementos en fp16 |
| Idiomas soportados | Hebreo (he) |
| Licencia | Apache 2.0 (modelo fuente); modelo base OpenAI bajo MIT |
| Formato de pesos | Core ML (`.mlmodelc`): MelSpectrogram, AudioEncoder y TextDecoder, mas `config.json`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo es un Whisper large-v3-turbo, es decir, un transformer encoder-decoder con 32 capas en el encoder y solo 4 en el decoder (frente a las 32 del large-v3 estándar), lo que reduce considerablemente el coste de decodificación manteniendo la calidad del encoder. El frontend de audio usa 128 bins mel. La conversión a Core ML divide el encoder en dos submodelos (capas 0-15 y 16-31 más layer norm) para que quepa en un Mac de 8 GB durante el proceso, con los mismos nombres, formas y tipos de entrada/salida que un encoder monolítico. El decoder mantiene una longitud KV de 448.

No hubo entrenamiento adicional en esta conversión: solo conversión de formato y paletización de pesos. El ajuste fino en hebreo lo realizó ivrit.ai sobre `openai/whisper-large-v3-turbo`, aunque la ficha no detalla el volumen de datos ni la composición del corpus de entrenamiento de ese fine-tune. La paletización se aplicó con coremltools mediante k-means por tensor, y según la evaluación del autor no degradó la precisión (0,745 en PyTorch bf16 frente a 0,747 en Core ML paletizado sobre el mismo conjunto de clips).

## Capacidades

- Reconocimiento automático de voz (ASR) en hebreo, con decodificación greedy y token de idioma hebreo.
- Transcripción de audio con ventanas de 15 s en la configuración evaluada (soporta ventanas de 30 s por arquitectura).
- Funcionamiento totalmente offline en dispositivo, sin llamadas a servicios externos.
- Inferencia acelerada por Core ML con todos los compute units disponibles (CPU, GPU y Neural Engine).
- No incluye `TextDecoderContextPrefill`, componente opcional en WhisperKit que acelera el prefill de contexto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de transcripción.
- No soporta visión, audio generativo ni otras modalidades más allá de la transcripción de voz a texto.

## Casos de uso

- Transcripción de reuniones y notas de voz en apps iOS: el paquete Core ML se integra directamente en WhisperKit y permite transcribir grabaciones en hebreo sin enviar audio a la nube, algo crítico para datos confidenciales.
- Subtitulado automático de vídeo en hebreo: la ventana de 15 s evaluada encaja con la generación de subtítulos por segmentos, y la ejecución on-device permite procesar bibliotecas locales de vídeo en un Mac.
- Asistentes de voz para hablantes de hebreo: el modelo puede actuar como capa ASR en un pipeline de comandos por voz, con latencia baja al ejecutarse en el Neural Engine de un iPhone.
- Accesibilidad para personas sordas o con dificultad auditiva: transcripción en tiempo casi real de conversaciones presenciales en hebreo desde el propio dispositivo.
- Investigación lingüística y corpus en hebreo: transcripción masiva de grabaciones de campo con un modelo ajustado específicamente al idioma, sin coste de API.
- Aplicaciones de traducción (el caso de TranslateBlue): el modelo sirve como primer eslabón de un pipeline ASR→traducción, transcribiendo el hebreo localmente antes de traducir.
- Dictado en apps de productividad para macOS/iOS: integración en editores de texto que necesiten dictado en hebreo sin conexión.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre cinco clips de unos 60 s del conjunto FLEURS he_il `test`, con una métrica de cobertura de palabras de contenido ponderada por frecuencia (las variantes de prefijo ה/ו/ב/ל/ש cuentan como fallo si difieren de la referencia). Decodificación greedy con token de hebreo, ventanas de 15 s, audio a -26 dBFS.

| Clip | Este paquete (Core ML) | openai/whisper-large-v3-turbo (PyTorch bf16) |
|---|---|---|
| fleurs-0 | 0,767 | 0,750 |
| fleurs-1 | 0,835 | 0,652 |
| fleurs-2 | 0,900 | 0,909 |
| fleurs-3 | 0,579 | 0,430 |
| fleurs-4 | 0,652 | 0,554 |
| Media | **0,747** | 0,659 |

El modelo fuente en PyTorch bf16 obtuvo 0,745 sobre los mismos clips, por lo que la paletización no supuso pérdida de precisión. No se han publicado resultados de benchmarks estándar (WER sobre FLEURS completo, Common Voice u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: unos 592 MB de pesos; en la práctica el runtime de Core ML necesita algo más de memoria para buffers intermedios, pero cabe holgadamente en dispositivos con 2-3 GB de RAM libre.
- GPU recomendadas: no requiere GPU dedicada; usa el Neural Engine y la GPU integrada de los chips Apple (A-series y M-series).
- Cabe en GPU de consumo: sí, en cualquier iPhone o iPad moderno y en Macs con chip Apple Silicon, incluido un Mac de 8 GB (el autor convirtió el encoder por mitades precisamente para ese límite).
- Opciones de despliegue: WhisperKit (Argmax) sobre Core ML; las herramientas de conversión son `argmaxinc/whisperkittools` (commit 84f77a83). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles de forma numérica; la evaluación se realizó offline en un Mac con todos los compute units y ventanas de 15 s, sin cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este paquete (whisper-he-large-v3-turbo-whisperkit-coreml-ios) | no disponible (base 809 M) | 448 tokens KV, ventanas de 15-30 s | Hebreo | Apache 2.0 | Core ML |
| ivrit-ai/whisper-large-v3-turbo | no disponible (base 809 M) | 448 tokens KV | Hebreo | Apache 2.0 | PyTorch |
| openai/whisper-large-v3-turbo | 809 M | 448 tokens KV | Multilingüe (~99 idiomas) | MIT | PyTorch, safetensors |
| openai/whisper-large-v3 | 1.550 M | 448 tokens KV | Multilingüe (~99 idiomas) | MIT | PyTorch, safetensors |

La ventaja de este paquete frente a los modelos en PyTorch es el despliegue on-device en Apple sin conversión adicional; frente a whisper-large-v3-turbo de OpenAI, gana en precisión para hebreo (0,747 frente a 0,659 en la métrica del autor) a costa de perder el multilingüismo. No se dispone de comparaciones con otros modelos ASR específicos de hebreo en la información proporcionada.

## Limitaciones y advertencias

- Solo transcribe hebreo: no es multilingüe y no detecta ni traduce otros idiomas.
- La evaluación es muy limitada: cinco clips de FLEURS, una métrica no estándar y un único evaluador; no sustituye a un benchmark de WER sobre corpus amplios.
- Riesgo de error en palabras con prefijos (ה/ו/ב/ל/ש) y en nombres propios, según la propia definición de la métrica del autor.
- Alucinaciones típicas de Whisper en audio con ruido, silencios largos o música: puede generar texto plausible no presente en el audio.
- No incluye `TextDecoderContextPrefill`, lo que puede penalizar la latencia en decodificaciones largas frente a paquetes WhisperKit que sí lo incorporan.
- Licencia Apache 2.0 del modelo fuente, pero el espejo no está avalado por ivrit.ai ni por OpenAI; conviene citar a ivrit.ai al usarlo.
- Repositorio sin descargas ni likes en el momento de la ficha, mantenido por un usuario individual: no hay garantía de soporte ni de actualizaciones.
- La fecha de creación del repositorio (2026-11-23) y la de evaluación (2026-11-24) figuran así en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/aoiandroid/whisper-he-large-v3-turbo-whisperkit-coreml-ios
- Modelo fuente: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- ivrit.ai: https://www.ivrit.ai
- Herramientas de conversión WhisperKit: https://github.com/argmaxinc/whisperkittools
- WhisperKit (Argmax): no disponible en la información proporcionada
