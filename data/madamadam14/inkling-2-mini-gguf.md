# madamadam14/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está pensado para aplicaciones de tipo agéntico, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Su arquitectura es un transformer decoder-only de 24 capas con capas de mezcla de expertos (MoE) dispersas, en el que las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token.

El modelo cuenta con 26,2 mil millones de parámetros totales y 3,4 mil millones de parámetros activos, aunque cada pasada adicional por las capas en bucle añade aproximadamente 1,0 mil millones de parámetros activos efectivos, resultando en unos 5,4 mil millones de parámetros activos efectivos por token. La atención combina capas locales y globales, y el modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido que procesa el decodificador.

La ficha que nos ocupa corresponde a una cuantización GGUF publicada por el usuario `madamadam14`, derivada del modelo base `thinkingmachines/Inkling-2-Mini` y generada con el flujo de trabajo de Unsloth (Unsloth Dynamic 3.0). El repositorio ocupa 266,7 GB e incluye múltiples niveles de cuantización, desde IQ1_S hasta Q8_K_XL, lo que permite desplegar el modelo en hardware de consumo con pérdidas de calidad acotadas y documentadas mediante métricas de divergencia KL y coincidencia de token top-1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y bucle de capas (looped transformer), multimodal con vision transformer |
| Parámetros totales | 26,2 mil millones (26.070.390.272 según safetensors) |
| Parámetros activos | 3,4 mil millones; 5,4 mil millones efectivos por token con las tres pasadas |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Unsloth Dynamic 3.0: UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_M, UD-Q4_K_XL, UD-Q8_K_XL; el checkpoint original usa NVFP4 y MXFP8 |
| Idiomas soportados | Inglés y soporte multilingüe general; también múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); el modelo base se distribuye como checkpoint único de unos 20 GB en NVFP4 y MXFP8 |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal de tipo "looped": consta de 24 capas de pesos, de las cuales las 12 centrales se aplican tres veces con pesos compartidos, produciendo 48 aplicaciones de capa por token. Cada capa utiliza capas feed-forward de mezcla de expertos dispersa, donde cada token se enruta a 8 de 128 expertos. La atención es híbrida, combinando capas locales y globales. La multimodalidad es nativa: un vision transformer codifica las imágenes y tanto estas como el texto se proyectan a un espacio oculto compartido que procesa el decodificador de forma conjunta.

El modelo base se distribuye como un checkpoint único de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que refleja un diseño orientado al despliegue eficiente en hardware local. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La cuantización GGUF de este repositorio emplea el esquema Unsloth Dynamic 3.0, que asigna precisiones de forma dinámica por capa y publica métricas de degradación frente a la referencia UD-Q8_K_XL.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes y respuesta en texto (image-text-to-text), con codificación mediante vision transformer.
- Razonamiento y tareas de lenguaje natural diversas, orientado a sistemas agénticos y de uso de herramientas.
- Soporte para asistentes de código y múltiples lenguajes de programación.
- Integración en sistemas de generación aumentada por recuperación (RAG) y chatbots.
- Soporte multilingüe general, con inglés como idioma principal.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Capacidad de ejecución local en hardware de consumo gracias a las cuantizaciones GGUF de bajo bit.

## Casos de uso

- Asistentes de código en local: el modelo puede ejecutarse en un MacBook o Mac mini con 32 GB o más de memoria usando cuantizaciones de 4 bits (UD-Q4_K_M, 16,61 GB), lo que permite integrarlo en editores y flujos de desarrollo sin depender de la nube.
- Atención al cliente automatizada: su naturaleza conversacional y multimodal permite gestionar conversaciones multi-turno que incluyan capturas de pantalla o imágenes enviadas por el usuario, con la ventaja de poder desplegarse on-premise bajo licencia Apache 2.0.
- Sistemas agénticos con uso de herramientas: el modelo está diseñado explícitamente para sistemas de tool-use y agentes, por lo que puede emplearse como motor de decisión en pipelines que requieran llamadas a funciones y razonamiento multi-paso.
- RAG sobre documentación técnica: puede combinarse con un almacén vectorial para responder preguntas sobre manuales, con la posibilidad de adjuntar diagramas e imágenes escaneadas gracias a su entrada multimodal.
- Procesamiento de documentos con imágenes: extracción de información de capturas, diagramas o formularios combinando la entrada visual con instrucciones textuales.
- Prototipado e investigación con fine-tuning: al publicarse con pesos abiertos y licencia Apache 2.0, puede ajustarse finamente para dominios específicos; el acceso vía plataforma Tinker facilita experimentación e inferencia.
- Despliegue en dispositivos Apple Silicon: con 32 GB o más de memoria unificada, las cuantizaciones de 2-4 bits (8,49-17,63 GB) permiten inferencia local en MacBook, Mac mini y Mac Studio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio sí incluye métricas de calidad de cuantización frente a la referencia UD-Q8_K_XL:

| Cuantización | Tamaño (GB) | KLD media vs UD-Q8_K_XL | Mismo token top-1 |
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

- El checkpoint original del modelo base ocupa unos 20 GB en NVFP4 y MXFP8 y puede ejecutarse en 1x NVIDIA DGX Spark, dispositivos Apple Silicon con 32 GB o más de memoria unificada, u otras GPUs con 32 GB o más de VRAM recomendados.
- Para las cuantizaciones GGUF, el tamaño en disco oscila entre 7,76 GB (UD-IQ1_S) y 22,87 GB (UD-Q8_K_XL); la VRAM necesaria será aproximadamente ese tamaño más el espacio para el contexto y el vision transformer.
- Caben en GPUs de consumo: las cuantizaciones de 1-2 bits (7,76-9,14 GB) y de 3 bits (11,66-13,63 GB) son aptas para tarjetas de 12-16 GB como la RTX 4090 o la RTX 4080; las de 4 bits (15,73-17,63 GB) requieren 24 GB de VRAM o memoria unificada de 32 GB en Apple Silicon.
- Opciones de despliegue: llama.cpp (se recomienda usar los GGUFs "mainline" del repositorio oficial de Unsloth para compatibilidad), Unsloth Desktop, y la plataforma Tinker para inferencia vía API. El repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de benchmarks ni de información sobre modelos comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos del modelo.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos; no hay evaluaciones publicadas en la información disponible.
- La longitud de contexto no está documentada en la información proporcionada, lo que dificulta planificar despliegues con ventanas largas.
- El idioma principal es el inglés; el soporte multilingüe se describe como "general" sin garantías específicas por idioma.
- Aunque la licencia es Apache 2.0, el modelo base está sujeto a una Política de Uso Aceptable de Thinking Machines Lab que debe revisarse antes de uso comercial.
- Esta ficha corresponde a una cuantización de terceros (`madamadam14`), no al checkpoint oficial; la calidad puede diferir del modelo original, especialmente en las cuantizaciones de 1-2 bits, donde la coincidencia de token top-1 cae hasta el 89,4%.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de la calidad de esta cuantización concreta.
- El tamaño del repositorio (266,7 GB) incluye todas las cuantizaciones; descargar el conjunto completo requiere espacio de almacenamiento considerable.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/madamadam14/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Guía de ejecución de Inkling-2-Mini (Unsloth): https://unsloth.ai/docs/models/inkling-2-mini
- Benchmarks de cuantización Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- GGUFs mainline de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/tree/main/Mainline_Support
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
