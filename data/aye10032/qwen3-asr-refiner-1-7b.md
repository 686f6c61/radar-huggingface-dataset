# Aye10032/Qwen3-ASR-Refiner-1.7B

## Resumen

Qwen3-ASR-Refiner-1.7B es un modelo de lenguaje especializado en la normalización de transcripciones de reconocimiento automático de voz (ASR) en chino. Desarrollado por el usuario Aye10032, este modelo convierte texto hablado (transcripciones ASR, conversaciones coloquiales) en chino escrito formal y natural, preservando el significado original y eliminando muletillas, repeticiones y errores típicos del lenguaje oral. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen3-1.7B, realizado mediante la fusión de un adaptador LoRA sobre los pesos completos.

El modelo resuelve un problema habitual en los pipelines de ASR: la transcripción cruda suele contener fragmentos propios del habla espontánea que no son adecuados para su uso directo en documentos, subtítulos o sistemas de generación de contenido. Qwen3-ASR-Refiner actúa como una etapa de post-procesamiento que convierte esas transcripciones en texto escrito coherente, lo que facilita su integración en flujos de producción reales. La variante de 1.7B parámetros ofrece un equilibrio entre calidad y requisitos de hardware, siendo la opción intermedia de una familia que incluye versiones de 0.6B y 4B.

La relevancia actual de este modelo radica en su especialización en chino, un idioma con alta demanda de herramientas de normalización de texto ASR en aplicaciones empresariales y de investigación. Su licencia Apache 2.0 permite un uso comercial sin restricciones, y al estar basado en la arquitectura Qwen3, hereda capacidades sólidas de razonamiento y generación de texto, aunque aquí se usa exclusivamente para la tarea de reescritura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos completos) |
| Idiomas soportados | zh (chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base `Qwen/Qwen3-1.7B`, una arquitectura transformer decoder-only con mecanismos de atención estándar y soporte para chat. El ajuste fino se realizó mediante un adaptador LoRA que posteriormente se fusionó en los pesos del modelo base, lo que significa que el repositorio contiene pesos completos en BF16 y se puede cargar directamente con la librería Transformers sin necesidad de herramientas PEFT adicionales.

El entrenamiento se llevó a cabo sobre el dataset `Aye10032/WenetSpeech-Formal-Text`, un conjunto de datos de transcripciones de ASR chinas emparejadas con versiones formales escritas. El dataset está licenciado bajo CC BY 4.0. La tarea se definió como una conversión de estilo hablado a escrito, con una instrucción de sistema que pide al modelo "reescribir la transcripción del chino oral a chino escrito formal, preservando el significado y sin añadir información nueva". No se dispone de detalles sobre el número de tokens de entrenamiento, el proceso de optimización ni si se utilizaron técnicas de RLHF o DPO.

## Capacidades

- Conversión de transcripciones ASR en chino a texto escrito formal y natural, eliminando muletillas y repeticiones.
- Preservación del significado original sin introducir información no presente en la fuente.
- Soporte de conversaciones multi-turno mediante el uso de plantillas de chat (chat template) de Qwen3, aunque la tarea principal es de transformación de texto.
- Generación de texto determinista con `do_sample=False`, lo que facilita la reproducibilidad en pipelines de producción.
- Integración directa con el ecosistema de Transformers de Hugging Face, incluyendo inferencia con `device_map='auto'`.

No se mencionan capacidades de tool calling, agentes, visión ni audio; el modelo se limita al procesamiento de texto.

## Casos de uso

- Post-procesamiento de transcripciones ASR en plataformas de voz a texto: el modelo se puede integrar como un paso posterior al reconocimiento de voz para limpiar y formalizar transcripciones antes de su almacenamiento o análisis, eliminando el ruido del lenguaje oral.
- Generación de subtítulos formales para vídeos y podcasts: convierte los subtítulos automáticos en un texto más legible y adecuado para una audiencia amplia, sin perder el contenido.
- Preparación de datos para entrenamiento de modelos de lenguaje: las transcripciones normalizadas sirven como texto de alta calidad para el entrenamiento o fine-tuning de otros modelos en chino.
- Documentación de reuniones y entrevistas: las grabaciones transcritas se pueden convertir en actas o resúmenes escritos formales, facilitando su archivo y consulta.
- Limpieza de texto para asistentes de voz: los resultados de los asistentes pueden ser reformulados en un lenguaje más formal antes de mostrarse en pantalla o leerse en voz alta.
- Normalización de datos de voz para investigación lingüística: los investigadores pueden obtener versiones escritas formales de corpus orales para análisis comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB (1,72 billones de parámetros × 2 bytes por parámetro), más la memoria adicional para la entrada y los logits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA RTX 3060, RTX 3070, RTX 4060 o superior. También es viable en GPUs de datacenter como A10G o A100.
- En consumer GPU: sí, cabe en tarjetas de gama media como la RTX 3060 (12 GB) y la RTX 4060 (8 GB).
- Opciones de despliegue: se puede usar con la librería Transformers de Hugging Face, así como con servidores de inferencia como vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierte a GGUF).
- Latencia y throughput: no se disponen datos específicos; dependerá del hardware y del tamaño de la secuencia de entrada.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada. La familia Qwen3-ASR-Refiner incluye variantes de 0,6B y 4B parámetros, pero no se detallan sus métricas de rendimiento. El modelo base Qwen3-1.7B es un modelo de propósito general, no especializado en normalización de transcripciones. Tampoco se han encontrado modelos alternativos de la misma tarea en la búsqueda web.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en chino; no es adecuado para transcripciones en otros idiomas.
- La calidad de la normalización depende de la calidad de la transcripción de entrada; si la transcripción contiene errores graves, el modelo no los corrige, solo reformula el texto.
- Riesgo de alucinación: aunque el sistema prompt instruye al modelo a no añadir información, los modelos de lenguaje pueden generar contenido no presente en la entrada, especialmente con entradas ambiguas o mal formateadas.
- La longitud de contexto no está documentada en la información disponible; se recomienda probar con secuencias largas para verificar el comportamiento.
- El dataset de entrenamiento está licenciado bajo CC BY 4.0, lo que implica atribución en uso, pero la licencia del modelo es Apache 2.0, por lo que el uso comercial está permitido.
- No se han publicado métricas de rendimiento (como MMLU o HumanEval) para este modelo, por lo que su rendimiento en tareas generales es desconocido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Aye10032/Qwen3-ASR-Refiner-1.7B)
- [Dataset WenetSpeech-Formal-Text](https://huggingface.co/datasets/Aye10032/WenetSpeech-Formal-Text)
- [Repositorio Qwen3-ASR en GitHub](https://github.com/QwenLM/Qwen3-ASR)
- [Modelo en FriendliAI](https://friendli.ai/models/Aye10032/Qwen3-1.7B-ASR-Refiner)
- [Documentación de Qwen3-ASR-1.7B en DeepWiki](https://deepwiki.com/antirez/qwen-asr/10.2-1.7b-model)
