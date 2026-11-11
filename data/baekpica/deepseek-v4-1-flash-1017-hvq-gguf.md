# Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-hVQ-GGUF es una cuantización experimental de muy bajo bit de `deepseek-ai/DeepSeek-V4.1-Flash-1017`, el modelo insignia de DeepSeek publicado el 17 de octubre. La desarrolla el usuario Baekpica, no DeepSeek, y aplica una técnica propia de cuantización vectorial con realimentación de error (hVQ) sobre los expertos enrutados de una arquitectura de mezcla de expertos (MoE). El resultado se distribuye en formato GGUF con un contexto declarado de 1.048.576 tokens y capacidades multimodales de imagen y texto.

La innovación central es la sustitución de los codebooks de cuantización vectorial (VQ) por una asignación de índices que incorpora la correlación de las entradas reales, al estilo GPTQ/GPTVQ. Según el autor, esto reduce el error medio por capa de la salida de los expertos enrutados de 0,2876 a 0,1885 (-34,5 %) y la KL en posiciones generadas de 0,2899 a 0,2408 (-17,0 %) respecto al modelo original en FP4/FP8, a costa de un aumento del 0,9 % en la NLL. Los expertos enrutados quedan a unos 1,6 bits por peso.

Es relevante porque demuestra que es posible servir un modelo MoE de gran tamaño con visión y contexto de un millón de tokens en hardware de una sola máquina (DGX Spark, GB10), manteniendo el mismo diseño de fichero que las variantes VQ e iVQ previas. No obstante, es una publicación de investigación con cero descargas, sin mediciones de velocidad ni de generación muestreada, y con un número de parámetros declarado en safetensors (485 millones) que no concuerda con el tamaño del repositorio (317,6 GB), lo que obliga a tratar las cifras con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con torres MTP, sidecar de visión y tablas Engram; cuantización vectorial con realimentación de error (hVQ) sobre los expertos enrutados |
| Parametros totales | 485.283.840 según safetensors; no disponible el recuento total real del modelo base (el repositorio ocupa 317,6 GB y el GGUF base 113.556.639.424 bytes, lo que apunta a un modelo mucho mayor) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (según metadatos del modelo) |
| Tipos de cuantizacion | GGUF con expertos enrutados a ~1,6 bits por peso; capas 0-13 con 13 bits K=8192, capas 14-39 con 12 bits K=4096; esqueleto q4_K; ganancias de fila en F16 |
| Idiomas soportados | en, zh, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (40 partes) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 40 capas de expertos enrutados, torres de decodificación especulativa MTP (multi-token prediction), un módulo de visión independiente y tablas Engram. Esta publicación no entrena el modelo: parte del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash-1017` en la revisión `1bae0e1` y solo recuantiza los 40 blobs de expertos enrutados, manteniendo byte a byte el esqueleto q4_K, las torres MTP, el sidecar de visión y las tablas Engram respecto a la variante VQ.

La técnica hVQ divide cada matriz de experto en vectores de 8 pesos por fila, normaliza cada fila por su ganancia y sustituye cada vector por uno de K codewords compartidos. Frente a iVQ, que solo usa la diagonal de la matriz de segundo momento de las entradas `H = Σ x xᵀ`, hVQ incorpora la parte fuera de la diagonal con realimentación de error: los bloques se asignan en orden y el error de cada bloque se propaga a los objetivos de los bloques posteriores mediante el factor `V` de `H_t = D^{1/2}((1-t)I + tR)D^{1/2}`. El parámetro `t = 1` se eligió una sola vez sobre cuatro capas y se aplicó a las 40. La calibración usó 3.095 secuencias y 3.653.893 tokens del mismo flujo de profesor que iVQ. Solo cambian los índices de código y las ganancias de fila en F16; los codebooks son idénticos a los de iVQ.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 1.048.576 tokens.
- Procesamiento de imagen y texto (`image-text-to-text`), gracias al sidecar de visión heredado del modelo base.
- Decodificación especulativa mediante las torres MTP incluidas en el paquete.
- Soporte multilingüe en inglés, chino y coreano.
- Compatibilidad con el runtime `ds4-dfm-rs` sobre CUDA (DGX Spark) y con `ds4-server` de YoungAi, que lee el mismo diseño de fichero.
- No hay información en la documentación proporcionada sobre tool calling, function calling, modo thinking ni capacidades de audio.

## Casos de uso

- Procesamiento de documentos largos en una sola pasada: con 1.048.576 tokens de contexto, el modelo puede ingerir contratos, expedientes o bases de código completas sin troceado, algo crítico cuando la coherencia entre secciones lejanas importa.
- Análisis de imágenes con texto asociado: el pipeline `image-text-to-text` permite describir capturas, extraer datos de diagramas o responder preguntas sobre figuras dentro de un flujo documental.
- Investigación sobre cuantización extrema: el paquete sirve como referencia reproducible para comparar VQ, iVQ y hVQ sobre los mismos codebooks y el mismo diseño de fichero, midiendo solo el efecto de la realimentación de error.
- Despliegue en hardware de una sola máquina: pensado para DGX Spark (GB10) con el runtime `ds4-dfm-rs`, permite ejecutar un MoE de gran tamaño en un equipo de sobremesa con CUDA en lugar de un clúster.
- Evaluación de fidelidad de modelos comprimidos: los datos de error por capa y KL permiten validar pipelines de cuantización antes de adoptarlos en producción.
- Traducción y asistentes en inglés, chino y coreano: los tres idiomas declarados cubren casos de atención al cliente y localización en esos mercados, aunque sin garantías de calidad fuera de ellos.

## Benchmarks y rendimiento

| Metrica | Original FP4/FP8 | hVQ | Variacion |
|---|---|---|---|
| Error medio por capa (mediana) de salida de expertos enrutados | 0,2876 | 0,1885 | -34,5 % |
| KL en posiciones generadas | 0,2899 | 0,2408 | -17,0 % |
| NLL en posiciones generadas | 1,3466 | 1,3589 | +0,9 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son medidas de fidelidad con teacher forcing frente al modelo original, no evaluaciones de capacidad. El autor indica que la velocidad de servicio y el consumo de memoria en DGX Spark no se han medido para estos ficheros, y que la generación muestreada tampoco se ha evaluado.

## Requisitos de hardware

- El GGUF base ocupa 113.556.639.424 bytes (unos 113,6 GB) repartidos en 40 partes, por lo que la VRAM o memoria unificada necesaria para cargarlo completo ronda esa cifra más el overhead del runtime.
- Hardware objetivo declarado: DGX Spark con GB10 y CUDA, mediante `ds4-dfm-rs`; el servidor `ds4-server` de YoungAi lee el mismo diseño.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB) por el tamaño del conjunto de pesos; requeriría memoria unificada o un sistema multi-GPU.
- Opciones de despliegue: `ds4-dfm-rs` (CUDA) y `ds4-server`. No se menciona compatibilidad con llama.cpp, vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; el autor confirma que no se han medido para estos ficheros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-hVQ-GGUF | 485.283.840 según safetensors (no concordante con el tamaño real) | 1.048.576 | GGUF hVQ, expertos a ~1,6 bits | MIT | Experimental, 0 descargas |
| DeepSeek-V4.1-Flash-1017-iVQ-GGUF | Mismo inventario de tensores | 1.048.576 | GGUF iVQ, mismos codebooks | MIT | Publicado por el mismo autor |
| DeepSeek-V4.1-Flash-1017-VQ-GGUF | Mismo inventario de tensores | 1.048.576 | GGUF VQ (`vq8sh14-q4k-mtpnative`) | MIT | Base de la lineage |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | 1.048.576 | FP4/FP8 | no disponible en la información | Modelo original de DeepSeek |

Las tres variantes de Baekpica comparten diseño de fichero, codebooks y tamaño, de modo que la comparación aísla el efecto del método de asignación de índices. No se dispone de datos de benchmarks estándar para comparar capacidades con modelos de otras familias.

## Limitaciones y advertencias

- Publicación experimental de muy bajo bit: los expertos enrutados están a ~1,6 bits por peso, lo que puede degradar la calidad en generación libre pese a las métricas de fidelidad con teacher forcing.
- El autor no ha medido generación muestreada, velocidad ni memoria en DGX Spark; no hay garantías de comportamiento en producción.
- El recuento de parámetros en safetensors (485 millones) no concuerda con el tamaño del repositorio ni del GGUF, lo que sugiere un dato erróneo o incompleto; no debe usarse para dimensionar el despliegue.
- Cero descargas y cero valoraciones: no hay evidencia de la comunidad sobre estabilidad o calidad.
- Idiomas limitados a inglés, chino y coreano; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta cuantización.
- La licencia MIT se hereda del paquete, pero conviene verificar los términos del modelo base de DeepSeek antes de un uso comercial.
- Requiere un runtime específico (`ds4-dfm-rs` o `ds4-server`); no es un GGUF estándar compatible con llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF
- Variante iVQ: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-iVQ-GGUF
- Variante VQ: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/tree/1bae0e1088993b9b82de08f59de5be5a34e42170
- Runtime: https://github.com/Baekpica/ds4-dfm-rs
- Discusiones: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF/discussions
