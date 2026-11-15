# ozankaraali/qitv-asr-tr-conformer

## Resumen

QiTV ASR es un modelo de reconocimiento automático del habla (ASR) en turco, disenado especificamente para subtitulado en directo de dialogos de television. Lo desarrolla ozankaraali como parte del proyecto QiTV, una herramienta de subtitulos on-device, y parte del modelo base ingles de NVIDIA `stt_en_fastconformer_hybrid_large_streaming_multi`, al que se ha aplicado entrenamiento adicional sobre aproximadamente 7.700 horas de habla turca, mayoritariamente conversacional.

Tecnicamente es un FastConformer hibrido con decodificador transducer (RNN-T) y CTC, de 115 millones de parametros, con capacidad de streaming cache-aware. Esto significa que puede emitir texto mientras la persona sigue hablando, con una ventana de look-ahead de hasta 1.040 ms, lo que lo hace apto para subtitulos en vivo. Se distribuye tanto en formato NeMo completo (460 MB) como en ONNX int8 cuantizado para sherpa-onnx (unos 142 MB en total), pensado para ejecutarse offline en CPU.

Su relevancia practica esta en que cubre un nicho poco atendido: ASR turco en streaming, offline y ligero, optimizado para habla espontanea de ficcion televisiva. Segun la model card, obtiene un 16,5 % de WER en su conjunto de test Drama A, por delante de otros cuatro modelos turcos abiertos comparados, aunque queda por detras en habla leida y noticiarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrido (transducer RNN-T + CTC), cache-aware streaming |
| Parametros totales | 115 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (streaming con look-ahead configurable de 0, 80, 480 o 1.040 ms; los ONNX fijan 1.040 ms) |
| Tipos de cuantizacion | int8 (ONNX); pesos completos en NeMo sin cuantizar |
| Idiomas soportados | Turco (tr) unicamente; no escribe ingles |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo) y ONNX (encoder, decoder y joiner int8) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura FastConformer de NVIDIA, un transformer convolucional con atencion de cache que permite inferencia en streaming por bloques. El cabezal es hibrido: un decodificador transducer (RNN-T) combinado con CTC, lo que permite tanto decodificacion greedy como beam search modificado. El vocabulario es un SentencePiece unigram de 1.024 piezas en turco, con mayusculas y puntuacion incluidas.

El entrenamiento adicional se realizo sobre unas 7.700 horas de habla turca, en su mayoria conversacional, partiendo de los pesos del modelo ingles de NVIDIA. La model card no detalla la composicion exacta del dataset, ni si hubo RLHF/DPO (no aplicable a ASR), ni las hiperparametros de fine-tuning. La innovacion destacable es la combinacion de streaming cache-aware con look-ahead configurable, que permite ajustar el compromiso entre latencia y precision, y la distribucion en ONNX int8 para sherpa-onnx con un pipeline de decodificacion optimizado para CPU (modified_beam_search con blank_penalty para reducir palabras perdidas).

## Capacidades

- Reconocimiento de voz en turco en modo streaming, emitiendo palabras mientras se habla.
- Salida con mayusculas y puntuacion, lista para subtitulos.
- Normalizacion de numeros a palabras ("on yedi" en lugar de "17"), con scripts auxiliares para reconvertirlos a digitos.
- Transcripcion de habla conversacional y espontanea, incluido lenguaje malsonante tal como se pronuncia.
- Buen rendimiento en dialogos de ficcion televisiva y letras cantadas.
- Decodificacion greedy (NeMo) o modified_beam_search (sherpa-onnx).
- Ejecucion offline en CPU, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, agentes ni vision/audio multimodal; es exclusivamente ASR de audio a texto.
- Multilingue: no, solo turco.

## Casos de uso

- Subtitulado en directo de television: el modelo emite texto mientras se habla, con look-ahead de 1.040 ms, adecuado para generar subtitulos en tiempo real en retransmisiones o emisiones en diferido con poco retardo.
- Subtitulos on-device en aplicaciones de escritorio: al distribuirse en ONNX int8 y ejecutarse en CPU, permite integrar subtitulos en apps tipo QiTV sin enviar audio a la nube, preservando privacidad y evitando coste por minuto.
- Transcripcion de series y peliculas turcas: su mejor rendimiento relativo en dialogos de ficcion (16,5 % WER en Drama A) lo hace util para pipelines de postproduccion que generan subtitulos de contenido dramatico.
- Generacion de transcripciones para busqueda y archivo: transcripcion offline de audio turco para indexar contenido audiovisual y permitir busqueda por texto.
- Prototipado rapido de ASR turco: al estar disponible en NeMo y sherpa-onnx, sirve como base para experimentos de fine-tuning adicional con datos propios.
- Sistemas de accesibilidad en entornos con CPU: subtitulos para personas con discapacidad auditiva en eventos o aulas donde no hay GPU disponible.
- Transcripcion de letras cantadas: segun la model card, supera a los modelos turcos comparados en canciones, util para catalogacion musical y generacion de letras.

## Benchmarks y rendimiento

Resultados publicados en la model card (WER en %, menor es mejor; el scorer ignora mayusculas, puntuacion y compara numeros como palabras habladas):

| Conjunto de test | Clips | Este modelo | Moonshine medium | Moonshine small | mihu-v2 | ufakzeka-kulak | balbal-v2 | zipformer-asr-turkish-v1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FLEURS Turkish, test | 743 | 11,4 | 11,7 | 13,6 | 7,9 | 9,4 | 8,0 | 9,4 |
| Common Voice 27.0 Turkish, test (1.500 aleatorios) | 1.500 | 11,0 | 10,0 | 13,1 | 6,0 | 9,3 | 7,0 | 9,6 |
| Drama A (test interno) | no disponible | 16,5 | no disponible | no disponible | entre 19,2 y 26,2 (rango de los cuatro modelos comparados) | entre 19,2 y 26,2 | entre 19,2 y 26,2 | entre 19,2 y 26,2 |

La model card indica que en los tres conjuntos de drama y en canciones el modelo supera a los otros modelos turcos abiertos comparados, pero queda por detras de sus hermanos Moonshine. En habla leida (FLEURS, Common Voice), noticiarios y YouTube, mihu-v2 es el mas preciso. No se detallan resultados por conjunto para Moonshine en Drama A.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 115 M parametros, la inferencia en int8 requiere del orden de cientos de MB; los ONNX int8 suman unos 142 MB en disco y caben holgadamente en memoria de cualquier equipo.
- GPU recomendadas: no requiere GPU; esta disenado para CPU. Cualquier GPU consumer (RTX 4090, RTX 3060, etc.) puede ejecutarlo, pero no es el objetivo.
- Cabe en GPU consumer: si, en cualquier GPU consumer y tambien en CPU.
- Opciones de despliegue: sherpa-onnx (formato principal, streaming), NeMo (formato .nemo, transcripcion por fichero). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR).
- Latencia y throughput: no se publican cifras de latencia ni throughput; el look-ahead de 1.040 ms en los ONNX condiciona el retardo minimo de salida. Se recomienda `num_threads=2` en sherpa-onnx segun el ejemplo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | WER FLEURS | WER Common Voice | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| QiTV ASR (este modelo) | 115 M | Streaming, look-ahead 1.040 ms | 11,4 | 11,0 | CC-BY-4.0 | Hugging Face (NeMo + ONNX) |
| mihu-v2 | no disponible | no disponible (no streaming) | 7,9 | 6,0 | no disponible | Hugging Face |
| ufakzeka-kulak | no disponible | no disponible | 9,4 | 9,3 | no disponible | Hugging Face |
| zipformer-asr-turkish-v1 | no disponible | no disponible | 9,4 | 9,6 | no disponible | Hugging Face |
| Moonshine medium (hermano) | no disponible | no disponible (utterance completa) | 11,7 | 10,0 | no disponible | Hugging Face |

El punto diferencial de este modelo no es el WER absoluto en habla leida, donde mihu-v2 le supera, sino su capacidad de streaming en CPU y su rendimiento en dialogos de ficcion televisiva.

## Limitaciones y advertencias

- Solo turco: no transcribe ingles ni otros idiomas.
- Peor rendimiento que mihu-v2 y otros modelos en habla leida, noticiarios y YouTube, segun la propia model card.
- En drama, sus hermanos Moonshine son mas precisos.
- Riesgo de alucinacion y errores propios de ASR: 16,5 % de WER en Drama A implica aproximadamente una de cada seis palabras mal transcrita en ese dominio.
- Requiere audio de 16 kHz mono y la escala de features de NeMo; con `normalize_samples=True` en sherpa-onnx el modelo no produce salida.
- Necesita silencio inicial (0,16 s) y final (3 s) para no perder palabras; en streaming en vivo hay que gestionar estos margenes.
- El look-ahead fijo de 1.040 ms en ONNX introduce retardo; en NeMo es configurable pero los ONNX no.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; conviene revisar los terminos del modelo base de NVIDIA, ya que la model card no detalla condiciones adicionales heredadas.
- No hay datos publicados sobre sesgos demograficos o dialectales del modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ozankaraali/qitv-asr-tr-conformer
- Modelo base: https://huggingface.co/nvidia/stt_en_fastconformer_hybrid_large_streaming_multi
- Proyecto QiTV: https://github.com/ozankaraali/QiTV
- Scripts ASR de QiTV: https://github.com/ozankaraali/qitv-asr
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Modelo hermano Moonshine medium: https://huggingface.co/ozankaraali/qitv-asr-tr-moonshine-mid
- Modelo hermano Moonshine small: https://huggingface.co/ozankaraali/qitv-asr-tr-moonshine-small
- mihu-v2: https://huggingface.co/mihuai/turkish-stt-66m-v2
- ufakzeka-kulak: https://huggingface.co/ufakai/ufakzeka-kulak
- balbal-v2: https://huggingface.co/erayyapagci/balbal-v2
- zipformer-asr-turkish-v1: https://huggingface.co/oayk/zipformer-asr-turkish-v1
