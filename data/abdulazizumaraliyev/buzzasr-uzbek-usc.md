# abdulazizumaraliyev/buzzasr-uzbek-usc

## Resumen

BuzzASR Uzbek — USC es un modelo de reconocimiento automático del habla (ASR) especializado en uzbeko, desarrollado por el usuario de Hugging Face abdulazizumaraliyev. Se trata de un ajuste fino mediante LoRA del modelo BuzzASR/uzbek, que a su vez deriva de whisper-large-v3 de OpenAI (1.543 millones de parámetros, arquitectura transformer encoder-decoder). El ajuste se realizó sobre el corpus ISSAI Uzbek Speech Corpus (USC) y los adaptadores LoRA se fusionaron con los pesos base, generando un modelo autónomo en formato safetensors bf16.

El modelo resuelve el problema de la transcripción de voz en uzbeko, un idioma con recursos limitados en comparación con las lenguas mayoritarias. Su relevancia radica en que adapta un modelo multilingüe de gran tamaño a un dominio concreto (noticias y estilo conversacional del corpus USC), reportando un WER del 24,01 % y un CER del 9,77 % sobre 200 muestras de validación del propio corpus.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos de Hugging Face; los datos no publicados se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parámetros totales | 1.543.490.560 (~1,54 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; ventana de audio de 30 segundos por fragmento (chunk_length_s=30) |
| Tipos de cuantización | No disponible (pesos publicados en bf16; admite cuantización estándar vía transformers/GGUF no documentada) |
| Idiomas soportados | Uzbeko (uz) únicamente |
| Licencia | MIT (modelo base BuzzASR/uzbek también MIT; el dataset ISSAI USC tiene sus propias condiciones) |
| Formato de pesos | safetensors (bf16, ~3,1 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper large-v3: un transformer encoder-decoder con atención estándar, diseñado para ASR multilingüe y entrenado originalmente por OpenAI sobre grandes volúmenes de audio etiquetado. Sobre la base BuzzASR/uzbek se aplicó un ajuste fino con LoRA de rango r=32 y alpha=64, con módulos objetivo q_proj, k_proj, v_proj y out_proj. El entrenamiento se ejecutó durante 5000 pasos (aproximadamente 1,6 épocas) en precisión bf16.

El conjunto de datos utilizado fue el ISSAI Uzbek Speech Corpus, con 100.736 segmentos de entrenamiento. Los adaptadores LoRA se fusionaron (merged) con los pesos del modelo base, por lo que el repositorio contiene un modelo completo listo para inferencia con transformers. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa; la evaluación se realizó con decodificación greedy (num_beams=1).

## Capacidades

- Transcripción de voz a texto en uzbeko (pipeline automatic-speech-recognition).
- Procesamiento de audio en fragmentos de hasta 30 segundos; para audio más largo se recomienda trocear con chunk_length_s=30.
- Soporte de decodificación configurable: greedy, beam search, no_repeat_ngram_size, repetition_penalty y max_new_tokens.
- Selección explícita de idioma y tarea mediante los parámetros language="uzbek" y task="transcribe".
- Compatible con la librería transformers (WhisperForConditionalGeneration y WhisperProcessor).
- No se documentan capacidades de traducción, diarización, tool calling, agentes ni multimodalidad más allá del audio de entrada.

## Casos de uso

- Transcripción de contenido audiovisual en uzbeko: el modelo convierte audio de noticias o entrevistas en texto, aprovechando su ajuste sobre el dominio del corpus USC (estilo informativo y conversacional).
- Subtitulado automático de vídeos: integrable en pipelines que trocean el audio en fragmentos de 30 segundos y concatenan las transcripciones resultantes.
- Generación de actas y notas de reuniones: para reuniones en uzbeko, el modelo puede transcribir el audio y servir de base para resúmenes posteriores con otro modelo de lenguaje.
- Indexación y búsqueda de archivos de audio: la transcripción permite construir índices de texto sobre archivos de voz para búsqueda semántica o por palabras clave.
- Atención al cliente en uzbeko: transcripción de llamadas o mensajes de voz para su análisis, clasificación o enrutamiento posterior.
- Investigación lingüística y creación de corpus: útil para anotar o ampliar corpus de habla uzbeka, con la advertencia de revisar la calidad en dominios distintos al de entrenamiento.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenidos en uzbeko.

## Benchmarks y rendimiento

| Test | WER (%) | CER (%) | Condiciones |
|---|---|---|---|
| USC valid (200 muestras) | 24,01 | 9,77 | Greedy, num_beams=1 |

Los resultados corresponden a la validación durante el entrenamiento sobre 200 muestras del conjunto de validación del USC. No se han publicado resultados sobre el conjunto de test completo ni sobre otros dominios en la información disponible. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos, más memoria para activaciones y el feature extractor; en la práctica se recomienda al menos 6-8 GB de VRAM para bf16.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para mayor throughput; también cabe en GPUs de consumo con suficiente VRAM.
- Cabe en GPU de consumo: sí, en modelos como RTX 3090, RTX 4090 o RTX 4080 en bf16; en GPUs con menos VRAM sería necesaria cuantización (no documentada oficialmente).
- Opciones de despliegue: transformers (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BuzzASR Uzbek — USC | ~1,54 B | Fragmentos de 30 s | Uzbeko | MIT | Hugging Face |
| BuzzASR/uzbek (base) | ~1,54 B | Fragmentos de 30 s | Uzbeko | MIT | Hugging Face |
| whisper-large-v3 (OpenAI) | ~1,55 B | Fragmentos de 30 s | Multilingüe | MIT (según repositorio original) | Hugging Face |

La comparación se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento comparativos entre ellos.

## Limitaciones y advertencias

- Solo está entrenado y validado para uzbeko; el rendimiento en otros idiomas no está garantizado.
- Está ajustado al dominio del USC (noticias y estilo conversacional); el WER puede aumentar en otros dominios.
- Mayor tasa de error en grabaciones con ruido, dialectos y code-switching (mezcla con ruso o inglés).
- Riesgo de alucinación inherente a los modelos Whisper: pueden generar texto plausible no presente en el audio, especialmente en silencios o audio degradado.
- Los resultados reportados (WER 24,01 %, CER 9,77 %) provienen de solo 200 muestras de validación; no hay evaluación sobre test completo ni sobre dominios externos.
- Aunque el modelo tiene licencia MIT, el dataset ISSAI USC tiene sus propias condiciones; debe revisarse antes de un uso comercial.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdulazizumaraliyev/buzzasr-uzbek-usc
- Modelo base: https://huggingface.co/BuzzASR/uzbek
- Modelo original Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
- Dataset ISSAI Uzbek Speech Corpus: https://huggingface.co/datasets/issai/Uzbek_Speech_Corpus
