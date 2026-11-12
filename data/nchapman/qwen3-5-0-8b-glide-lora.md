# nchapman/Qwen3.5-0.8B-GLiDE-LoRA

## Resumen

Qwen3.5-0.8B-GLiDE-LoRA es un adaptador PEFT de tipo LoRA (rango 128) publicado por el usuario nchapman sobre el modelo base Qwen/Qwen3.5-0.8B, extraido del modelo fastino/GLiDE-0.8B mediante una tecnica de destilacion de pesos denominada Activation-Weighted Joint SVD (Joint-ASVD). El adaptador se complementa con un sidecar de decision (`CodeReadout`) que permite servir, desde una unica instancia del modelo base, tanto generacion causal de texto y chat como rutas de decision de alta precision (`/v1/systemone` y `/v1/decisions`) en el motor de inferencia warp-34.

El modelo resuelve el problema de consolidar en un solo motor cargado dos modos de operacion habitualmente separados: conversacion general (con `lora_id = -1`) y clasificacion/decision estructurada de 255 clases con atencion no causal completa por peticion (`noncausal_full_attention`, perfil `quick-empty-think-medium-v1`). Es relevante porque demuestra que un adaptador de bajo rango puede transferir una cabeza de decision especializada desde un modelo ya entrenado hacia un modelo base estandar, manteniendo intactos los pesos de normalizacion del modelo base.

El adaptador tiene un tamano de 158,3 MB en BF16, se distribuye bajo licencia Apache 2.0, esta etiquetado unicamente para ingles y esta pensado para el ecosistema warp-34. El repositorio completo ocupa 0,2 GB e incluye tanto los pesos LoRA como los ficheros de configuracion y la cabeza de lectura (`readout.safetensors`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-0.8B; incluye cabeza `CodeReadout` de 255 clases |
| Parametros totales | no disponible (adaptador de 158,3 MB en BF16; el modelo base Qwen3.5-0.8B no detalla parametros en la informacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 para el adaptador; el modelo base asociado incluye una variante W4A16-HGPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `readout.safetensors`) + JSON de configuracion |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 que ataca todas las proyecciones lineales del decodificador del modelo base: `self_attn.{q,k,v,o}_proj`, `linear_attn.{in_proj_qkv,in_proj_z,in_proj_b,in_proj_a,out_proj}` y `mlp.{gate,up,down}_proj`. La innovacion principal es el layout de proyecciones fusionadas con `A` compartida: dentro de cada capa, los grupos `(q_proj, k_proj, v_proj)`, `(in_proj_qkv, in_proj_z)`, `(in_proj_b, in_proj_a)` y `(gate_proj, up_proj)` comparten tensores `lora_A.weight` bit a bit identicos, derivados de una factorizacion SVD conjunta. Esto permite que motores con proyecciones fusionadas como warp-34 ejecuten un unico shrink de rango 128 por GEMM fusionada en lugar de `2r` o `3r`.

Los pesos de normalizacion del modelo base (`input_layernorm` y `post_attention_layernorm`) permanecen congelados: las ratios de escala `(1 + g_glide) / (1 + g_base)` se pliegan directamente en las columnas de `lora_A` aguas abajo, de modo que los pesos RMSNorm del modelo base no se modifican en tiempo de ejecucion. El metodo de extraccion es Joint-ASVD con plegado exacto de ratios de columna para GemmaRMSNorm. La informacion disponible no detalla volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto causal y chat/completion general con `lora_id = -1`.
- Clasificacion/decision estructurada de 255 clases mediante la cabeza `CodeReadout`.
- Ruta `/v1/systemone` para decisiones de alta precision con `noncausal_full_attention`.
- Ruta `/v1/decisions` con perfil de atencion `quick-empty-think-medium-v1`.
- Convivencia de ambos modos (chat causal y decision no causal) en una sola instancia cargada del motor warp-34.
- Soporte de proyecciones fusionadas con `A` compartida para reducir coste de shrink en GEMM fusionadas.
- Idioma: unicamente ingles segun los metadatos del modelo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Clasificacion de decisiones en pipelines de enrutamiento: el adaptador expone una cabeza de 255 clases (`CodeReadout`) que puede usarse para etiquetar peticiones o estados en un sistema de decision, sirviendo la ruta `/v1/decisions` desde el mismo motor que atiende el chat.
- Asistentes conversacionales ligeros en ingles: con `lora_id = -1` el adaptador se comporta como un LoRA de chat sobre Qwen3.5-0.8B, adecuado para despliegues de baja latencia donde el modelo base de 0,8B ya cabe en hardware modesto.
- Servicio dual chat/decision en una sola GPU: al cargar un unico motor warp-34 con el modelo base y el adaptador, se evitan dos despliegues separados para generacion y clasificacion, reduciendo huella de memoria y complejidad operativa.
- Evaluacion de sistemas de decision con atencion no causal: la ruta `/v1/systemone` con `noncausal_full_attention` permite procesar la peticion completa antes de emitir la decision, util en tareas donde la coherencia global del contexto importa mas que la generacion token a token.
- Integracion en motores con proyecciones fusionadas: el layout de `A` compartida esta pensado para que warp-34 ejecute un solo shrink por GEMM fusionada, lo que resulta util en pipelines de inferencia optimizados que ya fusionan q/k/v o gate/up.
- Investigacion sobre destilacion de adaptadores: el metodo Joint-ASVD con plegado de ratios RMSNorm sirve como referencia reproducible para transferir cabezas especializadas de un modelo a otro sin reentrenar el base.
- Despliegue sobre la variante cuantizada W4A16-HGPTQ: el adaptador declara compatibilidad con `nchapman/Qwen3.5-0.8B-W4A16-HGPTQ`, lo que permite servir el modelo base en 4 bits de pesos y 16 bits de activaciones junto al LoRA en BF16.

## Benchmarks y rendimiento

Evaluacion publica en JevBench (`kshitijthakkar/nirnaya-jevbench-public-eval-v1`), 231 casos: 48 Easy, 72 Original y 111 Hard.

| Configuracion | Overall | Easy (48) | Original (72) | Hard (111) | Mean NLL | Mean Brier |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `Qwen/Qwen3.5-0.8B` + `Qwen3.5-0.8B-GLiDE-LoRA` (`CodeReadout` + `noncausal_full_attention`) | 187/231 (80,95 %) | 48/48 | 70/72 | 69/111 | 0,4129 | 0,2382 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni cifras de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador pesa 158,3 MB en BF16 y debe sumarse a la huella del modelo base Qwen3.5-0.8B (o de su variante W4A16-HGPTQ).
- GPU recomendadas: no disponible en la informacion.
- Compatibilidad con GPU de consumo: no disponible en la informacion; por el tamano del modelo base (0,8B) es plausible en GPUs de consumo, pero no se documenta.
- Opciones de despliegue: el adaptador esta disenado para el motor warp-34; no se documenta soporte explicito en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-GLiDE-LoRA (este) | adaptador LoRA r=128 sobre 0,8B | no disponible | 80,95 % en JevBench (187/231) | apache-2.0 | Hugging Face |
| fastino/GLiDE-0.8B (origen) | 0,8B | no disponible | no disponible en la informacion | no disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | no disponible en la informacion | no disponible | Hugging Face |
| nchapman/Qwen3.5-0.8B-W4A16-HGPTQ | 0,8B cuantizado W4A16 | no disponible | no disponible en la informacion | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en otros idiomas no esta documentado.
- El adaptador depende del motor warp-34 para explotar sus rutas `/v1/systemone` y `/v1/decisions` y el layout de `A` compartida; en otros motores puede no aprovecharse la optimizacion de proyecciones fusionadas.
- La cabeza de decision es de 255 clases fijas; no es extensible sin reentrenamiento.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez fuera de JevBench.
- Los resultados de JevBench provienen de una unica evaluacion publica de 231 casos; la significacion estadistica en subconjuntos pequenos (48 casos Easy) es limitada.
- El modelo base Qwen3.5-0.8B es de 0,8B parametros, por lo que su capacidad de razonamiento y conocimiento factual es acotada en comparacion con modelos de mayor tamano.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.5-0.8B y del modelo de origen fastino/GLiDE-0.8B antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/nchapman/Qwen3.5-0.8B-GLiDE-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante cuantizada asociada: https://huggingface.co/nchapman/Qwen3.5-0.8B-W4A16-HGPTQ
- Modelo de origen: https://huggingface.co/fastino/GLiDE-0.8B
- Dataset de evaluacion JevBench: https://huggingface.co/datasets/kshitijthakkar/nirnaya-jevbench-public-eval-v1
