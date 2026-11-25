# AMAImedia/Inkling-2-Mini-Uncensored-BF16-GGUF

## Resumen
Inkling-2-Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab que acepta entradas de texto e imagen y genera texto. Se trata de un transformer decodificador con capas de mezcla de expertos (MoE) dispersa y una innovación arquitectónica denominada "looped transformer": 24 capas de pesos, de las cuales las 12 centrales se ejecutan tres veces con pesos compartidos, resultando en 48 aplicaciones de capa por token. Con 26.400 millones de parámetros totales, está diseñado para aplicaciones agénticas, asistentes de código, chatbots y sistemas RAG.

La versión aquí descrita es una cuantización GGUF en BF16 publicada por AMAImedia bajo el identificador `AMAImedia/Inkling-2-Mini-Uncensored-BF16-GGUF`. Deriva del checkpoint original de Thinking Machines Lab y ha sido modificada mediante técnicas de "abliteration" para eliminar restricciones de rechazo, etiquetándose como "uncensored". El repositorio incluye pesos en safetensors y GGUF, con un tamaño total de 49,6 GB, e incorpora cuantizaciones de 8 bits generadas con modelopt e imatrix.

Su relevancia radica en combinar un tamaño contenido (apto para hardware de consumo de gama alta y estaciones DGX Spark) con capacidades multimodales y agénticas, bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales. La variante sin censura, no obstante, introduce consideraciones éticas y de seguridad que deben evaluarse antes de un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con MoE dispersa y "looped transformer" (24 capas de pesos, 12 centrales reutilizadas 3 veces = 48 aplicaciones por token); atención híbrida local/global; multimodal nativo con vision transformer |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 8 de 128 expertos por capa y token (número absoluto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, GGUF (incluye 8-bit con modelopt e imatrix); checkpoint original en NVFP4 y MXFP8 |
| Idiomas soportados | Inglés y soporte multilingüe general (la model card declara `en` y `multilingual`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
El modelo es un transformer autorregresivo multimodal con 24 capas de pesos. Las 12 capas centrales se ejecutan tres veces compartiendo pesos, lo que proporciona 48 aplicaciones de capa por token sin incrementar el número de parámetros. Cada capa emplea capas de mezcla de expertos dispersa: cada token se enruta a 8 de 128 expertos. La atención combina capas locales y globales. La multimodalidad es nativa: las imágenes se codifican mediante un vision transformer y se proyectan, junto con el texto, a un espacio oculto compartido que procesa el decodificador.

El checkpoint original se distribuye en precisiones mixtas NVFP4 y MXFP8, con un tamaño aproximado de 20 GB. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La variante de AMAImedia aplica abliteration sobre el modelo base para eliminar comportamientos de rechazo, y ofrece cuantizaciones GGUF generadas con imatrix y modelopt.

## Capacidades
- Generación de texto y razonamiento de propósito general, con instrucciones y conversación multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante vision transformer integrado.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte declarado para sistemas agénticos y uso de herramientas (tool-use), según la model card del modelo base.
- Capacidades multilingües generales, con inglés como idioma principal.
- Idoneidad para RAG y chatbots, según la documentación del modelo original.
- Comportamiento "sin censura" (abliterated) en la variante de AMAImedia, que reduce los rechazos ante solicitudes.

## Casos de uso
- Asistentes de código en IDE: el modelo puede completar, explicar y refactorizar código en varios lenguajes, integrándose en extensiones de editor mediante vLLM o llama.cpp con el GGUF cuantizado.
- Sistemas RAG documentales: su ventana de contexto (no especificada) y su capacidad multimodal permiten indexar documentos con imágenes y responder consultas combinando texto e información visual.
- Automatización de atención al cliente: conversaciones multi-turno con contexto amplio y despliegue en Ollama o llama.cpp sobre estaciones DGX Spark o Mac con 32 GB o más de memoria unificada.
- Pipelines agénticos con tool calling: el modelo puede orquestar llamadas a funciones en flujos de automatización, integrándose con SGLang o vLLM para servir múltiples agentes concurrentes.
- Procesamiento de capturas y documentos escaneados: al aceptar imagen y texto, puede extraer y resumir información de facturas, formularios o interfaces de usuario.
- Investigación sobre alineación y seguridad: la variante abliterated permite estudiar el comportamiento del modelo sin rechazos, comparándolo con el checkpoint original para analizar sesgos y mecanismos de seguridad.
- Fine-tuning especializado: la licencia Apache 2.0 y el soporte de Tinker, Miles y SkyRL permiten adaptar el modelo a dominios concretos con post-entrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El checkpoint original (NVFP4/MXFP8) ocupa unos 20 GB y requiere 32 GB o más de VRAM o memoria unificada recomendados.
- Hardware oficialmente soportado: 1x NVIDIA DGX Spark; dispositivos Apple Silicon con 32 GB o más (MacBook, Mac mini, Mac Studio).
- El repositorio GGUF de AMAImedia ocupa 49,6 GB, por lo que la inferencia en BF16 requiere aproximadamente 50 GB de memoria; las variantes de 8 bits reducen esta cifra de forma significativa (estimación no confirmada por el autor).
- GPU recomendadas: A100, H100 o H200 para servicio en producción; RTX 4090 (24 GB) no es suficiente para BF16 completo, pero puede ejecutar cuantizaciones GGUF de menor precisión.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, Llama App, Ollama y Exo Labs (Apple Silicon).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (Thinking Machines) | 26,4B (MoE, 8/128 expertos) | no disponible | Sí (imagen-texto) | Apache 2.0 | Pesos abiertos en HF, Tinker |
| Inkling-2-Mini-Uncensored (AMAImedia) | 26,4B (MoE) | no disponible | Sí (imagen-texto) | Apache 2.0 | GGUF y safetensors en HF |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada; la comparativa con alternativas de la misma categoría queda pendiente de datos verificables.

## Limitaciones y advertencias
- La variante "uncensored" ha sido modificada mediante abliteration, lo que puede degradar la calidad del modelo en tareas que requieren matices y aumenta el riesgo de generar contenido dañino, ilegal o sesgado.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de fidelidad factual.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con documentos extensos.
- El idioma principal es el inglés; el soporte multilingüe es general y no está cuantificado.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante sin censura puede contravenir políticas de plataformas y normativas locales; se recomienda auditoría previa.
- El repositorio tiene un tamaño de 49,6 GB, lo que exige almacenamiento y ancho de banda considerables para su descarga.
- La model card incluye enlaces a donaciones y promoción comercial; no constituyen documentación técnica verificable.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/AMAImedia/Inkling-2-Mini-Uncensored-BF16-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio original de la variante sin censura: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- GGUF de la variante original: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Tinker playground: https://tinker.thinkingmachines.ai/playground
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Sitio web de AMAImedia: https://www.amaimedia.com
