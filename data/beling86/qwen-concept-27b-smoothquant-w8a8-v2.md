# Beling86/Qwen-Concept-27B-SmoothQuant-W8A8-v2

## Resumen

Qwen-Concept-27B-SmoothQuant-W8A8-v2 es una cuantizacion INT8 de tipo W8A8 (pesos y activaciones en 8 bits) del modelo Qwen-Concept-27B, desarrollado originalmente por inclusionAI. La publica el usuario Beling86 en Hugging Face bajo licencia Apache 2.0. El objetivo es reducir el coste de memoria y aumentar el throughput en inferencia sin degradar de forma apreciable la calidad del modelo original en BF16.

El modelo base emplea una arquitectura hibrida de atencion lineal y atencion completa, con una cabeza de prediccion multi-token (MTP) para decodificacion especulativa. El checkpoint cuantizado conserva esa cabeza en un fichero separado (`model-mtp.safetensors`) y distribuye la cuantizacion de forma selectiva entre 400 capas lineales: 288 capas en W8A8 y 112 en W8A16, dejando en BF16 las capas mas sensibles (embeddings, `lm_head`, capas visuales y normalizaciones).

La relevancia de esta version radica en su fidelidad respecto al modelo BF16: segun la model card, alcanza un 97,10 % de acuerdo top-1 en el siguiente token y una divergencia KL media de 0,00726, con una perplejidad practicamente identica (26,6351 frente a 26,6141). Esta pensada para desplegarse en vLLM y SGLang sobre GPUs Ampere, Ada Lovelace y Hopper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal + atencion completa) con cabeza de prediccion multi-token (MTP) |
| Parametros totales | 21.489.245.920 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el comando de vLLM recomendado usa `--max-model-len 32768` |
| Tipos de cuantizacion | W8A8 INT8 (288 capas) y W8A16 INT8/BF16 (112 capas); embeddings, `lm_head`, capas visuales y normalizaciones en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato `compressed-tensors` (compatible con vLLM y SGLang) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que combina capas de atencion lineal con capas de atencion completa, e incorpora una cabeza de prediccion multi-token (MTP) para acelerar la decodificacion especulativa. La cuantizacion se aplica sobre 400 capas lineales: las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`), las proyecciones MLP `gate_proj` y `up_proj`, y las proyecciones `linear_attn.in_proj_qkv` e `in_proj_z` se cuantizan en W8A8 con kernel `CutlassInt8ScaledMM`. Las capas `mlp.down_proj` y `linear_attn.out_proj` se mantienen en W8A16 con activaciones en BF16, ya que segun el autor concentran picos dinamicos de activacion en los primeros tokens y su cuantizacion eliminaria el 46 % del error total de la red.

El pipeline de cuantizacion combina SmoothQuant y GPTQ secuencial con conciencia de activaciones. Primero se calculan los maximos de activacion por canal sobre 12 ventanas de calibracion (6144 tokens) que cubren dialogo multi-turno, generacion de codigo y prosa tecnica, y se resuelve el exponente de migracion optimo por capa mediante un objetivo MSE. Las escalas se pliegan en las LayerNorm, RMSNorm y proyecciones GDN previas sin alterar la equivalencia matematica del forward. Despues se aplica GPTQ secuencial con 256 secuencias de calibracion de 2048 tokens cada una (524.288 tokens en total), instalando pre-hooks dinamicos de activacion INT8 para que cada capa se adapte a las entradas cuantizadas de la capa anterior. Finalmente, la cabeza MTP se separa en `model-mtp.safetensors` con mapas de indices sincronizados.

## Capacidades

- Generacion de texto conversacional y de prosa tecnica, entrenado y calibrado sobre dialogos multi-turno, codigo y texto tecnico.
- Razonamiento y generacion de codigo, segun la composicion del conjunto de calibracion descrito.
- Decodificacion especulativa mediante la cabeza MTP incluida en `model-mtp.safetensors`.
- Capacidades visuales potenciales: el checkpoint conserva modulos `visual.*` en BF16, aunque la model card no detalla su funcionamiento.
- Inferencia de alto rendimiento en vLLM (version 0.28 o superior) y SGLang.
- Compatibilidad con GPUs Ampere, Ada Lovelace y Hopper.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento extendido (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue conversacional de alto throughput: el modelo puede servir chat multi-turno en vLLM con `--max-model-len 32768`, aprovechando la cuantizacion W8A8 para reducir el coste por token en GPUs Ampere y Ada.
- Generacion de codigo en produccion: la calibracion incluye generacion de codigo y el checkpoint mantiene una perplejidad practicamente identica al BF16, lo que permite integrarlo en pipelines de asistencia a programadores sin reentrenamiento.
- Servicio de inferencia con decodificacion especulativa: activando `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'` se reduce la latencia de generacion en despliegues con SLO estrictos.
- Sustitucion de un modelo BF16 en infraestructura limitada: al ocupar aproximadamente la mitad que el checkpoint original, permite ejecutar el modelo en GPUs con menos VRAM manteniendo el 97,10 % de acuerdo top-1.
- Procesamiento de documentos tecnicos largos: con ventanas de hasta 32.768 tokens en la configuracion recomendada, sirve para resumir o extraer informacion de informes y manuales.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye metricas de KLD, acuerdo top-1 y perplejidad frente a BF16, FP8 y RTN, lo que lo convierte en una referencia para estudiar el impacto de SmoothQuant + GPTQ.
- Backend de agentes con tool calling: no disponible en la informacion proporcionada; la model card no confirma soporte de function calling.

## Benchmarks y rendimiento

Resultados de fidelidad publicados en la model card (evaluacion con KLD sobre vocabulario completo y acuerdo top-1 frente a BF16, 12.264 posiciones, vocabulario de 248.320 tokens):

| Checkpoint | Precision | Acuerdo top-1 | KLD media | KLD mediana | KLD P99 | Perplejidad |
|---|---|---|---|---|---|---|
| Qwen-Concept-27B (v2 SmoothQuant+GPTQ) | W8A8 / W8A16 | 97,10 % | 0,00726 | 0,00422 | 0,0421 | 26,635 → 26,614 |
| Qwen-Concept-27B (v1 SmoothQuant baseline) | W8A8 / W8A16 | 90,99 % | 0,04503 | 0,02645 | 0,2667 | 26,635 → 27,097 |
| Freaksterz Qwen3.8-27B SmoothQuant v3 | W8A8 / W8A16 | 96,90 % | 0,00556 | 0,00371 | 0,0385 | +0,003 Δln |
| Qwen3.8-27B FP8 oficial (Block-128) | FP8 E4M3 | 96,90 % | 0,00584 | 0,00397 | 0,0410 | no disponible |
| RTN W8A8 tipico (redondeo ingenuo) | W8A8 | ~84,0 % | ~0,1250 | ~0,0850 | ~0,6500 | +0,150 Δln |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 29,9 GB, por lo que se necesita al menos esa cantidad mas el espacio de cache KV; con `--gpu-memory-utilization 0.92` encaja en GPUs de 40 GB o mas.
- GPUs recomendadas: A100 (Ampere), L40S y RTX 6000 Ada (Ada Lovelace), H100 y H200 (Hopper).
- GPUs de consumo: el autor cita RTX 3090 y RTX 4090 como soportadas por los kernels; en una RTX 4090 de 24 GB el checkpoint completo no cabe sin offloading o cuantizacion adicional.
- Opciones de despliegue: vLLM (version 0.28 o superior) y SGLang, ambos con soporte nativo del formato `compressed-tensors`.
- Decodificacion especulativa: soportada mediante la cabeza MTP en vLLM con `--speculative-config`.
- Latencia y throughput estimados: el autor afirma que el kernel `CutlassInt8ScaledMM` es 1,4 veces mas rapido que W8A16 en prefill y throughput con batching; no se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Precision | Parametros | Contexto | Acuerdo top-1 vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Concept-27B-SmoothQuant-W8A8-v2 (este) | W8A8 / W8A16 | 21,49 B | no disponible (32.768 en config vLLM) | 97,10 % | Apache 2.0 | Hugging Face, vLLM, SGLang |
| Qwen-Concept-27B (v1 SmoothQuant baseline) | W8A8 / W8A16 | no disponible | no disponible | 90,99 % | no disponible | Hugging Face |
| Freaksterz Qwen3.8-27B SmoothQuant v3 | W8A8 / W8A16 | no disponible | no disponible | 96,90 % | no disponible | Hugging Face |
| Qwen3.8-27B FP8 oficial (Block-128) | FP8 E4M3 | no disponible | no disponible | 96,90 % | no disponible | Hugging Face |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al ser una cuantizacion, hereda los del Qwen-Concept-27B original.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la perplejidad se mantiene estable, pero no se han evaluado tareas de factualidad.
- Idiomas soportados: no especificados; la calibracion se realizo sobre dialogos, codigo y prosa tecnica sin detallar el reparto linguistico.
- Longitud de contexto nativa: no confirmada; el valor de 32.768 tokens corresponde al comando de lanzamiento recomendado, no a una especificacion oficial del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base inclusionAI/Qwen-Concept-27B antes de desplegarlo en produccion.
- Requiere vLLM 0.28 o superior o SGLang; otros runners (llama.cpp, Ollama, TGI) no estan confirmados para este formato `compressed-tensors`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de las metricas publicadas por el autor.
- La cabeza MTP debe cargarse desde `model-mtp.safetensors`; si se omite, se pierde la aceleracion por decodificacion especulativa.

## Enlaces

- Hugging Face: https://huggingface.co/Beling86/Qwen-Concept-27B-SmoothQuant-W8A8-v2
- Modelo base: https://huggingface.co/inclusionAI/Qwen-Concept-27B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
