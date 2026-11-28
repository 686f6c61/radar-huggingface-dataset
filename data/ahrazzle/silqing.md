# ahrazzle/Silqing

## Resumen

Silqing V1 es un archivo de inferencia bare-metal (formato propietario `.slqi`) del modelo `thinkingmachines/Inkling-2-Mini`, un transformer MoE de 26,39B parámetros totales (5,35B activos con K=3) desarrollado por Moissanite Labs / Foundation-0. No se trata de un modelo nuevo entrenado desde cero, sino de un empaquetado cuantizado y optimizado para ejecución en hardware concreto: CUDA `sm_86` (Ampere) e Intel `AVX-512`, con kernels escritos a medida y cero dependencias de frameworks de inferencia convencionales.

El problema que aborda es el de la eficiencia en la inferencia de modelos MoE grandes en hardware de consumo: consigue ejecutar un modelo de 26,39B parámetros en 6,181 GiB de VRAM estática (sin asignación dinámica) sobre una RTX 3080 Laptop, con paridad FP32 de 8,58e-6 (B=1) y 5,74e-4 (B=16, 16/16 top-1). Emplea cuantización en retícula `A16` con transformada de Walsh-Hadamard de orden 4 sobre bloques de 16 pesos, a 3,125 bpw y 4,5 bpw según la capa.

Es relevante ahora porque demuestra que es posible llevar un MoE de decenas de miles de millones de parámetros a GPUs consumer con latencias utilizables (45,66 tok/s a B=1 K=3 y 151,45 tok/s a B=16 K=3), aunque se publica como una versión pre-auditoría (V1) con umbrales de rendimiento estrictos que no se alcanzaron en su totalidad, según declara el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo recurrente de 12 capas (L6..17), 24 capas físicas, 128 expertos enrutados por capa con top-8 |
| Parametros totales | 26,39B (26,07B texto) |
| Parametros activos | 5,35B (K=3) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3,125 bpw SoA g=128 (expertos L0..19) y 4,5 bpw g=32 (expertos de salida L20..23, 132 lineales de atención, lm_head); 168 tensores del núcleo del bucle en BF16 sin cuantizar |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | `.slqi` (archivo binario propietario bare-metal, 11,239 GiB / 12.067.738.528 B) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a `thinkingmachines/Inkling-2-Mini`: un transformer MoE con 24 capas físicas, de las cuales las capas L6..17 forman un núcleo recurrente de 12 capas, y 128 expertos enrutados por capa con activación top-8. Silqing no reentrena el modelo; lo empaqueta aplicando una cuantización en retícula sobre la retícula `A16 = 2Z^16 + C_[16,11,4]`, precedida de una rotación Walsh-Hadamard de orden 4 (Block-H4) sobre cada bloque de 16 pesos. Los expertos de L0..19 se almacenan en bitplanes SoA de 3 planos con grupo g=128 (3,125 bpw), mientras que los expertos de salida L20..23, las 132 lineales de atención y el lm_head usan 4,5 bpw con g=32. Los 168 tensores del núcleo del bucle recurrente se mantienen en BF16 sin cuantizar.

El paquete incluye innovaciones de sistema destacables: decodificación entera exacta post-MMA con escalado FP32, MMA dual-split BF16 (`mma.sync.aligned.m16n8k16`) para `wo_ud`, caché KV en FP32 y un anillo DMA fijado de 64 ranuras para sincronización. Los 37 kernels principales y 129 de benchmark se compilan con `nvcc -arch=sm_86 -O3 --Werror all-warnings` con un límite de 48 registros, 0 B de spill y 0 instrucciones SASS `LDL`/`STL`. Incluye además un mapeo Monna 2^7=128 (dyádico `HYST_2`) que agrupa los 128 expertos por capa en 16 bolas ultramétricas con ponderación 3x del núcleo del bucle, y una extrapolación Riccati-Cayley post-K=3 con proyección de rango 64 que no modifica los expertos enrutados (0 de 24,46B). No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre si hubo RLHF/DPO.

## Capacidades

- Generación de texto en inglés (único idioma declarado).
- Razonamiento multi-paso mediante bucle recurrente de 12 capas y modo de cómputo adaptativo (K variable, con K=1, K=3 y adaptativo documentados).
- Ejecución MoE con enrutamiento top-8 sobre 128 expertos por capa.
- Inferencia batched (B=1 y B=16 validadas) con dispatch vectorizado `uint4` y GEMV de 2 filas.
- Ejecución híbrida GPU + CPU: kernels CUDA `sm_86` y kernels `AVX-512` con `tree_reduce_128` canónico de 0 ULP.
- Corrección y detección de errores SECDED `[16, 11, 4]` con reparación SEC (3/3) y parada segura DED (3/3).
- Trampa IRIS para detección de troyanos en hardware (1/1 cobertura en pruebas).
- Prefetch de enrutador exacto con recall del 90,03%-90,30%.
- No se documenta soporte de tool calling, function calling, visión, audio ni agentes en la información disponible.

## Casos de uso

- Inferencia de un MoE de 26,39B en GPU consumer: el paquete cabe en 6,181 GiB de VRAM estática, por lo que puede desplegarse en una RTX 3080 Laptop o equivalente sin offloading dinámico, manteniendo 45,66 tok/s (B=1 K=3) y 1,675 J/tok.
- Servicio de generación de texto batched en un único nodo: con B=16 K=3 alcanza 151,45 tok/s y 0,512 J/tok, adecuado para endpoints de baja concurrencia con requisitos de eficiencia energética.
- Despliegue en entornos con restricciones de memoria estricta: la asignación dinámica de 0 B durante 1.000 pasos y el compilador zero-spill (0 B de pila) permiten ejecución determinista y auditable en sistemas embebidos o edge con GPU Ampere.
- Ejecución mixta CPU+GPU: el motor `AVX-512` de 8 núcleos permite arranque en frío y ejecución parcial en CPU, útil en estaciones de trabajo sin GPU dedicada o con GPU de gama baja.
- Investigación en cuantización en retícula: el paquete sirve como referencia reproducible para estudiar paridad FP32 con cuantización A16, transformadas Block-H4 y decodificación entera exacta post-MMA.
- Validación de mecanismos de tolerancia a fallos: los chequeos SECDED, la parada segura DED y la trampa IRIS permiten probar pipelines de integridad de memoria en aceleradores.
- Evaluación de extrapolación post-K=3: la técnica Riccati-Cayley con `max_rho_hat = 0,3485` y la mejora de NLL en WikiText-2 (2,6438 vs. 2,8860) y Countdown (0,9671 vs. 1,4903) a K=4 son reproducibles para estudiar adaptación en inferencia sin backprop.

## Benchmarks y rendimiento

| Metrica | Resultado | Objetivo / referencia |
|---|---|---|
| Paridad FP32 B=1 | 8,58e-6 | superado |
| Paridad FP32 B=16 (top-1) | 5,74e-4 (16/16) | superado |
| Throughput B=1 K=3 | 45,66 tok/s (1,675 J/tok) | — |
| Throughput B=1 K=1 | 95,97 tok/s | objetivo 100 tok/s (no alcanzado) |
| Throughput B=16 K=3 | 151,45 tok/s (0,512 J/tok) | objetivo 220 tok/s (no alcanzado) |
| Throughput B=1 adaptativo (mean_k=5,0) | 30,11 tok/s | objetivo 65 tok/s (no alcanzado) |
| Stall en frío | 0,4463 | objetivo 0,35 (no alcanzado) |
| NLL GSM8K K=4 | 1,3903 | baseline 1,2832 (no alcanzado) |
| max_rho_hat K=5 | 0,7467 | objetivo < 0,618034 (no alcanzado) |
| Fuga en subespacio keep | 0,4707 | — |
| Tasa de acierto de caché Monna (B=1 K=3) | 94,79% | — |
| Reducción de chatter de swap (B=1 K=3) | 95,20% vs. LRU | — |
| Reducción de chatter de swap (B=16 K=3) | 99,76% (95 vs. 38.983 swaps LRU) | — |
| Recall de prefetch del enrutador | 90,03%-90,30% | — |
| NLL WikiText-2 K=4 | 2,6438 | 2,8860 (mejorado) |
| NLL Countdown K=4 | 0,9671 | 1,4903 (mejorado) |
| Deriva K=3 | +0,0000 | sin cambios |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K accuracy) en la información disponible; los datos anteriores son métricas de sistema y de pérdida, no de calidad de tarea.

## Requisitos de hardware

- VRAM estática: 6,181 GiB con 0 B de asignación dinámica durante 1.000 pasos.
- GPU validadas: RTX 3080 Laptop GPU (sm_86, GDDR6 a 340,45 GB/s). Compatible con arquitecturas `sm_86` (Ampere consumer y profesional: RTX 30xx, A10, A40, etc.).
- CPU: Intel Core i9-11900H con AVX-512, 8 núcleos usados para ejecución en frío.
- No se documenta compatibilidad con A100, H100 ni GPUs de arquitecturas distintas a `sm_86`.
- Cabe en GPU consumer de 8 GB o más (RTX 3060 Ti, 3070, 3080, 4060 Ti 16 GB, etc.) siempre que soporten `sm_86` y dispongan de al menos 6,181 GiB libres.
- Despliegue: exclusivamente mediante el runtime propio `custom-cuda` del paquete `.slqi`; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 45,66 tok/s (B=1 K=3), 95,97 tok/s (B=1 K=1), 151,45 tok/s (B=16 K=3) en RTX 3080 Laptop + i9-11900H.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Silqing V1 (Inkling-2-Mini empaquetado) | 26,39B / 5,35B (K=3) | no disponible | Apache 2.0 | `.slqi` + runtime custom-cuda |
| thinkingmachines/Inkling-2-Mini (base) | 26,39B / 5,35B (K=3) | no disponible | Apache 2.0 | pesos originales (formato no especificado) |
| Modelos MoE de tamano similar (p. ej. Mixtral 8x7B) | no disponible en la informacion | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de terceros en la información proporcionada; la comparativa con alternativas de la misma categoría queda limitada al modelo base del que deriva.

## Limitaciones y advertencias

- Versión pre-auditoría (V1): el propio autor declara que se publica como baseline temprano antes de una auditoría independiente multi-arquitectura (V2 en cola); no debe considerarse un artefacto auditado.
- Umbrales incumplidos declarados: throughput B=1 K=1 (95,97 vs. 100 tok/s), B=16 K=3 (151,45 vs. 220 tok/s), adaptativo (30,11 vs. 65 tok/s), stall en frío (0,4463 vs. 0,35), NLL GSM8K K=4 (1,3903 vs. 1,2832) y `max_rho_hat` K=5 (0,7467 vs. < 0,618034).
- Fuga en subespacio keep de 0,4707, que puede afectar a la fidelidad de la extrapolación post-K=3.
- Idioma: solo inglés declarado; no hay soporte multilingüe documentado.
- Longitud de contexto no documentada; no se puede garantizar comportamiento en ventanas largas.
- Dependencia de hardware específico: requiere CUDA `sm_86` y, para ejecución en CPU, AVX-512; no es portable a otras arquitecturas sin recompilación.
- Formato propietario `.slqi` y runtime `custom-cuda`: no hay integración con ecosistemas estándar (Hugging Face Transformers, vLLM, llama.cpp), lo que limita su adopción en producción.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 26B con cuantización agresiva (3,125 bpw), la degradación en tareas de razonamiento puede ser mayor que la medida en NLL.
- Licencia Apache 2.0 heredada: permite uso comercial, pero la licencia del modelo base debe verificarse en el enlace correspondiente antes de desplegar.
- Sin datos de sesgos, toxicidad ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/ahrazzle/Silqing
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/blob/main/LICENSE
- Colección SiliQuant Flagships: https://huggingface.co/collections/ahrazzle/siliquant-flagships-6b09fd348ec8b911eb469008
- Repositorio GitHub: https://github.com/Moissanite-Labs/silqing
