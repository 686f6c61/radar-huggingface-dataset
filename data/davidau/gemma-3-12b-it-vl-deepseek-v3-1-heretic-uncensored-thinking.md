# DavidAU/gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking

## Resumen

gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking es un fine-tune del modelo multimodal Gemma 3 12B Instruct, desarrollado por DavidAU. El modelo parte de la base DreamFast/gemma-3-12b-it-heretic (una version "abliterated" de Gemma 3 12B, es decir, con los mecanismos de rechazo suprimidos mediante la tecnica Heretic) y se afina adicionalmente con el dataset de razonamiento TeichAI/deepseek-v3.2-speciale-1000x, empleando Unsloth sobre hardware local. El resultado es un modelo image-text-to-text de 12.187 millones de parametros que combina vision, contexto de 128k tokens y un modo de razonamiento ("thinking") compacto pero detallado.

El modelo esta orientado a generacion creativa sin filtros: escritura de ficcion, narrativa, generacion de tramas y continuacion de escenas, con capacidad de procesar imagenes. Su relevancia para desarrolladores radica en que ofrece un modelo multimodal de 12B con licencia Apache 2.0, contexto largo y modo de razonamiento activable, todo ello sin las restricciones de contenido tipicas de los modelos instruct convencionales. Los benchmarks publicados por el autor muestran un rendimiento en tareas de comprension (ARC, BoolQ, HellaSwag, PIQA, Winogrande) ligeramente inferior al de su base Heretic en algunas metricas, un compromiso tipico del afinado con datos de razonamiento.

El modelo se distribuye en formato safetensors con pesos en bfloat16, ocupa 24,4 GB en el repositorio y esta etiquetado unicamente para ingles. Su pipeline es image-text-to-text, lo que lo situa en la categoria de modelos vision-lenguaje pequenos y desplegables en GPU de consumo con cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 3, vision + texto) |
| Parametros totales | 12.187.325.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (segun model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bfloat16; el autor menciona opciones de cuantizacion via plantillas jinja y herramientas de terceros, pero sin listar formatos) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16); repo de 24,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B Instruct de Google, un transformer multimodal que procesa texto e imagenes. Sobre esa base, DreamFast aplico la tecnica Heretic (abliteration) para eliminar los rechazos del modelo original: la model card reporta una divergencia KL de 0,0826 respecto al modelo original y una reduccion de rechazos de 98/100 a 7/100 en un conjunto de prueba de 100 prompts. Posteriormente, DavidAU realizo un fine-tune con Unsloth sobre el dataset TeichAI/deepseek-v3.2-speciale-1000x, compuesto por 1000 muestras de razonamiento estilo DeepSeek, ejecutado en hardware local bajo Linux.

El entrenamiento introduce un modo de razonamiento ("thinking") que el autor describe como compacto pero muy detallado, y que afecta tanto la operacion general del modelo como la generacion de salida, el procesamiento de imagenes y los benchmarks. El modelo incluye dos plantillas de chat Jinja (una regular y una "thinking") que permiten forzar el modo de razonamiento de forma permanente, y el autor indica que el razonamiento se activa automaticamente en la mayoria de casos gracias al fine-tune, pudiendo reforzarse con el prefijo "think deeply:" en el prompt. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset mas alla de su identificador.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking", con trazas de pensamiento entre etiquetas `<think>` y `</think>`.
- Procesamiento de imagenes (pipeline image-text-to-text): el razonamiento mejora tambien el analisis de imagenes segun el autor.
- Escritura creativa y de ficcion: narrativa, generacion de tramas y subtramas, continuacion de escenas, storytelling en todos los generos (ciencia ficcion, romance, etc.).
- Generacion de contenido sin censura: el modelo no rechaza peticiones de contenido explicito, si bien el autor advierte que en algunos casos requiere direccion explicita (por ejemplo, indicar el vocabulario o el registro deseado) para alcanzar el nivel de explicitud esperado.
- Conversacion multi-turno con contexto de hasta 128k tokens.
- Soporte de system prompt para modular el razonamiento y la generacion; el autor proporciona ejemplos de system prompts (uno "profesional" y otro de rol).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking permite cadenas de razonamiento, pero no se describe integracion con frameworks de agentes.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Escritura de ficcion asistida: el modelo esta afinado especificamente para narrativa, tramas y subtramas, por lo que puede generar borradores de relatos, desarrollar arcos argumentales o continuar escenas existentes manteniendo coherencia gracias al contexto de 128k tokens.
- Generacion de guiones y dialogos para videojuegos o rol: con las plantillas de chat y los system prompts de rol incluidos, puede interpretar personajes de forma consistente en sesiones largas, aprovechando el contexto extendido para recordar el historial de la partida.
- Analisis de imagenes con razonamiento: al ser un modelo vision-lenguaje, puede describir, interpretar o razonar sobre imagenes adjuntas, y el modo thinking anade una capa de analisis explicita antes de la respuesta final.
- Prototipado de aplicaciones creativas sin filtros: para equipos que desarrollan herramientas de escritura adulta, terror o contenido controversial, el modelo evita los rechazos sistematicos del Gemma original (7/100 frentes a 98/100), reduciendo la friccion en el pipeline.
- Generacion de contenido editorial de genero: romance, ciencia ficcion, terror u otros generos donde los modelos instruct convencionales suelen suavizar el tono; el autor documenta que basta indicar el registro o vocabulario deseado para obtener el nivel de explicitud requerido.
- Experimentacion con tecnicas de abliteration y fine-tune: util como caso de estudio reproducible para investigadores que quieran comparar el impacto de Heretic + fine-tune de razonamiento sobre un modelo base de 12B, con metricas de divergencia KL y rechazos publicadas.
- Despliegue en local para generacion de texto e imagenes: al ser un modelo de 12B en bfloat16 (24,4 GB), puede ejecutarse en estaciones de trabajo con GPU unica y cuantizarse para GPUs de consumo, sirviendo como backend para interfaces tipo KoboldCpp, text-generation-webui o Silly Tavern (el autor documenta ajustes de smoothing_factor 1.5 en estas herramientas).

## Benchmarks y rendimiento

Resultados publicados en la model card (probabilidad de acierto por tarea):

| Benchmark | Este modelo | Base Heretic (sin fine-tune) |
|---|---|---|
| ARC Challenge | 0,515 | 0,534 |
| ARC Easy | 0,645 | 0,699 |
| BoolQ | 0,861 | 0,872 |
| HellaSwag | 0,705 | 0,603 |
| OpenBookQA | 0,460 | 0,448 |
| PIQA | 0,785 | 0,733 |
| Winogrande | 0,712 | 0,658 |

Metricas de des-censura (Heretic):

| Metrica | Este modelo | google/gemma-3-12b-it |
|---|---|---|
| Divergencia KL | 0,0826 | 0 (por definicion) |
| Rechazos | 7/100 | 98/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento o codigo en la informacion disponible. Los benchmarks mostrados fueron medidos por Nightmedia segun los agradecimientos de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 24-26 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda una GPU de 40 GB o superior (A100 40GB, A6000, H100) para contexto largo sin cuantizar.
- Cuantizacion a 8 bits: entorno de 13-14 GB de VRAM, viable en RTX 4090 (24 GB) con margen para contexto moderado.
- Cuantizacion a 4 bits: entorno de 7-8 GB de VRAM, cabe en RTX 3090, RTX 4080, RTX 4070 Ti y GPUs consumer de 12 GB o mas, con contexto reducido.
- GPU recomendadas: A100/H100 para produccion en bfloat16; RTX 4090 para cuantizacion 8 bits; RTX 3090/4080 para 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp/Ollama y KoboldCpp (el autor documenta el uso en KoboldCpp, text-generation-webui y Silly Tavern con smoothing_factor 1.5).
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor no publica numeros de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DavidAU) | 12,19B | 128k | Apache 2.0 | Multimodal, sin censura, modo thinking, solo ingles |
| DreamFast/gemma-3-12b-it-heretic | 12B (aprox.) | no disponible | no disponible | Base abliterated sin fine-tune de razonamiento; mejores resultados en ARC y BoolQ, peores en HellaSwag, PIQA y Winogrande |
| google/gemma-3-12b-it | 12B (aprox.) | 128k (familia Gemma 3) | Gemma Terms of Use | Modelo original con rechazos (98/100); referencia de calidad y seguridad |
| DeepSeek-V3.1 (familia) | no disponible | no disponible | no disponible | Fuente del dataset de razonamiento; no es un modelo comparable en tamano, se cita solo como origen de los datos |

No se dispone de datos de benchmarks comparativos directos con otros modelos de 12B multimodales en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido sin filtros: el modelo ha sido abliterated y afinado para eliminar rechazos; generara contenido explicito, violento o controversial si se le pide. No es apto para aplicaciones dirigidas a menores ni para entornos donde se requiera moderacion automatica.
- Alucinacion: como todo modelo generativo, puede inventar hechos, citas o detalles; el modo thinking no garantiza veracidad y el autor no publica evaluaciones de factualidad.
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Contexto: los 128k tokens declarados no garantizan atencion efectiva en toda la ventana; no se publican evaluaciones de recuperacion en contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de Gemma 3, cuyos terminos de uso originales (Gemma Terms of Use) pueden seguir aplicandose en cascada; conviene revisar la compatibilidad antes de un despliegue comercial.
- Calidad en benchmarks: el fine-tune de razonamiento degrada ligeramente varias metricas de comprension respecto a la base Heretic (ARC Easy de 0,699 a 0,645; BoolQ de 0,872 a 0,861), lo que sugiere un posible compromiso en tareas de conocimiento general.
- Directividad: segun el autor, el modelo necesita en algunos casos instrucciones explicitas (vocabulario, registro) para alcanzar el nivel de explicitud esperado; sin ellas, el contenido puede resultar mas blando de lo previsto.
- Reproducibilidad: el entrenamiento se realizo en hardware local con Unsloth y no se detallan hiperparametros, numero de tokens ni composicion completa del dataset, lo que dificulta la reproduccion exacta.
- Madurez: el repositorio tiene 77 descargas y 9 likes en el momento de la consulta; es un modelo de nicho con validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking
- Modelo base: https://huggingface.co/DreamFast/gemma-3-12b-it-heretic
- Modelo original: https://huggingface.co/google/gemma-3-12b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/deepseek-v3.2-speciale-1000x
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
