# baerquants/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal autoregresivo de propósito general desarrollado por Thinking Machines que acepta entradas de texto, imagen y audio y genera texto. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y está pensado para desarrolladores que construyen aplicaciones con agentes, uso de herramientas (tool calling), asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). La ficha consultada corresponde al repositorio `baerquants/Inkling-Small`, una copia cuyos enlaces de model card apuntan al repositorio oficial `thinkingmachines/Inkling-Small`.

La arquitectura es un transformer decoder-only de 42 capas con backbone de mezcla de expertos dispersa (MoE): cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La model card declara 276B parámetros totales y 12B activos, mientras que el recuento real de los ficheros safetensors del repositorio asciende a 265.956.439.090 parámetros (unos 266B), con un tamaño de repositorio de 531,9 GB, coherente con pesos en BF16.

El modelo es relevante porque combina una ventana de cómputo baja por token (12B activos) con una huella de memoria de modelo grande, lo que lo sitúa en la categoría de MoE de gran escala junto a alternativas como Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 o DeepSeek V4 Flash, que aparecen citadas en la tabla comparativa de su propia model card. Se ofrece en BF16 y NVFP4, con recetas de despliegue para SGLang, vLLM, TokenSpeed, Unsloth y Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con backbone MoE disperso (42 capas; atención híbrida de capas locales y globales) |
| Parametros totales | 276B según model card; 265.956.439.090 (~266B) según safetensors del repositorio |
| Parametros activos | 12B (6 de 256 expertos enrutados + 2 expertos compartidos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (únicas variantes publicadas según la model card) |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas; también múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; también hay recetas para SGLang, vLLM, TokenSpeed y Unsloth) |

## Arquitectura y entrenamiento

Inkling-Small es un transformer decoder-only de 42 capas con una capa de feed-forward de tipo Mixture-of-Experts dispersa: de los 256 expertos disponibles, cada token activa 6, además de 2 expertos compartidos que se aplican siempre. El mecanismo de atención es híbrido, combinando capas de atención local con capas de atención global. El modelo es nativamente multimodal: las imágenes se codifican mediante un codificador jerárquico de parches y el audio mediante codificación en tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. La model card no especifica la dimensión oculta, el número de cabezas de atención ni el número de tokens de contexto soportados.

Los datos de entrenamiento provienen de fuentes públicas (internet abierto y repositorios accesibles públicamente), de terceros y de generación o aumento sintético, e incluyen texto, imágenes, audio y vídeo. El proceso de curación aplica limpieza, procesamiento y modificación de los conjuntos, con pasos de deduplicación y filtrado para eliminar datos de baja calidad o para objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación posteriores al preentrenamiento; tampoco describe innovaciones de decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y conversación multiturno en inglés, con capacidades multilingües generales.
- Comprensión de imágenes: acepta cualquier imagen basada en píxeles, con rendimiento óptimo cuando cada dimensión está entre 40 px y 4096 px.
- Comprensión de audio: entrada en formato WAV muestreado a 16 kHz, con duración ideal por debajo de 2 minutos.
- Generación de código: la model card indica uso previsto a través de múltiples lenguajes de programación y asistentes de código.
- Uso de herramientas y sistemas agénticos: el modelo está diseñado explícitamente para aplicaciones con agentes y tool use.
- Instrucciones y tareas de lenguaje natural de propósito general.
- Generación aumentada por recuperación (RAG) sobre documentos.
- Salida exclusivamente textual en UTF-8 (no genera imagen ni audio).
- Etiqueta de pipeline `image-text-to-text` y `conversational`; compatibilidad declarada con endpoints.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede mantener diálogos multiturno en los que el usuario adjunta imágenes o audio (por ejemplo, capturas de pantalla o notas de voz), porque procesa conjuntamente texto, imagen y audio en un mismo espacio oculto del decoder.
- Atención al cliente con entrada de audio: transcripción implícita y respuesta textual a partir de mensajes de voz de hasta 2 minutos en WAV a 16 kHz, sin necesidad de un pipeline ASR separado.
- Asistentes de código: generación y revisión de código en múltiples lenguajes, integrable en entornos de desarrollo; la model card lo orienta explícitamente a asistentes de programación.
- Pipelines RAG sobre documentación técnica o catálogos: el modelo puede ingerir texto e imágenes de documentos (diagramas, capturas, esquemas) y responder preguntas fundamentadas en el contenido recuperado.
- Agentes con uso de herramientas: al estar diseñado para tool use, puede utilizarse como planificador que invoca APIs externas en flujos multi-paso, por ejemplo para consultar bases de datos o ejecutar acciones en back-office.
- Análisis de documentos con imágenes: extracción de información de facturas, formularios o informes escaneados, aprovechando el codificador de parches jerárquico para imágenes de hasta 4096 px por dimensión.
- Moderación y clasificación de contenido multimodal: evaluación de texto, imagen y audio combinados en un único paso de inferencia.
- Fine-tuning específico de dominio: al publicarse con pesos abiertos y licencia Apache 2.0, es adecuado como base para ajuste fino supervisado o DPO sobre datos propios, con soporte declarado en Unsloth.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos con modelos de pesos abiertos y cerrados, entre ellos Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash. Sin embargo, el contenido disponible de esa tabla está truncado y no expone ninguna cifra numérica, por lo que no es posible reproducir valores de MMLU, HumanEval, GSM8K ni de ningún otro benchmark.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): en BF16, aproximadamente 532 GB para los ~266B parámetros del repositorio (552 GB si se toman los 276B declarados); en NVFP4, aproximadamente 140-150 GB, estimación orientativa a partir de un empaquetado de 4 bits con escalado por bloques.
- A esa cifra hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto, no especificada en la información disponible.
- GPU recomendadas: nodos multi-GPU de centro de datos. Para BF16, del orden de 8x H100 80 GB o 8x A100 80 GB; para NVFP4, el requisito baja a aproximadamente 2x H100 80 GB o 4x A100 80 GB.
- No cabe en GPU de consumo: no es viable en una RTX 4090 (24 GB) ni en configuraciones de una sola GPU consumer, ni siquiera en NVFP4.
- No se han publicado pesos GGUF en la información disponible, por lo que no hay una ruta estándar de offload parcial a RAM/SSD con llama.cpp u Ollama. Las vías soportadas son SGLang, vLLM, TokenSpeed, Unsloth y Transformers.
- Opciones de despliegue declaradas: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers, además de acceso vía API mediante Tinker Cookbook y proveedores de inferencia externos.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, el coste de cómputo por token correspondería a un modelo denso de 12B activos, pero el ancho de banda de memoria necesario para leer los pesos completos es el de un modelo de ~266-276B.

## Comparativa con modelos similares

La model card cita estos modelos como referencia de comparación, pero el contenido recuperado no incluye sus cifras ni sus especificaciones completas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small | 276B totales / 12B activos (model card); ~266B en safetensors | no disponible | no disponible (tabla truncada) | Apache 2.0 | Pesos abiertos en BF16 y NVFP4 |
| Qwen3.5 397B-A17B | 397B totales / 17B activos (según denominación) | no disponible | no disponible | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se ha publicado la longitud de contexto soportada, dato crítico para dimensionar caché KV, coste de despliegue y casos de uso con documentos largos.
- Discrepancia en el recuento de parámetros: la model card declara 276B totales mientras que los safetensors del repositorio suman 265.956.439.090 parámetros. Conviene verificar cuál corresponde a la variante concreta que se descargue.
- El repositorio consultado (`baerquants/Inkling-Small`) presenta 0 descargas y 0 likes, y su model card enlaza al repositorio oficial `thinkingmachines/Inkling-Small`. Para uso en producción se recomienda descargar desde el repositorio oficial y verificar la integridad de los pesos.
- Riesgo de alucinación: no se documentan en la información disponible métricas de fidelidad, tasas de alucinación ni evaluaciones de robustez.
- Sesgos: la model card no incluye ninguna sección de sesgos conocidos, evaluación de sesgos ni limitaciones de seguridad más allá de mencionar filtrado por objetivos de seguridad en la curación de datos.
- Idiomas: el modelo está declarado como centrado en inglés con capacidades multilingües generales; no se especifica la lista de idiomas soportados ni su calidad relativa, lo que supone un riesgo para despliegues en castellano u otras lenguas sin evaluación previa.
- Límites de entrada: audio idealmente por debajo de 2 minutos en WAV a 16 kHz e imágenes con dimensiones entre 40 px y 4096 px para un rendimiento óptimo; fuera de esos rangos el comportamiento no está documentado.
- El modelo solo genera texto; no produce imágenes ni audio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero la model card remite a una política de uso aceptable de Thinking Machines, cuya aplicabilidad jurídica a los pesos redistribuidos conviene revisar.
- El repositorio ocupa 531,9 GB, lo que implica requisitos de almacenamiento y tiempo de descarga considerables antes de cualquier prueba.
- No hay información sobre latencia, throughput ni tasas de error en producción, por lo que cualquier dimensionamiento debe validarse con pruebas propias.

## Enlaces

- Repositorio consultado: https://huggingface.co/baerquants/Inkling-Small
- Repositorio oficial BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Variante NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground (Tinker): https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre el modelo: https://hf.co/blog/thinkingmachines-inkling
- Paper: no disponible en la información proporcionada
- Demo adicional: no disponible en la información proporcionada
