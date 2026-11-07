# OpenMed/Qwen3.5-0.8B-WSP-Clinical

## Resumen

OpenMed/Qwen3.5-0.8B-WSP-Clinical es una edición de pesos del modelo Qwen3.5-0.8B de Qwen (Alibaba Cloud), publicada por OpenMed. No se trata de un fine-tuning: no ha habido descenso de gradiente ni entrenamiento con datos. El cambio consiste en la eliminación de una única dirección en la proyección de salida de atención (`o_proj`) de la capa 23, la última del modelo, mediante una técnica denominada *weight-space programming* descrita por Takehi, Teoh, Zhang y Khattab (MIT CSAIL, 2026), en la que un modelo frontera lee los pesos en un kernel de Python y los modifica directamente.

El objetivo es mejorar el rendimiento en preguntas de examen médico con formato de opción múltiple. Sobre el conjunto de test MedQA-USMLE (1.273 preguntas) el modelo alcanza un 39,0 % de acierto, frente al 24,4 % del Qwen3.5-0.8B original, una diferencia pareada de +14,6 puntos (IC 95 %: +11,6 a +17,5; McNemar p = 2,6e-21). El modelo base es un transformer causal de 24 capas con encoder de visión, atención híbrida (Gated DeltaNet lineal combinada con atención completa) y un contexto nativo de 262.144 tokens.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de edición de pesos como alternativa de bajo coste (2,25 USD de API y 60 minutos) al fine-tuning; por otro, advierte de que el modelo está destinado exclusivamente a investigación sobre edición y evaluación de modelos, y no al uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de visión; atención híbrida: bloques de 3 capas Gated DeltaNet (atención lineal) seguidas de 1 capa de atención completa, repetidos 6 veces (24 capas) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (contexto nativo del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 se describe como multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura de Qwen3.5-0.8B: 24 capas causales con un encoder de visión integrado mediante fusión temprana texto-imagen, y un diseño híbrido que alterna seis bloques compuestos por tres capas de Gated DeltaNet (atención lineal) y una capa de atención completa con compuerta. La dimensión del modelo es de 1.024. Esta combinación busca alto throughput y baja latencia sobre el contexto nativo de 262.144 tokens.

No hay entrenamiento en esta edición. El procedimiento, *weight-space programming*, consistió en que un modelo editor (Claude Opus 5.5 de Anthropic, con esfuerzo de razonamiento `high`) leyera los pesos en un kernel de Python y modificara directamente la proyección `o_proj` de la capa 23, eliminando una sola dirección. El editor dispuso únicamente de los splits de entrenamiento de MedQA-USMLE (10.178 preguntas) y 10.000 preguntas de entrenamiento de MedMCQA. El proceso requirió 12 pasadas forward, 39 ejecuciones de Python y 52 turnos, con un coste de 2,25 USD de API y 60 minutos de tiempo de reloj (ejecución `sw_q35_08b`). Como control se generaron dos parches aleatorios del mismo tamaño y dirección aleatoria (semillas 1 y 2), que no superaron al modelo original.

## Capacidades

- Generación de texto y razonamiento en formato conversacional, con plantilla de chat propia de Qwen3.5.
- Respuesta a preguntas de opción múltiple de temática médica y clínica (MedQA, MedMCQA, MMLU medical).
- Modo *thinking*: el modelo genera un bloque `</think>` previo a la respuesta final; la evaluación oficial se basa en la última línea `Answer: X` posterior a ese bloque.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado del encoder de visión del modelo base.
- Capacidades multilingües heredadas de la familia Qwen3.5 (sin listado explícito de idiomas en la información disponible).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre edición de pesos: replicar o auditar el experimento de *weight-space programming* comparando este checkpoint con el Qwen3.5-0.8B original y con los parches aleatorios de control, usando los mismos prompts y protocolo de evaluación.
- Evaluación de robustez de modelos pequeños en dominios especializados: medir la diferencia entre el modelo editado y el base en MedQA, MedMCQA y MMLU medical para estudiar cuánto conocimiento de dominio puede inyectarse sin entrenamiento.
- Generación de preguntas de práctica para exámenes tipo USMLE: el modelo responde en el formato exacto de opción múltiple A-D con una línea `Answer: X` final, lo que facilita el parseo automático en herramientas de estudio.
- Docencia y simulación de casos clínicos: construir un banco de preguntas con razonamiento previo (`</think>`) para discutir el razonamiento diferencial, siempre con supervisión humana y sin uso diagnóstico.
- Despliegue en hardware de borde o consumer: con 873 millones de parámetros y pesos en safetensors de 1,8 GB, puede ejecutarse en GPU de gama media para prototipos de demostración.
- Benchmarking de pipelines de evaluación médica: servir como referencia de un modelo de 0,8B con rendimiento conocido en MedQA (39,0 %) para calibrar comparaciones con modelos mayores.
- Pruebas de formato y plantillas de chat: validar que un pipeline de inferencia respeta el protocolo de evaluación (temperatura 0,6, top_p 0,95, top_k 20, penalización de presencia 1,5, hasta 32.768 tokens nuevos).

## Benchmarks y rendimiento

Resultados declarados por el autor (una muestra por pregunta, semilla 0, modo *thinking* activado, temperatura 0,6, top_p 0,95, top_k 20, penalización de presencia 1,5, máximo 32.768 tokens nuevos):

| Checkpoint | MedQA (semilla 0) | MedQA, mediana de 3 semillas (rango) | MedMCQA | MMLU medical | MedQA respuestas cortadas a 32.768 tokens | MedQA sin línea calificable |
|---|---|---|---|---|---|---|
| OpenMed WSP Clinical 0.8B (este modelo) | 39,0 % | 38,6 % (37,0 % a 39,0 %) | 39,9 % | 55,4 % | 19,6 % | 0,0 % |
| Parche aleatorio, mismo tamaño y dirección aleatoria (semilla 1) | 25,7 % | n/a | 28,3 % | 45,4 % | 19,2 % | 31,7 % |
| Parche aleatorio, mismo tamaño y dirección aleatoria (semilla 2) | 23,8 % | n/a | 30,5 % | 45,7 % | 18,2 % | 33,7 % |
| Qwen3.5-0.8B original | 24,4 % | 23,1 % (22,1 % a 24,4 %) | 30,6 % | 43,4 % | 18,3 % | 32,9 % |

Tests pareados sobre las mismas preguntas (McNemar exacto; IC 95 % por bootstrap con 10.000 remuestreos):

| Comparación | Benchmark | n | Antes | Después | Diferencia (IC 95 %) | Solo antes correcto / solo después correcto | p de McNemar |
|---|---|---|---|---|---|---|---|
| Qwen3.5-0.8B -> WSP Clinical 0.8B | MedQA-USMLE (4 opciones) | 1.273 | 24,4 % | 39,0 % | +14,6 pts (+11,6 a +17,5) | 105 / 291 | 2,6e-21 |
| Qwen3.5-0.8B -> WSP Clinical 0.8B | MedMCQA | 1.000 | 30,6 % | 39,9 % | +9,3 pts (+6,2 a +12,4) | 87 / 180 | 1,3e-08 |
| Qwen3.5-0.8B -> WSP Clinical 0.8B | MMLU | 1.089 | 43,4 % | 55,4 % | +11,9 pts (+8,9 a +15,0) | 88 / 218 | 6,9e-14 |
| Parche aleatorio 1 -> WSP Clinical 0.8B | MedQA-USMLE (4 opciones) | 1.273 | 25,7 % | 39,0 % | +13,3 pts (+10,5 a +16,3) | 106 / 276 | 1,4e-18 |
| Parche aleatorio 1 -> WSP Clinical 0.8B | MedMCQA | 1.000 | 28,3 % | 39,9 % | +11,6 pts (+8,5 a +14,7) | 75 / 191 | 7,7e-13 |
| Parche aleatorio 1 -> WSP Clinical 0.8B | MMLU | 1.089 | 45,4 % | 55,4 % | +10,0 pts (+7,0 a +13,1) | 100 / 209 | 5,4e-10 |
| Parche aleatorio 2 -> WSP Clinical 0.8B | MedQA-USMLE (4 opciones) | 1.273 | 23,8 % | 39,0 % | +15,2 pts (+12,3 a +18,1) | 88 / 282 | 8,3e-25 |
| Parche aleatorio 2 -> WSP Clinical 0.8B | MedMCQA | 1.000 | 30,5 % | 39,9 % | +9,4 pts (+6,0 a +12,8) | 106 / 200 | 8,4e-08 |

Los resultados de la comparación del parche aleatorio 2 frente a WSP Clinical en MMLU no están completos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, con 873 millones de parámetros y pesos en safetensors de 1,8 GB, la inferencia en fp16 requiere aproximadamente 1,8 GB solo para pesos, más memoria para el contexto (que puede crecer de forma notable con los 262.144 tokens nativos).
- GPU recomendadas: no especificadas por el autor. El modelo base se comercializa para despliegue en borde (Qualcomm AI Hub), lo que sugiere viabilidad en hardware móvil y GPU de gama media.
- ¿Cabe en GPU consumer? Por tamaño de parámetros, sí en GPU consumer con suficiente VRAM para pesos y caché de contexto; no se dispone de cifras oficiales de consumo.
- Opciones de despliegue: la librería declarada es `transformers`. No se confirman integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MedQA | MedMCQA | MMLU medical | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OpenMed/Qwen3.5-0.8B-WSP-Clinical | 873 M | 262.144 | 39,0 % | 39,9 % | 55,4 % | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 873 M | 262.144 | 24,4 % | 30,6 % | 43,4 % | no disponible en la información | Hugging Face |
| Parche aleatorio de control (semilla 1) | 873 M | 262.144 | 25,7 % | 28,3 % | 45,4 % | Apache-2.0 | no disponible como checkpoint público |

No se dispone de datos de otros modelos médicos comparables (por ejemplo, de la familia Meditron o MedGemma) en la información proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigación sobre edición y evaluación de modelos; el autor declara explícitamente que no es apto para uso clínico.
- Riesgo de alucinación: el 19,6 % de las respuestas en MedQA se cortaron al límite de 32.768 tokens, lo que indica que el modelo puede entrar en razonamientos excesivamente largos sin concluir.
- El rendimiento en MedQA es del 39,0 %, muy por debajo de lo necesario para cualquier aplicación asistencial; un 61 % de respuestas son incorrectas.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de idioma: no se especifica la lista de idiomas soportados; la evaluación se realizó en inglés.
- La edición se aplicó sobre una única dirección en una única capa, por lo que el efecto puede no generalizar a otras tareas médicas ni a otros formatos de pregunta.
- El método depende de un modelo editor propietario (Claude Opus 5.5) y de su API; la reproducibilidad exacta requiere acceso a dicho modelo y a la misma configuración.
- Licencia Apache-2.0 para los pesos, pero deben revisarse las licencias de los datos de entrada (MedQA-USMLE, MedMCQA, MMLU) y del modelo base.
- No se han publicado datos de cuantización, latencia ni throughput, lo que limita la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/Qwen3.5-0.8B-WSP-Clinical
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organización OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- OpenMed en X: https://x.com/OpenMed_AI
- Qwen3.5 0.8B en Modal: https://modal.com/library/qwen/qwen3-5-0-8b
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
