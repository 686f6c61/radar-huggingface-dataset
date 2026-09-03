# EInnovator/pra-qwen3-32b-mlx-4bit

## Resumen

El repositorio `EInnovator/pra-qwen3-32b-mlx-4bit` no contiene un modelo de lenguaje independiente, sino un **bundle de runtime PRA (Progressive Retrieval Attention)** diseñado para el modelo base `mlx-community/Qwen3-32B-4bit`, una versión cuantizada a 4 bits en formato MLX del Qwen3-32B de Alibaba. Este paquete empaqueta el mapeo estructural específico del modelo, perfiles de runtime, componentes aprendidos opcionales, metadatos de compatibilidad y evidencia de calificación medida. No incluye los pesos del modelo base ni es un fine-tuning LoRA convencional.

PRA es una técnica de atención que reduce drásticamente el número de tokens visibles durante la generación, manteniendo la calidad de salida. Según la model card, en el workload combinado (n=15) se logra una reducción del contexto de entrada del 89,1% con una calidad idéntica (token_f1 = 0,2312) y una reducción del tiempo hasta el primer token (TTFT) del 6,6%. El bundle está calificado para el motor MLX en modo "Native Memory" con el perfil BALANCED, y ha sido validado en un Apple M4 Pro con 48 GB de RAM.

La relevancia de este paquete radica en que permite ejecutar Qwen3-32B en hardware Apple Silicon con una huella de memoria y latencia reducidas, especialmente en tareas de contexto largo como QA multihop y procesamiento de documentos. Es una pieza de infraestructura para desarrolladores que trabajan con MLX y necesitan optimizar la inferencia de modelos grandes sin sacrificar precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (modelo base) |
| Parametros totales | 32B (modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion del bundle; el modelo base Qwen3-32B soporta contexto largo segun su documentacion |
| Tipos de cuantizacion | 4-bit (modelo base MLX); el bundle no contiene pesos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica (bundle de runtime sin pesos; el modelo base usa safetensors en formato MLX) |

## Arquitectura y entrenamiento

El bundle implementa **Progressive Retrieval Attention (PRA)** sobre el modelo base `mlx-community/Qwen3-32B-4bit`. PRA es un mecanismo de atención que selecciona dinámicamente un subconjunto de tokens del contexto (los más relevantes) para cada paso de generación, reduciendo el coste computacional y la memoria activa. El adaptador estructural es **training-free** (sin entrenamiento), aunque incluye un componente aprendido opcional (un router) que mejora el rendimiento en QASPER pero no es uniformemente positivo en HotpotQA, por lo que no es el default.

El bundle define tres perfiles de routing: **QUALITY** (máxima calidad, calibración pendiente), **BALANCED** (perfil cualificado por defecto, conserva todas las capas elegibles) y **ECONOMY** (menos capas consumidoras, no superó el gate de calidad). El modo "Native Memory" utiliza la misma salida del selector que el modo "Selected Context", pero con una reducción mucho mayor de tokens visibles (por ejemplo, de 315,5 a 34,27 tokens en el workload combinado). La identidad de calificación es específica del modelo 4-bit MLX exacto y su revisión inmutable (`bcaaf7f538adf166c1080a2befdb4f6019f66639`), y no se transfiere automáticamente a otras cuantizaciones o pesos en precisión completa.

## Capacidades

- **Reduccion de contexto visible**: en el workload combinado (n=15), reduce el contexto de entrada en un 89,1% (de 315,5 a 34,27 tokens visibles) manteniendo exactamente la misma calidad (token_f1 = 0,2312).
- **Modo Native Memory**: permite ejecutar la inferencia con una huella de memoria activa mucho menor, cualificado para el motor MLX.
- **Modo Selected Context**: variante portable que mantiene la geometría de consumo de todas las capas elegibles, validada para el motor MLX.
- **Perfiles configurables**: QUALITY, BALANCED y ECONOMY, con recomendación por defecto de BALANCED.
- **Compatibilidad con motor MLX**: validado para inferencia en Apple Silicon; el motor Hugging Face solo se recomienda con el artefacto MLX exacto.
- **Evaluacion integrada**: incluye comandos `pra evaluate`, `pra recommend` y `pra report` para reproducir las mediciones en hardware propio.
- **Sin capacidades linguisticas propias**: el bundle no añade generación de texto, tool calling ni razonamiento; esas capacidades provienen del modelo base Qwen3-32B.

## Casos de uso

- **Preguntas y respuestas multihop sobre documentos largos**: el bundle está calificado con los datasets 2wikimultihopqa y hotpotqa, donde reduce el contexto visible de ~350 a ~30 tokens sin pérdida de calidad, lo que permite procesar documentos extensos en Apple Silicon con menos memoria.
- **Procesamiento de papers academicos**: en el dataset QASPER (QA sobre artículos científicos), el modo Native Memory reduce los tokens visibles de 333,4 a 27,8, manteniendo token_f1 = 0,15, ideal para extraer respuestas de corpus científicos en portátiles con Apple Silicon.
- **Despliegue de Qwen3-32B en Mac con MLX**: el bundle permite ejecutar un modelo de 32B cuantizado a 4 bits en un Mac M4 Pro con 48 GB, con TTFT de ~490 ms y completion medio de ~1,2 s en los workloads evaluados.
- **Optimizacion de costes en inferencia local**: al reducir el contexto activo en un ~90%, se reduce el consumo de memoria y la latencia, lo que permite servir el modelo en entornos con recursos limitados.
- **Investigacion en atencion eficiente**: el bundle sirve como referencia para estudiar el impacto de PRA en modelos densos grandes, con evidencia de paridad exacta (15/15 pares) entre la línea base y la ruta PRA.
- **Integracion en pipelines de RAG**: la reducción de tokens visibles permite pasar más documentos al contexto sin aumentar la memoria, mejorando la escalabilidad de sistemas de recuperación aumentada en hardware Apple.

## Benchmarks y rendimiento

La model card proporciona mediciones de calificación en un Apple M4 Pro (Mac16,7) con 48 GB. No se incluyen benchmarks estándar como MMLU o HumanEval, sino métricas específicas de PRA (token_f1, tokens visibles, TTFT, completion).

**Resultados headline (workload combinado, n=15)**

| Metrica | Baseline | PRA | Delta |
|---|---|---|---|
| token_f1 | 0,2312 | 0,2312 | +0,0000 |
| Input/context | - | - | -89,1% |
| TTFT | - | - | -6,6% |
| Completion | - | - | +0,5% |
| Paired parity | - | - | 15/15 |

**Calificacion end-to-end por workload (n=5 por dataset)**

| Workload | Modo | token_f1 | Tokens visibles | TTFT p50 | Completion media |
|---|---|---|---|---|---|
| 2wikimultihopqa | Selected Context | 0,1778 | 351,2 | 494 ms | 1155 ms |
| 2wikimultihopqa | Native Memory | 0,1778 | 31,6 | 490,2 ms | 1164 ms |
| hotpotqa | Selected Context | 0,3657 | 262 | 791,6 ms | 1334 ms |
| hotpotqa | Native Memory | 0,3657 | 43,4 | 791,7 ms | 1343 ms |
| qasper | Selected Context | 0,15 | 333,4 | 489,1 ms | 1042 ms |
| qasper | Native Memory | 0,15 | 27,8 | 487,7 ms | 1043 ms |
| combined (n=15) | Selected Context | 0,2312 | 315,5 | 524,9 ms | 1177 ms |
| combined (n=15) | Native Memory | 0,2312 | 34,27 | 490,2 ms | 1183 ms |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- **Hardware objetivo**: Apple Silicon (el bundle está calificado para el motor MLX). Las mediciones se realizaron en un Apple M4 Pro (Mac16,7) con 48 GB de RAM unificada.
- **VRAM estimada**: no especificada en la model card. El modelo base es Qwen3-32B en 4 bits, que típicamente ocupa ~16-18 GB en MLX, pero el bundle no proporciona el dato exacto.
- **GPU recomendadas**: no aplica (no es CUDA; es MLX para Apple Silicon). En Mac, se recomienda al menos 48 GB de RAM unificada según las pruebas realizadas.
- **Opciones de despliegue**: motor MLX con el comando `pra serve` (perfil BALANCED recomendado). También es posible usar el motor Hugging Face con el artefacto MLX exacto, pero solo en modo Selected Context.
- **Latencia y throughput**: TTFT p50 de ~490 ms y completion media de ~1,2 s en los workloads evaluados con Native Memory en M4 Pro. Estos valores son mediciones de calificación, no garantías de producción.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la informacion proporcionada. El bundle es específico para Qwen3-32B-4bit MLX y no existe un equivalente directo documentado. Como referencia, el modelo base sin PRA (mlx-community/Qwen3-32B-4bit) es la alternativa natural, pero no se han publicado mediciones comparativas en la misma configuración de hardware.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: el bundle no contiene pesos ni añade capacidades lingüísticas; depende completamente del modelo base Qwen3-32B-4bit.
- **Evidencia limitada**: la calificación se basa en 5 ejemplos por dataset (15 en el workload combinado), lo que soporta la calificación del motor, no la calificación de producción.
- **Router aprendido no uniforme**: el componente aprendido mejora QASPER pero no es consistentemente positivo en HotpotQA; por eso es opt-in y no el default.
- **Perfiles reducidos no validados**: las configuraciones con menos capas consumidoras (ECONOMY) no superaron el gate de calidad; solo BALANCED está cualificado.
- **Identidad de calificacion especifica**: la calificación aplica únicamente al modelo 4-bit MLX exacto y su revisión inmutable; no se transfiere a pesos en precisión completa ni a otras cuantizaciones.
- **Licencias separadas**: las licencias del modelo base (Qwen3) y de los datasets se aplican por separado al artefacto del router.
- **Riesgo de alucinacion y sesgos**: no se han evaluado en este bundle; corresponden al modelo base Qwen3-32B y no están documentados en la model card.

## Enlaces

- Repositorio del bundle: https://huggingface.co/EInnovator/pra-qwen3-32b-mlx-4bit
- Modelo base (MLX 4-bit): https://huggingface.co/Qwen/Qwen3-32B-MLX-4bit
- Modelo base (original): https://huggingface.co/Qwen/Qwen3-32B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
