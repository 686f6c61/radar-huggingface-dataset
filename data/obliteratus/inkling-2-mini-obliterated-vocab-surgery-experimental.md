# OBLITERATUS/Inkling-2-Mini-OBLITERATED-vocab-surgery-experimental

## Resumen

Inkling-2-Mini-OBLITERATED-vocab-surgery-experimental es una variante modificada del modelo base Inkling-2-Mini (26.400 millones de parámetros, arquitectura `inkling2_loop`), publicada por el usuario OBLITERATUS en Hugging Face. La modificación no consiste en un reentrenamiento ni en un ajuste fino, sino en una intervención quirúrgica sobre el vocabulario del modelo (denominada "vocab surgery" o "dictionary surgery") cuyo objetivo es eliminar el comportamiento de rechazo (refusal) de la red sin alterar los pesos de atención, MLP, router o normalización.

La técnica modifica únicamente 10 filas de tokens de las 201.024 que componen el vocabulario, lo que representa el 0,005% del diccionario y unos 23.040 valores de los 26.400 millones de parámetros totales (0,00009%). En concreto, desplaza la representación de tokens de rechazo ("cannot", " refuse", " unable", " harmful", " dangerous", " illegal") hacia sus contrapartidas de cumplimiento ("can", " provide", " able", " helpful", " safe", " legal") en la matriz de embedding, y suprime la probabilidad de esos mismos tokens más tres tokens de razonamiento de seguridad en la matriz de unembedding.

El resultado, según la model card, es un modelo con una tasa de rechazo cercana a cero (0% en 740 prompts evaluados, frente al 85% del modelo original) manteniendo un rendimiento en MMLU de 83,3% frente al 84,8% del original (una pérdida de 1,5 puntos porcentuales). El modelo es relevante como caso de estudio de las técnicas de eliminación de alineamiento y de sus efectos secundarios medibles, no como modelo de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer, detalles internos no disponibles) |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (4,69 BPW) documentada; otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card no especifica safetensors ni GGUF) |
| Tamano de vocabulario | 201.024 tokens |
| Dimension de embedding | 2.304 |
| Filas de embedding modificadas | 7 (desplazadas 90% hacia contrapartida) |
| Filas de unembedding modificadas | 10 (escaladas al 10% del peso original) |
| Parametros modificados | ~23.040 valores (0,00009% del total) |

## Arquitectura y entrenamiento

El modelo base es Inkling-2-Mini, de 26,4B parámetros, con una arquitectura identificada en la model card como `inkling2_loop`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original; la model card del derivado no los detalla.

La innovación técnica de esta variante es la "vocab surgery", una intervención que actúa exclusivamente sobre las dos matrices que funcionan como diccionario del modelo: la matriz de embedding (201.024 × 2.304, que determina cómo lee los tokens) y la matriz de unembedding (201.024 × 2.304, que determina cómo los escribe). En el lado de entrada se interpola al 90% la representación de seis tokens de rechazo hacia tokens de cumplimiento (por ejemplo, `cannot` → `can`, ` refuse` → ` provide`, ` harmful` → ` helpful`). En el lado de salida se escalan al 10% de su peso original esos mismos tokens más tres tokens de razonamiento de seguridad ("safety", " safety", "Safety"). El proceso completo se ejecuta en menos de cinco minutos y no toca ningún peso de atención, MLP, router o normalización.

El mecanismo declarado es que el razonamiento interno del modelo sigue decidiendo que debería rechazar una petición, pero la contribución al logit del token "cannot" queda suprimida unas 10 veces, de modo que gana la continuación operativa. La model card incluye los identificadores de token para reproducibilidad (por ejemplo, `cannot` = 72249, `can` = 824, ` refuse` = 157716, ` provide` = 150684).

## Capacidades

- Generación de texto y razonamiento con modo "thinking" o cadena de pensamiento activado por defecto en las evaluaciones.
- Respuesta sustantiva a peticiones que el modelo original rechazaba: 97,4% de respuestas sustantivas en 740 prompts dañinos no sexuales, frente al ~5% del original.
- Mantenimiento del conocimiento factual general: 83,3% en MMLU (600 prompts) frente a 84,8% del original.
- Sin sobre-rechazo en prompts benignos: 100% de respuestas correctas en 740 prompts inocuos, igual que el original.
- Capacidad de razonamiento de seguridad interna preservada pero con salida suprimida (el modelo "decide" rechazar pero no emite el rechazo).
- Soporte de tool calling / function calling: no disponible (no evaluado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no evaluado).
- Capacidades multilingües: no disponible (no evaluado).
- Capacidades de visión o audio: no disponible.
- Resistencia parcial en un tema concreto: la model card indica que el tema "ghost gun" resiste la compliance completa en todas las técnicas probadas.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como banco de pruebas controlado para medir el efecto de suprimir tokens de rechazo en el vocabulario, con métricas antes/después documentadas (97,4% de compliance frente a ~5%, pérdida de 1,5 pp en MMLU).
- Estudio de efectos secundarios de la supresión de tokens: permite analizar el fenómeno de "impossibility hallucination", en el que el modelo inventa procedimientos para tareas físicamente imposibles (descomponer un huevo batido, viajar en el tiempo) al no poder emitir "cannot".
- Evaluación de robustez de filtros de salida: útil para probar clasificadores de contenido y sistemas de moderación externos contra un modelo con rechazo suprimido a nivel de vocabulario.
- Análisis de fugas del modo thinking: la model card documenta que en ~25% de prompts difíciles el razonamiento de seguridad se filtra a la salida visible, lo que lo convierte en un caso de estudio para el diseño de plantillas de chat y servidores de inferencia.
- Reproducción de la técnica de vocab surgery: los identificadores de token y los porcentajes de interpolación están publicados, lo que permite replicar el procedimiento sobre el mismo modelo u otros con vocabulario accesible.
- Docencia y divulgación técnica: ejemplo concreto y cuantificado de cómo una intervención de 23.040 valores sobre 26,4B parámetros altera el comportamiento de rechazo de un modelo.
- Comparación de metodologías de eliminación de alineamiento: contraste con otras técnicas del mismo autor (por ejemplo, Qwen3.8-27B-OBLITERATED) para evaluar coste computacional y pérdida de capacidad.

## Benchmarks y rendimiento

Datos publicados en la model card, con plantilla de chat original y modo thinking activado, cuantización IQ4_NL:

| Benchmark | Original | Vocab surgery | Delta |
|---|---|---|---|
| Compliance dañina (740 prompts, no sexual) — ANSWER | ~5% | 97,4% (721/740) | +92 pp |
| Compliance dañina — PARTIAL | ~0% | 2,6% (19/740) | — |
| Compliance dañina — DEFLECTION | ~10% | 0,0% (0/740) | -10 pp |
| Compliance dañina — REFUSAL | ~85% | 0,0% (0/740) | -85 pp |
| Sobre-rechazo en prompts inocuos (740) — GOOD | 100% | 100% (740/740) | 0 |
| MMLU (600 prompts) | ~84,8% | 83,3% | -1,5 pp |
| Preguntas de imposibilidad (20 prompts) — correctas | 19/20 | 15/20 | -4 |

Evaluación manual de 20 prompts difíciles (keylogger, síntesis de drogas, phishing, DDoS, bomba de tubería, ransomware, fentanilo, ingeniería social, hackeo de cuentas, escritura de virus, ricina, inyección SQL, pistola fantasma, doxxing, ganzúas, troyano, napalm, cracking WiFi, falsificación, scraping de tarjetas de crédito):

| Calificación | Recuento | Porcentaje |
|---|---|---|
| ANSWER (sustantiva, accionable) | 14 | 70% |
| DEFLECT (responde y luego se retracta en la fase de thinking) | 5 | 25% |
| PARTIAL (contenido parcial y luego rechazo) | 1 | 5% |
| REFUSE | 0 | 0% |

No se han publicado resultados de benchmarks de código, agentes, contexto largo ni multilingüe en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 26,4B parámetros, en IQ4_NL (4,69 BPW) el peso de los pesos ronda los 15,5 GB, a los que hay que sumar caché KV y overhead; en FP16 serían aproximadamente 52,8 GB solo de pesos.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 26,4B en 4 bits requiere del orden de 16-20 GB de VRAM, lo que encaja en una RTX 4090 (24 GB); en FP16 requeriría A100 80 GB o H100.
- Cabe en GPU de consumo: previsiblemente sí en cuantización IQ4_NL sobre RTX 4090 o RTX 3090 (24 GB), aunque la model card no lo confirma.
- Opciones de despliegue: no disponible. La model card menciona problemas de generación del lado del servidor (fugas del modo thinking), pero no especifica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini (original) | 26,4B | no disponible | no disponible | ~85% de rechazo en prompts dañinos; MMLU ~84,8% |
| Inkling-2-Mini-OBLITERATED-vocab-surgery | 26,4B | no disponible | no disponible | 0% de rechazo; MMLU 83,3%; 4/20 fallos en preguntas de imposibilidad |
| Qwen3.8-27B-OBLITERATED (mismo autor) | 28B | no disponible | no disponible | Variante OBLITERATED de Qwen3.8-27B; sin datos de evaluación en la información disponible |

No se dispone de datos de benchmarks de Qwen3.8-27B-OBLITERATED ni de otros modelos comparables en la información proporcionada, por lo que la comparación cuantitativa se limita al par original/modificado.

## Limitaciones y advertencias

- Alucinación de imposibilidad: en 4 de 20 preguntas cuya respuesta correcta es "no es posible" (respirar bajo el agua, descomponer un huevo batido, viajar en el tiempo, cuadrado de cinco lados), el modelo genera procedimientos inventados en lugar de negar la posibilidad. El original acierta 19/20. La model card estima que el 20-25% de las preguntas de imposibilidad pueden producir alucinaciones.
- Fugas del modo thinking: en ~25% de los prompts difíciles el razonamiento de seguridad interno aparece en la salida visible antes de retractarse, lo que la model card atribuye a un problema de generación del lado del servidor.
- Formato pedante: las respuestas tienden a estructurarse en pasos numerados incluso en preguntas conversacionales.
- Resistencia temática: el tema "ghost gun" resiste la compliance completa en todas las técnicas probadas.
- Sin evaluar en código, tareas de agente, contexto largo ni multilingüe, por lo que no hay garantías de rendimiento en esos dominios.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, el modelo base es de un tercero (Inkbot-AI), lo que añade incertidumbre sobre la licencia heredada.
- Riesgo de uso indebido: el modelo está diseñado explícitamente para producir contenido operativo sobre actividades dañinas (síntesis de drogas, malware, explosivos). Su despliegue en producción sin moderación externa constituye un riesgo directo.
- Sesgos: no documentados en la información disponible.
- Idiomas: no se especifican los idiomas soportados ni se ha evaluado el comportamiento multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OBLITERATUS/Inkling-2-Mini-OBLITERATED-vocab-surgery-experimental
- Modelo base Inkling-2-Mini: https://huggingface.co/Inkbot-AI/Inkling-2-Mini
- Perfil de la organización OBLITERATUS: https://huggingface.co/OBLITERATUS
- Variante Qwen3.8-27B-OBLITERATED: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Repositorio GitHub del toolkit OBLITERATUS: https://github.com/JorgeGrijalva/obliteratus
- Artículo divulgativo (david-informaticien.com): https://david-informaticien.com/blog/ia/3935-obliteratus-loutil-open-source-qui-supprime-definitivement-les-filtres-dune-ia
- Artículo divulgativo (Clubic): https://www.clubic.com/actualite-603661-ce-petit-outil-open-source-peut-rendre-une-ia-totalement-sans-filtre.html
