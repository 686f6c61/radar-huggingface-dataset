# 1bit-MONSTER/Inkling-2-Mini-GGUF-quants

## Resumen

Inkling-2-Mini es un modelo de lenguaje de 26.070 millones de parametros con arquitectura híbrida que combina bloques transformer con bloques recurrentes (arquitectura `inkling2_loop`, con 48 bloques físicos de los cuales 12 son recurrentes a 3 pasadas). El repositorio aquí descrito no contiene los pesos originales, sino un conjunto de cuantizaciones GGUF elaboradas por el usuario 1bit-MONSTER a partir del checkpoint `unsloth/Inkling-2-Mini`, pensadas para comparar calidad entre distintas asignaciones de bits de forma controlada.

La relevancia de esta publicación es metodológica: todas las cuantizaciones derivan de una única conversión `q8_0` del checkpoint en bf16, de modo que la única variable entre ficheros es la asignación de precisión y no la cadena de conversión. El autor publica métricas de divergencia KL y de coincidencia top-1 frente a la referencia `q8_0`, lo que permite evaluar el compromiso calidad/tamaño con datos medidos en lugar de estimaciones.

El modelo base tiene 26.070.385.152 parámetros según los safetensors, con 16,31 B en expertos gate/up y 8,15 B en expertos down (el 94 % de todos los pesos). El repo GGUF ocupa 65,5 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (híbrida transformer + recurrente; 48 bloques físicos, 12 recurrentes a 3 pasadas) |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q5_K, alloc24 (expertos q8_0/q4_k mixto), Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); checkpoint original con expertos NVFP4 (bloques 0-19) y MXFP8 (bloques 20-23) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura denominada `inkling2_loop`, con 48 bloques físicos de los cuales 12 son recurrentes y se ejecutan a 3 pasadas. La distribución de pesos indica una estructura con expertos separados: 16,31 B de parámetros en las proyecciones gate/up de los expertos y 8,15 B en las proyecciones down, lo que suma el 94 % del total de pesos del modelo. El checkpoint original distribuye los expertos en precisión mixta: NVFP4 para los bloques 0-19 y MXFP8 para los bloques 20-23.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio de cuantizaciones no documenta el proceso de entrenamiento del modelo base, solo el proceso de conversión a GGUF. La innovación técnica destacable documentada es la propia arquitectura recurrente con pasadas múltiples, que requiere un fork específico de llama.cpp para su carga.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica uso previsto para diálogo.
- Razonamiento y generación de texto general: no hay documentación específica de capacidades por tarea en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con infraestructura de despliegue estándar.

## Casos de uso

- Evaluación comparativa de cuantizaciones: el repositorio está diseñado explícitamente para comparar calidad entre asignaciones de bits, ya que todos los ficheros derivan de una misma conversión `q8_0`. Un equipo de infraestructura puede medir el impacto real de bajar de 27,82 GB a 17,48 GB usando las métricas KLD y top-1 publicadas como referencia.
- Despliegue en hardware con VRAM limitada: la variante `Q4_K_M` de 17,48 GB permite ejecutar un modelo de 26 B en GPUs de 24 GB, con una divergencia KL de 0,018668 frente a la referencia q8_0.
- Despliegue de máxima fidelidad: la variante `Q8_0` de 27,82 GB sirve como referencia de calidad cuando se dispone de 32 GB o más de VRAM y se prioriza la fidelidad sobre el rendimiento.
- Ajuste fino del compromiso calidad/tamaño: la variante `Q5_K` de 19,16 GB ofrece la mejor relación calidad/bytes del conjunto (KLD 0,006602, un 2,8× mejor que Q4_K_M por solo un 9,6 % más de tamaño), adecuada para producción con restricciones moderadas de memoria.
- Investigación sobre asignación de precisión por capas: la variante `alloc24` (expertos q8_0 en los últimos 4 bloques y q4_k en los otros 20) permite estudiar empíricamente si merece la pena proteger determinadas capas, ya que el autor documenta que la asignación uniforme q5_k supera a esta estrategia manual en todas las métricas.
- Integración en pipelines llama.cpp: todos los ficheros cargan en el fork de llama.cpp del repositorio, lo que permite usar la CLI (`llama-cli -m ... -ngl 99`) o el servidor compatible con la API de OpenAI para prototipos conversacionales.

## Benchmarks y rendimiento

El autor publica métricas de divergencia respecto a la referencia `q8_0` (PPL 8,9104 ± 0,587, medida con `llama-perplexity --kl-divergence -c 512 --chunks 8` y 14 hilos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Fichero | Asignación | Tamaño | Mean KLD | RMS Δp | same top-p |
|---|---|---|---|---|---|
| Q8_0 | todos los tensores q8_0 (referencia) | 27,82 GB | 0 | 0 | 100 % |
| Q5_K | expertos q5_k, resto q8_0 | 19,16 GB | 0,006602 ± 0,000246 | 1,665 ± 0,13 % | 96,618 ± 0,52 % |
| alloc24 | expertos de los últimos 4 bloques q8_0, otros 20 bloques q4_k, resto q8_0 | 18,48 GB | 0,008648 ± 0,000326 | 1,906 ± 0,08 % | 95,490 ± 0,46 % |
| Q4_K_M | Q4_K_M estándar de llama.cpp | 17,48 GB | 0,018668 ± 0,000626 | 2,990 ± 0,19 % | 93,725 ± 0,54 % |

Nota metodológica del autor: un `q4_k_m` construido desde f16 en lugar de desde `q8_0` midió 0,018843 ± 0,000561, lo que indica que la cadena de recuantización no añade degradación apreciable y que la diferencia entre filas se debe a la asignación de bits. En `Q4_K_M`, el tensor `ffn_down_exps` no es divisible por 256 para `q6_k` y cae a `q5_0`/`q8_0`; en `Q5_K`, las filas de expertos (ncols 1152 y 2304) sí son divisibles por 256 y ningún tensor cae a `q8_0`.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 17,5 GB (Q4_K_M) y 27,8 GB (Q8_0), más overhead de contexto y caché KV.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, Q4_K_M encaja en GPUs de 24 GB (RTX 3090/4090, A10G 24 GB); Q8_0 requiere 32 GB o más (A100 40 GB, H100, RTX 5090 si dispone de suficiente memoria).
- Cabe en consumer GPU: Q4_K_M (17,48 GB) y alloc24 (18,48 GB) caben en GPUs de 24 GB; Q5_K (19,16 GB) también, con margen ajustado para contexto; Q8_0 no cabe en 24 GB.
- Opciones de despliegue: exclusivamente el fork de llama.cpp del propio repositorio, ya que el modelo requiere la arquitectura `inkling2_loop` y el llama.cpp upstream no la lee. El tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla la infraestructura.
- Latencia y throughput: no disponibles. El autor señala que la ruta de precisión nativa (checkpoint con expertos NVFP4/MXFP8) es más rápida en la tarjeta Loom, pero no publica cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de benchmarks estándar que permitan una comparativa fiable con otros modelos. La única comparación documentada es interna, entre las propias cuantizaciones del repositorio:

| Variante | Tamaño | Mean KLD | same top-p | Licencia |
|---|---|---|---|---|
| Q8_0 (referencia) | 27,82 GB | 0 | 100 % | Apache 2.0 |
| Q5_K | 19,16 GB | 0,006602 | 96,618 % | Apache 2.0 |
| alloc24 | 18,48 GB | 0,008648 | 95,490 % | Apache 2.0 |
| Q4_K_M | 17,48 GB | 0,018668 | 93,725 % | Apache 2.0 |

Comparativa con modelos de la misma categoría (26 B, licencia permisiva): no disponible en la información proporcionada.

## Limitaciones y advertencias

- No es la forma más rápida del modelo: la ruta de precisión nativa (expertos NVFP4 y MXFP8) mantiene la distribución de precisión publicada y es más rápida en la tarjeta Loom; estas cuantizaciones priorizan portabilidad y comparabilidad.
- No es una referencia bf16: todas las métricas son relativas a la base `q8_0`, no al checkpoint bf16 original.
- Requiere un fork específico de llama.cpp: el llama.cpp upstream no lee la arquitectura `inkling2_loop`. Cualquier actualización del fork puede romper la compatibilidad.
- Idiomas soportados no documentados: el repositorio no declara idiomas, lo que impide garantizar calidad multilingüe.
- Capacidades no documentadas: no hay información sobre tool calling, agentes, contexto máximo ni modo thinking, lo que limita la planificación en producción.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; deben medirse antes de un despliegue real.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `unsloth/Inkling-2-Mini` y del checkpoint original, no documentadas aquí.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de las métricas publicadas.
- Ficheros de gran tamaño: el repo completo ocupa 65,5 GB, lo que exige planificar el almacenamiento y la descarga selectiva de variantes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-GGUF-quants
- Modelo base: https://huggingface.co/unsloth/Inkling-2-Mini
- Variante de precisión nativa (Loom): https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-loom
- llama.cpp (fork requerido): no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
