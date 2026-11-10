# JackHsieh/Thoughtless.Qwen3-4B-Base.40M-iid.statML-arxiv.best

## Resumen

Thoughtless.Qwen3-4B-Base.40M-iid.statML-arxiv.best es un modelo derivado de Qwen/Qwen3-4B-Base obtenido mediante *continued pretraining* con prediccion simple del siguiente token (sin modo de razonamiento o "thoughts") sobre una ventana de 40 millones de tokens del corpus `JackHsieh/statML-arxiv-iid-160M-20M`. Lo publica el usuario JackHsieh como parte de un barrido experimental de tasa de aprendizaje y *replay* de datos, y esta pensado como punto de referencia dentro de una linea de investigacion sobre "prestar" y entrenamiento continuado, no como un modelo de proposito general listo para produccion.

El modelo conserva la arquitectura y el tamano del Qwen3-4B-Base original (4.022.468.096 parametros) y solo modifica los pesos mediante un ajuste fino ligero: dos epocas, 676 pasos, con una tasa de aprendizaje muy baja (3e-06). Esta celda concreta fue seleccionada como la mejor del barrido segun la perdida de validacion final sobre el split de test de 20 millones de tokens del corpus, con 1,24312 nats/token.

Su relevancia es fundamentalmente experimental: documenta de forma reproducible un protocolo de continued pretraining con mezcla de datos (0,1 de *replay* desde DCLM) y publica los pesos en fp32 sin conversion, lo que facilita analisis de olvido catastrofico, estudios de mezcla de datos y comparaciones controladas frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (documentos de entrenamiento de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 sin casting) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. El continued pretraining se realizo con prediccion simple del siguiente token, sin fase de razonamiento explicito ("thoughtless"), sobre `train[:9728]` del dataset `JackHsieh/statML-arxiv-iid-160M-20M`, compuesto por documentos de 4096 tokens, con un 0,1 de *replay* procedente de `JackHsieh/dclm-replay.seq-4096.tokens-32B` y reordenacion aleatoria de los datos en cada epoca.

La optimizacion uso AdamW con lr 3e-06 (betas 0,9/0,95, eps 1e-08, weight decay 0,01), schedule coseno con 5 % de warmup hasta 0, grad clipping de 1,0, batch de 32 documentos, 2 epocas (676 pasos) y semilla 0. El entrenamiento se ejecuto con FSDP2 *full-shard* con pesos maestros en fp32, computo en bf16, flash-attention-2 y 4 GPU H100. Los pesos publicados son la copia maestra en fp32 exportada sin casting. La perdida de validacion final sobre el split de test de 20 millones de tokens fue de 1,24312 nats/token (1,24316 en la celda original del barrido).

## Capacidades

- Generacion de texto autoregresiva mediante prediccion del siguiente token, sin modo de razonamiento explicito.
- Modelado de lenguaje sobre dominio cientifico-tecnico (estadistica, machine learning, arXiv) segun la composicion del corpus de ajuste.
- Herencia de las capacidades del modelo base Qwen3-4B-Base, aunque no se documenta ninguna evaluacion especifica tras el continued pretraining.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor etiqueta explicitamente el modelo como "thoughtless" (sin thoughts).
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre continued pretraining: sirve como punto de comparacion controlado frente a Qwen3-4B-Base para medir olvido catastrofico y ganancia en dominio tras 676 pasos de ajuste.
- Estudios de mezcla de datos y *replay*: el modelo documenta una proporcion concreta (0,1 de DCLM) y permite reproducir el barrido de tasa de aprendizaje con el mismo corpus y semilla.
- Modelado de lenguaje en dominio estadistica/ML: util para evaluar perplejidad sobre literatura arXiv de estadistica y machine learning con documentos de 4096 tokens.
- Base para experimentos de alineamiento posteriores: al ser un checkpoint intermedio en fp32, es adecuado como inicializacion para SFT o DPO en pipelines de investigacion.
- Analisis de sensibilidad a hiperparametros: la publicacion de la mejor celda de un barrido permite estudiar el efecto de lr y *replay* sobre la perdida de validacion.
- Reproducibilidad de entrenamiento distribuido: el uso de FSDP2, bf16 y flash-attention-2 sobre 4x H100 queda documentado y puede replicarse como referencia de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion final sobre el split de test de 20 millones de tokens del corpus:

| Metrica | Valor |
|---|---|
| Val loss final (nats/token, test 20M) | 1,24312 |
| Val loss celda del barrido | 1,24316 |
| Pasos de entrenamiento | 676 |
| Epocas | 2 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 16 GB solo para pesos (4.022 millones de parametros x 4 bytes), mas activaciones y cache KV.
- VRAM estimada en bf16/fp16: aproximadamente 8 GB para pesos, mas overhead; en cuantizacion de 8 bits, alrededor de 4 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: H100 o A100 para reproducir el entrenamiento (el autor uso 4x H100); para inferencia, una RTX 4090 (24 GB) es suficiente en bf16 o fp16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con cuantizacion, aunque esta no se distribuye.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requeririan conversion previa desde safetensors fp32; no se documenta compatibilidad oficial con ninguno.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Thoughtless.Qwen3-4B-Base.40M-iid.statML-arxiv.best | 4.022 M | no disponible | apache-2.0 | Continued pretraining ligero sobre Qwen3-4B-Base, sin benchmarks publicados |
| Qwen/Qwen3-4B-Base | ~4.000 M | no disponible en la informacion | apache-2.0 | Modelo base original; referencia directa de comparacion |
| Otros derivados de Qwen3-4B | no disponible | no disponible | variable | No se dispone de datos de alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo experimental de investigacion: no se han publicado evaluaciones de calidad, seguridad ni alineamiento tras el continued pretraining.
- Riesgo de olvido catastrofico: el ajuste sobre un corpus estrecho (arXiv de estadistica/ML) puede degradar capacidades generales del Qwen3-4B-Base original.
- Riesgo de alucinacion: al ser un modelo base sin RLHF ni DPO, no incorpora salvaguardas de alineamiento.
- Sesgos conocidos: no documentados; el corpus de ajuste (arXiv y DCLM) puede introducir sesgos de dominio y de representacion.
- Limitaciones de contexto e idioma: no disponibles; los documentos de entrenamiento son de 4096 tokens y no se especifica la ventana nativa del modelo.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero al derivar de Qwen3-4B-Base conviene verificar los terminos del modelo base.
- Caveat de produccion: los pesos se publican en fp32 sin casting, lo que incrementa el coste de almacenamiento (16,1 GB de repositorio) y requiere conversion para despliegue eficiente.
- Sin pipeline declarado ni descargas registradas: no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/Thoughtless.Qwen3-4B-Base.40M-iid.statML-arxiv.best
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de ajuste: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/latent-thoughts/prestar/runs/qmnvlea6
