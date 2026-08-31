# qtum/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next-GGUF es una colección de cuantizaciones GGUF del modelo Qwen3.8-Flash-Next, preparadas por el usuario qtum mediante llama.cpp. El modelo base, desarrollado por Qwen, es el primer modelo abierto construido sobre la arquitectura Qwen4: un núcleo MoE de 125B parámetros (48 capas, 512 expertos, top-10 más un experto compartido) complementado con una tabla de búsqueda n-gram PLE de 51B, lo que suma aproximadamente 180B parámetros totales. La atención es híbrida, combinando Gated DeltaNet lineal con bloques Qwen Sparse Attention (QSA), envueltos en hyper-connections, y soporta una ventana de contexto de hasta 262K tokens.

Esta versión cuantizada resulta relevante porque permite ejecutar un modelo de 180B en hardware de consumo: el MoE activa solo 6B parámetros por token, y las cuantizaciones van desde 76,4 GiB (IQ1_M-layered) hasta 118,8 GiB (IQ4_XS), con degradación de perplejidad medida sobre el baseline BF16. El repo incluye cuatro niveles de cuantización, todos calibrados con imatrix y distribuidos en 8 shards, con capas críticas protegidas a mayor precisión (router en F32, shared expert en Q8_0, estado de atención lineal en F32, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated DeltaNet lineal + Qwen Sparse Attention (QSA), hyper-connections, PLE n-gram lookup table |
| Parametros totales | 176.943.899.520 (aprox. 180B) |
| Parametros activos | 6B por token (núcleo MoE de 125B con 512 expertos, top-10 + 1 compartido) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | IQ4_XS, IQ3_XXS, IQ2_XS-layered, IQ1_M-layered (todos imatrix-calibrated, 8 shards) |
| Idiomas soportados | en, zh |
| Licencia | Qwen Community License 1.0 (no MIT) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce varias innovaciones sobre la generación anterior. La atención combina bloques Gated DeltaNet (atención lineal con estado recurrente) intercalados con Qwen Sparse Attention (QSA), lo que reduce el coste computacional en contextos largos. Las hyper-connections reemplazan los residuales convencionales, mejorando el flujo de gradientes. La capa de embedding se complementa con una tabla PLE (n-gram lookup) de 51B parámetros que almacena frecuencias de n-gramas y se proyecta mediante capas `ple_key`, `ple_value` y `ple_conv1d`. El checkpoint original incluye una capa MTP (draft) para decodificación especulativa, que fue excluida en la conversión a GGUF.

Los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La cuantización se realizó sobre los pesos oficiales BF16, con calibración imatrix para cada nivel. Las dos cuantizaciones más bajas (IQ2_XS-layered e IQ1_M-layered) usan cuantización por capas: la tabla PLE de 51B se comprime a Q4_0 (tolerante a compresión, sin pérdida medible) y el espacio ahorrado se invierte en los proyectores de gate/up de los expertos, mejorando la perplejidad ~14% respecto a una cuantización uniforme del mismo tamaño.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo de pensamiento opcional (thinking mode) según fuentes externas.
- Procesamiento de contexto largo hasta 262K tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Capacidad multimodal (visión) reportada por fuentes externas (unsloth, Wiro), aunque la model card de esta cuantización solo declara text-generation.
- Soporte multilingüe limitado a inglés y chino (en, zh).
- Decodificación especulativa: el checkpoint original incluye una capa MTP draft, excluida en esta conversión GGUF.
- Ejecución local en hardware de consumo gracias al MoE con 6B parámetros activos y a las cuantizaciones de bajo bit.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU de datacenter: con la cuantización IQ1_M-layered (76,4 GiB) y la tabla PLE paginada desde SSD, puede ejecutarse en equipos con 75-80 GB de RAM unificada, como un MacBook de 64 GB o superior.
- Procesamiento de documentos largos: la ventana de 262K tokens permite resumir, analizar o extraer información de libros completos, expedientes legales o historiales clínicos en una sola pasada.
- Razonamiento multi-step y resolución de problemas complejos: el modo thinking y la arquitectura MoE con 512 expertos permiten abordar tareas de matemáticas, lógica y planificación con calidad comparable a modelos propietarios de mayor tamaño.
- Desarrollo de agentes conversacionales bilingües (en/zh): el modelo mantiene coherencia en diálogos largos y puede integrarse en sistemas de atención al cliente con contexto amplio.
- Generación de código y asistencia técnica: aunque no se detallan benchmarks específicos, el modelo base está orientado a tareas de programación y razonamiento técnico, y puede desplegarse con llama.cpp en entornos de desarrollo.
- Investigación en eficiencia de cuantización: las capas protegidas (router F32, shared expert Q8_0, estado DeltaNet F32) ofrecen un caso de estudio sobre qué tensores son críticos en MoE híbridos con atención lineal.

## Benchmarks y rendimiento

La model card proporciona perplejidad (PPL) en wikitext-2 (test, n_ctx=512, 12 chunks) para cada cuantización, comparada contra el baseline BF16 medido:

| Cuantizacion | Tamano | BPW | PPL (wikitext-2) |
|---|---|---|---|
| BF16 master (referencia) | 329,7 GiB | 15,73 | 1,7164 ± 0,04795 |
| IQ4_XS | 118,8 GiB | 5,67 | 1,8378 ± 0,05554 |
| IQ3_XXS | 107,4 GiB | 5,13 | 2,0528 ± 0,06396 |
| IQ2_XS-layered | 83,5 GiB | 3,98 | 2,7833 ± 0,10058 |
| IQ1_M-layered | 76,4 GiB | 3,65 | 4,4105 ± 0,19322 |

Estos valores solo son comparables dentro de esta tabla, según advierte el autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Fuentes externas (unsloth) afirman que el modelo base supera a Claude-4.6-Opus (Max), pero no se aportan cifras concretas.

## Requisitos de hardware

- VRAM/RAM estimada: cada cuantización requiere al menos su tamaño en memoria (76,4 GiB para IQ1_M-layered, 83,5 GiB para IQ2_XS-layered, 107,4 GiB para IQ3_XXS, 118,8 GiB para IQ4_XS). El master BF16 necesita 329,7 GiB.
- GPU recomendadas: no se especifican modelos concretos. Con cuantizaciones bajas, puede ejecutarse en GPUs de 80 GB (A100/H100) o en sistemas con RAM unificada de 64-80 GB (Apple Silicon) sin VRAM dedicada, paginando la tabla PLE desde SSD.
- Consumer GPU: las cuantizaciones IQ1_M-layered e IQ2_XS-layered podrían caber en GPUs de 80 GB (como la RTX 6000 Ada o la A100 80GB), pero no en GPUs de 24 GB (RTX 4090) debido al tamaño mínimo de 76,4 GiB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), compatible con Ollama y otros frontends que usen GGUF. No se menciona soporte para vLLM o TGI en esta conversión.
- Latencia y throughput: no disponibles. El MoE con 6B activos reduce el coste por token frente a un denso de 180B, pero la tabla PLE de 51B añade acceso a memoria que puede dominar en secuencias cortas.
- Nota importante: no se debe pasar `-ngl` manualmente; llama.cpp ajusta las capas a la VRAM libre automáticamente.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de la misma categoría (MoE híbrido con atención lineal y PLE) en la información proporcionada. La comparativa más directa es entre las cuantizaciones de este repo y las de otros proveedores del mismo modelo base:

| Proveedor | Cuantizaciones | Tamano | Notas |
|---|---|---|---|
| qtum (este repo) | IQ4_XS, IQ3_XXS, IQ2_XS-layered, IQ1_M-layered | 76,4 - 118,8 GiB | Capas protegidas, imatrix, 8 shards |
| unsloth | GGUF (no especificado) | no disponible | Builds con enfoque en long-context y thinking mode |
| atomic.chat | GGUF dinámicos | no disponible | Optimizados para MacBook 64GB, tabla PLE paginada desde SSD |

No se incluyen otros modelos MoE de tamaño similar (por ejemplo, DeepSeek-V3 o Qwen3-235B) por falta de datos comparativos en la información disponible.

## Limitaciones y advertencias

- Licencia restrictiva: Qwen Community License 1.0, no es MIT. Revisar los términos para uso comercial y redistribución.
- Idiomas limitados: solo inglés y chino. No hay soporte declarado para español u otros idiomas.
- Degradación en cuantizaciones bajas: IQ1_M-layered casi triplica la PPL del baseline (4,41 vs 1,72), lo que puede afectar a tareas que requieren precisión factual.
- Riesgo de alucinación: no se han publicado evaluaciones específicas; en cuantizaciones agresivas, la pérdida de calidad puede aumentar la probabilidad de respuestas inventadas.
- Requisito de shards: es obligatorio descargar los 8 shards de cada nivel en el mismo directorio; solo se nombra el primer shard en la línea de comandos.
- No usar `-ngl` manual: forzar la capa de GPU puede romper el ajuste automático de llama.cpp y causar errores de memoria.
- La capa MTP (decodificación especulativa) del checkpoint original se excluye en esta conversión, por lo que no se beneficia de esa aceleración.
- La capacidad multimodal del modelo base no está confirmada en esta cuantización; la model card solo declara text-generation.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qtum/Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guía de ejecución local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Documentación de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Ficha en Wiro AI: https://wiro.ai/models/unsloth/qwen3-8-flash-next-gguf
