# AMAImedia/Inkling-2-Mini-BF16-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab que acepta entradas de texto e imagen y genera texto. Este repositorio concreto, publicado por AMAImedia, contiene una cuantización en GGUF (con variantes BF16 y de 8 bits) del modelo base, además de una versión "abliterated" y sin censura. El modelo original se publicó el 20 de noviembre de 2026 bajo licencia Apache 2.0 y está pensado para desarrolladores que construyen aplicaciones con agentes, asistentes de código, chatbots y sistemas RAG.

Arquitectónicamente es un transformer decoder-only de 24 capas con capas feed-forward de tipo Mixture-of-Experts disperso: cada token se enruta a 8 de 128 expertos y las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token. La atención combina capas locales y globales, y la multimodalidad es nativa mediante un vision transformer que proyecta imágenes y texto a un espacio oculto compartido. El checkpoint original pesa unos 20 GB en precisiones mixtas NVFP4 y MXFP8, y el recuento real de parámetros según safetensors es de 26.388.646.440.

La relevancia de esta ficha radica en que el repositorio de AMAImedia ofrece el modelo en formato GGUF para inferencia local en hardware de consumo, algo que el checkpoint original en precisiones NVFP4/MXFP8 no facilita directamente. No obstante, conviene señalar que se trata de una cuantización de terceros con modificaciones de alineación (abliterated/uncensored) y que no debe confundirse con el modelo oficial de Thinking Machines Lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas recurrentes (looped transformer); 24 capas de pesos, 48 aplicaciones por token |
| Parametros totales | 26.388.646.440 (según safetensors del repo) |
| Parametros activos | 8 de 128 expertos por capa y token; número exacto de parámetros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF BF16 y 8 bits (según tags del repo); el modelo base se distribuye en NVFP4 y MXFP8 |
| Idiomas soportados | Inglés y soporte multilingüe general (según model card); lista detallada no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con arquitectura "looped": dispone de 24 capas de pesos, pero las 12 capas centrales se aplican tres veces con pesos compartidos, resultando en 48 aplicaciones de capa por token. Las capas feed-forward son de tipo Mixture-of-Experts disperso, con enrutamiento de cada token a 8 de 128 expertos. La atención es híbrida, combinando capas locales y globales. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta junto con el texto a un espacio oculto compartido que procesa el decoder.

El checkpoint oficial se distribuye en unas 20 GB con precisiones mixtas NVFP4 y MXFP8. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona soporte para post-entrenamiento mediante las plataformas Miles y SkyRL, y acceso a fine-tuning a través de Tinker. La versión de este repositorio ha sido además sometida a un proceso de "abliteration" para eliminar rechazos de contenido, lo que altera el comportamiento de alineación respecto al modelo original.

## Capacidades

- Generación de texto y conversación multi-turno con instrucciones.
- Procesamiento de imágenes: entrada image-text-to-text con codificación mediante vision transformer.
- Razonamiento y tareas de lenguaje natural generales.
- Generación de código en múltiples lenguajes de programación (según la model card).
- Soporte para sistemas agénticos y de uso de herramientas (tool-use), según la descripción del modelo base.
- Soporte multilingüe general, con inglés como idioma principal.
- Modo "uncensored"/abliterated en esta versión concreta: menor propensión a rechazar peticiones.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema transformers.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede ejecutarse en equipos con 32 GB de memoria o VRAM, lo que permite desplegar un chatbot multimodal en estaciones de trabajo sin depender de la nube.
- Análisis de documentos con imágenes: al aceptar entradas image-text-to-text, puede extraer información de capturas, diagramas o formularios combinándolos con instrucciones textuales.
- Generación de código en entornos de desarrollo: su soporte de múltiples lenguajes de programación y tool-use permite integrarlo en asistentes de IDE o pipelines de revisión automatizada.
- Sistemas RAG multimodales: puede combinarse con un recuperador que devuelva fragmentos de texto e imágenes, procesando ambos en un espacio compartido para responder consultas.
- Automatización de agentes: el soporte de tool calling y razonamiento multi-paso lo hace adecuado para orquestar flujos con llamadas a APIs externas.
- Investigación sobre alineación y censura: la variante abliterated permite estudiar el comportamiento del modelo sin rechazos, comparándolo con el original en tareas sensibles.
- Fine-tuning especializado: al estar bajo Apache 2.0 y disponible en GGUF, puede adaptarse con Unsloth o plataformas como Miles y SkyRL para dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint oficial (unos 20 GB en NVFP4/MXFP8) requiere 32 GB o más de VRAM o memoria unificada; Thinking Machines Lab valida 1x NVIDIA DGX Spark y equipos Apple Silicon con 32 GB o más.
- Este repositorio GGUF (49,6 GB en total, con variantes BF16 y 8 bits) requiere más memoria que el checkpoint original: la variante BF16 de 26,4B parámetros necesita del orden de 50 GB, mientras que la de 8 bits ronda los 26-28 GB.
- GPU recomendadas para la variante de 8 bits: RTX 4090 (24 GB) puede quedarse justa; se recomiendan A100 40/80 GB, H100 o configuraciones multi-GPU. En Apple Silicon, equipos con 32 GB o más pueden ejecutar la variante cuantizada.
- El autor de la cuantización indica que su hardware local (RTX 3060 Laptop de 6 GB) solo sirve para trabajo con imatrix y modelos de 0,6-35B en RAM, y que los modelos de 9B+ requieren alquilar H200/Blackwell.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM, SGLang, TokenSpeed y NVIDIA Dynamo para el checkpoint original; Unsloth para cuantización y fine-tuning; Llama App y Exo Labs en Apple Silicon.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini (Thinking Machines Lab) | 26,4B totales, MoE 8/128 | no disponible | Apache 2.0 | safetensors (NVFP4/MXFP8) | Modelo oficial multimodal con alineación estándar |
| Inkling-2-Mini-Unbound (nokeepai) | 26,4B totales | no disponible | Apache 2.0 | safetensors y GGUF | Variante abliterated del mismo modelo base |
| Este repositorio (AMAImedia) | 26,4B totales | no disponible | Apache 2.0 | GGUF (BF16 y 8 bits) | Cuantización de terceros de la variante uncensored |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Se trata de una cuantización de terceros: la calidad puede degradarse respecto al checkpoint oficial, especialmente en la variante de 8 bits.
- La variante abliterated/uncensored elimina mecanismos de rechazo, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado; no es adecuada para aplicaciones de producción orientadas al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para esta cuantización.
- Longitud de contexto no documentada en la información disponible, lo que dificulta planificar cargas con ventanas largas.
- Idiomas: aunque se declara soporte multilingüe, la lista detallada no está disponible y el rendimiento fuera del inglés no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el comportamiento del modelo modificado.
- El repositorio incluye llamadas a donaciones y enlaces a la plataforma NOESIS/AMAImedia; no afectan a la licencia, pero conviene separar el modelo del ecosistema comercial del publicador.
- No se dispone de información sobre sesgos específicos medidos para esta variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMAImedia/Inkling-2-Mini-BF16-GGUF
- Modelo base oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio original de la variante uncensored: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
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
- Web de AMAImedia: https://www.amaimedia.com
- X (Twitter) de AMAImedia: https://x.com/AMAImediacom
- Telegram de AMAImedia: https://t.me/AMAImediacom
- LinkedIn del fundador: https://www.linkedin.com/in/ilia-bolotnikov
