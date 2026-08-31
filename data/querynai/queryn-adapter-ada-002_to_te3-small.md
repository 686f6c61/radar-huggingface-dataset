# QuerynAi/queryn-adapter-ada-002_to_te3-small

## Resumen

Queryn adapter — `ada-002` → `te3-small` es un adaptador de embeddings desarrollado por QuerynAi que traduce vectores generados por el modelo de embeddings `ada-002` (1536 dimensiones) al espacio vectorial de `te3-small` (también 1536 dimensiones). El objetivo es permitir que un corpus ya indexado con `ada-002` pueda servirse contra un índice construido con `te3-small` sin necesidad de re-embedding, lo que ahorra costes de cómputo y tiempo en migraciones de infraestructura de búsqueda semántica.

El modelo es una proyección lineal simple de aproximadamente 2,4 millones de parámetros, exportada a formato ONNX (opset 17). Forma parte del motor de traducción de embeddings de Queryn, que publica un conjunto completo de adaptadores entre pares de modelos. Su relevancia actual radica en la creciente necesidad de migrar entre modelos de embeddings sin reconstruir índices completos, especialmente en entornos de producción con grandes volúmenes de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear projection) |
| Parámetros totales | ~2,4M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible (exportado en float32 ONNX) |
| Idiomas soportados | No disponible (depende de los modelos fuente y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una proyección lineal que mapea un vector de entrada de 1536 dimensiones (embedding de `ada-002`) a un vector de salida de 1536 dimensiones en el espacio de `te3-small`. El grafo ONNX normaliza internamente el vector de entrada con L2-normalización, por lo que no se requiere pre-normalización, y produce un vector de salida unit-normalizado. Se evaluó también una arquitectura profunda (MLP) como alternativa, pero la lineal obtuvo mejor rendimiento (similitud coseno en test de 0,8718 frente a 0,8648) y fue la publicada.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multi-dominio unificado de aproximadamente 350 000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y programación de tasa de aprendizaje con `ReduceLROnPlateau`, guardando el checkpoint de la mejor época. El proceso de entrenamiento es reanudable, según la documentación del repositorio GitHub de Queryn.

## Capacidades

- Traducción de embeddings: convierte vectores de `ada-002` (1536-d) al espacio de `te3-small` (1536-d) manteniendo la semántica.
- Normalización integrada: el grafo L2-normaliza la entrada y produce salida unit-normalizada, simplificando el contrato de uso.
- Dimensión de lote dinámica: acepta lotes de tamaño variable en el eje de batch.
- Inferencia ligera: al ser una proyección lineal de ~2,4M de parámetros, puede ejecutarse en CPU con latencia mínima.
- No es un modelo generativo: no genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; dependen de los modelos de embeddings fuente y destino, no del adaptador.

## Casos de uso

- Migración de índices de búsqueda semántica: un corpus ya embebido con `ada-002` puede servirse contra un índice `te3-small` aplicando el adaptador a los vectores almacenados, sin re-embedding del corpus completo. Esto reduce costes de cómputo y tiempo de migración en producción.
- Actualización incremental de infraestructura: al incorporar `te3-small` como modelo de embeddings, los documentos nuevos se embeden directamente con `te3-small` mientras los históricos se traducen con el adaptador, permitiendo una transición gradual sin interrupción del servicio.
- Evaluación comparativa de modelos de embeddings: permite comparar la calidad de recuperación de `ada-002` y `te3-small` sobre el mismo corpus sin duplicar el almacenamiento de vectores.
- Ahorro de costes en pipelines de RAG: si `te3-small` ofrece menor latencia o coste de inferencia que `ada-002`, el adaptador permite beneficiarse de ello sin reconstruir la base vectorial.
- Normalización de embeddings heterogéneos: en sistemas que acumulan vectores de múltiples fuentes, el adaptador unifica el espacio vectorial para permitir búsquedas consistentes.
- Pruebas de concepto y prototipado: equipos que evalúan cambiar de proveedor de embeddings pueden validar la viabilidad con un corpus de prueba antes de comprometer recursos a una migración completa.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Mejor similitud coseno en test | 0,8718 (época 15) |
| Ablación de arquitectura — lineal | 0,8718 (guardada) |
| Ablación de arquitectura — profunda (MLP) | 0,8648 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible, dado que este modelo no es un LLM sino un adaptador de embeddings. La métrica relevante es la similitud coseno entre el embedding traducido y el embedding de referencia en el espacio destino.

## Requisitos de hardware

- VRAM estimada: negligible; el modelo tiene ~2,4M de parámetros en float32 (~9,6 MB), cabe holgadamente en cualquier GPU, incluso integradas.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU con ONNX Runtime.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con soporte ONNX Runtime (RTX serie 20 en adelante) funcionará, aunque no es necesario.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios de inferencia como FastAPI, o en pipelines de búsqueda vectorial (FAISS, Milvus, Qdrant) como paso de preprocesado.
- Latencia y throughput: no disponibles; al ser una proyección lineal, la latencia esperada es del orden de microsegundos por vector en CPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Similitud coseno test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `queryn-adapter-ada-002_to_te3-small` | Proyección lineal | ~2,4M | 0,8718 | MIT | HuggingFace |
| `queryn-adapter-ada-002_to_qwen3-emb-8b` | Proyección lineal (presumible) | No disponible | No disponible | MIT (presumible) | HuggingFace |
| Otros adaptadores de la colección Queryn | Lineal o MLP según par | No disponible | No disponible | MIT | HuggingFace |

No se dispone de modelos comparables fuera de la familia Queryn que realicen traducción entre espacios de embeddings específicos. La colección completa de adaptadores está disponible en HuggingFace bajo el perfil QuerynAi.

## Limitaciones y advertencias

- Alcance restringido: el adaptador solo traduce de `ada-002` a `te3-small`; no es un modelo de embeddings independiente ni sirve para otros pares de modelos.
- Calidad de traducción limitada: la similitud coseno máxima en test es 0,8718, lo que implica una pérdida de fidelidad semántica. Para casos de uso donde la precisión de recuperación es crítica, se recomienda validar el impacto en la calidad de búsqueda antes de desplegar en producción.
- Dependencia de los modelos fuente y destino: el rendimiento del adaptador depende de la calidad de los embeddings de `ada-002` y `te3-small`; si estos modelos cambian o se retiran, el adaptador puede quedar obsoleto.
- Sin datos de idiomas: no se especifican los idiomas soportados; el corpus de entrenamiento incluye dominios en inglés (arXiv, SQuAD, PubMed, noticias), por lo que el rendimiento en otros idiomas no está garantizado.
- Sin soporte para otros formatos: el modelo se distribuye únicamente en ONNX; no hay versiones en safetensors, GGUF u otros formatos.
- Sin mantenimiento documentado: el repositorio tiene 0 descargas y 0 likes, y no se indica un plan de mantenimiento o soporte.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable de cumplir con las licencias de los modelos fuente y destino (`ada-002` y `te3-small`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QuerynAi/queryn-adapter-ada-002_to_te3-small
- Colección de adaptadores Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio GitHub de Queryn (documentación de adaptadores): https://github.com/Gigadelux/Queryn/blob/main/docs/Adapters.md
- Modelo relacionado (ada-002 → qwen3-emb-8b): https://huggingface.co/QuerynAi/queryn-adapter-ada-002_to_qwen3-emb-8b
