# Microguy1/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DUPLI

## Resumen

NVIDIA Nemotron-3.5-Transcribe-30B-A4B es un modelo de lenguaje aumentado con voz (Speech-Augmented Language Model, SALM) desarrollado por NVIDIA para transcripción y comprensión de audio. Se trata de un modelo offline que procesa grabaciones junto con instrucciones de texto y contexto opcional, generando respuestas textuales. Cubre transcripción multilingüe en 40 idiomas, traducción de voz, transcripción con atribución de hablante, diarización, predicción de marcas temporales, identificación de idioma y respuesta a preguntas sobre audio.

La arquitectura combina un codificador de audio paralelo (encoder Transformer ASR y encoder de hablante) con un modelo de lenguaje híbrido Mamba-2–Transformer con mezcla de expertos (MoE). Cuenta con 34B parámetros totales y aproximadamente 4,3B activos, incluyendo el codificador de audio. Su contexto de 65.536 tokens permite procesar grabaciones de hasta una hora de duración.

Esta ficha corresponde a la réplica publicada por el usuario Microguy1 bajo el identificador `Microguy1/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DUPLI`, derivada del modelo original `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`. La relevancia del modelo radica en su combinación de contexto largo, eficiencia MoE y cobertura multilingüe amplia para tareas de voz en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2–Transformer híbrido con mezcla de expertos (MoE) y encoder de audio paralelo (Transformer ASR + encoder de hablante) |
| Parametros totales | 34B (33.697.781.029 según safetensors) |
| Parametros activos | ~4,3B (incluyendo el encoder de audio) |
| Longitud de contexto | 65.536 tokens; grabaciones de hasta 1 hora |
| Tipos de cuantizacion | BF16 (referencia), FP8 y NVFP4 (variantes oficiales publicadas por NVIDIA) |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors (librería nemo) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida Mamba-2–Transformer con mezcla de expertos como núcleo del modelo de lenguaje, acoplada a un encoder de audio paralelo que combina un encoder Transformer para ASR y un encoder específico de hablante. Esta combinación permite procesar audio y texto de forma conjunta, habilitando tareas que requieren tanto comprensión acústica como razonamiento textual. La activación de aproximadamente 4,3B parámetros sobre 34B totales reduce el coste computacional en inferencia manteniendo la capacidad del modelo completo.

El entrenamiento se realizó sobre el dataset `nvidia/Granary-v2`, con una mezcla que incluye tareas de transcripción multilingüe, traducción de voz, transcripción contextual, atribución de hablante, transcripción enriquecida, predicción de marcas temporales, identificación de idioma y respuesta a preguntas sobre audio. La mezcla incorpora además una pequeña proporción de instrucciones textuales y tareas de etiquetado y redacción de PII (información personal identificable). El modelo se distribuye en BF16 como referencia, con variantes oficiales en FP8 y NVFP4. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni detalles sobre etapas de RLHF o DPO.

## Capacidades

- Transcripción multilingüe en 40 idiomas con soporte de audio de hasta una hora de duración.
- Traducción de voz (speech translation) entre idiomas soportados.
- Transcripción con atribución de hablante y diarización (speaker diarization).
- Transcripción enriquecida con predicción de marcas temporales (timestamps).
- Identificación de idioma (language identification) y manejo de code-switching.
- Respuesta a preguntas sobre audio (audio question answering).
- Seguimiento de instrucciones para controlar el estilo y formato de la transcripción.
- Etiquetado y redacción de información personal identificable (PII).
- Seguimiento de instrucciones textuales en pequeña proporción.
- Procesamiento offline de grabaciones completas gracias al contexto de 65.536 tokens.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa grabaciones de hasta una hora con marcas temporales y atribución de hablante, generando actas estructuradas con identificación de cada interviniente.
- Subtitulado y traducción de contenido audiovisual: permite transcribir en un idioma y traducir a otro dentro de los 40 idiomas soportados, útil para plataformas de vídeo y localización.
- Atención al cliente y análisis de llamadas: la diarización y el etiquetado de PII permiten procesar grabaciones de call centers, redactar datos sensibles y analizar conversaciones multi-turno.
- Investigación cualitativa y entrevistas: transcripción enriquecida con timestamps y hablantes para estudios académicos y análisis de entrevistas en múltiples idiomas.
- Accesibilidad y documentación clínica: transcripción de consultas y notas de voz con redacción de PII, adecuada para entornos con requisitos de privacidad donde el procesamiento offline es preferible.
- Búsqueda y recuperación sobre archivos de audio: la respuesta a preguntas sobre audio permite indexar y consultar grabaciones largas sin transcripción manual previa.
- Cumplimiento y auditoría: identificación de idioma y code-switching para verificar contenido multilingüe en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en BF16 ocupa aproximadamente 67,5 GB (tamaño del repositorio), por lo que requiere GPUs con al menos 80 GB de memoria para cargar los pesos completos sin cuantizar. Las variantes FP8 y NVFP4 reducen el requisito aproximadamente a la mitad y a un cuarto, respectivamente.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB y H200 para BF16; GPUs con soporte de FP8 (H100, H200, L40S) o NVFP4 (Blackwell) para las variantes cuantizadas.
- En GPUs de consumo: el modelo completo no cabe en GPUs de consumo típicas (RTX 4090 con 24 GB) en BF16; las variantes NVFP4 podrían ser viables en GPUs Blackwell de gama alta, aunque no se confirma en la información disponible.
- Opciones de despliegue: NeMo Speech (librería nativa), SGLang-Omni (según la documentación enlazada), y el espacio de demostración de Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Transcribe-30B-A4B | 34B totales / ~4,3B activos | 65.536 tokens | 40 | OpenMDW-1.1 | Pesos abiertos (BF16, FP8, NVFP4) |
| Whisper large-v3 (OpenAI) | ~1,55B | 30 s por ventana | ~99 | MIT | Pesos abiertos |
| SeamlessM4T v2 (Meta) | ~2,3B | no disponible | ~100 | CC-BY-NC 4.0 | Pesos abiertos (no comercial) |

La comparativa se limita a alternativas de la misma categoría (ASR multilingüe). No se dispone de datos de benchmarks que permitan comparar rendimiento numérico entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es offline: no está diseñado para transcripción en streaming en tiempo real.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar sus términos completos antes de desplegarlo en producción.
- Esta réplica (`Microguy1/...-DUPLI`) no es la publicación oficial de NVIDIA; para producción se recomienda usar el repositorio oficial `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`.
- Riesgo de alucinación en transcripciones de audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento.
- La cobertura de 40 idiomas no garantiza el mismo rendimiento en todos ellos; los idiomas con menos datos pueden presentar mayor tasa de error.
- El etiquetado de PII puede tener falsos negativos y no debe considerarse una garantía de anonimización completa.
- El tamaño del repositorio (67,5 GB) y los requisitos de VRAM limitan su despliegue en infraestructura modesta.
- No se dispone de información sobre sesgos específicos ni sobre evaluaciones de robustez en la documentación proporcionada.

## Enlaces

- Repositorio de la réplica: https://huggingface.co/Microguy1/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DUPLI
- Modelo original BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Variante FP8: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- NeMo Speech (GitHub): https://github.com/NVIDIA-NeMo/Speech
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Guía SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Paper SALM (arXiv 2310.09424): https://arxiv.org/abs/2310.09424
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
