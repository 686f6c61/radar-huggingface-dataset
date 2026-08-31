# QuerynAi/queryn-adapter-fastembed-bge-small_to_te3-small

## Resumen

Queryn adapter — `fastembed-bge-small` → `te3-small` es un adaptador de traducción de embeddings desarrollado por QuerynAi. Su función es transformar un vector de embedding generado por el modelo `fastembed-bge-small` (de 384 dimensiones) al espacio de representación de `te3-small` (de 1536 dimensiones). Esto permite que un corpus ya indexado con `fastembed-bge-small` pueda servirse contra un índice de `te3-small` sin necesidad de re-embedding completo, lo que ahorra tiempo y coste computacional en migraciones de infraestructura de búsqueda vectorial.

El modelo es un pequeño perceptrón multicapa (MLP) con una capa oculta, activación GELU y un latente comprimido, con aproximadamente 370.4K parámetros. Se distribuye en formato ONNX (opset 17) y está publicado bajo licencia MIT. Forma parte del motor de traducción de embeddings de Queryn, que entrena adaptadores para múltiples pares de modelos. La similitud coseno media en el conjunto de prueba alcanza 0.7197, lo que indica una fidelidad moderada en la proyección entre espacios.

Su relevancia actual radica en la creciente adopción de modelos de embeddings especializados y la necesidad de interoperar entre ellos sin reprocesar grandes volúmenes de datos. Este adaptador es una solución ligera y de código abierto para ese problema concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con 1 capa oculta, activación GELU, latente comprimido |
| Parametros totales | ~370.4K |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre embeddings fijos) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponible (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es un perceptrón multicapa que mapea un vector de entrada de 384 dimensiones (embeddings de `fastembed-bge-small`) a un vector de salida de 1536 dimensiones (espacio de `te3-small`). La arquitectura `deep` incluye una capa oculta con activación GELU y una representación latente comprimida, seguida de una proyección final. El grafo ONNX normaliza L2 tanto la entrada como la salida, por lo que no se requiere pre-normalización.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multi-dominio que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados, con aproximadamente 350.000 filas. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de tasa de aprendizaje por meseta (`ReduceLROnPlateau`). Se guardó el checkpoint de mejor época. Además, se entrenó una variante lineal como baseline; se publicó la arquitectura con mayor puntuación en el conjunto de prueba (la `deep` obtuvo 0.7197 frente a 0.7101 de la lineal).

## Capacidades

- Traducción de embeddings entre dos espacios vectoriales concretos: de `fastembed-bge-small` (384-d) a `te3-small` (1536-d).
- Normalización L2 integrada en el grafo, lo que garantiza vectores unitarios a la salida.
- Eje de batch dinámico, admite procesamiento por lotes de tamaño variable.
- Inferencia ligera: al ser un MLP de ~370K parámetros, se ejecuta en CPU con latencia mínima.
- Compatible con el ecosistema ONNX Runtime, lo que facilita su integración en pipelines existentes.
- No es un modelo generativo ni de lenguaje; no realiza generación de texto, razonamiento, tool calling ni otras capacidades propias de LLMs.

## Casos de uso

- Migración de índices vectoriales sin re-embedding: si una empresa tiene un corpus de millones de documentos embebidos con `fastembed-bge-small` y quiere cambiar a `te3-small` (por ejemplo, por mejor rendimiento en recuperación), puede usar este adaptador para transformar los vectores existentes y poblar el nuevo índice sin reprocesar el texto original.
- A/B testing de modelos de embeddings: permite comparar el rendimiento de `te3-small` frente a `fastembed-bge-small` sobre el mismo corpus, manteniendo fijo el índice original y solo transformando las consultas.
- Servicio de búsqueda híbrido: si parte del corpus ya está embebida con un modelo y otra parte con otro, el adaptador unifica los espacios para que un solo índice pueda consultarse de forma coherente.
- Actualización incremental de infraestructura: en sistemas donde re-embedding completo es inviable por coste o tiempo, el adaptador permite actualizar el modelo de embeddings de forma gradual, transformando solo los vectores nuevos.
- Investigación en transferencia entre espacios de representación: sirve como referencia para estudiar la alineación entre modelos de embeddings y la pérdida de información en proyecciones lineales y no lineales.
- Despliegue en entornos con recursos limitados: al ser un modelo ONNX de tamaño reducido, puede ejecutarse en CPUs de bajo consumo, en funciones serverless o en dispositivos edge sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la similitud coseno media en el conjunto de prueba: **0.7197** para la arquitectura `deep` (frente a 0.7101 de la variante lineal). No hay comparaciones con otros adaptadores ni métricas de recuperación (como Recall@k o NDCG) en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: despreciable. El modelo tiene ~370K parámetros en float32 (~1.5 MB), por lo que cabe en cualquier GPU, incluso en las más básicas, y también en CPU.
- GPU recomendadas: no se requiere GPU; una CPU moderna es suficiente para inferencia en tiempo real.
- Compatibilidad con consumer GPU: sí, cualquier GPU con soporte ONNX Runtime (incluso integradas) puede ejecutarlo.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider), puede integrarse en servicios como FastAPI, o usarse junto a librerías de búsqueda vectorial como Qdrant o FAISS.
- Latencia y throughput: no se han publicado mediciones oficiales, pero al ser un MLP de una capa, la latencia por lote es del orden de microsegundos a milisegundos en CPU, dependiendo del tamaño del lote.

## Comparativa con modelos similares

No se dispone de adaptadores equivalentes publicados en la información proporcionada. La alternativa natural sería re-embedding completo con `te3-small`, que implica reprocesar todo el corpus con el modelo destino. La comparación sería:

| Aspecto | Adaptador Queryn (este modelo) | Re-embedding con te3-small |
|---|---|---|
| Coste computacional | Muy bajo (solo transformar vectores) | Alto (procesar todo el texto) |
| Tiempo de migración | Minutos u horas según volumen | Días o semanas en corpus grandes |
| Fidelidad de la proyección | Similitud coseno 0.7197 (pérdida de información) | Exacta (embeddings nativos) |
| Requisitos de hardware | CPU básica | GPU o CPU potente para el modelo te3-small |
| Licencia | MIT | Depende de te3-small (no especificada aquí) |

## Limitaciones y advertencias

- La traducción entre espacios no es perfecta: la similitud coseno de 0.7197 indica una pérdida de información significativa. Los resultados de búsqueda pueden degradarse respecto a usar `te3-small` nativo.
- El adaptador se entrenó en dominios específicos (ciencia, legal, QA, medicina, finanzas). Su rendimiento en otros dominios puede ser inferior.
- No se han publicado evaluaciones de robustez ante ruido, adversariales o embeddings fuera de distribución.
- El modelo depende de la calidad de los embeddings de origen; si `fastembed-bge-small` cambia su comportamiento en futuras versiones, el adaptador podría quedar desactualizado.
- No es un modelo de lenguaje: no puede generar texto ni realizar tareas de razonamiento. Su único propósito es la transformación de vectores.
- La licencia MIT permite uso comercial, pero el usuario debe verificar la licencia de los modelos origen y destino (`fastembed-bge-small` y `te3-small`) para asegurar el cumplimiento en su caso de uso.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco validado por la comunidad. Se recomienda probar exhaustivamente antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-fastembed-bge-small_to_te3-small
- Colección de adaptadores de Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio de FastEmbed (librería de referencia para el modelo origen): https://github.com/qdrant/fastembed
- Documentación de BGE (modelos de embeddings relacionados): https://bge-model.com/
