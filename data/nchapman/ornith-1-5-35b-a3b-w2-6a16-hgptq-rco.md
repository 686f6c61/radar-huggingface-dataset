# nchapman/Ornith-1.5-35B-A3B-W2.6A16-HGPTQ-RCO

## Resumen

Ornith-1.5-35B-A3B-W2.6A16-HGPTQ-RCO es una cuantizacion mixta de 2 y 4 bits del modelo multimodal ornith-ai/Ornith-1.5-35B-A3B, un transformer MoE con 256 expertos enrutados por capa, torre de vision y cabezal MTP (multi-token prediction) nativo para decodificacion especulativa. La ha producido nchapman aplicando una receta propia denominada HGPTQ-RCO (Hadamard + GPTQ con optimizacion restringida riemanniana), que combina rotaciones Hadamard, GPTQ por grupos de 64 y un ajuste fino por divergencia KL en FP32 sobre normas y compuertas.

El problema que resuelve es de despliegue: el modelo base en BF16 ocupa 66,97 GiB y no cabe en GPUs de consumo. Esta version comprime los pesos a 13,15 GiB (5,09x menos que BF16 y 5,63 GiB menos que la variante W4A16 pura), de modo que el modelo completo, la torre de vision y el drafter MTP caben en una sola GPU de 16 GB, dejando unos 2,85 GiB para cache KV y decodificacion especulativa.

Es relevante porque demuestra que un MoE multimodal de 35B parametros totales puede ejecutarse en hardware asequible con una perdida de fidelidad medida y acotada frente a BF16 (KL ponderada de 0,2682 en texto y 95,36 % de coincidencia top-1 en vision aislada). La licencia Apache 2.0 y el formato compressed-tensors con soporte para vLLM facilitan su integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (GatedDeltaNet + atencion completa), 40 capas, 256 expertos enrutados por capa, con torre de vision (ViT de 27 bloques) y cabezal MTP nativo |
| Parametros totales | 24.389.175.152 (segun safetensors); el autor del modelo base lo denomina 35B-A3B |
| Parametros activos | 3B (denominacion A3B del modelo base); no se detalla el desglose exacto en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W2.6A16 mixta: W2_g64 y W4_g64 en expertos enrutados, W4_g64 en backbone y vision, W8_g64 en lm_head y mtp.fc; activaciones en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (GPTQ), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un MoE con 40 capas que alterna proyecciones GatedDeltaNet y atencion completa, con 256 expertos enrutados por capa y expertos compartidos (shared experts). Incluye una torre de vision de 27 bloques ViT con dos proyecciones de merger espacial y un cabezal MTP nativo que actua como drafter para decodificacion especulativa. El vocabulario de salida es de 248.320 entradas y la dimension oculta es 2.048.

La cuantizacion aplica una receta diferenciada por sensibilidad: mantiene el 100 % de atencion y GDN (130 lineales), expertos compartidos (120 lineales), MTP nativo (775 lineales) y vision (110 lineales) en W4_g64; lm_head y mtp.fc en W8_g64; y reparte los expertos enrutados asignando las 10 capas mas sensibles (capas 30 a 39, 2.560 expertos) a W4_g64 y las 30 restantes (capas 0 a 29, 7.680 expertos) a W2_g64. Sobre esa asignacion se aplica un QAT por divergencia KL con maestro FP32 sobre todas las RMSNorm, q_norm/k_norm, proyecciones escalares de GatedDeltaNet y la compuerta de expertos compartidos, tomando como referencia los estados de norma final del profesor BF16. Se conservan en BF16 embed_tokens, in_proj_a, in_proj_b, mlp.gate, shared_expert_gate, patch_embed y todas las normas y sesgos. El repositorio incluye rankings estaticos de expertos calientes (static_hot_cache_rankings.json) para fijar en VRAM los expertos mas usados desde el primer token.

## Capacidades

- Generacion de texto conversacional en formato chat, con soporte de plantilla de conversacion.
- Razonamiento y matematicas: el conjunto de evaluacion del autor incluye prompts de matematicas, ciencia y codigo.
- Generacion de codigo y uso de herramientas: la evaluacion cubre tool use explicitamente.
- Capacidades multilingues: la perplexidad de evaluacion incluye prompts multilingues, aunque no se detalla la lista de idiomas.
- Vision: entrada image-text-to-text con torre ViT para VQA, graficos, documentos, OCR, capturas de interfaz y OCR matematico.
- Decodificacion especulativa nativa mediante el cabezal MTP, con 91,44 % de coincidencia top-1 aislada frente a BF16.
- Perfilado de enrutamiento de expertos para cache en caliente en motores de inferencia.

## Casos de uso

- Asistente multimodal en una sola GPU de 16 GB: el checkpoint completo (13,15 GiB) mas vision y MTP cabe en tarjetas como RTX 4060 Ti 16 GB o RTX 4080, permitiendo desplegar un asistente que procesa imagenes y texto en un unico nodo de consumo.
- OCR y extraccion de datos de documentos: la torre de vision conserva el 95,36 % de coincidencia top-1 aislada en VQA, graficos, documentos y OCR, adecuado para pipelines de digitalizacion de facturas o formularios.
- Automatizacion de interfaces (screen understanding): con un 97,78 % de coincidencia top-1 en ScreenSpot, el modelo puede interpretar capturas de pantalla y localizar elementos de UI para agentes de automatizacion.
- Agentes con tool calling: la evaluacion del autor incluye tool use, y el formato compressed-tensors con soporte vLLM permite integrarlo en orquestadores de agentes con llamadas a funciones.
- Servicio de chat con decodificacion especulativa: el drafter MTP integrado acelera la generacion sin un modelo especulador externo, util en endpoints de conversacion de baja latencia sobre 16 GB de VRAM.
- Procesamiento de documentos cientificos y matematicos: el OCR matematico (97,78 % top-1 en el conjunto UI/Matematica) permite extraer formulas y graficos de papers para bases de conocimiento.
- Despliegue en el borde o en estaciones de trabajo: al reducir 5,09x el tamano BF16, se puede ejecutar en equipos sin GPUs de datacenter, con el perfil de expertos calientes precargado para estabilizar la latencia.

## Benchmarks y rendimiento

Evaluacion con teacher forcing frente al modelo base BF16 y la variante W4A16 del mismo autor:

| Evaluacion | BF16 base | W4A16-HGPTQ (4,00 bpw) | W2.6A16-HGPTQ-RCO (2,62 bpw) |
|---|---:|---:|---:|
| Tamano safetensors | 66,97 GiB | 18,78 GiB | 13,15 GiB |
| Perplexidad de texto (378 prompts, 842k tokens) | 10,8033 | 10,2627 (-5,00 %) | 10,3577 (-4,12 %) |
| Divergencia KL ponderada / media por token | 0,0000 | 0,1139 / 0,2590 | 0,2682 / 0,4338 |
| Perplexidad holdout general y multilingue (76 prompts, 20k tokens) | 249,8651 | 257,9844 (+3,25 %) | 239,2615 (-4,24 %) |
| MTP nativo, top-1 aislado (11.583 posiciones) | 100,0 % (NLL 4,4308) | 91,44 % (KL 0,0215) | 91,44 % (NLL 4,4458) |
| Vision VQA/OCR, top-1 aislado (96 imagenes) | 100,0 % | 96,36 % | 95,36 % |
| Vision UI/Matematica, top-1 aislado (48 imagenes) | 100,0 % | 97,04 % | 97,78 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: 13,15 GiB de pesos; en una GPU de 16 GB quedan unos 2,85 GiB para cache KV y decodificacion especulativa.
- GPU recomendadas: RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, A100 y H100; en GPUs de 24 GB se sugiere la variante W4A16 (18,78 GiB) para mayor fidelidad.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 16 GB o mas de VRAM.
- Opciones de despliegue: vLLM (soporte explicito en los tags), transformers con compressed-tensors; no se mencionan llama.cpp ni Ollama.
- Latencia y throughput: no disponibles; el autor solo reporta que el MTP nativo actua como drafter especulativo y que los rankings de expertos calientes permiten fijarlos en VRAM desde el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Notas |
|---|---|---:|---|---|---|
| W2.6A16-HGPTQ-RCO (este) | 24,39B (35B-A3B nominal) | no disponible | 13,15 GiB | Apache 2.0 | 2,62 bpw, cabe en 16 GB |
| Ornith-1.5-35B-A3B-W4A16-HGPTQ | 24,39B (35B-A3B nominal) | no disponible | 18,78 GiB | Apache 2.0 | 4,00 bpw, mejor fidelidad, requiere 24 GB |
| Ornith-1.5-35B-A3B (BF16) | 24,39B (35B-A3B nominal) | no disponible | 66,97 GiB | Apache 2.0 | Referencia sin cuantizar, requiere multiples GPUs |

No se dispone de datos sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce divergencia respecto a BF16: KL media por token de 0,4338 en texto y 0,4744 en el holdout general y multilingue.
- La coincidencia top-1 del MTP baja al 63,88 % en modo end-to-end, lo que puede reducir la tasa de aceptacion de la decodificacion especulativa y, con ello, la ganancia de velocidad.
- La vision end-to-end cae al 92,38 % (VQA/OCR) y al 86,67 % (UI/Matematica) de coincidencia top-1, inferior al rendimiento aislado.
- Las capas 0 a 29 usan W2_g64 en expertos enrutados, lo que concentra el riesgo de degradacion en tareas que activen preferentemente esas capas; no se han publicado evaluaciones por tarea especifica.
- No se detallan sesgos conocidos, idiomas soportados ni longitud de contexto en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de factualidad en esta informacion.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- El checkpoint depende de codigo personalizado (custom_code) y de compressed-tensors; la compatibilidad con motores distintos de vLLM y transformers no esta documentada.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/nchapman/Ornith-1.5-35B-A3B-W2.6A16-HGPTQ-RCO
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante W4A16 del mismo autor: https://huggingface.co/nchapman/Ornith-1.5-35B-A3B-W4A16-HGPTQ
