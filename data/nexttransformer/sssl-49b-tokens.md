# NextTransformer/SSSL-49B-Tokens

## Resumen

NextTransformer SSSL es un modelo de lenguaje causal de tipo transformer, desarrollado por el proyecto NextTransformer (repositorio Interactive-Active-AI/NextTransformer), que forma parte de un estudio comparativo de arquitecturas entrenadas sobre un presupuesto fijo de 49.152 millones de tokens. El checkpoint publicado es el resultado final de la variante SSSL ("short, short, short, long"), descrita por el autor como "the historical reference" dentro de dicha comparativa. Cuenta con 1.384.122.122 parametros y una ventana de contexto de 2.048 tokens.

El modelo se ha preentrenado sobre el dataset ClimbMix durante 46.875 actualizaciones y se distribuye como pesos en formato safetensors para PyTorch, con un tokenizador basado en tiktoken. No es un modelo ajustado para instrucciones ni para dialogo: es un checkpoint de preentrenamiento orientado a generacion de texto y a la evaluacion comparativa de arquitecturas.

Su relevancia es fundamentalmente de investigacion: sirve como referencia reproducible para estudiar el efecto de distintas decisiones arquitectonicas bajo un mismo presupuesto de computo y datos, y para medir rendimiento en tareas de modelado de lenguaje mediante metricas como bits per byte (BPB) y el benchmark CORE-22. No esta pensado como modelo de produccion ni como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), variante SSSL del proyecto NextTransformer |
| Parametros totales | 1.384.122.122 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), tokenizador tiktoken en JSON |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 1.384.122.122 parametros con una ventana de contexto de 2.048 tokens. La variante SSSL se enmarca en una comparativa de arquitecturas del proyecto NextTransformer, en la que distintos disenos se entrenan bajo el mismo presupuesto de 49.152 millones de tokens (de ahi el "49B" del nombre del repositorio, que se refiere a tokens de entrenamiento, no a parametros). El checkpoint final corresponde a 46.875 actualizaciones de entrenamiento sobre el dataset ClimbMix.

No se dispone de informacion detallada sobre la composicion del dataset, el uso de RLHF, DPO u otras fases de alineacion, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.) mas alla de la propia variante arquitectonica SSSL. El codigo de referencia y la configuracion exacta estan publicados en el repositorio de GitHub del proyecto, que es la fuente autorizada para reproducir la arquitectura.

## Capacidades

- Generacion de texto autoregresiva: modelo causal-lm de preentrenamiento, capaz de continuar texto y calcular verosimilitudes.
- Modelado de lenguaje y evaluacion: disenado para medir BPB y rendimiento en CORE-22.
- Tokenizacion compatible con tiktoken, con tokens especiales como `<|bos|>`.
- No dispone de ajuste por instrucciones ni por dialogo segun la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion comparativa de arquitecturas: usar el checkpoint como referencia SSSL en experimentos que comparen variantes de arquitectura bajo el mismo presupuesto de 49.152 millones de tokens, midiendo BPB y CORE-22 con el codigo del repositorio.
- Reproduccion de resultados: cargar los pesos con la version exacta de `nexttransformer` indicada en la model card para replicar las evaluaciones publicadas (BPB 0.6671 y CORE-22 33.78).
- Analisis de curvas de escalado: comparar el rendimiento de este checkpoint con otros de la misma familia para estudiar el efecto de la secuencia de longitudes de contexto ("short, short, short, long").
- Generacion de texto controlada en laboratorio: usar el modelo para estudiar distribuciones de siguiente token y comportamiento de la cabeza de lenguaje en prompts cortos, dado su contexto de 2.048 tokens.
- Docencia y formacion: ejemplo practico de carga de pesos safetensors, tokenizador tiktoken y ejecucion de inferencia en CPU con PyTorch.
- Base para ajuste fino experimental: punto de partida para experimentos de fine-tuning en tareas concretas, siempre que se respete la licencia (no disponible) y se asuma el contexto limitado.

## Benchmarks y rendimiento

| Evaluacion final | Resultado |
|---|---:|
| Validation BPB | 0.6671 |
| CORE-22 (x100) | 33.78 |

No se han publicado en la informacion disponible resultados desagregados por tarea (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 5,5 GB solo para pesos (1.384.122.122 parametros x 4 bytes), mas memoria para activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 2,8 GB para pesos, mas overhead.
- Cabe en GPUs de consumo: si, en tarjetas con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) en fp16, y en CPU para pruebas puntuales.
- GPU recomendadas para uso comodo: RTX 4090, A100, H100 si se busca throughput alto o lotes grandes.
- Opciones de despliegue: la model card solo documenta inferencia con PyTorch y la implementacion `nexttransformer`; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| NextTransformer SSSL | 1.384.122.122 | 2.048 | no disponible | Hugging Face (safetensors) |
| Alternativas de ~1,4B | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada, por lo que no es posible establecer una comparativa numerica fiable.

## Limitaciones y advertencias

- Modelo de preentrenamiento sin alineacion: no esta ajustado para instrucciones, dialogo ni uso como asistente; puede generar contenido incoherente o inapropiado.
- Riesgo de alucinacion: alto en tareas de respuesta factual, al no haber pasado por fases de RLHF o DPO conocidas.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingue.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Sesgos: no documentados; al entrenarse sobre ClimbMix, puede heredar sesgos del corpus.
- Sin soporte confirmado en runtimes de inferencia habituales (vLLM, llama.cpp, Ollama), lo que limita su despliegue optimizado.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/SSSL-49B-Tokens
- Repositorio GitHub (arquitectura): https://github.com/Interactive-Active-AI/NextTransformer/blob/2358425b56ce6a320fc042f67fd0a32294b5e0d7/results/methods/sssl.json
- Registro de ejecucion: https://github.com/Interactive-Active-AI/NextTransformer/blob/2358425b56ce6a320fc042f67fd0a32294b5e0d7/results/runs/sssl.json
- Repositorio principal: https://github.com/Interactive-Active-AI/NextTransformer
