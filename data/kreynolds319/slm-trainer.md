# kreynolds319/slm-trainer

## Resumen

El modelo `kreynolds319/slm-trainer` es un fine-tune del modelo base Qwen/Qwen3-1.7B mediante QLoRA, desarrollado por el usuario kreynolds319. Su objetivo es entrenar un modelo de lenguaje pequeño (SLM) para que, ante un documento histórico asignado y una pregunta del estudiante, produzca exactamente una cita textual del documento y una respuesta con el prefijo "According to the document," que no afirme nada más allá de lo citado. El modelo está diseñado para practicar la "disciplina de fuente": si el documento no contiene la respuesta, debe decirlo y mantener esa negativa incluso si el usuario insiste repetidamente.

El entrenamiento utiliza un corpus sintético generado con datos mutados (fechas, cantidades, nombres de lugares, orden de eventos) para enseñar la fidelidad a la fuente, no la veracidad histórica. El modelo final se publica con pesos en bf16 tras fusionar los adaptadores QLoRA. Es relevante porque aborda el problema de la alucinación en modelos pequeños mediante una estrategia de generación anclada a documentos, aunque su caso de uso es muy específico y no debe usarse como fuente de hechos históricos.

La arquitectura base es la de Qwen3-1.7B, un transformer con atención multi-consulta y ventana de contexto de 32K tokens (según el modelo base, aunque no se confirma en la ficha). El modelo tiene 1.720.574.976 parámetros totales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredado del modelo base, no especificado) |
| Tipos de cuantización | bf16 (pesos publicados), entrenado con QLoRA 4-bit |
| Idiomas soportados | No disponible (el modelo base Qwen3 soporta múltiples idiomas, pero el fine-tune está orientado a lectura histórica en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer del modelo Qwen3-1.7B, que incluye atención multi-consulta (GQA) y una ventana de contexto de 32K tokens en su versión original. El fine-tune se realiza mediante QLoRA (4-bit base) con la librería Unsloth, y los adaptadores se fusionan a bf16 para su publicación. El conjunto de entrenamiento contiene 231 ejemplos (filtrados de 240 candidatos) generados sintéticamente con un modelo teacher (`anthropic/claude-opus-5`) a temperatura 0. Se entrenó durante 4 épocas con 60 pasos de optimización y semilla 3407 en una GPU A100.

La innovación principal es la generación anclada a fuentes: cada ejemplo incluye un documento histórico y una pregunta, y el modelo debe producir una cita textual exacta seguida de una respuesta con el prefijo obligatorio "According to the document,". Los datos sintéticos contienen mutaciones controladas (fechas, cantidades, nombres, orden de eventos) y se excluyen afirmaciones morales, políticas o de identidad. Además, un "gate" determinista filtra los datos de entrenamiento usando los mismos criterios que la evaluación, evitando divergencias entre ambos.

## Capacidades

- **Generación de texto citado**: produce una cita literal de un documento fuente y una respuesta que no se desvía de lo citado.
- **Negativa a responder fuera de la fuente**: si el documento no contiene la respuesta, el modelo lo indica explícitamente y lo mantiene incluso ante insistencia del usuario.
- **Formato estricto**: siempre usa el prefijo "According to the document," antes de la respuesta.
- **Multilingüismo limitado**: no se especifica, pero el modelo base Qwen3 soporta varios idiomas; el fine-tune está orientado a textos históricos en inglés.
- **No soporta tool calling ni agentes**: el modelo está especializado en la tarea de QA con citación, no tiene capacidades adicionales.

## Casos de uso

- **Asistentes educativos para lectura de documentos históricos**: el modelo puede ayudar a estudiantes a verificar sus respuestas citando pasajes exactos del material de lectura, evitando que se inventen información.
- **Herramientas de investigación documental**: en proyectos de análisis de textos antiguos o archivos, el modelo permite extraer respuestas con trazabilidad directa a la fuente, útil para auditorías.
- **Sistemas de QA con verificación de fuentes**: integrable en pipelines de procesamiento de documentos para generar respuestas que incluyan la cita correspondiente, reduciendo el riesgo de alucinación en contextos donde la precisión es crítica.
- **Chatbots educativos de historia**: el modelo puede responder preguntas sobre un texto asignado, siempre citando el documento, lo que facilita que el estudiante compruebe la respuesta.
- **Entrenamiento en pensamiento crítico**: dado que los datos contienen historia falsos, el modelo puede servir como herramienta pedagógica para enseñar a los estudiantes a contrastar fuentes y no confiar ciegamente en una sola.
- **Prototipos de bajo coste**: su tamaño pequeño (1.7B) permite ejecutarlo en hardware modesto, lo que lo hace adecuado para pruebas de concepto en entornos educativos o de investigación con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) para este modelo específico en la información disponible. La model card menciona una ablación con modelos frontera (Claude Opus 5 y GPT-5.6-sol) que alcanza 0.96 de adherencia estricta, pero ese dato no corresponde a este modelo sino a la evaluación de modelos grandes en la misma tarea. No hay números de rendimiento para el modelo propio.

## Requisitos de hardware

- **VRAM estimada**: con pesos bf16, el modelo ocupa aproximadamente 3,4 GB (1,72B parámetros × 2 bytes). Con cuantización a 8-bit o 4-bit, el consumo puede reducirse a ~1,7 GB o ~0,9 GB respectivamente.
- **GPU recomendada**: puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB). En A100 o H100 para inferencia de mayor throughput.
- **CPU**: también es posible la inferencia en CPU con cuantización (GGUF) aunque con mayor latencia.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI, HuggingFace Inference Endpoints, o directamente con Transformers.
- **Latencia y throughput**: no disponibles; al ser un modelo pequeño, la latencia esperada es baja (del orden de milisegundos por token en GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se disponen de modelos exactamente comparables con la misma tarea de citación estricta. Como referencia, se puede comparar con el modelo base Qwen3-1.7B y con otros SLMs como TinyLlama-1.1B o Phi-2, pero no existen datos de rendimiento en esta tarea específica. La siguiente tabla compara características generales (no rendimiento):

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| kreynolds319/slm-trainer | 1.72B | No disp. | Apache-2.0 | Citación estricta de documentos |
| Qwen3-1.7B (base) | 1.72B | 32K | Apache-2.0 | Generación general |
| TinyLlama-1.1B | 1.1B | 2K | Apache-2.0 | Generación general |
| Phi-2 | 2.7B | 2K | MIT | Generación general |

No hay datos de benchmarks para comparar rendimiento en tareas de QA con citación.

## Limitaciones y advertencias

- **Datos sintéticos con historia falsa**: el modelo está entrenado para citar documentos que pueden contener errores históricos deliberados. No debe usarse como fuente de hechos reales.
- **Sesgos de la generación sintética**: los datos generados por un teacher model pueden reflejar sesgos del modelo maestro, aunque se aplicaron listas de exclusión para ciertos temas.
- **Riesgo de alucinación**: aunque el modelo está diseñado para citar solo, puede fallar en entornos fuera de su distribución (documentos no vistos o preguntas no relacionadas).
- **Limitación de contexto**: la ventana de contexto no está especificada en la ficha; si se hereda de Qwen3-1.7B, es de 32K, pero no se confirma.
- **Idioma**: no se especifica el soporte de idiomas; probablemente solo inglés.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero el modelo no es fiable para tareas históricas reales.
- **Tamaño de entrenamiento pequeño**: solo 231 ejemplos, lo que limita la generalización a otros tipos de documentos o preguntas.
- **No es un modelo de propósito general**: su capacidad se limita a la tarea de QA con citación; no sirve para otras tareas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/kreynolds319/slm-trainer)
- [Modelo base Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- No se proporciona enlace al repositorio del proyecto ni a papers en la información disponible.
