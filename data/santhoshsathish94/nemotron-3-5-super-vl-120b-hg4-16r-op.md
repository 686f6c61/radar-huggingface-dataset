# Santhoshsathish94/Nemotron-3.5-Super-VL-120B-HG4-16R-OP

## Resumen

Nemotron-3.5-Super-VL-120B-HG4-16R-OP es una compilación cuantizada a 4 bits del modelo base NVIDIA-Nemotron-3-Super-120B-A12B-BF16, publicada por el usuario Santhoshsathish94 bajo el paraguas del proyecto Clover. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: un conjunto de pesos en formato propietario `HG4` (Hadamard-Grouped 4-bit con grupo de 16 y reordenamiento) acompañado de una biblioteca nativa en C11 (`nemotron_hg4_engine.c`) que implementa la inferencia sobre CPU. El objetivo declarado es reducir el peso de unos 245 GB en BF16 a 64,65 GB, un factor de compresión aproximado de 3,8x, para que el modelo quepa en un servidor de un solo socket con 128 GB de DDR5.

La arquitectura subyacente es la del Nemotron-3 Super de NVIDIA: un transformer híbrido que combina capas Mamba-2 con atención GQA y capas de mezcla de expertos (MoE) con enrutamiento latente, más cabezas especulativas MTP (multi-token prediction) de dos niveles. El modelo base declara 120B parámetros totales con 12B activos por token, lo que lo sitúa en la categoría de MoE disperso de gran escala. La ficha del autor no aporta información sobre el entrenamiento original, los datos utilizados ni los idiomas soportados.

La relevancia de esta publicación es fundamentalmente práctica: demuestra una vía de inferencia en CPU pura para un MoE de 120B sin GPU, con un motor propio compilable con GCC y dependencias mínimas (OpenMP, libm). Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, y su licencia hereda la NVIDIA Open Model License del modelo base, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Mamba-2 + atención GQA + MoE con enrutamiento latente + cabezas MTP especulativas (2 niveles) |
| Parametros totales | 120B (según denominación del modelo base) |
| Parametros activos | 12B (según denominación A12B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HG4-16R (Hadamard-Grouped 4-bit, grupo de 16, con reordenamiento); formato propietario, no compatible con GGUF/AWQ/GPTQ |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.hg4` propietario (embeddings, trunk_00..89, experts_*, mtp_0/1, lm_head) + `precomputed_ops/` (337 MB) |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3-Super-120B-A12B es un transformer híbrido que intercala capas Mamba-2 (modelo de espacio de estados) con capas de atención con query grouping (GQA) y capas MoE. La build publicada contiene 90 capas de tronco (`trunk_00` a `trunk_89`), pesos de embeddings, pesos de expertos separados (`experts_*.hg4`), dos cabezas MTP (`mtp_0.hg4` y `mtp_1.hg4`) para decodificación especulativa y una cabeza de lenguaje (`lm_head.hg4`). La cuantización HG4-16R aplica una transformada de Hadamard por grupos de 16 elementos antes de cuantizar a 4 bits, una técnica habitual para reducir el error de cuantización en pesos con valores atípicos.

No hay información en la model card sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras). Tampoco se detalla el proceso de calibración de la cuantización ni qué métricas de perplejidad o degradación se midieron respecto al BF16. El autor incluye un directorio `precomputed_ops/` de 337 MB descrito como "lossless", presumiblemente con operaciones precalculadas (posiblemente tablas de rotación Hadamard, escalas o kernels precompilados) que el motor C11 carga en tiempo de ejecución.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Nemotron-3 Super.
- Capacidades de código y tareas de ingeniería de software: la model card reporta 4/4 en el Tier-4 Systems SWE de su suite `rh_bench_suite_v2.jsonl`.
- Decodificación especulativa mediante dos cabezas MTP (`mtp_0`, `mtp_1`), que permiten proponer y verificar tokens en paralelo.
- Inferencia íntegra en CPU mediante el motor C11 `nemotron_hg4_engine.c`, sin dependencia de CUDA.
- Integración en un esquema de escalado "Copilot Fusion" con el modelo Clover-35B-A3B: el modelo pequeño atiende y el Nemotron-120B se invoca como escalado.
- Soporte de tool calling, agentes, visión, audio o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de un MoE de 120B en servidores sin GPU: el peso de 64,65 GB permite cargar el modelo completo en 128 GB de DDR5 de un solo socket, útil en entornos donde no hay aceleradores disponibles o el presupuesto de GPU es nulo.
- Escalado en pipelines de agentes con modelo pequeño: el esquema Copilot Fusion descrito (Clover-35B-A3B como primera línea y Nemotron-120B como escalado) sirve para resolver consultas complejas solo cuando el modelo pequeño falla, reduciendo coste medio por consulta.
- Tareas de ingeniería de software asistida: los 4/4 en Tier-4 Systems SWE de la suite del autor sugieren uso en generación y revisión de código de sistemas, aunque la muestra es muy pequeña (cuatro casos) y no permite generalizar.
- Despliegue en entornos air-gapped: al compilarse con GCC y enlazarse contra libm y OpenMP, el motor puede construirse y ejecutarse en máquinas aisladas sin stack de Python ni runtime de CUDA.
- Investigación sobre cuantización extrema: el artefacto sirve como caso de estudio de cuantización 4-bit con transformada de Hadamard sobre un híbrido Mamba-2/MoE, comparable con técnicas como GPTQ o AWQ en transformers convencionales.
- Evaluación de decodificación especulativa en CPU: las cabezas MTP permiten medir la ganancia de throughput de la verificación especulativa en un backend puramente secuencial, un escenario poco explorado frente a las implementaciones en GPU.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| `rh_bench_suite_v2.jsonl` (solo) | 9/23 (39,13%) | Nemotron-120B en solitario |
| Tier-4 Systems SWE (solo) | 4/4 (100,0%) | Subconjunto de la suite anterior |
| Copilot Fusion (Clover-35B-A3B → Nemotron-120B) | 11/23 (47,83%) | +2 netos, 0 regresiones |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única suite reportada es propia del autor (`rh_bench_suite_v2.jsonl`), con 23 ítems en total, lo que constituye una muestra demasiado pequeña para extraer conclusiones de rendimiento general.

## Requisitos de hardware

- RAM: al menos 128 GB de DDR5 para cargar los 64,65 GB de pesos junto con el modelo Clover-35B-A3B en el mismo host, según indica el autor; en solitario, 64,65 GB más overhead del motor.
- CPU: x86-64 con AVX2 y FMA (el comando de compilación usa `-march=x86-64-v3 -mavx2 -mfma`), más OpenMP para paralelismo entre hilos.
- GPU: no requerida; el motor es de CPU. No se documenta soporte de offload a GPU.
- Despliegue: compilación manual de `nemotron_hg4_engine.c` como biblioteca compartida (`libnemotron_hg4_engine.so`) con GCC; no hay integración con vLLM, llama.cpp, Ollama ni TGI, y el formato `.hg4` no es compatible con ellos.
- Latencia y throughput: no disponibles. La model card no reporta tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Super-VL-120B-HG4-16R-OP | 120B | 12B | no disponible | `.hg4` propietario | nvidia-open-model-license | Motor C11 en CPU |
| NVIDIA-Nemotron-3-Super-120B-A12B-BF16 (base) | 120B | 12B | no disponible | safetensors BF16 | nvidia-open-model-license | GPU (vLLM, TGI, etc.) |
| Clover-35B-A3B (mencionado por el autor) | 35B | 3B | no disponible | no disponible | no disponible | Motor C11 en CPU |

La comparativa con alternativas de la misma categoría (otros MoE de ~100B con ~10B activos) no está disponible en la información proporcionada; no se aportan datos de contexto, benchmarks ni disponibilidad de esos modelos.

## Limitaciones y advertencias

- Artefacto derivado, no modelo original: cualquier sesgo, alucinación o limitación del Nemotron-3 Super base se hereda, y la cuantización 4-bit puede añadir degradación adicional no cuantificada en la model card.
- Sin datos de calidad de la cuantización: no se reporta perplejidad, KL divergence ni comparación con BF16, por lo que el impacto real del esquema HG4-16R es desconocido.
- Evaluación insuficiente: los benchmarks se limitan a 23 ítems de una suite propia; un 4/4 en cuatro casos no es evidencia robusta de capacidad en SWE.
- Formato y motor propietarios: `.hg4` no es interoperable con el ecosistema estándar (safetensors, GGUF), lo que ata el uso al motor C11 del autor y complica la auditoría y la portabilidad.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni revisión independiente.
- Idiomas y contexto no documentados: no se puede planificar un despliegue multilingüe ni de contexto largo sin información adicional.
- Licencia: la NVIDIA Open Model License impone condiciones al uso comercial y a la redistribución; es responsabilidad del integrador revisar sus términos antes de desplegar.
- Requisito de memoria elevado: 128 GB de RAM para el escenario combinado con Clover-35B-A3B excluye la mayoría de estaciones de trabajo consumer.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Santhoshsathish94/Nemotron-3.5-Super-VL-120B-HG4-16R-OP)
- [Modelo base en Hugging Face](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
