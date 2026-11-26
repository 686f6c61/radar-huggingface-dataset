# JANGQ-AI/Naive-N0.5-Flash-JANGH2

## Resumen

Naive-N0.5-Flash-JANGH2 es una cuantización de 8 bits del modelo NaiveAI/Naive-N0.5-Flash, un transformer de tipo mixture-of-experts (MoE) de 309 mil millones de parámetros totales y 15,5 mil millones activos, desarrollado originalmente por NaiveAI para tareas de código y flujos agénticos. La versión JANGH2 la publica JANGQ-AI, un proyecto especializado en compresión de pesos para Apple Silicon, y reduce el modelo original de 575 GiB en bf16 a 95,89 GiB manteniendo los expertos enrutados en 2-3 bits y el resto de capas en 8 bits afines.

El modelo destaca por su contexto nativo de 1 millón de tokens, construido a partir de atención de ventana deslizante y atención dispersa, y por un diseño de 256 expertos enrutados con top-8 por capa. Es un modelo solo de texto, con soporte declarado de inglés y chino, y licencia MIT, lo que lo hace atractivo para despliegues comerciales sin restricciones adicionales.

La relevancia de esta ficha concreta está en que permite ejecutar un modelo de 309B en Macs de 128 GB de memoria unificada mediante la librería MLX, algo impensable en su formato original. El repositorio incluye mediciones detalladas de degradación frente al modelo bf16 (ΔNLL de +0,380 nats por token, KL mediana de 0,270) y comparaciones con la cuantización afín estándar de MLX, que resulta claramente inferior en fidelidad de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención de ventana deslizante y atención dispersa |
| Parametros totales | 29.031.273.408 (según safetensors del repo cuantizado); modelo fuente: 309B |
| Parametros activos | 15,5B (modelo fuente) |
| Longitud de contexto | 1.000.000 tokens (nativo) |
| Tipos de cuantizacion | Expertos enrutados: JANGT trellis 2/2,5/3 bits y JANGH codebook Hadamard-32 2/3/4 bits; resto: afín 8 bits; routers en fp32 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), bundle JANGH2 |
| Expertos enrutados | 256, top-8 por capa |
| Tamano del repo | 201,0 GB (pesos cuantizados: 95,89 GiB) |
| Biblioteca | mlx |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 256 expertos enrutados por capa y selección top-8 por token. Combina atención de ventana deslizante con atención dispersa para alcanzar un contexto nativo de 1 millón de tokens sin el coste cuadrático completo de la atención densa. La model card del repositorio cuantizado no detalla el número de tokens de entrenamiento ni la composición del dataset, ni si hubo fases de RLHF o DPO; esa información corresponde al modelo original de NaiveAI y no está disponible en la información proporcionada.

La innovación técnica de esta publicación es el esquema de cuantización JANGH2, que asigna a cada capa de expertos una mezcla de dos formatos elegida por medición: JANGT (código trellis con rotación Hadamard-128, estado de 12 bits y hasta 8 columnas outlier por capa en fp16, a 2, 2,5 o 3 bits por peso) y JANGH (codebook Hadamard-32 a 2, 3 o 4 bits, redondeado con GPTQ). El resto de pesos se mantiene en afín 8 bits o en la precisión original (routers en fp32, normas e indexador de atención dispersa). El nombre "JANGH2" indica 2,5 bits por peso en promedio sobre el modelo completo (95,89 GiB × 8 / 308,9B parámetros fuente).

## Capacidades

- Generación de texto conversacional y continuaciones de contexto largo, con ventana nativa de 1M tokens.
- Razonamiento explícito con modo thinking (etiqueta `thinking` en los tags del repo).
- Generación y edición de código, con etiqueta `code` y orientación declarada a trabajo de programación.
- Tool calling y function calling, con evaluación específica de fidelidad en puntos de decisión de llamada a herramienta.
- Flujos agénticos multi-paso (etiqueta `agent`), incluidos escenarios de ciberseguridad y conversaciones multi-turno con herramientas.
- Procesamiento de documentos largos y académicos, según la composición del conjunto de evaluación del autor.
- Capacidades multilingües limitadas a inglés y chino.
- Solo texto: no hay soporte de visión, audio ni multimodalidad.

## Casos de uso

- Asistente de código en local para Macs de 128 GB: el modelo cabe en memoria unificada con MLX y permite autocompletado, refactorización y explicación de código sin enviar el código a un servicio externo, gracias a sus 15,5B parámetros activos y su contexto de 1M tokens para repositorios completos.
- Agente de tool calling en pipelines internos: la evaluación del autor mide 101 puntos de llamada correctos sobre 112 en bf16 y solo 7 inversiones llamada↔respuesta frente a bf16, lo que lo hace adecuado para orquestación de APIs y sistemas con decisiones encadenadas.
- Análisis de documentos largos: contratos, informes o bases de código de cientos de miles de tokens caben en la ventana de 1M, permitiendo resumir, extraer entidades y responder preguntas sobre el documento completo sin troceado.
- Atención al cliente multilingüe en inglés y chino: conversaciones multi-turno con contexto persistente y modo thinking para resolver consultas complejas que requieren razonamiento sobre historial previo.
- Revisión de seguridad y auditoría de código: el conjunto de evaluación del autor incluye dominios de ciberseguridad, lo que sugiere uso en detección de patrones de riesgo y explicación de vulnerabilidades en código.
- Investigación y prototipado en Apple Silicon: al ser un bundle MLX con licencia MIT, sirve para experimentar con modelos MoE de gran escala en hardware de consumo profesional sin depender de GPUs de datacenter.
- Generación de documentación técnica y tutoriales: el modelo puede producir texto explicativo a partir de código y especificaciones, aprovechando su entrenamiento en código y su contexto largo para mantener coherencia entre secciones.

## Benchmarks y rendimiento

Los datos publicados por el autor miden la fidelidad de la cuantización frente al modelo bf16, no benchmarks de tarea estándar (MMLU, HumanEval, GSM8K). Se presentan a continuación tal cual, sin extrapolación.

Evaluación principal: 124 secuencias retenidas, 133.881 posiciones teacher-forced, KL renormalizada top-128.

| Modelo | Tamano | ΔNLL vs bf16 ↓ | KL mediana ↓ | KL media ↓ | p90 / p99 ↓ | top-1 ↑ | top-5 ↑ |
|---|---|---|---|---|---|---|---|
| FP8 oficial | ~315 GB | +0,180 | 0,165 | 0,870 | 2,45 / 9,59 | 62,2% | 81,3% |
| FP8 W8A8 oficial | ~315 GB | +0,186 | 0,173 | 0,880 | 2,49 / 9,65 | 61,9% | 81,0% |
| **JANGHT2.5** | **91,31 GiB** | **+0,271** | **0,256** | **1,012** | **2,83 / 10,15** | **58,4%** | **79,2%** |
| JANGH2 (esta release) | 95,89 GiB | +0,380 | 0,270 | 1,034 | 2,89 / 10,43 | 57,7% | 78,5% |

Comparación secundaria (68.370 posiciones, 28 prompts retenidos, sin conversaciones multi-turno con herramientas):

| Modelo | Tamano | KL mediana ↓ | KL media ↓ | p90 / p95 / p99 ↓ | top-1 ↑ | top-5 ↑ | top-10 ↑ |
|---|---|---|---|---|---|---|---|
| Techo: bf16 + ruido 0,001 | 575 GiB | 0,060 | 0,749 | 2,23 / 4,26 / 9,62 | 71,6% | 85,8% | 89,1% |
| JANGH2 | 95,89 GiB | 0,170 | 1,008 | 3,11 / 5,37 / 10,50 | 64,4% | 81,5% | 85,6% |
| MLX afín RTN, mismo tamano | 95,83 GiB | 1,552 | 2,976 | 8,04 / 11,06 / 16,78 | 48,2% | 64,1% | 68,6% |

Fidelidad de tool calling (96 conversaciones retenidas, 208 puntos de decisión):

| Metrica | Techo | JANGH2 | MLX afín RTN |
|---|---|---|---|
| Puntos de llamada correctos (bf16: 100 de 112) | 97 | 101 | 83 |
| Inversiones llamada↔respuesta vs bf16 | 9 | 7 | 27 |

El autor señala que la concordancia top-1 con bf16 tiene un techo bajo en este modelo: ejecutar los mismos pesos bf16 en aritmética fp32 ya da solo un 79% de concordancia, porque la selección top-8 de 256 expertos con candidatos casi empatados amplifica cualquier error mínimo. Por eso el ΔNLL es la métrica principal.

## Requisitos de hardware

- VRAM/memoria unificada: 95,89 GiB de pesos cuantizados; el bundle completo requiere al menos 128 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon con 128 GB o más (M3 Ultra, M4 Max en configuraciones altas). No está pensado para GPUs NVIDIA; el formato es MLX y no se convierte directamente a GGUF.
- Cabe en GPU de consumo: no en el sentido convencional; requiere un Mac con 128 GB de memoria unificada. No cabe en RTX 4090 (24 GB) ni en A100 de 40 GB.
- Despliegue: MLX Studio y vMLX (Python). La model card advierte que la versión JANGHT necesita una build de vMLX aún no publicada; vMLX 1.6.77 y anteriores rechazan cargarlo con error, sin producir salidas incorrectas. Los pesos JANGH2 anteriores están en el historial del repo, commit `54fab36`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Naive-N0.5-Flash-JANGH2 | 309B / 15,5B (fuente); 29,0B en safetensors del repo | 1M | MIT | MLX safetensors | Hugging Face, 236 descargas |
| Naive-N0.5-Flash (bf16 original) | 309B / 15,5B | 1M | MIT (según repo base) | safetensors | Hugging Face (NaiveAI) |
| Naive-N0.5-Flash FP8 oficial | 309B / 15,5B | 1M | MIT | FP8 | Despliegue de NaiveAI (~315 GB) |
| MLX afín RTN (control del autor) | 309B / 15,5B | 1M | MIT | MLX safetensors | No publicado |

No se dispone de datos de benchmarks de tarea para comparar con modelos de otras familias; la comparación disponible se limita a variantes del mismo modelo base y al control de cuantización afín de MLX.

## Limitaciones y advertencias

- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero falso, especialmente en dominios especializados.
- Idiomas: solo inglés y chino declarados; no hay soporte verificado de castellano ni de otras lenguas.
- Modalidad: solo texto; no procesa imágenes, audio ni vídeo.
- Dependencia de runtime: el bundle JANGHT requiere una build de vMLX no publicada en el momento de la ficha; sin ella, el modelo no carga. Verificar la versión de vMLX antes de desplegar.
- Degradación medible: ΔNLL de +0,380 nats por token y KL mediana de 0,270 frente a bf16; la ratio de perplejidad es 1,46 frente al modelo original. Aceptable para muchas tareas, pero no es una réplica exacta del bf16.
- Fidelidad de tool calling: 7 inversiones llamada↔respuesta frente a bf16 en 208 puntos de decisión; en producción conviene validar las llamadas a herramientas con tests propios.
- Selección de expertos inestable: la elección top-8 de 256 expertos con candidatos casi empatados hace que pequeñas perturbaciones cambien decisiones; no esperar concordancia alta con bf16 en métricas top-k.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene revisar la licencia del modelo base NaiveAI/Naive-N0.5-Flash y de los datos de entrenamiento originales, no detallados aquí.
- Tamaño de repo de 201 GB: incluye historial y posibles artefactos; el espacio en disco necesario para clonar supera el de los pesos activos.
- Sin benchmarks de tarea publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares en la información proporcionada, por lo que la calidad en tareas concretas debe evaluarse empíricamente.

## Enlaces

- Hugging Face (repo actual): https://huggingface.co/JANGQ-AI/Naive-N0.5-Flash-JANGH2
- Repo sucesor JANGHT2.5: https://huggingface.co/JANGQ-AI/Naive-N0.5-Flash-JANGHT2.5
- Commit con pesos JANGH2 anteriores: https://huggingface.co/JANGQ-AI/Naive-N0.5-Flash-JANGHT2.5/tree/54fab3629aed6b8a2e5e481c3a8885bbe094c820
- Modelo base: https://huggingface.co/NaiveAI/Naive-N0.5-Flash
- Perfil del autor: https://huggingface.co/JANGQ-AI
- MLX Studio: https://mlx.studio
- vMLX: https://vmlx.net
