# QuerynAi/queryn-adapter-bge-m3_to_me5-large

## Resumen

Queryn adapter — `bge-m3` → `me5-large` es un adaptador de traducción de embeddings desarrollado por QuerynAi. Su función es transformar un embedding generado por el modelo `bge-m3` de BAAI (1024 dimensiones) al espacio de representación de `me5-large` (también 1024 dimensiones), de modo que un corpus ya indexado con `bge-m3` pueda servirse contra un índice de `me5-large` sin necesidad de re-embedding. Forma parte del motor de traducción de embeddings de Queryn.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 1,0 millón de parámetros, exportada a formato ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus multilingüe y multi-dominio de unas 350 000 filas, y alcanza una similitud coseno de 0,9459 en el mejor checkpoint de test. Su relevancia radica en que permite migrar o interoperar entre dos modelos de embeddings sin reprocesar el corpus completo, un ahorro computacional y económico considerable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear projection) |
| Parametros totales | ~1,0M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (operación vectorial, no textual) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponible (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una proyección lineal que mapea un vector de 1024 dimensiones (embedding de `bge-m3`) a otro vector de 1024 dimensiones en el espacio de `me5-large`. El grafo ONNX normaliza internamente por norma L2 tanto la entrada como la salida, de modo que no se requiere pre-normalización. El batch axis es dinámico, lo que permite procesar lotes de cualquier tamaño.

El entrenamiento se realizó sobre pares de embeddings de un corpus unificado multi-dominio que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados (~350 000 filas). La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de learning rate mediante `ReduceLROnPlateau`, guardando el mejor checkpoint por época. Se comparó una arquitectura lineal con una MLP profunda para cada par de modelos; la que obtuvo mejor puntuación en test es la que se publica (en este caso, la lineal con 0,9459 frente a 0,9452 de la profunda).

## Capacidades

- Traducción de embeddings: transforma vectores de `bge-m3` (1024-d) al espacio de `me5-large` (1024-d) manteniendo la similitud coseno.
- Normalización automática: el grafo L2-normaliza entrada y salida, garantizando vectores unitarios en el espacio destino.
- Compatibilidad ONNX: se puede ejecutar con `onnxruntime` en CPU o GPU sin dependencias de frameworks de entrenamiento.
- Batch dinámico: acepta lotes de cualquier tamaño en el eje de batch.
- Interoperabilidad entre modelos: permite servir un corpus indexado con `bge-m3` contra un índice de `me5-large` sin re-embedding.
- Integración en pipelines de retrieval: se puede insertar como paso intermedio entre un encoder y un índice vectorial.

## Casos de uso

- Migración de infraestructura de búsqueda: si una organización tiene un corpus de millones de documentos ya embebidos con `bge-m3` y quiere cambiar a `me5-large` por razones de rendimiento o licencia, este adaptador evita reprocesar todo el corpus. Basta con aplicar la proyección a los embeddings almacenados.
- Búsqueda híbrida multi-modelo: en un sistema que combine varios modelos de embeddings para mejorar la recuperación, el adaptador permite alinear los espacios vectoriales y combinar resultados sin re-indexar.
- Ahorro de costes en cómputo: re-embedding de un corpus grande puede costar miles de horas de GPU. Con el adaptador, la transformación es una multiplicación matricial trivial que se ejecuta en CPU en minutos.
- Evaluación comparativa de modelos: permite comparar la calidad de recuperación de `bge-m3` y `me5-large` sobre el mismo índice, sin necesidad de generar dos índices separados.
- Sistemas RAG en producción: en un pipeline de retrieval-augmented generation, se puede cambiar el modelo de embeddings manteniendo el índice existente, reduciendo el tiempo de migración.
- Indexación incremental: si se añaden documentos nuevos al corpus, se pueden embeber con `bge-m3` y traducir al espacio de `me5-large` sin interrumpir el servicio.

## Benchmarks y rendimiento

El modelo card reporta una similitud coseno media en test de **0,9459** (época 15) para el par `bge-m3` → `me5-large`. El estudio de ablación de arquitectura muestra que la variante lineal (0,9459) supera ligeramente a la profunda (0,9452). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es una proyección lineal de ~1,0M de parámetros, ejecutable en cualquier CPU moderna con `onnxruntime`. El consumo de memoria es inferior a 10 MB.
- Inferencia en GPU: no es necesaria; la operación es una multiplicación de matrices que se ejecuta en microsegundos incluso en CPU.
- Compatible con cualquier hardware que soporte ONNX Runtime: desde Raspberry Pi hasta servidores de producción.
- Despliegue: se puede integrar en servicios de inferencia como Triton, o simplemente cargar el ONNX en una función serverless.
- Latencia: del orden de microsegundos por vector en CPU; throughput limitado por el ancho de banda de memoria, no por cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Similitud coseno (test) | Licencia |
|---|---|---|---|---|
| Queryn adapter `bge-m3` → `me5-large` | ~1,0M | ONNX | 0,9459 | MIT |
| Queryn adapter `bge-m3` → otros destinos (colección) | ~1,0M cada uno | ONNX | variable (0,94–0,96) | MIT |
| Re-embedding directo con `me5-large` | 560M (aprox.) | safetensors | 1,0 (oráculo) | MIT |

La alternativa principal no es otro adaptador, sino reprocesar el corpus con `me5-large` directamente. El adaptador ofrece una solución intermedia con una pérdida de fidelidad de ~0,054 en similitud coseno, a cambio de un coste computacional despreciable frente a re-embedding.

## Limitaciones y advertencias

- Pérdida de fidelidad: la traducción no es perfecta; la similitud coseno máxima alcanzada es 0,9459, lo que implica una degradación medible en la calidad de recuperación frente a usar `me5-large` directamente.
- Dependencia de los modelos origen y destino: el adaptador solo funciona con embeddings de `bge-m3` como entrada y produce vectores en el espacio de `me5-large`. No es generalizable a otros modelos.
- Sin garantías de rendimiento en dominios no vistos: el entrenamiento cubrió ciencia, legal, QA, medicina y finanzas; dominios muy diferentes (por ejemplo, código fuente o imágenes) pueden obtener resultados peores.
- Modelo en fase temprana: tiene 0 descargas y 0 likes en HuggingFace; no hay evidencia de uso en producción ni validación independiente.
- Fecha de creación futura: el modelo está fechado en 2026-08-30, lo que sugiere que es muy reciente o que la fecha es incorrecta; conviene verificar su procedencia.
- Sin soporte de cuantización: solo se distribuye en ONNX float32; no hay versiones cuantizadas para despliegue en edge.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuerynAi/queryn-adapter-bge-m3_to_me5-large)
- [Colección de adaptadores de Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Modelo origen: BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)
- [Documentación de BGE-M3](https://bge-model.com/bge/bge_m3.html)
- [API de BGE-M3 en DeepInfra](https://deepinfra.com/BAAI/bge-m3/api)
- [BGE-M3 en NVIDIA NIM](https://docs.api.nvidia.com/nim/reference/baai-bge-m3)
