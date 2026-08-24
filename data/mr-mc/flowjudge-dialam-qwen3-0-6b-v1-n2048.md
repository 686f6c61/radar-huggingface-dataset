# mr-mc/flowjudge-dialam-qwen3-0.6b-v1-n2048

## Resumen

`mr-mc/flowjudge-dialam-qwen3-0.6b-v1-n2048` es un adaptador QLoRA desarrollado por el autor `mr-mc` sobre el modelo base Qwen3-0.6B. Su propósito es muy específico: dado un nuevo enunciado proposicional y un bloque completo de proposiciones previas, debe emitir un único objeto JSON con las aristas directas de tipo SUPPORT, ATTACK o REPHRASE hacia los identificadores suministrados, o una lista de relaciones vacía. Se enmarca dentro de un flujo de minería de argumentos sobre el corpus DialAM (Dialectical Argument Mining).

El modelo se publica como un checkpoint de asignación, no como una afirmación de fiabilidad general. Los resultados de la evaluación congelada de 30 escenarios muestran una exactitud de parche del 26,7 %, una precisión de aristas del 16,7 % y una recall del 16,7 %, cifras que no superan el umbral de fiabilidad preregistrado. El autor declara explícitamente que ninguna de las configuraciones probadas alcanzó el umbral de fiabilidad, por lo que este adaptador no debe considerarse un sistema de minería de argumentos fiable en producción.

La licencia es `other` y los datos de entrenamiento (2048 ejemplos transformados del corpus DialAM) no se redistribuyen; los consumidores deben obtener el corpus oficial y el permiso correspondiente por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-0.6B (transformer decoder-only, base Qwen3) |
| Parámetros totales | 0,6B en el modelo base; adaptador QLoRA con r=16, alpha=32 |
| Parámetros activos | no disponible (adaptador QLoRA, no MoE) |
| Longitud de contexto | 2048 tokens (según el nombre `n2048`; el base Qwen3-0.6B soporta hasta 32K) |
| Tipos de cuantización | Entrenado con base en 4-bit (`unsloth/qwen3-0.6b-unsloth-bnb-4bit`); el adaptador en sí no especifica cuantización |
| Idiomas soportados | no disponible (el corpus DialAM es en inglés, pero no se documenta) |
| Licencia | other (no estándar; requiere permiso para datos de entrenamiento) |
| Formato de pesos | safetensors (PEFT adapter) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-0.6B, un transformer decoder-only con atención causal estándar. El entrenamiento usa QLoRA con r=16, alpha=32, tres épocas y semilla 20260823, sobre 2048 ejemplos privados transformados del corpus DialAM. El runtime de entrenamiento empleó el espejo 4-bit `unsloth/qwen3-0.6b-unsloth-bnb-4bit` del modelo canónico `Qwen/Qwen3-0.6B`.

No se documenta ninguna innovación técnica más allá del enfoque QLoRA estándar. El autor menciona que una experimentación posterior con hard negatives (v2) aumentó las aristas falsas y falló el test de mejora material preregistrado, por lo que se seleccionó la v1 como checkpoint final. El texto de entrenamiento no se redistribuye.

## Capacidades

- Generación de JSON estructurado: el modelo emite un objeto JSON con aristas de relación entre proposiciones (SUPPORT, ATTACK, REPHRASE) o una lista vacía.
- Minería de argumentos limitada: detecta relaciones directas entre una proposición nueva y proposiciones previas de un bloque.
- No se documentan capacidades de razonamiento general, generación de código, tool calling, agentes o multilingüismo.
- La fiabilidad es baja: exactitud de parche del 26,7 %, y F1 de aristas del 16,7 % en el conjunto de evaluación de 30 escenarios.
- No hay evidencia de capacidades de visión, audio ni modo thinking.

## Casos de uso

- Reproducción de experimentos académicos: el checkpoint sirve para replicar los resultados de la curva de eficiencia de datos de v1 en el corpus DialAM, tal como se documenta en los manifiestos incluidos.
- Investigación en minería de argumentos: como referencia de un intento de adaptación de Qwen3-0.6B a la tarea de extracción de relaciones de argumentos, útil para comparar configuraciones de entrenamiento.
- Evaluación de técnicas de data efficiency: el modelo documenta el comportamiento de QLoRA con 2048 ejemplos privados, útil para estudiar el impacto del tamaño del dataset en tareas estrechas.
- Prototipado de pipelines de anotación: puede servir como punto de partida para un sistema de anotación asistida de argumentos, siempre que se valide manualmente la salida.
- Análisis de fallos en modelos pequeños: el estudio de los falsos positivos y negativos de este adaptador puede informar el diseño de datasets de entrenamiento mejores.
- No se recomienda su uso en producción para minería de argumentos en corpus reales, dado el bajo rendimiento y la licencia restrictiva.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de la evaluación congelada de 30 escenarios, publicados en la model card:

| Métrica | v1 n=2048 (seleccionado) | v2 n=2048 (rechazado) |
|---|---:|---:|
| Exact patch accuracy | 26,7 % | 23,3 % |
| Edge precision | 16,7 % | 18,8 % |
| Edge recall | 16,7 % | 25,0 % |
| Edge F1 | 16,7 % | 21,4 % |
| Relation macro-F1 | 16,7 % | 18,8 % |
| False edges/update | 0,667 | 0,867 |

El autor indica que ningún tamaño de entrenamiento probado superó el umbral de fiabilidad preregistrado, y que la evaluación es pequeña y específica del corpus. No se publican resultados de MMLU, HumanEval ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-0.6B con cuantización 4-bit requiere aproximadamente 1-2 GB de VRAM para inferencia. El adaptador PEFT añade una pequeña sobrecarga.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente. También se puede ejecutar en CPU con latencia moderada.
- Despliegue: al ser un adaptador PEFT, se debe cargar con Transformers/PEFT o Unsloth sobre el modelo base `Qwen/Qwen3-0.6B`. No se documenta compatibilidad con vLLM, llama.cpp ni Ollama.
- Latencia: no disponible; dado el tamaño de 0.6B y contexto de 2048 tokens, la inferencia es rápida en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de minería de argumentos en la información proporcionada. Como referencia, el propio autor no ofrece comparación con alternativas. Se puede indicar que el modelo base Qwen3-0.6B tiene capacidades generales de generación y razonamiento, pero el adaptador es específico de la tarea DialAM. No disponible.

## Limitaciones y advertencias

- Rendimiento bajo: la exactitud de parche es del 26,7 % y el F1 de aristas del 16,7 %, muy por debajo de un umbral de fiabilidad útil.
- El autor declara explícitamente que el checkpoint se publica para reproducir la evidencia de la asignación, no como una afirmación de que el comportamiento es fiable.
- La evaluación es pequeña (30 escenarios) y específica del corpus DialAM; no es evidencia de fiabilidad general en minería de argumentos.
- El texto de entrenamiento no se redistribuye; se debe obtener el corpus oficial y el permiso correspondiente por separado.
- La licencia es `other`, no una licencia estándar de código abierto, y puede tener restricciones para uso comercial.
- Riesgo de alucinación en la generación de relaciones: el modelo puede emitir aristas falsas (0,667 falsas por actualización en la v1).
- No se documentan sesgos específicos, pero al ser un modelo pequeño entrenado en un corpus especializado, es probable que tenga limitaciones en dominios fuera del ámbito de argumentación.

## Enlaces

- Página del adaptador en HuggingFace: https://huggingface.co/mr-mc/flowjudge-dialam-qwen3-0.6b-v1-n2048
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Repositorio de Flow Judge (no directamente relacionado, pero el nombre del adaptador incluye "flowjudge"): https://github.com/flowaicom/flow-judge
- Página de Flow Judge: https://flow-ai.com/judge

No se encontraron papers ni demos adicionales específicos de este adaptador.</think>## Resumen

`mr-mc/flowjudge-dialam-qwen3-0.6b-v1-n2048` es un adaptador QLoRA desarrollado por el autor `mr-mc` sobre el modelo base Qwen3-0.6B. Su propósito es muy específico: dado un nuevo enunciado y un bloque completo de proposiciones previas, debe emitir un único objeto JSON con aristas directas de tipo SUPPORT, ATTACK o REPHRASE hacia los identificadores suministrados, o una lista de relaciones vacía. Se enmarca en el campo de la minería de argumentos (argument mining) sobre el corpus DialAM.

El modelo se publica como checkpoint de evidencia para una tarea de asignación, no como una afirmación de fiabilidad. Los resultados de la evaluación congelada de 30 escenarios muestran una exactitud de parche del 26,7 %, con precisión y recall de aristas del 16,7 %; el autor declara explícitamente que ningún tamaño de entrenamiento probado superó el umbral de fiabilidad preregistrado. El adaptador está pensado para reproducir la curva de eficiencia de datos de la v1, y no para uso en producción.

La licencia es `other` y los datos de entrenamiento (2048 ejemplos transformados del corpus DialAM) no se redistribuyen; los consumidores deben obtener el corpus oficial y los permisos correspondientes por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-0.6B (transformer decoder-only, base Qwen3) |
| Parámetros totales | 0,6B en el modelo base; adaptador QLoRA con r=16, alpha=32 |
| Parámetros activos | No aplica (adaptador QLoRA, no es MoE) |
| Longitud de contexto | 2048 tokens (según el nombre `n2048`; el base Qwen3-0.6B soporta hasta 32K) |
| Tipos de cuantización | Entrenado con 4-bit (`unsloth/qwen3-0.6b-unsloth-bnb-4bit`); el adaptador en sí no se cuantiza |
| Idiomas soportados | No disponible (el corpus DialAM es en inglés, pero no se documenta) |
| Licencia | `other` (no estándar; requiere permiso para datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un QLoRA sobre Qwen3-0.6B, un transformer decoder-only con atención causal estándar. El entrenamiento usó r=16, alpha=32, tres épocas, semilla 20260823 y 2048 ejemplos privados transformados del corpus DialAM. El runtime de entrenamiento usó el espejo 4-bit `unsloth/qwen3-0.6b-unsloth-bnb-4bit` del modelo canónico.

No hay innovaciones técnicas más allá del esquema QLoRA estándar. El autor menciona una variante posterior con hard negatives (v2) que aumentó las aristas falsas y falló el test de mejora material preregistrado, por lo que se seleccionó la v1 como checkpoint final. Los datos de entrenamiento no se redistribuyen.

## Capacidades

- Generación de JSON estructurado: emite un objeto JSON con aristas de relaciones (SUPPORT, ATTACK, REPHRASE) o lista vacía.
- Minería de argumentos limitada: detecta relaciones directas entre una proposición nueva y un bloque previo.
- No se documentan capacidades de razonamiento general, generación de código, tool calling, agentes ni multilingüismo.
- El rendimiento es bajo: exactitud de parche del 26,7 %, F1 de aristas del 16,7 % en el conjunto de 30 escenarios.
- No hay evidencia de capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Reproducción de experimentos académicos: el checkpoint sirve para replicar la curva de eficiencia de datos de la v1 en el corpus DialAM, tal como se valida en los manifiestos incluidos.
- Investigación en minería de argumentos: permite comparar configuraciones de QLoRA sobre Qwen3-0.6B para la tarea de extracción de relaciones de argumentación.
- Estudio de eficiencia de datos: el modelo documenta el efecto de entrenar con 2048 ejemplos privados, útil para evaluar el impacto del tamaño del dataset en tareas estrechas.
- Prototipado de anotación asistida: puede servir como punto de partida de un sistema de anotación automática, siempre que se valide manualmente la salida.
- Análisis de fallos en modelos pequeños: el estudio de falsos positivos y negativos de aristas puede informar el diseño de mejores datasets.
- Comparación de metodologías de entrenamiento: la variante v2 (rechazada) se puede usar para contrastar el efecto de hard negatives, aunque no se distribuye el adaptador v2.

## Benchmarks y rendimiento

La única evaluación disponible es la congelada de 30 escenarios, publicada en la model card:

| Métrica | v1 n=2048 (seleccionado) | v2 n=2048 (rechazado) |
|---|---:|---:|
| Exact patch accuracy | 26,7 % | 23,3 % |
| Edge precision | 16,7 % | 18,8 % |
| Edge recall | 16,7 % | 25,0 % |
| Edge F1 | 16,7 % | 21,4 % |
| Relation macro-F1 | 16,7 % | 18,8 % |
| False edges/update | 0,667 | 0,867 |

El autor indica que ningún tamaño de entrenamiento probado superó el umbral de fiabilidad preregistrado, y que la evaluación es pequeña y específica del corpus. No hay resultados de MMLU, HumanEval ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-0.6B en 4-bit requiere aproximadamente 1-2 GB de VRAM para inferencia; el adaptador PEFT añade una sobrecarga mínima.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente; también se puede ejecutar en CPU con latencia mayor.
- Despliegue: al ser un adaptador PEFT, se debe cargar con Transformers/PEFT o Unsloth sobre `Qwen/Qwen3-0.6B`. No se documenta compatibilidad con vLLM, llama.cpp ni Ollama.
- Latencia: no disponible; con 0,6B de parámetros y contexto de 2048, la generación es rápida en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de minería de argumentos en la información proporcionada. El modelo base Qwen3-0.6B tiene capacidades generales de lenguaje, pero el adaptador es específico de la tarea DialAM. No se encuentran alternativas comparables con datos públicos de la misma tarea.

## Limitaciones y advertencias

- Rendimiento bajo: la exactitud de parche es del 26,7 % y la F1 de aristas del 16,7 %, muy por debajo de un umbral de utilidad práctica.
- El autor declara que el checkpoint se publica para reproducir la evidencia de la asignación, no como afirmación de fiabilidad.
- La evaluación es pequeña (30 escenarios) y específica del corpus DialAM; no es evidencia de fiabilidad general en minería de argumentos.
- El texto de entrenamiento no se redistribuye: se debe obtener el corpus oficial y el permiso correspondiente por separado.
- La licencia `other` no es una licencia estándar de código abierto y puede tener restricciones para uso comercial.
- Riesgo de alucinación: el modelo puede generar aristas falsas (0,667 falsos por actualización en la v1 seleccionada).
- No se documentan sesgos específicos, pero al ser un modelo pequeño entrenado en un corpus especializado, es probable que tenga limitaciones fuera del dominio de argumentación.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/mr-mc/flowjudge-dialam-qwen3-0.6b-v1-n2048
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Repositorio de Flow-Judge (referencia de nombre, no relacionado directamente): https://github.com/flowaicom/flow-judge
- Página de Flow AI: https://flow-ai.com/judge

No se encontraron papers, demos ni documentación adicional específica de este adaptador.
