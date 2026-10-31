# atasoglu/seda-v0.2-tiny

## Resumen

seda-v0.2-tiny es un modelo de reconocimiento automatico de voz (ASR) en turco, desarrollado por atasoglu y publicado en HuggingFace. Se trata de una version reducida (15 veces mas pequena) de seda-v0.2, obtenida mediante destilacion de conocimiento (knowledge distillation) desde el modelo maestro. Su arquitectura es un transductor Zipformer2 con 4,5 millones de parametros, exportado a ONNX int8 para ejecutarse con sherpa-onnx, y el modelo acustico ocupa unos 7 MB.

Su propuesta de valor es clara: ofrecer transcripcion en streaming con precision comparable a Whisper small en turco, pero con 50 veces menos parametros, de modo que pueda funcionar en CPUs lentas, moviles e incluso en el navegador (via WASM). Es relevante para desarrolladores que necesitan ASR en el dispositivo, con latencia baja y sin dependencia de la nube, en escenarios donde el coste computacional y el tamano del modelo son restricciones criticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 encoder + decoder sin estado + joiner (RNN-T podado), causal, entrenado con chunks dinamicos |
| Parametros totales | 4,49M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo acustico; chunks configurables de 0,16 s a 20,48 s en modo accurate) |
| Tipos de cuantizacion | int8 dinamica (ONNX) |
| Idiomas soportados | turco (tr) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (sherpa-onnx, transductor streaming) |

## Arquitectura y entrenamiento

El modelo combina un encoder Zipformer2 (6 pilas con capas 1,1,2,2,1,1, dimension 128, feedforward 256 y 4 cabezas de atencion) con un decoder sin estado y un joiner en un esquema RNN-T podado. Es un modelo causal entrenado con chunks dinamicos, lo que le permite funcionar en modo streaming con distintos tamanos de chunk. La entrada es un fbank log-mel de 80 dimensiones a 16 kHz mono (otras frecuencias se remuestrean) y la salida son 500 tokens BPE, identicos a los del modelo maestro seda-v0.2.

El entrenamiento se realizo mediante destilacion de conocimiento desde seda-v0.2 (66M de parametros). Los datos de entrenamiento provienen de varios conjuntos publicos: issai/Turkish_Speech_Corpus, alania-synthetic-speech-tr, commonvoice_17_tr_fixed, espnet/yodas2 y yodas-tr-whisper-labels. El sistema completo incluye un modelo de lenguaje (configuracion modified_beam_search, lm_scale=0.6, lodr_scale=-0.5), un detector de actividad de voz (VAD) y un formateador de texto heredados de seda-v0.2, compatibles con todos los modos de sedalib.

## Capacidades

- Transcripcion automatica de voz en turco, en modo streaming y offline
- Tres modos de decodificacion: `fast` (chunks de 0,64 s, greedy), `balanced` (chunks de 1,28 s, beam 4 + LM) y `accurate` (decodificacion en vivo seguida de una segunda pasada con contexto completo)
- Chunks configurables desde 0,16 s hasta 1,28 s para ajustar latencia frente a precision
- Deteccion de puntos finales (endpointing) para segmentar emisiones en audio en vivo
- Salida en forma hablada en minusculas, sin puntuacion; los numeros se transcriben como palabras
- Formateador de texto opcional (puntuacion, mayusculas y digitos) mediante sedalib con el extra `[format]`
- Integracion directa con sherpa-onnx (`sherpa_onnx.OnlineRecognizer.from_transducer`) y con la libreria sedalib
- Ejecucion en navegador via WASM y en moviles de gama baja

No soporta vision, audio generativo ni tool calling; es un modelo de ASR especializado.

## Casos de uso

- Transcripcion en vivo en el navegador: mediante sherpa-onnx WASM puede ejecutarse en una unica hebra de un movil Android de gama baja a 0,77x tiempo real con chunks de 0,64 s y beam search, ideal para dictado web sin servidor
- Subtitulado en directo de emisiones o videollamadas: el modo streaming con chunks de 0,32-0,64 s ofrece texto parcial con baja latencia y deteccion de puntos finales para segmentar frases
- Aplicaciones moviles offline: con solo 7 MB el modelo acustico (27 MB con el modelo de lenguaje), cabe facilmente en apps Android o iOS sin descargar modelos de cientos de MB
- Dispositivos embebidos y CPUs lentas: su tamano de 4,5M de parametros y su cuantizacion int8 lo hacen viable donde Whisper small no cabe ni en tiempo ni en memoria
- Transcripcion por lotes de grabaciones: el modo `accurate` aplica una segunda pasada con contexto completo (chunk de 20,48 s) para obtener la mejor WER en ficheros de audio ya existentes
- Sistemas de voz interactivos (IVR, asistentes): la salida en forma hablada y el endpointing facilitan la integracion en pipelines de dialogo por voz en turco
- Postprocesado con puntuacion y numeros: instalando `sedalib[format]` se obtiene texto con puntuacion, mayusculas y digitos convertidos, listo para presentacion al usuario

## Benchmarks y rendimiento

Resultados declarados por el autor (WER %, menor es mejor). Whisper small se ejecuto con faster-whisper en GPU y decodifica grabaciones completas offline; seda-v0.1 en su configuracion publicada (chunks de 0,64 s, beam 4 + LM).

| Test set | Whisper small (244M) | seda-v0.1 (66M) | seda-v0.2-tiny (4,5M) `balanced` | seda-v0.2-tiny `accurate` | seda-v0.2 (66M) `accurate` |
|---|---|---|---|---|---|
| FLEURS-TR test (743 utterances) | 11,87 | 11,60 | 11,24 | **10,51** | 6,38 |
| MediaSpeech TR (broadcast, 10 h) | 23,25 | 17,50 | **16,88** | no disponible | 11,27 |

Otros test sets con chunks de 0,64 s:

| Test set | Greedy | Beam 4 + LM | seda-v0.2 (profesor), greedy |
|---|---|---|---|
| Khan Academy TR test | 14,61 | 11,63 | 8,72 |
| ISSAI TSC test | 23,33 | 20,68 | 14,86 |

Por modo y tamano de chunk (FLEURS test, int8 en CPU):

| Modo / chunk | Decodificacion | WER |
|---|---|---|
| `fast` (0,64 s) | greedy | 17,30 |
| `balanced` (1,28 s) | beam 4 + LM | 11,24 |
| `accurate` | segunda pasada con contexto completo | 10,51 |
| 0,16 s (`c8/`) | greedy / beam 4 + LM | 21,08 / 13,99 |
| 0,32 s (`c16/`) | greedy / beam 4 + LM | 19,20 / 12,85 |
| 0,64 s (`c32/`) | greedy / beam 4 + LM | 17,30 / 11,67 |
| 1,28 s (raiz) | greedy / beam 4 + LM | 16,50 / 11,24 |

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para ejecutarse en CPU. El modelo acustico ocupa unos 7 MB en int8 (unos 27 MB incluyendo el modelo de lenguaje de 20 MB)
- GPU recomendadas: no necesarias; si se dispone de una, cualquier GPU moderna acelera el preprocesado, pero el objetivo de diseno es CPU puro
- Consumer GPUs: no relevante; el modelo cabe en cualquier hardware, incluidos moviles de gama baja y navegadores via WASM
- Rendimiento medido: en un Android de gama baja (sherpa-onnx WASM, una hebra), chunks de 0,64 s con beam search corren a 0,77x tiempo real; chunks de 0,32 s greedy a 0,89x y chunks de 0,16 s con beam search a 1,07x (no alcanza tiempo real en ese dispositivo)
- Despliegue: sherpa-onnx (nativo, WASM y movil), sedalib 1.1 o superior (`pip install "sedalib[format]"`), o carga directa con `sherpa_onnx.OnlineRecognizer.from_transducer`
- Latencia: configurable mediante el tamano de chunk; chunks mas cortos reaccionan antes pero consumen mas CPU por segundo de audio y pierden algo de precision

## Comparativa con modelos similares

| Modelo | Parametros | WER FLEURS-TR | WER MediaSpeech TR | Streaming | Licencia |
|---|---|---|---|---|---|
| seda-v0.2-tiny | 4,5M | 10,51 (accurate) / 11,24 (balanced) | 16,88 | Si | CC-BY-SA-4.0 |
| Whisper small | 244M | 11,87 | 23,25 | No (offline) | MIT |
| seda-v0.1 | 66M | 11,60 | 17,50 | Si | no disponible |
| seda-v0.2 (profesor) | 66M | 6,38 (accurate) | 11,27 | Si | no disponible |

seda-v0.2-tiny supera a Whisper small en turco con 50 veces menos parametros y anade salida en streaming, aunque su profesor seda-v0.2 sigue siendo claramente superior (comete 1,6 veces menos errores); la regla practica del autor es usar el tiny donde el grande no cabe.

## Limitaciones y advertencias

- Solo soporta turco; no es un modelo multilingue
- La salida bruta esta en minusculas, sin puntuacion y con numeros en forma de palabras; se necesita sedalib con el extra `[format]` para obtener texto formateado
- La brecha con su profesor es notable: comete aproximadamente 1,6 veces mas errores que seda-v0.2; en conjuntos dificiles como ISSAI TSC la WER sube a 20,68 incluso con beam + LM
- En chunks muy cortos (0,16 s) la precision cae significativamente (13,99 WER con beam + LM) y en moviles de gama baja no alcanza tiempo real
- Los resultados de benchmarks no estan verificados por terceros (metricas no verificadas en el model-index)
- La licencia CC-BY-SA-4.0 exige atribucion y compartir derivados bajo la misma licencia; es mas restrictiva que MIT o Apache-2.0 para productos comerciales que incorporen el modelo
- Riesgo de alucinacion tipico de ASR: no se dispone de datos especificos sobre tasas de alucinacion; conviene validar en el dominio de destino
- Los datos de rendimiento en dispositivos lentos provienen de un unico Android de gama baja; el comportamiento en otros dispositivos puede variar

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/atasoglu/seda-v0.2-tiny
- Modelo base (profesor): https://huggingface.co/atasoglu/seda-v0.2
- Libreria sedalib: https://github.com/atasoglu/seda
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- faster-whisper (usado en la evaluacion comparativa): https://github.com/SYSTRAN/faster-whisper
- Datasets de entrenamiento: https://huggingface.co/datasets/issai/Turkish_Speech_Corpus, https://huggingface.co/datasets/espnet/yodas2
