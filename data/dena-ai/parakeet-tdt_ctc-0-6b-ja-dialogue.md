# dena-ai/parakeet-tdt_ctc-0.6b-ja-dialogue

## Resumen

Parakeet TDT-CTC 0.6B (ja) dialogue es un modelo de reconocimiento automatico del habla (ASR) para japones, desarrollado por DeNA (dena-ai) mediante fine-tuning de nvidia/parakeet-tdt_ctc-0.6b-ja. Su objetivo es mejorar el comportamiento del ASR en dialogos hablados: por un lado, devuelve cadena vacia ante audio que solo contiene ruido, evitando que un asistente conversacional responda cuando nadie ha hablado; por otro, transcribe con mayor precision habla mezclada con ruido y frases conversacionales tipicas de una interaccion oral.

La arquitectura no cambia respecto al modelo base: se trata de un FastConformer con decodificadores TDT (Token-and-Duration Transducer) y CTC, con 0,6 mil millones de parametros y pesos en formato NeMo (.nemo). El modelo esta pensado para integrarse en pipelines de ASR en tiempo real o por lotes con NVIDIA NeMo, y su licencia CC BY 4.0 permite uso comercial con atribucion.

Su relevancia actual radica en el ajuste especifico para dialogos: reduce a cero las alucinaciones sobre 40 clips de ruido puro (frente a 38 del modelo original) y baja el CER en FLEURS de 3,5 a 1,8 y en FLEURS con ruido de 3,1 a 1,7, manteniendo una precision similar en habla leida y sacrificando ligeramente el rendimiento en backchannels sinteticos y en ReazonSpeech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificadores TDT (Transducer) y CTC |
| Parametros totales | 0,6 mil millones (segun nombre del modelo; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio a 16 kHz mono) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY 4.0 |
| Formato de pesos | .nemo (NeMo); repo de 2,5 GB |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base: un encoder FastConformer combinado con decodificadores TDT y CTC, tal como indica la model card ("The architecture is unchanged, so speed and usage are the same as the original model"). No se detallan cambios estructurales ni innovaciones adicionales mas alla del fine-tuning.

El entrenamiento se realizo sobre aproximadamente 94.000 enunciados (169 horas) con cuatro componentes: backchannels sinteticos (para transcribir interjecciones como «うん。」 o «へえ。」 y frases que empiezan por ellas), Common Voice v27 (voces reales para mantener precision en frases ordinarias), FLEURS train (frases leidas) y audio solo de ruido con referencia vacia (aproximadamente el 10% de los datos, para que el modelo devuelva nada ante ruido o habla ininteligible). El habla sintetica se genero con Irodori TTS v4.1-Small con voces creadas a partir de descripciones textuales; el ruido proviene de 14 tipos de DEMAND no usados en evaluacion y de MUSAN. Se excluyeron hablantes y frases del test de Common Voice. El fine-tuning se hizo en A100 con lotes de 400 s de audio, learning rate 5e-5, bf16, 6.088 pasos (4 epocas), usando el checkpoint final tal cual.

## Capacidades

- Reconocimiento de voz en japones sobre audio de 16 kHz mono.
- Transcripcion de habla conversacional y de frases que comienzan con backchannels.
- Deteccion implicita de silencio/ruido: devuelve cadena vacia cuando solo hay ruido, lo que evita respuestas espurias en asistentes de voz.
- Mayor robustez ante ruido de fondo (cafe, metro, calle, cocina) en comparacion con el modelo base.
- Dos cabeceras de decodificacion (TDT y CTC) heredadas del modelo base; los resultados publicados usan el decodificador TDT por defecto.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Asistentes de voz y atencion al cliente automatizada: el modelo puede alimentar un pipeline de ASR en un bot conversacional japones; al devolver vacio ante ruido puro, evita que el sistema active respuestas cuando no hay habla, reduciendo falsos positivos en entornos ruidosos.
- Transcripcion de dialogos en centros de llamadas: con mejor CER en frases conversacionales (0,5 frente a 1,2 del original en el conjunto sintetico), es adecuado para generar transcripciones de interacciones telefonicas que luego se analizan con NLP.
- Subtitulado y actas de reuniones en japones: la mejora en FLEURS con ruido (1,7 frente a 3,1) lo hace util para salas con ruido ambiental moderado, siempre con revision humana.
- Interfaces de voz en dispositivos y kioscos: su tamano de 0,6B y la continuidad arquitectonica con el base permiten el mismo coste de inferencia que el original, integrable en despliegues con NeMo.
- Preprocesado de audio para pipelines de datos: usar el modelo como filtro para descartar segmentos sin habla (referencia vacia) antes de alimentar otros sistemas de analisis.
- Investigacion en ASR conversacional japones: sirve como punto de partida para fine-tuning adicional en dominios especificos, dado que la licencia CC BY 4.0 lo permite con atribucion.

## Benchmarks y rendimiento

Resultados publicados en la model card (CER de lectura en %, menor es mejor; alucinaciones = clips de solo ruido con al menos un caracter generado, sobre 40 clips; todos los datos pasan antes por Silero VAD):

| Conjunto de prueba | Enunciados | Original | Este modelo |
|---|---|---|---|
| Alucinaciones en audio solo ruido | 40 | 38 | 0 |
| Common Voice | 300 | 2,1 | 1,9 |
| FLEURS | 300 | 3,5 | 1,8 |
| ReazonSpeech (referencia) | 300 | 9,3 | 9,9 |
| Backchannels (sintetico) | 768 | 26,2 | 28,0 |
| Frases conversacionales (sintetico) | 720 | 1,2 | 0,5 |
| FLEURS con ruido (SNR 20-0 dB) | 1.700 | 3,1 | 1,7 |

No se han publicado resultados de benchmarks estandar de ASR (p. ej. WER en otros corpus) mas alla de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 0,6B de parametros, la inferencia en bf16 requeriria del orden de 1,2-2 GB solo para pesos, mas memoria de activaciones y buffers de audio (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: el fine-tuning se realizo en A100; para inferencia se puede usar cualquier GPU NVIDIA compatible con NeMo (A100, H100, L4, T4, RTX 4090, etc.).
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 0,6B, aunque no se publican requisitos oficiales.
- Opciones de despliegue: NVIDIA NeMo (restore_from con el archivo .nemo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card indica que la velocidad es la misma que la del modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | CER relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dena-ai/parakeet-tdt_ctc-0.6b-ja-dialogue | 0,6B | audio 16 kHz mono | FLEURS 1,8; ruido 1,7; 0 alucinaciones | CC BY 4.0 | Hugging Face (NeMo) |
| nvidia/parakeet-tdt_ctc-0.6b-ja (base) | 0,6B | audio 16 kHz mono | FLEURS 3,5; ruido 3,1; 38 alucinaciones | CC BY 4.0 | Hugging Face (NeMo) |
| Otros ASR japoneses (p. ej. Whisper) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se aportan datos de otros sistemas ASR japoneses en la informacion disponible.

## Limitaciones y advertencias

- Las transcripciones contienen errores; en contextos con consecuencias graves (medico, legal, contractual) debe haber revision humana.
- El rendimiento en ReazonSpeech empeora ligeramente (9,9 frente a 9,3) y en backchannels sinteticos tambien (28,0 frente a 26,2), por lo que no es la mejor opcion si el dominio principal son subtitulos de broadcast o interjecciones aisladas.
- Solo soporta japones; no se documenta multilingue.
- El modelo se evaluo con Silero VAD como preprocesado; los resultados pueden diferir sin VAD.
- Las voces sinteticas de entrenamiento se generaron a partir de descripciones textuales, no de grabaciones reales, lo que puede introducir sesgos acusticos propios del TTS.
- No se detallan sesgos especificos ni limitaciones de contexto; al ser ASR, la longitud de audio por segmento depende del pipeline.
- Licencia CC BY 4.0: permite uso comercial con atribucion; prohibido el uso que viole leyes o derechos de terceros.
- No se documentan requisitos de hardware oficiales ni cuantizaciones soportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dena-ai/parakeet-tdt_ctc-0.6b-ja-dialogue
- README en japones: https://huggingface.co/dena-ai/parakeet-tdt_ctc-0.6b-ja-dialogue/blob/main/README_JA.md
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- Blog de DeNA: https://engineering.dena.com/blog/2026/11/asr-finetuning-voice-dialogue/
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Silero VAD: https://github.com/snakers4/silero-vad
- DEMAND: https://zenodo.org/records/1227121
- MUSAN: https://www.openslr.org/17/
- Common Voice: https://commonvoice.mozilla.org/ja
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Irodori TTS: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
