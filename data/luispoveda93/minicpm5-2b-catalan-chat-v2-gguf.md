# luispoveda93/MiniCPM5-2B-catalan-chat-v2-GGUF

## Resumen

MiniCPM5-2B-catalan-chat-v2-GGUF es una conversion a formato GGUF del modelo luispoveda93/MiniCPM5-2B-catalan-chat-v2, un ajuste fino conversacional en catalan desarrollado por el usuario luispoveda93. El modelo parte de openbmb/MiniCPM5-2B, un transformer de arquitectura Llama con 2.516.756.480 parametros y un vocabulario de 130.560 tokens, sobre el que se aplicaron dos rondas sucesivas de LoRA: la primera para adaptacion al catalan y la segunda, aqui documentada, centrada especificamente en el comportamiento conversacional multi-turno.

La segunda ronda se entreno sobre 23.400 conversaciones multi-turno en catalan extraidas del dataset BSC-LT/ALIA-2606-SFT (CC-BY-4.0), con LoRA de rango 32, alpha 64, learning rate 1e-4, una epoca y aproximadamente 326 pasos. El resultado reportado por el autor es una perdida de evaluacion final de 1,383 y una precision de token de 0,704. La relevancia de esta ficha radica en que cubre un nicho poco poblado: modelos conversacionales ligeros y desplegables localmente para catalan, con cuantizaciones listas para llama.cpp y Ollama.

El repositorio incluye tres cuantizaciones (Q4_K_M de 1,6 GB, Q8_0 de 2,7 GB y F16 de 5,0 GB) y la plantilla de chat embebida en los metadatos del GGUF. Se trata de un modelo de autor individual, sin descargas ni valoraciones en el momento de la consulta, y con un linaje de licencias que incluye componentes no comerciales, un punto critico para cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (segun model card: "Llama architecture, vocab 130,560") |
| Parametros totales | 2.516.756.480 (2,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 |
| Idiomas soportados | Catalan (ca) |
| Licencia | other (modelo base Apache-2.0; datos de ronda 2 CC-BY-4.0; el linaje de la ronda 1 contiene InstruCAT, CC-BY-NC-ND-4.0, no comercial) |
| Formato de pesos | GGUF (safetensors en el modelo original de la ronda 2) |
| Tamano del repositorio | 9,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-10 / 2026-09-10 |

## Arquitectura y entrenamiento

El modelo es un transformer de arquitectura Llama con 2,5B parametros y vocabulario de 130.560 tokens. El entrenamiento se realizo en dos rondas de ajuste con LoRA sobre openbmb/MiniCPM5-2B. La ronda 1 adapto el modelo base al catalan; la ronda 2, sobre la que se generan estos GGUF, partio del checkpoint de la ronda 1 y se entreno sobre 23.400 conversaciones multi-turno en catalan del dataset BSC-LT/ALIA-2606-SFT (CC-BY-4.0), con subconjuntos orientados a aumento multi-turno, seguimiento de instrucciones, mentor-ca, dolly-ca, CoQCat, identidad y system-prompt multi-turno. La configuracion declarada es LoRA r=32, alpha=64, learning rate 1e-4, 1 epoca y aproximadamente 326 pasos. Las metricas reportadas al final del entrenamiento son perdida de evaluacion 1,383 y precision de token 0,704.

La conversion a GGUF se realizo con el script convert_hf_to_gguf.py de llama.cpp en precision fp16, y las cuantizaciones con llama-quantize de la release b10067. La plantilla de chat queda embebida en los metadatos del GGUF bajo la clave tokenizer.chat_template, lo que permite usar el modelo directamente con llama-server u Ollama sin configuracion adicional de prompt. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, attention lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional en catalan, con enfasis en mantener el idioma de respuesta (la plantilla de Ollama propuesta por el autor fija un system prompt en catalan).
- Dialogo multi-turno: el entrenamiento de la ronda 2 se construyo especificamente sobre conversaciones multi-turno, con aumentos de contexto conversacional.
- Seguimiento de instrucciones en catalan, procedente de los subconjuntos de instruction-following y mentor-ca del dataset de entrenamiento.
- Respuestas con system prompt, gracias a los ejemplos de system-prompt multi-turno incluidos en el entrenamiento.
- Capacidades de QA y tareas de un solo turno heredadas de la ronda 1, segun indica el propio autor en las limitaciones de la model card.
- Integracion con llama.cpp y Ollama mediante servidor HTTP compatible con endpoints (tag endpoints_compatible).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio, thinking mode ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al catalan declarado; el tag de idioma es unicamente "ca".

## Casos de uso

- Asistente conversacional local en catalan: el modelo puede desplegarse con llama-server o Ollama en una maquina de sobremesa y mantener dialogos multi-turno con la plantilla de chat embebida, sin depender de APIs externas.
- Atencion al cliente en catalan para pymes: con la cuantizacion Q4_K_M (1,6 GB) se puede ejecutar en hardware modesto y gestionar conversaciones de soporte de varios turnos, siempre que la tarea no requiera conocimientos especializados profundos.
- Prototipado rapido de productos en catalan: al ser un GGUF de 1,6-5,0 GB, permite iterar sobre prompts y plantillas de sistema en local antes de decidir si se necesita un modelo mayor.
- Generacion de respuestas en catalan dentro de pipelines de documentos: redaccion de resumenes conversacionales, reformulacion y respuesta a preguntas simples sobre textos en catalan.
- Educacion y practica de idioma: como interlocutor en catalan para ejercicios de conversacion, aprovechando el entrenamiento multi-turno y la fijacion de idioma mediante system prompt.
- Normalizacion de texto y variantes del catalan: ajustado sobre un dataset que incluye CoQCat, puede emplearse para responder y reformular en registro catalan estandar en tareas de post-edicion ligera.
- Base para ajustes adicionales: al estar disponible tambien en F16 (5,0 GB), sirve como fuente de re-cuantizacion o como punto de partida para nuevos LoRA en dominios especificos del catalan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas del propio entrenamiento, que no son comparables con evaluaciones estandar:

| Metrica | Valor | Nota |
|---|---|---|
| Perdida de evaluacion final | 1,383 | Reportada por el autor para la ronda 2 |
| Precision de token | 0,704 | Reportada por el autor para la ronda 2 |
| Pasos de entrenamiento | ~326 | 1 epoca, LoRA r=32/alpha=64, lr 1e-4 |
| MMLU, HumanEval, GSM8K u otros | no disponible | No publicados |
| Benchmarks en catalan (p. ej. evaluaciones de la familia ALIA) | no disponible | No publicados para este modelo |

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos a partir del tamano de los ficheros; no confirmados por el autor): Q4_K_M en torno a 2-3 GB incluyendo contexto; Q8_0 en torno a 3,5-4,5 GB; F16 en torno a 6 GB.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 o incluso GPUs con 6-8 GB pueden ejecutar la cuantizacion Q4_K_M sin problema.
- Ejecucion en CPU: viable con llama.cpp u Ollama, dado el reducido numero de parametros (2,5B); el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- GPU de centro de datos (A100, H100, L40S): sobredimensionadas para este modelo, salvo que se desplieguen muchas instancias concurrentes.
- Opciones de despliegue: llama.cpp (llama-server, tal como documenta el autor), Ollama mediante Modelfile, y cualquier runtime compatible con GGUF. No se documenta soporte verificado para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-catalan-chat-v2 (GGUF) | 2.516.756.480 | no disponible | other (linaje con componente no comercial) | GGUF en HuggingFace |
| luispoveda93/MiniCPM5-2B-catalan-chat (ronda 1) | ~2,5B | no disponible | no disponible (linaje InstruCAT, CC-BY-NC-ND-4.0) | Pesos en HuggingFace |
| openbmb/MiniCPM5-2B (base) | 2,5B | no disponible | Apache-2.0 | Pesos en HuggingFace |
| Modelos conversacionales en catalan de otros desarrolladores (p. ej. familia Salamandra de BSC) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

Comparativa de rendimiento entre estas alternativas: no disponible. No se han publicado evaluaciones comparativas para este modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Tamano reducido: 2,5B parametros, lo que limita el rendimiento en tareas complejas de razonamiento, matematicas o codigo. El autor indica explicitamente que las habilidades de QA de tarea provienen de los datos de un solo turno de la ronda 1.
- Enfoque en comportamiento conversacional: el ajuste de la ronda 2 prioriza el chat, no la ampliacion de capacidades factuales o de conocimiento.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de tasa de alucinacion; en un modelo de este tamano el riesgo es alto en dominios especializados.
- Idioma: unicamente catalan declarado. No hay soporte documentado de castellano, ingles u otras lenguas, ni evaluacion de transferencia entre idiomas.
- Longitud de contexto: no documentada en la model card ni en los metadatos citados, por lo que no se puede garantizar el comportamiento con conversaciones muy largas.
- Licencia: el repositorio declara license:other. El modelo base MiniCPM5-2B es Apache-2.0 y los datos de la ronda 2 son CC-BY-4.0, pero el linaje de la ronda 1 contiene InstruCAT bajo CC-BY-NC-ND-4.0, que prohibe el uso comercial. Esto hace desaconsejable el uso comercial del modelo sin una revision legal previa del linaje completo.
- Falta de validacion externa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no cuenta con evaluacion independiente publicada.
- Trazabilidad: modelo de autor individual, sin publicacion tecnica asociada ni proceso de revision; conviene validar el comportamiento con un conjunto de pruebas propio antes de integrarlo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2-GGUF
- Modelo de la ronda 2 (pesos originales): https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2
- Modelo de la ronda 1: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Dataset de entrenamiento de la ronda 2: https://huggingface.co/datasets/BSC-LT/ALIA-2606-SFT
- Metricas de entrenamiento (Trackio): https://luispoveda93-minicpm5-2b-catalan-chat-v2-trackio.hf.space?project=minicpm5-2b-catalan-chat-v2
- Cuantizacion Q4_K_M: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2-GGUF/resolve/main/MiniCPM5-2B-catalan-chat-v2-Q4_K_M.gguf
- Cuantizacion Q8_0: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2-GGUF/resolve/main/MiniCPM5-2B-catalan-chat-v2-Q8_0.gguf
- Cuantizacion F16: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2-GGUF/resolve/main/MiniCPM5-2B-catalan-chat-v2-f16.gguf
- Busqueda web: los resultados devueltos no contienen informacion relevante sobre este modelo (corresponden a paginas de Google Earth y Google Maps), por lo que no se aportan enlaces adicionales.
