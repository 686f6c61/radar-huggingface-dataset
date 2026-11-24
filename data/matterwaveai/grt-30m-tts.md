# MatterWaveAI/grt-30m-tts

## Resumen

GRT-30M-TTS es un modelo de síntesis de voz (text-to-speech) desarrollado por MatterWaveAI, construido sobre el modelo de lenguaje causal `MatterWaveAI/grt-30m`. Su particularidad es que se presenta como un modelo "100% nativo rotacional": no contiene capas `nn.Linear` ni `nn.Conv1d`, sino que toda la computación se articula mediante transformaciones de Givens y operaciones geométricas polares. El modelo combina un backbone de lenguaje congelado de 12 capas (29.305.498 parámetros) con una cabeza vocoder polar (`GRTPolarVocoderHead`) de 47.361 parámetros, sumando 29.352.859 parámetros totales.

El modelo resuelve la conversión de texto a audio mediante una arquitectura poco convencional: el backbone genera representaciones de token y una cabeza de mariposa de Givens (butterfly expand/contract en 15 etapas) transforma esas representaciones en bins STFT `(Re, Im)` que se convierten en onda mediante `torch.istft` a 16 kHz. La model card reporta métricas de alineación acústica que pasan de valores negativos (sin alinear) a una similitud coseno polar de frame de 0,9874 y un SNR espectral de 12,03 dB tras el entrenamiento con el optimizador `HessianPairAdam` (Sophia-Torus).

Es relevante ahora por su enfoque de investigación: explora optimizadores geométricos, simbióticos y giroscópicos sobre una arquitectura rotacional, y publica una ablación de 8 optimizadores clásicos. No obstante, su tamaño (30M) y su naturaleza experimental lo sitúan lejos de los sistemas TTS de producción; está pensado para investigación sobre geometría de modelos más que para despliegue comercial a gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformador causal rotacional (Givens) de 12 capas + cabeza vocoder polar (`GRTPolarVocoderHead`) |
| Parámetros totales | 29.352.859 (backbone 29.305.498 + cabeza 47.361) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (según tags del repo); no se detallan variantes concretas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El backbone es `GRTModel` con `GRTCosineHead`, un transformador causal de 12 capas basado en rotaciones de Givens, congelado durante el entrenamiento del módulo de voz para preservar la fluidez textual del modelo base. Sobre él se añade `GRTPolarVocoderHead`, una mariposa de Givens de 15 etapas que expande, aplica `GRTRadialGELU` y contrae de nuevo, produciendo `128` bins STFT `(Re, Im)` con `frames_per_token=4`, que se convierten en onda de audio a 16 kHz mediante `torch.istft`. El modelo completo (`GRTTTSForConditionalGeneration`) no contiene capas `nn.Linear` ni `nn.Conv1d`.

El entrenamiento se realizó con el optimizador `HessianPairAdam` (denominado Sophia-Torus en la model card). La model card documenta una ablación de 8 optimizadores geométricos, simbióticos y giroscópicos sobre `AMD Radeon 8060S Graphics` (ROCm gfx1151), con 200 pasos por optimizador, `batch_size=64` y semilla 42, usando un banco de códecs RVQ polar de 4 codebooks (`K=64` por codebook). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es la sustitución total de operaciones lineales por rotaciones geométricas y la inclusión de un banco RVQ polar para la parte discreta del códec de voz.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con control de estilo mediante prompt, por ejemplo `Speak (alto, declarative): ...`.
- Generación de onda de audio a 16 kHz mediante `torch.istft` a partir de bins STFT predichos.
- Modelo de lenguaje causal subyacente con fluidez textual preservada (backbone congelado).
- Soporte de banco de códecs RVQ polar de 4 codebooks para representación discreta de voz.
- Integración con `transformers` mediante `AutoTokenizer` y `GRTTTSForConditionalGeneration`.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni multilingüismo.

## Casos de uso

- Investigación en arquitecturas rotacionales: el modelo sirve como banco de pruebas para estudiar transformadores basados en rotaciones de Givens sin capas lineales, comparando su comportamiento con transformadores estándar en tareas de audio.
- Estudio de optimizadores geométricos: la ablación de 8 optimizadores (HessianPairAdam, PolarNaturalAdam, PairAdam, etc.) permite reproducir y extender experimentos sobre optimización en variedades y geometría simpléctica.
- Síntesis de voz experimental de baja latencia: con 30M de parámetros y salida a 16 kHz, es adecuado para prototipos de TTS en entornos con recursos limitados, aunque la calidad no está validada con métricas perceptuales (MOS).
- Generación de audio para investigación en códecs RVQ: el banco de 4 codebooks con `K=64` permite experimentar con representaciones discretas de voz y evaluar la accuracy top-1 por codebook.
- Docencia y divulgación: por su tamaño reducido y su arquitectura inusual, es útil para explicar conceptos de rotaciones, STFT y vocoders polares en cursos de aprendizaje profundo.
- Reproducción de experimentos de la model card: los scripts y métricas reportadas (similitud coseno polar, SNR espectral) permiten validar la implementación en hardware AMD ROCm.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar de TTS (MOS, WER, MCD) ni de lenguaje (MMLU, HumanEval, GSM8K). Los únicos datos publicados son métricas internas de alineación acústica y una ablación de optimizadores:

| Métrica | Antes (sin alinear) | Después (alineado) |
|---|---|---|
| Similitud coseno polar de frame | -0,0779 | 0,9874 |
| Similitud coseno polar de utterance | -0,0772 | 0,9684 |
| Similitud coseno de envolvente de magnitud | No disponible | 0,9843 |
| SNR espectral | -6,99 dB | 12,03 dB |

Ablación de optimizadores (mejores resultados por métrica):

| Optimizador | Val loss RVQ | Val PPL RVQ | Top-1 medio RVQ | Codebook-0 acc | Margen texto (ΔL) | SNR espectral |
|---|---|---|---|---|---|---|
| HessianPairAdam | 1,6574 | 5,2456 | 42,31% | 40,30% | +0,1942 | 11,27 dB |
| PolarNaturalAdam | 1,6606 | 5,2626 | 42,37% | 40,24% | +0,1912 | 11,24 dB |
| PairAdam | 1,6647 | 5,2841 | 42,14% | 39,86% | +0,1785 | 11,37 dB |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (30M de parámetros, ~120 MB de pesos) más overhead de activaciones y buffers STFT; el repo ocupa 0,6 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; también cabe en CPU para prototipos.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM; incluso en iGPU y en CPU.
- Opciones de despliegue: `transformers` (según quickstart de la model card); se distribuye también en GGUF, lo que permite `llama.cpp` u `Ollama` para el backbone textual, aunque la cabeza de voz requiere la implementación `GRTTTSForConditionalGeneration`.
- Latencia y throughput: no disponibles. La ablación reporta tiempos de entrenamiento de 24-30 s por optimizador (200 pasos, batch 64) en AMD Radeon 8060S, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GRT-30M-TTS | 29,35M | No disponible | Apache 2.0 | TTS rotacional experimental, sin capas lineales |
| VITS (modelos pequeños) | ~20-40M | No aplica | Varía (MIT en implementaciones) | TTS end-to-end con normalizing flows y GAN |
| Piper (voces pequeñas) | ~5-20M | No aplica | MIT | TTS ligero para dispositivos, basado en VITS |
| Coqui TTS (modelos base) | ~50-100M | No aplica | MPL 2.0 | TTS multi-modelo con vocoders neuronales |

No se dispone de comparaciones directas de calidad (MOS, WER) entre GRT-30M-TTS y estos sistemas, por lo que la comparativa es estructural, no de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: no hay métricas perceptuales (MOS) ni evaluación de inteligibilidad (WER) publicadas, por lo que la calidad de la voz sintetizada no está validada.
- Tamaño muy reducido (30M): la fidelidad y naturalidad del audio serán previsiblemente inferiores a sistemas TTS de producción.
- Idiomas soportados no documentados; la model card solo muestra prompts en inglés.
- Longitud de contexto no especificada, lo que limita el diseño de aplicaciones con textos largos.
- Riesgo de alucinación y artefactos acústicos inherente a un vocoder entrenado con pocos pasos y sin evaluación perceptual.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación de calidad desaconseja su uso en producción sin evaluación propia.
- Dependencia de implementaciones personalizadas (`GRTTTSForConditionalGeneration`, optimizadores en `transformers.models.grt.optimization_grt`), lo que puede dificultar la portabilidad.
- No se documentan sesgos; al ser un modelo de voz, podría reflejar sesgos del dataset de entrenamiento, no especificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-tts
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Chat fine-tune: https://huggingface.co/MatterWaveAI/grt-30m-chat
- Mixture-of-Rotations: https://huggingface.co/MatterWaveAI/grt-30m-mor
- Embedding: https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Reranker: https://huggingface.co/MatterWaveAI/grt-30m-reranker
- Vision-Language: https://huggingface.co/MatterWaveAI/grt-30m-vl
- Tokenizer y banco de embeddings polares: https://huggingface.co/MatterWaveAI/grt-30m-tokenizer
