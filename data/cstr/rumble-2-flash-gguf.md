# cstr/rumble-2-flash-GGUF

## Resumen

Rumble-2-Flash es un modelo de reconocimiento automático del habla (ASR) de 0,5B parámetros desarrollado por Reson8, distribuido aquí como conversión GGUF por el usuario cstr para su uso con el motor CrispASR. Se trata de un fine-tune de Qwen3-ASR que combina un codificador de audio de 18 capas con un LLM Qwen3 de 14 capas y un vocabulario reindexado de 99.630 tokens, cubriendo 45 idiomas según la model card del autor. El modelo base está publicado bajo licencia Apache-2.0.

Esta conversión GGUF resuelve el problema de despliegue en entornos sin GPU o con recursos limitados: ofrece tres cuantizaciones (F16, Q8_0 y Q4_K) que van desde 1,23 GB hasta 445 MB, permitiendo ejecutar transcripción multilingüe en CPU. La integración con CrispASR (`--backend qwen3` o `-m rumble-2-flash`) abstrae el pipeline completo, incluyendo detección automática de idioma y forzado explícito mediante el flag `-l`.

La relevancia actual radica en su tamaño compacto (610.678.800 parámetros reales según safetensors) combinado con soporte de 45 idiomas y tokens de control Reson8 para personalizar el comportamiento de transcripción (dígitos, muletillas, verbatim). La validación reportada por el autor indica coincidencia byte a byte con transformers fp32 en 18 transcripciones de prueba y WER de 0 en el clip JFK en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio de 18 capas + LLM Qwen3 de 14 capas (Qwen3-ASR fine-tune) |
| Parametros totales | 610.678.800 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventanas de atención del codificador de 8 s) |
| Tipos de cuantizacion | F16, Q8_0, Q4_K |
| Idiomas soportados | 45 idiomas (según model card del autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder típica de los sistemas ASR basados en LLM: un codificador de audio de 18 capas procesa la señal con ventanas de atención de 8 segundos, y un proyector conecta la salida del codificador con un LLM Qwen3 de 14 capas que genera la transcripción. El vocabulario está reindexado a 99.630 tokens. La model card menciona que el repositorio original incluye una cabeza CTC auxiliar que no se incluye en esta conversión GGUF.

Los detalles sobre el dataset de entrenamiento (número de tokens, composición, uso de RLHF/DPO) no están disponibles en la información proporcionada. Sí se documenta el mecanismo de tokens de control de Reson8 (`<digits><nofiller><verbatim>`) que abren el turno de sistema y permiten configurar el comportamiento de la transcripción; en el GGUF se registran como `qwen3asr.system_prefix`. El forzado de idioma se implementa prefillando el turno del asistente con `language <Name><asr_text>`.

## Capacidades

- Reconocimiento automático del habla (ASR) con detección automática de idioma.
- Forzado explícito de idioma mediante el flag `-l` (equivalente a la opción `language` de la plantilla de chat).
- Soporte de 45 idiomas según la model card del autor.
- Tokens de control Reson8 para personalizar la salida: `digits` (transcripción de dígitos), `filler` (muletillas) y `verbatim` (transcripción literal), configurables vía `CRISPASR_QWEN3_SYSTEM_PREFIX`.
- Procesamiento por ventanas de atención de 8 segundos en el codificador de audio.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada más allá del ASR ni modo thinking.

## Casos de uso

- Transcripción multilingüe en CPU: con la cuantización Q4_K (445 MB) el modelo puede ejecutarse en portátiles sin GPU mediante CrispASR, cubriendo 45 idiomas con detección automática, adecuado para actas de reuniones o subtitulado offline.
- Subtitulado y transcripción de contenido audiovisual: el forzado de idioma con `-l` permite fijar el idioma esperado en pipelines de postproducción donde la detección automática podría confundirse con cambios de hablante o ruido.
- Generación de actas y notas de voz: el token `<nofiller>` elimina muletillas de la salida, produciendo texto más limpio para documentos finales sin postprocesado adicional.
- Transcripción literal para ámbitos legales o de accesibilidad: el token `<verbatim>` preserva el habla exacta, útil en actas judiciales, entrevistas o subtítulos para sordos donde no se debe normalizar el texto.
- Digitalización de archivos de audio históricos: el tamaño reducido (445 MB en Q4_K) permite procesar grandes volúmenes de audio en hardware modesto, con la ventaja de licencia Apache-2.0 para uso comercial.
- Integración en aplicaciones de escritorio o embebidas: el formato GGUF y el motor CrispASR facilitan el despliegue en entornos sin dependencias de Python ni CUDA, con tres cuantizaciones para ajustar el equilibrio entre precisión y huella de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER por idioma, MMLU, etc.) en la información disponible. La model card reporta validación cualitativa y de equivalencia numérica:

| Prueba | Resultado |
|---|---|
| Equivalencia F16 vs transformers fp32 (mel, conv, 18 bloques encoder, proyector, prompt ids, logits primer paso) | Similitud coseno 1.000000 en jfk.wav (inglés), ko-369.wav (coreano) y paraformer_zh.wav (chino) |
| Transcripciones idénticas (3 cuantizaciones × 6 casos = 18) | Byte-idénticas a la salida de transformers |
| WER en jfk.wav (inglés) | 0 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,5 GB en F16, 0,8 GB en Q8_0 y 0,6 GB en Q4_K (tamaños de fichero más overhead del runtime).
- GPU recomendadas: no se especifican; al ejecutarse vía CrispASR/ggml puede funcionar en CPU y en GPU consumer (RTX 3060, RTX 4090, etc.) si el backend lo soporta.
- Cabe en cualquier GPU consumer moderna e incluso en sistemas sin GPU dedicada; la cuantización Q4_K (445 MB) es la más adecuada para entornos con poca memoria.
- Opciones de despliegue: CrispASR (`crispasr -m rumble-2-flash -f audio.wav`), con backend `qwen3`. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Rumble-2-Flash (esta ficha) | 610.678.800 | 45 | No disponible (ventanas de 8 s) | Apache-2.0 | GGUF |
| Whisper large-v3 | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información |
| Qwen3-ASR (base) | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información |

No se dispone de datos de benchmarks ni especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La cabeza CTC auxiliar del repositorio original no está incluida en esta conversión GGUF; si el pipeline dependía de ella, no funcionará con estos ficheros.
- El modelo está validado únicamente en tres clips de prueba (inglés, coreano y chino) según la model card; el rendimiento en los otros 42 idiomas declarados no está documentado en la información disponible.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo ASR, puede producir transcripciones plausibles pero incorrectas en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes.
- El forzado de idioma con `-l` requiere conocer el idioma de antemano; la detección automática puede fallar en clips cortos o con cambios de idioma.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la procedencia y licencia del modelo base Reson8/Rumble-2-Flash y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.
- No se documentan requisitos de contexto largo; el codificador opera con ventanas de 8 segundos, lo que puede limitar la transcripción de audio con dependencias de largo alcance.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/cstr/rumble-2-flash-GGUF
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- Motor CrispASR: https://github.com/CrispStrobe/CrispASR
