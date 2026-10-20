# inclusionAI/Ming-3.0-asr-tiny

## Resumen

Ming-3.0-asr-tiny es un modelo de reconocimiento automático del habla (ASR) desarrollado por inclusionAI (el laboratorio de IA del grupo Ant) que combina el backbone de lenguaje Ling-tiny-v3 con un codificador de audio. Con 8.865.800.992 parámetros (~8,9 mil millones), transcribe voz en una sola vuelta en chino y en inglés, cubre dialectos regionales y admite *Context ASR*: la posibilidad de inyectar en el prompt una lista de *hotwords* o el diálogo previo para mejorar la transcripción de nombres propios, marcas y terminología de dominio.

El modelo se publica bajo licencia MIT con pesos en safetensors (repositorio de 36,8 GB), tokenizador, una implementación propia de Transformers que requiere `trust_remote_code=True` y un ejemplo de inferencia ejecutable. La model card documenta evaluación en 15 conjuntos de prueba de dialectos regionales (cantonés, minnan, shanghainés, entre otros), en habla con ruido y en cinco dominios de aplicación.

Su relevancia actual está en dos frentes: por un lado, el enfoque *context-aware*, que ataca el fallo más habitual del ASR en producción (términos fuera de vocabulario); por otro, el soporte de servido mediante SGLang-Omni, que expone un endpoint compatible con la API de OpenAI (`/v1/audio/transcriptions`) con respuesta en streaming por SSE. El modelo acepta clips de hasta 60 segundos en una sola vuelta según la documentación de la card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje Ling-tiny-v3 + codificador de audio; implementación custom de Transformers (`model_type: ming_v3_asr`) |
| Parametros totales | 8.865.800.992 (~8,9 mil M), dato real de safetensors |
| Parametros activos | no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | Audio: clips de hasta 60 s en una sola vuelta; se seleccionan 3000 frames mel hasta 30 s y 6000 frames por encima de 30 s. Ventana de contexto de texto: no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo oficial usa BF16; no se publican checkpoints GGUF, AWQ ni GPTQ) |
| Idiomas soportados | zh, en; evaluación adicional en 15 conjuntos de dialectos regionales (cantonés, minnan, shanghainés, entre otros) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 36,8 GB), más tokenizador y código custom |
| Pipeline | automatic-speech-recognition |
| Salida | Etiqueta de idioma + tabulador + transcripción |
| Descargas / likes | 142 / 19 (en el momento de la consulta) |
| Fechas | Creado el 2026-10-14; actualizado el 2026-10-20 |

## Arquitectura y entrenamiento

La arquitectura es un modelo de dos torres: un codificador de audio que convierte la señal en representaciones y un backbone de lenguaje Ling-tiny-v3 que genera la transcripción de forma autorregresiva. El modelo se carga con `AutoModelForCausalLM` y `AutoProcessor`, con decodificación greedy (`do_sample=False`), `no_repeat_ngram_size=10`, `attn_implementation="sdpa"` y un máximo de 256 tokens nuevos en el ejemplo oficial. El repositorio declara dependencia de `fla-core` 0.5.2, lo que apunta a componentes de atención lineal (flash-linear-attention) en el backbone; la model card no detalla la composición exacta de capas. El formato de petición se construye con la función `prepare_asr_request` del paquete de ejemplo, que acepta el *prompt* completo, y la salida se decodifica con `decode_transcript`.

No se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO. La model card remite a figuras (`figures/asr.png`, `figures/开源asr.png`, `figures/自建asr.png`) para los resultados de evaluación, sin cifras en texto. La innovación declarada es el *Context ASR*: el mismo formato de entrada sirve para transcripción simple y para transcripción guiada, añadiendo directamente al *prompt* base el tema y los *hotwords* (por ejemplo, nombres de películas, actores o marcas) sin salto de línea, o bien fragmentos del diálogo previo.

## Capacidades

- Transcripción de voz a texto en chino y en inglés a través de una única interfaz de modelo.
- Reconocimiento de dialectos regionales, evaluado en 15 conjuntos de prueba que incluyen cantonés, minnan y shanghainés.
- *Context ASR*: acepta *hotwords*, tema de la conversación o diálogo previo como parte del *prompt* para mejorar términos específicos de dominio.
- *Language hint* opcional (`--language-hint zh` / `--language-hint en`) cuando el idioma es conocido, lo que evita confusión entre lenguas.
- Salida con etiqueta de idioma detectado separada por tabulador de la transcripción.
- Robustez evaluada en habla con ruido de fondo y en cinco dominios de aplicación (según la card, sin cifras publicadas).
- Procesamiento de audio de hasta 60 segundos por clip mediante partición adaptativa de frames mel (3000 / 6000).
- Servido con SGLang-Omni en una sola GPU, con endpoint compatible con OpenAI, parámetros `language` y `prompt`, y streaming vía `stream=true` (server-sent events).
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo de razonamiento explícito (*thinking*).

## Casos de uso

- **Transcripción de reuniones y actas**: con clips de hasta 60 s por vuelta y la posibilidad de encadenar segmentos, el modelo convierte audio de sala en texto; la inyección de *hotwords* con nombres de participantes y proyectos reduce los errores en nombres propios, el fallo más frecuente del ASR genérico.
- **Subtitulado de contenido audiovisual en chino e inglés**: el pipeline puede trocear la pista de audio en ventanas de 30-60 s, transcribir cada una con `--language-hint` fijado y recomponer los subtítulos; el streaming por SSE de SGLang-Omni permite alimentar un editor en tiempo casi real.
- **Atención al cliente telefónica**: transcripción por turnos con el historial de la conversación inyectado como contexto en el *prompt*, de modo que el modelo mantenga coherencia en nombres de productos y referencias de pedido mencionados en turnos anteriores.
- **Dictado clínico o jurídico**: terminología especializada fuera de vocabulario resuelta mediante listas de *hotwords* por especialidad; el modelo se despliega on-premise (licencia MIT) para no enviar audio sensible a terceros.
- **Transcripción de dialectos en mercados regionales**: la cobertura de 15 conjuntos de dialectos (cantonés, minnan, shanghainés) lo hace utilizable en centros de atención al cliente o encuestas de campo en el sur y este de China, donde los modelos entrenados solo con mandarín estándar fallan sistemáticamente.
- **Indexación y búsqueda de archivos de audio**: generación masiva de transcripciones para un motor de búsqueda o un sistema RAG sobre grabaciones; el tamaño de ~8,9 mil M permite ejecutarlo en una GPU de 24 GB en BF16 con un throughput razonable por instancia.
- **Prototipado rápido de producto de voz**: la integración con Transformers (`trust_remote_code=True`) y con SGLang-Omni proporciona un endpoint compatible con OpenAI en una sola GPU, lo que simplifica la sustitución por otro proveedor de ASR sin reescribir el cliente.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye únicamente gráficas de evaluación (rendimiento global de ASR, comparativa chino/inglés y evaluación de dialectos y dominios) sin tablas de cifras, y no se han localizado valores de WER/CER en las fuentes consultadas.

| Benchmark | Resultado |
|---|---|
| MMLU | no aplica (modelo ASR) / no disponible |
| WER chino (conjuntos de la card) | no disponible (solo figura) |
| WER inglés (conjuntos de la card) | no disponible (solo figura) |
| WER dialectos (15 conjuntos) | no disponible (solo figura) |
| WER habla con ruido / 5 dominios | no disponible (solo figura) |

## Requisitos de hardware

- **Pesos en BF16**: ~17,8 GB solo para los parámetros (8.865.800.992 × 2 bytes). Sumando codificador de audio, activaciones y caché KV para 256 tokens nuevos, conviene reservar 20-24 GB de VRAM.
- **Cuantización INT8 / FP8**: ~9-11 GB estimados; no hay checkpoints oficiales publicados, requeriría conversión propia.
- **Cuantización INT4**: ~5-7 GB estimados; igualmente sin artefactos oficiales, por lo que la viabilidad en GPUs de 8-12 GB no está validada por el autor.
- **Cabe en GPU de consumo**: sí en BF16 en RTX 3090, RTX 4090 o RTX 5090 (24-32 GB). En tarjetas de 16 GB (RTX 4080, 4070 Ti Super) sería necesario cuantizar.
- **GPU de datacenter**: A100 40/80 GB y H100 permiten ejecutar la instancia con holgura y alojar varias réplicas o workers concurrentes; SGLang-Omni sirve el checkpoint en una sola GPU.
- **Almacenamiento**: 36,8 GB de repositorio; prever ese espacio para la descarga con `hf download`.
- **Entorno**: Python 3.12 sobre Linux con GPU CUDA; el ejemplo fija Transformers 5.12.1, `fla-core` 0.5.2, PyTorch 2.11.0 y torchaudio 2.11.0, con instrucciones para adaptar la versión de CUDA.
- **Opciones de despliegue**: Transformers con código custom (`trust_remote_code=True`, `attn_implementation="sdpa"`, BF16, decodificación greedy) y SGLang-Omni (`sgl-omni serve --model-path ...`) con endpoint `/v1/audio/transcriptions`. vLLM, TGI, llama.cpp y Ollama: no documentados para este checkpoint.
- **Latencia y throughput**: no disponible; la card no publica métricas de RTF ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Despliegue documentado |
|---|---|---|---|---|---|
| Ming-3.0-asr-tiny | ~8,9 mil M | zh, en + 15 conjuntos de dialectos | Hasta 60 s por clip | MIT | Transformers (custom), SGLang-Omni |
| Whisper large-v3 (OpenAI) | ~1,55 mil M | Multilingüe (amplia cobertura) | Ventanas de 30 s | MIT | Transformers, faster-whisper, WhisperX, servidores propios |
| NVIDIA Parakeet-TDT-0.6B-v2 | ~0,6 mil M | Inglés | Segmentación para audio largo | CC-BY-4.0 | NeMo, Riva |
| Qwen2-Audio-7B-Instruct | ~8 mil M | Multilingüe, ASR + comprensión de audio | no disponible en la información consultada | Apache-2.0 | Transformers |

Ming-3.0-asr-tiny ocupa un nicho poco cubierto: es el único de la lista que combina *Context ASR* explícito (hotwords y diálogo previo) con cobertura de dialectos chinos. Frente a Whisper large-v3 es más de cinco veces mayor en parámetros, lo que encarece el despliegue a cambio de control sobre terminología; frente a Parakeet-TDT-0.6B-v2 pierde en eficiencia pero gana en cobertura de idiomas y dialectos; frente a Qwen2-Audio-7B-Instruct se sitúa en un rango de tamaño similar, aunque este último añade comprensión de audio y aquí no se documenta. No se dispone de comparación de WER entre estos modelos en la información consultada, por lo que la elección debe validarse con un conjunto propio.

## Limitaciones y advertencias

- Solo transcribe **una sola vuelta** de habla: no es un modelo de diarización ni separa interlocutores.
- Idiomas oficialmente declarados: chino e inglés. Los dialectos se evalúan, pero la etiqueta de idioma de salida se limita a `zh`/`en`, y no hay garantía de calidad homogénea entre los 15 conjuntos.
- El límite de 60 s por clip obliga a segmentar el audio y a gestionar las fronteras; errores de corte degradan la transcripción.
- El límite de 256 tokens nuevos en el ejemplo oficial acota la longitud de la transcripción por vuelta; clips densos pueden truncarse si no se ajusta el parámetro.
- Riesgo de alucinación inherente a los modelos generativos: con audio ruidoso, silencios largos o música, el modelo puede producir texto no pronunciado; se recomienda umbral de confianza y detección de silencio en producción.
- El *Context ASR* es sensible al *prompt*: *hotwords* mal formateadas (se indica explícitamente no añadir salto de línea) o contextos irrelevantes pueden degradar la salida. El ejemplo de la card usa `no_repeat_ngram_size=10` para mitigar repeticiones.
- Dependencia de código remoto: requiere `trust_remote_code=True` y versiones concretas de Transformers (5.12.1), PyTorch (2.11.0) y `fla-core` (0.5.2); conviene fijar el entorno para evitar roturas por actualizaciones.
- No hay checkpoints cuantizados oficiales (GGUF/AWQ/GPTQ) ni soporte documentado en vLLM, TGI, llama.cpp u Ollama; el despliegue estándar es Transformers o SGLang-Omni.
- Ausencia de benchmarks numéricos publicados: la evaluación se presenta solo en figuras, lo que impide comparar cuantitativamente con alternativas sin ejecutar pruebas propias.
- Sesgos: la model card no documenta análisis de sesgo por acento, género, edad ni origen; al estar centrado en chino e inglés, el rendimiento en otras lenguas no está caracterizado.
- Licencia MIT: permisiva para uso comercial, pero se recomienda revisar las licencias de las dependencias (`fla-core`, PyTorch) y de los pesos base Ling-tiny-v3 antes de un despliegue comercial.
- El repositorio ocupa 36,8 GB y el modelo exige GPU CUDA; no está pensado para inferencia en CPU.

## Enlaces

- HuggingFace: https://huggingface.co/inclusionAI/Ming-3.0-asr-tiny
- README en chino: https://huggingface.co/inclusionAI/Ming-3.0-asr-tiny/blob/main/README.zh.md
- GitHub (código y cookbook): https://github.com/inclusionAI/Ming-3.0-asr
- SGLang-Omni (servido): https://sgl-project.github.io/sglang-omni/
- Cookbook de SGLang-Omni para Ming-3-ASR: https://sgl-project.github.io/sglang-omni/cookbook/ming3_asr.html
- Vídeo de lanzamiento: https://github.com/NiniAndy/Ming-3.0-asr-tiny-blog/releases/download/media-2026-10-19/ming-3.0-asr-final.mp4
- Página de modelos de inclusionAI: https://www.inclusion-ai.org/model/
- Noticia de lanzamiento (AIGC News): https://aigc.news/events/inclusionai-released-ming-3-0-asr-tiny-on-hugging-face-2026-10-14-aa8cd7c1/
- Ficha de terceros con notas de VRAM: https://selfhost.directory/models/inclusionai/ming-3.0-asr-tiny
- Instrucciones de versiones previas de PyTorch: https://pytorch.org/get-started/previous-versions/
