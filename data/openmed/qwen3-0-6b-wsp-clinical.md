# OpenMed/Qwen3-0.6B-WSP-Clinical

## Resumen

OpenMed/Qwen3-0.6B-WSP-Clinical es una edición de pesos del modelo Qwen3-0.6B de Alibaba Qwen, publicada por OpenMed, un proyecto centrado en modelos y herramientas de código abierto para texto clínico y biomédico. No se trata de un fine-tuning: el modelo no ha sido entrenado con descenso de gradiente ni con datos de entrenamiento en el sentido habitual, sino que sus pesos han sido modificados directamente mediante una técnica denominada weight-space programming, descrita en el trabajo de Takehi, Teoh, Zhang y Khattab (MIT CSAIL, 2026). Un modelo frontera (Claude Opus 5.5 de Anthropic) leyó los pesos dentro de un kernel de Python y editó a mano las proyecciones de salida de cinco cabezas de atención en cuatro capas.

El objetivo de la edición es que el modelo responda preguntas de exámenes médicos en el formato solicitado. Sobre las 1.273 preguntas del conjunto de test de MedQA-USMLE (4 opciones), el modelo alcanza un 37,5% de precisión frente al 15,2% del Qwen3-0.6B original, una diferencia emparejada de +22,2 puntos (IC 95%: +19,6 a +24,9; McNemar p = 8,5e-58). El modelo conserva la arquitectura, el tokenizador y la plantilla de chat del modelo base, y se distribuye bajo licencia Apache-2.0.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de edición de pesos sin entrenamiento aplicada a un dominio sanitario; por otro, sirve como referencia metodológica para investigadores interesados en model editing y evaluación. El autor declara explícitamente que el modelo está destinado a investigación sobre edición de modelos y evaluación, y no al uso clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), con edición de pesos en las proyecciones `o_proj` de cinco cabezas de atención en cuatro capas (capa 20 cabezas 10 y 11, capa 21 cabeza 9, capa 23 cabeza 5, capa 24 cabeza 10) |
| Parámetros totales | 751.632.384 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantización | no disponible en la información proporcionada; los pesos se publican en safetensors |
| Idiomas soportados | no disponibles en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B (commit `c1899de289a04d12100db370d81485cdf75e47ca`), un transformer decoder-only denso de la familia Qwen3, y mantiene intactas su arquitectura, su tokenizador y su plantilla de chat. La única diferencia respecto al modelo base son los valores de los pesos: se han modificado las proyecciones de salida (`o_proj`) de cinco cabezas de atención distribuidas en cuatro capas (20, 21, 23 y 24). No hay entrenamiento, ni fine-tuning, ni datos de entrenamiento en el proceso de edición.

La metodología es weight-space programming, según el trabajo de Takehi, Teoh, Zhang y Khattab (MIT CSAIL, 2026). Un modelo frontera, Claude Opus 5.5 de Anthropic con esfuerzo de razonamiento `high`, leyó los pesos dentro de un kernel de Python y los editó directamente, siguiendo las directrices del paper. El proceso consumió 12 pasadas forward, 38 ejecuciones de Python y 51 turnos, con un coste de 1,73 dólares de API y 22 minutos de tiempo de reloj (ejecución `sw_q3_06b`). El editor pudo utilizar únicamente los splits de entrenamiento de MedQA-USMLE (10.178 preguntas) y 10.000 preguntas de entrenamiento de MedMCQA; no tuvo acceso a los conjuntos de test. Como control experimental se generaron parches aleatorios del mismo tamaño y dirección aleatoria, que sirven de comparación en la sección de benchmarks.

## Capacidades

- Generación de texto y respuesta a preguntas de opción múltiple en formato de examen médico (MedQA-USMLE, MedMCQA, MMLU medical).
- Razonamiento con modo thinking: la evaluación se realizó con thinking activado, temperatura 0,6, top_p 0,95, top_k 20, presence penalty 1,5 y un máximo de 32.768 tokens nuevos; la respuesta se extrae de la última línea `Answer: X` tras `</think>`.
- Razonamiento clínico básico: el modelo responde preguntas de medicina general y de subespecialidades en formato de examen, aunque con precisión limitada (37,5% en MedQA).
- Capacidades multilingües: no disponibles en la información proporcionada; heredadas del modelo base Qwen3-0.6B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; el modelo base Qwen3 sí lo soporta, pero no se documenta para esta edición.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales: modo thinking, heredado del modelo base Qwen3.

## Casos de uso

- Investigación en model editing: el modelo sirve como caso de estudio reproducible de weight-space programming aplicado a un dominio concreto, con métricas antes/después y controles aleatorios documentados. Es adecuado porque el autor publica el protocolo completo, los seeds y los tests estadísticos.
- Evaluación de metodologías de edición de pesos: permite comparar la edición dirigida frente a parches aleatorios del mismo tamaño, con resultados publicados en MedQA, MedMCQA y MMLU medical. Útil para validar si una técnica de edición generaliza o sobreajusta al formato del examen.
- Experimentos de alineación de formato: el modelo demuestra que una edición de pesos puede hacer que un modelo pequeño responda en el formato solicitado (`Answer: X`) sin entrenamiento, lo que resulta útil para estudiar cómo se codifica el formato en las representaciones internas.
- Docencia en técnicas de interpretabilidad y edición: sirve como ejemplo práctico en cursos o talleres sobre edición de modelos, dado su tamaño reducido (751,6 M de parámetros) y su bajo coste de reproducción (1,73 dólares de API y 22 minutos).
- Prototipado de asistentes de estudio médico: con las debidas advertencias y sin uso clínico, puede emplearse para generar preguntas de práctica o explicaciones básicas en entornos educativos controlados, siempre que se validen las respuestas con fuentes médicas.
- Análisis de sesgos y errores en dominios especializados: el modelo permite estudiar patrones de fallo (por ejemplo, el 0,2% de respuestas sin línea calificable en MedQA) y comparar con el modelo base para identificar qué tipos de preguntas se benefician de la edición.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo. Misma arquitectura, tokenizador, plantilla de chat y muestreo en todas las filas; solo cambian los valores de los pesos. Una muestra por pregunta con seed 0 (MedQA también con seeds 1 y 2). Thinking activado, temperatura 0,6, top_p 0,95, top_k 20, presence penalty 1,5, máximo 32.768 tokens nuevos.

| Checkpoint | MedQA (seed 0) | MedQA, mediana de 3 seeds (rango) | MedMCQA | MMLU medical | MedQA respuestas cortadas a 32.768 tokens | MedQA respuestas sin línea calificable |
|---|---|---|---|---|---|---|
| OpenMed WSP Clinical 0.6B (este modelo) | 37,5% | 37,1% (36,4%–37,5%) | 36,3% | 52,6% | 0,0% | 0,2% |
| Parche aleatorio, mismo tamaño, dirección aleatoria (seed 1) | 17,4% | n/a | 17,6% | 21,7% | 0,0% | 57,0% |
| Parche aleatorio, mismo tamaño, dirección aleatoria (seed 2) | 14,8% | n/a | 17,9% | 17,8% | 0,0% | 60,8% |
| Qwen3-0.6B original | 15,2% | n/a | 16,1% | 19,3% | 0,0% | 60,4% |

Tests emparejados sobre las mismas preguntas (seed 0; McNemar exacto sobre las preguntas que solo uno de los checkpoints acertó; IC 95% bootstrap sobre preguntas, 10.000 remuestreos):

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
| Parche aleatorio 2 → WSP Clinical 0.6B | MMLU | 1.089 | 21,7% | 52,6% | +30,9 pts (+27,8 a +34,0) | 31 / 368 | 2,7e-74 |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors en fp16/bf16, el modelo ocupa aproximadamente 1,5 GB (tamaño del repo). En cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,4 GB. Estas cifras son estimaciones basadas en el número de parámetros y no están verificadas en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16, como una GTX 1650 o superior. Para mayor comodidad, una RTX 3060 (12 GB) o RTX 4090 (24 GB) permiten ejecutar el modelo con contexto largo y varias peticiones concurrentes.
- Cabe en GPU de consumo: sí, en la mayoría de GPU de consumo modernas, incluidas las de gama baja con 4 GB o más.
- Opciones de despliegue: transformers (librería indicada en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documentan explícitamente vLLM, llama.cpp u Ollama en la información proporcionada, aunque al ser un modelo Qwen3 en safetensors es probable que sean compatibles; no se dispone de confirmación.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El modelo base Qwen3-0.6B es de tamaño reducido, por lo que se espera una latencia baja en GPU de consumo, pero no hay cifras publicadas para esta edición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MedQA (seed 0) | MedMCQA | MMLU medical | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OpenMed/Qwen3-0.6B-WSP-Clinical | 751,6 M | no disponible | 37,5% | 36,3% | 52,6% | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,8 B (aprox.) | no disponible | 15,2% | 16,1% | 19,3% | Apache-2.0 | Hugging Face |
| Parche aleatorio mismo tamaño (control) | 751,6 M | no disponible | 14,8%–17,4% | 17,6%–17,9% | 17,8%–21,7% | n/a | No publicado como modelo independiente |

No se dispone de datos de otros modelos clínicos comparables en la información proporcionada. La comparación más directa es con el modelo base Qwen3-0.6B y con los controles aleatorios generados por el propio autor.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigación sobre edición de modelos y evaluación; el autor declara explícitamente que no es apto para uso clínico.
- Precisión limitada: un 37,5% en MedQA-USMLE implica que el modelo falla aproximadamente 6 de cada 10 preguntas; no debe utilizarse para decisiones médicas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al derivar de Qwen3-0.6B, puede heredar los sesgos del modelo base y de los datos con los que fue entrenado.
- Limitaciones de contexto e idioma: no se especifican en la información proporcionada; se heredan del modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor restringe el uso clínico; además, deben respetarse las licencias de los inputs utilizados (modelo base y datasets).
- Caveat de producción: el modelo ha sido editado con una metodología experimental y no ha pasado por un proceso de validación clínica; su comportamiento fuera del formato de examen médico es incierto.
- El 0,2% de respuestas en MedQA no contienen línea calificable, lo que indica que el formato de salida no es perfectamente estable.
- El proceso de edición utilizó datos de entrenamiento de MedQA y MedMCQA; aunque no se usaron los conjuntos de test, existe riesgo de sobreajuste al formato y al dominio de estos benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/Qwen3-0.6B-WSP-Clinical
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Organización OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- OpenMed en X: https://x.com/OpenMed_AI
- Paper de weight-space programming (Takehi, Teoh, Zhang y Khattab, MIT CSAIL, 2026): no disponible en la información proporcionada
- Documentación de Qwen3: https://openlm.ai/qwen3/
