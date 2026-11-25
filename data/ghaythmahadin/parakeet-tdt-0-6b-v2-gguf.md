# GhaythMahadin/parakeet-tdt-0.6b-v2-gguf

## Resumen

`parakeet-tdt-0.6b-v2-gguf` es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v2`, publicada por el usuario GhaythMahadin para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo original lo desarrolla NVIDIA dentro de su familia Parakeet y está diseñado para transcripción de inglés de alta calidad con puntuación, mayúsculas y marcas de tiempo a nivel de token.

La arquitectura es un codificador FastConformer (variante XL) de unos 618 millones de parámetros acoplado a un decodificador transducer TDT/RNNT. Trabaja sobre audio WAV mono a 16 kHz y procesa segmentos de hasta 24 minutos en una sola pasada, con un RTFx de 3380 reportado por NVIDIA en el leaderboard HF-Open-ASR con batch 128. No es un modelo de streaming ni multilingüe; para eso NVIDIA publica la variante v3 con 25 idiomas europeos.

La relevancia de esta ficha concreta está en el empaquetado: ofrece cuantizaciones desde F32 (2,47 GB) hasta Q4_K_M (483 MB) con una degradación de WER mínima (1,68 % en F32 frente a 1,72 % en Q4_K_M sobre LibriSpeech test-clean), lo que permite ejecutar un ASR de calidad cercana al estado del arte en CPU y en GPU de consumo mediante un runtime en C++ sin dependencias de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer XL (codificador) + decodificador TDT/RNNT (transducer) |
| Parametros totales | 617.869.958 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; audio de hasta 24 minutos por pasada (modelo original) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura FastConformer, una variante eficiente del Conformer con atención por bloques que reduce el coste computacional del codificador, combinada con un decodificador TDT (Token-and-Duration Transducer). TDT es una evolución del RNNT clásico que predice conjuntamente el token y su duración, lo que mejora la precisión en los límites de emisión y acelera la decodificación. El modelo se entrenó con atención completa, lo que le permite transcribir segmentos largos (hasta 24 minutos) sin truncar.

La model card del autor de la conversión no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste fino con preferencias; esa información corresponde a la documentación de NVIDIA y no se reproduce en los datos disponibles. La innovación destacable en este paquete es la propia conversión GGUF: el autor valida numéricamente contra la referencia NeMo (commit `bf0d0b7` de transcribe.cpp, validado el 2026-04-18) y reporta que F32 y Q8_0 reproducen el WER de NVIDIA (1,69 %) dentro del redondeo.

## Capacidades

- Transcripción de voz a texto en inglés sobre audio WAV mono a 16 kHz.
- Puntuación automática y capitalización en la salida.
- Marcas de tiempo a nivel de token (`timestamps: token`).
- Manejo robusto de números hablados y transcripción de letras de canciones (según NVIDIA).
- Procesamiento offline por lotes de segmentos de hasta 24 minutos.
- Ejecución en CPU y en GPU (Vulkan en Linux/Windows, Metal en Apple Silicon) mediante transcribe.cpp.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No es multilingüe: solo inglés.

## Casos de uso

- Subtitulado por lotes de archivos de audio y vídeo: el modelo genera marcas de tiempo a nivel de token y puntuación, lo que permite producir ficheros SRT/VTT directamente en un pipeline con ffmpeg y transcribe-cli, sin depender de servicios en la nube.
- Transcripción de reuniones y entrevistas: con soporte de segmentos de hasta 24 minutos en una sola pasada, se puede procesar una reunión completa sin trocear manualmente y con un WER cercano al 1,7 % en condiciones limpias.
- Despliegue en dispositivos de borde o sin GPU: con la cuantización Q4_K_M (483 MB) el modelo cabe en memoria de un portátil modesto y corre en CPU (RTF 8× en Ryzen 4750U), lo que lo hace apto para aplicaciones de escritorio de dictado o notas de voz.
- Indexación y búsqueda de archivos de audio: transcribir una biblioteca de podcasts o grabaciones para alimentar un motor de búsqueda de texto completo, aprovechando el procesamiento offline y la ausencia de coste por llamada a API.
- Accesibilidad: generación de transcripciones para contenido audiovisual en inglés, con puntuación y capitalización que mejoran la legibilidad frente a salidas ASR crudas.
- Aceleración en Apple Silicon: con Metal en un M4 Max el RTF reportado es de 175×, lo que permite transcribir horas de audio en minutos en un portátil Mac, útil para periodistas o investigadores que procesan entrevistas localmente.
- Preprocesado para pipelines de NLP: convertir audio en texto antes de aplicar análisis de sentimiento, resumen o extracción de entidades, manteniendo los datos en local por motivos de privacidad.

## Benchmarks y rendimiento

| Modelo / cuantización | WER LibriSpeech test-clean |
|---|---:|
| F32 (referencia del port) | 1,68 % |
| F16 | 1,68 % |
| Q8_0 | 1,69 % |
| Q6_K | 1,70 % |
| Q5_K_M | 1,70 % |
| Q4_K_M | 1,72 % |
| NVIDIA (auto-reportado, mismo split) | 1,69 % |

WER medido sobre el split completo de LibriSpeech test-clean (2620 enunciados) con decodificación transducer greedy y sin LM externa.

Rendimiento (RTF, factor de tiempo real; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Ryzen 4750U | CPU | 8 |
| Ryzen 4750U | Vulkan | 15 |
| Apple M4 Max | CPU | 29 |
| Apple M4 Max | Metal | 175 |

NVIDIA reporta además un RTFx de 3380 en el leaderboard HF-Open-ASR con batch 128 (dato del modelo original, no del port GGUF).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead del runtime. F32 ≈ 2,5 GB, F16 ≈ 1,3 GB, Q8_0 ≈ 750 MB, Q6_K ≈ 630 MB, Q5_K_M ≈ 570 MB, Q4_K_M ≈ 500 MB.
- GPU recomendadas: cualquier GPU con soporte Vulkan (Linux/Windows) o Metal (Apple Silicon). No se requieren A100/H100; el modelo está pensado para ejecución local.
- Cabe en GPU de consumo: sí, cualquier GPU con 2 GB o más de VRAM puede ejecutar incluso la versión F32; con cuantizaciones Q4/Q5 basta 1 GB.
- Opciones de despliegue: transcribe.cpp (runtime oficial de este paquete, CLI `transcribe-cli`). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible; el modelo original se sirve con NeMo.
- Latencia y throughput: RTF de 8× en CPU Ryzen 4750U, 15× con Vulkan en la misma máquina, 29× en CPU de M4 Max y 175× con Metal en M4 Max. En el modelo original, RTFx 3380 con batch 128.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v2 (este port GGUF) | 0,62 B | en | hasta 24 min | CC-BY-4.0 | GGUF / transcribe.cpp |
| nvidia/parakeet-tdt-0.6b-v2 (original) | 0,62 B | en | hasta 24 min | CC-BY-4.0 | NeMo |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B (según card) | 25 idiomas europeos | no disponible | no disponible en la información | NeMo |
| Whisper large-v3 | no disponible en la información | multilingüe | 30 s por ventana | no disponible en la información | múltiples |

La comparación con Whisper se incluye por categoría (ASR de propósito general), pero los datos concretos de parámetros, WER y licencia de Whisper no están en la información proporcionada y no se rellenan aquí.

## Limitaciones y advertencias

- Solo inglés: no transcribe otros idiomas; para multilingüe NVIDIA remite a la variante v3.
- No es streaming: requiere audio completo o segmentos; no apto para transcripción en tiempo real continua sin troceado externo.
- No hace detección de idioma ni traducción.
- El WER reportado (1,68–1,72 %) corresponde a LibriSpeech test-clean, un corpus de lectura en condiciones limpias; el rendimiento en audio con ruido, acentos marcados o solapamientos será peor y no se reporta en la información disponible.
- Riesgo de alucinación inherente a los modelos transducer en silencios largos o audio musical; la model card no documenta mitigaciones específicas.
- Sesgos: no se documentan análisis de sesgo demográfico o acústico en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a NVIDIA y cumplir los términos del modelo base.
- El paquete GGUF está validado contra una versión concreta de transcribe.cpp (commit `bf0d0b7`); cambios en el runtime pueden afectar a la compatibilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una conversión reciente y de un autor individual, no mantenida por NVIDIA; para producción conviene evaluar también la referencia oficial en NeMo.

## Enlaces

- Repositorio Hugging Face de este port: https://huggingface.co/GhaythMahadin/parakeet-tdt-0.6b-v2-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Variante multilingüe v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v2.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v2
- Documentación NeMo (FastConformer): https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Papers citados en los tags: arXiv:2305.05084, arXiv:2304.06795, arXiv:2406.00899, arXiv:2410.01036, arXiv:2505.13404
