# mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1

## Resumen

Tenet-8B-Llama3.1-Unslop-v1 es un ajuste fino (fine-tune) del modelo `meta-llama/Llama-3.1-8B-Instruct` publicado por el usuario `mr-andrey-isachenko` bajo el paraguas del proyecto Tenet. El modelo aplica una tecnica propietaria denominada Lancet, descrita por el autor como una cirugia de subespacio bi-proyectada que preserva la norma, orientada a eliminar la direccion de rechazo (refusal) tanto en la proyeccion de entrada (residual stream) como en la de salida (unembedding), restaurando exactamente la norma residual para mantener las magnitudes de activacion en la variedad original. Sobre esa cirugia se aplica un pase de GRPO con compuertas (gated unslop GRPO) que penaliza patrones de "slop" estilistico (prosa recargada, preambulos moralizantes) solo donde la cirugia debilito el circuito de rechazo.

El resultado se exporta como checkpoint FP8 (E4M3) listo para proveedores de inferencia, sin codigo personalizado, sin `trust_remote_code` y sin `auto_map`, de modo que el repositorio puede cargarse directamente en vLLM, proveedores de OpenRouter, GGUF y MLX. El modelo tiene 8.030.261.248 parametros (8B) y hereda la ventana de contexto de 128.000 tokens de Llama 3.1, aunque la model card no la explicita.

Es relevante ahora porque se presenta como una alternativa a la ablacion ingenua (naive abliteration) con metricas de retencion de capacidad downstream y de fuga de subespacio, y porque incluye cuantizacion FP8 y GGUF en el mismo repositorio, lo que simplifica el despliegue en produccion. La licencia es Apache 2.0, aunque el modelo base Llama 3.1 tiene su propia licencia de comunidad que conviene verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), fine-tune con cirugia de subespacio Lancet y GRPO |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del base Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | FP8 (E4M3), GGUF; BF16 en el modelo de referencia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atencion por grupos (GQA) y RoPE, sin modificaciones estructurales. La innovacion del release no esta en la arquitectura sino en el pipeline de ajuste. El motor Lancet realiza una "cirugia de subespacio bi-proyectada que preserva la norma": identifica la direccion de rechazo en las proyecciones de entrada y salida, elimina el componente de forma bidireccional y restaura exactamente la norma residual, de modo que las magnitudes de activacion y las distribuciones de tokens posteriores permanecen en la variedad original. El autor reporta un KL colateral de 0,01 frente a 0,13 de la ablacion ingenua (ratio de reduccion de 0,90) y una supresion del objetivo de 0,99.

Tras la cirugia se aplica un pase de GRPO con compuertas de recompensa que penalizan patrones de slop solo donde el circuito de rechazo quedo debilitado, con el objetivo de reforzar razonamiento, codigo e instrucciones en lugar de sacrificarlos. El autor reporta un IFEval de 0,81 en este pase, una ganancia de 0,25 frente a variantes naive/aditivas y una tasa de slop y rechazo de 0,04. Posteriormente se aplica cuantizacion FP8 (E4M3), con una retencion de 0,99 y una fuga de subespacio de 0,03 frente a 0,50 de la variante naive, y una fusion TIES segura respecto al subespacio con una retencion de SQL de 0,98 y una fuga de 2,16e-07. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del RLHF/DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Llama 3.1 Instruct.
- Razonamiento estructurado y analitico, con refuerzo explicito mediante el pase de GRPO.
- Generacion de codigo y capacidades de programacion (etiqueta `coding`).
- Uso de herramientas (tool calling / function calling) y flujos agenticos (etiquetas `agentic`, `tool-use`).
- Consultas SQL y retencion de anclaje SQL tras la fusion TIES (metrica SQL-Incident Retention de 0,98).
- Reduccion de rechazos falsos positivos ante peticiones benignas (supresion de rechazo de 0,99).
- Mitigacion de "slop" estilistico: prosa recargada, vocabulario tipo "tapestry" y preambulos moralizantes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (heredado de Llama 3.1, 128.000 tokens) y, gracias a la supresion de rechazos falsos positivos, responde a consultas benignas que modelos mas conservadores rechazarian por precaucion.
- Generacion de codigo en produccion: con soporte de tool calling y una retencion de capacidad de codigo reforzada por GRPO, puede integrarse en pipelines de CI/CD para generar parches, tests o revisiones automatizadas.
- Agentes con uso de herramientas: las etiquetas `agentic` y `tool-use` y la retencion de anclaje SQL lo hacen adecuado para asistentes que encadenan llamadas a APIs y consultas a bases de datos en varios pasos.
- Asistente de analisis de datos y SQL: la metrica de retencion de SQL (0,98) tras la fusion TIES indica que el modelo conserva la capacidad de generar consultas correctas en flujos de analitica.
- Despliegue en proveedores de inferencia: el checkpoint FP8 (E4M3) sin codigo personalizado permite servirlo directamente en vLLM u ofrecerlo a traves de proveedores de OpenRouter con coste de VRAM reducido.
- Ejecucion local en hardware de consumo: la disponibilidad de pesos GGUF permite desplegarlo con llama.cpp u Ollama en equipos con GPU consumer, para prototipado y uso personal.
- Generacion de contenido creativo sin preambulos moralizantes: el pase de unslop reduce la prosa recargada y los avisos innecesarios, lo que resulta util en herramientas de redaccion y marketing.

## Benchmarks y rendimiento

Los datos publicados por el autor provienen del pipeline de release (`final_metrics.json`) y no son comparables directamente con benchmarks estandar como MMLU o HumanEval.

| Metrica (fase) | Valor | Direccion |
|---|---|---|
| Lancet KL Collateral (H9) | 0,01 | Menor es mejor |
| Naive KL Collateral (H9) | 0,13 | Menor es mejor |
| KL Reduction Ratio (H9) | 0,90 | Mayor es mejor |
| Target Suppression Ratio (H9) | 0,99 | Mayor es mejor |
| Gated GRPO IFEval Score (H10) | 0,81 | Mayor es mejor |
| Gated vs Naive/Additive Gain (H10) | 0,25 | Mayor es mejor |
| Slop & Refusal Rate (H10) | 0,04 | Menor es mejor |
| Post-Merge Suppression Retention (H10) | 1,00 | Mayor es mejor |
| FP8 Retention Ratio (H11) | 0,99 | Mayor es mejor |
| FP8 KL Reduction vs Naive (H11) | 0,43 | Mayor es mejor |
| FP8 Subspace Re-Leakage Lancet (H11) | 0,03 | Menor es mejor |
| FP8 Subspace Re-Leakage Naive (H11) | 0,50 | Menor es mejor |
| SQL-Incident Retention (H12) | 0,98 | Mayor es mejor |
| Unslop Retention (H12) | 1,00 | Mayor es mejor |
| Subspace-Safe Merge Re-Leakage (H12) | 2,16e-07 | Menor es mejor |
| TIES Bi-Projected vs Naive Gain (H12) | 0,80 | Mayor es mejor |

El autor menciona ademas una evaluacion de terceros ("Model Fight Card 16", 2026-11-20) en la que el modelo habria quedado primero con 50 HP, 24/24 artefactos clasificables y 7/7 impactos limpios en la evaluacion por pares. Estos datos proceden de una fuente externa no verificada de forma independiente en la informacion disponible y no deben interpretarse como benchmarks academicos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en la practica, 18-24 GB para contextos moderados.
- VRAM estimada en FP8 (E4M3): aproximadamente 8 GB de pesos, con margen para cache KV; viable en GPUs de 12-16 GB.
- VRAM estimada en GGUF (Q4_K_M): aproximadamente 5-6 GB, apto para GPUs consumer de 8 GB.
- GPUs recomendadas para produccion: NVIDIA A100 40/80 GB, H100, L40S; para FP8 se recomienda hardware con soporte nativo (H100, L40S, Ada Lovelace).
- GPUs consumer: cabe en RTX 4090 (24 GB) en BF16 y FP8, y en RTX 3090/4080 en FP8 o GGUF; en tarjetas de 8 GB solo en cuantizaciones GGUF agresivas.
- Opciones de despliegue: vLLM (soporte nativo del checkpoint FP8 sin codigo personalizado), llama.cpp y Ollama (via GGUF), MLX, TGI y proveedores de OpenRouter.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Tenet-8B-Llama3.1-Unslop-v1 | 8B | 128.000 (heredado, no explicitado) | Apache 2.0 | Fine-tune de Llama 3.1 con cirugia Lancet, GRPO y FP8 |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community License | Modelo base alineado de Meta |
| Mistral-7B-Instruct | 7B | 32.000 (v0.3) | Apache 2.0 | Alternativa abierta de tamano similar |
| Qwen3-14B | 14B | 32.000-128.000 (segun variante) | Apache 2.0 | Modelo mas grande de la misma categoria |

El autor cita como anclas de referencia de su evaluacion a Llama-3.1-8B, Mistral-7B, Gemma-3-12B, Qwen3-14B y GPT-OSS-20B, pero no se dispone de una comparativa de rendimiento estandar (MMLU, HumanEval, GSM8K) entre estos modelos y Tenet en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta explicitamente desalineado en lo que respecta al rechazo: la supresion de rechazo de 0,99 implica que puede responder a peticiones que el modelo base rechazaria; el autor declara fuera de alcance el uso para ciberoperaciones ofensivas, malware o contenido ilegal, pero no hay garantia tecnica de que el modelo se niegue a ello.
- Riesgo de alucinacion inherente al modelo base Llama 3.1 8B, no mitigado por el pipeline descrito.
- La model card no documenta sesgos conocidos, composicion del dataset de entrenamiento ni evaluaciones de seguridad independientes.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- La licencia del repositorio es Apache 2.0, pero el modelo base Llama 3.1 se distribuye bajo la Llama 3.1 Community License, cuyos terminos pueden imponer restricciones adicionales al uso comercial; conviene verificar la compatibilidad antes de desplegar en produccion.
- Las metricas publicadas son internas del pipeline del autor (KL colateral, retencion, fuga de subespacio) y no equivalen a benchmarks academicos estandar; la evaluacion "Model Fight Card 16" procede de una fuente externa no verificada.
- El checkpoint FP8 (E4M3) puede degradar ligeramente la calidad frente a BF16; el autor reporta una retencion de 0,99, pero no se detalla el conjunto de evaluacion.
- El modelo tiene un numero muy bajo de descargas (1.600) y de "likes" (1) en el momento de la consulta, lo que limita la evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de codigo y informe tecnico: https://github.com/mrAndreyIsachenko/tenet-lab
- Space de auditoria FP8 y ablacion: https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Coleccion de la familia Tenet v1: https://huggingface.co/mr-andrey-isachenko
- Discusion con la evaluacion por pares: https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1/discussions/1
- Model Fight Card 16: https://onlymodels.gg/cards/2026-11-20.html
- Artefactos de la House Series: https://onlymodels.gg/data/card-2026-11-20.json
