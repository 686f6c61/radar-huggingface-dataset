# AlexanderIvS/Qwen2.5-0.5B-Support-Bot-GGUF-Quantizations

## Resumen

Qwen2.5-0.5B-Support-Bot-GGUF-Quantizations es una coleccion de pesos cuantizados en formato GGUF de un ajuste fino mediante LoRA sobre Qwen/Qwen2.5-0.5B-Instruct, orientado a tareas de atencion al cliente. Lo publica el usuario AlexanderIvS y su proposito es convertir un modelo base pequeno en un chatbot de soporte que sigue un formato de respuesta estructurado (pasos numerados, tono profesional, vocabulario de dominio como pedidos, reembolsos y envios). El ajuste se realizo sobre el dataset Bitext Customer Support, un corpus de pares instruccion/respuesta en ingles de un solo turno.

El modelo base es un transformer denso de Qwen2.5 con 494.032.768 parametros totales (aproximadamente 0,5 mil millones), lo que lo situa en la gama ultra-ligera. El repositorio ocupa 1,9 GB e incluye tres variantes: fp16 (948 MB), Q8_0 (506 MB) y Q4_K_M (379 MB). La licencia es MIT, lo que permite uso comercial sin restricciones adicionales, y el unico idioma declarado es el ingles.

Su relevancia practica esta en el binomio tamano-rendimiento: con 379 MB en Q4_K_M puede ejecutarse en CPU modesta o en GPUs de gama baja con velocidades de 36,5 tok/s en un Xeon E3-1270 v2 con DDR3 y 280 tok/s en una RTX 2070S, manteniendo una perplejidad de 2,368 frente a 2,324 del fp16. Es un caso de estudio de ajuste fino de bajo coste para dominios acotados, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | fp16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer denso decoder-only con atencion causal estandar. Sobre esa base se aplico un ajuste fino con LoRA (adaptadores de bajo rango) entrenado con el dataset bitext/Bitext-customer-support-llm-chatbot-training-dataset, compuesto por 26.872 pares instruction/response en ingles y de un solo turno. No se especifica en la informacion disponible el rango de LoRA, la tasa de aprendizaje, el numero de epocas ni la composicion exacta del corpus mas alla del dataset citado. Tampoco se documenta el uso de RLHF o DPO.

La innovacion tecnica destacable no esta en la arquitectura, sino en la estrategia de cuantizacion y en el diseno de la salida: el modelo genera placeholders del tipo `{{Order Number}}` o `{{Customer Support Phone Number}}` de forma deliberada, de modo que un backend sustituya esos valores desde una base de datos. Esto evita que el modelo alucine datos transaccionales reales. Las tres variantes GGUF se evaluaron con perplejidad sobre el dataset completo formateado con la plantilla de chat de Qwen, y el autor documenta el comportamiento diferencial de cada formato segun el hardware (cuello de botella de memoria en CPU, de des-cuantizacion en Pascal y de lanzamiento de kernels en Turing).

## Capacidades

- Generacion de texto conversacional en ingles para consultas de atencion al cliente de un solo turno.
- Seguimiento de formato estructurado: respuestas con pasos numerados y tono profesional de soporte.
- Vocabulario de dominio: pedidos, reembolsos, envios, direcciones y quejas.
- Generacion controlada de placeholders (`{{Order Number}}`, `{{Customer Support Phone Number}}`) para sustitucion posterior por un backend.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta agentes ni razonamiento multi-paso; el autor indica explicitamente que no hace dialogo multi-turno con estado.
- No soporta peticiones multi-problema (varias incidencias en un mismo mensaje).
- Capacidad multilingue limitada al ingles; un fork en ruso esta planificado pero no disponible.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Respuestas de primer nivel en un help desk: el modelo gestiona consultas frecuentes de un solo turno (cambios de direccion, estado de pedido, politica de reembolso) y devuelve pasos numerados que el agente humano o el cliente pueden seguir directamente. Es adecuado porque el dataset Bitext cubre exactamente ese reparto de intenciones.
- Generacion de plantillas de respuesta con huecos: al emitir placeholders en lugar de datos concretos, un servicio backend puede inyectar el numero de pedido o el telefono de soporte desde la base de datos, eliminando el riesgo de datos inventados en la respuesta final.
- Despliegue en entornos sin GPU: con Q4_K_M (379 MB) corre a 36,5 tok/s en un Xeon E3-1270 v2 con DDR3, lo que permite montar un endpoint de soporte en un servidor de bajo coste o en un contenedor pequeno.
- Clasificacion y reescritura de consultas de soporte: el ajuste sobre vocabulario de dominio permite normalizar o reformular mensajes de clientes antes de enrutarlos a un sistema de tickets, usando el modelo como preprocesador barato.
- Prototipado rapido de flujos de atencion al cliente: sirve para validar el formato de respuesta y la experiencia de usuario antes de invertir en un modelo mayor; la licencia MIT y el tamano reducido permiten iterar sin coste de infraestructura.
- Inferencia en el borde o en local: con 280 tok/s en una RTX 2070S de 8 GB y 87 tok/s en una GTX 1050 Ti de 4 GB, es viable integrarlo en una aplicacion de escritorio o en un dispositivo con GPU integrada para asistencia offline.
- Servicio HTTP ligero con llama-server: el repositorio documenta el arranque con `llama-server -m model-Q4_K_M.gguf --host 127.0.0.1 --port 8080`, lo que permite exponerlo como API compatible con clientes HTTP en un pipeline de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta perplejidad sobre el dataset Bitext y velocidad de inferencia:

| Formato | Tamano | PPL | Delta PPL | Velocidad (RTX 2070S) |
|---|---|---|---|---|
| fp16 | 948 MB | 2,324 | baseline | 170 tok/s |
| Q8_0 | 506 MB | 2,326 | +0,11% | 280 tok/s |
| Q4_K_M | 379 MB | 2,368 | +1,91% | 280 tok/s |

| Hardware | fp16 | Q8_0 | Q4_K_M | Cuello de botella |
|---|---|---|---|---|
| RTX 2070S (8 GB, Turing) | 170 tok/s | 280 tok/s | 280 tok/s | lanzamiento de kernels |
| GTX 1050 Ti (4 GB, Pascal) | 51 tok/s | 91 tok/s | 87 tok/s | computo (des-cuantizacion) |
| Xeon E3-1270 v2 (CPU, DDR3) | 20 tok/s | 34,5 tok/s | 36,5 tok/s | ancho de banda de memoria |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para fp16 (948 MB de pesos), aproximadamente 0,5 GB para Q8_0 y 0,4 GB para Q4_K_M; el contexto adicional anade una cantidad no especificada en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; el autor valido RTX 2070S (8 GB) y GTX 1050 Ti (4 GB).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta o integrada moderna, e incluso en CPU sola.
- Opciones de despliegue: llama.cpp (CLI `llama-cli` y servidor `llama-server`), Ollama (mediante Modelfile con `temperature 0.1` y stop token `<|im_end|>`), LM Studio (importacion del GGUF) y cualquier runtime compatible con GGUF.
- Latencia y throughput: 280 tok/s en RTX 2070S con Q8_0 o Q4_K_M; 91 tok/s en GTX 1050 Ti con Q8_0; 36,5 tok/s en Xeon E3-1270 v2 con Q4_K_M. En Pascal, Q8_0 supera ligeramente a Q4_K_M (91 frente a 87 tok/s) por el coste de des-cuantizacion de los cuantos mixtos; en CPU, Q4_K_M supera a Q8_0 (+6%) por ancho de banda.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen2.5-0.5B-Support-Bot (este) | 494 M | no disponible | en | MIT | GGUF | Ajuste LoRA para soporte, un solo turno |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | no disponible | multilingue | Apache 2.0 (segun el modelo base) | safetensors, GGUF | Modelo base generalista sin ajuste de dominio |
| SmolLM2-360M-Instruct | 360 M | no disponible | en | Apache 2.0 | safetensors, GGUF | Alternativa ultra-ligera generalista de Hugging Face |
| TinyLlama-1.1B-Chat | 1,1 B | no disponible | en | Apache 2.0 | safetensors, GGUF | Mayor tamano, sin especializacion en soporte |

La comparativa se limita a datos de catalogo; no hay benchmarks comunes publicados en la informacion disponible que permitan contrastar calidad entre estos modelos.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas; un fork en ruso esta planificado pero no disponible.
- Un solo turno: no mantiene estado en dialogos multi-turno, lo que limita su uso en conversaciones reales de soporte sin una capa externa de gestion de contexto.
- Sin peticiones multi-problema: no maneja varias incidencias en un mismo mensaje.
- Riesgo de alucinacion en datos transaccionales: aunque el diseno de placeholders lo mitiga, nada impide que el modelo invente valores si se le pide explicitamente un dato concreto.
- Sesgos: no se documenta ninguna evaluacion de sesgo en la informacion disponible; al entrenarse sobre un dataset de soporte en ingles, puede reflejar sesgos de ese corpus.
- Longitud de contexto no documentada: se desconoce la ventana efectiva tras el ajuste, lo que dificulta planificar prompts largos.
- Calidad acotada por el modelo base de 0,5 B: razonamiento complejo, matematicas y codigo quedan fuera de su alcance.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene verificar las condiciones del dataset Bitext y del modelo base Qwen2.5 para el caso concreto de produccion.
- El repositorio tiene 309 descargas y 1 like en el momento de la consulta, con actualizacion reciente; no hay un historial largo de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AlexanderIvS/Qwen2.5-0.5B-Support-Bot-GGUF-Quantizations
- GitHub del proyecto (descripcion, entrenamiento y evaluacion): https://github.com/AlexanderSIv/Qwen-support-LoRa
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
