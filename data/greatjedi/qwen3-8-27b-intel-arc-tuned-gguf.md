# Greatjedi/Qwen3.8-27B-Intel-Arc-Tuned-GGUF

## Resumen

Qwen3.8-27B Intel Arc Tuned es una familia de pesos GGUF derivada de Qwen3.8-27B (denominación de 27.000 millones de parámetros) y recuantizada por el usuario Greatjedi para resolver un cuello de botella concreto en GPUs Intel Arc. El backend SYCL de llama.cpp no implementa kernels para tensores I-Quant (IQ2_S, IQ3_XXS, IQ4_XS), basados en codebooks de retícula no lineal E8; cuando el motor encuentra uno de esos tensores, abandona la ruta DPAS de las XMX y cae en bucles de desquantización en host, con velocidades de 8,1 a 13,0 tokens/s pese a los 512 GB/s de ancho de banda de una Arc Pro B60.

La solución aplicada es una transquantización software selectiva: se interceptan los tensores I-Quant y se reescriben como superbloques lineales Q4_K con escalas y mínimos de 6 bits por cada 32 pesos, preservando bit a bit los embeddings rotatorios (RoPE), las layernorms, los estados SSM lineales y las proyecciones de atención de alta precisión. El repositorio publica dos variantes (15,29 GiB y 13,72 GiB) con licencia Apache 2.0 e idiomas inglés y chino.

Su relevancia actual es doble: documenta un caso real de penalización hardware/software en inferencia local sobre silicio Intel y ofrece una vía de despliegue reproducible con llama-server y SYCL, incluyendo decodificación especulativa mediante una cabeza NextN MTP embebida que alcanza 41,28 tokens/s con un 93,4 % de aceptación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada explícitamente en la información disponible; la model card cita RoPE, layernorms, estados SSM lineales y proyecciones de atención de alta precisión, lo que apunta a un diseño híbrido atención/SSM |
| Parámetros totales | 27.000 millones (según la denominación del modelo; no se desglosa en la información disponible) |
| Parámetros activos | No disponible (no se describe como MoE) |
| Longitud de contexto | 200.000 tokens probados por el autor con `-c 200000`; no se indica el contexto máximo de entrenamiento |
| Tipos de cuantización | GGUF: Q4_K, Q5_K, Q6_K, Q2_K y BF16 según variante; 0 tensores I-Quant |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF para llama.cpp; proyector multimodal `mmproj` en BF16 |
| Tamaño de ficheros | 15,29 GiB (variante Ridge) y 13,72 GiB (variante GSQ-RCO) |
| Cabeza especulativa | MTP NextN embebida de 41 MiB (`blk.64.nextn.*`) en la variante Ridge; drafter externo DFlash2 opcional en la variante GSQ-RCO |
| Backend objetivo | llama.cpp con backend SYCL sobre Intel Arc (Battlemage Xe2 / Alchemist Xe), oneAPI 2026.x |

## Arquitectura y entrenamiento

Los pesos base son dos recuantizaciones de Qwen3.8-27B: `empero-ai/Qwen3.8-27B-Ridge-GGUF` y `ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF`. La model card describe el modelo como una pila de 64 capas con RoPE, layernorms, estados SSM lineales y proyecciones de atención de alta precisión, además de una cabeza de predicción NextN para decodificación especulativa multiconsulta. No se detalla la arquitectura interna completa (número de cabezas, dimensiones ocultas, ratio de capas SSM frente a capas de atención) ni el régimen de entrenamiento (tokens, composición del dataset, RLHF/DPO). Toda esa información figura como no disponible.

La innovación técnica documentada no está en el entrenamiento, sino en la ingeniería de cuantización: un parser software selectivo en llama.cpp intercepta cada tensor I-Quant no soportado y lo transcuantiza a superbloques Q4_K nativos, de modo que las XMX pueden alimentar su pipeline sistólico DPAS con enteros densos y linealmente indexados. Los autores sostienen que este mapeo restaura el rango dinámico (escalas de 6 bits y mínimos independientes por cada 32 pesos) y corrige el fallo de recuperación tipo Needle-In-A-Haystack que atribuyen a los codebooks de 8 dimensiones en contextos de 50.000 a 200.000 tokens, por acumulación de ruido de cuantización a lo largo de las 64 capas. También señalan que el popular `Qwen3.8-27B-UD-Q4_K_S` de Unsloth contiene 201 tensores I-Quant ocultos y sufre el mismo bloqueo en Intel Arc. Estas afirmaciones proceden únicamente del autor y no se han verificado de forma independiente en la información disponible.

## Capacidades

- Generación de texto autoregresiva con ventana de contexto de 200.000 tokens.
- Decodificación especulativa con cabeza MTP NextN embebida (93,4 % de aceptación, 41,28 tokens/s en la variante Ridge).
- Decodificación especulativa con drafter externo DFlash2 (93,5 % de aceptación, 36,03 tokens/s de media y 42,77 tokens/s de pico en la variante GSQ-RCO).
- Recuperación de información en contexto largo (Needle-In-A-Haystack) declarada como 100 % verde hasta 200.000 tokens por el autor.
- Multimodalidad: la model card invoca un proyector `mmproj` en BF16 ejecutado junto al modelo, lo que implica entrada de imagen; las tareas concretas de visión no se detallan en la información disponible.
- Bilingüismo inglés y chino.
- Compatibilidad con llama-server y sus opciones de servidor (`-ngl 99 -fa on`).
- Tool calling / function calling: no disponible (no documentado en la información proporcionada).
- Comportamiento de agente y razonamiento multi-paso: no disponible (no documentado en la información proporcionada).
- Modo de razonamiento explícito (thinking): no disponible (no documentado en la información proporcionada).

## Casos de uso

- Asistente conversacional local sobre GPU Intel Arc: con 22,23 tokens/s en decodificación pura y 41,28 tokens/s con MTP embebido, la tasa de generación supera el umbral de lectura humana y es viable para chat interactivo sin depender de la nube.
- Recuperación de información en corpus extensos (RAG sobre documentación técnica o expedientes): el contexto de 200.000 tokens y la restauración de NIAH declarada permiten insertar bloques documentales muy grandes sin troceado agresivo.
- Análisis de documentos largos bilingües inglés-chino: el modelo cubre ambos idiomas y mantiene coherencia en ventanas de decenas de miles de tokens, útil para contratos, informes o normativa técnica en organizaciones con documentación en los dos idiomas.
- Ingesta masiva de prompts largos en pipelines por lotes: el prefill de 245,54 tokens/s (frente a 110,05 tokens/s del IQ3_XXS de serie) reduce el coste de procesar prompts extensos antes de la generación.
- Asistencia multimodal sobre documentos escaneados: la ejecución con proyector `mmproj` en BF16 permite alimentar imágenes al modelo; el consumo total citado es de 18,8 GiB de VRAM con visión BF16 a 200.000 tokens de contexto.
- Migración de infraestructura existente con Arc sin cambiar de hardware: equipos que ya operan con Arc A770 de 16 GB o Arc Pro B60 de 24 GB pueden sustituir cuantizaciones I-Quant por estos pesos Q4_K y multiplicar por 2,8 la velocidad de decodificación.
- Despliegue de servidor interno compatible con API de llama-server: el modelo se sirve como endpoint HTTP dentro de una red corporativa, sin exposición de datos a terceros.
- Evaluación comparativa de cuantizaciones en hardware Intel: el repositorio documenta composición de tensores y métricas por variante, lo que sirve como banco de pruebas para decidir entre Q4_K lineal y codebooks I-Quant.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre Intel Arc Pro B60 (24 GB), dispositivo `level_zero:0`, con `-ngl 99 -fa on`. No se han verificado de forma independiente y no proceden de ninguna evaluación de terceros.

| Variante | Tamaño | Composición de cuantización | Decode puro | Prefill | Decode especulativo |
|---|---|---|---|---|---|
| ISTA-DASLab IQ3_XXS (stock) | 9,39 GiB | 355 tensores IQ (81 % del modelo) | 8,10 tok/s | 110,05 tok/s | No aplica (bloqueado) |
| Qwen3.8-27B-Ridge (stock) | 11,72 GiB | 192 tensores IQ | 12,22 tok/s | 133,45 tok/s | ~13,2 tok/s |
| Unsloth UD-Q4_K_S (stock) | 14,29 GiB | 201 tensores IQ | 12,97 tok/s | 162,75 tok/s | ~18,9 tok/s (limitado por verificación) |
| Ridge Intel Arc Tuned Q4_K (autor) | 15,29 GiB | 0 IQ; 336 Q4_K, 51 Q5_K, 23 Q6_K | 22,23 tok/s | 245,54 tok/s | 41,28 tok/s (MTP embebido, 93,4 % aceptación) |
| DAS Lab Intel Arc Tuned Q4_K (autor) | 13,72 GiB | 0 IQ; 374 Q4_K, 28 Q2_K, 96 BF16 | 22,36 tok/s | 243,61 tok/s | 36,03 tok/s (DFlash2, 93,5 % aceptación) |

Mejora declarada en decodificación pura: de 8,10 a 22,36 tokens/s, un +176 % (aproximadamente 2,8 veces más rápido). No se han publicado resultados de MMLU, HumanEval, GSM8K ni perplejidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15,29 GiB solo para los pesos de la variante Ridge y 13,72 GiB para la variante GSQ-RCO, en sus cuantizaciones más bajas publicadas.
- Consumo total declarado: 18,8 GiB de VRAM ejecutando la variante Ridge con visión BF16 y contexto de 200.000 tokens.
- Decodificación especulativa sin coste extra de VRAM en la variante Ridge (cabeza MTP embebida); la variante GSQ-RCO requiere un fichero drafter externo DFlash2 que ocupa 1,1-1,3 GiB adicionales si no se usa MTP.
- GPU recomendadas: Intel Arc Pro B60 de 24 GB (plataforma de referencia de los benchmarks), Intel Arc A770 de 16 GB y tarjetas Battlemage Xe2, citadas explícitamente por el autor.
- No se documentan pruebas en GPUs NVIDIA, AMD ni en CPU, ni si el modelo cabe en GPUs de consumo distintas de las Arc mencionadas.
- Opciones de despliegue: llama.cpp con backend SYCL y llama-server. Variables de entorno indicadas: `UR_LOADER_USE_LEVEL_ZERO_V2=0` (crítico en Battlemage para evitar el error 44), `ONEAPI_DEVICE_SELECTOR=level_zero:0`, `ZE_AFFINITY_MASK=0` y `ZES_ENABLE_SYSMAN=1`, con oneAPI 2026.x.
- Throughput medido: 22,23-22,36 tokens/s en decodificación pura, 243,61-245,54 tokens/s de prefill y 36,03-41,28 tokens/s con decodificación especulativa.

## Comparativa con modelos similares

Comparación con otras cuantizaciones GGUF del mismo modelo base, todas de aproximadamente 27.000 millones de parámetros y orientadas a inferencia local.

| Modelo | Parámetros | Contexto | Decode puro (Arc B60) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Greatjedi Qwen3.8-27B Intel Arc Tuned (Ridge) | 27B | 200.000 tokens | 22,23 tok/s | apache-2.0 | Repositorio con 0 descargas y 0 likes en el momento de la consulta |
| Greatjedi Qwen3.8-27B Intel Arc Tuned (GSQ-RCO) | 27B | 200.000 tokens declarados | 22,36 tok/s | apache-2.0 | Igual que el anterior |
| ISTA-DASLab Qwen3.8-27B-GSQ-RCO (stock) | 27B | No disponible | 8,10 tok/s (variante IQ3_XXS) | No disponible en la información proporcionada | Repositorio base citado |
| empero-ai Qwen3.8-27B-Ridge (stock) | 27B | No disponible | 12,22 tok/s | No disponible en la información proporcionada | Repositorio base citado |
| Unsloth Qwen3.8-27B-UD-Q4_K_S (stock) | 27B | No disponible | 12,97 tok/s | No disponible en la información proporcionada | Citado en la model card, sin enlace |

Frente a alternativas de otros fabricantes del mismo orden de parámetros, no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks, las cifras de aceptación especulativa y la restauración de NIAH hasta 200.000 tokens son afirmaciones del autor; no hay validación independiente ni perplejidad comparativa publicada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de evidencia comunitaria de funcionamiento.
- Solo se declaran los idiomas inglés y chino; el comportamiento en castellano no está documentado.
- La optimización depende del backend SYCL de llama.cpp y del silicio Intel Arc; no se documentan resultados en CUDA, ROCm, Metal ni CPU, y la ganancia podría no trasladarse a otras plataformas.
- La transquantización de I-Quant a superbloques Q4_K es una operación con pérdida; los autores defienden que preserva mejor el rango dinámico, pero no aportan métricas de fidelidad frente a los pesos originales.
- La model card está truncada en la sección de inicio rápido: el comando con `--mmproj` queda incompleto, por lo que la ruta exacta del proyector multimodal no está disponible.
- No se documenta nada sobre datos de entrenamiento, ajuste por RLHF/DPO, filtrado de sesgos ni evaluación de seguridad del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; no se aportan tasas de error ni evaluaciones de veracidad.
- Licencia Apache 2.0 declarada para este repositorio, pero las condiciones de los pesos base (`empero-ai`, `ISTA-DASLab`) no se detallan en la información disponible; conviene verificarlas antes de un uso comercial.
- La denominación Qwen3.8-27B no se corresponde con ninguna ficha oficial de Qwen documentada en la información proporcionada; la única cadena de custodia verificable son los repositorios base citados.
- El uso en contextos de 200.000 tokens exige una GPU de 24 GB y consume 18,8 GiB de VRAM, lo que deja poco margen para otras cargas en la misma tarjeta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Greatjedi/Qwen3.8-27B-Intel-Arc-Tuned-GGUF
- Modelo base Ridge: https://huggingface.co/empero-ai/Qwen3.8-27B-Ridge-GGUF
- Modelo base GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Identificador arXiv referenciado en las etiquetas del repositorio: https://arxiv.org/abs/2402.04396
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; las únicas fuentes utilizables son la página de HuggingFace y la model card del autor.
