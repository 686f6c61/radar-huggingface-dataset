# Nithish2410/INKLING-2-MINI-SFT-CKPT-FROM-SAME-12K-REASON

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autoregresivo con arquitectura "looped" (recurrente en profundidad) y capas de feed-forward con mezcla de expertos dispersa (MoE), con 26.400 millones de parámetros totales y 3.400 millones activos. El checkpoint distribuido en este repositorio es un ajuste fino supervisado (SFT) realizado por el usuario Nithish2410 sobre el modelo base, orientado a razonamiento.

El modelo destaca por combinar una ventana de contexto de hasta 1 millón de tokens con un tamaño lo suficientemente compacto como para ejecutarse en hardware local de consumo (Apple Silicon con 32 GB o más, o una NVIDIA DGX Spark), lo que lo sitúa en una categoría poco habitual: multimodal, contexto muy largo y desplegable en local. Su licencia Apache 2.0 facilita la integración en productos comerciales.

La relevancia actual del modelo radica en su enfoque arquitectónico: las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que incrementa la profundidad efectiva sin aumentar el número de pesos, un patrón que reduce el coste de memoria a cambio de más cómputo por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y bucle de capas (looped transformer) |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 3,4B nominales; 5,4B efectivos por token (tres pasadas por las capas en bucle) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Pesos nativos en NVFP4 y MXFP8; versiones GGUF cuantizadas vía Unsloth y llama.cpp; soporte de 8-bit según tags del repo |
| Idiomas soportados | Inglés y soporte multilingüe general (no se detalla la lista completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint único de ~20 GB en precisión mixta NVFP4/MXFP8) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas con capas de feed-forward MoE dispersas. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que resulta en 48 aplicaciones de capa por token a partir de 24 capas de pesos. En cada capa, cada token se enruta a 8 de 128 expertos. La atención es híbrida, combinando capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y tanto las entradas de imagen como las de texto se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios accesibles, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad. No se especifican en la información disponible el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO. El checkpoint de este repositorio es un SFT realizado sobre el modelo base con un conjunto de datos de razonamiento de 12.000 ejemplos (según el nombre del repositorio).

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes (image-text-to-text) con resolución óptima entre 40 px y 4096 px por dimensión.
- Razonamiento multi-paso y soporte para sistemas agénticos y de uso de herramientas (tool calling), según la model card.
- Asistencia en programación en múltiples lenguajes de programación.
- Soporte multilingüe general, con inglés como idioma principal.
- Integración en pipelines de recuperación aumentada (RAG) gracias a la ventana de 1M tokens.
- Ajuste fino adicional soportado mediante las plataformas Miles y SkyRL.

## Casos de uso

- Asistencia en programación: el modelo puede integrarse en asistentes de código que analizan repositorios completos dentro de la ventana de 1M tokens, permitiendo razonar sobre dependencias entre ficheros y proponer cambios coherentes en pipelines de CI/CD.
- Análisis de documentos extensos con imágenes: informes financieros, contratos o documentación técnica con diagramas incrustados, donde el modelo procesa texto e imágenes conjuntamente en una sola pasada de contexto largo.
- Atención al cliente automatizada: conversaciones multi-turno con historial extenso y adjuntos de imágenes (capturas de pantalla, fotos de productos) sin truncar el contexto.
- Sistemas agénticos con tool calling: orquestación de flujos multi-paso donde el modelo decide qué herramientas invocar y procesa sus resultados, incluyendo salidas visuales.
- RAG multimodal: indexación y consulta sobre bases documentales que mezclan texto e imágenes, con la ventana de 1M tokens permitiendo inyectar muchos fragmentos recuperados a la vez.
- Despliegue en local para investigación: ejecución en Apple Silicon con 32 GB o en una DGX Spark para experimentación con ajuste fino y evaluación sin depender de la nube.
- Extracción de información estructurada a partir de capturas o formularios escaneados, combinando OCR implícito y razonamiento sobre el contenido.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos numéricos de la tabla no se han podido extraer de la información proporcionada (el contenido aparece truncado). No se han publicado resultados de benchmarks verificables en la información disponible.

## Requisitos de hardware

- Checkpoint único de aproximadamente 20 GB en precisión mixta NVFP4/MXFP8.
- VRAM recomendada: 32 GB o más para inferencia del checkpoint nativo.
- Hardware soportado oficialmente: 1x NVIDIA DGX Spark; dispositivos Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio).
- Otras GPU son posibles con 32 GB o más de VRAM (no se detallan modelos concretos como A100, H100 o RTX 4090 en la información disponible).
- Frameworks de despliegue soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp, Llama App, Ollama y Exo Labs en Apple Silicon.
- Ajuste fino posterior: Miles y SkyRL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos | 1M tokens | Apache 2.0 | Sí (imagen + texto) | Pesos abiertos en HF, Tinker |
| Gemma 4 31B | 31B (aprox.) | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (aprox.) | no disponible | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | Sí (VL) | no disponible |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la model card los menciona pero la tabla aparece truncada.

## Limitaciones y advertencias

- El modelo es un ajuste fino SFT de terceros (Nithish2410) sobre el modelo base de Thinking Machines Lab; no es una release oficial y puede presentar degradaciones respecto al original.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento y con contextos muy largos.
- La lista completa de idiomas soportados no está detallada; el rendimiento fuera del inglés puede ser inferior.
- El checkpoint está distribuido en precisiones NVFP4/MXFP8, lo que puede afectar a la fidelidad numérica en comparación con pesos en BF16.
- Aunque la licencia es Apache 2.0, el modelo base está sujeto a la Política de Uso Aceptable de Thinking Machines Lab, que puede imponer restricciones adicionales al uso comercial.
- El repositorio tiene un número muy bajo de descargas (14) y ningún "like", lo que sugiere escasa validación por parte de la comunidad.
- No se especifican sesgos conocidos ni evaluaciones de seguridad específicas para este checkpoint SFT.
- La ventana de 1M tokens puede implicar costes de cómputo y memoria elevados en la práctica, aunque el modelo quepa en 32 GB.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/Nithish2410/INKLING-2-MINI-SFT-CKPT-FROM-SAME-12K-REASON
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
