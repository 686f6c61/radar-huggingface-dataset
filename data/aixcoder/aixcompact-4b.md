# aiXcoder/aiXcompact-4B

## Resumen

aiXcompact-4B es un modelo de compresión de contexto desarrollado por aiXcoder, diseñado específicamente para agentes de programación (coding agents) que trabajan sobre sesiones largas. Su función no es generar código ni conversar con el usuario final, sino transformar el historial acumulado de una sesión de agente —contenidos de ficheros, resultados de herramientas y discusión intermedia— en un plan de compresión estructurado: decide qué elementos conservar, condensa resultados de herramientas y redacta un resumen de entrega (handoff) con la tarea, el progreso, las restricciones y el trabajo pendiente.

Técnicamente es un ajuste fino (fine-tuning) con LoRA fusionado sobre Qwen3.5-4B, con arquitectura `Qwen3_5ForCausalLM` y formato de pesos BF16 en safetensors. Configura una longitud de contexto de 262.144 tokens, lo que le permite procesar trayectorias de agente muy extensas de una sola vez.

Su relevancia actual radica en el crecimiento de los agentes de código de larga duración: cuando la ventana de contexto se agota, una compresión de calidad determina si el agente sucesor puede continuar la tarea sin perder información crítica. Al ser un modelo pequeño (4B) con licencia Apache-2.0, es viable ejecutarlo como componente auxiliar dedicado junto al agente principal, incluso en hardware moderado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (transformer causal, tipo `qwen3_5_text`) |
| Parámetros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no se documenta arquitectura MoE) |
| Longitud de contexto | 262.144 tokens (entrada + salida configuradas) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | inglés y chino (en, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16, dos shards), compatible con Transformers 5.6.2 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer causal de la familia Qwen, y se adapta mediante fine-tuning con LoRA que posteriormente se fusiona en el modelo base de texto. El checkpoint publicado es text-only: aunque el tokenizador heredado incluye tokens especiales multimodales, el modelo no incorpora codificador de visión. La versión de Transformers registrada en el checkpoint es la 5.6.2.

El entrenamiento se orienta a una tarea muy concreta: dado un XML con la trayectoria de un agente de código (system prompt, definiciones de herramientas y mensajes etiquetados con identificadores y conteos de tokens), producir decisiones estructuradas por elemento y un resumen de entrega. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de planes de compresión de contexto: para cada elemento de la trayectoria emite una de tres acciones: `keep` (conservar íntegro), `remove` (eliminar y trasladar lo esencial al resumen) o `keep_with_replaced_tool_result` (conservar el texto del asistente y la llamada a herramienta, sustituyendo solo el resultado por una versión más corta).
- Redacción de resúmenes de handoff estructurados que cubren la intención del usuario, conceptos técnicos, errores y correcciones, tareas pendientes y trabajo en curso.
- Procesamiento de contextos muy largos: hasta 262.144 tokens configurados, adecuado para trayectorias completas de agentes.
- Salida estructurada pensada para consumo por un programa aguas abajo que valida y aplica las decisiones sobre el historial original.
- Soporte de inglés y chino en su comprensión de trayectorias.
- No es un modelo conversacional general ni un generador de código: su salida es un plan de compresión, no mensajes para el usuario final.
- No dispone de codificador de visión ni de capacidades de audio, pese a que el tokenizador hereda tokens multimodales.

## Casos de uso

- Compacción automática de contexto en agentes de código: cuando un agente (por ejemplo, uno basado en Claude Code, SWE-agent o frameworks propios) agota su ventana, aiXcompact-4B genera el plan de compresión y el resumen para que un agente sucesor continúe en un contexto fresco sin reiniciar la tarea.
- Reducción de costes de inferencia en sesiones largas: con objetivos de retención del 10–50 %, se puede reducir drásticamente el número de tokens enviados al modelo principal en cada turno, abaratando sesiones de muchas horas.
- Handoff entre modelos o entre sesiones: el resumen de entrega permite pasar una tarea de un agente a otro (incluso de un proveedor a otro) conservando intención, restricciones y estado.
- Sistemas multiagente con memoria compartida: puede servir como componente de "memoria compactada" que condensa el historial antes de pasárselo a un agente especializado.
- Depuración y auditoría de sesiones: las decisiones por elemento (`keep`/`remove`/reemplazo) son interpretables, lo que permite revisar qué información se descarta antes de aplicarla.
- Integración en pipelines de agentes con control fino: al ser el modelo quien propone y un programa quien aplica, se pueden añadir reglas de validación propias (por ejemplo, impedir eliminar el mensaje inicial del usuario) sin reentrenar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 (~8,4 GB de repo), se recomienda una GPU con al menos 12–16 GB de VRAM para el modelo más KV cache; con 262k tokens de contexto la caché KV puede ser considerable, por lo que sesiones muy largas se benefician de más memoria o de cuantización (no publicada oficialmente).
- GPU recomendadas: RTX 4090 o RTX 5090 para uso local; A100 o H100 en despliegue de servidor con contextos largos y concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más (RTX 4080/4090/5080/5090); en tarjetas de 8–12 GB sería necesario cuantizar, y no hay pesos cuantizados publicados.
- Despliegue: Transformers 5.6.2 con la clase `Qwen3_5ForCausalLM` (documentado en la model card con ejemplo completo); por ser un checkpoint estándar de Qwen3.5 fusionado, debería ser compatible con vLLM, llama.cpp (previa conversión a GGUF) y Ollama, aunque el proyecto no documenta explícitamente estos entornos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existen muchos modelos públicos dedicados específicamente a la compacción de contexto para agentes; la alternativa habitual es usar el propio LLM del agente para resumir. Comparación orientativa:

| Modelo | Parámetros | Tarea | Contexto | Licencia |
|---|---|---|---|---|
| aiXcompact-4B | 4,2B | Compresión estructurada de contexto para coding agents | 262.144 | Apache-2.0 |
| Qwen3.5-4B (base) | ~4B | Modelo general de texto/chat | no disponible en la información proporcionada | no disponible |
| Uso del LLM principal para resumir (p. ej. un modelo grande propietario) | variable | Resumen conversacional genérico | variable | propietaria habitualmente |

La ventaja diferencial de aiXcompact-4B frente a usar un LLM general para resumir es que produce decisiones estructuradas por elemento y un formato pensado para aplicación programática, en lugar de un resumen en prosa libre, y puede ejecutarse en hardware modesto en paralelo al agente principal.

## Limitaciones y advertencias

- El modelo no aplica la compresión por sí mismo: su salida contiene decisiones y un resumen que una aplicación debe validar y aplicar sobre el historial original. La longitud de la respuesta cruda del modelo no equivale a la longitud del contexto retenido; hay que medir la retención real tras ensamblar los mensajes de continuación.
- Los objetivos de retención recomendados (10–50 %, en incrementos de cinco) son aproximados; la retención efectiva puede desviarse del objetivo.
- No hay codificador de visión: aunque el tokenizador incluye tokens multimodales heredados, solo procesa texto.
- Sesgos y riesgo de alucinación: no se publican evaluaciones específicas; como todo LLM, puede omitir información crítica al condensar o inventar detalles en el resumen, lo que en agentes de código puede provocar que el agente sucesor pierda restricciones importantes. Se recomienda validación programática de las decisiones.
- Idiomas: soporte documentado solo para inglés y chino; trayectorias en otros idiomas no están cubiertas explícitamente.
- La longitud de contexto de 262.144 tokens es una configuración del modelo; la longitud utilizable real depende de la memoria disponible y de la configuración de serving.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, pero conviene revisar las licencias del modelo base Qwen3.5 en el caso de redistribución.
- Proyecto de nicho con pocas descargas (518 en el momento de la ficha) y sin benchmarks publicados: conviene probarlo en el propio entorno antes de confiar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aiXcoder/aiXcompact-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentación de Qwen3.5 en Transformers 5.6.2: https://huggingface.co/docs/transformers/v5.6.2/model_doc/qwen3_5
