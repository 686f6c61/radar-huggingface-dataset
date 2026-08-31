# QuerynAi/queryn-adapter-me5-large_to_qwen3-emb-8b

## Resumen

Queryn adapter — `me5-large` → `qwen3-emb-8b` es un adaptador de embeddings desarrollado por QuerynAi que traduce vectores generados por el modelo de embeddings `me5-large` (1024 dimensiones) al espacio de representación de `qwen3-emb-8b` (4096 dimensiones). Su propósito es permitir que un corpus ya indexado con `me5-large` pueda ser servido contra un índice construido con `qwen3-emb-8b` sin necesidad de re-embedding completo, lo que ahorra tiempo y coste computacional en migraciones de infraestructura de búsqueda semántica.

El modelo es un pequeño MLP de aproximadamente 2,6 millones de parámetros, con una capa oculta con activación GELU y un latente comprimido, exportado a ONNX (opset 17). Forma parte del motor de traducción de embeddings Queryn, que entrena adaptadores por pares de modelos fuente y destino. La mejor similitud coseno en test alcanza 0,7418, superando a la variante lineal (0,7358). Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP profundo (1 capa oculta, GELU, latente comprimido) — adaptador de embeddings |
| Parametros totales | ~2,6 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de traduccion de embeddings, no generativo) |
| Tipos de cuantizacion | no disponible (solo ONNX float32) |
| Idiomas soportados | no disponible (depende de los modelos fuente y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es un perceptrón multicapa (MLP) con una única capa oculta de activación GELU y una representación latente comprimida. El grafo ONNX normaliza internamente los embeddings de entrada con L2, por lo que no se requiere pre-normalización. La salida es un vector de 4096 dimensiones, también normalizado unitariamente, en el espacio de `qwen3-emb-8b`. La dimensión del batch es dinámica.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multi-dominio unificado de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto y mercados. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y programación de tasa de aprendizaje `ReduceLROnPlateau`. Se entrenaron dos variantes (lineal y profunda) para cada par de modelos, publicándose la de mayor puntuación en test; en este caso se guardó la variante profunda con 0,7418 frente a 0,7358 de la lineal.

## Capacidades

- Traducción de embeddings de `me5-large` (1024-d) al espacio de `qwen3-emb-8b` (4096-d).
- Normalización L2 integrada en el grafo, tanto en entrada como en salida.
- Soporte de batch dinámico, permitiendo procesar lotes de cualquier tamaño.
- Inferencia ligera en CPU mediante ONNX Runtime.
- Compatible con pipelines de `feature-extraction` de Hugging Face.
- No requiere re-embedding del corpus original, solo transformación de vectores ya existentes.

## Casos de uso

- Migración de índices de búsqueda semántica: si una empresa tiene un corpus embebido con `me5-large` y quiere pasar a un índice basado en `qwen3-emb-8b`, puede transformar los vectores existentes con este adaptador sin volver a procesar los documentos.
- Ahorro de coste computacional en actualizaciones de modelo: en lugar de re-ejecutar un pipeline de embedding sobre millones de documentos, se aplica una transformación ligera (MLP de 2,6M de parámetros) que se ejecuta en CPU en milisegundos.
- Interoperabilidad entre sistemas de retrieval: permite que un sistema que consume embeddings de `qwen3-emb-8b` reciba consultas codificadas con `me5-large` sin cambiar la infraestructura de indexación.
- Evaluación comparativa de modelos de embedding: al traducir embeddings entre espacios, se pueden comparar resultados de retrieval sin necesidad de re-embedding de los mismos datos.
- Entornos con recursos limitados: al ser un modelo ONNX de tamaño reducido, puede desplegarse en servidores sin GPU o incluso en dispositivos edge para transformar embeddings localmente.
- Integración en pipelines de datos existentes: el adaptador se puede insertar como un paso de transformación en Apache Airflow, Kafka Streams o cualquier sistema de procesamiento por lotes, usando ONNX Runtime.

## Benchmarks y rendimiento

El modelo card reporta la similitud coseno media en test para la mejor época (época 15) y la comparación con la arquitectura lineal:

| Arquitectura | Similitud coseno en test |
|---|---|
| Lineal | 0,7358 |
| Profunda (guardada) | 0,7418 |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) porque este modelo no es un LLM generativo, sino un adaptador de embeddings. La métrica relevante es la similitud coseno entre el embedding traducido y el embedding real de `qwen3-emb-8b` para los mismos textos.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene ~2,6M de parámetros y un grafo ONNX muy pequeño, por lo que se ejecuta en cualquier CPU moderna sin necesidad de GPU.
- VRAM estimada: no aplica (inferencia en CPU; si se usara GPU, ocuparía menos de 100 MB).
- GPU recomendadas: no necesarias; cualquier CPU con soporte de ONNX Runtime es suficiente.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider), puede integrarse en servicios como FastAPI, o usarse en pipelines de Hug Face.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamaño del modelo, se espera una latencia de sub-milisegundo por vector en CPU y un throughput de miles de vectores por segundo.

## Comparativa con modelos similares

Este adaptador pertenece a la colección Queryn Embedding Adapters, que incluye otros pares de traducción. La comparativa se centra en la misma familia de adaptadores:

| Modelo | Par origen → destino | Arquitectura | Parámetros | Mejor cosine test | Licencia |
|---|---|---|---|---|---|
| queryn-adapter-me5-large_to_qwen3-emb-8b | me5-large → qwen3-emb-8b | MLP profundo | ~2,6M | 0,7418 | MIT |
| queryn-adapter-bge-m3_to_me5-large | bge-m3 → me5-large | no disponible | no disponible | no disponible | MIT |

La alternativa principal a este adaptador sería re-embedding completo del corpus con `qwen3-emb-8b`, que garantiza una fidelidad total pero con un coste computacional mucho mayor. No hay otros adaptadores públicos comparables fuera de la colección Queryn.

## Limitaciones y advertencias

- La traducción no es perfecta: la similitud coseno máxima alcanzada es 0,7418, lo que implica una pérdida de calidad en la representación semántica respecto a usar directamente `qwen3-emb-8b`.
- El adaptador solo funciona para el par específico `me5-large` → `qwen3-emb-8b`; no es genérico para otros modelos.
- No es un modelo generativo: no puede generar texto, responder preguntas ni realizar razonamiento; su única función es transformar vectores.
- El entrenamiento se realizó sobre un corpus limitado (ciencia, legal, QA, medicina y finanzas); el rendimiento puede degradarse en dominios muy diferentes.
- No se han publicado datos sobre sesgos o alucinaciones, al no ser un modelo de lenguaje.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo depende de los modelos fuente y destino, cuyas licencias deben verificarse por separado.
- El repositorio no incluye información sobre cuantizaciones ni formatos alternativos (solo ONNX float32).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-me5-large_to_qwen3-emb-8b
- Colección de adaptadores Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio del motor Queryn: https://github.com/Gigadelux/Queryn
- Modelo fuente `me5-large`: no disponible en la información proporcionada
- Modelo destino `qwen3-emb-8b`: no disponible en la información proporcionada
