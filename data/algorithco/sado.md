# algorithco/sado

## Resumen

Sado es un modelo de reconocimiento automático del habla (ASR) para uzbeko, publicado en Hugging Face por el usuario algorithco bajo el identificador `algorithco/sado`. Se trata de una adaptación del checkpoint NVIDIA FastConformer-Hybrid Large (Transducer + CTC) para el idioma uzbeko, con aproximadamente 115 millones de parámetros y entrenado sobre unas 1000 horas de audio en uzbeko procedente de tres corpus: Mozilla Common Voice 17.0, UzbekVoice y Google FLEURS.

El modelo resuelve la transcripción de voz a texto en uzbeko, un idioma de bajos recursos para el que existen pocos sistemas ASR de calidad. Su arquitectura FastConformer con downsampling convolucional 8x y doble decodificador (Transducer por defecto y CTC) permite elegir entre dos modos de inferencia según el compromiso entre precisión y latencia que requiera el despliegue.

Es relevante ahora porque cubre un hueco idiomático concreto con un rendimiento declarado de 16,46 % WER en Common Voice y 17,52 % WER en FLEURS, cifras razonables para un idioma de bajos recursos, y porque se integra en el ecosistema NVIDIA NeMo, lo que facilita su fine-tuning y su despliegue en producción mediante Riva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer Hybrid (Transducer + CTC) |
| Parametros totales | ~115M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo no streaming; entrada de audio a 16 kHz) |
| Tipos de cuantizacion | no disponible (pesos PyTorch/NeMo; el repo incluye ONNX) |
| Idiomas soportados | uzbeko (uz) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo), ONNX, PyTorch |

## Arquitectura y entrenamiento

FastConformer es una variante optimizada del Conformer que incorpora un downsampling convolucional depthwise-separable de 8x, lo que reduce la longitud de la secuencia antes de las capas de atención y disminuye el coste computacional. El modelo es híbrido: se entrena con dos funciones de pérdida simultáneas, Transducer (RNNT, decodificador por defecto) y CTC, de modo que en inferencia puede usarse cualquiera de los dos modos. El checkpoint base es el FastConformer-Hybrid Large de NVIDIA, adaptado al uzbeko.

El entrenamiento se realizó con NVIDIA NeMo durante varios cientos de épocas sobre un corpus compuesto de aproximadamente 1000 horas de audio en uzbeko: alrededor de 90 horas de Mozilla Common Voice 17.0, unas 900 horas de UzbekVoice y unas 10 horas de Google FLEURS. El tokenizador BPE se construyó a partir de las transcripciones del conjunto de entrenamiento mediante el script oficial de NeMo. La entrada es audio mono a 16 kHz en formato WAV y la salida es una cadena de texto.

## Capacidades

- Transcripción de voz a texto en uzbeko, con alfabeto latino en mayúsculas y minúsculas.
- Reconocimiento de espacios, comas, signos de interrogación y guiones en la salida.
- Doble modo de decodificación: Transducer (por defecto, mayor precisión) y CTC (menor coste, útil para despliegues con requisitos de latencia).
- Procesamiento por lotes de múltiples ficheros de audio mediante el script `transcribe_speech.py` de NeMo.
- Fine-tuning sobre otros conjuntos de datos en uzbeko usando el checkpoint como punto de partida.
- Exportación a ONNX para despliegue fuera del ecosistema NeMo.
- No soporta tool calling, agentes, visión, audio de entrada distinto de voz ni modo thinking; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en uzbeko: el modelo convierte grabaciones de audio mono a 16 kHz en texto plano, adecuado para generar actas o resúmenes posteriores con un LLM.
- Subtitulado automático de vídeo en uzbeko: integrado en un pipeline que extrae la pista de audio, la remuestrea a 16 kHz y llama al modelo en modo Transducer para obtener los subtítulos.
- Atención al cliente en centros de contacto uzbekos: transcripción de llamadas grabadas para análisis de calidad, búsqueda de palabras clave y cumplimiento normativo.
- Generación de corpus textual en uzbeko: transcripción masiva de archivos de audio (podcasts, radio, archivos históricos) para alimentar datasets de entrenamiento de otros modelos.
- Dictado y accesibilidad: integración en aplicaciones de escritorio o móvil que conviertan voz en texto para usuarios uzbekoparlantes con dificultades de movilidad.
- Investigación lingüística: análisis de frecuencia léxica, fonética y variación dialectal a partir de transcripciones de corpus orales en uzbeko.
- Preprocesado para pipelines RAG sobre audio: transcripción de archivos de audio a texto que después se indexan en un sistema de búsqueda semántica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, con decodificación greedy y decodificador Transducer. La columna "WER wo CAP" elimina mayúsculas, "WER wo PUNCT" elimina puntuación y "WER wo PUNCT CAP" elimina ambas.

| Conjunto | WER (%) | WER sin mayúsculas | WER sin puntuación | WER sin puntuación ni mayúsculas |
|---|---|---|---|---|
| FLEURS dev (usado como test) | 17,52 | 16,20 | 12,20 | 10,73 |
| Common Voice 17.0 test | 16,46 | 15,89 | 7,78 | 7,18 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de texto, dado que se trata de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~115M parámetros, los pesos en FP32 ocupan aproximadamente 0,5 GB y en FP16 unos 0,25 GB; el consumo real de VRAM depende del tamaño de lote y de la longitud del audio.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente; se recomiendan A100, H100, L4 o RTX 4090 para despliegues de alto throughput con lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más.
- Opciones de despliegue: NVIDIA NeMo (nativo), NVIDIA Riva (SDK acelerado para on-prem, cloud y edge), ONNX Runtime a partir de la exportación incluida en el repo y scripts de `transcribe_speech.py` para procesamiento por lotes.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| algorithco/sado (este modelo) | ~115M | audio 16 kHz, no streaming | 16,46 % (CV17 uz), 17,52 % (FLEURS uz) | CC-BY-4.0 | Hugging Face, NeMo, ONNX |
| nvidia/stt_uz_fastconformer_hybrid_large_pc | ~115M | audio 16 kHz, no streaming | no disponible en la información | CC-BY-4.0 | Hugging Face, NeMo |
| Whisper large-v3 (OpenAI) | ~1550M | audio 16 kHz, ventana de 30 s | no disponible en la información | MIT | Hugging Face, múltiples runtimes |
| MMS (Meta) uzbeko | no disponible | audio 16 kHz | no disponible en la información | CC-BY-NC-4.0 | Hugging Face |

Los datos de WER de los modelos alternativos no se han incluido porque no estaban presentes en la información proporcionada; no se han inventado cifras.

## Limitaciones y advertencias

- El modelo es no streaming: procesa el audio completo, no en tiempo real por fragmentos, lo que limita su uso en aplicaciones de dictado en vivo.
- La model card indica que la salida no incluye capitalización ni puntuación, aunque la descripción del modelo menciona que transcribe mayúsculas, minúsculas, comas, interrogaciones y guiones; esta contradicción debe verificarse empíricamente antes de confiar en el formato de salida.
- Rendimiento degradado ante términos técnicos, vocabulario especializado o variantes dialectales no presentes en los corpus de entrenamiento.
- Entrenado exclusivamente en uzbeko: no soporta otros idiomas ni cambio de código (code-switching) de forma fiable.
- Sesgos potenciales derivados de la composición de los corpus (Common Voice, UzbekVoice, FLEURS), que pueden sobrerrepresentar determinados acentos, géneros o registros.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o solapamiento de hablantes, con posibles sustituciones de palabras por otras fonéticamente similares.
- Licencia CC-BY-4.0: permite uso comercial con atribución al autor; es necesario citar la fuente y conservar el aviso de licencia.
- Solo 7 descargas y 1 like en el momento de la consulta: modelo con validación comunitaria muy limitada, por lo que conviene evaluarlo en el dominio concreto de despliegue antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/algorithco/sado
- Repositorio de NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Script de entrenamiento híbrido Transducer-CTC: https://github.com/NVIDIA/NeMo/blob/main/examples/asr/asr_hybrid_transducer_ctc/speech_to_text_hybrid_rnnt_ctc_bpe.py
- Configuración base del entrenamiento: https://github.com/NVIDIA/NeMo/blob/main/examples/asr/conf/fastconformer/hybrid_transducer_ctc/fastconformer_hybrid_transducer_ctc_bpe.yaml
- Script de construcción del tokenizador: https://github.com/NVIDIA/NeMo/blob/main/scripts/tokenizers/process_asr_text_tokenizer.py
- NVIDIA Riva: https://developer.nvidia.com/riva
- Paper de FastConformer (arXiv 2305.05084): https://arxiv.org/abs/2305.05084
- Dataset Mozilla Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Dataset Google FLEURS: https://huggingface.co/datasets/google/fleurs
