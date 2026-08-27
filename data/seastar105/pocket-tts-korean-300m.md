# seastar105/pocket-tts-korean-300m

## Resumen
Pocket-TTS Korean 300M es un modelo de síntesis de voz (text-to-speech) en coreano con capacidad de clonación de voz zero-shot, desarrollado por la comunidad (seastar105) a partir del checkpoint oficial en inglés de Kyutai Pocket-TTS. Se trata de una adaptación del modelo teacher de 24 capas, no del student estándar de 6 capas, por lo que el nombre "300M" es aproximado: el recuento real de parámetros es de 336.067.970. El modelo está diseñado para ser compatible con el paquete oficial de Python y la CLI de Pocket-TTS, lo que facilita su integración en proyectos existentes.

El modelo resuelve el problema de la falta de modelos TTS ligeros y de código abierto con buena calidad para coreano, ofreciendo clonación de voz a partir de un breve audio de referencia (voice prompt) y generación de habla natural. Su relevancia actual radica en que es uno de los pocos modelos de este tipo con licencia permisiva CC BY 4.0, lo que permite uso comercial con atribución. Está entrenado con 2.276 horas de habla coreana procedente de las fuentes Emilia y YODAS, y su arquitectura FlowLM con destilación auto-supervisada Lagrangiana (LSD) y el codec de audio Mimi le permite generar audio de 24 kHz con una latencia de 12,5 frames latentes por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket-TTS FlowLM con Lagrangian Self Distillation (LSD) y codec Mimi |
| Parametros totales | 336.067.970 (FlowLM: 316.013.633; Mimi: 20.054.337) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 safetensors (no se documentan cuantizaciones adicionales) |
| Idiomas soportados | coreano (principal); ingles no evaluado sistematicamente |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (bundle formato Pocket-TTS) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Pocket-TTS FlowLM, que combina un transformer de 24 capas con dimension de modelo 1024 y 16 cabezas de atencion, junto con el codec neuronal de audio Mimi para la representacion latente del habla. El entrenamiento se realizo mediante warm-start desde el checkpoint ingles de 24 capas de Kyutai, reinicializando unicamente el embedding del tokenizador SentencePiece coreano (4.000 tokens) y adaptando el resto del modelo. Se empleo un dataset de 918.609 utterances (2.276,88 horas) de habla coreana preparada a partir de las fuentes Emilia y YODAS, sin reconciliacion de transcripciones.

El proceso de entrenamiento utilizo 4 GPU NVIDIA RTX 5090 con DDP, batch global de 64, optimizador AdamW con learning rate 2e-4 y weight decay 0.1, con 1.000 pasos de warmup seguidos de learning rate constante. Se aplico un multiplicador de flujo (flow batch multiplier) de 4, EMA decay de 0.999 y compilacion activada. El checkpoint publicado corresponde al paso 50.000, con pesos EMA para FlowLM y el codec Mimi congelado, todo empaquetado en un unico archivo safetensors en formato float32.

## Capacidades
- Sintesis de voz en coreano con clonacion de voz zero-shot a partir de un audio de referencia (voice prompt) de habla limpia.
- Generacion de audio monofonico a 24 kHz con 12,5 frames latentes por segundo.
- Compatible con el paquete oficial de Python `pocket-tts` y con la CLI `uvx pocket-tts generate`.
- Capacidad de mantener el modelo y el estado de voz en memoria para sintetizar multiples utterances de forma eficiente.
- Soporte para configuracion via archivo YAML alojado en HuggingFace (`korean.yaml`).
- Generacion de audio de hasta 30 segundos de duracion maxima evaluada.
- No soporta tool calling ni capacidades de agente, al ser un modelo exclusivamente de audio.

## Casos de uso
- Creacion de audiolibros en coreano: el modelo puede generar narracion continua a partir de texto, manteniendo una voz consistente mediante un prompt de voz fijo, lo que permite producir largos pasajes sin necesidad de grabacion humana.
- Doblaje de contenido audiovisual: con un clip de voz de un actor o actriz con consentimiento, se puede generar dialogo doblado en coreano manteniendo la identidad vocal, reduciendo costes de produccion.
- Asistentes de voz y chatbots con interfaz hablada: integrable en sistemas de atencion al cliente o asistentes personales que requieran respuesta oral en coreano, con la ventaja de poder cambiar la voz del asistente facilmente.
- Generacion de contenido para educacion y e-learning: produccion de material didactico hablado en coreano, con la posibilidad de usar multiples voces para diferenciar personajes o roles en lecciones interactivas.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: conversion de texto coreano a voz de alta calidad, con voces naturales que mejoran la experiencia de lectura de pantalla.
- Prototipado rapido de productos con voz: gracias a su licencia CC BY 4.0 y su compatibilidad con la CLI, es adecuado para startups que necesitan validar conceptos de productos con voz en coreano sin invertir en infraestructura de grabacion.

## Benchmarks y rendimiento
El autor evaluo cinco checkpoints crudos (10k, 20k, 30k, 40k y 50k) sobre los 500 items coreanos zero-shot de yuekai/CV3-Eval, con generacion a temperatura 0.3, CFG 2.0 y un paso de decodificacion LSD. La evaluacion uso whisper-large-v3 para ASR, wavlm-base-plus-sv para similitud de locutor y UTMOS para calidad estimada.

| Checkpoint | CER | No-space CER | Similitud WavLM | UTMOS | Silencios | Sin EOS |
|---|---:|---:|---:|---:|---:|---:|
| 10k | 6,9708% | 7,1138% | 0,92635 | 2,89689 | 0 | 0 |
| 20k | 6,6097% | 6,5807% | 0,92592 | 2,80539 | 0 | 0 |
| 30k | 7,1381% | 7,1596% | 0,92671 | 2,72743 | 0 | 0 |
| 40k | 7,0897% | 7,0278% | 0,92840 | 2,84773 | 0 | 1 |
| 50k | 6,6273% | 6,5520% | 0,92492 | 2,86847 | 0 | 1 |

Nota: la tabla refleja checkpoints de entrenamiento crudos. El archivo distribuido `model.safetensors` contiene la exportacion EMA del paso 50k, que no fue puntuada de forma independiente.

## Requisitos de hardware
- VRAM estimada: no disponible en la documentacion, pero al ser un modelo de 336M parametros en float32, el peso del modelo ocupa aproximadamente 1,3 GB, por lo que cabria en GPUs consumer con 4 GB o mas de VRAM.
- GPU recomendadas: el entrenamiento se realizo con NVIDIA RTX 5090, pero para inferencia cualquier GPU moderna con al menos 4 GB de VRAM deberia ser suficiente. En CPU se espera un funcionamiento mas lento que los modelos student de ~100M de Pocket-TTS.
- Compatibilidad con consumer GPU: si, cabe en GPUs como RTX 3060, RTX 4060, etc., siempre que se gestione la memoria.
- Opciones de despliegue: el modelo se usa mediante el paquete oficial `pocket-tts` (Python 3.10+, PyTorch 2.5+) o la CLI `uvx pocket-tts generate`. No se documenta soporte para vLLM, Ollama o TGI, al ser un modelo de audio con su propio runtime.
- Latencia y throughput: no disponible. El autor advierte que al ser el modelo teacher de 24 capas, es mas lento en CPU que los modelos student oficiales.

## Comparativa con modelos similares
| Modelo | Parametros | Idioma | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Pocket-TTS Korean 300M (este) | 336M | coreano | CC BY 4.0 | no disponible | Teacher de 24 capas, clonacion zero-shot |
| Pocket-TTS oficial (student) | ~100M | ingles | CC BY 4.0 | no disponible | Student de 6 capas, mas rapido en CPU |
| XTTS v2 (Coqui) | ~467M | multilingue (incl. coreano) | CPML (no comercial) | no disponible | Clonacion zero-shot, pero licencia restrictiva |

La comparativa se limita a modelos TTS de clonacion zero-shot. El modelo de seastar105 ofrece la ventaja de una licencia permisiva CC BY 4.0 frente a XTTS v2, aunque con un unico idioma principal. Frente al student oficial de Pocket-TTS, este modelo es mas grande y lento, pero esta adaptado al coreano.

## Limitaciones y advertencias
- El modelo esta pensado principalmente para coreano. El ingles, el code-switching, numeros, abreviaturas, nombres raros y puntuacion inusual no fueron evaluados sistematicamente.
- En la evaluacion CV3 se encontro una salida sin token EOS a los 30 segundos en el checkpoint crudo de 50k.
- UTMOS es una estimacion automatica y puede ser menos fiable para coreano que para los datos con los que fue desarrollado.
- No se ha realizado ninguna prueba de escucha humana, auditoria de equidad demografica ni auditoria de robustez.
- La calidad de salida y la identidad del locutor dependen en gran medida de la limpieza, duracion y condiciones de grabacion del prompt de voz, asi como de la cobertura de locutores con consentimiento.
- Pocket-TTS procesa una peticion cada vez y no es thread-safe.
- Solo se debe clonar o imitar una voz con el consentimiento explicito y legal del locutor. No usar para suplantacion, fraude, desinformacion, acoso, invasion de privacidad o actividades ilegales.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero los datos de entrenamiento (audio y transcripciones) no se redistribuyen en el repositorio.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/seastar105/pocket-tts-korean-300m
- Repositorio de entrenamiento: https://github.com/seastar105/pocket-tts-korean-training
- Proyecto Pocket-TTS: https://github.com/kyutai-labs/pocket-tts
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Paper: https://arxiv.org/abs/2509.06926
- Web del proyecto: https://pockettts.org/
