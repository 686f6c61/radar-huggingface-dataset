# Q-P1NG/multilingual-reranker-small-GGUF

## Resumen
multilingual-reranker-small es un cross-encoder multilingüe de 140.641.921 parámetros (141M) construido sobre la arquitectura mmBERT-small, desarrollado por Horizon-Labs y empaquetado en formato GGUF por Q-P1NG para su uso con llama.cpp. Su función es puntuar la relevancia de un pasaje respecto a una consulta, lo que lo convierte en la segunda etapa de un pipeline de recuperación de información (RAG): tras un primer paso de búsqueda híbrida (BM25 más embeddings), el reranker reordena los candidatos y coloca los más relevantes en las primeras posiciones.

La versión publicada es un GGUF cuantizado a Q8_0 (164.358.208 bytes, unos 0,2 GB de repositorio), con licencia Apache-2.0 y soporte declarado para italiano, inglés, alemán, francés, español y portugués. El modelo base fue entrenado con texto web de licencia abierta (FineWeb, FineWeb-2), MIRACL y WebFAQ, con etiquetas generadas por Qwen3-Reranker-4B.

Es relevante ahora porque demuestra que un reranker de 141M puede mejorar de forma medible la precisión de un sistema de búsqueda documental sobre hardware de consumo: en la evaluación publicada por el autor, Hit@1 subió de 25 a 31 en CPU de portátil y de 28 a 33 en un Pixel, procesando diez pasajes en torno a un segundo o dos. Frente a alternativas como jina-reranker-v2-base-multilingual, ofrece un tamaño mucho menor y despliegue local sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre mmBERT-small (transformer, encoder bidireccional) |
| Parametros totales | 140.641.921 (141M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (única publicada); el original admite F16 según la model card |
| Idiomas soportados | multilingual, it, en, de, fr, es, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento
El modelo es un cross-encoder: recibe conjuntamente la consulta y el pasaje en una única secuencia con el formato `[BOS] question [EOS] passage [EOS]` y produce un logit de relevancia (a mayor valor, mayor pertinencia; aplicando sigmoid se obtiene una puntuación entre 0 y 1). Se apoya en mmBERT-small, un encoder tipo BERT multilingüe de 141M parámetros. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp y requirió ajustar la clave de metadatos `tokenizer.ggml.metaspace.prepend_scheme` a `first` en lugar de `always`, ya que llama.cpp rechaza `always` para vocabularios BPE y, al tokenizar consulta y pasaje por separado, ambas opciones producen los mismos tokens.

Los datos de entrenamiento del modelo original proceden de texto web con licencia abierta (FineWeb y FineWeb-2, ODC-BY), MIRACL (Apache-2.0) y WebFAQ (CC-BY-4.0). Las etiquetas de entrenamiento se generaron con Qwen3-Reranker-4B (Apache-2.0), es decir, mediante destilación de un reranker mayor. La conversión verificó la equivalencia con transformers usando las bases RoPE propias del modelo: tokens idénticos y puntuaciones con diferencias inferiores a 0,002 en F16 y 0,06 en Q8_0.

## Capacidades
- Puntuación de relevancia consulta-pasaje (text-ranking) para reordenar resultados de búsqueda.
- Funcionamiento como segunda etapa de pipelines RAG tras búsqueda léxica (BM25) o densa (embeddings).
- Soporte multilingüe en italiano, inglés, alemán, francés, español y portugués, con capacidad declarada multilingual.
- Integración con llama.cpp mediante pooling `rank` (por ejemplo `llama-server -m ... --reranking`).
- Inferencia en CPU sin GPU, con latencias de aproximadamente 1 segundo para diez pasajes en portátil y dentro de 2 segundos en un Pixel.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y tarea `feature-extraction` en el pipeline de Hugging Face.
- No dispone de generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un modelo de scoring.

## Casos de uso
- Reordenación en pipelines RAG: tras una búsqueda híbrida BM25 más embeddings, el modelo puntúa los diez o veinte candidatos y coloca los más relevantes primero, mejorando el Hit@1 antes de enviar el contexto a un LLM generador.
- Búsqueda documental local en portátiles: al ejecutarse en CPU con llama.cpp, permite montar un buscador sobre PDFs o archivos internos sin GPU ni servicios en la nube, con latencia de alrededor de un segundo para diez pasages.
- Asistentes de consulta sobre normativa multilingüe: con soporte para es, en, de, fr, it y pt, puede ordenar pasajes de documentación legal o técnica en varios idiomas dentro de una misma organización.
- Aplicaciones móviles offline: la medición en un Pixel (de 28 a 33 de Hit@1, en menos de 2 segundos) respalda su uso en clientes móviles con búsqueda semántica local.
- Filtrado de resultados en motores de búsqueda internos: actúa como capa de precisión entre el índice y la interfaz, descartando pasajes poco relevantes antes de mostrarlos al usuario.
- Evaluación y ajuste de sistemas de recuperación: al devolver puntuaciones continuas (logit o probabilidad vía sigmoid), sirve para medir la calidad de un índice o comparar estrategias de chunking.
- Deduplicación y selección de contexto para LLM: ordena y recorta los fragmentos recuperados para ajustar el contexto enviado al modelo generador y reducir coste de tokens.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible. La única medición aportada por el autor es una evaluación propia de recuperación:

| Escenario | Metrica | Antes del reranker | Despues del reranker |
|---|---|---|---|
| 35 preguntas en italiano sobre 2 PDFs (194 paginas), CPU de portatil | Hit@1 sobre 10 pasajes | 25 | 31 |
| 35 preguntas en italiano sobre 2 PDFs (194 paginas), Pixel | Hit@1 sobre 10 pasajes | 28 | 33 |

El coste medido es de aproximadamente 1 segundo para diez pasajes en CPU de portátil y dentro de 2 segundos en un Pixel. No hay datos de throughput en GPU ni de latencia con lotes mayores.

## Requisitos de hardware
- VRAM estimada: no aplica en la práctica; el GGUF Q8_0 ocupa unos 164 MB, por lo que la inferencia cabe en RAM de CPU sin GPU dedicada.
- GPU recomendadas: no disponibles en la información; el modelo está pensado para llama.cpp y funciona en CPU. Cualquier GPU consumer con unos pocos cientos de MB libres podría alojarlo, pero no hay datos publicados al respecto.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) por tamaño, aunque el caso de uso declarado es CPU y móvil.
- Opciones de despliegue: llama.cpp con pooling `rank` (`llama-server -m multilingual-reranker-small-v1.2-Q8_0.gguf --reranking`); el modelo base puede ejecutarse con transformers.
- Latencia y throughput: alrededor de 1 segundo para diez pasajes en CPU de portátil y menos de 2 segundos en un Pixel; sin datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Q-P1NG/multilingual-reranker-small-GGUF | 141M | no disponible | it, en, de, fr, es, pt | Apache-2.0 | GGUF para llama.cpp |
| jinaai/jina-reranker-v2-base-multilingual | no disponible en la informacion | no disponible | multilingüe | no disponible en la informacion | transformers; existe GGUF de terceros (gpustack) |
| Qwen3-Reranker-4B (modelo docente) | 4B | no disponible | multilingüe | Apache-2.0 | transformers y variantes GGUF |

El modelo de Q-P1NG destaca por su tamaño reducido (141M) y su despliegue en CPU, mientras que jina-reranker-v2-base-multilingual es una alternativa de Jina AI ampliamente usada como reranker transformer multilingüe, y Qwen3-Reranker-4B es el modelo docente que generó las etiquetas de entrenamiento, con mucha mayor capacidad pero también mucho mayor coste de inferencia.

## Limitaciones y advertencias
- Solo puntua relevancia: no genera texto, no razona y no soporta tool calling ni agentes.
- La evaluación publicada se limita a 35 preguntas en italiano sobre dos PDFs; no hay evidencia de rendimiento en otros idiomas ni en dominios distintos.
- La longitud máxima de contexto no está documentada; pasajes largos podrían truncarse sin que se especifique el límite.
- Riesgo de alucinación no aplica directamente al no generar texto, pero las puntuaciones pueden ser poco fiables fuera del dominio de entrenamiento (texto web, MIRACL, WebFAQ).
- Las etiquetas de entrenamiento provienen de un modelo mayor (Qwen3-Reranker-4B), por lo que hereda sus sesgos de anotación.
- Solo se publica la cuantización Q8_0; no hay variantes Q4 o Q5 para reducir aún más el tamaño.
- La licencia Apache-2.0 permite uso comercial, pero deben conservarse los archivos LICENSE y NOTICE del modelo original y respetarse las licencias de los datos de entrenamiento (ODC-BY, CC-BY-4.0).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto GGUF.

## Enlaces
- Modelo GGUF: https://huggingface.co/Q-P1NG/multilingual-reranker-small-GGUF
- Modelo base: https://huggingface.co/Horizon-Labs/multilingual-reranker-small
- jina-reranker-v2-base-multilingual: https://huggingface.co/jinaai/jina-reranker-v2-base-multilingual
- GGUF de jina-reranker-v2 (gpustack): https://huggingface.co/gpustack/jina-reranker-v2-base-multilingual-GGUF
