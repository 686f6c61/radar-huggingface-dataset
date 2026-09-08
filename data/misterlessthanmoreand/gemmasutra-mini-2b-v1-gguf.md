# Misterlessthanmoreand/Gemmasutra-Mini-2B-v1-GGUF

## Resumen

Gemmasutra Mini 2B v1 es un modelo de lenguaje de 2.6B parámetros, fine-tuneado a partir de Gemma para roleplay (RP) de alta calidad en dispositivos de bajo consumo. Desarrollado por el equipo BeaverAI y publicado originalmente por TheDrummer, este modelo está diseñado para ejecutarse localmente en hardware modesto, como portátiles, móviles o Raspberry Pi. La versión GGUF aquí documentada, publicada por Misterlessthanmoreand, ofrece el modelo en formato cuantizado para su uso con llama.cpp y aplicaciones compatibles como KoboldCPP o Layla.

El modelo resuelve el problema de que los modelos menores de 7B tradicionalmente no ofrecían una experiencia de roleplay satisfactoria. Gemmasutra Mini 2B v1 pretende cambiar esto ofreciendo una alternativa ligera, sin censura y sin alineación, pensada para juegos de rol interactivos y conversaciones con personajes. Su arquitectura es un transformer decoder-only basado en Gemma, con 2.614.341.888 parámetros totales y una ventana de contexto no especificada, aunque los ejemplos muestran un funcionamiento adecuado con 4K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma) |
| Parametros totales | 2.614.341.888 (~2.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (funciona con 4K segun ejemplos) |
| Tipos de cuantizacion | GGUF (multiples cuantizaciones, se recomiendan variantes iMatrix) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Gemmasutra Mini 2B v1 es un fine-tune del modelo Gemma de 2B parametros, manteniendo su arquitectura de transformer decoder-only. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card indica que el modelo esta "uncensored and unaligned", lo que sugiere que se eliminaron o redujeron las restricciones de seguridad del modelo base.

La principal innovacion tecnica es la adaptacion de la plantilla de instrucciones de Gemma para soportar el rol de sistema (`<start_of_turn>system`), lo que permite definir el contexto del personaje de manera mas efectiva. El modelo tambien es compatible con el modo Chat Completion, lo que facilita su integracion en aplicaciones de chat.

## Capacidades

- Generacion de texto para roleplay (RP) interactivo con personajes.
- Conversaciones multi-turno con soporte de system role para definir el contexto del personaje.
- Funciona con plantillas de chat estandar (Chat Completion) y con la plantilla Gemma Instruct modificada.
- Modelo sin censura ni alineacion, diseñado para contenido adulto y explicito.
- No se menciona soporte para tool calling, function calling, vision, audio ni razonamiento matematico.
- Capacidades multilingues no especificadas; se desconoce si el modelo funciona bien fuera del ingles.

## Casos de uso

- Roleplay en local con KoboldCPP: el modelo se puede cargar en KoboldCPP 1.72 o superior, ofreciendo una experiencia de RP fluida en portatiles o equipos de gama baja.
- Juegos de rol basados en texto: gracias a su tamaño reducido, es viable ejecutarlo en Raspberry Pi o dispositivos embebidos para crear juegos de aventuras conversacionales.
- Chatbots de personajes en movil: a traves de la aplicacion Layla, el modelo puede ejecutarse en iOS y Android, permitiendo conversaciones con personajes personalizados sin conexion.
- Escritura creativa asistida: el modelo puede generar dialogos y narrativas para autores que buscan inspiracion en historias de ficcion.
- Prototipado rapido de chatbots: al ser ligero y facil de desplegar, es adecuado para probar ideas de conversacion en entornos de desarrollo.
- Simulacion de personajes para entretenimiento: el modelo permite crear experiencias interactivas con personajes ficticios, incluyendo escenarios con multiples personajes (group character).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion GGUF, un modelo de 2.6B parametros puede ocupar entre 1.5 GB (Q2_K) y 3 GB (Q8_0) de memoria. En CPU, se necesitan entre 2 y 5 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una RTX 3060 o RTX 4060. Tambien funciona en GPU integradas o en CPU.
- Compatible con consumer GPU: si, cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: llama.cpp, KoboldCPP, Ollama, LM Studio, y aplicaciones moviles como Layla.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Gemmasutra Mini 2B v1 | 2.6B | no disponible | other | Roleplay sin censura |
| Gemma 2B (base) | 2.6B | 8K | Gemma Terms | Generacion de texto general |
| Llama 3.2 3B | 3.2B | 128K | Llama 3.2 Community | Razonamiento, codigo, chat |
| Qwen2.5 1.5B | 1.5B | 32K | Apache 2.0 | Multilingue, codigo |

Nota: la comparativa se basa en datos publicos de los modelos base; no se dispone de benchmarks para Gemmasutra Mini 2B v1.

## Limitaciones y advertencias

- El modelo esta explicitamente diseñado para contenido NSFW y sin alineacion, lo que puede generar respuestas inapropiadas o ilegales en contextos no controlados.
- La licencia es "other", lo que implica terminos de uso no estandar que deben revisarse antes de cualquier despliegue comercial.
- No se recomienda su uso para matematicas ni tareas de razonamiento logico, segun la model card.
- La longitud de contexto no esta documentada; se desconoce el comportamiento mas alla de 4K tokens.
- Se desconocen los datos de entrenamiento y la composicion del dataset, lo que dificulta evaluar sesgos o riesgos de alucinacion.
- El modelo solo esta disponible en formato GGUF en este repositorio; no se proporcionan pesos en safetensors.

## Enlaces

- HuggingFace (repositorio GGUF): https://huggingface.co/Misterlessthanmoreand/Gemmasutra-Mini-2B-v1-GGUF
- Modelo original: https://huggingface.co/TheDrummer/Gemmasutra-Mini-2B-v1
- GGUF original: https://huggingface.co/TheDrummer/Gemmasutra-Mini-2B-v1-GGUF
- iMatrix GGUF (recomendado): https://huggingface.co/MarsupialAI/Gemmasutra-Mini-2B-v1_iMatrix_GGUF
- KoboldCPP: https://github.com/LostRuins/koboldcpp/releases/tag/v1.72
- Layla: https://www.layla-network.ai/
