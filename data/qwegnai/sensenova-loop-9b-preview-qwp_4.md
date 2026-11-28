# qwegnai/SenseNova-Loop-9B-Preview-QWP_4

## Resumen

SenseNova-Loop-9B-Preview-QWP_4 es un pack de pesos cuantizados del modelo SenseNova-Loop-9B-Preview, publicado por el usuario qwegnai para su uso exclusivo con el motor de inferencia Qwegn, un runtime escrito en Swift y Metal 4 orientado a Apple Silicon. El modelo base, desarrollado por SenseNova, es un transformer con arquitectura de bucles (looped transformer) de 9.660 millones de parametros que combina capas Gated-DeltaNet con capas de atencion completa, un cabezal MTP (multi-token prediction) y una torre de vision.

La particularidad de este pack es su formato de cuantizacion propietario HQ4_G32, que combina rotacion ortogonal de Walsh-Hadamard por grupos de 32 pesos con codigos de 4 bits y escalas FP16, alcanzando 6,68 bits por parametro en un contenedor de 7,51 GiB. Ademas incluye un sidecar de Latent Sparse Attention (LSA) que reduce la carga de atencion en contextos largos y, segun el autor, mejora la recuperacion de agujas en ventanas de hasta 1 millon de tokens.

Es relevante porque ejemplifica una tendencia emergente: formatos de cuantizacion especificos por motor que no son compatibles con safetensors, GGUF ni MLX, y que buscan exprimir el hardware unificado de Apple Silicon con tecnicas de atencion dispersa y decodificacion especulativa. El contexto nativo del modelo base es de 262.144 tokens, extensible en inferencia hasta cerca de 1M mediante YaRN y LSA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles: 32 capas fisicas expandidas a 56 efectivas (capas 4-27 ejecutadas dos veces), 24 capas Gated-DeltaNet + 8 de atencion completa, 2-stream Sinkhorn mHC, cabezal MTP, torre de vision |
| Parametros totales | 9,66 B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; extension en inferencia probada cerca de 1M con YaRN + LSA |
| Tipos de cuantizacion | HQ4_G32 (4 bits con rotacion Walsh-Hadamard por grupos de 32, escala y sesgo FP16) + BF16 en embedding y torre de vision; 6,68 bits/parametro efectivos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario QWP1 (solo carga en Qwegn); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de transformer con bucles en la que 32 capas fisicas se ejecutan hasta 56 veces efectivas: las capas 4 a 27 se procesan dos veces. Combina 24 capas Gated-DeltaNet (un mecanismo de estado recurrente eficiente en contexto largo) con 8 capas de atencion completa, lo que da un total de 14 ocurrencias en tiempo de ejecucion de atencion densa. Incorpora un esquema de dos flujos Sinkhorn mHC, un cabezal de prediccion multi-token (MTP) que habilita decodificacion especulativa, y una torre de vision para entrada multimodal.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible: no se detallan el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable de este pack es la cuantizacion HQ4_G32, que aplica una transformacion rapida de Walsh-Hadamard a las activaciones dentro de los kernels GEMV/GEMM para dispersar valores atipicos sin necesidad de datos de calibracion. El sidecar LSA realiza una SVD offline de la porcion de cabeza sin RoPE (dimensiones 64-255) de las matrices wq/wk cuantizadas, agrupa superbloques de 512 tokens en 64 cubos de Ward y limita cada consulta a los tokens sumidero, los 2.048 tokens mas similares en bloques de 4 y una ventana local de 512 tokens.

## Capacidades

- Generacion de texto y razonamiento de proposito general con contexto nativo de 262.144 tokens.
- Procesamiento multimodal de imagenes mediante torre de vision integrada (mantenida en BF16).
- Decodificacion especulativa mediante cabezal MTP (Variational MTP-3 y DFlash 2 como drafter).
- Recuperacion de informacion en contextos muy largos mediante Latent Sparse Attention, con bypass denso bit-exacto para prompts inferiores a 2.564 tokens.
- Extension de contexto en inferencia hasta aproximadamente 1M de tokens mediante YaRN combinado con LSA.
- Evaluacion de codigo verificada por el autor en tareas HumanEval y MBPP (con razonamiento desactivado).
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios y documentacion extensa: con 262.144 tokens nativos y extension a 1M, el modelo puede ingerir codebases completos o manuales tecnicos en una sola pasada y responder preguntas sobre ellos, apoyandose en LSA para mantener la recuperacion en profundidades altas del contexto.
- Asistentes de desarrollo local en Mac: al ejecutarse en Qwegn sobre Apple Silicon con un pack de 7,51 GiB, permite desplegar generacion de codigo y explicaciones tecnicas en un portatil o estacion con memoria unificada, sin GPU dedicada.
- Procesamiento de imagenes con contexto textual largo: la torre de vision permite adjuntar capturas, diagramas o documentos escaneados junto a instrucciones extensas, util en tareas de documentacion tecnica o auditoria visual.
- Resumen y extraccion de informacion en corpus legales o academicos: la ventana de 262K tokens admite contratos o articulos completos; el modo denso para prompts cortos garantiza fidelidad en consultas puntuales.
- Evaluacion automatizada de codigo en pipelines: el modelo puede generar soluciones a problemas tipo HumanEval/MBPP y participar en bucles de verificacion, aunque el rendimiento medido (46/100) lo situa como herramienta auxiliar, no como generador principal.
- Prototipado de agentes con decodificacion rapida: la decodificacion especulativa Variational MTP-3 alcanza 93,9 tok/s en M5 Max, adecuada para interacciones conversacionales de baja latencia en local.
- Investigacion sobre atencion dispersa: el sidecar LSA y su configuracion (presupuesto de 2.048 tokens, ventana local de 512, cubos de Ward) sirven como banco de pruebas para estudiar el equilibrio entre coste de atencion y recall en contextos millonarios.

## Benchmarks y rendimiento

Resultados medidos por el autor en Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU de 40 nucleos, 585 GB/s), macOS 26, llmprobe v0.6.16, kv-mode q4, temperatura 0:

| Metrica | Resultado |
|---|---|
| Prefill (prompt de 64K) | 1.749 tok/s |
| TTFT en frio | 64 ms |
| TTFT con cache caliente | 7 ms |
| Decodificacion estandar (serial) | 48,9 tok/s |
| Decodificacion especulativa (Variational MTP-3) | 93,9 tok/s (102,4 en texto predecible) |
| Prefill / decodificacion a 1M con LSA | 1.476 / 46,5 tok/s |
| Recall de aguja 64K a 1M | 3/3 en todas las longitudes |
| Evaluacion de codigo (50 HumanEval + 50 MBPP) | 46/100 |

Comparativa LSA (auto) frente a denso (off) por tramo de contexto:

| Tramo | Prefill tok/s | TTFT | Decode tok/s | Recall | Aceleracion LSA |
|---|---|---|---|---|---|
| 64K | 1.749 / 1.207 | 36,6 s / 53,1 s | 75,2 / 65,0 | 3/3 vs 0/3 | 1,45x · 1,16x |
| 262K | 1.606 / 568 | 152,8 s / 432,5 s | 70,4 / 38,6 | 3/3 vs 1/3 | 2,83x · 1,82x |
| 1M | 1.476 / no ejecutado | 702,9 s | 46,5 | 3/3 | denso no ejecutado |

Advertencias del autor: las etiquetas de contexto son tramos nominales de benchmark (longitudes reales tokenizadas de 64.060, 120.673, 245.423, 544.656 y aproximadamente 1.037.119 tokens); no todos los modelos se midieron en todos los tramos; el resultado 3/3 corresponde a un unico ejercicio de recuperacion de tres agujas y no garantiza precision general; la extension mas alla de 262.144 tokens es de inferencia, no entrenamiento adicional. No se han publicado resultados de benchmarks frente a modelos de referencia externos en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el pack ocupa 7,51 GiB en disco; en ejecucion requiere ademas cache KV (modo q4 en las pruebas) y buffers de trabajo, por lo que se recomienda al menos 16 GB de memoria unificada y 32 GB para contextos largos.
- Hardware objetivo: exclusivamente Apple Silicon con Metal 4; las pruebas oficiales se realizaron en un M5 Max con 128 GB y GPU de 40 nucleos.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas, ya que el contenedor QWP1 solo carga en el motor Qwegn.
- Opciones de despliegue: unicamente Qwegn v0.20.5 o superior; no es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput medidos: TTFT en frio de 64 ms, TTFT con cache caliente de 7 ms, 48,9 tok/s en decodificacion serial y hasta 93,9 tok/s con decodificacion especulativa en M5 Max; en contextos de 1M el prefill cae a 1.476 tok/s y la decodificacion a 46,5 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Disponibilidad |
|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-QWP_4 | 9,66 B | 262K nativo, ~1M extendido | QWP1, Apache 2.0, solo Qwegn | Hugging Face (qwegnai) |
| SenseNova-Loop-9B-Preview (base) | 9,66 B | 262K nativo | Pesos originales, Apache 2.0 | Hugging Face (SenseNova) |
| Alternativas de ~9B en GGUF/MLX | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks cruzados con otros modelos de la misma categoria en la informacion proporcionada, por lo que la comparativa de rendimiento queda limitada a los resultados internos del autor frente a su propia variante densa.

## Limitaciones y advertencias

- El pack solo carga en el motor Qwegn v0.20.5 o superior; no es portable a safetensors, GGUF, MLX ni a otros runtimes, lo que limita su uso a Apple Silicon.
- La cuantizacion HQ4_G32 de 4 bits introduce perdida de calidad respecto al modelo base; el autor no publica una comparacion de perplexidad o benchmarks frente a los pesos originales.
- La decodificacion especulativa (Variational MTP-3) puede alterar la salida respecto a una decodificacion greedy exacta, segun advierte el propio autor.
- El resultado de recall 3/3 en contextos de hasta 1M proviene de un unico ejercicio de tres agujas; no constituye una garantia de fidelidad en tareas generales de contexto largo.
- La extension a 1M tokens es una tecnica de inferencia (YaRN + LSA), no entrenamiento adicional; el contexto nativo real es de 262.144 tokens.
- El rendimiento en codigo medido (46/100 en HumanEval + MBPP con razonamiento desactivado) es modesto y desaconseja su uso como generador principal en produccion.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del motor Qwegn y su estado de madurez deben evaluarse antes de desplegar en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria independiente.

## Enlaces

- Hugging Face del pack: https://huggingface.co/qwegnai/SenseNova-Loop-9B-Preview-QWP_4
- Modelo base en Hugging Face: https://huggingface.co/SenseNova/SenseNova-Loop-9B-Preview
- Repositorio del motor Qwegn: https://github.com/qwegnai/qwegn
