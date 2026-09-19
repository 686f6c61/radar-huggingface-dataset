# MajidFQ/taxoSplitter-biz-router-setfit-v1

## Resumen

taxoSplitter-biz-router-setfit-v1 es un clasificador de texto entrenado con SetFit por el usuario MajidFQ que asigna a una consulta corta una de 25 categorías taxonómicas de negocio (Retail & Shops, Health & Medical, Construction & Trades, Government & Public Services, etc.). El modelo parte del encoder de frases intfloat/e5-base-v2 y añade una cabeza de clasificación basada en regresión logística sobre los embeddings resultantes, de modo que no genera texto: devuelve una etiqueta.

El interés técnico reside en el enfoque. SetFit es una técnica de aprendizaje few-shot sin prompts que primero afina un sentence transformer con aprendizaje contrastivo y después entrena un clasificador lineal sobre los embeddings del encoder afinado. Esto reduce drásticamente el coste de entrenamiento e inferencia frente a un LLM, pero limita el modelo a un conjunto cerrado de clases y a un único tipo de tarea.

Con 109.482.240 parámetros en el encoder, 0,4 GB de repositorio y una longitud máxima de 512 tokens, el modelo cabe en cualquier GPU de consumo e incluso en CPU. No tiene descargas ni likes en la fecha de creación (19 de septiembre de 2026), no declara licencia ni idiomas y no publica resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer tipo BERT (intfloat/e5-base-v2) + cabeza de clasificación LogisticRegression |
| Parámetros totales | 109.482.240 (safetensors; corresponde al encoder) |
| Longitud de contexto | 512 tokens (máximo de secuencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (encoder); cabeza de clasificación serializada aparte |
| Número de clases | 25 |
| Librería | setfit (compatible con sentence-transformers y con Text Embeddings Inference) |
| Tamaño del repositorio | 0,4 GB |
| Modelo base | intfloat/e5-base-v2 |
| Tarea (pipeline) | text-classification |

## Arquitectura y entrenamiento

SetFit no es una arquitectura única, sino un procedimiento en dos fases sobre un sentence transformer. En la primera, se afina el encoder intfloat/e5-base-v2 con aprendizaje contrastivo generando pares de frases de la misma clase y de clases distintas. En la segunda, se congelan los embeddings del encoder afinado y se entrena una regresión logística de scikit-learn como cabeza de clasificación. El resultado son 109.482.240 parámetros en el encoder más una cabeza lineal de muy baja dimensionalidad (25 clases sobre un espacio de 768 dimensiones).

La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO (no aplicables en este tipo de modelo). Sí especifica el uso de la técnica few-shot de SetFit, el paper asociado (Efficient Few-Shot Learning Without Prompts, arXiv:2209.11055) y que la librería es setfit. La innovación relevante es precisamente el paradigma few-shot sin prompts: permite obtener un clasificador competitivo con muy pocos ejemplos por clase y sin necesidad de un LLM generativo.

## Capacidades

- Clasificación de texto en 25 categorías taxonómicas de negocio o puntos de interés.
- Enrutamiento de consultas cortas a una etiqueta de sector, como sugiere el nombre del modelo (biz-router).
- Extracción de embeddings de frase mediante el encoder e5-base-v2, reutilizables para búsqueda semántica o clustering.
- Funcionamiento con muy pocos ejemplos por clase gracias al entrenamiento few-shot de SetFit.
- Inferencia determinista y de bajo coste, sin generación de texto.
- Compatibilidad declarada con Text Embeddings Inference y con endpoints de Hugging Face.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Categorías etiquetadas visibles en la model card: Religious & Spiritual, Health & Medical, Wholesale & Supply, Legal & Professional Services, Sports, Fitness & Recreation, Retail & Shops, Education & Training, Manufacturing & Industrial, Nonprofits, Associations & Community, Agriculture, Farming & Natural Resources, Construction & Trades, Home & Garden Services, Transport & Logistics, Food & Drink, Utilities & Energy, Arts, Culture & Entertainment, Veterinary, Pets & Animals, Technology & Telecom, Real Estate & Property, Places & Landmarks, Government & Public Services y Automotive. El extracto disponible no incluye las tres categorías restantes hasta completar las 25.

## Casos de uso

- Enrutamiento de consultas de negocio a taxonomía: dada una cadena corta como "ice cream equipment supplier" o "fuel oil supplier", el modelo devuelve la categoría correspondiente, lo que permite dirigir automáticamente cada consulta al equipo o al vertical adecuado.
- Normalización de directorios de empresas y puntos de interés: convertir etiquetas libres y heterogéneas de un listado (por ejemplo, "group home" o "archaeological museum") a un esquema cerrado de 25 categorías para su explotación analítica.
- Pre-etiquetado en pipelines de anotación humana: usar el modelo como primera pasada sobre grandes volúmenes de texto y reservar la revisión manual para los casos de baja confianza, reduciendo el coste de anotación.
- Clasificación y enrutamiento de leads en CRM: asignar cada formulario de contacto o lead entrante a un sector comercial concreto para distribuirlo al comercial especializado.
- Filtrado y facetado en buscadores internos: generar facetas de categoría sobre el índice documental o de fichas de negocio, mejorando el filtrado sin necesidad de un LLM.
- Validación de formularios y control de calidad de datos: comprobar que la categoría declarada por un usuario coincide con la descripción textual que ha introducido, marcando inconsistencias.
- Deduplicación y agrupación de registros: agrupar entradas similares por categoría antes de fusionar duplicados en una base de datos maestra.
- Clasificación en tiempo real de bajo coste: al ser un encoder de 109 M de parámetros, puede servirse en CPU con latencia reducida para volúmenes moderados, lo que lo hace apto para microservicios sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio declara la métrica accuracy en la model card, pero no incluye ningún valor numérico, conjunto de evaluación ni comparación con otros modelos. El tamaño del repositorio indica que los pesos se han subido, pero no se acompaña de ninguna tabla de resultados.

## Requisitos de hardware

- Peso del encoder: aproximadamente 0,44 GB en FP32 y 0,22 GB en FP16, coherente con un repositorio de 0,4 GB.
- Inferencia en CPU: viable para lotes pequeños y tráfico moderado, dado el tamaño del encoder.
- GPU de consumo: cabe holgadamente en cualquier GPU con 6 GB o más de VRAM (GTX 1060 6 GB, RTX 3060, RTX 4060, RTX 4090). Es difícil que la VRAM sea el cuello de botella.
- GPU de datacenter: A100 o H100 solo tendrían sentido para maximizar el throughput con lotes muy grandes; no son necesarias para servir el modelo.
- Opciones de despliegue: SetFit y sentence-transformers en Python, Text Embeddings Inference para el encoder (etiqueta text-embeddings-inference), Hugging Face Inference Endpoints (etiqueta endpoints_compatible) y exportación a ONNX Runtime o TorchScript. Hay que tener en cuenta que la cabeza de LogisticRegression se sirve aparte del encoder de embeddings.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MajidFQ/taxoSplitter-biz-router-setfit-v1 | 109.482.240 (encoder) | 512 tokens | Clasificación en 25 clases (SetFit) | no disponible | Hugging Face, 0 descargas |
| intfloat/e5-base-v2 | 109 M | 512 tokens | Embeddings de frase (sin cabeza de clasificación) | MIT | Hugging Face, ampliamente utilizado |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Embeddings de frase | Apache-2.0 | Hugging Face, muy popular |
| Clasificador BERT-base afinado de forma supervisada | ~110 M | 512 tokens | Clasificación de texto | depende del checkpoint | Hugging Face, múltiples variantes |

El rendimiento comparado no está disponible porque el modelo no publica métricas. La comparación anterior se limita a parámetros, contexto, tarea, licencia y disponibilidad.

## Limitaciones y advertencias

- No se declara licencia en la model card, por lo que el uso comercial queda en una situación jurídica indeterminada.
- No se declaran los idiomas soportados. El encoder base intfloat/e5-base-v2 se entrena sobre corpus mayoritariamente en inglés, de modo que el rendimiento en castellano u otros idiomas no está garantizado.
- El modelo es un clasificador discriminativo, no generativo: no puede alucinar texto, pero sí asignar una categoría incorrecta, especialmente con entradas ambiguas o fuera de distribución.
- El conjunto de clases es cerrado (25 categorías). No se documenta ninguna clase de tipo "otros" o "desconocido", por lo que las entradas que no encajen en la taxonomía se forzarán a la clase más probable.
- El extracto de la model card solo muestra 22 de las 25 categorías, por lo que la taxonomía completa no está documentada en la información disponible.
- La longitud máxima de 512 tokens implica truncamiento en documentos largos; el modelo está pensado para cadenas cortas.
- No hay descargas ni likes ni métricas publicadas, lo que impide cualquier validación externa de su calidad o robustez.
- El nombre del modelo sugiere un uso específico (enrutamiento de consultas de negocio); emplearlo fuera de ese dominio no está respaldado por ninguna evaluación.
- Al depender de un encoder de 109 M de parámetros, el techo de rendimiento en tareas de clasificación fina es inferior al de un modelo generativo grande con ajuste supervisado, aunque el coste también es mucho menor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MajidFQ/taxoSplitter-biz-router-setfit-v1
- Modelo base: https://huggingface.co/intfloat/e5-base-v2
- Paper de SetFit: https://arxiv.org/abs/2209.11055
- Blog de SetFit: https://huggingface.co/blog/setfit
- Repositorio de SetFit en GitHub: https://github.com/huggingface/setfit
- Documentación de Sentence Transformers: https://www.sbert.net
- LogisticRegression de scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html

Nota: las búsquedas web realizadas no han devuelto ninguna fuente relacionada con este modelo; los resultados obtenidos no guardan relación con la ficha.
