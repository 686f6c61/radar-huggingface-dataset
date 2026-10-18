# ngoan/anchored-embeddinggemma-2-vi

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido código), imágenes, vídeo y audio —y combinaciones de ellos— en un espacio vectorial unificado de 768 dimensiones. El modelo completo declara 740M de parámetros: un backbone de texto de 270M (130M de transformer más 140M de embedder) y encoders modulares de visión (170M) y audio (300M) que pueden cargarse de forma selectiva. Está diseñado para ejecutarse en hardware de consumo, incluidos portátiles y dispositivos móviles, con el objetivo de ofrecer representaciones semánticas de baja latencia para búsqueda, RAG, clasificación y clustering en el propio dispositivo.

El repositorio `ngoan/anchored-embeddinggemma-2-vi` publica un checkpoint derivado bajo licencia Apache 2.0, etiquetado como multilingüe y orientado a `feature-extraction`, con 271.002.648 parámetros reales en safetensors (0,6 GB). Esa cifra coincide con el backbone de texto más el embedder del modelo original, no con los 740M totales, lo que sugiere que el repositorio contiene únicamente la parte textual. El sufijo `vi` y el término `anchored` apuntan a un ajuste orientado a vietnamita, pero la model card publicada es una copia literal de la de Google y no documenta ningún proceso de anclaje, fine-tuning ni evaluación propia.

La relevancia actual del modelo base está en su combinación de multilingüismo (más de 100 idiomas), contexto de 8192 tokens, soporte nativo de Matryoshka Representation Learning (128/256/512/768 dimensiones) y una mejora de aproximadamente el 14% en tareas de código respecto a EmbeddingGemma 1. El checkpoint de este repositorio, sin embargo, carece de validación independiente: 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en Gemma 4; backbone de texto 130M + embedder 140M; encoders modulares de visión (170M) y audio (300M) |
| Parámetros totales | 740M según la model card (modelo completo); el checkpoint de este repositorio contiene 271.002.648 parámetros (~271M, solo texto) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens; ventana deslizante local de 1024 tokens |
| Tipos de cuantización | No se distribuyen variantes cuantizadas en el repositorio (solo safetensors). Cuantificable a INT8/INT4 con herramientas estándar (bitsandbytes, ONNX Runtime, OpenVINO) |
| Idiomas soportados | Multilingüe: más de 100 idiomas, incluido código |
| Licencia | Apache 2.0 (la model card enlaza además a la licencia de Gemma 4, discrepancia a verificar) |
| Formato de pesos | Safetensors (librería `transformers`) |
| Dimensión de salida | 768 nativa; truncable a 512, 256 y 128 mediante MRL |
| Capas | 24 |
| Dimensión del modelo | 512 (hidden 2048) |
| Cabezas de atención | 4 cabezas; KV-heads 2 locales / 1 global (GQA/MQA), ratio local:global 5:1 |
| Vocabulario | 262.144 tokens |
| Pooling | Mean pooling + proyección 512→768 |
| Modalidades | Texto, imágenes, vídeo y audio (según model card; no verificable en este checkpoint) |
| Pipeline | `feature-extraction` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder derivada de Gemma 4, con 24 capas, dimensión de modelo 512 y dimensión oculta 2048. La atención combina capas locales con ventana deslizante de 1024 tokens y capas globales en una proporción 5:1, usando GQA/MQA con 4 cabezas de consulta y 2/1 cabezas KV (local/global). La FFN es gated con activación GELU. La representación final se obtiene por mean pooling y una capa de proyección de 512 a 768 dimensiones. El diseño modular separa el backbone de texto (130M) del embedder (140M) y de los encoders de visión (170M) y audio (300M), de modo que se pueden cargar solo las modalidades necesarias y reducir el uso de memoria.

El modelo incorpora Matryoshka Representation Learning de forma nativa, lo que permite truncar los vectores a 128, 256 o 512 dimensiones y renormalizarlos, con una reducción de almacenamiento de hasta 6x y una pérdida de calidad contenida hasta 256 dimensiones. También emplea prefijos de instrucción textuales ligeros para orientar las representaciones a distintas tareas (búsqueda, clasificación, clustering, similitud semántica).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF/DPO; la model card no los detalla. Tampoco se documenta en el repositorio qué ajuste concreto se aplicó para producir la variante `anchored-...-vi`: no hay descripción del corpus de anclaje, del idioma objetivo ni de hiperparámetros de entrenamiento.

## Capacidades

- Generación de embeddings de texto multilingüe (más de 100 idiomas) en un espacio de 768 dimensiones, con truncado MRL a 512, 256 y 128.
- Embeddings de código con mejora declarada de ~14% frente a EmbeddingGemma 1 (MTEB code v1: 78,68 NDCG@10).
- Embeddings multimodales de imagen, documento visual, vídeo y audio en el mismo espacio vectorial que el texto (según la model card del modelo base).
- Representaciones dirigidas por tarea mediante prefijos de instrucción (search, classification, clustering, similarity).
- Similitud semántica de frases y recuperación de pasajes con contexto de hasta 8192 tokens, suficiente para minutos de audio o vídeo.
- Procesamiento de secuencias largas con atención local/global, adecuado para documentos extensos.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso por sí mismo. Se usa como componente de recuperación dentro de pipelines de agentes o RAG.
- No se documentan capacidades de thinking mode, visión en el checkpoint publicado ni funciones de agente.

## Casos de uso

- Búsqueda semántica multilingüe en catálogos y bases documentales: indexar títulos y descripciones en varios idiomas en vectores de 256 dimensiones (MRL) reduce el coste de almacenamiento 3x manteniendo 60,41 de media en MTEB multilingual v2, con renormalización posterior para la comparación por similitud coseno.
- RAG en el dispositivo: con solo 271M parámetros en el checkpoint textual, el modelo cabe en menos de 1 GB en BF16, lo que permite ejecutar la recuperación en portátiles o navegador sin depender de una API, manteniendo la ventana de 8192 tokens para fragmentos largos.
- Deduplicación y clustering de corpus: los embeddings truncados a 128 dimensiones (ratio de compresión 6:1) son adecuados para agrupar millones de documentos por similitud con un coste de memoria muy contenido; la propia card restringe 128d a cargas de solo texto.
- Clasificación zero-shot por similitud: comparar embeddings de documentos con embeddings de etiquetas o prototipos permite construir clasificadores sin entrenamiento supervisado, útil para triaje de tickets o etiquetado de contenido.
- Recuperación de código en asistentes de desarrollo: el rendimiento en MTEB code v1 (78,68) permite indexar repositorios y funciones para búsqueda por intención, integrándose en herramientas de autocompletado o navegación de código.
- Memoria semántica para agentes: usar el modelo como almacén de recuperación de interacciones previas o de descripciones de herramientas, de forma que un agente seleccione la herramienta adecuada por similitud semántica en lugar de por coincidencia exacta.
- Filtrado y moderación de contenido: comparar embeddings de textos entrantes con un conjunto de referencia de contenido no deseado o duplicado, con umbrales calibrados sobre el espacio de 768 dimensiones.
- Recomendación por similitud de ítems: generar un vector por producto o artículo y resolver vecinos más cercanos en un índice ANN (FAISS, Qdrant, pgvector) para recomendaciones en tiempo real.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base (checkpoint en precisión completa, 768d). No hay evaluación independiente del checkpoint derivado de este repositorio.

| Modalidad | Benchmark | Métrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB multilingual v2 | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB code v1 | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 64,64 | no disponible |
| Imagen | MMEB v2 - Image | Mean(Task), Hit@1 | 57,28 | no disponible |
| Documento visual | MMEB v2 - VisDoc | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Vídeo | MMEB v2 - Video | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,39 | no disponible |

Resultados con truncado de vectores (MRL):

| Dimension | Compresión | MTEB multilingüe v2 | MTEB inglés v2 | MTEB code v1 | MIEB (lite) | MMEB v2 global | MSEB retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

No se han publicado resultados de benchmarks específicos del checkpoint `ngoan/anchored-embeddinggemma-2-vi` en la información disponible.

## Requisitos de hardware

- Pesos del checkpoint publicado (271.002.648 parámetros): ~1,08 GB en FP32, ~542 MB en BF16/FP16, ~271 MB en INT8.
- VRAM estimada para inferencia: 2-4 GB con lotes pequeños a longitud máxima de 8192 tokens (pesos más activaciones y buffers de atención); en torno a 1 GB para secuencias cortas en BF16.
- GPU recomendadas: cualquier GPU con 4 GB o más para inferencia interactiva (T4, L4, RTX 3050/3060/4060/4090). A100/H100 solo aportan ventaja en indexación masiva por lotes o cuando se cargan también los encoders de visión y audio del modelo completo (740M).
- Cabe en GPU de consumo: sí, de forma holgada. También es viable en CPU (2-3 GB de RAM) y en iGPU para cargas de baja concurrencia.
- Opciones de despliegue: `sentence-transformers` y `transformers` (vía oficial de la model card), Text Embeddings Inference (TEI) para servir embeddings, vLLM en modo embedding para alto throughput, y exportación a ONNX/OpenVINO para CPU.
- llama.cpp y Ollama: no se publica ninguna conversión a GGUF en el repositorio; requeriría conversión manual del checkpoint.
- Latencia y throughput: no se han publicado cifras medidas. No se dispone de datos de tokens por segundo ni de latencia por consulta para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Dimensiones | Notas |
|---|---|---|---|---|---|---|
| Este repositorio (EmbeddingGemma 2, variante `vi`) | 271M (checkpoint) / 740M (modelo completo) | 8192 | 100+ | Apache 2.0 | 128/256/512/768 (MRL) | Solo texto en el checkpoint; multimodal en el modelo base; sin benchmarks propios |
| EmbeddingGemma 1 | ~308M | 2048 | 100+ | Licencia Gemma | 768 (MRL) | Base de la comparación de la card; MTEB multilingual v2 61,15 y code v1 68,76 |
| BGE-M3 | ~568M | 8192 | 100+ | MIT | 1024 | Salidas densas, dispersas y multi-vector; sin modalidad de audio o vídeo |
| multilingual-e5-large | ~560M | 512 | 100 | MIT | 1024 | Contexto corto; requiere prefijos `query:`/`passage:` |

Frente a BGE-M3 y multilingual-e5-large, el modelo destaca por tamaño (menos de la mitad de parámetros en el checkpoint textual), contexto de 8192 tokens y soporte MRL nativo, además de la promesa multimodal del modelo completo. En contra, BGE-M3 y e5 cuentan con amplia validación comunitaria y de terceros, mientras que este checkpoint no tiene descargas ni evaluaciones publicadas. No se dispone de datos comparativos directos de este checkpoint frente a las alternativas.

## Limitaciones y advertencias

- La model card del repositorio es una copia literal de la de `google/embeddinggemma-2`; no documenta el proceso de "anchoring", el corpus utilizado ni el idioma objetivo, por lo que no es posible verificar qué diferencia este checkpoint del original.
- El recuento real de parámetros (271M) no coincide con los 740M declarados en la card: es probable que falten los encoders de visión (170M) y audio (300M). Las capacidades multimodales, de vídeo y de audio no deben asumirse para este repositorio.
- No hay resultados de benchmarks propios ni evaluaciones de terceros. Las cifras de la sección anterior corresponden al modelo base de Google y podrían no reproducirse en este checkpoint.
- Cero descargas y cero likes en el momento de la consulta: no existe señal de uso ni validación por parte de la comunidad.
- Licencia: la card declara Apache 2.0 pero enlaza a la licencia de Gemma 4. Conviene verificar los términos aplicables antes de un uso comercial en producción.
- Al ser un modelo de embeddings y no generativo, el riesgo no es la alucinación de texto sino los falsos positivos en recuperación: umbrales de similitud mal calibrados producen pasajes irrelevantes que, en un pipeline RAG, acaban condicionando la respuesta del modelo generador.
- Sesgos heredados de los datos de preentrenamiento web, con cobertura desigual entre idiomas: el rendimiento en lenguas de bajos recursos (incluido el vietnamita, supuesto objetivo de esta variante) no está medido ni documentado.
- La atención es mayoritariamente local (ventana de 1024 con ratio 5:1): en documentos de 8192 tokens puede perder dependencias de largo alcance frente a modelos con atención global completa.
- El truncado a 128 dimensiones degrada notablemente el rendimiento (MTEB multilingüe cae a 57,89 y MMEB v2 global a 45,65); la propia card lo restringe a cargas de solo texto.
- Requiere aplicar la capa de pooling y normalización correctas; un uso directo con `transformers` sin el módulo de sentence-transformers puede producir embeddings no comparables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ngoan/anchored-embeddinggemma-2-vi
- Modelo base en HuggingFace: https://huggingface.co/google/embeddinggemma-2
- Organización GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentación: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia referenciada en la card: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
