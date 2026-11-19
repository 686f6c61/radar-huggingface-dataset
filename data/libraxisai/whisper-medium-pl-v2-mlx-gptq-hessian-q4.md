# LibraxisAI/whisper-medium-pl-v2-mlx-GPTQ-Hessian-q4

## Resumen

`whisper-medium-pl-v2-mlx-GPTQ-Hessian-q4` es un checkpoint de reconocimiento automático de voz (ASR) en polaco, cuantizado a 4 bits en formato MLX affine, derivado del modelo `bardsai/whisper-medium-pl-v2`. Lo publica LibraxisAI y está pensado exclusivamente para inferencia local sobre Apple Silicon (M1/M2/M3/M4) mediante el backend Metal. El modelo conserva la arquitectura Whisper medium completa (24 capas de encoder, 24 de decoder, 1024 dimensiones de modelo, 80 bins mel y vocabulario de 51 865 tokens), pero reduce el peso de los pesos de 3,06 GB en FP32 PyTorch a 482,9 MB en safetensors MLX.

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica de cuantización poco habitual en modelos de voz: GPTQ con compensación de error mediante descomposición de Cholesky de la matriz Hessiana empírica, aplicada a las 385 proyecciones cuantizables del modelo. Por otro, ofrece una alternativa compacta para dictado y transcripción en polaco en equipos de memoria unificada limitada, donde un Whisper medium en FP16 no cabría con holgura junto al resto del stack.

El modelo base procede de un fine-tune en polaco sobre Common Voice 11 y FLEURS, con un WER de referencia del 8,71 % y un CER del 2,41 % en el split de test de Common Voice 11.0 (pl). Esta versión cuantizada mantiene la fidelidad del profesor FP16 con un MSE relativo de features de encoder de 0,01085 y una divergencia KL de logits de vocabulario de 0,06696 nats (temperatura 2,0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder), `d_model: 1024`, `n_audio_layer: 24`, `n_text_layer: 24`, `n_mels: 80`, `n_vocab: 51865` |
| Parametros totales | no disponible (el modelo base Whisper medium ronda los 769 M, pero la model card no lo explicita) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, implícita en Whisper; la model card no la declara) |
| Tipos de cuantizacion | MLX affine 4 bits, `group_size: 32`; GPTQ con Hessian y clipping asimétrico de 81 puntos; tensores no cuantizados en F16 (`conv1`, `conv2`, `positional_embedding`, LayerNorm, `alignment_heads` en I64) |
| Idiomas soportados | polaco (`pl`); el fine-tune adapta fonéticamente palabras extranjeras a la ortografía polaca |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors MLX (`weights.safetensors`, 482 915 489 bytes); incluye `tokenizer.json`, `mel_filters.npz` y `config.json` |

## Arquitectura y entrenamiento

El modelo es un Whisper medium estándar: encoder convolucional más transformer de 24 capas, decoder autorregresivo de 24 capas, 1024 dimensiones ocultas y 80 bins mel. El checkpoint original `bardsai/whisper-medium-pl-v2` se obtuvo por fine-tune sobre Common Voice 11 y FLEURS en polaco, partiendo de `openai/whisper-medium`. No se detalla en la información disponible si hubo RLHF, DPO ni la composición exacta del dataset de fine-tune.

La innovación técnica está en el proceso de cuantización. Se calcularon matrices Gram empíricas de entrada por capa, `H = X^T X + λI` con `λ = 0.01 * mean(diag(H))`, sobre las 385 proyecciones cuantizadas, calibradas con voz polaca limpia y aumentada con ruido. El rango de grupo se busca con una rejilla asimétrica de 81 puntos `(α, β)` en `[0,88; 1,00]^2` por cada grupo de 32 pesos, ponderada por la diagonal de la Hessiana. La compensación de error se aplica propagando los residuos de cuantización por bloque (`block_size = 32`) mediante la inversa triangular superior de Cholesky `H^-1 = U U^T`. Los tensores sensibles a la cuantización (convoluciones de entrada, embedding posicional, LayerNorms y cabezas de alineamiento) se mantienen en F16 o I64.

## Capacidades

- Transcripción de voz a texto en polaco con decodificación greedy y `language="pl"`.
- Dictado local de baja latencia sobre memoria unificada de Apple Silicon.
- Transcripción por lotes de audio con VAD (Silero) para filtrar silencios.
- Manejo de habla continua en polaco y de frases mixtas polaco/inglés con adaptación fonética al polaco.
- Reconocimiento de numerales aislados y secuencias repetidas (validado con `5× "pięć"`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No soporta visión, audio de entrada más allá del pipeline ASR estándar, ni modos de "thinking".
- Capacidad multilingüe limitada: el idioma de destino es únicamente polaco.

## Casos de uso

- Dictado de escritorio en macOS: el modelo se carga en memoria unificada con solo 482,9 MB de pesos, lo que permite mantenerlo residente junto al editor y transcribir en tiempo real mediante `mlx_whisper` o `x9stt`.
- Transcripción por lotes de reuniones en polaco: con VAD de Silero activado se pueden procesar horas de audio segmentado sin intervención manual, aprovechando el backend Metal nativo.
- Voice-to-agent en local: pipelines de voz a agente que necesitan ASR de baja latencia y residencia compacta en memoria, integrados con `LibraxisAI/mlx-batch-server`.
- Subtitulado de contenido audiovisual polaco: la ventana de 30 s por segmento de Whisper encaja con la generación de subtítulos por bloques, y el modelo conserva la alineación por cabezas de alineamiento en I64.
- Evaluación y comparación de ASR polaco: sirve como referencia cuantizada frente a checkpoints multilingües de Whisper, con métricas de fidelidad al profesor FP16 ya publicadas (MSE 0,01085, KL 0,06696).
- Investigación sobre cuantización GPTQ en modelos de voz: el repositorio documenta la metodología completa (Hessian, Cholesky, rejilla de clipping) y permite reproducir el proceso sobre otros checkpoints Whisper.
- Prototipado en equipos con RAM limitada: al ocupar menos de 0,5 GB en disco, es viable en Macs de gama de entrada para pruebas de concepto de ASR polaco sin depender de la nube.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos con `x9stt` sobre Metal nativo, decodificación greedy, `language="pl"` y VAD de Silero, sin solapamiento con el audio de calibración:

| Checkpoint | Pesos | Capas decoder | Numerales aislados (logprob medio) | Habla continua en polaco | Frase mixta PL/EN |
|---|---:|---:|---|---|---|
| `whisper-large-v3-turbo-mlx-q8` | 913,7 MB | 4 | `Pięć pięć pięć pięć pięć` (-0,22) | `Zastanawiamy, czy już się udało temu modelu wejść w rolę…` (-0,31) | `…pracuje z computer use.` |
| `whisper-medium-pl-v2-mlx-q8` | 861,8 MB | 24 | `pięć, pięć, pięć, pięć, pięć, pięć.` (-0,13) | `Mamy zasadę, jakiejś, by już się udało temu modelu wejść w rolę i jest …` (-0,19) | `coś robić nie tak, bo przecież nie jest to pierwsza ap…` |
| `whisper-medium-pl-v2-mlx-GPTQ-Hessian-q4` | 482,9 MB | 24 | `pięć, pięć, pięć, pięć, pięć, pięć.` (-0,13) | `Zasada ja nie czy już się…` (truncado en la fuente) | no disponible (truncado en la fuente) |

Métricas de fidelidad al profesor FP16: MSE relativo de features de encoder 0,01085; divergencia KL de logits de vocabulario con temperatura 2,0 de 0,06696 nats. Benchmark del modelo base (upstream): WER 8,71 % y CER 2,41 % en Common Voice 11.0 (pl, test).

## Requisitos de hardware

- VRAM / memoria unificada: los pesos ocupan 482,9 MB; con overhead de activaciones y buffers de audio, la residencia práctica estimada es inferior a 1,5 GB en memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4) con backend Metal; no está pensado para CUDA ni ROCm.
- Cabe en cualquier Mac con chip de la serie M; no requiere GPU dedicada.
- Opciones de despliegue: `mlx_whisper` (PyPI), `LibraxisAI/mlx-batch-server` y `vetcoders/x9bus` (`x9stt`, `codescribe-whisper-validate`). No es compatible con `faster-whisper`/CTranslate2 ni con `whisper.cpp`/GGML por diferencias de layout de tensores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos | Licencia | Runtime | Notas |
|---|---|---|---|---|---|---|
| `whisper-medium-pl-v2-mlx-GPTQ-Hessian-q4` | Whisper medium (24+24 capas) | 30 s por segmento | 482,9 MB | Apache 2.0 | MLX / Metal | 4 bits GPTQ Hessian, solo polaco |
| `whisper-medium-pl-v2-mlx-q8` | Whisper medium (24+24 capas) | 30 s por segmento | 861,8 MB | Apache 2.0 | MLX / Metal | 8 bits, misma familia, mayor fidelidad y peso |
| `whisper-large-v3-turbo-mlx-q8` | Whisper large-v3-turbo (4 capas decoder) | 30 s por segmento | 913,7 MB | Apache 2.0 | MLX / Metal | Multilingüe, decoder reducido, mejor en frases mixtas PL/EN |
| `bardsai/whisper-medium-pl-v2` | Whisper medium | 30 s por segmento | 3,06 GB FP32 | Apache 2.0 | PyTorch | Modelo base sin cuantizar, WER 8,71 % en CV11 pl |

## Limitaciones y advertencias

- Solo transcribe polaco; el fine-tune adapta fonéticamente palabras extranjeras a la ortografía polaca, lo que degrada la transcripción de inglés u otros idiomas.
- No es compatible con `faster-whisper`, CTranslate2, `whisper.cpp` ni GGML: requiere el layout MLX y backend Metal.
- La inferencia alojada en Hugging Face está deshabilitada (`inference: false`); el despliegue debe ser local o autogestionado.
- Riesgo de alucinación inherente a Whisper en audio con ruido, silencios largos o habla solapada; se recomienda VAD (Silero) para mitigarlo.
- No apto para decisiones médicas, legales o de seguridad sin revisión de un experto de dominio.
- La cuantización a 4 bits introduce pérdida de fidelidad respecto al profesor FP16 (MSE 0,01085, KL 0,06696); para máxima fidelidad existe el checkpoint q8 de la misma familia.
- La model card no documenta sesgos específicos del fine-tune en polaco; se desconoce el comportamiento en variantes dialectales o registros muy informales.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar el rendimiento en el dominio concreto antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/LibraxisAI/whisper-medium-pl-v2-mlx-GPTQ-Hessian-q4
- Modelo base: https://huggingface.co/bardsai/whisper-medium-pl-v2
- Checkpoint q8 companion: https://huggingface.co/LibraxisAI/whisper-medium-pl-v2-mlx-q8
- Whisper large-v3-turbo q8: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-q8
- `mlx-whisper` (PyPI): https://pypi.org/project/mlx-whisper/
- `LibraxisAI/mlx-batch-server`: https://github.com/LibraxisAI/mlx-batch-server
- `vetcoders/x9bus`: https://github.com/vetcoders/x9bus
- `openai/whisper-medium` (modelo original): https://huggingface.co/openai/whisper-medium
