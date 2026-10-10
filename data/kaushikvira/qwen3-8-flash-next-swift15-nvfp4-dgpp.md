# kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-dgpp

## Resumen

Este repositorio contiene un checkpoint cuantizado en NVFP4 (formato ModelOpt) del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, publicado por el usuario kaushikvira. No se trata de un modelo entrenado desde cero, sino de una conversion de formato y cuantizacion: los pesos originales en BF16 de Swift 1.5, un fine-tune de eficiencia de razonamiento sobre Qwen3.8-Flash-Next, se han reempaquetado para que puedan servirse en el motor de inferencia dgpp sobre dos nodos NVIDIA DGX Spark (GB10) con paralelismo tensorial TP=2.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con 512 expertos y 119.602.003.859 parametros totales, derivado del base Qwen/Qwen3.8-Flash-Next mediante post-entrenamiento con RL y OPD (segun la model card). La contribucion de Swift 1.5 es de eficiencia de razonamiento: produce menos tokens de pensamiento con una precision aproximadamente equivalente, lo que abarata y acelera las respuestas en cargas agenticas y de chat. El artefacto ocupa 125,87 GiB en 52 shards (frente a los 336 GB del BF16 original), lo que lo hace servible en el hardware objetivo.

La relevancia de esta ficha radica en que ilustra un patron habitual en el ecosistema: un modelo grande gateado se cuantiza a un formato especifico de motor para poder ejecutarse en hardware de gama de escritorio. Aqui el autor no reclama mejoras de velocidad ni de precision, sino unicamente la cuantizacion NVFP4 que permite servir el fine-tune en el par de Spark; la ganancia de eficiencia de tokens es heredada de Swift 1.5 y depende del prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), 512 expertos, derivado de Qwen3.8-Flash-Next |
| Parametros totales | 119.602.003.859 (~119,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos de expertos), FP8 E4M3 (tabla n-gram/PLE, densas, normas, embeddings), BF16 (expertos borrador MTP, reencodeados a FP8 en carga) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (125,87 GiB, 296.475 tensores, 52 shards) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE. Los pesos de origen almacenan los expertos de forma fusionada y apilada con la forma `experts.gate_up_proj [512, 2I, H]`, es decir, 512 expertos con proyecciones gate y up concatenadas. El proceso de cuantizacion desapila y desfusiona estas matrices a la forma por experto que espera dgpp (`experts.E.{gate,up,down}_proj`, 294.912 tensores), verificando el emparejamiento correcto contra la release NVFP4 de NVIDIA (coseno 0,9967 en el emparejamiento correcto frente a 0,0086 en el cruzado). La codificacion NVFP4 sigue la receta propia del motor: `weight_scale_2 = amax/2688`, una escala de bloque e4m3 cada 16 elementos, codigos e2m1 a dos por byte y redondeo RNE con saturacion.

No hay entrenamiento propio en este repositorio: es una conversion de formato mas cuantizacion. El modelo fuente, ukisai/Swift1.5-Qwen3.8-Flash-Next (336 GB, 131 shards, gateado), es a su vez un derivado post-entrenado de Qwen/Qwen3.8-Flash-Next mediante RL y OPD (siglas segun la model card, significado no desarrollado). Otras peculiaridades tecnicas documentadas: la tabla n-gram (PLE) se reencodea a F8_E4M3 con `ws = absmax/448 → 0,000199317932`, identica a la release de NVIDIA; los expertos borrador de MTP se conservan como par fusionado en BF16 y dgpp los reencodea a FP8 al cargar; y las capas densas, normas y embeddings se copian byte a byte (1.560 tensores) y se cargan como FP8.

## Capacidades

- Generacion de texto conversacional y de codigo, segun el pipeline declarado (text-generation) y la etiqueta conversational.
- Razonamiento con modo de pensamiento: el modelo base incluye comportamiento de "thinking" y Swift 1.5 lo reduce, con menos tokens de razonamiento a precision aproximadamente igual.
- Prediccion multi-token (MTP): el artefacto incluye expertos borrador MTP, con 2,9 tokens por paso y tasas de aceptacion de 73% (p1), 52% (p2), 36% (p3) y 28% (p4) en profundidad 0.
- Decodificacion especulativa mediante el mecanismo MTP integrado en el motor.
- Soporte de plantilla de chat Jinja a traves del interpretador del motor dgpp.
- Carga agentica y de desarrollo segun la model card, con reduccion de tokens en chat y en la tarea denominada "rancube".
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistencia conversacional multi-turno servida en local: el modelo se sirve a traves de la API HTTP compatible con OpenAI de dgpp, con lo que puede integrarse como backend de un chat corporativo sin exponer datos a terceros. La reduccion del 24% de tokens en chat (-24,6% de tiempo de pared) abarata cada respuesta en entornos de alto volumen.
- Generacion de codigo en produccion con asistencia agentica: la decodificacion en JSON alcanza 98-101 tok/s en profundidad 0 y 192 tok/s en C4, y en codigo 86-92 tok/s y 165 tok/s respectivamente, lo que permite completar, refactorizar o generar tests en bucles de desarrollo con latencia baja.
- Pipelines de agentes con tool calling: aunque la model card no detalla el soporte explicito de function calling, la carga objetivo declarada es agentica y de desarrollo, con plantilla Jinja y salida estructurada en JSON, lo que encaja con orquestadores que necesitan respuestas cortas y predecibles.
- Procesamiento por lotes de prompts largos en local: el prefill de 1,86-2,29k tok/s (de pp2048 a pp8192) y un TTFR de 8,7 s a 16k y 18,2 s a 32k de profundidad permiten ingerir documentos extensos, si bien el limite de contexto no esta confirmado.
- Despliegue en cluster de dos nodos sobre RoCE: la configuracion de referencia usa world_size 2 y paralelismo tensorial sobre RDMA, adecuada para equipos que ya disponen de un par de DGX Spark y quieren un endpoint propio.
- Servicio gateway para equipos de desarrollo: la model card enmarca el artefacto como gateway para carga agentica y de chat, de modo que puede actuar como punto unico de inferencia para varias herramientas internas con un motor C++/CUDA estable.
- Evaluacion comparativa de eficiencia de razonamiento: util para medir en produccion la diferencia entre un modelo base y su variante de bajo consumo de tokens, dado que ambas variantes comparten familia, formato y velocidad de decodificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos numericos son de rendimiento de inferencia en el hardware objetivo.

| Metrica | Valor |
|---|---|
| Decodificacion, profundidad 0 (C1), prosa | ~55-60 tok/s |
| Decodificacion, profundidad 0 (C1), codigo | ~86-92 tok/s |
| Decodificacion, profundidad 0 (C1), JSON | ~98-101 tok/s |
| Decodificacion en C4, prosa/chat | 114-124 tok/s |
| Decodificacion en C4, codigo | 165 tok/s |
| Decodificacion en C4, JSON | 192 tok/s |
| Prefill | 1,86-2,29k tok/s (pp2048 a pp8192) |
| TTFR | 1,0 s en profundidad 0; 8,7 s a 16k; 18,2 s a 32k |
| MTP (profundidad 0) | 2,9 tok/paso; aceptacion p1 73% / p2 52% / p3 36% / p4 28% |
| Eficiencia de tokens en chat | -24% tokens / -24,6% tiempo de pared |
| Eficiencia de tokens en "rancube" | -48% tokens / -45% tiempo de pared |
| Razonamiento dificil | sobrepensamiento +39%; la reduccion del 31-57% del upstream no se reprodujo |

## Requisitos de hardware

- VRAM minima estimada: el artefacto pesa 125,87 GiB, por lo que necesita al menos esa capacidad mas el espacio de trabajo del motor; no cabe en una sola GPU de consumo.
- GPU recomendadas: dos nodos NVIDIA DGX Spark (GB10) en configuracion TP=2, que es el entorno de referencia documentado.
- Compatibilidad con GPU de consumo: no viable en tarjetas de consumo convencionales por tamano; el hardware objetivo es la memoria unificada de DGX Spark.
- Opciones de despliegue documentadas: motor dgpp (`dgpp-serve`, build 0.1.0+g41e3216d845e), con API HTTP compatible con OpenAI y paralelismo tensorial sobre RoCE. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Red: paralelismo tensorial sobre RoCE para despliegues de uno, dos o cuatro nodos segun la descripcion del motor.
- Latencia y throughput: decodificacion de ~55-60 tok/s en prosa a profundidad 0 y hasta 192 tok/s en JSON en C4; prefill de 1,86-2,29k tok/s; TTFR de 1,0 s en profundidad 0.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-dgpp | 119,6 B (MoE, 512 expertos) | NVFP4/FP8, dgpp | no disponible | swift-open-license-1.0 | Publico, 0 descargas |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | no disponible (pesos BF16 de 336 GB, 131 shards) | BF16 | no disponible | swift-open-license-1.0 | Gateado |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible (misma familia) | NVFP4 ModelOpt | no disponible | no disponible | Publico (referencia de layout) |
| Qwen/Qwen3.8-Flash-Next | no disponible (modelo base) | no disponible | no disponible | no disponible | Publico (modelo base upstream) |

La comparativa directa relevante es contra la release NVFP4 de NVIDIA: la model card afirma que comparten familia, formato, motor y velocidad de decodificacion, y que la unica diferencia son los pesos de Swift 1.5, con menor consumo de tokens en chat y carga agentica pero sin mejora confirmada en razonamiento dificil.

## Limitaciones y advertencias

- No es una mejora de velocidad ni de precision: la model card lo indica explicitamente; la ganancia es de eficiencia de tokens y es dependiente del prompt.
- La reduccion de tokens del upstream (31-57%) no se reprodujo en la sonda del autor; en razonamiento dificil se observa un sobrepensamiento del +39%.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de razonamiento con modo de pensamiento, conviene validar las salidas.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: no disponibles; la longitud de contexto no se documenta en la ficha, lo que impide garantizar cargas de contexto largo mas alla de los TTFR medidos hasta 32k de profundidad.
- Licencia: swift-open-license-1.0, etiquetada como "other". No se detallan en la informacion disponible las condiciones de uso comercial; debe consultarse el enlace de licencia antes de cualquier despliegue productivo.
- Dependencia de un motor especifico: el checkpoint esta empaquetado para dgpp y no se declara compatibilidad con otros motores, lo que ata el despliegue a ese software y a hardware DGX Spark.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- El checkpoint no incluye entrenamiento propio: cualquier problema de comportamiento proviene del modelo fuente y debe reportarse a sus autores.
- Contexto temporal: las fechas del repositorio (octubre de 2026) son posteriores al conocimiento de referencia, por lo que los datos proceden exclusivamente de la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-dgpp
- Modelo fuente (BF16, gateado): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Licencia del modelo fuente: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Referencia de layout NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Motor de inferencia dgpp: https://github.com/HawkBearPig/dgpp
