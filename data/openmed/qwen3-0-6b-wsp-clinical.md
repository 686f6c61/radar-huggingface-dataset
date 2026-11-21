# OpenMed/Qwen3-0.6B-WSP-Clinical

## Resumen

Qwen3-0.6B-WSP-Clinical es un modelo de lenguaje de 751.632.384 parámetros desarrollado por OpenMed a partir de Qwen/Qwen3-0.6B. No se trata de un ajuste fino convencional: el modelo se obtiene mediante una edición directa de pesos (weight-space programming), una técnica descrita por Takehi, Teoh, Zhang y Khattab (MIT CSAIL, 2026) en la que un modelo frontera lee los tensores en un kernel de Python y modifica los valores sin descenso de gradiente ni datos de entrenamiento. En concreto, se han reescrito las proyecciones de salida (`o_proj`) de cinco cabezas de atención en cuatro capas (capa 20 cabezas 10 y 11, capa 21 cabeza 9, capa 23 cabeza 5, capa 24 cabeza 10).

El objetivo es que el modelo responda preguntas de examen médico en el formato solicitado. Sobre las 1.273 preguntas del test de MedQA-USMLE (4 opciones) alcanza un 37,5% de acierto, frente al 15,2% del Qwen3-0.6B original, una diferencia pareada de +22,2 puntos (IC 95% +19,6 a +24,9; McNemar p = 8,5e-58). También mejora en MedMCQA (36,3% frente a 16,1%) y en MMLU médico (52,6% frente a 19,3%).

Es relevante ahora porque demuestra que una intervención quirúrgica sobre un número muy reducido de parámetros puede producir ganancias sustanciales en un dominio concreto, sin reentrenamiento. El modelo está pensado para investigación sobre edición de modelos y evaluación, no para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), edición de pesos en `o_proj` de 5 cabezas de atención en 4 capas |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B; el autor no la declara explícitamente) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3-0.6B, un transformer decoder-only con atención estándar. La modificación consiste en la reescritura de las proyecciones de salida de atención de cinco cabezas repartidas en las capas 20, 21, 23 y 24, es decir, en la mitad profunda de la red. Según la model card, no hay entrenamiento: no se ejecutó descenso de gradiente, no se usaron datos de entrenamiento para ajustar pesos y el cambio se realizó mediante weight-space programming, con un modelo frontera como editor que realizó 12 pasadas forward, 38 ejecuciones de Python y 51 turnos de interacción.

El editor pudo consultar únicamente las particiones de entrenamiento de MedQA-USMLE (10.178 preguntas) y 10.000 preguntas de entrenamiento de MedMCQA. La evaluación se realizó con el protocolo del paper: thinking activado, temperatura 0,6, top_p 0,95, top_k 20, penalización de presencia 1,5, hasta 32.768 tokens nuevos, una muestra por pregunta con semilla 0 (y semillas 1 y 2 en MedQA). La respuesta se extrae de la última línea `Answer: X` tras `</think>`, con X entre A y D; las respuestas truncadas o sin línea evaluable cuentan como incorrectas. El modelo conserva la misma arquitectura, tokenizador, plantilla de chat y muestreo que el base; solo cambian los valores de los pesos.

## Capacidades

- Generación de texto conversacional en formato de preguntas y respuestas de opción múltiple.
- Razonamiento clínico básico orientado a exámenes médicos (MedQA-USMLE, MedMCQA, MMLU médico).
- Modo thinking: el modelo emite razonamiento antes de la respuesta final, con la etiqueta `</think>`.
- Formateo de respuesta estructurado (`Answer: X`), lo que facilita el parseo automático en pipelines de evaluación.
- Capacidades generales heredadas de Qwen3-0.6B (generación de texto, respuesta a instrucciones), aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Investigación sobre edición de modelos: sirve como caso de estudio reproducible de weight-space programming, comparando el checkpoint editado con el base y con parches aleatorios del mismo tamaño para aislar el efecto de la edición.
- Evaluación de protocolos de respuesta en exámenes médicos: el formato fijo `Answer: X` y la gestión explícita de respuestas truncadas permiten medir de forma estandarizada la tasa de respuestas evaluables.
- Baseline ligero para tareas de QA médico de opción múltiple: con 751 millones de parámetros puede ejecutarse en hardware modesto y servir como referencia frente a modelos mayores en MedQA y MedMCQA.
- Estudio de robustez y calibración: la comparación entre semillas (0, 1 y 2) y el análisis de respuestas sin línea evaluable permiten analizar la estabilidad del formato de salida.
- Docencia y divulgación técnica: ilustra de forma concreta cómo unos pocos cambios en proyecciones de atención afectan al comportamiento del modelo, útil en cursos de interpretabilidad y edición de redes.
- Pruebas de pipelines de inferencia con TGI o transformers: al ser compatible con text-generation-inference y endpoints, sirve para validar integraciones de despliegue con modelos pequeños antes de escalar a modelos mayores.
- Análisis de sesgo y seguridad en dominios clínicos: permite estudiar cómo un modelo pequeño responde a preguntas médicas y qué tipo de errores comete, siempre en contexto de investigación y nunca como herramienta diagnóstica.

## Benchmarks y rendimiento

Resultados declarados por el autor (una muestra por pregunta, semilla 0, thinking activado, protocolo del paper):

| Checkpoint | MedQA (semilla 0) | MedQA, mediana de 3 semillas (rango) | MedMCQA | MMLU médico | Respuestas truncadas a 32.768 tokens | Respuestas sin línea evaluable |
|---|---|---|---|---|---|---|
| OpenMed WSP Clinical 0.6B (este modelo) | 37,5% | 37,1% (36,4%–37,5%) | 36,3% | 52,6% | 0,0% | 0,2% |
| Parche aleatorio, mismo tamaño, dirección aleatoria (semilla 1) | 17,4% | n/a | 17,6% | 21,7% | 0,0% | 57,0% |
| Parche aleatorio, mismo tamaño, dirección aleatoria (semilla 2) | 14,8% | n/a | 17,9% | 17,8% | 0,0% | 60,8% |
| Qwen3-0.6B original | 15,2% | n/a | 16,1% | 19,3% | 0,0% | 60,4% |

Pruebas pareadas sobre las mismas preguntas (McNemar exacto y bootstrap con 10.000 remuestreos):

| Comparación | Benchmark | n | Antes | Después | Diferencia (IC 95%) | Solo antes correcto / solo después correcto | McNemar p |
|---|---|---|---|---|---|---|---|
| Qwen3-0.6B → WSP Clinical 0.6B | MedQA-USMLE (4 opciones) | 1.273 | 15,2% | 37,5% | +22,2 pts (+19,6 a +24,9) | 36 / 319 | 8,5e-58 |
| Qwen3-0.6B → WSP Clinical 0.6B | MedMCQA | 1.000 | 16,1% | 36,3% | +20,2 pts (+17,2 a +23,2) | 34 / 236 | 2,2e-38 |
| Qwen3-0.6B → WSP Clinical 0.6B | MMLU | 1.089 | 19,3% | 52,6% | +33,3 pts (+30,2 a +36,4) | 27 / 390 | 1,4e-83 |
| Parche aleatorio 1 → WSP Clinical 0.6B | MedQA-USMLE (4 opciones) | 1.273 | 17,4% | 37,5% | +20,0 pts (+17,3 a +22,8) | 56 / 311 | 5,7e-44 |
| Parche aleatorio 1 → WSP Clinical 0.6B | MedMCQA | 1.000 | 17,6% | 36,3% | +18,7 pts (+15,7 a +21,7) | 39 / 226 | 3,4e-33 |
| Parche aleatorio 1 → WSP Clinical 0.6B | MMLU | 1.089 | 21,7% | 52,6% | +30,9 pts (+27,8 a +34,0) | 31 / 368 | 2,7e-74 |
| Parche aleatorio 2 → WSP Clinical 0.6B | MedQA-USMLE (4 opciones) | 1.273 | 14,8% | 37,5% | +22,6 pts (+19,8 a +25,4) | 51 / 339 | 2,7e-53 |
| Parche aleatorio 2 → WSP Clinical 0.6B | MedMCQA | 1.000 | 17,9% | 36,3% | +18,4 pts (+15,3 a +21,4) | 45 / 229 | 7,4e-31 |
| Parche aleatorio 2 → WSP Clinical 0.6B | MMLU | 1.089 | 17,8% | 52,6% | +34,8 pts (+31,7 a +37,9) | 28 / 407 | 2,5e-87 |

El autor menciona además una "puntuación agnóstica al formato" como métrica secundaria, pero los valores no están incluidos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en FP16/BF16 (coincide con el tamaño del repo de 1,5 GB); en cuantización de 8 bits alrededor de 0,8 GB y en 4 bits alrededor de 0,4 GB, estimaciones derivadas del número de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, RTX 3060, RTX 4090); en entornos de servidor, A100, H100 o L40S para despliegues concurrentes.
- Cabe en GPU consumer: sí, con holgura, incluidas GPUs de gama baja y portátiles.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (el modelo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp, Ollama y TGI no están confirmados explícitamente en la model card para este checkpoint concreto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MedQA | MedMCQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenMed/Qwen3-0.6B-WSP-Clinical | 751.632.384 | no disponible | 37,5% | 36,3% | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 751.632.384 (aprox.) | no disponible | 15,2% | 16,1% | Apache-2.0 | Hugging Face |
| Parche aleatorio del mismo tamaño (control del autor) | 751.632.384 | no disponible | 17,4% / 14,8% (semillas 1 y 2) | 17,6% / 17,9% | Apache-2.0 | No publicado como modelo independiente |

No se dispone de datos de benchmarks de otros modelos médicos comparables en la información proporcionada, por lo que la comparativa se limita al modelo base y a los controles del propio autor.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigación sobre edición de modelos y evaluación; la model card indica explícitamente que no es apto para uso clínico.
- El 37,5% de acierto en MedQA implica que el modelo falla aproximadamente 6 de cada 10 preguntas del examen; no es un sistema fiable para decisiones médicas.
- Riesgo de alucinación: la edición se limita a cinco cabezas de atención en cuatro capas y no incorpora conocimiento médico verificado; el modelo puede generar razonamientos plausibles pero incorrectos.
- La mejora se ha medido con un protocolo de evaluación muy específico (thinking activado, formato `Answer: X`, una muestra por pregunta); el rendimiento fuera de ese formato o en preguntas abiertas no está caracterizado.
- El autor reporta una métrica secundaria "agnóstica al formato" cuyos valores no se incluyen en la información disponible, lo que limita la comparación con otros sistemas.
- Idiomas soportados no declarados: no hay garantía de comportamiento en castellano ni en otros idiomas distintos del inglés de los benchmarks.
- Longitud de contexto no declarada en la model card; debe consultarse la del Qwen3-0.6B base antes de usarlo en tareas de contexto largo.
- Licencia Apache-2.0 permite uso comercial del checkpoint, pero las licencias de los datos de entrada (MedQA, MedMCQA, MMLU) deben revisarse por separado según la model card.
- Los resultados son declarados por el autor y no han sido verificados de forma independiente (el campo `verified` del model-index es `false`).
- No se documentan sesgos demográficos, geográficos ni de subrepresentación en los datos de práctica del editor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/Qwen3-0.6B-WSP-Clinical
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Organización OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Organización OpenMed en GitHub: https://github.com/openmed-labs/
- Sitio web de OpenMed: https://openmed.life/
- Documentación de OpenMed: https://www.openmed.icu/
- Perfil de OpenMed en X: https://x.com/OpenMed_AI
- Dataset MedQA-USMLE (4 opciones): https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
