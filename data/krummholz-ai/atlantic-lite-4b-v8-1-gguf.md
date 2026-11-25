# krummholz-ai/atlantic-lite-4b-v8.1-GGUF

## Resumen

Krummholz Atlantic Lite 4B v8.1 es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) afinado por Krummholz AI LLC (Belfast, Maine) a partir de Qwen/Qwen3.5-4B, publicado bajo licencia Apache 2.0. Su distribución principal es en formato GGUF, orientada a ejecución en hardware de consumo dentro del arnés (harness) propietario de Krummholz, y está diseñado explícitamente para no ser "máximamente útil" sino "máximamente veraz": prefiere decir "no lo sé" antes que inventar, delega en herramientas cuando las tiene disponibles y rechaza peticiones dañinas con más frecuencia que su versión anterior (v8).

La versión v8.1 incorpora una ronda adicional de entrenamiento de preferencias sobre respuestas generadas por el propio modelo con el razonamiento activado, cubriendo tres tipos de pares nuevos: rechazos ante peticiones dañinas etiquetadas por el clasificador de HarmBench, corrección de afirmaciones falsas construidas por código (productos, porcentajes, conversiones de unidades, respuestas erróneas a preguntas factuales) y abstenciones limpias cuando el razonamiento agotaba el límite de tokens. Según la model card, ningún texto de respuesta fue escrito por una persona ni por otro modelo.

El modelo está etiquetado únicamente para inglés (`language: [en]`) y su relevancia actual radica en su enfoque poco habitual: una "constitución" explícita de cinco principios ordenados jerárquicamente (las personas como fines, la verdad por delante de todo, temperamento burkeano, conocimiento científico práctico y neutralidad política) de la que se derivan los datos de entrenamiento, las evaluaciones y las salvaguardas del arnés. Es un caso de estudio de alineación orientada a la calibración y la abstención más que al rendimiento bruto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-4B; arquitectura del base no detallada en la información proporcionada) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repo incluye al menos Q4_K_M, evaluado en la model card); safetensors en precisión completa |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna del modelo base Qwen/Qwen3.5-4B (tipo de transformer, atención, número de capas o dimensión oculta). Lo que sí se documenta es el proceso de afinado: Krummholz parte de los pesos de Qwen3.5-4B y aplica entrenamiento de preferencias (tipo RLHF/DPO, aunque la model card no especifica el algoritmo exacto) sobre respuestas muestreadas del propio modelo con razonamiento activado. La versión v8.1 añade una ronda más de este entrenamiento con tres categorías nuevas de pares de preferencia: rechazos ante peticiones dañinas (etiquetadas por el clasificador de HarmBench, sin entrenar sobre los comportamientos propios de HarmBench), corrección de afirmaciones falsas generadas por código y finalización con abstención limpia ("no lo sé") cuando el razonamiento se agotaba sin conclusión.

La innovación técnica destacable no es arquitectónica sino de alineación: la "constitución" de cinco principios ordenados, de la que se derivan tanto los pares de entrenamiento como las evaluaciones y las reglas del arnés de ejecución. El modelo está pensado para ejecutarse dentro del harness de Krummholz, que aplica reglas y un juez adicionales; la model card advierte explícitamente de que debe leerse la sección "Limits" antes de ejecutarlo por separado. Los resultados publicados comparan pesos en precisión completa con el archivo Q4_K_M ejecutado en llama.cpp sobre las mismas peticiones y con el mismo código de puntuación.

## Capacidades

- Generación de texto conversacional en inglés con razonamiento explícito (thinking mode) activado por defecto en las evaluaciones.
- Abstención calibrada: dice "no lo sé" en lugar de adivinar cuando no tiene herramientas, con un 62% de abstenciones en preguntas factuales sin herramientas (frente al 49% de v8).
- Uso de herramientas (tool calling): 60 de 60 llamadas bien formadas en la evaluación; con herramientas disponibles, busca en el 91% de los casos en lugar de responder de memoria.
- Corrección de afirmaciones falsas del usuario: corrige cálculos erróneos (39 de 60) y hechos falsos ofrecidos para confirmación (10 de 30).
- Resistencia a la presión: mantiene una respuesta correcta bajo presión en 17 de 30 casos.
- Rechazo de peticiones dañinas: 10 de 300 respuestas dañinas en HarmBench en solitario y 0 de 300 tras las reglas y el juez del arnés.
- Capacidades multilingües: no disponibles más allá del inglés.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes de investigación con verificación obligatoria: el modelo está entrenado para derivar hechos comprobables a herramientas en lugar de la memoria (91% de búsquedas cuando hay herramientas), lo que lo hace adecuado para flujos donde la trazabilidad de la fuente es requisito.
- Atención al cliente con política de abstención: su calibración (solo un 6% de respuestas erróneas entre las que da de memoria en precisión completa) encaja en escenarios donde una respuesta incorrecta es más costosa que un "no lo sé" con derivación a un humano.
- Moderación y rechazo en pipelines sensibles: con 10 de 300 respuestas dañinas en solitario y 0 de 300 tras el arnés, sirve como primera capa de filtrado en aplicaciones expuestas a contenido abusivo.
- Verificación de cálculos y unidades en herramientas internas: corrige 39 de 60 cálculos erróneos planteados como hechos, útil en asistentes de ingeniería o finanzas que deben señalar errores del usuario en lugar de validarlos.
- Despliegue en hardware de consumo: con 4,2 mil millones de parámetros y cuantización Q4_K_M, es viable en GPU de gama media y en CPU vía llama.cpp, adecuado para prototipos locales y entornos con requisitos de privacidad.
- Evaluación de alineación y calibración: su constitución explícita y sus métricas de abstención, corrección y rechazo lo convierten en una referencia práctica para investigar trade-offs entre utilidad y veracidad.
- Asistentes con razonamiento acotado: la reducción de razonamientos que nunca terminan (del 20% en v8 al 3% en v8.1) lo hace apto para tareas con presupuesto de tokens limitado donde una abstención limpia es preferible a un razonamiento truncado.

## Benchmarks y rendimiento

Resultados publicados en la model card (razonamiento activado; mismas 229 preguntas factuales sin herramientas, 199 sondas, 120 prompts largos, 60 turnos de uso de herramientas, 120 afirmaciones falsas y HarmBench 300 para las tres columnas):

| Medida | v8 | v8.1 | v8.1 Q4_K_M |
|---|---|---|---|
| Preguntas factuales sin herramientas: respuesta incorrecta | 3% (7) | 2% (5) | 10% (24) |
| Preguntas factuales sin herramientas: respuesta correcta | 28% (63) | 33% (75) | 38% (88) |
| Preguntas factuales sin herramientas: dice que no lo sabe | 49% (113) | 62% (141) | 47% (108) |
| Preguntas factuales sin herramientas: razonamiento sin terminar | 20% (46) | 3% (8) | 4% (9) |
| Erróneas entre las respuestas que da de memoria | 10% | 6% | 21% |
| Con herramientas: busca en lugar de responder de memoria | 93% | 91% | 93% |
| Con herramientas: respuesta incorrecta sin buscar | 0 | 0 | 0 |
| Llamadas a herramientas bien formadas | 60 de 60 | 60 de 60 | 60 de 60 |
| HarmBench: respuestas dañinas, modelo solo | 24 de 300 | 10 de 300 | 6 de 300 |
| HarmBench: respuestas dañinas tras reglas y juez del arnés | 2 de 300 | 0 de 300 | 0 de 300 |
| Corrige un cálculo erróneo planteado como hecho | 29 de 60 | 39 de 60 | 39 de 60 |
| Corrige un hecho falso ofrecido para confirmación | 7 de 30 | 10 de 30 | 10 de 30 |
| Mantiene una respuesta correcta bajo presión | 18 de 30 | 17 de 30 | 21 de 30 |
| Peticiones inofensivas rechazadas | 4 de 120 | 19 de 120 | 14 de 120 |
| Suites de sondas superadas (identidad, historia, soberanía y otras) | 132 de 199 | 117 de 199 | 116 de 199 |
| Media de tokens por respuesta | 511 | 338 | 409 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa por tamaño (no dato del autor): un modelo de 4,2 mil millones de parámetros en Q4_K_M ocupa del orden de 2,5-3 GB de pesos, más overhead de contexto KV; en FP16, unos 8,4 GB solo de pesos.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: la model card describe el modelo como "for consumer hardware" y distribuye GGUF con evaluación específica del archivo Q4_K_M en llama.cpp, lo que confirma su orientación a ejecución local; no se enumeran modelos concretos de GPU.
- Opciones de despliegue: llama.cpp (usado en las evaluaciones del Q4_K_M); el repo incluye safetensors y GGUF, y la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detallan vLLM, TGI u Ollama en la información disponible. El autor indica que está pensado para ejecutarse dentro del arnés de Krummholz.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Krummholz Atlantic Lite 4B v8.1 | 4.205.751.296 | no disponible | Apache 2.0 | safetensors, GGUF | Afinado de preferencias orientado a abstención y veracidad; solo inglés |
| Qwen/Qwen3.5-4B (modelo base) | ~4B (según base declarado) | no disponible | no disponible en la información | no disponible | Base del afinado; sin datos de evaluación comparables en la información proporcionada |
| Krummholz Atlantic Lite 4B v8 | ~4B | no disponible | Apache 2.0 | no disponible | Versión anterior; peor calibración (49% de abstenciones, 24 de 300 dañinas en HarmBench) |

No se dispone de datos de benchmarks de terceros (MMLU, HumanEval, GSM8K) ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que la comparativa se limita a las versiones del propio modelo y a su base.

## Limitaciones y advertencias

- Rechaza y se abstiene más: declina 19 de 120 peticiones inofensivas (frente a 4 en v8) y dice "no lo sé" en el 62% de las preguntas factuales sin herramientas. Es el trade-off buscado, pero reduce la utilidad en tareas donde se espera una respuesta directa.
- La cuantización degrada la calibración: en Q4_K_M, las respuestas erróneas entre las que da de memoria suben al 21% (frente al 6% en precisión completa) y las abstenciones bajan al 47%. Para usos sensibles a la veracidad, considerar pesos completos.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Está diseñado para ejecutarse dentro del arnés de Krummholz; la model card advierte de que debe leerse la sección "Limits" antes de ejecutarlo por separado. Las cifras de 0 de 300 respuestas dañinas dependen de las reglas y el juez del arnés, no solo del modelo.
- Riesgo de alucinación residual: incluso en precisión completa, un 2% de respuestas incorrectas y un 6% de errores entre las respuestas dadas de memoria en preguntas factuales sin herramientas.
- Sesgo de diseño explícito: la constitución incorpora una postura "burkeana" (preferencia por reformas graduales y respeto a instituciones) y una jerarquía de valores que condiciona las respuestas en temas políticos e históricos; es una decisión de diseño, no un sesgo inadvertido, pero conviene evaluarla frente a los requisitos de cada aplicación.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe verificarse por separado (no disponible en la información proporcionada).
- Sin datos de benchmarks estándar publicados, la evaluación independiente de capacidades generales (código, matemáticas, razonamiento) queda pendiente.
- Contexto máximo no documentado: no es posible planificar aplicaciones con ventanas largas sin verificarlo empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/krummholz-ai/atlantic-lite-4b-v8.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos del autor.
