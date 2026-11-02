# Lagatorase/clausescout-deberta-v3-small-cuad

## Resumen

ClauseScout QA es un modelo de question answering extractivo especializado en la detección de cláusulas en contratos comerciales en inglés. Lo desarrolla el usuario Lagatorase como parte de ClauseScout, un proyecto local-first de revisión contractual, y se construye mediante fine-tuning de `microsoft/deberta-v3-small` sobre el dataset CUAD v1 (Contract Understanding Atticus Dataset). El modelo recibe como entrada una pregunta asociada a uno de los 41 tipos de cláusula de CUAD y devuelve fragmentos del contrato que responden a esa pregunta, junto con una puntuación de confianza.

La arquitectura es un transformer encoder DeBERTa-v3 con 141.305.858 parámetros totales, adaptado a la tarea de span extraction. Su relevancia radica en que ofrece una alternativa ligera y ejecutable en hardware de consumo para una primera pasada de revisión documental, con resultados medidos sobre un conjunto de test reservado de 102 contratos y comparaciones explícitas frente a un LLM local de 7B y frente a una línea base por palabras clave.

El modelo está pensado como ayuda a la revisión, no como sustituto del criterio jurídico. Su autor insiste en que cada fragmento devuelto debe ser leído en el contrato por una persona y en que la ausencia de respuesta no implica la ausencia de la cláusula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (base: microsoft/deberta-v3-small) |
| Parametros totales | 141.305.858 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 512 tokens con stride 256; pregunta truncada a 64 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |
| Tarea | Question answering extractivo (span extraction) |
| Dataset de entrenamiento | theatticusproject/cuad (CUAD v1) |
| Tamaño del repositorio | 0,6 GB |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-small`, un encoder transformer con atención desacoplada y embedding de posiciones relativas, y se ajusta para question answering extractivo: se concatenan pregunta y ventana de contrato, y la cabeza de predicción devuelve los índices de inicio y fin del span de respuesta junto con una puntuación de confianza. El preprocesado divide cada contrato en ventanas de 512 tokens con solapamiento de 256 y trunca la pregunta a 64 tokens.

El entrenamiento se realizó sobre 346 contratos de entrenamiento de CUAD, con 12.980 características con respuesta y 12.989 sin respuesta (una negativa muestreada por cada positiva). Se ejecutaron 4 épocas (3.244 pasos de optimizador) con batch efectivo de 32 (4 ventanas × 8 pasos de acumulación), learning rate 3e-5, semilla 0 y precisión bf16 con pesos maestros en fp32, ya que DeBERTa-v3 desborda en fp16. El hardware empleado fue una GPU de portátil RTX 4050 de 6 GB. La partición se hizo por contrato: 346 para entrenamiento, 62 para validación y 102 de test reservados y ejecutados una sola vez. Todas las decisiones de épocas y umbral (0,1) se tomaron sobre validación.

## Capacidades

- Question answering extractivo sobre contratos en inglés: devuelve spans literales del documento para una pregunta dada.
- Cobertura de los 41 tipos de cláusula de CUAD (ley aplicable, cambio de control, límite de responsabilidad, no competencia, exclusividad, terminación por conveniencia, cesión, responsabilidad ilimitada, entre otros).
- Puntuación de confianza por span, que permite filtrar o priorizar candidatos.
- Grounding estricto: al ser extractivo, solo puede señalar texto presente en el contrato; en la validación del proyecto, 0 de 50.840 spans fueron rechazados por la comprobación literal y 0 de 83.620 en test.
- Procesamiento por lotes de contratos completos mediante ventanas deslizantes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Due diligence en fusiones y adquisiciones: el modelo señala en cada contrato los pasajes candidatos a cláusulas de cambio de control, ley aplicable o límite de responsabilidad, de modo que el revisor empieza por los fragmentos con mayor puntuación en lugar de leer el documento completo.
- Primera pasada en revisión de contratos comerciales: con 48,2 segundos por contrato en una GPU de portátil, se puede procesar un lote de contratos y generar una lista priorizada de cláusulas de alto riesgo para revisión humana.
- Extracción de metadatos contractuales: alimentar un pipeline que localice la cláusula de terminación por conveniencia o la de no competencia y derive campos estructurados para un repositorio documental.
- Revisión asistida en despachos pequeños: al ejecutarse en hardware de consumo (entrenado en una RTX 4050 de 6 GB), permite despliegues locales sin enviar contratos confidenciales a servicios externos.
- Filtrado previo a la revisión por LLM: usar los spans del modelo como candidatos y reservar un LLM mayor para verificar o interpretar solo esos fragmentos, reduciendo coste y latencia frente a pasar el contrato entero por un modelo generativo.
- Control de calidad de plantillas: comparar los spans detectados en contratos de una misma plantilla para identificar desviaciones en cláusulas clave como cesión o responsabilidad ilimitada.
- Construcción de conjuntos de datos etiquetados: los spans con alta confianza y verificados por humanos pueden servir para ampliar anotaciones en dominios no cubiertos por CUAD.

## Benchmarks y rendimiento

Métricas reportadas por el autor. La medida principal es "high-stakes found F2" sobre 8 tipos de cláusula (Anti-Assignment, Cap On Liability, Change Of Control, Exclusivity, Governing Law, Non-Compete, Termination For Convenience, Uncapped Liability), contando un tipo como encontrado solo si uno de los dos spans mostrados es una cita correcta.

| Medida | Validación (62 contratos) | Test (102 contratos, una ejecución) |
|---|---:|---:|
| High-stakes found F2 | 0,763 (0,696-0,820) | 0,752 (0,708-0,787) |
| High-stakes found recall | 0,893 | 0,916 |
| Span AUPR (41 tipos) | 0,391 (0,358-0,424) | 0,378 (0,356-0,405) |
| Precision at 80% recall | 0,318 (0,269-0,355) | 0,324 (0,278-0,356) |
| Spans mostrados por contrato | 41,8 | 35,8 |
| Segundos por contrato (GPU de portátil) | 52,4 | 48,2 |

Comparaciones reportadas por el autor:

| Sistema | High-stakes found F2 en test |
|---|---:|
| Este modelo | 0,752 (0,708-0,787) |
| Línea base por palabras clave | 0,500 (0,432-0,568) |
| Híbrido con qwen2.5:7b verificando candidatos | 0,745 (0,698-0,782) |
| qwen2.5:7b sin fine-tuning (solo validación) | 0,381 (0,315-0,440) |

Una segunda semilla de entrenamiento obtuvo 0,771 en validación frente a 0,763, lo que sugiere que el ruido de entrenamiento es pequeño comparado con el ruido de disponer solo de 62 contratos de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo ocupa aproximadamente 0,6 GB en safetensors; con activaciones y ventanas de 512 tokens, la inferencia cabe holgadamente en GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU consumer moderna; el autor lo entrenó y ejecutó en una RTX 4050 de portátil de 6 GB. Una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM; también puede ejecutarse en CPU, con mayor latencia no documentada.
- Opciones de despliegue: `transformers` (uso directo del modelo, ya que la pipeline de question answering se eliminó en transformers 5), empaquetado en el proyecto ClauseScout; no se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, que no son adecuados para un encoder extractivo de este tipo.
- Latencia y throughput: 48,2 segundos por contrato en test y 52,4 en validación, medidos en una GPU de portátil; no se documenta throughput agregado ni latencia por pregunta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClauseScout QA (este modelo) | 141 M | Ventanas de 512 tokens | QA extractivo fine-tuned en CUAD | CC BY 4.0 | HuggingFace |
| microsoft/deberta-v3-small | 141 M | 512 tokens | Encoder base sin fine-tuning para QA legal | MIT | HuggingFace |
| qwen2.5:7b (sin fine-tuning) | 7B | No disponible en la información | LLM generativo local | No disponible en la información | Local vía Ollama |
| Modelos del paper de CUAD | No disponible en la información | No disponible | QA extractivo sobre CUAD | No disponible | No disponible |

En la comparación medida por el autor, este modelo supera a qwen2.5:7b sin fine-tuning en 0,38 puntos de F2 en validación y empata con el híbrido que usa qwen2.5:7b para verificar candidatos, siendo aproximadamente 1,6 veces más rápido que ese híbrido. El modelo base DeBERTa-v3-small no está ajustado a la tarea y no dispone de métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha entrenado y evaluado con CUAD, compuesto por presentaciones de empresas públicas estadounidenses en SEC EDGAR; estilos de redacción de otras jurisdicciones no están probados (hay 15 contratos de Singapur en proceso de etiquetado, sin resultados).
- Elevado número de falsos positivos: en test, solo el 53% de los tipos de cláusula de alto riesgo que el modelo marca como presentes lo están realmente (58% en validación), con unas 36-42 spans por contrato que el revisor debe leer.
- Las métricas de validación son ligeramente optimistas porque el umbral se ajustó sobre los mismos 62 contratos; las cifras de test son las justas.
- No debe usarse para decidir por sí solo la presencia o ausencia de una cláusula, ni para interpretar jurídicamente su contenido.
- No procesa contratos que no estén en inglés ni documentos escaneados sin OCR.
- No es asesoramiento legal; el autor lo describe explícitamente como ayuda a la revisión.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el modelo base DeBERTa-v3-small es MIT y el dataset CUAD es CC BY 4.0; conviene verificar las condiciones de atribución en un despliegue comercial.
- Riesgo de alucinación estructuralmente bajo en cuanto a la literalidad del texto (modelo extractivo con comprobación de grounding), pero alto en cuanto a la relevancia de los spans devueltos.
- Sesgos no documentados más allá de la limitación de dominio y jurisdicción del corpus de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lagatorase/clausescout-deberta-v3-small-cuad
- Proyecto ClauseScout en GitHub: https://github.com/Lagatorase/clausescout
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad
