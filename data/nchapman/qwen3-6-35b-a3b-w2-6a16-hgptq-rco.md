# nchapman/Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO

## Resumen
Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO es una cuantizacion mixta de precision sub-3 bits del modelo multimodal Qwen/Qwen3.6-35B-A3B, desarrollada por el usuario nchapman. Emplea una combinacion de Hadamard, GPTQ con descomposicion de Cholesky y optimizacion con restricciones riemannianas (HGPTQ-RCO) para comprimir el checkpoint original en BF16 de 66,97 GiB hasta 13,15 GiB, lo que supone una reduccion de 5,09 veces. El objetivo es permitir la ejecucion del modelo completo (backbone de lenguaje, torre de vision y drafter MTP nativo) en una unica GPU de 16 GB, manteniendo una calidad cercana al modelo base.

El modelo base es un MoE multimodal de 35B parametros totales con 256 expertos, del que se activan aproximadamente 3B por token. La cuantizacion conserva en W4_g64 todas las proyecciones de atencion y GatedDeltaNet, los expertos compartidos, el MTP nativo y la torre de vision, mientras que asigna W2_g64 al 75% de los expertos enrutados y W4_g64 al 25% restante. Los cabezales `lm_head` y `mtp.fc` se mantienen en W8_g64.

La relevancia de esta ficha radica en que demuestra que es viable desplegar un modelo MoE multimodal de 35B en hardware de consumo con una perdida de calidad medible y acotada, lo que abre la puerta a experimentacion local con modelos de gran tamano sin infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con GatedDeltaNet + atencion completa, torre de vision ViT y MTP nativo (drafter especulativo) |
| Parametros totales | 24.389.175.152 (segun safetensors); el modelo base se describe como 35B-A3B |
| Parametros activos | Aproximadamente 3B por token (segun denominacion A3B del modelo base) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W2_g64, W4_g64 y W8_g64 (group size 64); 2,62 bpw en el backbone de lenguaje, 2,50 bpw en expertos enrutados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors, GPTQ) |

## Arquitectura y entrenamiento
El modelo base Qwen3.6-35B-A3B es un MoE multimodal con 40 capas que combina proyecciones de atencion completa con capas GatedDeltaNet (atencion lineal), 256 expertos enrutados por capa y expertos compartidos. Incluye una torre de vision ViT de 27 bloques con dos proyecciones de merger espacial, y un modulo MTP (Multi-Token Prediction) nativo que actua como drafter para decodificacion especulativa. El checkpoint cuantizado conserva en BF16 `embed_tokens`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b`, `mlp.gate`, `mlp.shared_expert_gate`, `visual.patch_embed.proj`, normas y sesgos.

La cuantizacion aplica rotaciones de Hadamard y GPTQ con Cholesky de dos pasadas, junto con busqueda de escala MSE, sobre las proyecciones lineales. A las capas 30 a 39 de expertos enrutados se les asigna W4_g64 (2.560 expertos, 7.680 lineales) y a las capas 0 a 29 W2_g64 (7.680 expertos, 23.040 lineales). Tras la asignacion se realiza un QAT de divergencia KL en FP32 sobre todas las RMSNorm, `q_norm`/`k_norm`, proyecciones escalares de GatedDeltaNet (`in_proj_a`, `in_proj_b`, `A_log`, `dt_bias`) y `mlp.shared_expert_gate`, tomando como profesor los estados finales en BF16. El autor incluye rankings estaticos de expertos calientes (`static_hot_cache_rankings.json`) con tasas de acierto del 43,15% para top-64 y del 69,58% para top-128.

## Capacidades
- Generacion de texto conversacional y razonamiento en dominios de chat, matematicas, ciencia, codigo y uso de herramientas, segun la evaluacion del autor.
- Procesamiento de imagen y texto (pipeline image-text-to-text): VQA, interpretacion de graficos, documentos, OCR y capturas de interfaz (ScreenSpot).
- Capacidades multilingues, evaluadas en el conjunto de holdout general y multilingue del autor.
- Decodificacion especulativa mediante el drafter MTP nativo, conservado en W4_g64.
- Soporte de tool calling y function calling heredado del modelo base (segun los tags y la evaluacion de tool use).
- Capacidades de agente y razonamiento multi-paso, coherentes con el modelo base Qwen3.6.
- Modo thinking: no confirmado en la informacion disponible.

## Casos de uso
- Despliegue local en GPU de consumo: al ocupar 13,15 GiB, el modelo completo cabe en una GPU de 16 GB con unos 2,85 GiB de margen para cache KV y activaciones, lo que permite experimentar con un MoE de 35B en una RTX 4080/4090 o similar.
- Prototipado de asistentes multimodales: la torre de vision conservada en W4 permite procesar imagenes y documentos en local para tareas de VQA, OCR y extraccion de datos de capturas.
- Evaluacion de tecnicas de cuantizacion extrema: util como referencia para investigadores que comparan HGPTQ-RCO frente a W4A16 puro en terminos de perplejidad y divergencia KL.
- Generacion de codigo asistida en entornos con recursos limitados: el modelo mantiene capacidades de codigo y tool calling, adecuado para integrarse en editores o pipelines locales sin GPU de centro de datos.
- Razonamiento matematico y cientifico de nivel medio: la perplejidad en math (KL 0,0775) y science (KL 0,0871) sugiere degradacion acotada, apto para tareas de resolucion de problemas con verificacion humana.
- Servicio de inferencia con vLLM: el formato compressed-tensors y el tag vllm permiten desplegar el modelo con decodificacion especulativa MTP para aumentar el throughput en un unico nodo.
- Cache de expertos calientes: los rankings precalculados permiten implementar politicas de cache en memoria y reducir latencia en despliegues con RAM limitada.

## Benchmarks y rendimiento

| Evaluacion | BF16 base | W4A16-HGPTQ (4,00 bpw) | W2.6A16-HGPTQ-RCO (2,62 bpw) |
|---|---:|---:|---:|
| Tamano safetensors | 66,97 GiB | 18,78 GiB | 13,15 GiB |
| Perplejidad de texto (378 prompts, 840k tokens) | 4,0208 | 3,7522 (-6,68%) | 3,7230 (-7,41%) |
| Divergencia KL ponderada / media por token vs BF16 | 0,0000 | 0,0847 / 0,2103 | 0,2121 / 0,3885 |
| Perplejidad holdout general y multilingue (76 prompts, 20k tokens) | 25,7581 | 24,5254 (-4,79%) | 21,2581 (-17,47%) |
| MTP nativo (drafter especulativo), 11.583 posiciones | 100,0% Top-1 (NLL 2,0268) | 95,80% Top-1 (KL 0,0105) | 95,80% Top-1 (NLL 2,0363) |
| Vision VQA, graficos, documentos y OCR (96 imagenes, 302 tokens) | 1,0000 cos sim, 100,0% Top-1 | 0,9860 cos sim, 99,34% Top-1 | 0,9860 cos sim, 99,34% Top-1 |
| Vision UI / ScreenSpot y OCR matematico (48 imagenes, 135 tokens) | 1,0000 cos sim, 100,0% Top-1 | 0,9899 cos sim, 98,52% Top-1 | 0,9899 cos sim, 98,52% Top-1 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; los datos anteriores son evaluaciones de fidelidad respecto al modelo base realizadas por el autor.

## Requisitos de hardware
- VRAM estimada para inferencia: 13,15 GiB de pesos mas aproximadamente 2,85 GiB de margen para cache KV y activaciones, segun el autor, para un total de 16 GB.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), RTX 3090 (24 GB), A100 40 GB, H100; cualquier GPU con al menos 16 GB de VRAM.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas, incluyendo la generacion RTX 40 y la RTX 3090.
- Opciones de despliegue: vLLM (soporte compressed-tensors y decodificacion especulativa MTP), transformers; llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tamano del checkpoint | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (BF16) | 35B totales, ~3B activos | No disponible | Apache 2.0 | 66,97 GiB | Modelo base sin cuantizar |
| Qwen3.6-35B-A3B-W4A16-HGPTQ | 35B totales, ~3B activos | No disponible | Apache 2.0 | 18,78 GiB | Cuantizacion W4A16 pura del mismo autor |
| Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO | 35B totales, ~3B activos | No disponible | Apache 2.0 | 13,15 GiB | Cuantizacion mixta W2/W4/W8, objeto de esta ficha |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias
- La perplejidad de texto mejora numericamente respecto al BF16, pero la divergencia KL frente al modelo base es mayor que en la variante W4A16 (0,2121 frente a 0,0847 ponderada), lo que indica una mayor desviacion en la distribucion de probabilidades.
- El 75% de los expertos enrutados se cuantiza a 2 bits, lo que puede degradar tareas que dependan de expertos poco frecuentes; el autor mitiga esto con rankings de expertos calientes, pero no elimina el riesgo.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Qwen3.6.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la cuantizacion extrema puede incrementarlo en dominios de baja frecuencia.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Es necesario verificar la compatibilidad de la version de vLLM con el formato compressed-tensors y el drafter MTP para aprovechar la decodificacion especulativa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante W4A16 del mismo autor: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ
