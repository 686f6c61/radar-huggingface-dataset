# cc1244578151/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 GSQ-RCO Coder es una compresión orientada a capacidades del modelo base DeepSeek-V4.1-Flash-1017, un mixture-of-experts (MoE) de 763,2B parámetros totales (551,9B en el transformer). El autor del repositorio, cc1244578151, publica una build en formato GGUF que combina dos técnicas complementarias: poda de expertos (se eliminan 192 de los 384 expertos enrutados por capa) y cuantización de precisión mixta (los expertos restantes conservan la cuantización por tensor de la build IQ2_XXS, 2,00 bpw). El resultado almacena el transformer en 72,1 GB, frente a los 138,2 GB de la build sin podar.

La relevancia de esta release es que la reducción de capacidad no es uniforme: la calibración se dirige explícitamente a código, uso agéntico de herramientas, contexto largo y visión, de modo que los expertos retenidos son los que sostienen esos dominios. Según la model card, el modelo conserva el 94,8% de la puntuación del base en SWE-bench Verified y el 98,7% en LiveCodeBench v6, medido con esfuerzo de razonamiento 50. Es, por tanto, una alternativa pensada para despliegue con recursos limitados en flujos de trabajo de código y agentes, no para uso generalista.

El modelo base incorpora una arquitectura MoE con 384 expertos enrutados por capa y 6 activos por token, además de dos tablas de búsqueda Engram (110,6 GB, compartidas con la release sin podar) que se leen una fila por token y pueden permanecer en disco. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados por capa (6 activos por token), poda de expertos y cuantización de precisión mixta; tablas Engram de búsqueda |
| Parametros totales | 763,2B (551,9B en el transformer; 196,6B en tablas Engram a 4,50 bpw) |
| Parametros activos | 6 de 384 expertos enrutados por token (modelo base); el modelo podado retiene 192 de 384 expertos por capa |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantización por tensor heredada de IQ2_XXS (2,00 bpw medio en los 280,1B parámetros retenidos, 2,06 bits efectivos); tensores densos en mayor precisión; 1,05 bits por parámetro efectivos sobre el transformer original |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 183,7 GB; transformer en 72,1 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 384 expertos enrutados por capa y 6 activos por token, lo que concentra la mayor parte de los parámetros en los expertos mientras solo una fracción se ejecuta en cada token. Sobre esa base, esta release aplica poda de expertos: se eliminan 192 de los 384 expertos por capa (el 50% de los parámetros de expertos enrutados), lo que reduce tamaño de fichero y memoria residente y restringe el router a un pool menor de candidatos. La poda es distinta de la cuantización: elimina parámetros en lugar de reducir su precisión, y ambas técnicas se combinan aquí.

La selección de expertos se realizó con RCO (paper arXiv:2605.00649, código en IST-DASLab/RCO), optimizando la divergencia KL entre la salida del modelo comprimido y la del original sobre un conjunto de calibración. La cuantización de los expertos retenidos emplea GSQ (paper arXiv:2604.18556, código en IST-DASLab/GSQ), con los tipos por tensor de la build IQ2_XXS. Como los expertos se especializan, la importancia de cada uno depende de la distribución de entradas: el conjunto de calibración determina qué capacidades sobreviven, y en esta release está orientado a código, uso agéntico de herramientas, contexto largo y visión. La degradación fuera de ese conjunto se asume como coste aceptado del método. No se dispone de datos sobre el número de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno.
- Generación y razonamiento sobre código, con resultados destacados en LiveCodeBench v6 y SWE-bench Verified según la model card.
- Uso agéntico de herramientas y trayectorias multi-paso sobre repositorios reales (evaluado en SWE-bench Verified).
- Procesamiento de imagen y texto (pipeline image-text-to-text, etiqueta vision).
- Contexto largo (la calibración incluye esta capacidad, aunque la longitud exacta de ventana no está disponible).
- Razonamiento con esfuerzo configurable (las métricas se midieron a esfuerzo de razonamiento 50).
- Capacidades multilingües: no disponible.

## Casos de uso

- Reparación automática de bugs en repositorios: el modelo puede recorrerse un repositorio, localizar el fallo y proponer un parche, apoyándose en su retención del 94,8% en SWE-bench Verified y en el soporte de trayectorias agénticas multi-paso.
- Generación de código en pipelines de CI/CD: integrado como paso de revisión o de síntesis de tests, con 88,57 en LiveCodeBench v6, que mide generación de problemas de código de forma aislada.
- Asistentes de programación en estación de trabajo: al ocupar 72,1 GB el transformer y poder residir las tablas Engram en disco, es viable en equipos con suficiente memoria unificada o VRAM, sin depender de un clúster.
- Agentes autónomos de resolución de tareas: el modelo combina uso de herramientas, razonamiento multi-paso y contexto largo, adecuado para orquestadores que encadenan llamadas a APIs y edición de ficheros.
- Análisis de capturas e interfaces en flujos de desarrollo: la capacidad visión permite interpretar diagramas, errores en pantalla o maquetas y traducirlos a código o a instrucciones.
- Documentación técnica asistida: generación de docstrings, guías de API y notas de versión a partir del código y de imágenes de arquitectura, aprovechando el contexto largo.
- Revisión de código en pull requests: detección de patrones problemáticos y sugerencias de refactorización dentro de un pipeline de revisión automatizada.

## Benchmarks y rendimiento

| Benchmark | Base (FP8 / FP4) | GSQ-RCO Coder (72,1 GB, 1,05 bpw) | Retención |
|---|---|---|---|
| SWE-bench Verified | 81,20 | 77,00 | 94,8% |
| LiveCodeBench v6 | 89,71 | 88,57 | 98,7% |

Todas las cifras se midieron con esfuerzo de razonamiento 50. No se han publicado en la información disponible resultados de MMLU, GSM8K ni HumanEval.

## Requisitos de hardware

- VRAM estimada: 72,1 GB para el transformer en su cuantización actual; las tablas Engram (110,6 GB) pueden mantenerse en disco y leerse una fila por token, por lo que no exigen memoria residente completa.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, requiere aceleradores con al menos 80 GB de memoria (A100 80 GB, H100) o configuraciones multi-GPU.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB ni de 48 GB en una sola unidad; sería necesario repartir el modelo entre varias GPU o usar memoria unificada de un equipo con al menos 72 GB disponibles para el transformer.
- Opciones de despliegue: al estar en formato GGUF, es compatible con llama.cpp y con runners basados en GGUF; no se confirma compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 GSQ-RCO Coder (esta release) | 763,2B totales, 192 de 384 expertos por capa retenidos | no disponible | MIT | GGUF, 72,1 GB de transformer | Poda dirigida a código, agentes, contexto largo y visión |
| DeepSeek-V4.1-Flash-1017 GSQ-RCO sin podar (ISTA-DASLab) | 763,2B totales | no disponible | MIT | GGUF, 138,2 GB de transformer | Recomendado para uso generalista; conserva todos los expertos |
| DeepSeek-V4.1-Flash-1017 base (deepseek-ai) | 763,2B totales | no disponible | no disponible | FP8 / FP4 | Referencia de precisión completa; 81,20 en SWE-bench Verified y 89,71 en LiveCodeBench v6 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La poda del 50% de los expertos reduce capacidades de forma inevitable; la degradación fuera de código, uso agéntico, contexto largo y visión se asume como coste del método. Para uso generalista, la model card recomienda la release sin podar.
- Las tareas multi-paso acumulan error entre turnos: la retención cae al 94,8% en SWE-bench Verified frente al 98,7% en LiveCodeBench v6, lo que sugiere menor tolerancia en trayectorias largas.
- Las capacidades retenidas dependen del conjunto de calibración; dominios no representados en él pueden degradarse de forma no medida. El autor solicita feedback precisamente sobre esos casos.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera de los idiomas cubiertos por el modelo base.
- Longitud de contexto: no disponible, lo que impide planificar con precisión cargas de contexto largo.
- Es una release experimental; no se documentan garantías de estabilidad ni resultados de producción.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de las tablas Engram.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cc1244578151/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Release sin podar (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Código RCO: https://github.com/IST-DASLab/RCO
- Organización IST-DASLab: https://github.com/IST-DASLab
