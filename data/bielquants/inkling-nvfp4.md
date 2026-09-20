# bielquants/Inkling-NVFP4

## Resumen

Inkling-NVFP4 es la versión cuantizada en NVFP4 del modelo multimodal Inkling, desarrollado por Thinking Machines. La ficha analizada corresponde al repositorio bielquants/Inkling-NVFP4, una publicación de terceros (0 descargas y 0 "likes" en el momento del análisis) cuyo modelo base declarado es thinkingmachines/Inkling. Inkling es un transformer autoregresivo decoder-only de 66 capas con retroalimentación de mezcla de expertos (MoE) dispersa que acepta texto, imagen, vídeo y audio y produce texto.

Según la model card del modelo base, Inkling declara 975.000 millones de parámetros totales y 41.000 millones activos por token, con enrutamiento a 6 de 256 expertos más 2 expertos compartidos. El recuento real de parámetros del checkpoint safetensors de este repositorio es de 552.845.034.562, y el repositorio ocupa 592 GB. La discrepancia entre ambas cifras no está explicada en la información disponible.

La relevancia del modelo reside en que combina pesos abiertos bajo licencia Apache 2.0 con resultados competitivos en razonamiento, matemáticas y código agéntico (97,1 % en AIME 2026, 87,2 % en GPQA Diamond y 77,6 % en SWEBench Verified), además de recetas de despliegue publicadas para vLLM, SGLang, TokenSpeed, Unsloth y transformers. La variante NVFP4 busca reducir el coste de memoria frente al checkpoint BF16 para facilitar su servicio en clústeres con GPUs Blackwell.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 66 capas con MoE disperso (6 de 256 expertos enrutados por token + 2 expertos compartidos) y atención híbrida local/global; multimodal nativo (texto, imagen, vídeo y audio) |
| Parámetros totales | 975.000 millones declarados en la model card; 552.845.034.562 según el recuento de safetensors de este repositorio |
| Parámetros activos | 41.000 millones (según la model card del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (punto flotante de 4 bits); el modelo base también se publica en BF16. La etiqueta del repositorio incluye "8-bit", en contradicción con NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales según la model card; no se detalla la lista de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modalidades de entrada | Texto en UTF-8, imagen en cualquier formato basado en píxeles (idealmente entre 40 px y 4096 px por dimensión), vídeo y audio en WAV a 16 kHz (idealmente menos de 20 minutos) |
| Modalidades de salida | Texto en UTF-8 |
| Tamaño del repositorio | 592 GB |
| Fecha de publicación | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

Inkling es un transformer decoder-only de 66 capas con una columna vertebral de mezcla de expertos dispersa: cada token se enruta a 6 de 256 expertos, a los que se suman 2 expertos compartidos activos en todos los tokens. La atención combina capas locales y globales, un patrón habitual para reducir el coste cuadrático en secuencias largas manteniendo acceso a contexto global. El modelo es multimodal de forma nativa: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder.

Los datos de entrenamiento abarcan texto, imagen, audio y vídeo, procedentes de fuentes públicas de internet, repositorios accesibles públicamente, terceros y generación o aumento sintético. El proceso de curación incluye limpieza, procesamiento, deduplicación y filtrado para eliminar datos de baja calidad y por motivos de seguridad. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la longitud de contexto soportada. Como innovaciones destacables, la model card documenta un parámetro de esfuerzo de razonamiento (los resultados se reportan con effort=0.99), uso de herramientas y soporte de NVFP4 además de BF16.

## Capacidades

- Generación de texto y conversación general multi-turno, con seguimiento de instrucciones.
- Razonamiento complejo y matemáticas: 97,1 % en AIME 2026 y 87,2 % en GPQA Diamond con effort=0.99.
- Razonamiento asistido por herramientas: 46,0 % en HLE con herramientas frente a 29,7 % sin ellas.
- Codificación agéntica: 77,6 % en SWEBench Verified y 54,3 % en SWEBench Pro (Public).
- Comprensión de imagen: entrada en cualquier formato de píxeles, con resolución recomendada entre 40 px y 4096 px por dimensión.
- Comprensión de vídeo mediante el codificador jerárquico de parches.
- Comprensión de audio: entrada WAV a 16 kHz, idealmente en fragmentos de menos de 20 minutos (etiqueta audio-text-to-text).
- Soporte para sistemas agénticos y de uso de herramientas, según los casos de uso declarados por el autor (asistentes de código, chatbots y sistemas RAG).
- Capacidades multilingües generales más allá del inglés y soporte de múltiples lenguajes de programación, sin listado detallado.
- Modo de razonamiento con esfuerzo configurable (resultados publicados con effort=0.99).

## Casos de uso

- Asistentes de código agénticos: con un 77,6 % en SWEBench Verified y soporte de uso de herramientas, el modelo puede resolver tareas de reparación y refactorización sobre repositorios completos en varios pasos, integrado en flujos tipo agente con ejecución de tests.
- Atención al cliente multimodal: admite conversaciones multi-turno con entradas de texto y audio, lo que permite gestionar consultas telefónicas o grabaciones de voz transcritas y analizadas en la misma sesión.
- Análisis de documentos con imágenes: la entrada de imagen con resolución de hasta 4096 px por dimensión permite procesar capturas de pantalla, diagramas, facturas escaneadas o gráficos junto con texto de contexto.
- Revisión automática en pipelines de CI/CD: el modelo puede conectarse a través de tool calling para leer diffs, consultar el estado de los tests y publicar comentarios de revisión, apoyándose en su rendimiento en tareas de código.
- Generación aumentada por recuperación (RAG): el autor lo declara apto para sistemas RAG, de modo que puede combinarse con un índice vectorial para responder con contexto documental en dominios técnicos.
- Análisis de reuniones y material audiovisual: la entrada de audio WAV a 16 kHz y de vídeo permite resumir reuniones, extraer acuerdos y generar actas a partir de grabaciones de hasta 20 minutos por fragmento.
- Investigación y ajuste fino: al publicarse con pesos abiertos y con recetas para Tinker Cookbook, Unsloth y transformers, sirve como base para experimentación académica y especialización en dominios concretos.
- Asistentes conversacionales generales: el pipeline image-text-to-text y la etiqueta conversational lo orientan a chatbots de propósito general con entrada de imagen.
- Servicio de inferencia a gran escala: las recetas para vLLM, SGLang y TokenSpeed permiten desplegarlo como endpoint compatible con la API de OpenAI en clústeres con memoria agregada suficiente.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base Inchling, medidos con effort=0.99. Las puntuaciones comparativas se generaron el 14 de julio de 2026. Los datos corresponden al modelo Inkling de referencia, no a este repositorio cuantizado, que no aporta evaluaciones propias.

| Categoría | Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|---|
| Razonamiento | HLE (solo texto) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| Razonamiento | HLE (con herramientas) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| Razonamiento | AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | – | 99,9 % |
| Razonamiento | GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| Agéntico (código) | SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | – | 80,6 % | 80,6 % | 95,0 % | – |
| Agéntico (código) | SWEBench Pro (Public) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | no disponible (tabla truncada en la fuente) | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks específicos del checkpoint NVFP4 de bielquants ni mediciones de latencia o throughput.

## Requisitos de hardware

- El repositorio ocupa 592 GB, por lo que cargar los pesos tal cual exige al menos unos 600 GB de memoria agregada solo para los parámetros, antes de contar caché KV, activaciones y buffers de servicio.
- Con GPUs de 141 GB (H200), se necesitan al menos 5 unidades para los pesos, y 8 para operar con margen para caché KV y batching (8 × 141 GB = 1.128 GB).
- Con B200 (192 GB), 8 unidades ofrecen 1.536 GB; 4 unidades (768 GB) resultan ajustadas para pesos más caché.
- Con H100 o A100 de 80 GB, 8 unidades suman 640 GB, lo que deja poco margen para caché KV y activaciones; se recomienda cuantización adicional o paralelismo tensorial agresivo.
- No cabe en GPUs de consumo: una RTX 4090 (24 GB) o una RTX 5090 (32 GB) son insuficientes, y harían falta del orden de 19-20 GPUs de 32 GB solo para alojar los pesos, sin margen operativo.
- NVFP4 se acelera de forma nativa en la quinta generación de tensor cores de Blackwell (B200/GB200). En plataformas Hopper o Ada la ejecución requiere de-cuantización, lo que eleva el requisito de memoria hacia el rango de 1,1 TB si se materializan los pesos en BF16.
- Opciones de despliegue documentadas: vLLM, SGLang, TokenSpeed, Unsloth y transformers (librería declarada). No se ofrecen pesos GGUF, por lo que llama.cpp y Ollama no están soportados según la información disponible; tampoco se menciona TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWEBench Verified | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bielquants/Inkling-NVFP4 (este repositorio) | 552.845.034.562 (safetensors) | no disponible | no evaluado | no evaluado | Apache 2.0 | 0 descargas, réplica de terceros |
| thinkingmachines/Inkling (BF16) | 975.000 M totales / 41.000 M activos | no disponible | 77,6 % | 87,2 % | Apache 2.0 | Pesos abiertos, con playground y API |
| thinkingmachines/Inkling-NVFP4 | 975.000 M totales / 41.000 M activos (declarados) | no disponible | 77,6 % | 87,2 % | Apache 2.0 | Pesos abiertos, publicación oficial |
| Nemotron 3 Ultra | no disponible | no disponible | 70,7 % | 86,7 % | pesos abiertos | pesos abiertos |
| Kimi K2.6 | no disponible | no disponible | 80,2 % | 91,1 % | pesos abiertos | pesos abiertos |
| DeepSeek V4 Pro | no disponible | no disponible | 80,6 % | 88,8 % | pesos abiertos | pesos abiertos |
| GLM 5.2 | no disponible | no disponible | – | 89,5 % | pesos abiertos | pesos abiertos |
| GPT 5.6 Sol (xhigh) | no disponible | no disponible | – | 94,1 % | propietaria | solo API |

## Limitaciones y advertencias

- No hay evaluaciones publicadas del checkpoint NVFP4 de bielquants: se desconoce la degradación de calidad introducida por la cuantización en razonamiento, código o multimodalidad.
- El repositorio tiene 0 descargas y 0 "likes", sin validación de la comunidad ni garantía de que la conversión sea fiel al checkpoint oficial thinkingmachines/Inkling-NVFP4.
- Existe una discrepancia no explicada entre los 975.000 millones de parámetros declarados en la model card y los 552.845.034.562 parámetros del recuento de safetensors.
- La etiqueta "8-bit" del repositorio contradice el formato NVFP4 (4 bits) indicado en el nombre, lo que puede confundir sobre el espacio real de memoria necesario.
- La model card no documenta la longitud de contexto soportada, dato crítico para dimensionar caché KV y planificar despliegues.
- La cobertura multilingüe se describe únicamente como "capacidades generales"; el modelo está pensado principalmente para inglés, sin lista de idiomas ni métricas por idioma.
- Riesgo de alucinación inherente a los modelos generativos, sin tasas publicadas de fidelidad ni de atribución de fuentes.
- Aunque el repositorio declara licencia Apache 2.0, el modelo base de Thinking Machines está sujeto a una política de uso aceptable, por lo que conviene revisar ambas antes de un uso comercial.
- El requisito de hardware (592 GB de pesos) descarta el despliegue en GPUs de consumo y exige clústeres multinodo con GPUs de centro de datos.
- La aceleración NVFP4 depende de hardware Blackwell; en otras plataformas el rendimiento y el consumo de memoria se degradan notablemente.
- No se publican mediciones de latencia, throughput ni coste por token.

## Enlaces

- Repositorio analizado: https://huggingface.co/bielquants/Inkling-NVFP4
- Modelo base en BF16: https://huggingface.co/thinkingmachines/Inkling
- Versión NVFP4 oficial: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentación de Unsloth para Inkling: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente páginas de ayuda de YouTube sin relación con la ficha).
