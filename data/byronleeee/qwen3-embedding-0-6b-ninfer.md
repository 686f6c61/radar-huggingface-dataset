# ByronLeeee/Qwen3-Embedding-0.6B-Ninfer

## Resumen
ByronLeeee/Qwen3-Embedding-0.6B-Ninfer es una conversión nativa a BF16 del modelo de embeddings Qwen3-Embedding-0.6B de Qwen, publicada por el usuario ByronLeeee para el motor de inferencia NInfer Extended. Se distribuye como un artefacto en formato `.ninfer` y su tarea es la extracción de características (feature-extraction): convertir texto en representaciones vectoriales para búsqueda semántica, recuperación de pasajes y cálculo de similitud.

El artefacto preserva los 310 tensores BF16 del modelo original, incrusta el tokenizador y genera vectores normalizados de 1.024 dimensiones, con soporte para dimensiones de salida de 32, 128, 256, 512 y 1.024. La ventana de trabajo admite hasta 32.768 tokens sin padding por lote, y el peso del modelo ocupa aproximadamente 1,110 GiB en GPU.

Su relevancia radica en que ofrece una vía de despliegue de bajo consumo para embeddings Qwen3 sin depender del stack estándar de Transformers, con mejoras de rendimiento medidas frente a PyTorch y una calidad de vector prácticamente idéntica. Está probado en RTX 5070 Ti de 16 GB y RTX 6000D, bajo licencia Apache-2.0 para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo decoder basado en la familia Qwen3 (modelo base Qwen/Qwen3-Embedding-0.6B); la model card no detalla el numero de capas ni la configuracion de atencion |
| Parametros totales | Aproximadamente 0,6 B (el nombre indica 0.6B; el artefacto preserva los 310 tensores BF16 del modelo original) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens sin padding por lote (capacidad total de 32K indicada en la model card) |
| Tipos de cuantizacion | BF16 nativo; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible en la metadata; la evaluacion citada usa pares de recuperacion en chino e ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefacto `.ninfer` (qwen3-embedding-0.6b-bf16.ninfer), BF16, 1.203.049.125 bytes; SHA256 3229813fdae278ab6871f712e8a943fc4c8949d5580567e89f27f2f18d4e6ae6 |

## Arquitectura y entrenamiento
Se trata de una conversion, no de un modelo entrenado desde cero. El artefacto reproduce el modelo Qwen3-Embedding-0.6B, perteneciente a la familia Qwen3, y conserva los 310 tensores BF16 originales junto con el tokenizador embebido. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que el autor solo documenta el proceso de conversion y ejecucion.

La innovacion tecnica del artefacto no esta en la arquitectura del modelo sino en el motor NInfer Extended, que carga los pesos en BF16 e implementa la fase de prefill y el pooling de vectores. Al tratarse de un modelo de embeddings no existe fase de decode ni cache KV. La ejecucion se realiza en GPU con kernel de atencion CUDA propio, y el autor desactiva explicitamente la atencion CUDA rapida y MATH SDPA y la supresion de errores, verificando 164 comprobaciones matematicas independientes en FP64 y cero graph breaks en la ruta compilada.

## Capacidades
- Generacion de embeddings de texto, con vectores normalizados y dimensiones de salida configurables (32, 128, 256, 512 y 1.024).
- Busqueda semantica y recuperacion de pasajes mediante similitud coseno, con soporte de prefijo de instruccion para consultas (`--instruction`).
- Calculo de similitud semantica entre frases, validado contra el conjunto STS-B.
- Recuperacion bilingue en chino e ingles (evaluada con ocho consultas).
- Procesamiento por lotes de hasta ocho textos y 32.768 tokens sin padding por lote; colecciones mayores se dividen automaticamente en lotes.
- Extraccion de caracteristicas para clasificacion, clustering o indexacion vectorial.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales: es exclusivamente un modelo de representaciones.

## Casos de uso
- Recuperacion aumentada por generacion (RAG): el modelo indexa fragmentos de documentacion y responde a consultas con recuperacion semantica, usando el prefijo de instruccion para las consultas y el texto sin tratar para los documentos, con vectores de 1.024 dimensiones.
- Busqueda semantica en corpus grandes: permite indexar una base documental y consultarla por significado en lugar de por coincidencia exacta de palabras, gracias a la ventana de 32.768 tokens por lote.
- Deduplicacion de datasets: el artefacto permite calcular similitudes entre pares de textos para detectar contenido duplicado o casi duplicado en pipelines de limpieza de datos.
- Clasificacion de textos: los vectores de 0,6 B de parametros sirven como entrada a clasificadores ligeros para categorizar tickets, correos o resenas, con un coste de inferencia bajo.
- Sistemas de recomendacion de contenido: representar articulos o productos como embeddings y recomendar por similitud semantica respecto al historial del usuario.
- Deteccion de similitud y plagio: comparar pares de documentos normalizados con similitud coseno, dado que los vectores se devuelven normalizados.
- Moderacion y agrupacion semantica: agrupar mensajes o comentarios por tematica antes de aplicar reglas de moderacion, reduciendo el volumen que requiere revision manual.

## Benchmarks y rendimiento
Rendimiento frente a Transformers en el mismo modelo (BF16, vectores normalizados de 1.024 dimensiones; tiempos de GPU que incluyen prefill completo y pooling; se excluye carga de pesos, tokenizacion y captura inicial de grafo):

| GPU | Textos × tokens | Transformers (ms) | NInfer (ms) | Transformers (tokens/s) | NInfer (tokens/s) | Variacion |
|---|---|---|---|---|---|---|
| RTX 5070 Ti 16 GB | 1×128 | 3,266 | 2,578 | 39.196 | 49.656 | +26,69% |
| RTX 5070 Ti 16 GB | 1×512 | 8,781 | 8,150 | 58.308 | 62.826 | +7,75% |
| RTX 5070 Ti 16 GB | 1×2048 | 42,161 | 37,610 | 48.576 | 54.454 | +12,10% |
| RTX 5070 Ti 16 GB | 4×128 | 7,418 | 7,340 | 69.019 | 69.753 | +1,06% |
| RTX 5070 Ti 16 GB | 8×512 | 62,459 | 56,905 | 65.579 | 71.979 | +9,76% |
| RTX 6000D | 1×128 | 2,797 | 1,980 | 45.763 | 64.657 | +41,29% |
| RTX 6000D | 1×512 | 6,187 | 4,616 | 82.757 | 110.912 | +34,02% |
| RTX 6000D | 1×2048 | 21,251 | 21,298 | 96.371 | 96.159 | -0,22% |

Calidad de vector y acuerdo de resultados (249 vectores; similitud semantica sobre los primeros 100 pares de STS-B; conjunto de recuperacion chino/ingles con ocho consultas):

| GPU | Ruta Transformers | Coseno medio | Spearman TF | Spearman NInfer | Top1 correcto | Coincidencia Top1/Top3 |
|---|---|---|---|---|---|---|
| RTX 5070 Ti 16 GB | eager | 0,99980168 | 0,946255 | 0,946417 | 8/8 | 100% / 100% |
| RTX 5070 Ti 16 GB | compiled | 0,99979238 | 0,946207 | 0,946417 | 8/8 | 100% / 100% |
| RTX 6000D | eager | 0,99980005 | 0,946255 | 0,946417 | 8/8 | 100% / 100% |
| RTX 6000D | compiled | 0,99978163 | 0,946561 | 0,946417 | 8/8 | 100% / 100% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, MTEB) en la informacion disponible.

## Requisitos de hardware
- Peso del modelo en GPU: aproximadamente 1,110 GiB en BF16, sin cache KV (no existe fase de decode).
- Buffers de runtime: aproximadamente 15,04 MiB para un lote de 4×128, 120,14 MiB para 8×512 y 0,938 GiB con capacidad total de 32K; a esto se anaden el driver CUDA y los objetos Graph.
- GPU probadas por el autor: RTX 5070 Ti de 16 GB y RTX 6000D.
- Cabe con holgura en GPU de consumo: cualquier tarjeta con suficiente memoria libre para el peso de 1,110 GiB mas los buffers (por ejemplo, la RTX 5070 Ti de 16 GB validada).
- Despliegue mediante NInfer Extended (binario `ninfer-embed`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Dependencias del motor: Linux de 64 bits o WSL2, CUDA con soporte `sm_120a`, C++20, CMake >= 3.28, Ninja, librerias de desarrollo de FFmpeg, libcurl, PCRE2, cuDNN 9 y cuBLAS; Python con `transformers==5.17.0` y `numpy` para el script de ejemplo.
- Rendimiento medido: hasta unos 110.912 tokens/s en RTX 6000D con lote 1×512 y unos 71.979 tokens/s en RTX 5070 Ti con 8×512 (ver tabla de benchmarks). No se ofrecen cifras de latencia de extremo a extremo fuera de los tiempos de GPU citados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor / disponibilidad |
|---|---|---|---|---|---|
| ByronLeeee/Qwen3-Embedding-0.6B-Ninfer | ~0,6 B | 32.768 tokens por lote | Artefacto `.ninfer` BF16 | Apache-2.0 | NInfer Extended (conversion optimizada) |
| Qwen/Qwen3-Embedding-0.6B (original) | ~0,6 B | No disponible en la informacion proporcionada | Pesos originales del modelo base | Apache-2.0 | Transformers (referencia de la comparativa) |

El artefacto de NInfer es funcionalmente equivalente al modelo original de Qwen en calidad de vector (coseno medio ~0,9998 frente a Transformers) y ofrece ganancias de throughput de entre el 1% y el 41% segun GPU y tamano de lote, con un empate practico en lotes de 2.048 tokens sobre RTX 6000D. No se dispone de datos para comparar con otras familias de embeddings (por ejemplo, BGE o E5) en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo sin traccion comunitaria: 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validacion por terceros.
- Es una conversion, no el modelo original: la calidad depende tanto del modelo base como de la fidelidad del proceso de conversion a `.ninfer`.
- Dependencia estricta del motor NInfer Extended y de una toolchain concreta (CUDA `sm_120a`, cuDNN 9, cuBLAS, CMake, Ninja, FFmpeg, libcurl, PCRE2, Linux o WSL2), lo que dificulta el despliegue fuera de ese entorno.
- No hay informacion sobre idiomas soportados ni sobre sesgos; la evaluacion multilingue citada se limita a pares en chino e ingles.
- Riesgo de recuperacion imprecisa en dominios muy especificos si no se usa el prefijo de instruccion correcto en las consultas; la model card recomienda instruccion para consultas y texto sin tratar para documentos.
- Al ser un modelo de embeddings, no aplica el riesgo de alucinacion generativa, pero los vectores pueden no capturar matices semanticos complejos de textos largos o muy tecnicos.
- Los tiempos y cifras de rendimiento proceden de mediciones del propio autor sobre dos GPU concretas y pueden no reproducirse en otro hardware.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen y del motor NInfer Extended antes de un despliegue en produccion.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ByronLeeee/Qwen3-Embedding-0.6B-Ninfer
- Modelo base Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio NInfer Extended: https://github.com/ByronLeeeee/ninfer-extended
- Guia de conversion y API del motor: https://github.com/ByronLeeeee/ninfer-extended/blob/main/docs/qwen3-embedding.md
- Dataset STS-B: https://huggingface.co/datasets/sentence-transformers/stsb
