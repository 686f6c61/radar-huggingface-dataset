# Hapnoid/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-backup

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de lenguaje aumentado con voz (Speech-Augmented Language Model, SALM) desarrollado por NVIDIA para transcripción y comprensión de audio multilingüe. Convierte grabaciones de audio, junto con instrucciones de texto y contexto opcional, en respuestas de texto: transcripción literal, traducción de voz, transcripción con atribución de hablante, marcas de tiempo, identificación de idioma y respuesta a preguntas sobre audio. El repositorio aquí descrito es un backup subido por el usuario Hapnoid del modelo oficial de NVIDIA.

La arquitectura es un híbrido Mamba-2–Transformer con mezcla de expertos (MoE) y un codificador paralelo de expertos (encoder Transformer de ASR más encoder de hablante). Tiene 34B parámetros totales con aproximadamente 4,3B activos, incluyendo el encoder de audio, y una longitud de contexto de 65.536 tokens que permite procesar grabaciones de hasta una hora. Se distribuye en BF16, FP8 y NVFP4.

Su relevancia radica en unificar en un solo modelo de pesos abiertos tareas que tradicionalmente requerían pipelines separados (ASR, diarización, traducción de voz, detección de idioma), con soporte para 40 idiomas y licencia OpenMDW-1.1 que permite uso comercial. Está pensado para despliegue offline y entornos de producción que necesitan transcripción de audio de formato largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2–Transformer hybrid Mixture of Experts (MoE) con Parallel Expert Encoder (encoder Transformer ASR y encoder de hablante) |
| Parametros totales | 34B (33.697.781.029 según safetensors), incluyendo el encoder de audio |
| Parametros activos | ~4,3B |
| Longitud de contexto | 65.536 tokens; grabaciones de hasta 1 hora |
| Tipos de cuantizacion | BF16 (referencia), FP8 y NVFP4 (variantes oficiales publicadas) |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (openmdw.ai/license/1-1/), uso comercial y no comercial permitido |
| Formato de pesos | safetensors (librería NeMo); repo de 67,5 GB |

## Arquitectura y entrenamiento

El modelo es un SALM construido sobre un LLM híbrido Mamba-2–Transformer con mezcla de expertos. La parte de audio la aporta un Parallel Expert Encoder que combina un encoder Transformer de ASR con un encoder de hablante, lo que permite atribuir segmentos a locutores sin un pipeline de diarización externo. La activación dispersa de expertos mantiene el coste de inferencia en el orden de un modelo de ~4,3B de parámetros activos pese a los 34B totales.

El entrenamiento se realizó sobre el dataset nvidia/Granary-v2. La mezcla de entrenamiento cubre transcripción multilingüe, traducción de voz, transcripción contextual, transcripción con atribución de hablante, transcripción enriquecida, predicción de marcas de tiempo, identificación de idioma y respuesta a preguntas sobre audio, además de una pequeña proporción de seguimiento de instrucciones en texto y tareas de etiquetado y redacción de PII. La model card no detalla el número exacto de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO; esos datos figuran como no disponibles en la información proporcionada.

## Capacidades

- Transcripción multilingüe en 40 idiomas, con soporte de audio de formato largo de hasta una hora por pasada.
- Traducción de voz (speech translation) a texto.
- Transcripción contextual: acepta contexto textual para mejorar el reconocimiento de nombres propios y términos de dominio.
- Transcripción con atribución de hablante (speaker-attributed transcription) mediante el encoder de hablante integrado.
- Transcripción enriquecida y predicción de marcas de tiempo (timestamps).
- Identificación de idioma (language identification) y manejo de code-switching.
- Respuesta a preguntas sobre audio (audio question answering).
- Seguimiento de instrucciones en texto para controlar el estilo y el formato de la salida.
- Etiquetado y redacción de PII (tareas auxiliares incluidas en el entrenamiento).
- No se especifica en la información disponible soporte explícito de tool calling ni de razonamiento multi-paso orientado a agentes.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa grabaciones de hasta una hora con marcas de tiempo y atribución de hablante, lo que permite generar actas con turnos de palabra identificados sin un sistema de diarización separado.
- Subtitulado y localización de vídeo: la combinación de timestamps y traducción de voz permite generar subtítulos en otro idioma directamente desde el audio, reduciendo el pipeline a una sola llamada al modelo.
- Atención al cliente y análisis de llamadas: transcribir conversaciones telefónicas multilingües y extraer información estructurada; el etiquetado de PII del entrenamiento ayuda a redactar datos sensibles antes del almacenamiento.
- Documentación clínica o legal dictada: la transcripción contextual permite pasar un glosario de términos de dominio como contexto para mejorar la precisión en vocabulario especializado, y el contexto de 65.536 tokens admite sesiones largas.
- Investigación cualitativa y análisis de entrevistas: transcripción por lotes de entrevistas en varios idiomas con identificación de hablante, útil para estudios con participantes múltiples.
- Indexación y búsqueda de archivos de audio: convertir grandes volúmenes de audio en texto con marcas de tiempo para alimentar motores de búsqueda o sistemas RAG sobre contenido hablado.
- Accesibilidad: generación de transcripciones y subtítulos para contenido audiovisual en 40 idiomas, con despliegue offline cuando los datos no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia una sección de resultados y un informe técnico, pero los valores numéricos no se incluyen en los datos proporcionados, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 33,7B parámetros ocupan aproximadamente 67 GB de pesos, por lo que se necesita al menos una GPU de 80 GB (A100/H100) o reparto multi-GPU. La variante FP8 reduce los pesos a unos 34 GB, y NVFP4 a unos 17 GB, lo que rebaja sustancialmente los requisitos.
- GPU recomendadas: A100 80 GB, H100 80 GB y H200 para BF16; las variantes FP8 y NVFP4 permiten desplegar en GPUs con menos memoria, aunque la información disponible no detalla configuraciones mínimas verificadas.
- GPU de consumo: no se dispone de datos que confirmen que quepa en GPUs de consumo; con NVFP4 podría ser viable en tarjetas de 24 GB, pero no está verificado en la información proporcionada.
- Opciones de despliegue: NeMo Speech (librería nativa del modelo) y SGLang-Omni, según los enlaces de la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Transcribe-30B-A4B | 34B totales / ~4,3B activos | 65.536 tokens, audio de hasta 1 h | 40 | OpenMDW-1.1 | ASR, traducción de voz, diarización y QA de audio en un solo modelo |
| Whisper large-v3 (referencia de la categoría) | ~1,55B | 30 s por ventana | ~99 | MIT | Solo ASR y traducción; requiere pipeline externo para diarización y audio largo |
| Alternativas SALM de código abierto | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación con Whisper se ofrece como referencia de categoría; los datos de Whisper no provienen de la información proporcionada y deben contrastarse antes de su uso en producción.

## Limitaciones y advertencias

- Modelo offline: procesa grabaciones completas, no está diseñado para streaming en tiempo real según la descripción disponible.
- Riesgo de alucinación en pasajes de audio con ruido, solapamiento de hablantes o vocabulario muy especializado; conviene validar las salidas en dominios críticos.
- La cobertura de 40 idiomas no implica el mismo rendimiento en todos ellos; la model card no aporta métricas por idioma en la información disponible.
- El etiquetado y la redacción de PII son tareas auxiliares del entrenamiento y no deben tratarse como garantía de anonimización completa.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar sus términos completos antes de desplegar en producción.
- Este repositorio es un backup subido por un tercero (Hapnoid), no el repositorio oficial de NVIDIA; para producción debe usarse el repositorio oficial nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada.

## Enlaces

- Repositorio de este backup: https://huggingface.co/Hapnoid/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-backup
- Modelo oficial BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Variante FP8: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- NeMo Speech (fine-tuning y serving): https://github.com/NVIDIA-NeMo/Speech
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en vivo: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Guía SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Paper SALM (arXiv:2310.09424): https://arxiv.org/abs/2310.09424
