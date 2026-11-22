# AMAImedia/Inkling-2-Mini-Uncensored-BF16-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera salidas de texto. Se trata de un transformer decoder-only con capas de mezcla de expertos (MoE) dispersa, y su rasgo arquitectónico más distintivo es el uso de "looping": las 12 capas centrales de las 24 totales se ejecutan tres veces compartiendo pesos, lo que resulta en 48 aplicaciones de capa por token a partir de solo 24 capas de pesos. El checkpoint se distribuye en aproximadamente 20 GB con precisiones mixtas NVFP4 y MXFP8, y el recuento real de parámetros registrado en los safetensors del repositorio es de 26.388.646.440.

La versión aquí descrita es una redistribución comunitaria publicada por AMAImedia bajo el identificador `AMAImedia/Inkling-2-Mini-Uncensored-BF16-GGUF`. Deriva del modelo original `thinkingmachines/Inkling-2-Mini` y de la cuantización intermedia `AtomicChat/Inkling-2-Mini-Uncensored-GGUF`, y se ofrece en formato BF16 y GGUF, presumiblemente con el ajuste "uncensored" aplicado por la cadena de derivación. El repositorio ocupa 60,0 GB y se publicó el 21 de noviembre de 2026, un día después del lanzamiento del modelo base.

Su relevancia radica en que combina capacidades multimodales (image-text-to-text) con un tamaño contenido que permite inferencia local en hardware de consumo alto o estaciones de trabajo, bajo licencia Apache 2.0, lo que facilita su integración en productos de terceros, fine-tuning e investigación sin las restricciones habituales de licencias propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y bucle de capas (looped transformer); 24 capas con las 12 centrales ejecutadas 3 veces (48 aplicaciones por token) |
| Parametros totales | 26.388.646.440 (según safetensors del repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, GGUF (incluye variantes cuantizadas con imatrix); el modelo base se distribuye en NVFP4 y MXFP8; etiqueta "8-bit" y "modelopt" en el repo |
| Idiomas soportados | Inglés y soporte multilingüe general (etiqueta de idioma del repo: en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo multimodal con capas feed-forward de tipo Mixture-of-Experts dispersa. El diseño "looped" es la innovación central: de las 24 capas de pesos, las 12 intermedias se aplican tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa efectivas. Esto incrementa la profundidad computacional sin aumentar proporcionalmente el número de parámetros almacenados, un enfoque que busca mejorar la capacidad de razonamiento por parámetro. El modelo procesa entradas de texto e imagen y produce texto, lo que implica un codificador visual integrado, aunque los detalles del mismo no están disponibles en la información proporcionada.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La model card original menciona que el modelo está pensado para aplicaciones agénticas, uso de herramientas, asistentes de código, chatbots y RAG, pero no detalla el proceso de post-entrenamiento. La cadena de derivación incluye un ajuste etiquetado como "uncensored" aplicado por AtomicChat, cuyos detalles metodológicos tampoco están disponibles.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Procesamiento multimodal image-text-to-text: acepta imágenes junto con texto y genera respuestas textuales.
- Razonamiento y tareas de lenguaje natural en inglés y soporte multilingüe general.
- Generación de código en múltiples lenguajes de programación, según la model card del modelo base.
- Soporte para sistemas agénticos y uso de herramientas (tool-use), orientado a asistentes y pipelines automatizados.
- Adecuado para sistemas de recuperación aumentada (RAG) según la documentación del modelo original.
- Compatibilidad con fine-tuning mediante la plataforma Tinker y con frameworks de post-entrenamiento como Miles y SkyRL.
- Modo "uncensored" en esta variante concreta, que relaja los filtros de rechazo del modelo base (sin documentación técnica disponible sobre el método).

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede recibir capturas de pantalla, diagramas o fotografías junto con texto y responder en lenguaje natural, lo que lo hace adecuado para soporte técnico visual o atención al cliente que requiera interpretar imágenes adjuntas.
- Automatización de dubbing y flujos audiovisuales: la organización publicadora enmarca el modelo dentro de su plataforma NOESIS de automatización de doblaje multilingüe, donde un modelo multimodal pequeño puede asistir en la descripción de escenas, el ajuste de guiones y la verificación de contenido visual.
- Asistentes de código integrados en IDE: gracias a su soporte de múltiples lenguajes de programación y tool-use, puede emplearse para autocompletado, explicación de fragmentos y generación de tests dentro de entornos de desarrollo.
- Pipelines RAG con contexto visual: combinado con un motor de recuperación, puede responder preguntas sobre documentos que incluyan figuras, tablas o diagramas, aprovechando su entrada image-text-to-text.
- Inferencia local en estaciones de trabajo: al caber en aproximadamente 20 GB en el checkpoint original y disponer de versiones GGUF, puede desplegarse en Apple Silicon con 32 GB o más, en una NVIDIA DGX Spark o en GPUs con 32 GB de VRAM, útil para prototipado sin dependencia de la nube.
- Fine-tuning específico de dominio: la licencia Apache 2.0 y el soporte de Tinker, Miles y SkyRL permiten adaptar el modelo a verticales concretas (legal, médico, atención al cliente) sin restricciones de uso comercial.
- Investigación sobre arquitecturas looped y MoE: su diseño poco habitual (12 capas reutilizadas tres veces) lo convierte en un objeto de estudio para experimentos de eficiencia paramétrica y análisis de profundidad efectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Checkpoint original: aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8, según la model card del modelo base.
- Repositorio de esta variante: 60,0 GB en total, incluyendo BF16 y múltiples archivos GGUF.
- VRAM recomendada: 32 GB o más según la documentación del modelo base; suficiente para el checkpoint original y para cuantizaciones GGUF de alta calidad.
- Hardware soportado oficialmente: 1x NVIDIA DGX Spark; dispositivos Apple Silicon con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio); otras GPUs con 32 GB o más de VRAM.
- GPU de consumo: no se especifica compatibilidad con GPUs de 24 GB o menos en la documentación; el autor de la cuantización reporta trabajo local en una RTX 3060 Laptop de 6 GB para tareas de imatrix y modelos de 0,6 a 35B en RAM, pero no confirma que este modelo concreto se ejecute en dicha GPU.
- Frameworks de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, Llama App, Ollama y Exo Labs (estos dos últimos en Apple Silicon).
- Post-entrenamiento: Miles y SkyRL; fine-tuning vía Tinker.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini (Thinking Machines) | 26,4B (según safetensors) | no disponible | Texto + imagen | Apache 2.0 | Hugging Face, Tinker |
| Esta variante (AMAImedia, BF16/GGUF) | 26,4B | no disponible | Texto + imagen | Apache 2.0 | Hugging Face (GGUF y BF16) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (multimodales de ~26B con MoE y licencia permisiva) en los datos proporcionados, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El ajuste "uncensored" relaja los mecanismos de rechazo del modelo base; no hay documentación pública sobre el método empleado ni sobre los riesgos asociados, lo que exige evaluación propia antes de cualquier despliegue en producción.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual para esta variante.
- La etiqueta de idioma del repositorio es únicamente "en", aunque la model card original menciona soporte multilingüe general; el rendimiento real fuera del inglés no está verificado.
- Longitud de contexto no documentada: no es posible planificar aplicaciones que dependan de ventanas largas sin una evaluación empírica previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue publicado un día después del modelo base; se trata de una redistribución comunitaria sin validación independiente conocida.
- La cadena de derivación (modelo base → cuantización de AtomicChat → esta variante) introduce pasos intermedios cuyos detalles de cuantización y ajuste no están completamente documentados.
- Aunque la licencia es Apache 2.0, el modelo base remite a una Política de Uso Aceptable de Thinking Machines Lab que conviene revisar para usos comerciales sensibles.
- La información sobre parámetros activos de la MoE no está disponible, lo que impide estimar con precisión el coste computacional por token.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/AMAImedia/Inkling-2-Mini-Uncensored-BF16-GGUF
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantización intermedia: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Blog de Hugging Face sobre Inkling 2 Mini: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Organización AMAImedia: https://www.amaimedia.com
- X (Twitter) del autor: https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del autor: https://t.me/AMAImediacom
