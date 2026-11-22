# fylume/qwen3-embedding-0.6b-f16-gguf

## Resumen

Este repositorio contiene una conversión a GGUF en precisión F16 del modelo Qwen3-Embedding-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. No se trata de un modelo nuevo ni de un ajuste fino: es una redistribución del encoder de texto original, convertido con `convert_hf_to_gguf.py` de llama.cpp (build b12318) para poder ejecutarse con llama.cpp. El autor del repositorio, fylume, publica el archivo porque es el encoder congelado contra el que se entrenó el router aprendido de su sistema Yaob, de modo que la pareja router-encoder pueda reproducirse de forma exacta.

El modelo base es un transformer de arquitectura `qwen3` orientado exclusivamente a la generación de embeddings (pipeline `feature-extraction`), con 595.776.512 parámetros, 28 bloques, anchura de embedding de 1.024 y una longitud de contexto de 32.768 tokens. Emplea pooling de último token y produce vectores de 1.024 dimensiones. No genera texto: su única salida son representaciones vectoriales densas.

Su relevancia es doble. Por un lado, sirve como referencia práctica de cómo empaquetar un encoder de embeddings de Qwen en GGUF para despliegue con llama.cpp mediante un endpoint compatible con la API de OpenAI (`/v1/embeddings`). Por otro, documenta con precisión la procedencia y las diferencias de bytes frente a otras conversiones del mismo modelo, un detalle relevante para quien necesite reproducibilidad bit a bit en sistemas de recuperación. Para uso general, el propio autor recomienda acudir al repositorio oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3` (encoder de embeddings) |
| Parametros totales | 595.776.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | F16 (esta publicacion); el autor menciona Q8_0 como alternativa evaluada pero no usada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16, con normas en F32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con 28 bloques, anchura de embedding de 1.024 y pooling de último token, que devuelve vectores de 1.024 dimensiones. El archivo GGUF conserva los pesos en F16 y las capas de normalización en F32. El contexto máximo soportado es de 32.768 tokens, aunque el caso de uso documentado por el autor recorta las entradas a 256 tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación; esos datos corresponden a la model card upstream de Qwen, que no se incluye en la información proporcionada. Respecto a esta publicación concreta, el autor declara explícitamente que no hay ajuste fino: la derivación es únicamente una cuantización a GGUF de 16 bits. La conversión se realizó con llama.cpp b12318 (commit `7021f7e09`) en noviembre de 2026. El autor advierte que no existe un log de conversión para este archivo exacto y que una reconversión posterior con el mismo build produce el mismo tamaño pero bytes distintos (SHA-256 `da73f365…3dff6`), y que el archivo F16 oficial también difiere (`421a27e5…c54340`, 1.197.629.632 bytes). El archivo publicado aquí tiene 1.197.629.728 bytes y SHA-256 `e8e9d93c70f69095a1821d20c88f558627e31571bd73cbfabf26f1e5e54c4e0b`.

## Capacidades

- Generación de embeddings de texto de 1.024 dimensiones con pooling de último token.
- Recuperación semántica y búsqueda por similitud vectorial (el caso documentado es la recuperación de nodos de conocimiento a partir de una pregunta).
- Soporte de instrucciones de consulta mediante prefijo textual (`Instruct: ...\nQuery: ...`), tal como lo emplea el router de Yaob.
- Ejecución con llama.cpp mediante `llama-server --embedding`, exponiendo un endpoint compatible con `/v1/embeddings` de la API de OpenAI.
- Procesamiento de entradas de hasta 32.768 tokens a nivel de arquitectura, aunque el uso documentado recorta a 256 tokens.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión, audio ni modo thinking: es exclusivamente un encoder.

## Casos de uso

- Reproducción del sistema Yaob: usar exactamente este archivo GGUF con el router aprendido de Yaob Next 0.2.0 permite replicar el comportamiento medido, ya que otras conversiones del mismo modelo producen bytes distintos y vectores ligeramente diferentes.
- Búsqueda semántica en bases de conocimiento: indexar documentos como vectores de 1.024 dimensiones y recuperar los más próximos a una consulta; el modelo está diseñado para esta tarea y el contexto de 32.768 tokens permite indexar fragmentos largos sin truncar.
- Servicio de embeddings autoalojado: desplegar `llama-server` con `--embedding --pooling last` y consumir el endpoint `/v1/embeddings` desde aplicaciones existentes que ya usan la API de OpenAI, sin cambiar el cliente.
- Sistemas RAG ligeros en hardware modesto: con 595 millones de parámetros en F16 (1,2 GB de archivo), el modelo cabe en GPU de consumo y en CPU, lo que permite montar un pipeline de recuperación completo en una sola máquina.
- Deduplicación y agrupamiento de textos: calcular embeddings de un corpus y agrupar por similitud coseno para detectar duplicados o crear clústeres temáticos.
- Enrutamiento de consultas: usar los vectores como entrada de un clasificador o router (como hace Yaob) para decidir qué nodo de conocimiento o qué herramienta responde a una pregunta.
- Evaluación de paridad entre backends: comparar los vectores de esta conversión GGUF con los del modelo en bf16 vía Transformers para validar que una migración a llama.cpp no degrada la calidad de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB u otros) en la información disponible. El único dato de rendimiento es la prueba de paridad de encoder documentada por el autor (Yaob Next 0.2.0, 12 de noviembre de 2026), que compara los vectores de este GGUF obtenidos con llama.cpp frente a los vectores en bf16 de Transformers con los que se entrenó el router:

| Metrica | Valor |
|---|---|
| Similitud coseno media (CUDA) | 0,999865 |
| Similitud coseno media (CPU) | 0,999889 |
| Similitud coseno mínima | 0,999772 |
| Vecino más próximo preservado | 1.000 de 1.000 |
| Corpus de evaluación | 1.000 textos de nodos |

El autor indica que la cuantización Q8_0 se alejaba de forma medible y por eso no se utilizó.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB para los pesos en F16, más overhead del contexto y del servidor; en la práctica, entre 2 y 4 GB según la longitud de contexto configurada y el número de slots (`-np`).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo es lo bastante pequeño para ejecutarse en tarjetas de consumo. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU, como demuestra la prueba de paridad realizada en CPU.
- Opciones de despliegue: llama.cpp mediante `llama-server -m Qwen3-Embedding-0.6B-F16.gguf --embedding --pooling last -c 2048 -b 2048 -ub 2048 -np 2`. El autor indica que no ha probado vLLM ni Transformers con este archivo (para Transformers recomienda usar los safetensors upstream).
- Latencia y throughput: no disponibles. El autor no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| fylume/qwen3-embedding-0.6b-f16-gguf | 595.776.512 | 32.768 | GGUF F16 | Apache 2.0 | Conversión no oficial; bytes distintos del F16 oficial |
| Qwen/Qwen3-Embedding-0.6B | 595.776.512 | 32.768 | safetensors (bf16) | Apache 2.0 | Modelo original; recomendado para uso general |
| Qwen/Qwen3-Embedding-0.6B-GGUF | 595.776.512 | 32.768 | GGUF | Apache 2.0 | Conversión oficial de Qwen; recomendada para uso general |

Las tres variantes comparten arquitectura, tamaño y contexto; las diferencias están en el formato, la procedencia de la conversión y la fidelidad de bytes. No se dispone de datos de benchmarks que permitan comparar la calidad de recuperación frente a otros modelos de embeddings de tamaño similar.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo vectores. No debe evaluarse con benchmarks de generación.
- El autor advierte que este archivo no es un modelo de Fylume y que, para uso general, conviene usar el modelo upstream o su repositorio GGUF oficial.
- Los vectores de esta conversión no son idénticos byte a byte a los de otras conversiones del mismo modelo; si se mezclan archivos distintos en un mismo índice, la comparación de similitudes puede degradarse.
- El router de Yaob se entrenó con entradas recortadas a 256 tokens (incluyendo un token de fin de texto) y con un prefijo de instrucción concreto; usar otras entradas produce vectores fuera de la distribución de entrenamiento del router.
- La paridad medida (coseno medio 0,999865) es alta pero no perfecta; en aplicaciones sensibles al orden exacto de vecinos conviene validar con el corpus propio.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación en la documentación disponible; al ser un encoder, el riesgo de alucinación se traslada al sistema que consuma los vectores (por ejemplo, un RAG que recupere documentos irrelevantes).
- Licencia Apache 2.0: permite uso comercial, pero exige conservar el aviso de copyright y el texto de la licencia, y declarar los cambios. El repositorio incluye un `NOTICE` con la declaración de cambio. El autor aclara que no está respaldado por Alibaba Cloud ni por el equipo Qwen.
- El repositorio upstream no tenía archivo LICENSE en la revisión indicada; el autor incluye el texto estándar de Apache 2.0 que Qwen distribuye con otros modelos.
- No se han probado vLLM, Transformers ni otros builds de llama.cpp con este archivo concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fylume/qwen3-embedding-0.6b-f16-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF
- llama.cpp (herramienta de conversión y servidor): https://github.com/ggml-org/llama.cpp
