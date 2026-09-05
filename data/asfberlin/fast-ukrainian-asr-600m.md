# asfberlin/fast-ukrainian-asr-600m

## Resumen

`asfberlin/fast-ukrainian-asr-600m` es un modelo de reconocimiento automático de voz (ASR) monolingüe en ucraniano, desarrollado por el usuario `asfberlin` sobre el encoder SSL multilingüe `GigaAM` de `salute-developers`. El modelo adapta el backbone `multilingual_large_ssl` de 585,3 millones de parámetros y añade una cabeza CTC de 38 clases, resultando en un sistema de 600 millones de parámetros en total. Está diseñado específicamente para audio telefónico, con una etapa de adaptación a la degradación G.711 (limitación de banda y compresión mu-law), lo que lo hace especialmente robusto en condiciones de telefonía en comparación con modelos generalistas como Whisper.

El modelo resuelve el problema de transcripción de voz ucraniana en entornos de teléfono y radiodifusión, donde la precisión en audio degradado es crítica. Su relevancia actual radica en que ofrece una alternativa ligera y de alta precisión para ucraniano, superando a Whisper large-v3 en audio limpio tipo Common Voice (6,13 % WER frente a 13,85 %) y manteniendo una degradación menor al pasar de audio limpio a telefónico (+1,08 puntos de WER frente a +3,57 de Whisper). Sin embargo, en habla espontánea o conversacional, Whisper large-v3 sigue siendo superior, por lo que la elección del modelo depende del dominio de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder SSL GigaAM (`multilingual_large_ssl`) con cabeza CTC de 38 clases |
| Parametros totales | 600 millones (585,3 M en el backbone SSL + cabeza CTC) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo CTC para ASR, no es un LLM con ventana de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ucraniano (uk) exclusivamente |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (.ckpt), según el código de uso |

## Arquitectura y entrenamiento

El modelo utiliza como backbone el encoder SSL `GigaAM multilingual_large_ssl` de 585,3 millones de parámetros, preentrenado en 2 millones de horas de audio en más de 70 idiomas, ninguno de ellos ucraniano. Sobre este encoder se añade una cabeza CTC (Connectionist Temporal Classification) charwise con 38 clases correspondientes al alfabeto ucraniano. El entrenamiento se realiza en dos etapas:

- **Stage 1:** 350 horas de datos — `Yehor/broadcast-speech-uk` (309 h), `Common Voice 22` en ucraniano (41 h) y `tg-voices-uk` — con un total de 181.479 clips. Se entrenan 8 épocas con un batch efectivo de 16. Se excluyen los splits `validated` y `test` de Common Voice para evitar fuga de datos, y se reparan 146 filas con homoglifos latinos/cirílicos para no entrenar caracteres latinos que no forman parte del vocabulario.
- **Stage 2:** Adaptación a telefonía durante 4 épocas con tasa de aprendizaje 3e-5. El 60 % de los clips de entrenamiento se degradan a través de una ruta telefónica G.711 (limitación de banda, 16k→8k→16k, mu-law), y el 100 % de la validación se degrada de la misma manera, de modo que la selección de checkpoint se basa en la condición que el modelo servirá en producción.

El modelo no genera puntuación ni capitalización, ya que la salida es una secuencia de caracteres CTC de 38 clases. Los números se transcriben como palabras, no como dígitos.

## Capacidades

- Reconocimiento de voz ucraniana en audio limpio y telefónico, con especial robustez a la degradación G.711.
- Transcripción de habla leída (read speech) con alta precisión, especialmente en audio tipo Common Voice.
- Manejo de archivos largos mediante segmentación energética incluida en `longform.py`.
- Exposición de un endpoint OpenAI-compatible `/v1/audio/transcriptions` mediante `server.py`.
- Ejecución en CPU y GPU (CUDA) a través de la librería `gigaam`.
- No soporta tool calling, function calling ni agentes, al ser un modelo puramente de reconocimiento de voz.
- No soporta ruso: el vocabulario de 38 caracteres ucranianos no incluye letras exclusivamente rusas, por lo que en audio ruso alcanza aproximadamente un 89 % de WER.
- No genera puntuación, capitalización ni números en formato dígito.

## Casos de uso

- **Transcripción de llamadas telefónicas en ucraniano:** el modelo está adaptado a la ruta G.711, por lo que puede integrarse en centros de llamadas o sistemas de atención al cliente para transcribir conversaciones telefónicas con una degradación de rendimiento mínima frente a audio limpio (+1,08 puntos de WER en Common Voice).
- **Subtitulación de programas de televisión o radio:** al estar entrenado con `broadcast-speech-uk`, es adecuado para transcribir noticias, entrevistas y otros contenidos de radiodifusión en ucraniano, donde el habla es mayoritariamente leída.
- **ASR en tiempo real en CPU para aplicaciones de dictado:** aunque el modelo es 2,4 veces más lento que su hermano menor de 220M, sigue siendo viable en CPU para tareas de dictado en ucraniano donde la precisión en habla leída es prioritaria.
- **Análisis de audio en pipelines de datos de Common Voice:** el modelo puede utilizarse para etiquetar o transcribir automáticamente conjuntos de audio ucraniano similares a Common Voice, aprovechando su dominio de coincidencia.
- **Servidor de transcripción para aplicaciones web:** `server.py` expone un endpoint compatible con OpenAI, lo que permite sustituir el servicio de ASR en aplicaciones que ya usan la API de transcripciones de OpenAI, sin cambiar el resto del backend.
- **Adaptación mediante fine-tuning a dominios específicos:** al ser un modelo CTC de 600M, puede ajustarse con pocos datos adicionales para dominios concretos (por ejemplo, audio médico o jurídico en ucraniano) manteniendo la robustez telefónica.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por el autor sobre 750 clips (250 por conjunto), filtrando solo filas etiquetadas como ucranianas. Todos los sistemas se evalúan con el mismo normalizador (`GigaAM normalize_raw_text`). La condición de telefonía usa una ruta G.711 generada una vez y compartida byte-idénticamente por todos los sistemas.

| Modelo | cv10 clean/tel | rs-test clean/tel | test-y clean/tel | 1500 utts |
|---|---|---|---|---|
| **fast-ukrainian-asr-600m** | **6.13 / 7.21** | 26.35 / 27.41 | 26.59 / 28.48 | 1381 s (CPU) |
| fast-ukrainian-asr (220M) | 9.64 / 10.59 | 28.03 / 28.65 | **26.28** / 28.67 | 576 s (CPU) |
| whisper-large-v3-turbo-uk fine-tune | 10.91 / 13.59 | 22.96 / 23.56 | 23.47 / 28.24 | 772 s (GPU) |
| whisper-large-v3 | 13.85 / 17.42 | **16.96 / 19.27** | **20.90** / **28.06** | 1051 s (GPU) |
| Qwen3-ASR | 80.73 / 83.15 | 78.77 / 77.22 | 88.39 / 84.23 | 225 s (GPU) |

Notas del autor: `cv10` corresponde a Common Voice, que forma parte del dominio de entrenamiento (aunque se excluyeron los splits de validación y test, la coincidencia de dominio explica el bajo WER). `rs-test` y `test-y` son las columnas más honestas, ya que no hay solapamiento con los datos de entrenamiento; en ellas Whisper large-v3 lidera en audio limpio por 6–10 puntos. La columna de telefonía muestra que este modelo degrada mucho menos que Whisper al pasar de limpio a telefónico. Qwen3-ASR no soporta ucraniano y transcribe en ortografía rusa, por lo que su fila se incluye solo como advertencia.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no documentada oficialmente. El checkpoint pesa 2,3 GB, lo que sugiere aproximadamente 2,4 GB en FP32 o ~1,2 GB en FP16 (estimación no oficial). No se han publicado valores de VRAM.
- **GPU recomendadas:** no especificadas en la documentación. El modelo puede ejecutarse tanto en CPU como en GPU con CUDA mediante la librería `gigaam`.
- **Compatibilidad con GPU de consumo:** probablemente sí, dado el tamaño del checkpoint; una GPU con al menos 4 GB de VRAM sería suficiente para FP32 (estimación no oficial). No se confirma en la información del autor.
- **Opciones de despliegue:** librería `gigaam`, `server.py` para endpoint OpenAI-compatible y `longform.py` para archivos largos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput:** para 1500 utterances, el modelo tarda 1381 s en CPU (según la tabla de benchmarks). No se proporciona latencia por utterance ni throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER cv10 clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **fast-ukrainian-asr-600m** | 600 M | No aplica (ASR CTC) | 6.13 | MIT | Hugging Face |
| fast-ukrainian-asr (220M) | 220 M | No aplica (ASR CTC) | 9.64 | No disponible | Hugging Face |
| whisper-large-v3-turbo-uk fine-tune | No disponible | No aplica (ASR) | 10.91 | No disponible | No disponible |
| whisper-large-v3 | No disponible | No aplica (ASR) | 13.85 | No disponible | No disponible |

El modelo de 600M supera a su hermano de 220M en cinco de seis celdas de la tabla de benchmarks, con mejoras de 3,4–3,5 puntos en Common Voice y de 1,2–1,7 en rs-test, a costa de 2,4 veces más tiempo de CPU. Whisper large-v3 es superior en habla espontánea, pero este modelo es más robusto en telefonía y más preciso en audio leído tipo Common Voice.

## Limitaciones y advertencias

- El rendimiento en habla espontánea o conversacional es su punto más débil, como reflejan los WER de 26–28 % en rs-test y test-y.
- La alta precisión en Common Voice se debe en parte a una coincidencia de dominio, no solo a una capacidad general superior.
- No genera puntuación ni capitalización, ya que es un modelo CTC sobre 38 caracteres.
- No soporta ruso por diseño; en audio ruso alcanza aproximadamente un 89 % de WER. Si el audio es mixto ucraniano/ruso, se debe usar un modelo multilingüe.
- Los números se transcriben como palabras, no como dígitos.
- El coste en CPU es 2,4 veces mayor que el del modelo de 220M; si la latencia es más importante que la precisión, se recomienda el modelo más pequeño.
- No se han documentado sesgos específicos en la información proporcionada. El riesgo de alucinación es bajo al estar limitado al vocabulario de 38 caracteres ucranianos, pero pueden producirse transcripciones incorrectas en audio con ruido o habla espontánea.
- El audio debe ser de 16 kHz mono; el audio telefónico de 8 kHz debe sobremuestrearse a 16 kHz antes de la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asfberlin/fast-ukrainian-asr-600m
- Modelo hermano de 220M: https://huggingface.co/asfberlin/fast-ukrainian-asr
- Modelo base GigaAM: https://huggingface.co/salute-developers/GigaAM
- Repositorio de ASR ucraniano (Respeecher, basado en Data2Vec): https://github.com/respeecher/ukrainian_asr
