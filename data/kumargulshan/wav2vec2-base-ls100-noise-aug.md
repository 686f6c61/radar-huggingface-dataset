# kumargulshan/wav2vec2-base-ls100-noise-aug

## Resumen

`wav2vec2-base-ls100-noise-aug` es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por el usuario de Hugging Face `kumargulshan` en el marco de un proyecto académico del DS & AI Lab (noviembre de 2026). Se trata de un fine-tuning de `facebook/wav2vec2-base` (95 M de parámetros) con una cabeza CTC a nivel de carácter, entrenado sobre las 100,6 horas de `train-clean-100` de LibriSpeech con aumento de datos por ruido.

El modelo aborda el problema de la robustez frente al ruido en ASR: el 80 % de las locuciones de entrenamiento se mezclaron con ruido blanco, rosa, ruido y música de MUSAN a relaciones señal-ruido (SNR) de 0 a 20 dB, mientras que el 20 % restante se mantuvo limpio. Esto lo diferencia de un fine-tuning convencional sobre LibriSpeech limpio y lo orienta a escenarios de producción con audio degradado.

Es relevante porque demuestra que un modelo base pequeño (95 M de parámetros, 0,4 GB de pesos) puede alcanzar un WER de 3,70 % en test-clean y 8,85 % en test-other con un 4-gram LM, con un rendimiento razonable en condiciones de ruido no vistas durante el entrenamiento (ruido marrón y sonidos ESC-50). El modelo forma parte de un estudio comparativo más amplio con otras cinco variantes publicadas por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer encoder convolucional + atención, cabeza CTC a nivel de carácter) |
| Parametros totales | 94.396.320 (≈ 95 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio dependiente del encoder convolucional; no se declara límite explícito) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2 estándar: un extractor de características convolucional (CNN) que en este fine-tuning se mantuvo congelado, seguido de un encoder transformer y una cabeza lineal CTC que proyecta a un vocabulario de 32 símbolos (A–Z, apóstrofo y `|` como delimitador de palabra, idéntico al de `facebook/wav2vec2-base-960h`). Se parte de los pesos de `facebook/wav2vec2-base` y se fine-tunea con pérdida CTC a nivel de carácter.

El entrenamiento usó LibriSpeech `train-clean-100` (100,6 h) durante 36.000 pasos (≈ 59,5 épocas), con learning rate pico de 5e-5, 8 % de warm-up, decaimiento lineal, AdamW (β 0.9/0.98, weight decay 0.005), clipping de gradiente 1.0, precisión bf16 y batches agrupados por duración de hasta 640 s de audio, sobre una única NVIDIA L40S. El aumento de datos mezcla el 80 % de las locuciones con ruido (blanco, rosa, MUSAN noise, MUSAN music) a SNR 0–20 dB. Como regularización se aplicó enmascaramiento tipo SpecAugment (tiempo p 0.4 / span 10; features p 0.1 / span 64) y LayerDrop 0.1. El checkpoint final se seleccionó por el menor WER medio de desarrollo (dev-clean + dev-other, limpio y ruidoso), correspondiente al paso 34.000 con un 13,32 % de WER en dev.

## Capacidades

- Reconocimiento de voz en inglés (ASR) con salida CTC a nivel de carácter en mayúsculas, sin puntuación ni distinción de mayúsculas/minúsculas.
- Robustez frente a ruido sintético: entrenado explícitamente con ruido blanco, rosa y MUSAN a SNR 0–20 dB.
- Decodificación con modelo de lenguaje externo: los logits pueden pasarse a un 4-gram KenLM de LibriSpeech vía `pyctcdecode` (configuración usada por el autor: alpha 0.8, beta 2.0, beam 50) para reducir el WER.
- Entrada de audio mono a 16 kHz (requiere remuestreo previo si la fuente difiere).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo thinking: es un modelo puramente acústico-lingüístico de transcripción.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Transcripción de audiolibros y pódcasts en inglés: el modelo está entrenado sobre habla de audiolibro (LibriSpeech) y ofrece un WER de 3,70 % con LM en audio limpio, adecuado para generar transcripciones de contenido editorial con revisión humana ligera.
- Subtitulado automático de vídeo con ruido de fondo moderado: la augmentación con ruido blanco, rosa y MUSAN permite mantener un WER del orden del 11,62 % en condiciones ruidosas agrupadas, útil para material grabado en entornos no controlados.
- Preprocesado de pipelines de NLP sobre audio: transcripción previa a tareas de resumen, búsqueda o indexación de contenido hablado, donde el modelo actúa como primer eslabón con un coste computacional bajo (95 M de parámetros).
- Detección y marcado de errores a nivel de palabra: el proyecto del autor se enmarca en un estudio de ASR robusto con *word-level error flagging*, por lo que el modelo sirve como base para sistemas que señalan segmentos de baja confianza y los derivan a revisión humana.
- Prototipado e investigación en robustez acústica: al ser un fine-tuning controlado con semilla fija (42) y condiciones de ruido documentadas, es adecuado como línea base reproducible en experimentos de ASR con ruido.
- Despliegue en entornos con recursos limitados: con 0,4 GB de pesos en safetensors y 95 M de parámetros, cabe en GPUs de consumo y en CPU para inferencia por lotes de audio corto, lo que facilita su integración en servicios de transcripción de bajo coste.
- Evaluación comparativa de modelos ASR: al formar parte de un conjunto de seis variantes del mismo estudio (100 h, 460 h, 960 h, con y sin aumento de ruido), permite comparar el impacto del volumen de datos y de la augmentación en el WER.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Conjunto / condicion | WER greedy (%) | WER + 4-gram LM (%) |
|---|---|---|
| LibriSpeech test-clean | 6,19 | 3,70 |
| LibriSpeech test-other | 13,08 | 8,85 |
| Todas las condiciones ruidosas (agrupadas) | – | 11,62 |
| Ruido blanco, 0–5 dB | 29,09 | 22,79 |
| Ruido rosa, 0–5 dB | 23,20 | 17,63 |
| Ruido marrón, 0–5 dB (tipo no visto) | 10,02 | 6,55 |
| Sonidos ESC-50, 0–5 dB (tipo no visto) | 20,12 | 15,09 |

La evaluación se realizó sobre 5.559 locuciones de test-clean y test-other bajo 17 condiciones (limpio, ruido blanco/rosa/marrón y sonidos ambientales ESC-50 a 0, 5, 10, 15 y 20 dB SNR), totalizando 94.503 pares locución-condición y 182,7 h de audio. El ruido marrón y ESC-50 no se usaron en entrenamiento. El WER de desarrollo reportado por el autor es del 13,32 % (media de dev-clean + dev-other, limpio y ruidoso).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (0,4 GB de pesos), aproximadamente 0,2 GB en fp16/bf16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una NVIDIA L40S, pero la inferencia es viable en RTX 3060, RTX 4060, RTX 4090, A100, H100, etc.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 o superior) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` (PyTorch), `pyctcdecode` con KenLM para decodificación con LM, y servidores de inferencia compatibles con `transformers` (el tag `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints). No se documentan variantes GGUF ni soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / datos | WER test-clean (LM) | WER test-other (LM) | Licencia |
|---|---|---|---|---|---|
| `wav2vec2-base-ls100-noise-aug` (este) | 95 M | 100,6 h + ruido | 3,70 % | 8,85 % | Apache-2.0 |
| `facebook/wav2vec2-base-960h` | 95 M | 960 h limpias | no disponible en la información | no disponible en la información | Apache-2.0 |
| `kumargulshan/wav2vec2-base-ls100-clean` (A_clean) | 95 M | 100,6 h limpias | no disponible en la información | no disponible en la información | Apache-2.0 |
| `kumargulshan/wav2vec2-base-ls460-noise-aug` (B460) | 95 M | 464 h + ruido | no disponible en la información | no disponible en la información | Apache-2.0 |
| `kumargulshan/wav2vec2-base-noise-robust-asr` (B960_rev) | 95 M | 960 h + ruido/reverb/velocidad/teléfono | no disponible en la información | no disponible en la información | Apache-2.0 |

No se dispone de los WER de los modelos comparables en la información proporcionada; solo se documenta que B960_rev es el "mejor modelo único" del estudio según el autor. La comparación cuantitativa con alternativas externas (p. ej. Whisper) no está disponible.

## Limitaciones y advertencias

- Solo reconoce inglés de audiolibro (LibriSpeech); el habla conversacional, con acento marcado o en campo lejano no ha sido evaluada.
- El ruido es sintético; no se evaluaron grabaciones con hablantes solapados.
- El rendimiento se degrada notablemente a SNR muy bajas (≤ 0 dB) con ruido de banda ancha: WER del 22,79 % con LM en ruido blanco a 0–5 dB.
- La salida no incluye puntuación ni distinción de mayúsculas/minúsculas.
- Riesgo de alucinación: como todo modelo CTC, puede generar transcripciones plausibles pero incorrectas en audio ambiguo o fuera de dominio; se recomienda validación con LM y revisión humana en producción.
- Sesgos: no documentados por el autor; al entrenarse solo con LibriSpeech (habla de audiolibro estadounidense), es probable un sesgo hacia ese dominio y acento, aunque no se cuantifica.
- Licencia Apache-2.0 permite uso comercial; los datos de entrenamiento son LibriSpeech (CC BY 4.0) y MUSAN, cuyas condiciones deben respetarse.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita el despliegue en entornos que requieran GGUF u ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Variante B960_rev (mejor modelo único del estudio): https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr
- Variante B960_rev_s2 (miembro del ensemble, semilla 7): https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr-seed7
- Variante B460 (464 h + ruido): https://huggingface.co/kumargulshan/wav2vec2-base-ls460-noise-aug
- Variante B2_lr1e-4 (100 h + ruido, lr 1e-4): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug-lr1e-4
- Variante A_clean (100 h, línea base limpia): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-clean
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Repositorio de `pyctcdecode` (decodificación con KenLM): no disponible en la información proporcionada
