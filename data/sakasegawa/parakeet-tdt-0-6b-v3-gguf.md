# sakasegawa/parakeet-tdt-0.6b-v3-GGUF

## Resumen

parakeet-tdt-0.6b-v3-GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-tdt-0.6b-v3, publicada por el usuario sakasegawa. El modelo original lo desarrolla NVIDIA y está pensado para transcripción de voz en 25 idiomas europeos; esta ficha describe la conversión, que no reentrena los pesos, sino que cambia su formato y reduce su precisión de F32 a F16 para poder ejecutarlos en speech.cpp, una implementación en C++ sobre ggml.

El interés de esta conversión es que permite ejecutar un modelo ASR de 627.011.734 parámetros (0,6B) en local sobre Metal, Vulkan o CPU, sin depender de NeMo ni de CUDA. El repositorio ocupa 1,3 GB y contiene un único archivo de 1,26 GB con el frontend, el encoder, el decodificador TDT y el tokenizador. Según la model card, los doce enunciados FLEURS de validación (en, de, fr, es) producen exactamente el mismo texto que NeMo 3.0.0 con decodificación greedy.

El punto crítico es la compatibilidad: el archivo solo funciona en speech.cpp v0.7.0 o posterior. No lo leen llama.cpp, LM Studio, Ollama ni las herramientas de NVIDIA, porque el layout del GGUF es específico de speech.cpp. Se distribuye bajo licencia CC-BY-4.0, la misma del checkpoint oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) con decodificador TDT (Token-and-Duration Transducer) |
| Parámetros totales | 627.011.734 (dato real de safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el modelo reconoce un enunciado completo por ejecución, no una ventana de tokens |
| Tipos de cuantización | F16 en las capas lineales, LSTM y embedding de tokens; F32 en kernels de convolución, normalizaciones y frontend |
| Idiomas soportados | 25: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (layout específico de speech.cpp; no compatible con llama.cpp ni Ollama) |
| Tamaño del repositorio | 1,3 GB (archivo único de 1,26 GB) |
| Requisito de runtime | speech.cpp v0.7.0 o superior |
| Formato de entrada | WAVE a 16 kHz; se rechazan otras frecuencias en lugar de remuestrearlas |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base de NVIDIA: un encoder FastConformer, variante de Conformer con atención eficiente, acoplado a un decodificador TDT (Token-and-Duration Transducer). TDT predice de forma conjunta el token y su duración en cada paso, lo que permite saltos temporales en lugar de avanzar fotograma a fotograma como en un CTC o un RNN-T clásico. El modelo incorpora también una red de predicción con LSTM, cuyas matrices quedan en F16 en esta conversión.

Sobre el entrenamiento no hay datos en la información proporcionada (número de tokens, composición del dataset, uso de RLHF o DPO): no disponible. Lo que sí documenta la conversión es que se generó con `reference/fastconformer/convert.py` de speech.cpp a partir del checkpoint oficial `nvidia/parakeet-tdt-0.6b-v3`, en la revisión `541d1f99c6b0c3cd0b11a95167540bb8edefd82b`. La única transformación aplicada es de formato y precisión: no hay reentrenamiento ni ajuste fino.

La validación se hizo etapa por etapa contra NeMo 3.0.0 con doce enunciados FLEURS (tres de en_us, tres de de_de, tres de fr_fr y tres de es_419), de 5,6 a 23,4 segundos:

| Etapa | SNR en Metal (F16) | SNR en CPU (F32) |
|---|---|---|
| Encoder | 52 a 61 dB | 106 a 114 dB |
| Red de predicción | 66 a 69 dB | 130 a 133 dB |
| Joint | 88 dB | 141 a 142 dB |

Además, las etiquetas y duraciones elegidas en cada paso de la decodificación greedy y el texto de los doce enunciados coinciden con los de NeMo.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, con detección automática del idioma a partir del audio.
- Ejecución local en Metal (Apple), Vulkan (NVIDIA) y CPU, sin dependencia de CUDA ni de NeMo.
- Tres modos de uso en speech.cpp: `speech-asr` (CLI, una línea de texto por archivo), `speech-worker` (procesador con protocolo JSON Lines) y `speech-server` (servidor HTTP con la API de audio de OpenAI, `POST /v1/audio/transcriptions`).
- Integración mediante C API a través de speech.cpp.
- No dispone de entrada de idioma: si una petición nombra uno de los 25 idiomas, se valida pero no altera el texto generado.
- No se documentan en la información disponible capacidades de diarización de hablantes, marcas de tiempo, puntuación forzada, traducción, tool calling ni modo de razonamiento.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa el enunciado completo de una vez y devuelve texto plano, por lo que encaja en un pipeline que segmenta el audio por intervenciones y transcribe cada fragmento en local.
- Subtitulado de vídeo: dado un archivo WAVE a 16 kHz por fragmento, `speech-asr` genera la línea de texto correspondiente, que puede ensamblarse con los tiempos del segmentador para producir subtítulos.
- Atención al cliente: transcripción de llamadas grabadas para alimentar sistemas de análisis de calidad o búsqueda de texto sobre conversaciones, sin enviar el audio a servicios externos.
- Archivado y búsqueda de audio en podcasts: indexación de cadenas de audio de larga duración convirtiendo cada episodio en texto buscable, aprovechando que el modelo cubre 25 idiomas sin cambiar de checkpoint.
- Dictado en aplicaciones de escritorio: el servidor HTTP con la API de audio de OpenAI permite sustituir un endpoint remoto por una instancia local en el puerto 8080 mediante una única variable de configuración.
- Procesamiento por lotes offline en CI o en servidores sin GPU: al ejecutarse en CPU y en Vulkan, puede integrarse en trabajos programados de transcripción masiva sin hardware dedicado.
- Despliegue con requisitos de privacidad: al no requerir conexión a la nube ni servicios externos, es adecuado para entornos sanitarios, legales o administrativos donde el audio no puede salir de la infraestructura propia.
- Investigación lingüística comparada: cobertura de 25 lenguas europeas con el mismo modelo, útil para estudios que necesitan condiciones homogéneas de transcripción entre idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER ni métricas comparativas tipo MMLU, HumanEval o GSM8K (no aplicables aquí), sino una validación de equivalencia numérica frente a NeMo 3.0.0 sobre doce enunciados FLEURS, recogida en la tabla de la sección anterior.

Los únicos datos de rendimiento publicados son tiempos de transcripción en Apple M5 con Metal, medidos con `speech-asr` una vez cargado el modelo:

| Duración del audio | Tiempo de transcripción (Apple M5, Metal) |
|---|---|
| 5,6 s | 0,08 s |
| 10,2 a 12,8 s | 0,12 a 0,16 s |
| 20,8 a 23,4 s | 0,24 a 0,32 s |

No hay datos publicados de rendimiento en Vulkan, CPU, GPU NVIDIA o Apple Silicon distinto del M5, ni medidas de throughput en lote.

## Requisitos de hardware

- Almacenamiento y memoria de pesos: el archivo único ocupa 1,26 GB en F16, por lo que el peso en memoria de los parámetros ronda esa cifra; la memoria adicional para activaciones y buffers no está documentada.
- Cabe en GPU de consumo, en GPU integrada y en CPU: el modelo ha sido verificado en Metal, en Vulkan sobre GPU NVIDIA y en CPU, según la model card.
- No hay requisitos mínimos de VRAM publicados ni lista de GPU recomendadas (A100, H100, RTX 4090, etc.): no disponible.
- Despliegue: exclusivamente mediante speech.cpp v0.7.0 o superior, con binarios precompilados para macOS arm64 (Metal), Windows x64 (Vulkan) y Linux x64 (Vulkan o CPU) en la página de releases del proyecto. No es compatible con vLLM, llama.cpp, Ollama, LM Studio ni TGI.
- Latencia: en Apple M5 con Metal, entre 0,08 s para 5,6 s de audio y 0,24-0,32 s para 20,8-23,4 s de audio, en régimen de un único enunciado por ejecución.
- Restricción de entrada: solo se aceptan WAVE a 16 kHz; los archivos con otra frecuencia se rechazan, por lo que hay que remuestrear previamente con herramientas externas (por ejemplo, `ffmpeg -i in.mp3 -ar 16000 -ac 1 out.wav`).
- Estrategia de segmentación: el model card indica que el modelo reconoce un enunciado de una vez, de modo que cada archivo debería contener una sola intervención. No hay soporte de streaming documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Runtime | Licencia | Notas |
|---|---|---|---|---|---|---|
| sakasegawa/parakeet-tdt-0.6b-v3-GGUF | 627.011.734 | 25 europeos | GGUF (speech.cpp) | speech.cpp v0.7.0+ | CC-BY-4.0 | Conversión F16 del checkpoint de NVIDIA; validada contra NeMo |
| nvidia/parakeet-tdt-0.6b-v3 | 627.011.734 | 25 europeos | Checkpoint NeMo | NeMo 3.0.0 | CC-BY-4.0 | Modelo original; requiere el stack de NVIDIA |
| sakasegawa/parakeet-tdt_ctc-0.6b-ja-GGUF | No disponible | Japonés | GGUF (speech.cpp) | speech.cpp | No disponible | Variante en japonés citada en la model card |

No se dispone de datos verificados en la información proporcionada para comparar con otras familias de ASR (Whisper, distil-whisper u otros modelos multilingües): parámetros, idiomas, licencia y rendimiento de esas alternativas figuran como no disponibles. Tampoco hay cifras de WER comparativas entre los tres modelos de la tabla.

## Limitaciones y advertencias

- Compatibilidad restringida: el GGUF usa un layout propio de speech.cpp y no funciona en llama.cpp, LM Studio, Ollama ni con los archivos `.nemo` o `parakeet-tdt-0.6b-v3.q8_0.gguf` de NVIDIA.
- Entrada rígida: solo WAVE mono a 16 kHz. El modelo rechaza otras frecuencias en lugar de remuestrear, lo que obliga a un paso previo de conversión.
- Sin segmentación interna: está pensado para un enunciado por archivo; no hay soporte documentado de streaming, diarización ni marcas de tiempo.
- Precisión reducida: los pesos lineales, la LSTM y el embedding pasan a F16, mientras que convoluciones, normalizaciones y frontend se mantienen en F32. La conversión no reentrena, solo cambia formato y precisión, y la equivalencia verificada se limita a doce enunciados FLEURS en cuatro variantes de idioma.
- Ausencia de benchmarks públicos: no hay WER publicado en la información disponible, ni evaluación en audio ruidoso, con acentos, con solapamiento de hablantes o con dominios especializados.
- Riesgo de alucinación: no se documenta el comportamiento en audio silencioso, ruidoso o ininteligible; al ser un modelo transducer con decodificación greedy, estos escenarios no están cubiertos por la validación publicada.
- Sesgos: no hay información sobre sesgos demográficos, acústicos o lingüísticos en la documentación proporcionada.
- Cobertura lingüística limitada a 25 lenguas europeas; otras lenguas no están soportadas en este archivo. El japonés se distribuye en un repositorio separado.
- Idioma: el modelo detecta el idioma del audio; indicar un idioma en la petición lo valida pero no modifica la salida.
- Licencia: CC-BY-4.0 permite uso comercial siempre que se atribuya correctamente; los pesos son de NVIDIA y esta conversión solo cambia el formato.
- Madurez del repositorio: registra 0 descargas y 0 interacciones en el momento de la consulta, con fecha de creación posterior a la actual, por lo que no hay validación independiente de la comunidad.
- Requisito de versión: es necesario speech.cpp v0.7.0 o superior; versiones anteriores no cargan el archivo.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/sakasegawa/parakeet-tdt-0.6b-v3-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- speech.cpp (repositorio y documentación): https://github.com/nyosegawa/speech.cpp
- README de speech.cpp con la tabla de modelos soportados: https://github.com/nyosegawa/speech.cpp#readme
- Binarios precompilados de speech.cpp: https://github.com/nyosegawa/speech.cpp/releases
- Conversión en japonés del mismo autor: https://huggingface.co/sakasegawa/parakeet-tdt_ctc-0.6b-ja-GGUF
- Revisión del checkpoint usada en la conversión: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/tree/541d1f99c6b0c3cd0b11a95167540bb8edefd82b

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos no guardan relación con el ámbito técnico de la ficha y se han descartado. No se han encontrado papers, blogs ni demos adicionales verificables.
