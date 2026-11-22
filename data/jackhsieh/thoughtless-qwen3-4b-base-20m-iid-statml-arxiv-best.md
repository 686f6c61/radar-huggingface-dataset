# JackHsieh/Thoughtless.Qwen3-4B-Base.20M-iid.statML-arxiv.best

## Resumen

Thoughtless.Qwen3-4B-Base.20M-iid.statML-arxiv.best es un modelo derivado de Qwen/Qwen3-4B-Base obtenido mediante continued pretraining con prediccion simple del siguiente token (sin modo de razonamiento ni "thoughts") sobre una ventana de 20 millones de tokens del corpus JackHsieh/statML-arxiv-iid-160M-20M. Lo publica el usuario JackHsieh bajo el paraguas de un proyecto denominado "prestar", orientado a experimentos de continued pretraining sobre modelos base de la familia Qwen3. El modelo conserva la arquitectura y el tamano del base (4.022.468.096 parametros) y solo modifica los pesos mediante un ajuste fino de bajo coste computacional.

El problema que aborda es acotado y de investigacion: explorar como responde un modelo base de 4B a un regimen de entrenamiento con datos cientificos de estadistica y machine learning (arXiv), con una fraccion de replay del 10 % procedente de DCLM, y seleccionar la mejor celda de un barrido de hiperparametros (learning rate x replay x epocas) segun la perdida de validacion final. No es un modelo instructivo ni un asistente conversacional: es una pieza de laboratorio para estudiar dinámicas de continued pretraining y olvido catastrofico en modelos pequenos.

Su relevancia es fundamentalmente metodologica. La model card documenta de forma muy detallada los hiperparametros (AdamW con lr 3e-06, cosine schedule, 2 epocas, 338 pasos, batch de 32 documentos de 4096 tokens, FSDP2 con pesos maestros en fp32 y computo en bf16 sobre 4x H100), lo que lo hace reproducible. Con 0 descargas y 0 likes en el momento de la consulta, debe tratarse como un artefacto de investigacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Base); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens en entrenamiento; contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32 sin casting; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (copia maestra en fp32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer decoder-only de 4.022 millones de parametros. El continued pretraining se realiza con prediccion plana del siguiente token, sin fases de instruccion, RLHF ni DPO, y con el modo de razonamiento desactivado ("thoughtless: no thoughts"). Los datos principales son la particion train[:4864] del dataset JackHsieh/statML-arxiv-iid-160M-20M, compuesta por documentos de 4096 tokens, con un 10 % de replay procedente de JackHsieh/dclm-replay.seq-4096.tokens-32B y reordenacion aleatoria del orden principal en cada epoca.

La optimizacion usa AdamW con learning rate 3e-06 (betas 0.9/0.95, eps 1e-08, weight decay 0.01), schedule coseno con 5 % de warmup hasta 0, grad clipping de 1.0, batch de 32 documentos y 2 epocas (338 pasos) con semilla 0. El sistema emplea FSDP2 con full-shard, pesos maestros en fp32, computo en bf16, flash-attention-2 y 4 GPU H100. La perdida de validacion final sobre el split de test de 20M tokens es de 1.24478 nats/token. No se documentan innovaciones arquitectonicas propias: el valor del artefacto esta en el protocolo de entrenamiento y en la seleccion de la mejor celda del barrido.

## Capacidades

- Generacion de texto autoregresiva basica, limitada a la distribucion aprendida durante el pretraining y el continued pretraining.
- Modelado de lenguaje sobre texto cientifico de estadistica y machine learning (arXiv), dominio principal del corpus de ajuste.
- Razonamiento y generacion de codigo: capacidades heredadas del base Qwen3-4B-Base, no evaluadas ni garantizadas tras el continued pretraining.
- Tool calling / function calling: no documentado; al ser un modelo base sin post-entrenamiento instructivo, no se espera un soporte fiable de formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el corpus de ajuste es presumiblemente en ingles.
- Modo thinking: explicitamente ausente ("thoughtless").
- Vision y audio: no soportados.

## Casos de uso

- Investigacion sobre continued pretraining: reproducir el protocolo documentado (lr 3e-06, 2 epocas, 10 % replay DCLM, 4x H100) para estudiar dinámicas de adaptacion de dominio en modelos de 4B con presupuesto reducido.
- Estudio de olvido catastrofico: comparar la perdida en el dominio arXiv frente a la retenida en el dominio general (DCLM) para cuantificar el efecto del replay al 10 %.
- Baseline en experimentos de ajuste de hiperparametros: usar esta celda como referencia del barrido learning rate x replay x epocas y medir mejoras relativas de nuevas configuraciones.
- Analisis de corpus cientifico: emplear el modelo como modelo de lenguaje de dominio para calcular perplexity o puntuar textos de estadistica y ML en tareas de filtrado y deduplicacion de datasets.
- Punto de partida para un posterior SFT: al ser un modelo base adaptado al dominio, puede servir como inicializacion para un ajuste instructivo sobre tareas de estadistica o analisis de datos.
- Reproduccion de resultados: verificar la perdida de validacion reportada (1.24478 nats/token) sobre el split de test de 20M tokens y validar la estabilidad del entrenamiento con semilla 0.
- Docencia y divulgacion: ilustrar en un curso o taller el flujo completo de continued pretraining con FSDP2, pesos maestros en fp32 y computo en bf16 sobre hardware H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion final sobre el split de test de 20M tokens del corpus statML-arxiv-iid, que asciende a 1.24478 nats/token (ultimo paso). No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 16 GB solo para pesos (4.022 millones de parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en bf16/fp16: aproximadamente 8 GB para pesos, mas overhead; en cuantizacion de 8 bits, unos 4 GB; en 4 bits, unos 2-2,5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: H100 o A100 para reproducir el entrenamiento documentado (4x H100 con FSDP2). Para inferencia, una RTX 4090 (24 GB) es suficiente en bf16 o cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB si se cuantiza, siempre que se genere una version GGUF (no publicada).
- Opciones de despliegue: transformers con safetensors es la via directa; vLLM y TGI son compatibles con arquitecturas Qwen3, pero requieren conversion o verificacion del checkpoint; llama.cpp y Ollama requeririan una conversion a GGUF no disponible en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Thoughtless.Qwen3-4B-Base.20M-iid.statML-arxiv.best | 4,02B | 4096 (entrenamiento) | Apache 2.0 | Continued pretraining en dominio arXiv statML | Repo de 16,1 GB, 0 descargas |
| Qwen/Qwen3-4B-Base | 4,02B | No disponible en la informacion proporcionada | Apache 2.0 | Modelo base generalista | Publico en Hugging Face |
| Qwen/Qwen3-4B (instruct) | 4,02B | No disponible en la informacion proporcionada | Apache 2.0 | Post-entrenamiento instructivo y modo thinking | Publico en Hugging Face |

La comparacion con alternativas de dominio (por ejemplo, modelos base ajustados sobre arXiv de otros autores) no esta disponible en la informacion proporcionada. Frente a Qwen3-4B-Base, la diferencia medible es la perdida de validacion en el corpus statML-arxiv (1.24478 nats/token), sin datos comparativos del base en ese mismo split.

## Limitaciones y advertencias

- No es un modelo instructivo: no sigue instrucciones de forma fiable ni mantiene formatos de chat; su uso conversacional producira resultados pobres.
- Riesgo elevado de alucinacion en generacion abierta, especialmente fuera del dominio arXiv de estadistica y ML.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Idiomas: no se documenta soporte multilingue; el corpus de ajuste parece en ingles.
- Contexto limitado a 4096 tokens en el entrenamiento; no se garantiza un comportamiento correcto mas alla de esa longitud.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ha pasado ninguna evaluacion de seguridad ni de calidad para produccion.
- Artefacto de investigacion con 0 descargas y 0 likes: no hay validacion externa de los resultados reportados.
- Pesos en fp32 sin casting: el repositorio ocupa 16,1 GB, lo que complica el despliegue en entornos con almacenamiento o ancho de banda limitados.
- No se publican versiones cuantizadas (GGUF, AWQ, GPTQ), por lo que el despliegue en hardware de consumo requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/Thoughtless.Qwen3-4B-Base.20M-iid.statML-arxiv.best
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset principal: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Registro de entrenamiento (wandb): https://wandb.ai/latent-thoughts/prestar/runs/v25zzipi
