# aj9o9/Qwen3.8-27B-DSpine-b16-GGUF

## Resumen

DSpine-b16 es un modelo borrador (*draft model*) de decodificación especulativa diseñado para acelerar la inferencia de Qwen3.8-27B. Lo desarrolla el usuario aj9o9 a partir del modelo base `tencent/Qwen3.8-27B-DSpine-b16`, y esta ficha concreta es una conversión a formato GGUF para su uso con llama.cpp. No es un modelo generativo autónomo: se ejecuta en paralelo al modelo objetivo y propone bloques de 16 tokens que el modelo grande verifica de una sola pasada, reduciendo el coste por token generado.

La arquitectura DSpine extiende DFlash con un borrador de cinco capas que lee los estados ocultos de cinco capas del modelo objetivo y añade tres mecanismos: atención causal de bloque, un puente de código tras cada capa y un refinamiento serial de última escritura que genera una tabla de transición 16x16 por posición. El resultado, según el autor, es una aceleración de 3,2x de media y hasta 4,5x en código sobre una RTX 3090 con un objetivo Qwen3.8-27B en Q4_K_M.

Su relevancia actual es práctica: permite servir un modelo de 27B en una GPU de consumo con velocidades de 90-129 tok/s en lugar de ~28 tok/s sin especulación. El precio es la dependencia de un fork específico de llama.cpp (rama `dspine`), ya que la versión upstream rechaza estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpine (borrador de 5 capas sobre DFlash, con atención causal de bloque, puente de código y refinamiento serial) |
| Parametros totales | 2.025.387.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable de forma independiente; limitada por el modelo objetivo (hasta `-c 65536` en 24 GB con Q4_K_M y n-max 15) |
| Tipos de cuantizacion | Q4_K_M (1,26 GB), Q8_0 (2,20 GB), BF16 (4,06 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 7,5 GB |
| Modelo base | tencent/Qwen3.8-27B-DSpine-b16 (relación: quantized) |
| Descargas | 26.118 |
| Likes | 58 |

## Arquitectura y entrenamiento

DSpine es un borrador de cinco capas que consume los estados ocultos de cinco capas del modelo objetivo y redacta un bloque de 16 tokens en paralelo, en lugar de generar token a token. Sobre DFlash incorpora tres innovaciones: atención causal de bloque (cada posición del borrador solo atiende a posiciones anteriores de su propio bloque), un puente de código tras cada capa que inyecta un mensaje con puerta construido a partir del código del token predicho por la posición predecesora, y un refinamiento serial de última escritura que, para los 16 candidatos superiores de cada posición, rehace la última escritura del puente usando el código exacto del predecesor candidato.

Ese último paso produce una tabla de transición 16x16 por posición, que el decodificador especulativo recorre desde el último token aceptado para elegir la cadena de borrador, de forma voraz o por muestreo. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Aceleración de decodificación especulativa para Qwen3.8-27B: propone bloques de 16 tokens verificables en una pasada.
- Modo de muestreo probabilístico opcional (`--spec-draft-sampling probabilistic`), que muestrea la cadena de borrador desde la tabla de transición y ayuda ligeramente a temperatura > 0.
- Compatible con decodificación voraz y con muestreo.
- Funciona con caché KV cuantizada (q8_0 en K y V, tanto para objetivo como para borrador).
- Soporta despliegue multiproceso con `-np` (con ajustes de `--spec-draft-n-max` en GPUs de 24 GB).
- No genera texto de forma autónoma: no tiene capacidades propias de razonamiento, código, matemáticas, visión, tool calling ni agentes. Todas esas capacidades las aporta el modelo objetivo Qwen3.8-27B.
- Idiomas: heredados del modelo objetivo; no disponibles en la información del borrador.

## Casos de uso

- Servicio de chat de baja latencia en una sola GPU de consumo: con un objetivo Qwen3.8-27B Q4_K_M y DSpine a n-max 15, se alcanzan ~90 tok/s en tareas mixtas de chat en una RTX 3090, frente a ~28 tok/s sin especulación. Adecuado para asistentes conversacionales con presupuesto de hardware limitado.
- Generación de código en producción: el autor reporta ~125-129 tok/s en código y hasta 4,5x de aceleración, lo que hace viable integrar un 27B en pipelines de autocompletado o revisión de código donde la latencia por token es crítica.
- Razonamiento matemático interactivo: el borrador rinde especialmente bien en matemáticas (~125 tok/s en la RTX 3090), útil para tutores o herramientas de resolución paso a paso que requieren respuestas ágiles.
- Despliegue en estaciones de trabajo con GPU profesional: en Radeon AI PRO R9700 (32 GB, ROCm) se reporta ~2,2x sobre el MTP del objetivo en código y 3,4x en tool calls, lo que permite servir agentes con llamadas a herramientas en hardware AMD.
- Inferencia en equipos con memoria unificada: en DGX Spark (GB10, 128 GB) se reportan 76,7 tok/s en código frente a 61,3 de DFlash2, adecuado para prototipado y desarrollo en un único nodo compacto.
- Ajuste fino del equilibrio velocidad/contexto: con `--spec-draft-n-max 7` se puede ampliar el contexto hasta `-c 98304` en 24 GB, útil para resúmenes de documentos largos o análisis de repositorios donde prima el contexto sobre el throughput.
- Evaluación comparativa de técnicas de decodificación especulativa: la disponibilidad de tres cuantizaciones (Q4_K_M, Q8_0, BF16) y de resultados comunitarios en varias GPU permite medir la ganancia real de DSpine frente a MTP o DFlash2 en un hardware concreto antes de adoptarlo.

## Benchmarks y rendimiento

Datos reportados por el autor y por la comunidad. Cada fila usa sus propios prompts, ajustes y línea base, por lo que no constituyen una comparación directa.

| GPU | Backend | Mejor `n-max` | Resultado | Fuente |
|---|---|---|---|---|
| RTX 3090, 24 GB | CUDA | 15 | 90 tok/s en tareas mixtas (3,2x sin especulación); 129 tok/s en código; ~52 tok/s para DFlash2 | Autor |
| DGX Spark (GB10), 128 GB unificada | CUDA | 15 | Código 76,7 tok/s vs 61,3 de DFlash2; DFlash2 más rápido en matemáticas, prosa y resúmenes | Comunidad: Alpaczyk |
| Radeon AI PRO R9700, 32 GB | ROCm / HIP | 15 (7 más lento) | Código ~2,2x más rápido que el MTP del objetivo; tool calls 3,4x; prosa, chat e imágenes 4-23% más lentos que MTP | Comunidad: menace1000 |
| Intel Arc Pro B65, 32 GB | SYCL | 15 | dato truncado en la información disponible | Comunidad |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, ya que el borrador no se evalúa por calidad propia sino por la del modelo objetivo.

## Requisitos de hardware

- VRAM del borrador: 1,26 GB en Q4_K_M (recomendado), 2,20 GB en Q8_0, 4,06 GB en BF16. Hay que sumar la VRAM del modelo objetivo Qwen3.8-27B (por ejemplo, un Q4_K_M del objetivo) y la caché KV.
- Contexto máximo en 24 GB: con objetivo Q4_K_M, caché KV q8_0 y n-max 15, cabe hasta `-c 65536`; con n-max 7, hasta `-c 98304`.
- GPU probadas: RTX 3090 (CUDA), DGX Spark GB10 (CUDA, memoria unificada), Radeon AI PRO R9700 (ROCm/HIP), Intel Arc Pro B65 (SYCL).
- Cabe en GPU de consumo: sí, el borrador Q4_K_M ocupa 1,26 GB; el conjunto con el objetivo Q4_K_M y KV q8_0 entra en una tarjeta de 24 GB.
- Despliegue: exclusivamente llama.cpp, y solo con el fork `dspine` (https://github.com/Ajay9o9/llama.cpp/tree/dspine). La versión upstream rechaza estos ficheros. No hay soporte indicado para vLLM, TGI u Ollama.
- Compilación: `cmake -B build -DGGML_CUDA=ON` y `cmake --build build --config Release -j`.
- Ejecución: `llama-server` con `-m` (objetivo), `-md` (borrador), `--spec-type draft-dflash`, `--spec-draft-n-max 15`, `-ngl 999 --spec-draft-ngl 999`, `-fa on --jinja`, `-c` fijado manualmente y caché KV q8_0 en objetivo y borrador.
- Throughput estimado: 90 tok/s en tareas mixtas y 125-129 tok/s en código/matemáticas sobre RTX 3090; 76,7 tok/s en código sobre DGX Spark; ~2,2x sobre MTP en R9700 para código.
- Advertencia de rendimiento: el borrador solo compensa si la GPU verifica rápido bloques de 16 tokens; en GPU con lotes pequeños lentos, un borrador de 15 tokens puede costar más de lo que ahorra, y conviene bajar `--spec-draft-n-max`.
- Con `-np 2` en tarjetas de 24 GB, usar `--spec-draft-n-max 7`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DSpine-b16 (este) | Borrador especulativo DFlash extendido | 2.025 M | limitado por el objetivo (hasta 65.536 en 24 GB) | 90 tok/s mixto, 129 tok/s código en RTX 3090; 3,2x sin especulación | Apache 2.0 | GGUF en HF, requiere fork `dspine` de llama.cpp |
| DFlash2 | Borrador especulativo previo | no disponible | no disponible | ~52 tok/s en RTX 3090; más rápido que DSpine en matemáticas, prosa y resúmenes en DGX Spark | no disponible | no disponible en la información proporcionada |
| MTP del objetivo Qwen3.8-27B | Decodificación multi-token nativa | no disponible | no disponible | Base de comparación en R9700: DSpine ~2,2x en código y 3,4x en tool calls; DSpine 4-23% más lento en prosa, chat e imágenes | no disponible | incluido en el modelo objetivo |
| Sin decodificación especulativa | Decodificación autorregresiva estándar | no aplica | no aplica | ~28 tok/s en RTX 3090 con objetivo Q4_K_M | no aplica | llama.cpp estándar |

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse solo. Requiere siempre un Qwen3.8-27B objetivo en GGUF y el fork `dspine` de llama.cpp; la versión upstream de llama.cpp rechaza los ficheros.
- Dependencia de un fork no oficial: el soporte DSpine no está en llama.cpp upstream, lo que implica riesgo de mantenimiento, divergencia con `master` y ausencia de soporte en vLLM, TGI u Ollama.
- Ajuste manual obligatorio: hay que fijar `--spec-draft-n-max` (el valor por defecto 3 desaprovecha el bloque de 16) y `-c` (el auto-fit no reserva espacio para el borrador y, con `--mmproj` cargado, la primera petición de imagen puede provocar un fallo). Si aparece `failed to allocate ... using host copies`, hay que reducir `-c`.
- Rendimiento dependiente del hardware: la ganancia no es universal. En R9700, prosa, chat e imágenes resultan un 4-23% más lentos que con MTP, y en DGX Spark DFlash2 supera a DSpine en matemáticas, prosa y resúmenes.
- Los resultados comunitarios no son comparables entre sí: cada reporte usa sus propios prompts, ajustes y línea base.
- Sin datos de sesgos, alucinación o cobertura idiomática del borrador; estos riesgos recaen sobre el modelo objetivo Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero la obligación de usar un fork de llama.cpp puede afectar al soporte en producción.
- El tamaño del repositorio (7,5 GB) excede la suma de los tres GGUF listados; conviene verificar los ficheros descargados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aj9o9/Qwen3.8-27B-DSpine-b16-GGUF
- Modelo base: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper: https://arxiv.org/abs/2609.36173
- Fork de llama.cpp con soporte DSpine: https://github.com/Ajay9o9/llama.cpp/tree/dspine
- Reporte comunitario DGX Spark: https://huggingface.co/aj9o9/Qwen3.8-27B-DSpine-b16-GGUF/discussions/2
- Reporte comunitario Radeon AI PRO R9700: https://huggingface.co/aj9o9/Qwen3.8-27B-DSpine-b16-GGUF/discussions/3
