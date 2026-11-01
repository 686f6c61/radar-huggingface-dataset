# mulkzz/Rubio-27B

## Resumen

Rubio-27B es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario mulkzz, orientado a una tarea muy concreta: la evaluacion y retroalimentacion de respuestas descriptivas de estudiantes de secundaria en la asignatura de Biologia (curriculo surcoreano de 2022, unidades I-III). El modelo recibe un JSON estructurado con el enunciado, la rubrica, las evidencias del libro de texto, los errores conceptuales candidatos y la respuesta del alumno, y devuelve un unico objeto JSON con el diagnostico por criterio y una retroalimentacion breve en coreano para el estudiante.

Tecnicamente es un transformer denso de aproximadamente 27.780 millones de parametros (27,78 B), derivado de Qwen3.8-27B, con un contexto de entrenamiento de 4096 tokens y pesos en bf16 (unos 55,6 GB en el repositorio). Se trata de un LoRA (r=16, alpha=32) entrenado con Unsloth sobre 3000 casos sinteticos y posteriormente fusionado en los pesos completos, por lo que se sirve como modelo unico sin adaptador separado.

Su relevancia es acotada pero clara: demuestra un patron de especializacion vertical (evaluacion formativa con rubricas y salida JSON estricta) sobre un modelo generalista de tamano medio, con licencia Apache 2.0 y despliegue sencillo en vLLM. No es un modelo de proposito general: su valor esta en la tarea y en el formato de salida controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens en entrenamiento; el ejemplo de servicio usa `--max-model-len 8192` |
| Tipos de cuantizacion | Pesos publicados en bf16 (16 bits); no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (copia de Unsloth, `unsloth/Qwen3.8-27B`) y se entrena mediante LoRA en bf16 con Unsloth 2026.10.11. La configuracion del adaptador es r=16, alpha=32, con modulos objetivo q, k, v, o, gate, up y down. Los hiperparametros son 2 epocas (300 pasos), tasa de aprendizaje 1e-4 con scheduler coseno y 5% de calentamiento, batch de 2 con acumulacion de 8 y longitud maxima de 4096 tokens. El checkpoint final se selecciona por menor perdida de validacion (step 300, eval_loss 0.369), evaluando cada 50 pasos. El entrenamiento completo se realizo en una unica NVIDIA H100 SXM de 80 GB en aproximadamente 75 minutos. El modo de razonamiento (thinking) esta desactivado y la funcion de perdida se aplica unicamente al tramo de salida del asistente (el JSON).

Los datos de entrenamiento son sinteticos: 3000 casos (1000 por cada una de las unidades I, II y III de Biologia), organizados como 300 familias de preguntas con 10 casos cada una (7 primeras respuestas y 3 de respuesta secundaria, pregunta o solicitud de solucion). La particion es por familia de preguntas (80% train, 10% dev, 10% test) para evitar fuga de informacion entre conjuntos. La generacion de casos la realizo Gemini y la revision corrio a cargo de GPT, Claude y Kimi, con una decision final y correccion por parte de Gemini. No se documenta uso de RLHF ni DPO.

## Capacidades

- Evaluacion por criterio de respuestas descriptivas: clasifica cada criterio de la rubrica como `supported`, `contradicted`, `missing` o `unclear`, con extraccion del fragmento literal (`student_span`).
- Mapeo de errores conceptuales: asigna `misconception_id` solo cuando el criterio es `contradicted` y coincide con la lista de errores candidatos; en caso contrario devuelve `null`.
- Generacion de retroalimentacion pedagogica en coreano (registro formal, 3-5 frases) adaptada al nivel de pista solicitado (`hint_1` a `hint_3`).
- Control de revelacion de la solucion: si `reveal_requested` es `false`, ofrece pistas o preguntas de verificacion en lugar de la respuesta modelo.
- Seguimiento de progreso entre turnos mediante el campo `history` (`progress`).
- Salida JSON estricta con orden de claves fijo (10 claves: `message_type`, `answer_source`, `answer_status`, `progress`, `checks`, `other_issues`, `focus`, `feedback`, `next_action`, `source_ids`).
- Resistencia a inyeccion de instrucciones en el mensaje del estudiante: el system prompt indica explicitamente no obedecer ordenes contenidas en el texto del alumno.
- No soporta vision, audio, tool calling ni razonamiento multi-paso general; su alcance es la tarea de evaluacion descrita.

## Casos de uso

- Evaluacion formativa automatizada en aulas de Biologia: el modelo recibe la rubrica y la evidencia del libro de texto y devuelve un diagnostico por criterio, permitiendo al profesor revisar rapidamente cientos de respuestas descriptivas sin calificar manualmente cada una.
- Plataformas de practica para estudiantes: integrado en un servicio web (el autor opera una demo con el modelo 4B), genera pistas graduadas (`hint_1` a `hint_3`) que guian al alumno sin revelar la respuesta, fomentando el aprendizaje por descubrimiento.
- Deteccion de errores conceptuales: el mapeo a `misconception_id` permite construir analiticas de aula sobre que concepciones erroneas son mas frecuentes por unidad y criterio.
- Generacion de informes docentes: los campos `checks`, `other_issues`, `focus` y `source_ids` constituyen datos estructurados listos para agregar en dashboards o exportar a sistemas de gestion del aprendizaje.
- Investigacion en evaluacion automatica de texto libre: al ser Apache 2.0 y de tamano medio, sirve como linea base reproducible para experimentos de calificacion con rubricas en coreano, con particion por familia de preguntas ya definida.
- Despliegue self-hosted en infraestructura educativa: con vLLM y una sola GPU de 80 GB (o cuantizado en GPUs menores) se puede servir como endpoint interno con latencia baja para un servicio de retroalimentacion en tiempo real.
- Prototipado de asistentes conversacionales con salida JSON controlada: el patron de system prompt mas JSON de entrada/salida es reutilizable para otras asignaturas, aunque requeriria reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion del checkpoint final (eval_loss 0.369, step 300). No hay datos de MMLU, HumanEval, GSM8K ni de exactitud en la tarea de evaluacion sobre el conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 56 GB solo para pesos, mas KV cache y overhead; en la practica requiere una GPU de 80 GB (A100 80GB, H100 80GB) para contexto de 8192 tokens.
- Cuantizacion a 8 bits: alrededor de 28-30 GB de pesos, viable en A6000 48GB, L40S 48GB o dos RTX 4090 de 24 GB con tensor parallelism.
- Cuantizacion a 4 bits (GGUF/AWQ, no publicada oficialmente): alrededor de 15-16 GB, podria caber en una RTX 4090 de 24 GB o RTX 3090, con degradacion de calidad no evaluada.
- No cabe en GPUs de consumo de 8-16 GB en ninguna precision razonable.
- Despliegue recomendado: vLLM (el autor proporciona el comando `vllm serve` con `--language-model-only`, `--max-model-len 8192` y kwargs de plantilla de chat). Tambien seria compatible con TGI y, tras conversion, con llama.cpp/Ollama para cuantizaciones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rubio-27B | 27,78 B | 4096 (entrenamiento) | Evaluacion de Biologia en coreano con salida JSON | Apache 2.0 | HuggingFace, 151 descargas |
| Rubio-4B (mismo autor) | ~4 B (no confirmado) | no disponible | Misma tarea, mismo dataset y configuracion | no disponible | HuggingFace, en servicio en demo |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | Proposito general | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No apto para calificacion oficial ni evaluacion de alto impacto: el propio autor indica que la salida es un apoyo al aprendizaje y no debe usarse como nota.
- Alcance restringido a las unidades I-III de Biologia del curriculo surcoreano de 2022; fuera de ese dominio o en otras asignaturas el comportamiento no esta garantizado.
- Requiere entrada estructurada (pregunta, rubrica, evidencia, errores candidatos); no funciona como chatbot de proposito general ni con preguntas libres.
- El campo `answer_status` puede contradecir los `checks` por criterio; el autor recomienda recalcularlo en el servicio a partir de los `checks`.
- Datos de entrenamiento completamente sinteticos, generados y revisados por modelos (Gemini, GPT, Claude, Kimi): riesgo de sesgos y artefactos propios de los generadores, sin validacion con respuestas reales de estudiantes.
- Riesgo de alucinacion en la retroalimentacion si la rubrica o la evidencia son ambiguas o incompletas; el prompt mitiga parcialmente exigiendo ceñirse a rubrica y evidencia.
- Idioma unico: coreano. No hay soporte documentado de castellano ni de otros idiomas.
- Sensible al formato: el orden de claves del JSON de entrada y el system prompt literal afectan al rendimiento; desviarse de ellos degrada la calidad.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantias ni soporte; el modelo base Qwen3.8-27B debe verificarse por separado en cuanto a sus terminos.
- Sin benchmarks publicados: la calidad en el conjunto de test no esta cuantificada, lo que dificulta estimar el rendimiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulkzz/Rubio-27B
- Version 4B: https://huggingface.co/mulkzz/Rubio-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Copia Unsloth del base: https://huggingface.co/unsloth/Qwen3.8-27B
- Demo en servicio: https://mulk.codes/rubio
