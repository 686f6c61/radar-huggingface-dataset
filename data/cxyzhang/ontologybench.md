# cxyzhang/OntologyBench

## Resumen

OntologyBench es un benchmark estructurado en tres niveles para la recuperación de conocimiento biomédico: el nivel 1 de anclaje de conceptos, el nivel 2 de recuperación relacional y el nivel 3 de recuperación composicional. Lo desarrolla cxyzhang (Xiao Yu Cindy Zhang) junto con Wyeth W. Wasserman y Jian Zhu, y se publica como un dataset en Hugging Face bajo licencia CC BY 4.0. El recurso expone pares positivos de entrenamiento y pares de prueba retenidos, independientes del modelo, para facilitar la evaluación de sistemas de recuperación densa frente a restricciones ontológicas.

A diferencia de un modelo de lenguaje, OntologyBench no es un sistema entrenable, sino un conjunto de datos de evaluación y entrenamiento. Su relevancia actual radica en que aborda un problema poco cubierto: la satisfacción de restricciones estructuradas (como jerarquías y relaciones ontológicas) en tareas de recuperación biomédica, un área crítica para aplicaciones clínicas y de investigación. El dataset se deriva de recursos públicos como HPO, Mondo, HGNC y NCBI Gene, y se distribuye con divisiones de entrenamiento y prueba disjuntas por objetivo.

El repositorio incluye un manifiesto de integridad (SHA256SUMS), asignaciones deterministas de objetivos y un resumen JSON. Está pensado para investigación en recuperación de información, no para diagnóstico clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un dataset, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 |
| Formato de pesos | JSONL comprimido con gzip (data/train-*.jsonl.gz, data/test-*.jsonl.gz) |

## Arquitectura y entrenamiento

OntologyBench no es un modelo, sino un conjunto de datos estructurado. Cada fila contiene un par positivo de consulta y objetivo, junto con metadatos como `task_name`, `tier_id`, `tier_name`, `query_id`, `target_id`, `raw_target_id` y `split`. La construcción de divisiones se realiza ordenando los identificadores de objetivo por tarea, barajando con semilla 42 y asignando el 80% a entrenamiento y el 20% a prueba, garantizando que todos los pares positivos de un objetivo permanezcan en la misma división. Se eliminan pares duplicados normalizados dentro de cada división. La división es disjunta por objetivo dentro de cada tarea, pero transductiva entre tareas, ya que una misma entidad biomédica puede aparecer en diferentes espacios de nombres.

El dataset no materializa negativos; el código de entrenamiento debe construirlos dentro del lote o mediante minería. Se incluyen `summary.json`, `assignments.jsonl.gz` y `SHA256SUMS` para reproducibilidad e integridad.

## Capacidades

- Proporciona pares positivos de consulta y objetivo para tres niveles de dificultad: anclaje de conceptos, recuperación relacional y recuperación composicional.
- Cubre dominios biomédicos: fenotipos (HPO), enfermedades (Mondo), genes (HGNC, NCBI Gene).
- Permite evaluar sistemas de recuperación densa frente a restricciones ontológicas estructuradas.
- Ofrece divisiones de entrenamiento y prueba con asignación determinista y reproducible.
- Incluye metadatos completos para cada par, facilitando el análisis por tarea y nivel.
- No incluye negativos, lo que obliga a los usuarios a generar sus propios ejemplos negativos, fomentando metodologías de entrenamiento realistas.

## Casos de uso

- Evaluación de recuperadores densos biomédicos: usar el nivel 1 para medir la capacidad de anclar términos de consulta a conceptos ontológicos normalizados, comparando sistemas basados en texto puro frente a sistemas que incorporan conocimiento ontológico.
- Entrenamiento de modelos de recuperación con pérdida contrastiva: construir negativos dentro del lote a partir de los pares positivos del split de entrenamiento y ajustar un codificador de frases (por ejemplo, Sentence-BERT) para mejorar la alineación consulta-objetivo.
- Investigación en recuperación relacional: explotar el nivel 2 para estudiar si los modelos aprenden relaciones semánticas entre entidades (por ejemplo, gen-enfermedad) más allá de la similitud léxica.
- Desarrollo de sistemas de apoyo a la decisión clínica: utilizar el benchmark como prueba de fuego para validar que un sistema de recuperación no solo encuentra documentos relevantes, sino que respeta restricciones ontológicas (por ejemplo, que un término padre no se confunda con su hijo).
- Comparación de arquitecturas de recuperación: evaluar modelos densos frente a modelos basados en BM25 o híbridos, midiendo precisión en cada nivel y analizando dónde fallan las restricciones estructuradas.
- Reproducibilidad de experimentos: usar las asignaciones deterministas y el manifiesto SHA256 para verificar que los resultados son comparables entre implementaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El dataset está diseñado para que los investigadores generen sus propias métricas; no se incluyen puntuaciones de referencia.

## Requisitos de hardware

- No aplica: al ser un dataset, no requiere GPU ni VRAM para su uso.
- El tamaño del repositorio es de 0.1 GB, por lo que puede descargarse y procesarse en cualquier máquina con unos pocos GB de RAM.
- Para entrenar modelos de recuperación sobre estos datos, se recomienda una GPU con al menos 8 GB de VRAM si se usan codificadores tipo BERT, o 24 GB para modelos más grandes como DeBERTa-v3.
- El despliegue en producción no es relevante; el dataset se consume mediante `load_dataset("cxyzhang/OntologyBench")` en Python.

## Comparativa con modelos similares

No disponible. OntologyBench es un dataset de evaluación, no un modelo, por lo que no existe una comparativa directa con modelos de lenguaje. Como benchmark, podría compararse con otros conjuntos de datos de recuperación biomédica como BEIR o BioASQ, pero no se dispone de información suficiente en la documentación proporcionada para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El dataset está pensado para investigación en recuperación biomédica, no para diagnóstico clínico ni decisiones de atención al paciente.
- Los sistemas de referencia que incorporan ontologías utilizan un régimen de información diferente al de los recuperadores de solo texto, por lo que no deben considerarse directamente comparables.
- No se materializan ejemplos negativos; los usuarios deben generarlos, lo que puede introducir sesgos si no se hace con cuidado.
- La división es transductiva entre tareas: una misma entidad puede aparecer en diferentes espacios de nombres, lo que puede inflar el rendimiento si no se controla.
- Las fuentes upstream (HPO, Mondo, HGNC, NCBI Gene) tienen sus propios requisitos de atribución y licencia, que deben respetarse además de la CC BY 4.0 del dataset.
- El dataset tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que aún no ha sido ampliamente adoptado; su validación externa es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/cxyzhang/OntologyBench
- Perfil del autor: https://huggingface.co/cxyzhang/datasets
- Paper (referencia en la model card): Zhang, X. Y. C., Wasserman, W. W., & Zhu, J. (2026). OntologyBench: Can Dense Retrieval Satisfy Structured Biomedical Constraints? Proceedings of EMNLP 2026 (to appear).
