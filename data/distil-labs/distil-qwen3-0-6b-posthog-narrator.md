# distil-labs/distil-qwen3-0.6b-posthog-narrator

## Resumen

distil-qwen3-0.6b-posthog-narrator es un modelo especialista de 0.6B parámetros desarrollado por Distil Labs, diseñado para convertir un stream de eventos de sesión de PostHog (análisis de producto) en una narración de tres frases en inglés que describe qué hizo el usuario. Se basa en Qwen3-0.6B (Apache 2.0) y se entrena mediante destilación desde un teacher GPT-OSS-120B, también Apache 2.0. El modelo forma parte de un harness de tres herramientas para análisis de tráfico de PostHog, junto con otros dos modelos especialistas.

El modelo resuelve un problema concreto: transformar datos de sesión crudos (timestamps, nombres de eventos, atributos) en un resumen legible y fiel, sin inventar eventos ni detalles. Su relevancia radica en que ofrece una capacidad de análisis de producto a nivel de lenguaje natural con un coste computacional mínimo, ejecutable en hardware local o en endpoints de baja latencia. La arquitectura es un transformer causal estándar de 0.6B, con una ventana de contexto no especificada en la información disponible, y se distribuye tanto en safetensors como en GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican variantes), safetensors (FP16/BF16 presumiblemente) |
| Idiomas soportados | no disponible (el prompt y la salida están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer causal denso de 0.6B parámetros. No se han publicado detalles sobre la arquitectura interna de Qwen3-0.6B en la información disponible, pero se trata de un modelo de lenguaje estándar con atención completa, sin mecanismos MoE ni SSM. El fine-tune se realizó con un método de destilación supervisada: un teacher GPT-OSS-120B generó narraciones de sesiones a partir de 25 pares semilla escritos a mano y validados por esquema, que luego se expandieron sintéticamente hasta 10.033 ejemplos mediante la plataforma de Distil Labs. El método de entrenamiento se describe como "platform-managed fine-tune" con tipo de tarea question-answering, sin detalles adicionales sobre hiperparámetros, número de épocas o técnica de regularización.

No hay información sobre el número total de tokens de entrenamiento, la composición del dataset más allá de los ejemplos semilla y su expansión, ni sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tune. La evaluación incluye un LLM-as-a-Judge y métricas ROUGE sobre un conjunto de test retenido.

## Capacidades

- Generación de narraciones de sesión: convierte un stream de eventos con timestamps, nombres de evento y atributos clave-valor en un texto de exactamente tres frases en pasado, sin preámbulos ni listas.
- Fidelidad a los datos: el modelo está entrenado para no inventar eventos, nombres de páginas, botones o mensajes de error; solo reporta lo que aparece en el prompt.
- Detección de señales de fricción: identifica rage clicks, fallos repetidos y abandono, y los menciona explícitamente en la narración.
- Cumplimiento estricto del formato de salida: el contrato de salida exige tres frases exactas, con límites de longitud; la evaluación reporta 10/10 en cumplimiento en sesiones de prueba.
- No soporta tool calling, ni razonamiento multi-paso, ni visión, ni audio. Es un modelo de texto puro, especializado en una tarea única.

## Casos de uso

- Analisis de sesiones de producto en PostHog: el harness principal lo usa para generar resúmenes legibles de cada sesión de usuario, permitiendo a equipos de producto revisar rápidamente qué ocurrió sin leer logs crudos.
- Alertas de fricción en embudos de conversión: al detectar rage clicks y abandonos, el modelo puede alimentar sistemas de alerta que avisen cuando un usuario sufre una experiencia fallida.
- Generación de informes de soporte: en un flujo de atención al cliente, el modelo puede resumir la sesión de un usuario antes de que un agente humano intervenga, reduciendo el tiempo de diagnóstico.
- QA automatizado de flujos de onboarding: al narrar sesiones de prueba de nuevas funcionalidades, el modelo permite verificar si los usuarios siguen los pasos esperados o se desvían.
- Entrenamiento de modelos de análisis conversacional: las narraciones generadas pueden servir como datos de entrenamiento para modelos más grandes o para sistemas de búsqueda semántica sobre sesiones.
- Documentación de sesiones para cumplimiento: en entornos regulados, el modelo puede producir resúmenes auditables de actividad de usuario, siempre que se verifique la fidelidad de la salida.

## Benchmarks y rendimiento

Los datos de evaluación provienen de la model card, sobre un conjunto de test retenido de 5 sesiones semilla. La métrica LLM-as-a-Judge fue calculada por la plataforma de Distil Labs.

| Metrica | Qwen3-0.6B sin entrenar | distil-qwen3-0.6b-posthog-narrator |
|---|---|---|
| LLM-as-a-Judge | 0,00 % | 100,00 % |
| ROUGE | 39,20 % | 63,98 % |

Además, en una comprobación en vivo sobre 10 sesiones (5 semilla retenidas y 5 demo), el modelo cumplió el formato de tres frases en 10/10 casos, tanto en un endpoint vLLM alojado como en GGUF local vía Ollama. El modelo base sin entrenar violó el formato en 3-4 de cada 10 sesiones y fabricó eventos (por ejemplo, reportó un login exitoso en una sesión de reset de contraseña fallido).

No hay datos comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 596M parámetros, en FP16 ocupa aproximadamente 1,2 GB; en cuantización GGUF de 4 bits, unos 0,4 GB. Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU con suficiente RAM.
- GPU recomendadas: no se requiere GPU de datacenter; cualquier GPU con al menos 2 GB de VRAM es suficiente para FP16, y menos para GGUF.
- Opciones de despliegue: la model card documenta el uso con Ollama (creando un Modelfile desde el GGUF) y con vLLM en un endpoint alojado. También es compatible con llama.cpp y TGI.
- Latencia y throughput: no se publican cifras específicas para este modelo, pero por su tamaño se espera una latencia de decenas de milisegundos por generación en GPU consumer, y unos pocos cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distil-qwen3-0.6b-posthog-narrator | 0,6B | no disponible | Narración de sesiones PostHog | Apache 2.0 | safetensors, GGUF |
| Qwen3-0.6B (base) | 0,6B | no disponible | Generación de texto general | Apache 2.0 | safetensors, GGUF |
| distil-qwen3-0.6b-SHELLper | 0,6B | no disponible | Tool calling multi-turn bash | Apache 2.0 | safetensors, GGUF |

El modelo comparte base y tamaño con los otros dos, pero está especializado en una tarea de dominio muy concreta. No se dispone de comparaciones directas de rendimiento entre ellos.

## Limitaciones y advertencias

- Dominio muy restringido: solo funciona bien con el formato de prompt de sesión PostHog descrito; usarlo fuera de ese contexto degradará la calidad y puede producir salidas incoherentes.
- Riesgo de alucinación residual: aunque la evaluación muestra fidelidad en el test, el modelo puede inventar detalles si el prompt contiene eventos ambiguos o mal formateados. Se recomienda validar la salida en producción.
- Idioma: la información disponible no especifica idiomas soportados, pero el prompt y las narraciones están en inglés; no se garantiza comportamiento en otros idiomas.
- Sin capacidades de tool calling ni agentes: no es un modelo generalista; no puede ejecutar funciones ni razonar más allá de la tarea de narración.
- Dependencia del harness: para uso práctico se requiere el pipeline completo de tres herramientas de Distil Labs, lo que añade complejidad de integración.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo es un fine-tune de Qwen3-0.6B, que también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Fecha de creación futura: el modelo está fechado en agosto de 2026, lo que puede indicar un artefacto de prueba o una fecha incorrecta en el registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/distil-labs/distil-qwen3-0.6b-posthog-narrator
- Repositorio del harness: https://github.com/distil-labs/distil-posthog-traffic-analyser
- Blog de Distil Labs (SHELLper, modelo hermano): https://www.distillabs.ai/blog/distil-shellper/
- Plataforma Distil Labs: https://www.distillabs.ai/
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
