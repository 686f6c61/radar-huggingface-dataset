# sahenjp/Ternary-Bonsai-2.5-27B-QSA-GGUF

## Resumen

Ternary-Bonsai-2.5-27B-QSA-GGUF es una cuantizacion ternaria de 2 bits de un modelo Qwen de 27.373 millones de parametros, empaquetada en un unico fichero GGUF de 6,14 GiB. Lo publica el usuario `sahenjp` combinando los pesos ternarios de PrismML (`prism-ml/Ternary-Bonsai-2.5-27B-GGUF`, derivados de `Qwen/Qwen3.8-27B`) con 80 tensores FP32 de indice de atencion dispersa Qwen Sparse Attention (QSA), destilados especificamente contra las distribuciones de atencion densa del propio modelo ternario.

El modelo resuelve un problema concreto: permitir contexto largo (hasta 262.144 tokens) en GPUs de consumo y en tarjetas de 16-24 GB, algo inviable con un transformer denso de ese tamano. Para ello combina una arquitectura hibrida de 64 capas (48 Gated DeltaNet con estado recurrente O(1) y 16 capas de atencion completa con QSA) con una cabeza de prediccion multi-token (MTP) que acelera la decodificacion especulativa.

Es relevante ahora porque demuestra que una cuantizacion agresiva a 1,75 bits por peso puede mantener paridad funcional casi total con el modelo denso (98,4-100% en 62 tareas) y ganar hasta 4,32x en velocidad de decodificacion a 128K. El principal caveat es que requiere un parche propio sobre una rama especifica de `llama.cpp`; el motor estandar no puede ejecutar los GGUF con QSA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de 64 capas: 48 Gated DeltaNet + 16 capas de atencion completa con Qwen Sparse Attention (QSA) en las capas 3, 7, ..., 63; cabeza MTP en `blk.64` |
| Parametros totales | 27.373.132.800 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) verificado en una sola GPU de 24 GB |
| Tipos de cuantizacion | Ternaria `PTQ1_0` a 1,75 bpw (866 tensores base) + 80 tensores FP32 de indice QSA (52.434.944 parametros, 200 MiB) |
| Idiomas soportados | Ingles (en) y japones (ja) |
| Licencia | Apache-2.0 (pesos, indices, scripts y docs); MIT (parche de motor `patches/bonsai-qsa-engine.patch`) |
| Formato de pesos | GGUF (6.442.564.320 bytes, 946 tensores) |

## Arquitectura y entrenamiento

La arquitectura es hibrida: 48 de las 64 capas usan Gated DeltaNet, un mecanismo recurrente con estado de complejidad O(1) que no hace crecer la cache KV con el contexto; las 16 restantes son capas de atencion completa equipadas con Qwen Sparse Attention. La configuracion QSA usa `block_size = 4` y `top_k = 2048` (512 bloques mas el bloque causal propio, hasta 2.052 tokens KV atendidos), con 4 cabezas Q y 1 cabeza K, `head_dim = 128` y `rope_dim = 64`. Ademas incluye una cabeza MTP en `blk.64` para decodificacion especulativa.

Los pesos base son una cuantizacion post-entrenamiento ternaria (PTQ) a 1,75 bpw realizada por PrismML sobre `Qwen/Qwen3.8-27B`; los 866 tensores se copian literalmente sin recuantizar. La innovacion de esta ficha son los 80 tensores FP32 del indice QSA, calentados desde la version v2 de `higa2515` y destilados contra las distribuciones de atencion densa en `PTQ1_0` del propio modelo ternario: reducen la KL de validacion en las 16 capas de atencion un 19,3% (0,4102 a 0,3309) y hasta un 40,5% en la capa 59 (0,8382 a 0,4987). No se detalla en la informacion disponible el volumen de tokens de entrenamiento ni la composicion del dataset original de Qwen3.8-27B.

## Capacidades

- Generacion de texto conversacional y razonamiento de proposito general.
- Codigo: ejecucion verificada en tareas de Python con paridad del 98,4-100% frente al modelo denso.
- Matematicas: evaluado en GSM8K-30 con paridad exacta de respuesta frente a la version densa.
- Tool calling: soporte de `tool_calls` en formato OpenAI, con paridad verificada frente a denso.
- Uso agentico y razonamiento multi-paso, etiquetado explicitamente en la model card.
- Contexto largo real: recuperacion de agujas a multiples profundidades al 100% en 64K (8/8), 128K (5/5) y 256K (5/5).
- Razonamiento semantico sin solapamiento lexico (NoLiMa): 100% (8/8) en 64K y 128K.
- Memoria de restricciones multi-turno en japones a 64K: 100% (8/8).
- Decodificacion especulativa mediante cabeza MTP integrada.
- Multilingue limitado a ingles y japones.

## Casos de uso

- Atencion al cliente con historial largo: el modelo puede mantener conversaciones multi-turno con hasta 256K tokens de contexto en una unica GPU de 24 GB, lo que permite adjuntar manuales, tickets previos y politicas completas sin recuperacion externa.
- Analisis de repositorios de codigo: con 256K de contexto y paridad de ejecucion en Python, es viable cargar modulos completos y razonar sobre ellos; su soporte de `tool_calls` permite encadenar ejecucion de tests dentro del bucle del agente.
- Agentes autonomos con herramientas: la combinacion de tool calling verificado, razonamiento multi-paso y MTP para reducir latencia lo hace adecuado para pipelines de agentes en produccion sobre hardware modesto.
- Procesamiento de documentos legales o tecnicos en japones e ingles: los resultados de memoria de restricciones y NoLiMa en japones a 64K respaldan resumenes y QA sobre contratos o normativa extensa.
- Despliegue en el borde o en estaciones de trabajo: con 6,14 GiB de pesos y unos 8,6-9,9 GiB de VRAM a 64-96K en una RTX 3060 o 4070, cabe en equipos de desarrollo sin GPU de datacenter.
- Analisis de trazas y logs de sistemas: la ventana de 256K permite ingerir series largas de eventos y correlacionarlos; la atencion dispersa mantiene el coste de prefill controlado (841 tok/s a 256K en A10G).
- Servicio de inferencia de bajo coste en T4: con 13,23 GiB de VRAM a 192K y 21,51 tok/s de decodificacion, es una opcion realista para endpoints en GPUs de gama baja de cloud.

## Benchmarks y rendimiento

| Prueba | Resultado | Referencia |
|---|---|---|
| Decodificacion a 128K en Tesla T4 | 23,18 tok/s (desde 5,37) | Aceleracion 4,32x; prefill 1,55x |
| Decodificacion a 256K en NVIDIA A10G | 44,06 tok/s (desde 18,64) | Aceleracion 2,36x; prefill 543,05 a 841,19 tok/s |
| MTP de 8K a 64K | +50% a +68% de throughput | Cabeza `blk.64` con `--spec-draft-n-max 2` |
| KL de validacion en 16 capas de atencion | 0,4102 a 0,3309 (-19,3%) | Capa 59: 0,8382 a 0,4987 (-40,5%) |
| Perplejidad a 64K, PG-19 ingles | +1,155% frente a denso | Mejor delta entre los indices probados |
| Perplejidad a 32K, Wikipedia japones | +0,741% frente a denso | — |
| Perplejidad a 32K, codigo Python | +0,126% frente a denso | — |
| Recuperacion de agujas | 100% en 64K, 128K y 256K | 8/8, 5/5 y 5/5 |
| NoLiMa (parafrasis sin solapamiento lexico) | 100% en 64K y 128K | 8/8 |
| Memoria de restricciones en japones a 64K | 100% | 8/8, 4 turnos |
| `recall-grid` duro a 128K | 201/240 (83,75%) | Denso: 225/240; higa2515-v2: 202/240 |
| Paridad exacta en 62 tareas generales | 98,4% a 100,0% | GSM8K-30, codigo Python, `tool_calls` |

No se han publicado resultados de MMLU, HumanEval u otros benchmarks academicos estandar en la informacion disponible.

## Requisitos de hardware

- Pesos en disco y VRAM base: 6,14 GiB de fichero GGUF; el peso en VRAM depende de la cache KV, que solo crece en las 16 capas de atencion completa.
- GPU de 12 GB (RTX 3060, RTX 4070): contexto practico de 64K a 96K con cache KV `q8_0`, pico medido de 8,6 a 9,9 GiB.
- GPU de 16 GB (Tesla T4, `sm_75`): 128K con 10,77 GiB y 192K con 13,23 GiB; decodificacion de 23,18 y 21,51 tok/s respectivamente.
- GPU de 24 GB (A10G, RTX 3090, RTX 4090): 256K con 15,85 GiB (16.227 MiB) y 44,06 tok/s en A10G.
- GPU de 48 GB (L40S, A6000): 256K con 16,04 GiB en `q8_0`, 58,09 tok/s y prefill de 2.224 tok/s.
- Cabe en GPU de consumo: si, desde una RTX 3060 de 12 GB (hasta 96K) y con 256K en RTX 3090 o 4090.
- Despliegue: exclusivamente `llama.cpp` con el parche `patches/bonsai-qsa-engine.patch` aplicado sobre la rama `prism` de `PrismML-Eng/llama.cpp`. El kernel `qsa-attn.cu` soporta cache KV en F16 y Q8_0 con rotacion de Hadamard; existe el conmutador `LLAMA_QSA_DENSE=1` para comparacion densa exacta sobre el mismo fichero. No hay soporte indicado para vLLM, TGI, Ollama ni motores estandar.
- Parametros de ejecucion medidos: `-ngl 999 -fa on -np 1 -b 512 -ub 512`, con `-ctk q8_0 -ctv q8_0` para contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-QSA (esta ficha) | 27,37B | 256K | Ternaria 1,75 bpw + indices FP32 | Apache-2.0 / MIT (parche) | Requiere parche de motor; 6,14 GiB |
| Ternary-Bonsai-2.5-27B (PrismML) | 27,37B | No disponible en la informacion | Ternaria `PTQ1_0` | No disponible | Modelo base sin QSA; mismo tamano de pesos |
| Qwen/Qwen3.8-27B | 27,37B | No disponible en la informacion | BF16 y otras | No disponible | Modelo denso original; sin cuantizar no cabe en GPU de consumo |
| higa2515/Qwen3.8-27B-QSA-BF16 | 27,37B | No disponible en la informacion | BF16 con QSA | No disponible | Version densa con atencion dispersa; mayor huella de VRAM |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de motor: los GGUF con QSA no funcionan en `llama.cpp` estandar; sin el parche sobre la rama `prism` el modelo no es ejecutable. Esto complica el despliegue en produccion y ata la version del motor.
- Idiomas: solo ingles y japones declarados; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Perdida de precision por cuantizacion: la perplejidad aumenta entre un 0,126% y un 1,155% segun dominio y longitud, y en `recall-grid` duro a 128K cae a 201/240 frente a 225/240 del denso.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni de calibracion; la cuantizacion ternaria agresiva puede ampliar la deriva en generacion abierta.
- Sesgos: no se proporciona ninguna evaluacion de sesgos, toxicidad o alineacion del modelo base ni del proceso de destilacion.
- Uso comercial: los pesos y scripts son Apache-2.0, pero el parche de motor es MIT y el modelo base Qwen3.8-27B tiene su propia licencia, que debe verificarse por separado antes de un despliegue comercial.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta; es una publicacion reciente y sin validacion independiente de terceros.
- Reproducibilidad: las cifras de rendimiento dependen de la version exacta del parche y de la rama `prism`, no de un release estable de `llama.cpp`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahenjp/Ternary-Bonsai-2.5-27B-QSA-GGUF
- Modelo base ternario (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Modelo denso original: https://huggingface.co/Qwen/Qwen3.8-27B
- Version BF16 con QSA: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Paper de referencia: https://arxiv.org/abs/2608.30320
- Repositorio del motor: https://github.com/PrismML-Eng/llama.cpp (rama `prism`)
- Parche de motor: `patches/bonsai-qsa-engine.patch` (incluido en el repositorio del modelo, licencia MIT)
- Indices QSA destilados: `bonsai25-qsa-indexers.safetensors` (incluido en el repositorio del modelo)
