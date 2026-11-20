# LibraxisAI/distil-whisper-large-v3-pl-mlx-GPTQ-Hessian-q4

## Resumen

`distil-whisper-large-v3-pl-mlx-GPTQ-Hessian-q4` es un checkpoint de reconocimiento automático de voz (ASR) en polaco, cuantizado a 4 bits en formato MLX affine, desarrollado por LibraxisAI. Deriva del modelo `Aspik101/distil-whisper-large-v3-pl`, que a su vez es un fine-tune en polaco de `openai/whisper-large-v3` con decodificador destilado. El modelo resuelve el problema de ejecutar transcripción de voz en polaco de forma local sobre Apple Silicon con una huella de memoria muy reducida: 480,6 MB de pesos frente a los 3,03 GB del checkpoint original en FP32 PyTorch.

La arquitectura es la de Whisper, con un codificador de 32 capas, un decodificador destilado de solo 2 capas, 128 bins mel, dimensión de modelo 1280 y vocabulario de 51866 tokens. La innovación principal no está en la arquitectura, sino en el proceso de compresión: cuantización GPTQ con compensación de error mediante descomposición de Cholesky de la Hessiana empírica de activaciones, junto con búsqueda de rango asimétrico óptimo de 81 puntos por grupo de 32 pesos.

Es relevante ahora porque permite dictado y transcripción por lotes en portátiles y equipos de sobremesa con chip M1, M2, M3 o M4 sin depender de la nube, con un bundle autocontenido y validado para `mlx_whisper`, `LibraxisAI/mlx-batch-server` y `vetcoders/x9bus`. El modelo está pensado exclusivamente para inferencia local en Metal y no soporta otros runtimes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder), `d_model: 1280`, `n_audio_layer: 32`, `n_text_layer: 2`, `n_mels: 128`, `n_vocab: 51866` |
| Parámetros totales | no disponible (repo de 0,5 GB; pesos de 480.623.483 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX affine 4 bits (`bits: 4`, `group_size: 32`), GPTQ con Hessian y clipping asimétrico de 81 puntos; existe checkpoint companion q8 (`LibraxisAI/distil-whisper-large-v3-pl-mlx-q8`, 854,6 MB) |
| Idiomas soportados | polaco (`pl`) |
| Licencia | MIT |
| Formato de pesos | safetensors MLX (`weights.safetensors`, 480,6 MB), `tokenizer.json` (2.481.005 bytes), `mel_filters.npz` (4.271 bytes, `mel_80` + `mel_128`), `config.json` (342 bytes) |

## Arquitectura y entrenamiento

El modelo es un Whisper estándar con decodificador destilado: 32 capas de codificador, 2 capas de decodificador (frente a las 32 de `large-v3` y las 4 de `turbo`), 128 bins mel y proyección de vocabulario de 51866 × 1280. No hay innovaciones arquitectónicas propias; la destilación proviene del checkpoint upstream `Aspik101/distil-whisper-large-v3-pl`, derivado de `openai/whisper-large-v3`.

El trabajo técnico de este repositorio es la compresión. Se aplicó GPTQ con estadísticas de segundo orden: matrices Gram empíricas de entrada `H = X^T X + λI` con `λ = 0.01 * mean(diag(H))` en las 213 proyecciones cuantizadas. El rango de cuantización se buscó con una rejilla asimétrica de 81 puntos `(α, β)` en `[0.88, 1.00]^2` por grupo de 32 pesos, ponderada por la diagonal de la Hessiana, y la compensación de error se realizó mediante la inversa de Cholesky triangular superior `H^-1 = U U^T` propagando los residuos de cuantización por bloques de 32. La calibración se hizo con voz polaca limpia y aumentada con ruido, cubriendo los 32 bloques del codificador, los 2 del decodificador y la proyección de vocabulario. Los tensores no cuantizados son `encoder.conv1`, `encoder.conv2`, `decoder.positional_embedding`, pesos y sesgos de LayerNorm (F16) y `alignment_heads` (I64). La fidelidad respecto al profesor FP16 en datos held-out es de MSE relativo de características del codificador de 0,01798 y divergencia KL de logits de vocabulario con temperatura `T = 2.0` de 0,01681 nats. No se documenta el volumen de tokens de entrenamiento del modelo upstream ni si hubo RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en polaco (`automatic-speech-recognition`, `language="pl"`).
- Dictado local de baja latencia sobre Apple Silicon.
- Transcripción por lotes de audio con `LibraxisAI/mlx-batch-server`.
- Integración en pipelines de voz a agente mediante `vetcoders/x9bus` (`x9stt`, `codescribe-whisper-validate`).
- Decodificación greedy con gating de silencio mediante Silero VAD en el path de evaluación probado.
- Manejo de habla mixta polaco/inglés, aunque adaptando fonéticamente los términos extranjeros a la ortografía polaca.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio de entrada más allá de la transcripción ni modo thinking; es un modelo ASR puro.

## Casos de uso

- Dictado de escritorio en polaco: el modelo ocupa 480,6 MB de memoria unificada, por lo que puede residir de forma permanente junto a otras aplicaciones en un Mac con M1 o superior y transcribir en local sin enviar audio a la nube.
- Transcripción por lotes de archivos de audio: mediante `LibraxisAI/mlx-batch-server` se pueden procesar colas de grabaciones con el backend Metal nativo, aprovechando el decodificador de 2 capas para reducir el coste de decodificación.
- Voice-to-agent: integrado en `vetcoders/x9bus` (`x9stt`), sirve como etapa de entrada de voz en asistentes locales que necesitan baja latencia y residencia compacta en memoria unificada.
- Subtitulado y actas de reuniones en polaco: la ventana de contexto de audio de Whisper y el VAD de Silero permiten segmentar conversaciones largas y transcribirlas por tramos con un consumo de memoria mínimo.
- Evaluación de ASR en polaco: útil como referencia cuantizada para comparar contra checkpoints Whisper multilingües, tal como hace el propio autor en su tabla de evaluación.
- Prototipado en investigación sobre cuantización: el repositorio documenta con detalle el pipeline GPTQ/Hessian (Gram matrices, rejilla de clipping, Cholesky), lo que lo convierte en un caso de estudio reproducible para técnicas de compresión de modelos de voz.
- Aplicaciones de accesibilidad en polaco: transcripción en tiempo real de voz a texto en el propio dispositivo, sin coste de API y con privacidad del audio.

## Benchmarks y rendimiento

El autor publica una evaluación cualitativa sobre habla polaca y mixta PL/EN en Apple Silicon Metal, medida con `x9stt` (backend Metal nativo, decodificación greedy, `language="pl"`, VAD de Silero activado, sin solapamiento con el audio de calibración). No se aportan métricas estándar como WER, MMLU o GSM8K.

| Checkpoint | Pesos | Capas decodificador | Numerales aislados (5× "pięć", logprob medio) | Extracto de habla polaca continua | Frase mixta PL/EN |
|---|---:|---:|---|---|---|
| `LibraxisAI/whisper-large-v3-turbo-mlx-q8` | 913,7 MB | 4 | `Pięć pięć pięć pięć pięć` (-0,22) | `Zastanawiamy, czy już się udało temu modelu wejść w rolę…` (-0,31) | `…pracuje z computer use.` |
| `LibraxisAI/distil-whisper-large-v3-pl-mlx-q8` | 854,6 MB | 2 | vacío en la repetición de 5× | `Zastaniemie czy już się udało temu modelu wejść w rolę i jest tutaj z n…` (-0,54) | `…pierwsza apikacja. przy której się pracuje z punktu` |
| `LibraxisAI/distil-whisper-large-v3-pl-mlx-GPTQ-Hessian-q4` | 480,6 MB | 2 | vacío en la repetición de 5× | no disponible (tabla truncada en la información proporcionada) | no disponible (tabla truncada en la información proporcionada) |

Fidelidad frente al profesor FP16 en datos held-out: MSE relativo de características del codificador de 0,01798 y divergencia KL de logits de vocabulario (T = 2.0) de 0,01681 nats.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 480,6 MB solo para pesos; el consumo real de inferencia añade buffers de activación y el audio de entrada, no cuantificados en la información disponible.
- GPU recomendadas: Apple Silicon M1, M2, M3 o M4 con backend Metal; es el único hardware soportado y probado.
- Cabe en cualquier Mac con chip de la serie M; no está pensado para GPU NVIDIA ni para CPU x86.
- Opciones de despliegue: `mlx_whisper`, `LibraxisAI/mlx-batch-server` y `vetcoders/x9bus` (`x9stt`). No es compatible con `faster-whisper`/CTranslate2 ni con `whisper.cpp`/GGML, que usan layouts de tensores distintos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Pesos | Capas decodificador | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| `LibraxisAI/distil-whisper-large-v3-pl-mlx-GPTQ-Hessian-q4` | 480,6 MB | 2 | no disponible | MIT | MLX en Apple Silicon |
| `LibraxisAI/distil-whisper-large-v3-pl-mlx-q8` | 854,6 MB | 2 | no disponible | MIT (según repositorio companion) | MLX en Apple Silicon |
| `LibraxisAI/whisper-large-v3-turbo-mlx-q8` | 913,7 MB | 4 | no disponible | no disponible | MLX en Apple Silicon |
| `Aspik101/distil-whisper-large-v3-pl` (upstream) | 3,03 GB FP32 PyTorch | 2 | no disponible | no disponible | PyTorch |

El modelo q4 ofrece la mayor compresión de la familia (480,6 MB frente a 854,6 MB del q8 y 913,7 MB del turbo q8) a costa de una fidelidad algo menor; el turbo q8 conserva 4 capas de decodificador y muestra mejor comportamiento en la prueba de numerales aislados según la tabla del autor.

## Limitaciones y advertencias

- Solo soporta polaco; en habla inglesa o multilingüe adapta fonéticamente las palabras extranjeras a la ortografía polaca, lo que produce transcripciones incorrectas.
- En la prueba de numerales aislados (5× "pięć") el modelo devuelve una salida vacía, igual que el q8 de la misma familia, lo que sugiere un fallo en repeticiones cortas y aisladas.
- No es compatible con runtimes distintos de MLX; no funciona en `faster-whisper`, CTranslate2 ni `whisper.cpp`.
- La inferencia alojada en Hugging Face está deshabilitada (`inference: false`); el despliegue debe ser local y autogestionado.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada; el autor recomienda VAD para mitigarlo.
- No debe usarse para decisiones críticas de seguridad, médicas o legales sin revisión de un experto del dominio.
- No se han publicado datos sobre sesgos demográficos, acentos o variedades dialectales del polaco.
- La licencia MIT permite uso comercial, pero el modelo upstream y `openai/whisper-large-v3` pueden tener condiciones adicionales que conviene verificar.
- El repositorio tiene 0 descargas y 0 likes, y la tabla de evaluación está truncada en la información disponible, por lo que la validación independiente es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/LibraxisAI/distil-whisper-large-v3-pl-mlx-GPTQ-Hessian-q4
- Modelo base upstream: https://huggingface.co/Aspik101/distil-whisper-large-v3-pl
- Checkpoint companion q8: https://huggingface.co/LibraxisAI/distil-whisper-large-v3-pl-mlx-q8
- Checkpoint turbo q8: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-q8
- Servidor de inferencia por lotes: https://github.com/LibraxisAI/mlx-batch-server
- Runtime x9bus: https://github.com/vetcoders/x9bus
- Paquete mlx-whisper: https://pypi.org/project/mlx-whisper/
- Modelo original Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
