# RKB109/clinical-rag-safety-gateway-20260914-model

## Resumen

El modelo `clinical-rag-safety-gateway-20260914-model` es un prototipo de software desarrollado por RKB109 para servir como línea base transparente en sistemas de recuperación aumentada (RAG) aplicados al ámbito clínico. No se trata de un modelo de lenguaje de gran tamaño (LLM) alojado, sino de un modelo personalizado que combina pesos por etiqueta con recuperación de evidencia ponderada por IDF. Su objetivo es abordar un problema concreto: que los asistentes clínicos realicen recuperación, atribución de fuentes y abstención explícita antes de que las respuestas lleguen a los equipos de atención.

El modelo fue creado el 14 de septiembre de 2026 y se distribuye bajo licencia MIT. Su tamaño y longitud de contexto no están disponibles en la información proporcionada. La relevancia actual radica en su carácter reproducible y educativo: está pensado para demostraciones de arquitectura, integración en pipelines de CI y comparaciones de líneas base locales, sin depender de servicios externos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Custom (pesos por etiqueta + recuperación de evidencia IDF) |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | JSON (formato personalizado) |

## Arquitectura y entrenamiento

La arquitectura del modelo es un diseño custom que, según el autor, no llama a un LLM alojado. Combina pesos por etiqueta (per-label token weights) con un mecanismo de recuperación de evidencia ponderada por IDF. Este enfoque permite obtener atribución de fuentes y abstención explícita, características clave para un sistema de seguridad en el ámbito clínico.

El entrenamiento se realizó sobre un dataset sintético y pequeño, identificado como `RKB109/clinical-rag-safety-gateway-20260914-dataset`. El autor indica que se evaluó con 4 ejemplos de validación (held-out) y que las métricas previstas son `retrieval_accuracy`, `abstention_coverage` y `citation_coverage`. No se mencionan procesos de RLHF, DPO ni ajuste fino con datos de dominio reales. La innovación técnica destacable es la transparencia y reproducibilidad: el repositorio vinculado incluye `train.py`, el split exacto del dataset, el código de evaluación y el formato JSON del modelo.

## Capacidades

- Recuperación de evidencia ponderada por IDF para responder preguntas clínicas basadas en un corpus de documentos.
- Clasificación de texto (text-classification) y similitud de frases (sentence-similarity), tal como declara la model card.
- Tarea de resumen (summarization) declarada por el autor, aunque no se detalla el mecanismo interno.
- Atribución de fuentes y abstención explícita, con métricas previstas de `abstention_coverage` y `citation_coverage`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo de pensamiento.
- Capacidades multilingües no disponibles en la información proporcionada.

## Casos de uso

- Prototipado de arquitecturas RAG en salud: el modelo puede usarse como línea base simple y transparente para comparar con sistemas más complejos que incorporen LLMs, gracias a su bajo coste computacional y su naturaleza reproducible.
- Integración en pipelines de CI/CD: al ser un modelo ligero y sin dependencias externas, puede ejecutarse en entornos de integración continua para validar componentes de recuperación y abstención en cada commit.
- Evaluación de métricas de seguridad en asistentes clínicos: permite medir `retrieval_accuracy`, `abstention_coverage` y `citation_coverage` en flujos de trabajo de RAG, sin necesidad de llamar a servicios externos.
- Experimentación educativa: es adecuado para cursos y talleres sobre IA aplicada a salud, donde se pueden mostrar los principios de recuperación de evidencia y atribución de fuentes con un modelo pequeño y auditable.
- Comparación de líneas base locales: sirve para contrastar el rendimiento de un modelo de recuperación basado en IDF frente a aproximaciones más modernas, en entornos controlados.
- Pruebas de concepto para sistemas de atribución de fuentes: puede emplearse para demostrar cómo un sistema de RAG puede identificar la fuente de una afirmación y abstenerse cuando no hay evidencia suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación proporcionada por el autor es la siguiente:

| Métrica | Resultado |
|---|---|
| Ejemplos de validación (held-out) | 4 |
| Accuracy | 1 |
| Métrica prevista: retrieval_accuracy | no disponible |
| Métrica prevista: abstention_coverage | no disponible |
| Métrica prevista: citation_coverage | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Capacidad de ejecución en GPU de consumo: no disponible.
- Opciones de despliegue: ejecución local mediante Python, integración en scripts de CI. No se mencionan frameworks como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un prototipo personalizado sin arquitectura de LLM estándar. Podría compararse conceptualmente con un modelo de recuperación clásico (por ejemplo, BM25), pero no se dispone de datos de comparación.

## Limitaciones y advertencias

- El dataset es sintético y muy pequeño (solo 4 ejemplos de validación). No debe usarse para decisiones consecuentes sin datos representativos, revisión experta y evaluación de nivel de producción.
- El modelo no debe proporcionar diagnóstico, tratamiento ni consejo médico de emergencia. Su uso está limitado a fines educativos y de investigación.
- No se han evaluado sesgos; la información disponible no incluye análisis de sesgos ni de equidad.
- No se especifican los idiomas soportados, por lo que no se puede garantizar su funcionamiento fuera del ámbito de los datos sintéticos originales.
- La licencia MIT permite uso comercial, pero las limitaciones funcionales del prototipo lo hacen inviable para producción clínica real.
- Riesgo de alucinación: no se ha evaluado; al ser un modelo de recuperación y no generativo, la abstención explícita es esencial para evitar respuestas sin evidencia suficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/clinical-rag-safety-gateway-20260914-model
- Dataset en Hugging Face: https://huggingface.co/datasets/RKB109/clinical-rag-safety-gateway-20260914-dataset
- Repositorio de GitHub mencionado en la model card (URL no disponible en la información proporcionada)
