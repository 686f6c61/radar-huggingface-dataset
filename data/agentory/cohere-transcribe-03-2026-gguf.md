# agentory/cohere-transcribe-03-2026-GGUF

## Resumen

`agentory/cohere-transcribe-03-2026-GGUF` es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) `CohereLabs/cohere-transcribe-03-2026`, desarrollado por Cohere. El modelo original es un ASR de aproximadamente 2.065 millones de parámetros (unos 2B) que, según la model card del conversor, alcanzó el primer puesto en la Open ASR Leaderboard con un WER medio de 5,42 en marzo de 2026. Esta versión GGUF permite la inferencia en CPU mediante el runtime C++ CrispASR, lo que facilita el despliegue en entornos sin GPU.

La arquitectura combina un encoder Conformer de 48 capas (d=1280, 8 cabezas, head_dim=160, FFN de 5120, kernel de convolución 9) con un decoder Transformer causal de 8 capas (d=1024, 8 cabezas, head_dim=128, FFN de 4096, contexto máximo de 1024). El vocabulario es de 16.384 tokens SentencePiece y la entrada de audio es mono a 16 kHz con 128 bins mel, n_fft=512, hop=160 y ventana de 400.

El modelo es relevante porque ofrece una alternativa de código abierto (Apache 2.0) con calidad de transcripción de primer nivel, y esta conversión GGUF añade la posibilidad de ejecutarlo en CPU con cuantizaciones de 1,21 GB a 3,85 GB, con velocidades cercanas o superiores al tiempo real (RTFx de 0,80x a 1,08x con 8 hilos). Soporta 14 idiomas: árabe, alemán, griego, inglés, español, francés, italiano, japonés, coreano, neerlandés, polaco, portugués, vietnamita y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer (48 capas) + decoder Transformer causal (8 capas) |
| Parametros totales | 2.065.804.048 (~2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens en el decoder; audio de entrada a 16 kHz |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_1, Q5_0, Q4_K |
| Idiomas soportados | ar, de, el, en, es, fr, it, ja, ko, nl, pl, pt, vi, zh (14) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder. El encoder es un Conformer de 48 capas con dimensión 1280, 8 cabezas de atención de dimensión 160, FFN de 5120 y kernel de convolución 9. El decoder es un Transformer causal de 8 capas con dimensión 1024, 8 cabezas de dimensión 128, FFN de 4096 y contexto máximo de 1024. El vocabulario consta de 16.384 tokens SentencePiece. La entrada de audio se procesa a 16 kHz mono con 128 bins mel, n_fft=512, hop=160 y ventana de 400.

El preprocesado del encoder incluye pre-énfasis (`y[n] = x[n] - 0.97·x[n-1]`), center-pad de 256 muestras, STFT con ventana Hann, banco de filtros mel de 128 bins, logaritmo y normalización por característica con desviación estándar sesgada. El subsampling convolucional reduce la secuencia temporal en un factor de 8 mediante 5 convoluciones con 3 pasos de stride 2. La atención del Conformer debe escalarse por `1/sqrt(head_dim)` antes del softmax para evitar salidas repetitivas. Las proyecciones de clave y valor de la atención cruzada se precalculan una vez por utterance desde la salida del encoder.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card del conversor no detalla estos aspectos.

## Capacidades

- Transcripción de voz a texto en 14 idiomas: árabe, alemán, griego, inglés, español, francés, italiano, japonés, coreano, neerlandés, polaco, portugués, vietnamita y chino.
- Reconocimiento automático del habla (ASR) con pipeline `automatic-speech-recognition`.
- Entrada de audio mono a 16 kHz con procesado mel de 128 bins.
- Selección de idioma mediante tokens especiales `<|xx|>`; el tokenizer contiene los 183 tokens ISO-639-1, aunque solo 14 están en la lista blanca.
- Inferencia en CPU mediante el runtime CrispASR con backend `cohere`.
- No se documentan capacidades de tool calling, agentes, visión, audio adicional ni modo thinking en la información disponible.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede convertir grabaciones de reuniones multilingües en texto, con la ventaja de ejecutarse en CPU sin GPU dedicada, lo que reduce costes de infraestructura para volúmenes moderados.
- Subtitulado de vídeo y audio: con cuantizaciones Q4_K de 1,21 GB y RTFx de 1,08x en 8 hilos, es viable generar subtítulos en tiempo real o casi real en servidores sin acelerador.
- Atención al cliente basada en voz: transcripción de llamadas en español, inglés, francés o alemán para alimentar sistemas de análisis de sentimiento o bases de conocimiento, usando la ventana de contexto de 1024 tokens del decoder.
- Archivado y búsqueda de contenido audiovisual: conversión de archivos de audio históricos a texto indexable en 14 idiomas, desplegable en entornos con CPU gracias a los tamaños reducidos de las cuantizaciones Q5 y Q6.
- Investigación lingüística y corpus: generación de transcripciones para estudios comparativos entre idiomas como árabe, japonés, coreano o vietnamita, con la advertencia de que la lista blanca de idiomas debe declararse explícitamente.
- Despliegue en dispositivos edge o servidores modestos: la versión Q4_K de 1,21 GB permite ejecutar ASR en máquinas sin GPU, adecuada para prototipos, demos o entornos con restricciones de hardware.
- Transcripción de notas de voz en aplicaciones móviles o de escritorio: integrable mediante CrispASR en aplicaciones que requieran procesamiento local sin enviar audio a la nube, con licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

La model card del conversor indica que el modelo base alcanzó el primer puesto en la Open ASR Leaderboard con un WER medio de 5,42 (a marzo de 2026). No se proporcionan resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Métrica | Valor |
|---|---|
| WER medio (Open ASR Leaderboard, marzo 2026) | 5,42 |
| RTFx F16 (8 hilos, jfk.wav 11s) | 0,80x |
| RTFx Q8_0 (8 hilos) | 1,03x |
| RTFx Q6_K (8 hilos) | 1,05x |
| RTFx Q5_1 (8 hilos) | 1,06x |
| RTFx Q5_0 (8 hilos) | 1,07x |
| RTFx Q4_K (8 hilos) | 1,08x |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de CPU; para GPU, el tamaño de los pesos GGUF varía de 1,21 GB (Q4_K) a 3,85 GB (F16), por lo que la VRAM necesaria sería aproximadamente ese tamaño más overhead.
- GPU recomendadas: no se especifican en la información disponible; al ser un modelo de ~2B, cabría en GPUs consumer como RTX 3060 (12 GB) o superiores en todas las cuantizaciones.
- Cabe en GPU consumer: sí, todas las cuantizaciones caben en GPUs con 4 GB o más de VRAM.
- Opciones de despliegue: CrispASR (runtime C++ para CPU), y por extensión los formatos GGUF podrían emplearse con llama.cpp si el soporte de la arquitectura Conformer estuviera implementado, aunque la model card solo menciona CrispASR.
- Latencia y throughput: RTFx de 0,80x (F16) a 1,08x (Q4_K) con 8 hilos de CPU en un audio de 11 segundos; valores superiores a 1,0x indican velocidad superior al tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cohere-transcribe-03-2026 (este) | ~2B | 1024 tokens decoder | 14 | Apache 2.0 | GGUF, safetensors |
| parakeet-tdt-0.6b-v3 | 600M | No disponible | 25 (UE) | No disponible | GGUF |
| canary-1b-v2 | 978M | No disponible | Multilingüe (ASR + traducción) | No disponible | GGUF |

El modelo de Cohere es el de mayor tamaño de los tres y el único con WER medio publicado en la Open ASR Leaderboard (5,42). Parakeet-tdt-0.6b-v3 es más pequeño y rápido, con marcas de tiempo de palabras integradas y 25 idiomas europeos. Canary-1b-v2 añade traducción de voz con flags explícitos `-sl/-tl`. No se dispone de datos de rendimiento comparativo directo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La lista blanca de idiomas es metadato, no vocabulario: el tokenizer contiene los 183 tokens ISO-639-1, por lo que el modelo puede responder en un idioma no soportado de forma fluida pero incorrecta, sin señal de error en tiempo de ejecución. Es necesario declarar la lista de idiomas admitidos (`cohere_transcribe.supported_languages` o `CRISPASR_COHERE_LANGS`).
- El modo `-l auto` utiliza un detector externo que conoce 99 idiomas frente a los 14 del modelo, lo que puede provocar detecciones erróneas.
- La normalización mel debe usar desviación estándar sesgada; el uso de la fórmula de Bessel corregida corrompe la salida del encoder.
- La atención del Conformer debe escalarse por `1/sqrt(head_dim)` antes del softmax; omitirlo produce salidas repetitivas.
- El decoder usa ReLU en la FFN (no SiLU/Swish), lo que debe respetarse en implementaciones propias.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones adicionales de licencia más allá de Apache 2.0.
- El repositorio tiene 38 descargas y 0 likes, lo que indica un uso muy limitado y poca validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentory/cohere-transcribe-03-2026-GGUF
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- ONNX INT4 del mismo modelo: https://huggingface.co/cstr/cohere-transcribe-onnx-int4
- ONNX INT8 del mismo modelo: https://huggingface.co/cstr/cohere-transcribe-onnx-int8
- Parakeet-tdt-0.6b-v3 GGUF: https://huggingface.co/cstr/parakeet-tdt-0.6b-v3-GGUF
- Parakeet de med GGUF: https://huggingface.co/cstr/parakeet_de_med-GGUF
- Canary-1b-v2 GGUF: https://huggingface.co/cstr/canary-1b-v2-GGUF
