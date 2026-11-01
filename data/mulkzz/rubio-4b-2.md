# mulkzz/RuBio-4B

## Resumen

RuBio-4B (publicado como `mulkzz/RuBio-4B`) es un ajuste fino del modelo base Qwen/Qwen3.5-4B orientado a una tarea muy concreta: evaluar respuestas de desarrollo de estudiantes de secundaria en la asignatura coreana de «Ciencias de la vida» (currículo revisado de 2022) y devolver, en un único objeto JSON, tanto diagnóstico para el profesor como retroalimentación breve en coreano para el alumno. No es un modelo de propósito general: su funcionamiento depende de que la entrada sea un JSON estructurado con pregunta, rúbrica, evidencias del libro de texto, misconcepciones candidatas y respuesta del estudiante.

El modelo se construye mediante un LoRA (r=16, alpha=32, módulos q/k/v/o/gate/up/down) entrenado con Unsloth en bf16 y posteriormente fusionado en el modelo base, de modo que se sirve como un checkpoint completo de 16 bits sin adaptador separado. Cuenta con 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) y un repositorio de 9,3 GB en safetensors.

Su relevancia es acotada pero clara: demuestra un patrón de ajuste fino de un modelo pequeño (4B) para una tarea educativa de alta estructura, con formato de salida estrictamente controlado (JSON con diez claves en orden fijo) y pensado para desplegarse con vLLM en un servicio real (el autor mantiene una demo en mulk.codes/rubio). La licencia Apache 2.0 facilita su reutilización, aunque el alcance real del modelo queda restringido a las unidades I–III de una asignatura concreta y al idioma coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B; la model card no detalla la arquitectura interna) |
| Parametros totales | 4.659.865.088 (≈4,66 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenamiento a 4.096 tokens; el ejemplo de servicio con vLLM usa `--max-model-len 8192` (la longitud nativa del modelo base no se especifica en la información disponible) |
| Tipos de cuantizacion | Pesos publicados en bf16 (16 bits); el autor no publica variantes GGUF/AWQ/GPTQ. Al ser un modelo de 4B, admite cuantización posterior con herramientas estándar (no documentada por el autor) |
| Idiomas soportados | Coreano (`ko`) según la model card; el prompt de sistema y la retroalimentación se generan en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo, LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,66 mil millones de parámetros. Sobre él se aplica un ajuste fino supervisado con LoRA (r=16, alpha=32, módulos objetivo q, k, v, o, gate, up y down) usando Unsloth en bf16, con 2 épocas, tasa de aprendizaje 1e-4 con planificador coseno y longitud máxima de 4.096 tokens. La pérdida se calcula únicamente sobre la salida del asistente (el JSON), no sobre el prompt de sistema ni el JSON de entrada del usuario. El adaptador se fusiona después en los pesos base, dando lugar a un checkpoint completo de 16 bits. El modo de razonamiento (thinking) se desactiva durante el entrenamiento y se recomienda desactivarlo también en inferencia mediante `chat_template_kwargs: {"enable_thinking": false}`.

Los datos de entrenamiento son enteramente sintéticos: 3.000 casos (1.000 por cada una de las unidades I, II y III de «Ciencias de la vida»), organizados en 300 familias de preguntas con 10 casos cada una (7 primeras respuestas y 3 de respuesta reiterada, pregunta o solicitud de solución). El conjunto se divide por familia de pregunta en 80 % entrenamiento, 10 % desarrollo y 10 % prueba, evitando fugas entre splits. La generación de casos la realizó Gemini, con revisión cruzada de GPT, Claude y Kimi y una decisión y corrección final por parte de Gemini. No se documenta en la información disponible ninguna fase de RLHF o DPO.

## Capacidades

- Evaluación de respuestas de desarrollo contra rúbricas estructuradas, con veredicto por criterio: `supported`, `contradicted`, `missing` o `unclear`, incluyendo el fragmento literal del alumno (`student_span`).
- Mapeo de errores conceptuales a un catálogo predefinido de misconcepciones (`misconception_id`), sin inventar identificadores fuera de la lista proporcionada.
- Generación de retroalimentación en coreano formal (3–5 frases) adaptada al nivel de pista solicitado (`hint_1`, `hint_2`, `hint_3`) y a si el alumno ha pedido la solución (`reveal_requested`).
- Producción de un objeto JSON con diez claves en orden fijo (`message_type`, `answer_source`, `answer_status`, `progress`, `checks`, `other_issues`, `focus`, `feedback`, `next_action`, `source_ids`), apto para consumo programático.
- Seguimiento de la progresión del alumno comparando con el historial de turnos previos (`progress`).
- Trazabilidad de las evidencias empleadas mediante `source_ids`, enlazando cada juicio con fragmentos del libro de texto.
- Resistencia a instrucciones inyectadas en el mensaje del alumno: el prompt de sistema indica explícitamente no obedecer órdenes contenidas en la respuesta del estudiante.
- No soporta tool calling, function calling, visión, audio ni agentes multi-paso generales; su «flujo multi-turno» se limita al historial estructurado que se le pasa en el JSON de entrada.

## Casos de uso

- Corrección asistida de exámenes de desarrollo en «Ciencias de la vida»: el modelo recibe la pregunta, la rúbrica y la respuesta del alumno y devuelve un veredicto por criterio, lo que permite al profesor revisar rápidamente en qué criterios falla cada estudiante sin leer manualmente cada respuesta.
- Generación de retroalimentación formativa para plataformas educativas: el campo `feedback` (3–5 frases en coreano formal) puede mostrarse directamente al alumno tras cada intento, con el nivel de pista controlado por `feedback_mode` para no revelar la solución antes de tiempo.
- Detección de misconcepciones en el aula: al mapear respuestas erróneas a identificadores de un catálogo (`misconception_id`), el profesorado puede agregar estadísticas por misconception y detectar patrones de error recurrentes en la clase.
- Tutoría conversacional con pistas graduadas: usando `history` y `feedback_mode`, un chatbot educativo puede escalar de `hint_1` a `hint_3` a lo largo de varios turnos y decidir cuándo revelar la solución si el alumno la solicita (`reveal_requested = true`).
- Investigación en evaluación automática: al ser un modelo pequeño (4B) con licencia Apache 2.0 y salida JSON estricta, sirve como línea base reproducible para estudiar la fiabilidad de la evaluación automática de respuestas abiertas en dominios científicos.
- Despliegue en infraestructura modesta: con vLLM y `--language-model-only`, un modelo de 4B en bf16 ocupa alrededor de 9–10 GB de VRAM, por lo que puede servirse en una única GPU de gama profesional o de consumo alta, adecuado para pilotos escolares o servicios internos.
- Auditoría docente del proceso de respuesta: los campos `progress`, `other_issues` y `focus` permiten reconstruir cómo evoluciona la comprensión del alumno entre intentos, útil para investigación didáctica y para informes de seguimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (MMLU, HumanEval, GSM8K ni evaluaciones específicas de la tarea) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos, más caché KV y overhead del servidor; en la práctica, entre 10 y 12 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 5 GB de pesos; a 4 bits: alrededor de 2,5–3 GB (no publicada por el autor; estimación a partir del número de parámetros).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para servicio concurrente; RTX 4090 (24 GB) para desarrollo y despliegues pequeños.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) en bf16 y en tarjetas de 8–12 GB si se cuantiza (aunque el autor solo publica bf16).
- Opciones de despliegue: vLLM es la vía documentada por el autor (`vllm serve mulkzz/Rubio-4B --served-model-name bio-feedback --language-model-only --max-model-len 8192`); también es viable servir con TGI o transformers, y con llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles en la información proporcionada. La longitud de salida es corta (un JSON con feedback de 3–5 frases), lo que en la práctica reduce el coste de decodificación frente a modelos de chat generales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuBio-4B | ≈4,66 B | 4.096 en entrenamiento; 8.192 en el ejemplo de vLLM | Evaluación de respuestas de desarrollo de biología (coreano) con salida JSON | Apache 2.0 | HuggingFace (`mulkzz/RuBio-4B`) |
| Qwen/Qwen3.5-4B (base) | ≈4,66 B | No disponible en la información proporcionada | Modelo de propósito general, chat y generación de texto | Según el modelo base (no disponible en la información proporcionada) | HuggingFace |
| Modelos de evaluación educativa de propósito general (p. ej. LLM grandes con prompt de rúbrica) | No disponible | No disponible | Evaluación mediante prompting, sin formato JSON garantizado | Variable | Variable |

No se dispone de datos de rendimiento comparativos entre RuBio-4B y alternativas; la comparación anterior es estructural (tamaño, tarea, licencia) y no de calidad.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para las unidades I–III de «Ciencias de la vida» del currículo coreano de 2022; fuera de ese ámbito (otras asignaturas, otras unidades o conversación libre) no es fiable.
- Requiere una entrada JSON con la estructura y el orden de claves exactos del entrenamiento; alterar el orden, omitir campos o cambiar el prompt de sistema degrada el rendimiento.
- El propio autor advierte de que `answer_status` puede contradecir los juicios por criterio (`checks`); en producción debe recalcularse a partir de `checks` y no confiarse directamente.
- Los datos de entrenamiento son sintéticos (generados por Gemini y revisados por GPT, Claude y Kimi), no respuestas reales de estudiantes; esto puede introducir un sesgo de distribución respecto al lenguaje real del alumnado.
- Riesgo de alucinación en los campos de diagnóstico: puede emitir `misconception_id` o `source_ids` que no se correspondan con las listas proporcionadas, aunque el prompt lo prohíbe; conviene validar la salida contra los catálogos de entrada.
- No debe usarse para calificación oficial o de alto impacto: el autor lo restringe explícitamente a apoyo al aprendizaje.
- Idioma: solo coreano; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero no se ofrece ninguna garantía por parte del autor; al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base.
- El modelo se sirve con thinking desactivado; activarlo podría alterar el formato JSON esperado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulkzz/RuBio-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Demo del autor: https://mulk.codes/rubio
