# GhaythMahadin/Fun-ASR-MLT-Nano-2512-gguf

## Resumen

Fun-ASR-MLT-Nano-2512-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) Fun-ASR-MLT-Nano-2512, desarrollado originalmente por Tongyi Lab (Alibaba). La conversión la firma GhaythMahadin y está empaquetada para su uso con transcribe.cpp, una implementación en C++ pensada para inferencia local de modelos de transcripción. El modelo resuelve el problema de la transcripción offline multilingüe en 31 idiomas con un enfoque particular en lenguas de Asia Oriental y Sudoriental, además de árabe, hindi y 19 lenguas europeas.

Arquitectura híbrida: un codificador de voz SenseVoiceEncoderSmall congelado, un adaptador de audio de 2 capas y un LLM Qwen3-0.6B empaquetado como cabecera de decodificación. El conjunto suma unos 829,8 millones de parámetros totales y el repositorio ocupa 1,4 GB. La entrada es audio WAV mono a 16 kHz y la salida es texto plano.

La relevancia actual radica en que ofrece una alternativa local, ligera y multilingüe a los servicios ASR en la nube, con cuantizaciones que bajan hasta 531 MB (Q4_K_M) manteniendo un WER de 1,89 % en LibriSpeech test-clean, lo que permite desplegarlo en hardware de consumo. No soporta streaming, traducción ni marcas de tiempo, y su licencia hereda la FunASR Model Open Source License Agreement v1.1, que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida ASR: SenseVoiceEncoderSmall congelado + adaptador de audio de 2 capas + LLM Qwen3-0.6B como decodificador |
| Parametros totales | 829.791.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 31 idiomas: zh, en, yue, ja, ko, vi, id, th, ms, tl, ar, hi, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, pl, pt, ro, sk, sl, sv |
| Licencia | FunASR Model Open Source License Agreement v1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue el mismo diseño que Fun-ASR-Nano-2512: un codificador de voz SenseVoiceEncoderSmall que permanece congelado durante el entrenamiento, un adaptador de audio de dos capas que proyecta las representaciones acústicas al espacio del LLM y una cabecera Qwen3-0.6B que genera el texto de forma autorregresiva. La variante MLT se entrenó sobre un corpus multilingüe más reducido que la variante Nano: la model card original habla de "cientos de miles de horas" frente a las "decenas de millones" de horas de Nano. No se detallan en la información disponible la composición exacta del dataset, el número de tokens de texto ni si hubo etapas de RLHF o DPO.

La innovación principal es la combinación de un codificador acústico compacto con un LLM pequeño como decodificador, lo que permite un reconocimiento con comprensión contextual y adaptación a dominios verticales (educación, finanzas) sin necesidad de un modelo de gran tamaño. La conversión a GGUF preserva el grafo para transcribe.cpp y mantiene la normalización inversa de texto (ITN) que el modelo original expone mediante el flag `--itn` en la CLI y el parámetro `use_itn` en la API de la librería. No hay decodificación especulativa ni atención lineal documentadas.

## Capacidades

- Transcripción de voz a texto offline en 31 idiomas, con optimización específica para chino, inglés, cantonés, japonés, coreano, vietnamita, indonesio, tailandés, malayo y filipino.
- Cobertura adicional de árabe, hindi y 19 lenguas europeas (búlgaro, croata, checo, danés, neerlandés, estonio, finés, griego, húngaro, irlandés, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno y sueco).
- Normalización inversa de texto (ITN) para convertir números y entidades habladas a su forma escrita, activable mediante `--itn` o `use_itn`.
- Comprensión contextual para terminología profesional en dominios como educación y finanzas.
- Entrada restringida a WAV mono a 16 kHz; no acepta otros formatos directamente (requiere conversión previa con ffmpeg).
- No soporta streaming, traducción automática, detección de idioma ni marcas de tiempo (según los metadatos `streaming: false`, `translate: false`, `lang_detect: false`, `timestamps: none`).
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio WAV de 16 kHz y genera texto plano; al no soportar streaming ni timestamps, encaja en un flujo por lotes donde se graba la reunión y se transcribe a posteriori con la cuantización Q8_0 (850 MB) en CPU o GPU.
- Subtitulado offline de vídeo multilingüe: se extrae la pista de audio con ffmpeg a WAV mono 16 kHz y se ejecuta transcribe-cli por segmentos; la cobertura de 31 idiomas permite un pipeline único para contenido en chino, japonés, tailandés o portugués sin cambiar de modelo.
- Atención al cliente en centros de contacto: transcripción de llamadas grabadas para análisis de calidad y búsqueda de texto; el modelo reconoce terminología financiera y educativa, lo que reduce errores en dominios verticales.
- Archivado y búsqueda de audio histórico: digitalización de grabaciones en archivos y bibliotecas con hardware modesto, usando Q4_K_M (531 MB) para maximizar el rendimiento por vatio en servidores sin GPU.
- Investigación lingüística de campo: transcripción de corpus orales en lenguas minoritarias europeas (irlandés, maltés, letón, esloveno) con un modelo local que no requiere enviar audio a servicios en la nube.
- Asistentes de voz en dispositivos edge: integración en aplicaciones de escritorio o embebidas mediante transcribe.cpp, con cuantización Q5_K_M (602 MB) y RTF de 4,5 en CPU Ryzen 4750U, adecuado para transcripción diferida en portátiles.
- Generación de actas para podcasts y medios: transcripción por lotes de episodios en inglés o chino con WER de 1,74 % en LibriSpeech test-clean (Q8_0), suficiente para publicación tras revisión humana.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WER LibriSpeech test-clean (BF16) | 1,74 % |
| WER LibriSpeech test-clean (F16) | 1,74 % |
| WER LibriSpeech test-clean (Q8_0) | 1,74 % |
| WER LibriSpeech test-clean (Q6_K) | 1,69 % |
| WER LibriSpeech test-clean (Q5_K_M) | 1,77 % |
| WER LibriSpeech test-clean (Q4_K_M) | 1,89 % |
| Baseline FunASR 1.3.1 (referencia) | 1,76 % (IC 95 % [1,60 %, 1,93 %]) |
| RTF en M4 Max (Metal) | 68 |
| RTF en M4 Max (CPU) | 16 |
| RTF en Ryzen 4750U (Vulkan) | 9 |
| RTF en Ryzen 4750U (CPU) | 4,5 |

Las cifras de WER se midieron sobre la partición completa de LibriSpeech test-clean (2620 enunciados) con decodificación greedy del LLM Qwen3-0.6B. El editor no reporta un WER numérico específico para la variante MLT en otros idiomas; LibriSpeech es solo inglés y la fortaleza de MLT es la cobertura multilingüe, no la precisión en inglés. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación estándar de LLM, ya que el modelo no es un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 829,8 M de parámetros, la huella en memoria es reducida. BF16/F16 ocupan 1590 MB, Q8_0 850 MB, Q6_K 659 MB, Q5_K_M 602 MB y Q4_K_M 531 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre para BF16; las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs integradas y en iGPUs con memoria compartida. Se ha validado en Apple M4 Max con backend Metal.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en portátiles con gráfica integrada usando cuantizaciones bajas.
- Opciones de despliegue: transcribe.cpp (librería y CLI `transcribe-cli`), compilado desde fuente con CMake. No se documentan otros runtimes (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: RTF de 68 en Metal sobre M4 Max, 16 en CPU sobre M4 Max, 9 en Vulkan sobre Ryzen 4750U y 4,5 en CPU sobre Ryzen 4750U. Un RTF mayor indica mayor velocidad de transcripción respecto al tiempo real del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fun-ASR-MLT-Nano-2512 (este, GGUF) | 829,8 M | no disponible | 31 | FunASR License v1.1 | GGUF |
| Fun-ASR-Nano-2512 (original) | ~800 M | no disponible | 31 | FunASR License v1.1 | safetensors |
| Whisper large-v3 | 1550 M | 30 s de audio | ~99 | MIT | safetensors, GGUF, etc. |
| Whisper small | 244 M | 30 s de audio | ~99 | MIT | safetensors, GGUF, etc. |

La comparación con Whisper es orientativa: Whisper large-v3 triplica los parámetros y cubre más idiomas con licencia MIT, mientras que Fun-ASR-MLT-Nano-2512 prioriza lenguas asiáticas y ofrece un tamaño menor con licencia más restrictiva. No se dispone de datos de benchmarks comparativos directos entre ambos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo acepta audio WAV mono a 16 kHz; cualquier otro formato requiere conversión previa con ffmpeg.
- No soporta streaming, por lo que no es apto para transcripción en tiempo real de baja latencia.
- No realiza traducción automática ni detección automática de idioma; el idioma debe conocerse de antemano o inferirse por el contexto.
- No genera marcas de tiempo, lo que limita su uso en subtitulado sincronizado sin post-procesado adicional.
- Riesgo de alucinación y confusión de idioma en audio ruidoso o con cambios de lengua, aunque la model card original afirma mitigar estos problemas.
- El WER publicado solo cubre inglés (LibriSpeech); no hay cifras verificadas para los otros 30 idiomas, por lo que conviene evaluar con un manifiesto propio representativo antes de producción.
- La licencia FunASR Model Open Source License Agreement v1.1 no es una licencia permisiva estándar; es imprescindible revisar sus términos para uso comercial.
- La variante MLT se entrenó con menos horas de audio que la variante Nano, lo que puede traducirse en menor robustez en dominios muy específicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la conversión está validada contra un commit concreto de transcribe.cpp; cambios en la librería pueden romper la compatibilidad.

## Enlaces

- [Modelo en Hugging Face (GhaythMahadin/Fun-ASR-MLT-Nano-2512-gguf)](https://huggingface.co/GhaythMahadin/Fun-ASR-MLT-Nano-2512-gguf)
- [Modelo base en Hugging Face (FunAudioLLM/Fun-ASR-MLT-Nano-2512)](https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512)
- [Commit de referencia del modelo base](https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512/commit/cf67a938bf2829959d08fdfb84e186eff02a67ff)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Commit de validación en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/tree/f094d28)
- [Página del modelo en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/fun-asr-mlt-nano-2512.md)
- [Paper arXiv 2509.12508](https://arxiv.org/abs/2509.12508)
