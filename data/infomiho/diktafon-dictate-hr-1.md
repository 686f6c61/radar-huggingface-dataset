# infomiho/diktafon-dictate-hr-1

## Resumen

Diktafon Dictate HR 1 es un modelo de reconocimiento automatico del habla (ASR) especializado en dictado en croata, desarrollado por el usuario infomiho. Se trata de un ajuste fino completo (full fine-tune) del modelo NVIDIA Canary 1B v2, un encoder-decoder de aproximadamente 1.000 millones de parametros, y esta pensado para un caso de uso muy concreto: convertir dictado de voz en texto con puntuacion y mayusculas, incluyendo terminos tecnicos en ingles que aparecen de forma natural en frases en croata. El modelo alimenta Diktafon, una aplicacion de dictado local para macOS.

La relevancia de esta ficha esta en que muestra un patron habitual en el ecosistema open source: en lugar de entrenar desde cero, se parte de un modelo multilingue solido y se especializa con unas 340 horas de audio croata. El resultado declarado por el autor es una reduccion importante del WER en dominios de dictado: del 8,6% al 4,7% en clip limpio, del 19,0% al 11,9% con reverberacion y ruido a 10 dB SNR, y del 18,6% al 12,0% en un conjunto con cinco hablantes voluntarios.

El modelo se distribuye en formato NeMo (.nemo) y existe una version GGUF cuantizada Q5_K_M para transcribe.cpp que ocupa 1,02 GB y corre a 43x tiempo real en un Apple M2 Pro. La licencia es CC BY 4.0, igual que la del modelo base, lo que permite uso comercial con atribucion. Es un modelo monoidioma (croata) y con una ventana practica de audio inferior a 40 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder heredada de NVIDIA Canary 1B v2 (encoder FastConformer y decoder transformer); detalle de capas no disponible en la informacion proporcionada |
| Parametros totales | Aproximadamente 1.000 millones, segun el nombre del modelo base (canary-1b-v2); cifra exacta no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como ventana de tokens; el autor recomienda entradas de audio inferiores a 40 segundos y el entrenamiento uso segmentos de 20 a 40 segundos |
| Tipos de cuantizacion | Q5_K_M en GGUF (repositorio separado); no se listan otras cuantizaciones |
| Idiomas soportados | Croata (hr) unicamente, con terminos tecnicos en ingles dentro de frases en croata |
| Licencia | CC BY 4.0 |
| Formato de pesos | NeMo (.nemo) en el repositorio principal; GGUF en infomiho/diktafon-dictate-hr-1-GGUF |

Datos adicionales: tamano del repositorio 3,9 GB, pipeline `automatic-speech-recognition`, libreria `nemo`, entrada de audio a 16 kHz mono.

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA ni adaptadores) del checkpoint nvidia/canary-1b-v2, por lo que conserva la arquitectura del modelo base: un encoder acustico tipo FastConformer conectado a un decoder transformer autorregresivo, con la interfaz de NeMo para tareas de ASR y traduccion. El ajuste se hizo con la libreria NeMo durante 3 epochs con una tasa de aprendizaje de 3e-5.

Los datos de entrenamiento declarados son aproximadamente 340 horas de audio croata, compuestas por discurso de pódcast en croata y grabaciones de voluntarios que leyeron y pronunciaron prompts con estilo de dictado. El conjunto se aumento con varias transformaciones: union de segmentos en ejemplos de 20 a 40 segundos, copias rellenadas con silencio y copias con reverberacion de sala y ruido de fondo extraidos de OpenSLR 28 (licencia Apache 2.0). No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna otra etapa de alineacion; el objetivo de entrenamiento es el estandar de ASR seq2seq.

Como innovacion practica destaca el formato de salida: el modelo genera puntuacion y mayusculas, y escribe los numeros tal y como se pronuncian ("u deset i trideset" en lugar de "10:30"). El autor indica que un segundo modelo, Diktafon Polisher HR 1, se encarga de convertir esos numeros a digitos y limpiar el texto, lo que supone una separacion deliberada entre transcripcion y normalizacion.

## Capacidades

- Transcripcion de voz a texto en croata con puntuacion y mayusculas incluidas en la salida.
- Dictado de mensajes, notas, listas de tareas y prompts para asistentes de codigo.
- Manejo de terminos tecnicos en ingles embebidos en frases en croata (es su punto mas debil, pero forma parte del objetivo de diseno).
- Robustez declarada frente a reverberacion de sala y ruido de fondo: 11,9% de WER a 10 dB SNR, frente al 19,0% del modelo base.
- Estabilidad ante silencio: no produce salida vacia ni texto inventado en 5 segundos de silencio final.
- Procesamiento de entradas de hasta 20-45 segundos por segmento (en el conjunto de evaluacion de 25 a 45 segundos obtuvo 5,2% de WER).
- Inferencia local eficiente en CPU y Apple Silicon mediante la version GGUF Q5_K_M.
- No se documentan en la informacion disponible capacidades de llamada a herramientas, agentes, vision, audio generativo ni traduccion a otros idiomas.

## Casos de uso

- Dictado local en macOS: es el caso de uso principal, a traves de la aplicacion Diktafon. El modelo transcribe en el propio equipo con la version GGUF de 1,02 GB, sin enviar audio a servicios externos, lo que resulta adecuado para notas personales y contenido sensible.
- Redaccion de mensajes y correos en croata: el modelo devuelve texto con puntuacion y mayusculas, de modo que el resultado se puede pegar directamente en un cliente de correo o de mensajeria sin una fase de formateo.
- Creacion de listas de tareas y notas rapidas: con entradas cortas (menos de 40 segundos) y buena tolerancia al ruido, encaja en flujos de captura rapida de ideas, aunque los numeros se emiten como palabras y requieren el postprocesado de Diktafon Polisher HR 1.
- Prompts para asistentes de codigo: el modelo esta disenado para dictar instrucciones que mezclan croata con terminos tecnicos en ingles, un escenario frecuente entre desarrolladores croatas que trabajan con documentacion y APIs en ingles.
- Transcripcion de pódcast y contenido hablado en croata: aunque el foco es el dictado, el entrenamiento incluye discurso de pódcast, por lo que puede emplearse para generar transcripciones base de episodios, siempre que se trocee el audio en segmentos de 20 a 45 segundos.
- Documentacion dictada en entornos profesionales: informes, actas de reunion o notas clinicas dictadas en croata, con la ventaja de que el procesamiento es local y no requiere conexion.
- Integracion en pipelines offline con transcribe.cpp: al existir pesos GGUF, se puede incrustar la transcripcion en herramientas de escritorio, scripts de linea de comandos o aplicaciones sin GPU, con un consumo de memoria de aproximadamente 1 GB.
- Evaluacion y ajuste de ASR para lenguas minorizadas: sirve como referencia metodologica para replicar el flujo (modelo multilingue base, corpus propio de unas 340 horas, aumento con ruido y silencio) en otros idiomas con pocos recursos.

## Benchmarks y rendimiento

Resultados declarados por el autor: WER con formato de numeros normalizado y decodificacion greedy, usando el GGUF Q5_K_M en transcribe.cpp.

| Conjunto de evaluacion | Canary 1B v2 | Diktafon Dictate HR 1 |
|---|---:|---:|
| Dictado, 50 clips, un hablante | 8,6% | 4,7% |
| Mismos clips con reverberacion y ruido de fondo (10 dB SNR) | 19,0% | 11,9% |
| Mismos clips unidos en entradas de 25 a 45 s | 14,4% | 5,2% |
| Voluntarios, 44 clips, 5 hablantes | 18,6% | 12,0% |

Dato de rendimiento adicional: en un Apple M2 Pro, el GGUF Q5_K_M se ejecuta a 43x tiempo real con un consumo de 1,02 GB. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice) en la informacion disponible, y los conjuntos de evaluacion son pequenos, por lo que el propio autor advierte que las diferencias inferiores a un punto deben tratarse como ruido.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para pesos en precision completa o media (bf16/fp16) sobre un modelo de 1.000 millones de parametros; alrededor de 1,02 GB para el GGUF Q5_K_M.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria es suficiente. Una RTX 3060, RTX 4060 o superior ejecuta el modelo sin problemas; A100 y H100 lo ejecutan con margen amplio, aunque estan sobredimensionadas para esta carga.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3050 en adelante) e incluso en graficas integradas con memoria compartida suficiente.
- Apple Silicon: el autor reporta 43x tiempo real en un M2 Pro con la cuantizacion Q5_K_M, lo que indica que tambien es viable en portatiles.
- CPU: la version GGUF permite inferencia en CPU, adecuada para transcripcion por lotes o en segundo plano.
- Opciones de despliegue: NeMo (nemo_toolkit) para los pesos .nemo y transcribe.cpp para el formato GGUF. No se documenta soporte en vLLM, TGI, Ollama o llama.cpp, que estan orientados a modelos de lenguaje y no a este pipeline de ASR.
- Latencia y throughput: 43x tiempo real en M2 Pro con Q5_K_M, es decir, aproximadamente 1,4 segundos de proceso por minuto de audio. No se proporcionan cifras para GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | WER en dictado croata |
|---|---|---|---|---|---|
| infomiho/diktafon-dictate-hr-1 | ~1.000 M | < 40 s recomendado | Croata | CC BY 4.0 | 4,7% (clips limpios), 12,0% (voluntarios) |
| nvidia/canary-1b-v2 | ~1.000 M | No disponible en esta informacion | Multilingue (incluye croata) | CC BY 4.0 | 8,6% (clips limpios), 18,6% (voluntarios) |
| openai/whisper-large-v3 | 1.550 M | 30 s | Multilingue (99 idiomas) | Apache 2.0 | No disponible |

La comparacion directa con Canary 1B v2 es la mas significativa, porque el ajuste parte de ese checkpoint y los conjuntos de evaluacion son los mismos: la mejora es de 3,9 puntos en clips limpios, 7,1 puntos con ruido, 9,2 puntos en entradas largas y 6,6 puntos en el conjunto de voluntarios. Para Whisper large-v3 no hay resultados publicados en la informacion disponible, y cualquier comparacion con modelos multilingues genericos deberia hacerse con un conjunto de evaluacion croata propio.

## Limitaciones y advertencias

- Modelo monoidioma: solo croata. No se evaluaron los demas idiomas del modelo base Canary tras el ajuste fino, por lo que su capacidad multilingue original puede haberse degradado.
- El error mas frecuente declarado son las palabras inglesas dentro de frases en croata; el autor cita el ejemplo "secret source" en lugar de "secret sauce".
- Sesgo de hablante: la evaluacion de dictado esta dominada por la voz de un unico hablante y el conjunto de voluntarios solo tiene 44 clips de 5 hablantes, de modo que las diferencias inferiores a un punto porcentual no son estadisticamente significativas.
- Riesgo de bucle en decodificacion: en clips cortos con repeticiones ("da, da, da"), la decodificacion greedy puede entrar en bucle hasta alcanzar el limite de tokens, igual que ocurre en Canary original. Conviene fijar un limite de tokens y segmentar el audio.
- Ventana de audio limitada: no esta pensado para audios largos sin trocear. La aplicacion original corta el dictado en las pausas; en integraciones propias hay que replicar esa logica.
- Formato de numeros: los numeros se emiten como palabras. Sin un paso de normalizacion posterior (como Diktafon Polisher HR 1), las transcripciones no son directamente procesables por sistemas que esperan digitos.
- Licencia CC BY 4.0: permite uso comercial y modificaciones, pero exige atribucion al autor y al modelo base NVIDIA Canary 1B v2, e indicar si se han realizado cambios. No incluye clausula de patentes ni garantias.
- Procedencia del corpus de aumento: parte del ruido de fondo proviene de OpenSLR 28, con licencia Apache 2.0; conviene verificar los terminos de los corpus de pódcast y de las grabaciones de voluntarios antes de un uso comercial a gran escala.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documentan procesos de validacion externos ni auditorias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infomiho/diktafon-dictate-hr-1
- Version GGUF para transcribe.cpp: https://huggingface.co/infomiho/diktafon-dictate-hr-1-GGUF
- Modelo base NVIDIA Canary 1B v2: https://huggingface.co/nvidia/canary-1b-v2
- Aplicacion Diktafon: https://diktafon.miho.dev
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Corpus de ruido OpenSLR 28: https://www.openslr.org/28/

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor o su arquitectura; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos de HuggingFace.
