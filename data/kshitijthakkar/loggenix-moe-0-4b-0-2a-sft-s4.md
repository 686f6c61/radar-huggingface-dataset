# kshitijthakkar/loggenix-moe-0.4B-0.2A-sft-s4

## Resumen

loggenix-moe-0.4B-0.2A-sft-s4 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por kshitijthakkar, especializado en el análisis de trazas OpenTelemetry y la observabilidad de agentes. Está diseñado para emitir llamadas a herramientas (tool-calling) en formato JSON estructurado a partir de payloads de trazas, lo que lo convierte en una pieza útil para pipelines de diagnóstico automático en entornos de microservicios. El modelo se basa en la arquitectura Qwen3 MoE, con 16 expertos y selección top-2, lo que le permite activar aproximadamente 200 millones de parámetros por token de un total de unos 395 millones.

El modelo es el resultado de un ajuste fino supervisado (SFT) sobre la versión anterior `loggenix-moe-0.4B-0.2A-sft-s3.1`, utilizando un corpus 100% orientado a observabilidad (TraceVerse). Su relevancia radica en que ofrece una alternativa compacta y eficiente para tareas de análisis de trazas y generación de tool-calls, con un coste computacional reducido y la posibilidad de ejecutarse en hardware de consumo. La ventana de contexto es de 8192 tokens, suficiente para manejar trazas complejas, y se distribuye con pesos en formato safetensors y GGUF, lo que facilita su despliegue en múltiples entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (Mixture of Experts) |
| Parametros totales | 390.051.840 (~395M) |
| Parametros activos | ~200M (top-2 de 16 expertos) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | f16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE basada en Qwen3, con 16 expertos y selección top-2 por token, lo que significa que solo dos expertos se activan en cada paso de generación. El vocabulario tiene 151.936 tokens. El entrenamiento se realizó mediante ajuste fino supervisado completo (full fine-tune) con TRL `SFTTrainer`, en precisión bf16 y con FlashAttention-2. La secuencia de entrenamiento fue de 8192 tokens con empaquetado, un tamaño de lote efectivo de 65.536 tokens por paso (batch 1 con grad-accum 8), y una tasa de aprendizaje de 2e-4 con programación coseno y warmup del 10%. El hardware utilizado fue una única GPU RTX 5090 de 24 GB.

El corpus de entrenamiento está compuesto por 79.200 filas, de las cuales el 61,9% proviene de `TraceVerse-RL-SFT-AgentMix3`, el 23,1% de `TraceVerse-RL-SFT-Clean` y el 15% de un dataset sintético (`loggenix-stage4-sft-dataset`). Se reservaron 2.000 filas para evaluación. Una innovación técnica destacable es el uso de `norm_topk_prob=true`, que garantiza que los pesos de los expertos estén normalizados; esto es crítico para la compatibilidad con llama.cpp, ya que su grafo `qwen3moe` asume esta normalización de forma fija.

## Capacidades

- Analisis de trazas OpenTelemetry: interpreta payloads `<trace>` y extrae informacion relevante sobre servicios, codigos HTTP, duraciones y dependencias.
- Tool-calling estructurado: genera respuestas en JSON con llamadas a herramientas (por ejemplo, MCP tools) para diagnosticar problemas.
- Razonamiento multi-paso: el modelo "razona" antes de responder, por lo que requiere un presupuesto de tokens generoso (1500 o mas) para completar sus respuestas.
- Generacion de texto conversacional: puede mantener dialogos con un rol de sistema, aunque su dominio principal es la observabilidad.
- Soporte de agentes: integrable en flujos de agentes que necesiten decidir que herramientas invocar a partir de trazas.
- Multilingue: solo ingles; no se ha entrenado para otros idiomas.

## Casos de uso

- Diagnostico automatico de fallos en microservicios: dado un payload `<trace>` con errores HTTP o latencias altas, el modelo sugiere que herramientas MCP invocar para investigar la causa raiz.
- Generacion de llamadas a herramientas en pipelines de observabilidad: puede integrarse en sistemas de alertas para producir automaticamente comandos de depuracion (por ejemplo, consultas a APM, logs o metricas).
- Asistente de SRE: actua como copiloto para ingenieros de confiabilidad, interpretando trazas y recomendando acciones correctivas.
- Observabilidad de agentes de IA: analiza trazas de ejecucion de agentes (llamadas a modelos, herramientas, etc.) para detectar anomalias o cuellos de botella.
- Automatizacion de respuestas en plataformas de monitoreo: genera resumenes de incidentes y sugiere pasos de mitigacion en formato JSON para alimentar sistemas de ticketing.
- Entrenamiento y evaluacion de modelos especializados: sirve como punto de partida para ajustes finos adicionales en dominios de telemetria y tracing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo es un especialista en observabilidad y no se ha evaluado en tareas generales. Los datos de rendimiento proporcionados por el autor son:

| Metrica | Valor |
|---|---|
| eval_loss | 1.365 |
| eval token accuracy | 0.750 |
| train_loss | 1.44 |

Ademas, se midieron velocidades de inferencia con las cuantizaciones GGUF:

| Cuantizacion | Tamano | Velocidad medida |
|---|---|---|
| f16 | 786 MB | 218 tok/s |
| Q8_0 | 421 MB | no disponible |
| Q4_K_M | 256 MB | 344 tok/s |

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M (256 MB) cabe en cualquier GPU con al menos 1 GB de VRAM; con f16 (786 MB) se necesita alrededor de 1-2 GB. El modelo completo en bf16 ocupa aproximadamente 780 MB, por lo que es viable en GPUs de consumo como RTX 3060, RTX 4060 o incluso en CPU con suficiente RAM.
- GPU recomendada: para inferencia rapida, una RTX 4090 o similar; el entrenamiento se realizo en una RTX 5090 de 24 GB, pero la inferencia no requiere tanta memoria.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), vLLM, llama.cpp, Ollama (mediante Modelfiles incluidos), y FriendliAI como servicio gestionado.
- Latencia y throughput: con Q4_K_M se alcanzan 344 tok/s en hardware de gama alta; con f16, 218 tok/s. La latencia por token es de aproximadamente 2,9 ms y 4,6 ms respectivamente.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar directamente con otros modelos especializados en analisis de trazas, ya que es un nicho muy concreto. Como referencia, se puede comparar con el modelo base `loggenix-moe-0.4B-0.2A-sft-s3.1`, del cual deriva, y con modelos generales de tamano similar como Qwen3-0.6B, aunque estos ultimos no estan orientados a observabilidad. La siguiente tabla resume las diferencias con el modelo base:

| Modelo | Parametros totales | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| loggenix-moe-0.4B-0.2A-sft-s4 | ~395M | 8192 | Trazas y tool-calling | Apache 2.0 |
| loggenix-moe-0.4B-0.2A-sft-s3.1 | ~395M | 8192 | Trazas y tool-calling (version anterior) | Apache 2.0 |
| Qwen3-0.6B (referencia general) | ~600M | 32768 | Generico | Apache 2.0 |

## Limitaciones y advertencias

- Especialista: el modelo esta entrenado exclusivamente para analisis de trazas y tool-calling; sus capacidades generales (conversacion, conocimiento del mundo, etc.) son debiles y no deben usarse fuera de su dominio.
- Datos sinteticos: el 15% de las filas de entrenamiento son sinteticas, lo que puede introducir sesgos o patrones artificiales.
- Sin evaluacion independiente: no se ha puntuado en los golden evals de TraceVerse, por lo que no hay una garantia de calidad mas alla de la loss y la token accuracy reportadas.
- Requiere sampling: la decodificacion greedy produce bucles de repeticion; es obligatorio usar `do_sample=True` con `temperature=0.7`, `top_p=0.95` y `top_k=20`.
- Presupuesto de tokens: se necesitan al menos 1500 tokens de generacion para respuestas completas; un limite menor truncara el razonamiento y dara resultados incoherentes.
- Contexto fijo: la ventana de 8192 tokens no debe reducirse (por ejemplo, a 4096) porque las trazas suelen superar ese limite y llama.cpp truncaria el prompt silenciosamente.
- Idioma: solo ingles; no soporta otros idiomas.
- Compatibilidad GGUF: los GGUFs incluidos son coherentes gracias a `norm_topk_prob=true`; si se convierte un checkpoint con `false`, el resultado en llama.cpp sera basura.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/kshitijthakkar/loggenix-moe-0.4B-0.2A-sft-s4
- Modelo base (s3.1): https://huggingface.co/kshitijthakkar/loggenix-moe-0.4B-0.2A-sft-s3.1
- Coleccion Loggenix-MOE: https://huggingface.co/collections/kshitijthakkar/loggenix-moe
- FriendliAI (inferencia gestionada): https://friendli.ai/models/kshitijthakkar/loggenix-moe-0.4B-0.2A-sft-s4
