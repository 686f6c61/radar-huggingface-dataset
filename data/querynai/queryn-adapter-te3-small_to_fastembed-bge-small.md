# QuerynAi/queryn-adapter-te3-small_to_fastembed-bge-small

## Resumen

QuerynAi/queryn-adapter-te3-small_to_fastembed-bge-small es un adaptador de embeddings desarrollado por QuerynAi, parte de su motor de traducción de embeddings. Su función es transformar los vectores generados por el modelo de embeddings `text-embedding-3-small` de OpenAI (1536 dimensiones) al espacio vectorial de `fastembed-bge-small` (384 dimensiones). Esto permite que un corpus ya indexado con `te3-small` pueda servirse contra un índice construido con `bge-small` sin necesidad de re-embedding, ahorrando tiempo y coste computacional.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 590.2K parámetros, exportada a ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350.000 filas, alcanzando una similitud coseno media de 0.9138 en el conjunto de test. Su relevancia radica en facilitar la interoperabilidad entre sistemas de búsqueda semántica y RAG que utilizan distintos modelos de embeddings, sin necesidad de reindexar grandes volúmenes de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~590.2K |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no procesa texto, solo vectores) |
| Tipos de cuantizacion | No disponible (formato ONNX float32) |
| Idiomas soportados | No disponibles (el corpus de entrenamiento incluye inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal que mapea un vector de entrada de 1536 dimensiones a uno de 384. El grafo ONNX incluye una normalización L2 interna, por lo que no es necesario normalizar previamente los embeddings de entrada. La salida también se normaliza a norma unitaria, quedando en el espacio de `fastembed-bge-small`.

El entrenamiento se realizó sobre pares de embeddings generados por los dos modelos a partir de un corpus unificado multi-dominio: resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas/mercados (~350.000 filas). La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de tasa de aprendizaje por meseta (`ReduceLROnPlateau`). Se entrenaron dos arquitecturas (lineal y MLP profundo) para cada par; se publicó la que obtuvo mejor puntuación en test, siendo la lineal la ganadora con 0.9138 frente a 0.8990 del MLP.

## Capacidades

- Traducción de embeddings entre dos espacios vectoriales concretos: `te3-small` (1536-d) a `fastembed-bge-small` (384-d).
- Preservación de la similitud coseno entre vectores traducidos, con una media de 0.9138 en test.
- Normalización L2 automática tanto en entrada como en salida, simplificando su integración.
- Soporte de batch dinámico en el grafo ONNX, permitiendo procesar múltiples vectores a la vez.
- Ejecución ligera en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No genera texto, no razona, no procesa lenguaje natural directamente; es exclusivamente un transformador de vectores.

## Casos de uso

- Migración de índices de búsqueda semántica: si una organización tiene un corpus indexado con `te3-small` y desea cambiar a un índice basado en `bge-small`, puede aplicar este adaptador a los embeddings existentes sin re-embedding, reduciendo costes y tiempo.
- Interoperabilidad entre sistemas RAG: permite que un pipeline de recuperación que usa `fastembed-bge-small` consuma datos generados con `te3-small`, facilitando la integración de componentes heterogéneos.
- Ahorro de almacenamiento: al convertir embeddings de 1536 dimensiones a 384, se reduce el espacio de almacenamiento del índice en un 75%, manteniendo una calidad de recuperación razonable (similitud coseno 0.9138).
- Actualización incremental de índices: cuando se añaden nuevos documentos a un corpus ya embebido con `te3-small`, se pueden traducir solo los nuevos vectores y añadirlos al índice `bge-small` sin reprocesar todo el corpus.
- Evaluación de alternativas de embeddings: permite comparar el rendimiento de recuperación entre `te3-small` y `bge-small` sobre el mismo corpus, sin necesidad de duplicar la indexación.
- Despliegue en entornos con recursos limitados: al ser un modelo ONNX de ~590K parámetros, puede ejecutarse en CPU en servidores modestos o incluso en dispositivos edge, facilitando la migración de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, ya que este modelo no es un LLM sino un adaptador de embeddings. La única métrica reportada es la similitud coseno media en el conjunto de test, que alcanza **0.9138** (epoch 15). La ablación de arquitectura muestra que la proyección lineal supera al MLP profundo (0.8990).

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero (~590K parámetros, ~2.4 MB en float32), por lo que se ejecuta sin problemas en cualquier CPU moderna.
- VRAM: no requiere VRAM dedicada; puede ejecutarse en CPU con ONNX Runtime. Si se usa en GPU, el consumo es despreciable (menos de 100 MB).
- GPUs recomendadas: cualquier GPU, incluso integradas, es suficiente. No se requiere A100 ni H100.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios como FastAPI, o usarse en pipelines de procesamiento por lotes.
- Latencia: para un batch de 4 vectores, la inferencia es del orden de microsegundos en CPU; el cuello de botella sería la lectura de los embeddings de entrada, no el modelo.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores de embeddings comparables en la misma categoría (traducción entre espacios de embeddings). QuerynAi publica una colección de adaptadores para distintos pares de modelos (por ejemplo, `bge-m3` a `me5-large`), pero no se han encontrado datos de rendimiento comparativos entre ellos. La alternativa directa sería re-embedding con el modelo objetivo, que es más costoso computacionalmente pero no requiere adaptador.

## Limitaciones y advertencias

- El adaptador solo funciona para el par específico `te3-small` → `fastembed-bge-small`; no es generalizable a otros modelos de embeddings.
- La calidad de la traducción depende de la similitud entre los espacios de origen y destino; una similitud coseno de 0.9138 indica una buena correspondencia, pero no es perfecta y puede haber pérdida de información en casos extremos.
- No se especifican los idiomas soportados; el corpus de entrenamiento incluye principalmente inglés (arXiv, SQuAD, PubMed, noticias), por lo que el rendimiento en otros idiomas podría ser inferior.
- El modelo no procesa texto; requiere que los embeddings de entrada ya hayan sido generados por `te3-small`. Si se alimenta con vectores de otro origen, los resultados serán incorrectos.
- No se han publicado evaluaciones de sesgos o alucinaciones, ya que no es un modelo generativo.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia de los modelos de origen (OpenAI y BGE) para asegurar el cumplimiento en el uso final.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-te3-small_to_fastembed-bge-small)
- [Colección de adaptadores de Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Documentación de OpenAI sobre text-embedding-3-small](https://developers.openai.com/api/docs/models/text-embedding-3-small)
- [Anuncio de OpenAI sobre nuevos modelos de embeddings](https://openai.com/index/new-embedding-models-and-api-updates/)
- [Guía sobre text-embedding-3-small](https://railwail.com/en/blog/text-embedding-3-small-complete-guide)
