# ansoncat/qwen3.8-flash-next-ds4-64gb-mac-gguf

## Resumen

Este repositorio no contiene un modelo nuevo, sino una cuantización de un solo archivo GGUF del modelo Qwen3.8-Flash-Next (~179.500 millones de parámetros totales), empaquetada por el usuario ansoncat para poder ejecutarlo con 262.144 tokens de contexto en un MacBook de 64 GB de memoria unificada. Parte del `Qwen3.8-Flash-Next-Q2.gguf` publicado por antirez y aplica tres pasos adicionales con pérdida: recomprime los expertos de proyección *down* de Q2_K a IQ2_XXS, baja las proyecciones densas de Q8_0 a Q4_K y convierte los tensores de hiper-conexión de F16 a Q8_0. El resultado ocupa unos 139,4 GB en disco, de los cuales alrededor de 38 GiB de pesos se mantienen en memoria (el resto, principalmente la tabla de n-gramas, permanece en el SSD).

Su relevancia es práctica: demuestra que un modelo de escala ~180B de arquitectura MoE puede servir decodificación a 45-57 tokens/s y prefill a ~550 tokens/s en hardware de consumo Apple Silicon, con contexto completo de 262K y sin GPU dedicada. El precio es una cuantización muy agresiva (partiendo ya de Q2) y una dependencia total de un fork privado del motor de inferencia: el archivo usa un tipo de tensor propio y proyecciones densas Q4_K que ni el ds4 upstream ni llama.cpp pueden cargar.

Es, por tanto, un artefacto para investigación y uso local en Apple Silicon, no una distribución lista para producción general. La model card documenta de forma inusualmente detallada el proceso de conversión (reproducible byte a byte) y las mediciones de memoria y velocidad paso a paso, lo que lo convierte en una referencia útil sobre el coste real de la cuantización extrema en MoE grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con expertos compartidos, cabeza de prediccion multi-token (MTP) y tensores de hiper-conexion (`hc_attn`, `hc_ffn`) por capa; el detalle completo de la arquitectura del modelo base no esta disponible en la informacion proporcionada |
| Parametros totales | 179.551.050.368 (~179,5 mil millones, dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K), verificado en el fork ds4 con `--ctx 262144` |
| Tipos de cuantizacion | Mezcla heterogenea: expertos *down* en IQ2_XXS (filas de 640 canales), proyecciones densas en Q4_K, tensores `hc_*` en Q8_0, capa MTP y shared-expert down en Q8_0, `output_hc_*` y cabeza MTP en F16 (punto de partida: Q2_K) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF, archivo unico `Qwen3.8-Flash-Next-Q2-IQ2down-Q4Kdense-Q8hc.gguf` (repo de 139,4 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO), por lo que esos datos deben considerarse no disponibles. Lo que si se deduce de la nomenclatura de tensores del archivo es una arquitectura de mezcla de expertos con expertos compartidos, una cabeza de prediccion multi-token (MTP, activable con `--mtp`) y modulos de hiper-conexion de bajo rango por capa, ademas de un componente denominado *indexer* con ring buffer en el motor. No se dispone de confirmacion oficial sobre si la atencion es completa, lineal o hibrida.

La innovacion tecnica documentada esta en el proceso de cuantizacion, no en el modelo. El autor aplica tres transformaciones secuenciales y deterministas sobre el Q2 de antirez: (1) `IQ2down`, que recuantiza los expertos de proyeccion *down* desde los pesos BF16 originales usando la imatrix de Unsloth, en filas de 640 canales con formato IQ2_XXS; (2) `Q4Kdense`, que pasa las proyecciones densas de Q8_0 a Q4_K con redondeo al mas cercano, preservando la capa MTP y el shared-expert down de 640 canales en Q8_0; y (3) `Q8hc`, que comprime los tensores de hiper-conexion de F16 a Q8_0 manteniendo `output_hc_*` y la cabeza MTP en F16. Cada paso es reproducible byte a byte con los scripts `qwen4_down_iq2.py`, `qwen4_dense_q4k.py` y `qwen4_hc_q8.py` del fork, aunque requiere descargar ~75 GiB de shards BF16 e imatrix y space de disco para archivos intermedios de 130-140 GiB.

## Capacidades

- Generacion de texto conversacional en un unico archivo GGUF; el repositorio esta etiquetado como `conversational`.
- Contexto largo real de hasta 262.144 tokens, con decodificacion a 35 tokens/s y prefill a ~545 tokens/s medidos con un prompt de 260K tokens.
- Programacion y trabajo agentico: la model card reporta 9/9 en tres fixtures × tres ejecuciones con Claude Code, con una reduccion del 5% en tiempo de pared respecto al archivo anterior.
- Prediccion multi-token (MTP) para decodificacion especulativa, activada con `--mtp` en el servidor ds4.
- Vision opcional: el archivo no incluye el proyector; se puede anadir `mmproj-Qwen3.8-Flash-Next-Q8_0.gguf` de `ggml-org/Qwen3.8-Flash-Next-GGUF` con `--vision`.
- Servidor HTTP local (`ds4-server`) con el tag `endpoints_compatible`, que sugiere compatibilidad con endpoints de estilo OpenAI; la model card no detalla el grado de compatibilidad.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Modo de razonamiento explicito: la model card mide prompts "with thinking", lo que indica que el modelo base soporta un modo de pensamiento, aunque no se detalla su funcionamiento.

## Casos de uso

- Asistencia de programacion agentica en local: con 262K de contexto y 51 tokens/s de decodificacion se puede mantener una sesion de agente tipo Claude Code sobre un repositorio mediano sin enviar codigo a la nube; el autor valida 9/9 tareas en sus fixtures.
- Analisis de repositorios completos: el prefill de ~563 tokens/s con prompts de 32K permite indexar y consultar varios modulos a la vez dentro de la misma ventana, util para revisiones de codigo y busqueda de dependencias cruzadas.
- Procesamiento de documentacion extensa y expedientes largos en un portatil: contratos, normativas o transcripciones de cientos de miles de tokens caben en una sola ventana, con la ventaja de que los datos no salen del equipo.
- Prototipado y evaluacion de modelos de escala ~180B sin GPU dedicada: util para investigadores que quieran medir comportamiento de un MoE grande en hardware de consumo antes de solicitar clúster.
- Servidor personal de un solo usuario: `ds4-server` con `--ctx` ajustado sirve como backend local para herramientas de escritura, resumen o Q&A sobre corpus propios.
- Investigacion en cuantizacion: el pipeline determinista y las mediciones por etapa (memoria cableada y tokens/s antes/despues de cada parche) sirven como banco de pruebas para estudiar el compromiso entre tamano y calidad en MoE.
- Experimentos de contexto largo: los 262K tokens con cache de atencion que crece dinamicamente permiten estudiar recuperacion de informacion en ventanas muy amplias en una sola maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo que si se publica son mediciones de rendimiento del motor en un M5 Pro de 64 GB con el fork ds4:

| Escenario | Decodificacion (tokens/s) | Prefill (tokens/s) |
|---|---|---|
| Prompt de 8K tokens | 51 | 550 |
| Prompt de 32K tokens | 51 | 563 |
| Prompt de codigo de 16K tokens | 47 | 564 |
| Prompts cortos (codigo / prosa / con thinking) | 57 / 45 / 45 | no disponible |
| Contexto completo de 262K (prompt de 260K, medido antes de c3b08cb) | 35 | 545 (media del prompt completo) |

Memoria cableada del sistema completo con `--ctx 262144 --prefill-chunk 1024`:

| Configuracion | Conversacion de ~9K tokens | Contexto completo de 262K |
|---|---|---|
| ds4 upstream + Q2 oficial | KV de 262K cableada en cuanto se usa | 55,0-55,7 GiB |
| Version final de este archivo | ~38 GiB | 44,1 GiB (41,4 GiB sobre una linea base idle de 2,65 GiB) |

Datos adicionales: en reposo (modelo cargado, sin peticion) el consumo baja de 42,2 a 4,0 GiB con `DS4_METAL_NO_RESIDENCY=1`; el paso de `IQ2down` a este archivo mejora la decodificacion en contexto largo un 10-13% (8K: 41,0 → 46,1; 32K: 40,7 → 44,8; codigo 16K: 37,4 → 42,2) sin cambios en prefill; usar `--prefill-chunk 1024` en lugar de 2048 cuesta ~10% de prefill a cambio de ~1 GiB de memoria.

## Requisitos de hardware

- Memoria: 64 GB de memoria unificada en Apple Silicon; el autor usa un M5 Pro. Con contexto completo de 262K el uso cableado es de 44,1 GiB; en conversaciones normales, alrededor de 38 GiB de pesos en memoria.
- Ajuste obligatorio del limite de memoria de GPU: `sudo sysctl iogpu.wired_limit_mb=57344` para poder cablear el contexto completo. Sin este ajuste hay que reducir `--ctx`.
- Almacenamiento: el archivo pesa ~139,4 GB y la mayor parte (tabla de n-gramas) se lee del SSD en lugar de residir en memoria; se recomienda SSD rapido.
- Espacio temporal: el pipeline de conversion necesita 16 GiB libres adicionales tras cada paso y maneja archivos intermedios de 130-140 GiB.
- GPU compatibles: unicamente Apple Silicon con Metal. No hay ruta documentada para CUDA (A100, H100, RTX 4090) ni para GPUs de consumo x86.
- Motor de inferencia: exclusivamente el fork `ansoncat/ds4`, rama `kv-grow`. Ni llama.cpp ni el ds4 upstream pueden cargar el archivo por el tipo de tensor privado y las proyecciones densas Q4_K. No hay soporte documentado para vLLM, TGI, Ollama ni llama.cpp.
- Variables de entorno necesarias: `DS4_METAL_NO_RESIDENCY=1` y `DS4_QWEN4_HC_Q8_GEMM=1` (sin la segunda, el prefill es un 62% mas lento).
- Throughput esperado: 45-57 tokens/s de decodificacion con prompts cortos y hasta 32K, 35 tokens/s a 262K; prefill de 545-564 tokens/s. La GPU esta ocupada ~96% de un paso de decodificacion en el equipo de prueba, por lo que no hay margen para ocultar latencia de SSD.
- Vision: requiere descargar aparte el proyector `mmproj-Qwen3.8-Flash-Next-Q8_0.gguf`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad y requisitos |
|---|---|---|---|---|---|
| Este archivo (`ansoncat/...-64gb-mac-gguf`) | ~179,5B totales | 262.144 | Q2 base + IQ2_XXS + Q4_K + Q8_0 | qwen-community-1.0 | Fork ds4 `kv-grow`; 64 GB Apple Silicon; 7 descargas, 0 likes |
| `antirez/qwen3.8-flash-next-gguf` (`Qwen3.8-Flash-Next-Q2.gguf`) | ~179,5B totales | 262.144 (con `--prefill-chunk 1024`) | Q2 | no disponible en la informacion | ds4 upstream; ~55 GiB cableados a contexto completo |
| `ggml-org/Qwen3.8-Flash-Next-GGUF` (GGUF oficial) | ~179,5B totales | no disponible | Q8_0 en el proyector de vision; otras variantes no disponibles | no disponible en la informacion | Distribucion oficial; incluye `mmproj-Qwen3.8-Flash-Next-Q8_0.gguf`; requiere ds4 |
| Alternativas de otros fabricantes con ~180B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de otros fabricantes en la informacion proporcionada, por lo que no es posible establecer una comparacion de calidad.

## Limitaciones y advertencias

- Cuantizacion acumulativamente agresiva: se parte de un Q2 y se aplican tres pasos con perdida adicionales. No se publica perplejidad ni evaluacion de calidad, por lo que la degradacion frente al BF16 es desconocida y potencialmente significativa en razonamiento y matematicas.
- Compatibilidad restringida: el archivo solo carga en el fork `ansoncat/ds4` rama `kv-grow`. Cualquier actualizacion del formato o del motor puede romper la carga, y no hay soporte de la via estandar llama.cpp.
- Dependencia de un unico mantenedor y de una rama concreta (`kv-grow`), con requisitos de variables de entorno que, si se omiten, degradan el rendimiento sin aviso claro.
- Plataforma unica: Metal / Apple Silicon. No hay soporte CUDA documentado, lo que excluye su uso en servidores con A100/H100 y en la mayoria de infraestructuras cloud.
- Vision no incluida: hay que descargar el proyector por separado desde otro repositorio, con el riesgo de desalineacion de versiones.
- Idiomas no declarados: no hay lista oficial de idiomas soportados ni evaluacion multilingue en la informacion disponible.
- Licencia `qwen-community-1.0` (etiquetada como `other`): es una licencia de comunidad de Qwen, no una licencia permisiva tipo Apache 2.0 o MIT. Debe revisarse el archivo `LICENSE` del repositorio antes de cualquier uso comercial; las condiciones concretas (umbrales de usuarios, atribucion, restricciones) no estan disponibles en la informacion proporcionada.
- Riesgo de alucinacion no cuantificado: al no haber evaluacion publicada, no se puede estimar la tasa de errores facticos ni su comportamiento en dominios especializados.
- Madurez baja: 7 descargas y 0 likes en el momento de la consulta, con una unica sesion de medicion por parte del autor; los propios numeros de velocidad varian entre sesiones segun reconoce la model card.
- Ajuste manual del sistema necesario (`iogpu.wired_limit_mb`), que afecta a toda la maquina y no solo al proceso de inferencia.
- Los datos de medicion corresponden a un unico equipo (M5 Pro de 64 GB); el rendimiento en otros chips de la familia M no esta documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ansoncat/qwen3.8-flash-next-ds4-64gb-mac-gguf
- Modelo base de la cuantizacion: https://huggingface.co/antirez/qwen3.8-flash-next-gguf
- GGUF oficial y proyector de vision: https://huggingface.co/ggml-org/Qwen3.8-Flash-Next-GGUF
- Pesos BF16 de referencia citados en el proceso de conversion: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fork del motor de inferencia (rama `kv-grow`, ver `FORK.md`): https://github.com/ansoncat/ds4
- Resultados de busqueda web: no se han encontrado resultados relevantes sobre este modelo; las busquedas devolvieron unicamente contenido no relacionado, por lo que no se incluye ningun enlace adicional.
