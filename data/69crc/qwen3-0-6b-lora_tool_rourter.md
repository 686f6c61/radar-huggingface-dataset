# 69crc/Qwen3-0.6B-LoRA_Tool_Rourter

## Resumen

Qwen3-0.6B-LoRA_Tool_Rourter (publicado por el usuario 69crc bajo el nombre interno "Qwen3-0.6B Router Student") es un modelo pequeno de 596 millones de parametros derivado de Qwen/Qwen3-0.6B mediante LoRA y fusion de pesos, especializado exclusivamente en enrutamiento de herramientas dentro de agentes. No es un modelo conversacional: su unica funcion es emitir un objeto JSON que selecciona entre tres acciones (`answer`, `call`, `clarify`) y, en su caso, el nombre de la herramienta y sus argumentos.

El modelo se destila a partir de un profesor de 27B (denominado Qwen3.8-27B en la model card) usado unicamente como router. Su proposito es sustituir clasificadores basados en palabras clave, que son rapidos pero incapaces de detectar ambiguedad y dependientes de vocabulario mantenido a mano. El estudiante alcanza, segun el autor, mas del 83 % de acuerdo con el profesor en una bateria de 943 prompts, frente al 53 % del clasificador por palabras clave al que reemplaza.

Es relevante ahora porque demuestra que un modelo sub-1B puede asumir una tarea de decision acotada con latencia de aproximadamente 0,3 s por turno en Q8_0 sobre `llama-server`, liberando al modelo principal del agente de pagar el coste de un router de 27B en cada turno. La arquitectura subyacente es la de Qwen3-0.6B (transformer denso), con contexto heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) con adaptador LoRA fusionado |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B; no especificada en la informacion) |
| Tipos de cuantizacion | Q8_0 (GGUF incluido en el repo); otras cuantizaciones no documentadas |
| Idiomas soportados | ingles (`en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint fusionado para transformers) y GGUF (`student_q8.gguf` para llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de 0,6B parametros, sobre el que se aplica un adaptador LoRA entrenado para la tarea de enrutamiento y posteriormente fusionado en un checkpoint unico de safetensors. El entrenamiento es una destilacion desde un profesor de 27B que actua como router de referencia; el dataset es propio (`dataset:custom`) y no se detalla su composicion, numero de tokens ni si hubo etapas de RLHF o DPO.

La innovacion principal no es arquitectonica sino de politica de decision: el estudiante aprende cinco reglas explicitas (comprobacion de ambiguedad primero, deteccion de datos en vivo despues, prioridad del vocabulario biomedico sobre la comprobacion temporal, enrutamiento de operaciones de codigo y ficheros, y respuesta directa para conocimiento estable). El modelo se entrena contra un registro de 18 herramientas y debe seleccionar solo dentro del subconjunto que el agente padre le ofrece en inferencia, no sobre el registro completo.

## Capacidades

- Clasificacion de intencion en tres acciones con salida JSON estricta: `{"action": "answer"}`, `{"action": "call", "tool": ..., "args": {...}}` o `{"action": "clarify", "question": ...}`.
- Deteccion de ambiguedad: emite `clarify` ante pronombres sin referente, fragmentos sueltos ("More.", "Try that.") o peticiones cuyo referente no es resoluble desde el contexto previo.
- Enrutamiento a busqueda web (`brave_search`) ante senales de datos en vivo: precios, meteorologia, clasificaciones, cargos publicos, terminos como "current", "latest", "today".
- Enrutamiento biomedico prioritario a `pubmed_search` ante enfermedades, farmacos, mecanismos de accion o terminos de neuro, psiquiatria, oncologia, cardiologia e inmunologia, incluso con modificadores temporales.
- Enrutamiento de operaciones de codigo y ficheros: `read_file`, `edit_file`, `write_file`, `list_dir`, `search_codebase`, `grep_with_context`, `run_terminal_command`.
- Soporte de herramientas de escritura de libros (`manage_outline`, `manage_characters`, `track_progress`) y de finanzas (`predict_stocks`).
- Generacion de argumentos que deben validar contra el esquema de parametros de la herramienta seleccionada.
- No genera texto dirigido al usuario, no mantiene conversacion y no hace razonamiento multi-paso general.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Enrutamiento en agentes con herramientas: el modelo se coloca como primera etapa del pipeline y decide en aproximadamente 0,3 s si la consulta requiere una herramienta, cual y con que argumentos, evitando que el modelo principal (potencialmente de decenas de miles de millones de parametros) pague ese coste en cada turno.
- Deteccion de consultas ambiguas en atencion al cliente: cuando el usuario escribe "lo mismo de antes" o "prueba eso", el modelo emite `clarify` con una pregunta corta en lugar de adivinar, reduciendo llamadas erroneas a herramientas.
- Enrutamiento biomedico en asistentes clinicos o de investigacion: consultas sobre farmacos, ensayos clinicos o mecanismos fisiopatologicos se dirigen a `pubmed_search` de forma consistente, incluso cuando el usuario emplea terminos temporales como "latest".
- Asistentes de programacion con acceso a workspace: peticiones de lectura, edicion, escritura o busqueda en el codigo se enrutan a la herramienta de ficheros adecuada, con argumentos validables contra el esquema correspondiente.
- Agentes de datos en vivo: consultas sobre cotizaciones, resultados deportivos o meteorologia se derivan a `brave_search` o `predict_stocks` segun el dominio, sin depender de listas de palabras clave mantenidas manualmente.
- Escritura asistida de novelas: el modelo selecciona entre `manage_outline`, `manage_characters` y `track_progress` para operaciones de estructura, fichas de personajes y seguimiento de objetivos de palabra.
- Sustitucion de clasificadores heuristicos en produccion: al alcanzar mas del 83 % de acuerdo con un profesor de 27B frente al 53 % de un clasificador por palabras clave, sirve como reemplazo directo con coste de inferencia minimo en CPU o GPU de gama baja.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| Acuerdo con el profesor (27B) en bateria de 943 prompts | mas del 83 % | Profesor de 27B como router |
| Acuerdo del clasificador por palabras clave sustituido | 53 % | Clasificador heuristico previo |
| Latencia por turno en Q8_0 sobre `llama-server` | aproximadamente 0,3 s | Inferencia local |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,2 GB en Q8_0 (596 M parametros a 8 bits mas overhead de contexto y runtime); en fp16 aproximadamente 1,2 GB solo de pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; tambien cabe en CPU mediante llama.cpp.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida).
- Opciones de despliegue: `llama.cpp` / `llama-server` con el GGUF Q8_0 incluido; `transformers` con el checkpoint safetensors fusionado; vLLM y TGI no estan documentados explicitamente para este modelo.
- Latencia y throughput: aproximadamente 0,3 s por turno en Q8_0 sobre `llama-server` segun el autor; throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-LoRA_Tool_Rourter | 596 M | no disponible | Router JSON de 3 acciones | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3-0.6B (base) | 596 M | segun Qwen3-0.6B | Chat/generacion general | Apache 2.0 | Hugging Face |
| Profesor de 27B citado (Qwen3.8-27B) | 27 B | no disponible | Router de referencia | no disponible | no disponible |
| Clasificador por palabras clave | no aplica | no aplica | Enrutamiento heuristico | no aplica | interno |

La comparativa con alternativas publicas de enrutamiento especializado no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: no genera texto para el usuario y su uso fuera de la tarea de enrutamiento produce salidas invalidas o sin sentido.
- Solo enruta dentro del registro de 18 herramientas con el que fue entrenado; herramientas fuera de esa lista no son seleccionables.
- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente es deficiente.
- Riesgo de alucinacion en los argumentos: aunque el autor exige que `args` valide contra el esquema, no se documenta una tasa de error de validacion, por lo que en produccion conviene validar el JSON y el esquema antes de ejecutar la herramienta.
- La cifra de acuerdo del 83 % con el profesor implica que aproximadamente una de cada seis decisiones difiere de la referencia; no se detalla la distribucion de errores por accion.
- La politica de decision depende de reglas aprendidas (ambiguedad, datos en vivo, prioridad biomedica) que pueden fallar en dominios no cubiertos por el dataset de destilacion, no documentado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-0.6B conviene verificar las condiciones del modelo base.
- El autor marca `inference: false` en los metadatos de la model card, lo que puede afectar a la carga automatica en algunos pipelines de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/69crc/Qwen3-0.6B-LoRA_Tool_Rourter
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper de referencia citado en los tags (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
