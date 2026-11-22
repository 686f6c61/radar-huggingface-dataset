# JackHsieh/Thoughtless.Qwen3-4B-Base.10M-iid.statML-arxiv.best

## Resumen

Thoughtless.Qwen3-4B-Base.10M-iid.statML-arxiv.best es un modelo derivado de Qwen/Qwen3-4B-Base obtenido mediante *continued pretraining* (preentrenamiento continuado) con predicción simple del siguiente token, sin modo de razonamiento (*thoughtless*). Lo publica el usuario JackHsieh dentro de una línea de experimentos denominada *prestar*, orientada a estudiar el efecto del preentrenamiento continuado sobre un corpus especifico de articulos de estadistica y *machine learning* de arXiv.

El modelo parte de la arquitectura Qwen3 en su variante Base de 4B parametros (4.022.468.096 parametros reales en safetensors) y se ajusta sobre una ventana i.i.d. de 10M tokens del dataset `JackHsieh/statML-arxiv-iid-160M-20M`, con un 10% de *replay* procedente de DCLM. Segun la model card, esta celda es el mejor punto de una busqueda coordenada de hiperparametros (learning rate, replay y epocas), seleccionada por la perdida de validacion final sobre el split de test de 20M tokens.

Su relevancia es fundamentalmente experimental: no es un modelo de proposito general pensado para produccion, sino un artefacto de investigacion que documenta un punto concreto (learning rate 3e-06, 2 epocas, 170 pasos) de un barrido de preentrenamiento continuado. La licencia Apache 2.0 y el formato safetensors facilitan su reutilizacion, pero la ausencia de evaluaciones de capacidades y de datos sobre idiomas limita su uso fuera del contexto del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, variante Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (documentos de entrenamiento de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (copia maestra fp32, exportada sin casting) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen/Qwen3-4B-Base, un transformer decoder-only de 4B parametros. Sobre esa base se aplica un preentrenamiento continuado con prediccion estandar del siguiente token (sin *thinking mode*), sobre la ventana `train[:2432]` del dataset `JackHsieh/statML-arxiv-iid-160M-20M`, compuesta por documentos de 4096 tokens. Se anade un 10% de *replay* del dataset `JackHsieh/dclm-replay.seq-4096.tokens-32B`, y el orden principal de los datos se rebaraja en cada epoca.

La optimizacion usa AdamW con learning rate 3e-06 (betas 0.9/0.95, eps 1e-08, weight decay 0.01), schedule coseno con 5% de *warmup* hasta 0, recorte de gradiente 1.0, batch de 32 documentos, 2 epocas (170 pasos) y semilla 0. El entrenamiento se ejecuto con FSDP2 *full-shard* con pesos maestros en fp32, computo en bf16, flash-attention-2 y 4 GPU H100. La perdida de validacion final sobre el split de test de 20M tokens es de 1.24580 nats/token. No se documenta el numero total de tokens vistos ni la composicion detallada del corpus mas alla de su origen estadistico/arXiv.

## Capacidades

- Generacion de texto autoregresiva basada en prediccion del siguiente token, sin modo de razonamiento explicito (*thoughtless*).
- Continuacion y modelado de texto tecnico del dominio estadistica y *machine learning* de arXiv, gracias al preentrenamiento continuado sobre ese corpus.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- No se documentan capacidades de vision, audio ni *thinking mode*.
- Al ser una variante Base, no se documenta ajuste por instrucciones ni por preferencias (RLHF/DPO).

## Casos de uso

- Investigacion sobre preentrenamiento continuado: el modelo sirve como punto de referencia reproducible (learning rate 3e-06, 2 epocas, 170 pasos) para estudiar el efecto del *replay* y del rebarajado de datos en la perdida de validacion.
- Modelado de lenguaje en dominio cientifico: adecuado para experimentos de *perplexity* y continuacion de texto sobre articulos de estadistica y *machine learning*, dado el corpus de ajuste.
- Punto de partida para *fine-tuning* posterior: al ser una variante Base con licencia Apache 2.0, puede usarse como inicializacion en tareas downstream del dominio.
- Ablaciones de *thoughtless* frente a modelos con razonamiento: permite comparar el comportamiento de una base sin *thinking mode* frente a variantes con modo de razonamiento sobre el mismo corpus.
- Reproducibilidad de experimentos: el enlace a la ejecucion de Weights & Biases y los hiperparametros documentados permiten replicar el entrenamiento en 4x H100.
- Estudio de la perdida de validacion como metrica: util para analizar la relacion entre nats/token y capacidades reales en corpus tecnicos pequenos.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni tareas de agentes, ya que no se han documentado capacidades ni evaluaciones en esos ambitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es la perdida de validacion final sobre el split de test de 20M tokens: 1.24580 nats/token.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 16 GB solo para pesos (4.022.468.096 parametros x 4 bytes), mas memoria para activaciones y cache KV.
- VRAM estimada en bf16/fp16: aproximadamente 8 GB para pesos, mas activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4 GB para pesos; en 4 bits, aproximadamente 2 GB (estimaciones teoricas, no verificadas para este modelo).
- GPU recomendadas: el entrenamiento se realizo en 4x H100; para inferencia, una A100 o H100 ofrece margen holgado. Una RTX 4090 (24 GB) deberia poder alojar el modelo en bf16 o fp32 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB en bf16 y en tarjetas con 8-12 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requeririan conversion a los formatos correspondientes (GGUF para llama.cpp/Ollama), no documentada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Thoughtless.Qwen3-4B-Base.10M-iid.statML-arxiv.best | 4.022.468.096 | no disponible | Apache 2.0 | Preentrenamiento continuado sobre corpus estadistica/arXiv; perdida de validacion 1.24580 nats/token |
| Qwen/Qwen3-4B-Base | 4B (aproximado) | no disponible | Apache 2.0 | Modelo base original del que deriva; sin ajuste sobre el corpus especifico |
| Otros derivados de Qwen3-4B-Base | 4B (aproximado) | no disponible | segun autor | No disponibles en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de investigacion: no se han documentado evaluaciones de capacidades, por lo que su comportamiento fuera del dominio de entrenamiento es incierto.
- Riesgo de alucinacion: al ser una variante Base sin ajuste por instrucciones ni preferencias, no se ha caracterizado su tendencia a generar contenido facticio.
- Sesgos conocidos: no documentados; el corpus de arXiv puede introducir sesgos de dominio y de estilo academico.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados ni longitud de contexto; los documentos de entrenamiento son de 4096 tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no esta validado para produccion.
- El *replay* del 10% de DCLM y el rebarajado de datos pueden afectar a la distribucion aprendida; no se documenta el impacto.
- Pesos en fp32: el repositorio ocupa 16.1 GB, lo que incrementa los requisitos de almacenamiento y memoria frente a una exportacion en bf16.
- Sin descargas ni *likes* en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/JackHsieh/Thoughtless.Qwen3-4B-Base.10M-iid.statML-arxiv.best
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Ejecucion de Weights & Biases: https://wandb.ai/latent-thoughts/prestar/runs/uhrmwisb
