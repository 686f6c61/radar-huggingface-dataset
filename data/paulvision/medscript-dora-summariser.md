# paulvision/medscript-dora-summariser

## Resumen

medscript-dora-summariser es un adaptador LoRA/DoRA entrenado sobre el modelo base Qwen/Qwen3-8B, desarrollado por paulvision (Sourangshu Pal) como parte del ecosistema MedScript AI, orientado al resumen de textos médicos. El adaptador se ha ajustado con el dataset paulvision/medscript-sft-summariser, aparentemente compuesto por conversaciones o documentos clínicos, aunque no se documenta su contenido exacto. El modelo se presenta como un componente para tareas de resumen de prescripciones, notas clínicas u otros documentos sanitarios, y su relevancia radica en permitir un procesamiento local de información médica sensible sin depender de APIs externas.

La arquitectura se basa en el transformer de Qwen3-8B (aproximadamente 8 000 millones de parámetros) con adaptadores de tipo LoRA (r=16, alpha=32) y DoRA (Weight-Decomposed Low-Rank Adaptation), entrenados con Axolotl 0.18.0. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0.4 GB), por lo que se requiere cargar el modelo base Qwen3-8B para su uso. La longitud de contexto no se especifica en la información disponible, aunque el modelo base soporta hasta 32 768 tokens. El entrenamiento fue muy breve (10 pasos, 3 épocas teóricas) y los resultados de validación muestran una pérdida de 2.2212 y una perplejidad de 9.2181, lo que sugiere un prototipo inicial más que un modelo pulido para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) con adaptadores LoRA/DoRA |
| Parametros totales | No disponible (adaptador sobre Qwen3-8B, 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-8B soporta 32 768 tokens) |
| Tipos de cuantizacion | No disponible (solo safetensors del adaptador) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango (LoRA) con descomposición de pesos (DoRA) aplicado a todas las proyecciones lineales del transformer de Qwen3-8B (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El entrenamiento se realizó con Axolotl 0.18.0, utilizando flash attention, kernel fusionado de Liger (RMSNorm, RoPE, activación GLU y cross-entropy fusionada) y gradient checkpointing. El dataset de entrenamiento, paulvision/medscript-sft-summariser, se procesó con el chat template de Qwen3 y una longitud de secuencia de 1024 tokens, con sample packing. Los hiperparámetros principales incluyen learning rate de 2e-4, scheduler cosine con warmup del 5%, weight decay de 0.01, batch efectivo de 32 (micro batch de 2 con 16 pasos de acumulación) y un máximo de 10 pasos de entrenamiento, a pesar de configurar 3 épocas. Este número tan reducido de pasos indica un ajuste muy limitado, probablemente una prueba de concepto. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado estándar.

## Capacidades

- Generación de texto conversacional siguiendo el chat template de Qwen3.
- Resumen de textos médicos (prescripciones, notas clínicas, documentación sanitaria) según el dataset de entrenamiento, aunque no se detalla el tipo exacto de resúmenes.
- Adaptación específica al dominio médico mediante el ajuste fino, lo que puede mejorar la precisión terminológica frente al modelo base.
- Soporte de inferencia mediante text-generation-inference y endpoints compatibles (según los tags de HuggingFace).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad.

## Casos de uso

- Resumen de prescripciones médicas digitalizadas: el modelo puede condensar la información clave de una prescripción (medicamentos, dosis, posología) en un texto breve y estructurado, facilitando su registro en sistemas de historial clínico electrónico.
- Generación de informes de alta hospitalaria: a partir de notas de evolución o resúmenes de estancia, el adaptador puede producir un resumen conciso para el paciente o para otros profesionales.
- Resumen de artículos o documentos clínicos: permite extraer las ideas principales de publicaciones médicas o guías de práctica clínica, ahorrando tiempo de lectura.
- Asistente conversacional para personal sanitario: integrado en un chat, puede responder preguntas sobre un documento médico resumiendo la información relevante en lenguaje natural.
- Preprocesamiento de datos para sistemas de extracción de información: al resumir previamente los textos, se reduce la carga sobre modelos de extracción de entidades o relaciones.
- Archivado y búsqueda semántica: los resúmenes generados pueden indexarse para facilitar la recuperación de información clínica en grandes volúmenes de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta únicamente las métricas de validación del propio entrenamiento:

| Metrica | Valor |
|---|---|
| Validation loss | 2.2212 |
| Perplejidad | 9.2181 |
| Memoria activa máxima (GiB) | 18.67 |
| Memoria asignada máxima (GiB) | 18.67 |
| Memoria reservada del dispositivo (GiB) | 19.45 |

Estos valores corresponden al paso 10 (final del entrenamiento) y reflejan una pérdida aún alta, indicando que el modelo no ha convergido completamente y que su calidad generativa puede ser limitada.

## Requisitos de hardware

- Al ser un adaptador LoRA/DoRA, es necesario cargar el modelo base Qwen3-8B. La memoria requerida depende de la cuantización del modelo base:
  - Qwen3-8B en bf16/fp16: aproximadamente 16 GB de VRAM.
  - Qwen3-8B en 8 bits: aproximadamente 8-10 GB de VRAM.
  - Qwen3-8B en 4 bits: aproximadamente 5-6 GB de VRAM.
- El adaptador en sí ocupa menos de 0.5 GB y se fusiona o carga junto al modelo base.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para inferencia en bf16. Con cuantización 4-bit es posible ejecutarlo en GPUs consumer de 8 GB como RTX 3070/4060.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp, Ollama o Transformers con PEFT.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo base (8B), se espera una generación de aproximadamente 20-40 tokens/s en una GPU consumer moderna con cuantización 4-bit, pero estos valores son estimaciones generales y no se han medido específicamente.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para resumen médico con adaptadores LoRA. Se puede comparar con el propio modelo base Qwen3-8B sin ajuste fino, que ofrece capacidades generales de resumen pero sin especialización médica. Otras alternativas genéricas de resumen serían Mistral-7B-Instruct o Llama-3-8B-Instruct, pero no hay datos de rendimiento relativos en este dominio. La comparativa se limita a lo siguiente:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32 768 | Apache 2.0 | General |
| medscript-dora-summariser | 8B + adaptador | No disponible | Apache 2.0 | Resumen medico |
| Mistral-7B-Instruct | 7B | 32 768 | Apache 2.0 | General |

## Limitaciones y advertencias

- Entrenamiento extremadamente corto (solo 10 pasos), lo que probablemente resulta en un modelo subentrenado y con alta pérdida (2.22) y perplejidad (9.22). No es adecuado para uso en producción sin un ajuste adicional.
- El dataset de entrenamiento no está documentado (tamaño, composición, idioma, procedencia), por lo que se desconocen posibles sesgos o desequilibrios en los datos.
- No se han realizado evaluaciones con benchmarks estándar, por lo que el rendimiento real en tareas de resumen médico es incierto.
- El adaptador requiere el modelo base Qwen3-8B; no funciona de forma autónoma. La licencia del modelo base es Apache 2.0, compatible con uso comercial.
- No se especifican limitaciones de idioma; aunque Qwen3-8B es multilingüe, el fine-tuning puede haberse realizado en un idioma concreto (probablemente inglés), reduciendo su eficacia en otros idiomas.
- Riesgo de alucinación en resúmenes de información médica crítica: cualquier salida debe ser revisada por un profesional sanitario antes de su uso clínico.
- No se mencionan mecanismos de seguridad o filtros de contenido específicos para el dominio médico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/paulvision/medscript-dora-summariser
- Perfil del autor: https://huggingface.co/paulvision
- Repositorio MedScript AI (OCR de prescripciones): https://github.com/VarshiniE25/medical-prescription-ocr
- Repositorio MedScript (pipeline local para diapositivas médicas): https://github.com/pyMoLt/MedScript
