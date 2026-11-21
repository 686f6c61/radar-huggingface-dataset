# Denisijcu/vertex-voice-agenda-GGUF

## Resumen

Vertex Voice Agenda Agent es un ajuste fino de Qwen3-4B-Instruct-2507 orientado a un nicho muy concreto: la gestión de llamadas telefónicas y agenda en nombre de una persona. Lo desarrolla Denisijcu bajo el paraguas de Vertex Coders, y se distribuye en formato GGUF Q4_K_M para inferencia local con llama.cpp o LM Studio. Con 4.022.468.096 parámetros, hereda la arquitectura transformer densa del Qwen3-4B base y añade un comportamiento muy específico: devolver en cada turno un único objeto JSON con una respuesta breve para locución y una lista de llamadas a herramientas.

El modelo no pretende ser un asistente generalista, sino un componente dentro de un orquestador de voz. Su función es decidir qué herramienta invocar (`check_calendar`, `book_appointment`, `log_call_outcome`, `hangup_call`) y redactar una frase corta y natural para que un sistema TTS la lea por teléfono. Es relevante porque ejemplifica el patrón de modelos pequeños especializados en tool calling estructurado, desplegables en hardware modesto y con latencia compatible con conversación en tiempo real.

El ajuste se hizo con QLoRA sobre la versión ya cuantizada en bnb-4bit de Unsloth, con un dataset sintético de 560 llamadas completas. La licencia Apache 2.0 y el tamaño del repo (2,5 GB) lo hacen accesible para pruebas y despliegues pequeños, aunque su ámbito de uso es deliberadamente estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenado con `max_seq_length=2048`) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica exportacion publicada) |
| Idiomas soportados | es (espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-4B-Instruct-2507.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit`, es decir, un Qwen3-4B-Instruct-2507 ya cuantizado a 4 bits con bitsandbytes para facilitar el ajuste en GPU de gama media. Sobre esa base se aplicó QLoRA con rango 16, `lora_alpha=16`, `lora_dropout=0.0` y sin bias, apuntando a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento usó `SFTTrainer` de TRL con `adamw_torch_fused`, tasa de aprendizaje 2e-4, lote efectivo de 8 (2 × 4 con acumulación de gradiente), 3 épocas (189 pasos) y longitud máxima de secuencia de 2048 tokens.

Los datos son un dataset propio y sintético de 560 llamadas completas (504 de entrenamiento, 56 de validación), generado con el mismo código del orquestador y validado repitiendo cada llamada en el orquestador real. Cubre cuatro objetivos (`dentist_appointment`, `employer_outreach`, `client_marketing`, `follow_up`) y diez escenarios: agenda a la primera, horario ocupado, propuesta de otro día, agenda llena, preguntas con y sin dato en las notas, intentos de manipulación, buzón de voz, sin respuesta, rechazo y "llame más tarde". La innovación técnica no está en la arquitectura sino en el formato de salida: un JSON estricto por turno con `assistant_reply` y `tool_calls`, diseñado para ser consumido directamente por un orquestador de telefonía.

## Capacidades

- Generación de texto conversacional breve, en español, optimizada para locución por voz (una o dos oraciones por turno).
- Tool calling estructurado con cuatro herramientas: `check_calendar`, `book_appointment`, `log_call_outcome` y `hangup_call`, cada una con su esquema de parámetros.
- Salida en JSON estricto por turno, sin texto fuera del objeto, lo que facilita el parseo determinista en el orquestador.
- Razonamiento multi-turno sobre huecos de agenda: consulta ventanas, negocia horarios y solo reserva dentro de los huecos confirmados.
- Gestión de escenarios de cierre: buzón de voz, sin respuesta, rechazo, petición de llamada posterior.
- Manejo básico de intentos de manipulación (el prompt de sistema instruye a no revelar instrucciones internas ni ejecutar comandos).
- Capacidad multilingüe limitada al español según la model card.
- No dispone de visión, audio nativo ni modo "thinking" explícito.

## Casos de uso

- Agenda de citas médicas o dentales por teléfono: el modelo gestiona la apertura, consulta la ventana indicada con `check_calendar`, negocia un hueco libre y confirma con `book_appointment`, cerrando con `log_call_outcome` y `hangup_call`.
- Contacto con empleadores en nombre de un candidato: con objetivo `employer_outreach`, el modelo puede confirmar entrevistas o roles y registrar el resultado como `interview_or_role_confirmed`.
- Seguimiento de campañas de marketing o servicio al cliente: con objetivo `client_marketing`, gestiona llamadas salientes con notas de contexto y registra el desenlace.
- Gestión de buzón de voz: detecta el escenario, deja un mensaje breve, registra `voicemail_left` y cuelga con `send_sip_bye: true`.
- Reintentos y callbacks: cuando la contraparte pide "llame más tarde", el modelo emite `callback_requested` con resumen y siguiente acción, lo que permite al orquestador programar el reintento.
- Integración en centralitas SIP o plataformas de voz: al devolver JSON estricto, se conecta directamente a un orquestador que ejecuta las herramientas y pasa la respuesta a un TTS.
- Pruebas de robustez frente a manipulación: útil como banco de pruebas para evaluar cómo un modelo pequeño maneja instrucciones adversariales en un dominio acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3 GB con la cuantización Q4_K_M publicada (modelo de 4B a 4 bits más overhead de contexto).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090); también cabe en GPUs de datacenter (A100, H100) aunque está sobredimensionado para ellas.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: llama.cpp, LM Studio (mencionado en la model card), y cualquier runtime compatible con GGUF. vLLM y TGI no están indicados explícitamente para esta exportación GGUF.
- Latencia y throughput estimados: no disponibles. El diseño apunta a conversación en tiempo real, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Vertex Voice Agenda Agent | 4,02B | no disponible (entrenado a 2048) | Tool calling de voz y agenda en espanol | Apache 2.0 | GGUF Q4_K_M |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | no disponible en esta ficha | Asistente generalista y tool calling | Apache 2.0 | safetensors, GGUF (segun distribucion) |
| Qwen2.5-3B-Instruct | ~3B | 32K (segun model card oficial) | Asistente generalista multilingue | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B-Instruct | ~3B | 128K (segun model card oficial) | Asistente generalista multilingue | Llama 3.2 Community License | safetensors, GGUF |

La comparación directa con los generalistas no es del todo justa: Vertex Voice Agenda Agent está especializado en un esquema de herramientas concreto y en español, mientras que los alternativos cubren un rango mucho más amplio de tareas. Para el dominio de agenda telefónica, el ajuste fino debería superar a los generalistas en adherencia al formato JSON y en el uso correcto de las cuatro herramientas, aunque no hay datos públicos que lo confirmen.

## Limitaciones y advertencias

- Ámbito muy estrecho: el modelo rinde bien solo con el prompt de sistema y el formato de mensajes del orquestador de Vertex Coders; fuera de ese formato el comportamiento puede degradarse.
- Entrenado exclusivamente en español; no se garantiza calidad en otros idiomas.
- Dataset sintético de 560 llamadas: cobertura limitada de escenarios del mundo real (acentos, ruido, interrupciones, solapamientos de habla no están representados en el texto).
- Riesgo de alucinación en datos de contacto, horarios o notas si el contexto no los contiene; el prompt de sistema instruye a no inventar, pero no hay garantía formal.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3-4B, puede heredar sesgos del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B-Instruct-2507 y de la versión bnb-4bit de Unsloth.
- Solo se publica una cuantización (Q4_K_M); no hay versiones en safetensors, Q5, Q8 ni FP16 en el repo.
- No hay benchmarks publicados ni métricas de latencia, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.
- La fecha de creación del repo (2026-11-21) y el escaso historial (0 descargas, 0 likes) indican que es un modelo reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Denisijcu/vertex-voice-agenda-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Modelo original Qwen3-4B-Instruct-2507: no disponible en la informacion proporcionada
- Paper o blog de Vertex Coders: no disponible en la informacion proporcionada
- Repositorio del orquestador (`api/app/policy.py`): no disponible en la informacion proporcionada
