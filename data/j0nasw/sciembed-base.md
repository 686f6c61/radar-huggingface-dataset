# J0nasW/sciembed-base

## Resumen

SciEmbed-BASE es un modelo de embeddings para documentos científicos desarrollado por Jonas W. (J0nasW) como parte del lanzamiento SciEmbed, presentado en Findings of EMNLP 2026. Se trata de un embedder de oraciones y documentos basado en ModernBERT-base, con 149 millones de parámetros, que utiliza oraciones de contexto de citas como señal contrastiva principal para el entrenamiento. El modelo está diseñado para tareas de similitud semántica, búsqueda y clasificación en el dominio científico, y se distribuye bajo licencia MIT.

La relevancia de este modelo radica en su enfoque de entrenamiento: utiliza exclusivamente aristas de citas (Signal A) con 7 millones de pares de oraciones de contexto de citas durante 3 épocas, lo que lo convierte en una línea base que aísla la contribución de esta señal frente a otras variantes del proyecto SciEmbed. Con una longitud de contexto de 512 tokens y una dimensión de salida de 768 (truncable mediante Matryoshka a 512/256/128), ofrece un equilibrio entre capacidad y eficiencia para su integración en pipelines de procesamiento de literatura científica.

El modelo se distribuye en formato safetensors y es compatible con la librería sentence-transformers, lo que facilita su uso en entornos de producción. Aunque su número de descargas es actualmente cero, su publicación académica y su licencia permisiva lo convierten en una opción interesante para investigadores y desarrolladores que necesiten embeddings especializados en dominios científicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ModernBERT-base) |
| Parametros totales | 149.014.272 (149M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SciEmbed-BASE se basa en la arquitectura ModernBERT-base, un transformer bidireccional optimizado para eficiencia y velocidad. El modelo emplea pooling por media (mean pooling) para obtener representaciones de oraciones y documentos, y produce vectores de 768 dimensiones que pueden truncarse a 512, 256 o 128 mediante la técnica Matryoshka, lo que permite ajustar el equilibrio entre precisión y coste computacional.

El entrenamiento se realizó con 7 millones de pares de oraciones de contexto de citas (citation-context sentences) como señal contrastiva primaria, durante 3 épocas. Este enfoque, denominado "Signal A only" en el proyecto SciEmbed, utiliza únicamente las aristas de citas entre documentos para generar pares positivos, sin incorporar otras señales como resúmenes o títulos. El objetivo es aislar el efecto de esta señal específica en la calidad de los embeddings, sirviendo como línea base para comparar con variantes que añaden señales adicionales.

## Capacidades

- Generación de embeddings semánticos para oraciones y documentos científicos, con normalización opcional.
- Similitud semántica entre textos, útil para búsqueda y agrupación.
- Clasificación de documentos por temática o tipo (evaluado en SciRepEval).
- Regresión para tareas de relevancia o similitud numérica.
- Búsqueda de documentos relevantes dado un texto de consulta.
- Soporte de truncamiento Matryoshka para reducir la dimensionalidad sin reentrenar.
- Compatible con la librería sentence-transformers y con text-embeddings-inference para despliegue en producción.

## Casos de uso

- Búsqueda de literatura científica: dado un fragmento de texto o una consulta, el modelo puede recuperar artículos relevantes de un corpus, gracias a su entrenamiento con contextos de citas que capturan relaciones semánticas entre documentos.
- Recomendación de citas: al codificar el contexto de una cita, el modelo puede sugerir referencias adicionales que traten temas similares, mejorando la experiencia de escritura académica.
- Agrupación de documentos por temática: los embeddings generados permiten aplicar algoritmos de clustering para organizar grandes colecciones de artículos en áreas de investigación coherentes.
- Detección de duplicados o plagio: la similitud entre embeddings puede identificar documentos con contenido solapado o copias parciales, útil en revisión editorial.
- Análisis de redes de citas: al combinar los embeddings con la estructura de citas, se pueden estudiar patrones de influencia y evolución de campos científicos.
- Clasificación automática de artículos: el modelo puede asignar categorías o etiquetas a documentos basándose en su contenido, como paso previo a la indexación en repositorios.
- Asistente de investigación: integrado en un sistema de preguntas y respuestas, puede recuperar pasajes relevantes de artículos para responder consultas específicas.

## Benchmarks y rendimiento

El modelo reporta resultados en SciRepEval, una evaluación de 4 categorías para embeddings científicos. Los valores son los siguientes:

| Categoría | Resultado |
|---|---|
| Clasificación (Classif.) | 75.3 |
| Regresión (Regr.) | 26.8 |
| Proximidad (Prox.) | 80.2 |
| Búsqueda (Search) | 82.2 |
| Overall (macro) | 66.1 ± 0.09 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 149M de parámetros, su huella de memoria es reducida: en FP32 ocupa aproximadamente 600 MB, y en FP16 unos 300 MB.
- Puede ejecutarse en GPU de consumo como RTX 3060, RTX 4090 o superiores, así como en CPU para inferencia por lotes pequeños.
- Para despliegue en producción, es compatible con sentence-transformers, Hugging Face Inference Endpoints y text-embeddings-inference.
- No se dispone de datos de latencia o throughput específicos, pero por su tamaño se espera un rendimiento adecuado en hardware moderno.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Sin embargo, al estar basado en ModernBERT-base, puede considerarse una alternativa ligera a embedders científicos como SPECTER o SciBERT, aunque no se han publicado métricas comparativas directas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con textos en inglés, por lo que su rendimiento en otros idiomas será limitado.
- La longitud de contexto está fijada en 512 tokens, lo que puede ser insuficiente para documentos completos; se recomienda segmentar textos largos.
- Al estar especializado en dominios científicos, su generalización a otros ámbitos (legal, médico general, etc.) puede ser deficiente.
- El entrenamiento con contextos de citas puede introducir sesgos derivados de las prácticas de citación (por ejemplo, sobre-representación de artículos muy citados).
- No se han documentado riesgos específicos de alucinación, pero como modelo de embeddings no genera texto, por lo que este riesgo no aplica directamente.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia de los datos de entrenamiento si se utiliza en aplicaciones sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/J0nasW/sciembed-base
- Repositorio del autor en GitHub: https://github.com/J0nasW?tab=repositories
- Modelo espejo (anon-nlp): https://huggingface.co/anon-nlp/sciembed-base
