# PresenceAI/Erato-27B-DPO-LoRA-v1.0

## Resumen

Erato-27B-DPO-LoRA-v1.0 es un adaptador LoRA de PEFT desarrollado por PresenceAI, publicado como parte de su serie Presence Muses. No se trata de un modelo completo, sino de un adaptador de optimización de preferencias directa (DPO) que debe cargarse sobre el modelo base Qwen/Qwen3.8-27B. Su propósito es alinear el comportamiento conversacional del modelo base hacia roleplay y conversación de tipo acompañante (companion), con capacidad de emitir llamadas a herramienta mediante `send_message`.

El adaptador se ha entrenado con 6.063 pares de preferencia derivados de 2.021 contextos conversacionales, donde la respuesta elegida es de escritura humana y la rechazada es generada por modelo. El adaptador tiene rango r=32, alpha=32 y dropout=0, y se aplica sobre las proyecciones de atención y MLP del transformer del modelo base. El repositorio ocupa 0,7 GB y contiene únicamente los pesos del adaptador, no los del modelo base.

La relevancia de esta ficha radica en que ejemplifica un patrón habitual en el ecosistema open source: adaptadores ligeros de alineación sobre modelos base grandes, con licencia Apache-2.0 y soporte para despliegue en vLLM con tool calling. No obstante, el autor no publica benchmarks, datos de preferencia ni evaluación de seguridad, por lo que debe tratarse como un adaptador experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5 (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | No disponible (el adaptador tiene r=32, alpha=32; el modelo base es de 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base puede cuantizarse segun sus propias opciones |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r = 32, alpha = 32, dropout = 0.0 |
| Modulos objetivo | Proyecciones de atencion y MLP (regex en `adapter_config.json`) |
| Etapa de entrenamiento | DPO (Direct Preference Optimization) |
| Framework | TRL / PEFT |
| Tamano del repo | 0,7 GB |
| Modelo base | Qwen/Qwen3.8-27B (no incluido) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base Qwen/Qwen3.8-27B, que emplea la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`). Se trata de un transformer denso de 27.000 millones de parametros, aunque la informacion proporcionada no detalla el numero de capas, dimensiones ocultas ni la longitud de contexto nativa. El adaptador LoRA modifica las proyecciones de atencion y de las capas MLP mediante matrices de bajo rango con r=32 y alpha=32, sin dropout.

El entrenamiento consiste en una etapa de DPO sobre 6.063 pares de preferencia construidos a partir de 2.021 contextos conversacionales. En cada par, la respuesta `chosen` es una replica escrita por humanos y la `rejected` es una respuesta generada por modelo. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas previas de SFT. Los datos de preferencia no se han publicado. El adaptador se inicializa directamente desde el modelo base, sin checkpoint intermedio ni adaptador previo. El autor indica que el despliegue se realizo con transformers >= 5.16 y un parser de tool calls `qwen3_xml` en vLLM.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay y companion chat.
- Emision de llamadas a herramienta mediante `send_message`, con soporte de tool calling en vLLM a traves del parser `qwen3_xml`.
- Alineacion de preferencias para respuestas mas naturales y humanas en contextos de conversacion roleplay.
- Soporte bilingue: ingles y chino.
- Integracion con el ecosistema PEFT/Transformers y con vLLM mediante `--enable-lora`.
- No se documentan capacidades de vision, audio, razonamiento matematico avanzado ni agentes multi-paso mas alla del tool calling basico.

## Casos de uso

- Roleplay conversacional multi-turno: el adaptador ajusta el estilo y las preferencias del modelo base para mantener personajes coherentes en conversaciones largas, gracias a los pares de preferencia derivados de contextos conversacionales reales.
- Asistentes de acompanamiento (companion chat): adecuado para aplicaciones de chat emocional o de entretenimiento donde se busca un tono conversacional humanizado, con la cautela de que no sustituye consejo profesional.
- Integracion en pipelines de agentes con tool calling: el modelo puede emitir llamadas `send_message` dentro de un flujo de agente, lo que permite conectar la conversacion con acciones externas (envio de mensajes, notificaciones) en despliegues vLLM.
- Prototipado rapido de chatbots personalizados: al ser un adaptador de 0,7 GB sobre un base de 27B, permite iterar sobre el estilo conversacional sin reentrenar el modelo completo.
- Despliegue multi-tenant con LoRA dinamica: vLLM permite cargar el adaptador como modulo LoRA junto al base, lo que facilita servir varias variantes de estilo sobre una misma instancia.
- Experimentacion academica en alineacion: util como ejemplo reproducible de DPO con LoRA sobre un modelo Qwen de 27B para estudiar el efecto de la optimizacion de preferencias en dominios conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,7 GB, pero la inferencia requiere cargar el modelo base Qwen/Qwen3.8-27B completo.
- VRAM estimada para el base en bfloat16: aproximadamente 54 GB solo para pesos, mas overhead de activaciones y KV cache; en cuantizacion de 8 bits, en torno a 27-30 GB; en 4 bits, en torno a 15-18 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o multi-GPU con tensor parallelism.
- GPU consumer: posible en RTX 4090 (24 GB) solo con cuantizacion agresiva del base (4 bits) y contexto reducido; no cabe en bf16 en una sola consumer GPU.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32` y `--tool-call-parser qwen3_xml`; Transformers + PEFT; llama.cpp/Ollama requeririan conversion del adaptador y del base, no documentada por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Erato-27B-DPO-LoRA-v1.0 | Adaptador sobre 27B | No disponible | LoRA DPO | Apache-2.0 | Roleplay/companion, tool calling, sin benchmarks |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Modelo completo | Apache-2.0 | Base sin alineacion especifica de roleplay |
| Adaptadores DPO de roleplay comparables | Variable | No disponible | LoRA DPO | Variable | No se dispone de datos concretos en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Entrenado especificamente para roleplay y companion chat; puede producir respuestas estilizadas o inapropiadas fuera de ese dominio.
- Puede reproducir patrones o contenido de los datos de preferencia, que no se han publicado; se recomienda desplegar con filtros de privacidad y seguridad.
- No incluye evaluacion de seguridad ni benchmarks de tarea; debe tratarse como un adaptador experimental.
- Riesgo de alucinacion inherente al modelo base, agravado en dominios factuales para los que no fue alineado.
- Solo soporta ingles y chino; el rendimiento en castellano no esta documentado.
- Uso fuera de alcance declarado por el autor: respuesta a preguntas factuales, consejo medico/legal/financiero y toma de decisiones de alto riesgo.
- La licencia Apache-2.0 del adaptador no exime de cumplir los terminos del modelo base Qwen/Qwen3.8-27B, tambien Apache-2.0.
- El adaptador requiere transformers >= 5.16 y una version compatible de PEFT; versiones anteriores pueden no cargar la arquitectura Qwen3.5.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/PresenceAI/Erato-27B-DPO-LoRA-v1.0
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
