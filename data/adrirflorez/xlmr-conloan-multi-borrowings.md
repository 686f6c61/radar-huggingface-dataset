# adrirflorez/xlmr-conloan-multi-borrowings

## Resumen

El modelo `adrirflorez/xlmr-conloan-multi-borrowings` es un clasificador de texto basado en la arquitectura XLM-RoBERTa, desarrollado por el usuario adrirflorez y publicado en Hugging Face. Está diseñado para la tarea de clasificación de préstamos lingüísticos (loanwords) en el contexto del dataset multilingüe ConLoan, un recurso contrastivo que incluye oraciones con y sin préstamos en diez idiomas (chino, francés, alemán, griego, islandés, italiano, kurdo del norte, portugués, ruso y español). El nombre del modelo sugiere que se centra en la detección de múltiples préstamos dentro de una misma oración.

Con 278 millones de parámetros, el modelo corresponde al tamaño base de XLM-RoBERTa, un transformer encoder-only preentrenado en 100 idiomas. Su pipeline es `text-classification` y los pesos se distribuyen en formato safetensors. La model card es genérica y no aporta detalles sobre el entrenamiento, los datos utilizados ni el rendimiento, por lo que gran parte de la información técnica permanece sin especificar. Aun así, su relevancia radica en abordar una tarea lingüística desafiante que, según estudios recientes, los modelos de lenguaje grandes resuelven con una F-score media inferior a 0,5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder-only transformer) |
| Parametros totales | 278.047.493 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset ConLoan cubre 10 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa, una arquitectura transformer encoder-only preentrenada de forma autosupervisada sobre un corpus multilingüe masivo. El tag `xlm-roberta` y el número de parámetros (278M) indican que se trata de la variante base de XLM-RoBERTa, que tiene una longitud de contexto típica de 512 tokens. El modelo ha sido fine-tuneado para clasificación de texto, probablemente sobre el dataset ConLoan, que contiene pares de oraciones contrastivas con y sin préstamos en diez idiomas. Sin embargo, la model card no proporciona información sobre el procedimiento de entrenamiento, los hiperparámetros, el régimen de precisión ni la composición exacta del dataset de fine-tuning. Tampoco se especifica si se emplearon técnicas como RLHF o DPO, algo poco habitual en modelos encoder de este tipo.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, lo que permite asignar una o varias etiquetas a una oración.
- Detección de préstamos lingüísticos: por su nombre y el dataset asociado, el modelo está orientado a identificar la presencia de préstamos (palabras tomadas de otros idiomas) en oraciones multilingües, posiblemente clasificando si hay múltiples préstamos o de qué idioma proceden.
- Soporte multilingüe: al estar basado en XLM-RoBERTa, hereda la capacidad de procesar texto en numerosos idiomas, aunque no se especifica qué idiomas concretos soporta el fine-tuning.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigacion linguistica computacional: el modelo puede emplearse para anotar automáticamente corpus multilingües y estudiar la distribución de préstamos en diferentes lenguas, facilitando análisis sociolingüísticos o históricos.
- Evaluacion de modelos de lenguaje: como parte del benchmark ConLoan, sirve para comparar la capacidad de distintos sistemas (LLMs, modelos encoder) a la hora de identificar préstamos, una tarea que los LLMs resuelven con dificultad (F-score < 0,5 según el paper de arXiv).
- Filtrado de contenido multilingue: en aplicaciones de moderación o análisis de texto, puede detectar oraciones que contengan términos de origen extranjero, útil para estudios de mezcla de códigos (code-switching).
- Mejora de sistemas de traduccion automatica: identificar préstamos puede ayudar a depurar corpus de entrenamiento o a ajustar modelos de traducción para que no traduzcan incorrectamente palabras prestadas.
- Analisis de sentimiento en textos multilingues: aunque no es su función principal, al ser un clasificador de texto podría adaptarse con fine-tuning adicional para tareas de análisis de sentimiento en contextos multilingües.
- Educacion y aprendizaje de idiomas: puede utilizarse en herramientas pedagógicas para señalar a los estudiantes qué palabras de su lengua materna provienen de otros idiomas, fomentando la conciencia léxica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y aunque el paper de arXiv (2510.26254) reporta que los LLMs obtienen una F-score media inferior a 0,5 en la tarea ConLoan, esos resultados no corresponden a este modelo específico. No se dispone de datos de rendimiento comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278M de parámetros, el modelo en precisión fp32 ocupa aproximadamente 1,1 GB (tamaño del repo), por lo que cabría en GPUs con al menos 2 GB de VRAM. En fp16, el uso de memoria se reduciría a unos 0,6 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060) es suficiente para inferencia. Para entrenamiento o fine-tuning, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPU de consumo: sí, el modelo es lo bastante pequeño para ejecutarse en GPUs de gama media e incluso en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con bibliotecas como Hugging Face Transformers, Text Embeddings Inference (TEI, indicado en los tags), vLLM (aunque está pensado para generación, también soporta encoder), o mediante ONNX Runtime para optimización.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la inferencia sobre una oración corta debería completarse en milisegundos, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adrirflorez/xlmr-conloan-multi-borrowings | 278M | no disponible | Clasificación de préstamos | no disponible | Hugging Face |
| arodriguezf/xlmr-multi-borrowings-conloan | no disponible | no disponible | Clasificación de préstamos | no disponible | Hugging Face |
| arodriguezf/xlmr-multi-borrowings | no disponible | no disponible | Token classification (probable) | no disponible | Hugging Face |
| XLM-RoBERTa-base (original) | 278M | 512 | Preentrenamiento multilingüe | MIT | Hugging Face |

Los dos modelos de arodriguezf parecen estar relacionados con el mismo dataset ConLoan, pero no se dispone de detalles sobre sus parámetros o rendimiento. XLM-RoBERTa-base es el modelo base sin fine-tuning, que sirve como referencia para comparar el efecto del ajuste en esta tarea específica.

## Limitaciones y advertencias

- La model card es genérica y no documenta sesgos, riesgos ni limitaciones específicas. Al ser un modelo fine-tuneado sobre un dataset concreto, su rendimiento fuera del dominio de préstamos lingüísticos puede ser deficiente.
- No se especifica la licencia, por lo que el uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El modelo tiene una longitud de contexto limitada (típicamente 512 tokens en XLM-RoBERTa), lo que restringe su aplicación a textos cortos.
- No se han publicado métricas de evaluación, por lo que no se puede garantizar su precisión en la tarea de detección de préstamos.
- Al ser un modelo encoder, no genera texto; su uso se limita a clasificación o extracción de representaciones.
- El dataset ConLoan cubre 10 idiomas específicos; el modelo puede no generalizar bien a otros idiomas o variedades dialectales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adrirflorez/xlmr-conloan-multi-borrowings
- Modelo relacionado (arodriguezf/xlmr-multi-borrowings-conloan): https://huggingface.co/arodriguezf/xlmr-multi-borrowings-conloan
- Modelo relacionado (arodriguezf/xlmr-multi-borrowings): https://huggingface.co/arodriguezf/xlmr-multi-borrowings
- Dataset ConLoan (GitHub): https://github.com/ZurichNLP/ConLoan
- Paper sobre evaluación de LLMs en ConLoan (arXiv): https://arxiv.org/html/2510.26254v1
- Paper de ConLoan (ACL, PDF): http://cr.fvcrc.i.nagoya-u.ac.jp/~kuni-tanaka/20250926_reading-acl.pdf
