# kumargulshan/wav2vec2-base-noise-robust-asr

## Resumen

`kumargulshan/wav2vec2-base-noise-robust-asr` es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por el autor kumargulshan en el marco de un proyecto del DS & AI Lab (noviembre de 2026). Se trata de un ajuste fino de `facebook/wav2vec2-base` (95 M de parámetros) con una cabeza CTC a nivel de carácter, entrenado específicamente para mejorar la robustez frente al ruido mediante aumentación de datos agresiva. El modelo se presenta como el mejor modelo individual de un estudio sobre ASR robusto al ruido con marcado de errores a nivel de palabra.

La arquitectura es la de wav2vec2: un codificador convolucional de características seguido de un transformer con atención, sobre el que se aplica una cabeza de clasificación CTC. Acepta audio mono a 16 kHz y emite directamente secuencias de caracteres en mayúsculas (sin puntuación ni capitalización contextual), usando el mismo vocabulario de 32 símbolos que `wav2vec2-base-960h`.

Su relevancia radica en el entrenamiento en dos etapas con aumentación de ruido (ruido blanco, rosa y MUSAN, reverberación simulada, perturbación de velocidad y limitación de banda telefónica) y en la evaluación sistemática bajo 17 condiciones de ruido, incluyendo tipos nunca vistos en entrenamiento (ruido marrón y sonidos ESC-50). Con 95 M de parámetros y 0,4 GB de pesos, es un candidato ligero para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (CNN feature encoder + transformer + cabeza CTC a nivel de carácter) |
| Parametros totales | 94.396.320 (~95 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada definida por la longitud del audio, sin límite documentado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-base`, un transformer con codificador convolucional de características congelado durante el ajuste fino y LayerDrop 0.1. La cabeza es CTC a nivel de carácter con el vocabulario de 32 símbolos de `wav2vec2-base-960h` (A–Z, apóstrofo y delimitador de palabra `|`). El entrenamiento se realizó en dos etapas: la primera (modelo B460) sobre LibriSpeech train-clean-100 + 360 (464 h) durante 80k pasos con lr 1e-4; la segunda, este modelo, continúa desde la etapa 1 sobre las 960 h completas de LibriSpeech durante 40k pasos (≈ 6,8 épocas), con lr pico 5e-5, warm-up del 5 %, decaimiento lineal y semilla 42.

La aumentación es el elemento diferenciador: el 80 % de los enunciados se mezclan con ruido a SNR 0–20 dB (blanco, rosa, MUSAN noise y MUSAN music), el 20 % se mantiene limpio; se aplica reverberación de sala simulada (p 0,3), perturbación de velocidad 0,9/1,1 (p 0,3) y limitación de banda telefónica (p 0,1). La regularización incluye masking estilo SpecAugment (tiempo p 0,4/span 10, frecuencia p 0,1/span 64). Optimizador AdamW (β 0,9/0,98, weight decay 0,005), gradient clipping 1,0, bf16 y lotes agrupados por duración de hasta 640 s de audio. El checkpoint se seleccionó por el menor WER medio de dev (dev-clean + dev-other, limpio y ruidoso): paso 38000, WER de dev 9,87 %. Entrenado en 1 × NVIDIA L40S.

## Capacidades

- Reconocimiento de voz en inglés (ASR) con salida CTC a nivel de carácter en mayúsculas, sin puntuación ni capitalización.
- Robustez frente a ruido: entrenado explícitamente con ruido blanco, rosa y MUSAN (noise y music) a SNR 0–20 dB, reverberación y limitación de banda telefónica.
- Generalización a tipos de ruido no vistos en entrenamiento (ruido marrón y sonidos ambientales ESC-50), con degradación controlada.
- Decodificación con modelo de lenguaje externo: compatible con KenLM de 4-gramas de LibriSpeech vía `pyctcdecode` (alpha 0,8, beta 2,0, beam 50).
- Entrada de audio mono a 16 kHz (requiere remuestreo previo si la fuente difiere).
- No soporta tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento; es un modelo puramente acústico-lingüístico de transcripción.

## Casos de uso

- Transcripción de audiolibros y contenido narrado: el modelo está entrenado sobre LibriSpeech (voz de audiolibro) y ofrece WER de 4,63 % en test-clean y 9,95 % en test-other sin LM, adecuado para digitalización de archivos narrados con calidad de estudio.
- Preprocesado de ASR en entornos ruidosos: gracias a la aumentación con ruido blanco, rosa y MUSAN, es apropiado para transcribir grabaciones con ruido de fondo moderado (SNR ≥ 5 dB) en llamadas, entrevistas o notas de voz.
- Integración en pipelines de subtitulado con LM: combinado con un KenLM de 4-gramas vía `pyctcdecode`, reduce el WER a 2,97 % en test-clean, útil para generación de subtítulos en bruto que luego se posprocesan.
- Despliegue en dispositivos con recursos limitados: con 95 M de parámetros y 0,4 GB de pesos en safetensors, puede ejecutarse en CPU o GPU de gama baja, lo que permite transcripción local sin depender de servicios en la nube.
- Investigación en robustez al ruido: sirve como línea base reproducible (semilla 42, hardware documentado, aumentación detallada) para estudios comparativos de ASR bajo condiciones acústicas adversas.
- Detección de errores de transcripción a nivel de palabra: el proyecto original incluye marcado de errores a nivel de palabra; el modelo puede usarse como primer paso de un sistema que señale segmentos de baja confianza para revisión humana.
- Evaluación comparativa con modelos de la misma familia: al compartir vocabulario y arquitectura con `wav2vec2-base-960h`, permite comparaciones controladas de robustez al ruido sin cambiar el pipeline de decodificación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`). WER en porcentaje sobre LibriSpeech test-clean y test-other.

| Condicion | WER greedy (%) | WER + LM 4-gramas (%) |
|---|---|---|
| test-clean | 4,63 | 2,97 |
| test-other | 9,95 | 7,01 |
| Todas las condiciones ruidosas (agregado) | no disponible | 9,16 |
| Ruido blanco, 0–5 dB | 23,39 | 18,47 |
| Ruido rosa, 0–5 dB | 18,18 | 13,92 |
| Ruido marrón, 0–5 dB (tipo no visto) | 7,49 | 5,11 |
| Sonidos ESC-50, 0–5 dB (tipo no visto) | 15,39 | 11,75 |

La evaluación cubrió 5.559 enunciados bajo 17 condiciones (limpio, ruido blanco/rosa/marrón y sonidos ambientales ESC-50 a 0, 5, 10, 15 y 20 dB SNR), totalizando 94.503 condiciones-enunciado y 182,7 h de audio. El ruido se mezcló con semillas fijas por enunciado para que todos los modelos vieran el mismo audio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~95 M de parámetros; en fp32 ocupa ~0,38 GB de pesos y en bf16/fp16 ~0,19 GB. Con activaciones y buffers, la inferencia cabe holgadamente en menos de 2 GB de VRAM para audios de duración moderada.
- GPU recomendadas: cualquier GPU con ≥ 4 GB de VRAM es suficiente; el autor entrenó en 1 × NVIDIA L40S, pero para inferencia bastan RTX 3060, RTX 4060, RTX 4090, A100 o H100 (estas últimas sobredimensionadas para este tamaño).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para audios cortos.
- Opciones de despliegue: `transformers` (Wav2Vec2Processor + Wav2Vec2ForCTC), `pyctcdecode` con KenLM para decodificación con LM, y exportación a ONNX o TorchScript para producción. No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a CTC de ASR).
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño reducido sugiere inferencia en tiempo real en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER test-clean | WER test-other | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kumargulshan/wav2vec2-base-noise-robust-asr | ~95 M | audio 16 kHz | 4,63 (greedy) / 2,97 (+LM) | 9,95 (greedy) / 7,01 (+LM) | apache-2.0 | Hugging Face |
| facebook/wav2vec2-base-960h | ~95 M | audio 16 kHz | no disponible en la información | no disponible en la información | apache-2.0 | Hugging Face |
| kumargulshan/wav2vec2-base-ls460-noise-aug (B460) | ~95 M | audio 16 kHz | no disponible en la información | no disponible en la información | apache-2.0 | Hugging Face |
| kumargulshan/wav2vec2-base-ls100-clean (A_clean) | ~95 M | audio 16 kHz | no disponible en la información | no disponible en la información | apache-2.0 | Hugging Face |

No se dispone de resultados de benchmarks de los modelos comparables en la información proporcionada; solo se documentan los de este modelo. El modelo base `facebook/wav2vec2-base-960h` es el comparable natural por arquitectura, vocabulario y tamaño, pero sus métricas no se incluyen en la información disponible.

## Limitaciones y advertencias

- Solo reconoce inglés y está entrenado exclusivamente con LibriSpeech (voz de audiolibro); el habla conversacional, con acento marcado o de campo lejano no ha sido evaluada.
- El ruido es añadido de forma sintética; no se evaluaron grabaciones con hablantes solapados (overlapping speakers).
- SNR muy bajo (≤ 0 dB) con ruido de banda ancha sigue siendo difícil: WER de 23,39 % (greedy) en ruido blanco a 0–5 dB.
- La salida no tiene puntuación ni capitalización; requiere posprocesado para texto legible.
- Riesgo de alucinación: como todo modelo CTC, puede producir transcripciones plausibles pero incorrectas en segmentos de baja relación señal-ruido; el WER agregado en condiciones ruidosas (9,16 % con LM) implica errores no despreciables.
- Sesgos: al entrenarse solo con LibriSpeech (audiolibros en inglés, dominio y acento limitados), puede tener peor rendimiento en variedades dialectales no representadas.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (LibriSpeech, CC BY 4.0, y MUSAN) tienen sus propias condiciones que conviene revisar.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`); úsense con cautela en comparaciones de producción.
- El modelo fue creado en noviembre de 2026 según los metadatos; verificar la vigencia de los enlaces y del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Modelo base con cabeza CTC: https://huggingface.co/facebook/wav2vec2-base-960h
- Etapa 1 (B460): https://huggingface.co/kumargulshan/wav2vec2-base-ls460-noise-aug
- Miembro del ensemble (semilla 7): https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr-seed7
- Modelo B_noisy (100 h + aumentación): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug
- Modelo B2_lr1e-4: https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug-lr1e-4
- Modelo A_clean (línea base limpia): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-clean
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Librería pyctcdecode (decodificación con KenLM): https://github.com/kensho-technologies/pyctcdecode
- Dataset MUSAN: no disponible como enlace en la información proporcionada
- Paper o blog del estudio: no disponible en la información proporcionada
