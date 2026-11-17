# mrsoundmind/gigaam-v3-e2e-ctc-gguf

## Resumen

GigaAM-v3-e2e-ctc-gguf es una conversión al formato GGUF del modelo ai-sage/GigaAM-v3 en su variante `e2e_ctc`, un sistema de reconocimiento automático del habla (ASR) especializado en ruso. Lo publica el usuario mrsoundmind para su uso con transcribe.cpp, una implementación de inferencia en C++ derivada de llama.cpp orientada a modelos de transcripción de audio. El modelo base lo desarrolla el equipo de ai-sage (SaluteDevices, vinculado a Sber) y pertenece a la tercera generación de la familia GigaAM, presentada con un artículo en arXiv (2506.01192).

Técnicamente es un encoder Conformer de 16 capas con unos 220,9 millones de parámetros y una cabeza CTC implementada como Conv1d 1×1, que decodifica con búsqueda voraz sobre un tokenizador SentencePiece de 256 piezas. La salida incluye mayúsculas, puntuación y normalización de texto directamente, sin necesidad de un modelo de lenguaje externo ni de postprocesado. El contexto es offline: procesa ficheros WAV de 16 kHz mono, sin streaming.

Su relevancia práctica está en que ofrece una alternativa muy ligera (174-843 MB según cuantización) y ejecutable en CPU o GPU modesta para transcripción de ruso, con un WER del 5,5 % en FLEURS ru que se mantiene prácticamente intacto hasta Q4_K_M. Frente a Whisper, el modelo base reporta ventajas notables en dominios difíciles como habla natural, habla con trastornos o conversaciones de call center.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) con cabeza CTC Conv1d 1×1 |
| Parámetros totales | 220.889.985 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio offline; advertencia upstream para ficheros >25 s en modo simple) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |
| Tamaño del repo | 0,3 GB |
| Entrada de audio | WAV 16 kHz mono |
| Tokenizador | SentencePiece, 256 piezas |
| Decodificación | CTC voraz (greedy), sin LM externo |
| Timestamps | a nivel de token |
| Streaming | no |
| Traducción | no |
| Detección de idioma | no |

## Arquitectura y entrenamiento

El modelo es un encoder Conformer de 16 capas entrenado con el objetivo HuBERT-CTC sobre 700.000 horas de audio en ruso (variante `ssl`), y posteriormente afinado con un decodificador CTC para la variante `ctc`. La variante `e2e_ctc` que aquí se distribuye añade puntuación y normalización de texto de extremo a extremo, de modo que la transcripción sale ya "lista para publicar" sin un modelo de lenguaje aparte. La cabeza de salida es una convolución 1×1 que proyecta las representaciones del encoder al vocabulario SentencePiece de 256 piezas.

El entrenamiento de GigaAM-v3 incorpora nuevos conjuntos internos respecto a generaciones anteriores: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas. Según el autor del modelo base, esto mejora un 30 % de media en esos dominios manteniendo la calidad en benchmarks públicos. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens de audio ni si hubo etapas de RLHF o DPO (en ASR no es lo habitual; el ajuste es supervisado con CTC). La conversión a GGUF se hizo desde el commit `cec030b` del modelo base (fijado el 2026-05-12) y se validó contra el paquete de referencia del autor en el commit `42b96d9` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en ruso, offline, con salida en mayúsculas y minúsculas, puntuación y normalización de texto.
- Decodificación CTC voraz sin modelo de lenguaje externo, lo que simplifica el despliegue y reduce dependencias.
- Timestamps a nivel de token.
- Manejo de dominios difíciles: habla natural, habla con música de fondo, habla con características atípicas y conversaciones telefónicas de call center.
- Inferencia en CPU y GPU mediante transcribe.cpp (backend Metal en Apple Silicon y Vulkan en GPUs integradas/discretas).
- No soporta streaming, traducción, detección de idioma ni otras lenguas que no sean ruso.
- No es un modelo de lenguaje: no hace tool calling, agentes, razonamiento multi-paso ni generación de texto libre.

## Casos de uso

- Transcripción de reuniones y entrevistas en ruso: el modelo procesa ficheros WAV de 16 kHz mono de forma offline y devuelve texto punteado y normalizado, adecuado para actas o subtítulos sin postprocesado adicional.
- Subtitulado de vídeo y podcasts: los timestamps a nivel de token permiten alinear el texto con el audio para generar ficheros SRT o VTT; el tamaño reducido (174 MB en Q4_K_M) facilita procesar lotes grandes en una máquina modesta.
- Análisis de conversaciones de call center: el modelo base reporta un WER del 10,3 % (V3_CTC) en el conjunto Callcenter, muy por debajo de T-One + LM (13,5 %) y Whisper (23,9 %), lo que lo hace idóneo para minar transcripciones y extraer métricas de calidad.
- Accesibilidad y dictado en aplicaciones de escritorio: al ejecutarse en CPU (RTF 9 en Ryzen 4750U vía Vulkan y 27 en CPU en M4 Max según los datos del autor), puede integrarse en herramientas locales sin GPU dedicada.
- Procesamiento por lotes en servidores sin GPU: con Q8_0 (260 MB) o Q4_K_M (174 MB) cabe en cualquier instancia pequeña y permite transcribir archivos en background con un consumo de memoria mínimo.
- Investigación en ASR para ruso: al ser MIT y estar disponible en GGUF, sirve como baseline reproducible y como referencia para comparar cuantizaciones (el WER se mantiene en 5,5-5,58 % de F32 a Q4_K_M).
- Preservación y archivado de audio en ruso: transcripción masiva de archivos históricos o grabaciones con ruido de fondo, aprovechando el entrenamiento específico en habla natural y con música.

## Benchmarks y rendimiento

Resultados de WER sobre el split de test completo de FLEURS ru (775 utterances), decodificación voraz y sin LM externo, medidos por el autor de la conversión:

| Cuantización | Tamaño | WER FLEURS ru |
|---|---:|---:|
| F32 | 843 MB | 5,50 % |
| F16 | 428 MB | 5,50 % |
| Q8_0 | 260 MB | 5,50 % |
| Q6_K | 216 MB | 5,56 % |
| Q5_K_M | 195 MB | 5,58 % |
| Q4_K_M | 174 MB | 5,57 % |

Nota del autor: el paquete de referencia upstream mide 6,93 % en el mismo manifiesto; la diferencia de 1,4 puntos porcentuales se debe a que upstream rechaza 5 utterances largas (>25 s) con el error `Too long wav file, use 'transcribe_longform' method.`, contabilizadas como errores de borrado del 100 %. En el subconjunto de 770 utterances que ambos decodifican, transcribe.cpp coincide exactamente con upstream. ai-sage no publica WER de FLEURS ru; esta cifra la mide el autor de la conversión.

Rendimiento (RTF, menor es mejor) reportado en la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 112 |
| Apple M4 Max | CPU | 27 |
| AMD Ryzen 4750U | Vulkan | 30 |
| AMD Ryzen 4750U | CPU | 9 |

Resultados del modelo base GigaAM-v3 (WER %, tabla publicada por ai-sage):

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| **Media** | **9,2** | **8,4** | **19,4** | **25,1** |

Además, en comparaciones end-to-end de `e2e_ctc` y `e2e_rnnt` frente a Whisper-large-v3 con Gemini 2.5 Pro como juez LLM, los modelos GigaAM-v3 ganan con un margen medio de 70:30.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todas las cuantizaciones (843 MB en F32, 174 MB en Q4_K_M); en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En Apple Silicon usa Metal (RTF 112 en M4 Max). En GPUs AMD/Intel integradas o discretas usa Vulkan (RTF 30 en Ryzen 4750U). No se han publicado cifras para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier RTX o equivalente, y también en iGPU mediante Vulkan.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas para LLM, no para este tipo de modelo).
- Latencia y throughput: RTF 112 (Metal, M4 Max), 27 (CPU, M4 Max), 30 (Vulkan, Ryzen 4750U) y 9 (CPU, Ryzen 4750U). Un RTF de 9 implica que procesa audio aproximadamente 9 veces más rápido que tiempo real en ese CPU.
- Requisito de entrada: WAV 16 kHz mono; si el audio no está en ese formato, hay que convertirlo con ffmpeg (`ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / modalidad | WER ruso (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GigaAM-v3-e2e-ctc (esta conversión) | 220,9 M | audio offline, sin streaming | 5,50 % FLEURS ru (medido por el autor); 9,2 % media en dominios del modelo base | MIT | GGUF en HF, transcribe.cpp |
| GigaAM-v3 (modelo base, variantes ctc/rnnt) | 220-240 M | audio offline | 9,2 % (CTC) / 8,4 % (RNNT) de media en dominios; FLEURS ru no publicado | MIT | safetensors en HF, transformers con `trust_remote_code` |
| T-One + LM | no disponible | audio offline | 19,4 % de media en dominios | no disponible | no disponible en la información proporcionada |
| Whisper (large-v3) | no disponible | audio multilingüe | 25,1 % de media en dominios rusos; 12,0 % en Open Datasets | no disponible | ampliamente disponible |

La comparación con Whisper y T-One procede de la tabla publicada por ai-sage para el modelo base; no hay datos de esta conversión GGUF frente a ellos más allá de FLEURS ru.

## Limitaciones y advertencias

- Solo ruso: no transcribe otros idiomas ni traduce; la detección de idioma no está soportada.
- Sin streaming: procesa ficheros completos, no audio en tiempo real.
- Ficheros largos: el paquete upstream rechaza utterances de más de 25 s en el modo simple y exige `transcribe_longform`; en transcribe.cpp conviene trocear el audio antes de transcribir para evitar errores de borrado.
- Riesgo de error en habla con características atípicas: aunque mejora mucho a Whisper (20,6 % frente a 59,3 %), el WER sigue siendo alto en ese dominio, por lo que no debe usarse sin revisión humana en contextos clínicos o legales.
- Alucinación y errores de puntuación: al ser un modelo CTC sin LM externo, puede producir puntuación incorrecta o palabras mal segmentadas en audio ruidoso; no hay mecanismo de corrección posterior incluido.
- Licencia MIT: permite uso comercial, pero conviene revisar los términos del modelo base y del corpus de entrenamiento (no detallados en la información disponible) antes de un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una conversión reciente y poco validada por la comunidad; la validación numérica se limita a la comparación con el paquete upstream en FLEURS ru.
- Dependencia de transcribe.cpp: no es compatible con el ecosistema transformers directamente; requiere compilar la herramienta desde fuente.
- Entrada estricta: solo WAV 16 kHz mono; otros formatos o frecuencias deben convertirse previamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsoundmind/gigaam-v3-e2e-ctc-gguf
- Modelo base ai-sage/GigaAM-v3: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base usado para la conversión: https://huggingface.co/ai-sage/GigaAM-v3/commit/cec030b
- Artículo arXiv de GigaAM-v3: https://arxiv.org/abs/2506.01192
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Repositorio oficial GigaAM (salute-developers): https://github.com/salute-developers/GigaAM
- Métricas detalladas del modelo base: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
