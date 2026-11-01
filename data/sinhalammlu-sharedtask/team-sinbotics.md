# SinhalaMMLU-SharedTask/team-sinbotics

## Resumen

Team SinBotics es el sistema presentado por el equipo homónimo a la tarea compartida SinhalaMMLU. No se trata de un modelo entrenado desde cero, sino de un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen3.5-4B, orientado específicamente a responder preguntas de opción múltiple en cingalés (sinhala). El repositorio contiene el adaptador LoRA, el código de entrenamiento, el script de inferencia y las predicciones finales del equipo.

El problema que resuelve es acotado pero concreto: la evaluación de conocimiento en cingalés mediante preguntas tipo MMLU de cuatro opciones. Para ello, el equipo combinó el subconjunto en cingalés de Global-MMLU (14.324 preguntas) con una colección propia denominada sinmulu_si (15.180 preguntas), construida a partir de 3.486 PDFs de exámenes de Sri Lanka (G.C.E. O/L y A/L, y pruebas provinciales). El adaptador se entrena con la pérdida calculada únicamente sobre el dígito de la respuesta.

La relevancia del sistema reside en su enfoque de bajo coste computacional (4,24B parámetros totales en inferencia, por debajo del umbral de 8B que impone la tarea) y en la estrategia de decodificación: prompt zero-shot con rol de profesor experto, modo thinking activado, razonamiento en inglés y selección de la respuesta como el token más probable entre 1, 2, 3 y 4 tras la marca "Answer: ". Todo el proceso de inferencia emplea exclusivamente pesos abiertos, sin APIs externas ni recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con adaptador LoRA (rank 16) fusionado |
| Parametros totales | 4.205.751.296 (modelo de texto tras fusionar el adaptador); el adaptador LoRA aislado tiene 30.474.240 parámetros; el checkpoint completo de Qwen3.5-4B, incluida la torre de visión no cargada, suma 4.659.865.088 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | cingalés (si); el razonamiento interno se realiza en inglés por indicación del prompt |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en `adapter/`, más configuración y ficheros de tokenizer) |

## Arquitectura y entrenamiento

El sistema parte de Qwen/Qwen3.5-4B en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` (publicada el 2026-02-27, Apache-2.0, pesos abiertos). Sobre ese modelo se aplica un ajuste LoRA de rango 16 durante una única época, con la función de pérdida restringida al dígito de la respuesta. El adaptador se fusiona en los pesos para la inferencia, de modo que el modelo cargado tiene 4.205.751.296 parámetros. El checkpoint original de Qwen3.5-4B incluye una torre de visión que este sistema no carga.

Los datos de entrenamiento combinan dos fuentes. Por un lado, Global-MMLU en cingalés (revisión `0e619dbeb34206cd48705a1a0ea7fb21cae09993`), con 14.324 preguntas tras eliminar 3 con opción vacía, distribuidas en 57 asignaturas (humanidades 4.770, STEM 3.245, ciencias sociales 3.137, otras 2.433, empresariales 739). Por otro, sinmulu_si, con 15.180 preguntas propias tras deduplicación. El conjunto combinado queda en 29.504 preguntas, con partición de 26.675 para entrenamiento y 2.829 para validación (10 % por asignatura, semilla 42). La construcción de sinmulu_si implicó transcribir páginas renderizadas como imagen mediante Claude Sonnet 5.5 (API cerrada, usada solo para generar datos de entrenamiento), descartar preguntas dependientes de diagramas o con escaneos ilegibles, y etiquetar respuestas con esquemas oficiales cuando existían o, en su defecto, conservarlas solo con alta confianza del modelo. Se realizó una comprobación de solapamiento contra las 2.238 preguntas de test de la tarea, eliminando 165 preguntas coincidentes.

En inferencia se emplea un prompt zero-shot que sitúa al modelo como profesor experto de la asignatura, le pide razonar paso a paso en inglés con el modo thinking de Qwen activado, decodificación greedy y hasta 4.096 tokens nuevos. La respuesta final se obtiene seleccionando el token más probable entre 1, 2, 3 y 4 tras la marca "Answer: ", lo que garantiza exactamente una respuesta por pregunta.

## Capacidades

- Generación de texto y razonamiento en cingalés para preguntas de opción múltiple de cuatro alternativas.
- Razonamiento multi-paso mediante el modo thinking del modelo base, con cadena de pensamiento en inglés.
- Cobertura de unas 57 asignaturas en el conjunto de entrenamiento (humanidades, STEM, ciencias sociales, empresariales y otras), más unas 48 asignaturas en la colección propia.
- Selección determinista de respuesta mediante comparación de probabilidades sobre los tokens 1/2/3/4.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-turno.
- No se documenta capacidad de visión en este sistema (aunque el checkpoint base la incluye, la torre no se carga).
- No se documenta capacidad de audio.
- El sistema no emplea APIs externas ni recuperación en inferencia.

## Casos de uso

- Evaluación de conocimiento en cingalés: el sistema responde preguntas tipo MMLU de cuatro opciones, lo que permite medir el conocimiento del modelo base en dominios curriculares de Sri Lanka con una métrica estandarizada.
- Investigación sobre adaptación lingüística de bajo coste: el adaptador LoRA de rango 16 y una época sirve como referencia para estudiar cuánto conocimiento específico de un idioma de bajos recursos se puede inyectar con un presupuesto de entrenamiento reducido.
- Construcción de bancos de preguntas educativos: el pipeline de transcripción y limpieza de exámenes (PDFs con fuentes heredadas, renderizado a imagen, verificación de solapamiento) es reutilizable para digitalizar material de evaluación en otros idiomas de bajos recursos.
- Evaluación comparativa de modelos base: al fijar el prompt, la decodificación greedy y la selección de respuesta por probabilidad, el sistema proporciona un protocolo reproducible para comparar modelos de menos de 8B en tareas de opción múltiple en cingalés.
- Filtrado y control de calidad de datasets: la comprobación de solapamiento contra el conjunto de test (165 preguntas eliminadas de 15.355) y la deduplicación constituyen un ejemplo práctico de auditoría de datos antes de publicar un benchmark.
- Despliegue en hardware modesto: con 4,24B parámetros en inferencia, el sistema es viable en GPUs de consumo para experimentación, lo que facilita la reproducción de resultados por parte de equipos con recursos limitados.
- Etiquetado asistido de preguntas: el criterio de conservar solo respuestas con alta confianza del modelo puede adaptarse como herramienta de preetiquetado en la construcción de nuevos conjuntos de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el sistema, los datos y el protocolo de inferencia, pero no incluye métricas de precisión sobre el conjunto de test de la tarea ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4,24B parámetros, en precisión completa (fp32) se requerirían aproximadamente 17 GB; en bf16, unos 8,5 GB; en cuantizaciones de 8 bits, alrededor de 4,5 GB; en 4 bits, unos 2,5 GB. Estas cifras son estimaciones por tamaño y no proceden de la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí en bf16 en tarjetas con 12 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090), y en cuantización de 4-8 bits en tarjetas de 8 GB; no confirmado por el autor.
- Opciones de despliegue: el repositorio incluye `inference.py`, que descarga el modelo base en la revisión fijada y carga el adaptador PEFT. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El protocolo de inferencia permite hasta 4.096 tokens nuevos por pregunta con decodificación greedy, lo que implica un coste por pregunta considerable en modo thinking.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| team-sinbotics (este sistema) | 4,24B en inferencia (LoRA sobre Qwen3.5-4B) | no disponible | Apache-2.0 | Ajuste LoRA para opción múltiple en cingalés |
| Qwen/Qwen3.5-4B (base) | 4,66B (incluye torre de visión) | no disponible | Apache-2.0 | Modelo generalista multimodal; sin ajuste específico para cingalés |
| Otros sistemas de la tarea SinhalaMMLU | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- El sistema está diseñado exclusivamente para preguntas de opción múltiple de cuatro alternativas en cingalés; no se documenta su comportamiento en otros formatos o idiomas.
- Parte de las etiquetas de sinmulu_si son derivadas del modelo (respuestas sin esquema oficial conservadas solo con alta confianza), lo que puede introducir sesgos en el entrenamiento.
- La transcripción de exámenes se realizó con Claude Sonnet 5.5, un modelo de API cerrada; aunque solo se usó para generar datos, conviene tenerlo en cuenta al evaluar la reproducibilidad del dataset.
- El conjunto sinmulu_si no está incluido en el repositorio; solo está disponible para los organizadores bajo petición, lo que limita la reproducción completa del entrenamiento.
- El razonamiento se fuerza en inglés, lo que puede afectar a la fidelidad lingüística y a la evaluación de capacidades nativas en cingalés.
- Riesgo de alucinación en el razonamiento intermedio: el modo thinking genera hasta 4.096 tokens que no se validan; solo la respuesta final se restringe a los tokens 1/2/3/4.
- No se documentan evaluaciones de sesgo, robustez ni comportamiento fuera de distribución.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.5-4B debe verificarse en su propia licencia y condiciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso comunitario ni validación externa.

## Enlaces

- Repositorio del adaptador y código: https://huggingface.co/SinhalaMMLU-SharedTask/team-sinbotics
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset Global-MMLU: https://huggingface.co/datasets/CohereLabs/Global-MMLU
- Directorio del adaptador: https://huggingface.co/SinhalaMMLU-SharedTask/team-sinbotics/tree/main/adapter
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
