# mrsoundmind/canary-1b-v2-gguf

## Resumen

`mrsoundmind/canary-1b-v2-gguf` es una conversión a formato GGUF del modelo `nvidia/canary-1b-v2`, un sistema de reconocimiento automático del habla (ASR) y traducción de voz (AST) desarrollado por NVIDIA. La conversión la mantiene el usuario mrsoundmind y está pensada para su uso con `transcribe.cpp`, una implementación en C++ derivada del ecosistema llama.cpp adaptada a modelos de voz. El modelo base resuelve dos tareas: transcripción de audio en 25 lenguas europeas y traducción de voz entre inglés y las otras 24 lenguas.

Arquitectónicamente es un modelo multitarea AED (Attention Encoder-Decoder) de aproximadamente 978 millones de parámetros, con un encoder FastConformer de 32 capas y un decoder Transformer de 8 capas. Toma audio WAV mono a 16 kHz y produce texto. No es un modelo de streaming y, en este port, no expone timestamps a nivel de palabra ni de segmento, aunque el modelo original sí los soporta.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo ASR multilingüe de calidad cercana al estado del arte en hardware de consumo gracias a las cuantizaciones GGUF (desde 701 MB en Q4_K_M); por otro, demuestra que el ecosistema de inferencia en C++ se está extendiendo más allá de los LLM hacia modelos de voz, con backend Metal, Vulkan y CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitarea AED: encoder FastConformer de 32 capas + decoder Transformer de 8 capas |
| Parametros totales | 980.046.848 (~978M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada WAV mono 16 kHz) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base `nvidia/canary-1b-v2` es un sistema AED (Attention Encoder-Decoder) con encoder FastConformer de 32 capas y decoder Transformer de 8 capas, entrenado por NVIDIA para transcripción y traducción de voz multilingüe. La ficha del port no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esa información corresponde a la model card upstream de NVIDIA, que no se reproduce íntegramente en la información disponible.

La innovación relevante de esta conversión no está en el entrenamiento sino en el empaquetado: se han generado cuantizaciones GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) validadas numéricamente contra la referencia NeMo en el commit `db53eda` de transcribe.cpp, sobre el commit upstream `87bc526` fijado el 2026-05-08. El port no implementa streaming ni timestamps, y el autor indica explícitamente que la detección de idioma no está expuesta (`lang_detect: false`) aunque la traducción sí (`translate: true`).

## Capacidades

- Transcripción automática del habla (ASR) en 25 lenguas europeas.
- Traducción de voz (AST) de inglés a las otras 24 lenguas.
- Traducción de voz (AST) de las otras 24 lenguas a inglés.
- Procesamiento de audio WAV mono a 16 kHz como entrada.
- Ejecución offline en CPU, Metal (Apple Silicon) y Vulkan (GPU integradas/AMD).
- Cuantizaciones de 4 a 8 bits con pérdida de calidad mínima en WER.
- No soporta streaming.
- No expone timestamps de palabra ni de segmento en este port.
- No incluye detección de idioma automática en este port.
- No soporta tool calling ni function calling (no es un LLM).
- No soporta visión ni audio multimodal más allá del ASR/AST.

## Casos de uso

- Transcripción de reuniones y actas: el modelo convierte grabaciones WAV mono 16 kHz en texto en cualquiera de las 25 lenguas soportadas, lo que permite generar actas en un portátil sin conexión ni GPU dedicada usando Q5_K_M (798 MB).
- Subtitulado de contenido audiovisual europeo: para vídeos en inglés se puede generar la transcripción y, con la capacidad AST, producir subtítulos en las 24 lenguas restantes, cubriendo mercados como polaco, rumano o griego con un único modelo.
- Atención al cliente multilingüe: transcripción de llamadas grabadas en centros de soporte con agentes y clientes de distintas lenguas europeas, alimentando sistemas de análisis de calidad o búsqueda sobre el texto resultante.
- Archivística y digitalización: procesamiento por lotes de archivos de audio históricos o entrevistas en 25 lenguas con un pipeline en CPU, sin depender de servicios en la nube y con licencia CC-BY-4.0 que permite uso comercial con atribución.
- Investigación en lingüística computacional: evaluación comparativa de ASR en lenguas de bajos recursos europeos (maltés, estonio, esloveno, letón) usando las distintas cuantizaciones para medir el impacto de la compresión en el WER.
- Traducción de voz en entornos con recursos limitados: despliegue en dispositivos edge (Raspberry Pi, mini-PC con Vulkan) para traducción inglés→lengua local o lengua local→inglés en tiempo casi real, dado el RTF de 13,2 en Vulkan sobre Ryzen 4750U.
- Preprocesado para pipelines de LLM: transcripción de audio a texto como paso previo a un modelo de lenguaje, aprovechando la licencia permisiva y el tamaño reducido (701 MB en Q4_K_M) para incluirlo en contenedores pequeños.

## Benchmarks y rendimiento

El autor publica WER sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación greedy y sin LM externo:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 (referencia) | 3,7 GB | 1,92% |
| F16 | 1,8 GB | 1,92% |
| Q8_0 | 1,1 GB | 1,91% |
| Q6_K | 889 MB | 1,94% |
| Q5_K_M | 798 MB | 1,93% |
| Q4_K_M | 701 MB | 1,91% |

NVIDIA reporta 2,18% en su model card upstream; el port F32 obtiene 1,92% (−0,26 pp), diferencia que el autor atribuye a variaciones en el método de puntuación.

Rendimiento (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 85,2 |
| Apple M4 Max | CPU | 18,9 |
| AMD Ryzen 7 4750U | Vulkan | 13,2 |
| AMD Ryzen 7 4750U | CPU | 6,7 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 701 MB (Q4_K_M) y 3,7 GB (F32). En la práctica, con Q4_K_M o Q5_K_M cabe holgadamente en cualquier equipo con 2 GB de RAM libre.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU, en Apple Silicon vía Metal y en GPU AMD/integradas vía Vulkan.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 3050, integradas recientes). No se han publicado pruebas en A100/H100 en la información disponible.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`). No se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles; el formato GGUF es específico de transcribe.cpp en este caso.
- Latencia y throughput: RTF de 85,2 en Metal sobre M4 Max, 18,9 en CPU sobre M4 Max, 13,2 en Vulkan sobre Ryzen 4750U y 6,7 en CPU sobre Ryzen 4750U. El RTF mide velocidad relativa al tiempo real; valores superiores a 1 indican procesamiento más rápido que tiempo real.
- Conversión de audio previa requerida: `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Timestamps | Licencia | Formato |
|---|---|---:|---|---|---|---|
| canary-1b-v2 (este port GGUF) | ~978M | 25 | No | No (en este port) | CC-BY-4.0 | GGUF |
| nvidia/canary-1b-v2 (original) | ~978M | 25 | No | Sí | CC-BY-4.0 | safetensors (NeMo) |
| Whisper large-v3 | ~1550M | ~99 | No | Sí | MIT | safetensors, GGUF, etc. |
| Whisper large-v3-turbo | ~809M | ~99 | No | Sí | MIT | safetensors, GGUF, etc. |

Nota: los datos de Whisper large-v3 y large-v3-turbo se incluyen como referencia de categoría; no se dispone de una comparación de WER entre estos modelos y canary-1b-v2 en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo o segmentos cerrados, lo que limita su uso en aplicaciones de transcripción en vivo.
- No expone timestamps de palabra ni de segmento en este port, aunque el modelo upstream sí los soporta. Para subtitulado con alineación temporal habría que usar el modelo original en NeMo.
- No incluye detección automática de idioma (`lang_detect: false`); el idioma debe especificarse o inferirse externamente.
- Solo acepta WAV mono a 16 kHz; es necesario remuestrear y convertir el canal antes de la inferencia.
- El WER de 1,92% en LibriSpeech test-clean corresponde a inglés limpio; el rendimiento en otras lenguas, audio ruidoso o acentos no se documenta en la información disponible.
- Riesgo de alucinación: como todo modelo AED entrenado con pares audio-texto, puede generar texto plausible en segmentos de silencio o ruido. No se han publicado análisis específicos de este comportamiento.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al estar entrenado sobre corpus europeos, es esperable un sesgo hacia variedades estándar de cada lengua.
- Licencia CC-BY-4.0: permite uso comercial con atribución. Es necesario citar a NVIDIA y al autor del port. Verificar los términos completos en el modelo upstream.
- El port está validado contra un commit concreto de transcribe.cpp (`db53eda`) y del modelo upstream (`87bc526`); cambios posteriores en cualquiera de los dos pueden romper la compatibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face del port: https://huggingface.co/mrsoundmind/canary-1b-v2-gguf
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Commit upstream fijado: https://huggingface.co/nvidia/canary-1b-v2/commit/87bc526
- Demo de NVIDIA: https://huggingface.co/spaces/nvidia/canary-1b-v2
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Portal de desarrolladores de NVIDIA: https://developer.nvidia.com
- Nemotron: https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/
- NVIDIA Riva Speech: https://developer.nvidia.com/riva
- Papers referenciados en los tags: arXiv 2509.14128, 2505.13404, 2305.05084, 1706.03762, 2410.01036, 2406.00899, 2205.12446, 2012.03411, 2007.10310, 2005.08072, 1510.08484
