# Lugha-Models/omniASR-LLM-3B-kinyarwanda

## Resumen

omniASR-LLM-3B-kinyarwanda es un ajuste fino (fine-tune) del modelo `facebook/omniASR-LLM-3B` publicado por Lugha-Models, orientado exclusivamente al reconocimiento automático de voz (ASR) en kinyarwanda (`rw`). El modelo hereda la arquitectura híbrida wav2vec2-llama del modelo base de Meta: un codificador convolucional/transformer de voz acoplado a un decodificador de lenguaje de 3B parámetros, entrenado con el framework fairseq2. El resultado es un sistema de transcripción de audio a texto especializado en un idioma de bajos recursos, uno de los aproximadamente 1.600 que cubre la familia omnilingual-asr.

La relevancia de este checkpoint radica en su enfoque: en lugar de un modelo multilingüe genérico, se ofrece una variante afinada sobre datos específicos de kinyarwanda (Afrivoice Kinyarwanda y Common Voice 22.0), lo que en teoría mejora la precisión en un idioma con escasa representación en los corpus ASR habituales. El repositorio es de acceso restringido (gated) y, en el momento de la consulta, no registra descargas ni interacciones, lo que sugiere una publicación reciente y de baja difusión.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato fairseq2 (no safetensors ni GGUF estándar), y un tamaño de repositorio de 17,5 GB, coherente con un modelo de 3B parámetros en precisión completa o mixta. No se dispone de información publicada sobre benchmarks, composición exacta del dataset de ajuste ni detalles del proceso de entrenamiento más allá de las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-llama (codificador de voz + decodificador LLM, familia omniASR-LLM) |
| Parametros totales | 3B (según nombre del modelo base; desglose no disponible) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kinyarwanda (`rw`) |
| Licencia | Apache 2.0 |
| Formato de pesos | fairseq2 (repositorio de 17,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura omniASR-LLM de Meta, que combina un codificador de voz de tipo wav2vec2 con un decodificador de lenguaje de 3B parámetros basado en Llama. Esta estructura permite mapear representaciones acústicas a tokens de texto mediante un puente de proyección, aprovechando la capacidad generativa del LLM para la transcripción. El framework de entrenamiento e inferencia es fairseq2, lo que condiciona el formato de pesos y las herramientas de despliegue disponibles.

El ajuste fino se realizó presumiblemente sobre los datasets referenciados en las etiquetas: `DigitalUmuganda/Afrivoice_Kinyarwanda` y `fsicoli/common_voice_22_0`. No se especifican el número de horas de audio, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF, DPO o aumentación de datos. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las inherentes al modelo base.

## Capacidades

- Reconocimiento automático de voz (ASR) en kinyarwanda: transcripción de audio a texto.
- Especialización monolingüe: optimizado para `rw`, no para otros idiomas.
- Hereda la arquitectura multimodal voz-texto del modelo base omniASR-LLM-3B.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo de razonamiento (thinking mode), visión ni audio generativo.
- Capacidades multilingües: limitadas al kinyarwanda según la información disponible.

## Casos de uso

- Transcripción de reuniones y actas en kinyarwanda: el modelo convierte audio de reuniones en texto para documentación administrativa, aprovechando su especialización monolingüe.
- Subtitulado automático de contenido audiovisual ruandés: generación de subtítulos para vídeos, entrevistas o programas de radio en kinyarwanda.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo casi real de discursos y eventos públicos en kinyarwanda.
- Digitalización de archivos orales: conversión de grabaciones históricas o etnográficas en kinyarwanda a texto indexable.
- Atención al cliente por voz: integración en sistemas IVR para transcribir consultas de usuarios en kinyarwanda antes de su procesamiento.
- Investigación lingüística y corpus: generación de transcripciones para estudios de fonética, morfología o análisis de discurso en kinyarwanda.
- Evaluación de modelos ASR de bajos recursos: uso como referencia afinada frente al modelo base multilingüe para medir la ganancia del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; un modelo de 3B parámetros en fp16 requiere aproximadamente 6-8 GB solo para pesos, más memoria para el codificador de voz y activaciones.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16-24 GB (RTX 4090, A10G, L4) sería el mínimo razonable en fp16.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 (24 GB) o RTX 3090 (24 GB) en fp16; en cuantización a 8 bits podría caber en GPUs de 12-16 GB, aunque no se documentan formatos de cuantización.
- Opciones de despliegue: fairseq2 (framework nativo); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omniASR-LLM-3B-kinyarwanda | 3B | no disponible | rw | Apache 2.0 | Gated en Hugging Face |
| facebook/omniASR-LLM-3B | 3B | no disponible | multilingüe (familia omnilingual-asr) | no disponible en esta ficha | Público en Hugging Face |
| Whisper large-v3 (OpenAI) | 1,55B | 30 s de audio | multilingüe (incluye rw con cobertura limitada) | MIT | Público en Hugging Face |

La comparativa con Whisper es aproximada: Whisper es un modelo encoder-decoder específico para ASR con cobertura multilingüe, mientras que omniASR-LLM-3B-kinyarwanda es un ajuste monolingüe sobre una arquitectura voz-LLM. No se dispone de métricas comparativas (WER) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Idiomas: solo kinyarwanda; no debe usarse para otros idiomas sin un ajuste adicional.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni frente a alternativas como Whisper.
- Riesgo de alucinación: como modelo generativo basado en LLM, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados.
- Sesgos: desconocidos; dependen de la composición de Afrivoice Kinyarwanda y Common Voice 22.0, no documentada en detalle.
- Formato fairseq2: requiere tooling específico; no es directamente compatible con ecosistemas GGUF/Ollama sin conversión.
- Licencia Apache 2.0: permite uso comercial, pero el acceso gated puede imponer condiciones adicionales de uso aceptable.
- Sin descargas ni validación comunitaria: al no registrar descargas ni likes, no hay evidencia de uso en producción ni informes de calidad independientes.
- Fecha de creación futura (2026-10-31): verificar la autenticidad y vigencia del repositorio antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Lugha-Models/omniASR-LLM-3B-kinyarwanda
- Modelo base: https://huggingface.co/facebook/omniASR-LLM-3B
- Dataset Afrivoice Kinyarwanda: https://huggingface.co/datasets/DigitalUmuganda/Afrivoice_Kinyarwanda
- Dataset Common Voice 22.0: https://huggingface.co/datasets/fsicoli/common_voice_22_0
- Framework fairseq2: https://github.com/facebookresearch/fairseq2
