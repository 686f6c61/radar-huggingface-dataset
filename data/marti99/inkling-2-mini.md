# Marti99/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera texto. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y está pensado para desarrolladores que construyen aplicaciones de IA: sistemas agénticos, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Su lanzamiento se produjo el 20 de noviembre de 2026.

La arquitectura es un transformer decodificador de 24 capas con capas de feed-forward de tipo Mixture-of-Experts (MoE) disperso. La innovación principal es el diseño "looped": las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. Cada token se enruta a 8 de 128 expertos por capa. El modelo tiene 26.400 millones de parámetros totales, con 3.400 millones activos por pasada y 5.400 millones efectivos por token al ejecutarse tres pasadas sobre las capas repetidas.

El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido que procesa el decodificador. Soporta una ventana de contexto de hasta 1 millón de tokens y se distribuye en un único checkpoint de unos 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que permite inferencia local en hardware de consumo como un DGX Spark o Apple Silicon con 32 GB o más de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador de 24 capas con MoE disperso y bucle de capas (looped transformer) |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3,4B por pasada; 5,4B efectivos por token (tres pasadas sobre las capas centrales) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint distribuido); GGUF cuantizado disponible via Unsloth y llama.cpp |
| Idiomas soportados | Ingles y soporte multilingue general; multiples lenguajes de programacion |
| Licencia | Apache 2.0 (con Model Acceptable Use Policy adicional) |
| Formato de pesos | Safetensors (checkpoint unico de ~20 GB en NVFP4/MXFP8); GGUF cuantizado |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer decodificador autorregresivo de 24 capas con capas de feed-forward MoE disperso. La peculiaridad estructural es el bucle de capas: las 12 capas centrales se aplican tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa a partir de solo 24 conjuntos de pesos. En cada capa, cada token se enruta a 8 de 128 expertos. La atención es un híbrido de capas locales y globales. El modelo es nativamente multimodal: un vision transformer codifica las imágenes y las proyecta junto con el texto a un espacio oculto compartido que procesa el decodificador de forma conjunta.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles, de terceros, generados internamente y sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO. El modelo se distribuye en precisiones NVFP4 y MXFP8. La model card menciona soporte de post-entrenamiento mediante las plataformas Miles y SkyRL.

## Capacidades

- Generación de texto y conversación multi-turno con instrucciones.
- Razonamiento y tareas de lenguaje natural de propósito general.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo entre 40 y 4096 píxeles por dimensión.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool-use), según la model card.
- Integración en sistemas de generación aumentada por recuperación (RAG).
- Capacidades multilingües generales, con inglés como idioma principal.
- Contexto de hasta 1M tokens para documentos y conversaciones extensas.
- Inferencia local en hardware de consumo y post-entrenamiento mediante plataformas externas.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de desarrollo para autocompletar, revisar y generar código en múltiples lenguajes, aprovechando su contexto de 1M tokens para analizar repositorios completos o archivos extensos.
- Sistemas agénticos con uso de herramientas: su soporte declarado de tool-use y su ventana de contexto permiten construir agentes que encadenan llamadas a funciones externas y razonan en varios pasos sobre el resultado.
- Atención al cliente automatizada: puede gestionar conversaciones multi-turno con contexto largo gracias a la ventana de 1M tokens, manteniendo el hilo de interacciones extensas sin truncar el historial.
- RAG sobre documentación técnica: con 1M tokens de contexto puede ingerir manuales, informes o bases de conocimiento extensas y responder preguntas fundamentadas en ellos, reduciendo la necesidad de fragmentación agresiva.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto de forma conjunta, puede procesar capturas, diagramas o páginas escaneadas junto con texto para extraer y resumir información.
- Despliegue en el borde o local: su checkpoint de ~20 GB en NVFP4/MXFP8 permite ejecutarlo en un DGX Spark o en Apple Silicon con 32 GB o más, útil para prototipos, investigación y aplicaciones con requisitos de privacidad que no pueden enviar datos a la nube.
- Fine-tuning e investigación: al publicarse con pesos abiertos bajo Apache 2.0, sirve como base para ajuste fino en dominios específicos mediante Tinker, Miles o SkyRL.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones con columnas para Inkling 2 Mini, Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero el contenido de las filas de resultados no está disponible en la información proporcionada (solo se incluye la cabecera y la fila "Model Info"). Por tanto:

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Checkpoint único de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8.
- Inferencia soportada en 1x NVIDIA DGX Spark.
- Apple Silicon con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- Otras GPU y plataformas posibles, con recomendación de 32 GB o más de VRAM.
- Frameworks de inferencia soportados: Hugging Face, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp (GGUF), Llama App, Ollama y Exo Labs en Apple Silicon.
- Post-entrenamiento soportado con Miles y SkyRL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La model card compara el modelo con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos de rendimiento de esas comparaciones no están disponibles en la información proporcionada. A continuación se recoge lo que sí se conoce:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face; API via Tinker |
| Gemma 4 31B | 31B (según nombre) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos específicos; al entrenarse con datos de internet, es probable que herede sesgos presentes en esas fuentes.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado tasas de alucinación.
- El idioma principal es el inglés; el soporte multilingüe se describe como "general" sin garantías por idioma.
- Aunque la licencia es Apache 2.0, existe una Model Acceptable Use Policy adicional que puede imponer restricciones de uso; conviene revisarla antes de un despliegue comercial.
- La ventana de 1M tokens es amplia, pero el rendimiento en contextos muy largos no está documentado con benchmarks.
- El checkpoint se distribuye en NVFP4/MXFP8; la fidelidad de estas precisiones frente a un entrenamiento en BF16/FP16 no está cuantificada en la información disponible.
- No se detalla la composición exacta del dataset ni el número de tokens de entrenamiento, lo que limita la reproducibilidad.
- El modelo tiene 0 descargas y 0 likes en el repositorio de Hugging Face en el momento de la consulta, y el ID del autor en Hugging Face (Marti99) difiere del proveedor declarado en la model card (Thinking Machines Lab), lo que conviene verificar antes de confiar en el artefacto.

## Enlaces

- Hugging Face (ID consultado): https://huggingface.co/Marti99/Inkling-2-Mini
- Hugging Face (proveedor declarado en la model card): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Model Acceptable Use Policy: https://thinkingmachines.ai/model-acceptable-use-policy/
