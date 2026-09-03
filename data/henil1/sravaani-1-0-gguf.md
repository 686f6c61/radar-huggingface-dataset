# Henil1/Sravaani-1.0-GGUF

## Resumen

Sravaani-1.0 GGUF es una conversión al formato GGUF del modelo de reconocimiento automático de voz (ASR) SraVaani-1.0, desarrollado por ARTPARK en el Indian Institute of Science (IISc). Esta conversión, realizada por Henil1, permite ejecutar el modelo en CPU mediante parakeet.cpp, un runtime ligero que no requiere Python, PyTorch ni NeMo. El modelo original es un FastConformer-TDT (transducer) de 443,62 millones de parámetros, entrenado para transcribir 12 idiomas de la India (hindi, maratí, tamil, telugu, bengalí, gujaratí, canarés, malayalam, punjabí, oriya, asamés e inglés) con salida en escritura nativa.

La relevancia de esta conversión radica en que democratiza el acceso a un modelo ASR multilingüe de alta calidad para idiomas con menos recursos, permitiendo su despliegue en entornos sin GPU. El modelo detecta automáticamente el idioma de entrada y no requiere un token de idioma. Se ofrecen tres cuantizaciones (f16, q8_0 y q4_k) que equilibran tamaño y fidelidad, con un peso de entre 471 MB y 1016 MB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo FastConformer-TDT (transducer) |
| Parametros totales | 443,62 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, ventana de 16 kHz) |
| Tipos de cuantizacion | f16, q8_0, q4_k |
| Idiomas soportados | hi, mr, ta, te, bn, gu, kn, ml, pa, or, as, en |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer-TDT, una variante del conformer con subsampling temporal (dw_striding x8, 256 canales) y un decodificador transducer de tipo token-and-duration (TDT). El encoder tiene 1024 dimensiones de modelo, 17 capas y 8 cabezas de atención. El predictor es una capa LSTM de 640 unidades ocultas, y la joint produce 5006 salidas (5000 piezas de vocabulario SentencePiece, más blank y 5 duraciones). El modelo procesa audio de 16 kHz con características mel de 128 bandas (n_fft 512, ventana 400, hop 160).

No se dispone de información sobre el entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La conversión GGUF se realizó reconstruyendo los pesos desde el grafo TorchScript original, ya que no existía un checkpoint .nemo. Se validó con una carga estricta de 705 tensores sin errores y se verificó una transcripción exacta contra la implementación original.

## Capacidades

- Reconocimiento automático de voz multilingüe para 12 idiomas de la India (hindi, maratí, tamil, telugu, bengalí, gujaratí, canarés, malayalam, punjabí, oriya, asamés e inglés).
- Detección automática de idioma sin necesidad de token de idioma; la salida se genera en escritura nativa.
- Inferencia en CPU mediante parakeet.cpp, sin dependencias de Python, PyTorch, NeMo ni ONNX Runtime.
- Decodificación TDT (token-and-duration transducer) que produce transcripciones con marcas de duración.
- Soporte para cuantización GGUF (q8_0, q4_k) que reduce el tamaño del modelo manteniendo una fidelidad alta (WER 0.000 para q8_0 respecto a f16 en pruebas limitadas).
- Procesamiento de audio de 16 kHz mono en formato WAV PCM de 16 bits.

## Casos de uso

- Transcripción de reuniones y conferencias en hindi y otros idiomas indios: el modelo puede ejecutarse en un portátil sin GPU, procesando audio en tiempo real o casi tiempo real (6-7x más rápido que tiempo real en CPU).
- Subtitulado automático de vídeos en plataformas de streaming: al soportar 12 idiomas, permite generar subtítulos en escritura nativa para contenido regional indio.
- Asistentes de voz en dispositivos edge: su tamaño reducido (471 MB en q4_k) y su ejecución en CPU lo hacen apto para dispositivos con recursos limitados, como routers o smart speakers.
- Archivado y búsqueda de audio histórico: transcripción de grabaciones de archivo en idiomas indios para indexación y búsqueda textual.
- Accesibilidad para personas con discapacidad auditiva: conversión de contenido hablado en tiempo real a texto en la lengua materna del usuario.
- Centros de atención al cliente: transcripción de llamadas en varios idiomas indios para análisis de calidad y cumplimiento normativo, sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER con ground truth) en la información disponible. La model card solo incluye una comparación entre cuantizaciones sobre una única frase en hindi, midiendo el daño de cuantización, no la precisión absoluta.

| Modelo | Tamaño | 1 hilo | 2 hilos | 4 hilos | 8 hilos | WER vs f16 |
|---|---|---|---|---|---|---|
| f16 | 1016 MB | 3,04 s | 2,07 s | 1,30 s | 1,20 s | 0,000 |
| q8_0 | 660 MB | 2,35 s | 1,86 s | 1,49 s | 1,33 s | 0,000 |
| q4_k | 471 MB | 2,52 s | 1,98 s | 1,51 s | 1,36 s | 0,062 |

Los tiempos corresponden a una única frase en hindi en un portátil Intel i7, mejor de 3 ejecuciones. El rendimiento es aproximadamente 6-7 veces más rápido que tiempo real. Se observa que el rendimiento no mejora más allá de 4 hilos.

## Requisitos de hardware

- CPU: funciona en procesadores x86_64; probado en un Intel i7 de portátil. No requiere GPU.
- RAM: al menos el tamaño del archivo del modelo (471 MB a 1016 MB) más overhead del runtime.
- Almacenamiento: entre 471 MB y 1016 MB según la cuantización.
- GPU: no necesaria; si se desea usar GPU, no se proporcionan datos de soporte en la documentación.
- Despliegue: se recomienda parakeet.cpp (binario parakeet-cli) desde los releases oficiales.
- Latencia: para una frase corta en hindi, entre 1,2 s y 3,0 s en CPU según el número de hilos y la cuantización.
- Throughput: aproximadamente 6-7x tiempo real en CPU con 4 hilos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos ASR multilingües de la India (como Whisper, IndicWav2Vec o Bhashini) en términos de rendimiento y precisión. La model card no incluye benchmarks comparativos. No disponible.

## Limitaciones y advertencias

- La precisión solo se ha verificado en hindi; los idiomas tamil y telugu son conocidos por ser más débiles en esta familia de modelos.
- El modelo base tiene una debilidad documentada con hablantes superpuestos y diafonía (crosstalk).
- La cuantización q4_k puede introducir variantes ortográficas ocasionales (por ejemplo, "यह" frente a "ये").
- La entrada debe ser audio WAV de 16 kHz mono PCM de 16 bits; otros formatos requieren conversión previa con ffmpeg.
- No se debe pasar el argumento --lang, ya que el modelo no tiene token de idioma y la detección es automática.
- El rendimiento no mejora con más de 4 hilos en las pruebas realizadas.
- No hay información sobre el entrenamiento (datos, técnicas de alineación), lo que limita la evaluación de sesgos.

## Enlaces

- Modelo GGUF: https://huggingface.co/Henil1/Sravaani-1.0-GGUF
- Modelo base: https://huggingface.co/ARTPARK-IISc/SraVaani-1.0
- Repositorio parakeet.cpp: https://github.com/mudler/parakeet.cpp
