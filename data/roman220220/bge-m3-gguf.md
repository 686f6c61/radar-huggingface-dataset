# roman220220/bge-m3-GGUF

## Resumen

bge-m3-GGUF es una conversión al formato GGUF del modelo de embeddings multilingüe BAAI/bge-m3, publicada por el usuario roman220220 (IPSupport LLC) como parte del stack de herramientas locales LLMTray. El modelo original, desarrollado por el Beijing Academy of Artificial Intelligence (BAAI), es un encoder XLM-RoBERTa de 568 millones de parámetros que genera vectores densos de 1024 dimensiones con una ventana de contexto de 8192 tokens y cobertura de más de 100 idiomas. Esta conversión conserva únicamente la salida densa (token CLS, normalizada L2), descartando las cabezas sparse (lexical) y multi-vector (ColBERT) del modelo original.

La relevancia de esta ficha radica en que permite ejecutar un modelo de recuperación de alta calidad en llama.cpp y llama-server sin dependencias de PyTorch, con tamaños que van desde 438 MB (Q4_K_M) hasta 1158 MB (F16). El autor documenta una validación cuantitativa frente al original en fp32 sobre 10.240 textos, con métricas de similitud coseno, recuperación de traducciones y recuperación de código, lo que aporta trazabilidad al proceso de cuantización poco habitual en conversiones comunitarias.

El modelo está pensado para búsqueda semántica, RAG y memoria de proyectos en aplicaciones locales, y su licencia MIT (heredada del modelo base) facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer), pooling CLS, salida densa |
| Parametros totales | 566.703.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | más de 100 (modelo base multilingüe; el repo no declara lista explícita) |
| Licencia | MIT |
| Formato de pesos | GGUF (para llama.cpp) |
| Dimension de embedding | 1024 |
| Tamano del repo | 3,2 GB |
| Revision del modelo base | 5617a9f |
| Herramienta de conversion | llama.cpp b12751 |

## Arquitectura y entrenamiento

El modelo base BAAI/bge-m3 es un encoder XLM-RoBERTa de 568 millones de parámetros entrenado para producir representaciones densas, sparse y multi-vector de forma conjunta (Multi-Functionality, Multi-Linguality y Multi-Granularity). Esta conversión GGUF conserva exclusivamente la funcionalidad densa: el vector se obtiene del token CLS y se normaliza L2, y llama.cpp lee la configuración de pooling CLS directamente del archivo. Las cabezas sparse y ColBERT no están incluidas en los ficheros.

La conversión se realizó con llama.cpp b12751 y el autor midió cada build frente al modelo original en PyTorch fp32 sobre 10.240 textos, incluyendo pares de Tatoeba para ruso, ucraniano, chino, japonés y alemán contra inglés, y funciones de la biblioteca estándar de Python para recuperación de código. También verificó la equivalencia del tokenizador: los IDs de llama.cpp coinciden con los de transformers en 519 textos comprobados, sin diferencias. El autor advierte que el tokenizador de BAAI convierte un salto de línea final en un token extra antes de `</s>`, por lo que recomienda eliminar espacios finales antes de generar embeddings para mantener la consistencia entre implementaciones.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para textos de hasta 8192 tokens.
- Similitud semántica y búsqueda por similitud (pipeline `feature-extraction` / `sentence-similarity`).
- Recuperación multilingüe: el autor valida recuperación de traducciones en ruso, ucraniano, chino, japonés y alemán frente a inglés.
- Recuperación de código: validada con docstrings de funciones de la biblioteca estándar de Python.
- Sin prefijos de consulta ni de documento: BGE-M3 no los utiliza, a diferencia de otros modelos de la familia BGE.
- Servicio mediante API compatible con OpenAI (`/v1/embeddings`) a través de `llama-server --embedding`.
- No incluye salidas sparse (lexical) ni multi-vector (ColBERT).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en documentación local: indexar ficheros de proyecto y recuperar fragmentos relevantes por similitud coseno, aprovechando la ventana de 8192 tokens para indexar secciones completas sin trocear en exceso.
- RAG sobre bases de conocimiento privadas: generar embeddings de chunks y consultas en un servidor llama.cpp local, sin enviar datos a servicios externos, con Q8_0 como equilibrio recomendado entre tamaño (635 MB) y fidelidad (coseno medio 0,99958 frente al original).
- Memoria de agentes y asistentes: almacenar interacciones pasadas como vectores y recuperar contexto relevante en conversaciones multi-turno, integrándolo en aplicaciones como LLMTray.
- Deduplicación y agrupación de textos multilingües: detectar documentos o registros duplicados en corpus con varios idiomas, dado el soporte de más de 100 lenguas del modelo base.
- Recuperación de código en asistentes de programación: localizar la función que corresponde a una descripción en lenguaje natural, con una tasa de recuperación de código del 74,2 % en la prueba del autor (idéntica al original en Q8_0).
- Búsqueda transfronteriza en atención al cliente: emparejar consultas de usuarios en un idioma con artículos de ayuda en otro, con una recuperación de traducción del 95,87 % en Q8_0 (ligeramente superior al 95,83 % del original en la prueba del autor).
- Despliegue en entornos con memoria limitada: usar Q4_K_M (438 MB) o Q5_K_M (468 MB) cuando el presupuesto de RAM es crítico, asumiendo una reordenación de resultados de aproximadamente un sexto del top-10 en Q4_K_M.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, MTEB) en la información disponible, pero sí mediciones propias de fidelidad frente al modelo original en fp32 sobre 10.240 textos:

| Build | Tamano | Coseno medio / minimo | Recuperacion traduccion | Recuperacion codigo | Solapamiento top-10 |
|---|---|---|---|---|---|
| Original (PyTorch fp32) | 2,27 GB | — | 95,83 % | 74,2 % | — |
| F16 | 1158 MB | 0,99999 / 0,9996 | 95,83 % | 74,2 % | 99,7 % |
| Q8_0 | 635 MB | 0,99958 / 0,998 | 95,87 % | 74,2 % | 97,2 % |
| Q6_K | 499 MB | 0,9965 / 0,984 | 95,79 % | 72,5 % | 92,8 % |
| Q5_K_M | 468 MB | 0,9937 / 0,974 | 95,79 % | 74,2 % | 90,2 % |
| Q4_K_M | 438 MB | 0,9826 / 0,928 | 95,88 % | 75,8 % | 84,4 % |

El autor indica que las mediciones con entradas largas (5–8k tokens) estaban pendientes de publicación en el momento de redactar la model card. También señala que los vectores de su Q8_0 son idénticos (coseno 1,000000) a los de ggml-org/bge-m3-Q8_0-GGUF, con una diferencia menor en un flag de metadatos del tokenizador, por lo que los índices construidos con cualquiera de los dos son intercambiables.

## Requisitos de hardware

- VRAM/RAM estimada: entre 438 MB (Q4_K_M) y 1158 MB (F16) solo para los pesos; hay que sumar el espacio para el contexto (hasta 8192 tokens) y los buffers de cómputo de llama.cpp.
- Cabe en cualquier GPU consumer con al menos 2 GB de memoria libre, e incluso en CPU con llama.cpp.
- GPU recomendadas: no se especifican en la información disponible; para uso en servidor, cualquier GPU con soporte CUDA, Metal o Vulkan que ejecute llama.cpp es suficiente dado el tamaño del modelo.
- Despliegue: llama.cpp y llama-server (`--embedding`), con API compatible con OpenAI en `/v1/embeddings`. El autor no menciona soporte explícito de vLLM, TGI u Ollama en la información disponible.
- Parámetros de servidor indicados por el autor: `-c 8192 -b 8192 -ub 8192`; `-ub` debe ser al menos la longitud del input más largo, ya que llama-server rechaza entradas más largas en lugar de truncarlas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Formatos | Licencia | Notas |
|---|---|---|---|---|---|---|
| bge-m3-GGUF (esta ficha) | 566,7 M | 8192 | 1024 | GGUF (F16 a Q4_K_M) | MIT | Solo salida densa; validado frente al original |
| BAAI/bge-m3 (original) | 568 M | 8192 | 1024 | safetensors (PyTorch) | MIT | Salidas densa, sparse y ColBERT; requiere transformers |
| ggml-org/bge-m3-Q8_0-GGUF | 568 M | 8192 | 1024 | GGUF Q8_0 | MIT | Vectores idénticos al Q8_0 de esta ficha según el autor |
| Otros modelos de embeddings comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de alternativas en la información disponible |

## Limitaciones y advertencias

- Solo embeddings densos: las salidas sparse (lexical) y multi-vector (ColBERT) del modelo original no están incluidas, lo que impide reproducir el pipeline híbrido completo de BGE-M3.
- No es un modelo generativo: no puede usarse para chat, generación de texto, tool calling ni razonamiento.
- El autor no publica mediciones con entradas largas (5–8k tokens); el comportamiento en ese rango no está validado en la model card.
- Q5_K_M y Q4_K_M conservan la precisión de recuperación en la prueba del autor, pero reordenan resultados: en Q4_K_M cambia aproximadamente un sexto del top-10 y algunos vectores alcanzan un coseno mínimo de 0,928 frente al original.
- El tokenizador convierte un salto de línea final en un token extra; si no se eliminan los espacios finales, los vectores pueden diferir ligeramente entre implementaciones.
- llama-server rechaza entradas más largas que el valor de `-ub` en lugar de truncarlas; hay que dimensionarlo según el input más largo esperado.
- Riesgo de alucinación y sesgos: no aplica directamente al ser un encoder, pero los sesgos del corpus de entrenamiento del modelo base pueden reflejarse en la similitud semántica y en la recuperación.
- El repositorio no declara una lista explícita de idiomas; la cobertura multilingüe se hereda del modelo base.
- La licencia MIT se hereda del modelo base, que declara MIT en sus metadatos pero no incluye fichero de licencia; el autor incluye el texto estándar de MIT.
- El autor distribuye la conversión "tal cual", sin garantías, y no se responsabiliza de los resultados ni del cumplimiento de la licencia del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/roman220220/bge-m3-GGUF
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Conversión Q8_0 de referencia: https://huggingface.co/ggml-org/bge-m3-Q8_0-GGUF
- Pipeline y mediciones: https://github.com/rromenskyi/quant-ternary (carpeta `bge-m3-quant/`)
- LLMTray: https://www.ipsupport.us/llmtray/
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- Dataset de evaluación Tatoeba: https://huggingface.co/datasets/mteb/tatoeba-bitext-mining
