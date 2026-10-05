# Aijuus/qwen3.8-27b-mxfp4

## Resumen

`Aijuus/qwen3.8-27b-mxfp4` es una redistribucion cuantizada del checkpoint denso `Qwen/Qwen3.8-27B`, publicada por el usuario Aijuus bajo licencia Apache-2.0. No es un modelo nuevo ni un fine-tune: es el mismo modelo base con los pesos convertidos a **OCP-MXFP4 nativo** (codigos fp4 `e2m1` con una escala `e8m0` por cada 32 columnas de K y una referencia `e8m0` por fila), empaquetados en contenedores propietarios `.rad` del motor de inferencia [radiance](https://codeberg.org/StillDeadcode/radiance).

La relevancia de esta publicacion es de nicho pero clara: es una de las pocas conversiones MXFP4 pensadas explicitamente para **AMD RDNA4** (`gfx1200`/`gfx1201`) con ROCm 7.2, frente al ecosistema mayoritario de cuantizaciones FP4 orientadas a NVIDIA Blackwell. El autor verifica el resultado en 2x Radeon AI PRO R9700 con tensor-parallel 2, y aporta la receta `rad-convert` completa para reproducir la conversion desde el checkpoint bf16 sin datos de calibracion.

El repositorio ocupa 38,7 GB e incluye dos variantes servibles: una con un drafter DFlash2 de difusion por bloques fusionado (~19 GiB) y otra con la cabeza MTP del propio modelo objetivo (~18 GiB). La arquitectura heredada del base es un hibrido denso de 48 capas Gated DeltaNet mas 16 capas de atencion con compuerta. El numero de descargas y de "likes" es cero en el momento de la consulta, por lo que se trata de un artefacto sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido denso: 48 capas Gated DeltaNet + 16 capas de atencion con compuerta (64 capas en total), segun la model card del artefacto cuantizado |
| Parametros totales | 27B (nominal, segun el nombre del modelo base; no se explicita en la model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 nativo (OCP-MX): pesos fp4 `e2m1`, escala `e8m0` por bloque de 32 columnas de K, referencia `e8m0` por fila; activaciones fp8 (E4M3) por fila; cabeza MTP y drafter DFlash2 en fp8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Contenedores `.rad` (formato propio del motor radiance); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto no aporta informacion sobre el entrenamiento del modelo base: la model card se limita al proceso de cuantizacion. Lo que si detalla es la arquitectura subyacente del checkpoint `Qwen/Qwen3.8-27B`, descrita como un hibrido denso compuesto por 48 capas Gated DeltaNet y 16 capas de atencion con compuerta, lo que sugiere una combinacion de mecanismos de estado recurrente o lineal con atencion clasica en una proporcion aproximada de 3 a 1.

En cuanto a la innovacion tecnica del artefacto, el punto central son los kernels `mxfp4a8`. Cada bloque de 32 elementos se pliega contra la referencia `e8m0` de su fila mediante `dsh = clamp(wref - e8m0, 0, 15)`, y el codigo de 4 bits se promueve a E4M3 con `E4M3_RNE(code * 2^-dsh)`; los bloques cuyo exponente queda en o por debajo de `dsh = 13` se vacian a cero. La cuantizacion se hizo con redondeo al mas proximo (RTN) sobre la rejilla OCP-MX, sin datos de calibracion, partiendo del checkpoint bf16 y sin consumir ningun checkpoint de AMD/Quark. La model card indica que existe una implementacion de referencia que modela exactamente este comportamiento numerico.

## Capacidades

- Generacion de texto y conversacion multiturno: el autor afirma coherencia verificada en chat de un solo turno y multiturno tras la cuantizacion.
- Razonamiento y chat general: capacidades heredadas del modelo base `Qwen/Qwen3.8-27B`, no documentadas de forma independiente en este repositorio.
- Decodificacion especulativa: dos vias disponibles: un drafter DFlash2 de difusion por bloques fusionado en el contenedor principal, o la cabeza MTP integrada en el modelo objetivo, que se sirve con `--num-speculative-tokens 3`.
- Autocontencion del contenedor: cada fichero `.rad` incluye pesos, tokenizador, plantilla de chat y, cuando procede, el drafter, de modo que el servidor no necesita ficheros adicionales.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multipaso: no documentadas para este artefacto.
- Vision o audio: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito: no disponible.

## Casos de uso

- Despliegue de inferencia local en hardware AMD RDNA4: el caso de uso principal y practico es servir el modelo en estaciones con GPU Radeon AI PRO R9700 u otras tarjetas `gfx1200`/`gfx1201`, usando el motor radiance con tensor-parallel 2 sobre dos tarjetas de 32 GiB. Es la via para aprovechar FP4 en hardware AMD, donde el ecosistema FP4 es mucho mas escaso que en NVIDIA.
- Chat multiturno autocontenido en un solo fichero: al incluir tokenizador, plantilla de chat y drafter en el contenedor `.rad`, el despliegue se reduce a descargar un fichero y lanzar el binario, lo que simplifica entornos con conectividad limitada o sin gestor de artefactos.
- Optimizacion de latencia con decodificacion especulativa: la variante con DFlash2 o con la cabeza MTP y `--num-speculative-tokens 3` esta pensada para reducir el coste por token en generacion autoregresiva, util en asistentes interactivos donde importa el tiempo hasta el primer token y el throughput por secuencia.
- Laboratorio de cuantizacion y validacion numerica: la receta `q38-27b-mxfp4.recipe` (3 KiB) permite reproducir la conversion con `rad-convert` desde el checkpoint bf16, por lo que sirve como banco de pruebas para estudiar el impacto de MXFP4 RTN sobre un hibrido DeltaNet/atencion.
- Investigacion sobre atencion hibrida: al conservar la estructura de 48 capas DeltaNet y 16 de atencion, es un punto de partida para experimentos sobre modelos con estado recurrente, siempre que se valide que la cuantizacion a 4 bits no degrada las capas recurrentes.
- Servicio con lotes pequenos: la configuracion de referencia usa `--max-num-seqs 8`, lo que encaja en escenarios de baja concurrencia con contexto por secuencia alto, como asistentes internos o generacion de documentacion tecnica.
- Evaluacion previa a produccion: dado que el repositorio tiene cero descargas y cero validaciones externas, un uso realista inmediato es la evaluacion interna comparando las salidas contra el checkpoint bf16 antes de considerar cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona verificaciones cualitativas: chat coherente en uno y varios turnos, coincidencia con los autotests `r4d` y con el "engine oracle" del motor radiance, realizadas en 2x Radeon AI PRO R9700 (`gfx1201`) con tensor-parallel 2.

## Requisitos de hardware

- VRAM estimada: cada contenedor ocupa aproximadamente 19 GiB (variante con DFlash2) o 18 GiB (variante con cabeza MTP). Con tensor-parallel 2, la configuracion de referencia se ejecuta sobre dos tarjetas de 32 GiB.
- GPU verificadas: 2x Radeon AI PRO R9700 (`gfx1201`). El autor indica compatibilidad con la familia RDNA4 `gfx1200`/`gfx1201`.
- GPU no soportadas: no hay soporte documentado para NVIDIA ni para generaciones AMD anteriores a RDNA4. Los kernels `mxfp4a8` son especificos de RDNA4.
- Cabe en GPU de consumo: no disponible. No se documenta ejecucion en una sola tarjeta; la receta indicada exige tensor-parallel 2.
- Software necesario: driver `amdgpu` con soporte ROCm 7.2 y Docker (la imagen incluye ROCm), o compilar radiance desde el codigo fuente. El proyecto radiance vive en Codeberg, no en GitHub.
- Opciones de despliegue: exclusivamente el motor radiance. El formato `.rad` no es compatible con vLLM, llama.cpp, Ollama ni TGI, que esperan safetensors o GGUF. Para Docker existe el fichero de compose `qwen3.8-27b-mxfp4.yaml` del repositorio de radiance, que monta el modelo en `/models/qwen3.8-27b-mxfp4.rad` y pasa `--tp 2 --max-num-seqs 8`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| Aijuus/qwen3.8-27b-mxfp4 | 27B (nominal) | `.rad` | MXFP4 nativo, activaciones fp8 E4M3 | AMD RDNA4, 2 GPU, ROCm 7.2 | Apache-2.0 |
| Qwen/Qwen3.8-27B (base) | 27B (nominal) | no disponible | bf16 | segun el autor del modelo base | Apache-2.0 |
| Checkpoint FP8 mencionado en la model card | 27B (nominal) | no disponible | fp8 (cabeza MTP y drafter en fp8) | no disponible | no disponible |

No se dispone de datos sobre alternativas MXFP4 equivalentes para RDNA4, ni de resultados comparativos de rendimiento entre estas variantes. No disponible.

## Limitaciones y advertencias

- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 "likes". Toda la verificacion procede del propio autor.
- Sin benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica que permita estimar la degradacion introducida por la cuantizacion a 4 bits.
- Dependencia de hardware muy restrictiva: requiere GPU AMD RDNA4 y ROCm 7.2. No hay ruta de ejecucion para NVIDIA, Apple Silicon, CPU ni para GPUs AMD anteriores.
- Formato propietario: los contenedores `.rad` solo los consume el motor radiance. Esto ata el artefacto a un unico runtime mantenido por un tercero y complica la portabilidad o la migracion futura.
- Riesgo de degradacion numerica por cuantizacion: el esquema MXFP4 con RTN sin calibracion y con vaciado a cero de bloques con `dsh >= 13` puede afectar de forma desigual a capas sensibles, en particular a las 48 capas Gated DeltaNet, cuyo comportamiento bajo cuantizacion agresiva no se documenta.
- Trazabilidad del modelo base: el artefacto referencia `Qwen/Qwen3.8-27B`, sin informacion en este repositorio sobre datos de entrenamiento, idiomas, contexto o alineacion. Cualquier evaluacion de sesgos o alucinacion debe hacerse sobre el modelo base, no sobre esta conversion.
- Idioma: no hay ninguna declaracion sobre idiomas soportados. Se desconoce el comportamiento en castellano.
- Uso comercial: la licencia declarada es Apache-2.0, heredada del modelo base. Conviene verificar de forma independiente los terminos aplicables a `Qwen/Qwen3.8-27B` antes de un despliegue comercial, ya que esta ficha solo refleja lo indicado en la model card.
- Ausencia de soporte para tool calling y agentes: no documentados, por lo que no deben asumirse en produccion sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aijuus/qwen3.8-27b-mxfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor de inferencia radiance (Codeberg): https://codeberg.org/StillDeadcode/radiance
- Ficheros de despliegue Docker Compose de radiance: https://codeberg.org/StillDeadcode/radiance/tree/main/deploy/compose
