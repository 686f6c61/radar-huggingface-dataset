# Alejosaurio/TinyLlama-1.1b_DPO_Sin_Censura-GGUF

## Resumen

Este modelo es una adaptación de TinyLlama, un transformer compacto de 1.100 millones de parámetros, fine-tuneado con el dataset `Intel/orca_dpo_pairs` y un conjunto de datos personal con contenido NSFW sin censura. El autor, Alejosaurio, lo presenta como un proyecto experimental, reconociendo que no ha tenido buenas experiencias previas con modelos TinyLlama, pero que al probarlo en KoboldCpp (vía Colab) funcionó "no para nada mal". El modelo base es `Danielbrdz/Barcenas-Tiny-1.1b-DPO`, que a su vez es un fine-tuning con DPO sobre TinyLlama. Se distribuye en formato GGUF cuantizado a 4 bits, lo que permite ejecutarlo en hardware modesto. Su relevancia radica en ofrecer una alternativa pequeña y sin restricciones de contenido para tareas de generación de texto en inglés y español, aunque con capacidades limitadas por su tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama 2) |
| Parametros totales | 1.100.048.384 (1,1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (según etiqueta) |
| Idiomas soportados | Inglés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

TinyLlama es un modelo de lenguaje de 1,1B parámetros con arquitectura de transformer similar a Llama 2, preentrenado en aproximadamente 1 billón de tokens (hasta 3 épocas) utilizando optimizaciones como FlashAttention y Lit-GPT. El modelo base `Danielbrdz/Barcenas-Tiny-1.1b-DPO` aplica un fine-tuning con DPO (Direct Preference Optimization) sobre TinyLlama. Este modelo concreto añade un dataset personal con contenido NSFW sin censura, también mediante DPO, aunque no se proporcionan detalles sobre el tamaño o composición de ese dataset adicional. El autor indica que es un proyecto experimental y no se documentan innovaciones técnicas adicionales más allá del fine-tuning.

## Capacidades

- Generación de texto en inglés y español.
- Conversación multi-turno (etiqueta `conversational`).
- Generación de contenido sin censura, incluyendo material NSFW (según la descripción del autor).
- No se documenta soporte para tool calling, razonamiento multi-paso, visión ni otras capacidades especiales.
- Al ser un modelo de 1,1B, su capacidad de razonamiento y coherencia es limitada en comparación con modelos más grandes.

## Casos de uso

- Generación de contenido creativo para adultos: el modelo puede producir relatos o diálogos con temática NSFW sin restricciones, adecuado para plataformas de ficción interactiva o juegos de rol.
- Chatbots para nichos específicos: su tamaño reducido permite desplegarlo en entornos con pocos recursos, como Raspberry Pi o servidores pequeños, para atender conversaciones en inglés o español.
- Prototipado rápido de aplicaciones de chat: al ser un modelo GGUF de 4 bits, se puede integrar fácilmente en proyectos con llama.cpp u Ollama para validar ideas antes de escalar a modelos mayores.
- Experimentación con fine-tuning DPO: sirve como base para probar técnicas de alineación o ajuste con datasets personalizados, dado su bajo coste de entrenamiento e inferencia.
- Generación de historias o diálogos en entornos sin conexión: al ser ligero, puede ejecutarse en portátiles sin GPU dedicada, facilitando la creación de contenido offline.
- Pruebas de rendimiento en hardware de gama baja: útil para evaluar la viabilidad de modelos de 1B en dispositivos con poca memoria, como teléfonos o microordenadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de rendimiento más allá de una impresión subjetiva de funcionamiento en KoboldCpp.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB con cuantización 4-bit (el repositorio ocupa 0,7 GB en disco).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso CPU con suficiente RAM.
- Cabe en GPUs consumer de gama baja y media; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, KoboldCpp (mencionado por el autor), y potencialmente vLLM o TGI, aunque no se confirma compatibilidad.
- Latencia y throughput: no disponibles; dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0 | 1,1B | No disponible | Apache 2.0 | safetensors | Chat oficial de TinyLlama, sin fine-tuning NSFW |
| TinyLlama-1.1b_DPO_Sin_Censura-GGUF (este) | 1,1B | No disponible | Apache 2.0 | GGUF | Fine-tuning DPO con contenido NSFW |
| Qwen2-0.5B | 0,5B | 32K (típico) | Apache 2.0 | safetensors, GGUF | Modelo más pequeño, con mejor soporte multilingüe |

No se dispone de datos de rendimiento comparativo. La comparación se basa en parámetros y características generales.

## Limitaciones y advertencias

- Modelo experimental: el autor advierte que no ha tenido buenas experiencias con TinyLlama y que el resultado puede ser impredecible.
- Contenido NSFW: el modelo está diseñado para generar contenido sin censura, lo que puede incluir material inapropiado para menores o entornos profesionales.
- Tamaño reducido: con 1,1B parámetros, la coherencia, el razonamiento y la precisión factual son limitados, con alto riesgo de alucinaciones.
- Sesgos: al estar entrenado con datos de preferencias (DPO) y un dataset personal, puede reflejar sesgos del autor o del dataset base.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones legales según el contexto.
- No se documenta la longitud de contexto, lo que dificulta planificar su uso en conversaciones largas.

## Enlaces

- [HuggingFace - Alejosaurio/TinyLlama-1.1b_DPO_Sin_Censura-GGUF](https://huggingface.co/Alejosaurio/TinyLlama-1.1b_DPO_Sin_Censura-GGUF)
- [HuggingFace - Novaciano/TinyLlama-1.1b_DPO_Sin_Censura-GGUF](https://huggingface.co/Novaciano/TinyLlama-1.1b_DPO_Sin_Censura-GGUF) (versión similar, cuantizada por Novaciano)
- [Paper de TinyLlama (arXiv)](https://arxiv.org/html/2401.02385)
- [Repositorio GitHub de TinyLlama](https://github.com/jzhang38/TinyLlama)
- [Modelo base: Danielbrdz/Barcenas-Tiny-1.1b-DPO](https://huggingface.co/Danielbrdz/Barcenas-Tiny-1.1b-DPO) (no se proporciona URL directa, pero es el nombre del modelo base)
