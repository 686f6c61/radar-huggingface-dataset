# QuerynAi/queryn-adapter-bge-m3_to_te3-small

## Resumen

El modelo `queryn-adapter-bge-m3_to_te3-small` es un adaptador de embeddings desarrollado por QuerynAi que traduce vectores generados por el modelo `bge-m3` (1024 dimensiones) al espacio vectorial de `te3-small` (1536 dimensiones). Su propósito es permitir que un corpus ya embebido con `bge-m3` pueda servirse contra un índice construido con `te3-small` sin necesidad de re-embedding, lo que supone un ahorro computacional significativo en migraciones o interoperabilidad entre sistemas de búsqueda vectorial.

Se trata de un pequeño perceptrón multicapa (MLP) con una capa oculta y activación GELU, que comprime el vector de entrada a un latente intermedio antes de expandirlo a la dimensión objetivo. El modelo se distribuye en formato ONNX (opset 17) y contiene aproximadamente 1,3 millones de parámetros. Forma parte de la colección "Queryn Embedding Adapters", un conjunto de adaptadores que traducen embeddings entre distintos modelos sin reprocesar los datos originales.

La relevancia de este adaptador radica en la creciente adopción de modelos de embeddings especializados y la necesidad de migrar infraestructuras existentes sin incurrir en costes de recomputación masiva. Al ser un modelo ligero y de licencia MIT, puede integrarse fácilmente en pipelines de producción con ONNX Runtime.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con 1 capa oculta (GELU) y latente comprimido |
| Parametros totales | ~1,3 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (adaptador de embeddings, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publica el modelo en float32 ONNX) |
| Idiomas soportados | no disponibles (el corpus de entrenamiento incluye dominios multilingües, pero no se especifican idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es un MLP que toma como entrada un embedding de `bge-m3` de 1024 dimensiones, lo normaliza L2 internamente, lo proyecta a una capa oculta con activación GELU y compresión latente, y finalmente lo expande a un vector de 1536 dimensiones en el espacio de `te3-small`. La salida se normaliza L2 para producir vectores unitarios. El batch es dinámico, lo que permite procesar lotes de cualquier tamaño.

El entrenamiento se realizó sobre pares de embeddings generados por `bge-m3` y `te3-small` a partir de un corpus multi-dominio de aproximadamente 350 000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de tasa de aprendizaje por meseta (ReduceLROnPlateau). Se evaluaron dos arquitecturas: una lineal y una profunda (MLP); la profunda obtuvo una mejor similitud coseno en test (0,7802 frente a 0,7686) y fue la publicada. El checkpoint se convirtió a ONNX con PyTorch 2.13.0.

## Capacidades

- Traducción de embeddings entre los espacios de `bge-m3` (1024-d) y `te3-small` (1536-d).
- Normalización L2 automática de la entrada y la salida, lo que simplifica su uso en pipelines existentes.
- Procesamiento por lotes con dimensión de batch dinámica.
- Inferencia ligera en CPU gracias a su reducido número de parámetros y formato ONNX.
- No es un modelo generativo: no genera texto, código ni respuestas; solo transforma vectores.
- No dispone de capacidades de tool calling, agentes o razonamiento multi-paso, al ser un componente de transformación puro.

## Casos de uso

- Migración de índices vectoriales: si una empresa tiene un corpus embebido con `bge-m3` y desea cambiar a `te3-small` (por ejemplo, por mejor rendimiento o menor coste de almacenamiento), puede usar este adaptador para transformar los embeddings existentes sin reprocesar el corpus completo.
- Interoperabilidad entre sistemas: permite que aplicaciones que usan `bge-m3` y otras que usan `te3-small` compartan el mismo índice, facilitando la integración de servicios heterogéneos.
- Ahorro de costes computacionales: evita la recomputación de embeddings sobre grandes volúmenes de datos, reduciendo tiempo y consumo de GPU/CPU.
- Actualización incremental de índices: si se añaden nuevos documentos, se pueden generar sus embeddings con `bge-m3` y traducirlos al espacio de `te3-small` para mantener la coherencia del índice.
- Pruebas A/B de modelos de embeddings: permite comparar el rendimiento de `bge-m3` y `te3-small` sobre el mismo corpus sin duplicar el almacenamiento.
- Pipelines de búsqueda híbrida: en sistemas que combinan recuperación densa y escasa, el adaptador facilita la unificación de espacios vectoriales para la fusión de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador, ya que no es un modelo de lenguaje. La única métrica reportada es la similitud coseno media en el conjunto de test durante el entrenamiento: **0,7802** (época 15), frente a 0,7686 para la variante lineal. No hay datos comparativos con otros adaptadores o modelos de traducción de embeddings.

## Requisitos de hardware

- Al ser un modelo ONNX de ~1,3 millones de parámetros, la inferencia es viable en CPU sin necesidad de GPU.
- VRAM estimada: no aplica (no requiere GPU; en caso de usarse, el consumo es mínimo, inferior a 100 MB).
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente.
- Compatible con consumer GPU (p. ej., RTX 3060 o superior) si se desea acelerar, pero no es imprescindible.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios como FastAPI, o usarse con herramientas que soporten ONNX.
- Latencia y throughput: no disponibles; al ser un MLP pequeño, se espera una latencia de microsegundos por vector en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros de la misma categoría. Existe un adaptador hermano en la misma colección (`queryn-adapter-bge-m3_to_fastembed-bge-small`), pero no se han publicado métricas comparativas entre ambos. La documentación de BGE-M3 y te3-small no incluye referencias a adaptadores de traducción. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador solo funciona en una dirección: de `bge-m3` a `te3-small`. No traduce en sentido inverso.
- La similitud coseno máxima obtenida (0,78) indica que la traducción no es perfecta; puede haber pérdida de información semántica en el proceso.
- No es un modelo de lenguaje: no genera texto ni responde consultas; su uso se limita a la transformación de vectores.
- El corpus de entrenamiento incluye dominios específicos (ciencia, derecho, medicina, finanzas), por lo que el rendimiento en otros dominios podría ser inferior.
- No se han documentado sesgos específicos, pero al ser un adaptador entrenado sobre datos de dominios concretos, podría heredar sesgos presentes en esos corpus.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se ofrece sin garantías.
- El repositorio en HuggingFace muestra 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco utilizado; se recomienda validar su comportamiento en el caso de uso concreto antes de desplegarlo en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuerynAi/queryn-adapter-bge-m3_to_te3-small)
- [Colección Queryn Embedding Adapters](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Documentación de BGE-M3](https://bge-model.com/bge/bge_m3.html)
- [Página de BAAI/bge-m3 en HuggingFace](https://huggingface.co/BAAI/bge-m3)
- [Documentación de Queryn en GitHub](https://github.com/Gigadelux/Queryn/blob/main/docs/Adapters.md)
