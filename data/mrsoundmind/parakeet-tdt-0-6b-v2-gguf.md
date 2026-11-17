# mrsoundmind/parakeet-tdt-0.6b-v2-gguf

## Resumen

`mrsoundmind/parakeet-tdt-0.6b-v2-gguf` es una conversión a formato GGUF del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v2`, publicada por el usuario mrsoundmind para su uso con `transcribe.cpp`, un motor de inferencia en C++ derivado del ecosistema llama.cpp. El modelo original lo desarrolla NVIDIA dentro de su framework NeMo y está pensado para transcripción de audio en inglés con calidad de producción, incluyendo puntuación, mayúsculas y marcas de tiempo a nivel de token.

La arquitectura es un encoder FastConformer de tipo XL (aproximadamente 600 millones de parámetros, 617.869.958 exactos según safetensors) combinado con un decoder transducer TDT/RNNT. El modelo procesa audio de 16 kHz mono en WAV y genera transcripciones en una sola pasada, con soporte para segmentos de hasta 24 minutos según la model card original. No es un modelo de streaming ni multilingüe: la versión v2 está entrenada exclusivamente para inglés.

La relevancia de esta conversión GGUF reside en que permite ejecutar un modelo ASR de NVIDIA de alto rendimiento en CPU y GPU de consumo mediante un runtime ligero en C++, sin depender del stack Python de NeMo. Las cuantizaciones publicadas van de F32 (2,47 GB) a Q4_K_M (483 MB), con una degradación de WER muy contenida: 1,68 % en F32 frente a 1,72 % en Q4_K_M sobre LibriSpeech test-clean.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer XL (encoder) + TDT/RNNT (decoder transducer) |
| Parametros totales | 617.869.958 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; la model card original indica segmentos de audio de hasta 24 minutos en una sola pasada |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base en safetensors/NeMo |

## Arquitectura y entrenamiento

El modelo base es un FastConformer XL con decoder TDT (Token-and-Duration Transducer), una variante de RNNT que predice conjuntamente tokens y duraciones, lo que acelera la decodificación frente a un transducer clásico. El encoder usa atención completa (full attention), lo que permite procesar segmentos largos de audio en una sola pasada; la model card original cita hasta 24 minutos por segmento. El decoder es un transducer greedy en la configuración de referencia, sin modelo de lenguaje externo.

Los detalles concretos del dataset de entrenamiento (número de horas, composición, si hubo etapas de fine-tuning con datos sintéticos o aumentación) no están disponibles en la información proporcionada más allá de lo que indica la model card original de NVIDIA. La conversión GGUF se realizó a partir del commit `1b149a3` del modelo upstream, fijado el 2026-04-15, y se validó contra la referencia NeMo en el commit `bf0d0b7` de transcribe.cpp el 2026-04-18. La innovación principal de esta ficha es la propia conversión: preserva el comportamiento numérico del original con una diferencia de WER de apenas 0,01 puntos entre F32 y Q8_0.

## Capacidades

- Transcripción de voz a texto en inglés sobre audio de 16 kHz mono en formato WAV.
- Puntuación y capitalización automáticas en la salida.
- Predicción de marcas de tiempo a nivel de token (no a nivel de palabra, según la metadata de transcribe.cpp).
- Buen rendimiento en números hablados y transcripción de letras de canciones, según la model card original.
- Procesamiento de segmentos de audio largos (hasta 24 minutos) en una sola pasada.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No es multilingüe; solo inglés.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo procesa segmentos de hasta 24 minutos en una sola pasada y devuelve puntuación y mayúsculas, lo que reduce el post-procesado necesario antes de indexar el texto en un sistema de búsqueda.
- Subtitulado automático con marcas de tiempo: la predicción de timestamps a nivel de token permite alinear la transcripción con el audio para generar subtítulos sincronizados, útil en plataformas de vídeo o archivado de medios.
- Dictado y notas de voz en aplicaciones de escritorio: con la cuantización Q4_K_M (483 MB) el modelo cabe en memoria de un portátil convencional y puede ejecutarse en CPU mediante transcribe.cpp, sin necesidad de GPU dedicada.
- Pipeline de accesibilidad para contenido en inglés: transcripción de pódcasts, clases grabadas o vídeos formativos para generar transcripciones buscables y cumplir requisitos de accesibilidad.
- Preprocesado de datos para entrenamiento de otros modelos: generación masiva de transcripciones de audio en inglés para construir datasets de texto alineado con audio, aprovechando el throughput del modelo (RTFx de 3380 en la model card original con batch 128).
- Análisis de llamadas de atención al cliente: transcripción de grabaciones telefónicas en inglés para extraer texto y alimentar sistemas de análisis de sentimiento o control de calidad, con la ventaja de que el modelo corre en infraestructura modesta.
- Archivado y búsqueda de material audiovisual: indexación de grandes volúmenes de audio histórico en inglés con un coste computacional bajo gracias a las cuantizaciones pequeñas y al runtime en C++.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances, decodificación greedy del transducer, sin LM externo), medidos por el autor de la conversión:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,47 GB | 1,68 % |
| F16 | 1,24 GB | 1,68 % |
| Q8_0 | 730 MB | 1,69 % |
| Q6_K | 608 MB | 1,70 % |
| Q5_K_M | 547 MB | 1,70 % |
| Q4_K_M | 483 MB | 1,72 % |

El número autoinformado por NVIDIA sobre el mismo split es 1,69 %, por lo que F32 y Q8_0 coinciden con la referencia upstream dentro del redondeo.

Rendimiento (RTF, real-time factor) medido por el autor:

| Plataforma | Backend | RTF |
|---|---|---:|
| Ryzen 4750U | CPU | 8 |
| Ryzen 4750U | Vulkan | 15 |
| Apple M4 Max | CPU | 29 |
| Apple M4 Max | Metal | 175 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 483 MB (Q4_K_M) y 2,47 GB (F32) solo para los pesos; hay que sumar el estado del encoder y buffers de audio, por lo que conviene reservar al menos el doble del tamaño del archivo.
- GPU recomendadas: cualquier GPU con soporte Vulkan o Metal es suficiente; no requiere A100 ni H100. En la información disponible no se detallan modelos concretos de GPU más allá de los backends probados.
- Cabe en GPU de consumo: sí, con amplio margen. La cuantización Q4_K_M ocupa menos de 500 MB, por lo que entra en cualquier GPU integrada o dedicada moderna.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan otros runtimes compatibles (llama.cpp, Ollama, vLLM, TGI) en la información disponible.
- Latencia y throughput: RTF de 8 en CPU Ryzen 4750U, 15 con Vulkan en la misma máquina, 29 en CPU de M4 Max y 175 con Metal en M4 Max. Un RTF de 175 implica procesar unas 175 veces más rápido que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/segmento | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| parakeet-tdt-0.6b-v2 (este, GGUF) | 0,62 B | en | hasta 24 min por pasada | CC-BY-4.0 | GGUF | WER 1,68 % en LibriSpeech test-clean (F32) |
| nvidia/parakeet-tdt-0.6b-v3 | no disponible | 25 idiomas europeos | no disponible | no disponible | NeMo/safetensors | Versión multilingüe sucesora; no hay datos de WER en la información disponible |
| Whisper large-v3 | no disponible en la información | multilingüe | no disponible | no disponible | varios | No hay datos comparativos en la información proporcionada |
| Whisper small | no disponible en la información | multilingüe | no disponible | no disponible | varios | No hay datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks cruzados con alternativas en la información proporcionada; la comparativa se limita a lo que la model card cita explícitamente (la existencia de la v3 multilingüe).

## Limitaciones y advertencias

- Solo inglés: no admite otros idiomas ni detección automática de idioma.
- No es streaming: requiere el audio completo (o segmentos de hasta 24 minutos) antes de transcribir; no sirve para reconocimiento en tiempo real continuo.
- No traduce: la salida es siempre texto en el idioma de entrada.
- Riesgo de alucinación inherente a los modelos transducer en audio con ruido, música o silencios largos; conviene validar la salida en dominios ruidosos.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero al ser un modelo entrenado principalmente con datos en inglés, el rendimiento puede degradarse con acentos no nativos o variedades dialectales.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es necesario citar tanto a NVIDIA como al autor de la conversión si se redistribuye.
- La conversión es no oficial: el autor es un tercero (mrsoundmind) y no NVIDIA; para producción crítica conviene validar contra la referencia NeMo.
- El runtime `transcribe.cpp` es un proyecto independiente; su madurez y soporte no están garantizados por NVIDIA.
- Requiere audio de entrada en WAV de 16 kHz mono; es necesario remuestrear y convertir canales previamente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mrsoundmind/parakeet-tdt-0.6b-v2-gguf
- Modelo base original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Commit del modelo base usado para la conversión: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2/commit/1b149a3
- Versión multilingüe sucesora: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Demo oficial de NVIDIA: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v2
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper adicional citado (arXiv:2406.00899): https://arxiv.org/abs/2406.00899
- Paper adicional citado (arXiv:2410.01036): https://arxiv.org/abs/2410.01036
- Paper adicional citado (arXiv:2505.13404): https://arxiv.org/abs/2505.13404
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
