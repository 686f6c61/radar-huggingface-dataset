# doth4580/Qwen3.8-27B-exl3-3.5bpw

## Resumen

Qwen3.8-27B-exl3-3.5bpw es un paquete de pesos cuantizados del modelo Qwen/Qwen3.8-27B, desarrollado por el equipo Qwen y publicado bajo licencia Apache-2.0. La cuantizacion la ha realizado el usuario doth4580 con ExLlamaV3 (exllamav3) 1.4.7 sobre 8 GPU NVIDIA H100, aplicando una precision media de 3,5 bits por peso (bpw), con `lm_head` a 6 bits, la capa MTP a 4 bits y la torre de vision a 6 bits, usando codebook `mul1`, out-scales `always` y una calibracion de 250 x 2048 tokens.

El paquete esta pensado principalmente para el motor de inferencia veloGB10 (`gb10_inference`), que se ejecuta sobre una, dos o cuatro maquinas NVIDIA DGX Spark / GB10 con topologia tensor-parallel. Los pesos mantienen el formato estandar EXL3 de ExLlamaV3, por lo que cualquier framework compatible con dicho formato puede cargarlos. El tokenizer, la plantilla de chat y la configuracion original se conservan sin cambios, salvo los metadatos de cuantizacion.

La relevancia de esta publicacion es practica: permite desplegar un modelo de la familia Qwen3.8 con vision, una ventana de contexto configurable de hasta 262.144 tokens en el motor veloGB10 y decodificacion especulativa (MTP o drafters DFlash2), en hardware de clase GB10 en lugar de exigir un cluster de H100. No obstante, el repositorio no incluye la model card original completa ni resultados de benchmarks de calidad del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capa MTP y torre de vision (etiqueta `qwen3_5`; detalles no disponibles) |
| Parametros totales | 7.493.391.744 (dato real de safetensors); el nombre del modelo indica 27B, discrepancia no aclarada en la informacion disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens en la configuracion de veloGB10 (`--max-seq-len 262144`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | EXL3 a 3,5 bpw de media; `lm_head` 6 bits; capa MTP 4 bits; torre de vision 6 bits; codebook `mul1`; out-scales `always` |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El paquete es una cuantizacion del modelo Qwen/Qwen3.8-27B, no un modelo entrenado desde cero. La arquitectura subyacente es un transformer (etiqueta de libreria `qwen3_5`) que incorpora una capa MTP (multi-token prediction) y una torre de vision, lo que habilita entrada de imagenes junto con texto. La informacion disponible no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea atencion lineal o hibrida.

El proceso de cuantizacion se ejecuto con exllamav3 1.4.7 sobre 8 GPU H100, con una calibracion de 250 secuencias de 2048 tokens y precision media de 3,5 bpw. No se dispone de datos sobre el entrenamiento original del modelo base: numero de tokens, composicion del dataset, uso de RLHF o DPO, ni innovaciones de entrenamiento. La innovacion tecnica documentada en este repositorio es la propia cuantizacion agresiva (3,5 bpw) combinada con decodificacion especulativa: la capa MTP incluida en el paquete y los drafters externos DFlash2 (bf16 y NVFP4) permiten acelerar la decodificacion con tasas de aceptacion medidas entre el 66,2 % y el 74,1 %.

## Capacidades

- Generacion de texto y razonamiento: el motor veloGB10 expone un parametro `--reasoning-effort` (configurado a `low` en los comandos de ejemplo), lo que indica soporte de modo de razonamiento con esfuerzo configurable.
- Vision: el paquete incluye la torre de vision cuantizada a 6 bits y la etiqueta `vision`, por lo que admite entradas multimodales imagen-texto.
- Codigo: los benchmarks de velocidad de veloGB10 incluyen un turno de codigo ("Code turn decode"), lo que confirma uso para generacion de codigo.
- Decodificacion especulativa: soporte de la capa MTP interna y de drafters externos DFlash2 en bf16 y NVFP4, con `--df2-block 16`.
- Servidor compatible con la API de OpenAI (`/v1`), lo que facilita tool calling y function calling a traves de la interfaz estandar, aunque el soporte nativo no se detalla en la informacion disponible.
- Procesamiento por lotes: `--max-batch` configurable (2 en los ejemplos) y cache de prefijos (`--prefix-cache on`).
- Contexto largo: hasta 262.144 tokens con cache KV cuantizada a 8 bits (`--kv-cache q8`).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistente de codigo en local: el modelo puede generar codigo en un servidor compatible con OpenAI desplegado en una o varias GB10, con una velocidad de decodificacion medida de 58 tok/s en TP=1 y 110 tok/s en TP=4 para turnos de codigo, suficiente para autocompletado y generacion de funciones en entornos sin acceso a la nube.
- Analisis de documentos largos con vision: gracias a la ventana de 262.144 tokens y a la torre de vision, se pueden procesar informes con tablas, graficos y texto extenso en una sola peticion, util para auditoria documental o extraccion de datos.
- Atencion al cliente multi-turno: el cache de prefijos y el contexto largo permiten mantener historiales de conversacion extensos y reutilizar prefijos comunes entre peticiones, reduciendo el coste de prefill (919 tok/s en TP=1, 1.902 tok/s en TP=4).
- Despliegue en infraestructura de borde o laboratorio: al ejecutarse en DGX Spark / GB10 con uno a cuatro nodos, es adecuado para equipos que no disponen de GPU de centro de datos y necesitan un modelo multimodal con contexto largo.
- Generacion aumentada por recuperacion (RAG): la combinacion de contexto de 262.144 tokens y cache de prefijos permite inyectar grandes bloques de documentos recuperados sin penalizacion excesiva en peticiones repetidas.
- Prototipado de agentes con razonamiento: el modo de razonamiento configurable y la decodificacion especulativa con drafters DFlash2 (hasta 143 tok/s en turnos de codigo con TP=4 y NVFP4) permiten cadenas de razonamiento multi-paso con latencia controlada.
- Evaluacion e investigacion de cuantizacion: el paquete sirve como referencia reproducible de EXL3 a 3,5 bpw con calibracion documentada, util para estudiar la degradacion de calidad frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos medidos son de rendimiento de inferencia con veloGB10 (VeloBench, 2026-11-08, builds 0.7.7, thinking activado, una ejecucion por celda, variacion aproximada de mas o menos 10 %):

| Topologia | Fuente del drafter | Decode turno de codigo (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del drafter |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del paquete | 58 | 29 | 45 | 919 | 72 | 66,8 % |
| TP=2 | MTP del paquete | 75 | 42 | 55 | 1.540 | 92 | 66,6 % |
| TP=4 | MTP del paquete | 110 | 65 | 72 | 1.902 | 125 | 66,2 % |
| TP=1 | DFlash2 (bf16) | 77 | 23 | 29 | 865 | 70 | 72,0 % |
| TP=2 | DFlash2 (bf16) | 82 | 26 | 40 | 1.440 | 94 | 69,2 % |
| TP=4 | DFlash2 (bf16) | 96 | 52 | 47 | 1.753 | 126 | 68,1 % |
| TP=1 | DFlash2 (NVFP4 FIXED) | 86 | 27 | 34 | 882 | 69 | 73,9 % |
| TP=2 | DFlash2 (NVFP4 FIXED) | 104 | 35 | 49 | 1.406 | 92 | 73,9 % |
| TP=4 | DFlash2 (NVFP4 FIXED) | 143 | 40 | 52 | 1.757 | 123 | 74,1 % |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15,0 GB, por lo que los pesos cuantizados a 3,5 bpw caben en aproximadamente 15 GB de memoria, mas la cache KV (q8) y el estado del servidor.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 maquinas con tensor-parallel (TP=1, TP=2, TP=4). La cuantizacion se genero en 8 x H100, pero el destino de despliegue documentado es GB10.
- GPU de consumo: la informacion no confirma compatibilidad con GPU consumer; el formato EXL3 requiere un runtime compatible con ExLlamaV3, y el paquete esta probado en GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`, binario autocontenido, servidor compatible con OpenAI en el puerto 9000); cualquier framework que lea el formato EXL3 de ExLlamaV3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Red: en TP=2 y TP=4 los nodos no necesitan copia del modelo; el nodo cabeza envia a cada nodo su parte de los pesos y la cachea localmente. En maquinas con dos pares de puertos RoCE activos se selecciona el rail con `--rdma-dev <rail1>,<rail2>`.
- Latencia y throughput: medidos en la tabla anterior; la decodificacion incluye decodificacion especulativa. La mediana de todos los turnos va de 29 a 72 tok/s segun topologia y drafter, y el prefill de 865 a 1.902 tok/s.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La unica referencia directa es el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-27B-exl3-3.5bpw | 7.493.391.744 (segun safetensors) | hasta 262.144 en veloGB10 | EXL3 3,5 bpw | Apache-2.0 | safetensors EXL3 |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | sin cuantizar | Apache-2.0 | no disponible |

No se han identificado en la informacion disponible otras alternativas de la misma categoria (mismo tamano o misma tarea) para comparar parametros, contexto, rendimiento y disponibilidad.

## Limitaciones y advertencias

- Discrepancia de tamano: el nombre del modelo indica 27B, pero el recuento real de safetensors es de 7.493.391.744 parametros; la informacion no aclara si se trata de un error de nombre, de pesos parciales o de otra causa. Verificar antes de dimensionar el despliegue.
- Es una cuantizacion a 3,5 bpw: la perdida de calidad frente al modelo original no esta cuantificada en la informacion disponible, y no hay benchmarks de calidad publicados.
- Los unicos datos de rendimiento proceden de una sola ejecucion por celda con variacion de aproximadamente mas o menos 10 %, en builds de desarrollo de veloGB10 0.7.7; no deben tomarse como cifras de produccion estables.
- El paquete esta probado y soportado principalmente en veloGB10 sobre GB10; el uso en otros frameworks EXL3 no esta verificado por el autor.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones del modelo base, ya que la model card original no se incluye completa.
- Licencia Apache-2.0: permite uso comercial, pero el autor declara no reclamar propiedad intelectual sobre el modelo, los pesos ni la arquitectura; los derechos quedan en los autores originales y contribuidores bajo sus propias licencias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-09), por lo que carece de validacion de la comunidad.
- El autor advierte que si un titular de derechos desea cambios, se modificara el repositorio; conviene revisar la licencia del modelo base antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-27B-exl3-3.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- ExLlamaV3 (exllamav3): https://github.com/turboderp-org/exllamav3
- Drafter DFlash2 (bf16): https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2
- Drafter DFlash2 (NVFP4, FIXED): https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2-NVFP4-RTNcal-FIXED
