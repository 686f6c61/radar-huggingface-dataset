# mradermacher/Latxa-3-122B-A10B-i1-GGUF

## Resumen

Latxa-3-122B-A10B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Latxa-3-122B-A10B, desarrollado originalmente por el grupo HiTZ (Universidad del País Vasco) y cuantizado por mradermacher. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 122.111.526.912 parámetros totales, especializado en euskera (eu) e inglés (en), y entrenado sobre el corpus HiTZ/latxa-corpus-v2. La cuantización permite ejecutar un modelo de esta magnitud en hardware más modesto mediante llama.cpp y herramientas compatibles.

El modelo base Latxa-3 forma parte de la familia Latxa, orientada a mejorar el rendimiento en euskera de modelos abiertos de gran escala. Al ser una arquitectura MoE, activa solo una fracción de sus parámetros por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. Esta versión i1-GGUF emplea cuantizaciones con importancia matricial (imatrix) para preservar mejor la calidad en cada nivel de compresión, desde IQ1_S hasta Q6_K.

La relevancia de esta ficha radica en que ofrece un punto de entrada práctico para desplegar un modelo de 122B en euskera e inglés sobre infraestructura local o en la nube con GPUs de consumo agregadas, algo inviable con los pesos originales en safetensors. No obstante, la información pública disponible sobre arquitectura detallada, contexto y benchmarks es limitada, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (según tags del modelo base) |
| Parametros totales | 122.111.526.912 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | euskera (eu), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multi-parte en Q6_K: part1of3, part2of3, part3of3) |

## Arquitectura y entrenamiento

El modelo base Latxa-3-122B-A10B emplea una arquitectura Mixture of Experts, tal como indican los tags del repositorio (`moe`). La nomenclatura "A10B" sugiere aproximadamente 10 mil millones de parámetros activos por token, aunque este dato no se confirma de forma explícita en la información disponible. El entrenamiento se realizó sobre el corpus HiTZ/latxa-corpus-v2, un conjunto de datos orientado al euskera, complementado presumiblemente con datos en inglés. No se dispone de detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

La versión aquí descrita es una cuantización i1 (importancia matricial) realizada por mradermacher sobre los pesos originales en safetensors del modelo base. Las cuantizaciones i1 emplean una matriz de importancia calculada a partir de datos de calibración para minimizar la pérdida de calidad en cada nivel de bits. El repositorio incluye además un fichero imatrix (0,8 GB) que permite generar cuantizaciones propias. No se han documentado innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de texto conversacional en euskera e inglés, según los tags `conversational` y los idiomas declarados.
- Razonamiento y respuesta a instrucciones propias de un modelo de gran escala, si bien no se detallan capacidades específicas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a euskera e inglés según la model card.
- Capacidad de visión: la model card menciona que se trata de un "vision model" y que los ficheros mmproj, si existen, estarían en el repositorio estático; no se confirma la disponibilidad efectiva de capacidades multimodales.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en euskera: el modelo puede gestionar conversaciones multi-turno en euskera, un idioma con escasa cobertura en modelos abiertos de gran escala, lo que lo hace adecuado para administraciones públicas y empresas del País Vasco.
- Generación de contenido editorial en euskera: redacción y revisión de textos en euskera con un modelo de 122B parámetros totales, aprovechando la arquitectura MoE para mantener un coste de inferencia contenido.
- Traducción euskera-inglés: uso del modelo para tareas de traducción y adaptación cultural entre ambos idiomas, apoyándose en el corpus Latxa v2.
- Asistentes conversacionales bilingües: despliegue de chatbots que alternen euskera e inglés en un mismo hilo, útil en entornos educativos y turísticos.
- Investigación en PLN para lenguas de bajos recursos: el modelo sirve como base para experimentos académicos sobre rendimiento en euskera y comparación con modelos multilingües genéricos.
- Despliegue en infraestructura local con llama.cpp: gracias a las cuantizaciones IQ2/IQ3 (32-54 GB), es posible ejecutar el modelo en servidores con varias GPUs de consumo o en estaciones de trabajo con 48-64 GB de VRAM agregada, sin depender de APIs externas.
- Prototipado de pipelines de generación aumentada por recuperación (RAG): integración del modelo en sistemas RAG para dominios jurídicos o administrativos en euskera, donde la terminología específica requiere un modelo entrenado en el idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: IQ1_S ~25,4 GB; IQ2_M ~40,4 GB; IQ3_M ~53,9 GB; Q4_K_M ~74,3 GB; Q5_K_M ~87,0 GB; Q6_K ~100,4 GB (en tres partes).
- Para cuantizaciones de 4 bits (Q4_K_M, 74,3 GB) se recomienda al menos 80 GB de VRAM agregada, por ejemplo 2× A100 40 GB, 1× H100 80 GB o 2× RTX 4090 24 GB con offloading parcial.
- Para cuantizaciones IQ2/IQ3 (32-54 GB) es viable en configuraciones de 2× RTX 4090 (48 GB) o 1× A6000 48 GB, con posible offloading a RAM del sistema.
- Las cuantizaciones IQ1 (25-28 GB) caben en una única GPU de 32 GB o en 2× RTX 4090 con margen, aunque con pérdida notable de calidad.
- No cabe en una única GPU de consumo de 24 GB (RTX 4090, RTX 3090) en ninguno de los formatos disponibles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Latxa-3-122B-A10B-i1-GGUF (este) | 122,1 B (MoE) | no disponible | eu, en | Apache 2.0 | GGUF |
| Latxa-3-122B-A10B (base) | 122,1 B (MoE) | no disponible | eu, en | Apache 2.0 | safetensors |
| Latxa-3-122B-A10B-GGUF (static) | 122,1 B (MoE) | no disponible | eu, en | Apache 2.0 | GGUF (quants estáticos) |
| Modelos MoE abiertos comparables de ~100B+ | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada. Las alternativas más directas son el modelo base sin cuantizar y la variante de cuantizaciones estáticas del mismo autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un corpus específico de euskera e inglés, puede reflejar sesgos de dichas fuentes.
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones específicas de fidelidad para este modelo.
- Limitaciones de idioma: cobertura declarada únicamente de euskera e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible, lo que dificulta planificar despliegues con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base HiTZ/Latxa-3-122B-A10B y de los datos de entrenamiento (latxa-corpus-v2) antes de un despliegue en producción.
- Las cuantizaciones IQ1 e IQ2 conllevan degradación de calidad significativa; el propio autor las etiqueta como "for the desperate" o "mostly desperate".
- El tamaño del repositorio (1293 GB) implica descargas muy pesadas; el fichero Q6_K está dividido en tres partes que deben concatenarse correctamente.
- La mención a capacidades de visión en la model card no se confirma con ficheros mmproj en este repositorio; verificar en el repositorio estático antes de asumir multimodalidad.
- No se dispone de información sobre parámetros activos ni sobre el número de expertos, lo que limita la estimación precisa de throughput.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Latxa-3-122B-A10B-i1-GGUF
- Modelo base: https://huggingface.co/HiTZ/Latxa-3-122B-A10B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Latxa-3-122B-A10B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Latxa-3-122B-A10B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Latxa-3-122B-A10B-i1-GGUF/resolve/main/Latxa-3-122B-A10B.imatrix.gguf
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
