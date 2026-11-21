# Baekpica/Nex-N2.6-VQ-GGUF

## Resumen

Nex-N2.6-VQ-GGUF es una conversión cuantizada del modelo multimodal Nex-N2.6, publicada por el usuario Baekpica bajo licencia Apache 2.0. Se trata de una compilación GGUF de 88,00 GiB orientada al runtime ds4-dfm-rs sobre hardware DGX Spark (GB10), que emplea una técnica propietaria de cuantización vectorial denominada hVQ (Hessian-calibrated Vector Quantization) en lugar de los esquemas escalares habituales como Q4_K_M o Q8_0. El modelo base, nex-agi/Nex-N2.6, es un transformer de tipo mixture-of-experts con 45 bloques de tronco, 288 expertos por bloque enrutado, una torre de visión de 24 bloques y un drafter MTP de una capa.

La relevancia de esta ficha reside en dos aspectos. Por un lado, demuestra una metodología de cuantización que reduce la divergencia respecto al checkpoint original (KL de siguiente token 21,1 % menor que la cuantización vectorial vanilla). Por otro, documenta con detalle inusual las métricas de fidelidad, los intervalos de confianza y las comprobaciones de integridad del release, lo que facilita la evaluación reproductiva. El contexto configurado alcanza 1.048.576 tokens, y el repositorio incluye tokenizer, processor y plantilla de chat con soporte de tool use.

El tamaño del repo es de 94,5 GB, distribuido en 56 particiones GGUF con 56.297 layouts de tensor y 94.483.348.344 bytes de payload. La información pública no detalla el número de parámetros del modelo base ni de los parámetros activos por token, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con torre de visión y drafter MTP |
| Parametros totales | no disponible (634.388.480 en safetensors del repo, no representativo del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (configurado) |
| Tipos de cuantizacion | GVQ1 con capas R13+8 (2,625 bits por peso) y R13 (1,625 bits por peso); Q4_K en 316 matrices no experto; torre de visión y MTP en precisión completa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (56 particiones); repo con safetensors del adaptador/checkpoint parcial |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 45 bloques de tronco y 288 expertos por bloque enrutado. La torre de visión consta de 24 bloques y el sistema incorpora un drafter MTP (multi-token prediction) de una sola capa, la número 45, que se mantiene separado del tronco. El contexto configurado es de 1.048.576 tokens. La model card no detalla el número total de parámetros, la composición del dataset de preentrenamiento ni si hubo fases de RLHF o DPO.

La innovación principal de esta release es el esquema hVQ de cuantización vectorial. A diferencia de la VQ vanilla, que entrena sus codebooks E4M3 únicamente sobre los pesos del checkpoint, hVQ estima las correlaciones completas de entrada a partir de 566.932 tokens en 828 secuencias y aplica dos pasadas secuenciales de asignación que propagan el error de cada bloque a las columnas de entrada posteriores, reajustando las ganancias de fila almacenadas. Cada checkpoint aprende sus propios codebooks. La asignación de precisión sigue el estudio de sensibilidad previo de GLM: los expertos enrutados de las capas 3–17, 22, 27, 41 y 44 usan R13+8 (2,625 bits por peso), las otras 23 capas enrutadas usan R13 (1,625 bits por peso) y 316 matrices no experto emplean Q4_K.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1.048.576 tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante torre de visión de 24 bloques.
- Razonamiento, matemáticas y ciencia, según los grupos de evaluación reportados (math, science and reasoning).
- Generación y edición de código, con grupo de evaluación específico de code and SWE.
- Tool calling y function calling, con plantilla de chat de tool use incluida en el release.
- Prompts de agente y uso de herramientas multi-paso, con grupo de evaluación dedicado (tool use and agent prompts).
- Decodificación especulativa mediante drafter MTP de una capa.
- Idiomas soportados: no disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto muy largo (1.048.576 tokens), lo que permite arrastrar historial completo de tickets y documentación de producto sin truncar.
- Generación de código en producción: la plantilla de tool use y el grupo de evaluación de code and SWE lo hacen apto para integrarse en pipelines de CI/CD que invocan herramientas externas (linters, tests, APIs de repositorio).
- Agentes autónomos multi-paso: el soporte de tool calling y el drafter MTP para decodificación especulativa permiten cadenas de razonamiento y llamadas a herramientas con latencia reducida.
- Análisis de documentos con imagen: al ser image-text-to-text, puede procesar capturas, diagramas o formularios junto con texto para extracción y resumen.
- Razonamiento matemático y científico asistido: útil en entornos de investigación para resolver problemas paso a paso y verificar cálculos con contexto de papers extensos.
- Despliegue en hardware de borde con DGX Spark: el formato GGUF de 88,00 GiB y el runtime ds4-dfm-rs están optimizados para una única GB10, lo que permite servir el modelo en una estación de trabajo compacta.
- Evaluación de técnicas de cuantización: el release incluye receta de conversión, registro de calibración y métricas de fidelidad, lo que lo convierte en referencia para estudiar hVQ frente a VQ vanilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de fidelidad de cuantización frente al checkpoint original Nex-N2.6 sobre 34 secuencias retenidas:

| Métrica | VQ vanilla | hVQ | hVQ − vanilla (IC 95 % pareado) |
|---|---:|---:|---|
| KL de siguiente token vs fuente (menor mejor) | 0,6445 | 0,5082 | -0,1363 [-0,1878, -0,0958] |
| Acuerdo top-1 con la fuente (mayor mejor) | 76,99 % | 80,55 % | +3,57 pp [+2,86, +4,31] |
| NLL de siguiente token (menor mejor) | 1,9281 | 2,1310 | +0,2029 [+0,0796, +0,3466] |
| Perplejidad (menor mejor) | 6,876 | 8,423 | +1,547 [+0,465, +3,795] |
| Coseno del estado oculto final (mayor mejor) | 0,8569 | 0,8972 | +0,0403 [+0,0356, +0,0455] |
| Error L2 relativo de salida enrutada (menor mejor) | 0,4314 | 0,3558 | -0,0756 |

Desglose por grupo retenido:

| Grupo | Casos | Tokens puntuados | KL vanilla | KL hVQ | Top-1 vanilla | Top-1 hVQ |
|---|---:|---:|---:|---:|---:|---:|
| Texto general | 9 | 6.217 | 0,831 | 0,734 | 72,8 % | 75,7 % |
| Chat e instrucciones | 8 | 5.542 | 0,338 | 0,233 | 80,8 % | 84,0 % |
| Matemáticas, ciencia y razonamiento | 7 | 5.258 | 0,529 | 0,446 | 82,2 % | 85,1 % |
| Código y SWE | 7 | 5.150 | 0,865 | 0,681 | 73,5 % | 77,3 % |
| Uso de herramientas y agentes | 3 | 2.557 | 0,649 | 0,334 | 75,1 % | 81,9 % |

Rendimiento en DGX Spark (GB10, CUDA 13.5, relojes 300–2.200 MHz), medido sobre Sage-S2.1-Flash hVQ con formas de tensor y kernels compartidos con Nex-N2.6 hVQ:

| Contexto | Prefill antes (tok/s) | Prefill después (tok/s) | Decode antes (tok/s) | Decode después (tok/s) |
|---|---:|---:|---:|---:|
| 2K–64K, mediana de medias | 1.098,0 | 1.230,3 | 29,94 | 32,51 |
| 2K | 991,8 | 1.071,4 | 28,00 | 29,24 |
| 8K | 1.126,0 | 1.247,2 | 33,92 | 33,92 |
| 16K | 1.121,8 | 1.239,9 | 33,66 | 35,40 |
| 32K | 1.104,2 | 1.241,8 | 36,85 | 30,55 |
| 64K | 1.075,0 | 1.225,1 | 26,66 | 33,56 |

## Requisitos de hardware

- VRAM estimada: el release ocupa 88,00 GiB en disco y requiere al menos esa cantidad de memoria para cargar el modelo completo; el payload de tensores es de 94.483.348.344 bytes.
- GPU recomendadas: DGX Spark con GB10 (hardware de referencia del release), RTX PRO 6000 Blackwell (host de conversión mencionado en la model card). No se documentan otras GPU compatibles.
- Cabe en consumer GPU: no disponible; 88 GiB excede la VRAM de cualquier GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB).
- Opciones de despliegue: runtime ds4-dfm-rs sobre DGX Spark; el release incluye instrucciones de build y serve (RUNTIME.md) y checksums SHA-256. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill mediano de 1.230,3 tok/s y decode mediano de 32,51 tok/s en el rango 2K–64K sobre GB10, con mejora del 12,0 % en prefill incremental y 8,6 % en decode respecto a la build anterior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nex-N2.6-VQ-GGUF (este) | no disponible | 1.048.576 | Apache 2.0 | GGUF (56 partes) | Cuantización hVQ, orientado a DGX Spark |
| Nex-N2.6 (base) | no disponible | 1.048.576 | Apache 2.0 | safetensors | Checkpoint original de referencia |
| GLM-5.3-Flash-VQ-GGUF | no disponible | no disponible | no disponible | GGUF | Misma familia de runtime y estudio de sensibilidad de capas |
| Sage-S2.1-Flash hVQ | no disponible | no disponible | no disponible | GGUF | Comparte formas de tensor y kernels; usado para medir rendimiento en Spark |

No se dispone de datos de parámetros ni de benchmarks comparables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni del proceso de cuantización.
- Riesgo de alucinación: no evaluado en la información disponible; las métricas reportadas miden fidelidad respecto al checkpoint original, no veracidad factual.
- El contexto máximo de 1.048.576 tokens es una configuración; el rendimiento real a contextos extremos no se ha medido más allá de 64K en las tablas publicadas.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los componentes de terceros (tokenizer, processor) pueden tener condiciones adicionales no detalladas.
- El despliegue está ligado al runtime ds4-dfm-rs y al hardware DGX Spark; no hay soporte documentado para vLLM, llama.cpp u otros motores, lo que limita la portabilidad.
- Las métricas de velocidad en DGX Spark se midieron sobre Sage-S2.1-Flash hVQ, no sobre Nex-N2.6 hVQ directamente; la aceptación del drafter y la velocidad absoluta de decode dependen del modelo y del texto generado.
- hVQ presenta mayor perplejidad y NLL que VQ vanilla pese a menor KL y mayor acuerdo top-1; la elección entre ambas métricas depende del caso de uso.
- El repositorio tiene 0 likes y 1.100 descargas en el momento de la consulta, lo que indica validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Baekpica/Nex-N2.6-VQ-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.6
- Release GLM relacionada: https://huggingface.co/Baekpica/GLM-5.3-Flash-VQ-GGUF
- Runtime medido (commit): https://github.com/Baekpica/ds4-dfm-rs/commit/60268312b7429b0c9e276c446362489bb643ee30
- Registro de calibración: calibration-summary.json (en el repo)
- Receta de conversión: recipe.json (en el repo)
- Resultados de evaluación: evaluation.json (en el repo)
- Instrucciones de build y serve: RUNTIME.md (en el repo)
- Checksums del release: SHA256SUMS (en el repo)
