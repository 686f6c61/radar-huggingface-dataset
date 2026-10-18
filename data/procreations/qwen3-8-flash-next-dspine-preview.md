# ProCreations/Qwen3.8-Flash-Next-DSpine-preview

## Resumen
Qwen3.8-Flash-Next DSpine es una cabeza draft experimental de decodificación especulativa publicada por ProCreations, apoyada en el modelo objetivo RedHatAI/Qwen3.8-Flash-Next-NVFP4. No es un modelo de lenguaje autónomo: tiene 941.399.552 parámetros en seis capas densas y propone bloques de tokens que el target verifica. Su interés está en la investigación y el warm-start de drafts paralelos, no en el servicio directo.

El checkpoint se detuvo en el paso 9.145 con el objetivo de velocidad incumplido. La model card estima 0,6-0,7x el throughput del MTP nativo, a partir de aceptación offline y componentes de serving medidos, no de un benchmark end-to-end emparejado. La evaluación de aceptación usa 64 prompts por temperatura, 64 tokens nuevos y nueve dominios.

Emplea contexto 4096, bloque 16, 16 candidatos, rango de transferencia 1024 y features de cuatro flujos residuales de las capas [1,12,23,34,45]. Licencia qwen-community-1.0 e idiomas en/zh. Su uso exige el target, el tokenizer, la plantilla de chat y features alineadas.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza draft DSpine para decodificación especulativa; transformer denso de 6 capas, hidden 2560, FFN 10240, 32 cabezas Q / 8 KV de 128, bloque 16; no es un LM autónomo |
| Parámetros totales | 941.399.552 (draft; según safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en el draft; ventana del target no disponible |
| Tipos de cuantización | Política de propuesta row-INT8 (189.090 tokens); codebook BF16; evaluación CPU FP32; no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors; carga con loader DSpine personalizado, no AutoModelForCausalLM |
| Modelo base | RedHatAI/Qwen3.8-Flash-Next-NVFP4, revisión c8f2fb1b9869f686b214782036123b10ff96d14a |
| Tamaño del repo | 3,3 GB |

## Arquitectura y entrenamiento
El checkpoint es una cabeza draft, no un modelo generativo completo. Consta de seis capas densas con hidden size 2560, FFN 10240, 32 cabezas de consulta y 8 de KV de dimensión 128, bloque 16, ventana 4096, rango de transferencia 1024, dimensión de mensaje 512 y 16 candidatos. Las features concatenan medias FP32 de cuatro flujos residuales después de las capas [1,12,23,34,45] del target, antes de la cuantización de almacenamiento; todo el contexto precede al ancla conocida. El atajo context-fusion está desactivado y no probado en este checkpoint.

El estado retenido son 77 tensores entrenables más el codebook congelado `selected_prefix_bridge.codebook` (248320×1024 BF16); no incluye embedding, LM head, optimizador, RNG ni gradientes. `config.json`, `proposal_policy.json` e `inference.json` son necesarios juntos: el segundo contiene el mapa global de token-ID, la reconstrucción row-INT8 y la política de pérdida restringida. La base PCA no es necesaria para cargar inferencia; el codebook de transferencia está embebido en los pesos. El tokenizer y la plantilla de chat deben venir del snapshot exacto del target. La carga se hace con `dspine-trainer` mediante `DSpineDraft.from_pretrained` y `load_target_weights`; no es un checkpoint `AutoModelForCausalLM`.

Las continuaciones se generaron on-policy sobre el target a T=1/top-k=20/top-p=0,95 con ajustes de razonamiento por prompt. El corpus retenido tiene 100.318 registros y 228.480.448 tokens de respuesta; es tamaño de corpus, no tokens únicos consumidos por el run detenido. El entrenamiento se paró en el paso 9.145 y no completó el plan de 540M tokens de respuesta presentados. Receta final: AdamW, LR 3e-4, betas (0,9, 0,999), sin weight decay, clip global 1, warmup al 4% del progreso de tokens y cosine, compute BF16. La evaluación de release se hizo en CPU FP32 con la política row-INT8 de 189.090 tokens; el head congelado reconstruye el head W8 efectivo del target. El MTP privado usa otro procesador secuencial, por lo que no son medidas de aceptación emparejadas.

## Capacidades
- Propuesta especulativa de tokens: genera bloques de 16 tokens con 16 candidatos para que el target los verifique; no produce texto final por sí misma.
- Rejection sampling exacto: el diseño exige conservar las probabilidades condicionales de propuesta y
