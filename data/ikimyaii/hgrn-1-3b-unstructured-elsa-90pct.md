# ikimyaii/HGRN-1.3B-unstructured-ELSA-90pct

## Resumen

HGRN-1.3B-unstructured-ELSA-90pct es un artefacto de investigación publicado por el usuario ikimyaii en HuggingFace: el modelo base `fla-hub/hgrn-1.3B-100B` podado al 90 % de dispersión no estructurada mediante el código oficial de ELSA (paper arXiv:2510.01650). No es un modelo afinado para uso general, sino una línea base (*baseline*) para el proyecto EHWS, orientado a comparar métodos de poda sobre arquitecturas lineales recurrentes de la familia HGRN.

El modelo conserva 1.364.396.032 parámetros en el checkpoint (los ceros se almacenan físicamente en los pesos), con embeddings y `lm_head` sin podar, umbral de magnitud único por capa y filas desequilibradas. El resultado es una degradación severa de calidad: perplejidad de 213,97 en WikiText-2 frente a 11,81 del modelo denso, y precisión media cero-shot de 0,3623 frente a 0,4376.

Su interés es, por tanto, metodológico: documenta qué ocurre cuando se aplican los hiperparámetros de ELSA calibrados al 80 % de dispersión sobre un objetivo del 90 %, y sirve de referencia frente a las variantes semi-estructuradas (EHWS, ELSA row-wise) y a la versión reajustada al 90 % publicada por el mismo autor. Requiere `flash-linear-attention` y `trust_remote_code=True` para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (red neuronal recurrente lineal con compuertas jerarquicas, familia flash-linear-attention); 168 capas segun la model card |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE; dispersion no estructurada del 90 % medida) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se han publicado GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 5,5 GB; los ceros de la poda se almacenan en los pesos) |

## Arquitectura y entrenamiento

El modelo parte de `fla-hub/hgrn-1.3B-100B`, un transformer recurrente lineal de la familia HGRN implementado en la librería `flash-linear-attention`. Sobre ese checkpoint se aplicó el código oficial de ELSA con su proyección por defecto (`--admm_comparison_group=layer`), usando los ajustes que ELSA recomienda para HGRN-1.3B al 80 % de dispersión: learning rate 2e-4, lambda 1e-2, Adam con beta2 0,95, 4.096 pasos ADMM con paso z cada 32 pasos, batch de 8 con acumulación 1x8, precisión bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. El proceso completo requirió 5,5 horas en una única A100 de 40 GB.

La poda es no estructurada: cada una de las 168 capas emplea un umbral de magnitud único, de modo que las filas acaban con distinto número de valores no nulos. Los embeddings y la cabeza de lenguaje (`lm_head`) quedan intactos. La dispersión medida es exactamente del 90,00 %, pero las filas no están equilibradas: la fila más densa contiene de media 5,18 veces más valores no nulos que la fila media, y la peor capa llega a 9,73 veces. El autor advierte explícitamente que los hiperparámetros usados son los de ELSA al 80 % y que no funcionan bien al 90 %; la variante reajustada (`...-90pct-tuned`) obtiene 115,59 en WikiText-2 y 60,21 en C4.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje, heredadas del checkpoint base HGRN-1.3B.
- Razonamiento básico y respuesta a preguntas de opción múltiple, aunque con caída acusada respecto al denso (ARC-Easy baja de 0,5644 a 0,3127).
- Clasificación de pares de frases y tareas de inferencia textual (RTE 0,5271, prácticamente igual al denso).
- Comprensión lectora limitada: OpenBookQA cae de 0,2300 a 0,1160.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo *thinking*.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Uso previsto real: servir como línea base cuantitativa en experimentos de poda, no como modelo de producción.

## Casos de uso

- **Investigación en poda de redes**: punto de comparación directo contra EHWS row-wise, ELSA row-wise y ELSA unstructured reajustado, todos publicados por el mismo autor con el mismo protocolo de evaluación.
- **Reproducción de resultados de ELSA**: el autor documenta hiperparámetros, semilla, hardware y tiempo de ejecución, lo que permite replicar el experimento sobre HGRN-1.3B con el código de arXiv:2510.01650.
- **Estudio de desequilibrio de filas en dispersión no estructurada**: las métricas de 5,18x y 9,73x por capa permiten analizar cómo la poda por umbral global distribuye la densidad y qué capas concentran los valores supervivientes.
- **Análisis de la brecha entre dispersión nominal y aceleración real**: al almacenar los ceros, el checkpoint sirve para medir cuánto se pierde en calidad sin ganar throughput, argumento habitual a favor de la poda semi-estructurada.
- **Evaluación comparativa de pipelines**: el autor reevalúa los pesos con `eval_external.py` del repositorio EHWS, de modo que el modelo puede usarse para validar que dos pipelines de evaluación (ELSA y EHWS) coinciden (213,97/79,08 frente a 213,82/78,98).
- **Docencia y divulgación técnica**: ejemplo reproducible de hasta qué punto un método de poda calibrado para un régimen de dispersión falla al extrapolarlo a otro más agresivo.
- **No recomendado** para atención al cliente, generación de código, agentes ni ninguna carga en producción: la perplejidad de 213,97 en WikiText-2 lo desaconseja frontalmente.

## Benchmarks y rendimiento

Perplejidad con el código de evaluación de ELSA (WikiText-2 y C4, fp16), una ejecución con semilla 0:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (sin podar) | 11,81 | 16,09 |
| EHWS row-wise 90 % | 81,74 | 47,42 |
| ELSA row-wise 90 % (tuned) | 144,16 | 68,91 |
| **Este modelo (ELSA unstructured 90 %)** | **213,97** | **79,08** |

Reevaluación con el pipeline EHWS (`eval_external.py`) sobre los mismos pesos: 213,82 en WikiText-2 y 78,98 en C4.

Precisión cero-shot (lm-evaluation-harness, 0-shot):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,1971 |
| arc_easy | 0,5644 | 0,3127 |
| boolq | 0,5758 | 0,5966 |
| hellaswag | 0,3828 | 0,2616 |
| openbookqa | 0,2300 | 0,1160 |
| rte | 0,5379 | 0,5271 |
| winogrande | 0,5288 | 0,5249 |
| Media | 0,4376 | 0,3623 |

## Requisitos de hardware

- VRAM estimada: unos 2,7 GB en fp16/bf16 y unos 5,5 GB en fp32 para los 1.364 millones de parámetros; el repositorio ocupa 5,5 GB porque los ceros se almacenan en disco.
- La dispersión no estructurada no se traduce en ahorro de memoria ni de cómputo con kernels densos: no se debe esperar aceleración por el 90 % de ceros.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4090) es suficiente para inferencia en precisión reducida; el autor usó una A100 de 40 GB para el proceso de poda, no para inferencia.
- Despliegue: la vía documentada es `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y la librería `flash-linear-attention` instalada. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y la falta de pesos GGUF hace improbable el despliegue en llama.cpp/Ollama sin conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dispersión | WikiText-2 | C4 | Media 0-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| fla-hub/hgrn-1.3B-100B (denso) | 1,3B (aprox.) | 0 % | 11,81 | 16,09 | 0,4376 | no disponible | HuggingFace |
| Este modelo (ELSA unstructured 90 %) | 1.364.396.032 | 90 % no estructurada | 213,97 | 79,08 | 0,3623 | no disponible | HuggingFace |
| ELSA unstructured 90 % tuned (ikimyaii) | 1,3B (aprox.) | 90 % no estructurada | 115,59 | 60,21 | no disponible | no disponible | HuggingFace |
| ElSA row-wise 90 % tuned (ikimyaii) | 1,3B (aprox.) | 90 % semi-estructurada | 144,16 | 68,91 | no disponible | no disponible | HuggingFace |
| EHWS row-wise 90 % (ikimyaii) | 1,3B (aprox.) | 90 % semi-estructurada | 81,74 | 47,42 | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- **Calidad muy degradada**: perplejidad 18 veces peor que el denso en WikiText-2 (213,97 frente a 11,81) y media cero-shot 7,5 puntos por debajo (0,3623 frente a 0,4376). No es apto para uso en producción.
- **Hiperparámetros no adaptados**: el autor confirma que se usaron los ajustes de ELSA para el 80 % de dispersión sobre un objetivo del 90 %; los resultados no representan el mejor caso del método.
- **Desequilibrio de filas**: la fila más densa tiene 5,18 veces más valores no nulos que la media y la peor capa llega a 9,73x, lo que rompe cualquier supuesto de densidad uniforme.
- **Ceros almacenados**: el checkpoint no aporta compresión ni aceleración; su tamaño (5,5 GB) es el de un modelo denso.
- **Sesgos**: no documentados en la información disponible; al derivar de un modelo entrenado sobre C4, es previsible que herede sesgos del corpus, pero no hay evaluación al respecto.
- **Riesgo de alucinación**: alto por la degradación del modelado de lenguaje; no se han publicado evaluaciones de factualidad.
- **Idioma y contexto**: sin datos sobre idiomas soportados ni longitud de contexto; no asumir capacidades multilingües ni ventanas largas.
- **Licencia**: no disponible. Antes de cualquier uso, hay que verificar la licencia de `fla-hub/hgrn-1.3B-100B`, de la que este derivado hereda las restricciones.
- **Código remoto**: la carga exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el `configuration_*.py` y el `modeling_*.py` antes de desplegarlo.
- **Madurez**: 26 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin mantenimiento documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-ELSA-90pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Variante reajustada al 90 %: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-ELSA-90pct-tuned
- Variante ELSA row-wise 90 %: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-ELSA-90pct-tuned
- Variante EHWS row-wise 90 %: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-90pct
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Repositorio EHWS (rama semi-structured): https://github.com/KimiaGholami/EHWS/tree/main/semi-structured
- Librería flash-linear-attention: no se ha encontrado URL en la información proporcionada (referenciada como dependencia de carga)
