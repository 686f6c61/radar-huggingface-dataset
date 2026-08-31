# QuerynAi/queryn-adapter-bge-m3_to_nemotron-1b-free

## Resumen

Queryn adapter — `bge-m3` → `nemotron-1b-free` es un adaptador de traducción de embeddings desarrollado por QuerynAi. Su función es transformar un vector de embedding generado por el modelo `bge-m3` (1024 dimensiones) en el espacio de embeddings de `nemotron-1b-free` (2048 dimensiones). Esto permite que un corpus ya indexado con `bge-m3` pueda ser servido contra un índice construido con `nemotron-1b-free` sin necesidad de re-embedding, lo que supone un ahorro significativo de tiempo y recursos en pipelines de recuperación aumentada por generación (RAG).

El modelo es un perceptrón multicapa (MLP) con una capa oculta, activación GELU y un espacio latente comprimido, con aproximadamente 1,6 millones de parámetros. Se distribuye en formato ONNX (opset 17) y forma parte del motor de traducción de embeddings de Queryn. Su relevancia radica en la interoperabilidad entre sistemas de embeddings heterogéneos, un problema común en entornos de producción donde distintos componentes utilizan modelos de vectorización diferentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP profundo (1 capa oculta, GELU, latente comprimido) |
| Parametros totales | ~1,6 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es un MLP con una única capa oculta y activación GELU, diseñado para mapear un vector de 1024 dimensiones (salida de `bge-m3`) a uno de 2048 dimensiones (espacio de `nemotron-1b-free`). El grafo ONNX normaliza L2 la entrada internamente, por lo que no se requiere pre-normalización. La salida se entrega unit-normalizada.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multi-dominio unificado que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados, con aproximadamente 350 000 filas. La función de pérdida fue `1 - similitud coseno media`, optimizada con Adam y reducción de tasa de aprendizaje por meseta (ReduceLROnPlateau). Se evaluaron dos arquitecturas (lineal y profunda) para cada par de modelos; la que obtenía mayor similitud coseno en test era la publicada. En este caso, la arquitectura profunda alcanzó una similitud coseno de 0,6353 en la época 15, frente a 0,6328 de la lineal.

## Capacidades

- Traducción de embeddings entre espacios vectoriales de distintos modelos (de `bge-m3` a `nemotron-1b-free`).
- Normalización L2 automática de la entrada y salida unit-normalizada.
- Soporte de batch dinámico en el eje de lote.
- Ejecución en CPU mediante ONNX Runtime.
- No es un modelo generativo ni de lenguaje; únicamente transforma vectores.

## Casos de uso

- Migración de índices de búsqueda: si una organización tiene un corpus embebido con `bge-m3` y desea cambiar a un índice basado en `nemotron-1b-free`, puede aplicar este adaptador a los embeddings existentes sin reprocesar el corpus completo.
- Interoperabilidad entre sistemas: en arquitecturas donde diferentes servicios usan distintos modelos de embedding, el adaptador permite unificar el espacio vectorial sin modificar los componentes aguas arriba.
- Ahorro de costes en pipelines RAG: evita el re-embedding de grandes volúmenes de datos, reduciendo tiempo de cómputo y consumo de GPU/CPU.
- Prototipado rápido: permite probar un nuevo modelo de embedding (nemotron-1b-free) sobre datos ya indexados con bge-m3 antes de decidir una migración completa.
- Integración en sistemas de recuperación híbrida: al traducir embeddings densos, puede combinarse con búsqueda por palabras clave o sparse sin reentrenar los índices.
- Evaluación comparativa de modelos: facilita la comparación de calidad de recuperación entre `bge-m3` y `nemotron-1b-free` sobre el mismo corpus, usando el adaptador como puente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la similitud coseno media en el conjunto de test, que alcanzó un valor de **0,6353** con la arquitectura profunda. No se proporcionan comparaciones con otros adaptadores ni con modelos de referencia.

## Requisitos de hardware

- Al ser un modelo ONNX de aproximadamente 1,6 millones de parámetros, su huella de memoria es mínima (del orden de unos pocos megabytes).
- Puede ejecutarse en CPU sin problemas; no requiere GPU para inferencia.
- No se dispone de datos de latencia o throughput específicos, pero al tratarse de una única pasada por un MLP pequeño, la latencia esperada es de microsegundos a milisegundos por lote.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), o cualquier framework que soporte ONNX (por ejemplo, Hugging Face Optimum, TensorRT, etc.).

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables de otros proveedores. QuerynAi publica una colección de adaptadores similares (por ejemplo, `bge-m3` a `me5-large`), pero no se han encontrado datos de rendimiento comparativo entre ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La similitud coseno máxima alcanzada (0,6353) indica una pérdida de fidelidad en la traducción; los embeddings resultantes no son idénticos a los que generaría `nemotron-1b-free` directamente, lo que puede afectar a la calidad de la recuperación.
- El adaptador depende de la calidad de los embeddings de origen; si `bge-m3` produce vectores de baja calidad para un dominio específico, la traducción heredará esas limitaciones.
- No es un modelo de lenguaje ni de generación; solo transforma vectores, por lo que no puede utilizarse para tareas de texto.
- El entrenamiento se realizó sobre dominios concretos (ciencia, legal, QA, medicina, finanzas); su rendimiento en otros dominios puede ser inferior.
- Aunque la licencia MIT permite uso comercial, el modelo se ofrece sin garantías explícitas de precisión o idoneidad para casos de producción.
- No se especifican idiomas soportados; la capacidad multilingüe depende de los modelos origen y destino, no del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-bge-m3_to_nemotron-1b-free
- Colección de adaptadores de Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Modelo `bge-m3` (BAAI): https://huggingface.co/BAAI/bge-m3
- Documentación de BGE-M3: https://bge-model.com/bge/bge_m3.html
