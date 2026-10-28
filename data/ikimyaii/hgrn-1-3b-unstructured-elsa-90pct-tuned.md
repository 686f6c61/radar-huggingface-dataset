# ikimyaii/HGRN-1.3B-unstructured-ELSA-90pct-tuned

## Resumen

Este repositorio contiene una versión podada al 90% de dispersidad no estructurada del modelo `fla-hub/hgrn-1.3B-100B`, una red recurrente lineal con puertas jerárquicas (HGRN) de 1.364.396.032 parámetros, desarrollada por el equipo de flash-linear-attention y entrenada sobre 100.000 millones de tokens. La poda la ha aplicado el usuario `ikimyaii` con el código oficial de ELSA (arXiv:2510.01650) y con hiperparámetros ajustados específicamente para este modelo en el régimen del 90%, de ahí el sufijo «tuned». El resultado es un checkpoint de investigación, no un modelo listo para producto.

El interés del artefacto es metodológico: sirve como baseline de dispersidad no estructurada frente a las variantes semi-estructuradas del mismo autor (EHWS y ELSA por filas), y permite reproducir con semilla fija (seed 0) un experimento de poda con ADMM de 4.096 pasos ejecutado en una sola A100 de 40 GB en 5,2 horas. La model card documenta con detalle el protocolo, la rejilla de ajuste y las métricas de perplejidad y zero-shot, algo poco habitual en checkpoints podados.

La contrapartida es una degradación severa: la perplejidad en WikiText-2 pasa de 11,81 a 115,59 (unas diez veces peor) y la media de zero-shot en siete tareas cae de 0,4376 a 0,3659. Además, al ser dispersidad no estructurada con los ceros almacenados en los pesos, el checkpoint no ahorra memoria ni acelera la inferencia respecto al modelo denso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (hierarchically gated recurrent network), red recurrente lineal con puertas de la familia flash-linear-attention; transformer no convencional, sin atención softmax estándar |
| Parámetros totales | 1.364.396.032 (dato real de safetensors) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada; la baseline densa del mismo autor figura en LLM Explorer con 2.048 tokens, y la calibración de la poda usó secuencias de 2.048 tokens |
| Tipos de cuantización | No se publican pesos cuantizados. El repo se distribuye en safetensors (5,5 GB, coherente con fp32); la conversión a bf16, fp16, 8 o 4 bits requeriría herramientas externas y no está validada por el autor |
| Idiomas soportados | No disponible. Los datos de calibración son C4 en inglés, lo que sugiere un sesgo claro hacia inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors; requiere `trust_remote_code=True` y la librería `flash-linear-attention` |

## Arquitectura y entrenamiento

La arquitectura de base es HGRN, un modelo recurrente lineal con compuertas jerárquicas que sustituye la atención softmax por una recurrencia con estado de tamaño constante, lo que da coste lineal por token en lugar de cuadrático. El checkpoint base, `fla-hub/hgrn-1.3B-100B`, fue entrenado por el equipo de flash-linear-attention sobre 100.000 millones de tokens. Sobre él se aplicó una poda de magnitud con umbral único por capa, de modo que cada fila conserva un número distinto de pesos no nulos; los embeddings y la `lm_head` quedan intactos y los ceros se guardan físicamente en el tensor, sin formato comprimido.

El procedimiento sigue el código oficial de ELSA con `--admm_comparison_group=layer`: lr 2e-4, lambda 1e-3 constante, Adam con beta2 0.999, 4.096 pasos ADMM con paso z cada 32 pasos, batch efectivo de 8 (1 × 8 de acumulación), precisión bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. El autor ajustó la rejilla a 90% porque los valores por defecto de ELSA para 80% rendían mucho peor en este modelo. No se documenta ninguna fase de reentrenamiento posterior a la poda. La dispersidad medida es exactamente 90,00% sobre las 168 matrices podadas, pero el reparto por filas está muy desbalanceado: la fila más densa tiene de media 5,76 veces más valores no nulos que la media, y en la peor capa la ratio llega a 9,71×.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base; sin ajuste por instrucciones ni por preferencias tras la poda.
- Razonamiento y conocimiento factual muy degradados: la media zero-shot cae casi siete puntos respecto al denso (0,3659 frente a 0,4376).
- Sin soporte documentado de tool calling ni de function calling.
- Sin soporte documentado de agentes, multi-step reasoning ni modos de razonamiento explícito.
- Sin capacidades multimodales: no hay visión, audio ni vídeo.
- Capacidades multilingües no documentadas; la calibración en C4 sugiere uso predominantemente en inglés.
- Perfil de despliegue ligero: ~1,36 B de parámetros y estado recurrente constante, lo que permite inferencia en GPU de consumo con poca VRAM.

## Casos de uso

- Baseline de investigación en poda no estructurada: sirve para comparar ELSA por capas frente a ELSA por filas y EHWS a una dispersidad fija del 90%, usando las perplejidades publicadas (115,59 en WikiText-2 y 60,21 en C4) como referencia reproducible con semilla 0.
- Estudio del desbalance de filas: el checkpoint permite analizar por qué la dispersidad no estructurada con umbral por capa genera filas hasta 9,71× más densas que la media y cómo afecta eso a la calidad.
- Reproducción de pipelines de evaluación: útil para validar herramientas de medida de perplejidad y de zero-shot con lm-evaluation-harness sobre pesos dispersos almacenados en denso.
- Docencia y divulgación sobre compresión de modelos: ejemplo tangible de que una poda al 90% sin reentrenamiento multiplica por diez la perplejidad, con tablas de resultados ya publicadas.
- Prototipado de arquitecturas recurrentes lineales en hardware modesto: al ocupar ~2,7 GB en bf16, permite probar la API de flash-linear-attention en una GPU de 8-12 GB.
- Experimentos de exportación a formatos comprimidos: sirve como caso de prueba para conversores a GGUF o a kernels dispersos, ya que los ceros están presentes y son detectables.
- Aviso: no es adecuado para atención al cliente, generación de código en producción ni tareas que exijan precisión factual, dado el nivel de degradación medido.

## Benchmarks y rendimiento

Perplejidad con el código de evaluación de ELSA (WikiText-2 y C4, fp16), una ejecución con semilla 0:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (`fla-hub/hgrn-1.3B-100B`) | 11,81 | 16,09 |
| EHWS row-wise 90% | 81,74 | 47,42 |
| ELSA row-wise 90% (tuned) | 144,16 | 68,91 |
| **Este modelo (ELSA unstructured 90%, tuned)** | **115,59** | **60,21** |

Reevaluación con el pipeline de EHWS (`eval_external.py`) sobre estos mismos pesos: 115,53 en WikiText-2 y 60,19 en C4, prácticamente idéntico.

Precisión zero-shot (lm-evaluation-harness, 0-shot):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,1826 |
| arc_easy | 0,5644 | 0,3367 |
| boolq | 0,5758 | 0,6196 |
| hellaswag | 0,3828 | 0,2637 |
| openbookqa | 0,2300 | 0,1200 |
| rte | 0,5379 | 0,5235 |
| winogrande | 0,5288 | 0,5154 |
| Media | 0,4376 | 0,3659 |

Rejilla de ajuste publicada por el autor (ELSA no estructurado, 90%):

| Adam beta2 | lr | lambda | WikiText-2 | C4 |
|---|---|---|---|---|
| 0,95 | 2e-4 | 1e-2 | 213,97 | 79,08 |
| 0,999 | 2e-4 | 1e-2 | 281,20 | 96,97 |
| 0,999 | 2e-4 | 1e-3 | 115,59 | 60,21 |

No se han publicado resultados de latencia ni de throughput en la información disponible.

## Requisitos de hardware

- Pesos en fp32 tal como se distribuyen: ~5,5 GB de repositorio, sin ahorro respecto al denso pese a la dispersidad.
- Pesos en bf16 o fp16: ~2,73 GB. VRAM total estimada para inferencia con contexto de 2.048 tokens: 4-5 GB (estimación, no medida por el autor).
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 sin problema; en tarjetas de 8 GB es viable en bf16 con margen ajustado.
- La poda se ejecutó en una A100 40 GB durante 5,2 horas; ese dato corresponde al proceso de poda, no a la inferencia.
- Despliegue recomendado: `transformers` con `trust_remote_code=True` más la librería `flash-linear-attention` instalada; el autor no documenta otra vía.
- Soporte en vLLM, TGI, llama.cpp u Ollama: no disponible ni confirmado; la arquitectura HGRN requiere soporte específico de kernels, por lo que la conversión a GGUF no está garantizada.
- La dispersidad no aporta aceleración en hardware denso: los ceros se almacenan y se computan, así que la latencia esperada es la del modelo denso equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Dispersidad | WikiText-2 | C4 | Media 0-shot | Licencia |
|---|---|---|---|---|---|---|
| Este modelo (ELSA unstructured 90%, tuned) | 1,36 B | 90% no estructurada | 115,59 | 60,21 | 0,3659 | No disponible |
| `ikimyaii/HGRN-1.3B-semi-structured-EHWS-90pct` | 1,36 B | 90% semi-estructurada (filas) | 81,74 | 47,42 | No disponible | No disponible |
| `ikimyaii/HGRN-1.3B-semi-structured-ELSA-90pct-tuned` | 1,36 B | 90% semi-estructurada (filas) | 144,16 | 68,91 | No disponible | No disponible |
| `fla-hub/hgrn-1.3B-100B` (denso) | 1,36 B | 0% | 11,81 | 16,09 | 0,4376 | No disponible |

En esta comparativa, la variante EHWS por filas es la mejor de las tres podadas al 90% en ambas perplejidades, mientras que este checkpoint se sitúa en un punto intermedio: mejor que ELSA por filas, peor que EHWS. Frente al denso, todas pierden entre 7 y 12 veces en perplejidad. No se dispone de datos para comparar con modelos densos de tamaño similar de otros linajes.

## Limitaciones y advertencias

- Degradación severa de calidad: perplejidad en WikiText-2 de 115,59 frente a 11,81 del denso, y caída de 7,2 puntos en la media zero-shot.
- El desbalance de filas (hasta 9,71× en la peor capa) hace que la dispersidad nominal del 90% no se traduzca en un reparto homogéneo del cómputo.
- Sin ganancia práctica de memoria ni de velocidad: los ceros se almacenan en los pesos y no hay kernels dispersos asociados.
- Riesgo alto de alucinación y de errores factuales; no hay ajuste por instrucciones ni por preferencias, por lo que no debe usarse como asistente conversacional.
- Idiomas no documentados; el sesgo hacia inglés derivado de C4 limita el uso en castellano, y no hay evaluación multilingüe.
- Licencia no especificada: no se puede asumir uso comercial permitido. La licencia del modelo base tampoco figura en la información disponible.
- Resultados de una sola semilla (seed 0) y de una única ejecución; no hay intervalos de confianza ni repeticiones.
- Modelo de investigación con 22 descargas y 0 likes: sin validación independiente por parte de la comunidad.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor al cargar el modelo.
- El sufijo «tuned» se refiere al ajuste de hiperparámetros de ELSA, no a un fine-tuning instructivo; es un error frecuente de interpretación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-ELSA-90pct-tuned
- Modelo base denso: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Variante ELSA no estructurada sin ajustar (configuración por defecto de ELSA): https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-ELSA-90pct
- Variante ELSA semi-estructurada por filas: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-ELSA-90pct-tuned
- Variante EHWS semi-estructurada por filas: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-90pct
- Artículo de ELSA: https://arxiv.org/abs/2510.01650
- Repositorio de EHWS (código de evaluación y poda semi-estructurada): https://github.com/KimiaGholami/EHWS/tree/main/semi-structured
- Librería requerida para cargar el modelo (flash-linear-attention): https://github.com/fla-org/flash-linear-attention
- Ficha de la baseline densa en LLM Explorer: https://llm-explorer.com/model/ikimyaii%2Fhgrn-1.3B-dense-baseline,7LYYStHHXgTcslfsAFK4Gl
