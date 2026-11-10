# coder543/granite-speech-5.0-470m-turboctc-glade

## Resumen

Granite Speech 5.0 470M TurboCTC for Glade es una conversión del reconocedor de voz CTC multilingüe de IBM, `ibm-granite/granite-speech-5.0-470m-turboctc`, empaquetada por el usuario `coder543` para su ejecución en el runtime Glade sobre Apple Silicon. El modelo original resuelve reconocimiento automático de voz (ASR) con puntuación y capitalización nativas en siete idiomas (inglés, francés, alemán, español, portugués, italiano y japonés) y aquí se distribuye como artefacto `.aimodel` con pesos int8 y activaciones FP16, pensado para aprovechar la Neural Engine (ANE) de los chips M-series y A-series.

La relevancia de esta ficha no está en el modelo base —un CTC de 470M parámetros— sino en el formato de despliegue: Glade compila y especializa el grafo para el dispositivo en el primer uso, lo que permite alcanzar velocidades de transcripción muy por encima del tiempo real (hasta 466× RTFx en un M5 Max) con una huella de memoria de proceso de unos 860 MB. Es, por tanto, una opción orientada a inferencia local en macOS 27 e iOS 27, no a servidores con GPU convencionales.

La licencia Apache 2.0 se mantiene tanto en el modelo upstream como en los pesos convertidos, y el autor documenta explícitamente que las métricas de calidad publicadas son verificaciones limitadas de conversión, no un benchmark amplio de precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Reconocedor CTC basado en transformer con atención relativa en forma Fourier; grafo compilado para Apple Neural Engine |
| Parámetros totales | 470M (según el nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el grafo admite buckets de capacidad de 3072 frames de entrada a 50 frames/s (aprox. 61,4 s por petición) |
| Tipos de cuantización | Pesos int8, activaciones FP16; proyecciones de salida de convolución y de posición relativa conservan FP16 |
| Idiomas soportados | en, fr, de, es, pt, it, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (assets Glade/Core AI); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un reconocedor CTC (Connectionist Temporal Classification) de 470M parámetros que produce transcripciones con puntuación y capitalización nativas, sin necesidad de un modelo de lenguaje externo para el formateo. La conversión a Glade mantiene la atención relativa en su forma Fourier, conservando todos los desplazamientos y frecuencias sin reducción de ventana de atención ni del contexto. El grafo acepta características log-mel y delta específicas del modelo junto con una máscara de validez; no acepta audio en bruto, por lo que requiere un frontend anfitrión y un colapso CTC con tokenizador.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO en el modelo upstream. La conversión se realizó desde el commit `1dd23f46f6d4e6eae2531982ba2e33220086dd97` y, según el autor, la reescritura del grafo en FP32 preservó exactamente los identificadores de frame de calibración antes de la cuantización.

## Capacidades

- Reconocimiento automático de voz multilingüe en inglés, francés, alemán, español, portugués, italiano y japonés.
- Puntuación y capitalización nativas en la salida, sin postprocesado con modelo de lenguaje.
- Procesamiento de audio largo mediante particionado en fragmentos sin pérdida, con planificación de cortes en límites de silencio.
- Ejecución de hasta dos peticiones de encoder concurrentes en vuelo.
- Inferencia sobre la Neural Engine con pesos int8 y activaciones FP16.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de modo de pensamiento, visión ni audio de salida.

## Casos de uso

- Transcripción local de reuniones en macOS: el modelo procesa un audio de 18 minutos en 2,35 s en un M5 Max, lo que permite transcribir reuniones completas en el portátil sin enviar datos a la nube.
- Dictado en aplicaciones iOS: con una latencia de 0,142 s para un clip de 20 segundos en un iPhone 15 Pro Max, es viable como motor de dictado en tiempo real dentro de apps nativas.
- Subtitulado de archivos de vídeo: el particionado en fragmentos de hasta 60 segundos y la salida con puntuación facilitan generar subtítulos listos para revisión sin postprocesado lingüístico.
- Archivado y búsqueda de grabaciones: la velocidad de 445× RTFx en un M3 MacBook Air permite indexar grandes volúmenes de audio histórico en minutos.
- Transcripción multilingüe en atención al cliente: al cubrir siete idiomas con un único modelo, se puede procesar audio de soporte en distintos mercados sin cambiar de pipeline.
- Aplicaciones de accesibilidad: la baja huella de memoria (unos 862 MB de proceso en Mac) y la ejecución en ANE liberan la GPU y permiten integrar transcripción en apps de asistencia auditiva.
- Procesamiento por lotes en el dispositivo: la planificación de fragmentos con dos peticiones concurrentes permite transcribir lotes de notas de voz en segundo plano en iOS.

## Benchmarks y rendimiento

| Dispositivo | Audio | Tiempo mediano | RTFx |
|---|---|---:|---:|
| M3 MacBook Air, 16 GB | Extracto de 20 s | 0,128 s | 156,7× |
| M3 MacBook Air, 16 GB | Completo 18 min 15 s | 2,459 s | 445,3× |
| iPhone 15 Pro Max | Extracto de 20 s | 0,142 s | 141,3× |
| iPhone 15 Pro Max | Completo 18 min 15 s | 3,684 s | 297,3× |
| M5 Max (18 CPU, 40 GPU, 64 GB) | Completo 18 min 15 s | 2,350 s | 466,1× |

| Métrica de calidad | Glade int8 (dispositivo) | Transformers 5.16.1 FP32 |
|---|---:|---:|
| WER normalizado Whisper | 54/2.220 (2,43 %) | 53/2.220 (2,39 %) |

En el M5 Max, el control con PCM precargado tarda 2,202 s (497,3× RTFx). La preparación inicial observada es de 95,9 s en el M3 MacBook Air y 105,6 s en el iPhone 15 Pro Max, con preparación en caché de 0,070 s y 0,092 s respectivamente. El payload en tiempo de ejecución es de aproximadamente 510,6 MB.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| granite-speech-5.0-470m-turboctc-glade | 470M | 7 | `.aimodel` (Glade) | Apache 2.0 | Apple Silicon (macOS 27 / iOS 27) |
| ibm-granite/granite-speech-5.0-470m-turboctc | 470M | 7 | Transformers FP32 | Apache 2.0 | GPU/CPU convencionales |
| Whisper (variantes) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información |

La comparativa se limita al modelo upstream, ya que la información proporcionada no incluye datos de otros reconocedores CTC comparables. El WER de referencia citado en la model card es el normalizado de Whisper, pero no se aportan resultados de Whisper sobre el mismo conjunto.

## Limitaciones y advertencias

- Requiere Core AI sobre Apple Silicon físico con macOS 27 o iOS 27; no funciona en otros sistemas ni en hardware sin Neural Engine compatible.
- El grafo no acepta audio en bruto: es imprescindible un frontend que calcule características log-mel y delta, además de un colapso CTC y un tokenizador.
- El bucket de capacidad es de 3072 frames a 50 frames/s (unos 61,4 s); grabaciones más largas deben dividirse en fragmentos sin descartar audio.
- Los assets `.aimodel` se especializan en el primer uso y no son `.aimodelc` precompilados; la compilación y la ubicación de ejecución dependen del sistema y del dispositivo, y la expulsión de caché puede obligar a repetir la preparación.
- La verificación de calidad es limitada: siete clips sintéticos preservan las palabras FP32 en los siete idiomas, pero la puntuación en francés y las mayúsculas en alemán difieren.
- Las transcripciones pueden variar entre dispositivos aunque el WER agregado coincida.
- No se han publicado datos sobre sesgos, tasas de alucinación ni robustez ante acentos o ruido de fondo.
- Aunque la licencia Apache 2.0 permite uso comercial, el despliegue está restringido de facto por los requisitos de plataforma de Apple.
- Las cifras de memoria excluyen las asignaciones del driver y servicio de ANE, por lo que no representan el consumo total del dispositivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/coder543/granite-speech-5.0-470m-turboctc-glade)
- [Modelo base en Hugging Face](https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc)
- [Commit de origen de la conversión](https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/1dd23f46f6d4e6eae2531982ba2e33220086dd97)
