# Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r07

## Resumen

`Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r07` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`, comprimido con la técnica SVD-LLM hasta conservar el 70,0 % de los parámetros densos (se elimina el 30,01 %), y posteriormente editado mediante 7 de las 10 rondas de un procedimiento iterativo de intercambio de parámetros neutro en parámetros ("parameter-neutral swap") seleccionado por la regla `gap_iter`. Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo y qué regla de selección de componentes lo repara mejor.

El modelo no es un asistente de propósito general: es una celda de una rejilla experimental que cruza reglas de selección y presupuestos de restauración. Cada ronda intercambia hasta el 0,1 % de los parámetros densos; el presupuesto total del experimento completo es del 1,0 %. En este checkpoint se han restaurado 7.609 componentes y se han expulsado otros 7.609, con 48.821.248 parámetros insertados (0,70 % de los parámetros de proyección densos), semilla 42 y valor de intercambio `insert` (solo valor de inserción, con expulsión ordenada por sigma).

Su relevancia es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión, un eje poco explorado en la literatura de eficiencia. Los pesos están en formato safetensors, el pipeline es `text-generation` y el repositorio ocupa 16,1 GB. Cuenta con 0 descargas y 0 "likes" en el momento de la consulta, y la model card advierte explícitamente de que algunas ramas de la rejilla están degradadas en seguridad de forma deliberada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1, con proyecciones comprimidas mediante SVD-LLM y edición posterior por intercambio de componentes |
| Parámetros totales | 8.030.261.248 (~8,03 B); fracción de parámetros densos resultante: 0,6999 (30,01 % eliminado) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base; no se documenta en el repositorio) |
| Tipos de cuantización | no se publican cuantizaciones en el repositorio; los pesos se distribuyen en safetensors con un tamaño de 16,1 GB, compatible con bf16/fp16 (~2 bytes por parámetro) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería Transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 8,03 B de parámetros (`meta-llama/Llama-3.1-8B-Instruct`). Sobre ella se aplica SVD-LLM, un método de compresión que descompone en valores singulares las matrices de proyección y descarta componentes de bajo rango: en este caso se elimina el 30,01 % de los parámetros densos, dejando una fracción de 0,6999. No hay entrenamiento adicional de tipo RLHF o DPO documentado en la model card; la intervención es una edición de pesos, no un reentrenamiento.

La innovación del artefacto es el procedimiento de reparación posterior: 10 rondas iterativas de intercambio de parámetros neutro en parámetros, de las cuales este checkpoint contiene las 7 primeras. Cada ronda usa la regla de selección `gap_iter` y un fragmento del 0,1 % de los parámetros densos, con un presupuesto agregado de 1,0 %. Se restauran 7.609 componentes y se expulsan 7.609 mediante evicción ordenada por sigma, con valor de intercambio `insert` (se emplea únicamente el valor de inserción) y semilla 42. El resultado son 48.821.248 parámetros insertados, equivalentes al 0,70 % de los parámetros de proyección densos. El propio autor describe el checkpoint como un sujeto experimental y no como un asistente desplegable.

## Capacidades

- Generación de texto conversacional heredada del modelo base, sujeta a la degradación introducida por la compresión y por la edición de pesos.
- Razonamiento e instrucciones generales: no se documentan evaluaciones de capacidad en la model card, por lo que el nivel real de utilidad no está cuantificado en la información disponible.
- Modo de seguridad medible: el artefacto está diseñado para medir tasa de éxito de ataques (ASR) y sobre-rechazo, no para maximizar utilidad.
- Compatibilidad con `text-generation-inference` y con endpoints según las etiquetas del repositorio (`text-generation-inference`, `endpoints_compatible`).
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas (el campo de idiomas no está disponible).
- Capacidades especiales (visión, audio, modo "thinking"): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación sobre compresión y seguridad: el checkpoint sirve como celda de control para medir cuánto degrada la compresión SVD-LLM el comportamiento de rechazo, comparando su ASR de 0,0050 en AdvBench y 0,0350 en StrongREJECT frente a otras celdas de la rejilla.
- Reproducción de experimentos: con la semilla 42, la regla `gap_iter`, el presupuesto del 1,0 % y el fragmento por ronda del 0,1 % documentados, es posible reproducir esta ronda intermedia (7 de 10) dentro de un estudio más amplio.
- Ablación de reglas de selección de componentes: al fijar el presupuesto y variar solo la regla, este artefacto permite aislar el efecto de `gap_iter` frente a otras reglas del grid sobre las métricas de seguridad.
- Evaluación de sobre-rechazo: con un 0,3322 de sobre-rechazo macro medido por WildGuard, es útil para estudiar el coste en utilidad de las intervenciones de reparación de seguridad.
- Calibración de jueces automáticos: los valores de ASR se obtienen con HarmBench como juez, de modo que el checkpoint sirve para validar pipelines de evaluación que combinan HarmBench y WildGuard sobre modelos comprimidos.
- Análisis de interpretabilidad de pesos: los 48.821.248 parámetros insertados y los 7.609 componentes intercambiados ofrecen un conjunto trazable para estudiar qué componentes sostienen el comportamiento de seguridad.
- Docencia y divulgación en eficiencia de modelos: como ejemplo reproducible de un compromiso explícito entre compresión, seguridad y utilidad, con métricas publicadas y presupuesto acotado.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0050 |
| StrongREJECT | ASR (juez HarmBench) | 0,0350 |
| WildGuard | Sobre-rechazo macro | 0,3322 |

No se han publicado en la información disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) ni valores comparativos del modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (el repositorio ocupa 16,1 GB), más KV cache y activaciones.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 4,5-5 GB (estimación aritmética a partir de los 8,03 B de parámetros, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio en bf16; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí en RTX 4090/3090 en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4 u 8 bits; no se publican cuantizaciones oficiales, habría que generarlas.
- Opciones de despliegue: Transformers (librería declarada), text-generation-inference (etiqueta del repositorio), vLLM y llama.cpp/Ollama tras convertir los pesos; no se documenta compatibilidad verificada con ninguna de ellas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l31_remove30_swapgapiter_b010_r07 | 8,03 B (fracción densa 0,6999) | no disponible | ASR AdvBench 0,0050; ASR StrongREJECT 0,0350; sobre-rechazo 0,3322 | Llama 3.1 Community License | HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct (modelo base) | 8,03 B | no disponible en la información proporcionada | no disponible en la información proporcionada | Llama 3.1 Community License | HuggingFace |
| Otras celdas de la misma rejilla (otras reglas de selección y presupuestos) | ~8 B con distintas fracciones densas | no disponible | no disponible | Llama 3.1 Community License | referenciadas en la model card, sin identificar |

No se dispone de datos de benchmarks comparables de alternativas de la misma categoría (modelos comprimidos de ~8 B) en la información proporcionada.

## Limitaciones y advertencias

- La model card advierte de que varias ramas del grid están degradadas en seguridad de forma deliberada: la compresión por sí sola eleva la tasa de éxito de ataques, y el objetivo del estudio es cuantificarlo.
- Es un artefacto de investigación, no un asistente desplegable; el propio autor recomienda tratarlo como sujeto experimental y evaluarlo antes de extraer conclusiones.
- Este checkpoint concreto corresponde a una ronda intermedia (7 de 10), por lo que no representa el resultado final de la ejecución.
- Riesgo de alucinación y de degradación de la coherencia: no cuantificado en la model card, pero esperable tras eliminar el 30,01 % de los parámetros densos.
- Sobre-rechazo macro de 0,3322 medido con WildGuard, lo que implica un coste de utilidad apreciable en conversación normal.
- Idioma y cobertura multilingüe no documentados; no hay garantía de comportamiento fuera del inglés.
- Licencia Llama 3.1 Community License: uso comercial sujeto a `LICENSE` y `USE_POLICY.md`, con las restricciones y obligaciones de atribución de Meta ("Built with Llama").
- No se publican cuantizaciones oficiales, plantillas de prompt ni configuración de generación recomendada, lo que complica la reproducibilidad de la inferencia.
- Los resultados de la búsqueda web proporcionada no contienen información relacionada con este modelo: son listados de libros de texto en hindi y no aportan datos técnicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Ficheros de licencia y política de uso incluidos en el repositorio: `LICENSE` y `USE_POLICY.md` (accesibles desde la pestaña de archivos del modelo)
- Paper, blog, repositorio o demo del método SVD-LLM o del procedimiento de intercambio: no disponibles en la información proporcionada
