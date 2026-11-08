# avericaai/parakeet-tdt-0.6b-v2-gguf

## Resumen

`avericaai/parakeet-tdt-0.6b-v2-gguf` es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v2`, publicada por el usuario avericaai para su uso con la librería `transcribe.cpp`. El modelo original lo desarrolla NVIDIA y está pensado para transcripción de inglés de alta calidad en modo offline, con puntuación, capitalización y marcas de tiempo a nivel de token. La conversión parte del commit `1b149a3` del repositorio original (fijado el 2026-04-15) y se validó frente a la referencia NeMo en el commit `bf0d0b7` de `transcribe.cpp` el 2026-04-18.

Arquitectónicamente es un FastConformer XL con decodificador transducer TDT/RNNT, con 617.869.958 parámetros totales según los safetensors del modelo base. La entrada es un WAV mono a 16 kHz y la salida es una transcripción con marcas de tiempo opcionales. No es un modelo de streaming, no soporta detección de idioma ni traducción, y su cobertura lingüística se limita al inglés.

La relevancia de esta ficha está en que ofrece el modelo en cuantizaciones GGUF (desde F32 hasta Q4_K_M) con pérdida de precisión mínima: el WER en LibriSpeech test-clean pasa de 1,68 % en F32 a 1,72 % en Q4_K_M, lo que permite ejecutar un ASR de calidad cercana al estado del arte en CPU y en GPUs de consumo mediante `transcribe.cpp`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer XL (encoder) + decodificador transducer TDT/RNNT |
| Parámetros totales | 617.869.958 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de tokens; el modelo original transcribe segmentos de audio de hasta 24 minutos en una sola pasada |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para `transcribe.cpp`) |
| Entrada de audio | WAV mono a 16 kHz |
| Marcas de tiempo | A nivel de token |
| Streaming | No |
| Detección de idioma | No |
| Traducción | No |

## Arquitectura y entrenamiento

El modelo es un FastConformer XL con atención completa y decodificador transducer TDT (Token-and-Duration Transducer). El encoder Conformer procesa el audio y el decodificador TDT/RNNT genera la secuencia de tokens con predicción conjunta de duración, lo que reduce el número de pasos de decodificación frente a un RNNT clásico. La decodificación es greedy, sin modelo de lenguaje externo.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card original cita las referencias técnicas del FastConformer [1], TDT [2] y otros papers asociados en los tags (`arxiv:2305.05084`, `arxiv:2304.06795`, `arxiv:2406.00899`, `arxiv:2410.01036`, `arxiv:2505.13404`). Esta conversión GGUF no reentrena el modelo: solo cambia el formato y la precisión de los pesos, y se validó numéricamente contra la implementación de referencia NeMo.

## Capacidades

- Transcripción de voz a texto en inglés en modo offline.
- Puntuación y capitalización automáticas en la salida.
- Predicción de marcas de tiempo a nivel de token (opcional).
- Buen rendimiento en números hablados y transcripción de letras de canciones, según la model card original.
- Procesamiento de segmentos de audio de hasta 24 minutos en una sola pasada (modelo original).
- RTFx de 3380 en el leaderboard HF-Open-ASR con batch size 128 (dato del modelo original).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo inglés. Para multilingüe, el autor remite a la versión v3.
- No soporta streaming, detección de idioma ni traducción.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio de hasta 24 minutos en una pasada y genera transcripciones con puntuación y marcas de tiempo, lo que facilita la generación de actas y la búsqueda dentro del texto.
- Generación de subtítulos: las marcas de tiempo a nivel de token permiten alinear los subtítulos con el audio con precisión, útil en pipelines de postproducción de vídeo.
- Servicios de transcripción en local: con la cuantización Q4_K_M (475 MB) se puede desplegar en un portátil o en un servidor modesto sin GPU, manteniendo un WER de 1,72 % en LibriSpeech test-clean.
- Asistentes de voz y aplicaciones de dictado: la baja latencia en modo offline (RTF de 37,72 en CPU de un M4 Max y 224,12 con Metal) permite integrar el modelo en aplicaciones de escritorio para dictado en tiempo casi real por segmentos.
- Análisis de llamadas de atención al cliente: la transcripción con marcas de tiempo y la robustez en números hablados facilitan la extracción de métricas y la revisión de conversaciones grabadas.
- Investigación en ASR: al ser una conversión GGUF validada contra NeMo, sirve como referencia reproducible para comparar implementaciones y cuantizaciones en estudios de precisión y rendimiento.
- Procesamiento por lotes en CPU: con `transcribe.cpp` y la cuantización Q8_0 (730 MB) se pueden transcribir grandes volúmenes de audio en servidores sin GPU usando Vulkan o CPU, con un coste de memoria bajo.

## Benchmarks y rendimiento

Datos publicados en la model card de la conversión GGUF:

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,47 GB | 1,68 % |
| F16 | 1,24 GB | 1,68 % |
| Q8_0 | 730 MB | 1,69 % |
| Q6_K | 600 MB | 1,70 % |
| Q5_K_M | 539 MB | 1,70 % |
| Q4_K_M | 475 MB | 1,72 % |

WER medido sobre el split completo de LibriSpeech test-clean (2.620 enunciados), batch size 1, sin marcas de tiempo. El dato de referencia de NVIDIA para el mismo split es 1,69 %, por lo que F32 y Q8_0 coinciden con el original dentro del redondeo.

| Métrica adicional | Valor |
|---|---|
| WER FLEURS en (Q8_0) | 4,11 % |
| RTF en Apple M4 Max (CPU) | 37,72 |
| RTF en Apple M4 Max (Metal) | 224,12 |
| RTF en AMD Ryzen 4750U (CPU) | 14,27 |
| RTF en AMD Ryzen 4750U (Vulkan) | 27,44 |
| RTFx HF-Open-ASR (modelo original, batch 128) | 3380 |

## Requisitos de hardware

- VRAM/RAM estimada: entre 475 MB (Q4_K_M) y 2,47 GB (F32) para los pesos; hay que sumar el espacio de trabajo del encoder para audio largo.
- GPU recomendadas: cualquier GPU con soporte Metal o Vulkan; el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4_K_M a Q8_0 en tarjetas con 2 GB o más de VRAM; incluso puede ejecutarse en CPU.
- Despliegue: `transcribe.cpp` (compilación con CMake); no se mencionan otras opciones como vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: RTF de 37,72 en CPU de M4 Max y 224,12 con Metal; 14,27 en CPU de Ryzen 4750U y 27,44 con Vulkan. El modelo original reporta RTFx de 3380 en HF-Open-ASR con batch 128.
- Requiere audio de entrada en WAV mono a 16 kHz; si no, hay que convertirlo previamente con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---:|---|---|---|---|
| parakeet-tdt-0.6b-v2 (esta conversión GGUF) | 617,9 M | Inglés | Hasta 24 min por pasada | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt-0.6b-v2 (original) | 0,6 B | Inglés | Hasta 24 min por pasada | CC-BY-4.0 | NeMo |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | 25 idiomas europeos | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no cubre otros idiomas; para multilingüe el autor remite a `nvidia/parakeet-tdt-0.6b-v3`.
- No es streaming: no apto para transcripción en tiempo real continua sin segmentar el audio.
- No soporta detección de idioma ni traducción.
- Riesgo de alucinación y errores en audio con ruido, acentos fuertes o solapamiento de hablantes; el WER de referencia (1,68 % en LibriSpeech test-clean) corresponde a audio limpio de lectura.
- El WER en FLEURS en (4,11 % con Q8_0) es notablemente superior al de LibriSpeech, lo que indica mayor degradación en audio menos controlado.
- La licencia CC-BY-4.0 permite uso comercial con atribución; hay que conservar el aviso de licencia y el NOTICE del repositorio.
- Es una conversión de terceros: la fuente autoritativa es el modelo original de NVIDIA, y la validación se hizo contra un commit concreto de NeMo y `transcribe.cpp`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- Requiere audio WAV mono a 16 kHz; el preprocesado incorrecto degrada la transcripción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/avericaai/parakeet-tdt-0.6b-v2-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Commit del modelo base usado: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2/commit/1b149a3
- Repositorio `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Página del modelo en `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v2.md
- Demo del modelo original: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v2
- Modelo multilingüe v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Documentación NeMo ASR: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html
- NVIDIA NIM: https://build.nvidia.com/nvidia/parakeet-tdt-0_6b-v2
- Repositorio de ejemplo en GitHub: https://github.com/jasonhoblin/nvidia-parakeet-tdt-0.6b-v2
