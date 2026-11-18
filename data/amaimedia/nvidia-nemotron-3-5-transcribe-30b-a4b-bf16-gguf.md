# AMAImedia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-BF16-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de voz y audio de pesos abiertos desarrollado por NVIDIA, distribuido en este repositorio por AMAImedia en formato GGUF. Se trata de un modelo de lenguaje de voz (speech LLM) especializado en transcripción automática (ASR), traducción de voz, diarización de hablantes e identificación de idioma, con soporte para 40 idiomas y grabaciones de hasta una hora de duración. Forma parte de la familia Nemotron 3.5 y se apoya en el modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B.

La arquitectura es un transformer híbrido de mezcla de expertos (MoE) que activa aproximadamente 4.300 millones de parámetros por token, incluyendo el codificador de audio, sobre un total de 33.697.781.029 parámetros según los pesos en safetensors. El modelo se publica originalmente en BF16, FP8 y NVFP4, y esta ficha corresponde a la conversión GGUF con cuantización por imatrix realizada por AMAImedia.

Su relevancia actual radica en que combina ventana de contexto de 65.536 tokens, soporte de audio de formato largo, diarización y traducción de voz en un único modelo instruible mediante prompts, lo que permite sustituir pipelines de varios componentes por un solo modelo con pesos abiertos y licencia OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE) y codificador de audio (nemo_speechlm) |
| Parametros totales | 33.697.781.029 |
| Parametros activos | Aproximadamente 4.300 millones por token, incluido el codificador de audio |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | BF16 (original), FP8 y NVFP4 (originales de NVIDIA); GGUF con imatrix en este repositorio (niveles no detallados en la informacion disponible) |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors y GGUF (repositorio de 91,7 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer híbrido con mezcla de expertos: de los 33.700 millones de parámetros totales, solo unos 4.300 millones se activan por token, incluyendo el codificador de audio. Esta proporción permite un coste de inferencia muy inferior al de un modelo denso del mismo tamaño nominal. El modelo integra un codificador de audio dentro del propio speech LLM, de modo que la transcripción, la traducción, la diarización y la respuesta a preguntas sobre audio se resuelven con un único modelo instruible mediante prompts en lugar de con una cascada de módulos.

El entrenamiento se apoya en el dataset nvidia/Granary-v2, según los metadatos del repositorio. La model card menciona una precisión de referencia en BF16, FP8 y NVFP4, y remite al informe técnico de NVIDIA para los detalles de composición del corpus y del proceso de ajuste. No se dispone en la informacion proporcionada de datos concretos sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO. La conversión a GGUF de este repositorio emplea cuantización con matriz de importancia (imatrix), una técnica que calibra la pérdida de precisión por capa para preservar la calidad en los niveles bajos de bits.

## Capacidades

- Transcripción automática de voz (ASR) en 40 idiomas, con soporte de audio de formato largo de hasta una hora por grabación.
- Traducción de voz (speech translation) entre idiomas.
- Diarización de hablantes, es decir, atribución de segmentos a distintos interlocutores.
- Generación de marcas temporales (timestamps) sobre la transcripción.
- Identificación de idioma (language identification) y manejo de cambio de código (code-switching) dentro de una misma grabación.
- Respuesta a preguntas sobre audio (audio question answering).
- Seguimiento de instrucciones para controlar el estilo y el formato de la salida de transcripción.
- Capacidad conversacional y de generación texto-a-texto según la etiqueta del pipeline.
- Integración con el ecosistema NeMo Speech y con SGLang-Omni para servicio en producción.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar grabaciones de hasta una hora en una sola pasada gracias a su contexto de 65.536 tokens, con marcas temporales y diarización para separar a los participantes y generar actas estructuradas.
- Subtitulado y doblaje multilingüe: la combinación de traducción de voz, marcas temporales e identificación de idioma permite generar subtítulos traducidos en un solo paso, lo que encaja con plataformas de doblaje automatizado como la que motiva la publicación de este repositorio.
- Atención al cliente y análisis de llamadas: la diarización y la transcripción con marcas temporales permiten separar agente y cliente, medir tiempos de intervención y alimentar sistemas de control de calidad o de análisis de sentimiento sobre texto.
- Documentación clínica o legal dictada: el soporte de audio de formato largo y el seguimiento de instrucciones permiten fijar el formato de salida (por ejemplo, con puntuación y estructura de informe) y transcribir sesiones completas sin fragmentar el audio.
- Investigación en lingüística y análisis de corpus: los 40 idiomas cubiertos y el manejo de code-switching facilitan la transcripción de grabaciones multilingües y de habla espontánea con cambios de idioma, un escenario habitual en corpus reales.
- Búsqueda y recuperación sobre archivos de audio: la transcripción con marcas temporales permite indexar podcasts, clases o archivos de medios y enlazar cada fragmento de texto con su minuto exacto en el audio.
- Asistentes de voz con comprensión de audio: la capacidad de audio question answering permite construir asistentes que respondan preguntas sobre el contenido de una grabación sin transcribirla por completo antes de responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe técnico de NVIDIA y a la sección "Results at a Glance", pero los valores numéricos no se incluyen en los datos proporcionados, por lo que no se reproducen aquí.

## Requisitos de hardware

- El repositorio GGUF ocupa 91,7 GB, lo que corresponde a varias cuantizaciones del modelo de 33.700 millones de parámetros. El tamaño exacto de cada nivel de cuantización no se detalla en la informacion disponible.
- Para inferencia en BF16 se necesitan aproximadamente 67 GB solo para los pesos, además del estado de activaciones y caché KV; en la práctica esto exige GPU de 80 GB (A100, H100) o reparto multi-GPU.
- Con cuantizaciones GGUF de 4 a 8 bits, el modelo puede ejecutarse en configuraciones de 24 a 48 GB de VRAM, lo que incluye una RTX 4090 (24 GB) en los niveles más agresivos y GPUs profesionales como A6000 o L40S en niveles intermedios.
- No cabe en GPUs de consumo de 8 a 16 GB en ninguno de los niveles de cuantización habituales, dado el tamaño total de parámetros.
- Despliegue previsto: NeMo Speech para ajuste fino y servicio, SGLang-Omni según la model card, y llama.cpp u Ollama para los ficheros GGUF de este repositorio. vLLM y TGI no aparecen mencionados en la informacion disponible para este modelo.
- No se dispone de datos de latencia ni de throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B (este) | 33,7B totales, ~4,3B activos | 65.536 tokens | 40 | OpenMDW-1.1 | safetensors, GGUF, FP8, NVFP4 |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B (modelo base) | 30B clase, ~3B activos | no disponible | no disponible | no disponible | BF16 |
| Whisper large-v3 | no disponible | 30 s por ventana (ventana fija) | ~99 | MIT | safetensors, GGUF |
| Alternativas ASR de pesos abiertos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Whisper large-v3 se incluye por categoría de tarea, no por arquitectura: Whisper es un modelo denso con ventanas de 30 segundos, mientras que este modelo aborda audio de hasta una hora mediante contexto de 65.536 tokens y añade diarización y traducción de voz. No se dispone de datos de benchmarks que permitan comparar rendimiento numérico entre ambos.

## Limitaciones y advertencias

- No se han publicado en la informacion disponible datos sobre sesgos demográficos, acústicos o lingüísticos del modelo; conviene evaluarlo en el dominio concreto antes de producción.
- Riesgo de alucinación inherente a los modelos generativos: en pasajes con ruido, solapamiento de hablantes o audio de baja calidad, la transcripción puede contener texto inventado o atribuciones de hablante incorrectas.
- La cobertura de 40 idiomas no implica calidad homogénea; los idiomas con menos presencia en el corpus de entrenamiento pueden degradarse.
- El contexto de 65.536 tokens impone un límite práctico de una hora de audio por pasada; grabaciones más largas requieren segmentación y pueden perder coherencia entre fragmentos.
- La licencia OpenMDW-1.1 incluye condiciones específicas que deben revisarse antes de uso comercial; no es una licencia permisiva tipo MIT o Apache 2.0.
- Este repositorio es una conversión GGUF de terceros (AMAImedia) sobre el modelo de NVIDIA; los niveles de cuantización pueden introducir pérdida de precisión respecto a los pesos originales en BF16, FP8 o NVFP4.
- El repositorio incluye contenido promocional y solicitudes de donación del autor de la conversión, ajenos al modelo original de NVIDIA.
- No se dispone de información sobre latencia, throughput ni requisitos exactos de memoria por nivel de cuantización en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMAImedia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-BF16-GGUF
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Modelo Lightning base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Conversión GGUF de referencia: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- NeMo Speech (GitHub): https://github.com/NVIDIA-NeMo/Speech
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en vivo: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Guía de servicio con SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Organización AMAImedia: https://www.amaimedia.com
