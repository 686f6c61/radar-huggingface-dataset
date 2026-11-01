# doanhlt/cabin-lid-ecapa-voxlingua107-onnx

## Resumen

Cabin LID ECAPA VoxLingua107 ONNX es un modelo de identificacion de idioma hablado (spoken language identification, LID) derivado de `speechbrain/lang-id-voxlingua107-ecapa`, exportado a ONNX y cuantizado a int8 dinamico por canal. Lo publica el usuario `doanhlt` como componente del modo de interpretacion bidireccional de su aplicacion Cabin offline, una app de reconocimiento automatico del habla que funciona en dispositivo. El modelo resuelve un problema concreto: decidir cual de los dos idiomas de una sesion de interpretacion se ha hablado, de modo que solo haya que ejecutar el reconocedor correspondiente en lugar de ambos.

La arquitectura subyacente es ECAPA-TDNN, una red neuronal convolucional con atencion sobre embeddings de hablante, entrenada originalmente por SpeechBrain sobre el corpus VoxLingua107 (107 idiomas). El paquete incluye ademas `lid_fusion_params.json`, con temperaturas, umbrales y coeficientes logisticos por par de idiomas, ajustados sobre un conjunto de desarrollo disjunto de los de evaluacion. La salida del grafo ONNX son log-probabilidades sobre 107 clases, con la normalizacion de media por frase integrada en el grafo.

Es relevante ahora porque demuestra un patron de despliegue muy practico para LID en el borde: un modelo acustico pequeno, cuantizado a int8, con un front end reproducible (Fbank de 60 mel) y una capa de decision calibrada que reduce drasticamente el numero de veces que hay que lanzar un segundo ASR. El autor reporta una precision del 95,3 % en entrevistas interpretadas privadas y un 99,0 % de media en un conjunto multilingue de pares, con solo un 4,4 % de segundas ejecuciones del ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (red convolucional con atencion, exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 1,5 s para decision temprana; hasta 30 s por enunciado para decision final |
| Tipos de cuantizacion | int8 dinamico por canal (QUInt8 en pesos) |
| Idiomas soportados | 107 codigos de VoxLingua107 (segun `labels.txt`); sin cantonés (se puntua `yue` con la columna `zh`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`ecapa.int8pc.onnx`), mas `labels.txt`, `lid_fusion_params.json`, `SHA256SUMS.txt` y `FILES.tsv` |

## Arquitectura y entrenamiento

El modelo acustico es ECAPA-TDNN, la arquitectura de SpeechBrain para embeddings de hablante basada en bloques convolucionales con atencion multicabecera y agregacion estadistica. Se entrena sobre VoxLingua107 (Valk y Alumae, 2021, CC BY 4.0), un corpus de audio de YouTube etiquetado con 107 idiomas. El export a ONNX y la cuantizacion int8 son obra del autor del repositorio, bajo la misma licencia Apache-2.0. La entrada del grafo es `fbank` float32 de forma (1, T, 60) y la salida `logp` float32 de forma (1, 107), con la normalizacion de media por frase incluida dentro del grafo.

El front end debe coincidir exactamente con el de SpeechBrain: `Fbank(n_mels=60)`, audio mono a 16 kHz en [-1, 1], `torch.stft` con `n_fft=400`, `hop=160`, ventana Hamming periodica de 400 muestras, `center=True` con relleno de ceros, espectro de potencia, 60 filtros mel triangulares de 0 a 8 kHz, `10*log10(max(x, 1e-10))` y suelo en el maximo de la entrada menos 80 dB. Sin deltas ni normalizacion externa. El autor incluye un port en TypeScript (`fbank.ts`) que coincide con torch hasta 2e-3 dB; advierte que el grafo int8 amplifica esas diferencias minimas (hasta |delta log-prob| ~0,5 en 24 clips), aunque las decisiones no cambian en los conjuntos reservados (95,5 frente a 95,3 %).

La capa de decision es una cascada calibrada: a los 1,5 s del inicio de voz (enunciados de al menos 1,75 s) se calcula P(a) = sigmoid((logp[a] - logp[b]) / T_early) y, si el maximo supera tau_early, ese idioma es el tentativo. Al final del enunciado se recalcula con T_final; si no se supera tau_final, se ejecutan ambos reconocedores y se aplica la fusion logistica del par sobre [logp[a] - logp[b]] y caracteristicas de texto de ambas salidas (proporcion de silabas vietnamitas validas, etiqueta de SenseVoice, voto de palabras funcionales). Los parametros globales son T_early 2,9 y tau_early 0,73, y T_final 3,15 y tau_final 0,71. Los pares id-ms y th-lo no tienen LID automatico.

## Capacidades

- Identificacion de idioma hablado entre 107 clases de VoxLingua107 a partir de audio mono a 16 kHz.
- Decision temprana a los 1,5 s de voz para anticipar que reconocedor lanzar primero.
- Decision final por enunciado completo (hasta 30 s) con umbral calibrado.
- Fusion multimodal con salidas de ASR (caracteristicas de texto) para los pares con parametros ajustados.
- Inferencia en dispositivo: 51 ms por ventana de 1,5 s en un nucleo x86.
- Front end reproducible en Python (SpeechBrain) y en TypeScript, con vectores dorados para verificacion.
- Soporte de despliegue via onnxruntime con `CPUExecutionProvider`.
- No incluye vision, audio generativo, tool calling ni razonamiento de multiples pasos: es un clasificador de audio.

## Casos de uso

- Interpretacion bidireccional en una app movil offline: el modelo decide cual de los dos idiomas de la sesion se ha hablado y solo se ejecuta el reconocedor correspondiente, reduciendo el coste computacional en dispositivo. El autor reporta solo un 13,8 % de segundas ejecuciones del ASR en entrevistas interpretadas.
- Enrutado de ASR en produccion con presupuesto de latencia ajustado: la decision temprana a 1,5 s permite arrancar el reconocedor correcto mientras el usuario sigue hablando, con 51 ms por ventana en un nucleo x86.
- Transcripcion de entrevistas y conversaciones multilingues: la cascada con fusion logistica alcanza un 95,3 % de precision en entrevistas con cambios de idioma (170 cambios en 528 segmentos VAD).
- Filtrado previo en pipelines de subtitulado: descartar o reetiquetar segmentos cuyo idioma no coincide con el par esperado antes de invocar modelos de ASR mas caros.
- Verificacion de calidad de datasets de audio: clasificar clips por idioma con un modelo pequeno y determinista, util para auditar corpus como FLEURS, Common Voice o YODAS2.
- Prototipado de interfaces de voz en navegador o Electron: el port TypeScript del front end y el grafo ONNX permiten ejecutar LID en el cliente sin backend.
- Investigacion en code-switching: el paquete expone log-probabilidades por clase y umbrales calibrados, lo que facilita experimentar con politicas de decision sobre pares de idiomas.

## Benchmarks y rendimiento

Resultados en entrevistas interpretadas (evaluacion privada, 27 clips, 528 segmentos VAD, 170 cambios de idioma; vi-en 15 clips, vi-ko 12 clips; bootstrap por cluster al 95 %):

| Sistema | Precision % | Enunciados con cambio % | vi-en % | vi-ko % | Segunda ejecucion ASR % |
|---|---|---|---|---|---|
| Regla actual de la app (ambos ASR + reglas de texto) | 85,8 [80,0, 90,8] | 85,9 [80,6, 91,4] | 93,0 | 77,4 | 100 |
| Paquete propuesto (cascada ajustada en dev) | 95,3 [93,1, 97,3] | 95,3 [92,1, 98,4] | 94,4 | 96,3 | 13,8 |

Evaluacion multilingue por pares (YouTube conversacional y Common Voice, precision balanceada por clase, %):

| Par | Argmax ECAPA | Regla de la app | Cascada | Segunda ejecucion ASR % |
|---|---|---|---|---|
| vi-en | 98,5 | 97,8 | 99,0 | 2,9 |
| zh-en | 98,7 | 99,2 | 99,0 | 4,1 |
| ja-en | 99,3 | 99,0 | 99,2 | 3,9 |
| ko-en | 99,1 | 99,0 | 98,8 | 4,6 |
| fr-en | 97,7 | 96,7 | 99,0 | 7,3 |
| de-en | 96,6 | 97,3 | 98,4 | 9,8 |
| es-en | 97,3 | 97,1 | 98,1 | 5,4 |
| zh-vi | 98,9 | 89,3 | 99,4 | 2,4 |
| ja-vi | 100,0 | 99,0 | 99,7 | 1,2 |
| ko-vi | 99,6 | 97,4 | 99,6 | 1,9 |
| Media | 98,6 | 97,2 | 99,0 | 4,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada: no disponible; la inferencia es en CPU con onnxruntime y el grafo int8 esta pensado para ejecucion en dispositivo.
- GPU recomendadas: no aplica; el autor reporta 51 ms por ventana de 1,5 s en un nucleo x86.
- Cabe en cualquier dispositivo con CPU moderna, incluidos moviles; el benchmark en Android esta pendiente segun el autor.
- Despliegue: onnxruntime con `CPUExecutionProvider`; el front end requiere SpeechBrain (Python) o el port TypeScript incluido.
- Latencia: 51 ms por ventana de 1,5 s en x86; en movil, pendiente de medicion oficial.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cabin LID ECAPA VoxLingua107 ONNX (este) | ECAPA-TDNN int8 | 107 | Apache-2.0 | ONNX | Incluye fusion calibrada por par y front end TS |
| speechbrain/lang-id-voxlingua107-ecapa | ECAPA-TDNN | 107 | Apache-2.0 | PyTorch | Modelo base sin cuantizar ni capa de decision |
| Whisper (deteccion de idioma) | Transformer encoder-decoder | ~99 | MIT | safetensors, GGUF | Deteccion integrada en el ASR, no especializada en pares |
| MMS-LID (Meta) | Wav2Vec2 | 126 | CC-BY-NC | safetensors | Licencia no comercial |

## Limitaciones y advertencias

- Enunciados de menos de 1 s ("Good.", backchannels) degradan la decision.
- Coreano con disfluencias es un punto debil reconocido por el autor.
- Segmentos VAD que contienen dos hablantes en dos idiomas reciben una sola etiqueta.
- Turnos en un tercer idioma se fuerzan al par de la sesion.
- No hay cantonés: se puntua `yue` con la columna `zh`.
- Los pares id-ms y th-lo no tienen LID automatico.
- El grafo int8 amplifica diferencias minimas en el front end; es obligatorio replicar exactamente el Fbank de SpeechBrain.
- Riesgo de alucinacion: no aplica directamente, pero la fusion con caracteristicas de texto hereda errores del ASR.
- Sesgos: no documentados por el autor; el corpus VoxLingua107 procede de YouTube y puede estar desequilibrado por idioma.
- Estado del paquete: candidato; el benchmark en Android esta pendiente.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los corpus de ajuste (FLEURS CC BY 4.0, Common Voice 17 CC0, YODAS2 CC BY 3.0) si se redistribuyen derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/doanhlt/cabin-lid-ecapa-voxlingua107-onnx
- Modelo base: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- Dataset VoxLingua107: https://huggingface.co/datasets/TalTechNLP/VoxLingua107
- Coleccion Cabin offline ASR: https://huggingface.co/collections/doanhlt/cabin-offline-asr-on-device-distilled-from-r13x-6ade0b05eb1f2ac4e49d7cf8
- Paper de VoxLingua107 (Valk y Alumae, 2021): no disponible como enlace directo en la informacion proporcionada
- Repositorio de codigo `cabin-offline-asr`: no disponible como enlace publico en la informacion proporcionada
