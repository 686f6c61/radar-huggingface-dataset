# MatterWaveAI/helmholtz-omni-b0.7.0-10m

## Resumen

HELMHOLTZ-Omni-b0.7.0-10m es un modelo experimental any-to-any desarrollado por MatterWaveAI que se presenta como una arquitectura predictiva conjunta multimodal (Omni-JEPA, Joint-Embedding Predictive Architecture) con capacidades declaradas para cinco modalidades: texto, visión, audio, síntesis de voz a 16 kHz y rejillas espaciales 2D. Según la model card, integra estas modalidades en un espacio de fase ortogonal compartido, con aproximadamente 22,1 millones de parámetros almacenados y una capacidad densa equivalente de unos 54 millones, sin matrices lineales densas ni capas convolucionales.

El modelo se posiciona como el escalón de 10 millones de parámetros dentro de la familia HELMHOLTZ-1-Omni y se construye sobre `MatterWaveAI/helmholtz-jepa-b0.7.0-10m`. Su propuesta técnica se centra en la alineación «platónica» de representaciones entre modalidades y perspectivas de razonamiento (GLOSS, SEE, SAY, DO, KNOW), con métricas declaradas de alineación SO(D), CKA lineal y recuperación cruzada zero-shot.

Es relevante ahora porque representa una línea de investigación poco convencional (world models rotacionales, JEPA, representaciones compartidas) publicada como vista previa. Cabe advertir que la model card indica explícitamente que los pesos, los detalles de implementación y el código fuente están retenidos durante el ciclo de publicación escalonado, por lo que el modelo no es utilizable tal cual a pesar de estar publicado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omni-JEPA rotacional multimodal (rotational transformer / JEPA); sin matrices lineales densas ni capas convolucionales según el autor |
| Parametros totales | ~22,1 M almacenados (~54 M de capacidad densa equivalente, según el autor) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos están retenidos según la model card) |

## Arquitectura y entrenamiento

La arquitectura declarada es una variante de JEPA (Joint-Embedding Predictive Architecture) denominada Omni-JEPA, con un diseño «rotacional» que, según el autor, opera en un espacio de fase ortogonal compartido y prescinde de matrices lineales densas y de capas convolucionales. El modelo unifica cinco modalidades (texto, visión, audio ASR, estado de vocoder TTS a 16 kHz y rejillas 2D tipo ARC-AGI-2) junto con cinco perspectivas de razonamiento socrático, totalizando 2.500 representaciones por eje (500 conceptos × 5 modalidades y 500 conceptos × 5 vistas). Se presenta como un «platonic world model» y «cross-modal trajectory judge».

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles de implementación, ya que la model card indica que los pesos, la implementación y el código fuente están retenidos durante el ciclo de publicación escalonado. Las innovaciones técnicas mencionadas (alineación SO(D), recurrencia selectiva rotacional O(1) en modelos hermanos de la familia) no están documentadas con suficiente detalle para esta variante de 10 M.

## Capacidades

- Generación y procesamiento multimodal any-to-any según la etiqueta de pipeline: texto, visión, audio y rejillas espaciales 2D.
- Síntesis de voz (text-to-speech) a 16 kHz, según la model card.
- Reconocimiento de voz (audio ASR) dentro del espacio compartido de representaciones.
- Razonamiento sobre rejillas espaciales 2D orientado a tareas tipo ARC-AGI-2.
- Verificación de rollouts relacionales multi-hop y de sentido común físico/causal (según benchmarks declarados por el autor).
- Routing de acciones para agentes con defensa frente a deriva (MPC), según el autor.
- Perspectivas de razonamiento socrático (GLOSS, SEE, SAY, DO, KNOW) integradas en el mismo manifold.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en representaciones multimodales compartidas: el modelo sirve como banco de pruebas para estudiar alineación entre modalidades mediante métricas como mKNN y CKA, aunque los pesos no estén disponibles públicamente.
- Evaluación de world models en tareas de razonamiento físico y causal: los benchmarks declarados de «causal science & physical commonsense» permiten comparar con otros enfoques de modelado del mundo.
- Inducción de reglas en rejillas 2D: aplicación a tareas tipo ARC-AGI-2 para estudiar generalización espacial en modelos pequeños.
- Routing de acciones en agentes: el componente de «MPC action routing & drift defense» es relevante para pipelines de agentes que necesitan seleccionar acciones con verificación multi-paso.
- Síntesis de voz integrada: el estado de vocoder a 16 kHz permitiría, en principio, un pipeline TTS unificado con el resto de modalidades, si los pesos estuvieran disponibles.
- Verificación factual y multi-hop: el modelo se plantea como «trajectory judge» para validar cadenas de razonamiento en sistemas RAG o agentes.
- Reproducción de experimentos de alineación SO(D): útil para grupos que investiguen geometría de representaciones y espacios de fase ortogonales.

## Benchmarks y rendimiento

Los resultados proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente. Se presentan a continuación.

| Benchmark (declarado por el autor) | Elementos evaluados | Resultado |
|---|---|---|
| Alineación platónica 5 modalidades + 5 vistas (mKNN medio, k=10) | 5.000 representaciones | 0,9778 medio |
| CKA lineal | 5.000 representaciones | 0,9999 |
| Alineación SO(D) | 5.000 representaciones | 0,9999 |
| Recuperación cruzada zero-shot Top-1 | 5.000 | 100,0 % (5.000/5.000) |
| Multi-hop relational rollout verification (XL-smol) | 1.000 registros / 2.000 preguntas | 100,00 % Top-1 |
| Causal science & physical commonsense (XL-smol) | 1.000 registros / 2.000 preguntas | 100,00 % Top-1 |
| Single-hop factual world-model verification (XL-smol) | 1.000 registros / 2.000 preguntas | 100,00 % Top-1 |
| 4-mode Socratic & epistemic verification (XL-smol) | 1.000 registros / 2.000 preguntas | 100,00 % Top-1 |
| 2D visual-spatial rule induction (ARC-AGI-2, XL-smol) | 600 tareas / 3.600 preguntas | 100,00 % Top-1 (pass@2 = 100,0 %) |
| Agent MPC action routing & drift defense (XL-smol) | 403 trayectorias / 1.209 preguntas | 99,75 % Top-1 (pass@2 = 100,0 %) |
| Agregado 6 suites XL-smol (macro / micro) | 5.003 registros / 12.809 preguntas | 99,96 % macro / 99,98 % micro |
| Benchmark consolidado 12 dominios (XL-smol) | 10.130 registros / 27.487 preguntas | 86,51 % macro / 79,97 % core micro |
| Language & math reasoning (SLM-Bench, 9 tareas MC) | 13.144 | 44,57 % → 49,28 % |
| GSM8K 4-way | 500 | 95,80 % (PPL 25,28) |

No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~22,1 M de parámetros almacenados, en fp16 ocuparía del orden de decenas de MB, pero al no publicarse pesos ni formato no puede confirmarse.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero no verificable al no haber pesos publicados.
- Opciones de despliegue: la librería declarada es `transformers`, pero los pesos y el código están retenidos según la model card, por lo que no hay despliegue posible (vLLM, llama.cpp, Ollama o TGI) en el momento de redactar esta ficha.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (Omni-JEPA de ~10 M) en la documentación proporcionada. La familia incluye variantes como `helmholtz-1`, `helmholtz-1-omni`, `helmholtz-mamba-1` y `helmholtz-rnn-1`, pero no se aportan especificaciones comparables detalladas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| HELMHOLTZ-Omni-b0.7.0-10m | ~22,1 M almacenados (~54 M densos equivalentes) | no disponible | Apache 2.0 | Retenidos según la model card |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos, la implementación y el código fuente están retenidos según la model card; el modelo no es ejecutable en la práctica a pesar de estar publicado.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente; los resultados de 100 % en múltiples suites deben interpretarse con cautela.
- Las métricas de alineación (mKNN, CKA, SO(D)) se calculan sobre un banco interno de 5.000 representaciones, no sobre benchmarks estándar de la comunidad.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación más allá de lo indicado en la model card.
- No se especifica la longitud de contexto, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Aunque la licencia es Apache 2.0, la retención de pesos limita cualquier uso comercial o de producción hasta que se publiquen.
- El rendimiento declarado en SLM-Bench (44,57 % → 49,28 %) es bajo en comparación con modelos de lenguaje convencionales, lo que sugiere que el modelo no está orientado a tareas lingüísticas generales.
- El tamaño (~22 M) limita severamente la calidad de generación de texto libre y de código en comparación con modelos de miles de millones de parámetros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-omni-b0.7.0-10m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-jepa-b0.7.0-10m
- Familia HELMHOLTZ-1-Omni: https://huggingface.co/MatterWaveAI/helmholtz-1-omni
- HELMHOLTZ-1: https://huggingface.co/MatterWaveAI/helmholtz-1
- HELMHOLTZ-Mamba-1: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- HELMHOLTZ-RNN-1: https://huggingface.co/MatterWaveAI/helmholtz-rnn-1
- Modelos con etiqueta matterwave: https://huggingface.co/models?other=matterwave
- Referencia arXiv citada en la familia: arxiv:2610.39302 (no verificada)
