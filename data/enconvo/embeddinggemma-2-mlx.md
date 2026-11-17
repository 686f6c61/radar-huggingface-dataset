# enconvo/embeddinggemma-2-mlx

## Resumen

`enconvo/embeddinggemma-2-mlx` es un repositorio publicado en Hugging Face por el usuario `enconvo` que, por su identificador y por el sufijo `-mlx`, apunta a una conversión al formato MLX (el framework de Apple para ejecutar modelos en silicio de la serie M) de un modelo de embeddings denominado EmbeddingGemma 2. Se trata, por tanto, de un artefacto derivado orientado a la generación de representaciones vectoriales (embeddings) para tareas de recuperación, similitud semántica y búsqueda, y no de un modelo generativo de propósito general.

La información pública disponible es extremadamente limitada: la model card únicamente declara la licencia Apache 2.0 y no incluye descripción, especificaciones, datos de entrenamiento ni resultados de evaluación. El repositorio registra cero descargas y cero likes, y fue creado y actualizado en la misma marca temporal (2026-11-17T05:43:52Z), lo que sugiere una publicación reciente y sin validación comunitaria.

Por todo ello, esta ficha debe interpretarse como una descripción del contenedor y de su propósito inferido, no como una evaluación técnica del modelo. Cualquier dato de arquitectura, dimensión de embedding, longitud de contexto o rendimiento que no aparezca explícitamente se marca como no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings; conversión MLX de EmbeddingGemma 2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX, típicamente cuantización de 4 u 8 bits, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (pesos para el framework MLX de Apple; safetensors/GGUF no confirmados) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la información disponible. Por el identificador, se infiere que se trata de una conversión a MLX de un modelo de embeddings de la familia EmbeddingGemma 2, presumiblemente un transformer encoder entrenado con objetivos de similitud contrastiva para producir vectores densos. No obstante, ni la dimensión del embedding, ni el número de capas, ni el vocabulario, ni la longitud máxima de secuencia están documentados en el repositorio.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste fino supervisado, destilación o preferencias. La model card se limita a la declaración de licencia, sin sección de entrenamiento ni de evaluación.

## Capacidades

- Generación de embeddings de texto: el modelo está orientado a producir representaciones vectoriales densas para búsqueda semántica y similitud.
- Recuperación de información (retrieval): uso previsto en pipelines RAG y motores de búsqueda vectorial.
- Ejecución en Apple Silicon: al estar en formato MLX, está pensado para inferencia en chips de la serie M de Apple.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Búsqueda semántica en documentación interna: indexar fragmentos de texto y recuperar los más relevantes mediante similitud coseno entre embeddings, aprovechando el formato MLX para ejecutar la codificación en un Mac con Apple Silicon.
- Pipeline RAG local en estaciones de trabajo macOS: generar embeddings de los chunks de una base de conocimiento y consultarlos en un asistente que corra íntegramente en local, sin depender de APIs externas.
- Deduplicación y clustering de textos: calcular embeddings de un corpus y agrupar documentos similares para eliminar duplicados o clasificar temáticamente.
- Motor de recomendación de contenido: representar ítems y perfiles de usuario en el mismo espacio vectorial para sugerir artículos, productos o publicaciones afines.
- Filtrado y moderación semántica: comparar mensajes entrantes contra un conjunto de embeddings de referencia para detectar contenido próximo a categorías predefinidas.
- Evaluación de calidad de respuestas: medir la similitud entre una respuesta generada y una respuesta de referencia en pipelines de evaluación automática.
- Prototipado rápido en entornos Apple: al ser un artefacto MLX, permite integrar embeddings en aplicaciones nativas de macOS/iOS sin conversión adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño real del modelo, no documentado).
- GPU recomendadas: al ser una conversión MLX, el destino natural son los chips de Apple (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada.
- Compatibilidad con GPU NVIDIA: no confirmada; el formato MLX no se ejecuta de forma nativa en CUDA.
- ¿Cabe en GPU de consumo? No disponible con certeza; los modelos de embeddings suelen ser ligeros, pero no hay datos de parámetros que lo confirmen.
- Opciones de despliegue: MLX (mlx-lm / mlx-embeddings) en Apple Silicon; vLLM, llama.cpp, Ollama y TGI no están confirmados para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enconvo/embeddinggemma-2-mlx | no disponible | no disponible | MLX | Apache 2.0 | Hugging Face (0 descargas) |
| Modelo base EmbeddingGemma 2 (presunto) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de embeddings open source | no disponible | no disponible | safetensors/GGUF | variable | no disponible |

No se dispone de información suficiente para establecer una comparativa técnica fiable con alternativas concretas.

## Limitaciones y advertencias

- La model card no documenta arquitectura, dimensiones, contexto ni datos de entrenamiento; no es posible validar su comportamiento sin pruebas propias.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación por terceros.
- El repositorio es una conversión de terceros (`enconvo`), no una publicación oficial del autor original del modelo; puede contener diferencias respecto al modelo de referencia.
- El formato MLX limita su uso a entornos Apple Silicon; no es portable directamente a CUDA o CPU sin conversión.
- Riesgo de sesgos y alucinaciones en los resultados de recuperación: no evaluado ni documentado.
- Aunque la licencia declarada es Apache 2.0, conviene verificar la licencia del modelo base original antes de un uso comercial, ya que una conversión no puede ampliar los derechos del modelo de origen.
- No hay información sobre idiomas soportados ni sobre rendimiento en castellano.

## Enlaces

- Hugging Face: https://huggingface.co/enconvo/embeddinggemma-2-mlx
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este artefacto concreto.
