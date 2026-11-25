# GhaythMahadin/canary-180m-flash-gguf

## Resumen

canary-180m-flash es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por NVIDIA dentro de la familia NeMo Canary. Se trata de un modelo encoder-decoder de 182 millones de parámetros (189.083.776 reales en safetensors) que combina un encoder FastConformer de 17 capas con un decoder Transformer de 4 capas. Soporta transcripción en inglés, alemán, español y francés, además de traducción bidireccional entre inglés y las otras tres lenguas, con y sin puntuación y mayúsculas.

La ficha que nos ocupa no es el modelo original, sino una conversión a formato GGUF publicada por el usuario GhaythMahadin (el repositorio original de conversiones pertenece a handy-computer) para su uso con el runtime transcribe.cpp. Esta conversión permite ejecutar el modelo en CPU y en GPUs de consumo mediante cuantizaciones que van desde F32 (756 MB) hasta Q4_K_M (139 MB), manteniendo un WER prácticamente idéntico al del modelo en precisión completa sobre LibriSpeech test-clean (1,90-1,94 %).

El interés actual de esta conversión radica en que ofrece ASR multilingüe de calidad cercana al estado del arte en un paquete de menos de 220 MB, ejecutable sin dependencias de CUDA ni de la pila NeMo, con licencia CC-BY-4.0 que permite uso comercial. Es una opción realista para transcripción offline en dispositivos modestos, aplicaciones de escritorio y pipelines embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: FastConformer (17 capas) + Transformer decoder (4 capas), multitask AED |
| Parametros totales | 189.083.776 (182M según model card upstream) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada de audio, no contexto de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, de, es, fr (ASR); traducción EN↔{DE, ES, FR} |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp); modelo base en NeMo/.nemo |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Canary descrita en el paper arXiv:2409.13523: un encoder FastConformer de 17 capas que extrae características acústicas y un decoder Transformer de 4 capas que genera texto condicionado por tokens de tarea (`<target language>`, `<task>`, `<toggle timestamps>`, `<toggle PnC>`). El tokenizador es concatenado a partir de tokenizadores SentencePiece individuales por idioma, lo que facilita la escalabilidad a nuevas lenguas. La entrada es audio WAV mono a 16 kHz.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. La model card upstream menciona que el modelo alcanza más de 1200 RTFx en los conjuntos del open-asr-leaderboard, pero no se aportan cifras de tokens ni de mezcla de datos. La conversión GGUF fue validada contra la referencia NeMo en el commit db53eda de transcribe.cpp, con una diferencia de una sola sustitución sobre ~27.000 palabras de referencia, lo que sitúa el port en el ruido de medida.

## Capacidades

- Transcripción de voz (ASR) en inglés, alemán, español y francés.
- Traducción de voz bidireccional EN↔{DE, ES, FR}, con o sin puntuación y mayúsculas.
- Control de PnC (puntuación y capitalización) mediante token de tarea.
- Timestamps a nivel de palabra y segmento: funcionalidad experimental en el modelo upstream, no expuesta en el port v1 de transcribe.cpp.
- No soporta streaming: el modelo procesa ficheros completos, no audio en tiempo real.
- No incluye detección de idioma automática (`lang_detect: false` en los metadatos de la conversión).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR/traducción.

## Casos de uso

- Transcripción offline de reuniones y entrevistas: el modelo procesa ficheros WAV de 16 kHz mono y genera transcripciones en cuatro idiomas con WER de 5,98 % (en), 7,33 % (de), 6,54 % (es) y 8,53 % (fr) sobre FLEURS con Q8_0, adecuado para actas y notas internas.
- Subtitulado y traducción de contenido audiovisual: la capacidad de traducción EN↔{DE, ES, FR} permite generar subtítulos traducidos en un solo paso, útil para catálogos multilingües o formación interna.
- Aplicaciones de escritorio y utilidades CLI: con cuantización Q4_K_M (139 MB) cabe en cualquier equipo y se ejecuta vía transcribe.cpp sin CUDA, lo que facilita integrarlo en herramientas locales de dictado o indexación de audio.
- Transcripción en dispositivos embebidos o de gama baja: el tamaño reducido y los RTF medidos (21,73 en CPU Ryzen 4750U, 78,91 en CPU M4 Max) permiten procesar audio en portátiles sin GPU dedicada.
- Pipelines de accesibilidad: generación de transcripciones para personas con discapacidad auditiva en entornos con recursos limitados, donde un modelo de 180M es viable en servidores modestos.
- Preprocesado de datos para entrenamiento de otros modelos: transcripción masiva de corpus de audio en inglés, alemán, español y francés con coste computacional bajo, gracias a los RTF y al tamaño del modelo.
- Investigación en ASR multilingüe: como baseline ligero y reproducible en formato GGUF para comparar con modelos mayores o para experimentar con decodificación y cuantización.

## Benchmarks y rendimiento

Datos publicados en la model card de la conversión (WER en %):

| Benchmark | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| LibriSpeech test-clean (en) | 1,94 | 1,94 | 1,93 | 1,93 | 1,90 | 1,93 |
| FLEURS de | — | — | 7,33 | — | — | — |
| FLEURS en | — | — | 5,98 | — | — | — |
| FLEURS es | — | — | 6,54 | — | — | — |
| FLEURS fr | — | — | 8,53 | — | — | — |

Referencia: NVIDIA reporta 1,87 % en LibriSpeech test-clean para el modelo upstream; la ejecución de referencia con NeMo sobre los mismos WAV da 1,93 %, y el port F32 da 1,94 %. La diferencia es de una sustitución sobre ~27.000 palabras.

Rendimiento (RTF, menor es mejor; valores de la model card de la conversión):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 78,91 |
| Apple M4 Max | Metal | 153,46 |
| AMD Ryzen 4750U | CPU | 21,73 |
| AMD Ryzen 4750U | Vulkan | 33,09 |

No se han publicado resultados de benchmarks adicionales (p. ej. MLS, Common Voice) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre ~140 MB (Q4_K_M) y ~760 MB (F32) solo para los pesos; el consumo real añade overhead del runtime y buffers de audio.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD/Intel/NVIDIA); no requiere CUDA ni NeMo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria; también funciona íntegramente en CPU.
- Opciones de despliegue: transcribe.cpp (runtime oficial de esta conversión), con binario `transcribe-cli`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 21,73 (CPU Ryzen 4750U) y 78,91 (CPU M4 Max); con Metal en M4 Max el RTF es 153,46, lo que indica que el backend GPU no siempre es más rápido que la CPU en este modelo. El modelo upstream reporta más de 1200 RTFx en los conjuntos del open-asr-leaderboard, pero esa cifra corresponde a la implementación NeMo, no a esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| canary-180m-flash (esta conversión) | 182M | en, de, es, fr | CC-BY-4.0 | GGUF (transcribe.cpp) | ASR + traducción EN↔{DE, ES, FR}; sin streaming |
| nvidia/canary-180m-flash (original) | 182M | en, de, es, fr | CC-BY-4.0 | NeMo (.nemo) | Referencia upstream; requiere pila NeMo |
| Whisper small (referencia de categoría) | ~244M | multilingüe amplio | MIT | múltiples (incl. GGUF vía whisper.cpp) | ASR y traducción a inglés; no disponible en la información proporcionada para comparación numérica |
| Whisper base (referencia de categoría) | ~74M | multilingüe amplio | MIT | múltiples | Menor tamaño y precisión; no disponible para comparación numérica |

No se dispone en la información proporcionada de resultados de benchmarks comparativos directos con Whisper u otros modelos de la misma categoría, por lo que la comparación numérica de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Modelo no streaming: no apto para transcripción en tiempo real ni para diálogo por voz de baja latencia.
- Sin detección automática de idioma: el idioma de origen debe especificarse mediante token de tarea.
- Timestamps a nivel de palabra y segmento no expuestos en el port v1 de transcribe.cpp, aunque el modelo upstream los soporta de forma experimental.
- Cobertura limitada a cuatro idiomas (en, de, es, fr); no se documenta soporte para otras lenguas.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; el WER en FLEURS (5,98-8,53 %) es superior al de LibriSpeech test-clean (1,93 %), lo que refleja mayor dificultad en audio espontáneo.
- Sesgos no documentados en la información disponible; al ser un modelo entrenado por NVIDIA, pueden existir sesgos derivados de la composición del corpus, no detallados en la model card.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y mantener el aviso de licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema reducido, menor probabilidad de soporte comunitario o de corrección de errores.
- Dependencia de transcribe.cpp: el formato GGUF de esta conversión no es compatible con llama.cpp ni con otras herramientas GGUF estándar.
- La conversión está fijada al commit b12ab41 del modelo base (2026-05-08); cambios posteriores en upstream no están reflejados.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/GhaythMahadin/canary-180m-flash-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/canary-180m-flash
- Repositorio original de conversiones GGUF: https://huggingface.co/handy-computer/canary-180m-flash-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-180m-flash.md
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Commit del modelo base: https://huggingface.co/nvidia/canary-180m-flash/commit/b12ab41
- Paper Canary (arXiv:2409.13523): https://arxiv.org/abs/2409.13523
- Paper FastConformer (arXiv:2305.05084, referenciado como [3] en la model card): no disponible como enlace directo en la información proporcionada
- Paper Transformer (arXiv:1706.03762): https://arxiv.org/abs/1706.03762
- Paper adicional citado (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
