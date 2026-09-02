# sifat-febo/banglish-companion-3b

## Resumen

Banglish Companion 3B es un modelo de conversación en Banglish —bengalí escrito fonéticamente en alfabeto latino— desarrollado por sifat-febo (Sifat Hasan). Se trata de un fine-tuning del modelo base Ministral-3-3B-Base-2512 de Mistral AI, con 3.429.006.336 parámetros (3,4B), orientado a mantener diálogos informales y responder en el mismo registro en que el usuario escribe. Su principal aportación es que, a diferencia de otros modelos que responden en inglés o en escritura bengalí, este responde en Banglish, el formato que usan millones de hablantes de bengalí en línea y la diáspora.

El modelo está pensado para ejecutarse localmente, sin conexión y sin necesidad de GPU potente, lo que lo hace atractivo para aplicaciones de privacidad y para comunidades con recursos limitados. Es la continuación del modelo banglish-companion de 1,7B, con respuestas más cortas y cercanas a la pregunta. Su licencia Apache 2.0 permite uso comercial sin restricciones, y el autor advierte explícitamente de sus limitaciones: no es una fuente fiable de hechos y pierde el hilo en conversaciones largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Ministral-3-3B-Base-2512) |
| Parametros totales | 3.429.006.336 (3,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se especifica en la ficha del modelo) |
| Tipos de cuantizacion | No especificados; pesos en precision completa (FP32) segun la model card; version MLX disponible para Mac (3,6 GB) |
| Idiomas soportados | Banglish (bengali romanizado) principalmente; etiquetado como bn, en en HuggingFace |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: el tamano del repositorio en HuggingFace es de 13,7 GB, mientras que la model card indica 6,9 GB para los pesos en precision completa. Esta discrepancia puede deberse a que el repositorio incluye archivos adicionales o a una actualizacion posterior.

## Arquitectura y entrenamiento

El modelo parte de Ministral-3-3B-Base-2512, un transformer decoder-only de Mistral AI con licencia Apache 2.0, y se somete a un fine-tuning adicional sobre conversaciones en Banglish. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La model card indica que el modelo "responde de la forma en que se escribio el mensaje", lo que sugiere un entrenamiento orientado a preservar el registro informal y la romanizacion fonetica.

Una caracteristica tecnica destacable es que ciertos tipos de mensajes se responden desde un archivo incluido en el repositorio, antes de llegar a los pesos del modelo. Esto implica un enfoque hibrido que combina reglas o respuestas predefinidas con generacion neuronal, aunque no se detalla que tipos de mensajes se cubren ni como se decide la ruta.

## Capacidades

- Generacion de texto conversacional en Banglish, manteniendo el registro informal y la romanizacion fonetica del usuario.
- Respuestas cortas y directas, disenadas para dialogos cotidianos y no para explicaciones extensas.
- Ejecucion local sin conexion, con soporte para CPU y GPU.
- Continuacion de conversaciones multi-turno, aunque con limitaciones en dialogos largos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada: practicamente exclusivo de Banglish; no maneja escritura bengali formal ni ingles estandar.

## Casos de uso

- Asistente personal para hablantes de bengali que escriben en Banglish: el modelo puede mantener conversaciones informales sobre el estado de animo, planes diarios o recomendaciones, respondiendo en el mismo tono y formato que el usuario.
- Practica de escritura en bengali romanizado: estudiantes de la diaspora pueden conversar con el modelo para mejorar su fluidez en Banglish, recibiendo respuestas que imitan el registro coloquial.
- Chatbot de compania para personas mayores o aisladas: dado que se ejecuta localmente, puede ofrecer conversacion sin depender de servicios en la nube, preservando la privacidad.
- Generacion de contenido para redes sociales en Banglish: el modelo puede redactar mensajes, comentarios o respuestas en el estilo informal tipico de plataformas como Facebook o WhatsApp.
- Automatizacion de respuestas en atencion al cliente para empresas que atienden a clientes bengalies: integrado en un sistema de chat, puede gestionar consultas sencillas en Banglish sin necesidad de agentes humanos.
- Prototipado rapido de aplicaciones de chat en bengali: desarrolladores pueden usar el modelo como base para crear asistentes conversacionales sin depender de APIs externas ni de conexion a internet.
- Herramienta educativa para ninos de la diaspora que aprenden bengali: el modelo puede responder preguntas sencillas y mantener conversaciones adaptadas al nivel del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: para los pesos en FP32 (6,9 GB segun la model card, o 13,7 GB si el repositorio contiene pesos sin cuantizar), se recomienda al menos 8 GB de VRAM en GPU, aunque 16 GB seria mas comodo. En CPU, se necesitan al menos 8 GB de RAM libre.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM, como RTX 3060, RTX 4060, o superiores. Tambien puede ejecutarse en CPU sin GPU.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo medio y alto.
- Opciones de despliegue: transformers (con el script companion.py incluido en el repositorio), y version MLX para Mac (banglish-companion-3b-mlx) que ocupa 3,6 GB. No se mencionan integraciones con vLLM, llama.cpp u Ollama, aunque al ser un modelo transformers podria adaptarse.
- Latencia y throughput: no disponibles. Al ser un modelo de 3,4B, se espera una latencia moderada en CPU y baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| banglish-companion-3b (este) | 3,4B | No disponible | Conversacion en Banglish | Apache 2.0 |
| banglish-companion (1,7B) | 1,7B | 8K (segun LLM Explorer) | Conversacion en Banglish | Apache 2.0 |
| Ministral-3-3B-Base-2512 | 3,4B | No disponible | Modelo base multilingue | Apache 2.0 |

No se dispone de benchmarks comparativos entre estos modelos. La comparativa se limita a parametros y enfoque. Otros modelos multilingues como Llama-3-8B o Gemma-3-4B podrian manejar bengali, pero no estan especializados en Banglish y no se han evaluado en este contexto.

## Limitaciones y advertencias

- El modelo solo funciona en Banglish; no maneja escritura bengali formal ni ingles estandar, y no existe un registro formal en el lenguaje escrito.
- Alucinaciones frecuentes: al ser un modelo de 3,4B, puede inventar numeros, nombres o hechos con total confianza. No debe usarse como fuente de informacion factual.
- Pierde el hilo en conversaciones largas; no es adecuado para dialogos extensos o tareas que requieran memoria a largo plazo.
- No es un sustituto de terapeuta, medico ni abogado; sus respuestas en estos ambitos no tienen valor profesional.
- Algunas respuestas provienen de un archivo predefinido en el repositorio, no de los pesos del modelo. Esto puede generar respuestas incoherentes o fuera de contexto si el archivo no cubre adecuadamente el mensaje.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de exactitud ni soporte.
- El modelo no soporta tool calling, agentes ni razonamiento complejo, lo que limita su uso en aplicaciones que requieran integraciones externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sifat-febo/banglish-companion-3b
- Modelo base Ministral-3-3B-Base-2512: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Predecesor banglish-companion (1,7B): https://huggingface.co/sifat-febo/banglish-companion
- Version MLX para Mac: https://huggingface.co/sifat-febo/banglish-companion-3b-mlx
- Perfil de GitHub del autor: https://github.com/Pro-Sifat-Hasan/Pro-Sifat-Hasan
