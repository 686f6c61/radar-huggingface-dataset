# mulkzz/RuBio-27B

## Resumen

RuBio-27B (publicado en HuggingFace como `mulkzz/RuBio-27B`, aunque la model card lo titula "Rubio-27B") es un ajuste fino del modelo base Qwen/Qwen3.8-27B orientado a una tarea muy concreta: la evaluacion y el feedback de respuestas descriptivas de estudiantes de bachillerato en la asignatura de Biologia (curriculo surcoreano de 2022, unidades I-III). El modelo recibe como entrada un JSON estructurado con el enunciado, los materiales, la rubrica de evaluacion, las evidencias del libro de texto, las concepciones erroneas candidatas, una respuesta de referencia y el historial de conversacion, y devuelve un unico objeto JSON con el diagnostico por criterio y un feedback breve en coreano para el estudiante.

Se trata de un modelo denso de aproximadamente 27.800 millones de parametros (27.781.427.952 segun los pesos en safetensors), obtenido mediante un LoRA en bf16 sobre el modelo base y posteriormente fusionado en un checkpoint completo de 16 bits (unos 54 GB). No requiere cargar el adaptador por separado. El autor lo presenta como la version grande de un modelo hermano, `mulkzz/Rubio-4B`, entrenado con los mismos datos y configuracion.

Su relevancia es acotada pero clara: demuestra un patron de "modelo especialista con salida JSON estricta" para evaluacion educativa asistida, con separacion explicita entre diagnostico para el profesor y feedback para el alumno, y con control del nivel de pista y de la revelacion de la respuesta. Esta pensado como herramienta de apoyo al aprendizaje, no como sistema de calificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.8-27B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens en entrenamiento; el ejemplo de servicio con vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | pesos en bf16 (16 bits) en el repositorio; no se documentan otras cuantizaciones |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y se entrena con Unsloth en bf16 mediante LoRA con r=16, alpha=32 y modulos objetivo q, k, v, o, gate, up y down. Los hiperparametros son 2 epocas (300 pasos), tasa de aprendizaje 1e-4 con scheduler coseno y 5 % de calentamiento, batch efectivo de 2 x 8 acumulacion y longitud maxima de 4.096 tokens. La perdida se aplica unicamente sobre la salida del asistente (el JSON), no sobre el prompt. Se selecciona el checkpoint con menor perdida de validacion (paso 300, eval_loss 0,369). El entrenamiento se realizo en una unica NVIDIA H100 SXM de 80 GB durante unos 75 minutos con Unsloth 2026.10.11. El adaptador se fusiona despues en el modelo base, dando un checkpoint completo de 16 bits.

Los datos son enteramente sinteticos: 3.000 casos (1.000 por cada una de las unidades I, II y III), construidos a partir de 300 familias de enunciados con 10 casos cada una (7 primeras respuestas y 3 de re-respuesta, pregunta o solicitud de respuesta). La particion es por familia de enunciados (80 % train, 10 % dev, 10 % test) para evitar fuga entre entrenamiento y evaluacion. La generacion la hizo Gemini y la revision corrio a cargo de GPT, Claude y Kimi, con juicio y correccion final de Gemini. El modo de razonamiento (thinking) se desactiva en inferencia.

## Capacidades

- Evaluacion por criterio de respuestas descriptivas de Biologia de bachillerato, con cuatro estados por criterio: `supported`, `contradicted`, `missing` y `unclear`.
- Extraccion del fragmento literal del alumno que justifica cada criterio (`student_span`), con `null` cuando el criterio esta ausente.
- Mapeo de concepciones erroneas a un identificador de una lista predefinida (`misconception_id`), sin inventar identificadores fuera de la lista.
- Generacion de feedback en coreano formal (3-5 frases) adaptado al nivel de pista solicitado (`hint_1`, `hint_2`, `hint_3`).
- Control de revelacion de la respuesta de referencia mediante el campo `reveal_requested`.
- Seguimiento del progreso respecto al historial de conversacion (`progress`).
- Salida estrictamente estructurada como un unico objeto JSON con diez claves en orden fijo.
- No dispone de tool calling, capacidades de agente general, vision, audio ni modo de razonamiento explicito; su alcance funcional es el descrito.

## Casos de uso

- Correccion asistida en el aula: el profesor envia el enunciado, la rubrica y la respuesta del alumno; el modelo devuelve el diagnostico por criterio y un feedback listo para revisar, reduciendo el tiempo de correccion de respuestas abiertas.
- Plataforma de practica para estudiantes: integrado en un servicio web (el autor mantiene una demo con el modelo 4B en `mulk.codes/rubio`), el modelo ofrece pistas graduadas sin desvelar la respuesta cuando `reveal_requested` es `false`.
- Deteccion de concepciones erroneas: el mapeo a `misconception_id` permite agregar estadisticas por error conceptual y disenar materiales de refuerzo dirigidos.
- Seguimiento del progreso: el campo `progress` y el historial permiten construir informes de evolucion del alumno a lo largo de varias interacciones sobre el mismo enunciado.
- Generacion de bancos de retroalimentacion: a partir de respuestas de referencia y rubricas ya validadas, el modelo produce feedback coherente que puede revisarse y reutilizarse como material docente.
- Investigacion educativa: la salida estructurada (criterios, evidencias citadas mediante `source_ids`) facilita el analisis cuantitativo de errores y de la calidad del feedback en estudios controlados.
- Despliegue en produccion con vLLM: el autor documenta un comando `vllm serve` con `--language-model-only` y plantilla de chat, lo que permite servirlo como endpoint compatible con OpenAI para integrarlo en un backend educativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion del checkpoint seleccionado (eval_loss 0,369 en el paso 300).

## Requisitos de hardware

- VRAM estimada: el checkpoint completo en bf16 ocupa unos 55,6 GB en disco y requiere aproximadamente 56 GB o mas de VRAM para cargarse sin cuantizar; con overhead de KV cache y contexto de 8.192 tokens, se recomienda al menos 80 GB.
- GPU recomendadas: NVIDIA H100 SXM 80 GB (la usada para el entrenamiento) o A100 80 GB. Una A100 de 40 GB o una RTX 4090 de 24 GB no son suficientes para el modelo completo en bf16.
- GPU de consumo: no cabe en ninguna GPU de consumo actual sin cuantizacion agresiva; no se documentan versiones GGUF ni cuantizadas en el repositorio.
- Opciones de despliegue: vLLM es la opcion documentada por el autor (`vllm serve mulkzz/RuBio-27B --served-model-name bio-feedback --language-model-only --max-model-len 8192`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| RuBio-27B (`mulkzz/RuBio-27B`) | 27,78 B | 4.096 (entrenamiento); 8.192 en ejemplo de servicio | Apache 2.0 | Feedback de Biologia de bachillerato en coreano, salida JSON | HuggingFace, 151 descargas |
| Rubio-4B (`mulkzz/Rubio-4B`) | no disponible | no disponible | no disponible | Misma tarea, version pequena del mismo autor | HuggingFace; demo en `mulk.codes/rubio` |
| Qwen/Qwen3.8-27B | 27,78 B (base) | no disponible | no disponible | Modelo generalista base | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No debe usarse para calificacion oficial ni para evaluacion de alto impacto; el propio autor lo restringe a apoyo al aprendizaje.
- El alcance se limita a las unidades I-III de Biologia del curriculo surcoreano de 2022; fuera de ese ambito no es fiable.
- Requiere que el prompt de sistema y el JSON de usuario se reproduzcan literalmente, incluido el orden de claves, para obtener el rendimiento de entrenamiento.
- El campo `answer_status` puede contradecir los `checks` por criterio; se recomienda recalcularlo a partir de estos ultimos en produccion.
- Los datos de entrenamiento son sinteticos y no provienen de alumnos reales, lo que puede introducir un sesgo de distribucion respecto a respuestas reales.
- Riesgo de alucinacion en la generacion de feedback y en la identificacion de concepciones erroneas; conviene validar los `misconception_id` contra la lista proporcionada.
- Idioma unico: coreano. No se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias del autor sobre idoneidad para produccion.
- No se documentan cuantizaciones ligeras ni versiones GGUF, lo que limita el despliegue en hardware modesto.

## Enlaces

- HuggingFace: https://huggingface.co/mulkzz/RuBio-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version pequena: https://huggingface.co/mulkzz/Rubio-4B
- Demo del servicio (4B): https://mulk.codes/rubio
- Unsloth: https://github.com/unslothai/unsloth
