# GhaythMahadin/parakeet-tdt-1.1b-gguf

## Resumen
Esta ficha describe la conversión a GGUF del modelo `nvidia/parakeet-tdt-1.1b`, publicada por el usuario GhaythMahadin bajo el identificador `GhaythMahadin/parakeet-tdt-1.1b-gguf`. Se trata de un modelo de reconocimiento automático del habla (ASR) en inglés, desarrollado originalmente por los equipos de NVIDIA NeMo y Suno.ai, y empaquetado aquí en formato GGUF para su uso con el runtime `transcribe.cpp`. El modelo realiza transcripción offline de audio de 16 kHz mono y puede generar marcas de tiempo a nivel de token.

La arquitectura subyacente es FastConformer-XL con un decodificador transducer TDT/RNNT, con aproximadamente 1.070 millones de parámetros. Frente al checkpoint original en NeMo, esta versión GGUF ofrece cuantizaciones de 4 a 8 bits que reducen el peso del modelo hasta 825 MB en Q4_K_M, manteniendo un WER en LibriSpeech test-clean entre 1,38 % y 1,42 %, prácticamente idéntico al 1,39 % de la referencia en F32.

Su relevancia actual radica en que permite ejecutar un ASR de alta calidad en hardware de consumo, incluidos equipos Apple Silicon con Metal y CPUs con Vulkan, sin necesidad de GPU dedicada ni de la pila de NeMo. No obstante, el modelo es exclusivamente en inglés, no soporta streaming ni traducción, y la conversión tiene pocas descargas y validación externa limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-XL (encoder) + decodificador transducer TDT/RNNT |
| Parametros totales | 1.070.516.870 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR offline; procesa audio completo, sin ventana de contexto de texto publicada) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base está en formato NeMo/.nemo |

## Arquitectura y entrenamiento
El modelo base es un FastConformer-XL de aproximadamente 1.100 millones de parámetros con decodificador transducer TDT (Token-and-Duration Transducer), una variante de RNN-T que predice conjuntamente tokens y duraciones. El encoder FastConformer es una variante de Conformer con atención subsampleada que reduce el coste computacional en secuencias de audio largas. La entrada es audio WAV mono a 16 kHz y la salida es texto en minúsculas del alfabeto inglés, con marcas de tiempo opcionales a nivel de token.

La model card de esta conversión no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste supervisado adicional. La validación numérica se realizó contra la referencia de NeMo en el commit `42528dd` de transcribe.cpp el 2026-05-10, y la conversión se portó desde el commit upstream `53276c6` del modelo original. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia arquitectura FastConformer-TDT.

## Capacidades
- Transcripción de voz a texto offline en inglés, con salida en minúsculas.
- Generación de marcas de tiempo a nivel de token.
- Procesamiento de audio de 16 kHz mono en formato WAV (se requiere conversión previa con ffmpeg para otros formatos).
- Decodificación greedy TDT/RNN-T sin modelo de lenguaje externo.
- Ejecución en CPU, Vulkan y Metal a través de transcribe.cpp.
- No soporta streaming (indicado explícitamente como `streaming: false`).
- No soporta traducción (`translate: false`).
- No realiza detección de idioma (`lang_detect: false`).
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo generativo de propósito general).

## Casos de uso
- Transcripción de reuniones y entrevistas: el modelo procesa grabaciones completas en inglés y devuelve transcripciones con marcas de tiempo por token, útiles para alinear subtítulos o indexar fragmentos.
- Generación de subtítulos para vídeo: a partir de audio extraído y convertido a 16 kHz mono, se obtienen timestamps que facilitan la creación de ficheros SRT.
- Dictado y notas de voz en aplicaciones de escritorio: al caber en 825 MB en Q4_K_M, puede integrarse en herramientas locales que transcriban notas sin enviar audio a la nube.
- Archivado y búsqueda de contenido hablado: transcripción masiva por lotes en CPU con Vulkan, dado el throughput medido (RTF 11,5 en Vulkan sobre Ryzen 4750U).
- Accesibilidad: subtitulado automático de material audiovisual en inglés para personas con discapacidad auditiva, ejecutado en hardware modesto.
- Procesamiento en el borde (edge): despliegue en equipos Apple Silicon con Metal (RTF 125,5 en M4 Max), adecuado para aplicaciones de escritorio o dispositivos con recursos limitados.
- Investigación en ASR: punto de partida cuantizado para experimentos de evaluación o comparación de decodificadores transducer sin depender de NeMo.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,39 | 1,39 | 1,38 | 1,40 | 1,39 | 1,42 |
| Tamano (GB) | 4,28 | 2,15 | 1,27 | 1,04 | 0,936 | 0,825 |

| Entorno | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 125,5 |
| Apple M4 Max | CPU | 17,5 |
| AMD Ryzen 4750U | Vulkan | 11,5 |
| AMD Ryzen 4750U | CPU | 5,5 |

El WER se midió sobre el conjunto completo LibriSpeech test-clean (2620 enunciados) con decodificación greedy TDT/RNN-T y sin modelo de lenguaje externo. La referencia F32 es 1,39 %, coincidente con el valor autodeclarado por NVIDIA en el mismo conjunto.

## Requisitos de hardware
- VRAM estimada: no aplica de forma estricta; el modelo puede ejecutarse en CPU. En GPU, el peso en memoria oscila entre unos 825 MB (Q4_K_M) y 4,28 GB (F32), más overhead del runtime.
- GPU recomendadas: no se especifican en la información disponible; el modelo está validado en Apple M4 Max con Metal y en CPU/Vulkan sobre Ryzen 4750U.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2 GB de memoria para cuantizaciones Q4_K_M a Q8_0; no se aportan pruebas específicas en GPU NVIDIA.
- Opciones de despliegue: transcribe.cpp (runtime principal); el modelo base puede usarse con NVIDIA NeMo.
- Latencia y throughput: RTF de 125,5 (Metal, M4 Max), 17,5 (CPU, M4 Max), 11,5 (Vulkan, Ryzen 4750U) y 5,5 (CPU, Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/audio | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-1.1b (esta conversión GGUF) | 1,07 B | en | offline, 16 kHz mono | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt-1.1b (original) | 1,1 B | en | offline, 16 kHz mono | CC-BY-4.0 | NeMo |
| Whisper large-v3 | no disponible en la información | multilingüe | offline | MIT (según conocimiento general, no verificado aquí) | safetensors/GGUF |
| Whisper small | no disponible en la información | multilingüe | offline | MIT (según conocimiento general, no verificado aquí) | safetensors/GGUF |

No se dispone de datos de benchmarks comparativos directos con Whisper u otros modelos ASR en la información proporcionada. La comparación se limita a parámetros, idioma, licencia y formato; los valores de Whisper no están verificados en esta ficha.

## Limitaciones y advertencias
- Solo admite inglés; no transcribe ni traduce otros idiomas.
- No soporta streaming: requiere audio completo y no puede usarse en transcripción en tiempo real continua.
- No realiza detección de idioma ni traducción.
- Salida en minúsculas, sin puntuación ni capitalización garantizadas (según la model card original).
- Riesgo de alucinación y errores en audio con ruido, acentos no nativos o solapamiento de hablantes; el WER de 1,39 % corresponde a LibriSpeech test-clean, un conjunto relativamente limpio.
- La conversión GGUF tiene 0 descargas y 0 likes en el momento de la consulta, con validación limitada a la comparación numérica contra NeMo.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos completos del modelo base.
- El repositorio ocupa 2,1 GB e incluye varias cuantizaciones; verificar el fichero descargado antes de desplegar.
- Dependencia de transcribe.cpp y de commits concretos (`42528dd` para validación, `53276c6` para el modelo base); cambios en el runtime pueden afectar a la compatibilidad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/parakeet-tdt-1.1b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-1.1b
- Commit del modelo base: https://huggingface.co/nvidia/parakeet-tdt-1.1b/commit/53276c6
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-1.1b.md
- Documentación de NeMo ASR: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Repositorio NeMo: https://github.com/NVIDIA/NeMo
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper Conformer (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
- Portal NVIDIA Developer: https://developer.nvidia.com/
- NVIDIA Riva Speech: https://developer.nvidia.com/riva
- Suno.ai: https://www.suno.ai/
