# Grawnch/Qwen3.8-Flash-Next-3.5bpw-GGUF

## Resumen

Qwen3.8-Flash-Next-3.5bpw-GGUF es una cuantizacion GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch. Se trata de una compresion a 3,5 bits por peso (bpw efectivo) del modelo original de aproximadamente 177.000 millones de parametros, orientada a su ejecucion directa en llama.cpp sin necesidad de decodificadores personalizados ni parches. El repositorio ocupa 83,8 GB y se distribuye en dos shards: uno de 55,05 GB destinado a VRAM de GPU y otro de 28,80 GB pensado para memoria de host mediante mmap.

El modelo base emplea una arquitectura hibrida con 48 capas que combinan Gated DeltaNet (GDN) y atencion completa, un esquema MoE con 512 expertos enrutados mas 1 experto compartido, hyper-connections 4x y una tabla de embeddings N-gram por capa en la primera capa. Esta cuantizacion resulta relevante porque permite desplegar un modelo de casi 180.000 millones de parametros en hardware que no dispone de suficiente VRAM para los pesos en BF16, manteniendo una fidelidad de logits alta segun las metricas reportadas por el autor.

La licencia es Apache 2.0, heredada del modelo base, y el formato es GGUF compatible con la arquitectura `qwen4exp` de llama.cpp. No se dispone de informacion sobre idiomas soportados ni sobre la pipeline declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con 48 capas GDN + atencion completa, 4x hyper-connections, N-gram per-layer embedding en capa 1 |
| Parametros totales | 176.943.899.520 (aproximadamente 177.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (el ejemplo de uso emplea `-c 32768`) |
| Tipos de cuantizacion | Q3_K, Q4_0, Q2_0, Q6_K, Q8_0, BF16, F32 (mezcla por tensor, 3,51 bpw efectivo en el shard principal) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2 shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer hibrido con 48 capas que alternan mecanismos de Gated DeltaNet (una forma de atencion lineal con estado recurrente) y atencion completa. La capa MoE incorpora 512 expertos enrutados y 1 experto compartido, con un router por capa. Ademas, utiliza hyper-connections 4x y una tabla de embeddings N-gram por capa asociada a la primera capa, lo que constituye una innovacion poco habitual orientada a mejorar la representacion de tokens. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion de Grawnch aplica una asignacion de precision no uniforme por tipo de tensor: la cabeza de salida y las proyecciones lineales de atencion y SSM se mantienen en Q6_K; los expertos compartidos y los mezcladores de hyper-connection en Q8_0; los embeddings de tokens y los `down_exps` enrutados de 16 de las 48 capas (incluidas todas las anclas de atencion completa) en Q4_0; las puertas y proyecciones `up_exps` enrutadas en Q3_K; el resto de `down_exps` enrutados en Q2_0; y normas, puertas del router, puertas compartidas y vectores A/bias del SSM en F32 o BF16. La tabla de embeddings N-gram de la capa 1 se cuantiza en Q4_0 y se ubica en el segundo shard, destinado a RAM del host.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta disenado para tareas de razonamiento y dispone de modo de pensamiento (`<think>`) segun la evaluacion del autor.
- Generacion de codigo y matematicas: la evaluacion incluye un conjunto propio de matematicas y codigo, lo que sugiere capacidad para estas tareas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales: arquitectura MoE con expertos enrutados, atencion hibrida (GDN + atencion completa) y N-gram per-layer embedding. No se confirma vision ni audio.

## Casos de uso

- Despliegue local de un modelo de gran escala en hardware con VRAM limitada: gracias a la distribucion en dos shards, el shard principal de 55,05 GB puede residir en GPU y el de 28,80 GB en RAM del host mediante mmap, lo que permite ejecutar un modelo de 177.000 millones de parametros en una sola GPU de 80 GB mas memoria del sistema.
- Inferencia con llama.cpp en entornos sin acceso a frameworks propietarios: el uso de formatos ggml estandar (Q3_K, Q4_0, Q2_0, Q6_K, Q8_0, BF16, F32) permite ejecutar directamente con `llama-cli` o `llama-server` sin decodificadores personalizados.
- Servicio de generacion de texto con contexto moderado: el ejemplo de la model card emplea `-c 32768`, por lo que es adecuado para tareas que requieran ventanas de hasta 32.000 tokens.
- Razonamiento y generacion de codigo en local: la evaluacion del autor sobre un conjunto de matematicas y codigo con `<think>` sugiere uso en tareas de razonamiento estructurado.
- Experimentacion e investigacion: al ser una cuantizacion de 3,5 bpw con metricas de fidelidad de logits publicadas, sirve para estudiar el impacto de la cuantizacion en modelos MoE hibridos.
- Prototipado de asistentes conversacionales: el modelo puede integrarse en `llama-server` para exponer una API compatible con endpoints, segun la etiqueta `endpoints_compatible` del repositorio.

## Benchmarks y rendimiento

El autor publica una evaluacion de fidelidad de logits entre el modelo BF16 y la cuantizacion, sobre el vocabulario completo de 248.320 tokens:

| Suite de evaluacion | PPL BF16 | PPL 3.5bpw (delta) | KLD media | KLD mediana | JSD media | Top-1 match | Top-5 en BF16 | CosSim final |
|---|---|---|---|---|---|---|---|---|
| Self-Gen Math/Code (`<think>`) | 5,437 | 5,521 (+0,084) | 0,10509 | 0,04360 | 0,02348 | 87,98% | 98,83% | 0,952932 |
| External Held-Out (2048) | 11,142 | 10,134 (-1,007) | 0,15463 | 0,08019 | 0,03315 | 84,22% | 98,73% | 0,949186 |
| WikiText-2 (4x2048) | 2,156 | 2,402 (+0,245) | 0,32467 | 0,02330 | 0,05923 | 85,14% | 97,29% | 0,890650 |
| WikiText-2 (4x1024) | 2,320 | 2,599 (+0,280) | 0,34798 | 0,02854 | 0,06393 | 83,77% | 97,02% | 0,888777 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el shard principal ocupa 55,05 GB (51,27 GiB) y debe residir en VRAM; el segundo shard ocupa 28,80 GB (26,82 GiB) y puede mapearse en RAM del host.
- GPU recomendadas: una GPU con al menos 56-64 GB de VRAM para el shard principal, como A100 80 GB, H100 80 GB o similares. No cabe en GPUs de consumo como RTX 4090 (24 GB) ni RTX 3090 (24 GB) sin offloading adicional.
- Memoria del sistema: se recomienda al menos 32 GB de RAM para el shard secundario mapeado, mas margen para el contexto y el resto de estructuras.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con la arquitectura `qwen4exp`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-3.5bpw-GGUF (este) | ~177.000 M | no disponible | GGUF 2 shards | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (base) | ~177.000 M | no disponible | safetensors | Apache 2.0 | Hugging Face |
| Otras cuantizaciones GGUF del mismo base | no disponible | no disponible | GGUF | Apache 2.0 | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce degradacion respecto a BF16: el delta de perplejidad es de +0,084 en Math/Code, +0,245 y +0,280 en WikiText-2, y la similitud coseno final baja hasta 0,888 en WikiText-2 (4x1024).
- El Top-1 match se situa entre el 83,77% y el 87,98%, lo que implica que entre el 12% y el 16% de las predicciones principales difieren del modelo BF16.
- La tabla de embeddings N-gram de la capa 1 se ubica en RAM del host, lo que puede aumentar la latencia si el ancho de banda entre CPU y GPU es limitado.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion, limitaciones de contexto o de idioma del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.8-Flash-Next.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria disponible.
- No se confirma soporte de tool calling, agentes ni capacidades multimodales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-3.5bpw-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
