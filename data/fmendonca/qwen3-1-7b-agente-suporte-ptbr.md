# FMendonca/qwen3-1.7b-agente-suporte-ptbr

## Resumen

Qwen3-1.7B agente suporte pt-BR es un adaptador LoRA publicado por FMendonca sobre el modelo base Qwen/Qwen3-1.7B de Alibaba. Su objetivo es convertir un modelo de 1.700 millones de parámetros en un agente de atención al cliente para un servicio de reparto ficticio llamado Garfo Ligeiro, con capacidad de invocar herramientas de un sistema de pedidos simulado: listar y detallar pedidos, rastrear entregas, reembolsar artículos, emitir cupones, cancelar pedidos y escalar a un humano. La política de la empresa no se incluye en el prompt: el adaptador la aprende por ejemplos.

El modelo se entrenó mediante destilación desde un profesor abierto (DeepSeek V4.1 Flash) sobre 1.874 conversaciones sintéticas en portugués de Brasil, escritas por ese profesor. El entrenamiento se ejecutó en una GPU de consumo AMD Radeon RX 7600 de 8 GB con ROCm, lo que lo convierte en un caso práctico de ajuste fino de bajo coste en hardware no NVIDIA. El adaptador ocupa unos 0,1 GB y se distribuye en formato safetensors con PEFT.

Su relevancia radica en dos factores: demuestra que un modelo de 1,7B puede superar ampliamente a su versión sin entrenar con la política completa en el prompt (85,7 % frente a 53,3 % de casos resueltos en 300 escenarios de prueba), y documenta con transparencia sus fallos (19 errores graves en 300 conversaciones, concentrados en reclamaciones fuera de plazo). No obstante, se trata de un experimento con datos y cliente sintéticos, no de un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B); el adaptador LoRA es adicional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen3-1.7B base) |
| Tipos de cuantizacion | bf16 en las mediciones; existe una version GGUF para CPU publicada por el autor |
| Idiomas soportados | portugues (pt), variante de Brasil |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF en el repositorio secundario |
| Rango y alfa del LoRA | r=16, alpha=32, aplicado a las siete proyecciones |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only denso de 1.700 millones de parámetros. El LoRA tiene rango 16 y alfa 32, e interviene en las siete proyecciones del modelo base. El entrenamiento consistió en 235 pasos (2 épocas, batch 2 con acumulación de 8, tasa de aprendizaje 2e-4) sobre 1.874 conversaciones de entrenamiento y 99 de validación, con un pico de 5,55 GB de VRAM y una duración de 1 h 59 min en una Radeon RX 7600 con ROCm. La pérdida de validación bajó de 2,066 a 0,367, y solo se computa sobre los turnos del agente.

La innovación principal no está en la arquitectura, sino en el formato de conversación y en el método de destilación. El adaptador no fue entrenado con el template de chat nativo de Qwen3 (`apply_chat_template`), sino con un formato propio definido en `src/formato_qwen.py`: un prompt de sistema con dos frases de rol y definiciones cortas de herramientas dentro del bloque `<tools>`; cada turno del agente comienza con un bloque `<think>` vacío, conservado también en turnos antiguos; las respuestas de herramientas llegan como turnos `user` con cada resultado dentro de `<tool_response>`; y el primer mensaje del cliente va precedido de una línea de contexto con identidad y hora. Las conversaciones de entrenamiento provienen de un profesor abierto (DeepSeek V4.1 Flash), lo que constituye una destilación de comportamiento agéntico y no de conocimiento general.

## Capacidades

- Generación de texto conversacional en portugués de Brasil para atención al cliente.
- Invocación de herramientas (tool calling / function calling) sobre un sistema de pedidos simulado: listar pedidos, detallar pedidos, rastrear entregas, reembolsar artículos, emitir cupones, cancelar pedidos y transferir a un humano.
- Razonamiento multi-paso dentro de una conversación: consulta el estado del pedido antes de decidir una acción, y encadena varias llamadas a herramientas en un mismo turno.
- Aplicación implícita de reglas de negocio aprendidas por ejemplos, sin que la política figure en el prompt (por ejemplo, plazos de reembolso o límites de cupones).
- Manejo de contexto temporal: el formato incluye fecha y hora en la línea de contexto, y el modelo usa esa información para evaluar plazos.
- Comprensión del estado del sistema: el resultado final (reembolsos, cupones, cancelaciones, transferencias) se compara con lo que dicta la política.
- Capacidad de clarificación y escalado a un humano cuando el caso lo requiere.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento general fuera del dominio de soporte.

## Casos de uso

- Atención al cliente de reparto en portugués de Brasil: el modelo gestiona conversaciones multi-turno sobre pedidos, retrasos y reclamaciones, invocando las herramientas del sistema de pedidos para consultar el estado real antes de responder. Es adecuado porque fue entrenado específicamente con este flujo y formato.
- Automatización de reembolsos y cupones: el agente aplica las reglas de la política (por ejemplo, plazos de 48 horas) y emite la acción correspondiente mediante tool calling, lo que reduce la carga manual en casos repetitivos.
- Rastreo proactivo de entregas: ante una consulta de "¿dónde está mi pedido?", el modelo llama a la herramienta de rastreo y devuelve el estado con el contexto temporal de la conversación.
- Escalado a agentes humanos: cuando el caso excede la política o el cliente lo solicita, el modelo invoca la herramienta de transferencia y deja el caso en manos de una persona, con el historial de la conversación.
- Base para un asistente de soporte en otros dominios: el pipeline de destilación (profesor abierto genera conversaciones, LoRA sobre un modelo pequeño, evaluación por estado final del sistema) es reutilizable para otras políticas de negocio, siempre que se generen datos propios.
- Prototipado en hardware de consumo: al entrenarse en una RX 7600 de 8 GB y caber en bf16, permite iterar sobre el comportamiento del agente en una estación de trabajo sin GPU de datacenter.
- Investigación sobre agentes pequeños: sirve como referencia para estudiar la brecha entre un modelo de 1,7B destilado y un profesor grande (85,7 % frente a 98,0 % de casos resueltos) y para analizar modos de fallo concretos, como el incumplimiento del plazo de 48 horas.

## Benchmarks y rendimiento

Evaluación sobre 300 escenarios de prueba nunca vistos en entrenamiento, con un cliente simulado común a todos los sistemas. Un caso se considera resuelto si el estado final del sistema coincide con lo que dicta la política; un error grave es otorgar al cliente algo a lo que no tenía derecho.

| Sistema | Resueltos (IC 95 %) | Errores graves | Claridad (juez, 1-5) |
|---|---|---|---|
| Este adaptador, bf16 en RX 7600 | 85,7 % (81,7-89,3) | 19 | 4,4 |
| Qwen3-1.7B sin entrenar, con la política completa en el prompt | 53,3 % (47,7-59,0) | 0 | 1,8 |
| Profesor DeepSeek V4.1 Flash | 98,0 % (96,0-99,3) | 0 | 4,7 |

El punto débil se concentra en las reclamaciones de artículo presentadas después del plazo de 48 horas: en ese tipo resolvió 10 de 22 casos, y 9 de los 19 errores graves provienen de ahí. El modelo lee la fecha, conoce la regla y aun así reembolsa.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador se midió en bf16 sobre una Radeon RX 7600 de 8 GB; el modelo base de 1,7B en bf16 ocupa aproximadamente 3,4 GB de pesos, por lo que el conjunto cabe holgadamente en 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. El autor validó AMD Radeon RX 7600 con ROCm; también es compatible con GPU NVIDIA (CUDA) según el propio autor.
- GPU de consumo: sí, cabe en tarjetas de 8 GB o más, incluidas RTX 3060/4060 y equivalentes AMD.
- Opciones de despliegue: el repositorio del autor (`agente-suporte-ptbr`) con el código de `src/` es la vía recomendada, ya que el formato de conversación es propio y no el template nativo de Qwen3. Existe una versión GGUF para CPU en `FMendonca/qwen3-1.7b-agente-suporte-ptbr-gguf`, lo que permite despliegue en CPU con llama.cpp u Ollama, aunque el autor no documenta mediciones en ese formato.
- Latencia y throughput: no disponibles en la información proporcionada.
- Entrenamiento: 1 h 59 min con un pico de 5,55 GB de VRAM en una RX 7600, lo que permite reentrenar el adaptador en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 1,7B + LoRA | no disponible | 85,7 % resueltos, 19 errores graves, claridad 4,4 | Apache 2.0 | Hugging Face (adaptador) y GGUF |
| Qwen3-1.7B sin entrenar con política en el prompt | 1,7B | no disponible | 53,3 % resueltos, 0 errores graves, claridad 1,8 | Apache 2.0 | Hugging Face |
| DeepSeek V4.1 Flash (profesor) | no disponible | no disponible | 98,0 % resueltos, 0 errores graves, claridad 4,7 | no disponible | no disponible |

La comparación con otros adaptadores de atención al cliente en portugués no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los escenarios y el cliente simulado son sintéticos: un cliente real escribe de forma menos limpia y predecible, por lo que el rendimiento en producción probablemente será inferior al 85,7 % medido.
- La política de negocio es de una empresa ficticia (Garfo Ligeiro); el modelo no sirve para atención real sin un nuevo entrenamiento con datos y reglas propias.
- Comete errores graves: 19 en 300 conversaciones. En un sistema real, los límites rígidos deben implementarse en las herramientas (por ejemplo, bloquear reembolsos por encima del techo o cupones fuera de política), no confiar en el modelo.
- El fallo más documentado es el reembolso de reclamaciones fuera del plazo de 48 horas: 10 de 22 casos resueltos y 9 de los 19 errores graves.
- El adaptador no fue entrenado con el template de chat nativo de Qwen3; usar `apply_chat_template` produce un comportamiento no medido. Es necesario emplear el formato propio del repositorio.
- El entrenamiento se realizó una sola vez, con una única semilla, por lo que no hay estimación de varianza entre ejecuciones.
- Solo soporta portugués de Brasil; no se documenta rendimiento en otros idiomas.
- Licencia Apache 2.0, la misma que el modelo base, lo que permite uso comercial del adaptador; las conversaciones de entrenamiento están en CC BY 4.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FMendonca/qwen3-1.7b-agente-suporte-ptbr
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Versión GGUF para CPU: https://huggingface.co/FMendonca/qwen3-1.7b-agente-suporte-ptbr-gguf
- Dataset de conversaciones: https://huggingface.co/datasets/FMendonca/conversas-suporte-delivery-ptbr
- Repositorio con código, mediciones y limitaciones: https://github.com/fernandomcrsilva/agente-suporte-ptbr
- Formato de conversación: https://github.com/fernandomcrsilva/agente-suporte-ptbr/blob/main/src/formato_qwen.py
- Demo local: `demo/app.py` en el repositorio del autor
- Demo pública en Hugging Face: prevista para diciembre de 2026 (no disponible aún)
