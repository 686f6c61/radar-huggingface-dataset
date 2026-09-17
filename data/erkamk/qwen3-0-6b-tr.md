# erkamk/qwen3-0.6b-tr

## Resumen

qwen3-0.6b-tr es una adaptación al turco del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-Base, desarrollada por el usuario erkamk y publicada bajo licencia Apache 2.0. Se trata de un sistema text-to-speech con clonación de voz zero-shot: basta con una grabación de referencia limpia de 5 a 10 segundos en turco para fijar la identidad del hablante, sin necesidad de un ajuste fino por voz ni de una lista cerrada de voces. El modelo resuelve la generación de habla natural en turco a partir de texto, un idioma con menos cobertura que el inglés en los sistemas TTS de código abierto.

Técnicamente, el sistema empaqueta unos 0,6B parámetros de "talker" (el decodificador que genera los tokens de audio) más un tokenizador de habla, con un total de 914.643.008 parámetros registrados en los ficheros safetensors. El audio se genera a una frecuencia de trama de 12 Hz y una frecuencia de muestreo de 24 kHz. Solo se entrenó el talker: el códec de audio y el codificador de hablante permanecen congelados respecto al modelo base.

El entrenamiento se realizó sobre aproximadamente 2.277 horas de habla leída en turco procedentes del corpus Kiraat, con 1.388.236 clips y 54 hablantes. Es relevante ahora porque demuestra que es posible adaptar un TTS multilingüe a un idioma concreto con un único epoch de ajuste fino (21.691 actualizaciones) y obtener muestras de calidad, aunque el propio autor advierte de que el modelo está infraentrenado (la pérdida de validación seguía bajando de 2.885 a 2.710 al terminar).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only ("talker") sobre base Qwen3-TTS, con tokenizador de habla (códec) a 12 Hz y codificador de hablante (x-vector) congelados |
| Parametros totales | 914.643.008 (safetensors); el autor indica ~1,1B empaquetados (0,6B de talker + tokenizador de habla) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; se recomienda texto de varios párrafos por llamada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr); condicionamiento `Auto`, sin token de idioma nuevo |
| Licencia | Apache 2.0 (heredada del modelo base Qwen) |
| Formato de pesos | safetensors |

Especificaciones adicionales: frecuencia de trama de audio de 12 Hz, frecuencia de muestreo de 24 kHz, salida no streaming (non-streaming), control de voz mediante grabación de referencia y modo `x_vector_only_mode=True`.

## Arquitectura y entrenamiento

El modelo es una adaptación del checkpoint Qwen3-TTS-12Hz-0.6B-Base (revisión `5d83992`). La arquitectura combina un "talker" (el componente generativo principal, de aproximadamente 0,6B parámetros) con un tokenizador de habla que opera a 12 Hz y un codificador de hablante que produce un x-vector a partir de la grabación de referencia. En esta adaptación solo se entrenó el talker; tanto el códec de audio como el codificador de hablante se mantuvieron congelados desde el modelo base, lo que reduce el coste de adaptación y preserva las capacidades de representación del tokenizador.

Los datos de entrenamiento provienen del dataset `serdarcaglar/kiraat` (revisión `75b3297`), filtrado por duración, ratio de habla, consistencia de hablante y calidad de audio. El conjunto final sumó 1.388.236 clips, unas 2.277 horas de audio, 54 hablantes y 2.540 grabaciones fuente. Se reservaron 128 clips para desarrollo y otros 128 para test. El texto se mantuvo en su forma hablada y se eliminaron las grabaciones cuyo texto se solapaba con los conjuntos de evaluación, conservando lecturas separadas del mismo texto. El entrenamiento consistió en un único epoch (21.691 actualizaciones, 64 clips por actualización), con una pérdida de desarrollo que pasó de 2.885 a 2.710. No se aplicaron fases de RLHF ni DPO; el autor señala explícitamente el aprendizaje por refuerzo con un juez automático en turco como el siguiente paso previsto.

## Capacidades

- Síntesis de voz en turco (text-to-speech) de forma no streaming a 24 kHz.
- Clonación de voz zero-shot: la identidad del hablante se controla con una grabación de referencia limpia de 5 a 10 segundos, sin ajuste fino por voz.
- Generación de párrafos: el autor indica que el texto de longitud de párrafo (varias frases por llamada) funciona bien.
- Condicionamiento de idioma mediante `Auto`, sin token de idioma específico para el turco.
- Integración mediante la librería Python `qwen_tts` (`Qwen3TTSModel.from_pretrained`).
- No soporta cambio de código (code-switching) turco-inglés.
- No dispone de modo streaming ni de tool calling, razonamiento o visión: es exclusivamente un modelo de voz.

## Casos de uso

- Audiolibros y narración en turco: el modelo acepta texto de varios párrafos por llamada y mantiene un timbre coherente a partir de una única referencia de voz, lo que permite narrar capítulos largos con un solo hablante clonado.
- Locuciones para vídeo y podcasts: se puede clonar la voz del creador con 5-10 segundos de audio limpio y generar guiones completos sin desplazarse a un estudio.
- Sistemas de accesibilidad: conversión de artículos, documentación o prensa escrita en turco a audio para personas con discapacidad visual, con voces personalizadas para cada usuario.
- Asistentes de voz y atención al cliente en turco: generación de respuestas habladas con una voz corporativa fija clonada a partir de una grabación de referencia, útil en líneas de soporte automatizadas.
- Doblaje y localización de contenido al turco: sustitución de pistas de voz en vídeos educativos o corporativos manteniendo una identidad de hablante concreta entre segmentos.
- Prototipado de interfaces conversacionales: generación rápida de muestras de voz para pruebas de UX antes de contratar una locución profesional, dado que el modelo cabe en GPU de consumo.
- Investigación en TTS para lenguas de bajos recursos: sirve como punto de partida para estudiar el ajuste fino de un talker sobre corpus leídos y para experimentar con recompensas de RL orientadas a la pronunciación.
- Preservación y documentación de variedades del turco: al admitir referencias de voz arbitrarias, permite registrar y reproducir la voz de hablantes concretos con fines de archivo, siempre que se respeten los derechos de las grabaciones originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: pérdida de desarrollo de 2.885 a 2.710 a lo largo de 21.691 actualizaciones, con un único epoch completado y sin convergencia (el autor indica que la pérdida seguía mejorando al terminar). No hay datos de WER, MOS, similitud de hablante ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16 los pesos ocupan aproximadamente 1,83 GB (914.643.008 parámetros × 2 bytes); con activaciones, estados del códec y buffers de audio, conviene reservar del orden de 3-5 GB. En FP32 serían unos 3,66 GB solo de pesos.
- GPU recomendadas: el modelo cabe en cualquier GPU de consumo moderna. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 son suficientes. Para despliegue en servidor, una A100 o H100 resultan sobredimensionadas para un único flujo, aunque permiten alta concurrencia.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 6 GB o más de VRAM en FP16.
- Opciones de despliegue: la vía documentada es la librería Python `qwen_tts` con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni se ofrecen pesos en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. La salida es no streaming, por lo que no hay generación incremental de audio.
- Tamaño del repositorio: 4,4 GB, lo que incluye pesos y artefactos asociados.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de trama | Frecuencia de muestreo | Idiomas | Clonacion de voz | Licencia |
|---|---|---|---|---|---|---|
| erkamk/qwen3-0.6b-tr | 914.643.008 (safetensors) | 12 Hz | 24 kHz | Turco | Sí, con referencia de 5-10 s | Apache 2.0 |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | No disponible | 12 Hz | 24 kHz | No disponible (modelo base multilingüe) | Sí (base para clonación) | Apache 2.0 |
| Otros sistemas TTS en turco | No disponible | No disponible | No disponible | Turco | No disponible | No disponible |

La información proporcionada no incluye datos verificables de otros sistemas TTS en turco (ni parámetros, ni métricas, ni licencias), por lo que la comparación cuantitativa con alternativas queda como no disponible. La única comparación documentada es con el modelo base del que deriva, que conserva la misma arquitectura de tokenizador y frecuencias.

## Limitaciones y advertencias

- Números escritos con dígitos: el entrenamiento conservó las formas habladas, por lo que entradas como "1.299,90 TL" suelen producirse de forma defectuosa. El autor recomienda escribir precios y fechas en palabras antes de la síntesis (por ejemplo, "bin iki yüz doksan dokuz lira doksan kuruş"), lo que corrige la mayoría de los casos sin reentrenar.
- Palabras en inglés y nombres de marca: términos como "WhatsApp" o "iPhone", y frases mixtas turco-inglés, generan resultados inestables. No hay soporte de code-switching en esta versión.
- Infraentrenamiento: el modelo solo completó un epoch (21.691 actualizaciones) y la pérdida de desarrollo seguía descendiendo (de 2.885 a 2.710), de modo que está infraentrenado en lugar de convergido. El autor anticipa que un entrenamiento más largo y datos más amplios mejorarían el resultado.
- Pronunciación: los problemas de pronunciación de dígitos e inglés son candidatos naturales a un ajuste por RL con un juez automático en turco, fase que aún no se ha realizado.
- Condiciones de uso restringidas por diseño: solo se entrenaron y probaron el modo `x_vector_only_mode=True` y `non_streaming_mode=True`; no se garantiza el comportamiento con otros modos de generación.
- Dependencia de la referencia de voz: la calidad de la clonación depende de una grabación de 5-10 segundos con un solo hablante, sin música ni ruido y a nivel de habla normal.
- Atribución de datos: el corpus Kiraat está sujeto a puerta (gated) y sus términos establecen que los derechos de las grabaciones originales permanecen en manos de sus titulares; esa atribución debe conservarse en cualquier redistribución.
- Licencia: los pesos se liberan bajo Apache 2.0, heredada del modelo base Qwen, lo que permite uso comercial, pero las restricciones del corpus de entrenamiento pueden afectar a la redistribución de derivados.
- Riesgo de alucinación sonora: como todo sistema TTS, puede producir pronunciaciones plausibles pero incorrectas en términos o nombres propios no vistos durante el entrenamiento; no hay métricas publicadas de tasa de error que permitan acotar este riesgo.
- Idiomas: el modelo está orientado exclusivamente al turco y no se ha validado su comportamiento en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erkamk/qwen3-0.6b-tr
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Revisión del modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base/commit/5d83992436eae1d760afd27aff78a71d676296fc
- Dataset de entrenamiento (Kiraat): https://huggingface.co/datasets/serdarcaglar/kiraat
- Revisión del dataset: https://huggingface.co/datasets/serdarcaglar/kiraat/commit/75b3297b0d9d3bb00547c7c4ab871f53f5a0fc79
- Muestras de audio: https://huggingface.co/erkamk/qwen3-0.6b-tr/resolve/main/samples/voice-01.wav
