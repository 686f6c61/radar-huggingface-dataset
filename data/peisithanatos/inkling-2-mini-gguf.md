# peisithanatos/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado en noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera salidas de texto, y está orientado a aplicaciones de desarrollo con IA, incluyendo sistemas agénticos con uso de herramientas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). La versión aquí documentada es una cuantización en GGUF del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario `peisithanatos` con el soporte de Unsloth.

Arquitectura y escala: se trata de un transformer decoder-only de 24 capas con capas de feed-forward de tipo Mixture-of-Experts (MoE) disperso. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. Cada token se enruta a 8 de 128 expertos en cada capa. La atención combina capas locales y globales. El modelo tiene 26.200 millones de parámetros totales, con 3.400 millones activos (5.400 millones efectivos por token al considerar las tres pasadas de las capas en bucle). Es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido.

Relevancia: el checkpoint original se distribuye en unos 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que permite ejecutarlo en hardware de consumo y estaciones de trabajo locales (DGX Spark, Apple Silicon con 32 GB o más, GPUs con 32 GB o más de VRAM). Esta publicación GGUF amplía las opciones de despliegue a llama.cpp y a la GUI de Unsloth, con cuantizaciones que van desde 7,76 GB (UD-IQ1_S) hasta 22,87 GB (UD-Q8_K_XL), facilitando la inferencia local en equipos modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso, bucle de capas (looped transformer) y atención híbrida local/global; vision transformer para imágenes |
| Parametros totales | 26.200 millones (26.070.390.272 según safetensors) |
| Parametros activos | 3.400 millones activos; 5.400 millones efectivos por token (3 pasadas en capas en bucle) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic): UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_M, UD-Q4_K_XL, UD-Q8_K_XL; el modelo base en NVFP4 y MXFP8 |
| Idiomas soportados | Inglés y soporte multilingüe general; también múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer autoregresivo multimodal con bucle de capas. Consta de 24 capas de pesos, de las cuales las 12 centrales se reutilizan tres veces, generando 48 aplicaciones de capa por token. Las capas de feed-forward son de tipo Mixture-of-Experts con 128 expertos por capa, de los cuales se activan 8 por token. La atención es híbrida, combinando capas de atención local y global. El modelo es nativamente multimodal: un vision transformer codifica las imágenes y tanto las representaciones visuales como las textuales se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta.

El modelo base se distribuye como un único checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que refleja una optimización explícita para inferencia local en hardware de consumo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal más allá del esquema de bucle de capas y la atención híbrida. El autor de la cuantización GGUF es Unsloth, que aplica su metodología Dynamic 3.1 (imatrix) para preservar la calidad en cuantizaciones agresivas.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes (image-text-to-text): el modelo acepta entradas visuales y textuales conjuntas.
- Razonamiento y tareas de lenguaje natural en inglés y soporte multilingüe general.
- Generación de código en múltiples lenguajes de programación.
- Uso de herramientas (tool calling / function calling) y sistemas agénticos multi-paso, según la model card del modelo base.
- Integración en asistentes de código, chatbots y sistemas RAG.
- Ajuste fino disponible a través de la plataforma Tinker y de Unsloth.
- Ejecución local en llama.cpp y en la GUI de Unsloth (hasta 1,9x más rápido según el autor de la cuantización).

## Casos de uso

- Asistentes de código en local: el modelo puede generar y completar código en múltiples lenguajes y ejecutarse en una estación de trabajo con 32 GB de VRAM usando cuantizaciones UD-Q4_K_M (16,61 GB) o UD-IQ4_XS (15,73 GB), integrándose en flujos de desarrollo sin depender de la nube.
- Sistemas agénticos con uso de herramientas: al soportar tool calling y razonamiento multi-paso, puede orquestar llamadas a APIs y funciones en pipelines automatizados, con la ventaja de que el checkpoint completo cabe en hardware de consumo.
- Chatbots multimodales: la capacidad image-text-to-text permite construir asistentes que responden a consultas con capturas de pantalla, diagramas o fotografías, procesando imagen y texto en un espacio compartido.
- RAG sobre documentación técnica: el modelo puede integrarse en sistemas de generación aumentada por recuperación para responder preguntas sobre bases de conocimiento, combinando contexto textual recuperado con posibles figuras o esquemas.
- Inferencia en Apple Silicon: con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio), se pueden ejecutar cuantizaciones de 4 bits (16-18 GB) mediante llama.cpp, habilitando prototipado y despliegue en portátiles.
- Ajuste fino específico de dominio: a través de Tinker o Unsloth, los desarrolladores pueden adaptar el modelo a tareas concretas (soporte técnico, análisis de documentos) partiendo de los pesos abiertos Apache 2.0.
- Despliegue en DGX Spark: el checkpoint original en NVFP4/MXFP8 está soportado oficialmente en una NVIDIA DGX Spark, lo que facilita entornos de desarrollo en el borde con aceleración dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card de la cuantización incluye únicamente métricas de calidad de cuantización (KLD y coincidencia del token top-1) frente a la referencia UD-Q8_K_XL:

| Cuantizacion | Tamano (GB) | KLD medio vs UD-Q8_K_XL | Mismo token top-1 |
|---|---|---|---|
| UD-IQ1_S | 7,76 | 0,0911 | 89,4% |
| UD-IQ1_M | 8,02 | 0,0867 | 90,2% |
| UD-IQ2_XXS | 8,49 | 0,0726 | 90,6% |
| UD-Q2_K_XL | 9,14 | 0,0595 | 91,6% |
| UD-IQ3_XXS | 11,66 | 0,0269 | 94,7% |
| UD-Q3_K_XL | 13,63 | 0,0174 | 96,3% |
| UD-IQ4_XS | 15,73 | 0,0109 | 97,7% |
| UD-Q4_K_M | 16,61 | 0,0108 | 97,9% |
| UD-Q4_K_XL | 17,63 | 0,0107 | 98,0% |
| UD-Q8_K_XL | 22,87 | referencia | — |

## Requisitos de hardware

- VRAM estimada para inferencia: desde 8 GB (UD-IQ1_S, 7,76 GB) hasta 23 GB (UD-Q8_K_XL, 22,87 GB), según la cuantización elegida.
- El modelo base recomienda GPUs con 32 GB o más de VRAM para el checkpoint original en NVFP4/MXFP8.
- Hardware oficialmente soportado por el modelo base: 1x NVIDIA DGX Spark y dispositivos Apple Silicon con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- Cabe en GPUs de consumo: las cuantizaciones de 4 bits (UD-Q4_K_M, 16,61 GB; UD-Q4_K_XL, 17,63 GB) caben en tarjetas con 24 GB de VRAM como la RTX 4090; las de 1-2 bits caben en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, GUI de Unsloth (hasta 1,9x más rápido según el autor), plataforma Tinker (API y playground) para el modelo base. No se menciona soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia de categoría, el modelo se sitúa en el segmento de modelos multimodales abiertos con MoE de aproximadamente 26B parámetros totales y 3,4B activos, con licencia Apache 2.0, lo que lo hace comparable en disponibilidad a otros modelos abiertos de ese rango, pero no se aportan cifras de rendimiento para contrastar.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos del modelo en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- La longitud de contexto no está especificada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- El soporte de idiomas se describe de forma genérica («inglés y soporte multilingüe general»), sin lista concreta de idiomas ni evaluación por idioma.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base está sujeto a la Model Acceptable Use Policy de Thinking Machines Lab, que debe consultarse antes de desplegarlo en producción.
- La cuantización GGUF es una publicación de terceros (peisithanatos, con metodología Unsloth); la calidad en cuantizaciones de 1-2 bits se degrada de forma notable (KLD de 0,09 y ~89% de coincidencia top-1 en UD-IQ1_S), por lo que no se recomienda para tareas sensibles a la precisión.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.
- No se documentan limitaciones específicas sobre entradas de imagen (resolución, formatos) más allá de «cualquier imagen basada en píxeles».

## Enlaces

- Repositorio GGUF: https://huggingface.co/peisithanatos/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Guía de ejecución de Unsloth: https://unsloth.ai/docs/models/inkling-2-mini
- Benchmarks de cuantización Unsloth Dynamic 3.1: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Discord de Unsloth: https://discord.gg/unsloth
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
