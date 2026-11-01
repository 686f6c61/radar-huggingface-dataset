# Mannon/whisper-medium-uzbek

## Resumen

whisper-medium-uzbek es un modelo de reconocimiento automático del habla (ASR) para uzbeko, obtenido mediante ajuste fino completo de openai/whisper-medium (769M parámetros) por el autor Mannon. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, ya conocida, y la especializa en un único idioma: el uzbeko en escritura latina. Resuelve el problema de la baja cobertura de Whisper en lenguas de bajos recursos, donde el modelo original rinde de forma notablemente peor que en idiomas mayoritarios.

El ajuste se realizó sobre aproximadamente 764,5 horas de audio transcrito por humanos procedente de cuatro corpus públicos: UzbekVoice, USC, Common Voice 22.0 y FLEURS. La model card reporta mejoras sustanciales frente a la variante small (244M) en los cuatro conjuntos de evaluación, con un WER de 7,69 en Common Voice 22.0 y 7,41 en FeruzaSpeech en decodificación greedy.

Es relevante ahora porque el uzbeko cuenta con pocos modelos ASR abiertos y de calidad, y este se publica con licencia Apache-2.0 sobre los pesos, un tamaño manejable (3,1 GB en safetensors) y una receta de entrenamiento documentada. No obstante, el modelo es reciente (octubre de 2026) y tiene un uso muy limitado (122 descargas, 0 likes), por lo que su validación independiente es todavía escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parámetros totales | 763.857.920 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por chunk (procesamiento de audio largo por ventanas) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones oficiales documentadas) |
| Idiomas soportados | uzbeko (uz), salida en escritura latina |
| Licencia | Apache-2.0 (pesos); cada dataset de entrenamiento conserva su propia licencia |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura estándar de Whisper medium: un transformer encoder-decoder con 769M parámetros que procesa espectrogramas log-Mel de 16 kHz en ventanas de 30 segundos y genera texto de forma autorregresiva. No introduce modificaciones arquitectónicas respecto al modelo base; la contribución es el ajuste fino completo sobre datos uzbekos.

El entrenamiento usó full fine-tuning con AdamW, learning rate 1,2e-5, weight decay 0,1, batch efectivo de 64, warmup del 10% con decaimiento lineal, hasta 10 épocas, SpecAugment y precisión fp16, sobre 2× NVIDIA V100S de 32 GB con DDP. El conjunto de datos suma aproximadamente 764,5 horas y 653.773 enunciados: UzbekVoice filtrado (≈602,8 h, 78,8%), USC (96,4 h, 12,6%), Common Voice 22.0 (55,2 h, 7,2%) y FLEURS (10,1 h, 1,3%). Se excluyeron pseudo-etiquetas, audio raspado y todos los conjuntos de test de evaluación. El checkpoint se seleccionó por WER de validación sobre una partición reservada de USC. No se documenta RLHF ni DPO, algo esperable en un modelo ASR.

## Capacidades

- Transcripción de voz a texto en uzbeko con salida en alfabeto latino.
- Procesamiento de audio largo mediante ventanas automáticas con `chunk_length_s=30`.
- Carga y remuestreo a 16 kHz directamente con librosa, sin necesidad de ffmpeg para wav/flac.
- Decodificación greedy y beam search (la model card reporta resultados con `num_beams=16`).
- Integración nativa con el pipeline `automatic-speech-recognition` de transformers (>= 4.40).
- Selección explícita de idioma y tarea mediante `generate_kwargs={"language": "uz", "task": "transcribe"}`.
- No soporta visión, audio más allá de ASR, tool calling ni razonamiento multi-paso; es un modelo ASR puro.

## Casos de uso

- Transcripción de reuniones y entrevistas en uzbeko: el modelo procesa audio largo por ventanas de 30 s y permite obtener actas o subtítulos de conversaciones multi-participante con un WER en torno al 7-10% en dominios similares a los de entrenamiento.
- Subtitulado automático de vídeo y pódcast: al ser un modelo de 769M parámetros y 3,1 GB, puede desplegarse en una GPU modesta y generar subtítulos en uzbeko latino para plataformas de contenido.
- Atención al cliente y centros de llamadas: transcripción de llamadas para análisis de calidad, búsqueda de palabras clave y generación de resúmenes posteriores, aprovechando el bajo coste de inferencia del modelo.
- Dictado y accesibilidad: integración en aplicaciones de escritura por voz para usuarios uzbekoparlantes, con salida en latín lista para publicar o editar.
- Generación de corpus y datos etiquetados: uso del modelo para pre-anotar audio nuevo que luego se revisa manualmente, acelerando la creación de datasets ASR en uzbeko.
- Investigación en lenguas de bajos recursos: punto de partida para comparativas y ajustes posteriores en uzbeko, con una receta de entrenamiento y particiones de evaluación documentadas.
- Indexación y búsqueda de archivos de audio: transcripción masiva de un archivo sonoro para permitir búsqueda por texto sobre el contenido hablado.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER en %, menor es mejor). Greedy = `num_beams=1`; beam 16 = `num_beams=16`. Los valores de la columna medium son los del modelo; los de small se incluyen como referencia del autor.

| Test set | small · greedy | small · beam 16 | medium · greedy | medium · beam 16 |
|:---|:---:|:---:|:---:|:---:|
| Parámetros | 244M | — | 769M | — |
| FLEURS | 16,96 | 16,21 | 14,11 | 13,01 |
| Common Voice 22.0 | 9,58 | 9,14 | 7,69 | 7,01 |
| USC | 11,81 | 11,22 | 9,70 | 9,10 |
| FeruzaSpeech | 7,95 | 7,31 | 7,41 | 6,96 |

Los resultados del model-index (greedy) coinciden con la tabla de la model card. No se han publicado resultados de benchmarks adicionales (por ejemplo, comparativas con otros modelos ASR uzbekos) en la información disponible. Los valores no están verificados de forma independiente (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,5-2 GB para los pesos (769M parámetros) más overhead de activaciones y buffers de audio; con cuantización a 8 bits bajaría a ~1 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó con 2× NVIDIA V100S de 32 GB, pero la inferencia es mucho más ligera.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas o CPU con latencia mayor.
- Opciones de despliegue: pipeline de transformers, vLLM (soporte ASR limitado), TGI y llama.cpp/Ollama no tienen soporte documentado para este checkpoint concreto en la información disponible.
- Latencia y throughput: no disponibles; no se publican mediciones de RTF ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | WER (Common Voice 22 uz) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mannon/whisper-medium-uzbek | 769M | 30 s por chunk | 7,69 (greedy) | Apache-2.0 | HuggingFace |
| openai/whisper-medium (base) | 769M | 30 s por chunk | no disponible en la información | Apache-2.0 | HuggingFace |
| openai/whisper-small (referencia del autor) | 244M | 30 s por chunk | 9,58 (greedy) | Apache-2.0 | HuggingFace |
| Otros ASR uzbekos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los datos aportados por el autor; no hay cifras publicadas de otros modelos ASR específicos para uzbeko en la información disponible.

## Limitaciones y advertencias

- El modelo es más débil en habla enciclopédica con entidades nombradas poco frecuentes, según reconoce el autor.
- Cobertura reducida de audio ruidoso, de campo lejano y de variantes dialectales.
- La salida en cirílico no es un objetivo del modelo; solo se garantiza escritura latina.
- Riesgo de alucinación y de errores en nombres propios, cifras y términos técnicos, inherente a los modelos ASR.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente; el modelo tiene muy pocas descargas y ningún like, por lo que la validación comunitaria es mínima.
- Licencia Apache-2.0 para los pesos, pero los datasets de entrenamiento conservan sus licencias (CC0-1.0, CC-BY-4.0, Apache-2.0); el uso comercial debe respetar la atribución de USC y FLEURS.
- No se documentan sesgos específicos más allá de la cobertura limitada de dialectos y audio ruidoso.
- El modelo es de octubre de 2026 y su ecosistema de herramientas (cuantizaciones, soporte en runtimes alternativos) es todavía incipiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mannon/whisper-medium-uzbek
- Modelo base: https://huggingface.co/openai/whisper-medium
- Paper de Whisper: https://arxiv.org/abs/2205.12446
- Common Voice: https://commonvoice.mozilla.org/en
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Uzbek Speech Corpus (USC): https://huggingface.co/datasets/issai/uzbek_speech_corpus
- UzbekVoice: https://corpus.uzbekvoice.ai
- Paper de USC (SPECOM 2021): https://doi.org/10.1007/978-3-030-87802-3_40
- Normalizador de texto uzbeko: https://pypi.org/project/uzbek-text-norm/
