# ChengsenWang/GenoJEPA-Tiny

## Resumen

GenoJEPA-Tiny es un modelo de aprendizaje de representaciones genómicas basado en la arquitectura predictiva de joint-embedding (JEPA), desarrollado por Chengsen Wang y colaboradores de la Universidad de Correos y Telecomunicaciones de Pekín. A diferencia de los enfoques tradicionales de modelado de lenguaje enmascarado (MLM) o predicción de siguiente token (NTP), GenoJEPA aprende representaciones semánticas de secuencias de ADN mediante la alineación en espacio latente, sin reconstruir nucleótidos individuales. Esta estrategia evita el ruido evolutivo y la falta de límites de palabras explícitos en el ADN, lo que permite obtener embeddings más robustos para tareas downstream.

El checkpoint Tiny, con aproximadamente 6,3 millones de parámetros, está diseñado para extracción eficiente de embeddings, probing y clasificación de secuencias genómicas. Es un modelo ligero que puede ejecutarse en hardware modesto, incluso en CPU, y se distribuye bajo licencia Apache 2.0. El modelo se publica con código personalizado en HuggingFace y requiere `trust_remote_code=True` para su uso. Aunque el repositorio de HuggingFace muestra un tamaño de 0.0 GB, la model card indica que los pesos están disponibles a través de la integración con Transformers, aunque no se ha confirmado la presencia de archivos de pesos en el repositorio actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Joint-Embedding Predictive Architecture (JEPA) para ADN |
| Parametros totales | 6.313.859 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de ADN, no idiomas naturales) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (indicado en tags, aunque el repo muestra 0.0 GB) |

## Arquitectura y entrenamiento

GenoJEPA emplea una arquitectura de joint-embedding predictiva, donde el modelo aprende a predecir representaciones latentes de regiones enmascaradas de la secuencia de ADN a partir del contexto visible. En lugar de reconstruir nucleótidos, el objetivo es alinear representaciones semánticas en un espacio latente, lo que captura relaciones funcionales y estructurales de forma más directa. El modelo Tiny es una versión reducida de la arquitectura completa, optimizada para extracción de embeddings y tareas de clasificación ligera.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El autor referencia dos datasets en HuggingFace: `ChengsenWang/GenoJEPA-Pretraining` y `ChengsenWang/GenoJEPA-Evaluation`, pero no se especifican sus contenidos ni volúmenes. El artículo asociado (bioRxiv 2026) describe el marco general, pero no se han publicado los hiperparámetros exactos del entrenamiento del checkpoint Tiny.

## Capacidades

- Extracción de embeddings semánticos de secuencias de ADN de longitud variable.
- Representación en espacio latente que captura relaciones funcionales sin reconstrucción de nucleótidos.
- Soporte para clasificación downstream mediante clasificadores ligeros (por ejemplo, regresión logística) sobre los embeddings congelados.
- Integración con la librería Transformers mediante código personalizado (`trust_remote_code=True`).
- Método `encode` que acepta listas de secuencias y devuelve embeddings en lote.
- Diseñado para tareas de predicción genómica, como clasificación de secuencias reguladoras, detección de variantes o anotación funcional.

## Casos de uso

- Clasificación de regiones reguladoras del genoma: los embeddings de GenoJEPA-Tiny pueden alimentar un clasificador lineal para distinguir promotores, potenciadores u otras regiones funcionales, aprovechando la representación semántica aprendida sin necesidad de anotaciones a nivel de nucleótido.
- Detección de elementos genéticos móviles: la representación latente puede facilitar la identificación de transposones o secuencias repetitivas mediante clasificación supervisada con pocos ejemplos etiquetados.
- Análisis de variantes patogénicas: los embeddings de secuencias alrededor de variantes pueden usarse como características para predecir efectos funcionales, complementando métodos basados en conservación o anotación.
- Agrupación y visualización de secuencias: los embeddings permiten agrupar secuencias por similitud funcional en espacios de baja dimensión, útil para explorar familias de genes o regiones no anotadas.
- Pretraining y fine-tuning en dominios específicos: el modelo puede servir como punto de partida para ajuste fino en tareas genómicas concretas, reduciendo la necesidad de datos etiquetados.
- Integración en pipelines de bioinformática: al ser ligero (6,3 M parámetros), puede ejecutarse en entornos con recursos limitados, como estaciones de trabajo sin GPU, para generar características en lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo de bioRxiv menciona que los vectores semánticos de GenoJEPA congelado soportan clasificadores ligeros sin GPU con precisión competitiva, pero no se proporcionan cifras concretas en la model card ni en los resultados de búsqueda. No se dispone de comparaciones cuantitativas con otros modelos genómicos.

## Requisitos de hardware

- Con 6,3 millones de parámetros, el modelo es extremadamente ligero y puede ejecutarse en CPU sin problemas.
- VRAM estimada: menos de 1 GB en FP32 (aproximadamente 25 MB de pesos), por lo que cabe en cualquier GPU, incluidas las integradas.
- GPU recomendadas: no se requiere GPU específica; cualquier GPU con al menos 1 GB de VRAM es suficiente.
- Compatible con consumer GPUs: sí, todas (por ejemplo, GTX 1650, RTX 3060, etc.).
- Opciones de despliegue: al usar Transformers con código personalizado, puede ejecutarse en entornos Python estándar. No se menciona soporte para vLLM, llama.cpp u Ollama, dado que es un modelo de embeddings, no generativo.
- Latencia y throughput: no disponibles, pero dado el tamaño, la inferencia en lote es prácticamente instantánea en CPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de representación genómica como DNABERT, Nucleotide Transformer o Enformer. GenoJEPA-Tiny se distingue por su arquitectura JEPA y su tamaño reducido, pero no hay datos de rendimiento publicados que permitan una comparación cuantitativa. Se recomienda consultar el artículo de bioRxiv para futuras actualizaciones.

## Limitaciones y advertencias

- El repositorio de HuggingFace muestra un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar subidos o que el modelo se carga desde otro origen. Se recomienda verificar la disponibilidad real antes de su uso en producción.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos derivados de la composición de los datos (por ejemplo, desequilibrio entre especies o regiones genómicas).
- Al ser un modelo de representación, no genera secuencias de ADN; su uso se limita a extracción de características.
- No se ha evaluado su comportamiento en secuencias muy largas; la longitud de contexto no está especificada.
- La licencia Apache 2.0 permite uso comercial, pero el código personalizado (`trust_remote_code=True`) implica ejecutar código del autor, lo que conlleva riesgos de seguridad si no se audita.
- No hay información sobre sesgos específicos, alucinación (no aplica al ser embeddings) ni limitaciones idiomáticas.

## Enlaces

- HuggingFace: https://huggingface.co/ChengsenWang/GenoJEPA-Tiny
- Repositorio GitHub: https://github.com/ForestsKing/GenoJEPA
- Artículo bioRxiv: https://www.biorxiv.org/content/10.64898/2026.04.02.716255v1
- Ficha en bio.rodeo: https://bio.rodeo/models/geno-jepa
- Dataset de pretraining: https://huggingface.co/datasets/ChengsenWang/GenoJEPA-Pretraining
- Dataset de evaluación: https://huggingface.co/datasets/ChengsenWang/GenoJEPA-Evaluation
