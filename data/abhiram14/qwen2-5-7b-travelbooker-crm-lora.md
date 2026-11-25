# Abhiram14/Qwen2.5-7B-TravelBooker-CRM-LoRA

## Resumen

Qwen2.5-7B-TravelBooker-CRM-LoRA es un adaptador LoRA publicado por el usuario Abhiram14 sobre el modelo base Qwen/Qwen2.5-7B-Instruct. El adaptador especializa el modelo para actuar como agente de reservas de viajes dentro de un CRM operado a traves de WhatsApp, interpretando peticiones en ingles y en Manglish (malayalam escrito con alfabeto latino) y emitiendo llamadas a herramientas en JSON estricto en ingles.

El modelo resuelve un problema muy concreto: convertir conversaciones informales y multilingues de clientes de una agencia de viajes india en operaciones estructuradas sobre tres herramientas de CRM (creacion de leads, reserva de paquetes y consulta de estado de reserva). Se entreno en dos etapas, SFT y DPO, con el objetivo explicito de reducir alucinaciones en numeros de telefono y fechas, normalizar fechas del formato indio DD/MM/YYYY a ISO YYYY-MM-DD y evitar inventar presupuestos por defecto.

Es relevante como ejemplo de adaptacion vertical de un modelo generalista de 7B a un dominio de negocio con requisitos estrictos de formato de salida y de fiabilidad de datos. El repositorio solo contiene los pesos del adaptador (unos 0,2 GB), no el modelo completo, por lo que su uso requiere descargar el modelo base Qwen2.5-7B-Instruct de forma independiente. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA entrenado mediante PEFT |
| Parametros totales | 7B en el modelo base; el adaptador LoRA se publica como pesos separados (repo de 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con bitsandbytes (double quant); el adaptador puede cargarse sobre el base en 4-bit, 8-bit o fp16 |
| Idiomas soportados | Ingles (en) y Manglish/malayalam (ml) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7B parametros. La configuracion LoRA usa r=16, alpha=32 y modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, es decir, cubre tanto las proyecciones de atencion como las del MLP. El entrenamiento se realizo en QLoRA con cuantizacion 4-bit NF4 y double quantization mediante bitsandbytes.

El pipeline tiene dos etapas. La primera es un SFT con enmascaramiento de perdida solo en turnos del asistente, sobre dialogos multiturno bilingues (Manglish/ingles) de tool calling. La segunda es un DPO con beta=0.1 orientado a corregir comportamientos concretos: evitar telefonos y fechas alucinadas, normalizar fechas indias DD/MM/YYYY a YYYY-MM-DD, no fabricar presupuestos por defecto (devuelve budget_inr: 0 cuando se omite) y rechazar telefonos incompletos de 9 digitos antes de escribir en el CRM. No se especifica en la informacion disponible el volumen de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de llamadas a herramientas (function calling) en JSON estricto en ingles para tres funciones de CRM: create_travel_lead, book_trip_package y check_booking_status.
- Comprension bilingue de ingles y Manglish (malayalam transliterado) en la entrada del usuario.
- Gestion de dialogos multiturno orientados a la recogida de datos (nombre, telefono, destino, presupuesto, fecha, numero de huespedes, tipo de paquete).
- Normalizacion de fechas del formato indio DD/MM/YYYY al formato ISO YYYY-MM-DD.
- Validacion basica de datos antes de invocar la herramienta: rechazo de telefonos de 9 digitos y no invencion de presupuestos.
- Razonamiento de agente de un solo paso orientado a la seleccion de la herramienta adecuada segun la intencion del cliente.
- No se documentan capacidades de vision, audio, codigo general ni modo de razonamiento extendido (thinking) especificas del adaptador.

## Casos de uso

- Atencion al cliente por WhatsApp en agencias de viajes: el modelo interpreta mensajes en Manglish o ingles y emite la llamada create_travel_lead con nombre, telefono, destino y presupuesto en INR, integrandose en un webhook de WhatsApp Business API.
- Registro automatizado de leads: a partir de una conversacion informal, extrae los campos estructurados y los envia al CRM sin intervencion humana, reduciendo el trabajo manual de captura.
- Reserva de paquetes turisticos: transforma peticiones como fechas en formato indio y numero de huespedes en una llamada book_trip_package con fecha normalizada a YYYY-MM-DD y tipo de paquete (resort, houseboat, etc.).
- Consulta de estado de reservas: el cliente pregunta por su booking_id y telefono; el modelo genera check_booking_status y devuelve la respuesta del CRM en la conversacion.
- Prototipado rapido de agentes verticales: sirve como referencia de pipeline SFT+DPO para equipos que quieran replicar la especializacion en otro dominio con un modelo base de 7B.
- Filtrado y validacion previa a escritura en CRM: la alineacion DPO reduce el riesgo de insertar telefonos incompletos o presupuestos inventados, lo que lo hace util como capa de validacion en flujos de captacion.
- Soporte multilingue para el mercado de Kerala: atiende a usuarios que escriben malayalam en caracteres latinos, un caso poco cubierto por modelos generalistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con el modelo base en 4-bit NF4 (como en el quickstart), aproximadamente 5-6 GB para los pesos; en fp16, en torno a 14-16 GB. El adaptador anade un consumo marginal (repo de 0,2 GB).
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo y mayor throughput; L40S o A10G para despliegue en 4-bit; RTX 4090 (24 GB) o RTX 3090 para fp16 en una sola GPU.
- GPU de consumo: cabe en GPUs consumer de 8-12 GB si se carga el base en 4-bit (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB); en 8 GB puede ser ajustado segun longitud de contexto.
- Opciones de despliegue: transformers + peft + bitsandbytes (flujo documentado por el autor); vLLM o TGI requeririan fusionar el adaptador en el base o usar soporte de adaptadores LoRA; llama.cpp/Ollama requeririan conversion del adaptador a GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-TravelBooker-CRM-LoRA | 7B (base) + LoRA | no disponible | Tool calling CRM viajes, en/ml | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Generalista, tool calling | Apache 2.0 | Hugging Face |
| Modelos de function calling generalistas de 7B (p. ej. familias Llama 3.1 8B Instruct) | 7-8B | no disponible en esta ficha | Generalista | licencia propia del proveedor | Hugging Face |

La comparativa cuantitativa de rendimiento no esta disponible; el adaptador no publica metricas frente a alternativas.

## Limitaciones y advertencias

- El adaptador solo cubre tres herramientas de CRM y un dominio (viajes); fuera de ese alcance su comportamiento equivale al del modelo base o puede degradarse.
- La salida de tool calls esta pensada en ingles aunque la entrada sea Manglish; no se garantiza coherencia si se solicita salida en malayalam.
- Riesgo de alucinacion en campos no validados por las reglas DPO (por ejemplo, destinos o tipos de paquete no contemplados).
- El DPO mitiga pero no elimina errores en telefonos y fechas; conviene mantener validacion programatica antes de escribir en el CRM.
- No hay datos publicados de evaluacion, benchmarks ni tasas de error en produccion.
- El repositorio solo contiene el adaptador; es obligatorio descargar Qwen2.5-7B-Instruct y respetar su licencia (Apache 2.0).
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantias del autor sobre exactitud en produccion.
- Idiomas limitados a ingles y Manglish; no se documenta soporte de otros idiomas ni de malayalam en escritura nativa.

## Enlaces

- Hugging Face: https://huggingface.co/Abhiram14/Qwen2.5-7B-TravelBooker-CRM-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- No se han encontrado en la informacion proporcionada papers, blogs, repos adicionales ni demos del autor.
