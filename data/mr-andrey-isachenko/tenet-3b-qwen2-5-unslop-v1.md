# mr-andrey-isachenko/Tenet-3B-Qwen2.5-Unslop-v1

## Resumen

Tenet-3B-Qwen2.5-Unslop-v1 es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct desarrollado por el usuario mr-andrey-isachenko bajo la familia "Tenet". El modelo aplica una tecnica propietaria denominada "Lancet" que realiza una cirugia de subespacios con doble proyeccion y preservacion de norma para eliminar la direccion de rechazo (refusal) del modelo base, seguida de un pase de GRPO con compuertas ("gated unslop GRPO") destinado a penalizar patrones de prosa vacia y preambulos moralizantes. El resultado se exporta como checkpoint FP8 (E4M3) listo para proveedores de inferencia.

El modelo conserva la arquitectura transformer de Qwen2.5-3B-Instruct, con 3.085.938.688 parametros totales y un repositorio de 8,3 GB que incluye pesos en safetensors y GGUF. Su propuesta de valor es ofrecer un asistente menos propenso a rechazos falsos positivos sobre peticiones benignas, manteniendo las capacidades de razonamiento, codigo y uso de herramientas del modelo base. La licencia es Apache 2.0.

Es relevante en el contexto actual de modelos pequenos orientados a agentes y despliegue en produccion, donde el equilibrio entre seguridad, utilidad y coste computacional es critico. El autor publica metricas internas del pipeline de entrenamiento (H9-H12) y una evaluacion de terceros ("Model Fight Card 16") que situa al modelo como campeon de la division Minors, aunque estas cifras deben interpretarse con cautela por su origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | FP8 (E4M3) en el checkpoint principal; GGUF disponible en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3,09 mil millones de parametros. Sobre esa base, el autor aplica el motor "Lancet", descrito como una cirugia de subespacios con doble proyeccion y preservacion de norma: la direccion de rechazo se identifica tanto en la proyeccion de entrada (residual stream) como en la de salida (unembedding), se elimina de forma bidireccional y se restaura exactamente la norma residual para mantener las magnitudes de activacion en la variedad del modelo original.

Tras la cirugia se ejecuta un pase de GRPO (Group Relative Policy Optimization) con compuertas de recompensa que penalizan patrones de "slop" (prosa recargada, vocabulario tipo "tapestry", preambulos moralizantes) solo en las regiones donde la cirugia debilito los circuitos de rechazo. Posteriormente se realiza una cuantizacion FP8 (E4M3) y una fusion TIES segura respecto a subespacios ("subspace-safe TIES merge"). El autor no detalla el volumen de tokens de entrenamiento ni la composicion exacta del dataset. Segun la model card, el modelo no requiere codigo personalizado ni `trust_remote_code`.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento estructurado y analitico heredado de Qwen2.5-3B-Instruct.
- Generacion de codigo (etiqueta "coding" en el repo).
- Uso de herramientas y function calling (etiquetas "tool-use" y "agentic").
- Comportamiento orientado a agentes y razonamiento multi-paso.
- Reduccion de rechazos falsos positivos sobre peticiones benignas mediante la cirugia Lancet.
- Mitigacion de deriva estilistica ("slop") gracias al pase GRPO con compuertas.
- Preservacion de subespacios de anclaje para herramientas y SQL (segun metricas H12 del autor).
- Compatibilidad con vLLM, OpenRouter, GGUF y MLX segun la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional en produccion: el modelo puede gestionar dialogos multi-turno con un perfil menos restrictivo ante peticiones benignas, lo que reduce la friccion en atencion al cliente automatizada donde los rechazos innecesarios degradan la experiencia.
- Generacion de codigo en pipelines de CI/CD: con soporte de tool calling y etiqueta "coding", puede integrarse en flujos de revision, autocompletado o generacion de tests, ejecutandose en GPUs de gama media gracias a sus 3B parametros.
- Agentes autonomos de proposito general: las etiquetas "agentic" y "tool-use" indican que el modelo esta orientado a invocar funciones y encadenar pasos, adecuado para orquestadores ligeros en entornos con recursos limitados.
- Despliegue en proveedores de inferencia: el checkpoint FP8 (E4M3) y la ausencia de codigo personalizado permiten subirlo directamente a vLLM u OpenRouter, reduciendo el coste por token frente a modelos mayores.
- Prototipado rapido en local: la disponibilidad de GGUF facilita ejecucion en llama.cpp u Ollama sobre hardware consumer, util para experimentacion y demos.
- Generacion de contenido con estilo controlado: el pase "unslop" reduce prosa recargada y preambulos moralizantes, lo que resulta util en herramientas de redaccion asistida que requieren respuestas directas.
- Investigacion sobre alineacion y edicion de modelos: las metricas H9-H12 y el espacio de inspeccion FP8 permiten estudiar tecnicas de cirugia de subespacios y su robustez tras cuantizacion.

## Benchmarks y rendimiento

Los datos disponibles provienen del pipeline interno del autor (`final_metrics.json`) y de una evaluacion de terceros ("Model Fight Card 16"). No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

| Metrica (fase) | Valor | Direccion |
|---|---|---|
| Lancet KL Collateral (H9) | 0,02 | Menor es mejor |
| Naive KL Collateral (H9) | 3,76 | Menor es mejor |
| KL Reduction Ratio (H9) | 0,99 | Mayor es mejor |
| Target Suppression Ratio (H9) | 0,97 | Mayor es mejor |
| Gated GRPO IFEval Score (H10) | 0,72 | Mayor es mejor |
| Gated vs Naive/Additive Gain (H10) | 0,16 | Mayor es mejor |
| Slop & Refusal Rate (H10) | 0,09 | Menor es mejor |
| Post-Merge Suppression Retention (H10) | 1,00 | Mayor es mejor |
| FP8 Retention Ratio (H11) | 0,95 | Mayor es mejor |
| FP8 KL Reduction vs Naive (H11) | 0,52 | Mayor es mejor |
| FP8 Subspace Re-Leakage Lancet (H11) | 0,03 | Menor es mejor |
| FP8 Subspace Re-Leakage Naive (H11) | 0,50 | Menor es mejor |
| SQL-Incident Retention (H12) | 1,00 | Mayor es mejor |
| Unslop Retention (H12) | 1,00 | Mayor es mejor |
| Subspace-Safe Merge Re-Leakage (H12) | 4,71e-07 | Menor es mejor |
| TIES Bi-Projected vs Naive Gain (H12) | 0,78 | Mayor es mejor |

Evaluacion de terceros (Model Fight Card 16, 2026-11-20): puesto #1 en la division Minors con 90 HP, 22/22 artefactos clasificables (100 %), 21/22 escapes de clase (95,5 %) y 4/4 escapes APEX. Comparado con anclas de referencia como Qwen3-0.6B, Llama-3.2-1B, Gemma-3-4B, DeepSeek-R1-1.5B y SmolLM3-3B.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8 (E4M3): aproximadamente 3-4 GB de pesos, mas overhead de activaciones y cache KV (tipicamente 5-8 GB en total segun longitud de contexto).
- VRAM estimada en BF16/FP16: aproximadamente 6-7 GB solo para pesos.
- VRAM estimada en GGUF Q4: aproximadamente 2-3 GB, apto para GPUs consumer de gama media.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPUs consumer: si, en modelos con 8 GB o mas de VRAM en cuantizaciones FP8 o GGUF Q4/Q5.
- Opciones de despliegue: vLLM (soporte nativo FP8), llama.cpp, Ollama, TGI y proveedores OpenRouter segun la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Tenet-3B-Qwen2.5-Unslop-v1 | 3,09B | no disponible | Apache 2.0 | Fine-tune con cirugia de rechazo y GRPO |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (segun especificaciones publicas del modelo base) | Apache 2.0 | Modelo base instructivo |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens (segun especificaciones publicas) | Llama 3.2 Community License | Modelo pequeno instructivo |
| SmolLM3-3B | 3B | no disponible | Apache 2.0 | Modelo pequeno instructivo |

La comparacion de rendimiento entre estos modelos no esta disponible en la informacion proporcionada. El autor situa a Tenet por delante de Llama-3.2-1B, Gemma-3-4B, DeepSeek-R1-1.5B y SmolLM3-3B en su evaluacion "Model Fight Card 16", pero se trata de una metrica propietaria sin validacion independiente publica.

## Limitaciones y advertencias

- El modelo ha sido sometido a una cirugia de eliminacion de la direccion de rechazo ("abliterated"), lo que puede reducir la eficacia de sus mecanismos de seguridad ante peticiones sensibles. El autor declara explicitamente que no debe usarse para operaciones ofensivas, generacion de malware ni contenido ilegal.
- Riesgo de alucinacion inherente a un modelo de 3B parametros; no se han publicado evaluaciones de factualidad.
- Las metricas de benchmarks proceden del pipeline interno del autor y de una evaluacion de terceros no revisada por pares; deben interpretarse con cautela.
- No se especifican los idiomas soportados ni el volumen o composicion del dataset de entrenamiento.
- La longitud de contexto no se detalla en la model card; debe verificarse contra las especificaciones de Qwen2.5-3B-Instruct antes de desplegar en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de evaluar el comportamiento del modelo en su dominio y de implementar filtros adicionales si su aplicacion lo requiere.
- El modelo se publico en noviembre de 2026 y cuenta con un ecosistema muy limitado (1 like, 1160 descargas), por lo que la validacion de la comunidad es escasa.
- La nomenclatura y las afirmaciones de la model card (por ejemplo, "Model Fight Card", "House escapes", "APEX") provienen de un marco de evaluacion propio del autor sin metodologia publica detallada.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-3B-Qwen2.5-Unslop-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio GitHub: https://github.com/mrAndreyIsachenko/tenet-lab
- Espacio de inspeccion FP8 y abliteracion: https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Coleccion Tenet v1: https://huggingface.co/mr-andrey-isachenko
- Discusion con artefactos: https://huggingface.co/mr-andrey-isachenko/Tenet-3B-Qwen2.5-Unslop-v1/discussions/1
- Model Fight Card 16: https://onlymodels.gg/cards/2026-11-20.html
- Datos de la tarjeta: https://onlymodels.gg/data/card-2026-11-20.json
