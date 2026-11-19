# RedHatAI/OTel-2.0-LLM-31B-IT

## Resumen

OTel-2.0-LLM-31B-IT es un modelo de instrucciones especializado en telecomunicaciones, desarrollado por Red Hat AI (RedHatAI) mediante post-entrenamiento de dominio sobre Gemma 4 31B-IT. Forma parte de la familia OTel 2.0, que amplía el esfuerzo original —una adaptación orientada a RAG— hacia un programa de adaptación de dominio de mayor escala, entrenado sobre aproximadamente 440 mil millones de tokens de telecomunicaciones. El objetivo es cubrir flujos de trabajo de grado telco: operaciones de red, interpretación de estándares, desarrollo de producto, asistencia en configuración de red, RAG y respuesta a preguntas específicas del sector.

El modelo conserva la arquitectura multimodal de su base (texto e imagen) con 31.273.088.876 parámetros totales, pero su modalidad entrenada es únicamente texto. La innovación metodológica central es OSFT (Orthogonal Subspace Fine-Tuning), un algoritmo de aprendizaje continuo del equipo de innovación de Red Hat AI que aprende en un subespacio ortogonal a las direcciones que portan el conocimiento previo del modelo base, con el fin de absorber conocimiento de dominio sin provocar olvido catastrófico y sin necesidad de un conjunto de repetición con los datos originales.

Es relevante ahora porque demuestra un enfoque de adaptación de dominio a gran escala sobre infraestructura AMD (MI300X en Azure para el procesamiento de datos y MI355X en premisas para el entrenamiento), con licencia Apache 2.0, disponibilidad de inferencia desde el día 0 en Microsoft Foundry, Featherless AI y Red Hat, y validación declarada sobre RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`Gemma4ForConditionalGeneration`), base Gemma 4 31B-IT |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de secuencia en entrenamiento: 4096) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16; existe una variante QLoRA entrenada sobre base 4-bit NF4 y fusionada a bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors, bfloat16, 15 shards, ~62,6 GB (repo de 126,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 31B-IT y se post-entrena mediante OSFT (Orthogonal Subspace Fine-Tuning), el algoritmo de aprendizaje continuo de Red Hat AI Innovation Team (Nayak et al., 2025), implementado con `training_hub` sobre el backend RHAI mini-trainer. En lugar de entrenar un adaptador junto a pesos congelados (LoRA/QLoRA) o actualizar todas las direcciones de cada matriz de pesos (fine-tuning completo), OSFT descompone las matrices objetivo y aprende en un subespacio ortogonal a las direcciones que portan el conocimiento existente del modelo base.

La configuración de entrenamiento usó `unfreeze_rank_ratio=0.35` —deliberadamente hacia el extremo de preservación, para añadir conocimiento telco sin degradar el seguimiento de instrucciones general—, 2 épocas, tamaño de lote efectivo 512, learning rate 2e-5 con schedule coseno, longitud máxima de secuencia 4096, enmascaramiento de pérdida solo en turnos del asistente para filas SFT y documento completo para filas de conocimiento, token EOS `<turn|>` (id 106), pesos maestros en FP32 con cómputo BF16 y estados del optimizador Adam en 8 bits. El entrenamiento se ejecutó sobre 8 GPU AMD MI355X (gfx950) con ROCm 7.2.1.

En datos, el corpus telco bruto fue de unos 15 mil millones de tokens procedentes de GSMA a través de Open Telco AI; se procesaron más de 1 billón de tokens con el Synthetic Data Generation Hub (SDG Hub) de Red Hat, usando aproximadamente 530 GPU mediante Microsoft Azure Managed Compute, principalmente AMD MI300X. La mezcla de entrenamiento cubre QnA telco directo, abstención, RAG, datos estilo modelo base y ejemplos generales de seguimiento de instrucciones y tool calling; no incluye ejemplos de MCP, tool calling ni seguimiento de instrucciones específicos de telecomunicaciones.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés.
- Conocimiento de dominio de telecomunicaciones: estándares, operaciones de red, configuración y desarrollo de producto.
- Respuesta a preguntas específicas del sector telco.
- Soporte para flujos RAG (recuperación aumentada) sobre documentación técnica y de estándares.
- Comportamiento de abstención entrenado (reconocer cuándo no responder).
- Tool calling y seguimiento de instrucciones de propósito general (heredados de la base; la mezcla actual no incluye ejemplos de tool calling específicos de telco).
- Multimodalidad arquitectónica (texto + imagen) estructuralmente soportada, pero no ajustada al dominio.
- No se documentan en la información disponible capacidades de audio ni un modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente de operaciones de red: interpretación de documentación de estándares y guías de configuración para responder consultas operativas, apoyándose en el corpus de ~440B tokens telco con los que fue entrenado.
- RAG sobre documentación de telecomunicaciones: el modelo está entrenado con datos orientados a RAG y abstención, lo que permite conectarlo a un índice vectorial de especificaciones GSMA y manuales internos para responder con base documental.
- Soporte técnico de nivel 2 en telco: resolución de preguntas sobre protocolos, interfaces y parámetros de red, con comportamiento de abstención cuando la consulta queda fuera de su conocimiento.
- Desarrollo de producto telco: generación de borradores de requisitos, descripciones de funcionalidades y documentación técnica a partir de estándares del sector.
- Asistencia en configuración de red: generación de explicaciones y plantillas de configuración guiadas por conocimiento de dominio, con validación humana en el bucle.
- Automatización de atención al cliente en inglés para operadores: conversaciones multi-turno sobre servicios y cuestiones técnicas, con la cautela de que el contexto máximo de entrenamiento documentado es de 4096 tokens.
- Integración en pipelines con tool calling: al heredar la capacidad de function calling de Gemma 4 31B-IT, puede orquestarse en agentes que consulten APIs internas de inventario o monitorización, aunque conviene evaluar este comportamiento por no estar ajustado al dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint se publica en bfloat16 con ~62,6 GB de pesos, por lo que requiere al menos ~64 GB de VRAM en bf16 (sin contar caché KV). En cuantizaciones de 8 bits cabría en ~32 GB y en 4 bits en ~16-18 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: AMD MI355X (plataforma de entrenamiento declarada) y MI300X; en el ecosistema NVIDIA, A100 80 GB, H100 80 GB o H200 para bf16. El modelo fue validado sobre vLLM 0.28.0, RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2.
- GPU de consumo: no cabe en bf16 en tarjetas consumer de 24 GB (RTX 4090); requeriría cuantización agresiva (4 bits) y no hay cuantizaciones oficiales publicadas.
- Opciones de despliegue: vLLM (validado), transformers; disponibilidad de inferencia desde el día 0 en Microsoft Foundry, Featherless AI y Red Hat. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OTel-2.0-LLM-31B-IT | 31,3B | no disponible | Telecomunicaciones (OSFT sobre Gemma 4 31B-IT) | Apache 2.0 | Hugging Face, Microsoft Foundry, Featherless AI, Red Hat |
| Gemma 4 31B-IT (base) | 31B | no disponible | Generalista, instrucciones | Licencia Gemma 4 | Hugging Face |
| OTel-2.0-LLM-31B-IT-QLoRA | 31B | no disponible | Telecomunicaciones (QLoRA sobre base 4-bit NF4, fusionado a bf16) | Apache 2.0 | Hugging Face |

La comparación con otros modelos telco especializados de terceros no está disponible en la información proporcionada. Frente a su base, la diferencia principal es la adaptación de dominio por OSFT con `unfreeze_rank_ratio=0.35`; frente a la variante QLoRA, ambos se distribuyen como checkpoints bf16 autónomos sin dependencia de adaptador en inferencia, y difieren en el método de obtención de los pesos.

## Limitaciones y advertencias

- Entrenado y soportado únicamente en inglés; no se documenta soporte multilingüe.
- La modalidad de imagen está estructuralmente presente (355 tensores de `vision_tower` y el proyector `embed_vision`), pero el modelo no fue ajustado en visión: no debe esperarse rendimiento de dominio en tareas de imagen.
- La mezcla de entrenamiento actual no incluye ejemplos de MCP, tool calling ni seguimiento de instrucciones específicos de telecomunicaciones; el comportamiento de tool calling en dominio telco debe evaluarse antes de producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; el entrenamiento incluye comportamiento de abstención, pero no elimina el riesgo en estándares y configuraciones críticas.
- Longitud máxima de secuencia en entrenamiento de 4096 tokens; no se documenta la ventana de contexto efectiva en inferencia.
- Los pesos pueden actualizarse con el tiempo: el autor recomienda fijar una revisión, hash de checkpoint o etiqueta de release para evaluación reproducible y despliegue en producción.
- Licencia Apache 2.0, pero con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de dicha licencia para uso comercial.
- No se publican benchmarks ni datos de latencia/throughput, lo que limita la comparación objetiva con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/RedHatAI/OTel-2.0-LLM-31B-IT
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Paper de OSFT (Nayak et al., 2025): https://arxiv.org/abs/2504.07097
- Repositorio `training_hub`: https://github.com/Red-Hat-AI-Innovation-Team/training_hub
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
