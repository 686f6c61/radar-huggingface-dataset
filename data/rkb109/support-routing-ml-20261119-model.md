# RKB109/support-routing-ml-20261119-model

## Resumen

El modelo `RKB109/support-routing-ml-20261119-model` es un prototipo de clasificación de texto publicado por el usuario RKB109 en Hugging Face, orientado al enrutamiento de tickets de soporte. No se trata de un transformer de gran escala, sino de un artefacto de arquitectura propia (librería `custom`) que combina pesos de tokens por etiqueta con recuperación de evidencia ponderada por IDF. Su propósito declarado es servir como baseline transparente y reproducible para demostraciones de arquitectura y comparaciones locales.

El modelo se generó a partir de un conjunto de datos sintético (`RKB109/support-routing-ml-20261119-dataset`) y no invoca ningún LLM alojado. Está pensado para experimentación educativa, ejemplos de CI y evaluación, no para producción. La model card lo describe explícitamente como un prototipo pequeño y transparente.

La relevancia actual es limitada: se trata de un artefacto de demostración con cero descargas y cero likes en el momento de la consulta, sin datos publicados de tamaño, contexto ni benchmarks más allá de una evaluación sobre 4 ejemplos sintéticos. Es útil únicamente como referencia de formato reproducible (incluye `train.py`, split exacto y código de evaluación en un repositorio GitHub enlazado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo custom basado en pesos de tokens por etiqueta y recuperación de evidencia ponderada por IDF (no es un transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card menciona un "model JSON format" sin detallar) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo neuronal profundo convencional. Según la model card, el modelo combina pesos de tokens por etiqueta con recuperación de evidencia ponderada por IDF. Es decir, un clasificador lineal o basado en evidencia léxica, diseñado para ser interpretable y reproducible, no para maximizar rendimiento.

El entrenamiento se realizó sobre un dataset sintético identificado como `RKB109/support-routing-ml-20261119-dataset`. La model card no especifica número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO (no aplicable en este tipo de modelo). La evaluación se hizo sobre 4 ejemplos sintéticos retenidos, con accuracy reportada de 1,0. El repositorio GitHub enlazado incluye `train.py`, el split exacto del dataset, el código de evaluación y el formato JSON del modelo, lo que permite reproducir el pipeline completo.

## Capacidades

- Clasificación de texto (`text-classification`): asignación de etiquetas a tickets o textos cortos.
- Clasificación zero-shot (`zero-shot-classification`): según los tags declarados, aunque no se detalla el mecanismo.
- Similitud de frases (`sentence-similarity`): capacidad declarada en los tags, sin especificación técnica.
- Resumen (`summarization`): capacidad declarada en los tags, sin especificación técnica.
- Enrutamiento con exposición de confianza: el modelo está diseñado para exponer confianza y derivar casos inciertos, según la descripción.
- Recuperación de evidencia ponderada por IDF como mecanismo de soporte a la decisión.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; la model card advierte que los tickets sintéticos no representan todas las poblaciones ni idiomas.

## Casos de uso

- Prototipado de arquitectura de enrutamiento: usar el modelo como referencia para comparar diseños de clasificadores de tickets antes de invertir en modelos mayores. Es adecuado porque es transparente y reproducible.
- Ejemplos de CI y evaluación: integrar el modelo en pipelines de integración continua para validar que el código de entrenamiento y evaluación funciona de extremo a extremo, gracias a que incluye `train.py` y el split exacto.
- Baseline local de comparación: establecer una línea base léxica contra la que medir modelos neuronales en tareas de clasificación de soporte, dado que expone confianza por etiqueta.
- Experimentación educativa: demostrar el flujo completo de un clasificador con recuperación de evidencia IDF en cursos o talleres, sin dependencia de APIs externas.
- Enrutamiento con derivación a humano: aprovechar la exposición de confianza para derivar tickets inciertos a agentes humanos en un prototipo de mesa de ayuda, siempre con datos representativos.
- Validación de formatos de datos: usar el formato JSON del modelo y el dataset sintético como plantilla para definir esquemas de datos en proyectos de routing antes de escalar.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 1,0 | 4 ejemplos sintéticos retenidos |
| Métricas previstas (no reportadas) | classification_accuracy, automation_coverage, escalation_precision | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única cifra reportada (accuracy 1,0) corresponde a 4 ejemplos sintéticos, por lo que no es estadísticamente significativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del modelo (pesos de tokens y recuperación IDF) es previsible que sea muy baja, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible; probablemente no requiere GPU, pero no se especifica.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la librería es `custom`, por lo que no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Dataset sintético y muy pequeño: la evaluación se basa en 4 ejemplos, insuficiente para inferir rendimiento real.
- Sesgos: la model card advierte que los tickets sintéticos no representan todas las poblaciones ni idiomas; se requiere análisis de sesgo con datos representativos.
- Riesgo de alucinación: no aplicable en el sentido de un LLM generativo, pero el mecanismo de recuperación de evidencia puede producir asignaciones erróneas con confianza alta en dominios no representados.
- Restricciones de licencia: licencia MIT, permite uso comercial, pero la model card prohíbe explícitamente su uso para decisiones consecuentes sin datos representativos, revisión experta y evaluación de grado producción.
- Idiomas: no disponibles; no se garantiza cobertura multilingüe.
- Producción: no apto para uso en producción según la propia model card; es un prototipo de demostración.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin señales de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/RKB109/support-routing-ml-20261119-model
- Dataset: https://huggingface.co/datasets/RKB109/support-routing-ml-20261119-dataset
- Repositorio GitHub: no disponible en la información proporcionada (la model card lo menciona sin enlace explícito)
- Paper, blog o demo: no disponibles
