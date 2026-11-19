# NeuML/atto-17m-8192d-sparse-embeddings

## Resumen

Atto 17M 8192d sparse embeddings es un modelo de recuperación de información dispersa (sparse retrieval) desarrollado por NeuML, construido sobre el modelo base NeuML/atto-17m-8192d, un transformer contextual compacto de aproximadamente 17 millones de parámetros. El modelo se ha afinado con la librería sentence-transformers para producir representaciones dispersas de 8192 dimensiones mediante una estrategia de pooling SPLADE (max pooling con activación ReLU), lo que permite búsqueda semántica eficiente sobre vocabularios de 30K términos.

La relevancia de este modelo reside en su relación entre tamaño y rendimiento: con tan solo 17M de parámetros supera en la media de BEIR a su hermano mayor de 28M (0.4596 frente a 0.4520 en nDCG@10), lo que lo convierte en una opción atractiva para despliegues con recursos muy limitados, como entornos edge o pipelines de RAG de bajo coste. El modelo está pensado para integrarse con la librería txtai (versión 9.0 o superior) para construir bases de datos de embeddings y como fuente de conocimiento en generación aumentada por recuperación.

La familia Atto se define como un conjunto de modelos contextuales compactos orientados al aprendizaje de representaciones lingüísticas con eficiencia de parámetros. Este checkpoint concreto es un fine-tune del modelo base y está publicado bajo licencia Apache 2.0, con soporte exclusivo para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (AttoModel) + SPLADE pooling (max, ReLU) sobre 8192 dimensiones |
| Parámetros totales | 17M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensiones de embedding | 8192 |
| Vocabulario | 30K |
| Tarea | sentence-similarity, feature-extraction, sparse-encoder |
| Modelo base | NeuML/atto-17m-8192d |
| Tamaño del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas típica de los sparse encoders: un transformer (AttoModel) que produce token embeddings a partir de la última capa oculta, seguido de una capa SpladePooling con estrategia de max pooling y función de activación ReLU que proyecta la salida a un espacio disperso de 8192 dimensiones. Esta combinación genera vectores dispersos donde solo un subconjunto de las 8192 dimensiones queda activo, lo que facilita el almacenamiento compacto y el cálculo eficiente de similitudes mediante índices invertidos.

El entrenamiento se realizó con sentence-transformers usando los siguientes hiperparámetros: batch size de 64 por dispositivo, 25 épocas, learning rate de 3e-4, 1000 pasos de warmup, weight decay de 0.01, acumulación de gradientes de 2 pasos y precisión fp16. Se emplearon prompts diferenciados para consultas (`query: `) y documentos (`document: `), lo que es habitual en modelos de recuperación asimétrica. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset, aunque el artículo "Introducing Atto" referenciado por el autor contiene detalles adicionales sobre la metodología.

## Capacidades

- Generación de embeddings dispersos de 8192 dimensiones para búsqueda semántica y recuperación de información.
- Codificación asimétrica de consultas y documentos mediante prompts específicos (`query: ` y `document: `).
- Similitud semántica entre frases y documentos (pipeline sentence-similarity).
- Extracción de características (feature-extraction) a nivel de token y de secuencia.
- Integración nativa con txtai 9.0+ para construir índices de embeddings dispersos y bases de conocimiento para RAG.
- Compatibilidad con la clase `SparseEncoder` de sentence-transformers.
- Soporte de scoring con vectores dispersos, lo que permite almacenamiento eficiente y recuperación mediante índices invertidos.
- Capacidad multilingüe: no disponible (solo inglés).
- Tool calling, agentes, visión, audio o modo thinking: no disponibles (el modelo es exclusivamente un encoder de texto).

## Casos de uso

- Búsqueda semántica en corpus pequeños o medianos: el modelo puede indexar documentos y recuperar los más relevantes mediante similitud dispersa, con un coste computacional muy bajo gracias a sus 17M de parámetros y a la representación sparse de 8192 dimensiones.
- Generación aumentada por recuperación (RAG) en entornos con recursos limitados: se puede usar como recuperador en pipelines de RAG integrados con txtai, aportando contexto relevante a un LLM generador sin necesidad de GPUs de gama alta.
- Despliegue en edge o dispositivos con poca memoria: al ocupar apenas 0.1 GB en safetensors, el modelo cabe holgadamente en CPUs y GPUs integradas, lo que lo hace adecuado para aplicaciones locales de búsqueda documental.
- Deduplicación y clustering de documentos: los embeddings dispersos permiten calcular similitudes entre grandes colecciones de textos para agrupar o eliminar duplicados en pipelines de curación de datos.
- Motor de búsqueda interno para documentación técnica: se puede integrar en herramientas de documentación o wikis para ofrecer búsqueda semántica sobre manuales, guías y FAQs en inglés.
- Clasificación y enrutamiento de tickets de soporte: los embeddings pueden alimentar un clasificador ligero que asigne consultas a categorías o equipos según su similitud con ejemplos previos.
- Filtrado previo en sistemas de recomendación de contenido: el modelo puede puntuar la afinidad entre el perfil de un usuario y artículos o publicaciones mediante similitud semántica dispersa.

## Benchmarks y rendimiento

Resultados de un subconjunto de BEIR (nDCG@10) reportados por el autor:

| Modelo | Parámetros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| atto-17m-8192d-sparse | 17M | 8192 | 30K | 0.3981 | 0.3208 | 0.6600 | 0.4596 |
| atto-28m-8192d-sparse | 28M | 8192 | 30K | 0.3651 | 0.3292 | 0.6618 | 0.4520 |
| SlideOn | 174M | 768 | 50K | 0.4655 | 0.3863 | 0.7529 | 0.5349 |

El modelo de 17M supera ligeramente al de 28M en la media de los tres datasets evaluados, aunque queda por debajo de SlideOn, un modelo mucho mayor (174M) con embeddings densos de 768 dimensiones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (17M de parámetros, pesos de aproximadamente 34 MB en fp16 y 0.1 GB de repositorio completo).
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo puede ejecutarse en RTX 3060, RTX 4090, A100 o H100 sin problemas, aunque el hardware de gama alta no aporta ventajas significativas frente a alternativas más ligeras.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU. También es viable en dispositivos embebidos y Raspberry Pi.
- Opciones de despliegue: sentence-transformers (clase `SparseEncoder`), txtai 9.0+, y potencialmente transformers con código personalizado (el modelo requiere `custom_code` y `trust_remote_code`).
- Latencia y throughput: no disponibles en la información proporcionada, aunque por el tamaño del modelo se espera un throughput muy alto en CPU y GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | Licencia | BEIR medio (nDCG@10) |
|---|---:|---:|---|---|---:|
| atto-17m-8192d-sparse | 17M | 8192 (sparse) | no disponible | Apache 2.0 | 0.4596 |
| atto-28m-8192d-sparse | 28M | 8192 (sparse) | no disponible | Apache 2.0 | 0.4520 |
| SlideOn | 174M | 768 (dense) | no disponible | no disponible | 0.5349 |

El modelo se posiciona como la opción más ligera de la comparativa, con un rendimiento ligeramente superior al de 28M en la media evaluada y por debajo de SlideOn, que triplica su tamaño y ofrece embeddings densos. La elección entre ellos depende del presupuesto de cómputo y de si se prioriza la eficiencia del almacenamiento disperso.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- La longitud máxima de contexto no está documentada, lo que dificulta planificar su uso con documentos largos.
- Al ser un modelo de recuperación y no generativo, no puede producir texto, razonar de forma autónoma ni ejecutar tool calling.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí puede recuperar documentos irrelevantes si la consulta está fuera de dominio.
- Los benchmarks publicados se limitan a tres datasets de BEIR (ArguAna, NFCorpus, SciFact), por lo que la evaluación es parcial y puede no reflejar el rendimiento en otros dominios.
- Requiere `custom_code` y `trust_remote_code` al cargarse con transformers, lo que implica revisar el código del repositorio antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las licencias de los datos de entrenamiento originales del modelo base.
- El modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la consulta, lo que indica una adopción muy limitada y escasa validación por parte de la comunidad.
- La integración con txtai requiere la versión 9.0 o superior para el scoring de vectores dispersos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-17m-8192d-sparse-embeddings
- Modelo base: https://huggingface.co/NeuML/atto-17m-8192d
- Modelo hermano de 28M: https://huggingface.co/neuml/atto-28m-8192d-sparse-embeddings
- SlideOn (modelo comparado): https://huggingface.co/lightonai/slideon
- Artículo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Documentación de sentence-transformers: https://www.SBERT.net
