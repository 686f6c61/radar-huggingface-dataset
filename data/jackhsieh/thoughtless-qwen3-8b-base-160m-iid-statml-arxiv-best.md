# JackHsieh/Thoughtless.Qwen3-8B-Base.160M-iid.statML-arxiv.best

## Resumen

Thoughtless.Qwen3-8B-Base.160M-iid.statML-arxiv.best es un modelo de lenguaje derivado de Qwen/Qwen3-8B-Base mediante continued pretraining con prediccion simple del siguiente token (sin modo "thinking" ni objetivos auxiliares de razonamiento). Lo desarrolla el usuario JackHsieh dentro de una linea de trabajo etiquetada como "prestar" y "thoughtless", orientada a estudiar el efecto de un preentrenamiento adicional controlado sobre un corpus pequeno y muy especifico: 38.912 documentos de estadistica y machine learning extraidos de arXiv, con documentos de 4096 tokens.

El modelo conserva la arquitectura y el tamano del Qwen3-8B-Base original (8.190.735.360 parametros, transformer denso) y se publica en safetensors en fp32 sin casting, con licencia Apache 2.0. Su interes no es el rendimiento generalista, sino servir como punto de referencia reproducible: es la mejor celda de una busqueda coordenada de learning rate, replay y numero de epocas, seleccionada por perdida de validacion final (1,19293 nats/token sobre un split de test de 20M tokens).

Por su naturaleza experimental, es un artefacto de investigacion mas que un modelo listo para produccion: cero descargas y cero likes en el momento de la ficha, sin pipeline declarado y sin idiomas documentados. Resulta relevante para quien investigue olvido catastrofico, mezcla de datos de replay o ajuste fino de dominios cientificos sobre modelos Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-8B-Base); sin modo thinking |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los documentos de entrenamiento son de 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 sin casting; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, copia maestra exportada sin casting) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-8B-Base: un transformer denso de aproximadamente 8,19 mil millones de parametros. El continued pretraining se hizo con prediccion simple del siguiente token ("thoughtless: no thoughts"), es decir, sin objetivos de razonamiento explicito ni tokens de pensamiento. El corpus principal es JackHsieh/statML-arxiv-iid-160M-20M, con 38.912 documentos de 4096 tokens; se aplico un 0,1 de replay procedente de JackHsieh/dclm-replay.seq-4096.tokens-32B y el orden principal se rebarajo en cada epoca.

La optimizacion uso AdamW con learning rate 1e-05 (betas 0,9/0,95, eps 1e-08, weight decay 0,01), schedule coseno con 5% de warmup hasta 0, grad clip 1.0, batch de 32 documentos, 1 epoca (1.352 pasos) y semilla 0. El sistema fue FSDP2 con full-shard, pesos maestros en fp32, computo en bf16, flash-attention-2 y 8 GPU H100. La perdida de validacion final en el ultimo paso sobre el split de test de 20M tokens fue de 1,19293 nats/token. Segun la model card, la celda elegida es un optimo local coordenado tanto a 1 como a 2 epocas, seleccionado por esa perdida de validacion.

## Capacidades

- Generacion de texto autoregresiva con prediccion simple del siguiente token, sin modo de razonamiento o "thinking".
- Continuacion y sintesis de texto tecnico en el dominio de estadistica y machine learning, dado el corpus de entrenamiento.
- Capacidades heredadas del Qwen3-8B-Base subyacente; la model card no documenta cuales se preservan tras el continued pretraining.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento excluye explicitamente objetivos de pensamiento.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo es solo texto segun la informacion disponible.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como punto de control para medir cuanto conocimiento generalista de Qwen3-8B-Base se degrada tras 1.352 pasos sobre un corpus cientifico pequeno, comparando perdida en dominios fuera de distribucion.
- Estudio de mezcla de datos y replay: con un 0,1 de replay de DCLM, es una referencia reproducible para analizar el efecto del replay en la retencion de capacidades y en la perplejidad final.
- Reproduccion de busquedas de hiperparametros: la model card documenta learning rate, epocas, semilla y sistema (FSDP2, 8x H100), lo que permite replicar la celda y extender la busqueda coordenada.
- Ajuste fino de dominio cientifico: al estar especializado en estadistica y ML de arXiv, puede usarse como inicializacion para tareas de extraccion de informacion, resumen de abstracts o clasificacion de articulos tecnicos.
- Baseline en evaluaciones de modelos "thoughtless": sirve para comparar contra variantes con objetivos de razonamiento y aislar el efecto del modo thinking en tareas de conocimiento.
- Experimentos de cuantizacion y despliegue: al publicarse pesos fp32 sin casting, es util para estudiar la degradacion al convertir a bf16, int8 o formatos GGUF en pipelines de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es la perdida de validacion final:

| Metrica | Valor |
|---|---|
| Perdida de validacion final (ultimo paso, split de test de 20M tokens) | 1,19293 nats/token |
| Pasos de entrenamiento | 1.352 (1 epoca) |
| Documentos de entrenamiento | 38.912 |
| Longitud de documento | 4096 tokens |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 32,8 GB solo para pesos (el repo ocupa 32,8 GB), mas overhead de activaciones y cache KV; en la practica requiere GPUs de 40-80 GB para contexto largo.
- VRAM estimada en bf16: alrededor de 16,4 GB para pesos; cabe en una RTX 4090 (24 GB) con contexto moderado, y con holgura en A100 40 GB, H100 80 GB o L40S 48 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8,2 GB para pesos; viable en GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080) con contexto limitado.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4,1 GB para pesos; viable en GPUs de 8 GB, aunque no se publican pesos GGUF en el repo.
- GPU recomendadas: H100 80 GB o A100 80 GB para fp32 y contexto largo; A100 40 GB, L40S o RTX 4090 para bf16.
- Opciones de despliegue: vLLM, TGI o transformers para bf16/fp32; llama.cpp u Ollama requeririan conversion previa a GGUF, no incluida en el repo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento adicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thoughtless.Qwen3-8B-Base.160M-iid.statML-arxiv.best | 8,19 B | no disponible | Continued pretraining en statML-arxiv (160M tokens) con replay DCLM | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B-Base | 8,19 B | no disponible en esta ficha | Preentrenamiento generalista original | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen3-8B (instruct) | 8,19 B | no disponible en esta ficha | Post-entrenamiento con instrucciones y modo thinking | Apache 2.0 | Hugging Face |
| Alternativas de continued pretraining de dominio | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con Qwen3-8B-Base es la mas relevante: mismo numero de parametros y misma licencia, pero con un ajuste de dominio que puede mejorar la perplejidad en estadistica y ML a costa de capacidades generales. No se dispone de benchmarks publicados que cuantifiquen esa diferencia.

## Limitaciones y advertencias

- Modelo experimental de investigacion: cero descargas y cero likes, sin pipeline declarado ni validacion externa documentada.
- Riesgo de olvido catastrofico: 1.352 pasos sobre un corpus de 160M tokens pueden degradar capacidades generales de Qwen3-8B-Base; no se documenta una evaluacion de retencion.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; el modelo no tiene post-entrenamiento con RLHF/DPO segun la informacion disponible.
- Sesgos conocidos: no disponibles; el corpus arXiv de estadistica y ML puede introducir sesgos de dominio y de estilo academico.
- Limitaciones de contexto e idioma: no se documenta la ventana de contexto efectiva ni los idiomas soportados; los documentos de entrenamiento son de 4096 tokens y predominantemente tecnicos en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3-8B-Base conviene verificar las condiciones del modelo base y de los datasets de replay (DCLM) antes de un despliegue en produccion.
- Pesos en fp32 sin casting: el repo de 32,8 GB no incluye variantes cuantizadas, lo que anade trabajo de conversion para despliegues ligeros.
- Ausencia de modo thinking: no es adecuado para tareas que dependan de razonamiento explicito multi-paso sin un post-entrenamiento adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/Thoughtless.Qwen3-8B-Base.160M-iid.statML-arxiv.best
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset principal: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Run de Weights & Biases: https://wandb.ai/latent-thoughts/prestar/runs/1ygwa36c
