# omegabaer/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de tipo agéntico, asistentes de código, chatbots y sistemas RAG. La ficha que nos ocupa, `omegabaer/Inkling-2-Mini-GGUF`, es una conversión a formato GGUF del modelo base `thinkingmachines/Inkling-2-Mini`, realizada por el usuario omegabaer con la herramienta Unsloth (cuantizaciones dinámicas UD 3.0).

Arquitectónicamente es un transformer decoder-only de 24 capas con capas de alimentación directa de tipo Mixture-of-Experts (MoE) disperso: cada token se enruta a 8 de 128 expertos por capa. Las 12 capas centrales se ejecutan tres veces con pesos compartidos (looped transformer), de modo que cada token atraviesa 48 aplicaciones de capa a partir de 24 capas de pesos. Dispone de atención híbrida local/global y es nativamente multimodal, con un vision transformer que proyecta las imágenes al mismo espacio oculto que el texto.

El modelo declara 26,2 mil millones de parámetros totales (26.070.390.272 según los safetensors) y 3,4 mil millones de parámetros activos, que ascienden a unos 5,4 mil millones efectivos por token debido a las tres pasadas por las capas looped. Su ventana de contexto alcanza 1 millón de tokens, lo que lo sitúa en la categoría de contexto largo. El checkpoint original se distribuye en unos 20 GB en precisiones mixtas NVFP4 y MXFP8, y esta conversión GGUF ofrece variantes desde 7,76 GB (UD-IQ1_S) hasta 22,87 GB (UD-Q8_K_XL).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso, looped transformer (12 capas centrales ejecutadas 3 veces), atención híbrida local/global, vision transformer para imagen |
| Parametros totales | 26.070.390.272 (26,2B) |
| Parametros activos | 3,4B declarados; ~5,4B efectivos por token por las tres pasadas de las capas looped |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | GGUF Unsloth Dynamic 3.0: UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_M, UD-Q4_K_XL, UD-Q8_K_XL; el checkpoint original usa NVFP4 y MXFP8 |
| Idiomas soportados | Inglés y soporte multilingüe general (no se detalla lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta conversión); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con arquitectura looped: 24 capas de pesos, de las cuales las 12 centrales se aplican tres veces, resultando en 48 aplicaciones de capa por token. Las capas de feed-forward son MoE disperso con 128 expertos y enrutamiento de 8 expertos por token y capa. La atención combina capas locales y globales, lo que permite manejar contextos de hasta 1 millón de tokens con un coste computacional controlado. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta junto con el texto a un espacio oculto compartido que procesa el decoder de forma conjunta.

El modelo se distribuye en precisiones NVFP4 y MXFP8 en un único checkpoint de unos 20 GB. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones adicionales como decodificación especulativa. La conversión GGUF de omegabaer emplea las cuantizaciones dinámicas de Unsloth (UD 3.0) con matriz de importancia (imatrix), y el autor publica métricas de divergencia KL frente a la cuantización de referencia UD-Q8_K_XL.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de instrucciones y conversación multi-turno.
- Comprensión de imágenes: acepta entradas visuales de cualquier tipo basado en píxeles, con rendimiento óptimo entre 40 y 4096 píxeles por dimensión.
- Generación de código en múltiples lenguajes de programación, orientada a asistentes de desarrollo.
- Soporte declarado para sistemas agénticos y de uso de herramientas (tool-use), según la model card del modelo base.
- Capacidades multilingües generales, con inglés como idioma principal.
- Ventana de contexto de hasta 1 millón de tokens, adecuada para documentos largos y conversaciones extensas.
- Integración con el ecosistema Unsloth (Unsloth Desktop) y con endpoints compatibles, según las etiquetas del repositorio.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de revisión y generación de código en múltiples lenguajes, aprovechando su soporte declarado de tool-use para consultar repositorios, ejecutar tests o invocar APIs dentro de flujos de CI/CD.
- Análisis de documentos largos con imágenes: gracias a su contexto de 1 millón de tokens y a la entrada multimodal, puede procesar informes extensos con gráficos, tablas escaneadas o capturas y responder preguntas sobre ellos en una sola pasada.
- Atención al cliente automatizada: conversaciones multi-turno con historial largo y adjuntos de imagen (capturas de error, recibos, productos) sin truncar el contexto.
- Sistemas RAG multimodales: indexación y consulta sobre bases documentales que mezclan texto e imágenes, usando el modelo como generador final que razona sobre los fragmentos recuperados y las figuras asociadas.
- Automatización de tareas de escritorio y agentes con MCP: la model card muestra un ejemplo de ejecución en 4 bits dentro de Blender con MCP, lo que ilustra su uso como cerebro de agentes que controlan aplicaciones locales.
- Despliegue en hardware de consumo o estaciones pequeñas: con cuantizaciones de 7,76 a 17,63 GB puede ejecutarse en Apple Silicon con 32 GB o más y en GPUs con 32 GB de VRAM, habilitando prototipado local sin infraestructura cloud.
- Fine-tuning e investigación: al publicarse con pesos abiertos y licencia Apache 2.0, sirve como base para ajuste fino en dominios específicos mediante la plataforma Tinker o herramientas como Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card de esta conversión GGUF únicamente incluye métricas de calidad de cuantización frente a la referencia UD-Q8_K_XL:

| Cuantización | Tamano (GB) | KLD medio vs UD-Q8_K_XL | Mismo token top-1 |
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

- El checkpoint original (NVFP4/MXFP8) ocupa unos 20 GB y el fabricante recomienda 32 GB o más de VRAM.
- Hardware oficialmente soportado por el modelo base: 1x NVIDIA DGX Spark y dispositivos Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio).
- En formato GGUF, las cuantizaciones van de 7,76 GB (UD-IQ1_S) a 22,87 GB (UD-Q8_K_XL); las variantes Q4 (16,61-17,63 GB) caben en GPUs de 24 GB como la RTX 4090, y las variantes IQ1/IQ2 (7,76-9,14 GB) pueden ejecutarse en GPUs de 12-16 GB con holgura limitada para el contexto.
- Despliegue mediante llama.cpp y derivados (Ollama, LM Studio, Unsloth Desktop); el repositorio incluye la etiqueta `endpoints_compatible`. El modelo base también es accesible vía API en la plataforma Tinker.
- No se han publicado datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría (modelos multimodales MoE de ~26B con contexto largo). Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible; se recomienda auditoría propia antes de uso en producción.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos publicados sobre tasas de factualidad.
- El idioma principal es el inglés; el soporte multilingüe se declara de forma genérica sin lista de idiomas ni evaluación por idioma.
- Aunque el contexto nominal es de 1 millón de tokens, no se han publicado evaluaciones de rendimiento en contextos largos (por ejemplo, needle-in-a-haystack), por lo que la calidad efectiva en ventanas muy extensas no está verificada.
- Las cuantizaciones agresivas (IQ1, IQ2) degradan la fidelidad: la UD-IQ1_S solo coincide en el token top-1 con la referencia en el 89,4% de los casos, lo que puede afectar a tareas sensibles a la precisión.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base está sujeto además a la Model Acceptable Use Policy de Thinking Machines, que conviene revisar.
- Esta conversión GGUF concreta tiene 0 descargas y 0 likes en el momento de la consulta y fue creada y actualizada el mismo día; no cuenta con validación comunitaria.
- El repositorio ocupa 266,7 GB, ya que incluye todas las variantes de cuantización; la descarga debe seleccionarse por fichero.

## Enlaces

- Repositorio GGUF: https://huggingface.co/omegabaer/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Guía de ejecución de Unsloth: https://unsloth.ai/docs/models/inkling-2-mini
- Benchmarks de cuantización Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Unsloth Desktop: https://github.com/unslothai/unsloth
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
