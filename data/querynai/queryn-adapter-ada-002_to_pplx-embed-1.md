# QuerynAi/queryn-adapter-ada-002_to_pplx-embed-1

## Resumen

Queryn adapter — `ada-002` → `pplx-embed-1` es un adaptador de embeddings desarrollado por QuerynAi como parte de su motor de traducción de espacios de embeddings. Su función es transformar un vector generado por el modelo `text-embedding-ada-002` de OpenAI (1536 dimensiones) al espacio de representación del modelo `pplx-embed-1` (1024 dimensiones), de modo que un corpus ya embebido con `ada-002` pueda servirse contra un índice construido con `pplx-embed-1` sin necesidad de re-embedding.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 1,6 millones de parámetros, exportado a ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350 000 filas que abarca resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados. La mejor similitud coseno en test alcanzada es 0,7665 (epoch 15), lo que indica una calidad razonable de traducción aunque no perfecta.

La relevancia de este adaptador radica en que permite migrar infraestructuras de búsqueda vectorial sin volver a calcular los embeddings de todo el corpus, ahorrando costes de cómputo y tiempo. Está publicado bajo licencia MIT y su tamaño de repositorio es de 0,0 GB, lo que sugiere que solo contiene el archivo ONNX y documentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~1,6 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un adaptador de embeddings) |
| Tipos de cuantizacion | no disponible (solo se publica en ONNX float32) |
| Idiomas soportados | no disponible (el corpus de entrenamiento es principalmente inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal que proyecta un vector de 1536 dimensiones a uno de 1024. El grafo ONNX normaliza L2 la entrada internamente, por lo que no es necesario pre-normalizar los embeddings de origen. La salida también está normalizada a norma unitaria, lista para ser usada en el espacio de `pplx-embed-1`.

El entrenamiento se realizó con pares de embeddings (mismo texto embebido con ambos modelos) sobre un corpus unificado multi-dominio de aproximadamente 350 000 filas. La función de pérdida fue `1 - media de similitud coseno`, con optimizador Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se entrenaron dos arquitecturas (lineal y MLP profundo) para cada par de modelos, publicándose la que obtuviera mejor similitud coseno en test; en este caso, la lineal obtuvo 0,7665 frente a 0,7613 de la profunda.

## Capacidades

- Traducción de embeddings de `ada-002` (1536-d) al espacio de `pplx-embed-1` (1024-d).
- Normalización L2 automática de la entrada y salida, garantizando vectores unitarios.
- Soporte de batch dinámico en el eje de lote (shape `[batch, 1536]` → `[batch, 1024]`).
- Ejecución en CPU mediante ONNX Runtime, sin dependencias de GPU.
- Integración sencilla con pipelines de búsqueda vectorial existentes (índices FAISS, Milvus, etc.).
- No es un modelo generativo ni de razonamiento; su única función es la transformación de representaciones vectoriales.

## Casos de uso

- Migración de índices de búsqueda vectorial: si una empresa tiene un corpus embebido con `ada-002` y quiere cambiar a `pplx-embed-1` sin re-embedding, puede aplicar este adaptador a todos los vectores almacenados y reconstruir el índice en el nuevo espacio.
- Ahorro de costes en infraestructura: re-embedding de millones de documentos con un modelo nuevo puede ser caro y lento; el adaptador permite reutilizar los embeddings existentes con una simple proyección lineal.
- Interoperabilidad entre proveedores de embeddings: facilita la comparación o combinación de resultados de búsqueda entre sistemas que usan distintos modelos de embeddings.
- Evaluación de calidad de traducción: el adaptador puede usarse para medir la similitud entre espacios de representación y decidir si la migración es viable según el umbral de similitud coseno requerido.
- Prototipado rápido: en entornos de desarrollo, permite probar un índice basado en `pplx-embed-1` sin esperar a re-embedding completo, usando el adaptador como puente temporal.
- Sistemas de recomendación híbridos: si parte del catálogo está embebido con `ada-002` y otra parte con `pplx-embed-1`, el adaptador unifica los espacios para permitir búsquedas cruzadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la similitud coseno en test entre los embeddings traducidos y los reales de `pplx-embed-1`, con un valor de **0,7665** (epoch 15). Esta métrica indica la fidelidad de la proyección, pero no es comparable con benchmarks de modelos generativos.

## Requisitos de hardware

- El modelo es extremadamente ligero: ~1,6 millones de parámetros en float32 ocupan aproximadamente 6,4 MB, por lo que cabe en cualquier sistema, incluso en dispositivos embebidos.
- Se ejecuta en CPU sin necesidad de GPU. ONNX Runtime con `CPUExecutionProvider` es suficiente.
- No requiere VRAM dedicada; la inferencia se realiza en memoria principal.
- Latencia despreciable: una proyección lineal de 1536 a 1024 dimensiones se completa en microsegundos por vector.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), o integración en servicios de inferencia como Triton, aunque por su simplicidad puede ejecutarse directamente en el pipeline de búsqueda.

## Comparativa con modelos similares

Existen otros adaptadores de la misma familia Queryn, como `queryn-adapter-ada-002_to_qwen3-emb-8b`, que traduce embeddings de `ada-002` al espacio de `qwen3-emb-8b`. Sin embargo, no se dispone de datos comparativos de rendimiento entre ellos en la información proporcionada. La colección completa de adaptadores está disponible en [Queryn Embedding Adapters](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4). No se han encontrado adaptadores equivalentes de otros proveedores con especificaciones públicas comparables.

## Limitaciones y advertencias

- La similitud coseno de 0,7665 indica que la traducción no es perfecta; puede haber pérdida de precisión en tareas de búsqueda que requieran alta fidelidad.
- El modelo se entrenó en un corpus específico (arXiv, jurisprudencia australiana, SQuAD, PubMed, noticias de cripto/mercados). Su rendimiento en dominios muy diferentes podría degradarse.
- No se especifican los idiomas soportados; el corpus es predominantemente inglés, por lo que su uso con otros idiomas no está validado.
- Es un adaptador lineal, por lo que no captura relaciones no lineales complejas entre los dos espacios de embeddings; la arquitectura `deep` obtuvo peor resultado, pero aún así la proyección es una aproximación.
- No es un modelo de generación de texto ni de razonamiento; no debe usarse para tareas que requieran comprensión semántica directa.
- La licencia MIT permite uso comercial, pero el modelo depende de los modelos de origen y destino (`ada-002` y `pplx-embed-1`), cuyas licencias y términos de uso deben revisarse por separado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-ada-002_to_pplx-embed-1)
- [Colección de adaptadores Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Documentación de adaptadores en GitHub (Queryn)](https://github.com/Gigadelux/Queryn/blob/main/docs/Adapters.md)
- [Anuncio de OpenAI sobre text-embedding-ada-002](https://openai.com/index/new-and-improved-embedding-model/)
- [Documentación de text-embedding-ada-002 en OpenAI](https://developers.openai.com/api/docs/models/text-embedding-ada-002)
