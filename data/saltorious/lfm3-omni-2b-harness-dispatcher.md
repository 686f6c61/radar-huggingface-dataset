# Saltorious/lfm3-omni-2b-harness-dispatcher

## Resumen

LFM3-Omni 2B Harness Dispatcher es un ajuste fino del modelo multimodal LiquidAI/LFM3-Omni-2B, publicado por el usuario Saltorious en Hugging Face. El modelo base, desarrollado por Liquid AI, es un modelo "any-to-any" de aproximadamente 1.700 millones de parametros que comprende texto, imagenes, video y audio, y responde en texto, voz o una mezcla intercalada de ambos. El ajuste fino esta orientado a una tarea concreta: actuar como despachador de trabajo hacia los agentes personales de un usuario, clasificando mensajes, redactando objetivos y briefs, y procesando voz e imagenes.

El fine-tune se realizo mediante un LoRA de rango 16 y alpha 32 sobre 9.020 ejemplos, mayoritariamente generados de forma sintetica, con filas de clasificacion que incorporan mensajes reales de WildChat y SWE-chat (ambos ODC-BY) tras eliminar todas las respuestas de IA. Los pesos se fusionaron y cuantizaron a Q4_K_M con llama.cpp build b12032. El repositorio incluye ademas los proyectores de imagen y audio originales de Liquid AI sin modificar, lo que preserva las capacidades multimodales del modelo base.

La relevancia de esta ficha es doble: por un lado documenta un caso practico de especializacion de un modelo omni pequeno para orquestacion de agentes en local; por otro, advierte de las restricciones de la licencia LFM Open License v1.0, que limita el uso comercial a empresas con ingresos anuales inferiores a 10 millones de dolares. El modelo esta pensado para despliegue en dispositivo, no para servidores de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (texto, imagen, video, audio), segun modelo base LiquidAI/LFM3-Omni-2B |
| Parametros totales | 1.728.801.600 (1,73 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo base admite otras cuantizaciones no documentadas en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), con limite de uso comercial por encima de 10 M USD de ingresos anuales |
| Formato de pesos | GGUF (cuantizado); proyectores de imagen y audio en formato original de Liquid AI |
| Modelo base | LiquidAI/LFM3-Omni-2B |
| Metodo de ajuste | LoRA r=16, alpha=32, fusionado y cuantizado con llama.cpp b12032 |
| Datos de entrenamiento | 9.020 ejemplos, mayoritariamente generados; filas de clasificacion con mensajes de WildChat y SWE-chat (ODC-BY) sin respuestas de IA |
| Tamano del repositorio | 1,4 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LFM3-Omni-2B de Liquid AI, un modelo end-to-end disenado para sustituir en dispositivo a un ASR, un modelo vision-lenguaje, un LLM y un TTS por un unico sistema. Segun la documentacion de Liquid AI, se trata de un modelo no razonador ("non-reasoning") construido sobre Transformers, con capacidad de entrada y salida en multiples modalidades. El repositorio de Saltorious conserva los proyectores de imagen y audio originales sin modificar, de modo que el ajuste afecta unicamente a los pesos del modelo de lenguaje.

El entrenamiento consistio en un LoRA de rango 16 con alpha 32 aplicado sobre 9.020 ejemplos, la mayoria generados sinteticamente. Las filas destinadas a la tarea de clasificacion incorporan mensajes humanos reales procedentes de WildChat y SWE-chat, ambos datasets con licencia ODC-BY, tras eliminar todas las respuestas generadas por IA y sin incluir mensajes del propio autor del modelo. Posteriormente, los adaptadores se fusionaron en los pesos base y el conjunto se cuantizo a Q4_K_M con llama.cpp build b12032. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en el rol de despachador de agentes.
- Clasificacion y ordenacion de mensajes entrantes del usuario.
- Redaccion de objetivos y briefs de trabajo para agentes.
- Comprension de voz (audio) mediante el proyector de audio original de Liquid AI.
- Comprension de imagenes mediante el proyector de imagen original de Liquid AI.
- Capacidad multimodal any-to-any heredada del modelo base: entrada de texto, imagen, video y audio, salida en texto, voz o intercalada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: el modelo esta disenado como despachador hacia agentes, pero no se documenta razonamiento multi-paso explicito; el modelo base es no razonador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutado de mensajes personales: el modelo recibe mensajes entrantes del usuario y los clasifica por agente o tarea destino, aprovechando las filas de clasificacion entrenadas con mensajes reales de WildChat y SWE-chat.
- Redaccion automatica de briefs: dado un objetivo expresado en lenguaje natural, genera un brief estructurado que un agente posterior puede ejecutar.
- Asistente de voz en local: gracias al proyector de audio conservado, puede transcribir y entender instrucciones habladas y responder en texto o voz, sustituyendo a un ASR separado en el mismo dispositivo.
- Procesamiento de capturas e imagenes: el proyector de imagen permite extraer instrucciones o contexto de capturas de pantalla para convertirlas en tareas despachables.
- Orquestacion de agentes en el borde: al ser un modelo de 1,73 B cuantizado a Q4_K_M, puede ejecutarse en portatiles o dispositivos con recursos limitados para decidir que agente atiende cada peticion.
- Prototipado de pipelines de agentes personales: util para equipos que quieran validar una arquitectura de despacho multiagente sin depender de APIs en la nube.
- Filtrado y triaje de bandeja de entrada: combinando clasificacion de mensajes y redaccion de resumenes para priorizar correos o mensajes de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1,4 GB en Q4_K_M, por lo que la inferencia del modelo de lenguaje cabe en aproximadamente 2 GB de VRAM o memoria unificada, a lo que hay que sumar los proyectores de imagen y audio.
- GPU recomendadas: no disponibles de forma especifica; por tamano, el modelo es apto para GPUs consumer con al menos 4-6 GB de VRAM.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060 o superiores, y en equipos con memoria unificada (Apple Silicon).
- Opciones de despliegue: llama.cpp (formato GGUF, build b12032 o posterior) y ecosistemas compatibles con GGUF como Ollama o llama-cpp-python; vLLM y TGI no estan confirmados para este repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saltorious/lfm3-omni-2b-harness-dispatcher | 1,73 B | no disponible | Texto, imagen, video, audio | LFM Open License v1.0 (limite 10 M USD) | GGUF en Hugging Face |
| LiquidAI/LFM3-Omni-2B (base) | ~2 B | no disponible | Texto, imagen, video, audio | LFM Open License v1.0 | Pesos originales en Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento ni de contexto que permitan una comparacion cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Licencia LFM Open License v1.0: el uso comercial queda restringido a organizaciones con ingresos anuales inferiores a 10 millones de dolares; por encima de ese umbral se requiere licencia adicional de Liquid AI.
- El modelo base es explicitamente no razonador, por lo que no debe esperarse cadena de pensamiento ni planificacion multi-paso robusta.
- El ajuste fino se realizo sobre datos mayoritariamente generados de forma sintetica, lo que puede introducir sesgos o artefactos propios del generador.
- Las filas de clasificacion incluyen mensajes humanos de WildChat y SWE-chat, con los sesgos propios de esas fuentes.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente al redactar briefs o resumir mensajes.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria ni evaluaciones independientes.
- Al estar cuantizado a Q4_K_M, existe una perdida de calidad respecto a los pesos originales en precision completa.
- No hay benchmarks publicados que permitan verificar la calidad del ajuste frente al modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Saltorious/lfm3-omni-2b-harness-dispatcher
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentacion de Liquid AI sobre LFM3-Omni-2B: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
