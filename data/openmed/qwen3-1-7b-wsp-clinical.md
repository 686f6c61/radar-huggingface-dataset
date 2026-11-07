# OpenMed/Qwen3-1.7B-WSP-Clinical

## Resumen

OpenMed/Qwen3-1.7B-WSP-Clinical es una edición de pesos del modelo Qwen3-1.7B desarrollada por OpenMed, una organización centrada en modelos y herramientas abiertas para texto clínico y biomédico. El modelo no se ha entrenado: parte de los pesos publicados de Qwen3-1.7B y modifica directamente las proyecciones de salida (`o_proj`) de tres cabezas de atención concretas (capa 21 cabeza 9, capa 23 cabeza 5 y capa 24 cabeza 10) mediante una técnica denominada weight-space programming, descrita por Takehi, Teoh, Zhang y Khattab (MIT CSAIL, 2026).

El objetivo es mejorar el rendimiento en preguntas de examen médico sin recurrir a descenso de gradiente, fine-tuning ni datos de entrenamiento adicionales. Según la model card, el modelo pasa del 45,1% al 52,7% de acierto en el conjunto de test de MedQA-USMLE (1.273 preguntas), una diferencia pareada de +7,6 puntos (IC 95%: +5,3 a +9,9; McNemar p = 6,5e-11).

Es relevante como caso de estudio metodológico: demuestra que una intervención quirúrgica sobre un número muy reducido de pesos puede producir mejoras medibles y estadísticamente significativas en un dominio especializado, con un coste de edición declarado de 1,62 dólares de API y 28 minutos de cómputo. No obstante, su uso previsto es la investigación en edición y evaluación de modelos, no el uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), con edición de pesos en `o_proj` de 3 cabezas de atención |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; compatible con el ecosistema transformers) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-1.7B, un transformer decoder-only denso de aproximadamente 2.000 millones de parámetros. No hay entrenamiento involucrado: el checkpoint base se toma en el commit `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` y se edita directamente en el espacio de pesos. Concretamente, se modifican las proyecciones de salida de tres cabezas de atención (capa 21 cabeza 9, capa 23 cabeza 5, capa 24 cabeza 10).

La metodología sigue el trabajo "Sparks of Weight-Space Programming" (MIT CSAIL, 2026): un modelo frontera lee los pesos dentro de un kernel de Python y los edita directamente. En este caso el editor fue Claude Opus 5.5 (Anthropic) con esfuerzo de razonamiento `high`, realizando 12 pasadas forward, 34 ejecuciones de Python y 47 turnos. El editor solo pudo usar los splits de entrenamiento de MedQA-USMLE (10.178 preguntas) y 10.000 preguntas de entrenamiento de MedMCQA. El coste declarado de la edición es de 1,62 dólares de API y 28 minutos de tiempo de reloj (run `sw_q3_17b`).

No se aplicaron RLHF, DPO ni ninguna otra fase de alineamiento adicional sobre el checkpoint editado; se mantiene el tokenizador, la plantilla de chat y el protocolo de muestreo del modelo base.

## Capacidades

- Generación de texto y respuesta a preguntas de opción múltiple en formato de examen médico (MedQA-USMLE, MedMCQA, MMLU médico).
- Razonamiento con modo "thinking" activado: el modelo genera una traza interna antes de la respuesta final y se evalúa el texto posterior a `</think>`.
- Formato de respuesta estructurado: produce una línea final `Answer: X` con X entre A y D.
- Capacidades generales heredadas de Qwen3-1.7B (generación de texto, razonamiento, código y matemáticas en su nivel de 2B), aunque la model card no las detalla específicamente para esta edición.
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas en la información proporcionada.
- Capacidad especial: edición de pesos orientada a dominio clínico sin entrenamiento; no se declaran capacidades de visión ni audio.

## Casos de uso

- Investigación en edición de modelos: servir como referencia reproducible para estudiar cómo una intervención localizada en tres cabezas de atención altera el comportamiento en un dominio concreto, comparando contra el checkpoint base y contra parches aleatorios del mismo tamaño.
- Evaluación de protocolos de benchmarking clínico: el modelo incluye un protocolo fijo (thinking on, temperatura 0,6, top_p 0,95, top_k 20, penalización de presencia 1,5, máximo 32.768 tokens nuevos) que permite replicar experimentos de evaluación de forma controlada.
- Estudio de robustez y calibración: los datos publicados muestran una reducción de respuestas sin línea calificable del 14,7% (base) al 0,1% (modelo editado), lo que lo hace útil para analizar adherencia al formato y fallos de generación.
- Docencia y divulgación sobre alineamiento sin gradiente: ilustra de forma tangible qué se puede y qué no se puede conseguir editando directamente pesos, con intervalos de confianza y pruebas de McNemar publicadas.
- Experimentos de comparación de métodos de adaptación: permite contrastar weight-space programming frente a fine-tuning clásico o adaptadores, usando el mismo conjunto de evaluación y el mismo prompt de examen.
- Desarrollo de pipelines de evaluación de QA médico en abierto: integrable en arneses de evaluación con transformers y text-generation-inference para medir exactitud en MedQA, MedMCQA y MMLU médico.

## Benchmarks y rendimiento

Resultados declarados por el autor (una muestra por pregunta, semilla 0, thinking on; conjunto de test de MedQA-USMLE de 1.273 preguntas):

| Checkpoint | MedQA (semilla 0) | MedQA, mediana de 3 semillas (rango) | MedMCQA | MMLU médico | Respuestas cortadas a 32.768 tokens | Respuestas sin línea calificable |
|---|---|---|---|---|---|---|
| OpenMed WSP Clinical 1.7B (este modelo) | 52,7% | 53,0% (52,7%–53,8%) | 46,3% | 71,9% | 0,0% | 0,1% |
| Parche aleatorio, mismo tamaño (semilla 1) | 45,8% | n/a | 43,7% | 66,8% | 0,0% | 13,7% |
| Parche aleatorio, mismo tamaño (semilla 2) | 44,9% | n/a | 42,6% | 63,0% | 0,0% | 13,8% |
| Qwen3-1.7B original | 45,1% | n/a | 42,1% | 64,1% | 0,0% | 14,7% |

Pruebas pareadas sobre las mismas preguntas (semilla 0; McNemar exacto y bootstrap de 10.000 remuestras):

| Comparación | Benchmark | n | Antes | Después | Diferencia (IC 95%) | Solo antes correcto / solo después correcto | p de McNemar |
|---|---|---|---|---|---|---|---|
| Qwen3-1.7B → WSP Clinical 1.7B | MedQA-USMLE (4 opciones) | 1.273 | 45,1% | 52,7% | +7,6 pts (+5,3 a +9,9) | 63 / 160 | 6,5e-11 |
| Qwen3-1.7B → WSP Clinical 1.7B | MedMCQA | 1.000 | 42,1% | 46,3% | +4,2 pts (+1,7 a +6,6) | 58 / 100 | 0,001 |
| Qwen3-1.7B → WSP Clinical 1.7B | MMLU | 1.089 | 64,1% | 71,9% | +7,8 pts (+5,4 a +10,3) | 52 / 137 | 5,1e-10 |
| Parche aleatorio 1 → WSP Clinical 1.7B | MedQA-USMLE (4 opciones) | 1.273 | 45,8% | 52,7% | +6,9 pts (+4,6 a +9,2) | 72 / 160 | 7,5e-09 |
| Parche aleatorio 1 → WSP Clinical 1.7B | MedMCQA | 1.000 | 43,7% | 46,3% | +2,6 pts (+0,1 a +5,1) | 63 / 89 | 0,042 |
| Parche aleatorio 1 → WSP Clinical 1.7B | MMLU | 1.089 | 66,8% | 71,9% | +5,0 pts (+2,9 a +7,2) | 51 / 106 | 1,4e-05 |
| Parche aleatorio 2 → WSP Clinical 1.7B | MedQA-USMLE (4 opciones) | 1.273 | 44,9% | 52,7% | +7,8 pts (+5,5 a +10,1) | 69 / 168 | 1,0e-10 |
| Parche aleatorio 2 → WSP Clinical 1.7B | MedMCQA | 1.000 | 42,6% | 46,3% | +3,7 pts (+1,1 a +6,3) | 66 / 103 | 0,005 |
| Parche aleatorio 2 → WSP Clinical 1.7B | MMLU | 1.089 | 63,0% | 71,9% | +8,9 pts (+6,6 a +11,3) | 42 / 139 | 2,5e-13 |

No se han publicado en la información disponible resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU completo, etc.) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.031.739.904 parámetros, en fp16/bf16 se requieren aproximadamente 4,1 GB solo para pesos, más overhead de activaciones y caché KV. En cuantización de 8 bits, alrededor de 2,1 GB; en 4 bits, alrededor de 1,1 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; A100, H100 o L40S para despliegues con contexto largo y concurrencia. Una RTX 4090 (24 GB) permite fp16 con holgura.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 y en tarjetas con 4–6 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en el repo). No se documentan en la información disponible integraciones específicas con vLLM, llama.cpp u Ollama, aunque al ser safetensors de un transformer Qwen3 estándar son conversiones plausibles.
- Latencia y throughput: no disponibles en la información proporcionada. El protocolo de evaluación permite hasta 32.768 tokens nuevos por pregunta con thinking activado, lo que implica generaciones largas y coste de decodificación elevado en comparación con respuestas directas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MedQA-USMLE (4 opciones) | MedMCQA | MMLU médico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OpenMed/Qwen3-1.7B-WSP-Clinical | 2,03B | No disponible | 52,7% | 46,3% | 71,9% | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | ~2B | No disponible en la información proporcionada | 45,1% | 42,1% | 64,1% | Apache-2.0 | Hugging Face |
| Parche aleatorio mismo tamaño (control del autor) | 2,03B | No disponible | 44,9%–45,8% | 42,6%–43,7% | 63,0%–66,8% | Apache-2.0 | No publicado como modelo independiente |
| Otros modelos clínicos de ~2B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación más directa y con datos verificables es contra el checkpoint base Qwen3-1.7B y contra los parches aleatorios de control incluidos en la model card. No se dispone de datos de benchmarks de otros modelos clínicos de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación en edición y evaluación de modelos; la model card indica explícitamente que no es apto para uso clínico.
- El rendimiento en MedQA-USMLE es del 52,7%, lejos de lo necesario para asistencia médica real; un error de casi la mitad de las preguntas de examen no es aceptable en ningún flujo clínico.
- La edición se realizó con un editor propietario (Claude Opus 5.5) y un conjunto de datos de práctica limitado (splits de entrenamiento de MedQA y MedMCQA); el riesgo de sobreajuste a esos formatos y estilos de pregunta es real y no se ha medido fuera de los benchmarks declarados.
- Los resultados proceden de una única muestra por pregunta en la semilla 0 para la mayoría de métricas; solo MedQA se reporta con tres semillas. La varianza en otros benchmarks no está caracterizada.
- Los datos de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinación: inherente a un modelo de 2B sin alineamiento adicional; la edición no aborda este problema y la model card no reporta evaluaciones de veracidad.
- Sesgos conocidos: no documentados en la información proporcionada. Al heredar los pesos de Qwen3-1.7B, arrastra los sesgos del modelo base, que tampoco se detallan aquí.
- Idiomas soportados: no disponibles; la evaluación se limita a preguntas en inglés de exámenes médicos estadounidenses.
- Licencia Apache-2.0 permite uso comercial del modelo, pero la model card restringe el uso previsto a investigación; conviene revisar los créditos de los insumos (modelo base y datasets) antes de cualquier despliegue.
- El protocolo de evaluación con thinking activado y hasta 32.768 tokens nuevos implica un coste computacional alto por consulta, poco adecuado para aplicaciones de baja latencia.
- No se han publicado evaluaciones de seguridad, toxicidad ni comportamiento fuera del dominio médico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/Qwen3-1.7B-WSP-Clinical
- Organización OpenMed en Hugging Face: https://huggingface.co/OpenMed
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- OpenMed en X: https://x.com/OpenMed_AI
- Anuncio de Qwen3 (openlm.ai): https://openlm.ai/qwen3/
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
