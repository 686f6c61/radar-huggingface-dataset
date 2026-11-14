# pavanmantha/clm-system1-medmcqa-granite-4.2-3b

## Resumen

El modelo `clm-system1-medmcqa-granite-4.2-3b`, desarrollado por el usuario de Hugging Face pavanmantha, es un prototipo de investigación que aborda la respuesta a preguntas médicas de opción múltiple mediante un enfoque de "sistema 1": una decisión rápida en un solo paso, sin razonamiento encadenado ni generación de texto. Se construye sobre el modelo congelado `ibm-granite/granite-4.2-3b`, que actúa como codificador de representaciones vectoriales, y añade dos cabezas neuronales pequeñas entrenadas que proyectan la pregunta y cada opción a un espacio compartido de 512 dimensiones. La opción con mayor similitud coseno con la pregunta es la seleccionada.

El modelo no es un modelo de lenguaje generativo en el sentido habitual: no produce texto, no razona paso a paso y no puede usarse como chatbot ni como asistente clínico. Su único cometido es clasificar entre un conjunto cerrado de opciones de respuesta (hasta cuatro), en inglés, en el dominio de exámenes médicos. La relevancia de este trabajo es metodológica: demuestra que un codificador de lenguaje congelado, combinado con cabezas contrastivas ligeras, puede superar de forma clara a una línea base aleatoria (42,5 % frente a 25 %) en una tarea de conocimiento médico, con un coste de entrenamiento mínimo.

El autor lo etiqueta explícitamente como prototipo de investigación y advierte de que no es apto para decisiones clínicas ni para uso real en medicina. Su interés para desarrolladores e investigadores radica en la arquitectura de dos cabezas con pérdida InfoNCE bidireccional sobre representaciones multicapa, un patrón reutilizable para tareas de selección rápida en dominios especializados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador transformer congelado (granite-4.2-3b) + dos cabezas MLP entrenadas (state head y action head) |
| Parámetros totales | No disponible (el modelo base granite-4.2-3b es de 3B; las cabezas entrenadas son de tamaño reducido, sin cifra publicada) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (se usa únicamente el estado oculto del último token) |
| Tipos de cuantización | No disponible (el modelo base se carga en bfloat16; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (`clm_heads.safetensors`); el modelo base se descarga aparte desde `ibm-granite/granite-4.2-3b` |

## Arquitectura y entrenamiento

La arquitectura consta de tres piezas. Primero, un codificador congelado `ibm-granite/granite-4.2-3b` cargado en bfloat16 y nunca actualizado. Segundo, un esquema de prompting fijo: la pregunta se formatea como `This question: "{text}" is answered in one word: "` y cada opción como `This answer: "{text}" means in one word: "`. Tercero, la extracción de representaciones: se toma el estado oculto del último token en 8 profundidades del modelo (0,25, 0,375, 0,5, 0,625, 0,75, 0,875, 0,9375 y 1 de la profundidad), se normaliza cada capa con L2 y se concatenan, dando un vector de 20 480 dimensiones. Sobre ese vector actúan dos cabezas independientes, una para la pregunta (state head) y otra para cada opción (action head), con estructura `Linear - GELU - Linear - LayerNorm - GELU - Linear`, tamaño oculto 2048 y salida de 512 dimensiones. La decisión es la opción con mayor similitud coseno con la pregunta.

El entrenamiento solo actualiza las dos cabezas y un valor de escala (temperatura aprendida, con tope de 100). La pérdida es contrastiva InfoNCE en ambas direcciones, promediada; los negativos son las demás respuestas del lote más las opciones incorrectas de la propia pregunta, y nunca se usan como negativos filas que comparten la misma respuesta correcta. Se emplea AdamW con learning rate 0,0003, weight decay 0, batch size 4096, gradient clipping 1 y early stopping sobre la pérdida de validación con paciencia 5. Se entrenaron tres semillas (42, 43, 44) y se publican los pesos de la semilla con menor pérdida de validación. Los hiperparámetros (formato de prompt, capas, learning rate, tamaño oculto, dropout) se eligieron exclusivamente en validación; el conjunto de test se leyó una sola vez para las cifras finales.

Los datos provienen del dataset `pavanmantha/medmcqa-clm`, derivado de `openlifescienceai/medmcqa` (Apache-2.0), con 134 416 preguntas de entrenamiento, 4000 de validación y 3842 de test. Se eliminaron opciones del tipo "all of the above" y se garantiza que las preguntas de test no aparecen en entrenamiento ni validación.

## Capacidades

- Clasificación de preguntas médicas de opción múltiple en inglés, con un máximo de cuatro opciones por pregunta.
- Selección de respuesta en un solo paso, sin generación de texto ni razonamiento explícito.
- Uso de representaciones multicapa del codificador congelado (8 profundidades concatenadas) para mejorar la discriminación semántica.
- Discriminación real basada en la pregunta: al barajar las preguntas contra las opciones, la precisión cae al nivel del azar, lo que confirma que el modelo no ignora el enunciado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo de pensamiento (thinking mode).
- Multilingüismo: únicamente inglés.
- No es un modelo generativo: no produce explicaciones, justificaciones ni texto libre.

## Casos de uso

- Evaluación comparativa de codificadores congelados en tareas de selección: el modelo sirve como referencia reproducible para medir cuánto conocimiento médico puede extraerse de un LLM congelado sin ajuste fino completo, usando el conjunto de validación de MedMCQA y la métrica de precisión publicada.
- Investigación en aprendizaje contrastivo: las cabezas y la pérdida InfoNCE bidireccional con negativos intra-pregunta son un patrón reutilizable para experimentos de selección rápida en otros dominios (jurídico, financiero, técnico) sustituyendo el dataset y manteniendo el codificador congelado.
- Filtrado y preetiquetado de bancos de preguntas: en un pipeline de curación de ítems de examen, el modelo puede preasignar una respuesta probable a preguntas de cuatro opciones para que un revisor humano valide solo los casos de baja confianza, reduciendo el coste de anotación.
- Detección de preguntas anómalas: dado que la precisión cae al azar cuando se desalinean pregunta y opciones, la similitud coseno puede usarse como señal para detectar ítems mal formados, con opciones duplicadas o con enunciados incoherentes.
- Análisis por asignatura: con los resultados por materia en `results.json`, un equipo docente puede identificar qué áreas del temario (de las 21 asignaturas de MedMCQA) presentan mayor dificultad para el codificador y priorizar la revisión de materiales.
- Prototipado de sistemas de decisión de bajo coste: como solo se entrenan las cabezas y un escalar, el modelo ilustra cómo desplegar un clasificador especializado con un coste de ajuste mínimo sobre una infraestructura de inferencia ya existente para granite-4.2-3b.
- Estudio de robustez lingüística: las preguntas con EXCEPT o NOT (35,8 % de precisión) frente al resto (44,1 %) ofrecen un caso concreto para investigar la sensibilidad de los codificadores a la negación en dominios técnicos.

## Benchmarks y rendimiento

Evaluado sobre 3842 preguntas de la partición de validación etiquetada de MedMCQA (la partición oficial de test no tiene respuestas). Cada pregunta se puntúa solo contra sus propias opciones; el azar es 25,0 %. El margen estadístico de una ejecución es de aproximadamente ±1,6 puntos.

| Método | Precisión |
|---|---|
| Azar | 25,0 % |
| Línea base ciega a la pregunta (respuesta más frecuente en entrenamiento) | 28,1 % |
| Línea base sin cabezas (coseno sobre vectores congelados sin entrenamiento) | 30,8 % |
| **Este modelo, media ± desviación sobre 3 semillas** | **42,5 % ± 0,5** |
| Este modelo, semilla publicada (42) | 42,6 % |

| Partición | Precisión (media sobre semillas) |
|---|---|
| Media sobre las 21 asignaturas | 45,9 % |
| Preguntas con EXCEPT / NOT | 35,8 % |
| Resto de preguntas | 44,1 % |

Los resultados por asignatura están en `results.json`. Al barajar las preguntas contra las opciones, la precisión cae al nivel del azar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra publicada. El modelo base granite-4.2-3b se carga en bfloat16, lo que requiere del orden de 6-7 GB solo para los pesos del codificador, más el coste de activaciones y de las cabezas.
- GPU recomendadas: no especificadas por el autor. Por tamaño del codificador, una GPU con 16 GB o más de VRAM es un punto de partida razonable; no hay datos de rendimiento publicados.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas con 16 GB o más en bfloat16, pero el autor no lo documenta ni publica cifras de latencia o throughput.
- Opciones de despliegue: el autor proporciona `clm_inference.py` con la clase `SystemOneModel` y requiere `torch`, `transformers`, `safetensors` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estos motores no aplican directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Precisión MedMCQA (validación) | Licencia |
|---|---|---|---|---|---|
| clm-system1-medmcqa-granite-4.2-3b | Base 3B + cabezas | No disponible | Codificador congelado + cabezas contrastivas, sin generación | 42,5 % ± 0,5 | Apache-2.0 |
| granite-4.2-3b (base, sin ajuste) | 3B | No disponible en la información proporcionada | LLM generativo | No disponible | Apache-2.0 |
| Línea base sin cabezas (coseno sobre vectores congelados) | 3B | No disponible | Similitud directa sin entrenamiento | 30,8 % | Apache-2.0 |
| Línea base ciega a la pregunta | No aplica | No aplica | Respuesta más frecuente en entrenamiento | 28,1 % | No aplica |

No se dispone de datos publicados que comparen este prototipo con otros modelos de opción múltiple médica de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Alrededor del 57,5 % de las respuestas son incorrectas; el propio autor lo califica como no apto para decisiones clínicas ni para uso real en medicina.
- Solo admite opción múltiple, solo en inglés y con un máximo de cuatro opciones.
- Entrenado exclusivamente con MedMCQA (exámenes de acceso a medicina en India); no se ha probado en otros datasets ni con preguntas clínicas reales.
- Las preguntas con EXCEPT o NOT son notablemente más difíciles (35,8 % frente a 44,1 %).
- La pregunta y cada opción se codifican por separado, por lo que el modelo no puede compararlas en contexto; esta es una limitación estructural del diseño.
- Hereda los sesgos y errores del modelo base granite-4.2-3b y del dataset MedMCQA.
- No genera texto: no puede justificar la respuesta ni producir explicaciones, lo que limita su auditabilidad en entornos regulados.
- Licencia Apache-2.0, que permite uso comercial, pero el estado de prototipo de investigación y la advertencia explícita del autor desaconsejan cualquier despliegue en producción sanitaria.
- Sin descargas ni likes en el momento de la consulta; no hay validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pavanmantha/clm-system1-medmcqa-granite-4.2-3b
- Dataset de entrenamiento: https://huggingface.co/datasets/pavanmantha/medmcqa-clm
- Dataset original MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Archivos del repositorio: `clm_heads.safetensors`, `config.json`, `clm_inference.py`, `results.json` (disponibles en la página del modelo)
