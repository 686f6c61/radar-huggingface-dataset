# christianengel/agent-guard-longctx

## Resumen

Agent Guard LongCtx es un modelo de clasificación de texto especializado en la detección de inyecciones de prompt (directas, indirectas de contexto largo y ofuscadas con Unicode) para proteger agentes basados en LLM. Lo desarrolla christianengel como un fine-tuning de `answerdotai/ModernBERT-base`, una arquitectura transformer encoder-only con 149,6 millones de parámetros y una ventana de contexto de 8.192 tokens (4.096 en evaluación). Su propósito es actuar como guardrail en pipelines de agentes, filtrando entradas maliciosas antes de que lleguen al modelo principal.

El modelo aborda una carencia concreta de los clasificadores de seguridad previos: la mayoría están limitados a 512 tokens, lo que los hace ineficaces frente a ataques de inyección indirecta incrustados en documentos largos, resultados de herramientas o páginas web. Al extender el contexto a 8.192 tokens y entrenar sobre datos específicos de inyección indirecta y ofuscación Unicode, mejora sustancialmente el recall en esos escenarios manteniendo tasas de falsos positivos bajas.

Es relevante ahora porque los agentes con acceso a herramientas externas (navegación, ejecución de código, consultas a bases de datos) son cada vez más comunes y exponen una superficie de ataque nueva: contenido no confiable que el agente procesa como si fuera instrucción. El modelo se distribuye con pesos en PyTorch safetensors y variantes ONNX (fp32, fp16, int8), además de un normalizador Unicode y adaptadores para `llm-guard` y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT-base, fine-tuning) |
| Parametros totales | 149.606.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (4.096 en evaluación) |
| Tipos de cuantizacion | ONNX FP32, ONNX mixed FP16, ONNX INT8 (QInt8); pesos raíz en float32 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch float32), ONNX (fp32/fp16/int8) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un transformer encoder-only que incorpora mejoras sobre BERT clásico como RoPE (rotary position embeddings), atención con soporte de contexto largo y capas GeGLU. El fine-tuning conserva la cabeza de clasificación de secuencia para producir una puntuación de probabilidad de inyección. El checkpoint raíz se distribuye en safetensors float32 (570,72 MiB) e incluye `config.json` con el umbral de decisión (`tau=0.9540`, calibrado a 0,5% de FPR en dev) y un `calibration.json`.

El entrenamiento combina numerosos datasets de inyección de prompt y jailbreak (`yanismiraoui/prompt_injections_v2`, `reshabhs/SPML_Chatbot_Prompt_Injection`, `S-Labs/prompt-injection-dataset`, `Lakera/gandalf_ignore_instructions`, `walledai/JailbreakHub`, `jackhhao/jailbreak-classification`, `sevdeawesome/jailbreak_success`) con datos de conversación y uso legítimo (`HuggingFaceH4/ultrachat_200k`, `OpenAssistant/oasst1`) y negativos de dominio técnico (`gretelai/synthetic_text_to_sql`, `kaxap/pg-wikiSQL-sql-instructions-80k`, `quotientai/limbic-eval-tool-use-mcp`, `NousResearch/hermes-function-calling-v1`, `CyberNative/Code_Vulnerability_Security_DPO`, `codeparrot/github-code-clean`) para reducir falsos positivos en contenido de código, SQL y READMEs. Se realizó una auditoría de solapamiento train/dev/test con resultado 0/0/0/0/0 (`split_overlap_audit_v3.json`). Incluye un `normalizer.py` para neutralizar ofuscación Unicode antes de la tokenización, y exportaciones ONNX con verificación de error máximo (`MaxAbsErr < 1.2e-5` frente a PyTorch hasta 2.048 tokens).

## Capacidades

- Clasificación binaria de inyección de prompt directa (instrucciones maliciosas en el turno del usuario).
- Detección de inyección indirecta en contexto largo: ataques incrustados en documentos, resultados de herramientas o páginas web de hasta 8.192 tokens.
- Detección de ataques ofuscados con Unicode (homoglifos, caracteres invisibles, variaciones de codificación) mediante el normalizador incluido.
- Detección de jailbreaks y variantes de "ignore instructions" en inglés.
- Discriminación de contenido legítimo de dominio técnico (código, SQL, READMEs, definiciones de herramientas) para minimizar falsos positivos.
- Inferencia sin PyTorch mediante `onnxruntime` + `tokenizers` (ruta rápida pura Python).
- Integración con `llm-guard` y con un router de vLLM mediante adaptadores incluidos.
- Compatibilidad con Transformers.js v4 (`dtype: "q8"`) para ejecución en navegador vía WebGPU.
- No es un modelo generativo: no produce texto, solo una puntuación de probabilidad de inyección.

## Casos de uso

- Filtrado de entrada en agentes con herramientas: clasificar cada mensaje del usuario y cada resultado de herramienta antes de incorporarlo al contexto del LLM principal; el contexto de 8.192 tokens permite analizar documentos completos sin truncar.
- Protección frente a inyección indirecta en navegación web: analizar el contenido raspado de una página antes de pasarlo al agente, cubriendo el escenario donde el modelo base solo alcanza 74,67% de recall a 0% de FPR frente al 1,33% del baseline de 512 tokens.
- Guardrail en pipelines RAG: clasificar fragmentos recuperados de la base vectorial para detectar documentos envenenados antes de la generación.
- Moderación de entradas en asistentes conversacionales: detectar jailbreaks y variantes de "ignore previous instructions" en producción con umbral calibrado a 0,5% o 1,0% de FPR según tolerancia.
- Ejecución en el navegador o en el borde: desplegar la variante ONNX INT8 (311,74 MiB) con Transformers.js v4 para prefiltrar entradas en cliente sin enviar contenido a servidores.
- Protección de agentes de código: clasificar issues, comentarios de PR o fragmentos de repositorios antes de que un agente de codificación los procese, aprovechando la baja tasa de falsos positivos en código (0/250 en el conjunto `cve` y 0/247 en `github_readmes`).
- Enrutado condicional en vLLM: usar el adaptador de router para decidir si una petición se procesa o se bloquea antes de invocar el modelo generativo, reduciendo coste de cómputo en peticiones maliciosas.

## Benchmarks y rendimiento

Evaluación con `max_length=4096` para Agent Guard y 512 para el baseline DeBERTa-v3, sobre conjuntos held-out sin solapamiento.

| Modelo / punto de operación | Umbral | `external_core` AUROC | `external_core` AUPRC | `external_core` Recall | `external_core` FPR | `external_core` Macro-F1 | `longctx_indirect` Recall / FPR | `unicode_obfuscated` Recall / FPR |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `protectai/deberta-v3-base-v2` (oracle ≤1% FPR) | 0,9945 | 0,8363 | 0,8436 | 66,71% | 0,96% | 85,83% | 1,33% / 2,67% | 11,33% / 0,00% |
| Agent Guard FP32 (oracle ≤1% FPR) | 0,9820 | 0,9744 | 0,9446 | 68,34% | 0,96% | 86,57% | 74,67% / 0,00% | 83,33% / 1,33% |
| Agent Guard FP32 (dev 0,5% FPR, `config.json`) | 0,9540 | 0,9744 | 0,9446 | 70,52% | 1,14% | 87,39% | 74,67% / 0,00% | 85,33% / 1,33% |
| Agent Guard FP32 (dev 1,0% FPR) | 0,4751 | 0,9744 | 0,9446 | 77,72% | 1,98% | 89,81% | 79,33% / 0,00% | 89,33% / 1,33% |

Desglose por fuente (`external_core`), con umbrales oracle 0,9820 y dev 0,9540:

| Fuente | Filas (Pos / Neg) | DeBERTa-v3 Recall o FPR (0,9945) | Agent Guard Oracle | Agent Guard dev `tau=0,9540` |
|---|---:|---:|---:|---:|
| cyberec | 942 (552/390) | R 79,71% · FPR 1,28% | R 78,08% · FPR 3,33% | R 79,53% · FPR 3,59% |
| deepset | 116 (60/56) | R 30,00% · FPR 0,00% | R 28,33% · FPR 3,57% | R 33,33% · FPR 5,36% |
| jbb | 162 (84/78) | R 0,00% · FPR 0,00% | R 25,00% · FPR 1,28% | R 29,76% · FPR 2,56% |
| slfgod | 71 (40/31) | R 82,50% · FPR 3,23% | R 85,00% · FPR 0,00% | R 87,50% · FPR 0,00% |
| cve | 250 (0/250) | FPR 0,00% | FPR 0,00% | FPR 0,00% |
| github_readmes | 247 (0/247) | FPR 1,62% | FPR 0,00% | FPR 0,00% |
| sql | 250 (0/250) | FPR 0,00% | FPR 0,00% | FPR 0,00% |

Rendimiento de las variantes ONNX: INT8 (`onnx/model_quantized.onnx`, 311,74 MiB) retiene 100,140% del Macro-F1 (0,8669 frente a 0,8657 oracle; 100,004% con `tau=0,9540`) con latencia p50 de 323,59 ms frente a 626,81 ms en CPU (perfil de 512 tokens). FP16 (286,24 MiB) retiene 100,211% de F1. La variante INT8 es la opción por defecto para CPU y Transformers.js v4.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP32 ocupa 570,72 MiB en disco; en memoria ronda 600-700 MB. La variante ONNX INT8 requiere aproximadamente 312 MiB en disco y menos de 500 MB de RAM/VRAM en ejecución.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente, incluida una GTX 1050 o superior. Para throughput alto en servidor, A100, H100, L4 o T4 son adecuadas; el cuello de botella es la latencia, no la memoria.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier iGPU con WebGPU (vía Transformers.js).
- Opciones de despliegue: `onnxruntime` (ruta pura Python incluida), Transformers.js v4 (`dtype: "q8"`), `llm-guard` mediante adaptador, router de vLLM mediante adaptador, y `transformers` con PyTorch para el checkpoint raíz. También es compatible con Text Embeddings Inference según los tags del repositorio.
- Latencia: p50 de 323,59 ms en CPU con INT8 a 512 tokens; 626,81 ms con FP32 en las mismas condiciones. En GPU la latencia es sustancialmente menor, aunque no se publican cifras concretas de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | `external_core` AUROC | `longctx_indirect` recall @ 0% FPR | `unicode_obfuscated` recall | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Agent Guard LongCtx | 149,6 M | 8.192 | 0,9744 | 74,67% | 83,33% (1,33% FPR) | Apache 2.0 |
| `protectai/deberta-v3-base-prompt-injection-v2` | no disponible en la información | 512 | 0,8363 | 1,33% | 11,33% (0% FPR) | no disponible en la información |
| Clasificadores de seguridad genéricos (p. ej. Llama Guard, no evaluados aquí) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible se limita al baseline DeBERTa-v3 de ProtectAI, sobre el que el modelo mejora el AUROC en +13,81 puntos y el recall en contexto largo en +73,34 puntos. No se han publicado comparaciones con otros guardrails en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); su eficacia en otros idiomas, incluido el castellano, no está validada.
- El recall en el subconjunto `deepset` es bajo (28-33%), y en `jbb` se sitúa en 25-30%: no cubre todos los tipos de jailbreak con la misma fiabilidad.
- La tasa de falsos positivos en `cyberec` es del 3,33-3,59%, superior a la del baseline (1,28%); en dominios con contenido de seguridad ofensiva legítimo puede generar bloqueos indebidos.
- Es un clasificador, no un generador: no explica la decisión ni ofrece razonamiento, solo una probabilidad. Requiere umbral calibrado según el caso de uso.
- El umbral por defecto (`tau=0,9540`) está calibrado a 0,5% de FPR en dev; cambiarlo altera el equilibrio recall/FPR y debe revalidarse en el dominio objetivo.
- La normalización Unicode es un paso separado (`normalizer.py`); omitirla degrada la detección de ataques ofuscados.
- No se han publicado resultados de benchmarks en la información disponible más allá de los conjuntos internos del autor; la generalización a dominios no representados en el entrenamiento no está cuantificada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento si se redistribuye el modelo.
- Riesgo de envenenamiento del propio guardrail: un atacante que conozca el clasificador puede intentar evadir la detección; se recomienda defensa en profundidad y no confiar únicamente en este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christianengel/agent-guard-longctx
- Demo WebGPU: https://huggingface.co/spaces/christianengel/agent-guard-demo
- Repositorio GitHub: https://github.com/protortyp/agent-guard-longctx
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Baseline ProtectAI DeBERTa-v3: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
