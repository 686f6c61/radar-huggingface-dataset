# Khalid-Mehmood-117/qwen2.5-0.5b-ticket-triage-lora

## Resumen

El modelo `qwen2.5-0.5b-ticket-triage-lora` es un adaptador LoRA (PEFT) publicado por el usuario Khalid-Mehmood-117 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su funcion es acotada y muy concreta: recibir un unico ticket de soporte al cliente y devolver un JSON estricto con los campos `category`, `priority`, `sentiment`, `needs_human`, `suggested_action` y una `reason` breve. No es un modelo generalista, sino un clasificador generativo especializado en triaje de tickets.

El adaptador se entreno con TRL SFTTrainer sobre 1343 tickets sinteticos de entrenamiento y 169 de validacion, generados con gpt-4o-mini. La configuracion LoRA es r=16, alpha=32, dropout=0.05, aplicada a todas las capas lineales, con learning rate 0.0002, schedule coseno, batch efectivo de 16 y hasta 3 epocas con early stopping sobre la perdida de validacion. El mejor valor de perdida de validacion fue 0.3280 y el entrenamiento completo duro 7.3 minutos en una Tesla T4 en fp16.

Su relevancia actual es la de un caso de destilacion de tareas muy vertical: con solo 0.5 mil millones de parametros en el modelo base, el adaptador alcanza un 92.3 % de exactitud en categoria y un 100 % de JSON valido en validacion, a un coste de 0.366 segundos por ticket. Es un ejemplo tipico de "small language model + LoRA" para tareas de clasificacion estructurada, donde el objetivo es sustituir llamadas a un modelo grande por inferencia local barata. Las reglas de negocio sensibles (seguridad, legal, fraude, chargeback) se aplican en codigo despues del modelo y no forman parte del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA PEFT |
| Parametros totales | Aproximadamente 0.5 mil millones en el modelo base (Qwen2.5-0.5B-Instruct); parametros del adaptador LoRA no especificados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; admite combinacion con bases cuantizadas) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 0.5 mil millones de parametros. Sobre el se aplica un adaptador LoRA de rango 16 y alpha 32 con dropout 0.05 sobre todas las capas lineales, lo que anade un conjunto reducido de parametros entrenables sin modificar los pesos originales. El entrenamiento se realizo con TRL SFTTrainer en fp16 sobre una Tesla T4, con optimizacion de tipo supervised fine-tuning y calculo de la perdida unicamente sobre la respuesta (loss on the answer only).

El conjunto de datos es enteramente sintetico: 1343 tickets de entrenamiento y 169 de validacion generados con gpt-4o-mini, correspondientes al commit 1e2f835 del repositorio del autor. Se empleo learning rate 0.0002 con schedule coseno, batch efectivo de 16 y hasta 3 epocas con early stopping sobre la perdida de validacion, alcanzando un minimo de 0.3280 en 7.3 minutos de entrenamiento. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas adicionales de alineamiento, ni innovaciones del tipo decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto con salida estructurada: devuelve JSON estricto con los campos category, priority, sentiment, needs_human, suggested_action y reason.
- Clasificacion de tickets de soporte al cliente en una unica pasada, sin necesidad de pipeline externo de parseo si se respeta el formato.
- Deteccion de escalado a humano mediante el campo booleano needs_human (exactitud de 0.941 en validacion).
- Analisis de sentimiento del ticket (exactitud de 0.858 en validacion).
- Asignacion de prioridad (exactitud de 0.876 en validacion).
- Sugerencia de accion concreta al agente (exactitud de 0.864 en validacion).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible.

## Casos de uso

- Triaje automatico de la bandeja de entrada de soporte: el adaptador clasifica cada ticket entrante en categoria, prioridad y sentimiento, y decide si requiere intervencion humana. Es adecuado porque el coste por ticket es de 0.366 segundos en una GPU modesta y el formato de salida es JSON parseable directamente.
- Enrutado de tickets a equipos especializados: el campo category permite dirigir cada ticket al equipo correspondiente (facturacion, soporte tecnico, etc.) sin intervencion manual, reduciendo el tiempo de primera respuesta.
- Priorizacion de colas en tiempo real: el campo priority permite reordenar la cola de atencion, elevando los tickets urgentes o con sentimiento negativo.
- Enriquecimiento previo a un agente conversacional grande: el adaptador actua como primer filtro y pasa al modelo grande solo los tickets que lo requieren (needs_human = true), reduciendo coste de tokens.
- Monitorizacion de calidad y analitica: agregar los campos categoricos devueltos por el modelo sobre lotes historicos de tickets permite construir cuadros de mando de volumen por categoria, prioridad y sentimiento sin etiquetado manual.
- Clasificacion en el borde (on-premise o edge): al tratarse de un modelo de 0.5 mil millones de parametros, puede ejecutarse en CPU o en GPU de consumo sin enviar datos de clientes a servicios externos, lo que facilita el cumplimiento de requisitos de privacidad.
- Preetiquetado para revision humana: el campo suggested_action y la reason asociada sirven como borrador de respuesta o de accion para que el agente solo revise y confirme, acelerando el flujo de trabajo.
- Filtro previo a un motor de reglas de negocio: dado que el autor indica que las reglas de seguridad, legal, fraude y chargeback se aplican en codigo despues del modelo, un caso natural es usar el adaptador como etapa de normalizacion y el codigo como etapa de decision.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Los unicos datos de rendimiento disponibles son las metricas de validacion del propio adaptador, con decodificacion greedy y antes de aplicar las reglas de negocio, sobre 169 tickets:

| Metrica | Valor |
|---|---|
| Tickets evaluados | 169 |
| json_valid | 1.0 |
| category_accuracy | 0.923 |
| priority_accuracy | 0.876 |
| sentiment_accuracy | 0.858 |
| needs_human_accuracy | 0.941 |
| suggested_action_accuracy | 0.864 |
| all_fields_accuracy | 0.657 |
| seconds_per_ticket | 0.366 |
| Best validation loss | 0.3280 |

Los resultados del conjunto de test se encuentran, segun el autor, en el repositorio de GitHub (`eval/results.md`), pero no estan incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para el modelo base de 0.5B en fp16/bf16: aproximadamente 1.0-1.5 GB para pesos y overhead de inferencia, segun el runtime.
- VRAM estimada en int8: aproximadamente 0.5-0.8 GB.
- VRAM estimada en int4: aproximadamente 0.3-0.6 GB.
- El coste del adaptador LoRA es despreciable frente a los pesos base.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3060, RTX 4060, RTX 4090, e incluso puede ejecutarse en CPU con llama.cpp u Ollama, aunque con mayor latencia.
- GPUs de datacenter (A100, H100, L4, T4) no son necesarias: el autor entreno y evaluo en una Tesla T4, con 0.366 segundos por ticket en decodificacion greedy.
- Opciones de despliegue: PEFT + transformers para cargar el adaptador sobre el modelo base; vLLM y TGI admiten servir adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Throughput estimado: a partir de los 0.366 segundos por ticket en T4, el orden de magnitud es de aproximadamente 2-3 tickets por segundo en esa GPU con decodificacion greedy, sin batching.
- La informacion disponible no incluye datos de latencia ni throughput con batching, ni en otras GPU.

## Comparativa con modelos similares

No se han publicado comparaciones directas contra alternativas en la informacion disponible. La siguiente tabla resume la comparacion con el modelo base y con alternativas de la misma categoria (modelos pequenos para clasificacion o generacion estructurada). Los datos de las alternativas no se han verificado en esta ficha y se marcan como no disponibles cuando no procede.

| Modelo | Parametros | Contexto | Rendimiento en triaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-ticket-triage-lora | 0.5B base + LoRA | no disponible | all_fields_accuracy 0.657; category_accuracy 0.923 en 169 tickets de validacion | apache-2.0 | HuggingFace (adaptador PEFT) |
| Qwen2.5-0.5B-Instruct (base, sin adaptar) | 0.5B | no disponible | no disponible (no evaluado en la ficha) | apache-2.0 | HuggingFace |
| Modelos pequenos alternativos (por ejemplo, Qwen2.5-1.5B-Instruct o Llama-3.2-1B-Instruct) | 1B-1.5B | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |

## Limitaciones y advertencias

- Entrenamiento con datos sinteticos generados por gpt-4o-mini: el adaptador aprende la distribucion del generador, no la de tickets reales, por lo que puede degradarse ante vocabulario, jerga o casuistica ausente del conjunto sintetico.
- Tamano del conjunto de datos reducido: 1343 tickets de entrenamiento y 169 de validacion. Es un volumen bajo para garantizar robustez en produccion.
- all_fields_accuracy de 0.657: aproximadamente un tercio de los tickets de validacion tiene al menos un campo incorrecto, aunque el JSON sea valido en el 100 % de los casos.
- Exactitudes por campo moderadas: sentiment 0.858 y priority 0.876 implican tasas de error no despreciables en tareas que pueden tener impacto operativo.
- Las reglas de negocio de seguridad, legal, fraude y chargeback no estan en el modelo y deben implementarse en codigo; confiar en la salida del modelo para esas decisiones es un riesgo.
- El autor exige usar el system prompt de `src/triage/prompts.py`; usarlo con otro prompt puede degradar el formato y las exactitudes.
- Modelo base de 0.5B: capacidad de razonamiento limitada, con riesgo de alucinacion en tickets ambiguos, ironicos o con informacion incompleta.
- Idiomas soportados no documentados: no hay evidencia de rendimiento fuera del idioma de los tickets sinteticos de entrenamiento.
- Longitud de contexto no especificada: no hay garantia de comportamiento con tickets largos o hilos de conversacion extensos.
- Ausencia de validacion externa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Qwen2.5-0.5B-Instruct por separado.
- No hay informacion sobre sesgos, evaluacion de seguridad ni comportamiento ante entradas adversarias.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Khalid-Mehmood-117/qwen2.5-0.5b-ticket-triage-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del autor (codigo, data card y evaluacion): https://github.com/Khalid-Mehmood-117/fine-tuned-llm-ticket-triage
- Resultados de test del autor, referenciados en la model card: `eval/results.md` dentro del repositorio de GitHub
- System prompt de referencia del autor: `src/triage/prompts.py` dentro del repositorio de GitHub
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los unicos resultados obtenidos corresponden a una persona publica no relacionada con el proyecto, por lo que no se incluyen como referencias tecnicas.
