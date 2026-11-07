# rodrigomt/LFM3-Omni-2B-heretic

## Resumen

LFM3-Omni-2B-heretic es una versión modificada del modelo multimodal LFM3-Omni-2B de Liquid AI, publicada por el usuario rodrigomt en Hugging Face. Se trata de un checkpoint al que se le ha practicado una ablación de rechazo (refusal ablation) mediante una adaptación de la herramienta Heretic v1.2.0, con el objetivo de eliminar los comportamientos de negativa del modelo base sin degradar sus capacidades de visión, audio y clonación de voz. El modelo conserva la arquitectura original any-to-any: un único modelo end-to-end que entiende texto, imágenes, vídeo y audio, y responde en texto, habla o una mezcla intercalada de ambos.

El modelo base LFM3-Omni-2B es el primer modelo ómnium de Liquid AI, diseñado para uso en dispositivo (edge), sustituyendo a la vez un modelo ASR, un modelo visión-lenguaje, un LLM y un modelo TTS. No es un modelo de razonamiento (non-reasoning). Cuenta con 2.166.928.384 parámetros en BF16 y soporta 23 idiomas. La versión heretic mantiene intactos los tensores del codificador de visión, el codificador de audio causal, los proyectores multimodales, el decodificador de profundidad y el códec de audio Liquid a 24 kHz.

La relevancia de esta ficha radica en que documenta una modificación no oficial de un modelo de pesos abiertos con licencia restrictiva, orientada a eliminar el comportamiento de rechazo. Es importante señalar que el modelo base tiene licencia LFM1.0 (lfm1.0), lo que impone condiciones específicas para uso comercial y que la modificación heretic no está avalada por Liquid AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida convolución + atención (familia LFM3), multimodal any-to-any con codificador de visión, codificador de audio causal, decodificador de profundidad y códec de audio Liquid a 24 kHz |
| Parámetros totales | 2.166.928.384 (2,17B) en BF16 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors BF16; no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (licencia "other" según metadatos de HF) |
| Formato de pesos | safetensors (BF16), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B emplea una arquitectura híbrida que combina capas de convolución y capas de atención, característica de la familia LFM3 de Liquid AI. Es un modelo any-to-any end-to-end que integra en un único conjunto de pesos la comprensión de texto, imagen, vídeo y audio, así como la generación de texto y habla. Incluye un codificador de visión, un codificador de audio causal, proyectores multimodales, un decodificador de profundidad y un códec de audio Liquid que opera a 24 kHz. No es un modelo de razonamiento.

La modificación heretic se realizó con una build adaptada de Heretic v1.2.0 que soporta arquitecturas híbridas de convolución y atención. La búsqueda de hiperparámetros se llevó a cabo con Optuna (200 trials), seleccionándose el trial 169 con `--row-normalization full`. Solo se alteraron 35 de los 665 tensores, concretamente las matrices que escriben en el stream residual del modelo de lenguaje (`o_proj`, `out_proj` y `w2` en `model.language_model.layers.*`). Los 630 tensores restantes (visión, audio, códec, decodificador de profundidad y embeddings) son byte-idénticos al release oficial, con coincidencia de `sha256`. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF/DPO.

## Capacidades

- Generación de texto y conversación multi-turno.
- Comprensión de imágenes y vídeo (image-text-to-text, any-to-any).
- Reconocimiento automático del habla (ASR, speech-to-text).
- Síntesis de voz (TTS) a 24 kHz.
- Clonación de voz zero-shot mediante continuación de voz.
- Salida intercalada de texto y habla (speech-to-speech).
- Capacidades multilingües en 23 idiomas: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr.
- Comportamiento de rechazo ablacionado (uncensored): tasa de rechazo de 3/100 en la suite de evaluación según el autor.
- No es un modelo de razonamiento (non-reasoning).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente de voz en dispositivo (edge): el modelo integra ASR, LLM y TTS en un único checkpoint de 2,17B, lo que permite desplegar un asistente conversacional por voz en hardware con recursos limitados sin encadenar varios modelos.
- Transcripción de audio (ASR): se puede usar para convertir voz a texto en inglés u otros de los 23 idiomas soportados mediante el modo de generación correspondiente, con el codificador de audio intacto respecto al modelo base.
- Síntesis de voz (TTS) a 24 kHz: generación de audio de alta calidad a partir de texto, con control de voz mediante el mensaje de sistema (por ejemplo, voz femenina en inglés americano) y parámetros de temperatura y penalización de repetición de audio.
- Clonación de voz zero-shot: continuación de una muestra de voz para generar habla con la misma identidad vocal, útil en doblaje, audiolibros o accesibilidad, aunque con implicaciones éticas y legales que deben evaluarse.
- Descripción de imágenes y vídeo: el codificador de visión permite tareas de image-text-to-text, como subtitulado automático, descripción de escenas o respuesta a preguntas visuales.
- Conversación multimodal intercalada: aplicaciones que requieren alternar texto y habla en la misma respuesta, como tutores interactivos o interfaces conversacionales manos libres.
- Investigación sobre alineación y ablación: el checkpoint sirve como caso de estudio para medir el efecto de eliminar el comportamiento de rechazo con una divergencia KL de 0,0231 respecto al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas del proceso de ablación: tasa de rechazo de 3/100 en la suite de evaluación, divergencia KL de 0,0231 respecto al modelo base, 35/665 tensores alterados y 630/665 tensores intactos con coincidencia `sha256`. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de benchmarks de audio o visión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,17B parámetros en BF16 los pesos ocupan aproximadamente 4,3 GB, a lo que hay que sumar el códec de audio, el codificador de visión y las activaciones.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM, aunque no se confirma oficialmente.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs con 8 GB o más de VRAM en BF16, pero este dato no está confirmado en la información disponible.
- Opciones de despliegue: `transformers` (>= 4.57) con `trust_remote_code=True`, junto con `torch`, `soundfile` y `accelerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-heretic (este) | 2,17B | no disponible | texto, imagen, vídeo, audio (ASR/TTS/clonación) | lfm1.0 | Ablación de rechazo no oficial; 23 idiomas |
| LiquidAI/LFM3-Omni-2B | 2,17B | no disponible | texto, imagen, vídeo, audio | lfm1.0 | Modelo base oficial de Liquid AI; non-reasoning |
| Otros modelos any-to-any de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo no oficial: es una modificación de terceros (rodrigomt) no avalada por Liquid AI; el soporte y la garantía de calidad recaen en el autor de la modificación.
- Licencia LFM1.0: impone condiciones específicas para uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue en producción.
- Ablación de rechazo: eliminar el comportamiento de negativa reduce las salvaguardas del modelo base, lo que aumenta el riesgo de generar contenido inapropiado, dañino o ilegal. No debe desplegarse en aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de fidelidad factual para este checkpoint; el modelo base es non-reasoning.
- Clonación de voz: la capacidad de clonación zero-shot plantea riesgos de suplantación de identidad y requiere consentimiento explícito y cumplimiento normativo.
- Longitud de contexto: no disponible; no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Idiomas: aunque se listan 23 idiomas, no se dispone de métricas de calidad por idioma; el rendimiento puede variar.
- Requiere código personalizado (`trust_remote_code=True`), lo que implica ejecutar código del repositorio y revisar su procedencia.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento en tareas estándar para este checkpoint concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rodrigomt/LFM3-Omni-2B-heretic
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentación de Liquid AI sobre LFM3-Omni-2B: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
