# kumargulshan/wav2vec2-base-noise-robust-asr-seed7

## Resumen

`wav2vec2-base-noise-robust-asr-seed7` es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por el usuario de Hugging Face `kumargulshan` como parte de un estudio académico sobre ASR robusto al ruido con marcado de errores a nivel de palabra. Se trata de un fine-tuning del checkpoint preentrenado `facebook/wav2vec2-base` (95 M parámetros) al que se le ha añadido una cabeza CTC a nivel de carácter para transcribir audio en inglés. El modelo forma parte de una familia de cinco variantes entrenadas con recetas controladas, y esta en concreto (semilla 7) es la segunda miembro del sistema de combinación ROVER del estudio.

La relevancia del modelo reside en su receta de aumento de datos orientada a robustez frente a ruido: el 80 % de los enunciados se mezclan con ruido a SNR entre 0 y 20 dB (ruido blanco, rosa, MUSAN noise y MUSAN music), se aplica reverberación de sala simulada, perturbación de velocidad y filtrado telefónico. Esto lo diferencia de un fine-tuning estándar sobre LibriSpeech y lo hace interesante para evaluar degradación en condiciones acústicas adversas, un escenario habitual en producción real.

Arquitectónicamente es un transformer convolucional estándar de wav2vec2 con 94,4 M parámetros, contexto efectivo limitado por la arquitectura (audio de entrada de hasta unos 30 s por fragmento), licencia Apache-2.0 y pesos en safetensors. No incorpora innovaciones como decodificación especulativa ni atención lineal: su valor está en la receta de entrenamiento y en la evaluación sistemática bajo 17 condiciones de ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (CNN feature encoder + transformer encoder + cabeza CTC) |
| Parametros totales | 94.396.320 (≈ 94,4 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (wav2vec2 procesa fragmentos de audio; típicamente hasta ~30 s por ventana) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/bf16; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura canónica de wav2vec2: un codificador convolucional de características que procesa la forma de onda a 16 kHz, seguido de un transformer encoder y una cabeza lineal CTC con vocabulario de 32 símbolos (A–Z, apóstrofo y delimitador de palabra `|`), idéntico al de `facebook/wav2vec2-base-960h`. El encoder CNN se mantiene congelado durante el fine-tuning, y se aplica LayerDrop 0.1 y enmascaramiento estilo SpecAugment (tiempo p 0.4 / span 10, features p 0.1 / span 64).

El entrenamiento se realizó en dos etapas. La etapa 1 parte de `facebook/wav2vec2-base` y entrena sobre LibriSpeech train-clean-100 + 360 (464 h) durante 80k pasos con lr 1e-4. La etapa 2, que produce este checkpoint, continúa desde la etapa 1 sobre las 960 h completas de LibriSpeech durante 40k pasos (≈ 6,8 épocas), con lr máximo 5e-5, warm-up del 5 %, decaimiento lineal y semilla 7. El aumento de datos incluye mezcla de ruido en el 80 % de los enunciados (SNR 0–20 dB con ruido blanco, rosa, MUSAN noise y MUSAN music), reverberación simulada (p 0.3), perturbación de velocidad 0.9/1.1 (p 0.3) y band-limit telefónico (p 0.1). Optimizador AdamW (β 0.9/0.98, weight decay 0.005), gradient clipping 1.0, precisión bf16, batches agrupados por duración de hasta 640 s de audio, sobre una única NVIDIA L40S. La selección del checkpoint se hizo por el menor WER medio de dev (dev-clean + dev-other, limpio y con ruido), resultando el paso 40000 con dev WER del 9,95 %.

## Capacidades

- Reconocimiento automático del habla en inglés a nivel de carácter con salida CTC.
- Transcripción de audio mono a 16 kHz (requiere resampleo previo si la fuente no es 16 kHz).
- Robustez frente a ruido sintético: blanco, rosa, marrón y sonidos ambientales de ESC-50, a SNR entre 0 y 20 dB.
- Tolerancia a reverberación de sala simulada y a filtrado telefónico (band-limit), gracias al aumento de datos.
- Decodificación con modelo de lenguaje externo: los logits pueden pasarse a `pyctcdecode` con un KenLM 4-gram de LibriSpeech (alpha 0.8, beta 2.0, beam 50) para reducir el WER.
- Salida en mayúsculas sin puntuación ni capitalización (vocabulario de 32 símbolos).
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá de la transcripción, ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Transcripción de audiolibros y pódcasts en inglés: el modelo está entrenado sobre LibriSpeech (habla de audiolibro) y ofrece un WER de 4,64 % en test-clean y 10,07 % en test-other en decodificación greedy, adecuado para generar subtítulos o texto indexable de contenido narrado.
- Preprocesado de corpus de voz para investigación en PLN: permite transcribir grandes volúmenes de audio inglés a texto para alimentar pipelines de análisis, con la ventaja de que su licencia Apache-2.0 facilita su uso en proyectos académicos y comerciales.
- Evaluación de robustez acústica en pipelines de ASR: sirve como referencia controlada (semilla 7) para comparar el impacto de ruido, reverberación o filtrado telefónico frente a otros checkpoints de la misma familia.
- Combinación ROVER en sistemas de reconocimiento: el autor lo diseña explícitamente como segundo miembro de un sistema de combinación ROVER, de modo que puede usarse junto a otros modelos de la familia para reducir el WER mediante votación de hipótesis.
- Transcripción de grabaciones telefónicas o de baja calidad: el aumento de datos con band-limit telefónico (p 0.1) y ruido a SNR bajo lo hace razonablemente adecuado para audio de call center en inglés, aunque el autor advierte que el habla conversacional y con acento no se ha evaluado.
- Generación de datos etiquetados para entrenamiento de modelos ASR: sus transcripciones pueden usarse como pseudo-etiquetas en corpus no anotados en inglés, con revisión humana posterior dado el riesgo de error en condiciones de SNR muy bajo.
- Prototipado rápido en entornos con GPU modesta: con 94,4 M parámetros y pesos de 0,4 GB, cabe en GPUs de consumo y permite iterar sobre pipelines de ASR sin infraestructura pesada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). WER en porcentaje sobre LibriSpeech test-clean y test-other (5.559 enunciados), y sobre condiciones de ruido sintético (94.503 condiciones de enunciado, 182,7 h). Ruido marrón y ESC-50 no se usaron en entrenamiento.

| Condición | WER greedy (%) | WER + LM 4-gram (%) |
|---|---|---|
| test-clean | 4,64 | 2,97 |
| test-other | 10,07 | 7,06 |
| Todas las condiciones con ruido (agregado) | no disponible | 9,22 |
| Ruido blanco, 0–5 dB | 23,50 | 18,62 |
| Ruido rosa, 0–5 dB | 18,27 | 14,07 |
| Ruido marrón, 0–5 dB (tipo no visto) | 7,57 | 5,13 |
| Sonidos ESC-50, 0–5 dB (tipo no visto) | 15,52 | 11,81 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card; los datos anteriores son los únicos benchmarks declarados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (94,4 M parámetros ≈ 378 MB de pesos) y en torno a 0,5 GB en bf16; el consumo real depende del tamaño del lote y de la longitud de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una NVIDIA L40S fue la usada para entrenamiento, pero para inferencia basta una GTX 1650, RTX 3050, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 20xx en adelante, e incluso iGPU con suficiente memoria compartida).
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC` y `Wav2Vec2Processor` (vía oficial documentada), y potencialmente `pyctcdecode` para decodificación con KenLM. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no están orientados a este tipo de modelo CTC.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | WER test-clean (greedy) | WER test-other (greedy) | Licencia |
|---|---|---|---|---|---|
| `kumargulshan/wav2vec2-base-noise-robust-asr-seed7` (este) | 94,4 M | fragmentos de audio (wav2vec2) | 4,64 % | 10,07 % | Apache-2.0 |
| `facebook/wav2vec2-base-960h` | ≈ 95 M | fragmentos de audio (wav2vec2) | no disponible en la información | no disponible en la información | Apache-2.0 |
| `kumargulshan/wav2vec2-base-noise-robust-asr` (B960_rev) | ≈ 95 M | fragmentos de audio (wav2vec2) | no disponible en la información (el autor lo describe como el mejor modelo individual del estudio) | no disponible en la información | Apache-2.0 |
| `kumargulshan/wav2vec2-base-ls100-clean` (A_clean) | ≈ 95 M | fragmentos de audio (wav2vec2) | no disponible en la información (baseline limpio de 100 h) | no disponible en la información | Apache-2.0 |

No se dispone en la información proporcionada de los WER concretos de los modelos comparables; la comparación se limita a parámetros, licencia y descripción cualitativa del autor.

## Limitaciones y advertencias

- Solo reconoce habla de audiolibro en inglés (LibriSpeech); el habla conversacional, con acento marcado o de campo lejano no se ha evaluado.
- El ruido es sintéticamente añadido; no se evaluaron grabaciones con hablantes solapados (cocktail party).
- El ruido de banda ancha a SNR muy bajo (≤ 0 dB) sigue siendo difícil: WER del 23,50 % en ruido blanco a 0–5 dB en greedy.
- La salida no tiene puntuación ni capitalización; solo mayúsculas, apóstrofo y delimitador de palabra.
- Riesgo de alucinación y errores de sustitución en condiciones acústicas adversas, especialmente en nombres propios y términos técnicos.
- Sesgos: al entrenarse solo con LibriSpeech, puede presentar peor rendimiento con variedades dialectales del inglés no representadas en el corpus.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento (LibriSpeech, CC BY 4.0, y MUSAN) imponen sus propias condiciones de atribución.
- Los benchmarks son declarados por el autor y marcados como no verificados (`verified: false`); conviene reproducirlos antes de usarlos como referencia en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria de su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr-seed7
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- B960_rev (mejor modelo individual del estudio): https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr
- B460 (464 h + aumento de ruido): https://huggingface.co/kumargulshan/wav2vec2-base-ls460-noise-aug
- B_noisy (100 h + aumento de ruido): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug
- B2_lr1e-4 (100 h + ruido, lr 1e-4): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug-lr1e-4
- A_clean (baseline limpio de 100 h): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-clean
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Paper original de wav2vec 2.0 (referencia de la arquitectura): https://arxiv.org/abs/2006.11477
- Repositorio `pyctcdecode` (decodificación con KenLM): https://github.com/kensho-technologies/pyctcdecode
