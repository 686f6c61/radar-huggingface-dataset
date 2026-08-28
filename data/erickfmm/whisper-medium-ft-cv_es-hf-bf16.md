# erickfmm/whisper-medium-ft-cv_es-hf-bf16

## Resumen

El modelo `erickfmm/whisper-medium-ft-cv_es-hf-bf16` es un checkpoint de inferencia en bfloat16 del fine-tuning de [`openai/whisper-medium`](https://huggingface.co/openai/whisper-medium) sobre el dataset **Common Voice 26 en español** (`mozilla-foundation/common_voice_26_0`). Lo desarrolla el autor `erickfmm` como parte del proyecto `training-asr`, siguiendo las técnicas de adaptación con encoder congelado propuestas en Vividh-ASR (arXiv:2605.13087) y Gumbel-BEARD (arXiv:2606.11429). El modelo base es un transformer encoder-decoder seq2seq de 764 M parámetros, con ventana de audio de 30 segundos.

Este checkpoint concreto corresponde al **step 10800** de un run de entrenamiento en curso (step 10850/20000 al momento de la publicación), exportado desde un checkpoint FP32 a bf16 para inferencia en GPUs Ampere+. El autor lo publica explícitamente como **versión de desarrollo (debug)** y advierte que **no debe usarse en producción**: el WER de validación en este punto es 0.2970, muy por encima del mejor WER histórico de 0.1053 obtenido en un step anterior (step 500). Además, el run presenta un problema abierto de divergencia entre la pérdida de validación (que baja de forma monótona) y el WER (que se estanca y sufre picos de alucinación). Su relevancia es principalmente investigadora: permite inspeccionar y reproducir experimentos de fine-tuning de Whisper en español con encoder congelado, y estudiar fenómenos de alucinación en ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Medium), seq2seq |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper, 480.000 muestras a 16 kHz) |
| Tipos de cuantizacion | bf16 (este checkpoint), fp32 (variante `-hf-fp32` disponible) |
| Idiomas soportados | Español (`es`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura estándar de Whisper Medium: un encoder de audio basado en convoluciones y atención, seguido de un decoder autoregresivo con cross-attention. La innovación del fine-tuning es que **el encoder permanece congelado** y solo se entrenan el decoder y la capa de proyección final (`proj_out`), aproximadamente 457 M de parámetros (60 % del total). Esta estrategia, basada en Vividh-ASR y Gumbel-BEARD, busca preservar la geometría acústica del encoder preentrenado y, según los autores, iguala o supera al fine-tuning completo en Common Voice.

El entrenamiento se realizó en **FP32 nativo** sobre una NVIDIA Tesla P40 (Pascal, sm_61, 24 GB), que no soporta bf16 ni tiene Tensor Cores. El dataset fue Common Voice 26 en español, con características extraídas mediante `WhisperFeatureExtractor` (log-mel de 80 bins, ventana de 30 s, hop de 160). La pérdida es cross-entropy media sobre tokens no-padding, con `pad_token_id` enmascarado. La configuración del run incluye batch de 60 segundos, grad-accum de 8, optimizador Muon con LR 2e-3 y AdamW con LR 1e-4, warmup de 1000 steps y un máximo de 20000 steps. El run acumuló 458 rollbacks y vivió casi permanentemente en cooldown de learning rate (`lr_temp_scale=0.5`).

El checkpoint exportado aquí se re-castea de FP32 a bf16 para permitir inferencia eficiente en GPUs modernas (Ampere+, sm≥80), aunque el autor aclara que el cast es solo de almacenamiento/cálculo y no altera la receta de entrenamiento.

## Capacidades

- **Reconocimiento automático de voz (ASR)** en español: transcribe audio de hasta 30 segundos a texto.
- **Transcripción con idioma forzado**: se puede forzar el idioma y la tarea mediante `forced_decoder_ids` (`language="es"`, `task="transcribe"`).
- **Inferencia con pipeline de transformers**: compatible con la API `pipeline("automatic-speech-recognition")`.
- **Soporte bf16**: optimizado para GPUs con sm≥80 (A100, H100, RTX 30xx+), con tamaño de pesos de ~1.5 GB.
- **No soporta** tool calling, agentes, razonamiento multi-step ni otras capacidades más allá de ASR.

## Casos de uso

Dado el estado de desarrollo y las advertencias del autor, los casos de uso realistas se limitan al ámbito de investigación y experimentación:

- **Reproducción de experimentos de fine-tuning**: permite reproducir el run `asr-rolling_step-0000700` y comparar la evolución del WER y la val_loss en distintos steps, útil para estudiar la dinámica de entrenamiento con encoder congelado.
- **Análisis de alucinaciones en ASR**: el checkpoint presenta picos de WER extremos (31 y 33 en steps 1100/2200) y loops de repetición en decodificación greedy, lo que lo convierte en un caso de estudio para investigar por qué la pérdida de validación baja mientras el WER se degrada.
- **Evaluación de estrategias de congelación de encoder**: comparar este modelo con un fine-tuning completo de Whisper Medium en español para validar las afirmaciones de Vividh-ASR y Gumbel-BEARD.
- **Pruebas de robustez de decodificación**: probar diferentes estrategias de decodificación (beam search, penalización de repetición, etc.) para mitigar los loops observados.
- **Benchmark de herramientas de entrenamiento ASR**: el proyecto `training-asr` documenta el uso de la Tesla P40 y la ausencia de bf16, lo que puede servir de referencia para quienes entrenan en hardware legacy.
- **Investigación sobre divergencia loss-WER**: el problema abierto documentado en `Experimentos.md` §8.3 ofrece material para estudiar la relación entre cross-entropy y métricas de calidad de transcripción.

## Benchmarks y rendimiento

El autor proporciona métricas de validación sobre 1000 muestras de Common Voice 26 español, pero no hay benchmarks estándar tipo MMLU o HumanEval (no aplican a un modelo ASR). La tabla siguiente resume la trayectoria del run largo:

| Step | val_loss | WER | Nota |
|---|---|---|---|
| 500 | 1.5826 | **0.1053** | mejor WER histórico (run 7) |
| 800 | 0.2881 | 1.797 | inicio run 9, alucinación |
| 1100 | 0.2647 | 31.11 | alucinación |
| 2200 | 0.240 | 32.78 | alucinación |
| 3200 | 0.2273 | **0.1986** | mínimo WER del run 9 |
| 7400 | 0.2033 | 1.80 | mínimo val_loss |
| 9000 | 0.2161 | 4.59 | degradación tardía |
| **10800** | **0.2188** | **0.2970** | **este checkpoint** |

No se han publicado resultados de benchmarks en la informacion disponible más allá de estos valores de validación. El WER de este checkpoint (0.2970) es significativamente peor que el del mejor checkpoint histórico (0.1053), lo que refuerza su carácter de desarrollo.

## Requisitos de hardware

- **VRAM estimada**: el modelo en bf16 ocupa ~1.5 GB en disco, pero la inferencia requiere memoria adicional para activaciones y el audio de entrada. En la práctica, una GPU con al menos 4-6 GB de VRAM es suficiente para procesar clips de hasta 30 segundos.
- **GPUs recomendadas**: cualquier GPU con soporte bf16 y sm≥80: NVIDIA A100, H100, RTX 30xx, RTX 40xx, etc. No es compatible con GPUs Pascal (como la Tesla P40 usada en entrenamiento) ni con CPUs sin soporte bf16; para esos casos existe la variante fp32.
- **GPU consumer**: sí, cabe en GPUs de consumo como RTX 3060, 3070, 3080, 4090, etc.
- **Opciones de despliegue**: compatible con `transformers` (pipeline y `WhisperForConditionalGeneration`), y por extensión con vLLM, TGI, o llama.cpp si se convierte a GGUF (aunque no se proporciona en el repo). También se puede usar con `transformers` en CPU si se carga en fp32.
- **Latencia y throughput**: no se han publicado mediciones específicas. Como referencia, Whisper Medium en una GPU moderna procesa un clip de 30 s en aproximadamente 1-3 segundos, dependiendo del hardware y la configuración de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (es) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `erickfmm/whisper-medium-ft-cv_es-hf-bf16` (este) | 764 M | 30 s | 0.2970 (validación) | MIT | HuggingFace |
| `openai/whisper-medium` (base) | 764 M | 30 s | no publicado para es | MIT | HuggingFace |
| `erickfmm/whisper-medium-ft-cv_es-best-hf-bf16` (mejor checkpoint) | 764 M | 30 s | 0.1053 (validación) | MIT | HuggingFace (mencionado, no enlazado) |

La comparación directa con el modelo base no está disponible en la información proporcionada, pero el autor indica que el fine-tuning con encoder congelado debería igualar o superar al full fine-tune en Common Voice, según los papers de referencia. El mejor checkpoint histórico (step 500) logra un WER de 0.1053, sustancialmente mejor que el de este checkpoint de desarrollo.

## Limitaciones y advertencias

- **No usar en producción**: el autor lo declara explícitamente como versión de desarrollo (debug) para inspección y reproducción de experimentos.
- **Alucinaciones severas**: el run presenta picos de WER de 31 y 33 (steps 1100 y 2200) y loops de repetición en decodificación greedy, con WER>1 en varios steps.
- **Degradación tardía**: el WER empeora en steps avanzados (0.9–10 entre steps 7600–9000), lo que indica inestabilidad en el entrenamiento.
- **Divergencia val_loss vs. WER**: la cross-entropy de validación baja de forma casi monótona (1.58 → 0.20) mientras el WER se estanca, un problema abierto documentado en el repositorio.
- **Idioma limitado**: solo entrenado para español; no soporta otros idiomas ni traducción de voz.
- **Contexto fijo de 30 segundos**: no puede procesar audio más largo sin segmentación previa.
- **Requisito de bf16**: el checkpoint bf16 solo funciona en GPUs con sm≥80; en hardware más antiguo hay que usar la variante fp32.
- **Sin garantías de rendimiento**: al ser un checkpoint intermedio de un run con rollbacks, no se garantiza estabilidad ni calidad consistente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/erickfmm/whisper-medium-ft-cv_es-hf-bf16)
- [Modelo base openai/whisper-medium](https://huggingface.co/openai/whisper-medium)
- [Repositorio del proyecto training-asr (GitHub)](https://github.com/erickfmm/training-asr)
- [Documento de experimentos (Experimentos.md)](https://github.com/erickfmm/training-asr/blob/main/Experimentos.md)
- [Paper Vividh-ASR (arXiv:2605.13087)](https://arxiv.org/abs/2605.13087)
- [Paper Gumbel-BEARD (arXiv:2606.11429)](https://arxiv.org/abs/2606.11429)
- [Paper original de Whisper (arXiv:2212.04356)](https://arxiv.org/abs/2212.04356)
- [Referencia adicional arXiv:2512.04632](https://arxiv.org/abs/2512.04632)
- [Referencia adicional arXiv:2504.02507](https://arxiv.org/abs/2504.02507)
