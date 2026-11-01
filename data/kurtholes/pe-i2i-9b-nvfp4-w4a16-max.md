# kurtholes/PE-I2I-9B-NVFP4-W4A16-MAX

## Resumen

PE-I2I-9B-NVFP4-W4A16-MAX es una cuantizacion de 4 bits del modelo Qwen/Qwen-Image-2.1-PE-I2I, el reescritor de prompts oficial de los modos reference y edit de Qwen-Image 2.1. Desarrollado por el usuario kurtholes (no por el equipo de Qwen), el modelo recibe entre 1 y 10 imagenes de referencia junto con una instruccion corta del usuario y genera un prompt detallado en ingles en formato JSON, precedido de un bloque de razonamiento. Su funcion es actuar como preprocesador de prompts para el modelo generador de imagenes, no como generador de imagenes por si mismo.

La relevancia tecnica esta en la cuantizacion: reduce el peso en disco de 18,82 GB (bf16) a 7,41 GB, manteniendo la torre de vision en bf16 bit-identica al original para que el modelo pueda servirse en vLLM con vision activa. Se cuantizan 249 de las 359 capas `nn.Linear` con NVIDIA ModelOpt 0.43.0 en formato NVFP4 weight-only (W4A16), incluyendo `lm_head`. El autor reporta 46,4 tok/s en decodificacion de un solo stream y 389 tok/s agregados con 16 peticiones concurrentes sobre una NVIDIA GB10 (DGX Spark).

El nombre comercial dice "9B", pero el recuento real de parametros en safetensors es de 5.442.002.160 (5,44 mil millones). La licencia es Qwen Research License, de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen-Image 2.1 PE-I2I; torre de vision bf16 + capas lineales del LM en NVFP4 |
| Parametros totales | 5.442.002.160 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el autor recomienda servir con `--max-model-len 24576` |
| Tipos de cuantizacion | NVFP4 weight-only (W4A16): block size 16, escalas de bloque e4m3, una escala global fp32 por tensor; vision tower en bf16 |
| Idiomas soportados | no disponible (la salida del prompt es en ingles segun la model card) |
| Licencia | qwen-research (uso no comercial) |
| Formato de pesos | safetensors (checkpoint ModelOpt `W4A16_NVFP4` detectado por vLLM desde `config.json`) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint oficial Qwen/Qwen-Image-2.1-PE-I2I (commit `72927bc0`), no un entrenamiento nuevo. La arquitectura subyacente combina una torre de vision con un modelo de lenguaje que opera en modo "thinking": la salida incluye un bloque `</think>` cerrado seguido de un JSON cuyo campo `rewritten_prompt` contiene el prompt final para el modelo de imagenes. El pipeline es `image-text-to-text` y el chat template original se distribuye sin cambios.

La cuantizacion se realizo con NVIDIA ModelOpt 0.43.0 en modo NVFP4 weight-only, con algoritmo `max`, sobre 249 de los 359 modulos `nn.Linear` del modelo. Los 110 restantes (toda la torre de vision, incluido su merger) se excluyen y permanecen en bf16. La calibracion uso 64 prompts en el formato de chat real. Como verificacion posterior al export, el autor afirma que 511 tensores no cuantizados son bit-identicos al original y que el codigo de configuracion de vLLM enruta el checkpoint a 153 lineales fusionadas cuantizadas, dejando todas las lineales de vision sin cuantizar y los embeddings de tokens en bf16. No se detalla el dataset de entrenamiento original ni si hubo RLHF o DPO.

## Capacidades

- Reescritura de prompts a partir de imagenes de referencia (entre 1 y 10) y una instruccion corta del usuario.
- Generacion de prompts largos y detallados en ingles, estructurados como JSON con campo `rewritten_prompt`.
- Modo de razonamiento previo (thinking) con bloque `</think>` antes de la respuesta JSON.
- Procesamiento multimodal: lectura de imagenes de referencia mediante torre de vision en bf16.
- Soporte de peticiones conversacionales con el chat template original de Qwen.
- Integracion con vLLM con vision activa y prefix caching.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni otros idiomas distintos del ingles en la salida.

## Casos de uso

- Preprocesado de prompts para edicion de imagenes: el modelo recibe la imagen de referencia y una instruccion breve del usuario y devuelve un prompt detallado que se pasa al modelo generador de Qwen-Image 2.1 en modo edit, mejorando la fidelidad de la instruccion.
- Generacion de imagenes con referencia (reference mode): se envian hasta 10 imagenes de referencia junto con la instruccion y el modelo produce el prompt enriquecido que guia al generador, apropiado cuando el usuario no sabe describir con precision el estilo o los elementos deseados.
- Pipeline de automatizacion creativa: integrado como etapa previa en un flujo de generacion de imagenes por lotes, donde las instrucciones de usuario son cortas y heterogeneas y se necesita normalizarlas a prompts largos y consistentes.
- Servicio interno de bajo coste en hardware modesto: con 7,07 GiB de pesos en memoria de vLLM y 46,4 tok/s en un solo stream sobre GB10, es viable desplegarlo en una estacion de trabajo con GPU de gama profesional para equipos pequenos.
- Prototipado de interfaces de edicion de imagen conversacional: el modelo permite construir un front-end donde el usuario sube imagenes y escribe frases cortas, y el backend transforma esa entrada en prompts tecnicos para el generador.
- Evaluacion y ajuste de prompts en investigacion: al devolver JSON estructurado y razonamiento previo, facilita el analisis automatico de como se traducen instrucciones humanas en descripciones tecnicas para modelos de difusion o generacion de imagen.
- Despliegue con concurrencia moderada: con 389 tok/s agregados a 16 peticiones concurrentes, sirve para entornos de demo o equipos de hasta una decena de usuarios simultaneos.

## Benchmarks y rendimiento

Los datos publicados por el autor son mediciones operativas, no benchmarks academicos estandar (MMLU, HumanEval, GSM8K). Se presentan tal cual:

| Prueba | Resultado |
|---|---|
| Carga en vLLM con vision activa | si |
| Pesos en memoria de vLLM | 7,07 GiB |
| Smoke greedy en 3 peticiones reales (1, 2 y 3 imagenes de referencia) | 3/3 completadas, un unico bloque think cerrado, JSON parsea |
| Token ids de `/tokenize` coincidentes con el pipeline de referencia | 4/4 |
| Tokens de vision por imagen == (h/32) x (w/32) | en todas las imagenes |
| Token ids en streaming == no streaming (greedy) | identicos |
| Velocidad de decodificacion, un solo stream | 46,4 tok/s |
| Agregado con 16 peticiones concurrentes | 389 tok/s (16/16 completadas, 16/16 parsean) |

No se han publicado comparaciones ciegas contra el original bf16 ni contra otras cuantizaciones, ni la concordancia de tokens con teacher forcing frente al bf16. No hay resultados de benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,07 GiB solo de pesos en vLLM, mas cache KV (configurado con `--kv-cache-dtype fp8`) y memoria para la torre de vision y activaciones; el total depende de `--max-model-len` y `--max-num-seqs`.
- GPU recomendadas: el autor solo ha probado una NVIDIA GB10 (DGX Spark, sm121) con vLLM 0.27.2rc0. No hay datos publicados para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no confirmado; por tamano de pesos (7,07 GiB) es plausible en GPUs con 16 GB o mas, pero no se ha validado ni la compatibilidad de kernels ni el rendimiento.
- Opciones de despliegue: vLLM con vision activa (unica via probada). No se ha probado la carga con transformers estandar. No hay informacion sobre llama.cpp, Ollama ni TGI.
- Latencia y throughput: 46,4 tok/s en decodificacion de un solo stream y 389 tok/s agregados con 16 peticiones concurrentes en GB10. La velocidad corresponde a la ruta de dequantizacion Marlin (pesos W4A16, activaciones bf16), no a tensor cores FP4 nativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PE-I2I-9B-NVFP4-W4A16-MAX (este) | 5,44 mil millones | no disponible (servir con 24576) | NVFP4 W4A16, vision bf16 | qwen-research (no comercial) | HuggingFace, 17 descargas |
| Qwen/Qwen-Image-2.1-PE-I2I (original) | no disponible en la informacion | no disponible | bf16 (18,82 GB) | qwen-research | HuggingFace (oficial) |
| kurtholes/PE-T2I-9B-NVFP4-W4A16-MAX | no disponible | no disponible | NVFP4 W4A16, vision tambien en 4 bits | qwen-research | HuggingFace (mismo autor) |

El modelo hermano PE-T2I cubre el modo text-to-image y cuantiza tambien la torre de vision; segun el autor, el kernel FP4 de vLLM rechaza esas formas, pero ese modelo no necesita vision. No se dispone de datos de otros reescritores de prompts comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research License: uso exclusivamente no comercial. Cualquier despliegue en produccion comercial requiere licencia aparte del titular original.
- El nombre "9B" no coincide con el recuento real de parametros (5,44 mil millones); conviene verificar el presupuesto de memoria con el dato de safetensors.
- Peticiones largas pueden agotar el limite de salida: el autor documenta una peticion con 10 imagenes de referencia (prompt de 14.905 tokens) que no termino dentro de un limite de 8.192 tokens de salida. Hay que dimensionar `max_tokens` y tratar respuestas incompletas como reintento.
- La build de vLLM probada acepto una peticion cuyo prompt mas `max_tokens` excedia `--max-model-len` sin devolver error 400; no se debe confiar en que el servidor la rechace y hay que limitar `max_tokens` en el cliente.
- Solo probado en vLLM 0.27.2rc0 para sm121 (GB10). La carga con transformers no se ha probado. El rendimiento en otras GPU y versiones de vLLM es desconocido.
- No se ha medido la concordancia de tokens con teacher forcing frente al modelo bf16 ni una comparacion ciega contra el original; el impacto de la cuantizacion en la calidad del prompt generado no esta cuantificado.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni comportamiento fuera del ingles en la salida.
- El modelo no genera imagenes: es un reescritor de prompts y depende de un modelo generador posterior.
- Riesgo de alucinacion en la descripcion de las imagenes de referencia no evaluado por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/kurtholes/PE-I2I-9B-NVFP4-W4A16-MAX
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Modelo hermano text-to-image: https://huggingface.co/kurtholes/PE-T2I-9B-NVFP4-W4A16-MAX
- Licencia (archivo LICENSE en el repo): https://huggingface.co/kurtholes/PE-I2I-9B-NVFP4-W4A16-MAX/blob/main/LICENSE
- Aviso de cambios (NOTICE): https://huggingface.co/kurtholes/PE-I2I-9B-NVFP4-W4A16-MAX/blob/main/NOTICE
- NVIDIA ModelOpt: no disponible en la informacion proporcionada
- vLLM: no disponible en la informacion proporcionada
