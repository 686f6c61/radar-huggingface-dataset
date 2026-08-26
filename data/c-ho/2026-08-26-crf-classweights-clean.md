# c-ho/2026-08-26-crf-classweights-clean

## Resumen

El modelo `c-ho/2026-08-26-crf-classweights-clean` es un ajuste fino del modelo `Davlan/bert-base-multilingual-cased-ner-hrl`, un BERT multilingüe diseñado originalmente para reconocimiento de entidades nombradas en idiomas de alto recurso. Este modelo concreto se ha entrenado para la clasificación de tokens en el ámbito de la lingüística, identificando fenómenos como categorías gramaticales, morfológicas, sintácticas o semánticas, entre otras. El nombre del modelo indica el uso de una capa CRF (Conditional Random Fields) y pesos de clase durante el entrenamiento, lo que sugiere un enfoque para mejorar la coherencia de las predicciones en secuencias.

El modelo cuenta con 177 880 005 parámetros, un tamaño típico de los BERT-base multilingües, y se distribuye en formato safetensors. Su pipeline es `token-classification`, por lo que se usa principalmente para tareas de etiquetado de tokens, como el reconocimiento de entidades o la anotación de fenómenos lingüísticos. Aunque no se especifica el idioma o el dataset de entrenamiento, el modelo base es multilingüe y puede aplicarse a más de 100 idiomas. La licencia es AFL-3.0, que permite uso comercial con atribución.

La relevancia actual de este modelo radica en su especialización en el dominio lingüístico, un área donde los modelos NER genéricos no suelen tener buen rendimiento. Su capa CRF y el uso de pesos de clase lo convierten en una opción interesante para proyectos de investigación en lingüística computacional, análisis de corpus y extracción de terminología académica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base multilingüe (cased) con capa de clasificación de tokens y CRF |
| Parametros totales | 177 880 005 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base es multilingüe) |
| Licencia | AFL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Davlan/bert-base-multilingual-cased-ner-hrl`, que a su vez es un ajuste fino de `bert-base-multilingual-cased` de Google. La arquitectura subyacente es un transformer BERT con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, entrenado con un vocabulario multilingüe. La capa superior se sustituye por una cabecera de clasificación de tokens que, en este caso, se combina con una capa CRF para modelar dependencias entre etiquetas consecutivas. Además, se aplicaron pesos de clase durante el entrenamiento para compensar el desequilibrio en la distribución de las etiquetas.

El entrenamiento se realizó sobre un dataset no especificado en la model card. Los hiperparámetros incluyen una tasa de aprendizaje de 5e-05, tamaño de batch efectivo de 32 (batch de 8 con acumulación de gradientes de 4), optimizador AdamW, programación lineal con un 10% de warmup, y 15 épocas. Se utilizó precisión mixta nativa (Native AMP). Los resultados de entrenamiento muestran una pérdida de evaluación de 15.93, con precisión de 0.7749, recall de 0.8188 y F1 de 0.7962, además de una exactitud de 0.9693. No se detalla el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Clasificación de tokens para fenómenos lingüísticos: el modelo reconoce etiquetas como `Academicdiscipline`, `Ambiguouslydefinedconcept`, `Discoursephenomenon`, `Morphologicalphenomenon`, `Semanticphenomenon`, `Syntacticphenomenon`, entre otras, tal como se observa en los resultados de evaluación.
- Reconocimiento de entidades lingüísticas en textos académicos: puede identificar términos relacionados con disciplinas académicas, recursos lingüísticos o conceptos definidos.
- Soporte multilingüe: hereda la capacidad multilingüe de `bert-base-multilingual-cased`, que cubre más de 100 idiomas.
- Integración con pipelines de Hugging Face: compatible con `pipeline("token-classification")` para uso directo.
- Aplicable a tareas de NER y etiquetado de secuencias en dominios especializados.

## Casos de uso

- Anotación automática de corpus lingüísticos: el modelo puede etiquetar fenómenos gramaticales, morfológicos o sintácticos en textos de investigación lingüística, facilitando la creación de bases de datos anotadas.
- Extracción de terminología académica: identificar términos como "academicdiscipline" o "languageresourceinformation" en artículos científicos para construir tesauros o ontologías.
- Análisis de textos en múltiples idiomas: dado su origen multilingüe, se puede aplicar a documentos en distintas lenguas para extraer información lingüística, sin necesidad de entrenamiento adicional.
- Mejora de buscadores de literatura lingüística: etiquetar los documentos con categorías de fenómenos para indexar y recuperar información relevante.
- Asistencia en la revisión de traducciones: detectar fenómenos como "morphosyntacticphenomenon" en textos comparados, ayudando a identificar problemas de coherencia gramatical.
- Integración en pipelines de procesamiento de lenguaje natural en investigación: como componente en sistemas de extracción de información para estudios de tipología lingüística o evolución del lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente las métricas de evaluación del propio autor, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Pérdida | 15.9306 |
| Precision | 0.7749 |
| Recall | 0.8188 |
| F1 | 0.7962 |
| Accuracy | 0.9693 |

Además, se reportan valores de F1 por etiqueta, siendo notablemente bajo para `Graphemicphenomenon` (0.0) y `Discoursephenomenon` (0.5176), mientras que `Phonologicalphenomenon` alcanza 0.8885 y `Morphosyntacticphenomenon` 0.8562. Estos valores sugieren un rendimiento desigual según la categoría.

## Requisitos de hardware

- VRAM estimada: con 178M parámetros y pesos en fp32, el modelo ocupa unos 710 MB. En fp16 o cuantizado a int8, se reduce a ~355 MB y ~178 MB respectivamente. Se recomienda al menos 2 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU con más de 4 GB de VRAM, como la RTX 3060, RTX 4060, o GPUs de datacenter como T4 o A10. También puede ejecutarse en CPU con suficiente RAM (al menos 8 GB).
- Compatibilidad con GPUs de consumo: sí, cabe en tarjetas como la RTX 3060 o inferiores.
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face, con `vLLM` para inferencia de alto rendimiento, o mediante `ONNX` para optimización. No hay soporte nativo de `llama.cpp` ni `Ollama`, ya que no es un modelo GGUF.
- Latencia y throughput: no disponibles; para un BERT-base en GPU, la inferencia suele ser del orden de 10-50 ms por secuencia según la longitud.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la información proporcionada. Como referencia, el modelo base `Davlan/bert-base-multilingual-cased-ner-hrl` tiene una arquitectura idéntica (178M parámetros) y está entrenado para NER en lenguas de alta recursos. Otros modelos NER multilingües como `xlm-roberta-large-ner` (550M parámetros) ofrecen mayor capacidad, pero con mayor coste computacional. La tabla comparativa se limita a los datos conocidos:

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| c-ho/2026-08-26-crf-classweights-clean | 177.9M | No disponible | AFL-3.0 | safetensors | Token-classification |
| Davlan/bert-base-multilingual-cased-ner-hrl | 178M | No disponible | MIT | safetensors | Token-classification |
| xlm-roberta-large-ner | 550M | No disponible | MIT | safetensors | Token-classification |

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no especifica la composición ni el origen de los datos, lo que dificulta evaluar su generalización.
- Rendimiento desigual por etiqueta: la etiqueta `Graphemicphenomenon` tiene un F1 de 0.0, lo que indica que el modelo no logra predecir esa categoría en absoluto. Otras categorías como `Discoursephenomenon` también tienen un F1 bajo (0.5176).
- Pérdida de evaluación alta (15.93) a pesar de buenas métricas, lo que puede indicar sobreajuste o una distribución de etiquetas muy desequilibrada.
- Licencia AFL-3.0: permite uso comercial con atribución, pero debe revisarse las condiciones específicas de la licencia (Academic Free License).
- No se han documentado sesgos específicos, pero el modelo base puede heredar los sesgos de los datos de entrenamiento originales de BERT.
- Riesgo de alucinación en tokens poco representados: dado que algunas categorías tienen pocas muestras, el modelo podría etiquetar incorrectamente tokens raros.
- El contexto de entrada está limitado a 512 tokens (típico de BERT), por lo que no es adecuado para textos largos.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/c-ho/2026-08-26-crf-classweights-clean)
- [Modelo base: Davlan/bert-base-multilingual-cased-ner-hrl](https://huggingface.co/Davlan/bert-base-multilingual-cased-ner-hrl)
- No se han encontrado otros enlaces relevantes (papers, blogs, repos) en la búsqueda web.
