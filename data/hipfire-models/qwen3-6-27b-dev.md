# hipfire-models/qwen3.6-27b-dev

## Resumen

Qwen3.6-27B — hipfire research quants (dev) es un repositorio de cuantizaciones experimentales de los pesos del modelo Qwen3.6-27B, publicadas por el colectivo hipfire-models bajo el identificador `hipfire-models/qwen3.6-27b-dev`. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos cuantizados con una tecnica propia denominada Lloyd-Max codebook quantization, orientada a la investigacion de kernels de computo (WMMA prefill y decode) sobre GPUs AMD. El repositorio es de acceso restringido (`gated: auto`) y exige aceptar un descargo de responsabilidad explicito antes de la descarga.

El interes tecnico del artefacto reside en el formato de cuantizacion: en lugar de la reconstruccion afin clasica (`scale * q + zero_point`) que usan los formatos HFQ3 y HFQ4 del propio ecosistema hipfire, MQ3-Lloyd y MQ4-Lloyd emplean una busqueda en tabla (codebook lookup) por grupo de 256 elementos, con codebooks fp16 de 8 y 16 entradas respectivamente. Esto cambia los strides de grupo y hace que mezclar formatos en un mismo dispatch provoque corrupcion silenciosa de pesos, de ahi las compuertas `--allow-mq3-lloyd` y `--allow-mq4-lloyd`.

La relevancia es acotada y muy especifica: sirve para reproducir el trabajo de rendimiento de kernels de hipfire sobre arquitecturas RDNA3 y RDNA3.5 (gfx1100, gfx1101, gfx1102, gfx1151), no como sustituto de un despliegue de produccion. El propio autor recomienda las variantes canonicas no-Lloyd alojadas en `schuttdev/hipfire-qwen3.6-27b` como punto de partida para inferencia tipica. El repositorio ocupa 100,2 GB e incluye dos ficheros de pesos de 12,6 GB y 17,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos derivados de Qwen3.6-27B; la model card no describe la arquitectura del modelo base) |
| Parametros totales | 27B (segun el nombre del modelo base Qwen3.6-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso del daemon configura `max_seq: 4096` |
| Tipos de cuantizacion | MQ3-Lloyd-G256 (112 B/grupo) y MQ4-Lloyd-G256 (160 B/grupo) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (heredada de los terminos upstream de Qwen3.6) |
| Formato de pesos | `.mq3-lloyd` (12,6 GB) y `.mq4-lloyd` (17,4 GB); formato propietario de hipfire, no safetensors ni GGUF |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura del modelo base Qwen3.6-27B (tipo de transformer, numero de capas, dimensiones ocultas, uso de MoE, atencion lineal u otras innovaciones). Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Toda esa informacion corresponderia a la model card upstream de Qwen3.6-27B, que no forma parte de la informacion proporcionada.

Lo que si se documenta es el proceso de cuantizacion: se trata de un ajuste post-entrenamiento (post-training) de codebooks Lloyd-Max sobre los pesos upstream de Qwen3.6-27B previamente rotados con FWHT (Fast Walsh-Hadamard Transform), ejecutado con la herramienta `hipfire-quantize`. Cada grupo de 256 elementos almacena un codebook fp16 y los indices empaquetados: MQ3-Lloyd usa un codebook de 8 entradas (cabecera de 16 B) mas 96 B de indices de 3 bits empaquetados entre bytes, totalizando 112 B por grupo; MQ4-Lloyd usa un codebook de 16 entradas (cabecera de 32 B) mas 128 B de indices de 4 bits en pares de nibbles, totalizando 160 B por grupo. La reconstruccion es una busqueda directa `cb[index]`, no una operacion afin. Los kernels de prefill WMMA correspondientes se introdujeron en los PR #195 (MQ3-Lloyd) y #197 (MQ4-Lloyd) del repositorio hipfire.

## Capacidades

- Generacion de texto en ingles: el repositorio declara unicamente el idioma `en`.
- Razonamiento y codigo: capacidades heredadas del modelo base Qwen3.6-27B, si bien la model card no las detalla ni las certifica para estas cuantizaciones.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Ejecucion en GPUs AMD mediante el daemon de hipfire, con deteccion automatica del dtype a partir del fichero cargado.

## Casos de uso

- Reproduccion de resultados de rendimiento de kernels: cargar `qwen3.6-27b.mq3-lloyd` o `qwen3.6-27b.mq4-lloyd` con el daemon de hipfire y el flag `--allow-mq{3,4}-lloyd` correspondiente para replicar las mediciones de los PR #195 y #197 sobre gfx1100, gfx1101, gfx1102 y gfx1151.
- Investigacion de cuantizacion con codebooks: comparar la deriva de perplejidad de la reconstruccion por busqueda en tabla frente a la reconstruccion afin de HFQ3/HFQ4 en un modelo de 27B, midiendo el envelope de calidad que el autor solo ha caracterizado en Qwen3.5-9B.
- Desarrollo de kernels GEMV de decode: usar el formato como banco de pruebas para el problema documentado de deriva del ~0,9 % de PPL causado por el reordenamiento multi-acumulador, y validar la correccion propuesta en la rama `feat/mq3-lloyd-gfx1151`.
- Validacion de CI externa en RDNA4: ejecutar con `HIPFIRE_LLOYD_GFX12=1` para generar datos que permitan sacar gfx1200/gfx1201 de la compuerta opt-in y del fallback por token.
- Benchmarking de prefill WMMA por fases: aprovechar que los kernels de prefill son de un solo acumulador y estan libres de deriva para aislar el rendimiento de prefill del de decode en estudios comparativos.
- Analisis de seguridad de formatos: estudiar el modo de fallo de corrupcion silenciosa al mezclar strides de grupo en un mismo dispatch, util para disenar validaciones de formato en herramientas de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona una deriva de perplejidad del ~0,9 % en los kernels GEMV de decode de MQ3-Lloyd, medida sobre el modelo de referencia Qwen3.5-9B (no sobre Qwen3.6-27B) y comun a gfx1100, gfx1101, gfx1102 y gfx1151. Para MQ4-Lloyd se indica que el bench de compuerta de fase C en gfx1100 esta pendiente y que las cifras actuales son solo de gfx1151, sin que se proporcionen los valores.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12,6 GB para MQ3-Lloyd y 17,4 GB para MQ4-Lloyd, correspondientes al tamano de los ficheros de pesos; el consumo real anadira memoria para el contexto y buffers del motor.
- GPUs soportadas: gfx1100, gfx1101, gfx1102 y gfx1151 (RDNA3 y RDNA3.5).
- GPUs con soporte opt-in: gfx1200 y gfx1201 (RDNA4) solo con `HIPFIRE_LLOYD_GFX12=1`; por defecto caen al fallback por token.
- GPUs no soportadas: gfx10, gfx906 y gfx94x.
- Cabe en GPU de consumo: no disponible de forma explicita; el soporte de gfx1101/gfx1102/gfx1151 sugiere compatibilidad con aceleradores integrados y de gama media RDNA3/3.5, pero la model card no enumera modelos comerciales concretos.
- Opciones de despliegue: exclusivamente el daemon de hipfire (binario Rust, `./target/release/examples/daemon`), con carga mediante `hf download` y `--local-dir ~/.hipfire/models`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las cifras de rendimiento citadas son solo de gfx1151 y no se detallan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| hipfire-models/qwen3.6-27b-dev (MQ3-Lloyd) | 27B | no disponible | `.mq3-lloyd` (112 B/grupo) | Apache 2.0 | research, gated |
| hipfire-models/qwen3.6-27b-dev (MQ4-Lloyd) | 27B | no disponible | `.mq4-lloyd` (160 B/grupo) | Apache 2.0 | research, gated, etapa mas temprana |
| schuttdev/hipfire-qwen3.6-27b | 27B | no disponible | MQ3 / MQ4 / DFlash-draft canonicos (HFQ3 104 B/grupo, HFQ4 136 B/grupo) | Apache 2.0 | recomendado para inferencia tipica |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes ni frente a otras cuantizaciones del modelo base.

## Limitaciones y advertencias

- No es una publicacion de cuantizacion de produccion: el autor la califica explicitamente de research preview con envelope de calidad y cobertura de arquitecturas distintos de los quants canonicos.
- MQ4-Lloyd esta en una etapa mas temprana que MQ3-Lloyd; su compuerta de salida (fase C en gfx1100) sigue pendiente.
- Deriva de calidad en decode: los kernels GEMV de produccion de MQ3-Lloyd presentan un ~0,9 % de deriva de perplejidad respecto a la ruta baseline lenta, por un reordenamiento multi-acumulador que se acumula a lo largo del bucle de inferencia; el envelope esperado en Qwen3.6-27B no se ha medido.
- Incompatibilidad de stride con HFQ4: mezclar formatos en un mismo dispatch provoca corrupcion silenciosa de pesos; es obligatorio usar el flag `--allow-mq{3,4}-lloyd` correspondiente para que el despacho enrute por las ramas especificas de Lloyd.
- Cobertura de arquitecturas limitada: sin soporte en gfx10, gfx906 ni gfx94x; en RDNA4 el comportamiento por defecto es el fallback por token salvo activacion explicita de la variable de entorno.
- Idiomas: solo se declara ingles, sin datos sobre calidad en castellano u otras lenguas.
- Acceso restringido: requiere aceptar el descargo de responsabilidad sobre el estado de investigacion del formato.
- Licencia: Apache 2.0 heredada de Qwen3.6, sin restricciones comerciales adicionales declaradas en la model card, aunque el estado research del formato desaconseja su uso en produccion.
- Sin datos publicados de benchmarks, latencia ni throughput para este tamano de modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hipfire-models/qwen3.6-27b-dev
- Quants canonicos no-Lloyd para Qwen3.6-27B: https://huggingface.co/schuttdev/hipfire-qwen3.6-27b
- PR #195 (kernels de prefill WMMA para MQ3-Lloyd): https://github.com/Kaden-Schutt/hipfire/pull/195
- PR #197 (kernels de prefill WMMA para MQ4-Lloyd): https://github.com/Kaden-Schutt/hipfire/pull/197
