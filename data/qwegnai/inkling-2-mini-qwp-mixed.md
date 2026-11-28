# qwegnai/Inkling-2-Mini-QWP-Mixed

## Resumen

Inkling-2-Mini-QWP-Mixed es un paquete de pesos cuantizados de alta fidelidad para el motor de inferencia Qwegn, un runtime escrito en Swift 6.2 y Metal 4 orientado a Apple Silicon. Lo publica el usuario qwegnai y deriva del modelo base thinkingmachines/Inkling-2-Mini, un modelo multimodal de tipo image-text-to-text con arquitectura de transformer con bucles (looped transformer) y mezcla de expertos (MoE). El paquete no es un archivo safetensors, GGUF ni MLX: usa el contenedor propietario QWP1 y solo carga en Qwegn v0.33.0 o superior.

El modelo combina dos estrategias de compresion: cuantizacion SHVQ4_G32 en el tronco denso, la coda, las proyecciones de atencion y la cabeza de lenguaje, y pesos MoE enrutados en NVFP4 sin perdida adicional respecto al checkpoint original. El resultado son 15,15 GiB en disco y una fidelidad de 0,013170 de KL medio con un 97,92 % de acuerdo Top-1 frente al modelo sin cuantizar.

Su relevancia actual radica en que permite ejecutar un modelo multimodal con contexto nativo de 1.048.576 tokens en hardware Apple Silicon de gama alta (M5 Max con 128 GB de memoria unificada), con decodificacion especulativa DSpark y un rendimiento medido de hasta 3.503,6 tok/s en prefill y 80,07 tok/s en decodificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer MoE multimodal (`inkling2_loop`): 24 capas fisicas con bucle `[6..<18]` 3 veces (48 visitas efectivas), 2304 de hidden, atencion 24Q/8KV con head_dim 128, Sink+RelBias (4 full + 20 SWA-1024), AttnRes-6, SConv-4, 128 expertos enrutados (8 por token, intermediate_size 1152), torre de vision de 23 capas y 1024 dimensiones, vocabulario de 201.024 tokens (200.058 sin padding) |
| Parametros totales | no disponible (no se indica el recuento en la informacion proporcionada) |
| Parametros activos | no disponible (128 expertos enrutados, 8 activos por token; no se indica el total de parametros activos) |
| Longitud de contexto | 1.048.576 tokens (1M) nativos, con LSA multi-cabeza Q4 full-slice y k adaptativo de 2K a 16K; DSpark limitado a 16K de KV |
| Tipos de cuantizacion | SHVQ4_G32 (tronco, coda, atencion, cabeza), NVFP4 verbatim (expertos MoE enrutados, E2M1 con escala de bloque E4M3), BF16/F32 (embeddings, torre de vision, normas y controladores), KV en f16/q8/q4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QWP1 (`model.qwp`, `dspark.qwp`, `model.qlsa`); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

La arquitectura `inkling2_loop` es un transformer con bucles fisicos: 24 capas reales donde el bloque de capas 6 a 17 se recorre 3 veces, lo que da 48 visitas efectivas (4 de tronco, 12 por 3 de bucle y 4 de coda). Usa atencion con 24 cabezas de consulta y 8 de clave-valor con head_dim 128, mezcla atencion completa (4 capas) y atencion de ventana deslizante de 1024 tokens (20 capas), con mecanismos Sink, RelBias, AttnRes-6 y SConv-4. La capa MoE tiene 128 expertos enrutados con 8 activos por token e intermediate_size de 1152. Incorpora una torre de vision de 23 capas y 1024 dimensiones para el procesamiento de imagenes, y un cabezal de prediccion multi-token DSpark de 3 capas con Markov/Tree.

El paquete es una receta de cuantizacion, no un reentrenamiento: no se aportan datos sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO del modelo base. La innovacion tecnica del pack es el esquema hibrido `cand5_hybrid_lossless_moe`, que aplica SHVQ4_G32 a 329 planos del tronco denso y mantiene los 193 tensores F32 y 733 BF16 de los expertos MoE en NVFP4 verbatim, sin perdida adicional de cuantizacion. Ademas integra decodificacion especulativa DSpark (d=3), con un presupuesto opcional de Union MoE-Spec, y reduce el trafico activo a 2,790 GB/token frente a los 5,544 GB/token de los checkpoints mixtos NVFP4/MXFP8 sin tratar (1,99 veces menos).

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con soporte de modo de razonamiento implicito en el modelo base.
- Procesamiento multimodal image-text-to-text mediante la torre de vision de 23 capas y 1024 dimensiones.
- Generacion de codigo: obtiene 13/13 en HumanEval y 20/25 en Code-25 segun las pruebas del autor.
- Capacidades matematicas y de demostracion formal (el ejemplo de la model card pide demostrar que todo dominio de integridad finito es un cuerpo).
- Contexto largo nativo de hasta 1M tokens, verificado con la prueba needle a 16K.
- Decodificacion especulativa DSpark con hasta 3 borradores por paso para acelerar la generacion.
- Conformidad de API: 89/89 pruebas superadas, lo que sugiere compatibilidad con interfaces estilo OpenAI, Anthropic y Ollama a traves de `qwg serve`.
- Determinismo: SHA-256 identico entre decodificacion serial y especulativa en f16, q8 y q4.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling y function calling: no se documenta explicitamente en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos con imagenes: el contexto de 1M tokens permite procesar informes, contratos o expedientes completos junto con sus figuras y tablas en una sola pasada, sin fragmentar el contenido.
- Asistencia de codigo en local: con 13/13 en HumanEval y soporte de servidor compatible con OpenAI, se puede desplegar como backend de autocompletado o revision de codigo en un Mac Studio o MacBook Pro de gama alta, sin enviar codigo a la nube.
- Razonamiento matematico y demostraciones: el ejemplo de la model card (demostrar que todo dominio de integridad finito es un cuerpo) refleja su uso para asistencia en tareas formales y verificacion de pasos intermedios.
- Procesamiento de imagenes tecnicas: la torre de vision permite extraer informacion de diagramas, capturas de pantalla o documentacion escaneada y combinarla con el texto del contexto largo.
- Servidor de inferencia privado para equipos: `qwg serve` expone una API compatible con OpenAI, Anthropic y Ollama, lo que facilita sustituir endpoints en la nube por un despliegue local con 16,79 GiB de RSS a 8K de contexto.
- Evaluacion y prototipado de cuantizacion: investigadores que comparan recetas de cuantizacion pueden usar este pack como referencia de alta fidelidad (0,013170 de KL medio) frente a la variante Fast, que prioriza velocidad y tamano.
- Despliegue con contexto muy largo en investigacion: la ventana de 1M tokens con LSA y k adaptativo sirve para tareas de recuperacion y sintesis sobre corpus extensos en un solo paso.

## Benchmarks y rendimiento

Medidos por el autor en un Apple M5 Max (Mac17,6, CPU de 18 nucleos, GPU Apple10 NAX de 40 nucleos, 128 GB de memoria unificada, 585 GB/s de DRAM, 950 GB/s de SLC, macOS 26.2+) con `--kv-mode q4 --temperature 0 --no-profile`:

| Metrica | Resultado |
|---|---|
| Prefill NAX (512 / 2K / 4K / 8K / 16K / 32K) | 2.451,7 / 3.365,3 / 3.299,4 / 3.503,6 / 3.156,0 / 2.837,7 tok/s |
| Decodificacion serial (d=0) | 60,38-66,37 tok/s |
| Decodificacion especulativa DSpark d=3 (8K) | 80,07 tok/s (3,94 tok/paso) |
| Decodificacion especulativa var5 (2K) | 79,90 tok/s (3,63 tok/paso) |
| Union MoE-Spec opt-in (2K, presupuesto 12) | 55,62 a 59,37 tok/s (+7,04 %, 0 asignaciones estables) |
| Fidelidad vs upstream | 0,013170 KL medio, 0,039308 KL p95, 97,92 % Top-1 |
| Trafico activo | 2,790 GB/token (frente a 5,544 GB/token del checkpoint mixto sin tratar) |
| Conformidad API | 89/89 (100 %) |
| Code-25 | 20/25 (HumanEval 13/13, MBPP 7/12) |
| Determinismo KV (f16/q8/q4) | 3/3 SHA-256 identicos d0==d3 |
| Needle a 16K | 3/3 |
| QA en vivo QWServer (S1..S9) | 9/9 PASS |
| RSS en runtime (8K, KV q4) | 16,79 GiB |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada estimada: 16,79 GiB de RSS en runtime a 8K de contexto con KV q4; el pack ocupa 15,15 GiB en disco (14,89 GiB de `model.qwp` + 247,4 MiB de `dspark.qwp` + 6,0 MiB de `model.qlsa`).
- Hardware de referencia: Apple M5 Max con 128 GB de memoria unificada; el modelo esta disenado exclusivamente para Apple Silicon con Metal 4.
- No es compatible con GPU NVIDIA o AMD: el runtime Qwegn es Swift 6.2 + Metal 4.
- Encaje en hardware de consumo: no disponible con precision; con 16,79 GiB de RSS, un equipo Apple Silicon con al menos 24-32 GB de memoria unificada podria alojarlo, pero el autor solo documenta pruebas en M5 Max de 128 GB.
- Despliegue: solo mediante Qwegn v0.33.0 o superior (recomendado v0.35.0), con comandos `qwg pull`, `qwg run` y `qwg serve`; no carga en vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: 3.503,6 tok/s de prefill a 8K y 80,07 tok/s de decodificacion especulativa d=3 a 8K en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-QWP-Mixed | no disponible | 1M tokens | 3.503,6 tok/s prefill, 80,07 tok/s decode (M5 Max) | Apache 2.0 | Solo Qwegn, Apple Silicon |
| Inkling-2-Mini-QWP-Mixed-Fast | no disponible | no disponible | hasta 99,89 tok/s decode, 3.637,9 tok/s prefill | Apache 2.0 | Solo Qwegn, Apple Silicon |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | referencia sin cuantizar | no disponible | Hugging Face, safetensors presumiblemente |

La variante Fast del mismo autor ocupa 10,20 GiB y prioriza velocidad (hasta 99,89 tok/s de decodificacion) a costa de menor fidelidad. El modelo base sin cuantizar sirve como referencia de calidad, pero no se detallan sus requisitos de hardware ni su formato. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime Qwegn: el formato QWP1 no es portable a otras herramientas; no es safetensors, GGUF ni MLX, lo que impide usarlo con el ecosistema habitual de inferencia.
- Exclusivo de Apple Silicon con Metal 4: no se puede desplegar en GPU NVIDIA, AMD ni en servidores x86 convencionales.
- Fidelidad no perfecta: 0,013170 de KL medio y 97,92 % de acuerdo Top-1 implican que aproximadamente el 2 % de las predicciones difieren del modelo sin cuantizar.
- Rendimiento de codigo limitado en MBPP: 7/12 en MBPP frente a 13/13 en HumanEval, lo que sugiere menor robustez en tareas de programacion menos estructuradas.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue ni sobre calidad en castellano.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de veracidad o sesgo.
- Contexto DSpark limitado a 16K de KV, aunque el modelo base soporte 1M; la decodificacion especulativa no cubre toda la ventana.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el runtime Qwegn pueden tener condiciones propias que no se detallan.
- Sin descargas ni interacciones en Hugging Face en el momento de la consulta, y con solo unas pocas pruebas del autor como evidencia de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qwegnai/Inkling-2-Mini-QWP-Mixed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante Fast: https://huggingface.co/qwegnai/Inkling-2-Mini-QWP-Mixed-Fast
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
