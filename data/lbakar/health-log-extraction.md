# lbakar/health-log-extraction

## Resumen

El modelo `lbakar/health-log-extraction` es un sistema de extracción de información sanitaria desarrollado por lbakar a partir de un ajuste fino (fine-tuning) de Qwen3-0.6B, un modelo de lenguaje de 596 millones de parámetros. Su propósito es transformar entradas de texto libre, similares a las de un diario personal, en datos estructurados en formato JSON siguiendo una plantilla predefinida que cubre actividades, alimentación, estado de ánimo, síntomas y tratamientos. Este enfoque permite automatizar el registro y análisis de información de salud a partir de narrativas cotidianas, lo que resulta útil para aplicaciones de seguimiento personal, historiales clínicos enriquecidos o asistentes de bienestar.

La relevancia actual radica en la creciente demanda de herramientas que conviertan texto no estructurado en datos accionables, especialmente en el ámbito sanitario donde los registros suelen ser informales. Al estar basado en un modelo pequeño y eficiente, ofrece una solución ligera y de bajo coste computacional, adecuada para entornos con recursos limitados. La licencia Apache-2.0 facilita su integración en proyectos comerciales y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante un ajuste fino del modelo base Qwen/Qwen3-0.6B, una arquitectura transformer autoregresiva. El proceso de entrenamiento se centra en una única tarea de extracción de información con una plantilla JSON fija, lo que implica que el modelo ha sido optimizado para generar salidas estructuradas a partir de entradas de texto libre en inglés. No se han proporcionado detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La innovación principal reside en el diseño de la plantilla de extracción, que define campos específicos para actividad, comida, humor, síntoma y tratamiento, permitiendo una salida consistente y fácilmente parseable.

## Capacidades

- Extracción de información estructurada en inglés a partir de texto libre, siguiendo una plantilla JSON predefinida.
- Generación de campos como actividad (tipo, palabras clave, duración, ubicación, fecha), comida (elementos consumidos, faltantes, cantidades), humor (descripción y clasificación), síntoma (palabras clave y descripción) y tratamiento (nombre, dosis, estado).
- Salida en formato JSON válido, lista para integración en pipelines de procesamiento de datos.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, soporte de agentes o multimodalidad.

## Casos de uso

- Registro automatizado de diarios de salud: el modelo puede procesar entradas diarias de usuarios y extraer automáticamente actividades físicas, comidas, síntomas y tratamientos, generando un historial estructurado para aplicaciones de bienestar.
- Integración en sistemas de gestión de datos clínicos: permite convertir notas informales de pacientes en campos estandarizados, facilitando su almacenamiento y consulta en bases de datos médicas.
- Asistentes de salud personal: al recibir descripciones en lenguaje natural, el modelo puede alimentar un asistente que ofrezca recomendaciones basadas en los datos extraídos (por ejemplo, recordatorios de medicación o sugerencias de actividad).
- Análisis de logs de pacientes en investigación: los datos estructurados pueden utilizarse para estudios epidemiológicos o de correlación entre hábitos y síntomas, sin necesidad de anotación manual.
- Enriquecimiento de historiales médicos electrónicos: a partir de narrativas de pacientes, se pueden completar campos faltantes en registros existentes, mejorando la completitud de la información.
- Automatización de encuestas de salud: el modelo puede interpretar respuestas abiertas y convertirlas en datos cuantificables para su posterior análisis estadístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo, ni comparaciones con otros sistemas de extracción de información.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 596 millones de parámetros, en precisión FP16 requiere aproximadamente 1,2 GB de VRAM; en cuantización INT8 se reduce a unos 0,6 GB y en INT4 a unos 0,3 GB (estimaciones basadas en el tamaño del modelo, no en datos oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable latencia.
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de tarjetas gráficas modernas para consumidores.
- Opciones de despliegue: compatible con frameworks como vLLM, llama.cpp, Ollama, TGI y Hugging Face Transformers. El repositorio incluye pesos en safetensors, por lo que puede cargarse directamente con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la misma tarea de extracción de información sanitaria con plantilla fija. El modelo base Qwen3-0.6B es un LLM generalista, pero no se han publicado comparaciones con otros fine-tunes orientados a extracción de información clínica. Por tanto, no se puede ofrecer una tabla comparativa fiable.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la plantilla de extracción descrita; no es generalizable a otras tareas de extracción o generación de texto sin un nuevo ajuste fino.
- Solo soporta inglés; no se ha evaluado su rendimiento en otros idiomas.
- No se han documentado los datos de entrenamiento, por lo que no es posible evaluar sesgos potenciales en términos de género, edad, etnia o condiciones médicas específicas.
- Existe riesgo de alucinación: el modelo podría rellenar campos con información no presente en la entrada, especialmente si el texto es ambiguo o incompleto.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución y cumplir con los términos de la licencia.
- No se han publicado evaluaciones de robustez frente a entradas malformadas o adversariales, lo que debe considerarse antes de un despliegue en producción.

## Enlaces

- HuggingFace: https://huggingface.co/lbakar/health-log-extraction
- Página personal del autor: https://liambakar.github.io/
- Artículo relacionado sobre extracción de información clínica con LLMs: https://www.sciencedirect.com/org/science/article/pii/S281717052500050X
- Evaluación de LLMs para extracción de información clínica: https://www.sciencedirect.com/science/article/pii/S0010482525013654
- MedPromptExtract (herramienta de extracción de datos médicos): https://arxiv.org/pdf/2405.02664
