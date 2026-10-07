# LakoreAI/onevoice-vega

## Resumen

OneVoice / Vega es un paquete de modelos ONNX (bundle) publicado por LakoreAI que implementa un traductor de voz a voz 100 % offline, disenado para entornos industriales con ruido y desarrollado para el reto "OneVoice AI Challenge" organizado por Saigon AI Hub y Qualcomm. No se trata de un unico modelo neuronal, sino de un motor en cascada que encadena cinco etapas: eliminacion de ruido (RNNoise), deteccion de actividad de voz (Silero VAD), reconocimiento automatico del habla (PhoWhisper-base o Whisper-small, segun idioma), traduccion automatica (Opus-MT) y sintesis de voz (Piper VITS o MMS-TTS). El repositorio contiene los artefactos `.onnx` que consume un runtime escrito en Rust a traves de ONNX Runtime o QNN.

El objetivo del sistema es la comunicacion multilingue en planta: soporta seis direcciones de traduccion entre vietnamita y ingles, chino mandarin y coreano. Se distribuye en dos formatos de dispositivo: Vega Hand, un terminal push-to-talk robustecido para conversaciones uno a uno, y Vega Air, una carga util embarcada en dron para avisos de uno a muchos. El despliegue objetivo es el SoC Qualcomm Dragonwing QCS6490 (Hexagon v68 HTP), en placas Rubik Pi 3 / RB3 Gen 2, con todas las etapas cuantizadas a INT8.

Su relevancia actual radica en el enfoque edge: el sistema completo ocupa 0,9 GB de repositorio, no requiere conectividad a la nube y ejecuta la inferencia en la NPU del dispositivo con latencias declaradas de ~49,5 ms para el encoder ASR sobre ventanas de 30 s y ~12,1 ms por token en el decoder. La licencia es mixta y depende de cada etapa, con una cuestion GPL pendiente de resolver para la distribucion comercial del componente `espeak-ng-data`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor en cascada de modelos ONNX independientes: RNNoise (denoise, integrado en el crate Rust `nnnoiseless`), Silero VAD, encoder-decoder tipo Whisper para ASR, transformer encoder-decoder Opus-MT para traduccion y VITS para TTS |
| Parametros totales | No disponible (se publican tamanos por etapa, no recuentos de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como parametro unico; la etapa ASR opera sobre ventanas de audio de 30 s y MT/TTS trabajan por segmentos |
| Tipos de cuantizacion | INT8 en encoders y decoders; "full-INT8 QNN context binaries" para la NPU |
| Idiomas soportados | Vietnamita (vi), ingles (en), chino mandarin (zh) y coreano (ko), en 6 direcciones de traduccion |
| Licencia | Mixta, `onevoice-vega-mixed` (licencia `other`): cada etapa conserva su licencia original |
| Formato de pesos | ONNX (`.onnx`), con layout `decoder_model_merged.onnx` con KV-cache para decodificacion autorregresiva greedy; `tokenizer.json` por etapa; sidecars `.onnx.json` de Piper; datos de fonemas `espeak-ng-data` |

Desglose de etapas, tamanos y licencias (segun la model card):

| Etapa | Modelo | Tamano | Licencia |
|---|---|---|---|
| VAD | Silero VAD | 2,1 MB | MIT |
| ASR (vi) | PhoWhisper-base (int8) | 22 MB enc / 51 MB dec | BSD-3-Clause |
| ASR (en/zh/ko) | Whisper-small (int8) | 88 MB enc / 149 MB dec | MIT |
| MT (vi↔en) | Opus-MT (INT8) | 45 MB enc / 78 MB dec | Apache-2.0 / CC-BY |
| TTS (vi) | Piper `vais1000-medium` (VITS) | 60 MB | CC BY 4.0 |
| TTS (en) | Piper `lessac-medium` (VITS) | 60 MB | CC BY 4.0 |
| TTS (zh) | Piper `huayan-medium` (VITS) | 60 MB | CC BY 4.0 |
| TTS (ko) | MMS-TTS Korean (VITS) | 109 MB | MIT |
| Datos de runtime TTS | `espeak-ng-data` (fonemas Piper) | 19 MB | GPL-3.0 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline cascado, no un modelo unico. Cada etapa se exporta a ONNX de forma independiente y se carga desde un runtime en Rust: primero RNNoise elimina el ruido de fondo (sus pesos estan compilados dentro del crate `nnnoiseless`, por lo que no hay fichero de modelo), despues Silero VAD segmenta el habla, a continuacion el ASR transcribe (PhoWhisper-base cuando la entrada es vietnamita y Whisper-small para en/zh/ko) y finalmente Opus-MT traduce y un modelo VITS sintetiza la voz de salida. Los encoders y decoders emplean el layout ONNX de decoder fusionado con cache KV (`decoder_model_merged.onnx`) para decodificacion autorregresiva greedy. No se documenta en la informacion disponible el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO: el repositorio redistribuye pesos ya entrenados por terceros (VinAI/huuquyet, OpenAI, Helsinki-NLP, rhasspy, Meta y Silero) y anade el trabajo de exportacion, cuantizacion INT8 y empaquetado para QNN.

La innovacion tecnica del paquete no esta en el entrenamiento, sino en la integracion para edge: todas las etapas se cuantizan a INT8 y se compilan como context binaries de QNN para el Hexagon v68 HTP del QCS6490, con el objetivo de que la cadena completa funcione sin nube en un dispositivo embebido. Cada directorio de etapa incluye un `MANIFEST.md` con el checkpoint de origen, la fecha de exportacion, el esquema de cuantizacion y las metricas de evaluacion. El repositorio senala que la ruta de TTS coreana (MMS-TTS, MIT) evita por completo `espeak-ng-data`, mientras que las rutas de vietnamita, ingles y chino dependen de las tablas de fonemas de Piper, que son GPL-3.0.

## Capacidades

- Traduccion de voz a voz extremo a extremo, totalmente offline, en seis direcciones: vietnamita ↔ ingles, vietnamita ↔ chino mandarin y vietnamita ↔ coreano.
- Reconocimiento automatico del habla en vietnamita mediante PhoWhisper-base y en ingles, chino y coreano mediante Whisper-small.
- Deteccion de actividad de voz (Silero VAD) para segmentar el habla y evitar procesar silencio o ruido.
- Supresion de ruido previa a la transcripcion (RNNoise), orientada explicitamente a entornos industriales ruidosos.
- Sintesis de voz multilingue con voces Piper para vi/en/zh y MMS-TTS para coreano.
- Traduccion automatica de texto VI↔EN con Opus-MT, con un mecanismo declarado de "industrial glossary enforcement" (imposicion de un glosario de terminos industriales) evaluado en el conjunto interno "OneVoice industrial glossary carrier set".
- Ejecucion en NPU (Hexagon v68 HTP) con binarios INT8 de QNN, ademas de ejecucion en CPU.
- Modos de operacion push-to-talk (Vega Hand, uno a uno) y difusion desde dron (Vega Air, uno a muchos).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio mas alla del propio pipeline de voz.

## Casos de uso

- Comunicacion push-to-talk en planta industrial ruidosa: un operario vietnamita y un supervisor angloparlante pueden hablar por turnos con el terminal Vega Hand; el sistema encadena denoise, VAD, ASR vi, MT vi→en y TTS en, y esta disenado para funcionar con ruido de maquinaria gracias a RNNoise.
- Avisos de uno a muchos desde dron: el payload Vega Air puede emitir consignas traducidas sobre una zona de obra, apoyandose en la misma cascada pero con una unica direccion de traduccion fija y salida TTS amplificada.
- Coordinacion con equipos de proveedores coreanos: la direccion vi↔ko se cubre con Whisper-small (ko) y MMS-TTS coreano, lo que permite integrar tecnicos de proveedores sin infraestructura de red en planta.
- Reuniones de seguridad y "toolbox talks" con mandarin: la ruta vi↔zh usa Whisper-small para el ASR y la voz Piper `huayan-medium` para la sintesis, adecuada para sesiones breves de instruccion repetitiva.
- Despliegue en zonas sin conectividad: al ser 100 % offline y ocupar 0,9 GB, el bundle puede instalarse en el dispositivo mediante `scripts/setup_models.sh` y operar en plantas remotas, tuneles o emplazamientos sin cobertura.
- Sustitucion de interpretes en mantenimiento correctivo: un tecnico puede dictar el problema en vietnamita y recibir la descripcion en ingles para el fabricante de la maquinaria, con la garantia de que el glosario industrial fuerza la terminologia tecnica correcta.
- Registro y transcripcion de incidencias: la etapa ASR permite obtener texto de las comunicaciones de voz para trazabilidad, si bien el bundle se centra en la salida de audio y no incluye una capa de almacenamiento o postprocesado de transcripciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (ninguno marcado como verificado, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Reconocimiento automatico del habla en vietnamita (PhoWhisper-base) | VIVOS | WER (habla limpia) | 2,2 |
| Traduccion vi→en con glosario industrial impuesto | OneVoice industrial glossary carrier set | Precision de terminos de glosario | 100 |

Metricas de latencia declaradas, medidas en el QCS6490 (Hexagon v68 HTP) con context binaries full-INT8 de QNN:

| Etapa | Latencia |
|---|---|
| Encoder ASR (PhoWhisper-base, ventana de 30 s) | ~49,5 ms (NPU) |
| Decoder ASR (por token) | ~12,1 ms (NPU) |
| Pipeline completo (maquina de desarrollo con CPU) | ~741 ms desde la liberacion del boton hasta el audio |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, ya que el bundle no es un modelo de proposito general.

## Requisitos de hardware

- Dispositivo objetivo: Qualcomm Dragonwing QCS6490, con NPU Hexagon v68 HTP; placas de referencia Rubik Pi 3 y RB3 Gen 2.
- Almacenamiento: el repositorio completo ocupa 0,9 GB (Git LFS); el desglose por etapa va de 2,1 MB (VAD) a 149 MB (decoder de Whisper-small).
- VRAM para inferencia en GPU: no disponible; la model card no documenta requisitos para GPU de escritorio.
- GPU de consumo: no disponible; el diseno apunta a aceleracion NPU en edge, no a tarjetas graficas de consumo.
- Aceleracion: binarios de contexto full-INT8 de QNN para la NPU, con repositorios companeros citados como `qualcomm-ai-hub-community/whisper-*-qcs6490-qnn-int8`.
- Opciones de despliegue: ONNX Runtime (CPU) o QNN (NPU) a traves del runtime en Rust del proyecto; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia declarada: ~49,5 ms para el encoder ASR sobre 30 s de audio, ~12,1 ms por token en el decoder, y ~741 ms de extremo a extremo en una maquina de desarrollo con CPU (no en NPU).
- Throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible no incluye parametros, contexto ni benchmarks de los modelos alternativos, por lo que la comparacion se limita a lo declarado en la model card. Cabe senalar que Whisper-small y PhoWhisper-base no son alternativas externas, sino componentes internos de este mismo bundle.

| Modelo | Enfoque | Idiomas | Licencia | Disponibilidad | Rendimiento documentado |
|---|---|---|---|---|---|
| OneVoice-Vega (este bundle) | Cascada ONNX INT8: denoise, VAD, ASR, MT, TTS para edge | vi, en, zh, ko (6 direcciones) | Mixta (`onevoice-vega-mixed`) | HuggingFace + repositorio GitHub | WER 2,2 en VIVOS (habla limpia); 100 % de precision de glosario vi→en |
| OpenAI Whisper (usado como componente ASR en/zh/ko) | Modelo unico encoder-decoder ASR y traduccion a ingles | Multilingue (no se detalla en la informacion) | MIT | HuggingFace / OpenAI | No disponible en la informacion proporcionada |
| Helsinki-NLP Opus-MT (usado como componente MT vi↔en) | Transformer encoder-decoder de traduccion de texto | Par vi↔en en este bundle | Apache-2.0 / CC-BY | HuggingFace | No disponible en la informacion proporcionada |
| Meta MMS-TTS (usado como componente TTS coreano) | VITS de sintesis de voz | Coreano en este bundle | MIT | HuggingFace | No disponible en la informacion proporcionada |

Para una comparacion con alternativas de traduccion de voz a voz integradas (por ejemplo, soluciones de un solo modelo en lugar de cascada), no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia mixta: cada etapa conserva su licencia original; no existe una licencia unica que cubra el bundle completo, lo que complica la redistribucion como producto.
- `espeak-ng-data/` es GPL-3.0 (procedente del paquete `piper-tts`); incrustarlo en un binario distribuido plantea una cuestion GPL no resuelta que afecta a la distribucion comercial, aunque no al prototipo o la demo. La ruta TTS coreana (MMS-TTS, MIT) evita espeak.
- Las dos metricas del `model-index` estan marcadas como no verificadas (`verified: false`): el WER de 2,2 se obtuvo sobre habla limpia de VIVOS y no cuantifica el comportamiento en el entorno industrial ruidoso que motiva el modelo.
- La metrica de 100 % de precision de glosario se evaluo sobre un conjunto interno del propio autor ("OneVoice industrial glossary carrier set"), sin verificacion independiente ni descripcion publica del conjunto.
- No se documentan sesgos, tasas de alucinacion en traduccion ni comportamientos de fallo del ASR; es un riesgo relevante en un sistema cuyo uso previsto incluye avisos de seguridad en planta.
- La cobertura linguistica esta limitada a vi, en, zh y ko; no hay soporte declarado para castellano ni otras lenguas.
- Los requisitos de VRAM, el throughput y el comportamiento en GPU no estan documentados; la validacion publicada se centra en la NPU del QCS6490 y en una maquina de desarrollo con CPU.
- El repositorio declara 0 descargas y 0 likes, con fechas de creacion y actualizacion de 2026-10-07: se trata de un artefacto sin traccion ni validacion por parte de la comunidad en el momento de redactar esta ficha.
- El bundle distribuye pesos de terceros (VinAI/huuquyet, OpenAI, Helsinki-NLP, rhasspy, Meta, Silero); cualquier uso en produccion debe revisar las condiciones de cada licencia original ademas de la licencia mixta declarada.
- No se menciona ningun mecanismo de filtrado, moderacion o gestion de errores en la salida de traduccion o sintesis.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LakoreAI/onevoice-vega
- Nota de licencia del bundle: https://huggingface.co/LakoreAI/onevoice-vega#license-note
- Repositorio del proyecto (runtime en Rust y scripts): https://github.com/MinLee0210/onevoice-vega
- Analisis de la licencia de la voz Piper en vietnamita: `docs/decisions/piper-vi-voice-license-trap.md` en el repositorio del proyecto
- Modelos base citados: `huuquyet/PhoWhisper-base`, `onnx-community/whisper-small`, `Helsinki-NLP/opus-mt-vi-en`, `Helsinki-NLP/opus-mt-en-vi`, `rhasspy/piper-voices`, `facebook/mms-tts-kor`, `onnx-community/silero-vad`
- Repositorios companeros citados para QNN en QCS6490: `qualcomm-ai-hub-community/whisper-*-qcs6490-qnn-int8`
- La busqueda web realizada no devolvio ningun enlace relevante a este modelo, paper, blog o demo adicional.
