# LibraxisAI/whisper-large-v2-pl-v2-mlx-GPTQ-Hessian-q4

## Resumen

`whisper-large-v2-pl-v2-mlx-GPTQ-Hessian-q4` es un checkpoint de reconocimiento automático de voz (ASR) en polaco, cuantizado a 4 bits en formato MLX affine, derivado de `bardsai/whisper-large-v2-pl-v2`, que a su vez es un fine-tune en polaco de `openai/whisper-large-v2`. Lo desarrolla LibraxisAI y su objetivo es permitir transcripción local de audio polaco en hardware Apple Silicon (M1/M2/M3/M4) con una huella de pesos de 973,2 MB, frente a los 6,17 GB de los pesos PyTorch FP32 originales.

La arquitectura es la de Whisper: encoder de 32 capas y decoder de 32 capas, `d_model` de 1280, 80 bins mel y vocabulario de 51.865 tokens. La cuantización se ha realizado con GPTQ guiado por estadísticas de segundo orden (matrices de Gram de activaciones, compensación de error mediante Cholesky y búsqueda de rangos asimétricos de 81 puntos), aplicada a 513 matrices, incluyendo la proyección de vocabulario de 51.865 × 1.280.

Es relevante ahora porque ofrece una alternativa compacta para dictado y transcripción por lotes en Apple Silicon, con un runtime probado (`mlx_whisper`, `LibraxisAI/mlx-batch-server`, `vetcoders/x9bus`) y sin depender de inferencia alojada en Hugging Face, que está deshabilitada en este repositorio. El modelo está pensado exclusivamente para polaco y para el stack MLX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (`d_model: 1280`, `n_audio_layer: 32`, `n_text_layer: 32`, `n_mels: 80`, `n_vocab: 51865`) |
| Parámetros totales | no disponible (el repo indica arquitectura y tamaño de pesos, no el recuento de parámetros) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; el autor no especifica el límite en la ficha) |
| Tipos de cuantización | MLX affine 4 bits, `group_size: 32`; GPTQ con Hessian; tensores no cuantizados en F16 (`encoder.conv1`, `encoder.conv2`, `decoder.positional_embedding`, LayerNorm) y `alignment_heads` en I64 |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (`weights.safetensors`, 973.221.794 bytes); incluye `tokenizer.json`, `mel_filters.npz` y `config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Whisper con 32 capas de encoder y 32 de decoder, dimensión de modelo 1280, 80 bins mel y vocabulario de 51.865 tokens. El checkpoint base `bardsai/whisper-large-v2-pl-v2` es un fine-tune en polaco de `openai/whisper-large-v2`, entrenado sobre Common Voice 11 y FLEURS en polaco según indica la model card. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

La innovación técnica está en el proceso de cuantización: se calculan matrices de Gram empíricas de las activaciones de entrada por capa (`H = X^T X + λI`, con `λ = 0.01 * mean(diag(H))`) en las 513 proyecciones cuantizadas; se aplica una búsqueda de rangos de recorte asimétricos de 81 puntos ponderada por la diagonal del Hessiano en el rango `[0.88, 1.00]^2` por grupo de 32 pesos; y se compensa el error mediante la inversa de Cholesky triangular superior (`H^-1 = U U^T`) propagando los residuos de cuantización por bloques de 32. La calibración se hizo con voz polaca limpia y aumentada con ruido, sin solapamiento con el audio de evaluación. La fidelidad frente al profesor FP16 reportada es MSE relativo de features del encoder de 0,01475 y divergencia KL de logits de vocabulario (con temperatura `T = 2.0`) de 0,05025 nats.

## Capacidades

- Transcripción de voz a texto en polaco (`automatic-speech-recognition`, `language="pl"`).
- Dictado local y transcripción por lotes de audio en Apple Silicon mediante Metal.
- Decodificación greedy con `mlx_whisper` y con el servidor `LibraxisAI/mlx-batch-server`.
- Integración con el pipeline `vetcoders/x9bus` (`x9stt` y `codescribe-whisper-validate`).
- Control de silencios mediante VAD externo (Silero VAD) en las pruebas realizadas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo ASR puro.
- No soporta visión, audio generativo ni modo thinking.
- Capacidad multilingüe limitada: el fine-tune adapta palabras extranjeras fonéticamente a la ortografía polaca, por lo que no es adecuado para transcripción en inglés sin adaptación.

## Casos de uso

- Dictado local en macOS: el modelo se ejecuta con `mlx_whisper` sobre Metal con 973,2 MB de pesos, lo que permite mantenerlo residente en memoria unificada mientras se dicta en aplicaciones de escritorio.
- Transcripción por lotes de archivos de audio polacos: con `LibraxisAI/mlx-batch-server` se pueden procesar colas de ficheros en un Mac con M1/M2/M3/M4 sin GPU dedicada.
- Voice-to-agent en pipelines de agentes: la baja latencia y el tamaño compacto permiten encadenar ASR y un LLM local en el mismo equipo, usando el texto transcrito como entrada del agente.
- Evaluación y comparación de ASR polaco: sirve como referencia cuantizada para medir WER/CER frente a checkpoints multilingües de Whisper en Common Voice 11.0.
- Subtitulado y documentación de reuniones en polaco: la ventana de contexto de Whisper y el VAD permiten transcribir grabaciones largas segmentadas por silencios.
- Validación de calidad de transcripción en herramientas de desarrollo: el pipeline `codescribe-whisper-validate` de `x9bus` permite comprobar la salida del modelo en flujos de integración.
- Prototipado de asistentes de voz en polaco sin infraestructura cloud: al estar deshabilitada la inferencia alojada en Hugging Face, todo el cómputo ocurre en local.

## Benchmarks y rendimiento

El autor reporta el WER y CER del checkpoint upstream en Mozilla Common Voice 11.0 (split de test en polaco), pero no del checkpoint cuantizado:

| Modelo | WER | CER | Conjunto |
|---|---|---|---|
| `bardsai/whisper-large-v2-pl-v2` (upstream, FP32) | 7,28 % | 2,08 % | Common Voice 11.0 (`pl`, test) |
| `LibraxisAI/whisper-large-v2-pl-v2-mlx-GPTQ-Hessian-q4` | no disponible | no disponible | no disponible |

Evaluación cualitativa en Apple Silicon Metal con `x9stt` (greedy, `language="pl"`, Silero VAD, sin solapamiento con el audio de calibración):

| Checkpoint | Pesos | Capas decoder | Numerales aislados (5× "pięć") | Fragmento de habla continua en polaco | Frase mixta PL/EN |
|---|---:|---:|---|---|---|
| `whisper-large-v3-turbo-mlx-q8` | 913,7 MB | 4 | `Pięć pięć pięć pięć pięć` (avg logprob -0,22) | `Zastanawiamy, czy już się udało temu modelu wejść w rolę…` (-0,31) | `…pracuje z computer use.` |
| `whisper-large-v2-pl-v2-mlx-q8` | 1740,4 MB | 32 | vacío en la repetición 5× | `Zastanawiam się, czy już się udało temu modelu wejść w rolę i jest tuta…` (-0,17) | `… aplicación, przy której się pracuje z punktu widzenia.` |
| `whisper-large-v2-pl-v2-mlx-GPTQ-Hessian-q4` | 973,2 MB | 32 | vacío en la repetición 5× | `Zasadami czy już się udało temu modelu…` (fragmento truncado en la información disponible) | no disponible |

No se han publicado resultados de benchmarks completos (WER/CER) del checkpoint cuantizado en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 973,2 MB; el consumo total depende del runtime y del audio procesado, pero el checkpoint está diseñado para residir en memoria unificada de Apple Silicon.
- Hardware objetivo: Apple Silicon M1, M2, M3 y M4 con backend Metal.
- No está pensado para GPU NVIDIA ni para CUDA; el formato MLX affine no es compatible con `faster-whisper`/CTranslate2 ni con `whisper.cpp`/GGML, que usan layouts de tensores distintos.
- Despliegue probado: `mlx_whisper` (PyPI), `LibraxisAI/mlx-batch-server` y `vetcoders/x9bus` (`x9stt`).
- Inferencia alojada en Hugging Face: deshabilitada (`inference: false`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LibraxisAI/whisper-large-v2-pl-v2-mlx-GPTQ-Hessian-q4` | no disponible (arquitectura Whisper large-v2) | no disponible | 973,2 MB (MLX 4 bits) | Apache 2.0 | MLX en Apple Silicon |
| `LibraxisAI/whisper-large-v2-pl-v2-mlx-q8` | no disponible (arquitectura Whisper large-v2) | no disponible | 1740,4 MB (MLX 8 bits) | Apache 2.0 | MLX en Apple Silicon |
| `LibraxisAI/whisper-large-v3-turbo-mlx-q8` | no disponible (arquitectura Whisper large-v3-turbo, 4 capas de decoder) | no disponible | 913,7 MB (MLX 8 bits) | Apache 2.0 | MLX en Apple Silicon |
| `bardsai/whisper-large-v2-pl-v2` | no disponible (arquitectura Whisper large-v2) | no disponible | 6,17 GB (FP32 PyTorch) | Apache 2.0 | PyTorch/transformers |

## Limitaciones y advertencias

- Solo polaco: el fine-tune adapta palabras extranjeras fonéticamente a la ortografía polaca, por lo que no es fiable para inglés u otros idiomas.
- No apto para decisiones críticas de seguridad, médicas o legales sin revisión de un experto del dominio.
- Riesgo de alucinación en pasajes con ruido o silencios largos; el autor recomienda VAD (Silero) para filtrar silencios.
- En la evaluación cualitativa, la repetición 5× de "pięć" devuelve salida vacía, lo que indica inestabilidad en secuencias repetitivas cortas.
- No es compatible con `faster-whisper`/CTranslate2 ni `whisper.cpp`/GGML por diferencias de layout de tensores.
- La inferencia alojada en Hugging Face está deshabilitada; requiere ejecución local.
- No se han publicado métricas WER/CER del checkpoint cuantizado, solo del upstream FP32, por lo que la degradación exacta por cuantización no está cuantificada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del checkpoint base `bardsai/whisper-large-v2-pl-v2` y de `openai/whisper-large-v2`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibraxisAI/whisper-large-v2-pl-v2-mlx-GPTQ-Hessian-q4
- Checkpoint base: https://huggingface.co/bardsai/whisper-large-v2-pl-v2
- Checkpoint complementario 8 bits: https://huggingface.co/LibraxisAI/whisper-large-v2-pl-v2-mlx-q8
- Checkpoint large-v3-turbo q8: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-q8
- Servidor de inferencia por lotes: https://github.com/LibraxisAI/mlx-batch-server
- Pipeline x9bus: https://github.com/vetcoders/x9bus
- `mlx-whisper` en PyPI: https://pypi.org/project/mlx-whisper/
