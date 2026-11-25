# omnixima/bengaliai-whisper-medium-gguf

## Resumen

BengaliAI Whisper Medium (GGUF) es una conversión al formato GGUF del modelo `bengaliAI/tugstugi_bengaliai-asr_whisper-medium`, un fine-tune de Whisper-medium especializado en reconocimiento automático del habla (ASR) en bengalí. El modelo original proviene de la solución ganadora del concurso Kaggle Bengali.AI Speech Recognition, desarrollada por Erdene-Ochir Tuguldur (tugstugi) con el equipo Chimege. Esta conversión la publica el usuario omnixima y está pensada para ejecutarse con el runtime transcribe.cpp.

Se trata de un transformer encoder-decoder de tipo Whisper con 763.874.400 parámetros, adaptado mediante fine-tuning para transcribir audio en bengalí con un tokenizador BPE propio del idioma. El repositorio incluye dos cuantizaciones (Q8_0 y Q5_K_M) con un tamaño de 831 MB y 582 MB respectivamente, lo que permite desplegarlo en hardware modesto, incluidos equipos de consumo.

Su relevancia actual radica en que ofrece un ASR de calidad para bengalí (WER del 8,2 % en FLEURS bn_in con Q8_0) en un formato ligero y portable, y es el modelo de transcripción precisa que utiliza la aplicación Kothon. La licencia es Apache-2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-medium) |
| Parametros totales | 763.874.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | Q8_0, Q5_K_M; tambien existe F32 GGUF |
| Idiomas soportados | bengali (bn); metadatos con las 99 lenguas de Whisper para emitir el token `<|bn|>` |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es Whisper-medium de OpenAI, un transformer encoder-decoder con atención estándar diseñado para ASR multilingüe. Sobre esa base, el equipo de Bengali.AI realizó un fine-tuning específico para bengalí, sustituyendo el tokenizador por un BPE propio del idioma. El modelo resultante no dispone de tokens de timestamps, por lo que la salida es texto plano sin marcas temporales.

La conversión a GGUF se realizó con el script `scripts/convert-whisper.py` de transcribe.cpp. Dado que el repositorio original carece de `generation_config.json` y `preprocessor_config.json`, ambos se tomaron de `openai/whisper-medium`, vaciando la lista `suppress_tokens` porque la lista original apunta al vocabulario de Whisper y no al tokenizador bengalí. Posteriormente se aplicó `transcribe-quantize` para generar las versiones Q8_0 y Q5_K_M. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Transcripción de audio en bengalí (ASR) con calidad medida en FLEURS bn_in.
- Salida de texto sin puntuación; la puntuación debe añadirse con un modelo externo (por ejemplo, `omnixima/bangla-punctuation-muril6`).
- Sin soporte de timestamps (el fine-tune no incluye tokens temporales).
- Ejecución en CPU y GPU mediante transcribe.cpp, con aceleración Metal en Apple Silicon.
- Cuantizaciones ligeras que permiten inferencia en hardware de consumo.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.
- Capacidad multilingüe limitada: solo transcribe bien en bengalí.

## Casos de uso

- Transcripción de reuniones y entrevistas en bengalí: el modelo convierte audio a texto con un WER del 8,2 % (Q8_0), adecuado para actas y resúmenes posteriores, añadiendo puntuación con un modelo auxiliar.
- Subtitulado de vídeo en bengalí: aunque no genera timestamps, puede transcribir el audio completo y alinearse posteriormente con herramientas externas de segmentación.
- Atención al cliente en bengalí: integración en pipelines de voz a texto para transcribir llamadas y alimentar sistemas de análisis o búsqueda.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de archivos de audio en bengalí con throughput de ~20x tiempo real en Apple M2 Max (Q8_0).
- Aplicaciones móviles o de escritorio: el tamaño de 582-831 MB permite empaquetar el modelo en aplicaciones locales, como hace Kothon, sin depender de la nube.
- Investigación lingüística y datasets: generación de transcripciones para corpus de bengalí con licencia Apache-2.0, apta para uso académico y comercial.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en entornos de habla bengalí.

## Benchmarks y rendimiento

Medido sobre 200 clips de test de FLEURS bn_in en un Apple M2 Max con Metal, eliminando la puntuación antes de puntuar:

| Build | WER | CER | Velocidad |
|---|---|---|---|
| Q8_0 | 8,2 % | 4,9 % | ~20x tiempo real |
| Q5_K_M | 8,3 % | 5,1 % | ~14x tiempo real |
| F32 GGUF | 8,1 % | 4,9 % | ~10x tiempo real |
| Original vía MLX | 7,8 % | 4,6 % | ~19x tiempo real |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para Q8_0 (831 MB) y Q5_K_M (582 MB); el modelo cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona bien en Apple Silicon con Metal (medido en M2 Max).
- Cabe en GPU de consumo: sí, en prácticamente todas (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: transcribe.cpp (runtime de referencia, con `transcribe-cli`); no se documentan otros runtimes en la información disponible.
- Latencia y throughput: ~20x tiempo real con Q8_0 y ~14x con Q5_K_M en Apple M2 Max con Metal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| BengaliAI Whisper Medium (GGUF) | 763,9 M | 30 s | bengalí | Apache-2.0 | GGUF |
| openai/whisper-medium | 769 M | 30 s | 99 lenguas | MIT | safetensors, GGUF |
| bengaliAI/tugstugi_bengaliai-asr_whisper-medium (original) | 763,9 M | 30 s | bengalí | Apache-2.0 | safetensors |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en bengalí en la información proporcionada.

## Limitaciones y advertencias

- Solo transcribe bien en bengalí; el resto de lenguas listadas en los metadatos están presentes únicamente para que el runtime emita el token `<|bn|>`.
- No genera timestamps; requiere forzar el idioma bengalí y desactivar timestamps (`-l bn --timestamps none`).
- La salida no incluye puntuación; es necesario un modelo externo para añadirla.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el dataset de entrenamiento o solapamiento de hablantes.
- Sesgos potenciales derivados de la distribución del dataset de la competición Bengali.AI.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda mantener la atribución al autor original del entrenamiento.
- No se documentan limitaciones específicas adicionales en la información disponible.

## Enlaces

- [Hugging Face: omnixima/bengaliai-whisper-medium-gguf](https://huggingface.co/omnixima/bengaliai-whisper-medium-gguf)
- [Modelo base: bengaliAI/tugstugi_bengaliai-asr_whisper-medium](https://huggingface.co/bengaliAI/tugstugi_bengaliai-asr_whisper-medium)
- [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Kothon](https://github.com/Omnixima/kothon)
- [Modelo de puntuación: omnixima/bangla-punctuation-muril6](https://huggingface.co/omnixima/bangla-punctuation-muril6)
- [Solución ganadora en Kaggle (Chimege, 1st place)](https://www.kaggle.com/competitions/bengaliai-speech/writeups/chimege-1st-place-solution)
