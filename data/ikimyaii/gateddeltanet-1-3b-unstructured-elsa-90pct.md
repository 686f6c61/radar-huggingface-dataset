# ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-90pct

## Resumen

`ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-90pct` es un artefacto de investigación: el modelo `m-a-p/1.3B-100B-GatedDeltaNet-pure` (1.466.343.808 parámetros, arquitectura GatedDeltaNet de atención lineal) podado al 90% de dispersión no estructurada con el código oficial de ELSA (arXiv:2510.01650). No es un modelo afinado ni un modelo listo para uso general: es la línea base ("baseline") que el autor usa para comparar su propio método de poda, EHWS. La poda afecta a las capas lineales, mientras que los embeddings y la `lm_head` se mantienen intactos, y los ceros se almacenan físicamente en los pesos.

El interés técnico está en que documenta de forma explícita y reproducible el coste de calidad de una poda agresiva sobre una arquitectura de atención lineal moderna, con datos de perplejidad (WikiText-2 y C4) y de exactitud zero-shot en siete tareas. La caída es severa: la perplejidad en WikiText-2 pasa de 10,31 a 46,76 y la media de exactitud zero-shot cae de 0,5123 a 0,3694. Además, la dispersión no estructurada no aporta ninguna ganancia de velocidad en inferencia estándar, porque los pesos se guardan densos con ceros.

Es relevante ahora porque GatedDeltaNet (familia de atención lineal con regla delta, presentada en ICLR 2025 y con una segunda iteración publicada por NVIDIA en 2026) es una de las alternativas activas a la atención cuadrática, y este repositorio sirve como referencia medida de hasta dónde se puede comprimir sin reentrenar. Con 33 descargas, licencia no declarada y sin idiomas documentados, debe tratarse exclusivamente como material de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con regla delta y compuertas), podada al 90% de dispersión no estructurada |
| Parametros totales | 1.466.343.808 (1,47 B) |
| Parametros activos | no aplica: no es un modelo MoE; el número de pesos no nulos por fila es variable |
| Longitud de contexto | no disponible (el proceso de poda usó secuencias de 2.048 tokens; la ventana del modelo base no está documentada en la información disponible) |
| Tipos de cuantizacion | no disponible (el autor evalúa en fp16/bf16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 5,9 GB) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia GatedDeltaNet, un bloque de atención lineal que combina compuertas de decaimiento con la regla delta para corregir el estado recurrente, planteado como mejora sobre Mamba2 en eficiencia y calidad de recuperación de memoria. El nombre del checkpoint base (`1.3B-100B-GatedDeltaNet-pure`) sugiere 1.300 millones de parámetros entrenados sobre 100.000 millones de tokens, aunque esa cifra procede de la nomenclatura del autor y no de documentación detallada en la información disponible. El checkpoint podado conserva 1,47 B de parámetros totales en safetensors.

El proceso de poda usó el código oficial de ELSA con su proyección por defecto (`--admm_comparison_group=layer`) y los hiperparámetros que ELSA empleó para HGRN-1.3B al 80%, sin ajustarlos por modelo: `lr` 2e-4, `lambda` 1e-2, Adam con `beta2` 0,95, 4.096 pasos ADMM con paso `z` cada 32 pasos, batch 8 (1 × 8 de acumulación), bf16, 32.768 secuencias de C4 de 2.048 tokens (unos 67,1 millones de tokens vistos), semilla 0. La ejecución completa costó 8,0 horas en una única A100 de 40 GB. Cada capa aplica un único umbral de magnitud, de modo que las filas quedan con distinto número de no nulos; los embeddings y la `lm_head` no se podan y la dispersión medida es del 90,00% exacto.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje causal, heredados del modelo base.
- Razonamiento básico, conocimiento factual y tareas de sentido común muy degradados respecto al modelo denso (ver benchmarks).
- No hay evidencia de soporte de tool calling ni de function calling en la información disponible.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo "thinking".
- Multilingüismo: no documentado; el entrenamiento de poda se hizo sobre C4, mayoritariamente inglés.
- Capacidad diferencial real: servir como referencia reproducible de poda no estructurada al 90% sobre una arquitectura de atención lineal.
- Inspección de máscaras: permite analizar el desequilibrio de no nulos por fila (el autor reporta 3,94× en la fila más densa respecto a la media, y 8,44× en la peor capa, sobre 240 capas).

## Casos de uso

- Línea base en experimentos de poda: cualquier artículo o tesis que proponga un método de compresión sobre GatedDeltaNet puede comparar contra estas perplejidades (46,76 en WikiText-2, 43,13 en C4) siguiendo el mismo protocolo de ELSA.
- Reproducción de resultados: el repositorio documenta hiperparámetros, semilla, hardware y tiempo, lo que permite replicar la poda al 90% en una sola A100 de 40 GB en unas 8 horas.
- Estudio de degradación por tarea: los datos de ARC, HellaSwag, OpenBookQA, Winogrande, BoolQ y RTE permiten analizar qué tipos de capacidad resisten mejor la poda (BoolQ y RTE apenas caen; ARC-easy y OpenBookQA se hunden).
- Investigación de kernels dispersos: al conservar los ceros en memoria, el checkpoint es útil para medir cuánto rendimiento se podría recuperar si existieran kernels que explotaran la dispersión no estructurada real de estas máscaras.
- Análisis de desequilibrio de máscaras: las 240 capas con umbral por capa permiten estudiar políticas de poda por fila frente a políticas balanceadas (comparables con la variante row-wise del mismo autor).
- Docencia y divulgación: ejemplo tangible de que la dispersión no estructurada al 90% sin reentrenamiento posterior destruye la calidad, útil para explicar por qué la poda agresiva requiere destilación o recuperación.
- Verificación de pipelines de evaluación: sirve para validar arneses propios (`lm-evaluation-harness`, `eval_external.py` de EHWS) contra números publicados.
- No se recomienda para generación de texto en producción, atención al cliente, código ni ninguna tarea con requisitos de calidad.

## Benchmarks y rendimiento

Perplejidad (fp16, código de evaluación de ELSA; una ejecución, semilla 0):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (`m-a-p/1.3B-100B-GatedDeltaNet-pure`) | 10,31 | 13,76 |
| EHWS row-wise 90% | 37,67 | 32,78 |
| ELSA row-wise 90% | 48,56 | 43,55 |
| **Este modelo (ELSA no estructurado 90%)** | **46,76** | **43,13** |

Reevaluación con el pipeline de EHWS sobre estos mismos pesos: 46,73 en WikiText-2 y 43,09 en C4 (coherente con la cifra anterior).

Exactitud zero-shot (`lm-evaluation-harness`, 0-shot):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,1860 |
| arc_easy | 0,7222 | 0,3662 |
| boolq | 0,6159 | 0,6162 |
| hellaswag | 0,4629 | 0,2792 |
| openbookqa | 0,2920 | 0,1300 |
| rte | 0,4982 | 0,4910 |
| winogrande | 0,6188 | 0,5170 |
| Media | 0,5123 | 0,3694 |

Lectura: BoolQ (+0,0003) y RTE (−0,0072) son prácticamente insensibles a la poda, mientras que ARC-easy pierde 35,6 puntos y OpenBookQA 16,2 puntos. No hay datos de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: unos 2,9 GB en fp16/bf16 (1,47 B × 2 bytes) y unos 5,9 GB en fp32, que coincide con el tamaño del repositorio. Ojo: la dispersión del 90% no reduce la VRAM porque los ceros están almacenados.
- GPU recomendadas: cualquier GPU con 8 GB o más basta para fp16; una A100 40 GB fue la usada para el proceso de poda (8,0 h), no para inferencia.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problema; también en GPUs de 4-6 GB si se cuantiza a 8 bits con herramientas genéricas (no validadas por el autor).
- Despliegue: `transformers` con `trust_remote_code=True` y la librería `flash-linear-attention` (`fla`) instalada, requisito explícito del autor. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama; la arquitectura `gated_deltanet` es personalizada y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. Al estar los ceros materializados en los tensores, el coste de cómputo es idéntico al de un modelo denso de 1,47 B; no se debe esperar aceleración por dispersión.
- Nota práctica: si `fla` no está instalado, la carga fallará; conviene fijar la versión de `transformers` y de `fla` para reproducibilidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Dispersión | WikiText-2 (PPL) | C4 (PPL) | Media zero-shot | Licencia |
|---|---|---|---|---|---|---|
| `m-a-p/1.3B-100B-GatedDeltaNet-pure` (denso) | 1,47 B | 0% | 10,31 | 13,76 | 0,5123 | no disponible |
| `ikimyaii/...-semi-structured-EHWS-90pct` | no disponible | 90% (row-wise) | 37,67 | 32,78 | no disponible | no disponible |
| `ikimyaii/...-semi-structured-ELSA-90pct` | no disponible | 90% (row-wise) | 48,56 | 43,55 | no disponible | no disponible |
| `ikimyaii/...-unstructured-ELSA-70pct` | no disponible | 70% (no estructured) | no disponible | no disponible | no disponible | no disponible |
| `ikimyaii/HGRN-1.3B-unstructured-ELSA-90pct` | no disponible | 90% (no estructured, otra arquitectura) | no disponible | no disponible | no disponible | no disponible |
| **Este modelo** | 1,47 B | 90% (no estructured) | 46,76 | 43,13 | 0,3694 | no disponible |

Interpretación: con el mismo 90% de dispersión, la poda row-wise de EHWS es claramente mejor en WikiText-2 que ELSA (37,67 frente a 48,56 y 46,76). En C4 la diferencia entre las dos variantes de ELSA es mínima (43,55 frente a 43,13). No hay datos publicados que comparen directamente con otras alternativas de atención lineal del mismo tamaño (Mamba2, HGRN) más allá del checkpoint HGRN del mismo autor.

## Limitaciones y advertencias

- Degradación severa de calidad: media zero-shot de 0,3694 frente a 0,5123 del denso; ARC-easy cae de 0,7222 a 0,3662 y OpenBookQA de 0,2920 a 0,1300. No es apto para producción.
- Sin aceleración real: los ceros se almacenan en los pesos, así que el modelo ocupa y computa como uno denso. La dispersión es una propiedad estadística del tensor, no una ventaja de rendimiento.
- Filas desequilibradas: la fila más densa tiene de media 3,94 veces los no nulos de la fila media, y hasta 8,44 veces en la peor capa (verificado en las 240 capas). Esto complica cualquier kernel que intente explotar la estructura.
- Licencia no declarada: no se puede asumir uso comercial. Al derivar del checkpoint base de `m-a-p`, habría que verificar la licencia de ese modelo antes de cualquier uso.
- Idiomas no documentados: el entrenamiento de poda usó C4 (principalmente inglés) y no hay evaluación multilingüe.
- Contexto no documentado: la poda se hizo con secuencias de 2.048 tokens; no hay garantía de comportamiento estable en ventanas mayores.
- Reproducibilidad limitada a una sola semilla: el autor indica explícitamente "one run, seed 0", sin barras de error.
- Sin datos de alucinación ni de sesgos: no hay evaluación de seguridad, toxicidad o factualidad en la información disponible; con esta caída de calidad, la tasa de alucinación es presumiblemente alta.
- Dependencia de código remoto: requiere `trust_remote_code=True` y `flash-linear-attention`, lo que implica ejecutar código del repositorio y fijar versiones para evitar roturas.
- Artefacto de investigación: 33 descargas y 0 likes; creado y actualizado en octubre de 2026. No hay mantenimiento ni soporte esperado.
- Riesgo de confusión: el nombre "1.3B" no coincide con los 1,47 B reales del safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-90pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Variante ELSA row-wise 90%: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-ELSA-90pct
- Variante EHWS row-wise 90%: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-90pct
- Variante ELSA no estructurada 70%: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-70pct
- Variante sobre HGRN-1.3B: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-ELSA-90pct
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Código de EHWS: https://github.com/KimiaGholami/EHWS/tree/main/semi-structured
- Implementación oficial de GatedDeltaNet (NVlabs, ICLR 2025): https://github.com/NVlabs/GatedDeltaNet
- Implementación oficial de GatedDeltaNet-2: https://github.com/NVlabs/GatedDeltaNet-2/
- Nota de NVIDIA sobre GatedDeltaNet-2: https://www.marktechpost.com/2026/05/24/nvidia-ai-releases-gated-deltanet-2-a-linear-attention-layer-that-decouples-erase-and-write-in-the-delta-rule/
