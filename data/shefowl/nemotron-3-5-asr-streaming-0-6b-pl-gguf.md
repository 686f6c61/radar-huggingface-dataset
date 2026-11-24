# shefowl/nemotron-3.5-asr-streaming-0.6b-pl-GGUF

## Resumen

Nemotron 3.5 ASR Streaming 0.6B — Polish, GGUF es una distribucion en formato GGUF del modelo de reconocimiento automatico del habla `shefowl/nemotron-3.5-asr-streaming-0.6b-pl`, un ajuste fino sobre el modelo streaming FastConformer-RNNT de NVIDIA especializado en polaco. Lo publica el usuario shefowl y esta pensado para su uso con NVIDIA NeMo-Speech.cpp, el motor de inferencia en C++ de NVIDIA que consume estos ficheros sin necesidad de Python ni del stack completo de NeMo.

El modelo resuelve el problema de la transcripcion de voz en polaco en entornos de bajos recursos: con 648 millones de parametros y cuantizaciones que van de 452 MB a 1,33 GB, puede ejecutarse en CPU de escritorio a velocidades muy superiores al tiempo real. La variante Q8_0 alcanza aproximadamente 20x tiempo real en modo offline y 17x en modo streaming sobre un Ryzen 7 7700X con cuatro ficheros en paralelo.

La relevancia actual radica en que combina una arquitectura de streaming con atencion limitada (ventana offline [56, 6]), un formato de pesos portatil y una licencia OpenMDW-1.1 que permite uso comercial. Es una pieza practica para integrar ASR polaco en aplicaciones locales, embebidas o con requisitos de privacidad, sin depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador RNNT (transducer) |
| Parametros totales | 648.268.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de atencion offline [56, 6] en metadatos; chunk de streaming de 560 ms con contexto derecho 6 |
| Tipos de cuantizacion | F16, Q8_0, Q4_K |
| Idiomas soportados | polaco (pl) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (tambien disponible el `.nemo` original de 2,55 GB) |

## Arquitectura y entrenamiento

El modelo es un FastConformer con decodificador RNNT, la familia de ASR de NVIDIA disenada para transcripcion en streaming. FastConformer reduce el coste computacional del conformer clasico mediante downsampling de la secuencia de entrada, lo que permite procesar audio a 16 kHz en tiempo real con una huella de memoria reducida. El decodificador RNNT evita el problema de alineacion de los modelos CTC y permite decodificacion incremental, adecuada para streaming.

Los detalles de entrenamiento (numero de horas de audio, composicion del corpus, si hubo aumento de datos o ajuste especifico) no estan disponibles en la informacion proporcionada; la model card remite a la ficha del modelo base para esos datos. La innovacion practica de esta distribucion es la conversion del fichero `.nemo` a GGUF mediante `convert_model.py` de NeMo-Speech.cpp (commit e790e46), fijando en los metadatos la ventana de atencion offline [56, 6] con la que se entreno el modelo. Esto preserva el comportamiento del original en un runtime C++ ligero.

## Capacidades

- Reconocimiento automatico del habla en polaco sobre audio mono a 16 kHz.
- Transcripcion offline de ficheros completos.
- Transcripcion en streaming con chunk de 560 ms y contexto derecho configurable (6 en el modo entrenado).
- Decodificacion RNNT incremental, sin necesidad de segmentar manualmente el audio.
- Ejecucion en CPU sin GPU, gracias a las cuantizaciones GGUF.
- Procesamiento en paralelo de varios ficheros (medido con 4 en paralelo).
- No soporta tool calling, agentes, vision ni audio multimodal; es exclusivamente ASR.
- Capacidad multilingue limitada al polaco.

## Casos de uso

- Subtitulado en directo de reuniones y webinars en polaco: el modo streaming con chunk de 560 ms permite emitir texto conforme llega el audio, con una latencia compatible con subtitulos casi en tiempo real.
- Transcripcion de consultas medicas: el modelo mantiene un WER de 13,7 en el conjunto de clinica con F16 y Q8_0, y de 15,6 con Q4_K, lo que lo hace util para documentacion clinica dictada en polaco.
- Atencion al cliente con registro de llamadas: la transcripcion offline a 20x tiempo real permite procesar grandes volumenes de grabaciones en una CPU de escritorio, sin enviar audio a servicios externos.
- Investigacion cualitativa con entrevistas: la ventana de contexto y el procesamiento por lotes permiten transcribir corpus de entrevistas en polaco en local, preservando la confidencialidad de los participantes.
- Integracion en aplicaciones de escritorio o embebidas: el fichero Q4_K de 452 MB cabe en dispositivos con poca memoria y se ejecuta con NeMo-Speech.cpp, lo que facilita su inclusion en herramientas nativas.
- Generacion de actas y resumenes a partir de audio: la transcripcion sirve como paso previo a un pipeline de NLP o LLM que estructure el contenido de reuniones y clases.
- Accesibilidad para personas con discapacidad auditiva: transcripcion local de conversaciones presenciales o contenido multimedia en polaco sin depender de conectividad.

## Benchmarks y rendimiento

WER sobre las primeras 100 emisiones de cada conjunto (no son cifras del conjunto completo):

| Fichero | Tamano | FLEURS | Medical (clinica) | Conversations |
|---|---|---|---|---|
| NeMo `.nemo` (referencia) | 2,55 GB | 14,6 | 13,7 | 24,5 |
| `...f16.gguf` | 1,33 GB | 14,7 | 13,7 | 24,6 |
| `...q8_0.gguf` | 813 MB | 14,4 | 13,4 | 24,5 |
| `...q8_0.gguf` en streaming (`--stream`, contexto derecho 6) | 813 MB | 14,8 | 13,1 | 24,4 |
| `...q4_k.gguf` | 452 MB | 14,9 | 15,6 | 23,7 |

Observaciones del autor: F16 produce el mismo texto que NeMo en 96–99 de cada 100 emisiones; Q8_0 se mantiene dentro de ±0,4 puntos de NeMo; Q4_K pierde unos 2 puntos en habla medica. En CPU de escritorio (Ryzen 7 7700X, 4 ficheros en paralelo), Q8_0 corre a aproximadamente 20x tiempo real en offline y 17x en streaming.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta disenado para CPU. En GPU, la huella seria inferior a 1 GB en Q8_0 y de aproximadamente 1,4 GB en F16.
- GPU recomendadas: no aplica; cualquier GPU con suficiente memoria podria alojar el modelo, pero el runtime objetivo es NeMo-Speech.cpp en CPU.
- Cabe en cualquier CPU de escritorio moderna; el Q4_K de 452 MB es apto para dispositivos con memoria limitada.
- Despliegue: NVIDIA NeMo-Speech.cpp (CLI `nemo-speech`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no estan orientados a este tipo de modelo.
- Latencia y throughput: aproximadamente 20x tiempo real en offline y 17x en streaming con Q8_0 en un Ryzen 7 7700X procesando 4 ficheros en paralelo.
- Audio de entrada: mono a 16 kHz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B PL (GGUF) | 648 M | ventana [56, 6], chunk 560 ms | pl | OpenMDW-1.1 | GGUF, `.nemo` |
| NeMo `.nemo` original (misma base) | 648 M | ventana [56, 6] | pl | OpenMDW-1.1 | `.nemo` |
| Whisper large-v3 | no disponible en la informacion | offline, no streaming nativo | multilingue | MIT (habitual) | safetensors, GGUF |
| Alternativas ASR polacas especializadas | no disponible en la informacion | no disponible | pl | no disponible | no disponible |

La comparacion con Whisper u otros modelos no puede cuantificarse con los datos proporcionados; la unica comparacion documentada es contra el `.nemo` de referencia, con diferencias de WER de decimas y un rendimiento en CPU muy superior al stack Python de NeMo.

## Limitaciones y advertencias

- Solo soporta polaco; no es un modelo multilingue.
- Requiere audio mono a 16 kHz; otras frecuencias o canales requieren preprocesado.
- El modo streaming esta calibrado para chunk de 560 ms y contexto derecho 6; otros valores pueden degradar la calidad.
- Q4_K pierde aproximadamente 2 puntos de WER en habla medica, por lo que no es recomendable para dominios especializados sin validacion.
- Los benchmarks publicados corresponden a las primeras 100 emisiones de cada conjunto, no al conjunto completo; pueden no ser representativos.
- Riesgo de alucinacion y errores en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan mitigaciones especificas.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Licencia OpenMDW-1.1: permite uso comercial, pero conviene revisar los terminos completos y el fichero `NOTICE` con atribuciones de datos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente y poco validada por la comunidad.
- Depende de NeMo-Speech.cpp (commit e790e46); cambios en el runtime pueden afectar a la compatibilidad de los metadatos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/shefowl/nemotron-3.5-asr-streaming-0.6b-pl-GGUF
- Modelo base: https://huggingface.co/shefowl/nemotron-3.5-asr-streaming-0.6b-pl
- NVIDIA NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
