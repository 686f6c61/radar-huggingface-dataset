# ProCreations/Nanbeige4.3-33B-DFlash2

## Resumen

Nanbeige4.3-33B-DFlash2 es un modelo borrador (*draft model*) de decodificación especulativa publicado por ProCreations para acelerar la inferencia de Nanbeige4.3-33B. No es un modelo de lenguaje autónomo: su única función es proponer bloques de tokens que el modelo objetivo verifica en paralelo, de modo que la decodificación batch-1 sea entre 1,39× y 1,76× más rápida según la precisión del target. El checkpoint contiene 979.731.200 parámetros en tres capas de decoder y reutiliza el *embedding* congelado y la cabeza de salida del modelo objetivo, por lo que ninguna de esas dos matrices se duplica en el repositorio.

La arquitectura es un borrador de difusión por bloques (*block-diffusion*) que propone 8 tokens por paso, incluido un ancla ya verificada, con atención bidireccional completa dentro del bloque. Incorpora fusión de características de las capas 1, 25 y 49 del target, convolución dinámica de dos tomas y un selector de rank 128 con top-k 32. Está pensado para desplegarse sobre SGLang 0.5.21 con targets BF16, FP8 o NVFP4-A16, o de forma nativa sobre exllamav3 1.6.4 con los cuantizados EXL3 publicados.

Su relevancia actual es práctica: los modelos de 33B son caros de servir y las ganancias se concentran precisamente en cargas agénticas de código, donde el autor reporta aceleraciones de 2,3-2,6×. La receta de entrenamiento está documentada con detalle inusual (huellas SHA256, política de fuentes, recuentos por dominio), aunque el modelo se declara incompleto: se ejecutaron 14.484 de 14.533 actualizaciones previstas y hay una v2 con más datos en preparación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Borrador de decodificación especulativa DFlash2 (*block-diffusion*), 3 capas de decoder con atención bidireccional completa dentro del bloque de propuesta |
| Parámetros totales | 979.731.200 (3 capas); no incluye el *embedding* ni la cabeza de salida, que se heredan del target |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible. El borrador opera sobre bloques de 8 tokens; la ventana de contexto la fija Nanbeige4.3-33B |
| Tipos de cuantización | Pesos del borrador almacenados en BF16 safetensors; se ejecuta contra targets BF16, FP8, NVFP4-A16 y EXL3 (4,05 y 5,05 bpw) |
| Idiomas soportados | No disponible en la metadata de HuggingFace; la receta de entrenamiento incluye dominios chino (5,79 %) y multilingüe (3,66 %) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors BF16 (repositorio de 2,0 GB); rama `exllamav3` con configuración nativa para EXL3 |

## Arquitectura y entrenamiento

El borrador es un transformer de 3 capas con anchura oculta de 7168, anchura de MLP de 8192, 28 cabezas de consulta y 4 cabezas KV con dimensión de cabeza 128. Propone bloques de 8 tokens (incluido un ancla verificada) con atención bidireccional completa dentro del bloque, RoPE de tipo Neox con theta 120.000.000 y epsilon de RMSNorm 1e-5. La innovación principal es el aprovechamiento de características internas del target: toma los residuales post-capa 1, 25 y 49 (equivalentes a `hidden_states[2,26,50]` en HF, antes del RMSNorm final), los concatena en un vector de 21.504 dimensiones y los proyecta a 7168 con una matriz aprendida seguida de RMSNorm. Añade además una convolución dinámica de dos tomas con 16 grupos de canales alrededor de la atención y del MLP, y un selector de rank 128 con top-k 32 que puntúa predecesores y sucesores condicionales. El token de máscara es el 0 (`<unk>`) y no se modifica el tokenizador.

El entrenamiento usa únicamente fuentes aprobadas (`allow`) fijadas a revisiones concretas; las historias de prompt se renderizan con la plantilla de Nanbeige y se continúan *on-policy* con los pesos BF16 del target, con top_p 0,95 y temperatura 0,6 (razonamiento) o 1,0 (agéntico). La selección final contiene 11.554 registros de entrenamiento, 19.347.044 tokens de respuesta y 100.819.182 tokens de historial aportado, con 36 registros de validación disjuntos por familia. La ejecución principal completó 11 ventanas congeladas y 11.286 actualizaciones de optimizador con 2,25 pasadas sobre vistas barajadas. Del total, 10.785 respuestas terminaron por parada (12.645.988 tokens) y 769 quedaron truncadas por longitud (6.701.056 tokens) sin EOS sintético. La distribución por dominio es: agéntico 9.003.113 tokens (46,53 %), código 4.003.484 (20,69 %), matemáticas 1.683.454 (8,70 %), chat 1.680.691 (8,69 %), chino 1.121.044 (5,79 %), multilingüe 707.757 (3,66 %), estructurado 702.769 (3,63 %), contexto largo 433.324 (2,24 %) y STEM 11.408 (0,06 %). El estado de selección queda marcado como `selection_complete=false` por decisión del orquestador.

## Capacidades

- Aceleración de decodificación especulativa batch-1 sobre Nanbeige4.3-33B: 1,76× en greedy y 1,63× en T1 con target BF16; 1,65×/1,49× con FP8; 1,51×/1,39× con NVFP4-A16 (RTX PRO 6000 a 600 W, SGLang 0.5.21).
- Aceleración nativa en exllamav3 1.6.4 con EXL3: 1,51×/1,46× a 4,05 bpw y 1,55×/1,47× a 5,05 bpw (RTX PRO 6000 «Vega» a 580 W).
- Ganancias desiguales por dominio: 2,3-2,6× en *agentic coding*, 1,7-2,1× en código y matemáticas, 1,2-1,3× en chat y chino.
- No genera texto por sí mismo: no tiene capacidad propia de razonamiento, código, matemáticas ni visión. Todas esas capacidades provienen del modelo objetivo.
- No implementa *tool calling* ni planificación multi-paso por sí mismo; el soporte de herramientas y de historial de herramientas depende de la plantilla y del comportamiento de Nanbeige4.3-33B.
- Compatibilidad con el muestreo del target: greedy, o temperatura 0,6 para razonamiento general y 1,0 para herramientas agénticas, con top_p 0,95.
- Integración directa con SGLang 0.5.21 y con exllamav3 mediante la rama `exllamav3`; ambos runtimes enganchan la cabeza y el *embedding* del target.
- Revisión base fijada: `c1093c501cc6460427c0ac634db7223d0450c0ee`.

## Casos de uso

- Servicio interactivo de Nanbeige4.3-33B con SGLang: colocar el borrador delante del target BF16 reduce la latencia por token entre un 1,63× y un 1,76× en decodificación batch-1, que es el régimen típico de un chat o un asistente con un usuario por GPU.
- Pipelines de *agentic coding*: es el dominio con mayor ganancia reportada (2,3-2,6×), por lo que encaja en bucles de agente que encadenan decenas de llamadas cortas con historial de herramientas y donde la latencia acumulada domina el coste.
- Autocompletado y generación de código en IDE: el rango de 1,7-2,1× en código y matemáticas reduce el tiempo hasta el primer bloque completo en completados de extensión media.
- Despliegue con restricción de VRAM mediante FP8 o NVFP4-A16: el borrador mantiene 1,39-1,65× de aceleración cuando el target se cuantiza, lo que permite servir el 33B en GPUs donde BF16 no cabe.
- Estaciones de trabajo con exllamav3 y EXL3 a 4,05 bpw: permite servir el target cuantizado con aceleración de 1,46-1,51× sobre una única GPU de 96 GB a 580 W.
- Chat y atención al cliente en chino e inglés: aunque la ganancia baja a 1,2-1,3×, sigue siendo positiva y el borrador conserva el comportamiento multilingüe del target sin cambios de tokenizador.
- Evaluación comparativa de estrategias de decodificación especulativa: la documentación de receta, hashes y recuentos por dominio permite reproducir el entorno de entrenamiento como referencia interna.
- Reducción de coste por token en servicios de inferencia ya montados sobre SGLang: al no duplicar *embedding* ni cabeza de salida, el coste en VRAM añadido es de aproximadamente 2 GB en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible: el modelo no genera contenido propio y no procede evaluarlo con esas métricas. Los datos publicados son aceleraciones de decodificación batch-1 medidas en SGLang 0.5.21 sobre RTX PRO 6000 a 600 W:

| Target | Greedy | T1 |
|---|---|---|
| BF16 | 1,76× | 1,63× |
| FP8 | 1,65× | 1,49× |
| NVFP4-A16 | 1,51× | 1,39× |

| Target EXL3 (exllamav3 1.6.4, 580 W) | Greedy | T1 |
|---|---|---|
| 4,05 bpw | 1,51× | 1,46× |
| 5,05 bpw | 1,55× | 1,47× |

| Dominio | Aceleración reportada |
|---|---|
| Agentic coding | ~2,3-2,6× |
| Código y matemáticas | ~1,7-2,1× |
| Chat y chino | ~1,2-1,3× |

No se especifican en la model card las tasas de aceptación por posición del bloque, la longitud media de aceptación ni el throughput absoluto en tokens por segundo.

## Requisitos de hardware

- El borrador pesa aproximadamente 1,96 GB en BF16 (979.731.200 parámetros × 2 bytes); el repositorio ocupa 2,0 GB. No duplica *embedding* ni cabeza de salida.
- La VRAM real la determina el target de 33B. Estimación aritmética a partir del número de parámetros, no publicada en la model card: BF16 ≈ 66 GB; FP8 ≈ 33 GB; NVFP4-A16 ≈ 17 GB; EXL3 4,05 bpw ≈ 17 GB; EXL3 5,05 bpw ≈ 21 GB. Añadir KV cache y ~2 GB del borrador.
- GPU validadas por el autor: RTX PRO 6000 a 600 W (SGLang) y RTX PRO 6000 «Vega» a 580 W (exllamav3). No se mencionan A100, H100 ni RTX 4090.
- En GPUs de consumo: con target BF16 o FP8 no cabe en 24 GB. Con NVFP4-A16 o EXL3 4,05 bpw la estimación ronda los 17-19 GB, lo que en teoría encaja en una RTX 4090 de 24 GB, pero el autor no reporta ninguna medición en esa GPU y la aceleración en esos cuantizados es menor (1,39-1,55×).
- Opciones de despliegue: SGLang 0.5.21 (vía principal) y exllamav3 1.6.4 con la rama `exllamav3`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publican ratios relativos al target sin borrador, en batch-1. No hay datos de batching, ni de TPS absolutos, ni de latencia p99.

## Comparativa con modelos similares

No hay en la información proporcionada datos numéricos de alternativas (parámetros, contexto, tasas de aceptación) que permitan una comparación cuantitativa. La siguiente tabla recoge únicamente lo que puede afirmarse sin inventar:

| Modelo | Tipo | Parámetros | Aceleración publicada | Licencia | Integración |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-DFlash2 | Borrador block-diffusion específico para un target | 979.731.200 | 1,39-1,76× (hasta 2,3-2,6× en agéntico) | apache-2.0 | SGLang 0.5.21, exllamav3 1.6.4 |
| Nanbeige4.3-33B sin borrador (línea base) | Inferencia estándar | 33B (target) | 1× (referencia) | Según el repositorio del target | SGLang, exllamav3 |
| EAGLE-3 | Borrador entrenado sobre características del target | No disponible | No disponible en esta información | No disponible | No disponible |
| Medusa | Cabezas de decodificación especulativa | No disponible | No disponible en esta información | No disponible | No disponible |
| Borrador denso genérico (p. ej. *draft* de 1B sin acoplamiento) | Decodificación especulativa estándar | ~1B | No disponible | No disponible | vLLM, TGI, SGLang |

Diferencias cualitativas verificables: DFlash2 propone bloques de 8 tokens con atención bidireccional y depende de características internas de las capas 1, 25 y 49 del target, lo que lo ata a Nanbeige4.3-33B y a la revisión base `c1093c50`. Un borrador genérico no requiere acoplamiento arquitectónico, pero tampoco aprovecha los residuales del target.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse de forma autónoma. Requiere Nanbeige4.3-33B como verificador y su tokenizador y plantilla de chat.
- Acoplamiento a la revisión base `c1093c501cc6460427c0ac634db7223d0450c0ee`. Cualquier actualización del target invalida el borrador.
- Modelo declarado incompleto por el propio autor: 14.484 de 14.533 actualizaciones previstas (99,66 %), las últimas 49 en el suelo de *learning rate* no ejecutadas, y `selection_complete=false`. Hay una v2 con más datos anunciada pero no publicada.
- Solo se han medido aceleraciones en batch-1 y sobre una única familia de GPU (RTX PRO 6000). No hay datos de batching, de latencia p99 ni de comportamiento bajo carga concurrente.
- Distribución de datos muy sesgada hacia agéntico (46,53 %) y código (20,69 %); STEM puro representa el 0,06 % y contexto largo el 2,24 %, lo que probablemente reduzca la tasa de aceptación en esos dominios.
- 769 respuestas (6.701.056 tokens) quedaron truncadas por longitud sin EOS sintético, por lo que son continuaciones incompletas y no ejemplos cerrados.
- 1.258 filas heredadas carecen de los indicadores booleanos de finalización/truncamiento de las filas más recientes.
- La receta incluye componentes restringidos de OpenHands y de terminal sintético bajo política de fuentes; las condiciones exactas están en `NOTICE.md` y `dataset-source-policy.json`. Aunque los pesos son apache-2.0, conviene revisar esas restricciones antes de un uso comercial.
- Idiomas no declarados en la metadata. El comportamiento multilingüe depende enteramente del target y de un 3,66 % de datos multilingües en el borrador.
- Riesgo de alucinación y sesgos: heredados del target, no evaluados de forma independiente para este borrador.
- Adopción comunitaria mínima: 0 descargas y 4 *likes* en el momento de la ficha, sin validación externa de las cifras.
- No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; la integración está limitada a SGLang y exllamav3.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/Nanbeige4.3-33B-DFlash2
- Rama `exllamav3`: https://huggingface.co/ProCreations/Nanbeige4.3-33B-DFlash2/tree/exllamav3
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Target FP8: https://huggingface.co/ProCreations/Nanbeige4.3-33B-FP8
- Target NVFP4-A16: https://huggingface.co/ProCreations/Nanbeige4.3-33B-NVFP4-A16
- Target EXL3: https://huggingface.co/ProCreations/Nanbeige4.3-33B-EXL3
- Política de fuentes de datos: `dataset-source-policy.json` (en el repositorio)
- Registro de selección de entrenamiento: `training-selection.json` (en el repositorio)
- Avisos legales de componentes: `NOTICE.md` (en el repositorio)
