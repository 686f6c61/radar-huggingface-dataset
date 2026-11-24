# caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed-mtp-drafter

## Resumen

Este repositorio no contiene un modelo de chat autónomo, sino un **predictor MTP (multi-token prediction) externo** para el modelo `caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed`, un Qwen de 27B cuantizado a aproximadamente 4,5 bits por peso. El drafter se usa junto al modelo objetivo para acelerar la decodificación especulativa: propone varios tokens por paso y el modelo grande los verifica, reduciendo el coste por token generado. El checkpoint tiene 424.699.392 parámetros (~0,42B), un tamaño coherente con una cabeza predictora ligera en lugar de un transformer completo.

El autor, `caslca`, publica el artefacto con licencia Apache 2.0 y formato MLX/safetensors, orientado a ejecución en Apple Silicon (los experimentos documentados se hicieron en un M5 Max de 64 GB con MLX y Metal). La model card es inusualmente detallada: documenta la reparación de siete vectores de normalización (se les suma 1.0 con redondeo BF16), los hashes SHA256 de los ficheros original y reparado, y campañas de evaluación ON/OFF del predictor con intervalos pareados.

Su relevancia es práctica: los autores de despliegues locales en Mac necesitan acelerar modelos de 27B cuantizados sin cambiar la calidad de salida. Este drafter reporta una relación de tiempo total de 0,417 (ON frente a OFF) en una pantalla de tres tareas, con una tasa de aceptación del 84,5%, aunque el propio autor advierte que la ganancia no es aceleración pura de kernel y que las pruebas son acotadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor MTP (multi-token prediction) para decodificación especulativa; tag `qwen3_5_mtp` |
| Parametros totales | 424.699.392 (~0,42B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como spec propia; las pruebas del autor llegan a 128K y 156K con el modelo objetivo |
| Tipos de cuantizacion | 4-bit (tag `4-bit`); el modelo base asociado es una cuantización mixta de ~4,5 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `mlx`) |
| Modelo base | caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed |
| Tamaño del repositorio | 0,3 GB |
| Revision publicada | `74bb2bc1feb60dbb8302bc8e6021d0be01f8f18d` (2026-09-10) |

## Arquitectura y entrenamiento

El artefacto es una cabeza MTP que predice varios tokens futuros para alimentar un bucle de decodificación especulativa sobre el modelo Qwen de 27B cuantizado. No se ha realizado entrenamiento sobre el tronco del modelo objetivo ni modificación de sus pesos, según indica el autor. La intervención documentada es una reparación de extracción: el checkpoint original conservaba siete offsets de normalización de Hugging Face y la extracción reparada les suma 1.0 con redondeo BF16, dejando 22 tensores de matriz/cuantización sin cambios. Los 29 payloads reparados se validaron contra un control funcional independiente.

El autor publica los hashes de los ficheros de tensores (original `26967a02...f968`, reparado `ff4d5cfc...0353`) y advierte explícitamente de no sustituir el `optiq/mtp.safetensors` empaquetado original por este directorio reparado. No se detallan datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) porque el repositorio no entrena un modelo generativo, sino que distribuye un predictor derivado.

## Capacidades

- Predicción especulativa de múltiples tokens para acelerar la generación del modelo objetivo de 27B.
- Integración con runtimes MLX: las pruebas citan MLX-VLM `420c01e1` y MLX-Serve `0ccc684` sobre MLX/Metal 0.32.2.
- Soporte de decodificación con `native16` KV y retirada de caché de sesión inactiva en el runtime del autor.
- No es un modelo de chat autónomo: no genera respuestas por sí solo ni debe usarse como modelo independiente.
- No se documentan capacidades propias de tool calling, agentes, visión o audio; las pruebas de visión (20 imágenes) y de razonamiento en contexto largo (128K, 156K) evalúan el sistema completo con el modelo objetivo, no al drafter de forma aislada.

## Casos de uso

- Aceleración de inferencia local en Apple Silicon: desplegar el drafter junto al Qwen de 27B cuantizado en MLX para reducir el tiempo de pared en generación de código y matemáticas, aprovechando la tasa de aceptación reportada del 84,5% en la pantalla de tres tareas.
- Asistencia a programación agéntica: el autor lo marca como primera elección aprobada por el operador para coding agéntico (B1/C1) a temperatura 0,5 y esfuerzo de razonamiento medio, con MTP reparado activado.
- Investigación y asistencia de diseño: mismo perfil de uso aprobado por el operador, adecuado para sesiones de razonamiento medio con contexto largo.
- Evaluación de decodificación especulativa: servir como componente de referencia para medir aceptación, ratios de decodificación y latencia frente a configuraciones OFF en pipelines de investigación.
- Procesamiento de contexto largo en local: las pruebas de recuperación (25/25 prompts hasta 128K) y de seguimiento variable en cadena-4 (39/39 hasta 156K) indican viabilidad en flujos de documento largo, siempre con las cautelas del autor sobre alcance.
- Verificación de pipelines de serving: usar los hashes y la comparación con control independiente para validar extracciones de cabezas MTP en despliegues propios.

## Benchmarks y rendimiento

Resultados publicados por el autor. La configuración M36 es TQ4 histórica, esfuerzo de razonamiento medio, temperatura 0,5, semillas pareadas, M5 Max 64 GB; EvalPlus nativo ARM64 para código.

| Dataset | Tareas x tiradas por estado | OFF estricto | ON reparado estricto | ON−OFF, intervalo pareado 95% |
|---|---:|---:|---:|---|
| HumanEvalPlus | 50x3 | 92,0% | 90,67% | −1,33 pp [−5,33, +2,0] |
| MBPPPlus | 50x3 | 84,67% | 85,33% | +0,67 pp [−2,0, +4,67] |
| Pooled diagnóstico | 100x3 | 88,33% | 88,0% | −0,33 pp [−3,0, +2,33] |

Pantalla de decodificación de tres tareas: 1,836x de ratio, aceptación 84,5%; generación completa 1,123 h ON frente a 2,691 h OFF, ratio de pared 0,417 [0,238, 0,603], ratio de tokens 0,778 [0,463, 1,082]. El autor señala que las longitudes de salida cambian y hay una cola larga en OFF, por lo que no es aceleración pura de kernel.

Certificación M40 (2026-09-13, TQ4 histórica, cap 262144, presupuesto de pensamiento 81920):

| Eje y tamaño | OFF | ON | Interpretación pareada |
|---|---:|---:|---|
| Math500, 100 | 97% | 99% | +2 pp [0, +5]; PASS del operador, helper bruto no concluyente en el borde |
| Prosa de investigación, 40 pares | — | — | Preferencia OFF 0,40 [0,29, 0,53], Holm p=0,099; sin potencia |
| Cadena-4 en 128K, 3 tiradas | 3/3 | 3/3 | Sin hits de presupuesto |
| Puerta de visión, 20 fotos | 20/20 | 20/20 | Puerta limitada de descripción de fotos |

Pantalla de regresión C84 (2026-09-14, cinco tareas congeladas por eje, 20 peticiones por estado):

| Eje | Puntuación AFTER | Tiempo de tarea AFTER/BEFORE [95%] | Ratio de decodificación por petición [95%] |
|---|---:|---:|---:|
| math500 | 5/5 | 1,022 [1,007, 1,031] | 0,986 [0,974, 0,996] |
| humanevalplus | 4/5 | 1,012 [1,008, 1,022] | 0,995 [0,977, 1,016] |
| mbppplus | 5/5 | 1,025 [1,014, 1,036] | 0,977 [0,962, 0,991] |
| cjudge | 5 empates revisados | 1,018 [1,008, 1,031] | 0,983 [0,970, 0,994] |

## Requisitos de hardware

- VRAM/unificada estimada: el repositorio ocupa 0,3 GB; el drafter es marginal frente al modelo objetivo de 27B cuantizado a ~4,5 bpw, que domina los requisitos de memoria.
- Hardware validado: Apple M5 Max con 64 GB de memoria unificada, MLX/Metal 0.32.2.
- GPU NVIDIA: no hay datos publicados de ejecución del drafter en CUDA; la librería declarada es `mlx`, específica de Apple Silicon.
- Cabe en GPU de consumo: el drafter por sí solo sí; el sistema completo depende del modelo de 27B cuantizado.
- Despliegue: MLX-VLM y MLX-Serve según las pruebas del autor. No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: ratio de pared 0,417 [0,238, 0,603] y ratio de tokens 0,778 [0,463, 1,082] en la pantalla de tres tareas; ratio de decodificación por petición entre 0,977 y 0,995 en C84.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed-mtp-drafter | 0,42B | no disponible | Apache 2.0 | safetensors (MLX) | Drafter MTP, no autónomo |
| caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed | 27B (nominal) | no disponible | no disponible en la información | safetensors (MLX) | Modelo objetivo; sin drafter |
| `optiq/mtp.safetensors` (empaquetado original) | no disponible | no disponible | no disponible | safetensors | Extracción original con siete offsets sin reparar; el autor desaconseja sustituirlo |
| Otros drafters especulativos de propósito general | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativa publicada en la información |

## Limitaciones y advertencias

- No es un modelo de chat: usarlo como modelo independiente produce resultados inválidos.
- Las pruebas son acotadas: el autor advierte que no establecen equivalencia amplia de calidad en `native16` ni certifican imágenes arbitrarias, OCR, diagramas complejos o razonamiento a contexto completo.
- Los intervalos con discordancia cero no prueban equivalencia universal; el MDE nominal es de 17,7 pp por dataset y 12,5 pp en pooled.
- La evidencia M40 se obtuvo con TQ4 y no puede extrapolarse silenciosamente a `native16`.
- La pantalla C84 usa 5 ítems por eje (MDE nominal 56 pp) y una revisión de prosa no ciega con un solo revisor.
- La ganancia de tiempo incluye longitudes de salida distintas y una cola larga en OFF; no es aceleración pura de kernel.
- Riesgo de alucinación y sesgos: no evaluados de forma específica para el drafter; heredados del modelo objetivo.
- Idiomas soportados no documentados.
- No sustituir el `optiq/mtp.safetensors` original por este directorio reparado; verificar hashes antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad de validación recae en el integrador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed-mtp-drafter
- Modelo base: https://huggingface.co/caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed
- Revisión publicada: https://huggingface.co/caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed-mtp-drafter/tree/74bb2bc1feb60dbb8302bc8e6021d0be01f8f18d
- No se han encontrado papers, blogs, repos de código ni demos adicionales en la información proporcionada.
