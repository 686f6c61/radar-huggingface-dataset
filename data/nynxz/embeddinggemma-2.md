# nynxz/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings desarrollado por Google que proyecta texto e imágenes a un espacio vectorial compartido, lo que permite tareas de similitud semántica y recuperación multimodal (image-text-retrieval). La ficha que nos ocupa, `nynxz/embeddinggemma-2`, no es un modelo nuevo sino un reempaquetado del original de Google para su uso dentro de ComfyUI, distribuido como un único fichero safetensors.

El reempaquetado conserva únicamente las torres de texto y visión del modelo original y descarta la torre de audio (aproximadamente 440 millones de parámetros, 0,91 GB). Los pesos, los tensores en bf16 y los nombres de clave son idénticos a los de `google/embeddinggemma-2`; el autor declara que las salidas coinciden con el modelo original a través de `transformers` (coseno 1.0000 en texto y 0.9999 en imágenes).

Su relevancia es práctica: facilita la integración del modelo en flujos de ComfyUI mediante el nodo `ComfyUI-EmbeddingQuery`, que permite hacer búsqueda semántica sobre carpetas de entrada y salida mezclando texto e imágenes en un mismo espacio de embeddings. El repositorio no incluye información sobre arquitectura interna, dimensión de embedding ni longitud de contexto, por lo que esos datos figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings multimodal texto-imagen; torres de texto y visión, sin torre de audio) |
| Parametros totales | no disponible (la torre de audio descartada supone ≈440M parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (único formato distribuido en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`text_encoders/embeddinggemma_2_bf16.safetensors`), con tokenizer embebido como tensor uint8 `tokenizer_json` |
| Tamano del repositorio | 0.9 GB |
| Modelo base | google/embeddinggemma-2 |
| Pipeline | sentence-similarity |
| Libreria | comfyui |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original en la documentación proporcionada. Por la naturaleza del pipeline (`sentence-similarity`) y las etiquetas del repositorio (`embeddings`, `image-text-retrieval`), se trata de un modelo de representación que genera embeddings conjuntos para texto e imagen, con dos torres (texto y visión) que comparten espacio vectorial. El reempaquetado elimina la torre de audio del modelo original.

Tampoco se detallan los datos de entrenamiento (número de tokens, composición del corpus) ni si hubo fases de RLHF o DPO, algo esperable en un modelo de embeddings pero no confirmado en la información disponible. La innovación técnica documentada en este repositorio es exclusivamente de empaquetado: la inclusión del tokenizer dentro del propio fichero safetensors como tensor `tokenizer_json`, siguiendo el patrón de los ficheros Gemma 4 de ComfyUI, lo que evita dependencias externas al cargar el modelo en ese entorno.

## Capacidades

- Generación de embeddings de texto para similitud semántica y búsqueda.
- Generación de embeddings de imagen en el mismo espacio vectorial que el texto (image-text-retrieval).
- Búsqueda semántica multimodal: consultas de texto sobre un corpus de imágenes y viceversa.
- Integración nativa con ComfyUI a través del nodo `ComfyUI-EmbeddingQuery`.
- Carga autocontenida: tokenizer embebido en el fichero de pesos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, thinking mode ni procesamiento de audio (la torre de audio fue eliminada en este reempaquetado).

## Casos de uso

- Búsqueda semántica sobre carpetas de salida de ComfyUI: el nodo `ComfyUI-EmbeddingQuery` indexa las imágenes generadas y permite recuperarlas mediante consultas en lenguaje natural, usando el espacio de embeddings compartido texto-imagen.
- Organización de bibliotecas de imágenes generadas: agrupar o filtrar resultados por similitud semántica con una descripción textual, sin depender de metadatos o nombres de fichero.
- Recuperación de referencias visuales: localizar imágenes de entrada similares a una descripción o a otra imagen para reutilizarlas en nuevos flujos de trabajo dentro de ComfyUI.
- Deduplicación y clustering de outputs: calcular similitudes entre embeddings de imágenes para detectar resultados redundantes en lotes grandes de generación.
- Búsqueda de prompts y recetas: indexar descripciones textuales de prompts y recuperar las más cercanas semánticamente a una consulta, usando la torre de texto.
- Prototipado de sistemas RAG multimodales: emplear el modelo como codificador de recuperación en pipelines que combinen documentos textuales e imágenes, gracias a la licencia Apache 2.0 y a la disponibilidad de pesos en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento declarado por el autor es la equivalencia de salidas con el modelo original de Google a través de `transformers`: similitud coseno de 1.0000 para texto y 0.9999 para imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 0,9 GB en bf16; en la práctica se necesita margen adicional para activaciones y el resto del grafo de ComfyUI, pero no se dispone de cifras oficiales.
- GPU recomendadas: no disponible en la documentación.
- Compatibilidad con GPU de consumo: el tamaño del fichero (0,9 GB) sugiere que cabe en GPUs de consumo con suficiente VRAM libre, aunque no se confirma oficialmente.
- Opciones de despliegue: ComfyUI (vía `ComfyUI-EmbeddingQuery`); el modelo original puede ejecutarse con `transformers` según el autor, pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de arquitectura, contexto ni benchmarks del modelo original ni de alternativas, por lo que no es posible establecer una comparación rigurosa con otros modelos de embeddings multimodales.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado, no un modelo entrenado por el autor; cualquier limitación del modelo original de Google aplica igualmente aquí.
- La torre de audio ha sido eliminada, por lo que no puede usarse para tareas de recuperación o similitud con audio.
- No se documentan sesgos conocidos, riesgo de alucinación (limitado en un modelo de embeddings, pero relevante en la recuperación) ni limitaciones de idioma; los idiomas soportados figuran como no disponibles.
- No se especifican la dimensión de embedding ni la longitud máxima de contexto, datos críticos para dimensionar índices y pipelines de recuperación.
- Licencia Apache 2.0, que permite uso comercial; debe conservarse la atribución a Google como autor del modelo original y consultarse la model card original para los términos de uso previsto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026; conviene verificar la integridad de los pesos frente al original antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nynxz/embeddinggemma-2
- Modelo original: https://huggingface.co/google/embeddinggemma-2
- Nodo de ComfyUI: https://github.com/Nynxz/ComfyUI-EmbeddingQuery
