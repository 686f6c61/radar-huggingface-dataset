# Kami0867/qwen2.5-3b-personalized-email-lora

## Resumen

El modelo `Kami0867/qwen2.5-3b-personalized-email-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario Kami0867 sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Se trata de un ajuste fino supervisado (SFT) mediante QLoRA en 4 bits NF4, orientado específicamente a la generación de correos electrónicos personalizados condicionados por una persona y un perfil de estilo. El adaptador aprende a adoptar la voz de una persona concreta (formalidad, tono, nivel de vocabulario, estructura de frases, muletillas características) y a redactar correos en ese registro, evitando activamente los clichés típicos de la IA corporativa como "I hope this email finds you well" o "delve".

El problema que resuelve es concreto: la generación de correos profesionales que suenen humanos y ajustados a un estilo personal, en lugar de plantillas genéricas. El adaptador se distribuye como un conjunto de pesos PEFT (safetensors) que requiere cargar el modelo base Qwen2.5-3B-Instruct y aplicar el adaptador encima. El repositorio ocupa 0,5 GB y la licencia es Apache 2.0.

Es relevante en el contexto actual de adaptación eficiente de modelos: demuestra que con un único GPU consumer (RTX 5060 Ti de 8 GB) y un dataset sintético de unas 12.000 muestras se puede especializar un modelo de 3.000 millones de parámetros en una tarea de nicho con un coste de entrenamiento de aproximadamente 4,8 horas. No obstante, el modelo es muy reciente (creado en noviembre de 2026), no tiene descargas ni likes, y no se han publicado evaluaciones held-out ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | 3.000 millones (modelo base); adaptador LoRA con r=16 sobre 7 proyecciones lineales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens de entrenamiento (max_seq_length); contexto del modelo base no especificado en la informacion disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 (bnb_4bit_compute_dtype=bfloat16, double quant); el adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere modelo base Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros. El ajuste se realiza con QLoRA: el modelo base se cuantiza a 4 bits NF4 con doble cuantización y se entrena un adaptador LoRA de rango 16 y alpha 32 sobre las siete proyecciones lineales del transformer (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Se usa pérdida enmascarada solo en los tokens del asistente (completion-only loss masking), con los tokens de sistema y usuario enmascarados a -100. El entrenamiento emplea Transformers Trainer + PEFT, precisión bfloat16, 3 épocas, learning rate 2e-4 con scheduler coseno, warmup del 5 %, batch efectivo de 16 (batch 2 × acumulación 8), optimizador Paged AdamW 8-bit, weight decay 0,01, gradient checkpointing no reentrante y semilla 42. Se ejecutaron 2.025 pasos globales en aproximadamente 17.271 segundos (4,8 horas) sobre una única RTX 5060 Ti de 8 GB, con un pico de VRAM de 7,2 GB.

Los datos de entrenamiento son aproximadamente 12.000 muestras sintéticas de correos condicionados por persona, generadas por un pipeline propio (`email_data_pipeline`): 6.000 provenientes de FinePersonas-Synthetic-Email-Conversations y 6.000 de personas laborales de PersonaHub. Cada muestra incluye un perfil de estilo con formalidad, tono, franqueza, nivel de vocabulario, estructura de frases, preferencias de formato y frases características. Se aplicó un filtrado explícito de clichés de IA. La pérdida final de entrenamiento reportada es 0,5564 (media de las 3 épocas), que el propio autor advierte que no es una pérdida de evaluación held-out. No se documenta uso de RLHF ni DPO; es SFT puro.

## Capacidades

- Generación de texto conversacional con plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Redacción de correos electrónicos personalizados condicionados por una persona y un perfil de estilo (formalidad, tono, vocabulario, estructura, frases características).
- Adaptación de voz y registro: el adaptador imita el estilo descrito en el system prompt.
- Supresión de clichés corporativos de IA gracias al filtrado anti-slop del dataset.
- Seguimiento de instrucciones estructuradas: el usuario puede enumerar puntos concretos que el correo debe cubrir.
- Generación con parámetros de muestreo configurables (temperatura 0,7 y top_p 0,9 en los ejemplos de la model card).
- Capacidades heredadas del modelo base Qwen2.5-3B-Instruct (razonamiento, código, matemáticas, tool calling) no están garantizadas tras el ajuste y no se documentan en la información disponible.
- Soporte multilingüe: no disponible; la model card declara únicamente inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Redacción de correos ejecutivos: dado un perfil de persona (por ejemplo, director de ingeniería) y una lista de puntos, el adaptador genera un correo con tono decisivo y conciso, evitando fórmulas vacías. Adecuado por su entrenamiento específico en perfiles de estilo laborales.
- Comunicación interna de equipos distribuidos: el modelo puede redactar actualizaciones de estado, solicitudes de aprobación o resúmenes de reuniones adoptando la voz de un mando intermedio o de un líder técnico, con la persona definida en el system prompt.
- Seguimiento comercial personalizado: con un perfil de estilo semi-formal y un conjunto de puntos clave (propuesta, ROI, plazo), el modelo genera correos de seguimiento adaptados al interlocutor, útil en equipos de ventas que necesitan volumen sin sonar automatizados.
- Respuestas a hilos de correo con contexto acotado: al tener una ventana de entrenamiento de 1024 tokens, encaja en respuestas breves y correos de extensión media, no en hilos largos.
- Generación de borradores para revisión humana: el adaptador produce un primer borrador en la voz del usuario que este revisa y edita, reduciendo el tiempo de redacción en tareas repetitivas de comunicación profesional.
- Prototipado de asistentes de escritura especializados: sirve como base para experimentar con adaptadores de estilo en pipelines de generación de texto, cargándolo con PEFT + Transformers o fusionándolo para Ollama.
- Ajuste de tono por audiencia: cambiando el perfil de estilo en el system prompt (formalidad, franqueza, saludo y despedida) se obtienen variantes del mismo contenido para distintas audiencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida media de entrenamiento (0,5564) y métricas de eficiencia del entrenamiento (2.025 pasos, 4,8 horas, pico de 7,2 GB de VRAM en una RTX 5060 Ti de 8 GB). No hay evaluaciones held-out, MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con el adaptador cargado sobre el modelo base en 4 bits NF4, el consumo es de aproximadamente 3-4 GB (el entrenamiento alcanzó un pico de 7,2 GB con gradientes y estados del optimizador); en bfloat16 completo, el modelo base de 3.000 millones requiere unos 6-7 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para la configuración 4-bit documentada; una RTX 5060 Ti de 8 GB fue suficiente para el entrenamiento. Para bfloat16 completo se recomienda 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en tarjetas de 8 GB o más con cuantización 4-bit; en 8 GB justos conviene usar cuantización y `device_map="auto"`.
- Opciones de despliegue: PEFT + Transformers (documentado en la model card), Ollama con el modelo fusionado (recomendado por el autor para inferencia), y presumiblemente llama.cpp o vLLM tras fusionar el adaptador, aunque no se documentan explícitamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-3b-personalized-email-lora | 3.000 M (base) + adaptador LoRA r=16 | 1024 tokens de entrenamiento | Adaptador PEFT sobre Qwen2.5-3B-Instruct | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-3B-Instruct (base) | 3.000 M | no disponible en la informacion proporcionada | Modelo completo | Apache 2.0 | Hugging Face |
| Adaptadores LoRA de generación de correo comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos directamente comparables en la información proporcionada; la comparación se limita al modelo base y a la categoría genérica de adaptadores LoRA de nicho.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador se entrena sobre personas sintéticas de FinePersonas y PersonaHub; puede reproducir sesgos de esos datasets y de los perfiles laborales representados.
- Riesgo de alucinación: como todo modelo generativo, puede inventar datos, cifras o compromisos en los correos; requiere revisión humana antes de enviar.
- Limitación de idioma: la model card declara únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Limitación de contexto: el entrenamiento usó `max_seq_length=1024`; los correos o hilos que excedan esa longitud pueden degradar la calidad.
- Licencia: Apache 2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen2.5-3B-Instruct.
- Caveat de producción: la pérdida reportada (0,5564) es de entrenamiento, no de validación; no hay evaluación held-out que garantice generalización.
- Madurez: modelo muy reciente, sin descargas ni likes, sin comunidad ni validación externa; no se recomienda para producción sin evaluación propia.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere cargar Qwen2.5-3B-Instruct y aplicar PEFT, o fusionar los pesos para Ollama.
- El filtrado anti-slop puede no eliminar todos los clichés en generaciones fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/Kami0867/qwen2.5-3b-personalized-email-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset FinePersonas-Synthetic-Email-Conversations: no disponible (no se proporciona URL)
- Dataset PersonaHub: no disponible (no se proporciona URL)
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
