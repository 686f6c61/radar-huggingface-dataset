# atrezonator/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de lenguaje aumentado con voz (SALM, Speech-Augmented Language Model) desarrollado por NVIDIA para transcripción multilingüe, traducción de voz, diarización de hablantes, predicción de marcas temporales, identificación de idioma y respuesta a preguntas sobre audio. El repositorio analizado es una publicación de pesos en formato NeMo por parte del usuario atrezonator, derivada del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16.

La arquitectura combina un transformer híbrido Mamba-2 con mezcla de expertos (MoE) y un codificador de voz paralelo (encoder ASR transformer más encoder de hablante). Con 34B parámetros totales y aproximadamente 4,3B activos por token, ofrece una ventana de contexto de 65.536 tokens que permite procesar grabaciones de hasta una hora en una sola pasada.

El modelo es relevante porque unifica en un único checkpoint tareas que tradicionalmente requerían pipelines separados (ASR, diarización, traducción, detección de idioma) y porque se distribuye con pesos abiertos bajo licencia OpenMDW-1.1, con variantes en BF16, FP8 y NVFP4 para distintos presupuestos de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba-2–Transformer híbrido con mezcla de expertos (MoE) y Parallel Expert Encoder (encoder ASR transformer y encoder de hablante) |
| Parámetros totales | 33.697.781.029 (≈34B, incluyendo el encoder de audio) |
| Parámetros activos | ≈4,3B por token |
| Longitud de contexto | 65.536 tokens; grabaciones de hasta 1 hora |
| Tipos de cuantización | BF16 (referencia), FP8 y NVFP4 (variantes publicadas por NVIDIA) |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors con librería NeMo (nemo_speechlm); repo de 67,5 GB |

## Arquitectura y entrenamiento

El modelo emplea un backbone de lenguaje híbrido que intercala capas Mamba-2 (modelo de espacio de estados) con capas de atención transformer, configurado como mezcla de expertos. A esto se añade un Parallel Expert Encoder compuesto por un encoder ASR de tipo transformer y un encoder de hablante, que proyectan las representaciones de audio al espacio del modelo de lenguaje. Esta combinación permite manejar secuencias de audio largas con un coste de atención reducido frente a un transformer denso equivalente.

El entrenamiento se realizó sobre el dataset nvidia/Granary-v2 y la model card menciona explícitamente tareas de instrucción de texto y etiquetado/redacción de PII (información personal identificable) en la mezcla. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO. La model card referencia un informe técnico (Technical Report) para los detalles completos del proceso.

## Capacidades

- Transcripción multilingüe en 40 idiomas, con soporte de audio de formato largo (hasta una hora por pasada).
- Traducción de voz (speech translation) entre idiomas soportados.
- Diarización de hablantes y transcripción con atribución de hablante.
- Predicción de marcas temporales (timestamps) a nivel de segmento o palabra.
- Identificación de idioma (language identification) y manejo de code-switching.
- Transcripción contextual: acepta contexto textual adicional (por ejemplo, listas de términos o nombres) para mejorar el reconocimiento.
- Transcripción enriquecida (rich transcription) con formato controlado mediante instrucciones en el prompt.
- Respuesta a preguntas sobre audio (audio question answering).
- Seguimiento de instrucciones de texto en pequeña proporción, incluyendo etiquetado y redacción de PII.
- Procesamiento offline por lotes (no está descrito como modelo de streaming en la información disponible).

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar una grabación completa de hasta una hora en una sola pasada gracias a sus 65.536 tokens de contexto, generando transcripción con marcas temporales y atribución de hablante para reconstruir quién dijo qué.
- Subtitulado y traducción de contenido audiovisual: combinando speech translation y timestamps, se pueden generar subtítulos en otro idioma alineados temporalmente con el audio original.
- Atención al cliente y análisis de llamadas: la diarización y la transcripción contextual permiten separar agente y cliente y detectar términos específicos del dominio mediante contexto inyectado en el prompt.
- Cumplimiento y redacción de PII: la mezcla de entrenamiento incluye tareas de etiquetado y redacción de información personal, útil para anonimizar transcripciones antes de almacenarlas o analizarlas.
- Investigación lingüística multilingüe: con 40 idiomas y soporte de code-switching, sirve para corpus de habla con cambios de idioma dentro de una misma conversación.
- Archivado y búsqueda de audio: la transcripción con timestamps e identificación de idioma facilita indexar grandes volúmenes de grabaciones y habilitar búsqueda textual sobre ellas.
- Asistentes de accesibilidad: conversión de audio a texto en tiempo de ejecución por lotes para generar transcripciones legibles de clases, charlas o entrevistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia una sección "Benchmark Results" y un informe técnico, pero los valores numéricos no están incluidos en los datos proporcionados, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el checkpoint completo ocupa aproximadamente 67,5 GB, por lo que se necesita al menos una GPU con 80 GB (A100 80GB, H100 80GB) para cargar los pesos sin cuantizar.
- Variante FP8: reduce el peso a la mitad aproximadamente (≈34 GB), lo que permite ejecución en una GPU de 40-48 GB (A100 40GB, L40S 48GB) o en dos GPU de 24 GB con paralelismo.
- Variante NVFP4: reduce aún más el peso (≈17 GB), lo que la hace viable en GPU consumer de gama alta como RTX 4090 (24 GB) o RTX 5090, siempre que el runtime soporte NVFP4.
- GPU recomendadas: H100 y A100 80GB para BF16 en producción; L40S o A100 40GB para FP8; RTX 4090/5090 para NVFP4 en entornos de desarrollo.
- Opciones de despliegue: NeMo Speech (librería nativa del modelo), SGLang-Omni (cookbook específico para Nemotron Transcribe) y el ecosistema transformers indicado en los tags. No se confirma soporte de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B | ≈34B totales, ≈4,3B activos | 65.536 tokens | 40 | OpenMDW-1.1 | Pesos abiertos (BF16/FP8/NVFP4) |
| Whisper large-v3 | ≈1,55B | 30 s por ventana (no contexto largo nativo) | ≈99 | MIT | Pesos abiertos |
| Alternativas SALM de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Whisper large-v3 es la más directa por categoría de tarea (ASR multilingüe con pesos abiertos), aunque Nemotron-3.5-Transcribe añade diarización, traducción y contexto largo en un único modelo. No se dispone de datos de benchmarks para comparar rendimiento numérico entre ambos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado en la información disponible datos sobre sesgos demográficos, acentos o variedades dialectales; conviene evaluar el modelo sobre el dominio concreto antes de producción.
- Riesgo de alucinación inherente a los modelos de lenguaje: en pasajes con ruido, silencios o audio ininteligible puede generar texto plausible no presente en la grabación.
- El procesamiento es offline por lotes; no se describe soporte de streaming ni de latencia baja en tiempo real.
- Aunque soporta 40 idiomas, el rendimiento puede variar sustancialmente entre ellos; no se aportan métricas por idioma en la información disponible.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial: la model card indica que el modelo está listo para uso comercial y no comercial, pero las condiciones exactas están en el enlace de licencia.
- El repositorio analizado es una publicación de terceros (atrezonator) derivada del modelo base de NVIDIA; para producción conviene usar los repositorios oficiales de NVIDIA (BF16, FP8, NVFP4) y verificar la integridad de los pesos.
- El tamaño del repo (67,5 GB) y la necesidad de NeMo o SGLang-Omni limitan su despliegue en entornos sin GPU de gama alta o sin ese stack.

## Enlaces

- Repositorio analizado: https://huggingface.co/atrezonator/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante BF16 oficial: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Variante FP8: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- NeMo Speech (repositorio): https://github.com/NVIDIA-NeMo/Speech
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Cookbook SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Paper SALM: https://arxiv.org/abs/2310.09424
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
