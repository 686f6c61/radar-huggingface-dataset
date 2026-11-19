# nchapman/Apex-35B-V1.0-W4A16-HGPTQ

## Resumen

Apex-35B-V1.0-W4A16-HGPTQ es una cuantización de 4 bits del modelo multimodal Apexintelligence-AI/Apex-35B-V1.0, publicada por el usuario nchapman. Se trata de un checkpoint de tipo image-text-to-text construido sobre la arquitectura `qwen3_5_moe` (una variante MoE de la familia Qwen 3.5), con 36.468.770.672 parámetros totales y un total de 256 expertos enrutados por capa en 40 capas. El autor aplica una receta de cuantización W4A16 con rotación Walsh-Hadamard de 64×64, GPTQ con inicialización Cholesky por MSE y descenso de coordenadas sobre el Hessiano en dos pasadas, comprimiendo el modelo BF16 original de 66,97 GiB hasta 18,78 GiB (factor 3,57×).

El interés principal de esta ficha reside en que el checkpoint cuantizado cabe en una única GPU de 24 GB, lo que permite desplegar un MoE multimodal de ~36B parámetros en hardware de consumo o en instancias de gama media. La model card reporta métricas de fidelidad frente al modelo BF16 (KL ponderada de 0,0701 sobre `probe-v4`, perplejidad un 3,80 % inferior) y conserva el drafter especulativo nativo MTP y la torre de visión cuantizados, además de un ranking precalculado de expertos calientes para caché estática.

El modelo está pensado para desarrolladores que necesiten un LLM multimodal con soporte de tool calling, razonamiento multi-paso y decodificación especulativa, y que quieran ejecutarlo en vLLM con `compressed-tensors` sin parches. La licencia Apache 2.0 facilita el uso comercial, aunque la información disponible sobre idiomas, benchmarks estándar y datos de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (`qwen3_5_moe`), con atención, capas GDN (`linear_attn`), 256 expertos enrutados por capa, expertos compartidos, torre de visión ViT de 27 bloques y drafter MTP nativo |
| Parametros totales | 36.468.770.672 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (grupo 64) en todas las lineales de texto, MTP y visión; `lm_head` y `mtp.fc` en W8_g64 sin rotar; `embed_tokens`, `linear_attn.in_proj_a/b`, `mlp.gate`, `mlp.shared_expert_gate`, `visual.patch_embed.proj`, normas y sesgos en BF16 |
| Idiomas soportados | no disponible (la model card menciona evaluación multilingüe en `probe-v4`, sin listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `compressed-tensors` y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de la familia `qwen3_5_moe` con 40 capas y 256 expertos enrutados por capa, complementados por expertos compartidos. La arquitectura combina proyecciones de atención (`self_attn`), capas de atención lineal GDN (`linear_attn`), un bloque de visión ViT con 27 bloques y dos proyecciones de merger espacial, y un drafter MTP (Multi-Token Prediction) nativo para decodificación especulativa. El checkpoint cuantizado conserva en BF16 los embeddings, las proyecciones `in_proj_a`/`in_proj_b` de la atención lineal, las compuertas de enrutamiento (`mlp.gate`, `mlp.shared_expert_gate`), las normas, los sesgos y el `patch_embed` de visión; el resto se cuantiza a 4 bits con grupo 64.

La receta de cuantización combina rotación Walsh-Hadamard de 64×64 aplicada offline sobre la dimensión de entrada de cada lineal (`W' = W H_64 / 8`), GPTQ con inicialización Cholesky basada en MSE, descenso de coordenadas sobre el Hessiano en dos pasadas y un ajuste KL end-to-end con maestro FP32 para `RMSNorm` y GDN. En visión, `visual.blocks.*.mlp.linear_fc2` (K=4304) usa GPTQ Cholesky por canal con rotación Hadamard en línea de `head_dim=16`; el resto de lineales de visión emplea grupo 64 y `head_dim=64`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, con modo chat y configuración de muestreo por defecto (`temperature 1.0`, `top_p 0.95`, `top_k 20`).
- Procesamiento de imagen y texto (`image-text-to-text`): la torre ViT cuantizada conserva una similitud coseno de 0,9881 frente al BF16 en `vision-probe-v2`.
- Razonamiento matemático y científico, evaluado en los subconjuntos `math` y `science` de `probe-v4` con KL de 0,0436 y 0,0517 respectivamente.
- Seguimiento de instrucciones (`instruction_following`, KL 0,0507 en `probe-v4`).
- Uso de herramientas y function calling, según la composición declarada del conjunto `probe-v4` (chat, math, science, coding, tool use, multilingual).
- Decodificación especulativa nativa mediante el drafter MTP, con soporte en vLLM (`--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`).
- Capacidades multilingües evaluadas en `probe-v4` y `probe-guard`, sin listado explícito de idiomas.
- Caché estática de expertos calientes precalculada (`static_hot_cache_rankings.json`) para optimizar el enrutamiento en producción.

## Casos de uso

- Despliegue en una única GPU de 24 GB: el checkpoint de 18,78 GiB permite servir un MoE multimodal de ~36B parámetros en tarjetas como RTX 4090 o L4, algo inviable con el BF16 de 66,97 GiB.
- Asistente multimodal con imagen y texto: la torre ViT cuantizada mantiene un 97,35 % de acuerdo Top-1 aislado frente al BF16, adecuado para tareas de descripción de imágenes, extracción de información visual y respuesta a preguntas sobre documentos escaneados.
- Generación de código y razonamiento técnico: el conjunto `probe-v4` incluye coding y tool use, y el modelo soporta function calling para integrarse en pipelines de CI/CD o asistentes de IDE.
- Agentes multi-paso con decodificación especulativa: el drafter MTP nativo, con un 88,30 % de acuerdo Top-1 end-to-end, acelera la generación en vLLM reduciendo el coste por token en flujos agénticos.
- Atención al cliente automatizada: el modo conversacional y la ventana de contexto (no especificada) permiten gestionar diálogos multi-turno con historial, aunque conviene validar la longitud real de contexto antes de producción.
- Servicio de inferencia de bajo coste con vLLM: la compatibilidad con `compressed-tensors` sin parches y el soporte de `tp>=1` permiten desplegar el modelo en clústeres pequeños o instancias spot.
- Evaluación e investigación de cuantización: el checkpoint incluye métricas de fidelidad detalladas (KL, perplejidad, acuerdo Top-1) que sirven como referencia para estudiar el impacto de W4A16 en modelos MoE multimodales.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar (MMLU, HumanEval, GSM8K), pero sí métricas de fidelidad frente al modelo BF16:

| Evaluacion | BF16 base | W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamano safetensors | 66,97 GiB | 18,78 GiB | 3,57× compresion (−48,19 GiB) |
| Perplejidad texto (`probe-v4`, 378 prompts, 840.187 tokens) | 5,1325 | 4,9373 (−3,80 %) | Chat, math, science, coding, tool use, multilingual |
| KL ponderada / media (`probe-v4`) | 0,0000 | 0,0701 / 0,1109 | `math` 0,0436; `IF` 0,0507; `science` 0,0517; `chat` 0,0541 |
| Perplejidad holdout (`probe-guard`, 76 prompts, 19.534 tokens) | 13,8270 | 13,5988 (−1,65 %) | KL ponderada 0,0625; media 0,0575 |
| MTP nativo (11.583 posiciones) | 100,0 % Top-1 (NLL 2,4931) | 95,06 % aislado / 88,30 % E2E | KL aislada 0,0121; E2E 0,0758 (NLL 2,4870) |
| Vision (`vision-probe-v2`, 96 imagenes, 302 tokens) | 1,0000 cos sim; 100,0 % Top-1 | 0,9881 cos sim; 97,35 % iso / 94,37 % E2E | KL ViT aislada 0,0169; E2E 0,0528 |
| Vision guard (`vision-guard-v2`, 48 imagenes, 135 tokens) | 1,0000 cos sim; 100,0 % Top-1 | 0,9912 cos sim; 99,26 % iso / 96,30 % E2E | KL ViT aislada 0,0035; E2E 0,0221 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 18,78 GiB de pesos en W4A16, más overhead de activaciones, caché KV y el drafter MTP; el autor indica que cabe en una GPU de 24 GB.
- GPU recomendadas: RTX 4090 (24 GB), L4 (24 GB), A10G (24 GB), A100 40/80 GB, H100; para tensor parallel `tp>=1` en vLLM.
- Cabe en GPU de consumo: sí, en RTX 4090 de 24 GB; en tarjetas de 16 GB no hay margen suficiente para pesos y activaciones.
- Opciones de despliegue: vLLM 0.34+ con `compressed-tensors` y el módulo `vllm_warp_quant.py` incluido vía `auto_map`; soporte de decodificación especulativa MTP. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el drafter MTP está pensado para acelerar la generación, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Apex-35B-V1.0-W4A16-HGPTQ | 36,47 B (MoE) | no disponible | W4A16 + W8 en `lm_head` | Apache 2.0 | Multimodal, MTP nativo, 18,78 GiB |
| Apexintelligence-AI/Apex-35B-V1.0 (BF16) | 36,47 B (MoE) | no disponible | BF16 | Apache 2.0 | Referencia de fidelidad, 66,97 GiB |
| Alternativas de la familia Qwen 3.5 MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con modelos de la misma categoria distintos del propio modelo base.

## Limitaciones y advertencias

- La cuantizacion introduce divergencia respecto al BF16: KL ponderada de 0,0701 en `probe-v4` y perdida de acuerdo Top-1 del 4,94 % en el MTP aislado y del 11,70 % end-to-end.
- La torre de vision pierde entre un 0,74 % y un 5,63 % de acuerdo Top-1 segun el conjunto de evaluacion, lo que puede afectar a tareas visuales de alta precision.
- No se especifican los idiomas soportados ni la longitud de contexto; es imprescindible validar ambos antes de desplegar en produccion.
- No hay benchmarks estandar publicados (MMLU, HumanEval, GSM8K), por lo que la comparacion con otros modelos es limitada.
- Riesgo de alucinacion inherente a los LLM; la cuantizacion puede amplificarlo en dominios especializados no cubiertos por `probe-v4`.
- El modelo base tiene 0 descargas y 0 likes en el momento de la consulta, y el checkpoint cuantizado tambien; no hay evidencia de uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia y los terminos del modelo base Apexintelligence-AI/Apex-35B-V1.0.
- El despliegue requiere vLLM 0.34+ y el modulo `vllm_warp_quant.py`; no se documenta soporte para otros runtimes como llama.cpp, Ollama o TGI.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/nchapman/Apex-35B-V1.0-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Commit del modelo base referenciado: `5105f8f9ed8fd8212a72da546bcbb4f01d2cfd68`
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Documentacion de `compressed-tensors`: https://github.com/neuralmagic/compressed-tensors
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
- Paper de QuIP (rotaciones Hadamard): https://arxiv.org/abs/2306.07629
