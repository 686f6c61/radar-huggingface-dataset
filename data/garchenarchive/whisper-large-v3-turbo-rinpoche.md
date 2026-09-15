# GarchenArchive/whisper-large-v3-turbo-rinpoche

## Resumen

`whisper-large-v3-turbo-rinpoche` es un modelo de reconocimiento automático de voz (ASR) desarrollado por GarchenArchive, fine-tuneado a partir de `openai/whisper-large-v3-turbo` para transcribir el discurso de Garchen Rinpoche en tibetano (`bo`). El modelo resuelve la necesidad de transcripción de audio en un idioma con pocos recursos, aprovechando la arquitectura de Whisper y adaptándola a un dominio específico de un hablante concreto. Es relevante para la preservación y digitalización de enseñanzas orales en tibetano, así como para la investigación lingüística sobre este idioma.

La arquitectura es encoder-decoder, con 32 capas de encoder y 4 capas de decoder, y un vocabulario BPE multilingüe de 51.866 tokens. El modelo tiene 808.878.080 parámetros. La entrada es audio mono de 16 kHz, padded a la ventana de 30 segundos de Whisper. El `generation_config.json` ya configura `language="bo"` y `task="transcribe"`. La licencia no está especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (Whisper), 32 capas encoder / 4 capas decoder |
| Parametros totales | 808.878.080 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio: 30 s; salida máxima: 448 tokens) |
| Tipos de cuantizacion | No disponible (pesos en fp16 y fp32) |
| Idiomas soportados | Tibetano (`bo`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (fp16 y fp32) |

## Arquitectura y entrenamiento

El modelo base, `openai/whisper-large-v3-turbo`, es una versión podada de Whisper large-v3 que reduce las capas de decoder de 32 a 4, lo que lo hace más rápido. Este fine-tuning conserva esa arquitectura: 32 capas de encoder y 4 de decoder, con un vocabulario BPE multilingüe de 51.866 tokens. La entrada es audio mono de 16 kHz, padded a la ventana de 30 segundos de Whisper. El `generation_config.json` está configurado para transcribir en tibetano.

El entrenamiento se realizó sobre el dataset `GarchenArchive/stt-rinpoche-202605`, con 6.958 utterances en el split de entrenamiento. No se menciona uso de RLHF ni DPO. La innovación técnica destacable es la adaptación a un dominio de un solo hablante, con una recomendación práctica de segmentar el audio en clips de menos de 9,5 segundos debido al límite de salida del decoder de 448 posiciones.

## Capacidades

- Transcripción de voz en tibetano (`bo`) a texto.
- Configuración por defecto para idioma tibetano y tarea de transcripción (`language="bo"`, `task="transcribe"`).
- No soporta tool calling, function calling, agentes ni multi-step reasoning.
- No tiene capacidades de visión, generación de código ni razonamiento matemático.
- Capacidad multilingüe limitada: aunque el modelo base Whisper es multilingüe, este fine-tuning está especializado en tibetano y no se garantiza rendimiento en otros idiomas.
- No tiene modo de pensamiento ni procesamiento de audio adicional más allá de la transcripción.

## Casos de uso

- Transcripción de enseñanzas de Garchen Rinpoche: el modelo está fine-tuneado con 6.958 utterances de su voz, por lo que es la opción más precisa para transcribir sus discursos. Para evitar el truncamiento silencioso, se recomienda segmentar el audio en clips de ≤9,5 segundos.
- Digitalización de archivos de audio tibetanos: se puede usar para convertir grabaciones históricas o religiosas en texto, facilitando su búsqueda y análisis. El modelo requiere segmentación previa del audio.
- Subtitulado automático de vídeos de enseñanzas: se puede integrar en un pipeline de procesamiento de vídeo para generar subtítulos en tibetano. Dado el dominio específico, es adecuado para contenido de Garchen Rinpoche.
- Investigación en lingüística tibetana: las transcripciones generadas pueden servir como corpus para estudiar la fonética, la morfología o la sintaxis del tibetano hablado. El modelo proporciona una tasa de error de carácter de 0,1711 en clips cortos.
- Asistencia a traductores: los traductores pueden usar las transcripciones como borrador para traducir enseñanzas al español, inglés u otros idiomas. El modelo reduce el tiempo de transcripción manual.
- Accesibilidad para personas con discapacidad auditiva: generar subtítulos en tibetano para material de audio, mejorando el acceso a contenido religioso o educativo para la comunidad tibetana.

## Benchmarks y rendimiento

La model card publica resultados en el split de test de `GarchenArchive/stt-rinpoche-202605` (554 utterances, 1,20 horas, media de 7,8 segundos). Las métricas CER, WER y SER se calcularon con `jiwer` y `tibetan_wer`.

| Decoding | CER | WER (botok) | WER (BERT) | SER |
|---|---|---|---|---|
| Greedy | 0,2327 | 0,3547 | — | 0,3527 |
| Beam search (5) | 0,2257 | 0,3449 | 0,4724 | 0,3410 |
| Audio pre-segmented a ≤9 s, greedy | 0,2046 | 0,3403 | 0,5132 | 0,3315 |

La model card advierte que estas cifras agregadas subestiman el modelo. Desglosado por si la referencia cabe en el presupuesto de longitud del decoder:

| Subconjunto | n | CER | Ratio tokens salida/referencia |
|---|---|---|---|
| Referencia ≤444 tokens (clips <9,5 s) | 437 | 0,1711 | 1,03 |
| Referencia >444 tokens | 117 | 0,3451 | 0,81 |

También se menciona que un modelo CTC (`GarchenArchive/wav2vec2-xls-r-300m-rinpoche`) obtiene un CER de 0,1903 exactamente en los clips donde este modelo alcanza 0,3451, porque el modelo CTC no tiene límite de longitud de salida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos en fp16 ocupan 1,62 GB y en fp32 3,24 GB.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: Transformers (HuggingFace). El modelo se puede cargar con `WhisperForConditionalGeneration` y `WhisperProcessor`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Límite de salida | Rendimiento en test | Licencia |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-rinpoche | 808.878.080 | Encoder-decoder (32 enc / 4 dec) | 448 tokens | CER 0,2046 con segmentación ≤9 s | No disponible |
| openai/whisper-large-v3-turbo | No disponible | Encoder-decoder (32 enc / 4 dec) | 448 tokens | No disponible | No disponible |
| wav2vec2-xls-r-300m-rinpoche | No disponible | CTC (wav2vec2) | Sin límite | CER 0,1903 en clips largos | No disponible |

Los tres modelos están disponibles en HuggingFace. El modelo CTC es la alternativa recomendada para material de audio largo, ya que no tiene el límite de salida de 448 tokens.

## Limitaciones y advertencias

- Tope de longitud de salida: el decoder está capado en 448 posiciones. Con una tokenización de ~46,8 tokens por segundo de habla, un clip de 10 segundos necesita ~470 tokens y no cabe. El fallo es silencioso: el modelo emite un EOS bien formado y simplemente se detiene antes de tiempo, sin error ni truncamiento visible.
- Detección del truncamiento: no se puede detectar comprobando si falta el EOS, porque los token ids de pad y EOS son idénticos. Se recomienda comparar la longitud de la salida con la duración del clip.
- Mitigación: segmentar el audio a ≤9 segundos reduce las eliminaciones un 60%, pero casi duplica las inserciones (repeticiones o alucinaciones en las uniones de segmentos). Es necesario aplicar solapamiento y deduplicación.
- Beam search degenerado: con `num_beams=5` y `num_return_sequences=5`, todas las hipótesis devueltas son idénticas, con los mismos `sequences_scores`. No es útil para reranking.
- Dominio específico: el modelo está fine-tuneado en un solo hablante (Garchen Rinpoche) y un registro concreto. La generalización a otros hablantes o estilos de habla tibetana no está garantizada.
- Licencia no disponible: al no especificarse la licencia, puede haber restricciones para uso comercial.
- Riesgo de alucinación: en las uniones de segmentos se producen inserciones (repeticiones o texto inventado), lo que requiere revisión manual en aplicaciones críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GarchenArchive/whisper-large-v3-turbo-rinpoche
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Modelo CTC alternativo: https://huggingface.co/GarchenArchive/wav2vec2-xls-r-300m-rinpoche
- Dataset de entrenamiento: https://huggingface.co/GarchenArchive/stt-rinpoche-202605
- Librería `tibetan_wer`: https://pypi.org/project/tibetan-wer/
