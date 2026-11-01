# JamieBradfield/Spark-X2.6-4B-AgentFast

## Resumen

Spark-X2.6-4B-AgentFast es un ajuste fino (fine-tune) experimental de [XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B) publicado por JamieBradfield, orientado a agentes autónomos con llamadas a herramientas (tool calling) y baja latencia. El modelo surge de un accidente empírico durante el entrenamiento: un error de mapeo en la plantilla de chat dejó vacío el canal de razonamiento (`reasoning_content`), lo que provocó que, tras 150 pasos de SFT, el modelo aprendiera un reflejo de "salida temprana" que cierra el canal de pensamiento en el token 0 y emite directamente llamadas a herramientas o respuestas.

El resultado es un modelo de 4,11 mil millones de parámetros (dato real de safetensors) que conserva las capacidades base de instrucción y matemáticas del modelo original, pero que ejecuta entre un 30 y un 40 % más rápido al eliminar los monólogos de deliberación de 350-450 tokens del modelo stock. En el benchmark BFCL v3 reduce la latencia media por llamada de 5,13 s a 3,11 s, y en IFEval mejora la precisión estricta a nivel de prompt del 15,0 % al 65,0 %.

Es relevante como caso de estudio de agentes ligeros de baja latencia para ejecución en dispositivo (on-device), aunque el propio autor lo publica "tal cual", sin garantía de mantenimiento, y prepara una versión corregida que preserve los trazos de razonamiento completos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5 (transformer, arquitectura personalizada con `custom_code` en HuggingFace) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos usan 4096 tokens) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF IQ3_M (1,94 GB) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF cuantizado |

## Arquitectura y entrenamiento

El modelo parte del transformer base Spark-X2.6-4B de XHToken y se ajusta mediante SFT supervisado durante 150 pasos. El objetivo original era entrenar sobre trazos completos de deliberación multi-paso ("Fable"), pero un fallo de mapeo en la plantilla de chat hizo que los trazos `<thought>` no se parsearan a la clave `reasoning_content`, generando objetivos de entrenamiento con el canal de razonamiento vacío (`<|Bot|></think>`). El modelo aprendió así a cerrar el canal de pensamiento inmediatamente y emitir respuestas y llamadas a herramientas directas.

Dado que los pesos del transformer subyacente no se modificaron estructuralmente, se preservaron las capacidades básicas de instrucción y matemáticas del modelo base, con la ganancia colateral de una inferencia entre un 30 y un 40 % más rápida. El formato de salida de tool calling emplea XML estructurado (`<arg_key>`) y payloads de argumentos en JSON, listos para pipelines de ejecución en vivo. No se dispone de información sobre el número de tokens del corpus de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional con cumplimiento estricto de instrucciones (IFEval strict prompt-level del 65,0 % frente al 15,0 % del modelo stock).
- Llamada autónoma a herramientas: emite llamadas `<tool_call>` con argumentos XML/JSON estructurados sin preámbulos conversacionales ni hesitaciones.
- Razonamiento simbólico y matemático retenido en gran medida (40,0 % en Gaokao Math 2026 objetivo, frente al 46,7 % del modelo base).
- Baja latencia por diseño: responde en 2-4 segundos (~61 tokens/s en Vulkan sobre Radeon PRO V320) al eliminar la deliberación interna.
- Pensamiento "early-exit": cierra el canal `</think>` en el token 0, sin modo de razonamiento extendido.
- Ejecución en dispositivo (on-device) y inferencia rápida mediante GGUF cuantizado en llama.cpp (Vulkan, ROCm, CUDA, CPU).
- No hay evidencia de capacidades de visión, audio ni soporte explícito de agentes multi-step más allá del tool calling de un paso.

## Casos de uso

- Agentes de ejecución de herramientas en tiempo real: gracias a su reflejo de salida temprana, emite llamadas `<tool_call>` en 2-4 segundos, adecuado para bucles de agente donde cada segundo de deliberación encarece el ciclo total.
- Atención al cliente con integración de sistemas: puede invocar funciones estructuradas (consultas a CRM, creación de tickets) sin monólogos intermedios, reduciendo el tiempo de respuesta percibido por el usuario.
- Automatización de operaciones de sistema (system operations): el ajuste fino se centró explícitamente en operaciones de sistema y cumplimiento de prompts, útil para asistentes de línea de comandos o runbooks automatizados.
- Despliegue on-device en hardware modesto: la variante GGUF IQ3_M ocupa 1,94 GB y cabe en ~2,1 GB de VRAM con contexto de 1024 tokens, viable en portátiles con GPU integrada o mini-PC.
- APIs OpenAI-compatibles de baja latencia: mediante `llama-server` puede exponerse como endpoint compatible con OpenAI para prototipos de agentes locales.
- Seguimiento estricto de instrucciones en flujos estructurados: la mejora de +50 puntos en IFEval strict lo hace adecuado para tareas donde el formato de salida debe respetarse literalmente (plantillas, esquemas JSON, restricciones de longitud).
- Caso de estudio de investigación: el propio autor lo publica como artefacto de estudio sobre "early exit" aprendido mediante SFT con objetivos degradados.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados sobre `Vulkan1` (Radeon PRO V320) frente al modelo Spark-X2.6-4B instruct stock:

| Benchmark | Métrica | AgentFast | Stock Spark-X2.6-4B |
|---|---|---|---|
| BFCL v3 (exec_simple, 30 muestras) | Exact Argument Accuracy | 83,3 % | 80,0 % |
| BFCL v3 | Function Name Accuracy | 90,0 % | 93,3 % |
| BFCL v3 | Tool Invocation Rate | 93,3 % | 93,3 % |
| BFCL v3 | Latencia media por llamada | 3,11 s | 5,13 s |
| IFEval (Google) | Prompt-Level Strict Accuracy | 65,0 % | 15,0 % |
| IFEval | Prompt-Level Loose Accuracy | 70,0 % | 15,0 % |
| IFEval | Instruction-Level Strict Accuracy | 60,0 % | 36,7 % |
| Gaokao Math 2026 (15 preguntas test) | Precisión multiple-choice | 40,0 % | 46,7 % |
| Gaokao Math 2026 | Latencia media por problema | 6,18 s | 9,78 s |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM para inferencia con la variante GGUF IQ3_M: ~2,1 GB con contexto de 1024 tokens (archivo de 1,94 GB).
- VRAM para el trunk BF16 en safetensors: aproximadamente 8,2 GB (tamaño del repo), por lo que una GPU de 12 GB o más es recomendable en precisión completa.
- Cabe en GPUs de consumo: sí, en la variante IQ3_M cabe en GPUs integradas y de gama baja (según el autor se evaluó sobre una Radeon PRO V320 vía Vulkan); el BF16 cabe en una RTX 3060 de 12 GB o superior.
- GPU recomendadas: no se especifican recomendaciones oficiales; compatible con Vulkan, ROCm, CUDA y CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (CLI y servidor OpenAI-compatible), Transformers con `trust_remote_code=True` y `device_map="auto"`. No se menciona soporte para vLLM, TGI u Ollama.
- Throughput estimado: ~61 tokens/s en Vulkan sobre Radeon PRO V320 según el autor; respuestas típicas en 2-4 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Fortaleza principal |
|---|---|---|---|---|
| Spark-X2.6-4B-AgentFast | 4,11 B | no disponible (4096 en ejemplos) | Apache 2.0 | Tool calling sin latencia de deliberación |
| Spark-X2.6-4B (stock, XHToken) | 4,11 B | no disponible | no disponible | Razonamiento completo con canal de pensamiento |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Qwen Research (uso comercial condicionado) | Multilingüe amplio y tool calling maduro |
| Phi-3.5-mini-instruct | 3,82 B | 131.072 tokens | MIT | Instrucción y razonamiento en modelo pequeño |

Frente al modelo stock del que deriva, AgentFast sacrifica profundidad de razonamiento (peor en Gaokao Math y en Function Name Accuracy) a cambio de un 39 % menos de latencia y un cumplimiento de instrucciones muy superior. Frente a alternativas consolidadas como Qwen2.5-3B o Phi-3.5-mini, carece de contexto largo documentado y de ecosistema de despliegue probado, pero ofrece licencia Apache 2.0 sin restricciones y una latencia de agente notablemente baja.

## Limitaciones y advertencias

- El modelo es un artefacto experimental derivado de un error de entrenamiento: el propio autor lo publica "tal cual", sin garantías y sin compromiso de actualizaciones, mantenimiento ni corrección de bugs.
- Pérdida parcial de razonamiento: al cerrar el canal de pensamiento de forma sistemática, rinde peor en tareas que requieren deliberación (Gaokao Math: 40,0 % frente a 46,7 % del stock).
- Ligera regresión en la precisión del nombre de función en BFCL (90,0 % frente a 93,3 % del stock).
- Los benchmarks publicados usan muestras muy reducidas (30 muestras en BFCL, 15 en Gaokao Math), por lo que los resultados tienen alta varianza estadística y no son directamente comparables con evaluaciones a gran escala.
- Requiere `trust_remote_code=True` al cargarlo con Transformers por usar arquitectura personalizada (`custom_code`), lo que implica ejecutar código del repositorio.
- Idiomas limitados a inglés y chino; no hay información de rendimiento en castellano.
- No hay datos sobre sesgos, riesgo de alucinación ni restricciones adicionales de uso comercial más allá de la licencia Apache 2.0 (que sí permite uso comercial).
- El autor está preparando un fine-tune corregido que preservará los trazos de razonamiento, lo que sugiere que esta versión puede quedar obsoleta pronto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JamieBradfield/Spark-X2.6-4B-AgentFast
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Variante GGUF cuantizada: https://huggingface.co/JamieBradfield/Spark-X2.6-4B-AgentFast-GGUF
