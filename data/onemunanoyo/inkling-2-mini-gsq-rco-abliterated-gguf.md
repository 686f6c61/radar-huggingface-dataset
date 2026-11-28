# onemunanoyo/Inkling-2-Mini-GSQ-RCO-Abliterated-GGUF

## Resumen

Inkling-2-Mini GSQ-RCO Abliterated (GGUF) es una redistribucion cuantizada del modelo base Inkling-2-Mini de Thinking Machines, un MoE disperso de 26.070.385.152 parametros (26,4B) con 128 expertos, 8 expertos activos por token y 12 capas intermedias repetidas tres veces. Sobre la base ya cuantizada por ISTA-DASLab con su asignacion mixta de precision GSQ-RCO, el autor onemunanoyo transfiere los deltas de abliteracion (eliminacion de rechazos) del modelo Inkling-2-Mini-Abliterated-Aggressive-GGUF, manteniendo intactos los bytes de escala de cuantizacion y los tensores no editados.

El resultado es una version sin censura, auditables byte a byte, distribuida en dos cuantizaciones (IQ3_S de 11,43 GB y IQ3_XXS de 10,61 GB) que respetan exactamente el layout y el conteo de bytes de los GGUF originales de ISTA. La propuesta resuelve el problema de disponer de un modelo abliterado sin degradar la asignacion de precision que RCO (rate-constrained optimization) habia calculado para los tensores sensibles.

Es relevante para investigadores en alineacion, red-teaming y evaluacion de robustez que necesitan reproducir experimentos sobre una base cuantizada de bajo bit sin re-cuantizar ni introducir sesgos adicionales. La licencia Apache 2.0 y el soporte en llama.cpp desde b12611 facilitan su integracion en entornos de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso con capas repetidas (looped sparse MoE), transformer; 128 expertos, 8 activos por token, 12 capas intermedias repetidas 3 veces |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | No disponible (8 expertos activos por token de 128) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de llama-server usa -c 12288, pero no se confirma como contexto nativo) |
| Tipos de cuantizacion | IQ3_S (3,50 bpw, 11,43 GB) e IQ3_XXS (3,25 bpw, 10,61 GB); tensores editados en IQ4_NL, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un MoE disperso de 26,4B parametros con 128 expertos y 8 expertos activos por token. Su rasgo distintivo es el bucle de capas: las 12 capas intermedias se ejecutan tres veces, lo que aumenta la profundidad efectiva sin incrementar el numero de parametros. La cuantizacion GSQ-RCO de ISTA-DASLab aplica una asignacion no uniforme de precision guiada por sensibilidad (paper GSQ, arXiv:2604.18556) y una optimizacion con restriccion de tasa (paper RCO, arXiv:2605.00649), que asigna mas bits a los tensores criticos.

El proceso de abliteracion parte de los deltas calculados como diferencia entre Aggressive UD-Q8_K_XL y Base UD-Q8_K_XL del modelo Inkling-2-Mini-Abliterated-Aggressive-GGUF, resueltos sobre las rejillas de cuantizacion congeladas mediante optimizacion de escala fija. Solo se modifican 55 tensores (blk.6..23 attn_gate.weight, attn_output.weight, ffn_down_exps.weight y output.weight). No hay LoRA, SFT ni re-cuantizacion: los bytes de escala (d, dmin, scales, scales_h, scales_l) permanecen identicos a los del upstream, y los tensores de baja precision extrema (IQ1_S, IQ2_*, Q2_0, IQ3_* en ffn_gate_up_exps) no se tocan. Los indicadores reportados son weighted_realized_ratio 1,00476 (IQ3_S) y 1,00464 (IQ3_XXS), mean_gain 0,90576 y 0,86993, y weighted_orth_over_real 1,1071 y 1,1082 respectivamente.

## Capacidades

- Generacion de texto conversacional en ingles y japones.
- Razonamiento multi-paso gracias a la arquitectura MoE con capas repetidas.
- Soporte de proyector de vision opcional (mmproj-Inkling-2-Mini-BF16.gguf disponible en el repo de ISTA-DASLab).
- Compatibilidad con endpoints (tag endpoints_compatible) y con llama-server.
- Modo sin censura (abliterated/uncensored) orientado a investigacion y red-teaming.
- Soporte de modelos draft para decodificacion especulativa (disponibles en el repo de ISTA-DASLab).
- Soporte de capas MoE offload a CPU o RAM del sistema mediante -ncmoe o --cpu-moe en llama.cpp.

## Casos de uso

- Investigacion en alineacion y red-teaming: el modelo permite estudiar el comportamiento de un MoE de 26,4B sin los rechazos aprendidos, manteniendo la asignacion de precision original para aislar el efecto de la abliteracion.
- Evaluacion de robustez de salvaguardas: util para medir hasta que punto las defensas de un modelo cuantizado en bajo bit resisten ediciones de pesos dirigidas, comparando IQ3_S frente a IQ3_XXS.
- Despliegue en hardware de gama alta consumer: con 11,43 GB en IQ3_S y 10,61 GB en IQ3_XXS, cabe en GPUs de 12-16 GB de VRAM usando offload parcial de capas MoE a RAM.
- Generacion de texto en japones e ingles: el modelo cubre ambas lenguas, adecuado para prototipos bilingues de asistencia conversacional.
- Reproducibilidad de experimentos: los SHA-256 y el archivo SHA256SUMS.txt permiten verificar la identidad criptografica de los pesos, lo que facilita la replicacion en publicaciones.
- Integracion en pipelines de investigacion con llama.cpp: el soporte desde b12611 (inkling2_loop) permite ejecutar el modelo en servidores locales con cuantizacion de cache KV (q8_0) para reducir memoria.
- Analisis de vision (opcional): con el proyector mmproj del repo de ISTA se puede evaluar el comportamiento multimodal del modelo abliterado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas internas del proceso de abliteracion (weighted_realized_ratio, mean_gain, weighted_orth_over_real) y datos de tamano y bytes modificados, no resultados de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: IQ3_S ocupa 11,43 GB y IQ3_XXS 10,61 GB en disco; en ejecucion hay que sumar la cache KV (el ejemplo usa -ctk q8_0 -ctv q8_0 con -c 12288) y el token_embd.weight en BF16 (~0,93 GB) que llama.cpp mantiene en RAM del sistema.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para ejecucion completa en GPU; con GPUs de 12-16 GB es necesario offload de capas MoE.
- Cabe en consumer GPU: si, en RTX 4090 y en GPUs de 16 GB con -ncmoe o --cpu-moe; en GPUs de 12 GB requiere offload agresivo.
- Opciones de despliegue: llama.cpp b12611 o superior (llama-server); el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El ejemplo de llama-server usa -fa on, -ngl 99, --temp 1.0, --top-p 0.95, --top-k 20 y --min-p 0.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini GSQ-RCO Abliterated (este) | 26,4B (MoE, 8/128 activos) | No disponible | IQ3_S, IQ3_XXS | Apache 2.0 | Abliterado, sin re-cuantizar, byte-auditable |
| ISTA-DASLab/Inkling-2-Mini-GSQ-RCO-GGUF | 26,4B (MoE) | No disponible | IQ3_S, IQ3_XXS y otras | Apache 2.0 | Version original con rechazos, base de este trabajo |
| onemunanoyo/Inkling-2-Mini-Abliterated-Aggressive-GGUF | 26,4B (MoE) | No disponible | UD-Q8_K_XL | Apache 2.0 | Fuente de los deltas de abliteracion, mayor precision |
| thinkingmachines/Inkling-2-Mini | 26,4B (MoE) | No disponible | safetensors (BF16) | No disponible | Modelo base original |

## Limitaciones y advertencias

- Modelo sin censura: elimina los rechazos aprendidos, por lo que puede generar contenido nocivo, ofensivo o ilegal; el autor lo restringe a investigacion, red-teaming y evaluacion de alineacion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; la cuantizacion a 3,25-3,50 bpw puede degradar la calidad respecto al base en BF16.
- Idiomas limitados: solo ingles y japones; no hay soporte declarado de castellano ni de otras lenguas.
- Contexto no confirmado: la informacion no especifica la longitud de contexto nativa; el valor -c 12288 del ejemplo es una configuracion de servidor, no una garantia del modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el caracter abliterated puede incumplir politicas de plataformas o normativa local; el autor exige revisar las leyes aplicables.
- Dependencia de llama.cpp b12611+: versiones anteriores no soportan el bucle de capas inkling2_loop y fallaran al cargar el modelo.
- token_embd en BF16: consume ~0,93 GB adicionales en RAM del sistema, lo que afecta a entornos con memoria limitada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradacion introducida por la abliteracion ni por la cuantizacion IQ3.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/onemunanoyo/Inkling-2-Mini-GSQ-RCO-Abliterated-GGUF
- Modelo base original: https://huggingface.org/thinkingmachines/Inkling-2-Mini
- GGUF GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Inkling-2-Mini-GSQ-RCO-GGUF
- Fuente de los deltas de abliteracion: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Aggressive-GGUF
- GGUF de referencia para los deltas: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Paper RCO: https://arxiv.org/abs/2605.00649
- Codigo RCO: https://github.com/IST-DASLab/RCO
