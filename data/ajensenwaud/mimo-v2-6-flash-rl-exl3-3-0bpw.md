# ajensenwaud/MiMo-V2.6-Flash-RL-exl3-3.0bpw

## Resumen

MiMo-V2.6-Flash-RL-exl3-3.0bpw es un paquete cuantizado en formato EXL3 (exllamav3) de 3,03 bits por peso del modelo XiaomiMiMo/MiMo-V2.6-Flash-RL, publicado por el usuario ajensenwaud en HuggingFace. No es un modelo entrenado desde cero: es una conversión de pesos pensada para ejecutarse en hardware de gama de escritorio profesional, concretamente en dos NVIDIA DGX Spark (GB10) con paralelismo de tensores a TP=2. El modelo original es un MoE de 309B parámetros totales y 15B activos, según declara el autor de la conversión.

La relevancia de este paquete está en el objetivo de despliegue: los pesos ocupan 113 GB repartidos en 17 shards, de modo que caben en aproximadamente 60 GiB por Spark. La conversión se hizo con exllamav3 v1.6.0 y se evaluó con un motor específico, TensorFold, mediante la receta MiMo-V2.6-2x-DGX-Spark-TensorFold. El paquete incluye además un drafter DFlash de Xiaomi a 4 bpw para decodificación especulativa, que eleva el throughput en tareas de código sin alterar un solo byte de la salida.

Es un artefacto de despliegue, no una versión de referencia: la ventana de contexto no está documentada, el paquete es solo texto (sin torre de visión ni cabezas de audio) y las mediciones publicadas se limitan a GSM8K, MMLU-Pro, perplejidad en WikiText-2 y velocidad de decodificación. La licencia es MIT, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer; formato EXL3 de exllamav3, con cabeza MTP (multi-token prediction) y drafter DFlash para decodificacion especulativa |
| Parametros totales | 60.459.094.912 segun los metadatos de safetensors del paquete; el autor declara 309B totales para el modelo original (los pesos del paquete son coherentes con ~300B a 3,03 bpw) |
| Parametros activos | 15B (segun la model card del autor, referidos al modelo original) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 3,0 bpw (3,03 bpw excluyendo cabezas; cabeza a 8 bpw; cabezas MTP a 4 bpw). Existen paquetes comparables del mismo modelo a 2,27 bpw y 4,0 bpw |
| Idiomas soportados | en, zh |
| Licencia | MIT (heredada del modelo fuente; el drafter DFlash tambien es MIT) |
| Formato de pesos | safetensors en 17 shards, formato EXL3 de exllamav3 (no compatible con GGUF ni con safetensors estandar de transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE) de 309B parametros totales y 15B activos, desarrollado por Xiaomi MiMo. Sobre esa base, el paquete aqui descrito no aporta entrenamiento nuevo: es una cuantizacion post-entrenamiento a 3,03 bpw realizada con exllamav3 v1.6.0. La conversion uso los parametros `-b 3.0 -hb 8 -mb 4 -hq -cr 250 -cc 2048 -cb mul1` a partir del commit `5711b268` del repositorio fuente, con las cabezas de salida a 8 bpw y las cabezas MTP a 4 bpw. El paquete incluye ademas el drafter DFlash de Xiaomi a 4 bpw en EXL3, publicado originalmente por benthecarman y reutilizado aqui sin modificaciones.

La innovacion operativa del paquete es el par decodificacion especulativa sobre MoE cuantizado: el drafter DFlash propone tokens que el modelo grande verifica, y el autor afirma que las respuestas generadas con drafter son identicas byte a byte a las generadas sin el. La evaluacion se hizo unicamente con el motor de la receta, TensorFold (arquitectura `mimo_v2`), y no con exllamav3 directamente, porque a 113 GB el paquete no cabe en un solo GB10 con margen para ejecutarse. No se documenta la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional y de proposito general, en ingles y chino.
- Razonamiento aritmetico y de conocimiento general: el paquete obtiene 96,0% en GSM8K y 73,4% en MMLU-Pro con thinking desactivado y decodificacion greedy.
- Generacion y edicion de codigo: el autor mide 45,4 tok/s en decodificacion simple y 77,6 tok/s con el drafter DFlash en tareas de coding, y 44,7 / 80,8 tok/s en code edit.
- Decodificacion especulativa funcional mediante el drafter DFlash incluido en `dflash/`, con salidas identicas byte a byte a las de la decodificacion simple.
- Cabezas MTP (multi-token prediction) presentes en el paquete, a 4 bpw.
- Capacidad multimodal: no disponible en este paquete. La torre de vision y las cabezas de audio del modelo base no estan incluidas.
- Tool calling / function calling: no disponible (no documentado en la informacion del paquete).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado; ademas las evaluaciones se hicieron con thinking desactivado).
- Modo thinking: no evaluado. El autor indica explicitamente que no se midio nada con thinking activado.

## Casos de uso

- Despliegue de un MoE de gran tamano en hardware de borde para laboratorio: la receta de dos DGX Spark con TP=2 permite servir un modelo de ~300B a 3,03 bpw en unos 120 GB de pesos, algo imposible en una GPU de consumo unica, y sirve como banco de pruebas de cuantizacion agresiva sobre arquitecturas MoE.
- Generacion de codigo en produccion ligera: con 77,6 tok/s en tareas de coding gracias al drafter DFlash y salida identica a la decodificacion simple, es adecuado para asistentes de autocompletado o edicion de codigo en entornos donde no hay acceso a una granja de GPU.
- Edicion de codigo asistida: el perfil medido de code edit (80,8 tok/s con drafter) encaja en herramientas de refactorizacion interactiva donde la latencia percibida importa mas que el throughput agregado.
- Razonamiento aritmetico y de conocimiento en pipelines internos: 96,0% en GSM8K y 73,4% en MMLU-Pro en modo greedy sin thinking lo hacen util para clasificacion, extraccion y resolucion de problemas de varios pasos sin cadenas de pensamiento.
- Investigacion sobre cuantizacion y decodificacion especulativa: el paquete publica curvas comparables a 2,27, 3,0 y 4,0 bpw con pruebas de significacion (McNemar p = 0,04 entre 2,27 y 3,0 en MMLU-Pro), lo que lo convierte en un material de referencia para estudiar el compromiso entre bitrate y calidad.
- Base para despliegues multilingues en ingles y chino: ambos idiomas estan declarados en la model card y cubiertos por el modelo base, utiles para atencion al cliente o traduccion interna en esos dos idiomas.
- Benchmarking de motores de inferencia alternativos: al estar pensado para TensorFold y no para exllamav3 en solitario, sirve para comparar motores sobre un mismo conjunto de pesos EXL3.

## Benchmarks y rendimiento

Los datos provienen del propio autor. Se evaluaron 500 elementos por tarea, con thinking desactivado y decodificacion greedy, en dos DGX Spark con el motor de la receta.

| Paquete | GSM8K | MMLU-Pro | Perplejidad WikiText-2 (64 x 2048) |
|---|---|---|---|
| 2,27 bpw (benthecarman) | 95,4% | 70,0% | 5,402 |
| 3,0 bpw (este paquete) | 96,0% | 73,4% | 5,069 |
| 4,0 bpw | 96,6% | 73,6% | 4,979 |

Comparaciones emparejadas sobre los mismos elementos, MMLU-Pro: 3,0 frente a 2,27 bpw mejora 3,4 puntos (McNemar p = 0,04); 4,0 frente a 3,0 mejora 0,2 puntos (p = 0,89, no significativo). En GSM8K las diferencias estan dentro del ruido. El autor indica explicitamente que no se midieron tareas de codigo, GPQA ni nada con thinking activado.

| Tarea (dos DGX Spark, un flujo, respuestas de 512 tokens) | Decodificacion simple | Con drafter DFlash |
|---|---|---|
| Coding | 45,4 tok/s | 77,6 tok/s |
| Code edit | 44,7 tok/s | 80,8 tok/s |
| Razonamiento | 45,3 tok/s | 72,8 tok/s |
| Prosa | 45,5 tok/s | 46,0 tok/s |

Prefill aproximado: 1.200 tok/s con prompts de 30.000 a 60.000 tokens.

## Requisitos de hardware

- Pesos: 113 GB en 17 shards. A TP=2, unos 60 GiB por DGX Spark (GB10).
- No cabe en una sola NVIDIA DGX Spark GB10 con margen para ejecutarse, segun el propio autor.
- GPU de consumo: no disponible. No hay datos de ejecucion en RTX 4090, RTX 5090 ni similares; el tamano de los pesos lo descarta.
- Configuracion recomendada por el autor: dos NVIDIA DGX Spark (GB10) con paralelismo de tensores a TP=2.
- VRAM adicional para cache KV: no disponible.
- Opciones de despliegue: receta TensorFold `mimo_v2` (repositorio MiMo-V2.6-2x-DGX-Spark-TensorFold, `PACK=3.0 ./start.sh` tras `scripts/fetch_pack.sh`). El paquete es una conversion estandar de exllamav3 v1.6.0, pero se evaluo solo con el motor de la receta, no con exllamav3 en solitario.
- Compatibilidad con vLLM, TGI, llama.cpp u Ollama: no disponible, y en la practica no soportada por el formato EXL3.
- Throughput medido: 45-46 tok/s en decodificacion simple y hasta 80,8 tok/s con decodificacion especulativa en code edit; prefill de ~1.200 tok/s en prompts largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL EXL3 3,0 bpw (este) | 309B totales / 15B activos (original); 60.459.094.912 segun safetensors | no disponible | GSM8K 96,0%; MMLU-Pro 73,4%; ppl 5,069 | MIT | Paquete EXL3 para dos DGX Spark; 0 descargas, 0 likes al publicarse |
| MiMo-V2.6-Flash-RL EXL3 2,27 bpw (benthecarman) | mismo modelo base | no disponible | GSM8K 95,4%; MMLU-Pro 70,0%; ppl 5,402 | MIT | Paquete EXL3 mas pequeno y mas degradado |
| MiMo-V2.6-Flash-RL EXL3 4,0 bpw (mismo autor) | mismo modelo base | no disponible | GSM8K 96,6%; MMLU-Pro 73,6%; ppl 4,979 | MIT | Paquete EXL3 mas grande y de calidad marginalmente superior (diferencia no significativa frente a 3,0 bpw) |
| XiaomiMiMo/MiMo-V2.6-Flash-RL (modelo fuente) | 309B totales / 15B activos | no disponible | no disponible | MIT | Pesos originales; incluye torre de vision y cabezas de audio |

No se dispone de comparaciones con modelos de otras familias del mismo rango, por lo que la comparativa se limita a los distintos bitrates del mismo modelo.

## Limitaciones y advertencias

- Cuantizacion agresiva a 3,03 bpw: aunque la perdida medida frente a 4,0 bpw en MMLU-Pro no es significativa (+0,2 puntos, p = 0,89), la perplejidad en WikiText-2 empeora de 4,979 a 5,069 y la degradacion frente a los pesos originales no se ha medido.
- Evaluacion parcial: no hay resultados de tareas de codigo, GPQA ni de ningun modo con thinking activado, a pesar de que el modelo base esta orientado a razonamiento.
- Paquete solo de texto: la torre de vision y las cabezas de audio del modelo base no estan incluidas, por lo que cualquier caso de uso multimodal queda fuera.
- Idiomas limitados a ingles y chino segun la model card; el comportamiento en castellano no esta documentado ni medido.
- Longitud de contexto desconocida: la informacion disponible no indica la ventana del modelo ni como se comporta la cache KV a TP=2 con prompts largos.
- Dependencia de un motor concreto: las mediciones y la receta se han validado unicamente con TensorFold; el autor advierte que no se probo con exllamav3 en solitario. El paquete no es portable a vLLM, TGI, llama.cpp u Ollama.
- Consumo de hardware: requiere dos DGX Spark (GB10) y unos 60 GiB por nodo; no cabe en una sola unidad con margen de ejecucion.
- Discrepancia de metadatos: los safetensors del repositorio declaran 60.459.094.912 parametros, mientras que la model card habla de 309B totales y 15B activos. Conviene verificar la cifra antes de planificar un despliegue.
- Riesgo de alucinacion: inherente al modelo base; no se publican evaluaciones de fidelidad, tasas de alucinacion ni pruebas de seguridad.
- Trazabilidad limitada: el paquete es una contribucion de un usuario individual, sin revision por pares, con 0 descargas y 0 likes en el momento de la consulta. La calidad de las mediciones depende de la receta del propio autor.
- Licencia MIT: permite uso comercial, pero el paquete arrastra las condiciones del modelo fuente y del drafter DFlash (ambos MIT). No se documentan clausulas adicionales ni restricciones de uso aceptable del modelo base.

## Enlaces

- Paquete cuantizado (HuggingFace): https://huggingface.co/ajensenwaud/MiMo-V2.6-Flash-RL-exl3-3.0bpw
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Paquete EXL3 de 2,27 bpw y drafter DFlash original: https://huggingface.co/benthecarman/MiMo-V2.6-Flash-RL-exl3
- Receta y motor TensorFold (repositorio GitHub): https://github.com/ajensenwaud/MiMo-V2.6-2x-DGX-Spark-TensorFold
- Creditos de la receta: https://github.com/ajensenwaud/MiMo-V2.6-2x-DGX-Spark-TensorFold/blob/main/CREDITS.md
- exllamav3 (libreria de cuantizacion y ejecucion): https://github.com/turboderp/exllamav3
