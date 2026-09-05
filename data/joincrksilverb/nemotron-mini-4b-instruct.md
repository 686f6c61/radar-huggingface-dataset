# joincrksilverb/Nemotron-Mini-4B-Instruct

## Resumen

Nemotron-Mini-4B-Instruct es un modelo de lenguaje pequeño (SLM) desarrollado por NVIDIA, optimizado para tareas de roleplay, recuperación aumentada por generación (RAG) y llamada a funciones (function calling). Se trata de una versión afinada de `nvidia/Minitron-4B-Base`, que a su vez fue obtenida mediante poda y destilación a partir de Nemotron-4 15B utilizando una técnica de compresión de LLM descrita en el artículo arXiv:2407.14679. El modelo está diseñado para su despliegue en dispositivos locales y entornos de baja latencia, con un tamaño de 4.000 millones de parámetros y una ventana de contexto de 4.096 tokens.

La arquitectura es un Transformer decoder autoregresivo con atención de consultas agrupadas (GQA) y posiciones rotatorias (RoPE). El modelo fue entrenado entre febrero y agosto de 2024, y está disponible bajo la NVIDIA Open Model License, lo que permite su uso comercial. El repositorio analizado (`joincrksilverb/Nemotron-Mini-4B-Instruct`) es una copia del modelo original de NVIDIA, que puede encontrarse en `nvidia/Nemotron-Mini-4B-Instruct`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Decoder (Nemotron-4) |
| Parametros totales | 4.000 millones (aprox. 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Nemotron-Mini-4B-Instruct es un modelo Transformer decoder autoregresivo con un tamaño de embedding de 3072, 32 cabezas de atencion y una dimension intermedia de MLP de 9216. Emplea Grouped-Query Attention (GQA) y Rotary Position Embeddings (RoPE). El modelo base, `Minitron-4B-Base`, fue obtenido mediante poda y destilacion a partir de Nemotron-4 15B, una tecnica de compresion de LLM que reduce el numero de parametros manteniendo una parte sustancial de la calidad. Posteriormente, el modelo fue afinado para instrucciones con un formato de prompt especifico que incluye etiquetas como `<extra_id_0>` y `<extra_id_1>`, y soporta un flujo de conversacion que incorpora herramientas y contexto para llamadas a funciones.

Los datos de entrenamiento no se detallan en la informacion disponible. El modelo fue entrenado entre febrero y agosto de 2024. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles para tareas de roleplay, con respuestas contextualmente coherentes y adaptadas a personajes.
- Recuperacion aumentada por generacion (RAG): el modelo puede integrar contexto externo para responder preguntas sobre documentos.
- Llamada a funciones (function calling): soporta un formato de prompt que incluye bloques `<tool>` y `<toolcall>`, lo que permite invocar herramientas externas.
- Conversacion multi-turno con un formato de chat estructurado que distingue entre sistema, usuario, asistente y herramienta.
- No soporta vision ni audio; es un modelo puramente textual.
- Idiomas: exclusivamente ingles.

## Casos de uso

- Roleplay en videojuegos: el modelo puede dar vida a personajes no jugadores (NPCs) con respuestas coherentes y personalidad, como se demuestra en la integracion con NVIDIA ACE para juegos.
- Asistente de soporte al cliente: gracias a su capacidad de RAG y a su ventana de 4.096 tokens, puede responder preguntas basandose en documentacion interna de la empresa.
- Automatizacion de tareas con herramientas: mediante function calling, puede integrarse en pipelines que requieren consultar APIs, bases de datos o servicios externos.
- Chatbot conversacional en dispositivos locales: al ser un SLM, es adecuado para su despliegue en entornos con recursos limitados, como portatiles o sistemas embebidos.
- Generacion de respuestas en aplicaciones de entretenimiento: ideal para chatbots de personajes en entornos de realidad virtual o simulaciones.
- Asistente de recuperacion de informacion: puede utilizarse como componente de un sistema RAG para resumir y extraer datos de documentos largos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- El tamano del repositorio es de 16.8 GB, lo que sugiere pesos en precision completa; para inferencia en FP16 se requeriria al menos 8 GB de VRAM, aunque este dato no esta confirmado.
- Opciones de despliegue: el modelo es compatible con la libreria Transformers (PyTorch) y se menciona el uso con NVIDIA AI Inference Manager (AIM) SDK. Tambien esta disponible en build.nvidia.com.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks que permitan una comparacion de rendimiento. A continuacion se muestra una comparacion de especificaciones tecnicas con otros modelos pequenos de tamano similar, aunque los datos de rendimiento no estan disponibles:

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| Nemotron-Mini-4B-Instruct | 4B | 4.096 | Ingles | NVIDIA Open Model License |
| Llama 3 8B | 8B | 8.192 | Multilingue | Llama 3 Community License |
| Phi-3-mini | 3.8B | 128.000 | Multilingue | MIT |
| Gemma 2 2B | 2B | 8.192 | Multilingue | Gemma Terms of Use |

## Limitaciones y advertencias

- El modelo fue entrenado con datos que contienen lenguaje toxico y sesgos sociales procedentes de internet, por lo que puede amplificar estos sesgos y generar respuestas toxicas si se le provoca.
- Puede producir respuestas inexactas, omitir informacion clave o incluir texto irrelevante o redundante, incluso con prompts no ofensivos.
- El rendimiento puede degradarse significativamente si no se utiliza el formato de prompt recomendado.
- Solo soporta ingles; no es adecuado para tareas multilingues.
- La ventana de contexto de 4.096 tokens es limitada en comparacion con modelos mas recientes.
- La licencia NVIDIA Open Model License permite uso comercial, pero incluye condiciones especificas que deben revisarse antes de su despliegue en produccion.

## Enlaces

- Repositorio analizado: https://huggingface.co/joincrksilverb/Nemotron-Mini-4B-Instruct
- Repositorio original: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct
- Paper de Nemotron-4 15B: https://arxiv.org/abs/2402.16819
- Paper de compresion de LLM: https://arxiv.org/abs/2407.14679
- Blog de NVIDIA sobre despliegue on-device: https://developer.nvidia.com/blog/deploy-the-first-on-device-small-language-model-for-improved-game-character-roleplay/
- Demo de integracion en videojuego: https://www.youtube.com/watch?v=d5z7oIXhVqg
- Modelo en build.nvidia.com: https://build.nvidia.com/nvidia/nemotron-mini-4b-instruct
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
