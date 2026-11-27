# aniqsfwn/Llama-3.1-8B-triage-anthropic

## Resumen

Llama-3.1-8B-triage-anthropic es un adaptador LoRA (entrenado con QLoRA sobre Unsloth) que se aplica sobre el modelo base unsloth/Llama-3.1-8B-Instruct. Lo desarrolla aniqsfwn y su funcion es muy concreta: clasificar mensajes de clientes de una tienda online malasia en tres campos estructurados (categoria, urgencia y necesidad de intervencion humana) y devolver exclusivamente JSON. No es un modelo de proposito general, sino un clasificador de triaje empaquetado como adaptador PEFT.

El problema que resuelve es el enrutamiento automatico de tickets de soporte: dado un mensaje libre del cliente, el adaptador decide si es una incidencia de entrega, devolucion, fallo de producto, pago, acceso a cuenta o consulta general, y asigna un nivel de urgencia. Su relevancia practica esta en que demuestra que con ~900 ejemplos etiquetados y 17 minutos de entrenamiento en una unica GPU L4 se puede pasar de un 36 % de acierto completo en el modelo base a un 94 % en el conjunto de validacion.

El modelo conserva la arquitectura y el contexto del Llama 3.1 8B Instruct original (8.000 millones de parametros, ventana de 128.000 tokens en el modelo base), pero el adaptador esta pensado para inferencia con max_seq_length de 2.048 tokens y temperatura 0. El repositorio ocupa 0,2 GB, lo que corresponde solo a los pesos del adaptador, no al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA sobre el modelo base |
| Parametros totales | 8.000 millones (modelo base Llama 3.1 8B); el adaptador LoRA es una fraccion (rank 16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens configurados en entrenamiento e inferencia (el modelo base soporta hasta 128.000) |
| Tipos de cuantizacion | QLoRA 4-bit para entrenamiento; el autor recomienda load_in_4bit=True en inferencia; otras cuantizaciones no documentadas |
| Idiomas soportados | en, ms (ingles y malayo); datos de entrenamiento incluyen tambien mandarin, hinglish, tamil, frances y espanol en pequenas cantidades |
| Licencia | Llama 3.1 Community License (codigo del repositorio GitHub bajo MIT) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre unsloth/Llama-3.1-8B-Instruct cuantizado a 4 bits. Los hiperparametros documentados son: LoRA con rank 16, alpha 16, learning rate 2e-4, 3 epocas (399 pasos), batch de 8, longitud maxima de 2.048 tokens y calculo de perdida solo sobre las respuestas. El entrenamiento se ejecuto en una unica NVIDIA L4 (22,5 GB de VRAM) y duro aproximadamente 17 minutos. El autor justifica QLoRA porque cabe en esa GPU y porque ~900 ejemplos son suficientes para un adaptador de este tipo.

Los datos de entrenamiento son 908 mensajes etiquetados (1.057 lineas de entrenamiento): 207 procedentes de datos de un curso y 701 redactados por el equipo. La composicion linguistica es mayoritariamente ingles y malayo/manglish, con mandarin y unas pocas muestras en hinglish, tamil, frances y espanol. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre respuestas JSON con un system prompt fijo. La innovacion practica no esta en la arquitectura sino en el formato de salida estrictamente JSON y en el uso de Unsloth para acelerar el ajuste.

## Capacidades

- Clasificacion de mensajes de clientes en seis categorias: delivery, refund_return, product_fault, payment_billing, account_access y general_enquiry.
- Asignacion de urgencia en tres niveles: low, medium, high.
- Decision binaria de needs_human (si requiere intervencion humana).
- Salida estricta en JSON, sin texto adicional, cuando se usa el system prompt incluido y temperatura 0.
- Comprension multilingue limitada: ingles y malayo/manglish principal, con trazas de mandarin y otras lenguas en entrenamiento.
- Conversacion multi-turno heredada del modelo base, aunque el uso previsto es de un solo mensaje por clasificacion.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en el adaptador.

## Casos de uso

- Triaje automatico de tickets de soporte: el adaptador recibe el mensaje del cliente y devuelve categoria, urgencia y needs_human en JSON, lo que permite enrutar cada ticket al equipo correcto sin intervencion manual.
- Deteccion de incidencias criticas: mensajes como un producto que se incendia se clasifican como product_fault con urgencia high y needs_human true, lo que dispara escalado inmediato a un agente humano.
- Enrutamiento de reclamaciones de pago: mensajes de doble cobro o fallos de facturacion se clasifican como payment_billing para pasarlos al equipo financiero.
- Gestion de devoluciones y reembolsos: refund_return permite separar solicitudes de devolucion del resto de consultas y aplicar el flujo de postventa correspondiente.
- Soporte en mercados del sudeste asiatico: al cubrir ingles y malayo/manglish, es util para tiendas online que atienden clientes de Malasia con mezcla de idiomas.
- Preprocesado para pipelines de atencion al cliente: la salida JSON se integra directamente en sistemas de ticketing (Zendesk, Freshdesk) o colas de mensajeria para priorizar y asignar casos.
- Filtrado de consultas generales: general_enquiry permite desviar preguntas no urgentes a respuestas automaticas o FAQs, reduciendo la carga del equipo humano.

## Benchmarks y rendimiento

Evaluacion del autor sobre 50 casos reservados con temperatura 0:

| Modelo | Los tres campos correctos | Categoria | Urgencia | Recall needs_human | Solo JSON |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct sin ajustar | 36 % | 92 % | 46 % | 95 % | 4 % |
| Este adaptador | 94 % | 100 % | 94 % | 95 % | 100 % |

Ademas, en la clasificacion de 100 casos ocultos del leaderboard del curso, el modelo sin ajustar obtiene un 31 % y este adaptador un 88 %. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base en 4-bit ocupa aproximadamente 5-6 GB; con el adaptador y contexto de 2.048 tokens, la inferencia cabe holgadamente en GPUs de 8-12 GB.
- GPU recomendadas: NVIDIA L4 (la usada en entrenamiento), A100, H100 para despliegues de mayor throughput; RTX 4090, RTX 3090 y RTX 4080 suficientes para inferencia en 4-bit.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion 4-bit (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 4070).
- Opciones de despliegue: PEFT con Transformers, Unsloth (FastLanguageModel), vLLM con soporte LoRA, TGI con adaptadores; llama.cpp y Ollama requeririan fusionar el adaptador en el modelo base y convertirlo a GGUF, lo que no esta documentado por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica ~17 minutos de entrenamiento en una L4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Llama-3.1-8B-triage-anthropic) | 8B (LoRA r16) | 2.048 configurados | 94 % tres campos correctos, 100 % JSON | Llama 3.1 Community | Hugging Face + GitHub |
| Llama-3.1-8B-Instruct sin ajustar | 8B | 128.000 | 36 % tres campos correctos, 4 % JSON | Llama 3.1 Community | Meta / Hugging Face |
| Modelos de clasificacion dedicados (p. ej. DeBERTa) | ~0,1-0,4B | 512 | No disponible para esta tarea concreta | MIT / Apache segun variante | Hugging Face |

La comparativa con clasificadores BERT pequenos es cualitativa: no hay datos publicados del autor sobre ellos en esta tarea. Frente al modelo base, la mejora es clara en adherencia al formato JSON (4 % a 100 %) y en acierto completo (36 % a 94 %).

## Limitaciones y advertencias

- Debilidad al contar dias entre fechas, segun reconoce el autor.
- A veces trata un primer mensaje como si fuera un contacto repetido.
- Pocas filas de entrenamiento en algunos idiomas (tamil, frances, espanol), por lo que el rendimiento en esas lenguas es poco fiable.
- Riesgo de alucinacion en la clasificacion: un caso urgente mal clasificado (incendio, fraude, lesion) puede causar dano; el autor recomienda revision humana.
- El adaptador hereda los sesgos del Llama 3.1 8B Instruct base.
- Licencia Llama 3.1 Community: restricciones de uso comercial y obligaciones de atribucion; el codigo del repositorio GitHub es MIT, pero los pesos del adaptador y del modelo base estan sujetos a la licencia de Llama.
- Requiere el system prompt especifico y temperatura 0 para obtener el JSON esperado; fuera de ese formato el rendimiento puede degradarse.
- Contexto efectivo limitado a 2.048 tokens en la configuracion de entrenamiento, aunque el modelo base soporte mas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/aniqsfwn/Llama-3.1-8B-triage-anthropic
- GitHub (codigo, datos y write-up): https://github.com/aniqsfwn/Llama-3.1-8B-triage-anthropic
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Unsloth: https://github.com/unslothai/unsloth
