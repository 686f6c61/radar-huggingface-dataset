# Qdrant/all_miniLM_L6_v2_with_attentions

## Resumen

`Qdrant/all_miniLM_L6_v2_with_attentions` es un port a ONNX del conocido modelo de embeddings `sentence-transformers/all-MiniLM-L6-v2`, modificado por Qdrant para devolver los pesos de atención además del embedding. Desarrollado por el equipo de Qdrant (motor de búsqueda vectorial open source escrito en Rust), el modelo resuelve un problema muy concreto: habilitar búsquedas híbridas del tipo BM42, una variante de BM25 que sustituye las frecuencias de término clásicas por pesos derivados de la atención del transformer.

La relevancia del modelo es práctica: permite construir representaciones dispersas (sparse) de documentos que combinan la interpretabilidad y el sesgo hacia términos poco frecuentes de BM25 con la capacidad semántica de un transformer ligero. Al estar basado en MiniLM-L6-v2, mantiene un tamaño reducido (6 capas, ~22,7 M de parámetros) y un coste de inferencia bajo, lo que lo hace adecuado para indexar grandes volúmenes de documentos en pipelines de recuperación.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato ONNX, y está pensado para usarse con FastEmbed y Qdrant configurando el modificador `Modifier.IDF` en la colección. Solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT (MiniLM-L6-v2), 6 capas, exportado a ONNX con salida de pesos de atención |
| Parámetros totales | ~22,7 M (heredados de all-MiniLM-L6-v2; no confirmado explícitamente en la información proporcionada) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (MiniLM-L6-v2 original soporta hasta 256 tokens; no confirmado en la información proporcionada) |
| Tipos de cuantización | no disponible (formato ONNX; FastEmbed puede aplicar cuantización, pero no se detalla) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un port directo de `sentence-transformers/all-MiniLM-L6-v2`, un transformer encoder de tipo BERT con 6 capas y dimensión oculta de 384, destilado originalmente del modelo `microsoft/MiniLM-L12-H384-uncased` y afinado para similitud semántica de frases. La modificación introducida por Qdrant consiste en ajustar la exportación a ONNX para que el grafo devuelva también los pesos de atención de las capas internas, que son la señal que utiliza BM42 para calcular la importancia de cada token.

No se dispone de información sobre el dataset de entrenamiento específico de este port, ni sobre procesos de RLHF/DPO (no aplicables a un modelo de embeddings). La innovación técnica destacable no está en el entrenamiento sino en el uso: BM42 emplea los pesos de atención como proxy de la relevancia de un término, evitando el sesgo clásico de BM25 hacia documentos largos y mejorando la recuperación de términos raros sin renunciar a la eficiencia de los índices invertidos.

## Capacidades

- Generación de embeddings de frase densos (384 dimensiones) para similitud semántica.
- Exposición de pesos de atención por token, necesarios para calcular representaciones sparse tipo BM42.
- Extracción de características (`feature-extraction`) y `sentence-similarity` como pipeline principal.
- Compatible con `text-embeddings-inference` y con endpoints compatibles según los tags del repositorio.
- Integración nativa con FastEmbed mediante `SparseTextEmbedding(model_name="Qdrant/bm42-all-minilm-l6-v2-attentions")`.
- Soporte exclusivo de inglés.
- No soporta tool calling, agentes, visión ni audio: es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda híbrida en Qdrant con BM42: se indexan documentos como vectores sparse y se configura `Modifier.IDF` en la colección; el modelo aporta los pesos de atención que BM42 convierte en pesos de término, combinando recuperación léxica y semántica en una sola consulta.
- Recuperación aumentada (RAG) sobre corpus en inglés: al generar representaciones sparse, el modelo permite recuperar pasajes relevantes con bajo coste computacional y buena cobertura de términos poco frecuentes, ideal para bases documentales grandes.
- Indexación masiva de documentación técnica: con ~22,7 M de parámetros y pesos ONNX, el throughput es alto y el coste por documento mínimo, lo que permite procesar millones de chunks en pipelines batch con FastEmbed.
- Motor de búsqueda interna para aplicaciones empresariales: se puede desplegar junto a Qdrant en infraestructura propia y servir consultas de similitud con latencia baja, sin depender de APIs externas.
- Filtrado y deduplicación de datasets: los embeddings densos permiten agrupar documentos casi duplicados antes de indexarlos, reduciendo el ruido en el corpus de recuperación.
- Sistemas de recomendación de contenido textual: la similitud entre embeddings de artículos, noticias o fichas de producto permite construir vecindarios de items relacionados con un coste de inferencia muy contenido.
- Evaluación de recuperación léxica vs. semántica: al exponer los pesos de atención, es útil para experimentar con variantes de BM42 y comparar su comportamiento frente a BM25 clásico en tareas de IR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los ~22,7 M de parámetros; en la práctica, unos pocos cientos de MB incluyendo buffers de activación.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o RTX 4090. Para volúmenes moderados, RTX 3060/4060 o incluso T4.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU con rendimiento aceptable gracias al tamaño reducido.
- Opciones de despliegue: FastEmbed (recomendado por el autor), ONNX Runtime, `text-embeddings-inference` y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerá del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qdrant/all_miniLM_L6_v2_with_attentions | ~22,7 M | no disponible | en | Apache 2.0 | ONNX | Devuelve pesos de atención para BM42 |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | en | Apache 2.0 | safetensors, PyTorch | Modelo base; no expone atención de forma directa para BM42 |
| Qdrant/bm25 | no aplica | no aplica | multilingüe (según tokenizador) | Apache 2.0 | no disponible | Implementación BM25 clásica en FastEmbed, sin componente neuronal |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | en | MIT | safetensors, ONNX | Embeddings densos con mejor rendimiento general en MTEB, pero sin señal de atención para sparse |

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está garantizado ni documentado.
- Es un modelo de embeddings, no generativo: no responde preguntas ni mantiene conversaciones.
- Los pesos de atención no son una medida calibrada de relevancia; BM42 los usa como heurística y puede comportarse de forma distinta a BM25 en dominios muy específicos.
- Requiere configurar `Modifier.IDF` en Qdrant para que los vectores sparse funcionen como se espera; sin esa configuración, los resultados de búsqueda pueden degradarse.
- La longitud de contexto está limitada por el modelo base (habitualmente 256 tokens); documentos más largos deben trocearse.
- Riesgo de alucinación no aplica en sentido estricto, pero sí de recuperar pasajes irrelevantes si el corpus no está bien troceado.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original por si hubiera restricciones adicionales (no indicadas en la información disponible).
- El repositorio ocupa 0,2 GB; verificar la versión concreta de ONNX antes de desplegar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Qdrant/all_miniLM_L6_v2_with_attentions
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Artículo BM42 de Qdrant: https://qdrant.tech/articles/bm42/
- Documentación de Qdrant sobre el modificador IDF: https://qdrant.tech/documentation/concepts/indexing/?=modifier#idf-modifier
- FastEmbed (GitHub): https://github.com/qdrant/fastembed
- Qdrant (web oficial): https://qdrant.tech/
- Qdrant (GitHub): https://github.com/qdrant/qdrant
- Documentación de Qdrant: https://qdrant.tech/documentation/
- Organización Qdrant en Hugging Face: https://huggingface.co/Qdrant
