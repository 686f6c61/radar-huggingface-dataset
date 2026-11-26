# loom-draft/pramodlohra-Qween3_4B_thinking_finetune-loom

## Resumen

`loom-draft/pramodlohra-Qween3_4B_thinking_finetune-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `pramodlohra/Qween3_4B_thinking_finetune`, en concreto el fichero `qwen3-4b-thinking-2507.Q4_K_M.gguf`. No se trata de un modelo entrenado por `loom-draft`, sino de un artefacto de empaquetado orientado a la ejecución del modelo base sobre GPUs AMD: el Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). La generación se realizó con la herramienta `loom-next`, que según la model card opera únicamente como generador, sin LLM en el bucle.

El modelo subyacente es un fine-tune de Qwen3 de 4B parámetros en variante «thinking», derivado del checkpoint `qwen3-4b-thinking-2507`. El paquete declara una ventana de contexto de 262.144 tokens por petición, un máximo de 4.096 tokens de salida (preset `max_tokens`), razonamiento siempre activo, soporte de tool calling al estilo OpenAI y 4 peticiones concurrentes. La licencia declarada es MIT.

Su relevancia es acotada pero específica: cubre el nicho de servir un modelo de 4B con razonamiento y tool calling sobre hardware AMD consumer/prosumer mediante la pila Loom (`hrx-loom`), una alternativa a llama.cpp para estas GPUs. No obstante, el propio autor indica que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, etc.) todavía no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de rendimiento ni de fidelidad frente a la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3; el paquete no detalla la arquitectura interna) |
| Parametros totales | ~4B (según el nombre del modelo base, `Qween3_4B_thinking_finetune`) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (único checkpoint empaquetado, `qwen3-4b-thinking-2507.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado en programas `.loom` + `weights.loom`, con `tokenizer.json` y `llm_config.json`) |

Otros parámetros operativos declarados en la model card:

| Parametro | Valor |
|---|---|
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Sí, estilo OpenAI (`tools` y `tool_calls`) |
| Razonamiento / thinking | Siempre activo |
| Reasoning effort | No aplicable |
| Decodificacion especulativa | No aplicable |
| Entrada de imagen | No determinado |
| Entrada/salida de audio | No determinado |
| Muestreo (sampling) | No determinado |
| GPUs objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base (`pramodlohra/Qween3_4B_thinking_finetune`): no se detalla si es un transformer denso, el número exacto de capas, la dimensión oculta ni la composición del dataset de entrenamiento. Por el nombre del checkpoint de origen (`qwen3-4b-thinking-2507`) y por el tamaño declarado (~4B), se trata de un fine-tune de un modelo de la familia Qwen3 de 4B en su variante orientada a razonamiento, pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado en la información proporcionada. Tampoco se especifican el número de tokens de entrenamiento, la composición del corpus ni si se emplearon técnicas de RLHF, DPO u otras.

Lo que sí documenta el paquete es la capa de despliegue: los programas `.loom` generados por `loom-next` implementan los kernels y el grafo de ejecución para las GPUs AMD objetivo, junto con `tokenizer.json` y `llm_config.json`. La model card menciona puertas de verificación (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, incluyendo tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k. Sin embargo, para este paquete todas las puertas figuran como «not yet re-measured», es decir, no hay resultados registrados.

## Capacidades

- Generación de texto con razonamiento explícito («thinking») siempre activo, sin posibilidad de desactivarlo según la tabla de características del paquete.
- Tool calling al estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`, lo que permite integración con frameworks de agentes compatibles con la API de OpenAI.
- Bucles de tool calling multi-turno: la puerta `agent` de la model card describe explícitamente la verificación de renderizado de prompt, reutilización de historial y validez de las llamadas en un bucle agente.
- Ventana de contexto de 262.144 tokens por petición, adecuada para documentos largos y conversaciones extensas.
- Concurrencia de 4 peticiones simultáneas con la puerta `consistency` definida para comprobar que las respuestas concurrentes coinciden con las ejecuciones aisladas.
- Servidor HTTP compatible con `/v1/chat/completions`, lo que facilita el uso de clientes y SDKs existentes.
- Capacidades multimodales (imagen, audio) y de muestreo: no determinadas en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistente de razonamiento sobre documentos largos: con 262.144 tokens de contexto por petición, el modelo puede ingerir informes, contratos o bases de código extensas y razonar sobre ellas en una sola pasada, sin necesidad de trocear el material en fragmentos.
- Agente de herramientas en local: gracias al soporte de `tools`/`tool_calls` al estilo OpenAI y a los bucles multi-turno, puede orquestar llamadas a APIs internas (consulta de bases de datos, ejecución de scripts, búsqueda) en un flujo de varios pasos.
- Despliegue en estaciones de trabajo AMD: el paquete está pensado para servir el modelo sobre Strix Halo o Radeon AI PRO R9700 mediante `loom-serve`, lo que permite montar un endpoint compatible con OpenAI en hardware AMD sin depender de CUDA.
- Prototipado de pipelines de agentes: al exponer una API compatible con OpenAI, se puede conectar a frameworks como LangChain o similares para validar flujos de razonamiento y tool calling antes de migrar a modelos mayores.
- Procesamiento por lotes con concurrencia moderada: con 4 peticiones simultáneas y una salida máxima de 4.096 tokens, encaja en tareas de generación de resúmenes, extracción estructurada o clasificación con razonamiento en colas pequeñas.
- Evaluación comparativa frente a llama.cpp: las puertas de corrección del paquete (`golden`, `compare`, `logits`) están diseñadas para contrastar la salida token a token contra una referencia de llama.cpp sobre el mismo GGUF, útil para validar la fidelidad de la pila Loom en un entorno concreto.
- Reproducción de experimentos de razonamiento: al mantener el «thinking» siempre activo, sirve para estudiar trazas de razonamiento en un modelo de 4B cuantizado a Q4_K_M con requisitos de memoria moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos indica que «the results for this package are not yet re-measured». Del mismo modo, todas las puertas de corrección figuran como «not yet re-measured», por lo que no hay datos de fidelidad, latencia ni throughput publicados para este paquete.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de ~4B, lo que sitúa los pesos en torno a 2,5-3 GB; a ello hay que sumar la caché KV para un contexto de hasta 262.144 tokens, que puede crecer de forma significativa según la configuración del preset. No se publican cifras exactas de memoria del pool en la información disponible.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: el paquete está orientado a las dos GPUs AMD citadas; no se declara compatibilidad con GPUs NVIDIA ni con otras Radeon distintas de las listadas.
- Despliegue: pila Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir el endpoint. Se documentan dos presets: `chat` (Strix Halo) y `chat-r9700` (Radeon AI PRO R9700).
- Opciones de servido documentadas: `--pool_backing=fixed` (compromete el pool de memoria por adelantado) y `--parameter_mode=preload` (solo afecta a la carga de pesos en host). El flag `completion_spin_ns=4294967295` activa la espera activa de finalizaciones de GPU, que consume CPU mientras hay trabajo en vuelo.
- Latencia y throughput: no disponibles; las mediciones del paquete aún no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/pramodlohra-Qween3_4B_thinking_finetune-loom` (este paquete) | ~4B | 262.144 tokens | MIT | GGUF empaquetado en `.loom`, servido con `loom-serve` | Orientado a GPUs AMD Strix Halo y R9700; rendimiento y corrección sin re-medir |
| `pramodlohra/Qween3_4B_thinking_finetune` (modelo base) | ~4B | no disponible | MIT | GGUF (`qwen3-4b-thinking-2507.Q4_K_M.gguf`) | Checkpoint original sin modificar; el paquete Loom lo envuelve |
| Modelos de la familia Qwen3 de 4B (variante thinking) | ~4B | no disponible en esta ficha | no disponible en esta ficha | safetensors / GGUF según distribución | Referencia nominal del fine-tune; no se dispone de datos verificados en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato de despliegue.

## Limitaciones y advertencias

- El paquete no ha vuelto a medir ninguna de sus puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`): no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en este paquete concreto.
- Tampoco hay mediciones de rendimiento frente a llama.cpp para Strix Halo ni para Radeon AI PRO R9700; se desconoce la latencia y el throughput reales.
- El razonamiento está siempre activo y no se puede desactivar; el «reasoning effort» no es aplicable. Esto implica que toda petición consume tokens de pensamiento, con el coste asociado en latencia y longitud de salida.
- El máximo de tokens de salida está fijado en 4.096 por preset, muy por debajo de la ventana de contexto de 262.144 tokens; las tareas que requieran respuestas más largas necesitarán ajustar el preset.
- Solo se sirven 4 peticiones concurrentes, lo que limita el uso en escenarios de alta carga.
- El paquete está restringido a las GPUs AMD indicadas (gfx1151 y gfx1201); no se declara compatibilidad con otras GPUs.
- La cuantización disponible es únicamente Q4_K_M; no se ofrecen variantes en otros formatos dentro de este paquete.
- No se especifican los idiomas soportados ni los sesgos conocidos del modelo base; tampoco hay información sobre la composición del dataset de entrenamiento ni sobre posibles riesgos de alucinación más allá de los inherentes a un modelo de 4B.
- La licencia MIT se declara tanto en el paquete como en el modelo base, pero conviene verificar las condiciones del checkpoint original antes de un uso comercial en producción.
- El repositorio no registra descargas ni «likes», y su fecha de creación es posterior a la de la mayoría de referencias del ecosistema; se trata de un artefacto reciente y sin validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/pramodlohra-Qween3_4B_thinking_finetune-loom
- Modelo base en Hugging Face: https://huggingface.co/pramodlohra/Qween3_4B_thinking_finetune
- Repositorio de la pila Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
