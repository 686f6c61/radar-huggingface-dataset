# Baekpica/Hy4-flash-Mixed-Quant-GGUF

## Resumen

Hy4-flash Mixed-Quant GGUF es una conversión de cuantización mixta del modelo multimodal `tencent/Hy4-flash` (variante instruct), publicada por el usuario independiente Baekpica. No se trata de un modelo nuevo, sino de una redistribución de pesos en formato GGUF optimizada para ejecutar un modelo de gran tamaño en hardware con memoria limitada, concretamente en una NVIDIA DGX Spark. El artefacto principal ("trunk") ocupa 98,91 GiB con una media de 5,4744 bits efectivos por peso en la receta MQ-Q5, y 96,79 GiB con 5,3569 bits en la receta MQ-Q5-Q8.

El modelo base es un transformer multimodal con arquitectura MoE de tipo LatentMoE: 42 capas, dimensión oculta de 3.072, 512 expertos enrutados con top-16 y enrutamiento sigmoide, atención MLA con puerta (12 capas dispersas con IndexPool y 30 capas de ventana deslizante de 512 tokens), un torre de visión SigLIP2-So400m y memorias n-grama Engram (bigrama y trigrama) en cuatro capas. Declara una longitud de contexto de 1.048.576 tokens.

La relevancia de esta publicación es de ingeniería: demuestra una estrategia de jerarquía de memoria (trunk en VRAM, tablas Engram y embeddings en SSD, torre de visión mapeada bajo demanda) que permite servir un modelo de escala muy superior a la memoria del dispositivo. Los ficheros no son cargables por llama.cpp, vLLM ni SGLang sin modificaciones, ya que dependen del host Rust `ds4-dfm-rs`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (LatentMoE) multimodal con atención MLA, memorias Engram y torre SigLIP2 |
| Parametros totales | 845.686.433 (dato de safetensors del repo; no coherente con la escala descrita del modelo base, probablemente parcial) |
| Parametros activos | top-16 de 512 expertos enrutados (por capa) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | Mixta: Q5_K / Q4_K en expertos enrutados, Q8_0 en proyecciones de atención y proyecciones densas, BF16 en routers y capas no cuantizadas; FP8 E4M3 en tablas Engram |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | GGUF (múltiples shards; trunk + `dfly2-bf16.gguf` / `dfly2-q8_0.gguf`) |

## Arquitectura y entrenamiento

El backbone consta de 42 capas con dimensión oculta 3.072 y 4 flujos residuales iHC. La capa 0 es un FFN denso y las capas 1 a 41 son LatentMoE: 512 expertos enrutados, top-16, enrutamiento sigmoide, un experto compartido y ejecución de expertos en un espacio latente de 1.536 dimensiones entre dos proyecciones compartidas. La atención es MLA con puerta, combinando 12 capas dispersas (IndexPool selecciona hasta 512 grupos de cuatro tokens) y 30 capas de ventana deslizante de 512 tokens. Incorpora memorias Engram de bigramas y trigramas en las capas 1, 11, 21 y 31 (16 cabezas hash × 96 dimensiones por capa, 660.006.416 filas en total) y una torre de visión SigLIP2-So400m con proyector.

La conversión sigue un mapa de precisión derivado de la release FP8 oficial de Tencent: los tensores que Tencent mantiene en BF16 no se cuantizan, los expertos enrutados (95,7% de los parámetros del trunk) pasan a Q5_K/Q4_K y tres proyecciones de atención por capa a Q8_0. La receta MQ-Q5-Q8 desvía de esa regla para ganar velocidad: proyecciones densas y cabeza de salida en Q8_0 (error L2 relativo de 0,53–0,66%) y routers en BF16. No se usa matriz de importancia; la conversión es determinista desde el checkpoint BF16 fijado. Las tablas Engram (118 GiB) se trasladan a SSD en FP8 exacto (61,4 GiB, con verificación fila a fila), el embedding de tokens se lee fila a fila desde SSD y la torre de visión se mapea solo cuando llega una imagen. Se conserva el drafter DFly2 de 5 capas para decodificación especulativa. No se dispone de información sobre el dataset de entrenamiento original ni sobre fases de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento de propósito general (modelo instruct).
- Procesamiento multimodal imagen-texto: entrada de imágenes mediante torre SigLIP2 y proyector.
- Procesamiento de vídeo MP4 según el host de servicio `ds4-dfm-rs`.
- Soporte de tool calling / function calling, indicado en la model card del host.
- Recuperación de contexto muy largo: se validó una petición de 1.048.542 tokens que recuperó una referencia plantada.
- Decodificación especulativa mediante drafter DFly2 (versiones BF16 y Q8_0).
- Memorias Engram n-grama para recuperación léxica asociativa.
- Capacidades multilingües: no disponible.

## Casos de uso

- Procesamiento de documentos extensos: el contexto declarado de 1.048.576 tokens permite ingerir libros completos, expedientes o bases de código en una sola petición y formular preguntas sobre ellos, con recuperación verificada a esa escala.
- Análisis de imágenes en flujos documentales: la torre SigLIP2 permite extraer información de capturas, diagramas o páginas escaneadas junto con texto, mapeando la torre solo cuando llega una imagen para no ocupar memoria residente.
- Servicio de vídeo con descripción y preguntas: el host `ds4-dfm-rs` acepta MP4 y permite resumir o interrogar contenido audiovisual, adecuado para indexación de archivos multimedia.
- Agentes con tool calling: la integración de llamadas a funciones permite construir agentes que consulten APIs o bases de datos y encadenen varios pasos, aprovechando el contexto largo para mantener el estado de la conversación.
- Inferencia en hardware de memoria unificada limitada: el diseño de trunk en VRAM más Engram y embeddings en SSD hace viable ejecutar un modelo de esta escala en una DGX Spark, un escenario que de otro modo requeriría un clúster multi-GPU.
- Investigación en cuantización mixta: las dos recetas publicadas (MQ-Q5 y MQ-Q5-Q8) y sus informes permiten reproducir y comparar el impacto de distintos mapas de precisión sobre la perplejidad y la velocidad de decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son de servicio en DGX Spark con el host `ds4-dfm-rs`:

| Metrica | MQ-Q5-Q8 | MQ-Q5 |
|---|---|---|
| Prefill (media, barrido 2K–64K) | 1.170,10 tokens/s | 1.187,23 tokens/s |
| Decode (media, barrido 2K–64K) | 20,97 tokens/s | 19,49 tokens/s |
| Bytes leídos por token en decodificación | 11,17 GB | 13,45 GB |
| Tamano del trunk | 96,79 GiB | 98,91 GiB |
| Bits efectivos por peso | 5,3569 | 5,4744 |

Además, el backend CUDA ds4 reportó 103,10 y 102,61 GiB de asignaciones base en dispositivo con proyecciones Q8 alineadas habilitadas, y la caché latente FP8 más las claves de índice se estiman en 8,28 GiB para un historial completo.

## Requisitos de hardware

- VRAM estimada: el trunk requiere del orden de 97–99 GiB de memoria; con asignaciones base se observaron 102,6–103,1 GiB en DGX Spark con memoria unificada.
- Almacenamiento: el repo completo ocupa 280,5 GB; las tablas Engram en SSD suman 61,4 GiB y el embedding de tokens se lee desde disco.
- GPU recomendadas: NVIDIA DGX Spark (hardware validado). No hay datos de funcionamiento en A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (24 GB o menos); el modelo excede ampliamente esa VRAM incluso con cuantización agresiva.
- Despliegue: exclusivamente mediante `ds4-dfm-rs` (host Rust, PR #159). No es cargable por llama.cpp, vLLM, SGLang, Ollama ni TGI tal cual, porque las tablas Engram y el embedding viven fuera del trunk.
- Latencia y throughput: 1.170,10 tokens/s de prefill y 20,97 tokens/s de decode en DGX Spark con MQ-Q5-Q8.
- Nota: el drafter `dfly2-q8_0.gguf` es el predeterminado; `dfly2-bf16.gguf` solo si se desea precisión de origen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash Mixed-Quant GGUF (este) | MoE top-16 de 512 expertos, 42 capas | 1.048.576 | GGUF mixto, solo `ds4-dfm-rs` | tencent-hy-license | Hugging Face, 468 descargas |
| tencent/Hy4-flash (base) | Misma arquitectura | 1.048.576 | Safetensors BF16 | tencent-hy-license | Hugging Face (oficial) |
| tencent/Hy4-flash-FP8 | Misma arquitectura | 1.048.576 | FP8 E4M3 | tencent-hy-license | Hugging Face (oficial) |
| AngelSlim/Hy4-flash-GGUF | Misma arquitectura | 1.048.576 | GGUF estándar (layout upstream) | tencent-hy-license | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks que permitan contrastarlo con modelos de otras familias.

## Limitaciones y advertencias

- Incompatibilidad de despliegue: los ficheros no se cargan en llama.cpp, vLLM ni SGLang sin modificaciones; requieren el host `ds4-dfm-rs`.
- El dato de parámetros totales del repo (845.686.433) no es coherente con la arquitectura descrita (512 expertos, 42 capas) y probablemente refleja solo una parte de los tensores; no debe usarse para estimar el tamaño real.
- Licencia `tencent-hy-license`: es necesario revisar sus términos antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluación publicada de fidelidad factual.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- El rendimiento medido corresponde únicamente a DGX Spark; no hay datos de latencia o throughput en otras GPUs.
- El diseño depende de SSD para Engram y embeddings: el rendimiento puede degradarse con almacenamiento lento o bajo contención de E/S.
- La cuantización mixta introduce error (L2 relativo de 0,53–0,66% en las proyecciones densas de la receta Q8); la receta MQ-Q5 se ofrece como referencia de precisión de origen.
- Publicación de un autor independiente con 0 likes y 468 descargas; no es una release oficial de Tencent.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Baekpica/Hy4-flash-Mixed-Quant-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Release FP8 oficial: https://huggingface.co/tencent/Hy4-flash-FP8
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959/LICENSE
- Host de inferencia: https://github.com/Baekpica/ds4-dfm-rs/pull/159
- PR de llama.cpp con el layout GGUF de la arquitectura: https://github.com/ggml-org/llama.cpp/pull/32517
- GGUF alternativo: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Apoyo al autor: https://www.buymeacoffee.com/baekpica
- Patrocinio: https://github.com/sponsors/Baekpica
