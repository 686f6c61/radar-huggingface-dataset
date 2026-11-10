# hemilu223/Qwen3-Omni-30B-A3B-Instruct-AWQ-4bit

## Resumen

Qwen3-Omni-30B-A3B-Instruct-AWQ-4bit es una cuantización de 4 bits del modelo multimodal Qwen3-Omni-30B-A3B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba. Se trata de un modelo fundacional "omni-modal" nativo de extremo a extremo que procesa texto, imágenes, audio y vídeo, y genera respuestas tanto en texto como en habla natural con capacidad de streaming en tiempo real. La cuantización la firma hemilu223 (cyankiwi), un agente de inferencia especializado en modelos abiertos.

La relevancia de esta versión concreta radica en que reduce el peso del repositorio a 27,55 GB mediante cuantización AWQ de 4 bits generada con llm-compressor, lo que facilita su despliegue en infraestructura más modesta que la requerida por los pesos en precisión completa. El modelo base emplea una arquitectura MoE con diseño Thinker–Talker, pensada para interacción audio/vídeo de baja latencia.

Conviene señalar de entrada una discrepancia importante: aunque el nombre del modelo indica "30B-A3B", los pesos safetensors del repositorio suman 10.034.262.961 parámetros, no 30 mil millones. Esta ficha refleja ese dato real y advierte sobre la diferencia frente a la denominación comercial del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3-Omni, diseño Thinker–Talker con pretraining AuT); multimodal any-to-any |
| Parámetros totales | 10.034.262.961 (según safetensors del repo; el nombre comercial indica "30B-A3B") |
| Parámetros activos | no disponible (el nombre comercial indica "A3B", pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | AWQ 4 bits (compressed-tensors, generado con llm-compressor); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | 119 idiomas de texto, 19 de entrada de voz y 10 de salida de voz según el modelo base; la model card de esta cuantización declara únicamente "en" |
| Licencia | apache-2.0 (la model card declara `license: other` con `license_name: apache-2.0`) |
| Formato de pesos | safetensors (compressed-tensors, AWQ 4 bits) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Omni emplea una arquitectura MoE con un diseño denominado Thinker–Talker: un componente "Thinker" que razona sobre las entradas multimodales y un componente "Talker" que genera habla. Incorpora pretraining AuT (audio transformer) para construir representaciones generales robustas y un diseño multi-codebook que reduce la latencia de generación de audio. El entrenamiento combina un pretraining "text-first" temprano con entrenamiento multimodal mixto, de forma que las capacidades unimodales de texto e imagen no se degradan al añadir modalidades de audio y vídeo.

Esta versión concreta es una cuantización AWQ de 4 bits generada con la herramienta llm-compressor del proyecto vLLM. El proceso de calibración utilizó el dataset nvidia/Llama-Nemotron-Post-Training-Dataset. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicaron fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Procesamiento nativo de texto, imágenes, audio y vídeo (pipeline any-to-any).
- Generación de respuestas en texto y en habla natural, con streaming en tiempo real.
- Comprensión de audio y reconocimiento automático del habla (ASR) de alto rendimiento según el modelo base.
- Conversación por voz con turn-taking natural y baja latencia.
- Capacidades multilingües amplias en el modelo base: 119 idiomas de texto, 19 de entrada de voz (incluido español) y 10 de salida de voz (incluido español).
- Control flexible del comportamiento mediante system prompts.
- Modelo relacionado: Qwen3-Omni-30B-A3B-Captioner, un captioner de audio detallado y de baja alucinación publicado en abierto.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Transcripción y comprensión de audio en producción: el modelo base alcanza resultados comparables a Gemini 2.5 Pro en ASR y comprensión de audio, por lo que puede emplearse en pipelines de subtitulado, actas de reuniones o análisis de llamadas.
- Asistentes de voz conversacionales: la generación de habla con streaming y turn-taking natural permite construir interfaces de voz de baja latencia para atención al cliente o asistentes domésticos.
- Análisis de vídeo con audio: al procesar conjuntamente vídeo y audio, es adecuado para moderación de contenido audiovisual, indexación semántica de archivos multimedia o resumen automático de grabaciones.
- Descripción detallada de audio (audio captioning): mediante el modelo Captioner asociado, útil para accesibilidad, etiquetado de archivos sonoros y generación de metadatos.
- Procesamiento de documentos con imágenes: la capacidad de imagen del modelo base permite extracción de información de capturas, gráficos y documentos escaneados combinada con razonamiento textual.
- Despliegue en infraestructura limitada: la cuantización AWQ 4 bits reduce el peso a 27,55 GB, lo que permite servir el modelo en GPUs de menor VRAM que las necesarias para los pesos completos, por ejemplo en entornos de investigación con recursos acotados.
- Traducción y atención multilingüe: los 119 idiomas de texto del modelo base lo habilitan para traducción y atención al cliente en múltiples lenguas, aunque la model card de esta cuantización solo declara inglés.

## Benchmarks y rendimiento

El modelo base declara alcanzar SOTA en 22 de 36 benchmarks de audio/vídeo y SOTA open source en 32 de 36, con rendimiento en ASR, comprensión de audio y conversación por voz comparable a Gemini 2.5 Pro. Sin embargo, no se han publicado resultados de benchmarks específicos de esta cuantización AWQ 4 bits en la información disponible, ni cifras numéricas detalladas por benchmark.

| Benchmark | Modelo base (según model card) | Esta cuantización |
|---|---|---|
| SOTA en benchmarks audio/vídeo | 22 de 36 | no disponible |
| SOTA open source audio/vídeo | 32 de 36 | no disponible |
| ASR / comprensión de audio / voz | comparable a Gemini 2.5 Pro | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 28 GB solo para pesos en AWQ 4 bits (27,55 GB de repositorio), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 32-40 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) queda por debajo del peso de los pesos, por lo que no cabe en una sola unidad sin offloading.
- Cabe en consumer GPU: no en una sola RTX 4090; podría requerir múltiples GPUs o offloading a CPU/RAM.
- Opciones de despliegue: transformers (librería declarada), vLLM (compatible con compressed-tensors/AWQ), endpoints compatibles según tags; llama.cpp y Ollama no están confirmados para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Instruct-AWQ-4bit (esta ficha) | 10.034.262.961 (repo) | no disponible | Texto, imagen, audio, vídeo | apache-2.0 | Hugging Face |
| Qwen3-Omni-30B-A3B-Instruct (base) | "30B-A3B" según nombre | no disponible | Texto, imagen, audio, vídeo | apache-2.0 | Hugging Face |
| Qwen3-Omni-30B-A3B-Captioner | no disponible | no disponible | Audio (captioning) | no disponible | Hugging Face |
| Gemini 2.5 Pro (referencia cerrada) | no disponible | no disponible | Texto, imagen, audio, vídeo | propietaria | API de Google |

La comparación con alternativas open source de la misma categoría (modelos omni-modales abiertos) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre indica "30B-A3B" pero los safetensors del repositorio suman 10.034.262.961 parámetros; conviene verificar la integridad del checkpoint antes de usarlo en producción.
- La cuantización AWQ 4 bits puede degradar la calidad respecto al modelo base, especialmente en tareas multimodales sensibles; no se han publicado evaluaciones de esta versión.
- La model card de esta cuantización declara únicamente el idioma inglés, pese a que el modelo base soporta 119 idiomas de texto; el soporte multilingüe real de esta versión no está verificado.
- Riesgo de alucinación inherente a los modelos generativos, agravado en tareas de audio y vídeo donde la verificación es más difícil.
- La licencia se declara como apache-2.0 pero con el campo `license: other` y `license_name: apache-2.0`; conviene revisar los términos exactos del modelo base antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de comunidad ni de validación por terceros.
- No se dispone de información sobre sesgos conocidos ni sobre restricciones específicas de uso del modelo base.
- El formato compressed-tensors puede no ser compatible con todos los runtimes; verificar compatibilidad con la versión de vLLM o transformers utilizada.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/hemilu223/Qwen3-Omni-30B-A3B-Instruct-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Organización cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
- Organización cyankiwi en ModelScope: https://www.modelscope.ai/organization/cyankiwi
- Sitio web de cyankiwi: https://cyan.kiwi/
- Despliegue en cyan.kiwi: https://cyan.kiwi/workspace?prompt=Deploy%20cyankiwi/Qwen3-Omni-30B-A3B-Instruct-AWQ-4bit
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Llama-Nemotron-Post-Training-Dataset
- Qwen Chat: https://chat.qwen.ai/
- X de cyankiwi: https://x.com/cyankiwi_ai
- Reddit de cyankiwi: https://www.reddit.com/r/cyankiwi/
