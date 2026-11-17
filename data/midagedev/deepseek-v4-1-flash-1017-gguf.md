# midagedev/DeepSeek-V4.1-Flash-1017-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de generacion de texto de gran escala desarrollado por DeepSeek, con 748.494.643.824 parametros totales segun los pesos en safetensors del modelo base. Esta ficha describe la cuantizacion GGUF publicada por el usuario midagedev bajo el identificador `midagedev/DeepSeek-V4.1-Flash-1017-GGUF`, una version requantizada del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` con licencia MIT.

La publicacion concreta es un GGUF con esquema Q3_K_M (denominado `bq3km`) generado con una importance matrix propia mediante la herramienta bloomery del autor. El archivo ocupa 347,4 GB repartidos en 9 shards y esta pensado para ejecutarse en una unica estacion de trabajo con una GPU de 48 GB y 256 GB de RAM de sistema, sirviendo los expertos enrutados que no caben en la tarjeta desde memoria host.

Su relevancia es practica: permite ejecutar un modelo de casi 750.000 millones de parametros en hardware de gama alta pero no de centro de datos, con perdida de calidad medida (KLD y PPL) frente al cuantizado de referencia `UD-Q4_K_XL` de unsloth y con velocidades de decodificacion de entre 37 y 45 tok/s en una RTX A6000. La arquitectura GGUF declarada es `deepseek41`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GGUF con arquitectura `deepseek41`; el modelo base usa mezcla de expertos (MoE) segun la nomenclatura de expertos enrutados y compartidos de la model card |
| Parametros totales | 748.494.643.824 (748,5 mil millones) segun safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card no la declara; las mediciones usan ventanas de 2.048 tokens) |
| Tipos de cuantizacion | Q3_K, Q4_K, Q5_K, Q6_K combinados por tensor (esquema `bq3km`); F32 en normas, router y sesgos |
| Idiomas soportados | no disponible oficialmente; la model card reporta evaluacion en ingles y coreano, y texto de codigo |
| Licencia | MIT (se incluye el archivo LICENSE del modelo base sin cambios) |
| Formato de pesos | GGUF (9 shards, 347,4 GB), mas un archivo de importance matrix en formato imatrix GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE), a juzgar por la presencia de expertos enrutados y compartidos con proyecciones gate, up y down, y por las 15.360 rutas de expertos enrutados mencionadas en la model card. Tambien aparecen componentes propios de DeepSeek: proyecciones de atencion descompuestas (q_a, q_b, kv, output_a, output_b, compressor), proyecciones de indexer, funciones de hiper-conexion y un modulo denominado engram. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos no estan en la informacion proporcionada.

La innovacion tecnica de esta publicacion no esta en el modelo sino en el proceso de cuantizacion. Se parte del cuantizado `UD-Q4_K_XL` de unsloth y se requantiza con `bloomery-quantize` (`--allow-requantize --keep-split`) aplicando una regla por tensor: expertos enrutados y compartidos gate/up en Q3_K, down en Q4_K (capas 0 y 1 en Q5_K), atencion e indexer en Q3_K, cabeza de salida en Q6_K y normas, router y sesgos en F32. La importance matrix se recolecto ejecutando el modelo sobre 40 fragmentos de 2.048 tokens de texto mixto (Wikipedia en ingles y coreano y codigo), contando cada seleccion de experto enrutado; 27 de los 15.360 expertos enrutados nunca fueron seleccionados y se cuantizaron sin importancia. El total requantizado tarda 2.291 segundos en 32 nucleos. Existe un sidecar opcional `r8` de 155,7 GB para paginar gate y up de los expertos enrutados, aunque no es necesario para el funcionamiento por defecto.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y la plantilla de chat incluida en la cabecera GGUF indican uso para dialogo.
- Razonamiento y generacion de codigo: la model card evalua explicitamente texto de codigo (fuente Rust de mistral.rs) con KLD y PPL, lo que confirma manejo de codigo.
- Capacidades multilingues: se reporta evaluacion en ingles y coreano; no hay lista oficial de idiomas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con APIs compatibles.
- Ejecucion con offload de expertos a RAM host: el runtime puede servir los expertos enrutados que no caben en la GPU desde memoria del sistema.
- Soporte de importance matrix y sidecar r8 para optimizar el paginado de expertos enrutados.
- Tool calling, function calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo de ~750.000 millones de parametros en una sola estacion de trabajo: con una GPU de 48 GB y 256 GB de RAM host, el esquema `bq3km` permite servir el modelo sin clúster multi-GPU, lo que habilita experimentacion a equipos con presupuesto limitado.
- Generacion de codigo en local: la evaluacion sobre fuente Rust muestra KLD 0,0651 y PPL 1,976, cercano al cuantizado de referencia, por lo que es adecuado para asistencia de programacion en entornos con requisitos de privacidad donde no se puede usar una API externa.
- Procesamiento de documentacion tecnica y articulos largos: con ventanas de evaluacion de 2.048 tokens y decodificacion estable a profundidades de 512 y 4.096 tokens (45,34 y 37,04 tok/s), sirve para resumir y analizar textos tecnicos en ingles y coreano.
- Traduccion y generacion en coreano: la model card reporta KLD 0,1191 y PPL 3,434 en Wikipedia coreana, lo que lo hace util para tareas de procesamiento de lenguaje natural en ese idioma con calidad verificada.
- Investigacion sobre cuantizacion: el repositorio incluye la importance matrix y las metricas KLD/PPL por texto, lo que permite reproducir y comparar tecnicas de cuantizacion con importance matrix frente a esquemas Q3_K_M planos.
- Servicio conversacional autoalojado: la plantilla de chat en la cabecera y la etiqueta `conversational` permiten montar un endpoint de chat compatible con APIs estandar usando el runtime bloomery (`bloomery-serve --hf ...`).
- Evaluacion de calidad de cuantizaciones: los datos de KLD con errores estandar (±0,010 en ingles, ±0,0046 en coreano, ±0,0035 en codigo) permiten usar el modelo como referencia para validar otras tecnicas de cuantizacion.

## Benchmarks y rendimiento

Metricas de calidad frente al cuantizado de referencia `UD-Q4_K_XL` de unsloth, sobre 4 ventanas de 2.048 tokens por texto. KLD mas bajo es mejor; PPL es la perplejidad del propio archivo.

| Texto | Q3_K_M (`vcruz305`) | bq3km (este archivo) |
|---|---|---|
| Ingles (wikitext-2 test) | KLD 0,259; PPL 2,295 | KLD 0,215; PPL 2,183 |
| Coreano (Wikipedia no incluida en calibracion) | KLD 0,1345; PPL 3,510 | KLD 0,1191; PPL 3,434 |
| Codigo (Rust de mistral.rs) | KLD 0,0758; PPL 2,012 | KLD 0,0651; PPL 1,976 |

Perplejidad del cuantizado de referencia `UD-Q4_K_XL`: 3,268 en coreano y 1,897 en codigo.

Rendimiento medido con bloomery `generate_ds41` en RTX A6000 (300 W) con expertos enrutados servidos desde RAM host (`--place a`) y AMD Threadripper PRO 5975WX, 3 rondas con orden rotado:

| Metrica | Q3_K_M (`vcruz305`) | bq3km |
|---|---|---|
| Prompt, 4.096 tokens | 387,7 tok/s | 403,1 tok/s (+4,0 %) |
| Prompt, 512 tokens | 245,2 tok/s | 238,0 tok/s (−2,9 %) |
| Decodificacion a profundidad 512 | 45,72 tok/s | 45,34 tok/s |
| Decodificacion a profundidad 4.096 | 37,06 tok/s | 37,04 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: el autor indica que funciona con una GPU de 48 GB mas 256 GB de RAM de sistema, sirviendo desde host los expertos enrutados que no caben en la tarjeta.
- GPU recomendadas: RTX A6000 (48 GB) es la configuracion medida; cualquier GPU de 48 GB o mas deberia poder alojar la parte residente, con el resto en RAM host.
- Almacenamiento: 347,4 GB para los 9 shards GGUF, mas 155,7 GB opcionales del sidecar `r8`.
- RAM host: 256 GB segun el autor, necesarios para los expertos enrutados servidos desde memoria del sistema.
- CPU: Threadripper PRO 5975WX en la medicion; 32 nucleos usados para la requantizacion.
- Despliegue: runtime bloomery (`bloomery-serve --hf midagedev/DeepSeek-V4.1-Flash-1017-GGUF:bq3km`). El autor afirma que cualquier runtime que lea GGUF de DeepSeek-V4.1-Flash y tipos K-quant deberia funcionar, pero solo se ha probado con bloomery.
- Latencia y throughput: decodificacion de 45,34 tok/s a profundidad 512 y 37,04 tok/s a profundidad 4.096; prefill de 403,1 tok/s con prompt de 4.096 tokens en la configuracion medida.
- No cabe en GPU de consumo (RTX 4090 de 24 GB u otras) sin offload masivo a RAM host, dada la magnitud del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bq3km (este archivo) | 748,5 mil millones | no disponible | KLD 0,215 (ingles), 0,1191 (coreano), 0,0651 (codigo) | MIT | GGUF, 347,4 GB, 9 shards |
| Q3_K_M de `vcruz305/DeepSeek-V4.1-Flash-GGUF` | 748,5 mil millones | no disponible | KLD 0,259 (ingles), 0,1345 (coreano), 0,0758 (codigo) | no disponible | GGUF |
| `unsloth/DeepSeek-V4.1-Flash-1017-GGUF` UD-Q4_K_XL | 748,5 mil millones | no disponible | PPL 3,268 (coreano), 1,897 (codigo); referencia de KLD | no disponible | GGUF |

No se dispone de datos de comparacion con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad respecto al modelo base: KLD de 0,215 en ingles, 0,1191 en coreano y 0,0651 en codigo frente a la referencia UD-Q4_K_XL.
- La importance matrix se calculo con 40 fragmentos de 2.048 tokens de Wikipedia en ingles y coreano y codigo; 27 de los 15.360 expertos enrutados nunca fueron seleccionados y se cuantizaron sin importancia, lo que puede degradar su comportamiento en dominios no cubiertos por la calibracion.
- La evaluacion de calidad se limita a ingles, coreano y codigo; no hay datos de otros idiomas, incluido el castellano.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que la comparacion con otros modelos en tareas concretas no es posible con los datos disponibles.
- Solo se ha probado con el runtime bloomery; el autor afirma compatibilidad con otros runtimes que lean GGUF `deepseek41` y K-quant, pero no lo ha verificado.
- El modelo requiere hardware considerable (GPU de 48 GB y 256 GB de RAM host); no es viable en equipos de consumo.
- La model card indica que la cuantizacion, la importance matrix, las mediciones y la propia tarjeta se realizaron con ayuda de IA (Claude) bajo revision del mantenedor, lo que conviene tener en cuenta al interpretar los resultados.
- La licencia MIT del modelo base se incluye sin cambios; no se indica ninguna restriccion adicional para uso comercial en la informacion disponible.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/midagedev/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizado de referencia (origen): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Cuantizado Q3_K_M comparado: https://huggingface.co/vcruz305/DeepSeek-V4.1-Flash-GGUF
- Herramienta bloomery: https://github.com/midagedev/bloomery
