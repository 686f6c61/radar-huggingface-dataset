# cstr/bge-m3-GGUF

## Resumen

`cstr/bge-m3-GGUF` es una redistribución en formato GGUF del modelo de embeddings `BAAI/bge-m3`, publicada por el usuario cstr para su uso con CrispEmbed, un motor de inferencia de embeddings escrito en C/C++ sobre ggml. No se trata de un modelo nuevo: es una conversión de formato y, en algunas variantes, una cuantización de los pesos originales de BAAI, sin reentrenamiento, fine-tuning ni cambios de arquitectura, vocabulario o capacidades. El modelo base es un transformer XLM-R de 568.805.377 parámetros (568M) con 24 capas, dimensión de embedding de 1024, pooling por media y tokenizador SentencePiece.

La relevancia de esta conversión es práctica: permite ejecutar un modelo de recuperación multilingüe de referencia sin runtime de Python ni ONNX, mediante un binario C/C++ con modo servidor compatible con el endpoint `/v1/embeddings`. BGE-M3 destaca por combinar en un único modelo tres modos de recuperación (dense, sparse léxico y multi-vector ColBERT), lo que lo hace útil para búsqueda híbrida y reranking. La ventana de contexto declarada es de 8192 tokens y la cobertura lingüística supera los 100 idiomas.

El repositorio incluye dos generaciones de ficheros. La primera, en layout por defecto (estilo Ollama), descarta las cabezas `sparse_linear` y `colbert_linear`, por lo que solo sirve para recuperación dense. La segunda, convertida con la opción `--crisp`, conserva ambas cabezas y habilita los tres modos. La licencia es MIT, heredada del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-R (transformer encoder) |
| Parámetros totales | 568.805.377 (568M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | F32, F16, Q8_0, Q4_K, IQ4_XS (según fichero); variantes mixtas Q8_0 con bloques en F16 |
| Idiomas soportados | multilingüe (más de 100 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (también safetensors en el modelo base) |

Ficheros publicados y tamaños declarados en la model card:

| Fichero | Cuantización | Tamaño | Cabezas sparse/ColBERT |
|---|---|---|---|
| `bge-m3-q4_k.gguf` | Q4_K | 438 MB | no |
| `bge-m3-q8_0.gguf` | Q8_0 | 583 MB | no |
| `bge-m3.gguf` | F32 | 2175 MB | no |
| `bge-m3-heads-f16.gguf` | F16 (cabezas F32) | 1599 MiB | sí |
| `bge-m3-heads-q8_0-mixed.gguf` | Q8_0, bloques 0-11 en F16 | no disponible | sí (superseded) |
| `bge-m3-heads-q8_0-enc0-15-f16.gguf` | Q8_0, bloques 0-15 en F16, cabezas F32 | 763 MiB | sí |

## Arquitectura y entrenamiento

La arquitectura es un encoder XLM-R de 24 capas con dimensión oculta de 1024, pooling por media sobre las representaciones de token y tokenizador SentencePiece. Sobre la salida del encoder, BGE-M3 añade dos cabezas lineales: `sparse_linear`, que produce pesos léxicos para recuperación sparse, y `colbert_linear`, que genera vectores por token para recuperación multi-vector estilo ColBERT. El modelo base fue entrenado por BAAI; esta conversión no aporta información sobre el dataset de entrenamiento, el número de tokens vistos ni si se aplicaron RLHF o DPO, y la model card remite explícitamente al proveedor upstream para esos detalles.

La innovación técnica relevante de esta redistribución no está en el entrenamiento, sino en la conversión: el layout por defecto elimina las cabezas auxiliares, mientras que el layout `--crisp` las preserva. Además, el autor documenta un trabajo de calibración de cuantización por capas. Con Q8_0 uniforme, la similitud coseno mínima por token en ColBERT cae a 0,61; manteniendo los bloques 0-11 en F16 sube a 0,973 en CPU, y manteniendo los bloques 0-15 en F16 alcanza 0,9911 frente a FlagEmbedding en FP32 (panel de 77 textos) y 0,9922 en CUDA sobre una Tesla T4, con dense y sparse por encima de 0,9995. Una variante Q4_K con cabezas no superó el umbral (mínimo ColBERT entre 0,37 y 0,60) y no se publicó. La verificación de las variantes dense declara similitud coseno mayor o igual a 0,999 frente a sentence-transformers.

## Capacidades

- Generación de embeddings dense de 1024 dimensiones para búsqueda semántica y similitud vectorial.
- Recuperación sparse con pesos léxicos por token (solo en ficheros con cabezas).
- Recuperación multi-vector ColBERT con un vector por token (solo en ficheros con cabezas).
- Búsqueda híbrida combinando los tres modos en un único modelo y una única pasada de encoder.
- Cobertura multilingüe de más de 100 idiomas, incluyendo consultas y documentos en idiomas distintos.
- Procesamiento de documentos largos de hasta 8192 tokens por entrada.
- Modo servidor HTTP con endpoint compatible con `/v1/embeddings`, apto para integrarse en servicios existentes.
- No es un modelo generativo: no produce texto, no soporta tool calling, no ejecuta razonamiento multi-paso ni dispone de modo thinking, visión o audio.

## Casos de uso

- Búsqueda semántica en corpus multilingües: indexar documentos en varios idiomas y recuperar por consulta en cualquiera de ellos, aprovechando la cobertura de más de 100 idiomas y los 8192 tokens de contexto para fragmentos largos.
- Búsqueda híbrida en producción: combinar la señal dense con los pesos sparse del mismo modelo para mejorar la recuperación de términos exactos (nombres propios, referencias, códigos) sin mantener dos modelos separados.
- Reranking con ColBERT: usar los vectores por token de la variante con cabezas para reordenar los candidatos devueltos por una primera fase de recuperación, con una precisión por token verificada de 0,9911 frente a la referencia FP32.
- Despliegue en entornos sin Python: servir embeddings desde un binario C/C++ con CrispEmbed en contenedores mínimos, sistemas embebidos o infraestructura donde instalar PyTorch u ONNX no es viable.
- Aplicaciones de escritorio o edge: con el fichero Q4_K de 438 MB (solo dense) o el Q8_0 con cabezas de 763 MiB, el modelo cabe en equipos con recursos limitados y no requiere GPU.
- Clasificación y deduplicación de documentos: calcular embeddings de un corpus y agrupar por similitud coseno para detectar duplicados, near-duplicates o temas recurrentes en atención al cliente y gestión documental.
- Construcción de índices vectoriales para RAG: generar los vectores de indexación de una base de conocimiento y las consultas de usuario con el mismo modelo, garantizando coherencia entre espacio de indexación y de consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB u otros) en la información disponible. Los únicos datos numéricos publicados son verificaciones de fidelidad de la cuantización frente a la referencia FP32:

| Métrica | Referencia | Resultado |
|---|---|---|
| Similitud coseno dense (variantes dense) | sentence-transformers | ≥ 0,999 |
| ColBERT, mínimo por token, Q8_0 uniforme | FlagEmbedding FP32 | 0,61 |
| ColBERT, mínimo por token, Q8_0 con bloques 0-11 en F16 (CPU) | FlagEmbedding FP32 | 0,9726 |
| ColBERT, mínimo por token, Q8_0 con bloques 0-11 en F16 (CUDA, T4) | referencia F16 en CPU | 0,9667 |
| ColBERT, mínimo por token, Q8_0 con bloques 0-15 en F16 (CPU) | FlagEmbedding FP32 | 0,9911 |
| ColBERT, mínimo por token, Q8_0 con bloques 0-15 en F16 (CUDA, T4) | referencia F16 en CPU | 0,9922 |
| Dense y sparse, variante con bloques 0-15 en F16 | FlagEmbedding FP32 | > 0,9995 |
| ColBERT, mínimo por token, Q4_K con cabezas | FlagEmbedding FP32 | 0,37-0,60 (no publicado) |

El panel de verificación consta de 77 textos y las pruebas se ejecutaron con `BGEM3FlagModel` en FP32 como referencia.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K dense ocupa 438 MB en disco y requiere del orden de 0,5 GB de memoria en inferencia; el Q8_0 dense, 583 MB; el F32, 2175 MB; el Q8_0 con cabezas y bloques 0-15 en F16, 763 MiB; el F16 con cabezas, 1599 MiB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre para las variantes cuantizadas; una Tesla T4 es suficiente para la variante Q8_0 con cabezas, según las pruebas del autor. Para lotes grandes o throughput alto, A100 o H100 aportan margen, aunque el modelo es pequeño y no las requiere.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM (GTX 1650, RTX 3060, RTX 4090, entre otras). También funciona en CPU.
- Opciones de despliegue: CrispEmbed (CLI y modo servidor con endpoint `/v1/embeddings`), que es el motor previsto por el autor. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible; el layout por defecto de los primeros ficheros es de estilo Ollama, pero no se confirma su compatibilidad con esa herramienta.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modos de recuperación | Licencia | Formato |
|---|---|---|---|---|---|
| cstr/bge-m3-GGUF (esta ficha) | 568M | 8192 | dense, sparse y ColBERT (solo ficheros con cabezas) | MIT | GGUF |
| BAAI/bge-m3 (original) | 568M | 8192 | dense, sparse y ColBERT | MIT | safetensors |
| BAAI/bge-large-en-v1.5 | no disponible en la información | no disponible | dense | MIT | safetensors |
| intfloat/multilingual-e5-large | no disponible en la información | no disponible | dense | MIT | safetensors |

La comparación relevante es contra el modelo original: esta conversión replica los pesos de BAAI/bge-m3 con fidelidad verificada, pero solo las variantes con cabezas igualan la funcionalidad completa del original. Para alternativas de otros proveedores no se dispone de datos de rendimiento en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas, no redacta texto y no ejecuta instrucciones. Solo produce representaciones vectoriales.
- Las variantes dense (`bge-m3.gguf`, `-q8_0`, `-q4_k`) descartan las cabezas sparse y ColBERT; usarlas para búsqueda híbrida o reranking dará resultados incorrectos o incompletos.
- La cuantización Q8_0 uniforme degrada la salida ColBERT hasta una similitud mínima por token de 0,61, insuficiente para producción. Solo las variantes mixtas con bloques en F16 son adecuadas para ColBERT.
- La variante `bge-m3-heads-q8_0-mixed.gguf` está marcada como superseded: no alcanza el umbral en CUDA (0,9667 en T4) y debe sustituirse por `bge-m3-heads-q8_0-enc0-15-f16.gguf`.
- No existe variante Q4_K con cabezas publicada: la cuantización a 4 bits rompe la fidelidad de ColBERT.
- Las verificaciones se hicieron sobre un panel de 77 textos; no constituyen una evaluación exhaustiva en todos los dominios e idiomas.
- Riesgo de sesgo y alucinación: no se documentan evaluaciones de sesgo en la información disponible. Al ser un modelo de recuperación, el riesgo se traslada a la calidad del ranking y a la posible infrarrepresentación de ciertos idiomas o variedades lingüísticas.
- La licencia MIT permite uso comercial, pero el autor declara explícitamente que no otorga derechos adicionales a los de la licencia upstream y que la responsabilidad sobre datos de entrenamiento y capacidades recae en BAAI.
- En el marco del Reglamento (UE) 2024/1689, el proveedor del modelo sigue siendo BAAI; esta conversión no constituye un nuevo modelo de propósito general.
- El único motor documentado es CrispEmbed; no se confirma el funcionamiento con otras herramientas GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cstr/bge-m3-GGUF
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Motor de inferencia CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Fichero Q4_K: https://huggingface.co/cstr/bge-m3-GGUF/resolve/main/bge-m3-q4_k.gguf
- Fichero Q8_0: https://huggingface.co/cstr/bge-m3-GGUF/resolve/main/bge-m3-q8_0.gguf
- Fichero F32: https://huggingface.co/cstr/bge-m3-GGUF/resolve/main/bge-m3.gguf
