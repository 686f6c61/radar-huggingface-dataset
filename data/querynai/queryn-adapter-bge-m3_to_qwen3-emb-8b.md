# QuerynAi/queryn-adapter-bge-m3_to_qwen3-emb-8b

## Resumen

El modelo `queryn-adapter-bge-m3_to_qwen3-emb-8b` es un adaptador de traducción de embeddings desarrollado por QuerynAi. Su función es transformar un vector de embedding generado por el modelo `bge-m3` (de 1024 dimensiones) en el espacio de embeddings de `qwen3-emb-8b` (de 4096 dimensiones). Esto permite que un corpus ya indexado con `bge-m3` pueda ser servido contra un índice construido con `qwen3-emb-8b` sin necesidad de re-embedding, lo que supone un ahorro significativo de tiempo y coste computacional en migraciones de sistemas de búsqueda o RAG.

El adaptador es un pequeño MLP de aproximadamente 2,6 millones de parámetros, con una capa oculta y activación GELU, exportado a formato ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus multi-dominio (arXiv, jurisprudencia australiana, SQuAD, PubMed y noticias financieras) con una pérdida basada en similitud coseno. La mejor similitud coseno en test alcanzada es de 0,7449, lo que indica una fidelidad moderada en la traducción entre espacios.

Este modelo es relevante para equipos que gestionan infraestructuras de búsqueda semántica y desean actualizar el modelo de embeddings sin reprocesar todo el corpus, o que necesitan interoperar entre diferentes sistemas de embeddings. Su licencia MIT y su formato ONNX facilitan su integración en entornos de producción con `onnxruntime`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP profundo (1 capa oculta, GELU, latente comprimido) |
| Parametros totales | ~2,6 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en float32) |
| Idiomas soportados | no disponible (el adaptador es agnóstico al idioma; los modelos fuente y destino soportan múltiples idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador es un perceptrón multicapa (MLP) con una única capa oculta y activación GELU, diseñado para mapear un vector de 1024 dimensiones (salida de `bge-m3`) a uno de 4096 dimensiones (espacio de `qwen3-emb-8b`). El grafo ONNX normaliza internamente la entrada mediante L2, por lo que no es necesario pre-normalizar los embeddings de origen. La salida también se normaliza a norma unitaria.

El entrenamiento se realizó sobre pares de embeddings generados por ambos modelos a partir de un corpus unificado de aproximadamente 350 000 filas que abarca resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - similitud coseno media`, optimizada con Adam y reducción de tasa de aprendizaje por meseta (`ReduceLROnPlateau`). Se guardó el checkpoint de la mejor época. Para cada par de modelos se entrenaron dos arquitecturas (lineal y profunda) y se publicó la que obtuviera mayor similitud coseno en test; en este caso, la profunda superó a la lineal (0,7449 frente a 0,7246).

## Capacidades

- Traducción de embeddings de `bge-m3` (1024 dimensiones) al espacio de `qwen3-emb-8b` (4096 dimensiones).
- Normalización L2 automática de la entrada y salida, garantizando vectores unitarios.
- Soporte de batch dinámico en el grafo ONNX, lo que permite procesar múltiples vectores en una sola llamada.
- Inferencia en CPU mediante `onnxruntime`, sin dependencias adicionales más allá de `numpy` y `huggingface_hub`.
- Compatible con cualquier pipeline que consuma embeddings de `qwen3-emb-8b`, siempre que se aplique el adaptador antes de la indexación o búsqueda.
- No incluye capacidades de generación de texto, razonamiento, tool calling ni otras propias de un LLM; es exclusivamente un transformador de vectores.

## Casos de uso

- Migración de un índice de búsqueda semántica: si una organización tiene un corpus embebido con `bge-m3` y desea cambiar a `qwen3-emb-8b` para mejorar la calidad de recuperación, puede aplicar este adaptador a los embeddings existentes y reconstruir el índice sin reprocesar los documentos originales.
- Ahorro de costes en re-indexación: en corpus de gran tamaño (millones de documentos), re-embedding con un modelo nuevo puede ser costoso en tiempo y GPU. El adaptador permite transformar los vectores ya calculados con una operación ligera en CPU.
- Interoperabilidad entre sistemas: si diferentes partes de una infraestructura usan distintos modelos de embeddings (por ejemplo, un equipo usa `bge-m3` y otro `qwen3-emb-8b`), el adaptador facilita la comunicación entre ambos sin duplicar almacenamiento.
- Evaluación comparativa de modelos de embeddings: permite probar `qwen3-emb-8b` sobre un corpus ya embebido con `bge-m3` para medir si el cambio de modelo mejora los resultados de recuperación antes de comprometerse a una re-indexación completa.
- Actualización incremental de un RAG: en un sistema de generación aumentada por recuperación, se puede actualizar el componente de embeddings manteniendo la base de conocimiento existente, aplicando el adaptador a los vectores antiguos.
- Entornos con restricciones de hardware: al ser un modelo de solo 2,6 millones de parámetros y ejecutarse en CPU, es adecuado para despliegues en entornos sin GPU o con recursos limitados, como instancias pequeñas en la nube o dispositivos edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que este modelo no es un LLM sino un adaptador de embeddings. El único dato de rendimiento reportado es la similitud coseno media en el conjunto de test, que alcanzó **0,7449** en la época 15. Este valor indica la fidelidad de la traducción entre los dos espacios de embeddings; valores más cercanos a 1 implican una mejor preservación de las relaciones semánticas.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero (~2,6 millones de parámetros, tamaño del archivo ONNX inferior a 10 MB), por lo que se ejecuta sin problemas en cualquier CPU moderna.
- VRAM: no requiere GPU; si se desea ejecutar en GPU, el consumo de memoria es despreciable (menos de 100 MB).
- GPU recomendadas: no aplica; cualquier GPU con soporte CUDA puede acelerar la inferencia, pero no es necesaria.
- Opciones de despliegue: `onnxruntime` (CPU o CUDA), también puede integrarse en servicios como Triton Inference Server o simplemente como una función Python en un microservicio.
- Latencia y throughput: al ser un MLP pequeño, la inferencia de un batch de 1000 vectores tarda del orden de milisegundos en CPU; el throughput está limitado principalmente por la E/S y no por el cómputo.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables de otros proveedores en la documentación proporcionada. QuerynAi publica una colección de adaptadores para otros pares de modelos (por ejemplo, `bge-m3` → `me5-large`), pero no se ofrecen datos comparativos de rendimiento entre ellos. Por tanto, la comparativa con alternativas no está disponible.

## Limitaciones y advertencias

- La similitud coseno de 0,7449 indica que la traducción no es perfecta; puede haber pérdida de precisión en tareas de recuperación que dependan de distancias finas entre vectores.
- El adaptador se entrenó en dominios específicos (ciencia, legal, medicina, finanzas y QA general). Su rendimiento puede degradarse en dominios muy diferentes, como contenido técnico especializado o lenguajes coloquiales.
- No se han documentado sesgos específicos, pero al derivar de los modelos fuente y destino, podría heredar sesgos presentes en los datos de entrenamiento de `bge-m3` y `qwen3-emb-8b`.
- El modelo solo acepta embeddings de `bge-m3` como entrada; no es válido para otros modelos de embeddings.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los modelos fuente y destino (bge-m3 y qwen3-emb-8b) también cumplan con sus propias licencias en el caso de uso previsto.
- No se proporcionan garantías de soporte ni mantenimiento por parte de QuerynAi; el repositorio tiene 0 descargas y 0 likes, lo que sugiere un proyecto en fase temprana.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-bge-m3_to_qwen3-emb-8b)
- [Colección de adaptadores de Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Modelo fuente bge-m3](https://huggingface.co/BAAI/bge-m3)
- [Documentación de BGE-M3](https://bge-model.com/bge/bge_m3.html)
