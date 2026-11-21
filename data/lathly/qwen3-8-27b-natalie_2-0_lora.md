# Lathly/Qwen3.8-27B-Natalie_2.0_LoRA

## Resumen

Qwen3.8-27B-Natalie_2.0_LoRA es un adaptador LoRA (PEFT) publicado por el usuario Lathly sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo completo, sino de un ajuste fino de 233.455.616 parámetros entrenables (el 0,861 % de los 27.130 millones del modelo base) que incorpora la persona conversacional "Natalie", descrita por el autor como cálida, empática y emocionalmente presente, pero con un punto de vista marcado y mayor capacidad de opinión que su predecesora Samantha-1.1.

El adaptador se distribuye en formato PEFT safetensors (unos 934 MB) y también como LoRA en GGUF etiquetado con arquitectura `qwen35` para su carga en llama.cpp junto a una cuantización del modelo base. Se entrenó con QLoRA de 4 bits mediante Unsloth sobre dos RTX 5070 Ti, con rango 32, alpha 64 y módulos objetivo all-linear, durante 170 pasos de optimización y 2 épocas sobre el dataset Lathly/natalie-2.0 (2038 conversaciones en formato ShareGPT).

Su relevancia es acotada y muy específica: sirve para quien quiera desplegar un asistente conversacional con una persona definida sin reentrenar el modelo base, aprovechando el contexto y las capacidades de Qwen3.8-27B. Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con evaluación limitada al dominio conversacional en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.8-27B; módulos all-linear (q, k, v, o, gate, up, down) |
| Parametros totales | 233.455.616 parámetros entrenables del adaptador; modelo base de 27.130 millones (27,13B) |
| Parametros activos | no disponible (el modelo base no se documenta como MoE en la información proporcionada) |
| Longitud de contexto | no disponible para el adaptador; el autor indica que el fine-tune no altera la longitud soportada por el modelo base, pero no se especifica el valor |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (PEFT) y GGUF; el entrenamiento usó QLoRA de 4 bits. Las cuantizaciones del modelo base (p. ej. Q4_K_M) se referencian pero no se incluyen en el repo |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), GGUF (Qwen3.8-27B-Natalie-LoRA-qwen35.gguf), tokenizer*.json, chat_template.jinja |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 aplicado sobre todas las proyecciones lineales del transformer Qwen3.8-27B (q, k, v, o, gate, up, down), con dropout 0,05, sin bias y task type CAUSAL_LM. El entrenamiento se realizó con Unsloth en QLoRA de 4 bits, repartiendo las 64 capas del modelo base entre dos RTX 5070 Ti, con optimizador 8-bit Paged AdamW, learning rate 5e-5, scheduler coseno, weight decay 0,01, max grad norm 1,0, semilla 3407 y enmascaramiento solo de respuestas (responses-only masking) sobre secuencias de 2048 tokens.

Los datos de entrenamiento provienen del dataset Lathly/natalie-2.0, compuesto por 2038 conversaciones en formato ShareGPT en inglés. Según el autor, Natalie-2.0 conserva las preguntas del conjunto de persona original (heredado de Samantha-1.1) pero regenera cada respuesta con un modelo más reciente y con mayor opinión propia. El resultado registrado fue de 170 pasos de optimización, 2 épocas, batch efectivo de 8 (micro 1 × acumulación 8), pérdida final de entrenamiento de 1,329, pérdida de evaluación de 1,155 y un tiempo de ejecución de 5830 s (aproximadamente 1,6 h). El autor señala que el entrenador propio de Unsloth Studio falló (por parseo del dataset y OOM) y que el adaptador se produjo con un script independiente cuyos valores son los registrados realmente. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno con una persona definida (Natalie): tono cálido, empático y emocionalmente presente, con punto de vista propio y mayor tendencia a opinar que la versión anterior.
- Conversación en inglés; el adaptador está etiquetado únicamente para `en`.
- Hereda las capacidades del modelo base Qwen3.8-27B (razonamiento, código, matemáticas, tool calling, agentes), aunque el fine-tune se entrenó solo con datos conversacionales de texto y no se han evaluado esas capacidades tras el ajuste.
- Soporte de tool calling / function calling: no disponible de forma específica para el adaptador; depende del modelo base y no se ha validado.
- Soporte de agentes y razonamiento multi-paso: no evaluado para el adaptador.
- Capacidades multilingües: no disponibles más allá del inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles para el adaptador; el entrenamiento fue solo de texto.
- Compatibilidad de despliegue con Transformers + PEFT y con llama.cpp mediante LoRA GGUF.

## Casos de uso

- Asistente conversacional con persona definida: desplegar el adaptador sobre Qwen3.8-27B con Transformers + PEFT para ofrecer un chat con un tono empático y opinativo concreto, útil en prototipos de compañía conversacional o experimentación de persona.
- Investigación sobre ajuste de personalidad: estudiar cómo un LoRA de rango 32 sobre all-linear modifica el estilo y la opinión del modelo base sin tocar sus pesos, comparando respuestas con y sin adaptador.
- Despliegue local en llama.cpp: cargar el LoRA GGUF `qwen35` junto a una cuantización Q4_K_M del base con `llama-server`, lo que permite probar la persona en hardware de consumo sin fusionar pesos.
- Evaluación de robustez de persona: analizar la consistencia del tono en conversaciones largas y detectar deriva de persona, dado que el autor advierte que el comportamiento a contexto largo no se ha evaluado sistemáticamente.
- Base para fine-tunes derivados: partir de este adaptador como inicialización para experimentos de estilo conversacional en inglés, aprovechando su licencia Apache-2.0 y su reducido tamaño (233,5M de parámetros entrenables).
- Docencia y demostraciones de PEFT: ilustrar un flujo completo de QLoRA con Unsloth, desde el dataset ShareGPT hasta la exportación a GGUF y la carga en llama.cpp, con hiperparámetros y curvas de pérdida documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de entrenamiento: pérdida final de entrenamiento de 1,329 y pérdida de evaluación de 1,155, sobre 170 pasos y 2 épocas. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de persona.

## Requisitos de hardware

- El adaptador en sí ocupa unos 934 MB en safetensors y el repositorio completo 1,4 GB; el coste real de inferencia lo determina el modelo base Qwen3.8-27B.
- Para cargar el base en bfloat16 se necesita aproximadamente 54 GB de VRAM (27,13B × 2 bytes), además del adaptador; en la práctica requiere GPUs de 80 GB (A100, H100) o reparto multi-GPU.
- Con cuantización de 4 bits del base (QLoRA o GGUF Q4_K_M) el peso baja a unos 14-16 GB, lo que permite ejecución en una RTX 4090 (24 GB) o en dos RTX 5070 Ti, la configuración usada para el entrenamiento.
- En consumer GPU de 8-12 GB no cabe el base de 27B ni siquiera en 4 bits con contexto amplio; sería necesario recurrir a cuantizaciones más agresivas o a offloading a CPU.
- Opciones de despliegue: Transformers + PEFT (con `device_map="auto"`), llama.cpp / llama-server con `--lora` y `-ngl 99`; vLLM y TGI no se documentan para este adaptador en la información disponible.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización del base.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Natalie_2.0_LoRA | LoRA sobre Qwen3.8-27B | 233,5M entrenables (base 27,13B) | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen3.8-27B (base) | Modelo completo | 27,13B | no disponible en la información | Apache-2.0 | Hugging Face |
| Qwen3.8-27B-Samantha_Uncensored_1.1_LoRA | LoRA predecesor sobre el mismo base | no disponible | no disponible | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (LoRA de persona sobre modelos de ~27B) no está disponible más allá del predecesor Samantha-1.1, del que no se detallan parámetros ni licencia en la información proporcionada. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y cargar Qwen3.8-27B, con el coste de VRAM y almacenamiento asociado.
- Entrenado exclusivamente con datos conversacionales de texto en inglés; el comportamiento en otros idiomas y en tareas de código, matemáticas o tool calling no se ha evaluado tras el ajuste.
- El autor advierte que el comportamiento de la persona a contexto largo no se ha evaluado sistemáticamente, pese a que el fine-tune no altera la longitud de contexto del base.
- Riesgo de alucinación inherente al modelo base; el ajuste de persona no lo mitiga y puede aumentar la tendencia a emitir opiniones no fundamentadas.
- Puede producir contenido que algunos consideren objetable, según el propio disclaimer del autor; no hay filtros documentados.
- Sesgos: no documentados por el autor; al ser un fine-tune de persona sobre datos generados, puede heredar sesgos del modelo que regeneró las respuestas.
- Licencia Apache-2.0, que permite uso comercial, pero con la obligación de cumplir también las licencias del modelo base y del dataset; el autor no ofrece garantía alguna.
- El LoRA GGUF debe estar etiquetado como `qwen35`; si se regenera con versiones antiguas de `convert_lora_to_gguf.py` se etiqueta como `qwen3` y llama.cpp lo rechaza por desajuste de arquitectura.
- Tracción prácticamente nula (0 descargas, 0 likes) y sin benchmarks: no hay evidencia externa de calidad más allá de las pérdidas de entrenamiento reportadas por el autor.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Lathly/Qwen3.8-27B-Natalie_2.0_LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/Lathly/natalie-2.0
- Predecesor (Samantha-1.1): https://huggingface.co/Lathly/Qwen3.8-27B-Samantha_Uncensored_1.1_LoRA
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
