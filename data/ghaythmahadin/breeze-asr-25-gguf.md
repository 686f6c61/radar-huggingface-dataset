# GhaythMahadin/Breeze-ASR-25-gguf

## Resumen

Breeze-ASR-25-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla MediaTek-Research/Breeze-ASR-25, un fine-tune de OpenAI Whisper large-v2 desarrollado por MediaTek Research. La conversión la firma el usuario GhaythMahadin y está pensada para su uso con transcribe.cpp, una implementación en C++ del pipeline de inferencia de Whisper. El modelo original está optimizado para mandarín de Taiwán (emitiendo caracteres en chino tradicional) e inglés, con soporte explícito para code-switching mandarín-inglés tanto intra como inter-oracional.

Arquitectónicamente es idéntico a Whisper large-v2: un transformer encoder-decoder con ventanas de 30 segundos y decodificación por trozos para audio de formato largo. Cuenta con 1.543.321.440 parámetros (aproximadamente 1,54 mil millones) y conserva el tokenizador de 99 idiomas de Whisper, aunque solo mandarín e inglés están optimizados y validados. La relevancia de esta conversión GGUF radica en que permite ejecutar un modelo ASR de calidad cercana al estado del arte en hardware de consumo, con cuantizaciones que van desde BF16 (3,10 GB) hasta Q4_K_M (1,00 GB) sin degradación medible del WER/CER.

El modelo base se entrenó sobre aproximadamente 11.749 horas de audio: 10.000 horas de mandarín sintético (ODC Synth), 1.738 horas de inglés (CommonVoice17) y 11 horas de code-switching real (NTUML2021). La licencia Apache-2.0 heredada del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v2), ventanas de 30 s con decodificación por trozos para audio largo |
| Parametros totales | 1.543.321.440 (~1,54 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de 30 segundos de audio; decodificación por trozos para formato largo (no disponible el límite máximo de audio por inferencia) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | zh (mandarín de Taiwán, salida en chino tradicional), en; tokenizador de Whisper con 99 idiomas pero solo zh/en optimizados y validados |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder con la misma topología que Whisper large-v2: procesa audio en ventanas de 30 segundos y emplea decodificación por trozos (chunked long-form decoding) para transcripciones de duración arbitraria. La conversión GGUF preserva la arquitectura y los pesos del modelo original, y ha sido validada numéricamente contra la referencia de transformers en el commit 3848875 de transcribe.cpp (validación del 29 de junio de 2026). El modelo base se portó desde el commit cffe7ccb404d025296a00758d0a33468bec3a9d0, fijado el mismo día.

El entrenamiento del modelo original parte de Whisper large-v2 y se fine-tunea sobre unas 11.749 horas: 10.000 horas de mandarín sintético (ODC Synth), 1.738 horas de inglés de CommonVoice17 y 11 horas de code-switching real del corpus NTUML2021. Esta mezcla busca reforzar el reconocimiento de mandarín taiwanés, el cambio de código mandarín-inglés y la alineación temporal para subtitulado automático. La conversión GGUF no introduce cambios en el entrenamiento; su aportación es la cuantización a formatos de menor precisión (hasta Q4_K_M, 1,00 GB) manteniendo el rendimiento dentro del ruido entre ejecuciones respecto a la referencia BF16.

## Capacidades

- Transcripción de voz a texto en mandarín de Taiwán (salida en chino tradicional) e inglés.
- Reconocimiento de code-switching mandarín-inglés, tanto intra-oracional como inter-oracional.
- Alineación temporal mejorada, adecuada para generación automática de subtítulos (timestamps a nivel de segmento).
- Detección de idioma (`lang_detect: true`).
- Traducción (`translate: true`), heredada del pipeline de Whisper.
- Soporte de audio de formato largo mediante decodificación por trozos.
- No soporta streaming (`streaming: false`).
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo puramente ASR.

## Casos de uso

- Subtitulado automático de vídeo en mandarín taiwanés: el modelo emite chino tradicional y timestamps a nivel de segmento, lo que permite generar ficheros de subtítulos alineados sin post-procesado de conversión de escritura.
- Transcripción de reuniones bilingües mandarín-inglés: el soporte explícito de code-switching intra e inter-oracional evita los errores típicos de modelos monolingües cuando un hablante alterna idiomas dentro de la misma frase.
- Despliegue en portátiles y equipos sin GPU: la cuantización Q4_K_M (1,00 GB) permite ejecutar el modelo en CPU con un factor de tiempo real (RTF) de 0,6 en un Ryzen 4750U, es decir, transcribir más rápido que la duración del audio.
- Procesamiento por lotes en servidores con GPU: con RTF de 1,5 en CPU y 2,1 en Vulkan sobre Ryzen 4750U, y 23,7 en Metal sobre un M4 Max, se pueden dimensionar pipelines de transcripción masiva según el hardware disponible.
- Generación de actas y notas de voz en inglés: el WER del 2,25-2,29 % en LibriSpeech test-clean sitúa la calidad en el rango de los mejores modelos ASR para inglés limpio.
- Integración en aplicaciones de escritorio o embebidas: al ser GGUF y ejecutarse con transcribe.cpp (C++), se puede enlazar en aplicaciones nativas sin dependencias de Python ni de frameworks de deep learning pesados.
- Traducción y detección de idioma en pipelines de audio multilingüe: las banderas `translate` y `lang_detect` permiten usar el modelo como primer eslabón de un pipeline de localización de contenido.

## Benchmarks y rendimiento

Datos publicados en la model card de la conversión (decodificación sobre Modal L40S con la receta por defecto de transcribe.cpp: greedy con temperature fallback, suppress_tokens, timestamps de segmento, batch 1; conjuntos de test completos).

| Cuantizacion | Tamano | WER LibriSpeech test-clean (2620 utterances) | CER FLEURS zh (945 utterances) |
|---|---:|---:|---:|
| BF16 | 3,10 GB | 2,29 % | 8,12 % |
| F16 | 3,11 GB | 2,29 % | 8,11 % |
| Q8_0 | 1,67 GB | 2,27 % | 8,10 % |
| Q6_K | 1,30 GB | 2,29 % | 8,12 % |
| Q5_K_M | 1,16 GB | 2,25 % | 8,12 % |
| Q4_K_M | 1,00 GB | 2,26 % | 8,08 % |

Nota metodológica: el CER de FLEURS se calcula tras normalizar hipótesis y referencia a chino simplificado con OpenCC (`t2s`), ya que Breeze emite chino tradicional y las referencias de FLEURS son simplificadas; sin esa normalización el CER bruto ronda el 35 % y carece de significado.

Rendimiento de inferencia (factor de tiempo real, RTF):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 23,7 |
| Apple M4 Max | CPU | 1,5 |
| Ryzen 4750U | Vulkan | 2,1 |
| Ryzen 4750U | CPU | 0,6 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas overhead; entre 1,0 GB (Q4_K_M) y 3,1 GB (BF16/F16).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria libre; se ha validado en L40S (entorno de benchmarks) y en Apple M4 Max vía Metal.
- Cabe en GPU de consumo: sí, desde GPUs integradas o de gama baja con 2 GB hasta RTX 3060/4060 y superiores; la cuantización Q4_K_M de 1,00 GB es la opción mas ligera.
- Tambien funciona en CPU: RTF de 0,6 en Ryzen 4750U (CPU) y 1,5 en M4 Max (CPU), lo que permite transcripcion mas rapida que tiempo real sin GPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y libreria C++); no se mencionan otros runners en la informacion disponible.
- Latencia y throughput: expresados como RTF en la tabla de benchmarks; a mayor RTF, mayor velocidad relativa al audio de entrada.
- Requisito de formato de audio: WAV mono a 16 kHz (convertible con ffmpeg: `-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Breeze-ASR-25 (esta conversion GGUF) | ~1,54 mil millones | zh (tradicional), en; tokenizador de 99 idiomas | GGUF | Apache-2.0 | Optimizado para mandarín taiwanés y code-switching zh-en; ejecutable en CPU |
| OpenAI Whisper large-v2 (original) | ~1,55 mil millones | 99 idiomas | PyTorch, safetensors, GGUF (conversiones de terceros) | MIT | Base del fine-tune; sin optimización específica para mandarín taiwanés ni code-switching |
| MediaTek-Research/Breeze-ASR-25 (original) | ~1,54 mil millones | zh (tradicional), en | safetensors (transformers) | Apache-2.0 | Modelo de referencia sin cuantizar; requiere stack Python |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la informacion proporcionada; los unicos numeros publicados son los de la tabla de benchmarks de esta misma conversion.

## Limitaciones y advertencias

- Solo mandarín e inglés están optimizados y validados; el resto de idiomas del tokenizador de Whisper son técnicamente accesibles pero quedan fuera del alcance previsto y su calidad no está garantizada.
- La salida en chino es en escritura tradicional; los pipelines que esperen chino simplificado requieren normalización posterior (por ejemplo, OpenCC `t2s`), y comparar sin normalizar produce métricas sin sentido (CER bruto ~35 % en FLEURS).
- No soporta streaming (`streaming: false`); la transcripción es por lotes sobre ficheros de audio.
- No dispone de tool calling, function calling ni razonamiento multi-paso; es exclusivamente un modelo ASR.
- Riesgo de alucinación inherente a los modelos Whisper: en audio con ruido, silencios largos o habla no soportada puede generar texto inventado; conviene usar suppress_tokens y temperature fallback (la receta por defecto de transcribe.cpp ya los aplica).
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los términos del modelo original para obligaciones de atribución.
- La conversión GGUF es de un tercero (GhaythMahadin) y no está publicada por MediaTek Research; la validación numérica se hizo contra transformers en un commit concreto de transcribe.cpp, por lo que cambios futuros en el runner pueden afectar a la reproducibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/GhaythMahadin/Breeze-ASR-25-gguf
- Modelo base en Hugging Face: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Commit del modelo base usado: https://huggingface.co/MediaTek-Research/Breeze-ASR-25/commit/cffe7ccb404d025296a00758d0a33468bec3a9d0
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3848875
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v2.md
- Paper de Breeze ASR 25: https://arxiv.org/pdf/2506.11130
- Repositorio GitHub de Breeze-ASR-25: https://github.com/mtkresearch/Breeze-ASR-25
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
