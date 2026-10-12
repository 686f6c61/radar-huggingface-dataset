# OpensourceWTF/MiMo-V2.6-Flash-MOPD-fp8res-mlx-stream

## Resumen

MiMo-V2.6-Flash-MOPD-fp8res-mlx-stream es un paquete de servicio (serving pack) del modelo XiaomiMiMo/MiMo-V2.6-Flash-MOPD, desarrollado por el usuario OpensourceWTF y distribuido bajo licencia MIT heredada del modelo original, cuyo autor es Xiaomi. No es un modelo nuevo ni un reentrenamiento: es un reempaquetado de los pesos oficiales para poder servirlos en Apple Silicon mediante el plugin mlx-stream sobre mlx-serve, aplicando una estrategia de streaming de expertos. El problema que resuelve es concreto: hacer ejecutable localmente un modelo de arquitectura Mixture-of-Experts de 309.000 millones de parametros totales en una maquina de 128 GB de memoria unificada, algo imposible si hubiera que mantener todos los pesos residentes en RAM.

La clave es que los expertos enrutados (la mayor parte del modelo) permanecen en disco y se transmiten desde el SSD interno por peticion, mientras que las capas de atencion, la capa densa, los routers y las normas quedan residentes. La cuantizacion no se altera respecto al lanzamiento original: los expertos se reempaquetan de forma bit-exacta en registros MXFP4 y las proyecciones residentes conservan FP8 (e4m3, bloques 64x128). El banco de expertos contiene 47 capas MoE por 256 expertos enrutados cada una.

El pack esta pensado exclusivamente para Apple Silicon (medido en un M5 Max de 128 GB) y declara soportar el contexto completo de 1.048.576 tokens del lanzamiento, con un rendimiento medido de aproximadamente 1.000 tok/s de prefill y 30 tok/s de decodificacion para un prompt de 16K tokens. Solo soporta ingles y chino, y desactiva la vision. Es relevante para quien quiera ejecutar localmente un MoE de gran tamano de contexto largo en hardware de consumo profesional de Apple, asumiendo sus requisitos de memoria, SSD y software especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE); 47 capas MoE con 256 expertos enrutados por capa, mas cabezas de prediccion multi-token (MTP) |
| Parametros totales | 309.000 millones (modelo base MiMo-V2.6-Flash-MOPD); pesos residentes del pack: 5.983.586.496 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (maximo declarado); el ejemplo de servicio usa 32.768 |
| Tipos de cuantizacion | Expertos enrutados en MXFP4 (group-32, reempaquetado bit-exacto); residentes en FP8 e4m3 con bloques 64x128; etiquetado como 4-bit |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (residentes y cabezas MTP), experts.bin (banco de expertos, formato `mlx-stream-mxfp4-expert-bank-v1`), expert-manifest.json, mtp-manifest.json |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de tipo Mixture-of-Experts con 47 capas MoE y 256 expertos enrutados por capa. Segun la model card, el modelo completo tiene 309.000 millones de parametros, de los cuales la inmensa mayoria corresponden a los expertos enrutados y solo una fraccion queda residente en memoria: embeddings, atencion, capa densa, routers, normas y lm_head (los 5.983.586.496 parametros del fichero `model.safetensors`). El modelo base incorpora cabezas de prediccion multi-token (MTP), que el pack utiliza como lane de borrador (especulativa) mediante el fichero `mtp-heads.safetensors`.

Este repositorio no documenta el entrenamiento del modelo original: no hay informacion sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica que si describe es de despliegue, no de entrenamiento. El pack convierte los expertos enrutados del lanzamiento (MXFP4, layout group-32) en registros de tamano fijo de 13.369.344 bytes, con offsets, longitudes y sha256 por registro en `expert-manifest.json`, de modo que el plugin mlx-stream lee el banco del SSD con E/S no cacheada. Las proyecciones q/k/v y el MLP denso conservan el FP8 (e4m3, bloques 64x128) del lanzamiento, por lo que nada se recuantiza. El bloque `expert_streaming` del `config.json` define rutas como `expert_prefill_rows`, `expert_rows` y `mtp_lane`, que permiten fijar cuantas filas de expertos residentes se admiten segun el presupuesto de memoria.

## Capacidades

- Generacion de texto conversacional y de codigo, con pipeline declarado text-generation.
- Razonamiento multi-paso con modo de pensamiento (thinking on) activado en las mediciones del autor.
- Respuestas sobre contextos muy largos: el pack sostiene el contexto completo de 1.048.576 tokens, y en las pruebas resolvio una tarea de codigo con cinco funciones situada al final de contextos de hasta mas de un millon de tokens.
- Decodificacion especulativa mediante cabezas MTP (lane de borrador), activada por defecto en las mediciones.
- API compatible con OpenAI (`/v1/completions`, `/v1/chat/completions`) a traves de mlx-serve.
- Soporte bilingue limitado a ingles y chino.
- Vision desactivada en el pack (flag `--no-vision`), por lo que no ofrece capacidades multimodales aunque el modelo base pudiera tenerlas.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Asistencia de codigo local en Mac: el pack resuelve tareas de programacion con cinco funciones incrustadas en prompts largos y mantiene el contexto durante respuestas de hasta 16.384 tokens, lo que permite usarlo como asistente de codigo offline en un M5 Max sin depender de servicios en la nube.
- Analisis de documentacion extensa: con 1.048.576 tokens de contexto, se puede introducir un repositorio o un corpus documental completo y hacer preguntas sobre el sin trocear el material, aprovechando el prefill de ~1.000 tok/s a 16K.
- Procesamiento en entornos aislados (air-gapped): al ejecutarse integramente en local sobre Apple Silicon, encaja en flujos donde no se permite enviar datos a APIs externas, como auditoria de codigo o tratamiento de informacion sensible.
- Asistente conversacional bilingue ingles-chino: util para equipos que trabajan con documentacion en esos dos idiomas, mediante la API compatible con OpenAI.
- Generacion de codigo en modo batch sobre prompts largos: la ventana de contexto y el prefill sostenido (600-1.000 tok/s entre 16K y 131K tokens) permiten procesar tareas de generacion sobre contextos grandes de forma secuencial en una sola maquina.
- Prototipado e investigacion de tecnicas de streaming de expertos: el pack es un caso de estudio reproducible para medir el equilibrio entre filas de expertos residentes, memoria unificada y velocidad de SSD en inferencia MoE fuera de memoria.
- Uso como endpoint local de bajo coste por peticion: al no depender de GPUs dedicadas ni de facturacion por token, sirve para experimentacion intensiva en un unico equipo Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos son mediciones de rendimiento de servicio del autor en un M5 Max de 128 GB con SSD interno de unos 13,5 GB/s, KV en bf16, lane MTP activada y residentes FP8.

Mediciones con prompt estandar de 16.382 tokens (tarea de codigo):

| Celda | Filas (prefill/decode) | Prefill tok/s | Decode tok/s | TTFT | Respuesta |
|---|---|---:|---:|---:|---|
| Tarjeta 16K, respuesta de 16.384 tokens (media de 2, salidas identicas) | 134 / 152 | 999,8 | 28,25 | 16,4 s | 16.384 tokens, tope |
| Tarjeta 16K, respuesta de 688 tokens | 130 / 147 | 1.003,9 | 31,6 | 16,3 s | Completa, parada por EOS |
| Tarjeta 16K en el binario de referencia | 130 / 147 | 998,8 | 32,3 | 16,4 s | Completa, parada por EOS |

Escalera por longitud de prompt (una peticion en frio por longitud, filas fijadas al presupuesto de memoria):

| Tokens de prompt | Filas (prefill/decode) | Prefill tok/s | Decode tok/s | TTFT | Respuesta |
|---:|---|---:|---:|---:|---|
| 1.023 | 130 / 147 | 92,3 (primera en frio) | 31,6 | 11,1 s | EOS |
| 2.048 | 129 / 146 | 178,3 | 33,1 | 11,5 s | EOS |
| 4.096 | 129 / 146 | 345,5 | 32,2 | 11,9 s | EOS |
| 8.192 | 129 / 146 | 654,4 | 30,9 | 12,5 s | EOS |
| 16.384 | 129 / 146 | 978,5 | 30,7 | 16,7 s | EOS |
| 32.768 | 128 / 144 | 827,8 | 31,3 | 39,6 s | EOS |
| 65.536 | 125 / 142 | 743,9 | 29,1 | 88,1 s | EOS |
| 131.072 | 121 / 139 | 599,9 | 25,7 | 3,6 min | EOS |
| 262.144 | 114 / 133 | 439,9 | 21,3 | 9,9 min | EOS |
| 524.287 | 98 / 120 | 296,1 | 15,4 | 29,5 min | EOS |
| 1.032.192 | 67 / 96 | 179,6 | 9,6 | 95,8 min | EOS |

Segun el autor, cada escalon devolvio una respuesta completa y correcta a la misma tarea de codigo con cinco funciones situada al final del contexto.

## Requisitos de hardware

- Memoria unificada: Apple Silicon con 128 GB; el pack fp8res necesita entre 104 y 108 GB aproximadamente con un prompt de 16K.
- GPU/SoC recomendado: Apple M5 Max de 128 GB (unica configuracion medida).
- Almacenamiento: el pack (171 GB) debe residir en el SSD interno; `experts.bin` debe ser un fichero real o un enlace duro (se lee con E/S no cacheada). SSD medido de unos 13,5 GB/s.
- No cabe en GPUs de consumo tipo RTX 4090 ni en equipos Apple con menos de 128 GB de memoria unificada, segun los requisitos declarados.
- Ajuste de sistema: hay que elevar el limite cableado con `sudo sysctl iogpu.wired_limit_mb=114688`.
- Software: mlx-serve con el plugin mlx-stream (rama host `pr/mimo-host` y rama plugin `feat/mimo-v26-flash`, aun sin fusionar en el momento de la medicion); servidor con API compatible con OpenAI.
- Parametros de despliegue relevantes: `--ctx-size`, `--no-vision`, `--prefix-cache-entries 0`, `--kv-quant off`, `--wired-margin-gib 2`, variables `MLX_SERVE_GPU_CEILING_MB` y ajustes de `expert_streaming.settings` (`expert_prefill_rows`, `expert_rows`, `mtp_lane`).
- Latencia y throughput medidos: unos 30 tok/s de decodificacion y ~1.000 tok/s de prefill a 16K; la decodificacion cae a 9,6 tok/s y el TTFT sube a 95,8 minutos en el extremo de 1.032.192 tokens de prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-MOPD-fp8res-mlx-stream (este pack) | 309B totales (residentes ~6B) | 1.048.576 tokens | MIT | HuggingFace; requiere Apple Silicon de 128 GB y plugin mlx-stream | Streaming de expertos desde SSD; bilingue en/zh; sin benchmarks de calidad publicados |
| XiaomiMiMo/MiMo-V2.6-Flash-MOPD (base) | 309B totales | No disponible en esta busqueda | MIT | HuggingFace | Modelo original de Xiaomi del que deriva este pack; sin cuantizar para servir en Apple Silicon |
| Otros modelos de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos suficientes en la informacion proporcionada para comparar con alternativas equivalentes |

## Limitaciones y advertencias

- No es un modelo original ni oficial: es un reempaquetado de terceros (autor OpensourceWTF), con 0 descargas y 0 likes en el momento de la consulta; la fiabilidad de mantenimiento no esta garantizada.
- Requiere exclusivamente Apple Silicon con 128 GB de memoria unificada; no es portable a GPUs NVIDIA u otros aceleradores.
- Depende de ramas no fusionadas de mlx-serve y mlx-stream, lo que implica inestabilidad potencial y necesidad de compilar desde codigo en ramas concretas.
- El rendimiento cae de forma marcada con contextos muy largos: a partir de 524.287 tokens el decode baja a 15,4 tok/s y el TTFT a 29,5 minutos, y a 1.032.192 tokens el TTFT supera los 95 minutos.
- Solo soporta ingles y chino; no hay soporte multilingue mas alla de esos dos idiomas.
- Vision desactivada explicitamente (`--no-vision`), por lo que no hay capacidades multimodales en este pack.
- No se documentan capacidades de tool calling ni function calling, ni benchmarks de calidad; el riesgo de alucinacion no esta cuantificado en la informacion disponible.
- El banco de expertos `experts.bin` debe ser un fichero real o enlace duro y se lee con E/S no cacheada: el rendimiento depende criticamente de la velocidad del SSD.
- Licencia MIT heredada del lanzamiento; en principio permite uso comercial, pero conviene verificar el modelo base original (Xiaomi) y el estado de las ramas del plugin antes de un despliegue en produccion.
- El pack ocupa 171 GB y exige configuracion manual del limite cableado del sistema (`iogpu.wired_limit_mb`).

## Enlaces

- Repositorio HuggingFace del pack: https://huggingface.co/OpensourceWTF/MiMo-V2.6-Flash-MOPD-fp8res-mlx-stream
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- mlx-serve: https://github.com/ddalcu/mlx-serve
- Plugin mlx-stream: https://github.com/davidtai/mlx-stream
- Documentacion del plugin para MiMo: https://github.com/davidtai/mlx-stream/blob/feat/mimo-v26-flash/docs/mimo.md
- Descripcion del pack y su construccion: https://github.com/davidtai/mlx-stream/blob/feat/mimo-v26-flash/docs/mimo-pack.md
