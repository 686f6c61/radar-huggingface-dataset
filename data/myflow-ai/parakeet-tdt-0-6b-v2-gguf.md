# myflow-ai/parakeet-tdt-0.6b-v2-gguf

# Parakeet TDT 0.6B V2 GGUF (transcribe.cpp)

## Resumen

Esta ficha describe la conversión a GGUF del modelo `nvidia/parakeet-tdt-0.6b-v2`, publicada por el usuario myflow-ai para su uso con transcribe.cpp. Se trata de un modelo de reconocimiento automático del habla (ASR) en inglés, de aproximadamente 618 millones de parámetros, que combina un codificador FastConformer de tipo XL con un decodificador transducer TDT/RNNT. Su función es transcribir audio de 16 kHz mono a texto con puntuación, mayúsculas y marcas de tiempo a nivel de token.

El modelo base lo desarrolla NVIDIA y está pensado para transcripción offline de alta calidad en inglés, con soporte de audio de hasta 24 minutos en una sola pasada y un RTFx de 3380 en el leaderboard HF-Open-ASR (batch de 128, según datos del propio autor). La relevancia de esta conversión concreta radica en que empaqueta el modelo en formato GGUF con seis niveles de cuantización (desde F32 hasta Q4_K_M), lo que permite ejecutarlo en CPU, Vulkan o Metal sin depender del framework NeMo original.

El repositorio es de reciente creación y, en el momento de redactar esta ficha, presenta cero descargas y cero "likes", por lo que se trata de una conversión con validación numérica documentada frente a la referencia de NeMo, pero sin adopción comunitaria confirmada. No es un modelo de streaming, no traduce y no detecta idioma; el autor remite a la variante v3 para capacidades multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (Conformer XL) encoder + decodificador transducer TDT/RNNT |
| Parametros totales | 617.869.958 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo ASR); audio de hasta 24 minutos por pasada según el modelo base |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | GGUF (para transcribe.cpp) |

Otros datos de interes: `library_name` = transcribe.cpp; pipeline = automatic-speech-recognition; streaming = false; traduccion = false; deteccion de idioma = false; marcas de tiempo = a nivel de token; tamano del repo = 0,7 GB.

## Arquitectura y entrenamiento

La arquitectura es un codificador FastConformer XL con atención completa y un decodificador transducer TDT (Token-and-Duration Transducer), una variante del RNNT que modela conjuntamente tokens y duraciones. El codificador procesa audio de 16 kHz mono y la atención completa permite transcribir segmentos largos (hasta 24 minutos) en una sola pasada, sin la ventana limitada de los Conformer con atención local. Según el autor del modelo base, alcanza un RTFx de 3380 en HF-Open-ASR con batch 128, cifra que puede variar según la duración del audio y el tamano del lote.

La información disponible no detalla el numero de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El modelo base reporta soporte robusto de números hablados y transcripción de letras de canciones, así como predicción precisa de marcas de tiempo a nivel de palabra, puntuación automática y capitalización. Esta conversión concreta se realizó desde el commit upstream `1b149a3` (fijado el 2026-04-15) y se validó frente a la referencia de NeMo en el commit `bf0d0b7` de transcribe.cpp el 2026-04-18. La cuantización no introduce degradación apreciable en F32, F16 y Q8_0.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio de 16 kHz mono en formato WAV.
- Puntuación automática y capitalización en la salida.
- Predicción de marcas de tiempo: el autor indica que son a nivel de token; el modelo base las describe a nivel de palabra.
- Buen comportamiento en números hablados y en transcripción de letras de canciones según el modelo base.
- Procesamiento de audio de hasta 24 minutos por pasada (dato del modelo base).
- Ejecución en CPU, Vulkan y Metal mediante transcribe.cpp.
- No soporta streaming.
- No soporta traducción.
- No soporta detección de idioma.
- No dispone de capacidad multilingüe (solo inglés).
- No se documenta soporte de tool calling, function calling ni uso como agente; es un modelo ASR, no un modelo de lenguaje generativo.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo acepta segmentos de hasta 24 minutos en una sola pasada, lo que reduce la necesidad de trocear el audio en reuniones de duración media y simplifica el pipeline de transcripción.
- Subtitulado de vídeo: las marcas de tiempo por token o palabra permiten generar subtítulos alineados temporalmente sin necesidad de un modelo de alineación adicional.
- Archivado y búsqueda de audio: convertir grabaciones históricas (podcasts, notas de voz, llamadas) a texto indexable, ejecutándolo en local con la cuantización Q4_K_M de 483 MB en equipos sin GPU dedicada.
- Dictado y toma de notas en escritorio: al correr en CPU con transcribe.cpp y un consumo de memoria bajo, puede integrarse en aplicaciones de escritorio para dictado offline sin enviar audio a servicios externos.
- Preprocesado de datos para entrenamiento: generar transcripciones a gran escala de corpus en inglés, aprovechando el RTFx alto reportado (3380 con batch 128 en el modelo base) para procesar volumen elevado.
- Verificación de calidad y cumplimiento en centros de llamadas: transcribir conversaciones en inglés para auditoría, con la ventaja de que el procesamiento puede hacerse íntegramente en local, lo que ayuda con requisitos de privacidad.
- Accesibilidad: generación de transcripciones para contenido audiovisual en inglés destinado a personas con discapacidad auditiva, con opción de despliegue en portátiles con Apple Silicon (según datos del autor, hasta 175x con Metal en un M4 Max).

## Benchmarks y rendimiento

Resultados publicados por el autor de la conversión, medidos sobre el split completo LibriSpeech test-clean (2620 enunciados) con decodificación greedy del transducer y sin modelo de lenguaje externo:

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| F32 | 2,47 GB | 1,68% |
| F16 | 1,24 GB | 1,68% |
| Q8_0 | 730 MB | 1,69% |
| Q6_K | 608 MB | 1,70% |
| Q5_K_M | 547 MB | 1,70% |
| Q4_K_M | 483 MB | 1,72% |

La línea base F32 de la conversión es 1,68%. El dato autodeclarado por NVIDIA sobre el mismo split es 1,69%, de modo que F32 y Q8_0 coinciden con la referencia upstream dentro del redondeo.

Rendimiento relativo (RTF, según el autor de la conversión):

| Hardware | Backend | RTF |
|---|---|---:|
| Ryzen 4750U | CPU | 8 |
| Ryzen 4750U | Vulkan | 15 |
| Apple M4 Max | CPU | 29 |
| Apple M4 Max | Metal | 175 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje.

## Requisitos de hardware

- Memoria estimada en inferencia según el tamano del fichero GGUF: Q4_K_M ≈ 483 MB, Q5_K_M ≈ 547 MB, Q6_K ≈ 608 MB, Q8_0 ≈ 730 MB, F16 ≈ 1,24 GB, F32 ≈ 2,47 GB (hay que anadir el consumo del runtime y de los búferes de audio).
- Cabe en GPU de consumo: todas las cuantizaciones, incluida F32 (2,47 GB), entran en tarjetas con 4 GB o más de VRAM; las variantes Q4_K_M y Q5_K_M son aptas incluso para entornos muy limitados.
- Funciona sin GPU: hay backend de CPU y rendimiento documentado en CPU tanto en x86 (Ryzen 4750U) como en Apple Silicon (M4 Max).
- GPU y aceleradores recomendados: no se especifican modelos concretos de GPU en la información disponible; el autor documenta ejecución mediante Vulkan y Metal, y el modelo base es compatible con el entorno NeMo de NVIDIA.
- Opciones de despliegue: transcribe.cpp (compilado desde fuente; CLI `transcribe-cli`) para los ficheros GGUF. El modelo base puede ejecutarse con NeMo. No se documenta soporte de vLLM, TGI, Ollama o llama.cpp en la información disponible.
- Latencia y throughput: los RTF aportados indican 8 en CPU Ryzen 4750U, 15 en Vulkan sobre el mismo equipo, 29 en CPU de M4 Max y 175 con Metal en M4 Max. El modelo base reporta un RTFx de 3380 en HF-Open-ASR con batch 128.
- Requisito de entrada: audio a 16 kHz mono WAV; el autor recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

Los datos de rendimiento de alternativas no están incluidos en la información proporcionada. La tabla recoge únicamente lo que figura en ella; el resto se marca como no disponible.

| Modelo | Parametros | Contexto (audio) | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v2 (GGUF, myflow-ai) | 617.869.958 | hasta 24 min por pasada (modelo base) | 1,68% (F32/F16) a 1,72% (Q4_K_M) | CC-BY-4.0 | GGUF en HF |
| nvidia/parakeet-tdt-0.6b-v2 (original) | 0,6B | hasta 24 min por pasada | 1,69% (autodeclarado) | CC-BY-4.0 | pesos originales (NeMo) |
| nvidia/parakeet-tdt-0.6b-v3 | no disponible | no disponible | no disponible | no disponible | mencionado en la model card del modelo base |
| Otras alternativas ASR (Whisper, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés: el modelo no soporta otros idiomas y no detecta el idioma de entrada.
- No es streaming: requiere el audio completo (o un segmento cerrado) para transcribir; no sirve para reconocimiento en tiempo real continuo.
- No traduce: no se puede usar como sistema de traducción de voz.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en tramos con ruido, silencio o audio musical; la información no incluye tasas de error fuera de LibriSpeech test-clean, un corpus de lectura limpia, por lo que el WER en condiciones reales será previsiblemente peor.
- Sesgos: no se documentan análisis de sesgo por acento, dialecto, edad o género en la información disponible; el rendimiento en inglés no nativo o con acentos marcados no está cuantificado.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución. Hay que conservar la atribución a NVIDIA y al autor de la conversión y revisar los terminos completos en la model card upstream.
- Discrepancia de repositorio: el identificador del modelo es `myflow-ai/parakeet-tdt-0.6b-v2-gguf`, mientras que los enlaces de descarga de la model card apuntan a `handy-computer/parakeet-tdt-0.6b-v2-gguf`. Conviene verificar el origen antes de usarlo en producción.
- Adopción nula: cero descargas y cero "likes" en el momento de la consulta; no hay validación independiente por parte de la comunidad.
- No apto para tareas de lenguaje: al ser un modelo ASR, no genera texto libre, no razona y no soporta tool calling ni uso como agente.
- Requisito de formato de audio: la entrada debe ser WAV de 16 kHz mono; no se documenta manejo directo de otros formatos o frecuencias.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/myflow-ai/parakeet-tdt-0.6b-v2-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Variante multilingüe v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v2.md
- Commit de transcribe.cpp usado en la validación: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Commit upstream del modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2/commit/1b149a3
- Demo de NVIDIA: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v2
- Documentación de modelos ASR de NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Paper referenciado (arxiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper referenciado (arxiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper referenciado (arxiv:2406.00899): https://arxiv.org/abs/2406.00899
- Paper referenciado (arxiv:2410.01036): https://arxiv.org/abs/2410.01036
- Paper referenciado (arxiv:2505.13404): https://arxiv.org/abs/2505.13404
