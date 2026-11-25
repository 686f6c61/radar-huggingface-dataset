# AMAImedia/Inkling-2-Mini-BF16-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab que acepta entradas de texto e imagen y genera texto. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y está pensado para desarrolladores que construyen aplicaciones con agentes, tool calling, asistentes de código, chatbots y sistemas RAG. El checkpoint original se publica en precisiones mixtas NVFP4 y MXFP8 con un tamaño aproximado de 20 GB.

La arquitectura es un transformer decoder-only de tipo "looped": 24 capas de pesos con atención híbrida local/global y capas feed-forward de mezcla de expertos dispersa. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. Cada token se enruta a 8 de 128 expertos por capa. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta junto al texto en un espacio oculto compartido.

La ficha que nos ocupa, `AMAImedia/Inkling-2-Mini-BF16-GGUF`, es una redistribución comunitaria en formato GGUF (con variantes BF16 y otras cuantizaciones) del modelo base, con etiquetas que indican una variante "abliterated/uncensored". No es el repositorio oficial: el autor original es Thinking Machines Lab y esta versión la publica AMAImedia como parte de su plataforma de doblaje, sin que ello implique respaldo del desarrollador original. El recuento real de parámetros en safetensors es de 26.388.646.440.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y capas "looped" (24 capas de pesos, 48 aplicaciones por token); atención híbrida local/global; vision transformer para imágenes |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | no disponible (8 de 128 expertos por capa y token; el número absoluto de parámetros activos no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, GGUF (el repo incluye variantes GGUF; el modelo base se distribuye en NVFP4 y MXFP8 mixtos); etiqueta "8-bit", "modelopt", "imatrix" |
| Idiomas soportados | Inglés y soporte multilingüe general (la model card lista `en` y `multilingual`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo base), GGUF (este repositorio); también transformers |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con 24 capas de pesos. Las 12 capas intermedias se reaplican tres veces compartiendo pesos, de modo que cada token atraviesa 48 aplicaciones de capa. Las capas feed-forward son de mezcla de expertos dispersa con 128 expertos por capa y enrutamiento de 8 expertos por token. La atención combina capas locales y globales. La entrada de imagen se procesa mediante un vision transformer y se proyecta, junto con el texto, a un espacio oculto común que consume el decoder de forma conjunta.

El checkpoint oficial se distribuye en precisiones mixtas NVFP4 y MXFP8 con un tamaño de unos 20 GB, lo que permite inferencia en hardware local de gama alta para consumo. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos figuran como no disponibles. El modelo puede post-entrenarse con las herramientas Miles y SkyRL, y ajustarse mediante la plataforma Tinker.

## Capacidades

- Generación de texto conversacional multi-turno con seguimiento de instrucciones.
- Comprensión de imágenes: entrada image-text-to-text con codificación mediante vision transformer y procesamiento conjunto con el texto.
- Razonamiento y tareas de lenguaje natural de propósito general.
- Soporte de lenguajes de programación múltiples (asistentes de código).
- Soporte de tool calling y function calling, orientado a sistemas agénticos.
- Capacidades multilingües generales, con inglés como idioma principal.
- Uso en sistemas RAG y chatbots.
- La variante publicada por AMAImedia incorpora etiquetas "abliterated" y "uncensored", que indican un ajuste orientado a reducir rechazos; no se documentan los detalles técnicos de ese ajuste.

## Casos de uso

- Asistentes de código en producción: el modelo está diseñado para asistencia de programación y soporta múltiples lenguajes; puede integrarse en pipelines de revisión o generación de código con tool calling para consultar documentación o ejecutar pruebas.
- Sistemas agénticos con herramientas: el soporte de function calling permite construir agentes que decidan qué herramienta invocar (APIs, bases de datos) en flujos de varios pasos.
- Atención al cliente automatizada: chatbot conversacional multi-turno con entradas de texto e imagen, útil para soporte que requiera interpretar capturas o documentos enviados por el usuario.
- RAG sobre documentación: combinación de recuperación y generación para responder preguntas sobre bases de conocimiento, con el modelo como generador final.
- Procesamiento de documentos con imagen: extracción y descripción de información a partir de imágenes y texto combinados, como facturas, formularios o capturas.
- Doblaje y automatización de medios: el publicador enmarca esta versión dentro de su plataforma de doblaje multilingüe; el modelo puede emplearse para transcripción asistida, traducción y generación de guiones en ese contexto.
- Inferencia local en estaciones de trabajo: al distribuirse en GGUF y en un checkpoint de unos 20 GB, permite despliegues en equipos con 32 GB o más de memoria, incluidos Apple Silicon y GPUs de consumo de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint oficial de unos 20 GB en NVFP4/MXFP8 mixtos se ejecuta en 1x NVIDIA DGX Spark, en Apple Silicon con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio) y en otras GPUs con 32 GB o más de VRAM recomendados.
- La versión GGUF de este repositorio permite cuantizaciones de menor precisión (BF16 y otras variantes GGUF), lo que reduce los requisitos de memoria respecto al checkpoint original; el tamaño exacto por cuantización no se detalla.
- GPUs recomendadas: DGX Spark, GPUs con 32 GB o más de VRAM (por ejemplo, A100 40/80 GB, H100, RTX 6000 Ada, RTX 5090). En GPUs de consumo de 24 GB o menos, la viabilidad depende de la cuantización GGUF elegida.
- Frameworks de despliegue soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, Llama App, Ollama y Exo Labs (estos dos últimos en Apple Silicon).
- Post-entrenamiento: Miles y SkyRL; ajuste vía Tinker.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini (Thinking Machines Lab) | 26,4B (MoE, 24 capas con 12 reaplicadas) | no disponible | Apache 2.0 | Sí (texto e imagen) | Pesos abiertos en HF, Tinker |
| AMAImedia/Inkling-2-Mini-BF16-GGUF | 26,4B | no disponible | Apache 2.0 | Sí | GGUF en HF |
| Alternativas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad; el riesgo de alucinación no está cuantificado.
- La longitud de contexto no se especifica, lo que dificulta planificar despliegues con ventanas largas.
- El soporte multilingüe se describe de forma genérica; el inglés es el idioma principal y el rendimiento en otros idiomas no está verificado.
- Esta versión concreta incorpora etiquetas "abliterated" y "uncensored": el ajuste para reducir rechazos puede degradar el cumplimiento de instrucciones de seguridad y aumentar la probabilidad de contenido inapropiado. No se documentan los detalles del proceso.
- Es un repositorio comunitario de redistribución, no el oficial; conviene verificar la integridad de los pesos y contrastar con el modelo base de Thinking Machines Lab.
- La licencia Apache 2.0 permite uso comercial, pero el publicador no ofrece garantías sobre el comportamiento del modelo ajustado.
- El tamaño del repositorio (49,6 GB) implica espacio de almacenamiento considerable para descargar todas las cuantizaciones.
- Los datos de entrenamiento (tokens, composición del dataset, RLHF/DPO) no están disponibles, lo que limita la evaluación de riesgos.

## Enlaces

- Repositorio de esta versión: https://huggingface.co/AMAImedia/Inkling-2-Mini-BF16-GGUF
- Modelo base oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio original de la variante: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- GGUF de la variante original: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Web del publicador: https://www.amaimedia.com
