# GetmanY1/wav2vec2-base-12l-fi-471k-finetuned

## Resumen

El modelo `GetmanY1/wav2vec2-base-12l-fi-471k-finetuned` es un sistema de reconocimiento automático del habla (ASR) para finés, desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnología del habla de la Universidad Aalto (equipo de Mikko Kurimo). Se trata de un wav2vec 2.0 Base con encoder Transformer de 12 capas y 95 millones de parámetros, preentrenado de forma autosupervisada sobre 471.000 horas de audio en finés y posteriormente ajustado con CTC para transcripción. Forma parte de la familia de modelos publicada junto al artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL", que analiza el filtrado por confianza y distintas arquitecturas a gran escala.

El problema que aborda es la escasez de modelos ASR monolingües de alta calidad para finés, un idioma con recursos limitados en comparación con el inglés. El modelo se entrena sobre una mezcla heterogénea de fuentes: el archivo de radio y televisión de la Agencia Finlandesa de Arte y Cultura (KUVI, anteriormente KAVI), VoxPopuli en finés, el corpus del Parlamento finlandés y Lahjoita puhetta. El pipeline completo parte de 2,1 millones de horas de audio broadcast en bruto, a las que aplica detección de actividad vocal, deduplicación basada en transcripciones y filtrado por confianza del ASR (umbral τ = −0,10).

La relevancia actual del modelo radica en que demuestra que un Transformer de 12 capas, con el mismo número de parámetros que la línea base previa (95M), mejora el WER en dominios difíciles como el audio broadcast real (KAVI: 24,85 % frente a 27,45 %) y Common Voice (9,74 % frente a 10,61 %) gracias únicamente a un mejor preentrenamiento. Es un modelo ligero, con licencia Apache 2.0, orientado a despliegues de ASR en producción para finés donde el coste computacional importa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder Transformer de 12 capas (dimensión 768, feed-forward 3072) y encoder convolucional de características |
| Parametros totales | 94.397.858 (≈95M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio de entrada a 16 kHz; sin límite de contexto explícito documentado, condicionado por memoria) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch, pero no se documentan variantes oficiales) |
| Idiomas soportados | Finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint original en fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un wav2vec 2.0 Base estándar: un encoder convolucional que transforma la onda de audio en representaciones latentes y un encoder Transformer de 12 capas con dimensión de modelo 768 y dimensión feed-forward 3072, sumando aproximadamente 95 millones de parámetros. El preentrenamiento es autosupervisado (objetivo de wav2vec 2.0 con enmascaramiento y contraste), ejecutado durante 125.000 actualizaciones con learning rate 6e-4 sobre 512 GPUs, procesando unos 3 minutos de audio por GPU. Los datos de preentrenamiento son 471.000 horas de habla en finés procedentes de KUVI, VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta, tras aplicar VAD, deduplicación por transcripción y filtrado por confianza del ASR con τ = −0,10.

El ajuste fino se realiza con CTC sobre 4.600 horas de habla transcrita (Parlamento finlandés y Lahjoita puhetta) durante 16.000 actualizaciones en 128 GPUs, congelando el encoder convolucional de características y procesando unos 2,5 minutos de audio por GPU. La entrada es audio mono a 16 kHz con `do_normalize=False`. El modelo comparte pesos con `GetmanY1/wav2vec2-base-fi-conf010-filter-finetuned`, correspondiente al modelo τ = −0,10 del ablation de filtrado del artículo. El repositorio incluye además el checkpoint original de fairseq con su diccionario de caracteres (`fairseq/dict.ltr.txt`).

## Capacidades

- Reconocimiento automático del habla (ASR) en finés mediante decodificación CTC (greedy o con modelo de lenguaje externo).
- Transcripción de audio mono a 16 kHz, con salida a nivel de carácter.
- Robusto en dominios variados: habla parlamentaria, habla espontánea (Lahjoita puhetta), lectura (Common Voice) y audio broadcast real (KAVI).
- Manejo de audio de larga duración por segmentación (el modelo no impone un límite de contexto explícito; la longitud práctica depende de la memoria y del chunking).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico-a-texto.
- Capacidad monolingüe: no traduce ni transcribe otros idiomas de forma fiable.
- No incluye modo "thinking", visión ni audio de entrada más allá de la transcripción.

## Casos de uso

- Transcripción de archivos audiovisuales broadcast: el modelo está entrenado específicamente sobre audio de radio y televisión (KUVI/KAVI) y logra un WER del 24,85 % en ese dominio, por lo que es adecuado para digitalizar y buscar en archivos de medios públicos finlandeses.
- Subtitulado automático de contenido en finés: con 95M de parámetros y decodificación CTC, puede ejecutarse en tiempo real o casi real en GPU consumer, lo que lo hace viable para generar subtítulos en directo o en postproducción.
- Actas y transcripción parlamentaria: dado su ajuste fino sobre el corpus del Parlamento finlandés (WER del 10,72 % en FP'16 y 8,70 % en FP'20), es idóneo para transcribir sesiones legislativas y generar actas indexables.
- Investigación en ASR de bajos recursos: sirve como línea base reproducible (pesos, configs y código públicos en el repositorio de aalto-speech) para comparar arquitecturas Transformer, Conformer y E-Branchformer a escala de 95M de parámetros.
- Aplicaciones de accesibilidad: transcripción de audio a texto para personas con discapacidad auditiva en finés, con un modelo ligero que puede desplegarse en servidores modestos.
- Preprocesamiento de datasets de voz: al ser un modelo ASR rápido y ligero, puede usarse para pseudoetiquetar o filtrar grandes corpus de audio en finés antes de entrenar modelos mayores.
- Integración en asistentes de voz finlandeses: como componente ASR en un pipeline de voz a texto previo a un LLM, con licencia Apache 2.0 que permite uso comercial sin restricciones de atribución copyleft.

## Benchmarks y rendimiento

Resultados de WER (%) en test de los modelos Base ajustados (Tabla III del artículo). LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = audio broadcast real.

| Modelo | Params | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer 12 capas (línea base previa, 158K horas) | 95,0M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| **Transformer 12 capas (este modelo)** | 95,0M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| Transformer 18 capas | 95,1M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| Conformer 12 capas | 96,7M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| Conformer 17 capas | 96,5M | **18,50** | 9,83 | 7,94 | **5,69** | **10,56** | 22,71 |
| E-Branchformer 12 capas | 98,4M | 19,14 | 10,10 | **7,80** | 6,91 | 11,53 | 22,89 |
| E-Branchformer 17 capas | 96,6M | 18,80 | **9,54** | 7,85 | 6,19 | 11,09 | **22,44** |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 95M de parámetros (≈0,38 GB en fp32, ≈0,19 GB en fp16). Con buffers de activación y audio de entrada, la inferencia cabe holgadamente en 1-2 GB de VRAM en fp16.
- GPU recomendadas: cualquier GPU moderna sirve. Para producción de alto throughput, A100 o H100; para desarrollo o despliegue en edge, RTX 4090, RTX 3090, RTX 4060 Ti o incluso GPUs integradas.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050 y superiores. También puede ejecutarse en CPU para audio corto.
- Opciones de despliegue: transformers (`AutoModelForCTC` + `Wav2Vec2Processor`), fairseq (checkpoint original), y potencialmente ONNX Runtime o TorchScript para optimización. No se documenta soporte oficial en vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a LLMs, no a ASR CTC).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño (95M), se espera una latencia baja (del orden de decenas de milisegundos por segundo de audio en GPU), pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Params | Contexto/entrada | WER KAVI | WER CV | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Este modelo (Transformer 12L)** | 95,0M | Audio 16 kHz | 24,85 | 9,74 | Apache 2.0 | Hugging Face |
| Conformer 17L (misma familia) | 96,5M | Audio 16 kHz | 22,71 | 5,69 | Apache 2.0 (presumible, misma familia) | Hugging Face |
| E-Branchformer 17L (misma familia) | 96,6M | Audio 16 kHz | 22,44 | 6,19 | Apache 2.0 (presumible, misma familia) | Hugging Face |
| Transformer 12L línea base (158K h) | 95,0M | Audio 16 kHz | 27,45 | 10,61 | No disponible | No disponible |

Dentro de la misma familia, los modelos Conformer y E-Branchformer de 17 capas obtienen mejor WER (especialmente en Common Voice y Lahjoita puhetta), a costa de mayor complejidad arquitectónica. El Transformer de 12 capas destaca por su simplicidad y por ser el más ligero de la comparativa.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe finés; no es fiable con otros idiomas ni con mezcla de lenguas.
- Riesgo de alucinación en ASR: la decodificación CTC greedy puede producir caracteres espurios en audio con ruido, silencios largos o habla solapada; se recomienda usar un modelo de lenguaje externo para decodificación en producción.
- Sesgos de dominio: el preentrenamiento se basa en audio broadcast (radio y televisión) y corpus institucionales (Parlamento), por lo que puede rendir peor en habla coloquial, dialectos, acentos regionales o audio telefónico.
- Sin normalización de entrada: el modelo requiere `do_normalize=False`; aplicar normalización puede degradar el rendimiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no hay restricciones copyleft, pero se debe conservar el aviso de licencia.
- Caveat de producción: el modelo no incluye puntuación, mayúsculas ni segmentación de hablantes; requiere postprocesamiento para texto legible.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema limitado, sin validación comunitaria amplia fuera del artículo.
- No dispone de cuantizaciones oficiales publicadas (GGUF, AWQ, etc.), lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-12l-fi-471k-finetuned
- Modelo base (preentrenamiento): https://huggingface.co/GetmanY1/wav2vec2-base-12l-fi-471k
- Modelo con pesos idénticos (ablation de filtrado, τ = −0,10): https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf010-filter-finetuned
- Artículo: https://arxiv.org/abs/2610.13102
- Código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Perfil del autor (Yaroslav Getman): https://huggingface.co/GetmanY1
- LinkedIn del autor: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Tamás Grósz: https://huggingface.co/Grosy
- LinkedIn de Tamás Grósz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
