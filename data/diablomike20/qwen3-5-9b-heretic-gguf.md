# diablomike20/Qwen3.5-9B-Heretic-GGUF

## Resumen

Qwen3.5-9B-Heretic-GGUF es una cuantización GGUF del modelo DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP, un fine tune multietapa sobre la familia Qwen 3.5 de 9B parámetros, publicado por el usuario diablomike20 en Hugging Face. Se trata de un modelo "uncensored" y "abliterated", es decir, con los filtros de seguridad y los mecanismos de rechazo del modelo base eliminados o debilitados mediante el proceso conocido como "Heretic", seguido de un entrenamiento posterior para consolidar ese comportamiento.

El modelo combina razonamiento (thinking mode) con capacidades de escritura creativa, código y rol, y soporta visión mediante un archivo "mmproj" separado. El repositorio ofrece dos familias de cuantizaciones: GGUF regulares y GGUF con MTP (multi-token prediction), que aceleran la inferencia mediante predicción de varios tokens por paso. Todas las cuantizaciones usan imatrix "NEO" y conservan el tensor de salida en precisión completa de 16 bits.

Su relevancia actual radica en que, según los benchmarks publicados por el autor, supera en siete pruebas estándar (ARC-C, ARC-E, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande) a los modelos Qwen 3.5 9B, Qwen 3.5 27B y Qwen 3.6 35B-A3B incluso en cuantización de 4 bits, acercándose a Qwen 3.6 27B en algunos casos. Con 256k de contexto y licencia Apache 2.0, es una opción interesante para despliegues locales de bajo coste, aunque conviene tratar con cautela las cifras de benchmarks aportadas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen 3.5), con MTP (multi-token prediction) en las variantes MTP; no disponible si es MoE |
| Parametros totales | 8.953.803.264 (≈9B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | GGUF NEO IMATRIX (regular y MTP); el modelo base se publicó en bf16, mxfp8 y mxfp4; cuantizaciones GGUF concretas disponibles no detalladas en la model card |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (regular y MTP); modelo base en safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de la familia Qwen 3.5 de 9B parámetros, con soporte de imagen-texto-a-texto (visión activada mediante archivo mmproj separado) y un bloque de razonamiento (thinking) compactado por el autor. Las variantes MTP incorporan tensores de predicción multi-token, ajustados a precisión Q8_0, que permiten predecir dos tokens por paso y aumentar el throughput cuando la tasa de aceptación de tokens supera el 50 %.

Es un fine tune multietapa y multi-modelo realizado en hardware local por el autor (DavidAU) junto a Nightmedia, combinando varios fine tunes previos de 9B de Qwen 3.5 del mismo autor en un merge multietapa. El objetivo declarado fue mejorar la inteligencia general y el instruction following. Tras el merge, el modelo pasó por el proceso "Heretic" (abliteración de los mecanismos de rechazo) y un entrenamiento posterior a esa abliteración. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto general con fuerte instruction following según el autor.
- Modo thinking/reasoning con bloque de razonamiento compactado; el autor afirma que en modo thinking supera las métricas de modo instruct en la mayoría de casos.
- Escritura creativa, ficción y roleplaying (etiquetado explícitamente para estos usos).
- Generación y comprensión de código (etiqueta "coder").
- Visión (image-text-to-text): activada, requiere descargar un archivo "mmproj" aparte.
- Razonamiento y uso para "all use cases" según las etiquetas del autor.
- Compatibilidad con aplicaciones estándar de GGUF (LMStudio, llama.cpp, Ollama, etc.).
- Contenido sin censura: el modelo responde sin los rechazos habituales de los modelos alineados.

No se menciona soporte explícito de tool calling ni de flujos agénticos multi-paso en la información disponible.

## Casos de uso

- Escritura creativa y ficción sin filtros: el modelo está etiquetado para creative writing, fiction y roleplaying, y su naturaleza uncensored permite narrativas adultas o conflictivas sin rechazos, útil para autores que generan borradores largos aprovechando el contexto de 256k.
- Roleplaying interactivo: en aplicaciones tipo SillyTavern o frontend similares, el modelo puede mantener personajes coherentes en conversaciones multi-turno largas gracias al contexto ampliado y a las cuantizaciones ligeras que caben en GPU de consumo.
- Asistente de código local: con la etiqueta "coder" y modo thinking, puede asistir en generación y revisión de código en entornos locales privados donde no se quiere enviar código a APIs externas.
- Razonamiento y resolución de problemas: el modo thinking compactado lo hace adecuado para tareas de razonamiento paso a paso (matemáticas, lógica) en estaciones de trabajo con una sola GPU de gama alta.
- Análisis de documentos largos: la ventana de 256k tokens permite procesar contratos, informes o documentación técnica extensa en una sola pasada en local.
- Comprensión multimodal ligera: con el archivo mmproj, puede responder preguntas sobre imágenes, útil para descripción de imágenes, OCR aproximado o análisis de capturas en flujos locales.
- Prototipado de agentes locales: su tamaño reducido y velocidades altas (hasta ~185 t/s con MTP en una RTX 5090) lo hacen viable para bucles de agentes con muchas llamadas consecutivas donde el coste de inferencia local importa.
- Investigación sobre abliteración y alineación: al ser un modelo Heretic entrenado tras la abliteración, sirve como sujeto de estudio para comparar comportamiento de modelos uncensored frente a sus bases alineadas.

## Benchmarks y rendimiento

Datos publicados por el autor de la model card (modo instruct). No son verificaciones independientes:

| Modelo | ARC-C | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.8-27B (mxfp8) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.6-27B-Instruct (mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.5-27B-Instruct (mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Un modelo de ~9B parámetros en GGUF Q4 ocupa aproximadamente 5-6 GB; en Q8, unos 9-10 GB. El tamaño del repositorio (204,9 GB) indica que incluye un conjunto muy amplio de cuantizaciones, no que se necesite esa capacidad para ejecutar el modelo.
- Cuantizaciones de 4 bits (Q4_K_S y similares) caben holgadamente en GPUs de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080); cuantizaciones Q6/Q8 requieren GPUs de 16-24 GB (RTX 4090, RTX 5090) o se pueden ejecutar parcialmente en CPU.
- Velocidades publicadas por el autor: ~130 t/s con GGUF regular Q4_K_S y >185 t/s con GGUF MTP (aceptación del 60 %, 2 tokens por paso) en una RTX 5090 con Windows 11 y LMStudio; en Linux/Mac las velocidades suelen ser mayores.
- Para MTP: mantener temperatura ≤1 y repetition penalty en 1; si la tasa de aceptación de tokens baja del 50 %, usar los GGUF regulares.
- Para visión: descargar además un archivo "mmproj" (uno solo).
- Despliegue compatible con cualquier aplicación estándar de GGUF: llama.cpp, LMStudio, Ollama, KoboldCpp, entre otras. No se menciona soporte específico de vLLM o TGI para GGUF en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Heretic (este) | 8,95B | 256k | Apache 2.0 | GGUF (regular/MTP) | Uncensored, visión, thinking, benchmarks del autor superiores a su clase |
| Qwen3.5-9B-Instruct (base) | 9B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo oficial alineado; inferior en los benchmarks publicados por el autor |
| Qwen3.6-27B-Instruct | 27B | no disponible | no disponible | safetensors/GGUF | Mayor tamaño, mejores resultados en HellaSwag, BoolQ y Winogrande; requiere más VRAM |
| Qwen3.6-35B-A3B-Instruct (MoE) | 35B (A3B activos) | no disponible | no disponible | safetensors/GGUF | MoE eficiente con ~3B activos; el modelo de 9B lo supera en ARC-C/E según el autor |

## Limitaciones y advertencias

- Modelo uncensored y abliterated: no rechaza contenidos dañinos, ilegales o peligrosos. Su uso conlleva riesgos legales y éticos significativos y no es adecuado para entornos de producción orientados a usuarios finales sin capas de moderación externas.
- Los benchmarks proceden del propio autor y no están verificados de forma independiente; el propio autor advierte que superar 7 benchmarks de modelos mayores no garantiza superarlos en todas las tareas.
- Idiomas oficiales limitados a inglés y chino; el rendimiento en castellano no está documentado y puede ser inferior.
- Con MTP, temperaturas superiores a 1 y repetition penalty distinto de 1 degradan el rendimiento; para tareas creativas con temperatura alta se recomiendan los GGUF regulares.
- La visión requiere descargar un archivo mmproj adicional y su calidad no está documentada.
- Los datos de entrenamiento, el número de tokens y los métodos de alineación (RLHF/DPO) no están publicados, lo que dificulta evaluar sesgos sistemáticos.
- Al ser un merge multietapa de varios fine tunes, el comportamiento puede ser menos predecible que el de un modelo oficial, con mayor riesgo de alucinaciones y de degradación en tareas fuera de los dominios para los que se tuneó.
- Aunque la licencia Apache 2.0 permite uso comercial, el carácter uncensored puede entrar en conflicto con los términos de servicio de plataformas de despliegue.

## Enlaces

- Modelo GGUF: https://huggingface.co/diablomike20/Qwen3.5-9B-Heretic-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo 27B relacionado del autor: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Paper, demo y repositorio de código: no disponibles
