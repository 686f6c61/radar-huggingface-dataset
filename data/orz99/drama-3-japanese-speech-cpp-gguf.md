# orz99/Drama-3-Japanese-speech-cpp-gguf

## Resumen

Drama-3-Japanese-speech-cpp-gguf es una colección de cuantizaciones GGUF del modelo de síntesis de voz Aratako/Drama-3-Japanese, publicadas por el usuario orz99 para su uso en los runtimes locales speech.cpp y audio.cpp. El modelo base, construido por Fish Audio y derivado de fishaudio/s2-pro, es un sistema de text-to-speech en japonés con clonación de voz zero-shot y generación de habla emocional expresiva, incluyendo susurros, suspiros y matices prosódicos. Con 35.774.376.977 parámetros totales y una arquitectura de tipo Mixture of Experts (la nomenclatura de los ficheros indica "35B-A3B", es decir, aproximadamente 3.000 millones de parámetros activos), el modelo está diseñado para síntesis de alta fidelidad a 44,1 kHz.

La relevancia de esta publicación reside en que traslada un modelo TTS de gran tamaño a formatos ejecutables en hardware de consumo mediante cuantizaciones calibradas con imatrix sobre un corpus estratificado en japonés. Se ofrecen cuatro variantes: dos completas en Q4_K y Q5_K (20,82 GiB y 24,57 GiB) pensadas para GPU con 24 GiB o más de VRAM libre, y dos variantes "small" en IQ3_XXS (9,09 GiB y 9,28 GiB) que caben en GPUs de 16-24 GiB, una de ellas con un parche que acelera la inferencia en CUDA.

El modelo está orientado exclusivamente al idioma japonés y su licencia es la fish-audio-community-license-1.0, que impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue en producción. No se han publicado resultados de benchmarks objetivos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Mixture of Experts (MoE), derivado de fishaudio/s2-pro; nomenclatura "35B-A3B" |
| Parametros totales | 35.774.376.977 |
| Parametros activos | Aproximadamente 3.000 millones (según nomenclatura "A3B"; cifra exacta no disponible) |
| Longitud de contexto | max_text_tokens: 8192 (según el sidecar .gguf.json) |
| Tipos de cuantizacion | Q4_K híbrida (expertos Q4_K + Q8_0/F16/F32), Q5_K híbrida, IQ3_XXS (expertos) + Q8_0/F16/F32 |
| Idiomas soportados | Japonés (ja) |
| Licencia | fish-audio-community-license-1.0 |
| Formato de pesos | GGUF / GGML (compatible con speech.cpp y audio.cpp) |

## Arquitectura y entrenamiento

El modelo base sigue la estirpe de fishaudio/s2-pro, un sistema TTS de tipo Mixture of Experts con aproximadamente 35.770 millones de parámetros totales y alrededor de 3.000 millones activos por token, lo que permite una inferencia comparativamente ligera pese al tamaño del checkpoint. La arquitectura incorpora un códec de voz identificado en el sidecar como `voice_codec: 2cf2ec268a087bd2ad91bfbb6796b0429fb03a73cdb8fd07f445d503e9a14d37`, que opera a 44,1 kHz y permite la clonación de voz zero-shot a partir de una muestra de referencia con su transcripción. La generación admite marcado expresivo en el texto de entrada (etiquetas como [囁き] para susurro o [吐息] para suspiro) y control de pausas mediante variables de entorno.

Las cuantizaciones de esta publicación se han calibrado con imatrix sobre un corpus estratificado en japonés, una técnica que ajusta los factores de escala de la cuantización a la distribución real de activaciones del idioma objetivo para minimizar la degradación. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO. Las variantes completas Q4_K y Q5_K mantienen los expertos en 4 y 5 bits respectivamente mientras conservan capas en Q8_0, F16 y F32; las variantes IQ3_XXS reducen los expertos a 3 bits con calibración imatrix específica.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés con salida PCM WAV a 44,1 kHz.
- Clonación de voz zero-shot: extracción de un prompt de voz reutilizable (fichero `.voice.gguf`) a partir de un WAV de referencia y su transcripción exacta.
- Generación de habla emocional y expresiva: susurros, suspiros, cambios de prosodia y marcas de estilo embebidas en el texto.
- Control de pausas y silencios mediante variables de entorno (`SPEECH_DRAMA3_MAX_PAUSE_FRAMES`, `AUDIOCPP_DRAMA3_MAX_PAUSE_FRAMES`, `AUDIOCPP_DRAMA3_SILENCE_CODES`).
- Control de muestreo: seed, temperatura, top-k y top-p configurables.
- Servidor local integrado en speech.cpp (`speech serve`) para exponer el modelo por HTTP.
- Soporte de dos runtimes: speech.cpp (Vulkan/CPU/CUDA) y audio.cpp (CUDA).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la muestra de referencia para clonación.

## Casos de uso

- Audiolibros y narración en japonés: el modelo sintetiza textos largos con prosodia natural y pausas controlables, y la ventana de 8192 tokens de texto permite procesar pasajes extensos sin fragmentación manual.
- Doblaje y localización de contenido al japonés: la clonación zero-shot permite replicar la voz de un actor o locutor a partir de una muestra corta, manteniendo coherencia de timbre entre segmentos.
- Producción de contenido ASMR y audios íntimos: las muestras publicadas demuestran control explícito de susurros y respiraciones mediante etiquetas como [囁き] y [吐息], útil para creadores de contenido de audio inmersivo.
- Asistentes de voz embebidos en local: la variante IQ3_XXS de 9,09 GiB cabe en GPUs de 16-24 GiB y puede servirse mediante `speech serve` en una máquina local, sin depender de APIs externas.
- Prototipado de interfaces conversacionales en japonés: el servidor HTTP local y el control de seed permiten integrar el modelo en pipelines de pruebas de UX de voz con resultados reproducibles.
- Generación de voces para videojuegos y contenido interactivo: la extracción de prompts de voz reutilizables facilita asignar voces consistentes a personajes y regenerar líneas de diálogo con el mismo perfil.
- Investigación en TTS expresivo: las cuantizaciones calibradas con imatrix permiten estudiar la degradación de calidad entre Q4_K, Q5_K e IQ3_XXS en un mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks objetivos (MOS, WER, similitud de hablante) en la información disponible. La model card únicamente aporta métricas de velocidad de inferencia medidas sobre las muestras de audio publicadas:

| Modelo / runtime | Hardware | Duracion sintesis | RTFx |
|---|---|---|---|
| small-IQ3_XXS (parche CUDA fast) | RTX 4090 CUDA | 12,68 s | 4,18 |
| Full Hybrid Q4_K (speech.cpp v0.11.2) | Vulkan | 11,66 s | 1,91 |
| Full Hybrid Q5_K (speech.cpp v0.11.2) | Vulkan | 6,08 s | 1,86 |

El parche `drama3-speechcpp-fast.patch` reporta una aceleración agregada de aproximadamente 2,96x en CUDA frente a la versión sin parche.

## Requisitos de hardware

- VRAM estimada (con reserva de ~2,40 GiB del runtime):
  - Q4_K: ~23,21 GiB para colocación completa en GPU.
  - Q5_K: ~26,96 GiB para colocación completa en GPU.
  - small-IQ3_XXS: ~11,48 GiB, apta para GPUs de 16-24 GiB.
  - Variante audio.cpp IQ3_XXS: ~11-12 GiB.
- GPUs recomendadas: RTX 4090 (24 GiB) para Q4_K y para la variante small con parche CUDA; A100/H100 para Q5_K o despliegues concurrentes; GPUs de 16 GiB para la variante IQ3_XXS.
- Cabe en GPU de consumo: sí, la variante IQ3_XXS en GPUs de 16-24 GiB; las variantes completas requieren 24 GiB o más de VRAM libre.
- Backends: Vulkan o CPU para Q4_K y Q5_K (no usar CUDA por desbordamiento de `block_q8_1.ds` en FP16 sobre `ffn_down_exps`); CUDA para la variante IQ3_XXS con el parche rápido.
- Opciones de despliegue: speech.cpp (CLI `speech tts` y servidor `speech serve`), audio.cpp (CLI `audiocpp_cli`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput observado: RTFx entre 1,86 y 4,18 según variante y backend; la variante small con parche CUDA es la más rápida de las medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Drama-3-Japanese (esta publicacion) | 35,77 B totales / ~3 B activos | 8192 tokens de texto | ja | fish-audio-community-license-1.0 | GGUF | Clonacion zero-shot, habla emocional, 44,1 kHz |
| Aratako/Drama-3-Japanese | 35,77 B totales / ~3 B activos | no disponible | ja | fish-audio-community-license-1.0 | safetensors | Modelo base sin cuantizar |
| fishaudio/s2-pro | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo de origen de la familia Drama-3 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento objetivo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo solo soporta japonés; no se ha validado su comportamiento en otros idiomas y la entrada en otra lengua producirá resultados degradados o incorrectos.
- La licencia fish-audio-community-license-1.0 no es de código abierto y establece restricciones de uso comercial; es obligatorio revisar el fichero LICENSE antes de cualquier despliegue en producción.
- Las variantes completas Q4_K y Q5_K no deben ejecutarse en CUDA: el desbordamiento de `block_q8_1.ds` en FP16 provoca aserciones de "not finite numbers" en `ffn_down_exps`; deben usarse Vulkan (con los tres flags `GGML_VK_DISABLE_*`) o CPU.
- La variante IQ3_XXS requiere aplicar un parche a speech.cpp v0.11.2, lo que añade complejidad de mantenimiento y riesgo de incompatibilidad con versiones futuras.
- No se han publicado métricas objetivas de calidad (MOS, similitud de hablante, WER) ni evaluaciones de sesgo; el riesgo de alucinación prosódica o de artefactos en la voz clonada no está cuantificado.
- La clonación de voz plantea riesgos de suplantación y uso indebido; es responsabilidad del desplegador obtener consentimiento y cumplir la normativa aplicable.
- El repositorio tiene 68,5 GB y cero descargas en el momento de la consulta, por lo que no existe validación comunitaria independiente de las cuantizaciones.
- El modelo se distribuye como pesos GGUF para runtimes concretos (speech.cpp, audio.cpp); no hay garantía de compatibilidad con otros motores de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/orz99/Drama-3-Japanese-speech-cpp-gguf
- Modelo base: https://huggingface.co/Aratako/Drama-3-Japanese
- Repositorio speech.cpp: https://github.com/nyosegawa/speech.cpp
- Repositorio audio.cpp: https://github.com/JarodMica/audio.cpp
- Muestras de audio: https://huggingface.co/StudioYebisu-ship-it/Drama-3-Japanese-speech-cpp-gguf/resolve/main/samples/01_small_iq3_xxs_narration_cuda_fast.wav (y resto de ficheros en la carpeta `samples/` del mismo repositorio)
- Licencia: fichero LICENSE del repositorio de Hugging Face
