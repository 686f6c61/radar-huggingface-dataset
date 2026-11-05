# MatterWaveAI/grt-30m-tts

## Resumen

GRT-30M-TTS es un modelo de síntesis de voz (text-to-speech) desarrollado por MatterWaveAI, construido como un fine-tune del modelo de lenguaje base `MatterWaveAI/grt-30m`. Su particularidad es que se presenta como un modelo "100% rotacional": según el autor, no contiene ninguna capa `nn.Linear` ni `nn.Conv1d`, sino que toda la computación se realiza mediante rotaciones de Givens sobre un transformer causal de 12 capas. El modelo combina un backbone de lenguaje congelado (para preservar la fluidez textual) con una cabeza vocoder polar que transforma representaciones internas en formas de onda mediante STFT e iSTFT a 16 kHz.

Con aproximadamente 29,35 millones de parámetros totales, es un modelo muy pequeño orientado a investigación arquitectónica más que a producción de voz de alta calidad. La cabeza de voz añade solo 47.361 parámetros sobre el backbone, y el entrenamiento se realizó con el optimizador HessianPairAdam / Sophia-Torus. Es relevante ahora como ejemplo de exploración de arquitecturas alternativas al transformer estándar aplicadas a tareas multimodales ligeras.

La licencia Apache 2.0 y su reducido tamaño lo hacen fácilmente reproducible, aunque su madurez, idiomas soportados y calidad de síntesis no están documentados con detalle en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal rotacional (Givens Rotational Transformer) con cabeza vocoder polar; 0 capas `nn.Linear`, 0 capas `nn.Conv1d` |
| Parámetros totales | 29.352.859 (según model card); 29.922.677 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se compone de dos bloques. El backbone lingüístico es un `GRTModel` con `GRTCosineHead` de 12 capas causales y 29.305.498 parámetros, heredado del modelo base `grt-30m` y congelado durante el fine-tune para conservar la fluidez textual. Sobre él se añade una `GRTPolarVocoderHead` de 47.361 parámetros que implementa una expansión mariposa (butterfly) de Givens en 15 etapas, seguida de una activación `GRTRadialGELU` y una contracción mariposa también de 15 etapas. La cabeza produce 128 bins STFT en formato `(Re, Im)` con `frames_per_token=4` y sintetiza la onda mediante `torch.istft` a 16 kHz.

El entrenamiento se realizó con el optimizador HessianPairAdam / Sophia-Torus, y la model card reporta métricas de alineación de la síntesis: similitud coseno polar por frame de -0,0779 a 0,9874, similitud coseno polar por enunciado de -0,0772 a 0,9684, similitud coseno de la envolvente de magnitud de 0,9843 y SNR espectral de -6,99 dB a 12,03 dB. No se detalla el volumen de datos de entrenamiento, la composición del corpus ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto mediante un prompt con formato de chat (`<|im_start|>user ... <|im_end|>`), devolviendo una forma de onda (`speech_waveform`).
- Control de estilo básico mediante indicaciones en el prompt (por ejemplo, "alto, declarative").
- Generación de texto heredada del backbone `grt-30m` (modelo de lenguaje causal).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales como thinking mode, visión o audio de entrada.

## Casos de uso

- Investigación en arquitecturas rotacionales: el modelo sirve como banco de pruebas para estudiar si las rotaciones de Givens pueden sustituir a las capas lineales en tareas de audio, gracias a su tamaño reducido y a la ausencia de `nn.Linear`.
- Reproducción de experimentos académicos: con 29,35 M de parámetros y licencia Apache 2.0, es viable reentrenar y comparar variantes en hardware modesto.
- Prototipado de TTS embebido: su tamaño (repo de 0,1 GB) permite experimentar con síntesis de voz en dispositivos con recursos limitados, siempre que se valide la calidad.
- Generación de voz para demos y pruebas de concepto: la API de `transformers` con `GRTTTSForConditionalGeneration` facilita integrarlo en notebooks y pipelines de evaluación.
- Estudio de vocoders polares: la cabeza STFT/iSTFT a 16 kHz permite analizar la calidad espectral (SNR de 12,03 dB) frente a vocoders neuronales convencionales.
- Base para fine-tunes multimodales: al formar parte de la suite GRT (chat, embedding, reranker, VL, omni), puede integrarse en experimentos que combinen lenguaje y audio dentro de la misma familia arquitectónica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas internas de alineación de la síntesis:

| Métrica | Antes | Después |
|---|---|---|
| Similitud coseno polar por frame | -0,0779 | 0,9874 |
| Similitud coseno polar por enunciado | -0,0772 | 0,9684 |
| Similitud coseno de envolvente de magnitud | no disponible | 0,9843 |
| SNR espectral | -6,99 dB | 12,03 dB |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 29,35 M de parámetros (aproximadamente 120 MB de pesos).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también es viable en CPU.
- Cabe en GPU consumer: sí, holgadamente, e incluso en entornos integrados.
- Opciones de despliegue: `transformers` (según la model card); no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MatterWaveAI/grt-30m-tts | 29,35 M | no disponible | Apache 2.0 | TTS rotacional de investigación |
| MatterWaveAI/grt-30m | no disponible | no disponible | Apache 2.0 | LM causal base de la suite GRT |
| MatterWaveAI/grt-30m-omni | no disponible | no disponible | Apache 2.0 | Multimodal visión-audio-lenguaje-voz |

No se dispone de datos comparativos de rendimiento frente a otros modelos TTS de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Calidad de síntesis limitada: el SNR espectral reportado es de 12,03 dB, lo que sugiere artefactos perceptibles en la voz generada.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no disponible, lo que impide planificar entradas largas con garantías.
- No se documentan sesgos, pero al ser un modelo pequeño y con corpus de entrenamiento no descrito, el riesgo de alucinación y de voces inconsistentes es alto.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluación de calidad y de datos de entrenamiento desaconseja su uso en producción sin validación previa.
- El backbone está congelado, por lo que las capacidades lingüísticas quedan limitadas a las del modelo base `grt-30m`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MatterWaveAI/grt-30m-tts
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Chat fine-tune: https://huggingface.co/MatterWaveAI/grt-30m-chat
- Mixture-of-Rotations: https://huggingface.co/MatterWaveAI/grt-30m-mor
- Embedding: https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Reranker: https://huggingface.co/MatterWaveAI/grt-30m-reranker
- Vision-Language: https://huggingface.co/MatterWaveAI/grt-30m-vl
- Tokenizer: https://huggingface.co/MatterWaveAI/grt-30m-tokenizer
- Omni: https://huggingface.co/MatterWaveAI/grt-30m-omni
- Whitepaper: https://huggingface.co/MatterWaveAI/grt-30m/resolve/main/GRT_Whitepaper.pdf
- Sitio del autor: https://matterwave.ai
