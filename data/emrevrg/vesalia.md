# emrevrg/Vesalia

## Resumen

Vesalia es un modelo de lenguaje de 31.273.086.512 parámetros (aproximadamente 31B) desarrollado por Norovox Labs y publicado por el usuario emrevrg en Hugging Face. Se trata de un ajuste fino de `google/gemma-4-31B-it` orientado a educación médica, con razonamiento explícito previo a la respuesta y un recetario de inferencia propio que fuerza una respuesta final cuando el bloque de razonamiento agota el presupuesto de tokens. El modelo se distribuye con los pesos completos en bf16 (unos 59 GB) con el adaptador v3 ya fusionado, e incluye adaptadores separados (v3, v2 y "Brief") y tablas de conocimiento integradas en el mismo repositorio.

La propuesta diferencial no es tanto el ajuste fino como la receta de inferencia: el modelo razona primero y, si no concluye dentro del límite de tokens, el sistema cierra el bloque de razonamiento y obliga a emitir una letra de respuesta. Según la model card, esta receta eleva la precisión en un test bloqueado de 400 preguntas médicas de MMLU del 270 (razonamiento sin cierre forzado) al 374 (93,5%), y supera a Baichuan-M2-32B en todos los regímenes probados, empatando con II-Medical-8B en el presupuesto largo.

El modelo se publica como vista previa ("preview") bajo licencia Apache 2.0, con la advertencia explícita de que no es una herramienta clínica: no tiene validación clínica y la decisión final corresponde siempre a un profesional sanitario. Es relevante ahora porque demuestra que un ajuste fino ligero sobre un modelo base grande, combinado con una receta de decodificación y un mecanismo de abstención por consenso, puede competir con modelos médicos abiertos especializados de tamaño comparable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-4-31B-it); detalles internos no disponibles |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); FP8 en vLLM (configuracion usada en los resultados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 65,6 GB; pesos completos ~59 GB en bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 31B instruct, un transformer decoder-only del que no se detallan en la información disponible capas, dimensiones ocultas ni mecanismos de atención. Sobre esa base, Norovox aplica una receta de inferencia propietaria: el modelo genera primero un bloque de razonamiento y, si este supera el presupuesto de tokens sin respuesta final, la receta cierra el bloque y fuerza la emisión de una letra de respuesta. El repositorio contiene los pesos completos con el adaptador v3 fusionado, más los adaptadores `v3_star_adapter/`, `v2_adapter/` y `brief_adapter/` y las tablas de conocimiento en `bilgi/`.

El adaptador v3 se entrenó con STaR (Self-Taught Reasoner) sobre trazas de razonamiento propias correctas y finalizadas de forma natural: 542 trazas médicas y 908 de conocimiento general, sin comprimir, de modo que se entrena el modo de razonamiento en sí. Dos rondas adicionales de autoentrenamiento sobre v3 no mejoraron el conjunto de desarrollo médico (438 → 437 → 436) y fueron descartadas. El adaptador v2 se entrenó por autodestilación médica con repetición general: 1.711 explicaciones médicas propias verificadas y 1.386 explicaciones generales propias verificadas (MMLU auxiliary-train, ARC-Challenge). El adaptador "Brief" se entrenó sobre el razonamiento verificado del propio modelo comprimido en explicaciones cortas, y solo se aceptó porque mantiene precisión y conocimiento general dentro de una tolerancia del 1%. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto con razonamiento explícito previo a la respuesta (bloque de razonamiento y respuesta final separados).
- Respuesta a preguntas de opción múltiple de temática médica con formato de letra de respuesta forzada.
- Explicaciones médicas educativas en modo explicación corta mediante el adaptador "Brief".
- Conocimiento general (evaluado con MMLU no médico), preservado tras el ajuste fino.
- Abstención calibrada: muestreo de 5 respuestas y respuesta solo si hay consenso (4 de 5 o 5 de 5), derivando al clínico cuando no lo hay.
- Autoconsistencia por muestreo múltiple (5 o 10 muestras) para aumentar la precisión a costa de latencia.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Formación médica pregrado: el modelo puede generar explicaciones razonadas de conceptos clínicos (por ejemplo, qué significa una HbA1c elevada) con el adaptador "Brief" para mantener respuestas de unas 87 fichas de longitud, adecuadas para material docente.
- Bancos de preguntas de examen tipo MMLU: la receta de razonamiento con cierre forzado permite obtener una letra de respuesta fiable en preguntas de opción múltiple, con una precisión del 93,5% en el test bloqueado de 400 preguntas médicas.
- Sistemas de triaje educativo con abstención: usando el umbral de consenso 5 de 5, el modelo responde al 95,0% de las preguntas con un 96,1% de acierto y deriva el resto a un profesional, lo que encaja en herramientas de orientación no diagnóstica.
- Generación de material de repaso: el adaptador v2, entrenado sobre explicaciones médicas propias verificadas, produce explicaciones paso a paso útiles para apuntes y guías de estudio.
- Evaluación comparativa de modelos médicos abiertos: el protocolo publicado (mismo test bloqueado, mismo system prompt, decodificación greedy, mismo motor vLLM FP8 y mismo cierre forzado) sirve como referencia reproducible para comparar modelos de 8B a 32B en tareas médicas.
- Investigación en autoentrenamiento: las trazas STaR y los resultados de las rondas rechazadas documentan empíricamente los límites del autoentrenamiento iterativo en dominio médico, útiles para quienes diseñan pipelines de self-distillation.
- Asistencia documental no clínica: con contexto suficiente (longitud no especificada), puede resumir y explicar literatura médica divulgativa, siempre con revisión humana y sin uso diagnóstico.

## Benchmarks y rendimiento

Test bloqueado de 400 preguntas médicas de MMLU, semilla fija, medida una vez por configuración:

| Configuración | Aciertos (de 400) |
|---|---|
| Gemma 4 31B, probabilidad de letra (sin razonamiento) | 349 |
| Gemma 4 31B con razonamiento; respuestas sin terminar contadas como error | 270 |
| Receta Vesalia: razonamiento + cierre forzado | 374 (93,5%) |

Comparación con modelos médicos abiertos bajo el mismo protocolo (mismo test, mismo system prompt, razonamiento activo, greedy, mismo cierre forzado, mismo motor vLLM FP8; significación por McNemar emparejado):

| Presupuesto de tokens | Vesalia | II-Medical-8B | Baichuan-M2-32B |
|---|---|---|---|
| 1.536 | 375 | 370 (p = 0,46) | 357 (p = 0,001) |
| 4.096 | 373 | 377 (p = 0,54) | 361 (p = 0,04) |
| 1.536, autoconsistencia (5 muestras) | 379 | 368 (IC bootstrap [+1, +22], p = 0,06) | 361 (p < 0,001) |
| 4.096, autoconsistencia (5 muestras) | 376 | 377 (p = 1,0) | no disponible |

Adaptador "Brief" en modo explicación corta (sin bloque de razonamiento):

| Métrica | Base | + Brief |
|---|---|---|
| Test bloqueado 400 | 365 | 365 |
| MMLU no médico (300, guarda de conocimiento general) | 250 | 247 |
| Tokens por respuesta | 182 | 87 |
| Respuestas ilegibles | 102 | 5 |

Adaptador v3:

| Configuración | Base | + v3 | II-Medical-8B |
|---|---|---|---|
| Médico 400, 1.536 tokens, muestra única | 375 | 375–378 | 370 (p = 0,17) |
| Médico 400, 4.096 tokens, muestra única | 373 | 377 | 377 (empate) |
| MMLU no médico 300, modo razonamiento | 267 | 269 | no disponible |

Puerta de confianza (abstención por consenso):

| Regla | Desarrollo (466) | Test bloqueado (400) |
|---|---|---|
| Responder siempre (mayoría de 5) | 94,4% precisión | 94,3% precisión |
| Responder solo si 4 de 5 coinciden | 98,1% respondidas, 94,8% correctas | 98,8% respondidas, 95,4% correctas |
| Responder solo si 5 de 5 coinciden | 95,3% respondidas, 96,4% correctas | 95,0% respondidas, 96,1% correctas |

Con 10 muestras y unanimidad, el test bloqueado da 93,0% respondidas y 96,0% correctas. En el subconjunto auditado como correctamente etiquetado por MMLU-Redux, el desarrollo alcanza 99,6% (224 respondidas), pero el test bloqueado da 96,6% (203 respondidas).

## Requisitos de hardware

- VRAM estimada: unos 59 GB en bf16 para los pesos completos; en FP8 (configuración usada en todos los resultados) aproximadamente la mitad, en torno a 30 GB, más memoria para KV cache.
- GPU recomendadas: para FP8, una A100 80 GB o H100 80 GB permiten servir el modelo con holgura; una A100 40 GB o L40S 48 GB pueden ser suficientes en FP8 con contexto moderado, aunque no se documenta en la información disponible.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16 ni presumiblemente en FP8 con contexto útil; se requeriría cuantización de 4 bits (no publicada en el repositorio) o descarga por capas, no documentada.
- Despliegue: vLLM con `--quantization fp8` es la vía documentada; también es compatible con `transformers` (`AutoModelForCausalLM.from_pretrained` con `device_map="auto"`). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modo de autoconsistencia con 5 muestras multiplica el coste de inferencia por cinco; el adaptador "Brief" reduce la longitud de respuesta de 182 a 87 tokens, aproximadamente la mitad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento médico (test bloqueado 400) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vesalia | 31,3B | no disponible | 374–379 según configuración | Apache 2.0 | Hugging Face (pesos completos) |
| II-Medical-8B | 8B (según denominación) | no disponible | 368–377 según configuración | no disponible | no disponible en la información |
| Baichuan-M2-32B | 32B (según denominación) | no disponible | 357–361 según configuración | no disponible | no disponible en la información |
| Gemma 4 31B (base) | 31B | no disponible | 270 con razonamiento sin cierre forzado; 349 sin razonamiento | según modelo base | Hugging Face (google/gemma-4-31B-it) |

Vesalia supera a Baichuan-M2-32B en todos los regímenes con márgenes significativos (p = 0,001 en presupuesto corto, p = 0,04 en largo) y empata con II-Medical-8B en el presupuesto largo; en el corto la diferencia con II-Medical-8B no es significativa (p = 0,46). Frente a su propio modelo base, la receta de cierre forzado aporta 104 aciertos sobre 400 en el test bloqueado.

## Limitaciones y advertencias

- No es una herramienta clínica: carece de validación clínica y requiere aprobación médica obligatoria en cualquier uso real.
- El objetivo de 99% de precisión en preguntas respondidas no se alcanzó: incluso con unanimidad 5 de 5, aproximadamente 4 de cada 100 respuestas emitidas son incorrectas.
- El propio autor califica la publicación como "preview"; los pesos pueden cambiar y no hay garantía de estabilidad.
- Riesgo de alucinación en contenido médico no cubierto por el entrenamiento; el ajuste se basa en trazas propias del modelo, lo que puede amplificar errores sistemáticos.
- La mejora frente a II-Medical-8B no es estadísticamente significativa en varios regímenes, por lo que la ventaja competitiva es limitada.
- El motor FP8 de vLLM no es determinista entre lotes: una segunda ejecución del mismo test dio 375 frente a 378, de ahí el rango reportado.
- El adaptador v2 degrada el conocimiento general en modo solo-letra (260 → 236 sobre 300), por formato de respuesta aprendido; debe usarse en su modo de explicación.
- No se documentan idiomas soportados ni longitud de contexto; no se puede garantizar cobertura multilingüe ni conversaciones de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación clínica hace inadecuado cualquier despliegue en entornos regulados sin evaluación propia.
- Sin datos de sesgos conocidos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emrevrg/Vesalia
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
