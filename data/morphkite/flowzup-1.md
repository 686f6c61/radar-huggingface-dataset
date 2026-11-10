# Morphkite/Flowzup-1

## Resumen

Flowzup 1 es un modelo de lenguaje conversacional especializado en indonesio, desarrollado por Morphkite bajo la marca Flowzup. Se presenta como la primera versión de un asistente de IA para atención al cliente y conversaciones naturales con usuarios en Indonesia, con un estilo deliberadamente cercano y desenfadado, imitando el tono de WhatsApp. El modelo se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M, pensado para ejecutarse con llama.cpp.

Arquitectónicamente, los metadatos del repositorio indican 4.647.450.147 parámetros totales, lo que sitúa al modelo en la categoría de ~4,6 mil millones de parámetros. La model card declara una longitud de contexto de 131.072 tokens, aunque no se especifica la arquitectura base ni el proceso de entrenamiento. El modelo soporta indonesio e inglés como idiomas principales.

La relevancia de Flowzup 1 es limitada y muy específica: se trata de un modelo de nicho orientado a un caso de uso concreto (chatbot de atención al cliente en indonesio) con un sistema de prompt de identidad empaquetado en el repositorio. No hay información pública sobre benchmarks, licencia ni detalles de entrenamiento, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, inferido por el formato GGUF y el uso con llama.cpp) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (según model card) |
| Tipos de cuantizacion | Q4_K_M (única publicada) |
| Idiomas soportados | indonesio (id), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Flowzup-1-Q4_K_M.gguf`, 3,43 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. Los metadatos y el formato de distribución (GGUF, ejecutable con llama.cpp) son compatibles con una arquitectura transformer, pero el autor no especifica la familia base, el número de capas, la dimensionalidad ni el mecanismo de atención. Tampoco se documenta si emplea atención lineal, decodificación especulativa u otras optimizaciones.

En cuanto al entrenamiento, la model card no indica el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El único artefacto relacionado con el comportamiento es el archivo `flowzup-system.txt`, que contiene el system prompt de identidad y las reglas de formato tipo WhatsApp; esto sugiere que el estilo conversacional se controla en gran medida mediante prompting más que mediante un post-entrenamiento documentado. El modelo se distribuye con la instrucción explícita de usar `--reasoning off`, lo que indica que la plantilla o el comportamiento por defecto incluye algún modo de razonamiento que el autor recomienda desactivar para respuestas directas.

## Capacidades

- Generación de texto conversacional en indonesio, con tono cercano y formalidad moderada orientada a chat.
- Comprensión y generación en inglés como idioma secundario.
- Conversación multi-turno con contexto declarado de hasta 131.072 tokens.
- Soporte de system prompt de identidad mediante `flowzup-system.txt`, que define personalidad y reglas de formato.
- Despliegue como servidor API compatible con OpenAI a través de `llama-server` (alias `Flowzup-1`).
- Ejecución local mediante `llama-cli` y script auxiliar `flowzup.sh` para modos chat y server.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades.

## Casos de uso

- Atención al cliente por WhatsApp: el modelo está diseñado para gestionar conversaciones multi-turno con un tono cercano y reglas de formato tipo WhatsApp, usando el system prompt incluido para mantener la identidad de marca y el estilo de respuesta.
- Chatbot de primer nivel en sitios web indonesios: con 131.072 tokens de contexto declarados, puede mantener el hilo de conversaciones largas con historial extenso sin perder el contexto previo.
- Respuestas a preguntas frecuentes en e-commerce: su naturaleza conversacional y su orientación a cliente permiten redactar respuestas naturales a consultas sobre pedidos, envíos o devoluciones, siempre que se le proporcione la información de negocio en el contexto.
- Asistente de soporte interno para equipos que trabajan en indonesio: puede redactar borradores de respuestas y resúmenes de conversaciones en indonesio para agentes humanos.
- Prototipado rápido de asistentes conversacionales: al distribuirse en GGUF Q4_K_M (3,43 GB) y con un script de arranque incluido, permite levantar un endpoint compatible con OpenAI en local en pocos minutos.
- Despliegue en entornos con recursos limitados: el tamaño cuantizado permite ejecución en GPUs de consumo y en CPU, adecuado para pruebas y despliegues pequeños en infraestructura modesta.
- Traducción y adaptación de tono indonesio-inglés en contextos de atención al cliente, aprovechando el bilingüismo declarado del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 3,43 GB, por lo que se necesitan aproximadamente 4-5 GB de VRAM para cargar el modelo con contexto moderado; con contexto completo de 131.072 tokens el consumo de KV cache crece de forma significativa y puede superar los 8-12 GB según la implementación.
- GPU recomendadas: no hay recomendaciones oficiales del autor. Por tamaño, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB pueden alojar el modelo con contextos amplios; GPUs de datacenter como A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 8 GB o más de VRAM para contextos moderados; también puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, potencialmente Ollama u otras herramientas basadas en llama.cpp; no se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Flowzup 1 | 4,65 B | 131.072 | id, en | no disponible | GGUF Q4_K_M |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa fiable con modelos de la misma categoría. El autor no publica benchmarks ni detalles de arquitectura que permitan situar a Flowzup 1 frente a otros modelos de ~4-5 mil millones de parámetros orientados a conversación en indonesio.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el uso comercial está permitido, lo que supone un riesgo legal importante para producción.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, razonamiento, fidelidad o robustez frente a alucinaciones.
- Idiomas limitados a indonesio e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- El modelo depende de un system prompt externo (`flowzup-system.txt`) para su identidad y estilo; sin él, el comportamiento puede degradarse o desviarse.
- Se recomienda desactivar el modo de razonamiento (`--reasoning off`), lo que sugiere que el modo por defecto puede producir respuestas más lentas o verbosas de lo deseado en atención al cliente.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en consultas factuales sobre pedidos, políticas o datos de negocio que no estén en el contexto.
- El contexto declarado de 131.072 tokens no está verificado de forma independiente; el consumo de memoria con contextos largos puede ser elevado.
- Sesgos conocidos: no documentados por el autor; cabe esperar sesgos derivados de los datos de entrenamiento, no publicados.
- Repositorio sin descargas ni interacciones en el momento de la consulta, lo que dificulta la validación comunitaria.
- Sin garantías de mantenimiento, versionado o soporte por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Morphkite/Flowzup-1
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
