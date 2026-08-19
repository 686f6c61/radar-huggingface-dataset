# RKB109/clinical-rag-safety-gateway-20260815-model

## Resumen

El modelo `RKB109/clinical-rag-safety-gateway-20260815-model` es un prototipo pequeño y transparente desarrollado por el usuario RKB109, diseñado para demostrar los principios de un asistente clínico seguro basado en recuperación aumentada (RAG). Su objetivo es ilustrar cómo un sistema debe combinar recuperación de evidencia, atribución de fuentes y abstención explícita antes de que cualquier respuesta llegue a los equipos de atención médica. No es un modelo de lenguaje de gran tamaño (LLM) alojado, sino un modelo de demostración que combina pesos por etiqueta con recuperación de evidencia ponderada por IDF (frecuencia inversa de documento).

El modelo está pensado para prototipado de arquitectura, ejemplos de integración continua (CI), comparaciones de referencia locales y experimentación educativa. Fue generado con datos sintéticos y su tamaño es mínimo, aunque no se especifican parámetros ni arquitectura detallada en la información disponible. Su relevancia radica en servir como una línea base reproducible y transparente para evaluar sistemas de RAG clínico, no como una solución lista para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en pesos por etiqueta y recuperación de evidencia ponderada por IDF (no es un transformer estándar) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | JSON (formato propio, según el README) |

## Arquitectura y entrenamiento

El modelo combina pesos por etiqueta con recuperación de evidencia ponderada por IDF. Según el README, no llama a un LLM alojado, lo que sugiere que es un sistema basado en reglas o en estadísticas simples sobre el corpus de evidencia. No se proporcionan detalles sobre el entrenamiento, como el número de tokens o la composición del dataset, más allá de que los datos son sintéticos y de pequeño tamaño. El repositorio vinculado (GitHub) incluye el script de entrenamiento (`train.py`), la división exacta del dataset, el código de evaluación y el formato JSON del modelo, lo que permite reproducir la arquitectura.

## Capacidades

- Generación de respuestas a preguntas (question-answering) sobre datos clínicos sintéticos.
- Clasificación de texto (text-classification) para etiquetado o categorización.
- Similitud de frases (sentence-similarity) para recuperación de evidencia.
- Resumen (summarization) de contenido clínico.
- Abstención explícita: el modelo está diseñado para abstenerse cuando no hay evidencia suficiente, aunque no se detalla el mecanismo exacto.
- Atribución de fuentes: incorpora recuperación de evidencia con ponderación IDF, lo que permite señalar las fuentes utilizadas.

## Casos de uso

- Prototipado de arquitectura: los desarrolladores pueden usar este modelo como base para experimentar con pipelines de RAG clínico sin depender de un LLM externo.
- Evaluación en integración continua (CI): su pequeño tamaño y formato JSON permiten integrarlo en pipelines de CI para validar la lógica de recuperación y abstención.
- Comparación de líneas base: sirve como referencia local para comparar el rendimiento de modelos más complejos en tareas de QA clínico.
- Educación y experimentación: es útil en entornos académicos para enseñar conceptos de recuperación de evidencia, ponderación IDF y diseño de sistemas de seguridad en IA.
- Pruebas de concepto de abstinencia: permite demostrar cómo un sistema puede rechazar responder ante consultas sin evidencia suficiente, un requisito crítico en entornos clínicos.
- Validación de métricas de seguridad: con las métricas previstas (retrieval_accuracy, abstention_coverage, citation_coverage), se puede evaluar la cobertura de abstención y citación en un entorno controlado.

## Benchmarks y rendimiento

El README reporta una evaluación sobre un conjunto de validación sintético de 4 ejemplos, con una precisión (accuracy) de 1.0. No se proporcionan resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. Las métricas previstas para el sistema son:

| Metrica | Valor |
|---|---|
| Accuracy (sobre 4 ejemplos sintéticos) | 1.0 |
| retrieval_accuracy | no disponible (métrica prevista) |
| abstention_coverage | no disponible (métrica prevista) |
| citation_coverage | no disponible (métrica prevista) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Dado que el modelo es un prototipo pequeño basado en JSON y no un LLM, es probable que pueda ejecutarse en CPU sin necesidad de GPU.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.), pero al ser un modelo propio, se espera que se use mediante el código del repositorio asociado.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (prototipos de RAG clínico con abstención). No se puede realizar una comparativa con alternativas como Llama 3, Mistral o modelos específicos de salud (p. ej., Med-PaLM) porque el modelo no es un LLM y no se han publicado datos comparativos.

## Limitaciones y advertencias

- El modelo se ha entrenado únicamente con datos sintéticos y de pequeño tamaño, por lo que no es adecuado para decisiones clínicas reales.
- No debe utilizarse para proporcionar diagnóstico, tratamiento o consejo médico de emergencia.
- No se recomienda su uso en decisiones consecuentes sin datos representativos, revisión experta y evaluación de calidad de producción.
- No se especifican sesgos conocidos, pero al ser un modelo sintético, puede no reflejar la diversidad de la población real.
- Riesgo de alucinación: al ser un modelo de recuperación, puede generar respuestas incorrectas si la evidencia recuperada es insuficiente o errónea, aunque el diseño de abstención pretende mitigarlo.
- La licencia MIT permite uso comercial, pero la falta de validación clínica limita su aplicabilidad en entornos productivos.

## Enlaces

- HuggingFace: [https://huggingface.co/RKB109/clinical-rag-safety-gateway-20260815-model](https://huggingface.co/RKB109/clinical-rag-safety-gateway-20260815-model)
- Dataset asociado: [https://huggingface.co/datasets/RKB109/clinical-rag-safety-gateway-20260815-dataset](https://huggingface.co/datasets/RKB109/clinical-rag-safety-gateway-20260815-dataset)
- Repositorio GitHub: mencionado en el README, pero no se proporciona URL en la información disponible.
