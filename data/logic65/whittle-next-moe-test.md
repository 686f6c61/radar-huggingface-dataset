# logic65/whittle-next-moe-test

## Resumen

Whittle-Next MoE (test) es un artefacto de investigacion publicado por logic65 (David Aylward) que documenta un experimento de "moefication": la conversion de un modelo denso de 14,7 mil millones de parametros en un modelo de mezcla de expertos (MoE) sin reentrenar ningun peso de experto. El modelo parte de Qwen3.8-Whittle-tri-14.7B, un derivado de Qwen3.8-27B, y aplica un proceso de tallado (carve) que reorganiza las neuronas de las capas FFN en 240 expertos enrutados de 64 neuronas mas un experto compartido de 2048 neuronas, seguido de una breve fase de alineacion de la asignacion neurona→experto mediante transporte optimo. El resultado es un modelo con aproximadamente un 33% de parametros activos por token (5.760 de 17.408 neuronas FFN).

El modelo se distribuye con la arquitectura estandar `Qwen3_5MoeForCausalLM`, lo que permite cargarlo en `transformers` sin codigo personalizado, aunque requiere GPU CUDA por el uso de kernels Triton en las capas gated-delta-net. Es importante destacar que se trata de un modelo de prueba: no ha recibido ajuste por instrucciones, ni trabajo de seguridad como MoE, y su autor advierte explicitamente que no debe usarse en produccion. Su proposito es servir como registro reproducible del metodo y permitir extender la investigacion sobre conversion denso→MoE sin entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForCausalLM (MoE con capas gated-delta-net, 32 capas, GDN full-attention 3:1) |
| Parametros totales | 14.758.885.632 (14,7B) |
| Parametros activos | ~33% por token (5.760 / 17.408 neuronas FFN) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo bfloat16 en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MoE construido a partir de un modelo denso sin reentrenar los pesos de los expertos. El proceso consta de tres fases. Primero, una calibracion de activaciones: se registran las activaciones post-SiLU de las puertas (gate) de las 17.408 neuronas FFN por capa, usando un conjunto de calibracion de 240 muestras, 10 clusters y 40 tareas, siguiendo la recomendacion de ExpertWeaver de usar diversidad de tareas en lugar de texto generico. Segundo, el tallado: las neuronas mas universales (bajo coeficiente de variacion entre tareas y alta activacion media) se asignan a un experto compartido de 2048 neuronas siempre activo; las 15.360 restantes se agrupan mediante k-means balanceado sobre sus perfiles de activacion en 240 expertos enrutados de 64 neuronas. El router se construye sin entrenamiento como la media de los vectores de puerta de cada cluster. Tercero, la alineacion: la asignacion neurona→experto se aprende como un problema de transporte optimo balanceado (Sinkhorn en dominio logaritmico con estimador straight-through), usando el modelo denso original como profesor. Los pesos densos permanecen congelados durante todo el proceso.

La configuracion de servido esta horneada en los pesos: se usa un router escalado con ponderacion uniforme top-k, y `down_proj` compensa la amplitud. Si se cambia `num_experts_per_tok`, es necesario reescalar `down_proj` por `k_new / 58` para no alterar la amplitud de salida. El modelo reproduce exactamente al denso cuando se activan los 240 expertos, lo que sirve como comprobacion de correccion del tallado.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo denso original, pero sin ajuste por instrucciones como MoE.
- Enrutamiento MoE con 58 expertos activos por token mas el experto compartido, lo que reduce el coste computacional respecto al denso.
- Reproduccion exacta del modelo denso cuando se activan todos los expertos (k=240), lo que permite verificar la integridad del tallado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.
- No se especifican idiomas soportados; se asume herencia del modelo base, pero no hay datos confirmados.

## Casos de uso

- Reproduccion del metodo de moefication: el modelo sirve como referencia publica para replicar el proceso de tallado denso→MoE sin reentrenamiento, tal como se describe en la model card.
- Extension de la investigacion sobre asignacion de expertos: permite estudiar el efecto de la alineacion mediante transporte optimo en la calidad del modelo esparso, comparando con la version sin alinear.
- Evaluacion de la relacion entre esparsidad y calidad: con la tabla de CE held-out se puede analizar como varia la perdida al cambiar el numero de expertos activos (k=26, 52, 58, 104, 240).
- Estudio de la compensacion de amplitud en routers MoE: la configuracion horneada con `down_proj` escalado ofrece un caso de estudio para entender el impacto de cambiar `num_experts_per_tok`.
- Desarrollo de tecnicas de calibracion de activaciones: el uso de un conjunto de calibracion basado en diversidad de tareas (40 tareas, 10 clusters) puede servir como punto de partida para experimentos propios.
- Verificacion de la integridad de tallados: al activar todos los expertos se reproduce el denso exactamente, lo que permite validar que la permutacion de neuronas es correcta en otros modelos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval) en la informacion disponible. La model card reporta una bateria de prueba factual de 5 sondas y la perdida de entropia cruzada (CE) en datos held-out, comparando la version alineada con la version sin alinear (baseline) para distintos numeros de expertos activos:

| Expertos activos (k) | Baseline (CE) | Modelo alineado (CE) |
|---|---|---|
| 26 | 5.31 | 4.17 |
| 52 | 4.76 (2/5 en bateria factual) | 3.94 (5/5) |
| 58 (configuracion por defecto) | 4.69 (4/5) | 3.91 (5/5) |
| 104 | 4.16 | 3.77 |
| 240 (todos) | 3.486 | 3.485 |

La alineacion mejora la CE en aproximadamente 0.8 puntos en todos los niveles de esparsidad, y el modelo alineado con k=58 supera al no alineado con k=104. Con k=240, ambos reproducen el modelo denso (CE 3.485), lo que confirma la correccion del tallado. El autor advierte que esta bateria es una prueba de humo, no un benchmark completo.

## Requisitos de hardware

- Se requiere una GPU CUDA; las capas gated-delta-net usan kernels Triton, por lo que no es posible ejecutar en CPU.
- El modelo tiene 14,7B parametros en bfloat16; el repositorio ocupa 29,5 GB, lo que sugiere que la inferencia en bfloat16 necesita al menos ~30 GB de VRAM (por ejemplo, A100 40GB, H100 80GB, o dos RTX 3090/4090 con paralelismo).
- No se proporcionan datos de latencia ni throughput.
- No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI); la carga se realiza con `transformers` y `device_map="auto"`.
- No se documentan cuantizaciones alternativas; el unico formato disponible es safetensors en bfloat16.

## Comparativa con modelos similares

El modelo se enmarca en la linea de "moefication" del autor logic65. El modelo hermano Qwen3.8-Whittle-MoE-27B-A17.8B es un MoE de 27B (26,9B) con 64 expertos y 16 activos por token, 256K de contexto, tambien derivado de Qwen3.8-27B, pero con un proceso de ajuste posterior que le permite mantener conversaciones reales. La comparacion directa no es posible por falta de benchmarks comunes, pero se pueden contrastar las arquitecturas:

| Modelo | Parametros | Expertos | Activos por token | Contexto | Licencia |
|---|---|---|---|---|---|
| whittle-next-moe-test | 14,7B | 240 + 1 compartido | 58 + compartido (~33%) | no disponible | Apache-2.0 |
| Qwen3.8-Whittle-MoE-27B-A17.8B | 26,9B | 64 | 16 | 256K | Apache-2.0 |
| Qwen3.8-Whittle-tri-14.7B (denso) | 14,7B | - | - | no disponible | Apache-2.0 |

El modelo de prueba se distingue por su naturaleza experimental: no ha recibido ajuste por instrucciones, mientras que el hermano de 27B si lo ha recibido. El denso original es el padre del que se talla este MoE.

## Limitaciones y advertencias

- Es un modelo de prueba, no un asistente: no tiene ajuste por instrucciones, ni trabajo de seguridad como MoE. No debe usarse en produccion.
- La calidad de chat no esta caracterizada; el autor advierte que se esperan "bordes asperos" (rough edges).
- La CE held-out en la configuracion por defecto (k=58) es ~0.43 puntos superior a la del modelo denso (3.91 vs 3.485), lo que indica que la esparsidad tiene un coste en calidad.
- La bateria de 5 sondas factuales es una prueba de humo, no un benchmark completo; no se reivindican numeros de MMLU/GSM8K.
- La alineacion se ejecuto durante unos pocos miles de pasos con batch size 1, muy por debajo de la receta de referencia; mas alineacion es la palanca obvia para mejorar.
- La configuracion de servido esta horneada en los pesos: cambiar `num_experts_per_tok` requiere reescalar `down_proj` por `k_new / 58`, o la amplitud de salida sera incorrecta.
- No se especifican idiomas soportados; se desconoce el comportamiento multilingue.
- Requiere GPU CUDA con soporte de Triton; no es ejecutable en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logic65/whittle-next-moe-test
- Modelo base (denso): https://huggingface.co/logic65/Qwen3.8-Whittle-tri-14.7B
- Modelo hermano (MoE 27B): https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B
- Paper de referencia del tallado (ExpertWeaver): arXiv 2602.15521
- Paper de referencia de la alineacion (DOT-MoE): arXiv 2606.01666
- Pagina de soporte del autor: https://ko-fi.com/davida81328
