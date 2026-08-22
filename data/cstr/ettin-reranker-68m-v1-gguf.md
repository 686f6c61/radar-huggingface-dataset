# cstr/ettin-reranker-68m-v1-GGUF

## Resumen

Ettin Reranker 68M es un modelo cross-encoder de reranking desarrollado por el equipo de cross-encoder, con cuantizaciones GGUF publicadas por el usuario cstr bajo el nombre `cstr/ettin-reranker-68m-v1-GGUF`. Está construido sobre la arquitectura ModernBERT, con 68,6 millones de parámetros, y ha sido destilado a partir de `mxbai-rerank-large-v2` para ofrecer un equilibrio entre latencia y calidad en tareas de reranking. Este modelo resuelve el problema de ordenar documentos o fragmentos de texto según su relevancia respecto a una consulta, una operación crítica en sistemas de recuperación aumentada por generación (RAG), búsqueda semántica y filtrado de resultados.

La versión GGUF permite desplegar el modelo en entornos ligeros, con cuantizaciones Q8_0 y Q4_K que reducen el tamaño a 75 MB y 54 MB respectivamente, manteniendo una licencia Apache-2.0 que autoriza el uso comercial. Su arquitectura de 19 capas y 512 unidades ocultas lo convierte en una opción adecuada para cargas de producción sensibles a la latencia, donde se necesita un reranker de tamaño medio sin sacrificar demasiado rendimiento. El modelo está disponible en Hugging Face bajo el repositorio `cstr/ettin-reranker-68m-v1-GGUF`, con soporte de la librería CrispEmbed para su conversión y uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (19 capas, 512 hidden) con clasificador Dense(512→512, GELU) → LayerNorm → Dense(512→1) |
| Parametros totales | 68.864.904 (68,6 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 7999 tokens (según MTEB) |
| Tipos de cuantizacion | F32 (275 MB), Q8_0 (75 MB), Q4_K (54 MB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT, un encoder de tipo transformer bidireccional optimizado para eficiencia. El head de clasificación consiste en dos capas densas con activación GELU y normalización de capa, que produce una puntuación única para cada par de textos. El tokenizador es GPT-2 ByteLevel BPE con un vocabulario de 50368 tokens. El modelo original `cross-encoder/ettin-reranker-68m-v1` fue entrenado a partir del encoder `jhu-clsp/ettin-encoder-68m` mediante fine-tuning sobre el dataset `cross-encoder/ettin-reranker-v1 data`, utilizando la librería Sentence Transformers. Según la documentación disponible, se trata de una destilación de `mxbai-rerank-large-v2`, aunque no se especifican los detalles del proceso de destilación (número de tokens, técnicas de pérdida, etc.). La conversión a GGUF se realizó con CrispEmbed, una herramienta diseñada para exportar modelos a formatos optimizados.

## Capacidades

- Reranking de pares de textos: dado un par (consulta, documento) devuelve una puntuación de relevancia, permitiendo reordenar listas de resultados.
- Búsqueda semántica: puede integrarse como etapa de reranking tras una búsqueda inicial de recuperación (por ejemplo, con embeddings densos).
- Fine-tuning ligero: al ser un modelo de 68 M parámetros, es posible ajustarlo sobre dominios específicos con recursos limitados.
- Soporte de cuantizaciones GGUF: permite ejecutar el modelo en CPU o GPU con memoria reducida, manteniendo un rendimiento razonable.
- No es un modelo generativo: no produce texto, solo puntuaciones de similitud o relevancia.
- No soporta tool calling, agentes ni razonamiento multi-paso; su función es estrictamente de clasificación de pares.

## Casos de uso

- Recuperación aumentada por generación (RAG): tras recuperar documentos candidatos mediante búsqueda vectorial, el modelo reordena los resultados por relevancia antes de pasarlos al generador, mejorando la precisión de las respuestas.
- Búsqueda semántica en bases documentales: en un motor de búsqueda interna, se puede usar como segundo paso para refinar los resultados obtenidos con embeddings, descartando falsos positivos.
- Filtrado de respuestas en chatbots: cuando un sistema genera varias respuestas candidatas, el reranker puntúa cada una para seleccionar la más coherente con la consulta del usuario.
- Clasificación de pares pregunta-respuesta: en foros o sistemas de soporte, ayuda a emparejar preguntas de usuarios con respuestas preexistentes de alta calidad.
- Moderación de contenido: puede puntuar la relevancia de textos respecto a temas específicos, ayudando a priorizar contenido para revisión manual.
- Mejora de motores de recomendación: al combinar el reranker con un sistema de recuperación, se puede refinar la lista de artículos o productos sugeridos según la consulta del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se describe como una destilación de `mxbai-rerank-large-v2`, pero no se incluyen métricas como MMLU, HumanEval, GSM8K o puntuaciones específicas de reranking (p. ej., NDCG@10). Tampoco hay comparativas cuantitativas con otros rerankers en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K, el modelo ocupa 54 MB, por lo que puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, incluidas tarjetas de gama baja como GTX 1650 o RTX 3050.
- Con Q8_0 (75 MB) y F32 (275 MB), también caben en GPU consumer, pero para F32 se recomienda al menos 512 MB de VRAM.
- GPU recomendadas: no se requiere una GPU específica; cualquier GPU moderna con soporte de CUDA o Metal es suficiente. También puede ejecutarse en CPU con llama.cpp o similar.
- Opciones de despliegue: llama.cpp, Ollama, CrispEmbed, o cualquier runtime compatible con GGUF. También se puede cargar el modelo safetensors original con Sentence Transformers para inferencia en GPU.
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un cross-encoder de 68 M, la latencia por par de textos es del orden de milisegundos en GPU, y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos de reranking de tamaño similar. La documentación menciona que el modelo pertenece a una familia que incluye variantes de 17M, 32M, 150M, 400M y 1B parámetros, pero no se aportan datos de rendimiento comparativo. Se indica que está destilado de `mxbai-rerank-large-v2`, pero sin métricas concretas. Por lo tanto, la comparativa queda pendiente de datos oficiales.

## Limitaciones y advertencias

- Modelo cross-encoder: solo puede puntuar pares de textos, no genera embeddings para un solo texto ni produce respuestas generativas. No es adecuado para tareas de generación de texto.
- Longitud de contexto limitada: el límite de 7999 tokens (según MTEB) puede ser restrictivo para documentos muy largos; es necesario truncar o dividir los textos antes de la inferencia.
- Idiomas: no se ha especificado qué idiomas soporta; se recomienda probar su rendimiento en el idioma objetivo antes de usarlo en producción.
- Riesgo de sesgos: al ser un modelo destilado, puede heredar sesgos del modelo profesor (`mxbai-rerank-large-v2`) y del dataset de entrenamiento. No se han publicado análisis de sesgos.
- Alucinación: como no genera texto, el riesgo de alucinación no es aplicable, pero sí puede producir puntuaciones erróneas si los textos de entrada no están bien formateados.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero se debe conservar el aviso de licencia y atribuir el autor original.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/cstr/ettin-reranker-68m-v1-GGUF
- Modelo base safetensors: https://huggingface.co/cross-encoder/ettin-reranker-68m-v1
- Repositorio de CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Página del modelo en Mixpeek: https://mixpeek.com/model/cross-encoder/ettin-reranker-68m-v1
- Entrada en MTEB Leaderboard: https://mteb-leaderboard.hf.space/models/cross-encoder/ettin-reranker-68m-v1
