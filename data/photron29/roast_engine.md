# photron29/roast_engine

## Resumen

Roast Engine es un ajuste fino del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario photron29, orientado especificamente a la generacion de respuestas cortas e ingeniosas ("roasts") para bots de Discord. El modelo se distribuye en formato GGUF con cuantizacion Q4_K_M (aproximadamente 4,68 GB) y esta disenado para funcionar con Ollama, que carga automaticamente el system prompt y los parametros de inferencia incluidos en el repositorio. Su idioma principal de salida es hinglish romanizado (hindi escrito con alfabeto latino), con capacidad de responder en ingles si se le solicita en ese idioma.

El modelo resuelve un nicho muy concreto: proporcionar respuestas de una sola linea, mordaces y breves, en un contexto de entretenimiento social. No esta pensado como un asistente generalista, sino como un componente especializado dentro de una arquitectura de bot conversacional. La longitud de respuesta esta limitada a 40 tokens (`num_predict: 40`) y el contexto de inferencia configurado es de 2048 tokens (`num_ctx: 2048`), coherente con su uso en mensajes cortos de chat.

Con cero descargas y cero likes en el momento de la ficha, se trata de un modelo de publicacion muy reciente y sin validacion comunitaria. Su relevancia actual es limitada fuera del caso de uso especifico para el que fue creado, pero resulta un ejemplo representativo de ajustes finos pequenos y especializados sobre modelos base de 7B, distribuidos como GGUF para despliegue ligero en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens configurados en inferencia (`num_ctx`); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (GGUF, ~4,68 GB) |
| Idiomas soportados | en, hi (salida por defecto en hinglish romanizado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 4,7 GB); safetensors referenciados en metadatos con 7.615.616.512 parametros |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-7B-Instruct, un transformer decoder-only de 7.615.616.512 parametros. No se dispone de informacion en la model card sobre el proceso de entrenamiento: no se especifican el numero de tokens utilizados, la composicion del dataset, la posible aplicacion de RLHF, DPO o SFT, ni hiperparametros de entrenamiento. Tampoco se documenta si se emplearon tecnicas como LoRA, QLoRA o ajuste completo.

La innovacion practica del repositorio no reside en la arquitectura, sino en el empaquetado: el system prompt y los parametros de inferencia (`temperature: 0.5`, `top_p: 0.8`, `num_predict: 40`, `num_ctx: 2048`) estan incluidos en el propio repositorio, de modo que Ollama los carga automaticamente al hacer `ollama run`. Esto reduce la configuracion manual necesaria para desplegar el modelo en un bot. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto breve: respuestas de una sola linea, limitadas a 40 tokens por defecto.
- Estilo "roast": tono mordaz e ingenioso orientado a entretenimiento social.
- Hinglish romanizado: salida por defecto en hindi escrito con alfabeto latino.
- Ingles: responde en ingles si se le solicita en ese idioma.
- Integracion via API: compatible con el endpoint `/api/chat` de Ollama (`http://localhost:11434`).
- Soporte de conversacion multi-turno a traves del campo `messages` de la API de Ollama (limitado por el contexto configurado de 2048 tokens).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Bot de roasts en Discord: el modelo se integra en un bot de discord.js o discord.py que envia el mensaje del usuario al endpoint local de Ollama y publica la respuesta generada. Su formato de salida corto (40 tokens) encaja con el ritmo de un canal de chat.
- Moderacion ludica de comunidad: uso en canales de entretenimiento donde se busca una respuesta sarcastica ante mensajes de los usuarios, sin necesidad de un asistente generalista.
- Despliegue en hardware de consumo: al requerir aproximadamente 4-6 GB de VRAM, puede ejecutarse en GPU de gama media o incluso con offload parcial a RAM del sistema, lo que permite alojar el bot en un PC domestico.
- Prototipado rapido de bots conversacionales: el empaquetado con system prompt y parametros incluidos permite probar el comportamiento con un unico comando (`ollama run hf.co/photron29/roast_engine`), util para validar una idea antes de invertir en infraestructura.
- Hosting remoto de bots: la model card documenta exponer el puerto 11434 mediante un tunel (por ejemplo, Cloudflare Tunnel) o un proxy inverso con autenticacion, lo que permite separar el bot de Discord del servidor que ejecuta el modelo.
- Demostraciones y contenido para comunidades en hinglish: util para creadores que quieran generar respuestas ingeniosas en hindi romanizado para audiencias del sur de Asia, con salida tambien en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4-6 GB para la cuantizacion Q4_K_M, segun la model card.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con al menos 4-6 GB de VRAM puede ejecutar el modelo, con offload automatico de capas a RAM del sistema si es necesario.
- GPU de consumo: cabe en tarjetas de gama media con 6 GB o mas de VRAM; con menos memoria, Ollama descarga capas a RAM y el rendimiento depende del ancho de banda de memoria del sistema.
- Opciones de despliegue: Ollama (metodo documentado y soportado); llama.cpp es compatible por el formato GGUF, aunque no se documenta explicitamente en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| photron29/roast_engine | 7,6 B | 2048 (configurado) | GGUF Q4_K_M | no disponible | Roasts en hinglish/ingles |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | no disponible en esta ficha | safetensors, GGUF | no disponible en esta ficha | Asistente generalista |
| Alternativas especializadas en humor o chat | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con su modelo base, Qwen2.5-7B-Instruct, del que hereda arquitectura y parametros pero del que difiere en el ajuste fino para el estilo roast y en el empaquetado con parametros de inferencia. No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base Qwen2.5-7B-Instruct y la del ajuste antes de cualquier despliegue en produccion.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la ficha, sin evaluaciones externas de calidad.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o incoherente; en el contexto de roasts, el riesgo principal es ofensivo mas que factual.
- Contenido potencialmente ofensivo: el proposito del modelo es generar respuestas mordaces; puede producir insultos o comentarios hirientes, lo que exige moderacion y filtros en entornos publicos.
- Contexto limitado: 2048 tokens configurados, adecuado para mensajes cortos pero insuficiente para conversaciones largas o documentos extensos.
- Idiomas limitados: solo en e hi; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de respuesta restringida: 40 tokens por defecto, lo que limita su uso a respuestas de una linea.
- Sin documentacion de entrenamiento: se desconoce el dataset, el proceso y los posibles sesgos introducidos durante el ajuste fino.
- Dependencia de Ollama: el flujo documentado asume Ollama; otros runners requieren configurar manualmente el system prompt y los parametros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/photron29/roast_engine
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Ollama: https://ollama.com
