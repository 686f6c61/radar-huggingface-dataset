# OrionLLM/GRM-3.2-Turf

## Resumen

GRM-3.2-Turf es un modelo de lenguaje de 1.170 millones de parametros (1,17B) desarrollado por OrionLLM como un ajuste fino (finetune) del modelo LiquidAI/LFM2.5-1.2B-Thinking. Esta disenado especificamente para entornos locales con recursos limitados: dispositivos moviles, sistemas embebidos y despliegues on-device donde la memoria y la potencia de computo son restricciones criticas. Su propuesta de valor no es competir en conocimiento bruto con modelos mayores, sino ofrecer razonamiento estructurado, seguimiento de instrucciones y uso de herramientas con una huella de memoria minima.

El modelo se presenta como sucesor de GRM-2.6-Air-Opus dentro de la familia GRM-3.2, y hereda la arquitectura LFM2 (Liquid Foundation Model 2) del modelo base de LiquidAI, incluyendo su modo de razonamiento explicito ("thinking"). Con licencia Apache 2.0 y pesos en formato safetensors, esta pensado para integrarse en pipelines de agentes ligeros y asistentes conversacionales que deben ejecutarse sin GPU dedicada o en GPUs de consumo.

La relevancia actual del modelo radica en la creciente demanda de IA generativa ejecutable en el borde (edge AI): un modelo de poco mas de un billon de parametros que conserva capacidades de tool calling y razonamiento multi-paso permite construir agentes locales sin depender de APIs en la nube. Con 264 descargas y 12 likes en Hugging Face en el momento de la consulta, es un proyecto de nicho pero activo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model 2), heredada de LiquidAI/LFM2.5-1.2B-Thinking; detalles internos no disponibles |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; el formato safetensors permite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GRM-3.2-Turf es un ajuste fino del modelo LiquidAI/LFM2.5-1.2B-Thinking, que pertenece a la familia LFM2 de LiquidAI. La model card no detalla la arquitectura interna mas alla de la etiqueta `lfm2`, por lo que no se especifica si emplea componentes hibridos (convolucionales o de espacio de estados) o un transformer convencional, ni la composicion exacta de la atencion. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se aplicaron tecnicas de RLHF, DPO o preferencia directa.

La innovacion declarada por el autor se centra en el ajuste fino para razonamiento estructurado y seguimiento de instrucciones sobre el modelo base, con enfasis en la eficiencia en hardware de bajos recursos. El modelo conserva el modo "Thinking" del base, orientado a la generacion de cadenas de razonamiento antes de la respuesta final. No se dispone de informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia implementadas en el ajuste.

## Capacidades

- Generacion de texto conversacional y razonamiento estructurado, con modo de pensamiento ("thinking") heredado del modelo base.
- Seguimiento de instrucciones de alta fidelidad, incluyendo prompts restringidos, instrucciones de sistema complejas y formato preciso de respuestas.
- Tool calling y function calling, orientado a flujos de trabajo agenticos en entornos ligeros.
- Razonamiento multi-paso y resolucion de problemas, segun la model card.
- Ejecucion on-device con baja latencia y huella de memoria reducida.
- Capacidades multilingues: no especificadas en la informacion disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Asistentes conversacionales on-device: el modelo puede gestionar dialogos multi-turno en aplicaciones moviles o de escritorio sin conexion a la nube, gracias a su tamano de 1,17B parametros y su orientacion a hardware de bajos recursos.
- Agentes locales con tool calling: integrado en un runtime ligero, puede invocar funciones (consultas a bases de datos locales, APIs del sistema operativo, lectores de ficheros) en flujos agenticos de un solo dispositivo.
- Automatizacion de soporte en entornos embebidos: en quioscos, terminales de punto de venta o dispositivos IoT con capacidad de computo limitada, el modelo puede gestionar consultas frecuentes y escalar a un modelo mayor solo cuando sea necesario.
- Generacion de respuestas con formato estricto: su rendimiento declarado en IFEval (91,2) lo hace adecuado para tareas que exigen salidas JSON, plantillas o formatos regulados, como la generacion de informes estructurados en pipelines de datos.
- Razonamiento asistido en herramientas de desarrollo: puede emplearse como motor de sugerencias y explicaciones de codigo en IDEs ligeros o entornos de CI, donde el coste de invocar un modelo en la nube es prohibitivo.
- Filtrado y clasificacion de texto en el borde: para moderacion de contenido, etiquetado o enrutamiento de consultas en dispositivos con poca memoria, aprovechando su bajo coste de inferencia.
- Prototipado rapido de agentes: por su licencia Apache 2.0 y su tamano, sirve como banco de pruebas para disenar flujos agenticos antes de migrar a modelos mayores.

## Benchmarks y rendimiento

Los datos publicados en la model card (parcialmente truncados en la informacion disponible) son los siguientes:

| Benchmark | GRM-3.2-Turf | LFM2.5-1.2B-Thinking | Qwen3.5-2B | Gemma-4-E2B |
|---|---|---|---|---|
| MMLU-Pro | 56,2 | 49,65 | 66,5 | 60,0 |
| GPQA Diamond | 42,4 | 37,86 | 51,6 | 43,4 |
| IFEval | 91,2 | 88,42 | 78,6 | — |
| IFBench | No disponible (tabla truncada) | No disponible | No disponible | No disponible |

El modelo supera a su base en MMLU-Pro (+6,55 puntos), GPQA Diamond (+4,54) e IFEval (+2,78), y lidera la comparativa en seguimiento de instrucciones (IFEval) frente a Qwen3.5-2B y Gemma-4-E2B. En conocimiento y razonamiento cientifico queda por detras de Qwen3.5-2B, que tiene mas parametros. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,3-2,5 GB solo para los pesos, mas overhead de contexto y KV cache; en la practica, unos 3-4 GB para contextos moderados.
- Cuantizacion a 8 bits: en torno a 1,2-1,5 GB de VRAM; a 4 bits: aproximadamente 0,7-1 GB, lo que permite ejecucion en CPU con llama.cpp u Ollama.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM (RTX 3050, RTX 4060, GTX 1660 Super, etc.); en GPUs profesionales, A100/H100 no son necesarias pero funcionan sobradamente. Tambien es viable en GPUs integradas y en CPU moderna.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas actuales e incluso en muchos SoC moviles con cuantizacion agresiva.
- Opciones de despliegue: safetensors con transformers (PyTorch), vLLM y TGI para serving, llama.cpp/Ollama para CPU y cuantizacion GGUF (previa conversion, ya que el repo solo publica safetensors). No se documentan integraciones oficiales con ninguno de estos runtimes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | IFEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GRM-3.2-Turf | 1,17B | No disponible | 56,2 | 91,2 | Apache 2.0 | Hugging Face |
| LFM2.5-1.2B-Thinking (base) | 1,2B | No disponible | 49,65 | 88,42 | No disponible en esta ficha | Hugging Face |
| Qwen3.5-2B | ~2B | No disponible | 66,5 | 78,6 | No disponible en esta ficha | Hugging Face |
| Gemma-4-E2B | No disponible | No disponible | 60,0 | — | No disponible en esta ficha | Hugging Face |

GRM-3.2-Turf se posiciona como la opcion con mejor seguimiento de instrucciones del grupo (IFEval 91,2), a costa de menor conocimiento enciclopedico que Qwen3.5-2B (MMLU-Pro 56,2 frente a 66,5). Frente a su modelo base, la mejora es consistente en las tres metricas publicadas. Los datos de contexto y licencia de los competidores no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un ajuste fino de un modelo base pequeno, es probable que herede sesgos del corpus de entrenamiento original, pero no hay informacion concreta.
- Riesgo de alucinacion: elevado en tareas de conocimiento factual, dado su tamano (1,17B) y su MMLU-Pro de 56,2; no debe usarse como fuente de verdad sin verificacion.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados, lo que impide garantizar su comportamiento en produccion multilingue o con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base LiquidAI/LFM2.5-1.2B-Thinking, ya que las obligaciones de la licencia original pueden propagarse al derivado.
- Advertencias para produccion: la model card esta parcialmente truncada en la informacion disponible (la tabla de benchmarks se corta en IFBench), no hay datos de latencia ni throughput, y el modelo solo se distribuye en safetensors, por lo que la conversion a GGUF para despliegue en CPU corre a cargo del usuario.
- El modelo se presenta como "lightweight" y orientado a razonamiento; no se recomienda para tareas que exijan conocimiento especializado profundo o contextos muy largos sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OrionLLM/GRM-3.2-Turf
- Coleccion GRM-3.2: https://huggingface.co/collections/OrionLLM/grm-32
- Demo de chat: https://grape.skinnertopia.com/chat
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
