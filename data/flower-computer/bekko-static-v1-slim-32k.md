# flower-computer/bekko-static-v1-slim-32k

## Resumen

bekko-static-v1-slim-32k es un modelo de embeddings estáticos (static embedding) desarrollado por flower-computer como derivado podado del vocabulario de hotchpotch/bekko-static-embedding-v1. No es un transformer: se trata de una tabla de búsqueda de tokens más un mean pooling, con una dimensión de embedding de 1024 y soporte Matryoshka de 32 a 1024 dimensiones. El modelo conserva 32.000 de los 200.000 tokens WordPiece originales, seleccionados por su utilidad para los 14 idiomas de MNanoBEIR.

El objetivo del modelo es ofrecer recuperación semántica multilingüe con un coste computacional y de almacenamiento mínimo: 66 MB en fp16 frente a los 410 MB del modelo base, manteniendo el mismo espacio de embeddings. Esto lo hace adecuado para despliegues en entornos con recursos limitados, aplicaciones embebidas o binarios Rust sin dependencias de Python en tiempo de ejecución.

La relevancia actual del modelo radica en su enfoque de poda de vocabulario guiada por daño esperado, una técnica que permite reducir drásticamente el tamaño de modelos de embeddings estáticos con una pérdida de calidad controlada (aproximadamente 4,4 puntos de nDCG@10 en NanoBEIR-en respecto al modelo completo). Está publicado bajo licencia MIT y es compatible con sentence-transformers y con la crate `encoders` de Rust.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Static embedding (token lookup + mean pooling, sin transformer) |
| Parametros totales | 32.768.000 (32.000 tokens × 1024 dimensiones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16, int8 (quant-8), int16 (quant-16); dimensiones Matryoshka 32, 64, 256, 512, 1024 |
| Idiomas soportados | en, ar, de, es, fr, it, ja, ko, no, pt, sr, sv, th, vi |
| Licencia | MIT |
| Formato de pesos | safetensors; tabla embebible en binario Rust |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura transformer. Se compone de una tabla de embeddings de 32.000 × 1024 valores y un tokenizador WordPiece podado. La inferencia consiste en tokenizar el texto, buscar los vectores correspondientes a cada token y promediarlos (mean pooling) para obtener el embedding de la frase. No hay capas de atención, ni FFN, ni mecanismo de contexto posicional.

El proceso de construcción del vocabulario se basó en un criterio de "daño esperado por eliminación": cada token se ordenó según su frecuencia en corpus (WebFAQ-v2 y Wikipedia, con peso igual por idioma y ×3 para inglés) multiplicada por la norma de la diferencia entre su vector y la suma de los vectores de los fragmentos en que se descompone al eliminarlo. Se aplicó en rondas (eliminar el 10 % menos útil, re-tokenizar, re-puntuar) hasta alcanzar los 32.000 tokens. Posteriormente se realizó una autodestilación ligera (lr 0.03, 3000 pasos, batch 1024, Adam disperso solo en filas afectadas) con pérdida coseno a 1024, 256 y 64 dimensiones contra los embeddings del modelo completo, sobre párrafos de WebFAQ-v2 y Wikipedia de los idiomas cubiertos. Esta fase recupera entre 1 y 2 puntos de nDCG y mueve aproximadamente el 10 % de la norma de la fila mediana.

Como consecuencia de la reducción de vocabulario, el texto en los idiomas cubiertos se tokeniza en aproximadamente un 21 % más tokens que con el tokenizador original, lo que incrementa proporcionalmente el coste de embedding. Los tokens de caracteres individuales presentes en el corpus se conservan siempre, de modo que el texto en idiomas cubiertos nunca degrada a `[UNK]`. Los idiomas no cubiertos (por ejemplo, chino, ruso, hindi, telugu, tailandés en escrituras no incluidas) tokenizan a caracteres o `[UNK]` y no están soportados.

## Capacidades

- Generación de embeddings de frase para similitud semántica y recuperación de información (retrieval).
- Extracción de características (feature-extraction) para pipelines de búsqueda semántica.
- Soporte multilingüe para 14 idiomas: inglés, árabe, alemán, español, francés, italiano, japonés, coreano, noruego, portugués, serbio, sueco, tailandés y vietnamita.
- Dimensiones Matryoshka: permite truncar el embedding a 512, 256, 64 o 32 dimensiones con pérdida de calidad controlada.
- Cuantización a int8 e int16 para reducir el tamaño de la tabla.
- Integración con sentence-transformers mediante `SentenceTransformer`.
- Integración con Rust mediante la crate `encoders`, que compila el modelo en el binario sin descarga en tiempo de ejecución ni Python.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles o embebidas: el modelo pesa 66 MB en fp16 y puede compilarse en un binario Rust, lo que permite realizar búsqueda semántica local sin conexión ni servidor Python, con un coste de memoria mínimo.
- Deduplicación de documentos multilingües: al generar embeddings de 1024 dimensiones (o truncados a 256), puede compararse por similitud coseno pares de documentos en los 14 idiomas soportados para detectar duplicados o near-duplicates en pipelines de ingesta.
- Clasificación de textos por similitud a prototipos: se calculan embeddings de frases de referencia por categoría y se asigna la categoría del prototipo más cercano, sin necesidad de entrenar un clasificador adicional.
- Filtrado de candidatos en sistemas RAG de bajos recursos: el modelo puede actuar como primera etapa de recuperación (retrieval) sobre corpus pequeños o medianos, con latencia muy baja al no requerir forward pass de transformer.
- Agrupamiento (clustering) de tickets de soporte o reseñas: los embeddings permiten agrupar textos por similitud semántica en los idiomas cubiertos para triaje automático o análisis de temas.
- Búsqueda en catálogos de productos multilingües: indexación de descripciones de producto en español, francés, alemán, italiano, portugués, etc., con consultas en cualquiera de los idiomas soportados y recuperación por similitud.
- Sistemas de recomendación basados en contenido: comparación de perfiles de usuario o historiales textuales con descripciones de ítems mediante similitud de embeddings.
- Detección de plagio o similitud entre textos cortos en entornos con restricciones de memoria, donde un modelo transformer de embeddings no cabría.

## Benchmarks y rendimiento

Datos de la model card, medidos con un harness local de recuperación por coseno sobre los datasets Nano de HAKARI-Bench. Las puntuaciones son nDCG@10 × 100 a 1024 dimensiones.

| Modelo | Vocabulario · tamano fp16 | Idiomas | NanoBEIR-en | MNanoBEIR | NanoMIRACL |
|---|---|---:|---:|---:|---:|
| hotchpotch/bekko-static-embedding-v1 | 200k · 410 MB | 40 | 53,71 | 43,71 | 68,03 |
| bekko-static-v1-slim-100k | 100k · 205 MB | 25 | 52,91 | 42,98 | 66,53 |
| bekko-static-v1-slim-75k | 75k · 154 MB | 25 | 52,09 | 42,15 | 64,51 |
| bekko-static-v1-slim-50k | 50k · 102 MB | 25 | 50,22 | 40,37 | 61,35 |
| **bekko-static-v1-slim-32k** | 32k · 66 MB | 14 | 49,31 | 39,86 | 49,25 |
| Este vocabulario sin recuperación (ablación) | 32k · 66 MB | 14 | 48,57 | 39,33 | 47,61 |

La recuperación por autodestilación aporta 0,74 puntos en NanoBEIR-en, 0,53 en MNanoBEIR y 1,64 en NanoMIRACL respecto a la ablación sin recuperación. La caída respecto al modelo base de 200k tokens es de 4,40 puntos en NanoBEIR-en, 3,85 en MNanoBEIR y 18,78 en NanoMIRACL (esta última afectada porque NanoMIRACL incluye idiomas que el modelo de 32k elimina).

## Requisitos de hardware

- VRAM estimada para inferencia: 66 MB en fp16 para la tabla completa a 1024 dimensiones; aproximadamente 33 MB en int8; aproximadamente 16 MB si se trunca a 512 dimensiones en fp16. El modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU con latencia muy baja. Cualquier GPU (RTX 3060, RTX 4090, A100, H100) es sobredimensionada para este modelo; la GPU no aporta ventaja significativa frente a CPU en la mayoría de casos.
- Cabe en consumer GPU: sí, en cualquier GPU con al menos 1 GB de VRAM, e incluso en entornos sin GPU.
- Opciones de despliegue: sentence-transformers (Python), crate `encoders` de Rust (compilación en binario, con features `dim-512` a `dim-32`, `quant-8`, `quant-16` y `rayon` para batches paralelos). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de embeddings estáticos de este tipo.
- Latencia y throughput: no se proporcionan cifras concretas en la información disponible. Al ser una operación de lookup y media, la latencia es del orden de microsegundos a milisegundos por frase en CPU, dependiendo de la longitud del texto y del número de tokens (aproximadamente un 21 % más que el tokenizador original).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | NanoBEIR-en | MNanoBEIR | Licencia | Tamaño fp16 |
|---|---|---:|---:|---:|---:|---|---:|
| **bekko-static-v1-slim-32k** | 32,77 M | no disponible | 14 | 49,31 | 39,86 | MIT | 66 MB |
| bekko-static-v1-slim-50k | 51,2 M (aprox.) | no disponible | 25 | 50,22 | 40,37 | MIT | 102 MB |
| bekko-static-v1-slim-100k | 102,4 M (aprox.) | no disponible | 25 | 52,91 | 42,98 | MIT | 205 MB |
| hotchpotch/bekko-static-embedding-v1 | 204,8 M (aprox.) | no disponible | 40 | 53,71 | 43,71 | no disponible | 410 MB |

No se dispone de datos de benchmarks de modelos transformer de embeddings comparables (por ejemplo, familia E5, BGE o GTE) en la información proporcionada, por lo que la comparación se limita a los miembros de la misma familia.

## Limitaciones y advertencias

- Solo soporta 14 idiomas. El texto en otros idiomas (chino, ruso, hindi, coreano no incluido, etc.) se tokeniza a caracteres o `[UNK]` y produce embeddings de baja calidad.
- La calidad de recuperación es inferior a la del modelo base: 4,40 puntos menos en NanoBEIR-en y 3,85 en MNanoBEIR. En NanoMIRACL la caída es de 18,78 puntos, en parte porque ese benchmark incluye idiomas que este modelo elimina.
- El texto en idiomas cubiertos se tokeniza en aproximadamente un 21 % más tokens que con el tokenizador original, lo que incrementa el coste de embedding proporcionalmente.
- Al ser un modelo de embeddings estáticos, no captura orden de palabras ni contexto sintáctico más allá del promedio de vectores de tokens; es inherentemente menos expresivo que un transformer para tareas que requieren composicionalidad semántica fina.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede producir similitudes engañosas en textos ambiguos o con vocabulario fuera del dominio de entrenamiento.
- No se han publicado análisis de sesgos en la información disponible.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución, sin restricciones adicionales conocidas.
- El modelo fue creado en noviembre de 2026 según los metadatos de HuggingFace; verificar la fecha real de publicación si es relevante para producción.
- No se especifica la longitud máxima de secuencia soportada; el mean pooling sobre secuencias largas puede diluir la señal semántica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flower-computer/bekko-static-v1-slim-32k
- Modelo base: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Colección de la familia slim: https://huggingface.co/collections/flower-computer/bekko-static-v1-slim-6aecc3d4969e7752c8a5074f
- Crate `encoders` en crates.io: https://crates.io/crates/encoders
- Repositorio GitHub de `encoders`: https://github.com/flowercomputers/encoders
- HAKARI-Bench (datasets de evaluación): https://huggingface.co/hakari-bench
