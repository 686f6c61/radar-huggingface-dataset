# Qubitium/llama3.2-1b-instruct-tenstorrent-bf8-bf4

## Resumen

`llama3.2-1b-instruct-tenstorrent-bf8-bf4` es un checkpoint cuantizado de Llama-3.2-1B-Instruct publicado por Qubitium, pensado especificamente para ejecutarse de forma nativa en aceleradores Tenstorrent (arquitectura Blackhole, tarjeta p300c). A diferencia de una cuantizacion GPTQ convencional, los pesos del decodificador se almacenan como block floats nativos de Tenstorrent (`bf4_b` y `bf8_b`, esquema w4a16), resueltos con realimentacion de error GPTQ directamente sobre la rejilla numerica del hardware. El resultado es que el checkpoint se sube al chip sin re-cuantizacion alguna, con deriva 0.0 en los 81 tensores block-float.

El modelo base es el transformer denso Llama-3.2-1B-Instruct de Meta, con 2.011.924.706 parametros totales segun los safetensors del repo (cifra que incluye embeddings y cabeza atada). La revision 2 del checkpoint corrige un error de orientacion de los bloques de exponente: ahora se agrupan a lo largo de `out_features` (`block_axis: "out"`), lo que permite que `ttnn.linear(x, W^T)` consuma los pesos exactamente como los espera el silicio. La revision 1, bloqueada en `in_features`, obligaba a re-cuantizar en el upload y provocaba errores de peso del 3,4-5,0 % en bf4 y del 8 % en la salida de una capa real.

La relevancia de esta ficha es acotada pero clara: no es un modelo de proposito general ni compite en calidad con los Llama-3.2 originales en bf16, sino un artefacto de despliegue para quien tenga hardware Tenstorrent y quiera servir Llama-3.2-1B con KV cache paginada, prefill por trozos y contexto largo (hasta 64k medido, con fallo en passkey a 64k igual que el denso en bf16 sobre CPU). La licencia es la Llama 3.2 de Meta, con las restricciones habituales de esa familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2), pesos de decodificador en block float nativo Tenstorrent (`bf4_b` / `bf8_b`), esquema w4a16 |
| Parametros totales | 2.011.924.706 (safetensors del repo) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 64k medido en dispositivo (passkey falla a 64k, igual que el denso bf16 en CPU); contexto nativo de Llama-3.2-1B: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | w4a16 con block floats `bf4_b` (4 bits) y `bf8_b` (8 bits, usado tambien para KV cache); GPTQ con act-order; embeddings con codigos bf8 empaquetados en host |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License de Meta) |
| Formato de pesos | safetensors con `custom_code` (libreria `gptqmodel`), block floats nativos Tenstorrent |
| Tamano del repo | 4,5 GB |
| Libreria de carga | gptqmodel (se requiere `main`; revisiones antiguas fallan con `block_axis`) |
| Hardware objetivo | Tenstorrent Blackhole p300c (1 o 4 tarjetas) |
| Calibracion | 128 x 512 = 65.536 tokens de 4.000 registros (revision 2; revision 1: 8.192 tokens) |

## Arquitectura y entrenamiento

El modelo es un Llama-3.2-1B-Instruct sin cambios estructurales: transformer decoder-only denso con atencion causal estandar, capas QKV fusionadas y cabeza de salida atada a los embeddings. La innovacion no esta en la topologia sino en la representacion numerica. Los pesos del decodificador se almacenan como block floats de Tenstorrent, donde cada tile `bf4_b` o `bf8_b` comparte un exponente por cada 16 valores de su ultima dimension. En la revision 2 ese eje es `out_features`, que es la ultima dimension del operando `[in, out]` que consume `ttnn.linear(x, W^T)`. Esta decision de layout es la que elimina la re-cuantizacion en el upload.

El proceso de cuantizacion usa GPTQ secuencial con act-order: cada bloque se calibra sobre las salidas de los bloques ya cuantizados, y las columnas se resuelven en orden de diagonal de Hessiana, algo que los bloques del eje `out` permiten gratis porque un bloque nunca cruza dos columnas. La calibracion se multiplico por 8 respecto a la revision 1, hasta 65.536 tokens extraidos de 4.000 registros. No se menciona RLHF, DPO ni entrenamiento adicional: el checkpoint hereda el ajuste por instrucciones del Llama-3.2-1B-Instruct original y solo aplica cuantizacion post-entrenamiento. El runner de dispositivo usa KV cache en pool paginado, prefill en trozos de 2.048 tokens y matmuls HiFi4.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del Llama-3.2-1B-Instruct base.
- Razonamiento aritmetico basico y resolucion de problemas tipo GSM8K, con una penalizacion de perplejidad de solo +0,83 % frente al denso en ese conjunto.
- Recuperacion de informacion en contexto largo: passkey retrieval correcto a 8k, 16k y 32k en las profundidades 0,25, 0,5 y 0,75.
- Decodificacion greedy fiel al modelo denso en fp32: 16 de 16 tokens identicos con un prompt de 300 tokens.
- Prefill y decodificacion por lotes en dispositivo: hasta 32 usuarios por tarjeta con KV cache bf16 o bf8.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (depende del modelo base, no documentado aqui).
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; el modelo base es solo texto.

## Casos de uso

- Servicio de inferencia en hardware Tenstorrent: el caso principal. Con 4 tarjetas Blackhole p300c y 32 usuarios concurrentes se miden 9.126 tok/s a 2k de contexto y 1.628 tok/s a 32k, lo que permite montar un endpoint de chat sobre silicio Tenstorrent sin GPU convencional.
- Despliegue de latencia baja para un solo usuario: una tarjeta ofrece pasos de 7,6 ms a 8k de contexto (131 tok/s) y 16,2 ms a 64k (62 tok/s), adecuado para asistentes interactivos donde prima el tiempo por token.
- Procesamiento de documentos largos: con passkey retrieval verificado hasta 32k y prefill de 3,05 s para 32k tokens, sirve para resumir o extraer datos de contratos, informes o transcripciones que no caben en ventanas de 8k.
- Referencia de correctitud para pipelines de cuantizacion: al tener deriva 0.0 en el upload y coseno 0.9993 frente a fp32 en los logits del ultimo token, se puede usar como patron para validar otras cuantizaciones GPTQ destinadas a Tenstorrent.
- Evaluacion de block floats en produccion: util para equipos que investigan el impacto de `bf4_b` frente a `bf8_b` en calidad y throughput, con metricas publicadas de perplejidad y de velocidad por contexto.
- Chatbot interno de bajo coste: al ser un modelo de 1B en 4 bits con repo de 4,5 GB, encaja en entornos con recursos limitados donde no se justifica un modelo mayor y el hardware disponible es Tenstorrent.
- Prototipado de serving con KV cache paginada: el runner `tt_llama_decode.py` con `bench --ctx` y `passkey` permite experimentar con chunked prefill y gestion de pool KV antes de llevar una carga mayor al cluster.

## Benchmarks y rendimiento

Calidad (CPU, fp32, 40 ventanas de 512 tokens por conjunto; `nm held-out` son las filas 8000-8999 de `neuralmagic/calibration` `llm.parquet`, disjuntas de las filas de calibracion 0-3999):

| Modelo | nm held-out PPL | vs denso | GSM8K test PPL | vs denso |
|---|---|---|---|---|
| denso `unsloth/Llama-3.2-1B-Instruct` | 4,5226 | — | 4,3895 | — |
| revision 1 (`v1-in-axis`) | 4,5983 | +1,67 % | 4,4859 | +2,20 % |
| revision 2 (este) | 4,5942 | +1,58 % | 4,4261 | +0,83 % |

Verificacion en dispositivo (Blackhole p300c, HiFi4, un proceso por tarjeta):

| Comprobacion | Resultado |
|---|---|
| Deriva de upload, 81 tensores `bf4_b`/`bf8_b` | 0,0 |
| Logits del ultimo token en prefill vs CPU fp32 | coseno 0,9993 (300 tok), 0,9993 (8k), 0,9992 (16k); argmax igual |
| Continuacion greedy vs CPU fp32, prompt de 300 tokens | 16/16 tokens iguales |
| Passkey retrieval (profundidades 0,25 / 0,5 / 0,75) | 8k, 16k, 32k: recuperado |
| Passkey a 64k | fallado, igual que el denso bf16 en CPU con el mismo prompt |

Throughput con decode trazado:

| Contexto | KV cache | 4 tarjetas x 32 usuarios, trazado | Servido (bucle host + readback) | Paso por tarjeta |
|---|---|---|---|---|
| 2k | bf16 | 9.126 tok/s | 8.578 tok/s | 13,9-14,2 ms |
| 8k | bf16 | 3.768 tok/s | 3.597 tok/s | 33,9-34,1 ms |
| 16k | bf8 | 3.040 tok/s | 2.628 tok/s | 41,9-42,3 ms |
| 32k | bf8 | 1.628 tok/s | 1.557 tok/s | 78,5-78,8 ms |

Latencia de un solo usuario, una tarjeta:

| Contexto | KV cache | Paso | tok/s |
|---|---|---|---|
| 8k | bf16 | 7,6 ms | 131 |
| 16k | bf8 | 12,3 ms | 81 |
| 32k | bf8 | 13,6 ms | 73 |
| 64k | bf8 | 16,2 ms | 62 |

Prefill (un usuario, en caliente): 8k tokens 0,40 s; 16k 1,54 s; 32k 3,05 s; 64k 15,2 s. El autor indica que el throughput no depende de los valores de los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido convencional; el checkpoint esta disenado para ejecutarse en tarjetas Tenstorrent Blackhole p300c, no en GPU NVIDIA o AMD.
- GPU recomendadas: ninguna GPU convencional es la ruta rapida. El propio autor describe la ejecucion en CPU/GPU como "referencia de correctitud, no la ruta rapida", mediante `gptqmodel` y `transformers`.
- Tarjetas Tenstorrent: Blackhole p300c, en configuracion de 1 o 4 tarjetas; una tarjeta basta para latencia de un usuario, cuatro para throughput con 32 usuarios.
- Cabe en GPU de consumo: no como ruta soportada; el repo ocupa 4,5 GB y la decodificacion de los block floats en GPU/CPU no esta optimizada segun la model card.
- Opciones de despliegue: `scripts/tt_llama_decode.py` de GPTQModel (comandos `generate`, `bench`, `passkey`) sobre Tenstorrent; en CPU/GPU, `GPTQModel` con `AutoTokenizer` de `transformers`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de software: `gptqmodel` desde `main` (obligatorio por el campo `block_axis`), runtime Tenstorrent fijado en `requirements/tenstorrent-py312.txt`, y `GPTQ_BYPASS_SAFETY_CHECKS=1` segun `docs/tenstorrent.md`.
- Latencia y throughput: ver tablas de la seccion anterior; pasos de 7,6 ms (8k, un usuario) a 78,8 ms (32k, 32 usuarios por tarjeta).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qubitium/llama3.2-1b-instruct-tenstorrent-bf8-bf4` (este) | 2,01B | 64k en dispositivo (passkey hasta 32k) | PPL nm +1,58 % vs denso; GSM8K +0,83 % | llama3.2 | Hugging Face, 30 descargas, 1 like |
| denso `unsloth/Llama-3.2-1B-Instruct` | 1,24B (referencia del autor) | no disponible | PPL nm 4,5226; GSM8K 4,3895 | llama3.2 | Hugging Face |
| revision 1 (`v1-in-axis`, mismo repo) | 2,01B | no disponible | PPL nm +1,67 %; GSM8K +2,20 % | llama3.2 | Hugging Face (tag git) |
| Otras cuantizaciones GPTQ de Llama-3.2-1B-Instruct | no disponible | no disponible | no disponible | llama3.2 | no disponible |

No se dispone de datos de benchmarks de terceros (MMLU, HumanEval) en la informacion proporcionada para establecer comparaciones adicionales.

## Limitaciones y advertencias

- El checkpoint esta atado al layout de Tenstorrent: fuera de ese hardware solo sirve como referencia de correctitud, no como via de despliegue eficiente.
- La revision 1 no se puede ejecutar exactamente en el dispositivo (re-cuantiza en el upload, con 3,4-5,0 % de error de peso bf4 y 8 % de error de salida en una capa real); hay que usar la revision 2.
- Requiere `gptqmodel` desde `main`; versiones anteriores fallan al cargar por el argumento `block_axis` en lugar de decodificar los codigos en la orientacion correcta.
- Una llamada `generate` con prompts muy cortos puede fallar en `paged_update_cache` en `main`; el autor remite a la rama `fix/tt-llama-kv-pool-geometry` hasta que se fusione el PR #4011.
- Passkey retrieval falla a 64k, igual que el modelo denso en bf16 sobre CPU con el mismo prompt; no se debe asumir contexto efectivo de 64k para recuperacion fiable.
- La perplejidad en GSM8K sube un +0,83 % frente al denso, y la de texto general un +1,58 %; es una degradacion pequena pero real.
- Sesgos conocidos: no documentados en la informacion proporcionada; hereda los del Llama-3.2-1B-Instruct de Meta.
- Riesgo de alucinacion: inherente a un modelo de 1B; no se han publicado evaluaciones especificas de factualidad para este checkpoint.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingue mas alla de la del modelo base.
- Licencia llama3.2: uso comercial sujeto a la Llama 3.2 Community License de Meta, con sus umbrales y obligaciones de atribucion; revisar antes de produccion.
- El repo tiene solo 30 descargas y 1 like, por lo que la validacion por parte de la comunidad es practicamente nula.
- El autor advierte que el throughput no depende de los valores de los pesos, de modo que las cifras de velocidad sirven para juzgar el runner pero no la calidad del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qubitium/llama3.2-1b-instruct-tenstorrent-bf8-bf4
- Repo GPTQModel: https://github.com/ModelCloud/GPTQModel
- PR de serving de contexto largo en Tenstorrent: https://github.com/ModelCloud/GPTQModel/pull/4010
- PR de correccion de geometria del pool KV: https://github.com/ModelCloud/GPTQModel/pull/4011
- Documentacion de serving paginado en Tenstorrent: https://github.com/ModelCloud/GPTQModel/blob/main/docs/tt-llama-paged-serving.md
- Tag de la revision 1: https://huggingface.co/Qubitium/llama3.2-1b-instruct-tenstorrent-bf8-bf4-w4a16/tree/v1-in-axis
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
