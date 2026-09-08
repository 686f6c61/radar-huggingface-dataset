# RKB109/rag-evaluation-lab-20260908-model

## Resumen

El modelo RKB109/rag-evaluation-lab-20260908-model es un prototipo pequeño y transparente desarrollado por RKB109 como parte del proyecto RAG Evaluation Lab. Su objetivo principal es ofrecer un baseline reproducible para evaluar sistemas de retrieval-augmented generation (RAG), que habitualmente carecen de un conjunto de regresión estable o de una taxonomía de fallos definida. El modelo combina pesos de tokens por etiqueta con recuperación de evidencia ponderada por IDF, y no depende de un LLM alojado.

Se trata de un modelo de prototipo, no de un modelo de lenguaje neuronal. No se especifican parámetros totales, arquitectura estándar ni longitud de contexto en la información proporcionada. Según el README, fue generado para demostraciones de arquitectura reproducibles, y su evaluación se limita a un conjunto sintético de 4 ejemplos hold-out, con una accuracy de 0.75. El repositorio de GitHub asociado incluye el script de entrenamiento, el split del dataset y el código de evaluación.

La relevancia actual de este modelo reside en su papel como referencia educativa y de validación de harness de evaluación para sistemas RAG, permitiendo comprobar métricas como failure_class_accuracy, citation_coverage o release_gate_pass_rate antes de abordar modelos más complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (prototipo custom basado en pesos por etiqueta y recuperacion de evidencia ponderada por IDF) |
| Parametros totales | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no es un modelo neuronal con pesos cuantificables) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | JSON (formato de modelo descrito en el README) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada formalmente. Según el README, el modelo combina pesos de tokens por etiqueta (per-label token weights) con un mecanismo de recuperación de evidencia ponderada por IDF. No es un transformer, ni un modelo de lenguaje grande, ni un sistema MoE. Se trata de un prototipo determinista que no invoca a un LLM alojado; su lógica parece basada en reglas y pesos precalculados sobre el dataset.

El entrenamiento se realizó sobre el dataset sintético RKB109/rag-evaluation-lab-20260908-dataset. El número de tokens de entrenamiento, la composición detallada del dataset y cualquier técnica de ajuste como RLHF o DPO no están disponibles. La evaluación reportada se limita a 4 ejemplos sintéticos hold-out con una accuracy de 0.75. El repositorio de GitHub asociado incluye `train.py`, el split exacto del dataset y el código de evaluación, lo cual facilita la reproducibilidad.

## Capacidades

- Clasificación de texto: puede asignar etiquetas de fallo (failure classes) a fragmentos de texto, según la cobertura de tasks de Hugging Face.
- Question answering básico: responde preguntas simples mediante recuperación de evidencia ponderada por IDF, sin generación libre.
- Text-ranking: es capaz de ordenar fragmentos de texto por relevancia utilizando puntuaciones IDF.
- Summarization básico: podría producir resúmenes basados en la evidencia recuperada, aunque sin capacidad de generación avanzada.
- Prototipado de arquitectura: sirve como base para demostrar cómo se estructura un sistema de evaluación RAG.
- Evaluación en CI: puede integrarse en pipelines de integración continua para validar las métricas de calidad de un sistema RAG.
- No soporta tool calling, function calling, agentes autónomos, razonamiento multi-paso ni modo thinking, ya que no es un modelo de lenguaje.

## Casos de uso

- Validación de harness de evaluación: el modelo puede ejecutarse dentro de un pipeline de CI para comprobar que las métricas de evaluación (failure_class_accuracy, citation_coverage, release_gate_pass_rate) se calculan correctamente, sin depender de APIs externas.
- Prototipado de taxonomía de fallos: permite definir y experimentar con categorías de errores de RAG en un dominio concreto, sirviendo como base para diseñar un conjunto de regresión real.
- Comparación de baselines en entornos reproducibles: al ser transparente y pequeño, es útil como baseline determinista para comparar con otros modelos de evaluación RAG en laboratorio.
- Educación en evaluación de RAG: los estudiantes pueden inspeccionar el formato JSON del modelo y el código `train.py` para entender cómo funcionan los pesos por etiqueta y la recuperación por IDF, y cómo se estructura una evaluación.
- Calibración de herramientas de evaluación antes de usar un LLM: este prototipo permite verificar que el harness de evaluación está correctamente montado y que los resultados son estables, reduciendo el riesgo de errores al introducir modelos más costosos.
- Investigación reproducible sobre evaluación de RAG: el dataset sintético y el código abierto permiten experimentar con diferentes métricas y estrategias de evaluación sin necesidad de recursos de GPU ni de servicios en la nube.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0.75 | 4 ejemplos sintéticos de validación (held-out) |
| Métricas previstas | failure_class_accuracy, citation_coverage, release_gate_pass_rate | No disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- No requiere VRAM para inferencia, al tratarse de un modelo basado en reglas y pesos precalculados, sin capas neuronales.
- Puede ejecutarse en CPU, en cualquier máquina con Python y las dependencias indicadas en el repositorio.
- No requiere GPU específica (A100, H100, RTX 4090, etc.), aunque puede ejecutarse en ellas si se desea.
- No es compatible con vLLM, Ollama, TGI u otros servidores de inferencia de LLM, dado que no es un modelo de lenguaje estándar.
- La latencia y el throughput no están disponibles; dependen de la implementación concreta de la lógica de ponderación y recuperación.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. Este modelo es un prototipo de evaluación y no un modelo de lenguaje de propósito general, por lo que comparaciones con otros LLM no son aplicables.

## Limitaciones y advertencias

- Los casos sintéticos validan el harness de evaluación, pero no representan un sistema RAG de producción.
- El dataset es sintético y muy pequeño (4 ejemplos held-out); no se debe usar el modelo para decisiones consecuentes sin datos representativos, revisión experta y evaluación de producción.
- No es un modelo de lenguaje; carece de capacidades de generación de lenguaje natural compleja, razonamiento avanzado o soporte de herramientas.
- El rendimiento reportado (accuracy 0.75) no es generalizable a otros dominios o idiomas.
- No hay información sobre sesgos específicos ni sobre la cobertura de idiomas; el tag `region:us` sugiere un enfoque inicial en inglés, pero no está confirmado.
- La licencia MIT permite uso comercial, pero el modelo no es apto para producción sin una validación previa y adaptación a datos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/rag-evaluation-lab-20260908-model
- Dataset en Hugging Face: https://huggingface.co/datasets/RKB109/rag-evaluation-lab-20260908-dataset
- Repositorio GitHub del proyecto RAG Evaluation Lab: https://github.com/gratycodes/rag-evaluation-lab
