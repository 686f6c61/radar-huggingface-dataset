# QuerynAi/queryn-adapter-bge-m3_to_pplx-embed-1

## Resumen

Queryn adapter — `bge-m3` → `pplx-embed-1` es un adaptador de embeddings desarrollado por QuerynAi que traduce vectores generados por el modelo de embeddings BGE-M3 al espacio de representación de `pplx-embed-1`. Su propósito es permitir que un corpus ya indexado con BGE-M3 pueda servirse contra un índice construido con `pplx-embed-1` sin necesidad de re-embedding, lo que ahorra costes computacionales y de almacenamiento en migraciones o sistemas híbridos.

El modelo es un pequeño MLP de aproximadamente 1,1 millones de parámetros, con una capa oculta, activación GELU y un latente comprimido. Se distribuye en formato ONNX (opset 17) y acepta como entrada un tensor float32 de forma `[batch, 1024]` correspondiente a embeddings de BGE-M3, devolviendo vectores unitarios en el espacio de `pplx-embed-1`. La similitud coseno media en el mejor checkpoint de test alcanza 0,7081, lo que indica una fidelidad moderada en la traducción.

Este adaptador forma parte de un motor de traducción de embeddings más amplio de QuerynAi, que publica pares de modelos origen-destino. Su relevancia radica en la interoperabilidad entre sistemas de retrieval que usan distintos modelos de embeddings, un problema habitual en entornos de producción con índices ya construidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP profundo (1 capa oculta, GELU, latente comprimido) |
| Parametros totales | ~1,1M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo ONNX float32) |
| Idiomas soportados | no disponible (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es un perceptrón multicapa (MLP) con una única capa oculta, activación GELU y una representación latente comprimida. La entrada es un embedding de BGE-M3 de 1024 dimensiones, que el propio grafo normaliza L2 internamente, por lo que no se requiere pre-normalización. La salida es un vector de 1024 dimensiones normalizado a norma unitaria en el espacio de `pplx-embed-1`. El lote es dinámico en el eje de batch.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multi-dominio unificado de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se entrenaron dos arquitecturas (lineal y profunda) para cada par de modelos, publicándose la que obtuviera mayor similitud coseno en test; en este caso, la profunda alcanzó 0,7081 frente a 0,6939 de la lineal.

## Capacidades

- Traducción de embeddings: convierte vectores de BGE-M3 (1024-d) al espacio de `pplx-embed-1` (1024-d) manteniendo la semántica aproximada.
- Normalización integrada: el grafo ONNX normaliza L2 la entrada y la salida, garantizando vectores unitarios sin pasos adicionales.
- Inferencia ligera: con solo ~1,1M de parámetros, se ejecuta en CPU con latencia mínima.
- Compatibilidad con ONNX Runtime: se puede integrar en pipelines de Python, C++, o cualquier entorno que soporte ONNX.
- Interoperabilidad entre índices: permite reutilizar un corpus ya embedido con BGE-M3 en un sistema que espera embeddings de `pplx-embed-1`.
- Sin dependencia de GPU: el modelo es suficientemente pequeño para ejecutarse en entornos sin aceleración hardware.

## Casos de uso

- Migración de índices de búsqueda: si una empresa tiene un índice vectorial construido con BGE-M3 y desea cambiar a un sistema que usa `pplx-embed-1`, este adaptador transforma los vectores existentes sin re-embedding del corpus completo.
- Búsqueda híbrida multi-modelo: en arquitecturas que combinan varios modelos de embeddings para mejorar la recuperación, el adaptador permite unificar espacios vectoriales sin duplicar almacenamiento.
- Ahorro de costes en re-indexación: en corpus de gran tamaño (millones de documentos), re-embedding con un modelo nuevo puede ser costoso; el adaptador reduce ese coste a una transformación lineal por vector.
- Evaluación de calidad de traducción: los equipos de ML pueden usar la similitud coseno resultante (0,7081) como métrica para decidir si la pérdida de fidelidad es aceptable para su caso de uso.
- Prototipado rápido: al ser un modelo ONNX pequeño, se puede integrar en un servicio de embeddings existente con pocas líneas de código, como se muestra en el ejemplo de uso.
- Sistemas de retrieval aumentado (RAG): en pipelines que combinan BGE-M3 para indexación y `pplx-embed-1` para consultas, el adaptador alinea ambos espacios para una comparación coherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que este modelo no es un LLM sino un adaptador de embeddings. La única métrica reportada es la similitud coseno media en el conjunto de test:

| Metrica | Valor |
|---|---|
| Similitud coseno media (test, mejor época) | 0,7081 |
| Similitud coseno media (test, baseline lineal) | 0,6939 |

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; el modelo es un MLP de ~1,1M de parámetros que se ejecuta en CPU.
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente.
- Compatibilidad con GPU consumer: sí, pero innecesario; si se desea, puede ejecutarse en cualquier GPU con soporte ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios como FastAPI, o en pipelines de embeddings existentes.
- Latencia y throughput: no disponible, pero al ser un MLP de 1,1M de parámetros, la inferencia por lote es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de otros adaptadores de la misma colección para comparar directamente. Sin embargo, el propio autor publica una colección de adaptadores (Queryn Embedding Adapters) que traducen entre distintos pares de modelos de embeddings. La comparativa relevante sería contra el adaptador lineal del mismo par, que obtuvo 0,6939 de similitud coseno, inferior al MLP profundo (0,7081). No hay información pública sobre otros adaptadores de la colección en los resultados de búsqueda.

## Limitaciones y advertencias

- No es un modelo de generación de texto ni de razonamiento; solo transforma vectores de embeddings.
- La fidelidad de la traducción es limitada: una similitud coseno de 0,7081 implica que los vectores traducidos no son idénticos a los que produciría `pplx-embed-1` directamente, lo que puede degradar la calidad de recuperación en aplicaciones sensibles.
- Depende de la calidad de los embeddings de origen: si BGE-M3 produce vectores con sesgos o errores, estos se propagan al espacio destino.
- No se especifican los idiomas soportados; la cobertura multilingüe depende de los modelos subyacentes (BGE-M3 soporta más de 100 idiomas, pero no se indica si `pplx-embed-1` tiene la misma cobertura).
- El entrenamiento se realizó sobre un corpus específico (arXiv, jurisprudencia, SQuAD, PubMed, noticias financieras); el rendimiento en dominios muy diferentes puede ser inferior.
- No se proporcionan garantías de producción: el modelo se publica bajo licencia MIT sin soporte oficial.
- El tamaño del repositorio es 0,0 GB, lo que sugiere que el archivo ONNX puede no estar incluido o ser muy pequeño; se debe verificar la disponibilidad del peso `model.onnx` antes de su uso.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuerynAi/queryn-adapter-bge-m3_to_pplx-embed-1)
- [Colección de adaptadores de Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Documentación de BGE-M3](https://bge-model.com/bge/bge_m3.html)
- [BGE-M3 en HuggingFace](https://huggingface.co/BAAI/bge-m3)
- [Repositorio de BGE-M3 en GitHub](https://github.com/inferless/Bge-m3)
