# BuilderHelm/Indic-Transcribe-Flex-CoreML

## Resumen

Indic-Transcribe Flex Core ML es la conversión a Core ML del modelo de reconocimiento automático del habla (ASR) Indic-Transcribe Flex, desarrollado originalmente por Bodhan AI en colaboración con AI4Bharat. La versión publicada por BuilderHelm empaqueta el checkpoint original en tres paquetes Core ML (frontend en FP32, encoder y decoder en FP16) para permitir transcripción completamente offline en Apple Silicon, sin dependencia de servicios en la nube. El repositorio ocupa 2,4 GB e incluye el tokenizer original, el manifiesto de checksums y la licencia.

El modelo cubre 27 idiomas, con foco en lenguas indias (asamés, bengalí, bhili, bhojpuri, bodo, chhattisgarhi, dogri, gujarati, haryanvi, hindi, canarés, cachemir, konkani, maithili, malayo, manipuri, maratí, nepalí, odia, punyabí, sánscrito, santalí, sindhi, tamil, telugu y urdu) además de inglés indio. Soporta explícitamente la transcripción de hinglish en alfabeto latino, un caso de uso poco cubierto por los modelos ASR multilingües convencionales.

La relevancia de esta ficha radica en que es una de las pocas alternativas de ASR índico que se ejecuta en local sobre hardware de consumo Apple, con un runtime Swift específico (BuilderHelmAudio) y una licencia propia (Indic Open Model License) que conviene revisar antes de un uso comercial. No se han publicado datos de WER a nivel de corpus; las únicas métricas disponibles son comprobaciones de coincidencia exacta sobre un conjunto de 33 fixtures.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer para ASR (arquitectura del checkpoint base Indic-Transcribe Flex; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 30 segundos de audio a 16 kHz por peticion (limite de la ventana de entrada) |
| Tipos de cuantizacion | FP16 (encoder y decoder), FP32 (frontend de extraccion de caracteristicas) |
| Idiomas soportados | 27: as, bgc, bhb, bho, bn, brx, doi, en, gu, hi, hne, kn, kok, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | Indic Open Model License (categoria "other" en Hugging Face) |
| Formato de pesos | Core ML `.mlpackage` (frontend.mlpackage, encoder.mlpackage, decoder_cached.mlpackage) + tokenizer.json |
| Tamano del repositorio | 2,4 GB |
| Entrada de audio | Mono, 16 kHz |
| Runtime | BuilderHelmAudio (Swift), macOS 15 o superior, Apple Silicon |
| Modelo base | bodhan-ai/indic-transcribe-flex |

## Arquitectura y entrenamiento

La información disponible describe únicamente el proceso de conversión, no el entrenamiento original. El modelo base Indic-Transcribe Flex es un sistema ASR encoder-decoder de Bodhan AI / AI4Bharat; la exportación a Core ML separa el pipeline en tres etapas: un frontend que extrae características de audio mono a 16 kHz, un encoder acústico en FP16 y un decoder también en FP16 que mantiene una caché de atención con estado (`decoder_cached.mlpackage`) para reutilizar el estado entre pasos de generación de tokens. Esta caché es la innovación técnica destacable de la exportación, ya que evita recalcular la atención completa en cada token decodificado.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base usó RLHF, DPO u otras técnicas de alineación. Tampoco se detalla si emplea decodificación especulativa, atención lineal u otras optimizaciones. El tokenizer original se conserva y expone tokens de idioma y prompts de modo de salida (nativo frente a romanizado), lo que permite seleccionar el script de salida sin cambiar de modelo.

## Capacidades

- Transcripción de voz a texto en 27 idiomas, con foco en lenguas indias y inglés indio.
- Salida en script nativo del idioma seleccionado (por ejemplo, devanagari para hindi).
- Modo romanizado para hinglish: entrada en hindi con salida en alfabeto latino.
- Detección automática de idioma cuando se omite el código de idioma.
- Modo de salida mixto expuesto por el SDK.
- Transcripción de archivos de audio y dictado en tiempo real (vía ZenVoice/BuilderHelmAudio).
- Ejecución completamente offline en Apple Silicon, sin llamadas a red.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo ASR puro.
- Sin capacidades de visión, audio generativo ni texto generativo más allá de la transcripción.

## Casos de uso

- Dictado offline en macOS: integración mediante BuilderHelmAudio para transcribir voz a texto en aplicaciones de escritorio sin enviar audio a servidores externos, adecuado para entornos con requisitos de privacidad o conectividad limitada.
- Transcripción de reuniones y notas de voz en hindi e inglés indio: el modelo alterna entre ambos idiomas y permite elegir script nativo o romanizado según el destino del texto.
- Subtitulado de contenido audiovisual índico: procesamiento por fragmentos de hasta 30 segundos, encadenando segmentos para cubrir piezas más largas.
- Atención al cliente en centros de contacto multilingües de la India: transcripción local de llamadas para analítica y cumplimiento, sin exponer datos personales a terceros.
- Investigación lingüística y sociolingüística: transcripción de corpus en lenguas de bajos recursos como bhili, haryanvi, santalí o bodo, que requieren selección explícita de idioma.
- Aplicaciones de accesibilidad: entrada por voz para usuarios de lenguas indias en dispositivos Apple, con funcionamiento sin conexión.
- Digitalización de archivos orales: conversión de grabaciones históricas o de campo a texto editable en el idioma original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, etc.) en la información disponible. Las únicas métricas son comprobaciones de coincidencia exacta sobre fixtures:

| Comparacion | Coincidencias exactas |
|---|---:|
| Core ML frente a referencia nativa de Bodhan | 26 / 27 |
| Core ML frente a referencia romanizada de hinglish de Bodhan | 3 / 3 |
| ZenVoice en macOS 27 (encoder en CPU) frente a referencia Core ML previa | 28 / 33 |

La diferencia en la primera comparación corresponde a una vocal en sindhi. En la tercera, las cinco discrepancias se reparten entre haryanvi, bhili, bodo y dos filas de la misma vocal sindhi. El autor indica explícitamente que no hay una tasa de error de palabras (WER) a nivel de corpus.

## Requisitos de hardware

- Espacio en disco: 2,4 GB para los tres paquetes Core ML y el tokenizer.
- Memoria: no se publica una cifra de VRAM o RAM unificada; el modelo está pensado para memoria unificada de Apple Silicon.
- Hardware soportado: Apple Silicon (M1 o posterior, según el requisito de macOS 15). No hay soporte para GPU NVIDIA, AMD ni CPU x86 documentado.
- Encoder en CPU: en macOS 27, BuilderHelmAudio ejecuta el encoder en CPU para evitar una aserción de GPU de Core ML; esto condiciona la latencia.
- Despliegue: runtime Swift BuilderHelmAudio, invocado desde la app ZenVoice o desde código propio. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al ser un formato Core ML.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Ejecucion local |
|---|---|---|---|---|---|
| Indic-Transcribe Flex Core ML (este) | no disponible | 30 s por peticion | 27 (índico + inglés indio) | Indic Open Model License | Apple Silicon (Core ML) |
| Whisper large-v3 | 1.550 M | 30 s por peticion | ~99 | MIT | Si (GGUF, Core ML, ONNX) |
| Indic-Transcribe Flex (original) | no disponible | no disponible | 27 | Indic Open Model License | Si (formato original) |
| AI4Bharat IndicWhisper | no disponible | no disponible | índico | no disponible | Si |

No se dispone de datos de rendimiento comparativo (WER) entre estos modelos en la información proporcionada; la comparación se limita a parámetros, cobertura idiomática y disponibilidad.

## Limitaciones y advertencias

- Ventana de audio de 30 segundos por petición; los audios más largos deben segmentarse.
- No hay WER a nivel de corpus publicado; las métricas disponibles son coincidencias exactas sobre 33 fixtures, insuficientes para estimar calidad en producción.
- El encoder se ejecuta en CPU en macOS 27 por una aserción de GPU de Core ML, lo que puede aumentar la latencia frente a una ejecución íntegra en GPU.
- Bhili y haryanvi requieren selección explícita de idioma; la detección automática no los cubre.
- Riesgo de alucinación y de errores de segmentación inherentes a los modelos ASR encoder-decoder; no se documentan sesgos específicos.
- La licencia Indic Open Model License es distinta de las licencias permisivas habituales (MIT, Apache 2.0); es necesario revisar `LICENSE.md` antes de un uso comercial.
- Dependencia de macOS 15 o superior y Apple Silicon; no hay soporte para otros sistemas operativos ni aceleradores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Indic-Transcribe-Flex-CoreML
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Perfil del autor: https://huggingface.co/BuilderHelm
- Runtime Swift BuilderHelmAudio: https://github.com/BuilderHelm/BuilderHelmAudio
- Pull request del runtime: https://github.com/BuilderHelm/BuilderHelmAudio/pull/9
- ZenVoice (producto): https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Licencia: https://huggingface.co/BuilderHelm/Indic-Transcribe-Flex-CoreML/blob/main/LICENSE.md
