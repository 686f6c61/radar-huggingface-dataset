# 47ag925/kormed-mcqa-klue-roberta

## Resumen

El modelo `47ag925/kormed-mcqa-klue-roberta` es un clasificador de preguntas de opción múltiple (5 opciones) especializado en el dominio médico coreano. Fue desarrollado por el usuario 47ag925 mediante fine-tuning del modelo `klue/roberta-base` sobre el dataset `sean0042/KorMedMCQA` (configuración `doctor`), que contiene preguntas del examen nacional de médicos de Corea del Sur. El objetivo es responder correctamente a preguntas de opción múltiple sobre medicina, un problema de clasificación de secuencias con una arquitectura encoder-only.

La arquitectura es un transformer encoder (RoBERTa) con 110.621.957 parámetros, lo que lo sitúa en la categoría de modelos ligeros. No se especifica la longitud de contexto oficial, aunque el código de ejemplo trunca las entradas a 256 tokens, y la arquitectura RoBERTa-base soporta hasta 512. El modelo se distribuye bajo licencia CC-BY-4.0 y solo está disponible en formato `safetensors`. Su relevancia radica en ser un recurso específico para NLP médica en coreano, aunque su entrenamiento se realizó con un conjunto de datos muy reducido (1.890 ejemplos), lo que limita su generalización fuera del dominio del examen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa) |
| Parametros totales | 110.621.957 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 256 tokens; RoBERTa-base soporta hasta 512) |
| Tipos de cuantizacion | no disponible (solo pesos en FP32) |
| Idiomas soportados | coreano (ko) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `klue/roberta-base`, un transformer encoder-only preentrenado para coreano. Se añade una cabeza de clasificación de secuencias con 5 salidas (A, B, C, D, E) para resolver preguntas de opción múltiple. El entrenamiento se realizó sobre el dataset `sean0042/KorMedMCQA` (configuración `doctor`), con 1.890 ejemplos de entrenamiento, 164 de validación y 435 de prueba. Los hiperparámetros reportados son 3 épocas, tamaño de lote 16 y tasa de aprendizaje 2e-5. No se menciona el uso de técnicas como RLHF, DPO ni decodificación especulativa; se trata de un fine-tuning estándar de clasificación.

## Capacidades

- Clasificación de preguntas de opción múltiple (5 opciones) en coreano médico, basadas en el examen nacional de médicos de Corea del Sur.
- Generación de texto: no, al ser un modelo encoder-only no genera texto libre.
- Razonamiento: limitado a la selección de una opción entre cinco; no ofrece explicaciones ni justificaciones.
- Código, matemáticas, visión: no disponible.
- Soporte de tool calling / function calling: no.
- Soporte de agentes y multi-step reasoning: no.
- Capacidades multilingües: solo coreano; no hay evidencia de soporte para otros idiomas.
- Capacidades especiales: ninguna (no hay modo de pensamiento, visión ni audio).

## Casos de uso

- Simulación de exámenes de medicina: el modelo puede usarse para generar preguntas de práctica del examen nacional coreano, evaluando automáticamente si un estudiante selecciona la opción correcta.
- Plataformas de e-learning médico: integración en aplicaciones educativas que presentan preguntas de opción múltiple a estudiantes de medicina y necesitan una corrección automática.
- Sistemas de apoyo a la decisión clínica (limitado): como componente de un sistema que filtra preguntas clínicas y sugiere la opción más plausible, aunque no reemplaza el juicio médico.
- Investigación en NLP médica: sirve como baseline para evaluar modelos de comprensión de texto médico en coreano, especialmente en tareas de opción múltiple.
- Automatización de evaluaciones en instituciones sanitarias: uso en hospitales o centros de formación para calificar tests de conocimiento médico interno.
- Filtrado de preguntas en bancos de preguntas: clasificar si una pregunta de opción múltiple tiene una respuesta correcta entre las opciones dadas, ayudando a depurar datasets médicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona `accuracy` como métrica de evaluación, pero no proporciona valores numéricos ni comparaciones con otros modelos. No se debe asumir ningún rendimiento específico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (110,6 millones de parámetros × 4 bytes), más overhead de tokenizador y activaciones; en la práctica, menos de 1 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA T4, RTX 3060, A10G o superiores.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en tarjetas como RTX 3050 o inferiores.
- Opciones de despliegue: se puede servir con la librería `transformers` de HuggingFace mediante `AutoModelForSequenceClassification`; también es compatible con pipelines de HuggingFace para clasificación de texto. No se recomienda vLLM ni TGI por ser un modelo encoder-only.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (KorMedMCQA). Como referencia, se puede comparar con el modelo base `klue/roberta-base`, que no está especializado en el dominio médico y presenta una precisión menor en esta tarea específica. No hay datos de otros modelos fine-tuned sobre KorMedMCQA en la información proporcionada.

| Modelo | Parametros | Contexto maximo | Tarea | Licencia |
|---|---|---|---|---|
| kormed-mcqa-klue-roberta | 110.621.957 | no disponible (truncado a 256) | Clasificación de opción múltiple médica | CC-BY-4.0 |
| klue/roberta-base | ~110M | 512 | Modelo base coreano | MIT (según KLUE) |

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado; al entrenarse solo con preguntas del examen médico coreano, puede reflejar sesgos de ese dominio y contexto cultural.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, por lo que no hay alucinación en el sentido generativo; sin embargo, puede seleccionar incorrectamente una opción, lo que en un entorno clínico podría tener consecuencias graves.
- Limitaciones de contexto: el código de ejemplo trunca las entradas a 256 tokens; preguntas largas con más contexto pueden perder información relevante.
- Restricciones de licencia: la licencia CC-BY-4.0 permite uso comercial con atribución; no hay restricciones adicionales conocidas.
- Caveats importantes para producción: el modelo fue entrenado con solo 1.890 ejemplos, por lo que su capacidad para generalizar fuera del dominio del examen nacional de médicos coreanos es limitada. No debe usarse como herramienta de diagnóstico clínico ni como sustituto del criterio profesional.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/47ag925/kormed-mcqa-klue-roberta
- Dataset KorMedMCQA: https://huggingface.co/datasets/sean0042/KorMedMCQA
- Modelo base klue/roberta-base: https://huggingface.co/klue/roberta-base
- Repositorio de KLUE benchmark: https://github.com/KLUE-benchmark/KLUE
