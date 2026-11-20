# Livesport/clef-flash-GGUF

## Resumen

Clef-Flash es un modelo de decisión de 9B desarrollado por Cloudflare sobre el que Livesport publica una build GGUF optimizada para llama.cpp. No es un modelo generativo: su cabeza conjunta (joint schema head) lee el estado oculto final de cada token del backbone y puntúa, en una sola pasada forward, todas las opciones permitidas de cada pregunta de un esquema estructurado. El backbone es Qwen3.5-9B, con 8.953.803.264 parámetros totales, e incluye atención lineal con compuertas (gated delta net) junto a capas de atención completa.

La relevancia de esta build concreta es de despliegue: Livesport la ejecuta en producción en una única GPU Quadro RTX 4000 (Turing, 8 GB) sirviendo una API compatible con Jev/SystemOne (`/v1/systemone`). Para lograrlo, la cuantización prioriza el backbone (Q5_K_M con overrides por tensor) y degrada deliberadamente la LM head a Q2_K, ya que sus logits nunca se usan; la cabeza real se carga aparte en fp16 desde `lm_head_f16.safetensors`.

El modelo está pensado para clasificación y toma de decisiones sobre registros estructurados (preguntas de tipo `noul`, `choice` y `score`), no para generación de texto libre, y soporta inglés y checo. Se distribuye con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (atención lineal con compuertas gated delta net + capas de atención completa) con joint schema head; empaquetado GGUF para llama.cpp |
| Parametros totales | 8.953.803.264 (9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la imatrix se construyó a contexto 2048) |
| Tipos de cuantizacion | Q5_K_M con overrides por tensor (F32 en `ssm_alpha`/`ssm_beta`; Q8_0 en `ssm_out`, `attn_q/k/v/output`, `token_embd`; Q6_K en `ssm_out` de capas lineales intermedias; Q2_K en `output`/LM head) y variante Q8_0 |
| Idiomas soportados | en, cs |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) + safetensors fp16 para `lm_head` y `joint_head` |

## Arquitectura y entrenamiento

El backbone es Qwen3.5-9B, un transformer que combina capas de atención lineal con compuertas (gated delta net, con tensores `ssm_alpha`, `ssm_beta`, `ssm_out`) y capas de atención completa. Sobre él, Cloudflare añade una joint schema head que consume el estado oculto tras la normalización final, `output_norm(h)`, de todos los tokens, y produce un logit por cada opción de cada pregunta del esquema. La codificación de registros (tokenización, spans de pregunta y opción) vive en `joint_schema_model.py` y debe coincidir exactamente con la del modelo original.

La cuantización de Livesport se generó desde los pesos bf16 originales, convertidos con `convert_hf_to_gguf.py` (`--no-mtp`, mapeando `Qwen3_5ForConditionalGeneration` al modelo de texto). La importance matrix se construyó con 1,5 millones de tokens a contexto 2048, todos renderizados en el formato de entrada propio de Clef (system prompt, `STATE`, `SCHEMA FIELDS`, opciones en JSON), a partir de 5.018 registros de decisión en inglés y checo con estados procedentes de BoolQ, AG News y SST-2, digests multiartículo de AG News, noticias checas (CIIRC-NLP/czech_news_simple-cs, hynky/czech_news_dataset_v2) y `calibration_datav3` de bartowski. No se detallan en la información disponible los datos de preentrenamiento ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Clasificación y decisión estructurada: puntúa todas las opciones de todas las preguntas de un esquema en un único forward pass, con tipos `noul`, `choice` y `score`.
- Lectura de estados ocultos por token: expone `[n_tokens, 4096]` estados tras la normalización final, aptos para cabezas externas.
- Servicio de API compatible con Jev/SystemOne mediante el endpoint `/v1/systemone`.
- Determinismo: cada petición se recalcula desde cero (`llama_memory_clear`), de modo que la misma entrada produce respuestas idénticas bit a bit con independencia del historial previo.
- Multilingüe limitado a inglés y checo.
- No genera texto: la LM head está degradada a Q2_K y sus logits no se emplean.
- No incluye torre de visión ni capas MTP en los GGUF publicados.

## Casos de uso

- Moderación y enrutado de contenido: dado un texto de estado y un esquema de opciones, el modelo devuelve la categoría o decisión con una sola pasada, lo que permite clasificar en tiempo real dentro de un pipeline de ingestión de noticias deportivas.
- Extracción de decisiones sobre noticias checas e inglesas: con estados procedentes de fuentes como AG News o czech_news_dataset_v2, se pueden puntuar opciones de tipo `choice` para etiquetar artículos sin entrenar un clasificador ad hoc.
- Preguntas de verificación binaria (`noul`): evaluar si un estado cumple una condición definida en el esquema, útil para filtros de calidad o validación de datos antes de publicarlos.
- Puntuación graduada (`score`): asignar una puntuación a opciones dentro de un rango definido por el esquema, por ejemplo para priorizar colas de revisión editorial.
- Despliegue en hardware modesto: al caber en 8 GB de VRAM con la variante Q5_K_M (5,57 GB en GPU) y mantener embeddings Q8_0 en RAM del host, es viable en servidores con Quadro RTX 4000 o GPUs consumer de gama media.
- Servicio de decisiones de baja latencia: al no generar texto y requerir un solo forward pass por petición, encaja en servicios que necesitan respuestas deterministas y reproducibles para auditoría.
- Integración en llama.cpp existente: los ficheros funcionan con versiones publicadas de llama.cpp usando `llama_set_embeddings_nextn`, sin necesidad de esperar al PR nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de cuantización: la variante Q8_0 presenta una divergencia KL de 0,00017 respecto al modelo original, descrita como prácticamente sin pérdida. No se aportan cifras de MMLU, HumanEval, GSM8K ni de exactitud en tareas de decisión.

## Requisitos de hardware

- VRAM para Q5_K_M: 5,57 GB en GPU; 1,08 GB de embeddings de tokens en Q8_0 permanecen en RAM del host.
- VRAM para Q8_0: 7,49 GB en GPU, para tarjetas de 12 GB o más.
- La LM head fp16 (`lm_head_f16.safetensors`, 2,03 GB) se mapea en memoria y se mantiene fuera de la GPU; solo se transfieren las filas de los tokens de opción.
- La joint head (244 MB) se ejecuta en fp16 en GPU; en Turing, fp16 y fp32 producen las mismas decisiones que bf16.
- GPU validadas en producción: Quadro RTX 4000 (Turing, 8 GB). Cabe en GPUs consumer de 8 GB o más con la variante Q5_K_M.
- Despliegue mediante llama.cpp (probado con el commit `8212c78`), usando `llama_set_embeddings_nextn` y `embeddings = false`; no debe activarse `embeddings = true` por el coste de memoria del buffer de logits.
- El PR abierto de llama.cpp #29831 añade la arquitectura nativa `clef` con endpoint `/v1/systemone`, pero sus GGUF (ggml-org/Clef-Flash-GGUF) usan un formato distinto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Livesport/clef-flash-GGUF | 9B | no disponible | Decisión estructurada (clasificación por opciones) | Apache-2.0 | GGUF + safetensors |
| Cloudflare/clef-flash | 9B | no disponible | Decisión estructurada | Apache-2.0 | safetensors (bf16) |
| ggml-org/Clef-Flash-GGUF | 9B | no disponible | Decisión estructurada, arquitectura nativa `clef` | no disponible | GGUF (formato distinto) |

No se dispone de datos de benchmarks ni de alternativas de otros desarrolladores en la información proporcionada para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- No es un modelo generativo: usar los GGUF para generación de texto produce resultados sin sentido, ya que la LM head está en Q2_K y no se emplea.
- Idiomas limitados a inglés y checo; no hay soporte declarado para castellano.
- La tokenización debe coincidir exactamente con `joint_schema_model.py`; cualquier desviación invalida las decisiones.
- La decodificación debe marcar solo el último token de cada chunk como salida y copiar `llama_get_embeddings_nextn` tras cada chunk; un uso incorrecto de la API de llama.cpp degrada la memoria o los resultados.
- Turing no soporta bf16; hay que ejecutar la cabeza en fp16.
- El estado se limpia en cada petición, por lo que no hay caché de contexto entre solicitudes y el coste de prefill se paga completo cada vez.
- No se han publicado evaluaciones de sesgo, alucinación o robustez; al tratarse de un clasificador, el riesgo se traslada a decisiones incorrectas sobre opciones válidas, no a texto inventado.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Cloudflare/clef-flash y de los datasets de calibración citados.
- Los GGUF de este repositorio no son compatibles con el formato del PR nativo de llama.cpp; hay que elegir una de las dos rutas de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Livesport/clef-flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- GGUF alternativos (formato nativo): https://huggingface.co/ggml-org/Clef-Flash-GGUF
- Commit de llama.cpp probado: https://github.com/ggml-org/llama.cpp/commit/8212c7802455255460ab8e18fc34754560031b34
- PR de soporte nativo Clef en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29831
- Dataset checo de calibración: https://huggingface.co/datasets/CIIRC-NLP/czech_news_simple-cs
- Dataset checo de calibración: https://huggingface.co/datasets/hynky/czech_news_dataset_v2
