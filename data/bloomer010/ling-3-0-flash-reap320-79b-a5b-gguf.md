# bloomer010/Ling-3.0-flash-REAP320-79B-A5B-GGUF

## Resumen

Ling-3.0-flash REAP320 es un modelo de lenguaje de tipo Mixture of Experts (MoE) derivado de inclusionAI/Ling-3.0-flash, al que se le ha aplicado una poda de expertos mediante el método REAP (Router-weighted Expert Activation Pruning). El modelo original cuenta con 124B parámetros totales y 5.1B activos; tras eliminar 192 de los 512 expertos por capa (38% del total), se reduce a aproximadamente 79B parámetros totales manteniendo los mismos 5.1B activos. Esta reducción permite un despliegue más eficiente en memoria y cómputo, especialmente en entornos con recursos limitados.

La poda se realiza en una sola pasada (one-shot) sin fine-tuning posterior, utilizando una calibración con 1M de tokens (50% ultrachat, 25% wikitext, 25% código). Los expertos se puntúan según el producto del valor de la puerta del router y la norma L2 de su salida, eliminando los de menor puntuación. El resultado es un modelo más ligero que conserva la mayor parte de la capacidad del original, aunque con una posible degradación en tareas que dependen de expertos especializados.

Este modelo se distribuye en formato GGUF con varias cuantizaciones (MXFP4, Q4_K_M, Q2_K), lo que facilita su uso con llama.cpp y herramientas compatibles. Su relevancia radica en ofrecer una alternativa eficiente para inferencia en CPU o con offload de memoria, sin necesidad de GPUs de gran capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en transformer, con 512 expertos por capa (320 retenidos tras poda) |
| Parametros totales | 81.035.300.128 (aprox. 79B segun el autor) |
| Parametros activos | 5.1B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4, Q4_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-flash es un transformer MoE con 512 expertos por capa. La poda REAP elimina 192 expertos por capa (38% del total) en una sola pasada, sin entrenamiento de recuperación. La selección se basa en una puntuación que combina el valor de activación del router y la norma L2 de la salida de cada experto, calculada sobre un conjunto de calibración de 1M de tokens (50% ultrachat, 25% wikitext, 25% código). No se aplica fine-tuning posterior, por lo que el modelo conserva los pesos originales de los expertos supervivientes.

El proceso de poda reduce el número total de parámetros de 124B a aproximadamente 79B, manteniendo los 5.1B activos por token. Esto implica una reducción significativa del espacio de almacenamiento y de la memoria necesaria para cargar los pesos, aunque la memoria de activación (KV cache) permanece igual al ser independiente del número de expertos.

## Capacidades

- Generación de texto y conversación: al ser un modelo de lenguaje, puede mantener diálogos multi-turno y generar texto coherente.
- Razonamiento y comprensión: hereda las capacidades del modelo base, aunque la poda puede afectar a tareas que requieren expertos especializados.
- Soporte de chat: el tag `conversational` indica que está optimizado para interacciones de chat.
- Compatibilidad con llama.cpp: puede ejecutarse con el servidor de llama.cpp, incluyendo offload de expertos a CPU.
- No se dispone de información sobre tool calling, agentes, visión u otras capacidades específicas.

## Casos de uso

- Despliegue en entornos con GPU limitada: gracias a la poda y a las cuantizaciones, el modelo puede ejecutarse en máquinas con poca VRAM, usando offload de expertos a RAM como se muestra en el comando de ejemplo.
- Inferencia en CPU: con la cuantización MXFP4 y el offload de expertos, es posible servir el modelo en sistemas sin GPU, manteniendo la atención en GPU si está disponible.
- Chatbots y asistentes virtuales: su naturaleza conversacional lo hace adecuado para aplicaciones de atención al cliente o asistentes personales, siempre que se acepte una posible pérdida de calidad frente al modelo original.
- Prototipado rápido: al ser un modelo GGUF, se puede integrar fácilmente en proyectos con llama.cpp u Ollama para pruebas y desarrollo.
- Investigación sobre poda de expertos: sirve como ejemplo práctico de aplicación de REAP, permitiendo estudiar el impacto de la poda en el rendimiento.
- Aplicaciones con requisitos de memoria estrictos: cuando el modelo original de 124B no cabe en la memoria disponible, esta versión reducida ofrece una alternativa viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización. Para Q4_K_M, los ~79B parámetros requieren aproximadamente 40 GB de VRAM si se cargan completamente en GPU. Con offload de expertos a CPU, la VRAM puede reducirse a la necesaria para la atención y las capas de entrada/salida (típicamente unos pocos GB).
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM si se usa offload; para carga completa, se necesitan GPUs de 48 GB o más (A6000, A100, etc.).
- Compatibilidad con consumer GPU: sí, si se utiliza offload de expertos a RAM, puede funcionar en GPUs de gama media (RTX 3060, 4060, etc.) con suficiente RAM del sistema.
- Opciones de despliegue: llama.cpp (con soporte bailingmoe3, pendiente de merge en PR #26608), o el fork de aetherbird. También puede usarse con herramientas que carguen GGUF, como Ollama (si se añade soporte).
- Latencia y throughput: no disponibles, pero se espera que sea menor que el modelo original debido a la reducción de parámetros.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con la misma técnica de poda en la información proporcionada.

## Limitaciones y advertencias

- La poda sin fine-tuning puede degradar el rendimiento en tareas que dependen de expertos especializados, especialmente en razonamiento complejo o dominios específicos.
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de idioma.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- El soporte en llama.cpp requiere una versión con el PR #26608 fusionado o el fork correspondiente; hasta entonces, no es compatible con builds estándar.
- El contexto máximo no está documentado; el comando de ejemplo usa 65536 tokens, pero no se garantiza que sea el límite del modelo.
- Al ser una versión podada, puede presentar inconsistencias en la generación si el router activa expertos que fueron eliminados, aunque el método REAP intenta minimizar este efecto.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/bloomer010/Ling-3.0-flash-REAP320-79B-A5B-GGUF)
- [Modelo base: inclusionAI/Ling-3.0-flash](https://huggingface.co/inclusionAI/Ling-3.0-flash)
- [Paper de REAP (arXiv:2510.13999)](https://arxiv.org/abs/2510.13999)
- [PR de soporte bailingmoe3 en llama.cpp](https://github.com/ggml-org/llama.cpp/pull/26608)
- [Fork de llama.cpp con soporte bailingmoe3](https://github.com/aetherbird/llama.cpp/tree/bailingmoe3-support)
