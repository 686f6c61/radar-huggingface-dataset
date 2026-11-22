# shahidrai/llama_3.2_3b_finetuned

## Resumen

`shahidrai/llama_3.2_3b_finetuned` es un adaptador LoRA (no un modelo completo, pese al nombre del repositorio) construido sobre `meta-llama/Llama-3.1-8B-Instruct`. Lo desarrolla Shahid Iqbal Rai, en colaboración con Danilo Croce y Roberto Basili (Universidad de Roma Tor Vergata), y corresponde al modelo presentado en el artículo *Injecting Frame Semantics into Large Language Models via Prompt-Based Fine-Tuning* (*SEM 2025). El objetivo es especializar un LLM generativo en semántica de marcos (frame semantics) de FrameNet mediante ajuste fino basado en prompts, es decir, entrenando el modelo para responder preguntas en formato QA sobre los marcos, sus elementos y sus relaciones léxicas.

El repositorio es un *stub* de redirección: el autor mantiene la página únicamente para que el enlace del paper siga funcionando, y la versión activa del modelo se publica como `sag-uniroma2/FrameLLaMA-3.2-8B-Instruct-50FramesFN17`. La discrepancia entre el nombre del repo (que sugiere "3B" y "Llama 3.2") y el modelo base real (Llama 3.1 8B Instruct) es relevante y debe tenerse en cuenta antes de descargarlo.

El modelo cubre 50 marcos de FrameNet 1.7 y está orientado a inglés. Su interés actual está en el nicho de extracción de estructura semántica con LLMs: en lugar de entrenar un clasificador específico, se induce al modelo a razonar sobre marcos mediante QA, lo que permite un único modelo para múltiples tareas de frame semantics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA |
| Parametros totales | 8B (modelo base); el adaptador LoRA ocupa 0.3 GB en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k tokens) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.000 millones de parámetros con atención causal estándar y RoPE. Sobre esa base se aplica un ajuste fino con LoRA (Low-Rank Adaptation), que congela los pesos originales y entrena matrices de bajo rango, reduciendo drásticamente el coste de entrenamiento y el tamaño del artefacto publicado (0.3 GB frente a los ~16 GB del modelo completo en fp16).

El entrenamiento se realiza con datos de tipo pregunta-respuesta derivados de 50 marcos de FrameNet 1.7, siguiendo un enfoque de *prompt-based fine-tuning*: el modelo aprende a responder consultas sobre definiciones de marcos, elementos de marco (frame elements), relaciones entre marcos y ejemplos de uso léxico. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, de la composición detallada del dataset ni de si se aplicó RLHF o DPO adicional; el paper asociado es la fuente primaria para esos detalles. La innovación principal es el uso de QA como formato unificado para inyectar conocimiento semántico estructurado en un LLM generativo, en lugar de entrenar clasificadores específicos por tarea.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Instruct.
- Razonamiento sobre semántica de marcos: identificación de marcos, elementos de marco y relaciones para los 50 marcos de FrameNet cubiertos.
- Respuesta a preguntas en formato QA sobre definiciones y estructura de marcos.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (heredada del base).
- Soporte de tool calling y function calling: no documentado en la información proporcionada (el base Llama 3.1 lo soporta, pero no se confirma para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Anotación semántica asistida: el modelo puede generar anotaciones preliminares de marcos y elementos de marco sobre corpus en inglés, que luego un anotador humano revisa, acelerando el proceso de creación de recursos FrameNet.
- Extracción de estructura de eventos en pipelines de NLP: dado un texto, el modelo responde a preguntas sobre qué marco activa una oración y qué elementos lo saturan, integrándose como paso de preprocesamiento en sistemas de comprensión lectora o extracción de información.
- Enseñanza de lingüística computacional: sirve como herramienta interactiva para que estudiantes consulten definiciones de marcos y ejemplos, gracias a su formato QA.
- Validación de recursos léxicos: se puede usar para comprobar la coherencia de anotaciones existentes en FrameNet, preguntando al modelo por la relación entre marcos y comparando con la anotación de referencia.
- Investigación en semántica léxica: como baseline reproducible para experimentos sobre inyección de conocimiento estructurado en LLMs, comparando el enfoque QA con clasificadores supervisados.
- Prototipado rápido de tareas de frame semantics: al ser un adaptador LoRA pequeño (0.3 GB), se puede cargar junto al base en entornos de experimentación sin necesidad de infraestructura pesada, facilitando pruebas de concepto en investigación.
- Generación de datos sintéticos para entrenamiento: el modelo puede producir pares pregunta-respuesta sobre marcos que sirvan para aumentar datasets de ajuste fino de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (*SEM 2025) contiene los resultados experimentales, pero no se han incluido en la información proporcionada. No se deben inferir cifras de MMLU, HumanEval u otros benchmarks sin consultar la fuente primaria.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama 3.1 8B requiere aproximadamente 16 GB en fp16, ~8 GB en cuantización de 8 bits y ~5-6 GB en 4 bits. El adaptador LoRA añade un coste marginal mínimo (~0.3 GB).
- GPU recomendadas: A100 40 GB o H100 para inferencia en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090 (24 GB) también válida.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con cuantización 8 bits) y GPUs con 8-12 GB usando cuantización 4 bits.
- Opciones de despliegue: transformers con `device_map="auto"` (como indica la model card), vLLM, TGI, llama.cpp y Ollama para versiones cuantizadas del base con el adaptador fusionado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shahidrai/llama_3.2_3b_finetuned (este) | 8B (base) + LoRA | no disponible | Frame semantics (50 marcos FN 1.7) | llama3.1 | Hugging Face (stub) |
| sag-uniroma2/FrameLLaMA-3.2-8B-Instruct-50FramesFN17 | 8B (base) + LoRA | no disponible | Frame semantics (50 marcos FN 1.7) | llama3.1 | Hugging Face (activo) |
| sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-FullFN17 | 8B (base) + LoRA | no disponible | Frame semantics (FrameNet completo) | llama3.1 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Propósito general | llama3.1 | Hugging Face |

La comparación más directa es con el repositorio sucesor `sag-uniroma2/FrameLLaMA-3.2-8B-Instruct-50FramesFN17`, que es el mismo modelo con documentación completa y resultados del paper. La versión FullFN17 amplía la cobertura a todo FrameNet 1.7. El base Llama 3.1 8B Instruct es el punto de partida sin especialización semántica.

## Limitaciones y advertencias

- El repositorio es un stub de redirección: el autor recomienda usar `sag-uniroma2/FrameLLaMA-3.2-8B-Instruct-50FramesFN17`. Descargar este repo puede llevar a confusión por el nombre ("3b", "llama_3.2") frente al base real (Llama 3.1 8B).
- Cobertura limitada: solo 50 marcos de FrameNet 1.7, no el inventario completo. Para marcos no cubiertos el modelo puede fallar o alucinar definiciones.
- Idioma: únicamente inglés; no se ha entrenado para otros idiomas.
- Riesgo de alucinación en definiciones de marcos y elementos: al ser un modelo generativo, puede producir anotaciones plausibles pero incorrectas; se recomienda validación humana en producción.
- Licencia llama3.1: impone restricciones de uso comercial (política de uso aceptable de Meta) y obligaciones de atribución; revisar los términos antes de desplegar en producto.
- El adaptador requiere cargar el modelo base completo (8B), por lo que el requisito de VRAM es el del base, no el del adaptador.
- No hay información sobre sesgos específicos del ajuste fino; hereda los sesgos del base Llama 3.1.
- No se documentan capacidades de tool calling ni de agentes para el adaptador; no asumirlas sin verificación.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/shahidrai/llama_3.2_3b_finetuned
- Repositorio activo recomendado: https://huggingface.co/sag-uniroma2/FrameLLaMA-3.2-8B-Instruct-50FramesFN17
- Versión FrameNet completo: https://huggingface.co/sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-FullFN17
- Paper ACL 2026 (FullFN17): https://aclanthology.org/2026.acl-short.55/
- Versión multilingüe (inglés, italiano, urdu): https://huggingface.co/sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-FN17-Multilingual
- Código multilingüe: https://github.com/crux82/FrameLLaMA-Multilingual
- Paper *SEM 2025: https://aclanthology.org/2025.starsem-1.3/
- DOI del paper: https://doi.org/10.18653/v1/2025.starsem-1.3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
