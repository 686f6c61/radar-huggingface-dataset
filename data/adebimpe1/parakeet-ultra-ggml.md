# adebimpe1/parakeet-ultra-ggml

## Resumen

Parakeet Ultra GGML es una conversión al formato GGML del modelo de reconocimiento automático del habla moondream/parakeet-ultra, que a su vez es la versión post-entrenada por Moondream del modelo parakeet-tdt-0.6b-v3 de NVIDIA. El repositorio lo publica el usuario adebimpe1 y su función es servir como sustituto directo (*drop-in replacement*) del fichero `ggml-parakeet-tdt-0.6b-v3-q8_0.bin` dentro de la librería `libparakeet` de whisper.cpp (versión 1.9.2 o posterior).

El modelo conserva la arquitectura, el tokenizador y los 0,6 mil millones de parámetros del original: se trata de un transductor TDT (*token-and-duration transducer*) con encoder y una red de decodificación/joint que incorpora capas LSTM, tal y como se deduce de las transformaciones aplicadas durante la conversión (reordenación de puertas LSTM y suma de los dos vectores de sesgo por capa). No se ha modificado ningún peso más allá de la conversión de formato y la cuantización a q8_0.

Su relevancia es práctica: permite ejecutar un modelo de ASR multilingüe de 25 idiomas en CPU o GPU con el ecosistema whisper.cpp, sin depender de PyTorch ni de NeMo, en un único fichero de 669 MB. El autor reporta una mejora modesta pero medible de la tasa de error por palabra (WER) frente al fichero oficial v3 q8_0 en un conjunto de prueba reducido, con una latencia prácticamente idéntica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (token-and-duration transducer), derivada de parakeet-tdt-0.6b-v3; incluye capas LSTM en la red de decodificación/joint |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Modelo de audio: la entrada es PCM mono float32 a 16 kHz; el audio largo debe segmentarse manualmente porque no se incluye la cabeza VAD |
| Tipos de cuantizacion | q8_0 para las matrices; sesgos, normas, convoluciones y *position bias* permanecen en f32 |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGML en un único fichero `.bin` (`ggml-parakeet-ultra-0.6b-q8_0.bin`) |
| Tamano del fichero | 668.757.119 bytes (aproximadamente 669 MB) |
| SHA-256 | `fa28ec8c6afd9893da9829ec9f2fa908a60bc0fbebd37fd60bbd2f0953076fb2` |
| Modelo base | moondream/parakeet-ultra (a su vez, nvidia/parakeet-tdt-0.6b-v3) |
| Pipeline | automatic-speech-recognition |
| Tamano del repositorio | 1,9 GB |
| Fecha de creacion | 2026-10-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del transductor TDT de NVIDIA (parakeet-tdt-0.6b-v3), que combina un encoder con un decodificador de predicción y una red *joint*. Las notas de conversión publicadas mencionan explícitamente tensores de atención (`self_attn.q_proj`), un proyector de encoder (`encoder_projector`), el componente joint (`joint.enc`) y capas LSTM con dos vectores de sesgo que se suman en uno solo durante la conversión. No se dispone de información sobre el número de capas, la dimensión del modelo ni la composición del dataset de entrenamiento original en la documentación proporcionada. Tampoco se detalla en esta ficha si el post-entrenamiento de Moondream empleó RLHF, DPO u otra técnica de alineación; la model card remite al repositorio de moondream/parakeet-ultra para esos detalles.

Lo que sí está documentado con precisión es el proceso de conversión aplicado en este repositorio: (1) renombrado de tensores del esquema de Hugging Face Transformers de Moondream al esquema NeMo que espera `libparakeet` (por ejemplo, `self_attn.q_proj` a `self_attn.linear_q`, `encoder_projector` a `joint.enc`); (2) aplicación de las mismas transformaciones que el script `convert-parakeet-to-ggml.py` de whisper.cpp, incluyendo la suma de los dos vectores de sesgo LSTM por capa y la reordenación de las puertas LSTM; (3) cuantización a q8_0 con `parakeet-quantize`. El banco de filtros mel, la ventana STFT y el vocabulario no se almacenan en el checkpoint Ultra: se tomaron del fichero GGML de la v3 tras verificar que el tokenizador de Ultra es idéntico token a token (8192 tokens) y que su configuración coincide con la de v3. La pequeña cabeza de detección de actividad de voz de Moondream (`vad_head.*`, 6 tensores) se omitió deliberadamente por no ser útil para `libparakeet` y no afecta a la transcripción.

## Capacidades

- Reconocimiento automático del habla (*speech-to-text*) en 25 idiomas europeos, con el mismo tokenizador de 8192 tokens que parakeet-tdt-0.6b-v3.
- Transcripción con puntuación, uso de mayúsculas y numerales siguiendo las convenciones de salida de la v3 (el autor indica que son las mismas).
- Decodificación *greedy* mediante `PARAKEET_SAMPLING_GREEDY` en la API de `libparakeet`; la CLI `parakeet-cli` también está disponible.
- Entrada de audio en PCM mono float32 a 16 kHz.
- Integración nativa en C mediante `parakeet.h` (`parakeet_init_from_file_with_params`, `parakeet_full`, `parakeet_full_get_segment_text`), además del binario de línea de comandos.
- No incluye detección de actividad de voz: la segmentación de audio largo queda en manos de la aplicación.
- No se documentan capacidades de traducción, diarización de hablantes, *tool calling*, agentes ni multimodalidad.

## Casos de uso

- Transcripción por lotes en servidores sin GPU: al ser un fichero GGML q8_0 de 669 MB, puede ejecutarse con whisper.cpp sobre CPU en máquinas modestas, lo que lo hace adecuado para procesar archivos de audio en cola sin depender de CUDA ni de PyTorch.
- Subtitulado de vídeo multilingüe: con 25 idiomas soportados (incluido el español), se puede generar la pista de subtítulos a partir del audio original en cada idioma sin cambiar de modelo.
- Aplicaciones de escritorio y utilidades locales: el formato GGML y la API en C permiten incrustar el modelo en aplicaciones nativas de macOS, Linux o Windows, como ya hace el propio ecosistema whisper.cpp.
- Dictado en tiempo real en hardware de consumo: la latencia medida con Metal en un Apple M1 Pro es de 1,00x a 1,01x respecto al fichero v3 q8_0, por lo que es viable para dictado interactivo con *streaming* por fragmentos.
- Migración sin fricción desde parakeet-tdt-0.6b-v3: al ser un sustituto directo del fichero `ggml-parakeet-tdt-0.6b-v3-q8_0.bin`, cualquier *pipeline* ya construido sobre libparakeet puede adoptarlo cambiando únicamente la ruta del modelo, siempre que se respete la atribución CC-BY-4.0.
- Transcripción de reuniones y notas de voz: con la advertencia de que el audio largo debe trocearse externamente al no incluirse la cabeza VAD, es adecuado para integrarse en un servicio que haga la segmentación por su cuenta.
- Investigación en ASR: al estar disponible el binario GGML junto con los pesos originales en Transformers, permite comparar WER entre el *runtime* C puro y un *runtime* Python con los mismos pesos.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor. Fueron medidos con whisper.cpp 1.9.2 de Homebrew sobre un Apple M1 Pro con Metal, comparando este fichero con el oficial `ggml-parakeet-tdt-0.6b-v3-q8_0.bin`, ambos mediante el mismo servidor stdin/stdout construido sobre libparakeet y con decodificación *greedy*. El WER se calcula con el normalizador de texto en inglés de Whisper y la latencia es la mediana en caliente de 3 ejecuciones. El propio autor advierte que es una comprobación de sanidad, no un benchmark completo.

| Conjunto de prueba | Palabras | WER v3 q8_0 | WER Ultra q8_0 | Latencia, Ultra vs v3 |
|---|---|---|---|---|
| LibriSpeech test-other, 35 enunciados | 721 | 4,30 % | **3,74 %** | 1,00x |
| Conjunto mixto: 6 de LibriSpeech test-clean, JFK, 8 clips TTS de macOS en 7 acentos ingleses, 2 clips con ruido, 1 dictado corto | 481 | 3,33 % | 3,33 % | 1,01x |
| Combinado | 1202 | 3,91 % | **3,58 %** | no disponible |

No se han publicado en la información disponible resultados de benchmarks completos (MMLU, HumanEval, GSM8K u otros) para este fichero GGML; esos formatos no aplican a un modelo de ASR. Para las cifras completas de los pesos originales, la model card remite a moondream/parakeet-ultra, medidas allí en Photon sobre GPU NVIDIA y no con este fichero GGML.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: alrededor de 0,7 GB para el peso q8_0 más los *buffers* de activaciones y del *runtime*. Como referencia práctica, entre 1 y 1,5 GB de memoria disponible suele ser suficiente. Es una estimación propia derivada del tamaño del fichero, no un dato publicado por el autor.
- GPU recomendadas: no hay una lista oficial. El autor ha validado el funcionamiento con aceleración Metal en un Apple M1 Pro. Cualquier GPU con soporte en whisper.cpp (NVIDIA con CUDA, AMD con Vulkan/ROCm, Apple Silicon con Metal) es candidata razonable.
- Cabe en GPU de consumo: sí, por tamaño de pesos es apto para GPU de gama media y baja (por ejemplo, tarjetas con 4 GB o más de VRAM) y también para ejecución íntegra en CPU.
- Opciones de despliegue: `libparakeet` dentro de whisper.cpp 1.9.2 o superior (CLI `parakeet-cli` y API `parakeet.h`). No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp en la información disponible; el formato es específico del *runtime* de Parakeet de whisper.cpp y no es un GGUF genérico.
- Latencia y throughput: el autor solo publica latencias relativas frente a la v3 q8_0 (1,00x en LibriSpeech test-other y 1,01x en el conjunto mixto). Los valores absolutos de latencia y de *throughput* (por ejemplo, factor de tiempo real o RTFx) no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER combinado (medicion del autor) | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| adebimpe1/parakeet-ultra-ggml (q8_0) | 0,6B | Audio PCM mono float32 a 16 kHz; sin segmentacion interna | 3,58 % (1202 palabras) | CC-BY-4.0 | GGML, fichero unico de 669 MB, 0 descargas |
| ggml-parakeet-tdt-0.6b-v3-q8_0.bin (NVIDIA, via whisper.cpp) | 0,6B | Audio PCM mono float32 a 16 kHz | 3,91 % (1202 palabras) | CC-BY-4.0 | GGML, mismo *runtime*, es el fichero que este repositorio reemplaza |
| moondream/parakeet-ultra (pesos originales) | 0,6B | Audio; medido en Photon sobre GPU NVIDIA | No disponible en esta informacion | CC-BY-4.0 | Pesos Transformers/NeMo, requiere stack Python |
| Modelos de la familia Whisper (por ejemplo large-v3) | No disponible en esta informacion | No disponible en esta informacion | No disponible en esta informacion | No disponible en esta informacion | No disponible en esta informacion |

No se dispone de datos suficientes en la información proporcionada para una comparación cuantitativa con alternativas de ASR fuera del ecosistema Parakeet.

## Limitaciones y advertencias

- El modelo no incluye la cabeza de detección de actividad de voz (*voice activity detection*) de Moondream, de modo que el audio largo debe segmentarse externamente; el propio autor lo indica explícitamente.
- El banco de filtros mel, la ventana STFT y el vocabulario no proceden del checkpoint Ultra, sino del fichero GGML de la v3, tras verificar que el tokenizador y la configuración coinciden. Cualquier divergencia futura en esos artefactos rompería la compatibilidad.
- Los resultados de WER publicados corresponden a un conjunto muy reducido (721 y 481 palabras, respectivamente) sobre inglés; no hay validación publicada en el resto de los 24 idiomas declarados.
- Riesgo de alucinación y errores de transcripción inherente a los modelos de ASR, especialmente en audio con ruido, acentos no cubiertos o solapamiento de hablantes; no se han publicado tasas de error específicas para esos escenarios.
- No se documenta el comportamiento del modelo con audio musical, con habla superpuesta ni con segmentos inferiores a la ventana mínima del encoder.
- La licencia CC-BY-4.0 permite uso comercial, pero obliga a atribuir tanto a Moondream como a NVIDIA, además de cumplir las condiciones de la licencia en las obras derivadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no ha pasado por una validación amplia de la comunidad; conviene verificar el SHA-256 antes de utilizarlo en producción.
- El formato es específico de `libparakeet` (whisper.cpp 1.9.2 o posterior). No es un GGUF estándar y no puede cargarse en llama.cpp, Ollama u otros *runtimes* basados en GGUF sin conversión adicional.
- No se publican métricas absolutas de latencia ni de consumo de memoria, solo comparativas relativas frente a la v3.

## Enlaces

- Repositorio Hugging Face de este modelo: https://huggingface.co/adebimpe1/parakeet-ultra-ggml
- Modelo base en Hugging Face (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo original en Hugging Face (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime y formato de conversión (whisper.cpp): https://github.com/ggml-org/whisper.cpp

Nota: la búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo; los enlaces encontrados no guardan relación con el contenido de la ficha y se han descartado.
