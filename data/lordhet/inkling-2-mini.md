# lordhet/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera salidas de texto. Se publica bajo licencia Apache 2.0 con pesos abiertos, lo que permite su uso comercial, investigación, ajuste fino e integración en productos de terceros. El checkpoint se distribuye en precisiones mixtas NVFP4 y MXFP8 con un tamaño aproximado de 20 GB, lo que lo hace viable en hardware de consumo.

Técnicamente, se trata de un transformer decoder-only de 24 capas con capas de feed-forward de tipo Mixture-of-Experts (MoE) disperso. Su innovación principal es el bucle de capas: las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da lugar a 48 aplicaciones de capa por token a partir de 24 capas de pesos. El modelo tiene 26,4 mil millones de parámetros totales y 3,4 mil millones activos por capa, aunque el bucle eleva los parámetros activos efectivos a aproximadamente 5,4 mil millones por token.

La relevancia de este modelo radica en su ventana de contexto de hasta 1 millón de tokens, su naturaleza multimodal nativa (visión integrada mediante un vision transformer) y su diseño eficiente en cómputo gracias al enrutamiento MoE y al bucle de capas. Está pensado para desarrolladores que construyen aplicaciones agénticas, asistentes de código, chatbots y sistemas RAG, y su reducido tamaño de checkpoint permite ejecución local en dispositivos Apple Silicon con 32 GB o más de memoria y en GPUs con 32 GB o más de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y bucle de capas (12 capas centrales ejecutadas 3 veces) |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 3,4B por capa; 5,4B efectivos por token (3 pasadas del bucle) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 en el checkpoint oficial; versiones GGUF cuantizadas vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF disponible para llama.cpp/Ollama |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer autoregresivo multimodal con 24 capas de decoder. Las capas de feed-forward son de tipo Mixture-of-Experts disperso: cada token se enruta a 8 de 128 expertos por capa. La atención es híbrida, combinando capas locales y globales. La innovación estructural más destacable es el bucle de capas: las 12 capas centrales se ejecutan tres veces con pesos compartidos, generando 48 aplicaciones de capa por token a partir de solo 24 capas de pesos. Cada pasada adicional por las capas en bucle añade aproximadamente 1,0B de parámetros activos efectivos, de ahí que los 3,4B activos por capa se conviertan en 5,4B efectivos por token.

El modelo es multimodal de forma nativa: las imágenes se codifican mediante un vision transformer y tanto las representaciones de imagen como las de texto se proyectan a un espacio oculto compartido que el decoder procesa conjuntamente. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar en objetivos de seguridad. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general en inglés y otros idiomas.
- Comprensión de imágenes: acepta entradas de imagen de cualquier tipo basadas en píxeles, con rendimiento óptimo cuando cada dimensión está entre 40 px y 4096 px.
- Generación de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool-use), según la model card.
- Conversación multi-turno e instrucciones de seguimiento.
- Integración en sistemas RAG (retrieval-augmented generation).
- Capacidad de ajuste fino posterior (post-training) mediante plataformas como Miles y SkyRL.
- Ventana de contexto de hasta 1M tokens para procesar documentos o historiales extensos.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y editores para autocompletar, explicar y refactorizar código en varios lenguajes, aprovechando su soporte de tool calling y su contexto de hasta 1M tokens para analizar repositorios completos.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historiales largos gracias a la ventana de 1M tokens, manteniendo coherencia en interacciones extensas y consultando documentación adjunta.
- Sistemas RAG multimodales: indexación y consulta de documentos que combinan texto e imágenes (informes, manuales, capturas), ya que el modelo procesa ambos tipos de entrada en un espacio compartido.
- Análisis de documentos extensos con imágenes: revisión de contratos, informes técnicos o expedientes con gráficos y tablas, donde el contexto largo evita la fragmentación y la visión permite interpretar figuras.
- Agentes autónomos multi-paso: planificación y ejecución de tareas que requieren llamadas a herramientas y razonamiento encadenado, apoyándose en el soporte de tool-use descrito por el proveedor.
- Despliegue local en estaciones de trabajo: prototipado e inferencia en MacBooks, Mac minis o Mac Studios con 32 GB o más de memoria unificada, o en GPUs de consumo con 32 GB o más de VRAM, usando Ollama, llama.cpp o Unsloth.
- Ajuste fino para dominios específicos: adaptación con Miles o SkyRL sobre los pesos abiertos Apache 2.0 para tareas verticales (legal, médico, industrial) sin restricciones de licencia comercial.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos numéricos de esa tabla no están disponibles en la información proporcionada (el contenido se interrumpe en la cabecera). Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint oficial en NVFP4/MXFP8 ocupa aproximadamente 20 GB; se recomienda un mínimo de 32 GB de VRAM para inferencia.
- GPU recomendadas: 1x NVIDIA DGX Spark; otras GPUs con 32 GB o más de VRAM. No se especifican modelos concretos como A100, H100 o RTX 4090 en la información disponible.
- Apple Silicon: dispositivos con 32 GB o más de memoria unificada (MacBooks, Mac minis y Mac Studios).
- Cabe en GPU de consumo: sí, siempre que dispongan de 32 GB o más de VRAM; las versiones GGUF cuantizadas de Unsloth y llama.cpp reducen aún más el requisito.
- Opciones de despliegue: Hugging Face transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluye GGUF), llama.cpp, Llama App, Ollama y Exo Labs en Apple Silicon.
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card cita como comparables a Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero no se dispone de sus especificaciones detalladas ni de los resultados numéricos de la comparación en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face |
| Gemma 4 31B | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información disponible; al entrenarse con datos de internet y sintéticos, es esperable que herede sesgos presentes en esas fuentes.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en contextos largos.
- Limitaciones de idioma: el soporte principal es el inglés, con soporte multilingüe general no especificado en detalle; el rendimiento en castellano u otros idiomas distintos del inglés no está documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el proveedor publica una Política de Uso Aceptable del Modelo que debe consultarse y respetarse.
- Precisión numérica: el checkpoint oficial usa NVFP4 y MXFP8; los requisitos de hardware y software dependen de que el framework de inferencia soporte estas precisiones.
- Contexto de 1M tokens: no se documenta el rendimiento degradado a longitudes extremas ni el coste computacional asociado.
- Madurez: el modelo tiene 0 descargas y 0 likes en el repositorio de Hugging Face indicado, y fue creado y actualizado el mismo día (24 de noviembre de 2026), por lo que la validación comunitaria es inexistente en el momento de redactar esta ficha.
- La model card cita el repositorio oficial en `thinkingmachines/Inkling-2-Mini`, mientras que el ID consultado es `lordhet/Inkling-2-Mini`; conviene verificar la procedencia de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face (ID consultado): https://huggingface.co/lordhet/Inkling-2-Mini
- Hugging Face (repositorio oficial citado en la model card): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
