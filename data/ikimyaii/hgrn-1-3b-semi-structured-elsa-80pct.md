# ikimyaii/HGRN-1.3B-semi-structured-ELSA-80pct

## Resumen

HGRN-1.3B-semi-structured-ELSA-80pct es un checkpoint de investigación publicado por el usuario ikimyaii en HuggingFace. Consiste en el modelo base fla-hub/hgrn-1.3B-100B (arquitectura HGRN, familia de recurrentes lineales con puertas jerárquicas, ~1.364 millones de parámetros) al que se le ha aplicado una poda semi-estructurada del 80 % mediante ELSA, el código oficial del artículo arXiv:2510.01650. El resultado conserva exactamente el 20 % de los pesos de cada fila en cada una de las 168 capas lineales podadas (dispersidad medida: 79,98 %), manteniendo intactos los embeddings y el `lm_head`.

El interés del modelo no es su calidad final, sino su valor como referencia experimental. El propio autor lo describe como baseline para EHWS (un método alternativo de poda), y publica tanto perplejidad como precisión zero-shot frente al modelo denso y frente a las variantes EHWS row-wise y ELSA unstructured. Los números muestran una degradación severa: la perplejidad en WikiText-2 pasa de 11,81 (denso) a 58,79, y la media de siete tareas zero-shot cae de 0,4376 a 0,3687.

Es relevante ahora porque permite reproducir y comparar metodologías de poda sobre arquitecturas lineales recurrentes (no transformer), un área con relativamente pocos checkpoints públicos y donde los efectos de la dispersidad estructurada por filas están poco caracterizados. No es un modelo apto para producción: es una pieza de ingeniería experimental con pesos que almacenan explícitamente los ceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (recurrente lineal con puertas jerárquicas), según el tag `hgrn` y el modelo base `fla-hub/hgrn-1.3B-100B`; requiere `flash-linear-attention` |
| Parametros totales | 1.364.396.032 (dato real de los safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE. Tras la poda, solo el 20 % de los pesos de las capas lineales es distinto de cero (dispersidad medida 79,98 %) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales (ni GGUF, ni AWQ, ni GPTQ). El repositorio contiene únicamente safetensors; el tamaño del repo (5,5 GB) es coherente con pesos almacenados en fp32 |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base se entrenó con 100B tokens según su nombre, sin desglose público en esta ficha) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`trust_remote_code=True` necesario para cargar) |

## Arquitectura y entrenamiento

El modelo parte de HGRN-1.3B-100B, un modelo de ~1.360 millones de parámetros de la familia HGRN (Hierarchically Gated Recurrent Linear Unit), incluida en el ecosistema `flash-linear-attention` (fla-hub). No es un transformer estándar: se trata de una arquitectura recurrente lineal con compuertas, lo que implica dependencias de código personalizadas (`import fla`) y kernels propios en lugar de atención cuadrática. Sobre ese checkpoint se aplicó un proceso de poda semi-estructurada por filas: cada fila de cada capa lineal podada retiene el mismo número de pesos (el top 20 % en magnitud), verificado en las 168 capas podadas. Los embeddings y el `lm_head` no se podan, y los ceros se almacenan físicamente en los tensores, por lo que no hay reducción de huella de memoria.

El procedimiento de poda sigue la implementación oficial de ELSA con proyección row-wise (`--admm_comparison_group=row`): optimizador Adam con lr 2e-4, lambda 1e-2, beta2 0.95, 4.096 pasos ADMM con paso z cada 32 iteraciones, batch de 8 (con 8 acumulaciones, 1 × 8), precisión bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. El coste computacional del proceso fue de 9,4 horas en una única A100 de 40 GB. No se aplicó ningún fine-tuning posterior de recuperación, ni RLHF/DPO: es una poda post-entrenamiento pura sobre un modelo ya preentrenado, ejecutada una sola vez con semilla 0.

## Capacidades

- Generación de texto autoregresiva como modelo causal (`AutoModelForCausalLM`), heredada del checkpoint base HGRN-1.3B-100B.
- Razonamiento y respuesta a preguntas de opción múltiple en inglés, con rendimiento medido muy por debajo del denso (ver benchmarks).
- Inferencia eficiente en memoria conceptual por su naturaleza recurrente lineal, aunque la poda aplicada no reduce el número de parámetros almacenados.
- Carga y ejecución mediante `transformers` con `trust_remote_code=True` y la dependencia `flash-linear-attention`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe, ni visión, ni audio, ni modo "thinking".
- Capacidad diferencial: servir como objeto de estudio de dispersidad estructurada por filas (misma máscara por fila) en capas lineales de una arquitectura recurrente.

## Casos de uso

- Baseline de investigación en poda: punto de comparación reproducible (semilla 0, hiperparámetros publicados) frente a métodos como EHWS, midiendo perplejidad en WikiText-2 y C4 con el mismo protocolo de evaluación.
- Estudio de dispersidad semi-estructurada por filas: al garantizar el mismo número de no-ceros en cada fila de las 168 capas podadas, permite analizar el impacto de máscaras regulares sin la variabilidad de la poda no estructurada.
- Ablación de métodos de poda sobre arquitecturas no transformer: útil para comprobar si las conclusiones obtenidas en transformers se trasladan a recurrentes lineales con compuertas.
- Desarrollo y validación de kernels dispersos: el checkpoint almacena los ceros explícitamente, lo que facilita testear kernels de sparse GEMM y verificar la coincidencia numérica frente a la implementación densa.
- Evaluación de la degradación por tarea: la tabla zero-shot (ARC, BoolQ, HellaSwag, OpenBookQA, RTE, Winogrande) permite estudiar qué tipos de tarea toleran mejor una poda agresiva al 80 %.
- Docencia y divulgación: ejemplo compacto (5,5 GB) y de bajo coste de inferencia para explicar pipelines ADMM de poda y sus efectos sobre la calidad del lenguaje.
- Reproducción de resultados: el paquete `eval_external.py` del repositorio EHWS permite re-puntuar estos pesos exactos y contrastar cifras publicadas (58,85 / 40,35 en WikiText-2 / C4 con su pipeline).

## Benchmarks y rendimiento

Perplejidad con el código de evaluación de ELSA (WikiText-2 y C4, fp16), una ejecución con semilla 0:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (HGRN-1.3B-100B) | 11,81 | 16,09 |
| EHWS row-wise 80 % | 40,31 | 29,82 |
| **Este modelo (ELSA row-wise 80 %)** | **58,79** | **40,30** |
| ELSA unstructured 80 % (lambda 1e-3) | 54,72 | 35,98 |

Re-evaluación con el pipeline de EHWS (`eval_external.py`, mismos pesos, protocolo ELSA en fp16): WikiText-2 58,85 y C4 40,35, consistente con la cifra original.

Precisión zero-shot (lm-evaluation-harness, 0-shot):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,1894 |
| arc_easy | 0,5644 | 0,3683 |
| boolq | 0,5758 | 0,5355 |
| hellaswag | 0,3828 | 0,2931 |
| openbookqa | 0,2300 | 0,1620 |
| rte | 0,5379 | 0,5235 |
| winogrande | 0,5288 | 0,5091 |
| **Media** | **0,4376** | **0,3687** |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (1.364 M de parámetros): ~5,5 GB si se carga tal cual está en el repositorio (coherente con fp32); ~2,7 GB en fp16/bf16; ~1,4 GB en int8; ~0,7 GB en int4. Estas cifras son estimaciones por tamaño de parámetros: el autor no las publica y la poda no las reduce, porque los ceros se almacenan.
- GPU recomendadas: cualquier GPU con ≥8 GB de VRAM para fp16. El proceso de poda se ejecutó en una A100 40 GB durante 9,4 horas, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes; en fp16 sobra capacidad.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` más `flash-linear-attention` instalado, que es el único camino documentado. No hay soporte verificado en vLLM, llama.cpp, Ollama ni TGI para esta arquitectura; no se han publicado ficheros GGUF. La cuantización a 4/8 bits requeriría herramientas genéricas (por ejemplo bitsandbytes) y no está validada por el autor.
- Latencia y throughput: no disponibles. Al no haber kernels de sparse GEMM integrados en los stacks habituales, no cabe esperar aceleración por la dispersidad del 80 %; el coste será similar al del modelo denso en fp32/fp16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ppl WikiText-2 | Media zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fla-hub/hgrn-1.3B-100B (denso) | 1,36 B | No disponible | 11,81 | 0,4376 | No disponible | HuggingFace |
| ikimyaii/HGRN-1.3B-semi-structured-EHWS-80pct | 1,36 B | No disponible | 40,31 | No disponible | No disponible | HuggingFace |
| ikimyaii/HGRN-1.3B-unstructured-ELSA-80pct-lam1e-3 | 1,36 B | No disponible | 54,72 | No disponible | No disponible | HuggingFace |
| **Este modelo** | 1,36 B | No disponible | 58,79 | 0,3687 | No disponible | HuggingFace |

Frente a otras familias de ~1,3 B parámetros (Llama 3.2 1B, Qwen2.5 1.5B, SmolLM2 1.7B), no hay datos comparables en la información disponible: ni el autor ni la búsqueda web proporcionan resultados cruzados con esos modelos.

## Limitaciones y advertencias

- Degradación de calidad severa: la perplejidad en WikiText-2 se multiplica por ~5 respecto al denso (58,79 frente a 11,81) y la media zero-shot cae 6,9 puntos absolutos (0,4376 → 0,3687). ARC-easy pierde casi 20 puntos (0,5644 → 0,3683).
- Es peor que las alternativas del mismo autor: tanto EHWS row-wise (40,31) como ELSA unstructured (54,72) superan a este checkpoint en WikiText-2. El propio autor lo etiqueta como baseline, no como modelo final.
- Riesgo elevado de alucinación y de generación incoherente por la poda al 80 % sin recuperación posterior; no debe usarse en tareas de facto.
- Los ceros se almacenan en los tensores: no hay ahorro de memoria ni de ancho de banda, y sin kernels dispersos tampoco hay ahorro de cómputo. El "80 % de dispersidad" es nominal a efectos prácticos.
- Licencia no disponible: no se puede asumir uso comercial. La licencia del modelo base tampoco se declara en esta ficha, por lo que la cadena de derechos es incierta.
- Idiomas no declarados: no hay evidencia de calidad multilingüe; las evaluaciones publicadas son en inglés.
- Longitud de contexto no documentada: planificar cualquier uso con texto largo es arriesgado.
- Requiere código remoto (`trust_remote_code=True`) y la dependencia `flash-linear-attention`; la integración con stacks de serving estándar no está soportada ni verificada.
- Un único run con semilla 0: no hay intervalo de confianza ni réplicas que permitan valorar la varianza de las métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-ELSA-80pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Variante EHWS row-wise 80 %: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-80pct
- Variante ELSA unstructured 80 %: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-ELSA-80pct-lam1e-3
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Repositorio de código EHWS (rama semi-structured): https://github.com/KimiaGholami/EHWS/tree/main/semi-structured
