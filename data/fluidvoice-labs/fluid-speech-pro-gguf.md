# FluidVoice-Labs/fluid-speech-pro-gguf

## Resumen

Fluid Speech Pro (GGUF) es la versión cuantizada en formato GGUF de Fluid Speech Pro, un modelo de reconocimiento automático del habla (ASR) de 627 millones de parámetros desarrollado por FluidVoice-Labs, el equipo detrás de la aplicación FluidVoice. El modelo se construye sobre NVIDIA Parakeet TDT 0.6B v3 y conserva su cobertura de 25 idiomas europeos, con detección automática del idioma sin necesidad de prompt. Resuelve el problema de la transcripción precisa y rápida en un rango de tamaño inferior a 1B de parámetros, donde la oferta de modelos abiertos de calidad es limitada.

La relevancia de esta versión concreta radica en el formato: los pesos GGUF están pensados para `parakeet.cpp`, una implementación en C++ que permite inferencia en CPU o GPU sin dependencia de Python. Esto facilita el despliegue en entornos embebidos, aplicaciones de escritorio y servicios ligeros. La arquitectura es FastConformer con decodificación TDT (Token-and-Duration Transducer), una variante de transducer que predice conjuntamente tokens y duraciones, lo que acelera la decodificación frente a los transducers convencionales.

El modelo declara ser el segundo modelo abierto en el Open ASR Leaderboard con un WER medio de 6,06, y el más preciso entre los modelos abiertos de menos de 1B de parámetros. Esta ficha cubre específicamente la variante GGUF, que omite el bloque adicional del modelo completo y no incluye el modo "clean" (eliminación de muletillas y repeticiones), a diferencia de las versiones NeMo, ONNX y MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.090.582 (0,63B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (8 bits) y F32 (fp32) |
| Idiomas soportados | 25 idiomas europeos: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (para parakeet.cpp) |
| Tamano del repositorio | 3,4 GB |
| Entrada de audio | WAV mono a 16 kHz |
| Modelo base | FluidVoice-Labs/fluid-speech-pro (derivado de nvidia/parakeet-tdt-0.6b-v3) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer, una variante del Conformer con atención por bloques que reduce el coste computacional en secuencias de audio largas, combinada con un decodificador TDT. En un transducer TDT, el decodificador predice simultáneamente el siguiente token y su duración, lo que permite emitir varios tokens por paso de decodificación y acelera la inferencia sin sacrificar precisión. El modelo deriva directamente de NVIDIA Parakeet TDT 0.6B v3, por lo que hereda su esquema de entrenamiento y su cobertura lingüística.

No se dispone de información detallada sobre el número de horas de audio de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino con datos propios de FluidVoice-Labs. La model card indica que esta versión GGUF reordena los pesos al esquema plano de Parakeet TDT 0.6B v3 para que `parakeet.cpp` los ejecute directamente, y que omite el bloque adicional del modelo completo, cuyo impacto se concentra en audio con ruido. La decodificación es greedy en todas las evaluaciones reportadas.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos con detección automática del idioma, sin prompt.
- Salida con puntuación y mayúsculas incluidas de forma nativa.
- Reconocimiento robusto en condiciones de ruido: segundo modelo abierto en el conjunto URGENT 2024 del Open ASR Leaderboard (WER 9,83).
- Inferencia en CPU o GPU mediante `parakeet.cpp`, sin dependencia de Python.
- Entrada de audio en WAV mono a 16 kHz.
- Marcas de tiempo a nivel de palabra y de segmento: disponibles en la versión NeMo, no en esta variante GGUF.
- Modo "clean" (texto editado sin repeticiones ni muletillas): no disponible en esta variante GGUF.

## Casos de uso

- Transcripción de reuniones y llamadas: el modelo procesa audio de conversaciones multi-hablante (evaluado en AMI y Earnings-22) y genera texto con puntuación, adecuado para actas automáticas y resúmenes posteriores.
- Subtitulado y generación de transcripciones para vídeo: la salida con mayúsculas y puntuación reduce el postprocesado necesario antes de publicar subtítulos.
- Aplicaciones de escritorio y utilidades locales sin Python: al ejecutarse con `parakeet.cpp` sobre GGUF, puede integrarse en herramientas nativas en C++ que transcriban audio en local sin enviar datos a la nube.
- Dictado por voz multilingüe: la detección automática de idioma entre 25 lenguas europeas permite usar el mismo modelo en aplicaciones de dictado para usuarios de distintos países sin configuración manual.
- Procesamiento por lotes de archivos de audio a gran escala: el rendimiento declarado de aproximadamente 3.700× tiempo real en una GPU permite transcribir una hora de audio en torno a un segundo, lo que viabiliza pipelines de archivado y búsqueda sobre grandes volúmenes.
- Transcripción en entornos con ruido: su posición entre los mejores modelos abiertos en URGENT 2024 lo hace adecuado para audio de campo, grabaciones telefónicas o entornos industriales, aunque esta variante GGUF puede degradarse algo más que el modelo completo en esas condiciones.
- Servicios de atención al cliente con análisis de llamadas: la transcripción rápida y multilingüe permite extraer texto de conversaciones para análisis de calidad y detección de intenciones en tiempo casi real.

## Benchmarks y rendimiento

Datos reportados en la model card de esta variante GGUF, sobre 400 clips de 8 conjuntos de test públicos (AMI, Earnings-22, GigaSpeech, LibriSpeech clean y other, Monsoon, SPGISpeech, VoxPopuli), con decodificación greedy:

| Ejecucion | Mismo texto que el modelo completo | WER |
|---|---|---|
| Modelo completo (NeMo, referencia) | 400 / 400 | 3,53 |
| parakeet.cpp, F32 | 370 / 400 | 3,44 |
| parakeet.cpp, Q8_0 | 367 / 400 | 3,47 |

Métricas globales declaradas por el autor para el modelo base:

| Metrica | Valor |
|---|---|
| WER medio en Open ASR Leaderboard | 6,06 |
| Posicion en Open ASR Leaderboard (modelos abiertos) | 2 |
| WER en URGENT 2024 (audio con ruido) | 9,83 |
| Posicion en URGENT 2024 (modelos abiertos) | 2 |
| Rendimiento en GPU | ~3.700× tiempo real |

El WER de la tabla de esta variante se calcula sobre los 350 clips de los 7 conjuntos con referencias por clip (las referencias de Earnings-22 son llamadas completas). No se han publicado en la información disponible resultados desglosados por idioma ni por conjunto de test.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para Q8_0 (fichero de 941 MB) y unos 2,5 GB para F32 (fichero de 2,51 GB), más el overhead de ejecución.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de memoria libre; el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo. En Mac, la model card menciona compilación con Metal (`-DPARAKEET_GGML_METAL=ON`) y cita mediciones en un Apple M5 Max.
- CPU: viable como opción principal gracias a `parakeet.cpp`, que no requiere Python; no se especifican cifras de latencia en CPU.
- Despliegue: `parakeet.cpp` con `parakeet-cli` (transcripción por línea de comandos); no se mencionan integraciones con vLLM, TGI, llama.cpp u Ollama, que no aplican a este formato de modelo ASR.
- Throughput: aproximadamente 3.700× tiempo real en una GPU según el autor, es decir, una hora de audio en torno a un segundo.
- Latencia: no disponible de forma desglosada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Fluid Speech Pro GGUF (este) | 0,63B | 25 europeos | GGUF / parakeet.cpp (C++, sin Python) | CC BY 4.0 | Sin modo clean; WER 3,47 en la prueba interna Q8_0 |
| Fluid Speech Pro (NeMo/Transformers) | 0,63B | 25 europeos | NeMo, safetensors | CC BY 4.0 | Modelo de referencia; incluye modo clean y timestamps |
| Fluid Speech Pro ONNX | 0,63B | 25 europeos | ONNX / onnx-asr, sherpa-onnx | CC BY 4.0 | Incluye modo clean; orientado a CPU |
| Fluid Speech Pro MLX | 0,63B | 25 europeos | MLX / parakeet-mlx | CC BY 4.0 | Para Apple Silicon; incluye modo clean |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6B | 25 europeos | NeMo | No disponible en la informacion | Modelo base del que deriva Fluid Speech Pro |

No se dispone en la información proporcionada de comparaciones numéricas con otros modelos ASR abiertos de tamaño similar (por ejemplo, Whisper small/medium) más allá de las posiciones declaradas en el Open ASR Leaderboard.

## Limitaciones y advertencias

- Esta variante GGUF no incluye el modo "clean": el texto puede contener repeticiones y muletillas que el modelo completo elimina.
- Omite el bloque adicional del modelo completo, relevante para audio con ruido; el autor advierte que el audio ruidoso puede transcribirse algo peor que con la versión NeMo.
- No ofrece marcas de tiempo a nivel de palabra ni de segmento en esta variante (solo disponibles en NeMo).
- Solo acepta WAV mono a 16 kHz como entrada; requiere conversión previa de otros formatos y frecuencias.
- Cobertura limitada a 25 idiomas europeos; no soporta otras lenguas.
- Riesgo de alucinación inherente a los modelos ASR: posibles transcripciones plausibles pero incorrectas en audio degradado, con acentos marcados o con solapamiento de hablantes.
- No se documentan sesgos específicos por idioma, acento o demografía en la información disponible.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar a FluidVoice-Labs y respetar los términos de la licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y creado recientemente; la validación por parte de la comunidad es aún escasa.
- El rendimiento de ~3.700× tiempo real corresponde a una GPU no especificada; no debe asumirse en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-gguf
- Modelo base (NeMo + Transformers): https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- Versión ONNX: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-onnx
- Versión MLX: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-mlx
- Versión Core ML: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-coreml
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio parakeet.cpp: https://github.com/mudler/parakeet.cpp
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Sitio de FluidVoice: https://fluidvoice.com
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
