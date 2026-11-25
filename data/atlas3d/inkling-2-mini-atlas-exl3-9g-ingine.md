# Atlas3D/Inkling-2-Mini-atlas-exl3-9g-ingine

## Resumen

Inkling-2-Mini-atlas-exl3-9g-ingine es una cuantizacion extrema del modelo base thinkingmachines/Inkling-2-Mini, un Mixture-of-Experts (MoE) con bucle de razonamiento de 26,07B parametros, publicada por Atlas3D. El checkpoint empaqueta los pesos del LLM de texto en EXL3/Escha sub-3-bit junto con embeddings en Q4_0 y una cache KV global de 4 bits (`--kv-q4`), logrando un peso en disco de 10,08 GB para el modelo de texto y 11,38 GB para el repositorio completo (texto, vision y cabezal MTP de decodificacion especulativa). El objetivo declarado es ejecutar el modelo con ventanas de contexto muy largas en GPUs de consumo.

La relevancia de esta ficha radica en su propuesta de contexto: segun la model card, el checkpoint permite una ventana completa de 262.144 tokens en 11,64 GiB de VRAM en una RTX 3090, y un contexto residente de 1.048.576 tokens (1M) en 18,62 GiB en la misma GPU, con resultados de Needle-in-a-Haystack de 9/9. Estos datos son mediciones del autor con su propio motor, atlas-ingine, y no se han verificado de forma independiente.

El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para el motor atlas-ingine (rama `feat/kvq4-elastic-9g`), no para llama.cpp ni vLLM estandar. La pipeline declarada es image-text-to-text, con el codificador visual separado en un fichero opcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con bucle de razonamiento (looped Mixture-of-Experts), transformer; cuantizacion EXL3/Escha sub-3-bit con embeddings Q4_0 y cache KV Q4 |
| Parametros totales | 16.958.627.328 (~16,96B en safetensors); la model card del autor cita 26,07B para el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens medidos; 1.048.576 tokens (1M) soportados en el motor atlas-ingine |
| Tipos de cuantizacion | EXL3/Escha sub-3-bit (pesos MoE), Q4_0 (embeddings y cache KV), dense-fp8 opcional |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos shards de texto y vision) mas `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con "bucle de razonamiento" de tres pasadas: la model card describe una estructura con prelude de una sola pasada y un nucleo de razonamiento repetido tres veces, al que se aplica una cuantizacion por niveles ("loop-tiered Elastic quantization") que preserva mas precision en el nucleo y en la cola de salida que en los bloques de prelude. Esta version concreta no reentrena el modelo: es una conversion de pesos del checkpoint original de thinkingmachines, por lo que los datos de entrenamiento, el numero de tokens y el proceso de alineacion (RLHF/DPO) corresponden al modelo base y no se detallan en la informacion disponible.

La innovacion tecnica del checkpoint es la compresion: pesos MoE en sub-3-bit, embeddings en Q4_0 y una cache KV global de 4 bits que reduce el coste de memoria del contexto largo (9,00 GiB de KV completo para 1M tokens, mas 160 MiB de ventana deslizante). Ademas, el autor separa el codificador de vision y un cabezal DSpark MTP de decodificacion especulativa en ficheros opcionales, de modo que se pueden omitir para ahorrar 0,64 GB cada uno o 1,27 GB con `--text-only`. La model card menciona 48/48 kernels `kernels_bitlock` en estado PASS como validacion del motor.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de contexto largo (hasta 1M tokens en el motor atlas-ingine).
- Razonamiento multi-paso mediante el nucleo MoE con bucle de tres pasadas.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el codificador visual incluido en `model-00002-of-00002.safetensors`.
- Decodificacion especulativa con el cabezal DSpark MTP (`mtp.safetensors`), que segun el autor eleva el rendimiento de 112 a 160 tok/s en codigo sobre RTX 3090.
- Recuperacion de informacion en contextos muy largos: Needle-in-a-Haystack 9/9 (100%) en las pruebas del autor a 262K, 512K y 1M tokens.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y planificacion autonoma: no disponible en la informacion proporcionada.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 262K tokens de ventana y 11,64 GiB de VRAM en una RTX 3090, el modelo puede cargar un arbol de codigo extenso y responder preguntas sobre el sin trocear en fragmentos, manteniendo coherencia entre ficheros.
- Procesamiento de documentacion legal o contractual: la ventana de 1M tokens permite introducir expedientes completos y hacer preguntas de recuperacion exacta; los resultados 9/9 de Needle-in-a-Haystack del autor respaldan esta funcion, aunque conviene validarla en el dominio propio.
- Asistente de codigo en estaciones de trabajo con GPU de 12-24 GB: el checkpoint de texto ocupa 10,08 GB y corre a 112 tok/s en RTX 3090 sin decodificacion especulativa, lo que lo hace viable en equipos de desarrollo individuales sin GPU de centro de datos.
- Transcripcion y descripcion de imagenes en pipelines documentales: al incluir codificador visual, puede procesar capturas, diagramas o paginas escaneadas junto con texto en una sola llamada image-text-to-text.
- Resumen de historiales largos de conversacion: la cache KV de 4 bits permite mantener sesiones de cientos de miles de tokens en memoria sin reventar la VRAM, util para atencion al cliente con historial persistente.
- Evaluacion de recuperacion en contexto largo: sirve como banco de pruebas para experimentos de Needle-in-a-Haystack y RAG de ventana amplia en hardware de consumo, con metricas de prefill y decode documentadas por el autor.
- Despliegue en GPUs antiguas o de gama baja: la coleccion del autor incluye variantes que, segun su model card, ejecutan el modelo en P100 o T4 con `--atlas-6g` en 5,90 GB de VRAM, lo que abre escenarios de prototipado en hardware de 2016-2018.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos numericos son mediciones de rendimiento del autor con el motor atlas-ingine:

| Medicion | Hardware | Configuracion | Resultado |
|---|---|---|---|
| Ventana 262K, VRAM | RTX 3090 (24 GB) | `--kv-q4 --dense-fp8`, sin drafting | 11,64 GiB; 112 tok/s codigo, 113-115 tok/s chat |
| Ventana 262K, VRAM | RTX 3090 | con `--spec` | 160 tok/s codigo; 13,3-14,5 GB |
| Ventana 262K, throughput | RTX PRO 6000 Blackwell | con `--spec` | 394,7 tok/s codigo, 368,5 tok/s chat; 100 tok/s sin spec |
| Contexto 1M, prefill/decode | RTX 3090 | `--max-ctx 1048576 --kv-q4 --dense-fp8 --prefill-chunk 2048` | 17,70 GiB runtime (18,62 GiB con prefiller); 4,67 GiB libres |
| 262K tokens | RTX 3090 | contexto 1M | 1.168,4 tok/s prefill; 64,41 tok/s decode; NIAH 3/3 |
| 512K tokens | RTX 3090 | contexto 1M | 925,5 tok/s prefill; 45,15 tok/s decode; NIAH 3/3 |
| 1M tokens | RTX 3090 | contexto 1M | 673,2 tok/s prefill (1.485 s); 29,23 tok/s decode; NIAH 3/3 |

## Requisitos de hardware

- VRAM para 262K de contexto: 11,64 GiB en RTX 3090 con `--kv-q4 --dense-fp8` y drafting desactivado; 13,3-14,5 GB con decodificacion especulativa.
- VRAM para 1M de contexto: 17,70 GiB en runtime y 18,62 GiB incluyendo el prefiller en una RTX 3090 de 24 GB, con 9,00 GiB de cache KV Q4 y 160 MiB de ventana deslizante.
- GPU recomendadas: RTX 3090 (24 GB) validada por el autor; RTX PRO 6000 Blackwell medida a 394,7 tok/s en codigo con `--spec`. No hay datos publicados para A100 o H100 con este checkpoint concreto.
- Cabe en GPU de consumo: si, en RTX 3090 y en tarjetas de 12-24 GB para contextos de hasta 262K; el autor indica que la variante `atlas-10g` de la misma coleccion corre en P100 y T4.
- Opciones de despliegue: exclusivamente el motor atlas-ingine, rama `feat/kvq4-elastic-9g` (commit `61bfecd` o posterior), compilado con CMake y CUDA (`ingine-serve`, `ingine-bench`). No es compatible con llama.cpp, vLLM, TGI ni Ollama; para esos motores el autor publica la coleccion Atlas-Elastic-GGUF.
- Latencia y throughput: prefill de 1.168,4 tok/s a 262K y 673,2 tok/s a 1M; decode de 64,41 tok/s a 262K y 29,23 tok/s a 1M en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Motor |
|---|---|---|---|---|---|
| Inkling-2-Mini-atlas-exl3-9g-ingine | ~16,96B (26,07B base) | 262K medido; 1M soportado | EXL3 sub-3-bit + Q4_0 + KV Q4 | Apache 2.0 | atlas-ingine |
| Inkling-2-Mini-atlas-12g-ingine (misma coleccion) | ~26,07B base | 64K medido; 128K en 17,78 GB | Mayor precision MoE | Apache 2.0 | atlas-ingine |
| Inkling-2-Mini-Atlas-Elastic-GGUF (misma coleccion) | ~26,07B base | 64K | GGUF 8G-12G | Apache 2.0 | llama.cpp |
| thinkingmachines/Inkling-2-Mini (base) | 26,07B | no disponible | pesos originales | Apache 2.0 | no disponible |

La comparativa con modelos de otros desarrolladores (por ejemplo, alternativas MoE de tamano similar) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del motor: requiere atlas-ingine en la rama `feat/kvq4-elastic-9g` (commit `61bfecd` o posterior); no funciona en llama.cpp, vLLM, TGI ni Ollama.
- Los datos de VRAM, throughput y Needle-in-a-Haystack proceden exclusivamente de mediciones del autor con su propio motor y no se han verificado de forma independiente.
- La cuantizacion sub-3-bit de los pesos MoE puede degradar la calidad frente al modelo base; no se han publicado evaluaciones de calidad (MMLU, HumanEval, GSM8K) que lo cuantifiquen.
- Discrepancia en el recuento de parametros: los safetensors suman ~16,96B mientras la model card cita 26,07B para el modelo base; conviene verificar el efecto de la conversion sobre el conteo.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible; el rendimiento en recuperacion (9/9 NIAH) no implica exactitud factual en generacion abierta.
- Idiomas soportados no declarados; no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles.
- El repositorio tiene 16 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del checkpoint cuantizado en produccion.
- El checkpoint incluye vision y MTP como ficheros opcionales; omitirlos reduce el tamano pero elimina esas capacidades.

## Enlaces

- Hugging Face: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-exl3-9g-ingine
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Coleccion Atlas 3D Inkling-2-Mini (6 GB a 96 GB): https://huggingface.co/collections/Atlas3D/inkling-2-mini-atlas-3d-6-gb-to-96-gb-6b054702b9c8001bb2b06675
- Motor atlas-ingine: https://github.com/Atlas3DSS/atlas-ingine
- Variante GGUF: https://huggingface.co/Atlas3D/Inkling-2-Mini-Atlas-Elastic-GGUF
- Variante 10G: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-10g-ingine
- Variante 12G: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-12g-ingine
