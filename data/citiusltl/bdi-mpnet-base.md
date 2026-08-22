# citiusLTL/bdi-mpnet-base

## Resumen

El modelo `citiusLTL/bdi-mpnet-base` es un encoder de frases desarrollado por el grupo CiTIUS Language Technologies Lab de la Universidad de Santiago de Compostela. Se trata de un *fine-tuning* del modelo base `sentence-transformers/all-mpnet-base-v2`, especializado en similitud semántica mediante aprendizaje contrastivo con el objetivo de recuperar marcadores psicológicos a partir de cuestionarios clínicos estandarizados, como el Inventario de Depresión de Beck (BDI). El modelo genera representaciones densas de 768 dimensiones que permiten calcular similitud coseno entre frases o párrafos.

La relevancia de este modelo reside en su aplicación a dominios clínicos y de salud mental, donde los métodos de *retrieval* semántico tradicionales suelen fallar por la especificidad del vocabulario. El entrenamiento se realizó con un conjunto de datos de 312 muestras y una pérdida `MultipleNegativesRankingLoss`, un enfoque contrastivo que aprovecha pares de frases etiquetadas. Aunque el modelo es pequeño (109 M parámetros), su especialización en el dominio clínico lo hace útil para tareas de búsqueda de información médica, análisis de respuestas de pacientes y sistemas de apoyo diagnóstico.

La ficha técnica del modelo indica que se ha publicado un artículo asociado, titulado *"BDI-batch: Leveraging Standardized Clinical Questionnaires for Contrastive Learning in Psychological Marker Retrieval"*, que aparecerá en los Findings of EMNLP 2026. El modelo está disponible en Hugging Face con formato de pesos `safetensors`, aunque no se especifican licencia, idiomas ni longitud de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (Masked and Permuted Language Modeling) |
| Parametros totales | 109.486.464 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base está entrenado en inglés, pero no se indica) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MPNet, una variante del transformer que combina el enmascarado de tokens con el permutado de secuencias para capturar dependencias bidireccionales y posicionales. El modelo original `all-mpnet-base-v2` tiene 109 M parámetros y produce embeddings de 768 dimensiones. En esta versión, se ha realizado un ajuste fino con un conjunto de datos de 312 muestras (indicado en la etiqueta `dataset_size:312`) y una pérdida `MultipleNegativesRankingLoss`, que optimiza la similitud coseno entre pares de frases relacionados y no relacionados.

El entrenamiento se llevó a cabo mediante la librería `sentence-transformers` y el proceso se describe como `generated_from_trainer`. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se utilizaron técnicas de refuerzo (RLHF/DPO). El artículo asociado indica que se aprovechan cuestionarios clínicos estandarizados para el aprendizaje contrastivo, lo que sugiere que los datos de entrenamiento proceden de respuestas de pacientes y de categorías clínicas (por ejemplo, ítems del BDI). No se menciona ninguna innovación arquitectónica adicional más allá del ajuste sobre el modelo base.

## Capacidades

- Genera embeddings de frases y párrafos de 768 dimensiones, aptos para similitud semántica, búsqueda semántica y clustering.
- Especializado en el dominio psicológico y clínico: puede distinguir entre frases que describen síntomas depresivos, estados de ánimo o cambios en el comportamiento (según los ejemplos del widget).
- No es un modelo generativo: no produce texto, sino representaciones numéricas.
- No soporta *tool calling* ni agentes, ni razonamiento multi-paso.
- Capacidades multilingües no especificadas; el modelo base `all-mpnet-base-v2` está entrenado principalmente en inglés, por lo que es probable que funcione mejor en ese idioma, pero no hay confirmación.
- No incluye capacidades de visión ni audio.

## Casos de uso

- **Búsqueda de síntomas en registros clínicos**: el modelo puede recuperar frases de historiales médicos que coincidan semánticamente con descripciones de síntomas depresivos, facilitando la revisión de expedientes.
- **Análisis de respuestas a cuestionarios psicológicos**: se puede usar para agrupar respuestas de pacientes según su similitud semántica con categorías clínicas (por ejemplo, «falta de apetito» vs. «cambios en el apetito»), ayudando a la evaluación automatizada.
- **Sistema de triaje en salud mental**: integrarlo en un chatbot o portal para clasificar las quejas de los pacientes en categorías de síntomas, derivando a los casos más graves a atención humana.
- **Recomendación de recursos terapéuticos**: dada una frase de un usuario, se pueden buscar artículos, guías o recursos psicoeducativos con contenido semánticamente similar.
- **Detección de riesgo en foros o redes sociales**: el modelo puede identificar mensajes que describan síntomas depresivos mediante la comparación con frases de referencia extraídas de cuestionarios clínicos.
- **Investigación en psicología**: permite correlacionar respuestas libres de pacientes con escalas clínicas estandarizadas, agilizando el análisis cualitativo en estudios longitudinales.

## Benchmarks y rendimiento

El modelo reporta un único resultado de evaluación en la tarea de similitud semántica, sobre un dataset no especificado (etiquetado como "Unknown"). Los valores son:

| Métrica | Valor |
|---|---|
| Pearson (cosine) | 0.8687 |
| Spearman (cosine) | 0.8677 |

Estos resultados son declarados por el autor y no verificados externamente. No se dispone de comparaciones con otros modelos ni de benchmarks como MMLU, HumanEval o GSM8K, que no son aplicables a un modelo de embeddings. La ausencia de un dataset de referencia público impide evaluar la generalización del modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 109 M parámetros, el uso de memoria en inferencia es bajo. Con cuantización FP16, se estima unos 0.5 GB de VRAM; en FP32, alrededor de 0.4 GB.
- **GPU recomendadas**: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Por ejemplo, una NVIDIA GTX 1050 Ti o superior. No se requiere una GPU de servidor.
- **CPU**: el modelo puede ejecutarse en CPU sin problemas, aunque la latencia será mayor. Con `sentence-transformers`, la inferencia en CPU tarda entre 10 y 30 ms por frase (dependiendo de la longitud).
- **Opciones de despliegue**: es compatible con `sentence-transformers`, `text-embeddings-inference` (según la etiqueta `endpoints_compatible`), y puede ser usado con `vLLM` (aunque no es lo común para este tipo de modelos). También se puede exportar a `ONNX` para inferencia optimizada.
- **Latencia y throughput**: no se han publicado datos concretos, pero para un modelo de este tamaño, se puede esperar un throughput de cientos de frases por segundo en una GPU moderna (p.ej., RTX 3090).

## Comparativa con modelos similares

El modelo es un *fine-tuning* de `all-mpnet-base-v2`, por lo que la comparación natural es con su modelo base y con otros *sentence-transformers* de tamaño similar.

| Modelo | Parámetros | Dimensiones de embedding | Contexto | Licencia | Rendimiento (Spearman) |
|---|---|---|---|---|---|
| citiusLTL/bdi-mpnet-base | 109 M | 768 | no disponible | no disponible | 0.8677 (dataset desconocido) |
| sentence-transformers/all-mpnet-base-v2 | 109 M | 768 | 512 tokens | Apache 2.0 | 0.8677 en STS-B (referencia) |
| sentence-transformers/all-MiniLM-L6-v2 | 22 M | 384 | 256 tokens | Apache 2.0 | 0.8634 en STS-B |

Nota: los datos de los modelos base son públicos y se muestran solo como referencia; no se han evaluado en el mismo dataset que el modelo `bdi-mpnet-base`. La comparación directa no es posible sin una evaluación conjunta.

## Limitaciones y advertencias

- **Sesgos y dominio**: el modelo está entrenado con un dataset muy pequeño (312 muestras) y en el dominio clínico específico de cuestionarios psicológicos. Esto puede provocar un sobreajuste a ese dominio y un rendimiento pobre en otros tipos de texto.
- **Alucinación**: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación en el sentido generativo. Sin embargo, puede producir similitudes engañosas si las frases de entrada están fuera del dominio entrenado.
- **Idiomas**: no se especifica el idioma de entrenamiento. El modelo base `all-mpnet-base-v2` está entrenado principalmente en inglés, por lo que se recomienda verificar su rendimiento en español u otros idiomas.
- **Licencia**: no se indica ninguna licencia en la ficha del modelo. Esto implica que el uso comercial no está garantizado sin consultar al autor. Se recomienda contactar con el grupo CiTIUS antes de desplegarlo en producción.
- **Contexto**: no se proporciona la longitud máxima de secuencia. Es probable que herede la del modelo base (768 tokens), pero no está confirmado.
- **Producción**: al ser un modelo de embeddings, se debe evaluar su rendimiento en el dominio objetivo antes de usarlo en sistemas críticos. La falta de datos de benchmark verificados y la ausencia de un dataset de referencia son una señal de advertencia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/citiusLTL/bdi-mpnet-base)
- [Página del grupo CiTIUS LTL en Hugging Face](https://huggingface.co/citiusLTL)
- Artículo asociado (por aparecer): Fernández-Pichel, M. & Losada Carril, D. E. "BDI-batch: Leveraging Standardized Clinical Questionnaires for Contrastive Learning in Psychological Marker Retrieval". Findings of EMNLP 2026.
