# SayedShaun/bengali-whisper-medium

## Resumen

`SayedShaun/bengali-whisper-medium` es un modelo de reconocimiento automático del habla (ASR) para bengalí, resultado de un fine-tuning del modelo `openai/whisper-medium` sobre datos de la competición [Bengali.AI Speech Recognition](https://www.kaggle.com/competitions/bengaliai-speech) de Kaggle. Fue entrenado originalmente por Erdene-Ochir Tuguldur (equipo Chimege), que obtuvo el primer puesto con una WER pública de 0.312, y este repositorio lo redistribuye con empaquetado adicional (conversión a safetensors y reparación del config de generación). El modelo transcribe audio bengalí a texto sin puntuación; para obtener puntuación (। , ?) se recomienda combinarlo con un módulo complementario de restauración de puntuación publicado por el mismo autor.

La relevancia de este modelo radica en que ofrece un ASR de alta calidad para un idioma con recursos limitados, con licencia Apache-2.0 y compatible con el ecosistema estándar de `transformers`. Al estar basado en Whisper-medium, hereda su arquitectura encoder-decoder y su capacidad para manejar audio de larga duración mediante fragmentación. Es una opción práctica para desarrolladores que necesiten transcripción bengalí en producción sin depender de servicios propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-medium (encoder-decoder transformer) |
| Parametros totales | 763.857.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Whisper, ventana de audio de 30 s) |
| Tipos de cuantizacion | No disponible (repositorio en safetensors) |
| Idiomas soportados | bn (bengalí) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `openai/whisper-medium`, por lo que conserva la arquitectura original de Whisper: un transformer encoder-decoder con atención de escala logarítmica, diseñado para procesar espectrogramas de Mel de ventanas de audio de 30 segundos. No se han publicado detalles específicos sobre el dataset de entrenamiento (número de tokens, composición exacta), pero la model card menciona que se utilizó pseudo-etiquetado de YouTube, lo que explica la brecha entre la WER pública (0.312) y la privada (0.372). El entrenamiento fue supervisado, sin etapas de RLHF o DPO. La innovación principal no está en la arquitectura, sino en la adaptación al bengalí y en la integración con un módulo separado de restauración de puntuación, que emplea cabezas MuRIL para añadir signos de puntuación básicos al texto transcrito.

## Capacidades

- Transcripción de audio bengalí a texto sin puntuación.
- Soporte de audio de larga duración mediante fragmentación (`chunk_length_s=20.1` recomendado).
- Restauración de puntuación básica (। , ?) si se combina con el módulo `asr-punctuation-restore-bn` o el paquete `asr-punct-restore`.
- Normalización NFC necesaria para comparar o almacenar correctamente los caracteres bengalíes precompuestos.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades más allá del ASR.
- No es multilingüe: solo bengalí.

## Casos de uso

- Transcripción de reuniones y entrevistas en bengalí: el modelo puede procesar grabaciones largas mediante fragmentación y generar actas textuales con puntuación básica si se añade el restaurador de puntuación.
- Subtitulado automático de vídeos en bengalí: se puede integrar en pipelines de procesamiento de vídeo para generar subtítulos, útil para creadores de contenido o plataformas educativas.
- Atención al cliente automatizada: transcripción de llamadas telefónicas en bengalí para su posterior análisis o archivado, con la ventaja de que el modelo es ligero y desplegable en infraestructura propia.
- Accesibilidad para personas con discapacidad auditiva: conversión de contenido hablado en bengalí a texto en tiempo real o diferido.
- Archivado y búsqueda de contenido hablado: transcripción de podcasts, noticias o material de audio para indexación y búsqueda textual.
- Investigación lingüística: análisis de corpus orales bengalíes, donde la normalización NFC y la puntuación básica facilitan el procesamiento posterior.

## Benchmarks y rendimiento

Según la model card, el modelo alcanzó una WER de 0.312 en el leaderboard público y 0.372 en el privado de la competición Bengali.AI Speech Recognition. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) ni comparaciones con otros modelos ASR bengalíes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~764M parámetros; en FP32 requiere aproximadamente 3 GB de VRAM, y en FP16 alrededor de 1.5 GB. Con fragmentación de audio, el uso puede aumentar ligeramente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA T4, RTX 3060, RTX 4090, o GPUs de centros de datos como A10 o A100. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatible con consumer GPUs: sí, siempre que tengan suficiente VRAM para el modelo en FP16.
- Opciones de despliegue: al ser un modelo estándar de `transformers`, puede servirse con bibliotecas como vLLM, TGI, o mediante el pipeline de Hugging Face. También es posible usar `llama.cpp` o `Ollama` si se convierte a GGUF, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponibles en la documentación del modelo; dependerán del hardware y del uso de fragmentación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR bengalíes en la información proporcionada. Existen alternativas como `shhossain/whisper_bangla_models` (fine-tunes de Whisper para bengalí) o el modelo original de `tugstugi`, pero no se han publicado benchmarks que permitan una comparación numérica. En términos de licencia, este modelo es Apache-2.0, mientras que otros pueden tener restricciones diferentes. La disponibilidad de pesos en safetensors y la integración con `transformers` son ventajas prácticas.

## Limitaciones y advertencias

- Solo soporta bengalí; no es multilingüe.
- Alucina texto fluido en segmentos de silencio o ruido, como todos los modelos Whisper; se recomienda usar un detector de actividad de voz (VAD) antes de la transcripción.
- La restauración de puntuación solo cubre los signos । , ?; no incluye exclamaciones ni prosodia.
- Existe una brecha entre la WER pública y privada (0.312 vs 0.372), lo que sugiere cierto sobreajuste al dominio de la evaluación pública.
- El modelo no es thread-safe para llamadas concurrentes; se recomienda una instancia por worker.
- Requiere normalización NFC del texto de salida para evitar discrepancias en la comparación de caracteres.
- Aunque la licencia es Apache-2.0, el autor original (tugstugi) debe ser citado en cualquier uso académico o comercial, según la model card.

## Enlaces

- [Repositorio Hugging Face del modelo](https://huggingface.co/SayedShaun/bengali-whisper-medium)
- [Modelo de restauración de puntuación asociado](https://huggingface.co/SayedShaun/asr-punctuation-restore-bn)
- [Paquete asr-punct-restore (GitHub)](https://github.com/sayedshaun/asr-punct-restore)
- [Writeup de la solución ganadora en Kaggle](https://www.kaggle.com/competitions/bengaliai-speech/writeups/chimege-1st-place-solution)
- [Modelo original de tugstugi (espejo)](https://huggingface.co/bengaliAI/tugstugi_bengaliai-asr_whisper-medium)
- [Competición Bengali.AI Speech Recognition](https://www.kaggle.com/competitions/bengaliai-speech)
