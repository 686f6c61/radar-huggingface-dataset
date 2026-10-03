# Livesport/clef-flash-GGUF

## Resumen

Clef-Flash GGUF es la version cuantizada para llama.cpp de Cloudflare/clef-flash, un modelo de decision de 8.953.803.264 parametros (aproximadamente 9B) construido sobre un backbone Qwen3.5-9B al que se le acopla una cabeza de esquema conjunta (joint schema head). No es un modelo generativo: no produce texto. Su cabeza lee el estado oculto final de cada token del backbone y puntua, en una sola pasada forward, cada opcion permitida de cada pregunta de una peticion. El repositorio lo mantiene Livesport, que lo ejecuta en produccion sobre una unica GPU Quadro RTX 4000 (Turing, 8 GB).

La relevancia de esta publicacion es eminentemente de ingenieria: demuestra que un clasificador-decision de 9B puede servirse en 8 GB de VRAM si se cuantiza con criterio para esa tarea concreta. La receta reparte los bits de forma asimetrica: el backbone se guarda en Q5_K_M con overrides por tensor (gates SSM en F32, atencion completa y salidas SSM en Q8_0, embeddings de token en Q8_0 fuera de la GPU), mientras que la LM head (`output.weight`) se degrada deliberadamente a Q2_K porque su logits nunca se usan. El resultado para el fichero Q5_K_M-dyn son 5,57 GB en GPU mas 1,08 GB de embeddings que quedan en RAM del host.

El modelo base esta bajo licencia Apache-2.0 y soporta ingles y checo. El pipeline declarado es text-classification y el formato es GGUF compatible con llama.cpp, con las cabezas auxiliares en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5-9B (capas de atencion lineal con gated delta net y capas de atencion completa) mas joint schema head no generativa. Modelo de decision, no de generacion de texto |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la importance matrix se genero a contexto 2048 |
| Tipos de cuantizacion | Q5_K_M-dyn (base Q5_K_M con overrides por tensor), Q8_0-dyn (base Q8_0), F32 para `ssm_alpha`/`ssm_beta`, Q8_0 para atencion completa y `token_embd`, Q6_K para `ssm_out` en capas de atencion lineal intermedias, Q2_K para `output` (LM head, sin uso) |
| Idiomas soportados | en, cs (ingles y checo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) para el backbone; safetensors para `lm_head_f16.safetensors` [248320, 4096] y `joint_head.safetensors` |

## Arquitectura y entrenamiento

El backbone es Qwen3.5-9B, convertido desde los pesos bf16 originales mediante `convert_hf_to_gguf.py` con `--no-mtp` y mapeando `Qwen3_5ForConditionalGeneration` al modelo de texto. La arquitectura combina capas de atencion lineal recurrente con puertas (gated delta net, con tensores `ssm_alpha`, `ssm_beta` y `ssm_out`) y capas de atencion completa (`attn_q`, `attn_k`, `attn_v`, `attn_output`). Sobre este backbone se monta una joint schema head que no decodifica texto: consume el estado oculto final tras la normalizacion final, de forma `[n_tokens, 4096]`, y emite un logit por opcion, que se normaliza con softmax. El modelo no genera texto en ningun caso y la LM head del backbone se conserva unicamente por compatibilidad de formato.

El proceso de cuantizacion uso una importance matrix construida con 1,5 millones de tokens a contexto 2048, todos ellos renderizados en el formato de entrada propio de Clef (system prompt, `STATE`, `SCHEMA FIELDS` y opciones en JSON). Las fuentes de calibracion incluyen 5.018 registros de decision con una a tres preguntas de los tres tipos (`noul`, `choice`, `score`) en ingles y checo, estados provenientes de los splits de entrenamiento de BoolQ, AG News y SST-2, resumenes multiarticulo de AG News, noticias checas de CIIRC-NLP/czech_news_simple-cs y hynky/czech_news_dataset_v2, y el conjunto `calibration_datav3` de bartowski. Los overrides por tensor concentran bits en los elementos sensibles (gates SSM sin cuantizar, atencion y `ssm_out` en Q8_0/Q6_K) y en las capas primera y ultima (`ffn_up` 0-7, `attn_gate`, `attn_qkv`, `ffn_down` 0/27/31). No se documenta en la informacion disponible ninguna fase de RLHF o DPO, ni el volumen total de tokens de entrenamiento del modelo base.

## Capacidades

- Puntuacion de decisiones sobre opciones discretas: dado un estado y un esquema de pregunta, devuelve un logit por opcion permitida en una sola pasada forward.
- Tres tipos de pregunta soportados por el esquema: `noul`, `choice` y `score`.
- Procesamiento multilingue limitado a ingles y checo, con calibracion explicita en ambos idiomas.
- Compatibilidad con la API `/v1/systemone` estilo Jev/SystemOne, servida mediante llama.cpp.
- Extraccion de estados ocultos por token (`output_norm(h)`) a traves de la salida `nextn` de llama.cpp.
- No soporta generacion de texto, tool calling, function calling ni razonamiento multi-paso autonomo: la cabeza no es un decoder.
- No incluye torre de vision ni capas MTP en los GGUF publicados.

## Casos de uso

- Moderacion y clasificacion de contenido editorial: el modelo puntua opciones discretas sobre un estado textual (por ejemplo, articulos de noticias checas o inglesas) en una unica pasada, lo que permite integrarlo en pipelines de ingesta con latencia baja y sin generacion de texto.
- Enrutado de decisiones en sistemas de atencion al cliente: dada una conversacion o incidencia codificada como estado, el modelo selecciona entre opciones predefinidas (`choice`) o asigna una puntuacion (`score`) para dirigir el ticket al flujo correcto, sin riesgo de respuestas generadas libres.
- Etiquetado de datos a gran escala: al no generar texto y ser determinista (las respuestas para una misma peticion son identicas bit a bit independientemente de ejecuciones previas), es adecuado para anotar corpus de forma reproducible en ingles y checo.
- Control de calidad en pipelines de datos: uso de preguntas de tipo `noul` para validar si un estado cumple una condicion booleana antes de liberar un registro a produccion.
- Despliegue en hardware modesto on-premise: el fichero Q5_K_M-dyn ocupa 5,57 GB de VRAM, de modo que un servidor con una GPU de 8 GB puede servir el modelo en produccion, como hace Livesport en una Quadro RTX 4000.
- Sistemas de decision con requisitos de auditabilidad: al no existir texto generado y ser la salida un softmax sobre opciones declaradas en el esquema, la traza de decision es directamente inspeccionable y explicable.
- Servicio de clasificacion con cabezas personalizadas: al publicarse `joint_head.safetensors`, `joint_schema_model.py` y `lm_head_f16.safetensors` por separado, se puede reutilizar el backbone cuantizado manteniendo la cabeza en fp16 sobre GPU, siempre que la tokenizacion coincida exactamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares; el modelo tampoco es generativo, por lo que esas metricas no serian aplicables). El unico dato cuantitativo de calidad publicado es la divergencia KL de la cuantizacion:

| Version | Tamano del fichero | VRAM en GPU | Divergencia KL |
|---|---:|---:|---:|
| clef-flash-Q5_K_M-dyn.gguf | 6,66 GB | 5,57 GB (mas 1,08 GB de embeddings Q8_0 en RAM del host) | no disponible |
| clef-flash-Q8_0-dyn.gguf | 8,58 GB | 7,49 GB | 0,00017 (practicamente sin perdida) |

## Requisitos de hardware

- VRAM para Q5_K_M-dyn: 5,57 GB en GPU; los 1,08 GB de embeddings de token en Q8_0 permanecen en RAM del host, por lo que el consumo total del fichero es de 6,66 GB.
- VRAM para Q8_0-dyn: 7,49 GB en GPU, para equipos con 12 GB o mas. Requiere 8,58 GB de almacenamiento.
- Objetivo minimo verificado: una unica GPU de 8 GB. Livesport lo ejecuta en produccion sobre una Quadro RTX 4000 (Turing, 8 GB).
- Caveat de precision: Turing no soporta bf16, por lo que la joint schema head debe ejecutarse en fp16 (en los datos del autor, fp16 y fp32 producen las mismas decisiones que bf16).
- Memoria adicional: `lm_head_f16.safetensors` pesa 2,03 GB y debe mapearse en memoria y mantenerse fuera de la GPU, moviendo a la tarjeta unicamente las filas correspondientes a los `token_ids` de las opciones.
- Cabezas: `joint_head.safetensors` mas `joint_head_config.json` ocupan 244 MB.
- GPU de consumo compatibles: cualquier GPU con 8 GB o mas de VRAM que soporte las operaciones de llama.cpp para esta arquitectura; con 12 GB o mas se puede usar el fichero Q8_0-dyn.
- Despliegue: llama.cpp, probado con el commit `8212c78`. Es necesario usar la salida `nextn` (`llama_set_embeddings_nextn`) y no `embeddings = true`, que reservaria logits y aproximadamente 1 MB de RAM fijada del host por token. Se recomienda marcar solo el ultimo token de cada chunk como salida, con `n_batch` y `n_ubatch` a 512.
- La cabeza requiere torch para su ejecucion, ademas de llama.cpp para el backbone.
- No se documentan opciones de vLLM, Ollama o TGI para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles. Si se indica que cada peticion se calcula desde cero (`llama_memory_clear`) y que no hay estado que persista entre peticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | VRAM en GPU | Licencia | Notas |
|---|---|---:|---:|---|---|
| Livesport/clef-flash-GGUF | 8,95B | GGUF (backbone) mas safetensors (cabezas) | 5,57 GB (Q5_K_M-dyn) / 7,49 GB (Q8_0-dyn) | Apache-2.0 | Compatible con llama.cpp ya publicado; incluye receta de cuantizacion por tensor e importance matrix propia |
| Cloudflare/clef-flash | 8,95B | bf16 original | no disponible | Apache-2.0 | Modelo base; requiere hardware capaz de bf16 y mas VRAM |
| ggml-org/Clef-Flash-GGUF | 8,95B | GGUF (formato nativo `clef`) | no disponible | Apache-2.0 | Formato distinto; ligado al PR abierto de llama.cpp #29831 y al endpoint `/v1/systemone` |

No se dispone de modelos comparables de la misma categoria (clasificadores-decision con cabeza de esquema) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto. La LM head (`output.weight`) esta almacenada a proposito en Q2_K porque el pipeline de Clef nunca consume sus logits; usarla para generacion daria resultados invalidos.
- No soporta tool calling, function calling ni razonamiento multi-paso autonomo; no es un modelo de agentes.
- La tokenizacion debe coincidir exactamente con `joint_schema_model.py`; cualquier desviacion en el encoding de registros invalida las decisiones.
- Al reejecutar cada peticion desde cero, no hay reutilizacion de cache KV entre peticiones: el coste de computo es completo en cada llamada.
- Cobertura de idiomas limitada a ingles y checo; no hay datos de rendimiento fuera de esos dos idiomas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existen errores de clasificacion. No se publican tasas de error ni matrices de confusion, por lo que la fiabilidad por tipo de pregunta (`noul`, `choice`, `score`) es desconocida.
- Sesgos conocidos: no documentados en la informacion disponible. La calibracion depende en gran medida de los conjuntos citados (BoolQ, AG News, SST-2, noticias checas y `calibration_datav3`), lo que puede introducir sesgo hacia dominios periodisticos.
- La cuantizacion Q5_K_M-dyn no tiene divergencia KL publicada; solo se documenta la de Q8_0-dyn (0,00017).
- Turing no soporta bf16: la cabeza debe forzarse a fp16, un detalle de despliegue que puede romper en otras arquitecturas si no se gestiona.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se deben conservar los avisos de licencia y el fichero `LICENSE` del repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente de estos ficheros.
- El soporte nativo en llama.cpp para la arquitectura `clef` (PR #29831) esta abierto y sus GGUF son de un formato distinto; los ficheros de este repositorio funcionan con llama.cpp ya publicado y no con ese PR.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Livesport/clef-flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- GGUF con formato nativo de llama.cpp: https://huggingface.co/ggml-org/Clef-Flash-GGUF
- Commit de llama.cpp probado: https://github.com/ggml-org/llama.cpp/commit/8212c7802455255460ab8e18fc34754560031b34
- Pull request de soporte nativo de la arquitectura `clef`: https://github.com/ggml-org/llama.cpp/pull/29831
- Dataset de calibracion en checo: https://huggingface.co/datasets/CIIRC-NLP/czech_news_simple-cs
- Dataset de calibracion en checo: https://huggingface.co/datasets/hynky/czech_news_dataset_v2
- La busqueda web realizada no devolvio resultados relevantes ni enlaces adicionales utilizables sobre este modelo.
