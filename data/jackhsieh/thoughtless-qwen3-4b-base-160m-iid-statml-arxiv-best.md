# JackHsieh/Thoughtless.Qwen3-4B-Base.160M-iid.statML-arxiv.best

## Resumen

Thoughtless.Qwen3-4B-Base.160M-iid.statML-arxiv.best es un modelo derivado de Qwen/Qwen3-4B-Base obtenido mediante continued pretraining con prediccion simple del siguiente token (sin modo de razonamiento ni "thoughts"). Lo desarrolla el usuario JackHsieh dentro de una linea de trabajo denominada "prestar" y "thoughtless", orientada a estudiar el efecto del continued pretraining sobre un modelo base de 4.000 millones de parametros.

El entrenamiento se realizo sobre la particion completa de entrenamiento del corpus JackHsieh/statML-arxiv-iid-160M-20M, compuesto por documentos de 4.096 tokens, con un 10 % de replay procedente de JackHsieh/dclm-replay.seq-4096.tokens-32B. Segun la model card, esta configuracion es la mejor celda de un barrido de learning rate x replay, seleccionada por la perdida de validacion final sobre el split de test de 20 millones de tokens.

El modelo es relevante como artefacto de investigacion reproducible: publica hiperparametros completos, la perdida de validacion final (1,23369 nats/token) y el enlace al run de Weights & Biases. No obstante, no se ha publicado informacion sobre capacidades, benchmarks, idiomas ni pipeline de uso, por lo que su interes practico es limitado fuera del contexto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (documentos de entrenamiento de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (copia maestra fp32, exportada sin casting) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer decoder-only de 4.000 millones de parametros, y se somete a continued pretraining con prediccion estandar del siguiente token, sin fase de razonamiento explicito ni datos de tipo "thought". El autor etiqueta el resultado como "thoughtless" para distinguirlo de variantes entrenadas con cadenas de pensamiento.

Los datos de entrenamiento son la particion completa de train de JackHsieh/statML-arxiv-iid-160M-20M (documentos de 4.096 tokens), con un 10 % de replay de JackHsieh/dclm-replay.seq-4096.tokens-32B y reordenacion del orden principal en cada epoca. La optimizacion usa AdamW con learning rate 1e-05, betas 0,9/0,95, epsilon 1e-08, weight decay 0,01, schedule coseno con 5 % de warmup hasta cero, grad clip 1,0, batch de 32 documentos, 2 epocas (2.704 pasos) y semilla 0. El sistema emplea FSDP2 full-shard con pesos maestros en fp32, computo en bf16 y flash-attention-2 sobre 4 GPU H100.

La perdida de validacion final reportada es de 1,23369 nats/token sobre el split de test de 20 millones de tokens (la celda del barrido daba 1,23371). No se documentan innovaciones arquitectonicas adicionales; el valor del artefacto esta en la reproducibilidad del barrido y en la publicacion de pesos en fp32.

## Capacidades

- Generacion de texto autoregresiva: al derivar de Qwen3-4B-Base, conserva la capacidad base de continuar texto, aunque no se documenta ninguna evaluacion especifica.
- Razonamiento explicito: no soportado por diseno; el entrenamiento es "thoughtless", sin datos de cadenas de pensamiento.
- Codigo y matematicas: no disponible; no se han publicado evaluaciones en estas areas.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible; no se documenta soporte.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre continued pretraining: el modelo sirve como punto de comparacion reproducible para estudiar el efecto de distintos learning rates y tasas de replay sobre un base de 4B, ya que se publican hiperparametros, semilla y run de W&B.
- Reproduccion de barridos de hiperparametros: al ser la mejor celda de un sweep de learning rate x replay, permite validar la metodologia de seleccion por perdida de validacion sobre un test fijo de 20 millones de tokens.
- Estudio del olvido catastrofico: la mezcla con un 10 % de replay de DCLM permite analizar cuanto conocimiento general se preserva tras el ajuste sobre un corpus especializado de estadistica y machine learning.
- Analisis de dominios especializados: el corpus statML-arxiv sugiere que el modelo puede emplearse para experimentar con generacion de texto tecnico en el ambito de estadistica y ML, siempre con validacion manual.
- Punto de partida para fine-tuning posterior: al publicarse en fp32 y con licencia Apache 2.0, puede servir como inicializacion para tareas downstream que requieran un base de 4B ya expuesto a literatura tecnica.
- Docencia y experimentacion con FSDP2: la configuracion documentada (FSDP2 full-shard, bf16, flash-attention-2, 4x H100) es un ejemplo practico de receta de entrenamiento reproducible a esta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion final sobre el split de test de 20 millones de tokens:

| Metrica | Valor |
|---|---|
| Perdida de validacion final (nats/token) | 1,23369 |
| Perdida de validacion de la celda del barrido (nats/token) | 1,23371 |
| Pasos de entrenamiento | 2.704 (2 epocas) |
| Tokens de entrenamiento (aproximado) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 16 GB solo para pesos (4.022 millones de parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en bf16/fp16: aproximadamente 8 GB para pesos, mas overhead.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4 GB para pesos; en 4 bits, aproximadamente 2 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizo en 4x H100 con FSDP2. Para inferencia, una A100 40/80 GB o una H100 son opciones holgadas; una RTX 4090 de 24 GB puede alojar el modelo en bf16 o cuantizado.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16, y en tarjetas con 8 GB o mas si se cuantiza.
- Opciones de despliegue: no se documenta ninguna en la model card. Al ser un modelo base sin pipeline declarado, requeriria conversion a formatos como GGUF para llama.cpp u Ollama, o su carga en vLLM/TGI si se anade una configuracion de chat.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Thoughtless.Qwen3-4B-Base.160M-iid.statML-arxiv.best | 4.022 millones | no disponible | Apache 2.0 | Continued pretraining sobre statML-arxiv con 10 % de replay DCLM |
| Qwen/Qwen3-4B-Base | 4.000 millones (aproximado) | no disponible en la informacion proporcionada | Apache 2.0 | Modelo base original del que deriva |
| Otras variantes de Qwen3-4B | no disponible | no disponible | Apache 2.0 | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un modelo base, no un modelo instruido: no sigue instrucciones de forma fiable ni mantiene conversaciones estructuradas sin un post-entrenamiento adicional.
- No se declaran idiomas soportados; el corpus de entrenamiento (statML-arxiv y DCLM) esta mayoritariamente en ingles, por lo que el rendimiento en castellano es incierto.
- No hay evaluaciones de sesgo, toxicidad o alucinacion publicadas; el riesgo de alucinacion es el propio de un modelo de 4B sin alineamiento.
- El ajuste sobre un corpus especializado de estadistica y ML puede haber degradado capacidades generales, aunque la mezcla con replay busca mitigarlo; no se aportan mediciones al respecto.
- No se documenta la longitud de contexto efectiva tras el entrenamiento con documentos de 4.096 tokens.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte, y el modelo no ha pasado por procesos de moderacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado pipeline ni espacio de demostracion, lo que limita la validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/Thoughtless.Qwen3-4B-Base.160M-iid.statML-arxiv.best
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Run de Weights & Biases: https://wandb.ai/latent-thoughts/prestar/runs/r9m9qb4u
