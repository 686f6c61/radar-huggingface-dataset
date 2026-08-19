# elplaguister/patent_classifier_en_nemotron

## Resumen

El modelo `elplaguister/patent_classifier_en_nemotron` es un modelo de embeddings de texto (sentence-similarity) desarrollado por el usuario `elplaguister` mediante fine-tuning del modelo base `nvidia/Nemotron-3-Embed-1B-BF16` de NVIDIA. Su propósito específico es la búsqueda semántica entre patentes coreanas y la taxonomía KOS (Clasificación de Ciencia y Tecnología de Corea), permitiendo clasificar automáticamente patentes en las subcategorías adecuadas.

El modelo está entrenado con 2.002 patentes coreanas, utilizando la técnica de Cached Multiple Negatives Ranking Loss, y ha sido ajustado para recuperar las categorías KOS relevantes (2.522 subcategorías) a partir del texto de la patente (resumen, composición técnica y antecedentes). Con 1.140 millones de parámetros, ofrece una capacidad de contexto de hasta 32.768 tokens, lo que permite procesar documentos técnicos extensos. Su licencia Apache 2.0 facilita su uso comercial y su integración en sistemas de gestión de propiedad intelectual.

La relevancia actual de este modelo radica en la creciente necesidad de automatizar la clasificación de patentes en oficinas de propiedad intelectual y departamentos de I+D, donde la precisión en la asignación de códigos de clasificación es crítica. Al estar basado en un modelo de embeddings de última generación de NVIDIA, ofrece un equilibrio entre rendimiento y eficiencia para tareas de recuperación de información en dominios técnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de embeddings, base: NVIDIA Nemotron-3-Embed-1B-BF16) |
| Parametros totales | 1.140.918.272 (1,14 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (cutoff length de entrenamiento) |
| Tipos de cuantizacion | No especificado en la informacion disponible (el repositorio contiene safetensors en BF16) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo de embeddings `NVIDIA Nemotron-3-Embed-1B-BF16`, que pertenece a la familia Nemotron de NVIDIA, diseñada para tareas de recuperación y representación de texto. La arquitectura base es un transformer encoder de aproximadamente 1.140 millones de parámetros, optimizado para generar representaciones densas de alta calidad. El fine-tuning se realizó con la librería Embedding-Factory, utilizando el conjunto de datos compuesto por 2.002 patentes coreanas y sus correspondientes códigos de clasificación KOS.

El entrenamiento se llevó a cabo durante 3 épocas con una longitud de corte de 32.768 tokens, empleando la función de pérdida Cached Multiple Negatives Ranking Loss, que optimiza la similitud entre la patente (ancla) y todas las subcategorías positivas asociadas (los códigos KOS mapeados). El loss final fue de 0,2505. El modelo requiere el uso de prefijos específicos en las consultas: `query:` para el texto de la patente y `passage:` para los documentos de taxonomía, siguiendo las convenciones del modelo base Nemotron. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de embeddings semánticos para texto en coreano, específicamente para dominios técnicos y de patentes.
- Búsqueda de similitud entre consultas y documentos de taxonomía, permitiendo recuperar las subcategorías KOS más relevantes para una patente dada.
- Clasificación automática de patentes en la taxonomía KOS (2.522 subcategorías) mediante similitud coseno entre embeddings normalizados.
- Procesamiento de documentos largos gracias a su ventana de contexto de 32.768 tokens, adecuada para patentes con descripciones extensas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de representación de texto.

## Casos de uso

- Clasificación automática de patentes en oficinas de propiedad intelectual: el modelo puede asignar códigos KOS a nuevas solicitudes de patente comparando el texto de la patente (resumen, composición técnica, antecedentes) con las descripciones de las subcategorías, reduciendo el trabajo manual de los examinadores.
- Búsqueda de prior art en bases de datos de patentes: permite a investigadores y agentes de patentes encontrar patentes similares a una invención dada, usando el embedding de la consulta para recuperar documentos relevantes de un corpus pre-indexado.
- Análisis de carteras de patentes: las empresas pueden agrupar sus patentes existentes por categorías KOS automáticamente, facilitando la gestión estratégica y la identificación de áreas tecnológicas.
- Recomendación de códigos de clasificación para redactores de patentes: al redactar una nueva solicitud, el modelo sugiere posibles subcategorías KOS basándose en el texto técnico, mejorando la precisión desde el inicio.
- Integración en sistemas de gestión documental: se puede usar como motor de búsqueda semántica en plataformas internas de I+D para localizar patentes o documentos técnicos relacionados por contenido.
- Entrenamiento de clasificadores jerárquicos: los embeddings generados pueden servir como características de entrada para modelos de clasificación más complejos que operen sobre la taxonomía KOS completa.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado sobre el conjunto completo de taxonomías, utilizando las métricas nDCG@10, MRR@10, Hit@1 y Recall@10, considerando como positivos todos los códigos KOS mapeados a cada patente, pero no se proporcionan los valores obtenidos. Por tanto, no es posible comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 (2 bytes por parámetro), el modelo requiere aproximadamente 2,3 GB de memoria para los pesos (1,14 B × 2 bytes). Considerando overhead de activaciones y buffers, se estima un consumo total de 4-6 GB en inferencia con secuencias de longitud moderada.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en BF16, como una NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superior. Para mayor velocidad, GPUs de datacenter como A10, A100 o H100 son adecuadas.
- Capacidad en GPU de consumo: sí, cabe en GPUs de consumo medio-alto. Con cuantización a 8 bits (int8), la memoria de pesos se reduce a ~1,2 GB, permitiendo ejecución en GPUs con 4 GB de VRAM.
- Opciones de despliegue: al ser un modelo de sentence-transformers, puede desplegarse con la librería `sentence-transformers` directamente, o mediante servidores de inferencia como Hugging Face Inference Endpoints, o usando `text-embeddings-inference` (TEI) de Hugging Face, que soporta modelos de embeddings.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de embeddings especializados en patentes coreanas. Como referencia genérica, se pueden considerar alternativas como:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| `elplaguister/patent_classifier_en_nemotron` | 1,14 B | 32.768 | Patentes coreanas + KOS | Apache 2.0 |
| `BAAI/bge-m3` | 568 M | 8.192 | Multilingüe, recuperación general | MIT |
| `intfloat/multilingual-e5-large` | 560 M | 512 | Multilingüe, recuperación general | MIT |

Estos modelos no están específicamente entrenados para taxonomía de patentes, por lo que el modelo de `elplaguister` ofrece una ventaja en precisión para el dominio concreto, aunque su alcance lingüístico se limita al coreano.

## Limitaciones y advertencias

- Entrenado únicamente con 2.002 patentes coreanas, lo que puede limitar su generalización a otros dominios técnicos o a patentes de otras jurisdicciones.
- El modelo solo soporta texto en coreano; no se ha evaluado su rendimiento con otros idiomas.
- La ventana de contexto de 32.768 tokens es amplia, pero secuencias más largas podrían truncarse o degradar el rendimiento.
- No se han publicado valores de métricas de evaluación, por lo que no es posible verificar su rendimiento real frente a otros modelos.
- El nombre del repositorio incluye "en_nemotron", pero el modelo está entrenado para coreano; puede generar confusión.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo puede heredar sesgos de los datos de entrenamiento (patentes coreanas), lo que podría afectar la clasificación de patentes de otros países o tecnologías emergentes.
- En producción, es recomendable validar el modelo con un conjunto de pruebas propio antes de desplegarlo en tareas críticas de clasificación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/elplaguister/patent_classifier_en_nemotron
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Página de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Repositorio GitHub de Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
- Documentación de Nemotron en Hugging Face: https://huggingface.co/docs/transformers/model_doc/nemotron
