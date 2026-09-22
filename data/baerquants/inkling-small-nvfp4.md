# baerquants/Inkling-Small-NVFP4

## Resumen

Inkling-Small-NVFP4 es una cuantización en formato NVFP4 del modelo multimodal Inkling-Small, publicado por el usuario baerquants a partir de los pesos abiertos de thinkingmachines/Inkling-Small. Se trata de una conversión de pesos de terceros, no de un modelo nuevo: la arquitectura, el entrenamiento y las capacidades son las del modelo base, y el trabajo del repositorio consiste en reducir la huella de memoria mediante cuantización de 4 bits en coma flotante.

El modelo base es un transformer decoder-only de 42 capas con columna vertebral MoE (mezcla de expertos) dispersa: cada token se enruta a 6 de 256 expertos más 2 expertos compartidos activos siempre. Es nativamente multimodal —acepta texto, imagen y audio, y genera texto— con atención híbrida de capas locales y globales, un codificador jerárquico de parches para imágenes y codificación en tokens discretos para audio. La model card declara 276B parámetros totales y 12B activos, aunque el recuento real de safetensors del repositorio cuantizado indica 156.032.140.138 parámetros, una discrepancia que no queda explicada en la información disponible.

Su relevancia práctica es doble: por un lado, permite evaluar un MoE multimodal de gran tamaño con tan solo 12B parámetros activos por token; por otro, el repositorio reduce el peso en disco a 170,8 GB, lo que sitúa el despliegue en el terreno de nodos multi-GPU en lugar de clústeres grandes. El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, y no incluye evaluaciones propias de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 42 capas con MoE disperso (6 de 256 expertos por token + 2 expertos compartidos) y atención híbrida local/global |
| Parametros totales | 156.032.140.138 según el recuento de safetensors del repositorio cuantizado; la model card del modelo base declara 276B |
| Parametros activos | 12B (según la model card del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (coma flotante de 4 bits); el modelo base se distribuye en BF16; el repositorio lleva además la etiqueta "8-bit" |
| Idiomas soportados | Inglés como idioma principal, con capacidades multilingües generales según la model card; la ficha de HuggingFace no lista idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modalidades de entrada | Texto (UTF-8), imagen (cualquier imagen basada en píxeles, dimensiones óptimas entre 40 px y 4096 px), audio (WAV a 16 kHz, idealmente menos de 2 minutos) |
| Modalidades de salida | Texto (UTF-8) |
| Modelo base | thinkingmachines/Inkling-Small (relación: quantized) |
| Librería | transformers |
| Tamaño del repositorio | 170,8 GB |
| Compatibilidad | Etiqueta endpoints_compatible; recetas de despliegue publicadas para SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo decoder-only de 42 capas. La parte de feed-forward sustituye el MLP denso por una mezcla de expertos dispersa en la que cada token activa 6 de 256 expertos, más 2 expertos compartidos que se aplican a todos los tokens. La atención combina capas locales y globales (híbrido local/global). El modelo es nativamente multimodal: las imágenes pasan por un codificador jerárquico de parches, el audio por una codificación en tokens discretos, y ambas modalidades se proyectan a un espacio oculto compartido que el decoder procesa de forma conjunta con el texto.

En cuanto al entrenamiento, la model card indica que los datos cubren texto, imágenes, audio y vídeo, y que proceden de fuentes públicas, de terceros o de generación y aumento sintéticos. El proceso de curación incluye limpieza, procesado y modificación de conjuntos de datos, con deduplicación y filtrado para eliminar contenido basura o de baja calidad y para atender objetivos de seguridad. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO: esa información no está disponible. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de texto autorregresiva en tareas generales de lenguaje natural y seguimiento de instrucciones.
- Comprensión de imágenes: acepta entradas basadas en píxeles con dimensiones óptimas entre 40 px y 4096 px por lado.
- Comprensión de audio: acepta WAV a 16 kHz, con rendimiento óptimo en clips de menos de 2 minutos.
- Razonamiento y código: la model card menciona uso en asistentes de programación y soporte de múltiples lenguajes de programación.
- Tool calling y sistemas agénticos: el modelo está diseñado explícitamente para sistemas de agentes y de uso de herramientas.
- Recuperación aumentada (RAG): se cita como caso de uso previsto por el autor.
- Conversación multi-turno e instrucciones, con la etiqueta "conversational".
- Capacidades multilingües generales, con el inglés como idioma principal.
- Salida exclusivamente textual: no genera imágenes ni audio.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para su exposición como servicio.

## Casos de uso

- Asistentes de programación: el modelo puede generar y revisar código en varios lenguajes y su naturaleza MoE con 12B parámetros activos reduce el coste por token en comparación con un modelo denso del mismo tamaño total, lo que lo hace adecuado para autocompletado y revisión en IDE.
- Pipelines agénticos con tool calling: al estar diseñado para uso agéntico, puede encadenar llamadas a funciones y pasos de razonamiento multi-turno en flujos de automatización de tareas.
- RAG sobre documentación técnica: combinado con un índice vectorial, permite responder preguntas sobre corpus internos mezclando texto e imágenes de manuales o diagramas.
- Análisis de documentos con elementos visuales: al aceptar imágenes de hasta 4096 px por lado, sirve para extraer información de capturas, gráficos, tablas escaneadas y maquetas junto con el texto que las acompaña.
- Procesamiento de audio corto: con entradas WAV de 16 kHz e inferiores a 2 minutos, puede transcribir y resumir notas de voz, fragmentos de reuniones o clips de atención al cliente.
- Atención al cliente automatizada: la etiqueta "conversational" y el soporte multimodal permiten gestionar conversaciones donde el usuario adjunta capturas de pantalla o mensajes de voz, siempre que el contexto disponible lo permita (la longitud de contexto no está publicada).
- Ajuste fino específico de dominio: la licencia Apache 2.0 y las recetas publicadas para Unsloth y Tinker facilitan el fine-tuning sobre el modelo base para tareas verticales.
- Despliegue self-hosted en infraestructura propia: con recetas para vLLM y SGLang, el repositorio está pensado para servirse en nodos multi-GPU sin depender de API externa.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla comparativa de evaluaciones que enfrenta a Inkling-Small con Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, además de modelos de pesos cerrados. Sin embargo, la información proporcionada solo contiene las cabeceras de esa tabla: no se han facilitado las filas de benchmarks ni las cifras asociadas.

Por tanto: no se han publicado resultados numéricos de benchmarks en la información disponible. Tampoco existen evaluaciones específicas de esta cuantización NVFP4 frente al modelo base en BF16.

## Requisitos de hardware

- Huella en disco: 170,8 GB para el repositorio completo en NVFP4.
- VRAM estimada para inferencia: los pesos ocupan del orden de 170 GB, a lo que hay que sumar caché KV y activaciones. No se dispone de cifras oficiales de consumo de memoria; la estimación se deriva del tamaño del repositorio.
- GPU recomendadas: nodos multi-GPU de centro de datos. Como referencia aritmética, 4× A100 o 4× H100 de 80 GB (320 GB agregados) dejan margen para pesos y caché, mientras que 2× H100 de 80 GB (160 GB) quedan por debajo del tamaño de los pesos.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) son insuficientes por un margen amplio.
- Formato NVFP4: es un formato de coma flotante de 4 bits introducido por NVIDIA para su generación Blackwell. En arquitecturas anteriores (Ampere, Hopper) su decodificación requiere soporte de software específico y puede implicar memoria adicional. Esta consideración es de carácter general y no está documentada en la ficha del modelo.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace transformers, con recetas publicadas para el modelo base. La compatibilidad con endpoints también está etiquetada.
- Latencia y throughput estimados: no disponible. El dato de 12B parámetros activos por token sugiere un coste de cómputo por token muy inferior al de un modelo denso de tamaño equivalente, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| Inkling-Small-NVFP4 (baerquants) | 156B según safetensors / 12B activos | no disponible | apache-2.0 | Pesos abiertos en NVFP4, 170,8 GB, 0 descargas | no disponible |
| Inkling-Small BF16 (thinkingmachines) | 276B / 12B activos | no disponible | apache-2.0 | Pesos abiertos en BF16 | Tabla de benchmarks en la model card, sin cifras disponibles |
| Inkling-Small-NVFP4 (thinkingmachines) | no disponible | no disponible | apache-2.0 | Pesos abiertos en NVFP4, versión oficial | no disponible |
| Qwen3.5 397B-A17B | 397B / 17B (según la nomenclatura) | no disponible | no disponible | Citado como pesos abiertos en la tabla de benchmarks del modelo base | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | Citado como pesos abiertos en la tabla de benchmarks del modelo base | no disponible |

Nota: no se dispone de datos de contexto, licencia ni resultados numéricos de los modelos comparados en la información proporcionada, por lo que la comparación se limita a lo que puede extraerse de la nomenclatura y de las menciones en la model card.

## Limitaciones y advertencias

- Discrepancia de parámetros sin resolver: la model card del base declara 276B totales, mientras que el recuento de safetensors del repositorio cuantizado indica 156.032.140.138. Conviene verificar el dato antes de planificar infraestructura.
- Cuantización de terceros: el repositorio lo publica el usuario baerquants, no el autor original del modelo. No hay evaluaciones publicadas que cuantifiquen la degradación de calidad respecto al BF16, ni descargas ni validación de la comunidad.
- Idioma: el inglés es el idioma principal declarado; las capacidades multilingües se describen como "generales", sin lista de idiomas ni evaluación por idioma.
- Contexto desconocido: no se publica la longitud de ventana, lo que impide dimensionar caché KV y limita la planificación de aplicaciones con contexto largo.
- Audio: el rendimiento óptimo se limita a clips de menos de 2 minutos en WAV a 16 kHz; no se documenta comportamiento fuera de ese rango.
- Imágenes: fuera del rango de 40 px a 4096 px por dimensión el rendimiento puede degradarse, según la propia model card.
- Riesgo de alucinación: no se documentan tasas de alucinación ni evaluaciones de veracidad en la información disponible.
- Sesgos: la model card menciona filtrado y deduplicación con objetivos de seguridad, pero no publica análisis de sesgos ni evaluaciones de seguridad.
- Trazabilidad del entrenamiento: no se especifican el número de tokens, la composición del dataset ni si hubo etapas de alineación (RLHF, DPO). Esto dificulta la reproducibilidad.
- Licencia y uso: los pesos se distribuyen bajo Apache 2.0, lo que permite uso comercial, pero el modelo base está sujeto a una política de uso aceptable de Thinking Machines que conviene revisar antes de desplegar en producción.
- Hardware: NVFP4 está orientado a GPUs Blackwell. En generaciones anteriores el despliegue puede requerir conversión o soporte adicional, y el modelo no cabe en GPUs de consumo.
- Formatos alternativos: si el hardware no soporta NVFP4, existen los pesos BF16 del modelo base, pero su huella de memoria es notablemente mayor.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/baerquants/Inkling-Small-NVFP4
- Modelo base en BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Versión NVFP4 oficial: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentación de Unsloth para Inkling: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace sobre Inkling: https://hf.co/blog/thinkingmachines-inkling

Nota sobre la búsqueda web: los resultados recuperados no guardan relación con el modelo (corresponden a comparativas de herramientas ETL) y no aportan enlaces relevantes para esta ficha.
