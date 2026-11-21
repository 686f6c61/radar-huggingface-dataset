# Denisijcu/vertex-voice-agenda-4b-gguf

## Resumen

Vertex Voice Agenda Agent 4B es un ajuste fino de Qwen3-4B-Instruct-2507 orientado a la orquestación de llamadas telefónicas y gestión de agenda. Lo desarrolla Vertex Coders (dirigido por Denis Sanchez Leyva) y se distribuye en formato GGUF con cuantización Q4_K_M para inferencia local en llama.cpp o LM Studio. El modelo resuelve un problema muy concreto: convertir el estado de una conversación de voz multiturno en respuestas breves locutables y en llamadas a herramientas estructuradas (consulta de calendario, reserva de cita, registro del resultado y cierre de llamada).

El ajuste se realizó con QLoRA sobre la variante ya cuantizada en 4 bits de Qwen3-4B-Instruct-2507 publicada por Unsloth, con un LoRA de rango 16 aplicado a los módulos de atención y MLP. La salida está restringida a un objeto JSON con dos claves (`assistant_reply` y `tool_calls`), lo que facilita su integración en un orquestador que valide esquemas antes de ejecutar acciones. El contexto de entrenamiento se fijó en 2048 tokens.

Su relevancia es acotada pero clara: demuestra un patrón de especialización de un modelo pequeño (4B) para agentes de voz con tool calling determinista, ejecutable en hardware de consumo y con licencia Apache 2.0. No es un modelo de propósito general, sino un componente de un pipeline de automatización telefónica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó `max_seq_length=2048` |
| Tipos de cuantizacion | Q4_K_M (GGUF); el base model de partida estaba en bnb-4bit |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`Qwen3-4B-Instruct-2507.Q4_K_M.gguf`); repo de 2,5 GB |
| Metodo de ajuste | QLoRA (r=16, lora_alpha=16, dropout=0.0, bias=none) |
| Modulos LoRA | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Entrenador | SFTTrainer (trl), adamw_torch_fused, gradient checkpointing Unsloth |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B-Instruct-2507. Sobre esa base se aplicó un ajuste supervisado con QLoRA usando Unsloth, con rango 16 y alpha 16 sobre los siete módulos lineales habituales (atención y MLP). El entrenamiento se ejecutó con `SFTTrainer` de la librería `trl`, optimizador `adamw_torch_fused` y una longitud máxima de secuencia de 2048 tokens. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; la model card solo indica el método y los hiperparámetros del LoRA.

La innovación técnica no está en la arquitectura, sino en el formato de salida: el modelo se entrena para emitir siempre un JSON con `assistant_reply` (texto breve y cortés apto para síntesis de voz) y `tool_calls` (lista de invocaciones a cuatro herramientas con esquema fijo: `check_calendar`, `book_appointment`, `log_call_outcome` y `hangup_call`). El ciclo multiturno esperado es consulta de disponibilidad, confirmación o registro de resultado, y cierre con `hangup_call` incluyendo `send_sip_bye`. No se mencionan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional breve en español, pensado para locución por voz.
- Tool calling estructurado con cuatro herramientas y argumentos tipados (fechas ISO 8601, etiquetas de calendario, motivos de cierre).
- Salida JSON consistente con dos claves (`assistant_reply`, `tool_calls`), validable por esquema.
- Gestión de flujos multiturno de llamadas: consulta inicial, negociación de disponibilidad, confirmación, registro de resultado y cierre.
- Manejo de escenarios de fallo conversacional: buzón de voz, falta de disponibilidad, despedida.
- Soporte de casos de uso de agenda concretos: citas médicas y dentales, contacto con empleadores, seguimiento y campañas.
- Capacidad multilingüe limitada al español según la model card; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio nativo, matemáticas avanzadas ni razonamiento extendido (thinking mode).

## Casos de uso

- Automatización de citas dentales y médicas: el modelo consulta disponibilidad con `check_calendar` sobre una franja ISO y, si hay hueco, emite `book_appointment` con título, asistentes y propósito; encaja porque el esquema de herramientas cubre exactamente ese flujo.
- Campañas de contacto con empleadores: partiendo de un objetivo y notas del contacto, el agente negocia una franja y registra el resultado con `log_call_outcome` (`outcome`, `summary`, `next_action`) para seguimiento posterior.
- Seguimiento post-llamada: cuando la contraparte no confirma, el modelo emite `log_call_outcome` y `hangup_call` con `send_sip_bye: true`, dejando traza estructurada para el CRM.
- Gestión de buzón de voz: el modelo puede detectar el escenario y cerrar la llamada con motivo explícito, evitando interacciones improductivas.
- Integración en orquestadores de telefonía (SIP): al devolver JSON con llamadas a herramientas y cierre SIP, se conecta directamente con un motor que ejecute las acciones tras validar el esquema.
- Pruebas en modo dry-run: el orquestador puede validar respuestas y esquemas sin ejecutar reservas reales, lo que permite evaluar el modelo antes de producción.
- Despliegue local en hardware modesto: al ser un GGUF Q4_K_M de 2,5 GB, cabe en estaciones de trabajo sin GPU dedicada de gama alta para pruebas y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, el archivo pesa aproximadamente 2,5 GB; se necesita margen adicional para el contexto KV. Con 2048 tokens de contexto, un presupuesto de 4-6 GB de VRAM o RAM es razonable, aunque no se publican cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU consumer con 6-8 GB o más debería poder ejecutarlo en Q4_K_M.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores; también en CPU vía llama.cpp.
- Opciones de despliegue: llama.cpp y LM Studio (mencionados en la model card); vLLM, TGI y Ollama no se citan explícitamente, aunque el formato GGUF es compatible con Ollama y llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Vertex Voice Agenda Agent 4B | 4B | 2048 en entrenamiento (no confirmado en inferencia) | GGUF Q4_K_M | Apache 2.0 | Agente de voz y agenda con tool calling en español |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | safetensors, GGUF, bnb-4bit | Apache 2.0 | Instrucción general multilingüe |
| Alternativas de 3-4B para tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros modelos de la misma categoría en la información proporcionada. La comparación con el modelo base es estructural: este ajuste restringe el comportamiento a un dominio y formato de salida concretos, a costa de generalidad.

## Limitaciones y advertencias

- Modelo de dominio muy específico: fuera del flujo de llamadas y agenda, su comportamiento no está validado.
- Idioma limitado al español según la model card; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación en fechas, nombres y disponibilidad: el orquestador debe validar siempre contra el calendario real antes de confirmar reservas.
- La model card advierte explícitamente de que no debe usarse para ejecutar comandos del sistema ni confirmar reservas sin validar disponibilidad y permisos del usuario.
- Requiere validación estricta de esquemas JSON, limpieza de etiquetas de razonamiento o markdown y modo dry-run en pruebas.
- No se documentan sesgos conocidos, número de tokens de entrenamiento ni composición del dataset, lo que dificulta evaluar su robustez.
- Sin métricas publicadas de latencia, throughput ni precisión en tool calling; la evaluación previa a producción es responsabilidad del integrador.
- Licencia Apache 2.0 permite uso comercial, pero el cumplimiento de la licencia del modelo base (Qwen3-4B-Instruct-2507) debe verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/Denisijcu/vertex-voice-agenda-4b-gguf
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
