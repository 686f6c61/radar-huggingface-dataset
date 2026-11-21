# darioooooo0o/malagasy-stt-300m

## Resumen

El modelo `malagasy-stt-300m` es un sistema de reconocimiento automático del habla (ASR) para malgache, desarrollado por el usuario de Hugging Face `darioooooo0o` como un ajuste fino del modelo base `aadel4/omniASR-CTC-300M-v2`, que a su vez es una conversión a `Wav2Vec2ForCTC` del modelo Omnilingual ASR CTC 300M v2 de Meta. Se distribuye bajo licencia Apache 2.0 y está pensado para reconocimiento de voz offline, tanto en servidores como en dispositivos móviles mediante un modelo ONNX cuantizado a int8 de 370 MB.

La arquitectura es un transformer CTC (Connectionist Temporal Classification) con 325.984.945 parámetros, derivado de la familia wav2vec2. El modelo se ha entrenado con aproximadamente 153 horas de audio malgache transcrito por humanos (Afrivoice), ampliadas con unas 250 horas de audio etiquetado por el propio modelo y con el corpus Omnilingual ASR de Meta que cubre el malgache plateau y diez lenguas regionales de Madagascar.

Su relevancia actual radica en que cubre una lengua de bajos recursos con un rendimiento competitivo frente a los principales modelos públicos de malgache (Flo976 y badrex) en habla limpia, y con una ventaja notable en entornos ruidosos, además de ofrecer un tamaño reducido que permite su despliegue en dispositivos móviles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer CTC (Wav2Vec2ForCTC) |
| Parámetros totales | 325.984.945 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana dependiente de la implementación) |
| Tipos de cuantización | int8 (ONNX); safetensors en precisión original |
| Idiomas soportados | mg (malgache), plt (malgache plateau) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (int8) |
| Modelo base | aadel4/omniASR-CTC-300M-v2 (Omnilingual ASR CTC 300M v2 de Meta) |
| Tamaño del repositorio | 2.7 GB |
| Tamaño del modelo int8 | 370 MB |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo es un transformer CTC de la familia wav2vec2, concretamente la conversión `Wav2Vec2ForCTC` del Omnilingual ASR CTC 300M v2 de Meta (Apache 2.0). La salida del modelo son log-probabilidades sobre las clases blank, espacio y letras malgaches, con la normalización incluida dentro del grafo ONNX. El decodificado puede hacerse de forma greedy o con beam search apoyado en modelos de lenguaje KenLM.

El entrenamiento se realizó en varias rondas. La base son 153 horas de Afrivoice Malagasy (Digital Umuganda, CC-BY-4.0) con transcripción humana y partición disjunta por hablante. La ronda 2 añadió unas 250 horas de audio Afrivoice sin transcribir, etiquetadas por el propio modelo con el LM y filtradas por confianza, más el corpus Omnilingual ASR de Meta (CC-BY-4.0, ~126 h) con aumento de velocidad, ruido y banda telefónica. La versión r5 continuó el entrenamiento únicamente con etiquetas propias del modelo (sin etiquetas de terceros) y añadió reverberación de sala simulada y ruido de fondo de hablantes del conjunto de entrenamiento.

## Capacidades

- Reconocimiento de voz a texto en malgache y malgache plateau, tanto para comandos cortos como para habla libre.
- Decodificación CTC con soporte de beam search y modelos de lenguaje KenLM (4-grama para servidor, 3-grama compacto para móvil).
- Funcionamiento offline: el modelo int8 ONNX de 370 MB permite inferencia local sin conexión.
- Despliegue en servidor (Python, ONNX Runtime) y en Android mediante el SDK del repositorio de código.
- Reconocimiento de comandos de voz con umbral de aceptación configurable (`accept = 0.29` recomendado) para reducir falsos disparos.
- Normalización de audio integrada en el grafo ONNX (entrada de audio a 16 kHz mono en float).
- Soporte de malgache y lenguas regionales de Madagascar en el entrenamiento (10 lenguas regionales del corpus Omnilingual).

## Casos de uso

- **Comandos de voz en aplicaciones móviles**: el modelo int8 de 370 MB y el decodificador on-device del SDK permiten integrar comandos de voz en apps Android sin conexión; con `accept = 0.29` logra un 81,7 % de acierto en salas reales con un 0,50 % de acciones erróneas.
- **Transcripción de audio en servidores**: con el 4-grama KenLM `mg4.binary` alcanza un 9,98 % de WER en habla limpia, adecuado para pipelines de transcripción de reuniones o contenidos en malgache.
- **Atención al cliente automatizada en malgache**: la ventana CTC y el decodificado con LM permiten transcribir consultas de usuarios para su procesamiento posterior en sistemas de soporte.
- **Subtitulado y accesibilidad**: transcripción offline de grabaciones para generar subtítulos en malgache sin depender de servicios en la nube.
- **Procesamiento de audio en entornos ruidosos**: su ventaja de 13,5 puntos de WER frente a Flo976 int8 en salas ruidosas lo hace adecuado para grabaciones de campo o entornos domésticos con ruido.
- **Investigación lingüística y preservación del malgache**: permite transcribir corpus orales y lenguas regionales de Madagascar, dado el entrenamiento con el corpus Omnilingual.
- **Integración en asistentes de voz embebidos**: el modelo compacto y el decodificador on-device permiten construir asistentes de voz locales en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados en la model card (todos con hablantes held-out):

| Prueba | Decodificado | CER | WER |
|---|---|---|---|
| Habla limpia, 693 clips | greedy | 2,83 % | 12,27 % |
| Habla limpia, 693 clips | 4-grama LM (alpha 0,7, beta 2,0) | 2,45 % | 9,98 % |
| Habla limpia, 564 clips / 26 hablantes | LM | — | 9,99 % |
| Salas ruidosas, 22 hablantes | LM | — | 29,7 % |

Comparativa en habla limpia (564 clips, WER con LM):

| Modelo | WER |
|---|---|
| Este modelo | 9,99 % |
| Flo976/w2v-bert-malagasy (fp32, 2,4 GB) | 9,91 % |
| badrex/w2v-bert-2.0-malagasy-asr | 10,00 % |

Comparativa en salas ruidosas (crops de 2-6 palabras, 22 hablantes):

| Modelo | WER |
|---|---|
| Este modelo | 29,7 % |
| Flo976 int8 (612 MB) | 43,2 % |

Comandos de voz (300 snippets, 6 conjuntos de comandos):

| Audio | Acierto | Acción errónea | Falso disparo |
|---|---|---|---|
| 8 condiciones de ruido sintético, @0.29 | 84,1 % | 0,21 % | 1,12 % |
| Salas reales (4 condiciones), @0.29 | 81,7 % | 0,50 % | 1,00 % |
| Salas reales, versión anterior @0.35 | 69,1 % | 0,75 % | 1,50 % |

Prueba en emulador Android (perfil de 3 GB de RAM): el decodificador on-device coincide con la referencia Python en 38 de 40 clips; latencia mediana de 0,79 s por comando corto en x86 emulado.

## Requisitos de hardware

- **Inferencia en servidor**: el modelo safetensors de ~326 M parámetros requiere aproximadamente 1,3 GB en fp32; el ONNX int8 ocupa 370 MB.
- **GPU recomendadas**: no se especifican en la información disponible; por tamaño, cabe en GPUs consumer como RTX 3060/4090 y en A100/H100 para despliegues de mayor throughput.
- **Consumer GPU**: sí, el modelo int8 de 370 MB cabe en cualquier GPU consumer moderna e incluso en CPU.
- **Despliegue**: ONNX Runtime (Python), SDK Android del repositorio de código; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia**: 0,79 s mediana por comando corto en emulador Android x86 (no es un teléfono ARM real).
- **Throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | WER limpio | WER ruidoso | Licencia |
|---|---|---|---|---|---|
| Este modelo (malagasy-stt-300m) | 325.984.945 | 370 MB int8 | 9,99 % | 29,7 % | Apache 2.0 |
| Flo976/w2v-bert-malagasy | no disponible | 2,4 GB fp32 / 612 MB int8 | 9,91 % | 43,2 % (int8) | no disponible |
| badrex/w2v-bert-2.0-malagasy-asr | no disponible | no disponible | 10,00 % | no disponible | no disponible |

## Limitaciones y advertencias

- **Sin prueba en teléfonos reales**: todo el audio de test son hablantes held-out con ruido y sala añadidos por software; la regla de aprobación para las primeras grabaciones reales se fijó de antemano (acción errónea <= 1,0 %, falso disparo <= 3,0 %, acierto >= 80 %).
- **Umbral de aceptación provisional**: el valor `accept = 0.29` se eligió tras una comprobación held-out que no certificó 0.30; es un valor interino hasta confirmarlo con grabaciones reales de teléfono, por lo que debe reajustarse en cada conjunto de comandos.
- **Riesgo de alucinación**: no se documenta explícitamente en la información disponible, pero es un riesgo inherente a los modelos CTC con LM.
- **Sesgos**: no se documentan sesgos conocidos en la información disponible.
- **Cobertura limitada de idiomas**: solo malgache y malgache plateau; no cubre otras lenguas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base y los corpus de entrenamiento tienen sus propias condiciones (CC-BY-4.0 en Afrivoice y Omnilingual).
- **Madurez**: es una release candidate (r5), con 0 descargas y 0 likes en Hugging Face en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darioooooo0o/malagasy-stt-300m
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-300M-v2
- Repositorio de Omnilingual ASR de Meta: https://github.com/facebookresearch/omnilingual-asr
- Corpus Afrivoice Malagasy (Digital Umuganda): no disponible
- Corpus Omnilingual ASR de Meta: no disponible
- Repositorio de código del SDK Android: no disponible (referenciado como `sdk/android` en la model card, sin URL)
