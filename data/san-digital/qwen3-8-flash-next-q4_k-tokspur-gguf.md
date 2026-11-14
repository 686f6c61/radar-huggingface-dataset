# san-digital/Qwen3.8-Flash-Next-Q4_K-Tokspur-GGUF

## Resumen

Qwen3.8-Flash-Next-Q4_K-Tokspur-GGUF es una distribucion cuantizada y empaquetada de los pesos de Qwen/Qwen3.8-Flash-Next, publicada por el usuario san-digital. El modelo base es un transformer MoE (Mezcla de Expertos) de Qwen con aproximadamente 51.835.944.960 parametros totales, segun los datos reales de safetensors del repositorio. Esta version concreta no es un GGUF convencional: emplea el formato propietario Tokspur Planar Pack v3, disenado especificamente para ejecutarse en Macs con Apple Silicon y 128 GB o mas de memoria unificada mediante el runtime Tokspur 0.3.0.

El problema que resuelve es el coste de almacenamiento y el tiempo de preparacion de las distribuciones GGUF divididas tradicionales. En lugar de descargar shards de GPU en bruto y reconstruir una cache local de unos 80 GiB en el primer arranque, el repositorio entrega el pack planar ya construido (80,00 GiB), una base GGUF con las embeddings residentes en host (27,46 GiB) y una cabeza especulativa MTP compartida (2,60 GiB), sumando 110,05 GiB de descarga total sin espacio adicional de empaquetado. La herramienta `tokspur adopt` verifica los digests SHA-256 y adopta los ficheros en su sitio.

Es relevante ahora porque demuestra una via de despliegue de un MoE de gran tamano en hardware de consumo de gama alta (Apple Silicon) con decodificacion especulativa integrada y verificacion criptografica por tensor, algo poco habitual en el ecosistema GGUF. La licencia es la Qwen Community License 1.0, con requisitos de atribucion y licencia separada para ofertas comerciales tipo Model as a Service.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion lineal GDN y cabeza MTP (segun los tensores descritos en la model card) |
| Parametros totales | 51.835.944.960 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K, Q5_K, Q5_1, Q8_0, IQ4_NL, BF16, F32 (mezcla por tipo de tensor) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF propietario Tokspur Planar Pack v3 (no compatible con llama.cpp estandar) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con capas de atencion lineal GDN (Gated Delta Network, segun la nomenclatura de los tensores `GDN linear-attention` de la model card) combinadas con atencion convencional, y proyecciones de expertos enrutados de tipo MoE. La cabeza MTP (Multi-Token Prediction) ocupa la capa 48 y actua como borrador especulativo compartido para decodificacion especulativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card del cuantizador no los detalla y la del modelo base no se ha proporcionado.

La innovacion tecnica de esta distribucion es el empaquetado planar: los tensores de expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) se reorganizan en bloques `I8` co-localizados gate/up y down para ejecucion eficiente en Metal y NAX de Apple Silicon. Los pesos de atencion, expertos compartidos, router, proyeccion PLE y cabeza de salida se mantienen en Q8_0, BF16 o F32, incluyendo los pesos de decaimiento de espacio de estados `-exp(a_log)` convertidos de binary64 a binary32. El pack incluye un manifiesto con SHA-256 por tensor verificado antes de la ejecucion. La tabla de embeddings por capa (`per_layer_token_embd.weight`, IQ4_NL) reside en memoria unificada del host y se recolecta de forma asincrona.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`, tag `conversational`) y la plantilla de chat de Qwen incluida.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.8-Flash-Next, aunque no se detallan en la informacion disponible.
- Decodificacion especulativa mediante cabeza MTP compartida en Q8_0, que acelera la generacion token a token.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas y el vocabulario BPE tiene 248.320 tokens con 247.587 merges.
- Capacidad especial: verificacion de integridad por tensor mediante digests SHA-256 embebidos en el manifiesto del pack.

## Casos de uso

- Inferencia local en Mac de gama alta: el pack esta disenado para Macs con 128 GB o mas de memoria unificada, de modo que un MoE de ~51,8 mil millones de parametros puede servirse en local mediante `tokspur serve --speed-preset` sin GPU dedicada.
- Prototipado de asistentes conversacionales en estacion de trabajo: la plantilla de chat de Qwen incluida y el pipeline conversacional permiten montar un endpoint compatible con la API de chat en una sola maquina Apple Silicon.
- Evaluacion de tecnicas de cuantizacion: investigadores pueden comparar el pack planar Q4_K frente a la referencia UD-Q4_K_XL usando las metricas de perplejidad y divergencia KL publicadas, con correlacion por chunk del 98,18%.
- Despliegue con requisitos de integridad: el manifiesto con SHA-256 por tensor y el sellado read-only (`0444`) del pack permiten entornos donde se exige verificacion criptografica de los pesos antes de ejecutar.
- Aceleracion de generacion con decodificacion especulativa: la cabeza MTP compartida en Q8_0 puede usarse como borrador para reducir el numero de pasos de decodificacion en tareas de generacion larga.
- Reproduccion de recetas de cuantizacion: el repositorio documenta la receta `tokspur-pack-v3` con 1.254 tensores y los tipos por grupo (94 Q4_K, 2 Q5_K, 43 Q5_1 en expertos enrutados), util para validar pipelines de cuantizacion propios.

## Benchmarks y rendimiento

La model card solo publica metricas de calidad de cuantizacion (perplejidad con `llama-perplexity`, 32 chunks de 2.048 tokens, comparacion pareada de logits contra la referencia UD-Q4_K_XL). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Valor |
|---|---|
| PPL(Q) media (Tokspur Q4_K) | 4,539204 ± 0,066090 |
| PPL(base) media (referencia UD-Q4_K_XL) | 4,564891 ± 0,066115 |
| Diferencia pareada PPL(Q) - PPL(base) | -0,025687 ± 0,012622 |
| ln(PPL(Q) / PPL(base)) pareado | -0,005643 ± 0,002774 (correlacion por chunk 98,18%) |
| Divergencia KL media | 0,079720 ± 0,001575 (mediana 0,008645) |
| Acuerdo top-1 de token | 90,518% ± 0,162% |

## Requisitos de hardware

- Memoria unificada: 128 GB o mas en Mac con Apple Silicon, requisito explicito de la model card.
- Huella en disco: 110,05 GiB de descarga total (118.162.786.656 bytes), sin espacio adicional de empaquetado.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este pack; el formato Tokspur Planar Pack v3 esta orientado a Metal/NAX de Apple Silicon.
- Despliegue: exclusivamente mediante el runtime Tokspur 0.3.0 o superior (`tokspur adopt`, `tokspur configure`, `tokspur serve`). No es compatible con llama.cpp, Ollama, vLLM ni TGI en su formato actual.
- Latencia y throughput: no disponibles; la model card no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Q4_K-Tokspur-GGUF (este) | 51.835.944.960 | no disponible | Tokspur Planar Pack v3 | Qwen Community License 1.0 | Apple Silicon, 128 GB+ |
| Qwen/Qwen3.8-Flash-Next (base, BF16) | 51.835.944.960 | no disponible | safetensors (131 shards BF16/I64) | Qwen Community License 1.0 | GPU con VRAM suficiente |
| Referencia UD-Q4_K_XL | no disponible | no disponible | GGUF | no disponible | no disponible |

No se dispone de datos de benchmarks de tareas ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime Tokspur 0.3.0 o superior; el pack no es un GGUF estandar y no puede cargarse en llama.cpp, Ollama, vLLM ni TGI.
- Requiere Apple Silicon con 128 GB o mas de memoria unificada; queda fuera de cualquier GPU NVIDIA o AMD.
- La licencia Qwen Community License 1.0 exige revision de la Seccion 1 (atribucion por encima de umbrales de escala comercial) y de la Seccion 2 (licencia separada para ofrecer el modelo como servicio o como asistente de trabajo con IA) antes de un despliegue comercial.
- No se declaran idiomas soportados ni longitud de contexto en la informacion disponible; no se pueden garantizar capacidades multilingues ni ventanas largas sin consultar la model card del modelo base.
- No hay datos publicados de sesgos, tasa de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- El repositorio tiene solo 89 descargas y 2 likes en el momento de la consulta, por lo que la validacion comunitaria es muy limitada.
- La model card no detalla el numero de parametros activos del MoE ni el regimen de entrenamiento, lo que dificulta estimar coste de inferencia por token.
- El resultado de busqueda web proporcionado (cotizacion de Sanofi) no guarda relacion con el modelo y se descarta como fuente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/san-digital/Qwen3.8-Flash-Next-Q4_K-Tokspur-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Revision del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/34567a4712bc9766c4449e2e98e4468bfa24d915
- Licencia (referenciada en el repo): LICENSE y NOTICE en el repositorio de Hugging Face
- Paper, blog, repositorio de codigo o demo de Tokspur: no disponibles en la informacion proporcionada
