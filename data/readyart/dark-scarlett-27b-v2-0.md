# ReadyArt/Dark-Scarlett-27B-v2.0

## Resumen

Dark-Scarlett-27B-v2.0 es un modelo de lenguaje desarrollado por ReadyArt, especializado en roleplay y conversación, con un enfoque explícito en contenido adulto y NSFW. Se trata de un fine-tuning del modelo base Qwen/Qwen3.8-27B, lo que le confiere una base arquitectónica sólida de 27 mil millones de parámetros. El modelo está diseñado para ser "unaligned" (sin alineación), es decir, sin los filtros de seguridad habituales en modelos comerciales, lo que lo hace adecuado para escenarios de roleplay maduro y escritura creativa explícita.

La relevancia de este modelo radica en su especialización en un nicho concreto: la generación de texto conversacional y narrativo sin restricciones de contenido. A diferencia de modelos generalistas que aplican políticas de moderación, Dark-Scarlett-27B-v2.0 permite interacciones sin censura, lo que atrae a desarrolladores que buscan crear experiencias de rol adulto o herramientas de escritura erótica. El acceso al modelo está restringido (gated) en HuggingFace, lo que implica que los usuarios deben aceptar condiciones adicionales antes de descargarlo.

Aunque el modelo se publicó en agosto de 2026, no se han proporcionado detalles técnicos completos sobre su arquitectura interna, datos de entrenamiento o rendimiento. La información disponible se limita a la ficha de HuggingFace y a referencias indirectas de otros modelos de la misma familia, como Dark-Scarlett-v2.0-31B, que utiliza una arquitectura gemma4. Para este modelo concreto, la mayoría de las especificaciones técnicas no están documentadas públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.8-27B (detalles no disponibles) |
| Parametros totales | 27B (inferido del nombre, no confirmado oficialmente) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican archivos GGUF para esta version) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, un transformer denso de 27 mil millones de parametros desarrollado por Alibaba. Sin embargo, no se han publicado detalles especificos sobre la arquitectura interna de Dark-Scarlett-27B-v2.0, como el numero de capas, la configuracion de atencion o el tamaño del vocabulario. Al ser un fine-tuning, se asume que la arquitectura base se mantiene, pero no hay confirmacion oficial.

En cuanto al entrenamiento, no se dispone de informacion sobre el dataset utilizado, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO. Los tags de HuggingFace indican que es un modelo "instruct" y "unaligned", lo que sugiere que fue afinado para seguir instrucciones sin filtros de seguridad, pero los detalles del proceso de entrenamiento no estan documentados.

## Capacidades

- Generacion de texto conversacional y narrativo, especialmente orientado a roleplay y dialogo interactivo.
- Soporte para contenido adulto y explicito (NSFW), sin restricciones de moderacion.
- Capacidad de seguir instrucciones (instruct) en contextos de roleplay, permitiendo al usuario dirigir la narrativa.
- No se mencionan capacidades de tool calling, function calling, agentes, vision, audio o thinking mode.
- No se especifican capacidades multilingues; se asume que hereda las del modelo base Qwen3.8, pero no hay confirmacion.

## Casos de uso

- Roleplay adulto en aplicaciones de chat: el modelo puede mantener conversaciones multi-turno con un personaje ficticio, adaptandose al tono y las preferencias del usuario gracias a su entrenamiento sin alineacion.
- Escritura creativa erotica: util para generar relatos, dialogos o escenas explicitas bajo demanda, con control narrativo por parte del usuario.
- Simulacion de personajes para juegos de rol de mesa: puede interpretar personajes complejos con personalidades definidas, manteniendo coherencia a lo largo de la interaccion.
- Asistente de escritura para autores de ficcion adulta: ayuda a desarrollar tramas, dialogos y descripciones explicitas, ahorrando tiempo en la generacion de borradores.
- Chatbots de entretenimiento para adultos: integrable en plataformas de chat o aplicaciones moviles que requieran un modelo sin filtros de contenido.
- Generacion de contenido para comunidades de roleplay en linea: permite crear respuestas detalladas y contextuales para foros o servidores de rol, con un estilo natural y sin censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se ofrecen comparativas con modelos similares en terminos de rendimiento.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 27B parametros, se requiere al menos 16-20 GB de VRAM para inferencia en precision FP16, y alrededor de 8-10 GB con cuantizacion de 4 bits (si estuviera disponible). Sin embargo, no se han publicado archivos cuantizados para esta version.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o GPUs profesionales con suficiente memoria. En consumer, una RTX 3090 o 4090 podria ejecutar el modelo con cuantizacion, pero no hay confirmacion de compatibilidad.
- Opciones de despliegue: no se especifican. Dado que es un modelo basado en Qwen, podria ser compatible con vLLM, llama.cpp u Ollama, pero no hay documentacion al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. Existen otros modelos de la misma familia (Dark-Scarlett-v2.0-31B, Dark-Scarlett-v0.3-26B-A4B) con arquitecturas diferentes (gemma4 para el 31B), pero no hay datos de rendimiento ni especificaciones detalladas para ninguno de ellos. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Contenido NSFW y explicito: el modelo esta disenado para generar contenido adulto sin filtros, lo que puede resultar inapropiado para menores o entornos profesionales.
- Sin alineacion: al carecer de alineacion de seguridad, el modelo puede generar respuestas ofensivas, sesgadas o perjudiciales si se le solicita.
- Riesgo de alucinacion: como cualquier LLM, puede inventar informacion o producir respuestas incoherentes, especialmente en contextos largos.
- Acceso restringido: el modelo es gated en HuggingFace, por lo que requiere aceptar condiciones adicionales antes de su uso, lo que limita su disponibilidad.
- Falta de documentacion: no se han publicado detalles sobre arquitectura, entrenamiento, benchmarks o requisitos de hardware, lo que dificulta su evaluacion y despliegue en produccion.
- Licencia Apache-2.0: permite uso comercial, pero al ser un modelo sin alineacion, el responsable del despliegue debe asumir los riesgos legales y eticos asociados al contenido generado.

## Enlaces

- HuggingFace: https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v2.0
- Perfil de la organizacion ReadyArt: https://huggingface.co/ReadyArt
- Referencia a Dark-Scarlett-v2.0-31B en LLMs.INFO: https://llms.info/models/readyart-dark-scarlett-v2-0-31b-1324
- Grafo de arquitectura de Dark-Scarlett-v2.0-31B: https://hfviewer.com/ReadyArt/Dark-Scarlett-v2.0-31B
- Dark-Scarlett-v2.0-31B-GGUF en LLMs.INFO: https://llms.info/models/readyart-dark-scarlett-v2-0-31b-gguf-1326
- Dark-Scarlett-v0.3-26B-A4B-GGUF en toolify.ai: https://www.toolify.ai/ai-model/readyart-dark-scarlett-v0-3-26b-a4b-gguf
