# Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-QLoRA

## Resumen

El modelo `Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-QLoRA` es un adaptador PEFT (QLoRA) entrenado sobre el modelo base `Qwen/Qwen2.5-7B-Instruct` para tareas de respuesta a preguntas financieras con razonamiento numérico estructurado. El desarrollador, Mark Paul Rosenthal (usuario Mr-Rosen), lo ha publicado como parte del estudio "Accuracy Is Not Enough: A Practical Comparison of RAG, LoRA, QLoRA, and Hybrid LLM Systems for Financial Question Answering", que compara metodologías de ajuste fino en escenarios de producción con recursos limitados.

El adaptador se ha entrenado sobre el dataset `Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-Dataset`, una versión extendida del conjunto FinQA que incluye contexto completo (pregunta, texto previo, tabla y texto posterior). El modelo genera programas FinQA (JSON) que representan operaciones numéricas sobre los datos del documento financiero. La licencia del adaptador es MIT, y el dataset se distribuye bajo CC BY 4.0.

La relevancia de este modelo radica en que ofrece una precisión de ejecución del 73,32 % en el conjunto de test extendido de FinQA, con un coste de entrenamiento de aproximadamente 36,43 dólares y un tiempo de 19,28 horas, lo que lo hace viable para equipos pequeños. El adaptador se puede cargar sobre el modelo base en precisión estándar o con cuantización opcional de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer autoregresivo) |
| Parametros totales | No disponible (el adaptador es de ~0.7 GB en el repositorio; el modelo base tiene ~7.6B de parámetros, pero no se especifica el total del conjunto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | Durante el entrenamiento: base cuantizada en NF4 de 4 bits con doble cuantización y cómputo en bfloat16. Para inferencia, el adaptador puede cargarse con la base en bfloat16 o con cuantización 4-bit opcional. |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se indica en la información del adaptador) |
| Licencia | MIT (adaptador) |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El adaptador utiliza una arquitectura LoRA de rango 64 y alpha 32, con dropout de 0.05 y sin bias. Las capas objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó mediante QLoRA, cuantizando el modelo base en 4 bits con tipo NF4, doble cuantización y cómputo en bfloat16. El dataset de entrenamiento consiste en el contexto completo de FinQA: pregunta, texto previo, tabla y texto posterior. La entrada se procesa mediante la plantilla `S2_financial_analyst_operation_reader.json`, incluida en el repositorio. El objetivo es generar el programa FinQA correspondiente (`qa.program`). Se completaron 3 épocas en 19,28 horas, con un coste estimado de 36,43 dólares. El adaptador seleccionado es el de la época 2, elegido por su precisión de ejecución en desarrollo.

## Capacidades

- Generación de programas FinQA estructurados (JSON) que representan operaciones numéricas para responder preguntas financieras.
- Razonamiento numérico sobre datos tabulares y textuales de informes financieros.
- Extracción de información de documentos financieros con contexto extenso (texto previo, tabla, texto posterior).
- Soporte de entrada en formato conversacional (pregunta + contexto) y salida como programa de ejecución.
- No se menciona soporte de tool calling, agentes ni capacidades multimodales.
- Capacidades multilingües dependen del modelo base Qwen2.5-7B-Instruct, pero no se especifican en la documentación del adaptador.

## Casos de uso

- **Análisis de informes financieros (10-K, 10-Q)**: el modelo puede extraer valores numéricos de tablas y texto, y generar el programa de cálculo que responde a preguntas como "¿Cuál es el margen bruto de 2023?".
- **Auditoría y validación de datos financieros**: se puede usar para verificar la coherencia de cifras en documentos corporativos, generando los pasos de cálculo y comparando con valores esperados.
- **Asistencia a analistas financieros**: integrado en herramientas de análisis, el modelo genera automáticamente el razonamiento numérico para preguntas sobre ratios, variaciones y tendencias.
- **Automatización de reportes**: en sistemas de generación de informes, el modelo puede producir las operaciones necesarias para calcular métricas y presentar resultados de forma estructurada.
- **Plataformas de educación financiera**: dado que genera programas paso a paso, puede usarse para explicar cómo se calculan indicadores financieros a estudiantes.
- **Sistemas de QA financiero en entornos empresariales**: integrado en un pipeline de RAG o en un chatbot interno, permite responder preguntas numéricas sobre documentos propios con un coste computacional bajo.

## Benchmarks y rendimiento

Según la model card, el adaptador obtuvo los siguientes resultados en el conjunto de test de FinQA Natively Extended:

| Metrica | Valor |
|---|---|
| Execution Accuracy | 73,32 % |
| Program Accuracy | 68,53 % |
| Parse Success | 100,00 % |
| Parse Failures | 0 |
| Latencia media | 0,5657 s/ejemplo |

No se proporcionan comparaciones con otros modelos en la información disponible. El resultado es específico de la configuración experimental del estudio y del conjunto de test extendido.

## Requisitos de hardware

- **VRAM estimada**: el adaptador en sí ocupa ~0.7 GB. El modelo base Qwen2.5-7B-Instruct requiere aproximadamente 15 GB en bfloat16 (para inferencia sin cuantización) y unos 8-9 GB si se carga en 4 bits con bitsandbytes.
- **GPU recomendadas**: para inferencia en bfloat16 se recomienda una GPU con 16 GB o más (p. ej., RTX 4090, A100 40 GB, V100 32 GB). Con cuantización 4-bit, es suficiente una GPU con 8 GB (p. ej., RTX 3060, RTX 4060, RTX 3070).
- **Compatibilidad con consumer GPU**: sí, es viable en GPUs de consumo como RTX 3090/4090 con cuantización 4-bit, y en tarjetas de 16 GB en precisión media.
- **Opciones de despliegue**: la documentación oficial muestra carga mediante `transformers` y `PEFT` con `PeftModel`. Se puede integrar en vLLM o TGI, pero no se menciona explícitamente en la documentación.
- **Latencia**: el estudio reporta una latencia media de 0,5657 s por ejemplo en el hardware de evaluación, lo que sugiere un rendimiento aceptable para uso interactivo.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. El modelo no se compara con otros adaptadores o modelos de razonamiento financiero. Se puede indicar que el estudio original compara RAG, LoRA, QLoRA y sistemas híbridos, pero no se dan resultados numéricos de los otros métodos en esta documentación.

## Limitaciones y advertencias

- El resultado del 73,32 % de precisión de ejecución es específico del conjunto de test de FinQA extendido y de la configuración experimental del estudio. No se ha evaluado en otros documentos financieros o dominios.
- El adaptador no es un modelo autónomo; requiere el modelo base Qwen2.5-7B-Instruct para funcionar. Las limitaciones del modelo base (sesgos, alucinaciones, limitaciones de contexto) se heredan.
- El modelo está diseñado para generar programas FinQA; no se ha entrenado para tareas generales de conversación o razonamiento financiero libre.
- La licencia del adaptador es MIT, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache 2.0 según la información del modelo base, aunque no se menciona en la documentación del adaptador). El dataset FinQA se distribuye bajo CC BY 4.0.
- No se proporciona información sobre sesgos específicos del adaptador ni sobre riesgos de alucinación en contextos financieros. Se recomienda validar los resultados antes de usar en producción.

## Enlaces

- Repositorio del adaptador en Hugging Face: [https://huggingface.co/Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-QLoRA](https://huggingface.co/Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-QLoRA)
- Repositorio del estudio (código, prompt, evaluador, resultados): [https://github.com/MarkPaulRosenthal/Accuracy-Is-Not-Enough-Practical-Financial-QA](https://github.com/MarkPaulRosenthal/Accuracy-Is-Not-Enough-Practical-Financial-QA)
- Dataset utilizado: [https://huggingface.co/datasets/Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-Dataset](https://huggingface.co/datasets/Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-Dataset)
