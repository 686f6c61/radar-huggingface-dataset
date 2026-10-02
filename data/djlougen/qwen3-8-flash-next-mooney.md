# DJLougen/Qwen3.8-Flash-Next-Mooney

## Resumen

Qwen3.8-Flash-Next-Mooney es una cuantizacion experimental del checkpoint Qwen3.8-Flash-Next de Alibaba (Qwen), publicada por el usuario DJLougen. El modelo base es un MoE de 180B parametros totales que combina un transformer de lenguaje de 125B (48 capas, 512 expertos enrutados, routing top-10, unos 6B parametros activos por token), una tabla de embeddings n-grama "PLE" de 51,2B, una cabeza MTP de 2,6B y una torre de vision de 0,45B. La receta Mooney comprime los expertos enrutados a pesos ternarios (`PQ2_0`) almacenados en una base rotada, mantiene el resto del transformer en 8 bits (`Q8_0`) y deja la tabla PLE en 8 bits leida bajo demanda desde SSD.

El problema que resuelve es de despliegue: en BF16 el modelo requiere unos 335 GiB de memoria, y una cuantizacion GGUF de 4 bits habitual ocupa 104-114 GB, suficiente para llenar por si sola una DGX Spark. Mooney ocupa aproximadamente 39 GiB en ejecucion (unos 35 GiB de pesos, mas KV y contexto), lo que permite ejecutar un modelo de 180B en una sola maquina con memoria unificada, reservando espacio para contexto largo.

La relevancia actual viene de que es una de las primeras builds publicas que consigue un modelo MoE de esta escala en una unica DGX Spark manteniendo, segun las mediciones del autor, el 95,5 % de la puntuacion de la version BF16 en una suite de 536 tareas verificables. Exige, eso si, runtimes parcheados: ni `llama.cpp` estandar ni las herramientas convencionales leen el tipo ternario `PQ2_0` ni los metadatos de rotacion `lowbitflash.rot.*`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida GDN + QSA, 48 capas, 512 expertos enrutados, routing top-10, cuatro flujos persistentes HyperConnection y tabla Engram de embeddings n-grama (`ple` en la configuracion del checkpoint) |
| Parametros totales | 176.943.899.520 (~176,9B) segun safetensors; el modelo base se describe como 180B incluyendo cabeza MTP (2,6B) y torre de vision (0,45B) |
| Parametros activos | ~6B por token |
| Longitud de contexto | 262.144 tokens nativos en el modelo base, extensible a 1M con YaRN (dato del modelo base, no verificado en esta build) |
| Tipos de cuantizacion | Expertos enrutados: ternario `PQ2_0` (2,125 bits/peso). Resto del transformer: `Q8_0` (8 bits); tensores pequenos en F32/BF16. Tabla PLE: 8 bits. Vision: `mmproj` BF16. Cabeza MTP: `Q8_0` (conversion Unsloth, sin modificar) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF (4 shards de texto, 92,0 GB) + `mmproj` de vision (0,9 GB) + archivo MTP opcional |

Distribucion de bits declarada por el autor (contada desde las cabeceras de tensores GGUF):

| Parte | Parametros | Formato | Bits/peso | Tamano |
|---|---|---|---|---|
| Expertos enrutados | 120,8B | ternario (`PQ2_0`) | 2,125 | 32,1 GB |
| Otros pesos del transformer | 4,9B | `Q8_0`; tensores pequenos F32/BF16 | 8,9 | 5,5 GB |
| Total transformer | 125,7B | | 2,39 | 37,6 GB |
| Tabla PLE n-grama | 51,2B | `Q8_0` | 8,5 | 54,4 GB (en SSD) |
| Modelo de texto, 4 shards | 176,9B | | 4,16 | 92,0 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un MoE de atencion hibrida: combina atencion GDN (Gated Delta Net) con QSA (Qwen Sparse Attention) y anade cuatro flujos persistentes HyperConnection. Sobre el transformer se apoya una tabla Engram de embeddings n-grama de 51,2B parametros (denominada `ple` en el checkpoint) que el modelo consulta durante la inferencia. El MoE tiene 48 capas, 512 expertos enrutados y routing top-10, con unos 6B parametros activos por token sobre un total de 125B en el modelo de lenguaje. La cabeza MTP permite decodificacion especulativa de multiples tokens.

Sobre el proceso de cuantizacion, la model card describe la receta Mooney como una combinacion de tres pasos: pesos ternarios para los expertos enrutados almacenados en una base rotada, recuperacion mediante entrenamiento por destilacion (recovery training), y tabla PLE en 8 bits leida de forma perezosa desde SSD con las filas de uso frecuente cacheadas en memoria. Los pesos no-expertos quedan en `Q8_0` y los tensores pequenos se conservan en F32/BF16. Toda la pipeline (referencia BF16, cuantizacion de expertos, recovery training y evaluacion) se ejecuto en una maquina de 8x A100 80 GB cedida por Lambda. No hay informacion disponible sobre composicion del dataset de entrenamiento original del modelo base, ni sobre si hubo RLHF o DPO; la model card solo menciona que el modelo base tiene thinking activado por defecto con `reasoning_effort` ajustable.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activo por defecto y nivel de esfuerzo de razonamiento ajustable (segun el modelo base).
- Procesamiento de imagen y texto (`image-text-to-text`), mediante un archivo `mmproj` BF16 separado de 0,9 GB. En el motor rapido, MTP se desactiva automaticamente para peticiones con imagen.
- Codigo y matematicas: la suite de evaluacion del autor mide tareas de tests unitarios, respuestas exactas y comprobaciones de esquema y tool-calls.
- Tool calling / function calling: la propia evaluacion incluye verificaciones de tool-calls correctos, lo que confirma soporte funcional.
- Razonamiento multi-paso y agentes: el uso de MTP con decodificacion especulativa y la ventana de contexto larga apuntan a flujos agenticos, aunque no se documentan capacidades agenticas especificas mas alla de los tool-calls.
- Contexto largo: recuperacion tipo needle documentada a 32k, 64k y 128k tokens (30/30 aciertos estrictos) y 5/5 a 256k en el motor rapido.
- Idiomas: no disponible.

## Casos de uso

- Evaluacion local de modelos a escala 180B: un investigador con una sola DGX Spark puede reproducir comparativas contra BF16 o FP8 sin montar un servidor de 8 GPUs, gracias a los ~39 GiB de huella medida.
- Contexto largo sobre documentos extensos: con 262.144 tokens nativos y recuperacion needle verificada hasta 128k y 256k, es adecuado para resumir o consultar repositorios de documentacion, actas o expedientes completos en una sola pasada.
- Asistencia de codigo con verificacion automatica: al soportar tool-calls y superar pruebas con tests unitarios en la suite del autor, puede integrarse en pipelines que generan parches y los validan con la suite de tests del repositorio.
- Pipelines multimodales ligeros: la torre de vision separada permite describir capturas, diagramas o esquemas tecnicos junto a texto, con la salvedad de que MTP se desactiva en esas peticiones.
- Servidor compatible con OpenAI en local: el script `serve_ds4.sh` levanta un endpoint OpenAI-compatible en `http://127.0.0.1:8000/v1`, lo que permite sustituir una API remota por este modelo en herramientas que ya hablan ese protocolo.
- Investigacion sobre cuantizacion ternaria: el repositorio es un caso de estudio reproducible de cuantizacion ternaria con recovery training, util para equipos que estudien compresion agresiva de MoE con perdida controlada.
- Despliegue en hardware con memoria unificada de 96-128 GB: es el escenario natural segun las guias de terceros, que recomiendan este checkpoint sobre alternativas de 4 bits cuando la maquina dispone de esa cantidad de memoria.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (2026-09-30). Suite propia de 536 tareas con respuesta verificada automaticamente (tests unitarios, respuestas exactas, comprobaciones de esquema y de tool-calls), ejecutada dos veces por modelo sobre vLLM en 8x A100 con los mismos valores de pesos:

| Modelo | Aciertos (ronda 1 / ronda 2) | Porcentaje | Relativo a BF16 |
|---|---|---|---|
| BF16 original | 500 / 496 de 536 | 92,91 % | 100 % |
| Mooney (esta build) | 475 / 476 de 536 | 88,71 % | 95,5 % |

Contexto largo (recuperacion needle, coincidencia exacta estricta, texto no visto en calibracion ni evaluacion):

| Longitud | Metodo | Resultado |
|---|---|---|
| 32k tokens | 5 profundidades x 2 needles | 10/10, identico a BF16 |
| 64k tokens | 5 profundidades x 2 needles | 10/10, identico a BF16 |
| 128k tokens | 5 profundidades x 2 needles | 10/10, identico a BF16 |
| 256k tokens | motor rapido | 5/5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Huella en ejecucion: ~39 GiB medidos en una DGX Spark (delta de `MemAvailable` incluyendo KV y contexto), de los cuales ~35 GiB son pesos. El resto de la memoria queda libre para contexto largo y otras tareas.
- Referencia de comparacion: en BF16 el modelo base necesita ~335 GiB; una build GGUF de 4 bits habitual ocupa 104-114 GB y ya llena una DGX Spark por si sola.
- Tamano de descarga: 92,0 GB para los 4 shards de texto, mas 0,9 GB del `mmproj` de vision y el archivo MTP opcional. La tabla PLE de 54,4 GB permanece en SSD y se lee bajo demanda, no se carga en memoria.
- GPU recomendadas: DGX Spark o cualquier maquina con memoria unificada de 96-128 GB. La cuantizacion y evaluacion originales se hicieron en 8x A100 80 GB, pero eso corresponde al proceso de creacion, no al de inferencia.
- GPU de consumo: no cabe en GPUs de consumo con VRAM discreta convencional. Las guias de terceros recomiendan explicitamente no intentarlo en una tarjeta de 24 GB.
- Opciones de despliegue: solo dos runtimes parcheados funcionan con estos archivos. El motor rapido `cudafast-qwen38-125b-a6b-engine` (rama `lbf/pq2-rot`), con decodificacion serial, decodificacion especulativa MTP y entrada de imagen; y el fork `prism-llama.cpp` (rama `lbf/flashnext-ternary`), con decodificacion serial y vision via `mmproj`. `llama.cpp` estandar no puede ejecutar estos ficheros.
- Puesta en marcha: `git clone https://github.com/DJLougen/mooney-spark`, `./setup_spark.sh` (o `--runtime llama.cpp`) y `~/mooney-spark/launch/serve_ds4.sh`, que levanta un servidor OpenAI-compatible en `http://127.0.0.1:8000/v1`. La descarga verifica sha256 por archivo.
- Latencia y throughput: la model card no publica cifras de tokens por segundo. El autor indica que, en la reproduccion de trazas reales de lookup sobre SSD, la mayoria de tokens de decodificacion no necesitaron lectura de disco una vez cacheadas las filas de uso frecuente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Huella | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Mooney (esta build) | 176,9B totales, ~6B activos | 262.144 nativos (base) | 88,71 % en la suite del autor (95,5 % de BF16) | ~39 GiB en ejecucion | qwen-community-1.0 | GGUF, requiere runtime parcheado |
| Qwen3.8-Flash-Next BF16 (base) | 180B totales, ~6B activos | 262.144 nativos, 1M con YaRN | 92,91 % en la misma suite | ~335 GiB | qwen-community-1.0 | Pesos originales, vLLM y similares |
| Qwen3.8-Flash-Next FP8 (oficial de Qwen) | 180B totales, ~6B activos | 262.144 nativos, 1M con YaRN | Qwen reporta rendimiento casi identico al BF16 | No disponible en la informacion proporcionada | qwen-community-1.0 | Cuantizacion FP8 oficial, block size 128 |
| Build GGUF 4 bits generica | 180B totales, ~6B activos | 262.144 nativos (base) | No disponible | 104-114 GB | Segun procedencia del build | GGUF, llama.cpp estandar |

No se dispone de datos para comparar contra alternativas MoE de otro fabricante en la misma franja de parametros y activaciones.

## Limitaciones y advertencias

- Perdida de calidad medible: 4,2 puntos porcentuales menos que BF16 en la suite del autor (88,71 % frente a 92,91 %). En tareas sensibles a precision puede ser insuficiente.
- Incompatibilidad con tooling estandar: `llama.cpp` de fabrica no puede cargar los ficheros por el tipo ternario `PQ2_0` y los metadatos `lowbitflash.rot.*`. Solo funcionan los dos runtimes parcheados del autor, lo que complica el soporte a largo plazo y la integracion en infraestructura existente.
- Ecosistema muy limitado: 1 descarga y 2 likes en el momento de la consulta. Es una build reciente (creada el 30 de septiembre de 2026) sin validacion independiente.
- La evaluacion de calidad la realiza el propio autor con su propia suite de 536 tareas; no hay verificacion por terceros ni benchmarks estandar reproducibles.
- Dependencia de SSD para la tabla PLE: el rendimiento dependera de la latencia del almacenamiento y del acierto de la cache de filas frecuentes. El autor afirma que la mayoria de tokens de decodificacion no requirieron lectura de disco, pero no publica throughput.
- Vision condicionada: con MTP la decodificacion especulativa se desactiva en peticiones de imagen, lo que reduce el rendimiento en ese modo.
- Idiomas soportados: no disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un modelo de 180B con thinking activado por defecto, por lo que conviene validar salidas en produccion.
- Sesgos: no documentados.
- Licencia: `qwen-community-1.0` (`license: other`). Es una licencia especifica de Qwen con condiciones propias; hay que revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial. La model card del autor no aclara condiciones adicionales sobre la cuantizacion.
- Todo el trabajo dependio de recursos de terceros (8x A100 cedidas por Lambda); conviene tenerlo en cuenta al planificar reproducibilidad.
- La model card esta truncada en la informacion proporcionada, por lo que pueden existir detalles adicionales no recogidos aqui.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/DJLougen/Qwen3.8-Flash-Next-Mooney
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Herramientas de despliegue en DGX Spark: https://github.com/DJLougen/mooney-spark
- Motor rapido (cudafast): https://github.com/DJLougen/cudafast-qwen38-125b-a6b-engine
- Fork de llama.cpp con soporte ternario: https://github.com/DJLougen/prism-llama.cpp
- Documentacion de NeMo AutoModel sobre el modelo base: https://github.com/NVIDIA-NeMo/Automodel/blob/main/docs/model-coverage/llm/qwen/qwen3-8-flash-next.mdx
- Ficha de la cuantizacion FP8 oficial en Modal: https://modal.com/library/qwen/qwen3-8-flash-next-fp8
- Guia de hardware de terceros: https://www.runaihome.com/blog/qwen38-flash-next-local-ai-hardware-guide-2026/
- Perfil del autor en X: https://x.com/DJLougen
- Perfil de Zach Mueller en X: https://x.com/TheZachMueller
- Lambda: https://lambda.ai
- Apoyo al autor: https://ko-fi.com/djlougen
