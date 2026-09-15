# marafx2007/Qwen3.5-27B-heretic-v3-i1-GGUF

## Resumen

Qwen3.5-27B-heretic-v3-i1-GGUF es una cuantizacion en formato GGUF del modelo Qwen3.5-27B-uncensored-heretic-v1, desarrollado por llmfan46 a partir del modelo base Qwen3.5-27B de Qwen. El repositorio en HuggingFace esta publicado por marafx2007 y la cuantizacion sigue el proceso estandar de mradermacher, con pesos cuantizados mediante imatrix (importancia por matriz). El modelo pertenece a la familia "heretic", que aplica tecnicas de abliteracion y desensibilizado para eliminar los mecanismos de rechazo y censura del modelo original, manteniendo sus capacidades de generacion.

La arquitectura subyacente es un transformer de aproximadamente 26.9 mil millones de parametros (26.895.998.464). Segun la informacion disponible, se trata de un modelo multimodal con soporte de vision, aunque los ficheros mmproj se alojan en el repositorio estatico de cuantizaciones. La licencia es Apache-2.0 y el idioma principal es el ingles.

Este modelo resulta relevante para el ecosistema local porque ofrece una alternativa sin restricciones de seguridad para casos de uso que requieren generacion de contenido sin filtros, manteniendo el formato GGUF que permite su ejecucion en hardware de consumo mediante llama.cpp, Ollama o LM Studio. La disponibilidad de multiples niveles de cuantizacion, desde IQ1_S (6.3 GB) hasta Q6_K (22.2 GB), facilita su despliegue en funcion de la VRAM disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer |
| Parametros totales | 26.895.998.464 (~26.9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B es un transformer estandar de la familia Qwen3.5. La version "heretic" aplica un proceso de abliteracion, una tecnica que identifica y elimina los vectores de direccion asociados a los comportamientos de rechazo y censura aprendidos durante el alineamiento. Este proceso se complementa con tecnicas de "decensored" y "uncensored" que modifican los pesos para reducir la probabilidad de respuestas de rechazo ante prompts sensibles.

Los datos de entrenamiento especificos y el proceso exacto de abliteracion no se detallan en la informacion disponible. La cuantizacion GGUF se ha realizado con imatrix, lo que significa que los pesos se han cuantizado utilizando una matriz de importancia calculada sobre datos representativos, mejorando la calidad de los cuants de baja precision en comparacion con cuantizaciones estaticas. El modelo es multimodal y soporta vision, aunque los ficheros de proyeccion de vision (mmproj) se encuentran en el repositorio estatico asociado.

## Capacidades

- Generacion de texto sin restricciones de seguridad, gracias al proceso de abliteracion y desensibilizado aplicado sobre el modelo base.
- Soporte de vision: el modelo es capaz de procesar imagenes, aunque los ficheros mmproj se distribuyen por separado en el repositorio estatico.
- Conversacion multi-turno con formato de chat, compatible con la familia Qwen y sus plantillas de prompt.
- Inferencia local mediante GGUF, lo que permite su ejecucion en CPU y GPU con herramientas como llama.cpp, Ollama, LM Studio o text-generation-webui.
- Compatibilidad con cuantizacion de baja precision (hasta IQ1_S con 6.3 GB) para entornos con recursos muy limitados.
- Uso conversacional sin filtros de contenido, orientado a escenarios donde el modelo original rechazaria ciertos prompts.

## Casos de uso

- Roleplay y escritura creativa sin restricciones: el modelo permite generar dialogos, narrativas y personajes sin los rechazos tipicos de los modelos alineados. Su naturaleza abliterada lo hace adecuado para proyectos de ficcion interactiva y juegos de rol basados en texto.
- Investigacion sobre temas sensibles: para analisis de contenido politico, historico o social que requiera respuestas directas sin filtros, el modelo ofrece una alternativa a los modelos censurados. La cuantizacion Q4_K_M (16.6 GB) permite ejecutarlo en una RTX 3090 o 4090 con margen para el contexto.
- Analisis de imagenes en entornos locales: gracias a su soporte de vision, puede utilizarse para descripcion de imagenes, extraccion de informacion visual o reconocimiento de objetos en aplicaciones privadas, siempre que se carguen los ficheros mmproj correspondientes.
- Prototipado de agentes conversacionales: el modelo puede integrarse en pipelines de chatbot mediante llama.cpp o vLLM, aprovechando el formato GGUF para una carga rapida y una inferencia eficiente en servidores locales.
- Generacion de contenido para medios creativos: redaccion de guiones, ideas de marketing, descripciones de producto o contenido editorial sin las limitaciones de tono impuestas por el alineamiento de seguridad.
- Fine-tuning y experimentacion: al estar publicado bajo licencia Apache-2.0, el modelo puede utilizarse como base para experimentos de abliteracion adicionales, estudio de mecanismos de rechazo en LLM o desarrollo de variantes personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otras metricas comparativas. La ausencia de datos de rendimiento impide realizar una comparacion cuantitativa con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 16.6 GB, por lo que se recomienda un minimo de 20 GB de VRAM para ejecutarlo con margen para el contexto. La cuantizacion Q5_K_M (19.5 GB) requiere alrededor de 24 GB de VRAM, y el Q6_K (22.2 GB) necesita aproximadamente 28 GB.
- GPU recomendadas: RTX 3090 (24 GB) o RTX 4090 (24 GB) para cuants Q4 o Q5. Para Q6_K se requiere una A100 (40 GB) o H100 (80 GB). Las GPU de 16 GB, como la RTX 4080, solo admiten cuants por debajo de Q4_K_S (15.7 GB) con contextos cortos.
- Compatibilidad con GPU de consumo: si, las variantes Q4_K_S, Q4_K_M y Q5_K_S caben en GPUs de 24 GB. Las cuantizaciones IQ2 e IQ3 son adecuadas para GPUs de 12 GB o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y vLLM (con soporte GGUF). El modelo es compatible con endpoints mediante la etiqueta "endpoints_compatible".
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de rendimiento en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-27B-heretic-v3-i1-GGUF | 26.9B | no disponible | Apache-2.0 | GGUF | Version abliterada, sin filtros de seguridad |
| Qwen3.5-27B (original) | 26.9B | no disponible | Apache-2.0 | no disponible | Modelo base con alineamiento de seguridad |
| Qwen3.6-27B Uncensored Heretic | 27B | no disponible | no disponible | no disponible | Modelo similar de la misma familia, segun referencias en Reddit |

La comparacion se basa exclusivamente en los datos disponibles. No se dispone de informacion sobre benchmarks, contexto o rendimiento relativo entre estos modelos.

## Limitaciones y advertencias

- El modelo ha sido abliterado y desensibilizado, lo que implica que puede generar contenido explicito, ofensivo o peligroso sin restricciones. No es adecuado para entornos donde se requiera moderacion de contenido.
- La ausencia de datos de entrenamiento detallados impide evaluar la calidad del corpus utilizado. No se conocen los tokens de entrenamiento ni la composicion del dataset.
- El modelo solo soporta ingles como idioma principal. No se han indicado capacidades multilingues.
- No se dispone de informacion sobre la longitud de contexto. Esto limita la planificacion de casos de uso que requieran ventanas de contexto largas.
- La cuantizacion de baja precision (IQ1_S, IQ2_XXS) degrada notablemente la calidad de salida. Se recomienda utilizar cuants Q4_K_M o superiores para uso productivo.
- El repositorio es una cuantizacion comunitaria. No existen garantias de soporte oficial por parte de Qwen ni de llmfan46.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza "uncensored" del modelo puede generar riesgos legales o reputacionales en aplicaciones publicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marafx2007/Qwen3.5-27B-heretic-v3-i1-GGUF
- Modelo base (llmfan46): https://huggingface.co/llmfan46/Qwen3.5-27B-uncensored-heretic-v1
- Repositorio estatico de cuantizaciones: https://huggingface.co/mradermacher/Qwen3.5-27B-heretic-v3-GGUF
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
