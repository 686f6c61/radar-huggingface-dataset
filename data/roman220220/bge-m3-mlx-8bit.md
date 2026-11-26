# roman220220/bge-m3-mlx-8bit

## Resumen

`roman220220/bge-m3-mlx-8bit` es una conversión a formato MLX con cuantización de 8 bits del modelo de embeddings multilingüe BAAI/bge-m3, desarrollado originalmente por el Beijing Academy of Artificial Intelligence (BAAI). Lo publica el usuario roman220220 (IPSupport LLC) como componente del stack de IA local LLMTray para macOS y Apple Silicon. No es un modelo nuevo: es un artefacto de despliegue optimizado para memoria en hardware Apple.

El modelo base es un transformer XLM-RoBERTa de 568 millones de parámetros (566.705.152 según los pesos safetensors) que genera embeddings densos de 1024 dimensiones con una ventana de contexto de 8192 tokens y cobertura de más de 100 idiomas. Esta build concreta conserva únicamente la cabeza densa (estado oculto del token CLS, normalizado L2); las cabezas sparse y ColBERT del BGE-M3 original no están incluidas.

Su relevancia es práctica: reduce el peso en disco de 2,27 GB (PyTorch fp32) a 610 MB manteniendo una similitud coseno media de 0,99986 frente al original en frases, 0,99975 en código y 0,99921 en textos largos, con un solapamiento top-10 del 98,5 %. Está pensado para búsqueda semántica y recuperación de documentos en local, sin salida a servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder), solo cabeza densa |
| Parametros totales | 566.705.152 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | 8 bits, group size 64 (capas lineales y word embeddings); position/token-type embeddings y layer norms en fp16 |
| Idiomas soportados | más de 100 (heredados del modelo base); no se detalla lista en la información disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (layout Hugging Face, librería MLX) |
| Dimension de embedding | 1024 |
| Tamano del repositorio | 0,6 GB |
| Modelo base | BAAI/bge-m3 (revision 5617a9f) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa, un transformer encoder multilingüe. Esta build no entrena nada: parte de los pesos de BAAI/bge-m3 y aplica cuantización de 8 bits con group size 64 sobre las capas lineales y sobre los word embeddings (250k × 1024, aproximadamente la mitad de los parámetros del modelo). Los embeddings de posición, los de tipo de token y las layer norms se mantienen en fp16. El resultado se serializa en `model.safetensors` con el layout de Hugging Face (`embeddings.*`, `encoder.layer.N.*`, sin pooler head) y un `config.json` que añade `"quantization": {"group_size": 64, "bits": 8}`.

El modelo base BGE-M3 se entrenó con objetivos múltiples (dense, sparse y multi-vector ColBERT) sobre corpus multilingües; esta conversión solo expone la salida densa. La evaluación de la cuantización se hizo con el runtime propio de LLMTray (`runtime/llmtray_embed`: loader, tokenizer, batching, CLS pooling y normalización, cómputo fp16) sobre una Apple M5, comparando contra el original en transformers con fp32. El conjunto de prueba son 12.039 textos: pares de Tatoeba en ruso, ucraniano, chino, japonés y alemán contra inglés, 1.000 funciones de la librería estándar de Python y 39 módulos completos de 5–6,5k tokens. Un detalle relevante: el tokenizer incluido no añade token para espacios finales, por lo que conviene limpiar los textos antes de codificar para que todas las implementaciones coincidan.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones, normalizados L2, para similitud semántica y recuperación.
- Búsqueda multilingüe y cross-lingual sobre más de 100 idiomas (evaluada en ruso, ucraniano, chino, japonés y alemán contra inglés).
- Recuperación sobre textos largos: soporta entradas de hasta 8192 tokens, útil para documentos completos o módulos de código.
- Recuperación de código: capaz de emparejar un docstring con el cuerpo de la función correspondiente.
- Ejecución local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- No incluye tool calling, agentes, razonamiento multi-paso ni modo thinking: es un modelo de embeddings, no generativo.
- No incluye las cabezas sparse ni ColBERT del BGE-M3 original, por lo que no permite recuperación híbrida ni multi-vector con este artefacto.

## Casos de uso

- Búsqueda semántica de documentación interna: indexar manuales o wikis corporativas y recuperar fragmentos por significado en lugar de por coincidencia léxica, aprovechando los 8192 tokens de contexto para no trocear en exceso.
- Recuperación aumentada (RAG) en local: generar embeddings de los chunks de una base de conocimiento y consultarlos desde una aplicación de escritorio en macOS sin enviar datos a terceros.
- Búsqueda de código en repositorios: localizar la función que implementa un comportamiento descrito en lenguaje natural o en un docstring, un escenario evaluado explícitamente en la model card.
- Deduplicación y agrupación de textos multilingües: calcular similitud coseno entre documentos en distintos idiomas para detectar duplicados o construir clústeres temáticos.
- Búsqueda cross-lingual en catálogos: consultar en castellano un corpus indexado en inglés, alemán o japonés, con una tasa de recuperación top-1 del 95,85 % en la evaluación de traducción.
- Asistente de memoria para aplicaciones de escritorio: mantener un almacén de recuerdos o notas del usuario y recuperar los relevantes en cada turno de conversación, que es precisamente el uso que le da LLMTray.
- Filtrado y moderación por similitud: comparar mensajes entrantes contra una lista de patrones conocidos para clasificación aproximada sin entrenar un clasificador dedicado.

## Benchmarks y rendimiento

Los datos publicados en la model card miden la fidelidad de la cuantización respecto al original, no el rendimiento absoluto en tareas estándar tipo MTEB.

| Build | Tamano | Coseno medio / mínimo (frases · código · textos largos) | Recuperación traducción | Recuperación código | Solapamiento top-10 |
|---|---|---|---|---|---|
| original (PyTorch, fp32) | 2,27 GB | — | 95,83 % | 49,7 % | — |
| bge-m3-mlx-fp16 | 1133 MB | 1,00000 / 1,0000 · 1,00000 / 0,9995 · 0,99998 / 0,9999 | 95,84 % | 49,7 % | 99,8 % |
| bge-m3-mlx-8bit | 610 MB | 0,99986 / 0,9993 · 0,99975 / 0,9990 · 0,99921 / 0,9983 | 95,85 % | 49,8 % | 98,5 % |
| bge-m3-mlx-6bit | 471 MB | 0,99792 / 0,969 · 0,99642 / 0,9933 · 0,99257 / 0,9894 | 95,84 % | 50,0 % | 94,4 % |

No se han publicado resultados de benchmarks estándar (MMLU, MTEB agregado) en la información disponible para esta build concreta. La comparación con la build GGUF Q8_0 del mismo autor indica un solapamiento top-10 del 97,1 % frente al 98,5 % de esta versión MLX.

## Requisitos de hardware

- VRAM/unified memory estimada: unos 610 MB de pesos más overhead de activaciones y tokenizer; en la práctica, menos de 1,5 GB en total para lotes pequeños.
- Cabe holgadamente en cualquier Mac con Apple Silicon (M1 en adelante); la evaluación se realizó en una Apple M5.
- No está pensado para GPU NVIDIA: el formato es MLX y requiere el runtime de Apple. Para CUDA existen alternativas en PyTorch o GGUF.
- Despliegue: runtime MLX (por ejemplo, el loader de LLMTray o `mlx` directamente). Para llama.cpp existe la build GGUF del mismo autor (`roman220220/bge-m3-GGUF`). vLLM y TGI no soportan este formato.
- Latencia y throughput: no se publican cifras concretas de tokens por segundo en la información disponible; solo se indica que el cómputo se hace en fp16 sobre Apple M5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| bge-m3-mlx-8bit (este) | 566,7 M | 8192 | 1024 | MIT | MLX, Apple Silicon |
| BAAI/bge-m3 (original) | 568 M | 8192 | 1024 | MIT | PyTorch safetensors, multiplataforma |
| bge-m3-mlx-fp16 | 568 M | 8192 | 1024 | MIT | MLX, 1133 MB |
| bge-m3-GGUF (Q8_0) | 568 M | 8192 | 1024 | MIT | GGUF, llama.cpp |

La comparación con otros modelos de embeddings de la misma categoría (por ejemplo, e5-mistral o gte-multilingual) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo embeddings densos: no incluye las cabezas sparse ni ColBERT, así que no se puede replicar la recuperación híbrida del BGE-M3 original con este repositorio.
- Dependencia de plataforma: requiere MLX y hardware Apple; no es portable a CUDA ni a CPU genérica sin reconversión.
- El tokenizer no añade token para espacios finales; si no se limpian los textos, los embeddings pueden diferir de los del original.
- Riesgo de sesgo heredado del corpus de entrenamiento del modelo base (XLM-RoBERTa), no evaluado ni documentado en esta build.
- Calidad desigual por idioma: la evaluación solo cubre ruso, ucraniano, chino, japonés y alemán contra inglés; el rendimiento en castellano no se ha medido en la información disponible.
- Recuperación de código moderada: el 49,8 % de acierto top-1 en la prueba de funciones de Python indica que no es un modelo especializado en código.
- El autor no entrenó el modelo y lo distribuye "as is", sin garantías; la responsabilidad de evaluarlo y de cumplir con la licencia del modelo base recae en el usuario.
- Licencia MIT, que permite uso comercial, pero conviene verificar los términos del repositorio original de BAAI, que declara MIT en metadatos sin incluir fichero de licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/roman220220/bge-m3-mlx-8bit
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Build MLX fp16: https://huggingface.co/roman220220/bge-m3-mlx-fp16
- Build MLX 6 bits: https://huggingface.co/roman220220/bge-m3-mlx-6bit
- Build GGUF: https://huggingface.co/roman220220/bge-m3-GGUF
- Repositorio de scripts y mediciones: https://github.com/rromenskyi/quant-ternary
- LLMTray: https://www.ipsupport.us/llmtray/
- Runtime de embeddings de LLMTray: https://github.com/ipsupport-llc/llmtray/tree/main/runtime/llmtray_embed
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- Dataset Tatoeba usado en la evaluación: https://huggingface.co/datasets/mteb/tatoeba-bitext-mining
