# ishikaa/acquisition_student_AS_tracin_medmcqa_llama8b_5000

## Resumen

El modelo ishikaa/acquisition_student_AS_tracin_medmcqa_llama8b_5000 es un ajuste fino sobre un modelo Llama de 8.000 millones de parámetros, publicado por el usuario ishikaa en HuggingFace. Por la nomenclatura y los checkpoints hermanos del mismo autor (acquisition_student_original, acquisition_student_AS_format, acquisition_student_AS_tracin), todo apunta a un modelo "student" entrenado sobre un subconjunto de 5.000 ejemplos del corpus MedMCQA (preguntas de opción múltiple de medicina), seleccionados mediante la técnica de influence functions TracIn. El sufijo "5000" y los 8.030.261.248 parámetros coinciden exactamente con la arquitectura Llama 3.1 8B.

Se trata, por tanto, de un artefacto de investigación centrado en data acquisition (selección de datos de entrenamiento), no de un modelo de propósito general listo para producción. La model card es la plantilla autogenerada por HuggingFace y no documenta entrenamiento, licencia, idiomas ni evaluación. Acumula 0 descargas y 0 "likes", y el repositorio ocupa 16,1 GB en safetensors.

Su interés es doble: por un lado, permite estudiar cómo afecta la selección de datos (TracIn frente a otras estrategias) al ajuste fino en un dominio médico; por otro, sirve como ejemplo de checkpoint intermedio dentro de un pipeline experimental de influence functions.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (inferido por el tag "llama" y el recuento de parametros) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el checkpoint hermano acquisition_student_AS_format_medmcqa_llama8b_10000 figura con 32.768 tokens en agregadores de terceros) |
| Tipos de cuantizacion | no disponible oficialmente; pesos safetensors en bf16/fp16. Conversiones a GGUF/AWQ/GPTQ factibles pero no publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia; al derivar de Llama, probablemente aplique la Llama Community License, sin confirmar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Llama. El recuento exacto de 8.030.261.248 parámetros coincide con Llama 3.1 8B, lo que sugiere que el ajuste parte de ese checkpoint base. El tag "llama" refuerza esta hipótesis, aunque la model card no confirma ni la versión concreta ni el procedimiento de entrenamiento.

El nombre del modelo apunta a un flujo de trabajo de data acquisition: se toma el corpus MedMCQA y se seleccionan 5.000 ejemplos mediante TracIn (Estimating Training Data Influence by Tracing Gradient Descent), un método de influence functions que estima la contribución de cada ejemplo de entrenamiento rastreando el descenso de gradiente a lo largo del entrenamiento. El resultado sería un modelo "student" ajustado solo con ese subconjunto seleccionado. No hay información disponible sobre hiperparámetros, composición exacta del dataset, número de tokens vistos, ni sobre si se aplicó RLHF o DPO. El tag arxiv:1910.09700 corresponde al artículo de Lacoste et al. sobre emisiones de carbono, incluido en la plantilla automática, no a un paper propio del modelo.

## Capacidades

- Generación de texto y respuesta a preguntas con formato de opción múltiple en el dominio médico (MedMCQA), según se deduce del nombre del checkpoint; sin confirmación en documentación.
- Capacidad conversacional (tag "conversational") heredada del modelo base.
- Soporte de text-generation-inference y endpoints compatibles para despliegue.
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Visión o audio: no disponible.
- Al ser un ajuste especializado, es probable que sus capacidades generales se hayan degradado respecto al modelo base por sobreajuste al subconjunto médico, pero esto no está documentado.

## Casos de uso

- Investigación en data acquisition: comparar el rendimiento de este checkpoint (selección TracIn, 5.000 ejemplos) frente a los hermanos original y AS_format para medir el impacto de la estrategia de selección de datos.
- Estudio de influence functions: usar el modelo como referencia en experimentos que reproduzcan TracIn sobre MedMCQA y evaluar la correlación entre influencia estimada y mejora downstream.
- Evaluación de ajuste fino en dominio médico: analizar cómo un subconjunto reducido de preguntas médicas modifica el comportamiento del modelo en tareas clínicas de opción múltiple.
- Docencia y divulgación: ejemplo reproducible de pipeline de active learning con checkpoints intermedios publicados.
- Reproducibilidad académica: punto de partida para replicar experimentos de selección de datos sin reentrenar desde cero.
- Análisis de sensibilidad al tamaño de muestra: el par 5000/10000 (junto con los checkpoints hermanos) permite estudiar el efecto del tamaño del subconjunto.
- No se recomienda su uso directo como asistente clínico ni en producción sin evaluación adicional, dado que no hay datos de rendimiento ni de seguridad publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada:
  - bf16/fp16 (pesos completos): ~16,1 GB.
  - INT8: ~8,5 GB.
  - INT4 (GGUF Q4_K_M o similar): ~4,5-5 GB.
- GPU recomendadas:
  - A100 40/80 GB o H100 para inferencia en bf16 con margen para contexto largo.
  - RTX 4090 / RTX 3090 (24 GB) para bf16 con lotes pequeños y contexto moderado.
  - RTX 4060 Ti 16 GB, RTX 4080 16 GB o RTX 3060 12 GB para versiones cuantizadas (INT8/INT4).
- Cabe en GPU de consumo: sí, en bf16 con 24 GB (ajustado) y con holgura en cuantizaciones INT8/INT4.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama (requiere conversión a GGUF). Los tags del repo incluyen text-generation-inference y endpoints_compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ishikaa/acquisition_student_AS_tracin_medmcqa_llama8b_5000 | 8,03 B | no disponible | sin benchmarks publicados | no disponible | HuggingFace (0 descargas) |
| meta-llama/Llama-3.1-8B | 8,03 B | 128.000 tokens | benchmarks públicos en la model card | Llama 3.1 Community License | HuggingFace, ampliamente desplegado |
| Qwen2.5-7B | 7,6 B | 128.000 tokens | benchmarks públicos | Apache 2.0 (mayoría de variantes) | HuggingFace |
| Meditron-7B | 7 B | 4.096 tokens | benchmarks médicos públicos | Llama 2 Community License | HuggingFace |

Nota: la comparativa con Llama 3.1 8B se basa en la coincidencia exacta de parámetros; no está confirmado que este checkpoint derive de esa versión concreta.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada y no contiene información sobre sesgos, riesgos ni recomendaciones.
- Licencia no declarada: no puede asumirse uso comercial libre; probablemente herede las restricciones de la Llama Community License, pero debe verificarse con el autor.
- Riesgo de alucinación médica: un modelo ajustado sobre preguntas de opción múltiple de medicina puede generar contenido clínico plausible pero incorrecto. No debe usarse para diagnóstico ni consejo médico.
- Posible sobreajuste al subconjunto de 5.000 ejemplos, con degradación de capacidades generales y de sentido común.
- Sin datos de evaluación: no hay MMLU, MedQA, HumanEval ni ninguna métrica que permita validar su calidad.
- 0 descargas y 0 "likes": no ha sido validado por la comunidad.
- Idiomas soportados no confirmados; se desconoce su comportamiento en castellano.
- Longitud de contexto no confirmada para este checkpoint concreto.
- Formato de solo safetensors: no hay GGUF ni cuantizaciones listas para usar, lo que obliga a convertir manualmente para despliegues en consumer.
- Sin información sobre datos de entrenamiento, sesgos demográficos ni procedencia del corpus, lo que dificulta cualquier auditoría.

## Enlaces

- HuggingFace: https://huggingface.co/ishikaa/acquisition_student_AS_tracin_medmcqa_llama8b_5000
- Checkpoint hermano (AS_format, 10000): https://huggingface.co/ishikaa/acquisition_student_AS_format_medmcqa_llama8b_10000
- Checkpoint hermano (original, 10000): https://huggingface.co/ishikaa/acquisition_student_original_medmcqa_llama8b_10000
- Checkpoint hermano (qwen3b, 5000): https://friendli.ai/models/ishikaa/acquisition_student_AS_tracin_medmcqa_qwen3b_5000
- Ficha de terceros del checkpoint AS_format (contexto 32.768): https://featherless.ai/models/ishikaa/acquisition_student_AS_format_medmcqa_llama8b_10000
- Dataset MedMCQA (referencia del dominio): no disponible en la información proporcionada.
- Paper de TracIn (referencia metodológica del nombre del modelo): no disponible en la información proporcionada.
- Artículo citado en el tag arxiv:1910.09700 (Lacoste et al., emisiones de ML): https://arxiv.org/abs/1910.09700
