# mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1

## Resumen
Tenet-12B-Nemo-Unslop-v1 es un fine-tune del modelo Mistral-Nemo-Instruct-2407 (12B parametros) desarrollado por mr-andrey-isachenko. El modelo aplica una tecnica de "cirugia de subespacios" denominada Lancet, que elimina direccionalmente la componente de rechazo tanto en la proyeccion de entrada (residual stream) como en la de salida (unembedding), preservando la norma residual para mantener las magnitudes de activacion en la manifold original. Posteriormente se aplica un pase de GRPO ("gated unslop") que penaliza patrones de "slop" estilistico (prosa purpura, preambulos moralizantes) solo en las zonas donde la cirugia debilito los circuitos de rechazo.

El objetivo declarado es reducir falsos rechazos ante peticiones benignas y eliminar deriva estilistica, preservando las capacidades analiticas, de codigo y razonamiento estructurado del modelo base. Se distribuye como checkpoint FP8 (E4M3) listo para proveedores, sin codigo custom, sin `trust_remote_code` y sin `auto_map`, de modo que el repositorio puede cargarse directamente en vLLM, proveedores OpenRouter, GGUF y MLX. La licencia es Apache 2.0.

Es relevante para desarrolladores que necesitan un modelo conversacional de 12B con tool calling y generacion de codigo sin rechazos espurios, pero debe tenerse en cuenta que el repositorio aparece con 0 descargas, 0 likes y un tamano de 0.0 GB en el momento de la consulta, lo que sugiere que los pesos pueden no estar publicados o que el repo es esencialmente una model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-Nemo-Instruct-2407) |
| Parametros totales | 12B (heredados del base Mistral-Nemo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun el ejemplo de vLLM con `--max-model-len 32768`; el base Mistral-Nemo soporta hasta 128K) |
| Tipos de cuantizacion | FP8 (E4M3) como formato de exportacion principal; GGUF CKA-Quant (p. ej. Q4_K_M) mencionado en la model card |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP8 E4M3); GGUF disponible segun la model card |

## Arquitectura y entrenamiento
El modelo parte de Mistral-Nemo-Instruct-2407, un transformer decoder-only de 12B parametros. Sobre esa base se aplica el motor Lancet, descrito como "cirugia de subespacios bi-proyectada con preservacion de norma": se identifica la direccion de rechazo en las proyecciones de entrada y salida, se elimina la componente de forma bidireccional y se restaura exactamente la norma residual, de modo que las magnitudes de activacion y las distribuciones de tokens aguas abajo permanecen en la manifold. Esto contrasta con la "abliteracion ingenua", que segun la model card produce una deriva colateral de KL de 0,30 frente a 9,75e-03 del checkpoint BF16 de Tenet.

Tras la cirugia se ejecuta un pase de GRPO ("gated unslop") cuya recompensa penaliza patrones de slop solo donde la cirugia debilito los circuitos de rechazo, con el objetivo de reforzar razonamiento y codigo en lugar de danarlos. El checkpoint final se exporta a FP8 (E4M3). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni detalles del RLHF/DPO original del base.

## Capacidades
- Generacion de texto conversacional multi-turno.
- Razonamiento estructurado y analitico (preservado del base, segun la model card).
- Generacion de codigo, incluido SQL (DuckDB) y consultas sobre logs.
- Tool calling / function calling con salida JSON schema-valid (ejemplo de `duckdb.query` en la model card).
- Uso en entornos agenticos y DevOps/AppSec (triage de logs, consultas de seguridad).
- Reduccion de rechazos espurios en peticiones benignas (refusal suppression reportado de 0,99 en BF16 y 1,00 en FP8).
- Mitigacion de deriva estilistica ("slop"): prosa purpura, preambulos moralizantes, vocabulario tipo "tapestry".
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode explicito: no disponibles.

## Casos de uso
- Triage de logs de seguridad: el modelo puede recibir lineas de log (por ejemplo, nginx auth) y devolver una tool call SQL valida para DuckDB, como se muestra en la model card, evitando rechazos falsos ante peticiones de analisis defensivo.
- Generacion de codigo SQL en pipelines de datos: integrado via tool calling, puede producir consultas `read_json_auto` y agregaciones sobre logs con salida JSON estructurada.
- Asistente DevOps/AppSec: gestiona peticiones de analisis de sistemas y configuracion sin preambulos moralizantes, adecuado para equipos que ya operan con guardrails externos.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto de hasta 32K tokens (segun el ejemplo de despliegue), con respuestas concisas y sin deriva estilistica.
- Agentes multi-paso con tool use: la ortogonalidad del ancla tool/SQL reportada (3,00e-08 en BF16) sugiere que las tool calls mantienen formato valido tras la cirugia.
- Despliegue en proveedores OpenRouter: el checkpoint FP8 esta pensado para exportacion directa a proveedores, sin codigo custom ni `trust_remote_code`.
- Prototipado local con llama.cpp/Ollama: la model card menciona un GGUF CKA-Quant Q4_K_M para ejecucion en consumer hardware.

## Benchmarks y rendimiento
Los benchmarks publicados por el autor no son metricas estandar (MMLU, HumanEval, GSM8K); son metricas internas H9, H10 y H11, junto con una tabla comparativa frente a abliteracion ingenua.

| Variante | H9 (menor mejor) | H10 (mayor mejor) | H11 (mayor mejor) |
|---|---|---|---|
| BF16 | 9,75e-03 | 0,27 | 0,97 |
| FP8 (E4M3) | 0,02 | 1,00 | 0,49 |
| Abliteracion ingenua | 0,30 | 0,43 | 0,50 |

Comparativa adicional reportada en la model card:

| Metrica | Base | Abliteracion ingenua | Tenet (BF16) | Tenet (FP8 E4M3) |
|---|---|---|---|---|
| KL Collateral Drift | — | 0,30 | 9,75e-03 | 0,18 |
| Refusal Suppression | — | — | 0,99 | 1,00 |
| Tool/SQL Anchor Orthogonality | — | 0,81 | 3,00e-08 | 0,13 |
| LoRA Re-Leakage | — | 0,81 | 0,13 | 0,18 |
| FP8 Subspace Re-Leakage | — | 0,50 | — | 0,18 |
| Max Row Crest-Factor (< 25,0) | — | — | 10,65 | 10,65 |

Ademas: max row crest-factor 10,65 y max absolute weight 0,92. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 12B en FP8 (E4M3) se requiere aproximadamente 12 GB de pesos mas overhead de activaciones y KV cache, pero esta cifra no la proporciona la model card.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Consumer GPU: la model card menciona GGUF CKA-Quant Q4_K_M para llama.cpp (`-ngl 99`), lo que sugiere viabilidad en GPUs consumer, pero no se especifican modelos concretos.
- Opciones de despliegue: vLLM (`vllm serve ... --quantization fp8`), Transformers (`AutoModelForCausalLM`), llama.cpp (GGUF), Ollama, MLX y proveedores OpenRouter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tenet-12B-Nemo-Unslop-v1 | 12B | 32.768 (segun ejemplo vLLM) | De-refusal + de-slop (Lancet + GRPO) | apache-2.0 | Repo con 0 descargas, 0 likes, 0.0 GB |
| Mistral-Nemo-Instruct-2407 | 12B | hasta 128K | Instruct generalista | apache-2.0 | Publico en HF |
| Abliteracion ingenua de Mistral-Nemo | 12B | segun base | Eliminacion directa de rechazo | apache-2.0 | Variantes comunitarias |

La comparativa se limita al base y a la abliteracion ingenua porque la model card solo reporta esas referencias. No se dispone de comparacion con otros fine-tunes de-refusal de la misma categoria.

## Limitaciones y advertencias
- El modelo esta explicitamente orientado a uso como asistente alineado; operaciones ofensivas, malware o contenido ilicito quedan fuera de alcance y no estan soportadas.
- La reduccion de rechazos puede incrementar la probabilidad de respuestas a peticiones ambiguas o sensibles; se recomienda mantener guardrails externos en produccion.
- El checkpoint FP8 muestra H10 = 1,00 pero H11 = 0,49, lo que indica que la robustez tras cuantizacion FP8 es limitada en comparacion con el BF16 (H11 = 0,97).
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue mas alla del base.
- Contexto: el ejemplo de despliegue usa `--max-model-len 32768`, inferior al contexto maximo del base Mistral-Nemo (hasta 128K); conviene verificar el contexto real soportado por el checkpoint.
- El repositorio muestra 0.0 GB de tamano, 0 descargas y 0 likes; los pesos pueden no estar efectivamente publicados o el repo puede ser solo una model card. Verificar antes de integrar en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias explicitas sobre el comportamiento del modelo tras la cirugia.

## Enlaces
- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
