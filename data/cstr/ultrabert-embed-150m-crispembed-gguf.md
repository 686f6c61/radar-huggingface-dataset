# cstr/UltraBERT-Embed-150M-CrispEmbed-GGUF

## Resumen

UltraBERT-Embed-150M-CrispEmbed-GGUF es una conversión a formato GGUF y cuantización parcial del modelo de embeddings de texto dmis-lab/UltraBERT-Embed-150M, desarrollado originalmente por Jungwoo Park, Taewhoo Lee y Jaewoo Kang (DMIS Lab). El artefacto lo publica el usuario cstr como parte del proyecto CrispEmbed, una implementación portable que incorpora una ruta nativa de embeddings de texto basada en UltraBERT, desactivada por defecto y marcada explícitamente como experimental.

El modelo original es un encoder de 151.032.576 parámetros que proyecta texto a vectores de 768 dimensiones, admite entradas de hasta 32K tokens y sigue instrucciones en el lado de la query. Este GGUF concreto no es un modelo generativo: es un artefacto de inferencia para similitud semántica y recuperación (retrieval), pensado para integrarse en índices vectoriales y pipelines de búsqueda.

La relevancia de esta ficha radica en su carácter de caso límite: la cuantización aplicada es muy conservadora (solo 12 tensores en Q4_K, 206 en F32) y, aun así, no supera las puertas estrictas de fidelidad vectorial del propio proyecto. Resulta útil para evaluar el compromiso entre tamaño, fidelidad de embeddings y viabilidad de despliegue en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UltraBERT), embeddings de texto |
| Parametros totales | 151.032.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32K tokens (modelo original; comportamiento en contexto largo no medido en este GGUF) |
| Tipos de cuantizacion | Q4_K parcial: 12 tensores Q4_K (FFN de las cuatro últimas capas), 206 tensores F32 |
| Idiomas soportados | inglés (modelo original); no se han medido otros idiomas en este GGUF |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`ultrabert-embed-150m-q4_k-last-four-ffn.gguf`, 576.997.440 bytes) |
| Dimension del embedding | 768 |
| Tamano del repo | 0,6 GB |
| SHA256 del fichero | `087c9be0fa50ba57db74e650889521c985d306863c94aabf731764538eb4533c` |

## Arquitectura y entrenamiento

El modelo base es UltraBERT-Embed-150M, un encoder transformer de 150M de parámetros orientado a embeddings de texto con soporte de instrucciones en la query y capacidad de embeber código además de texto natural. El modelo original reporta 67,24 de media de tarea en MTEB(eng, v2). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos corresponden a la model card upstream, que aquí solo se referencia.

Este artefacto no entrena ni ajusta nada: convierte los pesos `model.safetensors` de la revisión `367d5343b5a0164d57b810cedf5de4b8983d5984` a GGUF en F32 con el tokenizador embebido (script `models/convert-ultrabert-to-gguf.py`) y después aplica `crispembed-quantize` con una receta selectiva. Solo las matrices FFN gate/up/down de las cuatro últimas capas (12 tensores) pasan a Q4_K; el embedding de tokens, todas las matrices de atención y las FFN de las capas 0-19 permanecen en F32. El resultado es un fichero de 550,3 MiB frente a los 581,2 MiB del original, es decir, una reducción de apenas el 5,3 %.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa (pipeline `sentence-similarity`, tarea `feature-extraction`).
- Codificación de texto a vectores de 768 dimensiones.
- Soporte de instrucciones en el lado de la query en el modelo original.
- Capacidad de embeber código además de texto natural (según la model card upstream).
- Ventana de entrada de hasta 32K tokens en el modelo original.
- Compatible con endpoints (`endpoints_compatible` según los tags del repositorio).
- No es un modelo generativo: no soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar el corpus y las queries con el mismo fichero GGUF para evitar la mezcla de espacios vectoriales; la ventana de 32K permite embeber secciones largas sin trocear en exceso.
- Recuperación aumentada (RAG) en CPU: al ser un artefacto de 550 MiB con la mayor parte de tensores en F32, puede ejecutarse en servidores sin GPU, aunque el soporte es CPU-only y experimental en CrispEmbed.
- Deduplicación y clustering de textos: los vectores de 768 dimensiones permiten agrupar documentos similares; conviene re-embeder todo el corpus con este fichero si se migra desde el modelo original.
- Búsqueda de código en repositorios: el modelo base embebe código, por lo que sirve para localizar fragmentos por descripción en lenguaje natural.
- Filtrado y enrutado de consultas: usar la similitud coseno para clasificar consultas entrantes hacia el pipeline adecuado antes de invocar un modelo generativo mayor.
- Evaluación comparativa de cuantizaciones: el artefacto incluye métricas de fidelidad frente al original en SciFact, lo que lo hace útil como referencia para estudiar el impacto de cuantizaciones parciales en la calidad de recuperación.

## Benchmarks y rendimiento

Evaluación en SciFact (300 queries sobre 5.483 filas) frente al modelo original en F32 PyTorch, medida por CrispEmbed (run 40871150002, build portable, CPU x86-64):

| Metrica | Original (F32) | Q4_K (este fichero) | Diferencia |
|---|---:|---:|---:|
| Tamano | 581,2 MiB | 550,3 MiB | -30,9 MiB |
| Coseno minimo de embedding | 1 | 0,9779 | -0,0221 |
| Coseno medio de embedding | 1 | no medido | no disponible |
| nDCG@10 | 0,7667 | 0,7649 | -0,0018 |
| MRR@10 | 0,7290 | 0,7279 | -0,0011 |
| Recall@100 | 0,9750 | 0,9767 | +0,0017 |
| Acuerdo top-1 | referencia | 0,973 | -0,027 |
| Puerta estricta de vector F32 | referencia | falla (max abs normalizado 0,0282) | no disponible |

El modelo original reporta 67,24 de media de tarea en MTEB(eng, v2). No se han medido en este GGUF los backends GPU, ARM/Apple, otros corpus o idiomas, el comportamiento en contexto largo ni la latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la ruta soportada; el soporte de UltraBERT en CrispEmbed es CPU-only.
- GPU recomendadas: no disponibles; no se han medido backends GPU.
- Cabe en GPU consumer: no verificado; el tamaño del fichero (550,3 MiB) es reducido, pero la ruta de ejecución documentada es CPU.
- Despliegue: CrispEmbed con las variables `CRISPEMBED_ULTRABERT=1`, `CRISPEMBED_ULTRABERT_QUANT=1`, `CRISPEMBED_ULTRABERT_UNICODE_PRETOKEN=1` y `CRISPEMBED_ULTRABERT_TRUNCATE=1`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos.
- Almacenamiento: 576.997.440 bytes para el fichero GGUF; repositorio de 0,6 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| UltraBERT-Embed-150M (original, F32) | 151M | 32K | safetensors | Apache 2.0 | Referencia de calidad; 581,2 MiB; nDCG@10 0,7667 en SciFact |
| UltraBERT-Embed-150M-CrispEmbed-GGUF (este) | 151M | 32K (no medido) | GGUF Q4_K parcial | Apache 2.0 | Experimental; nDCG@10 0,7649; falla la puerta estricta de vector F32 |
| PhysShell/UltraBERT-Embed-150M | 151M | 32K | no disponible | no disponible | Copia del modelo base; 67,24 de media en MTEB(eng, v2) |

No se dispone de datos comparativos con otros modelos de embeddings de tamaño similar (por ejemplo, familia BGE o E5) en la información proporcionada.

## Limitaciones y advertencias

- Estado experimental: falla las puertas estrictas de fidelidad del proyecto (presupuesto de vector F32 y acuerdo top-1 ≥ 0,99); la degradación de tarea sí cumple el umbral de 0,001.
- No mezclar vectores Q4_K con vectores F32 u originales en el mismo índice: el coseno por fila puede bajar a 0,9779 y el acuerdo top-1 es 0,973. Hay que re-embeder todo el corpus con el mismo fichero usado en las queries.
- La reducción de tamaño es marginal (5,3 %), por lo que el ahorro de almacenamiento y memoria es limitado frente al riesgo de pérdida de fidelidad.
- Soporte CPU-only y desactivado por defecto en CrispEmbed; no hay validación en GPU, ARM/Apple ni otros backends.
- No se han medido otros corpus, idiomas ni comportamiento en contexto largo; el modelo original es de inglés.
- El repositorio declara Apache 2.0 pero no incluye fichero NOTICE; el `LICENSE` es el texto canónico de Apache 2.0. Uso comercial permitido con las obligaciones de atribución de la licencia.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de recuperación espuria si se mezclan espacios vectoriales o se usa fuera del dominio evaluado.
- Sesgos: no documentados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cstr/UltraBERT-Embed-150M-CrispEmbed-GGUF
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-Embed-150M/tree/367d5343b5a0164d57b810cedf5de4b8983d5984
- Copia del modelo base: https://huggingface.co/PhysShell/UltraBERT-Embed-150M
- Proyecto CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
