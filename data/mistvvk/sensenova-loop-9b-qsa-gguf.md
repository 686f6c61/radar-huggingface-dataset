# MistVVK/SenseNova-Loop-9B-QSA-GGUF

## Resumen

SenseNova-Loop-9B-QSA-GGUF es una conversión no oficial a formato GGUF del modelo multimodal SenseNova-Loop-9B, desarrollada por el usuario MistVVK. El modelo base, publicado por SenseNova, emplea una arquitectura de transformer con capas "looped" (reutilización iterativa de capas), en la que 32 capas decodificadoras distintas se ejecutan 56 veces, lo que permite un razonamiento más profundo sin incrementar el número de parámetros. Sobre esa base, esta versión añade indexadores QSA (Qwen Sparse Attention) entrenados específicamente para las 14 ejecuciones de atención completa, lo que introduce un mecanismo de atención dispersa por bloques de 4 tokens con un presupuesto de 2048 tokens.

El modelo resuelve el problema de la eficiencia en el contexto largo: en lugar de atender densamente a toda la secuencia, el runtime selecciona los 512 mejores bloques completos (2048 tokens) junto con el bloque causal actual. Esto reduce el coste computacional de la atención sin degradar la calidad, según las comprobaciones del autor, que verifican logits bit-idénticos entre QSA y atención densa en varios escenarios.

Es relevante ahora porque demuestra que es posible aplicar atención dispersa entrenada a un modelo de 9.236.945.536 parámetros con licencia Apache-2.0, en un momento en que la comunidad busca alternativas eficientes a la atención cuadrática para modelos multimodales de tamaño medio. La conversión incluye cuantizaciones BF16, Q8_0, Q5_K_M y Q4_K_M, lo que facilita el despliegue en hardware consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas looped (32 capas ejecutadas 56 veces) + QSA (atención dispersa por bloques) |
| Parametros totales | 9.236.945.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presupuesto de atención QSA: 2048 tokens en 512 bloques de 4 tokens) |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también disponible el modelo base en transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con "looping": 32 capas decodificadoras distintas que se ejecutan 56 veces en secuencia, lo que multiplica la profundidad efectiva sin aumentar el número de parámetros. De esas 56 ejecuciones, 14 corresponden a atención completa, y es en cada una de ellas donde esta conversión añade un indexador QSA entrenado por separado. Cada indexador puntúa bloques de 4 tokens y el runtime selecciona los 512 mejores bloques completos (2048 tokens) junto con el bloque causal actual. Los pesos `q_norm`, `k_norm` y `k_block_norm` se almacenan como `1 + w`, y los 70 tensores FP32 del indexador se añaden como `blk.<execution>.indexer.*` en orden de ejecución.

Los indexadores QSA se entrenaron a partir de la atención densa del modelo de referencia BF16, usando el dataset fineweb-edu sample-10BT (ODC-By 1.0) como datos de entrenamiento. No son copias de los indexadores del modelo Qwen3.8-27B-QSA, sino que se entrenaron específicamente para SenseNova-Loop-9B. La metodología QSA proviene de la investigación de Qwen y del código del repositorio higa2515/Qwen3.8-27B-QSA-BF16. El autor verificó la conversión comparando tensores byte a byte, comprobando la selección de índices en 896 posiciones (14 ejecuciones × 64) y confirmando logits bit-idénticos entre QSA y atención densa en varios escenarios. También se validó la decodificación especulativa: con `--spec 3` se aceptaron 66 de 120 borradores (55,0%), aunque está desactivada por defecto.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Procesamiento multimodal image-text-to-text: acepta imágenes y texto combinados (requiere el proyector oficial `mmproj-SenseNova-Loop-9B-F16.gguf`).
- Razonamiento profundo gracias al bucle de 56 ejecuciones sobre 32 capas.
- Atención dispersa QSA para contextos largos con coste reducido.
- Decodificación especulativa opcional (`--spec 3`), con una tasa de aceptación medida del 55,0% en una prueba de 128 tokens.
- Soporte de atención densa alternativa mediante la variable `XESTRATA_SENSENOVA_QSA_DENSE=1`.
- Capacidades multilingües limitadas a inglés (en) y chino (zh).
- No se documenta soporte de tool calling, function calling ni agentes multi-step en la información disponible.

## Casos de uso

- Procesamiento de documentos largos con imágenes: el modelo puede analizar informes, facturas o capturas que combinen texto e imagen, usando el presupuesto de 2048 tokens de atención QSA para mantener el contexto relevante sin coste cuadrático.
- Asistentes conversacionales multimodales: integrable en aplicaciones de chat que reciban capturas de pantalla o fotografías junto con preguntas en inglés o chino, con cuantización Q4_K_M para despliegue en hardware modesto.
- Análisis de imágenes técnicas o diagramas: el pipeline image-text-to-text permite describir, resumir o extraer información de figuras y gráficos en entornos de documentación técnica.
- Investigación sobre atención dispersa: sirve como banco de pruebas para estudiar el impacto de QSA en un modelo looped de 9B, comparando QSA frente a atención densa con logits verificados bit-idénticos.
- Despliegue en entornos con VRAM limitada: las cuantizaciones Q4_K_M (5,97 GB) y Q5_K_M (6,82 GB) permiten ejecutar el modelo en GPUs consumer de 8-12 GB.
- Evaluación de decodificación especulativa: el flag `--spec 3` permite medir la aceleración y tasa de aceptación en cargas de trabajo reales, con datos de referencia ya publicados por el autor.
- Prototipado de aplicaciones multilingües en inglés y chino: adecuado para demos y pruebas de concepto donde no se requiera español u otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: BF16 ~18,6 GB; Q8_0 ~9,9 GB; Q5_K_M ~6,8 GB; Q4_K_M ~6,0 GB (tamaños de archivo; la VRAM real incluye overhead del runtime y del proyector multimodal).
- GPU recomendadas: A100 o H100 para BF16; RTX 4090 (24 GB) para Q8_0 o BF16 con margen; RTX 3090/4080 para Q5_K_M; RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M.
- Cabe en GPU consumer: sí, con Q4_K_M y Q5_K_M en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: motor XeStrata (LGPL-3.0-or-later) mediante `./setup.sh --family sensenova-loop-qsa --model Q4_K_M`; compatible con endpoints (tag `endpoints_compatible`). No se documenta soporte para llama.cpp, Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa (`--spec 3`) aceptó 66 de 120 borradores (55,0%) en una prueba de 128 tokens, pero no se publican cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-QSA-GGUF | 9,24B | no disponible (QSA 2048 tokens) | Apache-2.0 | GGUF | Conversión no oficial con QSA; multimodal |
| SenseNova-Loop-9B (base) | 9,24B | no disponible | Apache-2.0 | safetensors, GGUF | Modelo oficial sin QSA; referencia densa |
| Qwen3.8-27B-QSA-BF16 | 27B (aprox.) | no disponible | Apache-2.0 | BF16 | Origen de la metodología QSA; mayor tamaño |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos. La comparativa se limita a parámetros, licencia y formato según la información disponible.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor no es el desarrollador del modelo base y no hay garantía de soporte o mantenimiento.
- Idiomas limitados a inglés y chino; no se documenta soporte de español ni de otros idiomas.
- La longitud máxima de contexto no se especifica; el presupuesto QSA de 2048 tokens puede limitar el rendimiento en secuencias muy largas si se compara con atención densa completa.
- Se detectaron cinco discrepancias menores en la selección de índices (en las ejecuciones 15, 23, 31 y 47), aceptadas como límite conocido; la causa (diferencias de 1 ulp en `pow` entre dispositivo y CPU) no se estableció como única explicación.
- La decodificación especulativa está desactivada por defecto y su tasa de aceptación (55,0%) se midió en un único caso de 128 tokens.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de sesgo o robustez.
- El uso comercial está permitido por la licencia Apache-2.0, pero el motor XeStrata es LGPL-3.0-or-later, lo que impone obligaciones adicionales si se modifica o distribuye.
- El proyector multimodal debe descargarse por separado (`mmproj-SenseNova-Loop-9B-F16.gguf`); sin él no funcionan las capacidades de imagen.
- Solo 8 descargas y 0 likes en el momento de la ficha: ecosistema muy reducido y poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MistVVK/SenseNova-Loop-9B-QSA-GGUF
- Modelo base SenseNova-Loop-9B: https://huggingface.co/sensenova/SenseNova-Loop-9B
- GGUF oficial de SenseNova-Loop-9B: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- Repositorio de investigación QSA (Qwen3.8-27B-QSA-BF16): https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Motor XeStrata: https://github.com/MistVVK/XeStrata
