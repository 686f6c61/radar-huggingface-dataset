# nokkela-ai/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a desarrolladores que construyen aplicaciones con agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Su relevancia radica en combinar un tamaño contenido (26,4B parámetros totales, 3,4B activos) con una ventana de contexto de hasta 1M tokens y pesos abiertos.

Arquitectónicamente es un transformer decoder-only con capas de mezcla de expertos (MoE) dispersa y una innovación estructural: las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa a partir de 24 capas de pesos. El modelo es nativamente multimodal, con un vision transformer que proyecta imágenes y texto a un espacio oculto compartido.

Se distribuye como un único checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que permite inferencia en hardware local modesto (un DGX Spark, Apple Silicon con 32 GB o GPUs con 32 GB de VRAM). No obstante, el repositorio de Hugging Face consultado (nokkela-ai/Inkling-2-Mini) no incluye información de idiomas ni métricas de benchmarks en los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y bucle de capas compartidas (looped transformer) |
| Parametros totales | 26,4B |
| Parametros activos | 3,4B base; 5,4B efectivos por token con tres pasadas (cada pasada extra añade ~1,0B) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (precisión mixta); GGUF cuantizado vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general (no se detallan idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint único de ~20 GB en NVFP4/MXFP8); GGUF disponible |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo decoder-only de 24 capas con capas feed-forward de mezcla de expertos dispersa. En cada capa, cada token se enruta a 8 de 128 expertos. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que produce 48 aplicaciones de capa por token a partir de 24 capas de pesos. La atención es híbrida, combinando capas locales y globales. La multimodalidad es nativa: las imágenes se codifican mediante un vision transformer y tanto imagen como texto se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles, datos adquiridos a terceros, generados internamente o sintéticos/aumentados. El proceso de curación comprende limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. No se especifican en la información disponible el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general.
- Comprensión de imágenes y respuesta multimodal (image-text-to-text).
- Soporte de conversación multi-turno e instrucciones.
- Capacidades de código en múltiples lenguajes de programación.
- Uso en sistemas agénticos y de tool-use (según la model card).
- Integración en sistemas RAG.
- Ventana de contexto de hasta 1M tokens para documentos e imágenes extensos.
- Soporte multilingüe general, con foco en inglés.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de desarrollo para generación y revisión de código en varios lenguajes, aprovechando su soporte de tool calling y su contexto largo para analizar repositorios completos.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial extenso gracias a la ventana de 1M tokens, manteniendo coherencia en interacciones prolongadas.
- Sistemas RAG documentales: ingestión de grandes corpus de texto e imágenes en el contexto para responder preguntas con base documental, sin necesidad de fragmentación agresiva.
- Análisis de documentos con imágenes: extracción de información de capturas, diagramas o formularios junto con texto asociado, gracias a su naturaleza nativamente multimodal.
- Agentes autónomos multi-paso: orquestación de tareas con llamadas a herramientas y razonamiento encadenado, apoyado en su capacidad de tool-use.
- Despliegue en el borde: inferencia local en un DGX Spark o en Apple Silicon con 32 GB, útil para prototipos y aplicaciones con requisitos de privacidad que no pueden enviar datos a la nube.
- Fine-tuning específico de dominio: al publicarse con pesos abiertos y soporte en Tinker, Miles y SkyRL, permite ajuste posterior para verticales concretas.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero en la información proporcionada solo aparecen las cabeceras de la tabla, sin los valores numéricos de cada benchmark. No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB para el checkpoint en NVFP4/MXFP8; se recomiendan 32 GB o más de VRAM para otras GPUs y plataformas.
- GPU recomendadas: 1x NVIDIA DGX Spark; otras GPUs con 32 GB o más de VRAM.
- Apple Silicon: dispositivos con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio).
- Cabe en GPU de consumo: sí, en configuraciones con 32 GB o más (por ejemplo, GPUs de gama alta con esa VRAM), y en Apple Silicon de 32 GB.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluye GGUF cuantizado), llama.cpp, Llama App, Ollama y Exo Labs en Apple Silicon.
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en HF |
| Gemma 4 31B | 31B (no confirmado en detalle) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables aparecen citados en la tabla de evaluaciones de la model card, pero no se dispone de sus especificaciones detalladas ni de los resultados numéricos en la información proporcionada.

## Limitaciones y advertencias

- No se detallan sesgos conocidos en la información disponible; como modelo entrenado con datos de internet, es previsible que herede sesgos de esas fuentes.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Idiomas: aunque se declara soporte multilingüe general, el foco es el inglés y no se especifica la cobertura real por idioma.
- La licencia Apache 2.0 permite uso comercial, pero existe una Model Acceptable Use Policy adicional del proveedor que puede imponer restricciones de uso.
- El checkpoint se distribuye en precisiones NVFP4/MXFP8; el comportamiento en otras precisiones o cuantizaciones GGUF puede degradar la calidad.
- La información sobre benchmarks numéricos no está disponible, lo que impide validar el rendimiento relativo frente a los modelos comparables.
- El repositorio consultado (nokkela-ai/Inkling-2-Mini) registra 0 descargas y 0 likes, y no incluye datos de idiomas; conviene verificar la procedencia de los pesos frente al repositorio oficial de Thinking Machines.

## Enlaces

- Hugging Face (repositorio consultado): https://huggingface.co/nokkela-ai/Inkling-2-Mini
- Hugging Face (repositorio oficial citado en la model card): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
