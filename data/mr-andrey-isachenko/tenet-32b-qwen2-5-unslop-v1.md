# mr-andrey-isachenko/Tenet-32B-Qwen2.5-Unslop-v1

## Resumen

Tenet-32B-Qwen2.5-Unslop-v1 es un ajuste fino del modelo Qwen2.5-32B-Instruct desarrollado por el usuario mr-andrey-isachenko bajo el paraguas del proyecto Tenet. El modelo aplica una tecnica propietaria denominada Lancet, descrita como una cirugia de subespacios con preservacion de norma y doble proyeccion, cuyo objetivo es reducir los rechazos excesivos (over-refusals) y el denominado "slop" estilistico (prosa recargada, preambulos moralizantes, vocabulario generico) sin degradar las capacidades de razonamiento, codigo y uso de herramientas del modelo base.

La relevancia del modelo radica en su enfoque de "abliteracion quirurgica": a diferencia de la abliteracion ingenua, que elimina la direccion de rechazo de forma agresiva y provoca danos colaterales en la distribucion de activaciones, Lancet identifica esa direccion tanto en la proyeccion de entrada como en la de salida y restaura la norma residual de forma exacta. Posteriormente se aplica un pase de GRPO con compuertas que penalizan patrones de slop solo donde la cirugia debilito los circuitos de rechazo, preservando el subespacio ancla de razonamiento.

El checkpoint se distribuye en FP8 (E4M3) listo para proveedores, sin codigo personalizado ni `trust_remote_code`, y es compatible con vLLM, GGUF, MLX y proveedores de OpenRouter. Con 32.763.876.352 parametros y licencia Apache 2.0, se posiciona como una alternativa para despliegues de agentes y tool-use donde los rechazos falsos positivos resultan costosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para este fine-tune) |
| Tipos de cuantizacion | FP8 (E4M3) como formato principal de release; GGUF disponible segun tags; MLX segun model card |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 E4M3), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso de 32.7 mil millones de parametros. Sobre esa base se aplica el motor Lancet, que realiza una cirugia de subespacios con doble proyeccion y preservacion de norma: la direccion de rechazo se identifica tanto en el flujo residual de entrada como en la proyeccion de desembedding de salida, se elimina de forma bidireccional y se restaura exactamente la norma residual para mantener las magnitudes de activacion en la variedad del modelo original.

Tras la cirugia se ejecuta un pase de GRPO (Group Relative Policy Optimization) con compuertas de recompensa que penalizan patrones de slop solo en las regiones donde la cirugia debilito los circuitos de rechazo. El pipeline reportado incluye las fases H9 (cirugia Lancet), H10 (GRPO de unslop con compuertas), H11 (cuantizacion FP8 E4M3) y H12 (fusion TIES segura respecto al subespacio). La model card no detalla el volumen de tokens de entrenamiento ni la composicion del dataset utilizado en el ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno sobre el modelo base Qwen2.5-32B-Instruct.
- Razonamiento estructurado y analitico, preservado segun el autor mediante el anclaje del subespacio de razonamiento.
- Generacion de codigo y consultas SQL, con enfasis en la validez de esquema en llamadas a herramientas.
- Tool calling y function calling: la model card muestra ejemplos de llamadas JSON validas contra DuckDB.
- Uso agentico y razonamiento multi-paso (tag `agentic`).
- Reduccion de rechazos falsos positivos en prompts benignos (tag `abliterated`, `uncensored`).
- Mitigacion de slop estilistico: menos prosa recargada y preambulos moralizantes.
- Compatibilidad con vLLM, OpenRouter, GGUF y MLX sin codigo personalizado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Triaje de logs de seguridad y generacion de consultas SQL: el modelo produce llamadas a herramientas con esquema valido (por ejemplo, `duckdb.query` con SQL agregado sobre logs de autenticacion), evitando el rechazo falso que el modelo base aplica a prompts de AppSec benignos.
- Pipelines de agentes con tool calling: al no requerir `trust_remote_code` y ser compatible con vLLM, se puede desplegar como backend de agentes que encadenan llamadas a funciones en produccion.
- Asistencia de codigo en CI/CD: generacion de codigo y consultas dentro de flujos automatizados donde los rechazos innecesarios interrumpen el pipeline.
- Atencion al cliente automatizada: conversaciones multi-turno sobre el modelo base Qwen2.5-32B-Instruct, con menor tendencia a respuestas evasivas o moralizantes.
- Analisis de datos y business intelligence: traduccion de preguntas en lenguaje natural a SQL valido sobre motores como DuckDB, con salida estructurada lista para ejecucion.
- Despliegue en proveedores gestionados: el checkpoint FP8 E4M3 esta pensado para integrarse directamente en proveedores tipo OpenRouter sin conversion adicional.
- Investigacion sobre alineacion y abliteracion: el modelo y su inspector interactivo permiten estudiar el efecto de la cirugia de subespacios frente a la abliteracion ingenua.

## Benchmarks y rendimiento

Los datos publicados corresponden a metricas internas del pipeline de release, no a benchmarks estandar de la comunidad (MMLU, HumanEval, GSM8K). Se reproducen a continuacion tal como aparecen en la model card.

| Metrica (fase) | Valor | Direccion |
|---|---|---|
| Lancet KL Collateral (H9) | 9,75e-03 | Menor |
| Naive KL Collateral (H9) | 0,30 | Menor |
| KL Reduction Ratio (H9) | 0,97 | Mayor |
| Target Suppression Ratio (H9) | 0,99 | Mayor |
| Gated GRPO IFEval Score (H10) | 0,63 | Mayor |
| Gated vs Naive/Additive Gain (H10) | 0,43 | Mayor |
| Slop & Refusal Rate (H10) | 0,02 | Menor |
| Post-Merge Suppression Retention (H10) | 1,00 | Mayor |
| FP8 Retention Ratio (H11) | 0,97 | Mayor |
| FP8 KL Reduction vs Naive (H11) | 0,49 | Mayor |
| FP8 Subspace Re-Leakage Lancet (H11) | 0,18 | Menor |
| FP8 Subspace Re-Leakage Naive (H11) | 0,50 | Menor |
| SQL-Incident Retention (H12) | 1,00 | Mayor |
| Unslop Retention (H12) | 1,00 | Mayor |
| Subspace-Safe Merge Re-Leakage (H12) | 6,63e-08 | Menor |
| TIES Bi-Projected vs Naive Gain (H12) | 0,78 | Mayor |

Comparativa interna base frente a abliteracion ingenua y Tenet:

| Metrica | Base | Naive Abliteration | Tenet (BF16) | Tenet (FP8 E4M3) |
|---|---|---|---|---|
| KL Collateral Drift | — | 0,30 | 9,75e-03 | 0,18 |
| Refusal Suppression | — | — | 0,99 | 1,00 |
| Tool/SQL Anchor Orthogonality | — | 0,81 | 3,00e-08 | 0,13 |
| LoRA Re-Leakage | — | 0,81 | 0,13 | 0,18 |
| FP8 Subspace Re-Leakage | — | 0,50 | — | 0,18 |
| Max Row Crest-Factor (< 25,0) | — | — | 10,65 | 10,65 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint se distribuye en FP8 E4M3, lo que situa el peso del modelo en torno a 32-33 GB; en BF16 serian aproximadamente 65 GB.
- GPU recomendadas: una A100 80 GB o H100 80 GB permite cargar el modelo en FP8 con margen para cache KV; una RTX 4090 de 24 GB no cabe en FP8 sin offloading o cuantizacion adicional a 4 bits.
- Consumer GPU: viable en GPUs de 24 GB solo mediante GGUF cuantizado (Q4/Q5) con llama.cpp u Ollama; no en FP8 completo.
- Opciones de despliegue: vLLM (soporte nativo FP8), OpenRouter como proveedor, llama.cpp/Ollama via GGUF, MLX segun la model card, y text-generation-inference segun tags.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Tenet-32B-Qwen2.5-Unslop-v1 | 32,7B | no disponible | Apache 2.0 | Fine-tune con cirugia Lancet y GRPO de unslop; FP8 E4M3 |
| Qwen2.5-32B-Instruct (base) | 32,7B | 32.768 tokens nativos | Apache 2.0 | Modelo instruct original, con rechazos y estilo sin modificar |
| Abliteracion ingenua de Qwen2.5-32B | 32,7B | igual que base | Apache 2.0 | Eliminacion directa de la direccion de rechazo; mayor dano colateral (KL 0,30) |

La comparativa con alternativas de terceros (por ejemplo, otros fine-tunes abliterados de la familia Qwen2.5) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no esta disenado ni ajustado para operaciones ciberofensivas, generacion de malware ni contenido ilegal; esos usos quedan fuera de alcance.
- La reduccion de rechazos implica un riesgo mayor de generar contenido que el modelo base rechazaria; requiere evaluacion de seguridad propia antes de produccion.
- Riesgo de alucinacion inherente al modelo base Qwen2.5-32B-Instruct, no cuantificado en la model card.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se confirma el soporte multilingue mas alla del modelo base.
- Longitud de contexto: no confirmada para este fine-tune.
- Las metricas publicadas son internas del pipeline del autor (fases H9-H12) y no han sido validadas de forma independiente.
- El modelo tiene un volumen de descargas bajo (269) y cero likes en el momento de la consulta, lo que limita la evidencia de uso en comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las obligaciones heredadas del modelo base Qwen2.5-32B-Instruct.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-32B-Qwen2.5-Unslop-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Codigo y reporte tecnico: https://github.com/mrAndreyIsachenko/tenet-lab
- Inspector interactivo FP8 y abliteracion: https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Coleccion de la familia Tenet v1: https://huggingface.co/mr-andrey-isachenko
