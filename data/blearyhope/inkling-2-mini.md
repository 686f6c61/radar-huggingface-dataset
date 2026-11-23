# blearyhope/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de desarrollo: sistemas agénticos con uso de herramientas, asistentes de código, chatbots y pipelines de generación aumentada por recuperación (RAG). Su interés radica en combinar una arquitectura poco habitual —un transformer "looped" con pesos compartidos— con un tamaño contenido y una ventana de contexto de hasta 1M tokens.

La arquitectura es un decoder-only de 24 capas con capas feed-forward de tipo Mixture-of-Experts disperso. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa a partir de 24 capas de pesos. En cada capa, cada token se enruta a 8 de 128 expertos. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto al texto a un espacio oculto compartido que procesa el decoder.

El checkpoint se distribuye en unas 20 GB con precisiones mixtas NVFP4 y MXFP8, lo que permite ejecutarlo en hardware local de gama alta para consumidores, como un DGX Spark o equipos Apple Silicon con 32 GB o más de memoria. Thinking Machines Lab ofrece además acceso vía API a través de su plataforma Tinker y un playground de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas "looped" (24 capas, 12 centrales ejecutadas 3 veces) |
| Parametros totales | 26,4B (26.388.646.440 según safetensors) |
| Parametros activos | 3,4B base; 5,4B efectivos por token con las tres pasadas (cada pasada extra añade ~1,0B) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint nativo); versiones GGUF cuantizadas vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint único de ~20 GB en precisiones mixtas NVFP4/MXFP8) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con capas de atención híbridas (locales y globales) y capas feed-forward de Mixture-of-Experts. La innovación estructural principal es el bucle de capas: las 12 capas centrales comparten pesos y se aplican tres veces, lo que incrementa la profundidad efectiva (48 aplicaciones de capa por token) sin aumentar el número de parámetros almacenados. El enrutamiento envía cada token a 8 de 128 expertos por capa. La multimodalidad es nativa: un vision transformer codifica las imágenes y tanto estas como el texto se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles, datos adquiridos a terceros, generados internamente o sintéticos y aumentados. El proceso de curación comprende limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de instrucciones y conversación multi-turno.
- Comprensión de imágenes: entrada de cualquier imagen en píxeles, con rendimiento óptimo cuando cada dimensión está entre 40 px y 4096 px.
- Generación de código en múltiples lenguajes de programación y asistencia a tareas de desarrollo.
- Uso en sistemas agénticos y de tool-use, según la orientación declarada por el autor.
- Soporte multilingüe general, con inglés como idioma principal.
- Integración en sistemas RAG y chatbots.
- Ventana de contexto de hasta 1M tokens para documentos y conversaciones extensas.
- Ajuste fino posterior soportado mediante las plataformas Miles y SkyRL, y acceso a fine-tuning vía Tinker.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y editores para generación y revisión de código en varios lenguajes, aprovechando su soporte declarado para tool calling y su contexto de 1M tokens para razonar sobre repositorios completos.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial largo gracias a la ventana de 1M tokens, manteniendo coherencia en sesiones extensas y consultas de documentación.
- RAG sobre documentación técnica: ingestión de manuales y bases de conocimiento extensas en el contexto, con respuestas fundamentadas en los fragmentos recuperados.
- Análisis de documentos con imágenes: extracción y razonamiento sobre capturas, diagramas, tablas escaneadas e interfaces de usuario, al aceptar entradas de imagen de hasta 4096 px por dimensión.
- Agentes autónomos de múltiples pasos: orquestación de tareas con llamadas a herramientas y planificación secuencial, apoyada en el modo de razonamiento del decoder.
- Despliegue en hardware local para prototipado: ejecución en un DGX Spark o en Apple Silicon con 32 GB o más, útil para entornos con requisitos de privacidad o sin acceso a la nube.
- Fine-tuning especializado: adaptación a dominios concretos mediante Tinker, Miles o SkyRL, partiendo de los pesos abiertos Apache 2.0.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de evaluaciones frente a Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los valores numéricos no están disponibles en la información proporcionada (la tabla aparece truncada). No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- Checkpoint único de ~20 GB en precisiones mixtas NVFP4 y MXFP8.
- Soporte oficial en 1x NVIDIA DGX Spark.
- Soporte en dispositivos Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini y Mac Studio).
- Otras GPU y plataformas son posibles, con recomendación de 32 GB o más de VRAM.
- Frameworks de inferencia soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp y Llama App.
- En Apple Silicon: Ollama y Exo Labs.
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 5,4B efectivos | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face; API vía Tinker |
| Gemma 4 31B | 31B (según nombre) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables aparecen únicamente como referencias en la tabla de evaluaciones de la model card; no se dispone de sus especificaciones detalladas ni de los resultados numéricos de la comparación en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad específicas.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado métricas de fiabilidad en la información disponible.
- El soporte multilingüe se declara como "general", con el inglés como idioma principal; no hay evaluación por idioma disponible.
- Aunque la licencia es Apache 2.0, el autor remite a una Política de Uso Aceptable del modelo que puede imponer restricciones adicionales al uso comercial; conviene revisarla antes de desplegar en producción.
- El checkpoint se distribuye en precisiones NVFP4 y MXFP8; el uso en otras precisiones requiere conversión o cuantización adicional (GGUF vía Unsloth o llama.cpp).
- La información sobre datos de entrenamiento es genérica: no se especifican volúmenes de tokens, composición exacta ni etapas de alineación (RLHF/DPO).
- El modelo tiene 0 descargas y 0 likes en el repositorio de Hugging Face indicado, y fue creado y actualizado el mismo día; se trata de una publicación reciente sin validación comunitaria.
- La arquitectura de capas con pesos compartidos ejecutadas en bucle puede complicar la compatibilidad con herramientas de análisis y edición de modelos que asumen arquitecturas estándar.

## Enlaces

- Repositorio en Hugging Face (ID proporcionado): https://huggingface.co/blearyhope/Inkling-2-Mini
- Repositorio oficial del autor: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
