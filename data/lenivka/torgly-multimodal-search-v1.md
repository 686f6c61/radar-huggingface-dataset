# Lenivka/torgly-multimodal-search-v1

## Resumen

Lenivka/torgly-multimodal-search-v1 es un modelo de recuperación multimodal (dual-encoder) desarrollado por Lenivka para el marketplace Torgly, una plataforma construida sobre .NET 10 y PostgreSQL con la extensión pgvector. No es un modelo generativo: su función es producir embeddings L2-normalizados de 384 dimensiones para texto e imágenes en un espacio semántico compartido, lo que permite búsqueda de productos por texto, por foto o por una combinación ponderada de ambas modalidades.

El modelo se distribuye como ONNX cuantizado a INT8, con un tamaño de repositorio de 0,4 GB, y está pensado para inferencia en CPU con un consumo de memoria adicional de aproximadamente 229 MB por sesión. Combina dos torres: una textual derivada de intfloat/multilingual-e5-small y una visual derivada de google/siglip2-base-patch16-224. Los embeddings usan Matryoshka, por lo que pueden truncarse a 128, 256 o 384 dimensiones según el compromiso entre precisión y coste de almacenamiento e índice.

Su relevancia práctica radica en el soporte específico para ucraniano e inglés, incluyendo tolerancia a transliteración, errores tipográficos y variantes de surzhyk, un escenario frecuente en catálogos de ecommerce de Europa del Este. La licencia Apache 2.0 y el formato ONNX facilitan su integración en servicios .NET sin dependencias de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-encoder multimodal: torre de texto derivada de intfloat/multilingual-e5-small y torre de visión derivada de google/siglip2-base-patch16-224, con embeddings en espacio compartido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (modelo distribuido ya cuantizado); se reporta paridad frente a FP32 |
| Idiomas soportados | ucraniano (uk), inglés (en), con tolerancia a transliteración y errores tipográficos |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecución con onnxruntime) |
| Dimension de embedding | 384, con truncamiento Matryoshka a [128, 256, 384] |
| Normalización | L2 en todas las salidas |
| Prefijos de texto | `"query: "` y `"passage: "` |
| Entrada visual | 224x224 RGB, normalización con mean=0.5, std=0.5 |
| Búsqueda multimodal compuesta | L2Norm(0.65 * v_image + 0.35 * v_text) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un dual-encoder que proyecta texto e imagen a un único espacio semántico de 384 dimensiones. La torre textual parte de intfloat/multilingual-e5-small, un encoder multilingüe optimizado para recuperación con prefijos de instrucción, mientras que la torre visual parte de google/siglip2-base-patch16-224, un modelo SigLIP2 con parches de 16x16 sobre entradas de 224x224 píxeles. Ambas torres se alinean para que la similitud coseno entre una consulta y un producto sea directamente interpretable como relevancia.

Los embeddings emplean representaciones Matryoshka con dimensiones anidadas de 128, 256 y 384, lo que permite truncar el vector y reducir el coste de índice en pgvector a cambio de una pérdida acotada de recall. La cuantización INT8 mantiene una paridad alta frente a FP32, con similitud coseno de 0,9952 en texto y 0,9979 en visión. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO; esa información no está disponible.

La búsqueda multimodal compuesta se resuelve mediante una combinación lineal fija de los vectores de imagen y texto, normalizada de nuevo a norma unitaria: L2Norm(0.65 * v_image + 0.35 * v_text). Esta ponderación da mayor peso a la señal visual, coherente con un caso de uso de búsqueda por foto de producto.

## Capacidades

- Recuperación de productos por consulta textual en ucraniano e inglés, con prefijos `"query: "` y `"passage: "`.
- Tolerancia a transliteración, errores tipográficos y variantes de surzhyk en las consultas.
- Búsqueda visual de productos a partir de fotos tomadas con cámara de smartphone.
- Búsqueda multimodal compuesta que combina una imagen y un texto con ponderación 0,65/0,35.
- Emisión de embeddings Matryoshka truncables a 128, 256 o 384 dimensiones.
- Inferencia en CPU con onnxruntime, sin requerir GPU.
- No dispone de generación de texto, razonamiento, código ni tool calling: es exclusivamente un modelo de representación para recuperación.
- No se documentan capacidades de agentes, audio ni modos de pensamiento.

## Casos de uso

- Búsqueda por foto en apps móviles de marketplace: el usuario fotografía un producto y el modelo genera un embedding visual de 384 dimensiones que se compara contra el catálogo indexado en pgvector. Los resultados reportados de Phone-Cam a catálogo (Recall@1 de 0,979) lo hacen adecuado para este flujo.
- Búsqueda textual tolerante a errores en ecommerce ucraniano: consultas escritas con transliteración o faltas de ortografía se resuelven con Recall@1 de 0,871 en el conjunto Surzhyk/Translit, muy por encima de BM25 (0,437) en el mismo escenario.
- Búsqueda por intención o escenario: consultas del tipo "algo para la cocina" se mapean al espacio de producto con Recall@10 de 0,684, frente a 0,325 de BM25, lo que permite recuperación semántica cuando no hay coincidencia léxica.
- Filtrado y deduplicación de catálogo: los embeddings visuales permiten agrupar imágenes de producto casi idénticas o detectar duplicados entre fichas, usando similitud coseno sobre vectores truncados a 128 dimensiones para abaratar el índice.
- Búsqueda híbrida en backend .NET: al ejecutarse con onnxruntime en CPU y un delta de RSS de 229 MB, puede desplegarse como servicio sidecar o dentro del propio proceso .NET 10, combinando recuperación vectorial en pgvector con filtros SQL tradicionales.
- Recomendación visual de productos similares: a partir del embedding de una ficha existente se recuperan vecinos cercanos en el espacio compartido, útil para secciones de "productos relacionados" sin necesidad de un motor de recomendación separado.
- Moderación y clasificación de imágenes de vendedor: la torre visual puede comparar fotos subidas por vendedores contra el catálogo de referencia para detectar productos fuera de política o imágenes no conformes.

## Benchmarks y rendimiento

Resultados de recuperación en conjuntos held-out reportados por el autor:

| Modelo / ajuste | Recall@1 | Recall@5 | Recall@10 | MRR@10 | nDCG@10 |
|---|---:|---:|---:|---:|---:|
| BM25 (UK limpio) | 0,856 | 0,953 | 0,970 | 0,898 | 0,916 |
| INT8 texto (UK limpio) | 0,915 | 0,990 | 0,996 | 0,948 | 0,960 |
| BM25 (Surzhyk/Translit) | 0,437 | 0,605 | 0,665 | 0,510 | 0,547 |
| INT8 texto (Surzhyk/Translit) | 0,871 | 0,963 | 0,976 | 0,910 | 0,927 |
| BM25 (intención/escenario) | 0,141 | 0,255 | 0,325 | 0,191 | 0,222 |
| INT8 texto (intención/escenario) | 0,305 | 0,571 | 0,684 | 0,419 | 0,482 |
| INT8 visual (estudio a producto) | 0,420 | 0,702 | 0,793 | 0,538 | 0,599 |
| INT8 visual (cámara móvil a catálogo) | 0,979 | 0,993 | 0,996 | 0,986 | 0,988 |

Métricas de eficiencia y paridad:

| Métrica | Valor |
|---|---:|
| Paridad INT8 texto (cos sim vs FP32) | 0,9952 |
| Paridad INT8 visión (cos sim vs FP32) | 0,9979 |
| Latencia CPU 2 hilos, texto p50 | 12,1 ms |
| Latencia CPU 2 hilos, visión p50 | 271,2 ms |
| Delta de RSS por sesión | 228,96 MB |

## Requisitos de hardware

- Inferencia exclusivamente en CPU mediante onnxruntime; no se documenta soporte GPU.
- Memoria adicional estimada: aproximadamente 229 MB de RSS por sesión de inferencia.
- El repositorio completo ocupa 0,4 GB, por lo que cabe holgadamente en cualquier máquina de desarrollo o contenedor pequeño.
- Latencia de referencia con 2 hilos de CPU: 12,1 ms p50 para texto y 271,2 ms p50 para visión. La torre visual es el cuello de botella y conviene paralelizar o cachear embeddings de catálogo.
- Despliegue previsto en .NET 10 con onnxruntime y PostgreSQL con pgvector; también puede servirse desde cualquier runtime compatible con ONNX (Python, C++, Rust) si se respeta el preprocesado documentado.
- No se reportan cifras de throughput agregado ni de latencia con más hilos o con GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de embedding | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Lenivka/torgly-multimodal-search-v1 | Dual-encoder multimodal (texto + visión) | 384 (Matryoshka 128/256/384) | uk, en | Apache 2.0 | ONNX INT8 |
| intfloat/multilingual-e5-small | Encoder textual | 384 | Multilingüe | MIT | safetensors |
| google/siglip2-base-patch16-224 | Dual-encoder visión-texto | no disponible | Multilingüe | Apache 2.0 | safetensors |
| BM25 (línea base léxica) | Recuperación léxica | no aplica | Depende del analizador | no aplica | no aplica |

La comparación directa con los modelos base es limitada: torgly-multimodal-search-v1 está ajustado y cuantizado para un dominio concreto (marketplace ucraniano) y no se publican métricas de los modelos base en los mismos conjuntos held-out. Frente a BM25, las cifras del autor muestran mejoras sustanciales en escenarios con ruido léxico y consultas por intención, aunque BM25 sigue siendo competitivo en consultas limpias en ucraniano (Recall@1 de 0,856 frente a 0,915).

## Limitaciones y advertencias

- Modelo de recuperación, no generativo: no produce texto, código ni respuestas; solo embeddings.
- El ajuste está orientado a un catálogo de marketplace ucraniano; el rendimiento fuera de ese dominio no está validado.
- La búsqueda por intención sigue siendo la tarea más débil: Recall@1 de 0,305 y nDCG@10 de 0,482, con margen claro de mejora.
- La búsqueda visual desde imágenes de estudio a producto obtiene un Recall@1 de 0,420, notablemente inferior al escenario de cámara móvil; conviene validar con imágenes de catálogo reales antes de producción.
- La latencia de la torre visual (271 ms p50 en CPU de 2 hilos) puede ser problemática en rutas interactivas sin caché de embeddings de catálogo.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni evaluación de robustez frente a imágenes adversariales o consultas ofensivas.
- La ponderación multimodal está fijada en 0,65/0,35; no se indica si es configurable ni cómo se calibró.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte por parte del autor.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, sin señales de adopción ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lenivka/torgly-multimodal-search-v1
- Modelo base textual: https://huggingface.co/intfloat/multilingual-e5-small
- Modelo base visual: https://huggingface.co/google/siglip2-base-patch16-224
- Documentación de onnxruntime: https://onnxruntime.ai/docs/
- Extensión pgvector para PostgreSQL: https://github.com/pgvector/pgvector
