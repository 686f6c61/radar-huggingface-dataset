# LibraxisAI/whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4

## Resumen

`whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4` es un checkpoint de reconocimiento automático del habla (ASR) en formato MLX affine de 4 bits, derivado de `openai/whisper-large-v3-turbo` mediante cuantización GPTQ con compensación de error ponderada por la matriz Hessiana de activaciones. Lo publica LibraxisAI y está pensado para transcripción local de baja latencia y bajo consumo de memoria en Apple Silicon con backend Metal. Su innovación principal es resolver el fallo típico de la cuantización 4 bits naïve (round-to-nearest), que degrada consonantes cortas y terminaciones palatales en lenguas morfológicamente ricas como el polaco.

El modelo mantiene la arquitectura original de Whisper large-v3-turbo: encoder de audio de 32 capas y decoder de texto de 4 capas, con `d_model = 1280`, 128 bins mel y vocabulario de 51.866 tokens. El checkpoint pesa 513,5 MB (489,70 MiB) en `weights.safetensors`, un 68,3 % menos que el FP16 original (1,62 GB) y un 43,8 % menos que la variante Q8 del mismo autor (913,7 MB), lo que permite ejecutarlo en equipos con memoria unificada limitada.

Es relevante ahora porque demuestra que una cuantización de 4 bits bien calibrada (GPTQ + búsqueda de rango asimétrico de 81 puntos) puede igualar la fidelidad de transcripción del profesor FP16 en pruebas concretas de vocabulario polaco y code-switching polaco/inglés, algo que la cuantización RTN no consigue. La licencia MIT facilita su integración comercial y su uso en pipelines locales sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), encoder de 32 capas y decoder de 4 capas, `d_model = 1280`, 128 bins mel |
| Parametros totales | no disponible (el repo indica `n_vocab: 51866`, `n_audio_layer: 32`, `n_text_layer: 4`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper, no confirmada en la información) |
| Tipos de cuantizacion | MLX affine 4 bits (`bits: 4`, `group_size: 32`), GPTQ con compensación Hessiana; existe variante Q8 del mismo autor |
| Idiomas soportados | en, pl, de, fr, es, it, pt, nl, ru, zh, ja, ko, ar, hi, multilingual |
| Licencia | MIT |
| Formato de pesos | MLX affine safetensors (`weights.safetensors`, códigos 4 bits empaquetados en U32 + escalas F16 + biases F16 por grupo), más `config.json`, `tokenizer.json` y `mel_filters.npz` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un encoder Transformer de 32 bloques que procesa espectrogramas mel de 128 bins y un decoder autorregresivo de 4 bloques que genera tokens de texto, con `d_model = 1280` y una proyección de embeddings de vocabulario compartida de 51.866 × 1.280. El proceso de cuantización parte del profesor FP16 `openai/whisper-large-v3-turbo` y aplica GPTQ sobre 233 proyecciones (self-attention, cross-attention, MLP y el embedding de vocabulario atado), dejando sin cuantizar `encoder.conv1`, `encoder.conv2`, `decoder.positional_embedding`, todos los pesos y biases de LayerNorm (F16) y `alignment_heads` (I64).

La calibración usa espectrogramas mel de habla limpia y aumentada con ruido en polaco e inglés (24.000 frames de encoder más trayectorias completas de tokens del decoder en modo teacher-forced), disjuntos de los clips de evaluación. Para cada capa se calculan matrices Gram empíricas `H = X^T X + λI` con amortiguamiento ridge adaptativo `λ = 0.01 · media(diag(H))`, se busca un rango de recorte asimétrico `(α, β) ∈ [0,88, 1,00]^2` en una rejilla de 81 puntos por grupo de 32 pesos minimizando el MSE de reconstrucción a 4 bits, y se propaga el residuo de cuantización por bloques (`B = 32`) mediante la inversa de Cholesky triangular superior `H^{-1} = U U^T` hacia los canales de entrada aún no cuantizados. La fidelidad retenida frente al profesor es MSE relativo de features del encoder de 0,05339 y divergencia KL de logits de vocabulario con temperatura `T = 2,0` de 0,03982 nats.

## Capacidades

- Transcripción de voz a texto (ASR) multilingüe en 14 idiomas declarados más `multilingual`.
- Detección y transcripción de code-switching, validada en clips técnicos polaco/inglés con términos como "session id" y "computer use".
- Preservación de fonética frágil en lenguas morfológicamente ricas: reproduce correctamente numerales polacos aislados (`pięć`) donde la cuantización RTN falla.
- Decodificación greedy con selección de idioma explícita (`language="pl"` en la evaluación reportada).
- Ejecución local en Apple Silicon con backend Metal nativo mediante `x9bus`/`x9stt`, `LibraxisAI/mlx-batch-server` y `mlx-whisper`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio generation ni thinking mode; es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción local en portátiles Apple Silicon: con 513,5 MB de pesos, el modelo cabe holgadamente en la memoria unificada de un M1/M2/M3 y permite dictado y transcripción sin conexión a la nube.
- Subtitulado de vídeo y podcasts multilingües: los 14 idiomas declarados y el soporte `multilingual` permiten generar subtítulos en inglés, polaco, español, alemán, francés, italiano, portugués, neerlandés, ruso, chino, japonés, coreano, árabe e hindi desde una única instancia.
- Reuniones técnicas con code-switching: la validación en clips polaco/inglés con terminología técnica ("session id", "computer use") lo hace adecuado para actas de reuniones de ingeniería donde se mezclan idiomas.
- Procesamiento por lotes en servidor local: `LibraxisAI/mlx-batch-server` permite encolar transcripciones en un Mac con Metal, útil para digitalizar archivos de audio de forma masiva sin GPU dedicada.
- Aplicaciones de accesibilidad: dictado en tiempo real y transcripción de conversaciones para personas con discapacidad auditiva, con latencia baja gracias al decoder de solo 4 capas.
- Preprocesado de datasets de voz: transcripción de corpus en polaco y otras lenguas eslavas donde la cuantización RTN degrada consonantes, usando el checkpoint como anotador automático de bajo coste.
- Integración en pipelines de investigación ASR: al estar en formato MLX affine estándar (`bits: 4`, `group_size: 32`), se puede comparar directamente con el profesor FP16 y con la variante Q8 del mismo autor para estudios de degradación por cuantización.

## Benchmarks y rendimiento

Evaluación reportada por el autor con `x9stt` (backend Metal nativo de `vetcoders/x9bus`), decodificación greedy, `language="pl"` y sin solapamiento con el conjunto de calibración:

| Checkpoint | Tamano pesos | Numerales polacos aislados (5× "pięć") | Habla técnica mixta PL/EN (2 clips) | Logprob medio (5× "pięć") |
|---|---:|---|---|---:|
| `openai/whisper-large-v3-turbo` (FP16) | 1.617,8 MB | `Pięć, pięć, pięć, pięć, pięć.` | Exacto ("session id", "computer use") | -0,21 |
| `LibraxisAI/whisper-large-v3-turbo-mlx-q8` | 913,7 MB | `Pięć, pięć, pięć, pięć, pięć.` | Exacto (1:1 con FP16) | -0,22 |
| RTN MLX Q4 naïve (`mx.quantize`, `bits=4, gs=32`) | 513,5 MB | `pięk, pięk, pięk, pięk` (degradación palatal `ć → k`, 1 token perdido) | Exacto (1:1 con FP16) | -0,47 |
| `LibraxisAI/whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4` | 513,5 MB | `Pięć, pięć, pięć, pięć, pięć.` | Exacto (1:1 con FP16 y Q8) | -0,24 |

Fidelidad frente al profesor FP16: MSE relativo de features del encoder 0,05339; divergencia KL de logits de vocabulario (T = 2,0) 0,03982 nats. No se han publicado resultados de benchmarks estándar (WER en LibriSpeech, Common Voice, FLEURS, MMLU u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 513,5 MB solo para los pesos; el total en ejecución depende del runtime y del buffer de audio, no especificado en la información disponible.
- Hardware objetivo: Apple Silicon (M1 y posteriores) con Metal; la model card menciona explícitamente `M1` como plataforma objetivo.
- GPU NVIDIA: no se documenta soporte; el formato MLX affine y los kernels Metal nativos están orientados a Apple Silicon. No hay datos de ejecución en A100, H100 ni RTX 4090.
- Cabe en cualquier Mac con memoria unificada de 8 GB o superior; el peso de 489,70 MiB deja margen amplio para el resto del sistema.
- Opciones de despliegue validadas: `mlx-whisper` (PyPI), `LibraxisAI/mlx-batch-server` y `vetcoders/x9bus` (`x9stt` y `codescribe-whisper-validate`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| `LibraxisAI/whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4` | no disponible (encoder 32 capas, decoder 4, `d_model` 1280) | no disponible | MLX affine 4 bits, 513,5 MB | MIT | Cuantización GPTQ con compensación Hessiana; preserva `pięć` y code-switching PL/EN |
| `openai/whisper-large-v3-turbo` (FP16) | no disponible (misma arquitectura) | no disponible | Safetensors FP16, 1.617,8 MB | MIT (según el modelo base referenciado) | Profesor de referencia; máxima fidelidad, mayor huella de memoria |
| `LibraxisAI/whisper-large-v3-turbo-mlx-q8` | no disponible (misma arquitectura) | no disponible | MLX affine 8 bits, 913,7 MB | MIT | Calidad 1:1 con FP16 en las pruebas del autor; ocupa un 78 % más que la variante Q4 |
| RTN MLX Q4 naïve (`mx.quantize`) | no disponible (misma arquitectura) | no disponible | MLX affine 4 bits, 513,5 MB | no disponible | Mismo tamaño que el GPTQ pero degrada `pięć` a `pięk` y pierde un token |

No se dispone de comparación con otros modelos ASR de la misma categoría (p. ej. variantes de Whisper medium/small o modelos ASR no-Whisper) en la información proporcionada.

## Limitaciones y advertencias

- Solo ASR: no genera texto libre, no hace razonamiento, no soporta tool calling ni agentes; cualquier uso fuera de transcripción queda fuera de su diseño.
- Evaluación limitada: las pruebas reportadas cubren únicamente polaco e inglés (numerales aislados y dos clips técnicos mixtos); no hay WER publicado en otros idiomas ni en corpus estándar, por lo que el rendimiento multilingüe real es desconocido.
- Riesgo de alucinación en ASR: como todo Whisper, puede inventar texto en silencios, ruido o audio musical; no se documenta mitigación específica en la información disponible.
- Dependencia de plataforma: el formato MLX affine y los kernels Metal nativos limitan su uso a Apple Silicon; no hay evidencia de ejecución en CUDA, ROCm ni CPU genérica.
- Calibración sesgada a polaco e inglés: la compensación Hessiana se ajustó con datos `pl` + `en`, por lo que la fidelidad en otros idiomas puede diferir de la reportada.
- Licencia MIT: permite uso comercial, pero se recomienda revisar los términos del modelo base `openai/whisper-large-v3-turbo` antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de la comunidad sobre las métricas del autor.
- El campo `inference: false` aparece en la model card, aunque el autor documenta rutas de inferencia validadas; conviene verificar la carga con `transformers` antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Variante Q8 del mismo autor: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-q8
- Repositorio `vetcoders/x9bus`: https://github.com/vetcoders/x9bus
- Repositorio `LibraxisAI/mlx-batch-server`: https://github.com/LibraxisAI/mlx-batch-server
- Paquete `mlx-whisper`: https://pypi.org/project/mlx-whisper/
