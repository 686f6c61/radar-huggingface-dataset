# Myric/abliteration-token-efficiency-study

## Resumen

Este repositorio no contiene un modelo de lenguaje de propósito general, sino los artefactos de un estudio controlado sobre el impacto de la *abliteration* (eliminación direccional del rechazo) en el coste de inferencia y la capacidad de modelos de ~30B de parámetros. El autor, Myric, evalúa dos modelos abliterados —Muse-Glimmer-30B y Qwen3.8-27B— sobre una suite de nueve tareas de codificación agéntica, midiendo tokens de salida, corrección y tiempo de ejecución. El hallazgo principal es que el efecto de la abliteration depende críticamente del modelo y del método: en Glimmer reduce los tokens de salida un 35,8% sin pérdida de capacidad, mientras que en Qwen los aumenta un 18,6% y provoca un fallo reproducible en una tarea.

El repositorio incluye pesos de un modelo de 27.320.697.856 parámetros (50,4 GB), probablemente uno de los dos modelos del estudio, aunque la model card no especifica cuál. La licencia es Apache-2.0 y el idioma declarado es inglés. El valor del repositorio no es el modelo en sí, sino la metodología y los datos comparativos que documenta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag `gguf` sugiere que hay versiones cuantizadas, pero no se detallan) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (según el dato de parámetros) y GGUF (según tags) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo publicado. El estudio se centra en la técnica de *abliteration*, que consiste en eliminar la dirección del espacio de activaciones asociada al comportamiento de rechazo. Se aplican dos métodos distintos: *heretic v1.4.0*, que realiza una ablación de rango 1 (blunt), y un fork personalizado de *ARA* (arbitrary-rank ablation), que elimina múltiples direcciones de forma más quirúrgica. El entrenamiento de los modelos base no se documenta; el estudio solo mide el efecto de la ablación sobre modelos ya existentes.

Los datos de entrenamiento de los modelos originales no están disponibles. El estudio utiliza una suite de nueve tareas de codificación (por ejemplo, `btree_insert_delete`, `mini_sql_executor`, `backtracking_regex`) y mide tokens de salida, puntuación sobre casos de prueba y tiempo de ejecución. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores a la ablación.

## Capacidades

- El repositorio no documenta capacidades generales del modelo publicado; se centra en el benchmark de codificación.
- Las tareas evaluadas incluyen inserción/borrado en árboles B, ejecución de SQL simplificado, y backtracking con expresiones regulares, lo que implica razonamiento lógico y generación de código.
- El estudio mide la capacidad de completar tareas de forma correcta (puntuación sobre casos de prueba) y la eficiencia en tokens de salida.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Optimización de costes de inferencia en producción: si la abliteration reduce tokens de salida en un modelo concreto (como en Glimmer, −35,8%), puede disminuir la latencia y el coste por petición en servicios de generación de código.
- Evaluación de técnicas de alineación: el estudio sirve como referencia metodológica para medir el impacto real de la abliteration en tareas que no activan rechazos, útil para equipos que consideran aplicar esta técnica.
- Selección de modelos para agentes de codificación: los datos comparativos ayudan a decidir si un modelo abliterado mantiene la capacidad en tareas complejas (por ejemplo, Qwen pierde una tarea con el método ARA).
- Investigación sobre el "impuesto de alineación": el estudio aporta evidencia sobre cómo el entrenamiento de rechazo introduce tokens superfluos (preámbulos, reformulaciones) que afectan a todas las salidas, no solo a las relacionadas con rechazos.
- Benchmarking de métodos de ablación: permite comparar heretic (rango 1) frente a ARA (rango arbitrario) en términos de coste y capacidad, con datos repetidos y ruido medido.
- Despliegue de modelos con menor sobrecarga de tokens: si se confirma el beneficio en un modelo dado, se puede integrar en pipelines de generación de código donde el ahorro de tokens es relevante.

## Benchmarks y rendimiento

El estudio presenta resultados sobre nueve tareas de codificación, con dos ejecuciones independientes por brazo. Los datos clave son:

| Modelo | Abliteration | Tokens de salida (media) | Puntuación | Verdicto |
|---|---|---|---|---|
| Muse-Glimmer-30B | stock heretic v1.4.0 | 54.044 → 34.711 (−35,8%) | 9/9 → 9/9 | gran mejora |
| Qwen3.8-27B | ARA fork | 55.764 → 66.140 (+18,6%) | 9/9 → 8/9 | pérdida |

En el caso de Glimmer, la reducción de tokens se observa en 8 de 9 tareas (test de signo p ≈ 0,02), con caídas destacadas en `btree_insert_delete` (−74%) y `mini_sql_executor` (−69%). En Qwen, el método ARA falla reproduciblemente en `btree_insert_delete` (dos ejecuciones, dos rutas de fallo distintas), mientras que el método blunt (darkc0de) mantiene la puntuación 9/9 con una reducción marginal de tokens (−2,6% en las 7 tareas comunes).

No se proporcionan benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El modelo tiene 27.320.697.856 parámetros (~27B), por lo que en FP16 requiere aproximadamente 55 GB de VRAM solo para los pesos.
- Con cuantización GGUF de 4 bits, la VRAM estimada sería de unos 14-16 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3090, RTX 4090 o similares con 16-24 GB.
- Para FP16 o cuantizaciones superiores (Q8), se necesitarían GPUs profesionales como A100 (40/80 GB) o H100.
- Opciones de despliegue: llama.cpp, Ollama, vLLM o TGI, dependiendo del formato de pesos (GGUF o safetensors).
- No se proporcionan datos de latencia o throughput en la model card.

## Comparativa con modelos similares

El estudio compara dos modelos de ~30B en el mismo benchmark, pero no con alternativas externas. La comparativa interna es:

| Modelo | Método de ablación | Δ tokens | Puntuación | Observación |
|---|---|---|---|---|
| Muse-Glimmer-30B | heretic v1.4.0 (rango 1) | −35,8% | 9/9 | Beneficio claro |
| Qwen3.8-27B | ARA (rango arbitrario) | +18,6% | 8/9 | Pérdida de capacidad |
| Qwen3.8-27B | darkc0de (heretic, dosis baja) | −2,6% (en 7 tareas) | 9/9 | Neutro en tokens, sin pérdida |

No se dispone de comparación con modelos no abliterados de la misma familia fuera del estudio.

## Limitaciones y advertencias

- El estudio solo cubre tareas de codificación; no evalúa otros dominios como conversación general, razonamiento matemático o generación creativa.
- Los resultados se basan en dos ejecuciones por brazo; la variabilidad es baja en Glimmer (spread 0,7-4,5%) pero alta en Qwen con ARA (spread 9,4%).
- El método ARA en Qwen produce un fallo reproducible en `btree_insert_delete`, lo que indica una pérdida de capacidad real, no un artefacto de timeout.
- La model card no especifica qué modelo contiene el repositorio; los pesos publicados podrían ser de cualquiera de los dos modelos del estudio, lo que limita su uso directo.
- La licencia Apache-2.0 permite uso comercial, pero los modelos base (Muse-Glimmer-30B, Qwen3.8-27B) pueden tener licencias distintas; hay que verificar las licencias de los modelos originales antes de usar los pesos derivados.
- El estudio no proporciona datos sobre sesgos, alucinaciones o comportamiento fuera de las tareas de codificación.
- La abliteration puede eliminar comportamientos de rechazo, lo que implica que el modelo podría generar contenido dañino o inapropiado sin las salvaguardas habituales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Myric/abliteration-token-efficiency-study
- No se proporcionan otros enlaces (papers, blogs, repos) en la model card.
