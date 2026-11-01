# PresenceAI/Polyhymnia-32B-SFT-LoRA-v1.0

## Resumen

Polyhymnia-32B-SFT-LoRA-v1.0 es un adaptador LoRA (PEFT) desarrollado por PresenceAI sobre el modelo base Qwen/Qwen3-32B, publicado como parte de la serie «Presence Muses». No se trata de un modelo completo, sino de un ajuste fino supervisado (SFT) que se carga encima de los pesos de Qwen3-32B y que está especializado en conversación multi-turno de rol y acompañamiento («companion chat»), con soporte para invocaciones de herramienta mediante una llamada `send_message`.

El adaptador emplea rango r=32 con alpha=32 y dropout 0.0, aplicado sobre los módulos de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de la MLP (`gate_proj`, `up_proj`, `down_proj`). Se entrenó durante una época sobre 129.482 conversaciones multi-turno internas con anotaciones de tool-call, con una longitud máxima de secuencia de 22.528 tokens, un batch efectivo de 16 y una tasa de aprendizaje de 1e-4.

Su relevancia es acotada pero concreta: ofrece un punto de partida reproducible y con licencia Apache-2.0 para construir asistentes conversacionales con personalidad y capacidad de emitir llamadas a herramientas, sin necesidad de reentrenar el modelo base de 32.000 millones de parámetros. La contrapartida es que no se han publicado benchmarks de tarea, estudios de preferencia humana ni evaluaciones de seguridad, y el conjunto de datos de entrenamiento no se distribuye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-32B |
| Parametros totales | No disponible para el adaptador (repo de 1,1 GB); el modelo base Qwen3-32B tiene 32.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 22.528 tokens (longitud máxima de secuencia usada en entrenamiento); el contexto nativo del base no se detalla |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del base) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); incluye `chat_template.jinja` |

| Parametro adicional | Valor |
|---|---|
| Rango LoRA (r) | 32 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0.0 |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Etapa de entrenamiento | SFT (supervised fine-tuning) |
| Épocas | 1 |
| Batch efectivo | 16 (batch por dispositivo 1 × acumulación de gradiente 16) |
| Learning rate | 1e-4 |
| Librería | peft |
| Modelo base | Qwen/Qwen3-32B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-32B, un transformer decoder-only de 32.000 millones de parámetros. La intervención consiste en un LoRA de rango 32 y alpha 32 con dropout 0,0 sobre las proyecciones de atención y de la MLP, lo que permite ajustar el comportamiento conversacional sin modificar los pesos originales. El repositorio no incluye los pesos del modelo base: es necesario cargar `Qwen/Qwen3-32B` y superponer el adaptador mediante `PeftModel`.

El entrenamiento fue un SFT de una sola época sobre 129.482 conversaciones multi-turno internas con anotaciones de tool-call, con secuencias de hasta 22.528 tokens, batch efectivo de 16 y learning rate de 1e-4. No se documenta el uso de RLHF, DPO ni ninguna otra etapa de alineamiento posterior, ni se detalla la composición del dataset más allá de su carácter conversacional y su orientación a rol/acompañamiento. Tampoco se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el interés técnico reside en el formato de tool-call enseñado (`send_message` dentro de etiquetas `<tool_call>`) y en la plantilla de chat incluida en el repositorio.

## Capacidades

- Generación de texto conversacional multi-turno orientada a rol y acompañamiento, con énfasis en consistencia de persona y estilo.
- Emisión de llamadas a herramienta en formato estructurado: `<tool_call>{"name": "send_message", "arguments": {"text": "..."}}</tool_call>`.
- Soporte de tool calling en despliegue con vLLM mediante `--enable-auto-tool-choice` y parser `hermes`.
- Conversación multi-turno con contexto de hasta 22.528 tokens, adecuado para hilos largos de chat.
- Capacidad multilingüe limitada a inglés y chino.
- Adaptación de estilo y persona conversacional gracias al ajuste SFT sobre el base.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo «thinking» específicas del adaptador; las que herede dependerán del modelo base Qwen3-32B.

## Casos de uso

- Asistentes de acompañamiento conversacional: el adaptador está entrenado específicamente para diálogo multi-turno con persona consistente, por lo que encaja en productos de chat con memoria de conversación y estilo definido.
- Chatbots de rol en aplicaciones de entretenimiento: permite desplegar personajes con voz propia sobre Qwen3-32B sin reentrenar el modelo completo, cargando el LoRA con `PeftModel` o con vLLM.
- Integración de envío de mensajes en pipelines de agentes: la llamada `send_message` permite que el modelo delegue la entrega de texto a un componente externo, útil en arquitecturas donde el transporte está separado de la generación.
- Prototipado rápido de asistentes con herramientas: al ser un adaptador de 1,1 GB sobre un base Apache-2.0, se puede iterar en el comportamiento conversacional sin tocar los pesos grandes.
- Investigación sobre consistencia de persona y adaptación de estilo: el adaptador sirve como punto de comparación frente al base sin ajustar en estudios de estilo conversacional.
- Despliegue en entornos con restricciones de licencia: tanto adaptador como base son Apache-2.0, lo que facilita su uso comercial con las obligaciones de atribución correspondientes.
- Asistentes en inglés y chino: adecuado para productos bilingües limitados a esos dos idiomas, con conversación multi-turno y contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea en la informacion disponible. La única métrica reportada es la pérdida de evaluación a nivel de token sobre un split interno reservado:

| Step | Eval loss | Nota |
|---:|---:|---|
| 4.200 | 0,6023 | Mejor valor registrado en el log de entrenamiento |
| 4.300 | 0,6029 | |
| 4.500 | 0,6058 | |

El autor advierte que el entrenamiento continuó más allá del historial de evaluación registrado y que el valor indicado es el mejor durante el entrenamiento, no remedido sobre el checkpoint exacto publicado. No hay benchmarks de tarea, estudios de preferencia humana ni evaluaciones de seguridad.

## Requisitos de hardware

- El adaptador en sí ocupa 1,1 GB, pero la inferencia requiere cargar el modelo base Qwen3-32B completo; la VRAM vendrá determinada por el base y su cuantización.
- En bfloat16, un modelo de 32.000 millones de parámetros requiere del orden de 64 GB solo para pesos, más memoria para KV cache y activaciones; no cabe en GPU de consumo de 24 GB sin cuantización.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`.
- En GPU de consumo (RTX 4090 de 24 GB) solo es viable con cuantización agresiva del base (por ejemplo, 4 bits), con la consiguiente pérdida de calidad y la necesidad de verificar compatibilidad del adaptador.
- Despliegue soportado documentado: Transformers + PEFT (`PeftModel.from_pretrained`) y vLLM con `--enable-lora --max-lora-rank 32` y `--lora-modules`.
- No se documentan latencias ni throughput medidos para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Polyhymnia-32B-SFT-LoRA-v1.0 | LoRA sobre Qwen3-32B | 32.000 M (base) | 22.528 tokens (entrenamiento) | Apache-2.0 | Especializado en rol/companion y tool-call `send_message`; sin benchmarks de tarea |
| Qwen/Qwen3-32B (base) | Modelo completo | 32.000 M | No disponible en la información | Apache-2.0 | Modelo generalista sin el ajuste conversacional de Polyhymnia |
| Alternativas de rol/companion de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Entrenado para rol y conversación de acompañamiento; su uso fuera de ese dominio puede producir respuestas inadecuadas.
- Puede reproducir patrones o contenido de sus datos de entrenamiento; el dataset no se distribuye, por lo que se recomienda desplegar con filtros de privacidad y seguridad.
- Solo se reporta pérdida de evaluación automática; no hay afirmación alguna sobre precisión factual, seguridad o calidad humana.
- Riesgo de alucinación inherente al modelo base y no mitigado de forma documentada en el adaptador.
- Idiomas limitados a inglés y chino; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- El contexto de 22.528 tokens corresponde a la longitud máxima de entrenamiento, no necesariamente al contexto nativo del base.
- Uso comercial permitido por Apache-2.0, con obligación de conservar avisos de licencia y atribución; siguen aplicando las limitaciones y términos del modelo base.
- El adaptador no incluye los pesos del base: es imprescindible cargar `Qwen/Qwen3-32B` y usar el tokenizador y `chat_template.jinja` del repositorio para reproducir el formato de entrenamiento.
- El checkpoint publicado no fue reevaluado con la métrica de pérdida reportada, según indica el propio autor.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/PresenceAI/Polyhymnia-32B-SFT-LoRA-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
