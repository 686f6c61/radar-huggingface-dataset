# jingjingji007/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de voz y audio offline desarrollado por NVIDIA, publicado en Hugging Face por el usuario jingjingji007. Se trata de un Speech-Augmented Language Model (SALM) diseñado para transcripción multilingüe en 40 idiomas, traducción de voz, transcripción contextual, diarización de hablantes, predicción de marcas temporales, identificación de idioma y respuesta a preguntas sobre audio. El modelo procesa grabaciones de hasta una hora de duración con una ventana de contexto de 65.536 tokens.

Arquitectura híbrida Mamba-2–Transformer con mezcla de expertos (MoE) y un codificador paralelo de expertos que combina un encoder ASR Transformer y un encoder de hablante. Cuenta con 33.697.781.029 parámetros totales según los pesos en safetensors, de los cuales aproximadamente 4.300 millones están activos (incluyendo el encoder de audio). Se distribuye en precisión BF16, con variantes FP8 y NVFP4 disponibles en el repositorio oficial de NVIDIA.

El modelo deriva de nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 y está pensado para uso comercial y no comercial bajo licencia OpenMDW-1.1. Su relevancia radica en combinar un contexto muy largo (65.536 tokens), soporte para audio de formato largo y capacidades de instrucción en lenguaje natural sobre la tarea de transcripción, lo que permite controlar el estilo de salida mediante prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2–Transformer hybrid Mixture of Experts (MoE) con Parallel Expert Encoder (Transformer ASR encoder y speaker encoder) |
| Parametros totales | 33.697.781.029 (≈34B, incluyendo el encoder de audio) |
| Parametros activos | ≈4.3B (incluyendo el encoder de audio) |
| Longitud de contexto | 65.536 tokens; grabaciones de hasta 1 hora |
| Tipos de cuantizacion | BF16 (referencia), FP8 y NVFP4 (variantes oficiales publicadas) |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors (librería nemo) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina capas Mamba-2 con capas Transformer en un esquema de mezcla de expertos (MoE), lo que permite activar únicamente unos 4.300 millones de parámetros de los 34.000 millones totales en cada paso de inferencia. Sobre esta base se acopla un Parallel Expert Encoder compuesto por un encoder ASR de tipo Transformer y un encoder de hablante, que procesan la señal de audio de forma paralela antes de inyectarla en el modelo de lenguaje. Esta combinación está descrita en el informe técnico de NVIDIA y se enmarca en el paradigma SALM (Speech-Augmented Language Model).

El entrenamiento se realizó sobre el dataset nvidia/Granary-v2, e incluye una mezcla de tareas que abarca transcripción multilingüe, traducción de voz, transcripción contextual, transcripción con atribución de hablante, transcripción enriquecida, predicción de marcas temporales, identificación de idioma y respuesta a preguntas sobre audio. Además, la mezcla incorpora una pequeña proporción de tareas de seguimiento de instrucciones textuales y de etiquetado/redacción de PII. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Transcripción de voz a texto multilingüe en 40 idiomas, con soporte para audio de formato largo de hasta una hora.
- Traducción de voz (speech translation) entre los idiomas soportados.
- Transcripción contextual: el modelo acepta contexto textual adicional para mejorar el reconocimiento de términos específicos.
- Transcripción con atribución de hablante (speaker-attributed transcription) y diarización.
- Transcripción enriquecida (rich transcription) con formato controlable mediante instrucciones en lenguaje natural.
- Predicción de marcas temporales (timestamps) a nivel de segmento o palabra.
- Identificación de idioma (language identification) y soporte de code-switching.
- Respuesta a preguntas sobre audio (audio question answering).
- Seguimiento de instrucciones textuales en pequeña proporción, incluyendo tareas de etiquetado y redacción de PII.
- Procesamiento offline por lotes, no orientado a streaming en tiempo real según la información disponible.

## Casos de uso

- Transcripción de reuniones y actas corporativas: el modelo puede procesar grabaciones de hasta una hora con contexto de 65.536 tokens, generando transcripciones con atribución de hablante y marcas temporales, lo que facilita la generación automática de actas y la búsqueda posterior en el texto.
- Subtitulado y localización de contenido audiovisual: gracias a la predicción de timestamps y a la traducción de voz, se puede generar una pista de subtítulos en otro idioma a partir del audio original en una sola pasada.
- Análisis de llamadas de atención al cliente: la diarización y la transcripción contextual permiten separar agente y cliente, detectar términos del dominio y alimentar sistemas de análisis de calidad o de cumplimiento normativo.
- Investigación cualitativa y ciencias sociales: transcripción de entrevistas y grupos focales en múltiples idiomas con marcas temporales, lo que acelera el etiquetado y la codificación de material audiovisual.
- Archivística y digitalización de fondos sonoros: procesamiento por lotes de grabaciones históricas o de archivo de hasta una hora, con identificación de idioma y detección de cambios de lengua (code-switching) en grabaciones multilingües.
- Accesibilidad y documentación clínica: transcripción de consultas o sesiones con atribución de hablante y redacción de PII, útil en entornos donde se requiere anonimizar datos personales antes de su almacenamiento.
- Búsqueda y recuperación sobre audio: la combinación de transcripción con timestamps y respuesta a preguntas sobre audio permite indexar grabaciones y responder consultas directamente sobre su contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa, los pesos en BF16 ocupan aproximadamente 67,5 GB (tamaño del repositorio), por lo que la inferencia en BF16 requiere al menos esa cantidad de memoria, mientras que las variantes FP8 y NVFP4 reducen notablemente el requisito.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por el tamaño de los pesos en BF16, se requiere hardware de clase数据中心 (A100/H100) o GPUs con suficiente memoria para la variante cuantizada.
- Ajuste en GPU de consumo: no disponible. La variante NVFP4 podría reducir el requisito, pero no se confirma en la información proporcionada.
- Opciones de despliegue: NeMo Speech (librería nemo), SGLang-Omni (receta de servicio publicada) y transformers según los tags del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo de contexto cualitativo, se trata de un modelo de voz de código abierto con 34B parámetros totales y 4,3B activos, contexto de 65.536 tokens y soporte para 40 idiomas, lo que lo sitúa en la categoría de modelos SALM de formato largo; la comparación con alternativas concretas requeriría datos de rendimiento que no se han publicado en la información disponible.

## Limitaciones y advertencias

- No se han documentado en la información disponible sesgos específicos del modelo; al entrenarse sobre un dataset multilingüe amplio, es probable que herede sesgos presentes en los datos, pero no se detallan.
- Riesgo de alucinación inherente a los modelos de lenguaje: en tareas de transcripción, puede generar texto no presente en el audio, especialmente en segmentos con ruido o solapamiento de hablantes.
- El modelo está diseñado para procesamiento offline; no se indica soporte para streaming en tiempo real.
- Aunque soporta 40 idiomas, el rendimiento puede variar significativamente entre ellos; no se proporcionan métricas por idioma en la información disponible.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar sus términos completos antes de desplegar en producción.
- El tamaño del repositorio (67,5 GB) y los requisitos de memoria en BF16 limitan su despliegue a infraestructura con GPUs de gran capacidad.
- No se especifican en la información disponible los datos exactos de entrenamiento (número de tokens, composición detallada) ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jingjingji007/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Modelo oficial BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Variante FP8: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Repositorio NeMo Speech: https://github.com/NVIDIA-NeMo/Speech
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en vivo: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Receta SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Paper SALM: https://arxiv.org/abs/2310.09424
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
