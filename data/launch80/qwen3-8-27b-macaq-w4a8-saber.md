# Launch80/Qwen3.8-27B-MACaQ-W4A8-SABER

## Resumen

Qwen3.8-27B-MACaQ-W4A8-SABER es un paquete de pesos precompilado para el motor de inferencia Saber, derivado del modelo base Qwen/Qwen3.8-27B de Alibaba Qwen. No se distribuye en safetensors ni en GGUF, sino en el formato propietario `SBRPACK1` del motor Saber (`rank{0,1}.pack` + `manifest.json`), y solo es cargable en GPUs AMD RDNA4 (gfx1201). Lo publica el usuario Launch80 y se libera bajo licencia Apache 2.0, heredada del modelo base.

El paquete aplica una receta de cuantizacion entera W4A8: pesos int4 por fila, activaciones int8 por token y una base Hadamard de 32 puntos con escalas por canal calibradas (metodo MACaQ, descrito en el paper arXiv:2611.10649). Ademas promueve 19 proyecciones sensibles a int8. El objetivo es reducir la divergencia respecto al modelo BF16 original manteniendo velocidad de decodificacion alta sobre el hardware objetivo, en este caso dos AMD Radeon AI PRO R9700 en tensor-parallel 2 o una sola tarjeta en TP=1.

Su relevancia radica en que es la evolucion del paquete MXFP4 del mismo autor: baja la KL frente a BF16 un 5,5 % en TP=2 y un 9,4 % en TP=1, y acelera el paso de decodificacion. No obstante, la ficha debe leerse con cautela: la mayoria de los datos disponibles describen el empaquetado y el rendimiento del motor, no las capacidades intrinsecas del modelo base, cuyo detalle no se incluye en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8-27B (detalle no disponible); paquete cuantizado para el motor Saber |
| Parametros totales | 27B (heredados del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (usado en las pruebas del autor); 32.768 en la evaluacion de calidad |
| Tipos de cuantizacion | W4A8: pesos int4 por fila, activaciones int8 por token, 19 lineales en int8, KV cache fp8 e4m3, `lm_head` y normas/conv/GDN en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `SBRPACK1` (`.pack` + `manifest.json`), exclusivo del motor Saber; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete no introduce entrenamiento nuevo: cuantiza el checkpoint BF16 original de Qwen3.8-27B. La receta MACaQ multiplica la entrada de cada capa lineal cuantizada por un vector por canal calibrado `t` y la rota con una transformada de Walsh-Hadamard normalizada de 32 puntos por bloque de 32 elementos de la dimension K; el peso se almacena en la misma base (`W' = H32 (W / t)`). Los pesos se guardan en int4 con un unico scale f32 por fila de salida, obtenido mediante busqueda de clip ponderada por Hessiano y refinamiento de codigos contra activaciones de calibracion. Las activaciones se cuantizan a int8 simetrico (absmax/127) tras la Hadamard, y el GEMM usa WMMA int8 con acumulador int32 exacto sobre toda la K, aplicando ambas escalas en el epilogo.

Diecinueve proyecciones se promueven a int8: diez `linear_attn.out_proj`, cuatro `self_attn.o_proj` y cinco `mlp.down_proj`, seleccionadas por su sensibilidad segun la calibracion. El `lm_head` se mantiene en bf16 byte a byte, igual que `embed_tokens`, normas, convoluciones y parametros GDN (que sugiere un componente de estado lineal en la arquitectura base, aunque el detalle no se especifica). El paquete incluye dos variantes de tensor-parallel (`tp1/` y `tp2/`) con registros identicos verificados. La decodificacion especulativa se delega a un drafter DFlash2 separado (no incluido en este repo) que comparte el `lm_head`; el motor rechaza drafters con cabeza distinta.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (`text-generation`, `conversational`) y la plantilla de chat incluida (`qwen-fixed-v22.3.jinja`).
- Razonamiento aritmetico y resolucion de problemas: la prueba GSM8K con 500 preguntas obtiene 488 aciertos en TP=2.
- Recuperacion de informacion en contexto largo: needle retrieval correcto 6/6 a 32k y 120k tokens.
- Generacion de codigo: la evaluacion de calidad incluye ventanas de codigo, aunque no se publican resultados especificos de HumanEval ni similares.
- Decodificacion especulativa mediante drafters DFlash2 emparejados (W4A8 o FP8), con incremento medido de +7,3 % en tok/s b1 para el drafter W4A8.
- Soporte de tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Despliegue de inferencia de Qwen3.8-27B en servidores con GPUs AMD RDNA4: el paquete `tp2/` permite servir el modelo en dos Radeon AI PRO R9700 con 20,5 GB de disco y KV cache fp8, aprovechando los kernels int8 WMMA nativos de gfx1201.
- Atencion al cliente automatizada con contexto largo: la ventana de 262.144 tokens y el needle retrieval verificado a 120k permiten mantener historiales extensos y documentacion de referencia en el mismo prompt.
- Razonamiento aritmetico en produccion: el 97,6 % de acierto en GSM8K (488/500) lo hace adecuado para calculo de presupuestos, validacion de facturas o tutorizacion matematica, siempre con verificacion posterior.
- Asistencia de codigo en pipelines internos: la evaluacion incluye ventanas de codigo y el motor soporta prefix caching, lo que reduce el coste de prompts repetidos en tareas de autocompletado o revision.
- Recuperacion aumentada sobre corpus largos: con 262k de contexto y caching de prefijo, se puede indexar documentacion extensa y responder preguntas con citas verificables mediante needle retrieval.
- Servicio de chat de baja latencia en una sola tarjeta: la variante `tp1/` (19,5 GB) cabe en una R9700 de 32 GB y mantiene una KL ligeramente inferior a la de TP=2, adecuada para entornos de desarrollo o despliegues pequenos.
- Aceleracion de decodificacion con drafter: en escenarios de generacion larga, emparejar con el drafter W4A8 DFlash2 mejora el throughput b1 un 7,3 % respecto al drafter FP8, util para asistentes interactivos.

## Benchmarks y rendimiento

Calidad medida por el autor frente al modelo BF16 (contexto 32.768, 76 secuencias retenidas, KL top-5 contra log-probabilidades top-20 del BF16):

| Metrica | Este paquete TP=2 | Este paquete TP=1 | MACaQ-MXFP4 TP=2 | MACaQ-MXFP4 TP=1 |
|---|---:|---:|---:|---:|
| KL top-5 vs BF16 | 0,02134 | 0,02065 | 0,02258 | 0,02279 |
| Acuerdo top-1 | 94,22 % | 94,41 % | 94,19 % | 94,20 % |
| Perplejidad (BF16: 4,879) | 4,901 | 4,899 | 4,910 | 4,905 |

Mejora de KL frente a MACaQ-MXFP4: -5,5 % [-8,7, -2,0] en TP=2 y -9,4 % [-13,3, -4,7] en TP=1 (intervalos bootstrap pareados al 95 %).

Pruebas de tarea (TP=2, contexto 262.144, 8 secuencias concurrentes):

| Prueba | Resultado |
|---|---|
| GSM8K (500 preguntas) | 488/500 (MXFP4 MACaQ: 486/500) |
| Needle retrieval 32k | 6/6 |
| Needle retrieval 120k | 6/6 |

Velocidad (2x Radeon AI PRO R9700, TP=2, 210 W, contexto 262.144, prefix caching activo, drafter FP8 en ambas ramas):

| Metrica | MACaQ-MXFP4 | Este paquete | Cambio |
|---|---:|---:|---:|
| Paso de decodificacion b1 (ms) | 22,9 / 23,0 | 21,6 / 21,6 | -5,9 % |
| Paso de decodificacion b8 (ms) | 31,1 / 31,3 | 29,3 / 29,4 | -5,9 % aprox. |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el pack ocupa 19,5 GB en TP=1 y 20,5 GB en TP=2 (10,25 GB por tarjeta aproximadamente), mas el drafter (6,8-8,2 GB) y la KV cache fp8 e4m3 para el contexto configurado.
- GPU recomendadas: 2x AMD Radeon AI PRO R9700 (gfx1201, RDNA4, int8 WMMA, 32 GB cada una) para `tp2/`; una sola R9700 para `tp1/`.
- Compatibilidad con GPUs consumer: no disponible; el motor Saber solo soporta RDNA4 (gfx1201), por lo que no se puede usar en NVIDIA ni en RDNA3.
- Opciones de despliegue: exclusivamente el motor Saber, en una build que lea el tag `macaq_iu8/1` (y `macaq_iu8d/1` para el drafter). No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: paso de decodificacion de 21,6 ms en b1 y 29,3-29,4 ms en b8 en TP=2 con drafter FP8; el drafter W4A8 mejora el throughput b1 un 7,3 %.
- Disco: 20,5 GB (TP=2) o 19,5 GB (TP=1), mas el drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Qwen3.8-27B-MACaQ-W4A8 (este) | 27B | 262.144 | SBRPACK1 W4A8 | Apache 2.0 | RDNA4, Saber |
| Qwen3.8-27B-MACaQ-MXFP4 | 27B | 262.144 | SBRPACK1 MXFP4 | Apache 2.0 | RDNA4, Saber |
| Qwen3.8-27B (BF16) | 27B | no disponible | safetensors BF16 | Apache 2.0 | Multiples motores |

Frente a MACaQ-MXFP4, este paquete mejora la KL frente a BF16 y el paso de decodificacion, con calidad de tarea equivalente dentro del ruido (488 frente a 486 en GSM8K). Frente al checkpoint BF16 original, la ventaja es el menor footprint y el uso de kernels int8 en RDNA4, a costa de una perdida de fidelidad medida (KL 0,021, acuerdo top-1 94,22 %, perplejidad 4,901 frente a 4,879). No se dispone de comparativas con otros modelos de 27B en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete solo funciona en el motor Saber sobre GPUs AMD RDNA4 (gfx1201); builds antiguas rechazan el pack al arrancar. No es portable a otros motores ni a NVIDIA.
- El drafter no esta incluido en el repo; hay que descargarlo por separado y emparejar `tp1/` con `tp1/` y `tp2/` con `tp2/`, sin mezclar.
- Las salidas greedy no son identicas byte a byte entre los dos drafters, porque el estado GDN se almacena en f16 en cada paso de verificacion y el esquema de aceptacion altera los bits bajos en empates cercanos.
- La cuantizacion W4A8 introduce divergencia respecto al BF16 (KL 0,021, perplejidad 4,901 frente a 4,879); no es equivalente al modelo original en tareas sensibles a precision.
- El rendimiento reportado se ha medido con `--quick` (5 pasadas por categoria) y los valores p99 son indicativos, no concluyentes.
- Sesgos conocidos: no disponible en la informacion proporcionada; se heredan los del modelo base Qwen3.8-27B, no documentados aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de un modelo generativo de 27B.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingue.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue queda condicionado a la disponibilidad del motor Saber y del hardware RDNA4.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (19 de noviembre de 2026) sin validacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-W4A8-SABER
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paquete predecesor MXFP4: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-MXFP4-SABER
- Drafter W4A8: https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Drafter-W4A8-SABER
- Drafter FP8: https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Drafter-FP8-SABER
- Paper MACaQ: https://arxiv.org/abs/2611.10649
