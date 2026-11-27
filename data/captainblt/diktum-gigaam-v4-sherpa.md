# CaptainBlt/diktum-gigaam-v4-sherpa

## Resumen

Diktum-gigaam-v4-sherpa es un paquete de reconocimiento automatico del habla (ASR) para ruso, publicado por el desarrollador independiente CaptainBlt como parte de la aplicacion de dictado Diktum. No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion del modelo ai-sage/GigaAM-v4 (cabeza `v4_rnnt` end-to-end) al formato ONNX que consume sherpa-onnx, con el encoder en int8 dinamico y la red de prediccion y el joiner en fp32. El objetivo es ofrecer un motor de transcripcion de ruso con puntuacion y mayusculas ya resueltas, ejecutable en CPU y facil de integrar en aplicaciones de escritorio o moviles.

Tecnicamente es un transducer RNN-T en la disposicion NeMo que espera sherpa-onnx (`nemo_transducer`), con un vocabulario de 1024 piezas BPE mas el token blank, entrada de audio mono a 16 kHz y soporte opcional de hotwords mediante decodificacion `modified_beam_search`. El repositorio ocupa 0,2 GB, lo que refleja un modelo compacto pensado para inferencia en el borde mas que para servidores de alta capacidad.

Su relevancia actual es practica: demuestra como un modelo de ASR ruso con licencia MIT puede empaquetarse en ONNX int8 sin perdida medible de calidad frente al paquete oficial en PyTorch fp32, y con un rendimiento de unas 60 veces tiempo real en CPU. Es una pieza util para quien necesite dictado o transcripcion en ruso sin GPU ni dependencias de frameworks de deep learning pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer transducer (RNN-T) estilo NeMo, encoder + prediction network + joiner |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR offline por utterance; entrada de audio a 16 kHz mono) |
| Tipos de cuantizacion | int8 dinamico en el encoder; decoder y joiner en fp32 |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder int8, decoder fp32, joiner fp32), tokens.txt y bpe.vocab |

## Arquitectura y entrenamiento

El modelo subyacente es ai-sage/GigaAM-v4 en su variante `v4_rnnt`, un transducer end-to-end que combina un encoder acustico con una red de prediccion y un joiner, siguiendo el esquema clasico RNN-T. La version publicada aqui no aporta entrenamiento propio: los ficheros ONNX proceden del release `models-gigaam-v4` del proyecto ivkiwi/phone-whisper, y el `bpe.vocab` se genero a partir de `v4_rnnt_e2e_tokenizer.model` del paquete oficial `gigaam`. La conversion mantiene el vocabulario de 1024 piezas BPE del tokenizer sentencepiece original, lo que permite usar hotwords a nivel de subpalabra.

La innovacion principal del paquete es el proceso de empaquetado: cuantizacion int8 dinamica solo del encoder, dejando decoder y joiner en fp32 para preservar la precision del decodificado, y adaptacion al layout de transducer NeMo de sherpa-onnx. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus ni si el modelo base uso RLHF, DPO u otras tecnicas de alineacion; esos datos corresponden a la model card de ai-sage/GigaAM-v4, no incluida en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla en ruso con salida que incluye puntuacion y mayusculas (cabeza end-to-end).
- Transcripcion offline por utterance sobre audio mono a 16 kHz.
- Soporte de hotwords mediante `modified_beam_search` con `modeling_unit=bpe`, util para sesgar el reconocimiento hacia nombres propios, terminos tecnicos o vocabulario de dominio.
- Decodificacion por transducer con beam search modificado.
- Inferencia en CPU con sherpa-onnx, sin necesidad de GPU ni de PyTorch en tiempo de ejecucion.
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma, vision ni audio multilingue.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: el modelo esta empaquetado especificamente para la app Diktum, de modo que puede transcribir dictado continuo en ruso con puntuacion y mayusculas ya insertadas, reduciendo el postprocesado necesario.
- Subtitulado y transcripcion de reuniones en ruso: al procesar utterances de forma offline y a unas 60 veces tiempo real en CPU, permite transcribir grabaciones largas en un servidor modesto sin GPU.
- Sesgado de vocabulario en dominios especializados: con hotwords a nivel BPE se pueden priorizar nombres de productos, farmacos o entidades legales, manteniendo `hotwords_score` cerca de 1,5 para evitar que el modelo invente terminos.
- Asistentes de voz embebidos: el tamano de repositorio de 0,2 GB y la inferencia en CPU lo hacen viable en dispositivos de borde o en aplicaciones de escritorio con recursos limitados.
- Pipelines de accesibilidad: transcripcion de audio a texto para personas con dificultades auditivas en contenido en ruso, integrable via la API de sherpa-onnx en Python, C++ o bindings moviles.
- Preprocesado de datos para entrenamiento de otros modelos: generar transcripciones con puntuacion de corpus de audio ruso a gran escala aprovechando el throughput en CPU.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| WER | 3,17 % | 180 utterances en ruso (FLEURS, Golos crowd y farfield), numeros escritos con letras |
| Equivalencia con fp32 | 144 de 180 transcripciones identicas; el resto difiere en puntuacion | Comparado con el paquete oficial PyTorch fp32 de GigaAM-v4 |
| Velocidad | ~60x tiempo real | CPU con sherpa-onnx int8, fecha de medicion 2026-11-27 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM: no aplica; la inferencia esta pensada para CPU con sherpa-onnx.
- GPU recomendadas: no disponibles ni necesarias para el caso de uso documentado; el autor solo reporta mediciones en CPU.
- GPU de consumo: irrelevante para este paquete, que no requiere aceleracion grafica.
- Opciones de despliegue: sherpa-onnx (`OfflineRecognizer.from_transducer` con `model_type="nemo_transducer"`), disponible en Python y otras bindings de la libreria. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo ASR de este tipo.
- Latencia y throughput: aproximadamente 60 veces tiempo real en CPU con el encoder int8, segun la medicion del autor sobre 180 utterances.
- Memoria en disco: repositorio de 0,2 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| CaptainBlt/diktum-gigaam-v4-sherpa | RNN-T transducer (ONNX int8) | ru | audio 16 kHz mono | MIT | ONNX + sherpa-onnx | Paquete derivado de GigaAM-v4, WER 3,17 % en la evaluacion del autor |
| ai-sage/GigaAM-v4 (`v4_rnnt`) | RNN-T transducer (PyTorch) | ru | audio 16 kHz mono | MIT | PyTorch | Modelo base oficial; mismo WER segun la comparacion del autor |
| Whisper (variantes de OpenAI) | Encoder-decoder transformer | multilingue | audio 16 kHz, ventanas de 30 s | MIT | PyTorch, ONNX, GGUF | Referencia multilingue; no se dispone de comparacion directa de WER en ruso en la informacion proporcionada |
| Vosk (modelos ruso) | ASR ligero para despliegue en el borde | ru | audio 16 kHz | Apache 2.0 (segun modelo) | Kaldi/ONNX | Alternativa de ASR en CPU; no se dispone de comparacion directa en la informacion proporcionada |

Los datos de comparacion con Whisper y Vosk no estan disponibles en la informacion proporcionada; la unica comparacion medida es contra el paquete oficial fp32 de GigaAM-v4.

## Limitaciones y advertencias

- Solo soporta ruso; no hay capacidades multilingues ni deteccion automatica de idioma.
- El WER de 3,17 % se midio sobre 180 utterances de FLEURS, Golos crowd y Golos farfield; el rendimiento en otros dominios (audio telefonico, ruido industrial, acentos no representados) puede degradarse y no esta documentado.
- El uso de hotwords con `hotwords_score` alto provoca que el modelo invente terminos; el autor recomienda mantenerlo cerca de 1,5.
- Riesgo de alucinacion en segmentos de silencio, ruido o audio de baja calidad, comun en modelos transducer con puntuacion end-to-end; no se documenta mitigacion especifica.
- Las diferencias frente al fp32 se concentran en la puntuacion de las transcripciones, lo que puede afectar a metricas que la tengan en cuenta.
- No se dispone de informacion sobre sesgos demograficos o dialectales del modelo base GigaAM-v4.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base ai-sage/GigaAM-v4 y de los ficheros ONNX originales de ivkiwi/phone-whisper antes de redistribuir.
- El repositorio no registra descargas ni likes en el momento de la consulta; es un paquete reciente y de un unico autor, sin validacion externa mas alla de la medicion publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaptainBlt/diktum-gigaam-v4-sherpa
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v4
- Release de los ficheros ONNX: https://github.com/ivkiwi/phone-whisper/releases/tag/models-gigaam-v4
- Aplicacion Diktum: https://captainblt.xyz
