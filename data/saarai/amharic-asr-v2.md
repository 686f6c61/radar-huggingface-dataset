# SaarAI/Amharic-ASR-v2

## Resumen

Amharic-ASR-v2 es un sistema de reconocimiento automático del habla (ASR) para amárico desarrollado por SaarAI, pensado específicamente para audio telefónico y condiciones acústicas adversas. Se trata de la segunda iteración de su pipeline ASR, que combina un modelo acústico basado en w2v-bert-2.0 con cabeza CTC (411 tokens de vocabulario en escritura ge'ez) y un modelo de lenguaje KenLM de 4-gramas de palabras entrenado sobre aproximadamente 200 millones de palabras de texto amárico, integrado mediante búsqueda por haces con pyctcdecode.

El modelo resuelve un problema concreto: el amárico cuenta con relativamente pocos recursos ASR de calidad y la mayoría de los sistemas disponibles rinden mal en canales telefónicos de banda estrecha, ruido ambiental o micrófonos lejanos. Amharic-ASR-v2 se entrena con aumento de datos orientado a canal telefónico y se evalúa en un leaderboard propio de nueve conjuntos de test que incluye condiciones como VoLTE, 2G con pérdida de paquetes y entornos ruidosos.

Con 606 millones de parámetros y un peso de repositorio de 3,1 GB, el modelo es ligero para los estándares actuales y puede desplegarse en GPU de consumo. Alcanza un WER medio del 27,15% con LM en el leaderboard de SaarAI, mejorando el 28,19% de la versión v1 y superando a alternativas como `snapwre/hohe-asr-amharic` (29,02%) y `addisai/addis-scribe-streaming` (31,62%) en la media agregada, aunque pierde frente a ellas en audio limpio y code-switching respectivamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | w2v-bert-2.0 encoder + 1 capa adaptadora + cabeza CTC (411 tokens) + KenLM 4-gramas en beam search |
| Parámetros totales | 606.099.675 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en ventanas; soporta chunking con `chunk_length_s=20`, `stride_length_s=4`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | am (amárico, escritura ge'ez) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema tiene dos componentes. El modelo acústico parte de `SaarAI/03082026-135002-01-aug-full-data`, un w2v-bert-2.0 de 600M parámetros con cabeza CTC, y se afina durante aproximadamente 5 épocas adicionales sobre unas 203.000 emisiones amáricas (1.188 horas) con un aumento de datos más agresivo orientado a canal telefónico. La entrada es audio mono a 16 kHz y la salida es texto amárico en minúsculas y sin puntuación, con un vocabulario de 411 caracteres idéntico al de v1, lo que permite reutilizar el modelo de lenguaje sin cambios.

El decodificador combina la salida CTC con un KenLM de 4-gramas de palabras (aproximadamente 200 millones de palabras de texto amárico, 613 MB) mediante pyctcdecode en búsqueda por haces con `alpha=0.5`, `beta=1.5` y beam 100. Los datos de entrenamiento provienen de múltiples fuentes: WaxalNLP, el corpus BDU, Common Voice amárico, los conjuntos dialectales de leyu-amharic (Gonder, Wello, Gojjam, Shewa), snapwre/amharic-speech, y texto de FineWeb-2 y Wikipedia para el LM. No se documenta en la información disponible el uso de RLHF ni DPO, algo esperable en un sistema CTC puro.

## Capacidades

- Transcripción de voz a texto en amárico (escritura ge'ez) desde audio mono a 16 kHz.
- Decodificación con y sin modelo de lenguaje: sin LM para máxima velocidad, con LM para mayor precisión en audio ruidoso y telefónico.
- Procesamiento de audio largo mediante chunking con solapamiento (`chunk_length_s`, `stride_length_s`).
- Robustez específica en canales telefónicos: VoLTE de banda ancha, 2G de banda estrecha con pérdida de paquetes, micrófono lejano y entornos ruidosos.
- Salida en minúsculas y sin puntuación (requiere post-procesado si se necesita formato).
- No soporta tool calling, function calling, agentes, visión ni audio multimodal; es un modelo ASR puro.
- No soporta otros idiomas distintos del amárico; el code-switching amárico-inglés se transcribe con WER elevado (42,64%).

## Casos de uso

- Transcripción de llamadas de atención al cliente en amárico: el modelo está entrenado con aumento de canal telefónico y rinde mejor que v1 en VoLTE (24,05% WER) y 2G con pérdida de paquetes (44,64%), lo que lo hace adecuado para auditar o indexar grabaciones de call center.
- Subtitulado y transcripción de contenido audiovisual en amárico: con RTFx de ~89 con LM, puede procesar horas de audio en minutos en una GPU moderna; útil para medios, educación y archivos.
- Generación de actas y notas de reuniones en amárico: el chunking con solapamiento permite transcribir conversaciones largas de forma continua.
- Sistemas de dictado y accesibilidad para hablantes de amárico: al ser un modelo de 0,6B, puede desplegarse en servidores modestos o GPUs de consumo para aplicaciones de voz a texto en tiempo casi real.
- Investigación lingüística y dialectal: el modelo se ha afinado con corpus dialectales (Gonder, Wello, Gojjam, Shewa), lo que permite analizar variación dialectal en transcripciones.
- Preprocesado para pipelines de NLP en amárico: transcripción previa a análisis de sentimiento, resumen o búsqueda semántica sobre audio.
- Evaluación comparativa de ASR de bajo recurso: sirve como baseline reproducible en el leaderboard de SaarAI para nuevos modelos amáricos.

## Benchmarks y rendimiento

Resultados del leaderboard de SaarAI (WER, menor es mejor). v2 + LM usa `alpha=0.5`, `beta=1.5`, beam 100.

| Test set | badrex/Ethio-ASR-amharic | addisai/addis-scribe-streaming | snapwre/hohe-asr-amharic (+ LM) | v1 (+ LM) | v2 (sin LM) | v2 (+ LM) |
|---|---|---|---|---|---|---|
| waxal_amh (lectura, test) | 23,82% | 25,68% | 22,34% | 25,10% | **22,05%** | 22,94% |
| TeleASR: estudio limpio | 38,64% | 22,93% | **19,24%** | 21,93% | 20,59% | 20,85% |
| TeleASR: ruido ambiental | 40,89% | 22,94% | **21,09%** | 21,42% | 21,88% | 21,31% |
| TeleASR: micrófono lejano | 38,69% | 20,76% | **19,25%** | 22,30% | 20,58% | 20,69% |
| TeleASR: entorno severo | 44,40% | 26,16% | 23,60% | 23,79% | 23,97% | **22,94%** |
| TeleASR: VoLTE | 47,53% | 30,36% | 26,15% | 24,38% | 25,76% | **24,05%** |
| TeleASR: canal aleatorio | 48,97% | 31,84% | 27,97% | 24,83% | 26,43% | **24,27%** |
| TeleASR: 2G + pérdida paquetes | 77,59% | 66,31% | 62,93% | 48,20% | 50,12% | **44,64%** |
| afriswitch_amh (code-switching) | 48,28% | **37,64%** | 38,63% | 41,78% | 41,85% | 42,64% |
| **Media (9 test sets)** | 45,42% | 31,62% | 29,02% | 28,19% | 28,14% | **27,15%** |

Resultados en dev sets durante entrenamiento (decodificación sin LM, referencias con puntuación):

| Dev set | Emisiones | WER | CER |
|---|---|---|---|
| WaxalNLP amh validation | 2.912 | 23,74% | 7,74% |
| FLEURS `am_et` validation | 223 | 21,70% | 5,06% |

Velocidad: RTFx ~107 sin LM y ~89 con LM (hohe + LM: ~55).

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 0,61B en safetensors (3,1 GB de repositorio, incluyendo el LM de 613 MB), la inferencia en fp16 requiere aproximadamente 1,5-2 GB de VRAM para los pesos, más overhead de activaciones y del decodificador KenLM en CPU.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3060/4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo es lo bastante pequeño para ejecutarse en GPUs de consumo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")` o `AutoModelForCTC` + `Wav2Vec2ProcessorWithLM`; el LM requiere `pyctcdecode` y `kenlm` (Python ≤ 3.12). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTFx ~107 sin LM y ~89 con LM, es decir, procesa aproximadamente 89-107 segundos de audio por segundo de cómputo en el hardware de referencia (no especificado). El LM añade coste de decodificación en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio (leaderboard SaarAI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaarAI/Amharic-ASR-v2 | 0,61B | no disponible | 27,15% | CC-BY-4.0 | Hugging Face |
| SaarAI/Amharic-ASR-v1 | 0,61B (aprox.) | no disponible | 28,19% | CC-BY-4.0 | Hugging Face |
| snapwre/hohe-asr-amharic | no disponible | no disponible | 29,02% | no disponible | Hugging Face |
| addisai/addis-scribe-streaming | no disponible | no disponible | 31,62% | no disponible | Hugging Face |
| badrex/Ethio-ASR-amharic | no disponible | no disponible | 45,42% | no disponible | Hugging Face |

v2 + LM lidera la media agregada y gana en los tres conjuntos de canal telefónico y en entorno severo. `snapwre/hohe-asr-amharic` es superior en audio limpio y cercano (estudio 19,24%, micrófono lejano 19,25%, ruido ambiental 21,09%) y `addisai/addis-scribe-streaming` es mejor en code-switching (37,64%).

## Limitaciones y advertencias

- El WER en 2G con pérdida de paquetes sigue siendo alto (44,64%), aunque mejora claramente a v1 (48,20%).
- El code-switching amárico-inglés es un punto débil: 42,64% WER, peor que v1 (41,78%) y muy por detrás de addisai (37,64%).
- El LM empeora ligeramente los resultados en audio limpio de lectura (WAXAL +0,9 puntos, estudio limpio +0,3) frente a la decodificación sin LM.
- Advertencia del autor sobre WAXAL: los datos de entrenamiento de v2 incluyen audio de WAXAL auto-etiquetado de 13 hablantes que también aparecen en validación y test (sin compartir emisiones), por lo que las cifras de WAXAL son algo optimistas.
- Salida sin puntuación y en minúsculas; requiere post-procesado para aplicaciones que necesiten formato.
- Solo amárico; no cubre otras lenguas etíopes.
- Riesgo de alucinación y errores en nombres propios, números y términos técnicos, habitual en sistemas CTC con LM; conviene validación humana en dominios sensibles.
- Licencia CC-BY-4.0: permite uso comercial con atribución; no se documentan restricciones adicionales, pero conviene revisar los términos de los datasets de origen (Common Voice, WaxalNLP, etc.) si se redistribuye.
- Dependencia de `kenlm` con Python ≤ 3.12 para usar el LM, lo que puede complicar despliegues en entornos modernos.
- No se documentan sesgos específicos más allá de los inherentes a los corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaarAI/Amharic-ASR-v2
- Modelo base v1: https://huggingface.co/SaarAI/Amharic-ASR-v1
- Modelo base acústico: https://huggingface.co/SaarAI/03082026-135002-01-aug-full-data
- Modelo base w2v-bert-2.0: https://huggingface.co/facebook/w2v-bert-2.0
- Modelo base Ethio-ASR-amharic: https://huggingface.co/badrex/Ethio-ASR-amharic
- KenLM: https://github.com/kpu/kenlm
- pyctcdecode: https://github.com/kensho-technologies/pyctcdecode
- Paper referenciado (arXiv 2603.23654): https://arxiv.org/abs/2603.23654
- Paper referenciado (arXiv 2610.26448): https://arxiv.org/abs/2610.26448
