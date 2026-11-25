# GhaythMahadin/parakeet-ctc-0.6b-gguf

## Resumen

Parakeet CTC 0.6B es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai. Se trata de una variante XL de FastConformer CTC, con aproximadamente 600 millones de parámetros, que transcribe voz a texto en minúsculas usando un cabezal CTC lineal con decodificación greedy. La ficha que nos ocupa, publicada por GhaythMahadin, es una conversión a formato GGUF del checkpoint original `nvidia/parakeet-ctc-0.6b`, empaquetada para su uso con el runtime transcribe.cpp.

El modelo resuelve el problema de la transcripción offline de audio en inglés con un coste computacional bajo y sin dependencia de un modelo de lenguaje externo. Su arquitectura FastConformer-Large combina capas convolucionales y atención para procesar audio de 16 kHz, y el cabezal CTC permite una decodificación extremadamente simple y rápida, lo que lo hace atractivo para despliegues en dispositivos con recursos limitados.

La relevancia actual de esta conversión radica en que traslada un modelo ASR de referencia de NVIDIA al ecosistema GGUF, facilitando su ejecución en CPU, GPU consumer y aceleradores Metal o Vulkan mediante transcribe.cpp. Con un WER de 1,87 % en LibriSpeech test-clean y un tamaño de entre 469 MB y 2,44 GB según cuantización, se posiciona como una opción práctica para transcripción local sin infraestructura de servidor dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer-Large con cabezal CTC lineal |
| Parámetros totales | 608.848.897 (~0,6 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio; el modelo procesa segmentos completos) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (conversión desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base `nvidia/parakeet-ctc-0.6b` es un FastConformer CTC de tipo XL, con cerca de 600 millones de parámetros. FastConformer es una variante de Conformer que reduce el coste computacional mediante downsampling en las capas de atención, manteniendo la combinación de bloques convolucionales y de auto-atención que caracteriza a la familia. El cabezal de salida es un CTC lineal, lo que elimina la necesidad de un decodificador autorregresivo y permite decodificación greedy en una sola pasada. El modelo fue desarrollado conjuntamente por NVIDIA NeMo y Suno.ai y se distribuye a través del toolkit NeMo, además de ser compatible con Transformers de Hugging Face.

No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR CTC). La conversión GGUF fue realizada por GhaythMahadin a partir del commit `ad09ba1` del modelo base (fijado el 2026-05-10) y validada numéricamente contra la referencia NeMo en el commit `42528dd` de transcribe.cpp el 2026-05-10. La innovación técnica destacable es la propia cuantización GGUF con preservación de precisión: las variantes Q6_K y Q5_K_M mantienen o incluso mejoran ligeramente el WER del baseline F32 (1,84 % y 1,87 % frente a 1,87 %).

## Capacidades

- Transcripción de voz a texto en inglés con salida en minúsculas y sin puntuación.
- Decodificación CTC greedy, sin modelo de lenguaje externo ni rescoring.
- Generación de timestamps a nivel de token (según el campo `timestamps: token` de la model card).
- Procesamiento offline de audio de 16 kHz mono en formato WAV.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo procesa archivos WAV de 16 kHz mono de forma offline y produce transcripciones con timestamps a nivel de token, adecuado para generar actas o índices buscables sin enviar audio a servicios en la nube.
- Subtitulado automático de vídeo en inglés: con un WER de 1,87 % en LibriSpeech test-clean y decodificación rápida, puede integrarse en pipelines de postproducción para generar pistas de subtítulos base que luego se revisan manualmente.
- Notas de voz en aplicaciones de productividad: la variante Q4_K_M (469 MB) cabe en dispositivos de gama baja y permite transcripción local en escritorio o móvil sin conexión, preservando la privacidad del audio.
- Análisis de llamadas de atención al cliente: la transcripción offline con timestamps facilita la extracción de métricas y la búsqueda de fragmentos concretos en grabaciones, sin coste por minuto de API.
- Archivado y accesibilidad de contenido audiovisual: digitalización de archivos de audio históricos en inglés para generar transcripciones indexables y cumplir requisitos de accesibilidad.
- Prototipado e investigación en ASR: al ser una conversión GGUF validada contra NeMo, sirve como referencia reproducible para experimentos de cuantización y comparación de runtimes en CPU, Metal y Vulkan.
- Transcripción en dispositivos edge con aceleración Metal o Vulkan: los datos de rendimiento de la model card (RTF 218,5 en Metal sobre M4 Max, RTF 22,5 en Vulkan sobre Ryzen 4750U) lo hacen viable en portátiles y mini-PC sin GPU dedicada.

## Benchmarks y rendimiento

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,44 GB | 1,87 % |
| F16 | 1,22 GB | 1,87 % |
| Q8_0 | 722 MB | 1,87 % |
| Q6_K | 594 MB | 1,84 % |
| Q5_K_M | 533 MB | 1,87 % |
| Q4_K_M | 469 MB | 1,90 % |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación CTC greedy y sin modelo de lenguaje externo. El baseline de referencia F32 es 1,87 %, y el valor autoinformado por NVIDIA sobre el mismo split es 1,87 %.

Datos de rendimiento (RTF, factor de tiempo real):

| Plataforma | Acelerador | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 218,5 |
| Apple M4 Max | CPU | 30,5 |
| AMD Ryzen 4750U | Vulkan | 22,5 |
| AMD Ryzen 4750U | CPU | 10 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 469 MB (Q4_K_M) y 2,44 GB (F32); la variante Q8_0 requiere 722 MB y la Q5_K_M 533 MB.
- GPU recomendadas: no se especifican modelos concretos de GPU en la información disponible; los datos de rendimiento se han medido en Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan/CPU).
- Cabe en GPU consumer: sí, todas las cuantizaciones caben holgadamente en GPUs consumer con 4 GB o más de VRAM; la variante Q4_K_M (469 MB) incluso en iGPU y dispositivos de gama baja.
- Opciones de despliegue: transcribe.cpp (runtime principal para el que se empaquetó), con backend CPU, Metal y Vulkan. El modelo base también es ejecutable con NVIDIA NeMo y con Transformers de Hugging Face.
- Latencia y throughput: RTF de 218,5 en Metal (M4 Max), 30,5 en CPU (M4 Max), 22,5 en Vulkan (Ryzen 4750U) y 10 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/audio | WER LibriSpeech test-clean | Licencia | Formato |
|---|---:|---|---:|---|---|
| parakeet-ctc-0.6b (esta ficha, GGUF) | ~0,6 B | audio 16 kHz mono | 1,87 % | CC-BY-4.0 | GGUF |
| nvidia/parakeet-ctc-0.6b (original) | ~0,6 B | audio 16 kHz mono | 1,87 % | CC-BY-4.0 | safetensors (NeMo) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre otros modelos ASR comparables (por ejemplo, Whisper u otros Parakeet) que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Solo soporta inglés; no traduce ni detecta idioma.
- Salida en minúsculas y sin puntuación, lo que limita su uso directo en productos que requieran texto formateado.
- No es un modelo de streaming: requiere el audio completo o segmentos cerrados, no admite transcripción incremental en tiempo real.
- Riesgo de alucinación y errores en audio con ruido, acentos no nativos o vocabulario especializado; el WER de referencia corresponde a LibriSpeech, un corpus relativamente limpio.
- No incorpora modelo de lenguaje externo ni rescoring, por lo que la corrección contextual es limitada.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a NVIDIA y Suno.ai y cumplir los términos del modelo base.
- La conversión GGUF está fijada a un commit concreto del modelo base (ad09ba1) y validada contra un commit concreto de transcribe.cpp (42528dd); cambios posteriores en cualquiera de los dos pueden alterar el comportamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad.
- No se dispone de información sobre sesgos específicos del modelo más allá de los inherentes a los datos de entrenamiento de NVIDIA, no detallados en la información proporcionada.

## Enlaces

- [Hugging Face: GhaythMahadin/parakeet-ctc-0.6b-gguf](https://huggingface.co/GhaythMahadin/parakeet-ctc-0.6b-gguf)
- [Modelo base: nvidia/parakeet-ctc-0.6b](https://huggingface.co/nvidia/parakeet-ctc-0.6b)
- [Commit del modelo base ad09ba1](https://huggingface.co/nvidia/parakeet-ctc-0.6b/commit/ad09ba1)
- [transcribe.cpp (GitHub)](https://github.com/handy-computer/transcribe.cpp)
- [transcribe.cpp commit 42528dd](https://github.com/handy-computer/transcribe.cpp/tree/42528dd)
- [Página del modelo en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-ctc-0.6b.md)
- [NVIDIA NeMo (GitHub)](https://github.com/NVIDIA/NeMo)
- [Documentación de FastConformer en NeMo](https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer)
- [Suno.ai](https://www.suno.ai/)
- [Paper arXiv:2305.05084](https://arxiv.org/abs/2305.05084)
- [Transformers de Hugging Face](https://github.com/huggingface/transformers)
