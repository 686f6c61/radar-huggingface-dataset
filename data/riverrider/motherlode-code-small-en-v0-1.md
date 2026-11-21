# RiverRider/motherlode-code-small-en-v0.1

## Resumen

`motherlode-code-small-en-v0.1` es un modelo de embeddings de 33,4 millones de parámetros desarrollado por RiverRider, especializado en recuperación de código (code retrieval) y búsqueda semántica sobre repositorios. Se construye como un finetune de `BAAI/bge-small-en-v1.5`, del que hereda arquitectura BERT, tokenizador y salida CLS de 384 dimensiones, por lo que es intercambiable en cualquier pipeline donde ya funcione bge-small sin cambios de integración.

El modelo se obtiene mediante un *model soup*: la media parámetro a parámetro de dos finetunes del modelo base, uno entrenado para localizar el fichero de código que un issue de GitHub requiere modificar y otro entrenado para reproducir la geometría de `gte-modernbert-base`, un modelo 4,5 veces mayor. El objetivo declarado es mejorar la recuperación de ficheros relevantes en tareas tipo SWE-bench manteniendo el coste de inferencia de un modelo pequeño.

Es relevante ahora porque demuestra que técnicas de destilación geométrica y mezcla de pesos pueden cerrar parte de la brecha con modelos mucho mayores en tareas de code search, con evidencia por instancia publicada y comparaciones pareadas con tests de signo. No es un modelo generativo: es un encoder de embeddings para similitud semántica, orientado a indexación y búsqueda, no a generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), basada en BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncado en transformers.js; el pipeline de referencia corta en 510 y añade tokens especiales) |
| Tipos de cuantizacion | f16 (GGUF publicado); int4 mencionado en la ruta de evaluación del motor Black Window; ONNX y safetensors disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | BUSL-1.1 (Business Source License 1.1, etiquetada como "other") |
| Formato de pesos | safetensors, ONNX, GGUF (f16) |
| Dimension de embedding | 384 (salida CLS) |
| Pooling | CLS, con normalización L2 |
| Prompts de query/passage | ninguno (a diferencia de otros modelos BGE) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder BERT de 33,4 M de parámetros con tokenizador y salida CLS de 384 dimensiones idénticos a `bge-small-en-v1.5`. El modelo final no se entrena directamente: es una media parámetro a parámetro (*model soup*) de dos finetunes del mismo modelo base. El primero se entrena para la tarea de localizar el fichero que un issue de GitHub necesita cambiar; el segundo se entrena para reproducir la geometría de embeddings de `gte-modernbert-base`, un modelo de mayor tamaño, lo que actúa como una forma de destilación geométrica.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO (no aplicables en un encoder de similitud, pero no se detalla el proceso de optimización). La model card sí documenta el proceso de evaluación con comparaciones pareadas por ítem, tests de signo exactos bilaterales y artefactos por instancia publicados en un dataset de evidencia. También se publican tres vectores de centrado (media sobre código, sobre captions COCO y sobre prosa de wikitext-103) para corregir la anisotropía de los embeddings cuando importa la magnitud de las puntuaciones.

## Capacidades

- Generación de embeddings de texto y código para similitud semántica y recuperación.
- Búsqueda de código (code search) y recuperación de ficheros relevantes para un issue.
- Recuperación de pasajes en dominios científicos (evaluado en scifact).
- Recuperación multimodal texto-imagen vía embeddings de captions (evaluado en COCO captions).
- Compatible con `sentence-transformers` (versiones 5.1.0 y 6.0.1 probadas).
- Compatible con `transformers.js` 3.7.1 para inferencia en navegador o Node.
- Compatible con llama.cpp mediante GGUF f16 con pooling CLS.
- Compatible con text-embeddings-inference y endpoints compatibles.
- Centrado opcional mediante vectores medios publicados para calibración de umbrales.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un encoder.

## Casos de uso

- Búsqueda de código en repositorios: indexar todos los ficheros de un repositorio y recuperar los más relevantes para una consulta en lenguaje natural, usando los 384 dims y la normalización L2 para similitud coseno. Adecuado por su rendimiento en CoIR (nDCG@10 de 0,5758 frente a 0,4673 de bge-small).
- Triaje de issues en GitHub: dado un issue, rankear los ficheros del repositorio que probablemente requieran cambios, como en la tarea de SWE-bench Verified donde obtiene 178 aciertos frente a 145 de bge-small en 411 instancias.
- Asistente de documentación técnica: indexar documentación y código para responder consultas de desarrolladores con recuperación aumentada, aprovechando el contexto de 512 tokens por pasaje.
- Deduplicación y clustering de código: generar embeddings de fragmentos de código para agrupar funciones similares o detectar duplicados en bases de código grandes.
- Búsqueda semántica en navegador: desplegar con transformers.js 3.7.1 para búsqueda local sin servidor, con la salvedad del truncado a 512 tokens y la pérdida del [SEP] final.
- Recuperación en pipelines RAG sobre repositorios: usar como retriever en sistemas de pregunta-respuesta sobre código, con centrado opcional para calibrar umbrales de relevancia.
- Búsqueda de pasajes científicos: recuperación sobre abstracts (evaluado en scifact con nDCG@10 de 0,7150 en crudo).

## Benchmarks y rendimiento

| Benchmark | Poblacion | Este modelo | bge-small-en-v1.5 | Diferencia pareada |
|---|---|---|---|---|
| SWE-bench Verified, recall@1, pipeline base float32 512 tokens | 411 instancias | 178 | 145 | +0,0803 (61 victorias, 28 derrotas, p=0,00061) |
| SWE-bench Verified, mismo pipeline | 500 instancias | 219 | 181 | 73 victorias, 35 derrotas, p=0,00033 |
| SWE-bench Verified, ruta del motor Black Window, filas int4 | 411 instancias | 230 | 192 | +0,0925 (67 victorias, 29 derrotas, p=0,00013) |
| SWE-bench Verified, misma ruta | 500 instancias | 278 | 230 | 82 victorias, 34 derrotas, p=0,00001 |
| SWE-bench Verified, media de código propia | 411 instancias | 221 | 180 | +0,0998 (70 victorias, 29 derrotas, p=0,00005) |
| CoIR, nDCG@10 | 144.461 queries | 0,5758 | 0,4673 | no disponible |
| scifact, nDCG@10 (crudo) | no disponible | 0,7150 | no disponible | no disponible |
| scifact, nDCG@10 (centrado) | no disponible | 0,7093 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (33,4 M de parámetros, ~134 MB de pesos), menos de 70 MB en f16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, e incluso en CPU.
- Cabe en cualquier GPU consumer y en CPU para volúmenes moderados de indexación.
- Opciones de despliegue: `sentence-transformers` (5.1.0 y 6.0.1), `transformers.js` 3.7.1, llama.cpp (commit 465e49b9c para el GGUF f16), text-embeddings-inference y endpoints compatibles.
- Latencia y throughput: no se publican cifras de latencia o throughput en la información disponible. El tamaño reducido sugiere inferencia en milisegundos por lote en GPU consumer, pero no hay medición oficial.
- Precisión numérica: el GGUF f16 iguala a PyTorch float32 con coseno mínimo de 0,9999957 sobre 2.000 textos; transformers.js iguala a PyTorch con coseno mínimo de 0,99999988 sobre 200 textos usando la ruta `embedKeepSep`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | CoIR nDCG@10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| motherlode-code-small-en-v0.1 | 33,4 M | 512 | 384 | 0,5758 | BUSL-1.1 | Hugging Face, ONNX, GGUF |
| BAAI/bge-small-en-v1.5 | 33,4 M | 512 | 384 | 0,4673 | MIT | Hugging Face, amplia adopción |
| gte-modernbert-base | ~150 M (4,5x) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| CompendiumLabs/bge-small-en-v1.5-gguf | 33,4 M | 512 | 384 | no disponible | no disponible | GGUF f16 |

La comparación principal es con bge-small-en-v1.5, del que hereda arquitectura y tokenizador. La mejora en CoIR (+0,1085 nDCG@10) y en SWE-bench recall@1 (+0,08 a +0,10 según configuración) es consistente y estadísticamente significativa en las comparaciones pareadas publicadas. Frente a gte-modernbert-base, el modelo busca aproximar su geometría con 4,5 veces menos parámetros, aunque no se publican métricas directas de esa comparación.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Es un encoder de similitud, no un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso.
- Contexto limitado a 512 tokens por pasaje; textos más largos se truncan. En transformers.js 3.7.1 se pierde el token [SEP] final, con coseno mínimo de 0,99640 frente a PyTorch en textos largos.
- Licencia BUSL-1.1: restricciones para uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de desplegar en producción.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí puede recuperar pasajes irrelevantes con alta similitud coseno si no se calibra el umbral.
- Los embeddings presentan anisotropía: la media de cosenos crudos es 0,2192 sobre pasajes de código, lo que puede inflar similitudes. El centrado corrige esto pero no mejora el ranking (en scifact cuesta 0,0057 nDCG@10).
- Un vector de centrado ajustado en un dominio subcorrige otro: sobre captions COCO, el coseno medio es 0,2865 tras el centrado con media de código y 0,0286 tras el centrado con media de captions.
- El modelo es un *model soup*; no se documentan sesgos específicos más allá de los heredados del corpus de entrenamiento (no detallado).
- No se publican datos sobre composición del dataset de entrenamiento ni número de tokens, lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RiverRider/motherlode-code-small-en-v0.1
- Dataset de evidencia por instancia: https://huggingface.co/datasets/RiverRider/motherlode-code-small-en-v0.1-evidence
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Modelo de referencia geométrica: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- GGUF de referencia para comparación: https://huggingface.co/CompendiumLabs/bge-small-en-v1.5-gguf
- Paper citado (arXiv:2407.02883): https://arxiv.org/abs/2407.02883
- Repositorio llama.cpp (commit 465e49b9c): https://github.com/ggml-org/llama.cpp
- Librería sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Librería transformers.js: https://github.com/huggingface/transformers.js
