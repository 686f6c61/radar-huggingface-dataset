# schwyzquant/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines (publicado en el repositorio de HuggingFace bajo la cuenta schwyzquant), que acepta entradas de texto, imagen y audio y genera salidas de texto. Está pensado para aplicaciones de desarrollador: asistentes de código, chatbots, sistemas agénticos con uso de herramientas y pipelines de generación aumentada por recuperación (RAG).

Arquitectónicamente es un transformer autoregresivo decoder-only de 42 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos siempre activos. La atención combina capas locales y globales. Es nativamente multimodal: las imágenes se codifican mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido que procesa el decoder de forma conjunta.

El modelo declara 276B parámetros totales con 12B activos por token, aunque el recuento real de safetensors asciende a 265.956.439.090 parámetros (unos 266B), una discrepancia que conviene tener presente. Se distribuye con pesos abiertos bajo licencia Apache 2.0 en BF16 y NVFP4, y su tamaño en repositorio es de 531,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 42 capas con MoE disperso (6 de 256 expertos enrutados por token + 2 expertos compartidos) y atención híbrida local/global |
| Parametros totales | 265.956.439.090 (recuento real de safetensors); la model card declara 276B |
| Parametros activos | 12B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo decoder-only de 42 capas con una columna vertebral feed-forward de tipo Mixture-of-Experts dispersa. El enrutamiento envía cada token a 6 de 256 expertos y mantiene 2 expertos compartidos activos en todos los tokens. La atención es híbrida, combinando capas locales con capas globales. La multimodalidad es nativa: las imágenes pasan por un codificador jerárquico de parches (se recomienda que cada dimensión de imagen esté entre 40 px y 4096 px) y el audio por codificación de tokens discretos (formato WAV a 16 kHz, idealmente por debajo de 2 minutos). Todas las modalidades se proyectan a un espacio oculto compartido procesado conjuntamente por el decoder. El modelo genera únicamente texto en UTF-8.

En cuanto al entrenamiento, la model card indica que los datos cubren texto, imágenes, audio y vídeo, procedentes de fuentes públicas (internet y repositorios de acceso público), de terceros y de generación o aumento sintético. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y por motivos de seguridad. No se detalla el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO, por lo que esos datos quedan como no disponibles.

## Capacidades

- Generación de texto y conversación multiturno en inglés y otros idiomas.
- Comprensión de imágenes (image-text-to-text) mediante codificador jerárquico de parches, con rango recomendado de 40 px a 4096 px por dimensión.
- Comprensión de audio (audio-text-to-text) en formato WAV a 16 kHz, con duración óptima inferior a 2 minutos.
- Modelo multimodal unificado: procesa texto, imagen y audio de forma conjunta en el mismo decoder.
- Soporte para dominios de programación y múltiples lenguajes de código, según la model card.
- Orientado a sistemas agénticos y de uso de herramientas (tool-use / function calling) por diseño declarado.
- Idóneo para asistentes de código, chatbots y sistemas RAG.
- Ajuste fino e integración en productos de terceros gracias a la publicación de pesos abiertos.

## Casos de uso

- Atención al cliente multimodal: el modelo puede gestionar conversaciones multiturno en las que el usuario adjunta capturas de pantalla o notas de voz (WAV a 16 kHz, menos de 2 minutos), gracias a su entrada nativa de imagen y audio.
- Asistentes de código en producción: al soportar uso de herramientas y estar orientado a dominios de programación, puede integrarse en pipelines de CI/CD para revisar parches, explicar errores de compilación o generar tests a partir de fragmentos de código.
- Agentes autónomos multi-paso: su naturaleza agéntica y de tool-use permite encadenar llamadas a APIs externas para tareas de investigación, extracción de datos o automatización de flujos.
- RAG empresarial sobre documentación heterogénea: puede combinar texto recuperado con imágenes de manuales o diagramas incrustados, resolviendo consultas que un modelo solo-texto no cubriría.
- Análisis de contenido audiovisual corto: transcripción y razonamiento sobre clips de audio o mensajes de voz, útil en herramientas de notas de reuniones o moderación.
- Asistente de accesibilidad: descripción de imágenes y audios para usuarios con discapacidad visual o auditiva, aprovechando la entrada conjunta de ambas modalidades.
- Base para ajuste fino vertical: al liberarse con pesos abiertos y licencia Apache 2.0, sirve como punto de partida para especializar un modelo propio en dominios como legal, sanitario o industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de evaluaciones que compara Inkling-Small con modelos de pesos abiertos y cerrados (Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, entre otros), pero el contenido numérico de dicha tabla no está disponible en el material proporcionado, por lo que no es posible reproducir cifras concretas.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 532 GB solo para los pesos (2 bytes por parámetro sobre 265.956.439.090 parámetros), más caché KV y activaciones. Coincide con el tamaño del repositorio de 531,9 GB.
- VRAM para NVFP4 (4 bits): del orden de 133 GB para los pesos, más caché KV.
- GPU recomendadas: para BF16, configuraciones de 8× H100 80 GB (640 GB) o 7× H200 de 141 GB; para NVFP4, bastarían 2× H100 80 GB.
- GPU de consumo: no cabe en ninguna GPU de consumo de forma íntegra. Una RTX 4090 con 24 GB no puede alojar los 266B parámetros ni siquiera en 4 bits; solo sería viable con descarga a RAM/CPU, con penalización severa de latencia.
- Aunque los parámetros activos son 12B (coste de cómputo por token similar a un modelo de 12B), el requisito de memoria corresponde a un modelo de 266B, ya que todos los expertos deben estar residentes o accesibles.
- Opciones de despliegue soportadas según la model card: SGLang, vLLM, TokenSpeed, Unsloth y la librería transformers de HuggingFace. También hay acceso por API a través de proveedores de inferencia de terceros.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La model card sitúa Inkling-Small frente a Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash. Solo se dispone de datos parciales de parámetros para uno de ellos; el resto de campos no está disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-Small | 266B totales / 12B activos (MoE) | no disponible | Apache 2.0 | Pesos abiertos en HuggingFace (BF16 y NVFP4) |
| Qwen3.5 397B-A17B | 397B totales / 17B activos | no disponible | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de rendimiento comparativos que permitan contrastar capacidades entre estos modelos.

## Limitaciones y advertencias

- Discrepancia en el recuento de parámetros: la model card declara 276B totales, mientras que los safetensors suman 265.956.439.090, lo que conviene verificar antes de dimensionar infraestructura.
- El modelo solo genera salida de texto; no produce imagen ni audio, pese a aceptar esas entradas.
- La longitud de contexto no está especificada, lo que limita la planificación de aplicaciones con contexto largo.
- El idioma principal es el inglés; las capacidades multilingües se describen como generales, sin métricas que las respalden.
- La entrada de audio está restringida a WAV a 16 kHz y se recomienda por debajo de 2 minutos, lo que limita casos de uso con audios largos.
- Las imágenes deben estar preferentemente entre 40 px y 4096 px por dimensión; fuera de ese rango el rendimiento puede degradarse.
- No se documentan el volumen de tokens de entrenamiento ni si hubo RLHF/DPO, lo que dificulta evaluar el ajuste a instrucciones.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones específicas de veracidad.
- Sesgos potenciales derivados de datos de internet, de terceros y sintéticos; la model card menciona filtrado por seguridad, pero no detalla mitigaciones.
- Existe una política de uso aceptable enlazada (model-acceptable-use-policy) que puede imponer condiciones adicionales al uso, aun con licencia Apache 2.0.
- La cuenta que aloja el repositorio (schwyzquant) no coincide con la referenciada en la model card (thinkingmachines), por lo que conviene confirmar la procedencia y autenticidad de los pesos.
- El repositorio registra 0 descargas y 0 likes en la fecha de consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace (repositorio consultado): https://huggingface.co/schwyzquant/Inkling-Small
- BF16 (referenciado en la model card): https://huggingface.co/thinkingmachines/Inkling-Small
- NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentación de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace: https://hf.co/blog/thinkingmachines-inkling

Nota: la búsqueda web proporcionada no devolvió resultados relevantes sobre este modelo (los enlaces obtenidos corresponden a sitios de opiniones y análisis de dominios sin relación con el modelo).
