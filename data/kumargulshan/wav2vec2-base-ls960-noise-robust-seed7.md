# kumargulshan/wav2vec2-base-ls960-noise-robust-seed7

## Resumen

wav2vec2-base-ls960-noise-robust-seed7 es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por kumargulshan en el marco de un proyecto de laboratorio (Group 9, DS & AI Lab, noviembre de 2026) sobre ASR robusto al ruido con marcado de errores a nivel de palabra. Se trata de un fine-tuning de facebook/wav2vec2-base (95 M de parámetros) con una cabeza CTC a nivel de carácter, entrenado sobre las 960 horas completas de LibriSpeech con un pipeline agresivo de aumentación de datos (mezcla de ruido, reverberación simulada, perturbación de velocidad y filtrado telefónico).

El modelo es el segundo miembro de un sistema de combinación ROVER: utiliza exactamente la misma receta que B960_rev pero con una semilla aleatoria distinta (seed 7), de modo que los errores de ambos modelos sean suficientemente descorrelacionados como para que la fusión mejore el WER individual. No aporta innovaciones arquitectónicas frente al wav2vec2-base original; su interés reside en la receta de entrenamiento robusto y en su papel dentro de un ensemble.

Es relevante para desarrolladores que necesiten un modelo ASR ligero (0,4 GB de repo), desplegable en hardware modesto, con licencia Apache-2.0 y comportamiento documentado bajo condiciones de ruido blanco, rosa, marrón y sonidos ambientales de ESC-50 a distintos niveles de SNR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer encoder sobre extractor convolucional de features), cabeza CTC a nivel de carácter |
| Parametros totales | 94.396.320 (95 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada dependiente de la longitud del audio en muestras a 16 kHz) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de facebook/wav2vec2-base: un extractor convolucional de features (CNN) seguido de un encoder transformer, con una cabeza lineal CTC que produce logits sobre un vocabulario de 32 símbolos (A–Z, apóstrofo y delimitador de palabra `|`), idéntico al de facebook/wav2vec2-base-960h. El extractor CNN se mantiene congelado durante el fine-tuning; se aplica LayerDrop 0.1 y enmascaramiento estilo SpecAugment (tiempo p 0.4, span 10; features p 0.1, span 64).

El entrenamiento se realizó en dos etapas. La etapa 1 parte de facebook/wav2vec2-base y entrena sobre LibriSpeech train-clean-100 + train-clean-360 (464 h) durante 80k pasos con lr 1e-4. La etapa 2, que produce este checkpoint, continúa desde la etapa 1 sobre las 960 h completas de LibriSpeech durante 40k pasos (aproximadamente 6,8 épocas), con lr pico 5e-5, warm-up del 5 %, decaimiento lineal y semilla 7. La aumentación aplicada incluye: mezcla de ruido en el 80 % de los enunciados a SNR 0–20 dB (ruido blanco, rosa, MUSAN noise y MUSAN music), reverberación de sala simulada (p 0.3), perturbación de velocidad 0.9/1.1 (p 0.3) y band-limit telefónico (p 0.1). El optimizador fue AdamW (β 0.9/0.98, weight decay 0.005) con clipping de gradiente 1.0, precisión bf16 y batches agrupados por duración de hasta 640 s de audio. El checkpoint se seleccionó por el menor WER medio de dev (dev-clean + dev-other, limpio y ruidoso), alcanzando un WER de dev del 9,95 % en el paso 40000. El entrenamiento se ejecutó en una única NVIDIA L40S.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio mono a 16 kHz, con salida en mayúsculas sin puntuación ni casing.
- Decodificación CTC greedy o con beam search y modelo de lenguaje externo (KenLM de 4-gramas de LibriSpeech vía pyctcdecode; configuración usada: alpha 0.8, beta 2.0, beam 50).
- Robustez documentada frente a ruido blanco, rosa y marrón, así como sonidos ambientales de ESC-50, a niveles de SNR de 0 a 20 dB.
- Robustez frente a reverberación simulada, perturbaciones de velocidad y limitación de banda telefónica, gracias a la aumentación durante el entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá de ASR ni modo thinking.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Transcripción de audiolibros y pódcast en inglés: el modelo está entrenado sobre LibriSpeech, que proviene de audiolibros leídos, por lo que es adecuado para voz leída con dicción clara; su ventana de entrada admite audios largos procesados por segmentos.
- Preprocesado de datasets de voz para investigación en ASR: sirve como generador de transcripciones base en pipelines de anotación automática, con la ventaja de su licencia Apache-2.0 y su tamaño reducido (0,4 GB).
- Sistemas de combinación ROVER: el modelo está diseñado explícitamente como segundo miembro de un ensemble junto a B960_rev, de modo que la fusión de sus salidas CTC (por ejemplo, mediante ROVER o votación a nivel de palabra) reduce el WER respecto a un único modelo.
- Transcripción en entornos con ruido controlado: llamadas telefónicas con band-limit, grabaciones con ruido de fondo de tipo blanco o rosa, o audio con reverberación moderada, condiciones cubiertas por la aumentación de entrenamiento.
- Despliegue en hardware de gama baja o en el borde: con 95 M de parámetros y pesos en safetensors de 0,4 GB, puede ejecutarse en CPU o en GPUs consumer para transcripción por lotes de bajo volumen.
- Evaluación comparativa de robustez al ruido: el modelo publica resultados bajo 17 condiciones de ruido con semillas fijas, lo que permite reproducir experimentos y comparar recetas de aumentación de forma controlada.
- Filtrado y marcado de errores en transcripciones: en el contexto del proyecto original (word-level error flagging), puede usarse junto a un segundo modelo para detectar palabras con baja confianza y priorizar su revisión humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). WER en porcentaje sobre LibriSpeech test-clean y test-other (5.559 enunciados).

| Condicion | WER greedy (%) | WER + LM 4-gramas (%) |
|---|---|---|
| test-clean | 4,64 | 2,97 |
| test-other | 10,07 | 7,06 |
| Todas las condiciones ruidosas, agrupadas | – | 9,22 |
| Ruido blanco, 0–5 dB | 23,50 | 18,62 |
| Ruido rosa, 0–5 dB | 18,27 | 14,07 |
| Ruido marrón, 0–5 dB (tipo no visto en entrenamiento) | 7,57 | 5,13 |
| Sonidos ESC-50, 0–5 dB (tipo no visto en entrenamiento) | 15,52 | 11,81 |

La evaluación cubre 17 condiciones (limpio; ruido blanco, rosa y marrón; sonidos ESC-50 a 0, 5, 10, 15 y 20 dB SNR), con un total de 94.503 condiciones-enunciado y 182,7 h de audio. El ruido se mezcló con semillas fijas por enunciado para que todos los modelos del estudio vieran el mismo audio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los pesos (95 M de parámetros); en la práctica, el consumo depende del tamaño del lote y de la longitud del audio, pero cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes o alto throughput, A100, H100, L40S o RTX 4090; para uso ligero, RTX 3060 o superiores.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 2 GB de VRAM; también es viable en CPU para transcripción por lotes de bajo volumen.
- Opciones de despliegue: transformers (Wav2Vec2Processor + Wav2Vec2ForCTC), con decodificación opcional mediante pyctcdecode y KenLM; el pipeline de automatic-speech-recognition de transformers es compatible. No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER test-clean (greedy) | WER test-other (greedy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wav2vec2-base-ls960-noise-robust-seed7 (este) | 95 M | audio 16 kHz | 4,64 | 10,07 | Apache-2.0 | Hugging Face |
| facebook/wav2vec2-base-960h | 95 M | audio 16 kHz | no disponible en la informacion | no disponible en la informacion | Apache-2.0 | Hugging Face |
| kumargulshan/wav2vec2-base-ls960-noise-robust (B960_rev) | 95 M | audio 16 kHz | no disponible en la informacion (mejor modelo individual del estudio) | no disponible en la informacion | Apache-2.0 | Hugging Face |
| kumargulshan/wav2vec2-base-ls460-noise-aug (B460) | 95 M | audio 16 kHz | no disponible en la informacion | no disponible en la informacion | Apache-2.0 | Hugging Face |

Los modelos comparables pertenecen al mismo estudio y comparten arquitectura y licencia; las diferencias radican en la receta de entrenamiento (horas de datos y aumentación) y en la semilla. No se dispone de cifras de WER de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha evaluado con voz leída en inglés procedente de audiolibros (LibriSpeech); el habla conversacional, con acento marcado o de campo lejano no está probada.
- El ruido de entrenamiento es sintético; no se evaluaron grabaciones con hablantes solapados.
- El ruido de banda ancha a SNR muy bajo (≤ 0 dB) sigue siendo difícil: el WER con ruido blanco a 0–5 dB alcanza el 23,50 % en decodificación greedy.
- La salida no incluye puntuación ni mayúsculas/minúsculas; el vocabulario se limita a 32 símbolos (A–Z, apóstrofo y delimitador de palabra).
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (campo `verified: false` en el model-index).
- Riesgo de alucinación: como todo modelo CTC, puede producir transcripciones plausibles pero incorrectas en segmentos ruidosos o con audio fuera de dominio; se recomienda validación o umbrales de confianza en producción.
- Sesgos: no se documenta un análisis de sesgos por acento, género o edad; al entrenarse solo con LibriSpeech, el rendimiento puede degradarse en variedades del inglés no representadas.
- Licencia Apache-2.0, que permite uso comercial; los datos de entrenamiento son LibriSpeech (CC BY 4.0) y MUSAN, cuyas condiciones deben respetarse en la redistribución de derivados.
- El modelo está pensado como miembro de un ensemble; su uso individual puede no igualar el rendimiento del mejor modelo del estudio (B960_rev).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kumargulshan/wav2vec2-base-ls960-noise-robust-seed7
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Modelo B960_rev (mejor modelo individual del estudio): https://huggingface.co/kumargulshan/wav2vec2-base-ls960-noise-robust
- Modelo B460: https://huggingface.co/kumargulshan/wav2vec2-base-ls460-noise-aug
- Modelo B_noisy: https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug
- Modelo B2_lr1e-4: https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug-lr1e-4
- Modelo A_clean: https://huggingface.co/kumargulshan/wav2vec2-base-ls100-clean
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Paper original de wav2vec 2.0: no disponible en la información proporcionada
- Repositorio pyctcdecode (decodificación con KenLM): no disponible en la información proporcionada
