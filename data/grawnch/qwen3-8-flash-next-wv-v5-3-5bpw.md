# Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw

## Resumen

Qwen3.8-Flash-Next-WV-v5-3.5bpw es una cuantizacion GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch bajo licencia Apache 2.0. Se trata de un checkpoint maestro de 48 capas cuantizado a 3,5 bits por peso mediante el metodo propietario "Wave-Quant v5" (WV-v5), distribuido en dos shards que suman 84,1 GB en el repositorio. El modelo base es un transformer de tipo Mixture-of-Experts con 176.943.889.600 parametros totales, 512 expertos enrutados con Top-10 activo mas un experto compartido, y una combinacion de 36 capas GDN (Gated Delta Network) y 12 capas sparse-QSA.

El interes de esta publicacion reside en la agresividad de la receta de cuantizacion: reduce un modelo de aproximadamente 180B parametros a 3,5 bpw manteniendo, segun el autor, una perplejidad inferior a la del BF16 en el conjunto held-out externo (11,422 frente a 10,068) y un KLD medio de 0,11252 en generacion propia de matematicas y codigo. La model card detalla tecnicas poco habituales como la eliminacion de ruido del Hessiano mediante teoria de matrices aleatorias (Marchenko-Pastur), la calibracion multi-dominio sin repeticion y una cirugia LDA con doble Gram-Schmidt sobre el lm_head en Q8_0.

Es relevante ahora porque permite desplegar un modelo MoE de escala 180B en hardware mas modesto que el BF16 equivalente, con un shard principal de 55,31 GB que contiene el spine denso, los expertos compartidos y la cabeza, y un segundo shard de 30,51 GB con los embeddings por capa (PLE) mapeables en memoria del host. No obstante, el repositorio no registra descargas ni interacciones en el momento de la consulta y la informacion sobre el modelo base es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 36 capas GDN (Gated Delta Network) + 12 capas sparse-QSA; 48 capas totales |
| Parametros totales | 176.943.889.600 |
| Parametros activos | Top-10 expertos enrutados de 512 + 1 experto compartido (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible (la model card menciona evaluacion a 128K en el repack SM120-v20) |
| Tipos de cuantizacion | WV-v5 a 3,5 bpw; componentes internos: Q8_0 (spine denso, expertos compartidos, lm_head), FP32 (norms y puertas GDN), Q4_0 (embeddings de tokens), PLE en mmap |
| Idiomas soportados | no disponible (la calibracion cubre 12 lenguajes de programacion y texto en ingles via WikiText-2) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2 shards: 55,31 GB + 30,51 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE con 512 expertos enrutados, activacion Top-10 mas un experto compartido, distribuidos en 48 capas. La particularidad estructural es la mezcla de dos tipos de capa: 36 capas GDN (Gated Delta Network, un mecanismo de atencion lineal con estado recurrente) y 12 capas sparse-QSA (atencion dispersa). Esta hibridacion busca combinar la eficiencia de las redes de estado con la capacidad de recuperacion de la atencion dispersa en contextos largos.

La cuantizacion WV-v5 aplica una receta de calibracion multi-dominio sin repeticion que combina trayectorias on-policy de matematicas, logica y codigo generadas con el modo `<think>...</think>`, codigo poliglota en 12 lenguajes (python, rust, go, cpp, java, javascript, typescript, csharp, ruby, php, bash y sql) y WikiText-2, con un balance Hessiano del 50% prosa y 50% matematicas mas codigo. Sobre las capas GDN previas a QSA (indices `l % 4 == 2`) se aplica una ponderacion temporal por trimestres (0,40 Q1 + 0,10 Q2 + 0,10 Q3 + 0,40 Q4) en lugar de una rampa monotona, para preservar la recuperacion de claves de contexto temprano. Ademas, se aplica una eliminacion de ruido del Hessiano basada en la ley de Marchenko-Pastur (`MP+DG-Flat`, con relacion r/D < 0,5) que contrae los autovalores de expertos frios inframuestreados y preserva los picos de senal. La cabeza de salida (`lm_head`) se mantiene en Q8_0 con una cirugia LDA de doble Gram-Schmidt sobre 9 tokens, que segun el autor reduce el KLD solo-cabeza frente a BF16 entre un 24,5% y un 47,8%.

## Capacidades

- Generacion de texto y razonamiento en modo extendido mediante trayectorias `<think>...</think>`, segun la calibracion empleada.
- Generacion de codigo en 12 lenguajes de programacion (python, rust, go, cpp, java, javascript, typescript, csharp, ruby, php, bash, sql), segun la composicion del dataset de calibracion.
- Razonamiento matematico y logico, con evaluacion reportada en MathArena/aime_2025 (Pass@1 30/30 en el repack SM120-v20 a 3,1 bpw y 128K).
- Capacidades multilingues: no disponible; la model card no especifica cobertura de idiomas naturales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructura de inferencia estandar, aunque no se detalla el alcance.

## Casos de uso

- Inferencia de un MoE de 180B en servidores con una sola GPU de 80 GB: el shard principal de 55,31 GB contiene el spine denso y los expertos compartidos, por lo que puede cargarse en una A100 80GB o H100 80GB dejando margen para el estado KV; el shard PLE de 30,51 GB se mapea desde memoria del host sin copiarse a VRAM.
- Evaluacion de recetas de cuantizacion extrema: investigadores que estudien el impacto de 3,5 bpw en modelos MoE con capas hibridas GDN/QSA pueden usar este checkpoint como referencia frente al BF16 original, con metricas de PPL, KLD y coseno ya publicadas.
- Generacion de codigo asistida en entornos con presupuesto de VRAM ajustado: la calibracion incluye 12 lenguajes y el modelo conserva una similitud coseno de 0,9515 frente a BF16 en generacion propia de matematicas y codigo, lo que lo hace adecuado para autocompletado y refactorizacion en pipelines de CI/CD cuando no se dispone de GPU de 320 GB para el BF16.
- Razonamiento matematico de competicion: el repack derivado reporta Pass@1 30/30 en AIME 2025 con 30 muestras y temperatura 0,0, lo que sugiere utilidad en entornos de evaluacion formal y generacion de soluciones paso a paso.
- Despliegue en estaciones de trabajo con `mmap` de host: gracias al diseno zero-copy del shard PLE, es viable en maquinas con suficiente RAM del sistema y una GPU consumer de gran capacidad, aunque el rendimiento dependera del ancho de banda PCIe.
- Servicio de inferencia con llama.cpp u Ollama: al ser formato GGUF, se integra en el ecosistema estandar de inferencia local, lo que facilita prototipado rapido y comparacion con otras cuantizaciones del mismo modelo base.
- Analisis de textos largos en ingles: la evaluacion en WikiText-2 a 2048 tokens muestra una perplejidad de 2,363 frente a 2,164 en BF16, un degradado moderado que puede ser aceptable en tareas de procesamiento documental donde el ahorro de memoria prima sobre la fidelidad absoluta.

## Benchmarks y rendimiento

| Suite | Metrica | Resultado |
|---|---|---|
| 48 capas directo vs BF16 (held-out externo 1x2048) | PPL (BF16 -> WV-v5) / CosSim | 11,422 -> 10,068 (dPPL = -1,3539) / 0,9481 |
| 48 capas directo vs BF16 (self-gen math/code 1x2048) | KLD medio / Top-1 / CosSim | 0,11252 / 89,30% / 0,9515 |
| 48 capas directo vs BF16 (WT2_2048) | PPL (BF16 -> WV-v5) / CosSim | 2,164 -> 2,363 / 0,9429 |
| Strata v1 yardstick 5 dominios (4.995 posiciones) | PPL de referencia (code / all) | 2,108 / 3,920 |
| Repack SM120-v20 3,1 bpw 128K MathArena/aime_2025 | Pass@1 (B=30, pp=0,0, vanilla) | 30/30 (100,00%, 15/15 + 15/15, 0 bucles) |
| Head-only KLD vs BF16 (lm_head Q8_0) | Reduccion relativa | -24,5% a -47,8% (0,000197 math/code; 0,000279 WikiText-2) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas anteriores son internas del autor y comparan la cuantizacion con el BF16 del mismo modelo, no con modelos de terceros.

## Requisitos de hardware

- VRAM estimada: el shard principal ocupa 55,31 GB; con overhead de contexto y estado KV, se recomienda un minimo de 64-70 GB de VRAM para el shard denso. El shard PLE (30,51 GB) se mapea desde RAM del host, por lo que se necesita al menos esa cantidad de memoria del sistema disponible.
- GPU recomendadas: A100 80GB, H100 80GB, H200 o MI300X para carga completa en una sola GPU. En configuraciones multi-GPU, dos RTX 4090 (24 GB cada una) no bastan para el shard principal; serian necesarias al menos tres, con las limitaciones de agregacion de memoria.
- GPU consumer: no cabe en una unica GPU consumer de 24 GB. Es viable en configuraciones con multiples GPU de 24 GB o en GPUs profesionales de 48 GB o mas, siempre con el shard PLE en host.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; la etiqueta `endpoints_compatible` sugiere soporte en plataformas de endpoints gestionados. vLLM y TGI no estan confirmados para esta cuantizacion concreta.
- Latencia y throughput: no disponibles. El rendimiento dependera del ancho de banda de memoria y del numero de expertos activados por token (Top-10 de 512), lo que implica un trafico de pesos elevado por token generado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5-3.5bpw | 176,94B | no disponible | 3,5 bpw WV-v5 (GGUF) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (BF16) | 176,94B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Repack SM120-v20 3,1 bpw | 176,94B | 128K | 3,1 bpw | Apache 2.0 | Referenciado en la model card, disponibilidad no confirmada |

No se dispone de informacion sobre modelos comparables de otros autores con arquitectura y escala equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3,5 bpw introduce degradacion medible: la perplejidad en WikiText-2 sube de 2,164 a 2,363 y la similitud coseno con BF16 baja a 0,9429 en ese dominio, aunque en el held-out externo la PPL reportada mejora.
- Las metricas publicadas son internas del autor y no han sido replicadas de forma independiente; el repositorio registra 0 descargas y 0 likes, lo que impide validacion por la comunidad.
- El checkpoint esta dividido en dos shards con gestion manual del PLE mediante `mmap`; un mal mapeo o memoria de host insuficiente puede provocar fallos de carga o degradacion severa del rendimiento.
- La model card no documenta sesgos conocidos, cobertura de idiomas naturales ni comportamiento en dominios fuera de matematicas y codigo.
- No hay informacion sobre tool calling, capacidades de agente ni modo de razonamiento en produccion; la calibracion con `<think>` no garantiza que el tokenizador o la plantilla de chat del GGUF preserven ese comportamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen puede tener terminos adicionales que conviene verificar en su repositorio original.
- El riesgo de alucinacion no esta cuantificado; en tareas de codigo y matematicas, la temperatura 0,0 usada en la evaluacion AIME sugiere que los resultados pueden no extrapolarse a muestreo estocastico.
- El repack SM120-v20 citado en los benchmarks es una variante distinta (3,1 bpw, 128K) y sus resultados no deben atribuirse directamente a este checkpoint de 3,5 bpw.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Shard 1: `Qwen3.8-Flash-Next-WV-v5-3.5bpw-00001-of-00002.gguf` (55,31 GB)
- Shard 2: `Qwen3.8-Flash-Next-WV-v5-3.5bpw-00002-of-00002.gguf` (30,51 GB)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
