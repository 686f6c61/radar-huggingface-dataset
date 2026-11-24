# AEON-7/Gemma-4-E4B-DECKARD-HERETIC-Uncensored-NVFP4

## Resumen

Gemma-4-E4B-DECKARD-HERETIC-Uncensored-NVFP4 es un modelo *drafter* de decodificación especulativa EAGLE, destilado del modelo Gemma 4 31B DECKARD HERETIC Uncensored y cuantizado a NVFP4 AWQ con NVIDIA ModelOpt 0.42.0. Lo publica el usuario AEON-7 en Hugging Face y su función no es responder peticiones de forma autónoma, sino proponer tokens candidatos que el modelo objetivo de 31B verifica en cada paso de generación. Con 7.941.798.218 parámetros reales según los pesos safetensors y un repositorio de 10,2 GB, actúa como acelerador de inferencia en hardware Blackwell.

El modelo hereda la arquitectura Gemma 4 con 42 capas (35 de ventana deslizante y 7 de atención completa), tamaño oculto de 2560, 8 cabezas de atención con 2 cabezas KV, `head_dim` de 256 y `global_head_dim` de 512. La ventana deslizante es de 512 tokens y el contexto máximo declarado alcanza los 131.072 tokens, con un vocabulario de 262.144 entradas. La cuantización NVFP4 AWQ reduce el peso a 9,6 GB, lo que permite ejecutarlo junto al objetivo de 31B en la memoria unificada de una DGX Spark (GB10, SM 12.1) de 128 GB.

Su relevancia es doble: por un lado, demuestra un flujo completo de decodificación especulativa EAGLE con cuantización FP4 nativa en GPUs Blackwell y ARM64; por otro, arrastra la modificación "abliterated" o *refusal-removed* del modelo base, de modo que la política de rechazo del modelo original queda alterada. Está pensado para despliegues con vLLM 0.19.1 parcheado, caché KV en FP8, *chunked prefill* y *prefix caching*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (E4B, drafter EAGLE para decodificacion especulativa) |
| Parametros totales | 7.941.798.218 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 AWQ (ModelOpt 0.42.0); pesos de 4 bits; cache KV en FP8 en el despliegue de referencia |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors (cuantizacion nvfp4, libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un *drafter* EAGLE construido sobre la arquitectura Gemma 4: 42 capas, de las cuales 35 usan atención de ventana deslizante de 512 tokens y 7 emplean atención completa, con tamaño oculto de 2560, 8 cabezas de atención y 2 cabezas KV (`head_dim` de 256, `global_head_dim` de 512). El vocabulario es de 262.144 tokens. La cuantizacion se realizo con NVIDIA ModelOpt 0.42.0 en formato NVFP4 AWQ, orientada a las unidades tensor de cuarta generacion de Blackwell (SM 12.1, arquitectura GB10 de la DGX Spark), con soporte declarado para kernels FlashInfer-CUTLASS y cache KV en FP8.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada. El modelo base es DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking, una variante del Gemma 4 31B instruct con el comportamiento de rechazo suprimido (*abliterated*) y modo de razonamiento. La innovacion tecnica principal es el uso de decodificacion especulativa EAGLE con 5 tokens candidatos por paso, combinada con cuantizacion FP4 nativa y un conjunto de tres parches sobre vLLM 0.19.1 para habilitar el pipeline en Gemma 4.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa EAGLE sobre el modelo objetivo de 31B.
- Razonamiento y modo *thinking* heredados del modelo base DECKARD HERETIC.
- Generacion de codigo y tareas de instruccion en ingles.
- Soporte de *tool calling* y *function calling* a traves del parser `gemma4` de vLLM.
- Capacidades multimodales (vision-lenguaje) heredadas de la familia Gemma 4, etiquetadas como `image-text-to-text` y `vision-language`.
- Contexto largo de hasta 131.072 tokens con ventana deslizante de 512 tokens.
- Compatibilidad con *chunked prefill*, *prefix caching* y API compatible con OpenAI.
- Comportamiento sin rechazo (*refusal-removed*) por la modificacion abliterated del modelo base.
- Idiomas: unicamente ingles segun la model card.

## Casos de uso

- Aceleracion de inferencia en produccion: se despliega junto al Gemma 4 31B DECKARD HERETIC NVFP4 en vLLM y propone 5 tokens por paso, reduciendo la latencia por token del modelo objetivo en hardware Blackwell.
- Despliegue en estaciones DGX Spark: con 9,6 GB de pesos, cabe holgadamente en los 128 GB de memoria unificada junto al objetivo de 31B, permitiendo servir un modelo de 31B en un equipo de sobremesa.
- Servicio de chat compatible con OpenAI: el stack parcheado expone `/v1/chat/completions` con `--enable-auto-tool-choice` y `--tool-call-parser gemma4`, lo que permite integrarlo en aplicaciones existentes sin cambiar el cliente.
- Agentes con llamadas a herramientas: el soporte de *function calling* y el razonamiento multi-paso del modelo base permiten construir agentes que consultan APIs externas en flujos de varias etapas.
- Procesamiento de documentos largos en ingles: el contexto de 131.072 tokens con *prefix caching* resulta adecuado para resumir o extraer informacion de contratos, informes o bases de codigo extensas.
- Generacion de codigo asistida: el modelo base esta orientado a tareas de *coding* y el drafter acelera la generacion en entornos de autocompletado o revision de codigo.
- Investigacion sobre decodificacion especulativa: sirve como referencia reproducible para medir el impacto de EAGLE con cuantizacion FP4 en GPUs SM 12.1 y en ARM64.
- Experimentacion con modelos sin rechazo: para equipos que investigan el comportamiento de modelos abliterated en tareas de red teaming controlado.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de *throughput* en DGX Spark (GB10, SM 12.1, 128 GB de memoria unificada) con el objetivo 31B DECKARD AWQ_FULL, 5 tokens especulativos y 300 tokens maximos por peticion:

| Concurrencia | tok/s agregados | tok/s por peticion | Latencia media (300 tok) |
|---:|---:|---:|---:|
| 1 | 7,6 | 8,9 | 39,4 s |
| 2 | 21,7 | 10,8 | 27,7 s |
| 4 | 42,7 | 10,7 | 28,1 s |

El autor indica cero errores en todas las pruebas y escalado lineal del *throughput* con la concurrencia. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 9,6 GB para los pesos del drafter en NVFP4; el despliegue de referencia reserva ademas el objetivo de 31B y la cache KV en FP8.
- GPU recomendadas: NVIDIA DGX Spark (GB10, SM 12.1) como plataforma de referencia; cualquier GPU Blackwell compatible con NVFP4 y los kernels FlashInfer-CUTLASS.
- Cabe en GPU de consumo: no disponible; la model card solo documenta despliegue en Blackwell con memoria unificada.
- Opciones de despliegue: vLLM 0.19.1 con los tres parches del autor (`eagle_patched.py`, `serving_chat_patched.py`, `modelopt_patched.py`) e imagen Docker `ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Ajuste de memoria: en la DGX Spark se recomienda `--gpu-memory-utilization` entre 0,6 y 0,7; por encima de 0,8 el pool compartido CPU+GPU provoca *page thrashing*. Con decodificacion especulativa hay que dejar margen extra porque los buffers de verificacion no se contabilizan en esa fraccion.
- Latencia y throughput: 8,9 tok/s por peticion con concurrencia 1 y 42,7 tok/s agregados con concurrencia 4, segun las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Funcion |
|---|---|---|---|---|---|
| Gemma-4-E4B-DECKARD-HERETIC-Uncensored-NVFP4 (este) | 7,94 B | 131.072 | NVFP4 AWQ | gemma | Drafter EAGLE para Gemma 4 31B |
| Gemma-4-31B-it-DECKARD-HERETIC-Uncensored-NVFP4 | 31 B (aproximado, no confirmado) | 131.072 | NVFP4 AWQ | gemma | Modelo objetivo que verifica las propuestas |
| Drafter EAGLE estandar de Gemma | no disponible | no disponible | no disponible | gemma | Alternativa generica de decodificacion especulativa |

No se dispone de datos publicados de rendimiento comparativo frente a otros drafters EAGLE ni frente a modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo *abliterated* y *refusal-removed*: la supresion del comportamiento de rechazo puede producir contenido inapropiado, danoso o ilegal. No es apto para aplicaciones de cara al publico sin filtros externos.
- Solo soporta ingles segun la model card; el rendimiento en otros idiomas no esta documentado.
- Es un drafter, no un modelo autonomo: sin el objetivo de 31B y los parches de vLLM no produce respuestas utiles en el flujo previsto.
- Requiere vLLM 0.19.1 con tres parches no oficiales que se montan sobre el codigo de la libreria; cualquier actualizacion de vLLM puede romper la integracion.
- Dependencia de hardware Blackwell (SM 12.1) y de kernels NVFP4/FlashInfer-CUTLASS; no hay soporte documentado para GPUs Ampere, Ada ni para CPU.
- Riesgo de alucinacion inherente al modelo base, agravado por el modo *thinking* y por la ausencia de datos de evaluacion de calidad publicados.
- La licencia Gemma impone condiciones de uso, incluida la politica de uso prohibido de Google; conviene revisarlas antes de un despliegue comercial.
- El autor advierte de *page thrashing* en memoria unificada si se eleva `--gpu-memory-utilization` por encima de 0,8.
- El repositorio tiene 410 descargas y 3 likes en el momento de la consulta, por lo que la validacion comunitaria es muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Gemma-4-E4B-DECKARD-HERETIC-Uncensored-NVFP4
- Modelo objetivo: https://huggingface.co/AEON-7/Gemma-4-31B-it-DECKARD-HERETIC-Uncensored-NVFP4
- Modelo base: https://huggingface.co/DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking
- Repositorio GitHub con los parches de vLLM: https://github.com/AEON-7/Gemma-4-31B-DECKARD-HERETIC-Uncensored-NVFP4
- Imagen Docker: ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest
- Apoyo al autor: https://lotusmake.com/support
