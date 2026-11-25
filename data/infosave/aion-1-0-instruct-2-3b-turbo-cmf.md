# infosave/Aion-1.0-Instruct-2.3B-Turbo-cmf

## Resumen

Aion-1.0-Instruct-2.3B-Turbo-cmf es una cuantizacion de 4 bits en formato CMF del modelo instructivo Aion-1.0-Instruct-2.3B de Microsoft, publicada por el usuario infosave. El modelo base es un transformer de 2,3 mil millones de parametros afinado para instrucciones y multilingue (ocho idiomas). Esta version Turbo no modifica los pesos: reempaqueta los mismos pesos de 4 bits en un contenedor CMF disenado para el motor de inferencia cortiq, escrito en Rust y sin dependencias de Python ni de frameworks de ML.

La innovacion principal es la gestion de la memoria de atencion en contextos largos. De las 28 capas del modelo, 21 atienden sobre una ventana fija de 2048 tokens y solo conservan esas filas en memoria; las otras 7 atienden sobre todo el prompt. A partir de 8192 tokens, esas 7 capas conservan las primeras 4 filas y las ultimas 1800 exactas, y pliegan el resto en 32 landmarks por cabeza, de modo que la memoria y el coste por token dejan de crecer con la longitud del texto. Los prompts por debajo de 8192 tokens usan atencion exacta, igual que los ficheros estandar.

El modelo es relevante para despliegues con VRAM limitada que necesitan contexto largo: en una NVIDIA L4 (24 GB) mantiene unos 89-90 tok/s de decodificacion desde 8192 hasta 30000 tokens de prompt, y en un MacBook Air M4 reduce la memoria de claves y valores a 0,83 GB para 16384 tokens. La licencia es MIT y el repositorio ocupa 1,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Aion-1.0-Instruct-2.3B); atencion hibrida: 21 de 28 capas con ventana fija de 2048 tokens y 7 capas con atencion global plegada en landmarks |
| Parametros totales | 2,3 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenamiento/uso declarado: contexto largo; atencion exacta hasta 8192 tokens, plegado por landmarks a partir de ahi; benchmarks publicados hasta 30000 tokens |
| Tipos de cuantizacion | 4 bits (q4tp) en formato CMF |
| Idiomas soportados | en, de, es, pt, it, fr, zh, ja |
| Licencia | MIT |
| Formato de pesos | CMF (un unico fichero para el motor cortiq); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 2,3 mil millones de parametros con 28 capas, afinado para instrucciones por Microsoft. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

La modificacion introducida en esta version afecta solo a la inferencia, no a los pesos. Las 21 capas con ventana de 2048 tokens mantienen unicamente esas filas en la tarjeta grafica. Las 7 capas globales, a partir de 8192 tokens de prompt, conservan las primeras 4 filas y las ultimas 1800 de forma exacta y comprimen el resto en 32 landmarks por cabeza (campo lejano de tamano fijo). Cada fila se puntua segun lo que hacen las capas con ella: para cada una de las 8 cabezas KV de las 7 capas se mide la distancia de la clave al span de los landmarks y la norma del valor, y se ajusta una regresion lineal sobre los 112 rangos resultantes, calibrada con hechos plantados en texto de Wikipedia. Las 248 mejores filas se mantienen exactas y la pregunta al final del prompt las lee antes de responder. El autor cita la solicitud de patente No. 19/738,763. La decodificacion es greedy opcional y el motor soporta backends CUDA, Vulkan, DX12 y Metal.

## Capacidades

- Generacion de texto y respuesta a instrucciones en ocho idiomas (ingles, aleman, espanol, portugues, italiano, frances, chino y japones).
- Razonamiento sobre documentos largos: recuperacion de hechos plantados en texto de Wikipedia con 12/12 aciertos a unos 13000 tokens y 12/12 a unos 27000 tokens en CUDA.
- Tool calling / function calling en formato OpenAI: las herramientas se pasan en `tools` y se devuelven en `message.tool_calls`.
- Servidor con API HTTP compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/healthz`) y panel web en el mismo puerto.
- Generacion en streaming (`"stream": true`).
- Ejecucion en CPU/GPU sin Python ni framework de ML, mediante el binario `cortiq`.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Resumen de informes largos: el modelo procesa prompts de hasta 30000 tokens manteniendo la memoria de la tarjeta acotada (3,6 GB en una L4 en CUDA), lo que permite resumir documentos extensos en una GPU de gama media sin truncar el texto.
- Analisis de documentacion tecnica y papers: con atencion exacta hasta 8192 tokens y recuperacion fiable de hechos a 13000-27000 tokens, es adecuado para preguntas y respuestas sobre manuales o articulos completos.
- Atencion al cliente multilingue: cubre espanol, ingles, aleman, frances, italiano, portugues, chino y japones, y se expone como API compatible con OpenAI para integrarse en un backend de chat multi-turno.
- Agentes con tool calling: el endpoint devuelve `tool_calls` en formato OpenAI, lo que permite conectarlo a orquestadores de agentes que consultan APIs externas o bases de datos.
- Despliegue en hardware de consumo: con 0,83 GB de claves y valores para 16384 tokens en un MacBook Air M4 y 44,7 tok/s de decodificacion, es viable para prototipos y herramientas locales en portatiles.
- Procesamiento por lotes en servidores modestos: en una NVIDIA L4 decodifica a 89-90 tok/s con prompts de 8192 a 30000 tokens, suficiente para pipelines de clasificacion, extraccion o generacion de resumenes a escala moderada.
- Entornos sin Python: al ejecutarse con un binario Rust (`cortiq`), encaja en contenedores minimos o sistemas donde instalar PyTorch y CUDA toolkit no es deseable.

## Benchmarks y rendimiento

Rendimiento de inferencia medido con `cortiq bench --core` (cortiq 0.9.9, 64 tokens generados tras el prompt), comparando el fichero Turbo con el fichero estandar de 4 bits (`Aion-1.0-Instruct-2.3B-q4tp.cmf`, mismos pesos):

CUDA, NVIDIA L4 (24 GB):

| Prompt (tokens) | Primer token, s (estandar) | Primer token, s (Turbo) | Decodificacion, tok/s (estandar) | Decodificacion, tok/s (Turbo) | Memoria pico, GB (estandar) | Memoria pico, GB (Turbo) |
|---:|---:|---:|---:|---:|---:|---:|
| 2048 | 0,32 | 0,39 | 116,9 | 117,3 | 2,2 | 2,2 |
| 4096 | 0,74 | 0,80 | 112,4 | 112,6 | 2,3 | 2,3 |
| 8192 | 1,72 | 2,80 | 106,3 | 90,7 | 2,5 | 2,6 |
| 12288 | 2,86 | 4,44 | 100,1 | 90,0 | 2,7 | 2,8 |
| 16384 | 4,15 | 6,30 | 95,7 | 89,9 | 2,9 | 3,0 |
| 24576 | 7,30 | 10,2 | 86,3 | 89,7 | 3,3 | 3,4 |
| 30000 | 9,92 | 13,2 | 79,7 | 89,0 | 3,5 | 3,6 |

Con `CMF_O1_WHOLE=0` en CUDA, un prompt de 30000 tokens ocupa 2,8 GB de la tarjeta, el primer token llega en 11,5 s y la decodificacion alcanza 112,4 tok/s.

Vulkan, NVIDIA L4 (24 GB):

| Prompt (tokens) | Primer token, s (estandar) | Primer token, s (Turbo) | Decodificacion, tok/s (estandar) | Decodificacion, tok/s (Turbo) | Memoria pico, GB (estandar) | Memoria pico, GB (Turbo) |
|---:|---:|---:|---:|---:|---:|---:|
| 2048 | 0,62 | 0,84 | 82,8 | 82,4 | 3,1 | no disponible |
| 30000 | 27,3 | 21,0 | 52,6 | 80,3-80,6 | 4,6 | 3,5 |

Metal, MacBook Air M4: 16384 tokens ocupan 0,83 GB de claves y valores frente a 1,62 GB del fichero estandar, con 44,7 tok/s de decodificacion frente a 42,2.

Calidad en recuperacion de hechos plantados en texto de Wikipedia (12 prompts por longitud): en CUDA, 12/12 a unos 13000 tokens y 12/12 a unos 27000 tokens (Transformers bf16: 12/12 y 11/12); en la lectura de memoria fija de Vulkan, 9/12 y 7/12.

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 2,2 GB con prompts de 2048 tokens y 3,6 GB con 30000 tokens en CUDA; 3,1-3,5 GB en Vulkan para el mismo rango; 2,8 GB con 30000 tokens usando `CMF_O1_WHOLE=0`.
- GPU probadas: NVIDIA L4 (24 GB) en CUDA y Vulkan. El motor soporta tambien DX12 y Metal.
- Cabe en GPU de consumo: el pico de 2,2-3,6 GB esta dentro del rango de tarjetas de 8 GB o mas; en un MacBook Air M4 usa 0,83 GB de claves y valores para 16384 tokens.
- Despliegue: binario `cortiq` (Rust) con `cargo install cortiq-cli` o binarios precompilados en la pagina de releases; backend CUDA con `--features cuda` y `CMF_GPU=cuda`; servidor compatible con OpenAI mediante `cortiq serve`.
- Latencia y throughput: primer token de 0,39 s (2048 tokens) a 13,2 s (30000 tokens) en CUDA; decodificacion de 117,3 tok/s a prompts cortos y 89,0-90,7 tok/s con prompts largos en CUDA; 80,3-80,6 tok/s en Vulkan a 30000 tokens; 44,7 tok/s en Metal (M4).
- Requiere cortiq 0.9.10 o posterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B-Turbo-cmf | 2,3 B | Atencion exacta hasta 8192; benchmarks hasta 30000 | CMF q4tp | MIT | Hugging Face (infosave) |
| Aion-1.0-Instruct-2.3B-q4tp-cmf (estandar) | 2,3 B | Igual, sin plegado por landmarks | CMF q4tp | MIT | Hugging Face (infosave) |
| Aion-1.0-Instruct-2.3B (base) | 2,3 B | no disponible | safetensors (bf16) | no disponible en la informacion proporcionada | Hugging Face (microsoft) |

La comparacion de rendimiento entre el fichero Turbo y el estandar esta detallada en la seccion de benchmarks: el Turbo iguala o supera al estandar en decodificacion a partir de 24576 tokens en CUDA y reduce la memoria en Vulkan (3,5 GB frente a 4,6 GB a 30000 tokens), a costa de un primer token mas lento en CUDA (13,2 s frente a 9,92 s). No se dispone de datos de benchmarks frente a otros modelos de tamano similar.

## Limitaciones y advertencias

- El plegado por landmarks degrada la recuperacion de hechos: 9/12 y 7/12 aciertos en la lectura de memoria fija de Vulkan, frente a 12/12 en CUDA.
- En CUDA, el primer token es mas lento que en el fichero estandar para prompts largos (13,2 s frente a 9,92 s a 30000 tokens) y la decodificacion cae respecto a prompts cortos (117,3 a 89,0 tok/s).
- La atencion exacta solo se garantiza por debajo de 8192 tokens; a partir de ahi la recuperacion depende del mecanismo de landmarks y de la puntuacion de filas.
- No se han publicado datos de sesgos, tasas de alucinacion ni evaluaciones academicas de calidad en la informacion disponible.
- El soporte de los ocho idiomas depende del modelo base; no se aportan metricas por idioma.
- El servidor `cortiq serve` no comprueba API key: con `--host 127.0.0.1` queda restringido a local, pero exponerlo en red requiere proteccion adicional.
- La licencia MIT permite uso comercial, pero el modelo base procede de Microsoft y conviene verificar las condiciones del modelo original.
- El formato CMF solo es utilizable con el motor cortiq; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Aion-1.0-Instruct-2.3B-Turbo-cmf
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Fichero estandar de 4 bits: https://huggingface.co/infosave/Aion-1.0-Instruct-2.3B-cmf
- Repositorio del motor CMF/cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados: https://github.com/infosave2007/cmf/releases
