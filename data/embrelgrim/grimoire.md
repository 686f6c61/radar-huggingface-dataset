# embrelgrim/grimoire

## Resumen

Grimoire (publicado en el repositorio como `assistant8`) es un modelo de lenguaje de muy pequeno tamano desarrollado por el usuario de HuggingFace embrelgrim. Se trata de un fine-tuning sobre Qwen/Qwen2.5-0.5B-Instruct que, segun la model card, ha sido reentrenado con una arquitectura propia denomida "Compact Dual Dynamic LLM", generada mediante el script `build_neuroset.py`. El modelo declara 35,85 millones de parametros, un vocabulario compacto de 11.264 tokens y una profundidad recurrente de 8 capas sobre una unica capa base.

El objetivo declarado del autor no es competir en calidad con modelos de gran escala, sino demostrar la viabilidad de una arquitectura recurrente en profundidad ("recurrent-depth") con un presupuesto de entrenamiento minimo: una hora de computo y 1.549 pasos sobre 40 millones de tokens. El modelo esta especializado en ruso y en el uso de herramientas (tool-use y function-calling), con un formato especifico de llamadas a funciones basado en etiquetas XML.

Es relevante ahora como ejemplo de investigacion reproducible en eficiencia de arquitecturas y como caso de estudio de las limitaciones de los modelos ultracompactos: la propia model card advierte que se trata de una demostracion de la arquitectura, no de un modelo con calidad comparable a Qwen. El repositorio ocupa 0,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compact Dual Dynamic LLM, transformer con profundidad recurrente (base_layers=1, depth=8), d_model=896, 14 cabezas de 64 dimensiones |
| Parametros totales | 35.849.352 (35,85 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp16 en `checkpoints/final.pt`) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (fp16); no se distribuyen safetensors ni GGUF |
| Vocabulario | 11.264 tokens (cobertura del 99,84 %) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Datos de entrenamiento | 65.490 muestras / 40.030.505 tokens |
| Duracion del entrenamiento | 1 hora, 1.549 pasos |
| Val loss | 2,5465 (mejor 2,5078) |
| Val perplexity | 12,76 |

## Arquitectura y entrenamiento

La arquitectura se describe como "Compact Dual Dynamic LLM" con profundidad recurrente: una unica capa base (`base_layers=1`) que se aplica de forma iterativa hasta 8 veces (`depth=8`), con una dimension de modelo de 896 y 14 cabezas de atencion de 64 dimensiones cada una. El vocabulario se ha reducido a 11.264 tokens mediante un tokenizador compacto propio (`compact_vocab.pt` y directorio `tokenizer/`), que segun el autor cubre el 99,84 % del corpus. No se detalla en la informacion disponible el mecanismo exacto de recurrencia, el esquema de atencion ni si se emplean tecnicas adicionales como decodificacion especulativa o atencion lineal.

El entrenamiento se realizo con el script `build_neuroset.py` sobre 65.490 muestras que suman 40.030.505 tokens, en una sola hora y 1.549 pasos, alcanzando una perdida de validacion de 2,5465 y una perplejidad de 12,76. No se especifica en la informacion proporcionada si hubo RLHF, DPO, SFT supervisado o mezcla de datos sinteticos; tampoco se detalla la composicion del dataset mas alla del enfoque en ruso y en llamadas a herramientas. El modelo parte de Qwen2.5-0.5B-Instruct, aunque el recuento de parametros declarado (35,85 M) es muy inferior al del modelo base, lo que sugiere un rediseno o destilacion de la arquitectura original.

## Capacidades

- Generacion de texto conversacional en ruso, con respuestas multi-turno en un formato de chat simple (`usr>` / `agt>`).
- Llamada a funciones y uso de herramientas mediante un formato XML propio: `<tool_call>{"name":..., "arguments":...}</tool_call>` y bloques `<tool_response>`.
- Herramientas de ejemplo integradas en la model card: `calculate` (evaluacion de expresiones aritmeticas) y `web_search` (busqueda web simulada).
- Razonamiento aritmetico basico mediado por herramientas (por ejemplo, 50 - 18 o 2 * 2).
- Capacidad de agentes de un solo paso: el modelo emite la llamada, consume la respuesta de la herramienta y redacta una conclusion.
- Capacidades multilingues: limitadas al ruso segun la etiqueta `language: ru`; no se declara soporte de otros idiomas.
- No se declaran capacidades de vision, audio, modo thinking explicito ni razonamiento extendido.

## Casos de uso

- Demostracion de arquitecturas recurrentes en profundidad: el modelo sirve como banco de pruebas reproducible para investigadores que quieran validar si una capa base aplicada 8 veces con 35 M de parametros puede aprender tareas de instruccion y tool-use con un presupuesto de una hora de entrenamiento.
- Prototipado de pipelines de function-calling: el formato XML de llamadas permite integrar el modelo en un orquestador de agentes que intercepte `<tool_call>`, ejecute la herramienta y devuelva `<tool_response>`, sin necesidad de infraestructura pesada.
- Educacion y docencia: por su tamano (0,2 GB) y su licencia Apache 2.0, es adecuado para talleres donde se explique el ciclo completo de entrenamiento, tokenizacion compacta y evaluacion de perdida y perplejidad.
- Experimentos de tokenizacion para ruso: el vocabulario compacto de 11.264 tokens con cobertura del 99,84 % puede reutilizarse como referencia en estudios de compresion de vocabulario para lenguas eslavas.
- Pruebas de integracion de agentes en entornos con recursos minimos: al ejecutarse en CPU y ocupar menos de 1 GB en fp16, puede desplegarse en contenedores ligeros para validar flujos de tool-use antes de migrar a modelos mayores.
- Evaluacion de robustez y alucinacion en modelos pequenos: los ejemplos de la model card muestran respuestas incorrectas o incoherentes (por ejemplo, busquedas con consultas erroneas), lo que lo convierte en un caso util para estudiar modos de fallo en agentes de baja capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento: val loss de 2,5465 (mejor 2,5078) y val perplexity de 12,76 sobre el conjunto de validacion propio. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en fp16 (35,85 M de parametros), y en torno a 0,1-0,2 GB en cuantizaciones de 8 o 4 bits, aunque no se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una GTX 1650, RTX 3060, RTX 4090 o incluso en iGPU con memoria unificada.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM; tambien se ejecuta en CPU.
- Opciones de despliegue: el autor proporciona el script `build_neuroset.py` con modos `--mode chat` y `--mode bench`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en safetensors o GGUF la integracion con esos motores requeriria conversion manual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Grimoire (assistant8) | 35,85 M | no disponible | ru | Apache 2.0 | `.pt` (fp16) | Fine-tuning recurrente sobre Qwen2.5-0.5B-Instruct; tool-use en ruso |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 tokens (segun documentacion publica de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF | Modelo base del que parte; mayor calidad y ecosistema de despliegue |
| SmolLM2-135M-Instruct | 135 M | 8.192 tokens (segun documentacion publica) | ingles principalmente | Apache 2.0 | safetensors, GGUF | Alternativa compacta para instrucciones en ingles |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens (segun documentacion publica) | ingles | Apache 2.0 | safetensors, GGUF | Mayor tamano y calidad, pero sin soporte nativo de ruso ni tool-use |

La comparativa debe interpretarse con cautela: Grimoire no persigue calidad de produccion, sino demostrar una arquitectura. Frente a su modelo base, pierde parametros y calidad pero gana un formato de tool-use explicito en ruso. Frente a SmolLM2 y TinyLlama, carece de pesos en formatos estandar y de benchmarks publicos.

## Limitaciones y advertencias

- El propio autor advierte que el modelo es "diminuto y entrenado en tiempo limitado": es una demostracion de la arquitectura, no un modelo con calidad comparable a Qwen.
- Los ejemplos de la model card muestran fallos claros: busquedas con consultas incorrectas ("Спасибо" en lugar de "Москва"), respuestas incoherentes tras el tool response y perdida de coherencia en consultas factuales.
- Riesgo elevado de alucinacion en conocimiento factual y en el uso de herramientas; no debe usarse en produccion sin validacion humana.
- Soporte limitado al ruso; no se declara ni se evalua el rendimiento en castellano u otros idiomas.
- Longitud de contexto no documentada; no se recomienda para conversaciones de contexto largo.
- Pesos unicamente en `.pt` (fp16); no hay safetensors, GGUF ni cuantizaciones oficiales, lo que dificulta el despliegue en motores estandar.
- Sin resultados de benchmarks publicos ni evaluaciones independientes; las metricas reportadas son solo de validacion interna.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias de calidad hace desaconsejable su uso en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopcion nula y ausencia de validacion por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/embrelgrim/grimoire
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Script de entrenamiento citado: `build_neuroset.py` (no se proporciona URL publica en la informacion disponible)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
