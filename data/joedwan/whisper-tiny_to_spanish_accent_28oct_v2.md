# JoeDwan/whisper-tiny_to_spanish_accent_28oct_v2

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla `openai/whisper-tiny` publicado por el usuario JoeDwan en Hugging Face. El objetivo declarado del autor es adaptar el modelo base, entrenado originalmente por OpenAI sobre un corpus masivo y multilingüe, a un conjunto de datos propio denominado "Spanish English" para mejorar el reconocimiento de acentos del español. El modelo se distribuye bajo licencia Apache 2.0 y con pesos en formato safetensors, lo que facilita su integración en pipelines existentes de `transformers`.

Se trata de un modelo encoder-decoder de tipo transformer con 37.760.640 parámetros, la variante más pequeña de la familia Whisper. Su relevancia práctica es limitada pero específica: ofrece una alternativa ligera (3,2 GB de repositorio, aunque los pesos reales ocupan aproximadamente 150 MB en fp32) para tareas de transcripción en entornos con recursos muy restringidos, como dispositivos de borde o prototipos rápidos. No obstante, la información publicada por el autor es escasa: la model card está generada automáticamente y contiene secciones sin completar.

El modelo declara un WER de 11,29 sobre el split de test del dataset "Spanish English", un resultado que debe interpretarse con cautela porque el autor no verifica la métrica (`verified: false`) y no se documenta la composición exacta del conjunto de evaluación. A pesar del nombre, la model card etiqueta el idioma como `en`, lo que genera ambigüedad sobre el alcance real del ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 37.760.640 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización dinámica de PyTorch, aunque no documentada por el autor) |
| Idiomas soportados | `en` según la model card; el nombre y el dataset sugieren español, pero no se documenta oficialmente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper original: un encoder transformer que procesa espectrogramas Mel de 80 canales y un decoder autorregresivo que genera tokens de texto. Whisper-tiny consta de 4 capas en encoder y 4 en decoder, con una dimensión oculta de 384 y 6 cabezas de atención. El modelo base fue entrenado por OpenAI con 680.000 horas de audio supervisado débilmente y 117.000 horas de audio etiquetado, pero el ajuste fino aquí presentado solo modifica los pesos sobre un dataset propio no documentado.

El entrenamiento se realizó con el `Trainer` de Hugging Face durante 2.000 pasos (aproximadamente 1,95 épocas), con un batch size de 2, learning rate de 1e-5, optimizador AdamW con betas (0,9, 0,999), scheduler lineal con 500 pasos de warmup y semilla 42. La pérdida de validación final fue de 0,2460 y el WER de 11,2935. No se documenta el número de tokens de audio, la composición del dataset "Spanish English" ni si hubo técnicas de aumento de datos o regularización adicionales. No se menciona RLHF, DPO ni innovaciones técnicas destacables más allá del ajuste supervisado estándar.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés según la model card, aunque el propósito declarado es el español con acentos.
- Transcripción de audio de hasta 30 segundos por ventana, con la posibilidad de chunking para audios más largos mediante `pipeline` de `transformers`.
- Generación de texto a partir de audio (speech-to-text) con salida de transcripción literal.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidades multilingües limitadas al inglés declarado; el ajuste al español no está validado oficialmente.
- No dispone de modo "thinking", visión, audio generativo ni otras capacidades especiales.

## Casos de uso

- Prototipado rápido de transcripción en español: el modelo cabe en cualquier GPU consumer y permite validar pipelines de ASR antes de invertir en modelos mayores como Whisper large-v3.
- Transcripción en dispositivos de borde: con 37,7 M de parámetros, puede ejecutarse en CPU o en GPUs integradas para aplicaciones de dictado offline.
- Preprocesamiento de audio para pipelines de NLP: transcribir entrevistas o notas de voz cortas antes de pasarlas a un modelo de lenguaje para análisis posterior.
- Subtitulado automático de vídeos cortos: adecuado para clips de menos de 30 segundos donde la latencia importa más que la precisión absoluta.
- Investigación sobre adaptación de acentos: sirve como punto de partida para estudiar técnicas de fine-tuning sobre variantes dialectales del español, dado su bajo coste computacional.
- Evaluación comparativa de modelos ligeros: útil como baseline en experimentos que midan la relación entre tamaño de modelo y WER en dominios específicos.
- Sistemas de transcripción con requisitos estrictos de memoria: en entornos donde no es posible cargar modelos de más de 1 GB, esta variante ofrece una alternativa funcional.

## Benchmarks y rendimiento

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| Whisper tiny Spanish (JoeDwan) | Spanish English (split test) | WER | 11,2935 |
| Whisper tiny Spanish (JoeDwan) | Spanish English (validación, época 1) | WER | 12,7114 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato reportado es el WER sobre el dataset propietario del autor, sin comparación con el modelo base ni con otras variantes de Whisper.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 150 MB en fp32 (37,7 M de parámetros × 4 bytes), menos de 100 MB en fp16 y alrededor de 40-50 MB en cuantización int8.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas tarjetas.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, GTX 1650 o incluso iGPUs modernas.
- Opciones de despliegue: `transformers` (pipeline de ASR), `Optimum` para ONNX Runtime, `CTranslate2` para faster-whisper y `whisper.cpp` para inferencia en CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en la práctica, un modelo de este tamaño procesa audio en tiempo real o más rápido en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | Idiomas | Licencia | WER reportado |
|---|---|---|---|---|---|
| Whisper tiny Spanish (JoeDwan) | 37,7 M | 30 s | en (declarado) | Apache 2.0 | 11,29 (dataset propio) |
| openai/whisper-tiny | 37,7 M | 30 s | multilingüe (99 idiomas) | Apache 2.0 | no disponible en esta ficha |
| openai/whisper-base | 74 M | 30 s | multilingüe (99 idiomas) | Apache 2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | 30 s | multilingüe (99 idiomas) | Apache 2.0 | no disponible en esta ficha |

La comparación directa con el modelo base es difícil porque el autor no reporta el WER de `openai/whisper-tiny` sobre el mismo dataset "Spanish English". Sin esa referencia, no es posible determinar si el ajuste fino mejora o degrada el rendimiento respecto al original.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones "More information needed" sin completar, lo que impide conocer la composición del dataset, el dominio de audio y las condiciones de evaluación.
- El WER de 11,29 está marcado como `verified: false`; no ha sido validado de forma independiente.
- Existe una contradicción entre el nombre del modelo (que sugiere español) y el campo `language: en` de la model card; el alcance real del ajuste al español no está documentado.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto inventado en segmentos de silencio o ruido, especialmente en la variante tiny.
- Limitaciones de contexto: solo procesa ventanas de 30 segundos; audios más largos requieren chunking manual y pueden perder coherencia en los límites.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos del corpus de entrenamiento de OpenAI, que favorece variedades del inglés y puede tener bajo rendimiento en acentos no representados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la procedencia del dataset "Spanish English" ni sobre posibles restricciones de los datos de entrenamiento.
- Para producción en español se recomienda evaluar el modelo contra un conjunto de validación propio antes de desplegarlo, dado que no hay garantías de calidad fuera del dataset del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoeDwan/whisper-tiny_to_spanish_accent_28oct_v2
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentación de `transformers` para ASR: https://huggingface.co/docs/transformers/tasks/asr
