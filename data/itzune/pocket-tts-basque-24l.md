# itzune/pocket-tts-basque-24l

## Resumen

Pocket TTS Basque 24L es un modelo de síntesis de voz en euskera desarrollado por itzune mediante fine-tuning de Pocket TTS de Kyutai. La variante de 24 capas, con 336.068.290 parámetros, se entrenó con la receta oficial para nuevos idiomas sobre el dataset BSSD, formado por unas 450 horas de voz sintética en euskera y más de 2.400 voces. Su función principal es generar audio a 24 kHz y permitir clonación de voz zero-shot a partir de un clip de referencia de 5-10 segundos.

No es un modelo de lenguaje ni un sistema de contexto largo: es un TTS condicionado por texto y por un prompt de audio, por lo que la ventana de contexto no aplica. La calidad depende de la normalización del texto, de la limpieza del clip de referencia y de la voz elegida. El modelo se presenta como el "teacher" de 24 capas; para inferencia en CPU en tiempo real existe una variante destilada de 6 capas.

Su relevancia está en cubrir euskera, un idioma de bajos recursos, con clonación de voz y una evaluación publicada con dos sistemas ASR independientes. La licencia de los pesos es CC-BY-4.0, lo que permite uso comercial con atribución, aunque el dataset de origen es CC-BY-SA-4.0 y conviene revisar las obligaciones asociadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pocket TTS de Kyutai, 24 capas, condicionado por prompt de audio; topología interna completa no disponible |
| Parámetros totales | 336.068.290 (≈336 M) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No aplica / no disponible: TTS condicionado por texto y clip de referencia, no un LLM de contexto largo |
| Tipos de cuantización | No se indican cuantizaciones oficiales; pesos en safetensors. La variante de 6 capas está orientada a CPU |
| Idiomas soportados | Euskera (eu) únicamente; palabras en español, francés o inglés se leen con fonética vasca |
| Licencia | CC-BY-4.0 para los pesos; dataset BSSD: CC-BY-SA-4.0 |
| Formato de pesos | safetensors; configuración YAML (`basque_24l.yaml`); tokenizer SentencePiece de 4.000 tokens |
| Frecuencia de muestreo | 24 kHz |
| Voces | Clonación zero-shot desde un clip de 5-10 s; en evaluación, 8 voces nombradas y 5 voces no vistas |

## Arquitectura y entrenamiento

El modelo parte del Pocket TTS inglés de Kyutai, en su variante de 24 capas, y reinicializa el embedding de texto para adaptarlo al nuevo tokenizador. La información disponible no detalla la topología interna completa —por ejemplo, el tipo exacto de decoder, el codec de audio o el mecanismo de atención—, más allá de que se trata de un modelo TTS de 24 capas condicionado por un prompt de audio. El tokenizador es SentencePiece con 4.000 tokens, entrenado sobre las transcripciones del dataset BSSD.

El entrenamiento siguió la receta oficial `finetune_language`, con learning rate 2e-4, batch efectivo de 64 y dropout de classifier-free guidance igual que el modelo original. Se usó el split de entrenamiento de BSSD: aproximadamente 350.000 enunciados, 450 horas de voz sintética en euskera, más de 2.400 voces y alineamientos a nivel de palabra obtenidos con `deepdml/wav2vec2-large-xls-r-300m-basque`. Los pesos publicados son los pesos EMA en el paso 40.000, seleccionados entre los checkpoints de 40.000 a 80.000 por la evaluación, ya que los checkpoints posteriores mostraban una tasa de fallos mayor en voces no vistas. No se menciona el uso de RLHF o DPO; el proceso descrito es un fine-tuning supervisado.

## Capacidades

- Generación de voz en euskera a 24 kHz con prosodia natural y lectura de texto estándar.
- Clonación de voz zero-shot a partir de un clip de referencia de 5-10 segundos de audio limpio en euskera.
- Condicionamiento por prompt de audio: la voz de referencia define el timbre y el estilo de la locución.
- Evaluación con 8 voces nombradas del dataset y 5 voces no vistas, con métricas de WER, UTMOS y similitud de hablante.
- Lectura de texto normalizado: números, fechas, abreviaturas y símbolos deben escribirse con palabras; el normalizador de BSSD (`bssd.text_norm`) realiza esta tarea para euskera estándar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada como un modelo multimodal; es un TTS, no un LLM.
- No es multilingüe: solo euskera. El code-switching con español, francés o inglés se pronuncia con fonética vasca.

## Casos de uso

- Lectura de contenidos en euskera para accesibilidad: artículos, documentos administrativos o materiales educativos pueden convertirse a audio con una voz concreta, usando un clip de referencia autorizado y revisando la normalización de cifras y fechas.
- Audiolibros y pódcasts en euskera: clonación de la voz del locutor con consentimiento para generar capítulos completos por fragmentos, con revisión manual de las frases con mayor riesgo de fallo.
- Localización y doblaje de vídeos al euskera: generación de pistas de voz a partir del guion traducido, utilizando clips de actores o locutores cuyos derechos permitan la clonación.
- Sistemas de atención telefónica e IVR en euskera: respuestas dinámicas para menús, avisos y consultas frecuentes; para tiempo real en CPU conviene usar la variante destilada de 6 capas, y para la versión de 24 capas se recomienda GPU.
- Educación y aprendizaje de euskera: creación de ejercicios de pronunciación, dictados y materiales escolares con distintas voces, útil para exponer al alumnado a variedades y timbres diversos.
- Audio-guías y experiencias museísticas: generación de locuciones en euskera para salas, exposiciones o visitas autoguiadas, con voces clonadas de actores con derechos y revisión de calidad por fragmentos.
- Investigación en TTS para lenguas de bajos recursos: uso como modelo "teacher" de 24 capas para experimentos de fine-tuning, evaluación con ASR y destilación hacia modelos más ligeros.

## Benchmarks y rendimiento

Evaluación sobre frases de test retenidas de BSSD, 40 frases por voz, con dos sistemas ASR independientes de euskera (`xezpeleta/whisper-large-v3-eu` y `HiTZ/stt_eu_conformer_transducer_large_v2`), UTMOS para naturalidad y similitud de hablante WavLM respecto al clip de referencia.

| Voces | WER (Whisper) | WER (Conformer) | Tasa de fallos | WER sin fallos | UTMOS | Similitud de hablante |
|---|---:|---:|---:|---:|---:|---:|
| 8 prompts nombrados (voces por defecto del dataset) | 0,095 | 0,091 | 5,3 % | 0,042 | 3,59 | 0,958 |
| 5 voces no vistas | 0,073 | 0,069 | 3,5 % | 0,033 | 3,61 | 0,961 |

La frase mediana se lee sin errores. Los "fallos" son frases con WER > 0,5; en casi todos los casos el modelo continúa el habla del clip de referencia en lugar de leer el texto de entrada, un modo de fallo conocido de los modelos condicionados por prompt. La tasa varía según la voz: en las pruebas del autor va del 0 % a aproximadamente el 20 % por voz.

## Requisitos de hardware

- VRAM estimada para los pesos: 336 M de parámetros suponen aproximadamente 1,34 GB en fp32, 0,67 GB en fp16/bf16 y 0,34 GB en int8. Hay que sumar activaciones, buffers de audio y overhead del runtime.
- GPU recomendadas: por tamaño, el modelo cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB; para servir varios usuarios o lotes grandes, A100 o H100.
- ¿Cabe en GPU de consumo? Sí, en principio en GPUs con 4 GB o más para fp16; no hay cifras oficiales de VRAM ni de latencia.
- CPU: la variante de 24 capas no está pensada para tiempo real en CPU; para ese escenario el autor recomienda la variante destilada de 6 capas.
- Opciones de despliegue: librería `pocket-tts` con CLI (`uvx pocket-tts generate`) y API Python (`TTSModel.load_model`, `get_state_for_audio_prompt`, `generate_audio`). No se indica soporte para vLLM, TGI, llama.cpp u Ollama, que están orientados a LLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pocket TTS Basque 24L | 336.068.290 | No aplica (TTS) | WER 0,073-0,095; UTMOS 3,59-3,61; similitud 0,958-0,961 | CC-BY-4.0 | HuggingFace |
| Pocket TTS Basque 6 capas | No disponible | No aplica (TTS) | No disponible | No disponible en la información | HuggingFace |
| Kyutai Pocket TTS base inglés, 24 capas | No disponible | No aplica (TTS) | No disponible | CC-BY-4.0 según la model card del modelo derivado | GitHub/HuggingFace |
| Piper | No disponible | No aplica (TTS) | Comparación cualitativa en la demo, sin cifras | No disponible | Open source |

La demo del autor también incluye una comparación con OmniVoice, pero no se aportan cifras de rendimiento en la información disponible.

## Limitaciones y advertencias

- Solo euskera: palabras en español, francés o inglés se leen con fonética vasca, lo que puede ser inadecuado para textos con code-switching frecuente.
- Fallos de continuación del prompt: en aproximadamente el 3,5-5,3 % de las frases de evaluación el modelo continúa el audio de referencia en lugar de leer el texto; la tasa puede llegar al 20 % en algunas voces. Es obligatorio revisar el audio generado.
- Texto sin normalizar: números, fechas, abreviaturas y símbolos deben escribirse con palabras; si no se aplica un normalizador, la pronunciación puede ser incorrecta.
- Datos de entrenamiento sintéticos: las voces del dataset BSSD son sintéticas o resintetizadas, por lo que el modelo puede heredar artefactos del sistema "teacher" del dataset. Conviene consultar la model card de BSSD para la procedencia de voces y textos.
- Clonación de voz: solo deben clonarse voces sobre las que se tenga derecho o consentimiento explícito.
- Licencia: los pesos son CC-BY-4.0 y requieren atribución; el dataset BSSD es CC-BY-SA-4.0, con posibles obligaciones adicionales de compartir igual. Revisar el uso comercial y la atribución a Kyutai Pocket TTS y a BSSD.
- No es un modelo de lenguaje: no debe usarse para razonamiento, generación de código, tool calling ni tareas de agente.
- Riesgo de alucinación en el sentido de TTS: no aplica como en un LLM, pero sí existen errores de pronunciación, omisiones y continuaciones no solicitadas que deben detectarse con ASR o revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzune/pocket-tts-basque-24l
- Modelo hermano de 6 capas para CPU: https://huggingface.co/itzune/pocket-tts-basque
- Modelo base Kyutai Pocket TTS: https://huggingface.co/kyutai/pocket-tts
- Dataset BSSD: https://huggingface.co/datasets/itzune/bssd
- Repositorio oficial de Pocket TTS: https://github.com/kyutai-labs/pocket-tts
- Código de entrenamiento, configuraciones y evaluación: https://github.com/itzune/pocket-tts-basque
- Demo con muestras de audio y comparación con Piper y OmniVoice: https://itzune.eus/pocket-tts-basque/
- ASR Whisper large-v3 para euskera: https://huggingface.co/xezpeleta/whisper-large-v3-eu
- ASR Conformer para euskera: https://huggingface.co/HiTZ/stt_eu_conformer_transducer_large_v2
- Alineamientos wav2vec2 para euskera: https://huggingface.co/deepdml/wav2vec2-large-xls-r-300m-basque
