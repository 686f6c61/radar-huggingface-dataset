# QuerynAi/queryn-adapter-te3-small_to_me5-large

## Resumen

Queryn adapter — `te3-small` → `me5-large` es un modelo de traducción de embeddings desarrollado por QuerynAi, parte del motor de interoperabilidad entre vectores de embeddings de Queryn. Resuelve un problema concreto: permite que un corpus ya embebido con el modelo `te3-small` (de OpenAI, 1536 dimensiones) pueda servirse contra un índice construido con `me5-large` (de la familia E5, 1024 dimensiones) sin necesidad de re-embeder el corpus completo. Esto ahorra costes de cómputo y tiempo en migraciones de infraestructura de búsqueda vectorial.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 1,6 millones de parámetros, que mapea un vector de 1536 dimensiones a uno de 1024, normalizado L2. Se distribuye en formato ONNX (opset 17) y está publicado bajo licencia MIT. La mejor similitud coseno obtenida en test es de 0,9461, lo que indica una alta fidelidad en la traducción entre espacios. Es relevante porque aborda la interoperabilidad entre sistemas de embeddings heterogéneos, un problema creciente en aplicaciones de recuperación aumentada (RAG) y búsqueda semántica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~1,6 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de traducción de embeddings, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo es una proyección lineal que transforma un embedding de entrada de 1536 dimensiones (producido por `te3-small`) en un embedding de salida de 1024 dimensiones en el espacio de `me5-large`. La gráfica ONNX normaliza internamente el vector de entrada mediante L2, por lo que no se requiere pre-normalización. El batch es dinámico, lo que permite procesar múltiples vectores a la vez.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multi-dominio unificado que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados, con aproximadamente 350 000 filas. La función de pérdida fue `1 - media de similitud coseno`, optimizada con Adam y reducción de tasa de aprendizaje por meseta (`ReduceLROnPlateau`). Se entrenaron tanto una línea base lineal como un MLP para cada par de modelos, publicándose el de mayor puntuación (en este caso, el lineal con 0,9461 frente a 0,9435 del profundo). El checkpoint se guardó en la época 15.

## Capacidades

- Traducción de embeddings entre espacios: convierte vectores de `te3-small` (1536-d) al espacio de `me5-large` (1024-d) manteniendo la semántica.
- Normalización L2 automática: el grafo normaliza la entrada y produce salidas unitarias, simplificando el uso.
- Procesamiento por lotes dinámico: acepta batches de cualquier tamaño.
- Inferencia ligera: al ser una proyección lineal, requiere muy pocos recursos computacionales.
- Compatible con ONNX Runtime: puede ejecutarse en CPU, GPU o cualquier runtime que soporte ONNX.
- No es un modelo generativo: no genera texto, solo transforma representaciones vectoriales.

## Casos de uso

- Migración de índices vectoriales sin re-embedding: si una empresa tiene un corpus embebido con `te3-small` y quiere cambiar a un índice basado en `me5-large`, puede usar este adaptador para transformar los embeddings existentes y evitar el coste de reprocesar todo el corpus.
- Ahorro de costes en infraestructura de búsqueda: al no necesitar re-embedding, se reducen los gastos de cómputo y almacenamiento temporal durante la transición entre modelos de embeddings.
- Interoperabilidad entre sistemas: permite que aplicaciones que usan `te3-small` (por ejemplo, integradas con OpenAI) se comuniquen con backends que esperan embeddings de `me5-large`, facilitando la integración de componentes heterogéneos.
- Actualización incremental de índices: cuando se añaden nuevos documentos a un corpus ya embebido con `te3-small`, se pueden traducir solo los embeddings nuevos al espacio de `me5-large` sin tocar los existentes.
- Evaluación comparativa de modelos de embeddings: al traducir embeddings de un modelo a otro, se pueden comparar métricas de recuperación entre sistemas sin re-embedding, útil para investigación y pruebas A/B.
- Entornos con restricciones de API: si se quiere dejar de depender de la API de OpenAI (que genera `te3-small`) y pasar a un modelo open source como `me5-large`, el adaptador facilita la transición sin pérdida de datos ya indexados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible más allá de la similitud coseno en test. El dato reportado es:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test (epoch 15) | 0,9461 |
| Similitud coseno con arquitectura profunda | 0,9435 |

No hay comparación con otros adaptadores o modelos en la documentación proporcionada.

## Requisitos de hardware

- Al ser una proyección lineal de ~1,6 millones de parámetros, el modelo es extremadamente ligero. El archivo ONNX ocupa probablemente menos de 10 MB (aunque el tamaño exacto no se indica).
- Puede ejecutarse en CPU sin problemas; no requiere GPU para inferencia.
- La VRAM necesaria es despreciable (menos de 100 MB en la mayoría de los casos), por lo que cabe en cualquier GPU consumer (por ejemplo, RTX 3060 o superior) e incluso en entornos sin GPU.
- Se puede desplegar con ONNX Runtime, ya sea en Python, C++ o mediante servidores de inferencia como Triton o FastAPI.
- La latencia es del orden de microsegundos por vector en CPU moderna, dado que es una multiplicación matricial simple. El throughput puede ser de miles de vectores por segundo en un solo núcleo.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. Este adaptador forma parte de una colección de adaptadores de Queryn (por ejemplo, `bge-m3` → `me5-large`), pero no se ofrecen datos de rendimiento de esos otros adaptadores para comparar. Se puede afirmar que es una solución específica para el par `te3-small` → `me5-large`, sin alternativas equivalentes documentadas.

## Limitaciones y advertencias

- Es un adaptador específico para el par `te3-small` → `me5-large`; no funciona con otros modelos de origen o destino.
- La traducción no es perfecta: la similitud coseno de 0,9461 indica una pequeña pérdida de fidelidad semántica, que puede afectar a tareas de recuperación de alta precisión.
- No es un modelo de lenguaje: no genera texto ni tiene capacidades de razonamiento; solo transforma vectores.
- No se han documentado sesgos específicos, pero al ser una proyección lineal entrenada sobre un corpus con dominios concretos (ciencia, legal, medicina, finanzas), podría tener un rendimiento subóptimo en dominios muy diferentes.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo depende de los modelos originales (`te3-small` y `me5-large`), cuyas licencias y términos de uso deben verificarse por separado.
- No se proporcionan garantías de soporte ni mantenimiento por parte de QuerynAi.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-te3-small_to_me5-large)
- [Colección de adaptadores de Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Repositorio de Queryn en GitHub](https://github.com/Gigadelux/Queryn)
- [Documentación de adaptadores de Queryn](https://github.com/Gigadelux/Queryn/blob/main/docs/Adapters.md)
- [Paper de los modelos E5 (me5-large)](https://arxiv.org/pdf/2402.05672v1)
- [Guía sobre Text Embedding 3 Small (te3-small)](https://railwail.com/en/blog/text-embedding-3-small-complete-guide)
