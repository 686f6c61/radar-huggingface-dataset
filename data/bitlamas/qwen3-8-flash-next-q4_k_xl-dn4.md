# bitlamas/Qwen3.8-Flash-Next-Q4_K_XL-DN4

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje experimental de Qwen con arquitectura MoE: un modelo principal de 125.000 millones de parámetros complementado con 51.000 millones de embeddings n-gram, activando 6.000 millones de parámetros por token. Esta ficha cubre la cuantización GGUF Q4_K_XL-DN4 creada por bitlamas, que modifica la cuantización UD-Q4_K_XL de unsloth para reducir el tamaño de 111,3 GB a 102,5 GB, sustituyendo las proyecciones down de los 48 expertos de Q5_1 a IQ4_NL. El objetivo es ejecutar el modelo en hardware con memoria unificada limitada, como el AMD Strix Halo de 128 GB, manteniendo una calidad casi idéntica (perplejidad 2,9165 frente a 2,9117). El modelo admite un contexto de 262.144 tokens y está diseñado para su uso con llama.cpp en Vulkan, con soporte de decodificación especulativa mediante un draft head MTP y un drafter n-gram. Es relevante para quienes necesitan modelos grandes de codificación y oficina en entornos locales con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal, hyper-connections, expertos compartidos y tabla n-gram por capas (modelo base Qwen3.8-Flash-Next) |
| Parametros totales | 176.943.899.520 (≈176,9 mil millones) |
| Parametros activos | 6.000 millones (activados por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_XL con proyecciones down en IQ4_NL (este archivo); variantes de referencia: UD-Q4_K_XL, UD-IQ4_XS, Q4_K_M (draft head) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next, según el repositorio de QwenLM, combina un modelo principal de 125.000 millones de parámetros con 51.000 millones de embeddings n-gram, activando 6.000 millones de parámetros por token. La arquitectura incluye atención lineal, hyper-connections y un experto compartido, además de una tabla n-gram por capas que ocupa 28,8 GB en la cuantización. Según la descripción oficial, el entrenamiento requiere aproximadamente una novena parte del coste de Qwen3.7-Plus y ofrece capacidades superiores en tareas de codificación y oficina. No se han proporcionado detalles sobre la composición del dataset, el número de tokens de entrenamiento ni si se aplicó RLHF o DPO.

La cuantización Q4_K_XL-DN4 parte de la versión UD-Q4_K_XL de unsloth y aplica un cambio: las proyecciones down de los 48 expertos se convierten de Q5_1 a IQ4_NL. La justificación técnica es que estas proyecciones tienen un ancho de 640 valores, que no es múltiplo de 256, por lo que los K-quants o I-quants con bloques de 256 no pueden aplicarse. IQ4_NL, de la familia de 32 bloques a 4,5 bits, permite reducir 8,9 GB sin alterar el resto de tensores. El autor también probó a requantizar con la matriz de importancia publicada por unsloth y no encontró diferencias significativas (KL divergencia 0,0282 sin imatrix frente a 0,0277 con imatrix), por lo que se descartó esa versión.

## Capacidades

- Generación de texto y razonamiento: modelo de lenguaje autoregresivo con capacidad de procesar y generar texto en contextos largos.
- Codificación y tareas de oficina: según la descripción oficial del modelo base, ofrece capacidades superiores a Qwen3.7-Plus en coding y office tasks.
- Contexto largo de 262.144 tokens: permite procesar documentos extensos o múltiples fragmentos en una sola pasada.
- Decodificación especulativa: soporta un draft head MTP (multi-token prediction) y un drafter n-gram, que aceleran la generación en texto nuevo y la edición de texto existente.
- Ejecución local en hardware con memoria unificada: optimizado para ejecutarse con llama.cpp sobre Vulkan en sistemas como AMD Strix Halo, manteniendo todo el transformer en GPU.
- Compatibilidad con endpoints: el modelo está etiquetado como `endpoints_compatible` y `conversational`, lo que permite desplegarlo como servicio de chat.

## Casos de uso

- Asistente de código en local: gracias a su capacidad de codificación y a la cuantización de 4 bits, puede ejecutarse en una estación de trabajo con 128 GB de RAM unificada, integrándose en un IDE o en un pipeline de CI/CD para revisión y generación de código.
- Procesamiento de documentos extensos: con 262.144 tokens de contexto, puede analizar informes, contratos o libros completos sin dividir el texto, útil en el sector legal o editorial.
- Tareas de oficina y productividad: según el desarrollador, supera a Qwen3.7-Plus en tareas de oficina; puede redactar correos, resúmenes y reportes en un entorno local.
- Servicio de chat conversacional: el modelo está etiquetado como conversacional y compatible con endpoints; puede desplegarse con llama-server para chatbots internos.
- Edición y reescritura de texto: el n-gram drafter acelera las ediciones sobre texto existente, lo que lo hace adecuado para herramientas de reescritura o corrección de estilo.
- Investigación en cuantización de modelos MoE: la modificación de las proyecciones down a IQ4_NL demuestra cómo reducir el tamaño de archivo sin pérdida significativa; sirve como referencia para optimizar cuantizaciones en modelos con expertos.
- RAG con contexto muy largo: la ventana de 262.144 tokens permite incluir numerosos fragmentos de documentos en el prompt, mejorando la precisión de sistemas de recuperación aumentada en dominios especializados.

## Benchmarks y rendimiento

Se han publicado mediciones de calidad de cuantización sobre wikitext-2 (24 bloques de 2048 tokens, con `-b 2048 -ub 1024 -fa on`), comparando este archivo con las variantes de unsloth:

| Variante | Tamaño | Perplejidad (wikitext-2) | KL divergencia vs UD-Q4_K_XL | Mismo top-1 |
|---|---|---|---|---|
| unsloth UD-Q4_K_XL | 111,3 GB | 2,9117 ± 0,0363 | referencia | referencia |
| este archivo (Q4_K_XL-DN4) | 102,5 GB | 2,9165 ± 0,0363 | 0,028 ± 0,001 | 94,5 % |
| unsloth UD-IQ4_XS | 93,7 GB | 2,998 ± 0,037 | 0,089 | 90,75 % |

También se evaluó el efecto de la matriz de importancia en la requantización de las proyecciones down:

| Downs requantizados | KL divergencia vs UD-Q4_K_XL | Mismo top-1 |
|---|---|---|
| sin imatrix (este archivo) | 0,0282 ± 0,0007 | 94,50 % |
| con imatrix | 0,0277 ± 0,0007 | 94,60 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La comparación con Qwen3.7-Plus en el repositorio oficial es cualitativa y no incluye cifras.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 102,5 GB. En la máquina de referencia (AMD Strix Halo con 128 GB unificados y shared memory a 124 GB), el modelo con KV cache q4_0 y draft head Q4_K_M ocupa entre 77,9 y 78,5 GiB en GPU para un contexto de 262.144 tokens.
- GPU recomendadas: una GPU dedicada con al menos 80 GB de VRAM (por ejemplo, H100 80GB o A100 80GB) podría alojar el modelo con contexto reducido o moviendo capas de expertos a CPU. En GPUs de consumo (RTX 4090 24GB) no cabe.
- Opciones de despliegue: llama.cpp (llama-server) con Vulkan, usando `-ngl 99`, `-fa on`, `-ctk q4_0 -ctv q4_0`, `-ub 512`, `-lm mmap --lazy-mode on`. El formato GGUF permite su uso con otros frontends de llama.cpp, aunque no se ha probado explícitamente con Ollama o similares.
- Latencia y throughput: el draft head MTP aporta alrededor de un 50 % más de velocidad en texto nuevo; el n-gram drafter aporta alrededor de un 13 % en ediciones. No se proporcionan valores absolutos de tokens por segundo.

## Comparativa con modelos similares

Las alternativas más directas son las otras cuantizaciones del mismo modelo base, todas con la misma licencia y disponibles en HuggingFace:

| Variante | Tamaño | Perplejidad | KL divergencia vs UD-Q4_K_XL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unsloth UD-Q4_K_XL | 111,3 GB | 2,9117 | referencia | qwen-community-1.0 | HuggingFace |
| este archivo (Q4_K_XL-DN4) | 102,5 GB | 2,9165 | 0,028 | qwen-community-1.0 | HuggingFace |
| unsloth UD-IQ4_XS | 93,7 GB | 2,998 | 0,089 | qwen-community-1.0 | HuggingFace |

El modelo base sin cuantizar no se ha incluido en esta comparativa porque no se dispone de datos de tamaño o rendimiento en la información consultada. Qwen3.7-Plus se menciona como referencia en el repositorio oficial, pero sin cifras de benchmark.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información consultada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para esta cuantización.
- Limitaciones de contexto o idioma: el contexto máximo es 262.144 tokens, pero la KV cache cuantizada a q4_0 introduce una pérdida de calidad medible (KL divergencia de 0,026 frente a una cache f16 a 2048 tokens, y 0,020 a 16k). Los idiomas soportados no se han especificado.
- Restricciones de licencia: la licencia es qwen-community-1.0, una licencia "other" que debe revisarse en el archivo LICENSE antes de un uso comercial. No se dispone de información sobre sus términos exactos.
- Caveat para producción: el autor señala que la cuantización de las proyecciones down se hizo sin imatrix, y aunque midió que no hay diferencia significativa, recomienda que una cuantización desde el checkpoint BF16 con imatrix sería el enfoque correcto. Además, en Vulkan, mezclar tipos de KV (claves q4_0 con valores q8_0) saca la atención del camino rápido y reduce el rendimiento de decodificación. El modelo requiere al menos ~78 GiB de VRAM para el contexto completo, lo que limita su despliegue a hardware específico.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/bitlamas/Qwen3.8-Flash-Next-Q4_K_XL-DN4
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
