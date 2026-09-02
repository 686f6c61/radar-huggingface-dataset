# graf/science_4b_mix_bt_8b_solid-bt-a577c3ef-1-104-on

## Resumen

El modelo `graf/science_4b_mix_bt_8b_solid-bt-a577c3ef-1-104-on` es un clasificador de secuencias (sequence-scoring) desarrollado por el usuario `graf`. Está construido sobre la base de `Qwen/Qwen3-8B` y entrenado con un objetivo pairwise-ranking de tipo Bradley-Terry (BT) mediante el framework BonVoyage. Su propósito es asignar una puntuación escalar a secuencias de texto, lo que lo convierte en una herramienta útil para ordenar, filtrar o evaluar respuestas generadas por modelos de lenguaje en dominios científicos.

El modelo resuelve el problema de la evaluación automática de calidad textual sin necesidad de generar texto nuevo. En lugar de producir respuestas, emite un valor numérico que indica la preferencia o calidad relativa de una secuencia dada, lo que permite construir sistemas de reward modeling, pipelines de RLHF o filtros de datos. Su relevancia actual radica en la creciente demanda de modelos de recompensa fiables y ligeros para alinear y seleccionar respuestas de LLMs en entornos de investigación y producción.

Con 7.568 millones de parámetros (7,5B), hereda la arquitectura transformer de Qwen3-8B, incluyendo su ventana de contexto nativa, aunque la información proporcionada no detalla el valor exacto de dicha ventana. El checkpoint final corresponde a la época 103 de un total de 104, con un learning rate de `1e-5` y pesos almacenados en formato BF16 safetensors. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) con cabeza de scoring escalar |
| Parametros totales | 7.568.409.600 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-8B`, un transformer denso de 8.000 millones de parámetros preentrenado por Alibaba. Sobre esta base, se añade una cabeza de salida con un único escalar (`num_labels=1`) que produce una puntuación para cada secuencia de entrada. El entrenamiento se realizó con el framework BonVoyage utilizando un objetivo pairwise Bradley-Terry, que aprende a ordenar pares de secuencias comparando sus scores relativos. Este enfoque es común en la construcción de reward models, ya que no requiere etiquetas absolutas, solo preferencias relativas entre dos candidatos.

Los datos de entrenamiento provienen de `graf/qwen_4b_science_mix_train`, un dataset mixto de dominios científicos, y la validación se realizó sobre `graf/qwen_4b_science_sciknowsci_val` con 512 ejemplos. El entrenamiento duró 104 épocas (el checkpoint final guarda la época 103) con un learning rate de `1e-5`. El tokenizer utilizado es el guardado junto al entrenamiento, con `pad_token_id=151643`. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales; el objetivo es puramente de ranking.

## Capacidades

- Puntuación de secuencias: asigna un valor escalar a un texto de entrada, indicando su calidad o preferencia relativa según el criterio aprendido durante el entrenamiento.
- Ranking pairwise: optimizado para comparar pares de secuencias y determinar cuál es mejor, útil para ordenar listas de respuestas.
- Dominio científico: entrenado con datos mixtos de ciencia, por lo que es especialmente adecuado para evaluar textos técnicos, explicaciones científicas o respuestas a preguntas de esa área.
- Clasificación de texto: al ser un modelo de `text-classification` con una sola salida, puede integrarse en pipelines de transformers estándar.
- Sin generación de texto: no produce contenido nuevo; su función es exclusivamente evaluativa.
- Sin tool calling ni capacidades multimodales: no soporta function calling, visión ni audio.
- Multilingüismo: no se especifica, aunque hereda la tokenización de Qwen3-8B, que soporta múltiples idiomas; sin embargo, el entrenamiento específico no garantiza un comportamiento multilingüe consistente.

## Casos de uso

- Reward model para RLHF en dominios científicos: el modelo puede usarse como señal de recompensa para entrenar políticas de generación de respuestas técnicas, puntuando las salidas del policy model y guiando el aprendizaje por refuerzo.
- Filtrado de datos de entrenamiento: en la creación de datasets de instrucción o preferencia, se puede puntuar cada ejemplo y descartar aquellos con scores bajos, mejorando la calidad del conjunto final.
- Evaluación automática de respuestas generadas por LLMs: integrado en un pipeline de evaluación, permite ordenar múltiples respuestas a una misma pregunta científica y seleccionar la mejor sin intervención humana.
- Ranking de documentos científicos: puede puntuar abstracts o resúmenes para ordenarlos por relevancia o calidad percibida, útil en motores de búsqueda especializados.
- Comparación de modelos: dado un conjunto de respuestas producidas por distintos LLMs, el modelo puede servir como juez automático para comparar su rendimiento relativo en tareas científicas.
- Ajuste fino de sistemas de búsqueda aumentada por generación (RAG): puntuando las respuestas recuperadas y generadas, se puede optimizar la selección de fragmentos relevantes o la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo de scoring. Tampoco se ofrecen comparaciones con otros reward models o clasificadores de secuencias.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16, el modelo ocupa aproximadamente 15,1 GB en disco (según el tamaño del repo). Para inferencia, se necesitan al menos 16 GB de VRAM para cargar los pesos completos sin cuantización adicional.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) puede ejecutar el modelo sin problemas. En GPUs con menos memoria, se requeriría cuantización a 8 bits o 4 bits, aunque no se proporcionan versiones cuantizadas oficiales.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 (24 GB) o RTX 4080 (16 GB) podría ejecutarlo, aunque con 16 GB quedaría al límite. Una RTX 4060 (8 GB) no sería suficiente para BF16 completo.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con Hugging Face Inference Endpoints, o mediante bibliotecas como `transformers` para inferencia por lotes. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no se proporcionan datos, pero al ser un transformer de 7,5B parámetros, la inferencia de una sola secuencia en una A100 podría completarse en decenas de milisegundos, dependiendo de la longitud del texto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (reward models o clasificadores de secuencias basados en Qwen3-8B). Se podría mencionar que existen alternativas como `OpenRLHF` o `RLHFlow` con modelos de recompensa similares, pero no hay datos concretos para establecer una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos no documentados: no se ha publicado ningún análisis de sesgos del modelo. Al estar entrenado con datos científicos, podría reflejar los sesgos presentes en esos datasets.
- Riesgo de alucinación: al ser un modelo de scoring y no generativo, no produce texto, por lo que no alucina en el sentido clásico. Sin embargo, sus puntuaciones pueden ser inconsistentes o poco fiables fuera del dominio científico.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia soportada. Se desconoce si hereda los 32.768 tokens de Qwen3-8B o si el entrenamiento redujo ese límite.
- Restricciones de idioma: aunque la licencia permite uso comercial, el entrenamiento se centró en datos científicos probablemente en inglés u otros idiomas mayoritarios; el rendimiento en otros idiomas no está garantizado.
- Validez del ranking: el modelo fue entrenado con un objetivo pairwise BT, por lo que sus scores absolutos no tienen un significado calibrado; solo son útiles para comparar secuencias entre sí.
- Ausencia de cuantizaciones: solo se ofrecen pesos BF16, lo que limita el despliegue en hardware con poca memoria sin realizar conversiones manuales.
- Dependencia del tokenizer: el tokenizer se guardó con el entrenamiento y usa `pad_token_id=151643`; si se usa con el tokenizer original de Qwen3, podría haber discrepancias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/graf/science_4b_mix_bt_8b_solid-bt-a577c3ef-1-104-on
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/graf/qwen_4b_science_mix_train
- Dataset de validación: https://huggingface.co/datasets/graf/qwen_4b_science_sciknowsci_val
