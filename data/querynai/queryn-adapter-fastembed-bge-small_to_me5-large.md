# QuerynAi/queryn-adapter-fastembed-bge-small_to_me5-large

## Resumen

El modelo `queryn-adapter-fastembed-bge-small_to_me5-large` es un adaptador de embeddings desarrollado por QuerynAi que traduce vectores generados por el modelo `fastembed-bge-small` (384 dimensiones) al espacio de representación de `me5-large` (1024 dimensiones). Su propósito es permitir que un corpus ya embebido con `fastembed-bge-small` pueda servirse contra un índice construido con `me5-large` sin necesidad de re-embebir todos los documentos, lo que ahorra tiempo y coste computacional en migraciones de infraestructura de búsqueda vectorial.

Se trata de una proyección lineal simple (capa fully connected sin activación) que mapea los 384 valores de entrada a 1024 de salida, con normalización L2 interna. El modelo tiene aproximadamente 394.2 mil parámetros y se distribuye en formato ONNX (opset 17), con licencia MIT. No es un modelo de lenguaje ni de generación, sino un componente de transformación de vectores dentro del motor de traducción de embeddings de Queryn.

La relevancia actual radica en la creciente adopción de modelos de embeddings de diferentes tamaños y dimensiones; este adaptador facilita la interoperabilidad entre sistemas que usan distintos modelos sin reprocesar grandes volúmenes de datos. Aunque el modelo no tiene descargas ni valoraciones en HuggingFace, su diseño es técnicamente sólido y está documentado con métricas de similitud coseno en test.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (capa fully connected sin activación) |
| Parametros totales | ~394.2K |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de proyección de vectores, no procesa texto) |
| Tipos de cuantizacion | No disponible (formato ONNX float32) |
| Idiomas soportados | No disponible (el corpus de entrenamiento incluye inglés, pero no se especifica cobertura multilingüe) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador consiste en una única capa lineal que transforma un vector de entrada de 384 dimensiones (embeddings de `fastembed-bge-small`) en uno de 1024 dimensiones (espacio de `me5-large`). La gráfica normaliza L2 tanto la entrada como la salida, de modo que el vector resultante es unitario. El entrenamiento se realizó sobre pares de embeddings generados por ambos modelos a partir de un corpus multi-dominio de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - similitud coseno media`, optimizada con Adam y reducción de tasa de aprendizaje por meseta (ReduceLROnPlateau). Se comparó una arquitectura lineal con una MLP profunda; la lineal obtuvo una similitud coseno en test de 0.9201 (época 15), frente a 0.9199 de la profunda, por lo que se publicó la versión lineal. El checkpoint se convirtió a ONNX con torch 2.13.0.

## Capacidades

- Traducción de embeddings entre dos espacios vectoriales concretos: de `fastembed-bge-small` (384-d) a `me5-large` (1024-d).
- Normalización L2 automática de la entrada y salida, lo que garantiza vectores unitarios sin requerir pre-procesamiento.
- Soporte de batch dinámico: la dimensión del lote es variable, permitiendo procesar múltiples vectores a la vez.
- Inferencia eficiente en CPU gracias a su pequeño tamaño (~394K parámetros) y formato ONNX.
- Integración sencilla con `onnxruntime` y `huggingface_hub` para descarga y ejecución.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un transformador de representaciones vectoriales.

## Casos de uso

- Migración de índices vectoriales sin re-embebido: si una empresa tiene millones de documentos embebidos con `fastembed-bge-small` y quiere cambiar a `me5-large` para mejorar la calidad de búsqueda, puede aplicar este adaptador a los vectores existentes y reconstruir el índice sin reprocesar el corpus original.
- Unificación de espacios de embeddings en pipelines RAG: en sistemas que combinan múltiples fuentes de datos con distintos modelos de embeddings, este adaptador permite alinear todos los vectores a un espacio común (el de `me5-large`) para realizar búsquedas híbridas o fusionar resultados.
- Ahorro de costes en actualización de modelos: en lugar de re-embebir grandes volúmenes de datos (coste de GPU y tiempo), se aplica una proyección lineal de bajo coste computacional.
- Compatibilidad entre herramientas de vectorización: si un equipo usa `fastembed` (librería de Qdrant) y otro usa `me5-large`, el adaptador permite que ambos compartan índices sin duplicar almacenamiento.
- Evaluación comparativa de modelos: al traducir embeddings de un modelo a otro, se pueden comparar métricas de recuperación (recall, precisión) sobre el mismo corpus sin re-embebido.
- Despliegue en entornos con recursos limitados: al ser un modelo ONNX de ~394K parámetros, puede ejecutarse en CPU en servidores sin GPU, facilitando su integración en servicios de búsqueda existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que este modelo no es un LLM sino un adaptador de embeddings. La única métrica reportada es la similitud coseno media en el conjunto de test, que alcanzó **0.9201** con la arquitectura lineal (época 15). No hay comparaciones con otros adaptadores o modelos de traducción de embeddings en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB (el modelo tiene ~394K parámetros en float32, aproximadamente 1.6 MB de pesos). Puede ejecutarse en cualquier GPU, aunque no es necesario.
- GPU recomendadas: no se requiere GPU; funciona correctamente en CPU con `onnxruntime`.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna (incluso integradas) puede ejecutarlo sin problemas.
- Opciones de despliegue: `onnxruntime` (CPU o CUDA), integrable en servicios Python, contenedores Docker o pipelines de búsqueda vectorial.
- Latencia y throughput: no se proporcionan datos oficiales, pero al ser una única capa lineal, la inferencia es del orden de microsegundos por vector en CPU moderna.

## Comparativa con modelos similares

No disponible. No se han encontrado adaptadores de embeddings comparables en la información proporcionada. La colección de QuerynAi incluye otros adaptadores entre distintos pares de modelos (por ejemplo, `bge-m3` a `fastembed-bge-small`), pero no se dispone de métricas comparativas entre ellos. Este adaptador es específico para el par `fastembed-bge-small` → `me5-large`.

## Limitaciones y advertencias

- Es un adaptador específico para un par de modelos concreto; no es generalizable a otros espacios de embeddings.
- La similitud coseno máxima alcanzada es 0.9201, lo que implica una pérdida de información no despreciable; los vectores traducidos no son idénticos a los que generaría `me5-large` directamente.
- El corpus de entrenamiento está limitado a dominios concretos (ciencia, legal, QA, medicina, finanzas); el rendimiento en otros dominios puede ser inferior.
- No se especifican los idiomas cubiertos; aunque el corpus es mayoritariamente inglés, no hay garantía de buen comportamiento en otros idiomas.
- Al ser un modelo de proyección, no corrige errores de embeddings de origen; si `fastembed-bge-small` produce vectores de baja calidad, la traducción los mantendrá.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los modelos de origen y destino (fastembed-bge-small y me5-large) tengan licencias compatibles con su caso de uso.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuerynAi/queryn-adapter-fastembed-bge-small_to_me5-large)
- [Colección de adaptadores de QuerynAi](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Repositorio de fastembed (Qdrant)](https://github.com/qdrant/fastembed)
- [Documentación de BGE](https://bge-model.com/)
