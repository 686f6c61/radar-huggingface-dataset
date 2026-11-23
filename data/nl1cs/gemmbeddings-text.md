# nl1cs/gemmbeddings-text

## Resumen

Gemmbeddings-text es la conversión a Core ML del codificador de texto de google/embeddinggemma-2, un modelo de embeddings de frases orientado a similitud semántica y extracción de características. El autor (nl1cs) ha reescrito el grafo para ejecutarse en el Apple Neural Engine (ANE) y ha comprimido los pesos a tablas de búsqueda de 6 bits por cada 16 canales de salida, con el objetivo de reducir el coste computacional y de memoria en dispositivos Apple. El resultado es un paquete `.mlpackage` que expone dos funciones, `embed_64` y `embed_512`, con distinto tamaño de lote por llamada.

La relevancia de esta ficha es acotada pero clara: no se trata de un modelo nuevo entrenado desde cero, sino de una variante de despliegue optimizada para inferencia local en hardware Apple (iOS 18 / macOS 15 en adelante). El modelo base, EmbeddingGemma 2, es obra de Google DeepMind y se distribuye bajo licencia Apache 2.0. La conversión conserva únicamente el codificador de texto; las ramas de visión y audio del modelo original no están incluidas.

Al estar alojado en Hugging Face con licencia Apache 2.0 y librería `coreml`, el artefacto está pensado para integrarse en aplicaciones nativas de Apple mediante Core ML, no para servidores con GPU NVIDIA. El repo ocupa 0,4 GB y no registra descargas ni likes en el momento de redactar esta ficha, lo que sugiere un uso incipiente o experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador de texto (base: google/embeddinggemma-2), grafo reescrito para Apple Neural Engine |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos comprimidos a tablas de búsqueda (lookup tables) de 6 bits, por cada 16 canales de salida; tabla de embeddings en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage`; tabla de embeddings en bf16 (`embeddings.bf16`); tokenizador en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es EmbeddingGemma 2 de Google DeepMind, un codificador de texto para generar embeddings de frases. La variante aquí publicada no incluye entrenamiento propio: el autor ha modificado el grafo original para que sea compatible con el Apple Neural Engine y ha aplicado compresión de pesos mediante tablas de búsqueda de 6 bits por cada 16 canales de salida. La tabla de embeddings de tokens se mantiene en bf16 con dimensiones `[262144, 512]`.

El paquete Core ML expone dos funciones: `embed_64`, que procesa 4 textos por llamada, y `embed_512`, que procesa 16 textos por llamada. El tokenizador es el original de Gemma y se distribuye como `tokenizer.json`. El manifiesto `manifest.json` documenta las funciones, el layout de entradas y el tamaño y SHA-256 de cada fichero. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de embeddings de texto para similitud semántica (sentence-similarity) y extracción de características (feature-extraction).
- Ejecución en Apple Neural Engine mediante Core ML, orientada a inferencia local en iOS 18 / macOS 15 o superior.
- Procesamiento por lotes: 4 textos por llamada en `embed_64` y 16 textos por llamada en `embed_512`.
- Tokenización compatible con el tokenizador original de Gemma.
- No incluye capacidades de visión ni de audio (excluidas explícitamente de la conversión).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo de pensamiento (thinking mode).

## Casos de uso

- Búsqueda semántica local en aplicaciones iOS y macOS: el modelo puede indexar y comparar frases directamente en el dispositivo gracias al ANE, sin enviar texto a un servidor.
- Deduplicación y agrupación de documentos en apps de notas: usar los embeddings para detectar contenido redundante o agrupar entradas por similitud semántica.
- Sistemas de recomendación on-device: calcular similitud entre perfiles, artículos o ítems en tiempo real en el dispositivo.
- Clasificación de texto por similitud con prototipos: asignar etiquetas comparando el embedding de la consulta con embeddings de referencia precalculados.
- Recuperación aumentada (RAG) en local: generar embeddings de fragmentos de documentos para alimentar un índice vectorial embebido en la app, con latencia baja y sin conexión.
- Filtrado de contenido y moderación: comparar textos contra listas de ejemplos etiquetados mediante similitud coseno.
- Procesamiento por lotes en pipelines de datos: usar `embed_512` para vectorizar hasta 16 textos por llamada en tareas de preprocesado.

## Benchmarks y rendimiento

| Metrica | Gemmbeddings-text (6 bits, ANE) | Original fp16 |
|---|---|---|
| Peor similitud coseno frente al fp32 original | 0.998 | no disponible |
| SciFact NDCG@10 | 0.8530 | 0.8543 |
| STS-B Spearman | 0.8742 | 0.8750 |

Mediciones realizadas por el autor sobre un Apple M5. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Neural Engine en dispositivos con iOS 18 o macOS 15 o superior.
- Medido por el autor en un Apple M5; no se documentan requisitos mínimos de memoria ni de VRAM.
- No está pensado para GPU NVIDIA (A100, H100, RTX 4090) ni para aceleradores no Apple.
- Despliegue mediante Core ML (`.mlpackage`), con las funciones `embed_64` y `embed_512`.
- No se documentan latencia ni throughput numéricos más allá de las métricas de calidad reportadas.
- El repo ocupa 0,4 GB, lo que da una cota superior del espacio de almacenamiento necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma |
|---|---|---|---|---|
| Gemmbeddings-text | no disponible | no disponible | Apache 2.0 | Core ML (ANE) |
| google/embeddinggemma-2 (original) | no disponible | no disponible | Apache 2.0 (según model card) | Pesos originales (no especificado) |
| Otras variantes de embeddinggemma-2 | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría. Los datos de benchmarks solo permiten comparar esta conversión con su original fp16 en SciFact y STS-B.

## Limitaciones y advertencias

- Solo incluye el codificador de texto; visión y audio están excluidos.
- Requiere iOS 18 / macOS 15 o superior y hardware Apple con Neural Engine; no es desplegable en GPU NVIDIA ni en servidores x86 convencionales.
- La compresión a 6 bits introduce una degradación mínima pero no nula: el peor coseno frente al fp32 es 0.998 y SciFact NDCG@10 baja de 0.8543 a 0.8530.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación (el modelo es un codificador de embeddings, no un generador de texto).
- No se dispone de información sobre la longitud de contexto máxima.
- El modelo no registra descargas ni likes, por lo que no hay evidencia de validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el fichero `LICENSE` del repo y las condiciones del modelo base de Google DeepMind.
- No se documentan latencia ni throughput, lo que dificulta estimar el rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/nl1cs/gemmbeddings-text
- Modelo base: https://huggingface.co/google/embeddinggemma-2
