# kumargulshan/wav2vec2-base-ls100-noise-aug-lr1e-4

## Resumen

wav2vec2-base-ls100-noise-aug-lr1e-4 es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por el usuario kumargulshan en el marco de un estudio sobre ASR robusto al ruido con marcado de errores a nivel de palabra (proyecto del Group 9, DS & AI Lab, noviembre de 2026). Se trata de un fine-tuning de facebook/wav2vec2-base, un transformer convolucional-recurrente de 94,4 millones de parámetros, sobre las 100,6 horas de LibriSpeech train-clean-100 con aumento de datos por ruido sintético. El modelo emplea una cabeza CTC a nivel de carácter y una tasa de aprendizaje máxima de 1e-4, el mejor valor de su barrido de hiperparámetros.

Su relevancia radica en que aborda un problema práctico del ASR en producción: el deterioro del rendimiento cuando el audio no es limpio. El autor declara una WER del 5,89 % en LibriSpeech test-clean y del 13,11 % en test-other en decodificación greedy, que bajan al 3,67 % y 9,18 % respectivamente con un modelo de lenguaje de 4-gramas. Además, se evalúa sistemáticamente bajo 17 condiciones de ruido (blanco, rosa, marrón y sonidos ambientales ESC-50 a distintos SNR), lo que permite caracterizar su robustez con datos concretos.

El modelo es deliberadamente ligero (0,4 GB en el repositorio) y se distribuye con licencia Apache-2.0, lo que lo hace adecuado para despliegues con recursos limitados o para servir como componente base en pipelines de transcripción con detección de errores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder convolucional + transformer, cabeza CTC a nivel de carácter) |
| Parametros totales | 94.396.320 (≈ 94,4 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada dependiente de la longitud del audio) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de facebook/wav2vec2-base, un encoder convolucional de extracción de características (congelado durante el fine-tuning) seguido de un transformer de 12 capas que produce representaciones latentes del audio, sobre las que se aplica una cabeza CTC con un vocabulario de 32 símbolos (A–Z, apóstrofo y delimitador de palabra `|`), idéntico al de facebook/wav2vec2-base-960h. El entrenamiento se realizó sobre LibriSpeech train-clean-100 (100,6 horas) durante 36.000 pasos (≈ 59,5 épocas), con pico de learning rate 1e-4, 8 % de warm-up, decaimiento lineal y semilla 42.

La innovación principal es el esquema de aumento por ruido: el 80 % de los enunciados se mezclaron con ruido a SNR entre 0 y 20 dB (ruido blanco, rosa, ruido y música de MUSAN), mientras que el 20 % restante se mantuvo limpio. Se aplicó regularización tipo SpecAugment (máscara temporal p=0,4 con span 10; máscara de features p=0,1 con span 64), LayerDrop 0,1 y congelación del encoder convolucional. El optimizador fue AdamW (β 0,9/0,98, weight decay 0,005), con clipping de gradiente 1,0 y precisión bf16. La selección del checkpoint se hizo por la menor WER media en dev-clean y dev-other (limpio y ruidoso), resultando el paso 36.000 con una WER de desarrollo del 13,06 %. El entrenamiento se ejecutó en una única NVIDIA L40S.

## Capacidades

- Reconocimiento automático del habla en inglés con salida CTC a nivel de carácter (mayúsculas, apóstrofo y espacios como delimitadores de palabra).
- Robustez al ruido: entrenado explícitamente con mezclas de ruido blanco, rosa, MUSAN noise y MUSAN music a SNR de 0 a 20 dB.
- Decodificación con modelo de lenguaje externo: compatible con KenLM de 4-gramas de LibriSpeech mediante `pyctcdecode` (parámetros recomendados: alpha 0,8, beta 2,0, beam 50).
- Integración con el ecosistema Transformers (`Wav2Vec2Processor` y `Wav2Vec2ForCTC`).
- Inferencia sobre audio mono a 16 kHz.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- No genera puntuación ni distinción de mayúsculas/minúsculas en la salida.

## Casos de uso

- Transcripción de audiolibros y pódcasts: el modelo está entrenado sobre LibriSpeech, voz de audiolibro leída, por lo que es directamente adecuado para transcribir narración limpia con una WER declarada del 5,89 % en test-clean (3,67 % con LM de 4-gramas).
- Preprocesado de corpus para entrenamiento de modelos de lenguaje: transcripción masiva de audio en inglés con un modelo de 94 M de parámetros y 0,4 GB, desplegable en una sola GPU consumer para procesar grandes volúmenes.
- Subtitulado automático en entornos con ruido moderado: la augmentación con ruido a SNR de 0 a 20 dB permite mantener una WER del 11,61 % agrupada en todas las condiciones ruidosas con LM, útil para grabaciones de campo no críticas.
- Componente de un sistema de marcado de errores a nivel de palabra: el modelo forma parte de un estudio sobre flagging de errores; sus logits CTC pueden usarse para estimar confianza por palabra y señalar segmentos dudosos para revisión humana.
- Transcripción en dispositivos con recursos limitados: al ser un modelo base de 94 M de parámetros, cabe en GPUs de gama baja y en CPU con latencia aceptable para aplicaciones de dictado o notas de voz.
- Evaluación comparativa de robustez al ruido: sirve como referencia (Model B con lr 1e-4) dentro de la familia de modelos del mismo estudio (B960_rev, B460, B_noisy, A_clean) para experimentos controlados de ASR robusto.
- Filtrado y búsqueda de contenido en archivos de audio en inglés: transcripción previa para indexación de bibliotecas de audio limpias o con ruido estacionario.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados):

| Condicion | WER greedy (%) | WER + LM 4-gramas (%) |
|---|---|---|
| LibriSpeech test-clean | 5,89 | 3,67 |
| LibriSpeech test-other | 13,11 | 9,18 |
| Todas las condiciones ruidosas (agrupadas) | – | 11,61 |
| Ruido blanco, 0–5 dB | 28,56 | 22,57 |
| Ruido rosa, 0–5 dB | 22,81 | 17,44 |
| Ruido marrón, 0–5 dB (tipo no visto) | 9,99 | 6,70 |
| Sonidos ESC-50, 0–5 dB (tipo no visto) | 19,56 | 14,82 |

La evaluación cubre 5.559 enunciados de LibriSpeech test-clean y test-other bajo 17 condiciones (limpio, ruido blanco/rosa/marrón y sonidos ESC-50 a 0, 5, 10, 15 y 20 dB SNR), totalizando 94.503 condiciones-enunciado y 182,7 horas de audio. El ruido se mezcló con semillas fijas por enunciado para que todos los modelos del estudio vieran el mismo audio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB de pesos más activaciones; en la práctica, menos de 2 GB para audio de duración moderada.
- VRAM estimada en fp16/bf16: en torno a 0,2 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: NVIDIA L40S (usada en entrenamiento), A100, H100 para lotes grandes; RTX 4090, RTX 3090, RTX 3060 o incluso GPUs integradas para inferencia en tiempo real.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2–4 GB de VRAM; también es viable en CPU para transcripción por lotes.
- Opciones de despliegue: Transformers con `Wav2Vec2ForCTC`, `pyctcdecode` para decodificación con KenLM; compatible con endpoints de Hugging Face (tag `endpoints_compatible`); despliegue en servidores de inferencia estándar de Transformers (TGI no soporta nativamente CTC de wav2vec2; se recomienda un servidor Python propio o `transformers` con batching).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / datos | WER test-clean | WER test-other | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kumargulshan/wav2vec2-base-ls100-noise-aug-lr1e-4 | 94,4 M | 100,6 h + ruido | 5,89 % greedy / 3,67 % LM | 13,11 % greedy / 9,18 % LM | Apache-2.0 | Hugging Face |
| kumargulshan/wav2vec2-base-ls100-noise-aug (Model B) | 94,4 M | 100,6 h + ruido | no disponible | no disponible | Apache-2.0 | Hugging Face |
| kumargulshan/wav2vec2-base-ls100-clean (Model A) | 94,4 M | 100,6 h limpio | no disponible | no disponible | Apache-2.0 | Hugging Face |
| kumargulshan/wav2vec2-base-ls460-noise-aug (B460) | 94,4 M | 464 h + ruido | no disponible | no disponible | Apache-2.0 | Hugging Face |
| kumargulshan/wav2vec2-base-noise-robust-asr (B960_rev) | 94,4 M | 960 h + ruido/reverb/velocidad/teléfono | no disponible | no disponible | Apache-2.0 | Hugging Face |
| facebook/wav2vec2-base-960h | 94,4 M | 960 h LibriSpeech | no disponible en la información | no disponible en la información | Apache-2.0 | Hugging Face |

Los modelos comparables directos son los del mismo estudio, ya que el autor no proporciona cifras de facebook/wav2vec2-base-960h ni de otras alternativas en la información disponible. La comparación con B960_rev es la más relevante: usa 960 h y augmentación más agresiva (reverberación, velocidad, teléfono) y se describe como el mejor modelo único del estudio, aunque sus métricas no se detallan en esta ficha.

## Limitaciones y advertencias

- Solo reconoce inglés de audiolibros (LibriSpeech); el habla conversacional, con acento marcado o de campo lejano no se ha evaluado.
- El ruido es sintético; no se evaluaron grabaciones con hablantes solapados.
- El ruido de banda ancha a SNR muy bajo (≤ 0 dB) sigue siendo difícil: la WER con ruido blanco a 0–5 dB alcanza el 28,56 % en greedy y el 22,57 % con LM.
- La salida no incluye puntuación ni distinción de mayúsculas y minúsculas, lo que limita su uso directo en productos de subtitulado sin postprocesado.
- Riesgo de alucinación inherente a los modelos CTC: en segmentos de silencio o ruido extremo puede emitir texto espurio; se recomienda umbral de confianza y revisión.
- Sesgos de dominio: al entrenarse solo con LibriSpeech, puede tener peor rendimiento en voces no representadas en ese corpus (determinadas variedades dialectales, habla infantil, etc.).
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (LibriSpeech, CC BY 4.0, y MUSAN) imponen sus propias condiciones de atribución que conviene revisar.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en la model-index).
- El modelo tiene 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug-lr1e-4
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Model B (mismo esquema, sin ajuste de lr): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug
- Model A (baseline limpio): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-clean
- Modelo B460 (464 h + ruido): https://huggingface.co/kumargulshan/wav2vec2-base-ls460-noise-aug
- Modelo B960_rev (960 h, mejor modelo único del estudio): https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr
- Modelo B960_rev semilla 7 (miembro de ensemble): https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr-seed7
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Referencia de vocabulario y cabeza CTC: https://huggingface.co/facebook/wav2vec2-base-960h
