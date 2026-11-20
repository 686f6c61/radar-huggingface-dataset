# AjelixAI/Onyx-9B

## Resumen

Onyx-9B es un modelo de lenguaje causal de 9.409.813.744 parametros (9,47B segun la model card) desarrollado por Ajelix, derivado mediante fine-tuning supervisado (SFT) del modelo base Qwen/Qwen3.5-9B. Esta disenado especificamente para sesiones agenticas multi-turno en terminal y uso de herramientas: el modelo razona, emite una llamada a herramienta, observa la salida y vuelve a razonar, manteniendo al mismo tiempo la capacidad de responder directamente a preguntas simples. Se publico en noviembre de 2026 bajo licencia Apache-2.0.

Conserva la arquitectura de Qwen3.5-9B sin modificacion estructural, incluyendo el codificador de vision, y se distribuye tanto como checkpoint fusionado (18,8 GB en safetensors) como en forma de adaptador LoRA (233 MB) compatible con PEFT. Su ventana de contexto nativa es de 262.144 tokens, lo que lo hace adecuado para historiales largos de uso de herramientas.

Su relevancia radica en que ocupa el nicho de automatizacion de terminal y tareas de codigo agenticas en un tamano que cabe en GPUs de consumo, pero con advertencias importantes: no hay benchmarks publicados, esta entrenado principalmente con un unico esquema de herramienta (`bash`) y no ha recibido fine-tuning de seguridad adicional. Es, por tanto, un modelo a evaluar con cautela antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision (`Qwen3_5ForConditionalGeneration`), identica a Qwen3.5-9B |
| Parametros totales | 9.409.813.744 (9,47B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativo |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint fusionado y adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

Onyx-9B retiene la arquitectura de Qwen3.5-9B sin modificacion estructural: un transformer causal con clase `Qwen3_5ForConditionalGeneration` y un codificador de vision conservado sin cambios. El fine-tuning supervisado solo adapto las capas de lenguaje; el codificador de vision y la tabla de embeddings permanecen sin alterar mas alla del efecto del adaptador fusionado. El entrenamiento se realizo en Europa sobre hardware de Ajelix, y el resultado se publica como LoRA (233 MB) y como checkpoint fusionado (18,8 GB).

Las conversaciones siguen el formato nativo de function calling de Qwen3.5: el asistente emite razonamiento dentro de `<think>...</think>`, seguido de bloques `<tool_call><function=bash><parameter=command>...</parameter></function></tool_call>`, y la salida de terminal se devuelve en bloques `<tool_response>...</tool_response>`. Las trayectorias agenticas de entrenamiento fueron producidas por un unico proceso de generacion, por lo que el estilo de las llamadas refleja esa convencion y no una distribucion amplia de trazas reales de agentes. No se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento paso a paso mediante modo thinking (`enable_thinking=True`).
- Uso de herramientas (tool calling) en formato nativo Qwen3.5, con llamadas estructuradas a funciones.
- Sesiones agenticas multi-turno: razonar, ejecutar herramienta, observar salida y volver a razonar.
- Automatizacion de terminal: emision de comandos shell dentro del bloque `<tool_call>` con la funcion `bash`.
- Respuestas directas breves cuando no se proporcionan descripciones de herramientas (por ejemplo, calculos simples como porcentajes).
- Capacidades de vision heredadas del codificador del modelo base (retained, unchanged), aunque el fine-tuning no las adapta.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- Compatibilidad con vLLM, SGLang, Transformers y PEFT.

## Casos de uso

- Automatizacion de tareas de repositorio: el modelo puede encadenar comandos de terminal para inspeccionar, modificar y verificar codigo en un repositorio, manteniendo el contexto de la sesion gracias a la ventana de 262.144 tokens.
- Bucles de depuracion: emitir un comando de build o test, leer la salida en `<tool_response>`, razonar sobre el error y proponer el siguiente comando correctivo de forma iterativa.
- Administracion de sistemas: ejecutar comandos de inspeccion (listado de ficheros, estado de servicios, logs) y sintetizar los resultados en una respuesta operativa.
- Tareas orientadas a seguridad: reconocimiento y analisis de configuraciones en entornos controlados, con revision humana obligatoria de cada comando antes de ejecutarlo.
- Asistente de preguntas directas: cuando no se pasa esquema de herramientas, responde de forma concisa a consultas puntuales, lo que permite reutilizarlo como modelo de chat ligero.
- Integracion en pipelines con vLLM: servir el checkpoint fusionado con `vllm serve` y `--max-model-len 16384` para exponer un endpoint compatible con flujos agenticos existentes.
- Prototipado con PEFT: cargar el adaptador LoRA sobre Qwen3.5-9B para experimentar con variantes sin descargar el checkpoint completo de 18,8 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de benchmarks agenticos (Terminal-Bench, SWE-bench, Toolathlon) estan pendientes y advierte que no debe asumirse capacidad a partir de la perdida de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19 GB para los pesos (18,8 GB de checkpoint) mas memoria para el KV cache y activaciones; en la practica, se recomienda 24 GB o mas.
- Cuantizacion: no se publican pesos cuantizados; seria necesario generarlos a partir del checkpoint fusionado para reducir requisitos (por ejemplo, a ~5-6 GB en 4 bits, estimacion orientativa no verificada).
- GPU recomendadas: A100, H100 para sesiones con contexto largo; RTX 4090 (24 GB) para inferencia en bfloat16 con ventanas moderadas.
- Cabe en GPU de consumo: si, en RTX 4090 en bfloat16 con contexto limitado; en GPUs de 16 GB requeriria cuantizacion no publicada.
- Opciones de despliegue: vLLM (`vllm serve AjelixAI/Onyx-9B --max-model-len 16384 --dtype bfloat16`), SGLang, Transformers con `device_map="auto"`, PEFT para el adaptador LoRA. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Onyx-9B | 9,47B | 262.144 tokens | Apache-2.0 | Fine-tune agentico de terminal sobre Qwen3.5-9B | Hugging Face (checkpoint + LoRA) |
| Qwen/Qwen3.5-9B | 9,47B (base) | 262.144 tokens | no disponible en la informacion | Modelo base multimodal y de proposito general | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada con certeza es con el modelo base Qwen3.5-9B, del que Onyx-9B hereda arquitectura, contexto y licencia del codificador, diferenciandose por el fine-tuning agentico y por la publicacion del adaptador LoRA. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Benchmarks pendientes: no hay resultados de Terminal-Bench, SWE-bench ni Toolathlon, y la model card advierte de no inferir capacidad a partir de la perdida de entrenamiento.
- Esquema de herramienta unico: entrenado principalmente con la herramienta `bash`; otras firmas de herramientas no estan probadas.
- Estilo de llamada estrecho: las trayectorias agenticas provienen de un unico proceso de generacion, lo que limita la diversidad de estilos de comandos y frases.
- Sesiones largas: el comportamiento mas alla del contexto nativo no esta probado y puede degradarse con historiales de uso de herramientas muy extensos.
- Alucinacion: los comandos y afirmaciones generados pueden ser incorrectos; toda accion en terminal debe revisarse antes de ejecutarse en entornos con consecuencias.
- Seguridad: no hay fine-tuning de seguridad mas alla del heredado del modelo base, ni evaluacion del riesgo de comandos destructivos; el modelo puede emitir comandos shell peligrosos.
- Sesgos: hereda los sesgos y limitaciones de conocimiento del modelo base y de sus datos; no se ha evaluado para equidad, toxicidad o robustez.
- Idioma: solo se declara ingles, sin evaluacion de otros idiomas.
- Licencia: Apache-2.0 permite uso comercial, pero no exime al desplegador de sandboxing y supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AjelixAI/Onyx-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
