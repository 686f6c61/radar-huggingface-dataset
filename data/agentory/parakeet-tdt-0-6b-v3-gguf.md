# agentory/parakeet-tdt-0.6b-v3-GGUF

## Resumen

Parakeet TDT 0.6B v3 en formato GGUF es la conversión a ggml del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v3`, publicada por el usuario `agentory`. Se trata de un modelo ASR multilingüe de aproximadamente 600 millones de parámetros (627.115.158 según safetensors) basado en una arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer). El modelo original lo desarrolla el equipo NVIDIA NeMo y cubre 25 idiomas europeos con detección automática de idioma.

La relevancia de esta conversión reside en que permite ejecutar el modelo fuera del ecosistema NeMo/PyTorch, mediante el runtime C++ `parakeet-main` del proyecto CrispASR, con cuatro niveles de cuantización que van desde 1,26 GB (F16) hasta 467 MB (Q4_K). El decodificador TDT incorpora de forma nativa marcas de tiempo a nivel de palabra sin necesidad de un modelo de alineamiento forzado adicional, lo que simplifica los pipelines de subtitulado y transcripción con sincronización.

El modelo reporta un WER medio del 6,34 % en el HuggingFace Open ASR Leaderboard, según la model card del autor de la conversión, y se distribuye bajo licencia CC-BY-4.0, más permisiva que la de muchos modelos ASR comerciales. El repositorio tiene un volumen de descargas muy bajo (62) y ninguna valoración, lo que indica que es una conversión reciente y poco adoptada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.115.158 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio en ventanas, sin contexto de texto declarado) |
| Tipos de cuantizacion | F16, Q8_0, Q5_0, Q4_K |
| Idiomas soportados | bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El encoder es un FastConformer de 24 capas con dimensión de modelo 1024, 8 cabezas de atención de dimensión 128, FFN de 4096 y kernel convolucional de 9. El subsampling se realiza mediante una pila Conv2d con depthwise striding que reduce la tasa temporal 8 veces (de 50 a 12,5 fps). El predictor es una LSTM de 2 capas con estado oculto de 640 y embedding de 8193 × 640. La cabeza conjunta proyecta el encoder (1024 → 640) y el predictor (640 → 640), aplica ReLU y una capa lineal final de 640 → 8198. El vocabulario consta de 8192 tokens SentencePiece multilingües. La entrada de audio es mono a 16 kHz, con 128 bins mel, n_fft=512, hop=160 y ventana de 400 muestras.

La conversión a GGUF preserva el filtro mel y la ventana Hann dentro del propio fichero (`preprocessor.fb` y `preprocessor.window` del checkpoint `.nemo` original), de modo que no se recalculan en tiempo de ejecución. El BatchNorm del módulo convolucional se pliega en los pesos de la convolución depthwise en el momento de la carga. La inferencia implementada en CrispASR ejecuta el encoder FastConformer como un único grafo ggml, mientras que el predictor LSTM y la cabeza conjunta se ejecutan como bucles manuales en F32 sobre CPU. La decodificación TDT es voraz y alterna "avanzar frame del encoder" y "emitir token + avanzar predictor" usando el argmax de la cabeza de duración. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original dentro de la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos: búlgaro, checo, danés, alemán, griego, inglés, español, estonio, finés, francés, croata, húngaro, italiano, lituano, letón, maltés, neerlandés, polaco, portugués, rumano, ruso, eslovaco, esloveno, sueco y ucraniano.
- Detección automática de idioma en tiempo de inferencia, sin necesidad de prefijo de prompt ni flag `-l`.
- Marcas de tiempo a nivel de palabra generadas de forma nativa por la cabeza de duración del decodificador TDT. Cada frame equivale a 80 ms. No requiere modelo de alineamiento CTC separado.
- Transcripción de audio mono a 16 kHz con muestreo interno a 12,5 fps tras el subsampling.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio más allá de la transcripción ASR.
- No se documenta un modo "thinking" ni capacidades de traducción automática; el modelo transcribe en el idioma detectado.

## Casos de uso

- Subtitulado automático con sincronización: el decodificador TDT emite timestamps por token con precisión de 80 ms, lo que permite generar ficheros SRT o VTT con marcas por palabra sin ejecutar un segundo modelo de alineamiento forzado, reduciendo coste y latencia del pipeline.
- Transcripción de reuniones multilingües: al detectar automáticamente el idioma entre 25 lenguas europeas, un mismo despliegue puede procesar reuniones con participantes que cambien de idioma sin configuración previa por sesión.
- Indexación y búsqueda de archivos de audio: la transcripción con timestamps a nivel de palabra permite construir índices de texto alineados temporalmente, de modo que una búsqueda textual devuelva el instante exacto del audio donde se pronunció el término.
- Despliegue en entornos con recursos limitados: la cuantización Q4_K ocupa 467 MB y la Q8_0 711 MB, lo que permite ejecutar el modelo en CPU en servidores sin GPU o en dispositivos edge, usando el runtime C++ `parakeet-main` con hilos configurables (`-t`).
- Procesamiento por lotes en pipelines de datos: la conversión GGUF elimina la dependencia de PyTorch y NeMo, lo que facilita integrar la transcripción en contenedores ligeros o en flujos de preprocesado de corpus de audio a gran escala.
- Generación de actas y resúmenes a partir de audio: la salida de texto con marcas temporales sirve como entrada a un modelo de lenguaje posterior para resumir o extraer acciones, manteniendo la trazabilidad hacia el fragmento de audio original.
- Accesibilidad: transcripción en tiempo casi real de contenido audiovisual en cualquiera de los 25 idiomas soportados, con marcas de tiempo que permiten sincronizar subtítulos en reproductores.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| HuggingFace Open ASR Leaderboard (WER medio) | 6,34 % | Dato reportado en la model card del autor de la conversión; corresponde al modelo base `nvidia/parakeet-tdt-0.6b-v3` |
| Precisión de timestamps a nivel de palabra | ~80 ms por frame | Comparado en la model card con ~360 ms MAE del camino DTW por cross-attention usado en Cohere Transcribe |

No se han publicado en la información disponible resultados desglosados por idioma, por conjunto de test (LibriSpeech, Common Voice, FLEURS, etc.) ni comparativas numéricas con otros modelos ASR. Las cuatro cuantizaciones producen el mismo texto en la muestra `samples/jfk.wav` según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica de forma explícita. Por tamaño de fichero, F16 requiere ~1,26 GB de memoria, Q8_0 ~711 MB, Q5_0 ~516 MB y Q4_K ~467 MB. El runtime descrito ejecuta el encoder como grafo ggml y el predictor y la cabeza conjunta como bucles F32 en CPU, por lo que el despliegue de referencia es sobre CPU.
- GPU recomendadas: no disponibles en la información proporcionada. El runtime `parakeet-main` documentado se compila con CMake y se ejecuta con hilos de CPU (`-t 8` en los ejemplos).
- Compatibilidad con GPU de consumo: no confirmada. Al no documentarse backend GPU en el runtime descrito, no se puede afirmar compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: `parakeet-main` del repositorio CrispStrobe/CrispASR (rama `parakeet`), compilado con CMake. No se mencionan vLLM, llama.cpp estándar, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles. La model card no proporciona métricas de velocidad (RTF, tokens/s) para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Parakeet TDT 0.6B v3 GGUF (este) | ~627 M | audio 16 kHz, frames de 80 ms | 25 europeos | CC-BY-4.0 | GGUF (F16, Q8_0, Q5_0, Q4_K) | Timestamps nativos por TDT; runtime C++ |
| nvidia/parakeet-tdt-0.6b-v3 (original) | ~600 M | audio 16 kHz | 25 europeos | CC-BY-4.0 | NeMo (.nemo) | Requiere NeMo/PyTorch; misma arquitectura y WER de referencia |
| cstr/cohere-transcribe-03-2026-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF | Conversión hermana del mismo autor de runtime; timestamps vía DTW cross-attention (~360 ms MAE) |
| istupakov/onnx-asr (referencia) | no disponible | no disponible | no disponible | no disponible | ONNX | Usado como verificación cruzada del bucle TDT; no es un modelo comparable en sí |

No se dispone de datos suficientes en la información proporcionada para comparar parámetros, contexto y rendimiento con alternativas ASR de la misma categoría (por ejemplo Whisper large-v3 o modelos Wav2Vec2). Los datos de la comparativa con Cohere Transcribe se limitan a la precisión de timestamps citada en la model card.

## Limitaciones y advertencias

- El modelo es exclusivamente ASR: no genera texto libre, no razona, no hace tool calling ni soporta instrucciones conversacionales.
- Cobertura lingüística limitada a 25 idiomas europeos; no se documenta soporte de árabe, chino, japonés, coreano, hindi ni otras lenguas no europeas.
- Riesgo de alucinación en ASR: en segmentos con ruido, silencio prolongado o audio musical, los decodificadores transducer pueden emitir texto espurio. La información disponible no cuantifica este comportamiento.
- No se documentan sesgos demográficos, acústicos ni dialectales medidos para esta conversión ni para el modelo base en la información proporcionada.
- La licencia CC-BY-4.0 exige atribución; es compatible con uso comercial siempre que se cumplan las condiciones de atribución a NVIDIA NeMo y a los autores de la conversión.
- El repositorio tiene 62 descargas y 0 valoraciones en el momento de la consulta, lo que indica adopción muy baja y ausencia de validación comunitaria amplia.
- El runtime de referencia (`CrispStrobe/CrispASR`, rama `parakeet`) es una contribución comunitaria; no se documenta su madurez, cobertura de tests ni soporte de backend GPU.
- El comando de descarga del README apunta a `cstr/parakeet-tdt-0.6b-v3-GGUF`, mientras que el repositorio consultado es `agentory/parakeet-tdt-0.6b-v3-GGUF`; conviene verificar el identificador antes de automatizar descargas.
- La model card incluye una nota de procedencia y del artículo 53 del Reglamento europeo de IA, pero el contenido de esa sección aparece truncado en la información disponible.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/agentory/parakeet-tdt-0.6b-v3-GGUF
- Modelo base original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime C++ CrispASR (rama parakeet): https://github.com/CrispStrobe/CrispASR/tree/parakeet
- Repositorio CrispASR: https://github.com/CrispStrobe/CrispASR/
- Repositorio hermano Cohere Transcribe GGUF: https://huggingface.co/cstr/cohere-transcribe-03-2026-GGUF
- Referencia de inferencia ONNX ASR: https://github.com/istupakov/onnx-asr
