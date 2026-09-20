# open-athena/Snowball-67B-A2B-Math-RL-E1-ctx8k-p8-Step5

## Resumen

Snowball-67B-A2B-Math-RL-E1-ctx8k-p8-Step5 es un checkpoint de investigación publicado por la organización open-athena dentro de la campaña Snowball del proyecto Marin. Se trata de la instantánea exacta (paso 5 del brazo `E1 ctx8k-p8`) empleada para una fila reportada del experimento de aprendizaje por refuerzo en matemáticas sobre un modelo de mezcla de expertos de 67.078.876.160 parámetros totales. Por su nomenclatura (67B-A2B) y el tag `grug_moe`, se trata de un transformer MoE con aproximadamente 2 mil millones de parámetros activos por token, con una ventana de contexto de 8.192 tokens (`ctx8k`).

El modelo no es un lanzamiento de producción: la propia model card lo etiqueta como `research-artifact` y advierte que su utilidad queda limitada al mantenimiento íntegro del estado del router. En concreto, este artefacto incorpora una reparación del sesgo del router (`SFT router-bias repaired`), un ajuste necesario porque otras exportaciones con nombres similares (`laion/rl-snowball-*`) contienen routers mutables sin congelar que colapsan bajo inferencia. Esto lo convierte en un objeto de estudio para reproducibilidad de experimentos, no en una base para despliegues.

Su relevancia actual es metodológica: documenta un punto concreto de un ciclo de RL sobre tareas matemáticas (AIME24, MATH-500, OlympiadBench) y sirve para auditar la estabilidad del enrutado en arquitecturas MoE entrenadas con refuerzo. La licencia es `other` y no se declaran idiomas soportados, por lo que cualquier uso fuera de la investigación requiere revisar los términos del proyecto Marin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), tag `grug_moe` |
| Parametros totales | 67.078.876.160 (safetensors) |
| Parametros activos | ~2B (inferido de la nomenclatura `A2B`; no confirmado en la model card) |
| Longitud de contexto | 8.192 tokens (inferido del sufijo `ctx8k`; no confirmado explicitamente) |
| Tipos de cuantizacion | No disponible (repo solo con safetensors; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (indice `model.safetensors.index.json` + shards) |
| Tamano del repo | 134,2 GB |
| Brazo de experimento | `E1 ctx8k-p8`, paso 5 |
| Estado del router | SFT router-bias reparado |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos identificado con el tag `grug_moe`, integrado en el ecosistema Marin (`marin-community`). Con 67B de parámetros totales y un patrón MoE, cabría esperar un coste de cómputo por token muy inferior al de un modelo denso equivalente, activando solo una fracción de los expertos; la nomenclatura `A2B` apunta a unos 2B de parámetros activos, aunque este dato no se confirma de forma explícita en la model card. El checkpoint corresponde al paso 5 de un entrenamiento por refuerzo (`reinforcement-learning`) orientado a matemáticas, construido sobre un modelo base de la campaña Snowball.

El detalle técnico más relevante es el estado del router: la ficha indica que se ha aplicado una reparación del sesgo del router a partir de un router SFT (`SFT router-bias repaired`). Se advierte que exportaciones anteriores con nombres parecidos pueden contener routers mutables en crudo que colapsan en inferencia, por lo que este artefacto debe conservarse con `config.json`, los ficheros del tokenizer y todos los shards referenciados por `model.safetensors.index.json`. No se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como DPO adicionales; tampoco se especifica si hubo decodificación especulativa u optimizaciones de atención.

## Capacidades

- Generación de texto y razonamiento matemático: el entrenamiento por refuerzo se orienta explícitamente a problemas de competición, con evaluación en AIME24, MATH-500 y OlympiadBench.
- Razonamiento multi-paso: el formato de tarea (problemas de matemáticas con solución desarrollada) implica cadenas de razonamiento encadenadas.
- Escritura de solución matemática: capacidad implícita para producir demostraciones y desarrollos algebraicos, dado el dominio de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, modo thinking explícito): no disponible.

## Casos de uso

- Reproducción de experimentos de RL en matemáticas: el checkpoint es la instantánea exacta de una fila reportada, por lo que sirve para replicar las puntuaciones de AIME24, MATH-500 y OlympiadBench y auditar el pipeline de evaluación.
- Estudio del enrutado en MoE: permite analizar cómo se comporta un router con sesgo reparado frente a exportaciones con router mutable, comparando estabilidad y colapso en inferencia.
- Investigación sobre aprendizaje por refuerzo: al ser un paso intermedio (step 5) de un ciclo de RL, es útil para estudiar la evolución de métricas a lo largo del entrenamiento.
- Auditoría de artefactos de investigación: sirve como referencia canónica frente a repositorios `laion/rl-snowball-*` potencialmente corruptos, ayudando a validar integridad de shards y configuración.
- Generación de soluciones matemáticas en entorno controlado: para prototipos de resolución de problemas de nivel de competición donde se acepte un artefacto no productivo.
- Base para experimentos de destilación o comparación de routers: al tener un router reparado y congelado, puede usarse como referencia en estudios comparativos de arquitecturas MoE.

Ninguno de estos casos debe plantearse como despliegue en producción sin verificar primero la licencia `other`, que no se detalla en la información disponible.

## Benchmarks y rendimiento

Resultados reportados en la model card para el checkpoint del paso 5 del brazo `E1 ctx8k-p8`:

| Benchmark | Puntuacion |
|---|---|
| AIME24 | 15,67 |
| MATH-500 | 70,40 |
| OlympiadBench | 13,33 |

Advertencia de la propia model card: se trata del único checkpoint `E1` evaluado y las puntuaciones corresponden a una re-evaluación. Las puntuaciones y sus salvedades están documentadas en `MATH_EVALS.md`, dentro del archivo de evidencias. No se proporcionan resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM en BF16/FP16: aproximadamente 134 GB, coherente con el tamaño de 134,2 GB del repositorio. Requiere al menos dos GPUs de 80 GB (H100, A100 80GB) o una configuración equivalente.
- VRAM en INT8: en torno a 67 GB, todavía fuera del alcance de una GPU de consumo única.
- VRAM en INT4: en torno a 34-38 GB; sigue sin caber en una RTX 4090 (24 GB) sin offloading a memoria del sistema.
- GPU recomendadas: H100 80GB o A100 80GB en configuraciones multi-GPU para precisión completa; varias RTX 3090/4090 (24 GB) en paralelo para cuantización agresiva.
- ¿Cabe en GPU de consumo? No en una sola unidad de 24 GB. Con cuantización INT4 y offloading parcial a RAM podría ejecutarse en una RTX 4090, con penalización severa de latencia.
- Opciones de despliegue: no disponible. La arquitectura `grug_moe` es específica de Marin y no se confirma soporte en vLLM, llama.cpp, Ollama o TGI; es probable que requiera código propio del proyecto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de alternativas en la información proporcionada, por lo que la comparación se limita a especificaciones públicas conocidas y debe tomarse con cautela. El modelo es un artefacto de investigación con licencia `other`, lo que lo aleja de alternativas listas para producción.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-E1-ctx8k-p8-Step5 | 67B | ~2B (inferido) | 8k (inferido) | other | Investigacion, RL en matematicas |
| Qwen3-30B-A3B | ~30B | ~3B | 128k | Apache 2.0 | MoE de proposito general, produccion |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32k | Apache 2.0 | MoE de proposito general |

Datos de las alternativas tomados de especificaciones públicas; no verificados contra la información de esta busqueda. No se dispone de comparación de rendimiento directa.

## Limitaciones y advertencias

- Artefacto de investigación: la model card lo declara explícitamente `research-artifact` y advierte que su utilidad es limitada fuera de contextos controlados.
- Dependencia del estado del router: si no se preserva la reparación del sesgo o la integridad del router congelado, el modelo puede colapsar en inferencia. No deben sustituirse exportaciones `laion/rl-snowball-*` en crudo.
- Riesgo de alucinación: no cuantificado en la información disponible; en tareas matemáticas esto puede traducirse en desarrollos plausibles pero incorrectos.
- Limitaciones de contexto e idioma: contexto de 8k (inferido) y ausencia de idiomas declarados; el uso multilingüe no está respaldado.
- Restricciones de licencia: licencia `other` sin términos detallados en la información disponible; se debe revisar antes de cualquier uso comercial.
- Selección de checkpoint sesgada: solo se evaluó un checkpoint `E1`, por lo que las puntuaciones no representan necesariamente el mejor resultado de la campaña.
- Integridad de ficheros: es imprescindible conservar juntos `config.json`, el tokenizer y todos los shards listados en `model.safetensors.index.json`.
- Sin soporte de despliegue confirmado: no hay evidencia de compatibilidad con runtimes estándar, lo que complica la puesta en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E1-ctx8k-p8-Step5
- Issue del experimento: https://github.com/marin-community/marin/issues/7786
- Archivo de evidencias: https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Origen del artefacto: s3://marin-us-east-02a/marin/exports/snowball-bias-repaired/rl-snowball-e1-rno2a-ctx8k-p8-grug-67b-a-20260730-225618-8d52bd/global_step_5/policy/
- Proyecto Marin: marín-community (repositorio en GitHub; URL exacta no disponible en la información proporcionada)
