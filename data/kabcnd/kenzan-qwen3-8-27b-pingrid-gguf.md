# kabcnd/Kenzan-Qwen3.8-27B-PinGrid-GGUF

## Resumen

Kenzan-Qwen3.8-27B-PinGrid-GGUF es una cuantizacion GGUF del modelo denso Qwen/Qwen3.8-27B (26.895.998.464 parametros reales), publicada por el usuario kabcnd. El objetivo declarado es ejecutar un modelo de 27B en una maquina Apple Silicon con 16 GB de memoria unificada (un Mac mini M6), algo que normalmente resulta inviable con cuantizaciones convencionales de 4 bits. Para ello emplea una receta propia de colocacion de precision ("Pin-Grid") guiada por una importance matrix de unsloth, que asigna formatos IQ2_XXS, IQ2_XS, IQ3_XXS, Q4_0, Q5_K, Q6_K y Q8_0 a grupos de tensores concretos segun su sensibilidad.

El resultado es un unico fichero de 10,77 GiB (3,39 BPW) que, segun el autor, alcanza una perplejidad de 8,4997 en WikiText-2, frente a 9,6249 de su build anterior de 6,42 GiB. La model card destaca tambien una correccion en la cabecera GGUF: el campo `nextn_predict_layers` se parchea a 0 para evitar que llama.cpp interprete la capa 63 como capa NextN y omita su FFN.

La relevancia practica es doble: por un lado demuestra tecnicas de cuantizacion extrema selectiva sobre arquitecturas hibridas con atencion lineal; por otro, es un ejemplo de como un modelo de casi 27B puede desplegarse en hardware de consumo con memoria unificada limitada, a costa de throughput de generacion moderado. La licencia es apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido denso con 64 capas DeltaNet/Attention (arquitectura `qwen35` en llama.cpp) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 32.768 tokens recomendados en el despliegue de referencia; el modelo base soporta contexto mayor, valor exacto no disponible |
| Tipos de cuantizacion | GGUF mixto por tensor: IQ2_XXS, IQ2_XS, IQ3_XXS, Q4_0, Q5_K, Q6_K, Q8_0; fichero principal a 3,39 BPW |
| Idiomas soportados | en, ru, multilingual (vocabulario de 248.320 tokens) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero Kenzan-Qwen3.8-27B-PinGrid-IQ2_XXS-M6-16G.gguf, 10,77 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con 64 capas que combinan atencion y Gated DeltaNet (atencion lineal), segun la descripcion de la model card. La cuantizacion parte de pesos nativos Q8_0 y utiliza una importance matrix de unsloth/Qwen3.8-27B-GGUF calibrada sobre 496 tensores y 1251 chunks. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni las fases de RLHF/DPO del modelo base en la informacion proporcionada.

La innovacion tecnica principal es la receta "Pin-Grid": la sensibilidad L2 de la importance matrix (`in_sum2`) abarca cinco ordenes de magnitud, desde ~1e4 en los bloques iniciales hasta 3,14e9 en `blk.63.ffn_down`. La receta asigna Q8_0 a la cabeza de salida, Q6_K a embeddings y claves/valores de atencion, Q5_K a los anclajes de la cola (bloques 54 a 63), Q4_0 a las capas de entrada y picos de FFN, IQ3_XXS a los FFN de cola restantes, IQ2_XS a los FFN de los bloques 36 a 57 e IQ2_XXS al resto de bloques 1 a 35. Ademas, el fichero incluye un parche de cabecera que fija `qwen35.nextn_predict_layers = 0`, necesario tras podar la capa MTP (blk.64) con `--prune-layers 64`.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredados del checkpoint Qwen/Qwen3.8-27B sin abliteracion.
- Soporte multilingue, con enfasis declarado en ingles, ruso y otros idiomas (vocabulario de 248.320 tokens).
- Capacidad de procesamiento de contexto largo dentro de los limites de memoria del hardware (hasta 32.768 tokens en la configuracion recomendada).
- Compatibilidad con `llama-server` y endpoints compatibles con la API de OpenAI (`endpoints_compatible` en los tags).
- Decodificacion especulativa mediante `ngram-map-k` en llama.cpp (parametros `--spec-type ngram-map-k`, `--spec-draft-n-max`), probada por el autor en una sesion en ruso y C++17.
- Soporte de plantillas Jinja (`--jinja`) para formateo de chat.
- No se documentan capacidades de vision, audio ni tool calling explicito en la informacion disponible.

## Casos de uso

- Despliegue local en Apple Silicon de 16 GB: el modelo esta calibrado para un Mac mini M6 con memoria unificada, permitiendo ejecutar un modelo de 27B en hardware de consumo con un unico fichero GGUF y llama.cpp con Metal.
- Asistencia conversacional multilingue en local: el vocabulario de 248.320 tokens y el soporte de ingles y ruso lo hacen adecuado para chats privados sin conexion, con contexto de hasta 32.768 tokens.
- Generacion de codigo asistida en estaciones de trabajo sin GPU dedicada: la prueba del autor con C++17 y decodificacion especulativa por ngramas indica uso viable para autocompletado y explicacion de codigo, con throughput de 11,25 t/s.
- Prototipado de agentes y pipelines con API compatible con OpenAI: al exponer `llama-server` un endpoint compatible, puede integrarse en frameworks existentes sin adaptadores.
- Evaluacion de tecnicas de cuantizacion extrema: sirve como referencia reproducible para investigar el impacto de recetas Pin-Grid frente a cuantizaciones uniformes en modelos hibridos con atencion lineal.
- Procesamiento de documentos largos en local: con contexto de 32.768 tokens y KV cache en q4_0, permite resumir o extraer informacion de textos extensos manteniendo el modelo en memoria.
- Inferencia en entornos con restricciones de privacidad: al ejecutarse completamente en local con licencia apache-2.0, es apto para datos que no pueden salir de la maquina.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en Apple Mac mini M6 con 16 GB de memoria unificada, Metal y KV cache q4_0, sobre `wt2_128k.txt` (`-c 2048 --chunks 14 -ctk q4_0 -ctv q4_0 -fa 1 -ngl 99`) y `llama-bench` (`-p 512 -n 128 -r 3`):

| Modelo | Tamano | PPL (wt2, c=2048) | pp512 (t/s) | tg128 (t/s) | Notas |
|---|---|---|---|---|---|
| Kenzan-Qwen3.8-27B-Abliterated-Core16-Q4_1 (baseline) | 6,42 GiB | 9,6249 ± 0,22173 | 225,61 | 16,42 | Base PTQ1_0 de 1 bit |
| Kenzan-Qwen3.8-27B-PinGrid-IQ2_XXS-M6-16G (esta release) | 10,77 GiB | 8,4997 ± 0,19278 | 248,52 | 11,31 | -1,1252 PPL frente al baseline |

Prueba adicional con `llama-server` (`ngram-map-k`, n=3, m=4, ruso y C++17): 11,25 t/s de generacion, 118,40 t/s de evaluacion de prompt, 55 de 198 tokens de borrador aceptados, 12,01 GiB de RSS y sin swapping. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 10,77 GiB para el fichero GGUF; el autor reporta 12,01 GiB de RSS en `llama-server` con contexto de 32.768 tokens y KV cache q4_0.
- GPU recomendadas: Apple Silicon con Metal (objetivo declarado: Mac mini M6 de 16 GB). No se documenta soporte verificado en GPU NVIDIA o AMD en la informacion disponible.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de 16 GB de memoria unificada; el autor advierte mantener el working set Metal por debajo de ~15 GB y usar contexto entre 8.192 y 32.768 tokens.
- Opciones de despliegue: llama.cpp upstream (arquitectura `qwen35`) con builds Metal, y `llama-server` con API compatible con OpenAI. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 248,52 t/s en pp512 y 11,31 t/s en tg128 en el benchmark; 11,25 t/s de generacion y 118,40 t/s de prompt eval en la prueba de servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL wt2 (c=2048) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenzan-Qwen3.8-27B-PinGrid-IQ2_XXS (esta release) | 26,9B denso | hasta 32.768 recomendado | 8,4997 | apache-2.0 | GGUF, 10,77 GiB |
| Kenzan-Qwen3.8-27B-Abliterated-Core16-Q4_1 | 26,9B denso | no disponible | 9,6249 | no disponible | GGUF, 6,42 GiB |
| Qwen/Qwen3.8-27B (modelo base) | 26,9B denso | no disponible | no disponible | apache-2.0 | safetensors, pesos originales |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion extrema a 3,39 BPW introduce perdida de calidad respecto al modelo base; la PPL de 8,4997 es buena para el tamano, pero no equivale al rendimiento del checkpoint original en tareas complejas.
- El throughput de generacion es bajo (11,31 t/s en tg128), lo que limita su uso interactivo en comparacion con cuantizaciones mayores o modelos mas pequenos.
- El rendimiento esta verificado unicamente en Apple Silicon con Metal; no hay datos de comportamiento en CUDA, ROCm ni CPU pura.
- Requiere una version de llama.cpp con soporte de la arquitectura `qwen35` y, para la decodificacion especulativa, de `ngram-map-k`.
- El parche de cabecera `nextn_predict_layers = 0` es critico: usar el fichero sin el o regenerarlo con `llama-quantize` puede degradar la PPL a 24,86.
- No se documentan evaluaciones de sesgo, alucinacion ni seguridad en la informacion disponible; al tratarse de una cuantizacion de un modelo conversacional, persisten los riesgos habituales de alucinacion.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.8-27B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Qwen3.8-27B-PinGrid-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Importance matrix utilizada: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Inspiracion declarada (Prism ML): https://huggingface.co/prism-ml
- Donaciones del autor: https://ko-fi.com/kabcpc
