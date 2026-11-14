# jcudit/Qwen3.5-9B-Kimi-K3-Distill

## Resumen

Qwen3.5-9B-Kimi-K3-Distill es un ajuste fino por destilación de secuencia (sequence-level distillation) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario jcudit en Hugging Face. El objetivo es aproximar el comportamiento de moonshotai/Kimi-K3 (un modelo de aproximadamente 2,8 billones de parámetros) en un modelo denso de 9.409.813.744 parámetros que cabe en una sola GPU, concretamente 18,8 GB en bf16. El entrenamiento se realizó con la receta `sft_agent_traces` de TRL sobre un conjunto de 9.991 filas cuyos turnos de asistente son salidas generadas por Kimi K3.

El modelo cubre dos áreas: codificación agéntica con uso de herramientas (agentic coding / tool use) y chat general con seguimiento de instrucciones. Es un modelo "no-think": el razonamiento explícito se ha eliminado del entrenamiento, de modo que responde directamente sin bloque de pensamiento. La arquitectura subyacente es la del Qwen3.5-9B original (familia qwen3_5, cargable con `AutoModelForImageTextToText`), y los pesos se distribuyen en safetensors con licencia Apache-2.0.

Su relevancia práctica es económica: reproduce el estilo y la cobertura de tareas de un profesor de escala de billones de parámetros con un coste de cómputo declarado de aproximadamente 22 USD en Hugging Face más unos 20 USD de generación del profesor mediante Inference Providers, y se sirve en una A100 80GB o en tarjetas de 24 GB con cuantización de 8 o 4 bits. La contrapartida, reconocida por el autor, es que hereda el estilo y la cobertura del mix de destilación, no la capacidad completa de K3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (tag `qwen3_5`), multimodal en el modelo base |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max length 16K, con descarte de trazas mas largas) |
| Tipos de cuantizacion | bf16 (18,8 GB); 8-bit y 4-bit mencionados por el autor para tarjetas de 24 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de 9,41 mil millones de parámetros que el autor carga mediante `AutoModelForImageTextToText`, lo que indica que la clase base del modelo es multimodal. Sobre esa base se aplicó un ajuste fino supervisado completo (full SFT) con la receta `sft_agent_traces` de TRL: pérdida solo sobre turnos de asistente, longitud máxima de 16K tokens con descarte de trazas más largas, learning rate 1e-5 con scheduler coseno, 3 épocas, batch efectivo de 8, precisión bf16, AdamW de 8 bits y gradient checkpointing, todo en una única A100-80GB durante aproximadamente 6,5 horas.

Los datos provienen del dataset jcudit/kimi-k3-distill-mix-v1, con 9.991 filas en las que todos los turnos de asistente son salidas de Kimi K3: 3.600 trazas de codificación agéntica y uso de herramientas (greghavens/kimi-k3-coding-and-debugging-traces), 3.900 ejemplos de instrucciones, matemáticas y código (beyoru/kimi-k3-distillation) y 2.400 conversaciones de chat general generadas con K3 para este proyecto. El razonamiento explícito se eliminó, por lo que el resultado es un modelo no-think. No se documenta RLHF ni DPO, solo destilación por SFT.

## Capacidades

- Generación de texto y seguimiento de instrucciones en formato conversacional multi-turno mediante plantilla de chat.
- Codificación agéntica: trazas de resolución de bugs, depuración y uso de herramientas de estilo bash/lectura de ficheros.
- Uso de herramientas y function calling a través del argumento `tools` de la plantilla de chat; el comportamiento está modelado por los esquemas de herramientas del harness de las trazas.
- Razonamiento directo sin bloque de pensamiento (modelo no-think), lo que reduce latencia y tokens de salida.
- Matemáticas y código dentro del mix de instrucciones destilado.
- Capacidad multimodal heredada del base Qwen3.5-9B, aunque sin datos de imagen en el entrenamiento y sin probar según el autor.

## Casos de uso

- Agente de codificación en local: el modelo puede ejecutar bucles de lectura de ficheros, edición y ejecución de comandos con esquemas de herramientas pasados por la plantilla de chat, y cabe en una GPU de 24 GB en 4 bits, lo que permite desplegarlo en estaciones de trabajo de desarrollo sin clúster.
- Depuración automatizada en CI: dado que se entrenó sobre trazas de debugging, puede analizar fallos de test y proponer parches dentro de un pipeline que exponga las herramientas de lectura y escritura de ficheros.
- Asistente de chat de propósito general: con 9,41 mil millones de parámetros y respuesta directa sin bloque de pensamiento, es adecuado para atención al usuario en aplicaciones donde la latencia de un modo thinking sería excesiva.
- Servicio de inferencia económico en una sola A100 80GB: los 18,8 GB en bf16 dejan margen para batch y caché KV, lo que permite servir varias conversaciones concurrentes con vLLM o TGI.
- Prototipado de agentes con tool calling: sirve para validar esquemas de herramientas y flujos multi-paso antes de migrar a un modelo mayor, ya que reproduce el estilo de K3 en ese dominio.
- Generación de código asistida en IDE: integrado como backend de autocompletado o de explicación de código en un servidor con una RTX 4090 en cuantización de 8 bits.
- Evaluación comparativa de destilación: útil como referencia para medir la brecha entre un profesor de escala de billones y un alumno denso de 9B en tareas de agente y chat.

## Benchmarks y rendimiento

El autor publica métricas de ajuste al profesor sobre 283 filas reservadas (nunca usadas en entrenamiento), no benchmarks estándar:

| Metrica | Qwen3.5-9B base | Este modelo |
|---|---:|---:|
| NLL sobre salidas del profesor (menor es mejor) | 1,392 | 1,020 |
| Perplejidad sobre salidas de K3 (menor es mejor) | 4,02 | 2,77 |

Pérdida de evaluación por época: 0,651 (época 1), 0,679 (época 2), 0,702 (época 3, checkpoint publicado). El óptimo de evaluación fue la época 1, cuyo checkpoint no se guardó. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 18,8 GB de pesos, más caché KV; el autor lo considera cómodo en una A100 80GB.
- VRAM en 8 bits: en torno a 10-11 GB de pesos, viable en tarjetas de 24 GB.
- VRAM en 4 bits: en torno a 6-7 GB de pesos, viable en tarjetas de 12-16 GB.
- GPU recomendadas: A100 80GB para bf16 con concurrencia; RTX 4090, RTX 3090 o L4 de 24 GB en 8 o 4 bits.
- Despliegue: transformers (código de ejemplo en la model card con `AutoModelForImageTextToText`), vLLM y TGI son opciones razonables para safetensors; llama.cpp u Ollama requerirían conversión a GGUF, no publicada en el repo.
- Latencia y throughput: no disponibles; el entrenamiento completo consumió unas 6,5 horas en una A100-80GB.
- Almacenamiento: el repositorio ocupa 37,7 GB, coherente con pesos en bf16 más ficheros auxiliares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jcudit/Qwen3.5-9B-Kimi-K3-Distill | 9,41B | no disponible | Apache-2.0 | Hugging Face, 47 descargas | Destilado no-think de K3; sin benchmarks estándar |
| Qwen/Qwen3.5-9B (base) | 9,41B | no disponible | Apache-2.0 (segun el modelo derivado) | Hugging Face | Punto de partida; NLL 1,392 y perplejidad 4,02 sobre salidas de K3 |
| moonshotai/Kimi-K3 (profesor) | ~2,8T | no disponible | Licencia personalizada de Moonshot | Hugging Face | Capacidad muy superior; inviable en una sola GPU |

## Limitaciones y advertencias

- Destilado de solo unas 10.000 filas: hereda el estilo y la cobertura de tareas del mix, no la capacidad completa de K3; la brecha es mayor en cadenas de razonamiento largas, trabajo multilingüe y dominios ausentes del mix.
- Modelo no-think: no genera bloque de razonamiento, lo que puede penalizar tareas que requieren deliberación extensa.
- El comportamiento agéntico está condicionado por los esquemas de herramientas del harness de las trazas (agentes de codificación estilo bash/lectura); con otros esquemas hay que pasar las definiciones por el argumento `tools` y validar el resultado.
- Sobreajuste leve en la época 3: la pérdida de evaluación sube de 0,651 a 0,702; el checkpoint de la época 1, que era el óptimo, no se guardó.
- Visión no probada: el modelo base es multimodal, pero no se entrenó con datos de imagen.
- Idiomas soportados no documentados; el mix parece centrado en inglés.
- Licencia Apache-2.0 para los pesos, pero Kimi K3 está bajo licencia personalizada de Moonshot: hay que revisar sus términos sobre derivados antes de un uso comercial. Los datos de entrenamiento tienen licencias cc-by-4.0 (greghavens), la indicada en la card de beyoru y Apache-2.0 (prompts de OASST2).
- Riesgo de alucinación y sesgos: no documentados por el autor; son los esperables en un modelo de 9B ajustado sobre un corpus pequeño.
- Autoría individual (jcudit) y 47 descargas: ecosistema de validación limitado, sin pipeline declarado en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcudit/Qwen3.5-9B-Kimi-K3-Distill
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Profesor: https://huggingface.co/moonshotai/Kimi-K3
- Dataset de destilación: https://huggingface.co/datasets/jcudit/kimi-k3-distill-mix-v1
- Dataset de evaluación: https://huggingface.co/datasets/jcudit/kimi-k3-distill-eval
- Trazas de codificación (greghavens): https://huggingface.co/datasets/greghavens/kimi-k3-coding-and-debugging-traces
- Dataset de instrucciones (beyoru): https://huggingface.co/datasets/beyoru/kimi-k3-distillation
- Trazas de chat general: https://huggingface.co/datasets/jcudit/kimi-k3-general-chat-traces
- Receta de entrenamiento TRL: https://github.com/huggingface/trl/tree/main/examples/sft_agent_traces
- Panel de seguimiento del entrenamiento: https://huggingface.co/spaces/jcudit/qwen35-9b-kimi-k3-distill-trackio
