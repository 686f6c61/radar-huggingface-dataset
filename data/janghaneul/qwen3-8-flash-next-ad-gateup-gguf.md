# janghaneul/Qwen3.8-Flash-Next-AD-gateup-GGUF

## Resumen

Qwen3.8-Flash-Next-AD-gateup-GGUF es una cuantización GGUF de tercera parte del modelo Qwen3.8-Flash-Next, publicada por el usuario janghaneul. No se trata de un modelo nuevo, sino de una reconstrucción manual de dos variantes de cuantización derivadas de la receta `AD-5.00bpw-Q5_K_M` de AtomicChat, orientadas a inferencia local de un modelo MoE de gran tamaño. El modelo base lo desarrolla Qwen (Alibaba) y aquí aparece únicamente como origen de los pesos; el trabajo de este repositorio es la selección de tipos de cuantización por tensor.

El modelo base es un transformer MoE de aproximadamente 177.000 millones de parámetros totales, con atención, capas GDN (`ssm_out`), expertos compartidos, embeddings y una tabla n-gram PLE (`per_layer_token_embd`) que se mantiene en Q8_0. La propuesta de estas builds es concentrar los bits en los expertos enrutados de `ffn_gate_exps` y `ffn_up_exps`, que según el autor es el grupo que determina la calidad en este modelo, dejando el resto de tensores en tipos fijos.

La relevancia es práctica: ofrece dos configuraciones con huella de RAM distinta (68,37 GiB y 60,90 GiB con la tabla PLE en streaming) para poder ejecutar un MoE de 177B en hardware local con llama.cpp o el motor Strata, manteniendo contexto de hasta 262.144 tokens con KV en int8. El repositorio ocupa 194,1 GB e incluye el adaptador de visión en F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención, capas GDN (`ssm_out`) y tabla n-gram PLE por capa |
| Parametros totales | 176.943.899.520 (aprox. 177B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuración de ejecución indicada por el autor) |
| Tipos de cuantizacion | Q4_K, IQ3_S, IQ4_NL, Q8_0, F32/F16 (mezcla por grupo de tensores) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en la model card) |
| Formato de pesos | GGUF (split en 3 shards por build) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 177B parámetros totales. La model card de esta cuantización describe varios componentes estructurales: tensores de atención (`attn_qkv`, `attn_gate`), capas GDN con `ssm_out`, expertos compartidos, embeddings de tokens y de salida, un router con normas e indexer, y una tabla `per_layer_token_embd` que implementa un mecanismo n-gram PLE (probablemente *per-layer embeddings* o *positional layer embeddings*, la model card no lo desarrolla). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo original de Qwen y no aparecen en la información proporcionada.

La innovación de este repositorio no está en el entrenamiento, sino en la cuantización por grupos de tensores. Ambas builds parten de la receta `AD-5.00bpw-Q5_K_M` y modifican únicamente los expertos enrutados de gate/up: la build `Q4_K-Q4_K` usa Q4_K en las 96 matrices de gate/up (5,7788 bpw, 4,6715 bpw excluyendo PLE), mientras que `IQ3_S-Q4_K` mantiene Q4_K solo en las capas 0–3 y 40–47 y aplica IQ3_S en las capas 4–39 (5,4162 bpw, 4,1605 bpw excluyendo PLE). Los expertos down se quedan en IQ4_NL porque `moe_intermediate_size=640` no es divisible por 256 y los tipos de bloque 256 caen silenciosamente a otros formatos. La tabla PLE se mantiene en Q8_0 (50,66 GiB en disco) porque el autor afirma que cuantizarla por debajo de ~5 bpw degrada el comportamiento de recuperación. El resto de tensores no expertos (atención, GDN, embeddings, expertos compartidos) va en Q8_0, unos 5,1 GiB en total.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.8-Flash-Next; no se detallan en la información disponible.
- Procesamiento de visión: el repositorio incluye el adaptador `mmproj-Qwen3.8-Flash-Next-F16.gguf`, byte a byte idéntico al del repositorio upstream de AtomicChat, por lo que el modelo puede ejecutarse con entrada multimodal de imagen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están listados.
- Contexto largo: la configuración de ejecución recomendada admite hasta 262.144 tokens con KV en int8.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE de 177B en estaciones de trabajo: con la build `IQ3_S-Q4_K` y la tabla PLE en streaming desde SSD, el modelo reside en unos 60,90 GiB de RAM, lo que permite ejecutarlo en máquinas de 94 GiB de RAM sin GPU de datacenter.
- Despliegue con contexto largo: la configuración `--max-context 262144 --kv int8` permite procesar documentos extensos, bases de código completas o conversaciones multi-turno muy largas en un solo contexto.
- Procesamiento de documentos con imagen: gracias al adaptador `mmproj` incluido, se puede usar para tareas de visión-lenguaje como descripción de imágenes o extracción de información de capturas y PDFs renderizados.
- Servicio conversacional autoalojado: el tag `conversational` y el formato GGUF permiten montar un endpoint de chat con llama.cpp o Strata sin depender de APIs externas.
- Experimentación con cuantización selectiva: el repositorio sirve como referencia reproducible para estudiar el impacto de asignar más bits a gate/up frente a down experts en un MoE grande, ya que la model card documenta la composición byte a byte.
- Integración en pipelines de evaluación de cuantizaciones: al ser dos builds con la misma receta base y distinto presupuesto de bits, permiten comparar calidad frente a RAM en tareas internas de recuperación y generación.
- Reutilización de shards: si ya se dispone de otra build M64 de AtomicChat, el shard 3 (tabla PLE) es intercambiable, lo que facilita montar entornos de prueba sin descargar 54,40 GB adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ejecutaron benchmarks de inferencia ni de calidad sobre estas builds exactas, y que las afirmaciones de composición y equivalencia byte a byte están verificadas contra los ficheros, pero no acompañadas de métricas de rendimiento.

## Requisitos de hardware

- VRAM/RAM estimada: la build `Q4_K-Q4_K` requiere 68,37 GiB residentes con la tabla PLE en streaming; la build `IQ3_S-Q4_K` requiere 60,90 GiB en las mismas condiciones. El tamaño total en disco es de 119,05 GiB y 111,58 GiB respectivamente.
- Memoria del sistema: el autor recomienda unos 94 GiB de RAM para ejecutar la tabla PLE desde SSD.
- GPU recomendadas: no disponible en la información proporcionada. El autor no especifica modelos de GPU; el enfoque es inferencia local con expertos residentes en memoria del sistema y PLE en streaming.
- ¿Cabe en GPU de consumo? No disponible. Por el volumen de memoria (más de 60 GiB residentes), no cabe en GPU de consumo de 24 GB o menos sin offloading agresivo a RAM.
- Opciones de despliegue: motor Strata (`strata --serve` con `--ple-io direct --resident-experts --max-context 262144 --kv int8`) y llama.cpp estándar cargando el shard 1. También es compatible con endpoints según el tag `endpoints_compatible`.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| janghaneul/Qwen3.8-Flash-Next-AD-gateup-GGUF (`Q4_K-Q4_K`) | ~177B (MoE) | 262.144 | 5,7788 bpw, 68,37 GiB residentes | qwen-community-1.0 | GGUF, 3 shards |
| janghaneul/Qwen3.8-Flash-Next-AD-gateup-GGUF (`IQ3_S-Q4_K`) | ~177B (MoE) | 262.144 | 5,4162 bpw, 60,90 GiB residentes | qwen-community-1.0 | GGUF, 3 shards |
| AtomicChat/Qwen3.8-Flash-Next-GGUF (`AD-5.00bpw-Q5_K_M`) | ~177B (MoE) | no disponible | 5,00 bpw, gate/up en IQ2_S/IQ3_S | qwen-community-1.0 | GGUF |
| Qwen/Qwen3.8-Flash-Next | ~177B (MoE) | no disponible | BF16 | qwen-community-1.0 | safetensors (modelo original) |

La comparativa se limita a variantes del mismo modelo base, ya que la información disponible no incluye otros MoE de tamaño comparable con los que contrastar parámetros, contexto y licencia de forma fiable.

## Limitaciones y advertencias

- No se han ejecutado benchmarks de calidad ni de inferencia sobre estas builds concretas; el autor lo declara explícitamente. Las afirmaciones sobre calidad se basan en pruebas internas no publicadas.
- La build `IQ3_S-Q4_K` usa IQ3_S en las capas 4–39, lo que reduce el presupuesto de bits de los expertos intermedios y puede degradar la calidad frente a `Q4_K-Q4_K`; el autor la recomienda solo cuando la RAM es limitada.
- La tabla PLE en Q8_0 ocupa 50,66 GiB de disco; si se sustituye por shards n-gram más pequeños (35,8 GiB), se sacrifica calidad de recuperación.
- Los expertos down están fijados en IQ4_NL por una limitación de forma (`moe_intermediate_size=640` no divisible por 256), lo que impide usar tipos de bloque 256 en ese grupo.
- Sesgos conocidos: no disponible; no se documentan en la información proporcionada.
- Riesgo de alucinación: no cuantificado; no hay evaluaciones publicadas para estas builds.
- Idiomas soportados: no disponible; no se lista el conjunto de lenguas del modelo base.
- Licencia: `qwen-community-1.0`, etiquetada como `other`. Es necesario revisar los términos del enlace de licencia del modelo base antes de uso comercial; la model card no aclara restricciones adicionales para estas cuantizaciones derivadas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento.
- El shard 3 de ambas builds es idéntico byte a byte (sha256 `290aab43…`), lo que duplica 54,40 GB en el repositorio; conviene descargar solo el conjunto necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/janghaneul/Qwen3.8-Flash-Next-AD-gateup-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio de cuantizaciones de referencia (AtomicChat): https://huggingface.co/AtomicChat/Qwen3.8-Flash-Next-GGUF
- Fuente BF16 usada para la cuantización (unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
