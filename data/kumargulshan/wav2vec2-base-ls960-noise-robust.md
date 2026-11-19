# kumargulshan/wav2vec2-base-ls960-noise-robust

## Resumen
`kumargulshan/wav2vec2-base-ls960-noise-robust` es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por el autor independiente kumargulshan en el marco de un proyecto del DS & AI Lab (noviembre de 2026). Se trata de un fine-tuning de `facebook/wav2vec2-base` (95 M de parámetros) con una cabeza CTC a nivel de carácter, entrenado sobre las 960 horas completas de LibriSpeech y con un pipeline de aumento de datos orientado a la robustez frente al ruido. El modelo se presenta como el mejor modelo individual de un estudio comparativo sobre ASR robusto con marcado de errores a nivel de palabra.

La relevancia del modelo reside en su perfil de robustez: el 80 % de las locuciones de entrenamiento se mezclaron con ruido (blanco, rosa, MUSAN noise y MUSAN music) a relaciones señal-ruido de 0 a 20 dB, se aplicó reverberación de sala simulada, perturbación de velocidad y limitación de banda telefónica. Esto lo sitúa como una alternativa práctica al checkpoint estándar `wav2vec2-base-960h` cuando el audio de entrada no es limpio, manteniendo un tamaño reducido (0,4 GB de repositorio, 94,4 M de parámetros) que permite desplegarlo en hardware modesto.

Arquitectónicamente es un transformer convolucional CTC clásico de wav2vec2, sin decodificador autorregresivo ni mecanismos de atención lineal. Su contexto no es una ventana de tokens sino la secuencia completa de audio que se procesa; el modelo acepta audio mono a 16 kHz y emite directamente la transcripción en mayúsculas sin puntuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder convolucional + transformer, cabeza CTC a nivel de caracter) |
| Parametros totales | 94.396.320 (≈ 94,4 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (procesa secuencias de audio; sin límite de tokens documentado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura wav2vec2 de `facebook/wav2vec2-base`: un extractor de características convolucional seguido de un encoder transformer y una cabeza de clasificación CTC con vocabulario de 32 símbolos (A–Z, apóstrofo y `|` como delimitador de palabra), idéntico al de `facebook/wav2vec2-base-960h`. El encoder CNN permaneció congelado durante el fine-tuning. El entrenamiento se realizó en dos etapas: una primera desde `facebook/wav2vec2-base` sobre LibriSpeech train-clean-100 + train-clean-360 (464 h) durante 80.000 pasos con lr 1e-4, y una segunda (este modelo) continuando desde ese checkpoint sobre las 960 h completas de LibriSpeech durante 40.000 pasos (≈ 6,8 épocas), con lr pico 5e-5, warm-up del 5 %, decaimiento lineal y semilla 42.

El aumento de datos es el elemento diferenciador: el 80 % de las locuciones se mezclaron con ruido a SNR de 0–20 dB (ruido blanco, rosa, MUSAN noise y MUSAN music), se aplicó reverberación de sala simulada con probabilidad 0,3, perturbación de velocidad 0,9/1,1 con probabilidad 0,3 y limitación de banda telefónica con probabilidad 0,1. La regularización incluyó masking estilo SpecAugment (tiempo p 0,4/span 10; features p 0,1/span 64), LayerDrop 0,1 y optimizador AdamW (β 0,9/0,98, weight decay 0,005, grad clipping 1,0, bf16) con batches agrupados por duración de hasta 640 s de audio. La selección del checkpoint se hizo por el menor WER medio de desarrollo (dev-clean + dev-other, limpio y ruidoso), resultando el paso 38.000 con un WER de desarrollo del 9,87 %. Todo el entrenamiento se ejecutó en una única NVIDIA L40S.

## Capacidades
- Reconocimiento automático del habla en inglés con salida CTC a nivel de carácter (mayúsculas, apóstrofo, espacios).
- Transcripción robusta frente a ruido aditivo (blanco, rosa, marrón, sonidos ambientales ESC-50) a SNR de 0 a 20 dB.
- Tolerancia a reverberación de sala simulada y a limitación de banda telefónica, gracias a las condiciones de aumento de entrenamiento.
- Decodificación con modelo de lenguaje externo: los logits pueden pasarse a `pyctcdecode` con un KenLM de 4 gramos de LibriSpeech (alpha 0,8, beta 2,0, beam 50) para reducir el WER.
- Inferencia por lotes de audio de duración variable (batching agrupado por duración).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- No genera puntuación ni distingue mayúsculas y minúsculas más allá de la salida en mayúsculas del vocabulario.

## Casos de uso
- Transcripción de audio ruidoso en producción: el modelo está entrenado explícitamente para entradas con SNR baja, por lo que es adecuado para grabar reuniones, llamadas o entrevistas con ruido de fondo sin necesidad de un preprocesado agresivo de denoising.
- Subtitulado de archivos audiovisuales: con 94,4 M de parámetros y 0,4 GB de pesos, puede ejecutarse en CPU o GPU de gama baja para transcribir grandes volúmenes de audio en pipelines batch.
- Transcripción telefónica: la limitación de banda telefónica aplicada en entrenamiento (p 0,1) hace que el modelo sea apropiado para audio de call centers con ancho de banda restringido.
- Indexación y búsqueda de contenido hablado: transcripción de podcasts o archivos de audio para construir índices de búsqueda; la salida en mayúsculas sin puntuación es suficiente para indexación por palabras.
- Evaluación y anotación asistida de datasets de voz: el modelo puede generar transcripciones preliminares sobre las que un humano corrige, reduciendo el coste de anotación en corpus en inglés.
- Prototipado e investigación en ASR robusto: al ser un fine-tuning reproducible de wav2vec2-base con receta de aumento documentada, sirve como baseline para estudios de robustez frente al ruido y para comparar con los otros checkpoints del mismo estudio (B460, B_noisy, A_clean).
- Despliegue en dispositivos con recursos limitados: su tamaño permite integración en aplicaciones de escritorio o servidores sin GPU dedicada mediante `transformers` en CPU.

## Benchmarks y rendimiento
Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Condicion | WER greedy (%) | WER + LM 4-gram (%) |
|---|---|---|
| LibriSpeech test-clean | 4,63 | 2,97 |
| LibriSpeech test-other | 9,95 | 7,01 |
| Todas las condiciones ruidosas agrupadas | – | 9,16 |
| Ruido blanco, 0–5 dB | 23,39 | 18,47 |
| Ruido rosa, 0–5 dB | 18,18 | 13,92 |
| Ruido marrón, 0–5 dB (tipo no visto) | 7,49 | 5,11 |
| Sonidos ESC-50, 0–5 dB (tipo no visto) | 15,39 | 11,75 |

La evaluación cubrió 5.559 locuciones de test-clean y test-other bajo 17 condiciones (limpio, ruido blanco/rosa/marrón y sonidos ESC-50 a 0, 5, 10, 15 y 20 dB SNR), totalizando 94.503 condiciones-locución y 182,7 h de audio. El ruido marrón y ESC-50 no se usaron en entrenamiento, por lo que sirven como prueba de generalización a tipos de ruido no vistos. El WER de desarrollo reportado para el checkpoint seleccionado (paso 38.000) fue del 9,87 %.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 94,4 M de parámetros; en la práctica, unos 1–2 GB incluyendo activaciones para audio de duración moderada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una NVIDIA L40S, pero para inferencia son suficientes tarjetas consumer como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU para audio de duración corta o media.
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC` y `Wav2Vec2Processor`; decodificación con LM mediante `pyctcdecode`. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama (no aplicables a un modelo CTC de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER test-clean (greedy) | WER test-other (greedy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kumargulshan/wav2vec2-base-ls960-noise-robust | 94,4 M | no disponible | 4,63 % | 9,95 % | Apache-2.0 | Hugging Face |
| facebook/wav2vec2-base-960h | ≈ 95 M | no disponible | no disponible en la información | no disponible en la información | Apache-2.0 | Hugging Face |
| kumargulshan/wav2vec2-base-ls460-noise-aug (B460) | ≈ 95 M | no disponible | no disponible en la información | no disponible en la información | Apache-2.0 | Hugging Face |
| kumargulshan/wav2vec2-base-ls100-clean (A_clean) | ≈ 95 M | no disponible | no disponible en la información | no disponible en la información | Apache-2.0 | Hugging Face |

Los checkpoints B460 y A_clean pertenecen al mismo estudio y comparten arquitectura y licencia; sin embargo, la información proporcionada no incluye sus cifras de WER, por lo que no es posible una comparación numérica directa. El modelo aquí descrito se presenta como el mejor modelo individual del estudio.

## Limitaciones y advertencias
- Solo transcribe inglés de audiolibros (LibriSpeech); el habla conversacional, con acentos marcados o de campo lejano no ha sido evaluada.
- El ruido del entrenamiento es sintético; no se evaluaron grabaciones con hablantes solapados (cocktail party).
- El ruido de banda ancha a SNR muy baja (≤ 0 dB) sigue siendo difícil: el WER con ruido blanco a 0–5 dB alcanza el 23,39 % en greedy.
- La salida no incluye puntuación ni distinción de mayúsculas y minúsculas; todo va en mayúsculas.
- Riesgo de alucinación y errores de sustitución en palabras poco frecuentes, propio de los modelos CTC sin LM; el uso del LM de 4 gramos mitiga parcialmente este problema.
- Sesgos no documentados por el autor: al entrenar solo con LibriSpeech (audiolibros en inglés), el rendimiento puede degradarse con voces no representadas en ese corpus.
- Licencia Apache-2.0, que permite uso comercial; los datos de entrenamiento son LibriSpeech (CC BY 4.0) y MUSAN, cuyas condiciones deben respetarse.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kumargulshan/wav2vec2-base-ls960-noise-robust
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Checkpoint de la misma semilla (ensemble): https://huggingface.co/kumargulshan/wav2vec2-base-ls960-noise-robust-seed7
- Etapa 1 (B460): https://huggingface.co/kumargulshan/wav2vec2-base-ls460-noise-aug
- Modelo B (100 h con ruido): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug
- Modelo B2 (lr 1e-4): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug-lr1e-4
- Modelo A (100 h limpio): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-clean
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
