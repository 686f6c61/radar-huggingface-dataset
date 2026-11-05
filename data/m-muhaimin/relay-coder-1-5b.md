# m-Muhaimin/Relay-Coder-1.5B

## Resumen

Relay-Coder-1.5B es un ajuste fino (fine-tune) orientado a agentes del modelo Qwen2.5-Coder-1.5B-Instruct, publicado por el usuario m-Muhaimin en HuggingFace. El modelo parte de la versión Instruct de Unsloth del conocido Qwen2.5-Coder y se ha especializado en la emisión de llamadas a herramientas nativas mediante el token `<tool_call>`, en el seguimiento de conversaciones multiturno con herramientas y políticas, en la solicitud explícita de argumentos faltantes en lugar de inventarlos y en la conducción de terminales (terminal driving).

Con solo 1.500 millones de parámetros, el modelo se posiciona en la categoría de modelos pequeños para agentes y function calling, un nicho donde la eficiencia en memoria y la latencia baja son críticas para despliegues en producción. Su licencia Apache 2.0 y su compatibilidad con GGUF y llama.cpp lo hacen desplegable en hardware de consumo.

La relevancia actual del modelo radica en la creciente demanda de agentes ligeros que puedan ejecutarse localmente o en entornos con recursos limitados, manteniendo un formato de tool calling estructurado y fiable. No se han publicado resultados de benchmarks ni información detallada sobre el proceso de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (mencionado en la model card); cuantizaciones concretas no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3.2 GB) y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Qwen2.5-Coder-1.5B-Instruct`, que a su vez deriva de la familia Qwen2.5-Coder de Alibaba. La arquitectura subyacente es un transformer decoder-only de 1.5B parámetros, aunque la model card no detalla la configuración exacta de capas, cabezas de atención ni dimensión oculta. El ajuste fino se realizó presumiblemente con la librería Unsloth, según indican los tags y el nombre del modelo base.

El entrenamiento se orientó específicamente a comportamientos agénticos: emisión de llamadas a herramientas nativas con el token `<tool_call>`, seguimiento de conversaciones multiturno con herramientas y políticas, solicitud de argumentos faltantes en lugar de adivinar, y conducción de terminal. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del formato de tool calling nativo.

## Capacidades

- Generación de llamadas a herramientas nativas mediante el token `<tool_call>`, con formato estructurado para function calling.
- Seguimiento de conversaciones multiturno que involucran herramientas y políticas, manteniendo el contexto de interacciones previas.
- Solicitud explícita de argumentos faltantes en lugar de inventar valores, comportamiento entrenado para reducir errores en la ejecución de herramientas.
- Conducción de terminal (terminal driving), lo que sugiere capacidad para generar comandos de shell en flujos agénticos.
- Generación de código, heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Soporte de agentes y razonamiento multi-paso en el contexto de uso de herramientas.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Agentes de automatización de terminal: el modelo puede generar comandos de shell y encadenar pasos para tareas de administración de sistemas, aprovechando su entrenamiento específico en terminal driving.
- Asistentes de código con function calling: integrado en un IDE o pipeline, el modelo puede invocar herramientas de análisis estático, ejecutar tests o consultar documentación mediante llamadas estructuradas.
- Automatización de flujos de trabajo con APIs: al emitir `<tool_call>` de forma nativa, puede orquestar llamadas a servicios REST en pipelines de CI/CD o tareas de integración.
- Chatbots de soporte técnico con acceso a herramientas: su capacidad de pedir argumentos faltantes en lugar de adivinar reduce errores en la recogida de datos del usuario antes de ejecutar acciones.
- Despliegue local en entornos con recursos limitados: con 1.5B parámetros y formato GGUF, puede ejecutarse en portátiles o estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama.
- Prototipado rápido de agentes: su licencia Apache 2.0 y su tamaño permiten iterar en investigación sobre agentes sin costes de infraestructura elevados.
- Enrutamiento de herramientas en sistemas multi-agente: puede actuar como planificador ligero que decide qué herramienta invocar en cada paso de una tarea mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3 GB solo para pesos, más overhead de contexto y activaciones (estimación típica para 1.5B parámetros).
- VRAM estimada en cuantización de 4 bits (GGUF Q4): aproximadamente 1 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM en cuantizaciones bajas; en FP16 requiere al menos 6 GB para contexto moderado.
- Opciones de despliegue: llama.cpp y Ollama mediante los archivos GGUF proporcionados; transformers para cargar el modelo FP16 fusionado (merged).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Relay-Coder-1.5B | 1.5B | no disponible | Apache 2.0 | HuggingFace (GGUF y safetensors) | Fine-tune agéntico con tool calling nativo |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | no disponible en la informacion | Apache 2.0 | HuggingFace | Modelo base; sin especialización agéntica documentada |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible en la informacion | Apache 2.0 | HuggingFace | Mayor capacidad pero requiere más VRAM |
| Modelos de function calling pequeños (p. ej. Hermes-2-Pro) | variable | no disponible | variable | HuggingFace | Alternativas orientadas a tool calling, sin datos comparativos disponibles |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen2.5-Coder, puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; el entrenamiento para pedir argumentos faltantes mitiga parcialmente este riesgo en contextos de tool calling, pero no lo elimina.
- Limitaciones de idioma: el modelo está etiquetado únicamente para inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las obligaciones de atribución y las condiciones del modelo base.
- Caveat crítico para producción: la penalización de repetición debe ser exactamente 1.0; valores superiores pueden suprimir el token `<tool_call>` y romper el formato de llamadas a herramientas.
- Las herramientas deben enviarse siempre a través de la plantilla de chat (parámetro `tools=`), nunca pegadas manualmente en el prompt, para mantener la coincidencia entre entrenamiento e inferencia.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar despliegues con conversaciones largas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- [HuggingFace: m-Muhaimin/Relay-Coder-1.5B](https://huggingface.co/m-Muhaimin/Relay-Coder-1.5B)
- [Modelo base: unsloth/Qwen2.5-Coder-1.5B-Instruct](https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
