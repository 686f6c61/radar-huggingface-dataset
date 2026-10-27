# mahwizzzz/Urdu-Streaming-Zipformer-20M

## Resumen

Urdu-Streaming-Zipformer-20M es un sistema de reconocimiento automático del habla (ASR) en urdu, en streaming y de tamano muy reducido, publicado por el usuario mahwizzzz en HuggingFace. Se trata de un transductor Zipformer (RNN-T) causal con 20,85 M de parametros desplegados, pensado para transcripcion en tiempo real con chunks de 320 ms y un coste de computo de aproximadamente 9 ms por chunk en un unico hilo de CPU de escritorio (RTF 0,033, unas 30 veces mas rapido que el tiempo real).

El modelo parte del checkpoint ingles `desh2608/icefall-asr-librispeech-pruned-transducer-stateless7-streaming-small` del proyecto k2-fsa/icefall y se ha reentrenado con 84,94 horas (48.612 enunciados) de corpus en urdu: IndicVoices, Kathbath, UrduSpeech y Rasa. Ademas del urdu, maneja frases de cambio de codigo urdu-ingles, un fenomeno muy frecuente en el habla real de Pakistan y de la diaspora.

Su relevancia practica esta en la relacion coste/prestacion: se distribuye en ONNX (INT8 y FP32), ocupa 42 MiB en INT8 y se ejecuta con el runtime sherpa-onnx sin necesidad de PyTorch ni de k2, lo que permite inferencia en CPU, en servidores sin GPU y en entornos con requisitos de latencia estrictos. La version publicada es v1.1.0-rc1 (v5) y el repositorio no registra todavia descargas ni valoraciones, por lo que debe considerarse un modelo reciente y poco validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor Zipformer (RNN-T) causal, en streaming; ficheros ONNX separados de encoder, decoder y joiner |
| Parametros totales | 20,85 M (parametros desplegados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: streaming causal por chunks de 320 ms; no se documenta ventana maxima de contexto |
| Tipos de cuantizacion | INT8 (42 MiB) y FP32; se distribuyen ambas variantes (`.int8.onnx` y `.onnx`) |
| Idiomas soportados | urdu (ur) e ingles (en) en cambio de codigo; salida en escritura urdu normalizada y latin en minusculas |
| Licencia | pesos y modelos ONNX: CC-BY-4.0; codigo y configuraciones: Apache-2.0 |
| Formato de pesos | ONNX (encoder, decoder, joiner) mas `tokenizer/tokens.txt`; runtime sherpa-onnx |
| Frecuencia de muestreo | 16 kHz, 80 dimensiones de features acusticas |
| Modos de decodificacion | `quality`: modified beam search con `max_active_paths=4` y `blank_penalty=0.25`; `fast`: greedy search con `blank_penalty=0.0` |
| Version | v1.1.0-rc1 (v5) |
| Tamano del repositorio | 0,5 GB |
| Modelo base | `desh2608/icefall-asr-librispeech-pruned-transducer-stateless7-streaming-small` |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer de tipo pruned transducer "stateless7 streaming small" de icefall, adaptado al urdu. La arquitectura combina un encoder Zipformer causal con un predictor (decoder) y una red joiner que produce la distribucion sobre el vocabulario en cada frame; al ser causal y usar atencion enmascarada hacia el pasado, permite decodificacion incremental con una latencia de 320 ms por chunk. El paquete de inferencia se exporta a tres grafos ONNX independientes que sherpa-onnx encadena en memoria, sin dependencias de PyTorch ni de k2.

El entrenamiento utiliza 84,94 horas y 48.612 enunciados: 49,35 h de AI4Bharat IndicVoices (ur), 17,01 h de AI4Bharat Kathbath (ur), 16,91 h de ASLP-lab UrduSpeech y 1,68 h de AI4Bharat Rasa (ur). La evaluacion se realiza sobre particiones de Kathbath, IndicVoices, FLEURS ur_pk, Rasa, CSALT Voice y el benchmark de cambio de codigo de UrduSpeech (769 enunciados en dev, 938 en test). La model card no documenta el numero total de tokens, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no procede en un sistema ASR supervisado). Las mejoras entre la version v4 y la v5 se miden en WER y CER sobre los mismos conjuntos, con reducciones de aproximadamente 1-2 puntos absolutos en la mayoria de particiones.

## Capacidades

- Reconocimiento de voz en urdu en modo streaming con chunks de 320 ms y decodificacion incremental.
- Manejo de cambio de codigo urdu-ingles en frases frecuentes, aunque con la tasa de error mas alta del conjunto de evaluacion.
- Dos modos de decodificacion: `quality` (beam search, mayor precision) y `fast` (greedy, menor coste).
- Inferencia en CPU con un solo hilo (`num_threads=1`) y sin GPU.
- Ejecucion mediante sherpa-onnx: API de Python (`OnlineRecognizer.from_transducer`) y scripts de CLI para transcripcion de ficheros y streaming "paced" o desde microfono.
- Salida en escritura urdu normalizada y latin en minusculas; sin puntuacion ni inverse text normalization (ITN).
- No se documentan capacidades de deteccion de hablante (diarizacion), timestamps por palabra, puntuacion automatica ni traduccion.

## Casos de uso

- Subtitulado en directo de television o radio en urdu: la naturaleza causal y los 320 ms de chunk permiten emitir texto mientras se habla, con un retardo inferior al segundo y sin necesidad de GPU en el servidor de emision.
- Agentes de voz e IVR telefonico: al consumir aproximadamente el 3,3 % de un nucleo por stream (RTF 0,033), un solo servidor CPU puede atender decenas de llamadas concurrentes con reconocimiento en linea, manteniendo los datos en infraestructura propia.
- Transcripcion de reuniones con cambio de codigo urdu-ingles: el modelo esta entrenado para este escenario y puede generar actas preliminares que luego se revisan o se pasan por un LLM para puntuacion y resumen; conviene asumir un WER de en torno al 40 % en el caso de cambio de codigo.
- Indexado y busqueda de archivos de audio en urdu: transcripcion offline por lotes con el script `transcribe_file.py` para construir indices de texto sobre archivos de archivo, podcasts o grabaciones de atencion al cliente.
- Pre-anotacion de corpus para investigacion linguistica o para entrenar modelos mayores: el modelo sirve como generador de transcripciones iniciales que un anotador humano corrige, reduciendo el coste frente a la anotacion desde cero.
- Despliegue en entornos sin GPU o con restricciones de recursos (servidores modestos, contenedores pequenos): los 42 MiB en INT8 y la ausencia de dependencias de PyTorch simplifican el empaquetado y reducen la superficie de ataque de la imagen.
- Accesibilidad: generacion de subtitulos en tiempo real para personas sordas en retransmisiones en urdu, con la salvedad de que la salida no incluye puntuacion.

## Benchmarks y rendimiento

Resultados provisionales publicados en la model card. Las cifras son WER % / CER % (menor es mejor). Dev: 769 enunciados; test: 938 enunciados.

| Particion | v4 INT8 Fast | v5 INT8 Fast | v5 INT8 Quality |
|---|---:|---:|---:|
| `dev_kathbath_ur` | 23,24 / 9,12 | 21,97 / 8,46 | 20,64 / 7,35 |
| `dev_indicvoices_ur` | 17,14 / 8,96 | 16,09 / 7,93 | 14,45 / 6,81 |
| `dev_fleurs_ur_pk` | 33,22 / 16,28 | 32,33 / 15,37 | 30,73 / 13,97 |
| Macro dev | 24,53 / 11,45 | 23,46 / 10,59 | 21,94 / 9,38 |
| `test_kathbath_ur` | 26,12 / 8,95 | 25,19 / 8,95 | 22,97 / 7,33 |
| `test_indicvoices_ur` | 23,47 / 14,34 | 22,16 / 13,40 | 19,69 / 10,88 |
| `test_fleurs_ur_pk` | 32,87 / 15,45 | 31,43 / 14,28 | 30,18 / 13,08 |
| `test_rasa_ur` | 15,56 / 6,26 | 15,50 / 6,09 | 14,41 / 5,33 |
| `test_csalt_voice` | 37,71 / 25,34 | 34,71 / 24,00 | 31,33 / 20,45 |
| `test_urduspeech_benchmark_cs` | 46,93 / 33,99 | 42,02 / 29,66 | 39,67 / 26,83 |
| Macro test | 30,44 / 17,39 | 28,50 / 16,06 | 26,38 / 13,98 |
| Pooled test | 31,45 / 17,99 | 29,46 / 16,69 | 27,25 / 14,51 |

Metricas de eficiencia declaradas: RTF 0,033 y aproximadamente 9 ms de computo por chunk de 320 ms en un hilo de CPU de escritorio, es decir, unas 30 veces mas rapido que el tiempo real. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de LLM, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU. En INT8 los pesos ocupan 42 MiB y el repositorio completo 0,5 GB (incluye variantes FP32 y ejemplos).
- CPU: un unico hilo de escritorio es suficiente; la model card reporta RTF 0,033 con `num_threads=1`.
- GPU recomendadas: no aplica. No se han publicado cifras de latencia o throughput en GPU (no disponibles).
- GPU de consumo: el modelo cabe en cualquier GPU moderna e incluso en iGPU, pero no hay motivo para usarla; no se documenta backend GPU para estos grafos ONNX.
- Opciones de despliegue: sherpa-onnx (API de Python `OnlineRecognizer.from_transducer`), scripts de CLI `examples/transcribe_file.py` y `examples/stream_paced_or_mic.py`. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un LLM.
- Throughput estimado: a partir del RTF 0,033, un nucleo podria sostener teoricamente del orden de 30 streams concurrentes; no se ha publicado una medicion real de concurrencia.
- Almacenamiento y red: la descarga del repositorio completo es de 0,5 GB; para produccion basta con los tres ficheros ONNX INT8 mas `tokens.txt`, muy por debajo de esa cifra.

## Comparativa con modelos similares

| Modelo | Parametros | Streaming | Idiomas | Licencia | WER en urdu | Disponibilidad |
|---|---|---|---|---|---|---|
| Urdu-Streaming-Zipformer-20M (v5, INT8 quality) | 20,85 M | Si, chunks de 320 ms | ur, en (cambio de codigo) | Pesos CC-BY-4.0; codigo Apache-2.0 | 21,94 macro dev / 26,38 macro test | HuggingFace, runtime sherpa-onnx |
| `desh2608/icefall-asr-librispeech-pruned-transducer-stateless7-streaming-small` (modelo base) | no disponible | Si (misma familia Zipformer streaming) | en | no disponible en la informacion proporcionada | no disponible (modelo en ingles) | HuggingFace |
| Otros sistemas ASR para urdu (ajustes de Whisper, Vosk y similares) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos comparables en urdu, por lo que la comparativa cuantitativa con alternativas no puede establecerse aqui.

## Limitaciones y advertencias

- El cambio de codigo urdu-ingles es el caso mas dificil: 39,67 % de WER en modo `quality` y 42,02 % en modo `fast` sobre `test_urduspeech_benchmark_cs`.
- El vocabulario tecnico en ingles fuera del vocabulario de entrenamiento degrada la transcripcion.
- El habla con ruido, solapamiento de voces o compresion agresiva reduce la precision: 31,33 % de WER en `test_csalt_voice` (modo `quality`).
- El rendimiento cae en dominios alejados del entrenamiento: 30,18 % de WER en FLEURS ur_pk frente a 14,41 % en Rasa.
- Sin puntuacion ni inverse text normalization: la salida es escritura urdu normalizada y latin en minusculas, lo que obliga a un postprocesado si se necesita texto legible.
- No se documentan deteccion de hablante, timestamps ni alineacion forzada.
- No se documenta un analisis de sesgos por genero, edad, dialecto o region; al entrenar con corpus de AI4Bharat, ASLP-lab y FLEURS, el rendimiento puede variar de forma no medida entre acentos de Pakistan, India y diaspora.
- Riesgo de sustituciones y omisiones propias de un transductor pequeno en audio dificil; conviene validar con un conjunto propio antes de usarlo en produccion.
- Estado del arte del repositorio: 0 descargas y 0 likes en el momento de la consulta, version `rc1` (release candidate); no hay evidencia publica de uso en produccion.
- Licencia: los pesos son CC-BY-4.0 y exigen atribucion a AI4Bharat (IndicVoices, Kathbath, Rasa), ASLP-lab (UrduSpeech), k2-fsa/icefall, k2-fsa/sherpa-onnx y al modelo base (ver `THIRD_PARTY_NOTICES.md`); el codigo y las configuraciones son Apache-2.0. El uso comercial es posible siempre que se respeten las condiciones de atribucion de CC-BY-4.0.
- Los grafos ONNX requieren el runtime sherpa-onnx; no son directamente intercambiables con otros stacks de inferencia sin conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahwizzzz/Urdu-Streaming-Zipformer-20M
- Modelo base: https://huggingface.co/desh2608/icefall-asr-librispeech-pruned-transducer-stateless7-streaming-small
- Dataset AI4Bharat IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset AI4Bharat Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset ASLP-lab UrduSpeech: https://huggingface.co/datasets/ASLP-lab/UrduSpeech
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset Google FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset urdu-asr/csalt-voice: https://huggingface.co/datasets/urdu-asr/csalt-voice
- Repositorio k2-fsa/icefall: https://github.com/k2-fsa/icefall
- Repositorio k2-fsa/sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
