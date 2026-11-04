# kbpk31/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de lenguaje aumentado con voz (Speech-Augmented Language Model, SALM) desarrollado por NVIDIA para transcripción y comprensión de audio. Se trata de un fine-tuning del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, adaptado específicamente para tareas de reconocimiento automático del habla (ASR), traducción de voz, diarización de hablantes, transcripción con marcas de tiempo, identificación de idioma y respuesta a preguntas sobre audio.

La arquitectura combina un language model híbrido Mamba-2/Transformer con mezcla de expertos (MoE) y un encoder de audio paralelo de tipo Transformer, junto con un encoder de hablantes. El modelo totaliza 34B parámetros (33,7B según los pesos en safetensors) de los cuales aproximadamente 4,3B están activos en cada paso, incluyendo el encoder de audio. Soporta una ventana de contexto de 65.536 tokens y grabaciones de hasta una hora de duración.

Es relevante porque ofrece una alternativa de pesos abiertos para tareas de voz de extremo a extremo en 40 idiomas, con licencia OpenMDW-1.1 que permite uso comercial, y variantes en BF16, FP8 y NVFP4 para facilitar el despliegue en distintos tipos de hardware. El modelo está pensado para uso offline (procesamiento por lotes o bajo demanda), no para streaming en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2–Transformer hybrid Mixture of Experts (MoE) con Parallel Expert Encoder (Transformer ASR encoder + speaker encoder) |
| Parametros totales | 34B (33.697.781.029 segun safetensors), incluyendo el encoder de audio |
| Parametros activos | ~4,3B (incluyendo encoder de audio) |
| Longitud de contexto | 65.536 tokens; grabaciones de hasta 1 hora |
| Tipos de cuantizacion | BF16 (referencia), FP8, NVFP4 |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors (libreria NeMo) |

## Arquitectura y entrenamiento

El modelo es un SALM construido sobre un language model híbrido Mamba-2–Transformer con mezcla de expertos. A este núcleo se le añade un encoder de audio Transformer y un encoder de hablantes en paralelo, que proyectan las representaciones acústicas al espacio del modelo de lenguaje. La activación de aproximadamente 4,3B parámetros sobre 34B totales permite un coste de inferencia reducido en comparación con un modelo denso del mismo tamaño, manteniendo la capacidad del modelo completo.

El entrenamiento se realizó mediante fine-tuning del modelo base Nemotron-3.5-Lightning-30B-A3B-BF16, utilizando el dataset nvidia/Granary-v2. La mezcla de entrenamiento cubre transcripción multilingüe, traducción de voz, transcripción contextual, transcripción con atribución de hablante, transcripción enriquecida, predicción de marcas de tiempo, identificación de idioma y respuesta a preguntas sobre audio. Además, incluye una pequeña proporción de tareas de seguimiento de instrucciones textuales y de etiquetado/redacción de información personal identificable (PII). No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición porcentual del dataset, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Transcripción multilingüe en 40 idiomas, con soporte de code-switching (cambio de idioma dentro de una misma grabación).
- Traducción de voz (speech translation) a texto.
- Diarización de hablantes y transcripción con atribución de hablante.
- Predicción de marcas de tiempo (timestamps) a nivel de segmento o palabra.
- Identificación de idioma (language identification) dentro del audio.
- Transcripción contextual: el usuario puede proporcionar contexto textual o instrucciones para guiar el estilo y el contenido de la transcripción.
- Transcripción enriquecida (rich transcription): formato de salida configurable mediante instrucciones.
- Respuesta a preguntas sobre audio (audio question answering).
- Seguimiento de instrucciones textuales (instruction following) en pequeña medida.
- Etiquetado y redacción de información personal identificable (PII tagging/redaction).
- Procesamiento de audio de formato largo: grabaciones de hasta una hora gracias al contexto de 65.536 tokens.
- No se menciona soporte explícito de tool calling ni de razonamiento multi-paso orientado a agentes.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar grabaciones de hasta una hora con diarización de hablantes y marcas de tiempo, generando actas estructuradas con atribución de intervenciones. La ventana de 65.536 tokens evita la fragmentación manual de audios largos.
- Subtitulado y localización de vídeo: gracias a la predicción de marcas de tiempo y a la traducción de voz, se puede generar directamente subtítulos traducidos a otro idioma a partir del audio original, integrable en pipelines de postproducción.
- Atención al cliente y análisis de llamadas: la transcripción con atribución de hablante y el etiquetado de PII permiten procesar grabaciones de call centers, redactar datos sensibles y analizar la conversación sin exponer información personal.
- Documentación clínica o legal dictada: la transcripción contextual permite pasar un glosario o contexto previo (por ejemplo, terminología médica o jurídica) para mejorar la precisión en dominios especializados, con soporte multilingüe para entornos bilingües.
- Investigación cualitativa y entrevistas: procesamiento por lotes de entrevistas en varios idiomas con identificación de idioma automática y diarización, facilitando el análisis posterior sin transcripción manual.
- Accesibilidad y archivado de contenido audiovisual: generación de transcripciones y traducciones de archivos de audio históricos o de medios, con la ventaja de que el modelo es offline y puede desplegarse en infraestructura propia para cumplir requisitos de confidencialidad.
- Asistentes de consulta sobre audio: respuesta a preguntas directas sobre el contenido de una grabación (audio question answering), útil en sistemas de búsqueda sobre archivos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 67,5 GB solo para los pesos (tamaño del repo), por lo que se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) para cargar el modelo completo en BF16.
- VRAM estimada en FP8: alrededor de 34 GB para los pesos, lo que permite ejecución en GPUs de 40-48 GB (A100 40GB, L40S 48GB) con margen para el encoder de audio y el contexto.
- VRAM estimada en NVFP4: aproximadamente 17-20 GB para los pesos, lo que abre la posibilidad de desplegarlo en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 5090, aunque con limitaciones de contexto y throughput.
- GPU recomendadas: H100 80GB o A100 80GB para BF16; L40S o A100 40GB para FP8; RTX 4090/5090 para NVFP4 en entornos de desarrollo o cargas ligeras.
- Opciones de despliegue: NeMo Speech (framework nativo del modelo), SGLang-Omni (según la model card) y transformers. No se menciona soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B | 34B totales / ~4,3B activos (MoE) | 65.536 tokens; audio de hasta 1 h | 40 | OpenMDW-1.1 | SALM offline con diarización, timestamps, traducción y audio QA |
| Whisper large-v3 (OpenAI) | ~1,55B (denso) | 30 s por segmento (ventana fija) | ~99 | MIT | ASR clasico, sin diarizacion nativa ni audio QA; requiere segmentacion para audio largo |
| Qwen2-Audio (Alibaba) | ~8,2B (denso) | ~32k tokens | Multilingue (no detallado) | Apache 2.0 (segun version) | Modelo audio-lenguaje con QA y ASR, sin MoE; menor contexto que Nemotron |
| Voxtral (Mistral AI) | ~3B / ~24B (segun variante) | ~32k tokens | Multilingue | Apache 2.0 (variante pequena) | ASR y comprension de audio; sin arquitectura MoE hibrida Mamba-2 |

Los datos de los modelos comparados provienen de conocimiento general y pueden no reflejar exactamente las versiones mas recientes; la informacion proporcionada no incluye una comparativa oficial.

## Limitaciones y advertencias

- Modelo offline: no está diseñado para transcripción en streaming en tiempo real; el procesamiento es por lotes o bajo demanda.
- Riesgo de alucinación: como modelo generativo, puede producir texto que no corresponde al audio, especialmente en segmentos con ruido, silencios largos o audio de baja calidad.
- Sesgos: no se detalla en la información disponible un análisis de sesgos por idioma, acento, género o edad; los modelos ASR suelen tener peor rendimiento en variedades dialectales y acentos poco representados.
- Cobertura desigual por idioma: aunque se listan 40 idiomas, el rendimiento puede variar significativamente entre ellos; no se proporcionan métricas por idioma en la información disponible.
- Licencia OpenMDW-1.1: permite uso comercial, pero conviene revisar los términos completos del enlace de licencia para obligaciones de atribución o restricciones específicas.
- Requisitos de hardware elevados: el modelo completo en BF16 requiere GPUs de 80 GB; el despliegue en consumer GPU exige cuantización NVFP4 y puede limitar el contexto efectivo.
- Dependencia del ecosistema NeMo: el formato de pesos y la librería nativa pueden requerir adaptaciones para integrarse en stacks de inferencia que no sean NeMo o SGLang-Omni.
- Tareas de PII: el etiquetado y redacción de información personal identificable es una capacidad secundaria del entrenamiento; no debe considerarse una garantía de cumplimiento normativo sin validación adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: se trata de una publicación reciente (creada el 2026-11-04) sin validación comunitaria todavía.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kbpk31/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Modelo oficial BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Variante FP8: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- NeMo Speech (GitHub): https://github.com/NVIDIA-NeMo/Speech
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Guía de despliegue con SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Paper SALM (arXiv:2310.09424): https://arxiv.org/abs/2310.09424
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
