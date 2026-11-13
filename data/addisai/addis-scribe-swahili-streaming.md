# addisai/addis-scribe-swahili-streaming

## Resumen

Addis Scribe Streaming: Swahili es un modelo de reconocimiento automatico del habla (ASR) en tiempo real para suajili, desarrollado por Addis AI. Se trata de un ajuste fino de Tonykip/nemotron-3.5-swahili-streaming-asr, que a su vez deriva de NVIDIA Nemotron 3.5 ASR Streaming (0,6B). El modelo esta disenado para transcripcion en vivo: el texto aparece mientras las personas hablan y se finaliza poco despues de que dejen de hablar.

La arquitectura es un encoder FastConformer con atencion cache-aware, con cabezas de decodificacion hibridas RNNT + CTC, y un total de 0,6 mil millones de parametros. Soporta tamanos de chunk de 0,32 s o 1,12 s, lo que lo hace adecuado para aplicaciones de baja latencia. Utiliza un prompt de idioma `sw-KE` (indice 48) para guiar la decodificacion hacia suajili.

El modelo es relevante porque cubre una laguna importante: el ASR de alta calidad para lenguas africanas, y en particular para suajili, ha estado historicamente dominado por soluciones propietarias o por modelos multilingues genericos con rendimiento deficiente. Addis Scribe reporta mejores tasas de error que Google Chirp 3 en modo live sobre African Voices y Common Voice, y aproximadamente la mitad de errores de caracteres en FLEURS. Se distribuye bajo licencia OpenMDW 1.1 y requiere NVIDIA NeMo 3.0 para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cache-aware FastConformer encoder con decodificacion hibrida RNNT + CTC |
| Parametros totales | 0,6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming, chunks de 0,32 s o 1,12 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Suajili (sw) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | `.nemo` (formato nativo de NVIDIA NeMo) |

## Arquitectura y entrenamiento

El modelo emplea un encoder FastConformer con atencion cache-aware, disenado especificamente para inferencia en streaming. La decodificacion es hibrida, combinando un decodificador RNNT (Recurrent Neural Network Transducer) con una cabeza CTC. La decodificacion en produccion es greedy RNNT con un prompt de idioma `sw-KE` (indice 48) que condiciona la salida hacia suajili. El modelo acepta audio mono a 16 kHz y produce texto en suajili con mayusculas, puntuacion y numeros en digitos.

El modelo es un ajuste fino de Tonykip/nemotron-3.5-swahili-streaming-asr, que a su vez se basa en NVIDIA Nemotron 3.5 ASR Streaming (0,6B). Addis AI realizo el ajuste fino sobre mas datos de habla en suajili. No se especifica en la informacion disponible el numero exacto de tokens de audio, la composicion del dataset de ajuste fino ni si se emplearon tecnicas de RLHF o DPO. El modelo se distribuye en formato `.nemo` y requiere NVIDIA NeMo 3.0 para su carga y ejecucion.

## Capacidades

- Reconocimiento automatico del habla en suajili en tiempo real (streaming) con chunks de 0,32 s o 1,12 s.
- Transcripcion con mayusculas, puntuacion y numeros en formato de digitos.
- Decodificacion guiada por prompt de idioma (`sw-KE`, indice 48).
- Modo de inferencia sobre archivo completo (transcribe) ademas del modo streaming.
- Soporte de marcas de tiempo a nivel de palabra y subtitulos a traves de la API de Addis AI (no directamente en el modelo local).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No soporta vision ni audio mas alla del ASR.
- Capacidad multilingue limitada exclusivamente al suajili.

## Casos de uso

- Subtitulacion en vivo de reuniones y eventos en suajili: el modelo procesa audio en chunks de 0,32 s o 1,12 s y emite texto mientras se habla, lo que permite generar subtitulos con latencia baja en retransmisiones o videoconferencias.
- Transcripcion de llamadas de atencion al cliente: integrado en un pipeline de telefonia (por ejemplo, via la API de Addis AI con `language=sw`), permite generar transcripciones con marcas de tiempo de palabra para auditoria y analisis de calidad.
- Generacion de actas y notas de reuniones: el modo de archivo completo (`transcribe`) permite procesar grabaciones de reuniones en suajili y obtener texto con puntuacion y numeros en digitos, listo para resumen posterior.
- Accesibilidad para personas con discapacidad auditiva: el streaming en tiempo real permite mostrar texto en pantallas o gafas durante conversaciones presenciales o virtuales en suajili.
- Indexacion y busqueda de archivos de audio: transcribir grandes volumenes de grabaciones (podcasts, archivos de radio, entrevistas) para hacerlos buscables por texto, aprovechando el bajo WER en dominios como African Voices (7,9) y FLEURS (14,6).
- Asistentes de voz y agentes conversacionales: el modelo puede actuar como front-end de ASR en un sistema de voz en suajili, alimentando el texto a un LLM o a un sistema de comandos, con la ventaja de que el mismo modelo sirve la API de Addis AI con `language=sw`.
- Documentacion clinica o legal dictada: transcripcion de dictados en suajili con puntuacion y numeros en digitos, adecuada para flujos donde se requiere texto estructurado y posterior revision humana.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el modelo en modo live (chunks de 1,12 s) con Google Chirp 3 en modo streaming y con modelos abiertos en modo archivo completo. Las metricas son WER (word error rate) y CER (character error rate); menor es mejor. Los clips de test tienen transcripciones humanas y no se usaron en entrenamiento: African Voices Swahili test (2.000 clips), FLEURS Swahili test (487) y Common Voice Swahili (2.000).

Comparativa live contra live:

| Sistema | Modo | African Voices WER / CER | FLEURS WER / CER | Common Voice WER / CER |
|---|---|---|---|---|
| Addis Scribe (este modelo) | live, chunks de 1,12 s | 7,9 / 2,4 | 14,6 / 4,5 | 19,6 / 7,0 |
| Google Chirp 3 | live, streaming | 8,9 / 3,4 | 14,4 / 8,1 | 21,4 / 11,5 |

Comparativa con modelos abiertos:

| Sistema | Modo | African Voices WER / CER | FLEURS WER / CER | Common Voice WER / CER |
|---|---|---|---|---|
| Addis Scribe (este modelo) | live, chunks de 1,12 s | 7,9 / 2,4 | 14,6 / 4,5 | 19,6 / 7,0 |
| Tonykip Swahili streaming ASR | live, chunks de 1,12 s | 12,6 / 3,6 | 30,4 / 10,9 | 39,4 / 12,8 |
| BuzzASR Swahili | archivo completo | 13,8 / 4,2 | 25,5 / 10,0 | 16,5 / 5,9 |
| Whisper large-v3 | archivo completo | 39,6 / 9,6 | 34,7 / 8,8 | 64,1 / 26,2 |

Nota: Google Chirp 3 live devolvio un error en 1 de los 2.000 clips de African Voices en cada intento; su puntuacion en African Voices cubre los otros 1.999 clips (Addis Scribe obtiene la misma puntuacion en esos 1.999). Los resultados completos, las salidas y el scorer estan en el dataset addisai/addis-scribe-benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 0,6B parametros, la huella en precision FP16 seria de aproximadamente 1,2 GB solo para pesos, mas overhead de activaciones y buffers de streaming; en FP32, unos 2,4 GB.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia ser suficiente, pero no hay confirmacion del autor.
- Cabe en GPU consumer: probablemente si, dado el tamano de 0,6B, pero no confirmado en la informacion disponible.
- Opciones de despliegue: NVIDIA NeMo 3.0 (requerido), con el script `stream_infer.py` para modo streaming; tambien a traves de la API de Addis AI con `language=sw`.
- Latencia y throughput estimados: no disponibles. El modelo esta disenado para chunks de 0,32 s o 1,12 s, lo que sugiere latencias del orden de esas ventanas, pero no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modo | WER African Voices | WER FLEURS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Addis Scribe Streaming: Swahili | 0,6B | streaming, chunks 0,32 s o 1,12 s | 7,9 | 14,6 | OpenMDW 1.1 | Hugging Face (formato .nemo) |
| Tonykip Swahili streaming ASR | no disponible | streaming, chunks 1,12 s | 12,6 | 30,4 | no disponible | Hugging Face |
| BuzzASR Swahili | no disponible | archivo completo | 13,8 | 25,5 | no disponible | Hugging Face |
| Whisper large-v3 | 1,55B | archivo completo | 39,6 | 34,7 | MIT (modelo) | Hugging Face |
| Google Chirp 3 | propietario | streaming | 8,9 | 14,4 | propietaria | Google Cloud |

Addis Scribe obtiene el mejor WER en African Voices y FLEURS entre los modelos abiertos comparados, y supera a Google Chirp 3 en CER en los tres conjuntos de test. En Common Voice, BuzzASR Swahili obtiene mejor WER (16,5 frente a 19,6), aunque en modo archivo completo y no streaming.

## Limitaciones y advertencias

- Las mayusculas y la puntuacion siguen los transcripts de entrenamiento y no siempre son correctas; los benchmarks ignoran estas marcas al puntuar.
- No se ofrecen etiquetas de hablante (speaker labels) para suajili en la API de Addis AI todavia.
- El modelo solo se ha probado en suajili; no hay evidencia de rendimiento en otros idiomas.
- Riesgo de alucinacion: no se documenta en la informacion disponible, pero es un riesgo inherente a los modelos ASR en condiciones de audio ruidoso o fuera de dominio.
- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse sobre datos de suajili, podria tener sesgos hacia determinados acentos o variedades regionales.
- Restricciones de licencia: OpenMDW 1.1; es necesario revisar los terminos completos en el enlace de licencia para uso comercial.
- Requiere NVIDIA NeMo 3.0, lo que limita su integracion a stacks compatibles con NeMo.
- El formato de pesos es `.nemo`, no safetensors ni GGUF, lo que puede complicar su uso en frameworks distintos de NeMo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/addisai/addis-scribe-swahili-streaming
- Modelo base: https://huggingface.co/Tonykip/nemotron-3.5-swahili-streaming-asr
- Benchmark dataset: https://huggingface.co/datasets/addisai/addis-scribe-benchmark
- Pagina de benchmarks de suajili: https://platform.addisassistant.com/benchmarks/addis-scribe-swahili
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Addis AI API (documentacion): https://docs.addisassistant.com
- Addis AI: https://addisassistant.com
- Modelo hermano (amharico): https://huggingface.co/addisai/addis-scribe-streaming
- Google Chirp 3: https://cloud.google.com/speech-to-text
- BuzzASR Swahili: https://huggingface.co/BuzzASR/swahili
- Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
