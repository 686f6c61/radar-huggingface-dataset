# ddvd233/hb27b_specgap_ship_retrieval_websearch_global_step_200

## Resumen

El modelo `ddvd233/hb27b_specgap_ship_retrieval_websearch_global_step_200` es un artefacto de investigación publicado en HuggingFace por el usuario ddvd233. Se trata de los pesos fusionados (merge) en safetensors bf16 del checkpoint FSDP de verl correspondiente al paso global 200 del experimento `hb27b_specgap_ship_retrieval_websearch`, que forma parte del proyecto RRIMed-27B (entrenamiento con recompensas auto-evolutivas, "self-evolving rewards"). El modelo parte de `Qwen/Qwen3.6-27B` y se ha sometido a un proceso de aprendizaje por refuerzo orientado a tareas médicas, con evaluación principal en HealthBench Professional.

El problema que aborda es el de mejorar el razonamiento clínico y la precisión de respuesta en preguntas médicas abiertas de nivel profesional, empleando un esquema de RL donde las recompensas se generan de forma automática a partir de tareas escritas por el propio modelo. En el paso 200 alcanza una exactitud ajustada por longitud de 0,485 en HealthBench Professional, frente a 0,374 del modelo sin entrenar y 0,392 de la línea base con prompt fijo; el mejor paso de la ejecución fue el 120, con 0,516, cuyos pesos se perdieron por la rotación de checkpoints.

Se trata de un artefacto con 27.356.728.560 parámetros (unos 27,36 mil millones) y 54,7 GB de pesos en bf16. No tiene descargas ni valoraciones, la ficha no documenta idiomas soportados ni tipos de cuantización, y el propio autor lo etiqueta explícitamente como artefacto de investigación no apto para uso clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen/Qwen3.6-27B; el autor no la describe) |
| Parámetros totales | 27.356.728.560 (~27,36 mil millones, dato real de safetensors) |
| Parámetros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo contiene pesos bf16; no se publican GGUF ni cuantizaciones de otro tipo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, pesos fusionados desde un checkpoint FSDP de verl) |

Datos adicionales: tamaño del repositorio 54,7 GB; pipeline declarado `reinforcement-learning`; etiquetas `medical`, `reinforcement-learning`, `verl`, `qwen3_5`; creado el 11 de septiembre de 2026 y actualizado el mismo día; 0 descargas y 0 likes.

## Arquitectura y entrenamiento

No se documenta la arquitectura interna más allá de la herencia del modelo base `Qwen/Qwen3.6-27B`; el autor no especifica si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni detalla la composición del dataset, el número de tokens vistos o si hubo fases de RLHF o DPO. Lo que sí se explicita es el procedimiento: los pesos publicados son el resultado de fusionar (merge) un checkpoint FSDP generado con la librería verl, es decir, un entrenamiento por refuerzo distribuido con sharding de parámetros, optimizador y estados.

La innovación declarada es el uso de recompensas auto-evolutivas dentro del experimento RRIMed-27B, en la ejecución principal de HealthBench Professional con la configuración denominada ARM 16. El modelo se entrena sobre tareas escritas por el propio modelo ("model-written tasks"), lo que introduce un bucle de generación y evaluación automática de datos. El checkpoint publicado corresponde al paso global 200 y fue seleccionado porque fue el mejor que sobrevivió a la rotación de checkpoints; según la ficha, el mejor paso por validación de toda la ejecución fue el 120 (0,516), pero sus pesos no se conservaron. Este checkpoint se utilizó además para las filas de transferencia a HealthBench Hard y a MedXpertQA.

## Capacidades

- Generación de texto y razonamiento médico de nivel profesional, orientado a preguntas abiertas del estilo HealthBench Professional.
- Respuesta a preguntas clínicas con formato libre, evaluada con exactitud ajustada por longitud, lo que implica respuestas de extensión variable.
- Razonamiento multi-paso en dominios médicos, dado que el entrenamiento por refuerzo se orienta a tareas de resolución compleja.
- Transferencia a otros conjuntos de evaluación médica: la ficha indica que el checkpoint se usó para las filas de transferencia a HealthBench Hard y MedXpertQA.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning con herramientas: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Generación de tareas médicas escritas por modelo, en el contexto del pipeline de entrenamiento con recompensas auto-evolutivas.

## Casos de uso

- Investigación en aprendizaje por refuerzo con recompensas auto-evolutivas: el checkpoint sirve como referencia reproducible de un paso intermedio (step 200) del experimento RRIMed-27B, útil para analizar la curva de mejora entre pasos (0,374 sin entrenar, 0,392 con prompt fijo, 0,485 en el paso 200, 0,516 en el paso 120).
- Evaluación comparativa en HealthBench Professional: permite reproducir la métrica de exactitud ajustada por longitud del paso 200 y contrastarla con la línea base y con el modelo sin entrenar, sin necesidad de reentrenar.
- Estudios de transferencia entre benchmarks médicos: al haber sido empleado para las filas de transferencia a HealthBench Hard y MedXpertQA, es adecuado como punto de partida para analizar hasta qué punto el ajuste en un benchmark generaliza a otros más exigentes.
- Punto de partida para fine-tuning adicional: al ser un merge en safetensors bf16 sobre `Qwen/Qwen3.6-27B` con licencia Apache 2.0, se puede cargar como modelo base para nuevas fases de SFT o RL sin partir de cero.
- Análisis de comportamiento y calibración en dominios de alto riesgo: útil en investigación para medir tasas de error, verbosidad y efectos de la longitud de respuesta en contextos médicos, siempre en un marco no clínico.
- Generación de conjuntos de datos sintéticos de preguntas médicas: el pipeline original se basa en tareas escritas por el modelo, por lo que puede emplearse para producir candidatos que luego se filtren y validen de forma externa.
- Educación médica no clínica: como generador de explicaciones y material de estudio para estudiantes, con revisión humana obligatoria y sin uso diagnóstico.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la ficha del autor y se refieren a HealthBench Professional con exactitud ajustada por longitud.

| Evaluación | Configuración | Resultado |
|---|---|---|
| HealthBench Professional (length-adjusted accuracy) | Modelo sin entrenar (untrained) | 0,374 |
| HealthBench Professional (length-adjusted accuracy) | Línea base con prompt fijo (fixed-prompt baseline) | 0,392 |
| HealthBench Professional (length-adjusted accuracy) | Este checkpoint, paso global 200 | 0,485 |
| HealthBench Professional (length-adjusted accuracy) | Mejor paso de la ejecución (paso 120, pesos no conservados) | 0,516 |

No se han publicado resultados numéricos para otras evaluaciones en la información disponible. La ficha menciona que este checkpoint se usó en las filas de transferencia a HealthBench Hard y a MedXpertQA, pero no incluye las cifras correspondientes.

## Requisitos de hardware

- VRAM estimada en bf16 (formato publicado): alrededor de 55 GB solo para los pesos, más la caché KV y el overhead de ejecución; en la práctica se necesitan del orden de 65-80 GB de VRAM.
- VRAM estimada en int8/fp8 (requiere cuantización posterior, no publicada): aproximadamente 27-30 GB para los pesos.
- VRAM estimada en 4 bits (requiere cuantización posterior, no publicada): aproximadamente 14-17 GB para los pesos.
- GPU recomendadas para bf16: NVIDIA A100 80 GB o H100 80 GB en una sola tarjeta; en multi-GPU, 2 x A100 40 GB o 2 x H100 con paralelismo tensorial.
- Opciones en GPU de consumo: en bf16 no cabe en ninguna GPU de consumo actual; con cuantización a 4 bits podría caber en RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090, dependiendo de la longitud de contexto efectiva y del tamaño de la caché KV.
- Opciones de despliegue: vLLM, SGLang o TGI para bf16 y fp8, sujetos a que exista soporte para la arquitectura del modelo base `Qwen/Qwen3.6-27B`; llama.cpp u Ollama requerirían una conversión a GGUF que no se proporciona en el repositorio. El checkpoint original de entrenamiento es un FSDP de verl y no es directamente servible sin el merge ya realizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| `ddvd233/hb27b_specgap_ship_retrieval_websearch_global_step_200` | 27,36 mil millones | no disponible | Apache 2.0 | HealthBench Professional (ajustada por longitud): 0,485 en el paso 200 | Pesos bf16 en HuggingFace, 0 descargas |
| `Qwen/Qwen3.6-27B` (modelo base) | etiquetado como 27B | no disponible | no disponible en la información proporcionada | no disponible (la ficha cita 0,374 sin entrenar en HealthBench Professional, atribuido al estado previo al ajuste) | Modelo base público |
| Otros fine-tunes médicos de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se han encontrado alternativas comparables en la información disponible |

No se dispone de datos de benchmarks de terceros que permitan una comparación cuantitativa con otros modelos médicos de tamaño similar.

## Limitaciones y advertencias

- El propio autor declara que es un artefacto de investigación y que no debe usarse con fines clínicos ("Not for clinical use").
- Entrenado sobre tareas escritas por el propio modelo, lo que puede reforzar errores presentes en el modelo base y reducir la diversidad de los datos frente a un corpus humano curado.
- Evaluado únicamente en una familia de benchmarks (HealthBench Professional, con menciones de transferencia a HealthBench Hard y MedXpertQA sin cifras publicadas), por lo que la generalización a otros dominios médicos no está demostrada.
- El mejor checkpoint de la ejecución (paso 120, 0,516) no se conservó por la rotación de checkpoints, de modo que los pesos publicados no son los de mejor validación y existe una diferencia de 0,031 puntos respecto al óptimo declarado.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación, verificación factual ni tasas de error por subdominio.
- Idiomas soportados: no disponibles; no se puede asumir un rendimiento multilingüe equivalente al del modelo base.
- Sesgos conocidos: no disponibles en la información proporcionada; no hay análisis de sesgo demográfico ni de equidad clínica.
- La métrica publicada es exactitud ajustada por longitud, lo que puede favorecer respuestas concisas; no se ofrecen métricas de seguridad, calibración o utilidad clínica.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero la advertencia de "no apto para uso clínico" y el carácter de artefacto de investigación desaconsejan cualquier despliegue en producción sanitaria sin validación independiente.
- Inconsistencia menor en los metadatos: la etiqueta del repositorio indica `qwen3_5` mientras que el campo de modelo base apunta a `Qwen/Qwen3.6-27B`.
- No se publican cuantizaciones, ni datos de latencia, ni instrucciones de despliegue distintas del merge a safetensors bf16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddvd233/hb27b_specgap_ship_retrieval_websearch_global_step_200
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.6-27B
- Librería de entrenamiento por refuerzo verl: no se proporciona enlace directo en la información disponible (se menciona como etiqueta y en la descripción del checkpoint)
- Benchmarks citados (HealthBench Professional, HealthBench Hard, MedXpertQA): no se proporcionan enlaces en la información disponible
- Los resultados de búsqueda web obtenidos no contienen información relevante sobre este modelo: se trata de páginas de Zhihu sobre sistemas educativos, compresión de archivos y la serie de videojuegos Rusty Lake, sin relación con el artefacto descrito.
