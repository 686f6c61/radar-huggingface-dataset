# ikimyaii/Mamba-1.3B-semi-structured-EHWS-ALPS_phase1-p1t0.7-80pct

## Resumen

Mamba-1.3B con un 80 % de esparsidad semiestructurada es un checkpoint de investigación publicado por el usuario ikimyaii en HuggingFace, obtenido podando el modelo base `fla-hub/mamba-1.3B-100B` mediante una receta de dos fases basada en ADMM (EHWS, con una fase 1 local de estilo ALPS hasta el 70 % y una fase 2 global hasta el 80 %). No es un modelo nuevo entrenado desde cero: es una compresión agresiva de un modelo de espacio de estados (SSM) selectivo de 1.334.740.992 parámetros, en el que cada fila de cada capa lineal podable conserva exactamente el mismo número de pesos (el 20 % superior), mientras que embeddings, `lm_head`, `dt_proj`, `conv1d`, `A_log` y `D` permanecen densos.

El interés del artefacto es metodológico, no de producto: demuestra que la misma receta aplicada sin ajuste por modelo a HGRN-1.3B funciona igualmente sobre una arquitectura Mamba, y que elegir un objetivo intermedio del 70 % en la fase 1 (en lugar del 80 % directo) reduce la perplejidad final en un 10,2 % en WikiText-2 y un 6,9 % en C4. Todo el proceso de poda consumió 4,08 horas en una única A100 de 40 GB, incluida la evaluación, lo que lo convierte en un caso práctico de compresión de bajo coste.

El precio de la compresión es visible: la perplejidad en C4 pasa de 14,12 a 23,72 y la media de exactitud zero-shot cae de 0,4350 a 0,3988. El modelo se distribuye únicamente en `float32` (5,3 GB de repositorio), sin licencia declarada, sin idiomas declarados y sin pipeline asignado, por lo que debe tratarse como material de experimentación reproducible, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, S6, con bloques SSM y convolución causal `conv1d`); derivada de `fla-hub/mamba-1.3B-100B` |
| Parametros totales | 1.334.740.992 |
| Parametros activos | no aplica (no es MoE); tras la poda, las capas lineales podables conservan el 20 % de sus pesos (esparsidad medida 0,7999) |
| Longitud de contexto | no disponible en la informacion proporcionada; el proceso de poda uso secuencias de 2.048 tokens |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en `float32` y no se ofrece ninguna variante cuantizada |
| Idiomas soportados | no disponible (no declarados en la model card ni en los metadatos) |
| Licencia | no disponible (no declarada) |
| Formato de pesos | safetensors (weights en float32; repositorio de 5,3 GB) |
| Parametros por capa podada | 144 capas lineales podadas con el mismo numero de no-ceros por fila |
| Esparsidad objetivo | 80 % semiestructurada por filas (top-20 % por fila) |
| Fecha de creacion en el hub | 2026-10-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo (S6) que sustituye la atención por recurrencia lineal con parámetros dependientes de la entrada, lo que da una complejidad lineal en la longitud de secuencia. El checkpoint no modifica esa topología: mantiene los bloques Mamba intactos y solo elimina pesos de las capas lineales podables (`in_proj`, `x_proj`, `out_proj`). Quedan densos `dt_proj` (aproximadamente el 2 % de los pesos lineales de cada bloque), `conv1d`, `A_log`, `D`, los módulos de normalización, los embeddings y `lm_head`.

La receta de poda es EHWS en dos fases. La fase 1, local y de estilo ALPS, poda cada capa hasta el 70 % minimizando el error de reconstrucción `||(W - W0) X||^2`, con un paso x en forma cerrada, un parámetro de penalización rho que crece de 0,01 hasta 10 veces la media de `diag(H)` a lo largo de 50 rondas, y un refit final exacto por mínimos cuadrados sobre el soporte resultante; las matrices Hessianas se estiman con 256 secuencias de C4. La elección del 70 % procede de un barrido 0,9 / 0,8 / 0,7 / 0,6 realizado sobre HGRN-1.3B al 90 %. La fase 2, global, parte de los pesos podados y ejecuta ADMM sobre la pérdida completa de entropía cruzada más destilación de conocimiento (alpha 0,5) con un paso Z basado en `Diag(H)`: 128 rondas de 32 pasos, learning rate 6e-4 con decaimiento lineal, lambda 0,01 constante, Adam con beta2 0,95, batch de 8 y semilla 0. El `diag(H)` del paso Z se remide en cada ronda a partir de las pasadas forward de entrenamiento.

Los datos de entrenamiento de la fase 2 son las 32.768 secuencias de C4 de 2.048 tokens que usa el código oficial de ELSA, vistas una sola vez. Se entrenan también normas, embeddings y `lm_head` sin penalización. La precisión es `float32` para pesos maestros, gradientes y estado de Adam, con autocast `bf16` en el forward. La evaluación se hizo en `bf16` porque Mamba desborda en `fp16` (la perplejidad densa en C4 se vuelve NaN). El run completo, incluida evaluación, tomó 4,08 horas en una A100 de 40 GB y es una única ejecución, sin réplicas.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje con el tokenizador y el vocabulario heredados de `fla-hub/mamba-1.3B-100B`.
- Razonamiento y respuesta a preguntas de conocimiento general a un nivel degradado: la media zero-shot cae de 0,4350 a 0,3988 respecto al denso.
- Clasificación de pares de frases y tareas de inferencia textual (`rte` 0,5379, `boolq` 0,6058), donde el modelo podado iguala o supera ligeramente al denso.
- Procesamiento de secuencias largas con coste lineal en longitud, por la propia naturaleza SSM de Mamba (no verificado experimentalmente en esta ficha más allá de los 2.048 tokens de entrenamiento).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Valor como artefacto de investigación: reproducible con un solo script y un solo registro (`results.json` en el repositorio).

## Casos de uso

- Reproducción de experimentos de poda: el par de checkpoints (fase 1 al 70 % y al 80 %) permite verificar la afirmación de que un objetivo intermedio reduce la perplejidad final, comparando 22,46 / 23,72 frente a 25,02 / 25,47 en WikiText-2 / C4.
- Baseline en estudios de compresión de SSM: sirve como referencia fija de esparsidad semiestructurada al 80 % para comparar con otras técnicas (SparseGPT, Wanda, poda no estructurada) sobre la misma arquitectura Mamba de 1,3B.
- Investigación sobre kernels y aceleración real: al garantizar el mismo número de no-ceros por fila en las 144 capas podadas, el checkpoint es adecuado para medir si la esparsidad semiestructurada por filas se traduce en ganancia de throughput con kernels dispersos, algo que la esparsidad no estructurada no permite.
- Estudio de degradación capacidades-tamaño: con 1.334.740.992 parámetros y solo el 20 % de los pesos lineales activos, permite trazar curvas de perplejidad frente a esparsidad y compararlas con HGRN-1.3B y OPT-125M podados con la misma receta.
- Experimentos de despliegue en hardware limitado: el checkpoint en `float32` ocupa unos 5,3 GB, y una hipotética conversión a `bf16` lo dejaría en torno a 2,7 GB de pesos; útil para prototipos de inferencia en una sola GPU consumer siempre que se use `bf16` y no `fp16`.
- Docencia y divulgación sobre SSM: al no requerir entrenamiento y cargarse con `flash-linear-attention` y `trust_remote_code=True`, permite ilustrar el comportamiento de Mamba y el efecto de la poda en un portátil con GPU.
- Evaluación comparativa de recetas de poda entre arquitecturas: el autor aplica la misma receta a HGRN y a Mamba sin ajuste por modelo, de modo que el checkpoint sirve para estudiar la transferibilidad del método entre familias de modelos recurrentes.

## Benchmarks y rendimiento

Perplejidad con los conjuntos de test y la fórmula del código oficial de ELSA, evaluada en `bf16` en ambas filas. Ejecución única.

| Modelo | Tipo de esparsidad | WikiText-2 | C4 |
|---|---|---|---|
| Denso (`fla-hub/mamba-1.3B-100B`) | ninguna | 10,03 | 14,12 |
| Este modelo | semiestructurada por filas, 80 % | 22,46 | 23,72 |

Exactitud zero-shot:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,2048 |
| arc_easy | 0,5644 | 0,4402 |
| boolq | 0,6040 | 0,6058 |
| hellaswag | 0,3898 | 0,3126 |
| openbookqa | 0,1980 | 0,1780 |
| rte | 0,5343 | 0,5379 |
| winogrande | 0,5217 | 0,5122 |
| media | 0,4350 | 0,3988 |

Comparación interna de la receta (misma evaluación en ambas filas):

| Objetivo de la fase 1 | WikiText-2 | C4 |
|---|---|---|
| 80 % (receta por defecto) | 25,02 | 25,47 |
| 70 % (este modelo) | 22,46 | 23,72 |

Variación al pasar del 80 % al 70 % en la fase 1: -10,2 % en WikiText-2 y -6,9 % en C4. Esparsidad alcanzada medida sobre estos pesos: 0,7999 en las capas podadas. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: unos 5,34 GB en `float32` (valor publicado), unos 2,67 GB en `bf16` y aproximadamente 1,33 GB / 0,67 GB en cuantizaciones de 8 y 4 bits (estimaciones aritméticas, no hay variantes cuantizadas publicadas).
- Sumar a esas cifras el estado de activaciones y el coste de `flash-linear-attention`; para secuencias de 2.048 tokens el pico es moderado, pero no se publica ninguna medición de memoria.
- GPU recomendadas: A100 40GB es la unidad usada para podar y evaluar el modelo; H100, L40S o A10 también son adecuadas. Cabe en GPUs consumer con 8 GB o más si se usa `bf16` (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores); en `float32` necesita más de 6 GB solo para pesos.
- `fp16` no es una opción: el autor documenta desbordamiento de Mamba en `fp16` (la perplejidad densa en C4 se vuelve NaN). Usar `bf16` o `float32`.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y el paquete `flash-linear-attention` instalado (`import fla`). No se han publicado conversiones a GGUF, por lo que llama.cpp y Ollama no están verificados para este checkpoint; el soporte en vLLM o TGI no está documentado en la información disponible.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el coste de la poda (4,08 horas en una A100 40GB), que no es una medición de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Esparsidad | WikiText-2 | C4 | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo | 1.334.740.992 | 80 % semiestructurada por filas | 22,46 | 23,72 | no disponible (poda con secuencias de 2.048) | no disponible | safetensors, float32 |
| `ikimyaii/Mamba-1.3B-semi-structured-EHWS-ALPS_phase1-80pct` | 1.334.740.992 | 80 % con fase 1 directa al 80 % | 25,02 | 25,47 | no disponible | no disponible | safetensors, float32 |
| `fla-hub/mamba-1.3B-100B` (denso) | 1.334.740.992 | ninguna | 10,03 | 14,12 | no disponible en esta informacion | no disponible en esta informacion | safetensors |
| `ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS-phase1-80pct` | familia HGRN, ~1,3B | 80 % semiestructurada | no disponible en esta informacion | no disponible en esta informacion | no disponible | no disponible | safetensors |
| `ikimyaii/OPT-125M-semi-structured-EHWS-ALPS-phase1-80pct` | ~125M | 80 % semiestructurada | no disponible en esta informacion | no disponible en esta informacion | no disponible | no disponible | safetensors |

La comparación relevante es interna: frente al checkpoint con fase 1 al 80 %, este modelo mejora la perplejidad un 10,2 % en WikiText-2 y un 6,9 % en C4 con el mismo coste de inferencia teórico (misma esparsidad final). Frente al denso, pierde 12,43 puntos de perplejidad en WikiText-2 y 9,60 en C4.

## Limitaciones y advertencias

- Degradación de calidad sustancial: la perplejidad en C4 sube de 14,12 a 23,72 y la media zero-shot baja de 0,4350 a 0,3988; `arc_easy` cae 12,42 puntos y `hellaswag` 7,72 puntos, lo que descarta el uso en tareas que dependan de razonamiento commonsense.
- La poda se calibró y entrenó exclusivamente con C4 (32.768 secuencias de 2.048 tokens, una sola pasada), de modo que el sesgo de dominio hacia texto web en inglés es esperable; no hay evaluación en otros dominios ni en otros idiomas.
- No se declara licencia. Sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- No se declaran idiomas soportados; no hay evidencia de capacidades multilingües y el tokenizador heredado no está documentado en esta ficha.
- Riesgo de alucinación no medido: no se publican evaluaciones de veracidad, factualidad ni robustez. Un modelo de 1,3B podado al 80 % debe asumirse con factualidad limitada.
- Longitud de contexto no documentada: el entrenamiento usó ventanas de 2.048 tokens y no se aportan pruebas de extrapolación a secuencias más largas, pese a la complejidad lineal de Mamba.
- Pesos únicamente en `float32`, sin GGUF, AWQ, GPTQ ni variantes `bf16` publicadas; la conversión y validación corren a cargo del usuario.
- Dependencia de código remoto: requiere `trust_remote_code=True` y el paquete `flash-linear-attention`, lo que implica ejecutar código de terceros y fijar versiones para reproducibilidad.
- Resultado de una única ejecución (semilla 0), sin intervalos de confianza ni réplicas; las diferencias de perplejidad deben interpretarse con cautela.
- La esparsidad semiestructurada por filas no garantiza aceleración real: sin kernels dispersos compatibles, el checkpoint puede ejecutarse a la velocidad de un modelo denso de 1,3B.
- Repositorio con 0 descargas y 0 likes y sin pipeline declarado: no hay validación por parte de la comunidad, ni demos, ni informes de terceros.
- La fecha de creación registrada en el hub (2026-10-27) es posterior a la del modelo base referenciado; conviene verificar la procedencia y el linaje del checkpoint antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-EHWS-ALPS_phase1-70pct-80pct — URL canónica del repositorio: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-EHWS-ALPS_phase1-p1t0.7-80pct
- Modelo base denso: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Variante con fase 1 al 80 % (receta por defecto): https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-EHWS-ALPS_phase1-80pct
- Misma receta sobre HGRN-1.3B: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS-phase1-80pct
- Misma receta sobre OPT-125M: https://huggingface.co/ikimyaii/OPT-125M-semi-structured-EHWS-ALPS-phase1-80pct
- Registro completo del run: fichero `results.json` dentro del repositorio del modelo
- Documentación general de la arquitectura Mamba (Wikipedia): https://en.wikipedia.org/wiki/Mamba_(deep_learning_architecture)
- Introducción a los modelos Mamba (IBM): https://www.ibm.com/think/topics/mamba-model
- Bloques y mecanismo de Mamba (GeeksforGeeks): https://www.geeksforgeeks.org/artificial-intelligence/what-is-a-mamba-model/
- Paper original de Mamba, repositorio de ELSA y blog del autor: no disponibles en los resultados de búsqueda proporcionados.
