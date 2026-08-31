# aneforge/bge-base-en-v1.5

## Resumen

El modelo `aneforge/bge-base-en-v1.5` es una copia exacta y sin modificaciones del modelo de embeddings `BAAI/bge-base-en-v1.5`, publicado por el equipo de ANEForge con el objetivo de que los pesos carguen y se ejecuten directamente en el Apple Neural Engine (ANE) sin necesidad de CoreML. Se trata de un modelo encoder-only basado en BERT, especializado en generar representaciones vectoriales de frases para tareas de similitud semántica, búsqueda densa y recuperación de información.

El modelo original fue desarrollado por BAAI (Beijing Academy of Artificial Intelligence) como parte de la familia BGE (BAAI General Embedding). En su versión 1.5, se corrigieron problemas de distribución de similitud observados en la versión 1, ajustando el entrenamiento con aprendizaje contrastivo y una temperatura de 0.01, lo que produce puntuaciones de similitud concentradas en el intervalo [0.6, 1]. Con 109 millones de parámetros, es un modelo ligero y eficiente, adecuado para entornos con recursos limitados.

La relevancia de esta versión específica radica en su integración con ANEForge, una librería que compila el grafo del modelo en un único programa ANE y transmite los pesos desde Hugging Face mediante `huggingface_hub`. Esto permite ejecutar el modelo en hardware Apple (M1, M2, etc.) con un rendimiento optimizado y sin depender de CoreML, lo que resulta atractivo para desarrolladores que trabajan en ecosistemas Apple.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only) |
| Parametros totales | 109.482.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo original es inglés, pero no se especifica en esta ficha) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-only basado en la arquitectura BERT, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención (configuración base). No emplea mecanismos de mezcla de expertos (MoE) ni arquitecturas híbridas. Su entrenamiento se realizó mediante aprendizaje contrastivo con una temperatura de 0.01, lo que explica que las similitudes coseno entre frases tiendan a concentrarse en el intervalo [0.6, 1]. Esta característica es una mejora sobre la versión 1, que presentaba distribuciones de similitud menos calibradas.

Los pesos de esta versión son byte-idénticos a los del modelo original `BAAI/bge-base-en-v1.5`, por lo que no hay ninguna modificación en el entrenamiento ni en los datos utilizados. La única diferencia es el etiquetado y la integración con ANEForge, que compila el grafo del modelo en un programa ANE para su ejecución en el Neural Engine de Apple. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el número total de tokens utilizados.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica.
- Búsqueda semántica y recuperación densa de información.
- Clasificación de texto mediante la comparación de embeddings (por ejemplo, con un clasificador lineal encima).
- Agrupamiento (clustering) de textos por similitud.
- Deduplicación de documentos o mensajes.
- Soporte para normalización de embeddings (`normalize_embeddings=True`) para facilitar el cálculo de similitud coseno.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente encoder.
- Capacidades multilingües no confirmadas en esta ficha; el nombre del modelo sugiere que está orientado al inglés.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: el modelo convierte consultas y documentos en vectores, permitiendo recuperar los pasajes más relevantes mediante similitud coseno. Es adecuado para motores de búsqueda internos o asistentes de documentación técnica.
- Sistemas de recomendación basados en contenido: al representar ítems (artículos, productos, noticias) como embeddings, se pueden calcular similitudes entre ellos para sugerir elementos relacionados.
- Clasificación de texto con pocos datos: los embeddings generados pueden alimentar un clasificador lineal simple, logrando buenos resultados sin necesidad de fine-tuning completo.
- Deduplicación de registros: comparando embeddings de textos (por ejemplo, tickets de soporte o comentarios) se pueden identificar duplicados o variantes casi idénticas.
- Moderación de contenido: se pueden agrupar mensajes por similitud para detectar spam o contenido repetitivo.
- Análisis de sentimiento a nivel de frase: aunque no es un modelo de clasificación, los embeddings pueden usarse como características para entrenar un modelo de sentimiento con datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web menciona que los modelos BGE v1.5 lograron el primer puesto en MTEB y C-MTEB en su momento, pero no se proporcionan cifras concretas para `bge-base-en-v1.5`. Por tanto, no se incluyen tablas de rendimiento.

## Requisitos de hardware

- No se proporcionan requisitos específicos en la ficha del modelo.
- Al tratarse de un modelo de 109 millones de parámetros, su huella de memoria es reducida: en FP32 ocupa aproximadamente 438 MB, y con cuantización a 8 bits se reduce a unos 110 MB. Sin embargo, estos valores son estimaciones basadas en el tamaño de parámetros, no datos oficiales.
- Es ejecutable en GPUs de consumo como RTX 3060, RTX 4090 o incluso en CPU, aunque el objetivo principal de esta versión es el Apple Neural Engine.
- Para su uso con ANEForge, se requiere hardware Apple con Neural Engine (M1 o posterior) y la librería `aneforge` instalada.
- Opciones de despliegue: además de ANEForge, el modelo es compatible con `sentence-transformers`, `text-embeddings-inference` (según los tags) y cualquier framework que soporte safetensors y arquitectura BERT.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. A continuación se muestra una comparación cualitativa con otros modelos de embeddings de tamaño similar, basada en características generales conocidas:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| aneforge/bge-base-en-v1.5 | 109 M | no disponible | MIT | Duplicado de BAAI/bge-base-en-v1.5, optimizado para ANE |
| BAAI/bge-base-en-v1.5 | 109 M | 512 (típico) | MIT | Modelo original, sin integración ANE |
| sentence-transformers/all-MiniLM-L6-v2 | 22 M | 256 | Apache-2.0 | Más ligero, pero menor calidad en tareas de recuperación |

Esta tabla se basa en conocimiento general; los datos de contexto y rendimiento no están confirmados en la información disponible.

## Limitaciones y advertencias

- Al ser un modelo encoder-only, no puede generar texto ni mantener conversaciones; su uso se limita a producir representaciones vectoriales.
- La distribución de similitud concentrada en [0.6, 1] puede dificultar el establecimiento de umbrales de similitud en aplicaciones de búsqueda; se recomienda calibrar los umbrales con datos reales.
- No se han documentado sesgos específicos, pero al estar entrenado principalmente con texto en inglés, puede presentar un rendimiento inferior en otros idiomas.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías.
- La integración con ANEForge es específica para hardware Apple; en otros entornos se debe usar el modelo original o frameworks estándar.
- No se dispone de información sobre la longitud máxima de contexto soportada, lo que puede limitar su uso en documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aneforge/bge-base-en-v1.5
- Modelo original BAAI: https://huggingface.co/BAAI/bge-base-en-v1.5
- Repositorio ANEForge: https://github.com/sbryngelson/ANEForge
- Documentación de ANEForge: https://aneforge.readthedocs.io
- Paper de ANEForge: https://arxiv.org/abs/2606.17090
- Documentación de BGE v1 y v1.5: https://bge-model.com/bge/bge_v1_v1.5.html
