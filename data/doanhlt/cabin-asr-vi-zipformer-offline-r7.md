# doanhlt/cabin-asr-vi-zipformer-offline-r7

## Resumen

cabin-asr-vi-zipformer-offline-r7 es un paquete de reconocimiento automatico del habla (ASR) en vietnamita diseñado para inferencia local en la aplicacion movil Cabin, distribuido en formato ONNX y compatible con el runtime sherpa-onnx (OfflineRecognizer). Lo publica el usuario doanhlt como release candidate (r7) de una linea de modelos que parte de sherpa-vi (sherpa-onnx-zipformer-vi-int8-2025-04-20) y del checkpoint intermedio r6p rc1. El modelo resuelve el problema de transcripcion de voz offline en dispositivos, sin depender de servicios en la nube, manteniendo el mismo layout de ficheros y configuracion que el modelo al que reemplaza.

Tecnicamente es un sistema ASR de tipo Zipformer (encoder-decoder-joiner con atencion eficiente), exportado a ONNX con cuantizacion int8 en encoder y joiner, y tokenizacion BPE. Se ha entrenado por warm start desde r6p con una mezcla de 258 h de datos de la ronda 3, 69,6 h de audio de produccion en vietnamita filtrado por acuerdo con texto de nube (Soniox/Gemini) y 1,2 h de entrevistas de YouTube, con aumento de datos agresivo (ruido 0-15 dB, reverberacion, campo lejano, codec, babble offline 0-12 dB) y destilacion desde un teacher R13x (fine-tune de Qwen3-ASR).

Su relevancia es doble: por un lado, ilustra un flujo de destilacion y empaquetado para ASR en dispositivo con puertas de calidad pre-registradas (gate.json); por otro, plantea cuestiones de licencia y privacidad, ya que parte del entrenamiento usa audio de produccion y los pesos se publican por decision del propietario bajo licencia "other".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (encoder-decoder-joiner) exportado a ONNX para sherpa-onnx OfflineRecognizer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR offline por segmento; no se especifica limite de audio) |
| Tipos de cuantizacion | int8 en encoder y joiner; decoder en ONNX sin cuantizar segun nombres de fichero |
| Idiomas soportados | vietnamita (vi) segun datos de entrenamiento; no se declara lista oficial de idiomas |
| Licencia | other (publicado por decision del propietario; ver limitaciones) |
| Formato de pesos | ONNX (encoder, decoder, joiner), tokens.txt, bpe.model |

## Arquitectura y entrenamiento

El modelo sigue la familia Zipformer, una arquitectura de reconocimiento de voz end-to-end con encoder, decoder y joiner (transducer), optimizada para eficiencia computacional mediante atencion con ventanas y estructuras jerarquicas. Se distribuye en tres ficheros ONNX (encoder int8, decoder y joiner int8) junto con el vocabulario BPE (tokens.txt y bpe.model), lo que permite ejecutarlo con sherpa-onnx OfflineRecognizer en movil sin framework de deep learning adicional.

El entrenamiento parte por warm start del checkpoint r6p rc1 (doanhlt/cabin-asr-vi-zipformer-offline-r6p). Los datos combinan la mezcla de la ronda 3 (258 h), 69,6 h de audio de produccion en vietnamita seleccionado por acuerdo con texto de nube (Soniox/Gemini) como filtro de calidad, y 1,2 h de entrevistas de YouTube. Se aplica una copia aumentada fuerte (ruido 0-15 dB, reverberacion, campo lejano, codec, babble offline 0-12 dB) y MUSAN CutMix, durante 2 epocas con LR 2.5e-4. El objetivo de destilacion es el teacher R13x (fine-tune de Qwen3-ASR); el texto de nube solo actua como filtro de acuerdo, nunca como target. El checkpoint liberado corresponde a epoch-12-avg-8.

## Capacidades

- Transcripcion de voz a texto en vietnamita en modo offline, por segmentos, mediante sherpa-onnx OfflineRecognizer.
- Ejecucion en dispositivo (on-device) sin conexion a red, orientada a aplicaciones moviles.
- Robustez declarada frente a ruido (0-15 dB), reverberacion, campo lejano, artefactos de codec y babble (0-12 dB), gracias al aumento de datos.
- Tokenizacion BPE con vocabulario y modelo BPE incluidos.
- No se documentan capacidades de traduccion, diarizacion, puntuacion, marcas de tiempo ni tool calling.
- No se documentan capacidades multimodales (vision, audio mas alla de ASR) ni modo thinking.

## Casos de uso

- Transcripcion offline en aplicaciones moviles: integracion directa en la app Cabin mediante sherpa-onnx OfflineRecognizer, con el mismo layout de ficheros que el modelo anterior, lo que simplifica la sustitucion sin cambios de configuracion.
- Notas de voz y dictado en vietnamita sin conexion: el modelo procesa audio localmente, evitando enviar grabaciones a servicios en la nube y reduciendo latencia de red.
- Subtitulado diferido de entrevistas y contenido hablado: entrenado en parte con entrevistas de YouTube en vietnamita, puede emplearse para generar transcripciones de material grabado en condiciones variables.
- Procesamiento por lotes de archivos de audio en servidores ligeros: al ser ONNX int8, puede ejecutarse en CPU sin GPU dedicada para pipelines de transcripcion masiva.
- Evaluacion de calidad ASR en entornos ruidosos: el aumento con ruido, reverb y campo lejano lo hace util para probar robustez en escenarios de movilidad.
- Base para destilacion o fine-tuning posterior: al publicarse pesos y vocabulario, sirve como punto de partida (warm start) para nuevos checkpoints en vietnamita.
- Investigacion sobre destilacion ASR: el uso de un teacher Qwen3-ASR fine-tuneado y filtros de acuerdo con texto de nube documenta un flujo reproducible de generacion de etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor incluye un resumen de puertas de calidad (gate.json) con criterios binarios, no con cifras de WER/CER:

| Criterio | Resultado |
|---|---|
| A1_stress_better | true |
| A2_prod_not_worse | true |
| A2_empty_ok | true |
| A3_tests_not_worse | true |
| A3_fleurs_le_10.22 | true |
| A4_interviews_all_not_worse | true |
| A4_interviews_agree_not_worse | true |

El criterio A3_fleurs_le_10.22 sugiere un umbral de WER/CER de 10,22 en FLEURS, pero no se especifica la metrica exacta ni el valor obtenido. No se dispone de comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser ONNX int8 y orientado a movil, el consumo de memoria es reducido, pero no se publican cifras.
- GPU recomendadas: no aplica necesariamente; el modelo esta pensado para CPU y dispositivos moviles. No se documentan requisitos de GPU (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no se especifica; por tamano de repo (0,1 GB) y cuantizacion int8, es plausible su ejecucion en CPU, pero no hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: sherpa-onnx (OfflineRecognizer) es el runtime previsto; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cabin-asr-vi-zipformer-offline-r7 | Zipformer (transducer) ONNX int8 | no disponible | vietnamita | other | ONNX + BPE |
| sherpa-onnx-zipformer-vi-int8-2025-04-20 | Zipformer (transducer) ONNX int8 | no disponible | vietnamita | no disponible | ONNX |
| doanhlt/cabin-asr-vi-zipformer-offline-r6p | Zipformer (transducer) ONNX int8 | no disponible | vietnamita | no disponible | ONNX |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la comparacion se limita a arquitectura, formato y linaje (r7 parte de r6p, que a su vez parte de sherpa-vi).

## Limitaciones y advertencias

- Licencia "other": las condiciones exactas de uso comercial no estan detalladas en la informacion disponible; es necesario consultar al autor antes de un uso en produccion.
- Privacidad: el modelo se entreno en parte con audio de produccion de Cabin bajo decisiones del propietario (2026-11-01 / 2026-11-17); aunque el autor afirma que no hay audio, transcripciones ni identificadores de usuarios en el repositorio, el origen de los datos exige cautela en entornos regulados.
- Estado release candidate: la puerta de dispositivo (device gate) sigue abierta segun docs/RELEASE_DECISION_MATRIX.md; el cambio a produccion es decision del propietario, no una validacion completa publica.
- Idioma: solo se documenta vietnamita; no hay lista oficial de idiomas soportados ni evaluacion multilingue.
- Riesgo de alusion: como todo modelo ASR, puede producir transcripciones incorrectas en audio con ruido extremo, acentos no representados o vocabulario tecnico; no se publican tasas de error absolutas.
- Sin datos de sesgo: no se documentan evaluaciones de sesgo por genero, edad o dialecto.
- Sin soporte declarado de puntuacion, mayusculas, marcas de tiempo o diarizacion; la salida es texto reconocido segun el vocabulario BPE.
- Compatibilidad limitada al ecosistema sherpa-onnx; no se garantiza su uso con otros runtimes sin conversion.

## Enlaces

- Hugging Face: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-offline-r7
- Modelo base intermedio: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-offline-r6p
- Modelo previo de referencia (sherpa-vi): sherpa-onnx-zipformer-vi-int8-2025-04-20 (no se proporciona URL directa en la informacion disponible)
- sherpa-onnx (runtime): no se proporciona URL en la informacion disponible
- gate.json y docs/RELEASE_DECISION_MATRIX.md: referenciados en la model card, sin URL publica en la informacion disponible
