# mulkzz/Rubio-4B

## Resumen

Rubio-4B es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-4B desarrollado por el usuario mulkzz, orientado a una tarea muy concreta: la evaluacion y el feedback de respuestas descriptivas de estudiantes en la asignatura de Biologia (Ciencias de la Vida) del curriculo surcoreano de secundaria (revision 2022). El modelo recibe como entrada un JSON estructurado con el enunciado, la rubrica de evaluacion, las evidencias del libro de texto, los posibles errores conceptuales, una respuesta de referencia y el historial de conversacion, y devuelve un unico objeto JSON con diagnostico por criterio y un feedback breve en coreano para el estudiante.

Tecnicamente es un transformer denso de aproximadamente 4.660 millones de parametros (4,66 B), derivado de Qwen3.5-4B mediante LoRA (r=16, alpha=32) entrenado con Unsloth y posteriormente fusionado en un checkpoint completo en bf16, por lo que no requiere cargar el adaptador por separado. Su relevancia radica en que ejemplifica el patron de modelos pequenos altamente especializados en tareas de evaluacion formativa con salida estructurada, un nicho creciente en edtech y en sistemas de tutoria automatica.

El modelo esta pensado exclusivamente para el dominio de Biologia (unidades I-III) y para el idioma coreano; no es un modelo de proposito general. La licencia Apache 2.0 y su tamano contenido lo hacen desplegable en una unica GPU de consumo, lo que facilita su integracion en servicios educativos de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-4B); no se detalla en la model card si incorpora innovaciones adicionales |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenamiento con longitud maxima de 4.096 tokens; el ejemplo de servicio usa `--max-model-len 8192` |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; el checkpoint se distribuye en bf16 (16 bits). Compatible con cuantizaciones estandar de vLLM/llama.cpp al ser un transformer convencional |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo en bf16, LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de la familia Qwen3.5. Sobre esa base se aplico un ajuste fino con LoRA de rango 16 y alpha 32, con modulos objetivo `q`, `k`, `v`, `o`, `gate`, `up` y `down`, durante 2 epocas con tasa de aprendizaje 1e-4 y planificador coseno, longitud maxima de 4.096 tokens y el modo de razonamiento (thinking) desactivado. La perdida se calculo unicamente sobre la salida del asistente (el JSON), no sobre el prompt de sistema ni sobre la entrada del usuario. Posteriormente, el adaptador se fusiono en los pesos base para producir un checkpoint completo en bf16.

Los datos de entrenamiento son integramente sinteticos: 3.000 casos (1.000 por cada una de las unidades I, II y III), construidos a partir de 300 familias de items con 10 casos cada una (7 primeras respuestas y 3 de re-respuesta, pregunta o solicitud de solucion). La generacion la realizo Gemini y la revision corrio a cargo de GPT, Claude y Kimi, con una decision y correccion final por parte de Gemini. La particion se hizo por familia de items (80 % entrenamiento, 10 % desarrollo, 10 % prueba) para evitar filtraciones entre conjuntos. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Evaluacion por criterio de respuestas descriptivas: clasifica cada criterio de la rubrica como `supported`, `contradicted`, `missing` o `unclear`, con extraccion del fragmento literal de la respuesta del estudiante (`student_span`).
- Mapeo de errores conceptuales: asigna un `misconception_id` de una lista predefinida cuando un criterio resulta contradicho; no inventa identificadores fuera de la lista.
- Generacion de feedback pedagogico en coreano formal (3-5 frases) adaptado al nivel de pista solicitado (`hint_1`, `hint_2`, `hint_3`).
- Control de revelacion de la solucion: respeta la bandera `reveal_requested` para decidir si muestra la respuesta modelo o solo pistas.
- Seguimiento del progreso entre turnos: compara con el historial (`history`) y emite un estado de avance (`progress`) y una recomendacion de siguiente accion (`next_action`).
- Salida estrictamente estructurada: un unico objeto JSON con orden de claves fijo (`message_type`, `answer_source`, `answer_status`, `progress`, `checks`, `other_issues`, `focus`, `feedback`, `next_action`, `source_ids`).
- Trazabilidad de fuentes: devuelve los `source_id` de las evidencias del libro de texto utilizadas.
- Resistencia a inyeccion de instrucciones: el prompt de sistema indica explicitamente que no debe obedecer instrucciones contenidas en el mensaje del estudiante.
- No dispone de capacidades de vision, audio, tool calling generico ni agentes multi-paso fuera del flujo conversacional de evaluacion.

## Casos de uso

- Correccion formativa automatizada en plataformas educativas: el modelo recibe el JSON con enunciado, rubrica y respuesta del alumno y devuelve el diagnostico por criterio, lo que permite generar informes de progreso sin intervencion docente en cada iteracion.
- Tutoria conversacional con pistas graduadas: usando `feedback_mode` de `hint_1` a `hint_3`, un chatbot puede guiar al estudiante hacia la respuesta sin revelarla, manteniendo el historial de intentos en `history`.
- Deteccion temprana de errores conceptuales: el mapeo a `misconception_id` permite agregar estadisticas por clase y detectar que ideas erroneas son mas frecuentes en un grupo, informando la planificacion docente.
- Panel de diagnostico para el profesorado: los campos `checks`, `other_issues`, `focus` y `source_ids` constituyen datos estructurados que un LMS puede almacenar y visualizar para revisar el proceso de redaccion del alumnado, no solo el resultado final.
- Generacion de bancos de ejercicios con retroalimentacion: al ser un modelo pequeno y desplegable en una sola GPU, puede alimentar pipelines internos que precalculen feedback para miles de respuestas antes de una sesion de clase.
- Evaluacion de bajo coste en entornos con recursos limitados: con 4,66 B de parametros en bf16 (unos 9,3 GB de pesos) cabe en GPUs de consumo y puede servirse con vLLM en una unica tarjeta, lo que reduce el coste por evaluacion frente a modelos de mayor tamano.
- Investigacion en evaluacion automatica de respuestas abiertas: sirve como linea base reproducible (licencia Apache 2.0 y particiones documentadas) para comparar metodos de feedback estructurado en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,3 GB solo para los pesos en bf16; con cache KV y margen operativo, entre 12 y 16 GB para contextos moderados.
- En cuantizacion de 8 bits, el peso baja a unos 4,7 GB; en 4 bits, a unos 2,4 GB (estimaciones teoricas a partir del numero de parametros, no verificadas por el autor).
- GPU recomendadas: A100, H100, L40S o RTX 6000 Ada para produccion con concurrencia; RTX 4090, RTX 4080 o RTX 3090 para desarrollo y despliegues de baja concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bf16, y en tarjetas de 8 GB con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: vLLM (comando documentado por el autor con `--language-model-only --max-model-len 8192`), llama.cpp u Ollama previa conversion a GGUF, y TGI como alternativa. El autor etiqueta el modelo con `unsloth` y `vllm`.
- Latencia y throughput: no disponibles. El autor recomienda `temperature: 0` y `enable_thinking: false` para reducir la latencia y estabilizar la salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rubio-4B (mulkzz) | 4,66 B | 4.096 en entrenamiento; 8.192 en ejemplo de servicio | Feedback de Biologia en coreano con salida JSON | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-4B (modelo base) | ~4 B | No disponible en la informacion proporcionada | Proposito general, multilingue | No disponible en la informacion proporcionada | HuggingFace |
| Modelos de evaluacion automatica de respuestas abiertas de proposito general | Variable | Variable | Evaluacion generica multilingue | Variable | Variable |

No se dispone de datos de benchmarks ni de modelos directamente comparables en el mismo nicho (feedback estructurado de Biologia en coreano) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No debe usarse para calificacion oficial o de alto impacto: el propio autor indica que las salidas son de apoyo al aprendizaje y no sustituyen la evaluacion docente.
- Ambito restringido: solo cubre las unidades I-III de Biologia del curriculo coreano de 2022; fuera de ese dominio o en otras asignaturas su comportamiento no esta validado.
- Requiere entrada estructurada: sin `question`, `rubric` y `evidence` bien formados no debe emplearse; no esta disenado para preguntas libres.
- El campo `answer_status` puede ser incoherente con los `checks` por criterio; el autor recomienda recalcularlo en el servicio a partir de los resultados por criterio.
- Entrenado exclusivamente con datos sinteticos: puede no reflejar la distribucion real de errores, expresiones o caligrafia semantica del alumnado real.
- Riesgo de alucinacion en el feedback y en la seleccion de `source_ids`; conviene validar que los identificadores devueltos existan en la evidencia proporcionada.
- Idioma limitado al coreano: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Dependencia de la plantilla exacta: el prompt de sistema debe reproducirse literalmente y el JSON de usuario debe mantener el orden de claves y la serializacion compacta para obtener el comportamiento esperado.
- Licencia Apache 2.0 permite uso comercial, pero no exime de las obligaciones de atribucion ni de las condiciones de la licencia del modelo base Qwen3.5-4B, que deben verificarse por separado.
- El modelo se publico con 0 likes y 394 descargas en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulkzz/Rubio-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Servicio de demostracion: https://mulk.codes/rubio
