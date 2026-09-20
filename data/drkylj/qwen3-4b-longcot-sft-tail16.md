# drkylj/qwen3-4b-longcot-sft-tail16

## Resumen

Qwen3-4B long-CoT tail-16 es un ajuste fino (SFT) del modelo base Qwen/Qwen3-4B-Base, publicado por el usuario drkylj en HuggingFace. El modelo esta especializado en generacion de cadenas de razonamiento largas (long chain-of-thought) para matematicas y, de forma destacable, incorpora un mecanismo de compresion de la cache KV disenado para reducir el coste de memoria en contextos muy largos. Cuenta con 4.022.112.256 parametros totales y se distribuye bajo licencia Apache 2.0.

La innovacion principal no esta en los pesos sino en la ruta de servicio: cada bloque completado de 512 tokens del CoT se comprime en 128 filas de codigo aprendidas, a las que se anaden las 16 KVs crudas finales del bloque (retencion estatica de cola). Esto da 144 filas por bloque, una reduccion de 3,6:1 frente a la cache completa. El modelo fue entrenado sobre 2,0e9 tokens de respuesta de razonamiento matematico de cadena larga.

Es relevante ahora como artefacto de investigacion sobre eficiencia de inferencia en razonamiento extendido: demuestra que es posible comprimir la cache KV de forma aprendida en modelos de razonamiento long-CoT manteniendo cifras competitivas, a costa de depender de una ruta de servicio modificada. No obstante, es un experimento con cero descargas y cero likes en el momento de la ficha, y no funciona como un Qwen3 convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con extensiones de compresion de cache KV |
| Parametros totales | 4.022.112.256 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-4B opera con 32.768 tokens nativos, ampliables a 131.072 mediante YaRN |
| Tipos de cuantizacion | No disponible (pesos exportados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

Parametros adicionales de la configuracion de servicio (`compresslm_config.json`): `block_size` 512, `num_code_tokens` 128, `retain_tail_kv` 16, `retain_tail_policy` static, `code_positions` bitrev, `packed_kv` false.

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer denso de 4.000 millones de parametros. Sobre esa base se ha realizado un SFT orientado a razonamiento matematico long-CoT, con un total de 2,0e9 tokens de respuesta. La innovacion tecnica reside en la compresion de la cache KV: durante la generacion, cada bloque de 512 tokens ya completado de la cadena de pensamiento se comprime en 128 filas de codigo aprendidas, y ademas se retienen de forma permanente las 16 KVs crudas finales del bloque (cola estatica). En total, 144 filas por bloque, lo que supone una reduccion de 3,6:1 respecto a la cache completa.

La compresion no esta contenida unicamente en los pesos: vive en la ruta de servicio (emision de codigo por bloques, mascara de cuota de prefijo anidado y la cola estatica). Para reproducir las cifras publicadas es necesario el overlay CompressLM para vLLM, servido con backend `FLASHINFER` y el pin de prefill FA2. En sm90, el backend `auto` de FlashInfer resuelve a FA3 en el primer prefill, y FA3 no soporta mascaras personalizadas, por lo que el primer paso de codigo fallaria. Los pesos se exportaron en bf16 desde pesos maestros en fp32, reteniendo unicamente las primeras 128 filas de codigo (las filas por encima de la cuota entrenada nunca se atienden bajo cuotas de prefijo anidado, y la rejilla de inversion de bits de las primeras q filas es independiente de K).

## Capacidades

- Generacion de texto y razonamiento matematico mediante cadenas de pensamiento largas (long-CoT).
- Compresion aprendida de la cache KV por bloques de 512 tokens (128 filas de codigo + 16 KVs de cola estatica por bloque).
- Resolucion de problemas de competicion (AIME 2025, AIME 2026) y de referencia (MATH-500) con decodificacion por muestreo y greedy.
- Naturaleza conversacional segun las etiquetas del repo (`conversational`), heredada de la base Qwen3.
- Compatible con text-generation-inference y endpoints segun las etiquetas (`text-generation-inference`, `endpoints_compatible`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no documentado en la model card.
- Vision, audio o thinking mode explicito: no documentado.

## Casos de uso

- Investigacion sobre eficiencia de memoria en inferencia: el modelo permite estudiar como una compresion aprendida de la cache KV (3,6:1) afecta a la precision en tareas de razonamiento largo, comparando contra el SFT de contexto completo de la misma base.
- Razonamiento matematico de competicion en entornos de evaluacion: uso como sistema de referencia para medir pass@1 y pass@k en conjuntos como AIME o MATH-500 bajo protocolos controlados (temperatura 0,6, top-p 0,95, top-k 20).
- Servicio de generacion con presupuesto de memoria reducido: en despliegues donde la cache KV domina el consumo de VRAM en cadenas largas, la cola estatica y las filas de codigo reducen la huella de cache por bloque a 144 filas.
- Reproduccion de experimentos de compresion: util para equipos que quieran replicar la emision de codigo por bloques y la mascara de cuota de prefijo anidado con el overlay CompressLM sobre vLLM.
- Base para posteriores ajustes en matematicas: al ser un SFT sobre Qwen3-4B-Base, puede servir como punto de partida para nuevos fine-tunes que quieran heredar el comportamiento long-CoT.
- Estudio de degradacion por compresion: comparar sistematicamente sus 86,20 en MATH-500 frente a los 87,4 del SFT de contexto completo para caracterizar el coste de la compresion KV.

Nota: muchos de estos casos dependen de disponer de la ruta de servicio modificada; cargar los pesos con `from_pretrained` no reproduce el comportamiento comprimido.

## Benchmarks y rendimiento

pass@1 sobre todos los pases (equivalente a precision media por generacion). AIME con 8 muestras, temperatura 0,6 / top-p 0,95 / top-k 20, semilla 1234; MATH-500 greedy con 1 muestra.

| Benchmark | Pases | pass@1 (todos los pases) | pass@k |
|---|---|---|---|
| AIME 2025 | 8 | 29,17 | 53,33 |
| AIME 2026 | 8 | 35,42 | 66,67 |
| MATH-500 (greedy) | 1 | 86,20 | – |

Entropia cruzada (CE) sobre respuestas reservadas (held-out): 0,4213.

Comparacion de referencia bajo el mismo protocolo, frente al SFT de contexto completo sin comprimir de la misma base (`jackcai1206/qwen3-4b-longcot-sft-vanilla`):

| Modelo | AIME 2025 pass@1 | MATH-500 |
|---|---|---|
| drkylj/qwen3-4b-longcot-sft-tail16 | 29,17 | 86,20 |
| jackcai1206/qwen3-4b-longcot-sft-vanilla | 32,92 | 87,4 |

Segun el autor, en conjuntos AIME de 30 problemas el error estandar es de aproximadamente ±6, por lo que la diferencia en AIME queda dentro del ruido; la brecha de 1,2 puntos en MATH-500 es la comparacion mas significativa.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos de 4.000 millones de parametros ocupan aproximadamente 8 GB; hay que sumar la cache KV, reducida por el esquema de compresion a 144 filas por bloque de 512 tokens.
- GPU recomendadas: para reproducir las cifras publicadas se requiere el overlay CompressLM sobre vLLM con backend FlashInfer y el pin de prefill FA2; el aviso sobre FA3 en sm90 apunta a hardware Hopper (H100/H200) como entorno validado.
- Cabe en GPU de consumo: los pesos bf16 de un modelo de 4B son compatibles con GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB), si bien el comportamiento comprimido depende de la ruta de servicio modificada.
- Opciones de despliegue: vLLM con el overlay CompressLM (con FlashInfer y el pin FA2) para el modo comprimido. Cargar los pesos con `from_pretrained` da un Qwen3 con embeddings de tokens de codigo adicionales y cache KV completa, sin el comportamiento comprimido. No hay soporte documentado para llama.cpp, Ollama o TGI en modo comprimido.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME 2025 pass@1 | MATH-500 | Licencia |
|---|---|---|---|---|---|
| drkylj/qwen3-4b-longcot-sft-tail16 | 4,02 B (denso) | No disponible (base 32K) | 29,17 | 86,20 | Apache 2.0 |
| jackcai1206/qwen3-4b-longcot-sft-vanilla | 4 B aprox. (denso) | No disponible | 32,92 | 87,4 | No disponible |
| Qwen/Qwen3-4B-Base | 4 B (denso) | 32.768 nativos (131.072 con YaRN) | No aplica (modelo base) | No aplica | Apache 2.0 |

La diferencia clave frente a `qwen3-4b-longcot-sft-vanilla` es que este ultimo mantiene cache KV completa, mientras que tail-16 aplica compresion aprendida con una reduccion de 3,6:1 a cambio de una ligera perdida en MATH-500 (1,2 puntos) y una dependencia de la ruta de servicio. Frente a la base Qwen3-4B, la comparacion no procede en terminos de benchmarks de razonamiento porque la base no esta ajustada para long-CoT.

## Limitaciones y advertencias

- No es un Qwen3 listo para usar: cargar los pesos con `from_pretrained` y generar no produce el comportamiento comprimido; se obtiene un Qwen3 con embeddings de tokens de codigo adicionales y cache KV completa.
- La compresion reside en la ruta de servicio (emision de codigo por bloques, mascara de cuota de prefijo anidado y cola estatica), no en los pesos por si solos.
- Para reproducir las cifras publicadas se necesita el overlay CompressLM sobre vLLM, con backend FlashInfer y el pin de prefill FA2; en sm90 el backend `auto` resuelve a FA3 en el primer prefill y FA3 no soporta mascaras personalizadas, por lo que el primer paso de codigo falla.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo comun en generacion matematica long-CoT.
- Sesgos conocidos: no documentados en la model card.
- Limitaciones de contexto e idioma: la model card no especifica longitud de contexto ni idiomas soportados.
- Estado del artefacto: cero descargas y cero likes en el momento de la ficha; sin historial de uso en produccion ni evaluaciones independientes.
- Licencia Apache 2.0, que permite uso comercial, pero la dependencia del overlay CompressLM y de configuraciones de servicio especificas condiciona su viabilidad en produccion.
- La precision exportada es bf16 desde pesos maestros fp32, reteniendo unicamente las primeras 128 filas de codigo; no se documentan cuantizaciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drkylj/qwen3-4b-longcot-sft-tail16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- SFT de referencia de contexto completo: https://huggingface.co/jackcai1206/qwen3-4b-longcot-sft-vanilla
- Qwen3 4B long-context tuning on RTX Spark (guia externa sobre escalado YaRN y cuantizacion de cache KV): https://rtxsparks.com/guides/longcontext-qwen3-4b-rtx-spark
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Qwen3-4B en formato MLC (q4f16_1): https://huggingface.co/mlc-ai/Qwen3-4B-q4f16_1-MLC
- Fine-tuning completo de Qwen3-4B (guia de Azure Databricks): https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
- Variante long-CoT relacionada: https://huggingface.co/modrill/qwen3_4b_base_rstar_longcot_16k
