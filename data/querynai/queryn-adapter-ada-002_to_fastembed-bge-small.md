# QuerynAi/queryn-adapter-ada-002_to_fastembed-bge-small

## Resumen

El modelo `queryn-adapter-ada-002_to_fastembed-bge-small` es un adaptador de embeddings desarrollado por QuerynAi que traduce vectores generados por el modelo `text-embedding-ada-002` de OpenAI (1536 dimensiones) al espacio de representación de `fastembed-bge-small` (384 dimensiones). Su propósito es permitir que un corpus ya indexado con `ada-002` pueda servirse contra un índice construido con `fastembed-bge-small` sin necesidad de re-embedir el contenido original, lo que ahorra costes de cómputo y tiempo en migraciones de infraestructura de búsqueda semántica.

El adaptador es una proyección lineal simple (arquitectura `linear`) con aproximadamente 590.2K parámetros, exportado a formato ONNX (opset 17). Se entrenó sobre pares de embeddings generados a partir de un corpus multi-dominio de unas 350K filas que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados. La mejor similitud coseno en test alcanza 0.9039, lo que indica una buena fidelidad en la traducción entre espacios. El modelo se distribuye bajo licencia MIT y está pensado para su uso con ONNX Runtime, tanto en CPU como en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) sobre embeddings de entrada |
| Parametros totales | ~590.2K |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (opera sobre vectores de 1536 dimensiones, no sobre texto) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponible (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo es una proyección lineal que mapea un vector de 1536 dimensiones (embedding de `ada-002`) a uno de 384 dimensiones (espacio de `fastembed-bge-small`). El grafo ONNX normaliza internamente el vector de entrada con L2-normalización, por lo que no se requiere pre-normalización por parte del usuario. La salida también se normaliza a norma unitaria. La dimensión del batch es dinámica, lo que permite procesar lotes de cualquier tamaño.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multi-dominio (~350K filas) que abarca ciencia (arXiv, PubMed), derecho (jurisprudencia australiana), preguntas y respuestas (SQuAD) y finanzas (noticias de cripto/mercados). La función de pérdida fue `1 - mean cosine similarity`, con optimizador Adam y reducción de learning rate por meseta (`ReduceLROnPlateau`). Se guardó el checkpoint de la mejor época. Se compararon dos arquitecturas: una lineal y una MLP profunda; para este par concreto, la lineal obtuvo mejor similitud coseno en test (0.9039 frente a 0.8973 de la profunda), por lo que se publicó la lineal.

## Capacidades

- Traducción de embeddings: convierte vectores de 1536 dimensiones (espacio `ada-002`) a vectores de 384 dimensiones (espacio `fastembed-bge-small`).
- Normalización automática: tanto la entrada como la salida se normalizan internamente, garantizando vectores unitarios en el espacio destino.
- Procesamiento por lotes: la dimensión batch es dinámica, admite cualquier tamaño de lote.
- Inferencia ligera: al ser una proyección lineal, el coste computacional es mínimo y puede ejecutarse en CPU sin problemas.
- Compatibilidad con ONNX Runtime: se puede integrar en pipelines existentes que ya usen ONNX para embeddings.
- No requiere re-embedir el corpus original: permite reutilizar índices ya construidos con `ada-002` sobre un motor que use `fastembed-bge-small`.

## Casos de uso

- Migración de infraestructura de búsqueda semántica: si una empresa tiene un índice vectorial construido con `ada-002` y quiere cambiar a un modelo más ligero como `fastembed-bge-small` (por coste o latencia), este adaptador transforma los embeddings existentes sin necesidad de reprocesar todo el corpus.
- Ahorro de costes en re-indexado: en lugar de pagar por re-embedir millones de documentos con un modelo nuevo, se aplica una proyección local de bajo coste.
- Integración en pipelines de RAG: sistemas de generación aumentada por recuperación que usan `ada-002` para indexar documentos pueden adaptar sus vectores a un espacio compatible con `fastembed-bge-small` para usar motores de búsqueda optimizados para ese modelo.
- Evaluación comparativa de espacios de embedding: permite medir la similitud entre representaciones de distintos modelos sin tener que re-embedir los mismos textos.
- Entornos con restricciones de privacidad: al ejecutarse localmente con ONNX Runtime, no es necesario enviar los embeddings a un servicio externo, lo que facilita el cumplimiento de normativas de protección de datos.
- Prototipado rápido: para equipos que quieren probar `fastembed-bge-small` sin descartar su infraestructura existente basada en `ada-002`, el adaptador ofrece una transición gradual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de traducción de embeddings y no de un modelo de lenguaje generativo. El único dato de rendimiento reportado es la similitud coseno en el conjunto de test:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test (época 15) | 0.9039 |
| Similitud coseno con arquitectura profunda (ablation) | 0.8973 |

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~590K parámetros en formato ONNX float32, el peso del modelo es de aproximadamente 2.4 MB. La inferencia puede ejecutarse en CPU sin necesidad de GPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. Si se usa GPU, cualquier modelo con al menos 1 GB de VRAM es más que suficiente.
- Compatibilidad con hardware de consumo: sí, funciona en cualquier ordenador personal, incluso en dispositivos embebidos o servidores sin aceleración.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), también puede integrarse en servicios como FastAPI, o en motores de búsqueda vectorial que acepten transformaciones personalizadas.
- Latencia y throughput: al ser una proyección lineal, la latencia es del orden de microsegundos por vector. En CPU, se pueden procesar miles de vectores por segundo. No se han publicado cifras exactas.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la misma categoría (adaptadores de embeddings entre espacios de modelos distintos). La propia colección de QuerynAi incluye adaptadores hacia otros destinos (por ejemplo, `qwen3-emb-8b`), pero no hay métricas públicas que permitan una comparación cuantitativa. Se puede mencionar que la alternativa a este adaptador sería re-embedir el corpus con el modelo destino, lo que implica un coste de API o de cómputo mucho mayor.

| Modelo | Parametros | Dimensiones salida | Similitud coseno test | Licencia |
|---|---|---|---|---|
| `queryn-adapter-ada-002_to_fastembed-bge-small` | ~590K | 384 | 0.9039 | MIT |
| Re-embedir con `fastembed-bge-small` | no aplica | 384 | 1.0 (ideal) | Apache 2.0 (modelo base) |

## Limitaciones y advertencias

- La calidad de la traducción depende de la similitud entre los espacios de origen y destino; una similitud coseno de 0.9039 indica que hay una pérdida de información no despreciable, por lo que las búsquedas pueden no ser exactamente equivalentes a las del espacio original.
- El adaptador se entrenó con un corpus específico (ciencia, derecho, QA, medicina, finanzas). Su rendimiento en dominios muy diferentes (por ejemplo, contenido multimedia, código fuente, conversaciones informales) puede degradarse.
- No se proporcionan datos sobre sesgos o alucinaciones, ya que no es un modelo generativo; sin embargo, los embeddings de origen pueden arrastrar sesgos del modelo `ada-002`.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo de origen (`ada-002`) es propiedad de OpenAI y su uso está sujeto a los términos de servicio de OpenAI. El adaptador no elimina esa dependencia si se generan nuevos embeddings con `ada-002`.
- El modelo solo acepta vectores de 1536 dimensiones como entrada; no procesa texto directamente. Es necesario tener un pipeline previo que genere los embeddings con `ada-002`.
- No se garantiza la compatibilidad con versiones futuras de `fastembed-bge-small` si el modelo destino cambia su espacio de representación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuerynAi/queryn-adapter-ada-002_to_fastembed-bge-small)
- [Colección de adaptadores de QuerynAi](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Documentación de text-embedding-ada-002 de OpenAI](https://developers.openai.com/api/docs/models/text-embedding-ada-002)
- [Anuncio de nuevos modelos de embedding de OpenAI](https://openai.com/index/new-embedding-models-and-api-updates/)
