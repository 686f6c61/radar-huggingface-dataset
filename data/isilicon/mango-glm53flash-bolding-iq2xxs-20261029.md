# isilicon/mango-glm53flash-bolding-iq2xxs-20261029

## Resumen

Este repositorio es una réplica de preservación ("preservation mirror") publicada por isilicon dentro de su colección Mango, que contiene el paquete completo en tres fragmentos con cuantización IQ2_XXS del modelo GLM 5.3 Flash en versión "Uncensored" distribuida originalmente por BoldingBuilds a través de su proyecto OrcaRouter. El peso total del modelo base es de aproximadamente 320.759 millones de parámetros, y el payload seleccionado ocupa 97,10 GB (90,44 GiB) en disco.

El valor diferencial de esta ficha no es la cuantización en sí, sino que se trata de la configuración exacta evaluada por el equipo Mango: obtuvo una puntuación ponderada de 79,11/100 en su suite, con una carga de trabajo emparejada de 40,98 minutos sobre 202 preguntas y 12 casos de agente, todos superados mecánicamente (12/12). Destaca especialmente en inteligencia emocional (EQ-Bench v2: 85,13, el punto más alto de su cohorte de diez configuraciones) y en ciberseguridad (85,56).

Es relevante ahora porque ofrece una evaluación independiente y reproducible de una variante sin filtros de un modelo GLM de gran tamaño en cuantización extrema (2 bits), información útil para quienes evalúan si cuantizaciones agresivas de modelos enormes mantienen calidad suficiente para tareas de código, agentes y razonamiento social.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de tipo GLM (detalles no disponibles) |
| Parametros totales | 320.759.404.382 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no consta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (GGUF, con imatrix) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (3 fragmentos, 97,10 GB / 90,44 GiB en total) |

## Arquitectura y entrenamiento

El modelo base es GLM 5.3 Flash, una variante de la familia GLM publicada por BoldingBuilds bajo el proyecto OrcaRouter en versión "Uncensored" (sin filtros de alineación). El repositorio no documenta la arquitectura interna, el número de expertos si fuera un MoE, ni los datos de entrenamiento; el dato verificable es el tamaño de pesos en safetensors del modelo base: 320.759.404.382 parámetros.

Lo que este repositorio añade es la cuantización IQ2_XXS con matriz de importancia (imatrix) en formato GGUF, dividida en tres fragmentos, junto con una evaluación independiente del equipo Mango sobre esa configuración exacta de bytes. La model card advierte explícitamente que las comparaciones con otras configuraciones (por ejemplo, la versión Q2_K oficial de Orca) mezclan cuantización y motor de inferencia distintos, por lo que no constituyen estimaciones controladas del daño por cuantización.

## Capacidades

Según la evaluación Mango de esta configuración exacta:

- Generación de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Comprensión social y emocional: EQ-Bench v2 con media de 85,13 (IC 95%: 78,92–90,33), la más alta de su cohorte; teoría de la mente (OpenToM) con 55,56, notablemente más débil.
- Ciberseguridad: CyberMetric 100 %, CTI root-cause/CWE 86,67 %, CTI multiple choice 70,00 %.
- Generación de código: 85,00 % en tests locales de HumanEval+ (subconjunto de 20 problemas).
- Comportamiento agéntico: 12/12 casos mecánicos superados (completitud, evidencia, permisos y totales de precio aplicables); bucle de agente heurístico 100 %.
- Llamadas a herramientas: 70,00 % en llamadas estilo BFCL locales (40 casos).
- Seguimiento de instrucciones: 65,00 % en IFEval estricto (13/20), un punto relativamente débil.
- Conocimiento general y matemáticas: MMLU-Pro (subconjunto) 85,71 %, MATH-500 niveles 4–5 60,00 % (muestra muy pequeña, n=5).
- Al ser una versión "Uncensored", carece de los filtros de seguridad habituales, lo que amplía los usos pero también los riesgos.

No consta en la información disponible soporte de visión, audio ni modo de razonamiento explícito ("thinking mode").

## Casos de uso

- Evaluación de cuantizaciones extremas: es la referencia medida para decidir si IQ2_XXS de un modelo de 320 B mantiene calidad aceptable antes de desplegar en hardware limitado; los datos de dominio permiten comparar frente a Q2_K con evidencia emparejada.
- Asistentes con inteligencia emocional: su EQ-Bench de 85,13 lo hace adecuado para chatbots de acompañamiento, tutoría o mediación de conversaciones donde la sensibilidad tonal importa más que el cálculo.
- Análisis técnico de ciberseguridad: con 100 % en CyberMetric y 86,67 % en atribución CWE, sirve para triaje de vulnerabilidades, clasificación de debilidades y redacción de informes de threat intelligence.
- Pipelines agénticos ligeros: superó 12/12 verificaciones mecánicas de agente (completar tarea, citar evidencia, respetar permisos, sumar precios), apto para agentes de compras o formularios con verificación posterior.
- Generación y revisión de código local: 85 % en HumanEval+ local permite usarlo como copiloto offline en entornos sin conexión, con la reserva de que la muestra es pequeña.
- Investigación de modelos sin filtros: como versión "Uncensored" bajo licencia MIT, útil para investigación en alineación, red-teaming y estudio de comportamientos sin moderación.
- Preservación de modelos: actúa como espejo de preservación con bytes de origen inalterados y revisión registrada (`8a31ca66485373f9d5c002f5400b2aecaff84dfe`), útil para reproducibilidad.

## Benchmarks y rendimiento

Resultados de la evaluación Mango sobre esta configuración exacta (subconjuntos pequeños y graders locales; no son los pipelines oficiales completos):

| Tarea / grader | n | Media / % | IC 95% | Método |
|---|---|---|---|---|
| EQ-Bench v2 | 30 | 85,13 | 78,92–90,33 | Bootstrap (media) |
| OpenToM (etiquetas) | 18 | 55,56 | 33,72–75,44 | Wilson |
| CTI multiple choice | 20 | 70,00 | 48,10–85,45 | Wilson |
| CTI root-cause / CWE | 15 | 86,67 | 62,12–96,26 | Wilson |
| CyberMetric | 20 | 100,00 | 83,89–100,00 | Wilson |
| Llamadas estilo BFCL | 40 | 70,00 | 54,57–81,93 | Wilson |
| HumanEval+ (tests locales) | 20 | 85,00 | 63,96–94,76 | Wilson |
| IFEval estricto | 20 | 65,00 | 43,29–81,88 | Wilson |
| MMLU-Pro (subconjunto) | 14 | 85,71 | 60,06–95,99 | Wilson |
| MATH-500 niveles 4–5 | 5 | 60,00 | 23,07–88,24 | Wilson |
| Bucle de agente heurístico | 12 | 100,00 | 75,75–100,00 | Wilson |

Puntuación global ponderada: 79,11/100. Comparaciones registradas: frente al GLM mixto histórico no disponible (82,55) la diferencia emparejada es no concluyente; frente al Q2_K oficial de Orca (75,64 en 54,76 min), la diferencia es +3,47 puntos con IC 95 % de [-1,01, +7,86], por lo que el orden de calidad no está determinado en esta muestra.

Rendimiento medido: carga de trabajo completa 40,98 min (5,22 tareas/min); latencia p50/p95 de petición 3,95/29,91 s; TTFT p50/p95 0,92/1,19 s; tasa mediana de tokens de salida 42,17 tokens/s; 105.486 tokens de completion reportados; 0 finalizaciones por longitud.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El payload es de 97,10 GB en disco, pero la model card advierte explícitamente que eso no implica que el modelo quepa en la misma cantidad de VRAM: hay que añadir KV cache, memoria de trabajo y overhead del runtime. Como referencia orientativa no oficial, un modelo de ~320 B en ~2 bits suele requerir del orden de 100+ GB de memoria de GPU o una configuración híbrida GPU+CPU con offload.
- GPU recomendadas: no disponible oficialmente; por magnitud de memoria, hardware tipo A100/H100 de 80 GB (múltiples unidades) o Mac con memoria unificada de alta capacidad serían candidatos razonables, sin confirmación del autor.
- Consumer GPU: muy improbable que quepa íntegramente en una sola GPU de consumo (ninguna RTX 4090/3090 de 24 GB alcanza los ~97 GB de pesos); solo sería viable con offload agresivo a RAM y penalización severa de velocidad.
- Despliegue: formato GGUF, por lo que es compatible con runtimes del ecosistema llama.cpp (llama.cpp, Ollama, LM Studio, KoboldCpp); la model card no especifica el motor usado en la evaluación ni flags recomendados.
- Latencia y throughput medidos en la suite: TTFT p50 0,92 s, p95 1,19 s; 42,17 tokens/s medianos reportados; p95 de petición completa 29,91 s.

## Comparativa con modelos similares

Comparativa basada únicamente en los datos registrados en la model card:

| Modelo | Cuantización | Puntuación Mango | Tiempo de workload | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Bolding GLM 5.3 Flash) | IQ2_XXS | 79,11/100 | 40,98 min | MIT | Público (este repo) |
| GLM 5.3 Flash Orca (Q2_K oficial) | Q2_K | 75,64/100 | 54,76 min | no disponible | Público (vía Orca) |
| GLM mixto histórico | no disponible | 82,55 (punto estimado) | no disponible | no disponible | No disponible actualmente |

La comparación con el Q2_K mezcla motores de inferencia distintos y su IC 95 % ([-1,01, +7,86]) no permite concluir un orden de calidad. No hay datos comparativos con modelos de otras familias (Llama, Qwen, Mistral) en la información disponible.

## Limitaciones y advertencias

- Versión "Uncensored": carece de filtros de seguridad y moderación. Su uso conlleva riesgos legales y éticos significativos; no es apta para entornos de producción orientados a usuarios finales sin capas de seguridad adicionales.
- Cuantización extrema: IQ2_XXS es una cuantización de ~2 bits; la degradación de calidad respecto al modelo original no está cuantificada de forma controlada en esta model card.
- Muestras pequeñas: casi todos los benchmarks usan entre 5 y 40 preguntas con graders locales; los intervalos de confianza son amplios (por ejemplo, MATH-500 con n=5 tiene un IC de 23,07–88,24). No son los pipelines oficiales de HumanEval ni BFCL.
- Puntos débiles medidos: teoría de la mente (55,56), seguimiento estricto de instrucciones (65,00) y matemáticas de nivel alto (60,00 con muestra mínima).
- Contexto: la longitud de ventana no está documentada; la model card menciona que un GLM histórico comparado tenía un límite de 8192 tokens en modo thinking, pero no se confirma para esta versión.
- Alucinaciones: no se han publicado mediciones específicas de tasa de alucinación para esta configuración.
- Licencia: MIT, muy permisiva, incluido el uso comercial; no obstante, la procedencia del modelo base "Uncensored" y sus términos reales de redistribución deberían verificarse aguas arriba antes de uso comercial.
- Riesgo operativo: repositorio de terceros (espejo de preservación); conviene verificar la integridad de los fragmentos y la revisión de origen antes de ejecutar los pesos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/isilicon/mango-glm53flash-bolding-iq2xxs-20261029
- Modelo base: https://huggingface.co/BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF
- Colección completa de modelos evaluados y espejos de preservación de Mango: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Dataset con resultados de evaluación, puntuaciones por pregunta y metodología: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de niveles de esfuerzo en Qwen (referencia metodológica citada): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad de soporte (Discord de Infinity): https://discord.gg/5n5YDbQCMy
- Paper, blog o demo oficial del modelo base: no disponible
