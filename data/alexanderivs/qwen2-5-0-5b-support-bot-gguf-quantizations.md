# AlexanderIvS/Qwen2.5-0.5B-Support-Bot-GGUF-Quantizations

## Resumen

Qwen2.5-0.5B-Support-Bot-GGUF-Quantizations es un conjunto de pesos en formato GGUF derivados de un ajuste fino con LoRA sobre Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario AlexanderIvS. El modelo base es un transformer decoder-only de 494.032.768 parametros (aproximadamente 0,5 mil millones) desarrollado por Alibaba Qwen, y el ajuste fino se ha realizado sobre el dataset Bitext Customer Support LLM Chatbot Training Dataset para especializarlo en respuestas de atencion al cliente en ingles.

El autor distribuye tres variantes cuantizadas: fp16 (948 MB), Q8_0 (506 MB) y Q4_K_M (379 MB), todas ejecutables con llama.cpp, Ollama y LM Studio. La relevancia de esta publicacion es practica: demuestra un flujo completo de ajuste fino de bajo coste y cuantizacion para un dominio vertical concreto (soporte al cliente), con mediciones de perplejidad y velocidad sobre hardware modesto (RTX 2070S, GTX 1050 Ti y una CPU Xeon con DDR3).

No se trata de un modelo de proposito general ni de una nueva arquitectura: es una especializacion de un modelo pequeno orientada a despliegues ligeros en entornos con recursos limitados, con licencia MIT y un unico idioma soportado (ingles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino con LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 (0,49 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | fp16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors en Qwen/Qwen2.5-0.5B-Instruct |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con atencion causal estandar, sin componentes MoE ni mecanismos hibridos. Sobre esa base se aplico un ajuste fino con LoRA usando el dataset Bitext Customer Support LLM Chatbot Training Dataset, que contiene 26.872 pares instruction/response en ingles centrados en consultas de atencion al cliente (pedidos, reembolsos, envios, quejas). El resultado se fusiono con los pesos base y se convirtio a GGUF en tres precisiones.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de su origen, ni si hubo etapas de RLHF o DPO adicionales sobre el ajuste supervisado. La innovacion tecnica destacable no esta en la arquitectura sino en el diseno de salida: el modelo genera placeholders del tipo `{{Order Number}}` o `{{Customer Support Phone Number}}` que un backend debe sustituir con datos reales de la base de datos, evitando que el modelo invente identificadores. Las mediciones de perplejidad se realizaron sobre las 26.872 parejas del dataset formateadas con la plantilla de chat de Qwen.

## Capacidades

- Generacion de texto conversacional en ingles orientada a soporte al cliente.
- Seguimiento de formato estructurado: respuestas con pasos numerados y tono profesional.
- Vocabulario de dominio: pedidos, reembolsos, envios, cambios de direccion y quejas.
- Generacion de placeholders para datos dinamicos (`{{Order Number}}`, `{{Customer Support Phone Number}}`), pensados para sustitucion por backend.
- Consultas de un solo turno (single-turn Q&A): un mensaje de usuario, una respuesta.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No soporta vision, audio ni modo de razonamiento explicito (thinking mode).
- No soporta conversaciones multi-turno con conservacion de estado.
- No soporta peticiones con multiples problemas en un mismo mensaje.
- No soporta idiomas distintos del ingles (el autor menciona un fork en ruso como trabajo futuro).

## Casos de uso

- Respuestas automaticas de FAQ en tiendas online: el modelo responde a preguntas frecuentes sobre envios, devoluciones y cuentas con pasos concretos, y su tamano de 379 MB en Q4_K_M permite ejecutarlo en el mismo servidor web sin GPU dedicada.
- Primera linea de atencion al cliente en mesa de ayuda: clasifica y responde consultas sencillas de un solo turno antes de escalar a un agente humano, reduciendo el volumen de tickets repetitivos.
- Generacion de borradores para agentes humanos: el operador recibe una respuesta estructurada con pasos y placeholders que completa con datos del pedido, acelerando el tiempo de respuesta.
- Despliegue en dispositivos de borde o hardware antiguo: con 36,5 tok/s en una CPU Xeon E3-1270 v2 con DDR3 y 87-91 tok/s en una GTX 1050 Ti de 4 GB, es viable en quioscos, terminales de tienda o mini-PC sin GPU moderna.
- Prototipado rapido de chatbots de dominio: sirve como base para validar flujos de soporte y plantillas de respuesta antes de invertir en modelos mayores o en un pipeline RAG completo.
- Integracion en pipelines de sustitucion de plantillas: el backend detecta los marcadores `{{...}}` en la respuesta y los rellena desde la base de datos de pedidos, garantizando que el modelo nunca exponga datos inventados.
- Servicio HTTP ligero con llama-server: se puede exponer una API compatible con OpenAI mediante `llama-server` en un contenedor pequeno, con temperatura baja (0,1 recomendada por el autor) para respuestas deterministas.

## Benchmarks y rendimiento

El autor publica mediciones de perplejidad sobre el dataset Bitext completo (26.872 pares) y velocidad de inferencia en tres configuraciones de hardware. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Formato | Tamano | PPL | Delta PPL | RTX 2070S (8 GB) | GTX 1050 Ti (4 GB) | Xeon E3-1270 v2 (CPU, DDR3) |
|---|---|---|---|---|---|---|
| fp16 | 948 MB | 2,324 | baseline | 170 tok/s | 51 tok/s | 20 tok/s |
| Q8_0 | 506 MB | 2,326 | +0,11 % | 280 tok/s | 91 tok/s | 34,5 tok/s |
| Q4_K_M | 379 MB | 2,368 | +1,91 % | 280 tok/s | 87 tok/s | 36,5 tok/s |

Observaciones del autor: en CPU con DDR3, Q4_K_M es un 6 % mas rapido que Q8_0 porque la inferencia esta limitada por el ancho de banda de memoria; en la GTX 1050 Ti (Pascal), Q8_0 supera ligeramente a Q4_K_M (91 frente a 87 tok/s) porque el cuello de botella pasa a ser el coste de des-cuantizacion de los quantos mixtos; en la RTX 2070S (Turing), ambas variantes empatan a 280 tok/s por el overhead de lanzamiento de kernels.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp16, aproximadamente 0,6 GB en Q8_0 y 0,5 GB en Q4_K_M, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor ha validado RTX 2070S (8 GB) y GTX 1050 Ti (4 GB).
- Cabe en practicamente cualquier GPU de consumo, incluidas integradas modernas y GPUs de gama baja de mas de una decada.
- Tambien es viable en CPU: 36,5 tok/s en un Xeon E3-1270 v2 con DDR3 usando Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (via Modelfile), LM Studio. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput: 170-280 tok/s en RTX 2070S, 51-91 tok/s en GTX 1050 Ti, 20-36,5 tok/s en CPU Xeon con DDR3, segun formato de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Qwen2.5-0.5B-Support-Bot (este) | 0,49 B | no disponible | en | MIT | GGUF | Soporte al cliente (LoRA + Bitext) |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49 B | no disponible | multilingue | Apache 2.0 (modelo base Qwen2.5) | safetensors, GGUF | Proposito general |
| Qwen/Qwen2.5-0.5B-Instruct-GGUF | ~0,6 B | no disponible | multilingue | Apache 2.0 | GGUF | Proposito general cuantizado |

La diferencia principal frente al modelo base es la especializacion: el Support-Bot sigue el formato de respuesta de soporte y genera placeholders, mientras que Qwen2.5-0.5B-Instruct es un asistente general multilingue. A cambio, el modelo ajustado pierde capacidades fuera del dominio (multi-turno, otros idiomas, tool calling) y su licencia MIT es mas permisiva que la Apache 2.0 del modelo base, aunque conviene verificar las obligaciones heredadas de la licencia del modelo original. No se dispone de datos de benchmarks comparativos entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no responde correctamente en castellano ni en otros idiomas; el autor menciona un fork en ruso como trabajo futuro no publicado.
- Solo consultas de un solo turno: no mantiene estado entre mensajes, por lo que no sirve para conversaciones multi-turno sin un orquestador externo que reconstruya el contexto.
- No maneja peticiones con multiples problemas en un mismo mensaje.
- Riesgo de alucinacion en datos concretos: aunque el diseno de placeholders mitiga la invencion de numeros de pedido o telefonos, el modelo puede generar pasos o politicas genericas no verificadas.
- Sesgos heredados del dataset Bitext y del modelo base Qwen2.5, no evaluados en la informacion disponible.
- Licencia MIT declarada por el autor, pero el modelo base Qwen2.5 se distribuye bajo Apache 2.0; conviene revisar las condiciones de atribucion antes de un uso comercial.
- Sin resultados de benchmarks estandar ni evaluaciones humanas publicadas; la unica metrica objetiva es la perplejidad sobre el propio dataset de entrenamiento, lo que puede sobreestimar la calidad real en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni senales de mantenimiento.
- La model card esta parcialmente en ruso y el contenido del README aparece truncado en la informacion disponible; algunos detalles de entrenamiento y evaluacion pueden faltar.
- No apto para tareas de razonamiento complejo, codigo o matematicas: el ajuste fino sobre un dataset de soporte degrada previsiblemente esas capacidades respecto al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/AlexanderIvS/Qwen2.5-0.5B-Support-Bot-GGUF-Quantizations
- GitHub del proyecto (entrenamiento y evaluacion): https://github.com/AlexanderSIv/Qwen-support-LoRa
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- GGUF oficial del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
