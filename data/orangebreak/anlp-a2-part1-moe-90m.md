# orangebreak/anlp-a2-part1-moe-90M

## Resumen

orangebreak/anlp-a2-part1-moe-90M es un conjunto de cinco variantes de un transformer decoder-only para traduccion automatica, desarrollado por el usuario orangebreak como parte de la "Task 1" de la asignatura Advanced NLP (Assignment 2). El repositorio no contiene un unico modelo, sino cinco subcarpetas que comparan distintas variantes de la capa feed-forward: una densa de referencia (`v1_dense`) y cuatro con arquitecturas de mezcla de expertos (`v2_e4k1`, `v3_e4k2`, `v4_shared`, `v5_active_matched`). El objetivo es un experimento controlado sobre el compromiso entre parametros totales, parametros activos y calidad de traduccion.

El modelo traduce en dos direcciones: vietnamita a ingles y japones a ingles, con el ingles como lengua destino. Las cinco variantes se entrenaron con un presupuesto identico de 30.000.128 tokens, y comparten un unico tokenizer byte-level BPE de 16.000 entradas (`tokenizer.json`). El nombre del repositorio sugiere un orden de magnitud de 90 millones de parametros, aunque la model card no publica el recuento exacto ni por variante.

Se trata de un artefacto de investigacion academica, no de un modelo orientado a produccion: las tablas de resultados (PPL y BLEU) aparecen vacias en la model card y no hay demos, pesos cuantizados ni integraciones con frameworks de despliegue. Es relevante como material didactico y como base reproducible para estudiar enrutamiento MoE en traduccion a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con variantes de capa feed-forward densa y de mezcla de expertos (MoE) |
| Parametros totales | No disponible (el nombre del repositorio sugiere ~90M; la model card no lo confirma por variante) |
| Parametros activos | No disponible (variante 5 esta disenada para igualar los parametros activos de la densa) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en fp32, formato `final.pt`) |
| Idiomas soportados | Ingles (en), vietnamita (vi), japones (ja); direcciones vi→en y ja→en |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt` con state dict y config); tokenizer en JSON |
| Tokenizer | Byte-level BPE de 16k vocabulario, compartido por las cinco variantes |
| Tamano del repositorio | 0,5 GB |
| Tarea (pipeline) | Translation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La familia consta de cinco variantes de un transformer decoder-only en el que se sustituye la capa feed-forward (FFN) por distintas configuraciones. La nomenclatura de las variantes sigue la convencion habitual de la literatura MoE: `e4k1` y `e4k2` apuntan a cuatro expertos con enrutamiento top-1 y top-2 respectivamente, mientras que `v4_shared` introduce un experto compartido y `v5_active_matched` ajusta el numero de expertos para que los parametros activos por token coincidan con los de la baseline densa. Los detalles exactos de implementacion (funcion de enrutamiento, funcion de balanceo de carga, dimension de los expertos) no se especifican en la model card.

El entrenamiento es un experimento controlado: las cinco variantes consumen exactamente 30.000.128 tokens, y las variantes 1 a 4 mantienen constante el total de parametros mientras que la variante 5 mantiene constante el numero de parametros activos respecto a la densa. Esto aisla el efecto del enrutamiento disperso. No se documenta en la informacion disponible si hubo fases de RLHF, DPO u otro ajuste por preferencias, ni la composicion concreta del dataset mas alla del presupuesto de tokens. Cada subcarpeta incluye `final.pt` (state dict mas configuracion) y un `results.json` con las metricas del experimento.

## Capacidades

- Traduccion automatica vietnamita→ingles y japones→ingles.
- Generacion de texto autoregresiva propia de un decoder-only.
- Comparacion controlada de variantes feed-forward (densa frente a MoE) en terminos de perplejidad y BLEU, segun el diseno experimental descrito.
- Tokenizacion multilingue compartida para en, vi y ja mediante BPE byte-level de 16k.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.
- Cobertura idiomatica limitada a las tres lenguas declaradas; no se documenta capacitacion general multilingue.

## Casos de uso

- Reproduccion de experimentos academicos: servir como baseline controlada para estudiar el impacto del enrutamiento MoE en tareas de traduccion a pequena escala, dado que las cinco variantes comparten presupuesto de tokens y tokenizer.
- Traduccion de documentacion tecnica japonesa a ingles: un modelo decoder-only entrenado en ja→en puede emplearse para volcar manuales o notas de ingenieria, siempre que se acepte una calidad no validada por falta de BLEU publicado.
- Preprocesado de corpus vietnamitas: traduccion vi→en para normalizar y enriquecer datasets antes de tareas posteriores de analisis o indexado.
- Docencia de arquitecturas MoE: el repositorio separa densa y variantes MoE con configuraciones explicitas, lo que facilita ejercicios practicos sobre enrutamiento y parametros activos.
- Prototipado low-resource: con un orden de magnitud de 90M parametros, el modelo puede ejecutarse en CPU o GPU integrada para validar pipelines de traduccion antes de escalar a modelos mayores.
- Investigacion sobre eficiencia computacional: comparar coste de inferencia (parametros activos) frente a calidad en la variante `v5_active_matched` para estudiar la relacion entre FLOPs por token y BLEU.
- Generacion de subtitulos bilingues en prototipos internos: uso no critico para convertir texto ja o vi a ingles en herramientas de previsualizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla con columnas de parametros totales, parametros activos, Test PPL y BLEU para cada variante, pero todas las celdas aparecen vacias en el README extraido. No se deben inferir valores de las metricas a partir del diseno experimental.

| Variante | Parametros totales | Parametros activos | Test PPL | BLEU |
|---|---:|---:|---:|---:|
| `v1_dense` | No disponible | No disponible | No disponible | No disponible |
| `v2_e4k1` | No disponible | No disponible | No disponible | No disponible |
| `v3_e4k2` | No disponible | No disponible | No disponible | No disponible |
| `v4_shared` | No disponible | No disponible | No disponible | No disponible |
| `v5_active_matched` | No disponible | No disponible | No disponible | No disponible |

## Requisitos de hardware

Las estimaciones siguientes se basan en el orden de magnitud de 90M parametros que sugiere el nombre del repositorio y en el peso de fp32 publicado; los valores exactos no estan confirmados en la model card.

- VRAM estimada (90M parametros): ~360 MB en fp32, ~180 MB en fp16/bf16, ~90 MB en int8 y ~45-50 MB en int4 (estimaciones teoricas de pesos, sin overhead de activaciones ni del runtime).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requiere A100 ni H100.
- Compatibilidad con GPU de consumo: cabe holgadamente en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en GPU integradas o ejecucion en CPU.
- Opciones de despliegue: al publicarse solo `final.pt`, el camino directo es PyTorch con una implementacion propia del transformer. No se incluyen pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa. Tampoco se documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La comparativa se limita a escala, licencia y disponibilidad, dado que este repositorio no publica metricas de calidad y sus parametros exactos no estan confirmados.

| Modelo | Parametros | Idiomas / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| orangebreak/anlp-a2-part1-moe-90M | No disponible (~90M segun nombre) | vi→en, ja→en | MIT | Pesos `final.pt` en HuggingFace, sin benchmarks |
| Helsinki-NLP/opus-mt-en-vi (Marian) | Orden de ~70M | en↔vi | CC-BY-4.0 | Pesos listos para produccion, ampliamente usado |
| Helsinki-NLP/opus-mt-ja-en (Marian) | Orden de ~70M | ja→en | CC-BY-4.0 | Pesos listos para produccion |
| t5-small | 60M | Multilingue (incluye en, no vi/ja especificos) | Apache-2.0 | Pesos y variantes GGUF disponibles |

No se dispone de datos de rendimiento comparativos (BLEU/PPL) para el modelo evaluado, por lo que no es posible establecer una comparacion cuantitativa de calidad con las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay BLEU ni perplejidad verificables, por lo que no se puede afirmar su calidad de traduccion.
- Sesgos conocidos: no documentados. Al entrenarse con un corpus no especificado, se desconocen sesgos de genero, culturales o geopoliticos.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; no hay evaluacion de fidelidad en la informacion disponible.
- Limitaciones de contexto e idioma: la longitud de contexto es desconocida y la cobertura se restringe a en, vi y ja.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el repositorio no incluye garantias ni soporte.
- Caveat para produccion: los pesos estan en `final.pt` (state dict de PyTorch) y no hay pesos cuantizados ni integracion con servidores de inferencia, lo que anade trabajo de ingenieria antes de cualquier despliegue.
- Naturaleza academica: es un entregable de una asignatura, con cero descargas y cero likes; se recomienda tratar la salida como experimental y no critica.
- Fechas de creacion y actualizacion (2026-09-28) y el campo `region:us` figuran en los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orangebreak/anlp-a2-part1-moe-90M
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales asociados al modelo.
