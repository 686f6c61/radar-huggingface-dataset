# SaarAI/Amharic-ASR-v3

## Resumen

Amharic-ASR-v3 es un sistema de reconocimiento automático del habla (ASR) para amárico desarrollado por SaarAI, un tercer iteración que mejora sus predecesores v1 y v2. El modelo aborda el problema del reconocimiento de voz en amárico en condiciones reales, con especial énfasis en audio telefónico (canales 2G, VoLTE, ruido ambiental y micrófonos lejanos), un escenario históricamente difícil para los sistemas ASR de bajos recursos. La relevancia actual radica en que combina un modelo acústico basado en w2v-bert-2.0 con un modelo de lenguaje KenLM de 4-gramas, logrando un WER medio del 24,42% en un leaderboard de 9 conjuntos de prueba, frente al 27,15% de v2 y el 28,19% de v1.

Arquitectónicamente es un sistema híbrido de dos componentes: un encoder w2v-bert-2.0 de 600M parámetros con una capa adaptadora y una cabeza CTC de 411 tokens (vocabulario de caracteres en escritura Ge'ez), más un modelo de lenguaje KenLM de 4-gramas de palabras (~200M palabras, 613 MB) utilizado en búsqueda por haz con pyctcdecode. El modelo acústico se afina sobre aproximadamente 243.000 enunciados (1.331 horas) de amárico, incluyendo 143 horas de audio propio de SaarAI y aumentación de canal telefónico.

El modelo se publica bajo licencia CC-BY-4.0, con pesos en safetensors y compatibilidad con la librería transformers. Su enfoque en audio telefónico y su integración de un LM externo lo posicionan como una opción práctica para despliegues de transcripción de llamadas y atención al cliente en amárico, donde otros modelos como omniASR-LLM-7B o Ethio-ASR-amharic obtienen WER notablemente superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | w2v-bert-2.0 encoder + 1 capa adaptadora + cabeza CTC (411 tokens) + KenLM 4-gramas en beam search |
| Parametros totales | 606.099.675 (0,61B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; soporta chunking con `chunk_length_s=20`, `stride_length_s=4`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | amárico (`am`, escritura Ge'ez) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |
| Modelo base | SaarAI/Amharic-ASR-v2, SaarAI/Amharic-ASR-v1, badrex/Ethio-ASR-amharic, facebook/w2v-bert-2.0 |
| Entrada / salida | audio mono 16 kHz → texto amárico en minúsculas, sin puntuación |
| Modelo de lenguaje | KenLM 4-gramas de palabras (~200M palabras, 613 MB), `alpha=0.5`, `beta=1.5`, beam 100 |
| Tamano del repo | 3,1 GB |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El sistema sigue un esquema CTC clásico sobre un encoder w2v-bert-2.0 preentrenado. Sobre el encoder se añade una capa adaptadora y una cabeza CTC que proyecta a un vocabulario de 411 tokens de caracteres en escritura Ge'ez, idéntico al de v1 y v2. El modelo acústico parte de Amharic-ASR-v2 y se afina durante aproximadamente 5 épocas adicionales sobre ~243.000 enunciados de amárico (1.331 horas), de los cuales unas 143 horas son audio propio de SaarAI. Se mantiene la misma aumentación de canal telefónico que en versiones anteriores, lo que explica la mejora sostenida en los conjuntos de prueba de telefonía.

El segundo componente es un modelo de lenguaje KenLM de 4-gramas de palabras entrenado sobre ~200M palabras de texto amárico, empleado en decodificación por haz con pyctcdecode (`alpha=0.5`, `beta=1.5`, beam 100). Los datos de entrenamiento provienen de múltiples fuentes: google/WaxalNLP, chappM/amharic-bdu-asr, Ibtihal02/amharic-commonvoice-asr, los cuatro conjuntos de dialectos de leyu-amharic (Gonder, Wello, Gojjam, Shewa), snapwre/amharic-speech, HuggingFaceFW/fineweb-2 y wikimedia/wikipedia. No se especifica en la información disponible si hubo RLHF, DPO u otras técnicas de alineación, algo esperable en un modelo CTC de ASR.

## Capacidades

- Reconocimiento automático del habla en amárico a partir de audio mono de 16 kHz.
- Transcripción de audio telefónico en condiciones adversas: canal 2G con pérdida de paquetes, VoLTE de banda ancha, canal telefónico aleatorizado, ruido ambiental y micrófono lejano o de bajo volumen.
- Manejo de audio largo mediante chunking con solapamiento (`chunk_length_s=20`, `stride_length_s=4`).
- Decodificación con y sin modelo de lenguaje: la variante con LM mejora especialmente en audio telefónico y ruidoso; la variante sin LM es más rápida y gana en algunos conjuntos limpios.
- Reconocimiento de habla con cambio de código amárico-inglés (code-switching), evaluado en afriswitch_amh con 37,92% de WER.
- Salida de texto en minúsculas y sin puntuación, en escritura Ge'ez.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el modelo está específicamente ajustado para canales telefónicos (VoLTE, 2G, ruido ambiental), con WER del 18,74% en ruido ambiental y 21,46% en VoLTE, lo que permite transcribir conversaciones reales de centros de contacto en amárico.
- Análisis de calidad de redes de telecomunicaciones: con un WER del 40,61% en 2G con pérdida de paquetes, puede emplearse para monitorizar la inteligibilidad de llamadas y detectar degradación de canal.
- Subtitulado y transcripción de contenido multimedia en amárico: el chunking con solapamiento permite procesar programas largos de radio o televisión, aunque la ausencia de puntuación requiere un postprocesado.
- Generación de actas y resúmenes de reuniones: transcripción de audio de sala con micrófonos lejanos (18,08% de WER en la prueba de micrófono distante) como paso previo a un modelo de lenguaje para resumen.
- Investigación lingüística y dialectología: el modelo se ha entrenado con dialectos de Gonder, Wello, Gojjam y Shewa, lo que facilita estudios comparativos de variedades del amárico.
- Sistemas de accesibilidad y dictado: integración en aplicaciones de voz a texto para hablantes de amárico, con despliegue en GPU de consumo gracias a sus 0,61B parámetros.
- Procesamiento de corpus de voz para entrenamiento de modelos posteriores: la salida CTC puede servir para auto-etiquetar grandes volúmenes de audio amárico.

## Benchmarks y rendimiento

Resultados en el leaderboard de SaarAI (WER, menor es mejor), con el mismo pipeline y normalizador para todos los modelos:

| Conjunto de prueba | v1 (+LM) | v2 (sin LM) | v2 (+LM) | v3 (sin LM) | v3 (+LM) |
|---|---|---|---|---|---|
| waxal_amh (lectura, test) | 25,10% | 22,05% | 22,94% | 21,72% | 22,68% |
| TeleASR: estudio limpio | 21,93% | 20,59% | 20,85% | 18,09% | 18,61% |
| TeleASR: ruido ambiental | 21,42% | 21,88% | 21,31% | 19,28% | 18,74% |
| TeleASR: micrófono distante/bajo volumen | 22,30% | 20,58% | 20,69% | 18,08% | 18,23% |
| TeleASR: entorno hostil | 23,79% | 23,97% | 22,94% | 21,17% | 20,06% |
| TeleASR: VoLTE banda ancha | 24,38% | 25,76% | 24,05% | 22,67% | 21,46% |
| TeleASR: canal telefónico aleatorizado | 24,83% | 26,43% | 24,27% | 23,28% | 21,47% |
| TeleASR: 2G banda estrecha + pérdida | 48,20% | 50,12% | 44,64% | 45,54% | 40,61% |
| afriswitch_amh (code-switching) | 41,78% | 41,85% | 42,64% | 39,14% | 37,92% |
| **Media (9 conjuntos)** | 28,19% | 28,14% | 27,15% | 25,44% | **24,42%** |

Otros modelos en el mismo leaderboard (media): `snapwre/hohe-asr-amharic` 29,02%, `addisai/addis-scribe-streaming` 31,62%, `facebook/omniASR-LLM-7B` 43,48%, `badrex/Ethio-ASR-amharic` 45,42%.

Conjuntos de validación durante el entrenamiento (decodificación sin LM, referencias con puntuación):

| Conjunto | WER | CER |
|---|---|---|
| v3 validation split (WaxalNLP) | 23,26% | 7,57% |
| FLEURS am_et validation | 21,73% | 5,05% |

Velocidad: RTFx ≈ 97 sin LM y ≈ 85 con LM.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 0,61B parámetros en fp32, requiere aproximadamente 2,5 GB solo para pesos; en fp16 unos 1,3 GB. La variante con LM añade 613 MB adicionales en CPU/RAM.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. El modelo cabe holgadamente en GPU de consumo.
- Despliegue: transformers con `pipeline("automatic-speech-recognition")` o `AutoModelForCTC` + `Wav2Vec2ProcessorWithLM`; pyctcdecode y kenlm requieren Python ≤ 3.12 para la decodificación con LM. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (son motores orientados a LLM, no a CTC).
- Latencia y throughput: RTFx ≈ 97 sin LM y ≈ 85 con LM, es decir, procesa audio decenas de veces más rápido que tiempo real en el hardware de referencia del autor (no especificado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | WER medio (leaderboard SaarAI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaarAI/Amharic-ASR-v3 | 0,61B + LM 613 MB | audio 16 kHz, chunking | 24,42% (+LM) | CC-BY-4.0 | Hugging Face |
| SaarAI/Amharic-ASR-v2 | 0,61B + LM | audio 16 kHz | 27,15% (+LM) | CC-BY-4.0 | Hugging Face |
| snapwre/hohe-asr-amharic | no disponible | no disponible | 29,02% (+LM) | no disponible | Hugging Face |
| addisai/addis-scribe-streaming | no disponible | streaming | 31,62% | no disponible | Hugging Face |
| badrex/Ethio-ASR-amharic | no disponible | no disponible | 45,42% | no disponible | Hugging Face |
| facebook/omniASR-LLM-7B | 7B | no disponible | 43,48% | no disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo solo reconoce amárico; no soporta otros idiomas etíopes ni multilingüismo general, salvo el cambio de código amárico-inglés parcial.
- La salida es texto en minúsculas y sin puntuación, lo que limita su uso directo en subtitulado o publicación sin postprocesado.
- El WER en 2G con pérdida de paquetes sigue siendo alto (40,61%), por lo que la transcripción de audio muy degradado puede ser poco fiable.
- El modelo de lenguaje apenas aporta en lectura limpia e incluso empeora ligeramente los resultados en WAXAL (+1,0) y estudio limpio (+0,5); conviene elegir decodificación con o sin LM según el dominio.
- Advertencia del autor sobre WAXAL: los datos de entrenamiento incluyen audio de WAXAL auto-etiquetado de hablantes que también aparecen en el conjunto de prueba, por lo que las puntuaciones en WAXAL pueden estar infladas.
- Riesgo de alucinación y errores en nombres propios, términos técnicos y números, habitual en sistemas CTC con LM.
- Sesgos potenciales derivados de la composición del corpus (dialectos Gonder, Wello, Gojjam y Shewa, y datos de Common Voice y BDU), con posible menor cobertura de otras variedades.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a SaarAI y conservar la licencia.
- kenlm requiere Python ≤ 3.12, lo que puede condicionar entornos de producción modernos.
- No se han publicado datos sobre cuantización ni sobre despliegue en motores de inferencia de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaarAI/Amharic-ASR-v3
- Modelo base v2: https://huggingface.co/SaarAI/Amharic-ASR-v2
- Modelo base v1: https://huggingface.co/SaarAI/Amharic-ASR-v1
- Modelo base Ethio-ASR-amharic: https://huggingface.co/badrex/Ethio-ASR-amharic
- Modelo base w2v-bert-2.0: https://huggingface.co/facebook/w2v-bert-2.0
- KenLM: https://github.com/kpu/kenlm
- pyctcdecode: https://github.com/kensho-technologies/pyctcdecode
- Paper referenciado (arXiv 2603.23654): https://arxiv.org/abs/2603.23654
- Paper referenciado (arXiv 2610.26448): https://arxiv.org/abs/2610.26448
