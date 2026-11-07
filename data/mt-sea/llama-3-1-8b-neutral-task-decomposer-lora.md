# Mt-sea/Llama-3.1-8B-Neutral-Task-Decomposer-LoRA

## Resumen

El modelo `Mt-sea/Llama-3.1-8B-Neutral-Task-Decomposer-LoRA` es un adaptador QLoRA publicado por el usuario Mt-sea sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (rank 16, alpha 32) que modifica el comportamiento del Llama 3.1 de 8B para especializarlo en una tarea muy concreta: la descomposición neutral y lógica de tareas a partir de consultas del usuario, separando hechos objetivos de interpretaciones subjetivas y ordenando las subtareas segun sus dependencias. El adaptador esta entrenado mediante destilacion de comportamiento (behavior distillation) usando `google/gemma-4-31b-it` como modelo profesor y un subconjunto de `llm-jp/databricks-dolly-15k-ja` como datos auxiliares.

La propuesta del autor es eliminar por completo la respuesta empatica y el tono moralizante que suelen mostrar los asistentes conversacionales, sustituyendolos por un formato estructurado y estrictamente neutral. Ademas, incorpora un mecanismo de resolucion de conflictos temporales orientado a RAG: cuando el contexto de referencia contiene etiquetas `[fecha: YYYY-MM-DD]`, el modelo compara las fechas y prioriza la informacion mas reciente.

El modelo esta pensado para un publico japones (idioma declarado: `ja`) y su relevancia actual es limitada: se publico en noviembre de 2026, cuenta con cero descargas y cero likes, y no dispone de benchmarks estandar. Su interes es mas experimental (destilacion de un comportamiento muy especifico sobre un modelo de 8B) que practico para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA anade un numero no especificado de parametros (r=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.1 soporta 128K tokens) |
| Tipos de cuantizacion | El autor documenta carga en 4-bit NF4 con BitsAndBytes; no se publican pesos GGUF ni otras cuantizaciones |
| Idiomas soportados | Japones (`ja`) segun la model card |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT, libreria `peft`) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Modelo profesor | google/gemma-4-31b-it (Apache 2.0) |
| Rank / alpha LoRA | r = 16, lora_alpha = 32 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Framework de entrenamiento | Unsloth (QLoRA) |
| Optimizador / scheduler | adamw_8bit, Cosine, lr = 2e-4 |
| Steps de entrenamiento | 110 steps (aprox. 2 epocas, early stopping), loss final 0.3217 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only estandar (Llama 3.1 8B Instruct), sin cambios en la arquitectura de atencion ni en el tokenizador. El entrenamiento se realizo con QLoRA a traves de Unsloth, con cuantizacion de 4 bits del modelo base, batch efectivo de 16 (4 por dispositivo x 4 pasos de acumulacion de gradiente) y 110 pasos totales con parada temprana al observar convergencia de la perdida y riesgo de sobreajuste (loss final de 0.3217). Los modulos LoRA cubren todas las proyecciones lineales del bloque transformer (atencion y MLP), lo que da al adaptador capacidad de modificar tanto el estilo de respuesta como la estructura del razonamiento.

Los datos de entrenamiento son 850 ejemplos: 600 generados de forma sintetica por el modelo profesor `google/gemma-4-31b-it` y 250 extraidos de `llm-jp/databricks-dolly-15k-ja` filtrando tareas de tipo logico. La tecnica es destilacion de comportamiento: el estudiante aprende a imitar el formato y el tono del profesor en la tarea de descomposicion, no a reproducir su distribucion completa. No se documenta el uso de RLHF ni DPO. La innovacion principal es el llamado "Temporal RAG": el modelo interpreta etiquetas de fecha en el contexto y resuelve conflictos entre versiones de un mismo dato priorizando la fecha mas reciente, algo poco habitual en adaptadores de este tamano.

## Capacidades

- Generacion de texto en japones con tono neutral, sin formulas de empatia ni juicios morales.
- Separacion explicita entre hechos objetivos y opiniones o emociones del usuario.
- Descomposicion de tareas en subtareas ordenadas por dependencia logica, con estimacion de duracion cuando procede.
- Resolucion de conflictos temporales en contextos RAG mediante comparacion de etiquetas `[fecha: YYYY-MM-DD]`.
- Salida con estructura fija de encabezados (`### 1. Situacion (hechos / emociones)` y `### 2. Descomposicion de tareas`) cuando se le indica en el system prompt.
- Soporte de conversacion multi-turno heredado del modelo base Llama 3.1 Instruct.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la model card.
- Capacidad multilingue limitada en la practica: el autor solo declara japones; el modelo base soporta varios idiomas, pero el adaptador no fue entrenado para ellos.

## Casos de uso

- **Asistencia a la planificacion personal**: un usuario describe una situacion caotica (entregas, turnos de trabajo, plazos solapados) y el modelo devuelve una lista de tareas ordenadas por dependencia con estimaciones de tiempo, sin anadir mensajes de animo. Es adecuado porque el entrenamiento elimina explicitamente las respuestas empaticas.
- **Triage de tickets de soporte**: integrado en un pipeline que recibe el texto libre de un usuario, el modelo separa los hechos verificables (producto, version, error) de las quejas subjetivas y genera una lista de pasos de diagnostico ordenados. Util para derivar automaticamente al equipo correcto.
- **Preprocesado para RAG con documentacion versionada**: cuando el contexto recuperado contiene documentos con fechas, el modelo puede consolidar la informacion vigente y descartar versiones obsoletas antes de responder, reduciendo respuestas basadas en especificaciones antiguas.
- **Generacion de planes de proyecto a partir de reuniones**: a partir de una transcripcion o notas desordenadas, el adaptador extrae los hechos acordados y produce un desglose de tareas con orden logico, util como primer borrador para herramientas de gestion.
- **Sistemas de ayuda a estudiantes**: dado un problema de estudio o una situacion de examen, el modelo organiza el plan de accion sin sermonear ni ofrecer consuelo, lo que encaja en entornos donde se busca objetividad (por ejemplo, tutoria academica automatizada).
- **Normalizacion de entradas para clasificadores posteriores**: al convertir texto libre en una estructura de hechos y tareas, sirve como paso previo a un modelo de clasificacion o a un motor de reglas que necesite entradas limpias y ordenadas.
- **Investigacion sobre destilacion de comportamiento**: como caso de estudio reproducible de como un adaptador de rango 16 puede modificar el estilo de un modelo de 8B con solo 850 ejemplos, es util para experimentos academicos sobre control de tono.

## Benchmarks y rendimiento

El autor publica una evaluacion propia sobre 20 preguntas, sin comparacion con modelos externos:

| Metrica (20 preguntas) | Base: Llama-3.1-8B-Instruct | Ajustado: este adaptador | Diferencia |
|---|---|---|---|
| Apariciones totales de palabras empaticas o emocionales | 10 | 0 | -10 (-100%) |
| Tasa de respuesta completamente neutral (cero palabras empaticas) | 80,0% (16/20) | 100,0% (20/20) | +20,0 pt |
| Cumplimiento del formato estructurado | 0,0% (0/20) | 50,0% (10/20) | +50,0 pt |
| Resolucion de conflictos temporales (5 preguntas) | 100,0% (5/5) | 100,0% (5/5) | sin cambio |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores proceden exclusivamente de la evaluacion interna del autor y no son comparables con metricas de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo base en 4-bit NF4 (como documenta el autor) el consumo ronda los 5-6 GB; en 8-bit, unos 9-10 GB; en fp16, unos 16 GB. El adaptador en si ocupa muy poco (el repositorio completo pesa 0,2 GB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para cuantizacion 4-bit (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). Para fp16 se recomienda RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 8 GB o mas usando cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado por el autor), `vLLM` con soporte de adaptadores LoRA, `TGI` con adaptadores, y `llama.cpp`/`Ollama` solo si se fusiona el adaptador con el modelo base y se convierte a GGUF (no se publican pesos GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (Llama-3.1-8B-Neutral-Task-Decomposer-LoRA) | 8B (base) + LoRA r=16 | no disponible (base: 128K) | Llama 3.1 Community | Hugging Face, 0 descargas | Especializado en descomposicion neutral en japones |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community | Hugging Face, ampliamente usado | Modelo base generico, con tono empatico por defecto |
| bartowski/Meta-Llama-3.1-8B-Instruct-GGUF | 8B | 128K | Llama 3.1 Community | Hugging Face, cuantizaciones GGUF | Misma base, formato listo para llama.cpp |
| google/gemma-4-31b-it (profesor) | 31B | no disponible | Apache 2.0 | Hugging Face | Usado como profesor en la destilacion; mayor coste de inferencia |

No se dispone de comparaciones con adaptadores especializados en descomposicion de tareas de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador solo declara soporte de japones; su comportamiento en castellano u otros idiomas no esta validado y probablemente degrade el formato y el tono.
- La evaluacion se limita a 20 preguntas internas, sin conjunto de test publico ni comparacion con terceros; los resultados deben tomarse como indicativos.
- La tasa de cumplimiento del formato estructurado es solo del 50% en la propia evaluacion del autor, lo que implica que la mitad de las respuestas no siguen el esquema esperado sin un system prompt muy directivo.
- Riesgo de alucinacion heredado del modelo base de 8B, especialmente en la extraccion de hechos de textos largos o ambiguos.
- El modelo esta entrenado para eliminar la empatia; en contextos de atencion al cliente o salud puede resultar frio o inadecuado, y su uso en esos dominios requiere supervision humana.
- Licencia Llama 3.1 Community: permite uso comercial con condiciones (atribucion, limitaciones de escala y politicas de uso aceptable); es necesario revisar el texto completo antes de desplegar en produccion.
- El modelo profesor es `google/gemma-4-31b-it` (Apache 2.0), pero los datos sinteticos generados por el pueden heredar sesgos de ese modelo.
- Publicado en noviembre de 2026 con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion independiente.
- El repositorio solo contiene el adaptador; es obligatorio descargar el modelo base por separado y aceptar su licencia.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Mt-sea/Llama-3.1-8B-Neutral-Task-Decomposer-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base (variante sin instruct): https://huggingface.co/meta-llama/Llama-3.1-8B
- Cuantizaciones GGUF del modelo base: https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Dataset auxiliar: https://huggingface.co/datasets/llm-jp/databricks-dolly-15k-ja
- Modelo profesor (referenciado en la model card): https://huggingface.co/google/gemma-4-31b-it
