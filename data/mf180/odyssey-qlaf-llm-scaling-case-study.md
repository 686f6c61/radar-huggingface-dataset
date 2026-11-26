# MF180/odyssey-qlaf-llm-scaling-case-study

## Resumen

Odyssey Route-B / QLAF es un caso de estudio tecnico publicado en Hugging Face por el autor MF180, resultado de un proyecto de consultoria de seis meses (mayo-octubre de 2026) centrado en el diseno, optimizacion y validacion de una arquitectura de lenguaje hibrida recurrente. El repositorio no contiene pesos del modelo, sino especificaciones de arquitectura, auditorias de kernels Triton (PTX/SASS), registros de convergencia de preentrenamiento multi-semilla y telemetria de benchmarks de contexto largo. La arquitectura combina un 75% de celdas recurrentes QLAF (Quantum-Like Attention Framework) con un 25% de capas FlashAttention causal exacta intercaladas.

El modelo se presenta en tres escalas: 1.3B (preentrenada de forma autonoma durante 225.000 pasos con tres semillas y contexto progresivo hasta 65.536 tokens), 7B y 70B (escalado arquitectonico con checkpointing de gradientes y cache de estado recurrente de memoria constante). La propuesta tecnica se apoya en kernels Triton personalizados con MMA sobre Tensor Cores, gestion de decodificacion mediante CUDA Graphs estaticos y cuantizacion dinamica INT8 del estado recurrente.

Su relevancia radica en los datos de eficiencia publicados: en la configuracion de 7B con contexto de 128k alcanza 464,82 tok/s de decodificacion frente a 97,98 tok/s de un Transformer baseline y 142,49 tok/s de Mamba, con un 45% menos de VRAM pico. En la configuracion de 70B mantiene 262,15 tok/s dentro de un envelope constante de 7,22 GB de VRAM pico en barridos de contexto de 32k, 128k y 1M tokens. Al tratarse de un case study sin pesos publicados, su utilidad es principalmente como referencia de ingenieria y de metodologia de optimizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida recurrente: 75% celdas QLAF (Quantum-Like Attention Framework) + 25% FlashAttention causal exacta, intercaladas cada 4 capas (capas 3, 7, 11 en el modelo 1.3B) |
| Parametros totales | Tres escalas: 1.3B, 7B y 70B |
| Parametros activos | No disponible (no se describe una arquitectura MoE; se menciona un "Top-1 Aion Router" en las capas QLAF sin detallar su impacto en parametros activos) |
| Longitud de contexto | 65.536 tokens en preentrenamiento 1.3B; 128k+ en benchmarks 7B; barridos hasta 1M tokens en la configuracion 70B |
| Tipos de cuantizacion | Cuantizacion dinamica INT8 del estado recurrente (state quantization); no se detallan otros formatos de pesos |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (los pesos propietarios se omiten del repositorio por IP del cliente) |

## Arquitectura y entrenamiento

La arquitectura Odyssey Route-B / QLAF es un stack hibrido en el que tres de cada cuatro capas son celdas recurrentes QLAF con un router Top-1 Aion, y la cuarta capa es un ancla de FlashAttention causal exacta. El prefill utiliza un scan asociativo de prefijos en paralelo (parallel associative prefix-sum scan) que sustituye los bucles recurrentes secuenciales token a token, mientras que la decodificacion emplea una actualizacion de estado constante. Se integra una RMSNorm recurrente sin parametros dentro de la recurrencia causal para evitar la explosion de magnitud del estado y eliminar los picos de perdida en secuencias ultralargas.

El entrenamiento del modelo de 1.3B se realizo de forma autonoma durante 225.000 pasos totales con tres semillas (42, 100 y 2026), aplicando un curriculum progresivo de contexto en 11 etapas que escala la longitud de secuencia desde 4.096 hasta 65.536 tokens. No se detalla en la informacion disponible el volumen total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica principal reside en los kernels: tres etapas de kernels Triton MMA tileados (`_decode_project_kernel`, `_decode_strict_fused_kernel` / `_factorized_mid_kernel` / `_factorized_out_kernel` y `_decode_readout_tsc_kernel`) con tiling de la dimension H en bloques estaticos de `BLOCK_H = 128`, lo que reduce el uso de memoria compartida de 270 KB (por encima del limite fisico de 163 KB de la A100) a menos de 32 KB con cero spills de registros, verificado mediante auditorias PTX/SASS con `nvdisasm`. La captura estatica con CUDA Graphs elimina los cuellos de botella de lanzamiento de kernels desde CPU.

## Capacidades

- Generacion de texto autoregresiva con decodificacion de alto rendimiento (hasta 513,26 tok/s pico en A100 en la configuracion optimizada).
- Procesamiento de contexto largo con ventana efectiva de 65.536 tokens en preentrenamiento y validacion de 100% de recuperacion en pruebas NIAH (Needle In A Haystack) hasta 128k+ tokens.
- Razonamiento sobre secuencias ultralargas gracias al estado recurrente de memoria constante, que evita el crecimiento cuadratico de la atencion densa.
- Prefill paralelo mediante scan asociativo de prefijos, con velocidad de prefill 5,09x superior al baseline Transformer en la configuracion 7B a 128k.
- Decodificacion con estado constante: el coste de memoria no crece con la longitud de contexto (7,22 GB de VRAM pico constante hasta 1M tokens en la configuracion 70B).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Procesamiento de documentos legales o contractuales de gran extension: la ventana de 65k-128k tokens y el 100% de recuperacion en NIAH permiten analizar expedientes completos sin chunking, manteniendo coherencia entre secciones distantes del documento.
- Analisis de repositorios de codigo completos: con contexto de 128k+ tokens se puede ingerir un arbol de codigo extenso y responder preguntas sobre dependencias entre modulos, aunque no se documenta entrenamiento especifico en codigo.
- Inferencia de contexto largo en produccion con VRAM limitada: el envelope constante de 7,22 GB en la configuracion 70B hasta 1M tokens hace viable desplegar modelos de gran escala en GPUs que no soportarian un Transformer denso equivalente (que sufre OOM a partir de 8k tokens segun los datos publicados).
- Servidores de decodificacion de alta concurrencia: los 513,26 tok/s pico con CUDA Graphs y cuantizacion INT8 del estado reducen el coste por token en cargas de generacion sostenida.
- Referencia de ingenieria para equipos que optimizan kernels: las auditorias PTX/SASS y el codigo de inspeccion de compilador publicados sirven como guia reproducible para reducir memoria compartida y eliminar spills en kernels Triton MMA.
- Investigacion en arquitecturas hibridas recurrentes: los logs de convergencia multi-semilla a 65k tokens y el curriculum progresivo de 11 etapas aportan datos de referencia para quienes entrenan modelos recurrentes de contexto largo.
- Prototipado de asistentes de lectura de corpus cientificos: la ventana de 128k permite cargar varios papers completos y sintetizar comparativas entre ellos en una sola pasada.

## Benchmarks y rendimiento

Datos publicados en la model card (A100 80GB). No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | QLAF (7B, 128k) | Transformer baseline | Mamba SSM |
|---|---|---|---|
| Throughput de decodificacion | 464,82 tok/s | 97,98 tok/s | 142,49 tok/s |
| Tiempo de prefill | 10,10 s | 51,45 s | No disponible |
| VRAM pico | 12,52 GB | 22,89 GB | No disponible |

| Metrica | QLAF | Referencia |
|---|---|---|
| Throughput pico de decodificacion (A100) | 513,26 tok/s | 2,50x sobre strict decode base; Mamba 467,19 tok/s; Transformer 419,15 tok/s |
| Decodificacion a escala 70B | 262,15 tok/s (4,22x) | VRAM pico constante de 7,22 GB en contextos de 32k, 128k y 1M |
| Recuperacion NIAH | 100% hasta 128k+ | No disponible para los baselines |

## Requisitos de hardware

- VRAM estimada: 12,52 GB pico en la configuracion 7B con contexto de 128k; 7,22 GB pico constante en la configuracion 70B (gracias al estado recurrente de memoria constante y al checkpointing de gradientes). Para el modelo 1.3B no se detalla la VRAM de inferencia.
- GPU recomendadas: NVIDIA A100 80GB es el hardware de referencia de todos los benchmarks. No se han validado otras GPU en la informacion disponible.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU consumer; los kernels Triton MMA y CUDA Graphs estan orientados a Tensor Cores de clase数据中心.
- Opciones de despliegue: los pesos no estan publicados, por lo que no hay integracion con vLLM, llama.cpp, Ollama o TGI. El repositorio incluye utilidades de auditoria de compilador (PTX/SASS via `nvdisasm`) y los kernels Triton como referencia.
- Latencia y throughput: 513,26 tok/s pico de decodificacion en A100; 464,82 tok/s en 7B a 128k; 262,15 tok/s en la configuracion 70B. Prefill de 10,10 s en 7B a 128k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Throughput decodificacion (A100) | VRAM pico (128k, 7B) | Licencia | Pesos disponibles |
|---|---|---|---|---|---|---|
| Odyssey QLAF (7B) | 7B | 128k+ | 464,82 tok/s | 12,52 GB | Apache 2.0 | No |
| Transformer baseline | 7B (equivalente) | 128k | 97,98 tok/s | 22,89 GB | No aplica | No aplica |
| Mamba SSM | 7B (equivalente) | 128k | 142,49 tok/s | No disponible | Apache 2.0 (referencia) | Si (variantes publicas) |

La comparativa se limita a los baselines medidos en el propio case study. No se dispone de datos que permitan comparar con otros modelos hibridos recurrentes publicos (por ejemplo, variantes Jamba o Griffin) en terminos de throughput o calidad.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo: es un case study con especificaciones y telemetria, no un modelo desplegable. No es posible ejecutar inferencia a partir de este repositorio.
- Los pesos y los modulos recurrentes internos se omiten por IP del cliente y patentes pendientes, lo que impide reproducir los resultados de forma independiente.
- No se han publicado resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K), por lo que la calidad del modelo en tareas de razonamiento, codigo o matematicas no esta verificada.
- El unico idioma declarado es el ingles; no hay evidencia de capacidades multilingues.
- Los benchmarks se han ejecutado exclusivamente en NVIDIA A100 80GB; el rendimiento en otras GPU (incluidas consumer) es desconocido.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.
- La licencia Apache 2.0 se aplica al contenido del repositorio, pero no cubre los pesos ni los modulos patentados, que no se distribuyen.
- Las cifras de throughput y VRAM provienen de telemetria del autor y no han sido replicadas por terceros.
- El modelo se presenta con fecha de creacion en noviembre de 2026; la ventana temporal de los datos de entrenamiento no se detalla.

## Enlaces

- Hugging Face: https://huggingface.co/MF180/odyssey-qlaf-llm-scaling-case-study
- Informe de auditoria Triton Tensor Core SASS/PTX: reports/01_Triton_TensorCore_SASS_PTX_Audit.md
- Informe de preentrenamiento multi-semilla 1.3B a 65k: reports/02_1.3B_MultiSeed_65k_Pretraining.md
- Informe de escalado 7B con contexto largo: reports/03_7B_LongContext_Scaling_Report.md
- Informe de escalado arquitectonico 70B: reports/04_70B_Architecture_Scaling_Report.md
- Hardware de referencia NVIDIA A100 80GB: https://www.nvidia.com/en-us/data-center/a100/
