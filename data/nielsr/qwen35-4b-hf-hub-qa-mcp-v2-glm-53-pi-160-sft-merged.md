# nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-sft-merged

## Resumen

Este repositorio contiene un modelo resultante de fusionar (merge) un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B. El adaptador original, nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-lora, se ha integrado directamente en los pesos del modelo base, dando como resultado un checkpoint completo de aproximadamente 4.539 millones de parametros (4,54 mil millones) que se puede cargar directamente con transformers sin necesidad de aplicar PEFT en tiempo de inferencia.

El modelo surge de un proceso de destilacion orientado a agentes ("agent-distill") sobre la tarea `hf-hub-qa-mcp`, con la version `pi@1.6.0`. El sufijo del nombre sugiere un entrenamiento de tipo SFT (supervised fine-tuning) sobre conversaciones de pregunta-respuesta relacionadas con el Hub de Hugging Face y con el protocolo MCP (Model Context Protocol), orientado a que el modelo actue como agente capaz de consultar herramientas.

Por su tamano (4B) y su pipeline declarado (`text-generation`), se posiciona como un modelo ligero y desplegable en hardware de consumo, pensado para tareas de QA agente con tool calling. La informacion publica disponible es escasa: no hay model card detallada, ni datos de benchmarks, ni licencia explicita, ni lista de idiomas, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia Qwen3.5; tipo `qwen3_5`), multimodal image-text-to-text segun tags |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 9,1 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, de la familia Qwen3.5. Los tags del repositorio incluyen `qwen3_5` e `image-text-to-text`, lo que indica que la arquitectura base es un transformer con capacidad multimodal de entrada (imagen y texto), aunque el pipeline declarado para este checkpoint concreto es `text-generation`. No se dispone de detalles sobre numero de capas, dimensiones ocultas, mecanismos de atencion ni contexto maximo.

El entrenamiento consistio en un proceso de destilacion para agentes ("agent-distill") sobre la tarea `hf-hub-qa-mcp`, con la configuracion `pi@1.6.0`, seguido de un SFT. El adaptador LoRA resultante (`qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-lora`) se fusiono posteriormente con el modelo base para producir este checkpoint "merged". No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas adicionales como RLHF o DPO. Tampoco se documentan innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Entrada multimodal image-text-to-text, heredada del modelo base Qwen3.5-4B segun los tags.
- Orientacion a agentes: el nombre y el proceso de entrenamiento indican QA sobre el Hub de Hugging Face y uso del protocolo MCP (Model Context Protocol).
- Tool calling / function calling: probablemente implicito en el entrenamiento tipo MCP, aunque no se documenta explicitamente.
- Razonamiento multi-paso orientado a agentes: sugerido por el prefijo "agent-distill", sin confirmacion en la model card.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Consulta automatizada del Hub de Hugging Face: el modelo se ha entrenado especificamente sobre la tarea `hf-hub-qa-mcp`, por lo que resulta adecuado para responder preguntas sobre modelos, datasets y repositorios del Hub mediante llamadas a herramientas.
- Agente con MCP en entornos de desarrollo: puede integrarse como backend de un agente que use el Model Context Protocol para invocar servidores de herramientas (busqueda, lectura de metadatos, etc.) en pipelines de asistencia al desarrollador.
- Asistente de documentacion tecnica: con 4B de parametros puede desplegarse localmente para responder sobre APIs y repositorios, reduciendo coste frente a modelos de mayor tamano.
- Prototipado rapido de agentes QA: al ser un checkpoint merged, se carga directamente con transformers sin gestionar adaptadores PEFT, lo que simplifica el despliegue en pruebas.
- Inferencia en hardware de consumo: por su tamano (~4,5B) y repo de 9,1 GB, puede ejecutarse en GPUs consumer con cuantizacion, aunque las cuantizaciones no estan publicadas y habria que generarlas.
- Base para fine-tuning adicional: sirve como punto de partida para adaptar el comportamiento agente a otros dominios mediante nuevos LoRA sobre este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamano (~4,5B parametros), en FP16/BF16 requeriria aproximadamente 9-10 GB de VRAM para los pesos, y en cuantizacion de 8 bits en torno a 5 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles. Por tamano, GPUs con 16 GB o mas (por ejemplo RTX 4080/4090, A100) podrian alojar el modelo en precision completa; GPUs de 8-12 GB requeririan cuantizacion.
- Cabe en GPU consumer: probablemente si, con cuantizacion, en tarjetas de 8-12 GB; sin confirmar.
- Opciones de despliegue: transformers (libreria declarada). vLLM, llama.cpp, Ollama o TGI no estan confirmados para este checkpoint; llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-sft-merged (este) | ~4,54B | no disponible | no disponible | Hugging Face, safetensors |
| Qwen/Qwen3.5-4B (modelo base) | no disponible (familia 4B) | no disponible | no disponible | Hugging Face |
| nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-lora (adaptador origen) | adaptador LoRA sobre 4B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de model card detallada: no hay informacion sobre datos de entrenamiento, sesgos, evaluacion ni casos de fallo.
- Licencia no disponible: no puede confirmarse el uso comercial; debe verificarse la licencia del modelo base Qwen3.5-4B antes de desplegarlo en produccion.
- Riesgo de alucinacion: inherente a modelos de generacion de texto; especialmente relevante en QA sobre el Hub, donde puede inventar metadatos de repositorios.
- Entrenamiento muy especifico (tarea `hf-hub-qa-mcp`, `pi@1.6.0`): el comportamiento fuera de ese dominio puede degradarse respecto al modelo base.
- Idiomas y contexto maximo no documentados: no se puede garantizar soporte multilingue ni ventanas largas.
- Cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.
- Cuantizaciones no publicadas: habria que generarlas manualmente para despliegue en hardware limitado.
- Al ser un merge de LoRA, conviene comparar su comportamiento con el modelo base para detectar perdida de capacidades generales.

## Enlaces

- https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-sft-merged
- https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-lora
- https://huggingface.co/Qwen/Qwen3.5-4B
