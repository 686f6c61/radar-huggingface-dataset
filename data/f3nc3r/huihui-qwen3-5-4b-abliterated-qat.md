# f3nc3r/Huihui-Qwen3.5-4B-abliterated-QAT

## Resumen

Huihui-Qwen3.5-4B-abliterated-QAT es un checkpoint de Qwen3.5 de 4B de parametros (4.205.751.296 exactos) publicado por el usuario f3nc3r, que aplica un proceso de Quantization-Aware Training (QAT) y Quantization-Aware Distillation (QAD) sobre el modelo huihui-ai/Huihui-Qwen3.5-4B-abliterated. El objetivo es obtener un modelo cuyos pesos lineales internos sean compatibles con una rejilla ternaria (-1, 0, +1) sin degradar la perplejidad de forma significativa, algo relevante para despliegues con requisitos estrictos de memoria y ancho de banda.

La innovacion principal es el pipeline FraQAT + Hestia, que combina extraccion offline de logits top-64 de un modelo profesor, un puente de traduccion de vocabulario disperso y un entrenamiento ternario diferenciable con Straight-Through Estimator (STE) y annealing de temperatura. El resultado son pesos en contenedor BF16 donde el 76,884% de los parametros lineales internos siguen una rejilla ternaria, con escalas fp32 aprendibles por fila de salida.

El modelo se distribuye bajo licencia Apache 2.0, incluye pesos safetensors y exportaciones GGUF (BF16 y Q3_K_M), y esta pensado para experimentacion con cuantizacion extrema y destilacion. Es relevante ahora porque demuestra que es posible hardening ternario sobre un modelo de 4B con solo 500 pasos de optimizacion en una H200, manteniendo una cross-entropy de 2,0683 frente a 2,6216 del estudiante BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3_5_text`), con modulos de atencion lineal (`linear_attn.out_proj`) y atencion estandar (`self_attn.o_proj`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria QAT interna (rejilla {-1, 0, +1} con escalas fp32 por fila) en el 76,884% de las lineales; exportaciones GGUF BF16 y Q3_K_M |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), GGUF (`Huihui-Qwen3.5-4B-ab_QAT-BF16.gguf`, `Huihui-Qwen3.5-4B-ab_QAT-Q3_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5 de 4B (tag `qwen3_5_text`), un transformer decoder-only con modulos de atencion lineal y atencion estandar. Sobre esa base, el pipeline FraQAT + Hestia sustituye 216 modulos lineales internos por capas `HestiaTernaryLinear`, que representan los pesos en una rejilla ternaria {-1, 0, +1} con escalas fp32 aprendibles por fila de salida. Las capas sensibles (`embed_tokens`, `lm_head`, todas las `*norm*`, `self_attn.o_proj` y `linear_attn.out_proj`) se mantienen en BF16. En total, 3.233.546.240 de los 4.205.751.296 parametros (76,884%) quedan cubiertos por la rejilla ternaria.

El entrenamiento combina QAT y QAD. Primero se extraen offline los indices y log-probabilidades top-64 del profesor ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF mediante un extractor en C sobre la API de llama.cpp, empaquetados en 104 shards safetensors (415 secuencias, 844.023 posiciones de token). Un puente de mapeo disperso de vocabulario (con `exact_match_ratio = 1.00`) alinea los vocabularios del profesor y del estudiante (248.077 filas activas del tokenizer sobre 248.320 filas de embedding con padding). El objetivo conjunto es `L = (1 - alpha) * L_CE + alpha * L_KL` con alpha = 0.7, combinando cross-entropy de siguiente token y divergencia KL troceada contra los cubits top-64 del profesor. Se ejecutan 500 pasos de optimizador AdamW8bit con lr = 2e-5 en una NVIDIA H200: 10% de warmup, 75% de annealing coseno de temperatura (tau de 1,0 a 0,0) y 15% de ajuste fino de escalas ternarias duras con pesos ternarios latentes congelados. Finalmente, las capas `HestiaTernaryLinear` se desenvuelven a `nn.Linear` estandar sin claves de escala filtradas y se verifican con `AutoModelForCausalLM`.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-4B.
- Razonamiento y generacion de codigo: capacidades propias de la familia Qwen3.5, no documentadas de forma especifica en la model card.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Modo thinking, vision o audio: no documentado en la informacion disponible.
- Capacidad especial: pesos ternarios QAT compatibles con despliegue de bajo ancho de banda, con exportaciones GGUF listas para llama.cpp.

## Casos de uso

- Investigacion en cuantizacion extrema: el checkpoint sirve como referencia reproducible de un pipeline QAT/QAD ternario sobre un transformer de 4B, con log de entrenamiento (`train_fraqat_w3.log`) y `quality_report.json` incluidos para auditar el proceso.
- Destilacion de logits top-k: el dataset de cubits top-64 (415 secuencias, 844.023 posiciones) se puede reutilizar para entrenar otros estudiantes o comparar estrategias de destilacion dispersa.
- Despliegue en entornos con memoria limitada: las exportaciones GGUF (BF16 y Q3_K_M) permiten ejecutar el modelo en llama.cpp con requisitos de VRAM reducidos frente a un BF16 completo.
- Experimentacion con llama.cpp: el GGUF Q3_K_M sirve como baseline para medir el impacto de la rejilla ternaria frente a la cuantizacion k-quant clasica.
- Generacion de texto en ingles en prototipos: al conservar las capacidades del modelo base, puede usarse para tareas conversacionales simples en ingles, aunque sin garantias de calidad en produccion.
- Estudio de capas sensibles: la politica de sparing (mantener en BF16 `embed_tokens`, `lm_head`, normas y proyecciones de salida de atencion) es un caso practico para analizar que modulos toleran cuantizacion agresiva.
- Evaluacion de QAD con profesores de mayor tamano: el uso de un profesor Qwen3.8-Flash-Next como fuente de logits permite estudiar la transferencia de conocimiento entre arquitecturas y vocabularios distintos.

## Benchmarks y rendimiento

La model card solo publica metricas de cross-entropy sobre una sonda del shard 0, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Etapa | Cross-entropy (sonda shard 0) |
|---|---|
| Estudiante BF16 original | 2,6216 |
| Envoltura ternaria dura sin entrenar | 18,3398 |
| Post-hardening (500 pasos) | 2,0683 (`quality_status: ok`) |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,4 GB solo para pesos (4,21B parametros a 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada con la exportacion Q3_K_M: aproximadamente 1,6-1,8 GB para pesos, segun el tamano efectivo del GGUF.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA H200; para inferencia BF16 basta una GPU con 16 GB o mas (RTX 4090, A100 40GB, H100).
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB para BF16 (RTX 4090, RTX 3090) y en tarjetas con 8 GB o menos usando el GGUF Q3_K_M.
- Opciones de despliegue: llama.cpp con los GGUF incluidos; para los pesos safetensors, `AutoModelForCausalLM` de transformers (verificado por el autor). vLLM, TGI u Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-4B-abliterated-QAT | 4,21B | no disponible | Ternaria QAT + GGUF BF16/Q3_K_M | apache-2.0 | Hugging Face |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated (base) | 4,21B (aprox.) | no disponible | BF16 estandar | no disponible en la informacion | Hugging Face |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF (profesor) | no disponible | no disponible | GGUF | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles (`language: en`); el rendimiento en otros idiomas no esta garantizado.
- La model card no documenta sesgos conocidos, pero al derivar de un modelo "abliterated" (sin rechazo aprendido) puede generar contenido que los modelos alineados rechazarian; no se han publicado evaluaciones de seguridad.
- Riesgo de alucinacion no cuantificado: no hay benchmarks de fidelidad ni evaluaciones humanas en la informacion disponible.
- La cross-entropy post-hardening (2,0683) se midio solo sobre una sonda del shard 0; no hay garantia de que se mantenga en otros dominios o idiomas.
- El proceso QAT uso solo 500 pasos de optimizacion y 415 secuencias de destilacion, lo que limita la cobertura del ajuste.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el profesor tienen condiciones propias que deben verificarse por separado antes de produccion.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria independiente.
- El repo ocupa 19,1 GB por incluir pesos BF16 y GGUF duplicados; conviene descargar solo los artefactos necesarios.
- No hay informacion sobre tool calling, agentes ni contexto maximo, por lo que no se recomienda asumir estas capacidades en produccion sin evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f3nc3r/Huihui-Qwen3.5-4B-abliterated-QAT
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Dataset de cubits top-64: https://huggingface.co/datasets/f3nc3r/Qwen3.8-Flash-Next-abliterated-top64-cubits
- Modelo profesor: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
