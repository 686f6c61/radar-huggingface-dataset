# hmarchant/speaker-id-joint-int8

## Resumen

El modelo `hmarchant/speaker-id-joint-int8` es una versión cuantizada en INT8 (pesos) del Joint Speaker Identifier desarrollado por Adobe Research para la identificación de hablantes en transcripciones de diálogos. La cuantización fue realizada por un tercero (hmarchant) sobre el checkpoint FP32 original, empaquetando los pesos de las capas lineales a INT8 con un tamaño de grupo de 64, sin entrenamiento adicional. Este proceso reduce el tamaño en memoria de los pesos a aproximadamente un tercio (472 MB frente a 1633 MB del modelo FP32), manteniendo exactamente la misma precisión, F1 y exactitud (Δ = 0.00). El modelo está basado en RoBERTa-large y se presenta como un checkpoint con licencia Adobe Research, restringida a uso no comercial.

La relevancia de este modelo radica en su utilidad para aplicaciones de procesamiento de lenguaje natural centradas en la atribución de diálogos, como el análisis de transcripciones de reuniones o la extracción de quién dice qué en una conversación. Al ser una cuantización, permite desplegar el modelo en entornos con recursos limitados (por ejemplo, en un portátil con Apple Silicon) sin degradación de rendimiento. Sin embargo, su licencia limita su uso comercial, lo que condiciona su aplicación en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en RoBERTa-large con cabeza de clasificación para identificación de hablantes (modelo conjunto) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 weight-only (group size 64) |
| Idiomas soportados | No disponible |
| Licencia | Adobe Research License (solo uso no comercial) |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

El modelo original es el Joint Speaker Identifier de Adobe Research, presentado en Interspeech 2024. Se basa en el modelo RoBERTa-large como backbone y una cabeza de clasificación para determinar si cada nombre mencionado en una transcripción corresponde a un hablante real en el diálogo. El checkpoint cuantizado no ha sido entrenado; se trata de una compresión de los pesos lineales a INT8 con un tamaño de grupo de 64, lo que permite una reducción de memoria de aproximadamente 3,5 veces sin pérdida de precisión. No se dispone de información sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO, etc.) en la documentación proporcionada.

## Capacidades

- Identificación de hablantes en transcripciones de diálogos: dado un texto y un nombre, el modelo indica si ese nombre corresponde a un hablante presente.
- Variante conjunta: procesa oraciones con múltiples nombres y devuelve una decisión para cada uno.
- Procesamiento de texto: se basa únicamente en texto, sin entrada de audio.
- Soporte de tool calling: no.
- Soporte de agentes: no.
- Capacidades multilingües: no se ha especificado, aunque el modelo original fue entrenado probablemente con datos en inglés (no confirmado).
- Otras capacidades: no se mencionan.

## Casos de uso

- Análisis de transcripciones de reuniones: el modelo puede atribuir automáticamente intervenciones a cada participante en una transcripción de una reunión, facilitando la generación de actas o resúmenes por persona.
- Clasificación de diálogos en series o películas: para subtítulos o guiones, se puede usar para identificar quién habla en cada línea, útil en herramientas de edición o accesibilidad.
- Enriquecimiento de bases de datos de entrevistas: en investigación de ciencias sociales, se puede etiquetar cada respuesta de una entrevista transcrita con el nombre del entrevistado.
- Verificación de atribución en documentos históricos: para transcripciones de debates o juicios, se puede verificar si un nombre mencionado corresponde a un orador real.
- Integración en pipelines de NLP: al ser un modelo pequeño (472 MB) y con cuantización INT8, se puede integrar en sistemas de procesamiento por lotes en CPU o GPU con baja latencia.
- Prototipado de aplicaciones de análisis de diálogo: para desarrollo de herramientas de análisis de conversaciones, este modelo sirve como componente de identificación de hablantes sin necesidad de hardware especializado.

## Benchmarks y rendimiento

La model card del autor reporta las siguientes métricas para el modelo cuantizado y su comparación con el FP32 original:

| Métrica | Valor (INT8) | Δ vs FP32 |
|---|---|---|
| Precisión | 78.87 | 0.00 |
| F1 | 63.28 | 0.00 |
| Exactitud (Accuracy) | 67.60 | 0.00 |
| Throughput | 18.34 ejemplos/s (Apple M3 Pro, MPS, batch 2) | - |
| Tamaño en memoria | 472 MB | 1633 MB (FP32) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) para este modelo, ya que se trata de una tarea específica de identificación de hablantes y no de un modelo general.

## Requisitos de hardware

- El tamaño en memoria del checkpoint es de 472 MB, por lo que puede cargarse en cualquier GPU con al menos 1 GB de VRAM.
- El modelo se ejecuta sin problemas en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB), o incluso en integradas como Apple M3 Pro (MPS), como se muestra en el throughput reportado.
- También puede ejecutarse en CPU para inferencia por lotes, aunque la latencia será mayor.
- No se requieren GPUs de gama alta como A100 o H100 para este modelo.
- Opciones de despliegue: el modelo se carga mediante PyTorch y el archivo `model.pt`; no se mencionan formatos como GGUF, ONNX o vLLM, por lo que la integración con frameworks de servidor (TGI, vLLM) no está documentada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único punto de comparación es el checkpoint FP32 original de Adobe Research, del cual este modelo es una cuantización sin pérdida de precisión. No se han identificado otros modelos de identificación de hablantes en texto con características similares.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia Adobe Research permite únicamente uso no comercial con fines de investigación. Cualquier uso en producción o comercial está prohibido sin una licencia separada.
- Sesgo potencial: el modelo original fue entrenado probablemente con datos de diálogos en inglés (no confirmado), lo que puede limitar su rendimiento en otros idiomas o variedades dialectales.
- Riesgo de alucinación: como modelo basado en texto, puede atribuir nombres erróneamente si la transcripción es ambigua o contiene errores ortográficos.
- Contexto limitado: no se especifica la longitud de contexto, pero al estar basado en RoBERTa-large, suele ser de 512 tokens, lo que puede ser insuficiente para transcripciones largas sin segmentación previa.
- Dependencia del modelo original: la cuantización no mejora las capacidades del modelo original; solo reduce el tamaño, por lo que las limitaciones del modelo FP32 se mantienen.
- Formato de pesos propietario: el archivo `model.pt` es un formato específico de PyTorch, no es un formato estándar como GGUF o safetensors, lo que limita la interoperabilidad con otras herramientas de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmarchant/speaker-id-joint-int8
- Repositorio de Adobe Research: https://github.com/adobe-research/speaker-identification
- Paper de referencia: https://arxiv.org/abs/2407.12094
- Licencia Adobe Research: https://github.com/adobe-research/speaker-identification/blob/main/LICENSE.md
