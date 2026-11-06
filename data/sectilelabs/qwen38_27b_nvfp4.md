# SectileLabs/qwen38_27b_nvfp4

## Resumen

Qwen3.8-27B NVFP4 es un paquete de pesos cuantizados del modelo Qwen/Qwen3.8-27B, publicado por SectileLabs para su motor de inferencia propietario GInfer (y GChat, construido sobre este). No es un modelo nuevo ni un ajuste fino: es una conversion de los pesos BF16 oficiales de Qwen a un formato empaquetado de fichero unico (`.ginfer`) con cuantizacion NVFP4 en las matrices MLP y FP8 en el resto, junto con un drafter de decodificacion especulativa DFlash2 tambien cuantizado.

La relevancia del artefacto es operativa, no algorítmica: empaqueta un modelo de 27.000 millones de parametros en ficheros de aproximadamente 21,7 GB, lo que permite servirlo en una sola GPU Blackwell (o en dos con las variantes TP2) con decodificacion especulativa integrada. El precio de esa eficiencia es una dependencia total del runtime: los ficheros no son safetensors ni GGUF y no pueden cargarse en vLLM, llama.cpp, TGI, Ollama ni ninguna otra herramienta fuera del ecosistema GInfer.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 27 de octubre de 2026 y su tamano total es de 87 GB (los cuatro paquetes suman unos 87 GB, con cada paquete individual en torno a 21,7 GB). La licencia declarada es Apache 2.0, heredada de los modelos upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de atencion y capas no disponibles en la informacion proporcionada) |
| Parametros totales | 27.000 millones (27B, segun el nombre del modelo upstream) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (group size 16) en MLP de capas 0-55 con re-redondeo GPTQ; FP8 en el resto de matrices; drafter en Q4 o NVFP4 segun paquete |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ginfer` (paquete de fichero unico para el motor GInfer; no compatible con safetensors, GGUF ni otros runtimes) |

Detalle de los paquetes publicados:

| Fichero | Drafter | Tensor-parallel | Tamano (bytes) |
|---|---|---|---|
| `qwen38_27b_nvfp4_df2q4.ginfer` | Q4 DFlash2 | 1 GPU | 21.707.145.472 |
| `qwen38_27b_nvfp4_df2q4_tp2.ginfer` | Q4 DFlash2 | 2 GPU | 21.711.450.112 |
| `qwen38_27b_nvfp4_df2.ginfer` | NVFP4 DFlash2 | 1 GPU | 21.767.307.520 |
| `qwen38_27b_nvfp4_df2_tp2.ginfer` | NVFP4 DFlash2 | 2 GPU | 21.771.625.732 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B en su revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. La model card de este repositorio no describe la arquitectura interna del modelo base (numero de capas, tipo de atencion, dimensiones ocultas ni composicion del dataset de entrenamiento), por lo que esos datos deben consultarse en la ficha del modelo original. Lo unico que se deduce del proceso de cuantizacion es que el modelo tiene al menos 56 capas (0-55) con bloques MLP diferenciados.

El proceso aplicado por Sectile Labs es puramente post-entrenamiento: las matrices MLP de las capas 0 a 55 se convierten a NVFP4 con group size 16 y se re-redondean con GPTQ usando un corpus de calibracion propio de texto real; el resto de matrices se convierten a FP8. El resultado se empaqueta en el formato `.ginfer`. Adicionalmente se integra un drafter de decodificacion especulativa, incoai/Qwen3.8-27B-DFlash2 (revision `dedf8df68adfb1afeaf7b7480c0a0243108177b4`), cuantizado a Q4 o NVFP4 segun la variante, lo que habilita decodificacion especulativa nativa dentro del motor.

No se documenta ningun tipo de RLHF, DPO ni ajuste adicional por parte de Sectile Labs: el paquete es una conversion de pesos, y la model card lo declara explicitamente. Tampoco se detalla el corpus de calibracion (tamano, dominio o numero de tokens).

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-27B; la model card de este repositorio no enumera capacidades concretas.
- Codigo y matematicas: no confirmado en la informacion proporcionada para este paquete.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno).
- Decodificacion especulativa: si, mediante el drafter DFlash2 integrado (Q4 o NVFP4), que acelera la generacion en el motor GInfer.
- Ejecucion multi-GPU: si, mediante las variantes TP2 con tensor-parallel de tamano 2.
- Modo thinking, vision o audio: no disponible.
- Inferencia de alta concurrencia y contexto largo: el motor GInfer esta disenado para ello segun la model card, pero no se aportan cifras de contexto ni de concurrencia.

## Casos de uso

- Despliegue de un LLM de 27B en una unica GPU Blackwell: el paquete `df2q4` ocupa 21,7 GB, de modo que encaja en GPUs consumer de la serie RTX 50 con 24 GB o mas, evitando la infraestructura multi-GPU que requeriria el modelo en BF16.
- Servicio de chat de alta concurrencia: GInfer esta orientado a cargas de alta concurrencia y contexto largo; el drafter DFlash2 reduce el coste por token generado, lo que resulta adecuado para backends de atencion conversacional con muchos usuarios simultaneos.
- Procesamiento de documentos largos: si el contexto del modelo base es amplio (no confirmado en esta ficha), el empaquetado NVFP4 permite mantener ventanas de contexto grandes con un footprint de memoria reducido en comparacion con BF16.
- Escalado horizontal en nodos de dos GPU: las variantes TP2 reparten el modelo entre dos GPUs identicas con tensor-parallel 2, util para servir mas peticiones por nodo sin cambiar de motor.
- Evaluacion comparativa de cuantizacion: los paquetes `df2q4` y `df2` permiten medir en el mismo motor el impacto de cuantizar el drafter a Q4 frente a NVFP4, manteniendo el target identico.
- Integracion en GChat: al estar GChat construido sobre GInfer, el paquete se puede cargar directamente en ese cliente sin conversion adicional.
- Prototipado interno con requisitos de latencia: la combinacion de NVFP4 en el target y decodificacion especulativa esta pensada para reducir latencia en GPUs Blackwell, adecuada para entornos de desarrollo con hardware de gama alta de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21,7 GB de pesos por paquete; a ello hay que sumar la memoria para KV cache, activaciones y overhead del motor, no cuantificada en la model card.
- GPU obligatoria: NVFP4 requiere una GPU Blackwell (RTX 50xx / RTX PRO). No funciona en arquitecturas anteriores.
- Configuracion de una GPU: paquetes `df2q4` y `df2` con tensor-parallel size 1.
- Configuracion de dos GPU: paquetes `df2q4_tp2` y `df2_tp2` con tensor-parallel size 2 sobre dos GPUs identicas.
- GPU consumer: si, en principio cabe en RTX 50xx con 24 GB o mas, aunque la model card no certifica modelos concretos ni margen de memoria.
- Opciones de despliegue: exclusivamente GInfer y GChat. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles. La model card solo afirma de forma cualitativa que el motor esta optimizado para alta concurrencia y contexto largo.
- Verificacion de integridad: cada descarga debe comprobarse con `sha256sum`; los hashes estan en la tabla de especificaciones.
- Planificado: paquetes TP4 anunciados para mas adelante, sin fecha.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Runtime |
|---|---|---|---|---|---|
| SectileLabs/qwen38_27b_nvfp4 | 27B | `.ginfer` (NVFP4/FP8) | no disponible | Apache 2.0 | Solo GInfer / GChat |
| Qwen/Qwen3.8-27B (upstream) | 27B | safetensors (BF16) | no disponible | Apache 2.0 | transformers, vLLM, TGI, etc. |
| incoai/Qwen3.8-27B-DFlash2 | 27B (drafter) | no disponible | no disponible | Apache 2.0 | no disponible |

La comparacion relevante es contra el propio modelo upstream: misma licencia y mismos pesos de origen, pero el paquete de SectileLabs reduce el footprint a ~21,7 GB frente a los ~54 GB que ocuparian 27B en BF16, a cambio de perder portabilidad y quedar atado a un motor propietario. No se dispone de datos de benchmarks ni de contexto para comparar calidad o rendimiento con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Dependencia total del runtime: los ficheros no son safetensors ni GGUF y no se pueden cargar en ningun otro motor. Migrar fuera de GInfer exige volver al modelo upstream.
- Hardware restringido: NVFP4 exige GPU Blackwell (RTX 50xx / RTX PRO). No hay soporte para Ampere, Hopper ni Ada.
- Perdida de precision por cuantizacion: MLP en NVFP4 con group size 16 y re-redondeo GPTQ, resto en FP8. No se publican evaluaciones del degradado de calidad respecto a BF16.
- Corpus de calibracion no documentado: el GPTQ se aplico con un corpus propio de Sectile Labs sin especificar dominio ni tamano, lo que impide evaluar posibles sesgos de calibracion.
- Idiomas no declarados: el campo de idiomas esta vacio, por lo que no se puede confirmar cobertura multilingue del paquete.
- Contexto no declarado: se desconoce la ventana maxima soportada en este empaquetado.
- Madurez del artefacto: 0 descargas y 0 likes, creado y actualizado el mismo dia. Sin evidencia de uso en produccion ni validacion externa.
- Paquetes TP2 mal etiquetados en tamano: los ficheros TP2 ocupan practicamente lo mismo que los de una GPU (21,71 GB frente a 21,71 GB), lo que sugiere que el sharding se resuelve en carga y no en disco; conviene verificar el reparto real de memoria antes de planificar capacidad.
- Licencia: Apache 2.0 permite uso comercial, pero la model card aclara que la conversion no altera la licencia upstream; cualquier restriccion adicional del modelo base debe revisarse en su repositorio.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; son los heredados del modelo base Qwen3.8-27B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SectileLabs/qwen38_27b_nvfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`)
- Drafter: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2 (revision `dedf8df68adfb1afeaf7b7480c0a0243108177b4`)
- Paper, blog, repositorio de codigo o demo de GInfer: no disponibles en la informacion proporcionada.
