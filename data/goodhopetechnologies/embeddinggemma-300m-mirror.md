# GoodhopeTechnologies/embeddinggemma-300m-mirror

## Resumen

EmbeddingGemma 300M es un modelo de embeddings de texto desarrollado originalmente por Google y distribuido a través de la organización `litert-community` en Hugging Face. Este repositorio concreto (`GoodhopeTechnologies/embeddinggemma-300m-mirror`) es un espejo no modificado de los ficheros `embeddinggemma-300M_seq256_mixed-precision.tflite` y `sentencepiece.model`, publicado por GoodhopeTechnologies para su descarga desde la aplicación QuestHold AI. No se trata, por tanto, de un modelo nuevo ni de una variante reentrenada, sino de una copia de los pesos originales en formato LiteRT/TFLite.

El modelo resuelve el problema de generar representaciones vectoriales densas de texto para tareas de recuperación semántica, búsqueda, clustering, clasificación y RAG (retrieval-augmented generation). Con 300 millones de parámetros, se sitúa en la gama de modelos de embeddings ligeros, pensados para ejecutarse en dispositivos con recursos limitados, incluyendo móviles y edge devices, gracias a su empaquetado en TFLite con precisión mixta.

Su relevancia actual radica en que permite desplegar búsqueda semántica y sistemas de recuperación en local, sin depender de APIs externas, manteniendo la licencia Gemma de Google. El sufijo `seq256` del nombre del fichero indica una longitud máxima de secuencia de 256 tokens, un dato relevante para dimensionar los casos de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings; los detalles de la arquitectura no se especifican en la información proporcionada) |
| Parámetros totales | 300M (según el nombre del modelo) |
| Parámetros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 256 tokens (inferido del nombre del fichero `seq256`) |
| Tipos de cuantización | precisión mixta (mixed-precision), según el nombre del fichero `.tflite` |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | TFLite (LiteRT) + tokenizador SentencePiece (`sentencepiece.model`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF/DPO) empleadas. La model card del espejo no incluye estos datos y se limita a indicar que los ficheros son una copia no modificada del repositorio original `litert-community/embeddinggemma-300m`.

El único dato técnico verificable es el formato de despliegue: un fichero TFLite con precisión mixta, acompañado de un tokenizador SentencePiece. El nombre del fichero indica una ventana de secuencia de 256 tokens, lo que condiciona el diseño de los pipelines de embeddings. Para información sobre la arquitectura y el proceso de entrenamiento originales, es necesario consultar la documentación oficial de Google sobre EmbeddingGemma.

## Capacidades

- Generación de embeddings de texto densos para similitud semántica y recuperación.
- Búsqueda semántica y recuperación de documentos (base para sistemas RAG).
- Clustering y deduplicación de textos por similitud vectorial.
- Clasificación de texto mediante embeddings como features.
- Ejecución en dispositivos edge y móviles gracias al formato TFLite.
- Tokenización mediante SentencePiece integrada.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo conversacional según la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Búsqueda semántica local en aplicaciones móviles: el modelo puede empaquetarse en una app Android o iOS vía LiteRT para indexar y recuperar contenido del usuario sin conexión, aprovechando su tamaño de 300M parámetros y su formato TFLite.
- RAG en el edge: integrado en un pipeline de recuperación sobre una base vectorial local, permite aumentar las respuestas de un LLM sin enviar documentos a la nube, lo que resulta útil en escenarios de privacidad.
- Deduplicación de contenidos: calcular embeddings de artículos o registros y agrupar por similitud coseno para eliminar duplicados en bases de datos grandes.
- Clasificación y enrutamiento de tickets de soporte: usar los embeddings como entrada de un clasificador ligero para asignar categorías o prioridades.
- Recomendación de contenido: indexar artículos, productos o publicaciones y recomendar elementos similares a partir del vector del ítem consultado.
- Moderación y filtrado semántico: comparar textos contra un conjunto de referencia de políticas para detectar contenido próximo a categorías prohibidas.
- Búsqueda en documentación técnica interna: construir un índice vectorial sobre manuales y permitir consultas en lenguaje natural con recuperación de fragmentos relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; con 300M parámetros y precisión mixta, el fichero TFLite ocupa aproximadamente 0,2 GB (tamaño del repo), por lo que la huella en memoria es del orden de cientos de MB.
- GPU recomendadas: no disponible; el formato TFLite está orientado a CPU, GPU móvil y aceleradores LiteRT (NNAPI, GPU delegate).
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna, dado el reducido tamaño, aunque no hay cifras oficiales.
- Opciones de despliegue: LiteRT / TensorFlow Lite (interpreter), con soporte de delegados para CPU, GPU y NNAPI; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo en formato GGUF/safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmbeddingGemma 300M (este espejo) | 300M | 256 tokens | TFLite | Gemma | Hugging Face (espejo) |
| EmbeddingGemma 300M (original, litert-community) | 300M | 256 tokens | TFLite | Gemma | Hugging Face |
| Otros modelos de embeddings de la gama 300M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Ventana de contexto limitada a 256 tokens, lo que restringe la longitud de los fragmentos a indexar y obliga a trocear documentos largos.
- Es un espejo no oficial: la autoría y el mantenimiento corresponden a GoodhopeTechnologies, no a Google; conviene verificar la integridad de los ficheros frente al repositorio original.
- El repositorio no declara pipeline, idiomas ni métricas, por lo que faltan datos para evaluar su idoneidad multilingüe.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; es responsabilidad del usuario revisar ambas antes de desplegar en producción.
- No es un modelo generativo: no debe emplearse para chat, razonamiento o generación de código; su función es producir embeddings.
- Riesgo de sesgos y alucinación: no disponible en la información proporcionada; al ser un modelo de embeddings, el riesgo principal es la recuperación de fragmentos semánticamente próximos pero irrelevantes.
- El tamaño del repo (0,2 GB) y la ausencia de descargas y likes no permiten inferir calidad ni adopción; se recomienda contrastar con el repositorio original.

## Enlaces

- Repositorio del espejo: https://huggingface.co/GoodhopeTechnologies/embeddinggemma-300m-mirror
- Repositorio original: https://huggingface.co/litert-community/embeddinggemma-300m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
