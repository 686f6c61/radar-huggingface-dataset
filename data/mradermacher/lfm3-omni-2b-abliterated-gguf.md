# mradermacher/LFM3-Omni-2B-abliterated-GGUF

## Resumen

LFM3-Omni-2B-abliterated-GGUF es una coleccion de cuantizaciones GGUF del modelo JonusNattapong/LFM3-Omni-2B-abliterated, publicada por el usuario mradermacher. El modelo subyacente es una variante "abliterated" (con las direcciones de rechazo suprimidas mediante edicion de pesos) del LFM3-Omni de 2B parametros de Liquid AI, un modelo multimodal que combina procesamiento de texto, vision y audio, incluyendo capacidad de speech-to-speech. El repositorio proporciona unicamente los pesos cuantizados en formato GGUF para su uso con llama.cpp y derivados; no incluye el modelo original en safetensors.

La relevancia de esta ficha radica en que permite ejecutar un modelo omni (texto, imagen y audio) de aproximadamente 1.730 millones de parametros en hardware de consumo gracias a las cuantizaciones de 0,9 a 3,6 GB. Al estar "abliterated", el modelo elimina los mecanismos de rechazo del modelo base, lo que lo hace util para investigacion sobre alineamiento y generacion sin restricciones, pero tambien conlleva riesgos evidentes para despliegues en produccion.

La informacion disponible es limitada: la model card del repositorio GGUF es una plantilla generica de cuantizacion de mradermacher y no incluye detalles sobre arquitectura interna, datos de entrenamiento, benchmarks ni procedimiento de abliteration. Todo dato no presente en la informacion proporcionada se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas: liquid, lfm3, lfm3-omni; multimodal texto/vision/audio) |
| Parametros totales | 1.728.801.600 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, th, zh, ja, fr, de, es |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Las etiquetas indican que pertenece a la familia LFM3 (Liquid Foundation Models 3) en su variante Omni, con soporte multimodal de audio, vision y speech-to-speech, y capacidades de razonamiento. El modelo base es JonusNattapong/LFM3-Omni-2B-abliterated, que a su vez deriva del LFM3-Omni de 2B de Liquid AI.

El proceso de "abliteration" consiste en identificar y suprimir las direcciones en el espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder a ciertos prompts. No se especifica en la informacion disponible la tecnica concreta empleada (por ejemplo, edicion de pesos por capa, proyeccion ortogonal de direcciones de rechazo) ni los datos o el procedimiento de evaluacion posterior. Tampoco se detallan los datos de entrenamiento originales, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. Las cuantizaciones son estaticas y no se ofrecen variantes ponderadas/imatrix segun la model card.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno (etiqueta "conversational" y "reasoning").
- Procesamiento multimodal: vision (imagenes) y audio, incluyendo speech-to-speech segun las etiquetas del repositorio.
- Soporte multilingue en ingles, tailandes, chino, japones, frances, aleman y espanol.
- Generacion sin restricciones de rechazo (uncensored/abliterated): el modelo no aplica los filtros de negativa del modelo base.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") y con el ecosistema transformers/llama.cpp.
- Capacidades de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar las respuestas del modelo abliterated frente al modelo base para estudiar como se distribuyen las direcciones de rechazo y que comportamientos emergen al suprimirlas.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M de 1,2 GB, el modelo cabe en GPUs de gama media y en CPU, lo que permite prototipar aplicaciones multimodales sin infraestructura dedicada.
- Procesamiento de audio y voz en local: la variante Omni con speech-to-speech permite construir asistentes de voz o transcripcion en entornos sin conexion, aunque la calidad concreta no esta documentada.
- Analisis de imagenes en flujos de trabajo personales: al ser multimodal y ligero, puede usarse para descripcion de imagenes o extraccion de informacion visual en pipelines de bajo coste.
- Generacion de contenido creativo sin restricciones: el caracter abliterated lo hace adecuado para experimentacion con narrativa o dialogos donde los filtros del modelo base resultan limitantes, siempre con supervision humana.
- Evaluacion de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion, lo que permite medir el impacto de la cuantizacion en tareas multimodales y multilingues sobre un modelo de 2B.
- Prototipado multilingue en espanol: con soporte declarado de espanol, puede emplearse para pruebas de concepto de asistentes conversacionales en castellano antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB.
- El repositorio tiene un tamano total de 15,9 GB porque incluye todas las cuantizaciones; solo es necesario descargar el archivo de la variante elegida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor margen. Para f16 se recomienda al menos 6-8 GB de VRAM.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas con 4 GB o mas; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, koboldcpp); vLLM y TGI no estan confirmados para este formato GGUF multimodal en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-abliterated (este, GGUF) | ~1,73 B | no disponible | texto, vision, audio | lfm1.0 | GGUF |
| LFM3-Omni-2B (base, sin abliterar) | ~1,73 B | no disponible | texto, vision, audio | lfm1.0 | safetensors |
| JonusNattapong/LFM3-Omni-2B-abliterated | ~1,73 B | no disponible | texto, vision, audio | lfm1.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de otras familias, por lo que la comparativa se limita a parametros, modalidad y licencia.

## Limitaciones y advertencias

- Modelo abliterated: se han suprimido los mecanismos de rechazo, por lo que puede generar contenido danino, sesgado o inapropiado sin advertencia. No es apto para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: no hay evaluaciones publicadas; en un modelo de 2B el riesgo de alucinacion es estructuralmente alto, especialmente en tareas de razonamiento complejo.
- La abliteration puede degradar capacidades: no se documenta el impacto sobre el rendimiento en tareas estandar, por lo que la calidad respecto al modelo base es desconocida.
- Limitaciones de contexto e idioma: la longitud de contexto no esta disponible; el soporte de espanol esta declarado pero no se ha verificado su calidad.
- Licencia lfm1.0: es una licencia "other" con posibles restricciones de uso comercial; debe revisarse el texto de la licencia antes de cualquier despliegue comercial, especialmente al tratarse de una modificacion (abliterated) del modelo original.
- El repositorio GGUF no incluye el modelo completo en safetensors ni documentacion tecnica propia; la model card es una plantilla generica de cuantizacion.
- Sin datos de benchmarks, no es posible validar afirmaciones de calidad ni comparar con alternativas de forma objetiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-Omni-2B-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#LFM3-Omni-2B-abliterated-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
