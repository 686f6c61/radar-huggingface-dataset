# GhaythMahadin/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

Nemotron 3.5 ASR Streaming 0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por NVIDIA y distribuido aquí en formato GGUF por el usuario GhaythMahadin. Se trata de un encoder FastConformer "cache-aware" de 0,6 mil millones de parámetros (637.991.968 exactos según safetensors) acoplado a un decodificador transducer RNN-T condicionado por prompt de idioma. Su rasgo diferencial es que soporta tanto inferencia offline de alta precisión como streaming por fragmentos seleccionable en tiempo de ejecución, lo que lo hace apto para transcripción en vivo sin reentrenar ni cambiar de modelo.

El modelo cubre 32 locales de idioma con puntuación y capitalización, e incluye detección automática de idioma mediante una etiqueta `<lang-XX>`. Esta conversión a GGUF está pensada para ejecutarse con transcribe.cpp, una implementación en C++ que permite desplegarlo en CPU, Vulkan y Metal sin depender del stack de NeMo ni de PyTorch, lo que reduce drásticamente los requisitos de infraestructura.

Su relevancia actual radica en la combinación de tamaño contenido (menos de 1,2 GB en F16 y 473 MB en Q4_K_M), latencia en tiempo real verificada en hardware de consumo (factor de tiempo real de 98x en Metal sobre M4 Max) y una licencia OpenMDW-1.1 que facilita el uso comercial. Es una opción realista para transcripción embebida, subtitulado en directo y pipelines de voz en producción sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + transducer RNN-T condicionado por prompt (decoder) |
| Parametros totales | 637.991.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; ventana de atención offline `att_context_size=[56, 13]` (1,12 s) y streaming configurable con `--stream-att-right {0,3,6,13}` |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 32 locales: en, es, fr, it, pt, nl, de, tr, ru, ar, hi, ja, ko, vi, uk, pl, sv, cs, nb, da, bg, fi, hr, sk, zh, hu, ro, et (el tokenizer reconoce 40; 8 requieren fine-tuning) |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura combina un encoder FastConformer con atención cache-aware, diseñado para procesar audio de forma incremental sin recalcular el pasado, y un decodificador transducer RNN-T que incorpora un prompt de idioma para condicionar la salida. El modelo expone dos rutas de inferencia: una offline con `att_context_size=[56, 13]` que ofrece la máxima precisión, y una ruta de streaming por fragmentos seleccionable en tiempo de ejecución mediante `--stream-chunk-ms 1120` y el parámetro `--stream-att-right`, que controla cuántos frames de contexto derecho se permiten (0, 3, 6 o 13) a cambio de latencia.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del autor de la conversión reproduce la del modelo original de NVIDIA pero no incluye esos detalles. Sí se documenta que el tokenizer reconoce 40 locales, de los cuales 32 están plenamente soportados y 8 son "adaptation-ready", es decir, requieren fine-tuning para un rendimiento adecuado. La conversión a GGUF se validó numéricamente contra la referencia de NeMo en el commit `909e94e` de transcribe.cpp, con fecha de anclaje 2026-06-08.

## Capacidades

- Transcripción de voz a texto multilingüe en 32 locales con puntuación y capitalización automáticas.
- Streaming en tiempo real con fragmentos configurables (`--stream-chunk-ms`) y control del contexto derecho de atención.
- Detección automática de idioma mediante etiqueta `<lang-XX>` en modo auto.
- Selección explícita de idioma por llamada (`--language en-US`, `fr-FR`, `de-DE`, etc.).
- Marcas de tiempo a nivel de token (`timestamps: token`).
- Ruta offline de alta precisión y ruta de streaming en el mismo artefacto.
- No soporta traducción (`translate: false`).

## Casos de uso

- Subtitulado en directo: el modo streaming con fragmentos de 1120 ms y contexto derecho ajustable permite generar subtítulos con latencia controlada en retransmisiones, videoconferencias o eventos, sin necesidad de GPU dedicada gracias a los factores de tiempo real medidos en CPU y Metal.
- Transcripción de reuniones y notas de voz: la ruta offline con `att_context_size=[56, 13]` ofrece la máxima precisión (WER de 7,97 % en FLEURS en y 3,04 % en LibriSpeech test-clean) para procesar grabaciones completas por lotes.
- Asistentes de voz embebidos: con 473 MB en Q4_K_M y ejecución en CPU vía transcribe.cpp, el modelo cabe en dispositivos de borde y sistemas empotrados para comandos de voz y dictado.
- Atención al cliente automatizada por voz: la detección automática de idioma y el soporte de 32 locales permiten enrutar y transcribir llamadas multilingües en un solo pipeline sin modelos separados por idioma.
- Generación de actas y búsqueda sobre audio: las marcas de tiempo a nivel de token facilitan alinear transcripciones con el audio para indexación, búsqueda y revisión posterior.
- Pipelines de accesibilidad: transcripción en tiempo real de clases, charlas o contenido audiovisual para generar subtítulos automáticos en múltiples idiomas con hardware de consumo.

## Benchmarks y rendimiento

Datos de WER publicados por el autor de la conversión (greedy RNN-T, `--language en-US`, normalizador whisper):

| Cuantizacion | WER FLEURS en (%) | WER LibriSpeech test-clean (%) | Tamano |
|---|---:|---:|---:|
| F32 | 7,97 | 3,04 | 2,38 GB |
| F16 | 7,97 | 3,03 | 1,19 GB |
| Q8_0 | 7,88 | 3,06 | 716 MB |
| Q6_K | 8,02 | 3,07 | 593 MB |
| Q5_K_M | 8,15 | 3,10 | 534 MB |
| Q4_K_M | 8,49 | 3,28 | 473 MB |

Referencia NeMo sobre el mismo manifiesto: 7,99 % en FLEURS en (NVIDIA reporta 7,91 % en en-US) y 3,03 % en LibriSpeech test-clean.

Factores de tiempo real (RTF) medidos:

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 98 |
| Apple M4 Max | CPU | 29 |
| Ryzen 7 4750U | Vulkan | 14,5 |
| Ryzen 7 4750U | CPU | 7,5 |

## Requisitos de hardware

- VRAM estimada: entre 473 MB (Q4_K_M) y 2,38 GB (F32); en la práctica el modelo se ejecuta en memoria unificada o RAM del sistema, no requiere VRAM dedicada.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA); no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 1-2 GB de memoria disponible; también funciona enteramente en CPU.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake); no se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 98x en Metal sobre M4 Max y 14,5x en Vulkan sobre Ryzen 7 4750U, lo que implica procesar audio muy por encima de tiempo real en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B (esta ficha) | 0,64 B | 32 locales | Sí, cache-aware | OpenMDW-1.1 | GGUF |
| Whisper large-v3 | 1,55 B | ~99 | No nativo (por fragmentos) | MIT | safetensors, GGUF, etc. |
| Whisper small | 0,24 B | ~99 | No nativo | MIT | safetensors, GGUF, etc. |
| Parakeet TDT 0.6B (NVIDIA) | 0,6 B | Principalmente inglés | No | CC-BY-4.0 | NeMo, safetensors |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, idiomas, soporte de streaming y licencia. La ventaja diferencial de este modelo frente a Whisper es el streaming cache-aware nativo y el menor tamaño en cuantización Q4; frente a Parakeet, la cobertura multilingüe de 32 locales.

## Limitaciones y advertencias

- El WER se degrada ligeramente al cuantizar: de 7,97 % en F32 a 8,49 % en Q4_K_M en FLEURS en, y de 3,04 % a 3,28 % en LibriSpeech test-clean.
- Ocho de los 40 locales reconocidos por el tokenizer son "adaptation-ready" y requieren fine-tuning; no deben usarse en producción sin validación.
- No soporta traducción; solo transcripción en el idioma de origen.
- No se dispone de información sobre sesgos, riesgo de alucinación ni robustez ante acentos o ruido de fondo en la documentación proporcionada.
- El modelo se distribuye únicamente para transcribe.cpp; no hay pesos en safetensors ni integración con frameworks como transformers o NeMo en este repositorio.
- La licencia OpenMDW-1.1 debe revisarse en la model card original de NVIDIA para confirmar condiciones de uso comercial y atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-25; es una conversión reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Commit del modelo base referenciado: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/commit/24b151a
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-3.5-asr-streaming-0.6b.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/909e94e
- Paper referenciado (arXiv:2312.17279): https://arxiv.org/abs/2312.17279
- Paper referenciado (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
