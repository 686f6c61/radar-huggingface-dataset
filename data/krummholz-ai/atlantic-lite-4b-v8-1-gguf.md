# krummholz-ai/atlantic-lite-4b-v8.1-GGUF

## Resumen

Atlantic Lite 4B v8.1 es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), desarrollado por Krummholz AI LLC (Belfast, Maine) a partir de Qwen/Qwen3.5-4B, que se distribuye bajo licencia Apache 2.0. El modelo está afinado para ser "maximally truth-seeking" en lugar de "maximally helpful": prioriza decir la verdad, expresar su nivel de incertidumbre y admitir "no lo sé" antes que inventar respuestas. Está diseñado explícitamente para ejecutarse dentro del arnés (harness) propietario de Krummholz, con salvaguardas adicionales que el autor describe como parte integral del sistema.

La versión v8.1 introduce una ronda adicional de entrenamiento por preferencias sobre las respuestas del propio modelo, con el razonamiento activado. Los nuevos tipos de pares de preferencia cubren rechazos (refusals) ante peticiones dañinas etiquetadas por el clasificador de HarmBench, corrección de afirmaciones falsas (pushback) y finalización limpia con "no lo sé" cuando el razonamiento alcanza su límite. Esta versión se publica en formato GGUF para su uso en hardware de consumo, con cuantizaciones como Q4_K_M.

El modelo es relevante para desarrolladores e investigadores interesados en alineación orientada a la veracidad, calibración de abstención y evaluación de robustez frente a afirmaciones falsas, más que en maximizar puntuaciones de benchmarks convencionales. Su enfoque constitucional (una "constitución" explícita de cinco principios ordenados jerárquicamente) lo convierte en un caso de estudio práctico de alineación basada en reglas con evaluaciones publicadas de forma transparente, incluyendo los puntos donde el modelo falla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.5-4B) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (incluye Q4_K_M publicado); safetensors en precisión completa |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna en la información proporcionada; el modelo deriva de Qwen/Qwen3.5-4B, por lo que hereda la arquitectura de dicho modelo base, pero la model card no especifica si se trata de un transformer denso, MoE o híbrido, ni detalla la composición del dataset de preentrenamiento original. Lo que sí se documenta con precisión es el proceso de ajuste: el modelo parte de Qwen3.5-4B (Apache 2.0) y se somete a entrenamiento por preferencias (preference training) sobre respuestas generadas por el propio modelo, con el modo de razonamiento activado.

La innovación técnica destacable de v8.1 es el diseño de los pares de preferencia, todos generados automáticamente sin intervención humana ni de otro modelo: (1) rechazos, donde el clasificador de HarmBench etiqueta las respuestas a peticiones dañinas del conjunto propio del proyecto y se prefiere un rechazo breve y claro frente a una respuesta clasificada como dañina (sin muestrear ni entrenar sobre los comportamientos propios de HarmBench); (2) pushback, con afirmaciones falsas construidas por código (producto, porcentaje, conversión de unidades o respuesta errónea a una pregunta de hecho) donde se prefiere la respuesta que enuncia el valor verdadero; y (3) finalización con "no lo sé", donde se prefiere una abstención limpia frente a un razonamiento que se agota sin concluir. La constitución del modelo (cinco principios ordenados: verdad, temperamento burkeano, personas como fines, conocimiento científico práctico y no dependencia de partidos políticos) sirve de base tanto para los pares de entrenamiento como para las evaluaciones y las salvaguardas del arnés.

## Capacidades

- Generación de texto conversacional en inglés con un tono descrito como "colaborador, no asistente": directo, curioso, cálido y dispuesto a discrepar o rechazar.
- Razonamiento con modo "thinking" activado (reasoning on), con capacidad de finalizar limpiamente con una abstención cuando el razonamiento no alcanza una conclusión.
- Abstención calibrada: declara explícitamente "no lo sé" cuando carece de herramientas y no puede verificar un dato, en lugar de responder de memoria.
- Uso de herramientas (tool calling / function calling): en las evaluaciones del autor, realiza 60 de 60 llamadas de herramienta bien formadas y prefiere buscar antes que responder de memoria en el 91 % de los casos con herramientas disponibles.
- Corrección de afirmaciones falsas del usuario (pushback): corrige cálculos erróneos presentados como hecho y datos falsos ofrecidos para confirmación.
- Mantenimiento de una respuesta correcta bajo presión del usuario (17 de 30 casos en v8.1 en precisión completa).
- Rechazo de peticiones dañinas: 10 de 300 respuestas dañinas en HarmBench en precisión completa, y 0 de 300 tras las reglas y el juez del arnés.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés (`language: [en]`).
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes de verificación factual con abstención: el modelo está entrenado para decir "no lo sé" en el 62 % de las preguntas de hecho sin herramientas y para buscar cuando dispone de ellas; es adecuado para sistemas donde una abstención explícita es preferible a una respuesta inventada, como asistentes de documentación técnica o bases de conocimiento internas.
- Integración en pipelines con tool calling: dado que genera 60 de 60 llamadas de herramienta bien formadas y prefiere buscar antes que responder de memoria en el 91 % de los casos, encaja en agentes que consultan APIs, bases de datos o motores de búsqueda antes de responder.
- Moderación y corrección de desinformación en conversaciones: su capacidad de pushback (corrige 39 de 60 cálculos erróneos presentados como hecho y 10 de 30 datos falsos ofrecidos para confirmación) lo hace útil en interfaces que deben señalar afirmaciones incorrectas del usuario sin complacencia.
- Evaluación de robustez y alineación: con evaluaciones publicadas de forma transparente (229 preguntas de hecho retenidas, 199 sondas, 120 prompts largos, 60 turnos de uso de herramientas, 120 afirmaciones falsas, HarmBench 300), sirve como referencia para investigadores que estudian calibración de abstención y resistencia a la presión.
- Despliegue en hardware de consumo: la publicación en GGUF con cuantización Q4_K_M permite ejecutarlo localmente en equipos modestos mediante llama.cpp, con un tamaño de repositorio de 15,1 GB que incluye las distintas variantes de cuantización.
- Sistemas de atención al usuario con política de rechazo: su tasa de rechazo de peticiones inocuas (19 de 120 en v8.1) debe tenerse en cuenta; es adecuado para escenarios donde el coste de un rechazo seguro es menor que el de una respuesta dañina aceptada, como entornos regulados o de soporte a menores.
- Investigación sobre constituciones de alineación: la constitución explícita de cinco principios y su traducción directa en pares de entrenamiento y sondas de evaluación lo convierten en un banco de pruebas para estudiar alineación basada en reglas y su medición.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a la misma evaluación para las tres columnas (229 preguntas de hecho retenidas sin herramientas, 199 sondas, 120 prompts largos, 60 turnos de uso de herramientas, 120 afirmaciones falsas, HarmBench 300), con razonamiento activado. Las columnas v8 y v8.1 son pesos en precisión completa; la última columna es el archivo Q4_K_M publicado, ejecutado con llama.cpp sobre las mismas peticiones y el mismo código de puntuación.

| Medida | v8 | v8.1 | v8.1 Q4_K_M |
|---|---|---|---|
| Preguntas de hecho sin herramientas: respuesta incorrecta | 3 % (7) | 2 % (5) | 10 % (24) |
| Preguntas de hecho sin herramientas: respuesta correcta | 28 % (63) | 33 % (75) | 38 % (88) |
| Preguntas de hecho sin herramientas: dice que no lo sabe | 49 % (113) | 62 % (141) | 47 % (108) |
| Preguntas de hecho sin herramientas: razonamiento nunca terminado | 20 % (46) | 3 % (8) | 4 % (9) |
| Incorrectas entre las respuestas dadas de memoria | 10 % | 6 % | 21 % |
| Con herramientas: busca en lugar de responder de memoria | 93 % | 91 % | 93 % |
| Con herramientas: respuesta incorrecta sin buscar | 0 | 0 | 0 |
| Llamadas de herramienta bien formadas | 60 de 60 | 60 de 60 | 60 de 60 |
| HarmBench: respuestas dañinas, modelo solo | 24 de 300 | 10 de 300 | 6 de 300 |
| HarmBench: respuestas dañinas tras reglas y juez del arnés | 2 de 300 | 0 de 300 | 0 de 300 |
| Corrige un cálculo erróneo presentado como hecho | 29 de 60 | 39 de 60 | 39 de 60 |
| Corrige un dato falso ofrecido para confirmación | 7 de 30 | 10 de 30 | 10 de 30 |
| Mantiene una respuesta correcta bajo presión | 18 de 30 | 17 de 30 | 21 de 30 |
| Peticiones inocuas rechazadas | 4 de 120 | 19 de 120 | 14 de 120 |
| Suites de sondas superadas (identidad, historia, soberanía y otras) | 132 de 199 | 117 de 199 | 116 de 199 |
| Media de tokens por respuesta | 511 | 338 | 409 |

No se han publicado en la información disponible resultados de benchmarks convencionales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa basada en el tamaño de parámetros (4,2 mil millones), la cuantización Q4_K_M ocupa aproximadamente 2,5-3 GB de pesos, mientras que los pesos en precisión completa (safetensors, 16 bits) requieren del orden de 8,4 GB solo para parámetros, más memoria para contexto y overhead.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPUs de consumo; la información no detalla modelos concretos.
- ¿Cabe en GPU de consumo? El repositorio incluye GGUF y una cuantización Q4_K_M publicada, lo que indica que está pensado para hardware de consumo, tal como declara la model card ("A 4B model for consumer hardware"). No se especifican qué GPUs concretas.
- Opciones de despliegue: llama.cpp (utilizado por el autor para evaluar el archivo Q4_K_M); el etiquetado `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card reporta una media de tokens por respuesta (511 en v8, 338 en v8.1, 409 en Q4_K_M), pero no latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Krummholz Atlantic Lite 4B v8.1 | 4.205.751.296 | no disponible | Apache 2.0 | GGUF y safetensors en Hugging Face | Afinado para veracidad y abstención; requiere arnés para rendimiento completo |
| Qwen/Qwen3.5-4B (modelo base) | 4B (aproximado) | no disponible | Apache 2.0 | Hugging Face | Base del afinamiento; sin las modificaciones de veracidad |
| Alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La información proporcionada no incluye resultados de benchmarks de terceros que permitan una comparación numérica con modelos de tamaño similar; la comparativa se limita al modelo base declarado. No se dispone de datos sobre otras alternativas comparables.

## Limitaciones y advertencias

- Rechaza y se abstiene más que la versión anterior: rechaza 19 de 120 peticiones inocuas (frente a 4 en v8) y dice "no lo sé" en el 62 % de las preguntas de hecho sin herramientas. Es el compromiso declarado por el autor, pero implica una tasa alta de rechazos seguros y abstenciones que puede frustrar en aplicaciones que esperan respuestas directas.
- Rendimiento degradado en cuantización Q4_K_M: las respuestas incorrectas entre las dadas de memoria suben al 21 % (frente al 6 % en precisión completa), y las preguntas de hecho incorrectas sin herramientas al 10 % (frente al 2 %). La cuantización afecta la calibración.
- El propio autor advierte que el modelo está pensado para ejecutarse dentro del arnés de Krummholz; la model card indica "read 'Limits' before running it alone" y señala que "alone it is sti..." (texto truncado en la información disponible). El rendimiento en HarmBench tras las reglas y el juez del arnés (0 de 300) no es atribuible al modelo en solitario (10 de 300 en precisión completa).
- Idiomas: solo inglés declarado; no se documenta soporte multilingüe.
- Sesgos conocidos: no documentados explícitamente en la información disponible. La constitución del modelo incluye una postura declarada sobre censura, historia y soberanía, que puede introducir sesgos de selección temática en las respuestas.
- Riesgo de alucinación: mitigado por diseño (abstención y uso de herramientas), pero persiste: 2 % de respuestas incorrectas y 6 % de incorrectas entre las respuestas de memoria en precisión completa.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; el rendimiento completo depende del arnés propietario, cuyas condiciones de uso no se detallan en la información disponible.
- Longitud de contexto no disponible: no es posible evaluar su idoneidad para tareas de contexto largo sin ese dato.
- La información de la model card está truncada ("Alone it is sti..."), por lo que pueden existir limitaciones adicionales no recogidas aquí.

## Enlaces

- Hugging Face: https://huggingface.co/krummholz-ai/atlantic-lite-4b-v8.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
