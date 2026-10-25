# hmzprover/hpsearch-embed-4b

## Resumen

hpsearch-embed-4b es un modelo de embeddings de texto especializado en la recuperación (*retrieval*) de declaraciones de Lean 4 y Mathlib. Lo publica el usuario hmzprover como un *fine-tune* con LoRA fusionada sobre Qwen/Qwen3-Embedding-4B, con 4.021.774.336 parámetros y licencia Apache-2.0. Su propósito concreto es alimentar el modo `best` de [hpsearch](https://github.com/humanfia/hpsearch): dada una consulta en lenguaje natural, un fragmento de código Lean o un estado de prueba (*proof state*), devuelve las declaraciones de Mathlib más relevantes.

El problema que aborda es la selección de premisas (*premise selection*), uno de los cuellos de botella de la automatización de pruebas en asistentes de demostración. Los embeddings de propósito general no modelan bien la sintaxis de Lean ni la semántica de las firmas de lemas, y los modelos de recuperación de gran tamaño no caben en el bucle interactivo de un usuario. Con 4B de parámetros, este modelo se puede desplegar en una sola GPU y mantener un índice vectorial actualizado.

La relevancia práctica viene acompañada de una advertencia de madurez: el repositorio no acumula descargas ni *likes*, no incluye *model card* extendida, no se han publicado métricas de evaluación y no se detalla el conjunto exacto de evaluaciones sobre el que el autor afirma haber eliminado pares contaminantes. Es, por tanto, un artefacto prometedor pero sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer *decoder-only* denso, derivado de Qwen3-Embedding-4B (arquitectura Qwen3); especializado como codificador de embeddings |
| Parámetros totales | 4.021.774.336 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información del repositorio; el modelo base Qwen3-Embedding-4B declara 32 768 tokens (no verificado en este *fine-tune*) |
| Tipos de cuantización | No se publican versiones cuantizadas; los pesos están en safetensors (BF16). Al ser un transformer denso de 4B es convertible a GGUF, ONNX o INT8/INT4 con herramientas estándar, pero el autor no distribuye esas conversiones |
| Idiomas soportados | No disponible en la *model card* del *fine-tune*; el modelo base declara soporte de más de 100 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Dimensión de embedding | No disponible en la información del repositorio; el modelo base usa 2560 dimensiones con soporte de Matryoshka (MRL) |
| Tarea declarada | *Feature extraction* / generación de embeddings para recuperación |
| Tamaño del repositorio | 8,1 GB |
| Modelo base | Qwen/Qwen3-Embedding-4B |
| Fecha de publicación | 25 de octubre de 2026 |
| Descargas / *likes* | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-Embedding-4B: un transformer *decoder-only* denso de unos 4B de parámetros, adaptado para producir representaciones vectoriales en lugar de tokens. El autor aplica un *fine-tune* con LoRA y fusiona los adaptadores en los pesos finales, de ahí que el repositorio contenga únicamente safetensors con el modelo completo (8,1 GB en BF16). No se documentan ni la longitud de contexto efectiva tras el *fine-tune*, ni la dimensión de salida, ni si se conservan las capacidades de instrucción y de dimensiones truncables del modelo base.

Los datos de entrenamiento declarados son exclusivamente públicos: informalizaciones de Mathlib procedentes de Lean Finder y LeanSearch v2, firmas del código fuente de Mathlib, el *split* de entrenamiento aleatorio de LeanStateSearch (pares estado de prueba → premisas) y consultas generadas a partir de esos materiales con Qwen3-8B. El autor afirma haber eliminado todo par cuya consulta o declaración objetivo apareciese en algún conjunto de evaluación sobre el que hpsearch reporta resultados. No se indica el número de tokens, la composición proporcional del *dataset*, ni si hubo etapas de preferencia (RLHF/DPO); la generación de consultas sintéticas con Qwen3-8B introduce un sesgo de destilación hacia ese modelo que conviene tener en cuenta.

## Capacidades

- Generación de embeddings de texto para consultas en lenguaje natural sobre matemáticas formales.
- Embeddings de código Lean 4: firmas de lemas, declaraciones y fragmentos de Mathlib.
- Embeddings de *proof states* (estados de prueba), orientados a la recuperación de premisas.
- Recuperación (*retrieval*) en un espacio vectorial único para las tres modalidades de consulta anteriores, lo que permite indexar declaraciones una sola vez y consultarlas de tres formas distintas.
- Base para búsqueda semántica, similitud coseno, agrupamiento y deduplicación de declaraciones.
- Capacidades multilingües: no disponibles/verificadas en el *fine-tune*; heredadas del modelo base, que declara más de 100 idiomas.
- No es un modelo generativo: no produce texto, no soporta *tool calling* ni *function calling*, no ejecuta razonamiento multi-paso ni modos de *thinking*, y no procesa visión ni audio.

## Casos de uso

- **Selección de premisas en tácticas de automatización**: integrado en un *pipeline* tipo `aesop` o en un *hammer*, el modelo convierte el *proof state* actual en un vector y recupera los lemas candidatos de Mathlib antes de pasarlos a un probador automático; su tamaño de 4B permite ejecutarlo dentro del bucle de prueba sin salir de la GPU local.
- **Búsqueda semántica de lemas en el editor**: un plugin de VS Code o Emacs envía la descripción en lenguaje natural («si dos naturales son coprimos, existe una combinación lineal igual a uno») y el modelo devuelve las declaraciones de Mathlib correspondientes; el contexto de 32k del modelo base permite indexar firmas completas con documentación sin truncar.
- **Búsqueda por código Lean existente**: dado un lema que el usuario ya ha escrito y quiere generalizar, se genera su embedding y se recuperan declaraciones estructuralmente similares, útil para descubrir resultados ya formalizados y evitar duplicar trabajo.
- **RAG sobre documentación matemática formalizada**: para asistentes conversacionales que responden sobre formalizaciones, el modelo actúa como recuperador y entrega al generador los lemas pertinentes, reduciendo alucinaciones en la referencia de teoremas.
- **Deduplicación y auditoría de librerías**: al indexar un proyecto Lean propio, los embeddings permiten agrupar declaraciones equivalentes o casi equivalentes, detectar lemas redundantes y auditar dependencias antes de enviar un *pull request* a Mathlib.
- **Mapeo de material informal a formal**: artículos y apuntes se vectorizan junto con las declaraciones de Mathlib para construir índices que enlacen cada resultado informal con su contrapartida formalizada.
- **Evaluación comparativa de *pipelines* de recuperación**: usar el modelo como recuperador de referencia en el modo `best` de hpsearch y medir *recall@k* frente a alternativas, aprovechando que su formato de pesos estándar lo hace compatible con *frameworks* de embeddings habituales.
- **Punto de partida para nuevos *fine-tunes***: la licencia Apache-2.0 y los pesos en safetensors permiten reentrenar sobre otros asistentes de demostración (Coq, Isabelle, Agda) partiendo de este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* menciona que el modelo se usa en el modo `best` de hpsearch, pero no incluye métricas de *recall@k*, MRR ni comparaciones cifradas con Lean Finder, LeanSearch v2 u otros recuperadores. Tampoco se han publicado evaluaciones sobre MTEB ni sobre tareas de recuperación de código.

## Requisitos de hardware

- **VRAM estimada para inferencia (solo pesos)**: 4,02B parámetros × 2 bytes ≈ 8,1 GB en BF16/FP16; ≈ 4,1 GB en INT8; ≈ 2,3 GB en INT4. A ello hay que sumar activaciones, *buffers* de atención y el índice vectorial (que reside normalmente en RAM o en una base vectorial externa).
- **GPU recomendadas para producción**: A100 40/80 GB o H100 para indexado masivo de Mathlib con lotes grandes; L40S, L4 (24 GB) o A10G para servicio de baja latencia con lotes moderados.
- **GPU de consumo**: cabe en RTX 4090/3090 (24 GB) y RTX 4080/4070 Ti Super (16 GB) en BF16 con lotes pequeños y secuencias cortas; en tarjetas de 8 GB solo con cuantización INT8/INT4 y secuencias recortadas. La memoria de atención crece con la longitud de secuencia, por lo que trabajar cerca de los 32k tokens del modelo base exige bastante más VRAM que una consulta corta.
- **Opciones de despliegue**: sentence-transformers o transformers + PyTorch para prototipos; vLLM y Hugging Face Text Embeddings Inference (TEI) para servicio con *batching* continuo; llama.cpp u Ollama solo si se convierte previamente a GGUF, conversión que el autor no publica. Para el índice: FAISS, Qdrant, Milvus o pgvector.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones, y las estimaciones dependen de la GPU, del tamaño de lote y de la longitud de las secuencias, que en firmas de Mathlib puede ser considerable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hpsearch-embed-4b | 4,02B | No disponible (base: 32 768) | Lean 4 / Mathlib | Apache-2.0 | Pesos en safetensors; 0 descargas; sin benchmarks |
| Qwen/Qwen3-Embedding-4B | 4B | 32 768 (según documentación del modelo base) | Propósito general, multilingüe | Apache-2.0 | Ampliamente distribuido; usado aquí como base |
| Qwen3-Embedding-0.6B | 0,6B | No disponible en la información proporcionada | Propósito general, multilingüe | Apache-2.0 | Disponible en HuggingFace |
| Lean Finder / LeanSearch v2 | No disponible | No disponible | Recuperación de Mathlib | No disponible | Citados como fuente de datos en la *model card*, pero sin datos técnicos en la información proporcionada |

Los datos del modelo base y de Qwen3-Embedding-0.6B provienen de la documentación pública de dichos modelos, no de este repositorio, y no se han verificado sobre el *fine-tune*. No se dispone de comparaciones de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- **Dominio muy restringido**: el entrenamiento se limita a Lean 4 y Mathlib. Fuera de ese dominio es esperable una degradación notable del rendimiento; no debe emplearse como *embedder* general sin reevaluarlo.
- **Sin validación pública**: 0 descargas, 0 *likes*, sin métricas y sin *model card* extendida. Cualquier uso en producción debería ir precedido de una evaluación propia sobre el *split* de interés.
- **Contaminación no verificable**: el autor afirma haber eliminado los pares presentes en conjuntos de evaluación de hpsearch, pero no publica la lista de conjuntos ni el procedimiento, por lo que la afirmación no es auditable.
- **Sesgo de destilación**: parte de las consultas de entrenamiento se generaron con Qwen3-8B, lo que puede reproducir la distribución y los sesgos de ese generador, incluida la tendencia a formulaciones típicas de modelos de lenguaje y a pasar por alto paráfrasis atípicas.
- **Desalineación con versiones de Mathlib**: el índice se construye sobre una instantánea concreta de Mathlib; declaraciones renombradas o eliminadas en versiones posteriores no se recuperarán correctamente y exigen reindexar y, potencialmente, reentrenar.
- **Riesgo de falsos positivos en la recuperación**: al no ser un modelo generativo no alucina texto, pero puede devolver declaraciones semánticamente próximas y lógicamente inútiles para cerrar el objetivo; el *ranking* final debe validarse con un verificador.
- **Idiomas y contexto no documentados**: se desconoce si el *fine-tune* conserva el multilingüismo y la ventana de 32k del modelo base, así como si mantiene el soporte de dimensiones truncables (MRL) y de instrucciones.
- **Licencia**: Apache-2.0 permite uso comercial y modificaciones, con obligación de conservar avisos y atribución; conviene revisar igualmente las condiciones de los datos de origen (Lean Finder, LeanSearch v2, LeanStateSearch) si se redistribuye un modelo derivado.
- **Mantenimiento**: no se ha anunciado soporte, versionado ni actualizaciones; es un artefacto de un único autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmzprover/hpsearch-embed-4b
- Modelo base Qwen3-Embedding-4B: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Repositorio hpsearch: https://github.com/humanfia/hpsearch
- Paper, blog o demo del modelo: no disponibles en la información proporcionada.
