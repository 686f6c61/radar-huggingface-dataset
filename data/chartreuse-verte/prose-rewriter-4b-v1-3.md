# chartreuse-verte/prose-rewriter-4b-v1.3

## Resumen

Prose-rewriter-4b-v1.3 es un modelo de reescritura de prosa a nivel de párrafo desarrollado por chartreuse-verte. Está diseñado para tomar texto generado por un modelo de lenguaje grande y re-renderizarlo de forma que suene más humano, preservando la semántica original. Es el sucesor de prose-rewriter-4b-v1.2 y se basa en Qwen/Qwen3-4B-Base con una adaptación LoRA de rango 32 fusionada a una fuerza de 1.2.

El modelo aborda el problema del "slop" en la escritura generada por IA: textos planos, repetitivos y con patrones característicos. Su enfoque de entrenamiento es inusual: se corrompe prosa humana con otros modelos para crear pares de entrada-salida, y el modelo aprende a invertir esa corrupción. La versión v1.3 introduce dos nuevos filtros de datos que reducen la invención de contenido y la copia literal respecto a v1.2, lo que permite fusionar la LoRA a mayor intensidad.

Relevante ahora porque ofrece una solución específica y ligera (4.4B parámetros) para mejorar la naturalidad de textos generados por IA, con variantes cuantizadas para despliegue en hardware modesto. No es un modelo conversacional, sino una herramienta de edición de prosa con un formato de prompt estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-4B-Base con LoRA fusionada, rango 32, fuerza 1.2) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredado de Qwen3-4B-Base, probablemente 32K) |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder estándar basado en Qwen/Qwen3-4B-Base. La adaptación se realiza mediante una LoRA de rango 32 que se fusiona en los pesos del modelo base con una fuerza de 1.2. No se modifican los embeddings ni la cabeza de salida; la cabeza adaptada se mantiene separada de los embeddings en las versiones GGUF, donde se cuantiza a Q8_0 en el Q8_0 y a Q6_K en el Q4_K_M.

El entrenamiento sigue una estrategia "corrupt forward, train backward": el texto humano es el objetivo, y un LLM on-policy genera la entrada corrompiendo ese texto (añadiendo "slop" o relleno). El conjunto de datos de destino combina prosa humana de r/WritingPrompts (57%), AO3 (42%) y una pequeña parte de fanfiction.net. La entrada se genera con once endpoints corruptores distintos, ponderados y con límites de compartición para evitar que dominen los tics de un solo modelo. El conjunto de entrenamiento contiene 67.696 filas sobre 54.209 objetivos distintos. Los datos se dividen en tres bandas de corrupción: pesada (39%), media (38%) y ligera (20%).

El modelo se entrena con un formato de prompt específico con tres roles: `source` (el párrafo de entrada), `edit` (el modo de transformación) y `rewrite` (la generación). El bloque `edit` es obligatorio y sus valores (`match`, `inflate`, `compress`) indican qué transformación se aplicó a la entrada, no qué debe hacer el modelo. Esto es clave: `match` significa que la entrada ya tiene la longitud correcta, `inflate` indica que la entrada fue alargada artificialmente, y `compress` que fue acortada.

## Capacidades

- Reescritura de prosa a nivel de párrafo, preservando la semántica y mejorando la naturalidad.
- Transferencia de estilo: reduce los patrones típicos de texto generado por LLM ("slop").
- Tres modos de edición controlados por el bloque `edit`: reescritura en sitio (`match`), recorte (`inflate`) y expansión (`compress`).
- No es un modelo conversacional: no soporta diálogo multi-turno ni tool calling.
- No tiene capacidades de visión, audio ni razonamiento multimodal.
- Solo soporta inglés.
- Generación con temperatura 0.9 y top_p 0.9 recomendada por el autor.
- Funciona con el pipeline de `text-generation` de transformers y con llama.cpp.

## Casos de uso

- Mejora de artículos de blog generados por IA: el modelo puede reescribir párrafos completos para eliminar el tono mecánico y las frases repetitivas, manteniendo el significado. Con `match` se reescribe sin cambiar la longitud, ideal para una edición final antes de publicar.
- Limpieza de respuestas de chatbots para soporte al cliente: los textos generados por un asistente pueden pasarse por el modelo para que suenen más humanos y empáticos, reduciendo la sensación de respuestas plantilla.
- Redacción de descripciones de productos en e-commerce: el modelo puede transformar descripciones genéricas generadas automáticamente en textos más atractivos y variados, mejorando la experiencia de compra.
- Generación de contenido creativo (cuentos, relatos): al usar `inflate` o `compress`, el modelo puede expandir o condensar fragmentos narrativos, ayudando a ajustar la longitud de escenas en una historia.
- Adaptación de contenido académico o técnico a un tono más coloquial: aunque el modelo está entrenado principalmente con prosa creativa, puede aplicarse a textos expositivos para reducir la jerga innecesaria y mejorar la legibilidad.
- Preprocesamiento de datos de entrenamiento: los textos generados por LLM que se usarán como datos de entrenamiento pueden pasarse por este modelo para reducir el sesgo de "slop" y aumentar la diversidad léxica, mejorando la calidad de los datos de entrada para otros modelos.

## Benchmarks y rendimiento

La evaluación final del autor compara v1.2 y v1.3 sobre una sonda de entrenamiento:

| Metrica | v1.2 | v1.3 |
|---|---|---|
| Invention rate | 0.146 | 0.104 |
| Copy rate | 0.062 | 0.042 |
| Distinct-4 | 0.982 | 0.990 |
| Copy excess vs target | −0.009 | +0.049 |
| Entropy | 0.506 | 0.505 |
| Length ratio | 1.004 | 1.016 |
| Train loss | 0.9104 | 0.974 |
| Val loss | 0.7539 | 0.8418 |

La invención (contenido no soportado por la entrada) baja un 29% y la tasa de copia un 32% respecto a v1.2, con una diversidad ligeramente mejor. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de razonamiento general, sino específicamente para reescritura de prosa.

## Requisitos de hardware

- VRAM estimada para inferencia: 
  - bf16 safetensors: aproximadamente 8.8 GB (4.4B parámetros × 2 bytes).
  - GGUF Q8_0 (4.69 GB): aproximadamente 5 GB de VRAM.
  - GGUF Q4_K_M (2.72 GB): aproximadamente 3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar la versión Q8_0; la versión Q4_K_M cabe en GPUs de 4 GB como la GTX 1650 o RTX 3050. Para bf16 se recomienda una RTX 3090 o superior.
- Sí cabe en GPUs de consumo: RTX 3060 (12 GB) para Q8_0, RTX 4060 (8 GB) para Q8_0 y Q4_K_M, y GPUs más antiguas con 4-6 GB para Q4_K_M.
- Opciones de despliegue: transformers (con `device_map="cuda"`), llama.cpp / llama-cpp-python (para GGUF), y plataformas de inferencia gestionada como FriendliAI (que ofrece endpoints compatibles con text-generation-inference).
- Latencia y throughput: no disponibles. Para un modelo de 4B parámetros en una GPU moderna, se espera una latencia de decenas de milisegundos por token.

## Comparativa con modelos similares

No hay una comparativa directa publicada con otros modelos de reescritura de prosa. La comparación más relevante es con su predecesor:

| Modelo | Parametros | Base | Contexto | Invention rate | Copy rate | Licencia |
|---|---|---|---|---|---|---|
| prose-rewriter-4b-v1.3 | 4.4B | Qwen3-4B-Base | no disponible | 0.104 | 0.042 | AGPL-3.0 |
| prose-rewriter-4b-v1.2 | 4.4B | Qwen3-4B-Base | 32K (según llm-explorer) | 0.146 | 0.062 | AGPL-3.0 |
| Qwen/Qwen3-4B-Base | 4.4B | — | 32K | no aplica | no aplica | Apache-2.0 |

La comparación con el modelo base no es significativa porque el reescritor está especializado en una tarea concreta. No hay otros modelos de reescritura de prosa de código abierto con métricas comparables publicadas.

## Limitaciones y advertencias

- La licencia AGPL-3.0 es copyleft y tiene implicaciones para uso comercial: si se ofrece el modelo como servicio a través de una red, puede ser necesario publicar el código fuente de la aplicación que lo utiliza.
- El modelo solo soporta inglés; no funciona con otros idiomas.
- No es un modelo conversacional: usar el template con roles estándar de chat puede producir resultados inesperados.
- El bloque `edit` es obligatorio; omitirlo colapsa el modelo a su modo más agresivo de eliminación de texto.
- La longitud mínima práctica de entrada es de aproximadamente 15 palabras; por debajo de 80 bytes, el modelo tiende a rellenar y fabricar contenido.
- El modelo tiene una tasa de invención del 10.4% y una tasa de copia del 4.2%, lo que significa que aún puede introducir contenido no soportado por la entrada o copiar literalmente partes del texto de origen.
- Los textos humanos usan menos vocabulario raro que los textos de LLM; el modelo puede reducir la riqueza léxica en favor de la naturalidad, lo que puede no ser deseable en todos los contextos.
- No se han publicado resultados de benchmarks estándar, por lo que no hay garantías de rendimiento en tareas fuera de la reescritura de prosa.
- El modelo fue entrenado principalmente con prosa creativa (Reddit, AO3, fanfiction); puede no funcionar bien con texto técnico, legal o muy formal.

## Enlaces

- HuggingFace: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v1.3
- Versión anterior (v1.2): https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v1.2
- Despliegue en FriendliAI: https://friendli.ai/models/chartreuse-verte/prose-rewriter-4b-v1.3
- Dataset de entrenamiento (r/WritingPrompts): https://huggingface.co/datasets/Mollymo/Human-to-AI-writing
- Dataset de entrenamiento (AO3): https://huggingface.co/datasets/midwestern-simulation-active/ao3_random_subset
- Dataset de entrenamiento (fanfiction.net): https://huggingface.co/datasets/atom-in-the-universe/fanfics-10k-10k
- Repositorio GitHub relacionado (técnicas de estilo): https://github.com/OrbFrontend/Chartreuse
