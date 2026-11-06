# luvette/Ternary-Bonsai-2-9B-Decisive-V2-GGUF

## Resumen

Ternary-Bonsai-2-9B Decisive V2 es una edición de pesos sin entrenamiento (*training-free weight edit*) del checkpoint prism-ml/Ternary-Bonsai-2-9B, un modelo de 8.953.803.264 parámetros (aproximadamente 9B) derivado de la familia Qwen3.5. La desarrolla el usuario luvette y su objetivo es corregir dos hábitos concretos del modo de razonamiento del modelo base: reabrir decisiones ya tomadas ("Wait…", "Actually…", "Let's go with… no…") y volver a comprobar operaciones matemáticas ya resueltas. El resultado es un modelo que piensa un 43% menos en GSM8K y un 27% menos en MATH-500 manteniendo una precisión equivalente en los problemas que ambos modelos terminan.

La técnica empleada es ablación direccional en el flujo residual: se identifican dos direcciones comparando activaciones y se proyectan fuera de las matrices de pesos en forma cerrada, sin gradientes, sin datos de entrenamiento y sin fine-tuning. Las matrices editadas se almacenan con un redondeo consciente de la proyección (*projection-aware rounding*) para que la cuantización no reintroduzca las direcciones eliminadas. El resultado se distribuye en formato GGUF y funciona con llama.cpp estándar.

La relevancia práctica es doble: por un lado reduce el consumo de tokens de razonamiento en producción, y por otro demuestra una vía de modificación de comportamiento en modelos ya cuantizados sin reentrenar. Esta V2 sustituye a la Decisive V1 (checkpoint g22): es más pequeña (3,14 GB frente a 4,23 GB), más rápida y evaluada sobre GSM8K, MATH-500 e IFEval en lugar de un conjunto interno reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5, según tags del repositorio); no se detalla en la información disponible |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (las evaluaciones usan un presupuesto de razonamiento de 12.288 tokens, no la ventana de contexto) |
| Tipos de cuantizacion | GGUF; el checkpoint principal q6pa-m usa almacenamiento Q6_K con redondeo consciente de la proyección; existe una variante alternativa q6pa; el modelo base es ternario |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, compatible con Ollama) |

## Arquitectura y entrenamiento

El modelo parte de prism-ml/Ternary-Bonsai-2-9B-gguf, un modelo ternario de aproximadamente 9B parámetros con almacenamiento Q6_K. Sobre ese checkpoint se aplica una edición de pesos sin entrenamiento: se localizan dos direcciones en el flujo residual mediante comparación de activaciones (una asociada a la reapertura de decisiones y otra a la re-verificación matemática) y se proyectan fuera de las matrices de pesos en forma cerrada. No hay gradientes, ni dataset de entrenamiento, ni RLHF/DPO en esta edición.

La innovación técnica destacable es el redondeo consciente de la proyección (*projection-aware rounding*), que evita que la cuantización posterior reintroduzca las direcciones ablacionadas. El checkpoint se denomina q6pa-m: almacenamiento Q6_K, redondeo consciente de la proyección y la dirección matemática incluida. Existe una variante q6pa que aplica solo una de las direcciones (sin la de re-verificación matemática). El modelo funciona con llama.cpp estándar (probado con el commit 620d2225c) sin parches ni kernels personalizados.

## Capacidades

- Generación de texto conversacional y razonamiento en modo *thinking* (cadena de pensamiento explícita).
- Razonamiento matemático: GSM8K y MATH-500 con precisión comparable al base y menos tokens de pensamiento.
- Seguimiento de instrucciones con restricciones de formato y longitud (IFEval), con una ligera pérdida frente al base.
- Reducción drástica de la reapertura de decisiones: 0,61 *hedges* por respuesta frente a 15,8 del base en el conjunto de desarrollo.
- Menor tasa de agotamiento del presupuesto de razonamiento: 2 de 200 casos en desarrollo con 8k tokens, frente a 5 del base.
- Compatibilidad con llama.cpp y Ollama; etiquetado como compatible con endpoints.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Idiomas soportados: no disponible.

## Casos de uso

- Razonamiento matemático en producción con presupuesto de tokens acotado: el modelo resuelve más problemas dentro de un límite fijo de 12.288 tokens porque termina antes; en MATH-500 pasa del 75,2% al 81,2% a ese presupuesto, lo que lo hace adecuado para pipelines con coste por token controlado.
- Evaluación automática de soluciones matemáticas: con 3.747 tokens medios de pensamiento en MATH-500 frente a 5.120 del base, reduce el coste de generar cadenas de razonamiento para comparar o puntuar respuestas.
- Despliegue local en estaciones de trabajo: al ser un GGUF de 3,14 GB ejecutable con llama.cpp estándar, cabe en equipos de consumo y permite experimentar sin infraestructura de GPU dedicada.
- Integración en asistentes conversacionales que requieren respuestas directas: la supresión de reaperturas de decisión (0,61 hedges por respuesta) produce cadenas de pensamiento más lineales y respuestas finales menos titubeantes.
- Prototipado con Ollama: el repositorio incluye la etiqueta ollama y el formato GGUF, lo que facilita arrancar un servidor local de inferencia con un solo comando para pruebas de concepto.
- Investigación sobre edición de pesos: sirve como caso reproducible de ablación direccional sobre un modelo cuantizado, útil para estudiar cómo modificar comportamientos sin reentrenar.
- Tareas de razonamiento de formato libre donde el presupuesto de tokens es el cuello de botella: al agotarse menos veces el presupuesto, mejora la tasa de finalización en problemas largos.

## Benchmarks y rendimiento

Resultados publicados en la model card, con muestreo de modo thinking del modelo base (temperatura 1,0, top-p 0,95, top-k 20, presence penalty 1,0), llama.cpp 620d2225c y presupuesto de 12.288 tokens. GSM8K: 250 ítems; MATH-500: 250 ítems; IFEval: 300 prompts. Qwen3.5-9B se evaluó sobre los primeros 100 / 100 / 150 ítems respectivamente.

| Metrica | Qwen3.5-9B (Q4_K_M) | Bonsai base | Decisive V1 (g22) | Decisive V2 (q6pa-m) | V2 alternativa (q6pa) |
|---|---|---|---|---|---|
| GSM8K precisión | 95,0% | 95,2% | 95,6% | 94,4% | 94,4% |
| GSM8K tokens de pensamiento | 3.527 | 2.269 | 1.471 | 1.301 | 1.491 |
| MATH-500 precisión | 56,0% | 75,2% | 79,6% | 81,2% | 80,0% |
| MATH-500 tokens de pensamiento | 7.517 | 5.120 | 4.209 | 3.747 | 4.346 |
| MATH-500 fuera de presupuesto | 37 / 100 | 49 / 250 | 35 / 250 | 29 / 250 | 35 / 250 |
| IFEval prompt-level strict | 92,0% | 92,7% | 91,0% | 90,3% | 93,0% |
| IFEval instruction-level strict | 93,8% | 94,4% | 93,5% | 93,3% | 95,0% |
| IFEval tokens de pensamiento | 4.258 | 3.084 | 2.435 | 2.242 | 2.370 |

Comparación emparejada frente al base sobre los mismos ítems (intervalos bootstrap del 95%): GSM8K −0,8 puntos (−3,2 a +1,6, empate); MATH-500 +6,0 puntos (+2,4 a +9,6); IFEval −2,3 puntos (−5,3 a +0,7). Tokens de pensamiento: −43% en GSM8K, −27% en MATH-500 y −27% en IFEval. En los 200 problemas de MATH-500 que ambos modelos terminan, la precisión es equivalente (base 93,5%, V2 93,0%); la mejora procede de los 49 problemas donde el base agotó el presupuesto: V2 termina 21 y acierta 17.

Pensamiento en prompts abiertos (100 prompts de desarrollo × 2 muestras y 100 prompts reservados):

| Metrica | Qwen3.5-9B | Bonsai base | Decisive V1 (g22) | Decisive V2 (q6pa-m) | V2 alternativa (q6pa) |
|---|---|---|---|---|---|
| Dev: media de tokens de pensamiento | 3.194 | 2.570 | 1.687 | 1.706 | 1.741 |
| Dev: percentil 90 | 7.035 | 4.910 | 3.721 | 3.043 | 3.405 |
| Dev: hedges por respuesta | 25,5 | 15,8 | 0,68 | 0,61 | 1,07 |
| Dev: agotó presupuesto (8k) | 11 / 200 | 5 / 200 | 3 / 200 | 2 / 200 | 3 / 200 |
| Held-out: media de tokens de pensamiento | 2.543 | 2.141 | 1.534 | 1.510 | 1.483 |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero principal ocupa 3,14 GB en disco (q6pa-m), por lo que la inferencia completa requiere aproximadamente esa cifra más el contexto y el estado del modelo; el base ocupa 0,58 GB menos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre para el modelo completo en Q6_K; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño (3,14 GB) es compatible con tarjetas de gama media y alta con suficiente VRAM; no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (probado con el commit 620d2225c) y Ollama; el repositorio está etiquetado como compatible con endpoints.
- Latencia y throughput: la decodificación en un solo flujo es aproximadamente un 12% más lenta que el modelo base debido al almacenamiento a 6 bits de las capas editadas; el pensamiento más corto suele compensar esa pérdida en el total de la generación. No se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | GSM8K | IFEval (prompt strict) | Licencia |
|---|---|---|---|---|---|---|
| Decisive V2 (q6pa-m) | ~9B | no disponible | 81,2% | 94,4% | 90,3% | Apache 2.0 |
| Bonsai base | ~9B | no disponible | 75,2% | 95,2% | 92,7% | Apache 2.0 |
| Decisive V1 (g22) | ~9B | no disponible | 79,6% | 95,6% | 91,0% | Apache 2.0 |
| Qwen3.5-9B (Q4_K_M) | ~9B | no disponible | 56,0% (37/100 fuera de presupuesto) | 95,0% | 92,0% | no disponible |

La comparación con Qwen3.5-9B está sesgada por el presupuesto de tokens: el autor indica que su puntuación en MATH-500 se ve limitada por haber agotado el presupuesto en 37 de 100 problemas, y la incluye como referencia de longitud de pensamiento, no como prueba de superioridad de Bonsai.

## Limitaciones y advertencias

- El seguimiento de instrucciones puede haber empeorado: IFEval cae 2,3 puntos (90,3% frente a 92,7%), con todos los métricos a la baja; el intervalo incluye cero, pero la mayoría de los fallos extra son recuentos exactos de palabras ("responde en al menos 300 palabras"). La variante de una sola dirección (q6pa) no muestra esa caída, por lo que la dirección de re-verificación matemática probablemente afecta a estas tareas.
- Mayor coste de memoria y velocidad: las capas editadas se almacenan a 6 bits en lugar de aproximadamente 2; el fichero es 0,58 GB mayor y la decodificación en un solo flujo es un 12% más lenta.
- Pérdida de problemas individuales: en MATH-500 pierde 4 problemas que el base resolvía (dos por falsos negativos de formato del evaluador) y gana 19; en GSM8K empata (−2 de 250).
- Riesgo de alucinación: no se documenta en la información disponible; como todo modelo generativo, requiere verificación en producción.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe.
- Ventana de contexto: no disponible; las cifras de 12.288 tokens corresponden al presupuesto de razonamiento de la evaluación, no a la longitud de contexto del modelo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base podría tener condiciones adicionales que no se detallan en la información proporcionada.
- Las evaluaciones usan muestras fijas de los conjuntos oficiales (250 de 1.319 en GSM8K, 250 de 500 en MATH-500), por lo que los resultados del conjunto completo pueden diferir en uno o dos puntos.
- El modelo está pensado para modo thinking; su comportamiento en modo no-thinking no se documenta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/luvette/Ternary-Bonsai-2-9B-Decisive-V2-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Versión anterior (Decisive V1): https://huggingface.co/luvette/Ternary-Bonsai-2-9B-Decisive-GGUF
- Documento técnico: PAPER.md incluido en el repositorio (no se proporciona URL directa)
- Script de evaluación: code/scripts/run_eval.py incluido en el repositorio (no se proporciona URL directa)
